# Fare quote polish: design spec

Date: 2026-11-13
Status: draft, awaiting Kemar's approval
Repo: `access-barbados` (site only). Branch: `feat/fare-quote-polish`.
Adds to: `2026-11-13-hero-map-and-per-mile-design.md`. Anything not named here stays as that spec says.

Seven small fixes to the hero quote card, from the design re-check, and one change to the page order. No new feature.

What stays: customers see the fare only (no distance, no rate). One `aria-live` region. No new dependencies. No new components or helper files.

Measurements below were taken on the live site (accessbim.com) on 2026-11-13, light theme, at 1536×864, 375×812 and 320×640.

## 1. The hint above the map changes height

**Now.** The hint's line count changes from state to state, so everything under it moves. Measured at 375px: the opening hint is two lines (51px); "Now tap your drop-off.", "Now tap your pickup." and "Drag a pin to change it." are one line (26px); the two error hints (no place found, same place twice) are two lines again. The map, the fare box and the button jump about 25px each time. The same jump happens on a small laptop (1024 to 1295px wide), where the card is narrow enough to wrap the opening hint. At 1536px the opening hint fits one line with 2px to spare, and the two error hints still wrap.

**Change.** `components/FareQuote.tsx`, the `#quote-map-hint` paragraph above the map: add `min-h-[3em]`. The hint's line height is 1.5, so this holds two lines at every width. Do not add it to the "map didn't load" message inside the map box.

The brief said phones only. It is set at every width because the jump was measured on laptops too, and one class with no breakpoint covers both. The cost is one blank line (27px) under a one-line hint on a wide screen.

**Known limit.** At 320px the opening hint and the two error hints take three lines. A one-line jump remains there. Not fixed: it would need new hint wording.

**Test (screen check "hint height").** 375×812, light. Open the map. Note the top of "Book a ride". Tap a pickup, then a drop-off. The button's top does not change between the opening hint, "Now tap your drop-off." and "Drag a pin to change it.". Repeat at 1280×800.

## 2. The map shows no keyboard focus ring

**Now.** With keyboard focus on the map there is no ring. The ring exists (3px, drawn 5px inside the map edge) but the map tiles paint over it: Leaflet's map pane has `z-index: 400` and the ring is drawn beneath it. Confirmed on the live site: the map had focus and `:focus-visible` matched, and nothing showed.

**Change.** `app/globals.css`, fare map block. The frame around the map carries the ring instead. Replace the rule

```css
.fare-map.leaflet-container:focus-visible { outline-offset: -5px; }
```

with

```css
/* Tiles paint over a ring on the map itself, so the frame carries it. */
.fare-map.leaflet-container:focus-visible {
  outline: none;
}
:has(> .fare-map.leaflet-container:focus-visible) {
  outline: 3px solid #1166cc;
  outline-offset: 3px;
}
```

and add to the existing dark block at the end of the file:

```css
:has(> .fare-map.leaflet-container:focus-visible) {
  outline-color: #ffc20e;
}
```

These are the site's own ring values (blue in light, gold in dark). The zoom buttons and the pins keep their rings as they are. No change to `FareQuote.tsx` or `FareMap.tsx`.

**Test (screen check "map focus ring").** 1536×864 and 375×812, light and dark. Tab to "Pick places on the map", press Enter. When the map appears, a 3px ring surrounds the whole map frame: blue in light, gold in dark. A mouse click on the map shows no ring. Tab again: the ring moves to the zoom-in button.

## 3. Address suggestions are too small

**Now.** In the suggestion list the place name is `text-sm` (14.9px on a phone) and the address line under it is `text-xs` (12.75px). Everything else on the card is at least the base size (17px).

**Change.** `components/LocationAutocomplete.tsx`:

- Each option (`<li role="option">`): `px-3 py-2 … text-sm` becomes `px-4 py-3 … text-base`. The name is now 17px (18px on desktop), a one-line option is at least 48px high, and the text lines up with the text in the field above.
- The address line: `text-xs text-navy-700 dark:text-mist-100/70` becomes `text-sm text-navy-700 dark:text-mist-100/85`. That is 14.9px (15.75px on desktop), with the same dark-mode strength as the card's other secondary text.

The list keeps `max-h-72` and scrolls. This component also serves the booking form's two fields, so they get the same fix.

**Test (screen check "suggestions").** 375×812 and 1536×864, light and dark. Type "queen" in the hero Pickup. The names read at the same size as the text typed in the field. No option is under 48px high. Arrow down through the list: the highlighted option stays in view. Repeat once in the booking form's Pickup field.

## 4. A failed route lookup leaves a pin out of view

**Now.** The map only moves to fit a route. If `routeBetween` returns null after its one retry, the map stays where it was. A pin set by a typed address can be off screen, with nothing to show where it went.

**Change.**

`lib/fare.ts`, one pure function, next to `inBarbados`:

```ts
/** What the map should fit: the route when there is one, both pins when the
 *  route lookup failed, otherwise null (leave the view alone). */
export function fitPoints(
  route: [number, number][] | null,
  failed: boolean,
  pickup: { lat: number | null; lng: number | null },
  dropoff: { lat: number | null; lng: number | null },
): [number, number][] | null
```

- A route with at least one point: return the route.
- No route, `failed` true and both pins have a `lat` and a `lng`: return `[[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]`.
- Anything else: null.

`components/FareMap.tsx`:

- `FareMapProps` gains `failed: boolean` ("the route lookup failed").
- The route effect draws the line when there is a route, as now. It then calls `fitPoints(route, failed, pickup, dropoff)`, reading the pins from `latest.current`. If the result is not null: `m.fitBounds(L.latLngBounds(pts), { ...ROUTE_PAD, animate: !reducedMotion() })`. This one call replaces today's `fitBounds(line.current.getBounds(), …)`.
- The effect's dependencies become `[route, failed]`. It must not re-run on a pin change alone.

`components/FareQuote.tsx`: pass `failed={quote?.state === "failed"}`.

No line is drawn between the pins on a failure. The fare box and the announcement keep today's wording. While the fare is being worked out the map does not move; it moves once, to the route or to the two pins.

**Test (unit, `lib/fare.test.ts`, `node --test`).** One test, "fitPoints":

- a route and `failed` false returns the route unchanged;
- no route, `failed` true, both pins set returns the two pin points, pickup first;
- no route, `failed` false, both pins set returns null (still working: do not move);
- no route, `failed` true, drop-off `lat` null returns null;
- an empty route array with `failed` true and both pins returns the two pin points.

**Test (screen check "failed route").** 375×812, light. In DevTools, block request URLs containing `/directions/`. Type and choose "Speightstown" as pickup. Zoom the map into the south coast so pin A is off screen. Type and choose "Oistins" as drop-off. The fare box shows the "couldn't work out a fare" message, and the map moves so both A and B are fully visible, clear of the zoom buttons and the attribution. No line is drawn.

## 5. The call line and "Clear map pins" wrap

**Now.** At 1536px the row under the button is 511px wide. The call line needs 324px and the button 197px, plus the gap: 23px too many. So the phone number breaks after "241-" and the button label wraps to two lines. The two only fit side by side between about 660px and 1023px. On a phone they are already stacked, but the number still breaks after "241-" (measured at 375px and 320px).

**Change.** `components/FareQuote.tsx`, the last block of the card:

- The wrapper: `mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between` becomes `mt-4 flex flex-col-reverse gap-3`. The button sits above the call line at every width, as it does on a phone today.
- The button: `btn-secondary w-full sm:w-auto` becomes `btn-secondary w-full`. Same width as "Book a ride" above it.
- The phone link: add `whitespace-nowrap`, so the number is never split.

On a narrow phone the sentence may still break once, between "Call" and the number. That is the intended break.

**Test (screen check "card footer").** 1536×864, 1280×800, 768×1024, 375×812 and 320×640, light. Place one pin. "Clear map pins" is one line, full width, 48px high or more. The phone number is on one line at every width. At 768px and up the whole call sentence is on one line.

## 6. At 320px the card heading slips under the header

**Now.** Reported in the re-check. **Not reproduced** on the live site at 320×640, light: after "Change these on the map" in the form, and after a jump to `#quote`, the card's top edge lands 17px below the sticky header (header bottom 120px, card top 137px) and the heading is fully visible. `--header-h` read 120px, which matches the header.

**Change.** Reproduce first; do not add a fix for a fault nobody can show.

1. On a production build of this branch, at 320×640 and 320×568, light and dark, try each of: the form's "Change these on the map" link; a fresh load of `/#quote`; the same two with the menu drawer opened and closed first; the same at 200% browser zoom.
2. If the heading "See your fare before you book" is hidden or cut by the header in any of them, record which. The fix goes in the one place every jump relies on: the `--header-h` measurement in `components/Header.tsx`, or its `8rem` fallback in `app/globals.css`. Do not add a `scroll-mt-*` class to the card: it would stack on the page's `scroll-padding-top` and push the card too low at every other width.
3. If none of them shows it, change no code and say so in the report to Kemar.

**Test (screen check "320 anchor").** For each path in step 1: the card's top edge is at least 8px below the header's bottom edge, and the whole heading is visible.

## 7. A sliver of the skip link shows at the top (light mode)

**Now.** The hidden "Skip to main content" link is parked 3rem above the page (51px on a phone, 54px on desktop) but is 53.5px and 56.7px tall. Its bottom 2.5px shows as a dark blue bar at the top left, over the gold "Coming soon" bar. In dark mode the link is gold on gold, so it does not show, but it is there.

**Change.** `app/globals.css`, `.skip-link`. Park it by its own height, so text size and wrapping never matter:

- `top: -3rem;` becomes `top: 0.5rem;` and add `transform: translateY(calc(-100% - 1rem));`
- `transition: top 0.15s ease-in-out;` becomes `transition: transform 0.15s ease-in-out;`
- `.skip-link:focus { top: 0.5rem; }` becomes `.skip-link:focus { transform: none; }`

**Test (screen check "skip link").** 375×812 and 1536×864, light and dark. On arrival, no part of the link shows at the top. Press Tab once: the whole link shows at the top left, over the gold bar. Press Enter: focus moves to the main content.

## 8. Where "Schedule a ride" sits

### Audit

Measured on the live site, from the top of the page to the booking section:

| Order | Phone 375×812 | Desktop 1536×864 |
|---|---|---|
| Now: Hero, Services, About, **Book**, Contact | 5546px, about 6.8 screens | 3432px, about 4 screens |
| A (Kemar's): Hero, **Book**, Services, About, Contact | 1705px, about 2.1 screens | 1101px, about 1.3 screens |
| B: Hero, Services, **Book**, About, Contact | 4415px, about 5.4 screens | 2698px, about 3.1 screens |

Points weighed:

- **Repeat of Pickup and Drop-off.** With order A the card's fields and the form's fields are about 1500px apart on a phone and 1250px apart on desktop. They are never on screen together. Once the card is used, the form's two fields arrive already filled, so the form reads as the next step, not a second ask.
- **Crammed.** The form section keeps its own heading ("Tell us where you need to go.") and its full top and bottom padding. On a phone the six trust ticks sit between the card and that heading. Tried on the live page: the section starts cleanly, with a visible change of ground.
- **Trust before the form.** Services and About move below the form. The form is tall on a phone (the section is 2217px), so Services then starts about 3920px down instead of 1705px. That is the real cost of A. The header menu still reaches Services and About in one tap, and the trust ticks stay above the form.
- **The hop from the card.** "Book this ride" now travels about 4500px on a phone. With A it travels about 740px.
- **Order B** saves only the About section's height (1131px on a phone). Booking stays more than five screens down, so it does not meet the goal.

### Recommendation: order A, as Kemar suggested

The hero card already starts the booking: it takes the two places and gives the fare. The form is the second half of the same job, and taking bookings is what this page is for, so the two belong together. The measurements settle the two worries. The repeated fields are never on screen together and arrive pre-filled, and the form keeps its own heading and spacing, so it does not crowd the hero. Order B was the alternative and it barely shortens the scroll. The one cost of A is that Services and About sit lower; the menu and the trust ticks cover that.

### Change

- `app/page.tsx`: render `Hero`, `BookingForm`, `Services`, `About`, `Contact`, in that order. No other change to the file.
- `components/Header.tsx`, `navLinks`: reorder to Book a Ride, Services, About, Contact. One array serves the desktop menu and the phone drawer. A menu that reads left to right should match the page top to bottom.
- `components/Footer.tsx`: the same order in the footer list.
- `components/MobileActionBar.tsx`: no change. Call, WhatsApp, Book are actions in order of importance, not page sections. "Book" still goes to `#book`.
- **Scroll targets: no change.** "Book a ride" and "Book this ride" still bring the form card to the top and focus "Full name". "Change these on the map" still goes to `#quote`, now a short hop up. The "Schedule a Ride" button at the end of Services still goes to `#book`, now upward. Keep it.
- **Section grounds: no change.** The hero's blue tint meets the form's lighter tint with a visible edge. The form's tint fades to the page colour at its foot, so it runs into Services with no seam. Services, About and Contact are then three sections on the same ground; Services and About already were, and each opens with its own eyebrow and heading.
- **Spacing and copy: no change.**
- **Loading: no change.** Turnstile already loads when the page loads, wherever the form sits. The map still loads only when asked for.

### Test (screen check "page order")

375×812 and 1536×864, light and dark, on a production build.

1. Scroll from the top: Hero, "Tell us where you need to go.", "Wherever you need to be…", About, Contact.
2. The hero-to-form edge: the form's heading has clear space above it and nothing overlaps. In dark mode the two sections are still told apart.
3. At no scroll position are the card's Pickup and Drop-off and the form's on screen together.
4. Get a fare in the card, press "Book this ride": the form card is at the top, both places are filled, focus is on "Full name".
5. In the form, "Change these on the map" lands on the card with its heading clear of the header.
6. Header menu, phone drawer and footer list read Book a Ride, Services, About, Contact, and each link lands on its section with the heading clear of the header.
7. The phone's bottom bar "Book" lands on the form heading. The "Schedule a Ride" button under Services goes up to the same place.
8. With no interaction after load: still no `locationiq.com` request and no Leaflet file. Lighthouse mobile: CLS under 0.05, LCP no worse than `main` by more than 0.1 s.

## 9. Files to change

| File | Items |
|---|---|
| `components/FareQuote.tsx` | 1, 4, 5 |
| `components/FareMap.tsx` | 4 |
| `components/LocationAutocomplete.tsx` | 3 |
| `lib/fare.ts`, `lib/fare.test.ts` | 4 |
| `app/globals.css` | 2, 7 (and 6 only if reproduced) |
| `app/page.tsx`, `components/Header.tsx`, `components/Footer.tsx` | 8 |

Before release: `npm run typecheck`, `npm test`, `npm run build`, then the eight screen checks above on the real app.

## 10. Out of scope

- New hint wording to fit two lines at 320px.
- A line between the pins when the route fails.
- Any change to fare text, the announcement, or what the customer is told about distance and rate.
- New copy for the form heading or the Services button.
- The "Coming soon" bar.

## 11. Summary for Kemar

Eight changes. The card stops jumping when the hint changes. The map gets a clear focus ring for keyboard users. Address suggestions get bigger. If a fare can't be worked out, the map still shows both pins. The phone number and "Clear map pins" stay on one line. The blue sliver at the top goes. The heading-under-the-header fault did not show when I tested, so the builder must reproduce it before changing anything. And I agree with you on booking: move "Schedule a ride" directly under the hero. It cuts the scroll on a phone from about seven screens to two, and the repeated Pickup and Drop-off boxes are never on screen together. The menu order follows.

# Homepage redesign: design spec

Date: 2026-11-13
Status: draft, awaiting Kemar's approval
Repo: `access-barbados` (site only). Branch: `feat/homepage-redesign`.
Adds to: `2026-11-13-fare-quote-polish-design.md` and `2026-11-13-hero-map-and-per-mile-design.md`. Anything not named here stays as those specs say.

Kemar's picks from the design audit: layout B (one booking panel), plus four fixes: the empty fare box, the bright map in dark mode, sections that blend together in light mode, and a shorter page on phones.

What stays: customers see the fare only (no distance, no rate). One `aria-live` region, in `RideQuoteProvider`. The map loads only when asked for, behind its placeholder. Hours read "Open Daily, 9:00 AM – 6:00 PM" from `CONTACT.businessHours`. The yellow "Coming soon" bar is not touched. No new dependencies, no new components, no new helper files. `RideQuoteProvider` and its state are not changed.

Measurements below were taken on the live site (accessbim.com) on 2026-11-13 at 1536×864 and 375×812, light and dark. Heights given for the new layout are estimates; the screen checks set the pass marks.

One correction to the audit: the Services section has nine cards, not ten. Ten is the number of choices in the form's "Service type" list.

## 1. The hero without the card

**Now.** On a computer the intro is on the left and the fare card on the right. The card is about 920px tall and the intro ends near 470px, so about 450px under the ticks is empty. On a phone the card (1,005px) sits between the hours line and the ticks, and the hero is 1,585px tall.

**Change.** `components/Hero.tsx`. The card leaves the hero (it moves to section 2). The hero becomes one short column: left-aligned on a phone, centred from 768px up.

- Delete the `FareQuote` import, the `hasQuote` constant, the card's wrapper `<div>` and every `hasQuote` branch. Update the comments that describe the two-column grid.
- Container: `container-page pt-6 pb-14 sm:pt-12 sm:pb-20 lg:pt-8 lg:pb-24` becomes `container-page pt-6 pb-10 sm:pt-12 sm:pb-14 lg:pt-12 lg:pb-16`.
- Replace the grid wrapper with `<div className="mx-auto max-w-3xl md:text-center">`. Eyebrow, `h1`, paragraph, buttons, hours and ticks sit inside it, in that order. The eyebrow and `h1` keep their classes and words.
- Paragraph: add `md:mx-auto` (it keeps `max-w-2xl`).
- Button row: `mt-5 sm:mt-8 grid grid-cols-1 md:flex md:flex-wrap gap-3` gains `md:justify-center`.
- Buttons, in this order:
  1. "Call +1 (246) 241-4607", unchanged (`tel:` link, `btn-primary`, every width).
  2. "WhatsApp", unchanged (`btn-whatsapp hidden md:inline-flex`).
  3. New: `<a href="#book" className="btn-secondary hidden md:inline-flex whitespace-nowrap">Book a ride</a>`. From 768px up only. On a phone the bottom bar's "Book" does this job.
- Hours line: add `md:justify-center`.
- Ticks: the `<ul>` becomes `mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-left text-sm sm:text-base`. Two columns on a phone, three from 768px. Six ticks in one row was tried on paper and dropped: "Wheelchair-ready vehicles" wraps at that width.
- The background layers and the section's `overflow-hidden` stay.

The hero is a plain server component after this: no client code, no token check.

**Test (screen check "hero").**

- 1536×864, light and dark: the heading is one centred line. Three buttons in one centred row: Call, WhatsApp, Book a ride. Hours centred under them. Ticks in three columns, two rows. Nothing empty beside the intro. The eyebrow "Schedule a ride" of the next section is on the first screen.
- 375×812, light and dark: eyebrow, heading, one sentence, the full-width Call button, hours, then six ticks in two columns. No WhatsApp or Book button in the hero. The hero is under 620px tall.
- Press "Book a ride" (1536×864): the booking section's eyebrow lands clear of the header.

## 2. One booking panel

**Now.** Pickup and Drop-off are asked twice: in the hero card ("Pickup", "Drop-off") and again in the form ("Pickup location (optional)", "Drop-off location (optional)"), with a "Change these on the map" link that sends the customer back up. The fare shows in both. The card's "Book this ride" button jumps to the form. On a computer the card's two fields are 245px wide and cut off "Queen Elizabeth Hospi…".

**Change.** The card moves into the booking section and sits beside the form. One pair of place fields remains: the card's.

### Layout (`components/BookingForm.tsx`)

- The section keeps `id="book"`, its eyebrow "Schedule a ride", its heading "Tell us where you need to go." and its intro paragraph, centred above both columns.
- Import `FareQuote`. Under the heading block, the wrapper `mt-10 sm:mt-12 max-w-3xl mx-auto card shadow-soft` is split in two:
  - Outer: `<div className={LOCATIONIQ_TOKEN ? "mt-10 sm:mt-12 grid gap-6 lg:grid-cols-[2fr_3fr] lg:gap-8" : "mt-10 sm:mt-12 max-w-3xl mx-auto"}>`. Do not add `items-start`: the left column must stretch to the row's full height for the sticky fare (below).
  - Left, only with a token: `<div><FareQuote /></div>`.
  - Right: `<div className="card shadow-soft">` holding the form or the success screen, as now.
- Without a LocationIQ token there is no card, and the form is the single centred card it is today.
- From 1024px: card left (two fifths), form right (three fifths). Below 1024px: one column, card first, form second.
- The form grid `grid gap-5 sm:grid-cols-2` gains `items-end`, so paired inputs stay level if one label wraps in the narrower card.

### Fields

- Remove from the form, when there is a token: the "Pickup location" and "Drop-off location" fields and the "Change these on the map" link. Wrap the two fields in `{!LOCATIONIQ_TOKEN && …}` so the no-token site still has them. Delete the link outright (it only ever rendered with a token).
- The card's fields are the only place fields: ids `quotePickup` and `quoteDropoff`, labels "Pickup" and "Drop-off", unchanged. They stay optional; the intro already says name and phone are all that is needed.
- `components/FareQuote.tsx`, the fields' wrapper: `mt-4 grid gap-4 sm:grid-cols-2` becomes `mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1`. Stacked in the narrower desktop card, so a long place name fits.
- What is sent does not change: `onSubmit` already reads `pickup` and `dropoff` from `useRideQuote()`.

### The card (`components/FareQuote.tsx`)

- The heading "See your fare before you book" becomes an `h3` (it now sits under the section's `h2`): `text-xl sm:text-2xl font-bold tracking-tight text-navy-900 dark:text-mist-100`.
- Delete the "Book a ride" / "Book this ride" button and the `toForm` function. The form is beside the card, or directly under it.
- Delete the card's "Prefer to talk? Call…" line and the `CONTACT` import. The form keeps its own.
- "Clear map pins" stays, under the map, shown as now once a pin is placed: `btn-secondary mt-4 w-full`.
- The card keeps `id="quote"`. Nothing on the page links to it after this; it stays so an old `/#quote` link still lands.
- The fare box moves out of the card (next).
- Update the file's opening comment, and the matching comments in `FareMap.tsx` and `RideQuote.tsx`: this is the booking section's card, not the hero's.

### The fare, and what sticks

`FareQuote` returns a fragment: the card, then the fare box as its sibling.

- The fare box renders only when `quote && quote.state !== "same"`, the same test the form uses today. So: nothing before two places are set, then "Working out your fare…", then the fare or the "couldn't work out a fare" message. Delete the two invisible sizing copies of `FareSummary`.
- Classes: `mt-4 rounded-xl border-2 border-brand-700/40 bg-brand-50 px-4 py-3 text-base text-navy-800 dark:border-sky-500/50 dark:bg-navy-900 dark:text-mist-100 lg:sticky lg:top-[calc(var(--header-h,8rem)+1rem)]`.
- It is not a live region. `RideQuoteProvider` still announces the fare once.
- Sticky, from 1024px only. The top offset is the page's own `scroll-padding-top` value: the measured header height (131px at 1536px, the yellow bar included) plus 1rem. As the customer scrolls down the form, the card and map scroll away and the fare box stays pinned under the header, beside the form, until the section ends. Only the small box sticks, not the whole card: the card is taller than a laptop screen, and a pinned card would hide its own bottom, which is where the fare is.
- No ancestor of the box inside `#book` may have `overflow` set, or sticky stops working.
- The form's own fare box, above "Request My Ride": add `lg:hidden`. On a computer the pinned box is already beside the button. Below 1024px nothing is pinned, so the form's box stays as the reminder at the point of sending.

### Focus order and jumps

- DOM and tab order: section heading, Pickup, Drop-off, the map button (or map, zoom buttons and pins), Clear map pins, then Full name and the rest of the form. This matches the screen at every width.
- `#book` is still the booking section. These all go there, unchanged: header "Book a Ride", the phone drawer, footer "Book a Ride", the "Schedule a Ride" button under Services, the phone bottom bar's "Book", and the hero's new "Book a ride". The jump lands on the section's eyebrow and heading, with Pickup next. No change to `MobileActionBar.tsx`, `Header.tsx` or `app/page.tsx`.
- The success screen replaces the form in the right-hand card, as now. The card on the left stays, with its fields cleared.

**Test (screen check "booking panel").** Production build with the LocationIQ token set.

- 1536×864, light and dark: under "Tell us where you need to go." the card is on the left and the form on the right, tops level. The card has Pickup above Drop-off. The form starts at "Full name". There is one Pickup and one Drop-off on the page, no "Change these on the map" link, and no "Book a ride" button in the card.
- Type and choose "Queen Elizabeth Hospital", then "Oistins". The full place names fit their fields. The fare box appears under the card. Scroll to "Request My Ride": the fare box is pinned 1rem under the header, beside the button, and the form shows no second fare box. Scroll on into Services: the box leaves with the section and never covers the next one.
- 1280×720: the same, and the pinned box is fully visible.
- 1024×768: two columns, and no pair of form inputs sits at different heights.
- 375×812, light and dark: heading, card, fare box (after a quote), form. The form's own fare box shows above "Request My Ride". The bottom bar's "Book" lands on the section heading with Pickup on screen.
- 768×1024: one column, the same order as the phone, nothing pinned.
- Keyboard, 1536×864: Tab from the section heading runs Pickup, Drop-off, "Pick places on the map", then Full name. With the map open: the map, zoom in, zoom out, any pins, Clear map pins, then Full name.
- Screen reader or DevTools: the page has one `aria-live="polite"` region while the form is showing, and a fare is announced once.
- Send nothing on the live site. On a local build with no booking endpoint, fill name and phone after a quote and submit: the mail draft carries Pickup, Drop-off and "Estimated fare: $NN BBD".
- Build once without the token: no card, the form is one centred card and has its own Pickup and Drop-off fields.

**Test (unit).** No new logic, so no new unit test. `npm test` (`lib/fare.test.ts`, `lib/locationiq.test.ts`) must pass unchanged.

## 3. The empty fare box

**Now.** Before two places are chosen, the card shows an empty outlined rectangle, 100 to 130px tall, between the map and the button. It reads as something broken.

**Change.** Done by section 2: the fare box does not render until there is a fare, a "working" message or a "failed" message. In the "same place twice" state it stays hidden and the hint above the map explains, as now.

**Test (screen check "no empty box").** 375×812 and 1536×864, light and dark. On arrival there is no empty rectangle anywhere in the booking section. Choose one place: still none. Choose the second: "Working out your fare…" appears, then the fare. Press "Clear map pins": the box goes. Choose the same place for both: no box, and the hint says to move one pin.

## 4. The map placeholder on a phone

**Now.** Before the map is asked for, the placeholder is a 280px box with the island outline and one button. On a phone that is a third of the screen spent on a picture.

**Change.** `components/FareQuote.tsx`. Below 640px the placeholder is the button alone; the box takes its 280px when the map is wanted.

- The map box: `h-[280px]` becomes `` `${mapWanted || mapFailed ? "h-[280px]" : "sm:h-[280px]"}` `` in the class list.
- `<IslandOutline />`: give its `<svg>` `hidden sm:block` (it keeps `h-36 w-auto`).
- The placeholder's inner `<div>` keeps `flex h-full flex-col items-center justify-center gap-4 p-4`.

The map still loads only on the button press or when a typed suggestion is chosen. The box grows in the same instant as that press, so it is not an unexpected shift.

**Test (screen check "slim placeholder").** 375×812, light and dark. On arrival the box under "Or pick both places on the map" holds only the button and is under 100px tall. No request to `locationiq.com` and no Leaflet file has loaded. Press the button: the box becomes 280px, shows "Loading the map…", then the map. At 1536×864 the placeholder is unchanged: 280px, with the island outline.

## 5. The bright map in dark mode

**Now.** In dark mode the card is navy and the map tiles are the light street style. It glares, and it is the brightest thing on the screen.

**Change.** `app/globals.css`, inside the existing dark block at the end of the file. CSS only; no second tile style, no JavaScript.

```css
/* Dark theme: darken the light tiles in place. Only the tile pane is filtered,
   so pins, the route and the controls keep their own colours. */
.fare-map .leaflet-tile-pane {
  filter: invert(1) hue-rotate(180deg) brightness(1.2) contrast(0.85);
}
/* Brand blue is too dim on dark tiles; the light blue is 7.1:1 on navy. */
.fare-map .leaflet-overlay-pane path {
  stroke: var(--color-sky-500);
}
```

The builder may tune the `brightness` and `contrast` numbers to meet the check below, and nothing else. In `FareMap.tsx`, extend the comment on the route colour to say the dark theme overrides it in `globals.css`. No code change there.

**Test (screen check "dark map").** 375×812 and 1536×864, dark. Get a fare. The map is dark: land dark, sea a darker blue, road and place names readable. The route line is light blue and at least 3:1 against the tiles beside it (measure with a colour picker). Pins A and B, the zoom buttons and the attribution look as they did. Switch the system to light with the map open: the tiles and the line return to today's look without a reload.

## 6. Sections blend together (light mode)

**Now.** In light mode, the booking section fades into the page colour and Services, About and Contact all sit on that same pale blue. Only the headings mark where one ends.

**Change.** Two class changes. Dark mode is not changed.

- `components/Services.tsx`, the `<section>`: add `border-t border-mist-300 dark:border-transparent`. A hairline where the booking section's ground meets the same colour.
- `components/About.tsx`, the `<section>`: `section` becomes `section bg-mist-50 dark:bg-navy-900`. About has no white cards, so the lighter band costs nothing; its text is already measured on `mist-50` (11.7:1).
- Contact stays on the page colour, so it reads as a new band after About. The footer is navy.
- Services keeps the page colour: its white cards need the tinted ground to stand out.

**Test (screen check "section grounds").** 375×812 and 1536×864, light. Scroll the page: there is a visible edge at each of hero to booking, booking to Services (the line), Services to About, About to Contact, Contact to footer. In About, every line of text and the dividers are as easy to read as before. Dark: the page looks as it does on `main`.

## 7. Services cards on a phone

**Now.** Nine cards, one per row, each with the icon above the title: the section is 2,710px on a phone, more than three screens.

**Change.** `components/Services.tsx`. Below 640px each card becomes a compact row: icon on the left, title and description to its right. Every word stays. From 640px up nothing changes.

- The grid: `gap-4 sm:gap-5` becomes `gap-3 sm:gap-5`.
- The `<article>`: add `max-sm:grid max-sm:grid-cols-[auto_1fr] max-sm:gap-x-3 max-sm:p-4`. Use `max-sm:p-4`, not `p-4`: a bare `p-4` would also beat the card's own larger padding on wide screens.
- The icon wrapper: add `max-sm:row-span-2 max-sm:self-start`.
- The `h3`: `mt-3 sm:mt-4` becomes `sm:mt-4`.
- The description keeps its classes.

**Test (screen check "services on a phone").** 375×812, light and dark. Each card shows its icon at the left with the title beside it and the full description under the title. No text is cut off or ends in "…". The Services section is under 2,150px tall. At 768×1024 and 1536×864 the cards look as they do on `main`.

## 8. The footer on a phone

**Now.** The footer is 1,131px on a phone. "Quick links" repeats the menu at the top and the bar at the bottom.

**Change.** `components/Footer.tsx`.

- The "Quick links" column's `<div>`: add `hidden sm:block`. On a phone the header menu and the bottom bar cover it.
- The container: `py-12 sm:py-14` becomes `py-8 sm:py-14`.
- "Reach us" (phone, WhatsApp, email, address, hours), the "Trouble using this site?" box and the copyright lines stay at every width.

**Test (screen check "phone footer").** 375×812, light and dark. The footer shows the logo and line, "Reach us", the "Trouble using this site?" box and the copyright, and no "Quick links". It is under 900px tall. Its last line clears the bottom bar. At 1536×864 the footer is unchanged, "Quick links" included.

## 9. Contact's form and its wording

**Now.** "Send a message" says "Got a question or want to book in advance?", so the page has a second way to book that skips the fare and the ride details. The email card says "Or use the form below", but on a computer the form is beside it.

**Change.** `components/Contact.tsx`. Words only. The form stays: it is the one way to ask a question without a phone call, WhatsApp or an email app.

- Under "Send a message": "Got a question or want to book in advance? Drop us a line and we'll get back to you." becomes "Got a question? Drop us a line and we'll get back to you. To book a ride, use the booking form." The words "booking form" are a link to `#book`, with the classes the site's other inline links use: `font-semibold text-brand-800 underline underline-offset-2 decoration-2 hover:decoration-gold-500 dark:text-brand-300 dark:hover:decoration-gold-400`.
- Email card, third line: "Or use the form below. Your choice." becomes "Or use the message form. Your choice." True beside it and below it.

**Test (screen check "contact wording").** 375×812 and 1536×864, light. Both new sentences read as above. "booking form" is underlined, takes keyboard focus with a visible ring, and lands on the booking section's heading clear of the header.

## 10. The whole page on a phone

**Test (screen check "page length").** 375×812, light, on arrival with nothing typed: the page is under 9,500px tall (it is 10,779px today). Scroll order: hero, booking (card then form), Services, About, Contact, footer. With no interaction after load: no `locationiq.com` request and no Leaflet file. Lighthouse mobile: CLS under 0.05, LCP no worse than `main` by more than 0.1 s.

## 11. Files to change

| File | Items |
|---|---|
| `components/Hero.tsx` | 1 |
| `components/BookingForm.tsx` | 2 |
| `components/FareQuote.tsx` | 2, 3, 4 |
| `components/FareMap.tsx`, `components/RideQuote.tsx` | 2 and 5 (comments only) |
| `app/globals.css` | 5 |
| `components/Services.tsx` | 6, 7 |
| `components/About.tsx` | 6 |
| `components/Footer.tsx` | 8 |
| `components/Contact.tsx` | 9 |

Not changed: `app/page.tsx`, `components/Header.tsx`, `components/MobileActionBar.tsx`, `components/LocationAutocomplete.tsx`, `lib/*`.

Anchors: `#book` keeps its meaning. `#quote` stays on the card but nothing links to it. Existing unit tests are not changed.

Before release: `npm run typecheck`, `npm test`, `npm run build`, then the ten screen checks above on the real app.

## 12. Out of scope

- The "Coming soon" bar.
- Removing Contact's message form. It would take about 800px more off the phone page; it is Kemar's call and can follow.
- Hiding the service descriptions behind a tap, or shortening their copy.
- A dark tile style from the map provider.
- Pinning the whole card, or the map, while the form scrolls.
- Any change to dark-mode section grounds.
- Any change to fare text, the announcement, the hint wording, or what the customer is told about distance and rate.
- The header's height on a phone.
- New form fields, or a new order for the form's remaining fields.

## 13. Summary for Kemar

The opening stays first, shorter and centred, with Call, WhatsApp and a new "Book a ride" button. Under it is one booking section: the map card on the left, the form on the right. Pickup and Drop-off are asked once, in the card. When a fare appears, it stays pinned beside the form as people scroll, so it is still in view at "Request My Ride". On a phone the order is intro, places and map, fare, details. The empty fare box is gone. The map goes dark in dark mode. Services, About and Contact get visible edges. On a phone the service cards are tighter (every word kept), the map picture is hidden until asked for, and the footer loses its repeated links. The page is about 1,300px shorter. Contact's form stays, for questions only. The yellow bar is untouched.

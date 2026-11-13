# Hero map and per-mile rate: addendum spec

Date: 2026-11-13
Status: draft, awaiting Kemar's approval
Repos: `access-barbados` (site), `access-barbados-admin` (admin)
Adds to: `2026-11-13-map-fare-quote-design.md` ("the first spec"). Where the two differ, this one wins. Anything not named here stays as the first spec says.

Both sides are built on `feat/map-fare-quote` and neither is released. This work goes on the same branches.

## 1. The two decisions

1. **The map and fare quote move to the top of the homepage.** Kemar: "map at the top", so "users will see that as soon as they come on the website."
2. **The rate is $10 BBD per mile.** The unit changes from km to miles end to end.

## 2. Audit of the current hero

From the desktop screenshot (1568 wide, dark theme) and `components/Hero.tsx`. The audience is older and disabled riders and their families, often on phones.

What works:

- The headline "Call us. We'll be there." is short and tells an older rider what to do.
- The call button shows the number. Buttons are large and the contrast is strong.
- On a phone the sticky bar keeps Call, WhatsApp and Book one tap away.

What does not:

1. **The right half is nearly empty.** One small hours card floats in about 40% of the width. It is the best space on the site and it answers one question.
2. **No price anywhere near the top.** Cost is the first question a family asks. The map sits four screens down, after name, phone, email, date and time.
3. **The hours are hidden on phones.** The card is `hidden md:block`. Most of this audience is on a phone.
4. **Three buttons of similar weight.** The headline says "Call us" but the main button is "Book a Ride". WhatsApp wraps onto a second row.
5. **On a phone the hero is over a screen long.** A four-line paragraph, three stacked full-width buttons and six ticks. The three buttons repeat the sticky bar directly below them.
6. **The six trust ticks are small text** and push everything else down.
7. **The local build shows placeholder data** ("REPLACE_ME_PHONE_DISPLAY", 6:00 AM – 10:00 PM). This is stale `lib/contact.json`, not a design fault. The design check must run after a sync, so it shows the real phone and **Daily, 9:00 AM – 6:00 PM**.

## 3. Hero design

### 3.1 Layout

**Desktop (`lg` and up).** Two columns, six and six, aligned to the top (`items-start`, so the left column does not move when the quote card grows).

- Left: eyebrow, headline, paragraph, buttons, hours line, trust ticks.
- Right: the quote card, `id="quote"`.
- Buttons on the left: **Call {number}** (primary, matching the headline) and **WhatsApp**. "Book a Ride" leaves the left column. Booking now starts from the quote card.
- Top padding drops from `lg:pt-24` to about `lg:pt-12`.
- Target: at 1366×768 and at 1568 wide, the card heading, both address fields and the whole map box are above the fold.

**Phone (below `md`).** One column, in this order:

1. Eyebrow and headline.
2. The first sentence of the paragraph only. The other two sentences show from `sm` up. No copy is rewritten.
3. One full-width **Call {number}** button. WhatsApp and Book are in the sticky bar, so they are not repeated here.
4. The hours line.
5. The quote card.
6. The trust ticks, below the card.

Target: at 375×667 the headline, the Call button, the hours line and the quote card's heading are visible without scrolling, above the sticky bar.

**Tablet (`md` to `lg`).** One column in the phone order, with the desktop buttons.

**Hours.** The card becomes one line under the buttons, on every screen size: a clock icon and "Open {CONTACT.businessHours}", which reads "Open Daily, 9:00 AM – 6:00 PM". Base text size, not small print. The gold panel behind the old card goes.

**No LocationIQ token.** The quote card does not render and the hero is the left column alone. The form behaves as it does today.

### 3.2 The quote card

A `.card`, top to bottom:

1. Heading (`h2`): **"See your fare before you book"**.
2. **Pickup** and **Drop-off** fields. These are the existing `LocationAutocomplete`, side by side from `sm` up, stacked on a phone. Ids `quotePickup` and `quoteDropoff`. No `name`, because they are outside the form.
3. Label "Or pick both places on the map", then the hint line.
4. The map box. 280px high on every screen size. It holds the placeholder (section 5) and later the real map, at the same size.
5. The fare box. It has a minimum height of two lines, so the button below it does not jump when the fare arrives.
6. The call to action, a primary full-width link to `#book`:
   - **"Book this ride"** when both places have coordinates (states 3, 4 and 5 of the first spec).
   - **"Book a ride"** otherwise.
   - After the jump, focus moves to the "Full name" field.
7. One line: "Prefer to talk? Call {number}", with the number as a `tel:` link.
8. "Clear map pins", shown when at least one pin exists.

The fields come before the map in the page order, so a keyboard or screen-reader user meets the typed path first.

States and copy are the first spec's table (states 1 to 8), with these changes:

| State | Change |
|---|---|
| 1, empty | Hint: "Type your pickup and drop-off, or pick them on the map." |
| 4, quoted | Fare box: **"Estimated fare: $46 BBD"** then "4.6 miles by road, at $10 a mile. We'll confirm the final fare when we call." |
| 6, map failed | "The map didn't load. You can still type your pickup and drop-off above." Unchanged, now in the hero. |

### 3.3 How the places and fare reach the booking form

One piece of shared state. The hero card and the booking form are two views of it.

- A new client component, `RideQuoteProvider`, holds `pickup`, `dropoff` and `quote`. It also holds the route lookup that `BookingForm` runs today. `app/page.tsx` wraps `<main>` in it.
- The quote card reads and writes that state. So do the form's Pickup and Drop-off fields.
- So when the customer taps "Book this ride", the form's two fields are **already filled**, with their coordinates. Nothing is copied and nothing is typed twice.
- Editing a place in the form updates the same state. The fare is worked out again and the hero card follows.
- After a successful send, the state is cleared, as today. Both views empty.
- The POST body does not change.

### 3.4 The map in the form

**It is removed.** There is one map on the page, in the hero.

- A second map would mean a second set of tile requests and a second place to drag pins.
- In the form, **Pickup and Drop-off move to the top**, above Full name. A customer arriving from "Book this ride" sees their two places first and knows they carried over. Name and phone are still the only required fields.
- Under the two fields, when the token is set: a link "Change these on the map" to `#quote`.
- The fare box stays above the submit button, as built.
- The `IntersectionObserver` and the `FareMap` loading leave `BookingForm`.

### 3.5 One announcement, not two

The fare now shows in two places. Two live regions would read it out twice.

- The provider renders **one** visually hidden `aria-live="polite"` region. It announces "Working out your fare…", the quote, the failure message, and states 7 and 8.
- The two visible fare boxes are not live regions.

## 4. Per-mile rate

### 4.1 Names

| Thing | Was | Now |
|---|---|---|
| Setting key | `fare_per_km_bbd` | `fare_per_mile_bbd`, seeded `'10'` |
| Sync field | `fare.perKmBbd` | `fare.perMileBbd` |
| Site file `lib/fare.json` | `{ "perKmBbd": 5.98 }` | `{ "perMileBbd": 10 }` |
| Settings form field | `perKmBbd`, "Rate per kilometre (BBD)" | `perMileBbd`, "Rate per mile (BBD)" |

No old key needs cleaning up. The migration has not run anywhere.

### 4.2 Fare maths

The same rule on the site and on the server:

```
m       = round(metres)                  // whole metres from Directions
tenths  = round(m / 160.9344)            // tenths of a mile, a whole number
miles   = tenths / 10                    // what the customer sees: 4.6
cents   = round(rate × 100)              // the rate in cents, a whole number
fareBbd = ceil(tenths × cents / 1000)    // whole BBD, rounded up
```

- One mile is 1609.344 metres exactly, so a tenth of a mile is 160.9344 metres.
- `tenths × cents` is a whole number, so the only rounding is the final `ceil`. It cannot overcharge from floating-point error. A plain `ceil(miles × rate)` can: `4.4 × 12.5` is `55.00000000000001` and would charge $56.
- The customer can check it: the miles shown × the rate, rounded up.
- In code this is one new function, `toMiles(metres)`, which returns `miles`. `fareBbd(miles, rate)` is the function already built; only its unit changes. `toKm` goes.
- `toMiles` gives 0 for a trip under about 80 metres. That is the "same place" state, with no fare.
- A missing, non-numeric or non-positive rate still gives no fare.

Worked example: 7,449 m is 46 tenths, so 4.6 miles. At $10 that is $46.

### 4.3 Miles or km on screen

**Customers see miles.** The fare is charged per mile, so the distance must be in the unit a customer can multiply by the rate to check the price.

The fare line also shows the rate ("at $10 a mile"). A whole-dollar rate prints as `$10`. A rate with cents prints with two decimals, `$9.50`.

Other copy:

- Success screen: "Estimated fare: $46 BBD (4.6 miles). We'll confirm the final fare when we call."
- Mailto line: `Estimated fare: $46 BBD (4.6 miles)`.
- Distances always show one decimal and the word "miles".

### 4.4 The `distance_km` column and the admin

- **The column stays, and still holds km.** It is the measurement, not the pricing unit. The rate unit has already changed once; the stored distance should not have to change with it.
- **Its precision changes** from `numeric(6,1)` to `numeric(7,3)`. It stores `round(metres) / 1000`, which is whole metres.
- Reason: 16,173 m is 10.0 miles, but 16.2 km turned back into miles is 10.1. With one decimal of km the admin could show a distance that does not match the fare. With whole metres, `toMiles(km × 1000)` gives exactly the miles the fare used.
- **The admin shows miles**, because Kemar checks a fare against a per-mile rate. `formatFare` reads "$46 BBD · 4.6 mi".
- `quoteRide` returns `{ distanceKm: 7.449, priceBbd: 46 }`.

### 4.5 Migration

Edit `drizzle/manual/0003_fare_quote.sql` in place. It has not run anywhere, so no new migration.

```sql
-- Map fare quote: store the road distance, and seed the per-mile rate.
-- Apply manually after 0002_security_hardening.sql. Safe to re-run.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS distance_km numeric(7,3);

INSERT INTO public.site_settings (key, value)
VALUES ('fare_per_mile_bbd', '10')
ON CONFLICT (key) DO NOTHING;
```

Drizzle: `distanceKm: numeric("distance_km", { precision: 7, scale: 3 })`.

### 4.6 Settings → Fare

- Label: "Rate per mile (BBD)". Hint and error example: "Enter a number like 10 or 9.50".
- Page text: "Fare = road distance in miles × this rate, rounded up to the next whole dollar."
- Settings index card: "$10 BBD per mile".
- The checks do not change: above 0, at most 1000, at most two decimals.

The release order in the first spec does not change: migration, then admin, then site.

## 5. Loading the map without hurting first paint

The map is now above the fold. Nothing from Leaflet or LocationIQ loads until the customer asks for it.

- **Placeholder.** The map box first shows a simple drawing of the island and a real `<button>`: **"Pick places on the map"**.
- **The drawing is an inline SVG outline of Barbados**, under 3 KB, simplified from Natural Earth data (public domain). It uses the theme's colours, so it follows light and dark.
- A saved picture of the real tiles was rejected. Storing a provider's tiles may break LocationIQ's terms, and it would not follow the dark theme.
- **Leaflet loads on the first of these:**
  1. The customer presses the placeholder button (tap, click or keyboard).
  2. A typed suggestion is chosen in either field, in the hero or in the form. The map then shows the pin.
- While it loads, the box says "Loading the map…". There is no spinner.
- If the import or the tiles fail, state 6 shows. The fields and the fare still work.
- The placeholder and the map are the same size, so nothing on the page moves when one replaces the other.
- A second benefit: a visitor who never touches the map costs no tile requests against the LocationIQ daily limit.
- On a phone the real map only appears after the customer asks for it, so it cannot trap a page scroll by surprise.

Checks, on a production build, with no interaction after load:

- No request to any `locationiq.com` host, and no Leaflet script or stylesheet.
- Lighthouse mobile: the largest paint is still hero text, LCP is no worse than `main` by more than 0.1 s, and CLS is under 0.05.

## 6. Accessibility, dark mode and reduced motion

Everything in section 6 of the first spec still holds. In addition:

- **The typed path is first.** The two fields come before the map in tab order. A fare can be had, and the ride booked, without touching the map or its button.
- The placeholder button has a visible focus ring and is at least 48px high.
- If the button had keyboard focus when pressed, focus moves to the map when it is ready. Otherwise focus is not moved.
- "Book this ride" is a real link. Focus lands on "Full name" after the jump.
- One live region announces the fare (section 3.5).
- The hero has one `h1`. The card heading is an `h2`.
- The hours line and the fare text are at least the base text size and meet the site's contrast levels in both themes.
- At 200% zoom and at 320px wide, the card's fields, map box, fare and button do not overlap or cut off.
- **Dark mode:** the card, the placeholder drawing, the hours line and the fare box follow the theme. The map tiles are the same light tiles in both themes, as now.
- **Reduced motion:** the first spec's Leaflet settings stay. The jump to the form is instant (the site's CSS already turns off smooth scrolling). The loading state does not animate.

## 7. Files to change

### Site: `D:/AI Projects/access-barbados`

| File | Change |
|---|---|
| `components/RideQuote.tsx` (new) | `RideQuoteProvider` and `useRideQuote()`: `pickup`, `dropoff`, `quote`, the pick, type and clear handlers, the route lookup and the one live region. All moved out of `BookingForm`. Also `FareSummary`, the visible fare text used by both views. |
| `components/FareQuote.tsx` (new) | The hero card: fields, hint, placeholder, lazy `FareMap`, fare box, call to action, clear button. |
| `components/Hero.tsx` | New layout from section 3.1. Renders `FareQuote`. Hours line replaces the hours card. Stays a server component. |
| `components/BookingForm.tsx` | Read places and quote from `useRideQuote()`. Remove the map block, the observer and the lookup code. Move Pickup and Drop-off to the top. Add the "Change these on the map" link. Miles in the success and mailto copy. |
| `components/FareMap.tsx` | No change to behaviour. Update the header comment. |
| `app/page.tsx` | Wrap `<main>` in `RideQuoteProvider`. |
| `lib/fare.ts` | `toMiles` replaces `toKm`. `FARE_RATE` reads `perMileBbd`. Update the comments. |
| `lib/fare.json` | `{ "perMileBbd": 10 }`. |
| `scripts/sync-from-admin.mjs` | Read, check and write `fare.perMileBbd`. Log `$10/mile`. |
| `app/globals.css` | Placeholder styles. Remove anything used only by the map in the form. |

### Admin: `D:/AI Projects/access-barbados-admin`

| File | Change |
|---|---|
| `drizzle/manual/0003_fare_quote.sql` | Section 4.5. |
| `lib/db/schema.ts` | `distanceKm` precision 7, scale 3. |
| `lib/fare.ts` | `toMiles` replaces `toKm`. `quoteRide` prices in miles and returns km to three decimals. `fareColumns` reads `fare_per_mile_bbd`. The schema message reads "Enter a number like 10 or 9.50". |
| `lib/format.ts` | `formatFare` shows miles, using `toMiles`. A client component (`bookings/[id]/edit-form.tsx`) imports this file, so the builder checks the build does not pull Zod into that bundle through `lib/fare.ts`. |
| `app/api/public/sync/route.ts` | `fare: { perMileBbd }`, read from `fare_per_mile_bbd`. |
| `lib/actions/settings.ts` | Form field `perMileBbd`, key `fare_per_mile_bbd`. |
| `app/admin/settings/fare/page.tsx`, `fare-form.tsx` | Section 4.6. |
| `app/admin/settings/page.tsx` | Fare card: "Rate per mile…" and "$10 BBD per mile". |

No change is needed in the bookings route, `lib/actions/bookings.ts`, the booking detail page or the Today page. They go through `fareColumns` and `formatFare`.

## 8. Tests

The builder writes each test first and watches it fail.

### Both repos, `lib/fare.test.ts`

Replace the `toKm` test and the fare tests with:

- **"toMiles rounds metres to a tenth of a mile":** `toMiles(1609.344)` is 1. `toMiles(7449)` is 4.6. `toMiles(7500)` is 4.7. `toMiles(16093.44)` is 10.
- **"toMiles gives 0 under about 80 metres":** `toMiles(0)` is 0. `toMiles(80)` is 0. `toMiles(81)` is 0.1.
- **"a 10.0-mile trip at $10 is exactly $100":** `fareBbd(toMiles(16093.44), 10)` is 100. `fareBbd(10, 10)` is 100.
- **"fareBbd rounds up to the next whole dollar":** `fareBbd(4.6, 10)` is 46. `fareBbd(0.1, 10)` is 1. `fareBbd(4.6, 9.5)` is 44 (43.7 rounds up). `fareBbd(4.7, 9.5)` is 45 (44.65 rounds up).
- **"fareBbd does not overcharge from floating-point error":** `fareBbd(4.4, 12.5)` is 55, not 56. `fareBbd(16.6, 15)` is 249, not 250.
- **"fareBbd gives no fare for zero distance or a bad rate":** unchanged.

The `inBarbados` tests do not change.

### Admin, `lib/fare.test.ts`

- **"quoteRide prices a 7,449 m route at rate 10":** returns `{ distanceKm: 7.449, priceBbd: 46 }`.
- **"the stored km gives back the miles the fare used":** for 16,173 m, `toMiles(distanceKm × 1000)` is 10 and `priceBbd` is 100.
- **"quoteRide returns null on a 0 m route":** unchanged, and add an 80 m route.
- The bad-rate cases stay, with `"-5"` now `"-10"`.
- **"fareRateSchema accepts 10 and 9.50"** and **"rejects 0, -1, abc, 9.123 and 1001"**.
- **"formatFare shows miles":** `formatFare(46, 7.449)` is "$46 BBD · 4.6 mi". `formatFare(null, null)` is "Fare not quoted".

### Site, `scripts/sync-from-admin.test.mjs`

- Strict sync fails on a response without `fare`, with `perMileBbd` of 0 or null, **and with only the old `perKmBbd` field**.
- **"sync writes lib/fare.json from the fare field":** `{ perMileBbd: 9.5 }` in, `{ "perMileBbd": 9.5 }` written.

### Real-app checks

Run the site against the real admin and database, with Kemar's own data on a temporary copy. The first spec's checks 1 to 17 still apply, with the map now in the hero and distances in miles. Check 15 is replaced by number 5 below. Added:

1. Load the page and touch nothing. The network panel shows no `locationiq.com` request and no Leaflet file.
2. Press "Pick places on the map". The map replaces the drawing with no jump in the page.
3. Tap two points. The fare shows in the card. Check it by hand: miles shown × 10, rounded up.
4. Tap "Book this ride". The form's Pickup and Drop-off are already filled. Focus is on "Full name".
5. Keyboard only, map never opened: type both places in the hero, get the fare, follow "Book this ride", fill name and phone, send.
6. Change the drop-off in the form. The fare changes in the form and in the hero card.
7. With a screen reader, the fare is read out once, not twice.
8. Submit. In the admin the booking shows the same miles and fare, and `distance_km` holds km to three decimals.
9. Set the rate to 9.50 in the admin. A new booking is priced at 9.50 at once. After a republish the site says "at $9.50 a mile".
10. On a phone: headline, Call button, hours line and the card heading are visible on arrival.
11. Lighthouse mobile on a production build: the limits in section 5.
12. Typecheck, tests and a production build pass in both repos.

## 9. Screens and states for the design check

Fable checks each against this spec and the audit in section 2. Real data, after a sync, so the phone number is real and the hours read Daily, 9:00 AM – 6:00 PM. Each at phone (375px) and desktop (1568px), in the light and the dark theme, unless marked.

Site, hero:

1. On arrival, untouched: placeholder drawing, both fields empty, "Book a ride". Nothing cut off above the fold.
2. "Loading the map…".
3. Map open, empty (state 1).
4. Pickup pin only (state 2a).
5. "Working out your fare…" (state 3).
6. Quoted: both pins, route, fare in miles, "Book this ride" (state 4).
7. Quoted from typed addresses alone, map never opened by hand.
8. Routing failed (state 5).
9. Map failed to load (state 6).
10. No address found (state 7), and same place twice (state 8).
11. Keyboard focus on the placeholder button, on a pin and on "Book this ride".
12. Quoted, at 200% browser zoom, and at 320px wide.
13. Quoted, with reduced motion on.
14. The hero with no LocationIQ token (desktop, light only).

Site, booking form:

15. Arrived from "Book this ride": Pickup and Drop-off filled at the top, focus on "Full name".
16. The fare box above the submit button, in miles.
17. Arrived with no quote: both fields empty, no map, the "Change these on the map" link.
18. Success screen with a quote, in miles.
19. Success screen without a quote.

Admin (desktop, light and dark):

20. Settings index with the Fare card: "$10 BBD per mile".
21. Fare settings page: saved, and with a validation error.
22. Booking detail with a fare and miles.
23. Booking detail with no quote.
24. Today ride card with a fare and miles, and with no quote.

## 10. Out of scope

- A second map in the booking form.
- Dark map tiles.
- A minimum fare. It is still one more setting and one line, when wanted.
- Showing km to customers, or a km and miles switch.
- Rewriting the hero copy or the trust ticks.
- The "Coming soon" bar.
- Everything already out of scope in the first spec.

## 11. Open question for Kemar

1. **The rate in public.** The fare line now says "at $10 a mile", so a customer can check the sum. Say so if you would rather show the distance and the fare only.

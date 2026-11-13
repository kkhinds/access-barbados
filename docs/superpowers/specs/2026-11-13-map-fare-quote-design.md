# Map fare quote: design spec

Date: 2026-11-13
Status: draft, awaiting Kemar's approval
Repos: `access-barbados` (site), `access-barbados-admin` (admin)

## 1. Goal

A customer on accessbim.com picks a pickup and a drop-off on a map of Barbados and sees an estimated fare before sending the request.

- Fare = road distance in km × rate per km, in BBD, rounded up to the next whole dollar.
- The test rate is $5 per km. Kemar changes it in the admin Settings, with no code change.
- The price stored on a booking is always worked out by the admin server, never taken from the browser.

## 2. User flow

1. The customer scrolls towards "Schedule a ride". The map loads just before it comes into view.
2. The map sits inside the form, full width, directly under the Pickup and Drop-off fields.
3. They tap the map. Pin **A** (pickup) drops. The Pickup field fills with the address.
4. They tap again. Pin **B** (drop-off) drops. The Drop-off field fills.
5. The route is drawn. The estimated fare and the distance appear above the submit button.
6. They can drag either pin, or type in either field and choose a suggestion. The pin, route and fare update.
7. They send the request. The success message repeats the estimate, or says the fare will be confirmed.

Rules:

- A tap fills the empty point, pickup first. When both are set, a tap does nothing. Pins are moved by dragging, or by the "Clear map pins" button.
- Typing in a field clears that point's coordinates (this is today's behaviour). Its pin, the route and the fare go away until a suggestion is chosen.
- The fare works from the text fields alone. If both fields hold a chosen suggestion, the fare shows even when the map never loaded.
- The map is optional. Name and phone are still the only required fields.
- With no `NEXT_PUBLIC_LOCATIONIQ_TOKEN` the map and the fare do not render. The form behaves as it does today.

## 3. UI states and copy

Two places carry text: the **hint** (one line above the map) and the **fare box** (above the submit row, `aria-live="polite"`).

| # | State | Hint above map | Fare box |
|---|---|---|---|
| 1 | Empty | "Tap the map to set your pickup, or type an address above." | Empty |
| 2a | Pickup only | "Now tap your drop-off." | Empty |
| 2b | Drop-off only (typed) | "Now tap your pickup." | Empty |
| 3 | Both, working | "Drag a pin to change it." | "Working out your fare…" |
| 4 | Both, quoted | "Drag a pin to change it." | **"Estimated fare: $37 BBD"** then "7.4 km by road. We'll confirm the final fare when we call." |
| 5 | Routing failed | "Drag a pin to change it." | "We couldn't work out a fare just now. Send your request and we'll confirm your fare when we call." |
| 6 | Map failed to load | The map box shows: "The map didn't load. You can still type your pickup and drop-off above." | As states 3 to 5. The fare still works from the text fields. |
| 7 | Tap finds no address | "We couldn't find a place there. Try a spot on a road or a building." No pin is dropped. | Unchanged |
| 8 | Same place twice | "Pickup and drop-off are the same place. Move one pin to get a fare." | Empty |

Other copy:

- Map label (visible, above the hint): "Or pick both places on the map".
- Button under the map, shown when at least one pin exists: "Clear map pins".
- Pin labels for screen readers: "Pickup pin" and "Drop-off pin".
- Success screen, with a quote: add "Estimated fare: $37 BBD (7.4 km). We'll confirm the final fare when we call."
- Success screen, no quote but both places given: add "We'll confirm your fare when we call."
- Mailto fallback: add a line `Estimated fare: $37 BBD (7.4 km)` when a quote exists.

State 5 covers every routing failure: network error, timeout, rate limit, no route found.

## 4. Map behaviour

- **Library:** Leaflet, latest stable, used directly. No react-leaflet.
- **Tiles:** LocationIQ raster "streets" tiles with the existing public token. The same tiles in the light and the dark theme; the frame and controls follow the theme.
- **Attribution:** always visible: "© LocationIQ © OpenStreetMap contributors", with links.
- **Lock to Barbados:** `maxBounds` of lat 12.95 to 13.42, lng −59.75 to −59.33, with `maxBoundsViscosity: 1`. `minZoom` 10. Opening view fits the island.
- **Size:** 320px high on phones, 420px from `sm` up. On a phone the page must still scroll past the map by dragging outside it.
- **Scroll wheel zoom:** off, so the page does not get stuck on the map.
- **Pins:** `L.divIcon` pins lettered **A** and **B**, at least 48×48px, draggable. Letters, not colour alone, tell them apart. (This also avoids Leaflet's broken default icon paths in bundlers.)
- **Route:** one polyline from the Directions GeoJSON geometry. After a quote, fit the map to the route.
- **Lazy load:** an `IntersectionObserver` on the `#book` section with a `rootMargin` of about 600px. Only then is the map component, with Leaflet and its CSS, loaded by dynamic `import()`. No Leaflet code or tile request before that.
- **Requests:** reverse-geocode and Directions fire on tap and on `dragend` only, never during a drag. A newer request aborts the older one (`AbortController`).
- **Tap outside the island or in the sea:** reverse geocoding returns nothing, so state 7 applies.

LocationIQ calls (builder: confirm the exact URLs against the current LocationIQ docs):

- Tiles: `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=…`
- Reverse: `https://us1.locationiq.com/v1/reverse?key=…&lat=…&lon=…&format=json`
- Directions: `https://us1.locationiq.com/v1/directions/driving/{lng},{lat};{lng},{lat}?key=…&overview=full&geometries=geojson`. Use `routes[0].distance` (metres) and `routes[0].geometry`.

## 5. Fare maths

The same rule on the site and on the server:

```
distanceKm = round(metres / 100) / 10          // one decimal: 7.4
fareBbd    = ceil( round(distanceKm × 10) × round(rate × 100) / 1000 )
```

- Integer maths on purpose. In floating point `16.6 × 15` is `249.00000000000003`, and a plain `ceil` would charge $250. (At rate 5 no route up to 60 km hits this, but a later rate can.)
- The customer can check it: the km shown × the rate, rounded up.
- A distance of 0.0 km gives no fare (state 8 on the site; no price on the server).
- A rate that is missing, not a number, or not above 0 gives no fare on either side. The default of 5 lives in the migration seed and in the site's committed `lib/fare.json`, not in code.
- No minimum fare and no per-mile option yet. Each is one more `site_settings` key, one more field on the Fare settings page and one line in this function.

## 6. Accessibility requirements

- The text fields remain the full keyboard and screen-reader path. Everything the map does can be done by typing and choosing suggestions, including getting the fare.
- The map is wrapped in a `role="group"` labelled by its visible label. The hint is linked with `aria-describedby`.
- The fare box is one `aria-live="polite"` region that is always in the DOM. It announces "Working out your fare…", the quote, or the failure message. It does not announce during a drag.
- State 7 and state 8 messages are announced politely too. They are not errors that block sending.
- Zoom buttons and pins are at least 48×48px. "Clear map pins" uses the existing button styles.
- Fare text is at least the base text size; the amount is bold and larger. All text meets the site's contrast levels in both themes. The route line has at least 3:1 contrast against the tiles.
- Focus rings are visible on the map, the zoom buttons, the pins and the clear button, in both themes.
- Reduced motion: when `prefers-reduced-motion` is set, Leaflet's `zoomAnimation`, `fadeAnimation` and `markerZoomAnimation` are off, and `fitBounds` runs with `animate: false`.
- The map never takes focus by itself and never traps it. Tab passes through it.
- At 200% zoom and at 320px wide, the map, the hint and the fare box do not overlap or cut off.

## 7. Files to change

### Site: `D:/AI Projects/access-barbados`

| File | Change |
|---|---|
| `package.json` | Add `leaflet`. Add `"test": "node --test"`. If the latest stable Leaflet is still 1.9.x, add `@types/leaflet` as a dev dependency (types only). |
| `lib/fare.json` (new) | `{ "perKmBbd": 5 }`. Overwritten by the sync at build. |
| `lib/fare.ts` (new) | Pure functions: `toKm(metres)`, `fareBbd(km, rate)`, `inBarbados(lat, lng)`. Exports the rate from `fare.json`. |
| `lib/locationiq.ts` (new) | `reverseGeocode(lat, lng, signal)` and `routeBetween(a, b, signal)`. Each returns `null` on any failure. |
| `components/FareMap.tsx` (new) | The only file that imports Leaflet. Props: pickup, drop-off, route geometry, `onPick(which, lat, lng)`, `onClear`. Renders states 1, 2, 6, 7. |
| `components/LocationAutocomplete.tsx` | Make it controlled: take `value: LocationValue` and `onChange`, and drop its own `value/lat/lng` state and the `initial` prop. The map can then fill the field. |
| `components/BookingForm.tsx` | Own the quote state. Lazy-load `FareMap`. Fetch the route when both points have coordinates. Render the fare box, the success copy and the mailto line. No change to the POST body. |
| `scripts/sync-from-admin.mjs` | Write `lib/fare.json` from `data.fare`. Treat a missing or non-positive `fare.perKmBbd` as a malformed response. |
| `app/globals.css` | Map frame, pin and fare box styles for both themes. |
| `.github/workflows/deploy.yml` | Add an `npm test` step before the build. No new variables. |

### Admin: `D:/AI Projects/access-barbados-admin`

| File | Change |
|---|---|
| `drizzle/manual/0003_fare_quote.sql` (new) | See section 8. |
| `lib/db/schema.ts` | Add `distanceKm` to `bookings`. |
| `lib/fare.ts` (new) | `toKm`, `fareBbd`, `inBarbados` (same rules as the site), plus `quoteRide(pickup, dropoff, rate)`: calls Directions with `LOCATIONIQ_SERVER_TOKEN` and a 4-second timeout, returns `{ distanceKm, priceBbd }` or `null`. Never throws. |
| `app/api/public/bookings/route.ts` | After the Turnstile check and before the insert: read the rate, call `quoteRide`, and store `price_bbd` and `distance_km` (both null when there is no quote). |
| `lib/actions/bookings.ts` | In `updateBooking`, re-run `quoteRide` when either coordinate pair changes, so the stored fare never goes stale. In the manual create, run it once. |
| `app/api/public/sync/route.ts` | Add `fare: { perKmBbd }` to the response. |
| `lib/actions/settings.ts` | Add `updateFareSettings`: Zod-checked number, above 0, at most 1000, at most two decimals. Upserts `fare_per_km_bbd`. |
| `app/admin/settings/fare/page.tsx`, `fare-form.tsx` (new) | One field, "Rate per kilometre (BBD)", built like the Contact page, with the Republish card. |
| `app/admin/settings/page.tsx` | Add a "Fare" card showing the current rate. |
| `app/admin/bookings/[id]/page.tsx` | Select and show distance and quoted fare. |
| `app/admin/today/page.tsx`, `ride-card.tsx` | Select and show distance and quoted fare. |
| `lib/format.ts` | `formatFare(price, km)`. |
| `.env.example` | Document `LOCATIONIQ_SERVER_TOKEN`. |
| `package.json` | Add `"test": "node --test"`. |

The fare maths is about 15 lines and is copied into both repos. A shared package for that is not worth it.

Tests run on Node's built-in runner, so no test dependency is added. The pure modules use relative imports, not the `@/` alias, so the runner can load them. The builder confirms at plan time that Node 26 runs the `.ts` tests directly under the current `tsconfig`.

## 8. Data and API changes

### Migration: `drizzle/manual/0003_fare_quote.sql`

```sql
-- Map fare quote: store the road distance, and seed the per-km rate.
-- Safe to re-run.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS distance_km numeric(6,1);

INSERT INTO public.site_settings (key, value)
VALUES ('fare_per_km_bbd', '5')
ON CONFLICT (key) DO NOTHING;
```

No RLS change. `site_settings` is already public-read and admin-write. The booking route writes with the service role.

### Drizzle schema

```ts
distanceKm: numeric("distance_km", { precision: 6, scale: 1 }),
```

### `POST /api/public/bookings`

- Request body: unchanged. The site sends no price and no distance.
- Response: unchanged (`{ ok: true }`). The route still does not echo booking data.
- New server step, in this order:
  1. Skip unless all four coordinates are present and both points pass `inBarbados` (lat 13.02 to 13.36, lng −59.68 to −59.40).
  2. Read `fare_per_km_bbd` from `site_settings`.
  3. Call `quoteRide`. On a result, store `price_bbd` and `distance_km`.
  4. On any failure (no token, bad rate, out of bounds, timeout, HTTP error, no route, 0.0 km), store both as null and log one line. The booking is saved either way.
- The honeypot and Turnstile exits come first, so bots cannot spend Directions calls. The existing rate limit of 8 posts per 10 minutes per IP also caps it.

### `GET /api/public/sync`

Adds one object:

```json
{ "services": [...], "contact": {...}, "fare": { "perKmBbd": 5 } }
```

`perKmBbd` is a number. If the stored value is missing or invalid, the endpoint sends `null`, and the strict site build fails rather than publishing a wrong rate.

### Environment

- Admin, new: `LOCATIONIQ_SERVER_TOKEN`. A LocationIQ token that works from a server. The existing `pk.` token may be restricted by HTTP referrer, and a server call sends none, so LocationIQ may refuse it. Set it in Vercel. Not `NEXT_PUBLIC_`.
- Site: no new variable.

## 9. How the rate reaches the site

1. Kemar edits "Rate per kilometre (BBD)" at Admin → Settings → Fare. It is saved to `site_settings.fare_per_km_bbd`.
2. **Server quotes use the new rate at once.** The booking route reads the setting on every booking.
3. Kemar clicks Republish. The site's GitHub Action runs `sync-from-admin.mjs`, which writes `lib/fare.json`.
4. The build bakes the rate into the page. **The site shows the new rate after the republish**, about 90 seconds.

Between steps 1 and 3 the site's estimate uses the old rate and the stored price uses the new one. The stored price is the true one. The site calls its figure an estimate and says the fare is confirmed by phone. The Fare settings page says: "Republish after saving so the site shows the new rate."

## 10. Release order

1. Run `0003_fare_quote.sql` in Supabase.
2. Create the server token in LocationIQ. Set `LOCATIONIQ_SERVER_TOKEN` in Vercel. Deploy the admin.
3. Deploy the site. Its strict sync needs the admin's new `fare` field, so the admin must go first.

## 11. Test plan

The builder writes each test first and watches it fail.

### Unit tests, both repos (`lib/fare.test.ts`)

Fare maths:

- `toKm(7449)` is 7.4. `toKm(7450)` is 7.5. `toKm(0)` is 0.
- `fareBbd(16.6, 15)` is 249, not 250 (the floating-point case). `fareBbd(7.4, 5)` is 37.
- `fareBbd(7.5, 5)` is 38 (37.5 rounds up).
- `fareBbd(0.1, 5)` is 1 (0.5 rounds up).
- `fareBbd(10, 5)` is 50 (an exact dollar does not round up).
- `fareBbd(7.4, 4.75)` is 36 (35.15 rounds up; a rate with cents).
- `fareBbd(0, 5)` is null. `fareBbd(7.4, 0)`, a negative rate and `NaN` are null.

Bounds check:

- Bridgetown (13.0975, −59.6130) and the airport (13.0746, −59.4925) are inside.
- Speightstown (13.2500, −59.6420) and North Point (13.3300, −59.6130) are inside.
- St Lucia (13.9, −60.97), (0, 0) and lat/lng swapped are outside.
- A null coordinate is outside.

### Unit tests, admin (`quoteRide`, with `fetch` mocked)

Server recompute:

- A 7,449 m route at rate 5 returns `{ distanceKm: 7.4, priceBbd: 37 }`.
- The request URL puts longitude before latitude, uses the driving profile and carries the server token.
- A point outside Barbados returns null and makes no fetch call.

Fallback when routing fails, each returning null without throwing:

- `LOCATIONIQ_SERVER_TOKEN` unset (and no fetch call is made).
- HTTP 401, 429 and 500.
- `fetch` rejects (network down).
- Timeout after 4 seconds.
- A 200 response with an empty `routes` array, and one that is not JSON.
- A route of 0 m.
- A rate of `""`, `"abc"`, `"0"` and `"-5"`.

Settings:

- `updateFareSettings` accepts `5` and `4.75`. It rejects `0`, `-1`, `abc`, `5.123` and `1001`.

### Unit tests, site

- `sync-from-admin.mjs`: a response without `fare`, or with `perKmBbd` of 0 or null, fails in strict mode.
- `routeBetween` and `reverseGeocode` return null on a non-200 response and on a rejected fetch.

### Real-app checks

Run the site against the real admin and database, with Kemar's own data on a temporary copy.

1. Tap two points. Pins A and B drop, both fields fill, the route draws and the fare shows.
2. Check one fare by hand: the km shown × the rate, rounded up.
3. Drag a pin. The address, route and fare update once, on release.
4. Type a pickup and choose a suggestion. Pin A moves and the fare updates.
5. Use the keyboard only: choose both places from suggestions. The fare shows. Tab passes through the map.
6. With a screen reader, the fare is announced once when it arrives.
7. Submit. In the admin, the booking shows the same distance and fare, and `price_bbd` and `distance_km` are set.
8. Post a booking with a fake high price in the body. The stored price is the server's.
9. Block the Directions call in the browser. State 5 shows, the booking still saves, and the success screen says the fare will be confirmed.
10. Unset `LOCATIONIQ_SERVER_TOKEN` on a preview. The booking saves with no price, and the admin shows "Fare not quoted".
11. Block the tile host. State 6 shows, and the fare still works from the text fields.
12. Tap the sea. State 7 shows and no pin drops.
13. Change the rate to 6 in the admin. A new booking is priced at 6 straight away. After a republish the site shows fares at 6.
14. On a phone: the page scrolls past the map, pins drag, and targets are easy to hit.
15. Throttle to slow 3G and reload at the top of the page. No Leaflet script or tile request until the booking section is near.
16. Edit a booking's drop-off in the admin. The distance and fare update.
17. Typecheck, tests and a production build pass in both repos.

## 12. Screens and states for the design check

After the build, each of these is checked against this spec, with real data, in the light and the dark theme, at phone (375px) and desktop widths.

Site, booking section:

1. State 1, empty map.
2. State 2a, pickup pin only.
3. State 3, "Working out your fare…".
4. State 4, both pins, route and quote.
5. State 5, routing failed.
6. State 6, map failed to load.
7. State 7, no address found.
8. State 8, same place twice.
9. Success screen with a quote.
10. Success screen without a quote.
11. State 4 with keyboard focus on a pin and on a zoom button.
12. State 4 at 200% browser zoom.
13. State 4 with reduced motion on (no animated zoom).

Admin:

14. Settings index with the Fare card.
15. Fare settings page: saved, and with a validation error.
16. Booking detail with a distance and a quoted fare.
17. Booking detail with no quote ("Fare not quoted").
18. Today ride card with a distance and a fare.
19. Today ride card with no quote.

## 13. Out of scope

- Minimum fare, per-mile pricing, flat fares, zones, time-of-day or per-passenger pricing, return trips and multiple stops.
- A manual price override in the admin.
- The fare in the notification email.
- Dark map tiles.
- Paying online.
- Using the customer's current location (GPS).
- Changing the admin's own `LocationAutocomplete` or adding a map to the admin.
- A no-JavaScript booking path. Today's mailto fallback itself needs JavaScript; this spec does not change that.
- Backfilling a distance or fare for old bookings.

## 14. Open questions for Kemar

1. **Final rate.** The site launches at $5 per km. What is the real rate, and when?
2. **One rate for all?** Is the fare the same for every service type, wheelchair or not, and for any number of passengers?
3. **LocationIQ plan.** Map tiles, tap lookups and routes all count against the daily request limit. Which plan is the account on, and is the limit enough for launch?
4. **Server token.** You need to create the second LocationIQ token and add it to Vercel as `LOCATIONIQ_SERVER_TOKEN`. Until then every booking saves with no price.

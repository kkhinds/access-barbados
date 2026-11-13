import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { reverseGeocode, routeBetween } from "./locationiq.ts";

const signal = new AbortController().signal;
let calls: string[] = [];
const respond = (body: unknown, status = 200) => {
  globalThis.fetch = (async (url: string) => {
    calls.push(String(url));
    return new Response(typeof body === "string" ? body : JSON.stringify(body), { status });
  }) as typeof fetch;
};

beforeEach(() => {
  calls = [];
  process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN = "pk.test";
});

test("reverseGeocode returns the display name for a Barbados place", async () => {
  respond({ display_name: "Spry Street, Bridgetown, Saint Michael, BB11015, Barbados", address: { country_code: "bb" } });
  assert.equal(await reverseGeocode(13.0975, -59.613, signal), "Spry Street, Bridgetown, Saint Michael, BB11015, Barbados");
  assert.match(calls[0], /^https:\/\/us1\.locationiq\.com\/v1\/reverse\?key=pk\.test&lat=13\.0975&lon=-59\.613&format=json$/);
});

test("reverseGeocode returns null for a place outside Barbados", async () => {
  respond({ display_name: "Castries, Saint Lucia", address: { country_code: "lc" } });
  assert.equal(await reverseGeocode(13.3, -59.4, signal), null);
});

test("reverseGeocode returns null on 'Unable to geocode' (404), other errors and a rejected fetch", async () => {
  respond({ error: "Unable to geocode" }, 404);
  assert.equal(await reverseGeocode(13.2, -59.2, signal), null);
  respond("oops", 500);
  assert.equal(await reverseGeocode(13.2, -59.2, signal), null);
  globalThis.fetch = (async () => { throw new TypeError("network down"); }) as typeof fetch;
  assert.equal(await reverseGeocode(13.2, -59.2, signal), null);
});

test("routeBetween returns metres and a lat,lng line from the GeoJSON geometry", async () => {
  respond({
    code: "Ok",
    routes: [{ distance: 7449.3, geometry: { type: "LineString", coordinates: [[-59.61, 13.09], [-59.5, 13.07]] } }],
  });
  const r = await routeBetween({ lat: 13.09, lng: -59.61 }, { lat: 13.07, lng: -59.5 }, signal);
  assert.deepEqual(r, { metres: 7449.3, line: [[13.09, -59.61], [13.07, -59.5]] });
  // Longitude before latitude, driving profile, full GeoJSON geometry.
  assert.equal(
    calls[0],
    "https://us1.locationiq.com/v1/directions/driving/-59.61,13.09;-59.5,13.07?key=pk.test&overview=full&geometries=geojson",
  );
});

test("routeBetween returns null on non-200, a rejected fetch, no routes and bad JSON", async () => {
  const a = { lat: 13.09, lng: -59.61 }, b = { lat: 13.07, lng: -59.5 };
  for (const status of [401, 429, 500]) {
    respond({ error: "x" }, status);
    assert.equal(await routeBetween(a, b, signal), null);
  }
  globalThis.fetch = (async () => { throw new TypeError("network down"); }) as typeof fetch;
  assert.equal(await routeBetween(a, b, signal), null);
  respond({ code: "NoRoute", routes: [] });
  assert.equal(await routeBetween(a, b, signal), null);
  respond("not json");
  assert.equal(await routeBetween(a, b, signal), null);
});

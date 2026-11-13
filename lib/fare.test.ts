import { test } from "node:test";
import assert from "node:assert/strict";
import { toMiles, fareBbd, inBarbados } from "./fare.ts";

test("toMiles rounds metres to a tenth of a mile", () => {
  assert.equal(toMiles(1609.344), 1);
  assert.equal(toMiles(7449), 4.6);
  assert.equal(toMiles(7500), 4.7);
  assert.equal(toMiles(16093.44), 10);
});

test("toMiles gives 0 under about 80 metres", () => {
  assert.equal(toMiles(0), 0);
  assert.equal(toMiles(80), 0);
  assert.equal(toMiles(81), 0.1);
});

test("a 10.0-mile trip at $10 is exactly $100", () => {
  assert.equal(fareBbd(toMiles(16093.44), 10), 100);
  assert.equal(fareBbd(10, 10), 100);
});

test("fareBbd rounds up to the next whole dollar", () => {
  assert.equal(fareBbd(4.6, 10), 46);
  assert.equal(fareBbd(0.1, 10), 1);
  assert.equal(fareBbd(4.6, 9.5), 44); // 43.7
  assert.equal(fareBbd(4.7, 9.5), 45); // 44.65
});

test("fareBbd does not overcharge from floating-point error", () => {
  assert.equal(fareBbd(4.4, 12.5), 55); // float: 55.00000000000001 -> 56
  assert.equal(fareBbd(16.6, 15), 249); // float: 249.00000000000003 -> 250
});

test("fareBbd gives no fare for zero distance or a bad rate", () => {
  assert.equal(fareBbd(0, 5), null);
  assert.equal(fareBbd(7.4, 0), null);
  assert.equal(fareBbd(7.4, -5), null);
  assert.equal(fareBbd(7.4, NaN), null);
  assert.equal(fareBbd(NaN, 5), null);
});

test("inBarbados", () => {
  assert.ok(inBarbados(13.0975, -59.613)); // Bridgetown
  assert.ok(inBarbados(13.0746, -59.4925)); // airport
  assert.ok(inBarbados(13.25, -59.642)); // Speightstown
  assert.ok(inBarbados(13.33, -59.613)); // North Point
  assert.ok(!inBarbados(13.9, -60.97)); // St Lucia
  assert.ok(!inBarbados(0, 0));
  assert.ok(!inBarbados(-59.613, 13.0975)); // swapped
  assert.ok(!inBarbados(null, -59.613));
  assert.ok(!inBarbados(13.0975, null));
});

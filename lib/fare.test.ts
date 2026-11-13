import { test } from "node:test";
import assert from "node:assert/strict";
import { toKm, fareBbd, inBarbados } from "./fare.ts";

test("toKm rounds metres to one decimal", () => {
  assert.equal(toKm(7449), 7.4);
  assert.equal(toKm(7450), 7.5);
  assert.equal(toKm(0), 0);
});

test("fareBbd rounds up to the next whole dollar with integer maths", () => {
  assert.equal(fareBbd(16.6, 15), 249); // float would give 249.00000000000003 -> 250
  assert.equal(fareBbd(7.4, 5), 37);
  assert.equal(fareBbd(7.5, 5), 38);
  assert.equal(fareBbd(0.1, 5), 1);
  assert.equal(fareBbd(10, 5), 50);
  assert.equal(fareBbd(7.4, 4.75), 36);
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

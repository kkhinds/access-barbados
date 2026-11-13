// Fare rule. The admin's lib/fare.ts has the same rule: keep the two in step.
// lib/fare.json is overwritten by scripts/sync-from-admin.mjs at build.
import fare from "./fare.json" with { type: "json" };

export const FARE_RATE: number = fare.perMileBbd;

/** Metres to miles, one decimal: 7449 -> 4.6. A tenth of a mile is 160.9344 m. Under ~80 m is 0. */
export const toMiles = (metres: number) => Math.round(Math.round(metres) / 160.9344) / 10;

/**
 * miles x rate, rounded up to the next whole BBD. Integer maths on purpose:
 * tenths x cents is a whole number, so the ceil is the only rounding. In floating
 * point 4.4 * 12.5 is 55.00000000000001 and a plain ceil charges 56.
 * No fare for a zero distance or a rate that is missing, NaN or not above 0.
 */
export function fareBbd(miles: number, rate: number): number | null {
  if (!(miles > 0) || !(rate > 0)) return null;
  return Math.ceil((Math.round(miles * 10) * Math.round(rate * 100)) / 1000);
}

/** The rate as the customer reads it: $10, or $9.50. */
export const rateText = (rate: number) => `$${Number.isInteger(rate) ? rate : rate.toFixed(2)}`;

/** The island, with a little sea. Same box the admin checks before it quotes. */
export function inBarbados(lat: number | null, lng: number | null): boolean {
  return lat != null && lng != null && lat >= 13.02 && lat <= 13.36 && lng >= -59.68 && lng <= -59.4;
}

// Fare rule. The admin's lib/fare.ts has the same rule: keep the two in step.
// lib/fare.json is overwritten by scripts/sync-from-admin.mjs at build.
import fare from "./fare.json" with { type: "json" };

export const FARE_RATE: number = fare.perKmBbd;

/** Metres to km, one decimal: 7449 -> 7.4. */
export const toKm = (metres: number) => Math.round(metres / 100) / 10;

/**
 * km x rate, rounded up to the next whole BBD. Integer maths on purpose:
 * in floating point 16.6 * 15 is 249.00000000000003 and a plain ceil charges 250.
 * No fare for a zero distance or a rate that is missing, NaN or not above 0.
 */
export function fareBbd(km: number, rate: number): number | null {
  if (!(km > 0) || !(rate > 0)) return null;
  return Math.ceil((Math.round(km * 10) * Math.round(rate * 100)) / 1000);
}

/** The island, with a little sea. Same box the admin checks before it quotes. */
export function inBarbados(lat: number | null, lng: number | null): boolean {
  return lat != null && lng != null && lat >= 13.02 && lat <= 13.36 && lng >= -59.68 && lng <= -59.4;
}

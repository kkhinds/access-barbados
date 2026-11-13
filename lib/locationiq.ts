// LocationIQ calls for the fare map. Each returns null on any failure.
// URLs and response shapes checked against docs.locationiq.com on 2026-11-13.
const BASE = "https://us1.locationiq.com/v1";
const TIMEOUT_MS = 8000;

export type LatLng = { lat: number; lng: number };

// Read at call time; Next inlines NEXT_PUBLIC_ values at build.
const token = () => process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN ?? "";

async function getJson(url: string, signal: AbortSignal): Promise<any> {
  try {
    const res = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)]) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** Address for a point in Barbados. A tap in the sea gets a 404 "Unable to geocode". */
export async function reverseGeocode(lat: number, lng: number, signal: AbortSignal): Promise<string | null> {
  const d = await getJson(`${BASE}/reverse?key=${token()}&lat=${lat}&lon=${lng}&format=json`, signal);
  return d?.address?.country_code === "bb" && typeof d.display_name === "string" ? d.display_name : null;
}

/** Driving route: road distance in metres, and the line as [lat, lng] pairs for Leaflet. */
export async function routeBetween(
  a: LatLng,
  b: LatLng,
  signal: AbortSignal,
): Promise<{ metres: number; line: [number, number][] } | null> {
  const d = await getJson(
    `${BASE}/directions/driving/${a.lng},${a.lat};${b.lng},${b.lat}?key=${token()}&overview=full&geometries=geojson`,
    signal,
  );
  const route = d?.routes?.[0];
  const coords = route?.geometry?.coordinates;
  if (!Number.isFinite(route?.distance) || !Array.isArray(coords)) return null;
  return { metres: route.distance, line: coords.map(([lng, lat]: [number, number]) => [lat, lng]) };
}

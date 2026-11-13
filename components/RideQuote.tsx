"use client";

// One piece of state for the ride: the two places and the fare. The booking
// section's quote card and its form are two views of it: the card sets the places
// (the form does, with no map token), and the form sends them with the fare.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { FARE_RATE, fareBbd, inBarbados, toMiles } from "@/lib/fare";
import { reverseGeocode, routeBetween } from "@/lib/locationiq";
import type { LocationValue } from "./LocationAutocomplete";
import type { Which } from "./FareMap";

// Without a LocationIQ token there is no map and no fare.
const LOCATIONIQ_TOKEN = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN ?? "";

type Quote =
  | null
  | { state: "working" }
  | { state: "failed" }
  | { state: "same" }
  | { state: "ok"; miles: number; fare: number; line: [number, number][] };

const EMPTY: LocationValue = { name: "", lat: null, lng: null };

/** "$46 BBD", for the success screen and the mailto line. Distance and rate stay off customer screens. */
export const fareLine = (q: { fare: number }) => `$${q.fare} BBD`;

const FAILED = "We couldn't work out a fare just now. Send your request and we'll confirm your fare when we call.";
const NO_PLACE = "We couldn't find a place there. Try a spot on a road or a building.";
const SAME = "Pickup and drop-off are the same place. Move one pin to get a fare.";

type RideQuote = {
  pickup: LocationValue;
  dropoff: LocationValue;
  quote: Quote;
  /** State 7: a map tap found no address. */
  noPlace: boolean;
  /** True once the customer asks for the map or chooses a typed suggestion. */
  mapWanted: boolean;
  wantMap: () => void;
  typePoint: (which: Which, v: LocationValue) => void;
  mapPick: (which: Which, lat: number, lng: number) => void;
  clearPins: () => void;
};

const Ctx = createContext<RideQuote | null>(null);

export const useRideQuote = () => useContext(Ctx)!;

export function RideQuoteProvider({ children }: { children: ReactNode }) {
  const [pickup, setPickup] = useState<LocationValue>(EMPTY);
  const [dropoff, setDropoff] = useState<LocationValue>(EMPTY);
  const [quote, setQuote] = useState<Quote>(null);
  const [noPlace, setNoPlace] = useState(false);
  const [mapWanted, setMapWanted] = useState(false);
  const lookups = useRef<Partial<Record<Which, AbortController>>>({});

  // Quote whenever both points have coordinates, from the map or the fields.
  useEffect(() => {
    if (!LOCATIONIQ_TOKEN) return;
    if (pickup.lat == null || pickup.lng == null || dropoff.lat == null || dropoff.lng == null) {
      setQuote(null);
      return;
    }
    const ctrl = new AbortController();
    setQuote({ state: "working" });
    routeBetween({ lat: pickup.lat, lng: pickup.lng }, { lat: dropoff.lat, lng: dropoff.lng }, ctrl.signal).then(
      (r) => {
        if (ctrl.signal.aborted) return;
        if (!r) return setQuote({ state: "failed" });
        const miles = toMiles(r.metres);
        if (miles === 0) return setQuote({ state: "same" });
        const fare = fareBbd(miles, FARE_RATE);
        setQuote(fare == null ? { state: "failed" } : { state: "ok", miles, fare, line: r.line });
      },
    );
    return () => ctrl.abort();
  }, [pickup.lat, pickup.lng, dropoff.lat, dropoff.lng]);

  const setPoint = (which: Which) => (which === "pickup" ? setPickup : setDropoff);

  function typePoint(which: Which, v: LocationValue) {
    lookups.current[which]?.abort();
    setNoPlace(false);
    // A chosen suggestion loads the map, so it can show the pin.
    if (v.lat != null) setMapWanted(true);
    setPoint(which)(v);
  }

  // A map tap or a pin's dragend. A newer lookup for the same pin aborts the older one.
  async function mapPick(which: Which, lat: number, lng: number) {
    lookups.current[which]?.abort();
    const ctrl = new AbortController();
    lookups.current[which] = ctrl;
    const name = inBarbados(lat, lng) ? await reverseGeocode(lat, lng, ctrl.signal) : null;
    if (ctrl.signal.aborted) return;
    setNoPlace(!name);
    // No address: a fresh object puts a dragged pin back where it was.
    setPoint(which)((p) => (name ? { name, lat, lng } : { ...p }));
  }

  function clearPins() {
    lookups.current.pickup?.abort();
    lookups.current.dropoff?.abort();
    setNoPlace(false);
    setPickup(EMPTY);
    setDropoff(EMPTY);
  }

  // The one live region on the page. The two fare boxes are not live, so a
  // fare is read out once. Typing hints are not announced.
  const announce = noPlace
    ? NO_PLACE
    : quote?.state === "same"
      ? SAME
      : quote?.state === "working"
        ? "Working out your fare…"
        : quote?.state === "failed"
          ? FAILED
          : quote?.state === "ok"
            ? `Estimated fare: $${quote.fare} BBD.`
            : "";

  return (
    <Ctx
      value={{ pickup, dropoff, quote, noPlace, mapWanted, wantMap: () => setMapWanted(true), typePoint, mapPick, clearPins }}
    >
      {children}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </Ctx>
  );
}

/** The map hint, states 1, 2, 3, 7 and 8. */
export function hintFor({ pickup, dropoff, quote, noPlace }: RideQuote) {
  if (noPlace) return NO_PLACE;
  if (quote?.state === "same") return SAME;
  if (pickup.lat != null && dropoff.lat != null) return "Drag a pin to change it.";
  if (pickup.lat != null) return "Now tap your drop-off.";
  if (dropoff.lat != null) return "Now tap your pickup.";
  return "Type your pickup and drop-off, or pick them on the map.";
}

/** The visible fare text, shared by the quote card and the form. Not a live region. */
export function FareSummary({ quote }: { quote: Quote }) {
  if (quote?.state === "working") return <p>Working out your fare…</p>;
  if (quote?.state === "failed") return <p>{FAILED}</p>;
  if (quote?.state !== "ok") return null;
  return (
    <>
      <p className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-mist-100">Estimated fare: ${quote.fare} BBD</p>
      <p className="mt-1">
        We&apos;ll confirm the final fare when we call.
      </p>
    </>
  );
}

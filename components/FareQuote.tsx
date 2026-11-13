"use client";

// The hero's quote card. The typed path comes first; the map is optional and
// loads only when asked for (see FareMap.tsx).
import { useEffect, useRef, useState, type ComponentType } from "react";
import { CONTACT } from "@/lib/contact";
import LocationAutocomplete from "./LocationAutocomplete";
import type { FareMapProps } from "./FareMap";
import { FareSummary, hintFor, useRideQuote } from "./RideQuote";

/**
 * Bring the form card to the top, so the carried-over places and "Full name" are
 * on screen together, and focus "Full name". Without the form (success screen),
 * the plain #book jump runs. The CSS scroll-behavior keeps reduced motion instant.
 */
function toForm(e: React.MouseEvent) {
  const name = document.getElementById("name") as HTMLInputElement | null;
  if (!name?.form) return;
  e.preventDefault();
  name.form.scrollIntoView();
  name.focus({ preventScroll: true });
}

export default function FareQuote() {
  const rq = useRideQuote();
  const { pickup, dropoff, quote, mapWanted, wantMap, typePoint, mapPick, clearPins } = rq;
  const [FareMap, setFareMap] = useState<ComponentType<FareMapProps> | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const focusMap = useRef(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapWanted) return;
    import("./FareMap").then(
      (m) => setFareMap(() => m.default),
      () => setMapFailed(true),
    );
  }, [mapWanted]);

  // Only a keyboard press on the placeholder button moves focus to the map.
  useEffect(() => {
    if (!FareMap || !focusMap.current) return;
    focusMap.current = false;
    box.current?.querySelector<HTMLElement>(".leaflet-container")?.focus();
  }, [FareMap]);

  const hasPickup = pickup.lat != null;
  const hasDropoff = dropoff.lat != null;

  return (
    <div id="quote" className="card shadow-soft">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-900 dark:text-mist-100">
        See your fare before you book
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <LocationAutocomplete
          id="quotePickup"
          label="Pickup"
          placeholder="Home, hospital, hotel…"
          value={pickup}
          onChange={(v) => typePoint("pickup", v)}
        />
        <LocationAutocomplete
          id="quoteDropoff"
          label="Drop-off"
          placeholder="Destination"
          value={dropoff}
          onChange={(v) => typePoint("dropoff", v)}
        />
      </div>

      <div role="group" aria-labelledby="quote-map-label" aria-describedby="quote-map-hint" className="mt-4">
        <p id="quote-map-label" className="field-label mb-1">
          Or pick both places on the map
        </p>
        {!mapFailed && (
          <p id="quote-map-hint" className="mb-2 text-base text-navy-700 dark:text-mist-100/85">
            {hintFor(rq)}
          </p>
        )}
        <div
          ref={box}
          // isolate: Leaflet's panes use z-index 400+; keep them under the header, the action bar and the suggestion lists.
          className="isolate h-[280px] overflow-hidden rounded-xl border-2 border-navy-600/40 bg-mist-100
            dark:border-navy-700 dark:bg-navy-900"
        >
          {mapFailed ? (
            <p id="quote-map-hint" className="flex h-full items-center justify-center p-6 text-center text-base text-navy-700 dark:text-mist-100/85">
              The map didn&apos;t load. You can still type your pickup and drop-off above.
            </p>
          ) : FareMap ? (
            <FareMap
              pickup={pickup}
              dropoff={dropoff}
              route={quote?.state === "ok" ? quote.line : null}
              onPick={mapPick}
              onFail={() => setMapFailed(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
              <IslandOutline />
              {mapWanted ? (
                <p className="text-base font-semibold text-navy-800 dark:text-mist-100">Loading the map…</p>
              ) : (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={(e) => {
                    focusMap.current = e.currentTarget.matches(":focus-visible");
                    wantMap();
                  }}
                >
                  Pick places on the map
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* The two tallest states sit invisibly in the same grid cell, so the box keeps
          their height at every width and the button below never moves. */}
      <div className="mt-4 grid rounded-xl border-2 border-brand-700/40 bg-brand-50 px-4 py-3 text-base text-navy-800
        dark:border-sky-500/50 dark:bg-navy-900 dark:text-mist-100 *:[grid-area:1/1]">
        <div className="invisible"><FareSummary quote={{ state: "failed" }} /></div>
        <div className="invisible"><FareSummary quote={{ state: "ok", miles: 0, fare: 999, line: [] }} /></div>
        <div><FareSummary quote={quote} /></div>
      </div>

      <a href="#book" onClick={toForm} className="btn-primary mt-4 w-full">
        {hasPickup && hasDropoff ? "Book this ride" : "Book a ride"}
      </a>

      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base text-navy-700 dark:text-mist-100/85">
          Prefer to talk? Call{" "}
          <a
            href={`tel:${CONTACT.phoneTel}`}
            className="font-semibold text-brand-800 underline underline-offset-2 decoration-2 hover:decoration-gold-500
              dark:text-brand-300 dark:hover:decoration-gold-400"
          >
            {CONTACT.phoneDisplay}
          </a>
        </p>
        {!mapFailed && (hasPickup || hasDropoff) && (
          <button type="button" onClick={clearPins} className="btn-secondary w-full sm:w-auto">
            Clear map pins
          </button>
        )}
      </div>
    </div>
  );
}

// Barbados, hand-simplified from coastal landmarks (North Point, Ragged Point,
// South Point, Bridgetown, Speightstown). Decorative; theme colours.
function IslandOutline() {
  return (
    <svg viewBox="0 0 244 304" className="h-36 w-auto" aria-hidden>
      <path
        d="M43 5 62 22 80 40 100 70 125 105 145 130 175 155 234 177 230 200 220 235 195 260 165 280 135 296 112 278 70 270 48 262 35 240 20 190 20 153 15 90 8 40 20 15Z"
        className="fill-brand-100 stroke-brand-700 dark:fill-navy-800 dark:stroke-sky-500"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

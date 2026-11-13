"use client";

// The only file that imports Leaflet. The booking section's quote card (FareQuote) loads it
// with a dynamic import() only when the customer presses "Pick places on the map"
// or chooses a typed suggestion, so no Leaflet code, CSS or tile request happens
// before that.
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LocationValue } from "./LocationAutocomplete";
import { fitPoints } from "@/lib/fare";

export type Which = "pickup" | "dropoff";

export type FareMapProps = {
  pickup: LocationValue;
  dropoff: LocationValue;
  /** Route as [lat, lng] pairs, or null when there is no quote. */
  route: [number, number][] | null;
  /** The route lookup failed. */
  failed: boolean;
  /** A tap on the map (the empty point, pickup first) or a pin's dragend. */
  onPick: (which: Which, lat: number, lng: number) => void;
  /** The tiles could not load. */
  onFail: () => void;
};

const TOKEN = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN ?? "";
const ISLAND = L.latLngBounds([13.04, -59.66], [13.34, -59.42]);
const LOCK = L.latLngBounds([12.95, -59.75], [13.42, -59.33]);
const PINS = [
  ["pickup", "A", "Pickup pin"],
  ["dropoff", "B", "Drop-off pin"],
] as const;

// Keep the island and pins clear of the zoom buttons (60×108px with margin, top
// left) and the attribution (up to 36px tall on a phone, bottom). A route adds
// half a pin (24px) so the whole pin shows.
const VIEW_PAD: L.FitBoundsOptions = { paddingTopLeft: [60, 8], paddingBottomRight: [8, 36] };
const ROUTE_PAD: L.FitBoundsOptions = { paddingTopLeft: [84, 32], paddingBottomRight: [32, 60] };

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function FareMap({ pickup, dropoff, route, failed, onPick, onFail }: FareMapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const pins = useRef<Record<Which, L.Marker | null>>({ pickup: null, dropoff: null });
  const line = useRef<L.Polyline | null>(null);
  // Leaflet handlers are bound once, so they read the latest props from here.
  const latest = useRef({ pickup, dropoff, onPick, onFail });
  useEffect(() => {
    latest.current = { pickup, dropoff, onPick, onFail };
  });

  useEffect(() => {
    const still = reducedMotion();
    const m = L.map(el.current!, {
      maxBounds: LOCK,
      maxBoundsViscosity: 1,
      minZoom: 10,
      // Whole zooms leave the island small in the frame; quarter steps let it fill.
      zoomSnap: 0.25,
      scrollWheelZoom: false,
      zoomAnimation: !still,
      fadeAnimation: !still,
      markerZoomAnimation: !still,
    });
    m.fitBounds(ISLAND, { ...VIEW_PAD, animate: false });

    let anyTile = false;
    L.tileLayer(`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${TOKEN}`, {
      maxZoom: 18,
      attribution:
        '<a href="https://locationiq.com/?ref=maps" target="_blank" rel="noopener">© LocationIQ</a> ' +
        '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a>',
    })
      .on("tileload", () => (anyTile = true))
      .on("tileerror", () => !anyTile && latest.current.onFail())
      .addTo(m);

    m.on("click", (e: L.LeafletMouseEvent) => {
      const { pickup, dropoff, onPick } = latest.current;
      const which = pickup.lat == null ? "pickup" : dropoff.lat == null ? "dropoff" : null;
      if (which) onPick(which, e.latlng.lat, e.latlng.lng);
    });

    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      pins.current = { pickup: null, dropoff: null };
      line.current = null;
    };
  }, []);

  // Pins follow the field values. RideQuoteProvider passes a fresh object to put a
  // pin back when a drag lands where no address is found.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    for (const [which, letter, label] of PINS) {
      const v = which === "pickup" ? pickup : dropoff;
      let pin = pins.current[which];
      if (v.lat == null || v.lng == null) {
        pin?.remove();
        pins.current[which] = null;
      } else if (pin) {
        pin.setLatLng([v.lat, v.lng]);
      } else {
        pin = L.marker([v.lat, v.lng], {
          draggable: true,
          keyboard: true,
          title: label,
          icon: L.divIcon({
            className: `fare-pin fare-pin-${letter.toLowerCase()}`,
            html: `<span aria-hidden="true">${letter}</span>`,
            iconSize: [48, 48],
            iconAnchor: [24, 24],
          }),
        }).addTo(m);
        pin.getElement()?.setAttribute("aria-label", label);
        // Requests fire on dragend only, never during the drag.
        pin.on("dragend", (e) => {
          const p = (e.target as L.Marker).getLatLng();
          latest.current.onPick(which, p.lat, p.lng);
        });
        pins.current[which] = pin;
      }
    }
  }, [pickup, dropoff]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    line.current?.remove();
    line.current = null;
    // Brand blue: over 3:1 against the light streets tiles. The dark theme overrides
    // it with the light blue in globals.css, over the darkened tiles.
    if (route) line.current = L.polyline(route, { color: "#1166cc", weight: 6, opacity: 0.95, interactive: false }).addTo(m);
    const pts = fitPoints(route, failed, latest.current.pickup, latest.current.dropoff);
    if (pts) m.fitBounds(L.latLngBounds(pts), { ...ROUTE_PAD, animate: !reducedMotion() });
  }, [route, failed]);

  return <div ref={el} className="fare-map h-full w-full" />;
}

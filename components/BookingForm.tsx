"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { CONTACT } from "@/lib/contact";
import { FARE_RATE, fareBbd, inBarbados, toKm } from "@/lib/fare";
import { reverseGeocode, routeBetween } from "@/lib/locationiq";
import TurnstileWidget from "./TurnstileWidget";
import LocationAutocomplete, { type LocationValue } from "./LocationAutocomplete";
import type { FareMapProps, Which } from "./FareMap";
import servicesData from "@/lib/services.json";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
// Without a LocationIQ token the map and the fare do not render.
const LOCATIONIQ_TOKEN = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN ?? "";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: LocationValue = { name: "", lat: null, lng: null };

type Quote =
  | null
  | { state: "working" }
  | { state: "failed" }
  | { state: "same" }
  | { state: "ok"; km: number; fare: number; line: [number, number][] };

/** What the success screen says about the fare. */
type Sent = { km: number; fare: number } | "unquoted" | null;

const fareLine = (q: { km: number; fare: number }) => `$${q.fare} BBD (${q.km.toFixed(1)} km)`;

// Labels come from lib/services.json, which the CI sync script overwrites from
// the admin's /api/public/sync endpoint before each build.
const serviceOptions = (servicesData as Array<{ slug: string; label: string }>).map(
  (s) => s.label,
);

export default function BookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [pickup, setPickup] = useState<LocationValue>(EMPTY);
  const [dropoff, setDropoff] = useState<LocationValue>(EMPTY);
  const [quote, setQuote] = useState<Quote>(null);
  const [noPlace, setNoPlace] = useState(false);
  const [sent, setSent] = useState<Sent>(null);
  const [FareMap, setFareMap] = useState<ComponentType<FareMapProps> | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const lookups = useRef<Partial<Record<Which, AbortController>>>({});

  // Load the map (Leaflet, its CSS, then tiles) only when the booking section is near.
  useEffect(() => {
    if (!LOCATIONIQ_TOKEN || !sectionRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        import("./FareMap").then(
          (m) => setFareMap(() => m.default),
          () => setMapFailed(true),
        );
      },
      { rootMargin: "600px" },
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

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
        const km = toKm(r.metres);
        if (km === 0) return setQuote({ state: "same" });
        const fare = fareBbd(km, FARE_RATE);
        setQuote(fare == null ? { state: "failed" } : { state: "ok", km, fare, line: r.line });
      },
    );
    return () => ctrl.abort();
  }, [pickup.lat, pickup.lng, dropoff.lat, dropoff.lng]);

  const setPoint = (which: Which, v: LocationValue) => (which === "pickup" ? setPickup : setDropoff)(v);

  function typePoint(which: Which, v: LocationValue) {
    lookups.current[which]?.abort();
    setNoPlace(false);
    setPoint(which, v);
  }

  // A map tap or a pin's dragend. A newer lookup for the same pin aborts the older one.
  async function mapPick(which: Which, lat: number, lng: number) {
    lookups.current[which]?.abort();
    const ctrl = new AbortController();
    lookups.current[which] = ctrl;
    const name = inBarbados(lat, lng) ? await reverseGeocode(lat, lng, ctrl.signal) : null;
    if (ctrl.signal.aborted) return;
    if (name) {
      setNoPlace(false);
      setPoint(which, { name, lat, lng });
    } else {
      setNoPlace(true);
      // A fresh object puts a dragged pin back where it was.
      (which === "pickup" ? setPickup : setDropoff)((p) => ({ ...p }));
    }
  }

  function clearPins() {
    lookups.current.pickup?.abort();
    lookups.current.dropoff?.abort();
    setNoPlace(false);
    setPickup(EMPTY);
    setDropoff(EMPTY);
  }

  function succeed(form: HTMLFormElement) {
    setSent(
      !LOCATIONIQ_TOKEN
        ? null
        : quote?.state === "ok"
          ? { km: quote.km, fare: quote.fare }
          : pickup.name.trim() && dropoff.name.trim()
            ? "unquoted"
            : null,
    );
    setStatus("success");
    form.reset();
    clearPins();
  }

  const hasPickup = pickup.lat != null;
  const hasDropoff = dropoff.lat != null;
  const hint = noPlace
    ? "We couldn't find a place there. Try a spot on a road or a building."
    : quote?.state === "same"
      ? "Pickup and drop-off are the same place. Move one pin to get a fare."
      : hasPickup && hasDropoff
        ? "Drag a pin to change it."
        : hasPickup
          ? "Now tap your drop-off."
          : hasDropoff
            ? "Now tap your pickup."
            : "Tap the map to set your pickup, or type an address above.";
  // States 7 and 8 are announced; the other hints are not, so typing stays quiet.
  const announce = noPlace || quote?.state === "same" ? hint : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const get = (k: string) => (formData.get(k)?.toString() ?? "").trim();

    // Bot honeypot: silently succeed without doing anything.
    if (get("company")) {
      setStatus("success");
      form.reset();
      return;
    }

    const name = get("name");
    const phone = get("phone");
    if (!name || !phone) {
      setStatus("error");
      setErrorMsg("Please include your name and phone number so we can reach you.");
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus("error");
      setErrorMsg(
        "Please complete the verification check below the form, then try again.",
      );
      return;
    }

    const mobility = formData.getAll("mobility").map((v) => v.toString());
    const endpoint = process.env.NEXT_PUBLIC_BOOKING_ENDPOINT;

    // Preferred path: POST to the admin API when configured (real persistence).
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: get("company"),
            name,
            phone,
            email: get("email"),
            pickupDate: get("pickupDate"),
            pickupTime: get("pickupTime"),
            pickupLocation: pickup.name,
            pickupLocationLat: pickup.lat,
            pickupLocationLng: pickup.lng,
            dropoffLocation: dropoff.name,
            dropoffLocationLat: dropoff.lat,
            dropoffLocationLng: dropoff.lng,
            serviceType: get("serviceType"),
            passengers: get("passengers"),
            mobility,
            notes: get("notes"),
            turnstileToken,
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "Your request didn't go through. Please try again or call us.");
        }

        succeed(form);
        setTurnstileToken("");
        return;
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please call us.");
        return;
      }
    }

    // Fallback path: no backend configured yet — open the visitor's email client.
    const lines = [
      `Name: ${name}`,
      `Phone: ${phone}`,
      get("email") && `Email: ${get("email")}`,
      get("pickupDate") && `Pickup date: ${get("pickupDate")}`,
      get("pickupTime") && `Pickup time: ${get("pickupTime")}`,
      pickup.name && `Pickup: ${pickup.name}`,
      dropoff.name && `Drop-off: ${dropoff.name}`,
      quote?.state === "ok" && `Estimated fare: ${fareLine(quote)}`,
      get("serviceType") && `Service: ${get("serviceType")}`,
      get("passengers") && `Passengers: ${get("passengers")}`,
      mobility.length > 0 && `Mobility needs: ${mobility.join(", ")}`,
      get("notes") && `Notes: ${get("notes")}`,
    ].filter(Boolean);

    const subject = `Ride request from ${name}`;
    const body = lines.join("\n");
    const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    succeed(form);
    window.location.href = mailto;
  }

  return (
    <section id="book" ref={sectionRef} className="section bg-linear-to-b from-brand-50/60 to-page
      dark:from-navy-800 dark:to-navy-900">
      <div className="container-page">
        <div className="max-w-3xl mx-auto text-center">
          <span className="eyebrow">Schedule a ride</span>
          <h2 className="h-display mt-3 sm:mt-4">Tell us where you need to go.</h2>
          <p className="mt-4 sm:mt-5 max-w-xl mx-auto text-base sm:text-lg/7 text-navy-700 leading-relaxed dark:text-mist-100">
            Name and phone is all we need to get started. Share as much else as you like.
            We&apos;ll call back to confirm pickup time, address, and anything special you need.
          </p>
        </div>

        <div className="mt-10 sm:mt-12 max-w-3xl mx-auto card shadow-soft">
          {status === "success" ? (
            <div className="text-center py-6 sm:py-8" role="status" aria-live="polite">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-800
                dark:bg-brand-900/40 dark:text-brand-300">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
                  <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl sm:text-2xl font-bold text-navy-900 dark:text-mist-100">We&apos;ve got it.</h3>
              <p className="mt-3 text-base text-navy-700 max-w-md mx-auto dark:text-mist-100/85">
                Thanks. We&apos;ll call you back to confirm the pickup. If you need the ride today,
                give us a ring directly so we can sort it on the spot.
              </p>
              {sent && (
                <p className="mt-3 text-base text-navy-700 max-w-md mx-auto dark:text-mist-100/85">
                  {sent === "unquoted"
                    ? "We'll confirm your fare when we call."
                    : `Estimated fare: ${fareLine(sent)}. We'll confirm the final fare when we call.`}
                </p>
              )}
              <div className="mt-6 grid grid-cols-1 sm:flex sm:flex-wrap sm:justify-center gap-3">
                <a href={`tel:${CONTACT.phoneTel}`} className="btn-primary">
                  Call {CONTACT.phoneDisplay}
                </a>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="btn-secondary"
                >
                  Book another ride
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
              <div className="sm:col-span-1">
                <label htmlFor="name" className="field-label">
                  Full name <span className="text-alert-700 dark:text-alert-300" aria-hidden>*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <input id="name" name="name" required className="field-input" autoComplete="name" />
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="phone" className="field-label">
                  Phone <span className="text-alert-700 dark:text-alert-300" aria-hidden>*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="field-input"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="e.g. +1 (246) 555-0123"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="field-label">
                  Email <span className="text-navy-700 font-normal dark:text-mist-100/70">(optional)</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="field-input"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="pickupDate" className="field-label">
                  Pickup date <span className="text-navy-700 font-normal dark:text-mist-100/70">(optional)</span>
                </label>
                <input id="pickupDate" name="pickupDate" type="date" className="field-input" />
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="pickupTime" className="field-label">
                  Pickup time <span className="text-navy-700 font-normal dark:text-mist-100/70">(optional)</span>
                </label>
                <input id="pickupTime" name="pickupTime" type="time" className="field-input" />
              </div>

              <div className="sm:col-span-1">
                <LocationAutocomplete
                  id="pickupLocation"
                  name="pickupLocation"
                  label={
                    <>
                      Pickup location <span className="text-navy-700 font-normal dark:text-mist-100/70">(optional)</span>
                    </>
                  }
                  placeholder="Home address, hospital, hotel, landmark…"
                  value={pickup}
                  onChange={(v) => typePoint("pickup", v)}
                />
              </div>

              <div className="sm:col-span-1">
                <LocationAutocomplete
                  id="dropoffLocation"
                  name="dropoffLocation"
                  label={
                    <>
                      Drop-off location <span className="text-navy-700 font-normal dark:text-mist-100/70">(optional)</span>
                    </>
                  }
                  placeholder="Destination"
                  value={dropoff}
                  onChange={(v) => typePoint("dropoff", v)}
                />
              </div>

              {LOCATIONIQ_TOKEN && (
                <div
                  role="group"
                  aria-labelledby="fare-map-label"
                  aria-describedby="fare-map-hint"
                  className="sm:col-span-2"
                >
                  <p id="fare-map-label" className="field-label">
                    Or pick both places on the map
                  </p>
                  {!mapFailed && (
                    <p id="fare-map-hint" className="mb-3 text-base text-navy-700 dark:text-mist-100/85">
                      {hint}
                    </p>
                  )}
                  <div className="h-80 sm:h-[420px] overflow-hidden rounded-xl border-2 border-navy-600/40 bg-mist-100
                    dark:border-navy-700 dark:bg-navy-900">
                    {mapFailed ? (
                      <p id="fare-map-hint" className="flex h-full items-center justify-center p-6 text-center text-base text-navy-700 dark:text-mist-100/85">
                        The map didn&apos;t load. You can still type your pickup and drop-off above.
                      </p>
                    ) : (
                      FareMap && (
                        <FareMap
                          pickup={pickup}
                          dropoff={dropoff}
                          route={quote?.state === "ok" ? quote.line : null}
                          onPick={mapPick}
                          onFail={() => setMapFailed(true)}
                        />
                      )
                    )}
                  </div>
                  <p className="sr-only" aria-live="polite">
                    {announce}
                  </p>
                  {!mapFailed && (hasPickup || hasDropoff) && (
                    <button type="button" onClick={clearPins} className="btn-secondary mt-3 w-full sm:w-auto">
                      Clear map pins
                    </button>
                  )}
                </div>
              )}

              <div className="sm:col-span-1">
                <label htmlFor="serviceType" className="field-label">
                  Service type <span className="text-navy-700 font-normal dark:text-mist-100/70">(optional)</span>
                </label>
                <select id="serviceType" name="serviceType" className="field-input">
                  <option value="">Choose a service…</option>
                  {serviceOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="passengers" className="field-label">
                  Number of passengers <span className="text-navy-700 font-normal dark:text-mist-100/70">(optional)</span>
                </label>
                <input
                  id="passengers"
                  name="passengers"
                  type="number"
                  min={1}
                  max={20}
                  className="field-input"
                  placeholder="1"
                />
              </div>

              <fieldset className="sm:col-span-2">
                <legend className="field-label">
                  Mobility needs <span className="text-navy-700 font-normal dark:text-mist-100/70">(optional, select any)</span>
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "Wheelchair user",
                    "Walker",
                    "Cane",
                    "Oxygen tank",
                    "Caregiver riding along",
                    "Extra boarding time",
                  ].map((m) => (
                    <label
                      key={m}
                      className="flex items-center gap-3 rounded-xl border-2 border-navy-600/30 bg-white px-3 py-3 min-h-[48px] hover:border-brand-700 has-checked:border-brand-700 has-checked:bg-brand-50 cursor-pointer transition
                        dark:bg-navy-900 dark:border-navy-700 dark:hover:border-brand-400 dark:has-checked:border-brand-400 dark:has-checked:bg-brand-900/30"
                    >
                      <input type="checkbox" name="mobility" value={m} className="h-5 w-5 accent-brand-600 flex-none dark:accent-brand-400" />
                      <span className="text-sm sm:text-base text-navy-800 dark:text-mist-100">{m}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="sm:col-span-2">
                <label htmlFor="notes" className="field-label">
                  Anything else? <span className="text-navy-700 font-normal dark:text-mist-100/70">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="field-input resize-none"
                  placeholder="Recurring weekly rides, multiple stops, things we should know to help you better…"
                />
              </div>

              {/* Honeypot — should remain empty */}
              <div className="hidden" aria-hidden="true">
                <label>
                  Leave this field empty
                  <input name="company" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              {TURNSTILE_SITE_KEY && (
                <div className="sm:col-span-2">
                  <TurnstileWidget
                    siteKey={TURNSTILE_SITE_KEY}
                    onToken={(t) => setTurnstileToken(t)}
                    onExpire={() => setTurnstileToken("")}
                    onError={() => setTurnstileToken("")}
                  />
                </div>
              )}

              {status === "error" && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="sm:col-span-2 rounded-xl border-2 border-alert-600 bg-alert-50 px-4 py-3 text-alert-800 font-medium
                    dark:bg-alert-800/30 dark:border-alert-400 dark:text-alert-200"
                >
                  <span className="sr-only">Error: </span>
                  {errorMsg || "Something went wrong. Please try again or call us."}
                </div>
              )}

              {LOCATIONIQ_TOKEN && (
                // Always in the DOM so screen readers announce what arrives in it.
                <div
                  aria-live="polite"
                  className="sm:col-span-2 rounded-xl border-2 border-brand-700/40 bg-brand-50 px-4 py-3 text-base text-navy-800
                    empty:border-0 empty:p-0 dark:border-sky-500/50 dark:bg-navy-900 dark:text-mist-100"
                >
                  {quote?.state === "working" && <p>Working out your fare…</p>}
                  {quote?.state === "failed" && (
                    <p>
                      We couldn&apos;t work out a fare just now. Send your request and we&apos;ll confirm your fare
                      when we call.
                    </p>
                  )}
                  {quote?.state === "ok" && (
                    <>
                      <p className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-mist-100">
                        Estimated fare: ${quote.fare} BBD
                      </p>
                      <p className="mt-1">
                        {quote.km.toFixed(1)} km by road. We&apos;ll confirm the final fare when we call.
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4 pt-2">
                <p className="text-sm text-navy-700 text-center sm:text-left dark:text-mist-100/85">
                  Prefer to talk? Call{" "}
                  <a
                    href={`tel:${CONTACT.phoneTel}`}
                    className="font-semibold text-brand-800 underline underline-offset-2 decoration-2 hover:decoration-gold-500
                      dark:text-brand-300 dark:hover:decoration-gold-400"
                  >
                    {CONTACT.phoneDisplay}
                  </a>
                </p>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? "Sending…" : "Request My Ride"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

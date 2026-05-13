"use client";

import { useState } from "react";
import { CONTACT } from "@/lib/contact";

type Status = "idle" | "submitting" | "success" | "error";

const serviceOptions = [
  "Medical appointment",
  "Senior care home visit / pickup",
  "Medication pickup & drop-off",
  "Physiotherapy",
  "Supermarket / shopping",
  "Family outing / day trip",
  "Airport transfer",
  "Cruise terminal pickup",
  "Other",
];

export default function BookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

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
            pickupLocation: get("pickupLocation"),
            dropoffLocation: get("dropoffLocation"),
            serviceType: get("serviceType"),
            passengers: get("passengers"),
            mobility,
            notes: get("notes"),
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "Your request didn't go through. Please try again or call us.");
        }

        setStatus("success");
        form.reset();
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
      get("pickupLocation") && `Pickup: ${get("pickupLocation")}`,
      get("dropoffLocation") && `Drop-off: ${get("dropoffLocation")}`,
      get("serviceType") && `Service: ${get("serviceType")}`,
      get("passengers") && `Passengers: ${get("passengers")}`,
      mobility.length > 0 && `Mobility needs: ${mobility.join(", ")}`,
      get("notes") && `Notes: ${get("notes")}`,
    ].filter(Boolean);

    const subject = `Ride request from ${name}`;
    const body = lines.join("\n");
    const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setStatus("success");
    form.reset();
    window.location.href = mailto;
  }

  return (
    <section id="book" className="section bg-gradient-to-b from-turquoise-50/60 to-sand-50
      dark:from-ink-800 dark:to-ink-900">
      <div className="container-page">
        <div className="max-w-3xl mx-auto text-center">
          <span className="eyebrow">Schedule a ride</span>
          <h2 className="h-display mt-3 sm:mt-4">Tell us where you need to go.</h2>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-ink-700 leading-relaxed dark:text-sand-100">
            Name and phone is all we need to get started. Share as much else as you like.
            We&apos;ll call back to confirm pickup time, address, and anything special you need.
          </p>
        </div>

        <div className="mt-10 sm:mt-12 max-w-3xl mx-auto card shadow-soft">
          {status === "success" ? (
            <div className="text-center py-6 sm:py-8" role="status" aria-live="polite">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-turquoise-100 text-turquoise-800
                dark:bg-turquoise-900/40 dark:text-turquoise-300">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
                  <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl sm:text-2xl font-bold text-ink-900 dark:text-sand-100">We&apos;ve got it.</h3>
              <p className="mt-3 text-base text-ink-700 max-w-md mx-auto dark:text-sand-100/85">
                Thanks. We&apos;ll call you back to confirm the pickup. If you need the ride today,
                give us a ring directly so we can sort it on the spot.
              </p>
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
                  Full name <span className="text-coral-700" aria-hidden>*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <input id="name" name="name" required className="field-input" autoComplete="name" />
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="phone" className="field-label">
                  Phone <span className="text-coral-700" aria-hidden>*</span>
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
                  Email <span className="text-ink-700 font-normal">(optional)</span>
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
                  Pickup date <span className="text-ink-700 font-normal">(optional)</span>
                </label>
                <input id="pickupDate" name="pickupDate" type="date" className="field-input" />
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="pickupTime" className="field-label">
                  Pickup time <span className="text-ink-700 font-normal">(optional)</span>
                </label>
                <input id="pickupTime" name="pickupTime" type="time" className="field-input" />
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="pickupLocation" className="field-label">
                  Pickup location <span className="text-ink-700 font-normal">(optional)</span>
                </label>
                <input
                  id="pickupLocation"
                  name="pickupLocation"
                  className="field-input"
                  placeholder="Home address, hospital, hotel, etc."
                />
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="dropoffLocation" className="field-label">
                  Drop-off location <span className="text-ink-700 font-normal">(optional)</span>
                </label>
                <input
                  id="dropoffLocation"
                  name="dropoffLocation"
                  className="field-input"
                  placeholder="Destination"
                />
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="serviceType" className="field-label">
                  Service type <span className="text-ink-700 font-normal">(optional)</span>
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
                  Number of passengers <span className="text-ink-700 font-normal">(optional)</span>
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
                  Mobility needs <span className="text-ink-700 font-normal">(optional, select any)</span>
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "Wheelchair user",
                    "Walker / cane",
                    "Oxygen tank",
                    "Service animal",
                    "Caregiver riding along",
                    "Extra boarding time",
                  ].map((m) => (
                    <label
                      key={m}
                      className="flex items-center gap-3 rounded-xl border-2 border-ink-600/30 bg-white px-3 py-3 min-h-[48px] hover:border-turquoise-700 has-[:checked]:border-turquoise-700 has-[:checked]:bg-turquoise-50 cursor-pointer transition
                        dark:bg-ink-900 dark:border-ink-700 dark:hover:border-turquoise-400 dark:has-[:checked]:border-turquoise-400 dark:has-[:checked]:bg-turquoise-900/30"
                    >
                      <input type="checkbox" name="mobility" value={m} className="h-5 w-5 accent-turquoise-600 flex-none dark:accent-turquoise-400" />
                      <span className="text-sm sm:text-base text-ink-800 dark:text-sand-100">{m}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="sm:col-span-2">
                <label htmlFor="notes" className="field-label">
                  Anything else? <span className="text-ink-700 font-normal">(optional)</span>
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

              {status === "error" && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="sm:col-span-2 rounded-xl border-2 border-coral-600 bg-coral-50 px-4 py-3 text-coral-800 font-medium
                    dark:bg-coral-900/30 dark:border-coral-400 dark:text-coral-200"
                >
                  <span className="sr-only">Error: </span>
                  {errorMsg || "Something went wrong. Please try again or call us."}
                </div>
              )}

              <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4 pt-2">
                <p className="text-sm text-ink-700 text-center sm:text-left dark:text-sand-100/85">
                  Prefer to talk? Call{" "}
                  <a
                    href={`tel:${CONTACT.phoneTel}`}
                    className="font-semibold text-turquoise-800 underline underline-offset-2 decoration-2 hover:decoration-coral-700
                      dark:text-turquoise-300 dark:hover:decoration-coral-400"
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

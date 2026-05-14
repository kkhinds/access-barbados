"use client";

import { useState } from "react";
import { CONTACT, waMessage } from "@/lib/contact";
import TurnstileWidget from "./TurnstileWidget";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type Status = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const get = (k: string) => (formData.get(k)?.toString() ?? "").trim();

    if (get("company")) {
      setStatus("success");
      form.reset();
      return;
    }

    const name = get("name");
    const phone = get("phone");
    if (!name || !phone) {
      setStatus("error");
      setErrorMsg("Please include your name and phone so we can reach you.");
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus("error");
      setErrorMsg(
        "Please complete the verification check below the form, then try again.",
      );
      return;
    }

    const endpoint = process.env.NEXT_PUBLIC_BOOKING_ENDPOINT;

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
            notes: get("notes"),
            source: "web", // contact form rides through the same pipe as bookings
            turnstileToken,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "Your message didn't go through. Please try again or call us.");
        }
        setStatus("success");
        form.reset();
        setTurnstileToken("");
        return;
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please call us.");
        return;
      }
    }

    // Fallback: mailto until admin endpoint is live.
    const lines = [
      `Name: ${name}`,
      `Phone: ${phone}`,
      get("email") && `Email: ${get("email")}`,
      get("notes") && `Message: ${get("notes")}`,
    ].filter(Boolean);

    const subject = `Website message from ${name}`;
    const body = lines.join("\n");
    const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setStatus("success");
    form.reset();
    window.location.href = mailto;
  }

  return (
    <section id="contact" className="section">
      <div className="container-page grid lg:grid-cols-2 gap-10 sm:gap-12">
        <div>
          <span className="eyebrow">Reach us</span>
          <h2 className="h-display mt-3 sm:mt-4">Pick up the phone. We&apos;re listening.</h2>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-ink-700 leading-relaxed dark:text-sand-100">
            Call, WhatsApp, or email. Whichever&apos;s easiest. We answer during the day and get
            back to after-hours messages first thing the next morning.
          </p>

          <div className="mt-8 space-y-4">
            <a
              href={`tel:${CONTACT.phoneTel}`}
              className="flex items-start gap-4 card hover:-translate-y-0.5 transition"
            >
              <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-turquoise-100 text-turquoise-700
                dark:bg-turquoise-900/40 dark:text-turquoise-300">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .58 3.6 1 1 0 0 1-.25 1l-2.23 2.2Z" />
                </svg>
              </span>
              <div>
                <div className="font-semibold text-ink-900 dark:text-sand-100">Give us a call</div>
                <div className="text-ink-700 dark:text-sand-100/85">{CONTACT.phoneDisplay}</div>
                <div className="text-sm text-ink-700 mt-1 dark:text-sand-100/70">{CONTACT.businessHours}</div>
              </div>
            </a>

            <a
              href={`https://wa.me/${CONTACT.whatsApp}?text=${waMessage}`}
              target="_blank"
              rel="noopener"
              className="flex items-start gap-4 card hover:-translate-y-0.5 transition"
            >
              <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-coral-100 text-coral-700
                dark:bg-coral-900/30 dark:text-coral-300">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M20.5 3.5A11 11 0 0 0 3.3 17.3L2 22l4.8-1.3A11 11 0 1 0 20.5 3.5Zm-3 13.8c-.3-.1-1.6-.8-1.8-.9-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1a7.3 7.3 0 0 1-2.1-1.3 8.3 8.3 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.6l.4-.4.3-.5c.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1 2.7 11.6 11.6 0 0 0 4.5 4 5.2 5.2 0 0 0 3 .6c.6-.1 1.6-.6 1.8-1.2.2-.6.2-1.1.2-1.2 0-.1-.2-.2-.4-.2Z" />
                </svg>
              </span>
              <div>
                <div className="font-semibold text-ink-900 dark:text-sand-100">WhatsApp</div>
                <div className="text-ink-700 dark:text-sand-100/85">Easier than typing an email</div>
                <div className="text-sm text-ink-700 mt-1 dark:text-sand-100/70">
                  Tap to start a chat
                </div>
              </div>
            </a>

            <a
              href={`mailto:${CONTACT.email}`}
              className="flex items-start gap-4 card hover:-translate-y-0.5 transition"
            >
              <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-sand-200 text-ink-800
                dark:bg-ink-700 dark:text-sand-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M3 5h18v14H3V5Zm9 8 9-6H3l9 6Z" />
                </svg>
              </span>
              <div>
                <div className="font-semibold text-ink-900 dark:text-sand-100">Email</div>
                <div className="text-ink-700 break-all dark:text-sand-100/85">{CONTACT.email}</div>
                <div className="text-sm text-ink-700 mt-1 dark:text-sand-100/70">
                  Or use the form below. Your choice.
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="card shadow-soft">
          <h3 className="text-xl font-bold text-ink-900 dark:text-sand-100">Send a message</h3>
          <p className="mt-2 text-ink-700 dark:text-sand-100/85">
            Got a question or want to book in advance? Drop us a line and we&apos;ll get back to you.
          </p>

          {status === "success" ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-xl bg-turquoise-50 border-2 border-turquoise-700 p-5 text-turquoise-900
                dark:bg-turquoise-900/30 dark:border-turquoise-400 dark:text-turquoise-100"
            >
              <div className="font-semibold text-lg">Got it. Thanks.</div>
              <p className="mt-1 text-turquoise-900 dark:text-turquoise-100">
                We&apos;ll get back to you as soon as we can. If it&apos;s urgent, just give us a call.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <div>
                <label htmlFor="c-name" className="field-label">Name</label>
                <input id="c-name" name="name" required className="field-input" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="c-phone" className="field-label">Phone</label>
                <input
                  id="c-phone"
                  name="phone"
                  type="tel"
                  required
                  className="field-input"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
              <div>
                <label htmlFor="c-email" className="field-label">
                  Email <span className="text-ink-700 font-normal">(optional)</span>
                </label>
                <input id="c-email" name="email" type="email" className="field-input" autoComplete="email" />
              </div>
              <div>
                <label htmlFor="c-message" className="field-label">Message</label>
                <textarea
                  id="c-message"
                  name="notes"
                  rows={4}
                  required
                  className="field-input resize-none"
                />
              </div>

              <div className="hidden" aria-hidden="true">
                <label>
                  Leave empty<input name="company" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              {TURNSTILE_SITE_KEY && (
                <TurnstileWidget
                  siteKey={TURNSTILE_SITE_KEY}
                  onToken={(t) => setTurnstileToken(t)}
                  onExpire={() => setTurnstileToken("")}
                  onError={() => setTurnstileToken("")}
                />
              )}

              {status === "error" && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-xl border-2 border-coral-600 bg-coral-50 px-4 py-3 text-coral-800 font-medium
                    dark:bg-coral-900/30 dark:border-coral-400 dark:text-coral-200"
                >
                  <span className="sr-only">Error: </span>
                  {errorMsg || "Something went wrong. Please try again or call us."}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? "Sending…" : "Send It"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

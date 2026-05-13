import { CONTACT, waMessage } from "@/lib/contact";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Soft Caribbean gradient — light by day, deep navy by night */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-turquoise-50 via-sand-50 to-coral-50
          dark:from-ink-900 dark:via-ink-800 dark:to-ink-900"
      />
      <div
        aria-hidden
        className="absolute -top-32 -right-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-turquoise-200/40 blur-3xl
          dark:bg-turquoise-700/25"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 -z-10 h-[22rem] w-[22rem] rounded-full bg-coral-200/40 blur-3xl
          dark:bg-coral-700/20"
      />

      <div className="container-page pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-10 sm:gap-12 items-center">
          <div className="lg:col-span-7">
            <span className="eyebrow">Wheelchair-accessible rides • Across Barbados</span>
            <h1 className="h-display mt-3 sm:mt-4">
              Call us. <span className="text-turquoise-700 dark:text-turquoise-300">We&apos;ll be there.</span>
            </h1>
            <p className="mt-5 sm:mt-6 text-base sm:text-xl text-ink-700 leading-relaxed max-w-2xl
              dark:text-sand-100">
              Reliable, accessible transport for Barbadians who need a little extra care getting
              around. Rides to the doctor, the pharmacy, the supermarket, or wherever the day takes
              you. Schedule in advance and ride at ease.
            </p>

            <div className="mt-7 sm:mt-8 grid grid-cols-1 sm:flex sm:flex-wrap gap-3">
              <a href="#book" className="btn-primary w-full sm:w-auto">
                Book a Ride
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <a href={`tel:${CONTACT.phoneTel}`} className="btn-secondary w-full sm:w-auto">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .58 3.6 1 1 0 0 1-.25 1l-2.23 2.2Z" />
                </svg>
                <span className="sm:hidden">Call us</span>
                <span className="hidden sm:inline">Call {CONTACT.phoneDisplay}</span>
              </a>
              <a
                href={`https://wa.me/${CONTACT.whatsApp}?text=${waMessage}`}
                className="btn-coral w-full sm:w-auto"
                target="_blank"
                rel="noopener"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M20.5 3.5A11 11 0 0 0 3.3 17.3L2 22l4.8-1.3A11 11 0 1 0 20.5 3.5Zm-8.5 17a8.9 8.9 0 0 1-4.6-1.3l-.3-.2-2.9.8.8-2.8-.2-.3a8.9 8.9 0 1 1 7.2 3.8Zm5-6.7c-.3-.1-1.6-.8-1.8-.9-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1a7.3 7.3 0 0 1-2.1-1.3 8.3 8.3 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.6l.4-.4.3-.5c.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1 2.7 11.6 11.6 0 0 0 4.5 4 5.2 5.2 0 0 0 3 .6c.6-.1 1.6-.6 1.8-1.2.2-.6.2-1.1.2-1.2 0-.1-.2-.2-.4-.2Z" />
                </svg>
                WhatsApp Us
              </a>
            </div>

            {/* Trust strip */}
            <ul className="mt-8 sm:mt-10 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-sm sm:text-base">
              {[
                "On time, every ride",
                "Trained, caring drivers",
                "Wheelchair-ready vehicles",
                "Door-to-door service",
                "Schedule in advance",
                "Anywhere on the island",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-ink-800 dark:text-sand-100">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 mt-0.5 text-turquoise-600 flex-none dark:text-turquoise-300" fill="currentColor" aria-hidden>
                    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual card — hidden on phones (sticky bottom bar covers these actions), shown md+ */}
          <div className="hidden md:block lg:col-span-5">
            <div className="relative max-w-md mx-auto lg:max-w-none">
              <div className="card shadow-soft">
                <div className="flex items-center gap-3 mb-5">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-turquoise-100 text-turquoise-700 dark:bg-turquoise-900/40 dark:text-turquoise-300">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                      <path d="M3 17v-1.5a4.5 4.5 0 0 1 4.5-4.5h9A4.5 4.5 0 0 1 21 15.5V17H3Zm2-8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1H5V9Zm-1 10h2v2H4v-2Zm14 0h2v2h-2v-2Z" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-semibold text-ink-900 dark:text-sand-100">Need a lift?</div>
                    <div className="text-sm text-ink-700 dark:text-sand-100/80">
                      Tell us when and where. We&apos;ll call to confirm.
                    </div>
                  </div>
                </div>
                <a href="#book" className="btn-primary w-full">
                  Schedule a Ride
                </a>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-sand-50 p-4 dark:bg-ink-900/60 dark:ring-1 dark:ring-ink-700">
                    <div className="text-xs uppercase tracking-wider text-ink-700 font-semibold dark:text-turquoise-300">
                      Reach us
                    </div>
                    <div className="mt-1 text-ink-900 font-semibold dark:text-sand-100">{CONTACT.phoneDisplay}</div>
                  </div>
                  <div className="rounded-xl bg-sand-50 p-4 dark:bg-ink-900/60 dark:ring-1 dark:ring-ink-700">
                    <div className="text-xs uppercase tracking-wider text-ink-700 font-semibold dark:text-turquoise-300">
                      Hours
                    </div>
                    <div className="mt-1 text-ink-900 font-semibold leading-tight dark:text-sand-100">
                      {CONTACT.businessHours}
                    </div>
                  </div>
                </div>
              </div>
              <div
                aria-hidden
                className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-xl2 bg-coral-200/60 dark:bg-coral-700/20"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

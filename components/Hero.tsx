import { CONTACT, waMessage } from "@/lib/contact";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Blue tint into white, matching the brand applications. Gold is the sun in
          the mark, so on this page it only carries the pre-launch bar. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-br from-brand-100 via-brand-50 to-page
          dark:from-navy-900 dark:via-navy-800 dark:to-navy-900"
      />
      <div
        aria-hidden
        className="absolute -top-32 -right-32 -z-10 h-112 w-md rounded-full bg-brand-200/40 blur-3xl
          dark:bg-brand-700/25"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 -z-10 h-88 w-88 rounded-full bg-brand-100/50 blur-3xl
          dark:bg-sky-700/12"
      />

      <div className="container-page pt-6 pb-10 sm:pt-12 sm:pb-14 lg:pt-12 lg:pb-16">
        {/* One short column: left-aligned on a phone, centred from 768px.
            The fare card lives in the booking section. */}
        <div className="mx-auto max-w-3xl md:text-center">
          <span className="eyebrow">Wheelchair-accessible rides • Across Barbados</span>
          <h1 className="h-display mt-3 sm:mt-4">
            Call us. <span className="text-brand-700 dark:text-brand-300">We&apos;ll be there.</span>
          </h1>
          <p className="mt-3 sm:mt-6 text-base sm:text-xl/7 text-navy-700 leading-relaxed max-w-2xl md:mx-auto
            dark:text-mist-100">
            Reliable, accessible transport for Barbadians who need a little extra care getting
            around.
            <span className="hidden sm:inline">
              {" "}Appointments, errands, family time, wherever the day takes you. Schedule
              ahead and ride easy.
            </span>
          </p>

          {/* Phone: Call only. WhatsApp and Book are in the sticky bar. */}
          <div className="mt-5 sm:mt-8 grid grid-cols-1 md:flex md:flex-wrap md:justify-center gap-3">
            <a href={`tel:${CONTACT.phoneTel}`} className="btn-primary w-full md:w-auto whitespace-nowrap">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .58 3.6 1 1 0 0 1-.25 1l-2.23 2.2Z" />
              </svg>
              Call {CONTACT.phoneDisplay}
            </a>
            <a
              href={`https://wa.me/${CONTACT.whatsApp}?text=${waMessage}`}
              className="btn-whatsapp hidden md:inline-flex whitespace-nowrap"
              target="_blank"
              rel="noopener"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M20.5 3.5A11 11 0 0 0 3.3 17.3L2 22l4.8-1.3A11 11 0 1 0 20.5 3.5Zm-8.5 17a8.9 8.9 0 0 1-4.6-1.3l-.3-.2-2.9.8.8-2.8-.2-.3a8.9 8.9 0 1 1 7.2 3.8Zm5-6.7c-.3-.1-1.6-.8-1.8-.9-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1a7.3 7.3 0 0 1-2.1-1.3 8.3 8.3 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.6l.4-.4.3-.5c.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1 2.7 11.6 11.6 0 0 0 4.5 4 5.2 5.2 0 0 0 3 .6c.6-.1 1.6-.6 1.8-1.2.2-.6.2-1.1.2-1.2 0-.1-.2-.2-.4-.2Z" />
              </svg>
              WhatsApp
            </a>
            <a href="#book" className="btn-secondary hidden md:inline-flex whitespace-nowrap">
              Book a ride
            </a>
          </div>

          <p className="mt-3 sm:mt-4 flex items-center md:justify-center gap-2 text-base font-semibold text-navy-800 dark:text-mist-100">
            <svg viewBox="0 0 24 24" className="h-6 w-6 flex-none text-brand-700 dark:text-sky-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            Open {CONTACT.businessHours}
          </p>

          {/* Trust strip */}
          <ul className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-left text-sm sm:text-base">
            {[
              "On time, every ride",
              "Trained, caring drivers",
              "Wheelchair-ready vehicles",
              "Door-to-door service",
              "Schedule in advance",
              "Anywhere on the island",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-navy-800 dark:text-mist-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5 mt-0.5 text-brand-600 flex-none dark:text-brand-300" fill="currentColor" aria-hidden>
                  <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

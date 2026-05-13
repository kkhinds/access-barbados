type Service = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const services: Service[] = [
  {
    title: "Doctor & Hospital Visits",
    description:
      "QEH, the polyclinic, your specialist, follow-ups. We get you there on time and either wait or come back when you’re ready. No rushing, no stress.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M10 3h4v5h5v4h-5v5h-4v-5H5V8h5V3Z" />
      </svg>
    ),
  },
  {
    title: "Senior Care Home Visits",
    description:
      "Visiting Mum at the care home? Bringing Dad home for Sunday lunch? We handle pickups to and from senior homes across the island, with patient drivers and accessible vehicles.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M3 21V7l9-4 9 4v14H3Zm6-2h2v-3H9v3Zm4 0h2v-3h-2v3Z" />
      </svg>
    ),
  },
  {
    title: "Medication Pickup & Drop-off",
    description:
      "Can’t get to the pharmacy yourself? Tell us what you need. We’ll collect your prescription and bring it to your door for a small fee.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M5 4h14v3H5V4Zm0 5h14l-1 11H6L5 9Zm5 3v6h4v-6h-4Z" />
      </svg>
    ),
  },
  {
    title: "Physiotherapy & Rehab",
    description:
      "Set up your weekly physio rides once and we’ll handle the rest. Same time, same driver where we can. No re-explaining yourself every Tuesday.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4 4h3v16H4V4Zm13 0h3v16h-3V4ZM8 11h8v2H8v-2Z" />
      </svg>
    ),
  },
  {
    title: "Supermarket & Errands",
    description:
      "Your weekly Massy run, a Saturday at Sheraton, the hardware store, the bank. Call ahead, ride at your pace, and we’ll help with the bags.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M7 4h11l1.5 9H8.4l-.4 2H19v2H7l1-5L6 6H4V4h3Zm2 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm9 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
      </svg>
    ),
  },
  {
    title: "Wheelchair-Accessible Rides",
    description:
      "Vehicles built around the wheelchair, not the other way round. Secure tie-downs, easy boarding, plenty of room, and a driver who knows the routine.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 4.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-2 5h3.2a1 1 0 0 1 .98.8l.62 3.2H17a1 1 0 1 1 0 2h-2.6l.45 2.32A4.5 4.5 0 1 1 9.6 21.8l-.06-.06-1.16-1.4A3.5 3.5 0 1 0 13 14.78V14h-3a1 1 0 0 1-.98-.8l-.62-3.2A1 1 0 0 1 10 9.5Z" />
      </svg>
    ),
  },
  {
    title: "Family Outings & Day Trips",
    description:
      "Lunch in Oistins. A drive up to Bathsheba. Sunday service. A grandchild’s birthday party. Whatever the occasion, we’ll make sure you’re there.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2 4 6v6c0 5 3.4 9.3 8 10 4.6-.7 8-5 8-10V6l-8-4Zm-1 12-4-4 1.4-1.4L11 11.2l4.6-4.6L17 8l-6 6Z" />
      </svg>
    ),
  },
  {
    title: "Airport & Cruise Transfers",
    description:
      "Heading off-island for treatment? Picking up family at GAIA or the cruise terminal? We’ll meet you (or your guests) with the right vehicle, luggage and all.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1L15 22v-1.5L13 19v-5.5L21 16Z" />
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <section id="services" className="section bg-sand-50 dark:bg-ink-900">
      <div className="container-page">
        <div className="max-w-2xl">
          <span className="eyebrow">What we do</span>
          <h2 className="h-display mt-3 sm:mt-4">Wherever you need to be, we&apos;ve got the ride.</h2>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-ink-700 leading-relaxed dark:text-sand-100">
            From your weekly doctor&apos;s visit to a Saturday at the supermarket, we plan the route,
            the timing, and the support. So you can show up rested and on time. One call sorts it.
          </p>
        </div>

        <div className="mt-10 sm:mt-12 grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {services.map((s) => (
            <article key={s.title} className="card hover:-translate-y-1 hover:shadow-soft transition">
              <div className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-turquoise-100 text-turquoise-700
                dark:bg-turquoise-900/40 dark:text-turquoise-300">
                <span className="block h-5 w-5 sm:h-6 sm:w-6">{s.icon}</span>
              </div>
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-ink-900 dark:text-sand-100">{s.title}</h3>
              <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-ink-700 leading-relaxed dark:text-sand-100/85">{s.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <a href="#book" className="btn-primary w-full sm:w-auto">
            Schedule a Ride
          </a>
        </div>
      </div>
    </section>
  );
}

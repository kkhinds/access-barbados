const highlights = [
  {
    title: "Vehicles built for the job",
    body: "Air-conditioned vans with secure wheelchair tie-downs, easy boarding, and room for the people who ride with you.",
  },
  {
    title: "Drivers who get it",
    body: "Trained to assist safely, patient when you need a minute, and discreet about what’s none of their business.",
  },
  {
    title: "Every corner of the island",
    body: "From St. Lucy to Christ Church and everywhere between. If you can name it, we can drive to it.",
  },
  {
    title: "Plan ahead, ride easy",
    body: "Tell us where, when, and what you need. We’ll handle the rest, including standing weekly rides if you’d like.",
  },
];

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container-page grid lg:grid-cols-2 gap-10 sm:gap-12 items-center">
        <div>
          <span className="eyebrow">Why we’re here</span>
          <h2 className="h-display mt-3 sm:mt-4">
            Your independence is our <span className="text-coral-700 dark:text-coral-400">whole reason for existing.</span>
          </h2>
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-ink-700 leading-relaxed dark:text-sand-100">
            We started Access Barbados because too many of our own people have had to skip
            appointments, miss family events, or wait on a relative to drive home from town. All
            because the regular taxi wouldn&apos;t work.
          </p>
          <p className="mt-4 text-base sm:text-lg text-ink-700 leading-relaxed dark:text-sand-100">
            So we built a service around the trips that actually matter. Vehicles you can use.
            Drivers who&apos;ll wait, help, and treat you like family. Schedules planned around your
            day, not ours. Call us once, and we&apos;ll know how to help the next time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {highlights.map((h) => (
            <div key={h.title} className="card">
              <div className="flex items-start gap-2 text-turquoise-700 dark:text-turquoise-300">
                <svg viewBox="0 0 24 24" className="h-5 w-5 mt-0.5 flex-none" fill="currentColor" aria-hidden>
                  <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
                </svg>
                <h3 className="font-semibold text-ink-900 dark:text-sand-100">{h.title}</h3>
              </div>
              <p className="mt-2 text-sm sm:text-base text-ink-700 leading-relaxed dark:text-sand-100/85">{h.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

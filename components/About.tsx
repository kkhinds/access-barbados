const highlights = [
  {
    title: "Bajan-owned, Barbadian-run",
    body: "A local team that knows the island, knows the people, and answers the phone every time it rings.",
  },
  {
    title: "Standing weekly rides",
    body: "Set up your regular physio, dialysis, or shopping run once. We remember the schedule, the address, and how you like things done.",
  },
  {
    title: "We wait at appointments",
    body: "Short waits at the doctor’s office come free. No need to rush, no need to call a second ride home.",
  },
  {
    title: "Help in, help out, help with bags",
    body: "Drivers stay until you’re settled. They lift, fetch, and load whatever needs lifting, fetching, or loading.",
  },
];

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container-page grid lg:grid-cols-2 gap-10 sm:gap-12 items-center">
        <div>
          <span className="eyebrow">Why we’re here</span>
          <h2 className="h-display mt-3 sm:mt-4">
            Your independence is <span className="text-coral-700 dark:text-coral-400">the whole point.</span>
          </h2>
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-ink-700 leading-relaxed dark:text-sand-100">
            We started Access Barbados because too many of our own people have had to skip
            appointments, miss family events, or wait on a relative to drive home from town. All
            because the regular taxi wouldn&apos;t work.
          </p>
          <p className="mt-4 text-base sm:text-lg text-ink-700 leading-relaxed dark:text-sand-100">
            So we built the service around the trips that matter, and around the people taking
            them.
          </p>
        </div>

        {/* Card chrome dropped — divider list lets the points read as quiet
            statements rather than four boxes asking for attention. */}
        <ul className="divide-y divide-sand-200 dark:divide-ink-700">
          {highlights.map((h) => (
            <li key={h.title} className="py-5 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-turquoise-100 text-turquoise-800 dark:bg-turquoise-900/40 dark:text-turquoise-300"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink-900 dark:text-sand-100">
                    {h.title}
                  </h3>
                  <p className="mt-1 text-sm sm:text-base text-ink-700 leading-relaxed dark:text-sand-100/85">
                    {h.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

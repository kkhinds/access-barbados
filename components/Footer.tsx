import { CONTACT, waMessage } from "@/lib/contact";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark bg-ink-900 text-ink-300">
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-turquoise-500 text-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M12 4.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-2 5h3.2a1 1 0 0 1 .98.8l.62 3.2H17a1 1 0 1 1 0 2h-2.6l.45 2.32A4.5 4.5 0 1 1 9.6 21.8l-.06-.06-1.16-1.4A3.5 3.5 0 1 0 13 14.78V14h-3a1 1 0 0 1-.98-.8l-.62-3.2A1 1 0 0 1 10 9.5Z" />
                </svg>
              </span>
              <span className="text-white font-display text-lg font-extrabold">Access Barbados</span>
            </div>
            <p className="mt-4 max-w-md leading-relaxed text-sm sm:text-base">
              Reliable, wheelchair-accessible rides for Barbadians who need a little extra care
              getting around. From the doctor to the supermarket, we&apos;ve got you.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold">Quick links</h4>
            <ul className="mt-3 sm:mt-4 -mx-2">
              <li><a href="#services" className="block px-2 py-2 hover:text-white">Services</a></li>
              <li><a href="#about" className="block px-2 py-2 hover:text-white">About</a></li>
              <li><a href="#book" className="block px-2 py-2 hover:text-white">Book a Ride</a></li>
              <li><a href="#contact" className="block px-2 py-2 hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold">Reach us</h4>
            <ul className="mt-3 sm:mt-4 -mx-2">
              <li>
                <a href={`tel:${CONTACT.phoneTel}`} className="block px-2 py-2 hover:text-white">
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${CONTACT.whatsApp}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener"
                  className="block px-2 py-2 hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="block px-2 py-2 hover:text-white break-all">
                  {CONTACT.email}
                </a>
              </li>
              <li className="px-2 py-1 text-ink-300 text-sm">{CONTACT.addressLine}</li>
              <li className="px-2 py-1 text-ink-300 text-sm">{CONTACT.businessHours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 border-t border-ink-700">
          <div className="rounded-xl bg-ink-800 border border-ink-700 p-4 sm:p-5 text-sm">
            <h4 className="text-white font-semibold">Trouble using this site?</h4>
            <p className="mt-2 text-ink-300 leading-relaxed">
              We built this site to work with screen readers, keyboards, high-contrast text, and
              reduced motion. If anything&apos;s still hard to use, just call us at{" "}
              <a href={`tel:${CONTACT.phoneTel}`} className="font-semibold text-white underline underline-offset-2 hover:text-sand-100">
                {CONTACT.phoneDisplay}
              </a>
              . We&apos;ll take your booking over the phone and skip the website entirely.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm">
            <div>&copy; {year} Access Barbados. All rights reserved.</div>
            <div className="text-ink-400">Accessible rides, anywhere on the island.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

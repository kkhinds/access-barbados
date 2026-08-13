import Image from "next/image";
import { CONTACT, waMessage } from "@/lib/contact";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark bg-navy-900 text-navy-300">
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-full">
                <Image
                  src="/logo.png"
                  alt=""
                  aria-hidden="true"
                  width={297}
                  height={211}
                  className="h-full w-auto max-w-none"
                />
              </span>
              <span className="font-display text-lg font-extrabold uppercase tracking-tight">
                <span className="text-white">Access</span>{" "}
                <span className="text-sky-500">Barbados</span>
              </span>
            </div>
            <p className="mt-4 max-w-md leading-relaxed text-sm sm:text-base">
              Reliable, wheelchair-accessible rides for Barbadians. Planned around your day,
              not ours.
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
              <li className="px-2 py-1 text-navy-300 text-sm">{CONTACT.addressLine}</li>
              <li className="px-2 py-1 text-navy-300 text-sm">{CONTACT.businessHours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 border-t border-navy-700">
          <div className="rounded-xl bg-navy-800 border border-navy-700 p-4 sm:p-5 text-sm">
            <h4 className="text-white font-semibold">Trouble using this site?</h4>
            <p className="mt-2 max-w-prose text-navy-300 leading-relaxed">
              We built this site to work with screen readers, keyboards, high-contrast text, and
              reduced motion. If anything&apos;s still hard to use, just call us at{" "}
              <a href={`tel:${CONTACT.phoneTel}`} className="font-semibold text-white underline underline-offset-2 hover:text-mist-100">
                {CONTACT.phoneDisplay}
              </a>
              . We&apos;ll take your booking over the phone and skip the website entirely.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm">
            <div>&copy; {year} Access Barbados. All rights reserved.</div>
            <div className="text-navy-300">
              <span className="font-semibold uppercase tracking-wide text-sky-500">
                Reliable. Accessible. Caring.
              </span>{" "}
              Riding together, every step of the way.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

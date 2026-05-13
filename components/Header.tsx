"use client";

import { useState } from "react";
import { CONTACT } from "@/lib/contact";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#book", label: "Book a Ride" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-sand-50/90 backdrop-blur border-b border-sand-100
      dark:bg-ink-900/90 dark:border-ink-800">
      <div className="container-page flex items-center justify-between h-16 sm:h-20">
        <a href="#top" className="flex items-center gap-2 group min-w-0" aria-label="Access Barbados home">
          <span
            aria-hidden="true"
            className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-turquoise-600 text-white shadow-soft group-hover:bg-turquoise-700 transition
              dark:bg-turquoise-500 dark:text-ink-900 dark:group-hover:bg-turquoise-400"
          >
            {/* Wheelchair / accessibility icon */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M12 4.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-2 5h3.2a1 1 0 0 1 .98.8l.62 3.2H17a1 1 0 1 1 0 2h-2.6l.45 2.32A4.5 4.5 0 1 1 9.6 21.8l-.06-.06-1.16-1.4A3.5 3.5 0 1 0 13 14.78V14h-3a1 1 0 0 1-.98-.8l-.62-3.2A1 1 0 0 1 10 9.5Z" />
            </svg>
          </span>
          <span className="font-display text-base sm:text-xl font-extrabold text-ink-900 truncate
            dark:text-sand-100">
            Access Barbados
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-ink-800 font-medium hover:text-turquoise-700 transition
                dark:text-sand-100 dark:hover:text-turquoise-300"
            >
              {l.label}
            </a>
          ))}
          <a href={`tel:${CONTACT.phoneTel}`} className="btn-primary !py-2.5 !px-5 !text-sm">
            Call Now
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-800 hover:bg-sand-100
            dark:text-sand-100 dark:hover:bg-ink-800"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="md:hidden border-t border-sand-100 bg-sand-50 shadow-card
            dark:border-ink-800 dark:bg-ink-900"
        >
          <div className="container-page py-3 flex flex-col gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-3 min-h-[48px] flex items-center rounded-lg text-base text-ink-800 font-medium hover:bg-sand-100
                  dark:text-sand-100 dark:hover:bg-ink-800"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <a
              href={`tel:${CONTACT.phoneTel}`}
              className="btn-primary mt-2 w-full"
              onClick={() => setOpen(false)}
            >
              Call Now
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

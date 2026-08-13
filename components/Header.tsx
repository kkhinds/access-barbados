"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CONTACT } from "@/lib/contact";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#book", label: "Book a Ride" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // The header is sticky, so every "#section" jump has to clear it. Measure the
  // real height instead of hard-coding one: the pre-launch banner, a wrapped
  // logo, and large browser text all change it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      // The open mobile drawer lives inside the header but scrolls away with it.
      const drawer = el.querySelector<HTMLElement>("#mobile-nav");
      const h = el.offsetHeight - (drawer?.offsetHeight ?? 0);
      document.documentElement.style.setProperty("--header-h", `${h}px`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 bg-page/90 backdrop-blur border-b border-mist-200
      dark:bg-navy-900/90 dark:border-navy-800"
    >
      {/* Pre-launch notice. Delete this block when the service goes live. */}
      <div
        role="status"
        className="bg-gold-400 text-navy-900 text-center text-xs sm:text-sm font-semibold px-4 py-2"
      >
        Coming soon. We&apos;re still getting set up. Bookings open shortly.
      </div>

      <div className="container-page flex items-center justify-between h-16 sm:h-20">
        <a href="#top" className="flex items-center gap-2 group min-w-0" aria-label="Access Barbados home">
          {/* The badge art sits in a white rectangle with padding either side, so
              it gets centred and clipped to its own circle. */}
          <span className="inline-flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-full ring-1 ring-navy-900/10 dark:ring-white/15">
            <Image
              src="/logo.png"
              alt=""
              aria-hidden="true"
              width={297}
              height={211}
              priority
              className="h-full w-auto max-w-none"
            />
          </span>
          {/* Two-tone wordmark from the brand lockup. Uppercase is applied in CSS so
              screen readers still say "Access Barbados", not the letters. */}
          <span className="font-display text-base sm:text-xl font-extrabold uppercase tracking-tight truncate">
            <span className="text-navy-900 dark:text-mist-100">Access</span>{" "}
            <span className="text-brand-700 dark:text-sky-500">Barbados</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-navy-800 font-medium hover:text-brand-700 transition
                dark:text-mist-100 dark:hover:text-brand-300"
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
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-navy-800 hover:bg-mist-100
            dark:text-mist-100 dark:hover:bg-navy-800"
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
          className="md:hidden border-t border-mist-100 bg-page shadow-card
            dark:border-navy-800 dark:bg-navy-900"
        >
          <div className="container-page py-3 flex flex-col gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-3 min-h-[48px] flex items-center rounded-lg text-base text-navy-800 font-medium hover:bg-mist-100
                  dark:text-mist-100 dark:hover:bg-navy-800"
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

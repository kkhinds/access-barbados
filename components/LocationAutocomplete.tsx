"use client";

import { useEffect, useRef, useState } from "react";

const ENDPOINT = "https://api.locationiq.com/v1/autocomplete";

export type LocationValue = {
  name: string;
  lat: number | null;
  lng: number | null;
};

type Suggestion = {
  place_id: string;
  display_name: string;
  display_place?: string;
  display_address?: string;
  lat: string;
  lon: string;
};

/**
 * Barbados-only place-autocomplete input wired to LocationIQ.
 * Falls back to a plain text input when the token isn't configured.
 *
 * The component holds its own state and pushes a { name, lat, lng } object
 * to the parent via onChange. Hidden inputs are emitted for plain <form>
 * submission too, named `${name}Lat` and `${name}Lng`.
 */
export default function LocationAutocomplete({
  id,
  name,
  label,
  placeholder,
  initial,
  required,
  onChange,
  className = "",
}: {
  id: string;
  name: string;
  label: React.ReactNode;
  placeholder?: string;
  initial?: LocationValue | null;
  required?: boolean;
  onChange?: (v: LocationValue) => void;
  className?: string;
}) {
  const token = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN ?? "";
  const [value, setValue] = useState<string>(initial?.name ?? "");
  const [lat, setLat] = useState<number | null>(initial?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initial?.lng ?? null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange?.({ name: value, lat, lng });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, lat, lng]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function fetchSuggestions(q: string) {
    if (!token || q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const url = `${ENDPOINT}?key=${token}&q=${encodeURIComponent(q)}&countrycodes=bb&limit=6&dedupe=1&normalizecity=1&format=json`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Suggestion[]) => {
        setSuggestions(Array.isArray(data) ? data : []);
        setOpen(true);
        setHi(-1);
      })
      .catch(() => setSuggestions([]));
  }

  function handleInput(next: string) {
    setValue(next);
    setLat(null);
    setLng(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(next), 250);
  }

  function pick(s: Suggestion) {
    const placeName = s.display_place
      ? `${s.display_place}${s.display_address ? `, ${s.display_address}` : ""}`
      : s.display_name;
    setValue(placeName);
    setLat(parseFloat(s.lat));
    setLng(parseFloat(s.lon));
    setOpen(false);
    setSuggestions([]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hi >= 0) {
      e.preventDefault();
      pick(suggestions[hi]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => value.length >= 2 && suggestions.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        className="field-input"
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
      />

      {open && suggestions.length > 0 && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-xl border-2 border-ink-600/40 bg-white shadow-soft dark:bg-ink-800 dark:border-ink-700"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.place_id}
              role="option"
              aria-selected={i === hi}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
              }}
              onMouseEnter={() => setHi(i)}
              className={`px-3 py-2 cursor-pointer text-sm ${
                i === hi
                  ? "bg-turquoise-100 text-ink-900 dark:bg-turquoise-900/40 dark:text-sand-100"
                  : "text-ink-900 dark:text-sand-100"
              }`}
            >
              <div className="font-semibold">{s.display_place ?? s.display_name}</div>
              {s.display_address && (
                <div className="text-xs text-ink-700 dark:text-sand-100/70">
                  {s.display_address}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <input type="hidden" name={`${name}Lat`} value={lat ?? ""} readOnly />
      <input type="hidden" name={`${name}Lng`} value={lng ?? ""} readOnly />
    </div>
  );
}

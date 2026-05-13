import { CONTACT, waMessage } from "@/lib/contact";

/**
 * Sticky bottom action bar shown only on phones (md:hidden).
 * Gives one-tap access to call / WhatsApp / book without scrolling.
 */
export default function MobileActionBar() {
  return (
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-sand-200 shadow-[0_-8px_24px_-12px_rgba(13,77,76,0.15)]
        dark:bg-ink-900/95 dark:border-ink-800"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="navigation"
      aria-label="Quick actions"
    >
      <div className="grid grid-cols-3 gap-1 p-2">
        <a
          href={`tel:${CONTACT.phoneTel}`}
          className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-turquoise-700 hover:bg-turquoise-50 active:bg-turquoise-100
            dark:text-turquoise-300 dark:hover:bg-ink-800 dark:active:bg-ink-700"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .58 3.6 1 1 0 0 1-.25 1l-2.23 2.2Z" />
          </svg>
          <span className="text-xs font-semibold">Call</span>
        </a>

        <a
          href={`https://wa.me/${CONTACT.whatsApp}?text=${waMessage}`}
          target="_blank"
          rel="noopener"
          className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-coral-700 hover:bg-coral-50 active:bg-coral-100
            dark:text-coral-300 dark:hover:bg-ink-800 dark:active:bg-ink-700"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M20.5 3.5A11 11 0 0 0 3.3 17.3L2 22l4.8-1.3A11 11 0 1 0 20.5 3.5Zm-8.5 17a8.9 8.9 0 0 1-4.6-1.3l-.3-.2-2.9.8.8-2.8-.2-.3a8.9 8.9 0 1 1 7.2 3.8Zm5-6.7c-.3-.1-1.6-.8-1.8-.9-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1a7.3 7.3 0 0 1-2.1-1.3 8.3 8.3 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.6l.4-.4.3-.5c.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1 2.7 11.6 11.6 0 0 0 4.5 4 5.2 5.2 0 0 0 3 .6c.6-.1 1.6-.6 1.8-1.2.2-.6.2-1.1.2-1.2 0-.1-.2-.2-.4-.2Z" />
          </svg>
          <span className="text-xs font-semibold">WhatsApp</span>
        </a>

        <a
          href="#book"
          className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 bg-turquoise-600 text-white hover:bg-turquoise-700 active:translate-y-px
            dark:bg-turquoise-500 dark:text-ink-900 dark:hover:bg-turquoise-400"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10Z" />
          </svg>
          <span className="text-xs font-semibold">Book</span>
        </a>
      </div>
    </div>
  );
}

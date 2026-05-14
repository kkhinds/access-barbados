"use client";

import { useEffect, useRef } from "react";

type TurnstileOptions = {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "invisible" | "flexible";
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement | string, options: TurnstileOptions) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
      execute: (widgetId?: string) => void;
    };
  }
}

let scriptInjected = false;

function injectScriptOnce() {
  if (scriptInjected || typeof document === "undefined") return;
  scriptInjected = true;
  const script = document.createElement("script");
  // render=explicit means CF won't auto-render — we call turnstile.render() ourselves.
  script.src =
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

/**
 * Cloudflare Turnstile widget. Renders a small, privacy-friendly bot check.
 *
 * - If `siteKey` is empty, renders nothing (graceful degradation when env
 *   var isn't set yet — the marketing site still works locally / pre-launch).
 * - Calls `onToken` with the verification token once Cloudflare issues one.
 * - Calls `onExpire` if the token expires (rare for short form submissions).
 */
export default function TurnstileWidget({
  siteKey,
  onToken,
  onExpire,
  onError,
  theme = "auto",
}: {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let giveUpTimer: ReturnType<typeof setTimeout> | null = null;

    function render() {
      if (cancelled || !window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current) {
        // Already rendered for this component instance — just reset for a fresh token.
        window.turnstile.reset(widgetIdRef.current);
        return;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token: string) => onToken(token),
        "expired-callback": () => onExpire?.(),
        "error-callback": () => onError?.(),
      });
    }

    injectScriptOnce();

    // Multiple TurnstileWidget instances can mount before the script loads.
    // Each one polls independently so they ALL render — no shared callback
    // race condition.
    if (window.turnstile) {
      render();
    } else {
      pollTimer = setInterval(() => {
        if (window.turnstile) {
          if (pollTimer) clearInterval(pollTimer);
          pollTimer = null;
          render();
        }
      }, 100);
      giveUpTimer = setTimeout(() => {
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = null;
      }, 15000);
    }

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (giveUpTimer) clearTimeout(giveUpTimer);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore: widget already removed
        }
      }
      widgetIdRef.current = null;
    };
    // Callbacks captured by closure at mount; we deliberately don't re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={containerRef} className="my-1" />;
}

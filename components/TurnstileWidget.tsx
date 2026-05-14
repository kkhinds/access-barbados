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
    onloadTurnstileCallback?: () => void;
  }
}

let scriptInjected = false;

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

    function render() {
      if (!window.turnstile || !containerRef.current) return;
      // Avoid double-rendering on hot reloads
      if (widgetIdRef.current) {
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

    if (window.turnstile) {
      render();
    } else {
      window.onloadTurnstileCallback = render;
      if (!scriptInjected) {
        scriptInjected = true;
        const script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }

    const widgetIdAtMount = widgetIdRef.current;
    return () => {
      if (widgetIdAtMount && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdAtMount);
        } catch {
          // ignore: widget already removed
        }
      }
      widgetIdRef.current = null;
    };
    // We intentionally do NOT re-run on callback prop changes — the widget
    // captures the current callbacks via closure at mount time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={containerRef} className="my-1" />;
}

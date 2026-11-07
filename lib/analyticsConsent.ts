export type AnalyticsConsent = "accepted" | "declined" | null;

export const CONSENT_STORAGE_KEY = "elfeel-analytics-consent";
const DECLINED_HISTORY_KEY = "elfeelAnalyticsDeclined";
const DECLINED_QUERY_KEY = "elfeel-analytics";

declare global {
  interface Window {
    elfeelAnalyticsConsent?: AnalyticsConsent;
  }
}

// Navigation fallbacks can only decline. They never grant permission to track.
export function readAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return null;
  if (new URL(window.location.href).searchParams.get(DECLINED_QUERY_KEY) === "declined") {
    return "declined";
  }
  if (window.history.state?.[DECLINED_HISTORY_KEY] === true) return "declined";
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === "accepted" || stored === "declined" ? stored : null;
  } catch {
    return null;
  }
}

export function currentAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return null;
  return window.elfeelAnalyticsConsent === undefined
    ? readAnalyticsConsent()
    : window.elfeelAnalyticsConsent;
}

export function restoreAnalyticsConsent(): AnalyticsConsent {
  const consent = readAnalyticsConsent();
  window.elfeelAnalyticsConsent = consent;
  return consent;
}

// Returns a decline-only URL when neither storage nor history can retain a
// revocation. Reloading that URL cannot restore an older accepted preference.
export function saveAnalyticsConsent(choice: Exclude<AnalyticsConsent, null>): string | null {
  window.elfeelAnalyticsConsent = choice;
  if (choice === "declined") window.elfeelAnalyticsQueue = [];

  let persisted = false;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    persisted = window.localStorage.getItem(CONSENT_STORAGE_KEY) === choice;
  } catch {
    // Explicit consent still applies to this document when storage is blocked.
  }

  const url = new URL(window.location.href);
  if (choice === "accepted") {
    // Preserve Next.js history fields and unrelated URL parameters/hash.
    const state = { ...window.history.state };
    delete state[DECLINED_HISTORY_KEY];
    if (url.searchParams.get(DECLINED_QUERY_KEY) === "declined") {
      url.searchParams.delete(DECLINED_QUERY_KEY);
    }
    try {
      window.history.replaceState(state, "", url.href);
    } catch {
      // Failure leaves a decline fallback, never an implicit acceptance.
    }
    return null;
  }

  if (persisted) return null;
  try {
    window.history.replaceState(
      { ...window.history.state, [DECLINED_HISTORY_KEY]: true }, "", url.href,
    );
    if (window.history.state?.[DECLINED_HISTORY_KEY] === true) return null;
  } catch {
    // Some browsers disallow history writes as well as local storage.
  }
  url.searchParams.set(DECLINED_QUERY_KEY, "declined");
  return url.href;
}

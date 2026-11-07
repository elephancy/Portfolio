import { currentAnalyticsConsent } from "./analyticsConsent";

type AnalyticsProperties = Record<string, string | number | boolean>;

type UmamiTracker = {
  track: (eventName: string, data?: AnalyticsProperties) => void;
};

declare global {
  interface Window {
    umami?: UmamiTracker;
    elfeelAnalyticsQueue?: Array<{
      eventName: string;
      properties?: AnalyticsProperties;
    }>;
  }
}

const MAX_QUEUED_EVENTS = 30;

export function trackEvent(
  eventName: string,
  properties?: AnalyticsProperties,
) {
  if (typeof window === "undefined") return;
  if (currentAnalyticsConsent() !== "accepted") return;
  if (window.umami) {
    window.umami.track(eventName, properties);
    return;
  }

  window.elfeelAnalyticsQueue ??= [];
  if (window.elfeelAnalyticsQueue.length < MAX_QUEUED_EVENTS) {
    window.elfeelAnalyticsQueue.push({ eventName, properties });
  }
}

export function flushAnalyticsQueue() {
  if (typeof window === "undefined") return;
  if (currentAnalyticsConsent() !== "accepted") {
    window.elfeelAnalyticsQueue = [];
    return;
  }
  if (!window.umami) return;
  const queued = window.elfeelAnalyticsQueue ?? [];
  window.elfeelAnalyticsQueue = [];
  queued.forEach(({ eventName, properties }) =>
    window.umami?.track(eventName, properties),
  );
}

export function trackConversion(
  step: "project" | "cv" | "repository" | "demo" | "contact",
  properties?: AnalyticsProperties,
) {
  trackEvent("Portfolio Conversion", { step, ...properties });
}

export function trackProjectOpen(projectId: string, source: string) {
  trackEvent("Project Opened", { project: projectId, source });
  trackConversion("project", { project: projectId, source });
}

export function trackAssistantQuestion(
  category: string,
  source: "suggestion" | "typed" | "command",
  fallback: boolean,
  outcome: "answered" | "failed" | "stopped" = "answered",
) {
  trackEvent("Elly Question", { category, source, fallback, outcome });
}

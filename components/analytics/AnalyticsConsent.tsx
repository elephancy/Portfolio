"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  flushAnalyticsQueue,
  trackConversion,
  trackEvent,
} from "../../lib/analytics";
import styles from "./analyticsConsent.module.css";

type ConsentState = "accepted" | "declined" | null;

const STORAGE_KEY = "elfeel-analytics-consent";

export default function AnalyticsConsent() {
  const scriptSrc =
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_SRC ??
    "/telemetry/script.js";
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const cloudflareToken = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;
  const sentryLoaderUrl = process.env.NEXT_PUBLIC_SENTRY_LOADER_URL;
  const [consent, setConsent] = useState<ConsentState>(null);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);

  useEffect(() => {
    const openSettings = () => setSettingsOpen(true);
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Keep the prompt available when storage is blocked.
    }
    if (stored === "accepted" || stored === "declined") {
      setConsent(stored);
      setSettingsOpen(false);
    } else {
      setSettingsOpen(true);
    }
    setReady(true);
    window.addEventListener("elfeel:open-privacy-settings", openSettings);
    return () =>
      window.removeEventListener("elfeel:open-privacy-settings", openSettings);
  }, []);

  useEffect(() => {
    if (consent !== "accepted") return;

    const classifyLink = (anchor: HTMLAnchorElement) => {
      const rawHref = anchor.getAttribute("href") ?? "";
      const label =
        anchor.dataset.analyticsLabel ??
        anchor.textContent?.replace(/\s+/g, " ").trim().slice(0, 80) ??
        "unlabelled";
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      const project = anchor.dataset.analyticsProject;
      const source = anchor.dataset.analyticsSource ?? "link";
      if (rawHref.startsWith("mailto:")) {
        trackEvent("Contact Clicked", { method: "email", source });
        trackConversion("contact", { method: "email", source });
      } else if (/\.pdf(?:$|[?#])/i.test(url.pathname) || anchor.hasAttribute("download")) {
        trackEvent("CV Downloaded", { file: url.pathname.split("/").pop() ?? "cv", source });
        trackConversion("cv", { source });
      } else if (url.hostname === "github.com" || url.hostname === "www.github.com") {
        trackEvent("Repository Opened", {
          destination: url.pathname.slice(0, 160),
          label,
          project: project ?? "profile",
          source,
        });
        trackConversion("repository", { project: project ?? "profile", source });
      } else if (url.hostname.includes("linkedin.com")) {
        trackEvent("Contact Clicked", { method: "linkedin", source });
        trackConversion("contact", { method: "linkedin", source });
      } else if (url.origin !== window.location.origin) {
        trackEvent("Live Demo Opened", {
          destination: url.hostname,
          label,
          project: project ?? "unknown",
          source,
        });
        trackConversion("demo", { project: project ?? "unknown", source });
      } else if (rawHref.startsWith("#")) {
        trackEvent("Navigation Used", { destination: rawHref.slice(1), source });
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (anchor) classifyLink(anchor);
    };

    const seenSections = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || seenSections.has(entry.target.id)) return;
          seenSections.add(entry.target.id);
          trackEvent("Section Viewed", { section: entry.target.id });
        });
      },
      { threshold: 0.45 },
    );
    ["featured", "about", "university", "repo-network", "contact"].forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    const onError = (event: ErrorEvent) => {
      let source = "unknown";
      if (event.filename) {
        try {
          source = new URL(event.filename, window.location.href).pathname.slice(-160);
        } catch {
          source = "unparseable";
        }
      }
      trackEvent("Client Error", {
        kind: event.error instanceof Error ? event.error.name : "Error",
        source,
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      trackEvent("Client Error", {
        kind: event.reason instanceof Error ? event.reason.name : "UnhandledRejection",
        source: "promise",
      });
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      observer.disconnect();
    };
  }, [consent]);

  const saveConsent = (nextConsent: Exclude<ConsentState, null>) => {
    const analyticsWasLoaded = consent === "accepted";
    try {
      window.localStorage.setItem(STORAGE_KEY, nextConsent);
    } catch {
      // The explicit choice still applies for this page when storage is blocked.
    }
    setConsent(nextConsent);
    setSettingsOpen(false);

    if (analyticsWasLoaded && nextConsent === "declined") {
      window.location.reload();
    }
  };

  return (
    <>
      {consent === "accepted" && websiteId ? (
        <Script
          src={scriptSrc}
          data-website-id={websiteId}
          data-host-url="/telemetry"
          data-domains="elfeel.me,www.elfeel.me"
          data-exclude-search="true"
          data-exclude-hash="true"
          data-do-not-track="true"
          data-performance="true"
          strategy="afterInteractive"
          onLoad={flushAnalyticsQueue}
        />
      ) : null}
      {consent === "accepted" && cloudflareToken ? (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: cloudflareToken, spa: true })}
          strategy="afterInteractive"
        />
      ) : null}
      {consent === "accepted" && sentryLoaderUrl ? (
        <Script src={sentryLoaderUrl} crossOrigin="anonymous" strategy="afterInteractive" />
      ) : null}

      {settingsOpen ? (
        <div className={styles.backdrop} data-initial-consent={ready ? undefined : ""}>
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="analytics-consent-title"
          >
            <span className={styles.eyebrow}>Privacy choice</span>
            <h2 id="analytics-consent-title">Optional analytics</h2>
            <p>
              This site can use privacy-friendly analytics and optional error
              reporting to measure anonymous visits, project engagement, site
              performance, and technical failures. These tools do not set
              advertising cookies, and analytics events never include what you
              type into Elly. They stay disabled unless you accept.
            </p>
            <p className={styles.necessary}>
              Your choice is stored locally so the site can remember it.
            </p>
            <div className={styles.actions}>
              <button type="button" onClick={() => saveConsent("declined")}>
                Decline analytics
              </button>
              <button
                type="button"
                className={styles.accept}
                onClick={() => saveConsent("accepted")}
              >
                Accept analytics
              </button>
            </div>
            {consent ? (
              <button
                type="button"
                className={styles.cancel}
                onClick={() => setSettingsOpen(false)}
              >
                Keep current choice
              </button>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}

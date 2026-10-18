export const projectPages = [
  {
    slug: "curate",
    title: "Curate",
    category: "Recommendation feeds",
    description:
      "Curate turns the feed someone wants into a portable plan, checks what each platform can actually change, and records the result.",
    introduction:
      "Recommendation feeds take time to shape and are difficult to carry between platforms. Curate lets a person describe the mix they want, then turns that intent into an inspectable Feed Passport. It translates the Passport into supported controls, measures the observed change, and keeps a receipt for rollback.",
    details: [
      "The public practice flow runs without a social account and shows a complete before-and-after cycle in Curate Lab and platform control twins.",
      "Real account actions have a separate owner approval and capability check. A practice result does not claim to reproduce a platform's private recommendation algorithm.",
    ],
    liveUrl: "https://curate.elfeel.me/",
    repositoryUrl: "https://github.com/elephancy/Curate",
  },
  {
    slug: "found-roll",
    title: "Found Roll",
    category: "Lost property recovery",
    description:
      "Found Roll coordinates a lost-property case across separate custodians while keeping claim evidence and release decisions under human control.",
    introduction:
      "A lost item can pass through a venue, transit system, and airline, each with its own inventory. Found Roll narrows a report to eligible custodians, uses a bounded Gemini analyst to propose one source-linked question, and records the decisions that take a case toward release.",
    details: [
      "The public Completed Case Story shows a closed synthetic camera-pouch case, its timeline, and the internal integrity summary without exposing private claim evidence.",
      "Claim acceptance, staff identity checks, supervisor approval, and release remain in protected workflows. The simulated relay is not proof of a physical handoff.",
    ],
    liveUrl: "https://foundroll.elfeel.me/",
    repositoryUrl: "https://github.com/elephancy/found-roll",
  },
] as const;

import type { MetadataRoute } from "next";

// Public routes hosted across the verified elfeel.me domain. Keep account,
// admin, API, user profile, interactive study tools, enrollment, and archived
// product hosts out of this public URL inventory. Portfolio case studies remain.
const publicRoutes: ReadonlyArray<readonly [host: string, paths: readonly string[]]> = [
  ["https://academy.elfeel.me", ["/"]],
  ["https://anubis.elfeel.me", ["/", "/hints", "/leaderboard"]],
  ["https://bachelor.elfeel.me", ["/", "/demo"]],
  ["https://commit.elfeel.me", ["/"]],
  ["https://doompedia.elfeel.me", ["/"]],
  ["https://ocpp.elfeel.me", ["/"]],
  ["https://planora.elfeel.me", ["/", "/faq", "/privacy"]],
  ["https://rps.elfeel.me", ["/", "/rules", "/privacy", "/cookies"]],
  [
    "https://scenechain.elfeel.me",
    ["/", "/how-it-works", "/privacy"],
  ],
  ["https://systemforge.elfeel.me", ["/"]],
  ["https://tariffguard.elfeel.me", ["/"]],
  [
    "https://typeshift.elfeel.me",
    [
      "/",
      "/games",
      "/boards",
      "/games/sprint",
      "/games/quote",
      "/games/elephant-run",
      "/games/flow",
      "/games/pulse",
      "/games/relay",
      "/games/cipher",
      "/games/drift",
      "/games/reverse",
      "/games/echo",
      "/games/rogue",
      "/games/rhythm-duel",
      "/games/code",
      "/games/coach",
      "/games/blackout",
      "/games/chain",
      "/games/gravity-flip",
      "/games/co-op-relay",
      "/games/infection",
      "/games/stealth",
      "/games/rhythm-chart",
      "/terms",
      "/privacy-policy",
      "/cookies",
    ],
  ],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://elfeel.me",
      changeFrequency: "weekly",
      priority: 1,
    },
    { url: "https://elfeel.me/projects/curate" },
    { url: "https://elfeel.me/projects/found-roll" },
    ...publicRoutes.flatMap(([host, paths]) =>
      paths.map((path) => ({ url: `${host}${path}` })),
    ),
  ];
}

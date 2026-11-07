export type PreviewArtifact = {
  projectId: string;
  source: 'screenshot' | 'overview';
  generatedAt: string;
  title?: string;
  summary?: string;
  states: string[];
  screenshot?: {
    kind: 'image';
    alt: string;
    path?: string;
  };
  video?: {
    sources: {
      src: string;
      type: 'video/webm' | 'video/mp4';
    }[];
    poster: string;
  };
};

export const previewArtifacts: Record<string, PreviewArtifact> = {
  portfolio: {
    projectId: 'portfolio',
    source: 'screenshot',
    generatedAt: '2026-06-28',
    title: 'Portfolio workspace',
    summary: 'Workspace shell with the Portfolio project selected.',
    states: ['Workspace shell', 'Portfolio card selected', 'Planora preview endpoint'],
    screenshot: {
      kind: 'image',
      alt: 'Portfolio workspace with the portfolio project card open and a Planora endpoint thumbnail.',
      path: '/project-previews/Portfolio.png',
    },
  },
  scheduler: {
    projectId: 'scheduler',
    source: 'screenshot',
    generatedAt: '2026-06-28',
    title: 'Planora schedule',
    summary: 'Schedule board with held activities and course slots.',
    states: ['Schedule grid', 'Course slots', 'Hold/release workflow'],
    screenshot: {
      kind: 'image',
      alt: 'Planora schedule grid with course cards across weekday slots.',
      path: '/project-previews/Planora.png',
    },
    video: {
      sources: [
        { src: '/project-previews/videos/planora.mp4', type: 'video/mp4' },
      ],
      poster: '/project-previews/Planora.png',
    },
  },
  typeshift: {
    projectId: 'typeshift',
    source: 'screenshot',
    generatedAt: '2026-06-28',
    title: 'TypeShift sprint',
    summary: 'Typing sprint setup and active run screen.',
    states: ['Sprint setup', 'Timed run', 'Word prompt'],
    screenshot: {
      kind: 'image',
      alt: 'TypeShift typing sprint screen with controls, prompt text, and run status.',
      path: '/project-previews/Typeshift.png',
    },
    video: {
      sources: [
        { src: '/project-previews/videos/typeshift.mp4', type: 'video/mp4' },
      ],
      poster: '/project-previews/Typeshift.png',
    },
  },
  doompedia: {
    projectId: 'doompedia',
    source: 'screenshot',
    generatedAt: '2026-07-04',
    title: 'Doompedia discovery',
    summary: 'The live discovery surface, topic filters, offline-friendly cards, and article summaries.',
    states: ['Topic filters', 'Article cards', 'Summary modal'],
    screenshot: {
      kind: 'image',
      alt: 'Doompedia web app showing its article discovery feed and topic filters.',
      path: '/project-previews/Doompedia.png',
    },
    video: {
      sources: [
        { src: '/project-previews/videos/doompedia.mp4', type: 'video/mp4' },
      ],
      poster: '/project-previews/Doompedia.png',
    },
  },
  'ocpp-demo': {
    projectId: 'ocpp-demo',
    source: 'screenshot',
    generatedAt: '2026-06-28',
    title: 'OCPP station operations',
    summary: 'Charging-station status, protocol events, maintenance controls, and session activity.',
    states: ['Station overview', 'Connector status', 'Protocol event stream'],
    screenshot: {
      kind: 'image',
      alt: 'OCPP station dashboard showing connector state, recent protocol messages, and maintenance actions.',
      path: '/project-previews/OCPP-Demo.png',
    },
    video: {
      sources: [
        { src: '/project-previews/videos/ocpp-demo.mp4', type: 'video/mp4' },
      ],
      poster: '/project-previews/OCPP-Demo.png',
    },
  },
  commit: {
    projectId: 'commit',
    source: 'overview',
    generatedAt: '2026-06-29',
    title: 'Commit contribution designer',
    summary: 'Browser-based GitHub contribution graph designer for painting cells, managing years, and exporting git commit commands.',
    states: ['Contribution grid', 'Year range controls', 'Command export'],
    screenshot: {
      kind: 'image',
      alt: 'Commit contribution graph designer preview.',
      path: '/project-previews/Commit.png',
    },
    video: {
      sources: [
        { src: '/project-previews/videos/commit.mp4', type: 'video/mp4' },
      ],
      poster: '/project-previews/Commit.png',
    },
  },
  anubis: {
    projectId: 'anubis',
    source: 'screenshot',
    generatedAt: '2026-07-04',
    states: ['Signal archive', 'Viewing notes', 'Puzzle world'],
    screenshot: {
      kind: 'image',
      alt: 'Anubis live site showing its analog-horror project interface.',
      path: '/project-previews/Anubis.png',
    },
    video: {
      sources: [
        { src: '/project-previews/videos/anubis.mp4', type: 'video/mp4' },
      ],
      poster: '/project-previews/Anubis.png',
    },
  },
  bachelor: {
    projectId: 'bachelor',
    source: 'screenshot',
    generatedAt: '2026-07-04',
    title: 'MANTA research prototype',
    summary: 'Bachelor thesis site with the working Android monitor, evidence, and metadata-only threat model.',
    states: ['Research question', 'Android prototype', 'Interactive evidence'],
    screenshot: {
      kind: 'image',
      alt: 'MANTA bachelor thesis site showing the Android network threat detection prototype.',
      path: '/project-previews/Bachelor.png',
    },
    video: {
      sources: [
        { src: '/project-previews/videos/bachelor.mp4', type: 'video/mp4' },
      ],
      poster: '/project-previews/Bachelor.png',
    },
  },
  rps: {
    projectId: 'rps',
    source: 'screenshot',
    generatedAt: '2026-06-28',
    title: 'RPS game loop',
    summary: 'The playable round state, score feedback, and progression interface.',
    states: ['Round state', 'Score feedback', 'Progression'],
    screenshot: {
      kind: 'image',
      alt: 'RPS web game showing the playable round and progression interface.',
    },
  },
};

const OWNER = 'elephancy';

type GithubRepo = {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics?: string[];
};

type GithubContent = {
  name: string;
  type: 'file' | 'dir';
};

type GithubRepoRef = {
  owner: string;
  name: string;
};

export type RepoLanguage = {
  name: string;
  bytes: number;
  percent: number;
};

export type RepoView = {
  name: string;
  fullName: string;
  slug: string;
  url: string;
  description: string | null;
  language: string | null;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  topics: string[];
  domain: string;
  techStack: string[];
  features: string[];
  about: string;
  languages: RepoLanguage[];
};

type CuratedRepoData = {
  domain: string;
  techStack: string[];
  features: string[];
};

// Curated from the current public README files on GitHub as of 2026-04-11.
const CURATED_REPO_DATA: Record<string, CuratedRepoData> = {
  'elephancy/MANTA': {
    domain: 'Security',
    techStack: ['Python', 'Kotlin', 'Android', 'Machine Learning', 'Network Telemetry'],
    features: [
      'Metadata-only mobile network threat detection without inspecting payload contents.',
      'Combines an Android monitoring prototype with model training and evaluation workflows.',
      'Uses flow behavior and network telemetry for on-device anomaly scoring.',
      'Documents the research evidence, privacy boundary, and deployable prototype.',
    ],
  },
  Anubis: {
    domain: 'Product',
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'MongoDB', 'Cloudinary', 'Vitest'],
    features: [
      'Alternate reality game platform with multi-step puzzle levels.',
      'Level content stored as JSON, MDX, and asset bundles.',
      'Custom hashed-cookie session auth for player progress.',
      'GitHub Actions pipeline for lint, test, and production build.',
    ],
  },
  Portfolio: {
    domain: 'Frontend',
    techStack: ['Next.js App Router', 'Chakra UI', 'TypeScript', 'Framer Motion', 'Three.js', '@react-three/fiber', 'GLSL'],
    features: [
      'Framer Motion animations and scroll-driven effects.',
      '3D hero banner powered by WebGL shaders.',
      'Modular sections for about, experience, projects, and skills.',
      'Responsive layout tuned for desktop and mobile.',
    ],
  },
  OldPortfolio: {
    domain: 'Frontend',
    techStack: ['React', 'JSX', 'React Router', 'Tailwind CSS', 'Framer Motion', 'Cloudflare Pages'],
    features: [
      'Responsive portfolio surface with modern animations.',
      'Projects section with live previews and GitHub links.',
      'Downloadable CV and resume flow.',
      'Contact section for direct outreach.',
    ],
  },
  Scheduler: {
    domain: 'Systems',
    techStack: ['Python 3.12', 'OR-Tools CP-SAT', 'PyQt6', 'pytest', 'DOCX/CSV/ICS/PDF export'],
    features: [
      'Generates and edits 12-week university timetables.',
      'Desktop UI for solve, improve, export, and project snapshots.',
      'Constraint-aware CP-SAT solver with optional local search.',
      'Exports schedules and summary reports in multiple formats.',
    ],
  },
  typeshift: {
    domain: 'Product',
    techStack: ['React 19', 'Next.js 15', 'TypeScript 5.9', 'Express 5', 'PostgreSQL', 'Zod', 'Docker'],
    features: [
      'Typing game platform with many modes, replays, and ghost racing.',
      'Secure leaderboard backend with anti-cheat and JWT sessions.',
      'Real-time multiplayer rooms, tournaments, and social profile flows.',
      'Offline queue, PWA support, and expanded accessibility presets.',
    ],
  },
  doompedia: {
    domain: 'Product',
    techStack: ['Kotlin', 'Jetpack Compose', 'Swift', 'SwiftUI', 'Shared schema contracts', 'Data pipeline tooling'],
    features: [
      'Offline-first discovery app built around Wikipedia summary cards.',
      'Native Android and iOS clients sharing ranking and manifest specs.',
      'Deterministic adaptive ranking with explicit explanation controls.',
      'Manifest-driven pack updates with delta-first refresh behavior.',
    ],
  },
  AES: {
    domain: 'Security',
    techStack: ['Assembly', 'AES-128'],
    features: [
      'AES-128 encryption flow implemented at the assembly level.',
      'Full round operations including SubBytes and MixColumns.',
      'Key expansion algorithm included alongside encryption steps.',
      'Structured for readability and cryptography learning.',
    ],
  },
  SystemsAndControl: {
    domain: 'Systems',
    techStack: ['MATLAB', 'Control System Toolbox'],
    features: [
      'Transfer function and state-space modeling utilities.',
      'Step and impulse response analysis workflows.',
      'Bode, Nyquist, and root-locus visualizations.',
      'Lead and lag compensator design experiments.',
    ],
  },
  rps: {
    domain: 'Product',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    features: [
      'Interactive web app with betting and idle/minigame loops.',
      'Task and achievement systems tied to user progression.',
      'Store, item purchases, and public profile editing.',
      'Protected auth flow across the React frontend and API backend.',
    ],
  },
  Commit: {
    domain: 'Product',
    techStack: ['Python', 'JavaScript', 'CSS', 'HTML', 'localStorage', 'Git'],
    features: [
      'Browser-based GitHub contribution graph designer.',
      'Paints contribution cells directly in the browser across single years or ranges.',
      'Exports shell snippets of git commit commands for explicit review before running.',
      'Stores graph designs locally with localStorage and includes a Python local runner.',
    ],
  },
  ChannelCoding: {
    domain: 'Data',
    techStack: ['MATLAB', 'Convolutional Codes', 'Viterbi Decoding', 'Binary Symmetric Channel'],
    features: [
      'Incremental redundancy simulation for a channel coding pipeline.',
      'Evaluates BER and throughput across BSC error probabilities.',
      'Supports punctured coding rates from 8/9 to 1/2.',
      'Produces decoded video outputs and comparison plots.',
    ],
  },
  CommunicationTheory: {
    domain: 'Data',
    techStack: ['MATLAB', 'Signal Processing', 'Huffman Coding', 'Binary Symmetric Channel'],
    features: [
      'Uniform and mu-law quantization across sampled signals.',
      'SQNR, MAE, variance, and compression-rate analysis.',
      'Huffman encode/decode stage in the transmission pipeline.',
      'Signal reconstruction with visual and statistical comparisons.',
    ],
  },
  DataAnalysis: {
    domain: 'Data',
    techStack: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'scikit-learn', 'SciPy'],
    features: [
      'EDA workflow spanning notebooks and script-based milestones.',
      'Z-score anomaly detection with threshold sweeps and metrics.',
      'Custom vectorized Naive Bayes implementation from scratch.',
      'Benchmarks against scikit-learn classifier variants.',
    ],
  },
  ChattingApplication: {
    domain: 'Systems',
    techStack: ['Python', 'TCP Sockets', 'Threading'],
    features: [
      'Socket-based client/server chat with multiple concurrent clients.',
      'Bi-directional messaging and uppercase echo responses.',
      'Graceful disconnect flow using a socket-close command.',
      'Real-time console logging for chat events and broadcasts.',
    ],
  },
  Pharmacy: {
    domain: 'Product',
    techStack: ['Kotlin', 'Jetpack Compose', 'Firebase Auth', 'Cloud Firestore', 'Firebase Storage', 'OSMDroid', 'Linphone SDK'],
    features: [
      'Patient and pharmacist role-based Android workflow.',
      'Medication browsing, cart flow, and order placement.',
      'In-app SIP calling between patients and pharmacists.',
      'Map view and pharmacist availability management.',
    ],
  },
  ProcessorSimulation: {
    domain: 'Systems',
    techStack: ['C++11', 'Make'],
    features: [
      'Custom instruction set architecture and execution flow.',
      'Simulated memory, register file, ALU, and control logic.',
      'Five-stage pipeline walkthrough from fetch to writeback.',
      'Test programs for processor behavior validation.',
    ],
  },
  Gems: {
    domain: 'Systems',
    techStack: ['Java', 'Fabric Loader', 'Fabric API', 'Gradle', 'GameTest'],
    features: [
      'Minecraft mod adding gems with holder-specific powers.',
      'Config UI integration through Mod Menu.',
      'Balance configuration reload support for servers.',
      'Unit tests plus Fabric GameTest end-to-end coverage.',
    ],
  },
};

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN?.trim();
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portfolio',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function repoApiBase({ owner, name }: GithubRepoRef) {
  return `https://api.github.com/repos/${owner}/${name}`;
}

function repoRefFromRepo(repo: GithubRepo): GithubRepoRef {
  const [owner, name] = repo.full_name?.split('/') ?? [];
  return {
    owner: owner || OWNER,
    name: name || repo.name,
  };
}

function curatedDataFor(repo: GithubRepo) {
  return CURATED_REPO_DATA[repo.full_name] ?? CURATED_REPO_DATA[repo.name];
}

function toTitle(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function fetchRootContents(repoRef: GithubRepoRef) {
  const response = await fetch(`${repoApiBase(repoRef)}/contents`, {
    headers: githubHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return [] as GithubContent[];
  }

  const data = (await response.json()) as GithubContent[];
  return Array.isArray(data) ? data : [];
}

async function fetchReadme(repoRef: GithubRepoRef) {
  const response = await fetch(`${repoApiBase(repoRef)}/readme`, {
    headers: {
      ...githubHeaders(),
      Accept: 'application/vnd.github.raw+json',
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return '';
  }

  return response.text();
}

async function fetchLanguages(repoRef: GithubRepoRef, fallbackLanguage: string | null) {
  const response = await fetch(`${repoApiBase(repoRef)}/languages`, {
    headers: githubHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return fallbackLanguage ? [{ name: fallbackLanguage, bytes: 1, percent: 100 }] : [];
  }

  const byteCounts = (await response.json()) as Record<string, number>;
  const total = Object.values(byteCounts).reduce((sum, bytes) => sum + bytes, 0);
  if (!total) {
    return fallbackLanguage ? [{ name: fallbackLanguage, bytes: 1, percent: 100 }] : [];
  }

  return Object.entries(byteCounts)
    .sort(([, left], [, right]) => right - left)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: Math.round((bytes / total) * 1000) / 10,
    }));
}

function extractAbout(readme: string, fallback: string | null) {
  const paragraph = readme
    .split(/\n\s*\n/)
    .map((block) => block.replace(/[#*`>_[\]]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1').trim())
    .find((block) => block.length >= 40 && !block.startsWith('!'));

  return paragraph?.slice(0, 420) ?? fallback ?? 'Repository details are loaded from GitHub.';
}

function extractBulletFeatures(readme: string) {
  const bullets = readme
    .split('\n')
    .map((line) => line.trim().replace(/^[-*]\s+/, ''))
    .filter((line) => line.length > 8)
    .slice(0, 4)
    .map((line) => line.replace(/[.*#`]/g, '').trim());

  return bullets;
}

function inferTechStack(language: string | null, topics: string[], rootItems: GithubContent[], readme: string) {
  const rootNames = rootItems.map((item) => item.name.toLowerCase());
  const stack = new Set<string>();

  if (language) {
    stack.add(language);
  }

  if (rootNames.includes('package.json')) stack.add('Node.js');
  if (rootNames.includes('next.config.js') || rootNames.includes('next.config.ts') || rootNames.includes('next.config.mjs')) stack.add('Next.js');
  if (rootNames.includes('requirements.txt') || rootNames.includes('pyproject.toml')) stack.add('Python');
  if (rootNames.includes('dockerfile')) stack.add('Docker');
  if (rootNames.includes('pom.xml') || rootNames.includes('build.gradle')) stack.add('Java');
  if (rootNames.includes('cargo.toml')) stack.add('Rust');
  if (rootNames.includes('go.mod')) stack.add('Go');

  const readmeLower = readme.toLowerCase();
  if (readmeLower.includes('react')) stack.add('React');
  if (readmeLower.includes('chakra')) stack.add('Chakra UI');
  if (readmeLower.includes('express')) stack.add('Express');
  if (readmeLower.includes('mongodb')) stack.add('MongoDB');
  if (readmeLower.includes('tailwind')) stack.add('Tailwind CSS');

  for (const topic of topics) {
    if (stack.size >= 7) break;
    stack.add(topic);
  }

  return [...stack].slice(0, 7);
}

function inferDomain(repo: GithubRepo, readme: string) {
  const probe = `${repo.name} ${repo.description ?? ''} ${repo.language ?? ''} ${readme}`.toLowerCase();

  if (probe.includes('portfolio') || probe.includes('frontend') || probe.includes('next.js') || probe.includes('react')) return 'Frontend';
  if (probe.includes('scheduler') || probe.includes('task') || probe.includes('calendar')) return 'Product';
  if (probe.includes('aes') || probe.includes('security') || probe.includes('encryption') || probe.includes('crypto')) return 'Security';
  if (probe.includes('pharmacy') || probe.includes('medical') || probe.includes('health')) return 'Product';
  if (probe.includes('game') || probe.includes('engine')) return 'Systems';
  if (probe.includes('data') || probe.includes('analysis')) return 'Data';

  return repo.language ? toTitle(repo.language) : 'General';
}

export async function fetchGithubRepos() {
  const response = await fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100&sort=updated`, {
    headers: githubHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch repositories from GitHub');
  }

  const primaryRepos = (await response.json()) as GithubRepo[];
  const seenRepos = new Set<string>();
  const filtered = primaryRepos.filter((repo) => {
    const repoKey = (repo.full_name || repo.name).toLowerCase();
    if (repo.name.toLowerCase().includes('.github') || seenRepos.has(repoKey)) return false;
    seenRepos.add(repoKey);
    return true;
  });

  const mapped = await Promise.all(
    filtered.map(async (repo) => {
      const repoRef = repoRefFromRepo(repo);
      const curated = curatedDataFor(repo);
      const [rootItems, readme, languages] = await Promise.all([
        curated ? Promise.resolve([] as GithubContent[]) : fetchRootContents(repoRef),
        fetchReadme(repoRef),
        fetchLanguages(repoRef, repo.language),
      ]);

      const features = curated?.features ?? extractBulletFeatures(readme);
      const techStack = curated?.techStack ?? inferTechStack(repo.language, repo.topics ?? [], rootItems, readme);
      const domain = curated?.domain ?? inferDomain(repo, readme);

      return {
        name: repo.name,
        fullName: repo.full_name || `${repoRef.owner}/${repoRef.name}`,
        slug: slugify(repo.name),
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        topics: repo.topics ?? [],
        domain,
        techStack,
        features: features.length > 0 ? features : ['Repository maintained with regular updates and clear structure.'],
        about: extractAbout(readme, repo.description),
        languages,
      } satisfies RepoView;
    }),
  );

  return mapped.sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt));
}

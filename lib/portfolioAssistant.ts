import { projects } from '../data/projects';

export const assistantProfile = {
  name: 'Mahmoud Elfeel',
  alternateName: 'Mahmoud Elfil',
  location: 'Berlin, Germany',
  role: 'Junior Software Engineer',
  education: 'B.Sc. Networking Engineering, graduating July 2026',
  focus: 'Backend and full-stack software engineering roles',
  summary: 'Berlin-based software engineer with industry experience across backend services, internal dashboards, desktop automation, Android and iOS workflows, network security, and computer-vision pipelines.',
  skills: [
    'Python',
    'FastAPI',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Express',
    'PostgreSQL',
    'MongoDB',
    'Kotlin',
    'Swift',
    'Linux',
    'Docker',
    'REST APIs',
    'CI/CD',
    'Wazuh',
    'WireGuard',
    'YOLO',
  ],
  experience: [
    {
      company: 'Resistine GmbH',
      period: 'December 2025 to present',
      role: 'Desktop and Android Developer, Network Security',
      work: [
        'Built and deployed desktop applications for Windows and Linux.',
        'Developed Android applications with Kotlin.',
        'Worked on MDM, endpoint protection, and other network-security tasks.',
      ],
    },
    {
      company: 'IAV GmbH',
      period: 'October 2024 to November 2025',
      role: 'iOS, Frontend Developer and Computer Vision',
      work: [
        'Built YOLO computer-vision pipelines for automotive data.',
        'Built dashboards and internal tools with Next.js.',
        'Prototyped Swift iOS features for vision workflows.',
        'Improved Python analysis and processing pipelines.',
      ],
    },
  ],
  email: 'mahmoudelfeelig@gmail.com',
  github: 'https://github.com/elephancy',
  linkedin: 'https://www.linkedin.com/in/elephanto',
  cv: '/Mahmoud_Elfil_CV.pdf',
};

export const assistantProjects = projects.map((project) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  category: project.category,
  status: project.status,
  stack: project.stack,
  highlights: project.highlights,
  course: project.course,
  domain: project.domain,
  repoUrl: project.repoUrl,
  liveUrl: project.liveUrl,
}));

export type AssistantCategory =
  | 'backend'
  | 'mobile'
  | 'security'
  | 'ev-charging'
  | 'thesis'
  | 'games'
  | 'contact'
  | 'cv'
  | 'general';

export type AssistantSource = {
  id: string;
  title: string;
  url: string;
  kind: 'Live project' | 'GitHub repository';
  tags: string[];
};

export type AssistantHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};

export type AssistantReply = {
  answer: string;
  projectIds: string[];
  category: AssistantCategory;
};

const singleWinnerPattern = /\b(best|strongest|hardest|toughest|most (?:complex|challenging|difficult|impressive|ambitious|relevant)|single|top|one project)\b/i;

const categoryTerms: Record<Exclude<AssistantCategory, 'general' | 'contact' | 'cv'>, string[]> = {
  backend: ['backend', 'api', 'server', 'fastapi', 'express', 'postgresql', 'mongodb', 'database', 'serverless'],
  mobile: ['mobile', 'android', 'ios', 'kotlin', 'swift', 'phone'],
  security: ['security', 'secure', 'threat', 'network', 'privacy', 'wireguard', 'wazuh', 'vulnerability'],
  'ev-charging': ['ev', 'charging', 'charger', 'ocpp', 'tariff'],
  thesis: ['thesis', 'manta', 'bachelor', 'research', 'metadata'],
  games: ['game', 'games', 'gaming', 'minecraft', 'puzzle', 'arg'],
};

const ignoredTerms = new Set([
  'about', 'and', 'are', 'best', 'built', 'can', 'could', 'does', 'for', 'from',
  'has', 'have', 'his', 'how', 'into', 'mahmoud', 'most', 'project', 'projects',
  'show', 'tell', 'that', 'the', 'this', 'what', 'which', 'with', 'work', 'would',
]);

const projectAliases: Record<string, string[]> = {
  portfolio: ['portfolio', 'elfeel.me'],
  scheduler: ['planora', 'scheduler', 'timetable'],
  typeshift: ['typeshift', 'typing game'],
  commit: ['commit', 'contribution graph'],
  'ocpp-demo': ['ocpp', 'ocpp-demo', 'charger protocol'],
  doompedia: ['doompedia', 'wikipedia discovery'],
  anubis: ['anubis', 'analog horror', 'arg'],
  bachelor: ['manta', 'bachelor thesis', 'thesis'],
  tariffguard: ['tariffguard', 'tariff guard', 'tariff validation'],
  rps: ['rps', 'rock paper scissors'],
  gems: ['gems', 'minecraft mod'],
  'processor-simulation': ['processorsimulation', 'processor simulation', 'cpu simulator'],
  'chatting-application': ['chattingapplication', 'chatting application', 'socket chat'],
  'data-analysis': ['dataanalysis', 'data analysis'],
  'communication-theory': ['communicationtheory', 'communication theory'],
  'channel-coding': ['channelcoding', 'channel coding'],
  'systems-and-control': ['systemsandcontrol', 'systems and control'],
  aes: ['aes', 'rijndael'],
  pharmacy: ['pharmacy'],
};

const projectConcepts: Record<string, string[]> = {
  tariffguard: ['backend', 'serverless', 'aws', 'lambda', 'dynamodb', 'event processing', 'audit', 'ev charging'],
  typeshift: ['backend', 'full stack', 'express', 'postgresql', 'authentication', 'multiplayer', 'web app'],
  scheduler: ['backend', 'optimization', 'algorithm', 'or-tools', 'constraint solver', 'python', 'desktop'],
  bachelor: ['security', 'privacy', 'android', 'kotlin', 'machine learning', 'network', 'research'],
  'ocpp-demo': ['backend', 'websocket', 'protocol', 'ocpp', 'ev charging', 'python'],
  doompedia: ['mobile', 'android', 'ios', 'kotlin', 'swift', 'offline'],
  anubis: ['game', 'puzzle', 'arg', 'next.js', 'mongodb'],
  'chatting-application': ['backend', 'networking', 'socket', 'tcp', 'python'],
  aes: ['security', 'cryptography', 'encryption', 'assembly'],
  pharmacy: ['mobile', 'android', 'kotlin', 'firebase'],
  portfolio: ['frontend', 'next.js', 'react', 'typescript', 'webgl'],
};

const categoryProjectPriority: Partial<Record<AssistantCategory, Record<string, number>>> = {
  backend: { tariffguard: 8, typeshift: 6, scheduler: 4, 'ocpp-demo': 3, 'chatting-application': 2 },
  mobile: { doompedia: 8, bachelor: 6, pharmacy: 4 },
  security: { bachelor: 8, aes: 5 },
  'ev-charging': { tariffguard: 8, 'ocpp-demo': 7 },
  thesis: { bachelor: 10 },
  games: { anubis: 8, gems: 5, rps: 3 },
};

const comparativeProjectPriority: Array<{ pattern: RegExp; projectIds: string[] }> = [
  {
    pattern: /\b(hardest|toughest|most (?:complex|challenging|difficult|ambitious))\b/i,
    projectIds: ['bachelor', 'tariffguard', 'typeshift', 'scheduler'],
  },
  {
    pattern: /\b(most impressive|strongest overall|best overall)\b/i,
    projectIds: ['bachelor', 'tariffguard', 'typeshift', 'anubis'],
  },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').trim();
}

function queryTerms(question: string) {
  return Array.from(new Set(
    normalize(question)
      .split(/\s+/)
      .filter((term) => term.length > 2 && !ignoredTerms.has(term)),
  ));
}

function explicitlyNamedProjectIds(question: string) {
  const normalized = ` ${normalize(question)} `;
  return assistantProjects
    .filter((project) => (projectAliases[project.id] ?? [project.title]).some((alias) => {
      const normalizedAlias = normalize(alias);
      return normalizedAlias.length > 2 && normalized.includes(` ${normalizedAlias} `);
    }))
    .map((project) => project.id);
}

export function classifyQuestion(question: string): AssistantCategory {
  const normalized = ` ${normalize(question)} `;
  if (/contact|email|linkedin|reach mahmoud/.test(normalized)) return 'contact';
  if (/\bcv\b|résumé|resume/.test(normalized)) return 'cv';

  let best: AssistantCategory = 'general';
  let bestScore = 0;
  for (const [category, terms] of Object.entries(categoryTerms)) {
    const score = terms.reduce((total, term) => (
      total + (normalized.includes(` ${normalize(term)} `) ? 1 : 0)
    ), 0);
    if (score > bestScore) {
      best = category as AssistantCategory;
      bestScore = score;
    }
  }
  return best;
}

export function findRelevantProjects(question: string, limit = 5) {
  const category = classifyQuestion(question);
  const terms = queryTerms(question);
  const explicitIds = explicitlyNamedProjectIds(question);

  if (explicitIds.length) {
    return explicitIds
      .map((id) => assistantProjects.find((project) => project.id === id))
      .filter((project): project is (typeof assistantProjects)[number] => Boolean(project))
      .slice(0, limit);
  }

  const comparativeRanking = comparativeProjectPriority.find(({ pattern }) => pattern.test(question));
  if (comparativeRanking && category === 'general') {
    return comparativeRanking.projectIds
      .map((id) => assistantProjects.find((project) => project.id === id))
      .filter((project): project is (typeof assistantProjects)[number] => Boolean(project))
      .slice(0, limit);
  }

  return assistantProjects
    .map((project, index) => {
      const title = normalize(`${project.title} ${project.id} ${(projectAliases[project.id] ?? []).join(' ')}`);
      const stack = normalize(project.stack.join(' '));
      const details = normalize([
        project.description,
        project.category,
        project.course,
        project.domain,
        ...project.highlights,
      ].filter(Boolean).join(' '));
      const concepts = normalize((projectConcepts[project.id] ?? []).join(' '));
      const score = terms.reduce((total, term) => (
        total
        + (title.includes(term) ? 12 : 0)
        + (concepts.includes(term) ? 6 : 0)
        + (stack.includes(term) ? 4 : 0)
        + (details.includes(term) ? 2 : 0)
      ), 0)
        + (
          category !== 'general'
          && (projectConcepts[project.id] ?? []).includes(category)
            ? 5
            : 0
        )
        + (categoryProjectPriority[category]?.[project.id] ?? 0)
        + (project.status === 'featured' ? 0.15 : 0);
      return { project, score, index };
    })
    .filter(({ score }) => score >= 2)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ project }) => project);
}

export function projectContextLimit(question: string) {
  if (explicitlyNamedProjectIds(question).length) return 1;
  if (singleWinnerPattern.test(question)) return 1;
  if (/\b(compare|projects|examples|portfolio|work)\b/i.test(question)) return 3;
  return 2;
}

export function isSingleWinnerQuestion(question: string) {
  return singleWinnerPattern.test(question);
}

export function projectSources(projectIds: string[]): AssistantSource[] {
  return Array.from(new Set(projectIds))
    .map((id) => assistantProjects.find((project) => project.id === id))
    .filter((project): project is (typeof assistantProjects)[number] => Boolean(project))
    .map((project) => ({
      id: project.id,
      title: project.title,
      url: project.liveUrl ?? project.repoUrl,
      kind: project.liveUrl ? 'Live project' : 'GitHub repository',
      tags: project.stack.slice(0, 3),
    }));
}

function projectSummary(question: string, limit = 3): AssistantReply {
  const category = classifyQuestion(question);
  const matches = findRelevantProjects(question, limit);
  if (!matches.length) {
    return {
      answer: 'That detail is not documented in Mahmoud’s public portfolio, so I cannot answer it reliably. I can instead explain which published project best matches a role or technology.',
      projectIds: [],
      category,
    };
  }
  return {
    answer: matches.length === 1
      ? `${matches[0].title} is the strongest match. ${matches[0].description} Its published highlights include ${matches[0].highlights.slice(0, 2).join(' and ').toLowerCase()}.`
      : matches.map((project) => `${project.title}: ${project.description}`).join('\n\n'),
    projectIds: matches.map((project) => project.id),
    category,
  };
}

export function runDeterministicCommand(question: string): AssistantReply | null {
  const command = question.trim().toLowerCase();
  if (!command.startsWith('/')) return null;

  if (command === '/contact') {
    return {
      answer: `The fastest way to reach Mahmoud is ${assistantProfile.email}. You can also use LinkedIn or GitHub from the contact links below.`,
      projectIds: [],
      category: 'contact',
    };
  }
  if (command === '/cv' || command === '/resume') {
    return {
      answer: 'Mahmoud’s CV covers his software engineering experience across backend, desktop, mobile, network security, and computer vision work.',
      projectIds: [],
      category: 'cv',
    };
  }
  if (command.startsWith('/explain manta')) {
    return projectSummary('MANTA bachelor thesis metadata mobile network security', 1);
  }
  if (command.startsWith('/projects ')) {
    return projectSummary(command.replace('/projects ', ''), 3);
  }
  return {
    answer: 'I know /projects backend, /projects mobile, /projects security, /projects games, /explain manta, /cv, and /contact.',
    projectIds: [],
    category: 'general',
  };
}

export function fallbackReply(question: string): AssistantReply {
  const category = classifyQuestion(question);
  if (category === 'contact') return runDeterministicCommand('/contact') as AssistantReply;
  if (category === 'cv') return runDeterministicCommand('/cv') as AssistantReply;
  return projectSummary(question, projectContextLimit(question));
}

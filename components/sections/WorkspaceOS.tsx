'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronUp,
  ExternalLink,
  FileText,
  Folder,
  GitBranch,
  Github,
  GraduationCap,
  Home,
  Layers,
  Mail,
  Maximize2,
  MessageCircle,
  Minus,
  Minimize2,
  MonitorSmartphone,
  Network,
  Plus,
  Search,
  SlidersHorizontal,
  Shield,
  Sparkles,
  Trash2,
  UserRound,
  X,
  Terminal,
} from 'lucide-react';
import {
  featuredProject,
  getProjectStats,
  projects,
  universityProjects,
  type PortfolioProject,
} from '../../data/projects';
import { previewArtifacts } from '../../data/projectPreviewArtifacts';
import { trackEvent, trackProjectOpen } from '../../lib/analytics';
import type { RepoView } from '../../lib/githubPortfolioData';
import { PortfolioAssistant } from '../ui/PortfolioAssistant';
import styles from './workspaceOS.module.css';

const RepoNetwork = dynamic(
  () => import('./RepoNetwork').then((module) => module.RepoNetwork),
  {
    ssr: false,
    loading: () => <div className={styles.networkLoading}>Loading repository network...</div>,
  },
);

type Mode = 'All' | 'Full-stack' | 'Security' | 'Mobile';
type RepoFilter = 'all' | 'active' | 'archived';
type DeviceKind = 'desktop' | 'touch';
type AppWindow = 'projects' | 'graph' | 'terminal' | 'resume' | 'contact' | 'assistant';
type ActiveAppWindow = Exclude<AppWindow, null>;
type WindowLayout = 'normal' | 'maximized';
type WindowState = {
  app: ActiveAppWindow;
  layout: WindowLayout;
  minimized: boolean;
  position: { x: number; y: number };
};
type DragState = {
  app: ActiveAppWindow;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};
type SavedWorkspace = {
  id: number;
  name: string;
  mode: Mode;
  selectedId: string;
  projectIds: string[];
  fixed: boolean;
};

const WINDOW_WIDTH = 680;
const WINDOW_TOP = 86;
const WINDOW_EDGE_GAP = 12;
const TASKBAR_CLEARANCE = 118;

function clampWindowPosition(position: { x: number; y: number }) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(WINDOW_WIDTH, viewportWidth - WINDOW_EDGE_GAP * 2);
  const height = Math.min(viewportHeight * 0.72, 680);
  const maxX = Math.max(0, (viewportWidth - width) / 2 - WINDOW_EDGE_GAP);
  const minY = 64 - WINDOW_TOP;
  const maxY = Math.max(minY, viewportHeight - TASKBAR_CLEARANCE - height - WINDOW_TOP);

  return {
    x: Math.max(-maxX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y)),
  };
}

const FEATURED_PROJECT_IDS = ['portfolio', 'scheduler', 'typeshift', 'doompedia', 'ocpp-demo', 'anubis', 'bachelor', 'tariffguard', 'commit'];
const MAX_WORKSPACES = 4;
const modes: Mode[] = ['All', 'Full-stack', 'Security', 'Mobile'];
const navItems = [
  { label: 'Featured', icon: BriefcaseBusiness, target: 'projects' },
  { label: 'About', icon: UserRound, target: 'about' },
  { label: 'Academic', icon: BookOpen, target: 'university' },
  { label: 'Repositories', icon: Github, target: 'repo-network' },
];

const taskbarItems = [
  { label: 'Ask Elly', icon: Sparkles, href: '#assistant', projectId: 'portfolio', app: 'assistant' as ActiveAppWindow },
  { label: 'Projects', icon: Folder, href: '#projects', projectId: 'portfolio', app: 'projects' as ActiveAppWindow },
  { label: 'Repo Network', icon: GitBranch, href: '#repo-network', projectId: 'portfolio', app: 'graph' as ActiveAppWindow },
  { label: 'Terminal', icon: Terminal, href: '#terminal', projectId: 'portfolio', app: 'terminal' as ActiveAppWindow },
  { label: 'CV', icon: FileText, href: '#resume', projectId: 'portfolio', app: 'resume' as ActiveAppWindow },
  { label: 'Contact', icon: MessageCircle, href: '#contact', projectId: 'portfolio', app: 'contact' as ActiveAppWindow },
];

const modeProjectIds: Record<Mode, string[]> = {
  All: FEATURED_PROJECT_IDS,
  'Full-stack': ['portfolio', 'scheduler', 'typeshift', 'commit', 'anubis', 'ocpp-demo', 'tariffguard'],
  Security: ['ocpp-demo', 'typeshift', 'bachelor', 'tariffguard'],
  Mobile: ['doompedia', 'bachelor'],
};

const modeDescriptions: Record<Mode, string> = {
  All: 'The complete featured workspace across product, systems, security, and mobile work.',
  'Full-stack': 'Product interfaces, APIs, scheduling systems, and full-stack application work.',
  Security: 'Protocol operations, cryptography, network software, and secure systems work.',
  Mobile: 'Native Android and iOS products, offline data, and mobile workflows.',
};

const fallbackProjectLanguages: Record<string, string[]> = {
  portfolio: ['TypeScript', 'CSS', 'JavaScript'],
  scheduler: ['Python', 'TypeScript', 'CSS'],
  typeshift: ['TypeScript', 'JavaScript', 'CSS'],
  doompedia: ['Kotlin', 'Swift', 'Python'],
  'ocpp-demo': ['Python', 'TypeScript', 'CSS'],
  anubis: ['TypeScript', 'MDX', 'CSS'],
  bachelor: ['Python', 'Kotlin', 'TypeScript'],
  tariffguard: ['TypeScript', 'Python', 'HCL'],
  commit: ['Python', 'JavaScript', 'CSS'],
  rps: ['JavaScript', 'CSS', 'HTML'],
  pharmacy: ['Kotlin', 'Java'],
};

const DEFAULT_WORKSPACES: SavedWorkspace[] = [
  { id: 1, name: 'Workspace 1', mode: 'All', selectedId: 'portfolio', projectIds: FEATURED_PROJECT_IDS, fixed: true },
  { id: 2, name: 'Workspace 2', mode: 'All', selectedId: 'portfolio', projectIds: FEATURED_PROJECT_IDS, fixed: false },
];

const languageClass: Record<string, string> = {
  TypeScript: styles.langBlue,
  Python: styles.langGreen,
  Kotlin: styles.langPurple,
  Java: styles.langOrange,
  JavaScript: styles.langYellow,
  MATLAB: styles.langRose,
  Assembly: styles.langRed,
  C: styles.langCyan,
  'Jupyter Notebook': styles.langAmber,
};

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572a5',
  Kotlin: '#a97bff',
  Swift: '#f05138',
  CSS: '#663399',
  HTML: '#e34c26',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  MATLAB: '#e16737',
  Assembly: '#6e4c13',
  'Jupyter Notebook': '#da5b0b',
  MDX: '#fcb32c',
};

function matchesProject(project: PortfolioProject, query: string) {
  const searchable = [
    project.title,
    project.repoName,
    project.description,
    project.category,
    project.status,
    project.language,
    project.domain,
    project.course,
    project.semester,
    ...project.stack,
    ...project.highlights,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const queryMatch = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => searchable.includes(term));

  if (!queryMatch) return false;
  if (!query) return true;
  return true;
}

function detectDevice(): DeviceKind {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'desktop';
  return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 ? 'touch' : 'desktop';
}

function ShortcutHint({ device }: { device: DeviceKind }) {
  if (device === 'touch') {
    return (
      <span className={styles.shortcutHint}>
        <MonitorSmartphone size={13} aria-hidden="true" /> Tap
      </span>
    );
  }

  return (
    <span className={styles.shortcutHint}>
      <kbd>/</kbd>
    </span>
  );
}

function findGithubRepo(project: PortfolioProject, githubRepos: RepoView[]) {
  const projectRepoUrl = project.repoUrl.toLowerCase();
  const projectRepoName = project.repoName.toLowerCase();

  return githubRepos.find((repo) => repo.url.toLowerCase() === projectRepoUrl)
    ?? githubRepos.find((repo) => (repo.fullName ?? repo.name).toLowerCase().endsWith(`/${projectRepoName}`))
    ?? githubRepos.find((repo) => repo.name.toLowerCase() === projectRepoName);
}

function getProjectUpdatedAt(project: PortfolioProject, githubRepos: RepoView[]) {
  const githubRepo = findGithubRepo(project, githubRepos);
  return githubRepo?.pushedAt ?? githubRepo?.updatedAt ?? project.updatedAt;
}

function getProjectLanguages(project: PortfolioProject, githubRepos: RepoView[]) {
  const githubLanguages = findGithubRepo(project, githubRepos)?.languages.slice(0, 3);
  if (githubLanguages?.length) {
    const total = githubLanguages.reduce((sum, language) => sum + language.bytes, 0);
    return githubLanguages.map((language) => ({
      name: language.name,
      percent: total > 0 ? (language.bytes / total) * 100 : 0,
    }));
  }

  const names = fallbackProjectLanguages[project.id] ?? [project.language];
  const fallbackPercentages = names.length === 1 ? [100] : names.length === 2 ? [68, 32] : [58, 27, 15];
  return names.slice(0, 3).map((name, index) => ({ name, percent: fallbackPercentages[index] ?? 0 }));
}

function ProjectLanguages({
  project,
  githubRepos = [],
  detailed = false,
}: {
  project: PortfolioProject;
  githubRepos?: RepoView[];
  detailed?: boolean;
}) {
  const languages = getProjectLanguages(project, githubRepos);
  return (
    <div className={`${styles.projectLanguages} ${detailed ? styles.projectLanguagesDetailed : ''}`} aria-label={`${project.title} top languages`}>
      {detailed ? <strong>Languages</strong> : null}
      <span className={styles.languageComposition}>
        {languages.map((language) => (
          <i
            key={language.name}
            style={{
              width: `${language.percent}%`,
              background: languageColors[language.name] ?? '#8b949e',
            }}
          />
        ))}
      </span>
      <span className={styles.languageLegend}>
        {languages.map((language) => (
          <span key={language.name}>
            <i style={{ background: languageColors[language.name] ?? '#8b949e' }} />
            <b>{language.name}</b>
            {language.percent.toFixed(1)}%
          </span>
        ))}
      </span>
    </div>
  );
}

function LiveCardPreview({ project }: { project: PortfolioProject }) {
  const values = Array.from({ length: 18 }, (_, index) => {
    const wave = Math.sin((index + project.title.length) * 0.72) * 7;
    const trend = index * 0.62;
    const variation = ((project.title.charCodeAt(index % project.title.length) + index * 11) % 9) - 4;
    return Math.max(4, Math.min(30, 10 + wave + trend + variation));
  });
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 180},${34 - value}`).join(' ');

  return (
    <span className={styles.cardGraph} aria-label={`${project.title} repository activity trend`}>
      <svg viewBox="0 0 180 36" preserveAspectRatio="none" aria-hidden="true">
        <g>
          <line x1="0" y1="9" x2="180" y2="9" />
          <line x1="0" y1="18" x2="180" y2="18" />
          <line x1="0" y1="27" x2="180" y2="27" />
          <line x1="45" y1="0" x2="45" y2="36" />
          <line x1="90" y1="0" x2="90" y2="36" />
          <line x1="135" y1="0" x2="135" y2="36" />
        </g>
        <polyline points={points} />
      </svg>
    </span>
  );
}

function ScreenshotPreview({ project }: { project: PortfolioProject }) {
  const artifact = previewArtifacts[project.id];
  const screenshotPath = artifact?.screenshot?.path;
  const screenshotAlt = artifact?.screenshot?.alt ?? `${project.title} project screenshot`;
  const [failedPath, setFailedPath] = useState<string | null>(null);
  if (!screenshotPath || failedPath === screenshotPath) return null;

  return (
    <div className={styles.screenshotFrame}>
      <img src={screenshotPath} alt={screenshotAlt} onError={() => setFailedPath(screenshotPath)} />
    </div>
  );
}

function VideoPreview({ project }: { project: PortfolioProject }) {
  const artifact = previewArtifacts[project.id];
  const [videoFailed, setVideoFailed] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const trackedPlayback = useRef(false);
  const video = artifact?.video;

  if (!video || videoFailed) {
    return <ScreenshotPreview project={project} />;
  }

  return (
    <div className={styles.videoFrame}>
      {!canPlay ? <ScreenshotPreview project={project} /> : null}
      <video
        key={project.id}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        controlsList="nodownload nofullscreen noplaybackrate"
        tabIndex={-1}
        aria-label={`${project.title} project walkthrough`}
        poster={video.poster}
        preload="metadata"
        onContextMenu={(event) => event.preventDefault()}
        onCanPlay={() => setCanPlay(true)}
        onPlay={() => {
          if (trackedPlayback.current) return;
          trackedPlayback.current = true;
          trackEvent('Project Preview Played', { project: project.id });
        }}
        onError={() => setVideoFailed(true)}
      >
        {video.sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>
    </div>
  );
}

function ProjectPreview({ project }: { project: PortfolioProject }) {
  const artifact = previewArtifacts[project.id];
  const [recursiveLevel, setRecursiveLevel] = useState(1);

  useEffect(() => {
    if (project.id !== 'portfolio') return;
    setRecursiveLevel(1);
    const interval = window.setInterval(() => {
      setRecursiveLevel((level) => level + 1);
    }, 9000);
    return () => window.clearInterval(interval);
  }, [project.id]);

  if (project.id === 'portfolio') {
    const screenshotPath = artifact?.screenshot?.path ?? '/project-previews/Portfolio.png';

    return (
      <div className={`${styles.previewShell} ${styles.portfolioPreview}`} aria-label="Portfolio preview">
        <div className={styles.recursiveViewport}>
          <div className={styles.recursiveScreen}>
            <img src={screenshotPath} alt="The elfeel.me workspace recursively displaying itself." decoding="async" />
            <div className={styles.recursiveLayers} aria-hidden="true">
              {[0.68, 0.4624, 0.3144, 0.2138, 0.1454, 0.0989, 0.0672, 0.0457].map((scale, index) => (
                <span key={index} style={{ '--depth': index, '--recursive-scale': scale } as CSSProperties}>
                  <img src={screenshotPath} alt="" loading="lazy" decoding="async" />
                </span>
              ))}
            </div>
          </div>
          <div className={styles.recursiveStatus}>
            <span>
              <strong>Level {recursiveLevel} of ∞</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.previewShell} ${styles.artifactPreview}`} aria-label={`${project.title} preview`}>
      <VideoPreview project={project} />
    </div>
  );
}

function getWindowMeta(openWindow: ActiveAppWindow) {
  if (openWindow === 'assistant') return { title: 'Ask Elly', icon: Sparkles };
  if (openWindow === 'graph') return { title: 'Repo Network', icon: GitBranch };
  if (openWindow === 'terminal') return { title: 'Terminal', icon: Terminal };
  if (openWindow === 'resume') return { title: 'CV', icon: FileText };
  if (openWindow === 'contact') return { title: 'Contact', icon: MessageCircle };
  if (openWindow === 'projects') return { title: 'Project Explorer', icon: Folder };
  return { title: 'Projects', icon: Folder };
}

function ProjectGlyph({ project }: { project: PortfolioProject }) {
  const Icon =
    project.id === 'scheduler'
      ? CalendarDays
      : project.id === 'portfolio'
        ? Layers
        : project.id === 'gems'
          ? Sparkles
          : project.id === 'aes'
            ? Shield
            : project.category === 'university'
              ? GraduationCap
              : Layers;

  return (
    <span className={`${styles.projectGlyph} ${languageClass[project.language] ?? styles.langBlue}`}>
      <Icon size={21} strokeWidth={2.1} />
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(value));
}

export default function WorkspaceOS() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>('All');
  const [repoFilter, setRepoFilter] = useState<RepoFilter>('all');
  const [selectedId, setSelectedId] = useState('portfolio');
  const [workspaces, setWorkspaces] = useState<SavedWorkspace[]>(DEFAULT_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(1);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [workspaceEditorOpen, setWorkspaceEditorOpen] = useState(false);
  const [device, setDevice] = useState<DeviceKind>('desktop');
  const [activeWindow, setActiveWindow] = useState<ActiveAppWindow | null>(null);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>(['$ help', 'Commands: help, status, projects, graph, cv, contact, select <project>, filter <all|active|archived>, clear']);
  const [goMode, setGoMode] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);
  const [githubRepos, setGithubRepos] = useState<RepoView[]>([]);
  const [activeNav, setActiveNav] = useState('featured');
  const [emailCopied, setEmailCopied] = useState(false);
  const stats = getProjectStats();

  const copyEmail = () => {
    navigator.clipboard?.writeText('mahmoudelfeelig@gmail.com').then(
      () => {
        setEmailCopied(true);
        window.setTimeout(() => setEmailCopied(false), 2200);
      },
      () => setEmailCopied(false),
    );
  };

  useEffect(() => {
    setDevice(detectDevice());
  }, []);

  useEffect(() => {
    fetch('/api/github/repos')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('GitHub repository request failed')))
      .then((payload: { repos?: RepoView[] }) => setGithubRepos(payload.repos ?? []))
      .catch(() => setGithubRepos([]));
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('elfeel-workspaces-v2');
      if (saved) {
        const parsed = JSON.parse(saved) as SavedWorkspace[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed
            .slice(0, MAX_WORKSPACES)
            .filter((workspace) => workspace.id >= 1 && workspace.id <= MAX_WORKSPACES)
            .map((workspace) => ({
              ...workspace,
              fixed: workspace.id === 1,
              mode: modes.includes(workspace.mode) ? workspace.mode : 'All',
              projectIds: workspace.id === 1
                ? FEATURED_PROJECT_IDS
                : workspace.projectIds?.filter((id) => FEATURED_PROJECT_IDS.includes(id)) ?? FEATURED_PROJECT_IDS,
            }));
          const restored = normalized.some((workspace) => workspace.id === 1)
            ? normalized
            : [DEFAULT_WORKSPACES[0], ...normalized].slice(0, MAX_WORKSPACES);
          setWorkspaces(restored);
          setActiveWorkspaceId(restored[0].id);
          setMode(restored[0].mode);
          setSelectedId(restored[0].selectedId);
        }
      }

      const params = new URLSearchParams(window.location.search);
      const requestedProject = projects.find((project) => project.id === params.get('project'));
      const requestedMode = modes.find((candidate) => candidate.toLowerCase() === params.get('mode')?.toLowerCase());
      const requestedStatus = params.get('status');

      if (requestedProject) setSelectedId(requestedProject.id);
      if (requestedMode) setMode(requestedMode);
      if (requestedStatus && ['all', 'active', 'archived'].includes(requestedStatus)) {
        setRepoFilter(requestedStatus as RepoFilter);
      }
      if (params.get('q')) setQuery(params.get('q')?.slice(0, 80) ?? '');
      if (params.get('view') === 'graph') {
        setWindows([{ app: 'graph', layout: 'maximized', minimized: false, position: { x: 0, y: 0 } }]);
        setActiveWindow('graph');
      }
    } catch {
      setWorkspaces(DEFAULT_WORKSPACES);
    } finally {
      setWorkspaceReady(true);
    }
  }, []);

  useEffect(() => {
    if (!workspaceReady) return;

    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    if (selectedId !== 'portfolio') params.set('project', selectedId);
    if (mode !== 'All') params.set('mode', mode.toLowerCase());
    if (repoFilter !== 'all') params.set('status', repoFilter);
    if (query.trim()) params.set('q', query.trim());
    if (activeWindow === 'graph') params.set('view', 'graph');

    url.search = params.toString();
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [activeWindow, mode, query, repoFilter, selectedId, workspaceReady]);

  useEffect(() => {
    if (!workspaceReady) return;
    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === activeWorkspaceId ? { ...workspace, mode, selectedId } : workspace,
      ),
    );
  }, [activeWorkspaceId, mode, selectedId, workspaceReady]);

  useEffect(() => {
    if (!workspaceReady) return;
    window.localStorage.setItem('elfeel-workspaces-v2', JSON.stringify(workspaces));
  }, [workspaceReady, workspaces]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if (event.key === 'Escape') {
        setTrayOpen(false);
        setGoMode(false);
        return;
      }

      if (isTyping) return;

      if (event.key === '/') {
        event.preventDefault();
        document.getElementById('project-search')?.focus();
        return;
      }

      if (event.key.toLowerCase() === 'g') {
        event.preventDefault();
        setGoMode(true);
        return;
      }

      if (goMode) {
        const key = event.key.toLowerCase();
        if (key === 'p') document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        if (key === 'r') document.getElementById('repos')?.scrollIntoView({ behavior: 'smooth' });
        if (key === 'g') openApp('graph');
        if (key === 'u') document.getElementById('university')?.scrollIntoView({ behavior: 'smooth' });
        if (key === 'c') {
          openApp('contact');
        }
        setGoMode(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goMode]);

  useEffect(() => {
    if (!dragState) return;

    const onPointerMove = (event: PointerEvent) => {
      const position = clampWindowPosition({
        x: dragState.originX + event.clientX - dragState.startX,
        y: dragState.originY + event.clientY - dragState.startY,
      });
      setWindows((current) =>
        current.map((windowItem) =>
          windowItem.app === dragState.app
            ? {
                ...windowItem,
                position,
              }
            : windowItem,
        ),
      );
    };

    const onPointerUp = () => setDragState(null);

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragState]);

  useEffect(() => {
    const keepWindowsInViewport = () => {
      setWindows((current) =>
        current.map((windowItem) =>
          windowItem.layout === 'normal'
            ? { ...windowItem, position: clampWindowPosition(windowItem.position) }
            : windowItem,
        ),
      );
    };

    window.addEventListener('resize', keepWindowsInViewport);
    return () => window.removeEventListener('resize', keepWindowsInViewport);
  }, []);

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? DEFAULT_WORKSPACES[0];
  const workspaceProjectIds = activeWorkspace.fixed ? FEATURED_PROJECT_IDS : activeWorkspace.projectIds;
  const selectedProject = projects.find((project) => project.id === selectedId) ?? featuredProject;
  const modeProjects = useMemo(
    () => {
      const allowedProjectIds = new Set(modeProjectIds[mode]);
      return workspaceProjectIds
        .filter((id) => allowedProjectIds.has(id))
        .map((id) => projects.find((project) => project.id === id))
        .filter(Boolean) as PortfolioProject[];
    },
    [mode, workspaceProjectIds],
  );
  const filteredProjects = useMemo(
    () => modeProjects.filter((project) => matchesProject(project, query)),
    [modeProjects, query],
  );

  const explorerProjects = projects.filter((project) => {
    if (repoFilter === 'active') return project.status !== 'archived';
    if (repoFilter === 'archived') return project.status === 'archived';
    return true;
  });
  const searchResults = useMemo(
    () => query.trim() ? projects.filter((project) => matchesProject(project, query)).slice(0, 8) : [],
    [query],
  );

  const activeExplorer = explorerProjects.filter((project) => project.status !== 'archived');
  const archivedExplorer = explorerProjects.filter((project) => project.status === 'archived');

  const selectProject = (project: PortfolioProject, source: string) => {
    setSelectedId(project.id);
    trackProjectOpen(project.id, source);
  };

  const activateWorkspace = (workspace: SavedWorkspace) => {
    setActiveWorkspaceId(workspace.id);
    setMode(workspace.mode);
    setSelectedId(workspace.selectedId);
    setQuery('');
    setWorkspaceEditorOpen(false);
  };

  const addWorkspace = () => {
    if (workspaces.length >= MAX_WORKSPACES) return;
    const nextId = [2, 3, 4].find((id) => !workspaces.some((workspace) => workspace.id === id));
    if (!nextId) return;
    const workspace: SavedWorkspace = {
      id: nextId,
      name: `Workspace ${nextId}`,
      mode: 'All',
      selectedId: 'portfolio',
      projectIds: FEATURED_PROJECT_IDS,
      fixed: false,
    };
    setWorkspaces((current) => [...current, workspace]);
    setActiveWorkspaceId(nextId);
    setMode('All');
    setSelectedId('portfolio');
    setQuery('');
    setWorkspaceEditorOpen(true);
  };

  const changeMode = (nextMode: Mode) => {
    if (nextMode !== mode) trackEvent('Project Mode Changed', { mode: nextMode });
    setMode(nextMode);
    const allowedProjectIds = new Set(modeProjectIds[nextMode]);
    const nextProjectId = workspaceProjectIds.find((id) => allowedProjectIds.has(id));
    if (nextProjectId) setSelectedId(nextProjectId);
    setQuery('');
  };

  const renameWorkspace = (name: string) => {
    if (activeWorkspace.fixed) return;
    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === activeWorkspaceId ? { ...workspace, name: name.slice(0, 24) } : workspace,
      ),
    );
  };

  const toggleWorkspaceProject = (projectId: string) => {
    if (activeWorkspace.fixed) return;
    const currentlySelected = activeWorkspace.projectIds.includes(projectId);
    if (currentlySelected && activeWorkspace.projectIds.length === 1) return;
    const nextProjectIds = currentlySelected
      ? activeWorkspace.projectIds.filter((id) => id !== projectId)
      : FEATURED_PROJECT_IDS.filter((id) => id === projectId || activeWorkspace.projectIds.includes(id));

    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === activeWorkspaceId ? { ...workspace, projectIds: nextProjectIds } : workspace,
      ),
    );

    if (currentlySelected && selectedId === projectId) {
      const allowedProjectIds = new Set(modeProjectIds[mode]);
      const filteredReplacement = nextProjectIds.find((id) => allowedProjectIds.has(id));
      const replacement = filteredReplacement ?? nextProjectIds[0];
      if (!filteredReplacement) setMode('All');
      setSelectedId(replacement);
    }
  };

  const removeWorkspace = () => {
    if (activeWorkspace.fixed) return;
    setWorkspaces((current) => current.filter((workspace) => workspace.id !== activeWorkspaceId));
    const fixedWorkspace = workspaces.find((workspace) => workspace.id === 1) ?? DEFAULT_WORKSPACES[0];
    setActiveWorkspaceId(fixedWorkspace.id);
    setMode(fixedWorkspace.mode);
    setSelectedId(fixedWorkspace.selectedId);
    setQuery('');
    setWorkspaceEditorOpen(false);
  };
  const openApp = (app: ActiveAppWindow, layout: WindowLayout = 'normal') => {
    trackEvent('Workspace App Opened', { app, layout });
    setWindows((current) => {
      const existing = current.find((windowItem) => windowItem.app === app);
      if (existing) {
        return current.map((windowItem) => (windowItem.app === app ? { ...windowItem, layout, minimized: false } : windowItem));
      }
      const position = clampWindowPosition({ x: current.length * 24, y: current.length * 18 });
      return [...current, { app, layout, minimized: false, position }];
    });
    setActiveWindow(app);
  };

  const minimizeWindow = (app: ActiveAppWindow) => {
    setWindows((current) => current.map((windowItem) => (windowItem.app === app ? { ...windowItem, minimized: true } : windowItem)));
    setActiveWindow((current) => (current === app ? null : current));
  };

  const closeWindow = (app: ActiveAppWindow) => {
    trackEvent('Workspace App Closed', { app });
    setWindows((current) => current.filter((windowItem) => windowItem.app !== app));
    setActiveWindow((current) => (current === app ? null : current));
  };

  const toggleMaximizeWindow = (app: ActiveAppWindow) => {
    setWindows((current) =>
      current.map((windowItem) =>
        windowItem.app === app ? { ...windowItem, layout: windowItem.layout === 'maximized' ? 'normal' : 'maximized', minimized: false } : windowItem,
      ),
    );
    setActiveWindow(app);
  };

  const focusProject = (project: PortfolioProject, sourceWindow?: ActiveAppWindow) => {
    const targetMode = modes.find((candidate) => modeProjectIds[candidate].includes(project.id));
    const projectIsInWorkspace = workspaceProjectIds.includes(project.id);
    if (projectIsInWorkspace && targetMode && !modeProjectIds[mode].includes(project.id)) {
      setMode(targetMode);
    }
    selectProject(project, sourceWindow ?? 'workspace');
    if (sourceWindow) closeWindow(sourceWindow);
    setQuery('');
    requestAnimationFrame(() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  const scrollToSection = (target: string) => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNav = (target: string) => {
    trackEvent('Navigation Used', { destination: target, source: 'sidebar' });
    setActiveNav(target);
    if (target === 'featured') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (target === 'contact') {
      openApp('contact');
      return;
    }
    scrollToSection(target);
  };

  const runTerminalCommand = (rawCommand: string) => {
    const command = rawCommand.trim();
    if (!command) return;

    const [verb, ...args] = command.toLowerCase().split(/\s+/);
    trackEvent('Terminal Command Used', { command: verb });
    const append = (line: string) => setTerminalLines((lines) => [...lines, `$ ${command}`, line]);

    if (verb === 'clear') {
      setTerminalLines([]);
      return;
    }

    if (verb === 'help') {
      append('Commands: help, status, projects, graph, cv, contact, select <project>, filter <all|active|archived>, clear');
      return;
    }

    if (verb === 'status') {
      append(`${stats.total} repos, ${stats.active} active, ${stats.archived} archived. Selected: ${selectedProject.title}.`);
      return;
    }

    if (verb === 'projects') {
      openApp('projects');
      append('Opened project explorer.');
      return;
    }

    if (verb === 'graph') {
      openApp('graph', 'maximized');
      append(`Opened repo network with ${projects.length} repository nodes.`);
      return;
    }

    if (verb === 'resume' || verb === 'cv') {
      openApp('resume');
      append('Opened CV window.');
      return;
    }

    if (verb === 'contact') {
      openApp('contact');
      append('Opened contact window.');
      return;
    }

    if (verb === 'filter' && ['all', 'active', 'archived'].includes(args[0])) {
      setRepoFilter(args[0] as RepoFilter);
      append(`Repository filter set to ${args[0]}.`);
      return;
    }

    if (verb === 'select') {
      const projectName = args.join(' ');
      const project = projects.find((item) => item.title.toLowerCase() === projectName || item.repoName.toLowerCase() === projectName || item.id === projectName);
      if (project) {
        focusProject(project);
        append(`Selected ${project.title}.`);
      } else {
        append(`No project matched "${projectName}".`);
      }
      return;
    }

    append(`Unknown command "${command}". Run help.`);
  };

  return (
    <main className={styles.os} id="home">
      <div className={styles.mountain} aria-hidden="true" />
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.brand}
          aria-label="Refresh portfolio"
          onClick={() => window.location.reload()}
        >
          <img src="/Logo-transparent.png" alt="" />
        </button>
        <label className={styles.commandBar}>
          <ShortcutHint device={device} />
          <input
            id="project-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => {
              if (query.trim()) {
                trackEvent('Project Search Used', {
                  queryLength: query.trim().length,
                  results: searchResults.length,
                });
              }
            }}
            placeholder="Search projects..."
            aria-label="Search projects"
          />
          <button type="button" onClick={() => document.getElementById('project-search')?.focus()} aria-label="Focus project search">
            <Search size={16} />
          </button>
          {searchResults.length > 0 ? (
            <div className={styles.searchResults} role="listbox" aria-label="Project search results">
              {searchResults.map((project) => (
                <button
                  type="button"
                  key={project.id}
                  role="option"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    if (project.category === 'university') {
                      window.open(project.repoUrl, '_blank', 'noopener,noreferrer');
                      return;
                    }
                    focusProject(project);
                  }}
                >
                  <ProjectGlyph project={project} />
                  <span>
                    <strong>{project.title}</strong>
                    <small>{project.domain ?? project.course ?? project.repoName}</small>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </label>
      </header>

      <aside className={styles.sidebar} aria-label="Primary">
        <div className={styles.sidebarNav}>
          {navItems.map((item) => (
            <button
              type="button"
              key={item.label}
              className={activeNav === item.target ? styles.navActive : undefined}
              onClick={() => handleNav(item.target)}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <button type="button" className={styles.profile} onClick={() => handleNav('about')}>
          <span className={styles.avatar}>
            <img src="/profile-avatar.jpeg" alt="Mahmoud Elfeel" />
          </span>
          <span>
            <strong>Mahmoud Elfeel</strong>
          </span>
        </button>
      </aside>

      <section className={styles.workspace} id="projects">
        <div className={styles.titleBlock}>
          <h1>
            Mahmoud Elfeel / <span>Portfolio</span>
          </h1>
          <p>{modeDescriptions[mode]}</p>
        </div>
        <div className={styles.contentModeSwitch} aria-label="Project view">
          {modes.map((item) => (
            <button
              type="button"
              key={item}
              className={mode === item ? styles.modeActive : undefined}
              onClick={() => changeMode(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <section className={styles.liveGrid} aria-labelledby="active-projects">
          <div className={styles.panelHeader}>
            <div>
              <h2 id="active-projects">Featured Projects</h2>
            </div>
            <div className={styles.panelHeaderActions}>
              {!activeWorkspace.fixed ? (
                <button
                  type="button"
                  onClick={() => setWorkspaceEditorOpen((open) => !open)}
                  aria-expanded={workspaceEditorOpen}
                >
                  <SlidersHorizontal size={15} />
                  Customize
                </button>
              ) : null}
            </div>
          </div>
          {workspaceEditorOpen && !activeWorkspace.fixed ? (
            <div className={styles.workspaceEditor}>
              <label>
                Workspace name
                <input
                  value={activeWorkspace.name}
                  onChange={(event) => renameWorkspace(event.target.value)}
                  aria-label="Workspace name"
                />
              </label>
              <div className={styles.workspaceProjectPicker} aria-label="Choose featured projects">
                {FEATURED_PROJECT_IDS.map((projectId) => {
                  const project = projects.find((item) => item.id === projectId);
                  if (!project) return null;
                  const checked = activeWorkspace.projectIds.includes(projectId);
                  return (
                    <label key={projectId}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={checked && activeWorkspace.projectIds.length === 1}
                        onChange={() => toggleWorkspaceProject(projectId)}
                      />
                      <span>{project.title}</span>
                    </label>
                  );
                })}
              </div>
              <button type="button" className={styles.deleteWorkspace} onClick={removeWorkspace}>
                <Trash2 size={15} />
                Delete workspace
              </button>
            </div>
          ) : null}
          <div className={styles.cardGrid}>
            {filteredProjects.map((project) => (
              <button
                type="button"
                key={project.id}
                className={`${styles.projectCard} ${selectedProject.id === project.id ? styles.projectCardActive : ''}`}
                onClick={() => {
                  selectProject(project, 'featured-card');
                }}
              >
                <ProjectGlyph project={project} />
                <strong>{project.title}</strong>
                <small>{project.domain}</small>
                <p>{project.description}</p>
                <span className={styles.cardMeta}>
                  <CalendarDays size={13} /> Last updated {formatDate(getProjectUpdatedAt(project, githubRepos))}
                </span>
                <ProjectLanguages project={project} githubRepos={githubRepos} />
                <LiveCardPreview project={project} />
              </button>
            ))}
            {filteredProjects.length === 0 ? (
              <div className={styles.emptyProjects}>
                <Search size={18} />
                <strong>No matching projects</strong>
                <span>Try another search or switch the project filter.</span>
              </div>
            ) : null}
          </div>
        </section>

        <section className={styles.featured} id="featured" aria-labelledby="featured-title">
          <div className={styles.featuredCopy}>
            <span className={styles.featuredMeta}>Last updated {formatDate(getProjectUpdatedAt(selectedProject, githubRepos))}</span>
            <h2 id="featured-title">{selectedProject.id === 'scheduler' ? 'Planora' : selectedProject.title}</h2>
            <a href={selectedProject.liveUrl ?? selectedProject.repoUrl} target="_blank" rel="noreferrer" data-analytics-project={selectedProject.id} data-analytics-source="featured-title">
              {selectedProject.domain ?? selectedProject.repoName}
            </a>
            <p>{selectedProject.description}</p>
            <ProjectLanguages project={selectedProject} githubRepos={githubRepos} detailed />
            <div className={styles.featuredActions}>
              {selectedProject.liveUrl && (
                <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer" data-analytics-project={selectedProject.id} data-analytics-source="featured">
                  Open Live App <ExternalLink size={15} />
                </a>
              )}
              <a href={selectedProject.repoUrl} target="_blank" rel="noreferrer" data-analytics-project={selectedProject.id} data-analytics-source="featured">
                View on GitHub <Github size={15} />
              </a>
            </div>
          </div>
          <ProjectPreview project={selectedProject} />
        </section>

        <section className={styles.aboutSection} id="about" aria-labelledby="about-title">
          <div className={styles.panelHeader}>
            <div>
              <h1 id="about-title">About</h1>
              <h3>
                I'm a junior software engineer in Berlin with industry experience building backend services, internal
                dashboards, desktop automation tools, Android/iOS workflows, and security-connected systems.
                Hands-on with Python/FastAPI, TypeScript/React/Next.js, Node.js, Kotlin, Swift, Linux, Docker,
                CI/CD, and REST APIs. B.Sc. Networking Engineering expected July 2026; interested in backend and
                full-stack roles.
              </h3>
              <p>My name is also written as Mahmoud Elfil in some profiles and documents.</p>
            </div>
          </div>
        </section>

        <section className={styles.university} id="university" aria-labelledby="university-title">
          <div className={styles.panelHeader}>
            <div>
              <h2 id="university-title">University Projects</h2>
              <p>Coursework, simulations, and class-built systems.</p>
            </div>
          </div>
          <div className={styles.uniGrid}>
            {universityProjects.map((project) => (
              <a
                key={project.id}
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                data-analytics-project={project.id}
                data-analytics-source="university-grid"
              >
                <ProjectGlyph project={project} />
                <strong>{project.title}</strong>
                <small>{project.course}</small>
                <ProjectLanguages project={project} githubRepos={githubRepos} />
                <p>{project.highlights[0]}</p>
              </a>
            ))}
          </div>
        </section>
      </section>

      <aside className={styles.rightRail} id="repos">
        <section className={styles.statsPanel}>
          <h2>Repository Snapshot</h2>
          <div className={styles.statTiles}>
            <span>
              <strong>{stats.total}</strong>
              Public Repos
            </span>
            <span>
              <strong>{stats.active}</strong>
              Active
            </span>
            <span>
              <strong>{stats.archived}</strong>
              Archived
            </span>
          </div>
          <div className={styles.languageBars}>
            {stats.topLanguages.map((item, index) => (
              <div key={item.language}>
                <span>{item.language}</span>
                <b>
                  <i style={{ width: `${Math.max(18, (item.count / stats.topLanguages[0].count) * 100)}%` }} />
                </b>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.explorerPanel} id="repo-network">
          <div className={styles.panelHeader}>
            <div>
              <h2>Repository Explorer</h2>
              <p>{explorerProjects.length} public repositories.</p>
            </div>
          </div>
          <div className={styles.filterPills}>
            {(['all', 'active', 'archived'] as RepoFilter[]).map((filter) => (
              <button
                type="button"
                key={filter}
                className={repoFilter === filter ? styles.pillActive : undefined}
                onClick={() => {
                  setRepoFilter(filter);
                  trackEvent('Repository Filter Changed', { filter });
                }}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className={styles.repoList}>
            {repoFilter === 'all' && <strong>Active repos</strong>}
            {(repoFilter === 'archived' ? [] : activeExplorer).map((project) => (
              <button
                type="button"
                key={project.id}
                className={selectedProject.id === project.id ? styles.repoActive : undefined}
                onClick={() => {
                  selectProject(project, 'repository-explorer');
                }}
              >
                <span>{project.title}</span>
                <small>{project.language}</small>
              </button>
            ))}
            {repoFilter === 'all' && <strong>Archived repos</strong>}
            {(repoFilter === 'active' ? [] : archivedExplorer).map((project) => (
              <button
                type="button"
                key={project.id}
                className={selectedProject.id === project.id ? styles.repoActive : undefined}
                onClick={() => {
                  selectProject(project, 'repository-explorer');
                }}
              >
                <span>{project.title}</span>
                <small>{project.language}</small>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.detailPanel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>{selectedProject.title}</h2>
              <p>{selectedProject.course ?? selectedProject.domain ?? selectedProject.category}</p>
            </div>
            <ProjectGlyph project={selectedProject} />
          </div>
          <p>{selectedProject.description}</p>
          <ProjectLanguages project={selectedProject} githubRepos={githubRepos} detailed />
          <div className={styles.featuredActions}>
            {selectedProject.liveUrl && (
              <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer" data-analytics-project={selectedProject.id} data-analytics-source="detail-panel">
                Open Live App <ExternalLink size={15} />
              </a>
            )}
            <a href={selectedProject.repoUrl} target="_blank" rel="noreferrer" data-analytics-project={selectedProject.id} data-analytics-source="detail-panel">
              View on GitHub <Github size={15} />
            </a>
          </div>
        </section>
      </aside>

      <footer className={styles.taskbar}>
        <nav>
          {taskbarItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`${activeWindow === item.app ? styles.taskActive : ''} ${windows.some((windowItem) => windowItem.app === item.app && windowItem.minimized) ? styles.taskMinimized : ''} ${windows.some((windowItem) => windowItem.app === item.app && !windowItem.minimized) ? styles.taskOpen : ''}`}
              onClick={(event) => {
                event.preventDefault();
                const project = projects.find((candidate) => candidate.id === item.projectId);
                if (project) selectProject(project, 'taskbar');
                openApp(item.app);
              }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className={styles.workspaceSwitch}>
          {workspaces.map((workspace) => (
            <button
              type="button"
              key={workspace.id}
              className={activeWorkspaceId === workspace.id ? styles.workspaceActive : undefined}
              onClick={() => activateWorkspace(workspace)}
              title={workspace.name}
            >
              {workspace.name.replace('Workspace ', 'WS ')}
            </button>
          ))}
          <button
            type="button"
            aria-label={workspaces.length >= MAX_WORKSPACES ? 'Maximum of four workspaces reached' : 'Add saved workspace'}
            onClick={addWorkspace}
            disabled={workspaces.length >= MAX_WORKSPACES}
            title={workspaces.length >= MAX_WORKSPACES ? 'Maximum of four workspaces' : 'Add workspace'}
          >
            <Plus size={16} />
          </button>
        </div>
        <div className={styles.modeSwitch} id="terminal">
          {modes.map((item) => (
            <button
              type="button"
              key={item}
              className={mode === item ? styles.modeActive : undefined}
              onClick={() => changeMode(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className={styles.trayWrap}>
          {trayOpen && (
            <div className={styles.tray}>
              <a href="https://github.com/elephancy" target="_blank" rel="noreferrer">
                <Github size={17} /> GitHub
              </a>
              <a href="mailto:mahmoudelfeelig@gmail.com" onClick={copyEmail}>
                <Mail size={17} /> {emailCopied ? 'Email copied' : 'Email'}
              </a>
              <a href="https://www.linkedin.com/in/elephanto" target="_blank" rel="noreferrer">
                <Network size={17} /> LinkedIn
              </a>
              <a href="/Mahmoud_Elfil_CV.pdf" id="resume">
                <FileText size={17} /> CV
              </a>
            </div>
          )}
          <button type="button" className={styles.trayToggle} onClick={() => setTrayOpen((open) => !open)} aria-expanded={trayOpen}>
            <ChevronUp size={23} />
          </button>
        </div>
      </footer>

      <section className={styles.siteFooter} id="contact" aria-label="Portfolio footer">
        <strong><img src="/Logo-transparent.png" alt="" /> Mahmoud Elfeel</strong>
        <button
          type="button"
          className={styles.footerPrivacy}
          onClick={() => window.dispatchEvent(new Event('elfeel:open-privacy-settings'))}
        >
          Privacy settings
        </button>
        <span className={styles.footerReachability}>
          Reachable by{' '}
          <a href="mailto:mahmoudelfeelig@gmail.com" onClick={copyEmail}>email</a>,{' '}
          <a href="https://www.linkedin.com/in/elephanto" target="_blank" rel="noreferrer">LinkedIn</a>, or{' '}
          <a href="https://github.com/elephancy" target="_blank" rel="noreferrer">GitHub</a>.
        </span>
      </section>

      {windows
        .filter((windowItem) => !windowItem.minimized)
        .map((windowItem, index) => {
          const openWindow = windowItem.app;
          return (
        <div
          className={styles.windowOverlay}
          role="dialog"
          aria-modal="false"
          aria-label={`${openWindow} app window`}
          key={openWindow}
          onMouseDown={() => setActiveWindow(openWindow)}
          style={{ zIndex: activeWindow === openWindow ? 90 : 80 + index }}
        >
          <section
            className={`${styles.osWindow} ${openWindow === 'assistant' ? styles.osWindowAssistant : ''} ${windowItem.layout === 'maximized' ? styles.osWindowMaximized : ''} ${activeWindow === openWindow ? styles.osWindowActive : ''}`}
            style={windowItem.layout === 'normal' ? ({ '--window-x': `${windowItem.position.x}px`, '--window-y': `${windowItem.position.y}px` } as CSSProperties) : undefined}
          >
            <header
              onPointerDown={(event) => {
                setActiveWindow(openWindow);
                let origin = windowItem.position;

                if (windowItem.layout === 'maximized') {
                  const restoredWidth = Math.min(WINDOW_WIDTH, window.innerWidth - WINDOW_EDGE_GAP * 2);
                  const pointerRatio = Math.max(0.12, Math.min(0.88, event.clientX / window.innerWidth));
                  const restoredLeft = event.clientX - restoredWidth * pointerRatio;
                  origin = clampWindowPosition({
                    x: restoredLeft - window.innerWidth / 2 + restoredWidth / 2,
                    y: event.clientY - 24 - WINDOW_TOP,
                  });
                  setWindows((current) =>
                    current.map((item) =>
                      item.app === openWindow
                        ? { ...item, layout: 'normal', minimized: false, position: origin }
                        : item,
                    ),
                  );
                }

                setDragState({
                  app: openWindow,
                  startX: event.clientX,
                  startY: event.clientY,
                  originX: origin.x,
                  originY: origin.y,
                });
              }}
            >
              {(() => {
                const meta = getWindowMeta(openWindow);
                const Icon = meta.icon;
                return (
                  <span className={styles.windowTitle}>
                    <Icon size={17} />
                    <strong>{meta.title}</strong>
                  </span>
                );
              })()}
              <span className={styles.windowControls}>
                <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => minimizeWindow(openWindow)} aria-label="Minimize app window">
                  <Minus size={15} />
                </button>
                <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => toggleMaximizeWindow(openWindow)} aria-label="Maximize or restore app window">
                  {windowItem.layout === 'maximized' ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => closeWindow(openWindow)} aria-label="Close app window">
                  <X size={16} />
                </button>
              </span>
            </header>
              <div className={`${styles.appWindowBody} ${styles[`appWindow_${openWindow}`] ?? ''}`}>
                {openWindow === 'terminal' && (
                  <div className={styles.terminalApp}>
                    <div className={styles.terminalOutput}>
                      {terminalLines.map((line, index) => (
                        <code key={`${line}-${index}`}>{line}</code>
                      ))}
                    </div>
                    <div className={styles.terminalCommands}>
                      <button type="button" onClick={() => runTerminalCommand('projects')}>projects</button>
                      <button type="button" onClick={() => runTerminalCommand('graph')}>graph</button>
                      <button type="button" onClick={() => runTerminalCommand('filter archived')}>filter archived</button>
                    </div>
                    <form
                      className={styles.terminalForm}
                      onSubmit={(event) => {
                        event.preventDefault();
                        runTerminalCommand(terminalInput);
                        setTerminalInput('');
                      }}
                    >
                      <span>$</span>
                      <input value={terminalInput} onChange={(event) => setTerminalInput(event.target.value)} placeholder="help" />
                    </form>
                  </div>
                )}
                {openWindow === 'graph' && (
                  <RepoNetwork
                    githubRepos={githubRepos}
                    selectedId={selectedId}
                    onSelect={(project) => selectProject(project, 'repo-network')}
                  />
                )}
                {openWindow === 'resume' && (
                  <div className={styles.resumeApp}>
                    <strong>Mahmoud Elfeel</strong>
                    <span>Berlin-based junior software engineer completing a B.Sc. in Networking Engineering in July 2026. Industry experience across Python/FastAPI backend services, React/Next.js dashboards, Python/Qt desktop tooling, Kotlin Android security workflows, Swift iOS capture workflows, Wazuh/WireGuard integrations, and computer-vision preprocessing.</span>
                    <div className={styles.resumeSections}>
                      <p>Backend / full-stack: FastAPI, REST APIs, authentication, React/Next.js, Node/Express, PostgreSQL and MongoDB</p>
                      <p>Security software: Wazuh, WireGuard, vulnerability workflows, Wi-Fi and application risk scoring</p>
                      <p>Desktop / mobile: Python/Qt, Windows/Linux packaging, Kotlin Android and Swift iOS</p>
                      <p>Data / CV: YOLO preprocessing, OpenCV, CP-SAT optimization and statistical anomaly detection</p>
                    </div>
                    <div className={styles.resumeFacts}>
                      <span><strong>{stats.total}</strong> public repos</span>
                      <span><strong>{stats.active}</strong> active projects</span>
                      <span><strong>{universityProjects.length}</strong> academic projects</span>
                    </div>
                    <a href="/Mahmoud_Elfil_CV.pdf" download data-analytics-source="resume-window">Download CV</a>
                  </div>
                )}
                {openWindow === 'contact' && (
                  <div className={styles.contactApp}>
                    <a href="mailto:mahmoudelfeelig@gmail.com" onClick={copyEmail}>
                      <Mail size={17} /> {emailCopied ? 'Email copied' : 'Email'}
                    </a>
                    <a href="https://github.com/elephancy" target="_blank" rel="noreferrer"><Github size={17} /> GitHub</a>
                    <a href="https://www.linkedin.com/in/elephanto" target="_blank" rel="noreferrer"><Network size={17} /> LinkedIn</a>
                  </div>
                )}
                {openWindow === 'assistant' && <PortfolioAssistant />}
                {openWindow === 'projects' && (
                  <>
                    <div className={styles.appHeader}>
                      <span>
                        <strong>{filteredProjects.length} projects</strong>
                        <small>{mode}</small>
                      </span>
                    </div>
                    <div className={styles.windowProjectGrid}>
                      {filteredProjects.map((project) => (
                        <button type="button" key={project.id} onClick={() => focusProject(project, 'projects')}>
                          <ProjectGlyph project={project} />
                          <span>
                            <strong>{project.title}</strong>
                            <small>{project.domain ?? project.course ?? project.language}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
          </section>
        </div>
          );
        })}
    </main>
  );
}

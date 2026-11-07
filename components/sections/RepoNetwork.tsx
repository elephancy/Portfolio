"use client";

import {
  Activity,
  BookOpen,
  CalendarDays,
  Code2,
  Cpu,
  ExternalLink,
  Gem,
  GitCommitHorizontal,
  GraduationCap,
  Keyboard,
  Layers,
  Maximize2,
  MessageSquare,
  Minimize2,
  Minus,
  Pill,
  PlugZap,
  Plus,
  Puzzle,
  Radio,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { RepoView } from "../../lib/githubPortfolioData";
import { projects, type PortfolioProject } from "../../data/projects";
import styles from "./workspaceOS.module.css";

type ProjectGroup = "fullstack" | "security" | "mobile" | "academic";
type PanState = {
  dragging: boolean;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

type PositionedProject = {
  project: PortfolioProject;
  group: ProjectGroup;
  x: number;
  y: number;
  primaryLanguage: string;
  radius: number;
};

type RepoNetworkProps = {
  githubRepos: RepoView[];
  selectedId: string;
  onSelect: (project: PortfolioProject) => void;
};

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Kotlin: "#a97bff",
  Swift: "#f05138",
  CSS: "#663399",
  HTML: "#e34c26",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  MATLAB: "#e16737",
  Assembly: "#6e4c13",
  "Jupyter Notebook": "#da5b0b",
  MDX: "#fcb32c",
};

const fallbackLanguages: Record<string, string[]> = {
  portfolio: ["TypeScript", "CSS", "JavaScript"],
  scheduler: ["Python", "TypeScript", "CSS"],
  typeshift: ["TypeScript", "JavaScript", "CSS"],
  doompedia: ["Kotlin", "Swift", "Python"],
  "ocpp-demo": ["Python", "TypeScript", "CSS"],
  anubis: ["TypeScript", "MDX", "CSS"],
  bachelor: ["Python", "Kotlin", "TypeScript"],
  commit: ["Python", "JavaScript", "CSS"],
  rps: ["JavaScript", "CSS", "HTML"],
  pharmacy: ["Kotlin", "Java"],
  "processor-simulation": ["C", "C++"],
};

const groupCenters: Record<ProjectGroup, { x: number; y: number }> = {
  fullstack: { x: 260, y: 210 },
  security: { x: 730, y: 180 },
  mobile: { x: 750, y: 465 },
  academic: { x: 275, y: 475 },
};

const groupLabels: Record<ProjectGroup, string> = {
  fullstack: "Full-stack",
  security: "Security",
  mobile: "Mobile",
  academic: "Academic",
};

const MIN_ZOOM = 0.55;
const MAX_ZOOM = 1.8;
const ZOOM_STEP = 0.15;

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function groupFor(project: PortfolioProject): ProjectGroup {
  if (["doompedia", "pharmacy", "bachelor"].includes(project.id))
    return "mobile";
  if (
    ["ocpp-demo", "aes", "chatting-application"].includes(
      project.id,
    )
  )
    return "security";
  if (
    ["portfolio", "scheduler", "typeshift", "anubis", "rps", "commit"].includes(
      project.id,
    )
  )
    return "fullstack";
  return "academic";
}

const positionedProjects = (
  Object.keys(groupCenters) as ProjectGroup[]
).flatMap((group) => {
  const grouped = projects.filter((project) => groupFor(project) === group);
  const center = groupCenters[group];
  const radiusX = group === "academic" ? 195 : 165;
  const radiusY = group === "academic" ? 110 : 100;

  return grouped.map<PositionedProject>((project, index) => {
    const angle = (Math.PI * 2 * index) / grouped.length - Math.PI / 2;
    const radius = Math.min(20, 12 + project.stack.length * 1.1);
    return {
      project,
      group,
      x: center.x + Math.cos(angle) * radiusX,
      y: center.y + Math.sin(angle) * radiusY,
      primaryLanguage: project.language,
      radius,
    };
  });
});

const sharedEdges = positionedProjects
  .flatMap((left, leftIndex) =>
    positionedProjects.slice(leftIndex + 1).flatMap((right) => {
      const shared = left.project.stack.find((technology) =>
        right.project.stack.some(
          (candidate) => candidate.toLowerCase() === technology.toLowerCase(),
        ),
      );
      return shared && left.group !== right.group
        ? [{ left, right, shared }]
        : [];
    }),
  )
  .slice(0, 20);

function fallbackRepo(project: PortfolioProject): RepoView {
  const names = fallbackLanguages[project.id] ?? [project.language];
  return {
    name: project.repoName,
    fullName: project.repoUrl.replace(/^https:\/\/github\.com\//, ""),
    slug: project.id,
    url: project.repoUrl,
    description: project.description,
    language: project.language,
    createdAt: project.updatedAt,
    updatedAt: project.updatedAt,
    pushedAt: project.updatedAt,
    topics: [],
    domain: project.domain ?? project.course ?? project.category,
    techStack: project.stack,
    features: project.highlights,
    about: project.description,
    languages: names.map((name, index) => ({
      name,
      bytes: names.length - index,
      percent: index === 0 ? 58 : index === 1 ? 27 : 15,
    })),
  };
}

function findGithubRepo(project: PortfolioProject, githubRepos: RepoView[]) {
  const projectRepoUrl = project.repoUrl.toLowerCase();
  const projectRepoName = project.repoName.toLowerCase();

  return (
    githubRepos.find((repo) => repo.url.toLowerCase() === projectRepoUrl) ??
    githubRepos.find((repo) =>
      (repo.fullName ?? repo.name)
        .toLowerCase()
        .endsWith(`/${projectRepoName}`),
    ) ??
    githubRepos.find((repo) => repo.name.toLowerCase() === projectRepoName)
  );
}

const projectIcons: Record<string, LucideIcon> = {
  portfolio: Layers,
  scheduler: CalendarDays,
  typeshift: Keyboard,
  doompedia: BookOpen,
  "ocpp-demo": PlugZap,
  anubis: Puzzle,
  bachelor: Smartphone,
  commit: GitCommitHorizontal,
  rps: Activity,
  gems: Gem,
  "processor-simulation": Cpu,
  "chatting-application": MessageSquare,
  "data-analysis": Activity,
  "communication-theory": Radio,
  "channel-coding": Radio,
  "systems-and-control": Activity,
  aes: ShieldCheck,
  pharmacy: Pill,
};

function nodeShape(node: PositionedProject, selected: boolean) {
  const className = `${styles.networkNodeShape} ${selected ? styles.networkNodeSelected : ""}`;
  const nodeColor = languageColors[node.primaryLanguage] ?? "#8b949e";
  const Icon =
    projectIcons[node.project.id] ??
    (node.group === "academic" ? GraduationCap : Code2);

  return (
    <g
      className={styles.networkNodeSymbol}
      style={{ "--node-color": nodeColor } as CSSProperties}
    >
      <circle className={styles.networkNodeHalo} r={node.radius + 9} />
      {node.group === "security" ? (
        <polygon
          className={className}
          points="-20,-12 0,-23 20,-12 20,12 0,23 -20,12"
        />
      ) : node.group === "mobile" ? (
        <rect
          className={className}
          x="-17"
          y="-23"
          width="34"
          height="46"
          rx="9"
        />
      ) : node.group === "academic" ? (
        <polygon className={className} points="0,-23 22,0 0,23 -22,0" />
      ) : (
        <circle className={className} r="21" />
      )}
      <Icon
        className={styles.networkNodeGlyph}
        x={-10}
        y={-10}
        width={20}
        height={20}
        strokeWidth={1.9}
      />
      <circle className={styles.networkNodePulse} cx="14" cy="-15" r="3" />
    </g>
  );
}

export function RepoNetwork({
  githubRepos,
  selectedId,
  onSelect,
}: RepoNetworkProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [panState, setPanState] = useState<PanState | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const selectedProject =
    projects.find((project) => project.id === selectedId) ?? projects[0];
  const githubRepo =
    findGithubRepo(selectedProject, githubRepos) ??
    fallbackRepo(selectedProject);
  const languages = githubRepo.languages.slice(0, 6);
  const miniViewportWidth = Math.min(1000, 1000 / zoom);
  const miniViewportHeight = Math.min(640, 640 / zoom);
  const miniViewportX = Math.max(
    0,
    Math.min(
      1000 - miniViewportWidth,
      (1000 - miniViewportWidth) / 2 - pan.x / zoom,
    ),
  );
  const miniViewportY = Math.max(
    0,
    Math.min(
      640 - miniViewportHeight,
      (640 - miniViewportHeight) / 2 - pan.y / zoom,
    ),
  );

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(document.fullscreenElement === networkRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const network = networkRef.current;
    if (!network) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setZoom((current) =>
        clampZoom(current + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)),
      );
    };

    network.addEventListener("wheel", onWheel, { passive: false });
    return () => network.removeEventListener("wheel", onWheel);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement === networkRef.current) {
      await document.exitFullscreen();
      return;
    }
    await networkRef.current?.requestFullscreen();
  };

  return (
    <div className={styles.networkApp} ref={networkRef}>
      <section
        className={styles.networkStage}
        onPointerDown={(event) => {
          if ((event.target as Element).closest?.("button")) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          setPanState({
            dragging: true,
            startX: event.clientX,
            startY: event.clientY,
            originX: pan.x,
            originY: pan.y,
          });
        }}
        onPointerMove={(event) => {
          if (!panState?.dragging) return;
          setPan({
            x: panState.originX + event.clientX - panState.startX,
            y: panState.originY + event.clientY - panState.startY,
          });
        }}
        onPointerUp={() => setPanState(null)}
        onPointerCancel={() => setPanState(null)}
      >
        <div
          className={styles.networkZoomControls}
          aria-label="Repository network zoom controls"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setZoom((current) => clampZoom(current - ZOOM_STEP))}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            <Minus size={15} />
          </button>
          <output aria-live="polite" aria-label="Current zoom">
            {Math.round(zoom * 100)}%
          </output>
          <button
            type="button"
            onClick={() => setZoom((current) => clampZoom(current + ZOOM_STEP))}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            aria-label="Reset zoom and position"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
        <svg
          viewBox="0 0 1000 640"
          role="img"
          aria-label="Interactive repository network grouped by project type"
        >
          <rect width="1000" height="640" />
          <g
            className={styles.networkMesh}
            style={
              {
                "--mesh-x": `${pan.x}px`,
                "--mesh-y": `${pan.y}px`,
                "--mesh-scale": zoom,
              } as CSSProperties
            }
          >
            <g className={styles.networkEdges}>
              {positionedProjects.map((node) => {
                const center = groupCenters[node.group];
                return (
                  <line
                    key={`hub-${node.project.id}`}
                    x1={center.x}
                    y1={center.y}
                    x2={node.x}
                    y2={node.y}
                  />
                );
              })}
              {sharedEdges.map((edge) => (
                <line
                  key={`${edge.left.project.id}-${edge.right.project.id}`}
                  className={styles.networkSharedEdge}
                  x1={edge.left.x}
                  y1={edge.left.y}
                  x2={edge.right.x}
                  y2={edge.right.y}
                />
              ))}
            </g>

            {positionedProjects.map((node) => (
              <g
                key={node.project.id}
                className={styles.networkNode}
                transform={`translate(${node.x} ${node.y})`}
                role="button"
                tabIndex={0}
                aria-label={`Open ${node.project.title} repository details`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onSelect(node.project)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(node.project);
                  }
                }}
              >
                {nodeShape(node, node.project.id === selectedProject.id)}
                <text y="40">{node.project.title}</text>
              </g>
            ))}
          </g>
        </svg>
        <div
          className={styles.networkLegend}
          aria-label="Repository categories"
        >
          {(Object.keys(groupLabels) as ProjectGroup[]).map((group) => (
            <span key={group} data-group={group}>
              <i />
              {groupLabels[group]}
            </span>
          ))}
        </div>
        <svg
          className={styles.networkMinimap}
          viewBox="0 0 1000 640"
          role="img"
          aria-label="Repository network minimap"
          onPointerDown={(event) => {
            event.stopPropagation();
            const bounds = event.currentTarget.getBoundingClientRect();
            const targetX =
              ((event.clientX - bounds.left) / bounds.width) * 1000;
            const targetY =
              ((event.clientY - bounds.top) / bounds.height) * 640;
            setPan({
              x: (500 - targetX) * zoom,
              y: (320 - targetY) * zoom,
            });
          }}
        >
          <rect
            className={styles.networkMinimapBackground}
            width="1000"
            height="640"
          />
          {sharedEdges.map((edge) => (
            <line
              key={`mini-${edge.left.project.id}-${edge.right.project.id}`}
              x1={edge.left.x}
              y1={edge.left.y}
              x2={edge.right.x}
              y2={edge.right.y}
            />
          ))}
          {positionedProjects.map((node) => (
            <circle
              key={`mini-${node.project.id}`}
              cx={node.x}
              cy={node.y}
              r={node.project.id === selectedProject.id ? 24 : 14}
              className={
                node.project.id === selectedProject.id
                  ? styles.networkMinimapSelected
                  : undefined
              }
            />
          ))}
          <rect
            className={styles.networkMinimapViewport}
            x={miniViewportX + 8}
            y={miniViewportY + 8}
            width={Math.max(0, miniViewportWidth - 16)}
            height={Math.max(0, miniViewportHeight - 16)}
          />
        </svg>
      </section>

      <aside className={styles.networkInspector}>
        <span>{githubRepo.domain}{githubRepo.snapshotAt ? ` · GitHub snapshot ${new Date(githubRepo.snapshotAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}` : ''}</span>
        <h3>{selectedProject.title}</h3>
        <p>{githubRepo.about}</p>

        {languages.length > 0 ? (
          <section
            className={styles.githubLanguages}
            aria-label={`${selectedProject.title} languages`}
          >
            <h4>Languages</h4>
            <div className={styles.githubLanguageBar}>
              {languages.map((language) => (
                <i
                  key={language.name}
                  style={{
                    width: `${language.percent}%`,
                    background: languageColors[language.name] ?? "#8b949e",
                  }}
                />
              ))}
            </div>
            <div className={styles.githubLanguageList}>
              {languages.map((language) => (
                <span key={language.name}>
                  <i
                    style={{
                      background: languageColors[language.name] ?? "#8b949e",
                    }}
                  />
                  <strong>{language.name}</strong>
                  {language.percent.toFixed(1)}%
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <div className={styles.networkInspectorActions}>
          {selectedProject.liveUrl ? (
            <a
              className={styles.networkLiveLink}
              href={selectedProject.liveUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open live demo <ExternalLink size={14} />
            </a>
          ) : null}
          <a href={selectedProject.repoUrl} target="_blank" rel="noreferrer">
            Open repository <ExternalLink size={14} />
          </a>
        </div>
      </aside>
    </div>
  );
}

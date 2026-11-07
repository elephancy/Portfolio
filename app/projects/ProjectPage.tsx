import type { Metadata } from "next";
import type { projectPages } from "./projectPages";
import styles from "./projectPages.module.css";

type Project = (typeof projectPages)[number];

export function projectMetadata(project: Project): Metadata {
  const url = `https://elfeel.me/projects/${project.slug}`;
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${project.title} | Mahmoud Elfeel`,
      description: project.description,
    },
  };
}

export default function ProjectPage({ project }: { project: Project }) {
  const isArchived = "archived" in project && project.archived;
  return (
    <main className={styles.page}>
      <a className={styles.back} href="/">Mahmoud Elfeel / Projects</a>
      <article className={styles.article}>
        <p className={styles.category}>{project.category}</p>
        <h1>{project.title}</h1>
        <p className={styles.lead}>{project.description}</p>
        {isArchived && <p>Archived project. The live demo is retired; source code remains available.</p>}
        <div className={styles.links}>
          {project.liveUrl && <a href={project.liveUrl}>Open project</a>}
          <a href={project.repositoryUrl}>View source code</a>
        </div>
        <section aria-labelledby="project-story">
          <h2 id="project-story">The project</h2>
          <p>{project.introduction}</p>
        </section>
        <section aria-labelledby="project-details">
          <h2 id="project-details">{isArchived ? "What the archived version demonstrated" : "What the public version shows"}</h2>
          {project.details.map((detail) => <p key={detail}>{detail}</p>)}
        </section>
      </article>
    </main>
  );
}

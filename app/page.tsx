import WorkspaceOS from "../components/sections/WorkspaceOS";
import { projects } from "../data/projects";
import { projectPages } from "./projects/projectPages";
import styles from "./projects/projectPages.module.css";
import "../styles/globals.css";

const siteUrl = "https://elfeel.me";

const profileStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Mahmoud Elfeel",
      alternateName: ["Mahmoud Elfil", "Elfeel", "Elfil", "Feel"],
      description: "The software engineering portfolio of Mahmoud Elfeel.",
      inLanguage: "en",
      author: { "@id": `${siteUrl}/#mahmoud-elfeel` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#profile`,
      url: siteUrl,
      name: "Mahmoud Elfeel software engineering portfolio",
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntity: { "@id": `${siteUrl}/#mahmoud-elfeel` },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#mahmoud-elfeel`,
      name: "Mahmoud Elfeel",
      alternateName: [
        "Mahmoud Elfil",
        "Elfeel",
        "Elfil",
        "elephancy",
        "Feel",
      ],
      url: siteUrl,
      image: `${siteUrl}/Logo.png`,
      jobTitle: "Software Engineer",
      description:
        "Berlin-based software engineer working across backend services, full-stack applications, mobile workflows, security systems, and developer tooling.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Berlin",
        addressCountry: "DE",
      },
      knowsAbout: [
        "Backend engineering",
        "Full-stack development",
        "Python",
        "FastAPI",
        "TypeScript",
        "React",
        "Next.js",
        "Kotlin",
        "Swift",
        "Network security",
        "Docker",
      ],
      sameAs: [
        "https://github.com/elephancy",
        "https://www.linkedin.com/in/elephanto",
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}/#projects`,
      name: "Software projects by Mahmoud Elfeel",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareSourceCode",
          name: project.title,
          description: project.description,
          codeRepository: project.repoUrl,
          url: project.liveUrl ?? project.repoUrl,
          programmingLanguage: project.language,
          author: { "@id": `${siteUrl}/#mahmoud-elfeel` },
        },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profileStructuredData).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <WorkspaceOS />
      <nav className={styles.projectIndex} aria-label="Recent projects">
        <h2>Recent projects</h2>
        {projectPages.map((project) => (
          <a key={project.slug} href={`/projects/${project.slug}`}>
            <strong>{project.title}</strong>
            <span>{project.description}</span>
          </a>
        ))}
      </nav>
    </>
  );
}

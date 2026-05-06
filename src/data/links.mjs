import { profile } from "./profile.mjs";
import { projects } from "./projects.mjs";

const projectBySlug = Object.fromEntries(projects.map((project) => [project.slug, project]));

export const linkGroups = [
  {
    title: "Principal",
    items: [
      {
        label: "Proyectos",
        description: "Aplicaciones y repositorios destacados",
        href: "/proyectos/",
        kind: "internal",
        icon: "grid"
      },
      {
        label: "CV",
        description: "Perfil profesional y tecnologías",
        href: "/cv/",
        kind: "internal",
        icon: "file"
      }
    ]
  },
  {
    title: "Perfiles",
    items: [
      {
        label: "GitHub",
        description: "samu-tec",
        href: profile.github,
        kind: "external",
        icon: "github"
      },
      {
        label: "LinkedIn",
        description: "samuelciocan",
        href: profile.linkedin,
        kind: "external",
        icon: "linkedin"
      },
      {
        label: "Telegram",
        description: "Samu_Tech",
        href: profile.telegram,
        kind: "external",
        icon: "send"
      }
    ]
  },
  {
    title: "Repositorios",
    items: [
      {
        label: "Friends4You",
        description: "Aplicación web para conocer gente",
        href: projectBySlug.friends4you.repoUrl,
        kind: "external",
        icon: "users"
      },
      {
        label: "Discord-RAG-Bot",
        description: "Bot RAG local para Discord",
        href: projectBySlug["discord-rag-bot"].repoUrl,
        kind: "external",
        icon: "bot"
      },
      {
        label: "PokeAPI",
        description: "Web de práctica con la PokeAPI",
        href: projectBySlug.pokeapi.repoUrl,
        kind: "external",
        icon: "code"
      },
      {
        label: "Portfolio personal",
        description: "Repositorio de samuelciocan.com",
        href: projectBySlug["portfolio-personal"].repoUrl,
        kind: "external",
        icon: "spark"
      }
    ]
  }
];

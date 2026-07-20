import './page.css'

interface ProjectLink {
  title: string
  description: string
  href: string
}

const PROJECTS: ProjectLink[] = [
  {
    title: 'Design System',
    description: 'Storybook des composants et tokens partagés.',
    href: 'https://mealz-design-system.netlify.app',
  },
  {
    title: 'Marmiton Prototype',
    description: "Prototype d'expérience produit Marmiton.",
    href: 'https://marmiton-prototype.netlify.app',
  },
  {
    title: 'Assistant Shopping',
    description: "Prototype de l'assistant shopping.",
    href: 'https://assistant-shopping.netlify.app',
  },
  {
    title: 'Quick Features',
    description: 'Tests rapides et features en cours de validation.',
    href: 'https://quick-features.netlify.app',
  },
]

export default function HomePage() {
  return (
    <main className="home">
      <h1 className="home__title">DS.MD — Packages</h1>
      <div className="home__grid">
        {PROJECTS.map((project) => (
          <a key={project.href} className="home__card" href={project.href} target="_blank" rel="noreferrer">
            <span className="home__card-title">{project.title}</span>
            <span className="home__card-desc">{project.description}</span>
          </a>
        ))}
      </div>
    </main>
  )
}

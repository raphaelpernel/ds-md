import Link from 'next/link'
import { CLIENT_NAMESPACES } from '@/config/namespaces'
import './Sidebar.css'

export function Sidebar() {
  return (
    <nav className="hub-sidebar" aria-label="Navigation du hub">
      <div className="hub-sidebar__group">
        <span className="hub-sidebar__group-title">Mealz</span>
        <ul className="hub-sidebar__list">
          <li>
            <Link className="hub-sidebar__link" href="/neutral">
              Neutral
            </Link>
          </li>
          <li>
            <Link className="hub-sidebar__link" href="/guide">
              Guide
            </Link>
          </li>
        </ul>
      </div>
      {CLIENT_NAMESPACES.map((namespace) => (
        <div className="hub-sidebar__group" key={namespace.id}>
          <span className="hub-sidebar__group-title">{namespace.label}</span>
          <ul className="hub-sidebar__list">
            <li>
              <Link className="hub-sidebar__link" href={`/${namespace.id}`}>
                Prototypes
              </Link>
            </li>
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default Sidebar

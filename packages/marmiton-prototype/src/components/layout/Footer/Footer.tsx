import Link from 'next/link'
import { FacebookLogo, InstagramLogo, PinterestLogo, TiktokLogo, YoutubeLogo } from '@phosphor-icons/react/dist/ssr'
import './Footer.css'

interface FooterLink {
  label: string
  href: string
}

interface FooterColumn {
  title: string
  links: FooterLink[]
}

// Colonnes réelles du footer marmiton.org (contenu extrait du site le 2026-07-27).
const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Recettes par ingrédients',
    links: [
      { label: 'Recettes avec des framboises', href: '#' },
      { label: 'Recettes avec des myrtilles', href: '#' },
      { label: 'Recettes avec des prunes', href: '#' },
      { label: 'Recettes avec des courgettes', href: '#' },
      { label: 'Recettes avec des aubergines', href: '#' },
      { label: 'Recettes avec des carottes', href: '#' },
    ],
  },
  {
    title: 'Recettes par ustensiles',
    links: [
      { label: 'Recettes au Cookeo', href: '#' },
      { label: 'Recettes au Thermomix', href: '#' },
      { label: "Recettes à l'Airfryer", href: '#' },
      { label: 'Recettes à la plancha', href: '#' },
      { label: "Recettes à l'appareil à croque-monsieur", href: '#' },
      { label: 'Recettes au barbecue', href: '#' },
    ],
  },
  {
    title: 'Top Recettes',
    links: [
      { label: 'Risotto', href: '#' },
      { label: 'Panna cotta', href: '#' },
      { label: 'Mayonnaise maison', href: '#' },
      { label: 'Gaufre', href: '#' },
      { label: 'Guacamole', href: '#' },
      { label: 'Cheesecake', href: '#' },
    ],
  },
  {
    title: 'Thématiques du moment',
    links: [
      { label: 'Apéro léger', href: '#' },
      { label: 'Apéro dinatoire', href: '#' },
      { label: "Recettes d'apéro", href: '#' },
    ],
  },
  {
    title: 'Mes aides à la cuisine',
    links: [
      { label: 'Table de conversion', href: '#' },
      { label: 'Mon frigo', href: '#' },
      { label: 'Techniques en vidéos', href: '#' },
      { label: 'Astuces & Conseils', href: '#' },
    ],
  },
]

const LEGAL_LINKS: FooterLink[] = [
  { label: 'FAQ', href: '#' },
  { label: 'Partenariats & Licences', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Paramétrer les cookies', href: '#' },
  { label: 'Gérer Utiq', href: '#' },
  { label: 'Mentions légales', href: '#' },
  { label: 'Recrutement', href: '#' },
  { label: "Conditions Générales d'Utilisation", href: '#' },
  { label: 'Politique de confidentialité', href: '#' },
  { label: "Conditions Générales d'Abonnement", href: '#' },
  { label: "Foire aux questions - Vos choix sur l'utilisation de cookies", href: '#' },
  { label: 'Rapport de transparence - DSA', href: '#' },
  { label: 'Pour des milliers de cocktails : 1001cocktails.com', href: '#' },
]

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', Icon: FacebookLogo },
  { label: 'Instagram', href: '#', Icon: InstagramLogo },
  { label: 'Pinterest', href: '#', Icon: PinterestLogo },
  { label: 'TikTok', href: '#', Icon: TiktokLogo },
  { label: 'YouTube', href: '#', Icon: YoutubeLogo },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <Link href="/" className="footer__logo" aria-label="Marmiton — Accueil">
        <img src="/logos/logo-marmiton.svg" alt="Marmiton" width={130} height={20} className="footer__logo-img" />
      </Link>

      <div className="footer__columns">
        {FOOTER_COLUMNS.map((col) => (
          <details key={col.title} className="footer__accordion">
            <summary className="footer__accordion-title">{col.title}</summary>
            <ul className="footer__accordion-list">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="footer__accordion-link">{link.label}</a>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      <a href="#" className="footer__forum-link">Participer au forum</a>

      <div className="footer__legal">
        {LEGAL_LINKS.map((link, i) => (
          <span key={link.label}>
            <a href={link.href} className="footer__legal-link">{link.label}</a>
            {i < LEGAL_LINKS.length - 1 && <span className="footer__legal-sep" aria-hidden="true">•</span>}
          </span>
        ))}
      </div>

      <div className="footer__bottom">
        <p className="footer__copyright">© {year} marmiton.org - Tous droits réservés</p>
        <div className="footer__socials">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a key={label} href={href} className="footer__social-link" aria-label={label}>
              <Icon size={20} weight="fill" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer

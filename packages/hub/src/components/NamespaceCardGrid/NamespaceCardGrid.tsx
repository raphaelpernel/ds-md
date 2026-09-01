import './NamespaceCardGrid.css'

export interface NamespaceCard {
  title: string
  description: string
  updatedAt: string
  /** When set, the card is a link (opens in a new tab) instead of static text. */
  href?: string
}

export function NamespaceCardGrid({
  cards,
  emptyMessage,
}: {
  cards: NamespaceCard[]
  emptyMessage: string
}) {
  if (cards.length === 0) {
    return <p className="hub-card-grid__empty">{emptyMessage}</p>
  }

  return (
    <div className="hub-card-grid">
      {cards.map((card) => {
        const content = (
          <>
            <h2 className="hub-card-grid__card-title">{card.title}</h2>
            <p className="hub-card-grid__card-desc">{card.description}</p>
            <span className="hub-card-grid__card-date">Mis à jour le {card.updatedAt}</span>
          </>
        )

        if (card.href) {
          return (
            <a className="hub-card-grid__card" key={card.title} href={card.href} target="_blank" rel="noreferrer">
              {content}
            </a>
          )
        }

        return (
          <article className="hub-card-grid__card" key={card.title}>
            {content}
          </article>
        )
      })}
    </div>
  )
}

export default NamespaceCardGrid

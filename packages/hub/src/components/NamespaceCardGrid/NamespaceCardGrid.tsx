import './NamespaceCardGrid.css'

export interface NamespaceCard {
  title: string
  description: string
  updatedAt: string
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
      {cards.map((card) => (
        <article className="hub-card-grid__card" key={card.title}>
          <h2 className="hub-card-grid__card-title">{card.title}</h2>
          <p className="hub-card-grid__card-desc">{card.description}</p>
          <span className="hub-card-grid__card-date">Mis à jour le {card.updatedAt}</span>
        </article>
      ))}
    </div>
  )
}

export default NamespaceCardGrid

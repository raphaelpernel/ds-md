'use client'

import Link from 'next/link'
import { CaretRight } from '@phosphor-icons/react'
import './ProactiveBanner.css'

/**
 * Signal proactif, pas conversationnel : l'agent ne demande pas d'être
 * initié — un tap direct mène à une recherche déjà cadrée par le moment.
 * (Piste D retenue en session : "proactif, pas un thread à ouvrir soi-même".)
 */
function bannerForHour(hour: number): { text: string; query: string } {
  if (hour >= 17 && hour <= 21) return { text: 'Ce soir, en 20 min ?', query: '20 min enfants' }
  if (hour >= 6 && hour <= 10) return { text: 'Un petit-déj rapide ce matin ?', query: 'petit-dejeuner rapide' }
  return { text: 'Une idée pour votre prochain repas ?', query: 'rapide' }
}

export function ProactiveBanner() {
  const { text, query } = bannerForHour(new Date().getHours())

  return (
    <Link href={`/recherche?q=${encodeURIComponent(query)}`} className="proactive-banner">
      <span>{text}</span>
      <CaretRight size={18} weight="bold" aria-hidden="true" />
    </Link>
  )
}

export default ProactiveBanner

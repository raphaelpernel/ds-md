'use client'

import { useParams } from 'next/navigation'
import { RecipePage } from '../../../src/components/recipe/RecipePage'

/** Parcours D : arrivée Google directement sur cette fiche, non connecté (brief §6 parcours D, §11 Q5). */
export default function RecettePage() {
  const params = useParams<{ id: string }>()
  return <RecipePage recipeId={params.id} />
}

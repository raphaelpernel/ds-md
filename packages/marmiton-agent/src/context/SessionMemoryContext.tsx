'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ActiveConstraint } from '../lib/nlu'

/**
 * Ce que l'agent "sait" de la session en cours, partagé entre /recherche et
 * la fiche recette — sans quoi chaque page repart de zéro, ce qui a été
 * signalé comme "bizarre" pour un produit qui se présente comme un agent
 * (revue /plan-design-review du 2026-07-20, Pass 1).
 *
 * Persisté en localStorage : survit au rechargement de page (contrairement à
 * un contexte React seul), reste local à l'appareil (pas de sync multi-device
 * — hors-scope POC, brief §07).
 */
export interface RememberedIngredientAnswer {
  ingredientId: string
  ingredientQuery: string
  suggestion?: string
}

interface SessionMemoryState {
  constraints: ActiveConstraint[]
  maxDuration?: number
  ingredientAnswers: RememberedIngredientAnswer[]
}

const STORAGE_KEY = 'marmiton-agent-memory'
const emptyState: SessionMemoryState = { constraints: [], ingredientAnswers: [] }

function loadInitial(): SessionMemoryState {
  if (typeof window === 'undefined') return emptyState
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? { ...emptyState, ...JSON.parse(raw) } : emptyState
  } catch {
    return emptyState
  }
}

interface SessionMemoryContextValue extends SessionMemoryState {
  mergeConstraints: (tags: ActiveConstraint[], maxDuration?: number) => void
  removeConstraint: (tag: string) => void
  clearMaxDuration: () => void
  addIngredientAnswer: (entry: RememberedIngredientAnswer) => void
  removeIngredientAnswer: (ingredientId: string) => void
  isEmpty: boolean
}

const SessionMemoryContext = createContext<SessionMemoryContextValue | null>(null)

export function SessionMemoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionMemoryState>(emptyState)

  // Chargé après le premier rendu (évite un mismatch SSR/client sur le contenu localStorage).
  useEffect(() => {
    setState(loadInitial())
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage indisponible (mode privé strict, quota) — la mémoire reste en session seulement.
    }
  }, [state])

  const mergeConstraints = useCallback((tags: ActiveConstraint[], maxDuration?: number) => {
    setState((prev) => {
      const merged = [...prev.constraints]
      for (const t of tags) {
        if (!merged.some((existing) => existing.tag === t.tag)) merged.push(t)
      }
      const mergedDuration =
        maxDuration !== undefined && prev.maxDuration !== undefined
          ? Math.min(maxDuration, prev.maxDuration)
          : maxDuration ?? prev.maxDuration
      return { ...prev, constraints: merged, maxDuration: mergedDuration }
    })
  }, [])

  const removeConstraint = useCallback((tag: string) => {
    setState((prev) => ({ ...prev, constraints: prev.constraints.filter((c) => c.tag !== tag) }))
  }, [])

  const clearMaxDuration = useCallback(() => {
    setState((prev) => ({ ...prev, maxDuration: undefined }))
  }, [])

  const addIngredientAnswer = useCallback((entry: RememberedIngredientAnswer) => {
    setState((prev) => ({
      ...prev,
      ingredientAnswers: [...prev.ingredientAnswers.filter((a) => a.ingredientId !== entry.ingredientId), entry],
    }))
  }, [])

  const removeIngredientAnswer = useCallback((ingredientId: string) => {
    setState((prev) => ({ ...prev, ingredientAnswers: prev.ingredientAnswers.filter((a) => a.ingredientId !== ingredientId) }))
  }, [])

  const isEmpty = state.constraints.length === 0 && state.maxDuration === undefined && state.ingredientAnswers.length === 0

  const value = useMemo<SessionMemoryContextValue>(
    () => ({ ...state, mergeConstraints, removeConstraint, clearMaxDuration, addIngredientAnswer, removeIngredientAnswer, isEmpty }),
    [state, mergeConstraints, removeConstraint, clearMaxDuration, addIngredientAnswer, removeIngredientAnswer, isEmpty],
  )

  return <SessionMemoryContext.Provider value={value}>{children}</SessionMemoryContext.Provider>
}

export function useSessionMemory(): SessionMemoryContextValue {
  const ctx = useContext(SessionMemoryContext)
  if (!ctx) throw new Error('useSessionMemory must be used within a SessionMemoryProvider')
  return ctx
}

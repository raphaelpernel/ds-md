'use client'

import type { ReactNode } from 'react'
import { Button } from '@mealz-product-team/design-system'
import './QuestionCard.css'

interface QuestionCardProps {
  step: number
  totalSteps: number
  title: string
  subtitle?: string
  children: ReactNode
  ctaLabel: string
  onCta: () => void
  ctaDisabled?: boolean
}

export function QuestionCard({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  ctaLabel,
  onCta,
  ctaDisabled = false,
}: QuestionCardProps) {
  return (
    <div className="question-screen">
      <div className="question-card">
        <span className="question-card__step">Étape {step}/{totalSteps}</span>
        <h1 className="question-card__title">{title}</h1>
        {subtitle && <p className="question-card__subtitle">{subtitle}</p>}
        <div className="question-card__control">{children}</div>
        <Button
          variant="primary"
          size="L"
          onClick={onCta}
          disabled={ctaDisabled}
          className="question-card__cta"
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}

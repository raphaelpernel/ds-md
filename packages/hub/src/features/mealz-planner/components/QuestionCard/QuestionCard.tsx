'use client'

import type { ReactNode } from 'react'
import { Button, Heading } from '@mealz-product-team/design-system'
import './QuestionCard.css'

interface QuestionCardProps {
  step: number
  totalSteps: number
  icon?: ReactNode
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
  icon,
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
        <div className="question-card__header">
          {icon && <span className="question-card__icon" aria-hidden="true">{icon}</span>}
          <span className="question-card__step">Étape {step}/{totalSteps}</span>
        </div>
        <Heading as="h1" size="lg" className="question-card__title">{title}</Heading>
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

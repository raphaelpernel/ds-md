'use client'

import { useState, type ReactNode } from 'react'
import { ArrowsClockwise } from '@phosphor-icons/react'
import { Badge } from '../../display/Badge/Badge'
import { Button } from '../../form/Button/Button'
import { Heading } from '../../typography/Heading/Heading'
import { Stepper } from '../../form/Stepper/Stepper'
import './PlannerBanner.css'

/** Photos TheMealDB réutilisées ailleurs dans le repo (cf. `supermarket/src/data/recipes.ts`) —
 *  pas d'appel réseau tiers en direct, URLs codées en dur comme le reste du système. */
const DEFAULT_THUMBNAILS = [
  'https://www.themealdb.com/images/media/meals/vdwloy1713225718.jpg',
  'https://www.themealdb.com/images/media/meals/sypxpx1515365095.jpg',
  'https://www.themealdb.com/images/media/meals/1548772327.jpg',
  'https://www.themealdb.com/images/media/meals/uvuyxu1503067369.jpg',
  'https://www.themealdb.com/images/media/meals/urtpqw1487341253.jpg',
  'https://www.themealdb.com/images/media/meals/c0gmo31766594751.jpg',
]

export interface PlannerBannerProps {
  badgeLabel?: string
  title?: ReactNode
  subtitle?: ReactNode
  thumbnails?: string[]
  ctaLabel?: string
  onCtaClick?: () => void
  /** Mode contrôlé (ex. `form-mealz-planner` piloté par `WizardContext`). */
  peopleCount?: number
  onPeopleChange?: (value: number) => void
  /** Valeur initiale en mode non-contrôlé (ex. catalogue `supermarket`, pas de wizard). */
  defaultPeopleCount?: number
  peopleMin?: number
  peopleMax?: number
  backgroundImageMobile?: string
  backgroundImageDesktop?: string
  className?: string
}

/**
 * Bannière de mise en avant du Mealz Planner — réutilisée telle quelle entre la page
 * d'entrée du planner (`form-mealz-planner`) et le catalogue de recettes (`supermarket`),
 * pour cross-vendre la feature planner depuis n'importe quel contexte recette.
 *
 * `peopleCount`/`onPeopleChange` non fournis → le composant gère son propre état
 * (`defaultPeopleCount`), comme un input React non-contrôlé classique.
 */
export function PlannerBanner({
  badgeLabel = 'NOUVEAU',
  title,
  subtitle,
  thumbnails = DEFAULT_THUMBNAILS,
  ctaLabel = "C'est parti !",
  onCtaClick,
  peopleCount,
  onPeopleChange,
  defaultPeopleCount = 2,
  peopleMin = 1,
  peopleMax = 12,
  backgroundImageMobile = '/img/planner-banner-bg-mobile.png',
  backgroundImageDesktop = '/img/planner-banner-bg-desktop.png',
  className,
}: PlannerBannerProps) {
  const [internalPeopleCount, setInternalPeopleCount] = useState(defaultPeopleCount)
  const isControlled = peopleCount !== undefined
  const people = isControlled ? peopleCount : internalPeopleCount

  const handlePeopleChange = (value: number) => {
    if (!isControlled) setInternalPeopleCount(value)
    onPeopleChange?.(value)
  }

  return (
    <div
      className={['planner-banner', className].filter(Boolean).join(' ')}
      style={
        {
          '--planner-banner-bg-mobile': `url('${backgroundImageMobile}')`,
          '--planner-banner-bg-desktop': `url('${backgroundImageDesktop}')`,
        } as React.CSSProperties
      }
    >
      <div className="planner-banner__card">
        <div className="planner-banner__left">
          <Badge label={badgeLabel} icon={<ArrowsClockwise size={12} weight="bold" />} variant="brand" size="L" />
          <Heading as="h2" size="md" className="planner-banner__title">
            {title ?? (
              <>
                Qu&rsquo;est-ce qu&rsquo;on <strong>mange</strong>
                <br />
                <span className="planner-banner__title-accent">cette semaine ?</span>
              </>
            )}
          </Heading>
        </div>

        <div className="planner-banner__right">
          <p className="planner-banner__subtitle">
            {subtitle ?? (
              <>
                Découvrez le <strong>menu du moment</strong>, personnalisez et{' '}
                <strong>commandez-le en 1 clic !</strong>
              </>
            )}
          </p>

          <div className="planner-banner__thumbs" aria-hidden="true">
            {thumbnails.map((src, i) => (
              <img key={src + i} src={src} alt="" className="planner-banner__thumb" />
            ))}
          </div>

          <div className="planner-banner__actions">
            <Stepper
              value={people}
              onChange={handlePeopleChange}
              min={peopleMin}
              max={peopleMax}
              size="M"
              label="Nombre de personnes"
              suffix="pers."
            />
            <Button variant="primary" size="L" onClick={onCtaClick}>
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlannerBanner

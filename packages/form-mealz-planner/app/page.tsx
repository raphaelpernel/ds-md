'use client'

import { useRouter } from 'next/navigation'
import { ArrowsClockwise } from '@phosphor-icons/react'
import { Badge, Button, Stepper } from '@mealz-product-team/design-system'
import { useWizard } from '@/context/WizardContext'
import '@mealz-product-team/design-system/styles/index.css'

const THUMBNAIL_COUNT = 6

export default function Home() {
  const router = useRouter()
  const { state, setPeople } = useWizard()

  return (
    <div className="entry-page">
      <div className="entry-banner">
        <div className="entry-banner__card">
          <div className="entry-banner__left">
            <Badge label="NOUVEAU" icon={<ArrowsClockwise size={12} weight="bold" />} variant="brand" size="L" />
            <h1 className="entry-banner__title">
              Qu&rsquo;est-ce qu&rsquo;on <strong>mange</strong>
              <br />
              <span className="entry-banner__title-accent">cette semaine ?</span>
            </h1>
          </div>

          <div className="entry-banner__right">
            <p className="entry-banner__subtitle">
              Découvrez le <strong>menu du moment</strong>, personnalisez et <strong>commandez-le en 1 clic !</strong>
            </p>

            <div className="entry-banner__thumbs" aria-hidden="true">
              {Array.from({ length: THUMBNAIL_COUNT }).map((_, i) => (
                <span key={i} className="entry-banner__thumb" />
              ))}
            </div>

            <div className="entry-banner__actions">
              <Stepper value={state.people} onChange={setPeople} min={1} max={12} size="M" label="Nombre de personnes" suffix="pers." />
              <Button variant="primary" size="L" onClick={() => router.push('/personnes')}>
                C&rsquo;est parti !
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .entry-page {
          min-height: 100vh;
          background: var(--color-surface-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-24) var(--spacing-16);
        }

        .entry-banner {
          width: 100%;
          max-width: 1200px;
          border-radius: var(--shape-card);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-16);
          background-image: url('/img/planner-banner-bg-mobile.png');
          background-size: cover;
          background-position: center;
          aspect-ratio: 375 / 340;
        }

        @media (min-width: 768px) {
          .entry-banner {
            background-image: url('/img/planner-banner-bg-desktop.png');
            aspect-ratio: 1200 / 272;
            padding: var(--spacing-24);
          }
        }

        .entry-banner__card {
          width: 100%;
          max-width: 400px;
          background: var(--color-surface-page);
          border-radius: var(--shape-sheet);
          box-shadow: var(--elevation-400);
          padding: var(--spacing-20);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-12);
        }

        .entry-banner__left {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-8);
        }

        .entry-banner__title {
          font-family: var(--font-family-heading);
          font-size: var(--font-size-heading-md);
          line-height: var(--line-height-heading-md);
          color: var(--color-content-default);
          text-align: center;
        }

        .entry-banner__title-accent {
          color: var(--color-interactive-content);
        }

        .entry-banner__right {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-12);
        }

        .entry-banner__subtitle {
          font-size: var(--font-size-body-sm);
          line-height: var(--line-height-body-sm);
          color: var(--color-content-default);
          text-align: center;
        }

        .entry-banner__thumbs {
          display: flex;
        }

        .entry-banner__thumb {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-surface-secondary);
          border: 2px solid var(--color-surface-page);
          margin-left: -10px;
        }

    

        .entry-banner__thumb:first-child { margin-left: 0; }

        .entry-banner__actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-12);
          flex-wrap: wrap;
        }
        .entry-banner__actions .btn { flex: 1; }

        @media (min-width: 768px) {
          .entry-banner__card {
            max-width: none;
            max-width: 840px;
            flex-direction: row;
            align-items: center;
            padding: var(--spacing-24) var(--spacing-32);
            gap: var(--spacing-32);
          }
          .entry-banner__left { flex: 0 0 auto; }
          .entry-banner__right { flex: 1; }
          .entry-banner__title { font-size: var(--font-size-heading-lg); line-height: var(--line-height-heading-lg); }
          .entry-banner__thumb { width: 80px; height: 80px; margin-left: -12px; }
          .entry-banner__actions { flex-wrap: nowrap; }
          .entry-banner__actions .btn { flex: 0 0 auto; }
        }
      `}</style>
    </div>
  )
}

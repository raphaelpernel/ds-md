'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../src/components/ui/form/Button/Button'
import { SegmentedControl } from '../../../src/components/ui/navigation/SegmentedControl/SegmentedControl'
import { Radio } from '../../../src/components/ui/form/Radio/Radio'
import { Breadcrumb } from '../../../src/components/ui/navigation/Breadcrumb/Breadcrumb'
import { DateTabs } from '../../../src/components/ui/navigation/DateTabs/DateTabs'
import { useCart } from '../../../src/context/CartContext'
import { MOCK_TIMESLOT_DAYS } from '../../../src/data/mock/timeslots'
import type { Timeslot } from '../../../src/data/types/timeslot'
import '../../../src/styles/index.css'

type Mode = 'drive' | 'livraison'

const MODE_TABS = [
  { value: 'drive', label: 'Drive' },
  { value: 'livraison', label: 'Livraison à domicile' },
]

export default function CreneauPage() {
  const router = useRouter()
  const { setTimeslot, state, total } = useCart()
  const [activeDay, setActiveDay] = useState(MOCK_TIMESLOT_DAYS[0].date)
  const [selected, setSelected] = useState<string | null>(state.timeslot?.id ?? null)
  const [mode, setMode] = useState<Mode>('drive')

  const currentDay = MOCK_TIMESLOT_DAYS.find((d) => d.date === activeDay) ?? MOCK_TIMESLOT_DAYS[0]
  const dayItems = MOCK_TIMESLOT_DAYS.map((d) => ({ date: d.date }))

  const handleSlot = (slot: Timeslot) => {
    if (!slot.available) return
    setSelected(slot.id)
    setTimeslot(slot)
  }

  const handleConfirm = () => {
    if (selected) router.push('/paiement')
  }

  return (
    <div className="cr-page">
      {/* Breadcrumb stepper */}
      <div className="cr-breadcrumb-wrap">
        <Breadcrumb
          items={[
            { label: 'Magasin', href: '/magasin' },
            { label: 'Créneau' },
            { label: 'Paiement' },
          ]}
          separator="›"
        />
      </div>

      {/* Store info */}
      {state.storeName && (
        <div className="cr-store-row">
          <div>
            <p className="cr-store-name">{state.storeName}</p>
            <p className="cr-store-sub">Retrait parking</p>
          </div>
          <Button variant="tertiary" size="S" onClick={() => router.push('/magasin')}>
            Modifier
          </Button>
        </div>
      )}

      {/* Drive / Livraison toggle */}
      <div className="cr-mode-wrap">
        <SegmentedControl
          options={MODE_TABS}
          value={mode}
          onChange={(v) => setMode(v as Mode)}
          fullWidth
        />
      </div>

      {/* Day tabs — DateTabs DS */}
      <div className="cr-days-wrap">
        <DateTabs
          items={dayItems}
          value={activeDay}
          onChange={setActiveDay}
        />
      </div>

      {/* Time slots — Radio DS */}
      <div className="cr-slots" role="tabpanel">
        {currentDay.slots.map((slot) => {
          const isSelected = selected === slot.id
          const isFree = slot.price === 0
          return (
            <div
              key={slot.id}
              className={[
                'cr-slot',
                !slot.available && 'cr-slot--disabled',
                isSelected && 'cr-slot--selected',
              ].filter(Boolean).join(' ')}
              onClick={() => handleSlot(slot)}
              role="button"
              tabIndex={slot.available ? 0 : -1}
              onKeyDown={(e) => e.key === 'Enter' && handleSlot(slot)}
            >
              <span className="cr-slot__time">{slot.startTime} — {slot.endTime}</span>
              <div className="cr-slot__right">
                {slot.available && isFree && (
                  <span className="cr-slot__tag cr-slot__tag--free">Moins d&rsquo;attente</span>
                )}
                {slot.available && !isFree && (
                  <span className="cr-slot__tag cr-slot__tag--fast">Disponible</span>
                )}
                {!slot.available && (
                  <span className="cr-slot__tag cr-slot__tag--full">Complet</span>
                )}
                {/* Radio DS — checked state hérite de --color-interactive-bg = bleu Carrefour */}
                <Radio
                  checked={isSelected}
                  disabled={!slot.available}
                  onChange={() => handleSlot(slot)}
                  aria-label={`${slot.startTime} – ${slot.endTime}`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer sticky */}
      <div className="cr-footer">
        <div className="cr-footer__totals">
          <div className="cr-footer__line">
            <span>Sous-total</span>
            <span>{total.toFixed(2).replace('.', ',')} €</span>
          </div>
          <div className="cr-footer__line">
            <span>Livraison</span>
            <span>Gratuite</span>
          </div>
        </div>
        <Button
          variant="primary"
          size="L"
          onClick={handleConfirm}
          disabled={!selected}
          className="cr-footer__cta"
        >
          Confirmer ce créneau
        </Button>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .cr-page {
          min-height: 100vh; max-width: 480px; margin: 0 auto;
          background: #fff; font-family: var(--font-family-body);
          display: flex; flex-direction: column;
        }

        .cr-breadcrumb-wrap {
          padding: 10px 16px;
          border-bottom: 1px solid var(--color-border-default);
        }

        .cr-store-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid var(--color-border-default);
        }
        .cr-store-name { font-size: 14px; font-weight: 700; color: var(--color-content-default); }
        .cr-store-sub { font-size: 12px; color: var(--color-content-weak); margin-top: 2px; }

        .cr-mode-wrap { padding: 12px 16px; }

        .cr-days-wrap {
          padding: 4px 16px 8px;
          border-bottom: 1px solid var(--color-border-default);
        }

        .cr-slots { flex: 1; }
        .cr-slot {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--color-border-weak);
          cursor: pointer; transition: background 0.15s;
        }
        .cr-slot:hover:not(.cr-slot--disabled) { background: #f9f9f9; }
        .cr-slot--disabled { opacity: 0.45; cursor: not-allowed; }
        .cr-slot--selected { background: var(--color-interactive-bg-subtle); }
        .cr-slot__time { font-size: 14px; color: var(--color-content-default); }
        .cr-slot__right { display: flex; align-items: center; gap: 10px; }
        .cr-slot__tag {
          font-size: 11px; font-weight: 600; border-radius: 4px; padding: 2px 7px;
        }
        .cr-slot__tag--free { background: var(--color-interactive-bg-subtle); color: var(--color-interactive-content); }
        .cr-slot__tag--fast { background: #FFF3E0; color: #E65100; }
        .cr-slot__tag--full { color: var(--color-content-weak); }

        /* Footer sticky */
        .cr-footer {
          position: sticky; bottom: 0;
          background: #fff; border-top: 1px solid var(--color-border-default);
          padding: 12px 16px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .cr-footer__totals { display: flex; flex-direction: column; gap: 4px; }
        .cr-footer__line {
          display: flex; justify-content: space-between;
          font-size: 13px; color: var(--color-content-weak);
        }
        /* Button pleine largeur dans le footer */
        .cr-footer__cta { width: 100%; }
      `}</style>
    </div>
  )
}

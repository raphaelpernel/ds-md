'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Info } from '@phosphor-icons/react'
import { Button, InputField, SegmentedControl, Radio, Breadcrumb, DateTabs, Tooltip } from '@mealz-product-team/design-system'
import { useCart } from '@/context/CartContext'
import { MOCK_TIMESLOT_DAYS } from '@/data/mock/timeslots'
import type { Timeslot } from '@/data/types/timeslot'
import '@mealz-product-team/design-system/styles/index.css'

const WEIGHED_PRODUCTS_PROVISION = 8.5
const DEPOSIT_BAG_COUNT = 3
const DEPOSIT_BAG_UNIT_PRICE = 0.35

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
  const [promoCode, setPromoCode] = useState('')

  const currentDay = MOCK_TIMESLOT_DAYS.find((d) => d.date === activeDay) ?? MOCK_TIMESLOT_DAYS[0]
  const weighedProductsProvision = WEIGHED_PRODUCTS_PROVISION
  const depositBagsTotal = DEPOSIT_BAG_COUNT * DEPOSIT_BAG_UNIT_PRICE
  const grandTotal = total + weighedProductsProvision + depositBagsTotal
  const dayItems = MOCK_TIMESLOT_DAYS.map((d) => ({ date: d.date }))

  const handleSlot = (slot: Timeslot) => {
    if (!slot.available) return
    setSelected(slot.id)
    setTimeslot(slot)
  }

  const handleConfirm = () => {
    if (selected) router.push('/payment')
  }

  return (
    <div className="order-timeslot-page" data-partner="carrefour">
      {/* Breadcrumb stepper */}
      <div className="order-timeslot-breadcrumb-wrap">
        <Breadcrumb
          items={[
            { label: 'Magasin', href: '/store' },
            { label: 'Créneau' },
            { label: 'Paiement' },
          ]}
          separator="›"
        />
      </div>

      {/* Store info */}
      {state.storeName && (
        <div className="order-timeslot-store-row">
          <div>
            <p className="order-timeslot-store-name">{state.storeName}</p>
            <p className="order-timeslot-store-sub">Retrait parking</p>
          </div>
          <Button variant="tertiary" size="S" onClick={() => router.push('/store')}>
            Modifier
          </Button>
        </div>
      )}

      {/* Drive / Livraison toggle */}
      <div className="order-timeslot-mode-wrap">
        <SegmentedControl
          options={MODE_TABS}
          value={mode}
          onChange={(v) => setMode(v as Mode)}
          fullWidth
        />
      </div>

      {/* Day tabs — DateTabs DS */}
      <div className="order-timeslot-days-wrap">
        <DateTabs
          items={dayItems}
          value={activeDay}
          onChange={setActiveDay}
        />
      </div>

      {/* Time slots — Radio DS */}
      <div className="order-timeslot-slots" role="tabpanel">
        {currentDay.slots.map((slot) => {
          const isSelected = selected === slot.id
          const isFree = slot.price === 0
          return (
            <div
              key={slot.id}
              className={[
                'order-timeslot-slot',
                !slot.available && 'order-timeslot-slot--disabled',
                isSelected && 'order-timeslot-slot--selected',
              ].filter(Boolean).join(' ')}
              onClick={() => handleSlot(slot)}
              role="button"
              tabIndex={slot.available ? 0 : -1}
              onKeyDown={(e) => e.key === 'Enter' && handleSlot(slot)}
            >
              <span className="order-timeslot-slot__time">{slot.startTime} — {slot.endTime}</span>
              <div className="order-timeslot-slot__right">
                {slot.available && isFree && (
                  <span className="order-timeslot-slot__tag order-timeslot-slot__tag--free">Moins d&rsquo;attente</span>
                )}
                {slot.available && !isFree && (
                  <span className="order-timeslot-slot__tag order-timeslot-slot__tag--fast">Disponible</span>
                )}
                {!slot.available && (
                  <span className="order-timeslot-slot__tag order-timeslot-slot__tag--full">Complet</span>
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

      {/* Informations — adresse de facturation / téléphone (calqué sur carrefour.fr) */}
      <div className="order-timeslot-infos">
        <p className="order-timeslot-infos__title">Informations</p>
        <div className="order-timeslot-infos__row">
          <div>
            <p className="order-timeslot-infos__label">Adresse de facturation</p>
            <p className="order-timeslot-infos__value">32 Rue Du Mont Mirel, 76150 Maromme</p>
          </div>
          <Button variant="tertiary" size="S">Modifier</Button>
        </div>
        <div className="order-timeslot-infos__row">
          <div>
            <p className="order-timeslot-infos__label">Numéro de téléphone</p>
            <p className="order-timeslot-infos__value">+33 06 ****** 39</p>
          </div>
          <Button variant="tertiary" size="S">Modifier</Button>
        </div>
      </div>

      {/* Footer sticky — récap calqué sur carrefour.fr */}
      <div className="order-timeslot-footer">
        <div className="order-timeslot-footer__totals">
          <div className="order-timeslot-footer__line">
            <span>Sous-total ({state.items.length} article{state.items.length > 1 ? 's' : ''})</span>
            <span>{total.toFixed(2).replace('.', ',')} €</span>
          </div>
          <div className="order-timeslot-footer__line">
            <span className="order-timeslot-footer__line-label">
              Provision produits à la pesée
              <Tooltip content="Montant estimé, ajusté au poids réel lors de la préparation de votre commande.">
                <Info size={13} weight="bold" aria-hidden="true" />
              </Tooltip>
            </span>
            <span>+{weighedProductsProvision.toFixed(2).replace('.', ',')} €</span>
          </div>
          <div className="order-timeslot-footer__line">
            <span>Provision sacs consignés</span>
            <span>{DEPOSIT_BAG_COUNT} x {DEPOSIT_BAG_UNIT_PRICE.toFixed(2).replace('.', ',')}€</span>
          </div>
        </div>

        <div className="order-timeslot-footer__promo">
          <InputField
            placeholder="Code promo"
            aria-label="Code promo"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <Button variant="secondary" size="M">OK</Button>
        </div>

        <div className="order-timeslot-footer__grand-total">
          <span>Total</span>
          <span>{grandTotal.toFixed(2).replace('.', ',')} €</span>
        </div>

        <Button
          variant="primary"
          size="L"
          onClick={handleConfirm}
          disabled={!selected}
          className="order-timeslot-footer__cta"
        >
          Continuer
        </Button>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .order-timeslot-page {
          min-height: 100vh; max-width: 480px; margin: 0 auto;
          background: #fff; font-family: var(--font-family-body);
          display: flex; flex-direction: column;
        }

        .order-timeslot-breadcrumb-wrap {
          padding: 10px 16px;
          border-bottom: 1px solid var(--color-border-default);
        }

        .order-timeslot-store-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid var(--color-border-default);
        }
        .order-timeslot-store-name { font-size: 14px; font-weight: 700; color: var(--color-content-default); }
        .order-timeslot-store-sub { font-size: 12px; color: var(--color-content-weak); margin-top: 2px; }

        .order-timeslot-mode-wrap { padding: 12px 16px; }

        .order-timeslot-days-wrap {
          padding: 4px 16px 8px;
          border-bottom: 1px solid var(--color-border-default);
        }

        .order-timeslot-slots { flex: 1; }
        .order-timeslot-slot {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--color-border-weak);
          cursor: pointer; transition: background 0.15s;
        }
        .order-timeslot-slot:hover:not(.order-timeslot-slot--disabled) { background: #f9f9f9; }
        .order-timeslot-slot--disabled { opacity: 0.45; cursor: not-allowed; }
        .order-timeslot-slot--selected { background: var(--color-interactive-bg-subtle); }
        .order-timeslot-slot__time { font-size: 14px; color: var(--color-content-default); }
        .order-timeslot-slot__right { display: flex; align-items: center; gap: 10px; }
        .order-timeslot-slot__tag {
          font-size: 11px; font-weight: 600; border-radius: 4px; padding: 2px 7px;
        }
        .order-timeslot-slot__tag--free { background: var(--color-interactive-bg-subtle); color: var(--color-interactive-content); }
        .order-timeslot-slot__tag--fast { background: #FFF3E0; color: #E65100; }
        .order-timeslot-slot__tag--full { color: var(--color-content-weak); }

        /* Informations — adresse / téléphone */
        .order-timeslot-infos { padding: 16px; border-bottom: 8px solid var(--color-surface-secondary); }
        .order-timeslot-infos__title { font-size: 15px; font-weight: 700; color: var(--color-content-default); margin-bottom: 12px; }
        .order-timeslot-infos__row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; padding: 10px 0;
          border-top: 1px solid var(--color-border-weak);
        }
        .order-timeslot-infos__row:first-of-type { border-top: none; }
        .order-timeslot-infos__label { font-size: 12px; color: var(--color-content-weak); }
        .order-timeslot-infos__value { font-size: 14px; color: var(--color-content-default); margin-top: 2px; }

        /* Footer sticky */
        .order-timeslot-footer {
          position: sticky; bottom: 0;
          background: #fff; border-top: 1px solid var(--color-border-default);
          padding: 12px 16px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .order-timeslot-footer__totals { display: flex; flex-direction: column; gap: 4px; }
        .order-timeslot-footer__line {
          display: flex; justify-content: space-between;
          font-size: 13px; color: var(--color-content-weak);
        }
        .order-timeslot-footer__line-label { display: inline-flex; align-items: center; gap: 4px; }
        .order-timeslot-footer__promo { display: flex; align-items: flex-end; gap: 8px; }
        .order-timeslot-footer__promo .input-field { flex: 1; }
        .order-timeslot-footer__grand-total {
          display: flex; justify-content: space-between;
          font-size: 16px; font-weight: 700; color: var(--color-content-default);
          padding-top: 8px; border-top: 1px solid var(--color-border-default);
        }
        /* Button pleine largeur dans le footer */
        .order-timeslot-footer__cta { width: 100%; }
      `}</style>
    </div>
  )
}

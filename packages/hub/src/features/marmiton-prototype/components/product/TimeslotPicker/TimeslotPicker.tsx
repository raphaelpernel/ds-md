'use client'

import { useState } from 'react'
import { MOCK_TIMESLOT_DAYS } from '../../../data/mock/timeslots'
import type { Timeslot } from '../../../data/types/timeslot'
import './TimeslotPicker.css'

interface TimeslotPickerProps {
  onSelect?: (timeslot: Timeslot) => void
  selectedId?: string | null
}

export function TimeslotPicker({ onSelect, selectedId }: TimeslotPickerProps) {
  const [activeDay, setActiveDay] = useState(MOCK_TIMESLOT_DAYS[0].date)
  const [selected, setSelected] = useState<string | null>(selectedId ?? null)

  const currentDay = MOCK_TIMESLOT_DAYS.find((d) => d.date === activeDay) ?? MOCK_TIMESLOT_DAYS[0]

  const handleSlot = (slot: Timeslot) => {
    if (!slot.available) return
    setSelected(slot.id)
    onSelect?.(slot)
  }

  return (
    <div className="timeslot-picker">
      <h2 className="timeslot-picker__title">Choisir un créneau</h2>

      <div className="timeslot-picker__days" role="tablist" aria-label="Jours disponibles">
        {MOCK_TIMESLOT_DAYS.map((day) => (
          <button
            key={day.date}
            role="tab"
            aria-selected={activeDay === day.date}
            className={`timeslot-picker__day-tab${activeDay === day.date ? ' timeslot-picker__day-tab--active' : ''}`}
            onClick={() => setActiveDay(day.date)}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="timeslot-picker__slots" role="tabpanel">
        {currentDay.slots.map((slot) => {
          const isFree = slot.price === 0
          const isSelected = selected === slot.id
          return (
            <button
              key={slot.id}
              className={[
                'timeslot-slot',
                !slot.available && 'timeslot-slot--disabled',
                isSelected && 'timeslot-slot--selected',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleSlot(slot)}
              disabled={!slot.available}
              aria-pressed={isSelected}
              aria-label={`${slot.startTime}–${slot.endTime}${isFree ? ', livraison offerte' : `, ${slot.price.toFixed(2).replace('.', ',')} €`}${!slot.available ? ', indisponible' : ''}`}
              data-partner={isSelected ? 'carrefour' : undefined}
            >
              <span className="timeslot-slot__time">
                {slot.startTime} – {slot.endTime}
              </span>
              <span className={`timeslot-slot__price${isFree ? ' timeslot-slot__price--free' : ''}`}>
                {isFree ? 'Offert' : `${slot.price.toFixed(2).replace('.', ',')} €`}
              </span>
              {!slot.available && (
                <span className="timeslot-slot__unavailable">Complet</span>
              )}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="timeslot-picker__confirm" data-partner="carrefour">
          <p className="timeslot-picker__confirm-text">
            Créneau sélectionné :{' '}
            <strong>
              {currentDay.label},{' '}
              {currentDay.slots.find((s) => s.id === selected)?.startTime} –{' '}
              {currentDay.slots.find((s) => s.id === selected)?.endTime}
            </strong>
          </p>
        </div>
      )}
    </div>
  )
}

export default TimeslotPicker

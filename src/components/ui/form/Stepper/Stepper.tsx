import { Minus, Plus } from '@phosphor-icons/react'
import { Button } from '../Button/Button'
import './Stepper.css'

export interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'XS' | 'S' | 'M'
  disabled?: boolean
  label?: string
  suffix?: string
}

const iconSize: Record<NonNullable<StepperProps['size']>, number> = {
  XS: 14,
  S:  16,
  M:  20,
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  size = 'S',
  disabled = false,
  label,
  suffix,
}: StepperProps) {
  const px = iconSize[size]

  return (
    <div className="stepper" role="group" aria-label={label ?? 'Quantité'}>
      <Button
        variant="secondary"
        size={size}
        iconOnly={<Minus size={px} aria-hidden="true" />}
        className="stepper__btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Diminuer"
      />
      <span className="stepper__value" aria-live="polite" aria-atomic="true">
        {value}{suffix ? ` ${suffix}` : ''}
      </span>
      <Button
        variant="secondary"
        size={size}
        iconOnly={<Plus size={px} aria-hidden="true" />}
        className="stepper__btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Augmenter"
      />
    </div>
  )
}

export default Stepper

import { Button } from '../Button/Button'
import './Stepper.css'

export interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'S' | 'M'
  disabled?: boolean
  label?: string
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  size = 'S',
  disabled = false,
  label,
}: StepperProps) {
  return (
    <div className="stepper" role="group" aria-label={label ?? 'Quantité'}>
      <Button
        variant="secondary"
        size={size}
        iconOnly={<span aria-hidden="true">−</span>}
        className="stepper__btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Diminuer"
      />
      <span className="stepper__value" aria-live="polite" aria-atomic="true">
        {value}
      </span>
      <Button
        variant="secondary"
        size={size}
        iconOnly={<span aria-hidden="true">+</span>}
        className="stepper__btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Augmenter"
      />
    </div>
  )
}

export default Stepper

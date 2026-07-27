import { type InputHTMLAttributes, useId } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Toggle.css'

const toggle = cva('toggle', {
  variants: {
    size: { M: 'toggle--M', S: 'toggle--S' },
  },
  defaultVariants: { size: 'M' },
})

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof toggle> {
  label?: string
}

export function Toggle({ label, size, id, className, ...props }: ToggleProps) {
  const generatedId = useId()
  const toggleId = id ?? generatedId
  return (
    <label className={toggle({ size, class: className })} htmlFor={toggleId}>
      <input type="checkbox" id={toggleId} role="switch" className="toggle__input" {...props} />
      <span className="toggle__track"><span className="toggle__thumb" /></span>
      {label && <span className="toggle__label">{label}</span>}
    </label>
  )
}
export default Toggle

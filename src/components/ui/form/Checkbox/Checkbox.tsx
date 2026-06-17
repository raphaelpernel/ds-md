import { type InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Checkbox.css'

const checkbox = cva('checkbox', {
  variants: {
    state: {
      default: '',
      error:   'checkbox--error',
    },
  },
  defaultVariants: { state: 'default' },
})

export interface CheckboxProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof checkbox> {
  label?: string
  indeterminate?: boolean
}

export function Checkbox({ label, indeterminate = false, state, id, className, ...props }: CheckboxProps) {
  const cbId = id ?? `checkbox-${Math.random().toString(36).slice(2)}`
  return (
    <label className={checkbox({ state, class: className })} htmlFor={cbId}>
      <input type="checkbox" id={cbId} className="checkbox__input" data-indeterminate={indeterminate} {...props} />
      <span className="checkbox__box" aria-hidden="true">
        {indeterminate ? <span className="checkbox__dash" /> : <span className="checkbox__check" />}
      </span>
      {label && <span className="checkbox__label">{label}</span>}
    </label>
  )
}
export default Checkbox

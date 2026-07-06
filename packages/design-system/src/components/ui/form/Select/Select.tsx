import { type SelectHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './Select.css'

const select = cva('select', {
  variants: {
    state: {
      default:  '',
      error:    'select--error',
      disabled: 'select--disabled',
    },
  },
  defaultVariants: { state: 'default' },
})

export interface SelectOption { value: string; label: string }

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof select> {
  label?: string
  options?: SelectOption[]
  placeholder?: string
  helperText?: string
  errorText?: string
}

export function Select({ label, options = [], placeholder, helperText, errorText, state, id, className, ...props }: SelectProps) {
  const hasError = state === 'error' || !!errorText
  const selectId = id ?? `select-${Math.random().toString(36).slice(2)}`
  return (
    <div className={select({ state: hasError ? 'error' : state, class: className })}>
      {label && <label className="select__label" htmlFor={selectId}>{label}</label>}
      <div className="select__wrapper">
        <select id={selectId} className="select__field" disabled={state === 'disabled'} aria-invalid={hasError} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="select__arrow" aria-hidden="true">▾</span>
      </div>
      {hasError && errorText && <p className="select__helper select__helper--error">{errorText}</p>}
      {!hasError && helperText && <p className="select__helper">{helperText}</p>}
    </div>
  )
}
export default Select

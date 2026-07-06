import { type InputHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './InputField.css'

const inputField = cva('input-field', {
  variants: {
    state: {
      default:  '',
      error:    'input-field--error',
      disabled: 'input-field--disabled',
    },
  },
  defaultVariants: { state: 'default' },
})

export interface InputFieldProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputField> {
  label?: string
  helperText?: string
  errorText?: string
  lIcon?: ReactNode
  rIcon?: ReactNode
}

export function InputField({ label, helperText, errorText, lIcon, rIcon, state, className, id, ...props }: InputFieldProps) {
  const hasError = state === 'error' || !!errorText
  const fieldId = id ?? `input-${Math.random().toString(36).slice(2)}`

  return (
    <div className={inputField({
      state: hasError ? 'error' : state,
      class: [lIcon && 'input-field--has-l-icon', rIcon && 'input-field--has-r-icon', className].filter(Boolean).join(' '),
    })}>
      {label && <label className="input-field__label" htmlFor={fieldId}>{label}</label>}
      <div className="input-field__wrapper">
        {lIcon && <span className="input-field__icon input-field__icon--left">{lIcon}</span>}
        <input
          id={fieldId}
          className="input-field__input"
          disabled={state === 'disabled'}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
          {...props}
        />
        {rIcon && <span className="input-field__icon input-field__icon--right">{rIcon}</span>}
      </div>
      {hasError && errorText && <p id={`${fieldId}-error`} className="input-field__helper input-field__helper--error">{errorText}</p>}
      {!hasError && helperText && <p id={`${fieldId}-helper`} className="input-field__helper">{helperText}</p>}
    </div>
  )
}

export default InputField

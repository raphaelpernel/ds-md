import { type TextareaHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import './InputTextarea.css'

const inputTextarea = cva('input-textarea', {
  variants: {
    state: {
      default:  '',
      error:    'input-textarea--error',
      disabled: 'input-textarea--disabled',
    },
  },
  defaultVariants: { state: 'default' },
})

export interface InputTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputTextarea> {
  label?: string
  helperText?: string
  errorText?: string
}

export function InputTextarea({ label, helperText, errorText, state, id, className, ...props }: InputTextareaProps) {
  const hasError = state === 'error' || !!errorText
  const fieldId = id ?? `textarea-${Math.random().toString(36).slice(2)}`
  return (
    <div className={inputTextarea({ state: hasError ? 'error' : state, class: className })}>
      {label && <label className="input-textarea__label" htmlFor={fieldId}>{label}</label>}
      <textarea id={fieldId} className="input-textarea__field" disabled={state === 'disabled'} aria-invalid={hasError} rows={4} {...props} />
      {hasError && errorText && <p className="input-textarea__helper input-textarea__helper--error">{errorText}</p>}
      {!hasError && helperText && <p className="input-textarea__helper">{helperText}</p>}
    </div>
  )
}
export default InputTextarea

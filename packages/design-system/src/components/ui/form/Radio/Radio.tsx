import { type InputHTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import './Radio.css'

const radio = cva('radio')

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Radio({ label, id, className, ...props }: RadioProps) {
  const radioId = id ?? `radio-${Math.random().toString(36).slice(2)}`
  return (
    <label className={radio({ class: className })} htmlFor={radioId}>
      <input type="radio" id={radioId} className="radio__input" {...props} />
      <span className="radio__dot" aria-hidden="true" />
      {label && <span className="radio__label">{label}</span>}
    </label>
  )
}
export default Radio

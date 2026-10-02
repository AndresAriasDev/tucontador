import { useId, useRef, useState } from 'react'
import { DateWheelPicker } from './DateWheelPicker'
import { parseDateValue } from '../utils/datePicker'

export interface DateFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  disabled?: boolean
  required?: boolean
  error?: string
  helperText?: string
  name?: string
  id?: string
  pickerLabel?: string
  defaultPickerDate?: string
}
export function DateField({ label, value, onChange, min, max, disabled, required, error, helperText, name, id, pickerLabel, defaultPickerDate }: DateFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const description = [helperText ? `${fieldId}-helper` : '', error ? `${fieldId}-error` : '', required ? `${fieldId}-required` : ''].filter(Boolean).join(' ') || undefined
  function close() { setOpen(false); trigger.current?.focus() }
  return <div className="date-field">
    <label htmlFor={fieldId}>{label}</label>
    <button ref={trigger} id={fieldId} type="button" className="date-field__trigger" disabled={disabled} aria-haspopup="dialog" aria-expanded={open && !disabled} aria-invalid={Boolean(error)} aria-describedby={description} onClick={() => setOpen(true)}>
      <span>{parseDateValue(value) ? value.split('-').reverse().join('/') : 'Seleccionar fecha'}</span><span className="date-field__icon" aria-hidden="true" />
    </button>
    {required && <span id={`${fieldId}-required`} className="date-field__sr">Campo obligatorio</span>}
    {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
    {helperText && <p id={`${fieldId}-helper`} className="date-field__helper">{helperText}</p>}
    {error && <p id={`${fieldId}-error`} className="calculator__error" role="alert">{error}</p>}
    {open && !disabled && <DateWheelPicker label={pickerLabel ?? label} value={value} min={min} max={max} defaultPickerDate={defaultPickerDate} onCancel={close} onConfirm={(next) => { onChange(next); close() }} />}
  </div>
}

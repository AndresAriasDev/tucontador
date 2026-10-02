import { useRef, useState } from 'react'
import { captureSalaryCaret, formatSalaryDisplay, mapSalaryCaret, parseSalaryInput } from '../utils/salaryInput'
import { InfoTooltip } from './InfoTooltip'

export interface MoneyValue { raw: string; valid: boolean }
interface MoneyFieldProps {
  id: string
  label: string
  error?: string
  help?: string
  placeholder?: string
  onChange: (value: MoneyValue) => void
}

/** Uses the same parsing, grouping and caret utilities as IR/INSS. */
export function MoneyField({ id, label, error, help, placeholder = '20,000', onChange }: MoneyFieldProps) {
  const [raw, setRaw] = useState('')
  const [display, setDisplay] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function change(value: string, caret: number) {
    const parsed = parseSalaryInput(value)
    if (!parsed.valid) {
      onChange({ raw, valid: false })
      return
    }
    const snapshot = captureSalaryCaret(value, caret, parsed)
    const formatted = formatSalaryDisplay(parsed.value)
    setRaw(parsed.value)
    setDisplay(formatted)
    onChange({ raw: parsed.value, valid: true })
    window.requestAnimationFrame(() => {
      const input = inputRef.current
      if (input && document.activeElement === input) {
        const position = mapSalaryCaret(formatted, snapshot)
        input.setSelectionRange(position, position)
      }
    })
  }

  return (
    <div>
      <div className="calculator__label-row">
        <label htmlFor={id}>{label}</label>
        {help && <InfoTooltip id={`${id}-help`} label={label} title={label}>{help}</InfoTooltip>}
      </div>
      <div className={`calculator__input-wrap${error ? ' is-invalid' : ''}`}>
        <span aria-hidden="true">C$</span>
        <input ref={inputRef} id={id} name={id} type="text" inputMode="decimal" autoComplete="off" spellCheck={false} placeholder={placeholder} value={display}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => change(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length)}
          onBlur={() => setDisplay(formatSalaryDisplay(raw, true))} />
      </div>
      {error && <p className="calculator__error calculator__validation-slot" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  )
}

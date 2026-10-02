import { InfoTooltip } from './InfoTooltip'

interface DaysFieldProps {
  id: string
  label: string
  help: string
  value: string
  error?: string
  onChange: (value: string) => void
}
export function DaysField({ id, label, help, value, error, onChange }: DaysFieldProps) {
  return <div>
    <div className="calculator__label-row"><label htmlFor={id}>{label}</label><InfoTooltip id={`${id}-help`} label={label.toLowerCase()} title={label}>{help}</InfoTooltip></div>
    <div className={`calculator__input-wrap${error ? ' is-invalid' : ''}`}>
      <input id={id} type="number" min="0" step="any" inputMode="decimal" required value={value} aria-invalid={Boolean(error)} aria-describedby={`${id}-unit${error ? ` ${id}-error` : ''}`} onChange={(event) => onChange(event.target.value)} />
      <span id={`${id}-unit`}>días</span>
    </div>
    {error && <p className="calculator__error calculator__validation-slot" id={`${id}-error`} role="alert">{error}</p>}
  </div>
}

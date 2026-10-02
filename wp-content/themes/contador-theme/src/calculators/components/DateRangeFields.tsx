import type { MouseEvent } from 'react'
import { InfoTooltip } from './InfoTooltip'

interface DateRangeFieldsProps {
  id: string
  help: string
  legend?: string
  startLabel?: string
  endLabel?: string
  startDate: string
  endDate: string
  errors: { startDate?: string; endDate?: string }
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
}

function openDatePicker(event: MouseEvent<HTMLInputElement>) {
  if (event.detail === 0 || typeof event.currentTarget.showPicker !== 'function') return
  try { event.currentTarget.showPicker() } catch { /* Native input remains usable. */ }
}

export function DateRangeFields({ id, help, legend = 'Período trabajado', startLabel = 'Fecha de inicio', endLabel = 'Fecha final', startDate, endDate, errors, onStartChange, onEndChange }: DateRangeFieldsProps) {
  return <fieldset className="labor-fieldset">
    <legend><span className="calculator__label-row">{legend} <InfoTooltip id={`${id}-help-period`} label={legend.toLowerCase()} title="Tiempo efectivo de trabajo">{help}</InfoTooltip></span></legend>
    <div className="labor-fields-grid">
      <div>
        <label htmlFor={`${id}-start`}>{startLabel}</label>
        <input className="labor-control" id={`${id}-start`} type="date" required value={startDate} max={endDate || undefined} onClick={openDatePicker} aria-invalid={Boolean(errors.startDate)} aria-describedby={errors.startDate ? `${id}-start-error` : undefined} onChange={(event) => onStartChange(event.target.value)} />
        {errors.startDate && <p className="calculator__error" id={`${id}-start-error`} role="alert">{errors.startDate}</p>}
      </div>
      <div>
        <label htmlFor={`${id}-end`}>{endLabel}</label>
        <input className="labor-control" id={`${id}-end`} type="date" required value={endDate} min={startDate || undefined} onClick={openDatePicker} aria-invalid={Boolean(errors.endDate)} aria-describedby={errors.endDate ? `${id}-end-error` : undefined} onChange={(event) => onEndChange(event.target.value)} />
        {errors.endDate && <p className="calculator__error" id={`${id}-end-error`} role="alert">{errors.endDate}</p>}
      </div>
    </div>
  </fieldset>
}

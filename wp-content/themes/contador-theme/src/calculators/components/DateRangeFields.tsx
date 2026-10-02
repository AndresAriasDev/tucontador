import { DateField } from './DateField'
import { InfoTooltip } from './InfoTooltip'

interface DateRangeFieldsProps {
  id: string
  help: string
  legend?: string
  showLegend?: boolean
  startLabel?: string
  endLabel?: string
  startDate: string
  endDate: string
  errors: { startDate?: string; endDate?: string }
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
}


export function DateRangeFields({ id, help, legend = 'Período trabajado', showLegend = true, startLabel = 'Fecha de inicio', endLabel = 'Fecha final', startDate, endDate, errors, onStartChange, onEndChange }: DateRangeFieldsProps) {
  return <fieldset className="labor-fieldset">
    {showLegend && <legend><span className="calculator__label-row">{legend} <InfoTooltip id={`${id}-help-period`} label={legend.toLowerCase()} title="Tiempo efectivo de trabajo">{help}</InfoTooltip></span></legend>}
    <div className="labor-fields-grid">
      <DateField id={`${id}-start`} label={startLabel} required value={startDate} max={endDate || undefined} error={errors.startDate} onChange={onStartChange} />
      <DateField id={`${id}-end`} label={endLabel} required value={endDate} min={startDate || undefined} error={errors.endDate} onChange={onEndChange} />
    </div>
  </fieldset>
}

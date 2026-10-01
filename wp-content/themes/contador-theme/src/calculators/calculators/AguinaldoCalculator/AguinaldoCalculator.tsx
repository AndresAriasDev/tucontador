import { useState, type FormEvent, type MouseEvent } from 'react'
import { InfoTooltip } from '../../components/InfoTooltip'
import { MoneyField, type MoneyValue } from '../../components/MoneyField'
import { CalculatorDetails } from '../../components/CalculatorDetails'
import { ResultGroup } from '../../components/ResultGroup'
import { ResultRow } from '../../components/ResultRow'
import { formatCordobas } from '../../utils/currency'
import { calculateAguinaldo, formatWorkDate, validateWorkPeriod, type AguinaldoResult } from './calculateAguinaldo'

const help = {
  salary: 'Ingresa el último salario mensual ordinario recibido. Esta calculadora está diseñada para trabajadores con salario mensual fijo.',
  period: 'El período permite estimar un aguinaldo completo o proporcional. También cuentan como tiempo efectivo las vacaciones disfrutadas, ausencias justificadas, permisos, asuetos y subsidios por enfermedad previstos en la ley.',
}
const emptyMoney = (): MoneyValue => ({ raw: '', valid: true })

function openDatePicker(event: MouseEvent<HTMLInputElement>) {
  // Pointer interaction only: keyboard editing and native fallback stay available.
  if (event.detail === 0 || typeof event.currentTarget.showPicker !== 'function') return
  try {
    event.currentTarget.showPicker()
  } catch {
    // Unsupported contexts (for example embedded cross-origin pages) keep native behavior.
  }
}

function salaryError(value: MoneyValue): string | undefined {
  if (!value.valid || !Number.isFinite(Number(value.raw))) return 'Ingresa un monto válido.'
  if (value.raw === '') return 'Ingresa un salario.'
  if (Number(value.raw) <= 0) return 'El salario debe ser mayor que C$0.'
}

export function AguinaldoCalculator() {
  const [salary, setSalary] = useState<MoneyValue>(emptyMoney)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [result, setResult] = useState<AguinaldoResult | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  function invalidate() {
    setResult(null)
    setDetailsOpen(false)
    setErrors({})
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: Record<string, string | undefined> = validateWorkPeriod(startDate, endDate)
    nextErrors.salary = salaryError(salary)
    setErrors(nextErrors)
    setDetailsOpen(false)
    if (Object.values(nextErrors).some(Boolean)) {
      setResult(null)
      return
    }
    setResult(calculateAguinaldo({ monthlySalary: Number(salary.raw), startDate, endDate }))
  }

  return (
    <section className="calculator aguinaldo-calculator" aria-labelledby="aguinaldo-title">
      <div className="calculator__form-panel">
        <div className="calculator__form-heading">
          <div className="calculator__form-heading-copy">
            <h2 id="aguinaldo-title">Calculadora de Aguinaldo</h2>
            <p className="calculator__intro">Calcula una estimación de tu aguinaldo según tu salario y el período trabajado.</p>
          </div>
          <InfoTooltip id="aguinaldo-help-about" label="la calculadora de aguinaldo" title="Sobre esta calculadora">
            Esta herramienta estima el aguinaldo para trabajadores con salario mensual fijo. El resultado no sustituye una revisión laboral o contable individual.
          </InfoTooltip>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="aguinaldo-fields">
              <MoneyField id="aguinaldo-salary" label="Último salario mensual" help={help.salary} error={errors.salary} onChange={(value) => {
                invalidate(); setSalary(value)
                if (!value.valid) setErrors({ salary: 'Ingresa un monto válido.' })
              }} />
            <fieldset className="aguinaldo-fieldset">
              <legend><span className="calculator__label-row">Período trabajado <InfoTooltip id="aguinaldo-help-period" label="período trabajado" title="Tiempo efectivo de trabajo">{help.period}</InfoTooltip></span></legend>
              <div className="aguinaldo-fields-grid">
                <div>
                  <label htmlFor="aguinaldo-start">Fecha de inicio</label>
                  <input className="aguinaldo-control" id="aguinaldo-start" type="date" required value={startDate} max={endDate || undefined} onClick={openDatePicker} aria-invalid={Boolean(errors.startDate)} aria-describedby={errors.startDate ? 'aguinaldo-start-error' : undefined} onChange={(event) => { invalidate(); setStartDate(event.target.value) }} />
                  {errors.startDate && <p className="calculator__error" id="aguinaldo-start-error" role="alert">{errors.startDate}</p>}
                </div>
                <div>
                  <label htmlFor="aguinaldo-end">Fecha final</label>
                  <input className="aguinaldo-control" id="aguinaldo-end" type="date" required value={endDate} min={startDate || undefined} onClick={openDatePicker} aria-invalid={Boolean(errors.endDate)} aria-describedby={errors.endDate ? 'aguinaldo-end-error' : undefined} onChange={(event) => { invalidate(); setEndDate(event.target.value) }} />
                  {errors.endDate && <p className="calculator__error" id="aguinaldo-end-error" role="alert">{errors.endDate}</p>}
                </div>
              </div>
            </fieldset>
          </div>
          <button className="btn btn-primary calculator__submit" type="submit">Calcular aguinaldo</button>
        </form>
      </div>
      <div className="calculator__result-panel" aria-live="polite" aria-atomic="true">
        {result ? <>
          <p className="calculator__eyebrow">Resumen</p>
          <dl className="calculator__summary">
            <ResultRow label="Salario utilizado" value={formatCordobas(result.salaryBase)} help={{ id: 'aguinaldo-help-base', title: 'Salario utilizado', description: help.salary }} />
            <ResultRow label="Período computado" value={result.periodDescription} />
          </dl>
          {result.status === 'calculated' ? <div className="calculator__net-highlight"><span>Aguinaldo estimado</span><strong>{formatCordobas(result.amount)}</strong></div> : (
            <div className="calculator-notice aguinaldo-pending" role="status">
              <h3>Período de hasta un mes</h3>
              <p>El período computado no supera un mes, el umbral descrito en el artículo 93 para el aguinaldo proporcional. No se presenta un importe estimado para este caso.</p>
            </div>
          )}
        </> : <div className="calculator__empty">
          <span className="calculator__empty-icon aguinaldo-empty-icon" aria-hidden="true" />
          <h3>Aquí verás tu aguinaldo</h3>
          <p>Ingresa tu información laboral y te mostraremos una estimación de tu aguinaldo.</p>
        </div>}
      </div>
      {result?.status === 'calculated' && (
        <CalculatorDetails id="aguinaldo-details" description="Consulta el desglose utilizado para obtener esta estimación de aguinaldo." open={detailsOpen} onToggle={() => setDetailsOpen((open) => !open)}>
          <ResultGroup title="Ingreso">

            <ResultRow label="Último salario mensual" value={formatCordobas(result.salaryBase)} />
            <ResultRow label="Salario utilizado" value={formatCordobas(result.salaryBase)} />
          </ResultGroup>
          <ResultGroup title="Período">
            <ResultRow label="Fecha inicial" value={formatWorkDate(result.startDate)} />
            <ResultRow label="Fecha final" value={formatWorkDate(result.endDate)} />
            <ResultRow label="Tiempo computado" value={result.periodDescription} help={{ id: 'aguinaldo-help-time', title: 'Tiempo computado', description: 'Para esta estimación, cada mes completo representa 1/12 del aguinaldo. Los días adicionales se calculan sobre una base convencional de 30 días por mes.' }} />
          </ResultGroup>
          <ResultGroup title="Cálculo del aguinaldo">
            <ResultRow label="Salario base" value={formatCordobas(result.salaryBase)} />
            <ResultRow label="Proporción por meses" value={`${result.months} / 12`} />
            <ResultRow label="Importe por meses" value={formatCordobas(result.amountForMonths)} />
            {result.days > 0 && <>
              <ResultRow label="Proporción por días" value={`${result.days} / 360`} help={{ id: 'aguinaldo-help-days', title: 'Proporción por días', description: 'Cada día adicional representa 1/360 del salario mensual utilizado para esta estimación.' }} />
              <ResultRow label="Importe por días" value={formatCordobas(result.amountForDays)} />
            </>}
            <ResultRow label="Aguinaldo estimado" value={formatCordobas(result.amount)} highlightValue variant="total" help={{ id: 'aguinaldo-help-amount', title: 'Aguinaldo estimado', description: 'Esta estimación no aplica deducciones de IR ni INSS. El artículo 97 contempla protección especial, con la excepción relativa a obligaciones alimentarias.' }} />
          </ResultGroup>
        </CalculatorDetails>
      )}
    </section>
  )
}

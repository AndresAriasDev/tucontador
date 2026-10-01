import { useState, type FormEvent } from 'react'
import { MoneyField, type MoneyValue } from '../../components/MoneyField'
import { DateRangeFields } from '../../components/DateRangeFields'
import { InfoTooltip } from '../../components/InfoTooltip'
import { CalculatorDetails } from '../../components/CalculatorDetails'
import { ResultGroup } from '../../components/ResultGroup'
import { ResultRow } from '../../components/ResultRow'
import { formatCordobas } from '../../utils/currency'
import { formatVacationDays } from '../../utils/vacationDays'
import { formatWorkPeriod } from '../../utils/workPeriod'
import { calculateVacation, validateVacationInput, type VacationErrors, type VacationResult } from './calculateVacation'

const grossHelp = 'Este valor representa una estimación bruta de los días de vacaciones pendientes antes de retenciones o deducciones que pudieran corresponder.'
const displayDate = (value: string) => value.split('-').reverse().join('/')

export function VacationCalculator() {
  const [salary, setSalary] = useState<MoneyValue>({ raw: '', valid: true })
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [taken, setTaken] = useState('0')
  const [errors, setErrors] = useState<VacationErrors>({})
  const [result, setResult] = useState<VacationResult | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  function invalidate() { setResult(null); setDetailsOpen(false); setErrors({}) }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = { monthlySalary: salary.valid && salary.raw !== '' ? Number(salary.raw) : NaN, startDate, endDate, vacationDaysTaken: taken.trim() === '' ? NaN : Number(taken) }
    const nextErrors = validateVacationInput(input)
    setErrors(nextErrors)
    setDetailsOpen(false)
    setResult(null)
    if (Object.keys(nextErrors).length) return
    try { setResult(calculateVacation(input)) } catch (error) {
      setErrors({ monthlySalary: error instanceof RangeError ? error.message : 'Revisa los datos ingresados.' })
    }
  }
  return <section className="calculator labor-calculator" aria-labelledby="vacation-title">
    <div className="calculator__form-panel">
      <div className="calculator__form-heading">
        <div className="calculator__form-heading-copy">
          <h2 id="vacation-title">Calculadora de Vacaciones</h2>
          <p className="calculator__intro">Calcula una estimación de tus días de vacaciones acumulados y el valor de los días pendientes.</p>
        </div>
        <InfoTooltip id="vacation-about" label="la calculadora de vacaciones" title="Sobre esta calculadora">Esta herramienta estima vacaciones para trabajadores con salario mensual fijo a partir del período trabajado y los días de vacaciones ya disfrutados.</InfoTooltip>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="labor-fields">
          <MoneyField id="vacation-salary" label="Salario mensual" help="Ingresa tu último salario mensual ordinario. Esta calculadora está diseñada para trabajadores con salario mensual fijo." error={errors.monthlySalary} onChange={(value) => {
            invalidate(); setSalary(value)
            if (!value.valid) setErrors({ monthlySalary: 'Ingresa un monto válido.' })
          }} />
          <DateRangeFields id="vacation" startDate={startDate} endDate={endDate} errors={errors}
            help="Indica el período que deseas calcular. Determinadas interrupciones justificadas no interrumpen la acumulación del tiempo trabajado conforme al Código del Trabajo."
            onStartChange={(value) => { invalidate(); setStartDate(value) }} onEndChange={(value) => { invalidate(); setEndDate(value) }} />
          <div>
            <div className="calculator__label-row">
              <label htmlFor="vacation-taken">Vacaciones ya disfrutadas</label>
              <InfoTooltip id="vacation-taken-help" label="vacaciones disfrutadas" title="Vacaciones disfrutadas">Ingresa los días de vacaciones que ya disfrutaste dentro del período indicado. Se restarán de los días acumulados para estimar tu saldo pendiente.</InfoTooltip>
            </div>
            <div className={`calculator__input-wrap${errors.vacationDaysTaken ? ' is-invalid' : ''}`}>
              <input id="vacation-taken" type="number" min="0" step="any" inputMode="decimal" required value={taken} aria-invalid={Boolean(errors.vacationDaysTaken)} aria-describedby={errors.vacationDaysTaken ? 'vacation-taken-unit vacation-taken-error' : 'vacation-taken-unit'} onChange={(event) => { invalidate(); setTaken(event.target.value) }} />
              <span id="vacation-taken-unit">días</span>
            </div>
            {errors.vacationDaysTaken && <p className="calculator__error calculator__validation-slot" id="vacation-taken-error" role="alert">{errors.vacationDaysTaken}</p>}
          </div>
        </div>
        <button type="submit" className="btn btn-primary calculator__submit">Calcular vacaciones</button>
      </form>
    </div>
    <div className="calculator__result-panel" aria-live="polite" aria-atomic="true">
      {result ? <>
        <p className="calculator__eyebrow">Resumen</p>
        <dl className="calculator__summary">
          <ResultRow label="Tiempo computado" value={formatWorkPeriod(result)} />
          <ResultRow label="Vacaciones acumuladas" value={formatVacationDays(result.accruedVacationDays)} />
          <ResultRow label="Vacaciones disfrutadas" value={formatVacationDays(result.vacationDaysTaken)} />
        </dl>
        <div className="calculator__net-highlight"><span>Vacaciones pendientes</span><strong>{formatVacationDays(result.pendingVacationDays)}</strong></div>
        <dl className="calculator__summary"><ResultRow label="Valor bruto estimado" value={formatCordobas(result.estimatedGrossValue)} variant="total" help={{ id: 'vacation-gross', title: 'Valor bruto estimado', description: grossHelp }} /></dl>
      </> : <div className="calculator__empty">
        <span className="calculator__empty-icon labor-empty-icon" aria-hidden="true" />
        <h3>Aquí verás tus vacaciones</h3>
        <p>Ingresa tu salario, período trabajado y los días de vacaciones que ya disfrutaste para obtener una estimación.</p>
      </div>}
    </div>
    {result && <CalculatorDetails id="vacation-details" description="Consulta el desglose utilizado para obtener esta estimación de vacaciones." open={detailsOpen} onToggle={() => setDetailsOpen((open) => !open)}>
      <ResultGroup title="Ingreso">
        <ResultRow label="Salario mensual" value={formatCordobas(result.monthlySalary)} />
        <ResultRow label="Salario diario" value={formatCordobas(result.dailySalary)} />
      </ResultGroup>
      <ResultGroup title="Período">
        <ResultRow label="Fecha inicial" value={displayDate(result.startDate)} />
        <ResultRow label="Fecha final" value={displayDate(result.endDate)} />
        <ResultRow label="Tiempo computado" value={formatWorkPeriod(result)} />
      </ResultGroup>
      <ResultGroup title="Acumulación de vacaciones">
        <ResultRow label="Por meses" value={`${result.months} × 2.5 días`} />
        <ResultRow label="Días generados por meses" value={formatVacationDays(result.vacationDaysFromMonths)} />
        {result.days > 0 && <>
          <ResultRow label="Por días adicionales" value={`${result.days} × 1/12`} />
          <ResultRow label="Días generados adicionales" value={formatVacationDays(result.vacationDaysFromExtraDays)} />
        </>}
        <ResultRow label="Vacaciones acumuladas" value={formatVacationDays(result.accruedVacationDays)} />
      </ResultGroup>
      <ResultGroup title="Saldo de vacaciones">
        <ResultRow label="Vacaciones acumuladas" value={formatVacationDays(result.accruedVacationDays)} />
        <ResultRow label="Vacaciones disfrutadas" value={formatVacationDays(result.vacationDaysTaken)} />
        <ResultRow label="Vacaciones pendientes" value={formatVacationDays(result.pendingVacationDays)} highlightValue variant="total" />
        <ResultRow label="Valor bruto estimado" value={formatCordobas(result.estimatedGrossValue)} help={{ id: 'vacation-gross-detail', title: 'Valor bruto estimado', description: grossHelp }} />
      </ResultGroup>
    </CalculatorDetails>}
  </section>
}

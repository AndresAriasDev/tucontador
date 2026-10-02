import { useState, type FormEvent } from 'react'
import { MoneyField, type MoneyValue } from '../../components/MoneyField'
import { DateRangeFields } from '../../components/DateRangeFields'
import { DaysField } from '../../components/DaysField'
import { InfoTooltip } from '../../components/InfoTooltip'
import { CalculatorDetails } from '../../components/CalculatorDetails'
import { ResultGroup } from '../../components/ResultGroup'
import { ResultRow } from '../../components/ResultRow'
import { formatCordobas } from '../../utils/currency'
import { formatVacationDays } from '../../utils/vacationDays'
import { formatWorkPeriod } from '../../utils/workPeriod'
import { calculateSettlement, validateSettlementInput, type SettlementErrors, type SettlementResult, type ContractType, type TerminationReason } from './calculateSettlement'

const contracts = { indefinite: 'Tiempo indeterminado', fixedTerm: 'Tiempo determinado' }
const reasons = { resignation: 'Renuncia', dismissalWithoutJustCause: 'Despido sin causa justificada', authorizedJustCause: 'Despido autorizado por causa justa', other: 'Otro caso' }
const statuses = { missingNotice: 'No incluida por falta de preaviso declarado', notIncluded: 'No incluida para este supuesto', requiresReview: 'Requiere revisión individual', notApplicableToContractType: 'No calculada para este tipo de contrato' }
const displayDate = (value: string) => value.split('-').reverse().join('/')
const tenure = ({ seniority: s }: SettlementResult) => `${s.years} ${s.years === 1 ? 'año' : 'años'}, ${s.months} ${s.months === 1 ? 'mes' : 'meses'} y ${s.days} ${s.days === 1 ? 'día' : 'días'}`
const indemnityValue = (r: SettlementResult) => r.indemnity.status === 'calculated' ? formatCordobas(r.indemnity.amount) : statuses[r.indemnity.status]
const aguinaldoValue = (r: SettlementResult) => r.aguinaldo.status === 'calculated' ? formatCordobas(r.aguinaldo.amount) : 'Período de hasta un mes: requiere revisión'
const totalLabel = (r: SettlementResult) => `Liquidación bruta estimada${!r.includesIndemnity || !r.includesAguinaldo ? ' (parcial)' : ''}`

function Breakdown({ result: r }: { result: SettlementResult }) {
  return <>
    <ResultRow label="Salario pendiente" value={formatCordobas(r.pendingSalary.amount)} />
    <ResultRow label="Vacaciones pendientes" value={`${formatVacationDays(r.vacation.pendingVacationDays)} · ${formatCordobas(r.vacation.estimatedGrossValue)}`} />
    <ResultRow label="Aguinaldo proporcional" value={aguinaldoValue(r)} />
    <ResultRow label="Indemnización por antigüedad" value={indemnityValue(r)} />
  </>
}

export function SettlementCalculator() {
  const [salary, setSalary] = useState<MoneyValue>({ raw: '', valid: true })
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [contract, setContract] = useState<ContractType>('indefinite')
  const [reason, setReason] = useState<TerminationReason>('resignation')
  const [noticeGiven, setNoticeGiven] = useState<boolean | null>(null)
  const noticeApplies = contract === 'indefinite' && reason === 'resignation'
  const [taken, setTaken] = useState('0')
  const [unpaid, setUnpaid] = useState('0')
  const [errors, setErrors] = useState<SettlementErrors>({})
  const [result, setResult] = useState<SettlementResult | null>(null)
  const [open, setOpen] = useState(false)
  function invalidate() { setResult(null); setOpen(false); setErrors({}) }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = { monthlySalary: salary.valid && salary.raw !== '' ? Number(salary.raw) : NaN, employmentStartDate: start, terminationDate: end, contractType: contract, terminationReason: reason, noticeGiven, vacationDaysTaken: taken.trim() ? Number(taken) : NaN, unpaidWorkDays: unpaid.trim() ? Number(unpaid) : NaN }
    invalidate()
    const nextErrors = validateSettlementInput(input)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try { setResult(calculateSettlement(input)) } catch (error) {
      setErrors({ monthlySalary: error instanceof RangeError ? error.message : 'Revisa los datos ingresados.' })
    }
  }
  return <section className="calculator labor-calculator" aria-labelledby="settlement-title">
    <div className="calculator__form-panel">
      <div className="calculator__form-heading">
        <div className="calculator__form-heading-copy"><h2 id="settlement-title">Calculadora de Liquidación Laboral</h2><p className="calculator__intro">Estima las prestaciones pendientes al finalizar una relación laboral con salario mensual fijo.</p></div>
        <InfoTooltip id="settlement-about" label="la calculadora de liquidación" title="Sobre esta calculadora">Estimación informativa para Nicaragua, antes de retenciones y deducciones. No sustituye una revisión individual ni determina una liquidación legal definitiva.</InfoTooltip>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="labor-fields">
          <MoneyField id="settlement-salary" label="Último salario mensual" help="Ingresa tu último salario mensual ordinario. Esta herramienta admite únicamente salario mensual fijo." error={errors.monthlySalary} onChange={(value) => { invalidate(); setSalary(value); if (!value.valid) setErrors({ monthlySalary: 'Ingresa un monto válido.' }) }} />
          <DateRangeFields id="settlement" legend="Relación laboral" startLabel="Fecha de inicio laboral" endLabel="Fecha de terminación" startDate={start} endDate={end} errors={{ startDate: errors.employmentStartDate, endDate: errors.terminationDate }} help="Indica el período laboral completo. Las fechas se calculan como fechas civiles, incluyendo el día final." onStartChange={(value) => { invalidate(); setStart(value) }} onEndChange={(value) => { invalidate(); setEnd(value) }} />
          <div>
            <div className="calculator__label-row"><label htmlFor="settlement-contract">Tipo de contrato</label><InfoTooltip id="settlement-contract-help" label="tipo de contrato" title="Tipo de contrato">La indemnización del artículo 45 no se calcula automáticamente para contratos por tiempo determinado.</InfoTooltip></div>
            <select className="labor-control" id="settlement-contract" value={contract} aria-invalid={Boolean(errors.contractType)} aria-describedby={errors.contractType ? 'settlement-contract-error' : undefined} onChange={(event) => { invalidate(); setNoticeGiven(null); setContract(event.target.value as ContractType) }}>{Object.entries(contracts).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            {errors.contractType && <p id="settlement-contract-error" className="calculator__error" role="alert">{errors.contractType}</p>}
          </div>
          <div>
            <div className="calculator__label-row"><label htmlFor="settlement-reason">Motivo de terminación</label><InfoTooltip id="settlement-reason-help" label="motivo de terminación" title="Motivo de terminación">El motivo de terminación puede afectar si la indemnización por antigüedad puede incluirse automáticamente en la estimación.</InfoTooltip></div>
            <select className="labor-control" id="settlement-reason" value={reason} aria-invalid={Boolean(errors.terminationReason)} aria-describedby={errors.terminationReason ? 'settlement-reason-error' : undefined} onChange={(event) => { invalidate(); setNoticeGiven(null); setReason(event.target.value as TerminationReason) }}>{Object.entries(reasons).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            {errors.terminationReason && <p id="settlement-reason-error" className="calculator__error" role="alert">{errors.terminationReason}</p>}
          </div>
          {noticeApplies && <div>
            <div className="calculator__label-row"><label htmlFor="settlement-notice">¿Realizaste tu renuncia por escrito con al menos 15 días de anticipación?</label><InfoTooltip id="settlement-notice-help" label="preaviso" title="Preaviso de renuncia">Para contratos por tiempo indeterminado, el artículo 44 del Código del Trabajo establece el aviso por escrito al empleador con quince días de anticipación.</InfoTooltip></div>
            <select className="labor-control" id="settlement-notice" required value={noticeGiven === null ? '' : String(noticeGiven)} aria-invalid={Boolean(errors.noticeGiven)} aria-describedby={errors.noticeGiven ? 'settlement-notice-error' : undefined} onChange={(event) => { invalidate(); setNoticeGiven(event.target.value === '' ? null : event.target.value === 'true') }}>
              <option value="">Selecciona una opción</option><option value="true">Sí</option><option value="false">No</option>
            </select>
            {errors.noticeGiven && <p id="settlement-notice-error" className="calculator__error" role="alert">{errors.noticeGiven}</p>}
          </div>}
          <fieldset className="labor-fieldset"><legend>Prestaciones pendientes</legend><div className="labor-fields">
            <DaysField id="settlement-taken" label="Vacaciones ya disfrutadas" help="Ingresa los días de vacaciones que ya disfrutaste durante el período laboral indicado. Se restarán de los días acumulados para estimar tu saldo pendiente." value={taken} error={errors.vacationDaysTaken} onChange={(value) => { invalidate(); setTaken(value) }} />
            <DaysField id="settlement-unpaid" label="Días trabajados pendientes de pago" help="Indica únicamente los días trabajados que todavía no te han pagado. No se deducen automáticamente de la fecha de terminación." value={unpaid} error={errors.unpaidWorkDays} onChange={(value) => { invalidate(); setUnpaid(value) }} />
          </div></fieldset>
        </div>
        <button className="btn btn-primary calculator__submit" type="submit">Calcular liquidación</button>
      </form>
    </div>
    <div className="calculator__result-panel" aria-live="polite" aria-atomic="true">
      {result ? <>
        <p className="calculator__eyebrow">Resumen</p>
        <dl className="calculator__summary"><Breakdown result={result} /></dl>
        <div className="calculator__net-highlight"><span>{totalLabel(result)}</span><strong>{formatCordobas(result.grossSettlement)}</strong></div>
        <p className="calculator-notice">Estimación bruta de los conceptos calculados, sin aplicar IR, INSS ni otros descuentos.</p>
        {!result.includesIndemnity && <p className="calculator-notice">{result.indemnity.status === 'missingNotice' ? 'El total no incluye indemnización por antigüedad debido al preaviso declarado.' : `El total no incluye una eventual indemnización. ${indemnityValue(result)}. Esto no equivale a una indemnización de C$0.`}</p>}
        {!result.includesAguinaldo && <p className="calculator-notice">El motor de aguinaldo no calcula períodos de hasta un mes. Ese concepto requiere revisión y no está incluido en este total parcial.</p>}
      </> : <div className="calculator__empty"><span className="calculator__empty-icon labor-empty-icon" aria-hidden="true" /><h3>Aquí verás tu liquidación estimada</h3><p>Completa los datos de tu relación laboral para consultar las prestaciones calculadas y los conceptos que requieren revisión.</p></div>}
    </div>
    {result && <CalculatorDetails id="settlement-details" description="Consulta las bases y los conceptos incluidos en la estimación." open={open} onToggle={() => setOpen((value) => !value)}>
      <ResultGroup title="Salario">
        <ResultRow label="Último salario mensual" value={formatCordobas(result.monthlySalary)} />
        <ResultRow label="Salario diario" value={formatCordobas(result.dailySalary)} />
        <ResultRow label="Días pendientes de pago" value={formatVacationDays(result.unpaidWorkDays)} />
        <ResultRow label="Salario pendiente" value={formatCordobas(result.pendingSalary.amount)} />
      </ResultGroup>
      <ResultGroup title="Antigüedad">
        <ResultRow label="Fecha de inicio laboral" value={displayDate(result.employmentStartDate)} />
        <ResultRow label="Fecha de terminación" value={displayDate(result.terminationDate)} />
        <ResultRow label="Tiempo trabajado" value={tenure(result)} />
        <ResultRow label="Tipo de contrato" value={contracts[result.contractType]} />
        <ResultRow label="Motivo de terminación" value={reasons[result.terminationReason]} />
      </ResultGroup>
      <ResultGroup title="Vacaciones">
        <ResultRow label="Vacaciones acumuladas" value={formatVacationDays(result.vacation.accruedVacationDays)} />
        <ResultRow label="Vacaciones disfrutadas" value={formatVacationDays(result.vacation.vacationDaysTaken)} />
        <ResultRow label="Vacaciones pendientes" value={formatVacationDays(result.vacation.pendingVacationDays)} />
        <ResultRow label="Valor bruto estimado" value={formatCordobas(result.vacation.estimatedGrossValue)} />
      </ResultGroup>
      <ResultGroup title="Aguinaldo">
        <ResultRow label="Inicio del período" value={displayDate(result.aguinaldo.startDate)} />
        <ResultRow label="Fecha final" value={displayDate(result.aguinaldo.endDate)} />
        <ResultRow label="Tiempo computado" value={formatWorkPeriod(result.aguinaldo)} />
        <ResultRow label="Aguinaldo proporcional" value={aguinaldoValue(result)} />
      </ResultGroup>
      <ResultGroup title="Indemnización por antigüedad">
        <ResultRow label="Antigüedad computada" value={tenure(result)} />
        {result.contractType === 'indefinite' && result.terminationReason === 'resignation' && <ResultRow label="Preaviso declarado" value={result.noticeGiven ? 'Sí' : 'No'} />}
        {result.indemnity.status === 'calculated' ? <>
          <ResultRow label="Días indemnizables" value={`${new Intl.NumberFormat('es-NI', { maximumFractionDigits: 4 }).format(result.indemnity.indemnityDays)} días`} />
          <ResultRow label="Salario diario" value={formatCordobas(result.dailySalary)} />
          <ResultRow label="Indemnización estimada" value={formatCordobas(result.indemnity.amount)} />
        </> : <><ResultRow label="Estado" value={indemnityValue(result)} /><ResultRow label="Alcance" value="No se asigna un monto ni se incluye una eventual indemnización en el total." /></>}
      </ResultGroup>
      <ResultGroup title="Resultado"><Breakdown result={result} /><ResultRow label={totalLabel(result)} value={formatCordobas(result.grossSettlement)} variant="total" highlightValue /></ResultGroup>
    </CalculatorDetails>}
  </section>
}

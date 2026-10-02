import { calculateVacation, validateVacationInput } from '../VacationCalculator/calculateVacation'
import { calculateAguinaldo } from '../AguinaldoCalculator/calculateAguinaldo'
import { computeCalendarWorkPeriod, parseCivilDate, type WorkPeriod } from '../../utils/workPeriod'

export type ContractType = 'indefinite' | 'fixedTerm'
export type TerminationReason = 'resignation' | 'dismissalWithoutJustCause' | 'authorizedJustCause' | 'other'
export interface SettlementInput {
  monthlySalary: number
  employmentStartDate: string
  terminationDate: string
  contractType: ContractType
  terminationReason: TerminationReason
  noticeGiven: boolean | null
  vacationDaysTaken: number
  unpaidWorkDays: number
}
export type SettlementErrors = Partial<Record<keyof SettlementInput, string>>
export type Indemnity =
  | { status: 'calculated'; indemnityDays: number; amount: number }
  | { status: 'notIncluded' | 'requiresReview' | 'notApplicableToContractType' | 'missingNotice'; indemnityDays: null; amount: null }

export function calculateSeniorityIndemnity(monthlySalary: number, period: WorkPeriod) {
  if (!Number.isFinite(monthlySalary) || monthlySalary <= 0 || !Number.isInteger(period.months) || period.months < 0 || !Number.isInteger(period.days) || period.days < 0 || period.days >= 30) throw new RangeError('Datos de antigüedad inválidos.')
  const years = period.months / 12 + period.days / 360
  const indemnityDays = Math.min(150, Math.min(years, 3) * 30 + Math.max(0, years - 3) * 20)
  const amount = monthlySalary / 30 * indemnityDays
  if (!Number.isFinite(amount)) throw new RangeError('El importe excede la capacidad numérica de la herramienta.')
  return { indemnityDays, amount }
}

export function calculatePendingSalary(monthlySalary: number, days: number) {
  if (!Number.isFinite(monthlySalary) || monthlySalary <= 0 || !Number.isFinite(days) || days < 0) throw new RangeError('Datos de salario pendiente inválidos.')
  const amount = monthlySalary / 30 * days
  if (!Number.isFinite(amount)) throw new RangeError('El importe excede la capacidad numérica de la herramienta.')
  return { days, amount }
}

function vacationInput(input: SettlementInput) {
  return { monthlySalary: input.monthlySalary, startDate: input.employmentStartDate, endDate: input.terminationDate, vacationDaysTaken: input.vacationDaysTaken }
}

export function validateSettlementInput(input: SettlementInput): SettlementErrors {
  const vacationErrors = validateVacationInput(vacationInput(input))
  const errors: SettlementErrors = {}
  if (input.contractType === 'indefinite' && input.terminationReason === 'resignation' && typeof input.noticeGiven !== 'boolean') errors.noticeGiven = 'Indica si realizaste el preaviso de 15 días.'
  if (vacationErrors.monthlySalary) errors.monthlySalary = vacationErrors.monthlySalary
  if (vacationErrors.startDate) errors.employmentStartDate = vacationErrors.startDate
  if (vacationErrors.endDate) errors.terminationDate = vacationErrors.endDate
  if (vacationErrors.vacationDaysTaken) errors.vacationDaysTaken = vacationErrors.vacationDaysTaken
  if (!['indefinite', 'fixedTerm'].includes(input.contractType)) errors.contractType = 'Selecciona un tipo de contrato válido.'
  if (!['resignation', 'dismissalWithoutJustCause', 'authorizedJustCause', 'other'].includes(input.terminationReason)) errors.terminationReason = 'Selecciona un motivo válido.'
  if (!Number.isFinite(input.unpaidWorkDays) || input.unpaidWorkDays < 0) errors.unpaidWorkDays = 'Ingresa días pendientes válidos, iguales o mayores que cero.'
  return errors
}

export function calculateSettlement(input: SettlementInput) {
  const errors = validateSettlementInput(input)
  if (Object.keys(errors).length) throw new RangeError(Object.values(errors)[0])
  const period = computeCalendarWorkPeriod(input.employmentStartDate, input.terminationDate)
  const seniority = { years: Math.floor(period.months / 12), months: period.months % 12, days: period.days }
  const vacation = calculateVacation(vacationInput(input))
  const end = parseCivilDate(input.terminationDate)
  const cycleStart = `${String(end.month === 12 ? end.year : end.year - 1).padStart(4, '0')}-12-01`
  const aguinaldoStart = input.employmentStartDate > cycleStart ? input.employmentStartDate : cycleStart
  const aguinaldo = calculateAguinaldo({ monthlySalary: input.monthlySalary, startDate: aguinaldoStart, endDate: input.terminationDate })
  const pendingSalary = calculatePendingSalary(input.monthlySalary, input.unpaidWorkDays)
  let indemnity: Indemnity
  if (input.contractType === 'fixedTerm') indemnity = { status: 'notApplicableToContractType', amount: null, indemnityDays: null }
  else if (input.terminationReason === 'dismissalWithoutJustCause' || (input.terminationReason === 'resignation' && input.noticeGiven === true)) indemnity = { status: 'calculated', ...calculateSeniorityIndemnity(input.monthlySalary, period) }
  else if (input.terminationReason === 'resignation') indemnity = { status: 'missingNotice', amount: null, indemnityDays: null }
  else indemnity = { status: input.terminationReason === 'authorizedJustCause' ? 'notIncluded' : 'requiresReview', amount: null, indemnityDays: null }
  const grossSettlement = pendingSalary.amount + vacation.estimatedGrossValue + (aguinaldo.status === 'calculated' ? aguinaldo.amount : 0) + (indemnity.status === 'calculated' ? indemnity.amount : 0)
  if (!Number.isFinite(grossSettlement)) throw new RangeError('El total excede la capacidad numérica de la herramienta. Revisa los datos.')
  return { ...input, dailySalary: input.monthlySalary / 30, seniority, pendingSalary, vacation, aguinaldo, indemnity, grossSettlement, includesIndemnity: indemnity.status === 'calculated', includesAguinaldo: aguinaldo.status === 'calculated' }
}
export type SettlementResult = ReturnType<typeof calculateSettlement>

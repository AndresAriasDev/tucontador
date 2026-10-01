import { computeCalendarWorkPeriod, parseCivilDate, type WorkPeriod } from '../../utils/workPeriod'

export interface VacationInput {
  monthlySalary: number
  startDate: string
  endDate: string
  vacationDaysTaken: number
}
export type VacationErrors = Partial<Record<keyof VacationInput, string>>
const VACATION_DAYS_PER_MONTH = 15 / 6
const SALARY_DAYS_PER_MONTH = 30

export function calculateVacationAmounts(monthlySalary: number, period: WorkPeriod, vacationDaysTaken: number) {
  if (!Number.isFinite(monthlySalary) || monthlySalary <= 0) throw new RangeError('Ingresa un salario mensual válido mayor que cero.')
  if (!Number.isInteger(period.months) || period.months < 0 || !Number.isInteger(period.days) || period.days < 0 || period.days >= 30) throw new RangeError('Período inválido.')
  if (!Number.isFinite(vacationDaysTaken) || vacationDaysTaken < 0) throw new RangeError('Ingresa días disfrutados válidos, iguales o mayores que cero.')
  const vacationDaysFromMonths = period.months * VACATION_DAYS_PER_MONTH
  const vacationDaysFromExtraDays = period.days / 12
  const accruedVacationDays = vacationDaysFromMonths + vacationDaysFromExtraDays
  if (vacationDaysTaken > accruedVacationDays) throw new RangeError('Los días disfrutados no pueden superar los días acumulados para el período indicado.')
  const dailySalary = monthlySalary / SALARY_DAYS_PER_MONTH
  const pendingVacationDays = accruedVacationDays - vacationDaysTaken
  const estimatedGrossValue = pendingVacationDays * dailySalary
  if (!Number.isFinite(estimatedGrossValue)) throw new RangeError('El importe excede la capacidad numérica de la herramienta. Revisa los datos.')
  return { monthlySalary, dailySalary, ...period, vacationDaysFromMonths, vacationDaysFromExtraDays, accruedVacationDays, vacationDaysTaken, pendingVacationDays, estimatedGrossValue }
}

export function validateVacationInput(input: VacationInput): VacationErrors {
  const errors: VacationErrors = {}
  if (!Number.isFinite(input.monthlySalary) || input.monthlySalary <= 0) errors.monthlySalary = 'Ingresa un salario mensual válido mayor que cero.'
  for (const field of ['startDate', 'endDate'] as const) {
    try { parseCivilDate(input[field]) } catch { errors[field] = input[field] ? 'Ingresa una fecha válida.' : 'Ingresa la fecha.' }
  }
  if (!errors.startDate && !errors.endDate && input.endDate < input.startDate) errors.endDate = 'La fecha final no puede ser anterior a la inicial.'
  if (!Number.isFinite(input.vacationDaysTaken) || input.vacationDaysTaken < 0) errors.vacationDaysTaken = 'Ingresa días disfrutados válidos, iguales o mayores que cero.'
  if (!errors.startDate && !errors.endDate && !errors.vacationDaysTaken) {
    const period = computeCalendarWorkPeriod(input.startDate, input.endDate)
    const accrued = period.months * VACATION_DAYS_PER_MONTH + period.days / 12
    if (input.vacationDaysTaken > accrued) errors.vacationDaysTaken = 'Los días disfrutados no pueden superar los días acumulados para el período indicado.'
  }
  return errors
}

export function calculateVacation(input: VacationInput) {
  const errors = validateVacationInput(input)
  if (Object.keys(errors).length) throw new RangeError(Object.values(errors)[0])
  return { ...input, ...calculateVacationAmounts(input.monthlySalary, computeCalendarWorkPeriod(input.startDate, input.endDate), input.vacationDaysTaken) }
}
export type VacationResult = ReturnType<typeof calculateVacation>

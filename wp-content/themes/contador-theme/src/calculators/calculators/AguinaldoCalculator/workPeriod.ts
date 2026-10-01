import { computeCalendarWorkPeriod, parseCivilDate, MONTHS_PER_CYCLE, DAYS_PER_CONVENTIONAL_MONTH, type CivilDate, type WorkPeriod } from '../../utils/workPeriod'
export { parseCivilDate, formatWorkPeriod } from '../../utils/workPeriod'
const DAYS_PER_CONVENTIONAL_CYCLE = MONTHS_PER_CYCLE * DAYS_PER_CONVENTIONAL_MONTH

/** Start year of the ordinary December 1–November 30 accrual cycle. */
export function cycleYear(date: CivilDate): number {
  return date.month === 12 ? date.year : date.year - 1
}


export function computeWorkPeriod(startValue: string, endValue: string): WorkPeriod {
  const start = parseCivilDate(startValue)
  const end = parseCivilDate(endValue)
  if (cycleYear(start) !== cycleYear(end)) throw new RangeError('Selecciona fechas dentro de un único ciclo de aguinaldo.')
  return computeCalendarWorkPeriod(startValue, endValue)
}

export type { WorkPeriod } from '../../utils/workPeriod'
/** Project-approved monetary convention, not a quotation of the Labor Code. */
export function calculatePeriodAmounts(salaryBase: number, period: WorkPeriod) {
  if (!Number.isFinite(salaryBase) || salaryBase <= 0) throw new RangeError('Salario inválido.')
  if (!Number.isInteger(period.months) || !Number.isInteger(period.days) || period.months < 0 || period.days < 0 || period.days >= DAYS_PER_CONVENTIONAL_MONTH || period.months > MONTHS_PER_CYCLE || (period.months === MONTHS_PER_CYCLE && period.days !== 0)) {
    throw new RangeError('Período normalizado inválido.')
  }
  const monthFraction = period.months / MONTHS_PER_CYCLE
  const dayFraction = period.days / DAYS_PER_CONVENTIONAL_CYCLE
  const amountForMonths = salaryBase * monthFraction
  const amountForDays = salaryBase * dayFraction
  return { monthFraction, dayFraction, proportion: monthFraction + dayFraction, amountForMonths, amountForDays, amount: amountForMonths + amountForDays }
}

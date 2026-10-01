export interface CivilDate { year: number; month: number; day: number }
export interface WorkPeriod { months: number; days: number }

export const MONTHS_PER_CYCLE = 12
export const DAYS_PER_CONVENTIONAL_MONTH = 30
export const DAYS_PER_CONVENTIONAL_CYCLE = MONTHS_PER_CYCLE * DAYS_PER_CONVENTIONAL_MONTH

export function daysInMonth(year: number, month: number): number {
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
}

export function parseCivilDate(value: string): CivilDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError('Fecha inválida.')
  const [year, month, day] = value.split('-').map(Number)
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) throw new RangeError('Fecha inválida.')
  return { year, month, day }
}

/** Monotonic Gregorian civil-day number; never uses Date, UTC or local time. */
export function civilDayNumber(date: CivilDate): number {
  const previousYear = date.year - 1
  let days = previousYear * 365 + Math.floor(previousYear / 4) - Math.floor(previousYear / 100) + Math.floor(previousYear / 400)
  for (let month = 1; month < date.month; month += 1) days += daysInMonth(date.year, month)
  return days + date.day
}

/** Start year of the ordinary December 1–November 30 accrual cycle. */
export function cycleYear(date: CivilDate): number {
  return date.month === 12 ? date.year : date.year - 1
}

/**
 * Inclusive monthly closure, always anchored to the original start (no drift).
 * For a start on day d > 1, month n closes on d-1 in the target month,
 * clamped to that month's last day. A start on day 1 closes at the end of
 * the preceding month. Thus Jan 31–Feb 28 is one inclusive month.
 */
function monthlyClosure(start: CivilDate, months: number): CivilDate {
  const index = start.year * MONTHS_PER_CYCLE + start.month - 1 + months - (start.day === 1 ? 1 : 0)
  const year = Math.floor(index / MONTHS_PER_CYCLE)
  const month = index % MONTHS_PER_CYCLE + 1
  return { year, month, day: start.day === 1 ? daysInMonth(year, month) : Math.min(start.day - 1, daysInMonth(year, month)) }
}

export function computeWorkPeriod(startValue: string, endValue: string): WorkPeriod {
  const start = parseCivilDate(startValue)
  const end = parseCivilDate(endValue)
  const startNumber = civilDayNumber(start)
  const endNumber = civilDayNumber(end)
  if (endNumber < startNumber) throw new RangeError('La fecha final no puede ser anterior a la inicial.')
  if (cycleYear(start) !== cycleYear(end)) throw new RangeError('Selecciona fechas dentro de un único ciclo de aguinaldo.')
  let months = 0
  let closureNumber = startNumber - 1
  for (let candidate = 1; candidate <= MONTHS_PER_CYCLE; candidate += 1) {
    const candidateNumber = civilDayNumber(monthlyClosure(start, candidate))
    if (candidateNumber > endNumber) break
    months = candidate
    closureNumber = candidateNumber
  }
  const residualDays = endNumber - closureNumber
  // Canonical 30/360 representation: never report 0 months + 30 days.
  // Calendar days are used only for the remainder, never as an annual divisor.
  return {
    months: months + Math.floor(residualDays / DAYS_PER_CONVENTIONAL_MONTH),
    days: residualDays % DAYS_PER_CONVENTIONAL_MONTH,
  }
}

export function formatWorkPeriod({ months, days }: WorkPeriod): string {
  const parts: string[] = []
  if (months) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`)
  if (days || !months) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`)
  return parts.join(' y ')
}

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

import { calculatePeriodAmounts, computeWorkPeriod, cycleYear, formatWorkPeriod, parseCivilDate, type WorkPeriod } from './workPeriod'

export interface AguinaldoInput {
  monthlySalary: number
  startDate: string
  endDate: string
}

interface AguinaldoBasis extends WorkPeriod {
  salaryBase: number
  startDate: string
  endDate: string
  periodDescription: string
}

export type AguinaldoResult = AguinaldoBasis & (
  | { status: 'below-threshold'; proportion: null; amount: null }
  | ({ status: 'calculated' } & ReturnType<typeof calculatePeriodAmounts>)
)

/** Strict civil-date validation; no timezone or duration convention is applied. */
export function isValidWorkDate(value: string): boolean {
  try { parseCivilDate(value); return true } catch { return false }
}

export function validateWorkPeriod(startDate: string, endDate: string) {
  const errors: { startDate?: string; endDate?: string } = {}
  if (!isValidWorkDate(startDate)) errors.startDate = startDate ? 'Ingresa una fecha inicial válida.' : 'Ingresa la fecha de inicio.'
  if (!isValidWorkDate(endDate)) errors.endDate = endDate ? 'Ingresa una fecha final válida.' : 'Ingresa la fecha final.'
  if (!errors.startDate && !errors.endDate && endDate < startDate) errors.endDate = 'La fecha final no puede ser anterior a la inicial.'
  if (!errors.startDate && !errors.endDate && cycleYear(parseCivilDate(startDate)) !== cycleYear(parseCivilDate(endDate))) {
    errors.endDate = 'Esta calculadora estima un ciclo de aguinaldo a la vez (1 de diciembre a 30 de noviembre). Revisa las fechas ingresadas.'
  }
  return errors
}

export function calculateAguinaldo(input: AguinaldoInput): AguinaldoResult {
  const errors = validateWorkPeriod(input.startDate, input.endDate)
  if (Object.keys(errors).length) throw new RangeError(errors.startDate ?? errors.endDate)
  if (!Number.isFinite(input.monthlySalary) || input.monthlySalary <= 0) throw new RangeError('Salario mensual inválido.')
  const period = computeWorkPeriod(input.startDate, input.endDate)
  const basis: AguinaldoBasis = {
    salaryBase: input.monthlySalary,
    startDate: input.startDate,
    endDate: input.endDate,
    ...period,
    periodDescription: formatWorkPeriod(period),
  }
  if (period.months === 0 || (period.months === 1 && period.days === 0)) {
    return { ...basis, status: 'below-threshold', proportion: null, amount: null }
  }
  return { ...basis, status: 'calculated', ...calculatePeriodAmounts(basis.salaryBase, period) }
}

export function formatWorkDate(value: string): string {
  return value.split('-').reverse().join('/')
}

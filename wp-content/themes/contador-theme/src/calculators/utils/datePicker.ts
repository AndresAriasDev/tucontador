import { daysInMonth, parseCivilDate, type CivilDate } from './workPeriod'

export function parseDateValue(value: string): CivilDate | null {
  try { return parseCivilDate(value) } catch { return null }
}
export function formatDateValue(date: CivilDate): string {
  const value = `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  parseCivilDate(value)
  return value
}
export function dateBounds(min?: string, max?: string) {
  const lower = min && parseDateValue(min) ? min : '0001-01-01'
  const upper = max && parseDateValue(max) ? max : '9999-12-31'
  if (lower > upper) throw new RangeError('El mínimo no puede superar el máximo.')
  return { lower, upper }
}
export function clampDate(date: CivilDate, min?: string, max?: string): CivilDate {
  const { lower, upper } = dateBounds(min, max)
  const year = Math.max(1, Math.min(9999, date.year))
  const month = Math.max(1, Math.min(12, date.month))
  const value = formatDateValue({ year, month, day: Math.max(1, Math.min(daysInMonth(year, month), date.day)) })
  return parseCivilDate(value < lower ? lower : value > upper ? upper : value)
}
export function initialPickerDate(value: string, fallback: string | undefined, today: string, min?: string, max?: string) {
  return clampDate(parseDateValue(value) ?? parseDateValue(fallback ?? '') ?? parseCivilDate(today), min, max)
}
export function wheelBounds(date: CivilDate, unit: keyof CivilDate, min?: string, max?: string): [number, number] {
  const bounds = dateBounds(min, max)
  const lower = parseCivilDate(bounds.lower), upper = parseCivilDate(bounds.upper)
  if (unit === 'year') return [lower.year, upper.year]
  if (unit === 'month') return [date.year === lower.year ? lower.month : 1, date.year === upper.year ? upper.month : 12]
  return [date.year === lower.year && date.month === lower.month ? lower.day : 1, date.year === upper.year && date.month === upper.month ? upper.day : daysInMonth(date.year, date.month)]
}

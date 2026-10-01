const dayFormatter = new Intl.NumberFormat('es-NI', { maximumFractionDigits: 2 })

export function formatVacationDays(value: number): string {
  const displayed = dayFormatter.format(value)
  return `${displayed} ${displayed === dayFormatter.format(1) ? 'día' : 'días'}`
}

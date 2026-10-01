const numberFormatter = new Intl.NumberFormat('es-NI', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCordobas(value: number): string {
  return `C$ ${numberFormatter.format(value)}`
}

import { IrInssCalculator } from '../calculators/IrInssCalculator/IrInssCalculator'

interface CalculatorAppProps {
  calculator: string
}

export function CalculatorApp({ calculator }: CalculatorAppProps) {
  if (['ir-inss', 'calculadora-ir-inss', 'calculadora-de-ir-e-inss'].includes(calculator)) {
    return <IrInssCalculator />
  }

  return (
    <p className="calculator-notice" role="status">
      Esta calculadora estará disponible próximamente.
    </p>
  )
}

import { IrInssCalculator } from '../calculators/IrInssCalculator/IrInssCalculator'
import { AguinaldoCalculator } from '../calculators/AguinaldoCalculator/AguinaldoCalculator'
import { VacationCalculator } from '../calculators/VacationCalculator/VacationCalculator'

interface CalculatorAppProps {
  calculator: string
}

export function CalculatorApp({ calculator }: CalculatorAppProps) {
  if (calculator === 'vacaciones') return <VacationCalculator />
  if (calculator === 'aguinaldo') return <AguinaldoCalculator />
  if (['ir-inss', 'calculadora-ir-inss', 'calculadora-de-ir-e-inss'].includes(calculator)) {
    return <IrInssCalculator />
  }

  return (
    <p className="calculator-notice" role="status">
      Esta calculadora estará disponible próximamente.
    </p>
  )
}

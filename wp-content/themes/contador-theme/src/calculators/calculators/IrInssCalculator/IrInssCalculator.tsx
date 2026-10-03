import { useRef, useState, type FormEvent } from 'react'
import { calculateIrInss } from '../../utils/calculateIrInss'
import { formatCordobas } from '../../utils/currency'
import type { IrInssResult } from '../../types/tax'
import { CalculatorDetails } from '../../components/CalculatorDetails'
import { ResultGroup } from '../../components/ResultGroup'
import { ResultRow } from '../../components/ResultRow'
import {
  captureSalaryCaret,
  formatSalaryDisplay,
  mapSalaryCaret,
  parseSalaryInput,
} from '../../utils/salaryInput'

function getBracketLabel(result: IrInssResult): string {
  const { minimum, maximum } = result.bracket
  const lowerBound = minimum === 0 ? 0.01 : minimum + 0.01
  if (maximum === null) return `Más de ${formatCordobas(minimum)}`
  return `${formatCordobas(lowerBound)} – ${formatCordobas(maximum)}`
}

export function IrInssCalculator() {
  const [salaryValue, setSalaryValue] = useState('')
  const [salaryDisplay, setSalaryDisplay] = useState('')
  const [result, setResult] = useState<IrInssResult | null>(null)
  const [error, setError] = useState('')
  const [invalidInput, setInvalidInput] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const salaryInputRef = useRef<HTMLInputElement>(null)

  function handleSalaryChange(value: string, caret: number) {
    const parsed = parseSalaryInput(value)

    if (!parsed.valid) {
      setInvalidInput(true)
      setError('Ingresa un monto válido.')
      return
    }

    const caretSnapshot = captureSalaryCaret(value, caret, parsed)
    const formatted = formatSalaryDisplay(parsed.value)
    setSalaryValue(parsed.value)
    setSalaryDisplay(formatted)
    setInvalidInput(false)
    setError('')

    window.requestAnimationFrame(() => {
      const input = salaryInputRef.current
      if (!input || document.activeElement !== input) return
      const nextCaret = mapSalaryCaret(formatted, caretSnapshot)
      input.setSelectionRange(nextCaret, nextCaret)
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (invalidInput) {
      setResult(null)
      setError('Ingresa un monto válido.')
      return
    }

    if (salaryValue.trim() === '') {
      setResult(null)
      setError('Ingresa tu salario bruto mensual.')
      return
    }

    const parsedSalary = Number(salaryValue)
    if (!Number.isFinite(parsedSalary)) {
      setResult(null)
      setError('Ingresa un monto válido.')
      return
    }

    if (parsedSalary <= 0) {
      setResult(null)
      setError('El salario debe ser mayor que C$0.')
      return
    }

    setError('')
    setResult(calculateIrInss(parsedSalary))
    setDetailsOpen(false)
  }

  return (
    <section className="calculator" aria-label="Calculadora de IR e INSS">
      <div className="calculator__form-panel">
        <form onSubmit={handleSubmit} noValidate>
          <div className="calculator__label-row">
            <label htmlFor="gross-monthly-salary">Salario bruto mensual</label>
          </div>
          <div className={`calculator__input-wrap${error ? ' is-invalid' : ''}`}>
            <span aria-hidden="true">C$</span>
            <input
              ref={salaryInputRef}
              id="gross-monthly-salary"
              name="grossMonthlySalary"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              placeholder="Ej: 14,000"
              value={salaryDisplay}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'salary-error' : undefined}
              onChange={(event) => handleSalaryChange(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length)}
              onBlur={() => setSalaryDisplay(formatSalaryDisplay(salaryValue, true))}
            />
          </div>
          <div className="calculator__validation-slot">
            {error && <p className="calculator__error" id="salary-error" role="alert">{error}</p>}
          </div>
          <button className="btn btn-primary calculator__submit" type="submit">Calcular mi salario neto</button>
        </form>
      </div>

      <div className="calculator__result-panel" aria-live="polite" aria-atomic="true">
        {result ? (
          <>
            <p className="calculator__eyebrow">Resumen</p>
            <div className="calculator__deductions">
              <h3>Deducciones estimadas</h3>
              <dl className="calculator__summary">
                <ResultRow
                  label="INSS laboral"
                  value={`−${formatCordobas(result.inssMonthly)}`}
                />
                <ResultRow
                  label="IR mensual"
                  value={`−${formatCordobas(result.monthlyTax)}`}
                />
                <ResultRow
                  label="Total de deducciones"
                  value={formatCordobas(result.inssMonthly + result.monthlyTax)}
                  variant="total"
                />
              </dl>
            </div>

            <div className="calculator__net-highlight">
              <span>Salario neto estimado</span>
              <strong>{formatCordobas(result.netMonthly)}</strong>
            </div>
          </>
        ) : (
          <div className="calculator__empty">
            <span className="calculator__empty-icon" aria-hidden="true" />
            <h3>Aquí verás tu salario neto</h3>
            <p>Ingresa tu salario bruto mensual y te mostraremos una estimación clara de tus deducciones.</p>
          </div>
        )}
      </div>

      {result && (
        <CalculatorDetails
          id="ir-calculator-details"
          description="Consulta el desglose utilizado para obtener esta estimación de IR e INSS."
          open={detailsOpen}
          onToggle={() => setDetailsOpen((open) => !open)}
        >
              <ResultGroup title="Ingreso">
                <ResultRow
                  label="Salario bruto mensual"
                  value={formatCordobas(result.grossMonthly)}
                />
              </ResultGroup>
              <ResultGroup title="Deducción INSS">
                <ResultRow
                  label="INSS laboral"
                  value={formatCordobas(result.inssMonthly)}
                  highlightValue
                />
                <ResultRow
                  label="Base mensual después del INSS"
                  value={formatCordobas(result.taxableMonthly)}
                />
              </ResultGroup>
              <ResultGroup title="Cálculo del IR">
                <ResultRow
                  label="Renta neta anual proyectada"
                  value={formatCordobas(result.projectedAnnualIncome)}
                />
                <ResultRow
                  label="Rango de IR aplicado"
                  value={getBracketLabel(result)}
                />
                <ResultRow
                  label="IR anual calculado"
                  value={formatCordobas(result.annualTax)}
                />
                <ResultRow
                  label="IR mensual estimado"
                  value={formatCordobas(result.monthlyTax)}
                  highlightValue
                />
              </ResultGroup>
              <ResultGroup title="Resultado">
                <ResultRow
                  label="Salario neto estimado"
                  value={formatCordobas(result.netMonthly)}
                  highlightValue
                  variant="total"
                />
              </ResultGroup>
        </CalculatorDetails>
      )}
    </section>
  )
}

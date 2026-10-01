import { useRef, useState, type FormEvent } from 'react'
import { calculateIrInss } from '../../utils/calculateIrInss'
import { formatCordobas } from '../../utils/currency'
import type { IrInssResult } from '../../types/tax'
import { InfoTooltip } from '../../components/InfoTooltip'
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

const explanations = {
  gross: {
    title: 'Salario bruto mensual',
    description: 'Es el salario mensual antes de aplicar deducciones como INSS e IR.',
  },
  inss: {
    title: 'INSS laboral',
    description: 'Es el aporte del trabajador al Instituto Nicaragüense de Seguridad Social. Para esta estimación se aplica la tasa configurada actualmente en la calculadora.',
  },
  taxable: {
    title: 'Base mensual después del INSS',
    description: 'Es el salario bruto menos el aporte laboral al INSS. Esta cantidad se utiliza para proyectar la renta neta anual en esta calculadora.',
  },
  annualIncome: {
    title: 'Renta neta anual proyectada',
    description: 'Es la proyección a 12 meses de la base mensual utilizada para determinar el rango correspondiente del IR.',
  },
  bracket: {
    title: 'Rango de IR aplicado',
    description: 'Indica el rango de la tarifa progresiva del IR en el que se encuentra la renta neta anual proyectada. No significa que todo el ingreso se grave con el porcentaje de ese rango.',
  },
  annualTax: {
    title: 'IR anual calculado',
    description: 'Es el impuesto anual estimado después de aplicar la tarifa progresiva correspondiente.',
  },
  monthlyTax: {
    title: 'IR mensual estimado',
    description: 'Es la estimación mensual obtenida a partir del IR anual calculado.',
  },
} as const

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
    <section className="ir-calculator" aria-labelledby="ir-calculator-title">
      <div className="ir-calculator__form-panel">
        <div className="ir-calculator__form-heading">
          <div className="ir-calculator__form-heading-copy">
            <h2 id="ir-calculator-title">Calculadora de IR e INSS</h2>
            <p className="ir-calculator__intro">
              Calcula una proyección mensual a partir de un salario bruto regular.
            </p>
          </div>
          <InfoTooltip
            id="ir-help-about-calculator"
            label="la calculadora de IR e INSS"
            title="Sobre esta calculadora"
          >
            Esta herramienta ofrece una estimación informativa del IR, INSS y salario neto a partir de un salario mensual regular. El resultado no sustituye una revisión contable individual.
          </InfoTooltip>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="ir-calculator__label-row">
            <label htmlFor="gross-monthly-salary">Salario bruto mensual</label>
            <InfoTooltip
              id="ir-help-gross-input"
              label="salario bruto mensual"
              title={explanations.gross.title}
            >
              {explanations.gross.description}
            </InfoTooltip>
          </div>
          <div className={`ir-calculator__input-wrap${error ? ' is-invalid' : ''}`}>
            <span aria-hidden="true">C$</span>
            <input
              ref={salaryInputRef}
              id="gross-monthly-salary"
              name="grossMonthlySalary"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              placeholder="20,000"
              value={salaryDisplay}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'salary-error' : undefined}
              onChange={(event) => handleSalaryChange(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length)}
              onBlur={() => setSalaryDisplay(formatSalaryDisplay(salaryValue, true))}
            />
          </div>
          <div className="ir-calculator__validation-slot">
            {error && <p className="ir-calculator__error" id="salary-error" role="alert">{error}</p>}
          </div>
          <button className="btn btn-primary ir-calculator__submit" type="submit">Calcular salario neto</button>
        </form>
      </div>

      <div className="ir-calculator__result-panel" aria-live="polite" aria-atomic="true">
        {result ? (
          <>
            <p className="ir-calculator__eyebrow">Resumen</p>
            <div className="ir-calculator__deductions">
              <h3>Deducciones estimadas</h3>
              <dl className="ir-calculator__summary">
                <ResultRow
                  label="INSS laboral"
                  value={`−${formatCordobas(result.inssMonthly)}`}
                  help={{
                    id: 'ir-help-inss-summary',
                    title: explanations.inss.title,
                    description: explanations.inss.description,
                  }}
                />
                <ResultRow
                  label="IR mensual"
                  value={`−${formatCordobas(result.monthlyTax)}`}
                  help={{
                    id: 'ir-help-monthly-summary',
                    title: explanations.monthlyTax.title,
                    description: explanations.monthlyTax.description,
                  }}
                />
                <ResultRow
                  label="Total de deducciones"
                  value={formatCordobas(result.inssMonthly + result.monthlyTax)}
                  variant="total"
                />
              </dl>
            </div>

            <div className="ir-calculator__net-highlight">
              <span>Salario neto estimado</span>
              <strong>{formatCordobas(result.netMonthly)}</strong>
            </div>
          </>
        ) : (
          <div className="ir-calculator__empty">
            <span className="ir-calculator__empty-icon" aria-hidden="true" />
            <h3>Aquí verás tu salario neto</h3>
            <p>Ingresa tu salario bruto mensual y te mostraremos una estimación clara de tus deducciones.</p>
          </div>
        )}
      </div>

      {result && (
        <section className="ir-calculator__details" aria-labelledby="ir-calculator-details-title">
          <header className="ir-calculator__details-heading">
            <h3 id="ir-calculator-details-title">¿Quieres ver cómo se calculó?</h3>
            <p>Consulta el desglose utilizado para obtener esta estimación de IR e INSS.</p>
          </header>
          <button
            className="ir-calculator__details-toggle"
            type="button"
            aria-expanded={detailsOpen}
            aria-controls="ir-calculator-details-content"
            onClick={() => setDetailsOpen((open) => !open)}
          >
            <span>{detailsOpen ? 'Ocultar detalle del cálculo' : 'Ver detalle del cálculo'}</span>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </button>
          <div
            className="ir-calculator__details-content"
            id="ir-calculator-details-content"
            hidden={!detailsOpen}
          >
            <div className="ir-calculator__detail-groups">
              <ResultGroup title="Ingreso">
                <ResultRow
                  label="Salario bruto mensual"
                  value={formatCordobas(result.grossMonthly)}
                  help={{
                    id: 'ir-help-gross-detail',
                    title: explanations.gross.title,
                    description: explanations.gross.description,
                  }}
                />
              </ResultGroup>
              <ResultGroup title="Deducción INSS">
                <ResultRow
                  label="INSS laboral"
                  value={formatCordobas(result.inssMonthly)}
                  highlightValue
                  help={{
                    id: 'ir-help-inss-detail',
                    title: explanations.inss.title,
                    description: explanations.inss.description,
                  }}
                />
                <ResultRow
                  label="Base mensual después del INSS"
                  value={formatCordobas(result.taxableMonthly)}
                  help={{
                    id: 'ir-help-taxable-detail',
                    title: explanations.taxable.title,
                    description: explanations.taxable.description,
                  }}
                />
              </ResultGroup>
              <ResultGroup title="Cálculo del IR">
                <ResultRow
                  label="Renta neta anual proyectada"
                  value={formatCordobas(result.projectedAnnualIncome)}
                  help={{
                    id: 'ir-help-annual-income-detail',
                    title: explanations.annualIncome.title,
                    description: explanations.annualIncome.description,
                  }}
                />
                <ResultRow
                  label="Rango de IR aplicado"
                  value={getBracketLabel(result)}
                  help={{
                    id: 'ir-help-bracket-detail',
                    title: explanations.bracket.title,
                    description: explanations.bracket.description,
                  }}
                />
                <ResultRow
                  label="IR anual calculado"
                  value={formatCordobas(result.annualTax)}
                  help={{
                    id: 'ir-help-annual-tax-detail',
                    title: explanations.annualTax.title,
                    description: explanations.annualTax.description,
                  }}
                />
                <ResultRow
                  label="IR mensual estimado"
                  value={formatCordobas(result.monthlyTax)}
                  highlightValue
                  help={{
                    id: 'ir-help-monthly-tax-detail',
                    title: explanations.monthlyTax.title,
                    description: explanations.monthlyTax.description,
                  }}
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
            </div>
          </div>
        </section>
      )}
    </section>
  )
}

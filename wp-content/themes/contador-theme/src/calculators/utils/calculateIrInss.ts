import {
  EMPLOYMENT_TAX_BRACKETS,
  INSS_EMPLOYEE_RATE,
  MONTHS_PER_YEAR,
} from '../config/tax'
import type { IrInssResult, TaxBracket } from '../types/tax'

function findBracket(annualIncome: number): TaxBracket {
  return EMPLOYMENT_TAX_BRACKETS.find(
    (bracket) => bracket.maximum === null || annualIncome <= bracket.maximum,
  ) ?? EMPLOYMENT_TAX_BRACKETS[EMPLOYMENT_TAX_BRACKETS.length - 1]!
}

export function calculateIrInss(grossMonthly: number): IrInssResult {
  if (!Number.isFinite(grossMonthly) || grossMonthly <= 0) {
    throw new RangeError('Ingresa un salario bruto mensual mayor que cero.')
  }

  const inssMonthly = grossMonthly * INSS_EMPLOYEE_RATE
  const taxableMonthly = grossMonthly - inssMonthly
  const projectedAnnualIncome = taxableMonthly * MONTHS_PER_YEAR
  const bracket = findBracket(projectedAnnualIncome)
  const annualTax = bracket.baseTax + Math.max(0, projectedAnnualIncome - bracket.minimum) * bracket.rate
  const monthlyTax = annualTax / MONTHS_PER_YEAR

  return {
    grossMonthly,
    inssMonthly,
    taxableMonthly,
    projectedAnnualIncome,
    bracket,
    annualTax,
    monthlyTax,
    netMonthly: grossMonthly - inssMonthly - monthlyTax,
  }
}

import type { TaxBracket } from '../types/tax'

export const INSS_EMPLOYEE_RATE = 0.07
export const MONTHS_PER_YEAR = 12

/** Configure only after confirming an applicable official INSS minimum rule. */
export const INSS_MINIMUM_CONTRIBUTION_BASE: number | null = null

export const EMPLOYMENT_TAX_BRACKETS: readonly TaxBracket[] = [
  { minimum: 0, maximum: 100_000, baseTax: 0, rate: 0 },
  { minimum: 100_000, maximum: 200_000, baseTax: 0, rate: 0.15 },
  { minimum: 200_000, maximum: 350_000, baseTax: 15_000, rate: 0.2 },
  { minimum: 350_000, maximum: 500_000, baseTax: 45_000, rate: 0.25 },
  { minimum: 500_000, maximum: null, baseTax: 82_500, rate: 0.3 },
]

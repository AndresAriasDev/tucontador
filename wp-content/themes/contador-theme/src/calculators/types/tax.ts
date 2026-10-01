export interface TaxBracket {
  readonly minimum: number
  readonly maximum: number | null
  readonly baseTax: number
  readonly rate: number
}

export interface IrInssResult {
  readonly grossMonthly: number
  readonly inssMonthly: number
  readonly taxableMonthly: number
  readonly projectedAnnualIncome: number
  readonly bracket: TaxBracket
  readonly annualTax: number
  readonly monthlyTax: number
  readonly netMonthly: number
}

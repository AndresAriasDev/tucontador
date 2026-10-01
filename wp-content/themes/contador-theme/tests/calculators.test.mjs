import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// Run with Node >=22.18: node --experimental-strip-types --test tests/calculators.test.mjs
registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context) } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) return next(`${specifier}.ts`, context)
      throw error
    }
  },
})
const { calculateAguinaldo, isValidWorkDate, validateWorkPeriod } = await import('../src/calculators/calculators/AguinaldoCalculator/calculateAguinaldo.ts')
const { calculateIrInss } = await import('../src/calculators/utils/calculateIrInss.ts')
const { computeWorkPeriod, calculatePeriodAmounts, formatWorkPeriod } = await import('../src/calculators/calculators/AguinaldoCalculator/workPeriod.ts')
const estimate = (startDate, endDate) => calculateAguinaldo({ monthlySalary: 20000, startDate, endDate })

test('uses monthly salary directly and rejects invalid salary input', () => {
  const input = { monthlySalary: 20000, startDate: '2025-12-01', endDate: '2026-11-30' }
  assert.equal(calculateAguinaldo(input).salaryBase, 20000)
  for (const monthlySalary of [undefined, null, '', '20000', 0, -1, NaN, Infinity, -Infinity]) {
    assert.throws(() => calculateAguinaldo({ ...input, monthlySalary }), RangeError)
  }
})

test('ordinary cycle and leap-year cycle each pay exactly one salary', () => {
  for (const [start, end] of [['2025-12-01', '2026-11-30'], ['2023-12-01', '2024-11-30']]) {
    const result = estimate(start, end)
    assert.equal(result.status, 'calculated')
    assert.equal(result.months, 12)
    assert.equal(result.days, 0)
    assert.equal(result.amount, 20000)
    assert.equal(result.monthFraction, 1)
    assert.equal(result.dayFraction, 0)
  }
})
test('six complete inclusive months', () => {
  const result = estimate('2025-12-01', '2026-05-31')
  assert.equal(result.months, 6)
  assert.equal(result.days, 0)
  assert.equal(result.amount, 10000)
})
test('eight months and fifteen days preserve intermediate precision', () => {
  const result = estimate('2025-12-01', '2026-08-15')
  assert.equal(result.months, 8)
  assert.equal(result.days, 15)
  assert.ok(Math.abs(result.amountForMonths - 13333.333333333334) < 1e-9)
  assert.ok(Math.abs(result.amountForDays - 833.3333333333334) < 1e-9)
  assert.equal(result.amount.toFixed(2), '14166.67')
  assert.notEqual(result.amountForMonths, 13333.33)
  assert.equal(calculatePeriodAmounts(20000, { months: 8, days: 15 }).amount, result.amount)
})
test('rejects inverted, impossible and cross-cycle dates without accumulating years', () => {
  for (const [start, end] of [['2026-05-02', '2026-05-01'], ['2026-02-30', '2026-05-31'], ['2025-12-01', '2026-12-01'], ['2026-11-30', '2026-12-01'], ['2024-12-01', '2026-11-30']]) {
    assert.throws(() => estimate(start, end), RangeError)
    assert.ok(Object.keys(validateWorkPeriod(start, end)).length)
  }
})
test('periods up to one month return informative status, not zero money', () => {
  for (const [start, end] of [['2025-12-01', '2025-12-01'], ['2025-12-01', '2025-12-15'], ['2025-12-01', '2025-12-31'], ['2026-01-31', '2026-02-28']]) {
    const result = estimate(start, end)
    assert.equal(result.status, 'below-threshold')
    assert.equal(result.amount, null)
  }
  const above = estimate('2025-12-01', '2026-01-01')
  assert.equal(above.status, 'calculated')
  assert.equal(above.months, 1)
  assert.equal(above.days, 1)
})
test('inclusive anniversaries, clamped month ends and no anchor drift', () => {
  const cases = [
    ['2025-12-01', '2025-12-31', 1, 0],
    ['2025-12-01', '2026-01-31', 2, 0],
    ['2026-01-31', '2026-02-28', 1, 0],
    ['2024-01-31', '2024-02-29', 1, 0],
    ['2026-01-30', '2026-02-28', 1, 0],
    ['2026-01-29', '2026-02-28', 1, 0],
    ['2024-01-29', '2024-02-28', 1, 0],
    ['2024-01-29', '2024-02-29', 1, 1],
    ['2026-01-31', '2026-03-30', 2, 0],
    ['2026-04-30', '2026-05-29', 1, 0],
    ['2026-05-31', '2026-06-30', 1, 0],
    ['2026-01-01', '2026-01-30', 1, 0],
  ]
  for (const [start, end, months, days] of cases) assert.deepEqual(computeWorkPeriod(start, end), { months, days }, `${start} to ${end}`)
})
test('human-readable singular and plural', () => {
  assert.equal(formatWorkPeriod({ months: 8, days: 15 }), '8 meses y 15 días')
  assert.equal(formatWorkPeriod({ months: 1, days: 1 }), '1 mes y 1 día')
  assert.equal(formatWorkPeriod({ months: 2, days: 0 }), '2 meses')
  assert.equal(formatWorkPeriod({ months: 0, days: 15 }), '15 días')
})

test('dates validate civil dates, leap years, required fields and ordering', () => {
  assert.equal(isValidWorkDate('2024-02-29'), true)
  for (const value of ['', '2025-02-29', '1900-02-29', '2026-04-31', '2026-13-01', '0000-01-01', '2026-1-1']) assert.equal(isValidWorkDate(value), false)
  assert.equal(isValidWorkDate('2000-02-29'), true)
  assert.ok(validateWorkPeriod('', '').startDate)
  assert.ok(validateWorkPeriod('', '').endDate)
  assert.ok(validateWorkPeriod('2026-02-02', '2026-02-01').endDate)
  assert.deepEqual(validateWorkPeriod('2026-02-02', '2026-02-02'), {})
})
test('IR/INSS reference case remains unchanged', () => {
  const result = calculateIrInss(20000)
  for (const [key, value] of Object.entries({ inssMonthly: 1400, taxableMonthly: 18600, projectedAnnualIncome: 223200, annualTax: 19640, monthlyTax: 1636.67, netMonthly: 16963.33 })) {
    assert.equal(Number(result[key].toFixed(2)), value, key)
  }
})
test('IR no longer refers to retired visual class names', () => {
  const source = readFileSync(new URL('../src/calculators/calculators/IrInssCalculator/IrInssCalculator.tsx', import.meta.url), 'utf8')
  for (const match of source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    assert.equal((match[1] ?? match[2]).includes('ir-calculator'), false)
  }
})

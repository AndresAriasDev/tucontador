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
const { calculateVacation, calculateVacationAmounts, validateVacationInput } = await import('../src/calculators/calculators/VacationCalculator/calculateVacation.ts')
const { formatVacationDays } = await import('../src/calculators/utils/vacationDays.ts')
const { daysInMonth } = await import('../src/calculators/utils/workPeriod.ts')
const { parseDateValue, formatDateValue, clampDate, initialPickerDate, wheelBounds } = await import('../src/calculators/utils/datePicker.ts')
test('date picker preserves civil ISO dates and Gregorian leap rules', () => {
  for (const [year, expected] of [[2024,29],[2026,28],[2100,28],[2000,29]]) {
    assert.equal(daysInMonth(year, 2), expected)
    assert.equal(clampDate({year,month:2,day:31}).day, expected)
  }
  assert.deepEqual(parseDateValue('2026-10-01'), {year:2026,month:10,day:1})
  assert.equal(formatDateValue({year:2026,month:10,day:1}), '2026-10-01')
  for (const invalid of ['', '2026-02-29','2026-1-1','0000-01-01']) assert.equal(parseDateValue(invalid), null)
})
test('date picker enforces partial-month bounds and initial draft priority', () => {
  const min='2026-03-15', max='2026-10-20'
  assert.equal(formatDateValue(clampDate({year:2026,month:3,day:14},min,max)), min)
  assert.equal(formatDateValue(clampDate({year:2026,month:10,day:21},min,max)), max)
  assert.deepEqual(wheelBounds({year:2026,month:3,day:15},'day',min,max),[15,31])
  assert.deepEqual(wheelBounds({year:2026,month:10,day:20},'day',min,max),[1,20])
  assert.deepEqual(wheelBounds({year:2026,month:10,day:20},'month',min,max),[3,10])
  assert.equal(formatDateValue(initialPickerDate('',undefined,'2027-01-01',min,max)),max)
  assert.equal(formatDateValue(initialPickerDate('',undefined,'2025-01-01',min,max)),min)
  assert.equal(formatDateValue(initialPickerDate('','2026-06-01','2026-05-01',min,max)),'2026-06-01')
  assert.equal(formatDateValue(initialPickerDate('2026-07-01','2026-06-01','2026-05-01',min,max)),'2026-07-01')
  assert.throws(()=>clampDate({year:2026,month:3,day:15},max,min),RangeError)
})
const { calculateSettlement, calculateSeniorityIndemnity, calculatePendingSalary, validateSettlementInput } = await import('../src/calculators/calculators/SettlementCalculator/calculateSettlement.ts')
const settlementInput = { monthlySalary: 20000, employmentStartDate: '2025-01-01', terminationDate: '2025-11-15', contractType: 'indefinite', terminationReason: 'dismissalWithoutJustCause', noticeGiven: null, vacationDaysTaken: 10, unpaidWorkDays: 12 }

test('settlement indemnity covers all prescribed years, fractions and the cap', () => {
  for (const [months, expected] of [[6, 15], [8, 20], [12, 30], [24, 60], [30, 75], [36, 90], [42, 100], [48, 110], [60, 130], [72, 150], [120, 150]]) {
    const result = calculateSeniorityIndemnity(20000, { months, days: 0 })
    assert.equal(result.indemnityDays, expected)
    assert.ok(Math.abs(result.amount - expected * 20000 / 30) < 1e-8)
  }
  assert.equal(calculateSeniorityIndemnity(20000, { months: 8, days: 0 }).amount.toFixed(2), '13333.33')
  assert.equal(calculateSeniorityIndemnity(20000, { months: 0, days: 15 }).indemnityDays, 1.25)
  assert.ok(Math.abs(calculateSeniorityIndemnity(20000, { months: 36, days: 15 }).indemnityDays - (90 + 20 * 15 / 360)) < 1e-8)
})
test('settlement pending salary preserves precision and accepts zero', () => {
  assert.equal(calculatePendingSalary(20000, 12).amount, 8000)
  assert.equal(calculatePendingSalary(20000, 0).amount, 0)
  assert.equal(calculatePendingSalary(20000, 0.5).amount, 20000 / 60)
  for (const days of [-1, NaN, Infinity]) assert.throws(() => calculatePendingSalary(20000, days), RangeError)
})

test('resignation requires an explicit boolean notice declaration', () => {
  for (const noticeGiven of [null, undefined, '', 'true', 0]) {
    const input = { ...settlementInput, terminationReason: 'resignation', noticeGiven }
    assert.equal(validateSettlementInput(input).noticeGiven, 'Indica si realizaste el preaviso de 15 días.')
    assert.throws(() => calculateSettlement(input), RangeError)
  }
})

test('canonical resignation with notice reuses proportional indemnity without rounding', () => {
  const input = { ...settlementInput, monthlySalary: 12000, employmentStartDate: '2026-01-01', terminationDate: '2026-10-01', terminationReason: 'resignation', noticeGiven: true, vacationDaysTaken: 0, unpaidWorkDays: 0 }
  const r = calculateSettlement(input)
  assert.deepEqual(r.seniority, { years: 0, months: 9, days: 1 })
  assert.equal(r.indemnity.status, 'calculated')
  assert.equal(r.includesIndemnity, true)
  assert.ok(Math.abs(r.indemnity.indemnityDays - (22.5 + 1 / 12)) < 1e-10)
  assert.deepEqual(r.indemnity, { status: 'calculated', ...calculateSeniorityIndemnity(12000, { months: 9, days: 1 }) })
  assert.ok(Math.abs(r.vacation.accruedVacationDays - (22.5 + 1 / 12)) < 1e-10)
  for (const amount of [r.vacation.estimatedGrossValue, r.aguinaldo.amount, r.indemnity.amount]) assert.ok(Math.abs(amount - 9033.333333333334) < 1e-8)
  assert.ok(Math.abs(r.grossSettlement - 27100) < 1e-8)
  const without = calculateSettlement({ ...input, noticeGiven: false })
  assert.equal(without.indemnity.status, 'missingNotice')
  assert.equal(without.indemnity.amount, null)
  assert.equal(without.indemnity.indemnityDays, null)
  assert.equal(without.includesIndemnity, false)
  assert.deepEqual(without.vacation, r.vacation)
  assert.deepEqual(without.aguinaldo, r.aguinaldo)
  assert.deepEqual(without.pendingSalary, r.pendingSalary)
  assert.ok(Math.abs(without.grossSettlement - (r.grossSettlement - r.indemnity.amount)) < 1e-8)
})

test('notice never influences other reasons or fixed-term contracts', () => {
  for (const contractType of ['indefinite', 'fixedTerm']) {
    for (const terminationReason of ['resignation', 'dismissalWithoutJustCause', 'authorizedJustCause', 'other']) {
      if (contractType === 'indefinite' && terminationReason === 'resignation') continue
      const results = [true, false, null].map((noticeGiven) => calculateSettlement({ ...settlementInput, contractType, terminationReason, noticeGiven }))
      for (const result of results) {
        assert.deepEqual(result.indemnity, results[0].indemnity)
        assert.equal(result.grossSettlement, results[0].grossSettlement)
      }
    }
  }
})
test('settlement vacation is identical to standalone engine including canonical example', () => {
  const r = calculateSettlement(settlementInput)
  assert.deepEqual(r.vacation, calculateVacation({ monthlySalary: 20000, startDate: '2025-01-01', endDate: '2025-11-15', vacationDaysTaken: 10 }))
  assert.equal(r.vacation.accruedVacationDays, 26.25)
  assert.equal(r.vacation.pendingVacationDays, 16.25)
  assert.equal(r.vacation.estimatedGrossValue.toFixed(2), '10833.33')
  assert.deepEqual(r.seniority, { years: 0, months: 10, days: 15 })
})
test('settlement selects current aguinaldo cycle, respects hiring, leap years and boundaries', () => {
  for (const [employmentStartDate, terminationDate, startDate] of [
    ['2020-01-01', '2026-08-15', '2025-12-01'],
    ['2026-04-01', '2026-08-15', '2026-04-01'],
    ['2020-01-01', '2024-02-29', '2023-12-01'],
    ['2020-01-01', '2026-11-30', '2025-12-01'],
    ['2020-01-01', '2026-12-01', '2026-12-01'],
  ]) {
    const r = calculateSettlement({ ...settlementInput, employmentStartDate, terminationDate, vacationDaysTaken: 0 })
    assert.deepEqual(r.aguinaldo, calculateAguinaldo({ monthlySalary: 20000, startDate, endDate: terminationDate }))
  }
})
test('settlement indemnity statuses and partial totals do not turn uncalculated amounts into zero', () => {
  for (const [terminationReason, expected] of [['dismissalWithoutJustCause', 'calculated'], ['resignation', 'missingNotice'], ['authorizedJustCause', 'notIncluded'], ['other', 'requiresReview']]) {
    for (const contractType of ['indefinite', 'fixedTerm']) {
      const r = calculateSettlement({ ...settlementInput, contractType, terminationReason, noticeGiven: false })
      assert.equal(r.indemnity.status, contractType === 'fixedTerm' ? 'notApplicableToContractType' : expected)
      assert.equal(r.includesIndemnity, r.indemnity.status === 'calculated')
      if (!r.includesIndemnity) assert.equal(r.indemnity.amount, null)
      assert.equal(r.grossSettlement, r.pendingSalary.amount + r.vacation.estimatedGrossValue + r.aguinaldo.amount + (r.includesIndemnity ? r.indemnity.amount : 0))
    }
  }
})
test('settlement preserves short-period aguinaldo status and excludes only that unknown amount', () => {
  const r = calculateSettlement({ ...settlementInput, employmentStartDate: '2026-04-01', terminationDate: '2026-04-15', vacationDaysTaken: 0 })
  assert.equal(r.aguinaldo.status, 'below-threshold')
  assert.equal(r.aguinaldo.amount, null)
  assert.equal(r.includesAguinaldo, false)
  assert.equal(r.grossSettlement, r.pendingSalary.amount + r.vacation.estimatedGrossValue + r.indemnity.amount)
})
test('settlement validates all inputs and rejects overflow', () => {
  for (const changes of [{ monthlySalary: 0 }, { monthlySalary: NaN }, { monthlySalary: Infinity }, { employmentStartDate: '' }, { terminationDate: '2025-02-30' }, { terminationDate: '2024-12-31' }, { contractType: 'unknown' }, { terminationReason: 'unknown' }, { vacationDaysTaken: -1 }, { vacationDaysTaken: 100 }, { vacationDaysTaken: NaN }, { unpaidWorkDays: -1 }, { unpaidWorkDays: NaN }, { unpaidWorkDays: Infinity }]) {
    assert.ok(Object.keys(validateSettlementInput({ ...settlementInput, ...changes })).length)
    assert.throws(() => calculateSettlement({ ...settlementInput, ...changes }), RangeError)
  }
  assert.throws(() => calculateSettlement({ ...settlementInput, monthlySalary: Number.MAX_VALUE, unpaidWorkDays: Number.MAX_VALUE }), RangeError)
})

test('vacation monthly accrual supports 6, 12 and 18 months', () => {
  for (const [months, expected] of [[6, 15], [12, 30], [18, 45]]) {
    assert.equal(calculateVacationAmounts(20000, { months, days: 0 }, 0).accruedVacationDays, expected)
  }
  assert.equal(calculateVacationAmounts(20000, { months: 6, days: 0 }, 0).estimatedGrossValue, 10000)
})
test('vacation canonical example retains precision and subtracts taken days', () => {
  const result = calculateVacationAmounts(20000, { months: 10, days: 15 }, 10)
  assert.equal(result.vacationDaysFromMonths, 25)
  assert.equal(result.vacationDaysFromExtraDays, 1.25)
  assert.equal(result.accruedVacationDays, 26.25)
  assert.equal(result.pendingVacationDays, 16.25)
  assert.equal(result.dailySalary, 20000 / 30)
  assert.equal(result.estimatedGrossValue.toFixed(2), '10833.33')
  assert.equal(calculateVacation({ monthlySalary: 20000, startDate: '2025-01-01', endDate: '2025-11-15', vacationDaysTaken: 10 }).pendingVacationDays, 16.25)
})
test('vacation dates have no aguinaldo cycle or annual limit; leap years preserved', () => {
  for (const [startDate, endDate, expected] of [['2025-01-01', '2026-06-30', 45], ['2023-12-01', '2024-11-30', 30], ['2024-01-31', '2024-02-29', 2.5]]) {
    assert.equal(calculateVacation({ monthlySalary: 20000, startDate, endDate, vacationDaysTaken: 0 }).accruedVacationDays, expected)
  }
})
test('vacation invalid inputs and excessive taken days are rejected, never clamped', () => {
  const input = { monthlySalary: 20000, startDate: '2025-01-01', endDate: '2025-06-30', vacationDaysTaken: 0 }
  for (const changes of [{ monthlySalary: 0 }, { monthlySalary: NaN }, { monthlySalary: Infinity }, { vacationDaysTaken: -1 }, { vacationDaysTaken: NaN }, { vacationDaysTaken: Infinity }, { vacationDaysTaken: 20 }, { startDate: '' }, { endDate: '2025-02-30' }, { endDate: '2024-12-31' }]) {
    assert.throws(() => calculateVacation({ ...input, ...changes }), RangeError)
    assert.ok(Object.keys(validateVacationInput({ ...input, ...changes })).length)
  }
  assert.equal(calculateVacation({ ...input, vacationDaysTaken: 12.5 }).pendingVacationDays, 2.5)
  assert.equal(calculateVacation({ ...input, vacationDaysTaken: 15 }).estimatedGrossValue, 0)
  assert.throws(() => calculateVacation({ ...input, monthlySalary: Number.MAX_VALUE, endDate: '2030-06-30' }), RangeError)
})
test('vacation day formatting is concise with at most two decimals', () => {
  assert.equal(formatVacationDays(15), '15 días')
  assert.equal(formatVacationDays(12.5), '12.5 días')
  assert.equal(formatVacationDays(26.25), '26.25 días')
  assert.equal(formatVacationDays(1 / 12), '0.08 días')
  assert.equal(formatVacationDays(1), '1 día')
})

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

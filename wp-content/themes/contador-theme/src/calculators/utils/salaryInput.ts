export type SalaryDecimalSeparator = '.' | ',' | null

export interface ParsedSalaryInput {
  valid: boolean
  value: string
  decimalSeparator: SalaryDecimalSeparator
  decimalSeparatorIndex: number
}

export interface SalaryCaretPosition {
  digitsBefore: number
  groupsBefore: number
  decimalBefore: boolean
  negativeBefore: boolean
}

function normalizeInteger(value: string): string {
  return value.replace(/^0+(?=\d)/, '') || '0'
}

function invalidInput(): ParsedSalaryInput {
  return { valid: false, value: '', decimalSeparator: null, decimalSeparatorIndex: -1 }
}

export function parseSalaryInput(input: string): ParsedSalaryInput {
  if (input === '') {
    return { valid: true, value: '', decimalSeparator: null, decimalSeparatorIndex: -1 }
  }

  if (!/^-?[\d.,]*$/.test(input)) return invalidInput()

  const negative = input.startsWith('-')
  const sign = negative ? '-' : ''
  const body = negative ? input.slice(1) : input
  const signOffset = negative ? 1 : 0

  if (body === '') {
    return { valid: true, value: sign, decimalSeparator: null, decimalSeparatorIndex: -1 }
  }

  const decimalPointCount = (body.match(/\./g) ?? []).length
  if (decimalPointCount > 1) return invalidInput()

  if (decimalPointCount === 1) {
    const separatorIndex = body.indexOf('.')
    const integerPart = body.slice(0, separatorIndex).replace(/,/g, '')
    const decimalPart = body.slice(separatorIndex + 1)

    if (!/^\d*$/.test(integerPart) || !/^\d{0,2}$/.test(decimalPart)) return invalidInput()

    const integer = integerPart === '' ? '0' : normalizeInteger(integerPart)
    return {
      valid: true,
      value: `${sign}${integer}.${decimalPart}`,
      decimalSeparator: '.',
      decimalSeparatorIndex: separatorIndex + signOffset,
    }
  }

  const commaCount = (body.match(/,/g) ?? []).length
  if (commaCount > 0) {
    if (/^\d{1,3}(?:,\d{3})+$/.test(body)) {
      return {
        valid: true,
        value: `${sign}${normalizeInteger(body.replace(/,/g, ''))}`,
        decimalSeparator: null,
        decimalSeparatorIndex: -1,
      }
    }

    if (commaCount === 1) {
      const separatorIndex = body.indexOf(',')
      const integerPart = body.slice(0, separatorIndex)
      const decimalPart = body.slice(separatorIndex + 1)

      if (/^\d*$/.test(integerPart) && /^\d{0,2}$/.test(decimalPart) && (integerPart !== '' || decimalPart !== '')) {
        const integer = integerPart === '' ? '0' : normalizeInteger(integerPart)
        return {
          valid: true,
          value: `${sign}${integer}.${decimalPart}`,
          decimalSeparator: ',',
          decimalSeparatorIndex: separatorIndex + signOffset,
        }
      }
    }

    // Commas can be mid-edit grouping separators inserted by this formatter.
    const integerPart = body.replace(/,/g, '')
    if (!/^\d+$/.test(integerPart)) return invalidInput()
    return {
      valid: true,
      value: `${sign}${normalizeInteger(integerPart)}`,
      decimalSeparator: null,
      decimalSeparatorIndex: -1,
    }
  }

  if (!/^\d+$/.test(body)) return invalidInput()
  return {
    valid: true,
    value: `${sign}${normalizeInteger(body)}`,
    decimalSeparator: null,
    decimalSeparatorIndex: -1,
  }
}

export function formatSalaryDisplay(value: string, padDecimal = false): string {
  if (value === '' || value === '-') return value

  const negative = value.startsWith('-')
  const sign = negative ? '-' : ''
  const unsigned = negative ? value.slice(1) : value
  const separatorIndex = unsigned.indexOf('.')
  const hasDecimal = separatorIndex >= 0
  const integerPart = hasDecimal ? unsigned.slice(0, separatorIndex) : unsigned
  const decimalPart = hasDecimal ? unsigned.slice(separatorIndex + 1) : ''
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const formattedDecimal = padDecimal && hasDecimal ? decimalPart.padEnd(2, '0') : decimalPart

  return `${sign}${groupedInteger}${hasDecimal ? `.${formattedDecimal}` : ''}`
}

export function captureSalaryCaret(
  input: string,
  caret: number,
  parsed: ParsedSalaryInput,
): SalaryCaretPosition {
  const prefix = input.slice(0, caret)
  const groupsBefore = parsed.decimalSeparator === ','
    ? 0
    : (prefix.match(/,/g) ?? []).length

  return {
    digitsBefore: (prefix.match(/\d/g) ?? []).length,
    groupsBefore,
    decimalBefore: parsed.decimalSeparatorIndex >= 0 && caret > parsed.decimalSeparatorIndex,
    negativeBefore: prefix.startsWith('-'),
  }
}

export function mapSalaryCaret(display: string, target: SalaryCaretPosition): number {
  let digitsBefore = 0
  let groupsBefore = 0
  let decimalBefore = false
  let negativeBefore = false
  let position = 0

  const matchesTarget = () => (
    digitsBefore === target.digitsBefore
    && groupsBefore === target.groupsBefore
    && decimalBefore === target.decimalBefore
    && negativeBefore === target.negativeBefore
  )

  if (matchesTarget()) return 0

  for (const character of display) {
    if (character === '-') negativeBefore = true
    else if (character === ',') groupsBefore += 1
    else if (character === '.') decimalBefore = true
    else if (/\d/.test(character)) digitsBefore += 1
    position += 1

    if (matchesTarget()) return position
  }

  return display.length
}

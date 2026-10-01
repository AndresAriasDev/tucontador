import type { ReactNode } from 'react'
import { InfoTooltip } from './InfoTooltip'

interface ResultRowProps {
  label: string
  value: ReactNode
  variant?: 'total'
  highlightValue?: boolean
  help?: {
    id: string
    title: string
    description: string
  }
}

export function ResultRow({ label, value, variant, highlightValue, help }: ResultRowProps) {
  const className = [
    'calculator-result-row',
    variant && `calculator-result-row--${variant}`,
  ].filter(Boolean).join(' ')

  return (
    <div className={className}>
      <dt>
        <span>{label}</span>
        {help && (
          <InfoTooltip id={help.id} label={label.toLowerCase()} title={help.title}>
            {help.description}
          </InfoTooltip>
        )}
      </dt>
      <dd>{highlightValue ? <span className="calculator-result-row__value-pill">{value}</span> : value}</dd>
    </div>
  )
}

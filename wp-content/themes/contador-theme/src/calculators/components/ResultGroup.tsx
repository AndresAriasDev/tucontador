import type { ReactNode } from 'react'

interface ResultGroupProps {
  title: string
  children: ReactNode
}

export function ResultGroup({ title, children }: ResultGroupProps) {
  return (
    <section className="calculator-result-group" aria-label={title}>
      <h4>{title}</h4>
      <dl className="calculator-result-group__list">{children}</dl>
    </section>
  )
}

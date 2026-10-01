import type { ReactNode } from 'react'

interface CalculatorDetailsProps {
  id: string
  description: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}

export function CalculatorDetails({ id, description, open, onToggle, children }: CalculatorDetailsProps) {
  return (
    <section className="calculator__details" aria-labelledby={`${id}-title`}>
      <header className="calculator__details-heading">
        <h3 id={`${id}-title`}>¿Quieres ver cómo se calculó?</h3>
        <p>{description}</p>
      </header>
      <button className="calculator__details-toggle" type="button" aria-expanded={open} aria-controls={`${id}-content`} onClick={onToggle}>
        <span>{open ? 'Ocultar detalle del cálculo' : 'Ver detalle del cálculo'}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      </button>
      <div className="calculator__details-content" id={`${id}-content`} hidden={!open}>
        <div className="calculator__detail-groups">{children}</div>
      </div>
    </section>
  )
}

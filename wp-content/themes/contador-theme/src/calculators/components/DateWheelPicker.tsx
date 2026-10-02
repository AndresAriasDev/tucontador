import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { clampDate, formatDateValue, initialPickerDate, wheelBounds } from '../utils/datePicker'
import type { CivilDate } from '../utils/workPeriod'

const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const units = ['day', 'month', 'year'] as const
const labels = { day: 'Día', month: 'Mes', year: 'Año' }
interface WheelProps { label: string; value: number; lower: number; upper: number; text: (value: number) => string; onChange: (value: number) => void; onHorizontal: (direction: number) => void }
function Wheel({ label, value, lower, upper, text, onChange, onHorizontal }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const latest = useRef({ value, lower, upper, onChange })
  latest.current = { value, lower, upper, onChange }
  const drag = useRef<{ y: number; value: number; moved: boolean } | null>(null)
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    const node = ref.current!
    let accumulated = 0, last = 0
    function wheel(event: WheelEvent) {
      event.preventDefault()
      const now = performance.now()
      if (now - last > 200) accumulated = 0
      accumulated += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 120 : 1)
      if (Math.abs(accumulated) < 40 || now - last < 80) return
      const current = latest.current
      current.onChange(Math.max(current.lower, Math.min(current.upper, current.value + Math.sign(accumulated))))
      accumulated = 0; last = now
    }
    node.addEventListener('wheel', wheel, { passive: false })
    return () => node.removeEventListener('wheel', wheel)
  }, [])
  return <div ref={ref} className="date-wheel" role="spinbutton" tabIndex={0} aria-label={label} aria-valuemin={lower} aria-valuemax={upper} aria-valuenow={value} aria-valuetext={text(value)}
    onKeyDown={(event) => {
      const changes: Record<string, number> = { ArrowUp: value - 1, ArrowDown: value + 1, Home: lower, End: upper }
      if (event.key in changes) { event.preventDefault(); onChange(Math.max(lower, Math.min(upper, changes[event.key]))) }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); onHorizontal(event.key === 'ArrowLeft' ? -1 : 1) }
    }}
    onPointerDown={(event) => { if (event.button !== 0) return; event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); drag.current = { y: event.clientY, value, moved: false } }}
    onPointerMove={(event) => { if (!drag.current) return; const distance = drag.current.y - event.clientY; if (Math.abs(distance) > 5) drag.current.moved = true; const steps = Math.round(distance / 44); const next = Math.max(lower, Math.min(upper, drag.current.value + steps)); onChange(next); setOffset(next === lower || next === upper ? 0 : -distance + steps * 44) }}
    onPointerUp={(event) => {
      if (!drag.current) return
      if (!drag.current.moved) { const rect = event.currentTarget.getBoundingClientRect(); const step = Math.floor((event.clientY - rect.top) / 44) - 2; onChange(Math.max(lower, Math.min(upper, value + step))) }
      drag.current = null; setOffset(0); event.currentTarget.releasePointerCapture(event.pointerId)
    }} onPointerCancel={() => { drag.current = null; setOffset(0) }}>
    <div className="date-wheel__track" style={{ transform: `translateY(${offset}px)` }} aria-hidden="true">
      {[-2, -1, 0, 1, 2].map((step) => <div className={`date-wheel__value${step === 0 ? ' is-selected' : ''}`} key={step}>{value + step >= lower && value + step <= upper ? text(value + step) : ''}</div>)}
    </div>
  </div>
}
export interface DateWheelPickerProps {
  label: string; value: string; min?: string; max?: string; defaultPickerDate?: string
  onCancel: () => void; onConfirm: (value: string) => void
}
export function DateWheelPicker({ label, value, min, max, defaultPickerDate, onCancel, onConfirm }: DateWheelPickerProps) {
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState(() => {
    const now = new Date()
    const today = formatDateValue({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() })
    return initialPickerDate(value, defaultPickerDate, today, min, max)
  })
  const selected = clampDate(draft, min, max)
  useEffect(() => {
    const node = dialog.current!, previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    node.showModal(); document.body.style.overflow = 'hidden'
    node.querySelector<HTMLElement>('[role="spinbutton"]')?.focus()
    return () => { node.close(); document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  return createPortal(<dialog ref={dialog} className="date-picker" aria-modal="true" aria-labelledby={`${id}-title`} onCancel={(event) => { event.preventDefault(); onCancel() }}
    onClick={(event) => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onCancel() } }}
    onKeyDown={(event) => {
      if (event.key !== 'Tab') return
      const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[tabindex="0"], button'))
      const first = nodes[0], last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }}>
    <header className="date-picker__header"><h2 id={`${id}-title`}>{label}</h2><p>{selected.day} {months[selected.month - 1]} {selected.year}</p></header>
    <div className="date-picker__wheels">
      {units.map((unit, index) => { const [lower, upper] = wheelBounds(selected, unit, min, max); return <Wheel key={unit} label={labels[unit]} value={selected[unit]} lower={lower} upper={upper} text={(n) => unit === 'month' ? months[n - 1] : String(n)} onChange={(n) => setDraft(clampDate({ ...selected, [unit]: n } as CivilDate, min, max))} onHorizontal={(direction) => dialog.current?.querySelectorAll<HTMLElement>('[role="spinbutton"]')[Math.max(0, Math.min(2, index + direction))]?.focus()} /> })}
    </div>
    <footer className="date-picker__actions"><button type="button" onClick={onCancel}>Cancelar</button><button type="button" className="date-picker__accept" onClick={() => onConfirm(formatDateValue(selected))}>Aceptar</button></footer>
  </dialog>, document.body)
}

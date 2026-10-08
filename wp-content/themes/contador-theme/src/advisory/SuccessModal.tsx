import { useEffect, useRef, type RefObject } from 'react'

interface Props {
  open: boolean
  instanceId: string
  onClose: () => void
  returnFocus: RefObject<HTMLButtonElement | null>
}
export function SuccessModal({ open, instanceId, onClose, returnFocus }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return
    const body = document.body
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const previous = { position: body.style.position, top: body.style.top, left: body.style.left, width: body.style.width, overflow: body.style.overflow, paddingRight: body.style.paddingRight }
    const gap = window.innerWidth - document.documentElement.clientWidth
    const padding = parseFloat(getComputedStyle(body).paddingRight) || 0
    Object.assign(body.style, { position: 'fixed', top: '-' + scrollY + 'px', left: '-' + scrollX + 'px', width: '100%', overflow: 'hidden', paddingRight: padding + gap + 'px' })
    dialog.showModal()
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      dialog.close()
      Object.assign(body.style, previous)
      const root = document.documentElement
      const behavior = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      window.scrollTo(scrollX, scrollY)
      root.style.scrollBehavior = behavior
      returnFocus.current?.focus({ preventScroll: true })
    }
  }, [open, returnFocus])
  return <dialog ref={dialogRef} className="advisory-success" role="dialog" aria-modal="true" aria-labelledby={instanceId + '-success-title'} aria-describedby={instanceId + '-success-description'}
    onCancel={event => { event.preventDefault(); onClose() }}
    onKeyDown={event => {
      if (event.key === 'Tab') { event.preventDefault(); closeRef.current?.focus() }
    }}>
    <span className="advisory-success__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
    </span>
    <h2 id={instanceId + '-success-title'}>Solicitud enviada</h2>
    <p id={instanceId + '-success-description'}>Tu solicitud se envió correctamente. Me pondré en contacto contigo lo antes posible.</p>
    <button ref={closeRef} className="btn btn-primary" type="button" onClick={onClose}>Cerrar</button>
  </dialog>
}

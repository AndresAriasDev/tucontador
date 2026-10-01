import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface InfoTooltipProps {
  id: string
  label: string
  title: string
  children: string
}

interface PopoverPosition {
  left: number
  top: number
}

export function InfoTooltip({ id, label, title, children }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<PopoverPosition | null>(null)
  const rootRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!isOpen) return

    function updatePosition() {
      const trigger = triggerRef.current
      if (!trigger) return

      const bounds = trigger.getBoundingClientRect()
      const popoverBounds = popoverRef.current?.getBoundingClientRect()
      const width = popoverBounds?.width ?? Math.min(352, window.innerWidth - 32)
      const left = Math.max(16, Math.min(bounds.left, window.innerWidth - width - 16))
      const estimatedHeight = popoverBounds?.height ?? Math.min(240, window.innerHeight - 32)
      let top = bounds.bottom + 8

      if (top + estimatedHeight > window.innerHeight - 16) {
        top = bounds.top - estimatedHeight - 8
      }

      setPosition({ left, top: Math.max(16, top) })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', closePopover, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', closePopover, true)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function closePopover() {
    setIsOpen(false)
  }

  return (
    <span className="info-tooltip" ref={rootRef}>
      <button
        ref={triggerRef}
        className="info-tooltip__trigger"
        type="button"
        aria-label={`Más información sobre ${label}`}
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true">!</span>
      </button>
      <div
        ref={popoverRef}
        className="info-tooltip__popover"
        id={id}
        role="note"
        aria-label={title}
        hidden={!isOpen}
        style={position ? { left: position.left, top: position.top } : undefined}
      >
        <h4>{title}</h4>
        <p>{children}</p>
      </div>
    </span>
  )
}

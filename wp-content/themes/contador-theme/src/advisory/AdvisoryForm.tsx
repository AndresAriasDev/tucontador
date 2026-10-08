import { useRef, useState, type FormEvent } from 'react'
import { fieldOrder, limits, normalize, services, situations, validate, type Errors, type Field, type RequestValues, type Service } from './validation'
import { SuccessModal } from './SuccessModal'
import { SubmissionError, type SubmitRequest } from './submission'

interface Props {
  instanceId: string
  initialService?: Service
  // Conectar únicamente a un backend que valide y procese la solicitud.
  submitRequest?: SubmitRequest
}
export function AdvisoryForm({ instanceId, initialService, submitRequest }: Props) {
  const emptyValues = (): RequestValues => ({ situation: '', service: initialService ?? '', name: '', email: '', phone: '', details: '' })
  const [values, setValues] = useState<RequestValues>(emptyValues)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [attempted, setAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const submittingRef = useRef(false)
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const serverFocusRef = useRef<Field | undefined>(undefined)
  const [status, setStatus] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const id = (field: Field) => instanceId + '-' + field
  const update = (field: Field, value: string) => {
    const next = { ...values, [field]: value }
    setValues(next)
    if (attempted || touched[field]) setErrors(previous => ({ ...previous, [field]: validate(next)[field] }))
    setStatus('')
  }
  const blur = (field: Field) => {
    setTouched(previous => ({ ...previous, [field]: true }))
    setErrors(previous => ({ ...previous, [field]: validate(values)[field] }))
  }
  const attrs = (field: Field) => ({
    id: id(field), name: field, required: true, disabled: isSubmitting,
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? id(field) + '-error' : undefined,
    onBlur: () => blur(field),
  })
  const error = (field: Field) => errors[field] ? <p className="advisory-form__error" id={id(field) + '-error'}>{errors[field]}</p> : null
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return
    setAttempted(true)
    const nextErrors = validate(values)
    setErrors(nextErrors)
    const first = fieldOrder.find(field => nextErrors[field])
    if (first) {
      formRef.current?.querySelector<HTMLElement>('[name="' + first + '"]')?.focus()
      return
    }
    if (!submitRequest) return
    submittingRef.current = true
    setIsSubmitting(true)
    setStatus('')
    try {
      const confirmation = await submitRequest(normalize(values), honeypotRef.current?.value ?? '')
      if (confirmation?.confirmed !== true) throw new Error('Recepción no confirmada.')
      setValues(emptyValues())
      setErrors({})
      setTouched({})
      setAttempted(false)
      if (honeypotRef.current) honeypotRef.current.value = ''
      setSuccessOpen(true)
    } catch (error) {
      if (error instanceof SubmissionError) {
        setErrors(error.fieldErrors)
        serverFocusRef.current = fieldOrder.find(field => error.fieldErrors[field])
        setStatus(error.message)
      } else {
        setStatus('No se pudo confirmar el envío. Tus datos permanecen en el formulario para que puedas intentarlo de nuevo.')
      }
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
      window.requestAnimationFrame(() => {
        if (serverFocusRef.current) formRef.current?.querySelector<HTMLElement>('[name="' + serverFocusRef.current + '"]')?.focus()
        serverFocusRef.current = undefined
      })
    }
  }
  return <><form className="advisory-form" ref={formRef} onSubmit={submit} noValidate aria-busy={isSubmitting}>
    {!submitRequest && <p className="advisory-form__notice" id={instanceId + '-notice'}>El envío de solicitudes todavía no está disponible. No se enviará ni guardará la información ingresada.</p>}
    <div className="advisory-form__fields">
      <div className="advisory-form__notice" aria-hidden="true">
        <label htmlFor={instanceId + '-website'}>Deja este campo vacío</label>
        <input ref={honeypotRef} id={instanceId + '-website'} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="advisory-form__wide"><label htmlFor={id('name')}>Nombre completo</label>
        <input {...attrs('name')} type="text" autoComplete="name" maxLength={limits.name} value={values.name} onChange={event => update('name', event.target.value)} />{error('name')}
      </div>
      <div><label htmlFor={id('phone')}>Celular</label>
        <input {...attrs('phone')} type="tel" autoComplete="tel" placeholder="Ej. 86687005" value={values.phone} onChange={event => update('phone', event.target.value)} />{error('phone')}
      </div>
      <div><label htmlFor={id('email')}>Correo</label>
        <input {...attrs('email')} type="email" autoComplete="email" maxLength={limits.email} value={values.email} onChange={event => update('email', event.target.value)} />{error('email')}
      </div>
      <div className="advisory-form__wide"><label htmlFor={id('situation')}>¿Cuál es tu situación actual?</label>
        <select {...attrs('situation')} value={values.situation} onChange={event => update('situation', event.target.value)}>
          <option value="">Selecciona una opción</option>{situations.map(value => <option key={value} value={value}>{value}</option>)}
        </select>{error('situation')}
      </div>
      <div className="advisory-form__wide"><label htmlFor={id('service')}>¿Qué servicio te interesa?</label>
        <select {...attrs('service')} value={values.service} onChange={event => update('service', event.target.value)}>
          <option value="">Selecciona un servicio</option>{services.map(value => <option key={value} value={value}>{value}</option>)}
        </select>{error('service')}
      </div>
      <div className="advisory-form__wide"><label htmlFor={id('details')}>Detalles de tu solicitud</label>
        <textarea {...attrs('details')} rows={5} maxLength={limits.details} placeholder="Cuéntame brevemente qué necesitas resolver..." value={values.details} onChange={event => update('details', event.target.value)} />{error('details')}
      </div>
    </div>
    <div className="advisory-form__actions"><button ref={submitButtonRef} className="btn btn-primary" type="submit" disabled={!submitRequest || isSubmitting} aria-busy={isSubmitting} aria-label={isSubmitting ? 'Enviando solicitud...' : undefined} aria-describedby={!submitRequest ? instanceId + '-notice' : undefined}>{isSubmitting ? <span className="advisory-form__spinner" aria-hidden="true" /> : 'Enviar solicitud'}</button></div>
    <p className="advisory-form__status" role="status" aria-live="polite">{status}</p>
    <span className="advisory-form__notice" role="status">{isSubmitting ? 'Enviando solicitud...' : ''}</span>
  </form>
  <SuccessModal open={successOpen} instanceId={instanceId} onClose={() => setSuccessOpen(false)} returnFocus={submitButtonRef} /></>
}

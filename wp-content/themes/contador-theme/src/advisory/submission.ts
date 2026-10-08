import type { Errors, Field, RequestValues } from './validation'

export interface SubmissionConfirmation { confirmed: true }
export type SubmitRequest = (values: RequestValues, website?: string) => Promise<SubmissionConfirmation>
export class SubmissionError extends Error {
  fieldErrors: Errors
  constructor(message: string, fieldErrors: Errors = {}) {
    super(message)
    this.fieldErrors = fieldErrors
  }
}

/**
 * No configura una ruta ni presupone el contrato de WordPress.
 * El integrador debe proporcionar la URL real y verificar el cuerpo de confirmación.
 */
export function createSubmitRequest(config: {
  endpoint: string
  headers?: Record<string, string>
  confirmsReceipt: (body: unknown) => boolean
}): SubmitRequest {
  return async (values, website = '') => {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { ...config.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, website }),
    })
    const body: unknown = await response.json()
    if (!response.ok) {
      const errors: Errors = {}
      if (typeof body === 'object' && body !== null && 'errors' in body && typeof body.errors === 'object' && body.errors !== null) {
        for (const field of ['name', 'phone', 'email', 'situation', 'service', 'details'] as Field[]) {
          const message = (body.errors as Record<string, unknown>)[field]
          if (typeof message === 'string') errors[field] = message
        }
      }
      const message = response.status === 429 ? 'Has realizado varias solicitudes. Espera unos minutos antes de reintentar.' : Object.keys(errors).length ? 'Revisa los campos indicados.' : 'No se pudo confirmar el envío. Inténtalo de nuevo más tarde.'
      throw new SubmissionError(message, errors)
    }
    if (!config.confirmsReceipt(body)) throw new Error('Recepción no confirmada.')
    return { confirmed: true }
  }
}

export const situations = ['Tengo un negocio en funcionamiento', 'Quiero registrar o iniciar un negocio', 'Soy una persona natural', 'Soy profesional independiente', 'Otra situación'] as const
export const services = ['Servicios contables', 'Declaraciones de impuestos', 'Asesoría contable y tributaria'] as const
export type Service = typeof services[number]
export interface RequestValues { situation: string; service: string; name: string; email: string; phone: string; details: string }
export type Field = keyof RequestValues
export type Errors = Partial<Record<Field, string>>
export const fieldOrder: Field[] = ['name', 'phone', 'email', 'situation', 'service', 'details']
export const limits = { name: 100, email: 254, details: 2000 }
const compactSpaces = (value: string) => value.trim().replace(/\s+/gu, ' ')
export function normalize(values: RequestValues): RequestValues {
  return { ...values, name: compactSpaces(values.name).normalize('NFC'), phone: values.phone.replace(/\s/gu, ''), email: values.email.trim(), details: compactSpaces(values.details) }
}
export function validate(values: RequestValues): Errors {
  const errors: Errors = {}
  const clean = normalize(values)
  if (!clean.name) errors.name = 'Escribe tu nombre completo.'
  else if (clean.name.length < 3 || clean.name.length > limits.name) errors.name = 'El nombre debe tener entre 3 y 100 caracteres.'
  else if (!/^[\p{L}\p{M}]+(?:[ .’'\-][\p{L}\p{M}]+)*\.?$/u.test(clean.name)) errors.name = 'Escribe un nombre válido, sin números ni símbolos ajenos al nombre.'
  if (!clean.phone) errors.phone = 'Escribe tu número de celular.'
  else if (!/^[0-9]{8}$/.test(clean.phone)) errors.phone = 'El celular debe contener 8 dígitos, sin letras ni prefijo. Puedes usar espacios.'
  if (!clean.email) errors.email = 'Escribe tu correo electrónico.'
  else if (clean.email.length > limits.email || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/u.test(clean.email)) errors.email = 'Escribe un correo electrónico válido de hasta 254 caracteres.'
  if (!situations.some(value => value === clean.situation)) errors.situation = 'Selecciona una situación válida.'
  if (!services.some(value => value === clean.service)) errors.service = 'Selecciona un servicio válido.'
  if (!clean.details) errors.details = 'Cuéntame los detalles de tu solicitud.'
  else if (clean.details.length < 10 || clean.details.length > limits.details) errors.details = 'La solicitud debe tener entre 10 y 2000 caracteres de contenido.'
  return errors
}

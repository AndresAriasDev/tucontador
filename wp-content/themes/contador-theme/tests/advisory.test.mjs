import test from 'node:test'
import assert from 'node:assert/strict'
import { normalize, validate, services, situations, fieldOrder } from '../src/advisory/validation.ts'
import { createSubmitRequest, SubmissionError } from '../src/advisory/submission.ts'

const valid = { name: 'María José Muñoz', phone: '8668 7005', email: 'maria+consulta@example.com', situation: situations[0], service: services[0], details: 'Necesito organizar mis registros contables.' }
test('normalización, acentos y campos válidos', () => {
  assert.deepEqual(validate(valid), {})
  assert.equal(normalize({ ...valid, name: '  María   José Muñoz  ' }).name, valid.name)
  assert.equal(normalize(valid).phone, '86687005')
  assert.equal(normalize({ ...valid, email: '  maria@example.com  ' }).email, 'maria@example.com')
  for (const name of ["Ana O'Neill", 'Jean-Luc Pérez', 'Peña', 'José de la Cruz']) assert.equal(validate({ ...valid, name }).name, undefined)
})
test('obligatorios, límites y orden del foco', () => {
  const errors = validate(Object.fromEntries(fieldOrder.map(field => [field, '   '])))
  assert.equal(Object.keys(errors).length, 6)
  assert.equal(fieldOrder.find(field => errors[field]), 'name')
  for (const [field, value] of [
    ['name', 'Li'], ['name', 'A'.repeat(101)], ['name', '1234'], ['name', '***'],
    ['phone', '1234567'], ['phone', '123456789'], ['phone', '+50586687005'], ['phone', '8668abcd'],
    ['email', 'a@@example.com'], ['email', 'a'.repeat(250) + '@example.com'],
    ['situation', 'desconocida'], ['service', 'otro'],
    ['details', '  corto  '], ['details', 'a'.repeat(2001)],
  ]) assert.ok(validate({ ...valid, [field]: value })[field], field + ': ' + value)
  assert.equal(validate({ ...valid, details: 'a'.repeat(10) }).details, undefined)
  assert.equal(validate({ ...valid, details: 'a'.repeat(2000) }).details, undefined)
  assert.equal(validate({ ...valid, name: 'A'.repeat(100) }).name, undefined)
})
test('transporte exige HTTP correcto y confirmación explícita; no simula éxito', async () => {
  const original = globalThis.fetch
  const send = createSubmitRequest({ endpoint: '/test-only', confirmsReceipt: body => body?.accepted === true })
  try {
    globalThis.fetch = async () => ({ ok: false })
    await assert.rejects(send(valid))
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ accepted: false }) })
    await assert.rejects(send(valid))
    globalThis.fetch = async () => { throw new Error('network') }
    await assert.rejects(send(valid))
    let resolveRequest
    let settled = false
    globalThis.fetch = () => new Promise(resolve => { resolveRequest = resolve })
    const pending = send(valid).then(result => { settled = true; return result })
    await Promise.resolve()
    assert.equal(settled, false)
    resolveRequest({ ok: true, json: async () => ({ accepted: true }) })
    assert.deepEqual(await pending, { confirmed: true })
  } finally { globalThis.fetch = original }
})
test('contrato REST: honeypot, errores por campo, límite y respuesta inválida', async () => {
  const original = globalThis.fetch
  const send = createSubmitRequest({ endpoint: '/test-only', confirmsReceipt: body => body?.accepted === true })
  try {
    globalThis.fetch = async (_url, options) => {
      assert.equal(JSON.parse(options.body).website, '')
      assert.equal(options.method, 'POST')
      return { ok: false, status: 422, json: async () => ({ errors: { phone: 'Celular inválido', unknown: 'ignorar' } }) }
    }
    await assert.rejects(send(valid), error => error instanceof SubmissionError && error.fieldErrors.phone === 'Celular inválido' && !('unknown' in error.fieldErrors))
    globalThis.fetch = async () => ({ ok: false, status: 429, json: async () => ({}) })
    await assert.rejects(send(valid), /Espera unos minutos/)
    globalThis.fetch = async () => ({ ok: true, json: async () => { throw new Error('JSON inválido') } })
    await assert.rejects(send(valid))
  } finally { globalThis.fetch = original }
})

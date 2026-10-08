import { createRoot } from 'react-dom/client'
import { AdvisoryForm } from './AdvisoryForm'
import { services } from './validation'
import { createSubmitRequest } from './submission'

document.querySelectorAll<HTMLElement>('[data-advisory-form]').forEach(element => {
  const initialService = services.find(service => service === element.dataset.service)
  const submitRequest = element.dataset.endpoint ? createSubmitRequest({
    endpoint: element.dataset.endpoint,
    confirmsReceipt: body => typeof body === 'object' && body !== null && 'accepted' in body && body.accepted === true,
  }) : undefined
  createRoot(element).render(<AdvisoryForm instanceId={element.id} initialService={initialService} submitRequest={submitRequest} />)
})

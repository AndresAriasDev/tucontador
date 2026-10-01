import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CalculatorApp } from './components/CalculatorApp'
import './calculator.css'

const rootElement = document.getElementById('tucontador-calculator')

if (rootElement) {
  const calculator = rootElement.dataset.calculator ?? ''
  createRoot(rootElement).render(
    <StrictMode>
      <CalculatorApp calculator={calculator} />
    </StrictMode>,
  )
}

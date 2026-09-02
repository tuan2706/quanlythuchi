import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { FinanceProvider } from './context/FinanceContext.tsx'
import { MascotToastProvider } from './components/mascot/MascotToast.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <FinanceProvider>
        <MascotToastProvider>
          <App />
        </MascotToastProvider>
      </FinanceProvider>
    </BrowserRouter>
  </StrictMode>,
)

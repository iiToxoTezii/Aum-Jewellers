import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { QueryProvider } from './context/QueryProvider'
import ErrorBoundary from './components/ErrorBoundary'

console.log("main.jsx: Root rendering starting...");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

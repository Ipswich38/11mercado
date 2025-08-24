import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import SimpleApp from './SimpleApp.tsx'
import './index.css'

console.log('Main.tsx executing...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
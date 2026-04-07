import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from './components/ui/toaster.jsx'
import { HashRouter, Routes } from 'react-router-dom'


ReactDOM.createRoot(document.getElementById('root')).render(
  
  <> 
      <HashRouter>
        <App />
        <Toaster/>
      </HashRouter>
  </>,
)

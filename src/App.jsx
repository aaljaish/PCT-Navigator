import React from 'react'
import Sidebar from './components/Sidebar.jsx'
import PICOForm from './modules/pico/PICOForm.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main id="main" className="flex-1 p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-4">PICO-T Wizard</h1>
        <PICOForm />
      </main>
    </div>
  )
}

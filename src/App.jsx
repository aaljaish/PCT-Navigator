import { useState, useMemo } from 'react'
import Sidebar from './components/Sidebar.jsx'
import PICOForm from './modules/pico/PICOForm.jsx'

export default function App() {
  // Minimal "routing-ready" module registry
  const modules = useMemo(
    () => [
      { id: 'pico', label: 'PICO-T', component: PICOForm }
      // Future: { id: 'stakeholders', label: 'Stakeholders', component: Stakeholders }
    ],
    []
  )

  const [activeId, setActiveId] = useState('pico')
  const [mobileOpen, setMobileOpen] = useState(false)

  const ActiveComponent = modules.find((m) => m.id === activeId)?.component ?? (() => null)

  return (
    <div className="min-h-screen lg:flex lg:gap-0">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white lg:hidden">
        <h1 className="text-lg font-semibold text-primary">PCT Wizard</h1>
        <button
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-controls="sidebar"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="sr-only">Toggle navigation</span>
          ☰ Menu
        </button>
      </header>

      <Sidebar
        id="sidebar"
        modules={modules}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id)
          setMobileOpen(false)
        }}
        mobileOpen={mobileOpen}
      />

      {/* Main content */}
      <main id="main" className="flex-1 px-4 py-6 lg:pl-72">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <p className="text-sm font-medium text-secondary tracking-wide uppercase">Pragmatic Clinical Trial Wizard</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {modules.find((m) => m.id === activeId)?.label}
            </h2>
            <p className="mt-2 text-gray-600">
              Enter core details for your trial question. Your progress auto-saves. You can edit the composed question at any time.
            </p>
          </div>

          <section className="bg-white border rounded-2xl shadow-sm p-4 sm:p-6">
            <ActiveComponent />
          </section>
        </div>
      </main>
    </div>
  )
}

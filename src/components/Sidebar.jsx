export default function Sidebar({ id = 'sidebar', modules = [], activeId, onSelect, mobileOpen }) {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/30 z-30 lg:hidden ${mobileOpen ? 'block' : 'hidden'}`}
        aria-hidden="true"
      ></div>

      <nav
        id={id}
        aria-label="Primary"
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-white border-r shadow-sm transform transition-transform duration-200 lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:fixed lg:z-auto`}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-4 border-b">
            <div className="text-xl font-bold text-primary">PCT Wizard</div>
            <p className="text-xs text-gray-500">v0</p>
          </div>

          <ul className="flex-1 p-3 space-y-1">
            {modules.map((m) => {
              const isActive = m.id === activeId
              return (
                <li key={m.id}>
                  <button
                    onClick={() => onSelect?.(m.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full text-left px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                      ${isActive ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-800'}`}
                  >
                    {m.label}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="p-3 border-t text-xs text-gray-500">
            <p>
              Primary: <span className="inline-block w-3 h-3 align-middle rounded-sm bg-primary"></span> #006a78
            </p>
            <p>
              Secondary: <span className="inline-block w-3 h-3 align-middle rounded-sm bg-secondary"></span> #1eaeba
            </p>
          </div>
        </div>
      </nav>
    </>
  )
}

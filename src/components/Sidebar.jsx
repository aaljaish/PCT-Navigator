import React from 'react'

export default function Sidebar() {
  return (
    <aside className="w-64 p-4 bg-white shadow">
      <nav>
        <h2 className="text-lg font-semibold mb-2">Navigation</h2>
        <ul className="space-y-1">
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              PICO-T
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase'
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  CalendarDays,
  BarChart3,
  LogOut,
  Stethoscope,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/kanban', label: 'Kanban', icon: KanbanSquare },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname === '/login') return null

  async function handleLogout() {
    await getSupabaseBrowser().auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2.5 rounded-xl shadow-lg border border-gray-200"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X size={20} className="text-[#0f3b5e]" /> : <Menu size={20} className="text-[#0f3b5e]" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky inset-y-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-out shadow-sm ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-[#0f3b5e] p-2.5 rounded-xl shadow-sm">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                BotLibertad
              </h1>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
                CRM Clínica
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0f3b5e] text-white shadow-md shadow-[#0f3b5e]/20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors duration-150 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span className="flex-1">{link.label}</span>
                {isActive && (
                  <ChevronRight size={14} className="text-white/60" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 w-full transition-all duration-150"
          >
            <LogOut size={18} className="text-gray-400" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}

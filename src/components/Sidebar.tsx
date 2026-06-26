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
} from 'lucide-react'
import { useSidebar } from '@/lib/sidebar-context'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/kanban', label: 'Kanban', icon: KanbanSquare },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { open, setOpen } = useSidebar()

  if (pathname === '/login') return null

  async function handleLogout() {
    await getSupabaseBrowser().auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          h-screen bg-white border-r border-gray-200 flex flex-col
          transition-all duration-300 ease-in-out overflow-hidden shrink-0
          ${open ? 'w-64' : 'w-0'}
          lg:w-64
        `}
      >
        <div className="p-6 border-b border-gray-100 min-w-64 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Stethoscope size={20} className="text-[#0f3b5e] shrink-0" />
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                CRM Instituto Libertad
              </h1>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
                Clínica de Fonoaudiologia
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto min-w-64">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#eef2f7] text-[#0f3b5e] font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-[#0f3b5e]' : 'text-gray-400'}`} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 min-w-64">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 w-full transition-all duration-150"
          >
            <LogOut size={18} className="text-gray-400 shrink-0" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}

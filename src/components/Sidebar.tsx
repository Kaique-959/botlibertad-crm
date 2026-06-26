'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await getSupabaseBrowser().auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-md"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#1a2744] text-white flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Stethoscope size={24} className="text-green-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">BotLibertad</h1>
              <p className="text-xs text-white/60">CRM Clínica</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 w-full transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}

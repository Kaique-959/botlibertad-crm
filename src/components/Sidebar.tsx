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
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2.5 rounded-xl shadow-md border border-[#eae7e2]"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X size={20} className="text-[#0f3b5e]" /> : <Menu size={20} className="text-[#0f3b5e]" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-[#0f3b5e]/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0f3b5e] flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-7 border-b border-white/8">
          <div className="flex items-center gap-3.5">
            <div className="bg-white/10 p-2.5 rounded-xl">
              <Stethoscope size={22} className="text-[#2dd4bf]" />
            </div>
            <div>
              <h1 className="text-lg leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                BotLibertad
              </h1>
              <p className="text-[11px] text-white/50 font-medium tracking-wide uppercase">CRM Clínica</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3.5 space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/55 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={active ? 'text-[#2dd4bf]' : ''} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3.5 border-t border-white/8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 w-full transition-all duration-200"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}

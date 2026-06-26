'use client'

import { usePathname } from 'next/navigation'
import { useSidebar } from '@/lib/sidebar-context'
import { Menu } from 'lucide-react'

export function MenuToggle() {
  const pathname = usePathname()
  const { open, setOpen } = useSidebar()

  if (pathname === '/login') return null

  return (
    <button
      className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2.5 rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      onClick={() => setOpen(!open)}
      aria-label={open ? 'Fechar menu' : 'Abrir menu'}
    >
      <Menu size={20} className="text-[#0f3b5e]" />
    </button>
  )
}

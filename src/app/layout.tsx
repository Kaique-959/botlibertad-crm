import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import ToasterProvider from '@/components/ToasterProvider'
import { SidebarProvider } from '@/lib/sidebar-context'
import { MenuToggle } from '@/components/MenuToggle'

export const metadata: Metadata = {
  title: 'CRM Instituto Libertad',
  description: 'Sistema de gestão para clínica de audiologia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ToasterProvider />
        <SidebarProvider>
          <div className="flex min-h-screen bg-gray-50 relative">
            <Sidebar />
            <MenuToggle />
            <main className="flex-1 min-w-0">
              <div className="pt-16 lg:pt-0 p-6 lg:p-10 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import ToasterProvider from '@/components/ToasterProvider'

export const metadata: Metadata = {
  title: 'BotLibertad CRM',
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
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-0 lg:ml-64 min-h-screen bg-[#faf9f7]">
            <div className="p-6 lg:p-10 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}

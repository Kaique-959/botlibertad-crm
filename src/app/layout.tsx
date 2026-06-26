import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import ToasterProvider from '@/components/ToasterProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BotLibertad CRM',
  description: 'CRM para clínica de audiologia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ToasterProvider />
        <div className="min-h-screen flex">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 min-h-screen bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Footer } from '@/components/common/Footer'
import { Header } from '@/components/common/Header'
import './globals.css'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Aluguéis Costa-Rica | Encontre seu próximo lar',
    template: '%s | Aluguéis Costa-Rica',
  },
  description: 'Encontre casas, apartamentos e imóveis para alugar. Fale diretamente com proprietários pelo WhatsApp.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Aluguéis Costa-Rica',
  },
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-sand antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

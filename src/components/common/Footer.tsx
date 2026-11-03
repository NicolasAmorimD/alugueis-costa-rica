import Link from 'next/link'
import { Home } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="page-shell flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-forest-900">
          <Home size={18} />
          Aluguéis Costa-Rica
        </Link>
        <p className="text-xs text-slate-500">Encontre seu próximo lugar para chamar de lar.</p>
        <Link href="/anunciar" className="text-sm font-semibold text-forest-700 hover:text-forest-900">
          Anuncie gratuitamente
        </Link>
      </div>
    </footer>
  )
}

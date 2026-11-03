import Link from 'next/link'
import { Home, Plus } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-forest-900/5 bg-white/95 backdrop-blur">
      <div className="page-shell flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Aluguéis Costa-Rica, início">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-900 text-white">
            <Home size={21} strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-bold leading-tight tracking-tight text-forest-900">
            Aluguéis
            <span className="block text-xs font-medium tracking-wide text-forest-600">COSTA-RICA</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/#imoveis" className="hidden text-sm font-medium text-slate-600 transition hover:text-forest-700 sm:block">
            Encontrar imóvel
          </Link>
          <Link href="/anunciar" className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-700">
            <Plus size={17} />
            <span className="hidden sm:inline">Anunciar imóvel</span>
            <span className="sm:hidden">Anunciar</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

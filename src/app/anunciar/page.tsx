import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { CreatePropertyForm } from '@/components/properties/CreatePropertyForm'

export const metadata: Metadata = {
  title: 'Anuncie seu imóvel',
  description: 'Publique gratuitamente seu imóvel para alugar e receba contatos direto pelo WhatsApp.',
}

export default function AnnouncePage() {
  return (
    <div className="page-shell max-w-3xl py-10 sm:py-14">
      <div className="mb-9">
        <p className="eyebrow">É simples e gratuito</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest-900 sm:text-4xl">Anuncie seu imóvel</h1>
        <p className="mt-3 max-w-xl leading-7 text-slate-600">Preencha os detalhes e conecte-se com pessoas procurando um lugar para morar.</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-forest-600" /> Sem taxas para publicar</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-forest-600" /> Contato direto pelo WhatsApp</span>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
        <CreatePropertyForm />
      </div>
    </div>
  )
}

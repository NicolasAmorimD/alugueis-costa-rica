import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { ArrowDown, ArrowRight, KeyRound, MapPin, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { PropertyFilters } from '@/components/properties/PropertyFilters'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { db } from '@/lib/db'
import { propertyFilterSchema } from '@/schemas/property.schema'

export const metadata: Metadata = {
  title: 'Aluguel de imóveis em Costa-Rica',
  description: 'Casas e apartamentos para alugar. Pesquise por bairro e fale diretamente com o anunciante.',
}

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams
  const input = Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  )
  const parsed = propertyFilterSchema.safeParse(input)
  const filters = parsed.success ? parsed.data : propertyFilterSchema.parse({})

  const where: Prisma.PropertyWhereInput = { status: 'AVAILABLE' }
  if (filters.neighborhood) where.neighborhood = { contains: filters.neighborhood, mode: 'insensitive' }
  if (filters.propertyType) where.propertyType = filters.propertyType
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    }
  }
  if (filters.bedrooms !== undefined) where.bedrooms = { gte: filters.bedrooms }
  const skip = (filters.page - 1) * filters.limit

  const [properties, total] = await Promise.all([
    db.property.findMany({
      where,
      omit: { managementTokenHash: true },
      include: { images: true },
      skip,
      take: filters.limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.property.count({ where }),
  ])
  const totalPages = Math.ceil(total / filters.limit)

  return (
    <>
      <section className="relative overflow-hidden bg-forest-900 text-white">
        <div className="absolute -right-32 -top-40 h-[480px] w-[480px] rounded-full border border-white/10" />
        <div className="absolute -right-16 -top-24 h-[320px] w-[320px] rounded-full border border-white/10" />
        <div className="page-shell relative grid min-h-[410px] items-center gap-8 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
              <MapPin size={13} /> Um novo jeito de morar bem
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
              Seu próximo lar está <span className="text-emerald-300">mais perto.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-emerald-50/80">
              Encontre imóveis para alugar na sua região e converse diretamente com quem anuncia.
            </p>
            <Link href="#imoveis" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-forest-900 transition hover:bg-emerald-50">
              Explorar imóveis <ArrowDown size={16} />
            </Link>
          </div>
          <div className="hidden justify-self-end md:block">
            <div className="relative w-[340px] rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl">
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1.5rem] bg-[linear-gradient(145deg,#d8c6a9,#79977c_50%,#284b39)]">
                <div className="m-8 rounded-2xl border border-white/30 bg-white/15 p-5 text-white backdrop-blur-sm">
                  <KeyRound size={32} />
                  <p className="mt-4 text-2xl font-semibold">Um lugar seu.</p>
                  <p className="mt-1 text-sm text-white/80">Novas possibilidades começam em casa.</p>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-8 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-forest-900 shadow-xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-50 text-forest-700"><ShieldCheck size={19} /></span>
                <span><strong className="block text-sm">Contato direto</strong><small className="text-xs text-slate-500">Sem complicação</small></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell relative z-10 -mt-7">
        <Suspense fallback={<div className="h-20 animate-pulse rounded-2xl bg-white shadow-soft" />}>
          <PropertyFilters />
        </Suspense>
      </section>

      <section id="imoveis" className="page-shell scroll-mt-24 py-14 sm:py-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Para chamar de seu</p>
            <h2 className="section-title mt-2 text-3xl">Imóveis para alugar</h2>
            <p className="mt-2 text-sm text-slate-500">{total} {total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}</p>
          </div>
          <Link href="/anunciar" className="hidden items-center gap-2 text-sm font-semibold text-forest-700 hover:text-forest-900 sm:inline-flex">
            Tem um imóvel? Anuncie <ArrowRight size={16} />
          </Link>
        </div>

        {properties.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-forest-700"><MapPin size={21} /></div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Nenhum imóvel encontrado</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Tente mudar os filtros ou volte mais tarde. Você também pode anunciar um imóvel para começar.</p>
            <Link href="/anunciar" className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-700">Anunciar imóvel <ArrowRight size={15} /></Link>
          </div>
        )}
        {totalPages > 1 && <nav aria-label="Paginação" className="mt-8 flex justify-center gap-2">{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => { const next = new URLSearchParams(input); next.set('page', String(page)); return <Link key={page} href={`/?${next.toString()}#imoveis`} aria-current={page === filters.page ? 'page' : undefined} className={`rounded-lg px-4 py-2 text-sm font-semibold ${page === filters.page ? 'bg-forest-900 text-white' : 'bg-white text-slate-700 hover:bg-forest-50'}`}>{page}</Link> })}</nav>}
      </section>
    </>
  )
}

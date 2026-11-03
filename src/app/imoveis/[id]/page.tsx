import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Bath, Bed, Car, Check, MapPin, MessageCircle, PawPrint } from 'lucide-react'
import { db } from '@/lib/db'
import { formatPrice, whatsappLink } from '@/lib/format'
import { PropertyManagement } from '@/components/properties/PropertyManagement'

type PropertyPageProps = { params: Promise<{ id: string }> }

async function findProperty(id: string) {
  return db.property.findUnique({ where: { id }, include: { images: true } })
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { id } = await params
  const property = await findProperty(id)
  if (!property) return { title: 'Imóvel não encontrado' }
  return {
    title: property.title,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: property.images[0]?.url ? [property.images[0].url] : [],
      type: 'article',
    },
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params
  const property = await findProperty(id)
  if (!property || property.status === 'INACTIVE') notFound()
  const whatsapp = whatsappLink(
    property.whatsappNumber,
    `Olá! Vi o anúncio "${property.title}" (ref. ${property.id.slice(0, 8)}) no Aluguéis Costa-Rica e gostaria de agendar uma visita.`,
  )

  return (
    <div className="page-shell py-8 sm:py-12">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-forest-700"><ArrowLeft size={16} /> Voltar para os imóveis</Link>
      {property.status === 'RENTED' && <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Este imóvel já foi alugado.</p>}
      <div className="grid gap-7 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {property.images.map((image, index) => (
              <div key={image.id} className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 ${index === 0 ? 'sm:col-span-2 sm:aspect-[1.8]' : ''}`}>
                <Image src={image.url} alt={`${property.title} — foto ${index + 1}`} fill priority={index === 0} sizes={index === 0 ? '(max-width: 640px) 100vw, 70vw' : '(max-width: 640px) 100vw, 35vw'} className="object-cover" />
              </div>
            ))}
          </div>
          <section className="mt-8">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><MapPin size={16} className="text-forest-600" />{property.neighborhood}</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest-900">{property.title}</h1>
            <p className="mt-5 whitespace-pre-line leading-7 text-slate-600">{property.description}</p>
          </section>
        </div>
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-soft lg:sticky lg:top-24">
          <p className="text-sm font-medium text-slate-500">Aluguel mensal</p>
          <p className="mt-1 text-3xl font-bold text-forest-700">{formatPrice(property.price.toString())}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-sand p-3"><Bed size={18} className="text-forest-700" /><p className="mt-2 text-sm font-bold text-slate-800">{property.bedrooms} quartos</p></div>
            <div className="rounded-xl bg-sand p-3"><Bath size={18} className="text-forest-700" /><p className="mt-2 text-sm font-bold text-slate-800">{property.bathrooms} banheiros</p></div>
            <div className="rounded-xl bg-sand p-3"><Car size={18} className="text-forest-700" /><p className="mt-2 text-sm font-bold text-slate-800">{property.parkingSpots} vagas</p></div>
            <div className="rounded-xl bg-sand p-3">{property.petsAllowed ? <PawPrint size={18} className="text-forest-700" /> : <Check size={18} className="text-forest-700" />}<p className="mt-2 text-sm font-bold text-slate-800">{property.petsAllowed ? 'Aceita pets' : 'Consulte pets'}</p></div>
          </div>
          {property.status === 'AVAILABLE' ? (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3.5 font-semibold text-white transition hover:bg-forest-900"><MessageCircle size={18} /> Conversar pelo WhatsApp</a>
          ) : <p className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-500">Anúncio indisponível</p>}
          <p className="mt-3 text-center text-xs text-slate-500">Fale diretamente com o anunciante.</p>
          <PropertyManagement propertyId={property.id} status={property.status} />
        </aside>
      </div>
    </div>
  )
}

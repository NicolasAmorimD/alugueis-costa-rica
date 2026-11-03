import Image from 'next/image'
import Link from 'next/link'
import { Bath, Bed, Car, MapPin, MessageCircle } from 'lucide-react'
import { formatPrice, whatsappLink } from '@/lib/format'
import type { PropertyWithImages } from '@/types/property'

const propertyTypeLabels = {
  HOUSE: 'Casa',
  APARTMENT: 'Apartamento',
  KITNET: 'Kitnet',
  COMMERCIAL: 'Comercial',
} as const

export function PropertyCard({ property }: { property: PropertyWithImages }) {
  const cover = property.images[0]?.url
  const contactLink = whatsappLink(
    property.whatsappNumber,
    `Olá! Vi o anúncio "${property.title}" no Aluguéis Costa-Rica e gostaria de mais informações.`,
  )

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/imoveis/${property.id}`} className="relative block aspect-[1.42] overflow-hidden bg-slate-100">
        {cover ? (
          <Image
            src={cover}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">Foto indisponível</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-forest-900 shadow-sm">
          {propertyTypeLabels[property.propertyType]}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <MapPin size={14} className="text-forest-600" />
          <span className="truncate">{property.neighborhood}</span>
        </div>
        <Link href={`/imoveis/${property.id}`} className="line-clamp-1 text-base font-bold text-slate-900 hover:text-forest-700">
          {property.title}
        </Link>
        <p className="mt-2 text-xl font-bold tracking-tight text-forest-700">
          {formatPrice(property.price.toString())}
          <span className="ml-1 text-xs font-medium text-slate-500">/ mês</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5"><Bed size={15} className="text-slate-400" />{property.bedrooms} quartos</span>
          <span className="inline-flex items-center gap-1.5"><Bath size={15} className="text-slate-400" />{property.bathrooms} banheiros</span>
          <span className="inline-flex items-center gap-1.5"><Car size={15} className="text-slate-400" />{property.parkingSpots} vagas</span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link href={`/imoveis/${property.id}`} className="rounded-lg border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Ver detalhes
          </Link>
          <a href={contactLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-forest-700 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-900">
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
      </div>
    </article>
  )
}

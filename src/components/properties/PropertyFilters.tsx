'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [neighborhood, setNeighborhood] = useState(searchParams.get('neighborhood') ?? '')
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (neighborhood.trim()) params.set('neighborhood', neighborhood.trim())
    if (propertyType) params.set('propertyType', propertyType)
    if (maxPrice) params.set('maxPrice', maxPrice)
    router.push(`/?${params.toString()}#imoveis`)
  }

  function clearFilters() {
    setNeighborhood('')
    setPropertyType('')
    setMaxPrice('')
    router.push('/#imoveis')
  }

  return (
    <form onSubmit={applyFilters} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-soft sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:p-4">
      <label className="relative">
        <span className="sr-only">Bairro</span>
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} placeholder="Bairro ou cidade" className="form-input pl-10" />
      </label>
      <label>
        <span className="sr-only">Tipo de imóvel</span>
        <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)} className="form-input">
          <option value="">Todos os tipos</option>
          <option value="HOUSE">Casa</option>
          <option value="APARTMENT">Apartamento</option>
          <option value="KITNET">Kitnet</option>
          <option value="COMMERCIAL">Comercial</option>
        </select>
      </label>
      <label>
        <span className="sr-only">Aluguel máximo</span>
        <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Aluguel máximo" className="form-input" />
      </label>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <button type="submit" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-forest-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest-700">
          <SlidersHorizontal size={16} /> Buscar
        </button>
        <button type="button" onClick={clearFilters} className="rounded-xl px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
          Limpar
        </button>
      </div>
    </form>
  )
}

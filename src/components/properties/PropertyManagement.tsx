'use client'

import { useEffect, useState } from 'react'
import { LoaderCircle, Settings2 } from 'lucide-react'

type PropertyManagementProps = {
  propertyId: string
  status: 'AVAILABLE' | 'RENTED' | 'INACTIVE'
}

export function PropertyManagement({ propertyId, status }: PropertyManagementProps) {
  const [token, setToken] = useState('')
  const [nextStatus, setNextStatus] = useState(status)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setToken(window.localStorage.getItem(`property-management:${propertyId}`) ?? '')
  }, [propertyId])

  if (!token) return null

  async function saveStatus() {
    setIsSaving(true)
    setMessage('')
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Não foi possível atualizar o anúncio.')
      setMessage('Status atualizado.')
      window.location.reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro inesperado ao atualizar o status.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mt-7 border-t border-slate-100 pt-5">
      <label className="form-label inline-flex items-center gap-2"><Settings2 size={16} /> Gerenciar anúncio</label>
      <div className="flex gap-2">
        <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as PropertyManagementProps['status'])} className="form-input">
          <option value="AVAILABLE">Disponível</option>
          <option value="RENTED">Alugado</option>
        </select>
        <button type="button" onClick={() => void saveStatus()} disabled={isSaving || nextStatus === status} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {isSaving && <LoaderCircle size={15} className="animate-spin" />} Salvar
        </button>
      </div>
      {message && <p role="status" className="mt-2 text-xs text-slate-600">{message}</p>}
    </div>
  )
}

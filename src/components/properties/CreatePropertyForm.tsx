'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, LoaderCircle, X } from 'lucide-react'

type UploadedImage = { url: string; key: string; deleteUrl: string }
type UploadResponse = { uploadUrl: string; deleteUrl: string; imageUrl: string; key: string; error?: string }

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('Não foi possível preparar esta imagem para envio.')
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const compressed = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Não foi possível comprimir esta imagem.'))),
      'image/jpeg',
      0.82,
    )
  })
  return new File([compressed], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
}

export function CreatePropertyForm() {
  const router = useRouter()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function deleteUploadedImages(imagesToDelete: UploadedImage[]) {
    await Promise.allSettled(
      imagesToDelete.map((image) => fetch(image.deleteUrl, { method: 'DELETE' })),
    )
  }

  async function removeImage(image: UploadedImage) {
    setError('')
    try {
      const response = await fetch(image.deleteUrl, { method: 'DELETE' })
      if (!response.ok) throw new Error('NÃ£o foi possÃ­vel remover a foto. Tente novamente.')
      setImages((current) => current.filter((item) => item.key !== image.key))
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Erro inesperado ao remover a foto.')
    }
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return
    setError('')
    setUploading(true)
    const uploadedThisAttempt: UploadedImage[] = []
    try {
      const selected = Array.from(files)
      if (images.length + selected.length > 10) throw new Error('Você pode adicionar no máximo 10 fotos.')
      for (const file of selected) {
        if (file.size > 10 * 1024 * 1024) throw new Error('Cada foto deve ter no máximo 10 MB.')
        const compressedFile = await compressImage(file)
        const request = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: compressedFile.name, contentType: compressedFile.type, size: compressedFile.size }),
        })
        const data = (await request.json()) as UploadResponse
        if (!request.ok) throw new Error(data.error ?? 'Não foi possível preparar o envio da foto.')
        const upload = await fetch(data.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': compressedFile.type },
          body: compressedFile,
        })
        if (!upload.ok) throw new Error('O envio da foto falhou. Tente novamente.')
        const image = { url: data.imageUrl, key: data.key, deleteUrl: data.deleteUrl }
        uploadedThisAttempt.push(image)
        setImages((current) => [...current, image])
      }
    } catch (uploadError) {
      await deleteUploadedImages(uploadedThisAttempt)
      const deletedKeys = new Set(uploadedThisAttempt.map((image) => image.key))
      setImages((current) => current.filter((image) => !deletedKeys.has(image.key)))
      setError(uploadError instanceof Error ? uploadError.message : 'Erro inesperado ao enviar fotos.')
    } finally {
      setUploading(false)
    }
  }

  async function submitProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const payload = {
      title: form.get('title'),
      description: form.get('description'),
      price: Number(form.get('price')),
      propertyType: form.get('propertyType'),
      neighborhood: form.get('neighborhood'),
      bedrooms: Number(form.get('bedrooms')),
      bathrooms: Number(form.get('bathrooms')),
      parkingSpots: Number(form.get('parkingSpots')),
      petsAllowed: form.get('petsAllowed') === 'on',
      whatsappNumber: form.get('whatsappNumber'),
      images: images.map((image) => image.url),
    }
    let propertyCreated = false
    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 15000)
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      window.clearTimeout(timeout)
      const result = (await response.json()) as { id?: string; managementToken?: string; error?: string; details?: Record<string, string[] | undefined> }
      if (!response.ok) {
        const fieldError = result.details ? Object.values(result.details).flatMap((messages) => messages ?? [])[0] : undefined
        throw new Error(fieldError ?? result.error ?? 'Não foi possível cadastrar o imóvel.')
      }
      if (!result.id || !result.managementToken) throw new Error('O imóvel foi cadastrado, mas não foi possível abrir o anúncio.')
      propertyCreated = true
      window.localStorage.setItem(`property-management:${result.id}`, result.managementToken)
      setSubmitting(false)
      router.push(`/imoveis/${result.id}`)
    } catch (submitError) {
      if (!propertyCreated) {
        await deleteUploadedImages(images)
        setImages([])
      }
      setError(submitError instanceof Error ? submitError.message : 'Erro inesperado ao cadastrar o imóvel.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submitProperty} className="space-y-8">
      <section className="form-section">
        <div>
          <p className="eyebrow">01 — O imóvel</p>
          <h2 className="section-title">Conte um pouco sobre ele</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="form-label">Título do anúncio</span><input name="title" required minLength={5} maxLength={120} placeholder="Ex.: Casa aconchegante perto do centro" className="form-input" /></label>
          <label><span className="form-label">Tipo de imóvel</span><select name="propertyType" required className="form-input"><option value="">Selecione</option><option value="HOUSE">Casa</option><option value="APARTMENT">Apartamento</option><option value="KITNET">Kitnet</option><option value="COMMERCIAL">Comercial</option></select></label>
          <label><span className="form-label">Bairro</span><input name="neighborhood" required minLength={2} maxLength={80} placeholder="Ex.: Centro" className="form-input" /></label>
          <label className="sm:col-span-2"><span className="form-label">Descrição</span><textarea name="description" required minLength={10} rows={5} placeholder="Descreva os espaços, a localização e o que torna este imóvel especial." className="form-input resize-y" /></label>
          <label className="sm:col-span-2"><span className="form-label">Aluguel mensal (R$)</span><div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500">R$</span><input name="price" type="number" min="1" step="0.01" required placeholder="1.500" className="form-input pl-10" /></div></label>
        </div>
      </section>

      <section className="form-section">
        <div>
          <p className="eyebrow">02 — Detalhes</p>
          <h2 className="section-title">O que as pessoas querem saber</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <label><span className="form-label">Quartos</span><input name="bedrooms" type="number" min="0" defaultValue="0" className="form-input" /></label>
          <label><span className="form-label">Banheiros</span><input name="bathrooms" type="number" min="0" defaultValue="0" className="form-input" /></label>
          <label><span className="form-label">Vagas de garagem</span><input name="parkingSpots" type="number" min="0" defaultValue="0" className="form-input" /></label>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-slate-700"><input name="petsAllowed" type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-forest-700" /> Aceita animais de estimação</label>
      </section>

      <section className="form-section">
        <div>
          <p className="eyebrow">03 — Fotos e contato</p>
          <h2 className="section-title">Mostre os melhores ângulos</h2>
          <p className="mt-1 text-sm text-slate-500">Envie até 10 fotos, de até 10 MB cada.</p>
        </div>
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-sand p-6 text-center transition hover:border-forest-600">
          {uploading ? <LoaderCircle size={24} className="animate-spin text-forest-700" /> : <ImagePlus size={25} className="text-forest-700" />}
          <span className="mt-2 text-sm font-semibold text-slate-700">{uploading ? 'Enviando fotos…' : 'Toque para escolher fotos'}</span>
          <span className="mt-1 text-xs text-slate-500">JPG, PNG ou WebP</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading || images.length >= 10} onChange={(event) => { void uploadFiles(event.target.files); event.currentTarget.value = '' }} className="sr-only" />
        </label>
        {images.length > 0 && <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">{images.map((image, index) => <div key={image.key} className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"><img src={image.url} alt={`Foto ${index + 1} do imóvel`} className="h-full w-full object-cover" /><button type="button" onClick={() => { void removeImage(image) }} aria-label={`Remover foto ${index + 1}`} className="absolute right-1 top-1 rounded-full bg-white p-1 text-slate-700 shadow"><X size={14} /></button></div>)}</div>}
        <label><span className="form-label">WhatsApp para contato</span><input name="whatsappNumber" type="tel" required minLength={10} maxLength={20} placeholder="(00) 00000-0000" className="form-input" /><span className="mt-1 block text-xs text-slate-500">Inclua o DDD; usaremos o código do Brasil (+55).</span></label>
      </section>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={submitting || uploading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-6 py-4 font-semibold text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        {submitting && <LoaderCircle size={18} className="animate-spin" />}
        {submitting ? 'Publicando anúncio…' : 'Publicar anúncio'}
      </button>
    </form>
  )
}

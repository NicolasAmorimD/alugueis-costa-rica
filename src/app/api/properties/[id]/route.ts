import { NextRequest, NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'
import { db } from '@/lib/db'
import { updatePropertyStatusSchema } from '@/schemas/property.schema'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  try {
    const property = await db.property.findUnique({
      where: { id },
      omit: { managementTokenHash: true },
      include: { images: true },
    })
    if (!property || property.status === 'INACTIVE') {
      return NextResponse.json({ error: 'Imóvel não encontrado.' }, { status: 404 })
    }
    return NextResponse.json(property)
  } catch (error) {
    console.error('Erro ao buscar imóvel:', error)
    return NextResponse.json({ error: 'Erro interno ao buscar o imóvel.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'O corpo da requisição deve ser um JSON válido.' }, { status: 400 })
  }
  const validation = updatePropertyStatusSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ error: 'Status inválido.', details: validation.error.flatten().fieldErrors }, { status: 400 })
  }
  try {
    const current = await db.property.findUnique({ where: { id }, select: { managementTokenHash: true } })
    const suppliedToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!current?.managementTokenHash || !suppliedToken) {
      return NextResponse.json({ error: 'Chave de gerenciamento inválida.' }, { status: 401 })
    }
    const suppliedHash = createHash('sha256').update(suppliedToken).digest()
    const expectedHash = Buffer.from(current.managementTokenHash, 'hex')
    if (suppliedHash.length !== expectedHash.length || !timingSafeEqual(suppliedHash, expectedHash)) {
      return NextResponse.json({ error: 'Chave de gerenciamento inválida.' }, { status: 401 })
    }
    const property = await db.property.update({
      where: { id },
      data: { status: validation.data.status },
      select: { id: true, status: true },
    })
    return NextResponse.json(property)
  } catch (error) {
    console.error('Erro ao atualizar status do imóvel:', error)
    return NextResponse.json({ error: 'Não foi possível atualizar o status do imóvel.' }, { status: 500 })
  }
}

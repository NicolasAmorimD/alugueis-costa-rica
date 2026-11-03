import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { createPropertySchema, propertyFilterSchema } from '@/schemas/property.schema'

export async function GET(request: NextRequest) {
  const validation = propertyFilterSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )
  if (!validation.success) {
    return NextResponse.json({ error: 'Parâmetros de busca inválidos.', details: validation.error.flatten() }, { status: 400 })
  }

  const { neighborhood, propertyType, minPrice, maxPrice, bedrooms, page, limit } = validation.data
  const where: Prisma.PropertyWhereInput = { status: 'AVAILABLE' }
  if (neighborhood) where.neighborhood = { contains: neighborhood, mode: 'insensitive' }
  if (propertyType) where.propertyType = propertyType
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    }
  }
  if (bedrooms !== undefined) where.bedrooms = { gte: bedrooms }

  try {
    const [data, total] = await Promise.all([
      db.property.findMany({
        where,
        omit: { managementTokenHash: true },
        include: { images: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.property.count({ where }),
    ])
    return NextResponse.json({ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('Erro ao listar imóveis:', error)
    return NextResponse.json({ error: 'Erro interno ao processar a listagem de imóveis.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'O corpo da requisição deve ser um JSON válido.' }, { status: 400 })
  }

  const validation = createPropertySchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ error: 'Dados de cadastro inválidos.', details: validation.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const { images, ...propertyData } = validation.data
    const managementToken = randomBytes(32).toString('hex')
    const property = await db.property.create({
      data: {
        ...propertyData,
        managementTokenHash: createHash('sha256').update(managementToken).digest('hex'),
        images: { create: images.map((url) => ({ url })) },
      },
      omit: { managementTokenHash: true },
      include: { images: true },
    })
    return NextResponse.json({ ...property, managementToken }, { status: 201 })
  } catch (error) {
    console.error('Erro ao cadastrar imóvel:', error)
    return NextResponse.json({ error: 'Erro interno ao tentar salvar o imóvel.' }, { status: 500 })
  }
}

import { randomUUID } from 'node:crypto'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createS3Client, getS3Config } from '@/lib/server/s3'

const uploadSchema = z.object({
  fileName: z.string().min(1).max(200),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().int().positive().max(10 * 1024 * 1024),
})

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const MAX_UPLOAD_URLS_PER_WINDOW = 20
const uploadAttempts = new Map<string, { count: number; resetAt: number }>()

function getClientAddress(request: NextRequest) {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

function hasUploadRateLimit(address: string) {
  const now = Date.now()
  const current = uploadAttempts.get(address)
  if (!current || current.resetAt <= now) {
    uploadAttempts.set(address, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  current.count += 1
  return current.count > MAX_UPLOAD_URLS_PER_WINDOW
}

export async function POST(request: NextRequest) {
  const clientAddress = getClientAddress(request)
  if (hasUploadRateLimit(clientAddress)) {
    return NextResponse.json(
      { error: 'Limite de solicitações atingido. Tente novamente mais tarde.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)) } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'O corpo da requisição deve ser um JSON válido.' }, { status: 400 })
  }
  const validation = uploadSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ error: 'Arquivo inválido. Envie JPG, PNG ou WebP de até 10 MB.' }, { status: 400 })
  }

  const s3Config = getS3Config()
  if (!s3Config) {
    return NextResponse.json({ error: 'O envio de imagens não está configurado neste servidor.' }, { status: 503 })
  }

  const client = createS3Client(s3Config.region)
  const extension = validation.data.contentType.split('/')[1].replace('jpeg', 'jpg')
  const key = `properties/${randomUUID()}.${extension}`
  try {
    const command = new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
      ContentType: validation.data.contentType,
      ContentLength: validation.data.size,
    })
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 })
    const deleteUrl = await getSignedUrl(
      client,
      new DeleteObjectCommand({ Bucket: s3Config.bucket, Key: key }),
      { expiresIn: 300 },
    )
    const imageUrl = `/api/images?key=${encodeURIComponent(key)}`
    return NextResponse.json({ uploadUrl, deleteUrl, imageUrl, key })
  } catch (error) {
    console.error('Erro ao preparar upload da imagem:', error)
    return NextResponse.json({ error: 'Não foi possível preparar o envio da imagem.' }, { status: 500 })
  }
}

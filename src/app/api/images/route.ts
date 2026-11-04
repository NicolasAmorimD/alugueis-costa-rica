import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'
import { createS3Client, getS3Config } from '@/lib/server/s3'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  const s3Config = getS3Config()

  if (!key || !key.startsWith('properties/') || key.includes('..')) {
    return NextResponse.json({ error: 'Imagem inválida.' }, { status: 400 })
  }

  if (!s3Config) {
    return NextResponse.json({ error: 'O armazenamento de imagens não está configurado.' }, { status: 503 })
  }

  try {
    const client = createS3Client(s3Config.region)
    const signedUrl = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: s3Config.bucket, Key: key }),
      { expiresIn: 300 },
    )
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error('Erro ao preparar leitura da imagem:', error)
    return NextResponse.json({ error: 'Não foi possível carregar a imagem.' }, { status: 500 })
  }
}

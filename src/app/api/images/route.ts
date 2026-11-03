import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  const { AWS_REGION, AWS_S3_BUCKET_NAME } = process.env

  if (!key || !key.startsWith('properties/') || key.includes('..')) {
    return NextResponse.json({ error: 'Imagem inválida.' }, { status: 400 })
  }

  if (!AWS_REGION || !AWS_S3_BUCKET_NAME) {
    return NextResponse.json({ error: 'O armazenamento de imagens não está configurado.' }, { status: 503 })
  }

  try {
    const client = new S3Client({ region: AWS_REGION })
    const signedUrl = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: AWS_S3_BUCKET_NAME, Key: key }),
      { expiresIn: 300 },
    )
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error('Erro ao preparar leitura da imagem:', error)
    return NextResponse.json({ error: 'Não foi possível carregar a imagem.' }, { status: 500 })
  }
}

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  const APP_AWS_REGION = process.env.APP_AWS_REGION ?? process.env.AWS_REGION
  const APP_AWS_ACCESS_KEY_ID = process.env.APP_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID
  const APP_AWS_SECRET_ACCESS_KEY = process.env.APP_AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY
  const APP_AWS_S3_BUCKET_NAME = process.env.APP_AWS_S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET_NAME

  if (!key || !key.startsWith('properties/') || key.includes('..')) {
    return NextResponse.json({ error: 'Imagem inválida.' }, { status: 400 })
  }

  if (!APP_AWS_REGION || !APP_AWS_ACCESS_KEY_ID || !APP_AWS_SECRET_ACCESS_KEY || !APP_AWS_S3_BUCKET_NAME) {
    return NextResponse.json({ error: 'O armazenamento de imagens não está configurado.' }, { status: 503 })
  }

  try {
    const client = new S3Client({
      region: APP_AWS_REGION,
      credentials: {
        accessKeyId: APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: APP_AWS_SECRET_ACCESS_KEY,
      },
    })
    const signedUrl = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: APP_AWS_S3_BUCKET_NAME, Key: key }),
      { expiresIn: 300 },
    )
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error('Erro ao preparar leitura da imagem:', error)
    return NextResponse.json({ error: 'Não foi possível carregar a imagem.' }, { status: 500 })
  }
}

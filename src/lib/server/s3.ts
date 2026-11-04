import { S3Client } from '@aws-sdk/client-s3'

export function getS3Config() {
  const region = process.env.APP_AWS_REGION ?? process.env.AWS_REGION
  const bucket = process.env.APP_AWS_S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET_NAME

  if (!region || !bucket) return null
  return { region, bucket }
}

export function createS3Client(region: string) {
  // Credentials come from the AWS SDK default provider chain.
  // Amplify resolves them from the IAM role attached to the SSR environment.
  return new S3Client({ region })
}

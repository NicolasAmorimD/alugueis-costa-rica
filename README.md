# Aluguéis Costa-Rica

Aplicação de aluguel de imóveis construída com Next.js App Router, TypeScript, PostgreSQL e Prisma.

## Requisitos

- Node.js 20.9 ou superior
- PostgreSQL
- AWS S3 para habilitar o envio de fotos

## Começar

1. Instale as dependências: `npm install`
2. Copie `.env.example` para `.env` e configure a conexão PostgreSQL.
3. Crie o banco e gere o cliente Prisma: `npm run db:migrate`
4. (Opcional) Cadastre anúncios de exemplo: `npm run db:seed`
5. Inicie o servidor local: `npm run dev`

Abra [http://localhost:3000](http://localhost:3000).

## Upload de fotos (AWS S3)

Configure `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME` e `AWS_S3_PUBLIC_URL`. A identidade AWS deve ter permissão de escrita apenas no bucket/prefixo usado para imagens. Configure a política CORS do bucket para permitir `PUT` da origem da aplicação e os tipos `image/jpeg`, `image/png` e `image/webp`.

O endpoint de upload emite URLs assinadas com validade de cinco minutos, limitadas a imagens JPG, PNG ou WebP de até 10 MB. As fotos são redimensionadas para no máximo 1600 px e convertidas para JPEG no navegador antes do envio. O bucket deve permitir leitura pública dos objetos; use uma URL S3 compatível com os domínios permitidos em `next.config.ts`.

## Rotas principais

- `/` — busca SSR por bairro, tipo e faixa de preço
- `/imoveis/[id]` — detalhes do imóvel com metadados OpenGraph
- `/anunciar` — formulário de cadastro e envio de imagens
- `/api/properties` — GET com filtros e paginação; POST para cadastrar
- `/api/properties/[id]` — GET do imóvel; PATCH para atualização de status
- `/api/upload` — solicita URL pré-assinada para upload de foto

Ao publicar, o navegador guarda uma chave privada de gerenciamento para permitir a atualização de status naquele dispositivo. Essa chave nunca é retornada em listagens ou páginas públicas; guarde o acesso ao navegador usado na publicação.

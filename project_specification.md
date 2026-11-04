# 📄 Documentação Completa do Projeto: Aluguéis Costa-Rica (v1.0)

Este documento centraliza todas as especificações técnicas, arquiteturais, modelos de dados, rotas de API e componentes de interface do projeto **Aluguéis Costa-Rica**, desenvolvido sob a metodologia **Spec-Driven Development (SDD)**.

---

## 1. Visão Geral do Produto (Product Overview)

* **Nome do Projeto:** Aluguéis Costa-Rica
* **Objetivo:** Centralizar o mercado de aluguel de imóveis em cidades de pequeno e médio porte, eliminando a pulverização de anúncios em grupos de WhatsApp, Facebook e Instagram.
* **Público-Alvo:** 
  * **Inquilinos:** Moradores locais ou novos residentes em busca de imóveis com fotos claras, detalhes completos e comunicação direta.
  * **Anunciantes:** Proprietários diretos e pequenos corretores/imobiliárias locais.

---

## 2. Histórias de Usuário & Requisitos (User Stories & Requirements)

### Histórias de Usuário (User Stories)
* **US-01 (Busca & Filtro):** Como inquilino, quero buscar imóveis aplicando filtros de preço, bairro e tipo de imóvel para encontrar opções rapidamente.
* **US-02 (Contato Direto):** Como inquilino, quero clicar em um botão que abre o WhatsApp do anunciante pré-preenchido com a referência do imóvel para agendar visitas sem intermediários.
* **US-03 (Cadastro de Anúncio):** Como proprietário, quero preencher um formulário simples e anexar fotos do meu imóvel para torná-lo visível para a cidade.
* **US-04 (Gestão de Status):** Como anunciante, quero poder marcar meu imóvel como "Alugado" para parar de receber mensagens após fechar negócio.

### Requisitos Não-Funcionais (RNF)
* **RNF-01 (Mobile First):** A interface deve ser completamente otimizada para smartphones (foco em redes 3G/4G locais).
* **RNF-02 (SEO Local & OpenGraph):** As páginas dos imóveis devem possuir renderização via servidor (SSR) para gerar *previews* ricos com foto e título ao serem compartilhadas no WhatsApp/Facebook.
* **RNF-03 (Otimização de Mídia):** As imagens enviadas por celulares devem ser comprimidas/redimensionadas antes ou durante o upload para reduzir consumo de banda e armazenamento.

---

## 3. Arquitetura Técnica & Stack

| Camada | Tecnologia Escolhida | Justificativa |
| :--- | :--- | :--- |
| **Framework Fullstack** | Next.js (App Router) + TypeScript | Permite API Routes e SSR nativo no mesmo repositório |
| **Estilização & UI** | Tailwind CSS + Lucide Icons | Agilidade de desenvolvimento e design responsivo mobile-first |
| **Banco de Dados** | PostgreSQL (Supabase / Render) | Banco relacional robusto e escalável |
| **ORM** | Prisma ORM | Tipagem estrita de ponta a ponta integrada ao TypeScript |
| **Validação** | Zod | Schemas de validação compartilhados entre Frontend e Backend |
| **Armazenamento de Mídia** | AWS S3 / Cloudinary | Hospedagem de imagens de alta performance com CDN |

---

## 4. Estrutura de Arquivos do Projeto (Project Layout)

```text
aluga-facil/
├── prisma/
│   ├── schema.prisma              # Schema do banco de dados PostgreSQL
│   └── seed.ts                    # Script para popular dados de teste
├── public/                        # Assets estáticos públicos
├── src/
│   ├── app/                       # App Router (Next.js)
│   │   ├── (public)/              # Layout público (Navbar + Footer)
│   │   │   ├── imoveis/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Página de Detalhes do Imóvel
│   │   │   ├── anunciar/
│   │   │   │   └── page.tsx       # Formulário de Anúncio
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx           # Homepage / Feed de Imóveis
│   │   ├── api/                   # Handlers de API Server-side
│   │   │   ├── properties/
│   │   │   │   ├── route.ts       # GET (Listar) e POST (Criar)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # GET por ID e PATCH (Status)
│   │   │   └── upload/
│   │   │       └── route.ts       # Rota para Presigned URL do S3
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/                # Componentes React
│   │   ├── common/                # Header, Footer, WhatsappButton
│   │   ├── properties/            # PropertyCard, PropertyGrid, PropertyFilters
│   │   └── ui/                    # Componentes base
│   ├── lib/                       # db.ts (Prisma), s3.ts, utils.ts
│   ├── schemas/                   # property.schema.ts (Validações Zod)
│   └── types/                     # Interfaces TypeScript compartilhadas
├── .env.example
├── next.config.js
├── package.json
└── tailwind.config.ts
```

---

## 5. Configurações de Infraestrutura & Banco de Dados

### `.env.example`
```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/alugafacil?schema=public"

# AWS S3 (Armazenamento de Imagens)
AWS_REGION="sa-east-1"
APP_AWS_REGION="us-east-2"
APP_AWS_S3_BUCKET_NAME="alugueis-costa-rica-243530875139-us-east-2-an"
AWS_S3_BUCKET_NAME="alugafacil-imagens"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Cliente Prisma (`src/lib/db.ts`)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

---

## 6. Modelagem de Dados (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Property {
  id             String         @id @default(uuid())
  title          String         @db.VarChar(120)
  description    String         @db.Text
  price          Decimal        @db.Decimal(10, 2)
  propertyType   PropertyType
  neighborhood   String         @db.VarChar(80)
  bedrooms       Int            @default(0)
  bathrooms      Int            @default(0)
  parkingSpots   Int            @default(0)
  petsAllowed    Boolean        @default(false)
  whatsappNumber String         @db.VarChar(20)
  status         PropertyStatus @default(AVAILABLE)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  images         PropertyImage[]

  @@index([neighborhood])
  @@index([propertyType])
  @@index([status])
  @@map("properties")
}

model PropertyImage {
  id         String   @id @default(uuid())
  url        String   @db.Text
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@map("property_images")
}

enum PropertyType {
  HOUSE
  APARTMENT
  KITNET
  COMMERCIAL
}

enum PropertyStatus {
  AVAILABLE
  RENTED
  INACTIVE
}
```

---

## 7. Schemas de Validação (Zod)

```typescript
// src/schemas/property.schema.ts
import { z } from 'zod'

export const propertyTypeEnum = z.enum(['HOUSE', 'APARTMENT', 'KITNET', 'COMMERCIAL'])
export const propertyStatusEnum = z.enum(['AVAILABLE', 'RENTED', 'INACTIVE'])

// Schema para criação de um novo imóvel
export const createPropertySchema = z.object({
  title: z
    .string()
    .min(5, { message: 'O título deve ter pelo menos 5 caracteres.' })
    .max(120, { message: 'O título pode ter no máximo 120 caracteres.' }),
  
  description: z
    .string()
    .min(10, { message: 'A descrição deve ter pelo menos 10 caracteres.' }),
  
  price: z
    .number({ invalid_type_error: 'O preço deve ser um número.' })
    .positive({ message: 'O preço do aluguel deve ser maior que zero.' }),
  
  propertyType: propertyTypeEnum,
  
  neighborhood: z
    .string()
    .min(2, { message: 'Informe o bairro corretamente.' }),
  
  bedrooms: z
    .number().int().nonnegative({ message: 'Número de quartos inválido.' }).default(0),
  
  bathrooms: z
    .number().int().nonnegative({ message: 'Número de banheiros inválido.' }).default(0),
  
  parkingSpots: z
    .number().int().nonnegative({ message: 'Número de vagas inválido.' }).default(0),
  
  petsAllowed: z.boolean().default(false),
  
  whatsappNumber: z
    .string()
    .min(10, { message: 'Número de WhatsApp inválido (inclua o DDD).' })
    .max(15, { message: 'Número de WhatsApp muito longo.' }),
  
  images: z
    .array(z.string().url({ message: 'URL de imagem inválida.' }))
    .min(1, { message: 'Adicione pelo menos 1 foto do imóvel.' })
    .max(10, { message: 'Você pode enviar no máximo 10 fotos.' }),
})

// Schema para atualização de status (ex: marcar como alugado)
export const updatePropertyStatusSchema = z.object({
  status: propertyStatusEnum,
})

// Schema para os filtros de busca na listagem
export const propertyFilterSchema = z.object({
  neighborhood: z.string().optional(),
  propertyType: propertyTypeEnum.optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  bedrooms: z.coerce.number().int().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyStatusInput = z.infer<typeof updatePropertyStatusSchema>
export type PropertyFilterInput = z.infer<typeof propertyFilterSchema>
```

---

## 8. Rotas da API (Next.js App Router)

```typescript
// src/app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createPropertySchema, propertyFilterSchema } from '@/schemas/property.schema'

// GET: Listar e filtrar imóveis com paginação
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = Object.fromEntries(searchParams.entries())

    const validation = propertyFilterSchema.safeParse(queryParams)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Parâmetros de busca inválidos.', 
          details: validation.error.format() 
        },
        { status: 400 }
      )
    }

    const { neighborhood, propertyType, minPrice, maxPrice, bedrooms, page, limit } = validation.data
    const skip = (page - 1) * limit

    const where: any = {
      status: 'AVAILABLE',
    }

    if (neighborhood) {
      where.neighborhood = { contains: neighborhood, mode: 'insensitive' }
    }

    if (propertyType) {
      where.propertyType = propertyType
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    if (bedrooms !== undefined) {
      where.bedrooms = { gte: bedrooms }
    }

    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        include: { images: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.property.count({ where }),
    ])

    return NextResponse.json({
      data: properties,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao listar imóveis:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar a listagem de imóveis.' },
      { status: 500 }
    )
  }
}

// POST: Cadastrar um novo imóvel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = createPropertySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados de cadastro inválidos.', 
          details: validation.error.format() 
        },
        { status: 400 }
      )
    }

    const { images, ...propertyData } = validation.data

    const newProperty = await db.property.create({
      data: {
        ...propertyData,
        images: {
          create: images.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
      },
    })

    return NextResponse.json(newProperty, { status: 201 })

  } catch (error) {
    console.error('Erro ao cadastrar imóvel:', error)
    return NextResponse.json(
      { error: 'Erro interno ao tentar salvar o imóvel.' },
      { status: 500 }
    )
  }
}
```

---

## 9. Componentes da Interface (UI)

### Componente PropertyCard (`src/components/properties/PropertyCard.tsx`)
```tsx
import Link from 'next/link'
import Image from 'next/image'
import { Bed, Bath, Car, MapPin, MessageCircle } from 'lucide-react'

interface PropertyImage {
  id: string
  url: string
}

interface PropertyCardProps {
  property: {
    id: string
    title: string
    price: number | string
    propertyType: string
    neighborhood: string
    bedrooms: number
    bathrooms: number
    parkingSpots: number
    whatsappNumber: string
    images: PropertyImage[]
  }
}

const propertyTypeLabels: Record<string, string> = {
  HOUSE: 'Casa',
  APARTMENT: 'Apartamento',
  KITNET: 'Kitnet',
  COMMERCIAL: 'Comercial',
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formattedPrice = Number(property.price).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })

  const whatsappMessage = encodeURIComponent(
    `Olá! Vi o seu anúncio "${property.title}" no Aluguéis Costa-Rica e gostaria de mais informações.`
  )
  const whatsappUrl = `https://wa.me/55${property.whatsappNumber}?text=${whatsappMessage}`
  const coverImage = property.images[0]?.url || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={coverImage}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {propertyTypeLabels[property.propertyType] || property.propertyType}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-center text-gray-500 text-xs gap-1 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">{property.neighborhood}</span>
          </div>

          <Link href={`/imoveis/${property.id}`}>
            <h3 className="font-semibold text-gray-900 text-base line-clamp-1 hover:text-emerald-600 transition-colors">
              {property.title}
            </h3>
          </Link>

          <p className="text-xl font-bold text-emerald-600 mt-2">
            {formattedPrice} <span className="text-xs font-normal text-gray-500">/mês</span>
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 text-gray-600 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-gray-400" />
              <span>{property.bedrooms} {property.bedrooms === 1 ? 'Quarto' : 'Quartos'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-gray-400" />
              <span>{property.bathrooms} {property.bathrooms === 1 ? 'Banheiro' : 'Banheiros'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Car className="w-4 h-4 text-gray-400" />
              <span>{property.parkingSpots} {property.parkingSpots === 1 ? 'Vaga' : 'Vagas'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Link
          href={`/imoveis/${property.id}`}
          className="w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          Detalhes
        </Link>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    </div>
  )
}
```

### Componente PropertyFilters (`src/components/properties/PropertyFilters.tsx`)
```tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [neighborhood, setNeighborhood] = useState(searchParams.get('neighborhood') || '')
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()

    if (neighborhood) params.set('neighborhood', neighborhood)
    if (propertyType) params.set('propertyType', propertyType)
    if (maxPrice) params.set('maxPrice', maxPrice)

    router.push(`/?${params.toString()}`)
  }

  const handleClear = () => {
    setNeighborhood('')
    setPropertyType('')
    setMaxPrice('')
    router.push('/')
  }

  return (
    <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Bairro</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Ex: Centro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Imóvel</label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          >
            <option value="">Todos os tipos</option>
            <option value="HOUSE">Casa</option>
            <option value="APARTMENT">Apartamento</option>
            <option value="KITNET">Kitnet</option>
            <option value="COMMERCIAL">Comercial</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Aluguel Máximo (R$)</label>
          <input
            type="number"
            placeholder="Ex: 1500"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtrar
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            title="Limpar filtros"
          >
            Limpar
          </button>
        </div>
      </div>
    </form>
  )
}
```

---

## 10. Escopo Fora da V1 (Backlog Futuro)

* Autenticação completa de proprietários (NextAuth.js / Supabase Auth).
* Painel administrativo (Dashboard) com estatísticas de visualização do anúncio.
* Monetização automática via Stripe/MercadoPago para destaque de imóveis.
* Assinatura digital de contrato de aluguel.

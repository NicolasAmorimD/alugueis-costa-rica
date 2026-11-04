import { z } from 'zod'

export const propertyTypeEnum = z.enum(['HOUSE', 'APARTMENT', 'KITNET', 'COMMERCIAL'])
export const propertyStatusEnum = z.enum(['AVAILABLE', 'RENTED', 'INACTIVE'])

const propertyImageUrlSchema = z.string().refine((value) => {
  try {
    const url = new URL(value, 'https://alugueis-costa-rica.invalid')
    const key = url.searchParams.get('key')
    return url.pathname === '/api/images' && Boolean(key?.startsWith('properties/')) && !key?.includes('..')
  } catch {
    return false
  }
}, 'URL de imagem inválida.')

export const createPropertySchema = z.object({
  title: z.string().trim().min(5, 'O título deve ter pelo menos 5 caracteres.').max(120),
  description: z.string().trim().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
  price: z.number().positive('O aluguel deve ser maior que zero.').max(99999999),
  propertyType: propertyTypeEnum,
  neighborhood: z.string().trim().min(2, 'Informe o bairro.').max(80),
  bedrooms: z.number().int().min(0).default(0),
  bathrooms: z.number().int().min(0).default(0),
  parkingSpots: z.number().int().min(0).default(0),
  petsAllowed: z.boolean().default(false),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{10,20}$/, 'Informe um número de WhatsApp válido.'),
  images: z.array(propertyImageUrlSchema).min(1).max(10),
})

export const updatePropertyStatusSchema = z.object({
  status: propertyStatusEnum,
})

export const propertyFilterSchema = z
  .object({
    neighborhood: z.string().trim().max(80).optional(),
    propertyType: propertyTypeEnum.optional(),
    minPrice: z.coerce.number().nonnegative().max(99999999).optional(),
    maxPrice: z.coerce.number().nonnegative().max(99999999).optional(),
    bedrooms: z.coerce.number().int().nonnegative().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12),
  })
  .refine(
    ({ minPrice, maxPrice }) =>
      minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice,
    { message: 'O preço mínimo não pode ser maior que o preço máximo.' },
  )

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type PropertyFilterInput = z.infer<typeof propertyFilterSchema>

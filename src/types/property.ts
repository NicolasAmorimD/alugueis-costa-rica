import type { Property, PropertyImage } from '@prisma/client'

export type PropertyWithImages = Omit<Property, 'managementTokenHash'> & { images: PropertyImage[] }

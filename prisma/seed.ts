import { PrismaClient, PropertyType } from '@prisma/client'

const db = new PrismaClient()

const listings = [
  {
    title: 'Casa iluminada com quintal e varanda',
    description: 'Casa arejada, com ambientes amplos e ótima iluminação natural. O quintal é perfeito para aproveitar o fim de tarde. Perto de mercados, transporte e serviços do bairro.',
    price: 1850,
    propertyType: PropertyType.HOUSE,
    neighborhood: 'Centro',
    bedrooms: 3,
    bathrooms: 2,
    parkingSpots: 1,
    petsAllowed: true,
    whatsappNumber: '11987654321',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Apartamento tranquilo perto de tudo',
    description: 'Apartamento confortável em localização prática, com sala integrada, cozinha funcional e boa ventilação. Ideal para quem busca comodidade no dia a dia.',
    price: 1450,
    propertyType: PropertyType.APARTMENT,
    neighborhood: 'Jardim das Flores',
    bedrooms: 2,
    bathrooms: 1,
    parkingSpots: 1,
    petsAllowed: false,
    whatsappNumber: '11987654321',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Kitnet prática e bem localizada',
    description: 'Espaço compacto e funcional, com ambientes bem aproveitados e fácil acesso ao comércio local. Uma ótima opção para morar com praticidade.',
    price: 850,
    propertyType: PropertyType.KITNET,
    neighborhood: 'Vila Nova',
    bedrooms: 1,
    bathrooms: 1,
    parkingSpots: 0,
    petsAllowed: true,
    whatsappNumber: '11987654321',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85',
  },
]

async function main() {
  for (const listing of listings) {
    const { image, ...data } = listing
    await db.property.create({ data: { ...data, images: { create: [{ url: image }] } } })
  }
}

main()
  .then(async () => db.$disconnect())
  .catch(async (error: unknown) => {
    console.error('Erro ao popular o banco de dados:', error)
    await db.$disconnect()
    process.exitCode = 1
  })

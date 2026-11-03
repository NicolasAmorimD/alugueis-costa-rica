export function formatPrice(price: number | string) {
  return Number(price).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

export function whatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, '')
  const internationalNumber = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`
}

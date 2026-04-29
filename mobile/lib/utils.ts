import type { PetSpecies } from '@/types'

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

export function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function calculateAge(birthDateStr: string): string {
  const birth = new Date(birthDateStr)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (months < 12) return `${months} aylık`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} yaşında`
  return `${years} yaş ${rem} ay`
}

export function speciesLabel(species: PetSpecies): string {
  const map: Record<PetSpecies, string> = {
    dog: 'Köpek', cat: 'Kedi', bird: 'Kuş', rabbit: 'Tavşan', other: 'Diğer',
  }
  return map[species]
}

export function speciesEmoji(species: PetSpecies): string {
  const map: Record<PetSpecies, string> = {
    dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐇', other: '🐾',
  }
  return map[species]
}

export function isVaccinationDueSoon(nextDate: string, days = 30): boolean {
  const diff = new Date(nextDate).getTime() - Date.now()
  return diff > 0 && diff <= days * 24 * 60 * 60 * 1000
}

export function isVaccinationOverdue(nextDate: string): boolean {
  return new Date(nextDate).getTime() < Date.now()
}

export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
export type Gender = 'male' | 'female'

export interface Owner {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
}

export interface Pet {
  id: string
  ownerId: string
  name: string
  species: PetSpecies
  breed: string
  gender: Gender
  birthDate: string
  microchipNo?: string
  photoUrl?: string
  weight?: number
}

export interface Examination {
  id: string
  petId: string
  vetName: string
  date: string
  complaint: string
  findings: string
  assessment: string
  plan: string
  followUpDate?: string
}

export interface Vaccination {
  id: string
  petId: string
  vaccineName: string
  appliedDate: string
  nextDate: string
  manufacturer?: string
}

export interface Medication {
  id: string
  drugName: string
  dose: string
  frequency: string
  duration: string
  instructions?: string
}

export interface Prescription {
  id: string
  petId: string
  vetName: string
  date: string
  medications: Medication[]
}

export interface LabResult {
  id: string
  petId: string
  testType: string
  date: string
  comment?: string
}

export interface AppNotification {
  id: string
  type: 'examination' | 'vaccination' | 'prescription' | 'reminder'
  title: string
  message: string
  petName: string
  sentAt: string
  isRead: boolean
}

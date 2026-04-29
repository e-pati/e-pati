export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
export type Gender = 'male' | 'female'
export type Role = 'OWNER' | 'VETERINARIAN' | 'CLINIC_ADMIN' | 'SUPER_ADMIN'

export interface Owner {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  address?: string
}

export interface Pet {
  id: string
  ownerId: string
  owner: Owner
  name: string
  species: PetSpecies
  breed: string
  gender: Gender
  birthDate: string
  microchipNo?: string
  photoUrl?: string
  weight?: number
  createdAt: string
}

export interface Veterinarian {
  id: string
  clinicId: string
  firstName: string
  lastName: string
  title: string
  licenseNo: string
}

export interface Examination {
  id: string
  petId: string
  pet?: Pet
  vetId: string
  vet?: Veterinarian
  date: string
  complaint: string
  findings: string
  assessment: string
  plan: string
  followUpDate?: string
  createdAt: string
}

export interface Vaccination {
  id: string
  petId: string
  vetId: string
  vaccineName: string
  appliedDate: string
  nextDate: string
  serialNo?: string
  manufacturer?: string
}

export interface Medication {
  id: string
  prescriptionId: string
  drugName: string
  dose: string
  frequency: string
  duration: string
  instructions?: string
}

export interface Prescription {
  id: string
  examinationId: string
  vetId: string
  vet?: Veterinarian
  date: string
  notes?: string
  medications: Medication[]
}

export interface LabResult {
  id: string
  petId: string
  vetId: string
  testType: string
  date: string
  fileUrl?: string
  comment?: string
}

export interface Notification {
  id: string
  petId: string
  ownerId: string
  type: 'examination' | 'vaccination' | 'prescription' | 'lab' | 'reminder'
  title: string
  message: string
  sentAt: string
  isRead: boolean
}

export interface DashboardStats {
  todayExaminations: number
  todayVaccinations: number
  weekFollowUps: number
  totalPatients: number
  pendingLabResults: number
}

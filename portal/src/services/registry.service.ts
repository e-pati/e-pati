import { api } from '@/lib/api'

export type AnimalClass = 'PET' | 'CATTLE' | 'SMALL_RUMINANT' | 'STRAY' | 'SERVICE'
export type AnimalStatus = 'ACTIVE' | 'LOST' | 'ADOPTED' | 'SOLD' | 'TRANSFERRED' | 'DECEASED' | 'ARCHIVED'
export type PremiseType = 'FARM' | 'SHELTER' | 'CLINIC' | 'OWNER_HOME' | 'MUNICIPAL_FEEDING_POINT' | 'PUBLIC_INSTITUTION'
export type AnimalSex = 'MALE' | 'FEMALE' | 'UNKNOWN'
export type AnimalIdentifierType = 'HKN' | 'MICROCHIP' | 'EAR_TAG' | 'PASSPORT' | 'QR_TAG'
export type MovementReason =
  | 'BIRTH'
  | 'SALE'
  | 'TRANSFER'
  | 'SHELTER_INTAKE'
  | 'ADOPTION'
  | 'TREATMENT'
  | 'RETURN_TO_AREA'
  | 'DEATH'
  | 'OTHER'

export interface RegistryOverview {
  animalsByClass: Array<{ class: AnimalClass; count: number }>
  animalsByStatus: Array<{ status: AnimalStatus; count: number }>
  premiseCount: number
}

export interface RegistryPremise {
  id: string
  type: PremiseType
  name: string
  province: string
  district: string
  ministryCode?: string
  currentAnimalCount: number
}

export interface RegistryAnimal {
  id: string
  hkn: string
  class: AnimalClass
  species: string
  breed?: string
  name?: string
  status: AnimalStatus
  currentPremise?: {
    id: string
    type: PremiseType
    name: string
    province: string
    district: string
    ministryCode?: string
  }
  identifiers: Array<{
    id: string
    type: string
    value: string
    isPrimary: boolean
  }>
  createdAt: string
}

export interface RegistryMovement {
  id: string
  reason: MovementReason
  occurredAt: string
  notes?: string
  fromPremise?: RegistryPremise
  toPremise?: RegistryPremise
}

export interface RegistryAnimalDetail extends RegistryAnimal {
  movements: RegistryMovement[]
}

export interface CreatePremisePayload {
  type: PremiseType
  name: string
  province: string
  district: string
  neighborhood?: string
  address?: string
  ministryCode?: string
  capacity?: number
}

export interface CreateAnimalPayload {
  hkn?: string
  class: AnimalClass
  species: string
  breed?: string
  name?: string
  sex?: AnimalSex
  birthDate?: string
  color?: string
  currentPremiseId?: string
  identifiers?: Array<{
    type: AnimalIdentifierType
    value: string
    issuedBy?: string
  }>
}

export interface RecordMovementPayload {
  animalId: string
  reason: MovementReason
  occurredAt: string
  fromPremiseId?: string
  toPremiseId?: string
  notes?: string
}

export const registryService = {
  async getOverview(): Promise<RegistryOverview> {
    const { data } = await api.get<RegistryOverview>('/registry/overview')
    return data
  },

  async getPremises(): Promise<RegistryPremise[]> {
    const { data } = await api.get<RegistryPremise[]>('/registry/premises')
    return data
  },

  async getAnimals(): Promise<RegistryAnimal[]> {
    const { data } = await api.get<RegistryAnimal[]>('/registry/animals')
    return data
  },

  async getAnimal(id: string): Promise<RegistryAnimalDetail> {
    const { data } = await api.get<RegistryAnimalDetail>(`/registry/animals/${id}`)
    return data
  },

  async createPremise(payload: CreatePremisePayload): Promise<RegistryPremise> {
    const { data } = await api.post<RegistryPremise>('/registry/premises', payload)
    return data
  },

  async createAnimal(payload: CreateAnimalPayload): Promise<RegistryAnimal> {
    const { data } = await api.post<RegistryAnimal>('/registry/animals', payload)
    return data
  },

  async recordMovement(payload: RecordMovementPayload) {
    const { animalId, ...body } = payload
    const { data } = await api.post(`/registry/animals/${animalId}/movements`, body)
    return data
  },
}

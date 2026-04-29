import { api } from '@/lib/api'

export interface ApiPet {
  id: string
  ownerId: string
  clinicId?: string
  name: string
  species: string
  breed?: string
  sex: string
  birthDate?: string
  microchipNo?: string
  photoUrl?: string
  deletedAt?: string
  createdAt: string
  updatedAt: string
  owner?: {
    id: string
    fullName: string
    email: string
    phone?: string
  }
}

export interface CreatePetPayload {
  name: string
  species: string
  breed?: string
  sex?: string
  birthDate?: string
  microchipNo?: string
  photoUrl?: string
}

export const petsService = {
  async getAll(): Promise<ApiPet[]> {
    const { data } = await api.get<ApiPet[]>('/pets')
    return data
  },

  async getOne(id: string): Promise<ApiPet> {
    const { data } = await api.get<ApiPet>(`/pets/${id}`)
    return data
  },

  async create(payload: CreatePetPayload): Promise<ApiPet> {
    const { data } = await api.post<ApiPet>('/pets', payload)
    return data
  },

  async update(id: string, payload: Partial<CreatePetPayload>): Promise<ApiPet> {
    const { data } = await api.patch<ApiPet>(`/pets/${id}`, payload)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/pets/${id}`)
  },

  async getQr(id: string): Promise<{ token: string }> {
    const { data } = await api.get<{ token: string }>(`/pets/${id}/qr`)
    return data
  },
}

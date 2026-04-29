import { api } from '@/lib/api'

export interface ApiPet {
  id: string
  ownerId: string
  name: string
  species: string
  breed?: string
  sex: string
  birthDate?: string
  microchipNo?: string
  photoUrl?: string
  createdAt: string
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

  async create(payload: Partial<ApiPet>): Promise<ApiPet> {
    const { data } = await api.post<ApiPet>('/pets', payload)
    return data
  },

  async getQr(id: string): Promise<{ token: string }> {
    const { data } = await api.get<{ token: string }>(`/pets/${id}/qr`)
    return data
  },
}

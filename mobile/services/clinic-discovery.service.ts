import { api } from '@/lib/api'

export interface NearbyClinic {
  id: string
  name: string
  city?: string
  district?: string
  address?: string
  distanceKm?: number
  rating?: number
  phone?: string
  isVetCepPartner?: boolean
}

export interface ClinicPublicProfile extends NearbyClinic {
  description?: string
  workingHours?: string
  services?: string[]
  website?: string
  appointmentRequestEnabled?: boolean
}

export interface ClinicDiscoveryParams {
  latitude?: number
  longitude?: number
  city?: string
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const clinicDiscoveryService = {
  async getNearby(params: ClinicDiscoveryParams = {}): Promise<NearbyClinic[]> {
    const { data } = await api.get<ListResponse<NearbyClinic>>('/clinics/discovery', { params })
    return unwrapList(data)
  },

  async getPublicProfile(id: string): Promise<ClinicPublicProfile> {
    const { data } = await api.get<ClinicPublicProfile>(`/clinics/${id}/public-profile`)
    return data
  },
}

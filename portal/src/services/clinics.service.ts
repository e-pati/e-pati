import { api } from '@/lib/api'

export interface ClinicDashboard {
  stats: {
    patientCount: number
    examinationsToday: number
    upcomingVaccinationCount: number
    unreadNotificationCount: number
  }
  recentExaminations: Array<{
    id: string
    createdAt: string
    complaint?: string
    pet: { id: string; name: string; species: string }
    veterinarian: { id: string; fullName: string }
  }>
  upcomingVaccinations: Array<{
    id: string
    name: string
    dueAt: string
    pet: { id: string; name: string; species: string }
  }>
}

export interface ClinicPatient {
  id: string
  name: string
  species: string
  breed?: string
  sex: string
  birthDate?: string
  microchipNo?: string
  photoUrl?: string
  clinicId?: string
  createdAt: string
  updatedAt: string
  owner: { id: string; fullName: string; email: string; phone?: string }
}

export interface ClinicPatientsResponse {
  items: ClinicPatient[]
  total: number
  page: number
  limit: number
}

export const clinicsService = {
  async getDashboard(clinicId: string): Promise<ClinicDashboard> {
    const { data } = await api.get<ClinicDashboard>(`/clinics/${clinicId}/dashboard`)
    return data
  },

  async getPatients(
    clinicId: string,
    params?: { page?: number; limit?: number; search?: string; species?: string },
  ): Promise<ClinicPatientsResponse> {
    const { data } = await api.get<ClinicPatientsResponse>(
      `/clinics/${clinicId}/patients`,
      { params },
    )
    return data
  },
}

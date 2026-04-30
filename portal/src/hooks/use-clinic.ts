'use client'

import { useQuery } from '@tanstack/react-query'
import { clinicsService } from '@/services/clinics.service'
import { useAuthStore } from '@/stores/auth.store'

export function useClinicDashboard() {
  const clinicId = useAuthStore(s => s.user?.clinicId)
  return useQuery({
    queryKey: ['clinic-dashboard', clinicId],
    queryFn: () => clinicsService.getDashboard(clinicId!),
    enabled: !!clinicId,
  })
}

export function useClinicPatients(params?: {
  page?: number
  limit?: number
  search?: string
  species?: string
}) {
  const clinicId = useAuthStore(s => s.user?.clinicId)
  return useQuery({
    queryKey: ['clinic-patients', clinicId, params],
    queryFn: () => clinicsService.getPatients(clinicId!, params),
    enabled: !!clinicId,
    placeholderData: prev => prev,
  })
}

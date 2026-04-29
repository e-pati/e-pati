'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  vaccinationsService,
  type CreateVaccinationPayload,
  type VaccinationListParams,
} from '@/services/vaccinations.service'

export function useVaccinations(params: VaccinationListParams = {}) {
  return useQuery({
    queryKey: ['vaccinations', params],
    queryFn: () => vaccinationsService.getAll(params),
  })
}

export function useUpcomingVaccinations() {
  return useQuery({
    queryKey: ['vaccinations', 'upcoming'],
    queryFn: vaccinationsService.getUpcoming,
  })
}

export function useCreateVaccination() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateVaccinationPayload) => vaccinationsService.create(payload),
    onSuccess: vaccination => {
      void qc.invalidateQueries({ queryKey: ['vaccinations'] })
      void qc.invalidateQueries({ queryKey: ['pets', vaccination.petId] })
    },
  })
}

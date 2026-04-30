'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { petsService, type CreatePetPayload, type ApiPet } from '@/services/pets.service'
import type { ClinicPatientsResponse } from '@/services/clinics.service'

export function usePets() {
  return useQuery({
    queryKey: ['pets'],
    queryFn: petsService.getAll,
  })
}

export function usePet(id: string) {
  const qc = useQueryClient()
  return useQuery({
    queryKey: ['pets', id],
    queryFn: () => petsService.getOne(id),
    enabled: !!id,
    placeholderData: (): ApiPet | undefined => {
      const cached = qc.getQueriesData<ClinicPatientsResponse>({ queryKey: ['clinic-patients'] })
      for (const [, data] of cached) {
        const found = data?.items?.find(p => p.id === id)
        if (found) return found as unknown as ApiPet
      }
      return undefined
    },
  })
}

export function useCreatePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePetPayload) => petsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pets'] })
      qc.invalidateQueries({ queryKey: ['clinic-patients'] })
    },
  })
}

export function useDeletePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => petsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pets'] })
      qc.invalidateQueries({ queryKey: ['clinic-patients'] })
    },
  })
}

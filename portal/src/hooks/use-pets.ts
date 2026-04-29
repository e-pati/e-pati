'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { petsService, type CreatePetPayload } from '@/services/pets.service'

export function usePets() {
  return useQuery({
    queryKey: ['pets'],
    queryFn: petsService.getAll,
  })
}

export function usePet(id: string) {
  return useQuery({
    queryKey: ['pets', id],
    queryFn: () => petsService.getOne(id),
    enabled: !!id,
  })
}

export function useCreatePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePetPayload) => petsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pets'] }),
  })
}

export function useDeletePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => petsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pets'] }),
  })
}

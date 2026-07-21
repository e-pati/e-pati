'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  registryService,
  type CreateAnimalPayload,
  type CreatePremisePayload,
  type RecordMovementPayload,
} from '@/services/registry.service'

export function useRegistryOverview() {
  return useQuery({
    queryKey: ['registry', 'overview'],
    queryFn: registryService.getOverview,
  })
}

export function useRegistryPremises() {
  return useQuery({
    queryKey: ['registry', 'premises'],
    queryFn: registryService.getPremises,
  })
}

export function useRegistryAnimals() {
  return useQuery({
    queryKey: ['registry', 'animals'],
    queryFn: registryService.getAnimals,
  })
}

export function useRegistryAnimal(id: string) {
  return useQuery({
    queryKey: ['registry', 'animals', id],
    queryFn: () => registryService.getAnimal(id),
    enabled: !!id,
  })
}

export function useCreateRegistryPremise() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePremisePayload) => registryService.createPremise(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registry'] })
    },
  })
}

export function useCreateRegistryAnimal() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAnimalPayload) => registryService.createAnimal(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registry'] })
    },
  })
}

export function useRecordRegistryMovement() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: RecordMovementPayload) => registryService.recordMovement(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registry'] })
    },
  })
}

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  prescriptionsService,
  type CreatePrescriptionPayload,
  type PrescriptionListParams,
} from '@/services/prescriptions.service'

export function usePrescriptions(params: PrescriptionListParams = {}) {
  return useQuery({
    queryKey: ['prescriptions', params],
    queryFn: () => prescriptionsService.getAll(params),
  })
}

export function useCreatePrescription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePrescriptionPayload) => prescriptionsService.create(payload),
    onSuccess: prescription => {
      void qc.invalidateQueries({ queryKey: ['prescriptions'] })
      if (prescription.petId) void qc.invalidateQueries({ queryKey: ['pets', prescription.petId] })
    },
  })
}

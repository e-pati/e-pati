'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  labResultsService,
  type CreateLabResultPayload,
  type LabResultListParams,
} from '@/services/lab-results.service'

export function useLabResults(params: LabResultListParams = {}) {
  return useQuery({
    queryKey: ['lab-results', params],
    queryFn: () => labResultsService.getAll(params),
  })
}

export function useCreateLabResult() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateLabResultPayload) => labResultsService.create(payload),
    onSuccess: labResult => {
      void qc.invalidateQueries({ queryKey: ['lab-results'] })
      void qc.invalidateQueries({ queryKey: ['pets', labResult.petId] })
    },
  })
}

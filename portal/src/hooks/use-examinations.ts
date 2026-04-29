'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  examinationsService,
  type CreateExaminationPayload,
  type ExaminationListParams,
} from '@/services/examinations.service'

export function useExaminations(params: ExaminationListParams = {}) {
  return useQuery({
    queryKey: ['examinations', params],
    queryFn: () => examinationsService.getAll(params),
  })
}

export function useCreateExamination() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateExaminationPayload) => examinationsService.create(payload),
    onSuccess: examination => {
      void qc.invalidateQueries({ queryKey: ['examinations'] })
      void qc.invalidateQueries({ queryKey: ['pets', examination.petId] })
    },
  })
}

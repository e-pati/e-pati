'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '@/services/notifications.service'

export function useNotifications({
  enabled = true,
  subjectId,
}: {
  enabled?: boolean
  subjectId?: string
} = {}) {
  return useQuery({
    queryKey: ['notifications', subjectId],
    queryFn: notificationsService.getAll,
    enabled: enabled && Boolean(subjectId),
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

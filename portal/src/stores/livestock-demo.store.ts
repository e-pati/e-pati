'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
  demoLivestockAnimal,
  destinationEnterprise,
  initialLivestockEvents,
  type DemoEnterprise,
  type DemoLivestockEvent,
} from '@/lib/livestock-demo-data'

interface EnterpriseInput {
  registrationNo: string
  name: string
  city: string
  district: string
  type: string
  capacity: number
}

interface LivestockDemoStore {
  createdEnterprise: DemoEnterprise | null
  animalRegistered: boolean
  movementCompleted: boolean
  currentEnterpriseId: string
  events: DemoLivestockEvent[]
  registerEnterprise: (input: EnterpriseInput) => void
  registerAnimal: () => void
  completeMovement: () => void
  resetDemo: () => void
}

const initialState = {
  createdEnterprise: null,
  animalRegistered: false,
  movementCompleted: false,
  currentEnterpriseId: demoLivestockAnimal.currentEnterpriseId,
  events: initialLivestockEvents,
}

export const useLivestockDemoStore = create<LivestockDemoStore>()(
  persist(
    set => ({
      ...initialState,
      registerEnterprise: input => set({
        createdEnterprise: {
          id: 'enterprise-demo-created',
          ...input,
          animalCount: 0,
          status: 'demo',
        },
      }),
      registerAnimal: () => set(state => {
        if (state.animalRegistered) return state

        return {
          animalRegistered: true,
          events: [
            {
              id: 'event-demo-entry',
              date: '2026-07-21T10:15:00.000Z',
              title: 'Küpe ile işletme girişi yapıldı',
              description: `${demoLivestockAnimal.earTag} numaralı küpe doğrulanarak hayvan profili işletmeye bağlandı.`,
              location: 'Güneş Süt İşletmesi',
              type: 'registration',
            },
            ...state.events,
          ],
        }
      }),
      completeMovement: () => set(state => {
        if (state.movementCompleted) return state

        return {
          movementCompleted: true,
          currentEnterpriseId: destinationEnterprise.id,
          events: [
            {
              id: 'event-demo-movement',
              date: '2026-07-21T11:40:00.000Z',
              title: 'İşletmeler arası hareket tamamlandı',
              description: 'Veteriner sağlık kontrolü ve sevk belgesi doğrulanarak nakil onaylandı.',
              location: destinationEnterprise.name,
              type: 'movement',
            },
            ...state.events,
          ],
        }
      }),
      resetDemo: () => set(initialState),
    }),
    { name: 'epati-livestock-demo' },
  ),
)

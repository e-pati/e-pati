'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
  demoStrayAnimal,
  initialMunicipalityEvents,
  type MunicipalityDemoEvent,
} from '@/lib/municipality-demo-data'

interface MunicipalityDemoStore {
  shelterAdmissionCompleted: boolean
  sterilizationCompleted: boolean
  listingPublished: boolean
  events: MunicipalityDemoEvent[]
  completeShelterAdmission: () => void
  completeSterilization: () => void
  publishListing: () => void
  resetDemo: () => void
}

const initialState = {
  shelterAdmissionCompleted: false,
  sterilizationCompleted: false,
  listingPublished: false,
  events: initialMunicipalityEvents,
}

export const useMunicipalityDemoStore = create<MunicipalityDemoStore>()(
  persist(
    set => ({
      ...initialState,
      completeShelterAdmission: () => set(state => {
        if (state.shelterAdmissionCompleted) return state

        return {
          shelterAdmissionCompleted: true,
          events: [
            {
              id: 'event-shelter-admission',
              date: '2026-07-21T09:15:00.000Z',
              title: 'Barınak kabulü ve kimliklendirme tamamlandı',
              description: `${demoStrayAnimal.hkn} oluşturuldu; mikroçip ve sağlık ön kontrolü kaydedildi.`,
              type: 'intake',
            },
            ...state.events,
          ],
        }
      }),
      completeSterilization: () => set(state => {
        if (state.sterilizationCompleted) return state

        return {
          sterilizationCompleted: true,
          events: [
            {
              id: 'event-sterilization',
              date: '2026-07-21T11:30:00.000Z',
              title: 'Kısırlaştırma operasyonu tamamlandı',
              description: 'Operasyon komplikasyonsuz tamamlandı ve kontrol randevusu planlandı.',
              type: 'health',
            },
            ...state.events,
          ],
        }
      }),
      publishListing: () => set(state => {
        if (state.listingPublished) return state

        return {
          listingPublished: true,
          events: [
            {
              id: 'event-adoption-listing',
              date: '2026-07-21T14:10:00.000Z',
              title: 'Sahiplendirme ilanı yayımlandı',
              description: 'Sağlık ve kısırlaştırma kayıtları doğrulanarak Dost sahiplendirmeye açıldı.',
              type: 'adoption',
            },
            ...state.events,
          ],
        }
      }),
      resetDemo: () => set(initialState),
    }),
    { name: 'epati-municipality-demo' },
  ),
)

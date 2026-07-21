'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { demoPresentationStages } from '@/lib/demo-presentation-data'

interface DemoPresentationStore {
  currentStageIndex: number
  startedAt: number | null
  isRunning: boolean
  startPresentation: () => void
  goToStage: (index: number) => void
  nextStage: () => void
  resetPresentation: () => void
}

const initialState = {
  currentStageIndex: 0,
  startedAt: null,
  isRunning: false,
}

export const useDemoPresentationStore = create<DemoPresentationStore>()(
  persist(
    set => ({
      ...initialState,
      startPresentation: () => set({ currentStageIndex: 0, startedAt: Date.now(), isRunning: true }),
      goToStage: index => set({
        currentStageIndex: Math.max(0, Math.min(index, demoPresentationStages.length - 1)),
        isRunning: true,
      }),
      nextStage: () => set(state => ({
        currentStageIndex: Math.min(state.currentStageIndex + 1, demoPresentationStages.length - 1),
      })),
      resetPresentation: () => set(initialState),
    }),
    { name: 'epati-demo-presentation' },
  ),
)

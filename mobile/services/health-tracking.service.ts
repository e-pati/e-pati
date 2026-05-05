import { api } from '@/lib/api'

export interface WeightLog {
  id: string
  petId: string
  petName?: string
  weightKg: number
  bodyConditionScore?: number
  notes?: string
  loggedAt: string
}

export interface DietPlan {
  id: string
  petId: string
  petName?: string
  foodName: string
  dailyAmountGrams: number
  mealsPerDay: number
  notes?: string
  startedAt?: string
  isActive: boolean
}

export interface HealthTrackingOverview {
  weightLogs: WeightLog[]
  dietPlans: DietPlan[]
}

export interface CreateWeightLogPayload {
  petId: string
  weightKg: number
  bodyConditionScore?: number
  notes?: string
  loggedAt?: string
}

export interface CreateDietPlanPayload {
  petId: string
  foodName: string
  dailyAmountGrams: number
  mealsPerDay: number
  notes?: string
}

export const healthTrackingService = {
  async getOverview(): Promise<HealthTrackingOverview> {
    const { data } = await api.get<HealthTrackingOverview>('/owner-health/overview')
    return data
  },

  async createWeightLog(payload: CreateWeightLogPayload): Promise<WeightLog> {
    const { data } = await api.post<WeightLog>('/owner-health/weight-logs', payload)
    return data
  },

  async createDietPlan(payload: CreateDietPlanPayload): Promise<DietPlan> {
    const { data } = await api.post<DietPlan>('/owner-health/diet-plans', payload)
    return data
  },
}

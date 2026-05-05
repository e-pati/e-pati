import { useMemo, useState } from 'react'
import {
  ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Colors, Fonts, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'
import { speciesEmoji } from '@/lib/utils'
import { petsService } from '@/services/pets.service'
import { healthTrackingService, type WeightLog } from '@/services/health-tracking.service'
import type { PetSpecies } from '@/types'

const BCS_OPTIONS = [1, 2, 3, 4, 5]

export default function HealthTrackingScreen() {
  const { petId } = useLocalSearchParams<{ petId?: string }>()
  const qc = useQueryClient()
  const [selectedPetId, setSelectedPetId] = useState(petId ?? '')
  const [weightKg, setWeightKg] = useState('')
  const [bodyConditionScore, setBodyConditionScore] = useState(3)
  const [weightNotes, setWeightNotes] = useState('')
  const [foodName, setFoodName] = useState('')
  const [dailyAmountGrams, setDailyAmountGrams] = useState('')
  const [mealsPerDay, setMealsPerDay] = useState('2')
  const [dietNotes, setDietNotes] = useState('')

  const petsQuery = useQuery({
    queryKey: ['pets'],
    queryFn: petsService.getAll,
    retry: 1,
  })

  const overviewQuery = useQuery({
    queryKey: ['owner-health-overview'],
    queryFn: healthTrackingService.getOverview,
    retry: 1,
  })

  const selectedPet = petsQuery.data?.find(pet => pet.id === selectedPetId) ?? petsQuery.data?.[0]
  const selectedId = selectedPetId || selectedPet?.id || ''

  const weightLogs = useMemo(() => (
    (overviewQuery.data?.weightLogs ?? [])
      .filter(log => !selectedId || log.petId === selectedId)
      .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
  ), [overviewQuery.data?.weightLogs, selectedId])

  const activeDiet = useMemo(() => (
    (overviewQuery.data?.dietPlans ?? [])
      .find(plan => plan.petId === selectedId && plan.isActive)
  ), [overviewQuery.data?.dietPlans, selectedId])

  const createWeightLog = useMutation({
    mutationFn: healthTrackingService.createWeightLog,
    onSuccess: () => {
      setWeightKg('')
      setWeightNotes('')
      qc.invalidateQueries({ queryKey: ['owner-health-overview'] })
      Alert.alert('Kilo kaydı', 'Yeni kilo kaydı eklendi.')
    },
  })

  const createDietPlan = useMutation({
    mutationFn: healthTrackingService.createDietPlan,
    onSuccess: () => {
      setFoodName('')
      setDailyAmountGrams('')
      setDietNotes('')
      qc.invalidateQueries({ queryKey: ['owner-health-overview'] })
      Alert.alert('Diyet planı', 'Diyet planı kaydedildi.')
    },
  })

  const submitWeightLog = () => {
    const parsedWeight = Number(weightKg.replace(',', '.'))
    if (!selectedId || !Number.isFinite(parsedWeight) || parsedWeight <= 0) return
    createWeightLog.mutate({
      petId: selectedId,
      weightKg: parsedWeight,
      bodyConditionScore,
      notes: weightNotes.trim() || undefined,
      loggedAt: new Date().toISOString(),
    })
  }

  const submitDietPlan = () => {
    const parsedAmount = Number(dailyAmountGrams.replace(',', '.'))
    const parsedMeals = Number(mealsPerDay)
    if (!selectedId || !foodName.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0 || !Number.isFinite(parsedMeals) || parsedMeals <= 0) return
    createDietPlan.mutate({
      petId: selectedId,
      foodName: foodName.trim(),
      dailyAmountGrams: parsedAmount,
      mealsPerDay: parsedMeals,
      notes: dietNotes.trim() || undefined,
    })
  }

  const latestWeight = weightLogs[0]
  const previousWeight = weightLogs[1]
  const weightDelta = latestWeight && previousWeight
    ? latestWeight.weightKg - previousWeight.weightKg
    : null
  const hasEndpointError = overviewQuery.isError

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Diyet ve Kilo</Text>
          <Text style={styles.headerSubtitle}>Premium sağlık takip defteri</Text>
        </View>
      </View>

      {hasEndpointError && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>Diyet ve kilo endpointleri henüz hazır değil. Backend kontratı bekleniyor.</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={overviewQuery.isRefetching} onRefresh={overviewQuery.refetch} tintColor={Colors.primary} />}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Hayvan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petRow}>
            {petsQuery.isLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (petsQuery.data ?? []).length === 0 ? (
              <Text style={styles.mutedText}>Hayvan listesi alınamadı</Text>
            ) : (petsQuery.data ?? []).map(pet => {
              const active = selectedId === pet.id
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[styles.petPill, active && styles.petPillActive]}
                  onPress={() => setSelectedPetId(pet.id)}
                >
                  <Text style={styles.petEmoji}>{speciesEmoji(normalizeSpecies(pet.species))}</Text>
                  <Text style={[styles.petName, active && styles.petNameActive]}>{pet.name}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        <View style={styles.summaryRow}>
          <MetricCard
            icon="scale-outline"
            label="Son kilo"
            value={latestWeight ? `${latestWeight.weightKg.toFixed(1)} kg` : '-'}
            hint={formatDelta(weightDelta)}
            color={Colors.primary}
          />
          <MetricCard
            icon="restaurant-outline"
            label="Aktif diyet"
            value={activeDiet ? `${activeDiet.mealsPerDay} öğün` : '-'}
            hint={activeDiet?.foodName ?? 'Plan yok'}
            color={Colors.info}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kilo Kaydı</Text>
          <Text style={styles.label}>Kilo (kg)</Text>
          <TextInput
            style={styles.input}
            value={weightKg}
            onChangeText={setWeightKg}
            placeholder="4.8"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Vücut kondisyon skoru</Text>
          <View style={styles.scoreRow}>
            {BCS_OPTIONS.map(score => (
              <TouchableOpacity
                key={score}
                style={[styles.scorePill, bodyConditionScore === score && styles.scorePillActive]}
                onPress={() => setBodyConditionScore(score)}
              >
                <Text style={[styles.scoreText, bodyConditionScore === score && styles.scoreTextActive]}>{score}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Not</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={weightNotes}
            onChangeText={setWeightNotes}
            placeholder="Mama değişimi, iştah, aktivite..."
            placeholderTextColor={Colors.textMuted}
            multiline
          />

          {createWeightLog.isError && <Text style={styles.errorText}>Kilo kaydı gönderilemedi. Endpoint bekleniyor.</Text>}
          <TouchableOpacity
            style={[styles.submitButton, (!selectedId || !weightKg || createWeightLog.isPending) && styles.submitButtonDisabled]}
            onPress={submitWeightLog}
            disabled={!selectedId || !weightKg || createWeightLog.isPending}
          >
            {createWeightLog.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitButtonText}>Kilo Kaydet</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Diyet Planı</Text>
          <Text style={styles.label}>Mama / beslenme</Text>
          <TextInput
            style={styles.input}
            value={foodName}
            onChangeText={setFoodName}
            placeholder="Somonlu yetişkin kedi maması"
            placeholderTextColor={Colors.textMuted}
          />

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <Text style={styles.label}>Günlük gram</Text>
              <TextInput
                style={styles.input}
                value={dailyAmountGrams}
                onChangeText={setDailyAmountGrams}
                placeholder="80"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.formColumn}>
              <Text style={styles.label}>Öğün</Text>
              <TextInput
                style={styles.input}
                value={mealsPerDay}
                onChangeText={setMealsPerDay}
                placeholder="2"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={styles.label}>Talimat</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={dietNotes}
            onChangeText={setDietNotes}
            placeholder="Sabah/akşam böl, ödül mamasını azalt..."
            placeholderTextColor={Colors.textMuted}
            multiline
          />

          {createDietPlan.isError && <Text style={styles.errorText}>Diyet planı gönderilemedi. Endpoint bekleniyor.</Text>}
          <TouchableOpacity
            style={[styles.submitButton, (!selectedId || !foodName.trim() || !dailyAmountGrams || createDietPlan.isPending) && styles.submitButtonDisabled]}
            onPress={submitDietPlan}
            disabled={!selectedId || !foodName.trim() || !dailyAmountGrams || createDietPlan.isPending}
          >
            {createDietPlan.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitButtonText}>Diyet Planını Kaydet</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Son Kilo Kayıtları</Text>
          {overviewQuery.isLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : weightLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={38} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Henüz kayıt yok</Text>
              <Text style={styles.emptyText}>İlk kilo kaydı eklendiğinde trend burada görünecek.</Text>
            </View>
          ) : (
            weightLogs.slice(0, 6).map(log => <WeightLogRow key={log.id} log={log} />)
          )}
        </View>

        <View style={styles.contractCard}>
          <Text style={styles.contractTitle}>Backend kontratı</Text>
          {[
            'GET /owner-health/overview',
            'POST /owner-health/weight-logs',
            'POST /owner-health/diet-plans',
          ].map(endpoint => (
            <Text key={endpoint} style={styles.codeText}>{endpoint}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function MetricCard({ icon, label, value, hint, color }: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  value: string
  hint: string
  color: string
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricHint} numberOfLines={1}>{hint}</Text>
    </View>
  )
}

function WeightLogRow({ log }: { log: WeightLog }) {
  return (
    <View style={styles.logRow}>
      <View style={styles.logIcon}>
        <Ionicons name="scale-outline" size={18} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.logTitle}>{log.weightKg.toFixed(1)} kg</Text>
        <Text style={styles.logMeta}>
          {formatDate(log.loggedAt)}{log.bodyConditionScore ? ` · BCS ${log.bodyConditionScore}/5` : ''}
        </Text>
        {log.notes && <Text style={styles.logNotes} numberOfLines={2}>{log.notes}</Text>}
      </View>
    </View>
  )
}

function normalizeSpecies(species: string): PetSpecies {
  const normalized = species.toLowerCase()
  if (normalized === 'dog' || normalized === 'cat' || normalized === 'bird' || normalized === 'rabbit') {
    return normalized
  }
  return 'other'
}

function formatDelta(delta: number | null): string {
  if (delta === null) return 'Önceki kayıt yok'
  if (Math.abs(delta) < 0.05) return 'Değişim yok'
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg`
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButton: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  headerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  warningBox: { margin: Spacing.lg, marginBottom: 0, backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  warningText: { color: '#92400e', fontSize: FontSize.sm },
  content: { padding: Spacing.lg, paddingBottom: 42 },
  card: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text, marginBottom: Spacing.md },
  petRow: { gap: Spacing.sm, paddingRight: Spacing.md },
  petPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: 8, backgroundColor: '#fff' },
  petPillActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  petEmoji: { fontSize: 16 },
  petName: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  petNameActive: { color: Colors.primary },
  mutedText: { fontSize: FontSize.sm, color: Colors.textMuted },
  summaryRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  metricCard: { flex: 1, backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  metricIcon: { width: 38, height: 38, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  metricValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  metricHint: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 5 },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 7, marginTop: Spacing.sm },
  input: { minHeight: 46, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, backgroundColor: Colors.surface, color: Colors.text, fontSize: FontSize.base },
  textarea: { minHeight: 84, paddingTop: Spacing.md, textAlignVertical: 'top' },
  scoreRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  scorePill: { width: 42, height: 38, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
  scorePillActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  scoreText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  scoreTextActive: { color: '#fff' },
  formRow: { flexDirection: 'row', gap: Spacing.md },
  formColumn: { flex: 1 },
  submitButton: { height: 48, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg },
  submitButtonDisabled: { opacity: 0.55 },
  submitButtonText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.bold, fontFamily: Fonts.bold },
  errorText: { color: Colors.danger, fontSize: FontSize.sm, marginTop: Spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },
  logRow: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  logIcon: { width: 38, height: 38, borderRadius: Radius.lg, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  logTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  logMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  logNotes: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 5, lineHeight: 18 },
  contractCard: { backgroundColor: '#ecfeff', borderColor: '#a5f3fc', borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.lg },
  contractTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#0e7490', marginBottom: Spacing.sm },
  codeText: { fontSize: FontSize.xs, color: '#155e75', backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: Radius.md, padding: Spacing.sm, marginTop: Spacing.sm },
})

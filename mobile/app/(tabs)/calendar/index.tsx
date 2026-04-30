import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { mockVaccinations, mockPets, mockExaminations } from '@/lib/mock-data'
import { vaccinationsService, type ApiVaccination } from '@/services/vaccinations.service'
import { examinationsService, type ApiExamination } from '@/services/examinations.service'
import { petsService, type ApiPet } from '@/services/pets.service'
import type { PetSpecies } from '@/types'
import { formatDateShort, speciesEmoji, isVaccinationOverdue, isVaccinationDueSoon } from '@/lib/utils'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

type FilterType = 'all' | 'upcoming' | 'overdue' | 'followup'

export default function CalendarScreen() {
  const [filter, setFilter] = useState<FilterType>('all')
  const vaccinationsQuery = useQuery({
    queryKey: ['vaccinations', 'upcoming'],
    queryFn: vaccinationsService.getUpcoming,
    retry: 1,
  })
  const examinationsQuery = useQuery({
    queryKey: ['examinations'],
    queryFn: () => examinationsService.getAll({ limit: 200 }),
    retry: 1,
  })
  const petsQuery = useQuery({
    queryKey: ['pets'],
    queryFn: petsService.getAll,
    retry: 1,
  })

  const pets = petsQuery.data ?? (petsQuery.isError ? mockPets.map(mapMockPet) : [])
  const vaccines = vaccinationsQuery.data ?? (
    vaccinationsQuery.isError ? mockVaccinations.map(mapMockVaccination) : []
  )

  // Takip tarihi olan muayeneler
  const followUps = (examinationsQuery.data ?? (
    examinationsQuery.isError
      ? mockExaminations.filter(e => e.followUpDate).map(e => ({
          id: e.id, petId: e.petId, followUpDate: e.followUpDate!,
          complaint: e.complaint,
        }))
      : []
  )).filter((e: any) => e.followUpDate && new Date(e.followUpDate) >= new Date())
    .map((e: any) => ({
      ...e,
      pet: pets.find(p => p.id === e.petId),
      dueDate: e.followUpDate,
    }))
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const allVaccines = vaccines.map(v => {
    const dueAt = v.dueAt ?? v.appliedAt
    return {
      ...v,
      pet: pets.find(p => p.id === v.petId),
      dueAt,
      overdue: isVaccinationOverdue(dueAt),
      soon: isVaccinationDueSoon(dueAt, 30),
    }
  }).sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())

  const filtered = allVaccines.filter(v => {
    if (filter === 'upcoming') return v.soon && !v.overdue
    if (filter === 'overdue') return v.overdue
    return true
  })

  const overdueCount = allVaccines.filter(v => v.overdue).length
  const upcomingCount = allVaccines.filter(v => v.soon && !v.overdue).length

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Takvim</Text>
        <Text style={styles.subtitle}>Aşı ve kontrol takibi</Text>
      </View>

      {(vaccinationsQuery.isLoading || petsQuery.isLoading) && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={Colors.primary} size="small" />
          <Text style={styles.loadingText}>Aşı takvimi yükleniyor...</Text>
        </View>
      )}

      {(vaccinationsQuery.isError || petsQuery.isError) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ API bağlantısı kurulamadı — örnek aşı takvimi gösteriliyor</Text>
        </View>
      )}

      {/* Özet kartları */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: Colors.danger + '40', backgroundColor: Colors.danger + '10' }]}>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>{overdueCount}</Text>
          <Text style={styles.summaryLabel}>Gecikmiş Aşı</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: Colors.warning + '40', backgroundColor: Colors.warning + '10' }]}>
          <Text style={[styles.summaryValue, { color: Colors.warning }]}>{upcomingCount}</Text>
          <Text style={styles.summaryLabel}>Yaklaşan (30 gün)</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: Colors.primaryBorder, backgroundColor: Colors.primaryBg }]}>
          <Text style={[styles.summaryValue, { color: Colors.primary }]}>{allVaccines.length}</Text>
          <Text style={styles.summaryLabel}>Toplam Aşı</Text>
        </View>
      </View>

      {/* Filtreler */}
      <View style={styles.filters}>
        {([
          { key: 'all', label: 'Tümü' },
          { key: 'overdue', label: `Gecikmiş (${overdueCount})` },
          { key: 'upcoming', label: `Yaklaşan (${upcomingCount})` },
          { key: 'followup', label: `Takip (${followUps.length})` },
        ] as const).map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {/* Takip tarihleri */}
        {filter === 'followup' ? (
          followUps.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyText}>Yaklaşan takip randevusu yok</Text>
            </View>
          ) : (
            followUps.map((item: any) => (
              <View key={item.id} style={[styles.item, { borderColor: Colors.info + '40', backgroundColor: Colors.info + '05' }]}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemEmoji}>{speciesEmoji(normalizeSpecies(item.pet?.species ?? 'other'))}</Text>
                </View>
                <View style={styles.itemCenter}>
                  <Text style={styles.itemPet}>{item.pet?.name ?? 'Hasta bilgisi yok'}</Text>
                  <Text style={styles.itemVaccine}>🩺 Takip Muayenesi</Text>
                  <Text style={styles.itemManufacturer} numberOfLines={1}>{item.complaint}</Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={[styles.itemDate, { color: Colors.info }]}>
                    {formatDateShort(item.dueDate)}
                  </Text>
                  <View style={[styles.statusDot, { backgroundColor: Colors.info }]} />
                </View>
              </View>
            ))
          )
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyText}>Tüm aşılar güncel!</Text>
          </View>
        ) : (
          filtered.map(item => (
            <View key={item.id} style={[styles.item, item.overdue && styles.itemOverdue, item.soon && !item.overdue && styles.itemSoon]}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemEmoji}>{speciesEmoji(normalizeSpecies(item.pet?.species ?? 'other'))}</Text>
              </View>
              <View style={styles.itemCenter}>
                <Text style={styles.itemPet}>{item.pet?.name ?? 'Hasta bilgisi yok'}</Text>
                <Text style={styles.itemVaccine}>{item.name}</Text>
                {item.notes && <Text style={styles.itemManufacturer}>{item.notes}</Text>}
              </View>
              <View style={styles.itemRight}>
                <Text style={[
                  styles.itemDate,
                  item.overdue && { color: Colors.danger },
                  item.soon && !item.overdue && { color: Colors.warning },
                ]}>
                  {formatDateShort(item.dueAt)}
                </Text>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: item.overdue ? Colors.danger : item.soon ? Colors.warning : Colors.primary },
                ]} />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function normalizeSpecies(species: string): PetSpecies {
  const normalized = species.toLowerCase()
  if (normalized === 'dog' || normalized === 'cat' || normalized === 'bird' || normalized === 'rabbit') {
    return normalized
  }
  return 'other'
}

function mapMockPet(pet: (typeof mockPets)[number]): ApiPet {
  return {
    id: pet.id,
    ownerId: pet.ownerId,
    name: pet.name,
    species: normalizeSpecies(pet.species),
    breed: pet.breed,
    sex: pet.gender,
    birthDate: pet.birthDate,
    microchipNo: pet.microchipNo,
    createdAt: new Date().toISOString(),
  }
}

function mapMockVaccination(vaccination: (typeof mockVaccinations)[number]): ApiVaccination {
  return {
    id: vaccination.id,
    petId: vaccination.petId,
    name: vaccination.vaccineName,
    appliedAt: vaccination.appliedDate,
    dueAt: vaccination.nextDate,
    notes: vaccination.manufacturer,
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: 10, marginBottom: Spacing.lg },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  loadingText: { fontSize: FontSize.xs, color: Colors.textMuted },
  errorBanner: {
    marginHorizontal: Spacing.xl, marginBottom: Spacing.md,
    backgroundColor: '#fef3cd', borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: '#fde68a',
  },
  errorText: { fontSize: FontSize.xs, color: '#92400e' },
  summaryCard: {
    flex: 1, borderRadius: Radius.lg, padding: Spacing.md,
    alignItems: 'center', borderWidth: 1,
  },
  summaryValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  filters: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: 8, marginBottom: Spacing.lg },
  filterBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 24, gap: 10 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  itemOverdue: { borderColor: Colors.danger + '40', backgroundColor: Colors.danger + '05' },
  itemSoon: { borderColor: Colors.warning + '40', backgroundColor: Colors.warning + '05' },
  itemLeft: {},
  itemEmoji: { fontSize: 28 },
  itemCenter: { flex: 1 },
  itemPet: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  itemVaccine: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  itemManufacturer: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  itemRight: { alignItems: 'flex-end', gap: 6 },
  itemDate: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.lg },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted },
})

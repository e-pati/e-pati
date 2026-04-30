import { useState, useMemo } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator,
} from 'react-native'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { useQuery } from '@tanstack/react-query'
import { mockVaccinations, mockPets, mockExaminations } from '@/lib/mock-data'
import { vaccinationsService, type ApiVaccination } from '@/services/vaccinations.service'
import { examinationsService } from '@/services/examinations.service'
import { petsService, type ApiPet } from '@/services/pets.service'
import type { PetSpecies } from '@/types'
import { formatDateShort, speciesEmoji, isVaccinationOverdue } from '@/lib/utils'
import { Colors, Spacing, Radius, FontSize, FontWeight, Fonts } from '@/constants/theme'

// Takvimi Türkçe'ye ayarla
LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
  dayNamesShort: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
  today: 'Bugün',
}
LocaleConfig.defaultLocale = 'tr'

function normalizeSpecies(species: string): PetSpecies {
  const n = species.toLowerCase()
  if (n === 'dog' || n === 'cat' || n === 'bird' || n === 'rabbit') return n
  return 'other'
}

function toDateStr(date: string) {
  return date.split('T')[0]
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const vaccinationsQuery = useQuery({
    queryKey: ['vaccinations', 'all'],
    queryFn: () => vaccinationsService.getAll({ limit: 500 }),
    retry: 1,
  })
  const examinationsQuery = useQuery({
    queryKey: ['examinations'],
    queryFn: () => examinationsService.getAll({ limit: 500 }),
    retry: 1,
  })
  const petsQuery = useQuery({
    queryKey: ['pets'],
    queryFn: petsService.getAll,
    retry: 1,
  })

  const pets = petsQuery.data ?? []

  const vaccines = vaccinationsQuery.data ?? mockVaccinations.map(v => ({
    id: v.id, petId: v.petId, name: v.vaccineName,
    appliedAt: v.appliedDate, dueAt: v.nextDate,
  } as ApiVaccination))

  const examinations = examinationsQuery.data ?? mockExaminations.map(e => ({
    id: e.id, petId: e.petId, complaint: e.complaint,
    findings: e.findings, assessment: e.assessment, plan: e.plan,
    createdAt: e.date, followUpDate: e.followUpDate,
  }))

  // Takvim işaret objesini oluştur
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {}

    // Aşı tarihleri — kırmızı/turuncu nokta
    vaccines.forEach(v => {
      if (v.dueAt) {
        const d = toDateStr(v.dueAt)
        const overdue = isVaccinationOverdue(v.dueAt)
        marks[d] = {
          ...(marks[d] ?? {}),
          marked: true,
          dotColor: overdue ? Colors.danger : Colors.warning,
        }
      }
    })

    // Takip tarihleri — mavi nokta
    examinations.forEach(e => {
      if (e.followUpDate) {
        const d = toDateStr(e.followUpDate)
        marks[d] = {
          ...(marks[d] ?? {}),
          marked: true,
          dotColor: Colors.info,
        }
      }
    })

    // Seçilen gün
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] ?? {}),
        selected: true,
        selectedColor: Colors.primary,
      }
    }

    return marks
  }, [vaccines, examinations, selectedDate])

  // Seçilen günün olayları
  const selectedEvents = useMemo(() => {
    const events: Array<{ type: 'vaccine' | 'followup'; label: string; pet?: ApiPet; overdue?: boolean }> = []

    vaccines.forEach(v => {
      if (v.dueAt && toDateStr(v.dueAt) === selectedDate) {
        const pet = pets.find(p => p.id === v.petId)
        events.push({ type: 'vaccine', label: v.name, pet, overdue: isVaccinationOverdue(v.dueAt) })
      }
    })

    examinations.forEach(e => {
      if (e.followUpDate && toDateStr(e.followUpDate) === selectedDate) {
        const pet = pets.find(p => p.id === e.petId)
        events.push({ type: 'followup', label: 'Takip Muayenesi', pet })
      }
    })

    return events
  }, [selectedDate, vaccines, examinations, pets])

  const isLoading = vaccinationsQuery.isLoading || examinationsQuery.isLoading || petsQuery.isLoading

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Takvim</Text>
        <Text style={styles.subtitle}>Aşı ve takip randevuları</Text>
      </View>

      {isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={Colors.primary} size="small" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      )}

      {/* Takvim widget */}
      <Calendar
        current={selectedDate}
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          backgroundColor: Colors.background,
          calendarBackground: Colors.background,
          selectedDayBackgroundColor: Colors.primary,
          selectedDayTextColor: '#fff',
          todayTextColor: Colors.primary,
          dayTextColor: Colors.text,
          textDisabledColor: Colors.textMuted,
          dotColor: Colors.primary,
          selectedDotColor: '#fff',
          arrowColor: Colors.primary,
          monthTextColor: Colors.text,
          textDayFontSize: 14,
          textMonthFontSize: 15,
          textDayHeaderFontSize: 12,
          textDayFontWeight: '400',
          textMonthFontWeight: '700',
        }}
        style={styles.calendar}
      />

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
          <Text style={styles.legendText}>Yaklaşan aşı</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
          <Text style={styles.legendText}>Gecikmiş aşı</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
          <Text style={styles.legendText}>Takip muayenesi</Text>
        </View>
      </View>

      {/* Seçilen günün olayları */}
      <ScrollView style={styles.events} showsVerticalScrollIndicator={false}>
        <Text style={styles.eventsTitle}>
          {selectedDate === new Date().toISOString().split('T')[0] ? 'Bugün' : formatDateShort(selectedDate)}
        </Text>

        {selectedEvents.length === 0 ? (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayText}>Bu güne ait etkinlik yok</Text>
          </View>
        ) : (
          selectedEvents.map((event, i) => (
            <View key={i} style={[
              styles.eventItem,
              event.type === 'vaccine' && event.overdue && styles.eventOverdue,
              event.type === 'followup' && styles.eventFollowup,
            ]}>
              <Text style={styles.eventEmoji}>
                {event.type === 'vaccine' ? '💉' : '🩺'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventLabel}>{event.label}</Text>
                {event.pet && (
                  <Text style={styles.eventPet}>
                    {speciesEmoji(normalizeSpecies(event.pet.species))} {event.pet.name}
                  </Text>
                )}
                {event.overdue && (
                  <Text style={styles.overdueTag}>⚠️ Gecikmiş</Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.xl, marginBottom: Spacing.sm },
  loadingText: { fontSize: FontSize.xs, color: Colors.textMuted },
  calendar: {
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row', gap: Spacing.lg,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  events: { flex: 1, paddingHorizontal: Spacing.xl },
  eventsTitle: {
    fontSize: FontSize.base, fontWeight: FontWeight.semibold,
    color: Colors.text, marginBottom: Spacing.md,
  },
  emptyDay: { paddingVertical: Spacing.xl, alignItems: 'center' },
  emptyDayText: { fontSize: FontSize.sm, color: Colors.textMuted },
  eventItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.background, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  eventOverdue: { borderColor: Colors.danger + '50', backgroundColor: Colors.danger + '05' },
  eventFollowup: { borderColor: Colors.info + '50', backgroundColor: Colors.info + '05' },
  eventEmoji: { fontSize: 22 },
  eventLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.text },
  eventPet: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  overdueTag: { fontSize: FontSize.xs, color: Colors.danger, marginTop: 3, fontWeight: FontWeight.medium },
})

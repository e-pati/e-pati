import { useState, useMemo } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Platform,
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
import { Ionicons } from '@expo/vector-icons'

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

function toDateStr(date: string) { return date.split('T')[0] }

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const vaccinationsQuery = useQuery({ queryKey: ['vaccinations', 'all'], queryFn: () => vaccinationsService.getAll({ limit: 500 }), retry: 1 })
  const examinationsQuery = useQuery({ queryKey: ['examinations'], queryFn: () => examinationsService.getAll({ limit: 500 }), retry: 1 })
  const petsQuery = useQuery({ queryKey: ['pets'], queryFn: petsService.getAll, retry: 1 })

  const pets = petsQuery.data ?? []
  const vaccines = vaccinationsQuery.data ?? mockVaccinations.map(v => ({ id: v.id, petId: v.petId, name: v.vaccineName, appliedAt: v.appliedDate, dueAt: v.nextDate } as ApiVaccination))
  const examinations = examinationsQuery.data ?? mockExaminations.map(e => ({ id: e.id, petId: e.petId, complaint: e.complaint, findings: e.findings, assessment: e.assessment, plan: e.plan, createdAt: e.date, followUpDate: e.followUpDate }))

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {}
    vaccines.forEach(v => {
      if (v.dueAt) {
        const d = toDateStr(v.dueAt)
        marks[d] = { ...(marks[d] ?? {}), marked: true, dotColor: isVaccinationOverdue(v.dueAt) ? Colors.danger : Colors.warning }
      }
    })
    examinations.forEach(e => {
      if (e.followUpDate) {
        const d = toDateStr(e.followUpDate)
        marks[d] = { ...(marks[d] ?? {}), marked: true, dotColor: Colors.info }
      }
    })
    if (selectedDate) marks[selectedDate] = { ...(marks[selectedDate] ?? {}), selected: true, selectedColor: Colors.primary }
    return marks
  }, [vaccines, examinations, selectedDate])

  const selectedEvents = useMemo(() => {
    const events: Array<{ type: 'vaccine' | 'followup'; label: string; pet?: ApiPet; overdue?: boolean }> = []
    vaccines.forEach(v => {
      if (v.dueAt && toDateStr(v.dueAt) === selectedDate) {
        events.push({ type: 'vaccine', label: v.name, pet: pets.find(p => p.id === v.petId), overdue: isVaccinationOverdue(v.dueAt) })
      }
    })
    examinations.forEach(e => {
      if (e.followUpDate && toDateStr(e.followUpDate) === selectedDate) {
        events.push({ type: 'followup', label: 'Takip Muayenesi', pet: pets.find(p => p.id === e.petId) })
      }
    })
    return events
  }, [selectedDate, vaccines, examinations, pets])

  const isLoading = vaccinationsQuery.isLoading || examinationsQuery.isLoading

  const today = new Date().toISOString().split('T')[0]
  const upcomingCount = vaccines.filter(v => v.dueAt && !isVaccinationOverdue(v.dueAt)).length
  const overdueCount = vaccines.filter(v => v.dueAt && isVaccinationOverdue(v.dueAt)).length

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Takvim</Text>
            <Text style={styles.headerSubtitle}>Aşı ve takip randevuları</Text>
          </View>
          {isLoading && <ActivityIndicator color="rgba(255,255,255,0.8)" size="small" />}
        </View>
        <View style={styles.statRow}>
          <View style={styles.statPill}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statText}>{upcomingCount} yaklaşan</Text>
          </View>
          <View style={[styles.statPill, overdueCount > 0 && styles.statPillDanger]}>
            <Ionicons name="warning-outline" size={14} color={overdueCount > 0 ? '#fca5a5' : 'rgba(255,255,255,0.9)'} />
            <Text style={[styles.statText, overdueCount > 0 && styles.statTextDanger]}>{overdueCount} gecikmiş</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Takvim */}
        <View style={styles.calendarCard}>
          <Calendar
            current={selectedDate}
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#fff',
              calendarBackground: '#fff',
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
              textDayHeaderFontSize: 11,
              textMonthFontWeight: '700',
              textDayFontFamily: Fonts.regular,
              textMonthFontFamily: Fonts.bold,
            }}
          />
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: Colors.warning, label: 'Yaklaşan aşı' },
            { color: Colors.danger, label: 'Gecikmiş' },
            { color: Colors.info, label: 'Takip' },
          ].map(l => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Seçilen günün olayları */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>
            {selectedDate === today ? 'Bugün' : formatDateShort(selectedDate)}
          </Text>
          {selectedEvents.length === 0 ? (
            <View style={styles.emptyDay}>
              <Ionicons name="sparkles-outline" size={36} color={Colors.textMuted} style={{ marginBottom: Spacing.sm }} />
              <Text style={styles.emptyDayText}>Bu güne ait etkinlik yok</Text>
            </View>
          ) : (
            selectedEvents.map((event, i) => (
              <View key={i} style={[styles.eventCard, event.overdue && styles.eventCardDanger, event.type === 'followup' && styles.eventCardInfo]}>
                <View style={[styles.eventAccent, { backgroundColor: event.overdue ? Colors.danger : event.type === 'followup' ? Colors.info : Colors.warning }]} />
                <View style={[styles.eventIconCircle, { backgroundColor: (event.overdue ? Colors.danger : event.type === 'followup' ? Colors.info : Colors.warning) + '18' }]}>
                  <Ionicons name={event.type === 'vaccine' ? 'medical-outline' : 'fitness-outline'} size={20} color={event.overdue ? Colors.danger : event.type === 'followup' ? Colors.info : Colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventLabel}>{event.label}</Text>
                  {event.pet && <Text style={styles.eventPet}>{speciesEmoji(normalizeSpecies(event.pet.species))} {event.pet.name}</Text>}
                  {event.overdue && <Text style={styles.overdueTag}>⚠️ Gecikmiş</Text>}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: {
    backgroundColor: Colors.primaryDark,
    paddingTop: Platform.OS === 'android' ? Spacing.xl : 0,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  headerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.xl },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
  },
  statPillDanger: { backgroundColor: 'rgba(239,68,68,0.2)' },
  statEmoji: { fontSize: 13 },
  statText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.9)', fontWeight: FontWeight.medium },
  statTextDanger: { color: '#fca5a5' },
  calendarCard: {
    margin: Spacing.xl, borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: '#fff',
    shadowColor: '#059669', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  legend: { flexDirection: 'row', gap: Spacing.lg, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  eventsSection: { paddingHorizontal: Spacing.xl, paddingBottom: 32 },
  eventsTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text, marginBottom: Spacing.md },
  emptyDay: { alignItems: 'center', paddingVertical: Spacing.xxl, backgroundColor: '#fff', borderRadius: Radius.xl },
  emptyDayEmoji: { fontSize: 36 },
  emptyDayText: { fontSize: FontSize.sm, color: Colors.textMuted },
  eventIconCircle: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  eventCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: '#fff', borderRadius: Radius.xl, overflow: 'hidden',
    marginBottom: Spacing.sm,
    shadowColor: '#059669', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  eventCardDanger: { shadowColor: Colors.danger },
  eventCardInfo: { shadowColor: Colors.info },
  eventAccent: { width: 5, alignSelf: 'stretch', minHeight: 56 },
  eventEmoji: { fontSize: 24 },
  eventLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  eventPet: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  overdueTag: { fontSize: FontSize.xs, color: Colors.danger, marginTop: 3, fontWeight: FontWeight.medium },
})

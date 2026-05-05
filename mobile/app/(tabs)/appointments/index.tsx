import { useMemo, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput,
} from 'react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { appointmentsService, type ApiAppointment } from '@/services/appointments.service'
import { petsService } from '@/services/pets.service'
import { Colors, Fonts, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'
import { formatDateShort, speciesEmoji } from '@/lib/utils'
import type { PetSpecies } from '@/types'

const TIME_OPTIONS = ['09:00', '10:30', '13:00', '14:30', '16:00']

export default function AppointmentsScreen() {
  const qc = useQueryClient()
  const [requestOpen, setRequestOpen] = useState(false)
  const [selectedPetId, setSelectedPetId] = useState('')
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0])
  const [preferredTime, setPreferredTime] = useState(TIME_OPTIONS[0])
  const [reason, setReason] = useState('')

  const appointmentsQuery = useQuery({
    queryKey: ['appointments'],
    queryFn: appointmentsService.getAll,
    retry: 1,
  })
  const petsQuery = useQuery({
    queryKey: ['pets'],
    queryFn: petsService.getAll,
    retry: 1,
  })

  const requestAppointment = useMutation({
    mutationFn: appointmentsService.request,
    onSuccess: () => {
      setRequestOpen(false)
      setReason('')
      qc.invalidateQueries({ queryKey: ['appointments'] })
    },
  })

  const appointments = appointmentsQuery.data ?? []
  const pets = petsQuery.data ?? []
  const selectedPet = pets.find(pet => pet.id === selectedPetId) ?? pets[0]

  const upcomingAppointments = useMemo(() => (
    appointments
      .filter(appointment => appointment.status !== 'cancelled' && appointment.status !== 'completed')
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  ), [appointments])

  const submitRequest = () => {
    const petId = selectedPetId || selectedPet?.id
    if (!petId || !reason.trim()) return
    requestAppointment.mutate({
      petId,
      preferredDate,
      preferredTime,
      reason: reason.trim(),
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Randevular</Text>
          <Text style={styles.headerSubtitle}>Klinik ziyaretlerinizi takip edin</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={() => setRequestOpen(v => !v)} activeOpacity={0.85}>
          <Ionicons name={requestOpen ? 'close' : 'add'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {(appointmentsQuery.isError || petsQuery.isError) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Randevu servisi henüz hazır değil. Endpoint bekleniyor.</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={appointmentsQuery.isRefetching} onRefresh={appointmentsQuery.refetch} tintColor={Colors.primary} />}
      >
        {requestOpen && (
          <View style={styles.requestCard}>
            <Text style={styles.sectionTitle}>Randevu Talep Et</Text>

            <Text style={styles.label}>Hayvan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petRow}>
              {pets.length === 0 ? (
                <Text style={styles.mutedText}>Hayvan listesi alınamadı</Text>
              ) : pets.map(pet => {
                const active = (selectedPetId || selectedPet?.id) === pet.id
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

            <View style={styles.formGrid}>
              <View style={styles.formField}>
                <Text style={styles.label}>Tarih</Text>
                <TextInput
                  style={styles.input}
                  value={preferredDate}
                  onChangeText={setPreferredDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.formField}>
                <Text style={styles.label}>Saat</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TIME_OPTIONS.map(time => (
                    <TouchableOpacity
                      key={time}
                      style={[styles.timePill, preferredTime === time && styles.timePillActive]}
                      onPress={() => setPreferredTime(time)}
                    >
                      <Text style={[styles.timeText, preferredTime === time && styles.timeTextActive]}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Text style={styles.label}>Sebep</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={reason}
              onChangeText={setReason}
              placeholder="Kontrol, aşı, muayene..."
              placeholderTextColor={Colors.textMuted}
              multiline
            />

            {requestAppointment.isError && (
              <Text style={styles.requestError}>Randevu talebi gönderilemedi. Backend endpointi bekleniyor.</Text>
            )}

            <TouchableOpacity
              style={[styles.submitButton, (!selectedPet || !reason.trim() || requestAppointment.isPending) && styles.submitButtonDisabled]}
              onPress={submitRequest}
              disabled={!selectedPet || !reason.trim() || requestAppointment.isPending}
              activeOpacity={0.85}
            >
              {requestAppointment.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Talep Gönder</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.summaryValue}>{upcomingAppointments.length}</Text>
            <Text style={styles.summaryLabel}>Yaklaşan</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="time-outline" size={20} color={Colors.warning} />
            <Text style={styles.summaryValue}>
              {appointments.filter(a => a.status === 'pending').length}
            </Text>
            <Text style={styles.summaryLabel}>Bekleyen</Text>
          </View>
        </View>

        {appointmentsQuery.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : upcomingAppointments.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-clear-outline" size={54} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Yaklaşan randevu yok</Text>
            <Text style={styles.emptyText}>Klinikten onaylanan randevular burada görünecek.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {upcomingAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </View>
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

function AppointmentCard({ appointment }: { appointment: ApiAppointment }) {
  const color = appointment.status === 'confirmed' ? Colors.primary : Colors.warning
  return (
    <View style={styles.appointmentCard}>
      <View style={[styles.statusBar, { backgroundColor: color }]} />
      <View style={styles.appointmentIcon}>
        <Ionicons name="calendar" size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.appointmentTitle}>
          {appointment.pet?.name ?? 'Randevu'}
        </Text>
        <Text style={styles.appointmentMeta}>
          {formatDateShort(appointment.startsAt)} · {new Date(appointment.startsAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {appointment.reason && <Text style={styles.appointmentReason}>{appointment.reason}</Text>}
      </View>
      <View style={[styles.statusPill, { backgroundColor: color + '18' }]}>
        <Text style={[styles.statusText, { color }]}>
          {appointment.status === 'confirmed' ? 'Onaylı' : 'Bekliyor'}
        </Text>
      </View>
    </View>
  )
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
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  headerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  headerButton: { width: 42, height: 42, borderRadius: Radius.lg, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  errorBanner: { margin: Spacing.lg, marginBottom: 0, backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  errorText: { color: '#92400e', fontSize: FontSize.sm },
  content: { padding: Spacing.lg, paddingBottom: 32 },
  requestCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text, marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 6 },
  petRow: { gap: 8, paddingBottom: Spacing.md },
  petPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff' },
  petPillActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  petEmoji: { fontSize: 16 },
  petName: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  petNameActive: { color: Colors.primary },
  mutedText: { fontSize: FontSize.sm, color: Colors.textMuted },
  formGrid: { gap: Spacing.md },
  formField: { marginBottom: Spacing.md },
  input: { minHeight: 46, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, color: Colors.text, backgroundColor: '#fff', fontSize: FontSize.base },
  textarea: { minHeight: 88, paddingTop: Spacing.md, textAlignVertical: 'top' },
  timePill: { borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginRight: Spacing.sm },
  timePillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  timeTextActive: { color: '#fff' },
  requestError: { color: Colors.danger, fontSize: FontSize.sm, marginTop: Spacing.sm },
  submitButton: { height: 50, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg },
  submitButtonDisabled: { opacity: 0.55 },
  submitButtonText: { color: '#fff', fontSize: FontSize.base, fontWeight: FontWeight.bold },
  summaryRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  summaryValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.sm },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  center: { padding: Spacing.xxxl, alignItems: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 72 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.lg },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm },
  list: { gap: Spacing.md },
  appointmentCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  statusBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  appointmentIcon: { width: 42, height: 42, borderRadius: Radius.lg, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  appointmentTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  appointmentMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  appointmentReason: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  statusPill: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
})

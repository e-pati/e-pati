import { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, TextInput,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { clinicDiscoveryService } from '@/services/clinic-discovery.service'
import { appointmentsService } from '@/services/appointments.service'
import { petsService } from '@/services/pets.service'
import { Colors, Fonts, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'

const TIME_OPTIONS = ['09:00', '10:30', '13:00', '14:30', '16:00']

export default function ClinicPublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [requestOpen, setRequestOpen] = useState(false)
  const [selectedPetId, setSelectedPetId] = useState('')
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0])
  const [preferredTime, setPreferredTime] = useState(TIME_OPTIONS[0])
  const [reason, setReason] = useState('')

  const clinicQuery = useQuery({
    queryKey: ['clinic-public-profile', id],
    queryFn: () => clinicDiscoveryService.getPublicProfile(id),
    enabled: !!id,
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
    },
  })

  const clinic = clinicQuery.data
  const pets = petsQuery.data ?? []
  const selectedPet = pets.find(pet => pet.id === selectedPetId) ?? pets[0]

  const submitAppointmentRequest = () => {
    const petId = selectedPetId || selectedPet?.id
    if (!petId || !id || !reason.trim()) return
    requestAppointment.mutate({
      petId,
      clinicId: id,
      preferredDate,
      preferredTime,
      reason: reason.trim(),
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Klinik Profili</Text>
          <Text style={styles.headerSubtitle}>VetCep partner klinik detayı</Text>
        </View>
      </View>

      {clinicQuery.isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Klinik profil servisi henüz hazır değil. Endpoint bekleniyor.</Text>
        </View>
      )}

      {clinicQuery.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : !clinic ? (
        <View style={styles.empty}>
          <Ionicons name="business-outline" size={52} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Klinik profili bekleniyor</Text>
          <Text style={styles.emptyText}>GET /clinics/:id/public-profile endpointi geldiğinde detaylar burada görünecek.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="business" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.clinicName}>{clinic.name}</Text>
            <Text style={styles.clinicMeta}>
              {[clinic.district, clinic.city].filter(Boolean).join(' / ') || clinic.address || 'Konum bilgisi bekleniyor'}
            </Text>
            {clinic.description && <Text style={styles.description}>{clinic.description}</Text>}
          </View>

          <View style={styles.actionRow}>
            {clinic.phone && (
              <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL(`tel:${clinic.phone}`)}>
                <Ionicons name="call" size={18} color={Colors.primary} />
                <Text style={styles.actionText}>Ara</Text>
              </TouchableOpacity>
            )}
            {clinic.website && (
              <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL(clinic.website ?? '')}>
                <Ionicons name="globe-outline" size={18} color={Colors.primary} />
                <Text style={styles.actionText}>Web</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.primaryAction} activeOpacity={0.86} onPress={() => setRequestOpen(value => !value)}>
              <Ionicons name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.primaryActionText}>Randevu Talep Et</Text>
            </TouchableOpacity>
          </View>

          {requestOpen && (
            <View style={styles.requestCard}>
              <Text style={styles.sectionTitle}>Randevu Talebi</Text>

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
                <Text style={styles.requestError}>Randevu talebi gönderilemedi. Endpoint bekleniyor.</Text>
              )}

              <TouchableOpacity
                style={[styles.submitButton, (!selectedPet || !reason.trim() || requestAppointment.isPending) && styles.submitButtonDisabled]}
                onPress={submitAppointmentRequest}
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

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Klinik bilgileri</Text>
            <InfoRow icon="location-outline" label="Adres" value={clinic.address || 'Adres bilgisi bekleniyor'} />
            <InfoRow icon="time-outline" label="Çalışma saatleri" value={clinic.workingHours || 'Çalışma saatleri bekleniyor'} />
            <InfoRow icon="star-outline" label="Puan" value={clinic.rating !== undefined ? clinic.rating.toFixed(1) : 'Puan bekleniyor'} />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Hizmetler</Text>
            {(clinic.services ?? ['Muayene', 'Aşı', 'Lab sonucu', 'Randevu talebi']).map(service => (
              <View key={service} style={styles.serviceRow}>
                <Ionicons name="checkmark-circle" size={17} color={Colors.primary} />
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>

          <View style={styles.contractCard}>
            <Text style={styles.sectionTitle}>Backend kontratı</Text>
            <Text style={styles.codeText}>GET /clinics/:id/public-profile</Text>
            <Text style={styles.codeText}>POST /appointments/request</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
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
    gap: Spacing.md,
  },
  backButton: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  headerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  errorBanner: { margin: Spacing.lg, marginBottom: 0, backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  errorText: { color: '#92400e', fontSize: FontSize.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.lg },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  heroCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  heroIcon: { width: 64, height: 64, borderRadius: Radius.xl, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  clinicName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text, textAlign: 'center' },
  clinicMeta: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xs },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  actionButton: { height: 44, minWidth: 70, borderRadius: Radius.lg, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  actionText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  primaryAction: { flex: 1, height: 44, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  primaryActionText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg },
  requestCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 6 },
  petRow: { gap: 8, paddingBottom: Spacing.md },
  petPill: { borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff' },
  petPillActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
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
  infoRow: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.sm },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  infoValue: { fontSize: FontSize.sm, color: Colors.text, marginTop: 2 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 7 },
  serviceText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  contractCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg },
  codeText: { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
})

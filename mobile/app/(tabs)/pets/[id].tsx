import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Modal, Share,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import QRCode from 'react-native-qrcode-svg'
import { mockPets, mockExaminations, mockVaccinations, mockPrescriptions, mockLabResults } from '@/lib/mock-data'
import { petsService, type ApiPet } from '@/services/pets.service'
import { examinationsService, type ApiExamination } from '@/services/examinations.service'
import { vaccinationsService, type ApiVaccination } from '@/services/vaccinations.service'
import { prescriptionsService, type ApiPrescription } from '@/services/prescriptions.service'
import { labResultsService, type ApiLabResult } from '@/services/lab-results.service'
import { speciesEmoji, speciesLabel, calculateAge, formatDate, formatDateShort, isVaccinationOverdue, isVaccinationDueSoon } from '@/lib/utils'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'
import type { Examination, LabResult, Pet, PetSpecies, Prescription, Vaccination } from '@/types'

type Tab = 'summary' | 'exams' | 'vaccines' | 'prescriptions' | 'lab'

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'summary', label: 'Özet', emoji: '📊' },
  { key: 'exams', label: 'Muayene', emoji: '🩺' },
  { key: 'vaccines', label: 'Aşı', emoji: '💉' },
  { key: 'prescriptions', label: 'Reçete', emoji: '💊' },
  { key: 'lab', label: 'Lab', emoji: '🔬' },
]

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('summary')
  const [qrVisible, setQrVisible] = useState(false)
  const [qrToken, setQrToken] = useState('')
  const [qrLoading, setQrLoading] = useState(false)

  const petQuery = useQuery({
    queryKey: ['pets', id],
    queryFn: () => petsService.getOne(id),
    enabled: !!id,
    retry: 1,
  })
  const examinationsQuery = useQuery({
    queryKey: ['examinations', { petId: id }],
    queryFn: () => examinationsService.getAll({ petId: id, limit: 100 }),
    enabled: !!id,
    retry: 1,
  })
  const vaccinationsQuery = useQuery({
    queryKey: ['vaccinations', { petId: id }],
    queryFn: () => vaccinationsService.getAll({ petId: id, limit: 100 }),
    enabled: !!id,
    retry: 1,
  })
  const prescriptionsQuery = useQuery({
    queryKey: ['prescriptions', { petId: id }],
    queryFn: () => prescriptionsService.getAll({ petId: id }),
    enabled: !!id,
    retry: 1,
  })
  const labResultsQuery = useQuery({
    queryKey: ['lab-results', { petId: id }],
    queryFn: () => labResultsService.getAll({ petId: id }),
    enabled: !!id,
    retry: 1,
  })

  const fallbackPet = mockPets.find(p => p.id === id)
  const pet = petQuery.data ? mapApiPet(petQuery.data) : petQuery.isError && fallbackPet ? fallbackPet : undefined

  if (petQuery.isLoading) return (
    <View style={styles.center}>
      <ActivityIndicator color={Colors.primary} size="large" />
      <Text style={styles.loadingText}>Hasta bilgisi yükleniyor...</Text>
    </View>
  )

  if (!pet) return (
    <View style={styles.center}>
      <Text>Hayvan bulunamadı</Text>
    </View>
  )

  const exams = (examinationsQuery.data
    ? examinationsQuery.data.map(mapApiExamination)
    : examinationsQuery.isError ? mockExaminations.filter(e => e.petId === id) : []
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const vaccines = vaccinationsQuery.data
    ? vaccinationsQuery.data.map(mapApiVaccination)
    : vaccinationsQuery.isError ? mockVaccinations.filter(v => v.petId === id) : []
  const prescriptions = prescriptionsQuery.data
    ? prescriptionsQuery.data.map(mapApiPrescription)
    : prescriptionsQuery.isError ? mockPrescriptions.filter(p => p.petId === id) : []
  const labs = labResultsQuery.data
    ? labResultsQuery.data.map(mapApiLabResult)
    : labResultsQuery.isError ? mockLabResults.filter(l => l.petId === id) : []

  const lastExam = exams[0]
  const upcomingVaccines = vaccines.filter(v => isVaccinationDueSoon(v.nextDate) || isVaccinationOverdue(v.nextDate))
  const hasFallbackData = petQuery.isError || examinationsQuery.isError || vaccinationsQuery.isError ||
    prescriptionsQuery.isError || labResultsQuery.isError

  const openQr = async () => {
    setQrVisible(true)
    if (qrToken) return
    setQrLoading(true)
    try {
      const { token } = await petsService.getQr(pet.id)
      setQrToken(token)
    } catch {
      setQrToken(`e-pati-pet:${pet.id}`)
    } finally {
      setQrLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/pets/edit?id=${pet.id}`)}
            style={styles.editBtn}
          >
            <Text style={styles.editBtnText}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openQr} style={styles.qrBtn}>
            <Text style={styles.qrBtnText}>QR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profil kartı */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileEmoji}>{speciesEmoji(pet.species)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{pet.name}</Text>
          <Text style={styles.profileBreed}>{pet.breed} · {speciesLabel(pet.species)}</Text>
          <Text style={styles.profileAge}>{calculateAge(pet.birthDate)}{pet.weight ? ` · ${pet.weight} kg` : ''}</Text>
        </View>
      </View>

      {/* Sekmeler */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* İçerik */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {hasFallbackData && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ API kayıtları alınamadı — örnek veriler gösteriliyor</Text>
          </View>
        )}

        {activeTab === 'summary' && (
          <View style={styles.section}>
            {/* İstatistikler */}
            <View style={styles.statsRow}>
              {[
                { label: 'Muayene', value: exams.length, emoji: '🩺', color: Colors.primary },
                { label: 'Aşı', value: vaccines.length, emoji: '💉', color: '#3b82f6' },
                { label: 'Reçete', value: prescriptions.length, emoji: '💊', color: '#8b5cf6' },
                { label: 'Lab', value: labs.length, emoji: '🔬', color: '#ef4444' },
              ].map(s => (
                <View key={s.label} style={[styles.statCard, { borderColor: s.color + '30', backgroundColor: s.color + '10' }]}>
                  <Text style={styles.statEmoji}>{s.emoji}</Text>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Son muayene */}
            {lastExam && (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Son Muayene</Text>
                <Text style={styles.infoCardDate}>{formatDate(lastExam.date)}</Text>
                <Text style={styles.infoCardVet}>{lastExam.vetName}</Text>
                <Text style={styles.infoCardText} numberOfLines={2}>{lastExam.complaint}</Text>
              </View>
            )}

            {/* Aşı uyarısı */}
            {upcomingVaccines.length > 0 && (
              <View style={styles.alertCard}>
                <Text style={styles.alertTitle}>⚠️ Aşı Uyarısı</Text>
                {upcomingVaccines.map(v => (
                  <Text key={v.id} style={styles.alertText}>
                    {v.vaccineName} — {isVaccinationOverdue(v.nextDate) ? 'Gecikmiş!' : 'Yakında'} ({formatDateShort(v.nextDate)})
                  </Text>
                ))}
              </View>
            )}

            {/* Mikro çip */}
            {pet.microchipNo && (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>🔢 Mikro Çip</Text>
                <Text style={styles.microchipNo}>{pet.microchipNo}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'exams' && (
          <View style={styles.section}>
            {exams.length === 0
              ? <EmptyState emoji="🩺" text="Henüz muayene kaydı yok" />
              : exams.map(exam => (
                <View key={exam.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordDate}>{formatDate(exam.date)}</Text>
                    <Text style={styles.recordVet}>{exam.vetName}</Text>
                  </View>
                  {[
                    { label: 'Şikayet', value: exam.complaint },
                    { label: 'Bulgular', value: exam.findings },
                    { label: 'Değerlendirme', value: exam.assessment },
                    { label: 'Plan', value: exam.plan },
                  ].map(f => (
                    <View key={f.label} style={styles.recordField}>
                      <Text style={styles.recordFieldLabel}>{f.label}</Text>
                      <Text style={styles.recordFieldValue}>{f.value}</Text>
                    </View>
                  ))}
                  {exam.followUpDate && (
                    <View style={styles.followUpBadge}>
                      <Text style={styles.followUpText}>📅 Takip: {formatDate(exam.followUpDate)}</Text>
                    </View>
                  )}
                </View>
              ))
            }
          </View>
        )}

        {activeTab === 'vaccines' && (
          <View style={styles.section}>
            {vaccines.length === 0
              ? <EmptyState emoji="💉" text="Henüz aşı kaydı yok" />
              : vaccines.map(vac => {
                const overdue = isVaccinationOverdue(vac.nextDate)
                const soon = isVaccinationDueSoon(vac.nextDate)
                return (
                  <View key={vac.id} style={styles.recordCard}>
                    <View style={styles.vaccineRow}>
                      <View style={[styles.vaccineStatus, { backgroundColor: overdue ? Colors.danger + '20' : soon ? Colors.warning + '20' : Colors.primaryBg }]}>
                        <Text style={{ fontSize: 18 }}>{overdue ? '⚠️' : soon ? '⏰' : '✅'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.vaccineName}>{vac.vaccineName}</Text>
                        {vac.manufacturer && <Text style={styles.vaccineManufacturer}>{vac.manufacturer}</Text>}
                        <Text style={styles.vaccineDate}>Uygulandı: {formatDateShort(vac.appliedDate)}</Text>
                        <Text style={[styles.vaccineNext, { color: overdue ? Colors.danger : soon ? Colors.warning : Colors.textSecondary }]}>
                          Sonraki: {formatDateShort(vac.nextDate)} {overdue ? '(Gecikmiş!)' : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                )
              })
            }
          </View>
        )}

        {activeTab === 'prescriptions' && (
          <View style={styles.section}>
            {prescriptions.length === 0
              ? <EmptyState emoji="💊" text="Henüz reçete yok" />
              : prescriptions.map(rx => (
                <View key={rx.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordDate}>{formatDate(rx.date)}</Text>
                    <Text style={styles.recordVet}>{rx.vetName}</Text>
                  </View>
                  {rx.medications.map(med => (
                    <View key={med.id} style={styles.medRow}>
                      <Text style={styles.medDrug}>💊 {med.drugName}</Text>
                      <Text style={styles.medDetail}>{med.dose} · {med.frequency} · {med.duration}</Text>
                      {med.instructions && <Text style={styles.medInstructions}>{med.instructions}</Text>}
                    </View>
                  ))}
                </View>
              ))
            }
          </View>
        )}

        {activeTab === 'lab' && (
          <View style={styles.section}>
            {labs.length === 0
              ? <EmptyState emoji="🔬" text="Henüz lab sonucu yok" />
              : labs.map(lab => (
                <View key={lab.id} style={styles.recordCard}>
                  <Text style={styles.labType}>{lab.testType}</Text>
                  <Text style={styles.labDate}>{formatDate(lab.date)}</Text>
                  {lab.comment && <Text style={styles.labComment}>{lab.comment}</Text>}
                </View>
              ))
            }
          </View>
        )}
      </ScrollView>

      <Modal visible={qrVisible} transparent animationType="fade" onRequestClose={() => setQrVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{pet.name} QR Kodu</Text>
            <View style={styles.qrBox}>
              {qrLoading
                ? <ActivityIndicator color={Colors.primary} size="large" />
                : <QRCode value={qrToken || `e-pati-pet:${pet.id}`} size={190} />
              }
            </View>
            <Text style={styles.qrHint}>
              Bu QR kodu veterinerinize gösterin veya paylaşın.
            </Text>
            <View style={styles.qrActions}>
              <TouchableOpacity
                style={[styles.qrBtn2, { backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primaryBorder }]}
                onPress={() => Share.share({
                  message: `e-Pati: ${pet.name} hayvanının sağlık kaydı\nToken: ${qrToken || pet.id}`,
                  title: `${pet.name} - e-Pati`,
                })}
              >
                <Text style={[styles.qrBtnText2, { color: Colors.primary }]}>📤 Paylaş</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.qrBtn2, { backgroundColor: Colors.primary }]} onPress={() => setQrVisible(false)}>
                <Text style={[styles.qrBtnText2, { color: '#fff' }]}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

function mapApiPet(pet: ApiPet): Pet {
  return {
    id: pet.id,
    ownerId: pet.ownerId,
    name: pet.name,
    species: normalizeSpecies(pet.species),
    breed: pet.breed ?? 'Irk belirtilmemiş',
    gender: pet.sex === 'female' ? 'female' : 'male',
    birthDate: pet.birthDate ?? pet.createdAt,
    microchipNo: pet.microchipNo,
  }
}

function mapApiExamination(exam: ApiExamination): Examination {
  return {
    id: exam.id,
    petId: exam.petId,
    vetName: formatVetName(exam.vet),
    date: exam.date ?? exam.createdAt,
    complaint: exam.complaint,
    findings: exam.findings,
    assessment: exam.assessment,
    plan: exam.plan,
    followUpDate: exam.followUpDate,
  }
}

function mapApiVaccination(vaccination: ApiVaccination): Vaccination {
  return {
    id: vaccination.id,
    petId: vaccination.petId,
    vaccineName: vaccination.name,
    appliedDate: vaccination.appliedAt,
    nextDate: vaccination.dueAt ?? vaccination.appliedAt,
    manufacturer: vaccination.notes ?? vaccination.lotNumber,
  }
}

function mapApiPrescription(prescription: ApiPrescription): Prescription {
  return {
    id: prescription.id,
    petId: prescription.petId ?? '',
    vetName: formatVetName(prescription.vet),
    date: prescription.date ?? prescription.createdAt ?? new Date().toISOString(),
    medications: prescription.medications.map((medication, index) => ({
      id: medication.id ?? `${prescription.id}-${index}`,
      drugName: medication.name,
      dose: medication.dose,
      frequency: medication.frequency,
      duration: medication.duration,
      instructions: medication.instructions,
    })),
  }
}

function mapApiLabResult(labResult: ApiLabResult): LabResult {
  return {
    id: labResult.id,
    petId: labResult.petId,
    testType: labResult.testType,
    date: labResult.date ?? labResult.createdAt ?? new Date().toISOString(),
    comment: labResult.comment,
  }
}

function formatVetName(vet: ApiExamination['vet'] | ApiPrescription['vet']): string {
  if (!vet) return 'Veteriner bilgisi yok'
  if (vet.fullName) return `${vet.title ?? ''} ${vet.fullName}`.trim()
  return `${vet.title ?? ''} ${vet.firstName ?? ''} ${vet.lastName ?? ''}`.trim() || 'Veteriner bilgisi yok'
}

function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={{ fontSize: 40, marginBottom: Spacing.md }}>{emoji}</Text>
      <Text style={{ fontSize: FontSize.base, color: Colors.textMuted }}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.md },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  backBtn: {},
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.medium },
  editBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  editBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  qrBtn: {
    minWidth: 44, height: 32, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  qrBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.lg,
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  profileAvatar: {
    width: 64, height: 64, borderRadius: Radius.xl,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  profileEmoji: { fontSize: 32 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  profileBreed: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  profileAge: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  tabsScroll: { maxHeight: 60 },
  tabsRow: { paddingHorizontal: Spacing.xl, gap: 8, paddingBottom: 8 },
  tabItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  tabItemActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  tabEmoji: { fontSize: 14 },
  tabLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  tabLabelActive: { color: Colors.primary },
  content: { flex: 1, paddingHorizontal: Spacing.xl, marginTop: Spacing.md },
  errorBanner: {
    backgroundColor: '#fef3cd', borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: '#fde68a',
    marginBottom: Spacing.md,
  },
  errorText: { fontSize: FontSize.xs, color: '#92400e' },
  section: { gap: 12 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, borderRadius: Radius.lg, padding: Spacing.md,
    alignItems: 'center', borderWidth: 1,
  },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  infoCard: {
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  infoCardTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 4 },
  infoCardDate: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  infoCardVet: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 6 },
  infoCardText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  alertCard: {
    backgroundColor: Colors.warning + '15', borderRadius: Radius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.warning + '40',
  },
  alertTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.warning, marginBottom: 6 },
  alertText: { fontSize: FontSize.sm, color: Colors.text, marginTop: 3 },
  microchipNo: { fontSize: FontSize.base, fontFamily: 'monospace', color: Colors.text, marginTop: 4 },
  recordCard: {
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1, gap: 8,
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordDate: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  recordVet: { fontSize: FontSize.xs, color: Colors.textMuted },
  recordField: {},
  recordFieldLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  recordFieldValue: { fontSize: FontSize.sm, color: Colors.text, marginTop: 2, lineHeight: 20 },
  followUpBadge: {
    backgroundColor: Colors.warning + '20', borderRadius: Radius.md,
    padding: Spacing.sm, alignSelf: 'flex-start',
  },
  followUpText: { fontSize: FontSize.xs, color: Colors.warning, fontWeight: FontWeight.medium },
  vaccineRow: { flexDirection: 'row', gap: Spacing.md },
  vaccineStatus: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  vaccineName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  vaccineManufacturer: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  vaccineDate: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  vaccineNext: { fontSize: FontSize.sm, marginTop: 2, fontWeight: FontWeight.medium },
  medRow: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, gap: 3,
  },
  medDrug: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  medDetail: { fontSize: FontSize.sm, color: Colors.textSecondary },
  medInstructions: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic' },
  labType: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  labDate: { fontSize: FontSize.sm, color: Colors.textMuted },
  labComment: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 6, lineHeight: 20 },
  emptyState: { alignItems: 'center', paddingTop: 48 },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center', justifyContent: 'center', padding: Spacing.xl,
  },
  modalCard: {
    width: '100%', maxWidth: 320, backgroundColor: Colors.background,
    borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center',
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.lg },
  qrBox: {
    width: 220, height: 220, borderRadius: Radius.lg, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  qrHint: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  qrActions: { flexDirection: 'row', gap: 10, width: '100%' },
  qrBtn2: { flex: 1, height: 46, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  qrBtnText2: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  closeBtn: {
    height: 44, alignSelf: 'stretch', borderRadius: Radius.md,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },
})

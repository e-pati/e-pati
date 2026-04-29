import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { mockPets, mockExaminations, mockVaccinations, mockPrescriptions, mockLabResults } from '@/lib/mock-data'
import { speciesEmoji, speciesLabel, calculateAge, formatDate, formatDateShort, isVaccinationOverdue, isVaccinationDueSoon } from '@/lib/utils'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

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

  const pet = mockPets.find(p => p.id === id)
  if (!pet) return (
    <View style={styles.center}>
      <Text>Hayvan bulunamadı</Text>
    </View>
  )

  const exams = mockExaminations.filter(e => e.petId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const vaccines = mockVaccinations.filter(v => v.petId === id)
  const prescriptions = mockPrescriptions.filter(p => p.petId === id)
  const labs = mockLabResults.filter(l => l.petId === id)

  const lastExam = exams[0]
  const upcomingVaccines = vaccines.filter(v => isVaccinationDueSoon(v.nextDate) || isVaccinationOverdue(v.nextDate))

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
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
    </SafeAreaView>
  )
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
  topBar: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  backBtn: {},
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.medium },
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
})

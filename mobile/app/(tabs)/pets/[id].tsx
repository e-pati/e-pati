import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Modal, Share, Image, Platform,
} from 'react-native'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { useLocalSearchParams, router, type Href } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import QRCode from 'react-native-qrcode-svg'
import { petsService, type ApiPet } from '@/services/pets.service'
import { examinationsService, type ApiExamination } from '@/services/examinations.service'
import { vaccinationsService, type ApiVaccination } from '@/services/vaccinations.service'
import { prescriptionsService, type ApiPrescription } from '@/services/prescriptions.service'
import { labResultsService, type ApiLabResult } from '@/services/lab-results.service'
import { speciesEmoji, speciesLabel, calculateAge, formatDate, formatDateShort, isVaccinationOverdue, isVaccinationDueSoon } from '@/lib/utils'
import { Colors, Spacing, Radius, FontSize, FontWeight, Fonts } from '@/constants/theme'
import type { Examination, LabResult, Pet, PetSpecies, Prescription, Vaccination } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { AddVaccinationModal } from '@/components/AddVaccinationModal'
import { AddLabResultModal } from '@/components/AddLabResultModal'
import { AddPrescriptionModal } from '@/components/AddPrescriptionModal'
import { AddExaminationModal } from '@/components/AddExaminationModal'
import { Linking } from 'react-native'
import { DEMO_PET_ID, demoPetProfile } from '@/lib/mobile-demo-data'

type Tab = 'summary' | 'exams' | 'vaccines' | 'prescriptions' | 'lab'
type IconName = React.ComponentProps<typeof Ionicons>['name']

const TABS: { key: Tab; label: string; icon: IconName; color: string }[] = [
  { key: 'summary', label: 'Özet', icon: 'grid-outline', color: Colors.primary },
  { key: 'exams', label: 'Muayene', icon: 'fitness-outline', color: Colors.primary },
  { key: 'vaccines', label: 'Aşı', icon: 'medical-outline', color: '#3b82f6' },
  { key: 'prescriptions', label: 'Reçete', icon: 'document-text-outline', color: '#8b5cf6' },
  { key: 'lab', label: 'Lab', icon: 'flask-outline', color: '#ef4444' },
]

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const isDemoPet = id === DEMO_PET_ID
  const [activeTab, setActiveTab] = useState<Tab>('summary')
  const [qrVisible, setQrVisible] = useState(false)
  const [qrToken, setQrToken] = useState('')
  const [qrLoading, setQrLoading] = useState(false)
  const [vaccinationModalVisible, setVaccinationModalVisible] = useState(false)
  const [labModalVisible, setLabModalVisible] = useState(false)
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false)
  const [examinationModalVisible, setExaminationModalVisible] = useState(false)

  const petQuery = useQuery({
    queryKey: ['pets', id],
    queryFn: () => petsService.getOne(id),
    enabled: !!id && !isDemoPet,
    retry: 1,
  })
  const examinationsQuery = useQuery({
    queryKey: ['examinations', { petId: id }],
    queryFn: () => examinationsService.getAll({ petId: id, limit: 100 }),
    enabled: !!id && !isDemoPet,
    retry: 1,
  })
  const vaccinationsQuery = useQuery({
    queryKey: ['vaccinations', { petId: id }],
    queryFn: () => vaccinationsService.getAll({ petId: id, limit: 100 }),
    enabled: !!id && !isDemoPet,
    retry: 1,
  })
  const prescriptionsQuery = useQuery({
    queryKey: ['prescriptions', { petId: id }],
    queryFn: () => prescriptionsService.getAll({ petId: id }),
    enabled: !!id && !isDemoPet,
    retry: 1,
  })
  const labResultsQuery = useQuery({
    queryKey: ['lab-results', { petId: id }],
    queryFn: () => labResultsService.getAll({ petId: id }),
    enabled: !!id && !isDemoPet,
    retry: 1,
  })

  const pet = isDemoPet
    ? demoPetProfile.pet
    : petQuery.data ? mapApiPet(petQuery.data) : undefined

  if (!isDemoPet && petQuery.isLoading) return (
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

  const exams = (isDemoPet
    ? demoPetProfile.examinations
    : examinationsQuery.data ? examinationsQuery.data.map(mapApiExamination) : []
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const vaccines = isDemoPet
    ? demoPetProfile.vaccinations
    : vaccinationsQuery.data ? vaccinationsQuery.data.map(mapApiVaccination) : []
  const prescriptions = isDemoPet
    ? demoPetProfile.prescriptions
    : prescriptionsQuery.data ? prescriptionsQuery.data.map(mapApiPrescription) : []
  const labs = isDemoPet
    ? demoPetProfile.labResults
    : labResultsQuery.data ? labResultsQuery.data.map(mapApiLabResult) : []

  const lastExam = exams[0]
  const upcomingVaccines = vaccines.filter(v => isVaccinationDueSoon(v.nextDate) || isVaccinationOverdue(v.nextDate))

  const shareVaccinationCard = async () => {
    if (!pet) return
    const rows = vaccines.map(v => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${v.vaccineName}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${v.appliedDate ? new Date(v.appliedDate).toLocaleDateString('tr-TR') : '—'}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:${isVaccinationOverdue(v.nextDate) ? '#dc2626' : '#16a34a'}">${v.nextDate ? new Date(v.nextDate).toLocaleDateString('tr-TR') : '—'}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${v.manufacturer ?? '—'}</td>
      </tr>`).join('')
    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8">
      <style>body{font-family:Arial,sans-serif;margin:32px;color:#111}
      h1{color:#10B981;font-size:22px}h2{font-size:16px;color:#374151}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th{background:#f0fdf4;padding:8px;text-align:left;font-size:13px;border-bottom:2px solid #10B981}
      td{font-size:13px}.footer{margin-top:24px;font-size:11px;color:#9ca3af}</style>
      </head><body>
      <h1>🐾 VetCep — Aşı Kartı</h1>
      <h2>${pet.name} · ${speciesLabel((pet.species?.toLowerCase() ?? 'other') as PetSpecies)} ${pet.breed ? `· ${pet.breed}` : ''}</h2>
      <p style="color:#6b7280;font-size:13px">Doğum: ${pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('tr-TR') : '—'}</p>
      <table><thead><tr><th>Aşı</th><th>Uygulama</th><th>Sonraki Doz</th><th>Üretici</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="4" style="padding:12px;text-align:center;color:#9ca3af">Aşı kaydı yok</td></tr>'}</tbody></table>
      <div class="footer">VetCep tarafından oluşturuldu · ${new Date().toLocaleDateString('tr-TR')}</div>
      </body></html>`
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false })
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `${pet.name} Aşı Kartı` })
      }
    } catch {
      // Share silently fails on some platforms
    }
  }
  // Aktif ilaçlar: son reçetedeki ilaçlar
  const activeMedications = prescriptions.length > 0 ? prescriptions[0].medications : []
  const hasApiError = !isDemoPet && (examinationsQuery.isError || vaccinationsQuery.isError ||
    prescriptionsQuery.isError || labResultsQuery.isError)

  const openQr = async () => {
    setQrVisible(true)
    if (qrToken) return
    if (isDemoPet) {
      setQrToken(`vetcep-demo:${demoPetProfile.hkn}`)
      return
    }
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
      {/* Hero Header */}
      <View style={styles.hero}>
        <View style={styles.heroTopBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.heroBack}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
            <Text style={styles.heroBackText}>Geri</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {isDemoPet ? (
              <View style={styles.demoHeroBadge}>
                <Ionicons name="sparkles-outline" size={14} color="#FEF3C7" />
                <Text style={styles.demoHeroBadgeText}>Demo Verisi</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => router.push(`/(tabs)/pets/edit?id=${pet.id}`)}
                style={styles.heroActionBtn}
              >
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text style={styles.heroActionText}>Düzenle</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={openQr} style={[styles.heroActionBtn, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Ionicons name="qr-code-outline" size={16} color="#fff" />
              <Text style={styles.heroActionText}>QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.heroContent}>
          <View style={styles.heroAvatar}>
            {pet.photoUrl
              ? <Image source={{ uri: pet.photoUrl }} style={styles.heroPhoto} />
              : <Text style={styles.heroEmoji}>{speciesEmoji(pet.species)}</Text>
            }
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{pet.name}</Text>
            <Text style={styles.heroBreed}>{pet.breed} · {speciesLabel(pet.species)}</Text>
            <View style={styles.heroTags}>
              <View style={styles.heroTag}>
                <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroTagText}>{calculateAge(pet.birthDate)}</Text>
              </View>
              {pet.microchipNo && (
                <View style={styles.heroTag}>
                  <Ionicons name="hardware-chip-outline" size={11} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.heroTagText} numberOfLines={1}>{pet.microchipNo.slice(0, 8)}…</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Sekmeler */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, activeTab === tab.key && { ...styles.tabItemActive, borderColor: tab.color }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons name={tab.icon} size={14} color={activeTab === tab.key ? tab.color : Colors.textMuted} />
              <Text style={[styles.tabLabel, activeTab === tab.key && { color: tab.color }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* İçerik */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {hasApiError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>Bazı kayıtlar alınamadı. Lütfen tekrar deneyin.</Text>
          </View>
        )}

        {activeTab === 'summary' && (
          <View style={styles.section}>
            {/* İstatistikler */}
            <View style={styles.statsRow}>
              {([
                { label: 'Muayene', value: exams.length, icon: 'fitness-outline' as IconName, color: Colors.primary },
                { label: 'Aşı', value: vaccines.length, icon: 'medical-outline' as IconName, color: '#3b82f6' },
                { label: 'Reçete', value: prescriptions.length, icon: 'document-text-outline' as IconName, color: '#8b5cf6' },
                { label: 'Lab', value: labs.length, icon: 'flask-outline' as IconName, color: '#ef4444' },
              ]).map(s => (
                <View key={s.label} style={[styles.statCard, { borderColor: s.color + '25', backgroundColor: s.color + '0D' }]}>
                  <View style={[styles.statIconBox, { backgroundColor: s.color + '18' }]}>
                    <Ionicons name={s.icon} size={18} color={s.color} />
                  </View>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}><Ionicons name="warning-outline" size={16} color={Colors.warning} /><Text style={styles.alertTitleText}>Aşı Uyarısı</Text></View>
                {upcomingVaccines.map(v => (
                  <Text key={v.id} style={styles.alertText}>
                    {v.vaccineName} — {isVaccinationOverdue(v.nextDate) ? 'Gecikmiş!' : 'Yakında'} ({formatDateShort(v.nextDate)})
                  </Text>
                ))}
              </View>
            )}

            {/* Aktif ilaçlar */}
            {activeMedications.length > 0 && (
              <View style={[styles.infoCard, styles.medicationCard]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}><Ionicons name="medical-outline" size={16} color={Colors.primary} /><Text style={styles.infoCardTitle}>Aktif İlaçlar</Text></View>
                {activeMedications.map((med, i) => (
                  <View key={i} style={styles.medicationRow}>
                    <View style={styles.medicationDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.medicationName}>{med.drugName}</Text>
                      <Text style={styles.medicationDetail}>
                        {med.dose} · {med.frequency} · {med.duration}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.healthTrackingCard}
              onPress={() => router.push(`/(tabs)/profile/health-tracking?petId=${pet.id}` as Href)}
              activeOpacity={0.86}
            >
              <View style={styles.healthTrackingIcon}>
                <Ionicons name="analytics-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.healthTrackingTitle}>Diyet ve kilo takibi</Text>
                <Text style={styles.healthTrackingText}>Bu hayvan için kilo kaydı ve beslenme planı oluşturun.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Acil Yardım */}
            <TouchableOpacity
              style={[styles.healthTrackingCard, { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' }]}
              onPress={() => router.push('/(tabs)/profile/clinics' as Href)}
              activeOpacity={0.86}
            >
              <View style={[styles.healthTrackingIcon, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="medkit-outline" size={22} color="#dc2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.healthTrackingTitle, { color: '#dc2626' }]}>Acil Veteriner Bul</Text>
                <Text style={styles.healthTrackingText}>Yakınımdaki VetCep kullanan klinikleri göster.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#dc2626" />
            </TouchableOpacity>

            {/* Mikro çip */}
            {isDemoPet && (
              <View style={[styles.infoCard, styles.digitalIdentityCard]}>
                <View style={styles.identityHeader}>
                  <View style={styles.identityIcon}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoCardTitle}>Hayvan Kimlik Numarası (HKN)</Text>
                    <Text style={styles.hknValue}>{demoPetProfile.hkn}</Text>
                  </View>
                </View>
                <View style={styles.integrationBadge}>
                  <Text style={styles.integrationBadgeText}>{demoPetProfile.integrationLabel}</Text>
                </View>
              </View>
            )}

            {pet.microchipNo && (
              <View style={styles.infoCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Ionicons name="hardware-chip-outline" size={16} color={Colors.primary} />
                    <Text style={styles.infoCardTitle}>Mikro Çip</Text>
                  </View>
                <Text style={styles.microchipNo}>{pet.microchipNo}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'exams' && (
          <View style={styles.section}>
            {!isDemoPet && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setExaminationModalVisible(true)}
              >
                <Text style={styles.addBtnText}>+ Muayene Ekle</Text>
              </TouchableOpacity>
            )}
            {exams.length === 0
              ? <EmptyState emoji="🩺" text="Henüz muayene kaydı yok" />
              : exams.map(exam => (
                <View key={exam.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordDate}>{formatDate(exam.date)}</Text>
                    <Text style={styles.recordVet}>{exam.vetName}</Text>
                  </View>
                  {exam.clinicName && (
                    <View style={styles.clinicBadge}>
                      <Text style={styles.clinicBadgeText}>🏥 {exam.clinicName}</Text>
                    </View>
                  )}
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
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {!isDemoPet && (
                <TouchableOpacity
                  style={[styles.addBtn, { flex: 1 }]}
                  onPress={() => setVaccinationModalVisible(true)}
                >
                  <Text style={styles.addBtnText}>+ Aşı Ekle</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.addBtn, { flex: 1, backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primaryBorder }]}
                onPress={shareVaccinationCard}
              >
                <Ionicons name="share-outline" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.addBtnText, { color: Colors.primary }]}>Kartı Paylaş</Text>
              </TouchableOpacity>
            </View>
            {vaccines.length === 0
              ? <EmptyState emoji="💉" text="Henüz aşı kaydı yok" />
              : vaccines.map(vac => {
                const overdue = isVaccinationOverdue(vac.nextDate)
                const soon = isVaccinationDueSoon(vac.nextDate)
                return (
                  <View key={vac.id} style={styles.recordCard}>
                    <View style={styles.vaccineRow}>
                      <View style={[styles.vaccineStatus, { backgroundColor: overdue ? Colors.danger + '18' : soon ? Colors.warning + '18' : Colors.primaryBg }]}>
                        <Ionicons
                          name={overdue ? 'warning-outline' : soon ? 'time-outline' : 'checkmark-circle-outline'}
                          size={22}
                          color={overdue ? Colors.danger : soon ? Colors.warning : Colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.vaccineName}>{vac.vaccineName}</Text>
                        {vac.manufacturer && <Text style={styles.vaccineManufacturer}>{vac.manufacturer}</Text>}
                        {vac.clinicName && (
                          <View style={styles.clinicBadge}>
                            <Text style={styles.clinicBadgeText}>🏥 {vac.clinicName}</Text>
                          </View>
                        )}
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
            {!isDemoPet && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setPrescriptionModalVisible(true)}
              >
                <Text style={styles.addBtnText}>+ Reçete Yaz</Text>
              </TouchableOpacity>
            )}
            {prescriptions.length === 0
              ? <EmptyState emoji="💊" text="Henüz reçete yok" />
              : prescriptions.map(rx => (
                <View key={rx.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View>
                      <Text style={styles.recordDate}>{formatDate(rx.date)}</Text>
                      <Text style={styles.recordVet}>{rx.vetName}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={[styles.pdfBtn, { backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primaryBorder }]}
                        onPress={async () => {
                          try {
                            const meds = rx.medications.map(m => `${m.drugName}: ${m.dose}, ${m.frequency}, ${m.duration}`).join('\n')
                            await Share.share({ message: `${pet?.name} İlaç Hatırlatması:\n${meds}\n\nVetCep tarafından`, title: `${pet?.name} İlaçları` })
                          } catch {}
                        }}
                      >
                        <Ionicons name="alarm-outline" size={13} color={Colors.primary} />
                        <Text style={[styles.pdfBtnText, { color: Colors.primary }]}>Hatırlat</Text>
                      </TouchableOpacity>
                      {!isDemoPet && (
                        <TouchableOpacity
                          style={styles.pdfBtn}
                          onPress={() => Linking.openURL(prescriptionsService.getPdfUrl(rx.id))}
                        >
                          <Text style={styles.pdfBtnText}>📄 PDF</Text>
                        </TouchableOpacity>
                      )}
                    </View>
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
            {!isDemoPet && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setLabModalVisible(true)}
              >
                <Text style={styles.addBtnText}>+ Sonuç Ekle</Text>
              </TouchableOpacity>
            )}
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
                  message: `VetCep: ${pet.name} hayvanının sağlık kaydı\nToken: ${qrToken || pet.id}`,
                  title: `${pet.name} - VetCep`,
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

      <AddVaccinationModal
        petId={pet.id}
        visible={vaccinationModalVisible}
        onClose={() => setVaccinationModalVisible(false)}
      />
      <AddLabResultModal
        petId={pet.id}
        visible={labModalVisible}
        onClose={() => setLabModalVisible(false)}
      />
      <AddPrescriptionModal
        petId={pet.id}
        visible={prescriptionModalVisible}
        onClose={() => setPrescriptionModalVisible(false)}
      />
      <AddExaminationModal
        petId={pet.id}
        visible={examinationModalVisible}
        onClose={() => setExaminationModalVisible(false)}
      />
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
    photoUrl: pet.photoUrl,
  }
}

function mapApiExamination(exam: ApiExamination): Examination {
  return {
    id: exam.id,
    petId: exam.petId,
    vetName: formatVetName(exam.vet),
    clinicName: exam.clinic?.name,
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
    clinicName: vaccination.clinic?.name,
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

const EMPTY_ICONS: Record<string, IconName> = {
  '🩺': 'fitness-outline', '💉': 'medical-outline',
  '💊': 'document-text-outline', '🔬': 'flask-outline',
}

function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  const iconName = EMPTY_ICONS[emoji] ?? 'help-circle-outline'
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBox}>
        <Ionicons name={iconName} size={32} color={Colors.textMuted} />
      </View>
      <Text style={{ fontSize: FontSize.base, color: Colors.textMuted }}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.md },

  // Hero
  hero: {
    backgroundColor: Colors.primaryDark,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  heroTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  heroBack: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroBackText: { fontSize: FontSize.base, color: '#fff', fontWeight: FontWeight.medium },
  heroActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroActionText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.semibold },
  demoHeroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(146, 64, 14, 0.35)', borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(253, 230, 138, 0.5)',
  },
  demoHeroBadgeText: { fontSize: FontSize.xs, color: '#FEF3C7', fontWeight: FontWeight.semibold },
  heroContent: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.lg,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm,
  },
  heroAvatar: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  heroEmoji: { fontSize: 36 },
  heroPhoto: { width: '100%', height: '100%' },
  heroInfo: { flex: 1 },
  heroName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  heroBreed: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  heroTags: { flexDirection: 'row', gap: 8, marginTop: 8 },
  heroTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  heroTagText: { fontSize: 10, color: 'rgba(255,255,255,0.9)', fontWeight: FontWeight.medium },

  // Tabs
  tabsWrapper: { backgroundColor: '#fff', paddingVertical: Spacing.sm },
  tabsRow: { paddingHorizontal: Spacing.xl, gap: 8 },
  tabItem: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  tabItemActive: { backgroundColor: Colors.primaryBg },
  tabLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted },
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
    flex: 1, borderRadius: Radius.xl, padding: Spacing.md,
    alignItems: 'center', borderWidth: 1,
    shadowColor: '#059669', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
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
  digitalIdentityCard: { borderWidth: 1, borderColor: Colors.primaryBorder },
  identityHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  identityIcon: {
    width: 42, height: 42, borderRadius: Radius.md,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  hknValue: { fontSize: FontSize.sm, fontFamily: 'monospace', color: Colors.text, marginTop: 2 },
  integrationBadge: {
    alignSelf: 'flex-start', marginTop: Spacing.md,
    borderRadius: Radius.full, backgroundColor: '#FEF3C7',
    borderWidth: 1, borderColor: '#FCD34D', paddingHorizontal: 9, paddingVertical: 4,
  },
  integrationBadgeText: { fontSize: 9, color: '#92400E', fontWeight: FontWeight.semibold },
  alertCard: {
    backgroundColor: Colors.warning + '15', borderRadius: Radius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.warning + '40',
  },
  alertTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.warning, marginBottom: 6 },
  alertText: { fontSize: FontSize.sm, color: Colors.text, marginTop: 3 },
  microchipNo: { fontSize: FontSize.base, fontFamily: 'monospace', color: Colors.text, marginTop: 4 },
  medicationCard: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  medicationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginTop: 8 },
  medicationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 5 },
  medicationName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  medicationDetail: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  healthTrackingCard: {
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  healthTrackingIcon: { width: 44, height: 44, borderRadius: Radius.lg, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  healthTrackingTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text },
  healthTrackingText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3, lineHeight: 17 },
  recordCard: {
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1, gap: 8,
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordDate: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  recordVet: { fontSize: FontSize.xs, color: Colors.textMuted },
  clinicBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.primaryBg,
    borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6,
  },
  clinicBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
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
  pdfBtn: { paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  pdfBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  medDrug: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  medDetail: { fontSize: FontSize.sm, color: Colors.textSecondary },
  medInstructions: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic' },
  labType: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  labDate: { fontSize: FontSize.sm, color: Colors.textMuted },
  labComment: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 6, lineHeight: 20 },
  addBtn: {
    alignSelf: 'flex-end', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg, marginBottom: Spacing.md,
  },
  addBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  emptyState: { alignItems: 'center', paddingTop: 48 },
  emptyIconBox: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: '#F0FDF4',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  alertTitleText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.warning },
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

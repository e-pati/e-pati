import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { Colors, FontSize, FontWeight, Fonts, Radius, Spacing } from '@/constants/theme'
import { demoCattleProfile, type DemoCattleEvent } from '@/lib/mobile-demo-data'
import { formatDate, formatDateShort } from '@/lib/utils'

type IconName = React.ComponentProps<typeof Ionicons>['name']

const eventIcons: Record<DemoCattleEvent['type'], IconName> = {
  health: 'medkit-outline',
  movement: 'swap-horizontal-outline',
  registration: 'document-text-outline',
}

export default function ProducerDemoScreen() {
  const cattle = demoCattleProfile

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
            <Text style={styles.backText}>Hayvanlarım</Text>
          </TouchableOpacity>

          <View style={styles.demoBadge}>
            <Ionicons name="sparkles-outline" size={13} color="#FEF3C7" />
            <Text style={styles.demoBadgeText}>Demo Verisi</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.cattleAvatar}>
            <Text style={styles.cattleEmoji}>🐄</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroEyebrow}>ÜRETİCİ GÖRÜNÜMÜ</Text>
            <Text style={styles.heroName}>{cattle.name}</Text>
            <Text style={styles.heroDetail}>{cattle.breed} · {cattle.purpose}</Text>
            <View style={styles.statusRow}>
              <View style={styles.healthBadge}>
                <View style={styles.healthDot} />
                <Text style={styles.healthBadgeText}>{cattle.healthStatus}</Text>
              </View>
              <Text style={styles.sexText}>{cattle.sex}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.integrationNotice}>
          <View style={styles.integrationIcon}>
            <Ionicons name="git-compare-outline" size={20} color="#92400E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.integrationTitle}>HAYBİS entegrasyon simülasyonu</Text>
            <Text style={styles.integrationText}>
              Bu kayıt mevcut resmî sistemin üzerinde çalışan demo deneyim katmanını gösterir.
            </Text>
          </View>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text style={styles.sectionEyebrow}>DİJİTAL KİMLİK</Text>
              <Text style={styles.sectionTitle}>Hayvan kayıt bilgileri</Text>
            </View>
            <View style={styles.verifiedIcon}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            </View>
          </View>

          <View style={styles.primaryIdentity}>
            <Text style={styles.identityLabel}>Hayvan Kimlik Numarası (HKN)</Text>
            <Text style={styles.identityValue}>{cattle.hkn}</Text>
          </View>

          <View style={styles.identityGrid}>
            <InfoItem icon="pricetag-outline" label="Küpe No" value={cattle.earTag} mono />
            <InfoItem icon="calendar-outline" label="Doğum" value={formatDateShort(cattle.birthDate)} />
            <InfoItem icon="female-outline" label="Cinsiyet" value={cattle.sex} />
            <InfoItem icon="leaf-outline" label="Kullanım" value={cattle.purpose} />
          </View>
        </View>

        <View style={styles.enterpriseCard}>
          <View style={styles.enterpriseIcon}>
            <Ionicons name="business-outline" size={22} color="#A16207" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>BAĞLI İŞLETME</Text>
            <Text style={styles.enterpriseName}>{cattle.enterprise.name}</Text>
            <Text style={styles.enterpriseLocation}>
              {cattle.enterprise.district} / {cattle.enterprise.city}
            </Text>
            <Text style={styles.enterpriseNumber}>{cattle.enterprise.registrationNo}</Text>
          </View>
          <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text style={styles.sectionEyebrow}>AŞI KARTI</Text>
              <Text style={styles.sectionTitle}>Koruyucu sağlık programı</Text>
            </View>
            <View style={styles.coverageBadge}>
              <Text style={styles.coverageValue}>%{cattle.vaccinationCoverage}</Text>
              <Text style={styles.coverageLabel}>kapsam</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${cattle.vaccinationCoverage}%` }]} />
          </View>

          <View style={styles.vaccineList}>
            {cattle.vaccinations.map(vaccination => (
              <View key={vaccination.id} style={styles.vaccineCard}>
                <View style={[
                  styles.vaccineIcon,
                  vaccination.status === 'upcoming' && styles.vaccineIconUpcoming,
                ]}>
                  <Ionicons
                    name={vaccination.status === 'upcoming' ? 'time-outline' : 'checkmark-circle-outline'}
                    size={21}
                    color={vaccination.status === 'upcoming' ? Colors.warning : Colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vaccineName}>{vaccination.name}</Text>
                  <Text style={styles.vaccineMeta}>
                    Uygulandı: {formatDateShort(vaccination.appliedDate)}
                  </Text>
                  <Text style={styles.vaccineMeta}>
                    Sonraki: {formatDateShort(vaccination.nextDate)}
                  </Text>
                  <Text style={styles.lotNumber}>Seri: {vaccination.lotNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text style={styles.sectionEyebrow}>OLAY GEÇMİŞİ</Text>
              <Text style={styles.sectionTitle}>Yaşam boyu kayıt zinciri</Text>
            </View>
            <Ionicons name="time-outline" size={22} color={Colors.textMuted} />
          </View>

          <View style={styles.timeline}>
            {cattle.events.map((event, index) => (
              <View key={event.id} style={styles.timelineItem}>
                <View style={styles.timelineRail}>
                  <View style={styles.timelineDot}>
                    <Ionicons name={eventIcons[event.type]} size={14} color={Colors.primary} />
                  </View>
                  {index < cattle.events.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>{formatDate(event.date)}</Text>
                  <Text style={styles.timelineTitle}>{event.title}</Text>
                  <Text style={styles.timelineDescription}>{event.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footerNote}>
          Sentetik demo kaydıdır · Gerçek hayvan veya işletme verisi içermez
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function InfoItem({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: IconName
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={16} color="#A16207" />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, mono && styles.monoValue]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEB' },
  header: {
    backgroundColor: '#713F12', paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  backText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  demoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(146, 64, 14, 0.5)', borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(253, 230, 138, 0.45)',
  },
  demoBadgeText: { color: '#FEF3C7', fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, paddingHorizontal: Spacing.xl },
  cattleAvatar: {
    width: 82, height: 82, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  cattleEmoji: { fontSize: 44 },
  heroInfo: { flex: 1 },
  heroEyebrow: { fontSize: 9, color: '#FDE68A', fontWeight: FontWeight.bold, letterSpacing: 1.2 },
  heroName: { fontSize: FontSize.xxxl, color: '#fff', fontFamily: Fonts.bold, fontWeight: FontWeight.bold, marginTop: 2 },
  heroDetail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  healthBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: Radius.full,
    backgroundColor: 'rgba(16,185,129,0.18)', paddingHorizontal: 8, paddingVertical: 4,
  },
  healthDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399' },
  healthBadgeText: { fontSize: 10, color: '#D1FAE5', fontWeight: FontWeight.semibold },
  sexText: { color: 'rgba(255,255,255,0.65)', fontSize: FontSize.xs },
  content: { flex: 1 },
  contentContainer: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: 36 },
  integrationNotice: {
    flexDirection: 'row', gap: Spacing.md, alignItems: 'center',
    backgroundColor: '#FEF3C7', borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: '#FCD34D',
  },
  integrationIcon: {
    width: 42, height: 42, borderRadius: Radius.md, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  integrationTitle: { fontSize: FontSize.sm, color: '#78350F', fontWeight: FontWeight.bold },
  integrationText: { fontSize: FontSize.xs, color: '#92400E', lineHeight: 17, marginTop: 2 },
  identityCard: {
    backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: '#FDE68A', shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  sectionCard: {
    backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md },
  sectionEyebrow: { fontSize: 9, color: '#A16207', fontWeight: FontWeight.bold, letterSpacing: 1 },
  sectionTitle: { fontSize: FontSize.lg, color: Colors.text, fontFamily: Fonts.bold, fontWeight: FontWeight.bold, marginTop: 2 },
  verifiedIcon: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  primaryIdentity: { backgroundColor: '#FFFBEB', borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.lg },
  identityLabel: { fontSize: FontSize.xs, color: '#92400E' },
  identityValue: { fontSize: FontSize.base, color: '#713F12', fontFamily: 'monospace', fontWeight: FontWeight.bold, marginTop: 3 },
  identityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  infoItem: { width: '48%', borderRadius: Radius.md, backgroundColor: '#F8FAFC', padding: Spacing.md },
  infoLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 6 },
  infoValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.semibold, marginTop: 2 },
  monoValue: { fontFamily: 'monospace' },
  enterpriseCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  enterpriseIcon: { width: 48, height: 48, borderRadius: Radius.lg, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 9, color: '#A16207', fontWeight: FontWeight.bold, letterSpacing: 0.8 },
  enterpriseName: { fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.bold, marginTop: 2 },
  enterpriseLocation: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  enterpriseNumber: { fontSize: 10, color: Colors.textMuted, fontFamily: 'monospace', marginTop: 4 },
  coverageBadge: { alignItems: 'flex-end' },
  coverageValue: { fontSize: FontSize.xl, color: Colors.primary, fontWeight: FontWeight.bold },
  coverageLabel: { fontSize: 9, color: Colors.textMuted },
  progressTrack: { height: 7, borderRadius: Radius.full, backgroundColor: Colors.surfaceAlt, overflow: 'hidden', marginTop: Spacing.lg },
  progressFill: { height: '100%', borderRadius: Radius.full, backgroundColor: Colors.primary },
  vaccineList: { gap: Spacing.sm, marginTop: Spacing.lg },
  vaccineCard: { flexDirection: 'row', gap: Spacing.md, borderRadius: Radius.md, backgroundColor: '#F8FAFC', padding: Spacing.md },
  vaccineIcon: { width: 42, height: 42, borderRadius: Radius.md, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  vaccineIconUpcoming: { backgroundColor: '#FEF3C7' },
  vaccineName: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.bold },
  vaccineMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  lotNumber: { fontSize: 9, color: Colors.textMuted, fontFamily: 'monospace', marginTop: 4 },
  timeline: { marginTop: Spacing.lg },
  timelineItem: { flexDirection: 'row', gap: Spacing.md },
  timelineRail: { width: 34, alignItems: 'center' },
  timelineDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineLine: { width: 2, flex: 1, minHeight: 48, backgroundColor: Colors.primaryBorder },
  timelineContent: { flex: 1, paddingBottom: Spacing.lg },
  timelineDate: { fontSize: 10, color: Colors.textMuted },
  timelineTitle: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.bold, marginTop: 2 },
  timelineDescription: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18, marginTop: 3 },
  footerNote: { fontSize: 10, color: '#A16207', textAlign: 'center', lineHeight: 16 },
})

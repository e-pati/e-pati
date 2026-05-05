import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Linking,
} from 'react-native'
import { router, type Href } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { clinicDiscoveryService, type NearbyClinic } from '@/services/clinic-discovery.service'
import { Colors, Fonts, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'

export default function ClinicDiscoveryScreen() {
  const clinicsQuery = useQuery({
    queryKey: ['clinic-discovery'],
    queryFn: () => clinicDiscoveryService.getNearby(),
    retry: 1,
  })

  const clinics = clinicsQuery.data ?? []

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Klinik Keşif</Text>
          <Text style={styles.headerSubtitle}>Yakındaki VetCep klinikleri</Text>
        </View>
      </View>

      {clinicsQuery.isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Klinik keşif servisi henüz hazır değil. Endpoint bekleniyor.</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={clinicsQuery.isRefetching} onRefresh={clinicsQuery.refetch} tintColor={Colors.primary} />}
      >
        <View style={styles.mapPreviewCard}>
          <View style={styles.mapGrid}>
            <View style={[styles.mapPin, styles.mapPinPrimary]}>
              <Ionicons name="paw" size={14} color="#fff" />
            </View>
            <View style={[styles.mapPin, styles.mapPinSecondary]}>
              <Ionicons name="medical" size={13} color="#fff" />
            </View>
            <View style={[styles.mapPin, styles.mapPinMuted]}>
              <Ionicons name="location" size={13} color="#fff" />
            </View>
          </View>
          <View style={styles.mapContent}>
            <Text style={styles.heroTitle}>Konum tabanlı keşif hazır</Text>
            <Text style={styles.heroText}>
              Harita SDK ve konum izni bağlandığında klinikler mesafe, açık/kapalı durumu ve randevu uygunluğuyla sıralanacak.
            </Text>
            <View style={styles.locationChips}>
              <View style={styles.locationChip}>
                <Ionicons name="navigate-outline" size={14} color={Colors.primary} />
                <Text style={styles.locationChipText}>Konum izni</Text>
              </View>
              <View style={styles.locationChip}>
                <Ionicons name="map-outline" size={14} color={Colors.primary} />
                <Text style={styles.locationChipText}>Harita görünümü</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.contractCard}>
          <Text style={styles.sectionTitle}>Backend kontratı</Text>
          {['GET /clinics/discovery', 'GET /clinics/:id/public-profile', 'POST /appointments/request'].map(endpoint => (
            <Text key={endpoint} style={styles.codeText}>{endpoint}</Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Klinikler</Text>
        {clinicsQuery.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : clinics.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={52} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Yakında klinikler burada</Text>
            <Text style={styles.emptyText}>VetCep partner klinikleri konuma göre listelenecek.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {clinics.map(clinic => <ClinicCard key={clinic.id} clinic={clinic} />)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function ClinicCard({ clinic }: { clinic: NearbyClinic }) {
  const detailRoute = `/profile/clinics/${clinic.id}` as Href

  return (
    <TouchableOpacity style={styles.clinicCard} onPress={() => router.push(detailRoute)} activeOpacity={0.86}>
      <View style={styles.clinicIcon}>
        <Ionicons name="business" size={20} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.clinicName}>{clinic.name}</Text>
        <Text style={styles.clinicMeta}>
          {[clinic.district, clinic.city].filter(Boolean).join(' / ') || clinic.address || 'Konum bilgisi bekleniyor'}
        </Text>
        {clinic.distanceKm !== undefined && (
          <Text style={styles.clinicDistance}>{clinic.distanceKm.toFixed(1)} km</Text>
        )}
      </View>
      {clinic.phone && (
        <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL(`tel:${clinic.phone}`)}>
          <Ionicons name="call" size={17} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
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
  content: { padding: Spacing.lg, paddingBottom: 40 },
  mapPreviewCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', gap: Spacing.md, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  mapGrid: { width: 108, height: 112, borderRadius: Radius.xl, backgroundColor: Colors.primaryBg, position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: Colors.primaryBorder },
  mapPin: { position: 'absolute', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  mapPinPrimary: { left: 18, top: 20, backgroundColor: Colors.primary },
  mapPinSecondary: { right: 16, top: 44, backgroundColor: Colors.info },
  mapPinMuted: { left: 42, bottom: 16, backgroundColor: Colors.warning },
  mapContent: { flex: 1 },
  heroTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text },
  heroText: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.sm, lineHeight: 20 },
  locationChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  locationChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: Radius.full, backgroundColor: Colors.primaryBg, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  locationChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },
  contractCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  codeText: { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
  center: { padding: Spacing.xxxl, alignItems: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.lg },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm },
  list: { gap: Spacing.md },
  clinicCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  clinicIcon: { width: 42, height: 42, borderRadius: Radius.lg, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  clinicName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  clinicMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  clinicDistance: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold, marginTop: 4 },
  callButton: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
})

import { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, Alert,
} from 'react-native'
import { router, type Href } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { ownerPremiumService } from '@/services/premium.service'
import { Colors, Fonts, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'

const features = [
  'Sınırsız hayvan profili',
  'Diyet ve kilo takip defteri',
  'Gelişmiş ilaç hatırlatıcıları',
  'Klinik randevu önceliği',
  'Sağlık geçmişi dışa aktarma',
]

const endpointContracts = [
  'GET /owner-subscriptions/current',
  'POST /owner-subscriptions/checkout',
  'POST /owner-subscriptions/webhook/iyzico',
]

const healthTrackingRoute = '/profile/health-tracking' as Href

export default function PremiumScreen() {
  const [isStartingCheckout, setIsStartingCheckout] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const statusQuery = useQuery({
    queryKey: ['owner-premium-status'],
    queryFn: () => ownerPremiumService.getStatus(),
    retry: 1,
  })

  const startCheckout = async () => {
    setIsStartingCheckout(true)
    setCheckoutError(null)
    try {
      const checkout = await ownerPremiumService.createCheckout()
      if (checkout.checkoutUrl) {
        await Linking.openURL(checkout.checkoutUrl)
        return
      }
      Alert.alert('Premium', 'Checkout oturumu oluşturuldu. Ödeme ekranı backend yanıt formatı netleşince açılacak.')
    } catch {
      setCheckoutError('Sahip premium ödeme servisi henüz hazır değil. Endpoint bekleniyor.')
    } finally {
      setIsStartingCheckout(false)
    }
  }

  const isActive = statusQuery.data?.isActive ?? false

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>VetCep Premium</Text>
          <Text style={styles.headerSubtitle}>Sahipler için gelişmiş sağlık takibi</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {statusQuery.isError && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>Premium durum servisi henüz hazır değil. Endpoint bekleniyor.</Text>
          </View>
        )}

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles" size={26} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{isActive ? 'Premium aktif' : 'Tüm bakım kayıtları tek yerde'}</Text>
          <Text style={styles.heroText}>
            Aşı, ilaç, diyet, kilo ve klinik randevularını sahip deneyimi için daha kapsamlı takip edin.
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₺29</Text>
            <Text style={styles.priceMeta}>/ ay</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Premium özellikler</Text>
          {features.map(feature => (
            <View key={feature} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.trackingCard} onPress={() => router.push(healthTrackingRoute)} activeOpacity={0.86}>
          <View style={styles.trackingIcon}>
            <Ionicons name="analytics-outline" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.trackingTitle}>Diyet ve kilo takibi</Text>
            <Text style={styles.trackingText}>Hayvan bazlı kilo kaydı, vücut kondisyonu ve aktif beslenme planı oluşturun.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ödeme altyapısı</Text>
          <Text style={styles.bodyText}>
            iyzico checkout endpointi geldiğinde bu ekrandaki aksiyon kullanıcıyı güvenli ödeme sayfasına yönlendirecek.
          </Text>
          <View style={styles.contractList}>
            {endpointContracts.map(endpoint => (
              <Text key={endpoint} style={styles.codeText}>{endpoint}</Text>
            ))}
          </View>
        </View>

        {checkoutError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{checkoutError}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.ctaButton, isStartingCheckout && styles.ctaButtonDisabled]}
          onPress={startCheckout}
          disabled={isStartingCheckout}
          activeOpacity={0.86}
        >
          {isStartingCheckout ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>{isActive ? 'Premium Yönet' : 'Premium Akışını Başlat'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  content: { padding: Spacing.lg, paddingBottom: 40 },
  warningBox: { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  warningText: { color: '#92400e', fontSize: FontSize.sm },
  heroCard: { backgroundColor: Colors.primaryDark, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center' },
  heroIcon: { width: 56, height: 56, borderRadius: Radius.xl, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  heroTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff', textAlign: 'center' },
  heroText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.76)', textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: Spacing.lg },
  price: { fontSize: 34, lineHeight: 38, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  priceMeta: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.72)', marginBottom: 5, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text, marginBottom: Spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 8 },
  featureText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  trackingCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  trackingIcon: { width: 44, height: 44, borderRadius: Radius.lg, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  trackingTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text },
  trackingText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3, lineHeight: 17 },
  bodyText: { fontSize: FontSize.sm, color: Colors.textMuted, lineHeight: 20 },
  contractList: { gap: Spacing.sm, marginTop: Spacing.md },
  codeText: { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm },
  errorBox: { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.lg },
  errorText: { color: '#991b1b', fontSize: FontSize.sm },
  ctaButton: { height: 52, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg },
  ctaButtonDisabled: { opacity: 0.72 },
  ctaText: { color: '#fff', fontSize: FontSize.base, fontWeight: FontWeight.bold, fontFamily: Fonts.bold },
})

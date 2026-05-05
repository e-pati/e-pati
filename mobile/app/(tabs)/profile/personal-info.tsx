import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/stores/auth.store'
import { Colors, Fonts, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'

export default function PersonalInfoScreen() {
  const user = useAuthStore(s => s.user)
  const nameParts = user?.fullName?.split(' ') ?? []
  const firstName = nameParts.slice(0, -1).join(' ') || user?.fullName || ''
  const lastName = nameParts.length > 1 ? nameParts.at(-1) ?? '' : ''

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Kişisel Bilgiler" subtitle="Hesap profilinizi görüntüleyin" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profil</Text>
          <ReadonlyField label="Ad" value={firstName || 'Ad bilgisi bekleniyor'} />
          <ReadonlyField label="Soyad" value={lastName || 'Soyad bilgisi bekleniyor'} />
          <ReadonlyField label="E-posta" value={user?.email || 'E-posta bekleniyor'} />
          <ReadonlyField label="Rol" value={roleLabel(user?.role)} />
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            Profil güncelleme endpointi hazır olduğunda bu alanlar düzenlenebilir hale gelecek.
          </Text>
        </View>

        <View style={styles.contractCard}>
          <Text style={styles.sectionTitle}>Backend kontratı</Text>
          <Text style={styles.codeText}>GET /auth/me</Text>
          <Text style={styles.codeText}>PATCH /owners/me</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color="#fff" />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
    </View>
  )
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} editable={false} style={styles.input} />
    </View>
  )
}

function roleLabel(role?: string) {
  if (role === 'OWNER') return 'Evcil Hayvan Sahibi'
  if (role === 'VETERINARIAN') return 'Veteriner Hekim'
  if (role === 'CLINIC_ADMIN') return 'Klinik Yöneticisi'
  if (role === 'SUPER_ADMIN') return 'Sistem Yöneticisi'
  return 'Kullanıcı'
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.xl, borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backButton: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  headerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  field: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 6 },
  input: { minHeight: 46, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, color: Colors.textSecondary, backgroundColor: Colors.surface, fontSize: FontSize.base },
  infoCard: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.lg },
  infoText: { flex: 1, fontSize: FontSize.sm, color: '#1d4ed8', lineHeight: 19 },
  contractCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg },
  codeText: { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
})

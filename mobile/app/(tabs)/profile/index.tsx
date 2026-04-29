import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Switch, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'
import { usePets } from '@/services/pets.service'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

function useMobilePets() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    import('@/services/pets.service').then(({ petsService }) => {
      petsService.getAll().then(pets => setCount(pets.length)).catch(() => {})
    })
  }, [])
  return count
}

export default function ProfileScreen() {
  const { user, loadUser } = useAuthStore()
  const petCount = useMobilePets()

  const [notifications, setNotifications] = useState(true)
  const [vaccinationAlerts, setVaccinationAlerts] = useState(true)
  const [medicationReminders, setMedicationReminders] = useState(false)

  useEffect(() => {
    if (!user) loadUser()
  }, [])

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await authService.logout()
            useAuthStore.getState().clearUser()
            router.replace('/(auth)/login')
          },
        },
      ]
    )
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??'

  const roleLabel = (role?: string) => {
    if (role === 'VETERINARIAN') return 'Veteriner Hekim'
    if (role === 'CLINIC_ADMIN') return 'Klinik Yöneticisi'
    if (role === 'OWNER') return 'Evcil Hayvan Sahibi'
    return 'Kullanıcı'
  }

  const sections = [
    {
      title: 'Hesap',
      rows: [
        { label: 'Kişisel Bilgiler', icon: '👤', onPress: () => {} },
        { label: 'Güvenlik', icon: '🔒', onPress: () => {} },
        { label: 'KVKK Ayarları', icon: '📋', onPress: () => {} },
      ],
    },
    {
      title: 'Bildirimler',
      rows: [
        { label: 'Tüm Bildirimler', icon: '🔔', toggle: true, value: notifications, onToggle: setNotifications },
        { label: 'Aşı Uyarıları', icon: '💉', toggle: true, value: vaccinationAlerts, onToggle: setVaccinationAlerts },
        { label: 'İlaç Hatırlatıcısı', icon: '💊', toggle: true, value: medicationReminders, onToggle: setMedicationReminders },
      ],
    },
    {
      title: 'Uygulama',
      rows: [
        { label: 'Yardım ve Destek', icon: '❓', onPress: () => {} },
        { label: 'Gizlilik Politikası', icon: '🛡️', onPress: () => {} },
        { label: 'Versiyon 1.0.0', icon: 'ℹ️', onPress: () => {} },
      ],
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profil kartı */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.fullName ?? 'Kullanıcı'}</Text>
            <Text style={styles.email}>{user?.email ?? ''}</Text>
            <Text style={styles.role}>{roleLabel(user?.role)}</Text>
            {petCount > 0 && (
              <Text style={styles.petCount}>{petCount} evcil hayvan kayıtlı</Text>
            )}
          </View>
        </View>

        {/* Ayarlar */}
        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.rows.map((row, i) => (
                <TouchableOpacity
                  key={row.label}
                  style={[styles.row, i < section.rows.length - 1 && styles.rowBorder]}
                  onPress={!row.toggle ? row.onPress : undefined}
                  activeOpacity={row.toggle ? 1 : 0.7}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowIcon}>{row.icon}</Text>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                  </View>
                  {row.toggle ? (
                    <Switch
                      value={row.value}
                      onValueChange={row.onToggle}
                      trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
                      thumbColor={row.value ? Colors.primary : Colors.textMuted}
                    />
                  ) : (
                    <Text style={styles.chevron}>›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Çıkış */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>🚪 Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingBottom: 32 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.lg,
    margin: Spacing.xl, padding: Spacing.xl,
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  avatar: {
    width: 64, height: 64, borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  profileInfo: { flex: 1 },
  name: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  role: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  petCount: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 4, fontWeight: FontWeight.medium },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: Colors.background, borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowIcon: { fontSize: 18 },
  rowLabel: { fontSize: FontSize.base, color: Colors.text },
  chevron: { fontSize: 20, color: Colors.textMuted },
  logoutBtn: {
    marginHorizontal: Spacing.xl, marginTop: Spacing.md,
    height: 52, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.danger + '40',
    backgroundColor: Colors.danger + '08',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.danger },
})

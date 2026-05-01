import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Switch, Alert, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'
import { Colors, Spacing, Radius, FontSize, FontWeight, Fonts } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

function useMobilePets() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    import('@/services/pets.service').then(({ petsService }) => {
      petsService.getAll().then(pets => setCount(pets.length)).catch(() => {})
    })
  }, [])
  return count
}

type PetSex = 'MALE' | 'FEMALE' | 'UNKNOWN'

export default function ProfileScreen() {
  const { user, loadUser } = useAuthStore()
  const petCount = useMobilePets()
  const [notifications, setNotifications] = useState(true)
  const [vaccinationAlerts, setVaccinationAlerts] = useState(true)
  const [medicationReminders, setMedicationReminders] = useState(false)

  useEffect(() => { if (!user) loadUser() }, [])

  const handleLogout = async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Hesabınızdan çıkmak istediğinize emin misiniz?')
      : await new Promise<boolean>(resolve =>
          Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Çıkış Yap', style: 'destructive', onPress: () => resolve(true) },
          ])
        )
    if (!confirmed) return
    await authService.logout()
    useAuthStore.getState().clearUser()
    router.replace('/(auth)/login')
  }

  const initials = user?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '??'
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
        { label: 'Kişisel Bilgiler', icon: 'person-outline' as const, color: Colors.primary, onPress: () => Alert.alert('Yakında', 'Kişisel bilgi düzenleme özelliği yakında eklenecek.') },
        { label: 'Güvenlik', icon: 'lock-closed-outline' as const, color: '#6366f1', onPress: () => Alert.alert('Güvenlik', 'Şifre değiştirmek için sistem yöneticinizle iletişime geçin.') },
        { label: 'KVKK Ayarları', icon: 'document-text-outline' as const, color: '#f59e0b', onPress: () => Alert.alert('KVKK', 'Kişisel verilerinize ilişkin talepler için destek@epati.com adresine yazabilirsiniz.') },
      ],
    },
    {
      title: 'Bildirimler',
      rows: [
        { label: 'Tüm Bildirimler', icon: 'notifications-outline' as const, color: Colors.primary, toggle: true, value: notifications, onToggle: setNotifications },
        { label: 'Aşı Uyarıları', icon: 'medical-outline' as const, color: '#3b82f6', toggle: true, value: vaccinationAlerts, onToggle: setVaccinationAlerts },
        { label: 'İlaç Hatırlatıcısı', icon: 'alarm-outline' as const, color: '#8b5cf6', toggle: true, value: medicationReminders, onToggle: setMedicationReminders },
      ],
    },
    {
      title: 'Uygulama',
      rows: [
        { label: 'Yardım ve Destek', icon: 'help-circle-outline' as const, color: '#0ea5e9', onPress: () => Alert.alert('Destek', 'destek@epati.com adresine yazabilirsiniz.') },
        { label: 'Gizlilik Politikası', icon: 'shield-checkmark-outline' as const, color: '#10b981', onPress: () => Alert.alert('Gizlilik', 'epati.com/gizlilik adresini ziyaret edin.') },
        { label: 'Versiyon 1.0.0', icon: 'information-circle-outline' as const, color: '#94a3b8', onPress: () => Alert.alert('e-Pati v1.0.0', 'Güncel sürümü kullanıyorsunuz.') },
      ],
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header — profil bilgisi */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>🐾</Text>
            </View>
          </View>
          <Text style={styles.name}>{user?.fullName ?? 'Kullanıcı'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{roleLabel(user?.role)}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{petCount}</Text>
              <Text style={styles.statLabel}>Hayvan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>e-Pati</Text>
              <Text style={styles.statLabel}>Üye</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>v1.0</Text>
              <Text style={styles.statLabel}>Sürüm</Text>
            </View>
          </View>
        </View>

        {/* Ayarlar */}
        <View style={styles.content}>
          {sections.map(section => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionCard}>
                {section.rows.map((row: any, i: number) => (
                  <TouchableOpacity
                    key={row.label}
                    style={[styles.row, i < section.rows.length - 1 && styles.rowBorder]}
                    onPress={!row.toggle ? row.onPress : undefined}
                    activeOpacity={row.toggle ? 1 : 0.7}
                  >
                    <View style={styles.rowLeft}>
                      <View style={[styles.rowIconBox, { backgroundColor: (row.color ?? Colors.primary) + '18' }]}>
                        <Ionicons name={row.icon} size={18} color={row.color ?? Colors.primary} />
                      </View>
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

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  scroll: { paddingBottom: 40 },

  // Header
  header: {
    backgroundColor: Colors.primaryDark,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    paddingTop: Platform.OS === 'android' ? Spacing.xxxl : Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  avatarWrap: { position: 'relative', marginBottom: Spacing.md },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: FontWeight.bold, color: '#fff', fontFamily: Fonts.bold },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  avatarBadgeText: { fontSize: 14 },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff', marginBottom: 4 },
  email: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginBottom: Spacing.md },
  rolePill: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: Spacing.xl,
  },
  roleText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.9)', fontWeight: FontWeight.semibold },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.xl,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Content
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#fff', borderRadius: Radius.xl, overflow: 'hidden',
    shadowColor: '#059669', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0FDF4' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  rowIcon: { fontSize: 17 },
  rowLabel: { fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.medium },
  chevron: { fontSize: 20, color: Colors.textMuted },
  logoutBtn: {
    marginTop: Spacing.sm, height: 54, borderRadius: Radius.xl,
    backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: Colors.danger + '25',
  },
  logoutIcon: { fontSize: 16 },
  logoutText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.danger },
})

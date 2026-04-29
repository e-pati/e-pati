import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native'
import { router } from 'expo-router'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'
import { useState } from 'react'

interface SettingRow {
  label: string
  icon: string
  type: 'navigate' | 'toggle'
  value?: boolean
  onToggle?: (v: boolean) => void
  onPress?: () => void
}

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true)
  const [vaccinationAlerts, setVaccinationAlerts] = useState(true)
  const [medicationReminders, setMedicationReminders] = useState(false)

  const sections: { title: string; rows: SettingRow[] }[] = [
    {
      title: 'Hesap',
      rows: [
        { label: 'Kişisel Bilgiler', icon: '👤', type: 'navigate', onPress: () => { } },
        { label: 'Güvenlik', icon: '🔒', type: 'navigate', onPress: () => { } },
        { label: 'KVKK Ayarları', icon: '📋', type: 'navigate', onPress: () => { } },
      ],
    },
    {
      title: 'Bildirimler',
      rows: [
        { label: 'Tüm Bildirimler', icon: '🔔', type: 'toggle', value: notifications, onToggle: setNotifications },
        { label: 'Aşı Uyarıları', icon: '💉', type: 'toggle', value: vaccinationAlerts, onToggle: setVaccinationAlerts },
        { label: 'İlaç Hatırlatıcısı', icon: '💊', type: 'toggle', value: medicationReminders, onToggle: setMedicationReminders },
      ],
    },
    {
      title: 'Uygulama',
      rows: [
        { label: 'Yardım ve Destek', icon: '❓', type: 'navigate', onPress: () => { } },
        { label: 'Gizlilik Politikası', icon: '🛡️', type: 'navigate', onPress: () => { } },
        { label: 'Versiyon 1.0.0', icon: 'ℹ️', type: 'navigate', onPress: () => { } },
      ],
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Profil kartı */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AK</Text>
          </View>
          <View>
            <Text style={styles.name}>Ayşe Kaya</Text>
            <Text style={styles.email}>ayse@mail.com</Text>
            <Text style={styles.petCount}>2 evcil hayvan kayıtlı</Text>
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
                  onPress={row.type === 'navigate' ? row.onPress : undefined}
                  activeOpacity={row.type === 'navigate' ? 0.7 : 1}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowIcon}>{row.icon}</Text>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                  </View>
                  {row.type === 'toggle'
                    ? (
                      <Switch
                        value={row.value}
                        onValueChange={row.onToggle}
                        trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
                        thumbColor={row.value ? Colors.primary : Colors.textMuted}
                      />
                    )
                    : <Text style={styles.chevron}>›</Text>
                  }
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Çıkış */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>🚪 Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.lg,
    margin: Spacing.xl, padding: Spacing.xl,
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  avatar: {
    width: 60, height: 60, borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  name: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  petCount: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 4, fontWeight: FontWeight.medium },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  sectionCard: {
    backgroundColor: Colors.background, borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowIcon: { fontSize: 18 },
  rowLabel: { fontSize: FontSize.base, color: Colors.text },
  chevron: { fontSize: 20, color: Colors.textMuted },
  logoutBtn: {
    marginHorizontal: Spacing.xl, marginTop: Spacing.md,
    height: 52, borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Colors.danger + '40', backgroundColor: Colors.danger + '08',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.danger },
})

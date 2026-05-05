import { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { authService } from '@/services/auth.service'
import { Colors, Fonts, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'

const securityItems = [
  { icon: 'mail-outline' as const, title: 'E-posta doğrulama', text: 'OTP akışı aktif. Doğrulama e-postaları backend üzerinden yönetilir.' },
  { icon: 'phone-portrait-outline' as const, title: 'Oturum güvenliği', text: 'Mobil token SecureStore içinde saklanır ve çıkışta temizlenir.' },
]

export default function SecurityScreen() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const changePassword = useMutation({
    mutationFn: () => authService.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      Alert.alert('Güvenlik', 'Şifreniz güncellendi.')
    },
    onError: () => {
      Alert.alert('Güvenlik', 'Şifre güncellenemedi. Mevcut şifreyi kontrol edip tekrar deneyin.')
    },
  })

  const submitPassword = () => {
    if (newPassword.length < 8) {
      Alert.alert('Güvenlik', 'Yeni şifre en az 8 karakter olmalı.')
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Güvenlik', 'Yeni şifreler eşleşmiyor.')
      return
    }
    changePassword.mutate()
  }

  const canSubmit = currentPassword.length > 0 && newPassword.length >= 8 && confirmPassword.length >= 8 && !changePassword.isPending

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Şifre değiştir</Text>
          <PasswordField label="Mevcut şifre" value={currentPassword} onChangeText={setCurrentPassword} />
          <PasswordField label="Yeni şifre" value={newPassword} onChangeText={setNewPassword} />
          <PasswordField label="Yeni şifre tekrar" value={confirmPassword} onChangeText={setConfirmPassword} />
          <TouchableOpacity
            style={[styles.saveButton, !canSubmit && styles.saveButtonDisabled]}
            onPress={submitPassword}
            disabled={!canSubmit}
            activeOpacity={0.86}
          >
            {changePassword.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Şifreyi Güncelle</Text>}
          </TouchableOpacity>
        </View>

        {securityItems.map(item => (
          <View key={item.title} style={styles.card}>
            <View style={styles.iconBox}>
              <Ionicons name={item.icon} size={20} color="#6366f1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.text}</Text>
            </View>
          </View>
        ))}

        <View style={styles.contractCard}>
          <Text style={styles.sectionTitle}>Backend kontratı</Text>
          <Text style={styles.codeText}>POST /auth/send-otp</Text>
          <Text style={styles.codeText}>POST /auth/verify-otp</Text>
          <Text style={styles.codeText}>PATCH /auth/password</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function PasswordField({
  label,
  value,
  onChangeText,
}: {
  label: string
  value: string
  onChangeText: (value: string) => void
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="••••••••"
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
      />
    </View>
  )
}

function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color="#fff" />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>Güvenlik</Text>
        <Text style={styles.headerSubtitle}>Hesap güvenliği ve oturum bilgileri</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: { backgroundColor: '#6366f1', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.xl, borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backButton: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  headerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  formCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  field: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 6 },
  input: { minHeight: 46, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, color: Colors.text, backgroundColor: '#fff', fontSize: FontSize.base },
  saveButton: { minHeight: 48, borderRadius: Radius.md, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  saveButtonDisabled: { opacity: 0.55 },
  saveButtonText: { color: '#fff', fontSize: FontSize.base, fontWeight: FontWeight.bold },
  card: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  iconBox: { width: 42, height: 42, borderRadius: Radius.lg, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  cardText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, lineHeight: 19 },
  contractCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.sm },
  codeText: { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
})

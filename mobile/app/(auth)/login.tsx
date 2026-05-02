import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Colors, Spacing, Radius, FontSize, FontWeight, Fonts } from '@/constants/theme'
import { authService } from '@/services/auth.service'
import { haptic } from '@/lib/haptics'
import { Ionicons } from '@expo/vector-icons'

const schema = z.object({
  email: z.string().email('Geçerli e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
})

type FormData = z.infer<typeof schema>

export default function LoginScreen() {
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setApiError('')
    haptic.light()
    try {
      await authService.login(data.email, data.password)
      haptic.success()
      router.replace('/(tabs)/pets')
    } catch (err: any) {
      haptic.error()
      setApiError(err?.response?.data?.message ?? 'Giriş başarısız. Bilgilerinizi kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBrand}>
          <View style={styles.heroIcon}>
            <Ionicons name="paw" size={32} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>e-Pati</Text>
        </View>
        <Text style={styles.heroSub}>Evcil Hayvan Sağlık Uygulaması</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Giriş Yap</Text>
          <Text style={styles.cardSub}>Hesabınıza erişin</Text>

          {apiError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{apiError}</Text>
            </View>
          ) : null}

          {/* E-posta */}
          <View style={styles.field}>
            <Text style={styles.label}>E-posta</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="ornek@mail.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          {/* Şifre */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Şifre</Text>
              <TouchableOpacity onPress={() => { }}>
                <Text style={styles.forgotText}>Şifremi unuttum</Text>
              </TouchableOpacity>
            </View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputRow, errors.password && styles.inputError]}>
                  <TextInput
                    style={styles.inputInner}
                    value={value}
                    onChangeText={onChange}
                    placeholder="••••••••"
                    secureTextEntry={!showPw}
                    autoComplete="password"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.eyeBtn}>
                    <Text style={styles.eyeText}>{showPw ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.buttonText}>Giriş Yap</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Kayıt ol */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabın yok mu? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  hero: {
    backgroundColor: Colors.primaryDark,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    alignItems: 'center',
  },
  heroBrand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: 8 },
  heroIcon: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: 32, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.regular },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text, marginBottom: 2 },
  cardSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.xl, fontFamily: Fonts.regular },
  field: { marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  forgotText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  input: {
    height: 48, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.base, color: Colors.text,
    backgroundColor: Colors.background,
  },
  inputRow: {
    height: 48, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background,
  },
  inputInner: { flex: 1, paddingHorizontal: Spacing.md, fontSize: FontSize.base, color: Colors.text },
  inputError: { borderColor: Colors.danger },
  eyeBtn: { paddingHorizontal: Spacing.md },
  eyeText: { fontSize: 16 },
  errorText: { fontSize: FontSize.xs, color: Colors.danger, marginTop: 4 },
  button: {
    height: 52, borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.md,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  footerLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  errorBox: {
    backgroundColor: '#fef2f2', borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: '#fecaca',
  },
  errorBoxText: { fontSize: FontSize.sm, color: Colors.danger },
})

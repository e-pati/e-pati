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
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

const schema = z.object({
  phone: z.string().min(10, 'Geçerli telefon numarası girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
})

type FormData = z.infer<typeof schema>

export default function LoginScreen() {
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    router.replace('/(tabs)/pets')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoBox}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🐾</Text>
          </View>
          <Text style={styles.logoText}>e-Pati</Text>
          <Text style={styles.logoSub}>Evcil Hayvan Sağlık Uygulaması</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Giriş Yap</Text>

          {/* Telefon */}
          <View style={styles.field}>
            <Text style={styles.label}>Telefon Numarası</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="05XX XXX XX XX"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
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
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: 80, paddingBottom: 40 },
  logoBox: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logoIcon: {
    width: 80, height: 80, borderRadius: Radius.xl,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoEmoji: { fontSize: 40 },
  logoText: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.primary },
  logoSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xl },
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
})

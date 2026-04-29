import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { authService } from '@/services/auth.service'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

const schema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  phone: z.string().min(10, 'Geçerli telefon numarası girin'),
  email: z.string().email('Geçerli e-posta girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
})

type FormData = z.infer<typeof schema>

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false)
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await authService.register({
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      router.replace('/(tabs)/pets')
    } catch {
      Alert.alert('Kayıt başarısız', 'Bilgileri kontrol edip tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const fields: Array<{
    name: keyof FormData
    label: string
    placeholder: string
    keyboardType?: any
    secure?: boolean
    autoComplete?: any
  }> = [
    { name: 'firstName', label: 'Ad', placeholder: 'Adınız', autoComplete: 'given-name' },
    { name: 'lastName', label: 'Soyad', placeholder: 'Soyadınız', autoComplete: 'family-name' },
    { name: 'phone', label: 'Telefon', placeholder: '05XX XXX XX XX', keyboardType: 'phone-pad', autoComplete: 'tel' },
    { name: 'email', label: 'E-posta', placeholder: 'ornek@mail.com', keyboardType: 'email-address', autoComplete: 'email' },
    { name: 'password', label: 'Şifre', placeholder: 'En az 8 karakter', secure: true, autoComplete: 'new-password' },
  ]

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>Evcil dostunuzun sağlık kaydına başlayın</Text>

        <View style={styles.card}>
          {fields.map(field => (
            <View key={field.name} style={styles.field}>
              <Text style={styles.label}>{field.label}</Text>
              <Controller
                control={control}
                name={field.name}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors[field.name] && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType={field.keyboardType}
                    secureTextEntry={field.secure}
                    autoComplete={field.autoComplete}
                    autoCapitalize={field.keyboardType === 'email-address' ? 'none' : 'words'}
                  />
                )}
              />
              {errors[field.name] && (
                <Text style={styles.errorText}>{errors[field.name]?.message}</Text>
              )}
            </View>
          ))}

          <View style={styles.kvkkBox}>
            <Text style={styles.kvkkText}>
              Kayıt olarak{' '}
              <Text style={styles.kvkkLink}>Gizlilik Politikası</Text>
              {' '}ve{' '}
              <Text style={styles.kvkkLink}>KVKK Aydınlatma Metni</Text>
              'ni okuduğunuzu kabul ediyorsunuz.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.buttonText}>Doğrulama Kodu Gönder</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: Spacing.xxl },
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.medium },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 6 },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing.xxl },
  card: {
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    padding: Spacing.xxl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  field: { marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: 6 },
  input: {
    height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, fontSize: FontSize.base, color: Colors.text,
    backgroundColor: Colors.background,
  },
  inputError: { borderColor: Colors.danger },
  errorText: { fontSize: FontSize.xs, color: Colors.danger, marginTop: 4 },
  kvkkBox: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  kvkkText: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  kvkkLink: { color: Colors.primary, fontWeight: FontWeight.medium },
  button: {
    height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  footerLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
})

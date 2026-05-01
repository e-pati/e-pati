import { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Colors, Spacing, Radius, FontSize, FontWeight, Fonts } from '@/constants/theme'
import { authService } from '@/services/auth.service'

export default function OtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [errorMsg, setErrorMsg] = useState('')
  const inputs = useRef<(TextInput | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    startCountdown()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const startCountdown = () => {
    setCountdown(60)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0 }
        return c - 1
      })
    }, 1000)
  }

  const handleChange = (text: string, index: number) => {
    const digits = text.replace(/\D/g, '')
    const next = [...otp]
    next[index] = digits.slice(-1)
    setOtp(next)
    setErrorMsg('')
    if (digits && index < 5) inputs.current[index + 1]?.focus()
    if (next.every(d => d) && next.join('').length === 6) handleVerify(next.join(''))
  }

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (code: string) => {
    if (!email) return
    setLoading(true)
    setErrorMsg('')
    try {
      await authService.verifyOtp(email, code)
      router.replace('/(tabs)/pets')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      const text = msg ?? 'Kod hatalı veya süresi dolmuş.'
      if (Platform.OS === 'web') {
        setErrorMsg(text)
      } else {
        Alert.alert('Doğrulama başarısız', text)
      }
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email || resending) return
    setResending(true)
    try {
      await authService.sendOtp(email)
      startCountdown()
      setErrorMsg('')
    } catch {
      setErrorMsg('Kod gönderilemedi, tekrar deneyin.')
    } finally {
      setResending(false)
    }
  }

  const filled = otp.join('')

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Geri</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>✉️</Text>
        </View>
        <Text style={styles.title}>E-posta Doğrulama</Text>
        <Text style={styles.subtitle}>
          <Text style={styles.emailText}>{email}</Text>
          {'\n'}adresine gönderilen 6 haneli kodu girin
        </Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={ref => { inputs.current[i] = ref }}
              style={[styles.otpInput, digit && styles.otpFilled]}
              value={digit}
              onChangeText={text => handleChange(text, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, (filled.length < 6 || loading) && styles.buttonDisabled]}
          onPress={() => handleVerify(filled)}
          disabled={filled.length < 6 || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.buttonText}>Doğrula</Text>
          }
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Spam klasörünü kontrol edin · </Text>
          {countdown > 0
            ? <Text style={styles.countdown}>{countdown}s</Text>
            : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Text style={styles.resendLink}>
                  {resending ? 'Gönderiliyor...' : 'Tekrar Gönder'}
                </Text>
              </TouchableOpacity>
            )
          }
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.xl, paddingTop: 60 },
  back: { marginBottom: Spacing.xxxl },
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.medium },
  content: { alignItems: 'center' },
  iconBox: {
    width: 80, height: 80, borderRadius: Radius.xl,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  icon: { fontSize: 40 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg },
  emailText: { fontWeight: FontWeight.semibold, color: Colors.text },
  errorBox: {
    backgroundColor: '#FEF2F2', borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: '#FECACA', marginBottom: Spacing.lg, width: '100%',
  },
  errorText: { color: '#DC2626', fontSize: FontSize.sm, textAlign: 'center' },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.xxxl },
  otpInput: {
    width: 46, height: 56, borderRadius: Radius.md,
    borderWidth: 2, borderColor: Colors.border,
    textAlign: 'center', fontSize: FontSize.xl,
    fontWeight: FontWeight.bold, color: Colors.text,
  },
  otpFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  button: {
    width: '100%', height: 52, borderRadius: Radius.md,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },
  resendRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  resendText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  countdown: { fontSize: FontSize.sm, color: Colors.textMuted },
  resendLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
})

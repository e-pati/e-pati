import { useState, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

export default function OtpScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputs = useRef<(TextInput | null)[]>([])

  const handleChange = (text: string, index: number) => {
    const digits = text.replace(/\D/g, '')
    const next = [...otp]
    next[index] = digits.slice(-1)
    setOtp(next)
    if (digits && index < 5) inputs.current[index + 1]?.focus()
    if (next.every(d => d) && next.join('').length === 6) handleVerify(next.join(''))
  }

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (code: string) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    router.replace('/(tabs)/pets')
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
          <Text style={styles.icon}>📱</Text>
        </View>
        <Text style={styles.title}>Doğrulama Kodu</Text>
        <Text style={styles.subtitle}>
          Telefonunuza gönderilen 6 haneli kodu girin
        </Text>

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
          <Text style={styles.resendText}>Kod gelmedi mi? </Text>
          {countdown > 0
            ? <Text style={styles.countdown}>{countdown} saniye</Text>
            : (
              <TouchableOpacity onPress={() => setCountdown(60)}>
                <Text style={styles.resendLink}>Tekrar Gönder</Text>
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
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xxxl },
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
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  countdown: { fontSize: FontSize.sm, color: Colors.textMuted },
  resendLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
})

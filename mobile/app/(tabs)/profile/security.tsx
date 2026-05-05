import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Fonts, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'

const securityItems = [
  { icon: 'mail-outline' as const, title: 'E-posta doğrulama', text: 'OTP akışı aktif. Doğrulama e-postaları backend üzerinden yönetilir.' },
  { icon: 'key-outline' as const, title: 'Şifre yenileme', text: 'Şifre değiştirme endpointi geldiğinde güvenli form burada açılacak.' },
  { icon: 'phone-portrait-outline' as const, title: 'Oturum güvenliği', text: 'Mobil token SecureStore içinde saklanır ve çıkışta temizlenir.' },
]

export default function SecurityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
  card: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  iconBox: { width: 42, height: 42, borderRadius: Radius.lg, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  cardText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, lineHeight: 19 },
  contractCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.sm },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  codeText: { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
})

import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Fonts, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'

const rights = [
  'Kayıtlı kişisel verileri görüntüleme',
  'Yanlış veya eksik veriler için düzeltme talebi',
  'Veri silme ve hesap kapatma talebi',
  'Pazarlama ve kampanya izinlerini yönetme',
]

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>KVKK talepleri</Text>
          <Text style={styles.bodyText}>
            VetCep hesabınızla ilişkili kişisel veri talepleri için destek süreci ve izin tercihleri bu ekrandan takip edilecek.
          </Text>
          <View style={styles.rightsList}>
            {rights.map(item => (
              <View key={item} style={styles.rightRow}>
                <Ionicons name="checkmark-circle" size={17} color={Colors.primary} />
                <Text style={styles.rightText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.noticeCard}>
          <Ionicons name="mail-outline" size={20} color="#92400e" />
          <Text style={styles.noticeText}>
            Endpointler hazır olana kadar talepler destek@epati.com adresinden alınır.
          </Text>
        </View>

        <View style={styles.contractCard}>
          <Text style={styles.sectionTitle}>Backend kontratı</Text>
          <Text style={styles.codeText}>GET /privacy/requests</Text>
          <Text style={styles.codeText}>POST /privacy/requests</Text>
          <Text style={styles.codeText}>POST /notifications/preferences</Text>
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
        <Text style={styles.headerTitle}>KVKK Ayarları</Text>
        <Text style={styles.headerSubtitle}>Veri izinleri ve talep süreci</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: { backgroundColor: '#f59e0b', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.xl, borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backButton: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  headerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  bodyText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  rightsList: { marginTop: Spacing.lg, gap: Spacing.sm },
  rightRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rightText: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  noticeCard: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.lg },
  noticeText: { flex: 1, fontSize: FontSize.sm, color: '#92400e', lineHeight: 19 },
  contractCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg },
  codeText: { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
})

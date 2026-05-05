import { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { privacyService } from '@/services/privacy.service'
import { Colors, Fonts, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'

const rights = [
  'Kayıtlı kişisel verileri görüntüleme',
  'Yanlış veya eksik veriler için düzeltme talebi',
  'Veri silme ve hesap kapatma talebi',
  'Pazarlama ve kampanya izinlerini yönetme',
]

const requestTypes = [
  { value: 'data_access', label: 'Veri Görüntüleme' },
  { value: 'correction', label: 'Düzeltme' },
  { value: 'deletion', label: 'Silme' },
  { value: 'marketing_permission', label: 'İzin Yönetimi' },
]

export default function PrivacyScreen() {
  const qc = useQueryClient()
  const [type, setType] = useState(requestTypes[0].value)
  const [message, setMessage] = useState('')

  const requestsQuery = useQuery({
    queryKey: ['privacy-requests'],
    queryFn: privacyService.getRequests,
    retry: 1,
  })

  const createRequest = useMutation({
    mutationFn: () => privacyService.createRequest({ type, message: message.trim() || undefined }),
    onSuccess: () => {
      setMessage('')
      qc.invalidateQueries({ queryKey: ['privacy-requests'] })
      Alert.alert('KVKK', 'Talebiniz alındı.')
    },
    onError: () => {
      Alert.alert('KVKK', 'Talep gönderilemedi. Lütfen tekrar deneyin.')
    },
  })

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

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Yeni talep oluştur</Text>
          <View style={styles.typeGrid}>
            {requestTypes.map(item => (
              <TouchableOpacity
                key={item.value}
                style={[styles.typeChip, type === item.value && styles.typeChipActive]}
                onPress={() => setType(item.value)}
                activeOpacity={0.86}
              >
                <Text style={[styles.typeChipText, type === item.value && styles.typeChipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Talebinizi kısaca yazın"
            placeholderTextColor={Colors.textMuted}
            style={styles.messageInput}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.saveButton, createRequest.isPending && styles.saveButtonDisabled]}
            onPress={() => createRequest.mutate()}
            disabled={createRequest.isPending}
            activeOpacity={0.86}
          >
            {createRequest.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Talebi Gönder</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.requestsCard}>
          <Text style={styles.sectionTitle}>Geçmiş talepler</Text>
          {requestsQuery.isLoading ? (
            <ActivityIndicator color="#f59e0b" />
          ) : requestsQuery.data?.length ? (
            requestsQuery.data.map(request => (
              <View key={request.id} style={styles.requestRow}>
                <View style={styles.requestIcon}>
                  <Ionicons name="document-text-outline" size={17} color="#f59e0b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestTitle}>{requestTypeLabel(request.type)}</Text>
                  <Text style={styles.requestMeta}>
                    {request.status ? statusLabel(request.status) : 'İşleme alındı'}
                    {request.createdAt ? ` · ${new Date(request.createdAt).toLocaleDateString('tr-TR')}` : ''}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Henüz KVKK talebiniz bulunmuyor.
            </Text>
          )}
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

function requestTypeLabel(value: string) {
  return requestTypes.find(item => item.value === value)?.label ?? value
}

function statusLabel(status: string) {
  if (status === 'pending') return 'Bekliyor'
  if (status === 'in_review') return 'İnceleniyor'
  if (status === 'completed') return 'Tamamlandı'
  if (status === 'rejected') return 'Reddedildi'
  return status
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
  formCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  typeChip: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 9, backgroundColor: '#fff' },
  typeChipActive: { borderColor: '#f59e0b', backgroundColor: '#fffbeb' },
  typeChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  typeChipTextActive: { color: '#92400e' },
  messageInput: { minHeight: 110, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, color: Colors.text, backgroundColor: '#fff', fontSize: FontSize.base },
  saveButton: { minHeight: 48, borderRadius: Radius.md, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md },
  saveButtonDisabled: { opacity: 0.55 },
  saveButtonText: { color: '#fff', fontSize: FontSize.base, fontWeight: FontWeight.bold },
  requestsCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg },
  requestRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  requestIcon: { width: 34, height: 34, borderRadius: Radius.md, backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center' },
  requestTitle: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.bold },
  requestMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  contractCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg },
  codeText: { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
})

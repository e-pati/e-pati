import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { labResultsService } from '@/services/lab-results.service'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

const COMMON_TESTS = [
  'Tam Kan Sayımı', 'Biyokimya Paneli', 'İdrar Tahlili',
  'Röntgen', 'Ultrason', 'PCR Test', 'Allerji Testi',
]

interface Props {
  petId: string
  visible: boolean
  onClose: () => void
}

export function AddLabResultModal({ petId, visible, onClose }: Props) {
  const qc = useQueryClient()
  const [testType, setTestType] = useState('')
  const [comment, setComment] = useState('')

  const mutation = useMutation({
    mutationFn: () => labResultsService.create({ petId, testType, comment: comment || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-results', { petId }] })
      Alert.alert('Başarılı', 'Lab sonucu kaydedildi.')
      setTestType(''); setComment('')
      onClose()
    },
    onError: () => Alert.alert('Hata', 'Lab sonucu kaydedilemedi.'),
  })

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Lab Sonucu Ekle</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            <Text style={styles.label}>Sık Kullanılan Test Türleri</Text>
            <View style={styles.quickRow}>
              {COMMON_TESTS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.quickBtn, testType === t && styles.quickBtnActive]}
                  onPress={() => setTestType(t)}
                >
                  <Text style={[styles.quickBtnText, testType === t && styles.quickBtnTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Test Türü *</Text>
            <TextInput
              style={styles.input}
              value={testType}
              onChangeText={setTestType}
              placeholder="örn. Tam Kan Sayımı"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Yorum / Değerlendirme</Text>
            <TextInput
              style={[styles.input, { height: 96, textAlignVertical: 'top', paddingTop: Spacing.md }]}
              value={comment}
              onChangeText={setComment}
              placeholder="Test sonucunun kısa yorumu..."
              placeholderTextColor={Colors.textMuted}
              multiline
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, (!testType.trim() || mutation.isPending) && styles.saveBtnDisabled]}
              onPress={() => mutation.mutate()}
              disabled={!testType.trim() || mutation.isPending}
            >
              {mutation.isPending
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.saveText}>Kaydet</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  card: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  closeText: { fontSize: 18, color: Colors.textMuted },
  body: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  quickBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  quickBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  quickBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  quickBtnTextActive: { color: Colors.primary, fontWeight: FontWeight.medium },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: 6, marginTop: Spacing.md },
  input: {
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: FontSize.base, color: Colors.text,
  },
  footer: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  cancelBtn: {
    flex: 1, height: 48, borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { fontSize: FontSize.base, color: Colors.textSecondary },
  saveBtn: { flex: 1, height: 48, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },
})

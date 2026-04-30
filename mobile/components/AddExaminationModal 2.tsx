import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { examinationsService } from '@/services/examinations.service'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

interface Props {
  petId: string
  visible: boolean
  onClose: () => void
}

const SOAP_FIELDS = [
  {
    key: 'complaint' as const,
    label: 'S — Şikayet',
    placeholder: 'Sahip tarafından bildirilen belirtiler...',
    required: true,
  },
  {
    key: 'findings' as const,
    label: 'O — Bulgular',
    placeholder: 'Fiziksel muayene bulguları, vital değerler...',
    required: true,
  },
  {
    key: 'assessment' as const,
    label: 'A — Değerlendirme',
    placeholder: 'Tanı ve ayırıcı tanılar...',
    required: true,
  },
  {
    key: 'plan' as const,
    label: 'P — Tedavi Planı',
    placeholder: 'Tedavi, reçete, takip talimatları...',
    required: true,
  },
]

type SoapData = {
  complaint: string
  findings: string
  assessment: string
  plan: string
  followUpDate: string
}

export function AddExaminationModal({ petId, visible, onClose }: Props) {
  const qc = useQueryClient()
  const [form, setForm] = useState<SoapData>({
    complaint: '', findings: '', assessment: '', plan: '', followUpDate: '',
  })

  const mutation = useMutation({
    mutationFn: () => examinationsService.create({
      petId,
      complaint: form.complaint,
      findings: form.findings,
      assessment: form.assessment,
      plan: form.plan,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['examinations', { petId }] })
      Alert.alert('Başarılı', 'Muayene kaydedildi.')
      setForm({ complaint: '', findings: '', assessment: '', plan: '', followUpDate: '' })
      onClose()
    },
    onError: () => Alert.alert('Hata', 'Muayene kaydedilemedi.'),
  })

  const isValid = form.complaint.trim().length >= 5 &&
    form.findings.trim().length >= 5 &&
    form.assessment.trim().length >= 5 &&
    form.plan.trim().length >= 5

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Yeni Muayene</Text>
              <Text style={styles.subtitle}>SOAP Formatı</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {SOAP_FIELDS.map(field => (
              <View key={field.key} style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{field.label}</Text>
                  {field.required && <Text style={styles.required}>*</Text>}
                </View>
                <TextInput
                  style={[
                    styles.textarea,
                    form[field.key].length > 0 && styles.textareaFilled,
                  ]}
                  value={form[field.key]}
                  onChangeText={v => setForm(prev => ({ ...prev, [field.key]: v }))}
                  placeholder={field.placeholder}
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            ))}

            <View style={styles.field}>
              <Text style={styles.label}>Takip Tarihi (Opsiyonel)</Text>
              <TextInput
                style={styles.input}
                value={form.followUpDate}
                onChangeText={v => setForm(prev => ({ ...prev, followUpDate: v }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, (!isValid || mutation.isPending) && styles.saveBtnDisabled]}
              onPress={() => mutation.mutate()}
              disabled={!isValid || mutation.isPending}
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
  card: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  closeText: { fontSize: 18, color: Colors.textMuted, paddingTop: 4 },
  body: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  field: { marginBottom: Spacing.lg },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  required: { fontSize: FontSize.sm, color: Colors.danger },
  textarea: {
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: FontSize.sm, color: Colors.text, minHeight: 88,
    textAlignVertical: 'top',
  },
  textareaFilled: { borderColor: Colors.primary + '60', backgroundColor: Colors.primaryBg + '40' },
  input: {
    height: 44, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, fontSize: FontSize.sm, color: Colors.text,
  },
  footer: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  cancelBtn: { flex: 1, height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: FontSize.base, color: Colors.textSecondary },
  saveBtn: { flex: 1, height: 48, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },
})

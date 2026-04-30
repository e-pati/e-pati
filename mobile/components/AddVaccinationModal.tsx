import { haptic } from '@/lib/haptics'
import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vaccinationsService } from '@/services/vaccinations.service'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

const COMMON_VACCINES = [
  'Kuduz', 'Karma (FVRCP)', 'Karma (DHPPiL)', 'Lösemi (FeLV)',
  'Bordetella', 'Leptospira',
]

interface Props {
  petId: string
  visible: boolean
  onClose: () => void
}

export function AddVaccinationModal({ petId, visible, onClose }: Props) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [appliedAt, setAppliedAt] = useState(new Date().toISOString().split('T')[0])
  const [dueAt, setDueAt] = useState('')
  const [lotNumber, setLotNumber] = useState('')
  const [notes, setNotes] = useState('')

  const mutation = useMutation({
    mutationFn: () => vaccinationsService.create({
      petId,
      name,
      appliedAt: new Date(appliedAt).toISOString(),
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      lotNumber: lotNumber || undefined,
      notes: notes || undefined,
    }),
    onSuccess: () => {
      haptic.success()
      qc.invalidateQueries({ queryKey: ['vaccinations', { petId }] })
      Alert.alert('Başarılı', 'Aşı kaydedildi.')
      resetAndClose()
    },
    onError: () => { haptic.error(); Alert.alert('Hata', 'Aşı kaydedilemedi.') },
  })

  const resetAndClose = () => {
    setName(''); setAppliedAt(new Date().toISOString().split('T')[0])
    setDueAt(''); setLotNumber(''); setNotes('')
    onClose()
  }

  const isValid = name.trim().length >= 2 && appliedAt

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Aşı Ekle</Text>
            <TouchableOpacity onPress={resetAndClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            {/* Hızlı seçim */}
            <Text style={styles.label}>Sık Kullanılan Aşılar</Text>
            <View style={styles.quickRow}>
              {COMMON_VACCINES.map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.quickBtn, name === v && styles.quickBtnActive]}
                  onPress={() => setName(v)}
                >
                  <Text style={[styles.quickBtnText, name === v && styles.quickBtnTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Aşı Adı *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="örn. Kuduz"
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Uygulama Tarihi *</Text>
                <TextInput
                  style={styles.input}
                  value={appliedAt}
                  onChangeText={setAppliedAt}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Sonraki Doz</Text>
                <TextInput
                  style={styles.input}
                  value={dueAt}
                  onChangeText={setDueAt}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            <Text style={styles.label}>Lot / Seri No</Text>
            <TextInput
              style={[styles.input, { fontFamily: 'monospace' }]}
              value={lotNumber}
              onChangeText={setLotNumber}
              placeholder="LOT-2026-..."
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Notlar</Text>
            <TextInput
              style={[styles.input, { height: 72, textAlignVertical: 'top', paddingTop: Spacing.md }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Üretici, yan etki vb."
              placeholderTextColor={Colors.textMuted}
              multiline
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={resetAndClose}>
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
  card: {
    backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%',
  },
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
    backgroundColor: Colors.background,
  },
  quickBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  quickBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  quickBtnTextActive: { color: Colors.primary, fontWeight: FontWeight.medium },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: 6, marginTop: Spacing.md },
  input: {
    height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, fontSize: FontSize.base, color: Colors.text,
  },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  footer: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  cancelBtn: {
    flex: 1, height: 48, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { fontSize: FontSize.base, color: Colors.textSecondary },
  saveBtn: { flex: 1, height: 48, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },
})

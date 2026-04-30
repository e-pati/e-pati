import { haptic } from '@/lib/haptics'
import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, ActivityIndicator,
} from 'react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { prescriptionsService } from '@/services/prescriptions.service'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

interface Medication {
  name: string
  dose: string
  frequency: string
  duration: string
  instructions: string
}

const COMMON_DRUGS = ['Amoksisilin', 'Metronidazol', 'Doksisiklin', 'Prednizolon', 'Meloksikam']
const FREQ_OPTIONS = ['1x1', '2x1', '3x1', 'Sabah-akşam', 'Günaşırı']
const DUR_OPTIONS = ['3 gün', '5 gün', '7 gün', '10 gün', '14 gün']

const emptyMed = (): Medication => ({ name: '', dose: '', frequency: '', duration: '', instructions: '' })

interface Props {
  petId: string
  visible: boolean
  onClose: () => void
}

export function AddPrescriptionModal({ petId, visible, onClose }: Props) {
  const qc = useQueryClient()
  const [medications, setMedications] = useState<Medication[]>([emptyMed()])
  const [notes, setNotes] = useState('')
  const [activeMedIndex, setActiveMedIndex] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const mutation = useMutation({
    mutationFn: () => prescriptionsService.create({
      petId,
      medications: medications.filter(m => m.name.trim()),
      notes: notes || undefined,
    }),
    onSuccess: () => {
      haptic.success()
      qc.invalidateQueries({ queryKey: ['prescriptions', { petId }] })
      setMedications([emptyMed()]); setNotes(''); setActiveMedIndex(0); setErrorMsg('')
      onClose()
    },
    onError: () => { haptic.error(); setErrorMsg('Reçete kaydedilemedi. Tekrar deneyin.') },
  })

  const updateMed = (index: number, field: keyof Medication, value: string) => {
    setMedications(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const addMed = () => {
    setMedications(prev => [...prev, emptyMed()])
    setActiveMedIndex(medications.length)
  }

  const removeMed = (index: number) => {
    if (medications.length === 1) return
    setMedications(prev => prev.filter((_, i) => i !== index))
    setActiveMedIndex(Math.max(0, index - 1))
  }

  const isValid = medications.some(m => m.name.trim() && m.dose.trim() && m.frequency.trim() && m.duration.trim())
  const med = medications[activeMedIndex] ?? emptyMed()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Reçete Yaz</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* İlaç sekmeleri */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              <View style={styles.medTabs}>
                {medications.map((m, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.medTab, activeMedIndex === i && styles.medTabActive]}
                    onPress={() => setActiveMedIndex(i)}
                  >
                    <Text style={[styles.medTabText, activeMedIndex === i && styles.medTabTextActive]}>
                      {m.name || `İlaç ${i + 1}`}
                    </Text>
                    {medications.length > 1 && (
                      <TouchableOpacity onPress={() => removeMed(i)} style={styles.removeBtn}>
                        <Text style={styles.removeBtnText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.addMedBtn} onPress={addMed}>
                  <Text style={styles.addMedBtnText}>+ Ekle</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Hızlı seçim */}
            <Text style={styles.label}>Sık Kullanılan İlaçlar</Text>
            <View style={styles.quickRow}>
              {COMMON_DRUGS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.quickBtn, med.name === d && styles.quickBtnActive]}
                  onPress={() => updateMed(activeMedIndex, 'name', d)}
                >
                  <Text style={[styles.quickBtnText, med.name === d && styles.quickBtnTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>İlaç Adı *</Text>
            <TextInput
              style={styles.input}
              value={med.name}
              onChangeText={v => updateMed(activeMedIndex, 'name', v)}
              placeholder="İlaç adı"
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.row}>
              <View style={styles.third}>
                <Text style={styles.label}>Doz *</Text>
                <TextInput
                  style={styles.input}
                  value={med.dose}
                  onChangeText={v => updateMed(activeMedIndex, 'dose', v)}
                  placeholder="50mg"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.third}>
                <Text style={styles.label}>Sıklık *</Text>
                <TextInput
                  style={styles.input}
                  value={med.frequency}
                  onChangeText={v => updateMed(activeMedIndex, 'frequency', v)}
                  placeholder="2x1"
                  placeholderTextColor={Colors.textMuted}
                />
                <View style={styles.miniRow}>
                  {FREQ_OPTIONS.slice(0, 3).map(f => (
                    <TouchableOpacity key={f} style={styles.miniBtn} onPress={() => updateMed(activeMedIndex, 'frequency', f)}>
                      <Text style={styles.miniBtnText}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.third}>
                <Text style={styles.label}>Süre *</Text>
                <TextInput
                  style={styles.input}
                  value={med.duration}
                  onChangeText={v => updateMed(activeMedIndex, 'duration', v)}
                  placeholder="7 gün"
                  placeholderTextColor={Colors.textMuted}
                />
                <View style={styles.miniRow}>
                  {DUR_OPTIONS.slice(0, 3).map(d => (
                    <TouchableOpacity key={d} style={styles.miniBtn} onPress={() => updateMed(activeMedIndex, 'duration', d)}>
                      <Text style={styles.miniBtnText}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.label}>Özel Talimat</Text>
            <TextInput
              style={styles.input}
              value={med.instructions}
              onChangeText={v => updateMed(activeMedIndex, 'instructions', v)}
              placeholder="Yemekle birlikte vb."
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Reçete Notu</Text>
            <TextInput
              style={[styles.input, { height: 72, textAlignVertical: 'top', paddingTop: Spacing.md }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Genel talimat..."
              placeholderTextColor={Colors.textMuted}
              multiline
            />
          </ScrollView>

          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  closeText: { fontSize: 18, color: Colors.textMuted },
  body: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  medTabs: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  medTab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  medTabActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  medTabText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  medTabTextActive: { color: Colors.primary, fontWeight: FontWeight.medium },
  removeBtn: { marginLeft: 2 },
  removeBtnText: { fontSize: 14, color: Colors.textMuted, lineHeight: 16 },
  addMedBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  addMedBtnText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  quickBtn: { paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  quickBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  quickBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  quickBtnTextActive: { color: Colors.primary, fontWeight: FontWeight.medium },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: 4, marginTop: Spacing.md },
  input: {
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    fontSize: FontSize.sm, color: Colors.text,
  },
  row: { flexDirection: 'row', gap: 8 },
  third: { flex: 1 },
  miniRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  miniBtn: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: Colors.border },
  miniBtnText: { fontSize: 9, color: Colors.textMuted },
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
  errorText: { color: '#DC2626', fontSize: FontSize.sm, textAlign: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
})

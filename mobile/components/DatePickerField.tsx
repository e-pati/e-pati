import { useState, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Colors, Radius, Spacing, FontSize, FontWeight } from '@/constants/theme'

interface Props {
  value?: string
  onChange: (date: string | undefined) => void
  label?: string
  placeholder?: string
}

function formatTurkish(dateStr: string): string {
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${day} ${months[month - 1]} ${year}`
}

export function DatePickerField({ value, onChange, placeholder = 'Tarih seçin' }: Props) {
  const [showPicker, setShowPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const today = new Date().toISOString().split('T')[0]

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity
        style={[styles.field, value && styles.fieldFilled]}
        onPress={() => inputRef.current?.showPicker?.()}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>📅</Text>
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value ? formatTurkish(value) : placeholder}
        </Text>
        <input
          ref={inputRef}
          type="date"
          value={value ?? ''}
          max={today}
          onChange={e => onChange(e.target.value || undefined)}
          style={{
            position: 'absolute', opacity: 0, width: '100%', height: '100%',
            top: 0, left: 0, cursor: 'pointer', border: 'none',
          } as any}
        />
      </TouchableOpacity>
    )
  }

  return (
    <View>
      <TouchableOpacity
        style={[styles.field, value && styles.fieldFilled]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>📅</Text>
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value ? formatTurkish(value) : placeholder}
        </Text>
        {value && (
          <TouchableOpacity onPress={() => onChange(undefined)} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          locale="tr-TR"
          onChange={(_, date) => {
            setShowPicker(false)
            if (date) onChange(date.toISOString().split('T')[0])
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    height: 52, borderRadius: Radius.md, borderWidth: 1.5,
    borderColor: Colors.border, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background, flexDirection: 'row',
    alignItems: 'center', gap: Spacing.sm,
  },
  fieldFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  icon: { fontSize: 18 },
  valueText: { flex: 1, fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.medium },
  placeholderText: { flex: 1, fontSize: FontSize.base, color: Colors.textMuted },
  clearBtn: { padding: 4 },
  clearText: { fontSize: FontSize.sm, color: Colors.textMuted },
})

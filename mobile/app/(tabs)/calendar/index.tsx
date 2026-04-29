import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native'
import { mockVaccinations, mockPets } from '@/lib/mock-data'
import { formatDateShort, speciesEmoji, isVaccinationOverdue, isVaccinationDueSoon } from '@/lib/utils'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

type FilterType = 'all' | 'upcoming' | 'overdue'

export default function CalendarScreen() {
  const [filter, setFilter] = useState<FilterType>('all')

  const allVaccines = mockVaccinations.map(v => ({
    ...v,
    pet: mockPets.find(p => p.id === v.petId),
    overdue: isVaccinationOverdue(v.nextDate),
    soon: isVaccinationDueSoon(v.nextDate, 30),
  })).sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())

  const filtered = allVaccines.filter(v => {
    if (filter === 'upcoming') return v.soon && !v.overdue
    if (filter === 'overdue') return v.overdue
    return true
  })

  const overdueCount = allVaccines.filter(v => v.overdue).length
  const upcomingCount = allVaccines.filter(v => v.soon && !v.overdue).length

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Takvim</Text>
        <Text style={styles.subtitle}>Aşı ve kontrol takibi</Text>
      </View>

      {/* Özet kartları */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: Colors.danger + '40', backgroundColor: Colors.danger + '10' }]}>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>{overdueCount}</Text>
          <Text style={styles.summaryLabel}>Gecikmiş Aşı</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: Colors.warning + '40', backgroundColor: Colors.warning + '10' }]}>
          <Text style={[styles.summaryValue, { color: Colors.warning }]}>{upcomingCount}</Text>
          <Text style={styles.summaryLabel}>Yaklaşan (30 gün)</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: Colors.primaryBorder, backgroundColor: Colors.primaryBg }]}>
          <Text style={[styles.summaryValue, { color: Colors.primary }]}>{allVaccines.length}</Text>
          <Text style={styles.summaryLabel}>Toplam Aşı</Text>
        </View>
      </View>

      {/* Filtreler */}
      <View style={styles.filters}>
        {([
          { key: 'all', label: 'Tümü' },
          { key: 'overdue', label: `Gecikmiş (${overdueCount})` },
          { key: 'upcoming', label: `Yaklaşan (${upcomingCount})` },
        ] as const).map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyText}>Tüm aşılar güncel!</Text>
          </View>
        ) : (
          filtered.map(item => (
            <View key={item.id} style={[styles.item, item.overdue && styles.itemOverdue, item.soon && !item.overdue && styles.itemSoon]}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemEmoji}>{speciesEmoji(item.pet?.species ?? 'other')}</Text>
              </View>
              <View style={styles.itemCenter}>
                <Text style={styles.itemPet}>{item.pet?.name}</Text>
                <Text style={styles.itemVaccine}>{item.vaccineName}</Text>
                {item.manufacturer && <Text style={styles.itemManufacturer}>{item.manufacturer}</Text>}
              </View>
              <View style={styles.itemRight}>
                <Text style={[
                  styles.itemDate,
                  item.overdue && { color: Colors.danger },
                  item.soon && !item.overdue && { color: Colors.warning },
                ]}>
                  {formatDateShort(item.nextDate)}
                </Text>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: item.overdue ? Colors.danger : item.soon ? Colors.warning : Colors.primary },
                ]} />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: 10, marginBottom: Spacing.lg },
  summaryCard: {
    flex: 1, borderRadius: Radius.lg, padding: Spacing.md,
    alignItems: 'center', borderWidth: 1,
  },
  summaryValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  filters: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: 8, marginBottom: Spacing.lg },
  filterBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 24, gap: 10 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  itemOverdue: { borderColor: Colors.danger + '40', backgroundColor: Colors.danger + '05' },
  itemSoon: { borderColor: Colors.warning + '40', backgroundColor: Colors.warning + '05' },
  itemLeft: {},
  itemEmoji: { fontSize: 28 },
  itemCenter: { flex: 1 },
  itemPet: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  itemVaccine: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  itemManufacturer: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  itemRight: { alignItems: 'flex-end', gap: 6 },
  itemDate: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.lg },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted },
})

import { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, SafeAreaView,
} from 'react-native'
import { router } from 'expo-router'
import { mockPets } from '@/lib/mock-data'
import { speciesEmoji, speciesLabel, calculateAge } from '@/lib/utils'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'
import type { Pet } from '@/types'

export default function PetsScreen() {
  const [query, setQuery] = useState('')

  const filtered = mockPets.filter(pet =>
    !query || pet.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba 👋</Text>
          <Text style={styles.title}>Hayvanlarım</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { }}>
          <Text style={styles.addBtnText}>+ Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Arama */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Hayvan ara..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Liste */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PetCard pet={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyText}>Henüz kayıtlı hayvan yok</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

function PetCard({ pet }: { pet: Pet }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tabs)/pets/${pet.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{speciesEmoji(pet.species)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>{pet.breed}</Text>
          <Text style={styles.petAge}>{calculateAge(pet.birthDate)}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <View style={styles.speciesBadge}>
          <Text style={styles.speciesBadgeText}>{speciesLabel(pet.species)}</Text>
        </View>
        {pet.weight && (
          <Text style={styles.weight}>{pet.weight} kg</Text>
        )}
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  greeting: { fontSize: FontSize.sm, color: Colors.textMuted },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
    backgroundColor: Colors.background, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, height: 44,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    padding: Spacing.lg, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  avatar: {
    width: 56, height: 56, borderRadius: Radius.lg,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 28 },
  cardInfo: { flex: 1 },
  petName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
  petBreed: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  petAge: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  speciesBadge: {
    backgroundColor: Colors.primaryBg, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  speciesBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  weight: { fontSize: FontSize.xs, color: Colors.textMuted },
  arrow: { fontSize: 20, color: Colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.lg },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted },
})

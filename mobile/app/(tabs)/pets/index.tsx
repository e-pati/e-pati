import { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { petsService, type ApiPet } from '@/services/pets.service'
import { mockPets } from '@/lib/mock-data'
import { speciesEmoji, speciesLabel, calculateAge } from '@/lib/utils'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

export default function PetsScreen() {
  const [query, setQuery] = useState('')

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['pets'],
    queryFn: petsService.getAll,
    retry: 1,
  })

  // API yoksa mock fallback
  const rawPets = data ?? mockPets.map(p => ({
    id: p.id,
    ownerId: p.ownerId,
    name: p.name,
    species: p.species,
    breed: p.breed,
    sex: p.gender,
    birthDate: p.birthDate,
    microchipNo: p.microchipNo,
    createdAt: new Date().toISOString(),
  } as ApiPet))

  const filtered = rawPets.filter(pet =>
    !query || pet.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba 👋</Text>
          <Text style={styles.title}>Hayvanlarım</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(tabs)/pets/new')}>
          <Text style={styles.addBtnText}>+ Ekle</Text>
        </TouchableOpacity>
      </View>

      {isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ API bağlantısı kurulamadı — örnek veriler gösteriliyor</Text>
        </View>
      )}

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

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
          }
          renderItem={({ item }) => <PetCard pet={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🐾</Text>
              <Text style={styles.emptyTitle}>
                {query ? 'Sonuç bulunamadı' : 'Henüz hayvan eklenmedi'}
              </Text>
              {!query && (
                <>
                  <Text style={styles.emptyText}>
                    Evcil dostunuzun sağlık geçmişini takip etmek için ilk hayvanınızı ekleyin.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyBtn}
                    onPress={() => router.push('/(tabs)/pets/new')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.emptyBtnText}>+ İlk Hayvanımı Ekle</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

function PetCard({ pet }: { pet: ApiPet }) {
  const species = pet.species.toLowerCase() as any
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tabs)/pets/${pet.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{speciesEmoji(species)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>{pet.breed ?? '—'}</Text>
          {pet.birthDate && <Text style={styles.petAge}>{calculateAge(pet.birthDate)}</Text>}
        </View>
      </View>
      <View style={styles.cardRight}>
        <View style={styles.speciesBadge}>
          <Text style={styles.speciesBadgeText}>{speciesLabel(species)}</Text>
        </View>
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
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' },
  errorBanner: {
    marginHorizontal: Spacing.xl, marginBottom: Spacing.md,
    backgroundColor: '#fef3cd', borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: '#fde68a',
  },
  errorText: { fontSize: FontSize.xs, color: '#92400e' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
    backgroundColor: Colors.background, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, height: 44,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { fontSize: FontSize.sm, color: Colors.textMuted },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  avatar: { width: 56, height: 56, borderRadius: Radius.lg, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 28 },
  cardInfo: { flex: 1 },
  petName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
  petBreed: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  petAge: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  speciesBadge: { backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  speciesBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  arrow: { fontSize: 20, color: Colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xxxl },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.lg },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  emptyBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md,
  },
  emptyBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },
})

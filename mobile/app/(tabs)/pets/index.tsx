import { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, SafeAreaView, ActivityIndicator, RefreshControl,
  Image, ScrollView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { haptic } from '@/lib/haptics'
import { useQuery } from '@tanstack/react-query'
import { petsService, type ApiPet } from '@/services/pets.service'
import { useAuthStore } from '@/stores/auth.store'
import { speciesEmoji, speciesLabel, calculateAge } from '@/lib/utils'
import { Colors, Spacing, Radius, FontSize, FontWeight, Fonts } from '@/constants/theme'
import { DEMO_PET_ID, demoCattleProfile, demoPetProfile } from '@/lib/mobile-demo-data'
import type { PetSpecies } from '@/types'

const SPECIES_FILTERS = [
  { key: 'all', label: 'Tümü', emoji: '🐾' },
  { key: 'cat', label: 'Kedi', emoji: '🐈' },
  { key: 'dog', label: 'Köpek', emoji: '🐕' },
  { key: 'bird', label: 'Kuş', emoji: '🐦' },
  { key: 'rabbit', label: 'Tavşan', emoji: '🐇' },
]

export default function PetsScreen() {
  const [query, setQuery] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const user = useAuthStore(s => s.user)

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['pets'],
    queryFn: petsService.getAll,
    retry: 1,
  })

  const rawPets: ApiPet[] = data ?? []

  const filtered = rawPets.filter(pet => {
    const matchQuery = !query || pet.name.toLowerCase().includes(query.toLowerCase())
    const matchSpecies = speciesFilter === 'all' || pet.species.toLowerCase() === speciesFilter
    return matchQuery && matchSpecies
  })

  const firstName = user?.fullName?.split(' ')[0] ?? 'Merhaba'

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Merhaba, {firstName} 👋</Text>
            <Text style={styles.headerTitle}>Hayvanlarım</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => { haptic.light(); router.push('/(tabs)/pets/new') }}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnText}>+ Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Dairesel avatar strip */}
        {rawPets.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarStrip}
          >
            {rawPets.map(pet => (
              <TouchableOpacity
                key={pet.id}
                style={styles.avatarBubble}
                onPress={() => { haptic.light(); router.push(`/(tabs)/pets/${pet.id}`) }}
                activeOpacity={0.8}
              >
                <View style={styles.avatarCircle}>
                  {pet.photoUrl
                    ? <Image source={{ uri: pet.photoUrl }} style={styles.avatarImg} />
                    : <Text style={styles.avatarBubbleEmoji}>{speciesEmoji(pet.species.toLowerCase() as PetSpecies)}</Text>
                  }
                </View>
                <Text style={styles.avatarBubbleName} numberOfLines={1}>{pet.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Arama + Filtreler */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Hayvan ara..."
            placeholderTextColor={Colors.textMuted}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: Colors.textMuted, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {SPECIES_FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterPill, speciesFilter === f.key && styles.filterPillActive]}
              onPress={() => setSpeciesFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterEmoji}>{f.emoji}</Text>
              <Text style={[styles.filterLabel, speciesFilter === f.key && styles.filterLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <DemoProfiles />

      {isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>API bağlantısı kurulamadı. Lütfen tekrar deneyin.</Text>
        </View>
      )}

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
                {query || speciesFilter !== 'all' ? 'Sonuç bulunamadı' : 'Henüz hayvan eklenmedi'}
              </Text>
              {!query && speciesFilter === 'all' && (
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

function DemoProfiles() {
  const profiles = [
    {
      id: DEMO_PET_ID,
      eyebrow: 'Vatandaş görünümü',
      name: demoPetProfile.pet.name,
      detail: `${demoPetProfile.pet.breed} · Aşı kartı`,
      emoji: '🐈',
      color: Colors.primary,
      background: Colors.primaryBg,
      onPress: () => router.push(`/(tabs)/pets/${DEMO_PET_ID}`),
    },
    {
      id: demoCattleProfile.id,
      eyebrow: 'Üretici görünümü',
      name: demoCattleProfile.name,
      detail: `${demoCattleProfile.breed} · Küpe kaydı`,
      emoji: '🐄',
      color: '#A16207',
      background: '#FFFBEB',
      onPress: () => router.push('/(tabs)/pets/producer-demo'),
    },
  ]

  return (
    <View style={styles.demoSection}>
      <View style={styles.demoHeadingRow}>
        <View>
          <Text style={styles.demoEyebrow}>SUNUM AKIŞI</Text>
          <Text style={styles.demoTitle}>Demo Profilleri</Text>
        </View>
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>Sentetik veri</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.demoProfileRow}
      >
        {profiles.map(profile => (
          <TouchableOpacity
            key={profile.id}
            style={[styles.demoProfileCard, { backgroundColor: profile.background }]}
            onPress={() => { haptic.light(); profile.onPress() }}
            activeOpacity={0.86}
          >
            <View style={[styles.demoProfileIcon, { borderColor: profile.color + '33' }]}>
              <Text style={styles.demoProfileEmoji}>{profile.emoji}</Text>
            </View>
            <Text style={[styles.demoProfileEyebrow, { color: profile.color }]}>
              {profile.eyebrow}
            </Text>
            <Text style={styles.demoProfileName}>{profile.name}</Text>
            <Text style={styles.demoProfileDetail}>{profile.detail}</Text>
            <Text style={[styles.demoProfileAction, { color: profile.color }]}>Profili aç →</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

function PetCard({ pet }: { pet: ApiPet }) {
  const species = pet.species.toLowerCase() as PetSpecies
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => { haptic.light(); router.push(`/(tabs)/pets/${pet.id}`) }}
      activeOpacity={0.88}
    >
      <View style={styles.cardAccent} />
      <View style={styles.cardAvatar}>
        {pet.photoUrl
          ? <Image source={{ uri: pet.photoUrl }} style={styles.cardAvatarImg} />
          : <Text style={styles.cardAvatarEmoji}>{speciesEmoji(species)}</Text>
        }
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.petName}>{pet.name}</Text>
          <View style={styles.speciesBadge}>
            <Text style={styles.speciesBadgeText}>{speciesLabel(species)}</Text>
          </View>
        </View>
        <Text style={styles.petBreed}>{pet.breed ?? '—'}</Text>
        {pet.birthDate && (
          <View style={styles.agePill}>
            <Text style={styles.agePillText}>🎂 {calculateAge(pet.birthDate)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },

  // Header
  header: {
    backgroundColor: Colors.primaryDark,
    paddingTop: Platform.OS === 'android' ? Spacing.xl : 0,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  greeting: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' },

  // Avatar strip
  avatarStrip: { paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  avatarBubble: { alignItems: 'center', width: 64 },
  avatarCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    marginBottom: 5,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarBubbleEmoji: { fontSize: 26 },
  avatarBubbleName: { fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: FontWeight.medium, textAlign: 'center' },

  // Search & filters
  searchSection: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: '#fff', borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, height: 46,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    marginBottom: Spacing.md,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  filterRow: { gap: Spacing.sm, paddingBottom: 2 },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  filterPillActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  filterEmoji: { fontSize: 14 },
  filterLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterLabelActive: { color: Colors.primary },

  // Demo profiles
  demoSection: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: '#F0FDF4',
  },
  demoHeadingRow: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.md,
  },
  demoEyebrow: {
    fontSize: 9, color: Colors.primary, fontWeight: FontWeight.bold,
    letterSpacing: 1.2, marginBottom: 2,
  },
  demoTitle: { fontSize: FontSize.lg, color: Colors.text, fontFamily: Fonts.bold, fontWeight: FontWeight.bold },
  demoBadge: {
    borderRadius: Radius.full, backgroundColor: '#FEF3C7',
    borderWidth: 1, borderColor: '#FCD34D', paddingHorizontal: 9, paddingVertical: 4,
  },
  demoBadgeText: { fontSize: 9, color: '#92400E', fontWeight: FontWeight.semibold },
  demoProfileRow: { paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingBottom: 2 },
  demoProfileCard: {
    width: 184, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(15, 23, 42, 0.06)',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  demoProfileIcon: {
    width: 42, height: 42, borderRadius: Radius.md, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: Spacing.md,
  },
  demoProfileEmoji: { fontSize: 24 },
  demoProfileEyebrow: { fontSize: 9, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.6 },
  demoProfileName: { fontSize: FontSize.lg, color: Colors.text, fontFamily: Fonts.bold, fontWeight: FontWeight.bold, marginTop: 2 },
  demoProfileDetail: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  demoProfileAction: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, marginTop: Spacing.md },

  // Error
  errorBanner: {
    marginHorizontal: Spacing.xl, marginBottom: Spacing.md,
    backgroundColor: '#fef3cd', borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: '#fde68a',
  },
  errorText: { fontSize: FontSize.xs, color: '#92400e' },

  // List
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { fontSize: FontSize.sm, color: Colors.textMuted },
  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 24, gap: 12 },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: Radius.xl,
    flexDirection: 'row', alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#059669', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  cardAccent: { width: 5, alignSelf: 'stretch', backgroundColor: Colors.primary },
  cardAvatar: {
    width: 62, height: 62, borderRadius: 16, margin: Spacing.md,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  cardAvatarImg: { width: '100%', height: '100%' },
  cardAvatarEmoji: { fontSize: 30 },
  cardBody: { flex: 1, paddingVertical: Spacing.md },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 3 },
  petName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, fontFamily: Fonts.semibold, color: Colors.text },
  petBreed: { fontSize: FontSize.sm, color: Colors.textSecondary },
  speciesBadge: { backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  speciesBadgeText: { fontSize: 10, color: Colors.primary, fontWeight: FontWeight.semibold },
  agePill: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#F0FDF4', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  agePillText: { fontSize: 11, color: Colors.primaryDark, fontWeight: FontWeight.medium },
  arrow: { fontSize: 22, color: Colors.textMuted, paddingRight: Spacing.md },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xxxl },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.lg },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  emptyBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md },
  emptyBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },
})

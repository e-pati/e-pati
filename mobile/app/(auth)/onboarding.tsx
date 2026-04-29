import { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity,
  Animated, ViewToken,
} from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'

const { width } = Dimensions.get('window')

const slides = [
  {
    id: '1',
    emoji: '🐾',
    title: 'Tüm Sağlık Kayıtları\nTek Ekranda',
    description: 'Evcil hayvanınızın muayene geçmişi, aşı takvimi ve reçeteleri her zaman yanınızda.',
    bg: '#f0fdf6',
    accent: Colors.primary,
  },
  {
    id: '2',
    emoji: '💉',
    title: 'Aşı Takibi\nOtomatik Hatırlatma',
    description: 'Hiçbir aşıyı kaçırmayın. Zamanı geldiğinde size ve evcil hayvanınıza bildirim gönderiyoruz.',
    bg: '#eff6ff',
    accent: '#3b82f6',
  },
  {
    id: '3',
    emoji: '📋',
    title: 'Veteriner Notları\nAnında Telefonunuzda',
    description: 'Muayene biter bitmez doktorunuzun notları telefonunuza gelir. Sözlü açıklamaları unutmazsınız.',
    bg: '#fdf4ff',
    accent: '#a855f7',
  },
]

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const scrollX = useRef(new Animated.Value(0)).current

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setCurrentIndex(viewableItems[0].index ?? 0)
  }).current

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      router.replace('/(auth)/login')
    }
  }

  const current = slides[currentIndex]

  return (
    <View style={[styles.container, { backgroundColor: current.bg }]}>
      <StatusBar style="dark" />

      <TouchableOpacity style={styles.skip} onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.skipText}>Geç</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.bg }]}>
            <View style={[styles.emojiContainer, { backgroundColor: item.accent + '20' }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={[styles.title, { color: item.accent }]}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === currentIndex ? current.accent : Colors.border,
                width: i === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: current.accent }]}
        onPress={handleNext}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? 'Başla' : 'Devam'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: { position: 'absolute', top: 56, right: Spacing.xl, zIndex: 10 },
  skipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingTop: 80,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  emoji: { fontSize: 56 },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: Spacing.lg,
  },
  description: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: Spacing.xxl,
  },
  dot: { height: 8, borderRadius: Radius.full },
  button: {
    marginHorizontal: Spacing.xl,
    marginBottom: 48,
    height: 54,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: '#fff' },
})

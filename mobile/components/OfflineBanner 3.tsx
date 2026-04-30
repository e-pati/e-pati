import { View, Text, StyleSheet, Animated } from 'react-native'
import { useNetwork } from '@/hooks/use-network'
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme'

export function OfflineBanner() {
  const { isOnline } = useNetwork()

  if (isOnline) return null

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>📡 İnternet bağlantısı yok — önbellek gösteriliyor</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#92400e',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  text: {
    fontSize: FontSize.xs,
    color: '#fef3c7',
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
})

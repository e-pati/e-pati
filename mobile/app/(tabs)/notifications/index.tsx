import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native'
import { mockNotifications } from '@/lib/mock-data'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme'
import type { AppNotification } from '@/types'

const typeIcon: Record<AppNotification['type'], string> = {
  examination: '🩺',
  vaccination: '💉',
  prescription: '💊',
  reminder: '⏰',
}

const typeBg: Record<AppNotification['type'], string> = {
  examination: Colors.primary + '15',
  vaccination: '#3b82f615',
  prescription: '#8b5cf615',
  reminder: Colors.warning + '15',
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} dk önce`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} saat önce`
  const days = Math.floor(hours / 24)
  return `${days} gün önce`
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bildirimler</Text>
          {unreadCount > 0 && (
            <Text style={styles.subtitle}>{unreadCount} okunmamış bildirim</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Tümünü Oku</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, !item.isRead && styles.itemUnread]}
            onPress={() => markRead(item.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconBox, { backgroundColor: typeBg[item.type] }]}>
              <Text style={styles.icon}>{typeIcon[item.type]}</Text>
            </View>
            <View style={styles.itemContent}>
              <View style={styles.itemTop}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemTime}>{formatRelative(item.sentAt)}</Text>
              </View>
              <Text style={styles.itemMessage} numberOfLines={2}>{item.message}</Text>
              <Text style={styles.itemPet}>🐾 {item.petName}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyText}>Henüz bildirim yok</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.primary, marginTop: 2 },
  markAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 24, gap: 10 },
  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.background, borderRadius: Radius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  itemUnread: { borderColor: Colors.primaryBorder, backgroundColor: Colors.primaryBg },
  iconBox: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
  itemContent: { flex: 1 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text, flex: 1 },
  itemTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginLeft: Spacing.sm },
  itemMessage: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  itemPet: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 6 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.lg },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted },
})

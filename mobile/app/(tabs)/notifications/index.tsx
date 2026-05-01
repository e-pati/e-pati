import { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService, type ApiNotification } from '@/services/notifications.service'
import { mockNotifications } from '@/lib/mock-data'
import { Colors, Spacing, Radius, FontSize, FontWeight, Fonts } from '@/constants/theme'

const typeIcon: Record<string, string> = {
  examination: '🩺', vaccination: '💉', prescription: '💊', lab: '🔬', reminder: '⏰',
}
const typeColor: Record<string, string> = {
  examination: Colors.primary, vaccination: '#3b82f6', prescription: '#8b5cf6', lab: '#ef4444', reminder: Colors.warning,
}

function formatRelative(dateStr?: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} dk önce`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} saat önce`
  return `${Math.floor(hours / 24)} gün önce`
}

function mapMockNotification(n: (typeof mockNotifications)[number]): ApiNotification {
  return {
    id: n.id,
    type: n.type as 'examination' | 'vaccination' | 'prescription' | 'lab' | 'reminder',
    title: n.title, message: n.message, sentAt: n.sentAt, isRead: n.isRead,
  }
}

export default function NotificationsScreen() {
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'], queryFn: notificationsService.getAll, retry: 1,
  })

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications: ApiNotification[] = data ?? (isError ? mockNotifications.map(mapMockNotification) : [])
  const unreadCount = notifications.filter(n => !n.isRead && !n.readAt).length

  const handleMarkAll = async () => {
    for (const n of notifications.filter(n => !n.isRead && !n.readAt)) markRead.mutate(n.id)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Bildirimler</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tümü okundu'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAll} activeOpacity={0.8}>
              <Text style={styles.markAllText}>Tümünü Oku</Text>
            </TouchableOpacity>
          )}
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadBadgeRow}>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} yeni</Text>
            </View>
          </View>
        )}
      </View>

      {isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ API bağlantısı kurulamadı — örnek veriler gösteriliyor</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
          renderItem={({ item }) => {
            const isRead = item.isRead || !!item.readAt
            const color = typeColor[item.type] ?? Colors.primary
            return (
              <TouchableOpacity
                style={[styles.item, !isRead && styles.itemUnread]}
                onPress={() => {
                  if (!isRead) markRead.mutate(item.id)
                  if (item.petId) router.push(`/(tabs)/pets/${item.petId}`)
                }}
                activeOpacity={0.85}
              >
                {!isRead && <View style={[styles.itemAccent, { backgroundColor: color }]} />}
                <View style={[styles.iconCircle, { backgroundColor: color + '18' }]}>
                  <Text style={styles.icon}>{typeIcon[item.type] ?? '🔔'}</Text>
                </View>
                <View style={styles.itemContent}>
                  <View style={styles.itemTop}>
                    <Text style={[styles.itemTitle, !isRead && styles.itemTitleUnread]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemTime}>{formatRelative(item.sentAt ?? item.createdAt)}</Text>
                  </View>
                  <Text style={styles.itemMessage} numberOfLines={2}>{item.message}</Text>
                </View>
                <View style={styles.rightCol}>
                  {!isRead && <View style={[styles.dot, { backgroundColor: color }]} />}
                  {item.petId && <Text style={styles.chevron}>›</Text>}
                </View>
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyTitle}>Henüz bildirim yok</Text>
              <Text style={styles.emptyText}>Aşı hatırlatmaları ve sağlık güncellemeleri burada görünecek</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: {
    backgroundColor: Colors.primaryDark,
    paddingTop: Platform.OS === 'android' ? Spacing.xl : 0,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: '#fff' },
  headerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  markAllBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  markAllText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.semibold },
  unreadBadgeRow: { paddingHorizontal: Spacing.xl },
  unreadBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 5,
  },
  unreadBadgeText: { fontSize: 11, color: '#fff', fontWeight: FontWeight.semibold },
  errorBanner: {
    marginHorizontal: Spacing.xl, marginTop: Spacing.md,
    backgroundColor: '#fef3cd', borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: '#fde68a',
  },
  errorText: { fontSize: FontSize.xs, color: '#92400e' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: 24, gap: 10 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: '#fff', borderRadius: Radius.xl, overflow: 'hidden',
    shadowColor: '#059669', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    paddingRight: Spacing.md, paddingVertical: Spacing.md,
  },
  itemUnread: { shadowOpacity: 0.12 },
  itemAccent: { width: 4, alignSelf: 'stretch' },
  iconCircle: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.md },
  icon: { fontSize: 22 },
  itemContent: { flex: 1 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  itemTitle: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textSecondary, flex: 1 },
  itemTitleUnread: { fontWeight: FontWeight.semibold, color: Colors.text },
  itemTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginLeft: 8 },
  itemMessage: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 19 },
  rightCol: { alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chevron: { fontSize: 18, color: Colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing.xxxl },
  emptyEmoji: { fontSize: 52, marginBottom: Spacing.lg },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
})

import { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService, type ApiNotification } from '@/services/notifications.service'
import { mockNotifications } from '@/lib/mock-data'
import { Colors, Spacing, Radius, FontSize, FontWeight, Fonts } from '@/constants/theme'

const typeIcon: Record<string, string> = {
  examination: '🩺',
  vaccination: '💉',
  prescription: '💊',
  lab: '🔬',
  reminder: '⏰',
}

const typeBg: Record<string, string> = {
  examination: Colors.primary + '15',
  vaccination: '#3b82f615',
  prescription: '#8b5cf615',
  lab: '#ef444415',
  reminder: Colors.warning + '15',
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
    type: n.type as any,
    title: n.title,
    message: n.message,
    sentAt: n.sentAt,
    isRead: n.isRead,
  }
}

export default function NotificationsScreen() {
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.getAll,
    retry: 1,
  })

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications: ApiNotification[] = data ?? (
    isError ? mockNotifications.map(mapMockNotification) : []
  )

  const unreadCount = notifications.filter(n => !n.isRead && !n.readAt).length

  const handleMarkAll = async () => {
    const unread = notifications.filter(n => !n.isRead && !n.readAt)
    for (const n of unread) {
      markRead.mutate(n.id)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bildirimler</Text>
          {unreadCount > 0 && (
            <Text style={styles.subtitle}>{unreadCount} okunmamış</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAll}>
            <Text style={styles.markAll}>Tümünü Oku</Text>
          </TouchableOpacity>
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
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
          }
          renderItem={({ item }) => {
            const isRead = item.isRead || !!item.readAt
            return (
              <TouchableOpacity
                style={[styles.item, !isRead && styles.itemUnread]}
                onPress={() => {
                  if (!isRead) markRead.mutate(item.id)
                  if (item.petId) router.push(`/(tabs)/pets/${item.petId}`)
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.iconBox, { backgroundColor: typeBg[item.type] ?? typeBg.reminder }]}>
                  <Text style={styles.icon}>{typeIcon[item.type] ?? '🔔'}</Text>
                </View>
                <View style={styles.itemContent}>
                  <View style={styles.itemTop}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.itemTime}>{formatRelative(item.sentAt ?? item.createdAt)}</Text>
                  </View>
                  <Text style={styles.itemMessage} numberOfLines={2}>{item.message}</Text>
                </View>
                <View style={styles.rightCol}>
                  {!isRead && <View style={styles.unreadDot} />}
                  {item.petId && <Text style={styles.chevron}>›</Text>}
                </View>
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyText}>Henüz bildirim yok</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.primary, marginTop: 2 },
  markAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  errorBanner: {
    marginHorizontal: Spacing.xl, marginBottom: Spacing.md,
    backgroundColor: '#fef3cd', borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: '#fde68a',
  },
  errorText: { fontSize: FontSize.xs, color: '#92400e' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  rightCol: { alignItems: 'center', justifyContent: 'center', gap: 4, marginLeft: 4 },
  chevron: { fontSize: 18, color: Colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.lg },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted },
})

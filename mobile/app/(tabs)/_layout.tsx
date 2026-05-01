import { Tabs } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { notificationsService } from '@/services/notifications.service'
import { OfflineBanner } from '@/components/OfflineBanner'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

function TabIcon({ name, focused }: { name: React.ComponentProps<typeof Ionicons>['name']; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Ionicons
        name={name}
        size={22}
        color={focused ? Colors.primary : Colors.textMuted}
      />
    </View>
  )
}

export default function TabLayout() {
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.getAll,
    retry: 1,
    refetchInterval: 60 * 1000,
  })

  const unreadCount = notifications?.filter(n => !n.isRead && !n.readAt).length ?? 0

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="pets"
          options={{
            title: 'Hayvanlarım',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'paw' : 'paw-outline'} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Takvim',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Bildirimler',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'notifications' : 'notifications-outline'} focused={focused} />,
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
            tabBarBadgeStyle: { backgroundColor: Colors.danger, fontSize: 10 },
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
          }}
        />
      </Tabs>
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopColor: '#E8F5EE',
    borderTopWidth: 1,
    height: 82,
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  tabLabel: { fontSize: 10, fontWeight: '600' },
  tabIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: Colors.primaryBg,
  },
})

import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { router } from 'expo-router'
import { notificationsService } from '@/services/notifications.service'

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })
}

export function usePushNotifications() {
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  useEffect(() => {
    if (Platform.OS === 'web') return

    registerToken()

    // Uygulama açıkken bildirime tıklanınca
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as Record<string, unknown>
      if (data?.petId) {
        router.push(`/(tabs)/pets/${data.petId}`)
      } else {
        router.push('/(tabs)/notifications')
      }
    })

    // Uygulama kapalıyken tıklanmış bildirim
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (!response) return
      const data = response.notification.request.content.data as Record<string, unknown>
      if (data?.petId) {
        router.push(`/(tabs)/pets/${data.petId}`)
      }
    })

    return () => {
      responseListener.current?.remove()
    }
  }, [])
}

async function registerToken() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync()
    let finalStatus = existing

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') return

    const token = await Notifications.getExpoPushTokenAsync()

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'VetCep',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#16a34a',
      })
    }

    await notificationsService.registerPushToken(token.data)
  } catch {
    // Push token kayıt sessizce başarısız olabilir
  }
}

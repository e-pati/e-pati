import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { authService } from '@/services/auth.service'
import { Colors } from '@/constants/theme'

export default function Index() {
  const [checking, setChecking] = useState(true)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    authService.isLoggedIn().then(v => {
      setIsAuth(v)
      setChecking(false)
    })
  }, [])

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    )
  }

  return <Redirect href={isAuth ? '/(tabs)/pets' : '/(auth)/onboarding'} />
}

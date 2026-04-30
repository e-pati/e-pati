import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const canUseLocalStorage = () =>
  typeof globalThis !== 'undefined' && 'localStorage' in globalThis

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return canUseLocalStorage() ? globalThis.localStorage.getItem(key) : null
      } catch {
        return null
      }
    }

    return SecureStore.getItemAsync(key)
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (canUseLocalStorage()) globalThis.localStorage.setItem(key, value)
      } catch {}
      return
    }

    await SecureStore.setItemAsync(key, value)
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (canUseLocalStorage()) globalThis.localStorage.removeItem(key)
      } catch {}
      return
    }

    await SecureStore.deleteItemAsync(key)
  },
}

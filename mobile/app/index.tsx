import { Redirect } from 'expo-router'

export default function Index() {
  // TODO: token kontrolü — varsa (tabs)'a, yoksa (auth)'a
  const hasToken = false
  return <Redirect href={hasToken ? '/(tabs)/pets' : '/(auth)/onboarding'} />
}

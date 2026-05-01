import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image,
} from 'react-native'
import { DatePickerField } from '@/components/DatePickerField'
import { useLocalSearchParams, router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { petsService } from '@/services/pets.service'
import { Colors, Spacing, Radius, FontSize, FontWeight, Fonts } from '@/constants/theme'

const schema = z.object({
  name: z.string().min(2, 'En az 2 karakter'),
  breed: z.string().optional(),
  birthDate: z.string().optional(),
  microchipNo: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const SPECIES = [
  { value: 'Cat', label: '🐈 Kedi' },
  { value: 'Dog', label: '🐕 Köpek' },
  { value: 'Bird', label: '🐦 Kuş' },
  { value: 'Rabbit', label: '🐇 Tavşan' },
  { value: 'Other', label: '🐾 Diğer' },
]

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const qc = useQueryClient()
  const [selectedSpecies, setSelectedSpecies] = useState('')
  const [done, setDone] = useState(false)
  const [photoUri, setPhotoUri] = useState<string | null>(null)

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') return
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  const { data: pet, isLoading } = useQuery({
    queryKey: ['pets', id],
    queryFn: () => petsService.getOne(id),
    enabled: !!id,
  })

  const update = useMutation({
    mutationFn: (data: FormData) => petsService.update(id, {
      name: data.name,
      species: selectedSpecies || pet?.species,
      breed: data.breed || undefined,
      birthDate: data.birthDate || undefined,
      microchipNo: data.microchipNo || undefined,
      photoUrl: photoUri ?? pet?.photoUrl ?? undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pets', id] })
      qc.invalidateQueries({ queryKey: ['pets'] })
      setDone(true)
      setTimeout(() => router.back(), 1000)
    },
  })

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: pet?.name ?? '',
      breed: pet?.breed ?? '',
      birthDate: pet?.birthDate ? pet.birthDate.split('T')[0] : '',
      microchipNo: pet?.microchipNo ?? '',
    },
    values: pet ? {
      name: pet.name,
      breed: pet.breed ?? '',
      birthDate: pet.birthDate ? pet.birthDate.split('T')[0] : '',
      microchipNo: pet.microchipNo ?? '',
    } : undefined,
  })

  if (isLoading) return (
    <View style={styles.center}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  )

  if (done) return (
    <View style={styles.center}>
      <Text style={{ fontSize: 48, marginBottom: Spacing.lg }}>✅</Text>
      <Text style={styles.doneText}>Güncellendi!</Text>
    </View>
  )

  const currentSpecies = selectedSpecies || pet?.species || ''

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Hayvan Bilgilerini Düzenle</Text>

        {/* Fotoğraf */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
            {(photoUri || pet?.photoUrl)
              ? <Image source={{ uri: photoUri ?? pet?.photoUrl }} style={styles.photoImage} />
              : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoEmoji}>📷</Text>
                  <Text style={styles.photoText}>Fotoğraf</Text>
                </View>
              )
            }
          </TouchableOpacity>
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
              <Text style={styles.photoBtnText}>📂 Galeriden</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
              <Text style={styles.photoBtnText}>📸 Kamera</Text>
            </TouchableOpacity>
          </View>
        </View>

        {update.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Güncelleme başarısız, tekrar deneyin.</Text>
          </View>
        )}

        <View style={styles.card}>
          {/* Ad */}
          <View style={styles.field}>
            <Text style={styles.label}>Hayvan Adı *</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
            {errors.name && <Text style={styles.fieldError}>{errors.name.message}</Text>}
          </View>

          {/* Tür */}
          <View style={styles.field}>
            <Text style={styles.label}>Tür</Text>
            <View style={styles.speciesGrid}>
              {SPECIES.map(s => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.speciesBtn, currentSpecies === s.value && styles.speciesBtnActive]}
                  onPress={() => setSelectedSpecies(s.value)}
                >
                  <Text style={styles.speciesEmoji}>{s.label.split(' ')[0]}</Text>
                  <Text style={[styles.speciesLabel, currentSpecies === s.value && styles.speciesLabelActive]}>
                    {s.label.split(' ')[1]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cins */}
          <View style={styles.field}>
            <Text style={styles.label}>Cins / Irk</Text>
            <Controller
              control={control}
              name="breed"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="örn. Van Kedisi"
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
          </View>

          {/* Doğum tarihi */}
          <View style={styles.field}>
            <Text style={styles.label}>Doğum Tarihi</Text>
            <Controller
              control={control}
              name="birthDate"
              render={({ field: { onChange, value } }) => (
                <DatePickerField
                  value={value || undefined}
                  onChange={onChange}
                  placeholder="Doğum tarihi seçin"
                />
              )}
            />
          </View>

          {/* Mikro çip */}
          <View style={styles.field}>
            <Text style={styles.label}>Mikro Çip No</Text>
            <Controller
              control={control}
              name="microchipNo"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, { fontFamily: 'monospace' }]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="15 haneli numara"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />
              )}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, update.isPending && styles.buttonDisabled]}
          onPress={handleSubmit(data => update.mutate(data))}
          disabled={update.isPending}
          activeOpacity={0.85}
        >
          {update.isPending
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.buttonText}>Değişiklikleri Kaydet</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: Spacing.xxl },
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.medium },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text, marginBottom: Spacing.xl },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: '#fecaca' },
  errorText: { fontSize: FontSize.sm, color: Colors.danger },
  card: {
    backgroundColor: Colors.background, borderRadius: Radius.xl, padding: Spacing.xxl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    marginBottom: Spacing.xl,
  },
  field: { marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: 6 },
  input: {
    height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, fontSize: FontSize.base, color: Colors.text, backgroundColor: Colors.background,
  },
  inputError: { borderColor: Colors.danger },
  fieldError: { fontSize: FontSize.xs, color: Colors.danger, marginTop: 4 },
  speciesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  speciesBtn: {
    width: '18%', aspectRatio: 1, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center', gap: 3,
  },
  speciesBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  speciesEmoji: { fontSize: 22 },
  speciesLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: FontWeight.medium },
  speciesLabelActive: { color: Colors.primary },
  button: {
    height: 54, borderRadius: Radius.lg, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },
  doneText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, fontFamily: Fonts.bold, color: Colors.text },
  photoSection: { alignItems: 'center', marginBottom: Spacing.xl },
  photoBox: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primaryBg,
    borderWidth: 2, borderColor: Colors.primaryBorder, overflow: 'hidden', marginBottom: Spacing.md,
  },
  photoImage: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoEmoji: { fontSize: 28 },
  photoText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  photoButtons: { flexDirection: 'row', gap: 10 },
  photoBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  photoBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary },
})

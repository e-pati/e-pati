'use client'

import { useState } from 'react'
import Image from 'next/image'
import { speciesEmoji } from '@/lib/utils'
import type { PetSpecies } from '@/types'

interface PatientAvatarProps {
  name: string
  photoUrl?: string
  species: PetSpecies
  size: number
}

export function PatientAvatar({ name, photoUrl, species, size }: PatientAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string>()

  if (!photoUrl || failedUrl === photoUrl) {
    return (
      <span aria-label={`${name} için ${speciesEmoji(species)} simgesi`}>
        {speciesEmoji(species)}
      </span>
    )
  }

  return (
    <Image
      src={photoUrl}
      alt={name}
      width={size}
      height={size}
      className="h-full w-full object-cover"
      unoptimized
      onError={() => setFailedUrl(photoUrl)}
    />
  )
}

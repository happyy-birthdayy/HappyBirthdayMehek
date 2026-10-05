'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import { setSoundEnabled } from '@/lib/effects'
import { BIRTHDAY_NAME } from '@/lib/birthday-config'

type BirthdayContextValue = {
  name: string
  soundOn: boolean
  toggleSound: () => void
}

const BirthdayContext = createContext<BirthdayContextValue | null>(null)

export function BirthdayProvider({ children }: { children: React.ReactNode }) {
  const [soundOn, setSoundOn] = useState(true)

  const value = useMemo(
    () => ({
      name: BIRTHDAY_NAME,
      soundOn,
      toggleSound: () =>
        setSoundOn((prev) => {
          setSoundEnabled(!prev)
          return !prev
        }),
    }),
    [soundOn],
  )

  return <BirthdayContext.Provider value={value}>{children}</BirthdayContext.Provider>
}

export function useBirthday() {
  const ctx = useContext(BirthdayContext)
  if (!ctx) throw new Error('useBirthday must be used within BirthdayProvider')
  return ctx
}

export function useDisplayName() {
  return useBirthday().name
}

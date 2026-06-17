import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type Brand = 'neutral' | 'client-a' | 'client-b'
export type ColorScheme = 'light' | 'dark'

export interface Theme {
  brand: Brand
  colorScheme: ColorScheme
}

export interface ThemeContextValue {
  theme: Theme
  setBrand: (brand: Brand) => void
  setColorScheme: (colorScheme: ColorScheme) => void
  setTheme: (theme: Partial<Theme>) => void
}

// ─────────────────────────────────────────
// Context
// ─────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ─────────────────────────────────────────
// Provider
// ─────────────────────────────────────────

interface ThemeProviderProps {
  children: ReactNode
  defaultBrand?: Brand
  defaultColorScheme?: ColorScheme
  /** Target element to set attributes on. Defaults to document.documentElement (<html>) */
  target?: HTMLElement
}

export function ThemeProvider({
  children,
  defaultBrand = 'neutral',
  defaultColorScheme = 'light',
  target,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>({
    brand: defaultBrand,
    colorScheme: defaultColorScheme,
  })

  useEffect(() => {
    const el = target ?? document.documentElement
    el.setAttribute('data-brand', theme.brand)
    el.setAttribute('data-color-scheme', theme.colorScheme)
  }, [theme, target])

  const setBrand = (brand: Brand) =>
    setThemeState((prev) => ({ ...prev, brand }))

  const setColorScheme = (colorScheme: ColorScheme) =>
    setThemeState((prev) => ({ ...prev, colorScheme }))

  const setTheme = (partial: Partial<Theme>) =>
    setThemeState((prev) => ({ ...prev, ...partial }))

  return (
    <ThemeContext.Provider value={{ theme, setBrand, setColorScheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─────────────────────────────────────────
// Hook
// ─────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>')
  }
  return ctx
}

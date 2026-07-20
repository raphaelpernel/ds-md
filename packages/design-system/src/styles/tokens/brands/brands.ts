/**
 * DS.MD — Registre des brands disponibles
 *
 * Source de vérité unique consommée par :
 *   - Storybook (`.storybook/preview.ts`, switcher de thème dans la toolbar)
 *   - Le sélecteur de thème client (`devtools/BrandThemeSwitcher`)
 *
 * Chaque `value` correspond à un fichier `brands/<value>.css` et à la valeur
 * posée sur `<html data-brand="...">`.
 */

export interface BrandOption {
  value: string
  label: string
}

export const BRANDS: BrandOption[] = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'marmiton', label: 'Marmiton' },
  { value: 'coursesu', label: 'CoursesU' },
]

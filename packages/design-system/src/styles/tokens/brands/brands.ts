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
  /** True when this brand represents a retailer's own site (vs. a Mealz-owned
   *  surface like Marmiton or the neutral demo). Set once when the brand is
   *  onboarded — drives retailer-specific UI decisions (e.g. hiding a store
   *  picker the retailer's site already provides) without coupling that
   *  business logic to the visual theme itself. */
  isRetailer?: boolean
}

export const BRANDS: BrandOption[] = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'marmiton', label: 'Marmiton' },
  { value: 'coursesu', label: 'CoursesU', isRetailer: true },
]

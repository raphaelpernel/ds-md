import { BRANDS } from '@mealz-product-team/design-system/styles/tokens/brands/brands'

export interface ClientNamespace {
  id: string
  brand: string
  label: string
  passwordEnvVar: string
}

export const NEUTRAL_BRAND = 'neutral'
export const MASTER_PASSWORD_ENV_VAR = 'HUB_PASSWORD_MASTER'

export const CLIENT_NAMESPACES: ClientNamespace[] = BRANDS.filter((brand) => brand.value !== NEUTRAL_BRAND).map(
  (brand) => ({
    id: brand.value,
    brand: brand.value,
    label: brand.label,
    passwordEnvVar: `HUB_PASSWORD_${brand.value.toUpperCase()}`,
  })
)

export function findClientNamespace(id: string): ClientNamespace | undefined {
  return CLIENT_NAMESPACES.find((namespace) => namespace.id === id)
}

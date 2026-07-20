/**
 * DS.MD — Clé localStorage partagée entre le script anti-FOUC
 * (`brandThemeScript`) et `BrandThemeSwitcher`, pour éviter toute
 * divergence entre les deux.
 */
export const BRAND_STORAGE_KEY = 'ds-md-brand'

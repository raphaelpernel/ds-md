import { BRAND_STORAGE_KEY } from './brandStorage'

/**
 * DS.MD — Script anti-FOUC pour le brand persisté.
 *
 * Retourne le code source (string) d'un script synchrone à injecter en
 * inline dans le `<head>` du root layout, AVANT tout autre contenu :
 * il applique le brand stocké en localStorage sur `<html>` avant le
 * premier paint, pour éviter un flash "neutral" au chargement/reload.
 *
 * Usage (app/layout.tsx) — via `next/script` + `strategy="beforeInteractive"`,
 * jamais un <script> brut (React refuse d'exécuter un <script> découvert lors
 * d'un re-render client, ce que Turbopack déclenche en dev au Fast Refresh) :
 *   import Script from 'next/script'
 *   <head><Script id="brand-theme-anti-fouc" strategy="beforeInteractive"
 *     dangerouslySetInnerHTML={{ __html: getBrandThemeScript() }} /></head>
 */
export function getBrandThemeScript(): string {
  return `(function(){try{var b=window.localStorage.getItem(${JSON.stringify(BRAND_STORAGE_KEY)});if(b)document.documentElement.setAttribute('data-brand',b);}catch(e){}})();`
}

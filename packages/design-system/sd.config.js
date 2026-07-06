import { readFileSync } from 'node:fs'
import StyleDictionary from 'style-dictionary'
import { formattedVariables, fileHeader } from 'style-dictionary/utils'

/**
 * Figma exports W3C tokens with $value.hex for colors and number values for font sizes.
 * This config transforms them into CSS custom properties that match the naming
 * convention already used across the app (--color-surface-page, --font-size-heading-xl, etc).
 */

StyleDictionary.registerTransform({
  name: 'figma/color',
  type: 'value',
  filter: (token) => token.$type === 'color' || token.type === 'color',
  transform: (token) => {
    const val = token.$value ?? token.value
    if (typeof val !== 'object' || !val.hex) return val
    // Figma's "hex" field is always opaque — alpha lives in a separate field.
    // Reconstruct rgba() for translucent colors so alpha isn't silently dropped.
    if (typeof val.alpha === 'number' && val.alpha < 1 && Array.isArray(val.components)) {
      const [r, g, b] = val.components.map((c) => Math.round(c * 255))
      const alpha = Math.round(val.alpha * 100) / 100
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    return val.hex
  },
})

StyleDictionary.registerTransform({
  name: 'figma/number-to-px',
  type: 'value',
  filter: (token) => {
    const type = token.$type ?? token.type
    return type === 'number' || type === 'dimension'
  },
  transform: (token) => {
    const val = token.$value ?? token.value
    if (typeof val === 'number') return `${val}px`
    return val
  },
})

// Maps a token's top-level Figma group to the prefix already used by hand-written
// CSS vars, e.g. Surface.Page -> --color-surface-page, Font Size.Heading.XL -> --font-size-heading-xl.
const CATEGORY_PREFIX = {
  Surface: 'color-surface',
  Content: 'color-content',
  Border: 'color-border',
  Interactive: 'color-interactive',
  Semantic: 'color-semantic',
  'Font Size': 'font-size',
  'Line Height': 'line-height',
}

function kebabCase(str) {
  return str
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .join('-')
    .toLowerCase()
}

StyleDictionary.registerTransform({
  name: 'figma/name-css',
  type: 'name',
  transform: (token) => {
    const [group, ...rest] = token.path
    const prefix = CATEGORY_PREFIX[group]
    const suffix = kebabCase(rest.join(' '))
    return prefix ? `${prefix}-${suffix}` : kebabCase(token.path.join(' '))
  },
})

// A handful of hand-written vars are indirections through the brand layer
// (e.g. --color-surface-brand: var(--brand-500)) rather than literal values.
// Figma's export flattens these to a resolved hex, so they must stay
// hand-written in src/styles/tokens/color-{light,dark}.css instead of being
// silently overwritten with a flattened literal. Shared between both modes,
// except Interactive.BG: it's a brand indirection in light mode but a real
// literal (#FFFFFF) in dark mode, so it's excluded from light only.
const SHARED_BRAND_INDIRECTION_PATHS = [
  'Surface.Brand',
  'Surface.Brand Light',
  'Surface.Brand Dark',
  'Border.Brand',
  'Interactive.BG Subtle',
  'Interactive.BG Hover',
  'Interactive.Content',
  'Interactive.Border',
]

const LIGHT_BRAND_INDIRECTION_PATHS = new Set([...SHARED_BRAND_INDIRECTION_PATHS, 'Interactive.BG'])
const DARK_BRAND_INDIRECTION_PATHS = new Set(SHARED_BRAND_INDIRECTION_PATHS)

// Category/Spacing/Shape are duplicated identically across the light and dark
// files but belong to base.css / brands/neutral.css, not color-mode output.
const COLOR_MODE_GROUPS = ['Surface', 'Content', 'Border', 'Interactive', 'Semantic']
const isColorTokenExcluding = (excludedPaths) => (token) =>
  COLOR_MODE_GROUPS.includes(token.path[0]) && !excludedPaths.has(token.path.join('.'))

// Only Font Size / Line Height actually differ between desktop and mobile
// (matches base.css's @media (max-width: 767px) heading-size override block).
// Font Family and Font Weight stay hand-written.
const TYPO_SIZE_GROUPS = ['Font Size', 'Line Height']
const isTypoSizeToken = (token) => TYPO_SIZE_GROUPS.includes(token.path[0])

// The mobile file should only override tokens whose value actually differs
// from desktop (today, that's only the Heading sizes) — not re-declare every
// Font Size / Line Height token, most of which are identical on mobile.
// Computed from the raw token JSON rather than hardcoded, so it stays correct
// if Figma ever changes which sizes are responsive.
function flattenLeaves(obj, path = []) {
  const out = []
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue
    if (val && typeof val === 'object' && '$value' in val) {
      out.push({ path: [...path, key], value: val.$value })
    } else if (val && typeof val === 'object') {
      out.push(...flattenLeaves(val, [...path, key]))
    }
  }
  return out
}

const desktopTypoJson = JSON.parse(readFileSync('tokens/typo-Desktop.tokens.json', 'utf8'))
const mobileTypoJson = JSON.parse(readFileSync('tokens/typo-Mobile.tokens.json', 'utf8'))

function computeMobileOverridePaths(groupNames) {
  const desktopValues = new Map()
  for (const group of groupNames) {
    if (!desktopTypoJson[group]) continue
    for (const leaf of flattenLeaves({ [group]: desktopTypoJson[group] })) {
      desktopValues.set(leaf.path.join('.'), leaf.value)
    }
  }
  const overridden = new Set()
  for (const group of groupNames) {
    if (!mobileTypoJson[group]) continue
    for (const leaf of flattenLeaves({ [group]: mobileTypoJson[group] })) {
      const key = leaf.path.join('.')
      if (desktopValues.has(key) && desktopValues.get(key) !== leaf.value) overridden.add(key)
    }
  }
  return overridden
}

const MOBILE_OVERRIDE_PATHS = computeMobileOverridePaths(TYPO_SIZE_GROUPS)
const isMobileOverrideToken = (token) => TYPO_SIZE_GROUPS.includes(token.path[0]) && MOBILE_OVERRIDE_PATHS.has(token.path.join('.'))

// usesDtcg: true is required — our Figma export uses DTCG token syntax
// ($value/$type), and formattedVariables() only reads the legacy value/type
// keys unless told otherwise, otherwise every var prints as "undefined".
StyleDictionary.registerFormat({
  name: 'css/scoped-selector',
  format: async ({ dictionary, file, options }) => {
    const header = await fileHeader({ file })
    const body = formattedVariables({ format: 'css', dictionary, outputReferences: options.outputReferences, usesDtcg: true })
    return `${header}[${options.selectorAttr}] {\n${body}\n}\n`
  },
})

StyleDictionary.registerFormat({
  name: 'css/media-query-root',
  format: async ({ dictionary, file, options }) => {
    const header = await fileHeader({ file })
    const body = formattedVariables({ format: 'css', dictionary, outputReferences: options.outputReferences, usesDtcg: true })
    return `${header}@media (max-width: 767px) {\n  :root {\n${body}\n  }\n}\n`
  },
})

// Style Dictionary deduplicates tokens by final name across a single build's
// whole source tree *before* per-file filters run. Since light/dark (and
// desktop/mobile) intentionally produce the *same* CSS var name for
// *different* values, they can't share one build — each mode gets its own
// StyleDictionary instance scoped to just that one source file, so there's
// never a same-name collision within a build.
const commonTransforms = ['figma/name-css', 'figma/color', 'figma/number-to-px']
const buildPath = 'src/styles/dist/'

const colorLightSD = new StyleDictionary({
  source: ['tokens/color-Light.tokens.json'],
  platforms: {
    css: {
      transforms: commonTransforms,
      buildPath,
      files: [
        {
          destination: 'color-light.generated.css',
          filter: isColorTokenExcluding(LIGHT_BRAND_INDIRECTION_PATHS),
          format: 'css/scoped-selector',
          options: { selectorAttr: 'data-color-scheme="light"' },
        },
      ],
    },
  },
})

const colorDarkSD = new StyleDictionary({
  source: ['tokens/color-Dark.tokens.json'],
  platforms: {
    css: {
      transforms: commonTransforms,
      buildPath,
      files: [
        {
          destination: 'color-dark.generated.css',
          filter: isColorTokenExcluding(DARK_BRAND_INDIRECTION_PATHS),
          format: 'css/scoped-selector',
          options: { selectorAttr: 'data-color-scheme="dark"' },
        },
      ],
    },
  },
})

const typographyDesktopSD = new StyleDictionary({
  source: ['tokens/typo-Desktop.tokens.json'],
  platforms: {
    css: {
      transforms: commonTransforms,
      buildPath,
      files: [
        {
          destination: 'typography-desktop.generated.css',
          filter: isTypoSizeToken,
          format: 'css/variables',
        },
      ],
    },
  },
})

const typographyMobileSD = new StyleDictionary({
  source: ['tokens/typo-Mobile.tokens.json'],
  platforms: {
    css: {
      transforms: commonTransforms,
      buildPath,
      files: [
        {
          destination: 'typography-mobile.generated.css',
          filter: isMobileOverrideToken,
          format: 'css/media-query-root',
        },
      ],
    },
  },
})

await Promise.all([
  colorLightSD.buildAllPlatforms(),
  colorDarkSD.buildAllPlatforms(),
  typographyDesktopSD.buildAllPlatforms(),
  typographyMobileSD.buildAllPlatforms(),
])

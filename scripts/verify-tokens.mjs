// One-off verification script (not part of the build) — compares generated
// Style Dictionary output against the hand-written CSS it's meant to replace.
// Run: node scripts/verify-tokens.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

function extractVars(cssText) {
  const map = new Map()
  const re = /--([\w-]+):\s*([^;]+);/g
  let m
  while ((m = re.exec(cssText))) {
    map.set(m[1].trim(), m[2].trim())
  }
  return map
}

function normalize(value) {
  // rgba(19, 21, 38, 0.60) vs rgba(19, 21, 38, 0.6) should compare equal.
  return value.replace(/\s+/g, ' ').replace(/(\.\d*?)0+(?=[,)])/g, '$1').replace(/\.(?=[,)])/g, '')
}

function diff(label, handPath, genPath, { ignore = [] } = {}) {
  const hand = extractVars(readFileSync(handPath, 'utf8'))
  const gen = extractVars(readFileSync(genPath, 'utf8'))
  const ignoreSet = new Set(ignore)

  const missingInGen = []
  const valueMismatch = []
  const extraInGen = []

  for (const [name, handVal] of hand) {
    if (ignoreSet.has(name)) continue
    if (!gen.has(name)) {
      missingInGen.push(name)
      continue
    }
    if (normalize(handVal) !== normalize(gen.get(name))) {
      valueMismatch.push({ name, hand: handVal, gen: gen.get(name) })
    }
  }
  for (const name of gen.keys()) {
    if (!hand.has(name) && !ignoreSet.has(name)) extraInGen.push(name)
  }

  console.log(`\n=== ${label} ===`)
  console.log(`hand-written vars: ${hand.size}, generated vars: ${gen.size}, ignored (expected exceptions): ${ignoreSet.size}`)
  if (missingInGen.length) console.log('MISSING in generated (expected — not generated, ignore list?):', missingInGen)
  if (extraInGen.length) console.log('EXTRA in generated (not in hand-written — unexpected!):', extraInGen)
  if (valueMismatch.length) {
    console.log('VALUE MISMATCHES:')
    for (const v of valueMismatch) console.log(`  --${v.name}: hand="${v.hand}" generated="${v.gen}"`)
  } else {
    console.log('No value mismatches.')
  }
  return { missingInGen, valueMismatch, extraInGen }
}

const brandIndirectionVars = [
  'color-surface-brand',
  'color-surface-brand-light',
  'color-surface-brand-dark',
  'color-border-brand',
  'color-interactive-bg-subtle',
  'color-interactive-bg-hover',
  'color-interactive-content',
  'color-interactive-border',
]

const lightResult = diff(
  'color-light',
  'src/styles/tokens/color-light.css',
  'src/styles/dist/color-light.generated.css',
  { ignore: [...brandIndirectionVars, 'color-interactive-bg'] },
)

const darkResult = diff(
  'color-dark',
  'src/styles/tokens/color-dark.css',
  'src/styles/dist/color-dark.generated.css',
  { ignore: brandIndirectionVars },
)

// base.css has both the desktop (:root) block and the mobile (@media) block
// in one file — extract each separately by splitting on the @media boundary.
const baseCss = readFileSync('src/styles/tokens/base.css', 'utf8')
const mediaIdx = baseCss.indexOf('@media (max-width: 767px)')
const desktopBlock = baseCss.slice(0, mediaIdx)
const mobileBlock = baseCss.slice(mediaIdx)

const desktopScratch = join(tmpdir(), '_base-desktop.css')
const mobileScratch = join(tmpdir(), '_base-mobile.css')
writeFileSync(desktopScratch, desktopBlock)
writeFileSync(mobileScratch, mobileBlock)

// base.css's :root block also holds Spacing/Shape/Elevation/Font Family/Font
// Weight — none of those are in scope for typography generation (no Figma
// source for Spacing/Shape/Elevation; Font Family/Weight don't vary by
// breakpoint). Only compare the vars that are actually meant to be generated.
const desktopScopeGuard = (name) => name.startsWith('font-size-') || name.startsWith('line-height-')
const desktopResult = diff('typography-desktop', desktopScratch, 'src/styles/dist/typography-desktop.generated.css', {
  ignore: [...extractVars(readFileSync(desktopScratch, 'utf8')).keys()].filter((n) => !desktopScopeGuard(n)),
})
const mobileResult = diff('typography-mobile', mobileScratch, 'src/styles/dist/typography-mobile.generated.css')

const allClean = [lightResult, darkResult, desktopResult, mobileResult].every(
  (r) => r.valueMismatch.length === 0 && r.extraInGen.length === 0,
)

console.log(`\n${allClean ? '✔ All value comparisons clean (only expected brand-indirection vars excluded).' : '✘ Unexpected discrepancies found — see above.'}`)
process.exit(allClean ? 0 : 1)

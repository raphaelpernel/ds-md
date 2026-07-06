// Sanity check for the Style Dictionary output. Hand-written token files
// (color-light.css, color-dark.css, base.css) only carry vars that can't be
// generated (brand indirections, Spacing/Shape/Elevation/Font Family/Font
// Weight, and label-badge which has no Figma source). Generated files
// (src/styles/dist/*.generated.css) carry everything else. The invariant
// that matters: these two sets must never overlap — if a var shows up in
// both, either an exception is no longer needed (remove it from hand-written)
// or something that should be an exception is being silently regenerated.
// Run: node scripts/verify-tokens.mjs (or `pnpm verify-tokens`)
import { readFileSync } from 'node:fs'

function extractVars(cssText) {
  const map = new Map()
  const re = /--([\w-]+):\s*([^;]+);/g
  let m
  while ((m = re.exec(cssText))) {
    map.set(m[1].trim(), m[2].trim())
  }
  return map
}

function checkNoOverlap(label, handPath, genPaths) {
  const hand = extractVars(readFileSync(handPath, 'utf8'))
  const generated = new Map()
  for (const genPath of genPaths) {
    for (const [name, value] of extractVars(readFileSync(genPath, 'utf8'))) {
      generated.set(name, value)
    }
  }

  const overlap = [...hand.keys()].filter((name) => generated.has(name))

  console.log(`\n=== ${label} ===`)
  console.log(`hand-written vars: ${hand.size}, generated vars: ${generated.size}`)
  if (overlap.length) {
    console.log('OVERLAP — defined in both hand-written and generated (should never happen):')
    for (const name of overlap) {
      console.log(`  --${name}: hand="${hand.get(name)}" generated="${generated.get(name)}"`)
    }
  } else {
    console.log('No overlap — hand-written and generated stay cleanly separated.')
  }
  return overlap
}

const colorOverlap = [
  ...checkNoOverlap('color-light', 'src/styles/tokens/color-light.css', ['src/styles/dist/color-light.generated.css']),
  ...checkNoOverlap('color-dark', 'src/styles/tokens/color-dark.css', ['src/styles/dist/color-dark.generated.css']),
  ...checkNoOverlap('base (typography)', 'src/styles/tokens/base.css', [
    'src/styles/dist/typography-desktop.generated.css',
    'src/styles/dist/typography-mobile.generated.css',
  ]),
]

const allClean = colorOverlap.length === 0
console.log(`\n${allClean ? '✔ No overlap between hand-written exceptions and generated output.' : '✘ Overlap found — see above.'}`)
process.exit(allClean ? 0 : 1)

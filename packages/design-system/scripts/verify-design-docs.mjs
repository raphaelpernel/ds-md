// Sanity check for per-component documentation coverage. Every component that
// has a Storybook story (*.stories.tsx) is expected to also have a sibling
// *.design.md (see .claude/ds-md-rules.md §4 for the template, and
// packages/design-system/docs/DESIGN.md for how these get referenced).
// The invariant that matters: Storybook coverage and .design.md coverage
// must stay in lockstep — a component visible in Storybook but undocumented
// is exactly the gap that lets an agent misuse it.
// Run: node scripts/verify-design-docs.mjs (or `pnpm verify-design-docs`)
import { readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'

const COMPONENTS_ROOT = 'src/components/ui'

function findStoriesDirs(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (!statSync(full).isDirectory()) continue
    const storiesFile = readdirSync(full).find((f) => f.endsWith('.stories.tsx'))
    if (storiesFile) {
      results.push({ dir: full, name: basename(storiesFile, '.stories.tsx') })
    } else {
      results.push(...findStoriesDirs(full))
    }
  }
  return results
}

const componentDirs = findStoriesDirs(COMPONENTS_ROOT)
const missing = componentDirs.filter(
  ({ dir, name }) => !existsSync(join(dir, `${name}.design.md`))
)

console.log(`Composants avec Storybook : ${componentDirs.length}`)
console.log(`Composants avec .design.md : ${componentDirs.length - missing.length}`)

if (missing.length) {
  console.log('\n✘ Manquant :')
  for (const { dir, name } of missing) {
    console.log(`  ${join(dir, `${name}.design.md`)}`)
  }
  console.log(`\nVoir .claude/ds-md-rules.md §4 pour le template, et packages/design-system/docs/DESIGN.md §4 pour la convention.`)
} else {
  console.log('\n✔ Tous les composants Storybook ont leur .design.md.')
}

process.exit(missing.length ? 1 : 0)

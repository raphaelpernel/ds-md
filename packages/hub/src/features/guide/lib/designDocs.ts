import { readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export type DesignDoc = {
  name: string
  slug: string
  category: string
  relativePath: string
  storybookId: string | null
}

const DESIGN_SYSTEM_ROOT = path.resolve(process.cwd(), '../design-system')

const COMPONENTS_ROOT = path.join(DESIGN_SYSTEM_ROOT, 'src/components/ui')

type DesignDocFile = {
  relativePath: string
}

function findDesignDocFiles(directory: string): DesignDocFile[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) return findDesignDocFiles(absolutePath)
    if (!entry.isFile() || !entry.name.endsWith('.design.md')) return []
    return [{
      relativePath: path.relative(DESIGN_SYSTEM_ROOT, absolutePath).split(path.sep).join('/'),
    }]
  })
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function parseStorybookId(markdown: string) {
  const match = markdown.match(/^- Storybook\s*:\s*`([^`]+)`/m)
  return match?.[1] ?? null
}

export function buildDesignDocs(files: DesignDocFile[]): DesignDoc[] {
  const sortedFiles = [...files].sort((left, right) => left.relativePath.localeCompare(right.relativePath))
  const baseSlugCounts = new Map<string, number>()
  for (const { relativePath } of sortedFiles) {
    const baseSlug = slugify(path.basename(relativePath).replace(/\.design\.md$/, ''))
    baseSlugCounts.set(baseSlug, (baseSlugCounts.get(baseSlug) ?? 0) + 1)
  }
  const usedSlugs = new Set<string>()

  return sortedFiles.map(({ relativePath }) => {
    const componentPath = path.relative(
      COMPONENTS_ROOT,
      path.join(DESIGN_SYSTEM_ROOT, relativePath),
    ).split(path.sep).join('/')
    const [category] = componentPath.split('/')
    const fileName = path.basename(relativePath)
    const name = fileName.replace(/\.design\.md$/, '')
    const baseSlug = slugify(name)
    let slug = baseSlug
    if ((baseSlugCounts.get(baseSlug) ?? 0) > 1) {
      const pathSuffix = componentPath.replace(/\/[^/]+$/, '')
      slug = slugify(`${baseSlug}-${pathSuffix}`)
    }
    let suffix = 2
    while (usedSlugs.has(slug)) slug = `${slugify(`${baseSlug}-${componentPath}`)}-${suffix++}`
    usedSlugs.add(slug)
    return { name, slug, category, relativePath, storybookId: null }
  })
}

export const DESIGN_DOCS: DesignDoc[] = buildDesignDocs(findDesignDocFiles(COMPONENTS_ROOT))

export async function readDesignSystemGuide() {
  return readFile(path.join(DESIGN_SYSTEM_ROOT, 'docs/DESIGN.md'), 'utf8')
}

export async function getDesignDocs() {
  return Promise.all(DESIGN_DOCS.map(async (doc) => {
    const markdown = await readFile(path.join(DESIGN_SYSTEM_ROOT, doc.relativePath), 'utf8')
    return { ...doc, storybookId: parseStorybookId(markdown) }
  }))
}

export async function getDesignDoc(slug: string) {
  const doc = DESIGN_DOCS.find((candidate) => candidate.slug === slug)
  if (!doc) return null
  const markdown = await readFile(path.join(DESIGN_SYSTEM_ROOT, doc.relativePath), 'utf8')
  return { ...doc, storybookId: parseStorybookId(markdown), markdown }
}

export function storybookUrl(storybookId: string | null) {
  if (!storybookId) return null
  const base = process.env.HUB_STORYBOOK_URL ?? 'http://localhost:6006'
  return `${base.replace(/\/$/, '')}/?path=/docs/${storybookId.toLowerCase().replace(/[^a-z0-9]+/g, '-') }--docs`
}

export const guideSourceLinks = {
  tokens: 'https://github.com/raphaelpernel/ds-md/blob/main/.claude/design-system-tokens.md',
  rules: 'https://github.com/raphaelpernel/ds-md/blob/main/.claude/ds-md-rules.md',
  design: 'https://github.com/raphaelpernel/ds-md/blob/main/packages/design-system/docs/DESIGN.md',
}

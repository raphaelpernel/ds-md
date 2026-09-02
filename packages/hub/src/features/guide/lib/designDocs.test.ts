import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildDesignDocs, DESIGN_DOCS, getDesignDoc, getDesignDocs, readDesignSystemGuide, storybookUrl } from './designDocs'

const designSystemRoot = path.resolve(process.cwd(), '../design-system')

describe('design system guide catalogue', () => {
  it('tracks the guide and all 35 component documents', async () => {
    expect(DESIGN_DOCS).toHaveLength(35)
    expect(new Set(DESIGN_DOCS.map((doc) => doc.slug)).size).toBe(35)
    expect((await readDesignSystemGuide())).toContain('Quel composant pour quel besoin')
    const docs = await getDesignDocs()
    expect(docs).toHaveLength(35)
    expect(docs.every((doc) => doc.storybookId)).toBe(true)
  })

  it('derives component metadata from a discovered filesystem path', () => {
    const button = DESIGN_DOCS.find((doc) => doc.name === 'Button')
    expect(button?.relativePath).toBe('src/components/ui/form/Button/Button.design.md')
    expect(button && existsSync(path.join(designSystemRoot, button.relativePath))).toBe(true)
  })

  it('adds deterministic path suffixes when component names collide', () => {
    const docs = buildDesignDocs([
      { relativePath: 'src/components/ui/alpha/Alert/Alert.design.md' },
      { relativePath: 'src/components/ui/beta/Alert/Alert.design.md' },
      { relativePath: 'src/components/ui/form/Button/Button.design.md' },
    ])
    expect(docs.map((doc) => doc.slug)).toEqual(['alert-alpha-alert', 'alert-beta-alert', 'button'])
    expect(new Set(docs.map((doc) => doc.slug)).size).toBe(3)
  })
  it('reads a whitelisted component and rejects unknown or traversal slugs', async () => {
    const button = await getDesignDoc('button')
    expect(button?.name).toBe('Button')
    expect(button?.markdown).toContain('Storybook')
    await expect(getDesignDoc('unknown')).resolves.toBeNull()
    await expect(getDesignDoc('../../package.json')).resolves.toBeNull()
  })

  it('builds configurable Storybook autodocs URLs', () => {
    const previous = process.env.HUB_STORYBOOK_URL
    process.env.HUB_STORYBOOK_URL = 'https://storybook.example/'
    expect(storybookUrl('DS.MD/Form/Button')).toBe('https://storybook.example/?path=/docs/ds-md-form-button--docs')
    if (previous === undefined) delete process.env.HUB_STORYBOOK_URL
    else process.env.HUB_STORYBOOK_URL = previous
  })
})

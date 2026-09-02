import { describe, expect, it } from 'vitest'
import { repositorySourceUrl } from './markdownLinks'

describe('repositorySourceUrl', () => {
  const sourcePath = 'packages/design-system/docs/DESIGN.md'

  it('resolves repository-relative links against the source document', () => {
    expect(repositorySourceUrl('../../../.claude/ds-md-rules.md', sourcePath))
      .toBe('https://github.com/raphaelpernel/ds-md/blob/main/.claude/ds-md-rules.md')
    expect(repositorySourceUrl('../src/styles/tokens/layout.css', sourcePath))
      .toBe('https://github.com/raphaelpernel/ds-md/blob/main/packages/design-system/src/styles/tokens/layout.css')
  })

  it('preserves external links, root links, and anchors', () => {
    expect(repositorySourceUrl('https://example.com/docs', sourcePath)).toBe('https://example.com/docs')
    expect(repositorySourceUrl('mailto:hello@example.com', sourcePath)).toBe('mailto:hello@example.com')
    expect(repositorySourceUrl('#architecture', sourcePath)).toBe('#architecture')
    expect(repositorySourceUrl('/guide', sourcePath)).toBe('/guide')
  })
})
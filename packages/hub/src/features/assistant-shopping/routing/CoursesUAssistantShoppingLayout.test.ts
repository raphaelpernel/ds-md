import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('CoursesU Assistant Shopping layout', () => {
  it('mounts ClientNamespaceShell around the static client tree', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/(client)/coursesu/assistant-shopping/layout.tsx'), 'utf8')
    expect(source).toContain('ClientNamespaceShell')
    expect(source).toContain('basePath="/coursesu/assistant-shopping"')
  })
})

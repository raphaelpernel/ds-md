import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('Assistant Shopping brand contract', () => {
  it('keeps store-locator behavior shared by Neutral and CoursesU mounts', () => {
    const context = readFileSync(resolve(process.cwd(), 'src/features/assistant-shopping/context/AssistantContext.tsx'), 'utf8')
    const neutral = readFileSync(resolve(process.cwd(), 'app/(master)/neutral/assistant-shopping/layout.tsx'), 'utf8')
    const coursesu = readFileSync(resolve(process.cwd(), 'app/(client)/coursesu/assistant-shopping/layout.tsx'), 'utf8')

    expect(context).not.toContain('isRetailerBrand')
    expect(context.match(/if \(!store\)/g)).toHaveLength(2)
    expect(neutral).toContain('AssistantProvider')
    expect(coursesu).toContain('AssistantProvider')
  })
})

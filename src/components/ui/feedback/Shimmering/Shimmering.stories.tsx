import type { Meta, StoryObj } from '@storybook/react'
import { Shimmering } from './Shimmering'
const meta: Meta<typeof Shimmering> = {
  title: 'DS.MD/Feedback/Shimmering', component: Shimmering, tags: ['autodocs'],
  args: { width: 300, height: 200 },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-312&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Shimmering>
export const Default: Story = {}
export const CardShape: Story = { args: { width: 280, height: 160, borderRadius: 'var(--shape-card)' } }

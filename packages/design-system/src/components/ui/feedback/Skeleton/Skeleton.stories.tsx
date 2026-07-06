import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './Skeleton'
const meta: Meta<typeof Skeleton> = {
  title: 'DS.MD/Feedback/Skeleton', component: Skeleton, tags: ['autodocs'],
  argTypes: { variant: { control: 'radio', options: ['rect', 'text', 'circle'] } },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-301&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Skeleton>
export const Rect: Story = { args: { variant: 'rect', width: 200, height: 100 } }
export const Text: Story = { args: { variant: 'text', lines: 3, width: 300 } }
export const Circle: Story = { args: { variant: 'circle', width: 48, height: 48 } }

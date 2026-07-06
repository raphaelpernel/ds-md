import type { Meta, StoryObj } from '@storybook/react'
import { Loading } from './Loading'
const meta: Meta<typeof Loading> = {
  title: 'DS.MD/Feedback/Loading', component: Loading, tags: ['autodocs'],
  args: { size: 'M' },
  argTypes: { size: { control: 'radio', options: ['S', 'M', 'L'] } },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-301&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Loading>
export const Default: Story = {}
export const WithLabel: Story = { args: { label: 'Loading recipes…' } }
export const Small: Story = { args: { size: 'S' } }
export const Large: Story = { args: { size: 'L' } }

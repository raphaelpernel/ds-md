import type { Meta, StoryObj } from '@storybook/react'
import { Radio } from './Radio'
const meta: Meta<typeof Radio> = {
  title: 'DS.MD/Form/Radio', component: Radio, tags: ['autodocs'],
  args: { label: 'Radio label', name: 'example' },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-1511&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Radio>
export const Default: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }

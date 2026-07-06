import type { Meta, StoryObj } from '@storybook/react'
import { Toggle } from './Toggle'
const meta: Meta<typeof Toggle> = {
  title: 'DS.MD/Form/Toggle', component: Toggle, tags: ['autodocs'],
  args: { label: 'Toggle label', size: 'M' },
  argTypes: { size: { control: 'radio', options: ['M', 'S'] } },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=309-640&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Toggle>
export const Default: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } }

import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './Checkbox'
const meta: Meta<typeof Checkbox> = {
  title: 'DS.MD/Form/Checkbox', component: Checkbox, tags: ['autodocs'],
  args: { label: 'Checkbox label', state: 'default' },
  argTypes: { state: { control: 'radio', options: ['default', 'error'] } },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=310-645&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Checkbox>
export const Default: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Indeterminate: Story = { args: { indeterminate: true } }
export const Disabled: Story = { args: { disabled: true } }
export const Error: Story = { args: { state: 'error' } }

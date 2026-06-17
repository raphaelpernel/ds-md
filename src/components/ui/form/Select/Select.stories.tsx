import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './Select'
const OPTIONS = [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }, { value: 'c', label: 'Option C' }]
const meta: Meta<typeof Select> = {
  title: 'DS.MD/Form/Select', component: Select, tags: ['autodocs'],
  args: { label: 'Label', placeholder: 'Choose…', options: OPTIONS, state: 'default' },
  argTypes: { state: { control: 'radio', options: ['default', 'error', 'disabled'] } },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=316-743&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Select>
export const Default: Story = {}
export const WithError: Story = { args: { state: 'error', errorText: 'Required' } }
export const Disabled: Story = { args: { state: 'disabled' } }

import type { Meta, StoryObj } from '@storybook/react'
import { InputTextarea } from './InputTextarea'
const meta: Meta<typeof InputTextarea> = {
  title: 'DS.MD/Form/Input Textarea', component: InputTextarea, tags: ['autodocs'],
  args: { label: 'Label', placeholder: 'Write something…', state: 'default' },
  argTypes: { state: { control: 'radio', options: ['default', 'error', 'disabled'] } },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=309-640&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof InputTextarea>
export const Default: Story = {}
export const WithError: Story = { args: { state: 'error', errorText: 'Required field' } }
export const Disabled: Story = { args: { state: 'disabled' } }

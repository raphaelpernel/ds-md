import type { Meta, StoryObj } from '@storybook/react'
import { MagnifyingGlass, Eye } from '@phosphor-icons/react'
import { InputField } from './InputField'

const meta: Meta<typeof InputField> = {
  title: 'DS.MD/Form/Input Field',
  component: InputField,
  tags: ['autodocs'],
  args: { label: 'Label', placeholder: 'Placeholder...', helperText: 'Helper text', state: 'default' },
  argTypes: {
    state: { control: 'radio', options: ['default', 'error', 'disabled'] },
    lIcon: { control: false },
    rIcon: { control: false },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-1515&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof InputField>

export const Default: Story = {}
export const WithLeftIcon: Story = { args: { lIcon: <MagnifyingGlass size={16} /> } }
export const WithRightIcon: Story = { args: { rIcon: <Eye size={16} /> } }
export const WithBothIcons: Story = { args: { lIcon: <MagnifyingGlass size={16} />, rIcon: <Eye size={16} /> } }
export const WithError: Story = { args: { state: 'error', errorText: 'This field is required' } }
export const Disabled: Story = { args: { state: 'disabled' } }

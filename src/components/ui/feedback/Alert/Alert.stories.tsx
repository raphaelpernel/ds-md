import type { Meta, StoryObj } from '@storybook/react'
import { Alert } from './Alert'
const meta: Meta<typeof Alert> = {
  title: 'DS.MD/Feedback/Alert', component: Alert, tags: ['autodocs'],
  args: { title: 'Alert title', children: 'Descriptive text about the alert message.', variant: 'info' },
  argTypes: {
    variant: { control: 'radio', options: ['success', 'danger', 'warning', 'info'] },
    icon:    { control: false },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=332-801&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Alert>
export const Info: Story = { args: { variant: 'info' } }
export const Success: Story = { args: { variant: 'success' } }
export const Warning: Story = { args: { variant: 'warning' } }
export const Danger: Story = { args: { variant: 'danger' } }
export const Dismissible: Story = { args: { onDismiss: () => alert('dismissed') } }

import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from './Toast'
const meta: Meta<typeof Toast> = {
  title: 'DS.MD/Feedback/Toast', component: Toast, tags: ['autodocs'],
  args: { title: 'Toast message', description: 'Additional context here.', variant: 'default' },
  argTypes: { variant: { control: 'radio', options: ['default', 'success', 'danger', 'warning', 'info'] } },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=332-702&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Toast>
export const Default: Story = {}
export const Success: Story = { args: { variant: 'success', title: 'Saved!' } }
export const WithAction: Story = { args: { action: { label: 'Undo', onClick: () => {} } } }
export const Dismissible: Story = { args: { onDismiss: () => {} } }

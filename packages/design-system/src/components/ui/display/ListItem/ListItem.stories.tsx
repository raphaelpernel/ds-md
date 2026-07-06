import type { Meta, StoryObj } from '@storybook/react'
import { ListItem } from './ListItem'
const meta: Meta<typeof ListItem> = {
  title: 'DS.MD/Display/List Item', component: ListItem, tags: ['autodocs'],
  args: { label: 'List item label', description: 'Supporting description text' },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=374-1309&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof ListItem>
export const Default: Story = {}
export const Interactive: Story = { args: { onClick: () => alert('clicked') } }
export const Disabled: Story = { args: { onClick: () => {}, disabled: true } }

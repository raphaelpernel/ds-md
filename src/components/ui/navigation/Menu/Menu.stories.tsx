import type { Meta, StoryObj } from '@storybook/react'
import { Menu } from './Menu'

const PlaceholderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.5 2.625H4.5C4.00272 2.625 3.52581 2.82254 3.17417 3.17417C2.82254 3.52581 2.625 4.00272 2.625 4.5V19.5C2.625 19.9973 2.82254 20.4742 3.17417 20.8258C3.52581 21.1775 4.00272 21.375 4.5 21.375H19.5C19.9973 21.375 20.4742 21.1775 20.8258 20.8258C21.1775 20.4742 21.375 19.9973 21.375 19.5V4.5C21.375 4.00272 21.1775 3.52581 20.8258 3.17417C20.4742 2.82254 19.9973 2.625 19.5 2.625ZM19.125 17.5312L6.46875 4.875H19.125V17.5312ZM4.875 6.46875L17.5312 19.125H4.875V6.46875Z" fill="currentColor"/>
  </svg>
)

const ITEMS = [
  { value: 'edit', label: 'List Item', icon: <PlaceholderIcon /> },
  { value: 'duplicate', label: 'List Item', icon: <PlaceholderIcon /> },
  { value: 'share', label: 'List Item', icon: <PlaceholderIcon /> },
  { value: 'divider', label: '', divider: true },
  { value: 'delete', label: 'List Item', icon: <PlaceholderIcon />, danger: true },
  { value: 'disabled', label: 'List Item', icon: <PlaceholderIcon />, disabled: true },
]

const meta: Meta<typeof Menu> = {
  title: 'DS.MD/Navigation/Menu',
  component: Menu,
  tags: ['autodocs'],
  args: { items: ITEMS },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=374-1297&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Menu>
export const Default: Story = {}

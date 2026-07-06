import type { Meta, StoryObj } from '@storybook/react'
import { PencilSimple, Copy, ShareNetwork, Trash, Lock } from '@phosphor-icons/react'
import { Menu } from './Menu'

const ITEMS = [
  { value: 'edit',     label: 'Edit',       icon: <PencilSimple size={16} /> },
  { value: 'duplicate',label: 'Duplicate',  icon: <Copy size={16} /> },
  { value: 'share',    label: 'Share',      icon: <ShareNetwork size={16} /> },
  { value: 'divider',  label: '', divider: true },
  { value: 'delete',   label: 'Delete',     icon: <Trash size={16} />, danger: true },
  { value: 'disabled', label: 'Restricted', icon: <Lock size={16} />, disabled: true },
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

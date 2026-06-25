import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { House, BookOpen, User } from '@phosphor-icons/react'
import { Tab } from './Tab'

const ITEMS = [{ value: 'a', label: 'Tab 1' }, { value: 'b', label: 'Tab 2' }, { value: 'c', label: 'Tab 3', disabled: true }]
const ITEMS_WITH_ICONS = [
  { value: 'a', label: 'Home',    icon: <House size={16} /> },
  { value: 'b', label: 'Recipes', icon: <BookOpen size={16} /> },
  { value: 'c', label: 'Profile', icon: <User size={16} />, disabled: true },
]
const meta: Meta<typeof Tab> = {
  title: 'DS.MD/Navigation/Tab', component: Tab, tags: ['autodocs'],
  args: { items: ITEMS, value: 'a' },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=326-702&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Tab>
export const Default: Story = {
  render: (args) => { const [v, setV] = useState('a'); return <Tab {...args} value={v} onChange={setV} /> }
}
export const WithIcons: Story = {
  args: { items: ITEMS_WITH_ICONS },
  render: (args) => { const [v, setV] = useState('a'); return <Tab {...args} value={v} onChange={setV} /> }
}
export const Pill: Story = {
  args: { variant: 'pill' },
  render: (args) => { const [v, setV] = useState('a'); return <Tab {...args} value={v} onChange={setV} /> }
}
export const PillWithIcons: Story = {
  args: { variant: 'pill', items: ITEMS_WITH_ICONS },
  render: (args) => { const [v, setV] = useState('a'); return <Tab {...args} value={v} onChange={setV} /> }
}

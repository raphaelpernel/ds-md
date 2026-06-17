import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Tab } from './Tab'

const PlaceholderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.5 2.625H4.5C4.00272 2.625 3.52581 2.82254 3.17417 3.17417C2.82254 3.52581 2.625 4.00272 2.625 4.5V19.5C2.625 19.9973 2.82254 20.4742 3.17417 20.8258C3.52581 21.1775 4.00272 21.375 4.5 21.375H19.5C19.9973 21.375 20.4742 21.1775 20.8258 20.8258C21.1775 20.4742 21.375 19.9973 21.375 19.5V4.5C21.375 4.00272 21.1775 3.52581 20.8258 3.17417C20.4742 2.82254 19.9973 2.625 19.5 2.625ZM19.125 17.5312L6.46875 4.875H19.125V17.5312ZM4.875 6.46875L17.5312 19.125H4.875V6.46875Z" fill="currentColor"/>
  </svg>
)

const ITEMS = [{ value: 'a', label: 'Tab 1' }, { value: 'b', label: 'Tab 2' }, { value: 'c', label: 'Tab 3', disabled: true }]
const ITEMS_WITH_ICONS = [
  { value: 'a', label: 'Tab 1', icon: <PlaceholderIcon /> },
  { value: 'b', label: 'Tab 2', icon: <PlaceholderIcon /> },
  { value: 'c', label: 'Tab 3', icon: <PlaceholderIcon />, disabled: true },
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

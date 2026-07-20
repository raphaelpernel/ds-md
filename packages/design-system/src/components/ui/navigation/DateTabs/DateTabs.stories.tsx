import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DateTabs } from './DateTabs'

const DEMO_DAYS = [
  { date: '2026-06-20' },
  { date: '2026-06-21' },
  { date: '2026-06-22', disabled: true },
  { date: '2026-06-23' },
  { date: '2026-06-24' },
  { date: '2026-06-25' },
  { date: '2026-06-26' },
]

const meta: Meta<typeof DateTabs> = {
  title: 'DS.MD/Navigation/DateTabs',
  component: DateTabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof DateTabs>

function Controlled(props: Partial<React.ComponentProps<typeof DateTabs>>) {
  const [v, setV] = useState(props.value ?? DEMO_DAYS[0].date)
  return <DateTabs items={DEMO_DAYS} {...props} value={v} onChange={setV} />
}

export const Default: Story = {
  render: () => <Controlled />,
}

export const InMarmitonContext: Story = {
  render: () => (
    <div data-brand="marmiton" data-color-scheme="light">
      <Controlled value="2026-06-21" />
    </div>
  ),
  name: 'Contexte Marmiton (corail)',
}

export const InCarrefourContext: Story = {
  render: () => (
    <div data-partner="carrefour">
      <Controlled value="2026-06-21" />
    </div>
  ),
  name: 'Contexte Carrefour (bleu)',
}

export const WithManyDays: Story = {
  render: () => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date('2026-06-20')
      d.setDate(d.getDate() + i)
      return { date: d.toISOString().split('T')[0] }
    })
    function C() {
      const [v, setV] = useState(days[0].date)
      return <DateTabs items={days} value={v} onChange={setV} />
    }
    return <C />
  },
  name: '14 jours (scroll horizontal)',
}

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SegmentedControl } from './SegmentedControl'

const DELIVERY_OPTIONS = [
  { value: 'drive', label: 'Drive' },
  { value: 'home', label: 'Livraison à domicile' },
]

const THREE_OPTIONS = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Année' },
]

const meta: Meta<typeof SegmentedControl> = {
  title: 'DS.MD/Navigation/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  args: {
    options: DELIVERY_OPTIONS,
    value: 'drive',
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=434-328&m=dev',
    },
  },
}

export default meta
type Story = StoryObj<typeof SegmentedControl>

export const Default: Story = {
  render: (args) => {
    const [v, setV] = useState(args.value)
    return <SegmentedControl {...args} value={v} onChange={setV} />
  },
}

export const ThreeOptions: Story = {
  args: { options: THREE_OPTIONS, value: 'week' },
  render: (args) => {
    const [v, setV] = useState(args.value)
    return <SegmentedControl {...args} value={v} onChange={setV} />
  },
}

export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => {
    const [v, setV] = useState(args.value)
    return (
      <div style={{ maxWidth: 400, padding: 16 }}>
        <SegmentedControl {...args} value={v} onChange={setV} />
      </div>
    )
  },
}

export const AllVariants: Story = {
  render: () => {
    const [v2, setV2] = useState('drive')
    const [v3, setV3] = useState('week')
    const [vFull, setVFull] = useState('drive')

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 24 }}>
        <div>
          <p style={{ marginBottom: 8, fontSize: 12, color: 'var(--color-content-weak)' }}>2 options</p>
          <SegmentedControl options={DELIVERY_OPTIONS} value={v2} onChange={setV2} />
        </div>
        <div>
          <p style={{ marginBottom: 8, fontSize: 12, color: 'var(--color-content-weak)' }}>3 options</p>
          <SegmentedControl options={THREE_OPTIONS} value={v3} onChange={setV3} />
        </div>
        <div style={{ maxWidth: 400 }}>
          <p style={{ marginBottom: 8, fontSize: 12, color: 'var(--color-content-weak)' }}>Full width</p>
          <SegmentedControl options={DELIVERY_OPTIONS} value={vFull} onChange={setVFull} fullWidth />
        </div>
      </div>
    )
  },
}

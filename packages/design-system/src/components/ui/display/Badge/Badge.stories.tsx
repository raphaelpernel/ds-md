import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'
const meta: Meta<typeof Badge> = {
  title: 'DS.MD/Display/Badge', component: Badge, tags: ['autodocs'],
  args: { label: 'Badge', variant: 'default', size: 'M' },
  argTypes: {
    variant:  { control: 'select', options: ['default', 'brand', 'success', 'danger', 'warning', 'info'] },
    size:     { control: 'radio', options: ['L', 'M', 'S'] },
    emphasis: { control: 'radio', options: ['light', 'solid'] },
    icon:     { control: false },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=333-618&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Badge>
export const Default: Story = {}
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)' }}>
      {(['default', 'brand', 'success', 'danger', 'warning', 'info'] as const).map(v => <Badge key={v} label={v} variant={v} />)}
    </div>
  ),
}
export const WithDot: Story = { args: { dot: true, variant: 'success', label: 'Online' } }
export const SizeL: Story = { args: { size: 'L' } }
export const SolidOnTintedSurface: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-8)', padding: 'var(--spacing-8)', background: 'var(--color-semantic-info-bg-light)', borderRadius: 'var(--shape-sheet)' }}>
      <Badge label="light (illisible ici)" variant="info" emphasis="light" />
      <Badge label="solid" variant="info" emphasis="solid" />
    </div>
  ),
}

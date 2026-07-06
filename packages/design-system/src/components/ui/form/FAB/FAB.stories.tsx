import type { Meta, StoryObj } from '@storybook/react'
import { Plus } from '@phosphor-icons/react'
import { FAB } from './FAB'

const meta: Meta<typeof FAB> = {
  title: 'DS.MD/Form/FAB',
  component: FAB,
  tags: ['autodocs'],
  args: { size: 'M', alpha: false, disabled: false },
  argTypes: {
    size: { control: 'radio', options: ['S', 'M', 'L'] },
    icon: { control: false },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-1043&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof FAB>

export const Default: Story = {}
export const WithIcon: Story = { args: { icon: <Plus size={24} /> } }
export const Small: Story = { args: { size: 'S' } }
export const Large: Story = { args: { size: 'L' } }
export const Alpha: Story = { args: { alpha: true } }
export const Disabled: Story = { args: { disabled: true } }

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12)' }}>
      <FAB size="S" />
      <FAB size="M" />
      <FAB size="L" />
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12)', flexWrap: 'wrap' }}>
      <FAB size="M" />
      <FAB size="M" alpha />
      <FAB size="M" disabled />
    </div>
  ),
}

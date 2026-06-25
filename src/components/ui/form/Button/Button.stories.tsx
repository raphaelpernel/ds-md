import type { Meta, StoryObj } from '@storybook/react'
import { Plus, ArrowRight } from '@phosphor-icons/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'DS.MD/Form/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=345-1158&m=dev',
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'danger', 'alpha'],
      description: 'Visual variant — see Button.design.md for usage rules',
    },
    size: {
      control: 'radio',
      options: ['L', 'M', 'S', 'XS'],
    },
    label:    { control: 'text' },
    loading:  { control: 'boolean' },
    disabled: { control: 'boolean' },
    lIcon:    { control: false },
    rIcon:    { control: false },
    iconOnly: { control: false },
  },
  args: {
    label: 'Button',
    size: 'L',
    variant: 'primary',
    loading: false,
    disabled: false,
  },
}
export default meta

type Story = StoryObj<typeof Button>

// ── Default stories by variant ──

export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Tertiary: Story = { args: { variant: 'tertiary' } }
export const Danger: Story = { args: { variant: 'danger' } }
export const Alpha: Story = { args: { variant: 'alpha' } }

// ── State stories ──

export const Loading: Story = { args: { variant: 'primary', loading: true } }
export const Disabled: Story = { args: { variant: 'primary', disabled: true } }

// ── Size stories ──

export const SizeLarge:   Story = { args: { size: 'L' } }
export const SizeMedium:  Story = { args: { size: 'M' } }
export const SizeSmall:   Story = { args: { size: 'S' } }
export const SizeXSmall:  Story = { args: { size: 'XS' } }

// ── Icon stories ──

export const WithLeftIcon: Story  = { args: { lIcon: <Plus size={16} /> } }
export const WithRightIcon: Story = { args: { rIcon: <ArrowRight size={16} /> } }
export const WithBothIcons: Story = { args: { lIcon: <Plus size={16} />, rIcon: <ArrowRight size={16} /> } }
export const IconOnly: Story      = { args: { iconOnly: <Plus size={16} />, label: 'Action' } }

// ── All variants grid ──

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24)' }}>
      {(['primary', 'secondary', 'tertiary', 'danger'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16)', flexWrap: 'wrap' }}>
          {(['L', 'M', 'S', 'XS'] as const).map((size) => (
            <Button key={size} variant={variant} size={size} label={`${variant} ${size}`} />
          ))}
          <Button variant={variant} size="L" label="Loading" loading />
          <Button variant={variant} size="L" label="Disabled" disabled />
        </div>
      ))}
    </div>
  ),
}

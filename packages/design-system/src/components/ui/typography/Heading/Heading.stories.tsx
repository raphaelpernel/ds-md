import type { Meta, StoryObj } from '@storybook/react'
import { Heading } from './Heading'

const meta: Meta<typeof Heading> = {
  title: 'DS.MD/Typography/Heading',
  component: Heading,
  tags: ['autodocs'],
  args: { size: 'lg', children: 'Qu\u2019est-ce qu\u2019on mange cette semaine ?' },
  argTypes: {
    size: { control: 'radio', options: ['xl', 'lg', 'md', 'sm'] },
    as: { control: false },
  },
}
export default meta
type Story = StoryObj<typeof Heading>

export const Default: Story = {}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
      <Heading size="xl">Heading XL</Heading>
      <Heading size="lg">Heading LG</Heading>
      <Heading size="md">Heading MD</Heading>
      <Heading size="sm">Heading SM</Heading>
    </div>
  ),
}

export const AsOverride: Story = {
  args: { size: 'sm', as: 'h2', children: 'Visuellement SM, sémantiquement h2' },
}

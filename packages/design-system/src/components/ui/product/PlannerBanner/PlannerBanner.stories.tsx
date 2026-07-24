import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { PlannerBanner } from './PlannerBanner'

const meta: Meta<typeof PlannerBanner> = {
  title: 'DS.MD/Product/Catalog/Planner Banner',
  component: PlannerBanner,
  tags: ['autodocs'],
  argTypes: {
    onCtaClick: { table: { disable: true } },
    onPeopleChange: { table: { disable: true } },
  },
  parameters: {
    layout: 'padded',
  },
}
export default meta
type Story = StoryObj<typeof PlannerBanner>

export const Default: Story = {
  name: 'Default — CTA fonctionnel, redirige vers le wizard planner',
  render: (args) => <PlannerBanner {...args} onCtaClick={() => alert('Navigation vers le wizard planner')} />,
}

export const ModeControle: Story = {
  name: 'Mode contrôlé — nombre de personnes piloté par le parent',
  render: (args) => {
    const [people, setPeople] = useState(4)
    return (
      <PlannerBanner
        {...args}
        peopleCount={people}
        onPeopleChange={setPeople}
        onCtaClick={() => alert('Navigation vers le wizard planner')}
      />
    )
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Stepper } from './Stepper'

const meta: Meta<typeof Stepper> = {
  title: 'DS.MD/Form/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: ['S', 'M'] },
    min: { control: 'number' },
    max: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: {
    value: 1,
    min: 0,
    max: 99,
    size: 'S',
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof Stepper>

function Controlled(props: Partial<React.ComponentProps<typeof Stepper>>) {
  const [v, setV] = useState(props.value ?? 1)
  return <Stepper {...props} value={v} onChange={setV} />
}

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
}

export const SizeM: Story = {
  render: (args) => <Controlled {...args} size="M" value={3} />,
}

export const AtMin: Story = {
  render: (args) => <Controlled {...args} value={0} min={0} />,
  name: 'À la valeur minimum',
}

export const AtMax: Story = {
  render: (args) => <Controlled {...args} value={99} max={99} />,
  name: 'À la valeur maximum',
}

export const Disabled: Story = {
  render: (args) => <Controlled {...args} disabled />,
}

export const InCarrefourContext: Story = {
  render: (args) => (
    <div data-partner="carrefour">
      <Controlled {...args} value={2} />
    </div>
  ),
  name: 'Contexte Carrefour (bleu)',
}

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from './Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'DS.MD/Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: { page: 1, pageCount: 5 },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=375-581&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Pagination>

export const Default: Story = {
  render: (args) => {
    const [p, setP] = useState(1)
    return <Pagination {...args} page={p} onChange={setP} />
  }
}

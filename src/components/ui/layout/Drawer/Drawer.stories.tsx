import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Drawer } from './Drawer'
import { Button } from '../../form/Button/Button'
const meta: Meta<typeof Drawer> = {
  title: 'DS.MD/Layout/Drawer', component: Drawer, tags: ['autodocs'],
  args: { title: 'Drawer title', placement: 'right', open: false },
  argTypes: { placement: { control: 'radio', options: ['right', 'left', 'bottom'] } },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=381-442&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Drawer>
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button label="Open drawer" onClick={() => setOpen(true)} />
        <Drawer {...args} open={open} onClose={() => setOpen(false)} footer={<Button label="Apply" onClick={() => setOpen(false)} />}>
          <p>Drawer content goes here.</p>
        </Drawer>
      </>
    )
  }
}

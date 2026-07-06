import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Modal } from './Modal'
import { Button } from '../../form/Button/Button'

const meta: Meta<typeof Modal> = {
  title: 'DS.MD/Feedback/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: { title: 'Modal title', size: 'M', open: false },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=334-715&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Modal>

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button label="Open modal" onClick={() => setOpen(true)} />
        <Modal {...args} open={open} onClose={() => setOpen(false)} footer={<><Button variant="tertiary" label="Cancel" onClick={() => setOpen(false)} /><Button label="Confirm" /></>}>
          <p>Modal body content goes here.</p>
        </Modal>
      </>
    )
  }
}

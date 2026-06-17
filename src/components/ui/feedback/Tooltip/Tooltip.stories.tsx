import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'
import { Button } from '../../form/Button/Button'
const meta: Meta<typeof Tooltip> = {
  title: 'DS.MD/Feedback/Tooltip', component: Tooltip, tags: ['autodocs'],
  args: { content: 'Tooltip content', placement: 'top' },
  argTypes: { placement: { control: 'radio', options: ['top', 'bottom', 'left', 'right'] } },
  decorators: [(Story) => <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Story /></div>],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=334-622&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Tooltip>
export const Default: Story = { render: (args) => <Tooltip {...args}><Button label="Hover me" /></Tooltip> }

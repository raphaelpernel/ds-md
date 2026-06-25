import type { Meta, StoryObj } from '@storybook/react'
import { House, ArrowUpRight } from '@phosphor-icons/react'
import { Link } from './Link'

const meta: Meta<typeof Link> = {
  title: 'DS.MD/Navigation/Link', component: Link, tags: ['autodocs'],
  args: { children: 'See recipe', href: '#', size: 'MD' },
  argTypes: {
    size:  { control: 'radio', options: ['LG', 'MD', 'SM'] },
    lIcon: { control: false },
    rIcon: { control: false },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=325-619&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Link>
export const Default: Story = {}
export const WithLeftIcon: Story  = { args: { lIcon: <House size={16} /> } }
export const WithRightIcon: Story = { args: { rIcon: <ArrowUpRight size={16} /> } }
export const WithBothIcons: Story = { args: { lIcon: <House size={16} />, rIcon: <ArrowUpRight size={16} /> } }

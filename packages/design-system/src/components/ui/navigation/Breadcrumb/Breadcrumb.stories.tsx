import type { Meta, StoryObj } from '@storybook/react'
import { House, BookOpen, ForkKnife } from '@phosphor-icons/react'
import { Breadcrumb } from './Breadcrumb'

const meta: Meta<typeof Breadcrumb> = {
  title: 'DS.MD/Navigation/Breadcrumb', component: Breadcrumb, tags: ['autodocs'],
  args: {
    items: [
      { label: 'Home', href: '/', icon: <House size={14} /> },
      { label: 'Recipes', href: '/recipes', icon: <BookOpen size={14} /> },
      { label: 'Pasta Carbonara', icon: <ForkKnife size={14} /> },
    ],
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=375-410&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Breadcrumb>
export const Default: Story = {}
export const WithoutIcons: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Recipes', href: '/recipes' },
      { label: 'Pasta Carbonara' },
    ],
  },
}

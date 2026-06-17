import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './Avatar'
const meta: Meta<typeof Avatar> = {
  title: 'DS.MD/Display/Avatar', component: Avatar, tags: ['autodocs'],
  args: { initials: 'JD', size: 'M', shape: 'circle' },
  argTypes: { size: { control: 'radio', options: ['XS', 'S', 'M', 'L', 'XL'] }, shape: { control: 'radio', options: ['circle', 'square'] } },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=335-638&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof Avatar>
export const Initials: Story = {}
export const WithImage: Story = { args: { src: 'https://i.pravatar.cc/80', alt: 'Jane Doe' } }
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12)' }}>
      {(['XS', 'S', 'M', 'L', 'XL'] as const).map(s => <Avatar key={s} size={s} initials="JD" />)}
    </div>
  ),
}

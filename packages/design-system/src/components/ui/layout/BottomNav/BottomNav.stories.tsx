import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { BottomNav, type BottomNavTab } from './BottomNav'

const meta: Meta<typeof BottomNav> = {
  title: 'DS.MD/Layout/Bottom Nav',
  component: BottomNav,
  tags: ['autodocs'],
  args: {
    activeTab: 'home',
    accountLabel: 'John',
  },
  argTypes: {
    activeTab: {
      control: 'radio',
      options: ['home', 'aisles', 'recipes', 'favorites', 'account'],
    },
    onTabChange: { table: { disable: true } },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/QC58e6IUcVmrBndbmacDxv/Mealz-DS--DS?node-id=266-2331',
    },
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 200 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof BottomNav>

export const Home: Story = { args: { activeTab: 'home' } }
export const Aisles: Story = { args: { activeTab: 'aisles' } }
export const Recipes: Story = { args: { activeTab: 'recipes' } }
export const Favorites: Story = { args: { activeTab: 'favorites' } }
export const Account: Story = { args: { activeTab: 'account' } }

export const Interactive: Story = {
  name: 'Cas d’usage — onglet piloté par l’état',
  render: (args) => {
    const [tab, setTab] = useState<BottomNavTab>(args.activeTab)
    return <BottomNav {...args} activeTab={tab} onTabChange={setTab} />
  },
}

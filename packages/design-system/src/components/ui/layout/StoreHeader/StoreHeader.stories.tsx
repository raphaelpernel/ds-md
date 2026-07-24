import type { Meta, StoryObj } from '@storybook/react'
import { StoreHeader } from './StoreHeader'

const meta: Meta<typeof StoreHeader> = {
  title: 'DS.MD/Layout/Store Header',
  component: StoreHeader,
  tags: ['autodocs'],
  args: {
    platform: 'Desktop',
    storeName: 'SUPAMRKT',
    userName: 'Joe',
    cartCount: 0,
    cartTotal: 0,
  },
  argTypes: {
    platform: { control: 'radio', options: ['Desktop', 'Mobile', 'App'] },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/QC58e6IUcVmrBndbmacDxv/Mealz-DS--DS?node-id=111-4078',
    },
    layout: 'fullscreen',
  },
}
export default meta
type Story = StoryObj<typeof StoreHeader>

export const Desktop: Story = {
  args: { platform: 'Desktop' },
}

export const Mobile: Story = {
  name: 'Mobile — web condensé',
  args: { platform: 'Mobile' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const App: Story = {
  name: 'App — mobile native',
  args: { platform: 'App' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const WithCart: Story = {
  name: 'Cas d’usage — panier non vide',
  args: { platform: 'Desktop', cartCount: 3, cartTotal: 12.4 },
}

import type { Meta, StoryObj } from '@storybook/react'
import { CatalogNavigation } from './CatalogNavigation'

const meta: Meta<typeof CatalogNavigation> = {
  title: 'DS.MD/Product/Catalog/Catalog Navigation',
  component: CatalogNavigation,
  tags: ['autodocs'],
  args: {
    filterCount: 3,
    preferencesCount: 3,
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/e8BpuLovSPh0SPseTl29tA/Catalog?node-id=4712-35838',
    },
  },
}
export default meta
type Story = StoryObj<typeof CatalogNavigation>

export const Default: Story = {}

export const WithoutCounts: Story = {
  name: 'Sans badges de compte',
  args: { filterCount: undefined, preferencesCount: undefined },
}

export const CustomPromo: Story = {
  name: 'Promo personnalisée',
  args: { promoLabel: '-30%', promoHref: '/collections/promo' },
}

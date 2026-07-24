import type { Meta, StoryObj } from '@storybook/react'
import { Gear, Heart, MagnifyingGlass, SlidersHorizontal, Tag } from '@phosphor-icons/react'
import { CatalogNavigationItem } from './CatalogNavigationItem'

const meta: Meta<typeof CatalogNavigationItem> = {
  title: 'DS.MD/Product/Catalog/Catalog Navigation Item',
  component: CatalogNavigationItem,
  tags: ['autodocs'],
  args: {
    icon: <SlidersHorizontal size={20} aria-hidden="true" />,
    label: 'Filtrer',
  },
  argTypes: {
    tone: { control: 'radio', options: ['default', 'promo'] },
    icon: { table: { disable: true } },
    href: { control: 'text' },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/e8BpuLovSPh0SPseTl29tA/Catalog?node-id=4712-35838',
    },
  },
}
export default meta
type Story = StoryObj<typeof CatalogNavigationItem>

export const AsButton: Story = {
  name: 'Bouton — action en place (ex. Filtrer)',
  args: { icon: <SlidersHorizontal size={20} aria-hidden="true" />, label: 'Filtrer', count: 3 },
}

export const AsLink: Story = {
  name: 'Lien — navigation (ex. Mon carnet)',
  args: { icon: <Heart size={20} aria-hidden="true" />, label: 'Mon carnet', href: '#' },
}

export const IconOnly: Story = {
  name: 'Icône seule (ex. Search)',
  args: { icon: <MagnifyingGlass size={20} weight="bold" aria-hidden="true" />, label: undefined, ariaLabel: 'Rechercher' },
}

export const WithCount: Story = {
  name: 'Avec badge de compte (ex. Préférences)',
  args: { icon: <Gear size={20} aria-hidden="true" />, label: undefined, count: 3, ariaLabel: 'Préférences' },
}

export const Promo: Story = {
  name: 'Tone — Promo',
  args: { icon: <Tag size={20} weight="fill" aria-hidden="true" />, label: 'Promo’', tone: 'promo', href: '#' },
}

export const Row: Story = {
  name: 'Cas d’usage — rangée complète',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-8)' }}>
      <CatalogNavigationItem icon={<MagnifyingGlass size={20} weight="bold" aria-hidden="true" />} ariaLabel="Rechercher" />
      <CatalogNavigationItem icon={<Tag size={20} weight="fill" aria-hidden="true" />} label="Promo’" tone="promo" href="#" />
      <CatalogNavigationItem icon={<Heart size={20} aria-hidden="true" />} label="Mon carnet" href="#" />
      <CatalogNavigationItem icon={<SlidersHorizontal size={20} aria-hidden="true" />} label="Filtrer" count={3} />
      <CatalogNavigationItem icon={<Gear size={20} aria-hidden="true" />} count={3} ariaLabel="Préférences" />
    </div>
  ),
}

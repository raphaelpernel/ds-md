import type { Meta, StoryObj } from '@storybook/react'
import { PromoSection } from './PromoSection'
import { ProductCard } from '../ProductCard/ProductCard'
import { PROMO_PRODUCTS } from '../../../data/mock/products'

const meta: Meta<typeof PromoSection> = {
  title: 'DS.MD/Product/PromoSection',
  component: PromoSection,
  tags: ['autodocs'],
  args: {
    products: PROMO_PRODUCTS,
    onAdd: () => {},
    onViewAll: () => {},
  },
  argTypes: {
    products: { control: false },
    onAdd: { control: false },
    onViewAll: { control: false },
  },
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=461-211&m=dev',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '390px', padding: 'var(--spacing-16)' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PromoSection>

export const Default: Story = {
  name: 'Promos du moment',
}

export const SansLienVoirTout: Story = {
  name: 'Sans lien "Voir tout"',
  args: {
    onViewAll: undefined,
  },
}

export const PromoListView: Story = {
  name: 'Vue liste promotions (pleine largeur)',
  render: () => (
    <div style={{ maxWidth: '390px', padding: 'var(--spacing-16)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-heading-sm)', fontWeight: 'var(--font-weight-heading)', lineHeight: 'var(--line-height-heading-sm)', color: 'var(--color-content-default)' }}>
          Promos du moment
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
        {PROMO_PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            orientation="horizontal"
            onAdd={() => {}}
          />
        ))}
      </div>
    </div>
  ),
}

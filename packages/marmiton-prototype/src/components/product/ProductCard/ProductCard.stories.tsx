import type { Meta, StoryObj } from '@storybook/react'
import { ProductCard } from './ProductCard'
import type { Product } from '../../../data/types/product'

const baseProduct: Product = {
  id: 'p-emmental-rape',
  name: 'Emmental râpé',
  brand: 'Président',
  emoji: '🧀',
  price: 1.96,
  pricePerUnit: '9,80 €/kg',
  unit: '200 g',
  available: true,
}

const promoProduct: Product = {
  ...baseProduct,
  promo: { percent: 30, originalPrice: 2.80 },
}

const unavailableProduct: Product = {
  ...baseProduct,
  id: 'p-unavailable',
  name: 'Yaourts nature x8',
  brand: 'Danone',
  emoji: '🥛',
  unit: '8 pièces',
  price: 1.80,
  pricePerUnit: '0,23 €/pièce',
  available: false,
  promo: { percent: 25, originalPrice: 2.40 },
}

const meta: Meta<typeof ProductCard> = {
  title: 'DS.MD/Product/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  args: {
    product: promoProduct,
    orientation: 'vertical',
    onAdd: () => {},
  },
  argTypes: {
    context: {
      control: 'radio',
      options: ['catalog', 'cart'],
      description: 'Contexte d\'usage — catalogue (défaut) ou panier',
    },
    orientation: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
      description: 'Disposition — vertical (grille) ou horizontal (liste, Figma 2 lignes)',
    },
    onAdd: { control: false },
    onQuantityChange: { control: false },
    onRemove: { control: false },
    onReplace: { control: false },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=461-211&m=dev',
    },
  },
}

export default meta
type Story = StoryObj<typeof ProductCard>

// ── Vertical ──────────────────────────────────────────────────

export const VerticalDefault: Story = {
  name: 'Vertical — Sans promo',
  args: {
    product: baseProduct,
    orientation: 'vertical',
  },
  decorators: [(Story) => <div style={{ width: 'fit-content' }}><Story /></div>],
}

export const VerticalWithPromo: Story = {
  name: 'Vertical — Avec badge promo',
  args: {
    product: promoProduct,
    orientation: 'vertical',
  },
  decorators: [(Story) => <div style={{ width: 'fit-content' }}><Story /></div>],
}

export const VerticalUnavailable: Story = {
  name: 'Vertical — Indisponible',
  args: {
    product: { ...promoProduct, available: false },
    orientation: 'vertical',
  },
  decorators: [(Story) => <div style={{ width: 'fit-content' }}><Story /></div>],
}

// ── Horizontal ─────────────────────────────────────────────────

export const HorizontalDefault: Story = {
  name: 'Horizontal — Sans promo',
  args: {
    product: baseProduct,
    orientation: 'horizontal',
  },
}

export const HorizontalWithPromo: Story = {
  name: 'Horizontal — Avec badge promo',
  args: {
    product: promoProduct,
    orientation: 'horizontal',
  },
}

export const HorizontalUnavailable: Story = {
  name: 'Horizontal — Indisponible',
  args: {
    product: unavailableProduct,
    orientation: 'horizontal',
  },
}

// ── All variants ───────────────────────────────────────────────

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p-s1',
    name: 'Emmental râpé',
    brand: 'Président',
    emoji: '🧀',
    price: 1.96,
    pricePerUnit: '9,80 €/kg',
    unit: '200 g',
    available: true,
    promo: { percent: 30, originalPrice: 2.80 },
  },
  {
    id: 'p-s2',
    name: 'Yaourts nature x8',
    brand: 'Danone',
    emoji: '🥛',
    price: 1.80,
    pricePerUnit: '0,23 €/pièce',
    unit: '8 pièces',
    available: true,
    promo: { percent: 25, originalPrice: 2.40 },
  },
  {
    id: 'p-s3',
    name: "Huile d'olive vierge",
    brand: 'Puget',
    emoji: '🫒',
    price: 5.20,
    pricePerUnit: '6,93 €/L',
    unit: '75 cl',
    available: true,
    promo: { percent: 20, originalPrice: 6.50 },
  },
  {
    id: 'p-s4',
    name: 'Spaghetti n°5',
    brand: 'Barilla',
    emoji: '🍝',
    price: 0.89,
    pricePerUnit: '1,78 €/kg',
    unit: '500 g',
    available: true,
  },
]

export const AllVertical: Story = {
  name: 'All — Grille verticale',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-12)' }}>
      {SAMPLE_PRODUCTS.map((p) => (
        <ProductCard key={p.id} product={p} orientation="vertical" onAdd={() => {}} />
      ))}
    </div>
  ),
}

export const AllHorizontal: Story = {
  name: 'All — Liste horizontale',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)', maxWidth: '400px' }}>
      {SAMPLE_PRODUCTS.map((p) => (
        <ProductCard key={p.id} product={p} orientation="horizontal" onAdd={() => {}} />
      ))}
    </div>
  ),
}

// ── Cart ───────────────────────────────────────────────────────

const cartProduct: Product = {
  id: 'p-pate-feuil',
  name: 'Pâte feuilletée pur beurre',
  brand: 'Herta',
  emoji: '🥐',
  price: 2.45,
  pricePerUnit: '2,45 €/pièce',
  unit: 'pièce',
  available: true,
}

export const CartDefault: Story = {
  name: 'Cart — Item',
  args: {
    context: 'cart',
    product: cartProduct,
    quantity: 1,
    onQuantityChange: () => {},
    onRemove: () => {},
    onReplace: () => {},
  },
  decorators: [(Story) => <div style={{ maxWidth: '400px', border: '1px solid var(--color-border-weak)', borderRadius: 'var(--shape-card)', overflow: 'hidden' }}><Story /></div>],
}

const CART_PRODUCTS: Product[] = [
  cartProduct,
  {
    id: 'p-abricots',
    name: 'Abricots bien mûrs',
    brand: 'Intermarché',
    emoji: '🍑',
    price: 3.99,
    pricePerUnit: '3,99 €/kg',
    unit: '500 g',
    available: true,
  },
  {
    id: 'p-beurre',
    name: 'Beurre doux',
    brand: 'Président',
    emoji: '🧈',
    price: 2.10,
    pricePerUnit: '8,40 €/kg',
    unit: '250 g',
    available: true,
  },
]

export const CartList: Story = {
  name: 'Cart — Liste panier',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', border: '1px solid var(--color-border-weak)', borderRadius: 'var(--shape-card)', overflow: 'hidden' }}>
      {CART_PRODUCTS.map((p, i) => (
        <ProductCard
          key={p.id}
          context="cart"
          product={p}
          quantity={i === 0 ? 2 : 1}
          onQuantityChange={() => {}}
          onRemove={() => {}}
          onReplace={() => {}}
        />
      ))}
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import { ChipTag } from './ChipTag'

const meta: Meta<typeof ChipTag> = {
  title: 'DS.MD/Display/Chip Tag',
  component: ChipTag,
  tags: ['autodocs'],
  args: { label: 'Tag', type: 'neutral-filled', size: 'M' },
  argTypes: {
    type: {
      control: 'select',
      options: ['filled', 'toned', 'neutral-filled', 'neutral-outline', 'alpha'],
      description: [
        '**filled** — Filtre actif/sélectionné',
        '**toned** — Usage contextuel libre',
        '**neutral-filled** — Tag statique sur fond clair',
        '**neutral-outline** — Tag sur recette, non cliquable',
        '**alpha** — Sur image uniquement',
      ].join('<br/>'),
    },
    category: {
      control: 'select',
      options: [undefined, 'promo', 'new', 'healthy', 'express', 'low-cost'],
      description: 'Tag produit / merchandising — remplace `type` quand défini',
    },
    appearance: {
      control: 'radio',
      options: ['solid', 'toned'],
      description: 'Solid (sur image) ou toned (sur fond clair) — avec `category` uniquement',
    },
    size: {
      control: 'radio',
      options: ['L', 'M', 'S'],
    },
    label:    { control: 'text' },
    icon:     { control: false },
    selected: { table: { disable: true } },
    disabled: { table: { disable: true } },
    onRemove: { table: { disable: true } },
    onClick:  { table: { disable: true } },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ES4RxHAafQbIwWLTzHnyFF/DS.MD?node-id=380-430&m=dev',
    },
  },
}
export default meta
type Story = StoryObj<typeof ChipTag>

/* ── 5 types — tous en taille M (défaut) ── */

export const NeutralOutline: Story = {
  name: 'Neutral Outline — filtre inactif',
  args: { type: 'neutral-outline', label: 'Végétarien', onClick: () => {} },
}

export const NeutralFilled: Story = {
  name: 'Neutral Filled — tag statique',
  args: { type: 'neutral-filled', label: 'Express' },
}

export const Filled: Story = {
  name: 'Filled — filtre sélectionné',
  args: { type: 'filled', label: 'Végétarien', onClick: () => {} },
}

export const Toned: Story = {
  name: 'Toned — usage contextuel',
  args: { type: 'toned', label: 'Nouveau' },
}

export const Alpha: Story = {
  name: 'Alpha — sur image',
  args: { type: 'alpha', label: '20 min' },
  decorators: [
    (Story) => (
      <div style={{
        background: 'linear-gradient(135deg, #4a5568, #2d3748)',
        padding: '24px',
        borderRadius: '12px',
        display: 'inline-flex',
      }}>
        <Story />
      </div>
    ),
  ],
}

/* ── Toutes les tailles ── */
export const Sizes: Story = {
  name: 'Tailles — L / M / S',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)' }}>
      <ChipTag type="neutral-outline" size="L" label="Large" />
      <ChipTag type="neutral-outline" size="M" label="Medium" />
      <ChipTag type="neutral-outline" size="S" label="Small" />
    </div>
  ),
}

/* ── Cas d'usage : barre de filtres ── */
export const FilterBar: Story = {
  name: 'Cas d\'usage — barre de filtres',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-8)' }}>
      <ChipTag type="filled"          size="M" label="Tous"        onClick={() => {}} />
      <ChipTag type="neutral-outline" size="M" label="Végétarien"  onClick={() => {}} />
      <ChipTag type="neutral-outline" size="M" label="Sans gluten" onClick={() => {}} />
      <ChipTag type="neutral-outline" size="M" label="Express"     onClick={() => {}} />
    </div>
  ),
}

/* ── Cas d'usage : tags sur une recette ── */
export const RecipeTags: Story = {
  name: 'Cas d\'usage — tags recette',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
      <ChipTag type="neutral-filled" size="S" label="Végétarien" />
      <ChipTag type="neutral-filled" size="S" label="Sans gluten" />
      <ChipTag type="neutral-filled" size="S" label="20 min" />
    </div>
  ),
}

/* ── Tags produit / merchandising (category) ── */

export const CategoryPromoSolid: Story = {
  name: 'Category — Promo (solid)',
  args: { category: 'promo', appearance: 'solid', size: 'S', label: '-30%' },
}

export const CategoryPromoToned: Story = {
  name: 'Category — Promo (toned)',
  args: { category: 'promo', appearance: 'toned', size: 'S', label: 'Promo' },
}

export const AllCategories: Story = {
  name: 'Category — Toutes les catégories',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)' }}>
        {(['promo', 'new', 'healthy', 'express', 'low-cost'] as const).map((category) => (
          <ChipTag key={category} category={category} appearance="solid" size="S" label={category} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)' }}>
        {(['promo', 'new', 'healthy', 'express', 'low-cost'] as const).map((category) => (
          <ChipTag key={category} category={category} appearance="toned" size="S" label={category} />
        ))}
      </div>
    </div>
  ),
}

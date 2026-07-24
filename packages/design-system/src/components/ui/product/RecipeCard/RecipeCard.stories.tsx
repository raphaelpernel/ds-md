import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { RecipeCard } from './RecipeCard'

const meta: Meta<typeof RecipeCard> = {
  title: 'DS.MD/Product/Recipe Card',
  component: RecipeCard,
  tags: ['autodocs'],
  args: {
    title: 'Poulet rôti aux légumes de saison',
    imageUrl: 'https://www.themealdb.com/images/media/meals/sypxpx1515365095.jpg',
    guests: 4,
    price: 3.5,
  },
  argTypes: {
    size: { control: 'radio', options: ['default', 'small'] },
    imageUrl: { control: 'text' },
    onClick: { table: { disable: true } },
    onFavoriteToggle: { table: { disable: true } },
    onAddToggle: { table: { disable: true } },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/YDFZDIbtM9w9F5pWftkbUR/Recipes?node-id=378-53604',
    },
  },
}
export default meta
type Story = StoryObj<typeof RecipeCard>

export const Default: Story = {
  name: 'Default — Desktop / Catalog',
}

export const MealIdea: Story = {
  name: 'Badge — Idée repas (rayon uniquement)',
  args: { mealIdea: true },
}

export const Promo: Story = {
  name: 'Badge — Promo',
  args: { promo: true },
}

export const Sponsor: Story = {
  name: 'Badge — Sponsor',
  args: {
    sponsor: { logoUrl: 'https://www.themealdb.com/images/ingredients/Nutella.png', label: 'Nutella' },
  },
}

export const AllBadges: Story = {
  name: 'Tous les badges combinés',
  args: {
    mealIdea: true,
    promo: true,
    sponsor: { logoUrl: 'https://www.themealdb.com/images/ingredients/Nutella.png', label: 'Nutella' },
  },
}

export const Loading: Story = {
  name: 'État — Loading (skeleton)',
  args: { loading: true },
}

export const Favorite: Story = {
  name: 'État — Favori',
  render: (args) => {
    const [favorite, setFavorite] = useState(true)
    return <RecipeCard {...args} favorite={favorite} onFavoriteToggle={() => setFavorite((v) => !v)} />
  },
}

export const Added: Story = {
  name: 'État — Déjà ajoutée au panier',
  render: (args) => {
    const [added, setAdded] = useState(true)
    return <RecipeCard {...args} added={added} onAddToggle={() => setAdded((v) => !v)} />
  },
}

export const Interactive: Story = {
  name: 'Cas d’usage — favori + panier interactifs',
  render: (args) => {
    const [favorite, setFavorite] = useState(false)
    const [added, setAdded] = useState(false)
    return (
      <RecipeCard
        {...args}
        favorite={favorite}
        onFavoriteToggle={() => setFavorite((v) => !v)}
        added={added}
        onAddToggle={() => setAdded((v) => !v)}
      />
    )
  },
}

export const Collection: Story = {
  name: 'Cas d’usage — grille de collection',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-16)', flexWrap: 'wrap' }}>
      <RecipeCard
        title="Poulet rôti aux légumes de saison"
        imageUrl="https://www.themealdb.com/images/media/meals/sypxpx1515365095.jpg"
        guests={4}
        price={3.5}
      />
      <RecipeCard
        title="Saumon rôti au fenouil et tomates"
        imageUrl="https://www.themealdb.com/images/media/meals/1548772327.jpg"
        guests={2}
        price={5.2}
        promo
      />
      <RecipeCard
        title="Tacos de poisson épicés"
        imageUrl="https://www.themealdb.com/images/media/meals/uvuyxu1503067369.jpg"
        guests={4}
        price={2.9}
        loading
      />
    </div>
  ),
}

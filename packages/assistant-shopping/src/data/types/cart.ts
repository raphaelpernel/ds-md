export interface CartProductItem {
  productId: string
  quantity: number
  /** Nom de la recette dont ce produit est un ingrédient, si ajouté via une recette
   *  (`basket.add_recipe` ajoute les ingrédients, pas une entrée "recette" à part —
   *  cf. `docs/docs/02-parcours-recettes.md`, Étape 4). */
  recipeTag?: string
}

export interface CartState {
  products: CartProductItem[]
}

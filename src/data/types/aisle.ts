export interface SubAisle {
  id: string
  label: string
  productIds: string[]
}

export interface Aisle {
  id: string
  label: string
  emoji: string
  subAisles?: SubAisle[]
  productIds?: string[]
}

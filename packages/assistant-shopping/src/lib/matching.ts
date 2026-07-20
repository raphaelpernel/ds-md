/**
 * Reconnaissance par mots-clés partagée entre l'interprétation du chat (`nlu.ts`) et
 * la résolution des ingrédients d'une recette en produits réels (`recipeProducts.ts`).
 * Pas de compréhension sémantique fine — fidèle au comportement MVP documenté
 * (recherche par mots-clés, cf. `docs/docs/01-contexte-produit.md`).
 */

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(normalize(n)))
}

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9-]+/)
    .filter((t) => t.length > 2)
}

export function scoreByTags<T extends { tags: string[] }>(items: T[], tokens: string[]): T[] {
  const scored = items
    .map((item) => {
      const itemTags = item.tags.map(normalize)
      const score = tokens.reduce((acc, token) => acc + (itemTags.some((tag) => tag.includes(token) || token.includes(tag)) ? 1 : 0), 0)
      return { item, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.map((s) => s.item)
}

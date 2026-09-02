export interface SupermarketRoutes {
  home: string
  collection: string
  planner: string
}

export function supermarketRoutes(basePath: string): SupermarketRoutes {
  const base = `/${basePath.replace(/^\/+|\/+$/g, '')}`
  return { home: base, collection: `${base}/collections/:slug`, planner: `${base}/planner` }
}
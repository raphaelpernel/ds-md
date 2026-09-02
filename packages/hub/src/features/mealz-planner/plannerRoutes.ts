export type PlannerRoute = 'home' | 'people' | 'meals' | 'equipment' | 'diet' | 'results'

export function plannerPath(basePath: string, route: Exclude<PlannerRoute, 'home'> | PlannerRoute): string {
  const base = `/${basePath.replace(/^\/+|\/+$/g, '')}`
  return route === 'home' ? base : base === '/' ? `/${route}` : `${base}/${route}`
}

export function plannerRoutes(basePath: string): Record<PlannerRoute, string> {
  return {
    home: plannerPath(basePath, 'home'),
    people: plannerPath(basePath, 'people'),
    meals: plannerPath(basePath, 'meals'),
    equipment: plannerPath(basePath, 'equipment'),
    diet: plannerPath(basePath, 'diet'),
    results: plannerPath(basePath, 'results'),
  }
}

import { describe, expect, it } from 'vitest'
import { plannerPath, plannerRoutes } from './plannerRoutes'

describe('planner routes', () => {
  it.each(['/neutral/form-mealz-planner', '/neutral/weekly-planner'])('builds every route for %s', (basePath) => {
    expect(plannerRoutes(basePath)).toEqual({
      home: basePath,
      people: `${basePath}/people`,
      meals: `${basePath}/meals`,
      equipment: `${basePath}/equipment`,
      diet: `${basePath}/diet`,
      results: `${basePath}/results`,
    })
  })

  it('builds an individual route without duplicate slashes', () => {
    expect(plannerPath('/neutral/form-mealz-planner/', 'results')).toBe('/neutral/form-mealz-planner/results')
  })

  it('builds root routes without duplicate slashes', () => {
    expect(plannerPath('/', 'people')).toBe('/people')
  })
})

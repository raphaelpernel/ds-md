import type { Store } from '../types/store'

export const MOCK_STORES: Store[] = [
  { id: 'store-asnieres', name: 'Carrefour Drive Asnières-sur-Seine', address: '12 rue de la République', city: 'Asnières-sur-Seine', postalCode: '92600', distance: 1.2, openingHours: '8h-20h', drive: true, delivery: false },
  { id: 'store-clichy', name: 'Carrefour Market Clichy', address: '5 avenue de Verdun', city: 'Clichy', postalCode: '92110', distance: 3.4, openingHours: '9h-19h30', drive: false, delivery: true },
]

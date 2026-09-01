import type { TimeslotDay } from '../types/timeslot'

export const MOCK_TIMESLOT_DAYS: TimeslotDay[] = [
  {
    date: '2026-06-20',
    label: 'Demain · Ven 20',
    slots: [
      { id: 'ts-1', date: '2026-06-20', startTime: '08:00', endTime: '10:00', available: true,  price: 0 },
      { id: 'ts-2', date: '2026-06-20', startTime: '10:00', endTime: '12:00', available: true,  price: 0 },
      { id: 'ts-3', date: '2026-06-20', startTime: '12:00', endTime: '14:00', available: false, price: 0 },
      { id: 'ts-4', date: '2026-06-20', startTime: '14:00', endTime: '16:00', available: true,  price: 0 },
      { id: 'ts-5', date: '2026-06-20', startTime: '16:00', endTime: '18:00', available: true,  price: 3.99 },
      { id: 'ts-6', date: '2026-06-20', startTime: '18:00', endTime: '20:00', available: true,  price: 3.99 },
    ],
  },
  {
    date: '2026-06-21',
    label: 'Sam 21',
    slots: [
      { id: 'ts-7',  date: '2026-06-21', startTime: '08:00', endTime: '10:00', available: true,  price: 0 },
      { id: 'ts-8',  date: '2026-06-21', startTime: '10:00', endTime: '12:00', available: true,  price: 0 },
      { id: 'ts-9',  date: '2026-06-21', startTime: '12:00', endTime: '14:00', available: true,  price: 0 },
      { id: 'ts-10', date: '2026-06-21', startTime: '14:00', endTime: '16:00', available: false, price: 0 },
      { id: 'ts-11', date: '2026-06-21', startTime: '16:00', endTime: '18:00', available: false, price: 3.99 },
      { id: 'ts-12', date: '2026-06-21', startTime: '18:00', endTime: '20:00', available: true,  price: 3.99 },
    ],
  },
  {
    date: '2026-06-23',
    label: 'Lun 23',
    slots: [
      { id: 'ts-13', date: '2026-06-23', startTime: '08:00', endTime: '10:00', available: true,  price: 0 },
      { id: 'ts-14', date: '2026-06-23', startTime: '10:00', endTime: '12:00', available: true,  price: 0 },
      { id: 'ts-15', date: '2026-06-23', startTime: '12:00', endTime: '14:00', available: true,  price: 0 },
      { id: 'ts-16', date: '2026-06-23', startTime: '14:00', endTime: '16:00', available: true,  price: 0 },
      { id: 'ts-17', date: '2026-06-23', startTime: '16:00', endTime: '18:00', available: true,  price: 3.99 },
      { id: 'ts-18', date: '2026-06-23', startTime: '18:00', endTime: '20:00', available: true,  price: 3.99 },
    ],
  },
]

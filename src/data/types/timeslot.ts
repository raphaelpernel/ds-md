export interface Timeslot {
  id: string
  date: string
  startTime: string
  endTime: string
  available: boolean
  price: number
}

export interface TimeslotDay {
  date: string
  label: string
  slots: Timeslot[]
}

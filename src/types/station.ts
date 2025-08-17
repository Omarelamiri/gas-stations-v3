export interface Coordinates {
  lat: number
  lng: number
}

export interface GasStation {
  id: string
  name: string
  address: string
  price: number
  coordinates: Coordinates
  createdAt: Date
  updatedAt: Date
}
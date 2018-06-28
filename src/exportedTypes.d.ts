interface Lease extends Doc {
  rent: number
  balance: number
  tenants: { [id: string]: { exists: boolean; name: string } }
  units: { [id: string]: { exists: boolean; address: string } }
  properties: { [id: string]: { exists: boolean; name: string } }
  startDate?: string
  endDate?: string
  status: string
}

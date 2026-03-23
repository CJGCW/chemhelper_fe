import client from './client'
import type { Element } from '../types'

interface RawElement {
  atomic_number: number
  symbol: string
  name: string
  atomic_weight: string
  electronegativity: number
  van_der_waals_radius_pm: number
  group: number
  period: number
  group_name: string
}

function toElement(raw: RawElement): Element {
  return {
    atomicNumber: raw.atomic_number,
    symbol: raw.symbol,
    name: raw.name,
    atomicWeight: raw.atomic_weight,
    electronegativity: raw.electronegativity,
    vanDerWaalsRadiusPm: raw.van_der_waals_radius_pm,
    group: raw.group,
    period: raw.period,
    groupName: raw.group_name,
  }
}

export async function fetchAllElements(): Promise<Element[]> {
  const { data } = await client.get<RawElement[]>('/elements')
  return data.map(toElement)
}

export async function fetchElement(symbol: string): Promise<Element> {
  const { data } = await client.get<RawElement>(`/elements/${symbol}`)
  return toElement(data)
}

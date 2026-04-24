/** Vapor pressure of water (mmHg) as a function of Celsius temperature.
 *  Values from CRC Handbook, matching Chang Table 5.3. */
export const WATER_VAPOR_PRESSURE_MMHG: Record<number, number> = {
  0:   4.6,
  5:   6.5,
  10:  9.2,
  15:  12.8,
  20:  17.5,
  21:  18.6,
  22:  19.8,
  23:  21.1,
  24:  22.4,
  25:  23.8,
  26:  25.2,
  27:  26.7,
  28:  28.3,
  29:  30.0,
  30:  31.8,
  35:  42.2,
  40:  55.3,
  45:  71.9,
  50:  92.5,
  60:  149.4,
  70:  233.7,
  80:  355.1,
  90:  525.8,
  95:  633.9,
  100: 760.0,
}

const SORTED_TEMPS = Object.keys(WATER_VAPOR_PRESSURE_MMHG).map(Number).sort((a, b) => a - b)

/** Return vapor pressure of water (mmHg) at the given Celsius temperature.
 *  Exact for tabulated values; linearly interpolated between them.
 *  Throws if celsius is outside [0, 100]. */
export function waterVaporPressure(celsius: number): number {
  const min = SORTED_TEMPS[0]
  const max = SORTED_TEMPS[SORTED_TEMPS.length - 1]
  if (celsius < min || celsius > max) {
    throw new RangeError(`Temperature ${celsius} °C is outside the table range [${min}, ${max}] °C`)
  }
  if (Object.prototype.hasOwnProperty.call(WATER_VAPOR_PRESSURE_MMHG, celsius)) {
    return WATER_VAPOR_PRESSURE_MMHG[celsius as keyof typeof WATER_VAPOR_PRESSURE_MMHG]
  }
  const lo = [...SORTED_TEMPS].reverse().find(t => t <= celsius)!
  const hi = SORTED_TEMPS.find(t => t > celsius)!
  const pLo = WATER_VAPOR_PRESSURE_MMHG[lo]
  const pHi = WATER_VAPOR_PRESSURE_MMHG[hi]
  return pLo + (pHi - pLo) * (celsius - lo) / (hi - lo)
}

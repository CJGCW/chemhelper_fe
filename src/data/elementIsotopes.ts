// Natural isotopes and key radioactive isotopes, indexed by atomic number.
// abundance: natural % (omitted for purely synthetic/radioactive with no natural occurrence)
// radioactive: true for isotopes that undergo decay (including long-lived natural ones)
// halfLife: human-readable string for notable radioactive isotopes
// name: special name (deuterium, tritium, etc.)

export interface IsotopeEntry {
  A: number
  abundance?: number
  radioactive?: boolean
  halfLife?: string
  name?: string
}

export const ISOTOPES: Record<number, IsotopeEntry[]> = {
  1:  [
    { A: 1,  abundance: 99.9885, name: 'protium' },
    { A: 2,  abundance: 0.0115,  name: 'deuterium' },
    { A: 3,  radioactive: true,  halfLife: '12.32 yr', name: 'tritium' },
  ],
  2:  [
    { A: 3,  abundance: 0.000134 },
    { A: 4,  abundance: 99.999866 },
  ],
  3:  [
    { A: 6,  abundance: 7.59 },
    { A: 7,  abundance: 92.41 },
  ],
  4:  [
    { A: 9,  abundance: 100 },
  ],
  5:  [
    { A: 10, abundance: 19.9 },
    { A: 11, abundance: 80.1 },
  ],
  6:  [
    { A: 12, abundance: 98.93 },
    { A: 13, abundance: 1.07 },
    { A: 14, radioactive: true, halfLife: '5,730 yr', name: 'carbon-14' },
  ],
  7:  [
    { A: 14, abundance: 99.632 },
    { A: 15, abundance: 0.368 },
  ],
  8:  [
    { A: 16, abundance: 99.757 },
    { A: 17, abundance: 0.038 },
    { A: 18, abundance: 0.205 },
  ],
  9:  [
    { A: 19, abundance: 100 },
  ],
  10: [
    { A: 20, abundance: 90.48 },
    { A: 21, abundance: 0.27 },
    { A: 22, abundance: 9.25 },
  ],
  11: [
    { A: 23, abundance: 100 },
  ],
  12: [
    { A: 24, abundance: 78.99 },
    { A: 25, abundance: 10.00 },
    { A: 26, abundance: 11.01 },
  ],
  13: [
    { A: 27, abundance: 100 },
  ],
  14: [
    { A: 28, abundance: 92.23 },
    { A: 29, abundance: 4.67 },
    { A: 30, abundance: 3.10 },
  ],
  15: [
    { A: 31, abundance: 100 },
  ],
  16: [
    { A: 32, abundance: 94.99 },
    { A: 33, abundance: 0.75 },
    { A: 34, abundance: 4.25 },
    { A: 36, abundance: 0.01 },
  ],
  17: [
    { A: 35, abundance: 75.77 },
    { A: 37, abundance: 24.23 },
  ],
  18: [
    { A: 36, abundance: 0.3336 },
    { A: 38, abundance: 0.0629 },
    { A: 40, abundance: 99.6035 },
  ],
  19: [
    { A: 39, abundance: 93.258 },
    { A: 40, abundance: 0.0117, radioactive: true, halfLife: '1.25 × 10⁹ yr' },
    { A: 41, abundance: 6.730 },
  ],
  20: [
    { A: 40, abundance: 96.941 },
    { A: 42, abundance: 0.647 },
    { A: 43, abundance: 0.135 },
    { A: 44, abundance: 2.086 },
    { A: 46, abundance: 0.004 },
    { A: 48, abundance: 0.187 },
  ],
  21: [
    { A: 45, abundance: 100 },
  ],
  22: [
    { A: 46, abundance: 8.25 },
    { A: 47, abundance: 7.44 },
    { A: 48, abundance: 73.72 },
    { A: 49, abundance: 5.41 },
    { A: 50, abundance: 5.18 },
  ],
  23: [
    { A: 50, abundance: 0.25, radioactive: true, halfLife: '1.4 × 10¹⁷ yr' },
    { A: 51, abundance: 99.75 },
  ],
  24: [
    { A: 50, abundance: 4.345 },
    { A: 52, abundance: 83.789 },
    { A: 53, abundance: 9.501 },
    { A: 54, abundance: 2.365 },
  ],
  25: [
    { A: 55, abundance: 100 },
  ],
  26: [
    { A: 54, abundance: 5.845 },
    { A: 56, abundance: 91.754 },
    { A: 57, abundance: 2.119 },
    { A: 58, abundance: 0.282 },
  ],
  27: [
    { A: 59, abundance: 100 },
  ],
  28: [
    { A: 58, abundance: 68.077 },
    { A: 60, abundance: 26.223 },
    { A: 61, abundance: 1.140 },
    { A: 62, abundance: 3.634 },
    { A: 64, abundance: 0.926 },
  ],
  29: [
    { A: 63, abundance: 69.15 },
    { A: 65, abundance: 30.85 },
  ],
  30: [
    { A: 64, abundance: 48.6 },
    { A: 66, abundance: 27.9 },
    { A: 67, abundance: 4.1 },
    { A: 68, abundance: 18.8 },
    { A: 70, abundance: 0.6 },
  ],
  31: [
    { A: 69, abundance: 60.11 },
    { A: 71, abundance: 39.89 },
  ],
  32: [
    { A: 70, abundance: 20.57 },
    { A: 72, abundance: 27.45 },
    { A: 73, abundance: 7.75 },
    { A: 74, abundance: 36.50 },
    { A: 76, abundance: 7.73 },
  ],
  33: [
    { A: 75, abundance: 100 },
  ],
  34: [
    { A: 74, abundance: 0.89 },
    { A: 76, abundance: 9.37 },
    { A: 77, abundance: 7.63 },
    { A: 78, abundance: 23.77 },
    { A: 80, abundance: 49.61 },
    { A: 82, abundance: 8.73 },
  ],
  35: [
    { A: 79, abundance: 50.69 },
    { A: 81, abundance: 49.31 },
  ],
  36: [
    { A: 78, abundance: 0.355 },
    { A: 80, abundance: 2.286 },
    { A: 82, abundance: 11.593 },
    { A: 83, abundance: 11.500 },
    { A: 84, abundance: 56.987 },
    { A: 86, abundance: 17.279 },
  ],
  37: [
    { A: 85, abundance: 72.17 },
    { A: 87, abundance: 27.83, radioactive: true, halfLife: '4.97 × 10¹⁰ yr' },
  ],
  38: [
    { A: 84, abundance: 0.56 },
    { A: 86, abundance: 9.86 },
    { A: 87, abundance: 7.00 },
    { A: 88, abundance: 82.58 },
  ],
  39: [
    { A: 89, abundance: 100 },
  ],
  40: [
    { A: 90, abundance: 51.45 },
    { A: 91, abundance: 11.22 },
    { A: 92, abundance: 17.15 },
    { A: 94, abundance: 17.38 },
    { A: 96, abundance: 2.80 },
  ],
  41: [
    { A: 93, abundance: 100 },
  ],
  42: [
    { A: 92,  abundance: 14.53 },
    { A: 94,  abundance: 9.15 },
    { A: 95,  abundance: 15.84 },
    { A: 96,  abundance: 16.67 },
    { A: 97,  abundance: 9.60 },
    { A: 98,  abundance: 24.39 },
    { A: 100, abundance: 9.82 },
  ],
  43: [
    { A: 97,  radioactive: true, halfLife: '2.6 × 10⁶ yr' },
    { A: 99,  radioactive: true, halfLife: '2.1 × 10⁵ yr', name: 'technetium-99' },
  ],
  44: [
    { A: 96,  abundance: 5.54 },
    { A: 98,  abundance: 1.87 },
    { A: 99,  abundance: 12.76 },
    { A: 100, abundance: 12.60 },
    { A: 101, abundance: 17.06 },
    { A: 102, abundance: 31.55 },
    { A: 104, abundance: 18.62 },
  ],
  45: [
    { A: 103, abundance: 100 },
  ],
  46: [
    { A: 102, abundance: 1.02 },
    { A: 104, abundance: 11.14 },
    { A: 105, abundance: 22.33 },
    { A: 106, abundance: 27.33 },
    { A: 108, abundance: 26.46 },
    { A: 110, abundance: 11.72 },
  ],
  47: [
    { A: 107, abundance: 51.839 },
    { A: 109, abundance: 48.161 },
  ],
  48: [
    { A: 106, abundance: 1.25 },
    { A: 108, abundance: 0.89 },
    { A: 110, abundance: 12.49 },
    { A: 111, abundance: 12.80 },
    { A: 112, abundance: 24.13 },
    { A: 113, abundance: 12.22 },
    { A: 114, abundance: 28.73 },
    { A: 116, abundance: 7.49 },
  ],
  49: [
    { A: 113, abundance: 4.29 },
    { A: 115, abundance: 95.71, radioactive: true, halfLife: '4.4 × 10¹⁴ yr' },
  ],
  50: [
    { A: 112, abundance: 0.97 },
    { A: 114, abundance: 0.66 },
    { A: 115, abundance: 0.34 },
    { A: 116, abundance: 14.54 },
    { A: 117, abundance: 7.68 },
    { A: 118, abundance: 24.22 },
    { A: 119, abundance: 8.59 },
    { A: 120, abundance: 32.58 },
    { A: 122, abundance: 4.63 },
    { A: 124, abundance: 5.79 },
  ],
  51: [
    { A: 121, abundance: 57.21 },
    { A: 123, abundance: 42.79 },
  ],
  52: [
    { A: 120, abundance: 0.09 },
    { A: 122, abundance: 2.55 },
    { A: 123, abundance: 0.89 },
    { A: 124, abundance: 4.74 },
    { A: 125, abundance: 7.07 },
    { A: 126, abundance: 18.84 },
    { A: 128, abundance: 31.74 },
    { A: 130, abundance: 34.08 },
  ],
  53: [
    { A: 127, abundance: 100 },
    { A: 131, radioactive: true, halfLife: '8.02 d', name: 'iodine-131' },
  ],
  54: [
    { A: 124, abundance: 0.09 },
    { A: 126, abundance: 0.09 },
    { A: 128, abundance: 1.92 },
    { A: 129, abundance: 26.44 },
    { A: 130, abundance: 4.08 },
    { A: 131, abundance: 21.18 },
    { A: 132, abundance: 26.89 },
    { A: 134, abundance: 10.44 },
    { A: 136, abundance: 8.87 },
  ],
  55: [
    { A: 133, abundance: 100 },
  ],
  56: [
    { A: 130, abundance: 0.11 },
    { A: 132, abundance: 0.10 },
    { A: 134, abundance: 2.42 },
    { A: 135, abundance: 6.59 },
    { A: 136, abundance: 7.85 },
    { A: 137, abundance: 11.23 },
    { A: 138, abundance: 71.70 },
  ],
  57: [
    { A: 138, abundance: 0.09, radioactive: true, halfLife: '1.02 × 10¹¹ yr' },
    { A: 139, abundance: 99.91 },
  ],
  58: [
    { A: 136, abundance: 0.19 },
    { A: 138, abundance: 0.25 },
    { A: 140, abundance: 88.45 },
    { A: 142, abundance: 11.11 },
  ],
  59: [
    { A: 141, abundance: 100 },
  ],
  60: [
    { A: 142, abundance: 27.2 },
    { A: 143, abundance: 12.2 },
    { A: 144, abundance: 23.8, radioactive: true, halfLife: '2.29 × 10¹⁵ yr' },
    { A: 145, abundance: 8.3 },
    { A: 146, abundance: 17.2 },
    { A: 148, abundance: 5.7 },
    { A: 150, abundance: 5.6 },
  ],
  61: [
    { A: 145, radioactive: true, halfLife: '17.7 yr' },
    { A: 147, radioactive: true, halfLife: '2.62 yr' },
  ],
  62: [
    { A: 144, abundance: 3.07 },
    { A: 147, abundance: 15.0, radioactive: true, halfLife: '1.06 × 10¹¹ yr' },
    { A: 148, abundance: 11.25 },
    { A: 149, abundance: 13.82 },
    { A: 150, abundance: 7.38 },
    { A: 152, abundance: 26.75 },
    { A: 154, abundance: 22.75 },
  ],
  63: [
    { A: 151, abundance: 47.81 },
    { A: 153, abundance: 52.19 },
  ],
  64: [
    { A: 152, abundance: 0.20 },
    { A: 154, abundance: 2.18 },
    { A: 155, abundance: 14.80 },
    { A: 156, abundance: 20.47 },
    { A: 157, abundance: 15.65 },
    { A: 158, abundance: 24.84 },
    { A: 160, abundance: 21.86 },
  ],
  65: [
    { A: 159, abundance: 100 },
  ],
  66: [
    { A: 156, abundance: 0.06 },
    { A: 158, abundance: 0.10 },
    { A: 160, abundance: 2.34 },
    { A: 161, abundance: 18.91 },
    { A: 162, abundance: 25.51 },
    { A: 163, abundance: 24.90 },
    { A: 164, abundance: 28.18 },
  ],
  67: [
    { A: 165, abundance: 100 },
  ],
  68: [
    { A: 162, abundance: 0.14 },
    { A: 164, abundance: 1.61 },
    { A: 166, abundance: 33.61 },
    { A: 167, abundance: 22.93 },
    { A: 168, abundance: 26.78 },
    { A: 170, abundance: 14.93 },
  ],
  69: [
    { A: 169, abundance: 100 },
  ],
  70: [
    { A: 168, abundance: 0.13 },
    { A: 170, abundance: 3.04 },
    { A: 171, abundance: 14.28 },
    { A: 172, abundance: 21.83 },
    { A: 173, abundance: 16.13 },
    { A: 174, abundance: 31.83 },
    { A: 176, abundance: 12.76 },
  ],
  71: [
    { A: 175, abundance: 97.401 },
    { A: 176, abundance: 2.599, radioactive: true, halfLife: '3.76 × 10¹⁰ yr' },
  ],
  72: [
    { A: 174, abundance: 0.16 },
    { A: 176, abundance: 5.26 },
    { A: 177, abundance: 18.60 },
    { A: 178, abundance: 27.28 },
    { A: 179, abundance: 13.62 },
    { A: 180, abundance: 35.08 },
  ],
  73: [
    { A: 180, abundance: 0.01, radioactive: true, halfLife: '> 10¹⁵ yr' },
    { A: 181, abundance: 99.99 },
  ],
  74: [
    { A: 180, abundance: 0.12 },
    { A: 182, abundance: 26.50 },
    { A: 183, abundance: 14.31 },
    { A: 184, abundance: 30.64 },
    { A: 186, abundance: 28.43 },
  ],
  75: [
    { A: 185, abundance: 37.40 },
    { A: 187, abundance: 62.60, radioactive: true, halfLife: '4.12 × 10¹⁰ yr' },
  ],
  76: [
    { A: 184, abundance: 0.02 },
    { A: 186, abundance: 1.59 },
    { A: 187, abundance: 1.96 },
    { A: 188, abundance: 13.24 },
    { A: 189, abundance: 16.15 },
    { A: 190, abundance: 26.26 },
    { A: 192, abundance: 40.78 },
  ],
  77: [
    { A: 191, abundance: 37.3 },
    { A: 193, abundance: 62.7 },
  ],
  78: [
    { A: 190, abundance: 0.01, radioactive: true, halfLife: '6.5 × 10¹¹ yr' },
    { A: 192, abundance: 0.78 },
    { A: 194, abundance: 32.97 },
    { A: 195, abundance: 33.83 },
    { A: 196, abundance: 25.24 },
    { A: 198, abundance: 7.17 },
  ],
  79: [
    { A: 197, abundance: 100 },
  ],
  80: [
    { A: 196, abundance: 0.15 },
    { A: 198, abundance: 9.97 },
    { A: 199, abundance: 16.87 },
    { A: 200, abundance: 23.10 },
    { A: 201, abundance: 13.18 },
    { A: 202, abundance: 29.86 },
    { A: 204, abundance: 6.87 },
  ],
  81: [
    { A: 203, abundance: 29.52 },
    { A: 205, abundance: 70.48 },
  ],
  82: [
    { A: 204, abundance: 1.4 },
    { A: 206, abundance: 24.1 },
    { A: 207, abundance: 22.1 },
    { A: 208, abundance: 52.4 },
  ],
  83: [
    { A: 209, abundance: 100, radioactive: true, halfLife: '1.9 × 10¹⁹ yr' },
  ],
  84: [
    { A: 210, radioactive: true, halfLife: '138.4 d', name: 'polonium-210' },
    { A: 214, radioactive: true, halfLife: '163.7 μs' },
  ],
  85: [
    { A: 210, radioactive: true, halfLife: '8.1 hr' },
    { A: 211, radioactive: true, halfLife: '7.2 hr' },
  ],
  86: [
    { A: 220, radioactive: true, halfLife: '55.6 s' },
    { A: 222, radioactive: true, halfLife: '3.82 d', name: 'radon-222' },
  ],
  87: [
    { A: 221, radioactive: true, halfLife: '4.9 min' },
    { A: 223, radioactive: true, halfLife: '22.0 min' },
  ],
  88: [
    { A: 223, radioactive: true, halfLife: '11.43 d' },
    { A: 224, radioactive: true, halfLife: '3.63 d' },
    { A: 226, radioactive: true, halfLife: '1,600 yr', name: 'radium-226' },
    { A: 228, radioactive: true, halfLife: '5.75 yr' },
  ],
  89: [
    { A: 227, radioactive: true, halfLife: '21.77 yr' },
  ],
  90: [
    { A: 230, radioactive: true, halfLife: '75,400 yr' },
    { A: 232, abundance: 100, radioactive: true, halfLife: '1.40 × 10¹⁰ yr', name: 'thorium-232' },
  ],
  91: [
    { A: 231, radioactive: true, halfLife: '32,760 yr' },
    { A: 233, radioactive: true, halfLife: '26.97 d' },
  ],
  92: [
    { A: 234, abundance: 0.0054, radioactive: true, halfLife: '2.46 × 10⁵ yr' },
    { A: 235, abundance: 0.7204, radioactive: true, halfLife: '7.04 × 10⁸ yr', name: 'U-235' },
    { A: 238, abundance: 99.2742, radioactive: true, halfLife: '4.47 × 10⁹ yr', name: 'U-238' },
  ],
}

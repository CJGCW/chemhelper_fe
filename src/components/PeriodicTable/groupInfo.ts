export interface GroupInfo {
  number: number
  name: string
  iupacName: string
  description: string
  // Which elements are in this group across all periods (atomic numbers)
  // Used to cross-highlight — empty means "all elements whose .group === number"
}

export const GROUP_INFO: Record<number, GroupInfo> = {
  1: {
    number: 1,
    name: 'Alkali Metals',
    iupacName: 'Group 1',
    description: 'Highly reactive soft metals. React vigorously with water to produce hydrogen gas and a metal hydroxide. Each has a single valence electron, giving them an oxidation state of +1.',
  },
  2: {
    number: 2,
    name: 'Alkaline Earth Metals',
    iupacName: 'Group 2',
    description: 'Reactive metals with two valence electrons and an oxidation state of +2. Less reactive than group 1. Beryllium is anomalous — it behaves more like aluminium.',
  },
  3: {
    number: 3,
    name: 'Scandium Group',
    iupacName: 'Group 3',
    description: 'First transition metals. Scandium and yttrium are soft, silvery metals. Group 3 also includes the lanthanide and actinide series as extended members.',
  },
  4: {
    number: 4,
    name: 'Titanium Group',
    iupacName: 'Group 4',
    description: 'Hard, refractory transition metals with high melting points. Titanium is exceptionally corrosion-resistant. Zirconium is used in nuclear reactors.',
  },
  5: {
    number: 5,
    name: 'Vanadium Group',
    iupacName: 'Group 5',
    description: 'Transition metals with multiple oxidation states. Vanadium is used in high-strength steel alloys. Niobium and tantalum are used in electronics.',
  },
  6: {
    number: 6,
    name: 'Chromium Group',
    iupacName: 'Group 6',
    description: 'Hard transition metals. Chromium is used in stainless steel and chrome plating. Molybdenum and tungsten have the highest melting points of any elements.',
  },
  7: {
    number: 7,
    name: 'Manganese Group',
    iupacName: 'Group 7',
    description: 'Transition metals with diverse oxidation states. Manganese is essential in steel production. Technetium is the lightest radioactive element with no stable isotopes.',
  },
  8: {
    number: 8,
    name: 'Iron Group',
    iupacName: 'Group 8',
    description: 'Includes iron — the most abundant metal in Earth\'s crust by mass and central to all life as the core of haemoglobin. Ruthenium and osmium are rare platinum-group metals.',
  },
  9: {
    number: 9,
    name: 'Cobalt Group',
    iupacName: 'Group 9',
    description: 'Transition metals used in high-temperature alloys and batteries. Cobalt is essential for vitamin B12. Iridium is the densest element and most corrosion-resistant metal.',
  },
  10: {
    number: 10,
    name: 'Nickel Group',
    iupacName: 'Group 10',
    description: 'Include nickel, palladium, and platinum — all important catalysts. Platinum-group metals are among the rarest and most valuable on Earth.',
  },
  11: {
    number: 11,
    name: 'Coinage Metals',
    iupacName: 'Group 11',
    description: 'Copper, silver, and gold — the classical coinage metals. Highly conductive, relatively unreactive, and lustrous. All have been used as currency throughout human history.',
  },
  12: {
    number: 12,
    name: 'Zinc Group',
    iupacName: 'Group 12',
    description: 'Metals with a filled d-subshell. Zinc is essential in biological systems. Mercury is the only metal that is liquid at room temperature. Cadmium is highly toxic.',
  },
  13: {
    number: 13,
    name: 'Boron Group',
    iupacName: 'Group 13 / Icosagens',
    description: 'Contains the only group 13 metalloid, boron. Aluminium is the most abundant metal in Earth\'s crust. Group members have three valence electrons and form +3 ions.',
  },
  14: {
    number: 14,
    name: 'Carbon Group',
    iupacName: 'Group 14 / Crystallogens',
    description: 'Contains carbon — the basis of all known life. Silicon underpins modern electronics. Members have four valence electrons, enabling complex bonding and vast structural diversity.',
  },
  15: {
    number: 15,
    name: 'Pnictogens',
    iupacName: 'Group 15 / Nitrogen Group',
    description: 'Nitrogen makes up 78% of Earth\'s atmosphere and is essential for amino acids and DNA. Phosphorus is critical for ATP and cell membranes. Members have five valence electrons.',
  },
  16: {
    number: 16,
    name: 'Chalcogens',
    iupacName: 'Group 16 / Oxygen Group',
    description: 'Oxygen is the most abundant element in Earth\'s crust and essential to aerobic life. Sulfur forms a wide range of compounds. Members have six valence electrons and form −2 ions.',
  },
  17: {
    number: 17,
    name: 'Halogens',
    iupacName: 'Group 17',
    description: 'The most electronegative elements. Highly reactive non-metals that readily form salts with metals. Fluorine is the most electronegative of all elements. All have seven valence electrons.',
  },
  18: {
    number: 18,
    name: 'Noble Gases',
    iupacName: 'Group 18',
    description: 'Full valence shells make these elements exceptionally stable and largely unreactive. Used in lighting, welding, and cryogenics. Xenon and krypton form a small number of compounds under extreme conditions.',
  },
}

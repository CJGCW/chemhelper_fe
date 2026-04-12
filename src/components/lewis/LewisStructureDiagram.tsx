import type { LewisStructure } from "../../pages/LewisPage";

// ── Layout constants ──────────────────────────────────────────────────────────

const SVG_W = 500;
const SVG_H = 340;
const BOND_LEN = 82;
const ATOM_R = 21;
const H_ATOM_R = 16;
const LP_OFFSET = 35;
const LP_R = 3.5;
const LP_DOT_SEP = 5.5;

// ── Element colours (dark-theme CPK) ─────────────────────────────────────────

const ELEM_COLORS: Record<string, string> = {
  H: "#9ca3af",
  C: "#4b5563",
  N: "#4a7ef5",
  O: "#e05050",
  F: "#5dcc5d",
  Cl: "#40b840",
  Br: "#be4040",
  I: "#9966cc",
  S: "#d4b84a",
  P: "#e08030",
  Na: "#9966ff",
  K: "#8060e0",
  Li: "#cc88ff",
  Ca: "#909090",
  Mg: "#6ab060",
  Al: "#a09090",
  Si: "#b09070",
  Fe: "#c07040",
  Cu: "#c88050",
  Zn: "#7080b0",
  B: "#c87050",
  Xe: "#6080c0",
  Kr: "#5570b0",
  Ar: "#4060a0",
  Ne: "#3050a0",
  He: "#2040a0",
};

function getColor(element: string): string {
  return ELEM_COLORS[element] ?? "#60a5fa";
}

// ── Angle helpers ─────────────────────────────────────────────────────────────

function getTerminalAngles(geometry: string, n: number): number[] {
  if (n === 0) return [];
  if (n === 1) return [0];

  const g = geometry.toLowerCase().replace(/-/g, "_");

  switch (g) {
    case "linear":
    case "diatomic":
      if (n === 2) return [180, 0];
      break;
    case "bent":
      if (n === 2) return [-135, -45];
      break;
    case "trigonal_planar":
    case "trigonal_pyramidal":
      if (n === 3) return [-90, 30, 150];
      break;
    case "tetrahedral":
    case "see_saw":
    case "seesaw":
      if (n === 4) return [-90, 0, 180, 90];
      if (n === 3) return [-90, 30, 150];
      break;
    case "square_planar":
      if (n === 4) return [-90, 0, 90, 180];
      break;
    case "t_shaped":
      if (n === 3) return [-90, 0, 180];
      break;
    case "trigonal_bipyramidal":
      if (n === 5) return [-90, 90, 30, 150, 0];
      break;
    case "octahedral":
    case "square_pyramidal":
      if (n === 6) return [-90, 0, 90, 180, 45, 225];
      if (n === 5) return [-90, 0, 90, 180, 45];
      break;
  }

  // Fallback: evenly distribute starting from top
  return Array.from({ length: n }, (_, i) => -90 + (360 * i) / n);
}

function getLonePairAngles(bondAngles: number[], count: number): number[] {
  if (count === 0) return []
  if (bondAngles.length === 0) {
    return Array.from({ length: count }, (_, i) => (360 * i) / count)
  }

  const total = bondAngles.length + count
  const step = 360 / total
  const norm = (a: number) => ((a % 360) + 360) % 360
  const angDiff = (a: number, b: number) => { const d = norm(a - b); return d > 180 ? 360 - d : d }
  const normBonds = bondAngles.map(norm)

  // Treat bonds + lone pairs as vertices of a regular `total`-gon.
  // Find the grid rotation (offset) that minimises total squared error
  // between bond angles and their nearest grid positions.
  let bestOffset = normBonds[0], bestError = Infinity
  for (const anchor of normBonds) {
    for (let slot = 0; slot < total; slot++) {
      const offset = anchor - slot * step
      let error = 0
      for (const ba of normBonds) {
        const nearest = Math.round(norm(ba - offset) / step)
        error += angDiff(ba, offset + nearest * step) ** 2
      }
      if (error < bestError) { bestError = error; bestOffset = offset }
    }
  }

  // Build the full grid and greedily assign each bond to its nearest slot.
  const grid = Array.from({ length: total }, (_, i) => norm(bestOffset + i * step))
  const occupied = new Set<number>()
  for (const ba of normBonds) {
    let best = -1, minD = Infinity
    for (let i = 0; i < grid.length; i++) {
      if (occupied.has(i)) continue
      const d = angDiff(ba, grid[i])
      if (d < minD) { minD = d; best = i }
    }
    if (best >= 0) occupied.add(best)
  }

  // Unoccupied slots are the lone pair positions.
  return grid.filter((_, i) => !occupied.has(i))
}

// ── BFS fan layout helper ─────────────────────────────────────────────────────

// Starting from `frontier` (already-positioned atoms), place every unpositioned
// atom by fanning it away from the direction back toward the placed tree.
function bfsFanLayout(
  positions: Record<string, { x: number; y: number }>,
  adj: Record<string, string[]>,
  frontier: string[],
) {
  let current = frontier.slice();
  for (let depth = 0; depth < 6 && current.length > 0; depth++) {
    const parentToChildren: Record<string, string[]> = {};
    current.forEach((pid) => {
      const ch = adj[pid].filter((n) => !positions[n]);
      if (ch.length) parentToChildren[pid] = ch;
    });
    const next: string[] = [];
    Object.entries(parentToChildren).forEach(([pid, children]) => {
      const pp = positions[pid];
      const backN = adj[pid].find((n) => positions[n]);
      let forwardAngle = 0;
      if (backN) {
        const bp = positions[backN];
        forwardAngle =
          Math.atan2(bp.y - pp.y, bp.x - pp.x) * (180 / Math.PI) + 180;
      }
      const n = children.length;
      const spread = n === 1 ? 0 : Math.min(60, 120 / (n - 1));
      const start = forwardAngle - (spread * (n - 1)) / 2;
      children.forEach((cid, i) => {
        const rad = (start + i * spread) * (Math.PI / 180);
        positions[cid] = {
          x: pp.x + Math.cos(rad) * BOND_LEN,
          y: pp.y + Math.sin(rad) * BOND_LEN,
        };
        next.push(cid);
      });
    });
    current = next;
  }
}

// ── Layout ────────────────────────────────────────────────────────────────────

function computeLayout(
  atoms: LewisStructure["atoms"],
  bonds: LewisStructure["bonds"],
  geometry: string,
): Record<string, { x: number; y: number }> {
  if (atoms.length === 0) return {};

  const cx = SVG_W / 2;
  const cy = SVG_H / 2;
  const positions: Record<string, { x: number; y: number }> = {};

  if (atoms.length === 1) {
    positions[atoms[0].id] = { x: cx, y: cy };
    return positions;
  }

  // Build adjacency
  const adj: Record<string, string[]> = {};
  atoms.forEach((a) => {
    adj[a.id] = [];
  });
  bonds.forEach((b) => {
    adj[b.from].push(b.to);
    adj[b.to].push(b.from);
  });

  // No bonds (ionic compound): lay atoms out in a row
  if (bonds.length === 0) {
    const spacing = BOND_LEN * 1.5;
    const totalW = (atoms.length - 1) * spacing;
    atoms.forEach((a, i) => {
      positions[a.id] = { x: cx - totalW / 2 + i * spacing, y: cy };
    });
    return positions;
  }

  // Chain geometry (two-center molecules like CH3COOH, C2H5OH):
  // Place the two heavy backbone atoms side-by-side horizontally, then BFS outward.
  if (geometry === "chain") {
    const atomById: Record<string, (typeof atoms)[0]> = {};
    atoms.forEach((a) => {
      atomById[a.id] = a;
    });

    // Find the backbone bond: connects two non-H atoms each with degree ≥ 2.
    let leftID = "",
      rightID = "";
    for (const b of bonds) {
      if (
        atomById[b.from]?.element !== "H" &&
        atomById[b.to]?.element !== "H" &&
        adj[b.from].length >= 2 &&
        adj[b.to].length >= 2
      ) {
        // Higher-degree backbone atom goes on the left.
        if (adj[b.from].length >= adj[b.to].length) {
          leftID = b.from;
          rightID = b.to;
        } else {
          leftID = b.to;
          rightID = b.from;
        }
        break;
      }
    }
    if (leftID && rightID) {
      positions[leftID] = { x: cx - BOND_LEN / 2, y: cy };
      positions[rightID] = { x: cx + BOND_LEN / 2, y: cy };
      bfsFanLayout(positions, adj, [leftID, rightID]);
      return positions;
    }
  }

  // Central atom = most connections; break ties by preferring non-H
  const central = atoms.reduce((best, a) => {
    const bc = adj[a.id].length;
    const bb = adj[best.id].length;
    if (bc > bb) return a;
    if (bc === bb && best.element === "H" && a.element !== "H") return a;
    return best;
  });

  positions[central.id] = { x: cx, y: cy };

  const directNeighbors = adj[central.id];
  const angles = getTerminalAngles(geometry, directNeighbors.length);

  directNeighbors.forEach((tid, i) => {
    const deg = angles[i] ?? -90 + (360 * i) / directNeighbors.length;
    const rad = deg * (Math.PI / 180);
    positions[tid] = {
      x: cx + Math.cos(rad) * BOND_LEN,
      y: cy + Math.sin(rad) * BOND_LEN,
    };
  });

  bfsFanLayout(
    positions,
    adj,
    directNeighbors.filter((id) => positions[id]),
  );

  return positions;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BondLines({
  bond,
  positions,
}: {
  bond: LewisStructure["bonds"][0];
  positions: Record<string, { x: number; y: number }>;
}) {
  const p1 = positions[bond.from];
  const p2 = positions[bond.to];
  if (!p1 || !p2) return null;

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  const fromR = ATOM_R;
  const toR = ATOM_R;
  const x1 = p1.x + ux * fromR;
  const y1 = p1.y + uy * fromR;
  const x2 = p2.x - ux * toR;
  const y2 = p2.y - uy * toR;

  const strokeColor = "rgba(255,255,255,0.82)";
  const strokeW = 2;

  if (bond.order === 2) {
    const o = 4;
    return (
      <g>
        <line
          x1={x1 + px * o}
          y1={y1 + py * o}
          x2={x2 + px * o}
          y2={y2 + py * o}
          stroke={strokeColor}
          strokeWidth={strokeW}
        />
        <line
          x1={x1 - px * o}
          y1={y1 - py * o}
          x2={x2 - px * o}
          y2={y2 - py * o}
          stroke={strokeColor}
          strokeWidth={strokeW}
        />
      </g>
    );
  }

  if (bond.order === 3) {
    const o = 5;
    return (
      <g>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth={strokeW}
        />
        <line
          x1={x1 + px * o}
          y1={y1 + py * o}
          x2={x2 + px * o}
          y2={y2 + py * o}
          stroke={strokeColor}
          strokeWidth={strokeW}
        />
        <line
          x1={x1 - px * o}
          y1={y1 - py * o}
          x2={x2 - px * o}
          y2={y2 - py * o}
          stroke={strokeColor}
          strokeWidth={strokeW}
        />
      </g>
    );
  }

  // Single bond (order 1 or fallback)
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={strokeColor}
      strokeWidth={strokeW}
    />
  );
}

function AtomNode({
  atom,
  pos,
  adj,
  positions,
}: {
  atom: LewisStructure["atoms"][0];
  pos: { x: number; y: number };
  adj: Record<string, string[]>;
  positions: Record<string, { x: number; y: number }>;
}) {
  const color = getColor(atom.element);
  const r = atom.element === "H" ? H_ATOM_R : ATOM_R;

  const bondAngles = (adj[atom.id] ?? []).map((nid) => {
    const npos = positions[nid];
    if (!npos) return 0;
    return Math.atan2(npos.y - pos.y, npos.x - pos.x) * (180 / Math.PI);
  });

  const lpAngles = getLonePairAngles(bondAngles, atom.lone_pairs);

  const chargeLabel =
    atom.formal_charge === 0
      ? null
      : atom.formal_charge === 1
        ? "+"
        : atom.formal_charge === -1
          ? "−"
          : atom.formal_charge > 0
            ? `+${atom.formal_charge}`
            : `${atom.formal_charge}`;

  return (
    <g>
      {/* Lone pairs */}
      {lpAngles.map((angle, i) => {
        const rad = angle * (Math.PI / 180);
        const lpCx = pos.x + Math.cos(rad) * LP_OFFSET;
        const lpCy = pos.y + Math.sin(rad) * LP_OFFSET;
        const perpRad = rad + Math.PI / 2;
        const dx = Math.cos(perpRad) * LP_DOT_SEP;
        const dy = Math.sin(perpRad) * LP_DOT_SEP;
        return (
          <g key={i}>
            <circle
              cx={lpCx + dx}
              cy={lpCy + dy}
              r={LP_R}
              fill="rgba(255,255,255,0.85)"
            />
            <circle
              cx={lpCx - dx}
              cy={lpCy - dy}
              r={LP_R}
              fill="rgba(255,255,255,0.85)"
            />
          </g>
        );
      })}

      {/* Atom circle */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={r}
        fill={color}
        stroke="#1c1f2e"
        strokeWidth="1.5"
      />

      {/* Element symbol */}
      <text
        x={pos.x}
        y={pos.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={atom.element.length > 1 ? 11 : r === H_ATOM_R ? 11 : 13}
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {atom.element}
      </text>

      {/* Formal charge */}
      {chargeLabel && (
        <text
          x={pos.x + r}
          y={pos.y - r + 1}
          textAnchor="start"
          fill="white"
          fontSize="10"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
        >
          {chargeLabel}
        </text>
      )}
    </g>
  );
}

// ── SVG string export (for print answer keys) ────────────────────────────────

function svgBondLines(
  bond: LewisStructure['bonds'][0],
  positions: Record<string, { x: number; y: number }>,
): string {
  const p1 = positions[bond.from], p2 = positions[bond.to]
  if (!p1 || !p2) return ''

  const dx = p2.x - p1.x, dy = p2.y - p1.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len, uy = dy / len
  const px = -uy, py = ux
  const x1 = p1.x + ux * ATOM_R, y1 = p1.y + uy * ATOM_R
  const x2 = p2.x - ux * ATOM_R, y2 = p2.y - uy * ATOM_R
  const c = '#1a1a1a', w = 2

  if (bond.order === 2) {
    const o = 4
    return `<line x1="${x1 + px * o}" y1="${y1 + py * o}" x2="${x2 + px * o}" y2="${y2 + py * o}" stroke="${c}" stroke-width="${w}"/>` +
           `<line x1="${x1 - px * o}" y1="${y1 - py * o}" x2="${x2 - px * o}" y2="${y2 - py * o}" stroke="${c}" stroke-width="${w}"/>`
  }
  if (bond.order === 3) {
    const o = 5
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/>` +
           `<line x1="${x1 + px * o}" y1="${y1 + py * o}" x2="${x2 + px * o}" y2="${y2 + py * o}" stroke="${c}" stroke-width="${w}"/>` +
           `<line x1="${x1 - px * o}" y1="${y1 - py * o}" x2="${x2 - px * o}" y2="${y2 - py * o}" stroke="${c}" stroke-width="${w}"/>`
  }
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/>`
}

function svgAtomNode(
  atom: LewisStructure['atoms'][0],
  pos: { x: number; y: number },
  adj: Record<string, string[]>,
  positions: Record<string, { x: number; y: number }>,
): string {
  const color = getColor(atom.element)
  const r     = atom.element === 'H' ? H_ATOM_R : ATOM_R

  const bondAngles = (adj[atom.id] ?? []).map(nid => {
    const npos = positions[nid]
    return npos ? Math.atan2(npos.y - pos.y, npos.x - pos.x) * (180 / Math.PI) : 0
  })
  const lpAngles = getLonePairAngles(bondAngles, atom.lone_pairs)

  const chargeLabel = atom.formal_charge === 0 ? null
    : atom.formal_charge ===  1 ? '+'
    : atom.formal_charge === -1 ? '&#x2212;'
    : atom.formal_charge  >  0 ? `+${atom.formal_charge}`
    : `${atom.formal_charge}`

  const lpSvg = lpAngles.map(angle => {
    const rad = angle * (Math.PI / 180)
    const lpCx = pos.x + Math.cos(rad) * LP_OFFSET
    const lpCy = pos.y + Math.sin(rad) * LP_OFFSET
    const perpRad = rad + Math.PI / 2
    const dx = Math.cos(perpRad) * LP_DOT_SEP
    const dy = Math.sin(perpRad) * LP_DOT_SEP
    return `<circle cx="${lpCx + dx}" cy="${lpCy + dy}" r="${LP_R}" fill="#1a1a1a"/>` +
           `<circle cx="${lpCx - dx}" cy="${lpCy - dy}" r="${LP_R}" fill="#1a1a1a"/>`
  }).join('')

  const fs = atom.element.length > 1 ? 11 : r === H_ATOM_R ? 11 : 13
  const chargeSvg = chargeLabel
    ? `<text x="${pos.x + r}" y="${pos.y - r + 1}" text-anchor="start" fill="white" font-size="10" font-weight="bold" font-family="sans-serif">${chargeLabel}</text>`
    : ''

  return lpSvg +
    `<circle cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${color}" stroke="#555" stroke-width="1.5"/>` +
    `<text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="central" fill="white" font-size="${fs}" font-weight="700" font-family="sans-serif">${atom.element}</text>` +
    chargeSvg
}

export function lewisToSvgString(structure: LewisStructure, width = 280, height = 190): string {
  const positions = computeLayout(structure.atoms, structure.bonds, structure.geometry)
  const adj: Record<string, string[]> = {}
  structure.atoms.forEach(a => { adj[a.id] = [] })
  structure.bonds.forEach(b => { adj[b.from].push(b.to); adj[b.to].push(b.from) })

  const bonds = structure.bonds.map(b => svgBondLines(b, positions)).join('')
  const atoms = structure.atoms.map(a => {
    const pos = positions[a.id]
    return pos ? svgAtomNode(a, pos, adj, positions) : ''
  }).join('')

  return `<svg viewBox="0 0 ${SVG_W} ${SVG_H}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background:#f8f9fa;border:1px solid #ccc;border-radius:3px">${bonds}${atoms}</svg>`
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LewisStructureDiagram({
  structure,
}: {
  structure: LewisStructure;
}) {
  const positions = computeLayout(
    structure.atoms,
    structure.bonds,
    structure.geometry,
  );

  const adj: Record<string, string[]> = {};
  structure.atoms.forEach((a) => {
    adj[a.id] = [];
  });
  structure.bonds.forEach((b) => {
    adj[b.from].push(b.to);
    adj[b.to].push(b.from);
  });

  return (
    <div
      className="rounded-md border border-border overflow-hidden"
      style={{ background: "#0e1016" }}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        aria-label={`Lewis structure of ${structure.name}`}
      >
        {/* Bond lines drawn first so atoms render on top */}
        {structure.bonds.map((bond, i) => (
          <BondLines key={i} bond={bond} positions={positions} />
        ))}

        {/* Atoms + lone pairs */}
        {structure.atoms.map((atom) => {
          const pos = positions[atom.id];
          if (!pos) return null;
          return (
            <AtomNode
              key={atom.id}
              atom={atom}
              pos={pos}
              adj={adj}
              positions={positions}
            />
          );
        })}
      </svg>
    </div>
  );
}

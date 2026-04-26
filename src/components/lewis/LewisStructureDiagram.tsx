import type { ReactNode } from "react";
import type { LewisStructure } from "../../pages/LewisPage";

// ── Layout constants ──────────────────────────────────────────────────────────

const SVG_W    = 520;
const SVG_H    = 360;
const BOND_LEN = 79;
const LP_OFFSET = 15;
const LP_R      = 1.3;
const LP_DOT_SEP = 2.5;
const CANVAS_BG  = "#0b0e17";   // clearance rect colour — must match outer div bg

// ── Atom metrics ──────────────────────────────────────────────────────────────
// Returns the half-width and font size used to draw and trim bonds for each element.

function atomMetrics(el: string): { hw: number; hh: number; fs: number; trim: number } {
  if (el === "H")        return { hw:  8, hh: 10, fs: 13, trim: 10 };
  if (el.length === 1)   return { hw: 11, hh: 11, fs: 17, trim: 13 };
  return                        { hw: 15, hh: 11, fs: 14, trim: 17 };
}

// ── Element colours (for text, not fill) ──────────────────────────────────────

const ELEM_COLORS: Record<string, string> = {
  H:  "#9ca3af",
  C:  "#e2e8f0",   // near-white — C is the most common, should be readable
  N:  "#6ea8fe",
  O:  "#f87171",
  F:  "#4ade80",
  Cl: "#4ade80",
  Br: "#fb923c",
  I:  "#c084fc",
  S:  "#fbbf24",
  P:  "#fb923c",
  Na: "#a78bfa",
  K:  "#818cf8",
  Li: "#c084fc",
  Ca: "#94a3b8",
  Mg: "#6ee7b7",
  Al: "#94a3b8",
  Si: "#a8a29e",
  Fe: "#c07040",
  Cu: "#c88050",
  Zn: "#7080b0",
  B:  "#fb923c",
  Xe: "#60a5fa",
  Kr: "#818cf8",
};

function getColor(el: string): string {
  return ELEM_COLORS[el] ?? "#60a5fa";
}

// ── Bond-line colour ──────────────────────────────────────────────────────────

const BOND_COLOR  = "rgba(226,232,240,0.70)";
const BOND_W      = 1.5;
const BOND_OFFSET = 4;   // parallel offset for double / triple bonds

// ── Angle helpers (unchanged from original) ───────────────────────────────────

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
  return Array.from({ length: n }, (_, i) => -90 + (360 * i) / n);
}

function getLonePairAngles(bondAngles: number[], count: number): number[] {
  if (count === 0) return [];
  if (bondAngles.length === 0)
    return Array.from({ length: count }, (_, i) => (360 * i) / count);
  const total = bondAngles.length + count;
  const step  = 360 / total;
  const norm  = (a: number) => ((a % 360) + 360) % 360;
  const angDiff = (a: number, b: number) => { const d = norm(a - b); return d > 180 ? 360 - d : d; };
  const normBonds = bondAngles.map(norm);
  let bestOffset = normBonds[0], bestError = Infinity;
  for (const anchor of normBonds) {
    for (let slot = 0; slot < total; slot++) {
      const offset = anchor - slot * step;
      let error = 0;
      for (const ba of normBonds) {
        const nearest = Math.round(norm(ba - offset) / step);
        error += angDiff(ba, offset + nearest * step) ** 2;
      }
      if (error < bestError) { bestError = error; bestOffset = offset; }
    }
  }
  const grid     = Array.from({ length: total }, (_, i) => norm(bestOffset + i * step));
  const occupied = new Set<number>();
  for (const ba of normBonds) {
    let best = -1, minD = Infinity;
    for (let i = 0; i < grid.length; i++) {
      if (occupied.has(i)) continue;
      const d = angDiff(ba, grid[i]);
      if (d < minD) { minD = d; best = i; }
    }
    if (best >= 0) occupied.add(best);
  }
  return grid.filter((_, i) => !occupied.has(i));
}

function bestChargeAngle(occupiedAngles: number[]): number {
  if (occupiedAngles.length === 0) return -45;
  const norm = (a: number) => ((a % 360) + 360) % 360;
  const diff = (a: number, b: number) => { const d = Math.abs(norm(a) - norm(b)); return d > 180 ? 360 - d : d; };
  let bestAngle = -45, bestMin = -1;
  for (let a = 0; a < 360; a += 10) {
    const minGap = Math.min(...occupiedAngles.map(o => diff(a, o)));
    if (minGap > bestMin) { bestMin = minGap; bestAngle = a; }
  }
  return bestAngle;
}

// ── BFS fan layout (unchanged) ────────────────────────────────────────────────

function bfsFanLayout(
  positions: Record<string, { x: number; y: number }>,
  adj: Record<string, string[]>,
  frontier: string[],
) {
  let current = frontier.slice();
  for (let depth = 0; depth < 6 && current.length > 0; depth++) {
    const parentToChildren: Record<string, string[]> = {};
    current.forEach(pid => {
      const ch = adj[pid].filter(n => !positions[n]);
      if (ch.length) parentToChildren[pid] = ch;
    });
    const next: string[] = [];
    Object.entries(parentToChildren).forEach(([pid, children]) => {
      const pp = positions[pid];
      const backN = adj[pid].find(n => positions[n]);
      let forwardAngle = 0;
      if (backN) {
        const bp = positions[backN];
        forwardAngle = Math.atan2(bp.y - pp.y, bp.x - pp.x) * (180 / Math.PI) + 180;
      }
      const n = children.length;
      const spread = n === 1 ? 0 : Math.min(60, 120 / (n - 1));
      const start  = forwardAngle - (spread * (n - 1)) / 2;
      children.forEach((cid, i) => {
        const rad = (start + i * spread) * (Math.PI / 180);
        positions[cid] = { x: pp.x + Math.cos(rad) * BOND_LEN, y: pp.y + Math.sin(rad) * BOND_LEN };
        next.push(cid);
      });
    });
    current = next;
  }
}

// ── Layout (unchanged) ────────────────────────────────────────────────────────

function computeLayout(
  atoms: LewisStructure["atoms"],
  bonds: LewisStructure["bonds"],
  geometry: string,
): Record<string, { x: number; y: number }> {
  if (atoms.length === 0) return {};
  const cx = SVG_W / 2, cy = SVG_H / 2;
  const positions: Record<string, { x: number; y: number }> = {};

  if (atoms.length === 1) { positions[atoms[0].id] = { x: cx, y: cy }; return positions; }

  const adj: Record<string, string[]> = {};
  atoms.forEach(a => { adj[a.id] = []; });
  bonds.forEach(b => { adj[b.from].push(b.to); adj[b.to].push(b.from); });

  if (bonds.length === 0) {
    const spacing = BOND_LEN * 1.5;
    const totalW  = (atoms.length - 1) * spacing;
    atoms.forEach((a, i) => { positions[a.id] = { x: cx - totalW / 2 + i * spacing, y: cy }; });
    return positions;
  }

  if (geometry === "chain") {
    const atomById: Record<string, typeof atoms[0]> = {};
    atoms.forEach(a => { atomById[a.id] = a; });
    let leftID = "", rightID = "";
    for (const b of bonds) {
      if (
        atomById[b.from]?.element !== "H" && atomById[b.to]?.element !== "H" &&
        adj[b.from].length >= 2 && adj[b.to].length >= 2
      ) {
        if (adj[b.from].length >= adj[b.to].length) { leftID = b.from; rightID = b.to; }
        else { leftID = b.to; rightID = b.from; }
        break;
      }
    }
    if (leftID && rightID) {
      positions[leftID]  = { x: cx - BOND_LEN / 2, y: cy };
      positions[rightID] = { x: cx + BOND_LEN / 2, y: cy };
      bfsFanLayout(positions, adj, [leftID, rightID]);
      return positions;
    }
  }

  const central = atoms.reduce((best, a) => {
    const bc = adj[a.id].length, bb = adj[best.id].length;
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
    positions[tid] = { x: cx + Math.cos(rad) * BOND_LEN, y: cy + Math.sin(rad) * BOND_LEN };
  });
  bfsFanLayout(positions, adj, directNeighbors.filter(id => positions[id]));
  return positions;
}

// ── Bond lines ────────────────────────────────────────────────────────────────

function BondLines({
  bond,
  positions,
  fromEl,
  toEl,
}: {
  bond: LewisStructure["bonds"][0];
  positions: Record<string, { x: number; y: number }>;
  fromEl: string;
  toEl: string;
}) {
  const p1 = positions[bond.from], p2 = positions[bond.to];
  if (!p1 || !p2) return null;

  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;

  const r1 = atomMetrics(fromEl).trim;
  const r2 = atomMetrics(toEl).trim;

  const x1 = p1.x + ux * r1, y1 = p1.y + uy * r1;
  const x2 = p2.x - ux * r2, y2 = p2.y - uy * r2;

  const props = { stroke: BOND_COLOR, strokeWidth: BOND_W };

  if (bond.order === 2) {
    const o = BOND_OFFSET;
    return (
      <g>
        <line x1={x1 + px*o} y1={y1 + py*o} x2={x2 + px*o} y2={y2 + py*o} {...props} />
        <line x1={x1 - px*o} y1={y1 - py*o} x2={x2 - px*o} y2={y2 - py*o} {...props} />
      </g>
    );
  }
  if (bond.order === 3) {
    const o = BOND_OFFSET + 1;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} {...props} />
        <line x1={x1 + px*o} y1={y1 + py*o} x2={x2 + px*o} y2={y2 + py*o} {...props} />
        <line x1={x1 - px*o} y1={y1 - py*o} x2={x2 - px*o} y2={y2 - py*o} {...props} />
      </g>
    );
  }
  return <line x1={x1} y1={y1} x2={x2} y2={y2} {...props} />;
}

// ── Atom node (text + clearance + lone pairs + charge) ────────────────────────

function AtomNode({
  atom,
  pos,
  adj,
  positions,
  badgeOverride,
}: {
  atom: LewisStructure["atoms"][0];
  pos: { x: number; y: number };
  adj: Record<string, string[]>;
  positions: Record<string, { x: number; y: number }>;
  badgeOverride?: ReactNode;
}) {
  const color = getColor(atom.element);
  const { hw, hh, fs } = atomMetrics(atom.element);

  const bondAngles = (adj[atom.id] ?? []).map(nid => {
    const npos = positions[nid];
    if (!npos) return 0;
    return Math.atan2(npos.y - pos.y, npos.x - pos.x) * (180 / Math.PI);
  });

  const lpAngles = getLonePairAngles(bondAngles, atom.lone_pairs);

  const chargeLabel =
    atom.formal_charge === 0  ? null
    : atom.formal_charge ===  1 ? "+"
    : atom.formal_charge === -1 ? "−"
    : atom.formal_charge  >  0  ? `+${atom.formal_charge}`
    : `${atom.formal_charge}`;

  const BADGE_R    = 5;
  const BADGE_DIST = Math.max(hw, hh) + BADGE_R + 3;
  const chargeAngle = bestChargeAngle([...bondAngles, ...lpAngles]);
  const chargeRad   = chargeAngle * (Math.PI / 180);
  const chargeBx    = pos.x + Math.cos(chargeRad) * BADGE_DIST;
  const chargeBy    = pos.y + Math.sin(chargeRad) * BADGE_DIST;

  return (
    <g>
      {/* Clearance rect — masks bond lines under the symbol */}
      <rect
        x={pos.x - hw - 2} y={pos.y - hh - 1}
        width={(hw + 2) * 2} height={(hh + 1) * 2}
        fill={CANVAS_BG}
        rx="1"
      />

      {/* Element symbol */}
      <text
        x={pos.x} y={pos.y}
        textAnchor="middle" dominantBaseline="central"
        fill={color}
        fontSize={fs}
        fontWeight="700"
        fontFamily="ui-monospace, 'Cascadia Code', 'Fira Code', monospace"
        letterSpacing="-0.02em"
      >
        {atom.element}
      </text>

      {/* Lone pair dots — drawn after clearance rect so they render on top */}
      {lpAngles.map((angle, i) => {
        const rad = angle * (Math.PI / 180);
        const lpCx = pos.x + Math.cos(rad) * LP_OFFSET;
        const lpCy = pos.y + Math.sin(rad) * LP_OFFSET;
        const perpRad = rad + Math.PI / 2;
        const dx = Math.cos(perpRad) * LP_DOT_SEP;
        const dy = Math.sin(perpRad) * LP_DOT_SEP;
        return (
          <g key={i}>
            <circle cx={lpCx + dx} cy={lpCy + dy} r={LP_R} fill="rgba(var(--overlay),0.80)" />
            <circle cx={lpCx - dx} cy={lpCy - dy} r={LP_R} fill="rgba(var(--overlay),0.80)" />
          </g>
        );
      })}

      {/* Formal charge badge — replaced by badgeOverride when provided */}
      {badgeOverride !== undefined
        ? badgeOverride
        : chargeLabel && (
          <g>
            <circle cx={chargeBx} cy={chargeBy} r={BADGE_R}
              fill={CANVAS_BG}
              stroke="rgba(var(--overlay),0.35)" strokeWidth="0.8"
            />
            <text
              x={chargeBx} y={chargeBy}
              textAnchor="middle" dominantBaseline="central"
              dy="-1"
              fill="rgba(var(--overlay),0.9)"
              fontSize={chargeLabel.length > 1 ? 6 : 7}
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              {chargeLabel}
            </text>
          </g>
        )
      }
    </g>
  );
}

// ── SVG string export (print / answer-key, light background) ─────────────────

function svgBondLinesStr(
  bond: LewisStructure["bonds"][0],
  positions: Record<string, { x: number; y: number }>,
  fromEl: string,
  toEl: string,
): string {
  const p1 = positions[bond.from], p2 = positions[bond.to];
  if (!p1 || !p2) return "";
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len = Math.sqrt(dx*dx + dy*dy) || 1;
  const ux = dx/len, uy = dy/len, px = -uy, py = ux;
  const r1 = atomMetrics(fromEl).trim, r2 = atomMetrics(toEl).trim;
  const x1 = p1.x + ux*r1, y1 = p1.y + uy*r1;
  const x2 = p2.x - ux*r2, y2 = p2.y - uy*r2;
  const c = "#1a1a1a", w = 1.5;
  if (bond.order === 2) {
    const o = BOND_OFFSET;
    return `<line x1="${x1+px*o}" y1="${y1+py*o}" x2="${x2+px*o}" y2="${y2+py*o}" stroke="${c}" stroke-width="${w}"/>` +
           `<line x1="${x1-px*o}" y1="${y1-py*o}" x2="${x2-px*o}" y2="${y2-py*o}" stroke="${c}" stroke-width="${w}"/>`;
  }
  if (bond.order === 3) {
    const o = BOND_OFFSET + 1;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/>` +
           `<line x1="${x1+px*o}" y1="${y1+py*o}" x2="${x2+px*o}" y2="${y2+py*o}" stroke="${c}" stroke-width="${w}"/>` +
           `<line x1="${x1-px*o}" y1="${y1-py*o}" x2="${x2-px*o}" y2="${y2-py*o}" stroke="${c}" stroke-width="${w}"/>`;
  }
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/>`;
}

function svgAtomNodeStr(
  atom: LewisStructure["atoms"][0],
  pos: { x: number; y: number },
  adj: Record<string, string[]>,
  positions: Record<string, { x: number; y: number }>,
): string {
  const { hw, hh, fs } = atomMetrics(atom.element);
  const bondAngles = (adj[atom.id] ?? []).map(nid => {
    const npos = positions[nid];
    return npos ? Math.atan2(npos.y - pos.y, npos.x - pos.x) * (180 / Math.PI) : 0;
  });
  const lpAngles = getLonePairAngles(bondAngles, atom.lone_pairs);
  const chargeLabel = atom.formal_charge === 0 ? null
    : atom.formal_charge ===  1 ? "+"
    : atom.formal_charge === -1 ? "&#x2212;"
    : atom.formal_charge  >  0  ? `+${atom.formal_charge}`
    : `${atom.formal_charge}`;

  const lpSvg = lpAngles.map(angle => {
    const rad = angle * (Math.PI / 180);
    const lpCx = pos.x + Math.cos(rad) * LP_OFFSET;
    const lpCy = pos.y + Math.sin(rad) * LP_OFFSET;
    const perpRad = rad + Math.PI / 2;
    const dx = Math.cos(perpRad) * LP_DOT_SEP;
    const dy = Math.sin(perpRad) * LP_DOT_SEP;
    return `<circle cx="${lpCx+dx}" cy="${lpCy+dy}" r="${LP_R}" fill="#333"/>` +
           `<circle cx="${lpCx-dx}" cy="${lpCy-dy}" r="${LP_R}" fill="#333"/>`;
  }).join("");

  const BADGE_R = 5, BADGE_DIST = Math.max(hw, hh) + BADGE_R + 3;
  const chargeAngle = bestChargeAngle([...bondAngles, ...lpAngles]);
  const chargeBx    = pos.x + Math.cos(chargeAngle * Math.PI / 180) * BADGE_DIST;
  const chargeBy    = pos.y + Math.sin(chargeAngle * Math.PI / 180) * BADGE_DIST;
  const cfs = chargeLabel && chargeLabel.length > 1 ? 6 : 7;
  const chargeSvg = chargeLabel
    ? `<circle cx="${chargeBx}" cy="${chargeBy}" r="${BADGE_R}" fill="#f8f9fa" stroke="#888" stroke-width="0.8"/>` +
      `<text x="${chargeBx}" y="${chargeBy}" text-anchor="middle" dominant-baseline="central" dy="-1" fill="#111" font-size="${cfs}" font-weight="bold" font-family="sans-serif">${chargeLabel}</text>`
    : "";

  return lpSvg +
    `<rect x="${pos.x-hw-2}" y="${pos.y-hh-1}" width="${(hw+2)*2}" height="${(hh+1)*2}" fill="#f8f9fa" rx="1"/>` +
    `<text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="central" fill="#111" font-size="${fs}" font-weight="700" font-family="monospace">${atom.element}</text>` +
    chargeSvg;
}

export function lewisToSvgString(structure: LewisStructure, width = 280, height = 190): string {
  const positions = computeLayout(structure.atoms, structure.bonds, structure.geometry);
  const adj: Record<string, string[]> = {};
  structure.atoms.forEach(a => { adj[a.id] = []; });
  structure.bonds.forEach(b => { adj[b.from].push(b.to); adj[b.to].push(b.from); });
  const atomById: Record<string, typeof structure.atoms[0]> = {};
  structure.atoms.forEach(a => { atomById[a.id] = a; });

  const bondsStr = structure.bonds.map(b =>
    svgBondLinesStr(b, positions, atomById[b.from]?.element ?? "C", atomById[b.to]?.element ?? "C")
  ).join("");
  const atomsStr = structure.atoms.map(a => {
    const pos = positions[a.id];
    return pos ? svgAtomNodeStr(a, pos, adj, positions) : "";
  }).join("");

  return `<svg viewBox="0 0 ${SVG_W} ${SVG_H}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background:#f8f9fa;border:1px solid #ccc;border-radius:3px">${bondsStr}${atomsStr}</svg>`;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LewisStructureDiagram({
  structure,
  renderAtomBadge,
}: {
  structure: LewisStructure
  /** When provided, replaces the built-in FC badge for every atom.
   *  Receives atom, atom-center position, and computed badge position. */
  renderAtomBadge?: (
    atom: LewisStructure["atoms"][0],
    atomCenter: { x: number; y: number },
    badgePos:   { x: number; y: number },
  ) => ReactNode
}) {
  const positions = computeLayout(structure.atoms, structure.bonds, structure.geometry);

  const adj: Record<string, string[]> = {};
  structure.atoms.forEach(a => { adj[a.id] = []; });
  structure.bonds.forEach(b => { adj[b.from].push(b.to); adj[b.to].push(b.from); });

  const atomById: Record<string, typeof structure.atoms[0]> = {};
  structure.atoms.forEach(a => { atomById[a.id] = a; });

  return (
    <div
      className="rounded-sm border border-border overflow-hidden"
      style={{ background: CANVAS_BG }}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        aria-label={`Lewis structure of ${structure.name}`}
      >
        {/* Subtle grid for visual grounding */}
        <defs>
          <pattern id="lewis-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(var(--overlay),0.025)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width={SVG_W} height={SVG_H} fill="url(#lewis-grid)" />

        {/* Bonds first so atoms render on top */}
        {structure.bonds.map((bond, i) => (
          <BondLines
            key={i}
            bond={bond}
            positions={positions}
            fromEl={atomById[bond.from]?.element ?? "C"}
            toEl={atomById[bond.to]?.element ?? "C"}
          />
        ))}

        {/* Atoms + lone pairs + charge badges */}
        {structure.atoms.map(atom => {
          const pos = positions[atom.id];
          if (!pos) return null;
          let badgeOverride: ReactNode | undefined
          if (renderAtomBadge) {
            const { hw, hh } = atomMetrics(atom.element);
            const bondAngles = (adj[atom.id] ?? []).map(nid => {
              const npos = positions[nid];
              return npos ? Math.atan2(npos.y - pos.y, npos.x - pos.x) * (180 / Math.PI) : 0;
            });
            const lpAngles    = getLonePairAngles(bondAngles, atom.lone_pairs);
            const BADGE_R     = 5;
            const BADGE_DIST  = Math.max(hw, hh) + BADGE_R + 3;
            const chargeAngle = bestChargeAngle([...bondAngles, ...lpAngles]);
            const chargeRad   = chargeAngle * (Math.PI / 180);
            const bx = pos.x + Math.cos(chargeRad) * BADGE_DIST;
            const by = pos.y + Math.sin(chargeRad) * BADGE_DIST;
            badgeOverride = renderAtomBadge(atom, pos, { x: bx, y: by });
          }
          return (
            <AtomNode key={atom.id} atom={atom} pos={pos} adj={adj} positions={positions}
              badgeOverride={badgeOverride} />
          );
        })}
      </svg>
    </div>
  );
}

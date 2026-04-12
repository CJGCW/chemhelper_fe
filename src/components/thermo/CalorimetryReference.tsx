function SectionHead({ label }: { label: string }) {
  return <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</h3>
}

const SPECIFIC_HEATS = [
  { substance: 'Water (l)',  formula: 'H₂O (l)',  c: '4.184'  },
  { substance: 'Water (s)',  formula: 'H₂O (s)',  c: '2.09'   },
  { substance: 'Water (g)',  formula: 'H₂O (g)',  c: '2.01'   },
  { substance: 'Aluminum',   formula: 'Al',        c: '0.897'  },
  { substance: 'Copper',     formula: 'Cu',        c: '0.385'  },
  { substance: 'Iron',       formula: 'Fe',        c: '0.449'  },
  { substance: 'Gold',       formula: 'Au',        c: '0.129'  },
  { substance: 'Silver',     formula: 'Ag',        c: '0.235'  },
  { substance: 'Ethanol',    formula: 'C₂H₅OH',   c: '2.44'   },
]

export default function CalorimetryReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* Formula boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="rounded-sm border border-border bg-raised px-5 py-4 flex flex-col gap-3">
          <p className="font-mono text-2xl font-bold text-bright">q = mcΔT</p>
          <div className="flex flex-col gap-1 pt-2 border-t border-border">
            {[
              { f: 'q = m × c × ΔT',    label: 'heat transferred' },
              { f: 'm = q / (c × ΔT)',   label: 'mass'            },
              { f: 'c = q / (m × ΔT)',   label: 'specific heat'   },
              { f: 'ΔT = q / (m × c)',   label: 'temp. change'    },
            ].map(r => (
              <div key={r.f} className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-bright w-36 shrink-0">{r.f}</span>
                <span className="font-mono text-[10px] text-dim">→ {r.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-border bg-raised px-5 py-4 flex flex-col gap-3">
          <p className="font-mono text-2xl font-bold text-bright">q = CΔT</p>
          <div className="flex flex-col gap-1 pt-2 border-t border-border">
            {[
              { f: 'q = C × ΔT',   label: 'heat absorbed'       },
              { f: 'C = q / ΔT',   label: 'heat capacity'       },
              { f: 'ΔT = q / C',   label: 'temp. change'        },
            ].map(r => (
              <div key={r.f} className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-bright w-36 shrink-0">{r.f}</span>
                <span className="font-mono text-[10px] text-dim">→ {r.label}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-dim border-t border-border pt-2">
            C = heat capacity of the entire calorimeter (J/°C or kJ/°C)
          </p>
        </div>
      </div>

      {/* Variables */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Variables" />
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            { sym: 'q',  name: 'Heat transferred',         unit: 'J  or  kJ',          note: 'positive = endothermic, negative = exothermic' },
            { sym: 'm',  name: 'Mass',                     unit: 'g',                   note: 'mass of the substance being heated/cooled' },
            { sym: 'c',  name: 'Specific heat capacity',   unit: 'J/(g·°C)',            note: 'depends on substance (see table)' },
            { sym: 'ΔT', name: 'Temperature change',       unit: '°C  (or K)',          note: 'ΔT = Tf − Ti; sign matters' },
            { sym: 'C',  name: 'Heat capacity',            unit: 'J/°C  or  kJ/°C',    note: 'property of the whole calorimeter' },
          ].map(r => (
            <div key={r.sym}
              className="grid grid-cols-[2.5rem_auto_1fr] gap-x-4 items-start px-4 py-2.5 border-b border-border last:border-b-0">
              <span className="font-mono text-base font-bold pt-0.5" style={{ color: 'var(--c-halogen)' }}>{r.sym}</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-sans text-sm text-primary">{r.name}</span>
                <span className="font-mono text-[10px] text-dim">{r.note}</span>
              </div>
              <span className="font-mono text-sm text-secondary text-right">{r.unit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Specific heats table */}
        <div className="flex flex-col gap-2">
          <SectionHead label="Specific Heat Capacities" />
          <div className="rounded-sm border border-border bg-surface overflow-hidden">
            <div className="grid grid-cols-[1fr_5rem_4rem] gap-x-3 px-4 py-2 bg-raised border-b border-border">
              <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Substance</span>
              <span className="font-mono text-[10px] text-dim tracking-widest uppercase text-right">c (J/g·°C)</span>
              <span className="font-mono text-[10px] text-dim tracking-widest uppercase text-right">Formula</span>
            </div>
            {SPECIFIC_HEATS.map(r => (
              <div key={r.substance}
                className="grid grid-cols-[1fr_5rem_4rem] gap-x-3 px-4 py-2 border-b border-border last:border-b-0">
                <span className="font-sans text-sm text-primary">{r.substance}</span>
                <span className="font-mono text-sm text-bright text-right">{r.c}</span>
                <span className="font-mono text-xs text-secondary text-right">{r.formula}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sign conventions */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <SectionHead label="Sign Conventions" />
            <div className="rounded-sm border border-border bg-surface overflow-hidden">
              {[
                { sign: '+ q', meaning: 'System absorbs heat',   type: 'Endothermic' },
                { sign: '− q', meaning: 'System releases heat',  type: 'Exothermic'  },
                { sign: '+ ΔT', meaning: 'Temperature rises',   type: 'Surroundings get hotter' },
                { sign: '− ΔT', meaning: 'Temperature drops',   type: 'Surroundings get colder' },
              ].map(r => (
                <div key={r.sign}
                  className="grid grid-cols-[3rem_1fr] gap-x-3 items-baseline px-4 py-2.5 border-b border-border last:border-b-0">
                  <span className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>{r.sign}</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans text-sm text-primary">{r.meaning}</span>
                    <span className="font-mono text-[10px] text-dim">{r.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unit conversions */}
          <div className="flex flex-col gap-2">
            <SectionHead label="Energy Unit Conversions" />
            <div className="rounded-sm border border-border bg-surface overflow-hidden">
              {[
                { from: '1 kJ',   to: '1000 J'     },
                { from: '1 cal',  to: '4.184 J'    },
                { from: '1 kcal', to: '4184 J'     },
                { from: '1 kcal', to: '1000 cal'   },
              ].map(r => (
                <div key={r.from}
                  className="flex items-center gap-2 px-4 py-2 border-b border-border last:border-b-0">
                  <span className="font-mono text-sm text-bright">{r.from}</span>
                  <span className="font-mono text-xs text-dim">=</span>
                  <span className="font-mono text-sm text-primary">{r.to}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calorimeter types */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Calorimeter Types" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="rounded-sm border border-border bg-surface px-5 py-4 flex flex-col gap-2">
            <p className="font-sans text-sm font-semibold text-bright">Coffee-Cup Calorimeter</p>
            <p className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>
              q_rxn = −q_sol = −(m × c × ΔT)
            </p>
            <ul className="flex flex-col gap-1 mt-1">
              {[
                'Open to atmosphere — constant pressure',
                'Used for reactions in solution',
                'Assumes the calorimeter absorbs negligible heat',
                'm and c refer to the solution',
              ].map(s => (
                <li key={s} className="font-sans text-xs text-secondary flex gap-2">
                  <span className="text-dim shrink-0">·</span>{s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-sm border border-border bg-surface px-5 py-4 flex flex-col gap-2">
            <p className="font-sans text-sm font-semibold text-bright">Bomb Calorimeter</p>
            <p className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>
              q_rxn = −C_cal × ΔT
            </p>
            <ul className="flex flex-col gap-1 mt-1">
              {[
                'Sealed vessel — constant volume',
                'Used for combustion reactions',
                'C_cal is the heat capacity of the whole apparatus',
                'Measures internal energy change (ΔE)',
              ].map(s => (
                <li key={s} className="font-sans text-xs text-secondary flex gap-2">
                  <span className="text-dim shrink-0">·</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  )
}

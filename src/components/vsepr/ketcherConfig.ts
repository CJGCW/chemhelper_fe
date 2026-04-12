// Shared Ketcher configuration for all VSEPR editors (practice + test modal).
// Only relevant to VSEPR — do not use for Lewis structure editors.

// Buttons hidden via Ketcher's buttons prop / isHidden mechanism.
// Many keys are not in Ketcher's ButtonName type but are handled by its isHidden hook;
// cast to `never` when passing to the Editor component.
export const VSEPR_HIDDEN_BUTTONS: Record<string, { hidden: boolean }> = {
  // Top-bar tools
  miew:     { hidden: true }, // 3D viewer
  check:    { hidden: true }, // structure check dialog
  analyse:  { hidden: true }, // calculated values
  settings: { hidden: true }, // settings dialog
  arom:     { hidden: true }, // aromatize
  dearom:   { hidden: true }, // dearomatize
  cip:      { hidden: true }, // CIP stereodescriptors

  // Left-toolbar drawing tools
  chain:              { hidden: true },
  'enhanced-stereo':  { hidden: true },
  sgroup:             { hidden: true },
  rgroup:             { hidden: true },
  'rgroup-label':     { hidden: true },
  'rgroup-fragment':  { hidden: true },
  'rgroup-attpoints': { hidden: true },

  // Reaction tools
  'reaction-plus':                                       { hidden: true },
  arrows:                                                { hidden: true },
  'reaction-arrow-open-angle':                           { hidden: true },
  'reaction-arrow-filled-triangle':                      { hidden: true },
  'reaction-arrow-filled-bow':                           { hidden: true },
  'reaction-arrow-dashed-open-angle':                    { hidden: true },
  'reaction-arrow-failed':                               { hidden: true },
  'reaction-arrow-both-ends-filled-triangle':            { hidden: true },
  'reaction-arrow-equilibrium-filled-half-bow':          { hidden: true },
  'reaction-arrow-equilibrium-filled-triangle':          { hidden: true },
  'reaction-arrow-equilibrium-open-angle':               { hidden: true },
  'reaction-arrow-unbalanced-equilibrium-filled-half-bow':      { hidden: true },
  'reaction-arrow-unbalanced-equilibrium-open-half-angle':      { hidden: true },
  'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow':{ hidden: true },
  'reaction-arrow-unbalanced-equilibrium-filled-half-triangle': { hidden: true },
  'reaction-arrow-elliptical-arc-arrow-filled-bow':      { hidden: true },
  'reaction-arrow-elliptical-arc-arrow-filled-triangle': { hidden: true },
  'reaction-arrow-elliptical-arc-arrow-open-angle':      { hidden: true },
  'reaction-arrow-elliptical-arc-arrow-open-half-angle': { hidden: true },
  'reaction-arrow-retrosynthetic':                       { hidden: true },
  'reaction-mapping-tools': { hidden: true },
  'reaction-automap':       { hidden: true },
  'reaction-map':           { hidden: true },
  'reaction-unmap':         { hidden: true },

  // Shapes, text, annotation
  shapes:            { hidden: true },
  shape:             { hidden: true },
  'shape-ellipse':   { hidden: true },
  'shape-rectangle': { hidden: true },
  'shape-line':      { hidden: true },
  text:              { hidden: true },

  // Right-toolbar atom buttons
  'any-atom':       { hidden: true },
  'extended-table': { hidden: true },

  // Template / rings library button
  'template-lib': { hidden: true },

  // Macromolecule / monomer tools
  'create-monomer': { hidden: true },
}

// CSS overrides for elements not reachable via the buttons prop:
//   bottom-toolbar  — ring template quick-picks strip
//   polymer-toggler — macromolecule mode switcher
export const KETCHER_OVERRIDES_CSS_ID = 'ketcher-vsepr-overrides'
export const KETCHER_OVERRIDES_CSS = `
  [data-testid="bottom-toolbar"]  { display: none !important; }
  [data-testid="polymer-toggler"] { display: none !important; }
`

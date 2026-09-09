const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const appScript = fs.readFileSync(path.join(__dirname, 'app-script.js'), 'utf-8');

const skeleton = `<!doctype html><html><head></head><body>
<div class="sheet" id="sheet"></div>
<div class="save-bar" id="saveBar">
  <span class="msg"><span class="dot"></span><span id="saveMsg">Unsaved edits</span></span>
  <button class="btn-discard" id="btnDiscard" type="button">Discard</button>
  <button class="btn-save" id="btnSave" type="button">Save changes</button>
</div>
<script id="app-script">
${appScript}
</script>
</body></html>`;

const dom = new JSDOM(skeleton, { runScripts: 'dangerously' });
const document = dom.window.document;

// Light-mode CSS custom properties, resolved from the artifact's :root block.
const VARS = {
  page: '#fffefb', paper: '#fffefb', ink: '#0b0b0b', 'ink-soft': '#43423e', 'ink-mute': '#8a887f',
  rule: '#e1e0d9', 'rule-strong': '#c3c2b7', border: 'rgba(11,11,11,0.10)',
  accent: '#a8791f', 'accent-ink': '#3a3833', 'accent-100': '#f0e6cc', 'accent-400': '#c9a04c', 'accent-700': '#3a3833',
  claude: '#cf6d4a', gpt: '#eb6834', 'fam-gpt': '#129985', gemini: '#4975cf', grok: '#1c1d24',
  'pending-bg': '#f3f2ee', 'pending-border': '#c9c7bc',
  tier1: '#2a78d6', tier2: '#3a3833', tier3: '#c76b54',
};

const CLASS_STYLE = {
  'bar-label': 'fill:#43423e;font-size:10.3px;',
  'bar-value': 'fill:#0b0b0b;font-size:10.3px;font-weight:600;',
  'axis-tick': 'fill:#8a887f;font-size:9.5px;',
  'grid-line': 'stroke:#e1e0d9;stroke-width:1;',
  'baseline': 'stroke:#c3c2b7;stroke-width:1;',
  'tier-label': 'fill:#8a887f;font-size:9.5px;letter-spacing:.06em;',
};

const CHART_IDS = [
  'chart-taxonomy', 'chart-tasktype', 'chart-assaytype', 'chart-disease', 'chart-genetarget', 'chart-tissue',
  'chart-lens-pipeline', 'chart-lens', 'chart-kjd', 'chart-gradertype', 'chart-failuremode',
  'chart-fig3-passrate', 'chart-fig3-repeat', 'chart-full-harnessdelta',
  'chart-sim-mds', 'chart-sim-dendro', 'chart-sim-matrix', 'chart-h2h-1', 'chart-h2h-2', 'chart-h2h-3',
  'chart-full-stage', 'chart-full-assay',
  'chart-timehorizon', 'chart-complexity', 'chart-failuremode-pr',
  'chart-full-cost', 'chart-full-tokens',
];

function inlineClassStyles(root) {
  const all = root.querySelectorAll('[class]');
  all.forEach((elNode) => {
    const classes = (elNode.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    let extra = '';
    classes.forEach((c) => { if (CLASS_STYLE[c]) extra += CLASS_STYLE[c]; });
    if (extra) {
      // Explicit inline style (set per-element in the original code) must
      // win over the generic class style on conflicting properties (e.g.
      // the lens-pipeline center label sets fill:var(--page) inline while
      // also carrying class="bar-label", whose fill would otherwise clobber it).
      const existing = elNode.getAttribute('style') || '';
      elNode.setAttribute('style', extra + existing);
    }
  });
}

function resolveVars(svgText) {
  return svgText.replace(/var\(--([a-zA-Z0-9-]+)\)/g, (m, name) => VARS[name] || '#000000');
}

// These charts draw right-aligned row labels that can extend left of x=0
// (the live page gets away with it via `overflow:visible` bleeding into
// page whitespace; a standalone raster has no such margin, so pad the
// canvas left instead of touching the original coordinate math).
const LEFT_PAD = {
  'chart-fig3-passrate': 90, 'chart-fig3-repeat': 90, 'chart-kjd': 50,
  'chart-failuremode': 25, 'chart-failuremode-pr': 30,
};

function padViewBoxLeft(svgEl, pad) {
  const vb = svgEl.getAttribute('viewBox').split(/\s+/).map(Number);
  const [minX, minY, w, h] = vb;
  svgEl.setAttribute('viewBox', `${minX - pad} ${minY} ${w + pad} ${h}`);
}

const RIGHT_PAD = {
  'chart-fig3-passrate': 35,
  // The larger 12px legend font (bumped for legibility) makes the longest
  // legend line in each donut wider than the original 340-unit canvas.
  'chart-disease': 40, 'chart-genetarget': 90, 'chart-tissue': 90,
};
function padViewBoxRight(svgEl, pad) {
  const vb = svgEl.getAttribute('viewBox').split(/\s+/).map(Number);
  const [minX, minY, w, h] = vb;
  svgEl.setAttribute('viewBox', `${minX} ${minY} ${w + pad} ${h}`);
}

// Right-legend donuts vertically center their legend on the donut; with
// 7+ categories the top row's text can sit above y=0 and get clipped.
const TOP_PAD = { 'chart-genetarget': 25, 'chart-tissue': 25 };
function padViewBoxTop(svgEl, pad) {
  const vb = svgEl.getAttribute('viewBox').split(/\s+/).map(Number);
  const [minX, minY, w, h] = vb;
  svgEl.setAttribute('viewBox', `${minX} ${minY - pad} ${w} ${h + pad}`);
}

const outDir = path.join(__dirname, 'charts', 'svg');
fs.mkdirSync(outDir, { recursive: true });

let count = 0;
CHART_IDS.forEach((id) => {
  const svgEl = document.getElementById(id);
  if (!svgEl) { console.error('MISSING', id); return; }
  inlineClassStyles(svgEl);
  if (LEFT_PAD[id]) padViewBoxLeft(svgEl, LEFT_PAD[id]);
  if (RIGHT_PAD[id]) padViewBoxRight(svgEl, RIGHT_PAD[id]);
  if (TOP_PAD[id]) padViewBoxTop(svgEl, TOP_PAD[id]);
  svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgEl.setAttribute('font-family', 'IBM Plex Mono, DejaVu Sans Mono, monospace');
  let outer = svgEl.outerHTML;
  outer = resolveVars(outer);
  fs.writeFileSync(path.join(outDir, id + '.svg'), outer, 'utf-8');
  count++;
});

console.log('rendered', count, 'of', CHART_IDS.length, 'charts');

# TxBench-Oligonucleotide Discovery — LaTeX manuscript

LaTeX conversion of the "OligoBench Figures" artifact (the working HTML/JS
manuscript page), ready to compile standalone or import into Overleaf.

## Contents

- `main.tex` — the full manuscript (abstract, sections, 7 multi-panel
  figures, references). Standard `article` class, `pdflatex`-compatible
  (Computer Modern via `lmodern`, no special fonts required).
- `figures/*.png` — all 27 chart panels, rasterized from the original
  artifact's live SVG renderers (not hand-redrawn) at 2.5x scale for print.
- `scripts/` — the conversion pipeline that produced `main.tex`, kept for
  reproducibility and for re-running after the source artifact changes:
  - `app-script.js` — the chart-rendering JS extracted from the artifact.
  - `state.json` — the artifact's editable prose, extracted from the same
    script's `DEFAULT_STATE` object.
  - `render.js` — loads `app-script.js` into `jsdom`, runs the real chart
    renderers, resolves CSS variables/classes to literal values, and writes
    standalone SVGs (`node render.js`, requires `npm install jsdom@16.7.0`).
  - `html2latex.py` / `generate_tex.py` — convert `state.json`'s HTML prose
    to LaTeX and assemble `main.tex` around the figures.

## Compiling locally

```
pdflatex main.tex
pdflatex main.tex   # twice, for correct figure cross-references
```

Requires a standard TeX Live install (`texlive-latex-base`,
`texlive-latex-extra`, `texlive-fonts-recommended`, `lmodern`).

## Importing into Overleaf

**New project:** Overleaf → New Project → Upload Project → upload a zip of
this folder. It should compile immediately with `pdflatex`.

**Keep syncing with this repo (recommended for ongoing edits):** New
Project → Import from GitHub (or, on paid Overleaf plans, enable GitHub
Sync from an existing project's Menu → GitHub). Either pulls this repo in
directly and lets you push changes back.

## Known cosmetic gaps vs. the original artifact

- Fonts are Computer Modern (via `lmodern`), not the original's Source
  Serif 4 / IBM Plex Mono — swap to `fontspec` + those font files under
  XeLaTeX/LuaLaTeX if exact typography matters.
- The interactive legend/marker-shape glyphs (circle/square/triangle/
  diamond harness markers, colored family swatches) are approximated with
  plain LaTeX/TikZ symbols rather than pixel-matched to the artifact's SVG.
- Two figures (Fig. 1, Fig. 3) are a few points taller than a full text
  page (`Float too large` warnings from `pdflatex`); they still typeset
  completely and correctly, just with slightly tighter page margins.

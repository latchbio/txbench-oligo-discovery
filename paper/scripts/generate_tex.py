import json, re, sys
sys.path.insert(0, '.')
from html2latex import convert as C

state = json.load(open('state.json'))


def P(key):
    return C(state[key])


def CAP(key):
    # The source caption text already spells out "Figure N: Title." as its
    # own leading bold run; LaTeX's own \caption numbering would duplicate
    # that, so split off the source's leading "Figure N: ..." label, convert
    # each half independently (so escaping runs on plain text only), then
    # recombine with our own italic wrapper around the title.
    raw = state[key]
    m = re.match(r'^<b>Figure\s*\d+:\s*(.*?)</b>\s*(.*)$', raw, flags=re.S)
    if m:
        title_html, rest_html = m.group(1), m.group(2)
        return f"\\textit{{{C(title_html)}}} \\quad {C(rest_html)}"
    return C(raw)


def fig(image_id, width=r'\textwidth'):
    return f'\\includegraphics[width={width}]{{figures/{image_id}.png}}'


def subpanel(letter, title, image_id, width):
    return (
        f'\\begin{{subfigure}}[t]{{{width}\\textwidth}}\n'
        f'  \\centering\n'
        f'  {fig(image_id, width=r"\linewidth")}\n'
        f'  \\caption{{{title}}}\n'
        f'  \\label{{fig:{image_id}}}\n'
        f'\\end{{subfigure}}'
    )


def figure_block(label, caption_key, rows, note=None):
    # rows: list of lists of (title, image_id) tuples, one sub-list per visual row
    out = ['\\begin{figure}[p]', '\\centering']
    for row in rows:
        n = len(row)
        width = {1: 0.92, 2: 0.47, 3: 0.31}[n]
        parts = []
        for title, image_id in row:
            parts.append(subpanel('', title, image_id, width))
        out.append('  ' + '\\hfill\n  '.join(parts))
        out.append('\\vspace{0.6em}')
    if note:
        out.append(note)
    out.append(f'\\caption{{{CAP(caption_key)}}}')
    out.append(f'\\label{{fig:{label}}}')
    out.append('\\end{figure}')
    return '\n'.join(out)


# ---------------------------------------------------------------- preamble
PREAMBLE = r"""\documentclass[11pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[margin=1in]{geometry}
\usepackage{graphicx}
\usepackage{subcaption}
\usepackage{booktabs}
\usepackage{array}
\usepackage{enumitem}
\usepackage{xcolor}
\usepackage{tikz}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{textcomp}
\usepackage{multicol}
\usepackage[colorlinks=true,linkcolor=blue!50!black,citecolor=blue!50!black,urlcolor=blue!50!black]{hyperref}
\usepackage[labelfont=bf,font=small]{caption}
\usepackage{parskip}
\usepackage{placeins}

\renewcommand\thesubfigure{\Alph{subfigure}}
\captionsetup[subfigure]{labelformat=parens}

\definecolor{claudecol}{HTML}{CF6D4A}
\definecolor{gptcol}{HTML}{129985}
\definecolor{geminicol}{HTML}{4975CF}
\definecolor{grokcol}{HTML}{1C1D24}
\newcommand{\swatch}[1]{\tikz[baseline=-0.5ex]{\fill[#1] (0,0) rectangle (0.28em,0.28em);}}

\title{\textbf{TxBench-Oligonucleotide Discovery}\\[4pt]
\large Benchmarking AI Agents on Experimentally Grounded Decisions in the Discovery of ASO/siRNA Therapeutics}
\author{Martin Jacko, Jackson Brougher, Alex Urrutia, Hannah Le, \\
Arjun Banerjee, Dillon Flood, Kenny Workman \\[6pt]
\normalsize\itshape LatchBio, San Francisco, CA, USA}
\date{}

\begin{document}
\maketitle
"""

# ---------------------------------------------------------------- abstract
abstract = f"\\begin{{abstract}}\n\\noindent {P('abstract')}\n\\end{{abstract}}\n"

# ---------------------------------------------------------------- intro
introduction = (
    "\\section{Introduction}\n"
    f"{P('introP1')}\n\n{P('introP2')}\n\n{P('introP3')}\n"
)

# ---------------------------------------------------------------- construction
construction = (
    "\\section{Benchmark Construction}\n"
    f"{P('constrP1')}\n\n{P('constrP2')}\n"
)

# ---------------------------------------------------------------- anatomy + fig1
anatomy = (
    "\\section{Benchmark Anatomy}\n"
    f"{P('anatomyP1')}\n\n{P('anatomyP2')}\n\n"
    + figure_block(
        'fig1', 'fig1Caption',
        rows=[
            [('Discovery decision path', 'chart-taxonomy')],
            [('Tasks and decisions', 'chart-tasktype'), ('Assay and evidence types', 'chart-assaytype')],
            [('Disease indication', 'chart-disease'), ('Target gene', 'chart-genetarget'), ('Tissue or cell type', 'chart-tissue')],
        ],
    )
)

# ---------------------------------------------------------------- lenses + fig2
DESIGN_NOTE_TPL = (
    "\\begin{{quote}}\n\\noindent\\rule{{\\linewidth}}{{0.4pt}}\\\\[2pt]\n"
    "{text}\\\\[2pt]\\rule{{\\linewidth}}{{0.4pt}}\n\\end{{quote}}\n"
)

lenses = (
    "\\section{Construction Lenses and Failure-Mode Design}\n"
    f"{P('validP1')}\n\n{P('validP2')}\n\n{P('validP3')}\n\n{P('validP4')}\n\n"
    + DESIGN_NOTE_TPL.format(text=P('validNote'))
    + figure_block(
        'fig2', 'fig2Caption',
        rows=[
            [('Idea generation lens library', 'chart-lens-pipeline')],
            [('Lens alignment summary', 'chart-lens'), ('Key Program Decisions \\& Technical Judgement lens', 'chart-kjd')],
            [('Grader type usage', 'chart-gradertype'), ('Per-eval failure mode tags', 'chart-failuremode')],
        ],
    )
    + f"\n{P('validP5')}\n"
)

meth_note_standalone = DESIGN_NOTE_TPL.format(text=P('methNote'))

# ---------------------------------------------------------------- results (fig 3-7)
results = "\\section{Results}\n"
results += f"{P('fig3P1')}\n\n{P('fig3P2')}\n\n{P('fig3P2b')}\n\n{P('fig3P3')}\n\n"
results += figure_block(
    'fig3', 'fig3Caption',
    rows=[
        [('Model--harness pass rate', 'chart-fig3-passrate'), ('Repeatability across three attempts', 'chart-fig3-repeat')],
        [('Score difference across harnesses', 'chart-full-harnessdelta')],
    ],
)

results += f"\n{P('fig4P1')}\n\n"
results += figure_block(
    'fig4', 'fig4HCaption',
    rows=[
        [('Cross-model agreement, 2D map', 'chart-sim-mds')],
        [('Hierarchical clustering', 'chart-sim-dendro'), ('Pairwise agreement matrix', 'chart-sim-matrix')],
        [('GPT-6 Astra vs. Claude Opus 5', 'chart-h2h-1'), ('GPT-6 Astra vs. Grok 4.6', 'chart-h2h-2'), ('Claude Opus 5 vs. Grok 4.6', 'chart-h2h-3')],
    ],
)

results += f"\n{P('fig5P1')}\n\n{P('fig5P2')}\n\n"
results += figure_block(
    'fig5', 'fig5Caption',
    rows=[
        [('Pass rate by taxonomy section', 'chart-full-stage')],
        [('Pass rate by assay type', 'chart-full-assay')],
    ],
)

STAT_TILES = r"""
\begin{center}
\begin{tabular}{p{0.45\linewidth} p{0.45\linewidth}}
\toprule
\textbf{Short-form} $\cdot$ n=104 & \textbf{Long-form} $\cdot$ n=16 \\
\midrule
\Large 36.8\% & \Large 32.3\% \\
\small 2,408/6,536 & \small 322/998 \\
\bottomrule
\end{tabular}
\end{center}
"""

results += f"\n{P('fig6P1')}\n\n"
results += figure_block(
    'fig6', 'fig6Caption',
    rows=[
        [('Time horizon', 'chart-timehorizon'), ('Grader complexity vs. pass rate', 'chart-complexity')],
        [('Failure-mode tag vs. pass rate', 'chart-failuremode-pr')],
    ],
    note=STAT_TILES,
)

CONFIG_RANK = [
    ("gpt-6-astra / OpenAI Codex", "55.5"), ("gpt-6-astra / Pi", "53.4"),
    ("claude-opus-5 / Claude Code", "48.1"), ("grok-4.6 / Pi", "44.0"),
    ("grok-4.6 / Grok Build", "42.8"), ("claude-opus-5 / Pi", "42.2"),
    ("claude-opus-4-8 / Claude Code", "39.6"), ("gemini-3.7-flash / Pi", "39.5"),
    ("claude-opus-4-8 / Pi", "39.3"), ("claude-sonnet-5 / Claude Code", "39.3"),
    ("gpt-5.6-sol / Pi", "38.9"), ("gemini-3.5-flash / Pi", "38.6"),
    ("grok-4.5 / Pi", "38.3"), ("claude-sonnet-5 / Pi", "36.2"),
    ("gpt-5.6-sol / OpenAI Codex", "34.5"), ("gpt-5.5 / Pi", "33.6"),
    ("gpt-5.6-terra / Pi", "33.3"), ("gpt-5.6-terra / OpenAI Codex", "32.4"),
    ("gpt-5.5 / OpenAI Codex", "30.4"), ("gpt-5.6-luna / OpenAI Codex", "23.9"),
    ("gpt-5.6-luna / Pi", "23.3"),
]

PARETO_ROWS = [
    ("gpt-5.6-luna (Pi)", "0.049", "23.3", "0.210"),
    ("gpt-5.6-luna (OpenAI Codex)", "0.053", "23.9", "0.222"),
    ("gpt-6-astra (Pi)", "0.198", "53.4", "0.371"),
    ("gpt-6-astra (OpenAI Codex)", "0.800", "55.5", "1.441"),
]

config_rank_tex = (
    "\\noindent\\textbf{Configuration ranking (by pass rate)}\\smallskip\n\n"
    "\\begin{multicols}{3}\\footnotesize\n\\begin{enumerate}[itemsep=0pt,parsep=0pt,topsep=0pt,leftmargin=1.6em]\n"
    + "\n".join(f"\\item {name} ({pct}\\%)" for name, pct in CONFIG_RANK)
    + "\n\\end{enumerate}\n\\end{multicols}\n"
)

ROWEND = chr(92) + chr(92)  # literal LaTeX row terminator "\\\\" -> renders as \\

pareto_table_tex = (
    "\\begin{center}\n\\small\n"
    "\\begin{tabular}{lrrr}\n\\toprule\n"
    "Config & \\$/run & Pass \\% & \\$/correct " + ROWEND + "\n\\midrule\n"
    + ("\n" + ROWEND + "\n").join(f"{name} & \\${cost} & {pct}\\% & \\${pc} " for name, cost, pct, pc in PARETO_ROWS)
    + "\n" + ROWEND + "\n\\bottomrule\n\\end{tabular}\n\\end{center}\n"
)

legend_tex = (
    "\\noindent\\textbf{Model family:} "
    "\\swatch{claudecol} Claude \\quad \\swatch{gptcol} GPT \\quad "
    "\\swatch{geminicol} Gemini \\quad \\swatch{grokcol} Grok \\\\\n"
    "\\textbf{Harness marker:} $\\bullet$ Pi \\quad $\\blacksquare$ Claude Code "
    "\\quad $\\blacktriangle$ OpenAI Codex \\quad $\\blacklozenge$ Grok Build\\medskip\n\n"
)

results += f"\n{P('full4P2')}\n\n{P('full4P4')}\n\n"
results += figure_block(
    'fig7', 'fig4Caption',
    rows=[
        [('Pass rate vs.\\ cost', 'chart-full-cost'), ('Pass rate vs.\\ token usage', 'chart-full-tokens')],
    ],
    note=legend_tex + config_rank_tex + "\\smallskip\n\\noindent\\textbf{Cost/pass-rate frontier}\\smallskip\n" + pareto_table_tex,
)

# ---------------------------------------------------------------- discussion
discussion = (
    "\\section{Discussion}\n"
    f"{P('discHeadline')}\n\n{P('discSpecialization')}\n\n"
    f"\\textbf{{Relationship to prior work.}} {P('discP2')}\n\n"
    f"\\textbf{{Conclusion.}} {P('discConclusion')}\n\n"
    f"\\textbf{{Outlook.}} {P('discForward')}\n"
)

# ---------------------------------------------------------------- methods
methods = (
    "\\section{Methods}\n"
    f"{P('methP1')}\n\n{P('methP2')}\n\n{P('methP3')}\n"
)

# ---------------------------------------------------------------- references
REF_KEYS = [f'ref{i}' for i in range(1, 24)]
refs_tex = (
    "\\section*{References}\n"
    "\\begin{enumerate}[leftmargin=2em,itemsep=3pt]\n"
    + "\n".join(f"\\item {P(k)}" for k in REF_KEYS)
    + "\n\\end{enumerate}\n\n"
    + f"\\smallskip\\noindent\\footnotesize {P('refNote')}\n"
)

# ---------------------------------------------------------------- assemble
doc = (
    PREAMBLE
    + abstract
    + introduction
    + construction
    + anatomy
    + lenses
    + meth_note_standalone
    + results
    + discussion
    + methods
    + refs_tex
    + "\\end{document}\n"
)

with open('main.tex', 'w', encoding='utf-8') as f:
    f.write(doc)

print("wrote main.tex,", len(doc), "chars")

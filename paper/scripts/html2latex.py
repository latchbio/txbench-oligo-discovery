import re

# Private-use-area placeholders so escaping/backslash-insertion never
# collides with real content. Substituted to final LaTeX only at the end.
P = {k: chr(0xE000 + i) for i, k in enumerate([
    'AMP', 'TIMES', 'MINUS', 'DELTA', 'PLUSMN', 'RARR', 'SECT', 'GEQ',
    'NDASH', 'MDASH', 'PROP', 'MIDDOT', 'BOLD_O', 'BOLD_C', 'ITAL_O', 'ITAL_C',
    'MONO_O', 'MONO_C', 'BRK', 'BSLASH', 'PRIME',
])}

FINAL = {
    P['AMP']: r'\&', P['TIMES']: r'$\times$', P['MINUS']: r'$-$',
    P['DELTA']: r'$\Delta$', P['PLUSMN']: r'$\pm$', P['RARR']: r'$\rightarrow$',
    P['SECT']: r'\S', P['GEQ']: r'$\geq$', P['NDASH']: '--', P['MDASH']: '---',
    P['PROP']: r'$\propto$', P['MIDDOT']: r'\textperiodcentered{}',
    P['BOLD_O']: r'\textbf{', P['BOLD_C']: '}',
    P['ITAL_O']: r'\textit{', P['ITAL_C']: '}',
    P['MONO_O']: r'\texttt{', P['MONO_C']: '}',
    P['BRK']: r'\\ ',
    P['BSLASH']: r'\textbackslash{}',
    P['PRIME']: r"$'$",
}


def convert(s: str) -> str:
    if s is None:
        return ''
    out = s

    # --- named entities / literal unicode -> safe placeholders ---
    out = out.replace('&nbsp;', ' ')
    out = out.replace('&amp;', P['AMP'])
    out = out.replace('&times;', P['TIMES'])
    out = out.replace('&minus;', P['MINUS'])
    out = out.replace('&Delta;', P['DELTA'])
    out = out.replace('&plusmn;', P['PLUSMN'])
    out = out.replace('&rarr;', P['RARR'])
    out = out.replace('&ndash;', P['NDASH'])
    out = out.replace('&mdash;', P['MDASH'])
    out = out.replace('&prop;', P['PROP'])
    out = out.replace('&middot;', P['MIDDOT'])
    out = out.replace('§', P['SECT'])
    out = out.replace('–', P['NDASH'])
    out = out.replace('—', P['MDASH'])
    out = out.replace('≥', P['GEQ'])
    out = out.replace('∝', P['PROP'])
    out = out.replace('×', P['TIMES'])
    out = out.replace('′', P['PRIME'])
    out = out.replace('’', "'")
    out = out.replace('‘', "`")
    out = out.replace('“', '``')
    out = out.replace('”', "''")

    # --- tags -> placeholder open/close markers (content stays raw for now) ---
    out = re.sub(r'<span class="subhead">', P['BOLD_O'], out)
    out = re.sub(r'<span class="mono"[^>]*>', P['MONO_O'], out)
    out = re.sub(r'</span>', P['BOLD_C'], out)  # closes whichever opened last (non-nesting in source)
    out = out.replace('<b>', P['BOLD_O']).replace('</b>', P['BOLD_C'])
    out = out.replace('<i>', P['ITAL_O']).replace('</i>', P['ITAL_C'])
    out = out.replace('<br>', P['BRK'])

    # --- escape remaining LaTeX-special literal characters ---
    out = out.replace('\\', P['BSLASH'])
    out = re.sub(r'([%#_{}$&])', r'\\\1', out)
    out = out.replace('~', r'\textasciitilde{}')
    out = out.replace('^', r'\textasciicircum{}')

    # --- restore placeholders to real LaTeX ---
    for ph, latex in FINAL.items():
        out = out.replace(ph, latex)

    return out.strip()

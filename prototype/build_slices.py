#!/usr/bin/env python3
"""Builds the per-module HTML files in slices/ from tringg-ordering.html.

Each module file is the full prototype opened on one module: the other main-nav items are hidden,
a link back to ../index.html is added, and links to other modules are blocked.
Run:  python3 build_slices.py   (from the prototype folder)"""
import re, pathlib
here = pathlib.Path(__file__).resolve().parent
main = (here / 'tringg-ordering.html').read_text()
MODULES = {
 'overview': 'Overview', 'orders': 'Orders', 'calls': 'Calls',
 'menu': 'Menu', 'settings': 'Settings', 'agents': 'Agents'}
CSS = ".rail-nav .nav:not(.on){display:none}\n"
(here / 'slices').mkdir(exist_ok=True)
for key, name in MODULES.items():
    html = main.replace('<title>Tringg Ordering</title>', f'<title>Tringg Ordering · {name}</title>', 1)
    html = html.replace('\n/* overlays */', '\n' + CSS + '/* overlays */', 1)
    block = f"""/* ── module slice: {name} only ── */
const SLICE='{key}';S.route=SLICE;
const _goFull=go;go=function(r){{if(r!==SLICE){{toast((NAV.find(x=>x[0]===r)||[0,'Settings'])[1]+' is in its own module file');return;}}_goFull(r);}};
const _renderRail=renderRail;renderRail=function(){{_renderRail();const t=document.querySelector('#rail .rail-top');if(t)t.insertAdjacentHTML('afterend','<a class="mod-chip" href="../index.html">← All modules</a><div class="mod-name">Module · {name}</div>');}};
"""
    if key == 'agents':
        block += "const _vAgents=VIEWS.agents;VIEWS.agents=function(){return R()==='staff'?'<div class=\"scroll\"><div class=\"page\"><div class=\"soft-empty\">Staff do not see the Agents screen. Switch “View as” to Owner or Manager.</div></div></div>':_vAgents();};\n"
    m = re.search(r'const VIEWS=[^\n]*;\n', html)
    html = html[:m.end()] + block + '\n' + html[m.end():]
    (here / 'slices' / f'{key}.html').write_text(html)
    print('wrote slices/%s.html' % key)

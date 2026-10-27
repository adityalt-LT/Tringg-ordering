#!/usr/bin/env python3
"""Builds prototype/tringg-prototype.html: onboarding first, then the dashboard, in one file.

The two prototypes share global names, so each runs in its own frame inside the wrapper. When the owner
clicks Open dashboard in onboarding, the wrapper passes the ordering answers to the dashboard frame.
Run:  python3 build_combined.py   (from the prototype folder)"""
import base64, pathlib
here = pathlib.Path(__file__).resolve().parent
ob = (here / 'onboarding.html').read_text(encoding='utf-8')
db = (here / 'tringg-ordering.html').read_text(encoding='utf-8')
# in the combined file the button hands over through the wrapper instead of a link
old = '<a class="btn" href="tringg-ordering.html?from=onboarding" onclick="saveHandoff()">Open dashboard'
assert ob.count(old) == 1
ob = ob.replace(old, '<a class="btn" href="#" onclick="event.preventDefault();parent.postMessage({tringg:\'handoff\',d:{brand:S.d.brand,ord:S.d.ord,mods:S.mods,agent:S.agent.name}},\'*\')">Open dashboard')
dash = '<!doctype html><html lang="en"><head><meta charset="utf-8">' + db + '</html>'
b64 = lambda t: base64.b64encode(t.encode('utf-8')).decode('ascii')
page = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tringg prototype</title>
<style>
html,body{{margin:0;height:100%;background:#F2F1ED;font-family:Poppins,system-ui,sans-serif}}
iframe{{position:fixed;inset:0;width:100%;height:100%;border:0;background:#F2F1ED}}
iframe[hidden]{{display:none}}
.sw{{position:fixed;right:14px;bottom:14px;z-index:10;display:flex;gap:2px;padding:3px;border-radius:999px;background:#111;box-shadow:0 4px 14px rgba(0,0,0,.25)}}
.sw button{{border:0;background:none;color:#aaa;font:600 11px/1 Poppins,system-ui,sans-serif;padding:8px 12px;border-radius:999px;cursor:pointer}}
.sw button.on{{background:#fff;color:#111}}
</style></head><body>
<iframe id="ob" title="Onboarding"></iframe>
<iframe id="db" title="Dashboard" hidden></iframe>
<div class="sw" role="group" aria-label="Prototype screens"><button id="b-ob" class="on">Onboarding</button><button id="b-db">Dashboard</button></div>
<script>
const SRC={{ob:"{b64(ob)}",db:"{b64(dash)}"}};
const dec=b=>new TextDecoder().decode(Uint8Array.from(atob(b),c=>c.charCodeAt(0)));
const ob=document.getElementById('ob'),db=document.getElementById('db');
function show(w){{ob.hidden=w!=='ob';db.hidden=w!=='db';document.getElementById('b-ob').classList.toggle('on',w==='ob');document.getElementById('b-db').classList.toggle('on',w==='db');}}
function loadOb(){{ob.srcdoc=dec(SRC.ob);}}
function loadDb(h){{const pre=h?'<script>window.__handoff='+JSON.stringify(h).replace(/</g,'\\\\u003c')+'<\\/script>':'';db.srcdoc=dec(SRC.db).replace('<meta charset="utf-8">','<meta charset="utf-8">'+pre);}}
window.addEventListener('message',e=>{{const m=e.data;if(m&&m.tringg==='handoff'){{loadDb(m.d);show('db');}}}});
document.getElementById('b-ob').onclick=()=>{{loadOb();show('ob');}};
document.getElementById('b-db').onclick=()=>{{loadDb(null);show('db');}};
loadOb();
</script></body></html>'''
(here / 'tringg-prototype.html').write_text(page, encoding='utf-8')
print('wrote tringg-prototype.html', len(page)//1024, 'KB')

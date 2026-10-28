#!/usr/bin/env python3
"""Builds the three setup prototypes from onboarding.html + tringg-ordering.html + setup/setup-engine.js.

  proto-a-onboarding-first.html   all key steps happen in onboarding (Enquiry / Reservation / Ordering cards)
  proto-b-module-first.html       light onboarding; each dashboard tab is its own setup page
  proto-c-overview-first.html     light onboarding; Overview is the setup page

The onboarding and the dashboard share global names, so each runs in its own frame inside a wrapper.
The wrapper also holds the single copy of the setup state and mirrors it into both frames.
Run from the prototype folder:  python3 build_variants.py"""
import base64, pathlib, re

here = pathlib.Path(__file__).resolve().parent
ENGINE = (here / 'setup' / 'setup-engine.js').read_text(encoding='utf-8')
OB = (here / 'onboarding.html').read_text(encoding='utf-8')
DB = (here / 'tringg-ordering.html').read_text(encoding='utf-8')


def must(text, old, new, count=1):
    n = text.count(old)
    assert n == count, f'expected {count} match(es), found {n}: {old[:90]!r}'
    return text.replace(old, new)


def cut(text, start, end, new=''):
    a = text.index(start)
    b = text.index(end, a)
    return text[:a] + new + text[b:]


def engine_tag(v):
    return f'<script>window.TS_VARIANT="{v}";</script><script>{ENGINE}</script>\n'


# ───────────────────────── onboarding ─────────────────────────
def build_onboarding(v):
    t = OB
    t = must(t, '<div id="app"></div>\n<script>', '<div id="app"></div>\n' + engine_tag(v) + '<script>')
    # one restaurant, the same one the dashboard belongs to
    t = cut(t, 'const OUTLETS=[', 'const CUISINES', '''const OUTLETS=[
 {id:'rossa',name:'ROSSA Pizzeria',short:'ROSSA Pizzeria',area:'West Loop, Chicago',addr:'845 W Randolph St, Chicago, IL 60607',cuisine:'Italian',country:'United States',lat:41.88414,lng:-87.64798,tz:'America/Chicago',phone:'+1 (312) 555-0147',rating:'4.6 ★ from 2,031 reviews',
  desc:'Wood-fired Neapolitan pizza, fresh pasta and an Italian wine list.',open:'16:00',close:'23:00',locations:13,
  faqs:[['Do you have gluten-free crusts?','Yes, on any 12-inch pizza.'],['Can you host a private party?','Yes, up to 40 guests.']]}];
''')
    t = must(t, '''el.innerHTML=`<p class="hint">Try <button class="lnk" onclick="try1('Aladdin')">Aladdin Broasted Chicken</button> or <button class="lnk" onclick="try1('ROSSA')">ROSSA Pizzeria</button></p>`''',
             '''el.innerHTML=`<p class="hint">Try <button class="lnk" onclick="try1('ROSSA')">ROSSA Pizzeria</button></p>`''')
    # the flow: discover, verify, set up, go live
    t = must(t, "const GROUPS=['Discover','Verify','Services','Meet your agent','Review','Go live'];", "const GROUPS=['Discover','Verify','Set up','Go live'];")
    t = must(t, "const STEPS=['find','research','verify','rules','voice','review','live'];", "const STEPS=['find','research','verify','services','live'];")
    t = must(t, "const GI={find:0,research:0,verify:1,rules:2,voice:3,review:4,live:5};", "const GI={find:0,research:0,verify:1,services:2,live:3};")
    t = must(t, "(GI[id]+(id==='research'?.6:.5))/6*100", "(GI[id]+(id==='research'?.6:.5))/4*100")
    # the chosen restaurant feeds the shared setup state
    t = must(t, "days:[1,1,1,1,1,1,1]});S.rs=0}",
             "days:[1,1,1,1,1,1,1]});S.rs=0;TS.set(x=>{x.d.brand=o.short||o.name;x.d.faqs=(o.faqs||[]).map(f=>f.slice())})}")
    # the old rules / agent / review / go-live screens are replaced by the setup engine
    new_views = r'''
/* 03 · set up: Enquiries are always on; Reservations and Ordering are chosen */
const agentName=()=>TS.get().d.agent.name;
const VARTXT={
 A:{sub:'Enquiries are always on. Open a card to finish its steps right here. You can skip any step and come back to it later.',
    next:['Anything you skipped is waiting in your dashboard','It opens exactly where you left off, on the same step.']},
 B:{sub:'Enquiries are always on. Choose what else the agent handles. You’ll finish each one from its own tab in your dashboard.',
    next:['Each tab is its own setup page','Reservations and Ordering each walk you through their steps. Nothing sends you to another screen.']},
 C:{sub:'Enquiries are always on. Choose what else the agent handles. Your dashboard opens on a setup page with everything that’s left.',
    next:['Your dashboard opens on one setup page','Every step opens on top of it, so you never lose your place.']}}[TS.variant];
VIEWS.services=()=>({body:`<div class="body fade">${head(`What should ${esc(agentName())} handle?`,VARTXT.sub)}
 ${TS.variant==='A'?`<div class="ts-stk">${TS.card('enq')}${TS.card('res',{toggle:true})}${TS.card('ord',{toggle:true})}</div>`:TS.pick()}
 <p class="note">${S.o&&S.o.locations?`Applies to all ${S.o.locations} ${esc(S.d.brand)} locations. Each can change its own later.`:'You can change this any time in Settings.'}</p></div>`,
 foot:footer({next:'Continue'})});
/* 04 · go live */
function saveHandoff(){}
function openDash(){try{parent.postMessage({tringg:'handoff'},'*')}catch(e){}}
VIEWS.live=()=>{const N='+1 (312) 555-0147',left=TS.items().filter(i=>i.k!=='go'),A=TS.variant==='A';
 return{body:`<div class="body fade">${head(`${esc(agentName())} is nearly ready.`,'Subscribe and forward your phone line to go live. Nothing is billed before you subscribe.')}
 <div class="sec"><div class="cap" style="margin-bottom:10px">Your Tringg number</div><div class="card num"><span class="mono">${N}</span><button class="btn line sm" onclick="TS.copy(this)">Copy</button></div></div>
 <div class="sec">${TS.goCard()}</div>
 ${A&&left.length?`<div class="sec"><div class="cap" style="margin-bottom:10px">Still open</div><div class="card rows">${left.map(i=>`<div class="row" style="grid-template-columns:1fr auto"><div class="v">${i.t}<small>${i.m}. It’s waiting in your dashboard.</small></div><button class="lnk" onclick="${i.f}">Finish now</button></div>`).join('')}</div></div>`:''}
 <div class="sec"><div class="cap" style="margin-bottom:10px">What’s next</div><div class="card rows"><div class="row" style="grid-template-columns:34px 1fr"><b>1</b><div class="v">${VARTXT.next[0]}<small>${VARTXT.next[1]}</small></div></div></div></div>
 <div style="margin-top:28px;display:flex;gap:12px;align-items:center"><button class="btn" onclick="openDash()">Open dashboard ${ic('chev',16)}</button><span class="note" style="margin:0">You can do the rest from there.</span></div></div>`}};
TS.on(()=>{const id=STEPS[S.i];if(id==='services'||id==='live')render()});
TS.hello();
'''
    t = cut(t, '/* 03 · reservation: the real six rules */', 'function copyNum(b)', new_views)
    # the chosen number of services is read from the shared state; the old copy-number helper stays
    return t


# ───────────────────────── dashboard ─────────────────────────
PROTO_PANEL = '''<div class="proto"><div class="proto-l">Prototype setup</div><div class="proto-seg" style="grid-template-columns:repeat(2,1fr)"><button onclick="TS.reset();go('overview')">Start over</button><button onclick="TS.fill()">Finish all steps</button></div><div class="proto-h">Variant ${TS.variant}: ${({A:'onboarding-first',B:'module-first',C:'overview-first'})[TS.variant]}.</div></div>
   <div class="proto"><div class="proto-l">Subscription</div><div class="proto-seg" style="grid-template-columns:repeat(2,1fr)"><button class="${!DB.subscribed?'on':''}" onclick="TS.set(x=>{x.sub=false;delete x.done['go.sub']})">Not subscribed</button><button class="${DB.subscribed?'on':''}" onclick="TS.set(x=>{x.sub=true;x.done['go.sub']=true})">Subscribed</button></div></div>'''

OVERVIEW_FRESH = r'''function vOverviewFresh(){const mo=DB.mods,G=h=>`<div class="goff">${h}</div>`,T=(ic,c,l,k)=>{const h=stat(ic,c,'—',l);return k&&!mo[k]?G(h):h;};
  return `<div class="scroll"><div class="page"><div class="lbl">${S.outlet==='all'?'All outlets':esc(ON(S.outlet).name)}</div>
   <div class="stats">${T('cal','ic-mint','Today’s bookings','res')}${T('bagL','ic-mint','Orders today','ord')}${T('clock','ic-coral','Pending now')}${T('phoneL','ic-grey','Calls today')}</div>
   <div class="ov-grid"><div class="col"><div class="card"><div class="card-h"><div class="h2">Pending requests</div></div><div class="card-b"><div class="soft-empty">Nothing yet. Requests show here once you go live.</div></div></div></div>
   <div class="col"><div class="card agent"><div class="agent-h"><div class="agent-av">${BRAND.agent[0]}</div><div><div class="agent-n">${esc(BRAND.agent)}</div><div class="agent-s">${['Enquiries',mo.res?'Reservation':null,mo.ord?'Ordering':null].filter(Boolean).join(' · ')}</div></div><span class="lvp">${pill('p-grey','Not live')}</span></div>
    <div class="agent-stats"><div><div class="v">—</div><div class="l">Calls today</div></div><div><div class="v">—</div><div class="l">Avg duration</div></div><div><div class="v">—</div><div class="l">Success rate</div></div></div></div>
    <div class="card"><div class="card-h"><div class="h3">Recent calls</div></div><div class="card-b" style="padding-top:8px"><div class="muted small">No calls yet</div></div></div></div></div></div></div>`;}
'''

BOOT = r'''/* setup prototypes: the dashboard starts empty and is driven by the shared setup state */
(function(){
 applyRole(true);loadScenario('off');applyRole();
 DB.k='setup';SCEN.setup={t:'Setup',h:''};DB.res=[];DB.calls=[];S.res.sel=null;S.route='overview';S.outlet='all';
 TS.nav=r=>go(r);TS.cfg.outlets=OUTLETS.length;
 const PRIMARY=OUTLETS_ALL.find(o=>!o.isNew).id;
 window.applyTS=function(){const s=TS.get(),d=s.d,done=k=>!!s.done[k],sv=d.svc;
  OUTLETS_ALL.forEach(o=>{DB.om[o.id]={res:!!s.svc.res,ord:!!s.svc.ord};});
  MODS.res=!!s.svc.res;MODS.ord=!!s.svc.ord;DB.caps.res=!!s.svc.res;DB.subscribed=!!s.sub;
  DB.menuState=done('ord.menu')?'live':'none';DB.menuSource=done('ord.menu')?({google:'Google profile',pos:'Your POS',upload:'Uploaded menu'}[d.menu.src]||'Imported'):null;
  DB.taxOk=done('ord.tax');DB.payOk=done('ord.pay');DB.stripe=done('ord.pay')&&d.pay.online?'active':'none';
  OUTLETS_ALL.forEach(o=>{if(!o.isNew&&done('ord.svc')&&(sv.all||o.id===PRIMARY)){DB.svc[o.id]={set:true,del:!!sv.del,pick:!!sv.pick,prep:sv.pick?sv.prep:null,rad:sv.del?{mi:sv.mi,fee:sv.fee,min:sv.min}:null};DB.deliveryMode[o.id]=sv.del?'radius':null;}
   else DB.svc[o.id]={set:false,del:false,pick:false,prep:null,rad:null};});
  DB.serviceSet=done('ord.svc');DB.orderingOn=TS.ready('ord')&&DB.subscribed;DB.caps.ord=DB.orderingOn;
  BRAND.agent=d.agent.name;if(DB.agents[0])DB.agents[0].n=d.agent.name;syncMods();};
 TS.on(()=>{applyTS();render();});
 window.addEventListener('message',e=>{const m=e.data;if(m&&m.tringg==='enter'){S.route='overview';S.outlet='all';S.dd=false;render();scrollTo(0,0);}});
 applyTS();TS.hello();
})();
render();
'''


def build_dashboard(v):
    t = DB
    # engine first
    t = must(t, '<script>\n', engine_tag(v) + '<script>\n')
    assert 'window.TS_VARIANT' in t
    # one setup surface, no sidebar checklist
    t = must(t, "function renderChk(){if(S.outlet==='all'||!DB.mods.ord)return '';", "function renderChk(){return '';")
    # one global "go live" pill, on every page
    t = must(t, "${S.route==='overview'?`${DB.subscribed?`<div class=\"live\"><span class=\"d\"></span>", "${true?`${(DB.subscribed&&TS.get().done['go.fwd'])?`<div class=\"live\"><span class=\"d\"></span>")
    t, n = re.subn(r'<div class="live"><span class="d" style="background:#E9B44C"></span>\$\{BRAND\.agent\} isn’t active.*?onclick="openSub\(\)">Subscribe</button></div>', '${TS.pillHTML()}', t, count=1, flags=re.S)
    assert n == 1
    t = must(t, "function openSub(){S.modal={t:'sub'};renderOverlay();}", "function openSub(){TS.open('go','sub');}")
    t = must(t, "function capGo(){if(!DB.subscribed){openSub();return;}go('agents');openAgent(null,'tools');}", "function capGo(){TS.open('ord');}")
    t, n = re.subn(r'const subCta=what=>.*?\n', "const subCta=what=>`<div class=\"scroll\"><div class=\"page\" style=\"max-width:820px\"><div class=\"card\"><div class=\"empty\" style=\"padding:48px 24px\"><div class=\"empty-i\">${I.phoneL}</div><div class=\"empty-t\">${esc(BRAND.agent)} isn’t live yet</div><div class=\"empty-s\">${what} appear here once you go live. Nothing is billed before that.</div><div style=\"margin-top:12px\"><button class=\"btn btn-dark\" onclick=\"TS.open('go','sub')\">Go live</button></div></div></div></div></div>`;\n", t, count=1)
    assert n == 1
    # switching things on from other screens must respect the setup state
    t = must(t, "const on=anyO&&DB.k!=='off'&&DB.subscribed;DB.orderingOn=on;", "const on=anyO&&DB.subscribed&&TS.ready('ord');DB.orderingOn=on;")
    t = must(t, "function toggleOrd(){if(!DB.caps.ord&&!DB.subscribed){openSub();return;}", "function toggleOrd(){if(!DB.caps.ord&&!DB.subscribed){openSub();return;}if(!DB.caps.ord&&!TS.ready('ord')){TS.open('ord');return;}")
    # prototype panel
    a = t.index('<div class="proto"><div class="proto-l">Prototype state</div>')
    b = t.index('Subscribed</button></div></div>', a) + len('Subscribed</button></div></div>')
    t = t[:a] + PROTO_PANEL + t[b:]
    # modules: a service that is off offers to add itself; one that isn't set up shows its steps in place
    t = must(t, '''onclick="goSet('mods')">Turn on</button>''', '''onclick="TS.add('${m}')">Add ${m==='ord'?'ordering':'reservations'}</button>''')
    t = must(t, "const VIEWS={overview:vOverview,reservations:modG(gate(vReservations,'Table requests and bookings'),'res'),orders:modG(gate(vOrders,'Phone orders'),'ord'),",
             "const modT=(fn,m,what)=>()=>{if(!DB.mods[m])return greyed(fn(),m);if(!TS.ready(m)||!DB.subscribed)return TS.variant==='B'?TS.panel(m,what):TS.bar(m,what);return fn();};\nconst VIEWS={overview:vOverview,reservations:modT(vReservations,'res','table requests'),orders:modT(vOrders,'ord','phone orders'),")
    # overview: one setup block per variant, above the numbers
    t = must(t, "function vOverview(){\n  if(!DB.subscribed)return vOverviewFresh();", "function vOverview0(){")
    t = cut(t, 'function vOverviewFresh(){', 'function vOverview0(){', OVERVIEW_FRESH + '''const tsBlock=()=>TS.variant==='A'?TS.strip():TS.variant==='B'?TS.status():TS.center();
function vOverview(){const h=DB.subscribed?vOverview0():vOverviewFresh(),blk=tsBlock();return h.replace(/(<div class="lbl">[^<]*<\\/div>)/,m=>m+blk);}
''')
    t = must(t, '''onclick="goSet('mods')">Turn on ordering</button>''', '''onclick="TS.add('ord')">Turn on ordering</button>''')
    a = t.index("  else if(!DB.orderingOn){const st=setupSteps().filter(x=>!x.opt);const d=st.filter(x=>x.done).length;")
    b = t.index('  h+=`<div class="ov-grid">', a)
    t = t[:a] + t[b:]
    # no calls yet means no duration or success rate to show
    t = must(t, "${live?'2:34':'1:04'}", "${live?'2:34':DB.calls.filter(inScope).length?'1:04':'—'}", count=2)
    t = must(t, "${live?'81%':'67%'}", "${live?'81%':DB.calls.filter(inScope).length?'67%':'—'}", count=2)
    # arriving from onboarding: no toast, no banner. The dashboard just opens on the right page.
    a = t.index('/* arriving from onboarding')
    b = t.index('</script>', a)
    t = t[:a] + BOOT + t[b:]
    return t


# ───────────────────────── wrapper ─────────────────────────
NAMES = {'A': ('Onboarding-first', 'proto-a-onboarding-first.html'),
         'B': ('Module-first', 'proto-b-module-first.html'),
         'C': ('Overview-first', 'proto-c-overview-first.html')}


def wrapper(v, ob, dash):
    b64 = lambda x: base64.b64encode(x.encode('utf-8')).decode('ascii')
    name = NAMES[v][0]
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Setup {v} {name}</title>
<style>
html,body{{margin:0;height:100%;background:#F2F1ED;font-family:Poppins,system-ui,sans-serif}}
iframe{{position:fixed;inset:0;width:100%;height:100%;border:0;background:#F2F1ED}}
iframe[hidden]{{display:none}}
.sw{{position:fixed;right:14px;bottom:14px;z-index:1000;display:flex;gap:2px;padding:3px;border-radius:999px;background:#111;box-shadow:0 4px 14px rgba(0,0,0,.25);align-items:center}}
.sw span{{color:#4FC2B4;font:600 11px/1 Poppins,system-ui,sans-serif;padding:0 10px 0 12px}}
.sw button{{border:0;background:none;color:#aaa;font:600 11px/1 Poppins,system-ui,sans-serif;padding:8px 12px;border-radius:999px;cursor:pointer}}
.sw button.on{{background:#fff;color:#111}}
@media(max-width:820px){{.sw{{bottom:auto;top:6px;right:6px;transform:scale(.82);transform-origin:top right}}}}
</style></head><body>
<iframe id="ob" title="Onboarding"></iframe>
<iframe id="db" title="Dashboard" hidden></iframe>
<div class="sw" role="group" aria-label="Prototype screens"><span>{v} · {name}</span><button id="b-ob" class="on">Onboarding</button><button id="b-db">Dashboard</button><button id="b-rs" title="Clear everything and start again">Start over</button></div>
<script>
const SRC={{ob:"{b64(ob)}",db:"{b64(dash)}"}};
const dec=b=>new TextDecoder().decode(Uint8Array.from(atob(b),c=>c.charCodeAt(0)));
const ob=document.getElementById('ob'),db=document.getElementById('db');
let STATE=null;
function show(w){{ob.hidden=w!=='ob';db.hidden=w!=='db';document.getElementById('b-ob').classList.toggle('on',w==='ob');document.getElementById('b-db').classList.toggle('on',w==='db');}}
function load(){{ob.srcdoc=dec(SRC.ob);db.srcdoc=dec(SRC.db);}}
const other=src=>src===ob.contentWindow?db.contentWindow:ob.contentWindow;
window.addEventListener('message',e=>{{const m=e.data;if(!m||!m.tringg)return;
 if(m.tringg==='state'){{STATE=m.s;const o=other(e.source);if(o)o.postMessage({{tringg:'state',s:STATE}},'*');}}
 if(m.tringg==='hello'&&STATE)e.source.postMessage({{tringg:'state',s:STATE}},'*');
 if(m.tringg==='handoff'){{show('db');db.contentWindow.postMessage({{tringg:'enter'}},'*');}}}});
document.getElementById('b-ob').onclick=()=>show('ob');
document.getElementById('b-db').onclick=()=>show('db');
document.getElementById('b-rs').onclick=()=>{{STATE=null;load();show('ob');}};
load();
</script></body></html>'''


if __name__ == '__main__':
    for v, (name, fn) in NAMES.items():
        page = wrapper(v, build_onboarding(v), build_dashboard(v))
        (here / fn).write_text(page, encoding='utf-8')
        print('wrote', fn, len(page) // 1024, 'KB')

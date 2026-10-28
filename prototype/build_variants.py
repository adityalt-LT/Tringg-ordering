#!/usr/bin/env python3
"""Builds the three setup prototypes from onboarding.html + tringg-ordering.html + setup/setup-engine.js.

  proto-a-onboarding-first.html   Reservation and Ordering are set up inside onboarding
  proto-b-module-first.html       light onboarding; each dashboard tab is its own setup page
  proto-c-overview-first.html     light onboarding; Overview is the setup page

Enquiries are already set up in onboarding (details + FAQs), so only Reservations and Ordering have steps.
The onboarding and the dashboard share global names, so each runs in its own frame inside a wrapper. The
wrapper holds the single copy of the setup state and mirrors it into both frames.
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
OB_CSS = r'''
/* header stepper */
.bar{display:none}
.hdr{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:22px 36px}
.stp{display:flex;align-items:center}
.stp-s{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-30);font-weight:500;white-space:nowrap}
.stp-s .n{width:24px;height:24px;border-radius:50%;border:1.5px solid var(--border-s);display:grid;place-items:center;font-size:12px;font-weight:600;background:var(--panel)}
.stp-s.on{color:var(--ink)}.stp-s.on .n{background:var(--ink);border-color:var(--ink);color:#fff}
.stp-s.done{color:var(--ink-50)}.stp-s.done .n{background:var(--mint);border-color:var(--mint);color:#06231e}
.stp-l{width:32px;height:1.5px;background:var(--border-s);margin:0 10px}.stp-l.done{background:var(--mint)}
.stp-m{display:none;font-size:13px;color:var(--ink-50);font-weight:500}
@media(max-width:760px){.hdr{display:flex;justify-content:space-between;padding:18px 20px}.stp{display:none}.stp-m{display:block}}
/* back and continue are two separate buttons */
.foot{position:sticky;bottom:0;display:flex;align-items:center;gap:16px;padding:22px 0 66px;margin:28px 0 0;background:linear-gradient(to top,var(--canvas) 60%,rgba(242,241,237,0));border:0;border-radius:0;box-shadow:none}
.foot .why{margin-left:auto;font-size:13px;color:var(--ink-50);text-align:right}
.foot>.btn:last-child{margin-left:auto}.foot .why+.btn{margin-left:0}
.btn{transition:transform .15s,box-shadow .15s,background .15s,opacity .2s}
.btn:hover:not(:disabled){transform:translate(-2px,-2px);box-shadow:4px 5px 0 var(--ink);background:var(--ink)}
.btn.line:hover:not(:disabled){background:var(--panel)}
.btn.sm:hover:not(:disabled){box-shadow:3px 4px 0 var(--ink)}
.btn:active:not(:disabled){transform:none;box-shadow:none}
/* reading your listings */
.rs{margin-top:36px;text-align:center}
.orb{position:relative;width:88px;height:88px;margin:0 auto 22px}
.orb i{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff 0,#BFEDE5 28%,#4FC2B4 62%,#1F6E62 100%);animation:orbf 3.2s ease-in-out infinite}
.orb::before{content:"";position:absolute;inset:-24px;border-radius:50%;background:radial-gradient(circle,rgba(79,194,180,.30),transparent 66%);animation:orbb 2.6s ease-in-out infinite}
.orb::after{content:"";position:absolute;inset:-8px;border-radius:50%;border:1.5px solid rgba(79,194,180,.6);border-top-color:transparent;border-left-color:transparent;animation:spin 1.8s linear infinite}
.rs.done .orb::before,.rs.done .orb::after{opacity:0;animation:none}.rs.done .orb i{animation:none;transform:scale(.92)}
@keyframes orbf{50%{transform:translateY(-4px) scale(1.03)}}@keyframes orbb{50%{transform:scale(1.18);opacity:.55}}
.rs-n{font-size:22px;font-weight:600;letter-spacing:-.4px}.rs-st{color:var(--ink-50);font-size:13px;margin-top:4px;height:20px}
.rf-l{margin:30px auto 0;max-width:480px;text-align:left}
.rf{display:flex;align-items:center;gap:14px;padding:13px 0;border-top:1px solid var(--border);opacity:0;transform:translateY(6px);transition:opacity .5s,transform .5s}
.rf:first-child{border-top:0}.rf.act{opacity:.5;transform:none}.rf.ok{opacity:1;transform:none}
.rf .c{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--border-s);display:grid;place-items:center;flex-shrink:0;color:transparent}.rf.ok .c{background:var(--mint);border-color:var(--mint);color:#06231e}
.rf .l{width:64px;color:var(--ink-50);font-size:13px;flex-shrink:0}.rf .v{flex:1;font-size:14.5px;font-weight:500;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rf.act .v::before{content:"";display:block;height:8px;width:55%;border-radius:4px;background:linear-gradient(90deg,#E8E6E0,#F7F6F2,#E8E6E0);background-size:200% 100%;animation:shim 1.2s linear infinite}
@keyframes shim{to{background-position:-200% 0}}
.faqe{display:flex;flex-direction:column;gap:8px;border:1.5px solid var(--border);border-radius:14px;padding:12px;margin-bottom:10px}.faqe .in{height:40px}
.enqd{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--mint-d);background:var(--mint-50);border-radius:999px;padding:6px 14px 6px 10px;margin-top:22px}
</style>'''

RESEARCH = r'''const RS=[
 ['Rating',()=>S.o.rating,'Google Maps'],
 ['Address',()=>S.o.addr,'Google Maps'],
 ['Hours',()=>hoursText(),'your website'],
 ['Menu',()=>'31 items found','your website'],
 ['FAQs',()=>S.o.faqs.length+' drafted','public reviews']];
let rsRun=0;
function runResearch(){const id=++rsRun;S.rs=0;const step=k=>{if(id!==rsRun||STEPS[S.i]!=='research')return;S.rs=k;rsPaint();if(k>=RS.length)return;setTimeout(()=>step(k+1),950)};setTimeout(()=>step(0),500)}
function rsPaint(){const done=S.rs>=RS.length,card=$('#rs');if(!card)return;card.classList.toggle('done',done);
 RS.forEach((r,k)=>{const el=$('#rf'+k);if(!el)return;el.className='rf '+(S.rs>k?'ok':S.rs===k?'act':'');if(S.rs>k)el.querySelector('.v').textContent=r[1]()});
 const st=$('#rst');if(st)st.textContent=done?'Done':'Reading '+RS[Math.min(S.rs,RS.length-1)][2];
 const h=$('h1.tw');if(h&&done&&h.dataset.t!=='Here’s what I found.'){h.dataset.t='Here’s what I found.';typeHeading()}
 const b=$('#fbtn');if(b)b.disabled=!done}
VIEWS.research=()=>{const done=S.rs>=RS.length;
 return{body:`<div class="body fade">${head(done?'Here’s what I found.':'Reading your listings…')}
 <div class="rs ${done?'done':''}" id="rs"><div class="orb"><i></i></div><div class="rs-n">${esc(S.d.brand)}</div><div class="rs-st mono" id="rst">${done?'Done':'Reading Google Maps'}</div>
  <div class="rf-l">${RS.map((r,k)=>`<div class="rf ${S.rs>k?'ok':S.rs===k?'act':''}" id="rf${k}"><span class="c">${ic('check',12)}</span><span class="l">${r[0]}</span><span class="v">${S.rs>k?esc(r[1]()):''}</span></div>`).join('')}</div></div></div>`,foot:footer({ok:done,next:'Continue'})}};
VIEWS_AFTER.research=()=>{rsPaint()};
'''

NEW_VIEWS = r'''
/* FAQs live in the details step, so Enquiries are already set up */
function faqSync(){TS.set(x=>{x.d.faqs=S.o.faqs.map(f=>f.slice())})}
function faqSet(i,j,v){S.o.faqs[i][j]=v;faqSync()}
function faqDel(i){S.o.faqs.splice(i,1);faqSync();render()}
function faqAdd(){S.o.faqs.push(['','']);faqSync();render()}
/* 03 · set up: Reservations and Ordering */
const agentName=()=>TS.get().d.agent.name;
const enqDone=`<div class="enqd">${ic('check',14)} Enquiries set up</div>`;
VIEWS.services=()=>({body:`<div class="body fade">${head(`What should ${esc(agentName())} handle?`)}${enqDone}
 ${TS.variant==='A'?`<div class="ts-stk" style="margin-top:18px">${TS.card('res',{toggle:true})}${TS.card('ord',{toggle:true})}</div>`:TS.pick()}</div>`,
 foot:footer({next:'Continue'})});
/* 04 · go live */
function openDash(){try{parent.postMessage({tringg:'handoff'},'*')}catch(e){}}
VIEWS.live=()=>{const N='+1 (312) 555-0147',left=TS.items().filter(i=>i.k!=='go'),A=TS.variant==='A';
 return{body:`<div class="body fade">${head('Go live.')}
 <div class="sec"><div class="card num"><span class="mono">${N}</span><button class="btn line sm" onclick="TS.copy(this)">Copy</button></div></div>
 <div class="sec">${TS.goCard()}</div>
 ${A&&left.length?`<div class="sec"><div class="cap" style="margin-bottom:10px">Still open</div><div class="card rows">${left.map(i=>`<div class="row" style="grid-template-columns:1fr auto"><div class="v">${i.t}<small>${i.m}</small></div><button class="lnk" onclick="${i.f}">Finish</button></div>`).join('')}</div></div>`:''}
 <div style="margin-top:28px"><button class="btn" onclick="openDash()">Open dashboard ${ic('chev',16)}</button></div></div>`}};
TS.on(()=>{const id=STEPS[S.i];if(id==='services'||id==='live')render()});
TS.hello();
'''


def build_onboarding(v):
    t = OB
    t = must(t, '<div id="app"></div>\n<script>', '<div id="app"></div>\n' + engine_tag(v) + '<script>')
    t = must(t, '</style>', OB_CSS)
    t = cut(t, 'const OUTLETS=[', 'const CUISINES', '''const OUTLETS=[
 {id:'rossa',name:'ROSSA Pizzeria',short:'ROSSA Pizzeria',area:'West Loop, Chicago',addr:'845 W Randolph St, Chicago, IL 60607',cuisine:'Italian',country:'United States',lat:41.88414,lng:-87.64798,tz:'America/Chicago',phone:'+1 (312) 555-0147',rating:'4.6 ★ · 2,031 reviews',
  desc:'Wood-fired Neapolitan pizza, fresh pasta and an Italian wine list.',open:'16:00',close:'23:00',
  faqs:[['Do you have gluten-free crusts?','Yes, on any 12-inch pizza.'],['Can you host a private party?','Yes, up to 40 guests.'],['Is there parking nearby?','Yes, street parking and a garage next door.'],['Do you take reservations?','Yes, call us or book through the agent.'],['Do you have vegan options?','Yes, a vegan cheese pizza and several pastas.']]}];
''')
    t = must(t, "${head('Tell Tringg your restaurant.','Type its name or paste your website. I’ll pull the rest automatically.')}", "${head('Find your restaurant.')}")
    t = must(t, '''el.innerHTML=`<p class="hint">Try <button class="lnk" onclick="try1('Aladdin')">Aladdin Broasted Chicken</button> or <button class="lnk" onclick="try1('ROSSA')">ROSSA Pizzeria</button></p>`''',
             '''el.innerHTML=`<p class="hint">Try <button class="lnk" onclick="try1('ROSSA')">ROSSA Pizzeria</button></p>`''')
    t = must(t, '<input id="q" autocomplete="off" placeholder="e.g. Your restaurant name"', '<input id="q" autocomplete="off" placeholder="Restaurant name or website"')
    # four steps, one header stepper
    t = must(t, "const GROUPS=['Discover','Verify','Services','Meet your agent','Review','Go live'];", "const GROUPS=['Find','Verify','Set up','Go live'];")
    t = must(t, "const STEPS=['find','research','verify','rules','voice','review','live'];", "const STEPS=['find','research','verify','services','live'];")
    t = must(t, "const GI={find:0,research:0,verify:1,rules:2,voice:3,review:4,live:5};", "const GI={find:0,research:0,verify:1,services:2,live:3};")
    t = must(t, "const head=(t,s)=>`${chip()}<h1", "const head=(t,s)=>`<h1")
    t = must(t, " $('#bar').style.width=(id==='live'?100:(GI[id]+(id==='research'?.6:.5))/6*100)+'%';\n", "")
    t = must(t, '<header class="hdr"><div class="logo">Tringg</div></header>', '<header class="hdr"><div class="logo">Tringg</div>${stepper()}<span></span></header>')
    t = must(t, "const chip=()=>", '''const stepper=()=>{const g=GI[STEPS[S.i]];return `<nav class="stp" aria-label="Progress">${GROUPS.map((n,k)=>`${k?`<span class="stp-l ${k<=g?'done':''}"></span>`:''}<span class="stp-s ${k<g?'done':k===g?'on':''}" ${k===g?'aria-current="step"':''}><span class="n">${k<g?ic('check',13):k+1}</span>${n}</span>`).join('')}</nav><span class="stp-m">Step ${g+1} of ${GROUPS.length} · ${GROUPS[g]}</span>`};
const chip=()=>''')
    # reading your listings
    t = cut(t, "const RS=[['Found your map listing'", 'const ordEdit=', RESEARCH)
    # details step: short heading, editable FAQs
    t = must(t, "${head('Choose the outlet you’re setting up.','Everything’s pre-filled. Just confirm it’s right.')}", "${head('Check your details.')}")
    t = must(t, "VIEWS.verify=()=>{const o=S.o,d=S.d,e=S.edit;", '''VIEWS.verify=()=>{const o=S.o,d=S.d,e=S.edit;
 const faqView=`<div class="v">${o.faqs.length?o.faqs.map(f=>`<div class="faq"><b>${esc(f[0])}</b><span>${esc(f[1])}</span></div>`).join(''):'<small>None yet</small>'}</div>`;
 const faqEd=`<div class="full">${o.faqs.map((f,i)=>`<div class="faqe"><input class="in" value="${esc(f[0])}" aria-label="Question" onchange="faqSet(${i},0,this.value)"/><textarea class="ta" rows="2" aria-label="Answer" onchange="faqSet(${i},1,this.value)">${esc(f[1])}</textarea><button class="lnk g" style="align-self:flex-start" onclick="faqDel(${i})">Remove</button></div>`).join('')}<button class="btn line sm" onclick="faqAdd()">Add a question</button></div>`;''')
    t, n = re.subn(r'<div class="row"><label>Answers</label>.*?<span></span></div>', '''<div class="row"><label>FAQs</label>${e.faq?'<span></span>':faqView}<button class="lnk" onclick="tog('faq')">${e.faq?'Done':'Edit'}</button>${e.faq?faqEd:''}</div>''', t, count=1, flags=re.S)
    assert n == 1
    t = must(t, "function tog(k){S.edit[k]=!S.edit[k];render()}", "function tog(k){if(k==='faq'&&S.edit.faq){S.o.faqs=S.o.faqs.filter(f=>f[0].trim()&&f[1].trim());faqSync()}S.edit[k]=!S.edit[k];render()}")
    t = must(t, "days:[1,1,1,1,1,1,1]});S.rs=0}", "days:[1,1,1,1,1,1,1]});S.rs=0;TS.set(x=>{x.d.brand=o.short||o.name;x.d.faqs=(o.faqs||[]).map(f=>f.slice())})}")
    t = cut(t, '/* 03 · reservation: the real six rules */', 'function copyNum(b)', NEW_VIEWS)
    return t


# ───────────────────────── dashboard ─────────────────────────
PROTO_PANEL = '''<div class="proto"><div class="proto-l">Prototype</div><div class="proto-seg" style="grid-template-columns:repeat(2,1fr)"><button onclick="resetDash()">Start over</button><button onclick="loadReady()">Sample data</button></div></div>'''

OVERVIEW_FRESH = r'''function vOverviewFresh(){const mo=DB.mods,G=h=>`<div class="goff">${h}</div>`,T=(ic,c,l,k)=>{const h=stat(ic,c,'0',l);return k&&!mo[k]?G(h):h;};
  return `<div class="scroll"><div class="page"><div class="lbl">${S.outlet==='all'?'All outlets':esc(ON(S.outlet).name)}</div>
   <div class="stats">${T('cal','ic-mint','Today’s bookings','res')}${T('bagL','ic-mint','Orders today','ord')}${T('clock','ic-coral','Pending now')}${T('phoneL','ic-grey','Calls today')}</div>
   <div class="ov-grid"><div class="col"><div class="card"><div class="card-h"><div class="h2">Pending requests</div></div><div class="card-b"><div class="soft-empty">No pending requests</div></div></div></div>
   <div class="col"><div class="card agent"><div class="agent-h"><div class="agent-av">${BRAND.agent[0]}</div><div><div class="agent-n">${esc(BRAND.agent)}</div><div class="agent-s">${['Enquiries',mo.res?'Reservation':null,mo.ord?'Ordering':null].filter(Boolean).join(' · ')}</div></div><span class="lvp">${pill('p-grey','Not live')}</span></div>
    <div class="agent-stats"><div><div class="v">0</div><div class="l">Calls today</div></div><div><div class="v">0</div><div class="l">Avg duration</div></div><div><div class="v">0%</div><div class="l">Success rate</div></div></div></div>
    <div class="card"><div class="card-h"><div class="h3">Recent calls</div></div><div class="card-b" style="padding-top:8px"><div class="muted small">No calls yet</div></div></div></div></div></div></div>`;}
'''

BOOT = r'''/* setup prototypes: one location, empty to start, driven by the shared setup state */
(function(){
 const PRIMARY='wl';ROLE_OUT.owner=[PRIMARY];SC.wl=.4;
 function initFresh(){applyRole(true);loadScenario('off');applyRole();
  DB.k='setup';SCEN.setup={t:'Setup',h:''};DB.res=[];DB.calls=[];DB.orders=[];DB.held=[];DB.taxes=[];S.res.sel=null;S.route='overview';S.outlet=PRIMARY;S.ordOutlet=PRIMARY;S.dd=false;}
 TS.nav=r=>go(r);TS.cfg.outlets=1;
 window.applyTS=function(){const s=TS.get(),d=s.d,done=k=>!!s.done[k],sv=d.svc,p=d.pay,t=d.tax;
  OUTLETS_ALL.forEach(o=>{DB.om[o.id]={res:!!s.svc.res,ord:!!s.svc.ord};});
  MODS.res=!!s.svc.res;MODS.ord=!!s.svc.ord;DB.caps.res=!!s.svc.res;DB.subscribed=!!s.sub;
  DB.menuState=done('ord.menu')?'live':'none';DB.menuSource=done('ord.menu')?({google:'Google profile',pos:'Your POS',web:'Website',agg:'Delivery app',upload:'Uploaded menu',scratch:'Built in Tringg'}[d.menu.src]||'Imported'):null;
  DB.taxOk=done('ord.tax');DB.taxes=done('ord.tax')&&t.on?[{id:'t1',type:t.type,n:t.n,on:t.app,base:t.base,calc:t.calc,vt:t.vt,v:t.v,ch:t.ch,delfee:!!t.delfee,outs:[PRIMARY]}]:[];
  DB.payOk=done('ord.pay');DB.stripe=p.conn?'active':'none';DB.payPick={call:p.pick!=='store',store:p.pick!=='online'};
  DB.cod=Object.assign({},DB.cod,{capOn:!!p.capOn,cap:p.cap,repeatOn:!!p.repeatOn,repeatN:p.repeatN});DB.payFall={pk:!!p.fbPk&&p.pick==='both',dl:!!p.fbDl&&(!!p.capOn||!!p.repeatOn)};
  OUTLETS_ALL.forEach(o=>{if(o.id===PRIMARY&&done('ord.svc')){DB.svc[o.id]={set:true,del:!!sv.del,pick:!!sv.pick,prep:sv.pick?sv.prep:null,rad:sv.del?{mi:sv.mi,fee:sv.fee,min:sv.min,eta:sv.eta}:null};DB.deliveryMode[o.id]=sv.del?'radius':null;}
   else DB.svc[o.id]={set:false,del:false,pick:false,prep:null,rad:null};});
  DB.serviceSet=done('ord.svc');DB.orderingOn=TS.ready('ord')&&DB.subscribed;DB.caps.ord=DB.orderingOn;
  BRAND.agent=d.agent.name;if(DB.agents[0])DB.agents[0].n=d.agent.name;syncMods();};
 window.resetDash=()=>{TS.reset();initFresh();applyTS();render();};
 /* one state with everything set up and data for reservations and orders */
 window.loadReady=()=>{TS.fill();DB.k='live';const own=a=>a.map(x=>Object.assign({},x,{outlet:PRIMARY}));
  DB.orders=own(mkOrders());DB.held=own(mkHeld());DB.res=own(clone(RES));DB.calls=own(mkCalls('live'));S.res.sel=DB.res[0].id;S.orders.sel=null;S.orders.tab='pending';render();};
 initFresh();
 TS.on(()=>{applyTS();render();});
 window.addEventListener('message',e=>{const m=e.data;if(!m||!m.tringg)return;
  if(m.tringg==='enter'){S.route='overview';S.outlet=PRIMARY;S.dd=false;render();scrollTo(0,0);}
  if(m.tringg==='ready'){S.route='overview';loadReady();}});
 applyTS();TS.hello();
})();
render();
'''


def build_dashboard(v):
    t = DB
    t = must(t, '<script>\n', engine_tag(v) + '<script>\n')
    # one setup surface, no sidebar checklist
    t = must(t, "function renderChk(){if(S.outlet==='all'||!DB.mods.ord)return '';", "function renderChk(){return '';")
    # the phone number in the top pill picked up a phone-mockup style
    t = must(t, '.live .ph{font-family:"JetBrains Mono",monospace;font-size:13px;color:#eee}', '.live .ph{font-family:"JetBrains Mono",monospace;font-size:13px;color:#eee;width:auto;border:0;border-radius:0;background:none;box-shadow:none;overflow:visible}')
    # one global "go live" pill, on every page
    t = must(t, "${S.route==='overview'?`${DB.subscribed?`<div class=\"live\"><span class=\"d\"></span>", "${true?`${(DB.subscribed&&TS.get().done['go.fwd'])?`<div class=\"live\"><span class=\"d\"></span>")
    t, n = re.subn(r'<div class="live"><span class="d" style="background:#E9B44C"></span>\$\{BRAND\.agent\} isn’t active.*?onclick="openSub\(\)">Subscribe</button></div>', '${TS.pillHTML()}', t, count=1, flags=re.S)
    assert n == 1
    t = must(t, "function openSub(){S.modal={t:'sub'};renderOverlay();}", "function openSub(){TS.open('go','sub');}")
    t = must(t, "function capGo(){if(!DB.subscribed){openSub();return;}go('agents');openAgent(null,'tools');}", "function capGo(){TS.open('ord');}")
    t, n = re.subn(r'const subCta=what=>.*?\n', "const subCta=what=>`<div class=\"scroll\"><div class=\"page\" style=\"max-width:820px\"><div class=\"card\"><div class=\"empty\" style=\"padding:48px 24px\"><div class=\"empty-i\">${I.phoneL}</div><div class=\"empty-t\">Go live to see ${what.toLowerCase()}</div><div style=\"margin-top:12px\"><button class=\"btn btn-dark\" onclick=\"TS.open('go','sub')\">Go live</button></div></div></div></div></div>`;\n", t, count=1)
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
             "const modT=(fn,m)=>()=>{if(!DB.mods[m])return greyed(fn(),m);if(!TS.ready(m)||!DB.subscribed)return TS.variant==='B'?TS.panel(m):TS.bar(m);return fn();};\nconst VIEWS={overview:vOverview,reservations:modT(vReservations,'res'),orders:modT(vOrders,'ord'),")
    # overview: one setup block per variant, above the numbers
    t = must(t, "function vOverview(){\n  if(!DB.subscribed)return vOverviewFresh();", "function vOverview0(){")
    t = cut(t, 'function vOverviewFresh(){', 'function vOverview0(){', OVERVIEW_FRESH + '''const tsBlock=()=>TS.variant==='A'?TS.strip():TS.variant==='B'?TS.status():TS.center();
function vOverview(){const h=DB.subscribed?vOverview0():vOverviewFresh(),blk=tsBlock();return h.replace(/(<div class="lbl">[^<]*<\\/div>)/,m=>m+blk);}
''')
    t = must(t, '''onclick="goSet('mods')">Turn on ordering</button>''', '''onclick="TS.add('ord')">Turn on ordering</button>''')
    a = t.index("  else if(!DB.orderingOn){const st=setupSteps().filter(x=>!x.opt);const d=st.filter(x=>x.done).length;")
    b = t.index('  h+=`<div class="ov-grid">', a)
    t = t[:a] + t[b:]
    # no value means 0, not a dash
    t = must(t, "${live?'2:34':'1:04'}", "${live?'2:34':DB.calls.filter(inScope).length?'1:04':'0'}", count=2)
    t = must(t, "${live?'81%':'67%'}", "${live?'81%':DB.calls.filter(inScope).length?'67%':'0%'}", count=2)
    t, n = re.subn(r"stat\('([A-Za-z]+)','([a-z-]+)','—'", r"stat('\1','\2','0'", t)
    assert n >= 4, n
    t = must(t, '''font-weight:600">—</div>''', '''font-weight:600">0</div>''', count=3)
    t = must(t, "${live?'16 min':'—'}", "${live?'16 min':'0 min'}")
    t = must(t, "${live&&n?'81%':'—'}", "${live&&n?'81%':'0%'}")
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
<div class="sw" role="group" aria-label="Prototype screens"><span>{v} · {name}</span><button id="b-ob" class="on">Onboarding</button><button id="b-db">Dashboard</button><button id="b-rd" title="Everything set up, with reservations and orders">Sample data</button><button id="b-rs" title="Clear everything and start again">Start over</button></div>
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
document.getElementById('b-rd').onclick=()=>{{show('db');db.contentWindow.postMessage({{tringg:'ready'}},'*');}};
document.getElementById('b-rs').onclick=()=>{{STATE=null;load();show('ob');}};
load();
</script></body></html>'''


if __name__ == '__main__':
    for v, (name, fn) in NAMES.items():
        page = wrapper(v, build_onboarding(v), build_dashboard(v))
        (here / fn).write_text(page, encoding='utf-8')
        print('wrote', fn, len(page) // 1024, 'KB')

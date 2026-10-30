#!/usr/bin/env python3
"""Builds the three setup prototypes from onboarding.html + tringg-ordering.html + setup/setup-engine.js.

  proto-a-onboarding-first.html   Reservation and Ordering are set up inside onboarding
  proto-b-module-first.html       light onboarding; each dashboard tab is its own setup page
  proto-c-overview-first.html     light onboarding; Overview is the setup page

Enquiries are already set up in onboarding (details + FAQs), so only Reservations and Ordering have steps.
The onboarding and the dashboard share global names, so each runs in its own frame inside a wrapper. The
wrapper holds the single copy of the setup state and mirrors it into both frames.
Run from the prototype folder:  python3 build_variants.py"""
import base64, json, pathlib, re

here = pathlib.Path(__file__).resolve().parent
def _uri(path, mime):
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode('ascii')
LOGO = _uri(here / 'setup' / 'assets' / 'tringg-logo.png', 'image/png')
HERO = _uri(here / 'setup' / 'assets' / 'tringg-hero.webm', 'video/webm')
# real restaurant photos: drop .jpg/.png files in setup/photos and they appear in step 1 and the details step
def _photos():
    out = []
    try:
        from PIL import Image
        import io
        for f in sorted((here / 'setup' / 'photos').glob('*')):
            if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp'):
                im = Image.open(f).convert('RGB'); im.thumbnail((900, 900))
                b = io.BytesIO(); im.save(b, 'JPEG', quality=74)
                out.append('data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode('ascii'))
    except Exception as e:
        print('photos skipped:', e)
    return out
PHOTOS = _photos()
ENGINE = (here / 'setup' / 'setup-engine.js').read_text(encoding='utf-8').replace('__LOGO_URI__', LOGO)
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


def engine_tag(v, w='1'):
    return f'<script>window.TS_VARIANT="{v}";window.TS_WELCOME="{w}";</script><script>{ENGINE}</script>\n'


VOICES_JS = r'''const VOICES=[{id:'allie',n:'Ava',g:'Female',t:'Female · English',d:'Warm American host, clear and friendly on the phone',pitch:1.15,rate:1},{id:'marcus',n:'Marcus',g:'Male',t:'Male · English',d:'Calm, confident American host with a steady pace',pitch:.7,rate:.95},{id:'leo',n:'Leo',g:'Male',t:'Male · English',d:'Upbeat, easygoing host for casual restaurants',pitch:.9,rate:1.1},{id:'priya',n:'Priya',g:'Female',t:'Female · Hindi',d:'Friendly bilingual host for Hindi and English callers',pitch:1.3,rate:1.08},{id:'shubh',n:'Shubh',g:'Male',t:'Male · Hindi',d:'Neutral Indian male host. Lowest pronunciation error rate',pitch:.8,rate:1}];
'''

# ───────────────────────── onboarding ─────────────────────────
OB_CSS = r'''
/* header stepper */
.bar{display:none}
.hdr{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:22px 36px}
.stp{display:flex;align-items:center}
.stp-s{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-30);font-weight:500;white-space:nowrap}
.stp-s .n{width:24px;height:24px;border-radius:50%;border:1.5px solid var(--border-s);display:grid;place-items:center;font-size:12px;font-weight:600;background:var(--panel)}
.stp-s.on{color:var(--ink)}.stp-s.on .n{background:var(--mint);border-color:var(--ink);color:#fff}
.stp-s.done{color:var(--ink-50)}.stp-s.done .n{background:var(--mint);border-color:var(--mint);color:#06231e}
.stp-l{width:32px;height:1.5px;background:var(--border-s);margin:0 10px}.stp-l.done{background:var(--mint)}
.stp-m{display:none;font-size:13px;color:var(--ink-50);font-weight:500}
@media(max-width:760px){.hdr{display:flex;justify-content:space-between;padding:18px 20px}.stp{display:none}.stp-m{display:block}}
/* back and continue are two separate buttons */
.foot{position:sticky;bottom:0;display:flex;align-items:center;gap:16px;padding:22px 0 66px;margin:28px 0 0;background:linear-gradient(to top,var(--canvas) 60%,rgba(242,241,237,0));border:0;border-radius:0;box-shadow:none}
.foot .why{margin-left:auto;font-size:13px;color:var(--ink-50);text-align:right}
.foot>.btn:last-child{margin-left:auto}.foot .why+.btn{margin-left:0}
.btn{transition:transform .15s,box-shadow .15s,background .15s,opacity .2s}
.btn:not(.line){background:var(--mint);color:#fff;font-weight:600;text-shadow:0 1px 0 rgba(6,35,30,.2);border:1.5px solid var(--ink)}
.btn:not(.line):hover:not(:disabled){background:var(--mint);color:#fff}
.btn:hover:not(:disabled){transform:translate(-2px,-2px);box-shadow:4px 5px 0 var(--ink)}
.btn.line:hover:not(:disabled){background:var(--panel);box-shadow:4px 5px 0 var(--ink)}
.btn.sm:hover:not(:disabled){box-shadow:3px 4px 0 var(--ink)}.btn.sm.line:hover:not(:disabled){box-shadow:3px 4px 0 var(--ink)}
.btn:active:not(:disabled){transform:none;box-shadow:none}
/* reading your listings: the results card, with the Tringg hero animation */
.avw2{position:relative;width:132px;height:118px;flex-shrink:0;margin:-6px 0 -6px -10px}
.avw2 video{width:100%;height:100%;object-fit:contain;display:block;mix-blend-mode:multiply}
.phs{display:grid;gap:10px;margin-top:20px}.phs img{width:100%;object-fit:cover;border-radius:14px;display:block}
.row .phs{grid-column:2/4;margin-top:0}
.faqh{margin:16px 0 8px}.faqh:first-child{margin-top:0}
.sug-or{padding:12px 18px 4px;margin-top:6px;border-top:1px solid var(--border);font-size:11.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-50)}
.faqe{display:flex;flex-direction:column;gap:8px;border:1.5px solid var(--border);border-radius:14px;padding:12px;margin-bottom:10px}.faqe .in{height:40px}
/* search complete */
.sc{padding:0;overflow:hidden;border-color:#9BD8CF}
.sc-h{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:26px 28px 18px;background:linear-gradient(135deg,#DDF2EE,#fff 70%)}
.sc-e{display:block;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--mint-d)}
.sc-n{font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:34px;line-height:1.15;margin-top:4px;letter-spacing:-.5px}
.sc-r{display:grid;grid-template-columns:130px 1fr auto;gap:16px;align-items:baseline;padding:16px 28px;border-top:1px solid var(--border)}
.sc-r label{font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-50)}.sc-r span{font-size:15px}
.sc-r em{font-style:normal;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mint-d);background:var(--mint-50);border-radius:999px;padding:3px 10px;white-space:nowrap}
.sc-f{padding:14px 28px;border-top:1px solid var(--border);font-size:13px;color:var(--ink-50);background:var(--canvas)}
@media(max-width:640px){.sc-r{grid-template-columns:1fr auto}.sc-r label{grid-column:1/-1}}
/* locations */
.lc-h{display:flex;align-items:center;gap:12px;margin-bottom:12px}.lc-h .cap{margin:0}.lc-h b{font-size:15px;font-weight:600}
.lc-n{margin-left:auto;font-size:12px;font-weight:600;color:var(--mint-d);background:var(--mint-50);border-radius:999px;padding:3px 12px}
.lc-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:14px}.lc-g .lc{margin:0;height:100%;justify-content:space-between}.lc-g .lc-t{flex-direction:column;align-items:flex-start;gap:12px}.lc-g .lc-go{margin:0}
.lc.on .lc-c span:not(.k){background:#fff}
@media(max-width:700px){.lc-g{grid-template-columns:1fr}}
.lc{display:flex;flex-direction:column;gap:10px;width:100%;text-align:left;font:inherit;color:inherit;background:var(--panel);border:1.5px solid var(--border);border-radius:16px;padding:16px 20px;margin-bottom:10px;cursor:pointer;transition:border-color .15s,transform .15s,box-shadow .15s}
.lc:hover{border-color:var(--ink);transform:translate(-2px,-2px);box-shadow:4px 5px 0 var(--ink)}.lc.on{border-color:var(--mint);background:var(--mint-50)}
.lc-t{display:flex;align-items:center;gap:12px}.lc-t b{font-size:16px;font-weight:600}.lc-t small{color:var(--ink-50);font-size:13px}.lc-go{margin-left:auto;font-size:13px;font-weight:600;color:var(--mint-d);white-space:nowrap}
.lc-c{display:flex;gap:8px;flex-wrap:wrap}.lc-c span{font-size:12px;font-weight:500;border-radius:999px;padding:3px 11px;background:var(--mint-50);color:var(--mint-d)}.lc-c span.k{background:#EAE9E4;color:#555}
.lc-m{display:block;width:100%;text-align:center;background:none;border:1.5px dashed var(--border-s);border-radius:16px;padding:16px;font:inherit;font-size:14px;color:var(--ink-50);cursor:pointer}.lc-m:hover{border-color:var(--ink);color:var(--ink)}
/* agent */
.ag{padding:0;overflow:hidden}
.ag-top{display:flex;gap:24px;align-items:center;padding:30px 32px;background:radial-gradient(70% 140% at 100% 0%,#D7F26B88 0%,transparent 60%),radial-gradient(60% 120% at 0% 100%,#FFB84D55 0%,transparent 60%),var(--mint-50);border-bottom:1px solid #CFEAE5}
.ag-ic{position:relative;width:88px;height:88px;border-radius:26px;background:var(--mint);border:1.5px solid var(--ink);box-shadow:4px 5px 0 var(--ink);display:grid;place-items:center;flex-shrink:0}
.ag-ic svg{width:40px;height:40px;stroke:#06231e;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;animation:agvib 1.8s ease-in-out infinite;transform-origin:50% 60%}
.ag-ic i{position:absolute;inset:-2px;border-radius:28px;border:2px solid var(--mint);opacity:0;animation:agring 2.4s ease-out infinite}.ag-ic i:nth-child(2){animation-delay:1.2s}
@keyframes agvib{0%,55%,100%{transform:rotate(0)}6%{transform:rotate(-14deg)}12%{transform:rotate(12deg)}18%{transform:rotate(-12deg)}24%{transform:rotate(10deg)}30%{transform:rotate(-8deg)}36%{transform:rotate(6deg)}42%{transform:rotate(0)}}
@keyframes agring{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.5);opacity:0}}
.ag-top .nm{background:transparent}
.ag-b{padding:26px 32px 30px;display:flex;flex-direction:column;gap:24px}
.seg2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.seg2 button{font:inherit;font-size:14px;padding:12px 14px;border-radius:12px;border:1.5px solid var(--border);background:var(--panel);cursor:pointer;text-align:left;color:var(--ink)}
.seg2 button b{display:block;font-weight:600}.seg2 button small{color:var(--ink-50);font-size:12.5px}.seg2 button.on{border-color:var(--mint);background:var(--mint-50)}
/* voice picker */
.vp{position:relative;flex:1;min-width:0}
.vp-b{display:flex;align-items:center;gap:12px;width:100%;height:60px;padding:0 16px 0 10px;border:1.5px solid var(--border);border-radius:14px;background:var(--panel);font:inherit;cursor:pointer;text-align:left;color:var(--ink)}
.vp-b[aria-expanded=true]{border-color:var(--ink)}.vp-b>svg{margin-left:auto;transform:rotate(90deg);color:var(--ink-50)}
.vp-av{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:600;font-size:15px;flex-shrink:0}
.vp-t b,.vp-i b{display:block;font-size:15px;font-weight:600;line-height:1.2}.vp-t small,.vp-i small{display:block;font-size:11.5px;letter-spacing:.08em;color:var(--ink-50);font-weight:500;margin-top:2px}
.vp-m{position:absolute;z-index:20;left:0;right:0;top:66px;background:var(--panel);border:1.5px solid var(--ink);border-radius:16px;box-shadow:0 18px 40px -18px rgba(0,0,0,.35);padding:12px;animation:fadein .15s ease both}
.vp-f{display:flex;gap:8px;margin-bottom:10px}.vp-f button{font:inherit;font-size:13px;font-weight:500;border:1.5px solid var(--border);background:var(--panel);border-radius:999px;padding:5px 14px;cursor:pointer;color:var(--ink)}.vp-f button.on{background:var(--ink);border-color:var(--ink);color:#fff}
.vp-l{display:flex;flex-direction:column;gap:4px;max-height:300px;overflow:auto}
.vp-i{display:flex;gap:12px;align-items:flex-start;width:100%;text-align:left;font:inherit;color:var(--ink);background:none;border:1.5px solid transparent;border-radius:12px;padding:10px;cursor:pointer}.vp-i:hover{background:var(--canvas)}.vp-i.on{background:var(--mint-50);border-color:var(--mint)}
.vp-i em{display:block;font-style:normal;font-size:13px;color:var(--ink-50);margin-top:3px}
</style>'''

NEW_VIEWS = r'''
/* FAQs live in the details step, so Enquiries are already set up */
function faqSync(){TS.set(x=>{x.d.faqs=S.o.faqs.map(f=>f.slice())})}
function faqSet(i,j,v){S.o.faqs[i][j]=v;faqSync()}
function faqDel(i){S.o.faqs.splice(i,1);faqSync();render()}
function faqAdd(c){S.o.faqs.push(['','',c||'general']);faqSync();render()}
/* search complete: what we found, one card */
const _res=VIEWS.research;
VIEWS.research=()=>{if(S.rs<RS.length)return _res();const o=S.o,d=S.d,F=[['Brand name',d.brand],['Cuisine',d.cuisine],['Country',d.country],['Description',d.desc]];
 return{body:`<div class="body fade">${head('Here’s what I found.')}
 <div class="sec card sc"><div class="sc-h"><div><span class="sc-e">Search complete</span><div class="sc-n">${esc(d.brand)}</div></div><button class="lnk" onclick="go(0)">← Search again</button></div>
 ${F.map(f=>`<div class="sc-r"><label>${f[0]}</label><span>${esc(f[1])}</span><em>✓ Found</em></div>`).join('')}
 <div class="sc-f">${OUTLETS.length} locations · ${o.faqs.length} FAQs found</div></div></div>`,foot:footer({next:'Continue'})}};
/* 02 · pick the outlet you are setting up */
VIEWS.locate=()=>({body:`<div class="body fade">${head('Choose the outlet you’re setting up.')}
 <div class="sec"><div class="lc-h"><span class="cap">Locations</span><b>Pick the one you’re setting up</b><span class="lc-n">${OUTLETS.length} found</span></div>
 <div class="lc-g">${OUTLETS.map(o=>`<button class="lc ${S.o&&S.o.id===o.id?'on':''}" onclick="pickLoc('${o.id}')"><div class="lc-t"><div><b>${esc(o.short||o.name)} · ${esc(o.area.split(',')[0])}</b><br><small>${esc(o.addr)}</small></div></div>
  <div class="lc-c"><span>Hours found</span><span>${o.faqs.length} FAQs</span><span>Phone found</span><span class="k">${esc(o.rating)}</span></div><span class="lc-go">Review outlet →</span></button>`).join('')}</div>
 <button class="lc-m" onclick="manual()">None of these — I’ll enter my location manually</button></div></div>`});
function pickLoc(id){S.o=OUTLETS.find(o=>o.id===id);loadOutlet();next()}
/* 04 · meet your agent */
const VGRAD=['linear-gradient(135deg,#4FC2B4,#1F6E62)','linear-gradient(135deg,#FFB84D,#FF8F7A)','linear-gradient(135deg,#8B7CF6,#5B43B5)','linear-gradient(135deg,#FF8F7A,#C2477A)','linear-gradient(135deg,#5ED3F3,#2A5C85)'];
const vAv=v=>`<span class="vp-av" style="background:${VGRAD[VOICES.indexOf(v)%VGRAD.length]}">${esc(v.n[0])}</span>`;
function onName(v){S.agent.name=v.trim()||'Emma';if(!S.agent.greet){const g=$('#gr');if(g)g.value=greet()}}
function speak(){const v=voice();S.play=true;const p=$('#pl');if(p)p.classList.add('on');
 try{if(window.speechSynthesis){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(greet());u.pitch=v.pitch;u.rate=v.rate;u.onend=()=>{S.play=false;const q=$('#pl');if(q)q.classList.remove('on')};speechSynthesis.speak(u);}}catch(e){}
 setTimeout(()=>{S.play=false;const q=$('#pl');if(q)q.classList.remove('on')},4200)}
function agSync(){TS.set(x=>{x.d.agent.name=S.agent.name;x.d.agent.voice=S.agent.voice;x.d.agent.greet=S.agent.greet})}
function onName2(v){onName(v);agSync()}
function vpPick(id){S.agent.voice=id;S.vo=false;agSync();render();speak()}
const vpHTML=()=>{const cur=VOICES.find(v=>v.id===S.agent.voice)||VOICES[0],f=S.vf||'all',list=VOICES.filter(v=>f==='all'||v.g.toLowerCase()===f);
 return`<div class="vp"><button class="vp-b" onclick="S.vo=!S.vo;render()" aria-expanded="${!!S.vo}" aria-haspopup="listbox">${vAv(cur)}<span class="vp-t"><b>${esc(cur.n)}</b><small>${esc(cur.t.toUpperCase())}</small></span>${ic('chev',16)}</button>
 ${S.vo?`<div class="vp-m" role="listbox"><div class="vp-f">${[['all','All voices'],['female','Female'],['male','Male']].map(x=>`<button class="${f===x[0]?'on':''}" onclick="S.vf='${x[0]}';render()">${x[1]}</button>`).join('')}</div><div class="vp-l">${list.map(v=>`<button class="vp-i ${v.id===S.agent.voice?'on':''}" role="option" onclick="vpPick('${v.id}')">${vAv(v)}<span><b>${esc(v.n)}</b><small>${esc(v.t.toUpperCase())}</small><em>${esc(v.d)}</em></span></button>`).join('')}</div></div>`:''}</div>`};
VIEWS.agent=()=>{const A=S.agent,n=A.name,fb=A.fb||'staff';
 return{body:`<div class="body fade">${head(`Meet ${esc(n)}.`,'We’ve created an agent for you. Take a listen and change anything.')}
 <div class="sec card ag"><div class="ag-top"><div class="ag-ic" aria-hidden="true"><i></i><i></i><svg viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="12" rx="4"/><path d="M12 8V4.5"/><circle cx="12" cy="3.5" r="1.2"/><path d="M2 13v3M22 13v3"/><circle cx="9" cy="14" r="1.1" fill="#06231e"/><circle cx="15" cy="14" r="1.1" fill="#06231e"/><path d="M9.5 17.2c1.5 1 3.5 1 5 0"/></svg></div><div style="flex:1;min-width:0"><span class="cap">Your agent</span><input class="nm" id="nm" value="${esc(n)}" aria-label="Agent name" oninput="onName2(this.value)"/></div></div>
  <div class="ag-b"><div class="field"><span>Voice</span><div class="vrow">${vpHTML()}<button class="play ${S.play?'on':''}" id="pl" onclick="speak()" aria-label="Play greeting">${ic('play',16)}<span class="wave"><s></s><s></s><s></s><s></s></span></button></div></div>
  <label class="field"><span>Greeting</span><textarea class="ta" id="gr" rows="3" oninput="S.agent.greet=this.value;agSync()">${esc(greet())}</textarea></label>
  <div class="field"><span>If a caller needs a person</span><div class="seg2"><button class="${fb==='staff'?'on':''}" onclick="S.agent.fb='staff';render()"><b>Transfer to staff</b><small>When the restaurant is open</small></button><button class="${fb==='msg'?'on':''}" onclick="S.agent.fb='msg';render()"><b>Take a message</b><small>Always, even when open</small></button></div></div></div></div></div>`,foot:footer({next:'Continue'})}};
/* 03 · set up: Reservations and Ordering */
const agentName=()=>TS.get().d.agent.name;
VIEWS.services=()=>({body:`<div class="body fade">${head('What should your agent handle?')}
 <div class="ts-stk">${TS.variant==='A'?TS.list({toggle:true,go:false}):TS.pick()}</div></div>`,
 foot:footer({next:'Open dashboard'})});
/* 05 · go live */
function openDash(){try{parent.postMessage({tringg:'handoff'},'*')}catch(e){}}
VIEWS.live=()=>{const N='+1 (312) 555-0147',A=TS.variant==='A';
 return{body:`<div class="body fade">${head('Go live.')}
 <div class="sec"><div class="cap" style="margin-bottom:10px">What goes live</div><div class="card pad" style="padding:20px 24px">${TS.goSummary({finish:A})}</div></div>
 <div class="sec"><div class="cap" style="margin-bottom:10px">Forward your line to this number</div>
  <div class="card num"><span class="mono">${N}</span><button class="btn line sm" onclick="TS.copy(this)">Copy</button></div>
  <p class="hint" style="margin-top:12px">This is your Tringg number. It answers every call that reaches it. Ask your network operator to forward your restaurant line to it.</p></div>
 <div class="sec">${TS.goCard()}</div>
 <div style="margin-top:28px"><button class="btn" onclick="openDash()">Open dashboard ${ic('chev',16)}</button></div></div>`}};
TS.on(()=>{const id=STEPS[S.i];if(id==='services'||id==='live')render()});
TS.hello();
'''


def build_onboarding(v, w='1'):
    t = OB
    t = must(t, '<div id="app"></div>\n<script>', '<div id="app"></div>\n' + engine_tag(v, w) + '<script>')
    t = must(t, '</style>', OB_CSS)
    t = cut(t, 'const OUTLETS=[', 'const CUISINES', '''const RFAQS=[['Do you have gluten-free crusts?','Yes, on any 12-inch pizza.','general'],['Is there parking nearby?','Yes, street parking and a garage next door.','general'],['Do you have vegan options?','Yes, a vegan cheese pizza and several pastas.','general'],['Can you host a private party?','Yes, up to 40 guests.','general'],
 ['Do you take walk-ins?','Yes, subject to availability. Booking is recommended on weekends.','res'],['How far ahead can I book?','Up to 30 days ahead.','res'],['Can I book for a large group?','Yes, up to 12 guests by phone.','res'],
 ['Do you deliver?','Yes, within 3 miles.','ord'],['How long does pickup take?','About 20 minutes.','ord'],['Is there a delivery fee or minimum?','A $3 fee and a $15 minimum.','ord'],
 ['Do you cater?','Yes. We cater events of 20 or more. Call us for a quote.','catering'],['How much notice do you need for catering?','At least 48 hours.','catering'],
 ['Do you have live music?','Yes, every Friday and Saturday from 7 PM.','music'],['Can I book the restaurant for a music event?','Yes, for private events on weekdays.','music']];
const RBASE={cuisine:'Italian',country:'United States',tz:'America/Chicago',desc:'Wood-fired Neapolitan pizza, fresh pasta and an Italian wine list.',open:'16:00',close:'23:00',site:'rossapizza.com',faqs:RFAQS};
const OUTLETS=[
 {...RBASE,id:'rossa',name:'ROSSA Pizzeria',short:'ROSSA Pizzeria',area:'West Loop, Chicago',addr:'845 W Randolph St, Chicago, IL 60607',lat:41.88414,lng:-87.64798,phone:'+1 (312) 555-0147',rating:'4.6 ★ · 2,031 reviews'},
 {...RBASE,id:'rossa-wp',name:'ROSSA Pizzeria',short:'ROSSA Pizzeria',area:'Wicker Park, Chicago',addr:'1520 N Milwaukee Ave, Chicago, IL 60622',lat:41.90887,lng:-87.67441,phone:'+1 (312) 555-0152',rating:'4.5 ★ · 1,184 reviews'},
 {...RBASE,id:'rossa-nv',name:'ROSSA Pizzeria',short:'ROSSA Pizzeria',area:'Naperville, IL',addr:'55 S Main St, Naperville, IL 60540',lat:41.77243,lng:-88.14774,phone:'+1 (630) 555-0166',rating:'4.4 ★ · 612 reviews'},
 {...RBASE,id:'rossa-au',name:'Rossa Trattoria',short:'Rossa Trattoria',area:'South Congress, Austin',addr:'1200 S Congress Ave, Austin, TX 78704',lat:30.2506,lng:-97.7495,tz:'America/Chicago',phone:'+1 (512) 555-0129',rating:'4.7 ★ · 903 reviews',site:'rossatrattoria.com'},
 {...RBASE,id:'rossa-bk',name:'Rossa Pizza & Pasta',short:'Rossa Pizza & Pasta',area:'Park Slope, Brooklyn',addr:'318 7th Ave, Brooklyn, NY 11215',lat:40.6709,lng:-73.9806,tz:'America/New_York',phone:'+1 (718) 555-0143',rating:'4.3 ★ · 457 reviews',site:'rossapizzapasta.com'}];
''')

    t = must(t, "${head('Tell Tringg your restaurant.','Type its name or paste your website. I’ll pull the rest automatically.')}", "${head('Find your restaurant.')}")
    t = must(t, '''el.innerHTML=`<p class="hint">Try <button class="lnk" onclick="try1('Aladdin')">Aladdin Broasted Chicken</button> or <button class="lnk" onclick="try1('ROSSA')">ROSSA Pizzeria</button></p>`''',
             '''el.innerHTML=`<p class="hint">Try <button class="lnk" onclick="try1('ROSSA')">ROSSA Pizzeria</button></p>`''')
    t = must(t, '<input id="q" autocomplete="off" placeholder="e.g. Your restaurant name"', '<input id="q" autocomplete="off" placeholder="Restaurant name or website"')
    # four steps, one header stepper
    t = must(t, "<b>${esc(o.viaUrl?'Read '+o.viaUrl:o.name)}</b><small>${esc(o.viaUrl?'Pull name, hours and menu from this site':o.addr)}</small></button>`).join('')+'</div>'", "<b>${esc(o.viaUrl?'Read '+o.viaUrl:o.name)}</b><small>${esc(o.viaUrl?'Pull name, hours and menu from this site':o.area+' · '+o.addr)}</small></button>`).join('')+(m[0]&&!m[0].viaUrl?`<div class=\"sug-or\">Or search by website</div><button class=\"sg\" onclick=\"pickSite()\"><b>${esc(m[0].site)}</b><small>Pull name, hours and menu from this site</small></button>`:'')+'</div>'")
    t = must(t, "function pickFirst(){", "function pickSite(){const o=OUTLETS[0];S.o={...o,viaUrl:o.site};loadOutlet();next()}\nfunction pickFirst(){")
    t = must(t, "agent:{voice:'shubh',name:'Novi',greet:''}", "agent:{voice:'allie',name:'Emma',greet:''}")
    t = cut(t, "const VOICES=[", "const NOTICE", VOICES_JS)
    t = must(t, "function rsPaint(){const done=S.rs>=RS.length,card=$('#rcard');if(!card)return;", "function rsPaint(){const done=S.rs>=RS.length,card=$('#rcard');if(!card)return;if(done){render();return}")
    t = must(t, "S.i=2;S.fresh=true;S.edit={brand:true,hours:true}", "S.i=STEPS.indexOf('verify');S.fresh=true;S.edit={brand:true,hours:true}")
    t = must(t, " S.fresh=false;\n if(fresh)typeHeading()", " S.fresh=false;if(!fresh)document.querySelectorAll('.fade').forEach(x=>x.classList.remove('fade'));\n if(fresh)typeHeading()")
    t = must(t, "const next=()=>go(S.i+1),back=()=>go(S.i-1);", "const next=()=>{if(STEPS[S.i]==='services'){openDash();return}go(S.i+1)},back=()=>go(S.i-1);")
    t = must(t, "const GROUPS=['Discover','Verify','Services','Meet your agent','Review','Go live'];", "const GROUPS=['Find','Verify','Agent','Set up'];")
    t = must(t, "const STEPS=['find','research','verify','rules','voice','review','live'];", "const STEPS=['find','research','locate','verify','agent','services'];")
    t = must(t, "const GI={find:0,research:0,verify:1,rules:2,voice:3,review:4,live:5};", "const GI={find:0,research:0,locate:1,verify:1,agent:2,services:3};")
    t = must(t, "const head=(t,s)=>`${chip()}<h1", "const head=(t,s)=>`<h1")
    t = must(t, " $('#bar').style.width=(id==='live'?100:(GI[id]+(id==='research'?.6:.5))/6*100)+'%';\n", "")
    t = must(t, '<header class="hdr"><div class="logo">Tringg</div></header>', '<header class="hdr"><div class="logo">Tringg</div>${stepper()}<span></span></header>')
    t = must(t, "const chip=()=>", '''const stepper=()=>{const g=GI[STEPS[S.i]];return `<nav class="stp" aria-label="Progress">${GROUPS.map((n,k)=>`${k?`<span class="stp-l ${k<=g?'done':''}"></span>`:''}<span class="stp-s ${k<g?'done':k===g?'on':''}" ${k===g?'aria-current="step"':''}><span class="n">${k<g?ic('check',13):k+1}</span>${n}</span>`).join('')}</nav><span class="stp-m">Step ${g+1} of ${GROUPS.length} · ${GROUPS[g]}</span>`};
const chip=()=>''')
    # reading your listings
    t = must(t, "${head(done?'Here’s what I learned.':'Teaching your host…',done?'You’ll confirm each detail next. Nothing goes live until you say so.':'Learning from public listings so your first call sounds like staff.')}", "${head(done?'Here’s what I found.':'Reading your listings…')}")
    t = must(t, '<div class="avw"><i class="ring"></i><i class="ring"></i><i class="ring"></i><div class="av">${esc((S.d.brand||\'T\')[0].toUpperCase())}</div><div class="orbit"></div></div>', '<div class="avw2"><video src="__HERO__" autoplay muted loop playsinline aria-hidden="true"></video></div>')
    t = must(t, '  <div class="tick mono" aria-hidden="true"><em>now reading</em><span id="tk"></span></div>\n', '')
    t = must(t, "foot:footer({ok:done,why:'Almost there…',next:'Review'})", "foot:footer({ok:done,next:'Continue'})")
    t = must(t, "h.dataset.t='Here’s what I learned.'", "h.dataset.t='Here’s what I found.'")
    t = must(t, "card.classList.toggle('done',done);", "card.classList.toggle('done',done);const hv=$('.avw2 video');if(hv&&done)hv.pause();")
    t = must(t, '<div class="rlist">', '<div class="rlist">', count=1)
    t = must(t, "const OUTLETS=[", "const PHOTOS=__PHOTOS__;const phStrip=()=>PHOTOS.length?`<div class=\"phs\" style=\"grid-template-columns:repeat(${Math.min(PHOTOS.length,3)},1fr)\">${PHOTOS.slice(0,3).map(u=>`<img src=\"${u}\" alt=\"\" style=\"aspect-ratio:${PHOTOS.length<3?'4/3':'1'}\"/>`).join('')}</div>`:'';\nconst OUTLETS=[")
    # details step: short heading, editable FAQs
    t = must(t, "${head('Choose the outlet you’re setting up.','Everything’s pre-filled. Just confirm it’s right.')}", "${head('Check your details.')}")
    t = must(t, "VIEWS.verify=()=>{const o=S.o,d=S.d,e=S.edit;", '''VIEWS.verify=()=>{const o=S.o,d=S.d,e=S.edit;
 const CATN=[['general','General'],['res','Reservation'],['ord','Ordering'],['catering','Catering'],['music','Music events']],byC=c=>o.faqs.map((f,i)=>[f,i]).filter(x=>(x[0][2]||'general')===c);
 const faqView=`<div class="v">${o.faqs.length?CATN.map(c=>byC(c[0]).length?`<div class="faqh"><span class="ts-cat2 c-${c[0]}">${c[1]}</span></div>`+byC(c[0]).map(x=>`<div class="faq"><b>${esc(x[0][0])}</b><span>${esc(x[0][1])}</span></div>`).join(''):'').join(''):'<small>None yet</small>'}</div>`;
 const faqEd=`<div class="full">${CATN.map(c=>`<div class="faqh"><span class="ts-cat2 c-${c[0]}">${c[1]}</span></div>`+byC(c[0]).map(x=>`<div class="faqe"><input class="in" value="${esc(x[0][0])}" aria-label="Question" onchange="faqSet(${x[1]},0,this.value)"/><textarea class="ta" rows="2" aria-label="Answer" onchange="faqSet(${x[1]},1,this.value)">${esc(x[0][1])}</textarea><button class="lnk g" style="align-self:flex-start" onclick="faqDel(${x[1]})">Remove</button></div>`).join('')+`<button class="btn line sm" style="margin-bottom:14px" onclick="faqAdd('${c[0]}')">Add a question</button>`).join('')}</div>`;''')
    t = must(t, "${e.brand?brand:''}</div>", "${e.brand?brand:''}${PHOTOS.length&&!e.brand?`<div class=\"full\" style=\"margin-top:4px\">${phStrip()}</div>`:''}</div>")
    t, n = re.subn(r'<div class="row"><label>Answers</label>.*?<span></span></div>', '''<div class="row"><label>FAQs</label>${e.faq?'<span></span>':faqView}<button class="lnk" onclick="tog('faq')">${e.faq?'Done':'Edit'}</button>${e.faq?faqEd:''}</div>''', t, count=1, flags=re.S)
    assert n == 1
    t = must(t, "function tog(k){S.edit[k]=!S.edit[k];render()}", "function tog(k){if(k==='faq'&&S.edit.faq){S.o.faqs=S.o.faqs.filter(f=>f[0].trim()&&f[1].trim());faqSync()}S.edit[k]=!S.edit[k];render()}")
    t = must(t, "days:[1,1,1,1,1,1,1]});S.rs=0}", "days:[1,1,1,1,1,1,1]});S.rs=0;TS.set(x=>{x.d.brand=o.short||o.name;x.d.outlet={name:o.short||o.name,area:o.area,addr:o.addr};x.d.faqs=(o.faqs||[]).map(f=>f.slice())})}")
    t = cut(t, '/* 03 · reservation: the real six rules */', 'function copyNum(b)', NEW_VIEWS)
    t = t.replace('__PHOTOS__', json.dumps(PHOTOS))
    t = t.replace('__HERO__', HERO)
    return t


# ───────────────────────── dashboard ─────────────────────────
PROTO_PANEL = '''<div class="proto"><div class="proto-l">Prototype</div><div class="proto-seg" style="grid-template-columns:repeat(2,1fr)"><button onclick="resetDash()">Start over</button><button onclick="loadReady()">Sample data</button></div></div>
   <div class="proto"><div class="proto-l">Plan</div><div class="proto-seg" style="grid-template-columns:repeat(3,1fr)"><button class="${!TS.active()?'on':''}" onclick="TS.setPlan('none')">None</button><button class="${TS.get().trial?'on':''}" onclick="TS.setPlan('trial')">Trial</button><button class="${TS.get().sub?'on':''}" onclick="TS.setPlan('sub')">Paid</button></div></div>'''

OVERVIEW_FRESH = r'''function vOverviewFresh(){const mo=DB.mods,G=h=>`<div class="goff">${h}</div>`,T=(ic,c,l,k)=>{const h=stat(ic,c,'0',l);return k&&!mo[k]?G(h):h;};
  return `<div class="scroll"><div class="page"><div class="lbl">${S.outlet==='all'?'All outlets':esc(ON(S.outlet).name)}</div>
   <div class="stats">${T('cal','ic-mint','Today’s bookings','res')}${T('bagL','ic-mint','Orders today','ord')}${T('clock','ic-coral','Pending now')}${T('phoneL','ic-grey','Calls today')}</div>
   <div class="ov-grid"><div class="col"><div class="card"><div class="card-h"><div class="h2">Pending requests</div></div><div class="card-b"><div class="soft-empty">No pending requests</div></div></div></div>
   <div class="col"><div class="card agent"><div class="agent-h"><div class="agent-av">${BRAND.agent[0]}</div><div><div class="agent-n">${esc(BRAND.agent)}</div><div class="agent-s">${['Enquiries',mo.res?'Reservation':null,mo.ord?'Ordering':null].filter(Boolean).join(' · ')}</div></div></div>
    <div class="agent-stats"><div><div class="v">0</div><div class="l">Calls today</div></div><div><div class="v">0</div><div class="l">Avg duration</div></div><div><div class="v">0%</div><div class="l">Success rate</div></div></div></div>
    <div class="card"><div class="card-h"><div class="h3">Recent calls</div></div><div class="card-b" style="padding-top:8px"><div class="muted small">No calls yet</div></div></div></div></div></div></div>`;}
'''

BOOT = r'''/* setup prototypes: one location, empty to start, driven by the shared setup state */
(function(){
 const PRIMARY='wl';const FRESH_OUT=['wl','wp','nv'];ROLE_OUT.owner=FRESH_OUT;SC.wl=.4;let FULL=false;let CUR=PRIMARY;const SNAP={};
 const hasSvc=st=>Object.keys(st.done||{}).some(k=>/^(res|ord)\\./.test(k)&&st.done[k]);
 TS.outletSet=id=>FULL||(id===CUR?hasSvc(TS.get()):!!SNAP[id]&&hasSvc(SNAP[id]));TS.isFull=()=>FULL;
 TS.beforeOutlet=to=>{if(FULL||to==='all'||to===CUR)return;SNAP[CUR]=JSON.parse(JSON.stringify(TS.get()));const cur=TS.get(),n=SNAP[to]||(()=>{const f=TS.blank();f.d.agent=JSON.parse(JSON.stringify(cur.d.agent));f.d.brand=cur.d.brand;f.d.faqs=JSON.parse(JSON.stringify(cur.d.faqs));f.d.outlet={name:cur.d.outlet?cur.d.outlet.name:cur.d.brand,area:ON(to).short};f.sub=cur.sub;f.trial=cur.trial;if(cur.sub)f.done['go.sub']=true;return f;})();CUR=to;S.setupCollapsed=false;TS.swap(n);};
 function initFresh(){FULL=false;S.setupCollapsed=false;ROLE_OUT.owner=FRESH_OUT;applyRole(true);loadScenario('off');applyRole();TS.cfg.outlets=1;
  DB.k='setup';SCEN.setup={t:'Setup',h:''};DB.res=[];DB.calls=[];DB.orders=[];DB.held=[];DB.taxes=[];S.res.sel=null;S.route='overview';S.outlet=PRIMARY;S.ordOutlet=PRIMARY;S.dd=false;}
 TS.nav=r=>go(r);TS.cfg.outlets=1;
 TS.host.render=()=>render();TS.host.collapse=()=>{S.setupCollapsed=true;render();};TS.host.expand=()=>{S.setupCollapsed=false;S.growSetup=true;go('overview');};
 window.applyTS=function(){const s=TS.get(),d=s.d,done=k=>!!s.done[k],sv=d.svc,p=d.pay,t=d.tax;
  if(FULL){DB.subscribed=TS.active();BRAND.agent=d.agent.name;if(DB.agents[0])DB.agents[0].n=d.agent.name;syncMods();return;}
  OUTLETS_ALL.forEach(o=>{DB.om[o.id]={res:!!s.svc.res,ord:!!s.svc.ord};});
  MODS.res=!!s.svc.res;MODS.ord=!!s.svc.ord;DB.caps.res=!!s.svc.res;DB.subscribed=TS.active();
  DB.menuState=done('ord.menu')?'live':'none';DB.menuSource=done('ord.menu')?({google:'Google profile',pos:'Your POS',web:'Website',agg:'Delivery app',upload:'Uploaded menu',scratch:'Built in Tringg'}[d.menu.src]||'Imported'):null;
  DB.taxOk=done('ord.tax');DB.taxes=done('ord.tax')&&t.on?[{id:'t1',type:t.type,n:t.n,on:t.app,base:t.base,calc:t.calc,vt:t.vt,v:t.v,ch:t.ch,delfee:!!t.delfee,outs:[CUR]}]:[];
  DB.payOk=done('ord.pay');DB.stripe=p.conn?'active':'none';DB.payPick={call:p.pick!=='store',store:p.pick!=='online'};
  DB.cod=Object.assign({},DB.cod,{capOn:!!p.capOn,cap:p.cap,repeatOn:!!p.repeatOn,repeatN:p.repeatN});DB.payFall={pk:!!p.fbPk&&p.pick==='both',dl:!!p.fbDl&&(!!p.capOn||!!p.repeatOn)};
  OUTLETS_ALL.forEach(o=>{if(o.id===CUR&&done('ord.svc')){DB.svc[o.id]={set:true,del:!!sv.del,pick:!!sv.pick,prep:sv.pick?sv.prep:null,rad:sv.del?{mi:sv.mi,fee:sv.fee,min:sv.min,eta:sv.eta}:null};DB.deliveryMode[o.id]=sv.del?'radius':null;}
   else DB.svc[o.id]={set:false,del:false,pick:false,prep:null,rad:null};});
  DB.serviceSet=done('ord.svc');DB.orderingOn=TS.ready('ord')&&DB.subscribed;DB.caps.ord=DB.orderingOn;
  BRAND.agent=d.agent.name;BRAND.name=d.brand||BRAND.name;
  const ou=OUTLETS_ALL.find(o=>o.id===CUR);if(d.outlet&&ou){const a=(d.outlet.area||'').split(',')[0];ou.name=d.outlet.name+(a?' · '+a:'');ou.short=a||ou.short;}
  if(DB.agents[0]){const A=DB.agents[0];A.n=d.agent.name;A.voice=({allie:'ishita',marcus:'sunny',leo:'sunny'})[d.agent.voice]||d.agent.voice||A.voice;if(d.agent.greet)A.greet=d.agent.greet;}
  syncMods();};
 window.resetDash=()=>{TS.reset();CUR=PRIMARY;Object.keys(SNAP).forEach(k=>delete SNAP[k]);initFresh();applyTS();render();};
 /* one state with everything set up and data for reservations and orders */
 window.loadReady=()=>{FULL=true;TS.fill();ROLE_OUT.owner=null;applyRole(true);loadScenario('live');applyRole();DB.k='live';
  BRAND.agent=TS.get().d.agent.name;if(DB.agents[0])DB.agents[0].n=BRAND.agent;TS.cfg.outlets=OUTLETS.length;S.outlet=PRIMARY;S.route='overview';S.dd=false;S.res.sel='R-311';S.orders.sel=null;S.orders.tab='pending';render();};
 initFresh();
 TS.on(()=>{applyTS();render();});
 window.addEventListener('message',e=>{const m=e.data;if(!m||!m.tringg)return;
  if(m.tringg==='enter'){S.route='overview';S.outlet=PRIMARY;S.dd=false;render();scrollTo(0,0);if(TS.welcome==='3'&&!TS.welcomed&&!TS.allDone()){TS.welcomed=true;setTimeout(()=>TS.showWelcome(),350);}}
  if(m.tringg==='ready'){S.route='overview';loadReady();}});
 applyTS();TS.hello();
})();
render();
'''


def build_dashboard(v, w='1'):
    t = DB
    t = must(t, '<script>\n', engine_tag(v, w) + '<script>\n')
    # one setup surface, no sidebar checklist
    t = must(t, "function renderChk(){if(S.outlet==='all'||!DB.mods.ord)return '';", "function renderChk(){if(TS.variant==='C'&&S.setupCollapsed)return TS.railWidget();return '';")
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
    # no question-mark tooltips: a single hint line under the label instead
    t, n = re.subn(r'const tip=t=>`<span class="ti".*?</span></span>`;', lambda m: "const tip=t=>'';const tip1=t=>String(t).split(/(?<=[.!?])\\s/)[0];", t, count=1, flags=re.S)
    assert n == 1
    t, n = re.subn(r"const orow=\(label,tp,ctl,sub\)=>.*?\n", lambda m: "const orow=(label,tp,ctl,sub)=>`<div class=\"tg\"><div class=\"tx\"><div class=\"fl\">${label}</div>${sub?`<div class=\"fh\">${sub}</div>`:tp?`<div class=\"fh fh1\">${esc(tip1(tp))}</div>`:''}</div>${ctl}</div>`;\n", t, count=1)
    assert n == 1
    t = must(t, '</style>', '.fh1{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:560px}.btn-dark{transition:transform .15s,box-shadow .15s,background .12s}.btn-dark:hover:not(:disabled){transform:translate(-2px,-2px);box-shadow:3px 4px 0 #fff,3px 4px 0 1.5px #111}</style>')
    # a single outlet shows that outlet only: no all-outlets billing, team, exceptions or other-outlet notes
    t = must(t, "const nav=roleNav(S.outlet==='all'?SETNAV_ALL:SETNAV_ONE);", "const nav0=roleNav(S.outlet==='all'?SETNAV_ALL:SETNAV_ONE),nav=(S.outlet!=='all'&&OUTLETS.length>1)?nav0.map(g=>[g[0],g[1].filter(i=>!['billing','team'].includes(i[0]))]).filter(g=>g[1].length):nav0;")
    t = must(t, '<div class="scope-note">${S.outlet===\'all\'', '<div class="scope-note" ${OUTLETS.length>1?\'\':\'hidden\'}>${S.outlet===\'all\'')
    t = must(t, "`<div class=\"sep\"></div><div class=\"fl\">Outlets that differ${tip('An outlet can do the opposite of the main setting.')}</div>`+", "(one?'':`<div class=\"sep\"></div><div class=\"fl\">Outlets that differ</div>`)+")
    t = must(t, "(exc.length?`<div class=\"tblw\">", "(one?'':exc.length?`<div class=\"tblw\">")
    t = must(t, "(rest.length?`<div class=\"frow\"", "(!one&&rest.length?`<div class=\"frow\"")
    t = must(t, "(one&&txAll.length>tx.length?", "(false?")
    t = must(t, "(one?orow('This outlet'", "(one&&OUTLETS.length>1?orow('This outlet'")
    t = must(t, "function svcShared(one){if(!one)return '';", "function svcShared(one){if(!one||OUTLETS.length<2)return '';")
    t = must(t, '/ outlet / month', "${OUTLETS.length>1?'/ outlet / month':'/ month'}")
    a = t.index(" faq:()=>sH('FAQ / Knowledge'")
    b = t.index("\n ord:()=>ordPage(),", a)
    t = t[:a] + " faq:()=>sH('FAQ / Knowledge','')+TS.faqPage()," + t[b:]
    t = must(t, "<button class=\"btn btn-dark\" onclick=\"toast('Log missed booking')\">${I.plus} Log missed booking</button>", "<button class=\"btn btn-dark\" onclick=\"toast('New booking')\">${I.plus} New booking</button>")
    t, n = re.subn(r'<div class="live"><span class="d"></span>\$\{BRAND\.agent\} is live — try it.*?\$\{I\.copy\}</button></div>', '', t, count=1, flags=re.S)
    assert n == 1
    t = must(t, "(DB.subscribed&&TS.get().done['go.fwd'])?", "DB.subscribed?")
    t = must(t, "  renderOverlay();\n  if(_keep)", "  renderOverlay();if(S.route==='overview')ovEnhance();\n  if(_keep)")
    t = must(t, ":!DB.subscribed?'':!DB.orderingOn?'<span class=\"bdg new\">Set up</span>'", ":!TS.ready('ord')?'<span class=\"bdg new\">Set up</span>':!DB.subscribed?'':!DB.orderingOn?'<span class=\"bdg new\">Set up</span>'")
    t = must(t, "b=!DB.mods.res?'<span class=\"bdg off\">Off</span>':!DB.subscribed?'':p?", "b=!DB.mods.res?'<span class=\"bdg off\">Off</span>':!TS.ready('res')?'<span class=\"bdg new\">Set up</span>':!DB.subscribed?'':p?")
    # the Orders header switches belong to the live view only
    t = must(t, "S.route==='orders'&&DB.orderingOn", "S.route==='orders'&&DB.orderingOn&&TS.get().done['go.fwd']", count=3)
    # prototype panel
    a = t.index('<div class="proto"><div class="proto-l">Prototype state</div>')
    b = t.index('Subscribed</button></div></div>', a) + len('Subscribed</button></div></div>')
    t = t[:a] + PROTO_PANEL + t[b:]
    t = must(t, "${DB.svc[x.id].set!==true?'<span class=\"odd-new\">New</span>':''}", "${TS.outletSet(x.id)?'':'<span class=\"odd-new\">Set up</span>'}")
    t = must(t, "function pickOutlet(id){", "function pickOutlet(id){TS.beforeOutlet(id);")
    t = must(t, '</style>', '.btn-dark{background:#4FC2B4;color:#fff;font-weight:600;border:1.5px solid #111}.btn-dark:hover:not(:disabled){background:#4FC2B4;color:#fff}.btn-dark:hover:not(:disabled){box-shadow:3px 4px 0 #111}.odd-new{background:#DDF2EE;color:#1F6E62}</style>')
    # modules: a service that is off offers to add itself; one that isn't set up shows its steps in place
    t = must(t, '''onclick="goSet('mods')">Turn on</button>''', '''onclick="TS.add('${m}')">Add ${m==='ord'?'ordering':'reservations'}</button>''')
    t = must(t, "const VIEWS={overview:vOverview,reservations:modG(gate(vReservations,'Table requests and bookings'),'res'),orders:modG(gate(vOrders,'Phone orders'),'ord'),",
             "const modT=(fn,m)=>()=>{if(!DB.mods[m])return greyed(fn(),m);if(!TS.ready(m))return TS.panel(m);if(!TS.active()||!TS.get().done['go.fwd'])return TS.readyPage(m);return fn();};\nconst VIEWS={overview:vOverview,reservations:modT(vReservations,'res'),orders:modT(vOrders,'ord'),")
    # overview: one setup block per variant, above the numbers
    t = must(t, "function vOverview(){\n  if(!DB.subscribed)return vOverviewFresh();", "function vOverview0(){")
    t = cut(t, 'function vOverviewFresh(){', 'function vOverview0(){', OVERVIEW_FRESH + '''function vOverview(){
  const first=(me().n||'').split(' ')[0];TS.cfg.user=first||'there';
  const FULL=TS.isFull(),PRIMARY='wl';
  const un=OUTLETS.filter(o=>!TS.outletSet(o.id)),other=!FULL&&S.outlet==='all'&&un.length>0;
  const stripe=other?`<div class="ts-stripe"><span><b>${OUTLETS.length-un.length} of ${OUTLETS.length} outlets set up</b><br><small>Choose an outlet to set up next so it can take calls.</small></span><button class="ts-btn sm" onclick="TS.chooseOutlet(OUTLETS.filter(o=>!TS.outletSet(o.id)),'pickOutlet')">Set up an outlet</button></div>`:'';
  if(TS.totals().done===0&&!TS.allDone())return `<div class="scroll"><div class="page">${stripe}${TS.overviewTop()}</div></div>`;
  const h=DB.subscribed?vOverview0():vOverviewFresh();return h.replace(/<div class="lbl">[^<]*<\\/div>/,()=>stripe+TS.overviewTop());}
function ovEnhance(){document.querySelectorAll('#view .ov-grid .card:not(.agent)').forEach(c=>{const h=c.querySelector('.card-h');if(!h||h.querySelector('.ov-t'))return;const k=(h.textContent||'').trim().slice(0,24);if(S.ovC&&S.ovC[k])c.classList.add('ov-c');const b=document.createElement('button');b.className='ov-t';b.setAttribute('aria-label','Collapse');b.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>';b.onclick=e=>{e.stopPropagation();const on=c.classList.toggle('ov-c');S.ovC=S.ovC||{};S.ovC[k]=on;};h.appendChild(b);});}
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
# the current direction: overview-first, module pages like B, three welcome notes
VARIANTS = {'C1': ('C', '1', 'C1 · Welcome header', 'proto-c1-welcome-header.html'),
            'C2': ('C', '2', 'C2 · Hero banner', 'proto-c2-hero-banner.html'),
            'C3': ('C', '3', 'C3 · Welcome dialog', 'proto-c3-welcome-dialog.html')}


def wrapper(label, ob, dash):
    b64 = lambda x: base64.b64encode(x.encode('utf-8')).decode('ascii')
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Setup {label}</title>
<style>
html,body{{margin:0;height:100%;background:#F2F1ED;font-family:Poppins,system-ui,sans-serif}}
iframe{{position:fixed;inset:0;width:100%;height:100%;border:0;background:#F2F1ED}}
iframe[hidden]{{display:none}}
.sw .tgl{{width:30px;height:30px;padding:0;margin-right:2px;border-radius:50%;background:#2a2a2a;color:#fff;font-size:15px;line-height:1;flex-shrink:0}}.sw.c{{padding:3px}}.sw.c>:not(.tgl){{display:none}}.sw.c .tgl{{margin:0;background:#111;border:1.5px solid #4FC2B4;color:#4FC2B4}}
.sw{{position:fixed;right:14px;bottom:14px;z-index:1000;display:flex;gap:2px;padding:3px;border-radius:999px;background:#111;box-shadow:0 4px 14px rgba(0,0,0,.25);align-items:center}}
.sw span{{color:#4FC2B4;font:600 11px/1 Poppins,system-ui,sans-serif;padding:0 10px 0 12px}}
.sw button{{border:0;background:none;color:#aaa;font:600 11px/1 Poppins,system-ui,sans-serif;padding:8px 12px;border-radius:999px;cursor:pointer}}
.sw button.on{{background:#fff;color:#111}}
@media(max-width:820px){{.sw{{bottom:auto;top:6px;right:6px;transform:scale(.82);transform-origin:top right}}}}
</style></head><body>
<iframe id="ob" title="Onboarding"></iframe>
<iframe id="db" title="Dashboard" hidden></iframe>
<div class="sw" id="sw" role="group" aria-label="Prototype screens"><button class="tgl" id="b-tg" aria-label="Hide or show the prototype bar" title="Hide the bar">\u203a</button><span>{label}</span><button id="b-ob" class="on">Onboarding</button><button id="b-db">Dashboard</button><button id="b-rd" title="Everything set up, with reservations and orders">Sample data</button><button id="b-rs" title="Clear everything and start again">Start over</button></div>
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
document.getElementById('b-tg').onclick=()=>{{const s=document.getElementById('sw'),c=s.classList.toggle('c');document.getElementById('b-tg').textContent=c?'\\u2039':'\\u203a';document.getElementById('b-tg').title=c?'Show the bar':'Hide the bar';}};
document.getElementById('b-ob').onclick=()=>show('ob');
document.getElementById('b-db').onclick=()=>show('db');
document.getElementById('b-rd').onclick=()=>{{show('db');db.contentWindow.postMessage({{tringg:'ready'}},'*');}};
document.getElementById('b-rs').onclick=()=>{{STATE=null;load();show('ob');}};
load();
</script></body></html>'''


if __name__ == '__main__':
    for key, (v, w, label, fn) in VARIANTS.items():
        page = wrapper(label, build_onboarding(v, w), build_dashboard(v, w))
        (here / fn).write_text(page, encoding='utf-8')
        print('wrote', fn, len(page) // 1024, 'KB')

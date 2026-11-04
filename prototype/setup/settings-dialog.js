/* E2: Settings open as a dialog with its own side menu. Each row on a detail page has a Change button that opens a second, smaller dialog. */
(function(){
const money=n=>'$'+(Math.round(n*100)%100?(+n).toFixed(2):Math.round(n));
const nOut=n=>n+' outlet'+(n===1?'':'s');
let host=null;
const hostEl=()=>{if(!host){host=document.createElement('div');host.id='sdlg';document.body.appendChild(host);}return host;};
const ids=()=>S.outlet==='all'?OUTLETS.map(o=>o.id):[S.outlet];

/* ───────── the settings dialog ───────── */
window.sdClose=()=>{S.sdlg=false;S.ch=null;render();};
window.sdOutlet=id=>{TS.beforeOutlet(id);S.outlet=id;S.ch=null;render();};
window.sdRender=()=>{const h=hostEl();
 if(!S.sdlg){h.innerHTML='';h.dataset.k='';return;}
 const old=h.querySelector('.sd .scroll'),k=S.set+'|'+S.outlet,top=old&&h.dataset.k===k?old.scrollTop:0;
 const sel=`<div class="sd-os"><label for="sd-o">Outlet</label><select id="sd-o" class="inp sm" onchange="sdOutlet(this.value)">${OUTLETS.length>1?`<option value="all" ${S.outlet==='all'?'selected':''}>All outlets</option>`:''}${OUTLETS.map(o=>`<option value="${o.id}" ${S.outlet===o.id?'selected':''}>${esc(o.name)}</option>`).join('')}</select></div>`;
 const inner=vSettings().replace('<nav class="snav" aria-label="Settings">','<nav class="snav" aria-label="Settings"><div class="sd-t">Settings</div>'+sel);
 h.innerHTML=`<div class="sd-bk" onmousedown="if(event.target===this)sdClose()"><div class="sd" role="dialog" aria-modal="true" aria-label="Settings"><button class="sd-x" aria-label="Close settings" onclick="sdClose()">✕</button>${inner}</div></div>${chHtml()}`;
 h.dataset.k=k;const nw=h.querySelector('.sd .scroll');if(nw)nw.scrollTop=top;};
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(S.ch){S.ch=null;render();}else if(S.sdlg)sdClose();});

/* ───────── the second dialog: change one thing ───────── */
const TITLES={pick:'Pickup',del:'Delivery',aa:'Accepting orders',pre:'Pre-orders',pay:'Payments',tax:'Taxes'};
const scoped=k=>!['pay','tax'].includes(k);
window.chOpen=k=>{
 if(k==='area'){S.zoneOutlet=S.outlet;S.sdlg=false;render();openZed();return;}
 S.ch={k,scope:'all',pick:[],vals:{}};render();};
window.chClose=()=>{S.ch=null;render();};
const keep=()=>{if(!S.ch)return;document.querySelectorAll('#sdlg [id^=chf-]').forEach(e=>{S.ch.vals[e.id.slice(4)]=e.value;});};
window.chScope=v=>{keep();S.ch.scope=v;render();};
window.chPick=id=>{keep();const p=S.ch.pick;S.ch.pick=p.includes(id)?p.filter(x=>x!==id):p.concat(id);render();};
const targets=()=>S.outlet!=='all'?[S.outlet]:(S.ch.scope==='all'?OUTLETS.map(o=>o.id):S.ch.pick);
function chBody(k){const o=targets()[0]||OUTLETS[0].id,v=DB.svc[o]||{},r=v.rad||{mi:3,fee:3,min:15},V=S.ch.vals;
 const g=(id,d)=>V[id]!==undefined?V[id]:d;
 const f=(l,c,n)=>`<div class="ch-f"><div><b>${l}</b>${n?`<span>${n}</span>`:''}</div>${c}</div>`;
 const num=(id,d,u,st)=>`<div class="inp-suf" style="width:132px"><input id="chf-${id}" class="inp sm" type="number" min="0" step="${st||1}" value="${g(id,d)??''}"><span>${u}</span></div>`;
 const sel=(id,d,opts)=>`<select id="chf-${id}" class="inp sm" style="width:190px">${opts.map(a=>`<option value="${a[0]}" ${String(a[0])===String(g(id,d))?'selected':''}>${a[1]}</option>`).join('')}</select>`;
 const onoff=(id,d)=>sel(id,d,[['1','On'],['0','Off']]);
 if(k==='pick')return f('Pickup',onoff('on',v.pick?'1':'0'),'Callers can order for pickup.')+f('Ready in',num('prep',v.prep,'min',5),'Callers hear this time once an order is accepted.');
 if(k==='del')return f('Delivery',onoff('on',v.del?'1':'0'),'Callers can order for delivery.')+f('Distance',num('mi',r.mi,'mi',.5))+f('Delivery fee',num('fee',r.fee,'$',.5))+f('Minimum order',num('min',r.min,'$'));
 if(k==='aa')return f('Auto-accept',onoff('on',DB.autoAccept[o]?'1':'0'),'On: new orders go straight to the kitchen. Off: someone accepts each one in Orders.');
 if(k==='pre'){const p=DB.pre[o]||(DB.pre[o]={on:false,lead:60,days:3,pk:true,dl:true});return f('Pre-orders',onoff('on',p.on?'1':'0'),'Callers can order for later today.')+f('Shortest lead time',sel('lead',p.lead,[[30,'30 min'],[60,'60 min'],[90,'90 min'],[120,'120 min']]));}
 if(k==='pay'){const pk=DB.payPick,m=pk.call&&pk.store?'both':pk.call?'online':'store';return f('How callers pay',sel('pay',m,[['online','Card, by text link'],['store','Cash, at pickup or delivery'],['both','Both']]),'The same for every outlet.')+f('Cash limit',num('cap',DB.cod.cap,'$'),'Cash is only allowed up to this order total.');}
 if(k==='tax')return DB.taxes.map(t=>`<div class="ch-f"><div><b>${esc(t.n)}</b><span>${t.vt==='%'?t.v+'%':money(t.v)} · ${t.type} · ${t.outs.length>=OUTLETS_ALL.length?'All outlets':nOut(t.outs.length)}</span></div><button class="btn btn-line btn-sm" onclick="S.ch=null;openTax('${t.id}')">Edit</button></div>`).join('')+`<div class="ch-f"><div></div><button class="btn btn-line btn-sm" onclick="S.ch=null;openTax()">${I.plus} Add tax</button></div>`;
 return '';}
function chScope(k){if(!scoped(k))return `<div class="ch-sc"><span>Applies to every outlet.</span></div>`;
 if(S.outlet!=='all')return `<div class="ch-sc"><span>Applies to <b>${esc(ON(S.outlet).short)}</b> only.</span></div>`;
 const c=S.ch;return `<div class="ch-sc"><b>Apply to</b><label class="ch-r"><input type="radio" name="chs" ${c.scope==='all'?'checked':''} onchange="chScope('all')"> All ${OUTLETS.length} outlets</label><label class="ch-r"><input type="radio" name="chs" ${c.scope==='pick'?'checked':''} onchange="chScope('pick')"> Only some outlets</label>${c.scope==='pick'?`<div class="ch-chips">${OUTLETS.map(o=>`<button class="ch-chip ${c.pick.includes(o.id)?'on':''}" onclick="chPick('${o.id}')">${esc(o.short)}</button>`).join('')}</div>`:''}</div>`;}
function chHtml(){if(!S.ch)return '';const k=S.ch.k,hasSave=k!=='tax';
 return `<div class="ch-bk" onmousedown="if(event.target===this)chClose()"><div class="ch" role="dialog" aria-modal="true" aria-label="${TITLES[k]}"><div class="ch-h"><h3>${TITLES[k]}</h3><button class="sd-x2" aria-label="Close" onclick="chClose()">✕</button></div><div class="ch-b">${chBody(k)}</div>${hasSave?chScope(k):''}<div class="ch-ft"><button class="btn btn-line" onclick="chClose()">${hasSave?'Cancel':'Close'}</button>${hasSave?'<button class="btn btn-dark" onclick="chSave()">Save</button>':''}</div></div></div>`;}
window.chSave=()=>{const c=S.ch,t=targets();if(!t.length){toast('Choose at least one outlet');return;}
 const g=id=>{const e=document.getElementById('chf-'+id);return e?e.value:null;};
 if(c.k==='pick')t.forEach(i=>{const s=DB.svc[i];if(!s||s.set!==true)return;s.pick=g('on')==='1';if(g('prep'))s.prep=Math.max(5,+g('prep'));});
 if(c.k==='del')t.forEach(i=>{const s=DB.svc[i];if(!s||s.set!==true)return;s.del=g('on')==='1';if(s.del){s.rad=s.rad||{};s.rad.mi=+g('mi')||3;s.rad.fee=+g('fee')||0;s.rad.min=+g('min')||0;if(!DB.deliveryMode[i])DB.deliveryMode[i]='radius';}});
 if(c.k==='aa')t.forEach(i=>aaSet(i,g('on')==='1'));
 if(c.k==='pre')t.forEach(i=>{const p=DB.pre[i]||(DB.pre[i]={on:false,lead:60,days:3,pk:true,dl:true});p.on=g('on')==='1';p.lead=+g('lead')||60;});
 if(c.k==='pay'){const m=g('pay');DB.payPick={call:m!=='store',store:m!=='online'};DB.cod.cap=+g('cap')||0;}
 S.ch=null;render();toast('Saved'+(scoped(c.k)?' for '+(t.length===1?ON(t[0]).short:nOut(t.length)):''));};

/* ───────── the Ordering page: one summary row per setting ───────── */
const top=(m,fmt,max)=>{const a=[...m.entries()].sort((x,y)=>y[1]-x[1]);if(a.length===1)return fmt(a[0][0])+' at all outlets';const s=a.slice(0,max||2).map(e=>fmt(e[0])+' at '+nOut(e[1])).join(' · ');return s+(a.length>(max||2)?' · +'+(a.length-(max||2))+' more':'');};
const tally=(R,fn)=>{const m=new Map();R.forEach(x=>{const k=fn(x);m.set(k,(m.get(k)||0)+1);});return m;};
window.ordRows=()=>{const one=S.outlet!=='all',R=ids().map(id=>({id,v:DB.svc[id]||{}})).filter(x=>x.v.set===true);
 if(one&&!R.length)return ordPage();
 const row=(t,val,k,btn,act)=>`<div class="sr"><div class="sr-t"><b>${t}</b><span>${val}</span></div><button class="btn btn-soft sr-b" onclick="${act||`chOpen('${k}')`}">${btn||'Change'}</button></div>`;
 const v0=R[0]?R[0].v:{};
 const pick=one?(v0.pick?'On · ready in '+v0.prep+' min':'Off'):top(tally(R,x=>x.v.pick?String(x.v.prep):'off'),k=>k==='off'?'Off':'Ready in '+k+' min');
 const rd=x=>x.v.rad||{};
 const del=one?(v0.del?'On · '+rd(R[0]).mi+' mi · '+money(rd(R[0]).fee)+' fee · '+money(rd(R[0]).min)+' minimum':'Off'):top(tally(R,x=>x.v.del?rd(x).mi+'|'+rd(x).fee+'|'+rd(x).min:'off'),k=>{if(k==='off')return 'No delivery';const a=k.split('|');return a[0]+' mi · $'+a[1]+' · $'+a[2]+' min';});
 const tx=DB.taxes.filter(t=>one?t.outs.includes(S.outlet):true).map(t=>esc(t.n)+' '+(t.vt==='%'?t.v+'%':money(t.v))+(!one&&t.outs.length<OUTLETS_ALL.length?' ('+nOut(t.outs.length)+')':'')).join(' · ')||'None';
 const pk=DB.payPick,pay=(pk.call&&pk.store?'Card or cash':pk.call?'Card, by text link':'Cash')+(DB.stripe==='active'?' · Stripe connected':'');
 const on=ids().filter(i=>DB.autoAccept[i]),off=ids().filter(i=>!DB.autoAccept[i]);
 const aa=one?(on.length?'On · orders go straight to the kitchen':'Off · you accept each order'):`On at ${on.length} of ${ids().length} outlets`+(off.length&&off.length<4?' · Off at '+off.map(i=>esc(ON(i).short)).join(', '):off.length?' · Off at '+off.length:'');
 const pre=one?((DB.pre[S.outlet]||{}).on?'On':'Off'):'On at '+ids().filter(i=>(DB.pre[i]||{}).on).length+' of '+ids().length+' outlets';
 return sH('Ordering','',one?'':'all')+`<div class="scard sr-c">
  ${row('Menu',DB.menuState==='live'?'Published · shared by every outlet':'Not published','','Open menu',"sdClose();go('menu')")}
  ${row('Pickup',pick,'pick')}
  ${row('Delivery',del,'del')}
  ${one&&v0.del?row('Delivery area',DB.deliveryMode[S.outlet]==='zones'?(DB.zones[S.outlet]||[]).length+' zones':'Radius '+(rd(R[0]).mi||'—')+' mi','area','Edit area'):''}
  ${row('Taxes and fees',tx,'tax')}
  ${row('Payments',pay,'pay')}
  ${row('Accepting orders',aa,'aa')}
  ${row('Pre-orders',pre,'pre')}</div>`;};

const css=`
#sdlg{position:relative;z-index:100}
.sd-bk,.ch-bk{position:fixed;inset:0;display:grid;place-items:center;padding:24px;animation:sdf .18s ease both}
.sd-bk{background:rgba(17,17,17,.38);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:100}
.ch-bk{background:rgba(17,17,17,.3);z-index:140}
@keyframes sdf{from{opacity:0}to{opacity:1}}
.sd{position:relative;display:flex;flex-direction:column;width:min(1120px,100%);height:min(760px,100%);background:var(--canvas);border-radius:24px;overflow:hidden;box-shadow:var(--e3);animation:sdu .26s var(--ease) both}
@keyframes sdu{from{transform:translateY(14px) scale(.985);opacity:0}to{transform:none;opacity:1}}
.sd .sset{height:100%}.sd .snav{background:var(--panel)}.sd .scope-note{display:none}.sd .scroll{height:100%;overflow-y:auto}.sd .spage{padding:30px 40px 40px}
.sd-t{font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-50);padding:0 12px 6px}
.sd-os{padding:0 12px 14px;display:flex;flex-direction:column;gap:6px}.sd-os label{font-size:12.5px;color:var(--ink-50)}.sd-os select{max-width:none;width:100%}
.sd-x,.sd-x2{border:0;background:none;width:36px;height:36px;border-radius:11px;cursor:pointer;color:var(--ink-50);font-size:16px}.sd-x:hover,.sd-x2:hover{background:var(--sunken);color:var(--ink)}
.sd-x{position:absolute;right:18px;top:16px;z-index:3}
.ch{width:min(520px,100%);max-height:calc(100vh - 48px);overflow:auto;background:var(--panel);border-radius:22px;padding:24px 26px;box-shadow:var(--e3);display:flex;flex-direction:column;gap:6px;animation:sdu .22s var(--ease) both}
.ch-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.ch-h h3{font-size:20px;font-weight:600;margin:0;letter-spacing:-.4px}
.ch-f{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;border-top:1px solid var(--border)}.ch-b>.ch-f:first-child{border-top:0}.ch-f b{display:block;font-weight:600;font-size:14.5px}.ch-f span{display:block;font-size:13px;color:var(--ink-50);margin-top:2px}.ch-f .inp-suf span{margin:0}
.ch-sc{border-top:1px solid var(--border);padding-top:14px;margin-top:6px;display:flex;flex-direction:column;gap:10px;font-size:14px}.ch-r{display:flex;gap:10px;align-items:center;cursor:pointer}.ch-r input{accent-color:#1F6E62;width:17px;height:17px}
.ch-chips{display:flex;flex-wrap:wrap;gap:8px}.ch-chip{font:inherit;font-size:13px;border:1.5px solid var(--border);background:var(--panel);border-radius:999px;padding:4px 13px;cursor:pointer}.ch-chip.on{background:var(--ink);border-color:var(--ink);color:#fff}
.ch-ft{display:flex;justify-content:flex-end;gap:10px;margin-top:14px}
.sr-c{gap:0;padding:6px 28px}.sr{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 0;border-top:1px solid var(--border)}.sr:first-child{border-top:0}.sr-t{min-width:0}.sr-t b{display:block;font-weight:600;font-size:15px}.sr-t span{display:block;color:var(--ink-50);font-size:14px;margin-top:3px}.sr-b{flex-shrink:0}
@media(max-width:820px){.sd .sset{grid-template-columns:1fr}.sd .snav{display:none}.sr{flex-wrap:wrap}}
`;
const el=document.createElement('style');el.textContent=css;document.head.appendChild(el);
})();

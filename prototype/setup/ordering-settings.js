/* Settings › Ordering: two concepts for presenting many outlets.
   window.TS_ORD = '1'  Same for all, differences on top
   window.TS_ORD = '2'  Outlet list, edit in a side panel (or tabs for one outlet)  */
(function(){
const money=n=>'$'+(Math.round(n*100)%100?(+n).toFixed(2):Math.round(n));
const st=()=>S.of=S.of||{open:{},q:'',f:'all',sel:[],dr:null,tab:'pd',edit:null,rtab:'pd'};
const rows=()=>OUTLETS.map(o=>{const v=DB.svc[o.id]||{};return{id:o.id,name:o.short,full:o.name,region:o.region,set:v.set===true,pick:!!v.pick,del:!!v.del,prep:v.prep,rad:v.rad,mode:DB.deliveryMode[o.id],pause:DB.paused&&DB.paused[o.id],pos:o.pos,taxes:DB.taxes.filter(t=>t.outs.includes(o.id))};});
const noArea=x=>x.set&&x.del&&!x.mode;
const attn=x=>!x.set||noArea(x);
const pickTxt=x=>!x.set?'Not set up':x.pick?'Ready in '+x.prep+' min':'Off';
const delTxt=x=>!x.set?'Not set up':!x.del?'No delivery':!x.mode?'No delivery area':(x.rad?x.rad.mi+' mi · '+money(x.rad.fee)+' · '+money(x.rad.min)+' min':'On');
const taxTxt=x=>x.taxes.length?x.taxes.filter(t=>t.type==='Tax').map(t=>t.n).join(', ')||'Fees only':'None';
function group(list,fn){const m=new Map();list.forEach(x=>{const k=fn(x);if(!m.has(k))m.set(k,{k,items:[]});m.get(k).items.push(x);});return [...m.values()].sort((a,b)=>b.items.length-a.items.length);}
const mostCommon=(list,fn)=>{const g=group(list,fn);return g.length?fn(g[0].items[0]):null;};
const chev='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
const tick='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const nOut=n=>n+' '+(n===1?'outlet':'outlets');

/* ───────── shared actions ───────── */
window.ofOpen=k=>{const o=st().open;o[k]=!o[k];render();};
window.ofEdit=k=>{const s=st();s.edit=s.edit===k?null:k;render();};
window.ofSet=(id,f,v)=>{const s=DB.svc[id];if(!s)return;
 if(f==='pick')s.pick=v==='1';else if(f==='del'){s.del=v==='1';if(s.del&&!s.rad)s.rad={mi:3,fee:3,min:15};}
 else if(f==='prep')s.prep=Math.max(5,+v||20);else if(f==='mi'||f==='fee'||f==='min'){s.rad=s.rad||{mi:3,fee:3,min:15};s.rad[f]=Math.max(0,+v||0);}
 render();};
window.ofArea=id=>{DB.deliveryMode[id]='radius';toast('Delivery area added');render();};
window.ofPause=(id,v)=>{DB.paused=DB.paused||{};if(v)DB.paused[id]=v;else delete DB.paused[id];render();};
window.ofTax=(tid,id,on)=>{const t=DB.taxes.find(x=>x.id===tid);if(!t)return;t.outs=t.outs.filter(x=>x!==id);if(on)t.outs.push(id);render();};
window.ofApplyAll=ids=>{const g=k=>{const e=document.getElementById('of-'+k);return e?e.value:'';};
 ids.forEach(id=>{const s=DB.svc[id];if(!s||s.set!==true)return;if(g('prep'))s.prep=Math.max(5,+g('prep')||s.prep);
  if(g('del')){s.del=g('del')==='1';if(s.del&&!s.rad)s.rad={mi:3,fee:3,min:15};}
  if(s.del){s.rad=s.rad||{mi:3,fee:3,min:15};if(g('mi'))s.rad.mi=+g('mi');if(g('fee')!=='')s.rad.fee=+g('fee');if(g('min')!=='')s.rad.min=+g('min');}});
 const s=st();s.edit=null;s.sel=[];toast('Saved for '+nOut(ids.length));render();};
window.ofGo=id=>{pickOutlet(id);};

/* ───────── concept 1: same for all, differences on top ───────── */
function fold(id,label,sub,list,tone,first){const s=st(),op=s.open[id];
 return `<div class="of-cl ${tone||''}"><button class="of-cl-h" onclick="ofOpen('${id}')" aria-expanded="${!!op}"><div><b>${label}</b>${sub?`<span>${sub}</span>`:''}</div>${first?'<em class="of-tag">Most outlets</em>':tone==='warn'?'<em class="of-tag w">Needs attention</em>':'<em class="of-tag d">Different</em>'}<span class="of-cn">${nOut(list.length)}</span><i class="${op?'up':''}">${chev}</i></button>${op?`<div class="of-chips">${list.map(x=>`<button class="of-chip" onclick="ofGo('${x.id}')">${esc(x.name)}</button>`).join('')}</div>`:''}</div>`;}
function clusters(id,list,fn,label,sub){const g=group(list,fn);return g.map((c,i)=>{const x=c.items[0];const warn=id==='da'&&noArea(x);return fold(id+i,label(x),sub?sub(x):'',c.items,warn?'warn':'',i===0&&!warn);}).join('');}
function f1Card(id,title,desc,body,btn){const s=st();return `<div class="scard of-c"><div class="scard-h"><div><div class="h2">${title}</div><div class="fh">${desc}</div></div>${btn?`<div class="r"><button class="btn btn-line btn-sm" onclick="${btn[1]}">${btn[0]}</button></div>`:''}</div>${body}</div>`;}
function allForm(ids){const base=rows().find(x=>x.set)||{};return `<div class="of-form"><div class="of-fg"><label>Pickup ready in<input id="of-prep" class="inp sm" type="number" min="5" step="5" placeholder="${base.prep||20}"/> <span>min</span></label>
  <label>Delivery<select id="of-del" class="inp sm"><option value="">Keep as is</option><option value="1">On</option><option value="0">Off</option></select></label>
  <label>Radius<input id="of-mi" class="inp sm" type="number" min="1" step="0.5" placeholder="3"/> <span>mi</span></label>
  <label>Fee $<input id="of-fee" class="inp sm" type="number" min="0" step="0.5" placeholder="3"/></label>
  <label>Minimum $<input id="of-min" class="inp sm" type="number" min="0" placeholder="15"/></label></div>
  <div class="of-fa"><button class="btn btn-dark btn-sm" onclick="ofApplyAll(${JSON.stringify(ids).replace(/"/g,"'")})">Apply to ${nOut(ids.length)}</button><button class="btn btn-line btn-sm" onclick="ofEdit(null)">Cancel</button><span class="small muted">Leave a field empty to keep each outlet’s own value.</span></div></div>`;}
function f1All(){const R=rows(),on=R.filter(x=>x.set),ids=on.map(x=>x.id),paused=on.filter(x=>x.pause).length,un=R.filter(x=>!x.set).length,bad=on.filter(noArea).length;
 const s=st();
 let h=sH('Ordering','Set it once for every outlet. Only the outlets that are different are listed.','all');
 h+=`<div class="of-sum"><div><b>${on.length-paused}</b><span>taking orders</span></div><div><b>${paused}</b><span>paused</span></div><div class="${un?'w':''}"><b>${un}</b><span>not set up</span></div><div class="${bad?'w':''}"><b>${bad}</b><span>need a delivery area</span></div></div>`;
 h+=f1Card('pk','Pickup','How long an order takes to be ready.',s.edit==='pd'?'':clusters('pk',on,x=>x.pick?String(x.prep):'off',x=>x.pick?'Ready in '+x.prep+' min':'Pickup off'),null);
 h=h.replace(/(<div class="scard of-c"><div class="scard-h"><div><div class="h2">Pickup<\/div>)/,'$1');
 h+=f1Card('dl','Delivery','Distance, fee and minimum order.',s.edit==='pd'?allForm(ids):clusters('dl',on,x=>x.del?(x.mode?x.rad.mi+'/'+x.rad.fee+'/'+x.rad.min:'noarea'):'off',x=>x.del?(x.mode?x.rad.mi+' mi · '+money(x.rad.fee)+' fee · '+money(x.rad.min)+' minimum':'Delivery on, no area drawn'):'No delivery'),['Change for all outlets',"ofEdit('pd')"]);
 h+=f1Card('tx','Taxes and fees','What is added to an order total.',clusters('tx',on,x=>taxTxt(x)+'|'+x.taxes.length,x=>taxTxt(x),x=>x.taxes.map(t=>t.n+' '+(t.vt==='%'?t.v+'%':money(t.v))).join(' · ')),['Edit taxes',"toast('Opens the tax editor')"]);
 h+=f1Card('py','Payments','The same for every outlet.',`<div class="of-lines"><div><b>Card, by text link</b><span>${DB.payPick.call?'On':'Off'}</span></div><div><b>Cash, at pickup or delivery</b><span>${DB.payPick.store?'On':'Off'}</span></div><div><b>Cash limits</b><span>${DB.cod.capOn?'First order up to '+money(DB.cod.cap):'None'}${DB.cod.repeatOn?' · after '+DB.cod.repeatN+' paid order':''}</span></div></div>`,['Edit payments',"toast('Opens the payments editor')"]);
 h+=f1Card('mn','Menu and POS','The menu is shared. Each outlet can have its own POS.',`<div class="of-lines"><div><b>Menu</b><span>${DB.menuState==='live'?'Published · shared by all outlets':'Not published'}</span></div></div>`+clusters('ps',on,x=>x.pos||'none',x=>x.pos?x.pos+' connected':'No POS connected'),['Open menu',"go('menu')"]);
 return h;}
function f1One(){const id=S.outlet,R=rows(),on=R.filter(x=>x.set),x=R.find(r=>r.id===id);if(!x)return '';
 const d={prep:mostCommon(on,r=>r.pick?String(r.prep):'off'),mi:mostCommon(on.filter(r=>r.del),r=>String(r.rad&&r.rad.mi)),fee:mostCommon(on.filter(r=>r.del),r=>String(r.rad&&r.rad.fee)),min:mostCommon(on.filter(r=>r.del),r=>String(r.rad&&r.rad.min)),del:mostCommon(on,r=>r.del?'1':'0')};
 const tag=(same,f,def)=>same?'<span class="of-same">'+tick+' Same as all outlets</span>':`<span class="of-cus">Different here</span><button class="lnk of-reset" onclick="ofSet('${id}','${f}','${def}')">Use the usual: ${({prep:def+' min',del:def==='1'?'On':'Off',mi:def+' mi',fee:'$'+def,min:'$'+def})[f]}</button>`;
 let h=sH('Ordering','Settings for this outlet. Anything marked “Same as all outlets” follows the default.','one');
 if(!x.set)return h+`<div class="scard"><div class="empty" style="padding:30px 20px"><div class="empty-i">${I.scooter}</div><div class="empty-t">${esc(x.name)} isn’t taking phone orders yet</div><div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;justify-content:center"><button class="btn btn-dark" onclick="DB.svc['${id}'].set=true;DB.svc['${id}'].pick=true;DB.svc['${id}'].prep=${d.prep&&d.prep!=='off'?d.prep:20};render()">Use the usual settings</button><button class="btn btn-line" onclick="toast('Starts the setup steps')">Set up step by step</button></div></div></div>`;
 const row=(label,ctl,t)=>`<div class="of-r"><div class="of-rl">${label}</div><div class="of-rc">${ctl}</div><div class="of-rt">${t}</div></div>`;
 const sel=(f,v,o)=>`<select class="inp sm" style="width:120px" onchange="ofSet('${id}','${f}',this.value)">${o.map(a=>`<option value="${a[0]}" ${a[0]===v?'selected':''}>${a[1]}</option>`).join('')}</select>`;
 const num=(f,v,u)=>`<input class="inp sm" type="number" style="width:96px" value="${v}" onchange="ofSet('${id}','${f}',this.value)"/> <span class="small muted">${u}</span>`;
 const pz=x.pause;
 h+=`<div class="scard of-c"><div class="scard-h"><div><div class="h2">${esc(x.full)}</div><div class="fh">${x.region}</div></div><div class="r">${pz?pill('p-amber','Paused'):pill('p-green','Taking orders')}</div></div>
  <div class="of-r"><div class="of-rl">Pause ordering</div><div class="of-rc">${pz?`<span class="small muted">${esc(pz)}</span> <button class="btn btn-line btn-sm" onclick="ofPause('${id}','')">Resume</button>`:`<select class="inp sm" style="width:190px" onchange="ofPause('${id}',this.value)"><option value="">Pause for…</option><option>Until 8:45 PM.</option><option>Until 9:30 PM.</option><option>Until you resume it.</option></select>`}</div><div class="of-rt"></div></div></div>`;
 h+=`<div class="scard of-c"><div class="scard-h"><div><div class="h2">Pickup and delivery</div></div></div>
  ${row('Pickup',sel('pick',x.pick?'1':'0',[['1','On'],['0','Off']]),tag((x.pick?String(x.prep):'off')===d.prep,'prep',d.prep))}
  ${x.pick?row('Ready in',num('prep',x.prep,'min'),tag(String(x.prep)===d.prep,'prep',d.prep)):''}
  ${row('Delivery',sel('del',x.del?'1':'0',[['1','On'],['0','Off']]),tag((x.del?'1':'0')===d.del,'del',d.del))}
  ${x.del?row('Distance',num('mi',x.rad.mi,'mi'),tag(String(x.rad.mi)===d.mi,'mi',d.mi))+row('Delivery fee',num('fee',x.rad.fee,'$'),tag(String(x.rad.fee)===d.fee,'fee',d.fee))+row('Minimum order',num('min',x.rad.min,'$'),tag(String(x.rad.min)===d.min,'min',d.min)):''}
  ${x.del&&!x.mode?`<div class="banner b-amber" style="margin-top:6px"><div><b>No delivery area yet.</b> Delivery can’t start until this outlet has one.</div><button class="btn btn-dark btn-sm" onclick="ofArea('${id}')">Add delivery area</button></div>`:''}</div>`;
 h+=`<div class="scard of-c"><div class="scard-h"><div><div class="h2">Taxes and fees</div><div class="fh">Choose what applies at this outlet.</div></div></div>${DB.taxes.map(t=>`<label class="of-r of-ck"><input type="checkbox" ${t.outs.includes(id)?'checked':''} onchange="ofTax('${t.id}','${id}',this.checked)"/><div class="of-rl">${esc(t.n)}</div><div class="of-rc small muted">${t.vt==='%'?t.v+'%':money(t.v)} · ${t.type==='Tax'?'Tax':'Fee'}</div><div class="of-rt"></div></label>`).join('')}</div>`;
 h+=`<div class="scard of-c"><div class="scard-h"><div><div class="h2">Payments, menu and POS</div></div></div><div class="of-lines"><div><b>Payments</b><span class="of-same">${tick} Same for every outlet</span></div><div><b>Menu</b><span class="of-same">${tick} Shared by every outlet</span></div><div><b>POS</b><span>${x.pos?x.pos+' connected':'Not connected'}</span></div></div></div>`;
 return h;}

/* ───────── concept 2: outlet list + side panel ───────── */
function pillFor(x){return !x.set?pill('p-grey','Not set up'):x.pause?pill('p-amber','Paused'):noArea(x)?pill('p-amber','Needs area'):pill('p-green','Taking orders');}
function f2Form(x,tab){const id=x.id;
 const sel=(f,v,o)=>`<select class="inp sm" style="width:120px" onchange="ofSet('${id}','${f}',this.value)">${o.map(a=>`<option value="${a[0]}" ${a[0]===v?'selected':''}>${a[1]}</option>`).join('')}</select>`;
 const num=(f,v,u)=>`<input class="inp sm" type="number" style="width:96px" value="${v}" onchange="ofSet('${id}','${f}',this.value)"/> <span class="small muted">${u}</span>`;
 const r=(l,c)=>`<div class="of-r"><div class="of-rl">${l}</div><div class="of-rc">${c}</div></div>`;
 if(!x.set)return `<div class="empty" style="padding:30px 10px"><div class="empty-t">Not taking phone orders yet</div><div style="margin-top:12px"><button class="btn btn-dark btn-sm" onclick="DB.svc['${id}'].set=true;DB.svc['${id}'].pick=true;DB.svc['${id}'].prep=20;render()">Use the usual settings</button></div></div>`;
 if(tab==='pd')return r('Pickup',sel('pick',x.pick?'1':'0',[['1','On'],['0','Off']]))+(x.pick?r('Ready in',num('prep',x.prep,'min')):'')+r('Delivery',sel('del',x.del?'1':'0',[['1','On'],['0','Off']]))+(x.del?r('Distance',num('mi',x.rad.mi,'mi'))+r('Fee',num('fee',x.rad.fee,'$'))+r('Minimum',num('min',x.rad.min,'$')):'')+(x.del&&!x.mode?`<div class="banner b-amber" style="margin-top:8px"><div><b>No delivery area yet.</b></div><button class="btn btn-dark btn-sm" onclick="ofArea('${id}')">Add area</button></div>`:'')+r('Pause',x.pause?`<span class="small muted">${esc(x.pause)}</span> <button class="btn btn-line btn-sm" onclick="ofPause('${id}','')">Resume</button>`:`<select class="inp sm" style="width:190px" onchange="ofPause('${id}',this.value)"><option value="">Pause for…</option><option>Until 8:45 PM.</option><option>Until 9:30 PM.</option><option>Until you resume it.</option></select>`);
 if(tab==='tx')return DB.taxes.map(t=>`<label class="of-r of-ck"><input type="checkbox" ${t.outs.includes(id)?'checked':''} onchange="ofTax('${t.id}','${id}',this.checked)"/><div class="of-rl">${esc(t.n)}</div><div class="of-rc small muted">${t.vt==='%'?t.v+'%':money(t.v)}</div></label>`).join('');
 return `<div class="of-lines"><div><b>Card, by text link</b><span>${DB.payPick.call?'On':'Off'}</span></div><div><b>Cash</b><span>${DB.payPick.store?'On':'Off'}</span></div><div><b>Menu</b><span>Shared</span></div><div><b>POS</b><span>${x.pos?x.pos+' connected':'Not connected'}</span></div></div><p class="small muted" style="margin:12px 0 0">Payments and menu are the same for every outlet.</p>`;}
const TABS=[['pd','Pickup & delivery'],['tx','Taxes'],['py','Payments & POS']];
const tabs=(cur,fn)=>`<div class="of-tabs" role="tablist">${TABS.map(t=>`<button role="tab" aria-selected="${cur===t[0]}" class="${cur===t[0]?'on':''}" onclick="${fn}('${t[0]}')">${t[1]}</button>`).join('')}</div>`;
window.ofTab=t=>{st().tab=t;render();};
window.ofDr=id=>{st().dr=id;render();};
window.ofF=f=>{st().f=f;render();};
window.ofQ=v=>{st().q=v;render();const e=document.getElementById('of-q');if(e){e.focus();e.setSelectionRange(v.length,v.length);}};
window.ofSel=id=>{const s=st();s.sel=s.sel.includes(id)?s.sel.filter(x=>x!==id):s.sel.concat(id);render();};
window.ofSelAll=ids=>{const s=st();s.sel=s.sel.length===ids.length?[]:ids.slice();render();};
function f2All(){const s=st(),R=rows(),on=R.filter(x=>x.set);
 const bad=R.filter(attn).length;
 const flt={all:()=>true,att:attn,pickonly:x=>x.set&&!x.del,paused:x=>!!x.pause,del:x=>x.set&&x.del};
 const list=R.filter(x=>flt[s.f](x)&&(!s.q||(x.full+' '+x.region).toLowerCase().includes(s.q.toLowerCase())));
 const ids=list.map(x=>x.id),allSel=ids.length&&ids.every(i=>s.sel.includes(i));
 const chip=(k,l,n)=>`<button class="of-fc ${s.f===k?'on':''}" onclick="ofF('${k}')">${l}${n!=null?` <b>${n}</b>`:''}</button>`;
 let h=sH('Ordering','See every outlet at a glance. Click an outlet to change it, or tick a few to change them together.','all');
 h+=`<div class="scard of-c" style="padding:20px 22px"><div class="of-bar"><div class="of-s"><input id="of-q" class="inp" style="max-width:260px" placeholder="Search outlets" value="${esc(s.q)}" oninput="ofQ(this.value)" aria-label="Search outlets"/></div>
  <div class="of-fcs">${chip('all','All',R.length)}${chip('att','Needs attention',bad)}${chip('del','Delivery',on.filter(x=>x.del).length)}${chip('pickonly','Pickup only',on.filter(x=>!x.del).length)}${chip('paused','Paused',on.filter(x=>x.pause).length)}</div></div>
  <div class="tblw"><table class="tbl of-t"><thead><tr><th style="width:34px"><input type="checkbox" ${allSel?'checked':''} onchange="ofSelAll(${JSON.stringify(ids).replace(/"/g,"'")})" aria-label="Select all"/></th><th>Outlet</th><th>Orders</th><th>Pickup</th><th>Delivery</th><th>Tax</th><th>POS</th></tr></thead><tbody>
  ${list.map(x=>`<tr class="${s.dr===x.id?'sel':''}" onclick="ofDr('${x.id}')"><td onclick="event.stopPropagation()"><input type="checkbox" ${s.sel.includes(x.id)?'checked':''} onchange="ofSel('${x.id}')" aria-label="Select ${esc(x.name)}"/></td><td><b>${esc(x.name)}</b><div class="small muted">${x.region}</div></td><td>${pillFor(x)}</td><td class="num">${x.set&&x.pick?'Ready in '+x.prep+' min':x.set?'Off':'—'}</td><td class="${noArea(x)?'of-w':''}">${delTxt(x)}</td><td class="small">${x.set?esc(taxTxt(x)):'—'}</td><td class="small">${x.pos||'—'}</td></tr>`).join('')||'<tr><td colspan="7" class="muted" style="padding:28px;text-align:center">No outlets match</td></tr>'}</tbody></table></div></div>`;
 h+=`<div class="scard of-c" style="padding:18px 22px"><div class="of-lines" style="flex-direction:row;gap:28px;flex-wrap:wrap"><div><b>Payments</b><span>Same for every outlet · card ${DB.payPick.call?'on':'off'}, cash ${DB.payPick.store?'on':'off'}</span></div><div><b>Menu</b><span>${DB.menuState==='live'?'Published · shared':'Not published'}</span></div><div style="margin-left:auto"><button class="btn btn-line btn-sm" onclick="toast('Opens the payments editor')">Edit payments</button> <button class="btn btn-line btn-sm" onclick="go('menu')">Open menu</button></div></div></div>`;
 if(s.sel.length)h+=`<div class="of-bulk"><b>${s.sel.length} selected</b><button class="btn btn-dark btn-sm" onclick="ofEdit('bulk')">Change together</button><button class="btn btn-line btn-sm" onclick="toast('Pauses ${s.sel.length} outlets')">Pause</button><button class="btn btn-line btn-sm" onclick="st0()">Clear</button></div>`;
 if(s.edit==='bulk'&&s.sel.length)h+=`<div class="of-modal" onmousedown="if(event.target===this)ofEdit(null)"><div class="of-mc"><div class="h2">Change ${nOut(s.sel.length)} together</div><p class="fh" style="margin:4px 0 16px">${R.filter(x=>s.sel.includes(x.id)).map(x=>esc(x.name)).join(', ')}</p>${allForm(s.sel)}</div></div>`;
 if(s.dr){const x=R.find(r=>r.id===s.dr);if(x)h+=`<div class="of-dr-bk" onmousedown="if(event.target===this)ofDr(null)"><aside class="of-dr" role="dialog" aria-label="${esc(x.full)}"><div class="of-dr-h"><div><div class="h2">${esc(x.full)}</div><div class="small muted">${x.region}</div></div>${pillFor(x)}<button class="of-x" aria-label="Close" onclick="ofDr(null)">✕</button></div>${tabs(s.tab,'ofTab')}<div class="of-dr-b">${f2Form(x,s.tab)}</div></aside></div>`;}
 return h;}
window.st0=()=>{st().sel=[];render();};
function f2One(){const s=st(),x=rows().find(r=>r.id===S.outlet);if(!x)return '';
 return sH('Ordering','Settings for this outlet.','one')+`<div class="scard of-c"><div class="scard-h"><div><div class="h2">${esc(x.full)}</div><div class="fh">${x.region}</div></div><div class="r">${pillFor(x)}</div></div>${tabs(s.tab,'ofTab')}<div class="of-pane">${f2Form(x,s.tab)}</div></div>`;}

window.ordNew=()=>{const one=S.outlet!=='all';if(window.TS_ORD==='2')return one?f2One():f2All();return one?f1One():f1All();};

/* ───────── styles ───────── */
const css=`
.of-c .h2{font-size:19px}
.of-sum{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.of-sum>div{background:var(--panel);border-radius:16px;padding:16px 20px;box-shadow:var(--e1)}.of-sum b{display:block;font-size:28px;font-weight:600;letter-spacing:-.8px;line-height:1.1}.of-sum span{font-size:13px;color:var(--ink-50)}.of-sum .w b{color:var(--cream-700)}.of-sum .w{background:var(--cream-50)}
.of-cl{border:1.5px solid var(--border);border-radius:14px;overflow:hidden}.of-cl+.of-cl{margin-top:-6px}.of-cl.warn{border-color:#F0D58C;background:#FFF9E8}
.of-cl-h{display:flex;align-items:center;gap:12px;width:100%;padding:14px 18px;border:0;background:none;font:inherit;color:inherit;cursor:pointer;text-align:left}.of-cl-h:hover{background:var(--sunken)}
.of-cl-h>div{flex:1;min-width:0}.of-cl-h b{display:block;font-weight:600;font-size:15px}.of-cl-h div span{display:block;color:var(--ink-50);font-size:13px;margin-top:2px}
.of-tag{font-style:normal;font-size:11.5px;font-weight:600;letter-spacing:.04em;border-radius:999px;padding:2px 10px;background:var(--mint-50);color:var(--mint-700)}.of-tag.d{background:var(--chip);color:var(--ink-70)}.of-tag.w{background:var(--cream-50);color:var(--cream-700)}
.of-cn{font-size:13px;color:var(--ink-50);white-space:nowrap;min-width:78px;text-align:right}.of-cl-h i{display:grid;color:var(--ink-50);transition:transform .2s}.of-cl-h i.up{transform:rotate(180deg)}
.of-chips{display:flex;flex-wrap:wrap;gap:8px;padding:2px 18px 16px}.of-chip{font:inherit;font-size:13px;border:1.5px solid var(--border);background:var(--panel);border-radius:999px;padding:4px 13px;cursor:pointer}.of-chip:hover{border-color:var(--ink)}
.of-lines{display:flex;flex-direction:column;gap:12px}.of-lines>div{display:flex;gap:18px;align-items:baseline;justify-content:space-between}.of-lines b{font-weight:600;font-size:14.5px}.of-lines span{color:var(--ink-50);font-size:14px}
.of-form{border:1.5px dashed var(--border-s);border-radius:14px;padding:18px}.of-fg{display:flex;flex-wrap:wrap;gap:16px 22px}.of-fg label{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500}.of-fg label .inp{height:40px}.of-fg label span{display:none}
.of-fa{display:flex;gap:10px;align-items:center;margin-top:16px;flex-wrap:wrap}
.of-r{display:grid;grid-template-columns:170px 1fr auto;gap:14px;align-items:center;padding:12px 0;border-top:1px solid var(--border)}.of-r:first-of-type{border-top:0}.of-rl{font-weight:500}.of-rc{display:flex;align-items:center;gap:8px}.of-rt{display:flex;align-items:center;gap:12px;justify-content:flex-end;font-size:13px}
.of-ck{grid-template-columns:24px 1fr auto;cursor:pointer}.of-ck input{width:18px;height:18px;accent-color:#1F6E62}
.of-same{display:inline-flex;align-items:center;gap:6px;color:var(--mint-700);font-size:13px;font-weight:500}.of-cus{background:var(--cream-50);color:var(--cream-700);border-radius:999px;padding:2px 11px;font-size:12.5px;font-weight:600}.of-reset{font-size:13px}
.of-bar{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:6px}.of-fcs{display:flex;gap:8px;flex-wrap:wrap;margin-left:auto}
.of-fc{font:inherit;font-size:13px;font-weight:500;border:1.5px solid var(--border);background:var(--panel);border-radius:999px;padding:5px 14px;cursor:pointer;color:var(--ink)}.of-fc b{font-weight:600;color:var(--ink-50);margin-left:4px}.of-fc.on{background:var(--ink);border-color:var(--ink);color:#fff}.of-fc.on b{color:#cfcfcf}
.of-t tbody tr{cursor:pointer}.of-t tbody tr:hover td{background:var(--sunken)}.of-t tbody tr.sel td{background:var(--mint-50)}.of-t input[type=checkbox]{width:17px;height:17px;accent-color:#1F6E62}.of-w{color:var(--cream-700);font-weight:500}
.of-t td,.of-t th{white-space:nowrap}.of-t td.small{max-width:150px;overflow:hidden;text-overflow:ellipsis}.of-t td:first-child+td{white-space:normal;min-width:110px}
.of-bulk{position:sticky;bottom:16px;align-self:center;display:flex;gap:10px;align-items:center;background:var(--ink);color:#fff;border-radius:16px;padding:10px 14px 10px 20px;box-shadow:var(--e3);z-index:30}.of-bulk .btn-line{background:#fff}
.of-modal{position:fixed;inset:0;z-index:900;background:rgba(17,17,17,.46);display:grid;place-items:center;padding:24px}.of-mc{background:#fff;border-radius:22px;padding:26px 28px;width:min(720px,100%);box-shadow:var(--e3)}
.of-dr-bk{position:fixed;inset:0;z-index:880;background:rgba(17,17,17,.28);backdrop-filter:blur(5px);display:flex;justify-content:flex-end}
.of-dr{width:min(460px,100%);height:100%;background:#fff;padding:24px 26px;overflow:auto;box-shadow:-24px 0 60px -30px rgba(0,0,0,.4);animation:ofslide .28s var(--ease) both}@keyframes ofslide{from{transform:translateX(36px);opacity:0}to{transform:none;opacity:1}}
.of-dr-h{display:flex;align-items:flex-start;gap:12px;margin-bottom:18px}.of-dr-h>div:first-child{flex:1}.of-x{border:0;background:none;font-size:16px;cursor:pointer;color:var(--ink-50);width:34px;height:34px;border-radius:10px}.of-x:hover{background:var(--sunken)}
.of-tabs{display:flex;gap:6px;border-bottom:1.5px solid var(--border);margin-bottom:8px}.of-tabs button{font:inherit;font-weight:500;border:0;background:none;padding:10px 14px;cursor:pointer;color:var(--ink-50);border-bottom:2.5px solid transparent;margin-bottom:-1.5px}.of-tabs button.on{color:var(--ink);border-bottom-color:#4FC2B4}
.of-dr .of-r{grid-template-columns:120px 1fr}.of-pane .of-r{grid-template-columns:200px 1fr}
@media(max-width:820px){.of-sum{grid-template-columns:repeat(2,1fr)}.of-r{grid-template-columns:1fr}.of-rt{justify-content:flex-start}}
`;
const el=document.createElement('style');el.textContent=css;document.head.appendChild(el);
})();

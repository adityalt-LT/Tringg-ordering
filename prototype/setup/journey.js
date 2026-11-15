/* H3: the ordering setup journey.
   Two layers. For all outlets: menu, pickup and delivery, taxes, payments (created once, in the All outlets view).
   For one outlet: which menu items it serves, and its delivery area. An outlet is ready when both layers are done. */
window.JR=(function(){
const IMPORT_MS=18000;
const money=n=>'$'+(Math.round(n*100)%100?(+n).toFixed(2):Math.round(n));
const SRC=[['google','Google profile','The quickest. Uses the menu on your Google listing.',31,'Quickest'],['square','Square POS','Items and prices stay in sync. Orders go to Square.',42,'Connect'],['pos','Another POS','Toast, Clover and more.',42],['web','Your website','Paste the page with your menu.',26],['file','Photo or PDF','We read it and build the menu.',28],['agg','Delivery app','DoorDash, Uber Eats or Grubhub.',34]];
const CATS=[['Pizza',[['Margherita',14],['Pepperoni',16],['Diavola',17],['Quattro formaggi',17]]],['Pasta',[['Carbonara',15],['Pomodoro',13],['Lasagna',16]]],['Starters',[['Garlic knots',6],['Wings (8)',11],['Bruschetta',9]]],['Salads',[['Caesar',10],['Caprese',11]]],['Desserts',[['Tiramisu',8],['Cannoli',7]]],['Drinks',[['Lemonade',3],['Sparkling water',3]]]];
const DEF={pick:true,prep:20,del:false,mi:3,fee:3,min:15};
function jr(d){return d.jr||(d.jr={started:false,menu:{status:'none'},def:null,ovr:{},outl:{},taxes:null,pay:null});}
const J=()=>jr(TS.get().d);
const mut=fn=>TS.set(x=>{fn(jr(x.d),x);});
const nm=id=>(ON(id)||{}).short||id;
const focus=()=>S.outlet!=='all'?S.outlet:(S.origin||OUTLETS[0].id);
const O=id=>J().outl[id]||{avail:false,area:null,live:false,off:{}};
const ensure=(j,id)=>j.outl[id]||(j.outl[id]={avail:false,area:null,live:false,off:{}});
const dn=k=>!!TS.get().done['ord.'+k];
const menuSt=()=>J().menu.status;
const brandDone=()=>['menu','svc','tax','pay'].every(dn);
const defv=()=>J().def||DEF;
const delOn=id=>{const v=DB.svc[id];return !!(v&&v.set===true&&v.del);};
function ready(id){const o=O(id);return brandDone()&&o.avail&&(!delOn(id)||!!o.area);}
const anyLive=()=>OUTLETS.some(o=>O(o.id).live);
function layer(){const f=focus(),o=O(f),d=delOn(f);return {done:(o.avail?1:0)+(d&&o.area?1:0),total:1+(d?1:0)};}
function nextStep(){const m=menuSt();if(m==='none')return 'menu';const b=['svc','tax','pay'].find(k=>!dn(k));if(b)return b;if(m==='review')return 'menu';if(m==='importing')return 'wait';const f=focus(),o=O(f);if(!o.avail)return 'avail';if(delOn(f)&&!o.area)return 'area';return 'live';}
const act=()=>TS.active();

/* ───── actions ───── */
const SO=()=>OUTLETS.length<2;
function toAll(){if(SO())return;if(S.outlet!=='all'){S.origin=S.outlet;S.outlet='all';}}
function openSettings(){S.set='ord';S.sdlg=true;S.ch=null;render();}
function openDlg(k){S.ch={k,jr:1,vals:{},scope:'all',pick:[]};render();}
function go(id){const j=J();
 if(!id)id=nextStep();
 mut(j=>{j.started=true;});
 if(id==='menu'||id==='wait'){toAll();S.sdlg=false;S.ch=null;go_('menu');return;}
 if(id==='svc'||id==='tax'||id==='pay'){toAll();openSettings();setTimeout(()=>openDlg(id==='svc'?'psvc':id),60);return;}
 if(id==='avail'){if(S.outlet==='all'){S.outlet=S.origin||OUTLETS[0].id;S.origin=null;}S.sdlg=false;S.ch=null;go_('menu');return;}
 if(id==='area'){if(S.outlet==='all'){S.outlet=S.origin||OUTLETS[0].id;S.origin=null;}S.sdlg=false;S.ch=null;S.zoneOutlet=S.outlet;render();openZed();return;}
 if(id==='live'){start();return;}}
const go_=r=>{window.go(r);};
function start(){const f=focus();if(!ready(f)){go(nextStep());return;}if(!act()){S.sdlg=false;S.ch=null;TS.open('go','sub');return;}
 mut(j=>{ensure(j,f).live=true;});toast(nm(f)+' is taking orders.');S.sdlg=false;S.ch=null;go_('orders');}
function doImport(k){const src=SRC.find(s=>s[0]===k)||SRC[0],t0=Date.now();if(TS.close)TS.close();
 mut(j=>{j.started=true;j.menu={status:'importing',src:k,srcName:src[1],n:src[3],t0};});
 toast('Menu import started. We will tell you when it is ready.');setTimeout(()=>finish(t0),IMPORT_MS);}
function finish(t0){const m=J().menu;if(!m||m.t0!==t0||m.status!=='importing')return;mut(j=>{j.menu.status='review';});toast('Your menu is ready to review.');}
function skip(){const m=J().menu;if(m.status==='importing')finish(m.t0);}
function publish(){mut((j,x)=>{j.menu.status='published';x.done['ord.menu']=true;});toast('Menu published for all outlets.');}
function redo(){mut((j,x)=>{j.menu={status:'none'};delete x.done['ord.menu'];});}
function tog(item){mut(j=>{const o=ensure(j,S.outlet);o.off[item]=!o.off[item];});}
function confirmAvail(){mut(j=>{ensure(j,S.outlet).avail=true;});toast('Menu availability confirmed for '+nm(S.outlet)+'.');}
function pickSrc(k){doImport(k);}
function backTo(){if(S.origin){S.outlet=S.origin;S.origin=null;}render();}
function finishOutlet(id){S.origin=null;S.outlet=id;render();}
function connect(){keep();S.ch.vals.stripe='1';toast('Stripe connected (prototype).');render();}
const keep=()=>{if(!S.ch)return;document.querySelectorAll('#chdlg [id^=chf-]').forEach(e=>{S.ch.vals[e.id.slice(4)]=e.value;});};
function scope(v){keep();S.ch.scope=v;render();}
function pickO(id){keep();const p=S.ch.pick;S.ch.pick=p.includes(id)?p.filter(x=>x!==id):p.concat(id);render();}

/* ───── pages ───── */
const chipH=(cls,t)=>`<span class="jr-st ${cls}">${t}</span>`;
function menuChip(){const s=menuSt();return s==='published'?chipH('d','Done'):s==='importing'?chipH('w','Importing'):s==='review'?chipH('a','Ready to review'):chipH('','To do');}
function menuPage(){const one=S.outlet!=='all',blk=one&&!SO(),m=J().menu,st=m.status;
 let h='<div class="scroll"><div class="page" style="max-width:980px"><div class="jm-h"><h1>Menu</h1><span class="jm-sc">'+(one?esc(nm(S.outlet)):'All outlets')+'</span></div>';
 if(st!=='published'&&blk){
  h+='<div class="jm-note"><b>The menu is set up once, for all outlets.</b><span>'+(st==='none'?'Add it from All outlets. Then each outlet chooses what it serves.':st==='importing'?'It is being imported for all outlets.':'It is ready to review in All outlets.')+'</span><button class="ts-btn" onclick="JR.go(\'menu\')">Go to all outlets</button></div></div></div>';return h;}
 if(st==='none'){h+='<p class="jm-sub">Emma uses your menu to take orders. Pick where to import it from. You can fine-tune it later.</p><div class="jm-src-g">'+SRC.map(s=>'<button class="jm-src" onclick="JR.pickSrc(\''+s[0]+'\')">'+(s[4]?'<em>'+s[4]+'</em>':'')+'<b>'+s[1]+'</b><span>'+s[2]+'</span></button>').join('')+'</div>';}
 else if(st==='importing'){const rest=['svc','tax','pay'].filter(k=>!dn(k)),nm2={svc:'Pickup & delivery',tax:'Taxes',pay:'Payments'};
  h+='<div class="jm-imp"><div class="jm-sp"></div><div><h2>Importing from '+esc(m.srcName)+'</h2><p>This can take a few minutes, and sometimes a few hours. You do not have to wait here. We will tell you here, in the sidebar and by email when it is ready.</p></div></div>'+
   '<div class="jm-meanwhile"><b>'+(rest.length?'Meanwhile, finish the other steps':'The other steps are done')+'</b>'+(rest.length?'<ul>'+rest.map(k=>'<li>'+nm2[k]+'</li>').join('')+'</ul>':'<span>Nothing else is needed until the menu is ready.</span>')+'<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><button class="ts-btn ts-pulse" onclick="JR.go()">Continue setup</button><button class="ts-link" onclick="JR.skip()">Prototype: finish the import now</button></div></div>';}
 else if(st==='review'){h+='<div class="jm-rev"><div><h2>Your menu is ready to review</h2><p>'+m.n+' items found. Check the prices and categories, then publish. You can fine-tune everything later.</p></div><div style="display:flex;gap:12px;align-items:center"><button class="ts-link" onclick="JR.redo()">Import again</button><button class="ts-btn ts-pulse" onclick="JR.publish()">Publish menu</button></div></div>'+catList(false,true);}
 else{h+=one?'<div class="jm-av"><div><b>Choose what '+esc(nm(S.outlet))+' serves</b><span>Everything is on by default. Turn off anything this outlet does not serve.</span></div>'+(O(S.outlet).avail?'<span class="jr-st d">Confirmed</span>':'<button class="ts-btn ts-pulse" onclick="JR.confirmAvail()">Confirm availability</button>')+'</div>':'<div class="jm-note"><b>Menu published. One menu for all outlets.</b><span>Each outlet chooses what it serves from its own Menu page.</span>'+(O(focus()).live||SO()&&ready(focus())?'':'<button class="ts-btn ts-pulse" onclick="JR.go()">'+(brandDone()&&!SO()?'Continue to '+esc(nm(focus())):'Continue setup')+'</button>')+'</div>';
  h+=catList(one,false);}
 return h+'</div></div>';}
function catList(one,preview){let h='<div class="jm-cats">';
 CATS.forEach(c=>{h+='<div class="jm-cat"><div class="jm-ct">'+c[0]+'<small>'+c[1].length+' items'+(preview?' shown':'')+'</small></div>'+c[1].map(it=>{const off=one&&O(S.outlet).off[it[0]],cnt=OUTLETS.filter(o=>!O(o.id).off[it[0]]).length;
  return '<div class="jm-it'+(off?' off':'')+'"><span>'+it[0]+'</span><em>'+money(it[1])+'</em>'+(one?'<button class="tog '+(off?'':'on')+'" aria-label="Available at this outlet" onclick="JR.tog(\''+it[0].replace(/'/g,"\\'")+'\')"></button>':(preview?'':'<small>Available at '+cnt+' of '+OUTLETS.length+'</small>'));}).map(x=>x+(x.indexOf('<div class="jm-it')===0?'</div>':'')).join('')+'</div>';});
 return h+'</div>'+(preview?'<p class="jm-more">+ '+Math.max(0,J().menu.n-CATS.reduce((a,c)=>a+c[1].length,0))+' more items found</p>':'');}
/* the Orders page while ordering is being set up */
function ordersPage(fn){const f=focus(),all=S.outlet==='all';
 if(all?anyLive():O(f).live)return fn();
 const j=J(),ns=nextStep(),L=layer(),stat=TS.stat('ord'),r=ready(f);
 const steps=[['menu','Menu'+(menuSt()==='importing'?' · importing':menuSt()==='review'?' · review':'')],['svc','Pickup & delivery'],['tax','Taxes'],['pay','Payments'],['avail','Availability at '+nm(f)]].concat(delOn(f)?[['area','Delivery area']]:[]).map(s=>{const d=s[0]==='menu'?dn('menu'):s[0]==='avail'?O(f).avail:s[0]==='area'?!!O(f).area:dn(s[0]);return [d?'done':(s[0]===ns?'on':''),s[1],s[0]];});
 const oneV=S.outlet!=='all'&&!SO(),cta=r?(act()?'Start taking orders':'Go live'):(!j.started?(oneV?'Set up in all outlets':'Set up ordering'):'Continue setup');
 const h=r?'Ordering is ready at '+nm(f)+'. *Start taking orders*.':'Set up ordering so Emma can *take orders* for you.';
 const sub=r?(act()?'Everything is set. Press start and Emma takes pickup'+(delOn(f)?' and delivery':'')+' orders at '+esc(nm(f))+'.':'Everything is set. Go live, then start taking orders.'):menuSt()==='importing'?'Your menu is importing. Carry on with the other steps while it runs.':menuSt()==='review'?'Your menu is ready. Review and publish it, then finish the rest.':'The menu and settings are created once, in All outlets. Then each outlet chooses what it serves.';
 return '<div class="scroll"><div class="page" style="max-width:1120px">'+TS.dhPage({k:'ord',pill:(stat.done+L.done)+' of '+(stat.total+L.total)+' steps done',tick:stat.done+L.done>0,h:h,sub:sub,steps:steps,cta:'<button class="ts-btn ts-pulse dh-b" onclick="'+(r?'JR.start()':'JR.go()')+'">'+cta+'</button>'})+'</div></div>';}
/* Settings › Ordering: the checklist and the settings are one list */
const sig=id=>{const v=DB.svc[id]||{},r=v.rad||{};return JSON.stringify([v.set===true,v.pick,v.prep,v.del,v.del?[r.mi,r.fee,r.min]:0]);};
const svcLine=id=>{const v=DB.svc[id]||{},r=v.rad||{};return (v.pick?'Pickup ready in '+v.prep+' min':'Pickup off')+'. '+(v.del?'Delivery within '+r.mi+' mi, '+money(r.fee)+' fee, '+money(r.min)+' minimum':'Delivery off')+'.';};
function svcSum(){const ids=S.outlet==='all'?OUTLETS.map(o=>o.id):[S.outlet];
 if(!dn('svc'))return 'Choose how customers get their order. Set it once for all outlets.';
 if(S.outlet!=='all'){const m={};OUTLETS.forEach(o=>{m[sig(o.id)]=(m[sig(o.id)]||0)+1;});const top=Object.keys(m).sort((a,b)=>m[b]-m[a])[0];return svcLine(S.outlet)+(sig(S.outlet)!==top&&OUTLETS.length>1?' <b class="jr-diff">Different from all outlets</b>':'');}
 const s=new Set(ids.map(sig));return s.size===1?svcLine(ids[0]):svcLine(ids[0])+' <b class="jr-diff">'+(s.size)+' versions across outlets</b>';}
function taxSum(){const l=S.outlet==='all'?DB.taxes:DB.taxes.filter(t=>t.outs.includes(S.outlet));
 if(!l.length)return 'No taxes yet. Add one, or confirm that you charge none.';
 return l.map(t=>esc(t.n)+' '+(t.vt==='%'?t.v+'%':money(t.v))+(S.outlet==='all'&&t.outs.length<OUTLETS.length?' ('+t.outs.length+' outlets)':'')).join(' · ')+(dn('tax')?'':'. Review and confirm.');}
function paySum(){const pk=DB.payPick,m=pk.call&&pk.store?'Card or cash':pk.call?'Card, by text link':'Cash, at pickup or delivery';return dn('pay')?m+'.':'Choose how customers pay. Same for all outlets.';}
function page(){const one0=S.outlet!=='all',one=one0&&!SO(),f=focus(),ns=nextStep(),live=O(f).live;
 const row=(t,desc,chip,btn,onc,hl)=>'<div class="sr'+(hl?' hl':'')+'"><div class="sr-t"><b>'+t+' '+chip+'</b><span>'+desc+'</span></div>'+(btn?'<button class="'+(hl?'ts-btn ts-pulse':'btn btn-soft')+' sr-b" onclick="'+onc+'">'+btn+'</button>':'')+'</div>';
 const done=k=>chipH(dn(k)?'d':'',dn(k)?'Done':'To do');
 const cta=(k,doneT,openT)=>one?(dn(k)?doneT:'Set up in all outlets'):(dn(k)?doneT:openT);
 const act_=(k,d)=>one&&!dn(k)?"JR.toAll('"+k+"')":"JR.open('"+k+"')";
 let h=sH('Ordering','',one?'':'all');
 h+='<div class="jr-g">For all outlets</div><div class="scard sr-c">'+
  row('Menu',menuSt()==='importing'?'Importing from '+esc(J().menu.srcName)+'. We will tell you when it is ready.':menuSt()==='review'?'Imported. Review it and publish.':menuSt()==='published'?'Published. One menu for every outlet.':'Import it once. Each outlet then chooses what it serves.',menuChip(),menuSt()==='none'?'Add menu':menuSt()==='importing'?'See progress':menuSt()==='review'?'Review menu':'Open menu',"JR.go('menu')",ns==='menu'&&menuSt()!=='importing')+
  row('Pickup & delivery',svcSum(),done('svc'),cta('svc',one?'Change for '+esc(nm(S.outlet))+' only':'Change','Set up'),act_('psvc'),ns==='svc')+
  row('Taxes',taxSum(),done('tax'),cta('tax',one?'Taxes at '+esc(nm(S.outlet)):'Change','Review taxes'),act_('tax'),ns==='tax')+
  row('Payments',paySum(),done('pay'),cta('pay','Change','Set up'),act_('pay'),ns==='pay')+'</div>';
 if(one0){const o=O(S.outlet),d=delOn(S.outlet);
  h+='<div class="jr-g">For '+esc(nm(S.outlet))+'</div><div class="scard sr-c">'+
   row('Menu availability',o.avail?'Confirmed. Staff can change it any time from Menu.':menuSt()==='published'?'Everything is on by default. Check what this outlet serves.':'Waiting for the menu to be imported and published.',chipH(o.avail?'d':'',o.avail?'Done':menuSt()==='published'?'To do':'Waiting'),menuSt()==='published'?(o.avail?'Open menu':'Check availability'):'',"JR.go('avail')",ns==='avail')+
   (d?row('Delivery area',o.area?'Set. Callers outside it are offered pickup.':'Draw how far this outlet delivers. Callers outside it are offered pickup.',chipH(o.area?'d':'',o.area?'Done':'To do'),o.area?'Change area':'Set area',"JR.go('area')",ns==='area'):'')+'</div>'+
   '<div class="jr-start">'+(live?'<span class="jr-st d">Taking orders</span><b>'+esc(nm(S.outlet))+' is taking orders.</b>':'<button class="ts-btn" '+(ready(S.outlet)?'':'disabled')+' onclick="JR.start()">'+(act()?'Start taking orders at '+esc(nm(S.outlet)):'Go live, then start taking orders')+'</button><span>'+(ready(S.outlet)?'Everything is set.':'Available once the steps above are done.')+'</span>')+'</div>';}
 else if(brandDone()&&!live)h+='<div class="jr-next"><div><b>The shared steps are done.</b><span>Now finish '+esc(nm(f))+': what it serves and its delivery area.</span></div><button class="ts-btn ts-pulse" onclick="JR.go()">Continue to '+esc(nm(f))+'</button></div>';
 return h;}
/* the second dialog, one design for every ordering setting */
function dlg(){const c=S.ch,k=c.k,CP=window.CHP,where=S.outlet==='all'?'All outlets':nm(S.outlet);
 const T={psvc:['Pickup & delivery','How customers get their order.'],tax:['Taxes','What is added to an order. Add a tax for all outlets, or only for some.'],pay:['Payments','How customers pay. This is the same for every outlet.']}[k];
 let body,foot,scope='';
 if(k==='psvc'){body=svcBody();scope=CP.chScope('pick');foot='<button class="btn btn-line" onclick="chClose()">Cancel</button><button class="btn btn-dark" onclick="JR.save()">Save</button>';}
 else if(k==='tax'){body=CP.chBody('tax');scope='<div class="ch-sc"><span>'+(S.outlet==='all'?'To add a tax for one outlet only, press Add tax and choose the outlet.':'Showing taxes for <b>'+esc(nm(S.outlet))+'</b>. A tax you add here applies to this outlet only.')+'</span></div>';foot='<button class="btn btn-line" onclick="chClose()">Close</button><button class="btn btn-dark" onclick="JR.confirmTax()">'+(DB.taxes.length?'Taxes look right':'We charge no tax')+'</button>';}
 else{body=CP.chBody('pay');foot='<button class="btn btn-line" onclick="chClose()">Cancel</button><button class="btn btn-dark" onclick="JR.save()">Save</button>';}
 return '<div class="ch-bk" onmousedown="if(event.target===this)chClose()"><div class="ch jr" role="dialog" aria-modal="true" aria-label="'+T[0]+'"><div class="ch-h"><div><small>Ordering · '+esc(where)+'</small><h3>'+T[0]+'</h3><p>'+T[1]+'</p></div><button class="sd-x2" aria-label="Close" onclick="chClose()">✕</button></div><div class="ch-b">'+body+'</div>'+scope+'<div class="ch-ft">'+foot+'</div></div></div>';}
function svcBody(){const CP=window.CHP,o=CP.targets()[0]||OUTLETS[0].id,v=DB.svc[o]||{},r=v.rad||{mi:3,fee:3,min:15},V=S.ch.vals,g=(id,d)=>V[id]!==undefined?V[id]:d;
 const f=(l,c,n)=>'<div class="ch-f"><div><b>'+l+'</b>'+(n?'<span>'+n+'</span>':'')+'</div>'+c+'</div>';
 const num=(id,d,u,st)=>'<div class="inp-suf" style="width:132px"><input id="chf-'+id+'" class="inp sm" type="number" min="0" step="'+(st||1)+'" value="'+(g(id,d)==null?'':g(id,d))+'"><span>'+u+'</span></div>';
 const oo=(id,d)=>'<select id="chf-'+id+'" class="inp sm" style="width:190px"><option value="1" '+(String(g(id,d))==='1'?'selected':'')+'>On</option><option value="0" '+(String(g(id,d))==='0'?'selected':'')+'>Off</option></select>';
 const set=v.set===true;
 return '<div class="ch-sec">Pickup</div>'+f('Pickup',oo('pon',set?(v.pick?'1':'0'):'1'),'Customers can order for pickup.')+f('Ready in',num('prep',set&&v.prep?v.prep:20,'min',5),'Customers are told this time once their order is accepted.')+
  '<div class="ch-sec">Delivery</div>'+f('Delivery',oo('don',set&&v.del?'1':'0'),'Customers can order for delivery.')+f('Distance',num('mi',r.mi,'mi',.5))+f('Delivery fee',num('fee',r.fee,'$',.5))+f('Minimum order',num('min',r.min,'$'));}
function save(){const c=S.ch,k=c.k,CP=window.CHP,g=id=>{const e=document.getElementById('chf-'+id);return e?e.value:null;};
 if(k==='psvc'){const t=CP.targets();if(!t.length){toast('Choose at least one outlet');return;}
  t.forEach(i=>{const s=DB.svc[i];if(s.set!==true)Object.assign(s,{set:true,pick:true,prep:20,del:false,rad:{mi:3,fee:3,min:15}});
   s.pick=g('pon')==='1';s.prep=Math.max(5,+g('prep')||20);s.del=g('don')==='1';s.rad=s.rad||{};s.rad.mi=+g('mi')||3;s.rad.fee=+g('fee')||0;s.rad.min=+g('min')||0;if(s.del&&!DB.deliveryMode[i])DB.deliveryMode[i]='radius';});
  if(S.outlet==='all')mut((j,x)=>{x.done['ord.svc']=true;});
  toast(S.outlet==='all'?'Saved for '+(t.length===OUTLETS.length?'all outlets':t.length+' outlet'+(t.length>1?'s':'')):'Saved for '+nm(S.outlet)+' only.');}
 else if(k==='pay'){const m=g('pay');DB.payPick={call:m!=='store',store:m!=='online'};DB.cod.cap=+g('cap')||0;DB.payOk=true;mut((j,x)=>{x.done['ord.pay']=true;});toast('Payments saved.');}
 S.ch=null;render();}
function confirmTax(){DB.taxOk=true;mut((j,x)=>{x.done['ord.tax']=true;});S.ch=null;toast('Taxes confirmed.');render();}
function areaDone(o){mut(j=>{ensure(j,o).area=true;});}
/* sidebar and reminders */
function badge(){const s=menuSt();return s==='importing'?'<span class="bdg imp" title="Menu import in progress"><i></i></span>':s==='review'?'<span class="bdg new">Review</span>':'';}
function sub(){const s=menuSt();if(s==='importing')return 'Your menu is importing. Carry on with the other steps.';if(s==='review')return 'Your menu is ready to review.';const f=focus();if(ready(f)&&!O(f).live)return 'Ready. Start taking orders at '+nm(f)+'.';return null;}
function bar(){const el=document.getElementById('jrbar');if(el)el.remove();}
function init(){
 VIEWS.menu=()=>menuPage();
 TS.beforeOutlet=()=>{};
 TS.host.jrGo=go;
 const po=window.pickOutlet;window.pickOutlet=function(id){S.origin=null;return po(id);};
 const o0=VIEWS.orders;VIEWS.orders=()=>DB.mods.ord?ordersPage(o0):o0();
 window.ordRows=()=>page();
 const ot=window.openTax;window.openTax=function(id){ot(id);if(!id&&S.outlet!=='all'&&S.menu.tw)S.menu.tw.outs=[S.outlet];};
 const st=window.saveTaxW;window.saveTaxW=function(){const was=S.menu.drawer;st();if(was==='tax'&&S.menu.drawer!=='tax'){mut((j,x)=>{x.done['ord.tax']=true;});if(S.sdlg)openDlg('tax');}};
 const zs=window.zedSave;window.zedSave=function(){const o=S.zed&&S.zed.o;zs();if(o&&!S.zed){areaDone(o);S.sdlg=false;go_('menu');S.route='menu';render();toast('Delivery area saved for '+nm(o)+'.');}};}
return {init,menuPage,ordersPage,page,dlg,save,go,start,pickSrc,skip,publish,redo,tog,confirmAvail,confirmTax,badge,bar,sub,
 toAll:k=>{toAll();openSettings();setTimeout(()=>openDlg(k),60);},open:openDlg};})();

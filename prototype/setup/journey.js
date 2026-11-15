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
const delOn=id=>{const j=J(),o=j.ovr[id];return o?!!o.del:!!(j.def&&j.def.del);};
function ready(id){const o=O(id);return brandDone()&&o.avail&&(!delOn(id)||!!o.area);}
const anyLive=()=>OUTLETS.some(o=>O(o.id).live);
function layer(){const f=focus(),o=O(f),d=delOn(f);return {done:(o.avail?1:0)+(d&&o.area?1:0),total:1+(d?1:0)};}
function nextStep(){const m=menuSt();if(m==='none')return 'menu';const b=['svc','tax','pay'].find(k=>!dn(k));if(b)return b;if(m==='review')return 'menu';if(m==='importing')return 'wait';const f=focus(),o=O(f);if(!o.avail)return 'avail';if(delOn(f)&&!o.area)return 'area';return 'live';}
const act=()=>TS.active();

/* ───── actions ───── */
const SO=()=>OUTLETS.length<2;
function toAll(){if(SO())return;if(S.outlet!=='all'){S.origin=S.outlet;S.outlet='all';}}
function openSettings(){S.set='ord';S.sdlg=true;S.ch=null;render();}
function openDlg(k){S.ch={j:k,vals:{},scope:'all',pick:[]};render();}
function go(id){const j=J();
 if(!id)id=nextStep();
 mut(j=>{j.started=true;});
 if(id==='menu'||id==='wait'){toAll();S.sdlg=false;S.ch=null;go_('menu');return;}
 if(id==='svc'||id==='tax'||id==='pay'){toAll();openSettings();setTimeout(()=>openDlg('j'+id),60);return;}
 if(id==='avail'){if(S.outlet==='all'&&S.origin){S.outlet=S.origin;S.origin=null;}S.sdlg=false;S.ch=null;go_('menu');return;}
 if(id==='area'){if(S.outlet==='all'&&S.origin){S.outlet=S.origin;S.origin=null;}openSettings();setTimeout(()=>openDlg('jarea'),60);return;}
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
 else{h+=one?'<div class="jm-av"><div><b>Choose what '+esc(nm(S.outlet))+' serves</b><span>Everything is on by default. Turn off anything this outlet does not serve.</span></div>'+(O(S.outlet).avail?'<span class="jr-st d">Confirmed</span>':'<button class="ts-btn ts-pulse" onclick="JR.confirmAvail()">Confirm availability</button>')+'</div>':'<div class="jm-note slim"><b>This menu is shared by all outlets.</b><span>Each outlet chooses what it serves from its own Menu page.</span></div>';
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
 const cta=r?(act()?'Start taking orders':'Go live'):(!j.started?'Set up ordering':ns==='wait'?'Continue setup':'Continue setup');
 const h=r?'Ordering is ready at '+nm(f)+'. *Start taking orders*.':'Set up ordering so Emma can *take orders* for you.';
 const sub=r?(act()?'Everything is set. Press start and Emma takes pickup'+(delOn(f)?' and delivery':'')+' orders at '+esc(nm(f))+'.':'Everything is set. Go live, then start taking orders.'):menuSt()==='importing'?'Your menu is importing. Carry on with the other steps while it runs.':menuSt()==='review'?'Your menu is ready. Review and publish it, then finish the rest.':'Add your menu once for all outlets, then set pickup, delivery, taxes and payments.';
 return '<div class="scroll"><div class="page" style="max-width:1120px">'+TS.dhPage({k:'ord',pill:(stat.done+L.done)+' of '+(stat.total+L.total)+' steps done',tick:stat.done+L.done>0,h:h,sub:sub,steps:steps,cta:'<button class="ts-btn ts-pulse dh-b" onclick="'+(r?'JR.start()':'JR.go()')+'">'+cta+'</button>'})+'</div></div>';}
/* Settings › Ordering: the checklist and the settings are one list */
function page(){const one0=S.outlet!=='all',one=one0&&!SO(),f=focus(),j=J(),ns=nextStep(),def=defv(),ov=j.ovr[S.outlet],eff=one&&ov?ov:def,live=O(f).live;
 const row=(t,desc,chip,btn,act,hl)=>'<div class="sr'+(hl?' hl':'')+'"><div class="sr-t"><b>'+t+' '+chip+'</b><span>'+desc+'</span></div>'+(btn?'<button class="'+(hl?'ts-btn ts-pulse':'btn btn-soft')+' sr-b" onclick="'+act+'">'+btn+'</button>':'')+'</div>';
 const done=k=>chipH(dn(k)?'d':'',dn(k)?'Done':'To do');
 const svcTxt=dn('svc')?('Pickup '+(eff.pick?'ready in '+eff.prep+' min':'off')+'. Delivery '+(eff.del?'within '+eff.mi+' mi, '+money(eff.fee)+' fee, '+money(eff.min)+' minimum':'off')+'.')+(one&&ov?' <b class="jr-diff">Different from all outlets</b>':''):'Choose how customers get their order. These are the defaults for all outlets.';
 const tx=j.taxes?(j.taxes.none?'No tax (0%).':esc(j.taxes.name)+' '+j.taxes.rate+'%'+(j.taxes.outs&&j.taxes.outs.length<OUTLETS.length?' · '+j.taxes.outs.length+' outlets':' · all outlets')):'Set the tax added to orders. A suggestion is filled in for you.';
 const pay=j.pay?({online:'Card, by text link',store:'Cash, at pickup or delivery',both:'Card or cash'})[j.pay.mode]+(j.pay.stripe?' · Stripe connected':''):'Choose how customers pay.';
 const brandBtn=(k,d)=>one?(d?'':'Set up in all outlets'):(d?'Change':'Set up');
 const brandAct=(k,d)=>one?(d?'':"JR.toAll('j"+k+"')"):"JR.open('j"+k+"')";
 let h=sH('Ordering','',one?'':'all');
 if(!live)h+='<div class="jr-lead"><b>'+(ready(f)?esc(nm(f))+' is ready.':'Not ready to take orders yet')+'</b><span>'+(ready(f)?'Press start when you want Emma to take orders.':'Finish the steps below. Ordering stays off until they are done.')+'</span></div>';
 h+='<div class="jr-g">For all outlets</div><div class="scard sr-c">'+
  row('Menu',menuSt()==='importing'?'Importing from '+esc(J().menu.srcName)+'. We will tell you when it is ready.':menuSt()==='review'?'Imported. Review it and publish.':menuSt()==='published'?'Published. One menu for every outlet.':'Import it once. Each outlet then chooses what it serves.',menuChip(),menuSt()==='none'?'Add menu':menuSt()==='importing'?'See progress':menuSt()==='review'?'Review menu':'Open menu',"JR.go('menu')",ns==='menu'&&menuSt()!=='importing')+
  row('Pickup & delivery',svcTxt,done('svc'),one?(dn('svc')?'Change for '+esc(nm(S.outlet))+' only':'Set up in all outlets'):(dn('svc')?'Change':'Set up'),one?(dn('svc')?"JR.open('jsvc')":"JR.toAll('jsvc')"):"JR.open('jsvc')",ns==='svc')+
  row('Taxes',tx,done('tax'),brandBtn('tax',dn('tax')),brandAct('tax',dn('tax')),ns==='tax')+
  row('Payments',pay,done('pay'),brandBtn('pay',dn('pay')),brandAct('pay',dn('pay')),ns==='pay')+'</div>';
 if(one0){const o=O(S.outlet),d=delOn(S.outlet);
  h+='<div class="jr-g">For '+esc(nm(S.outlet))+'</div><div class="scard sr-c">'+
   row('Menu availability',o.avail?'Confirmed. Staff can change it any time from Menu.':menuSt()==='published'?'Everything is on by default. Check what this outlet serves.':'Waiting for the menu to be imported and published.',chipH(o.avail?'d':'',o.avail?'Done':menuSt()==='published'?'To do':'Waiting'),menuSt()==='published'?(o.avail?'Open menu':'Check availability'):'',"JR.go('avail')",ns==='avail')+
   (d?row('Delivery area',o.area?'Within '+o.area+' mi of the outlet.':'Set how far this outlet delivers. Callers outside it are offered pickup.',chipH(o.area?'d':'','Done'.replace('Done',o.area?'Done':'To do')),o.area?'Change':'Set area',"JR.open('jarea')",ns==='area'):'')+'</div>'+
   '<div class="jr-start">'+(live?'<span class="jr-st d">Taking orders</span><b>'+esc(nm(S.outlet))+' is taking orders.</b>':'<button class="ts-btn" '+(ready(S.outlet)?'':'disabled')+' onclick="JR.start()">'+(act()?'Start taking orders at '+esc(nm(S.outlet)):'Go live, then start taking orders')+'</button><span>'+(ready(S.outlet)?'Everything is set.':'Locked until the steps above are done.')+'</span>')+'</div>';}
 else{h+='<div class="jr-g">Outlets</div><div class="scard sr-c">'+OUTLETS.map(o=>{const oo=O(o.id),dl=delOn(o.id),tot=1+(dl?1:0),d=(oo.avail?1:0)+(dl&&oo.area?1:0);return row(esc(o.short),oo.live?'Taking orders.':ready(o.id)?'Ready to start.':brandDone()?d+' of '+tot+' outlet steps done.':'Waiting for the steps above.',oo.live?chipH('d','Live'):ready(o.id)?chipH('a','Ready'):chipH('',brandDone()?'To do':'Waiting'),oo.live?'':brandDone()?'Finish '+esc(o.short):'',"JR.finishOutlet('"+o.id+"')",false);}).join('')+'</div>';}
 return h;}
/* dialogs: create for all outlets, or change for one outlet */
function dlg(){const c=S.ch,k=c.j,V=c.vals,one=S.outlet!=='all'&&!SO(),f=focus(),j=J(),def=defv(),base=one&&j.ovr[S.outlet]?j.ovr[S.outlet]:def,g=(id,d)=>V[id]!==undefined?V[id]:d;
 const fl=(l,ctl,n)=>'<div class="ch-f"><div><b>'+l+'</b>'+(n?'<span>'+n+'</span>':'')+'</div>'+ctl+'</div>';
 const num=(id,d,u,st)=>'<div class="inp-suf" style="width:132px"><input id="chf-'+id+'" class="inp sm" type="number" min="0" step="'+(st||1)+'" value="'+(g(id,d)??'')+'"><span>'+u+'</span></div>';
 const sel=(id,d,o)=>'<select id="chf-'+id+'" class="inp sm" style="width:190px">'+o.map(a=>'<option value="'+a[0]+'" '+(String(a[0])===String(g(id,d))?'selected':'')+'>'+a[1]+'</option>').join('')+'</select>';
 const oo=id=>sel(id,'1',[['1','On'],['0','Off']]);
 let t='',b='',n='';
 if(k==='jsvc'){t='Pickup & delivery';b=fl('Pickup',sel('pick',base.pick?'1':'0',[['1','On'],['0','Off']]),'Customers can order for pickup.')+fl('Ready in',num('prep',base.prep,'min',5),'Customers are told this time once their order is accepted.')+fl('Delivery',sel('del',base.del?'1':'0',[['1','On'],['0','Off']]),'Customers can order for delivery.')+fl('Distance',num('mi',base.mi,'mi',.5))+fl('Delivery fee',num('fee',base.fee,'$',.5))+fl('Minimum order',num('min',base.min,'$'));
  n=one?'Applies to <b>'+esc(nm(S.outlet))+'</b> only. It will show as different from all outlets.':'These are the defaults for <b>all outlets</b>. Each outlet draws its own delivery area later.';}
 else if(k==='jtax'){const none=g('none','0')==='1';t='Taxes';b=fl('We charge no tax',sel('none',none?'1':'0',[['0','No, add a tax'],['1','Yes, 0%']]),'0% is a valid answer.')+(none?'':fl('Tax name','<input id="chf-name" class="inp sm" style="width:220px" value="'+esc(g('name','Chicago restaurant tax'))+'">','We filled in a suggestion for Chicago.')+fl('Rate',num('rate',10.25,'%',.01)));
  const outs=OUTLETS.map(o=>o.id);n='<b>Apply to</b><label class="ch-r"><input type="radio" name="chs" '+(c.scope==='all'?'checked':'')+' onchange="JR.scope(\'all\')"> All '+outs.length+' outlets</label><label class="ch-r"><input type="radio" name="chs" '+(c.scope==='pick'?'checked':'')+' onchange="JR.scope(\'pick\')"> Only some outlets</label>'+(c.scope==='pick'?'<div class="ch-chips">'+OUTLETS.map(o=>'<button class="ch-chip '+(c.pick.includes(o.id)?'on':'')+'" onclick="JR.pickO(\''+o.id+'\')">'+esc(o.short)+'</button>').join('')+'</div>':'');}
 else if(k==='jpay'){const mode=g('mode',(j.pay&&j.pay.mode)||'store'),conn=g('stripe',j.pay&&j.pay.stripe?'1':'0')==='1';t='Payments';b=fl('How customers pay',sel('mode',mode,[['online','Card, by text link'],['store','Cash, at pickup or delivery'],['both','Both']]),'This is the same for all outlets.')+fl('Card payments',conn?'<span class="pill p-green"><span class="d"></span>Connected</span>':'<button class="ts-btn sm line" onclick="JR.connect()">Connect Stripe</button>',conn?'Your Stripe account is connected.':'Needed to take card payments.')+fl('Cash limit',num('cap',g('cap',(j.pay&&j.pay.cap)||30),'$'),'Cash is only allowed for orders up to this amount.');n='Payments are the <b>same for every outlet</b>.';}
 else{t='Delivery area';const mi=+g('mi',O(S.outlet).area||defv().mi||3);b=fl('Distance',num('mi',mi,'mi',.5),'How far '+esc(nm(S.outlet))+' delivers. Callers outside it are offered pickup.')+'<div class="jr-map"><svg viewBox="0 0 300 130" aria-hidden="true"><rect width="300" height="130" fill="#EFEEE9"/><path d="M0 40h300M0 90h300M80 0v130M200 0v130" stroke="#E2E1DB" stroke-width="6"/><circle cx="150" cy="65" r="'+Math.min(62,mi*14)+'" fill="rgba(79,194,180,.22)" stroke="#4FC2B4" stroke-width="2"/><circle cx="150" cy="65" r="6" fill="#111"/></svg></div>';n='Delivery area for <b>'+esc(nm(S.outlet))+'</b>. You can draw the exact area on the map later.';}
 return '<div class="ch-bk" onmousedown="if(event.target===this)chClose()"><div class="ch" role="dialog" aria-modal="true" aria-label="'+t+'"><div class="ch-h"><h3>'+t+'</h3><button class="sd-x2" aria-label="Close" onclick="chClose()">✕</button></div><div class="ch-b">'+b+'</div><div class="ch-sc"><div>'+n+'</div></div><div class="ch-ft"><button class="btn btn-line" onclick="chClose()">Cancel</button><button class="btn btn-dark" onclick="JR.save()">Save</button></div></div></div>';}
function save(){const c=S.ch,k=c.j,one=S.outlet!=='all'&&!SO(),gv=id=>{const e=document.getElementById('chf-'+id);return e?e.value:null;};
 if(k==='jsvc'){const v={pick:gv('pick')==='1',prep:Math.max(5,+gv('prep')||20),del:gv('del')==='1',mi:+gv('mi')||3,fee:+gv('fee')||0,min:+gv('min')||0};
  if(one)mut(j=>{j.ovr[S.outlet]=v;});else mut((j,x)=>{j.def=v;x.done['ord.svc']=true;Object.assign(x.d.svc,{pick:v.pick,prep:v.prep,del:v.del,mi:v.mi,fee:v.fee,min:v.min});});
  toast(one?'Saved for '+nm(S.outlet)+'.':'Saved for all outlets.');}
 else if(k==='jtax'){const none=gv('none')==='1',outs=c.scope==='all'?OUTLETS.map(o=>o.id):c.pick;if(!none&&!outs.length){toast('Choose at least one outlet');return;}
  mut((j,x)=>{j.taxes=none?{none:true,outs}:{name:(gv('name')||'Tax').trim(),rate:+gv('rate')||0,outs};x.done['ord.tax']=true;});toast('Taxes saved.');}
 else if(k==='jpay'){const mode=gv('mode'),conn=(c.vals.stripe==='1')||(J().pay&&J().pay.stripe);if(mode!=='store'&&!conn){toast('Connect Stripe to take card payments.');return;}
  mut((j,x)=>{j.pay={mode,stripe:!!conn,cap:+gv('cap')||0};x.done['ord.pay']=true;x.d.pay.pick=mode;x.d.pay.conn=!!conn;});toast('Payments saved.');}
 else{const mi=+gv('mi')||3;mut(j=>{ensure(j,S.outlet).area=mi;});toast('Delivery area saved for '+nm(S.outlet)+'.');}
 S.ch=null;render();}
/* sidebar, reminders and the bar that says which layer you are in */
function badge(){const s=menuSt();return s==='importing'?'<span class="bdg imp" title="Menu import in progress"><i></i></span>':s==='review'?'<span class="bdg new">Review</span>':'';}
function sub(){const s=menuSt();if(s==='importing')return 'Your menu is importing. Carry on with the other steps.';if(s==='review')return 'Your menu is ready to review.';const f=focus();if(ready(f)&&!O(f).live)return 'Ready. Start taking orders at '+nm(f)+'.';return null;}
function bar(){let el=document.getElementById('jrbar'),html='';const j=J();
 if(j.started&&!anyLive()){
  if(S.outlet==='all'&&S.origin)html='<div class="jrb-t"><b>You are setting up ordering for all outlets</b><span>The menu, pickup, delivery, taxes and payments are the same for every outlet.</span></div><button class="ts-btn sm line" onclick="JR.backTo()">Back to '+esc(nm(S.origin))+'</button>';
  else if(S.outlet!=='all'&&brandDone()&&!ready(S.outlet))html='<div class="jrb-t"><b>Almost there. Finish '+esc(nm(S.outlet))+' to start taking orders.</b><span>'+(menuSt()!=='published'?'Waiting for the menu. ':'')+(delOn(S.outlet)?'Menu availability and delivery area are left.':'Menu availability is left.')+'</span></div><button class="ts-btn sm" onclick="JR.go(\'live\')">See what is left</button>';}
 if(!html){if(el)el.remove();return;}
 if(!el){const top=document.getElementById('top');if(!top)return;el=document.createElement('div');el.id='jrbar';top.insertAdjacentElement('afterend',el);}
 if(el.dataset.h!==html){el.innerHTML=html;el.dataset.h=html;}}
function init(){
 VIEWS.menu=()=>menuPage();
 TS.beforeOutlet=()=>{};
 TS.host.jrGo=go;TS.host.jrImport=doImport;TS.host.jrLayer=layer;TS.host.jrDone=()=>anyLive();TS.host.jrSub=sub;
 const po=window.pickOutlet;window.pickOutlet=function(id){S.origin=null;return po(id);};
 const o0=VIEWS.orders;VIEWS.orders=()=>DB.mods.ord?ordersPage(o0):o0();
 window.ordRows=()=>page();}
return {init,menuPage,ordersPage,page,dlg,save,go,start,pickSrc,skip,publish,redo,tog,confirmAvail,backTo,finishOutlet,connect,scope,pickO,badge,bar,sub,
 toAll:k=>{toAll();openSettings();setTimeout(()=>openDlg(k),60);},open:openDlg};})();

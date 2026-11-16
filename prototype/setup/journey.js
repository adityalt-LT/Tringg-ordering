/* H3: ordering setup on top of the real Menu module and the real Settings dialogs.
   Shared steps (menu, pickup, delivery, taxes, payments) are created in All outlets.
   An outlet that delivers also needs its delivery area. Everything else already exists in the dashboard. */
window.JR=(function(){
const money=n=>'$'+(Math.round(n*100)%100?(+n).toFixed(2):Math.round(n));
const nm=id=>(ON(id)||{}).short||id;
const SO=()=>OUTLETS.length<2;
const jr=d=>d.jr||(d.jr={started:false,outl:{}});
const J=()=>jr(TS.get().d);
const mut=fn=>TS.set(x=>fn(jr(x.d),x));
const O=id=>J().outl[id]||{area:false,live:false};
const ensure=(j,id)=>j.outl[id]||(j.outl[id]={area:false,live:false});
const ids=()=>S.outlet==='all'?OUTLETS.map(o=>o.id):[S.outlet];
const act=()=>TS.active();
/* what is done comes from the dashboard's own data */
const menuDone=()=>DB.menuState==='live';
const svcSet=id=>(DB.svc[id]||{}).set===true;
const delOn=id=>svcSet(id)&&!!DB.svc[id].del;
const svcDone=()=>ids().every(svcSet);
const taxDone=()=>!!DB.taxOk;
const payDone=()=>!!DB.payOk;
const needArea=()=>ids().filter(id=>delOn(id)&&!O(id).area);
const hasDel=()=>ids().some(delOn);
const sharedDone=()=>menuDone()&&svcDone()&&taxDone()&&payDone();
const ready=id=>menuDone()&&svcSet(id)&&taxDone()&&payDone()&&(!delOn(id)||!!O(id).area);
const anyLive=()=>ids().some(id=>O(id).live);
function sync(){const d=TS.get().done,set=(k,v)=>{if(v)d[k]=true;else delete d[k];};
 set('ord.menu',menuDone());set('ord.svc',svcDone());set('ord.tax',taxDone());set('ord.pay',payDone());}
function nextStep(){const f=S.menu&&S.menu.flow==='extracting',dr=DB.menuState==='draft';
 if(!menuDone()&&!f&&!dr&&!J().started)return 'menu';
 if(!svcDone())return 'svc';if(!taxDone())return 'tax';if(!payDone())return 'pay';
 if(!menuDone())return 'menu';
 if(needArea().length)return 'area';return 'live';}

/* ───── moving around ───── */
function toAll(){if(!SO()&&S.outlet!=='all')S.outlet='all';}
function openSettings(){S.set='ord';S.sdlg=true;S.ch=null;S.nav=false;render();}
function open(k){toAll();openSettings();setTimeout(()=>chOpen(k),60);}
function area(id){id=id||needArea()[0]||ids().filter(delOn)[0];if(!id)return;S.zoneOutlet=id;S.sdlg=false;S.ch=null;render();openZed();}
function go(id){id=id||nextStep();mut(j=>{j.started=true;});
 if(id==='menu'){toAll();S.sdlg=false;S.ch=null;window.go('menu');return;}
 if(id==='svc'){open('pick');return;}
 if(id==='tax'||id==='pay'){open(id==='pay'?'payx':id);return;}
 if(id==='area'){area();return;}
 if(id==='live')start();}
const H4=()=>window.TS_JOURNEY==='2';
function start(only){const t=(only?[only]:ids()).filter(id=>ready(id)&&!O(id).live);if(!t.length){go(nextStep());return;}
 if(!act()){S.sdlg=false;S.ch=null;TS.open('go','sub');return;}
 mut(j=>{t.forEach(id=>{ensure(j,id).live=true;});});toast(t.length===1?nm(t[0])+' is taking orders.':t.length+' outlets are taking orders.');S.sdlg=false;S.ch=null;window.go('orders');}
function confirmPay(){DB.payOk=true;S.ch=null;toast('Payments saved.');render();}
function confirmTax(){DB.taxOk=true;S.ch=null;toast(DB.taxes.length?'Taxes confirmed.':'No tax will be added.');render();}

/* ───── Orders page while ordering is being set up ───── */
function outletCards(){const shared=OUTLETS.every(o=>svcSet(o.id))&&menuDone()&&taxDone()&&payDone();
 return '<div class="jr-oh"><h3>Your outlets</h3><span>'+(shared?'Each outlet inherits the menu, pickup and delivery, taxes and payments.':'Each outlet inherits the shared steps once they are done.')+'</span></div><div class="jr-oc2g">'+OUTLETS.map(o=>{const id=o.id,live=O(id).live,rd=ready(id),needA=shared&&delOn(id)&&!O(id).area;
  const st=live?['d','Taking orders']:rd?['a','Ready']:needA?['w','Needs delivery area']:['','Waiting'];
  const note=live?'Emma is taking orders here.':rd?'Everything is set for this outlet.':needA?'Draw how far this outlet delivers.':'Waiting for the shared steps above.';
  const btn=live?'':rd?'<button class="ts-btn sm" onclick="JR.start(\''+id+'\')">'+(act()?'Start taking orders':'Go live')+'</button>':needA?'<button class="btn btn-soft sm" onclick="JR.area(\''+id+'\')">Draw area</button>':'';
  return '<div class="jr-oc2"><div class="jr-oc2-h"><b>'+esc(o.short||o.name)+'</b>'+chip(st[0],st[1])+'</div><span>'+note+'</span>'+(shared?'<div class="jr-inh"><i>✓</i> Menu · Pickup & delivery · Taxes · Payments</div>':'')+btn+'</div>';}).join('')+'</div>';}
function ordersPage(fn){if(anyLive()&&!(H4()&&S.outlet==='all'&&!SO()&&OUTLETS.some(o=>!O(o.id).live)))return fn();
 const ns=nextStep(),m=S.menu&&S.menu.flow==='extracting'?' · importing':DB.menuState==='draft'?' · ready to review':'';
 const list=[['menu','Menu'+m,menuDone()],['svc','Pickup & delivery',svcDone()],['tax','Taxes',taxDone()],['pay','Payments',payDone()]];
 if(hasDel())list.push(['area','Delivery area',needArea().length===0]);
 const steps=list.map(s=>[s[2]?'done':(s[0]===ns?'on':''),s[1],s[0]]),n=list.filter(s=>s[2]).length,r=ns==='live';
 const where=S.outlet==='all'||SO()?'':' at '+esc(nm(S.outlet));
 const h=r?'Ordering is ready'+where+'. *Start taking orders*.':'Set up ordering so Emma can *take orders* for you.';
 const sub=r?(act()?'Everything is set. Press start and Emma takes orders.':'Everything is set. Go live, then start taking orders.'):(S.outlet!=='all'&&!SO()&&!sharedDone()?'The menu and settings are created once, in All outlets.':'Add your menu, then set pickup, delivery, taxes and payments.');
 const cta=r?(act()?'Start taking orders':'Go live'):(!J().started?(S.outlet!=='all'&&!SO()?'Set up in all outlets':'Set up ordering'):'Continue setup');
 return '<div class="scroll"><div class="page" style="max-width:1120px">'+TS.dhPage({k:'ord',pill:n+' of '+list.length+' steps done',tick:n>0,h:h,sub:sub,steps:steps,cta:'<button class="ts-btn ts-pulse dh-b" onclick="JR.go()">'+cta+'</button>'})+(H4()&&S.outlet==='all'&&!SO()?outletCards():'')+'</div></div>';}

/* ───── Settings › Ordering ───── */
const chip=(cls,t)=>'<span class="jr-st '+cls+'">'+t+'</span>';
const done=d=>chip(d?'d':'',d?'Done':'To do');
const doneS=d=>H4()&&S.outlet!=='all'&&!SO()&&d?chip('d','Same as all outlets'):done(d);
const top=labels=>{const m=new Map();labels.forEach(l=>m.set(l,(m.get(l)||0)+1));const a=[...m.entries()];
 if(a.length===1)return labels.length===1||labels.length<OUTLETS.length?a[0][0]:a[0][0]+' at all outlets';return a.map(e=>e[0]+' at '+e[1]+' outlet'+(e[1]>1?'s':'')).join(' · ');};
function page(){const one=S.outlet!=='all'&&!SO(),I_=ids(),set=I_.filter(svcSet),unset=I_.length-set.length;
 const row=(t,desc,chp,btn,onc,extra)=>'<div class="sr"><div class="sr-t"><b>'+t+(chp?' '+chp:'')+'</b><span>'+desc+'</span>'+(extra||'')+'</div>'+(btn?'<button class="btn btn-soft sr-b" onclick="'+onc+'">'+btn+'</button>':'')+'</div>';
 const need=(d,dialog,doneBtn)=>one&&!d?['Set up in all outlets',"JR.open('"+dialog+"')"]:[d?doneBtn||'Change':'Set up',"chOpen('"+dialog+"')"];
 const sfx=unset&&set.length?' Not set up at '+unset+' outlet'+(unset>1?'s':'')+'.':'';
 const pk=set.length?top(set.map(id=>DB.svc[id].pick?'Ready in '+DB.svc[id].prep+' min':'Pickup off')):'';
 const dv=set.length?top(set.map(id=>DB.svc[id].del?'Within '+DB.svc[id].rad.mi+' mi, '+money(DB.svc[id].rad.fee)+' fee, '+money(DB.svc[id].rad.min)+' minimum':'Off')):'';
 const mflow=S.menu&&S.menu.flow==='extracting',ms=DB.menuState;
 const menuRow=row('Menu',mflow?'Importing from '+esc(S.menu.src)+'. We will tell you when it is ready.':ms==='draft'?'Imported. Review it, then publish.':ms==='live'?'Published. One menu for all outlets.':'Add your menu once, for all outlets.',
  chip(menuDone()?'d':(mflow?'w':(ms==='draft'?'a':'')),menuDone()?'Done':mflow?'Importing':ms==='draft'?'Ready to review':'To do'),menuDone()?'Open menu':mflow?'See progress':ms==='draft'?'Review menu':'Add menu',"JR.go('menu')");
 const p=need(svcDone(),'pick'),d=need(svcDone(),'del');
 let areaRow='';
 if(hasDel()){const dl=I_.filter(delOn);
  areaRow=row('Delivery area',one?(O(S.outlet).area?'Drawn. Callers outside it are offered pickup.':'Draw how far '+esc(nm(S.outlet))+' delivers.'):'Each outlet draws its own delivery area.',done(dl.every(id=>O(id).area)),one?(O(S.outlet).area?'Change area':'Draw area'):'',"JR.area('"+S.outlet+"')",
   one?'':'<div class="jr-chips">'+dl.map(id=>'<button class="jr-oc '+(O(id).area?'d':'')+'" onclick="JR.area(\''+id+'\')"><b>'+esc(nm(id))+'</b><span>'+(O(id).area?'Drawn':'Draw area')+'</span></button>').join('')+'</div>');}
 const tx=one?(DB.taxes.filter(t=>t.outs.includes(S.outlet)).map(t=>esc(t.n)+' '+(t.vt==='%'?t.v+'%':money(t.v))).join(' · ')||'No taxes or fees yet.'):(DB.taxes.length?DB.taxes.length+' tax'+(DB.taxes.length>1?'es':'')+' and fees added. Some can be for only some outlets.':taxDone()?'No tax is added to orders.':'No taxes or fees yet. Add them for all outlets, or only some.');
 const pky=DB.payPick,pay=payDone()?((pky.call&&pky.store?'Customers can pay by card or cash.':pky.call?'Customers pay by card, using a text link.':'Customers pay with cash.')+(DB.stripe==='active'?' Stripe is connected.':'')):'Choose how customers pay. This is the same for all outlets.';
 const A=S.outlet==='all',aaT=A?'Choose if orders are accepted automatically at your outlets.':(DB.autoAccept[S.outlet]?'Orders are accepted automatically.':'You accept each order yourself.');
 const preT=A?'Choose if customers can order for later at your outlets.':((DB.pre[S.outlet]||{}).on?'Customers can order for later.':'Pre-orders are off.');
 const tb=need(taxDone(),'tax',one?'View taxes':'Change'),pb=need(payDone(),'payx');
 return sH('Ordering','',one?'':'all')+'<div class="jr-g">Needed to take orders</div><div class="scard sr-c">'+menuRow+
  row('Pickup',set.length?pk+(one?'':'.')+sfx:'Not set up yet.',doneS(svcDone()),p[0],p[1])+
  row('Delivery',set.length?dv+(one?'':'.')+sfx:'Not set up yet.',doneS(svcDone()),d[0],d[1])+areaRow+
  row('Taxes and fees',tx,doneS(taxDone()),tb[0],tb[1])+
  row('Payments',pay,doneS(payDone()),pb[0],pb[1])+'</div>'+
  '<div class="jr-g">More settings</div><div class="scard sr-c">'+row('Accepting orders',aaT,'','Change',"chOpen('accx')")+row('Pre-orders',preT,'','Change',"chOpen('pre')")+(one&&svcSet(S.outlet)?row('Large orders and menu link','Hand big orders to your team, and share a link to your menu.','','Change',"chOpen('lgx')"):'')+'</div>';}

/* sidebar */
function badge(){if(S.menu&&S.menu.flow==='extracting')return '<span class="bdg imp" title="Menu import in progress"><i></i></span>';return DB.menuState==='draft'?'<span class="bdg new">Review</span>':'';}
function init(){
 TS.beforeOutlet=()=>{};
 if(H4()&&!SO())S.outlet='all';
 Object.keys(DB.svc).forEach(k=>{DB.svc[k]={set:false,del:false,pick:false,prep:null,rad:null};DB.deliveryMode[k]=null;});DB.taxes=[];DB.taxOk=false;DB.payOk=false;
 const o0=VIEWS.orders;VIEWS.orders=()=>DB.mods.ord?ordersPage(o0):o0();
 window.ordRows=()=>page();
 const bd=window.buildDraft;window.buildDraft=function(src){bd(src);toast('Your menu is ready to review.');};
 const ot=window.openTax;window.openTax=function(id){ot(id);if(!id&&S.outlet!=='all'&&!SO()&&S.menu.tw)S.menu.tw.outs=[S.outlet];};
 const st=window.saveTaxW;window.saveTaxW=function(){const was=S.menu.drawer;st();if(was==='tax'&&S.menu.drawer!=='tax'&&S.sdlg){S.set='ord';chOpen('tax');}};
 const zs=window.zedSave;window.zedSave=function(){const o=S.zed&&S.zed.o;zs();if(o&&!S.zed){mut(j=>{ensure(j,o).area=true;});S.set='ord';S.sdlg=true;render();toast('Delivery area saved for '+nm(o)+'.');}};
 const zc=window.zedCancel;window.zedCancel=function(){zc();S.set='ord';S.sdlg=true;render();};}
return {init,sync,anyLiveAny:()=>OUTLETS.some(o=>O(o.id).live),ordersPage,page,go,start,area,open,badge,confirmTax,confirmPay,bar:()=>{const e=document.getElementById('jrbar');if(e)e.remove();}};})();

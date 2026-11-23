/* H3: ordering setup on top of the real Menu module and the real Settings dialogs.
   Shared steps (menu, pickup, delivery, taxes, payments) are created in All outlets.
   An outlet that delivers also needs its delivery area. Everything else already exists in the dashboard. */
window.JR=(function(){
const money=n=>'$'+(Math.round(n*100)%100?(+n).toFixed(2):Math.round(n));
const nm=id=>id==='all'?(OUTLETS[0]||{}).short:((ON(id)||{}).short||id);
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
function area(id){if(id==='all')id=null;id=id||needArea()[0]||ids().filter(delOn)[0];if(!id)return;S.zoneOutlet=id;S.sdlg=false;S.ch=null;render();openZed();}
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
 const inh=S.outlet!=='all'&&!SO()&&O(S.outlet).inherited&&!O(S.outlet).live,srcN=inh?nm(O(S.outlet).inherited):'';
 const h=r?'Ordering is ready'+where+'. *Start taking orders*.':inh?nm(S.outlet)+' inherited your *ordering setup*.':'Set up ordering so Emma can *take orders* for you.';
 const sub=inh&&!r?'It uses the menu, pickup and delivery, taxes and payments from '+esc(srcN)+'. Only its delivery area is left.':r?(act()?'Everything is set. Press start and Emma takes orders.':'Everything is set. Go live, then start taking orders.'):(S.outlet!=='all'&&!SO()&&!sharedDone()?'The menu and settings are created once, in All outlets.':'Add your menu, then set pickup, delivery, taxes and payments.');
 const cta=r?(act()?'Start taking orders':'Go live'):(!J().started?(S.outlet!=='all'&&!SO()?'Set up in all outlets':'Set up ordering'):'Continue setup');
 return '<div class="scroll"><div class="page" style="max-width:1120px">'+TS.dhPage({k:'ord',pill:n+' of '+list.length+' steps done',tick:n>0,h:h,sub:sub,steps:steps,cta:'<button class="ts-btn ts-pulse dh-b" onclick="JR.go()">'+cta+'</button>'})+(H4()&&S.outlet==='all'&&!SO()?outletCards():'')+'</div></div>';}

/* ───── Settings › Ordering ───── */
const chip=(cls,t)=>'<span class="jr-st '+cls+'">'+t+'</span>';
const done=d=>chip(d?'d':'',d?'Done':'To do');
const H5=()=>/^[34]$/.test(window.TS_JOURNEY);
const doneS=d=>(H4()||H5())&&S.outlet!=='all'&&!SO()&&d?chip('d','Same as all outlets'):done(d);
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
  const oneA=one||SO();areaRow=row('Delivery area',oneA?(O(S.outlet).area?'Drawn. Callers outside it are offered pickup.':'Draw how far '+esc(nm(S.outlet))+' delivers.'):'Each outlet draws its own delivery area.',done(dl.every(id=>O(id).area)),oneA?(O(S.outlet).area?'Change area':'Draw area'):'',"JR.area('"+S.outlet+"')",
   oneA?'':'<div class="jr-chips">'+dl.map(id=>'<button class="jr-oc '+(O(id).area?'d':'')+'" onclick="JR.area(\''+id+'\')"><b>'+esc(nm(id))+'</b><span>'+(O(id).area?'Drawn':'Draw area')+'</span></button>').join('')+'</div>');}
 const tx=one?(DB.taxes.filter(t=>t.outs.includes(S.outlet)).map(t=>esc(t.n)+' '+(t.vt==='%'?t.v+'%':money(t.v))).join(' · ')||'No taxes or fees yet.'):(DB.taxes.length?DB.taxes.length+' tax'+(DB.taxes.length>1?'es':'')+' and fees added. Some can be for only some outlets.':taxDone()?'No tax is added to orders.':(SO()?'No taxes or fees yet. Add the tax your restaurant charges.':'No taxes or fees yet. Add them for all outlets, or only some.'));
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
const chipX=0;
const canAdd=()=>H5()&&typeof isOwner==='function'&&isOwner();
function renderAdd(){let el=document.getElementById('jradd');if(!S.addO){if(el)el.remove();return;}
 if(!el){el=document.createElement('div');el.id='jradd';el.style.cssText='position:relative;z-index:150';document.body.appendChild(el);}
 const src=OUTLETS[0],has=svcSet(src.id)&&menuDone();
 el.innerHTML='<div class="ch-bk" onmousedown="if(event.target===this)JR.addClose()"><div class="ch jr" role="dialog" aria-modal="true" aria-label="Add an outlet"><div class="ch-h"><div><small>New outlet</small><h3>Add an outlet</h3></div><button class="sd-x2" aria-label="Close" onclick="JR.addClose()">✕</button></div><div class="ch-b">'+
  '<div class="ch-f"><div><b>Outlet name</b></div><input id="jra-n" class="inp sm" style="width:260px;flex:0 0 260px" value="'+esc(S.addO.name)+'"></div><div class="ch-f"><div><b>Area</b><span>Shown in the outlet list.</span></div><input id="jra-a" class="inp sm" style="width:260px;flex:0 0 260px" placeholder="e.g. Naperville" value="'+esc(S.addO.area)+'"></div></div>'+
  '<div class="ch-sc"><div>'+(has?'<b>It inherits from '+esc(src.short)+'</b><br>Menu, pickup and delivery, taxes, payments and accepting orders. You only add its delivery area, then start taking orders.':'<b>Nothing to inherit yet</b><br>Finish the ordering setup first and new outlets will copy it.')+'</div></div><div class="ch-ft"><button class="btn btn-line" onclick="JR.addClose()">Cancel</button><button class="btn btn-dark" onclick="JR.addCreate()">Add outlet</button></div></div></div>';}
function addOutlet(){S.dd=false;renderRail();S.addO={name:'ROSSA ',area:''};renderAdd();}
function addClose(){S.addO=null;renderAdd();}
function addCreate(){const n=(document.getElementById('jra-n').value||'').trim(),a=(document.getElementById('jra-a').value||'').trim();if(!n){toast('Add a name');return;}
 const sp=OUTLETS_ALL.find(o=>!OUTLETS.some(x=>x.id===o.id)&&!o.isNew);if(!sp){toast('No more outlets in this demo');return;}
 const src=OUTLETS[0].id,id=sp.id,cl=x=>JSON.parse(JSON.stringify(x));
 sp.name=n;sp.short=a||n.replace(/^ROSSA\s+/i,'');OUTLETS.push(sp);ROLE_OUT.owner=[...(ROLE_OUT.owner||[]),id];
 if(svcSet(src)){DB.svc[id]=cl(DB.svc[src]);DB.deliveryMode[id]=null;DB.zones[id]=[];}
 DB.items.forEach(i=>i.pg.forEach(g=>{if(g.outs.includes(src)&&!g.outs.includes(id))g.outs.push(id);}));
 (DB.wins||[]).forEach(w=>{if(w.outs&&w.outs.includes(src)&&!w.outs.includes(id))w.outs.push(id);});
 DB.taxes.forEach(t=>{if(t.outs.includes(src)&&!t.outs.includes(id))t.outs.push(id);});
 DB.autoAccept[id]=DB.autoAccept[src];if(DB.pre[src])DB.pre[id]=cl(DB.pre[src]);
 const inherited=svcSet(src)&&menuDone();
 S.addO=null;renderAdd();mut(j=>{const o=ensure(j,id);o.area=false;if(inherited)o.inherited=src;});
 S.outlet=id;S.dd=false;S.route=H6()?'overview':'orders';render();toast(sp.short+' added.'+(inherited?' It inherits the setup from '+nm(src)+'.':''));}

/* ───── H6: reservations and answers are set up in Settings ───── */
const H6=()=>window.TS_JOURNEY==='4';
const CATS_=[['general','General'],['res','Reservation'],['ord','Ordering'],['catering','Catering'],['music','Music events']];
const cats=()=>CATS_.concat(TS.get().d.fcats||[]);
const stF=()=>{const j=J();return j.st||(j.st={});};
function outletNow(){return S.outlet!=='all'?S.outlet:(OUTLETS[0]||{}).id;}
function openSet(page,cat){S.outlet=outletNow();S.set=page;if(cat)S.faqCat=cat;S.sdlg=true;S.ch=null;S.nav=false;S.dd=false;S.rsOpen=false;render();}
function goSvc(k,step){mut(j=>{(j.st||(j.st={}))[k]=1;});
 if(k==='enq'){openSet('faq','general');return;}
 const st=step||(TS.get().done['res.rules']?'faq':'rules');if(st==='faq')openSet('faq','res');else openSet('res-set');}
function faqOk(cat){const key=cat==='res'?'res.faq':'enq.faq';mut((j,x)=>{x.done[key]=true;});toast(cat==='res'?'Reservation answers confirmed.':'Answers confirmed.');render();}
function faqPage(){const s=TS.get(),cat=S.faqCat||'general',d=s.d,list=d.faqs.map((f,i)=>[f,i]).filter(x=>(x[0][2]||'general')===cat);
 const rk=cat==='res'?'res.faq':cat==='general'?'enq.faq':null,svc=cat==='res'?'res':'enq',pend=rk&&TS.sel(svc)&&!s.done[rk]&&stF()[svc];
 const chips='<div class="jr-tabs">'+cats().map(c=>'<button class="'+(c[0]===cat?'on':'')+'" onclick="S.faqCat=\''+c[0]+'\';render()">'+c[1]+'<i>'+d.faqs.filter(f=>(f[2]||'general')===c[0]).length+'</i></button>').join('')+'<button class="jr-newcat" onclick="JR.faqEdit(-1,true)">+ New category</button></div>';
 const banner=pend?'<div class="jr-rev"><div><b>'+(cat==='res'?'Review your reservation answers':'Review your answers')+'</b><span>Emma says these to callers. Fix anything that is wrong, then confirm.</span></div><button class="ts-btn ts-pulse" onclick="JR.faqOk(\''+cat+'\')">Looks good</button></div>':'';
 const rows=list.length?list.map(x=>'<div class="sr"><div class="sr-t"><b>'+esc(x[0][0]||'New question')+'</b><span>'+esc(x[0][1]||'No answer yet')+'</span></div><button class="btn btn-soft sr-b" onclick="JR.faqEdit('+x[1]+')">Edit</button></div>').join(''):'<div class="sr"><div class="sr-t"><span>No answers in this category yet.</span></div></div>';
 return sH('FAQ / Knowledge','Answers the agent can use on calls.')+chips+banner+'<div class="scard sr-c">'+rows+'</div><div style="margin-top:14px"><button class="btn btn-line" onclick="JR.faqEdit(-1)">+ Add an answer</button></div>';}
function faqEdit(i,nc){const f=i>=0?TS.get().d.faqs[i]:['','',S.faqCat||'general'];S.ch={k:'faqe',jr:1,i,vals:{q:f[0],a:f[1],c:nc?'__new':(f[2]||'general'),nc:''}};render();}
function catSel(v){const e=document.getElementById('jr-ncr');if(e)e.style.display=v==='__new'?'flex':'none';}
function resPage(){const s=TS.get(),r=s.d.res,rd=!!s.done['res.rules'],fd=!!s.done['res.faq'],n=s.d.faqs.filter(f=>f[2]==='res').length;
 const row=(t,desc,d,btn,onc)=>'<div class="sr"><div class="sr-t"><b>'+t+' '+chip(d?'d':'',d?'Done':'To do')+'</b><span>'+desc+'</span></div><button class="'+(d?'btn btn-soft':'btn btn-soft')+' sr-b" onclick="'+onc+'">'+btn+'</button></div>';
 return sH('Reservations','How the agent takes table bookings at '+esc(nm(outletNow()))+'.')+'<div class="jr-g">Needed to take bookings</div><div class="scard sr-c">'+
  row('Booking rules','Up to '+r.perDay+' a day · '+r.minP+' to '+r.maxP+' guests · '+r.dur+' min tables · up to '+r.win+' days ahead.',rd,rd?'Change':'Set up',"JR.resEdit()")+
  row('Reservation answers',n+' answer'+(n===1?'':'s')+' Emma can give about bookings, like walk-ins and large parties.',fd,fd?'Review again':'Review',"S.faqCat='res';S.set='faq';render()")+'</div>';}
function resEdit(){const r=TS.get().d.res;S.ch={k:'resr',jr:1,vals:Object.assign({},r)};render();}
function dlg(){const c=S.ch,V=c.vals,k=c.k,where=nm(outletNow());
 const f=(l,ctl,n)=>'<div class="ch-f"><div><b>'+l+'</b>'+(n?'<span>'+n+'</span>':'')+'</div>'+ctl+'</div>';
 const num=(id,u,mn,mx)=>'<div class="inp-suf" style="width:132px"><input id="chf-'+id+'" class="inp sm" type="number" min="'+mn+'" max="'+mx+'" value="'+(V[id]==null?'':V[id])+'">'+(u?'<span>'+u+'</span>':'')+'</div>';
 const sel=(id,o)=>'<select id="chf-'+id+'" class="inp sm" style="width:190px">'+o.map(a=>'<option value="'+a[0]+'" '+(String(a[0])===String(V[id])?'selected':'')+'>'+a[1]+'</option>').join('')+'</select>';
 let t,b,foot;
 if(k==='resr'){t='Booking rules';b=f('Max reservations a day',num('perDay','',1,500))+f('Advance booking window',sel('win',[[7,'7 days'],[14,'14 days'],[30,'30 days'],[60,'60 days'],[90,'90 days']]))+f('Min party size',num('minP','guests',1,50))+f('Max party size',num('maxP','guests',1,100))+f('Booking length',sel('dur',[[60,'1 hour'],[90,'1.5 hours'],[120,'2 hours'],[150,'2.5 hours']]))+f('Notice needed',sel('notice',[[0,'No notice'],[30,'30 min'],[60,'1 hour'],[120,'2 hours'],[240,'4 hours'],[1440,'1 day']]));foot='<button class="btn btn-line" onclick="chClose()">Cancel</button><button class="btn btn-dark" onclick="JR.saveRes()">Save and continue</button>';}
 else{t=c.i>=0?'Edit answer':'Add an answer';b=f('Question','<input id="chf-q" class="inp sm" style="width:300px;flex:0 0 300px" value="'+esc(V.q||'')+'">')+f('Answer','<textarea id="chf-a" class="inp" rows="3" style="width:300px;flex:0 0 300px">'+esc(V.a||'')+'</textarea>')+f('Category','<select id="chf-c" class="inp sm" style="width:190px" onchange="JR.catSel(this.value)">'+cats().map(a=>'<option value="'+a[0]+'" '+(a[0]===V.c?'selected':'')+'>'+esc(a[1])+'</option>').join('')+'<option value="__new" '+(V.c==='__new'?'selected':'')+'>+ New category…</option></select>')+'<div class="ch-f" id="jr-ncr" style="display:'+(V.c==='__new'?'flex':'none')+'"><div><b>New category name</b><span>For example Private events or Catering.</span></div><input id="chf-nc" class="inp sm" style="width:220px;flex:0 0 220px" placeholder="Private events"></div>';foot=(c.i>=0?'<button class="btn btn-line" style="margin-right:auto" onclick="JR.faqDel()">Delete</button>':'')+'<button class="btn btn-line" onclick="chClose()">Cancel</button><button class="btn btn-dark" onclick="JR.saveFaq()">Save</button>';}
 return '<div class="ch-bk" onmousedown="if(event.target===this)chClose()"><div class="ch jr" role="dialog" aria-modal="true" aria-label="'+t+'"><div class="ch-h"><div><small>'+(k==='resr'?'Reservations':'FAQ / Knowledge')+' · '+esc(where)+'</small><h3>'+t+'</h3></div><button class="sd-x2" aria-label="Close" onclick="chClose()">✕</button></div><div class="ch-b">'+b+'</div><div class="ch-ft">'+foot+'</div></div></div>';}
const gv_=id=>{const e=document.getElementById('chf-'+id);return e?e.value:'';};
function saveRes(){const v={perDay:+gv_('perDay')||1,win:+gv_('win'),minP:+gv_('minP')||1,maxP:+gv_('maxP')||1,dur:+gv_('dur'),notice:+gv_('notice')};
 if(v.minP>v.maxP){toast('Min party size is above the max');return;}
 mut((j,x)=>{Object.assign(x.d.res,v);x.done['res.rules']=true;});S.ch=null;S.faqCat='res';S.set='faq';render();toast('Booking rules saved. Now review your reservation answers.');}
function saveFaq(){let c=gv_('c')||'general';const q=gv_('q').trim(),a=gv_('a').trim();if(!q||!a){toast('Add a question and an answer');return;}const i=S.ch.i;
 if(c==='__new'){const n=gv_('nc').trim();if(!n){toast('Name the new category');return;}const id=n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'cat'+Date.now();const ex=cats().find(x=>x[0]===id||x[1].toLowerCase()===n.toLowerCase());c=ex?ex[0]:id;if(!ex)mut((j,x)=>{(x.d.fcats||(x.d.fcats=[])).push([id,n]);});}
 mut((j,x)=>{if(i>=0){const f=x.d.faqs[i];f[0]=q;f[1]=a;f[2]=c;}else x.d.faqs.push([q,a,c]);});S.faqCat=c;S.ch=null;render();toast('Saved.');}
function faqDel(){const i=S.ch.i;mut((j,x)=>{x.d.faqs.splice(i,1);});S.ch=null;render();toast('Removed.');}
/* the sidebar: what is left, one card for every journey that was started and not finished */
function ordLeft(){const l=[menuDone(),svcDone(),taxDone(),payDone()];if(hasDel())l.push(needArea().length===0);return {done:l.filter(Boolean).length,total:l.length};}
function lefts(){const o=[],s=TS.get();
 if(TS.sel('res')&&stF().res&&!TS.stat('res').complete){const x=TS.stat('res');o.push({k:'res',n:'Reservations',done:x.done,total:x.total});}
 if(TS.sel('enq')&&stF().enq&&!TS.stat('enq').complete){const x=TS.stat('enq');o.push({k:'enq',n:'Review answers',done:x.done,total:x.total});}
 if(TS.sel('ord')&&J().started&&!anyLive()){const x=ordLeft();if(x.done<x.total)o.push({k:'ord',n:'Ordering',done:x.done,total:x.total});}
 return o;}
function resume(k){S.rsOpen=false;if(k==='ord')go();else goSvc(k);}
function railSetup(){const L=lefts();if(!L.length)return '';const left=L.reduce((a,x)=>a+x.total-x.done,0),dn=L.reduce((a,x)=>a+x.done,0),tt=L.reduce((a,x)=>a+x.total,0),pct=Math.round(dn/tt*100);
 const ring='<span class="rs-ring" style="--p:'+pct+'"><i>'+left+'</i></span>';
 if(L.length===1){const x=L[0];return '<div class="rs"><button class="rs-card" onclick="JR.resume(\''+x.k+'\')">'+ring+'<span class="rs-t"><b>'+x.n+'</b><small>'+(x.total-x.done)+' step'+(x.total-x.done>1?'s':'')+' left</small></span><span class="rs-go">Continue ›</span></button></div>';}
 const pop=S.rsOpen?'<div class="rs-pop">'+L.map(x=>'<button class="rs-row" onclick="JR.resume(\''+x.k+'\')"><span class="rs-t"><b>'+x.n+'</b><small>'+x.done+' of '+x.total+' done</small><i class="rs-bar"><u style="width:'+Math.round(x.done/x.total*100)+'%"></u></i></span><span class="rs-go">›</span></button>').join('')+'</div>':'';
 return '<div class="rs">'+pop+'<button class="rs-card" aria-expanded="'+!!S.rsOpen+'" onclick="S.rsOpen=!S.rsOpen;renderRail()">'+ring+'<span class="rs-t"><b>Finish setup</b><small>'+left+' steps left in '+L.length+' services</small></span><span class="rs-go">'+(S.rsOpen?'⌄':'⌃')+'</span></button></div>';}

function menuNote(kind){const o=nm(S.outlet);
 if(kind==='import')return '<div class="jr-scope"><div><b>Import your menu here, then manage it in All outlets</b><span>Import from Google, a POS, your website, a delivery app or a file. After that, adding and editing items happens in All outlets.</span></div></div>';
 return '<div class="jr-scope"><div><b>You are viewing the menu for '+esc(o)+'</b><span>Here you choose what '+esc(o)+' serves. To add, edit or organise items, switch to All outlets.</span></div><button class="ts-btn" onclick="JR.menuAll()">Switch to All outlets</button></div>';}
function menuAll(){S.outlet='all';S.menu.tab='items';render();}
function lens(total){const fo=S.menu.fo||'all';if(OUTLETS.length<2)return '';
 const off=fo==='all'?0:DB.items.filter(i=>soldAt(i).includes(fo)&&i.oos[fo]).length;
 return '<div class="jr-lens"><label for="jr-fo">Show items sold at</label><select id="jr-fo" class="inp sm" onchange="S.menu.fo=this.value;S.menu.sel=[];render()"><option value="all">All outlets</option>'+OUTLETS.map(o=>'<option value="'+o.id+'" '+(fo===o.id?'selected':'')+'>'+esc(o.short)+'</option>').join('')+'</select><span>'+(fo==='all'?total+' items on the menu':total+' of '+DB.items.length+' items are sold at '+esc(nm(fo))+(off?' · '+off+' out of stock there':''))+'</span></div>';}
function init(){
 if(H6()){SET['res-set']=()=>resPage();SET.faq=()=>faqPage();document.addEventListener('click',e=>{if(S.rsOpen&&!e.target.closest('.rs')){S.rsOpen=false;renderRail();}});}
 TS.beforeOutlet=()=>{};
 if(H4()&&!SO()||H5())S.outlet='all';
 Object.keys(DB.svc).forEach(k=>{DB.svc[k]={set:false,del:false,pick:false,prep:null,rad:null};DB.deliveryMode[k]=null;});DB.taxes=[];DB.taxOk=false;DB.payOk=false;
 const o0=VIEWS.orders;VIEWS.orders=()=>DB.mods.ord?ordersPage(o0):o0();
 window.ordRows=()=>page();
 const bd=window.buildDraft;window.buildDraft=function(src){bd(src);toast('Your menu is ready to review.');};
 const ot=window.openTax;window.openTax=function(id){ot(id);if(!id&&S.outlet!=='all'&&!SO()&&S.menu.tw)S.menu.tw.outs=[S.outlet];};
 const st=window.saveTaxW;window.saveTaxW=function(){const was=S.menu.drawer;st();if(was==='tax'&&S.menu.drawer!=='tax'&&S.sdlg){S.set='ord';chOpen('tax');}};
 const zs=window.zedSave;window.zedSave=function(){const o=S.zed&&S.zed.o;zs();if(o&&!S.zed){mut(j=>{ensure(j,o).area=true;});S.set='ord';S.sdlg=true;render();toast('Delivery area saved for '+nm(o)+'.');}};
 const zc=window.zedCancel;window.zedCancel=function(){zc();S.set='ord';S.sdlg=true;render();};}
return {init,sync,menuNote,menuAll,lens,catSel,railSetup,resume,goSvc,faqOk,faqEdit,resEdit,dlg,saveRes,saveFaq,faqDel,canAdd,addOutlet,addClose,addCreate,anyLiveAny:()=>OUTLETS.some(o=>O(o.id).live),ordersPage,page,go,start,area,open,badge,confirmTax,confirmPay,bar:()=>{const e=document.getElementById('jrbar');if(e)e.remove();}};})();

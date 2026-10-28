/* Tringg setup engine.
   One model of "what is left to set up", shared by the onboarding frame and the dashboard frame.
   Enquiries are always on. Reservations and Ordering are chosen. Every step opens in a sheet on top of
   whatever screen the owner is on, so finishing a step never moves them anywhere.
   State lives in the wrapper page and is mirrored into both frames with postMessage. */
(function(){
'use strict';
var TS=window.TS={};
var VARIANT=window.TS_VARIANT||'A';
TS.variant=VARIANT;
TS.nav=function(){};          /* the dashboard sets this so rows can jump to a module the owner chose */

var CSS=`
:root{--tk-ink:#111;--tk-mint:#4FC2B4;--tk-mint-d:#1F6E62;--tk-mint-50:#DDF2EE;--tk-bd:#E6E4DE;--tk-bd2:#D6D4CD;--tk-50:#6B6B6B;--tk-30:#A3A3A0;--tk-sun:#F5F4EF;--tk-amb:#9A6A12;--tk-amb-bg:#FFF1CF;--tk-red:#A12E2E;--tk-red-bg:#FBE3E1}
.ts-ov{position:fixed;inset:0;z-index:900;background:rgba(17,17,17,.46);display:flex;align-items:center;justify-content:center;padding:24px;animation:tsfade .18s ease both}
@keyframes tsfade{from{opacity:0}to{opacity:1}}@keyframes tsup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.ts-sheet{width:100%;max-width:940px;height:min(660px,calc(100vh - 48px));background:#fff;border-radius:22px;display:flex;overflow:hidden;box-shadow:0 30px 80px -20px rgba(0,0,0,.5);animation:tsup .24s cubic-bezier(.2,.7,.2,1) both;font-family:"Poppins",system-ui,sans-serif;color:var(--tk-ink);font-size:14px;line-height:1.5}
.ts-side{width:262px;flex-shrink:0;background:var(--tk-sun);padding:26px 20px;display:flex;flex-direction:column;gap:4px;border-right:1px solid var(--tk-bd);overflow:auto}
.ts-eyebrow{font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--tk-50)}
.ts-sn{font-size:22px;font-weight:600;letter-spacing:-.5px;margin:2px 0 6px}
.ts-sd{font-size:13px;color:var(--tk-50);margin-bottom:16px}
.ts-steps{list-style:none;display:flex;flex-direction:column;gap:2px;padding:0;margin:0}
.ts-stp{display:flex;gap:10px;align-items:center;width:100%;text-align:left;padding:9px 10px;border-radius:12px;border:0;background:none;cursor:pointer;font:inherit;color:inherit}
.ts-stp:hover{background:#ECEBE5}.ts-stp.on{background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.ts-n{width:24px;height:24px;border-radius:50%;border:1.5px solid var(--tk-bd2);display:grid;place-items:center;font-size:12px;font-weight:600;flex-shrink:0;color:var(--tk-50);background:#fff}
.ts-stp.done .ts-n{background:var(--tk-mint);border-color:var(--tk-mint);color:#06231e}.ts-stp.on .ts-n{border-color:var(--tk-ink);color:var(--tk-ink)}.ts-stp.done.on .ts-n{color:#06231e}
.ts-stp b{font-weight:500;font-size:13.5px}
.ts-sn2{margin-top:auto;font-size:12px;color:var(--tk-50);padding-top:18px}
.ts-main{flex:1;min-width:0;display:flex;flex-direction:column}
.ts-top{display:flex;justify-content:flex-end;padding:14px 16px 0}
.ts-xb{width:34px;height:34px;border-radius:10px;border:0;background:none;cursor:pointer;display:grid;place-items:center;color:var(--tk-50)}.ts-xb:hover{background:var(--tk-sun);color:var(--tk-ink)}
.ts-body{flex:1;overflow:auto;padding:0 36px 20px}
.ts-h{font-size:26px;font-weight:600;letter-spacing:-.8px;line-height:1.2;margin:0}
.ts-sub{color:var(--tk-50);margin:6px 0 22px;font-size:14.5px}
.ts-foot{display:flex;align-items:center;gap:10px;padding:16px 36px;border-top:1px solid var(--tk-bd)}
.ts-foot .sp{flex:1}.ts-err{color:var(--tk-red);font-size:13px;font-weight:500}
.ts-btn{height:44px;padding:0 20px;border-radius:12px;border:1.5px solid var(--tk-ink);background:var(--tk-ink);color:#fff;font:inherit;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;text-decoration:none}
.ts-btn:hover{background:#2c2c2c}.ts-btn.line{background:#fff;color:var(--tk-ink)}.ts-btn.line:hover{background:var(--tk-sun)}.ts-btn.sm{height:34px;padding:0 14px;font-size:13px;border-radius:10px}
.ts-btn.ghost{border-color:transparent;background:none;color:var(--tk-50)}.ts-btn.ghost:hover{background:var(--tk-sun);color:var(--tk-ink)}
.ts-btn:disabled{opacity:.35;cursor:not-allowed}
.ts-g2{display:grid;grid-template-columns:1fr 1fr;gap:18px 16px}
.ts-f{display:flex;flex-direction:column;gap:7px}.ts-f>span{font-size:13.5px;font-weight:500}.ts-f small{color:var(--tk-50);font-size:12.5px}
.ts-in,.ts-sel,.ts-ta{width:100%;border:1.5px solid var(--tk-bd);background:#fff;border-radius:12px;padding:0 14px;height:46px;font:inherit;color:inherit;outline:0}
.ts-ta{height:auto;padding:12px 14px;resize:none;line-height:1.55}.ts-in:focus,.ts-sel:focus,.ts-ta:focus{border-color:var(--tk-ink)}
.ts-in.s{width:84px;height:40px;padding:0 10px}
.ts-sel{appearance:none;-webkit-appearance:none;padding-right:38px;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center}
.ts-opt{display:flex;gap:14px;align-items:flex-start;width:100%;text-align:left;padding:16px 18px;margin-bottom:10px;background:#fff;border:1.5px solid var(--tk-bd);border-radius:16px;cursor:pointer;font:inherit;color:inherit}
.ts-opt:hover{border-color:var(--tk-ink)}.ts-opt.on{border-color:var(--tk-ink);box-shadow:0 0 0 1px var(--tk-ink)}
.ts-opt b{display:block;font-weight:600}.ts-opt span.d{color:var(--tk-50);font-size:13.5px;display:block}
.ts-rad{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--tk-30);flex-shrink:0;margin-top:2px;display:grid;place-items:center}.ts-opt.on .ts-rad{border-color:var(--tk-ink)}.ts-opt.on .ts-rad::after{content:"";width:10px;height:10px;border-radius:50%;background:var(--tk-ink)}
.ts-tag{font-size:11px;font-weight:600;color:var(--tk-mint-d);background:var(--tk-mint-50);border-radius:999px;padding:2px 9px;margin-left:8px;vertical-align:middle}
.ts-tg{display:flex;align-items:flex-start;gap:20px;padding:16px 0;border-top:1px solid var(--tk-bd)}.ts-tg:first-of-type{border-top:0;padding-top:2px}
.ts-tg>div{flex:1}.ts-tg b{font-weight:600;display:block}.ts-tg .d{color:var(--tk-50);font-size:13.5px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px}
.ts-sw{position:relative;width:46px;height:26px;border-radius:999px;background:var(--tk-bd2);flex-shrink:0;border:0;cursor:pointer;margin-top:2px;transition:background .2s}
.ts-sw::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .2s}
.ts-sw[aria-checked=true]{background:var(--tk-mint)}.ts-sw[aria-checked=true]::after{transform:translateX(20px)}
.ts-faq{border:1.5px solid var(--tk-bd);border-radius:14px;padding:12px 14px;margin-bottom:10px;display:flex;flex-direction:column;gap:8px}
.ts-faq .ts-in{height:38px;font-weight:500}.ts-faq .ts-ta{padding:9px 14px}
.ts-link{border:0;background:none;color:var(--tk-mint-d);font:inherit;font-weight:500;cursor:pointer;padding:0;text-align:left}.ts-link:hover{opacity:.7}
.ts-bar{height:6px;border-radius:6px;background:#EAE9E4;overflow:hidden}.ts-bar i{display:block;height:100%;background:var(--tk-mint);border-radius:6px;transition:width .5s}
.ts-busy{padding:46px 0;text-align:center}.ts-busy .ts-bar{max-width:320px;margin:18px auto 10px}
.ts-cat{display:flex;justify-content:space-between;padding:11px 0;border-top:1px solid var(--tk-bd);font-size:14px}.ts-cat span:last-child{color:var(--tk-50)}
.ts-ok{text-align:center;padding:50px 20px}.ts-okc{width:64px;height:64px;border-radius:50%;background:var(--tk-mint);display:grid;place-items:center;margin:0 auto 20px;color:#06231e}
.ts-ok h3{font-size:24px;font-weight:600;letter-spacing:-.6px;margin:0 0 6px}.ts-ok p{color:var(--tk-50);max-width:420px;margin:0 auto 22px}
.ts-num{display:flex;align-items:center;gap:14px;padding:14px 18px;border:1.5px solid var(--tk-bd);border-radius:14px;margin-bottom:18px}.ts-num .m{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:20px}.ts-num .ts-btn{margin-left:auto}
.ts-note{background:var(--tk-sun);border-radius:12px;padding:12px 14px;font-size:13px;color:var(--tk-50);margin-top:14px}
.ts-price{border:1.5px solid var(--tk-bd);border-radius:16px;padding:18px 20px;margin-bottom:16px}.ts-price .big{font-size:30px;font-weight:600;letter-spacing:-1px}.ts-price .big small{font-size:14px;font-weight:400;color:var(--tk-50);letter-spacing:0}
.ts-price ul{margin:12px 0 0;padding-left:18px;color:var(--tk-50);font-size:13.5px}
/* cards, strips, panels placed in the host pages */
.ts-card{background:#fff;border:1.5px solid var(--tk-bd);border-radius:20px;padding:22px 24px;font-family:"Poppins",system-ui,sans-serif;color:var(--tk-ink);font-size:14px;line-height:1.5;text-align:left}
.ts-card.off{background:transparent;border-style:dashed}
.ts-ch{display:flex;align-items:flex-start;gap:16px}.ts-ch>div:first-child{flex:1;min-width:0}
.ts-ct{font-size:17px;font-weight:600;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.ts-cd{color:var(--tk-50);font-size:13.5px;margin-top:2px}
.ts-pl{font-size:11.5px;font-weight:600;border-radius:999px;padding:3px 10px;background:#EAE9E4;color:var(--tk-50);white-space:nowrap}
.ts-pl.g{background:var(--tk-mint-50);color:var(--tk-mint-d)}.ts-pl.a{background:var(--tk-amb-bg);color:var(--tk-amb)}
.ts-prog{margin:16px 0 6px}.ts-rows{display:flex;flex-direction:column;margin-top:8px}
.ts-row{display:flex;gap:12px;align-items:center;width:100%;text-align:left;padding:11px 8px;margin:0 -8px;border:0;border-radius:12px;background:none;cursor:pointer;font:inherit;color:inherit}
.ts-row:hover{background:var(--tk-sun)}.ts-row .t{flex:1;min-width:0}.ts-row .t b{font-weight:500;display:block}.ts-row .t small{color:var(--tk-50);font-size:12.5px;display:block}
.ts-row .go{font-size:12.5px;font-weight:600;color:var(--tk-50)}.ts-row.done .t b{color:var(--tk-50)}
.ts-row .ts-n{width:22px;height:22px;font-size:11.5px}.ts-row.done .ts-n{background:var(--tk-mint);border-color:var(--tk-mint);color:#06231e}
.ts-cf{margin-top:16px;display:flex;gap:10px;align-items:center}
.ts-strip{display:flex;flex-direction:column;gap:8px;margin-bottom:18px;font-family:"Poppins",system-ui,sans-serif}
.ts-srow{display:flex;align-items:center;gap:14px;background:#fff;border:1.5px solid var(--tk-bd);border-radius:16px;padding:12px 16px;font-size:14px}
.ts-srow .dot{width:9px;height:9px;border-radius:50%;background:#E9B44C;flex-shrink:0}.ts-srow .m{flex:1;min-width:0;color:var(--tk-50);font-size:13.5px}.ts-srow .m b{color:var(--tk-ink);font-weight:600}
.ts-center{margin-bottom:22px;font-family:"Poppins",system-ui,sans-serif}.ts-chd{display:flex;align-items:center;gap:18px;margin-bottom:14px}
.ts-chd h2{font-size:22px;font-weight:600;letter-spacing:-.5px;margin:0}.ts-chd p{color:var(--tk-50);margin:2px 0 0;font-size:14px}.ts-chd>div:first-child{flex:1}
.ts-ring{width:54px;height:54px;flex-shrink:0}
.ts-cg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.ts-cg .span2{grid-column:1/-1}
.ts-pan{background:#fff;border:1.5px solid var(--tk-bd);border-radius:22px;padding:30px 32px;margin-bottom:20px;font-family:"Poppins",system-ui,sans-serif}
.ts-pan h2{font-size:26px;font-weight:600;letter-spacing:-.8px;margin:0}.ts-pan>p{color:var(--tk-50);margin:6px 0 0;max-width:560px}
.ts-sc{display:flex;gap:16px;align-items:center;padding:16px 18px;border:1.5px solid var(--tk-bd);border-radius:16px;margin-top:12px}.ts-sc.done{background:var(--tk-sun);border-color:transparent}
.ts-sc .ts-n{width:30px;height:30px;font-size:13px}.ts-sc.done .ts-n{background:var(--tk-mint);border-color:var(--tk-mint);color:#06231e}.ts-sc .t{flex:1;min-width:0}.ts-sc .t b{font-weight:600;display:block}.ts-sc .t small{color:var(--tk-50);font-size:13px}
.ts-skel{opacity:.5;margin-top:22px}.ts-skel .r{height:46px;border-radius:12px;background:#EFEEE9;margin-bottom:10px}.ts-skel .t{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.ts-skel .t i{height:70px;border-radius:16px;background:#EFEEE9}
.ts-pick{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:26px}
.ts-pk{display:flex;flex-direction:column;gap:6px;text-align:left;padding:20px;background:#fff;border:1.5px solid var(--tk-bd);border-radius:18px;position:relative;font:inherit;color:inherit}
button.ts-pk{cursor:pointer}button.ts-pk:hover{border-color:var(--tk-ink)}.ts-pk.on{border-color:var(--tk-ink);box-shadow:4px 5px 0 var(--tk-ink);transform:translate(-2px,-2px)}
.ts-pk b{font-size:17px;font-weight:600}.ts-pk .d{color:var(--tk-50);font-size:13.5px}.ts-pk .l{color:var(--tk-50);font-size:12.5px;margin-top:8px;border-top:1px solid var(--tk-bd);padding-top:10px}
.ts-pk .bx{position:absolute;top:16px;right:16px;width:24px;height:24px;border-radius:7px;border:1.5px solid var(--tk-30);display:grid;place-items:center;color:#fff}.ts-pk.on .bx{background:var(--tk-ink);border-color:var(--tk-ink)}.ts-pk.fixed .bx{background:var(--tk-mint);border-color:var(--tk-mint);color:#06231e}
.ts-stk{display:flex;flex-direction:column;gap:14px;margin-top:26px}
@media(max-width:820px){.ts-sheet{flex-direction:column;height:calc(100vh - 32px)}.ts-side{width:auto;padding:16px;flex-direction:row;overflow-x:auto;gap:6px;border-right:0;border-bottom:1px solid var(--tk-bd)}.ts-side .ts-eyebrow,.ts-side .ts-sn,.ts-side .ts-sd,.ts-sn2{display:none}.ts-steps{flex-direction:row}.ts-stp{white-space:nowrap}.ts-body{padding:0 20px 16px}.ts-foot{padding:14px 20px}.ts-g2,.ts-cg,.ts-pick{grid-template-columns:1fr}.ts-ov{padding:12px}}
@media(prefers-reduced-motion:reduce){.ts-sheet,.ts-ov{animation:none}}
`;
var sty=document.createElement('style');sty.textContent=CSS;(document.head||document.documentElement).appendChild(sty);

/* ── model ── */
var VOICES=[['shubh','Shubh','Male · Hindi'],['priya','Priya','Female · Hindi'],['allie','Allie','Female · English'],['marcus','Marcus','Male · English'],['leo','Leo','Male · English']];
var SVC={
 enq:{n:'Enquiries',d:'Answers questions about your hours, location and menu, and passes anything else to your team.'},
 res:{n:'Reservations',d:'Takes table requests and bookings by phone.',off:'Not included. Add it any time.'},
 ord:{n:'Ordering',d:'Takes pickup and delivery orders by phone, with payment.',off:'Not included. Add it any time.'},
 go:{n:'Go live',d:'Subscribe and forward your phone line so the agent answers.'}};
var STEPS={
 enq:[['faq','Check the answers','What the agent tells callers about your restaurant.'],['agent','Name and voice','Who callers hear when the agent picks up.']],
 res:[['rules','Booking rules','How many bookings, party sizes and how much notice.']],
 ord:[['menu','Menu','Import it or upload it. The agent reads it to callers.'],['svc','Pickup and delivery','Prep time, delivery area, fee and minimum.'],['tax','Taxes','The rate the agent reads out in the total. 0% is fine.'],['pay','Payments','How callers pay for an order.']],
 go:[['sub','Subscribe','Activates the agent. Nothing is billed before this.'],['fwd','Forward your phone line','So the agent answers your restaurant’s calls.']]};
var NUM='+1 (312) 555-0147';
TS.cfg={outlets:13,price:350};

function fresh(){return{
 svc:{res:true,ord:true},
 d:{brand:'ROSSA Pizzeria',faqs:[['Do you have gluten-free crusts?','Yes, on any 12-inch pizza.'],['Can you host a private party?','Yes, up to 40 guests.']],
  agent:{name:'Novi',voice:'shubh',greet:''},
  res:{perDay:50,win:30,minP:1,maxP:12,dur:90,notice:60},
  menu:{src:null,n:0},
  svc:{pick:true,prep:20,del:false,mi:3,fee:3,min:15,all:true},
  tax:{rate:8.75,incl:false},
  pay:{online:true,cash:true,conn:false},
  fwd:'busy'},
 done:{},sub:false};}
var s=fresh(),L=[];
var UI={open:false,svc:null,step:null,stage:'form',mp:null,err:''};

TS.get=function(){return s;};
TS.on=function(f){L.push(f);};
function emit(){L.forEach(function(f){try{f(s);}catch(e){console.error(e);}});draw();}
function bcast(){if(window.parent!==window){try{window.parent.postMessage({tringg:'state',s:JSON.parse(JSON.stringify(s))},'*');}catch(e){}}}
TS.set=function(fn){fn(s);emit();bcast();};
window.addEventListener('message',function(e){var m=e.data;if(!m||!m.tringg)return;
 if(m.tringg==='state'&&m.s){s=m.s;emit();}
 if(m.tringg==='reset'){s=fresh();UI.open=false;emit();}});
TS.hello=function(){if(window.parent!==window){try{window.parent.postMessage({tringg:'hello'},'*');}catch(e){}}};

TS.sel=function(k){return k==='enq'||k==='go'||!!s.svc[k];};
TS.stat=function(k){var a=STEPS[k],d=a.filter(function(x){return s.done[k+'.'+x[0]];}).length;return{done:d,total:a.length,left:a.length-d,complete:d===a.length};};
TS.nextStep=function(k){var x=STEPS[k].filter(function(x){return !s.done[k+'.'+x[0]];})[0];return x?x[0]:null;};
TS.ready=function(k){return TS.sel(k)&&TS.stat(k).complete;};
TS.live=function(k){return k==='enq'?s.sub:TS.ready(k)&&s.sub;};
TS.allDone=function(){return ['enq','res','ord'].every(function(k){return !TS.sel(k)||TS.stat(k).complete;})&&s.sub&&!!s.done['go.fwd'];};
TS.totals=function(){var d=0,t=0;['enq','res','ord','go'].forEach(function(k){if(!TS.sel(k))return;var x=TS.stat(k);d+=x.done;t+=x.total;});return{done:d,total:t};};
TS.toggle=function(k){TS.set(function(x){x.svc[k]=!x.svc[k];});};
TS.add=function(k){if(!s.svc[k])TS.set(function(x){x.svc[k]=true;});TS.open(k);};
TS.reset=function(){TS.set(function(x){var f=fresh();Object.keys(x).forEach(function(k){delete x[k];});Object.assign(x,f);});UI.open=false;draw();};
TS.fill=function(){TS.set(function(x){['enq','res','ord','go'].forEach(function(k){STEPS[k].forEach(function(t){x.done[k+'.'+t[0]]=true;});});x.sub=true;x.d.menu={src:'google',n:31};x.d.pay.conn=true;});};

/* ── helpers ── */
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var CHK='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
var XI='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
function get(p){return p.split('.').reduce(function(o,k){return o[k];},s.d);}
TS.v=function(p,val,kind){var a=p.split('.'),k=a.pop(),o=a.reduce(function(o,k){return o[k];},s.d);if(kind==='n')val=Number(val);if(kind==='n'&&isNaN(val))val=0;o[k]=val;UI.err='';bcast();};
TS.vr=function(p,val,kind){TS.v(p,val,kind);draw();};   /* same, but redraw (toggles) */
var fld=function(p,l,o){o=o||{};var v=get(p);return '<label class="ts-f"><span>'+l+'</span><input class="ts-in" type="'+(o.t||'number')+'" '+(o.min!=null?'min="'+o.min+'" ':'')+(o.max!=null?'max="'+o.max+'" ':'')+'value="'+esc(v)+'" onchange="TS.v(\''+p+'\',this.value,\''+(o.t==='text'?'s':'n')+'\')">'+(o.h?'<small>'+o.h+'</small>':'')+'</label>';};
var selF=function(p,l,opts){var v=get(p);return '<label class="ts-f"><span>'+l+'</span><select class="ts-sel" onchange="TS.v(\''+p+'\',this.value,\'n\')">'+opts.map(function(o){return '<option value="'+o[0]+'" '+(+o[0]===+v?'selected':'')+'>'+o[1]+'</option>';}).join('')+'</select></label>';};
var sw=function(on,click,label){return '<button class="ts-sw" role="switch" aria-checked="'+!!on+'" aria-label="'+label+'" onclick="'+click+'"></button>';};

/* ── step bodies ── */
var BODY={};
BODY['enq.faq']=function(){var f=s.d.faqs;return {t:'Check what the agent will say',s:'We drafted these from your Google listing and website. Fix anything that’s wrong, or add what callers always ask.',
 h:f.map(function(q,i){return '<div class="ts-faq"><input class="ts-in" value="'+esc(q[0])+'" aria-label="Question" onchange="TS.faq('+i+',0,this.value)"><textarea class="ts-ta" rows="2" aria-label="Answer" onchange="TS.faq('+i+',1,this.value)">'+esc(q[1])+'</textarea><button class="ts-link" style="color:var(--tk-50);font-size:12.5px" onclick="TS.faqDel('+i+')">Remove</button></div>';}).join('')+'<button class="ts-btn line sm" onclick="TS.faqAdd()">Add a question</button>'};};
TS.faq=function(i,j,v){s.d.faqs[i][j]=v;bcast();};TS.faqDel=function(i){s.d.faqs.splice(i,1);bcast();draw();};TS.faqAdd=function(){s.d.faqs.push(['','']);bcast();draw();};
BODY['enq.agent']=function(){var a=s.d.agent,g=a.greet||('Thanks for calling '+s.d.brand+', this is '+a.name+'. How can I help you today?');
 return {t:'Name your agent',s:'This is who answers when a caller rings. You can change it any time.',h:
 '<div class="ts-g2"><label class="ts-f"><span>Name</span><input class="ts-in" value="'+esc(a.name)+'" onchange="TS.v(\'agent.name\',this.value.trim()||\'Novi\',\'s\')"></label>'+selF0('Voice',a.voice)+'</div>'+
 '<label class="ts-f" style="margin-top:18px"><span>Greeting</span><textarea class="ts-ta" rows="3" onchange="TS.v(\'agent.greet\',this.value,\'s\')">'+esc(g)+'</textarea><small>This is the first thing callers hear.</small></label>'};};
function selF0(l,v){return '<label class="ts-f"><span>'+l+'</span><select class="ts-sel" onchange="TS.v(\'agent.voice\',this.value,\'s\')">'+VOICES.map(function(o){return '<option value="'+o[0]+'" '+(o[0]===v?'selected':'')+'>'+o[1]+' · '+o[2]+'</option>';}).join('')+'</select></label>';}
BODY['res.rules']=function(){return {t:'Set your booking rules',s:'The agent follows these when it takes a table request. Everything can be changed later in Settings.',h:
 '<div class="ts-g2">'+fld('res.perDay','Max reservations a day',{min:1,max:500})+selF('res.win','Advance booking window',[[7,'7 days'],[14,'14 days'],[30,'30 days'],[60,'60 days'],[90,'90 days']])+fld('res.minP','Min party size',{min:1,max:50})+fld('res.maxP','Max party size',{min:1,max:100})+selF('res.dur','Booking length',[[60,'1 hour'],[90,'1.5 hours'],[120,'2 hours'],[150,'2.5 hours']])+selF('res.notice','Notice needed',[[0,'No notice'],[30,'30 min'],[60,'1 hour'],[120,'2 hours'],[240,'4 hours'],[1440,'1 day']])+'</div>'};};
BODY['ord.menu']=function(){var m=s.d.menu;
 if(UI.mp==='busy')return {t:'Reading your menu',s:'This takes a few seconds.',h:'<div class="ts-busy"><b>Importing…</b><div class="ts-bar"><i id="ts-pb" style="width:8%"></i></div><small style="color:var(--tk-50)">Items, sizes, prices and choices</small></div>'};
 if(UI.mp==='review'){return {t:m.n+' items imported',s:'Imported as a draft. Review and publish it, or fine-tune it in Menu any time.',h:
  [['Pizza',9],['Pasta',6],['Starters',7],['Salads',4],['Desserts',3],['Drinks',2]].map(function(c){return '<div class="ts-cat"><span>'+c[0]+'</span><span>'+c[1]+' items</span></div>';}).join('')+'<div class="ts-note">Source: '+({google:'Google Business Profile',pos:'Your POS',upload:'Uploaded photos'}[m.src]||'Import')+'. <button class="ts-link" onclick="TS.menuAgain()">Import a different way</button></div>'};}
 var o=function(k,t,d,tag){return '<button class="ts-opt" onclick="TS.menuPick(\''+k+'\')"><span class="ts-rad"></span><span><b>'+t+(tag?'<span class="ts-tag">'+tag+'</span>':'')+'</b><span class="d">'+d+'</span></span></button>';};
 return {t:'How would you like to add your menu?',s:'Whatever we import lands as a draft you can edit before it goes live.',h:
  o('google','Your Google profile menu','We found a menu on your Google Business Profile, which you already connected. 31 items found.','Quickest')+o('pos','Connect your POS','Items, prices and sold-out status stay in sync. Works with Toast, Square and Clover.')+o('upload','Upload photos or a PDF','We read it and build a draft for you.')};};
TS.menuPick=function(k){UI.mp='busy';draw();var n=({google:31,pos:42,upload:28})[k],p=8,t=setInterval(function(){p+=22;var b=document.getElementById('ts-pb');if(b)b.style.width=Math.min(p,100)+'%';if(p>=100){clearInterval(t);if(UI.mp==='busy'&&UI.open){s.d.menu={src:k,n:n};UI.mp='review';bcast();draw();}}},300);};
TS.menuAgain=function(){UI.mp='choose';draw();};
BODY['ord.svc']=function(){var q=s.d.svc,N=TS.cfg.outlets;
 return {t:'Pickup and delivery',s:'Callers who want a service that is off are offered the other. Delivery area can be refined on a map later.',h:
 '<div class="ts-tg"><div><b>Pickup</b><span class="d">Ready in <input class="ts-in s" type="number" min="5" step="5" value="'+q.prep+'" onchange="TS.v(\'svc.prep\',this.value,\'n\')"> min after the order is accepted</span></div>'+sw(q.pick,"TS.vr('svc.pick',"+!q.pick+")",'Pickup')+'</div>'+
 '<div class="ts-tg"><div><b>Delivery</b>'+(q.del?'<span class="d">Within <input class="ts-in s" type="number" min="0.5" step="0.5" value="'+q.mi+'" onchange="TS.v(\'svc.mi\',this.value,\'n\')"> mi · fee $<input class="ts-in s" type="number" min="0" step="0.5" value="'+q.fee+'" onchange="TS.v(\'svc.fee\',this.value,\'n\')"> · minimum $<input class="ts-in s" type="number" min="0" value="'+q.min+'" onchange="TS.v(\'svc.min\',this.value,\'n\')"></span>':'<span class="d">Off. Callers are offered pickup.</span>')+'</div>'+sw(q.del,"TS.vr('svc.del',"+!q.del+")",'Delivery')+'</div>'+
 (N>1?'<div class="ts-tg"><div><b>Use for all '+N+' locations</b><span class="d">Each location can change its own later. Locations you add afterwards start empty.</span></div>'+sw(q.all,"TS.vr('svc.all',"+!q.all+")",'Apply to all')+'</div>':'')};};
BODY['ord.tax']=function(){var t=s.d.tax;return {t:'Taxes',s:'The agent reads out the total including tax. If you don’t charge any, 0% is fine.',h:
 '<div class="ts-g2">'+fld('tax.rate','Sales tax rate (%)',{min:0,max:40,h:'Applied to every order'})+'</div><div style="margin-top:20px"><div class="ts-f"><span>Prices on your menu</span></div>'+
 '<button class="ts-opt" style="margin-top:8px" onclick="TS.vr(\'tax.incl\',false)"><span class="ts-rad"></span><span><b>Don’t include tax</b><span class="d">Tax is added on top at checkout.</span></span></button>'.replace('class="ts-opt"','class="ts-opt'+(!t.incl?' on':'')+'"')+
 '<button class="ts-opt" onclick="TS.vr(\'tax.incl\',true)"><span class="ts-rad"></span><span><b>Already include tax</b><span class="d">The total never goes above the menu price.</span></span></button>'.replace('class="ts-opt"','class="ts-opt'+(t.incl?' on':'')+'"')+'</div>'};};
BODY['ord.pay']=function(){var p=s.d.pay;return {t:'How should callers pay?',s:'Choose at least one. Card payments are taken securely by text link during the call.',h:
 '<div class="ts-tg"><div><b>Pay online by card</b><span class="d">The caller gets a payment link by text. '+(p.conn?'<span class="ts-tag">Stripe connected</span>':'Needs a Stripe account.')+'</span>'+(p.online&&!p.conn?'<div style="margin-top:10px"><button class="ts-btn line sm" onclick="TS.conn()">Connect Stripe</button></div>':'')+'</div>'+sw(p.online,"TS.vr('pay.online',"+!p.online+")",'Online')+'</div>'+
 '<div class="ts-tg"><div><b>Pay at pickup or cash on delivery</b><span class="d">The caller pays when they collect or receive the order.</span></div>'+sw(p.cash,"TS.vr('pay.cash',"+!p.cash+")",'Cash')+'</div>'};};
TS.conn=function(){s.d.pay.conn=true;bcast();draw();};
BODY['go.sub']=function(){var N=TS.cfg.outlets,P=TS.cfg.price;return {t:s.sub?'You’re subscribed':'Subscribe to activate the agent',s:s.sub?'The agent is active for everything that’s set up.':'Nothing is billed before this. Cancel any time.',h:
 '<div class="ts-price"><div class="big">$'+(N*P).toLocaleString()+' <small>a month</small></div><div style="color:var(--tk-50);font-size:13.5px">'+N+' location'+(N>1?'s':'')+' × $'+P+'</div><ul><li>Enquiries are answered straight away.</li>'+(TS.sel('res')?'<li>Reservations'+(TS.ready('res')?'':' (finish setup to start taking them)')+'.</li>':'')+(TS.sel('ord')?'<li>Ordering'+(TS.ready('ord')?'':' (finish setup to start taking orders)')+'.</li>':'')+'</ul></div>'+
 '<div class="ts-note">You don’t need to finish every step first. A service that isn’t set up yet stays off, and switches on by itself the moment you finish it. No second subscription needed.</div>'};};
BODY['go.fwd']=function(){var m=s.d.fwd,code=(m==='busy'?'*61*':'*21*')+'13125550147#';return {t:'Forward your phone line',s:'Callers keep dialling your restaurant number. Your phone passes the call to the agent.',h:
 '<div class="ts-num"><span class="m">'+NUM+'</span><button class="ts-btn line sm" onclick="TS.copy(this)">Copy</button></div>'+
 '<button class="ts-opt '+(m==='busy'?'on':'')+'" onclick="TS.vr(\'fwd\',\'busy\')"><span class="ts-rad"></span><span><b>When we can’t pick up</b><span class="d">Staff still get calls first. Recommended to start.</span></span></button>'+
 '<button class="ts-opt '+(m==='all'?'on':'')+'" onclick="TS.vr(\'fwd\',\'all\')"><span class="ts-rad"></span><span><b>Every call</b><span class="d">The agent answers everything and hands off to staff when needed.</span></span></button>'+
 '<div class="ts-note">From your restaurant phone, dial <b style="color:var(--tk-ink);font-family:\'JetBrains Mono\',monospace">'+code+'</b>. You can also do this later from Settings.</div>'};};
TS.copy=function(b){try{navigator.clipboard.writeText('+13125550147').catch(function(){});}catch(e){}b.textContent='Copied';setTimeout(function(){if(b.isConnected)b.textContent='Copy';},1400);};
var VAL={
 'enq.faq':function(){return s.d.faqs.some(function(f){return !f[0].trim()||!f[1].trim();})?'Fill in or remove the empty question':'';},
 'ord.menu':function(){return s.d.menu.n?'':'Import your menu first';},
 'ord.svc':function(){var q=s.d.svc;return !q.pick&&!q.del?'Turn on pickup, delivery or both':(q.pick&&!(q.prep>0))?'Add a pickup prep time':(q.del&&!(q.mi>0))?'Add a delivery radius':'';},
 'ord.pay':function(){var p=s.d.pay;return !p.online&&!p.cash?'Choose at least one way to pay':(p.online&&!p.conn)?'Connect Stripe to take card payments, or switch it off':'';},
 'res.rules':function(){var r=s.d.res;return r.minP>r.maxP?'Min party size can’t be above the max':'';}};

/* ── sheet ── */
function root(){var r=document.getElementById('ts-root');if(!r){r=document.createElement('div');r.id='ts-root';document.body.appendChild(r);}return r;}
function cur(){return STEPS[UI.svc];}
function idx(){return cur().map(function(x){return x[0];}).indexOf(UI.step);}
function draw(){
 var r=root();if(!UI.open){r.innerHTML='';return;}
 var k=UI.svc,st=cur(),i=idx(),last=i===st.length-1,key=k+'.'+UI.step,sd=SVC[k];
 var side='<aside class="ts-side"><div class="ts-eyebrow">'+(k==='go'?'Go live':'Set up')+'</div><div class="ts-sn">'+sd.n+'</div><div class="ts-sd">'+esc(sd.d)+'</div><ol class="ts-steps">'+st.map(function(x,j){var dn=s.done[k+'.'+x[0]];return '<li><button class="ts-stp '+(dn?'done':'')+' '+(x[0]===UI.step&&UI.stage==='form'?'on':'')+'" onclick="TS.goto(\''+x[0]+'\')"><span class="ts-n">'+(dn?CHK:j+1)+'</span><b>'+x[1]+'</b></button></li>';}).join('')+'</ol><div class="ts-sn2">Saved as you go. Close this any time and pick up where you left off.</div></aside>';
 var main;
 if(UI.stage==='done'){
  var live=TS.live(k),msg={enq:['Enquiries are ready','The agent answers questions about your restaurant.'],res:['Reservations are set up',live?'The agent takes table requests from its next call.':'Subscribe and the agent starts taking table requests.'],ord:['Ordering is set up',live?'The agent takes orders from its next call.':'Subscribe and the agent starts taking orders.'],go:['You’re live','The agent is active and answering your calls.']}[k];
  main='<div class="ts-body"><div class="ts-ok"><div class="ts-okc">'+CHK.replace('width="14" height="14"','width="30" height="30"')+'</div><h3>'+msg[0]+'</h3><p>'+msg[1]+'</p><div style="display:flex;gap:10px;justify-content:center">'+(!s.sub&&k!=='go'?'<button class="ts-btn line" onclick="TS.open(\'go\',\'sub\')">Subscribe</button>':'')+'<button class="ts-btn" onclick="TS.close()">Done</button></div></div></div>';
 }else{
  var b=BODY[key](),rail=(i>0?'<button class="ts-btn line" onclick="TS.goto(\''+st[i-1][0]+'\')">Back</button>':'');
  var cta=key==='go.sub'?(s.sub?'Continue':'Subscribe · $'+(TS.cfg.outlets*TS.cfg.price).toLocaleString()+'/mo'):key==='go.fwd'?'I’ve set it up':key==='ord.menu'&&UI.mp==='review'?'Publish menu':last?'Save':'Save and continue';
  var dis=(key==='ord.menu'&&UI.mp!=='review')?'disabled':'';
  main='<div class="ts-top"><button class="ts-xb" aria-label="Close" onclick="TS.close()">'+XI+'</button></div><div class="ts-body"><h2 class="ts-h">'+b.t+'</h2><p class="ts-sub">'+b.s+'</p>'+b.h+'</div><div class="ts-foot">'+rail+'<span class="sp"></span><span class="ts-err" role="alert">'+esc(UI.err)+'</span>'+(!last&&!(key==='ord.menu'&&UI.mp==='busy')?'<button class="ts-btn ghost" onclick="TS.skip()">Skip for now</button>':'')+'<button class="ts-btn" '+dis+' onclick="TS.save()">'+cta+'</button></div>';
 }
 r.innerHTML='<div class="ts-ov" onmousedown="if(event.target===this)TS.close()"><div class="ts-sheet" role="dialog" aria-modal="true" aria-label="Set up '+esc(sd.n)+'">'+side+'<section class="ts-main">'+main+'</section></div></div>';
}
TS.open=function(k,id){
 if(k!=='enq'&&k!=='go'&&!s.svc[k]){s.svc[k]=true;bcast();L.forEach(function(f){f(s);});}
 UI={open:true,svc:k,step:id||TS.nextStep(k)||STEPS[k][0][0],stage:'form',mp:null,err:''};setMp();draw();};
function setMp(){if(UI.svc==='ord'&&UI.step==='menu')UI.mp=s.d.menu.n?'review':'choose';}
TS.close=function(){UI.open=false;draw();};
TS.goto=function(id){UI.step=id;UI.stage='form';UI.err='';setMp();draw();};
TS.skip=function(){var i=idx();if(i<cur().length-1){UI.step=cur()[i+1][0];UI.err='';setMp();draw();}else TS.close();};
TS.save=function(){var key=UI.svc+'.'+UI.step,e=VAL[key]?VAL[key]():'';if(e){UI.err=e;draw();return;}
 var k=UI.svc,id=UI.step;
 TS.set(function(x){x.done[key]=true;if(key==='go.sub')x.sub=true;});
 var nx=TS.nextStep(k);
 if(key==='go.sub'&&nx){UI.step=nx;UI.err='';setMp();draw();return;}
 if(nx){UI.step=nx;UI.err='';setMp();}else UI.stage='done';
 draw();};
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&UI.open)TS.close();});

/* ── blocks placed in host pages ── */
var pill=function(k){var x=TS.stat(k);
 if(k==='enq')return '<span class="ts-pl g">Always on</span>';
 if(!TS.sel(k))return '<span class="ts-pl">Off</span>';
 if(!x.complete)return '<span class="ts-pl a">'+(x.done?x.done+' of '+x.total+' done':'Not started')+'</span>';
 return s.sub?'<span class="ts-pl g">Live</span>':'<span class="ts-pl g">Ready</span>';};
function ring(d,t,sz){var C=2*Math.PI*21,p=t?d/t:0;return '<svg class="ts-ring" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="21" fill="none" stroke="#EAE9E4" stroke-width="6"/><circle cx="27" cy="27" r="21" fill="none" stroke="#4FC2B4" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(C*p).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 27 27)"/><text x="27" y="31.5" text-anchor="middle" font-size="13" font-weight="700" fill="#111" font-family="Poppins,sans-serif">'+d+'/'+t+'</text></svg>';}
function rowsOf(k){return STEPS[k].map(function(x,j){var dn=s.done[k+'.'+x[0]];return '<button class="ts-row '+(dn?'done':'')+'" onclick="TS.open(\''+k+'\',\''+x[0]+'\')"><span class="ts-n">'+(dn?CHK:j+1)+'</span><span class="t"><b>'+x[1]+'</b><small>'+x[2]+'</small></span><span class="go">'+(dn?'Edit':'Start')+'</span></button>';}).join('');}
/* a service as a card: header, progress, the steps, one button */
TS.card=function(k,o){o=o||{};var on=TS.sel(k),x=TS.stat(k),lbl=!on?'':x.complete?'Review':x.done?'Continue':'Start setup';
 var tog=(o.toggle&&(k==='res'||k==='ord'))?sw(on,"TS.toggle('"+k+"')",SVC[k].n):'';
 return '<div class="ts-card '+(on?'':'off')+'"><div class="ts-ch"><div><div class="ts-ct">'+SVC[k].n+' '+pill(k)+'</div><div class="ts-cd">'+(on?SVC[k].d:SVC[k].off)+'</div></div>'+tog+'</div>'+
  (on?'<div class="ts-prog"><div class="ts-bar"><i style="width:'+(x.total?x.done/x.total*100:0)+'%"></i></div></div><div class="ts-rows">'+rowsOf(k)+'</div><div class="ts-cf"><button class="ts-btn '+(x.complete?'line':'')+'" onclick="TS.open(\''+k+'\')">'+lbl+'</button></div>':(o.toggle?'':'<div class="ts-cf"><button class="ts-btn line" onclick="TS.add(\''+k+'\')">Add '+SVC[k].n.toLowerCase()+'</button></div>'))+'</div>';};
/* onboarding, light: just pick services and see what comes next */
TS.pick=function(){var N={res:'1 step: booking rules',ord:'4 steps: menu, pickup and delivery, taxes, payments',enq:'2 steps: check the answers, name and voice'};
 return '<div class="ts-pick">'+['enq','res','ord'].map(function(k){var on=TS.sel(k);return (k==='enq'?'<div class="ts-pk on fixed">':'<button class="ts-pk '+(on?'on':'')+'" onclick="TS.toggle(\''+k+'\')" aria-pressed="'+on+'">')+'<span class="bx">'+CHK+'</span><b>'+SVC[k].n+'</b><span class="d">'+SVC[k].d+'</span><span class="l">'+(k==='enq'?'Always on · ':'')+N[k]+'</span>'+(k==='enq'?'</div>':'</button>');}).join('')+'</div>';};
/* dashboard: what is still open, as quiet one-line rows */
TS.items=function(){var a=[];['enq','res','ord'].forEach(function(k){if(TS.sel(k)){var x=TS.stat(k);if(!x.complete)a.push({k:k,t:'Finish '+SVC[k].n.toLowerCase()+' setup',m:x.left+' step'+(x.left>1?'s':'')+' left',c:'Continue',f:"TS.open('"+k+"')"});}});
 if(!s.sub)a.push({k:'go',t:a.length?'Subscribe to go live':'Everything is ready. Subscribe to go live',m:'Nothing is billed before this',c:'Go live',f:"TS.open('go','sub')"});
 else if(!s.done['go.fwd'])a.push({k:'go',t:'Forward your phone line',m:'So the agent answers your calls',c:'Set up',f:"TS.open('go','fwd')"});
 return a;};
TS.strip=function(only){var a=TS.items().filter(function(i){return !only||i.k===only;});if(!a.length)return '';
 return '<div class="ts-strip">'+a.map(function(i){return '<div class="ts-srow"><span class="dot"></span><span class="m"><b>'+i.t+'</b> · '+i.m+'</span><button class="ts-btn sm" onclick="'+i.f+'">'+i.c+'</button></div>';}).join('')+'</div>';};
TS.pillHTML=function(){var live=s.sub&&s.done['go.fwd'];if(live)return '';
 return s.sub?'<div class="live"><span class="d" style="background:#E9B44C"></span>Subscribed · forward your line<button style="color:#fff;font-weight:600;text-decoration:underline;padding:0 6px" onclick="TS.open(\'go\',\'fwd\')">Set up</button></div>':'<div class="live"><span class="d" style="background:#E9B44C"></span>Not live yet<button style="color:#fff;font-weight:600;text-decoration:underline;padding:0 6px" onclick="TS.open(\'go\',\'sub\')">Go live</button></div>';};
/* variant C: the overview is the setup page */
TS.center=function(){if(TS.allDone())return '';var t=TS.totals();
 return '<section class="ts-center"><div class="ts-chd"><div><h2>Set up '+esc(s.d.agent.name)+'</h2><p>'+(t.total-t.done)+' step'+(t.total-t.done===1?'':'s')+' left. Every step opens right here, so you never leave this page.</p></div>'+ring(t.done,t.total)+'</div><div class="ts-cg">'+['enq','res','ord'].map(function(k){return TS.card(k,{toggle:true});}).join('')+TS.goCard()+'</div></section>';};
TS.goCard=function(){var x=TS.stat('go');return '<div class="ts-card"><div class="ts-ch"><div><div class="ts-ct">Go live '+(x.complete?'<span class="ts-pl g">Live</span>':'<span class="ts-pl a">'+(x.done?'1 of 2 done':'Not started')+'</span>')+'</div><div class="ts-cd">'+SVC.go.d+'</div></div></div><div class="ts-rows">'+rowsOf('go')+'</div></div>';};
/* variant B: a short status list on the overview, each row leads to the module that owns the steps */
TS.status=function(){if(TS.allDone())return '';var rows=[['enq','Enquiries',"TS.open('enq')"],['res','Reservations',"TS.nav('reservations')"],['ord','Ordering',"TS.nav('orders')"]].filter(function(r){return TS.sel(r[0]);}).map(function(r){var x=TS.stat(r[0]);return '<button class="ts-row '+(x.complete?'done':'')+'" onclick="'+r[2]+'"><span class="ts-n">'+(x.complete?CHK:'\u2022')+'</span><span class="t"><b>'+r[1]+'</b><small>'+(x.complete?'Set up':x.left+' step'+(x.left>1?'s':'')+' left · finish in '+(r[0]==='enq'?'a sheet':'its own tab'))+'</small></span><span class="go">'+(x.complete?'Open':'Continue')+'</span></button>';}).join('');
 var g=!s.sub?'<button class="ts-row" onclick="TS.open(\'go\',\'sub\')"><span class="ts-n">→</span><span class="t"><b>Go live</b><small>Subscribe and forward your line. Nothing is billed before this.</small></span><span class="go">Go live</span></button>':!s.done['go.fwd']?'<button class="ts-row" onclick="TS.open(\'go\',\'fwd\')"><span class="ts-n">→</span><span class="t"><b>Forward your phone line</b><small>So the agent answers your calls.</small></span><span class="go">Set up</span></button>':'';
 return '<div class="ts-card" style="margin-bottom:20px"><div class="ts-ct">Your setup</div><div class="ts-cd">Each area is set up on its own tab. Pick one to continue.</div><div class="ts-rows">'+rows+g+'</div></div>';};
/* variant B: a module page that is the setup */
TS.panel=function(k,what){var x=TS.stat(k),n=SVC[k].n,nx=TS.nextStep(k);
 var steps=STEPS[k].map(function(t,j){var dn=s.done[k+'.'+t[0]];return '<div class="ts-sc '+(dn?'done':'')+'"><span class="ts-n">'+(dn?CHK:j+1)+'</span><span class="t"><b>'+t[1]+'</b><small>'+t[2]+'</small></span><button class="ts-btn sm '+(dn?'line':'')+'" onclick="TS.open(\''+k+'\',\''+t[0]+'\')">'+(dn?'Edit':t[0]===nx?'Start':'Open')+'</button></div>';}).join('');
 var tail=x.complete?(s.sub?'':'<div class="ts-sc" style="background:var(--tk-mint-50);border-color:transparent"><span class="t"><b>All steps done. Ready to go live.</b><small>Subscribe and the agent starts taking '+what+'.</small></span><button class="ts-btn sm" onclick="TS.open(\'go\',\'sub\')">Go live</button></div>'):'';
 return '<div class="scroll"><div class="page" style="max-width:860px"><div class="ts-pan"><div style="display:flex;gap:20px;align-items:center"><div style="flex:1"><h2>'+(x.complete?n+' is set up':'Set up '+n.toLowerCase())+'</h2><p>'+(x.complete?'Everything this tab needs is done.':x.total+' step'+(x.total>1?'s':'')+' and the agent can take '+what+'. Each one opens here, so you stay on this page.')+'</p></div>'+ring(x.done,x.total)+'</div>'+steps+tail+'</div>'+TS.skel(k)+'</div></div>';};
TS.skel=function(k){return '<div class="ts-skel" aria-hidden="true"><div class="t"><i></i><i></i><i></i><i></i></div><div class="r"></div><div class="r"></div><div class="r"></div><div style="text-align:center;font-size:12.5px;color:var(--tk-50);margin-top:8px">'+(k==='ord'?'Orders':'Reservations')+' will appear here</div></div>';};
/* variants A and C: the module page is dimmed behind one slim row */
TS.bar=function(k,what,preview){var x=TS.stat(k),ready=x.complete;
 return '<div class="modoff"><div class="mo-b"><div><b>'+(ready?SVC[k].n+' is set up.':'Finish '+SVC[k].n.toLowerCase()+' setup to start taking '+what+'.')+'</b> '+(ready?'Subscribe to go live.':x.left+' step'+(x.left>1?'s':'')+' left.')+'</div><button class="btn btn-dark btn-sm" onclick="TS.open(\''+(ready?'go':k)+'\''+(ready?",'sub'":'')+')">'+(ready?'Go live':x.done?'Continue setup':'Start setup')+'</button></div><div class="mo-c" inert>'+TS.skel(k)+'</div></div>';};
})();

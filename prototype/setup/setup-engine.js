/* Tringg setup engine.
   One model of "what is left to set up", shared by the onboarding frame and the dashboard frame.
   Enquiries are already set up in onboarding (details + frequently asked questions), so only
   Reservations and Ordering have steps. Every step opens in a sheet on top of the current screen.
   Step fields mirror the real Settings screens. State lives in the wrapper and is mirrored into both
   frames with postMessage. */
(function(){
'use strict';
var TS=window.TS={};
TS.variant=window.TS_VARIANT||'A';
TS.nav=function(){};

var CSS=`
:root{--tk-ink:#111;--tk-mint:#4FC2B4;--tk-mint-d:#1F6E62;--tk-mint-50:#DDF2EE;--tk-bd:#E6E4DE;--tk-bd2:#D6D4CD;--tk-50:#6B6B6B;--tk-30:#A3A3A0;--tk-sun:#F5F4EF;--tk-amb:#9A6A12;--tk-amb-bg:#FFF1CF;--tk-red:#A12E2E}
.ts-ov{position:fixed;inset:0;z-index:900;background:rgba(17,17,17,.46);display:flex;align-items:center;justify-content:center;padding:24px;animation:tsfade .18s ease both}
@keyframes tsfade{from{opacity:0}to{opacity:1}}@keyframes tsup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.ts-sheet{width:100%;max-width:700px;max-height:calc(100vh - 48px);background:#fff;border-radius:22px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 80px -20px rgba(0,0,0,.5);animation:tsup .24s cubic-bezier(.2,.7,.2,1) both;font-family:"Poppins",system-ui,sans-serif;color:var(--tk-ink);font-size:14px;line-height:1.5}
.ts-hd{display:flex;align-items:center;gap:14px;padding:20px 24px 0 32px}.ts-hd>div{flex:1;min-width:0}
.ts-eyebrow{font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--tk-50)}
.ts-dots{display:flex;gap:6px;align-items:center;margin-top:8px}.ts-dots button{width:30px;height:5px;border-radius:5px;border:0;background:#E3E1DB;cursor:pointer;padding:0}
.ts-dots button:disabled{cursor:default}.ts-dots button.done{background:var(--tk-mint)}.ts-dots button.on{background:var(--tk-ink)}.ts-dots span{font-size:12px;color:var(--tk-50);margin-left:6px}
.ts-xb{width:34px;height:34px;border-radius:10px;border:0;background:none;cursor:pointer;display:grid;place-items:center;color:var(--tk-50);align-self:flex-start}.ts-xb:hover{background:var(--tk-sun);color:var(--tk-ink)}
.ts-body{flex:1;overflow:auto;padding:18px 32px 24px}
.ts-h{font-size:26px;font-weight:600;letter-spacing:-.8px;line-height:1.2;margin:0 0 18px}
.ts-foot{display:flex;align-items:center;gap:12px;padding:18px 32px 24px}
.ts-foot .sp{flex:1}.ts-err{color:var(--tk-red);font-size:13px;font-weight:500}
.ts-btn{height:44px;padding:0 22px;border-radius:12px;border:1.5px solid var(--tk-ink);background:var(--tk-ink);color:#fff;font:inherit;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;text-decoration:none;transition:transform .15s,box-shadow .15s}
.ts-btn:hover:not(:disabled){transform:translate(-2px,-2px);box-shadow:4px 5px 0 #fff,4px 5px 0 1.5px rgba(17,17,17,.16)}
.ts-btn.line:hover:not(:disabled){box-shadow:4px 5px 0 var(--tk-ink)}
.ts-btn.line{background:#fff;color:var(--tk-ink)}.ts-btn.sm{height:34px;padding:0 14px;font-size:13px;border-radius:10px}.ts-btn.sm:hover:not(:disabled){box-shadow:3px 4px 0 #fff,3px 4px 0 1.5px rgba(17,17,17,.16)}.ts-btn.sm.line:hover:not(:disabled){box-shadow:3px 4px 0 var(--tk-ink)}
.ts-btn.ghost{border-color:transparent;background:none;color:var(--tk-50)}.ts-btn.ghost:hover:not(:disabled){transform:none;box-shadow:none;background:var(--tk-sun);color:var(--tk-ink)}
.ts-btn:disabled{opacity:.35;cursor:not-allowed}
.ts-g2{display:grid;grid-template-columns:1fr 1fr;gap:18px 16px}
.ts-f{display:flex;flex-direction:column;gap:7px}.ts-f>span{font-size:13.5px;font-weight:500}
.ts-in,.ts-sel,.ts-ta{width:100%;border:1.5px solid var(--tk-bd);background:#fff;border-radius:12px;padding:0 14px;height:46px;font:inherit;color:inherit;outline:0}
.ts-ta{height:auto;padding:12px 14px;resize:none;line-height:1.55}.ts-in:focus,.ts-sel:focus,.ts-ta:focus{border-color:var(--tk-ink)}
.ts-in.s{width:84px;height:40px;padding:0 10px}.ts-in.m{width:110px;height:40px;padding:0 10px}
.ts-sel{appearance:none;-webkit-appearance:none;padding-right:38px;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center}
.ts-seg{display:inline-flex;background:var(--tk-sun);border-radius:12px;padding:3px;gap:2px;flex-wrap:wrap}.ts-seg button{border:0;background:none;font:inherit;font-size:13px;font-weight:500;padding:7px 14px;border-radius:9px;cursor:pointer;color:var(--tk-50)}
.ts-seg button.on{background:#fff;color:var(--tk-ink);box-shadow:0 1px 2px rgba(0,0,0,.08)}.ts-seg button:disabled{opacity:.4;cursor:not-allowed}
.ts-opt{display:flex;gap:14px;align-items:flex-start;width:100%;text-align:left;padding:14px 18px;margin-bottom:10px;background:#fff;border:1.5px solid var(--tk-bd);border-radius:16px;cursor:pointer;font:inherit;color:inherit;transition:transform .15s,box-shadow .15s,border-color .15s}
.ts-opt:hover{border-color:var(--tk-ink);transform:translate(-2px,-2px);box-shadow:4px 5px 0 var(--tk-ink)}.ts-opt.on{border-color:var(--tk-ink);box-shadow:4px 5px 0 var(--tk-ink);transform:translate(-2px,-2px)}
.ts-opt b{display:block;font-weight:600}.ts-opt .d{color:var(--tk-50);font-size:13px;display:block}
.ts-rad{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--tk-30);flex-shrink:0;margin-top:2px;display:grid;place-items:center}.ts-opt.on .ts-rad{border-color:var(--tk-ink)}.ts-opt.on .ts-rad::after{content:"";width:10px;height:10px;border-radius:50%;background:var(--tk-ink)}
.ts-tag{font-size:11px;font-weight:600;color:var(--tk-mint-d);background:var(--tk-mint-50);border-radius:999px;padding:2px 9px;margin-left:8px;vertical-align:middle}
.ts-tg{display:flex;align-items:center;gap:20px;padding:15px 0;border-top:1px solid var(--tk-bd)}.ts-tg:first-child{border-top:0;padding-top:0}
.ts-tg>div:first-child{flex:1;min-width:0}.ts-tg b{font-weight:600;display:block}.ts-tg .d{color:var(--tk-50);font-size:13px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:3px}
.ts-tg .r{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
.ts-sw{position:relative;width:46px;height:26px;border-radius:999px;background:var(--tk-bd2);flex-shrink:0;border:0;cursor:pointer;transition:background .2s}
.ts-sw::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .2s}
.ts-sw[aria-checked=true]{background:var(--tk-mint)}.ts-sw[aria-checked=true]::after{transform:translateX(20px)}.ts-sw:disabled{opacity:.4;cursor:not-allowed}
.ts-sub{margin-top:14px;padding-top:16px;border-top:1px solid var(--tk-bd)}
.ts-suf{display:inline-flex;align-items:center;gap:6px;color:var(--tk-50);font-size:13px}
.ts-link{border:0;background:none;color:var(--tk-mint-d);font:inherit;font-weight:500;cursor:pointer;padding:0}.ts-link:hover{opacity:.7}
.ts-bar{height:5px;border-radius:5px;background:#EAE9E4;overflow:hidden}.ts-bar i{display:block;height:100%;background:var(--tk-mint);border-radius:5px;transition:width .5s}
.ts-busy{padding:40px 0;text-align:center}.ts-busy .ts-bar{max-width:280px;margin:16px auto 0}
.ts-cat{display:flex;justify-content:space-between;padding:11px 0;border-top:1px solid var(--tk-bd);font-size:14px}.ts-cat:first-child{border-top:0}.ts-cat span:last-child{color:var(--tk-50)}
.ts-ok{text-align:center;padding:36px 20px 24px}.ts-okc{width:60px;height:60px;border-radius:50%;background:var(--tk-mint);display:grid;place-items:center;margin:0 auto 18px;color:#06231e}
.ts-ok h3{font-size:24px;font-weight:600;letter-spacing:-.6px;margin:0 0 20px}
.ts-num{display:flex;align-items:center;gap:14px;padding:14px 18px;border:1.5px solid var(--tk-bd);border-radius:14px;margin-bottom:16px}.ts-num .m{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:20px}.ts-num .ts-btn{margin-left:auto}
.ts-price{font-size:34px;font-weight:600;letter-spacing:-1px}.ts-price small{font-size:14px;font-weight:400;color:var(--tk-50);letter-spacing:0}
.ts-res{background:var(--tk-sun);border-radius:12px;padding:10px 14px;font-size:13px;margin-top:6px}
/* the Tringg wordmark, and what happens when you click it */
html .logo{display:inline-block;cursor:pointer;user-select:none;-webkit-user-select:none;font-weight:700;letter-spacing:-1.5px;line-height:1;transform:rotate(-3deg);transform-origin:left bottom;transition:transform .2s cubic-bezier(.3,1.6,.5,1),filter .2s;
 background:linear-gradient(120deg,#7FE8D8 0%,#4FC2B4 45%,#D7F26B 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;text-shadow:none;-webkit-text-stroke:1.4px #0a0a0a;filter:drop-shadow(2px 3px 0 #0a0a0a)}
html .logo:hover{transform:rotate(-6deg) scale(1.07)}html .logo:active{transform:rotate(-2deg) scale(.96)}
html .rail-top .logo{-webkit-text-stroke:0;filter:drop-shadow(2px 2px 0 rgba(79,194,180,.35))}
#ts-fx{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2000}
/* cards, strips and panels placed in the host pages */
.ts-card{background:#fff;border:1.5px solid var(--tk-bd);border-radius:20px;padding:22px 24px;font-family:"Poppins",system-ui,sans-serif;color:var(--tk-ink);font-size:14px;line-height:1.5;text-align:left}
.ts-card.off{background:transparent;border-style:dashed}
.ts-ch{display:flex;align-items:flex-start;gap:16px}.ts-ch>div:first-child{flex:1;min-width:0}
.ts-ct{font-size:17px;font-weight:600;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.ts-cd{color:var(--tk-50);font-size:13.5px;margin-top:2px}
.ts-pl{font-size:11.5px;font-weight:600;border-radius:999px;padding:3px 10px;background:#EAE9E4;color:var(--tk-50);white-space:nowrap}
.ts-pl.g{background:var(--tk-mint-50);color:var(--tk-mint-d)}.ts-pl.a{background:var(--tk-amb-bg);color:var(--tk-amb)}
.ts-prog{margin:16px 0 4px}.ts-rows{display:flex;flex-direction:column;margin-top:6px}
.ts-n{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--tk-bd2);display:grid;place-items:center;font-size:11.5px;font-weight:600;flex-shrink:0;color:var(--tk-50);background:#fff}
.ts-row{display:flex;gap:12px;align-items:center;width:100%;text-align:left;padding:11px 8px;margin:0 -8px;border:0;border-radius:12px;background:none;cursor:pointer;font:inherit;color:inherit}
.ts-row:hover{background:var(--tk-sun)}.ts-row .t{flex:1;min-width:0;font-weight:500}.ts-row .go{font-size:12.5px;font-weight:600;color:var(--tk-50)}
.ts-row.done .t{color:var(--tk-50)}.ts-row.done .ts-n{background:var(--tk-mint);border-color:var(--tk-mint);color:#06231e}
.ts-cf{margin-top:16px}
.ts-strip{display:flex;flex-direction:column;gap:8px;margin-bottom:18px;font-family:"Poppins",system-ui,sans-serif}
.ts-srow{display:flex;align-items:center;gap:14px;background:#fff;border:1.5px solid var(--tk-bd);border-radius:16px;padding:12px 16px;font-size:14px}
.ts-srow .dot{width:9px;height:9px;border-radius:50%;background:#E9B44C;flex-shrink:0}.ts-srow .m{flex:1;min-width:0;color:var(--tk-50);font-size:13.5px}.ts-srow .m b{color:var(--tk-ink);font-weight:600}
.ts-center{margin-bottom:22px;font-family:"Poppins",system-ui,sans-serif}.ts-chd{display:flex;align-items:center;gap:18px;margin-bottom:14px}
.ts-chd h2{font-size:22px;font-weight:600;letter-spacing:-.5px;margin:0}.ts-chd p{color:var(--tk-50);margin:2px 0 0;font-size:14px}.ts-chd>div:first-child{flex:1}
.ts-ring{width:54px;height:54px;flex-shrink:0}
.ts-cg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;align-items:start}
.ts-pan{background:#fff;border:1.5px solid var(--tk-bd);border-radius:22px;padding:28px 30px;margin-bottom:20px;font-family:"Poppins",system-ui,sans-serif}
.ts-pan h2{font-size:26px;font-weight:600;letter-spacing:-.8px;margin:0}
.ts-sc{display:flex;gap:16px;align-items:center;padding:14px 18px;border:1.5px solid var(--tk-bd);border-radius:16px;margin-top:12px}.ts-sc.done{background:var(--tk-sun);border-color:transparent}
.ts-sc .ts-n{width:28px;height:28px;font-size:13px}.ts-sc.done .ts-n{background:var(--tk-mint);border-color:var(--tk-mint);color:#06231e}.ts-sc .t{flex:1;min-width:0;font-weight:600}
.ts-ready{margin-top:70px;text-align:center;background:#fff;border:1.5px solid var(--tk-bd);border-radius:24px;padding:46px 32px;font-family:"Poppins",system-ui,sans-serif}.ts-ready h2{font-size:26px;font-weight:600;letter-spacing:-.8px;margin:0 0 6px}.ts-ready p{color:var(--tk-50);margin:0 0 24px}.ts-ready .ts-okc{width:60px;height:60px;border-radius:50%;background:var(--tk-mint);display:grid;place-items:center;margin:0 auto 18px;color:#06231e}
.ts-skel{opacity:.5;margin-top:22px}.ts-skel .r{height:46px;border-radius:12px;background:#EFEEE9;margin-bottom:10px}.ts-skel .t{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.ts-skel .t i{height:70px;border-radius:16px;background:#EFEEE9}
.ts-pick{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:28px}
.ts-pk{display:flex;flex-direction:column;gap:6px;text-align:left;padding:22px;background:#fff;border:1.5px solid var(--tk-bd);border-radius:18px;position:relative;font:inherit;color:inherit;cursor:pointer;transition:transform .2s,box-shadow .2s,border-color .2s}
.ts-pk:hover{border-color:var(--tk-ink)}.ts-pk.on{border-color:var(--tk-ink);box-shadow:4px 5px 0 var(--tk-ink);transform:translate(-2px,-2px)}
.ts-pk b{font-size:17px;font-weight:600}.ts-pk .d{color:var(--tk-50);font-size:13.5px}.ts-pk .l{color:var(--tk-50);font-size:12.5px;margin-top:8px}
.ts-pk .bx{position:absolute;top:16px;right:16px;width:24px;height:24px;border-radius:7px;border:1.5px solid var(--tk-30);display:grid;place-items:center;color:#fff}.ts-pk.on .bx{background:var(--tk-ink);border-color:var(--tk-ink)}
.ts-stk{display:flex;flex-direction:column;gap:14px;margin-top:28px}
.ts-done{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--tk-mint-d);background:var(--tk-mint-50);border-radius:999px;padding:5px 12px 5px 10px;margin-top:22px}
@media(max-width:900px){.ts-cg{grid-template-columns:1fr}}
@media(max-width:640px){.ts-ov{padding:0;align-items:flex-end}.ts-sheet{max-width:none;border-radius:22px 22px 0 0;max-height:94vh}.ts-body,.ts-foot{padding-left:20px;padding-right:20px}.ts-hd{padding-left:20px}.ts-g2,.ts-pick{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.ts-sheet,.ts-ov{animation:none}}
`;
var sty=document.createElement('style');sty.textContent=CSS;(document.head||document.documentElement).appendChild(sty);

/* ── model ── */
var SVC={res:{n:'Reservations',d:'Table bookings by phone'},ord:{n:'Ordering',d:'Pickup and delivery orders by phone'},go:{n:'Go live'}};
var STEPS={
 res:[['rules','Booking rules']],
 ord:[['menu','Menu'],['svc','Pickup & delivery'],['tax','Taxes'],['pay','Payments']],
 go:[['sub','Subscribe'],['fwd','Forward your line']]};
var NUM='+1 (312) 555-0147';
TS.cfg={outlets:1,price:350};

function fresh(){return{
 svc:{res:true,ord:true},
 d:{brand:'ROSSA Pizzeria',faqs:[],agent:{name:'Novi'},
  res:{perDay:50,win:30,minP:1,maxP:12,dur:90,notice:60},
  menu:{src:null,n:0},
  svc:{pick:true,prep:20,del:false,mi:3,eta:35,fee:3,min:15},
  tax:{on:true,type:'Tax',n:'Sales tax',app:'Item',base:'Subtotal − discount',calc:'Additive',vt:'%',v:10.25,delfee:false,ch:'both'},
  pay:{conn:false,pick:'store',capOn:true,cap:30,repeatOn:true,repeatN:1,fbPk:false,fbDl:false},
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

TS.sel=function(k){return k==='go'||!!s.svc[k];};
TS.stat=function(k){var a=STEPS[k],d=a.filter(function(x){return s.done[k+'.'+x[0]];}).length;return{done:d,total:a.length,left:a.length-d,complete:d===a.length};};
TS.nextStep=function(k){var x=STEPS[k].filter(function(x){return !s.done[k+'.'+x[0]];})[0];return x?x[0]:null;};
TS.ready=function(k){return TS.sel(k)&&TS.stat(k).complete;};
TS.live=function(k){return TS.ready(k)&&s.sub;};
TS.allDone=function(){return ['res','ord'].every(function(k){return !TS.sel(k)||TS.stat(k).complete;})&&s.sub&&!!s.done['go.fwd'];};
TS.totals=function(){var d=0,t=0;['res','ord','go'].forEach(function(k){if(!TS.sel(k))return;var x=TS.stat(k);d+=x.done;t+=x.total;});return{done:d,total:t};};
TS.toggle=function(k){TS.set(function(x){x.svc[k]=!x.svc[k];});};
TS.add=function(k){if(!s.svc[k])TS.set(function(x){x.svc[k]=true;});TS.open(k);};
TS.reset=function(){TS.set(function(x){var f=fresh();Object.keys(x).forEach(function(k){delete x[k];});Object.assign(x,f);});UI.open=false;draw();};
TS.fill=function(){TS.set(function(x){x.svc.res=true;x.svc.ord=true;['res','ord','go'].forEach(function(k){STEPS[k].forEach(function(t){x.done[k+'.'+t[0]]=true;});});x.sub=true;x.d.menu={src:'google',n:31};x.d.pay.conn=true;x.d.pay.pick='both';});};

/* ── helpers ── */
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var CHK='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
var XI='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
function get(p){return p.split('.').reduce(function(o,k){return o[k];},s.d);}
TS.v=function(p,val,kind){var a=p.split('.'),k=a.pop(),o=a.reduce(function(o,k){return o[k];},s.d);if(kind==='n'){val=Number(val);if(isNaN(val))val=0;}o[k]=val;UI.err='';bcast();};
TS.vr=function(p,val,kind){TS.v(p,val,kind);draw();};
var q=function(v){return typeof v==='string'?"'"+v.replace(/'/g,"\\'")+"'":String(v);};
var fld=function(p,l,o){o=o||{};return '<label class="ts-f"><span>'+l+'</span><input class="ts-in" type="'+(o.t||'number')+'" '+(o.min!=null?'min="'+o.min+'" ':'')+(o.max!=null?'max="'+o.max+'" ':'')+(o.step?'step="'+o.step+'" ':'')+'value="'+esc(get(p))+'" onchange="TS.v(\''+p+'\',this.value,\''+(o.t==='text'?'s':'n')+'\')"></label>';};
var selF=function(p,l,opts){var v=get(p);return '<label class="ts-f"><span>'+l+'</span><select class="ts-sel" onchange="TS.v(\''+p+'\',this.value,\'n\')">'+opts.map(function(o){return '<option value="'+o[0]+'" '+(+o[0]===+v?'selected':'')+'>'+o[1]+'</option>';}).join('')+'</select></label>';};
var selS=function(p,l,opts){var v=get(p);return '<label class="ts-f"><span>'+l+'</span><select class="ts-sel" onchange="TS.v(\''+p+'\',this.value,\'s\')">'+opts.map(function(o){return '<option value="'+o[0]+'" '+(o[0]===v?'selected':'')+'>'+o[1]+'</option>';}).join('')+'</select></label>';};
var seg=function(p,opts,dis){var v=get(p);return '<div class="ts-seg">'+opts.map(function(o){return '<button '+(v===o[0]?'class="on" ':'')+((dis&&dis.indexOf(o[0])>=0)?'disabled ':'')+'onclick="TS.vr(\''+p+'\','+q(o[0])+')">'+o[1]+'</button>';}).join('')+'</div>';};
var sw=function(on,click,label,dis){return '<button class="ts-sw" role="switch" '+(dis?'disabled ':'')+'aria-checked="'+!!on+'" aria-label="'+label+'" onclick="'+click+'"></button>';};
var tg=function(l,d,r){return '<div class="ts-tg"><div><b>'+l+'</b>'+(d?'<span class="d">'+d+'</span>':'')+'</div><div class="r">'+(r||'')+'</div></div>';};
var inpS=function(p,suf,o){o=o||{};return '<span class="ts-suf"><input class="ts-in '+(o.w||'s')+'" type="number" min="'+(o.min==null?0:o.min)+'" '+(o.step?'step="'+o.step+'" ':'')+(o.dis?'disabled ':'')+'value="'+esc(get(p))+'" aria-label="'+suf+'" onchange="TS.v(\''+p+'\',this.value,\'n\')"> '+suf+'</span>';};

/* ── step bodies, same fields as Settings ── */
var BODY={};
BODY['res.rules']=function(){return {t:'Booking rules',h:
 '<div class="ts-g2">'+fld('res.perDay','Max reservations a day',{min:1,max:500})+selF('res.win','Advance booking window',[[7,'7 days'],[14,'14 days'],[30,'30 days'],[60,'60 days'],[90,'90 days']])+fld('res.minP','Min party size',{min:1,max:50})+fld('res.maxP','Max party size',{min:1,max:100})+selF('res.dur','Booking length',[[60,'1 hour'],[90,'1.5 hours'],[120,'2 hours'],[150,'2.5 hours']])+selF('res.notice','Notice needed',[[0,'No notice'],[30,'30 min'],[60,'1 hour'],[120,'2 hours'],[240,'4 hours'],[1440,'1 day']])+'</div>'};};
var SRCS=[['google','Your Google profile menu','31 items found',31,'Quickest'],['pos','Connect your POS','Toast, Square, Clover and more',42],['web','Your restaurant website','Paste your menu page',26],['agg','From a delivery app','DoorDash, Uber Eats, Grubhub',34],['upload','Upload photos or a PDF','We read and build it',28],['scratch','Start from scratch','Add items yourself',0]];
BODY['ord.menu']=function(){var m=s.d.menu;
 if(UI.mp==='busy')return {t:'Reading your menu',h:'<div class="ts-busy"><b>Importing…</b><div class="ts-bar"><i id="ts-pb" style="width:8%"></i></div></div>'};
 if(UI.mp==='review'){var nm=(SRCS.filter(function(x){return x[0]===m.src;})[0]||[])[1]||'Menu';return {t:(m.n?m.n+' items':'Empty menu'),h:
  (m.n?[['Pizza',9],['Pasta',6],['Starters',7],['Salads',4],['Desserts',3],['Drinks',2]].map(function(c){return '<div class="ts-cat"><span>'+c[0]+'</span><span>'+c[1]+'</span></div>';}).join(''):'<div class="ts-cat"><span>Add items in Menu after you finish</span><span></span></div>')+'<div class="ts-sub" style="color:var(--tk-50);font-size:13px">'+esc(nm)+' · <button class="ts-link" onclick="TS.menuAgain()">Change</button></div>'};}
 return {t:'Add your menu',h:SRCS.map(function(o){return '<button class="ts-opt" onclick="TS.menuPick(\''+o[0]+'\')"><span class="ts-rad"></span><span><b>'+o[1]+(o[4]?'<span class="ts-tag">'+o[4]+'</span>':'')+'</b><span class="d">'+o[2]+'</span></span></button>';}).join('')};};
TS.menuPick=function(k){UI.mp='busy';draw();var n=(SRCS.filter(function(x){return x[0]===k;})[0]||[])[3]||0,p=8,t=setInterval(function(){p+=26;var b=document.getElementById('ts-pb');if(b)b.style.width=Math.min(p,100)+'%';if(p>=100){clearInterval(t);if(UI.mp==='busy'&&UI.open){s.d.menu={src:k,n:n};UI.mp='review';bcast();draw();}}},k==='scratch'?60:280);};
TS.menuAgain=function(){UI.mp='choose';draw();};
BODY['ord.svc']=function(){var q=s.d.svc;
 return {t:'Pickup & delivery',h:
 tg('Pickup','',inpS('svc.prep','min',{min:1,step:5,dis:!q.pick})+sw(q.pick,"TS.vr('svc.pick',"+!q.pick+")",'Pickup'))+
 tg('Delivery','',sw(q.del,"TS.vr('svc.del',"+!q.del+")",'Delivery'))+
 (q.del?'<div class="ts-sub"><div class="ts-g2">'+fld('svc.mi','Delivery radius (mi)',{min:0.5,step:0.5})+fld('svc.eta','Delivery time (min)',{min:5,step:5})+fld('svc.fee','Delivery fee ($)',{min:0,step:0.5})+fld('svc.min','Minimum order ($)',{min:0})+'</div></div>':'')};};
var CH={both:'Delivery + Pickup',d:'Delivery only',p:'Pickup only'};
BODY['ord.tax']=function(){var t=s.d.tax;
 return {t:'Taxes',h:
 tg('I charge tax','',sw(t.on,"TS.vr('tax.on',"+!t.on+")",'Charge tax'))+
 (t.on?'<div class="ts-sub" style="display:flex;flex-direction:column;gap:16px"><div class="ts-f"><span>Type</span>'+seg('tax.type',[['Tax','Tax the guest pays'],['Charge','Charge you add']])+'</div>'+
  fld('tax.n','Name',{t:'text'})+
  '<div class="ts-g2"><div class="ts-f"><span>Applied on</span>'+seg('tax.app',[['Item','Each item'],['Order','Whole order']])+'</div>'+selS('tax.base','Calculated on',[['Subtotal','Subtotal'],['Subtotal − discount','Subtotal − discount']])+'</div>'+
  '<div class="ts-f"><span>Calculation</span>'+seg('tax.calc',[['Additive','Added on top'],['Inclusive','Already in the price']])+'</div>'+
  '<div class="ts-g2"><div class="ts-f"><span>Value</span>'+seg('tax.vt',[['%','Percentage'],['flat','Flat amount']])+'</div>'+fld('tax.v',t.vt==='%'?'Percent':'Amount ($)',{min:0,step:0.25})+'</div>'+
  tg('Also charge on the delivery fee','',sw(t.delfee,"TS.vr('tax.delfee',"+!t.delfee+")",'Charge on delivery fee'))+
  selS('tax.ch','Channel',[['both',CH.both],['d',CH.d],['p',CH.p]])+'</div>':'')};};
BODY['ord.pay']=function(){var p=s.d.pay,qual=p.capOn||p.repeatOn,
 rs=!qual?'Delivery is paid online only.':p.capOn&&p.repeatOn?'Cash only if $'+p.cap+' or less and a repeat customer. Otherwise online.':p.capOn?'Cash if $'+p.cap+' or less. Otherwise online.':'Cash for repeat customers. Otherwise online.';
 return {t:'Payments',h:
 tg('Stripe account','',p.conn?'<span class="ts-tag" style="margin:0">Connected</span>':'<span class="ts-pl">Not connected</span><button class="ts-btn sm" onclick="TS.conn()">Connect payments</button>')+
 tg('Pickup','',seg('pay.pick',[['online','Online'],['store','At pickup'],['both','Both']],p.conn?null:['online','both']))+
 tg('Cash on delivery: order limit','',inpS('pay.cap','$ or less',{w:'m',min:1,dis:!p.capOn})+sw(p.capOn,"TS.vr('pay.capOn',"+!p.capOn+")",'Cash order limit'))+
 tg('Cash on delivery: repeat customers','',inpS('pay.repeatN','orders',{min:1,dis:!p.repeatOn})+sw(p.repeatOn,"TS.vr('pay.repeatOn',"+!p.repeatOn+")",'Cash for repeat customers'))+
 '<div class="ts-res"><b>Result:</b> '+rs+'</div><div style="height:12px"></div>'+
 tg('Unpaid pickup: pay at pickup','',sw(p.fbPk&&p.pick==='both',"TS.vr('pay.fbPk',"+!p.fbPk+")",'Unpaid pickup',p.pick!=='both'))+
 tg('Unpaid delivery: switch to cash','',sw(p.fbDl&&qual,"TS.vr('pay.fbDl',"+!p.fbDl+")",'Unpaid delivery',!qual))};};
TS.conn=function(){s.d.pay.conn=true;if(s.d.pay.pick==='store')s.d.pay.pick='both';bcast();draw();};
BODY['go.sub']=function(){var N=TS.cfg.outlets,P=TS.cfg.price;return {t:s.sub?'Subscribed':'Subscribe',h:
 '<div class="ts-price">$'+(N*P).toLocaleString()+' <small>/ month · '+N+' location'+(N>1?'s':'')+'</small></div><div style="color:var(--tk-50);margin-top:6px">Nothing is billed before you subscribe. Cancel any time.</div>'};};
BODY['go.fwd']=function(){var m=s.d.fwd,code=(m==='busy'?'*61*':'*21*')+'13125550147#';return {t:'Forward your line to this number',h:
 '<div style="color:var(--tk-50);margin:-8px 0 16px">This is your Tringg number. It answers all your calls once your restaurant line forwards to it.</div><div class="ts-num"><span class="m">'+NUM+'</span><button class="ts-btn line sm" onclick="TS.copy(this)">Copy</button></div>'+
 '<button class="ts-opt '+(m==='busy'?'on':'')+'" onclick="TS.vr(\'fwd\',\'busy\')"><span class="ts-rad"></span><span><b>When we can’t pick up</b><span class="d">Recommended</span></span></button>'+
 '<button class="ts-opt '+(m==='all'?'on':'')+'" onclick="TS.vr(\'fwd\',\'all\')"><span class="ts-rad"></span><span><b>Every call</b></span></button>'+
 '<div style="color:var(--tk-50);font-size:13px;margin-top:6px">On your restaurant phone, dial <b style="color:var(--tk-ink);font-family:\'JetBrains Mono\',monospace">'+code+'</b></div>'};};
TS.copy=function(b){try{navigator.clipboard.writeText('+13125550147').catch(function(){});}catch(e){}b.textContent='Copied';setTimeout(function(){if(b.isConnected)b.textContent='Copy';},1400);};
var VAL={
 'ord.menu':function(){return UI.mp==='review'?'':'Add your menu first';},
 'ord.svc':function(){var q=s.d.svc;return !q.pick&&!q.del?'Turn on pickup, delivery or both':(q.pick&&!(q.prep>0))?'Add a pickup prep time':(q.del&&!(q.mi>0))?'Add a delivery radius':'';},
 'ord.tax':function(){var t=s.d.tax;return t.on&&!String(t.n).trim()?'Add a name':'';},
 'ord.pay':function(){var p=s.d.pay;return (p.pick!=='store'&&!p.conn)?'Connect payments for online pickup':(s.d.svc.del&&!(p.conn||p.capOn||p.repeatOn))?'Delivery needs online payments or a cash rule':'';},
 'res.rules':function(){var r=s.d.res;return r.minP>r.maxP?'Min party size is above the max':'';}};

/* ── sheet ── */
function root(){var r=document.getElementById('ts-root');if(!r){r=document.createElement('div');r.id='ts-root';document.body.appendChild(r);}return r;}
function cur(){return STEPS[UI.svc];}
function idx(){return cur().map(function(x){return x[0];}).indexOf(UI.step);}
function draw(){
 var r=root();if(!UI.open){r.innerHTML='';return;}
 var k=UI.svc,st=cur(),i=idx(),last=i===st.length-1,key=k+'.'+UI.step,main;
 var dots=st.length>1?'<div class="ts-dots">'+st.map(function(x,j){var open=st.slice(0,j).every(function(y){return s.done[k+'.'+y[0]];});return '<button class="'+(s.done[k+'.'+x[0]]?'done ':'')+(j===i&&UI.stage==='form'?'on':'')+'" aria-label="'+x[1]+'" title="'+x[1]+'" '+(open?'':'disabled ')+'onclick="TS.goto(\''+x[0]+'\')"></button>';}).join('')+'<span>'+(UI.stage==='form'?'Step '+(i+1)+' of '+st.length:'')+'</span></div>':'';
 var head='<div class="ts-hd"><div><div class="ts-eyebrow">'+SVC[k].n+'</div>'+dots+'</div><button class="ts-xb" aria-label="Close" onclick="TS.close()">'+XI+'</button></div>';
 if(UI.stage==='done'){
  var t={res:'Reservations are set up',ord:'Ordering is set up',go:'You’re live'}[k];
  main=head+'<div class="ts-body"><div class="ts-ok"><div class="ts-okc">'+CHK.replace('width="14" height="14"','width="28" height="28"')+'</div><h3>'+t+'</h3>'+(k==='go'?TS.liveList():'')+'<div style="display:flex;justify-content:center"><button class="ts-btn" onclick="TS.close()">Done</button></div></div></div>';
 }else{
  var b=BODY[key]();
  var cta=key==='go.sub'?(s.sub?'Continue':'Subscribe · $'+(TS.cfg.outlets*TS.cfg.price).toLocaleString()):key==='go.fwd'?'Done':key==='ord.menu'&&UI.mp==='review'?'Publish':last?'Save':'Continue';
  var dis=(key==='ord.menu'&&UI.mp!=='review')?'disabled':'';
  main=head+'<div class="ts-body"><h2 class="ts-h">'+b.t+'</h2>'+b.h+'</div><div class="ts-foot">'+(i>0?'<button class="ts-btn line" onclick="TS.goto(\''+st[i-1][0]+'\')">Back</button>':'')+'<span class="sp"></span><span class="ts-err" role="alert">'+esc(UI.err)+'</span>'+'<button class="ts-btn" '+dis+' onclick="TS.save()">'+cta+'</button></div>';
 }
 r.innerHTML='<div class="ts-ov" onmousedown="if(event.target===this)TS.close()"><div class="ts-sheet" role="dialog" aria-modal="true" aria-label="'+esc(SVC[k].n)+'">'+main+'</div></div>';
}
TS.open=function(k,id){
 if(k!=='go'&&!s.svc[k]){s.svc[k]=true;bcast();L.forEach(function(f){f(s);});}
 UI={open:true,svc:k,step:id||TS.nextStep(k)||STEPS[k][0][0],stage:'form',mp:null,err:''};setMp();draw();};
function setMp(){if(UI.svc==='ord'&&UI.step==='menu')UI.mp=s.d.menu.src?'review':'choose';else UI.mp=null;}
TS.close=function(){UI.open=false;draw();};
TS.goto=function(id){UI.step=id;UI.stage='form';UI.err='';setMp();draw();};
TS.skip=function(){var i=idx();if(i<cur().length-1){UI.step=cur()[i+1][0];UI.err='';setMp();draw();}else TS.close();};
TS.save=function(){var key=UI.svc+'.'+UI.step,e=VAL[key]?VAL[key]():'';if(e){UI.err=e;draw();return;}
 var k=UI.svc;
 TS.set(function(x){x.done[key]=true;if(key==='go.sub')x.sub=true;});
 var nx=TS.nextStep(k);
 if(nx){UI.step=nx;UI.err='';setMp();}else UI.stage='done';
 draw();};
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&UI.open)TS.close();});
/* paint explosion from the logo: blobs, streaks and drips that fall with gravity and leave splats */
var FX={cv:null,ctx:null,ps:[],sp:[],run:false};
var PAL=['#4FC2B4','#D7F26B','#FF6B6B','#FFB84D','#8B7CF6','#111111','#5ED3F3'];
function fxStep(){var c=FX.ctx,w=FX.cv.width,h=FX.cv.height;c.clearRect(0,0,w,h);var now=performance.now();
 FX.sp=FX.sp.filter(function(q){return now-q.t<2600;});FX.sp.forEach(function(q){var a=Math.max(0,1-(now-q.t)/2600);c.globalAlpha=a*.9;c.fillStyle=q.c;c.beginPath();c.ellipse(q.x,q.y,q.r*1.5,q.r*.8,q.a,0,6.283);c.fill();if(q.d){c.fillRect(q.x-1.5,q.y,3,q.d*(1-a*.3));}});
 FX.ps=FX.ps.filter(function(p){return p.l>0&&p.y<h+40;});FX.ps.forEach(function(p){p.vy+=.55;p.vx*=.992;p.x+=p.vx;p.y+=p.vy;p.l-=1;p.rot+=p.vr;
  c.globalAlpha=Math.min(1,p.l/30);c.fillStyle=p.c;c.save();c.translate(p.x,p.y);c.rotate(p.rot);
  if(p.k===0){c.beginPath();c.arc(0,0,p.r,0,6.283);c.fill();}else if(p.k===1){c.fillRect(-p.r*1.8,-1.6,p.r*3.6,3.2);}else{c.beginPath();for(var i=0;i<10;i++){var a=i*.628,rr=i%2?p.r*.45:p.r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();}
  c.restore();
  if(p.k===0&&p.y>h-30&&Math.random()<.5&&p.stick){FX.sp.push({x:p.x,y:h-8-Math.random()*20,r:p.r*1.4,c:p.c,t:now,a:Math.random()*3,d:Math.random()<.5?10+Math.random()*30:0});p.l=0;}});
 c.globalAlpha=1;if(FX.ps.length||FX.sp.length)requestAnimationFrame(fxStep);else{FX.run=false;c.clearRect(0,0,w,h);}}
TS.splat=function(x,y){if(!FX.cv){FX.cv=document.createElement('canvas');FX.cv.id='ts-fx';document.body.appendChild(FX.cv);FX.ctx=FX.cv.getContext('2d');}
 FX.cv.width=window.innerWidth;FX.cv.height=window.innerHeight;
 for(var i=0;i<90;i++){var a=Math.random()*6.283,sp=4+Math.random()*13;FX.ps.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-5,r:2.5+Math.random()*7,c:PAL[Math.floor(Math.random()*PAL.length)],l:70+Math.random()*80,k:i%7===0?2:i%4===0?1:0,rot:Math.random()*6,vr:(Math.random()-.5)*.4,stick:Math.random()<.7});}
 for(var j=0;j<6;j++)FX.sp.push({x:x+(Math.random()-.5)*40,y:y+(Math.random()-.5)*20,r:10+Math.random()*16,c:PAL[j%4],t:performance.now(),a:Math.random()*3,d:0});
 if(!FX.run){FX.run=true;requestAnimationFrame(fxStep);}};
document.addEventListener('click',function(e){var l=e.target.closest&&e.target.closest('.logo');if(l){var r=l.getBoundingClientRect();TS.splat(r.left+r.width/2,r.top+r.height/2);}});

/* ── blocks placed in host pages ── */
var pill=function(k){var x=TS.stat(k);
 if(!TS.sel(k))return '<span class="ts-pl">Off</span>';
 if(!x.complete)return '<span class="ts-pl a">'+(x.done?x.done+' of '+x.total:'Not started')+'</span>';
 return s.sub?'<span class="ts-pl g">Live</span>':'<span class="ts-pl g">Ready</span>';};
function ring(d,t){var C=2*Math.PI*21,p=t?d/t:0;return '<svg class="ts-ring" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="21" fill="none" stroke="#EAE9E4" stroke-width="6"/><circle cx="27" cy="27" r="21" fill="none" stroke="#4FC2B4" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(C*p).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 27 27)"/><text x="27" y="31.5" text-anchor="middle" font-size="13" font-weight="700" fill="#111" font-family="Poppins,sans-serif">'+d+'/'+t+'</text></svg>';}
function rowsOf(k){return STEPS[k].map(function(x,j){var dn=s.done[k+'.'+x[0]];return '<button class="ts-row '+(dn?'done':'')+'" onclick="TS.open(\''+k+'\',\''+x[0]+'\')"><span class="ts-n">'+(dn?CHK:j+1)+'</span><span class="t">'+x[1]+'</span><span class="go">'+(dn?'Edit':'Start')+'</span></button>';}).join('');}
TS.card=function(k,o){o=o||{};var on=TS.sel(k),x=TS.stat(k),lbl=!on?'':x.complete?'Review':x.done?'Continue':'Start';
 var tog=(o.toggle)?sw(on,"TS.toggle('"+k+"')",SVC[k].n):'';
 return '<div class="ts-card '+(on?'':'off')+'"><div class="ts-ch"><div><div class="ts-ct">'+SVC[k].n+' '+pill(k)+'</div><div class="ts-cd">'+SVC[k].d+'</div></div>'+tog+'</div>'+
  (on?'<div class="ts-prog"><div class="ts-bar"><i style="width:'+(x.total?x.done/x.total*100:0)+'%"></i></div></div><div class="ts-rows">'+rowsOf(k)+'</div><div class="ts-cf"><button class="ts-btn '+(x.complete?'line':'')+'" onclick="TS.open(\''+k+'\')">'+lbl+'</button></div>':(o.toggle?'':'<div class="ts-cf"><button class="ts-btn line" onclick="TS.add(\''+k+'\')">Add</button></div>'))+'</div>';};
/* lighter onboarding: choose services only */
TS.pick=function(){return '<div class="ts-pick">'+['res','ord'].map(function(k){var on=TS.sel(k),n=STEPS[k].length;return '<button class="ts-pk '+(on?'on':'')+'" onclick="TS.toggle(\''+k+'\')" aria-pressed="'+on+'"><span class="bx">'+CHK+'</span><b>'+SVC[k].n+'</b><span class="d">'+SVC[k].d+'</span><span class="l">'+n+' step'+(n>1?'s':'')+'</span></button>';}).join('')+'</div>';};
TS.items=function(){var a=[];['res','ord'].forEach(function(k){if(TS.sel(k)){var x=TS.stat(k);if(!x.complete)a.push({k:k,t:'Finish '+SVC[k].n.toLowerCase(),m:x.left+' step'+(x.left>1?'s':'')+' left',c:'Continue',f:"TS.open('"+k+"')"});}});
 if(!s.sub)a.push({k:'go',t:'Go live',m:a.length?'':'Everything is ready',c:'Go live',f:"TS.open('go','sub')"});
 else if(!s.done['go.fwd'])a.push({k:'go',t:'Forward your line',m:'',c:'Set up',f:"TS.open('go','fwd')"});
 return a;};
TS.strip=function(only){var a=TS.items().filter(function(i){return !only||i.k===only;});if(!a.length)return '';
 return '<div class="ts-strip">'+a.map(function(i){return '<div class="ts-srow"><span class="dot"></span><span class="m"><b>'+i.t+'</b>'+(i.m?' · '+i.m:'')+'</span><button class="ts-btn sm" onclick="'+i.f+'">'+i.c+'</button></div>';}).join('')+'</div>';};
TS.pillHTML=function(){var live=s.sub&&s.done['go.fwd'];if(live)return '';
 return s.sub?'<div class="live"><span class="d" style="background:#E9B44C"></span>Forward your line<button style="color:#fff;font-weight:600;text-decoration:underline;padding:0 6px" onclick="TS.open(\'go\',\'fwd\')">Set up</button></div>':'<div class="live"><span class="d" style="background:#E9B44C"></span>Not live<button style="color:#fff;font-weight:600;text-decoration:underline;padding:0 6px" onclick="TS.open(\'go\',\'sub\')">Go live</button></div>';};
/* variant C: the overview is the setup page */
TS.center=function(){if(TS.allDone())return '';var t=TS.totals(),left=t.total-t.done;
 return '<section class="ts-center"><div class="ts-chd"><div><h2>Set up</h2><p>'+left+' step'+(left===1?'':'s')+' left</p></div>'+ring(t.done,t.total)+'</div><div class="ts-cg">'+['res','ord'].map(function(k){return TS.card(k,{toggle:true});}).join('')+TS.goCard()+'</div></section>';};
TS.goCard=function(){var x=TS.stat('go');return '<div class="ts-card"><div class="ts-ch"><div><div class="ts-ct">Go live '+(x.complete?'<span class="ts-pl g">Live</span>':'<span class="ts-pl a">'+(x.done?x.done+' of 2':'Not started')+'</span>')+'</div></div></div><div class="ts-rows">'+rowsOf('go')+'</div></div>';};
/* variant B: a short status list on the overview; each row leads to the tab that owns the steps */
TS.status=function(){if(TS.allDone())return '';var rows=[['res','Reservations',"TS.nav('reservations')"],['ord','Ordering',"TS.nav('orders')"]].filter(function(r){return TS.sel(r[0]);}).map(function(r){var x=TS.stat(r[0]);return '<button class="ts-row '+(x.complete?'done':'')+'" onclick="'+r[2]+'"><span class="ts-n">'+(x.complete?CHK:'•')+'</span><span class="t">'+r[1]+(x.complete?'':' <span style="color:var(--tk-50);font-weight:400">· '+x.left+' left</span>')+'</span><span class="go">'+(x.complete?'Open':'Continue')+'</span></button>';}).join('');
 var g=!s.sub?'<button class="ts-row" onclick="TS.open(\'go\',\'sub\')"><span class="ts-n">•</span><span class="t">Go live</span><span class="go">Go live</span></button>':!s.done['go.fwd']?'<button class="ts-row" onclick="TS.open(\'go\',\'fwd\')"><span class="ts-n">•</span><span class="t">Forward your line</span><span class="go">Set up</span></button>':'';
 return '<div class="ts-card" style="margin-bottom:20px"><div class="ts-ct">Setup</div><div class="ts-rows">'+rows+g+'</div></div>';};
/* variant B: a module page that is the setup */
TS.panel=function(k){var x=TS.stat(k),n=SVC[k].n,nx=TS.nextStep(k);
 var steps=STEPS[k].map(function(t,j){var dn=s.done[k+'.'+t[0]];return '<div class="ts-sc '+(dn?'done':'')+'"><span class="ts-n">'+(dn?CHK:j+1)+'</span><span class="t">'+t[1]+'</span><button class="ts-btn sm '+(dn?'line':'')+'" onclick="TS.open(\''+k+'\',\''+t[0]+'\')">'+(dn?'Edit':t[0]===nx?'Start':'Open')+'</button></div>';}).join('');
 var tail='';
 return '<div class="scroll"><div class="page" style="max-width:860px"><div class="ts-pan"><div style="display:flex;gap:20px;align-items:center"><h2 style="flex:1">'+(x.complete?n+' is set up':'Set up '+n.toLowerCase())+'</h2>'+ring(x.done,x.total)+'</div>'+steps+tail+'</div>'+TS.skel(k)+'</div></div>';};
TS.liveList=function(){return '<div style="max-width:320px;margin:0 auto 22px;text-align:left">'+['res','ord'].filter(function(k){return TS.sel(k);}).map(function(k){var r=TS.ready(k);return '<div class="ts-cat"><span>'+SVC[k].n+'</span><span>'+(r?'<span class="ts-pl g">Live</span>':'<span class="ts-pl a">Finish setup</span>')+'</span></div>';}).join('')+'</div>';};
TS.readyPage=function(k){var m={res:['Reservations are ready','Go live to start taking bookings.'],ord:['Ordering is ready','Go live to start taking orders.']}[k];
 return '<div class="scroll"><div class="page" style="max-width:560px"><div class="ts-ready"><div class="ts-okc">'+CHK.replace('width="14" height="14"','width="28" height="28"')+'</div><h2>'+m[0]+'</h2><p>'+m[1]+'</p><div style="display:flex;gap:12px;justify-content:center"><button class="ts-btn" onclick="TS.open(\'go\',\'sub\')">Go live</button><button class="ts-btn line" onclick="TS.open(\''+k+'\')">Edit setup</button></div></div></div></div>';};
TS.skel=function(){return '<div class="ts-skel" aria-hidden="true"><div class="t"><i></i><i></i><i></i><i></i></div><div class="r"></div><div class="r"></div><div class="r"></div></div>';};
/* variants A and C: the module page is dimmed behind one slim row */
TS.bar=function(k){var x=TS.stat(k),ready=x.complete;
 return '<div class="modoff"><div class="mo-b"><div><b>'+(ready?SVC[k].n+' is set up':'Finish '+SVC[k].n.toLowerCase()+' setup')+'</b>'+(ready?'':' · '+x.left+' step'+(x.left>1?'s':'')+' left')+'</div><button class="btn btn-dark btn-sm" onclick="TS.open(\''+(ready?'go':k)+'\''+(ready?",'sub'":'')+')">'+(ready?'Go live':x.done?'Continue':'Start')+'</button></div><div class="mo-c" inert>'+TS.skel(k)+'</div></div>';};
})();

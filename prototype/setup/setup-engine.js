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
.ts-h{font-size:26px;font-weight:600;letter-spacing:-.8px;line-height:1.2;margin:0 0 14px}.ts-h+.ts-d{margin-top:0}
.ts-foot{display:flex;align-items:center;gap:12px;padding:18px 32px 24px}
.ts-foot .sp{flex:1}.ts-err{color:var(--tk-red);font-size:13px;font-weight:500}
.ts-btn{height:44px;padding:0 22px;border-radius:12px;border:1.5px solid var(--tk-ink);background:var(--tk-ink);color:#fff;font:inherit;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;text-decoration:none;transition:transform .15s,box-shadow .15s}
.ts-btn:hover:not(:disabled){transform:translate(-2px,-2px);box-shadow:4px 5px 0 #fff,4px 5px 0 1.5px #111}
.ts-btn.line:hover:not(:disabled){box-shadow:4px 5px 0 var(--tk-ink)}
.ts-btn.line{background:#fff;color:var(--tk-ink)}.ts-btn.sm{height:34px;padding:0 14px;font-size:13px;border-radius:10px}.ts-btn.sm:hover:not(:disabled){box-shadow:3px 4px 0 #fff,3px 4px 0 1.5px #111}.ts-btn.sm.line:hover:not(:disabled){box-shadow:3px 4px 0 var(--tk-ink)}
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
.ts-suf{display:inline-flex;align-items:center;gap:6px;color:var(--tk-50);font-size:13px}.ts-suf .ts-in{color:var(--tk-ink)}.ts-suf .ts-in:disabled{color:var(--tk-30)}
.ts-faq{display:flex;flex-direction:column;gap:8px;border:1.5px solid var(--tk-bd);border-radius:14px;padding:12px 14px;margin-bottom:10px}.ts-faq .ts-in{height:40px;font-weight:500}.ts-faq .ts-ta{padding:9px 14px}
.ts-more{margin-top:14px}
.ts-sl{padding:4px 28px}.ts-sr{padding:20px 0;border-top:1px solid var(--tk-bd)}.ts-sr:first-child{border-top:0}
.ts-sr-top{display:flex;align-items:center;gap:14px;min-height:36px}.ts-sr-t{flex:1;display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:17px}.ts-sr-t b{font-weight:600}
.ts-sr-a{display:flex;align-items:center;gap:14px}.ts-sr-d{color:var(--tk-50);font-size:13.5px;margin-top:2px}.ts-sr.off .ts-sr-d{opacity:.7}
.ts-chs{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.ts-chp{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 14px 0 7px;border-radius:999px;border:1.5px solid var(--tk-bd);background:#fff;font:inherit;font-size:13px;font-weight:500;cursor:pointer;color:var(--tk-ink)}
.ts-chp .n{width:20px;height:20px;border-radius:50%;background:var(--tk-sun);display:grid;place-items:center;font-size:11px;font-weight:600;color:var(--tk-50)}
.ts-chp.done{background:var(--tk-mint-50);border-color:transparent;color:var(--tk-mint-d)}.ts-chp.done .n{background:var(--tk-mint);color:#06231e}.ts-chp:hover{border-color:var(--tk-ink)}
.ts-row .ts-nb{margin-left:10px}
.ts-nb{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;background:var(--tk-ink);color:#fff;border-radius:999px;padding:2px 9px;animation:tsbounce 1.6s ease-in-out infinite}
@keyframes tsbounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.ts-pulse{animation:tspulse 1.8s ease-out infinite}.ts-pulse:hover{animation:none}
@keyframes tspulse{0%{box-shadow:0 0 0 0 rgba(79,194,180,.7)}70%{box-shadow:0 0 0 12px rgba(79,194,180,0)}100%{box-shadow:0 0 0 0 rgba(79,194,180,0)}}
.ts-gobtn{background:var(--tk-ink);color:#fff!important;border-radius:999px;padding:5px 14px}
.ts-row.next{background:var(--tk-mint-50)}.ts-row.next:hover{background:var(--tk-mint-50)}
.ts-gs{margin-top:4px}.ts-gsh{font-size:14.5px;margin:0 0 6px;color:var(--tk-ink)}
.ts-wh{margin:2px 0 20px}.ts-wh h1{font-size:30px;font-weight:600;letter-spacing:-.9px;margin:0;line-height:1.2}.ts-wh p{color:var(--tk-50);margin:4px 0 0;font-size:15px}
.ts-hero{position:relative;overflow:hidden;border-radius:24px;padding:30px 34px;margin-bottom:18px;color:#fff;display:flex;gap:24px;align-items:center;background:radial-gradient(110% 150% at 100% 0%,#1F6E62 0%,rgba(31,110,98,0) 58%),linear-gradient(135deg,#111 0%,#1a1a1a 60%,#12342f 100%);font-family:"Poppins",system-ui,sans-serif}
.ts-hero-e{font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#7FE8D8;margin-bottom:6px}.ts-hero h2{font-size:28px;font-weight:600;letter-spacing:-.8px;margin:0;line-height:1.2}.ts-hero p{margin:6px 0 0;color:rgba(255,255,255,.78);font-size:14.5px;max-width:520px}
.ts-hero-c{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.ts-hero-c span{font-size:12.5px;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:4px 12px;color:rgba(255,255,255,.9)}
.ts-hero-b{background:#fff;color:#111;border-color:#fff;flex-shrink:0}.ts-hero-b:hover:not(:disabled){box-shadow:4px 5px 0 #4FC2B4,4px 5px 0 1.5px #fff}
.ts-gs2{background:#fff;border:1.5px solid var(--tk-bd);border-radius:22px;margin-bottom:20px;font-family:"Poppins",system-ui,sans-serif;color:var(--tk-ink);font-size:14px;line-height:1.5}
.ts-gs2-h{display:flex;align-items:center;gap:16px;padding:22px 28px;cursor:pointer}.ts-gs2-t{flex:1;min-width:0}.ts-gs2-t h2{font-size:20px;font-weight:600;letter-spacing:-.4px;margin:0}
.ts-gs2-p{display:flex;align-items:center;gap:12px;margin-top:8px;max-width:420px}.ts-gs2-p .ts-bar{flex:1}.ts-gs2-p span{font-size:12.5px;color:var(--tk-50);white-space:nowrap}
.ts-gs2-n{display:none}.ts-gs2.closed .ts-gs2-n{display:inline-flex}.ts-gs2 #ts-gs2-x svg{transition:transform .3s}.ts-gs2.closed #ts-gs2-x svg{transform:rotate(180deg)}
.ts-gs2-b{display:grid;grid-template-rows:1fr;transition:grid-template-rows .35s ease}.ts-gs2-b>div{overflow:hidden;min-height:0}.ts-gs2.closed .ts-gs2-b{grid-template-rows:0fr}
.ts-cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--tk-bd)}
.ts-col{padding:22px 24px 18px;border-left:1px solid var(--tk-bd);display:flex;flex-direction:column;gap:6px;min-width:0}.ts-col:first-child{border-left:0}
.ts-col-t{font-size:17px;font-weight:600;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ts-col-t .num{color:var(--tk-50);font-weight:500}
.ts-col p{color:var(--tk-50);font-size:13.5px;margin:0;min-height:40px}.ts-col-a{display:flex;align-items:center;gap:10px;margin-top:8px;min-height:34px;flex-wrap:wrap}
.ts-done2{display:inline-flex;align-items:center;gap:7px;background:var(--tk-mint-50);color:var(--tk-mint-d);font-weight:600;font-size:13px;border-radius:10px;padding:7px 14px}
.ts-cnt{font-size:12.5px;color:var(--tk-50)}.ts-col-m{margin-top:auto;padding-top:10px;align-self:flex-start;border:0;background:none;font:inherit;font-size:12.5px;font-weight:600;color:var(--tk-50);cursor:pointer;display:inline-flex;gap:4px;align-items:center}.ts-col-m:hover{color:var(--tk-ink)}
.ts-col.sel{background:var(--tk-sun)}.ts-col.sel .ts-col-m svg{transform:rotate(180deg)}
.ts-det{background:var(--tk-sun);border-top:1px solid var(--tk-bd);padding:20px 28px 24px;animation:tsup .25s ease both;border-radius:0 0 20px 20px}.ts-det-h{display:flex;align-items:center;gap:14px;margin-bottom:12px}.ts-det-h b{flex:1;font-size:15px}.ts-det-sw{display:inline-flex;align-items:center;gap:10px;font-size:13px;color:var(--tk-50)}
@media(max-width:1100px){.ts-cols{grid-template-columns:repeat(2,minmax(0,1fr))}.ts-col:nth-child(3){border-left:0}.ts-col:nth-child(n+3){border-top:1px solid var(--tk-bd)}}
@media(max-width:640px){.ts-cols{grid-template-columns:1fr}.ts-col{border-left:0!important;border-top:1px solid var(--tk-bd)}.ts-col:first-child{border-top:0}.ts-hero{flex-direction:column;align-items:flex-start}}
.ts-wl-ov{position:fixed;inset:0;z-index:950;background:rgba(17,17,17,.5);display:grid;place-items:center;padding:24px;animation:tsfade .2s ease both}
.ts-wl{width:min(520px,100%);background:#fff;border-radius:28px;padding:64px 36px 30px;text-align:center;box-shadow:0 30px 80px -20px rgba(0,0,0,.5);animation:tsup .3s cubic-bezier(.2,.8,.2,1) both;font-family:"Poppins",system-ui,sans-serif;color:var(--tk-ink);font-size:14px;line-height:1.5}
.ts-wl h2{font-size:26px;font-weight:600;letter-spacing:-.8px;margin:0}.ts-wl-s{color:var(--tk-50);margin:4px 0 22px}
.ts-rd{position:relative;width:88px;height:88px;margin:0 auto 24px}.ts-rd i{position:absolute;inset:0;border-radius:50%;border:2px solid var(--tk-mint);opacity:0;animation:tsrad 2.6s ease-out infinite}.ts-rd i:nth-child(2){animation-delay:.85s}.ts-rd i:nth-child(3){animation-delay:1.7s}
.ts-rd b{position:absolute;inset:10px;border-radius:50%;background:var(--tk-mint);color:#06231e;display:grid;place-items:center;font-size:32px;font-weight:700;box-shadow:0 0 0 6px rgba(79,194,180,.18)}
@keyframes tsrad{0%{transform:scale(.8);opacity:.7}100%{transform:scale(2.6);opacity:0}}
.ts-wl-g{display:grid;grid-template-columns:1fr 1fr;gap:20px;text-align:left;margin-bottom:24px}.ts-wl-g:has(>div:only-child){grid-template-columns:1fr}
.ts-wl-l{font-size:11.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--tk-50);margin-bottom:8px}.ts-wl ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.ts-wl li{display:flex;gap:10px;align-items:center;font-size:14px}.ts-wl li span{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--tk-bd2);display:grid;place-items:center;flex-shrink:0}.ts-wl li.ok span{background:var(--tk-mint);border-color:var(--tk-mint);color:#06231e}
@media(max-width:560px){.ts-wl-g{grid-template-columns:1fr}}
.ov-t{margin-left:auto;border:0;background:none;color:var(--tk-50);cursor:pointer;width:30px;height:30px;border-radius:9px;display:grid;place-items:center}.ov-t:hover{background:var(--tk-sun);color:var(--tk-ink)}.ov-t svg{transition:transform .25s}
.card.ov-c .ov-t svg{transform:rotate(180deg)}.card.ov-c .card-b{display:none}
.ts-cpage{min-height:calc(100vh - 150px);display:flex;align-items:center;justify-content:center;position:relative;margin:0 auto;max-width:760px}
.ts-cpage .ts-skel{position:absolute;inset:0;margin:0}
.ts-cat2{display:inline-block;font-size:12px;font-weight:600;border-radius:999px;padding:4px 12px;background:#EAE9E4;color:#555}
.ts-cat2.c-general{background:#E3EEF7;color:#2A5C85}.ts-cat2.c-res{background:#ECE6FB;color:#5B43B5}.ts-cat2.c-ord{background:#FFF1CF;color:#8A5A0B}.ts-cat2.c-catering{background:#FBE3E1;color:#A12E2E}.ts-cat2.c-music{background:#DDF2EE;color:#1F6E62}
.ts-d{color:var(--tk-50);margin:-8px 0 18px;font-size:14px}.ts-fn{margin-top:22px;padding-top:14px;border-top:1px solid var(--tk-bd);font-size:12.5px;color:var(--tk-50)}
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
html .logo{display:inline-block;width:98px;height:35px;font-size:0;line-height:0;color:transparent;cursor:pointer;user-select:none;-webkit-user-select:none;background:url(__LOGO_URI__) no-repeat left center/contain;transform:none;filter:none;-webkit-text-fill-color:transparent;-webkit-text-stroke:0;text-shadow:none;letter-spacing:0;transition:transform .2s cubic-bezier(.3,1.6,.5,1)}
html .logo:hover{transform:scale(1.06) rotate(-2deg)}html .logo:active{transform:scale(.95)}
html .rail-top .logo{filter:invert(1)}
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
.ts-cg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}
.ts-pan{background:#fff;border:1.5px solid var(--tk-bd);border-radius:22px;padding:28px 30px;margin-bottom:20px;font-family:"Poppins",system-ui,sans-serif}
.ts-pan h2{font-size:26px;font-weight:600;letter-spacing:-.8px;margin:0}
.ts-sc{display:flex;gap:16px;align-items:center;padding:14px 18px;border:1.5px solid var(--tk-bd);border-radius:16px;margin-top:12px}.ts-sc.done{background:var(--tk-sun);border-color:transparent}
.ts-sc .ts-n{width:28px;height:28px;font-size:13px}.ts-sc.done .ts-n{background:var(--tk-mint);border-color:var(--tk-mint);color:#06231e}.ts-sc .t{flex:1;min-width:0;font-weight:600}
.ts-ready{text-align:center;width:min(560px,calc(100% - 24px));background:#fff;border:1.5px solid var(--tk-bd);border-radius:24px;padding:46px 32px;font-family:"Poppins",system-ui,sans-serif}.ts-ready h2{font-size:24px;font-weight:600;letter-spacing:-.7px;margin:0 0 10px;line-height:1.25}.ts-rp{color:var(--tk-50);margin:18px 0 0}
.ts-agent{display:flex;flex-direction:column;gap:12px;align-items:center}.ts-av{width:56px;height:56px;border-radius:50%;background:var(--tk-mint);color:#06231e;font-weight:700;font-size:24px;display:grid;place-items:center;flex-shrink:0}
.ts-chips{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.ts-chip{font-size:12.5px;background:var(--tk-sun);border-radius:999px;padding:4px 12px;color:var(--tk-50)}
.ts-fly{transition:transform .44s cubic-bezier(.55,0,.85,.4),opacity .44s;transform-origin:0 100%;transform:translate(-18%,70vh) scale(.08);opacity:0;pointer-events:none}
.ts-grow{animation:tsgrow .5s cubic-bezier(.2,.8,.2,1) backwards;transform-origin:0 100%}@keyframes tsgrow{from{transform:translate(-18%,70vh) scale(.08);opacity:0}to{transform:none;opacity:1}}
.ts-pop{animation:tspop .45s cubic-bezier(.3,1.6,.5,1) both}@keyframes tspop{from{transform:scale(.5);opacity:0}to{transform:none;opacity:1}}
.ts-rail{display:flex;align-items:center;gap:12px;width:calc(100% - 24px);margin:0 12px 10px;padding:10px 12px;border-radius:16px;border:1px solid rgba(79,194,180,.55);background:rgba(79,194,180,.1);color:#fff;font-family:"Poppins",system-ui,sans-serif;cursor:pointer;text-align:left}.ts-rail:hover{background:rgba(79,194,180,.18)}.ts-rail .ts-ring{width:40px;height:40px}.ts-rail b{display:block;font-size:14px;font-weight:600}.ts-rail small{color:rgba(255,255,255,.65);font-size:12px}
.ts-dlg{position:relative;text-align:center;width:min(480px,calc(100% - 24px));background:#fff;border-radius:22px;padding:26px 28px;box-shadow:0 30px 70px -24px rgba(0,0,0,.4),0 0 0 1.5px var(--tk-bd);font-family:"Poppins",system-ui,sans-serif;color:var(--tk-ink);z-index:5}.ts-dlg .ts-ring{margin:0 auto 10px;display:block;width:60px;height:60px}.ts-dlg h2{font-size:22px;font-weight:600;letter-spacing:-.5px;margin:0}.ts-dlg p{color:var(--tk-50);margin:2px 0 0;font-size:14px}
.ts-skel{opacity:.5;margin-top:22px}.ts-skel .r{height:46px;border-radius:12px;background:#EFEEE9;margin-bottom:10px}.ts-skel .t{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.ts-skel .t i{height:70px;border-radius:16px;background:#EFEEE9}
.ts-pick{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:28px}
.ts-pk{display:flex;flex-direction:column;gap:6px;text-align:left;padding:22px;background:#fff;border:1.5px solid var(--tk-bd);border-radius:18px;position:relative;font:inherit;color:inherit;cursor:pointer;transition:transform .2s,box-shadow .2s,border-color .2s}
.ts-pk:hover{border-color:var(--tk-ink)}.ts-pk.on{border-color:var(--tk-ink);box-shadow:4px 5px 0 var(--tk-ink);transform:translate(-2px,-2px)}
.ts-pk b{font-size:17px;font-weight:600}.ts-pk .d{color:var(--tk-50);font-size:13.5px}.ts-pk .l{color:var(--tk-50);font-size:12.5px;margin-top:8px}
.ts-pk .bx{position:absolute;top:16px;right:16px;width:24px;height:24px;border-radius:7px;border:1.5px solid var(--tk-30);display:grid;place-items:center;color:#fff}.ts-pk.on .bx{background:var(--tk-ink);border-color:var(--tk-ink)}
.ts-stk{display:flex;flex-direction:column;gap:14px;margin-top:28px}
.ts-done{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--tk-mint-d);background:var(--tk-mint-50);border-radius:999px;padding:5px 12px 5px 10px;margin-top:22px}
@media(max-width:900px){.ts-cg{grid-template-columns:1fr}}
@media(max-width:760px){.ts-pick{grid-template-columns:1fr}}
@media(max-width:640px){.ts-ov{padding:0;align-items:flex-end}.ts-sheet{max-width:none;border-radius:22px 22px 0 0;max-height:94vh}.ts-body,.ts-foot{padding-left:20px;padding-right:20px}.ts-hd{padding-left:20px}.ts-g2,.ts-pick{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.ts-sheet,.ts-ov{animation:none}}
`;
var sty=document.createElement('style');sty.textContent=CSS;(document.head||document.documentElement).appendChild(sty);

/* ── model ── */
var SVC={kb:{n:'FAQs'},enq:{n:'Enquiries',d:'Answers questions about your restaurant'},res:{n:'Reservations',d:'Table bookings by phone'},ord:{n:'Ordering',d:'Pickup and delivery orders by phone'},go:{n:'Go live',d:'Subscribe and forward your line'}};
var STEPS={
 res:[['rules','Booking rules'],['faq','FAQs']],
 kb:[['all','FAQs']],
 enq:[['faq','FAQs']],
 ord:[['menu','Menu'],['svc','Pickup & delivery'],['tax','Taxes'],['pay','Payments'],['faq','FAQs']],
 go:[['sub','Subscribe'],['fwd','Forward your line']]};
var NUM='+1 (312) 555-0147';
TS.cfg={outlets:1,price:350};

function fresh(){return{
 svc:{res:true,ord:true},
 d:{brand:'ROSSA Pizzeria',faqs:[['Do you have gluten-free crusts?','Yes, on any 12-inch pizza.','general'],['Is there parking nearby?','Yes, street parking and a garage next door.','general'],['Do you have vegan options?','Yes, a vegan cheese pizza and several pastas.','general'],['Can you host a private party?','Yes, up to 40 guests.','general'],
  ['Do you take walk-ins?','Yes, subject to availability. Booking is recommended on weekends.','res'],['How far ahead can I book?','Up to 30 days ahead.','res'],['Can I book for a large group?','Yes, up to 12 guests by phone.','res'],
  ['Do you deliver?','Yes, within 3 miles.','ord'],['How long does pickup take?','About 20 minutes.','ord'],['Is there a delivery fee or minimum?','A $3 fee and a $15 minimum.','ord'],
  ['Do you cater?','Yes. We cater events of 20 or more. Call us for a quote.','catering'],['How much notice do you need for catering?','At least 48 hours.','catering'],
  ['Do you have live music?','Yes, every Friday and Saturday from 7 PM.','music'],['Can I book the restaurant for a music event?','Yes, for private events on weekdays.','music']],agent:{name:'Emma',voice:'allie',greet:''},outlet:null,
  res:{perDay:50,win:30,minP:1,maxP:12,dur:90,notice:60},
  menu:{src:null,n:0},
  svc:{pick:true,prep:20,del:false,mi:3,eta:35,fee:3,min:15},
  tax:{on:true,type:'Tax',n:'Sales tax',app:'Item',base:'Subtotal − discount',calc:'Additive',vt:'%',v:10.25,delfee:false,ch:'both'},
  pay:{conn:false,pick:'store',capOn:true,cap:30,repeatOn:true,repeatN:1,fbPk:false,fbDl:false},
  fwd:'busy'},
 done:{},sub:false,trial:false};}
var s=fresh(),L=[];
var UI={open:false,svc:null,step:null,stage:'form',mp:null,err:'',more:false};

TS.get=function(){return s;};
TS.on=function(f){L.push(f);};
function emit(){L.forEach(function(f){try{f(s);}catch(e){console.error(e);}});draw();}
function bcast(){if(window.parent!==window){try{window.parent.postMessage({tringg:'state',s:JSON.parse(JSON.stringify(s))},'*');}catch(e){}}}
TS.set=function(fn){fn(s);emit();bcast();};
window.addEventListener('message',function(e){var m=e.data;if(!m||!m.tringg)return;
 if(m.tringg==='state'&&m.s){s=m.s;emit();}
 if(m.tringg==='reset'){s=fresh();UI.open=false;emit();}});
TS.hello=function(){if(window.parent!==window){try{window.parent.postMessage({tringg:'hello'},'*');}catch(e){}}};

function act(){return !!(s.sub||s.trial);}
TS.active=act;
TS.setPlan=function(p){TS.set(function(x){x.sub=p==='sub';x.trial=p==='trial';if(p==='none')delete x.done['go.sub'];else x.done['go.sub']=true;});};
TS.sel=function(k){return k==='go'||k==='enq'||!!s.svc[k];};
TS.stat=function(k){var a=STEPS[k],d=a.filter(function(x){return s.done[k+'.'+x[0]];}).length;return{done:d,total:a.length,left:a.length-d,complete:d===a.length};};
TS.nextStep=function(k){var x=STEPS[k].filter(function(x){return !s.done[k+'.'+x[0]];})[0];return x?x[0]:null;};
TS.ready=function(k){return TS.sel(k)&&TS.stat(k).complete;};
TS.live=function(k){return TS.ready(k)&&act();};
TS.allDone=function(){return ['enq','res','ord'].every(function(k){return !TS.sel(k)||TS.stat(k).complete;})&&act();};
TS.totals=function(){var d=0,t=0;['enq','res','ord'].forEach(function(k){if(!TS.sel(k))return;var x=TS.stat(k);d+=x.done;t+=x.total;});t+=1;if(act())d+=1;return{done:d,total:t};};
TS.toggle=function(k){TS.set(function(x){x.svc[k]=!x.svc[k];});};
TS.add=function(k){if(!s.svc[k])TS.set(function(x){x.svc[k]=true;});TS.open(k);};
TS.reset=function(){TS.set(function(x){var f=fresh();Object.keys(x).forEach(function(k){delete x[k];});Object.assign(x,f);});UI.open=false;TS.ov={open:true,sel:null};TS.welcomed=false;TS.closeWelcome&&TS.closeWelcome();draw();};
TS.fill=function(){TS.set(function(x){x.svc.res=true;x.svc.ord=true;['enq','res','ord','go'].forEach(function(k){STEPS[k].forEach(function(t){x.done[k+'.'+t[0]]=true;});});x.sub=true;x.d.menu={src:'google',n:31};x.d.pay.conn=true;x.d.pay.pick='both';});};

/* ── helpers ── */
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function faqErr(c){return s.d.faqs.some(function(f){return (!c||(f[2]||'general')===c)&&(!String(f[0]).trim()||!String(f[1]).trim());})?'Fill in or remove the empty question':'';}
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
BODY['res.rules']=function(){return {t:'Booking rules',d:'How many bookings the agent accepts, and for how many guests.',n:'You can change these any time in Settings.',h:
 '<div class="ts-g2">'+fld('res.perDay','Max reservations a day',{min:1,max:500})+selF('res.win','Advance booking window',[[7,'7 days'],[14,'14 days'],[30,'30 days'],[60,'60 days'],[90,'90 days']])+fld('res.minP','Min party size',{min:1,max:50})+fld('res.maxP','Max party size',{min:1,max:100})+selF('res.dur','Booking length',[[60,'1 hour'],[90,'1.5 hours'],[120,'2 hours'],[150,'2.5 hours']])+selF('res.notice','Notice needed',[[0,'No notice'],[30,'30 min'],[60,'1 hour'],[120,'2 hours'],[240,'4 hours'],[1440,'1 day']])+'</div>'};};
var SRCS=[['google','Your Google profile menu','31 items found',31,'Quickest'],['pos','Connect your POS','Toast, Square, Clover and more',42],['web','Your restaurant website','Paste your menu page',26],['agg','From a delivery app','DoorDash, Uber Eats, Grubhub',34],['upload','Upload photos or a PDF','We read and build it',28],['scratch','Start from scratch','Add items yourself',0]];
BODY['ord.menu']=function(){var m=s.d.menu;
 if(UI.mp==='busy')return {t:'Reading your menu',d:'',h:'<div class="ts-busy"><b>Importing…</b><div class="ts-bar"><i id="ts-pb" style="width:8%"></i></div></div>'};
 if(UI.mp==='review'){var nm=(SRCS.filter(function(x){return x[0]===m.src;})[0]||[])[1]||'Menu';return {t:(m.n?m.n+' items':'Empty menu'),d:'Imported as a draft. Publish it, or fine-tune it in Menu.',n:'Edit your menu any time in Menu.',h:
  (m.n?[['Pizza',9],['Pasta',6],['Starters',7],['Salads',4],['Desserts',3],['Drinks',2]].map(function(c){return '<div class="ts-cat"><span>'+c[0]+'</span><span>'+c[1]+'</span></div>';}).join(''):'<div class="ts-cat"><span>Add items in Menu after you finish</span><span></span></div>')+'<div class="ts-sub" style="color:var(--tk-50);font-size:13px">'+esc(nm)+' · <button class="ts-link" onclick="TS.menuAgain()">Change</button></div>'};}
 return {t:'Add your menu',d:'The agent reads this menu to callers and builds their order from it.',n:'Edit your menu any time in Menu.',h:SRCS.map(function(o){return '<button class="ts-opt" onclick="TS.menuPick(\''+o[0]+'\')"><span class="ts-rad"></span><span><b>'+o[1]+(o[4]?'<span class="ts-tag">'+o[4]+'</span>':'')+'</b><span class="d">'+o[2]+'</span></span></button>';}).join('')};};
TS.menuPick=function(k){UI.mp='busy';draw();var n=(SRCS.filter(function(x){return x[0]===k;})[0]||[])[3]||0,p=8,t=setInterval(function(){p+=26;var b=document.getElementById('ts-pb');if(b)b.style.width=Math.min(p,100)+'%';if(p>=100){clearInterval(t);if(UI.mp==='busy'&&UI.open){s.d.menu={src:k,n:n};UI.mp='review';bcast();draw();}}},k==='scratch'?60:280);};
TS.more=function(){UI.more=!UI.more;draw();};
TS.menuAgain=function(){UI.mp='choose';draw();};
BODY['ord.svc']=function(){var q=s.d.svc;
 return {t:'Pickup & delivery',d:'Choose how callers get their order. The agent only offers what is switched on.',n:'Change this any time in Settings \u203a Ordering \u203a Pickup & delivery.',h:
 tg('Pickup','',inpS('svc.prep','min',{min:1,step:5,dis:!q.pick})+sw(q.pick,"TS.vr('svc.pick',"+!q.pick+")",'Pickup'))+
 tg('Delivery','',sw(q.del,"TS.vr('svc.del',"+!q.del+")",'Delivery'))+
 (q.del?'<div class="ts-sub"><div class="ts-g2">'+fld('svc.mi','Delivery radius (mi)',{min:0.5,step:0.5})+fld('svc.eta','Delivery time (min)',{min:5,step:5})+fld('svc.fee','Delivery fee ($)',{min:0,step:0.5})+fld('svc.min','Minimum order ($)',{min:0})+'</div></div>':'')};};
var CH={both:'Delivery + Pickup',d:'Delivery only',p:'Pickup only'};
BODY['ord.tax']=function(){var t=s.d.tax;
 var more='<div class="ts-sub" style="display:flex;flex-direction:column;gap:16px"><div class="ts-g2"><div class="ts-f"><span>Applied on</span>'+seg('tax.app',[['Item','Each item'],['Order','Whole order']])+'</div>'+selS('tax.base','Calculated on',[['Subtotal','Subtotal'],['Subtotal \u2212 discount','Subtotal \u2212 discount']])+'</div>'+
  '<div class="ts-f"><span>Calculation</span>'+seg('tax.calc',[['Additive','Added on top'],['Inclusive','Already in the price']])+'</div>'+
  tg('Also charge on the delivery fee','',sw(t.delfee,"TS.vr('tax.delfee',"+!t.delfee+")",'Charge on delivery fee'))+selS('tax.ch','Channel',[['both',CH.both],['d',CH.d],['p',CH.p]])+'</div>';
 return {t:'Taxes',d:'The tax the agent adds and reads out in the order total. Switch it off if you charge none.',n:'Change this any time in Settings \u203a Ordering \u203a Taxes.',h:
 tg('I charge tax','',sw(t.on,"TS.vr('tax.on',"+!t.on+")",'Charge tax'))+
 (t.on?'<div class="ts-sub" style="display:flex;flex-direction:column;gap:16px"><div class="ts-f"><span>Type</span>'+seg('tax.type',[['Tax','Tax the guest pays'],['Charge','Charge you add']])+'</div>'+fld('tax.n','Name',{t:'text'})+
  '<div class="ts-g2"><div class="ts-f"><span>Value</span>'+seg('tax.vt',[['%','Percentage'],['flat','Flat amount']])+'</div>'+fld('tax.v',t.vt==='%'?'Percent':'Amount ($)',{min:0,step:0.25})+'</div></div>'+
  '<button class="ts-link ts-more" onclick="TS.more()">'+(UI.more?'Hide options':'More options')+'</button>'+(UI.more?more:''):'')};};
BODY['ord.pay']=function(){var p=s.d.pay,qual=p.capOn||p.repeatOn,
 rs=!qual?'Delivery is paid online only.':p.capOn&&p.repeatOn?'Cash only if $'+p.cap+' or less and a repeat customer. Otherwise online.':p.capOn?'Cash if $'+p.cap+' or less. Otherwise online.':'Cash for repeat customers. Otherwise online.';
 return {t:'Payments',d:'How callers pay: by card through a text link, or in cash. Choose at least one.',n:'Change this any time in Settings \u203a Ordering \u203a Payments.',h:
 tg('Stripe account','',p.conn?'<span class="ts-tag" style="margin:0">Connected</span>':'<span class="ts-pl">Not connected</span><button class="ts-btn sm" onclick="TS.conn()">Connect payments</button>')+
 tg('Pickup payment','',seg('pay.pick',[['online','Online'],['store','At pickup'],['both','Both']],p.conn?null:['online','both']))+
 tg('Cash on delivery: order limit','',inpS('pay.cap','$ or less',{w:'m',min:1,dis:!p.capOn})+sw(p.capOn,"TS.vr('pay.capOn',"+!p.capOn+")",'Cash order limit'))+
 tg('Cash on delivery: repeat customers','',inpS('pay.repeatN','orders',{min:1,dis:!p.repeatOn})+sw(p.repeatOn,"TS.vr('pay.repeatOn',"+!p.repeatOn+")",'Cash for repeat customers'))+
 '<div class="ts-res"><b>Result:</b> '+rs+'</div>'+
 '<button class="ts-link ts-more" onclick="TS.more()">'+(UI.more?'Hide options':'More options')+'</button>'+
 (UI.more?'<div class="ts-sub">'+tg('Unpaid pickup: pay at pickup','',sw(p.fbPk&&p.pick==='both',"TS.vr('pay.fbPk',"+!p.fbPk+")",'Unpaid pickup',p.pick!=='both'))+
 tg('Unpaid delivery: switch to cash','',sw(p.fbDl&&qual,"TS.vr('pay.fbDl',"+!p.fbDl+")",'Unpaid delivery',!qual))+'</div>':'')};};
TS.conn=function(){s.d.pay.conn=true;if(s.d.pay.pick==='store')s.d.pay.pick='both';bcast();draw();};
BODY['go.sub']=function(){var N=TS.cfg.outlets,P=TS.cfg.price;return {t:s.sub?'Subscribed':'Subscribe',d:'Activates your agent.',n:'Manage your plan any time in Settings \u203a Billing.',h:
 '<div class="ts-price">$'+(N*P).toLocaleString()+' <small>/ month · '+N+' location'+(N>1?'s':'')+'</small></div><div style="color:var(--tk-50);margin:6px 0 20px">Nothing is billed before you subscribe. Cancel any time.</div>'+TS.goSummary({finish:true})};};
BODY['go.fwd']=function(){return {t:'Forward your line to this number',d:'This is your Tringg number. It answers every call that reaches it.',n:'You can find this number any time in Settings \u203a Phone number.',h:
 '<div class="ts-num"><span class="m">'+NUM+'</span><button class="ts-btn line sm" onclick="TS.copy(this)">Copy</button></div>'+
 '<div style="color:var(--tk-50);margin-top:2px">We forward all your calls. Ask your network operator to forward your restaurant line to this number.</div>'};};
TS.copy=function(b){try{navigator.clipboard.writeText('+13125550147').catch(function(){});}catch(e){}b.textContent='Copied';setTimeout(function(){if(b.isConnected)b.textContent='Copy';},1400);};
var CATS=[['general','General'],['res','Reservation'],['ord','Ordering'],['catering','Catering'],['music','Music events']];
function faqBlock(cat,title){var rows=s.d.faqs.map(function(f,i){return [f,i];}).filter(function(x){return (x[0][2]||'general')===cat;});
 return (title?'<div style="margin:22px 0 10px"><span class="ts-cat2 c-'+cat+'">'+title+'</span></div>':'')+rows.map(function(x){var f=x[0],i=x[1];return '<div class="ts-faq"><input class="ts-in" value="'+esc(f[0])+'" aria-label="Question" onchange="TS.faq('+i+',0,this.value)"><textarea class="ts-ta" rows="2" aria-label="Answer" onchange="TS.faq('+i+',1,this.value)">'+esc(f[1])+'</textarea><button class="ts-link" style="color:var(--tk-50);font-size:12.5px;align-self:flex-start" onclick="TS.faqDel('+i+')">Remove</button></div>';}).join('')+'<button class="ts-btn line sm" onclick="TS.faqAdd(\''+cat+'\')">Add a question</button>';}
TS.faq=function(i,j,v){s.d.faqs[i][j]=v;bcast();};TS.faqDel=function(i){s.d.faqs.splice(i,1);bcast();draw();};TS.faqAdd=function(c){s.d.faqs.push(['','',c]);bcast();draw();};
BODY['res.faq']=function(){return {t:'Reservation FAQs',d:'Questions callers ask about booking a table. The agent answers from these.',n:'Add or change FAQs any time in Settings \u203a FAQ / Knowledge.',h:faqBlock('res')};};
BODY['ord.faq']=function(){return {t:'Ordering FAQs',d:'Questions callers ask about ordering, delivery and pickup.',n:'Add or change FAQs any time in Settings \u203a FAQ / Knowledge.',h:faqBlock('ord')};};
BODY['kb.all']=function(){return {t:'FAQs',d:'Everything the agent can answer about your restaurant, by topic.',n:'Add or change FAQs any time in Settings \u203a FAQ / Knowledge.',h:CATS.map(function(c){return faqBlock(c[0],c[1]);}).join('')};};
BODY['enq.faq']=BODY['kb.all'];
TS.faqPage=function(){var g=CATS.map(function(c){var r=s.d.faqs.filter(function(f){return (f[2]||'general')===c[0];});return r.length?'<div style="margin:0 0 12px"><span class="ts-cat2 c-'+c[0]+'">'+c[1]+'</span></div>'+r.map(function(f){return '<div><div class="fl">'+esc(f[0])+'</div><div class="fh">'+esc(f[1])+'</div></div>';}).join('<div class="sep"></div>'):'';}).filter(Boolean).join('<div class="sep"></div>');
 return '<div class="scard">'+g+'<div class="sep"></div><button class="btn btn-line btn-sm" style="align-self:flex-start" onclick="TS.open(\'kb\')">Edit FAQs</button></div>';};
var VAL={
 'res.faq':function(){return faqErr('res');},'enq.faq':function(){return faqErr();},'ord.faq':function(){return faqErr('ord');},'kb.all':function(){return faqErr();},
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
  var t={enq:'Enquiries are set up',res:'Reservations are set up',ord:'Ordering is set up',go:'You’re live'}[k]||'Saved';
  main=head+'<div class="ts-body"><div class="ts-ok"><div class="ts-okc">'+CHK.replace('width="14" height="14"','width="28" height="28"')+'</div><h3>'+t+'</h3>'+(k==='go'?TS.liveList():'')+'<div style="display:flex;justify-content:center"><button class="ts-btn" onclick="TS.close()">Done</button></div></div></div>';
 }else{
  var b=BODY[key]();
  var cta=key==='go.sub'?(s.sub?'Continue':'Subscribe · $'+(TS.cfg.outlets*TS.cfg.price).toLocaleString()):key==='go.fwd'?'Done':key==='ord.menu'&&UI.mp==='review'?'Publish':last?'Save':'Continue';
  var dis=(key==='ord.menu'&&UI.mp!=='review')?'disabled':'';
  main=head+'<div class="ts-body"><h2 class="ts-h">'+b.t+'</h2>'+(b.d?'<p class="ts-d">'+b.d+'</p>':'')+b.h+(b.n?'<div class="ts-fn">'+b.n+'</div>':'')+'</div><div class="ts-foot">'+(i>0?'<button class="ts-btn line" onclick="TS.goto(\''+st[i-1][0]+'\')">Back</button>':'')+'<span class="sp"></span><span class="ts-err" role="alert">'+esc(UI.err)+'</span>'+'<button class="ts-btn" '+dis+' onclick="TS.save()">'+cta+'</button></div>';
 }
 r.innerHTML='<div class="ts-ov" onmousedown="if(event.target===this)TS.close()"><div class="ts-sheet" role="dialog" aria-modal="true" aria-label="'+esc(SVC[k].n)+'">'+main+'</div></div>';
}
TS.open=function(k,id){
 if(k!=='go'&&k!=='kb'&&k!=='enq'&&!s.svc[k]){s.svc[k]=true;bcast();L.forEach(function(f){f(s);});}
 UI={open:true,svc:k,step:id||TS.nextStep(k)||STEPS[k][0][0],stage:'form',mp:null,err:'',more:false};setMp();draw();};
function setMp(){UI.more=false;if(UI.svc==='ord'&&UI.step==='menu')UI.mp=s.d.menu.src?'review':'choose';else UI.mp=null;}
TS.close=function(){UI.open=false;draw();};
TS.goto=function(id){UI.step=id;UI.stage='form';UI.err='';UI.more=false;setMp();draw();};
TS.skip=function(){var i=idx();if(i<cur().length-1){UI.step=cur()[i+1][0];UI.err='';setMp();draw();}else TS.close();};
TS.save=function(){var key=UI.svc+'.'+UI.step,e=VAL[key]?VAL[key]():'';if(e){UI.err=e;draw();return;}
 var k=UI.svc;
 if(k==='kb'){bcast();TS.close();return;}
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
 return act()?'<span class="ts-pl g">Live</span>':'<span class="ts-pl g">Ready</span>';};
function ring(d,t,dk){var C=2*Math.PI*21,p=t?d/t:0;return '<svg class="ts-ring" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="21" fill="none" stroke="'+(dk?'#333':'#EAE9E4')+'" stroke-width="6"/><circle cx="27" cy="27" r="21" fill="none" stroke="#4FC2B4" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(C*p).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 27 27)"/><text x="27" y="31.5" text-anchor="middle" font-size="13" font-weight="700" fill="'+(dk?'#fff':'#111')+'" font-family="Poppins,sans-serif">'+d+'/'+t+'</text></svg>';}
function rowsOf(k){return STEPS[k].map(function(x,j){var dn=s.done[k+'.'+x[0]];return '<button class="ts-row '+(dn?'done':'')+'" onclick="TS.open(\''+k+'\',\''+x[0]+'\')"><span class="ts-n">'+(dn?CHK:j+1)+'</span><span class="t">'+x[1]+'</span><span class="go">'+(dn?'Edit':'Start')+'</span></button>';}).join('');}
TS.nextKey=function(){var ks=['enq','res','ord'];for(var i=0;i<ks.length;i++){if(TS.sel(ks[i])&&!TS.stat(ks[i]).complete)return ks[i];}return act()?null:'go';};
function chips(k){var nx=TS.nextStep(k);return STEPS[k].map(function(st,j){var dn=s.done[k+'.'+st[0]];return '<button class="ts-chp '+(dn?'done':'')+'" onclick="TS.open(\''+k+'\',\''+st[0]+'\')"><span class="n">'+(dn?CHK.replace('width="14" height="14"','width="11" height="11"'):j+1)+'</span>'+st[1]+'</button>';}).join('');}
TS.list=function(o){o=o||{};var nk=TS.nextKey(),ks=['enq','res','ord'].concat(o.go===false?[]:['go']);
 return '<div class="ts-card ts-sl">'+ks.map(function(k){var on=TS.sel(k),x=TS.stat(k),nx=k===nk;
  var lbl=k==='go'?(act()?'Review':'Go live'):x.complete?'Review':x.done?'Continue':'Start',
   tog=(o.toggle&&(k==='res'||k==='ord'))?sw(on,"TS.toggle('"+k+"')",SVC[k].n):'',
   go=k==='go'?"TS.open('go','"+(act()?'fwd':'sub')+"')":"TS.open('"+k+"')",
   pl=k==='go'?(act()?'<span class="ts-pl g">Active</span>':'<span class="ts-pl a">Not started</span>'):pill(k);
  return '<div class="ts-sr'+(on?'':' off')+(nx?' next':'')+'"><div class="ts-sr-top"><div class="ts-sr-t"><b>'+SVC[k].n+'</b>'+pl+(nx?'<span class="ts-nb">Next</span>':'')+'</div><div class="ts-sr-a">'+tog+(on?'<button class="ts-btn sm '+(nx?'ts-pulse':'line')+'" onclick="'+go+'">'+lbl+'</button>':'')+'</div></div><div class="ts-sr-d">'+(on?SVC[k].d:'Not included')+'</div>'+(on?'<div class="ts-chs">'+(k==='go'?['sub','fwd'].map(function(id,j){var dn=s.done['go.'+id];return '<button class="ts-chp '+(dn?'done':'')+'" onclick="TS.open(\'go\',\''+id+'\')"><span class="n">'+(dn?CHK.replace('width="14" height="14"','width="11" height="11"'):j+1)+'</span>'+STEPS.go[j][1]+'</button>';}).join(''):chips(k))+'</div>':'')+'</div>';}).join('')+'</div>';};
TS.card=function(k,o){return TS.list(o);};
TS.pick=function(){return '<div class="ts-pick">'+['enq','res','ord'].map(function(k){var on=TS.sel(k),n=STEPS[k].length;if(k==='enq')return '<div class="ts-pk on" style="cursor:default"><span class="bx" style="background:var(--tk-mint);border-color:var(--tk-mint);color:#06231e">'+CHK+'</span><b>'+SVC[k].n+'</b><span class="d">'+SVC[k].d+'</span><span class="l">Always on</span></div>';return '<button class="ts-pk '+(on?'on':'')+'" onclick="TS.toggle(\''+k+'\')" aria-pressed="'+on+'"><span class="bx">'+CHK+'</span><b>'+SVC[k].n+'</b><span class="d">'+SVC[k].d+'</span></button>';}).join('')+'</div>';};
TS.items=function(){var a=[];['enq','res','ord'].forEach(function(k){if(TS.sel(k)){var x=TS.stat(k);if(!x.complete)a.push({k:k,t:'Finish '+SVC[k].n.toLowerCase(),m:x.left+' step'+(x.left>1?'s':'')+' left',c:'Continue',f:"TS.open('"+k+"')"});}});
 if(!act())a.push({k:'go',t:'Go live',m:a.length?'':'Everything is ready',c:'Go live',f:"TS.open('go','sub')"});

 return a;};
TS.strip=function(only){var a=TS.items().filter(function(i){return !only||i.k===only;});if(!a.length)return '';
 return '<div class="ts-strip">'+a.map(function(i){return '<div class="ts-srow"><span class="dot"></span><span class="m"><b>'+i.t+'</b>'+(i.m?' · '+i.m:'')+'</span><button class="ts-btn sm'+(a.indexOf(i)===0?' ts-pulse':' line')+'" onclick="'+i.f+'">'+i.c+'</button></div>';}).join('')+'</div>';};
TS.pillHTML=function(){if(act())return '';
 return act()?'<div class="live"><span class="d" style="background:#E9B44C"></span>Forward your line<button style="color:#fff;font-weight:600;text-decoration:underline;padding:0 6px" onclick="TS.open(\'go\',\'fwd\')">Set up</button></div>':'<div class="live"><span class="d" style="background:#E9B44C"></span>Not live<button style="color:#fff;font-weight:600;text-decoration:underline;padding:0 6px" onclick="TS.open(\'go\',\'sub\')">Go live</button></div>';};
/* variant C: the overview is the setup page */
TS.center=function(o){o=o||{};if(TS.allDone())return '';var t=TS.totals(),left=t.total-t.done;
 return '<section class="ts-center'+(o.grow?' ts-grow':'')+'"><div class="ts-chd"><div><h2>Set up</h2><p>'+left+' step'+(left===1?'':'s')+' left</p></div>'+ring(t.done,t.total)+(t.done>0?'<button class="ts-xb" style="align-self:center" aria-label="Collapse setup" title="Collapse" onclick="TS.collapse()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg></button>':'')+'</div>'+TS.list({toggle:true})+'</section>';};
TS.host={collapse:function(){},expand:function(){}};
TS.collapse=function(){var el=document.querySelector('.ts-center');if(el){el.classList.remove('ts-grow');void el.offsetWidth;el.classList.add('ts-fly');setTimeout(function(){TS.host.collapse();},440);}else TS.host.collapse();};
TS.expand=function(){TS.host.expand();};
TS.railWidget=function(){if(TS.allDone())return '';var t=TS.totals(),left=t.total-t.done;
 return '<button class="ts-rail ts-pop" onclick="TS.expand()" aria-label="Open setup, '+left+' steps left">'+ring(t.done,t.total,true)+'<span><b>Set up</b><small>'+left+' step'+(left===1?'':'s')+' left</small></span></button>';};
TS.goCard=function(){var x=TS.stat('go');return '<div class="ts-card"><div class="ts-ch"><div><div class="ts-ct">Go live '+(x.complete?'<span class="ts-pl g">Live</span>':'<span class="ts-pl a">'+(x.done?x.done+' of 2':'Not started')+'</span>')+'</div></div></div><div class="ts-rows">'+rowsOf('go')+'</div></div>';};
/* variant B: a short status list on the overview; each row leads to the tab that owns the steps */
TS.status=function(){if(TS.allDone())return '';var nk=TS.nextKey();
 var rows=[['enq','Enquiries',"TS.open('enq')"],['res','Reservations',"TS.nav('reservations')"],['ord','Ordering',"TS.nav('orders')"]].filter(function(r){return TS.sel(r[0]);}).map(function(r){var x=TS.stat(r[0]),nx=r[0]===nk;return '<button class="ts-row '+(x.complete?'done':'')+(nx?' next':'')+'" onclick="'+r[2]+'"><span class="ts-n">'+(x.complete?CHK:'\u2022')+'</span><span class="t">'+r[1]+(x.complete?'':' <span style="color:var(--tk-50);font-weight:400">\u00b7 '+x.left+' left</span>')+(nx?'<span class="ts-nb">Next</span>':'')+'</span><span class="go'+(nx?' ts-gobtn ts-pulse':'')+'">'+(x.complete?'Open':'Continue')+'</span></button>';}).join('');
 var g=!act()?'<button class="ts-row'+(nk==='go'?' next':'')+'" onclick="TS.open(\'go\',\'sub\')"><span class="ts-n">\u2022</span><span class="t">Go live'+(nk==='go'?'<span class="ts-nb">Next</span>':'')+'</span><span class="go'+(nk==='go'?' ts-gobtn ts-pulse':'')+'">Go live</span></button>':'';
 return '<div class="ts-card" style="margin-bottom:20px"><div class="ts-ct">Finish setting up</div><div class="ts-cd">Pick up where onboarding left off.</div><div class="ts-rows">'+rows+g+'</div></div>';};
/* variant B: a module page that is the setup */
TS.panel=function(k){var x=TS.stat(k),n=SVC[k].n,nx=TS.nextStep(k);
 var steps=STEPS[k].map(function(t,j){var dn=s.done[k+'.'+t[0]];return '<div class="ts-sc '+(dn?'done':'')+'"><span class="ts-n">'+(dn?CHK:j+1)+'</span><span class="t">'+t[1]+'</span><button class="ts-btn sm '+(dn?'line':t[0]===nx?'ts-pulse':'line')+'" onclick="TS.open(\''+k+'\',\''+t[0]+'\')">'+(dn?'Edit':t[0]===nx?'Start':'Open')+'</button></div>';}).join('');
 var tail='';
 return '<div class="scroll"><div class="page" style="max-width:860px"><div class="ts-pan"><div style="display:flex;gap:20px;align-items:center"><h2 style="flex:1">'+(x.complete?n+' is set up':'Set up '+n.toLowerCase())+'</h2>'+ring(x.done,x.total)+'</div>'+steps+tail+'</div>'+TS.skel(k)+'</div></div>';};
TS.liveList=function(){return '<div style="max-width:320px;margin:0 auto 22px;text-align:left">'+['res','ord'].filter(function(k){return TS.sel(k);}).map(function(k){var r=TS.ready(k);return '<div class="ts-cat"><span>'+SVC[k].n+'</span><span>'+(r?'<span class="ts-pl g">Live</span>':'<span class="ts-pl a">Finish setup</span>')+'</span></div>';}).join('')+'</div>';};
TS.readyPage=function(k){var d=s.d,name=d.agent.name,fwd=!!s.done['go.fwd'],ac=act(),what={res:'reservations',ord:'orders'}[k];
 var other=k==='res'?'ord':'res',otherPending=TS.sel(other)&&!TS.stat(other).complete,info;
 if(k==='res'){var r=d.res;info=[r.minP+'\u2013'+r.maxP+' guests','Up to '+r.perDay+' a day',r.win+' days ahead'];}
 else{var q=d.svc;info=[q.pick?'Pickup \u00b7 '+q.prep+' min':null,q.del?'Delivery \u00b7 '+q.mi+' mi':null,d.menu.n+' menu items'].filter(Boolean);}
 var num='<div class="ts-num" style="margin:14px auto 10px;max-width:420px;text-align:left"><span class="m">'+NUM+'</span><button class="ts-btn line sm" onclick="TS.copy(this)">Copy</button></div>';
 var body=!ac?'<p class="ts-rp">Subscribe, then forward your line to this number.</p>'+num
  :'<p class="ts-rp"><b>Forward your line to this number.</b> We forward all your calls. Ask your network operator to forward your restaurant line to it.</p>'+num;
 var main=!ac?'<button class="ts-btn ts-pulse" onclick="TS.open(\'go\',\'sub\')">Go live</button>':'<button class="ts-btn ts-pulse" onclick="TS.open(\'go\',\'fwd\')">Forward your line</button>';
 var alt=otherPending?'<button class="ts-btn line" onclick="'+(TS.variant==='B'?"TS.nav('"+(other==='res'?'reservations':'orders')+"')":"TS.open('"+other+"')")+'">Set up '+SVC[other].n.toLowerCase()+'</button>':'<button class="ts-btn line" onclick="TS.open(\''+k+'\')">Edit setup</button>';
 return '<div class="scroll"><div class="page ts-cpage"><div class="ts-ready"><div class="ts-agent"><span class="ts-av">'+esc(name[0]||'N')+'</span><h2>'+esc(name)+' is ready to take '+what+'</h2><div class="ts-chips">'+info.map(function(x){return '<span class="ts-chip">'+x+'</span>';}).join('')+'</div></div>'+body+'<div style="display:flex;gap:12px;margin-top:22px;flex-wrap:wrap;justify-content:center">'+main+alt+'</div></div></div></div>';};
TS.skel=function(){return '<div class="ts-skel" aria-hidden="true"><div class="t"><i></i><i></i><i></i><i></i></div><div class="r"></div><div class="r"></div><div class="r"></div></div>';};
/* variants A and C: the module page is dimmed behind one slim row */
TS.bar=function(k){var x=TS.stat(k),n=SVC[k].n,nx=TS.nextStep(k);
 var steps=STEPS[k].map(function(st,j){var dn=s.done[k+'.'+st[0]];return '<button class="ts-row '+(dn?'done':'')+'" onclick="TS.open(\''+k+'\',\''+st[0]+'\')"><span class="ts-n">'+(dn?CHK:j+1)+'</span><span class="t">'+st[1]+'</span><span class="go">'+(dn?'Edit':st[0]===nx?'Start':'Open')+'</span></button>';}).join('');
 return '<div class="scroll"><div class="page ts-cpage">'+TS.skel(k)+'<div class="ts-dlg" role="dialog" aria-label="Set up '+n.toLowerCase()+'">'+ring(x.done,x.total)+'<h2>Finish '+n.toLowerCase()+' setup</h2><p>'+x.left+' step'+(x.left>1?'s':'')+' left</p><div class="ts-rows" style="margin-top:14px;text-align:left">'+steps+'</div><div style="margin-top:22px"><button class="ts-btn ts-pulse" style="width:100%" onclick="TS.open(\''+k+'\')">'+(x.done?'Continue setup':'Start setup')+'</button></div></div></div></div>';};
/* what goes live, from what is finished */
TS.goSummary=function(o){o=o||{};var rows=[['enq','Answers questions about your restaurant','Review your FAQs and the agent answers from them'],['res','Takes table bookings','Finish setup and the agent takes bookings too'],['ord','Takes pickup and delivery orders','Finish setup and the agent takes orders too']].filter(function(r){return TS.sel(r[0]);});
 var okN=[],waitN=[];rows.forEach(function(r){(TS.stat(r[0]).complete?okN:waitN).push(SVC[r[0]].n.toLowerCase());});
 var head=!waitN.length?'Everything is set up. Your agent goes live for all of it.':!okN.length?'Your agent will answer calls using your details. '+waitN.join(' and ')+' start once you finish setup.':'Your agent goes live for '+okN.join(' and ')+'. '+waitN.join(' and ').replace(/^./,function(c){return c.toUpperCase();})+' start'+(waitN.length>1?'':'s')+' as soon as you finish setup.';
 return '<div class="ts-gs"><p class="ts-gsh">'+head+'</p>'+rows.map(function(r){var ok=TS.stat(r[0]).complete;return '<div class="ts-cat"><span>'+SVC[r[0]].n+'</span><span>'+(ok?'<span class="ts-pl g">Active</span>':(o.finish?'<button class="ts-link" onclick="TS.open(\''+r[0]+'\')">Finish setup</button>':'<span class="ts-pl a">Finish setup</span>'))+'</span></div>';}).join('')+'</div>';};

/* ───────── Overview (C): welcome note + "Let's get you started" in a row of cards ───────── */
TS.ov={open:true,sel:null};TS.welcome=window.TS_WELCOME||'1';TS.welcomed=false;TS.cfg.user='there';
TS.host.render=function(){};
var COLS=[['enq','Enquiries','Answers questions about your restaurant',"TS.open('enq')"],['res','Reservations','Takes table bookings by phone',"TS.nav('reservations')"],['ord','Ordering','Takes pickup and delivery orders',"TS.nav('orders')"],['go','Go live','Subscribe so the agent answers your calls',"TS.open('go','sub')"]];
var CHK11=CHK.replace('width="14" height="14"','width="11" height="11"');
function goChips(){return [['sub','Subscribe']].map(function(x,j){var dn=act();return '<button class="ts-chp '+(dn?'done':'')+'" onclick="TS.open(\'go\',\'sub\')"><span class="n">'+(dn?CHK11:j+1)+'</span>'+x[1]+'</button>';}).join('');}
function colInfo(k){var on=TS.sel(k),x=k==='go'?{done:act()?1:0,total:1,complete:act(),left:act()?0:1}:TS.stat(k);return {on:on,x:x};}
TS.nextFn=function(){var k=TS.nextKey();if(!k)return '';var c=COLS.filter(function(c){return c[0]===k;})[0];return c?c[3]:'';};
var NEXTT={enq:['Review your FAQs','answers from your details. Check the FAQs so they are exact.'],res:['Set up reservations','takes bookings by phone once you add your booking rules.'],ord:['Set up ordering','takes orders once you add your menu, delivery, taxes and payments.'],go:['Go live','answers your calls as soon as you subscribe.']};
function oneLine(){var n=s.d.agent.name,ok=[],left=0;['enq','res','ord'].forEach(function(k){if(!TS.sel(k))return;if(TS.stat(k).complete)ok.push(SVC[k].n.toLowerCase());});var tt=TS.totals();left=tt.total-tt.done;
 if(TS.allDone())return n+' is live and answering your calls.';
 if(!ok.length)return n+' is created. Finish setup and '+n+' starts answering your calls.';
 return n+' is ready for '+ok.join(' and ')+'. '+left+' step'+(left===1?'':'s')+' left to go live.';}
TS.welcomeHead=function(){return '<div class="ts-wh"><h1>Welcome, '+esc(TS.cfg.user)+'!</h1><p>'+esc(oneLine())+'</p></div>';};
TS.hero=function(){var k=TS.nextKey();if(!k)return TS.welcomeHead();var n=s.d.agent.name,tt=TS.totals(),left=tt.total-tt.done,h=NEXTT[k];
 return '<div class="ts-hero"><div style="flex:1;min-width:0"><div class="ts-hero-e">Welcome, '+esc(TS.cfg.user)+'</div><h2>'+h[0]+'</h2><p>'+esc(n)+' '+h[1]+'</p><div class="ts-hero-c"><span>'+tt.done+' of '+tt.total+' done</span><span>'+left+' step'+(left===1?'':'s')+' left</span></div></div><button class="ts-btn ts-hero-b ts-pulse" onclick="'+TS.nextFn()+'">'+(k==='go'?'Go live':'Continue')+'</button></div>';};
TS.started=function(){if(TS.allDone())return '';var tt=TS.totals(),nk=TS.nextKey(),sel=TS.ov.sel,open=TS.ov.open;
 var cols=COLS.map(function(c,i){var k=c[0],ci=colInfo(k),nx=k===nk,x=ci.x,
  act2=!ci.on?'<span class="ts-pl">Off</span><button class="ts-btn sm line" onclick="TS.add(\''+k+'\')">Add</button>':ci.x.complete?'<span class="ts-done2">'+CHK11+' Completed</span>':'<button class="ts-btn sm '+(nx?'ts-pulse':'line')+'" onclick="'+c[3]+'">'+(k==='go'?'Go live':x.done?'Continue':'Set up')+'</button>'+(x.done&&k!=='go'?'<span class="ts-cnt">'+x.done+' of '+x.total+'</span>':'');
  return '<div class="ts-col'+(nx?' next':'')+(sel===k?' sel':'')+'"><div class="ts-col-t"><span class="num">'+(i+1)+'.</span>'+c[1]+(nx?'<span class="ts-nb">Next</span>':'')+'</div><p>'+c[2]+'</p><div class="ts-col-a">'+act2+'</div><button class="ts-col-m" onclick="TS.ovSel(\''+k+'\')" aria-expanded="'+(sel===k)+'">Steps<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button></div>';}).join('');
 var det='';if(sel){var ci=colInfo(sel),c=COLS.filter(function(c){return c[0]===sel;})[0];
  det='<div class="ts-det"><div class="ts-det-h"><b>'+c[1]+' steps</b>'+((sel==='res'||sel==='ord')?'<span class="ts-det-sw">Include'+sw(ci.on,"TS.toggle('"+sel+"')",c[1])+'</span>':'')+'</div>'+(ci.on?(sel==='go'?'<div class="ts-chs" style="margin-top:0">'+goChips()+'</div>'+TS.goSummary({finish:true})+'<div class="ts-num" style="margin:16px 0 0"><span class="m">'+NUM+'</span><button class="ts-btn line sm" onclick="TS.copy(this)">Copy</button></div><div style="color:var(--tk-50);font-size:13px;margin-top:8px">Your Tringg number. Ask your network operator to forward your restaurant line to it.</div>':'<div class="ts-chs" style="margin-top:0">'+chips(sel)+'</div>'):'<div style="color:var(--tk-50)">Not included. Switch it on to set it up.</div>')+'</div>';}
 var nk2=nk?COLS.filter(function(c){return c[0]===nk;})[0]:null;
 return '<section class="ts-gs2'+(open?'':' closed')+'"><div class="ts-gs2-h" onclick="TS.ovToggle(event)"><div class="ts-gs2-t"><h2>Let’s get you started</h2><div class="ts-gs2-p"><div class="ts-bar"><i style="width:'+(tt.total?tt.done/tt.total*100:0)+'%"></i></div><span>'+tt.done+' of '+tt.total+' steps done</span></div></div>'+(nk2?'<button class="ts-btn sm ts-gs2-n" onclick="event.stopPropagation();'+TS.nextFn()+'">Next: '+nk2[1]+'</button>':'')+'<button class="ts-xb" aria-label="Show or hide" id="ts-gs2-x"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg></button></div><div class="ts-gs2-b"><div><div class="ts-cols">'+cols+'</div>'+det+'</div></div></section>';};
TS.ovToggle=function(e){var el=document.querySelector('.ts-gs2');if(!el)return;el.classList.toggle('closed');TS.ov.open=!el.classList.contains('closed');};
TS.ovSel=function(k){TS.ov.sel=TS.ov.sel===k?null:k;TS.host.render();};
TS.overviewTop=function(){var top=TS.welcome==='2'&&!TS.allDone()?TS.hero():TS.welcomeHead();return top+TS.started();};
/* a dialog for the first visit: what is done, what is left, one button */
TS.showWelcome=function(){if(document.getElementById('ts-wl'))return;var n=s.d.agent.name,done=['Restaurant details','Agent '+n],todo=[];
 if(TS.stat('enq').complete)done.push('Enquiries FAQs');else todo.push('Review your FAQs');
 [['res','Reservations'],['ord','Ordering']].forEach(function(r){if(!TS.sel(r[0]))return;if(TS.stat(r[0]).complete)done.push(r[1]+' setup');else todo.push('Set up '+r[1].toLowerCase());});
 if(act())done.push('Go live');else todo.push('Go live');
 var li=function(a,ok){return a.map(function(x){return '<li class="'+(ok?'ok':'')+'"><span>'+(ok?CHK11:'')+'</span>'+esc(x)+'</li>';}).join('');};
 var d=document.createElement('div');d.id='ts-wl';
 d.innerHTML='<div class="ts-wl-ov"><div class="ts-wl" role="dialog" aria-label="Welcome"><div class="ts-rd"><i></i><i></i><i></i><b>'+esc(n[0]||'E')+'</b></div><h2>Welcome, '+esc(TS.cfg.user)+'!</h2><p class="ts-wl-s">'+esc(n)+' is created. Here is where things stand.</p><div class="ts-wl-g"><div><div class="ts-wl-l">Done</div><ul>'+li(done,true)+'</ul></div>'+(todo.length?'<div><div class="ts-wl-l">To do</div><ul>'+li(todo,false)+'</ul></div>':'')+'</div><button class="ts-btn ts-pulse" style="width:100%" onclick="TS.closeWelcome()">Let’s go</button></div></div>';
 document.body.appendChild(d);};
TS.closeWelcome=function(){var d=document.getElementById('ts-wl');if(d)d.remove();};
})();

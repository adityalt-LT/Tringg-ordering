/* Katie, the voice guide. Plays pre-recorded clips (Cartesia, voice "Katie") for the screen the user is on.
   The clips are recorded ahead of time, so no API key is needed here. */
(function(){
const CLIPS=__CLIPS__,LINES=__LINES__;
let on=false,cur=null,audio=null,hideT=null,talking=false;const heard={};
const css=document.createElement('style');css.textContent=`
#kv{position:fixed;right:14px;bottom:64px;z-index:1100;display:flex;flex-direction:column;align-items:flex-end;gap:10px;max-width:min(380px,calc(100% - 28px));font-family:Poppins,system-ui,sans-serif}
#kv .cd{background:#fff;border:1.5px solid #E6E4DE;border-radius:24px;padding:18px 22px;box-shadow:0 18px 44px -18px rgba(17,17,17,.35);opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .25s,transform .25s}
#kv .cd.show{opacity:1;transform:none;pointer-events:auto}
#kv .cd b{display:block;font-size:14px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#2F6F66;margin-bottom:6px}
#kv .cd p{margin:0;font-size:19px;line-height:1.5;color:#444;font-weight:400}
#kv .rw{display:flex;gap:10px;align-items:center}
#kv .rw button{font:600 16px Poppins,system-ui,sans-serif;cursor:pointer;border-radius:999px;display:inline-flex;align-items:center;gap:10px;transition:transform .15s,box-shadow .15s}
#kv .rw button:hover{transform:translate(-1px,-1px);box-shadow:2px 3px 0 #111}
#kv .pill{padding:13px 22px;border:1.5px solid #111;background:#fff;color:#111}
#kv .pill.on{background:#111;color:#fff;border-color:#111}
#kv .rp{width:48px;height:48px;justify-content:center;padding:0;border:1.5px solid #111;background:#fff;color:#111}
#kv svg{flex-shrink:0}
#kv .bars{display:inline-flex;gap:3px;align-items:center;height:20px}
#kv .bars i{display:block;width:4px;border-radius:2px;background:#4FC2B4;height:16px}
#kv .bars.talk i{animation:kvb .9s ease-in-out infinite}#kv .bars.talk i:nth-child(2){animation-delay:.15s}#kv .bars.talk i:nth-child(3){animation-delay:.3s}
#kv .bars:not(.talk) i:nth-child(1){height:12px}#kv .bars:not(.talk) i:nth-child(3){height:10px}
@keyframes kvb{0%,100%{height:6px}50%{height:20px}}
@media(prefers-reduced-motion:reduce){#kv .bars.talk i{animation:none}}`;
document.head.appendChild(css);
const SPK='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const MUTE='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>';
const RE='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>';
const root=document.createElement('div');root.id='kv';root.innerHTML='<div class="cd" id="kv-cd" role="status" aria-live="polite"><b>Katie</b><p id="kv-tx"></p></div><div class="rw"><button class="rp" id="kv-re" aria-label="Hear it again" style="display:none">'+RE+'</button><button class="pill" id="kv-pill" aria-pressed="false"></button></div>';
document.body.appendChild(root);
const cd=document.getElementById('kv-cd'),tx=document.getElementById('kv-tx'),pill=document.getElementById('kv-pill'),re=document.getElementById('kv-re');
function draw(){pill.className='pill'+(on?' on':'');pill.setAttribute('aria-pressed',on);
 pill.innerHTML=on?SPK+'<span class="bars'+(talking?' talk':'')+'"><i></i><i></i><i></i></span><span>Voice guide on</span>':MUTE+'<span>Turn on voice guide</span>';re.style.display=on?'inline-flex':'none';}
function caption(k,show){clearTimeout(hideT);if(!show||!LINES[k]){cd.classList.remove('show');return;}tx.textContent=LINES[k];cd.classList.add('show');}
function stop(){if(audio){audio.onended=null;audio.pause();audio=null;}talking=false;}
function play(k,force){if(!on||!CLIPS[k])return;if(!force&&heard[k])return;heard[k]=1;stop();
 audio=new Audio(CLIPS[k]);talking=true;draw();caption(k,true);
 audio.onended=()=>{talking=false;draw();hideT=setTimeout(()=>{if(cur===k)caption(k,false);},6000);};
 audio.play().catch(()=>{talking=false;draw();});}
function setOn(v){on=v;if(!v){stop();caption(null,false);draw();return;}draw();if(cur)play(cur,true);}
pill.onclick=()=>setOn(!on);
re.onclick=()=>{if(cur)play(cur,true);};
draw();
window.addEventListener('message',e=>{const m=e.data;if(!m||m.tringg!=='ctx')return;
 const vis=(e.source===ob.contentWindow&&!ob.hidden)||(e.source===db.contentWindow&&!db.hidden);if(!vis)return;
 cur=m.key;if(on)play(cur,false);});
['b-ob','b-db','b-rd'].forEach(id=>{const b=document.getElementById(id);if(b)b.addEventListener('click',()=>setTimeout(()=>{const f=!ob.hidden?ob:db;f.contentWindow.postMessage({tringg:'ctxreq'},'*');},250));});
window.addEventListener('message',e=>{const m=e.data;if(m&&m.tringg==='handoff')setTimeout(()=>{db.contentWindow.postMessage({tringg:'ctxreq'},'*');},500);});
})();

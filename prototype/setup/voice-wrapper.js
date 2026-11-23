/* Katie, the voice guide. Plays pre-recorded clips (Cartesia, voice "Katie") for the screen the user is on.
   The clips are recorded ahead of time, so no API key is needed here. */
(function(){
const CLIPS=__CLIPS__,LINES=__LINES__;
let on=false,asked=false,cur=null,audio=null,hideT=null;const heard={};
const css=document.createElement('style');css.textContent=`
#kv{position:fixed;left:50%;bottom:70px;transform:translate(-50%,16px);z-index:1100;width:min(560px,calc(100% - 24px));display:flex;gap:12px;align-items:flex-start;background:#111;color:#fff;border-radius:20px;padding:14px 16px;box-shadow:0 14px 40px rgba(0,0,0,.35);font-family:Poppins,system-ui,sans-serif;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s}
#kv.show{opacity:1;transform:translate(-50%,0);pointer-events:auto}
#kv .av{width:38px;height:38px;border-radius:50%;background:#4FC2B4;color:#06231e;font-weight:700;display:grid;place-items:center;flex-shrink:0;position:relative}
#kv.talk .av::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid #4FC2B4;animation:kvp 1.1s ease-out infinite}
@keyframes kvp{from{transform:scale(.85);opacity:.9}to{transform:scale(1.25);opacity:0}}
#kv .tx{flex:1;min-width:0}#kv .tx b{display:block;font-size:12.5px;color:#4FC2B4;font-weight:600;margin-bottom:2px}#kv .tx span{font-size:14px;line-height:1.45;color:#eee}
#kv .bt{display:flex;gap:6px;align-items:center;flex-shrink:0}#kv button{font:600 12px Poppins,system-ui,sans-serif;border:0;border-radius:999px;padding:7px 12px;cursor:pointer;background:#2a2a2a;color:#fff}#kv button.pri{background:#4FC2B4;color:#06231e}#kv button:hover{filter:brightness(1.15)}
#b-kv.on{background:#4FC2B4;color:#06231e}`;
document.head.appendChild(css);
const el=document.createElement('div');el.id='kv';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el);
const sw=document.getElementById('sw'),btn=document.createElement('button');btn.id='b-kv';btn.textContent='Katie voice';btn.title='Turn the voice guide on or off';
sw.insertBefore(btn,document.getElementById('b-ob'));
function view(k,talking,intro){clearTimeout(hideT);
 if(intro){el.innerHTML='<div class="av">K</div><div class="tx"><b>Katie</b><span>Hi, I\'m Katie. Want me to guide you through setup by voice?</span></div><div class="bt"><button class="pri" id="kv-on">Turn on</button><button id="kv-no">Not now</button></div>';
  el.className='show';document.getElementById('kv-on').onclick=()=>{setOn(true);};document.getElementById('kv-no').onclick=()=>{el.className='';};return;}
 el.innerHTML='<div class="av">K</div><div class="tx"><b>Katie</b><span>'+LINES[k]+'</span></div><div class="bt"><button id="kv-re" title="Hear it again">Replay</button><button id="kv-x" title="Close">✕</button></div>';
 el.className='show'+(talking?' talk':'');document.getElementById('kv-re').onclick=()=>play(k,true);document.getElementById('kv-x').onclick=()=>{stop();el.className='';};}
function stop(){if(audio){audio.pause();audio=null;}}
function play(k,force){if(!on||!CLIPS[k])return;if(!force&&heard[k])return;heard[k]=1;stop();
 audio=new Audio(CLIPS[k]);view(k,true);
 audio.onended=()=>{view(k,false);hideT=setTimeout(()=>{if(cur===k)el.className='';},7000);};
 audio.play().catch(()=>{view(k,false);});}
function setOn(v){on=v;btn.classList.toggle('on',v);if(!v){stop();el.className='';return;}asked=true;if(cur)play(cur,true);}
btn.onclick=()=>setOn(!on);
window.addEventListener('message',e=>{const m=e.data;if(!m||m.tringg!=='ctx')return;
 const vis=(e.source===ob.contentWindow&&!ob.hidden)||(e.source===db.contentWindow&&!db.hidden);if(!vis)return;
 cur=m.key;if(on)play(cur,false);else if(!asked&&CLIPS[cur]){asked=true;view(cur,false,true);}});
['b-ob','b-db','b-rd'].forEach(id=>{const b=document.getElementById(id);if(b)b.addEventListener('click',()=>setTimeout(()=>{const f=!ob.hidden?ob:db;f.contentWindow.postMessage({tringg:'ctxreq'},'*');},250));});
window.addEventListener('message',e=>{const m=e.data;if(m&&m.tringg==='handoff')setTimeout(()=>{db.contentWindow.postMessage({tringg:'ctxreq'},'*');},500);});
})();

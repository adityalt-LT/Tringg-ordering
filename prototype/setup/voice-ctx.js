/* Tells the wrapper which screen the user is on, so Katie can talk about it. */
(function(){
 var last='',tm=null;
 function dash(){
  if(typeof TS==='undefined'||typeof DB==='undefined'||typeof S==='undefined'||!S.route)return null;
  if(S.addO)return 'db.addoutlet';
  if(S.zed)return 'db.area';
  if(document.querySelector('.ts-sheet')){var h=document.querySelector('.ts-h');return /Go live|Subscribe|plan/i.test((h&&h.textContent)||'')?'db.go.sheet':null;}
  if(S.ch){var k=S.ch.k;var m={resr:'db.ch.resr',pick:'db.ch.pick',del:'db.ch.del',tax:'db.ch.tax',payx:'db.ch.payx',accx:'db.ch.accx',pre:'db.ch.pre'};return m[k]||null;}
  if(S.sdlg){if(S.set==='faq')return S.faqCat==='res'?'db.set.faq.res':'db.set.faq';if(S.set==='res-set')return 'db.set.res-set';if(S.set==='ord')return 'db.set.ord';return null;}
  if(S.route==='menu'){
   if(S.menu&&S.menu.flow==='extracting')return 'db.menu.extracting';
   if(DB.menuState==='none'||(S.menu&&S.menu.flow))return 'db.menu.import';
   if(DB.menuState==='draft')return 'db.menu.draft';
   return (S.outlet!=='all'&&OUTLETS.length>1)?'db.menu.single':'db.menu.live';}
  if(S.route==='reservations'){return TS.sel('res')&&!TS.stat('res').complete?'db.res.panel':null;}
  if(S.route==='orders'){if(!TS.sel('ord'))return null;if(window.JR&&JR.nextStep){return JR.nextStep()==='live'?'db.ord.ready':'db.ord.panel';}return TS.stat('ord').complete?'db.ord.ready':'db.ord.panel';}
  if(S.route==='overview'){
   var live=TS.active(),fwd=TS.get().done['go.fwd'],rdy=['enq','res','ord'].filter(function(k){return TS.sel(k)&&TS.stat(k).complete;});
   if(!live&&!rdy.length)return 'db.review';if(!live)return 'db.golive';if(!fwd)return 'db.fwd';return 'db.done';}
  return null;}
 function ob(){if(typeof STEPS==='undefined'||typeof GI==='undefined'||typeof S==='undefined'||typeof S.i!=='number')return null;return 'ob.'+STEPS[S.i];}
 function key(){try{return (typeof TS!=='undefined'&&typeof DB!=='undefined')?dash():ob();}catch(e){return null;}}
 function tick(){var k=key();if(k&&k!==last){last=k;parent.postMessage({tringg:'ctx',key:k},'*');}}
 window.addEventListener('message',function(e){if(e.data&&e.data.tringg==='ctxreq'){last='';tick();}});
 setInterval(tick,500);
})();

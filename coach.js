'use strict';
/* One prerecorded PRIMAL coach, one audio graph, with or without video. */
(()=>{
 const $=id=>document.getElementById(id),I=window.PrimalI18n;
 const cache=new Map();let serial=0,sources=[],ctx=null,output=null,mixer=null;
 const normalise=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/^[¡¿]|[.!?¡¿]+$/g,'').replace(/\s+/g,' ').replace(/\byab\b/g,'jab');
 function graph(){const c=window.PrimalMusic.getContext();if(!output){ctx=c;output=ctx.createGain();output.gain.value=.95;output.connect(ctx.destination);}return c;}
 async function prepare(){const c=graph();if(c.state!=='running')await c.resume();const id=I.lang+'-'+$('stance').value,bank=window.PrimalVoiceBank[id];if(!bank)throw Error('Voice bank unavailable');if(!cache.has(id)){const pending=fetch(bank.url).then(r=>{if(!r.ok)throw Error('Voice file unavailable');return r.arrayBuffer();}).then(b=>c.decodeAudioData(b)).catch(e=>{cache.delete(id);throw e;});cache.set(id,pending);}return {bank,buffer:await cache.get(id)};}
 function stop(){serial++;for(const s of sources){s.onended=null;try{s.stop();}catch{}}sources=[];}
 function say(text,done=()=>{}){
  stop();const ticket=serial;const rate=Math.max(.7,Math.min(1.3,Number($('rate').value)||1));
  prepare().then(({bank,buffer})=>{if(ticket!==serial)return;const parts=text.split(/\.\s*/).map(normalise).filter(Boolean),clips=parts.map(p=>bank.phrases[p]);if(!clips.length||clips.some(c=>!c))throw Error('Missing voice phrase: '+parts.filter((p,i)=>!clips[i]).join(', '));
   let at=ctx.currentTime;for(const [i,[start,duration]]of clips.entries()){const s=ctx.createBufferSource();s.buffer=buffer;s.playbackRate.value=rate;s.connect(output);const length=Math.max(.05,duration-.015);if(i===clips.length-1)s.onended=()=>{if(ticket===serial){sources=[];done();}};sources.push(s);s.start(at,start+.006,length);at+=length/rate;}
  }).catch(e=>{if(ticket!==serial)return;console.warn('PRIMAL voice',e);$('audioNote').textContent=I.lang==='en'?'Voice could not load. Check your connection and try again.':'No se pudo cargar la voz. Revisa tu conexión y vuelve a intentar.';done();});
 }
 // Optional narrated profiles use exactly the same output as the prerecorded coach.
 const profileCache=new Map();
 function preloadClip(url){
  const c=graph();
  if(!profileCache.has(url))profileCache.set(url,fetch(url).then(r=>{if(!r.ok)throw Error('Profile audio unavailable');return r.arrayBuffer();}).then(b=>c.decodeAudioData(b)).catch(e=>{profileCache.delete(url);throw e;}));
  return profileCache.get(url);
 }
 function playClip(url,done=()=>{}){
  stop();const ticket=serial;const c=graph();
  if(c.state!=='running')void c.resume().catch(()=>{});
  preloadClip(url).then(buffer=>{
   if(ticket!==serial)return;
   const source=c.createBufferSource();source.buffer=buffer;source.connect(output);
   source.onended=()=>{if(ticket===serial){sources=[];done();}};
   sources.push(source);source.start();
  }).catch(e=>{if(ticket!==serial)return;console.warn('PRIMAL profile',e);done();});
 }
 function attachRecorder(c,destination){graph();if(c!==ctx)throw Error('Shared context required');detachRecorder();mixer=destination;output.connect(mixer);}
 function detachRecorder(){if(mixer&&output){try{output.disconnect(mixer);}catch{}}mixer=null;}
 function update(){const sel=$('voices');sel.replaceChildren(new Option(I.lang==='en'?'PRIMAL Natural · same voice in every mode':'PRIMAL Natural · misma voz en todos los modos','primal'));sel.disabled=true;$('pitch').disabled=true;$('audioNote').textContent=I.lang==='en'?'One natural PRIMAL voice for training and video. Speed is adjustable; tone is fixed.':'Una misma voz natural PRIMAL para entrenar y grabar. Puedes ajustar la velocidad; el tono es fijo.';}
 document.addEventListener('tyson-language-change',()=>{stop();update();});window.PrimalVoice={say,stop,prepare,playClip,preloadClip,attachRecorder,detachRecorder,update,get available(){return true;}};update();
})();

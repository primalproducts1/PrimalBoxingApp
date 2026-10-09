 'use strict';
/* PRIMAL: voz del sistema operativo (más natural que clips sintéticos cortados).
   IMPORTANTE: SpeechSynthesis no ofrece pista de audio para MediaRecorder.
   En grabación escuchas esta misma voz; el video conserva una pista grabable
   provisional independiente hasta integrar audios profesionales autorizados. */
(() => {
 const I=window.PrimalI18n, synth=window.speechSynthesis;
 const $=id=>document.getElementById(id);
 let available=[], active=null, serial=0;
 const locale=()=>I.lang==='en'?'en-US':'es-CO';
 const score=v=>{
   const n=v.name.toLowerCase();let s=0;
   if(/premium|enhanced|neural|natural|siri/.test(n))s+=90;
   if(/google|microsoft/.test(n))s+=12;
   if(/jorge|diego|juan|carlos|david|pablo|daniel|alex|aaron/.test(n))s+=16;
   if(/es-co|es-mx|en-us/i.test(v.lang))s+=10;
   if(v.localService)s+=5;
   return s;
 };
 function update(){
   const sel=$('voices');if(!sel)return;
   const old=sel.value;
   available=synth? synth.getVoices().filter(v=>v.lang.toLowerCase().startsWith(I.lang)):[];
   sel.replaceChildren();
   if(!synth){sel.add(new Option(I.lang==='en'?'Voice unavailable':'Voz no disponible',''));sel.disabled=true;return;}
   for(const v of available){sel.add(new Option(v.name+' · '+v.lang,v.voiceURI));}
   if(!available.length)sel.add(new Option(I.lang==='en'?'Automatic English voice':'Voz automática en español',''));
   const selected=available.find(v=>v.voiceURI===old)||[...available].sort((a,b)=>score(b)-score(a))[0];
   if(selected)sel.value=selected.voiceURI;
   sel.disabled=false;
   const note=$('audioNote');if(note)note.textContent=I.lang==='en'?'The voice quality depends on voices installed on your device.':'La calidad depende de las voces instaladas en tu equipo. En iPhone prueba voces mejoradas en Ajustes → Accesibilidad → Contenido leído.';
 }
 function stop(){serial++;if(active){active.onend=null;active.onerror=null;active=null;}try{synth?.cancel()}catch{}}
 function say(text,done=()=>{}){
   stop();const ticket=serial;
   if(!synth){done();return;}
   const u=new SpeechSynthesisUtterance(String(text).replace(/\bjab\b/gi,I.lang==='en'?'Jab':'Yab'));
   u.lang=locale();
   u.voice=available.find(v=>v.voiceURI===$('voices').value)||null;
   u.rate=Number($('rate').value)||0.95;
   u.pitch=Number($('pitch').value)||1;
   u.volume=1;
   active=u;let ended=false;
   const finish=()=>{if(ended||ticket!==serial)return;ended=true;active=null;done()};
   u.onend=finish;u.onerror=finish;
   try{synth.speak(u)}catch{finish();return;}
   // Occasional mobile WebSpeech stalls shouldn't freeze workout progression.
   setTimeout(()=>{if(ticket!==serial||ended)return;try{synth.cancel()}catch{}finish();},Math.max(9000,String(text).length*200));
 }
 if(synth){try{synth.addEventListener('voiceschanged',update)}catch{}setTimeout(update,100);}
 document.addEventListener('tyson-language-change',()=>{stop();update();});
 window.PrimalVoice={say,stop,update,get available(){return available.length>0;}};

 update();
})();

'use strict';
/* PRIMAL ORIGINAL audio player — stable championship activation.
 * A single HTMLAudioElement and a single AudioContext are shared by
 * coach and recorder. No duplicate music players, no extra soundtrack.
 */
(() => {
  const $=id=>document.getElementById(id);
  const T=(es,en)=>window.PrimalI18n?.lang==='en'?en:es;
  const audio=$('backgroundMusic'),toggle=$('musicToggle'),stageToggle=$('recordStageMusic');
  const status=$('musicStatus'),volumeInput=$('musicVolume');
  if(!audio||!toggle||!volumeInput||!status){console.error('PRIMAL Music: missing original controls');return;}
  let context=null,source=null,output=null,mixer=null;
  let userPaused=false,priming=false,blocked=false,primeGeneration=0,pendingPlay=null;
  let transportGeneration=0;
  const inRound=()=>['prepare','work'].includes(document.body.dataset.state);
  function statusText(){
    if(audio.error) return T('No se pudo cargar audio/primal-background.mp3. Comprueba que esté en GitHub.','Missing audio/primal-background.mp3 in GitHub.');
    if(blocked) return T('El navegador bloqueó el audio. Pulsa «Activar música».','Browser blocked playback. Tap Enable music.');
    if(userPaused) return T('Música desactivada.','Music disabled.');
    if(!audio.paused&&inRound()&&!priming)return T('Música de entrenamiento · volumen bajo','Workout music · low volume');
    return T('Automática desde «Prepárate» y durante los rounds.','Automatic from warmup and during rounds.');
  }
  function render(){
    const label=blocked?T('▶ Activar audio','▶ Enable audio'):userPaused?T('♫ Activar música','♫ Enable music'):T('♫ Desactivar música','♫ Disable music');
    for(const b of [toggle,stageToggle])if(b){b.textContent=label;b.setAttribute('aria-pressed',String(!userPaused));}
    status.textContent=statusText();
  }
  function setVolume(){
    const level=Math.max(0,Math.min(1,(Number(volumeInput.value)||0)/100));
    if(output){audio.volume=1;output.gain.value=level*2;}
    else audio.volume=level;
  }
  function getContext(){
    if(!context){
      const AudioCtor=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtor) throw Error('WebAudio unavailable');
      context=new AudioCtor();
      context.addEventListener?.('statechange',()=>{
        if(inRound()&&context.state==='interrupted')unlock();
        render();
      });
      source=context.createMediaElementSource(audio);
      output=context.createGain();source.connect(output);output.connect(context.destination);setVolume();
    }
    return context;
  }
  function unlock(){
    try{if(navigator.audioSession&&!window.PrimalRecorder?.active)navigator.audioSession.type='playback';}catch{}
    try {const c=getContext();if(c.state!=='running')void c.resume().catch(e=>{blocked=true;render();console.warn('PRIMAL: could not unlock sound',e);});}
    catch(e){console.warn('PRIMAL: WebAudio unavailable; fallback to HTML audio',e);}
  }
  function stopAudio(){++transportGeneration;pendingPlay=null;if(!audio.paused)audio.pause();}
  function playDirect(){
    if(!inRound()||userPaused)return;
    priming=false;audio.muted=false;blocked=false;unlock();
    try{
      const generation=++transportGeneration;const p=audio.play();pendingPlay=p;
      if(p?.catch)p.catch(e=>{if(pendingPlay!==p||generation!==transportGeneration||!inRound()||userPaused||e.name==='AbortError')return;blocked=true;render();console.warn('PRIMAL: music playback rejected',e);});
      render();return p;
    }catch(e){blocked=true;render();console.warn('PRIMAL: music playback failed',e);}
  }
  function reconcile(){
    if(!inRound()||userPaused){if(!priming)stopAudio();}
    else if(audio.paused&&!priming&&!blocked)playDirect();
    render();
  }
  /* Called synchronously INSIDE the genuine click event (not after an await)
   * and after the original trainer sets data-state=prepare. */
  function startFromGesture(force=false){
    ++primeGeneration;priming=false;audio.muted=false;
    if(force)userPaused=false;
    blocked=false;unlock();
    if(inRound()&&!userPaused)return playDirect();
    render();
  }
  function prime(){
    if(userPaused)return;
    if(inRound()){startFromGesture(false);return;}
    if(priming)return;
    const id=++primeGeneration;
    priming=true;blocked=false;unlock();audio.muted=true;
    const settle=()=>{
      if(id!==primeGeneration)return;
      audio.muted=false;priming=false;if(!inRound()||userPaused)stopAudio();reconcile();
    };
    try{Promise.resolve(audio.play()).then(settle,settle);}catch{settle();}
  }
  function toggleMusic(){
    if(blocked){userPaused=false;startFromGesture(true);return;}
    userPaused=!userPaused;
    if(userPaused){++primeGeneration;priming=false;audio.muted=false;stopAudio();render();}
    else if(inRound())startFromGesture(true);
    else prime();
  }
  function attachRecorder(ctx,destination){detachRecorder();if(ctx!==getContext())throw Error('Recording must use shared AudioContext');mixer=destination;output.connect(mixer);return true;}
  function detachRecorder(){if(output&&mixer){try{output.disconnect(mixer);}catch{}}mixer=null;}
  function recover(){blocked=false;unlock();reconcile();}
  toggle.addEventListener('click',toggleMusic);
  stageToggle?.addEventListener('click',toggleMusic);
  volumeInput.addEventListener('input',setVolume);
  audio.addEventListener('play',()=>{if(!priming&&(!inRound()||userPaused))stopAudio();render();});
  for(const evt of ['pause','error','canplay','ended','playing'])audio.addEventListener(evt,render);
  audio.addEventListener('canplay',()=>{if(!blocked)reconcile();});
  const start=$('start'),recordStart=$('recordStart');
  start?.addEventListener('click',()=>{if(inRound())startFromGesture(false);else{unlock();reconcile();}});
  recordStart?.addEventListener('click',()=>{unlock();if(inRound())startFromGesture(false);else prime();});
  new MutationObserver(reconcile).observe(document.body,{attributes:true,attributeFilter:['data-state']});
  document.addEventListener('tyson-language-change',render);
  window.PrimalMusic={
    voiceStart(){},voiceEnd(){},tryStart:reconcile,getContext,unlock,recover,
    startFromGesture,attachRecorder,detachRecorder,syncRecorder:reconcile,
    get isPlaying(){return !audio.paused;},get source(){return audio.currentSrc||audio.src;},
    get isEnabled(){return !userPaused;}
  };
  setVolume();render();
})();

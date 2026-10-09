'use strict';
/* PRIMAL Music: user-provided, pre-attenuated MP3.
   The native HTML audio element plays for the athlete. A synchronized second
   element enters the recorder's AudioContext, so the exported video carries
   the same background music without requesting microphone capture.
   Video voice remains the current provisional bank; Web Speech TTS is not
   directly recordable from a browser. */
(() => {
  const $ = id => document.getElementById(id);
  const I = window.PrimalI18n;
  const T = (es,en) => I.lang==='en'?en:es;
  const audio = $('backgroundMusic');
  const toggle = $('musicToggle');
  const stageToggle = $('recordStageMusic');
  const status = $('musicStatus');
  const volumeInput = $('musicVolume');
  let capture=null, captureSource=null, captureGain=null, recordingCtx=null, syncTimer=null;
  let userPaused=false;
  // Safari/iOS may ignore JS volume changes; the actual MP3 is mastered low.
  const iOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
  if(iOS) volumeInput.closest('label').hidden=true;
  const safeTime = t => Number.isFinite(t) && t >= 0 ? t : 0;

  function render(){
    const playing=!audio.paused && !audio.ended;
    toggle.textContent=playing?T('Ⅱ Pausar música','Ⅱ Pause music'):T('▶ Reproducir música','▶ Play music');
    toggle.setAttribute('aria-pressed',String(playing));
    if(stageToggle){stageToggle.textContent=playing?T('Ⅱ Música','Ⅱ Music'):T('▶ Música','▶ Music');stageToggle.setAttribute('aria-pressed',String(playing));}
    status.textContent=audio.error?T('No se pudo cargar el MP3. Verifica el archivo audio/primal-background.mp3.','Could not load music. Check audio/primal-background.mp3.'):
      playing?T('Música de fondo · volumen bajo','Background music · low volume'):
      T('Toca Reproducir para activar la música.','Tap Play to start music.');
  }
  function setVolume(){
    // iOS Safari may ignore HTMLMediaElement.volume; the MP3 is already mastered quietly.
    let amount=Number(volumeInput.value);
    if(!Number.isFinite(amount))amount=100;
    const level=Math.max(0,Math.min(1,amount/100));
    try{audio.volume=level}catch{}
    if(captureGain)captureGain.gain.value=level;
  }
  function play(){
    userPaused=false;
    // play() is always attempted on a user gesture when possible. Autoplay
    // can legitimately be blocked by the browser.
    const p=audio.play();
    if(p?.catch)p.catch(()=>{render();});
    render();
    return p;
  }
  function pause(){
    userPaused=true;
    audio.pause();
    capture?.pause();
    render();
  }
  function toggleMusic(){if(audio.paused)play();else pause();}
  toggle.addEventListener('click',toggleMusic);
  stageToggle?.addEventListener('click',toggleMusic);
  volumeInput.addEventListener('input',setVolume);

  async function syncCapture(){
    if(!capture)return;
    if(audio.paused||audio.ended){if(!capture.paused)capture.pause();return;}
    const from=safeTime(audio.currentTime);
    try{
      if(Math.abs(safeTime(capture.currentTime)-from)>0.25)capture.currentTime=from;
      if(capture.paused){const p=capture.play();if(p?.catch)p.catch(err=>console.warn('Recording music playback was blocked',err));}
    }catch(err){console.warn('Cannot sync recording music',err);}
  }
  function attachRecorder(context,mixer){
    detachRecorder();
    if(!context?.createMediaElementSource||!mixer)return false;
    try{
      capture=new Audio(audio.currentSrc||audio.src);
      capture.preload='auto';capture.loop=true;capture.playsInline=true;
      capture.crossOrigin='anonymous';
      // The capture audio never goes directly to the speakers: only to the
      // saved-video mixer, so there is no duplicate sound or microphone echo.
      captureSource=context.createMediaElementSource(capture);
      captureGain=context.createGain();captureGain.gain.value=1;
      captureSource.connect(captureGain).connect(mixer);
      recordingCtx=context;
      setVolume();
      void syncCapture();
      syncTimer=setInterval(syncCapture,2500);
      return true;
    }catch(err){console.warn('Music could not be connected to video mixer',err);detachRecorder();return false;}
  }
  function detachRecorder(){
    if(syncTimer){clearInterval(syncTimer);syncTimer=null;}
    if(capture){try{capture.pause();capture.removeAttribute('src');capture.load()}catch{}}
    try{captureSource?.disconnect()}catch{}
    try{captureGain?.disconnect()}catch{}
    capture=null;captureSource=null;captureGain=null;recordingCtx=null;
  }
  audio.addEventListener('play',()=>{void syncCapture();render();});
  audio.addEventListener('pause',()=>{void syncCapture();render();});
  audio.addEventListener('seeked',()=>{void syncCapture();render();});
  audio.addEventListener('error',render);
  audio.addEventListener('canplay',render);
  document.addEventListener('tyson-language-change',render);
  $('start').addEventListener('click',()=>{if(!userPaused)void play();});
  $('recordStart').addEventListener('click',()=>{if(!userPaused)void play();});
  window.PrimalMusic={
    voiceStart(){ /* Background MP3 is already attenuated for speech. */ },
    voiceEnd(){},
    tryStart(){if(!userPaused)void play();},
    attachRecorder,detachRecorder,syncRecorder:syncCapture,
    get isPlaying(){return !audio.paused;},
    get source(){return audio.currentSrc||audio.src;}
  };
  setVolume();render();
  // Browser might reject this attempt; the play button remains available.
  void play();
})();

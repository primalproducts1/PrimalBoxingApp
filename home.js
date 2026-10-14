'use strict';
(() => {
 const $=id=>document.getElementById(id),T=(es,en)=>window.PrimalI18n?.lang==='en'?en:es;
 function resetHome(){
  // Finish capture without letting its asynchronous result reopen a dialog.
  try{window.PrimalRecorder?.finish({reveal:false});}catch(e){console.warn('Stop recording',e);}
  if(!['idle','done'].includes(clock.state))$('stop').click();
  try{cancelVoice();}catch(e){console.warn(e);}release();
  clock.state='idle';clock.round=0;document.body.dataset.state='idle';
  $('phase').textContent=T('EN TU ESQUINA','IN YOUR CORNER');$('comboLabel').textContent=T('PREPARA LA GUARDIA','GET YOUR GUARD UP');
  $('sequence').replaceChildren(Object.assign(document.createElement('span'),{className:'ready-word',textContent:T('Manos arriba.','Hands up.')}));
  $('cue').textContent=T('Escucha la combinación y sigue tu ritmo.','Listen to the combination and keep your rhythm.');
  $('counter').textContent='00 COMBOS';$('progress').style.width='0%';$('stop').disabled=true;$('skip').disabled=true;$('config').disabled=false;$('start').disabled=false;$('testVoice').disabled=false;
  $('start').dataset.label='';$('start').innerHTML=T('EMPEZAR ENTRENAMIENTO','START WORKOUT')+' <span>▶</span>';refresh();
  for(const dialog of document.querySelectorAll('dialog'))if(dialog.open)dialog.close();
  window.scrollTo({top:0,behavior:'instant'});
 }
 function requestHome(){resetHome();return true;}
 $('homeMenu').onclick=requestHome;$('recordStageHome').onclick=requestHome;
 window.PrimalHome={resetHome,requestHome};
})();

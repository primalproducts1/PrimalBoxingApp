/* Persistent navigation: keep the SAME controls in the active dialog's top layer. */
(()=>{
'use strict';
const nav=document.querySelector('.tab-bar'),t=(es,en)=>window.PrimalI18n?.lang==='en'?en:es;
const dialogs=[...document.querySelectorAll('dialog')];
let top=null;
const trophy=document.getElementById('primalClubTab'),openTrophy=trophy.onclick;
const recordTab=document.createElement('button');recordTab.type='button';recordTab.id='recordTab';recordTab.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="12" height="12" rx="3"/><path d="m15 10 6-4v12l-6-4"/></svg><span></span>';
nav.insertBefore(recordTab,trophy);
const resume=document.createElement('button');resume.type='button';resume.id='recordStageResume';resume.className='record-stage-sound';resume.onclick=()=>document.getElementById('start').click();document.querySelector('.record-stage-controls').prepend(resume);
function canLeave(){const settings=document.getElementById('settingsSheet');return !settings.open||document.getElementById('settings').reportValidity();}
function closeOthers(except){for(const d of dialogs)if(d.open&&d!==except)d.close();}
function pauseForNavigation(){if(!['idle','done','paused'].includes(clock.state))pause(t('Sesión en pausa. Cierra este panel y pulsa Continuar.','Workout paused. Close this panel and press Continue.'));}
function sync(){
 if(!top?.open)top=dialogs.filter(d=>d.open).at(-1)||null;
 const host=top||document.body;
 if(nav.parentElement!==host)host.append(nav);
 const id=top?.id||'',active=id==='historySheet'?'history':id==='guideSheet'?'guide':id==='primalClub'?'club':id==='recordSheet'?'record':id==='championshipsSheet'?'championships':'train';
 for(const b of nav.children){const route=b.id==='championshipsTab'?'championships':b.id==='trainTab'?'train':b.id==='primalClubTab'?'club':b.id==='recordTab'?'record':b.dataset.sheet==='historySheet'?'history':'guide';const selected=route===active;b.classList.toggle('selected',selected);if(selected)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}
 recordTab.querySelector('span').textContent=t('Grabar','Record');
 document.getElementById('trainTab').querySelector('span').textContent=t('Inicio','Home');
 resume.textContent=clock.state==='paused'?t('▶ Continuar sesión','▶ Resume workout'):t('Ⅱ Pausar sesión','Ⅱ Pause workout');
 resume.hidden=!window.PrimalRecorder?.active||['idle','done'].includes(clock.state);
}
function go(sheet){if(!canLeave())return;pauseForNavigation();const target=document.getElementById(sheet);closeOthers(target);top=target;if(!target.open)target.showModal();sync();target.querySelector('[data-close]')?.focus({preventScroll:true});}
for(const b of nav.querySelectorAll('[data-sheet]'))b.onclick=()=>go(b.dataset.sheet);
document.getElementById('trainTab').onclick=()=>{if(window.PrimalHome.requestHome()){top=null;sync();}};
trophy.onclick=()=>{if(!canLeave())return;closeOthers(document.getElementById('primalClub'));openTrophy();top=document.getElementById('primalClub');sync();};
const championshipTab=document.getElementById('championshipsTab');
if(championshipTab)championshipTab.onclick=()=>{if(!canLeave()||window.PrimalRecorder?.active)return;if(!['idle','done'].includes(clock.state)){window.PrimalChampionships.open();return;}closeOthers(document.getElementById('championshipsSheet'));window.PrimalChampionships.open();top=document.getElementById('championshipsSheet');sync();};
recordTab.onclick=()=>{if(!canLeave())return;closeOthers(document.getElementById('recordSheet'));if(!window.PrimalRecorder?.active)document.getElementById('recordSetup').click();else go('recordSheet');top=document.getElementById('recordSheet');sync();};
// Opening a native modal makes outside elements inert. Moving the original nav
// inside it keeps it clickable, keyboard accessible and above its backdrop.
const observer=new MutationObserver(changes=>{for(const change of changes)if(change.type==='attributes'&&change.attributeName==='open'&&change.target.open)top=change.target;sync();});
for(const d of dialogs){observer.observe(d,{attributes:true,attributeFilter:['open'],childList:true});d.addEventListener('close',sync);}
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-state','class']});
document.addEventListener('primal-recording-change',()=>queueMicrotask(sync));
function labels(){document.getElementById('recordActionTitle').textContent=t('Graba tu entrenamiento','Record your workout');document.getElementById('recordActionHint').textContent=t('Guarda el video y compártelo al terminar.','Save your video and share it when you finish.');sync();}
document.addEventListener('tyson-language-change',labels);labels();
})();

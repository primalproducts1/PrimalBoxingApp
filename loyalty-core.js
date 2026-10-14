/* PRIMAL Club — isolated, deterministic rewards. No timer/audio dependencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PrimalRewards=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const VERSION=1;
const levels=[{xp:0,es:'Novato',en:'Rookie'},{xp:500,es:'Contendiente',en:'Contender'},{xp:1500,es:'Luchador',en:'Fighter'},{xp:3500,es:'Campeón',en:'Champion'},{xp:7500,es:'Leyenda',en:'Legend'}];
const badges=[
 ['first','sessions',1,'Primer round','First bell','Termina todos los rounds de tu primera sesión, de cualquier duración.','Finish every round of your first workout, of any duration.','glove'],
 ['five','sessions',5,'Ya eres del club','Part of the club','Completa 5 sesiones válidas.','Complete 5 qualifying workouts.','shield'],
 ['ten','sessions',10,'Doble dígito','Double digits','Completa 10 sesiones válidas.','Complete 10 qualifying workouts.','shield'],
 ['twentyfive','sessions',25,'Peso pesado','Heavyweight','Completa 25 sesiones válidas.','Complete 25 qualifying workouts.','cup'],
 ['fifty','sessions',50,'Espíritu PRIMAL','PRIMAL spirit','Completa 50 sesiones válidas.','Complete 50 qualifying workouts.','cup'],
 ['hundred','sessions',100,'Salón de la fama','Hall of fame','Completa 100 sesiones válidas.','Complete 100 qualifying workouts.','cup'],
 ['rounds25','rounds',25,'Guardia firme','Steady guard','Acumula 25 rounds en sesiones válidas.','Collect 25 rounds in qualifying workouts.','glove'],
 ['rounds100','rounds',100,'Corazón de ring','Ring heart','Acumula 100 rounds en sesiones válidas.','Collect 100 rounds in qualifying workouts.','shield'],
 ['rounds300','rounds',300,'Dueño del ring','Own the ring','Acumula 300 rounds en sesiones válidas.','Collect 300 rounds in qualifying workouts.','cup'],
 ['hour','seconds',3600,'La primera hora','The first hour','Acumula 60 minutos activos en sesiones válidas.','Collect 60 active minutes in qualifying workouts.','clock'],
 ['fivehours','seconds',18000,'Tiempo de campeón','Champion time','Acumula 300 minutos activos en sesiones válidas.','Collect 300 active minutes in qualifying workouts.','clock'],
 ['week','bestDays',3,'Semana de fuego','On fire this week','Entrena 3 días distintos en una semana de lunes a domingo.','Train on 3 different days in a Monday–Sunday week.','flame'],
 ['weeks2','bestWeeks',2,'Encuentra tu ritmo','Find your rhythm','Logra 3 días por semana durante 2 semanas consecutivas.','Train on 3 days per week for 2 consecutive weeks.','flame'],
 ['weeks4','bestWeeks',4,'La constancia pesa','Consistency wins','Logra 3 días por semana durante 4 semanas consecutivas.','Train on 3 days per week for 4 consecutive weeks.','cup'],
 ['explorer','focuses',3,'Boxeador completo','All-round boxer','Completa sesiones válidas con 3 enfoques distintos. Cuenta desde esta versión.','Complete qualifying workouts with 3 different focuses. Tracked from this version.','shield']
].map(([id,metric,target,es,en,ruleEs,ruleEn,icon])=>({id,metric,target,es,en,ruleEs,ruleEn,icon}));
function dayKey(date){const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function validDay(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return Number.isFinite(+d)&&dayKey(d)===s;}
function weekKey(day){const d=new Date(day+'T12:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);return dayKey(d);}
function nextWeek(day){const d=new Date(day+'T12:00:00');d.setDate(d.getDate()+7);return dayKey(d);}
function normalize(x){
 if(!x||x.complete!==true||!Number.isFinite(x.date)||x.date<=0||x.date>Date.now()+60000)return null;
 if(!Number.isInteger(x.rounds)||x.rounds<1||x.rounds>20||x.rounds!==x.planned||!Number.isFinite(x.work)||x.work<0||x.work>18000)return null;
 const day=validDay(x.day)?x.day:dayKey(x.date);
 return {id:String(x.date),date:x.date,day,rounds:x.rounds,planned:x.planned,work:Math.floor(x.work),complete:true,focus:['all','technique','body','defense'].includes(x.focus)?x.focus:null};
}
function merge(a,b){const map=new Map();for(const x of [...a,...b]){const r=normalize(x);if(r&&!map.has(r.id))map.set(r.id,r);}return [...map.values()].sort((a,b)=>a.date-b.date);}
function stats(records,now=Date.now()){
 const days={},weeks={},focus=new Set();let rounds=0,seconds=0,xp=0;
 for(const r of records){rounds+=r.rounds;seconds+=r.work;if(r.focus)focus.add(r.focus);days[r.day]=(days[r.day]||0)+1;}
 for(const [day,count]of Object.entries(days)){xp+=100+Math.min(2,count-1)*25;const w=weekKey(day);(weeks[w]??=[]).push(day);}
 let bestWeeks=0,run=0,prev=null;for(const w of Object.keys(weeks).sort()){if(weeks[w].length<3){run=0;prev=null;continue;}run=prev&&nextWeek(prev)===w?run+1:1;bestWeeks=Math.max(bestWeeks,run);prev=w;}
 const week=weekKey(dayKey(now)),weekDays=weeks[week]||[];
 return {sessions:records.length,rounds,seconds,xp,focuses:focus.size,bestDays:Math.max(0,...Object.values(weeks).map(d=>d.length)),bestWeeks,week,weekDays,days};
}
function earned(records){
 const awards={},s={sessions:0,rounds:0,seconds:0,focuses:0,bestDays:0,bestWeeks:0},focuses=new Set(),days=new Set(),weeks={},qualifiedWeeks=new Set();
 for(const r of records){s.sessions++;s.rounds+=r.rounds;s.seconds+=r.work;if(r.focus)focuses.add(r.focus);s.focuses=focuses.size;
  if(!days.has(r.day)){days.add(r.day);const w=weekKey(r.day);weeks[w]=(weeks[w]||0)+1;s.bestDays=Math.max(s.bestDays,weeks[w]);
   if(weeks[w]===3){qualifiedWeeks.add(w);let run=0,prev=null;for(const k of [...qualifiedWeeks].sort()){run=prev&&nextWeek(prev)===k?run+1:1;s.bestWeeks=Math.max(s.bestWeeks,run);prev=k;}}
  }
  for(const b of badges)if(!awards[b.id]&&s[b.metric]>=b.target)awards[b.id]=r.date;
 }
 return awards;
}
function rank(xp){let i=levels.length-1;while(i>0&&xp<levels[i].xp)i--;return {current:levels[i],next:levels[i+1]||null,index:i};}
return {VERSION,levels,badges,dayKey,weekKey,nextWeek,normalize,merge,stats,earned,rank};
});

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
test('coach and championship never substitute system speech',()=>{
 for(const name of ['coach.js','championships.js'])assert.doesNotMatch(fs.readFileSync(path.join(root,name),'utf8'),/new SpeechSynthesisUtterance|synth\.speak\(/);
});
test('all four original natural banks and 36 narrated profiles are real MP3 files',()=>{
 const vm=require('node:vm'),context={window:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'voice-bank.js'),'utf8'),context);
 for(const b of Object.values(context.window.PrimalVoiceBank))assert.ok(fs.statSync(path.join(root,b.url)).size>10000);
 for(let i=1;i<=18;i++)for(const lang of ['es','en']){
  const data=fs.readFileSync(path.join(root,'championships-intros',`${String(i).padStart(2,'0')}-${lang}.mp3`));
  assert.ok(data.length>1000);assert.ok(data[0]===255||data.toString('ascii',0,3)==='ID3');
 }
});

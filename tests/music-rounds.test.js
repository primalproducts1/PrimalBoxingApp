const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
class Element extends EventTarget{constructor(){super();this.paused=true;this.ended=false;this.value='100';this.currentTime=0;this.src='audio/primal-background.mp3';this.muted=false;}play(){this.paused=false;this.dispatchEvent(new Event('play'));return Promise.resolve();}pause(){if(!this.paused){this.paused=true;this.dispatchEvent(new Event('pause'));}}setAttribute(){}closest(){return {};}removeAttribute(){}load(){}}
class Node{constructor(){this.connections=new Set;this.gain={value:1};}connect(x){this.connections.add(x);return x;}disconnect(x){this.connections.delete(x);}}
test('one music graph feeds speakers and recording; rounds, manual mute and repeated videos',async()=>{
 const ids=['backgroundMusic','musicToggle','recordStageMusic','musicStatus','musicVolume','start','recordStart'];const elements=Object.fromEntries(ids.map(x=>[x,new Element()]));let observe,output,source;const body={dataset:{state:'idle'}},doc=new EventTarget();doc.body=body;doc.getElementById=x=>elements[x];let contexts=0;
 const window={PrimalI18n:{lang:'es'},AudioContext:class{constructor(){contexts++;this.state='running';this.destination={};}createMediaElementSource(){source=new Node;return source;}createGain(){output=new Node;return output;}resume(){return Promise.resolve();}}};
 const context=vm.createContext({window,document:doc,MutationObserver:class{constructor(fn){observe=fn}observe(){}},console,Promise});vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../music.js'),'utf8'),context);
 const audio=elements.backgroundMusic,phase=s=>{body.dataset.state=s;observe();},tap=id=>elements[id].dispatchEvent(new Event('click'));
 assert.equal(audio.paused,true);phase('prepare');tap('start');await Promise.resolve();await Promise.resolve();assert.equal(audio.paused,false);assert.equal(audio.muted,false);phase('paused');assert.equal(audio.paused,true);phase('prepare');assert.equal(audio.paused,false);
 phase('work');assert.equal(audio.paused,false);const ctx=window.PrimalMusic.getContext(),mixer={};window.PrimalMusic.attachRecorder(ctx,mixer);assert.ok(source.connections.has(output));assert.ok(output.connections.has(ctx.destination));assert.ok(output.connections.has(mixer));
 phase('paused');assert.equal(audio.paused,true);phase('work');assert.equal(audio.paused,false);phase('rest');assert.equal(audio.paused,true);phase('work');tap('musicToggle');assert.equal(audio.paused,true);phase('rest');phase('work');assert.equal(audio.paused,true);tap('musicToggle');assert.equal(audio.paused,false);
 phase('done');assert.equal(audio.paused,true);window.PrimalMusic.detachRecorder();assert.ok(!output.connections.has(mixer));assert.ok(output.connections.has(ctx.destination));const nextMixer={};window.PrimalMusic.attachRecorder(ctx,nextMixer);assert.equal(contexts,1);assert.ok(output.connections.has(nextMixer));phase('idle');assert.equal(audio.paused,true);
});
test('late playback rejection after a pause cannot block the next round',async()=>{
 const ids=['backgroundMusic','musicToggle','recordStageMusic','musicStatus','musicVolume','start','recordStart'];
 const elements=Object.fromEntries(ids.map(x=>[x,new Element()]));const rejects=[];
 elements.backgroundMusic.play=function(){this.paused=false;this.dispatchEvent(new Event('play'));return new Promise((_,reject)=>rejects.push(reject));};
 const body={dataset:{state:'idle'}},doc=new EventTarget();doc.body=body;doc.getElementById=x=>elements[x];let observe;
 const window={PrimalI18n:{lang:'es'},AudioContext:class{constructor(){this.state='running';this.destination={}}createMediaElementSource(){return new Node}createGain(){return new Node}resume(){return Promise.resolve()}}};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../music.js'),'utf8'),{window,document:doc,MutationObserver:class{constructor(fn){observe=fn}observe(){}},console,Promise});
 body.dataset.state='prepare';window.PrimalMusic.startFromGesture();body.dataset.state='paused';observe();
 rejects[0](Object.assign(new Error('old play interrupted'),{name:'AbortError'}));await Promise.resolve();await Promise.resolve();
 body.dataset.state='work';observe();assert.equal(elements.backgroundMusic.paused,false);assert.equal(elements.backgroundMusic.muted,false);assert.doesNotMatch(elements.musicStatus.textContent,/bloqueó/);
 body.dataset.state='rest';observe();assert.equal(elements.backgroundMusic.paused,true);
});

const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function harness(){
 const elements={rate:{value:'1'},stance:{value:'orthodox'},voices:{replaceChildren(){}},pitch:{},audioNote:{}};
 const document=new EventTarget();document.getElementById=k=>elements[k];const sources=[],links=new Set();let resolveFetch;
 const ctx={state:'running',destination:{},createGain:()=>({gain:{},connect:n=>links.add(n),disconnect:n=>links.delete(n)}),decodeAudioData:async()=>({duration:5.9}),createBufferSource:()=>{const s={connect(){},start(){this.started=true},stop(){this.stopped=true}};sources.push(s);return s;}};
 const window={PrimalI18n:{lang:'es'},PrimalMusic:{getContext:()=>ctx}};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../coach.js'),'utf8'),{window,document,Option:function(){},console,AbortController,setTimeout,clearTimeout,fetch:()=>new Promise(r=>{resolveFetch=r})});
 return {voice:window.PrimalVoice,ctx,sources,links,respond:()=>resolveFetch({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)})};
}
test('profile narration waits for real playback end and shares speaker/video output',async()=>{
 const h=harness(),mixer={};let done=0;h.voice.attachRecorder(h.ctx,mixer);h.voice.playClip('01-es.mp3',()=>done++);assert.equal(done,0);h.respond();await new Promise(r=>setImmediate(r));assert.equal(done,0);assert.equal(h.sources.length,1);assert.ok(h.links.has(mixer));assert.ok(h.links.has(h.ctx.destination));h.sources[0].onended();assert.equal(done,1);
});
test('pausing during profile download cannot start a stale narration later',async()=>{
 const h=harness();let done=0;h.voice.playClip('02-es.mp3',()=>done++);h.voice.stop();h.respond();await new Promise(r=>setImmediate(r));assert.equal(h.sources.length,0);assert.equal(done,0);
});

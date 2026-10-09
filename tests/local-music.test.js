const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createServer}=require('../server.js');
const root=path.join(__dirname,'..');
test('archivo MP3 local, panel sin YouTube, audio conectado al grabador',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const recorder=fs.readFileSync(path.join(root,'recorder.js'),'utf8');
 const music=fs.readFileSync(path.join(root,'music.js'),'utf8');
 assert.match(html,/id="backgroundMusic"/);
 assert.match(html,/id="recordStageMusic"/);
 assert.doesNotMatch(html,/youtubePlayer|youtube.com\/iframe_api/);
 assert.match(recorder,/PrimalMusic\?\.attachRecorder\(ctx,mixer\)/);
 assert.match(recorder,/PrimalMusic\?\.detachRecorder/);
 assert.match(music,/createMediaElementSource/);
 const data=fs.statSync(path.join(root,'audio','primal-background.mp3'));
 assert.ok(data.size>20000000&&data.size<25*1024*1024);
});
test('servidor sirve MP3 con rangos para la reproducción progresiva',async()=>{
 const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));
 try{
  const url=`http://127.0.0.1:${s.address().port}/audio/primal-background.mp3`;
  const r=await fetch(url,{headers:{Range:'bytes=0-15'}});
  assert.equal(r.status,206);
  assert.match(r.headers.get('content-type'),/audio\/mpeg/);
  assert.equal(Number(r.headers.get('content-length')),16);
  assert.equal((await r.arrayBuffer()).byteLength,16);
 }finally{await new Promise(res=>s.close(res));}
});

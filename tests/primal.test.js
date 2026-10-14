const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const root=path.join(__dirname,'..');const read=n=>fs.readFileSync(path.join(root,n),'utf8');
test('identidad PRIMAL, imagen y favicon',()=>{const html=read('index.html');assert.match(html,/<title>PRIMAL Boxing Club/);assert.match(html,/src="\.\/primal\.png"/);assert.match(html,/primal-favicon\.png/);assert.ok(fs.existsSync(path.join(root,'primal-favicon.png')));assert.doesNotMatch(html,/TYSON|tyson-3d\.png/);});
test('música local MP3 sin YouTube ni reproductor flotante',()=>{
 const h=read('index.html'),m=read('music.js');
 assert.match(h,/id="backgroundMusic"/);
 assert.match(h,/src="\.\/audio\/primal-background\.mp3"/);
 assert.doesNotMatch(h,/id="youtubePlayer"|youtube.com\/iframe_api/);
 assert.match(m,/attachRecorder/);
 assert.match(m,/createMediaElementSource/);
 assert.ok(fs.statSync(path.join(root,'audio','primal-background.mp3')).size>1000000);
});
test('una sola voz PRIMAL audible y grabada',()=>{const c=read('coach.js'),r=read('recorder.js');assert.match(c,/output.connect\(ctx.destination\)/);assert.match(c,/output.connect\(mixer\)/);assert.match(r,/PrimalVoice.say\(text,done\)/);assert.match(r,/PrimalVoice.attachRecorder\(ctx,mixer\)/);assert.doesNotMatch(c,/SpeechSynthesisUtterance/);});

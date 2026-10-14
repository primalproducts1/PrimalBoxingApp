const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const recorder=fs.readFileSync(path.join(__dirname,'../recorder.js'),'utf8');
test('recorder delegates to shared coach and combines its mixer audio with video',()=>{
 assert.match(recorder,/PrimalVoice\.say\(text,done\)/);
 assert.match(recorder,/PrimalVoice\.attachRecorder\(ctx,mixer\)/);
 assert.match(recorder,/combinedStream=new MediaStream\(\[\.\.\.canvasStream\.getVideoTracks\(\),\.\.\.mixer\.stream\.getAudioTracks\(\)\]\)/);
 assert.match(app,/PrimalRecorder\.say\(text,end\)/);
});

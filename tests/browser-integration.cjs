const assert=require('node:assert/strict'),fs=require('fs');
const launch=async()=>require('playwright').chromium.launch({headless:true,...process.env.PRIMAL_BROWSER_EXECUTABLE?{executablePath:process.env.PRIMAL_BROWSER_EXECUTABLE}:{}});
(async()=>{
const server=require('../server.js').createServer();await new Promise(r=>server.listen(3000,r));const b=await launch();const p=await b.newPage({viewport:{width:390,height:844}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
try{
await p.goto('http://localhost:3000');
await p.locator('#championshipsTab').click();
assert.equal(await p.locator('#championshipsTab').getAttribute('aria-current'),'page');
await p.evaluate(()=>{document.getElementById('voice').checked=false;document.getElementById('gap').value='5';document.getElementById('work').value='10';document.getElementById('rest').value='0';refresh()});
await p.locator('#pcStart').click();await p.waitForTimeout(500);
console.log('prepare',await p.evaluate(()=>({state:clock.state,gap:cfg.gap,rounds:cfg.rounds,ctx:PrimalMusic.getContext().state})));
await p.evaluate(()=>{const ctx=PrimalMusic.getContext();window.meter=ctx.createAnalyser();PrimalMusic.attachRecorder(ctx,meter);});
let max=0;for(let i=0;i<10;i++){await p.waitForTimeout(200);max=Math.max(max,await p.evaluate(()=>{const data=new Float32Array(meter.fftSize);meter.getFloatTimeDomainData(data);return Math.sqrt(data.reduce((s,x)=>s+x*x,0)/data.length)}));}
assert.ok(max>0.001,'Real decoded music signal');console.log('music RMS',max);
await p.locator('#start').click();await p.waitForTimeout(100);assert.ok(await p.evaluate(()=>backgroundMusic.paused));await p.locator('#start').click();await p.waitForTimeout(300);assert.ok(await p.evaluate(()=>!backgroundMusic.paused));
await p.locator('#stop').click();assert.equal(await p.locator('#gap').inputValue(),'5');assert.equal(await p.evaluate(()=>document.getElementById('voice').checked),false);assert.deepEqual(await p.evaluate(()=>PrimalChampionships.getResults()),{});
await p.locator('#trainTab').click();
// Drive real Clock boundaries to test all 216 rounds without waiting 36 minutes.
for(let opponent=1;opponent<=18;opponent++){
 await p.locator('#championshipsTab').click();await p.locator('#pcStart').click();
 await p.evaluate(()=>{document.getElementById('voice').checked=false;cancelVoice()});
 await p.evaluate(()=>{for(let i=0;i<13;i++){clock.tick(clock.end+1);stage();}});
 const results=await p.evaluate(()=>PrimalChampionships.getResults());assert.equal(results[opponent].complete,true);assert.equal(Object.keys(results).length,opponent);
 assert.equal(await p.locator('#gap').inputValue(),'5');await p.locator('#trainTab').click();
}
await p.reload();await p.locator('#championshipsTab').click();assert.match(await p.locator('.chm-stats').textContent(),/18/);assert.equal(await p.evaluate(()=>Object.values(PrimalChampionships.getResults()).filter(x=>x.complete).length),18);

// Existing tabs remain usable from the modal.
await p.locator('#primalClubTab').click();assert.ok(await p.locator('#primalClub').evaluate(x=>x.open));await p.locator('#trainTab').click();
await p.setViewportSize({width:1440,height:1000});
console.log('PASS: real MP3, pause/resume, 18 opponents / 216 rounds, restore settings, persistence, original trophy navigation');console.log('pageErrors',errors);assert.deepEqual(errors,[]);
}finally{await b.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

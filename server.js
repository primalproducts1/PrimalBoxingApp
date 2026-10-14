'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {moves,combos,pool,choose}=require('./core.js');
const allowed=new Set(['interface.js','interface.css','loyalty.js','loyalty-core.js','loyalty.css','index.html','style.css','app.js','mobile.js','music.js','coach.js','home.js','i18n.js','recorder.js','voice-bank.js','coach-audio/es-orthodox-natural.mp3','coach-audio/es-southpaw-natural.mp3','coach-audio/en-orthodox-natural.mp3','coach-audio/en-southpaw-natural.mp3','audio/primal-background.mp3','primal.png','primal-favicon.png','core.js']);
['championships.js','championships.css','DIAGNOSTICO_MUSICA.html'].forEach(x=>allowed.add(x));
for(let i=1;i<=18;i++){const id=String(i).padStart(2,'0');allowed.add('championships-portraits/fighter-'+id+'.png');for(const lang of ['es','en'])allowed.add('championships-intros/'+id+'-'+lang+'.mp3');}
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.mp3':'audio/mpeg'};
function createServer(){return http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
if(req.method!=='GET'&&req.method!=='HEAD')return json(405,{error:'Método no permitido'});
if(url.pathname==='/api/health')return json(200,{ok:true,app:'PRIMAL',version:'1.0.0'});
if(url.pathname==='/api/moves')return json(200,moves);
if(['/api/combos','/api/combo'].includes(url.pathname)){const level=Number(url.searchParams.get('level')||2),focus=url.searchParams.get('focus')||'all';if(![1,2,3].includes(level)||!['all','technique','body','defense'].includes(focus))return json(400,{error:'Nivel o enfoque inválido'});return json(200,url.pathname==='/api/combo'?choose(level,focus,url.searchParams.get('last')):pool(level,focus));}
let name;try{name=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';}catch{return json(400,{error:'Ruta inválida'});}if(!allowed.has(name))return json(404,{error:'No encontrado'});
if(name==='audio/primal-background.mp3'){
 const file=path.join(__dirname,name);
 return fs.stat(file,(err,st)=>{
  if(err)return json(404,{error:'Audio no disponible'});
  let start=0,end=st.size-1,status=200;
  const range=req.headers.range;
  if(range){
   const m=/^bytes=(\d*)-(\d*)$/.exec(range);
   if(!m)return res.writeHead(416,{'Content-Range':`bytes */${st.size}`}).end();
   if(m[1])start=Number(m[1]);
   else if(m[2])start=Math.max(0,st.size-Number(m[2]));
   if(m[1]&&m[2])end=Number(m[2]);
   end=Math.min(end,st.size-1);
   if(start>end||start>=st.size)return res.writeHead(416,{'Content-Range':`bytes */${st.size}`}).end();
   status=206;
  }
  const headers={'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Content-Length':String(end-start+1),'Cache-Control':'public,max-age=3600'};
  if(status===206)headers['Content-Range']=`bytes ${start}-${end}/${st.size}`;
  res.writeHead(status,headers);
  if(req.method==='HEAD')return res.end();
  fs.createReadStream(file,{start,end}).pipe(res);
 });
}
fs.readFile(path.join(__dirname,name),(err,data)=>{if(err)return json(500,{error:'No se pudo leer el archivo'});res.writeHead(200,{'Content-Type':types[path.extname(name)],'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);});});}
if(require.main===module)createServer().listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('PRIMAL listo en http://localhost:'+(process.env.PORT||3000)));
module.exports={createServer};

// 手機「地點」的地圖（UX-PHONE-MAP-1023，src/placemap3d.js）——不需要瀏覽器。
//   1  每一個快速前往的地點（PLACES.quickList，載入各建築的配置）都在某一個圖釘裡；每個圖釘的地點都真的在清單上
//   2  圖釘在畫面內、彼此至少 18（字不疊在一起）、在自己那一區的底色上（校園的在校園、公館的在羅斯福路）
//   3  html()：每個圖釘一個 data-pmap；選中的圖釘列出它的地點、每個一顆 data-place（和清單同一個值）；沒去過的沒有按鈕；你在這裡（校園照座標、室內照那一棟）
//   4  美國（EXCH.places 那種清單）：不畫地圖；game3d.js 有接（placesHTML 呼叫、data-pmap 切換 phonePin）
// 修改前（開發分支 86de840be）：沒有 src/placemap3d.js（全部 FAIL）。用法：node tests/placemap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const load=f=>{ const p=path.join(ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/linze_layout.js','src/data/library_layout.js','src/data/lawlib_layout.js','src/data/soclib_layout.js','src/data/places.js']) load(f);
const ok=load('src/placemap3d.js');
const Q=PLACES.quickList();
check('0. 載入 src/placemap3d.js；快速前往清單有建築的入口（霖澤館、總圖、法圖、社科圖）',ok&&['linze','library_hall','lawlib','soclib'].every(z=>Q.some(p=>p[0]===z)),JSON.stringify(Q.map(p=>p[0])));
if(ok){
  const miss=Q.filter(pl=>!PLACEMAP.pinOf(pl)).map(pl=>pl[1]); check('1. 每一個快速前往的地點都在某一個圖釘裡',!miss.length,JSON.stringify(miss));
  const ghost=[]; for(const p of PLACEMAP.PINS) for(const m of p.m) if(!Q.some(pl=>pl[0]===m[0]&&pl[1]===m[1])) ghost.push(p.id+':'+m[1]); check('1. 圖釘裡的地點都真的在清單上（名字一字不差）',!ghost.length,JSON.stringify(ghost));
  const P=PLACEMAP.PINS, out=P.filter(p=>p.x<12||p.x>348||p.y<22||p.y>292).map(p=>p.id); check('2. 圖釘都在畫面內（字也在）',!out.length,JSON.stringify(out));
  let close=[]; for(let i=0;i<P.length;i++) for(let j=i+1;j<P.length;j++){ const d=Math.hypot(P[i].x-P[j].x,P[i].y-P[j].y); if(d<18) close.push(P[i].id+'/'+P[j].id+' '+d.toFixed(1)); } check('2. 圖釘彼此至少 18（字不疊）',!close.length,JSON.stringify(close));
  const inA=(p,n)=>{ const a=PLACEMAP.AREAS.find(q=>q.id===n); return !!a&&p.x>=a.x&&p.x<=a.x+a.w&&p.y>=a.y&&p.y<=a.y+a.h; };
  const camp=['linze','wancai','soclib','boya','putong','avenue','library','gongtong','dorm','gdorm','gate'].filter(id=>!inA(P.find(p=>p.id===id),'campus')), gg=['gongguan','mrt','shops'].filter(id=>!inA(P.find(p=>p.id===id),'gongguan'));
  check('2. 校園的圖釘在校園底色上、公館的在公館那一條（羅斯福路）上；118 巷在校園北邊外面（後門）',!camp.length&&!gg.length&&!inA(P.find(p=>p.id==='lane118'),'campus')&&P.find(p=>p.id==='lane118').y<P.find(p=>p.id==='linze').y,JSON.stringify({camp,gg}));
  const st=pl=>({known:pl[0]!=='cafe',open:pl[0]!=='lawlib',here:pl[0]==='dorm',mins:12,bike:false});
  const h0=PLACEMAP.html(Q,st,null,{zone:'campus',x:-38,z:6},()=>'');
  const nPin=(h0.match(/data-pmap="/g)||[]).length; check('3. 每個圖釘一個 data-pmap；沒選的時候沒有前往按鈕；有「你在這裡」',nPin===P.length&&!/data-place=/.test(h0)&&/你在這裡/.test(h0),String(nPin));
  const h1=PLACEMAP.html(Q,st,'linze',null,z=>z==='linze'?'08:00～22:00':'');
  check('3. 選霖澤館：列出霖澤館前、大廳、201 教室，各一顆 data-place（值和清單一樣：zone|名字）；營業時間跟著',['campus|台大校園（霖澤館前）','linze|霖澤館（大廳）','classroom|霖澤館 201 教室'].every(k=>h1.includes('data-place="'+k+'"'))&&h1.includes('08:00～22:00'));
  const h2=PLACEMAP.html(Q,st,'wancai',null,()=>''); check('3. 已閉館的地點按鈕寫「已閉館」（按了說幾點開，和清單一樣）',/data-place="lawlib\|法律學院圖書館">已閉館</.test(h2));
  const h3=PLACEMAP.html(Q,st,'cafe',null,()=>''); check('3. 沒去過的地點：寫「還沒去過」、沒有按鈕',h3.includes('還沒去過')&&!/data-place="cafe/.test(h3));
  const h4=PLACEMAP.html(Q,st,'dorm',null,()=>''); check('3. 你在這裡的地點：沒有按鈕',h4.includes('你在這裡')&&!/data-place="dorm/.test(h4));
  check('3. 你在哪裡：校園照座標、公館照換算、室內照那一棟、美國不在圖上',!!PLACEMAP.here('campus',0,0)&&!!PLACEMAP.here('gongguan',0,-30)&&JSON.stringify(PLACEMAP.here('classroom'))===JSON.stringify([P[0].x,P[0].y])&&PLACEMAP.here('us_apartment')===null);
  check('4. 美國的地點清單：不畫地圖（回傳空字串）',PLACEMAP.html([['us_apartment','公寓',null],['us_outside','社區',null]],st,null,null,()=>'')==='');
  const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), ix=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  check('4. game3d.js placesHTML 呼叫 PLACEMAP.html、data-pmap 切換 phonePin；index.html 載入 placemap3d.js',/PLACEMAP\.html\(PLACE_LIST\(\),placeState,phonePin/.test(g)&&/\[data-pmap\]'\)\.forEach\(b=>b\.onclick=\(\)=>\{ phonePin=phonePin===b\.dataset\.pmap\?null:b\.dataset\.pmap/.test(g)&&/src\/placemap3d\.js/.test(ix));
}
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);

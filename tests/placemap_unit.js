// 手機「地點」的地圖（UX-PHONE-MAP-1023，src/placemap3d.js）——不需要瀏覽器。
//   1  每一個快速前往的地點（PLACES.quickList，載入各建築的配置）都在某一個圖釘裡；每個圖釘的地點都真的在清單上
//   2  手指點得到（BB-B 10-23 量過第一版：圖釘可點範圍 27 px、相鄰的重疊）：整張圖都能點、選最近的圖釘（S.pick）；圖釘中心至少相隔 52 單位（手機 390 寬上約 44 px）；
//      圖釘在畫面內、在自己那一區的底色上；字不疊（用字寬估）
//   3  html()：svg 有 data-pmapsvg（畫出來的圖釘）；選中的圖釘列出它的地點、每個一顆 data-place（和清單同一個值）；沒去過的沒有按鈕；你在這裡＝那個圖釘一圈紅色
//   4  美國（EXCH.places 那種清單）：不畫地圖；game3d.js 有接（placesHTML 呼叫、點 svg 用 PLACEMAP.pick 切換 phonePin）
// 修改前（開發分支 86de840be）：沒有 src/placemap3d.js（全部 FAIL）；8282335af 第一版：第 2 節的 52 單位、整張圖都能點 FAIL。用法：node tests/placemap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const load=f=>{ const p=path.join(ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/linze_layout.js','src/data/library_layout.js','src/data/lawlib_layout.js','src/data/soclib_layout.js','src/data/gym_layout.js','src/data/places.js']) load(f);   /* gym_layout：快速前往的新體育館（和宿舍同一顆圖釘）*/
const ok=load('src/placemap3d.js');
const Q=PLACES.quickList(), J=JSON.stringify;
check('0. 載入 src/placemap3d.js；快速前往清單有建築的入口（霖澤館、總圖、法圖、社科圖）',ok&&['linze','library_hall','lawlib','soclib'].every(z=>Q.some(p=>p[0]===z)),J(Q.map(p=>p[0])));
if(ok){
  const miss=Q.filter(pl=>!PLACEMAP.pinOf(pl)).map(pl=>pl[1]); check('1. 每一個快速前往的地點都在某一個圖釘裡',!miss.length,J(miss));
  const ghost=[]; for(const p of PLACEMAP.PINS) for(const m of p.m) if(!Q.some(pl=>pl[0]===m[0]&&pl[1]===m[1])) ghost.push(p.id+':'+m[1]); check('1. 圖釘裡的地點都真的在清單上（名字一字不差）',!ghost.length,J(ghost));
  const P=PLACEMAP.PINS, V=PLACEMAP.VB, px=302/V[2];
  let close=[]; for(let i=0;i<P.length;i++) for(let j=i+1;j<P.length;j++){ const d=Math.hypot(P[i].x-P[j].x,P[i].y-P[j].y); if(d<52) close.push(P[i].id+'/'+P[j].id+' '+(d*px).toFixed(1)+'px'); }
  check('2. 圖釘中心至少相隔 52 單位（手機上約 44 px）',!close.length,J(close));
  const ids=P.map(p=>p.id); let wrong=[]; for(const p of P) for(const [dx,dy] of [[0,0],[18,0],[-18,0],[0,18],[0,-18],[13,13],[-13,-13]]){ const g=PLACEMAP.pick(p.x+dx,p.y+dy,ids); if(g!==p.id) wrong.push(p.id+'@'+dx+','+dy+'→'+g); }
  check('2. 整張圖都能點：手指落在圖釘四周 18 單位（約 15 px）以內都選到那個圖釘；離所有圖釘都很遠（左下角）＝不選',!wrong.length&&PLACEMAP.pick(14,250,ids)===null,J(wrong));
  const out=P.filter(p=>p.x<12||p.x>348||p.y<14||p.y>V[3]-14).map(p=>p.id); check('2. 圖釘都在畫面內',!out.length,J(out));
  const inA=(p,n)=>{ const a=PLACEMAP.AREAS.find(q=>q.id===n); return !!a&&p.x>=a.x&&p.x<=a.x+a.w&&p.y>=a.y&&p.y<=a.y+a.h; };
  const camp=['linze','wancai','soclib','boya','avenue','library','gongtong','gdorm','dorm','gate'].filter(id=>!inA(P.find(p=>p.id===id),'campus'));
  check('2. 校園的在校園底色上、公館在公館那一條、溫州街在溫州街；118 巷在校園北邊外面（後門）',!camp.length&&inA(P.find(p=>p.id==='gongguan'),'gongguan')&&inA(P.find(p=>p.id==='wenzhou'),'wenzhou')&&!inA(P.find(p=>p.id==='lane118'),'campus')&&P.find(p=>p.id==='lane118').y<P.find(p=>p.id==='linze').y,J(camp));
  /* 字的範圍（13 單位一個字）不和別的字、別的圖釘疊 */
  const box=p=>{ const w=[...p.name].reduce((s,c)=>s+(/[ -~]/.test(c)?7:13),0), L=p.lab||'t'; const cx=L==='l'?p.x-11-w/2:(L==='r'?p.x+11+w/2:p.x), cy=L==='t'?p.y-15:(L==='b'?p.y+17:p.y+1); return {x0:cx-w/2,x1:cx+w/2,y0:cy-7,y1:cy+7}; };
  const ov=(a,b)=>a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1; let lab=[];
  for(let i=0;i<P.length;i++){ const a=box(P[i]); for(let j=0;j<P.length;j++){ if(i===j) continue; const b=box(P[j]); if(j>i&&ov(a,b)) lab.push(P[i].id+'/'+P[j].id); if(ov(a,{x0:P[j].x-7,x1:P[j].x+7,y0:P[j].y-7,y1:P[j].y+7})) lab.push(P[i].id+'字蓋到'+P[j].id); } if(a.x0<2||a.x1>V[2]-2||a.y0<0) lab.push(P[i].id+'出界'); }
  check('2. 地名不和別的地名、別的圖釘疊，也不出界',!lab.length,J(lab));
  const st=pl=>({known:pl[0]!=='cafe',open:pl[0]!=='lawlib',here:pl[0]==='dorm',mins:12,bike:false});
  const h0=PLACEMAP.html(Q,st,null,{zone:'campus',x:-38,z:6},()=>'');
  const ring=/<circle cx="220" cy="172" r="11" fill="none" stroke="#e07a6a"/.test(h0);
  check('3. svg 有 data-pmapsvg（列出畫出來的圖釘）；沒選的時候沒有前往按鈕；你在這裡＝椰影大道那個圖釘一圈紅色',/data-pmapsvg="[a-z0-9,]+"/.test(h0)&&(h0.match(/data-pmapsvg="([^"]+)"/)[1].split(',').length===P.length)&&!/data-place=/.test(h0)&&ring);
  const h1=PLACEMAP.html(Q,st,'linze',null,z=>z==='linze'?'08:00～22:00':'');
  check('3. 選霖澤館：列出霖澤館前、大廳、201 教室，各一顆 data-place（值和清單一樣：zone|名字）；營業時間跟著',['campus|首都帝大校園（法律系館A前）','linze|霖澤館（大廳）','classroom|霖澤館 201 教室'].every(k=>h1.includes('data-place="'+k+'"'))&&h1.includes('08:00～22:00'));
  const h2=PLACEMAP.html(Q,st,'wancai',null,()=>''); check('3. 已閉館的地點按鈕寫「已閉館」（按了說幾點開，和清單一樣）',/data-place="lawlib\|法律學院圖書館">已閉館</.test(h2));
  const h3=PLACEMAP.html(Q,st,'wenzhou',null,()=>''); check('3. 溫州街圖釘含兩點半；沒去過的地點：寫「還沒去過」、沒有按鈕',h3.includes('還沒去過')&&!/data-place="cafe/.test(h3)&&/data-place="wenzhou\|溫州街"/.test(h3));
  const h4=PLACEMAP.html(Q,st,'dorm',null,()=>''); check('3. 你在這裡的地點：沒有按鈕',h4.includes('你在這裡')&&!/data-place="dorm/.test(h4));
  { const hd=PLACEMAP.html(Q,st,null,{zone:'dorm'},()=>''); check('3. 人在宿舍：宿舍圖釘紅圈、圓點是「可以前往」的橘色（不是灰色）；圖例沒有「還沒去過」（每個圖釘都有一開始就知道的地方）',/<circle cx="318" cy="228" r="11" fill="none" stroke="#e07a6a"/.test(hd)&&/<g data-pmap="dorm"><circle cx="318" cy="228" r="6.5" fill="#e9b96a"/.test(hd)&&!/還沒去過<\/div>/.test(hd)); }
  check('3. 你在哪個圖釘：校園照座標找最近的、室內照那一棟、公館的店算公館、美國不在圖上',PLACEMAP.hereId('campus',-110,2)==='gate'&&PLACEMAP.hereId('campus',85,1)==='library'&&PLACEMAP.hereId('classroom')==='linze'&&PLACEMAP.hereId('noodle')==='gongguan'&&PLACEMAP.hereId('us_apartment')===null);
  check('4. 美國的地點清單：不畫地圖（回傳空字串）',PLACEMAP.html([['us_apartment','公寓',null],['us_outside','社區',null]],st,null,null,()=>'')==='');
  const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), ix=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  check('4. game3d.js placesHTML 呼叫 PLACEMAP.html；點 svg 用 PLACEMAP.pick 換算座標、切換 phonePin；index.html 載入 placemap3d.js',/PLACEMAP\.html\(PLACE_LIST\(\),placeState,phonePin/.test(g)&&/\[data-pmapsvg\]'\)\.forEach\(sv=>sv\.onclick=e=>/.test(g)&&/PLACEMAP\.pick\(V\[0\]\+\(e\.clientX-r\.left\)\/r\.width\*V\[2\]/.test(g)&&/phonePin=phonePin===id\?null:id/.test(g)&&/src\/placemap3d\.js/.test(ix));
}
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);

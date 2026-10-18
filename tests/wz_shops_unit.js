// 溫州街三家新店的室內（DL-09 第一步；LAWWW2-B 的 ART-WZ3 ce586623、溫州街 v5 31323eb9）——不需要瀏覽器。
// 在 Node 裡建出真正的區域：半熟、阿德影印輸出、一盞——出生點站得住；每個座位旁邊站得住、從出生點走得到；出口走得到、回溫州街的落點站得住、離店門的互動點夠遠；
// 一盞的緣側走得到、前院走不到（房間 z −5～9.6）；溫州街的三個店門互動點從主巷走得到；「看日式宿舍」改成進一盞；B5 中間的分隔柱擋住；
// 營業時間（半熟週一公休、影印週日公休與考試週到 24:00、一盞週一二公休）；夏日冰菓室 5～9 月開、其他月份鐵捲門（SEASON_ICECLOSED）。
// 修改前：沒有 wz_brunch 區域（第 1 項就失敗）。用法：node tests/wz_shops_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
check('1. 三個區域都有（wz_brunch、wz_print、wz_teahouse）',['wz_brunch','wz_print','wz_teahouse'].every(k=>!!Z3.ZONES[k]));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
const nearStand=(x,z,R)=>{ for(let rr=0;rr<=R;rr+=0.1) for(let a=0;a<24;a++){ const tx=x+Math.cos(a/24*Math.PI*2)*rr, tz=z+Math.sin(a/24*Math.PI*2)*rr; if(E.canStand(tx,tz,0.32,0)) return [tx,tz]; } return null; };
const WZ={};
for(const k of ['brunch','print','teahouse']){ const L=WZ_SHOPS_LAYOUT[k]; const z=loadZone('wz_'+k); if(E.fitSeatRadius) E.fitSeatRadius();   /* 和引擎的 E.loadZone 一樣：導航格設好以後，站不到的座位放大互動範圍 */ const sp=[E.zone.spawn.x,E.zone.spawn.z];
  check('2. '+L.name+'：出生點 ('+sp+') 站得住',E.canStand(sp[0],sp[1],0.32,0));
  const seats=E.interactables.filter(i=>i.seat&&i.shop===k), want=L.seats.filter(s=>!s.npcOnly&&!/打工/.test(s.label||''));
  check('2. '+L.name+'：座位 '+want.length+' 個（打工的位子不給客人坐；影印店沒有客人的位子）',seats.length===want.length&&(want.length>0||k==='print'),seats.length+'/'+want.length);
  /* 玩家從走道靠近：互動範圍內（範圍－0.05 m、0.2 m 格點）站得住的點，離出生點近的先試，有一個走得到就算（和 reachability_all 一樣，不是只試座位正中間）*/
  const reach=(i,from)=>{ const R=i.radius-0.05, pts=[]; for(let dx=-R;dx<=R+1e-9;dx+=0.2) for(let dz=-R;dz<=R+1e-9;dz+=0.2){ if(dx*dx+dz*dz>R*R) continue; const x=i.x+dx, zz=i.z+dz; if(E.canStand(x,zz,0.32,0)) pts.push([x,zz]); } pts.sort((a,b)=>Math.hypot(a[0]-from[0],a[1]-from[1])-Math.hypot(b[0]-from[0],b[1]-from[1])); for(const q of pts.slice(0,30)){ const r=walk(from,q); if(r.ok) return {ok:true}; } return {ok:false,reason:pts.length?'走不到':'範圍內站不住'}; };
  const bad=[]; for(const i of seats){ const r=reach(i,sp); if(!r.ok) bad.push('('+i.x+','+i.z+')'+r.reason); }
  check('2. '+L.name+'：每個座位旁邊站得住、從門口走得到',!bad.length,bad.join('、'));
  const ex=E.interactables.find(i=>i.exit&&i.exit.to==='wenzhou'); const p=ex&&nearStand(ex.x,ex.z,ex.radius-0.05); const r=p&&walk([L.seats[0].x,L.seats[0].z-0.0],p);
  check('2. '+L.name+'：「'+(ex&&ex.label)+'」走得到',!!ex&&!!p&&(Math.hypot(p[0]-sp[0],p[1]-sp[1])<0.05||walk(sp,p).ok));
  { const want={brunch:'點餐,看今日推薦',print:'印東西,買文具',teahouse:'喝茶,看院子,看床之間的掛軸'}[k]; const mi=E.interactables.filter(i=>i.wzShop===k);
    /* 選單的按鈕真的出現：範圍內站得住、走得到，而且站在那裡時最近的互動點是它（不被座位、出口蓋過；引擎照距離挑）*/
    const shows=i=>{ const R=i.radius-0.05; for(let dx=-R;dx<=R+1e-9;dx+=0.1) for(let dz=-R;dz<=R+1e-9;dz+=0.1){ if(dx*dx+dz*dz>R*R) continue; const x=i.x+dx, zz=i.z+dz; if(!E.canStand(x,zz,0.32,0)) continue;
      let best=null, bd=1e9; for(const q of E.interactables){ const d=Math.hypot(q.x-x,q.z-zz); if(d<=q.radius&&d<bd){ bd=d; best=q; } } if(best===i&&(Math.hypot(x-sp[0],zz-sp[1])<0.05||walk(sp,[x,zz]).ok)) return true; } return false; };
    const bad2=mi.filter(i=>!shows(i)).map(i=>i.label);
    check('2b. '+L.name+'：客人的選單（AA_172）「'+want+'」有互動點、按鈕走得到也真的出現；打工用的（出餐檯、廚房、櫃台、膠裝、水屋）還沒有',mi.map(i=>i.label).join(',')===want&&!bad2.length&&!E.interactables.some(i=>/打工/.test(i.label||'')),mi.map(i=>i.label).join(',')+(bad2.length?'；按鈕不出現：'+bad2.join('、'):'')); }
  WZ[k]={ex,L};
  if(k==='teahouse'){ check('3. 一盞：緣側 (1,5.6) 站得住、從玄關走得到；前院 (0,7.9)、(3,8.8) 走不到',E.canStand(1,5.6,0.32,0)&&walk(sp,[1,5.6]).ok&&!E.canStand(0,7.9,0.1,0)&&!E.canStand(3,8.8,0.1,0));
    check('3. 一盞：茶席、水屋擋住；和室從紙拉門的開口走得進去',!E.canStand(-1.6,1.7,0.1,0)&&!E.canStand(3.75,1.3,0.1,0)&&walk(sp,[-2.1,-1.6]).ok); } }
// 溫州街這一側
{ const z=loadZone('wenzhou'); const LANE=[0,0];
  for(const k of ['brunch','print','teahouse']){ const L=WZ_SHOPS_LAYOUT[k]; const it=E.interactables.find(i=>i.exit&&i.exit.to==='wz_'+k); const p=it&&nearStand(it.x,it.z,it.radius-0.05); const r=p&&walk(LANE,p);
    check('4. 溫州街「'+L.enterAt.label+'」('+L.enterAt.x+','+L.enterAt.z+') 從主巷走得到',!!it&&!!r&&r.ok,r?r.reason||'':'沒有互動點或站不住');
    const back=L.exit.spawn; const near=E.interactables.find(i=>i.exit&&i.exit.to==='wz_'+k);
    check('4. 從'+L.name+'出來的落點 ('+back.x+','+back.z+') 站得住、和店門互動點的距離 '+(near?Math.hypot(back.x-near.x,back.z-near.z).toFixed(2):'?')+' m（出來時按鈕在旁邊沒關係，不會自動再進去）',E.canStand(back.x,back.z,0.32,0)); }
  check('4. 「看日式宿舍」不在了（整修成一盞茶屋）',!E.interactables.some(i=>i.label==='看日式宿舍'));
  check('4. B5 中間的分隔柱 (23.0,−5.3) 擋住；騎樓 (23.0,−6.4) 和人行道 (23.0,−4.3) 照樣走得到',!E.canStand(23.0,-5.3,0.1,0)&&walk([20,-4.3],[26,-4.3]).ok); }
// 營業時間
{ const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
  const MON=dayOf('2025-10-06'), TUE=dayOf('2025-10-07'), WED=dayOf('2025-10-08'), SAT=dayOf('2025-10-11'), SUN=dayOf('2025-10-12');
  check('5. 半熟：週一公休；週二 08:00 開；週六 07:30 開、15:00 關',!PLACES.isOpen('wz_brunch',10,MON)&&PLACES.isOpen('wz_brunch',8,TUE)&&!PLACES.isOpen('wz_brunch',7.6,TUE)&&PLACES.isOpen('wz_brunch',7.6,SAT)&&!PLACES.isOpen('wz_brunch',15,SAT));
  check('5. 影印：週日公休；平日 09:00～22:00',!PLACES.isOpen('wz_print',12,SUN)&&PLACES.isOpen('wz_print',9,MON)&&!PLACES.isOpen('wz_print',22.5,MON));
  let ex=null; for(let d=MON;d<MON+120&&!ex;d++){ const t=CALENDAR.termOf(d); if(t&&t.week===16&&CALENDAR.dateOf(d).wd===3) ex=d; }
  check('5. 影印：考試週（第 16 週，16 週制）開到 24:00',!!ex&&PLACES.isOpen('wz_print',23.5,ex),String(ex));
  check('5. 一盞：週一、週二公休；週三 12:00～20:00',!PLACES.isOpen('wz_teahouse',14,MON)&&!PLACES.isOpen('wz_teahouse',14,TUE)&&PLACES.isOpen('wz_teahouse',14,WED)&&!PLACES.isOpen('wz_teahouse',11,WED)&&!PLACES.isOpen('wz_teahouse',20,WED));
  const t1=PLACES.closedText('wz_teahouse',14,MON), t2=PLACES.closedText('wz_brunch',16,TUE);
  check('5. 關門的說明：「一盞 今天公休。下次開門：這週三 12:00。」不推薦去總圖',t1==='一盞 今天公休。下次開門：這週三 12:00。',t1);
  check('5. 今天已經關了：「半熟 現在沒有開（今天 08:00–15:00）。下次開門：明天 08:00。」',t2==='半熟 現在沒有開（今天 08:00–15:00）。下次開門：明天 08:00。',t2);
  check('5. 颱風假三家都不開',['wz_brunch','wz_print','wz_teahouse'].every(k=>PLACES.typhoonShops.includes(k))); }
// 冰菓室的季節
{ const mk=()=>{ const r=new THREE.Group(); for(const nm of ['SEASON_ICECLOSED_on_B5i','other']){ const o=new THREE.Object3D(); o.name=nm; r.add(o); } return r; };
  const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
  const at=ds=>{ global.GAME={G:{day:dayOf(ds)}}; const r=mk(); Z3.wzParkSeason(r); return r.children[0].visible; };
  check('6. 夏日冰菓室：7 月開（鐵捲門藏起來）、10 月和 1 月冬天休息（鐵捲門）',at('2026-07-10')===false&&at('2025-10-10')===true&&at('2026-01-10')===true&&at('2026-05-02')===false); delete global.GAME; }
{ const gs=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); check('7. 一盞的座位選「讀書」：「這裡不太適合攤開六法。」（AA_164 2-3）',/it\.shop==='teahouse'\) opts\.push\(\{t:'讀書',teaNo:true\}\)/.test(gs)&&gs.indexOf("'這裡不太適合攤開六法。'")>0);
  const ih=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); check('7. index.html 在 zones3d 之前載入 wz_shops_layout.js',ih.indexOf('src/data/wz_shops_layout.js')>0&&ih.indexOf('src/data/wz_shops_layout.js')<ih.indexOf('src/zones3d.js'));
  const as=fs.readFileSync(path.join(ROOT,'src/assets3d.js'),'utf8'); check('7. manifest 有三家店的室內模型，檔案都在',['brunch','print','teahouse'].every(k=>as.indexOf("'bldg.wz_"+k+"_interior'")>0&&fs.existsSync(path.join(ROOT,'assets/models/env/second_ai/wz_'+k+'_interior.glb')))); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

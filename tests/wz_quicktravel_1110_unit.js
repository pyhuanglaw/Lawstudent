// 溫州街的快速前往列出每一家店（WZ-QUICKTRAVEL-1110；使用者 2026-11-10 18:3x「溫州街在地圖上就只能到溫州街沒辦法馬上到像手機裡面你點某個地區會出現那個地區的所有店家你可以馬上到達，
//   可是溫州街你只能到溫州街……地圖上的馬上過去要改」）——不需要瀏覽器。
//   1  PLACES.names 裡溫州街的每一家店（wz_*、cafe）都有一筆快速前往：進得去的店＝[那一區, 店名, …]；騎樓窗口、櫥窗的店＝[wenzhou, 店名, 落點, 那一家]（第 4 格＝營業時間照哪一家）
//   2  這些都在手機「地點」的溫州街那一區（PLACEMAP.areaOf）、大地圖的溫州街圖釘；人在店裡＝溫州街
//   3  在 Node 裡建出真正的區域：每個落點站得住；進得去的店從落點走得到出口；窗口、櫥窗的店落在那一家的按鈕範圍裡、面對它、走得到溫州街的出口
//   4  原本的地點沒有變（名字、落點、順序）；溫州街第一筆照舊是「溫州街」（邀約、朋友直接過去照 zone 找第一筆）
//   5  營業時間：game3d.js placeState／quickGo／清單照第 4 格；冰菓室 10～4 月、溫州書屋週一＝不開；溫州街好幾個落點照距離（classes3d.js travelMinutes，和公館一樣）
//   6  導航（guide3d.js LINKS）：溫州街 ⇄ 四家進得去的店
// 修改前（WZ-QUICKTRAVEL-1110 的上一個 commit 0468e41aa）：只有溫州街、2:30 AM、木曜日、日常失速、一盞（第 1 項 FAIL）。用法：node tests/wz_quicktravel_1110_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
/* 和 index.html 同一個順序（溫州街的店：wz_shops_layout → daily_offbeat_layout → lin_layout（換掉 WZ_SHOPS_LAYOUT.lin）→ zones3d）*/
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/daily_offbeat_layout.js','src/data/lin_layout.js','src/zones3d.js',
  'src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/calendar.js','src/data/places.js','src/wzshops3d.js','src/placemap3d.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
ASSETS.loadOne=()=>new Promise(()=>{});   /* 正式模型不載入（導航、出生點、互動點不靠模型）*/
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const Q=PLACES.quickList(), N=PLACES.names;
// 1
const SHOPS=Object.keys(N).filter(k=>/^wz_/.test(k)||k==='cafe');
const entryOf=k=>Q.find(p=>p&&(p[3]===k||(p[0]===k&&!p[3])));
const miss=SHOPS.filter(k=>!entryOf(k));
check('1. 溫州街每一家店（'+SHOPS.length+' 家：'+SHOPS.map(k=>N[k]).join('、')+'）都有快速前往',!miss.length,'沒有：'+J(miss.map(k=>N[k])));
const ents=SHOPS.map(entryOf).filter(Boolean);
check('1. 名字照 PLACES.names',ents.every(p=>p[1]===N[p[3]||p[0]]),J(ents.map(p=>p[1])));
const STORE=['wz_tea','wz_ice','wz_books'];   /* 騎樓窗口、櫥窗：不是區域 */
check('1. 進得去的店＝那一區（Z3.ZONES 有）；窗口、櫥窗的店（帝大紅茶、夏日冰菓室、溫州書屋）＝溫州街＋第 4 格那一家',ents.every(p=>STORE.includes(p[3])?p[0]==='wenzhou'&&!!p[2]:(!p[3]&&!!Z3.ZONES[p[0]]))&&STORE.every(k=>!Z3.ZONES[k]),J(ents.map(p=>[p[0],p[3]||''])));
const ql=Q.map(p=>p[0]+'|'+p[1]); check('1. 快速前往沒有重複的地點（zone|名字，手機的 data-place）',new Set(ql).size===ql.length);
// 2
const nonWz=ents.filter(p=>PLACEMAP.areaOf(p)!=='wenzhou');
check('2. 手機「地點」：全部在溫州街那一區（和公館的店在公館那一區一樣）',!nonWz.length,J(nonWz.map(p=>p[1])));
const wzArea=Q.filter(p=>PLACEMAP.areaOf(p)==='wenzhou').map(p=>p[1]);
check('2. 溫州街那一區：溫州街＋11 家店（原本 5 個地點）',wzArea.length===12&&wzArea[0]==='溫州街',J(wzArea));
check('2. 人在進得去的那四家＝你在溫州街（地圖的紅圈、預設展開溫州街）',['wz_brunch','wz_print','wz_lin','wz_teishoku'].every(z=>PLACEMAP.hereArea({zone:z})==='wenzhou'));
const st=pl=>({known:true,open:pl[3]!=='wz_ice',here:false,mins:5,bike:false});
const hx=PLACEMAP.listHTML(Q,st,'wenzhou',null,z=>'H:'+z);
check('2. 展開溫州街：每一家一列、data-place 照 zone|名字；營業時間照第 4 格那一家（不是溫州街）',['wz_brunch|SUNNY SIDE','wz_lin|林家乾麵','wenzhou|帝大紅茶','wenzhou|溫州書屋'].every(k=>hx.includes('data-place="'+k+'"'))&&hx.includes('H:wz_tea')&&hx.includes('H:wz_books')&&/data-place="wenzhou\|夏日冰菓室">已閉館</.test(hx));
// 3
const zs={}; const bz=id=>zs[id]||(zs[id]={z:loadZone(id),it:E.interactables.slice(),nav:E.nav});
const BTN={wz_tea:'買一杯飲料',wz_ice:'買一碗冰',wz_books:'看書店的櫥窗'};
for(const p of ents.filter(p=>['wz_brunch','wz_print','wz_lin','wz_teishoku','wz_tea','wz_ice','wz_books'].includes(p[3]||p[0]))){ const k=p[3]||p[0];
  let Z; try{ Z=bz(p[0]); }catch(e){ check(p[1]+'：區域建得起來',false,String(e).slice(0,160)); continue; }
  E.interactables=Z.it; E.nav=Z.nav; E.zone=Z.z; E.levels=Z.z.levels||null;
  const s=p[2]||Z.z.spawn; const ok=E.canStand(s.x,s.z,0.32,s.lv|0);
  check(p[1]+'：落點 ('+s.x+','+s.z+') 站得住',ok);
  if(!ok) continue;
  const exits=Z.it.filter(i=>i.exit), ex=STORE.includes(k)?exits.filter(i=>i.exit.to==='xinsheng'):exits;
  const bad=[]; for(const i of ex){ const R=(i.radius||1.5)-0.05; let best=null; for(let rr=0;rr<=R&&!best;rr+=0.1) for(let a=0;a<24;a++){ const tx=i.x+Math.cos(a/24*Math.PI*2)*rr, tz=i.z+Math.sin(a/24*Math.PI*2)*rr; if(E.canStand(tx,tz,0.32,i.lv|0)){ best=[tx,tz]; break; } }
    const r=best?E.simWalk(s.x,s.z,best[0],best[1],{lv0:0,lv1:i.lv|0,dt:0.1,speed:4.1}):null; if(!(r&&r.ok)) bad.push((i.label||'出口')+(r?'：'+r.reason:'：站不住')); }
  check(p[1]+'：從落點走得到出口（'+(ex.length-bad.length)+'/'+ex.length+(STORE.includes(k)?'，往新生南路':'')+'）',ex.length>0&&!bad.length,bad.join('、'));
  if(STORE.includes(k)){ const b=Z.it.find(i=>i.label===BTN[k]); const d=b?Math.hypot(b.x-s.x,b.z-s.z):99, fx=Math.sin(s.yaw), fz=Math.cos(s.yaw), dot=b&&d>0?((b.x-s.x)*fx+(b.z-s.z)*fz)/d:0;
    check(p[1]+'：落在「'+BTN[k]+'」的按鈕範圍裡（'+d.toFixed(2)+' m ＜ '+(b?b.radius:'?')+'）、面對它（yaw 0＝往 +z，dot '+dot.toFixed(2)+'）',!!b&&d<b.radius-0.1&&dot>0.9); }
  else check(p[1]+'：落點 null＝區域出生點（從店門進去站的地方，和一盞一樣）、出口回溫州街',p[2]===null&&exits.some(i=>i.exit.to==='wenzhou')); }
// 4
const OLD=[['wenzhou','溫州街',{x:20,z:0,yaw:-Math.PI/2}],['lane118','118 巷',{x:0,z:47.6,yaw:Math.PI}],['cafe','2:30 AM',{x:0,z:5,yaw:Math.PI}],['wz_mokuyobi','木曜日',{x:-3.75,z:5.4,yaw:Math.PI,lv:0}],['wz_offbeat','日常失速',{x:-3.9,z:3.0,yaw:Math.PI}],['wz_teahouse','一盞',null]];
const idx=OLD.map(o=>Q.findIndex(p=>p[0]===o[0]&&p[1]===o[1]));
check('4. 原本溫州街一帶的地點：名字、落點、順序都沒變',idx.every(i=>i>=0)&&idx.every((v,i)=>!i||v>idx[i-1])&&OLD.every((o,i)=>J(Q[idx[i]].slice(0,3))===J(o)),J(idx));
check('4. 溫州街的第一筆照舊是「溫州街」（INV.goTarget、手機「朋友」直接過去照 zone 找第一筆）',Q.find(p=>p[0]==='wenzhou')[1]==='溫州街');
check('4. 其他地區（公館、新生南路、宿舍）照舊',['公館商圈','捷運公館站','公館燒臘','日和便利店','頁間書屋','新生南路','宿舍'].every(n=>Q.some(p=>p[1]===n))&&Q[Q.length-1][1]==='宿舍');
check('4. 只有騎樓窗口、櫥窗那三筆有第 4 格',Q.filter(p=>p[3]!=null).map(p=>p[3])   /* 第 4 格＝營業時間的 key；第 5 格（走進去過才出現）是另一回事，有第 5 格的列第 4 格是 undefined（2026-11-12：六間店補進快速前往以後這裡用 length 判會誤判）*/ .sort().join(',')==='wz_books,wz_ice,wz_tea');
// 5
const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
check('5. game3d.js placeState：開不開照第 4 格那一家；溫州街好幾個落點（和校園、公館一樣照距離算「你在這裡」）',/function placeState\(pl\)\{ const \[z,,sp,hz0\]=pl, hz=hz0\|\|z;[^\n]*PLACES\.isOpen\(hz,G\.hour,G\.day\)[^\n]*z!=='campus'&&z!=='gongguan'&&z!=='wenzhou'/.test(g));
check('5. quickGo 關著的說明照那一家（PLACES.closedText(st.hz…)）、到了才開也照那一家（openAt(st.hz…)）；大地圖清單、手機清單的營業時間照第 4 格',/openAt\(st\.hz,G\.hour\+st\.mins\/60\)\)\)\{ toast\(st\.shut\|\|\(typeof PLACES!=='undefined'\?PLACES\.closedText\(st\.hz,/.test(g)&&/for\(const pl of places\)\{ const \[z,label\]=pl, hk=pl\[3\]\|\|z;/.test(g)&&/quickGo\(pl\); \};/.test(g)&&/const st=placeState\(pl\), hk=pl\[3\]\|\|pl\[0\];/.test(g));
const pm=fs.readFileSync(path.join(ROOT,'src/placemap3d.js'),'utf8'); check('5. placemap3d.js 的營業時間（圖釘下面、分區清單）照第 4 格',(pm.match(/hours\(pl\[3\]\|\|pl\[0\]\)/g)||[]).length===3);
{ const day=d=>{ for(let k=1;k<400;k++){ const x=CALENDAR.dateOf(k); if(d(x)) return k; } return null; };
  const winter=day(x=>x.m===12&&x.wd===3), summer=day(x=>x.m===7&&x.wd===3), mon=day(x=>x.m===10&&x.wd===1&&!CALENDAR.holiday(x));
  check('5. 營業時間：冰菓室 12 月週三 13:00 不開、7 月週三 13:00 開；溫州書屋週一不開、週三 13:00 開；帝大紅茶 09:00 不開（說明照那一家）',winter&&summer&&mon&&!PLACES.isOpen('wz_ice',13,winter)&&PLACES.isOpen('wz_ice',13,summer)&&!PLACES.isOpen('wz_books',13,mon)&&PLACES.isOpen('wz_books',13,summer)&&!PLACES.isOpen('wz_tea',9,summer)&&/^帝大紅茶/.test(PLACES.closedText('wz_tea',9,summer)),J([winter,summer,mon,PLACES.closedText('wz_tea',9,summer)])); }
{ const G={day:3,hour:10,zone:'wenzhou'}, T=(a,b)=>CLS.travelMinutes(G,'wenzhou','wenzhou',a,b), wz=Q.find(p=>p[1]==='溫州街')[2], tea=entryOf('wz_tea')[2], bk=entryOf('wz_books')[2];
  const a=T({x:-37,z:-9},wz), b=T({x:19,z:-2},wz), c=T({x:17,z:-6},tea), d=T({x:-30,z:0},bk), e=CLS.travelMinutes(G,'wenzhou','wenzhou',null,null), f=CLS.travelMinutes(G,'dorm','wenzhou',null,tea);
  check('5. 溫州街裡照距離：西邊轉角到「溫州街」要幾分鐘、站在旁邊＝0（你在這裡）；窗口前＝0；沒有位置＝0（照舊）；從宿舍照溫州街算（5～30 分鐘）',a>=5&&b===0&&c===0&&d>=5&&e===0&&f>=5&&f<=30,J([a,b,c,d,e,f])); }
// 6
const gd=fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8');
check('6. 導航 LINKS：溫州街 ⇄ SUNNY SIDE、阿德影印、林家乾麵、小路',['wz_brunch','wz_print','wz_lin','wz_teishoku'].every(z=>new RegExp("wenzhou:\\[[^\\]]*'"+z+"'").test(gd)&&new RegExp(z+":\\['wenzhou'\\]").test(gd)));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

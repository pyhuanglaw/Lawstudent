// 公館第二批：afar café、Daybreak 進得去（GG-SHOPS2-1104；USER_WANTS X209；AA_650、AA_652）——不需要瀏覽器（D131）。
//   afar café（新區域 afar：AA 的 aa_support/afar.glb＋src/data/afar_layout.js，story-planning 8a0bd80f2）、
//   Daybreak（新區域 daybreak：AA 的 aa_support/daybreak.glb＋src/data/daybreak_layout.js，8094770c7）；台詞 AA_652（企劃線 303cded56）、系統 src/gg2shops3d.js。
// 第一部分（A）建出遊戲真正的區域（公館＋兩間室內，zones3d.js 真正的程式），用引擎真正的找路與移動（E.simWalk：30 fps＋低幀率）檢查：
//   1 兩間建得起來、尺寸照配置、正式模型的資產登錄、配置的導航阻擋都擋住
//   2 公館店門口「進入 afar café」「進入 Daybreak」：門＝那一棟中心 − 配置的門 x（7.93、70.94）、按得到、從人行道走得到（洋洋鹹酥雞、轉角唱片 11-07 起進得去：tests/yangyang_shop_unit.js、corner_shop_unit.js）
//   3 進門站的地方站得住、不在出口範圍（＋0.2 m）裡；出口按得到、走得到；出來回公館站得住、不在公館任何出口的範圍裡
//   4 座位：數量照配置（afar 26、Daybreak 23：配置 v2 拿掉長桌西側中間那張，AA 68c166ed2）、玩家坐得到的每一個按得到、走得到（走不到的四張只給路人坐）；能讀書的照 canStudy
//   5 點餐、看甜點櫃、看看書架、看菜單（配置的 interact）按得到、走得到；Daybreak 的看菜單不和點餐疊在一起
//   6 店員、路人（CROWD）、快速前往、大地圖、引路、路程、城鎮判定、index.html 載入順序、LICENSES.md、劇情匯入白名單
// 第二部分（B，子程序：tests/pg_harness.js 的遊戲資料＋邀約系統）：
//   7 營業時間（places.js）、關門時按門（afar 寫開放時間、Daybreak 15:00 以後木牌）、打烊請你出來（那一刻＝店員「我們今天要打烊了。」一句，AA_700；之後＝只寫開放時間）
//   8 進門一天一次（一個人；今天約在這裡不說）、點餐扣錢、錢不夠（店員那一句、不扣錢）、只有點手沖／法式吐司才說的那一句、Daybreak 吃 40 分鐘＋吃完旁白、看的東西、照位子的坐下句
//   9 約會地點：afar（喝咖啡、剛認識就可以）、daybreak（吃飯、08:00～14:00 開始、14:00 以後的旁白）、七位答應的那一句＋一般那句、坐下以後的開場句
//   10 台詞逐字對照 AA_652（git show 企劃線；讀不到就 SKIP）
// 修改前（開發分支 cb1d84290）：沒有 afar、daybreak 區域、門口沒有按鈕、沒有 GG2、沒有營業時間與約會地點——第 1～10 節都 FAIL。
// 用法：node tests/gg_shops2_1104_unit.js
/* 2026-11-11（X324 D 區，AA_784_invites.json）：invites.js 照覆蓋層拿掉刪節號、換句——答應句的期望包 OE.fwd（舊期望＝裡面的字），逐字對稿時「新字的舊字在稿上」也算（OE.inDoc；tests/overlay_expect.js）*/
const OE=require('./overlay_expect.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8'), J=x=>JSON.stringify(x), r2=v=>+(+v).toFixed(2);
const LAYS=['src/data/afar_layout.js','src/data/daybreak_layout.js'];
if(process.argv[2]==='B') partB(); else partA();

function partA(){
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=rd('tests/nav_buildings_unit.js');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/data/lane118_props.js',
  'src/data/xinsheng_layout.js','src/data/bike_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js',...LAYS,'src/xinsheng3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/bike3d.js','src/bikeshop3d.js','src/crowd3d.js','src/data/pool_story.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:(/xinsheng3d|mokuyobi3d/.test(f)?3:4)));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===3)).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=rd(f); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
ASSETS.loadOne=()=>Promise.reject(new Error('no GLB in node'));
const G={zone:'gongguan',day:30,hour:15,flags:{},money:5000,weather:'clear'}; global.GAME={G};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius(); return {z,its:E.interactables.slice()}; }
const walk=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{dt}); if(!r.ok) return Object.assign({dt:r2(dt)},r); } return {ok:true}; };
function touchable(it,from){ const r=(it.radius||1.5)-0.05, P=E.player, c=[];
  for(let dz=-r;dz<=r+1e-6;dz+=0.2) for(let dx=-r;dx<=r+1e-6;dx+=0.2){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, z=it.z+dz; if(E.canStand(x,z,0.32,0)) c.push([d,x,z]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [,x,z] of c){ P.obj.position.set(x,0,z); if(E.nearestInteractable()!==it) continue; if(from&&!walk(from,[x,z]).ok) continue; return [x,z]; } return null; }
const inExit=(its,s,margin)=>its.filter(q=>q.exit&&!q.hidden&&Math.hypot(q.x-s.x,q.z-s.z)<(q.radius||1.8)+margin).map(q=>q.label+' '+Math.hypot(q.x-s.x,q.z-s.z).toFixed(2)+'m');
const SPEC={afar:{L:typeof AFAR_LAYOUT!=='undefined'?AFAR_LAYOUT:null,name:'afar café',seats:26,glb:'bldg.afar_interior',npcOnly:[[-4.65,-2.3],[-4.65,-3.4]],door:'進入 afar café',cx:10.5,doorX:7.93,items:{order:'點咖啡',pastry:'看甜點櫃',bookshelf:'看看書架',menu:'看菜單'}},
  daybreak:{L:typeof DAYBREAK_LAYOUT!=='undefined'?DAYBREAK_LAYOUT:null,name:'Daybreak',seats:23,glb:'bldg.daybreak_interior',npcOnly:[[0.6,-3.5]],door:'進入 Daybreak',cx:73.1,doorX:70.94,items:{order:'點餐',pastry:'看甜點櫃',menu:'看菜單'}}};
const SI=Z3.SHOP_IN;
// ---- 2 公館店門口 ----
const GG=loadZone('gongguan'); const gIts=GG.its, gNav=GG.z.nav;
{ let x=-68; const W=[10,8,12,10,8,8,9,9,8,9,9,10,8,9,9]; const cx=[]; W.forEach((w,i)=>{ const X1=x+w+(i<8&&i<W.length-1?1.2:0); cx.push((x+X1)/2); x=X1; });
  check('2 店面街第 7、14 棟的中心＝SHOP_IN 用的 10.5、73.1（照 zones3d.js 的 shops 表）',Math.abs(cx[7]-10.5)<1e-6&&Math.abs(cx[14]-73.1)<1e-6,J([cx[7],cx[14]])); }
for(const k of ['afar','daybreak']){ const S=SPEC[k], door=gIts.find(q=>q.exit&&q.exit.to===k);
  check(`2 ${S.name}：公館店門口「${S.door}」進 ${k}`,!!door&&door.label===S.door,J(door&&[door.label,door.x,door.z]));
  if(!door) continue;
  check(`2 ${S.name}：門口互動點 (${S.doorX}, 21)＝那一棟中心 ${S.cx} − 配置的門 x ${S.L&&S.L.front.door.x}（騎樓機車讓開的 DOORS 同一個位置）`,Math.abs(door.x-S.doorX)<0.011&&door.z===21&&/7\.93/.test(rd('src/zones3d.js'))&&new RegExp('DOORS=\\[[^\\]]*'+String(S.doorX).replace('.','\\.')).test(rd('src/zones3d.js')),J([door.x,door.z]));
  check(`2 ${S.name}：進門站的地方＝SHOP_IN（${J(door.exit.spawn)}）`,!!SI[k]&&J(door.exit.spawn)===J({x:SI[k].x,z:SI[k].z,yaw:SI[k].yaw}));
  E.zone=GG.z; E.nav=gNav; E.interactables=gIts; const tp=touchable(door);
  check(`2 ${S.name}：店門口按得到（範圍裡站得住、最近的互動就是它）`,!!tp,J(tp));
  if(tp){ const w=walk([door.x,15],tp); check(`2 ${S.name}：從羅斯福路人行道 (${door.x.toFixed(1)}, 15) 走到店門口`,w.ok,J(w).slice(0,200)); } }
/* 洋洋鹹酥雞（G05）、轉角唱片（G12）2026-11-07 起進得去（YANGYANG-IN-1107、CORNER-IN-1107）：門口在 tests/yangyang_shop_unit.js、corner_shop_unit.js 測（這支沒有載入那兩個配置）*/
// ---- 1、3、4、5 兩間室內 ----
for(const k of ['afar','daybreak']){ const S=SPEC[k], L=S.L; let R;
  if(!L||!Z3.ZONES[k]){ check(`1 ${S.name}：區域 ${k} 存在（配置 ${k}_layout.js 有載入）`,false); continue; }
  try{ R=loadZone(k); }catch(e){ check(`1 ${S.name}：區域建得起來`,false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); continue; }
  const z=R.z, its=R.its, IN=SI[k];
  check(`1 ${S.name}：區域建得起來、尺寸照配置 ${L.w}×${L.d}×${L.h}、名字「${Z3.ZONES[k].name}」`,!!z&&z.bounds.w===L.w&&z.bounds.d===L.d&&Z3.ZONES[k].name===S.name&&z.gg===k&&IN.gg===true,J(z&&z.bounds));
  const man=ASSETS.manifest[S.glb]; check(`1 ${S.name}：正式模型登錄 ${S.glb}＝${L.glb}（檔案在、building）`,!!man&&man.url===L.glb&&fs.existsSync(path.join(ROOT,L.glb))&&man.type==='building',J(man&&man.url));
  const onSeat=b=>(L.seats||[]).some(s=>Math.abs(b[0]-s.x)<0.05&&Math.abs(b[1]-s.z)<0.05), BL=(L.blocks||[]).filter(b=>!onSeat(b)), blk=BL.filter(b=>E.canStand(b[0],b[1],0.05,0));
  check(`1 ${S.name}：配置的導航阻擋 ${BL.length} 個都擋住（中心站不住）`,!blk.length,J(blk));
  const sp=z.spawn, ex=its.find(q=>q.exit&&q.exit.to==='gongguan');
  check(`3 ${S.name}：進門站的地方 (${sp.x}, ${sp.z}) 站得住（半徑 0.3）`,E.canStand(sp.x,sp.z,0.3,0)&&sp.x===IN.x&&sp.z===IN.z,J(sp));
  const near=inExit(its,sp,0.2); check(`3 ${S.name}：進門站的地方不在任何出口的範圍（＋0.2 m）裡`,!near.length,J(near));
  check(`3 ${S.name}：出口「${L.exit.label}」在門內（x ${L.exit.at.x}）`,!!ex&&ex.label===L.exit.label&&ex.x===L.exit.at.x,J(ex&&[ex.label,ex.x,ex.z,ex.radius]));
  if(ex){ const tp=touchable(ex,[sp.x,sp.z]); check(`3 ${S.name}：出口按得到、從進門的地方走得到`,!!tp,J(tp));
    const out=ex.exit.spawn; check(`3 ${S.name}：出來回公館 (${out.x}, ${out.z}) 站得住、不在公館任何出口的範圍（＋0.2 m）裡、就在店門前`,gNav.clear(out.x,out.z,0.3)&&!inExit(gIts,out,0.2).length&&Math.abs(out.x-S.doorX)<0.02,J([out,inExit(gIts,out,0.2)])); }
  const seats=its.filter(q=>q.seat), npc=(z.seats||[]).filter(q=>q.npcOnly).map(q=>[q.x,q.z]);
  check(`4 ${S.name}：座位 ${S.seats} 個（照配置），玩家走不到的 ${J(S.npcOnly)} 只給路人坐、不出「坐下」（要 LAWWW2／AA 調配置）`,z.seats.length===S.seats&&seats.length===S.seats-S.npcOnly.length&&J(npc)===J(S.npcOnly),seats.length+'／'+z.seats.length+' '+J(npc));
  const bad=[]; for(const it of seats){ if(!touchable(it,[sp.x,sp.z])) bad.push([it.seat.x,it.seat.z]); }
  check(`4 ${S.name}：每一個座位都按得到、走得到`,!bad.length,J(bad));
  const st=seats.filter(q=>q.study).length, want=(L.seats||[]).filter(s=>s.canStudy).length-S.npcOnly.length;
  check(`4 ${S.name}：能讀書的座位 ${want} 個（照配置 canStudy；AA_652「在這裡讀書照讀書系統算」）`,st===want&&want>0,st+'／'+want);
  check(`4 ${S.name}：座位的 shop＝'${k}'（坐下不會變成點東西）`,seats.every(q=>q.shop===k));
  for(const [kind,label] of Object.entries(S.items)){ const it=its.find(q=>q.gg2===k&&q.kind===kind);
    check(`5 ${S.name}：「${label}」（gg2 ${kind}）`,!!it&&it.label===label,J(it&&[it.label,it.x,it.z]));
    if(it){ const tp=touchable(it,[sp.x,sp.z]); check(`5 ${S.name}：「${label}」按得到、從進門的地方走得到`,!!tp,J(tp)); } }
  if(k==='daybreak'){ const a=its.find(q=>q.kind==='order'&&q.gg2===k), b=its.find(q=>q.kind==='menu'&&q.gg2===k); check('5 Daybreak：看菜單不和點餐疊在一起（配置 0.15 m：移到吧台中段 (−1.75, −2.1)）',!!a&&!!b&&Math.hypot(a.x-b.x,a.z-b.z)>=0.8&&b.x===-1.75,J([a&&[a.x,a.z],b&&[b.x,b.z]])); }
  check(`6 ${S.name}：店員站的地方（SHOP_IN.clerk ${J(IN.clerk)}）在店裡、在吧台後面（站不住的地方）`,!!IN.clerk&&Math.abs(IN.clerk.x)<L.w/2&&Math.abs(IN.clerk.z)<L.d/2&&!E.canStand(IN.clerk.x,IN.clerk.z,0.3,0));
  const def=CROWD.SHOP_ZONES[k]; check(`6 ${S.name}：路人（CROWD）坐配置的座位（${k==='afar'?'咖啡':'早午餐'}）`,!!def&&def.kind===(k==='afar'?'cafe':'brunch')&&[].concat(...def.units.map(u=>u.seats||[])).length===S.seats,J(def&&[def.kind,def.units.length]));
  if(def){ const wins=CROWD.shopWindows(def,{day:30,hour:12}); check(`6 ${S.name}：路人只在營業時間（${J(wins)}）`,J(wins)===J(k==='afar'?[[11,21]]:[[8,15]])); }
}
// ---- 6 其他接線 ----
{ const Q=PLACES.quickList(), q=k=>Q.find(p=>p[0]===k);
  check('6 快速前往：afar café、Daybreak 的落點＝進門站的地方',['afar','daybreak'].every(k=>q(k)&&SI[k]&&J(q(k)[2])===J({x:SI[k].x,z:SI[k].z,yaw:SI[k].yaw}))&&q('afar')[1]==='afar café'&&q('daybreak')[1]==='Daybreak',J(['afar','daybreak'].map(k=>q(k))));
  check('6 地點名：afar＝afar café、daybreak＝Daybreak',PLACES.names.afar==='afar café'&&PLACES.names.daybreak==='Daybreak');
  /* WZ-ENTRY-XINSHENG-1103（X199）：引路的 LINKS 公館不再連溫州街——舊期待 'wenzhou','afar','daybreak'；新期待 gongguan:['campus','afar','daybreak' */
  check('6 大地圖、引路、路程、城鎮判定：afar、daybreak 都算公館',/\['aoki','青木茶室'\],\['afar','afar café'\],\['daybreak','Daybreak'\]/.test(rd('src/placemap3d.js'))&&/afar:'gongguan',daybreak:'gongguan'/.test(rd('src/placemap3d.js'))&&/afar:\['gongguan'\], daybreak:\['gongguan'\]/.test(rd('src/guide3d.js'))&&/gongguan:\['campus',(?:'tingzhou',)?'afar','daybreak','cvs'/.test(rd('src/guide3d.js'))   /* 2026-11-10 改期望：公館多了往汀州路的連結（TINGZHOU-SHOPS-MOVE-1110），原本查 campus 後面直接是 afar */
    &&/afar:'gongguan',daybreak:'gongguan'/.test(rd('src/classes3d.js'))&&/'lane118','afar','daybreak'[,\]]/.test(rd('src/zrzq3d.js')));
  check('6 story3d.js：兩間的店員照 Z3.SHOP_IN、打烊沒有人',/\[\['afar',53\],\['daybreak',54\]\]\) if\(zoneId===k&&ck\(k\)&&\(typeof PLACES==='undefined'\|\|!PLACES\.isOpen\|\|PLACES\.isOpen\(k,G\.hour,G\.day\)\)\)/.test(rd('src/story3d.js')));
  const h=rd('index.html'), sc=[...h.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]), ix=f=>sc.indexOf(f);
  check('6 index.html：兩個配置檔在 zones3d.js 前面；gg2shops3d.js 在 invites3d、story3d、wzshops3d、eat3d、offbeat_sys3d 之後、bbpack_events.js 前面',LAYS.every(f=>ix(f)>0&&ix(f)<ix('src/zones3d.js'))&&ix('src/gg2shops3d.js')>Math.max(ix('src/invites3d.js'),ix('src/story3d.js'),ix('src/wzshops3d.js'),ix('src/eat3d.js'),ix('src/offbeat_sys3d.js'))&&ix('src/gg2shops3d.js')<ix('src/data/bbpack_events.js'),J(LAYS.map(ix).concat([ix('src/zones3d.js'),ix('src/gg2shops3d.js')])));
  const lic=rd('LICENSES.md'); check('6 LICENSES.md：兩個 GLB 各一行（本作 Blender、誰做的）',['aa_support/afar.glb','aa_support/daybreak.glb'].every(g=>new RegExp('\\| [^\\n]*'+g.replace(/[.\/]/g,'\\$&')+'[^\\n]*本作 Blender[^\\n]*AA 製作').test(lic)));
  const al=JSON.parse(rd('docs/handoff/story_import_allow.json')), ent=(al.files||al.allow||al.entries||Object.values(al).find(Array.isArray)||[]).find(e=>e&&/AA_652/.test(e.path||''));
  check('6 劇情匯入白名單：AA_652（路徑＋來源 commit＋approved＋AA（D109））',!!ent&&ent.status==='approved'&&ent.approvedBy==='AA（D109）'&&/^[0-9a-f]{7,}$/.test(ent.sha||''),J(ent)); }
// ---- 9 窗卡 v5 打烊調暗（LAWWW2 1d4675069：亮窗網格 uv1.x＝店編號 1～8；BB 11-04「打烊的店窗還亮」）----
{ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3)); geo.setAttribute('uv1',new THREE.Float32BufferAttribute([6,0,6,0,6,0],2));
  const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({emissive:0xffffff})); mesh.name='NOSHADOW_xs_fronts_lit_1'; const grp=new THREE.Group(); grp.name='NOSHADOW_xs_fronts_lit'; grp.userData.xsShops='ggtea,ggbook,ggcvs,ggyy,ggbike,ggafar,ggcorner,ggdb'; grp.add(mesh); const root=new THREE.Group(); root.add(grp);
  const mat0=mesh.material; const zone={update:null}; G.zone="gongguan"; G.day=30; G.hour=14; const R=Z3.ggShopLit&&Z3.ggShopLit(root,zone);
  check('9 Z3.ggShopLit：找到亮窗網格、店編號照 extras.xsShops',!!R&&R.mesh===mesh&&R.ids.length===8&&R.ids[5]==='ggafar');
  if(R){ const sh={uniforms:{},vertexShader:'#include <common>\n#include <begin_vertex>',fragmentShader:'#include <common>\n#include <emissivemap_fragment>'}; mesh.material.onBeforeCompile(sh);
    check('9 shader：讀 uv1.x、uniform uShopLit[17] 乘 totalEmissiveRadiance（不多 draw call：同一個網格同一個材質）',!!sh.uniforms.uShopLit&&/vShopIdx=uv1\.x/.test(sh.vertexShader)&&/uniform float uShopLit\[17\]/.test(sh.fragmentShader)&&/totalEmissiveRadiance\*=k/.test(sh.fragmentShader)&&/diffuseColor\.rgb\*=k;/.test(sh.fragmentShader));
    check('9 不複製材質（夜間亮度登記在原本的材質上；CC 11-04 GG_night 複製後 22:00／14:00≈1）、窗卡底色也一起暗（不只自發光）',mesh.material===mat0);
    const L=R.lit; check('9 14:00：afar（6）開、Daybreak（8）開、青木（1）開；轉角唱片（7，12:00～21:00）開；洋洋（4，17:00～01:00）還沒開＝0.03（AA_650 §4）',L[6]===1&&L[8]===1&&L[1]===1&&L[4]===0.03&&L[7]===1,J(L));
    G.hour=22; zone.update(0.016,E); check('9 22:00：afar、Daybreak、青木、轉角唱片打烊＝0.03；日和（3，24 小時）、洋洋（宵夜）亮',L[6]===0.03&&L[8]===0.03&&L[1]===0.03&&L[7]===0.03&&L[3]===1&&L[4]===1,J(L));
    G.hour=14; for(let i=0;i<30;i++) zone.update(0.016,E); check('9 回到 14:00：每 30 幀更新一次 uniform，又亮回來',L[6]===1&&L[8]===1,J(L)); } }
// ---- B 子程序 ----
const rB=cp.spawnSync(process.execPath,[__filename,'B'],{encoding:'utf8',cwd:ROOT,timeout:120000});
process.stdout.write(rB.stdout||''); if(rB.status!==0){ fails+=((rB.stdout||'').match(/^FAIL /mg)||[]).length||1; if(rB.stderr) console.log('B stderr:',rB.stderr.split('\n').slice(0,6).join(' / ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}

function partB(){
const H=require('./pg_harness.js'); const {check,GM,E}=H;
console.warn=()=>{};
for(const f of LAYS.concat(['src/gg2shops3d.js'])){ if(!fs.existsSync(path.join(ROOT,f))){ check('B 檔案 '+f+' 在',false); continue; } let src=rd(f); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof GG2==='undefined'){ check('B GG2 載入',false); return H.done(); }
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const toasts=[]; GM.toast=t=>toasts.push(t); GM.enterN=1;
const fresh=(key,h,zone,fl)=>{ const G=H.fresh(key,h,zone,fl); G.money=5000; toasts.length=0; return G; };
const said=()=>H.said.map(s=>s.t), who=()=>H.said.map(s=>s.who);
const run=async()=>{
  // ---- 7 營業時間 ----
  { const G=fresh('2025-10-15',12,'gongguan'), d=G.day, o=(k,h)=>PLACES.isOpen(k,h,d);
    check('7 afar 每天 11:00～21:00（10:59 關、11:00 開、20:59 開、21:00 關）',!o('afar',10.98)&&o('afar',11)&&o('afar',20.98)&&!o('afar',21));
    check('7 Daybreak 每天 08:00～15:00',!o('daybreak',7.98)&&o('daybreak',8)&&o('daybreak',14.98)&&!o('daybreak',15));
    check('7 一週七天都開（稿上沒寫公休）',[0,1,2,3,4,5,6].every(k=>PLACES.isOpen('afar',12,d+k)&&PLACES.isOpen('daybreak',10,d+k)));
    check('7 颱風天關（typhoonShops）、說明文字',PLACES.typhoonShops.includes('afar')&&PLACES.typhoonShops.includes('daybreak')&&PLACES.hours.afar.text==='每天 11:00–21:00'&&PLACES.hours.daybreak.text==='每天 08:00–15:00'); }
  // ---- 7 關門時按門 ----
  { let G=fresh('2025-10-15',16,'gongguan'); const r=await STORY.interact({exit:{to:'daybreak',spawn:{x:0,z:0,yaw:0}},label:'進入 Daybreak'},GM);
    check('7 Daybreak 15:00 以後按門：木牌那一句、不進去',r===true&&H.has(GG2.L.daybreak.sign)&&!H.entered.length,J(said()));
    G=fresh('2025-10-15',7,'gongguan'); await STORY.interact({exit:{to:'daybreak',spawn:{x:0,z:0,yaw:0}}},GM);
    check('7 Daybreak 開門以前（07:00）：寫開放時間（不是木牌）',!H.has(GG2.L.daybreak.sign)&&toasts.some(t=>/Daybreak/.test(t)&&/08:00/.test(t))&&!H.entered.length,J(toasts));
    G=fresh('2025-10-15',22,'gongguan'); await STORY.interact({exit:{to:'afar',spawn:{x:0,z:0,yaw:0}}},GM);
    check('7 afar 21:00 以後按門：AA_652 打烊以後那一句（89b4367ca：椅子倒扣、「本日營業結束 11:00～21:00」）、不進去',H.has(GG2.L.afar.sign)&&/本日營業結束 11:00～21:00/.test(GG2.L.afar.sign)&&!H.entered.length,J(said()));
    G=fresh('2025-10-15',10,'gongguan'); await STORY.interact({exit:{to:'afar',spawn:{x:0,z:0,yaw:0}}},GM);
    check('7 afar 開門以前（10:00）：寫開放時間、不說打烊那一句',!H.has(GG2.L.afar.sign)&&toasts.some(t=>/afar café/.test(t)&&/11:00/.test(t))&&!H.entered.length,J(toasts));
    const TC=PLACES.typhoonClosed; PLACES.typhoonClosed=(z)=>PLACES.typhoonShops.includes(z);
    try{ for(const [k,h,re] of [['afar',14,/颱風天休息，大家注意安全/],['daybreak',10,/颱風天暫停營業/]]){ fresh('2025-10-15',h,'gongguan'); await STORY.interact({exit:{to:k,spawn:{x:0,z:0,yaw:0}}},GM);
      check(`7 ${k} 颱風假當天按門：AA_652 颱風那一句（89b4367ca）、不進去`,H.has(GG2.L[k].typhoon)&&re.test(GG2.L[k].typhoon)&&!H.entered.length,J(said())); } }
    finally { PLACES.typhoonClosed=TC; } }
  // ---- 7 打烊請你出來 ----
  for(const [k,c] of [['afar',21.1],['daybreak',15.1]]){ fresh('2025-10-15',c,k); const r=await GG2.closeOut(GM);
    check(`7 ${k} 打烊那一刻（${c}）：店員「我們今天要打烊了。」一句（AA_700，不另外出旁白）、回公館`,r==='close'&&J(H.said.map(s=>[s.who,s.t]))===J([['店員','我們今天要打烊了。']])&&H.entered[0]==='gongguan'&&!GG2.L[k].close,J(said()));
    fresh('2025-10-16',k==='afar'?23.5:18,k); const r2=await GG2.closeOut(GM);
    check(`7 ${k} 讀檔回到關門以後：不說話、回公館、寫開放時間`,r2==='out'&&!H.said.length&&H.entered[0]==='gongguan'&&toasts.length===1,J([r2,said(),toasts])); }
  // ---- 8 進門一天一次 ----
  { const G=fresh('2025-10-15',12,'afar'); GM.enterN=5; const due=GG2.doorDue(GM); const r=await GG2.enterLine(GM);
    check('8 afar 一天第一次進來：隨機一句進門旁白',due&&r==='door'&&H.said.length===1&&GG2.L.afar.door.includes(H.said[0].t)&&H.said[0].who===null,J(said()));
    GM.enterN=6; check('8 同一天再進來：不說',!GG2.doorDue(GM));
    G.day++; check('8 同一趟待到隔天（00:00 換日、人還在店裡）：不再說（BB-B 11-07 P3 ③）',!GG2.doorDue(GM));
    GM.enterN=(GM.enterN|0)+1; check('8 隔天再進來：又說',GG2.doorDue(GM));
    G.invites=[{who:'heroine_01',place:'afar',day:G.day,h:12,state:'going'}]; H.said=[]; const r2=await GG2.enterLine(GM);
    check('8 今天約在這裡（一起走過來）：不說',r2==='together'&&!H.said.length);
    fresh('2025-10-15',10,'afar'); GM.enterN=9; check('8 關門的時候：不說進門句（打烊那一段優先）',!GG2.doorDue(GM)); }
  // ---- 8 點餐 ----
  const pickOrder=async(k,item,money,rand)=>{ const G=fresh('2025-10-15',k==='afar'?15:10,k); G.money=money; GG2.rand=()=>rand; H.picks=[item]; const h0=G.hour; const r=await GG2.order(GM,k); return {G,r,h0}; };
  { let {G,r,h0}=await pickOrder('afar','拿鐵',5000,0);
    check('8 afar 點咖啡：店員「內用還是外帶？」→ 選單八樣（價錢照黑板）',H.said[0]&&H.said[0].who==='店員'&&H.said[0].t==='內用還是外帶？'&&J(H.opts[0])===J(GG2.L.afar.menu.map(m=>m[0]+'　'+m[1]+' 元').concat(['不用了'])),J(H.opts[0]));
    check('8 afar 點拿鐵：扣 140、點完一句（店員「好了叫你。……」）、時間 +9 分鐘',r==='拿鐵'&&G.money===4860&&H.said[1].t==='好了叫你。……可以先找位子。'&&Math.abs(G.hour-h0-0.15)<1e-6,J([G.money,said()]));
    ({G,r}=await pickOrder('afar','拿鐵',5000,0.99)); check('8 afar 點拿鐵、骰到最後：杯子寫字那一句（旁白）；「手沖要等五分鐘」不會出現',H.said[1].t===GG2.L.afar.after[2][1]&&H.said[1].who===null&&!H.has('手沖要等五分鐘喔。'),J(said()));
    ({G,r}=await pickOrder('afar','手沖',5000,0.5)); check('8 afar 點手沖：那一句可以出現（手沖要等五分鐘喔。）、扣 170',H.has('手沖要等五分鐘喔。')&&G.money===4830,J(said()));
    ({G,r}=await pickOrder('afar','手沖',100,0)); check('8 afar 錢不夠：店員「……要不要看一下比較便宜的？美式一百一。」、不扣錢、時間不動',r==='short'&&G.money===100&&H.said[1].t===GG2.L.afar.short&&H.said[1].who==='店員',J([G.money,said()]));
    ({G,r}=await pickOrder('afar','不用了',5000,0)); check('8 afar「不用了」：不扣錢',r===null&&G.money===5000);
    let h1; ({G,r,h0:h1}=await pickOrder('daybreak','法式吐司',5000,0.99));
    check('8 Daybreak 點餐：店員「內用的話，點好我們送過去。」→ 四樣；點法式吐司扣 180、可以說「最後兩份」、吃 40 分鐘、吃完旁白',H.said[0].t==='內用的話，點好我們送過去。'&&J(H.opts[0])===J(['日式早餐盤　220 元','厚蛋三明治　160 元','法式吐司　180 元','拿鐵　120 元','不用了'])&&G.money===4820&&H.has('今天的法式吐司是最後兩份喔。')&&Math.abs(G.hour-h1-40/60)<1e-6&&GG2.L.daybreak.eat.includes(H.said[H.said.length-1].t),J([G.money,G.hour-h1,said()]));
    ({G,r}=await pickOrder('daybreak','拿鐵',5000,0.99)); check('8 Daybreak 點拿鐵：「最後兩份」不會出現（只有點法式吐司）',!H.has('今天的法式吐司是最後兩份喔。')&&H.has('大概十五分鐘。……飲料先上。')&&G.money===4880,J(said()));
    ({G,r}=await pickOrder('daybreak','日式早餐盤',150,0)); check('8 Daybreak 錢不夠：店員「……要不要先點一杯拿鐵？」、不扣錢、不吃',r==='short'&&G.money===150&&H.said[1].t===GG2.L.daybreak.short&&H.said.length===2,J(said()));
    check('8 吃過的登記到 eat3d（店名「公館・afar café」「公館・Daybreak」，沒有 EAT 的環境照常）',/addShop\(key,\{shop:'公館・'\+key/.test(rd('src/gg2shops3d.js'))); }
  // ---- 8 看的東西、坐下 ----
  { fresh('2025-10-15',15,'afar'); GG2.rand=Math.random; const seen=new Set(); let rep=false, prev=null; for(let i=0;i<30;i++){ const t=GG2.look('afar','bookshelf'); if(t===prev) rep=true; prev=t; seen.add(t); }
    check('8 afar 看看書架：三句隨機、同一句不連續出',seen.size===3&&!rep&&[...seen].every(t=>GG2.L.afar.look.bookshelf.includes(t)));
    H.said=[]; await GG2.interact(GM,{gg2:'daybreak',kind:'menu'}); check('8 Daybreak 看菜單：黑板那一句',H.said.length===1&&H.said[0].t===GG2.L.daybreak.look.menu[0]);
    const cnt=(k,L)=>{ const c={}; for(const s of L.seats){ const t=GG2.seatKind(k,s)||'none'; c[t]=(c[t]|0)+1; } return c; };
    const ca=cnt('afar',AFAR_LAYOUT), cd=cnt('daybreak',DAYBREAK_LAYOUT);
    check('8 afar 坐下句照位子：窗邊 6、方桌 12、靠牆 4、卡座 2、卡座小圓桌對面的椅子 2（稿上沒有：不說）',J(ca)===J({window:6,middle:12,wall:4,booth:2,none:2}),J(ca));
    check('8 Daybreak 坐下句照位子：窗邊 6、四人桌 8、長桌 5（配置 v2 拿掉一張）、卡座 2、卡座小桌對面的椅子 2（不說）',J(cd)===J({window:6,middle:8,long:5,booth:2,none:2}),J(cd));
    H.G.zone='afar'; H.said=[]; await STORY.onSeat(GM,{x:-0.9,z:3.1,yaw:0}); check('8 afar 在窗邊長桌坐下（STORY.onSeat）：窗邊那一句',H.has(GG2.L.afar.seat.window),J(said()));
    H.G.zone='daybreak'; H.said=[]; await STORY.onSeat(GM,{x:2.05,z:-3.5,yaw:0}); check('8 Daybreak 卡座坐下：卡座那一句',H.has(GG2.L.daybreak.seat.booth),J(said()));
    H.G.zone='cafe'; H.said=[]; await STORY.onSeat(GM,{x:-0.9,z:3.1,yaw:0}); check('8 別的店坐下：不說',!GG2.L.afar.seat.window||!H.has(GG2.L.afar.seat.window)); }
  // ---- 9 約會地點 ----
  { const G=fresh('2025-10-15',10,'campus'), A=INV.place('afar'), D=INV.place('daybreak');
    check('9 約會地點 afar（喝咖啡（AA_652「類型：咖啡、吃飯」）、剛認識就可以、11:00～21:00）、daybreak（吃飯、有點熟以上、早午餐 08:00～14:00 開始）',!!A&&!!D&&A.zone==='afar'&&A.kind==='reason'&&A.minStage==='ACQUAINTANCE'&&J(INV.catsOf(A))===J(['sit','study'])&&D.zone==='daybreak'&&D.kind==='meal'&&D.minStage==='FAMILIAR'&&J(INV.catsOf(D))===J(['meal']),J([A&&A.kind,D&&D.kind]));
    if(D){ const d=G.day; const ok=h=>INV.slotOpen(G,D,d,h);
      check('9 Daybreak 08:00～14:00 開始約得到（14:00 可以、14:30 不行、07:30 不行）',ok(8)&&ok(13)&&ok(14)&&!ok(14.5)&&!ok(7.5),J([8,13,14,14.5,7.5].map(ok)));
      check('9 Daybreak 時間選項：今天 14:00 以後只有明天的（09:00、10:00、11:30、13:00）',(()=>{ G.hour=14.5; const T=INV.timeOptions(G,false,D); G.hour=10; return T.length===4&&T.every(q=>q.day===d+1); })());
      check('9 Daybreak 14:00 以後選它：先說「（Daybreak 下午三點就關了。）」；14:00 以前不說',D.lateNote({hour:14.2})==='（Daybreak 下午三點就關了。）'&&D.lateNote({hour:13.9})===null&&/P\.lateNote\?P\.lateNote\(G\):null; if\(ln\) await GM\.say\(null,ln\)/.test(rd('src/invites3d.js'))); }
    if(A){ const ACC={heroine_01:'好。我帶書去，你不要一直跟我講話。',heroine_02:'afar？好。……窗邊那一排的燈很好看。',heroine_03:'好。我想吃他們的布丁。',heroine_04:'可以。那裡插座很多。',heroine_05:'好。我也剛好要寫東西。',classmate_peishan:'好！我上次經過就想進去了。',kexin:'好啊。我到公館再跟你說。'};
      const bad=Object.keys(ACC).filter(id=>{ const o=INV.personal(G,id,A,G.day+1,15.5,{res:'accept'}); return !(o&&J(o.lines)===J([OE.fwd('invites',id,ACC[id])])); });
      check('9 約去 afar 答應：七位各自那一句',!bad.length,J(bad.map(id=>[id,(INV.personal(G,id,A,G.day+1,15.5,{res:'accept'})||{}).lines])));
      const o=INV.personal(G,'zhe',A,G.day+1,15.5,{res:'accept'}); check('9 約去 afar 答應：沒列的人（阿哲）＝一般那句「好啊。那間的手沖很好喝。」',o&&J(o.lines)===J(['好啊。那間的手沖很好喝。']),J(o&&o.lines));   /* 有名字說的不加外面的「」（TEXT-QUOTE-UNIFY-1108 第三批，GG2.ACC0）*/
      const no=INV.personal(G,'zhe',A,G.day+1,15.5,{res:'decline',why:'rel'}); check('9 不答應：不套答應句',!(no&&no.lines&&['好啊。那間的手沖很好喝。','「好啊。那間的手沖很好喝。」'].includes(no.lines[0]))); }
    if(D){ const ACC={heroine_01:'好。不要遲到。',heroine_02:'好……我想坐窗邊。',heroine_03:'Daybreak？好。我想吃法式吐司。',heroine_04:'Daybreak？……好。我會起來。',heroine_05:'好。那天我空下來。',classmate_peishan:'好啊！那家的卡座好可愛。',kexin:'好啊。我下課直接過去。'};   /* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）*/
      const bad=Object.keys(ACC).filter(id=>{ const o=INV.personal(G,id,D,G.day+1,10,{res:'accept'}); return !(o&&J(o.lines)===J([OE.fwd('invites',id,ACC[id])])); });
      check('9 約去 Daybreak 答應：七位各自那一句',!bad.length,J(bad));
      const o=INV.personal(G,'zhe',D,G.day+1,10,{res:'accept'}); check('9 約去 Daybreak 答應：沒列的人＝一般那句「好啊。早上嗎？我爬得起來。」',o&&J(o.lines)===J(['好啊。早上嗎？我爬得起來。']),J(o&&o.lines)); }
    const SO=INVITE_DATA.seatOpen; check('9 坐下以後的開場句：afar、daybreak 各兩則（byPlace）',SO.byPlace.afar==='afar'&&SO.byPlace.daybreak==='daybreak'&&SO.afar.length===2&&SO.daybreak.length===2);
    if(A){ H.said=[]; GG2.rand=Math.random; const R0=Math.random, PS0=E.player.seat; Math.random=()=>0; E.player.seat={x:-0.9,z:3.1,yaw:0,table:6}; await INV.seatOpenLines(GM,{who:'heroine_01'},{name:'沈以安'},A); Math.random=R0;
      check('9 afar 兩個人坐在窗邊長桌（table 6）：小燈那一則（旁白＋她一句）',J(H.said.map(s=>[s.who,s.t]))===J([[null,'（你們在窗邊長桌坐下。她把桌上的小燈打開，又關掉，又打開。）'],['沈以安','……這個燈好可愛。']]),J(said()));
      H.said=[]; Math.random=()=>0; E.player.seat={x:2.05,z:0.65,yaw:Math.PI/2,table:1}; await INV.seatOpenLines(GM,{who:'heroine_01'},{name:'沈以安'},A); Math.random=R0; E.player.seat=PS0;   /* DATE-SEAT-AFAR-1105 */
      check('9 afar 坐在中間的四人桌（table 1）：不抽小燈那一則（燈在窗邊長桌），是杯墊那一則',J(H.said.map(s=>[s.who,s.t]))===J([[null,'（她把兩杯咖啡的杯墊對齊，一杯推給你。）']]),J(said())); }
    { const kx=INV.kxPlaceOk; check('9 可昕交往中：afar、Daybreak 列得出來（有她自己的答應句；只在她在臺北、約得到的時候照現有規則）',!kx||(kx(G,A)&&kx(G,D))); } }
  // ---- 10 逐字對照 AA_652 ----
  { let doc=null; for(const ref of ['94ab0865e','origin/claude/story-planning','303cded56']){ try{ doc=cp.execFileSync('git',['show',ref+':docs/story_planning/AA_652_afar與Daybreak店內台詞.md'],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); break; }catch(e){} }
    if(!doc&&fs.existsSync(path.join(ROOT,'docs/story_planning/AA_652_afar與Daybreak店內台詞.md'))) doc=rd('docs/story_planning/AA_652_afar與Daybreak店內台詞.md');
    if(!doc){ console.log('SKIP 10 讀不到 AA_652（企劃線）'); }
    else { const out=[]; const T=t=>{ if(typeof t==='string') out.push(t); };
      for(const k of ['afar','daybreak']){ const L=GG2.L[k]; L.door.forEach(T); T(L.ask); T(L.short); L.after.forEach(a=>T(a[1])); (L.eat||[]).forEach(T); Object.values(L.look).forEach(a=>a.forEach(T)); Object.values(L.seat).forEach(T); T(L.sign); T(GG2.ACC0[k]);
        Object.values(INVITE_DATA[k+'Acc']||{}).forEach(T); [].concat(...INVITE_DATA.seatOpen[k]).forEach(T); }
      T(INV.place('daybreak').lateNote({hour:15}));
      const strip=t=>t.replace(/^「|」$/g,''), bad=out.filter(t=>!OE.inDoc('invites',null,t,t=>doc.indexOf(t)>=0||doc.indexOf(strip(t))>=0)&&!require('./canon1112_ok.js').ok(t));   /* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）*/
      check('10 台詞逐字在 AA_652 裡（'+out.length+' 句：進門、點餐、錢不夠、點完、吃完、看、坐下、打烊、木牌、答應、開場句、14:00 以後）',!bad.length&&out.length>=50,J(bad));
      const menu=k=>GG2.L[k].menu.every(([n,p])=>doc.indexOf(n+' '+p)>=0); check('10 選單品項、價錢照稿',menu('afar')&&menu('daybreak')); } }
};
run().then(()=>H.done(),e=>{ check('B 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); H.done(); });
}

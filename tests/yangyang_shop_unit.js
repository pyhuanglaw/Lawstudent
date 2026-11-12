// 洋洋鹹酥雞進得去（YANGYANG-IN-1107；公館 G05；AA_650、AA_724）——不需要瀏覽器（D131）。
//   新區域 yangyang：BB 的 bb_support/yangyang_interior.glb（v1c，LAWWW2 驗收 ART_APPROVED）＋src/data/yangyang_layout.js v3（企劃線 claude/cool-heisenberg-o8kuqx）；
//   台詞 AA_724（企劃線 bf5c3e6c6：打烊照 AA_700 一句；原稿 4bab808dd）、系統 src/gg2shops3d.js（照 afar café、Daybreak 的做法：tests/gg_shops2_1104_unit.js）。
// 第一部分（A）建出遊戲真正的區域（公館＋洋洋室內，zones3d.js 真正的程式），用引擎真正的找路與移動（E.simWalk：30 fps＋低幀率）檢查：
//   1 建得起來、尺寸照配置、正式模型的資產登錄、配置的導航阻擋都擋住、沒有走進去出不來的小孤島（0.1 m 取樣）
//   2 公館店門口「進入 洋洋鹹酥雞」：門＝那一棟中心 −9.4 − 配置的門 x 1.2＝−10.6（騎樓機車讓開的 DOORS 同一個位置）、按得到、從人行道走得到
//   3 進門站的地方站得住、不在出口範圍（＋0.2 m）裡；出口按得到、走得到；出來回公館站得住、不在公館任何出口的範圍裡、就在店門前
//   4 座位：22 張（四人桌 4、兩人桌 3）；玩家坐得到的 20 張每一張都按得到、走得到、坐下前的走近點站得住（四人桌四南側兩張夾在桌子和後牆中間：只給路人）；不能讀書
//   5 點炸物（店內）、看菜單、看炸物櫃、看自助區、看冷飲櫃、看廚房（AA_724 第 5 節的 id：case／menu／self／fridge／kitchen）按得到、走得到；騎樓那一側的點餐這一版不接
//   6 老闆、第二個店員站在櫃台後面（站不住的地方）、路人（CROWD）、快速前往、大地圖、引路、路程、城鎮判定、index.html 載入順序、zone_assets.js、LICENSES.md、劇情匯入白名單
// 第二部分（B，子程序：tests/pg_harness.js 的遊戲資料＋邀約系統＋gg2shops3d.js＋xs_close3d.js）：
//   7 營業時間 17:00～01:00（places.js）、關門時按門（01:00 以後鐵門那一句、還沒開門寫開放時間、颱風那一句）、打烊請你出來（老闆「我們今天要打烊了。」一句、不另外出旁白；之後＝只寫開放時間）
//   8 進門一天一次、點炸物（內用還外帶、可以夾好幾樣、價錢照菜單板、錢不夠拿掉一樣、調味兩題一次點餐只問一次、大辣多一句、不動關係）、等 10 分鐘、內用吃 30 分鐘＋吃完旁白、看的東西、坐下句
//   9 約會地點：吃飯那一類、19:00～23:00、可昕只排到 21:00、芷若有班約不到、七位答應的那一句＋一般那句、partnerBlock 照吃飯、坐下以後的開場句（四人桌那一則只在四人桌）
//   10 台詞逐字對照 AA_724（git show bf5c3e6c6；讀不到就 SKIP）、選單價錢對照 AA_650 第 4 節
// 修改前（開發分支 6e8ff8d83）：沒有 yangyang 區域、門口沒有按鈕、GG2 沒有洋洋、沒有約會地點——第 1～10 節都 FAIL。
// 用法：node tests/yangyang_shop_unit.js
/* 2026-11-11（X324 D 區，AA_784_invites.json）：invites.js 照覆蓋層拿掉刪節號、換句——答應句的期望包 OE.fwd（舊期望＝裡面的字），逐字對稿時「新字的舊字在稿上」也算（OE.inDoc；tests/overlay_expect.js）*/
const OE=require('./overlay_expect.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8'), J=x=>JSON.stringify(x), r2=v=>+(+v).toFixed(2);
const LAY='src/data/yangyang_layout.js', AA724='docs/story_planning/AA_724_洋洋鹹酥雞店內台詞.md', AA650='docs/story_planning/AA_650_公館第二批四間店_分工與驗收.md';
/* 菜單板（AA_650 第 4 節；AA_724 開頭「菜單照 AA_650 第 4 節」）*/
const MENU=[['本店推薦',[['鹹酥雞',70],['三角骨',65],['魷魚',80],['雞皮',55],['甜不辣',45]]],['炸物',[['雞排',85],['雞軟骨',60],['花枝丸',50],['薯條',45],['地瓜',45]]],
  ['滷味',[['豆干',25],['米血',25],['百頁豆腐',25],['海帶',20],['滷蛋',15]]],['蔬菜小點',[['四季豆',35],['杏鮑菇',45],['花椰菜',40],['玉米筍',40],['高麗菜',35]]],['冷飲櫃',[['紅茶',25],['可樂',30]]]];
const gitShow=(refs,f)=>{ for(const ref of refs){ try{ return cp.execFileSync('git',['show',ref+':'+f],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){} } return fs.existsSync(path.join(ROOT,f))?rd(f):null; };
if(process.argv[2]==='B') partB(); else partA();

function partA(){
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=rd('tests/nav_buildings_unit.js');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/data/lane118_props.js',
  'src/data/xinsheng_layout.js','src/data/bike_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js','src/data/afar_layout.js','src/data/daybreak_layout.js',LAY,'src/xinsheng3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/bike3d.js','src/bikeshop3d.js','src/crowd3d.js','src/data/pool_story.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:(/xinsheng3d|mokuyobi3d/.test(f)?3:4)));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===3)).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=rd(f); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
ASSETS.loadOne=()=>Promise.reject(new Error('no GLB in node'));
const G={zone:'gongguan',day:30,hour:19,flags:{},money:5000,weather:'clear'}; global.GAME={G};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius(); return {z,its:E.interactables.slice()}; }
const walk=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{dt}); if(!r.ok) return Object.assign({dt:r2(dt)},r); } return {ok:true}; };
function touchable(it,from){ const r=(it.radius||1.5)-0.05, P=E.player, c=[];
  for(let dz=-r;dz<=r+1e-6;dz+=0.2) for(let dx=-r;dx<=r+1e-6;dx+=0.2){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, z=it.z+dz; if(E.canStand(x,z,0.32,0)) c.push([d,x,z]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [,x,z] of c){ P.obj.position.set(x,0,z); if(E.nearestInteractable()!==it) continue; if(from&&!walk(from,[x,z]).ok) continue; return [r2(x),r2(z)]; } return null; }
/* 小孤島（0.1 m 取樣、半徑 0.32）：站得住、但從進門的地方連不到的點（v9.3 #31：滑進去出不來）*/
function islands(sp,x0,x1,z0,z1){ const S=0.1, nx=Math.round((x1-x0)/S)+1, nz=Math.round((z1-z0)/S)+1, ok=new Uint8Array(nx*nz), seen=new Uint8Array(nx*nz); let tot=0;
  for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ if(E.canStand(x0+i*S,z0+j*S,0.32,0)){ ok[j*nx+i]=1; tot++; } }
  const si=Math.round((sp[0]-x0)/S), sj=Math.round((sp[1]-z0)/S), st=[sj*nx+si]; if(!ok[st[0]]) return {tot,lost:tot,pts:[]}; seen[st[0]]=1; let n=0;
  while(st.length){ const c=st.pop(); n++; const i=c%nx, j=(c-i)/nx; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a=i+di, b=j+dj; if(a<0||b<0||a>=nx||b>=nz) continue; const q=b*nx+a; if(ok[q]&&!seen[q]){ seen[q]=1; st.push(q); } } }
  const pts=[]; for(let q=0;q<nx*nz;q++) if(ok[q]&&!seen[q]) pts.push([r2(x0+(q%nx)*S),r2(z0+Math.floor(q/nx)*S)]); return {tot,lost:tot-n,pts:pts.slice(0,8)}; }
const inExit=(its,s,margin)=>its.filter(q=>q.exit&&!q.hidden&&Math.hypot(q.x-s.x,q.z-s.z)<(q.radius||1.8)+margin).map(q=>q.label+' '+Math.hypot(q.x-s.x,q.z-s.z).toFixed(2)+'m');
const L=typeof YANGYANG_LAYOUT!=='undefined'&&YANGYANG_LAYOUT.shop?YANGYANG_LAYOUT.shop:null, SI=Z3.SHOP_IN, IN=SI&&SI.yangyang;
check('0 配置 src/data/yangyang_layout.js 有載入（v3，BB 的原檔）',!!L&&YANGYANG_LAYOUT.version===3&&L.v===3&&L.name==='洋洋鹹酥雞',J(L&&[YANGYANG_LAYOUT.version,L.name]));
// ---- 2 公館店門口 ----
const GG=loadZone('gongguan'); const gIts=GG.its, gNav=GG.z.nav;
{ let x=-68; const W=[10,8,12,10,8,8,9,9,8,9,9,10,8,9,9]; const cx=[]; W.forEach((w,i)=>{ const X1=x+w+(i<8&&i<W.length-1?1.2:0); cx.push((x+X1)/2); x=X1; });
  check('2 店面街第 5 棟（G05）的中心＝−9.4、寬 9.2（＝配置的店寬）',Math.abs(cx[5]+9.4)<1e-6&&!!L&&L.w===9.2,J(cx[5])); }
const door=gIts.find(q=>q.exit&&q.exit.to==='yangyang');
check('2 洋洋鹹酥雞：公館店門口「進入 洋洋鹹酥雞」進 yangyang',!!door&&door.label==='進入 洋洋鹹酥雞',J(door&&[door.label,door.x,door.z]));
if(door){
  check('2 門口互動點 (−10.6, 21)＝那一棟中心 −9.4 − 配置的門 x 1.2（LAWWW2：門的中心 x 1.2；騎樓機車讓開的 DOORS 同一個位置）',Math.abs(door.x+10.6)<0.011&&door.z===21&&!!L&&L.front.door.x===1.2&&/DOORS=\[[^\]]*-10\.6/.test(rd('src/zones3d.js')),J([door.x,door.z]));
  check('2 進門站的地方＝SHOP_IN.yangyang',!!IN&&J(door.exit.spawn)===J({x:IN.x,z:IN.z,yaw:IN.yaw}),J(door.exit.spawn));
  E.zone=GG.z; E.nav=gNav; E.interactables=gIts; const tp=touchable(door);
  check('2 店門口按得到（範圍裡站得住、最近的互動就是它）',!!tp,J(tp));
  if(tp){ const w=walk([door.x,15],tp); check('2 從羅斯福路人行道 (−10.6, 15) 走到店門口',w.ok,J(w).slice(0,200)); }
  const near=gIts.filter(q=>q!==door&&!q.hidden&&Math.hypot(q.x-door.x,q.z-door.z)<2.6).map(q=>q.label);
  check('2 門口附近（2.6 m）沒有別的按鈕疊著（騎樓那一側的「點炸物（騎樓）」這一版不接）',!near.length,J(near)); }
/* 轉角唱片（G12）11-07 起也進得去（CORNER-IN-1107）：tests/corner_shop_unit.js */
// ---- 1、3、4、5 室內 ----
let R=null; if(!L||!Z3.ZONES.yangyang) check('1 區域 yangyang 存在（配置 yangyang_layout.js 有載入）',false);
else { try{ R=loadZone('yangyang'); }catch(e){ check('1 區域建得起來',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } }
if(R){ const z=R.z, its=R.its;
  check(`1 區域建得起來、尺寸照配置 ${L.w}×${L.d}×${L.h}、名字「洋洋鹹酥雞」、SHOP_IN.gg`,z.bounds.w===L.w&&z.bounds.d===L.d&&Z3.ZONES.yangyang.name==='洋洋鹹酥雞'&&z.gg==='yangyang'&&IN.gg===true,J(z.bounds));
  const man=ASSETS.manifest['bldg.yangyang_interior']; check('1 正式模型登錄 bldg.yangyang_interior＝配置的 glb（檔案在、building、v1c＋LAWWW2-B 11-07 光照＋窗景卡 3,690,084 B）',!!man&&man.url===L.glb&&fs.existsSync(path.join(ROOT,L.glb))&&man.type==='building'&&fs.statSync(path.join(ROOT,L.glb)).size===3690084,J(man&&man.url));
  const onSeat=b=>L.seats.some(s=>Math.abs(b[0]-s.x)<0.05&&Math.abs(b[1]-s.z)<0.05), BL=L.blocks.filter(b=>!onSeat(b)), blk=BL.filter(b=>E.canStand(b[0],b[1],0.05,0));
  check(`1 配置的導航阻擋 ${BL.length} 個都擋住（中心站不住；椅子本身不擋）`,BL.length===13&&!blk.length,BL.length+' '+J(blk));
  const sp=z.spawn, isl=islands([sp.x,sp.z],-L.w/2,L.w/2,-L.d/2,L.d/2);
  check('1 沒有走進去出不來的小孤島（0.1 m 取樣、半徑 0.32）',isl.lost===0&&isl.tot>2000,'站得住 '+isl.tot+' 點、連不到 '+isl.lost+' 點 '+J(isl.pts));
  const ex=its.find(q=>q.exit&&q.exit.to==='gongguan');
  check(`3 進門站的地方 (${sp.x}, ${sp.z}) 站得住（半徑 0.32）＝SHOP_IN`,E.canStand(sp.x,sp.z,0.32,0)&&sp.x===IN.x&&sp.z===IN.z&&sp.x===L.front.door.x,J(sp));
  const nx=inExit(its,sp,0.2); check('3 進門站的地方不在任何出口的範圍（＋0.2 m）裡',!nx.length,J(nx));
  check(`3 出口「${L.exit.label}」在門內（x ${L.exit.at.x}）`,!!ex&&ex.label===L.exit.label&&ex.x===L.exit.at.x&&ex.z<L.d/2,J(ex&&[ex.label,ex.x,ex.z,ex.radius]));
  if(ex){ const tp=touchable(ex,[sp.x,sp.z]); check('3 出口按得到、從進門的地方走得到',!!tp,J(tp));
    const out=ex.exit.spawn; check(`3 出來回公館 (${out.x}, ${out.z}) 站得住、不在公館任何出口的範圍（＋0.2 m）裡、就在店門前`,gNav.clear(out.x,out.z,0.3)&&!inExit(gIts,out,0.2).length&&Math.abs(out.x+10.6)<0.02&&ex.exit.to==='gongguan',J([out,inExit(gIts,out,0.2)])); }
  const seats=its.filter(q=>q.seat), npc=(z.seats||[]).filter(q=>q.npcOnly).map(q=>[q.x,q.z]);
  check('4 座位 21 張（照配置：四人桌 4、兩人桌 3；(0.92, 2.3) 11-12 BB 裁定拿掉）；四人桌四南側兩張（−3.18／−2.62, −4.9）只給路人坐、不出「坐下」',z.seats.length===21&&L.seats.length===21&&seats.length===19&&J(npc)===J([[-3.18,-4.9],[-2.62,-4.9]]),seats.length+'／'+z.seats.length+' '+J(npc));
  const bad=[]; for(const it of seats){ if(!touchable(it,[sp.x,sp.z])) bad.push([it.seat.x,it.seat.z]); }
  check('4 玩家坐得到的 19 張每一張都按得到、從進門的地方走得到',!bad.length,J(bad));
  /* 坐下前走到的點（game3d.js seatApproach 的八個候選：前 0.5、後 0.6、兩側 0.55、後 0.7／0.75、前 0.8、後 0.9）：至少一個站得住（半徑 0.3）、在「坐下」的範圍裡、從進門的地方找得到路
     （DAYBREAK-SEAT-AP-1105：八個都站不住＝走到站不住的備用點）*/
  const noAp=[]; for(const it of seats){ const s=it.seat, fx=Math.sin(s.yaw||0), fz=Math.cos(s.yaw||0), reach=(it.radius||1.8)-0.05;
    const ok=[[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]].some(([dx,dz])=>{ const x=s.x+dx, zz=s.z+dz;
      if(!E.canStand(x,zz,0.3,0)||Math.hypot(x-it.x,zz-it.z)>reach) return false; const p=E.pathTo(sp.x,sp.z,0,x,zz,0); return !!p&&p.length>0&&Math.hypot(p[p.length-1][0]-x,p[p.length-1][1]-zz)<=0.6; });
    if(!ok) noAp.push([s.x,s.z]); }
  check('4 每一張的走近點（seatApproach 的八個候選）至少一個站得住、在範圍裡、找得到路',!noAp.length,J(noAp));
  check('4 座位的 shop＝yangyang、字「坐下吃」（配置）、不能讀書（配置沒有 canStudy）',seats.every(q=>q.shop==='yangyang'&&q.label==='坐下吃'&&!q.study));
  const WANT={order:'點炸物（店內）',menu:'看菜單',case:'看炸物櫃',self:'自助區（餐具、醬料、水）',fridge:'看冷飲櫃',kitchen:'看廚房'};
  const gi=its.filter(q=>q.gg2==='yangyang'); check('5 店裡的按鈕剛好六個：點炸物＋AA_724 第 5 節的 case／menu／self／fridge／kitchen（騎樓 order_street、配置的 drink／selfserve 換成稿上的 id）',J(gi.map(q=>q.kind).sort())===J(Object.keys(WANT).sort()),J(gi.map(q=>q.kind)));
  for(const [kind,label] of Object.entries(WANT)){ const it=gi.find(q=>q.kind===kind);
    check(`5「${label}」（gg2 ${kind}）`,!!it&&it.label===label,J(it&&[it.label,it.x,it.z]));
    if(it){ const tp=touchable(it,[sp.x,sp.z]); check(`5「${label}」按得到、從進門的地方走得到`,!!tp,J(tp)); } }
  const lay=k=>L.interact.find(q=>q.kind===k), ord=gi.find(q=>q.kind==='order'), fr=gi.find(q=>q.kind==='fridge'), sf=gi.find(q=>q.kind==='self');
  check('5 點炸物、看菜單、冷飲櫃、自助區的位置照配置（店內炸物櫃前、冷飲櫃前、右牆自助區）',!!ord&&ord.x===lay('order').x&&ord.z===lay('order').z&&!!fr&&fr.x===lay('drink').x&&fr.z===lay('drink').z&&!!sf&&sf.x===lay('selfserve').x&&sf.z===lay('selfserve').z);
  for(const [k,c] of [['clerk',IN.clerk],['clerk2',IN.clerk2]]) check(`6 ${k==='clerk'?'老闆':'第二個店員'}站的地方（SHOP_IN.${k} ${J(c)}＝配置）在店裡、櫃台後面（站不住）`,!!c&&c.x===L[k].x&&c.z===L[k].z&&Math.abs(c.x)<L.w/2&&Math.abs(c.z)<L.d/2&&!E.canStand(c.x,c.z,0.3,0));
  const def=CROWD.SHOP_ZONES.yangyang; check('6 路人（CROWD）坐配置的 21 個座位（吃飯的店；時段照宵夜 snack）',!!def&&def.kind==='meal'&&[].concat(...def.units.map(u=>u.seats||[])).length===21&&def.units.every(u=>u.sk==='snack')&&!!CROWD.SHOP_KIND.snack,J(def&&[def.kind,def.units.length]));
  if(def){ const wins=CROWD.shopWindows(def,{day:30,hour:19}); check('6 路人只在營業時間（17:00 起；跨午夜那一段只排到 24:00）',J(wins)===J([[17,24]]),J(wins)); }
}
// ---- 6 其他接線 ----
{ const Q=PLACES.quickList(), q=Q.find(p=>p[0]==='yangyang');
  check('6 快速前往：洋洋鹹酥雞的落點＝進門站的地方',!!q&&!!IN&&q[1]==='洋洋鹹酥雞'&&J(q[2])===J({x:IN.x,z:IN.z,yaw:IN.yaw}),J(q));
  check('6 地點名：yangyang＝洋洋鹹酥雞',PLACES.names.yangyang==='洋洋鹹酥雞');
  check('6 大地圖、引路、路程、城鎮判定：yangyang 都算公館',/\['daybreak','Daybreak'\],\['yangyang','洋洋鹹酥雞'\]/.test(rd('src/placemap3d.js'))&&/yangyang:'gongguan'/.test(rd('src/placemap3d.js'))&&/'noodle','yangyang'[,\]]/.test(rd('src/guide3d.js'))&&/yangyang:\['gongguan'\]/.test(rd('src/guide3d.js'))&&/yangyang:'gongguan'/.test(rd('src/classes3d.js'))&&/'afar','daybreak','yangyang'[,\]]/.test(rd('src/zrzq3d.js')));
  check('6 story3d.js：老闆、第二個店員照 Z3.SHOP_IN、打烊沒有人',/zoneId==='yangyang'&&ck\('yangyang'\)&&\(typeof PLACES==='undefined'\|\|!PLACES\.isOpen\|\|PLACES\.isOpen\('yangyang',G\.hour,G\.day\)\)/.test(rd('src/story3d.js'))&&/clerk\(c2\.x,c2\.z,c2\.yaw,58\)/.test(rd('src/story3d.js')));
  const h=rd('index.html'), sc=[...h.matchAll(/<script src="([^"?]+)(\?v=[^"]*)?"/g)].map(m=>[m[1],m[2]]), ix=f=>sc.findIndex(s=>s[0]===f), v=f=>(sc.find(s=>s[0]===f)||[])[1];
  check('6 index.html：yangyang_layout.js 在 zones3d.js、crowd3d.js、gg2shops3d.js、places.js 用到以前載入（和旁邊一樣 ?v=）',ix(LAY)>0&&ix(LAY)<ix('src/zones3d.js')&&ix(LAY)<ix('src/crowd3d.js')&&ix(LAY)<ix('src/gg2shops3d.js')&&v(LAY)===v('src/data/daybreak_layout.js'),J([ix(LAY),ix('src/zones3d.js'),v(LAY)]));
  const za=rd('src/data/zone_assets.js'); check('6 zone_assets.js：yangyang 用 bldg.yangyang_interior（node tools/gen_zone_assets.js --check）',/"yangyang":\["bldg\.yangyang_interior"\]/.test(za));
  const lic=rd('LICENSES.md'); check('6 LICENSES.md：GLB 一行（本作 Blender、BB 製作、LAWWW2 驗收）',/\| [^\n]*bb_support\/yangyang_interior\.glb[^\n]*本作 Blender[^\n]*BB[^\n]*LAWWW2 驗收/.test(lic));
  const al=JSON.parse(rd('docs/handoff/story_import_allow.json')), ent=(al.files||[]).find(e=>e&&e.path===AA724);
  check('6 劇情匯入白名單：AA_724（路徑＋來源 commit bf5c3e6c6＋approved＋AA（D109））',!!ent&&ent.status==='approved'&&ent.approvedBy==='AA（D109）'&&ent.sha==='bf5c3e6c6',J(ent)); }
// ---- B 子程序 ----
const rB=cp.spawnSync(process.execPath,[__filename,'B'],{encoding:'utf8',cwd:ROOT,timeout:120000});
process.stdout.write(rB.stdout||''); if(rB.status!==0){ fails+=((rB.stdout||'').match(/^FAIL /mg)||[]).length||1; if(rB.stderr) console.log('B stderr:',rB.stderr.split('\n').slice(0,6).join(' / ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}

function partB(){
const H=require('./pg_harness.js'); const {check,GM,E}=H;
console.warn=()=>{};
for(const f of [LAY,'src/gg2shops3d.js','src/xs_close3d.js']){ if(!fs.existsSync(path.join(ROOT,f))){ check('B 檔案 '+f+' 在',false); continue; } let src=rd(f); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof GG2==='undefined'||!GG2.L||!GG2.L.yangyang||!(GG2.ZONES||[]).includes('yangyang')){ check('B GG2 載入、有洋洋鹹酥雞（GG2.L.yangyang、ZONES）',false); return H.done(); }
let relN=0; GM.rel=()=>{ relN++; };
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const toasts=[]; GM.toast=t=>toasts.push(t); GM.enterN=1;
const Y=GG2.L.yangyang, BOSS='老闆';
const fresh=(key,h,zone,fl)=>{ const G=H.fresh(key,h,zone,fl); G.money=5000; toasts.length=0; relN=0; return G; };
const said=()=>H.said.map(s=>s.t), pairs=()=>H.said.map(s=>[s.who,s.t]), cnt=t=>H.said.filter(s=>s.t===t).length;
const run=async()=>{
  // ---- 7 營業時間 ----
  { const G=fresh('2025-10-15',12,'gongguan'), d=G.day, o=(h,dd)=>PLACES.isOpen('yangyang',h,dd==null?d:dd);
    check('7 每天 17:00～01:00（16:59 關、17:00 開、23:59 開、00:30（G.hour 24.5）開、01:00（25）關、06:00 關）',!o(16.98)&&o(17)&&o(23.98)&&o(24.5)&&o(0.5)&&!o(25)&&!o(1)&&!o(6),J([16.98,17,23.98,24.5,0.5,25,1,6].map(h=>o(h))));
    check('7 一週七天都開（稿上沒寫公休）',[0,1,2,3,4,5,6].every(k=>o(20,d+k)));
    check('7 颱風天關（typhoonShops）、說明文字「每天 17:00–01:00」',PLACES.typhoonShops.includes('yangyang')&&PLACES.hours.yangyang.text==='每天 17:00–01:00');
    const ct=PLACES.closedText('yangyang',15,d); check('7 關門的說明（15:00）：店家寫「開門」、今天 17:00',/^洋洋鹹酥雞/.test(ct)&&/17:00/.test(ct)&&/下次開門：今天 17:00/.test(ct),ct); }
  // ---- 7 關門時按門 ----
  { let G=fresh('2025-10-15',15,'gongguan'); let r=await STORY.interact({exit:{to:'yangyang',spawn:{x:0,z:0,yaw:0}},label:'進入 洋洋鹹酥雞'},GM);
    check('7 還沒開門（15:00）按門：寫開放時間、不進去、不說鐵門那一句',r===true&&!H.has(Y.sign)&&toasts.some(t=>/洋洋鹹酥雞/.test(t)&&/17:00/.test(t))&&!H.entered.length,J([said(),toasts]));
    G=fresh('2025-10-15',25.3,'gongguan'); r=await STORY.interact({exit:{to:'yangyang',spawn:{x:0,z:0,yaw:0}}},GM);
    check('7 打烊以後（01:18）按門：AA_724 鐵門那一句（「17:00～01:00」）、不進去',r===true&&J(pairs())===J([[null,Y.sign]])&&/17:00～01:00/.test(Y.sign)&&!H.entered.length,J(said()));
    G=fresh('2025-10-15',3,'gongguan'); await STORY.interact({exit:{to:'yangyang',spawn:{x:0,z:0,yaw:0}}},GM);
    check('7 清晨 03:00 按門：也是鐵門那一句',H.has(Y.sign)&&!H.entered.length,J(said()));
    const TC=PLACES.typhoonClosed; PLACES.typhoonClosed=(z)=>PLACES.typhoonShops.includes(z);
    try{ fresh('2025-10-15',20,'gongguan'); await STORY.interact({exit:{to:'yangyang',spawn:{x:0,z:0,yaw:0}}},GM);
      check('7 颱風假當天按門：AA_724 颱風那一句、不進去',H.has(Y.typhoon)&&/颱風天休息/.test(Y.typhoon)&&!H.entered.length,J(said())); }
    finally { PLACES.typhoonClosed=TC; }
    G=fresh('2025-10-15',20,'gongguan'); const before=H.entered.length; const ret=await STORY.interact({exit:{to:'yangyang',spawn:{x:0,z:0,yaw:0}}},GM);
    check('7 營業中（20:00）按門：不擋（照一般的進門）',!H.has(Y.sign)&&!toasts.some(t=>/洋洋鹹酥雞/.test(t)),J([ret,said(),toasts,H.entered.length-before])); }
  // ---- 7 打烊請你出來 ----
  { XSCLOSE._resetSeen(); fresh('2025-10-15',25.1,'yangyang'); GM.enterN=20; const r=await GG2.closeOut(GM);
    check('7 打烊那一刻（01:06）：老闆「我們今天要打烊了。」一句（AA_724 第 7 節 bf5c3e6c6＝AA_700）、回公館店門口、不另外出旁白、不寫字',r==='close'&&J(pairs())===J([[BOSS,'我們今天要打烊了。']])&&XSCLOSE.LINE==='我們今天要打烊了。'&&H.entered[0]==='gongguan'&&!toasts.length&&!Y.close&&!Y.closeNarr,J([r,pairs(),H.entered,toasts]));
    XSCLOSE._resetSeen(); fresh('2025-10-15',24.6,'yangyang'); GM.enterN=21; const seen=XSCLOSE.markSeen(GM); H.G.hour=26.4; const r2=await GG2.closeOut(GM);
    check('7 這一趟進來的時候開著（00:36）、坐著讀到 02:24 才輪到：一樣老闆那一句（AA_700 的規則，XSCLOSE.gen）',seen===true&&r2==='close'&&J(pairs())===J([[BOSS,'我們今天要打烊了。']]),J([seen,r2,said()]));
    XSCLOSE._resetSeen(); fresh('2025-10-16',10,'yangyang'); GM.enterN=22; const r3=await GG2.closeOut(GM);
    check('7 讀檔回到關門以後（10:00）：不說話、回公館、寫開放時間',r3==='out'&&!H.said.length&&H.entered[0]==='gongguan'&&toasts.length===1&&/17:00/.test(toasts[0]),J([r3,said(),toasts]));
    check('7 XSCLOSE：洋洋在表上（自己的打烊系統、說話的人「老闆」）',XSCLOSE.PLACE_OF.yangyang==='yangyang'&&XSCLOSE.whoOf('yangyang')==='老闆'); }
  // ---- 8 進門一天一次 ----
  { const G=fresh('2025-10-15',19,'yangyang'); GM.enterN=5; const due=GG2.doorDue(GM); const r=await GG2.enterLine(GM);
    check('8 一天第一次進來：隨機一句進門旁白（AA_724 第 1 節三句）',due&&r==='door'&&H.said.length===1&&Y.door.includes(H.said[0].t)&&H.said[0].who===null&&Y.door.length===3,J(said()));
    GM.enterN=6; check('8 同一天再進來：不說',!GG2.doorDue(GM));
    G.day++; check('8 同一趟待到隔天（00:00 換日、人還在店裡）：不再說（BB-B 11-07 P3 ③）',!GG2.doorDue(GM));
    GM.enterN=7; check('8 隔天再進來：又說',GG2.doorDue(GM));
    G.invites=[{who:'heroine_04',place:'yangyang',day:G.day,h:20,state:'going'}]; H.said=[]; const r2=await GG2.enterLine(GM);
    check('8 今天約在這裡（一起走過來）：不說',r2==='together'&&!H.said.length);
    fresh('2025-10-15',15,'yangyang'); GM.enterN=9; check('8 關門的時候：不說進門句（打烊那一段優先）',!GG2.doorDue(GM)); }
  // ---- 8 點炸物 ----
  const order=async(picks,money,rand,h)=>{ const G=fresh('2025-10-15',h||20,'yangyang'); G.money=money; GG2.rand=()=>rand; H.picks=picks.slice(); const h0=G.hour, rel0=J(H.G.rel), fl0=J(H.G.flags); const r=await GG2.order(GM,'yangyang'); return {G,r,h0,rel0,fl0}; };
  { let {G,r,h0,rel0,fl0}=await order(['內用','鹹酥雞','雞皮','夾好了','都要','大辣'],5000,0);
    check('8 點炸物：老闆「夾好給我。……內用還外帶？」→ 內用／外帶',H.said[0]&&H.said[0].who===BOSS&&H.said[0].t==='夾好給我。……內用還外帶？'&&J([...H.opts[0]])===J(['內用','外帶','不用了']),J([H.said[0],[...(H.opts[0]||[])]]));
    check('8 選單＝菜單板五類（本店推薦、炸物、滷味、蔬菜小點、冷飲櫃）、一類裡每一樣寫價錢',J([...H.opts[1]])===J(MENU.map(c=>c[0]+'…').concat(['不用了']))&&J([...H.opts[2]])===J(MENU[0][1].map(m=>m[0]+'　'+m[1]+' 元').concat(['返回'])),J([[...H.opts[1]],[...H.opts[2]]]));
    check('8 夾了兩樣以後：選單多「夾好了」（寫加起來的錢）',H.opts.some(o=>o.includes('夾好了')),J(H.opts.map(o=>[...o])));
    check('8 鹹酥雞＋雞皮＝125 元（加起來算錢）、回傳點的東西',r==='鹹酥雞、雞皮'&&G.money===5000-125,J([r,G.money]));
    check('8 調味兩題（九層塔、蒜：都要／只要九層塔／都不要；辣：不辣／小辣／大辣）、各問一次',cnt('九層塔、蒜要不要？')===1&&cnt('辣嗎？')===1&&H.opts.some(o=>J([...o])===J(['都要','只要九層塔','都不要']))&&H.opts.some(o=>J([...o])===J(['不辣','小辣','大辣']))&&H.said.filter(s=>/要不要？|辣嗎？/.test(s.t)).every(s=>s.who===BOSS),J(said()));
    check('8 選大辣：老闆多一句「大辣喔？……好，你說的。」',cnt('大辣喔？……好，你說的。')===1&&H.said.find(s=>s.t==='大辣喔？……好，你說的。').who===BOSS);
    check('8 等炸好一句（骰到第一句：老闆「十分鐘。號碼牌拿好。」）、內用：吃 30 分鐘＋吃完的旁白（有鹹酥雞、加了九層塔：「紙袋底下……鹹酥雞」）＝時間共 +40 分鐘',H.has('十分鐘。號碼牌拿好。')&&H.said.find(s=>s.t==='十分鐘。號碼牌拿好。').who===BOSS&&H.said[H.said.length-1].t===Y.eat[0][0]&&H.said[H.said.length-1].who===null&&Math.abs(G.hour-h0-40/60)<1e-6,J([G.hour-h0,said()]));
    check('8 調味只是口味：記在這一次的點餐（GG2.last），不動關係（GM.rel 沒有呼叫、G.rel、旗標都沒變）',!!GG2.last&&GG2.last.basil==='都要'&&GG2.last.spicy==='大辣'&&GG2.last.dine===true&&J(GG2.last.items)===J(['鹹酥雞','雞皮'])&&relN===0&&J(H.G.rel)===rel0&&J(H.G.flags)===fl0,J([GG2.last,relN]));
    ({G,r,h0}=await order(['外帶','雞排','夾好了','只要九層塔','不辣'],5000,0.99));
    check('8 外帶：等 10 分鐘就好（不坐下吃、沒有吃完的旁白）；不辣＝沒有多一句；骰到最後＝「隔壁桌的人……」那一句',r==='雞排'&&G.money===4915&&Math.abs(G.hour-h0-10/60)<1e-6&&!Y.eat.some(e=>H.has(e[0]))&&!H.has('大辣喔？……好，你說的。')&&H.has(Y.wait[2][1])&&GG2.last.dine===false,J([G.hour-h0,said()]));
    ({G,r,h0}=await order(['內用','鹹酥雞','夾好了','都不要','小辣'],5000,0));
    check('8 九層塔、蒜都不要：吃完不說「剩一點胡椒粉和九層塔」那一句（換「手指上都是油」）',!H.has(Y.eat[0][0])&&H.has(Y.eat[1][0]),J(said()));
    ({G,r,h0}=await order(['內用','滷蛋','夾好了','都要','不辣'],5000,0));
    check('8 沒點鹹酥雞：吃完不說「最後一塊鹹酥雞」那一句',!H.has(Y.eat[0][0])&&H.has(Y.eat[1][0])&&G.money===4985,J(said()));
    ({G,r,h0}=await order(['內用','紅茶','可樂','夾好了'],5000,0));
    check('8 只點冷飲（紅茶＋可樂 55 元）：不問調味、不用等、不坐下吃',r==='紅茶、可樂'&&G.money===4945&&cnt('九層塔、蒜要不要？')===0&&cnt('辣嗎？')===0&&!Y.wait.some(w=>H.has(w[1]))&&Math.abs(G.hour-h0)<1e-6,J([r,G.money,said()]));
    ({G,r}=await order(['不用了'],5000,0)); check('8 內用外帶選「不用了」：不扣錢、不出選單',r===null&&G.money===5000&&H.opts.length===1);
    ({G,r}=await order(['內用','鹹酥雞','不用了'],5000,0)); check('8 夾了一樣又「不用了」：不扣錢、不問調味',r===null&&G.money===5000&&cnt('九層塔、蒜要不要？')===0);
    // 錢不夠
    ({G,r,h0}=await order(['外帶','雞排','魷魚','夾好了','雞排','夾好了','都要','不辣'],100,0));
    check('8 錢不夠（100 元夾了雞排＋魷魚 165 元）：老闆「這樣不夠喔。……拿掉一樣？」→ 拿掉雞排 → 魷魚 80 元結帳；調味還是只問一次',H.said.some(s=>s.who===BOSS&&s.t==='這樣不夠喔。……拿掉一樣？')&&r==='魷魚'&&G.money===20&&cnt('九層塔、蒜要不要？')===1&&cnt('辣嗎？')===1&&H.opts.some(o=>J([...o])===J(['雞排　85 元','魷魚　80 元','不用了'])),J([r,G.money,said()]));
    ({G,r}=await order(['外帶','雞排','夾好了','不用了'],50,0));
    check('8 錢不夠又選「不用了」：不扣錢、不問調味、時間不動',r==='short'&&G.money===50&&cnt('九層塔、蒜要不要？')===0&&cnt('這樣不夠喔。……拿掉一樣？')===1);
    ({G,r}=await order(['內用','鹹酥雞','鹹酥雞','夾好了','都要','不辣'],5000,0)); check('8 同一樣可以夾兩份（鹹酥雞 ×2＝140 元）',G.money===4860&&r==='鹹酥雞、鹹酥雞',J([r,G.money]));
    check('8 錢不夠的品項不灰掉（結帳時老闆才說那一句；BB-B 11-07 P3 ②）',!/dim:\(G\.money\|0\)<tot\(\)\+m\[1\]/.test(rd('src/gg2shops3d.js')));
    { const W0=globalThis.WZS, P=GM.E&&GM.E.player; globalThis.WZS={_seated:async(GM2,fn)=>{ const sv=P&&P.seat; if(P) P.seat={x:1.2,z:0,table:1}; try{ await fn(); } finally { if(P) P.seat=sv; } }};
      ({G,r}=await order(['內用','鹹酥雞','夾好了','都要','不辣'],5000,0)); const four=Y.seat&&Y.seat.four; globalThis.WZS=W0;
      check('8 內用自動帶位：說 AA_724 第 6 節四人桌那一句（BB-B 11-07 P3 ①）',!!four&&H.has(four),J(said().slice(-4))); }
    check('8 吃過的登記到 eat3d（店名「公館・洋洋鹹酥雞」，說話的人「老闆」；沒有 EAT 的環境照常）',/addShop\(key,\{shop:'公館・'\+key,staff:\{who:S\.WHO\[k\]/.test(rd('src/gg2shops3d.js'))&&GG2.EAT_KEY.yangyang==='洋洋鹹酥雞'&&GG2.WHO.yangyang==='老闆'); }
  // ---- 8 看的東西、坐下 ----
  { fresh('2025-10-15',20,'yangyang'); GG2.rand=Math.random; const seen=new Set(); let rep=false, prev=null; for(let i=0;i<30;i++){ const t=GG2.look('yangyang','case'); if(t===prev) rep=true; prev=t; seen.add(t); }
    check('8 看炸物櫃：兩句隨機、同一句不連續出',seen.size===2&&!rep&&[...seen].every(t=>Y.look.case.includes(t)));
    check('8 看的東西五種（AA_724 第 5 節的 id）：case 2、menu 2、self 2、fridge 1、kitchen 1',J(Object.keys(Y.look).sort())===J(['case','fridge','kitchen','menu','self'])&&J(['case','menu','self','fridge','kitchen'].map(k=>Y.look[k].length))===J([2,2,2,1,1]));
    for(const k of ['fridge','kitchen','menu','self']){ H.said=[]; await GG2.interact(GM,{gg2:'yangyang',kind:k}); check(`8 按「${k}」：說稿上那一句（旁白）`,H.said.length===1&&Y.look[k].includes(H.said[0].t)&&H.said[0].who===null,J(said())); }
    const c={}; for(const s of YANGYANG_LAYOUT.shop.seats){ const t=GG2.seatKind('yangyang',s)||'none'; c[t]=(c[t]|0)+1; }
    check('8 坐下句照位子：四人桌 15、兩人桌 6（(0.92, 2.3) 11-12 拿掉）',J(c)===J({four:15,two:6}),J(c));
    H.G.zone='yangyang'; H.said=[]; await STORY.onSeat(GM,{x:0.92,z:1.2,yaw:0}); check('8 在四人桌坐下（STORY.onSeat）：四人桌那一句',J(said())===J([Y.seat.four]),J(said()));
    H.said=[]; await STORY.onSeat(GM,{x:3.5,z:-1.15,yaw:0}); check('8 在兩人桌坐下：兩人桌那一句',J(said())===J([Y.seat.two]),J(said()));
    H.G.zone='afar'; H.said=[]; await STORY.onSeat(GM,{x:0.92,z:1.2,yaw:0}); check('8 別的店坐下：不說洋洋的句子',!H.has(Y.seat.four)&&!H.has(Y.seat.two)); }
  // ---- 9 約會地點 ----
  { const G=fresh('2025-10-15',12,'campus'), P=INV.place('yangyang'), DB=INV.place('daybreak'), d=G.day;
    check('9 約會地點 yangyang（吃飯那一類、有點熟以上、去洋洋鹹酥雞）',!!P&&P.zone==='yangyang'&&P.kind==='meal'&&P.minStage==='FAMILIAR'&&J(INV.catsOf(P))===J(['meal'])&&P.name==='洋洋鹹酥雞',J(P&&[P.kind,P.minStage,INV.catsOf(P)]));
    if(P){ const ok=h=>INV.slotOpen(G,P,d,h);
      check('9 19:00～23:00（19:00、22:00 可以；22:30（吃到 23:15）、18:30、23:00 不行：23:00 以後不排約會）',ok(19)&&ok(20)&&ok(21)&&ok(22)&&!ok(22.5)&&!ok(18.5)&&!ok(23),J([19,20,21,22,22.5,18.5,23].map(ok)));
      G.hour=12; const T=INV.timeOptions(G,false,P); check('9 時間選項：今天、明天的 19:00、20:00、21:00、22:00',J(T.map(q=>[q.day-d,q.h]))===J([[0,19],[0,20],[0,21],[0,22],[1,19],[1,20],[1,21],[1,22]]),J(T.map(q=>[q.day-d,q.h])));
      check('9 可昕只排到 21:00（whoLast；其他人照常）',INV.lastOk(P,'kexin',21)&&!INV.lastOk(P,'kexin',22)&&INV.lastOk(P,'heroine_01',22)&&P.whoLast.kexin===21);
      H.FAMILIAR('kexin'); const k22=INV.decide(G,'kexin','yangyang',d+1,22), k21=INV.decide(G,'kexin','yangyang',d+1,21);
      check('9 約可昕 22:00：改天、改的時間在 21:00 以前（她 21:00 那一格不會因為這條規則被擋）',(k22.why==='closed'||k22.res==='resched')&&(!k22.alt||((k22.alt.h%24)<=21+1e-6))&&k21.why!=='closed',J([k22,k21]));
      /* 芷若：作息有班（2:30 AM barista）的時間約不到 */
      H.FAMILIAR('heroine_02'); const zr=CHARACTERS.heroine_02, wd=dd=>{ const w=CALENDAR.dateOf(dd).wd; return w===7?0:w; };
      let sh=null; for(let dd=d+1;dd<d+8&&!sh;dd++) for(const h of [19,20,21]){ const e=STORY.schedEnt(zr,{day:dd,hour:h+0.2,weekday:wd(dd),flags:G.flags,noInvite:true}); if(e&&e.act==='barista'){ sh={day:dd,h}; break; } }
      if(!sh) check('9 找得到芷若有班的晚上（一週內）',false);
      else { const r=INV.decide(G,'heroine_02','yangyang',sh.day,sh.h); check(`9 芷若有班（第 ${sh.day-d} 天 ${sh.h}:00 在 2:30 AM 上班）：約洋洋＝改天（busy、barista）`,r.res==='resched'&&r.why==='busy'&&r.act==='barista',J(r)); }
      const ACC={heroine_01:'……宵夜？好。我只吃一點。',heroine_02:'好。我下班剛好餓。',heroine_03:'鹹酥雞？……好。我沒有在店裡吃過。',heroine_04:'好！！我要雞皮。很多雞皮。',heroine_05:'好。讀完書，剛好。',classmate_peishan:'好啊！我要九層塔加很多！',kexin:'好。十點以前，我還要回去念書。'};   /* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）*/
      const bad=Object.keys(ACC).filter(id=>{ const o=INV.personal(G,id,P,d+1,20,{res:'accept'}); return !(o&&J(o.lines)===J([OE.fwd('invites',id,ACC[id])])); });
      check('9 約去洋洋答應：七位各自那一句（AA_724 第 8 節）',!bad.length,J(bad.map(id=>[id,(INV.personal(G,id,P,d+1,20,{res:'accept'})||{}).lines])));
      const o=INV.personal(G,'zhe',P,d+1,20,{res:'accept'}); check('9 沒列的人（阿哲）＝一般那句「好啊。宵夜？我可以。」',o&&J(o.lines)===J(['好啊。宵夜？我可以。']),J(o&&o.lines));   /* 有名字說的不加外面的「」（TEXT-QUOTE-UNIFY-1108 第三批，GG2.ACC0）*/
      const no=INV.personal(G,'zhe',P,d+1,20,{res:'decline',why:'rel'}); check('9 不答應：不套答應句',!(no&&no.lines&&['好啊。宵夜？我可以。','「好啊。宵夜？我可以。」'].includes(no.lines[0])));
      const pb=[]; for(const [id,fl,kn] of [['heroine_03',{},null],['heroine_03',{dating_heroine_01:true},null],['heroine_03',{dating_heroine_01:true},'heroine_01'],['heroine_01',{dating_heroine_01:true},null]]){ const G2=fresh('2025-10-15',12,'campus',fl); if(kn) ROM.learn(G2,id,kn,'test'); pb.push([INV.partnerBlock(G2,id,P),INV.partnerBlock(G2,id,DB),INV.partnerBlock(G2,id,INV.place('afar'))]); }
      check('9 兩個人單獨吃飯（partnerBlock）照吃飯那一類的規則：和 Daybreak 一樣（祐廷和以安交往、語彤知道＝擋；不知道、約的是以安本人＝不擋；喝咖啡的 afar 不擋）',INVITE_DATA.soloKinds.includes('meal')&&J(pb)===J([[false,false,false],[false,false,false],[true,true,false],[false,false,false]]),J(pb));
      check('9 可昕交往中：列得出來（有她自己的答應句）',!INV.kxPlaceOk||INV.kxPlaceOk(G,P));
      const SO=INVITE_DATA.seatOpen; check('9 坐下以後的開場句：洋洋自己的兩則（byPlace）、第一則只在四人桌',SO.byPlace.yangyang==='yangyang'&&SO.yangyang.length===2&&J(SO.yangyang[0].onlyAt)===J({table:[1,2,3,4]})&&J(P.prefTable)===J([1,2,3,4]));
      { fresh('2025-10-15',20,'yangyang'); const R0=Math.random, PS0=E.player.seat; Math.random=()=>0; E.player.seat={x:0.92,z:2.3,yaw:0,table:1}; await INV.seatOpenLines(GM,{who:'heroine_04'},{name:'高子晴'},P);
        const a=pairs(); H.said=[]; E.player.seat={x:3.5,z:-1.15,yaw:0,table:6}; await INV.seatOpenLines(GM,{who:'heroine_04'},{name:'高子晴'},P); const b=pairs(); Math.random=R0; E.player.seat=PS0;
        check('9 兩個人坐在四人桌（table 1）：紙袋那一則（旁白＋她一句）；兩人桌（table 6）：不抽四人桌那一則',J(a)===J([[null,'（你們在四人桌坐下。她把紙袋撕開攤平，當成盤子。）'],['高子晴','這樣比較好拿。']])&&J(b)===J([[null,'（她先夾了一塊，吹了很久才放進嘴裡。）'],['高子晴','……好燙。可是好好吃。']]),J([a,b])); } } }
  // ---- 10 逐字對照 AA_724、價錢對照 AA_650 ----
  { const doc=gitShow(['bf5c3e6c6','origin/claude/cool-heisenberg-o8kuqx'],AA724);
    if(!doc) console.log('SKIP 10 讀不到 AA_724（企劃線 bf5c3e6c6）');
    else { const out=[]; const T=t=>{ if(typeof t==='string') out.push(t); };
      Y.door.forEach(T); T(Y.ask); T(Y.short); T(Y.basil[0]); Y.basil[1].forEach(T); T(Y.spicy[0]); Y.spicy[1].forEach(T); T(Y.spicyBig); Y.wait.forEach(w=>T(w[1])); Y.eat.forEach(e=>T(e[0]));
      Object.values(Y.look).forEach(a=>a.forEach(T)); Object.values(Y.seat).forEach(T); T(Y.sign); T(Y.typhoon); T(GG2.ACC0.yangyang);
      Object.values(INVITE_DATA.yangyangAcc||{}).forEach(T); [].concat(...INVITE_DATA.seatOpen.yangyang).forEach(T);
      const strip=t=>t.replace(/^「|」$/g,''), bad=out.filter(t=>!OE.inDoc('invites',null,t,t=>doc.indexOf(t)>=0||doc.indexOf(strip(t))>=0)&&!require('./canon1112_ok.js').ok(t));   /* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）*/
      check('10 台詞逐字在 AA_724 裡（'+out.length+' 句：進門、點餐、調味、錢不夠、等、吃完、看、坐下、鐵門、颱風、答應、開場句；打烊是 AA_700 那一句）',!bad.length&&out.length>=43,J(bad));
      check('10 說話的人：稿上「老闆：」開頭的那幾句都是老闆說',['夾好給我。……內用還外帶？','九層塔、蒜要不要？','辣嗎？','大辣喔？……好，你說的。','這樣不夠喔。……拿掉一樣？','十分鐘。號碼牌拿好。'].every(t=>doc.indexOf('老闆：「'+t+'」')>=0||doc.indexOf('老闆多一句：「'+t+'」')>=0));
      check('10 打烊照稿（bf5c3e6c6）：「老闆：我們今天要打烊了。」、不另外出旁白（舊的「要收了喔」、走出去的旁白拿掉了）',doc.indexOf('老闆：我們今天要打烊了。')>=0&&doc.indexOf('要收了喔')<0&&!/要收了喔|你走出洋洋鹹酥雞/.test(rd('src/gg2shops3d.js'))); }
    const d650=gitShow(['origin/claude/cool-heisenberg-o8kuqx','4bab808dd'],AA650);
    check('8 選單品項、價錢＝菜單板（AA_650 第 4 節）',J(Y.menu)===J(MENU));
    if(!d650) console.log('SKIP 10 讀不到 AA_650'); else check('10 選單品項、價錢逐項在 AA_650 第 4 節（洋洋那一段）',(()=>{ const a=d650.indexOf('**洋洋鹹酥雞**（室內菜單板）'), sec=a<0?'':d650.slice(a,d650.indexOf('**轉角唱片**：',a)); return [].concat(...Y.menu.map(c=>c[1])).every(([n,p])=>sec.indexOf(n+' '+p)>=0)&&Y.menu.every(c=>sec.indexOf(c[0])>=0); })()); }
};
run().then(()=>H.done(),e=>{ check('B 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); H.done(); });
}

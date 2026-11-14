// 轉角唱片進得去（CORNER-IN-1107；公館 G12；AA_650、AA_725）——不需要瀏覽器（D131）。
//   新區域 corner_records：CC 的 bb_support/corner.glb（v1c，LAWWW2-B 38f4021e1 改原型分組、MODEL_READY）＋src/data/corner_layout.js（cc-testing 4fc38d513，原檔沒改）；
//   台詞 AA_725（企劃線 bf5c3e6c6：打烊照 AA_700 一句）、系統 src/gg2shops3d.js（照 afar、Daybreak、洋洋鹹酥雞：tests/gg_shops2_1104_unit.js、yangyang_shop_unit.js）。模型本身的檢查在 tests/corner_glb_unit.js（LAWWW2-B）。
// 第一部分（A）建出遊戲真正的區域（公館＋轉角唱片室內，zones3d.js 真正的程式），用引擎真正的找路與移動（E.simWalk：30 fps＋低幀率）檢查：
//   1 建得起來、尺寸照配置、正式模型的資產登錄、配置的導航阻擋都擋住、沒有走進去出不來的小孤島（0.1 m 取樣）
//   2 公館店門口「進入 轉角唱片」：門＝那一棟中心 55.6 − 配置的門 x 1.63＝53.97（騎樓機車讓開的 DOORS 同一個位置）、按得到、從人行道走得到
//   3 進門站的地方、出口（配置的 exit、enterAt 是空的：LAWWW 填）站得住、不在出口範圍（＋0.2 m）裡；出口按得到、走得到；出來回公館站得住、就在店門前
//   4 座位 4 張（試聽的高腳椅 2：桌號 listen、座面 0.74 抬高；休息區沙發 2：lounge）都按得到、走得到、坐下前的走近點站得住
//   5 問店員／結帳、翻唱片七箱（genre）、試聽、看音響按得到、走得到
//   6 店員站在櫃台後面、路人（CROWD：站著翻的人、沙發）、快速前往、大地圖、引路、路程、城鎮判定、index.html、zone_assets.js、LICENSES.md、劇情匯入白名單、模型的測試
// 第二部分（B，子程序：tests/pg_harness.js 的遊戲資料＋邀約系統＋gg2shops3d.js＋xs_close3d.js）：
//   7 營業時間 12:00～21:00、關門時按門（21:00 以後木門那一句、還沒開門寫開放時間、颱風那一句）、打烊請你出來（店員「我們今天要打烊了。」一句；試聽的時候等聽完）
//   8 進門一天一次、翻唱片（七箱的句子、拿去試聽／買這張／放回去）、試聽（高腳椅／站著／同一天第二次、六種、15 分鐘、免費、不限次數）、
//     買唱片（一次一張、150／250、錢不夠、G.records、舊存檔）、櫃台（那一天第一次問的那一句）、看音響、坐下句
//   9 約會地點：看電影、逛書店那一類、13:00～20:00、AA_708 書店第 N 次、七位答應的那一句＋一般那句、坐下以後的開場句（一起聽那一則只在試聽的高腳椅）
//   10 台詞逐字對照 AA_725（git show bf5c3e6c6；讀不到就 SKIP）
// 修改前（corner-1107 的基底 f149bf8e4）：沒有 corner_records 區域、門口沒有按鈕、GG2 沒有轉角唱片、沒有約會地點——第 1～10 節都 FAIL。
// 用法：node tests/corner_shop_unit.js
/* 2026-11-11（X324 D 區，AA_784_invites.json）：invites.js 照覆蓋層拿掉刪節號、換句——答應句的期望包 OE.fwd（舊期望＝裡面的字），逐字對稿時「新字的舊字在稿上」也算（OE.inDoc；tests/overlay_expect.js）*/
const OE=require('./overlay_expect.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8'), J=x=>JSON.stringify(x), r2=v=>+(+v).toFixed(2);
const LAY='src/data/corner_layout.js', AA725='docs/story_planning/AA_725_轉角唱片店內台詞.md', ZID='corner_records';
const GENRES=['indie','folk','electronic','jazz','citypop','ost','wall'];
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
  'src/data/xinsheng_layout.js','src/data/bike_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js','src/data/afar_layout.js','src/data/daybreak_layout.js','src/data/yangyang_layout.js',LAY,'src/xinsheng3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/bike3d.js','src/bikeshop3d.js','src/crowd3d.js','src/data/pool_story.js'])];
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
  c.sort((a,b)=>a[0]-b[0]); for(const [,x,z] of c){ P.obj.position.set(x,0,z); if(E.nearestInteractable()!==it) continue; if(from&&!walk(from,[x,z]).ok) continue; return [r2(x),r2(z)]; } return null; }
function islands(sp,x0,x1,z0,z1){ const S=0.1, nx=Math.round((x1-x0)/S)+1, nz=Math.round((z1-z0)/S)+1, ok=new Uint8Array(nx*nz), seen=new Uint8Array(nx*nz); let tot=0;
  for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ if(E.canStand(x0+i*S,z0+j*S,0.32,0)){ ok[j*nx+i]=1; tot++; } }
  const si=Math.round((sp[0]-x0)/S), sj=Math.round((sp[1]-z0)/S), st=[sj*nx+si]; if(!ok[st[0]]) return {tot,lost:tot,pts:[]}; seen[st[0]]=1; let n=0;
  while(st.length){ const c=st.pop(); n++; const i=c%nx, j=(c-i)/nx; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a=i+di, b=j+dj; if(a<0||b<0||a>=nx||b>=nz) continue; const q=b*nx+a; if(ok[q]&&!seen[q]){ seen[q]=1; st.push(q); } } }
  const pts=[]; for(let q=0;q<nx*nz;q++) if(ok[q]&&!seen[q]) pts.push([r2(x0+(q%nx)*S),r2(z0+Math.floor(q/nx)*S)]); return {tot,lost:tot-n,pts:pts.slice(0,8)}; }
const inExit=(its,s,margin)=>its.filter(q=>q.exit&&!q.hidden&&Math.hypot(q.x-s.x,q.z-s.z)<(q.radius||1.8)+margin).map(q=>q.label+' '+Math.hypot(q.x-s.x,q.z-s.z).toFixed(2)+'m');
const L=typeof CORNER_LAYOUT!=='undefined'&&CORNER_LAYOUT.corner?CORNER_LAYOUT.corner:null, SI=Z3.SHOP_IN, IN=SI&&SI[ZID];
check('0 配置 src/data/corner_layout.js 有載入（CC 的原檔：{version 1, corner}；exit、enterAt 留空）',!!L&&CORNER_LAYOUT.version===1&&L.name==='轉角唱片'&&L.exit===null&&L.enterAt===null,J(L&&[CORNER_LAYOUT.version,L.name]));
// ---- 2 公館店門口 ----
const GG=loadZone('gongguan'); const gIts=GG.its, gNav=GG.z.nav;
{ let x=-68; const W=[10,8,12,10,8,8,9,9,8,9,9,10,8,9,9]; const cx=[]; W.forEach((w,i)=>{ const X1=x+w+(i<8&&i<W.length-1?1.2:0); cx.push((x+X1)/2); x=X1; });
  check('2 店面街第 12 棟（G12）的中心＝55.6、寬 8（＝配置的店寬）',Math.abs(cx[12]-55.6)<1e-6&&!!L&&L.w===8,J(cx[12])); }
const door=gIts.find(q=>q.exit&&q.exit.to===ZID);
check('2 轉角唱片：公館店門口「進入 轉角唱片」進 corner_records',!!door&&door.label==='進入 轉角唱片',J(door&&[door.label,door.x,door.z]));
if(door){
  check('2 門口互動點 (53.97, 21)＝那一棟中心 55.6 − 配置的門 x 1.63（騎樓機車讓開的 DOORS 同一個位置）',Math.abs(door.x-53.97)<0.011&&door.z===21&&!!L&&L.front.door.x===1.63&&/DOORS=\[[^\]]*53\.97/.test(rd('src/zones3d.js')),J([door.x,door.z]));
  check('2 進門站的地方＝SHOP_IN.corner_records',!!IN&&J(door.exit.spawn)===J({x:IN.x,z:IN.z,yaw:IN.yaw}),J(door.exit.spawn));
  E.zone=GG.z; E.nav=gNav; E.interactables=gIts; const tp=touchable(door);
  check('2 店門口按得到（範圍裡站得住、最近的互動就是它）',!!tp,J(tp));
  if(tp){ const w=walk([door.x,15],tp); check('2 從羅斯福路人行道 (53.97, 15) 走到店門口',w.ok,J(w).slice(0,200)); }
  const near=gIts.filter(q=>q!==door&&!q.hidden&&Math.hypot(q.x-door.x,q.z-door.z)<2.6).map(q=>q.label);
  check('2 門口附近（2.6 m）沒有別的按鈕疊著',!near.length,J(near)); }
// ---- 1、3、4、5 室內 ----
let R=null; if(!L||!Z3.ZONES[ZID]) check('1 區域 corner_records 存在（配置 corner_layout.js 有載入）',false);
else { try{ R=loadZone(ZID); }catch(e){ check('1 區域建得起來',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } }
if(R){ const z=R.z, its=R.its;
  check(`1 區域建得起來、尺寸照配置 ${L.w}×${L.d}×${L.h}、名字「轉角唱片」、SHOP_IN.gg`,z.bounds.w===L.w&&z.bounds.d===L.d&&Z3.ZONES[ZID].name==='轉角唱片'&&z.gg===ZID&&IN.gg===true,J(z.bounds));
  const man=ASSETS.manifest['bldg.corner_interior']; check('1 正式模型登錄 bldg.corner_interior＝配置的 glb（檔案在、building、SHOP-CC0-HELP-1113 幫手 g2 11-14 CC0 v2（頂點色×材質組、Poly Haven 大盆栽、重烘光照）那一版 4875700 B）',!!man&&man.url===L.glb&&fs.existsSync(path.join(ROOT,L.glb))&&man.type==='building'&&fs.statSync(path.join(ROOT,L.glb)).size===4875700,J(man&&man.url));
  const onSeat=b=>L.seats.some(s=>Math.abs(b[0]-s.x)<0.05&&Math.abs(b[1]-s.z)<0.05), BL=L.blocks.filter(b=>!onSeat(b)), blk=BL.filter(b=>E.canStand(b[0],b[1],0.05,0));
  check(`1 配置的導航阻擋 ${BL.length} 個都擋住（中心站不住；高腳椅、沙發本身不擋）`,BL.length===27&&!blk.length,BL.length+' '+J(blk));
  const sp=z.spawn, isl=islands([sp.x,sp.z],-L.w/2,L.w/2,-L.d/2,L.d/2);
  check('1 沒有走進去出不來的小孤島（0.1 m 取樣、半徑 0.32）',isl.lost===0&&isl.tot>2500,'站得住 '+isl.tot+' 點、連不到 '+isl.lost+' 點 '+J(isl.pts));
  const ex=its.find(q=>q.exit&&q.exit.to==='gongguan');
  check(`3 進門站的地方 (${sp.x}, ${sp.z}) 站得住（半徑 0.32）＝SHOP_IN、門往裡 1.5 m`,E.canStand(sp.x,sp.z,0.32,0)&&sp.x===IN.x&&sp.z===IN.z&&sp.x===L.front.door.x&&Math.abs(sp.z-(L.d/2-1.5))<1e-6,J(sp));
  const nx=inExit(its,sp,0.2); check('3 進門站的地方不在任何出口的範圍（＋0.2 m）裡',!nx.length,J(nx));
  check('3 出口「離開轉角唱片」在門內（x 1.63、z 5.35、半徑 0.7）',!!ex&&ex.label==='離開轉角唱片'&&ex.x===1.63&&ex.z===5.35&&ex.radius===0.7,J(ex&&[ex.label,ex.x,ex.z,ex.radius]));
  if(ex){ const tp=touchable(ex,[sp.x,sp.z]); check('3 出口按得到、從進門的地方走得到',!!tp,J(tp));
    const out=ex.exit.spawn; check(`3 出來回公館 (${out.x}, ${out.z}) 站得住、不在公館任何出口的範圍（＋0.2 m）裡、就在店門前`,gNav.clear(out.x,out.z,0.3)&&!inExit(gIts,out,0.2).length&&Math.abs(out.x-53.97)<0.02,J([out,inExit(gIts,out,0.2)])); }
  const seats=its.filter(q=>q.seat), zs=z.seats||[];
  check('4 座位 4 張：試聽的高腳椅 2（桌號 listen、座面 0.74 抬高、字「坐下」）、休息區沙發 2（lounge、「坐一下」）；不能讀書',zs.length===4&&seats.length===4&&zs.filter(q=>q.table==='listen'&&q.lift>0).length===2&&zs.filter(q=>q.table==='lounge'&&!q.lift).length===2&&seats.filter(q=>q.label==='坐下').length===2&&seats.filter(q=>q.label==='坐一下').length===2&&seats.every(q=>q.shop===ZID&&!q.study),J(zs.map(q=>[q.x,q.z,q.table,q.lift])));
  const bad=[]; for(const it of seats){ if(!touchable(it,[sp.x,sp.z])) bad.push([it.seat.x,it.seat.z]); }
  check('4 每一張都按得到、從進門的地方走得到',!bad.length,J(bad));
  const noAp=[]; for(const it of seats){ const s=it.seat, fx=Math.sin(s.yaw||0), fz=Math.cos(s.yaw||0), reach=(it.radius||1.8)-0.05;
    const ok=[[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]].some(([dx,dz])=>{ const x=s.x+dx, zz=s.z+dz;
      if(!E.canStand(x,zz,0.3,0)||Math.hypot(x-it.x,zz-it.z)>reach) return false; const p=E.pathTo(sp.x,sp.z,0,x,zz,0); return !!p&&p.length>0&&Math.hypot(p[p.length-1][0]-x,p[p.length-1][1]-zz)<=0.6; });
    if(!ok) noAp.push([s.x,s.z]); }
  check('4 每一張的走近點（seatApproach 的八個候選）至少一個站得住、在範圍裡、找得到路',!noAp.length,J(noAp));
  const gi=its.filter(q=>q.gg2===ZID);
  check('5 店裡的按鈕：問店員／結帳 1、翻唱片 7（七箱：搖滾、民謠、電子、爵士、城市流行、原聲帶、唱片牆）、試聽 1、看音響 1（kind 照配置）',gi.length===10&&gi.filter(q=>q.kind==='corner_shop').length===1&&J(gi.filter(q=>q.kind==='corner_browse').map(q=>q.genre))===J(GENRES)&&gi.filter(q=>q.kind==='corner_listen').length===1&&gi.filter(q=>q.kind==='corner_view').length===1,J(gi.map(q=>[q.kind,q.genre])));
  for(const it of gi){ const lay=L.interact.find(q=>q.kind===it.kind&&(q.genre||null)===(it.genre||null)); const tp=touchable(it,[sp.x,sp.z]);
    check(`5「${it.label}」（${it.kind}${it.genre?' '+it.genre:''}）位置、字照配置，按得到、從進門的地方走得到`,!!lay&&lay.x===it.x&&lay.z===it.z&&lay.label===it.label&&!!tp,J([it.x,it.z,tp])); }
  const c=IN.clerk, st0=L.npc.staff[0]; check(`6 店員站的地方（SHOP_IN.clerk ${J(c)}＝配置 npc.staff 第一個：櫃台後面、面向店門）在店裡、不在任何按鈕上`,!!c&&c.x===st0.x&&c.z===st0.z&&c.yaw===st0.yaw&&Math.abs(c.x)<L.w/2&&Math.abs(c.z)<L.d/2&&!gi.some(q=>Math.hypot(q.x-c.x,q.z-c.z)<0.9));
  const def=CROWD.SHOP_ZONES[ZID];
  check('6 路人（CROWD）：站著翻的人 5 個（站得住、離按鈕 0.45 m 以上）、沙發一組（bookseat 的時段）、試聽的高腳椅不排',!!def&&def.kind==='shop'&&def.units.filter(u=>u.stand).length===5&&def.units.filter(u=>u.stand).every(u=>E.canStand(u.stand[0],u.stand[1],0.3,0)&&!its.some(q=>!q.seat&&Math.hypot(q.x-u.stand[0],q.z-u.stand[1])<(q.exit?1.0:0.45)))&&def.units.filter(u=>u.seats).every(u=>u.sk==='bookseat'&&u.seats.every(s=>s.table===undefined||true)&&u.seats.every(s=>Math.abs(s.x+3)<0.2))&&def.units.filter(u=>u.seats).reduce((a,u)=>a+u.seats.length,0)===2,J(def&&def.units.map(u=>u.stand||u.seats.map(s=>[s.x,s.z]))));
  if(def){ const wins=CROWD.shopWindows(def,{day:30,hour:15}); check('6 路人只在營業時間（12:00～21:00）',J(wins)===J([[12,21]]),J(wins)); }
}
// ---- 6 其他接線 ----
{ const Q=PLACES.quickList(), q=Q.find(p=>p[0]===ZID);
  check('6 快速前往：轉角唱片的落點＝進門站的地方',!!q&&!!IN&&q[1]==='轉角唱片'&&J(q[2])===J({x:IN.x,z:IN.z,yaw:IN.yaw}),J(q));
  check('6 地點名：corner_records＝轉角唱片',PLACES.names.corner_records==='轉角唱片');
  check('6 大地圖、引路、路程、城鎮判定：corner_records 都算公館',/\['yangyang','洋洋鹹酥雞'\],\['corner_records','轉角唱片'\]/.test(rd('src/placemap3d.js'))&&/corner_records:'gongguan'/.test(rd('src/placemap3d.js'))&&/'yangyang','corner_records','bookstore'/.test(rd('src/guide3d.js'))&&/corner_records:\['gongguan'\]/.test(rd('src/guide3d.js'))&&/corner_records:'gongguan'/.test(rd('src/classes3d.js'))&&/'yangyang','corner_records'\]\.includes\(z\)/.test(rd('src/zrzq3d.js')));
  check('6 story3d.js：店員照 Z3.SHOP_IN、打烊沒有人',/zoneId==='corner_records'&&ck\('corner_records'\)&&\(typeof PLACES==='undefined'\|\|!PLACES\.isOpen\|\|PLACES\.isOpen\('corner_records',G\.hour,G\.day\)\)/.test(rd('src/story3d.js')));
  const h=rd('index.html'), sc=[...h.matchAll(/<script src="([^"?]+)(\?v=[^"]*)?"/g)].map(m=>[m[1],m[2]]), ix=f=>sc.findIndex(s=>s[0]===f), v=f=>(sc.find(s=>s[0]===f)||[])[1];
  check('6 index.html：corner_layout.js 在 zones3d.js、crowd3d.js、gg2shops3d.js 以前載入（和旁邊一樣 ?v=）',ix(LAY)>0&&ix(LAY)<ix('src/zones3d.js')&&ix(LAY)<ix('src/crowd3d.js')&&ix(LAY)<ix('src/gg2shops3d.js')&&v(LAY)===v('src/data/yangyang_layout.js'),J([ix(LAY),ix('src/zones3d.js'),v(LAY)]));
  check('6 zone_assets.js：corner_records 用 bldg.corner_interior（node tools/gen_zone_assets.js --check）',/"corner_records":\["bldg\.corner_interior"\]/.test(rd('src/data/zone_assets.js')));
  check('6 LICENSES.md：GLB 一行（LAWWW2-B 的 corner_in_1107.patch：本作 Blender、CC 製作、自製貼圖＋Poly Haven CC0、虛構）',/\| 轉角唱片室內 v1c `assets\/models\/env\/second_ai\/bb_support\/corner\.glb`[^\n]*CC〔帳號 A〕製作[^\n]*Poly Haven CC0/.test(rd('LICENSES.md')));
  const al=JSON.parse(rd('docs/handoff/story_import_allow.json')), ent=(al.files||[]).find(e=>e&&e.path===AA725);
  check('6 劇情匯入白名單：AA_725（路徑＋來源 commit 94ab0865e（11-10 AA_731 答應句；bf5c3e6c6 在 history）＋approved＋AA（D109））',!!ent&&ent.status==='approved'&&ent.approvedBy==='AA（D109）'&&ent.sha==='94ab0865e',J(ent));
  check('6 模型的 MODEL_READY 檢查 tests/corner_glb_unit.js 在（LAWWW2-B 的 patch）',fs.existsSync(path.join(ROOT,'tests/corner_glb_unit.js')));
  check('6 存檔的預設有 records:[]（game3d.js defaults；舊存檔 migrate 補空陣列）',/records:\[\],savedAt:0\}/.test(rd('src/game3d.js'))); }
// ---- B 子程序 ----
const rB=cp.spawnSync(process.execPath,[__filename,'B'],{encoding:'utf8',cwd:ROOT,timeout:120000});
process.stdout.write(rB.stdout||''); if(rB.status!==0){ fails+=((rB.stdout||'').match(/^FAIL /mg)||[]).length||1; if(rB.stderr) console.log('B stderr:',rB.stderr.split('\n').slice(0,6).join(' / ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}

function partB(){
const H=require('./pg_harness.js'); const {check,GM,E}=H;
console.warn=()=>{};
for(const f of [LAY,'src/gg2shops3d.js','src/xs_close3d.js']){ if(!fs.existsSync(path.join(ROOT,f))){ check('B 檔案 '+f+' 在',false); continue; } let src=rd(f); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof GG2==='undefined'||!GG2.L||!GG2.L[ZID]||!(GG2.ZONES||[]).includes(ZID)){ check('B GG2 載入、有轉角唱片（GG2.L.corner_records、ZONES）',false); return H.done(); }
let relN=0; GM.rel=()=>{ relN++; };
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const toasts=[]; GM.toast=t=>toasts.push(t); GM.enterN=1;
const C=GG2.L[ZID], CL='店員', LINE='我們今天要打烊了。';
const SEATS=CORNER_LAYOUT.corner.seats.map(s=>({x:s.x,z:s.z,yaw:s.yaw,table:s.kind==='stool'?'listen':'lounge',kind:'shop'}));
let sits=[], stands=0; GM.sitAt=(P,st)=>{ P.seat=st; sits.push(st); }; GM.standUp=P=>{ P.seat=null; stands++; };
const fresh=(key,h,zone,fl)=>{ const G=H.fresh(key,h,zone,fl); G.money=5000; toasts.length=0; relN=0; sits=[]; stands=0; E.player.seat=null; E.zone.seats=SEATS; return G; };
const said=()=>H.said.map(s=>s.t), pairs=()=>H.said.map(s=>[s.who,s.t]);
const run=async()=>{
  // ---- 7 營業時間 ----
  { const G=fresh('2025-10-15',12,'gongguan'), d=G.day, o=(h,dd)=>PLACES.isOpen(ZID,h,dd==null?d:dd);
    check('7 每天 12:00～21:00（11:59 關、12:00 開、20:59 開、21:00 關）',!o(11.98)&&o(12)&&o(20.98)&&!o(21),J([11.98,12,20.98,21].map(h=>o(h))));
    check('7 一週七天都開',[0,1,2,3,4,5,6].every(k=>o(15,d+k)));
    check('7 颱風天關（typhoonShops）、說明文字「每天 12:00–21:00」',PLACES.typhoonShops.includes(ZID)&&PLACES.hours[ZID].text==='每天 12:00–21:00');
    const ct=PLACES.closedText(ZID,10,d); check('7 關門的說明（10:00）：店家寫「開門」、今天 12:00',/^轉角唱片/.test(ct)&&/下次開門：今天 12:00/.test(ct),ct); }
  // ---- 7 關門時按門 ----
  { let G=fresh('2025-10-15',10,'gongguan'); let r=await STORY.interact({exit:{to:ZID,spawn:{x:0,z:0,yaw:0}},label:'進入 轉角唱片'},GM);
    check('7 還沒開門（10:00）按門：寫開放時間、不進去、不說木門那一句',r===true&&!H.has(C.sign)&&toasts.some(t=>/轉角唱片/.test(t)&&/12:00/.test(t))&&!H.entered.length,J([said(),toasts]));
    G=fresh('2025-10-15',21.5,'gongguan'); r=await STORY.interact({exit:{to:ZID,spawn:{x:0,z:0,yaw:0}}},GM);
    check('7 打烊以後（21:30）按門：AA_725 木門那一句（「每天 12:00～21:00」）、不進去',r===true&&J(pairs())===J([[null,C.sign]])&&/每天 12:00～21:00/.test(C.sign)&&!H.entered.length,J(said()));
    const TC=PLACES.typhoonClosed; PLACES.typhoonClosed=(z)=>PLACES.typhoonShops.includes(z);
    try{ fresh('2025-10-15',15,'gongguan'); await STORY.interact({exit:{to:ZID,spawn:{x:0,z:0,yaw:0}}},GM);
      check('7 颱風假當天按門：AA_725 颱風那一句、不進去',H.has(C.typhoon)&&/颱風天休息一天/.test(C.typhoon)&&!H.entered.length,J(said())); }
    finally { PLACES.typhoonClosed=TC; } }
  // ---- 7 打烊請你出來 ----
  { XSCLOSE._resetSeen(); fresh('2025-10-15',21.1,ZID); GM.enterN=20; const r=await GG2.closeOut(GM);
    check('7 打烊那一刻（21:06）：店員「我們今天要打烊了。」一句（AA_725 第 7 節 bf5c3e6c6＝AA_700）、回公館店門口、不另外出旁白、不寫字',r==='close'&&J(pairs())===J([[CL,LINE]])&&H.entered[0]==='gongguan'&&!toasts.length&&!C.close&&!C.closeNarr,J([r,pairs(),H.entered,toasts]));
    XSCLOSE._resetSeen(); fresh('2025-10-15',20.9,ZID); GM.enterN=21; const seen=XSCLOSE.markSeen(GM); H.G.hour=21.8; const r2=await GG2.closeOut(GM);
    check('7 這一趟進來的時候開著（20:54）、21:48 才輪到：一樣店員那一句（XSCLOSE.gen）',seen===true&&r2==='close'&&J(pairs())===J([[CL,LINE]]),J([seen,r2,said()]));
    XSCLOSE._resetSeen(); fresh('2025-10-16',10,ZID); GM.enterN=22; const r3=await GG2.closeOut(GM);
    check('7 讀檔回到關門以前（10:00）：不說話、回公館、寫開放時間',r3==='out'&&!H.said.length&&H.entered[0]==='gongguan'&&toasts.length===1&&/12:00/.test(toasts[0]),J([r3,said(),toasts]));
    /* 試聽的時候到了打烊：聽完才說（場景忙＝GG2.tick 等）*/
    XSCLOSE._resetSeen(); fresh('2025-10-15',20.95,ZID); GM.enterN=23; GG2.rand=()=>0; const D0=GM.D.active; GM.D.active=true; const t0=GG2.tick(GM); GM.D.active=D0;
    check('7 場景忙（正在試聽、對話中）：打烊不打斷（GG2.tick 不動）',t0===false&&!H.said.length);
    await GG2.interact(GM,{gg2:ZID,kind:'corner_listen'}); const afterListen=said().slice(); const h1=H.G.hour; const t1=GG2.tick(GM); for(let i=0;i<20;i++) await Promise.resolve();
    check('7 試聽到 21:00 以後：聽完（結束那一句）才輪到店員那一句、回公館',h1>=21&&afterListen[afterListen.length-1]===C.listen.end&&t1===true&&said()[said().length-1]===LINE&&H.said[H.said.length-1].who===CL&&H.entered[0]==='gongguan',J([h1,said(),H.entered])); }
  // ---- 8 進門一天一次 ----
  { const G=fresh('2025-10-15',15,ZID); GM.enterN=5; const due=GG2.doorDue(GM); const r=await GG2.enterLine(GM);
    check('8 一天第一次進來：隨機一句進門旁白（AA_725 第 1 節三句）',due&&r==='door'&&H.said.length===1&&C.door.includes(H.said[0].t)&&H.said[0].who===null&&C.door.length===3,J(said()));
    GM.enterN=6; check('8 同一天再進來：不說',!GG2.doorDue(GM));
    G.day++; check('8 同一趟待到隔天（00:00 換日、人還在店裡）：不再說（BB-B 11-07 P3 ③）',!GG2.doorDue(GM));
    GM.enterN=(GM.enterN|0)+1; check('8 隔天再進來：又說',GG2.doorDue(GM));
    G.invites=[{who:'heroine_03',place:ZID,day:G.day,h:15,state:'going'}]; H.said=[]; const r2=await GG2.enterLine(GM);
    check('8 今天約在這裡（一起走過來）：不說',r2==='together'&&!H.said.length); }
  // ---- 8 翻唱片 ----
  { const G=fresh('2025-10-15',15,ZID); GG2.rand=Math.random; const bad=[];
    for(const g of GENRES){ H.said=[]; H.opts=[]; H.picks=['放回去']; const m0=G.money; await GG2.interact(GM,{gg2:ZID,kind:'corner_browse',genre:g});
      if(!(H.said.length===1&&C.browse[g].includes(H.said[0].t)&&H.said[0].who===null&&J([...H.opts[0]])===J(['拿去試聽','買這張','放回去'])&&G.money===m0)) bad.push([g,said(),H.opts.map(o=>[...o])]); }
    check('8 翻唱片七箱：那一箱的一句（旁白）→「拿去試聽／買這張／放回去」；放回去＝什麼都不做',!bad.length,J(bad));
    check('8 每一箱一兩句（搖滾 2、民謠 1、電子 1、爵士 2、城市流行 1、原聲帶 1、唱片牆 2）',J(GENRES.map(g=>C.browse[g].length))===J([2,1,1,2,1,1,2]));
    let rep=false, prev=null; const seen=new Set(); for(let i=0;i<20;i++){ H.picks=['放回去']; H.said=[]; await GG2.crBrowse(GM,'jazz'); const t=H.said[0].t; if(t===prev) rep=true; prev=t; seen.add(t); }
    check('8 爵士那一箱：兩句隨機、同一句不連續出',seen.size===2&&!rep); }
  // ---- 8 試聽 ----
  { let G=fresh('2025-10-15',15,ZID); GG2.rand=()=>0; E.zone.seats=SEATS.map(s=>Object.assign({},s)); const occ=E.zone.seats.filter(s=>s.table==='listen'); GM.freeSeat=s=>occ.includes(s)?null:s;
    const m0=G.money, h0=G.hour; let r=await GG2.interact(GM,{gg2:ZID,kind:'corner_listen'});
    check('8 試聽（兩張高腳椅都有人）：站著那一句 →（沒有指定類型）六種裡的一句 → 結束；時間 +15 分鐘、免費',J(said())===J([C.listen.stand,C.listen.g.indie,C.listen.end])&&Math.abs(G.hour-h0-0.25)<1e-6&&G.money===m0&&!sits.length,J([said(),G.hour-h0]));
    delete GM.freeSeat; H.said=[]; sits=[]; stands=0; r=await GG2.interact(GM,{gg2:ZID,kind:'corner_listen'});
    check('8 同一天第二次：開始那句換成「你又戴上耳機……」（有空的高腳椅就坐上去，聽完站起來）',H.said[0].t===C.listen.again&&sits.length===1&&sits[0].table==='listen'&&stands===1&&H.said[H.said.length-1].t===C.listen.end,J([said(),sits.length,stands]));
    G=fresh('2025-10-16',15,ZID); GG2.rand=()=>0.99; H.picks=['拿去試聽']; await GG2.interact(GM,{gg2:ZID,kind:'corner_browse',genre:'jazz'});
    check('8 隔天、翻爵士選「拿去試聽」：坐上高腳椅那一句 → 爵士那一句（這一箱的類型）→ 結束',said().slice(1).join('|')===[C.listen.start,C.listen.g.jazz,C.listen.end].join('|')&&sits.length===1,J(said()));
    G=fresh('2025-10-17',15,ZID); E.player.seat=SEATS.find(s=>s.table==='listen'); H.picks=['拿去試聽']; await GG2.interact(GM,{gg2:ZID,kind:'corner_browse',genre:'citypop'});
    check('8 已經坐在試聽的高腳椅上：開始那一句（坐上高腳椅）、不再換位子、聽完不站起來',said()[1]===C.listen.start&&said()[2]===C.listen.g.citypop&&!sits.length&&!stands,J([said(),sits.length,stands]));
    G=fresh('2025-10-18',15,ZID); let n=0; for(let i=0;i<4;i++){ H.said=[]; await GG2.interact(GM,{gg2:ZID,kind:'corner_listen'}); if(H.said[H.said.length-1].t===C.listen.end) n++; }
    check('8 一天可以聽很多次（四次都聽得到、不扣錢）、次數記在 G.flags.CR_LISTEN',n===4&&G.money===5000&&G.flags.CR_LISTEN.n===4&&G.flags.CR_LISTEN.d===G.day,J(G.flags.CR_LISTEN));
    const seenG=new Set(); for(let i=0;i<6;i++){ GG2.rand=()=>i/6+0.01; H.said=[]; await GG2.crListen(GM,null); seenG.add(H.said[1].t); }
    check('8 沒有指定類型（試聽桌、唱片牆）：六種裡隨機一句',seenG.size===6&&[...seenG].every(t=>Object.values(C.listen.g).includes(t)),J([...seenG]));
    H.said=[]; H.picks=['拿去試聽']; GG2.rand=()=>0.5; await GG2.crBrowse(GM,'wall'); check('8 唱片牆選「拿去試聽」：六種裡的一句（唱片牆沒有自己那一句）',Object.values(C.listen.g).includes(H.said[2].t),J(said())); }
  // ---- 8 買唱片 ----
  { let G=fresh('2025-10-15',15,ZID); GG2.rand=()=>0; delete G.records; H.picks=['買這張']; await GG2.interact(GM,{gg2:ZID,kind:'corner_browse',genre:'indie'});
    check('8 翻搖滾選「買這張」（選項寫 150 元）：店員「這張嗎？……一百五。」→ 扣 150 → 買完一句（店員「這張的 B 面比較好聽。」）',J(pairs().slice(1))===J([[CL,'這張嗎？……一百五。'],[CL,'這張的 B 面比較好聽。']])&&G.money===4850&&H.opts[0].length===3,J([pairs(),G.money]));
    check('8 買了記在 G.records（舊存檔沒有這一欄＝從空的開始）：{genre, day}',Array.isArray(G.records)&&J(G.records)===J([{genre:'indie',day:G.day}]),J(G.records));
    GG2.rand=()=>0.99; H.said=[]; H.picks=['買這張']; await GG2.crBrowse(GM,'jazz');
    check('8 爵士：店員「這張兩百五。」→ 扣 250 → 骰到第二句（牛皮紙袋，旁白）；一次一張',pairs()[1][1]==='這張兩百五。'&&pairs()[2][0]===null&&pairs()[2][1]===C.bought[1][1]&&G.money===4600&&G.records.length===2&&G.records[1].genre==='jazz',J([pairs(),G.money]));
    H.said=[]; H.picks=['買這張']; await GG2.crBrowse(GM,'ost'); check('8 原聲帶也是 250',G.money===4350&&H.has('這張兩百五。'));
    H.said=[]; H.picks=['買這張']; await GG2.crBrowse(GM,'wall'); check('8 唱片牆的一張＝一般的 150',G.money===4200&&H.has('這張嗎？……一百五。')&&G.records[G.records.length-1].genre==='wall');
    G=fresh('2025-10-15',15,ZID); G.money=200; G.records=[{genre:'folk',day:1}]; H.picks=['買這張']; const r=await GG2.crBrowse(GM,'jazz');
    check('8 錢不夠（200 元買爵士）：店員講價錢 →「……下次再來帶走也可以，我先幫你放櫃台後面。」、不扣錢、不記（只是說，不保留）',r==='short'&&G.money===200&&G.records.length===1&&J(pairs().slice(1))===J([[CL,'這張兩百五。'],[CL,C.short]]),J([pairs(),G.money]));
    check('8 買唱片不動關係、不動旗標以外的東西（GM.rel 沒有呼叫）',relN===0);
    G=fresh('2025-10-15',15,ZID); H.picks=['先不用']; await GG2.interact(GM,{gg2:ZID,kind:'corner_shop'});
    check('8 櫃台（那一天第一次）：店員「找什麼類型？……沒有要找也可以，慢慢看。」→ 六箱（寫價錢）＋先不用；先不用＝不買',J(pairs())===J([[CL,C.asking]])&&J([...H.opts[0]])===J(['搖滾／Indie','民謠／Folk','電子／Electronic','爵士／Jazz','城市流行／City Pop','原聲帶／OST','先不用'])&&G.money===5000,J([pairs(),H.opts.map(o=>[...o])]));
    H.said=[]; H.picks=['原聲帶']; GG2.rand=()=>0; await GG2.interact(GM,{gg2:ZID,kind:'corner_shop'});
    check('8 櫃台（同一天第二次）：不再問、選原聲帶＝店員「這張兩百五。」、扣 250、記下來',!H.has(C.asking)&&H.has('這張兩百五。')&&G.money===4750&&G.records.length===1&&G.records[0].genre==='ost',J([said(),G.money])); }
  // ---- 8 看音響、坐下 ----
  { fresh('2025-10-15',15,ZID); GG2.rand=Math.random; const seen=new Set(); let rep=false, prev=null; for(let i=0;i<20;i++){ H.said=[]; await GG2.interact(GM,{gg2:ZID,kind:'corner_view'}); const t=H.said[0]&&H.said[0].t; if(t===prev) rep=true; prev=t; seen.add(t); }
    check('8 看音響：兩句隨機、同一句不連續出（旁白）',seen.size===2&&!rep&&[...seen].every(t=>C.look.corner_view.includes(t)));
    const c={}; for(const s of CORNER_LAYOUT.corner.seats){ const t=GG2.seatKind(ZID,s)||'none'; c[t]=(c[t]|0)+1; }
    check('8 坐下句照位子：高腳椅 2、沙發 2',J(c)===J({stool:2,sofa:2}),J(c));
    H.G.zone=ZID; H.said=[]; await STORY.onSeat(GM,{x:2.95,z:3.2,yaw:Math.PI/2}); check('8 坐上高腳椅（STORY.onSeat）：高腳椅那一句',J(said())===J([C.seat.stool]),J(said()));
    H.said=[]; await STORY.onSeat(GM,{x:-2.9,z:3.05,yaw:0.75}); check('8 坐沙發：沙發那一句',J(said())===J([C.seat.sofa]),J(said())); }
  // ---- 9 約會地點 ----
  { const G=fresh('2025-10-15',12,'campus'), P=INV.place(ZID), d=G.day;
    check('9 約會地點 corner_records（看電影、逛書店那一類、和頁間、山嵐同一把尺：reason、認識以上、一小時、記憶照逛書店）',!!P&&P.zone===ZID&&P.kind==='reason'&&P.minStage==='ACQUAINTANCE'&&P.stay===1&&P.memory==='BOOKSTORE_TOGETHER'&&J(INV.catsOf(P))===J(['fun'])&&P.name==='轉角唱片',J(P&&[P.kind,P.minStage,INV.catsOf(P)]));
    if(P){ const ok=h=>INV.slotOpen(G,P,d+1,h);
      check('9 13:00～20:00（約會在這段時間裡：13:00、19:00 開始可以；12:30、19:30 不行）',ok(13)&&ok(15.5)&&ok(19)&&!ok(12.5)&&!ok(19.5),J([13,15.5,19,12.5,19.5].map(ok)));
      { const G0=fresh('2025-10-15',12,'campus'); const a=!!P.show&&!P.show(G0); G0.visited=Object.assign({},G0.visited,{corner_records:true}); const b=P.show(G0); fresh('2025-10-15',12,'campus');
        check('9 和頁間、山嵐一樣：自己走進去過一次才列（show：G.visited.corner_records）',a&&b===true&&INV.place('bookstore').show&&!!INV.place('xs_shanlan').show,J([a,b])); }
      check('9 一起的時候照 AA_708 書店第 N 次的中途（invites3d.js S.actKind＝bookstore，和頁間、山嵐一樣）',INV.actKind({},P)==='bookstore'&&INV.actKind({},INV.place('bookstore'))==='bookstore');
      check('9 不是兩個人單獨（吃飯、散步）那一類：partnerBlock 不擋（和頁間一樣）',!(INVITE_DATA.soloKinds||[]).includes(P.kind)&&!INV.partnerBlock(fresh('2025-10-15',12,'campus',{dating_heroine_01:true}),'heroine_03',P));
      const ACC={heroine_01:'好。……我不太懂音樂，你不要笑。',heroine_02:'轉角唱片？好。我想找一張電影原聲帶。',heroine_03:'好。……我喜歡那間的味道。舊紙的味道。',heroine_04:'好！我要找遊戲配樂的靈感。',heroine_05:'好。……讀累了，聽一點音樂也好。',classmate_peishan:'好啊！我想找動畫的原聲帶！',kexin:'好啊。我想找一張老唱片。'};   /* 11-10 AA_731：答應句不寫週末（BUG-INV-ACC-TIME-1110）*/
      const bad=Object.keys(ACC).filter(id=>{ const o=INV.personal(G,id,P,d+1,15.5,{res:'accept'}); return !(o&&J(o.lines)===J([OE.fwd('invites',id,ACC[id])])); });
      check('9 約去轉角唱片答應：七位各自那一句（AA_725 第 8 節）',!bad.length,J(bad.map(id=>[id,(INV.personal(G,id,P,d+1,15.5,{res:'accept'})||{}).lines])));
      const o=INV.personal(G,'zhe',P,d+1,15.5,{res:'accept'}); check('9 沒列的人（阿哲）＝一般那句「唱片行？好啊。我沒去過。」',o&&J(o.lines)===J(['唱片行？好啊。我沒去過。']),J(o&&o.lines));   /* 有名字說的不加外面的「」（TEXT-QUOTE-UNIFY-1108 第三批，GG2.ACC0）*/
      check('9 可昕交往中：列得出來（有她自己的答應句）',!INV.kxPlaceOk||INV.kxPlaceOk(G,P));
      const SO=INVITE_DATA.seatOpen; check('9 坐下以後的開場句：轉角自己的兩則（byPlace）、一起聽那一則只在試聽的高腳椅；兩個人先找高腳椅（prefTable listen）',SO.byPlace[ZID]===ZID&&SO[ZID].length===2&&J(SO[ZID][1].onlyAt)===J({table:'listen'})&&P.prefTable==='listen');
      { fresh('2025-10-15',15,ZID); const R0=Math.random, PS0=E.player.seat; Math.random=()=>0.99; E.player.seat={x:2.95,z:3.2,yaw:Math.PI/2,table:'listen'}; await INV.seatOpenLines(GM,{who:'heroine_02'},{name:'林芷若'},P);
        const a=pairs(); H.said=[]; E.player.seat={x:-2.9,z:3.05,yaw:0.75,table:'lounge'}; await INV.seatOpenLines(GM,{who:'heroine_02'},{name:'林芷若'},P); const b=pairs(); Math.random=R0; E.player.seat=PS0;
        check('9 坐在試聽的高腳椅：抽得到「一起聽」那一則（旁白＋她一句）；坐沙發：只抽翻唱片那一則',J(a)===J([[null,'（試聽區有兩副耳機。她戴上一副，把另一副遞給你。）'],['林芷若','一起聽。']])&&J(b)===J([[null,'（她在唱片箱前面停下來，一張一張往後翻，翻得很慢。）'],['林芷若','你看，這張的封面好好看。']]),J([a,b])); } } }
  // ---- 10 逐字對照 AA_725 ----
  { const doc=gitShow(['94ab0865e','origin/claude/cool-heisenberg-o8kuqx'],AA725);
    if(!doc) console.log('SKIP 10 讀不到 AA_725（企劃線 bf5c3e6c6）');
    else { const out=[]; const T=t=>{ if(typeof t==='string') out.push(t); };
      C.door.forEach(T); Object.values(C.browse).forEach(a=>a.forEach(T)); C.browseOpts.forEach(T); T(C.listen.start); T(C.listen.stand); T(C.listen.again); Object.values(C.listen.g).forEach(T); T(C.listen.end);
      T(C.ask150); T(C.ask250); C.bought.forEach(b=>T(b[1])); T(C.short); T(C.asking); Object.values(C.look).forEach(a=>a.forEach(T)); Object.values(C.seat).forEach(T); T(C.sign); T(C.typhoon); T(GG2.ACC0[ZID]);
      Object.values(INVITE_DATA.cornerAcc||{}).forEach(T); [].concat(...INVITE_DATA.seatOpen[ZID]).forEach(T);
      const strip=t=>t.replace(/^「|」$/g,''), bad=out.filter(t=>!OE.inDoc('invites',null,t,t=>doc.indexOf(t)>=0||doc.indexOf(strip(t))>=0));
      check('10 台詞逐字在 AA_725 裡（'+out.length+' 句：進門、翻唱片、三個選項、試聽、買、錢不夠、櫃台、看音響、坐下、木門、颱風、答應、開場句；打烊是 AA_700 那一句）',!bad.length&&out.length>=50,J(bad));
      check('10 說話的人：稿上「店員：」的那幾句都是店員說；打烊照稿「店員：我們今天要打烊了。」',['這張嗎？……一百五。','這張的 B 面比較好聽。','……下次再來帶走也可以，我先幫你放櫃台後面。','找什麼類型？……沒有要找也可以，慢慢看。'].every(t=>doc.indexOf('店員：「'+t+'」')>=0)&&doc.indexOf('「這張兩百五。」')>=0&&doc.indexOf('店員：我們今天要打烊了。')>=0&&!/我們九點關門喔/.test(rd('src/gg2shops3d.js')));
      check('10 價錢照稿：一般 150、爵士和原聲帶 250',/一般 150；爵士、原聲帶 250/.test(doc)&&GG2.crPrice('indie')===150&&GG2.crPrice('folk')===150&&GG2.crPrice('jazz')===250&&GG2.crPrice('ost')===250&&GG2.crPrice('wall')===150); } }
};
run().then(()=>H.done(),e=>{ check('B 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); H.done(); });
}

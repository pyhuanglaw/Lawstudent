// 溫州街第一批 AA 的新室內接進遊戲（WZ-SHOPS1-1104／WZ-YIZHAN-1104）：小路（wz_teishoku，komichi v3）、SUNNY SIDE（wz_brunch，sunnyside v3）、一盞（wz_teahouse，yizhan v2＋LAWWW2 前院）
// ＋AA_655 第 7 節、AA_659 第 2 節（SUNNY SIDE）、第 3 節掛軸第 1 句——不需要瀏覽器（D131）。
//   A（遊戲真正的區域：zones3d.js 的 wzShop 照 WZ_SHOPS_LAYOUT 建，引擎真正的找路、移動 E.simWalk）：
//     A0 WZ_SHOPS_LAYOUT 的 teishoku／brunch 和 AA 的配置檔一模一樣；teahouse 除了前院打開改的幾樣（spawn、exit、yard、blocks、walkNote、work）以外一樣；sync 工具 --check 過
//     A1 正式模型登錄 bldg.wz_<店>_interior_v<版本>＝配置的 glb（檔案在）、LICENSES 一行；舊的 bldg.wz_*_interior 登錄不動
//     A2 座位：小路 22 個裡 21 個玩家能坐（(3.05,3.45) npcOnly：沒有按鈕、不在區域的座位）、tag corner 2／bar 6／door 1；SUNNY SIDE 14 個、sofa 2／bar 2／door 1／window 1；一盞 13 個、茶席六個跪坐（floor）
//     A3 每一個座位、互動點、出口從出生點走得到、按得到（按不到的列出來）；出口字「離開小路」「離開 SUNNY SIDE」「離開一盞」
//     A4 新的阻擋擋住：小路的隔板、卡座、中間四人桌；SUNNY SIDE 的長沙發、卡座桌、大理石小圓桌；一盞的甕、東南角盆栽、坐墊疊（AA v1b）
//     A5 走不出去的小孤島（tools/dev_scratch/nav_islands.py 的做法搬到 Node：canStand 0.1 m 取樣、連通區塊）：三間都沒有
//     A6 正式模型接上以後（假的 GLB：GLOW_* 空節點、窗景卡、材質名）：光暈合成一個網格、開燈切換；窗景卡晚上調暗；SUNNY SIDE 的 sns_bulb、一盞的 wzs_washi 網點透空
//     A7 SUNNY SIDE 店員讀配置的 clerk (2.6, −2.05, −0.6)（story3d.js）；打工站位 a／b／c、end 站得住、走得到
//   B（子程序，tests/pg_harness.js）：AA_655 第 7 節逐字（明軒 100、學姊點清酒、2:30 AM（店休）、七夕烤雞串、林家「今天的餛飩分你一半。」、備用招牌、可昕紅茶拿掉）；
//     AA_659 第 2 節（S.BRUNCH 六樣、看今日推薦固定那句＋照星期、舊存檔老樣子）、第 3 節掛軸第 1 句；店內偶遇阿哲「坐在吧檯」tag bar、SHOPENC.seatPick 挑 SUNNY SIDE 的高腳凳
// 修改前（開發分支 d432de8ba）：A0～A2、A6、A7 的主要檢查、B 全部 FAIL（區域還是舊的半熟、巷子裡定食、舊一盞）。
// 用法：node tests/wz_interiors_aa659_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8'), J=x=>JSON.stringify(x), r2=v=>+(+v).toFixed(2);
const git=(sha,f)=>{ try{ return cp.execFileSync('git',['-C',ROOT,'show',sha+':'+f],{encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const AA655='docs/story_planning/AA_655_溫州街第一批_改名規則與小路居酒屋菜單.md', AA659='docs/story_planning/AA_659_溫州街新室內_店內台詞.md';
if(process.argv[2]==='B') partB(); else partA();

function partA(){
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=rd('tests/nav_buildings_unit.js');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js'])];
const ord=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:4));
const pre=files.filter(f=>ord(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>ord(f)===4&&f!=='src/zones3d.js'));
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=rd(f); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
let FAKE=null; const pend=[]; ASSETS.loadOne=k=>{ if(FAKE&&FAKE[k]){ const p=Promise.resolve({scene:FAKE[k]()}); pend.push(p); return p; } return Promise.reject(new Error('no GLB in node')); };
global.GAME={G:{zone:'wenzhou',day:30,hour:15,flags:{},money:5000,weather:'clear'}};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius(); return {z,its:E.interactables.slice()}; }
const walk=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{dt}); if(!r.ok) return Object.assign({dt:r2(dt)},r); } return {ok:true}; };
function touchable(it,from){ const r=(it.radius||1.5)-0.05, P=E.player, c=[];
  for(let dz=-r;dz<=r+1e-6;dz+=0.1) for(let dx=-r;dx<=r+1e-6;dx+=0.1){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, z=it.z+dz; if(E.canStand(x,z,0.32,0)) c.push([d,x,z]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [,x,z] of c){ P.obj.position.set(x,0,z); if(E.nearestInteractable()!==it) continue; if(from&&!walk(from,[x,z]).ok) continue; return [r2(x),r2(z)]; } return null; }
const W=WZ_SHOPS_LAYOUT, req=f=>{ delete require.cache[require.resolve(path.join(ROOT,f))]; return require(path.join(ROOT,f)); };
const deq=(a,b)=>{ try{ require('assert').deepStrictEqual(a,b); return true; }catch(e){ return false; } };
// ---- A0 ----
const K=req('src/data/komichi_layout.js'), S=req('src/data/sunnyside_layout.js'), Y=req('src/data/yizhan_layout.js'), WN=req('src/data/wz_shops_layout.js');
check('A0 WZ_SHOPS_LAYOUT.teishoku＝AA komichi_layout.js v3（深度比較）',deq(WN.teishoku,K)&&K.version===3&&K.id==='wz_teishoku');
check('A0 WZ_SHOPS_LAYOUT.brunch＝AA sunnyside_layout.js v3（深度比較）',deq(WN.brunch,S)&&S.version===3&&S.id==='wz_brunch');
const OVER=['spawn','exit','yard','blocks','walkNote','work'], strip=o=>{ const c=Object.assign({},o); for(const k of OVER) delete c[k]; return c; };
check('A0 WZ_SHOPS_LAYOUT.teahouse＝AA yizhan_layout.js v2（前院打開改的 '+OVER.join('、')+' 以外一樣）',deq(strip(WN.teahouse),strip(Y))&&Y.version===2&&Y.id==='wz_teahouse');
{ let out=''; try{ out=cp.execFileSync('node',[path.join(ROOT,'tools/layout/sync_wz_aa_layouts.js'),'--check'],{encoding:'utf8'}); }catch(e){ out=String(e.stdout||e); } check('A0 tools/layout/sync_wz_aa_layouts.js --check：三筆和 AA 的檔一樣',/OK/.test(out),out.trim()); }
{ const T2=WN.teahouse, Yb=Y.blocks.map(b=>b.join(','));
  check('A0 一盞前院：出生點 (−3, 9.0)、出口 (−3, 9.3)、work.end (−3, 8.0)；AA 的最後兩塊阻擋拿掉、AA v1b 的三塊（甕、盆栽、坐墊疊）還在',J([T2.spawn.x,T2.spawn.z])===J([-3,9])&&J([T2.exit.at.x,T2.exit.at.z])===J([-3,9.3])&&J([T2.work.end.x,T2.work.end.z])===J([-3,8])&&!T2.blocks.some(b=>J(b)===J([0,7.9,8.4,3.4])||J(b)===J([-3.2,5.6,2,1.2]))&&['-1.8,4.55,0.5,0.5','3.85,4.55,0.6,0.6','-0.55,-0.95,0.6,0.65'].every(s=>Yb.includes(s)&&T2.blocks.some(b=>b.join(',')===s))&&!!T2.yard);
  check('A0 一盞：其他不能動的點照舊（enterAt (−20.5, 4.6)、回溫州街 (−20.5, 4.1)、打工 a／b／c）',J(T2.enterAt&&[T2.enterAt.x,T2.enterAt.z])===J([-20.5,4.6])&&J([T2.exit.spawn.x,T2.exit.spawn.z])===J([-20.5,4.1])&&deq(T2.work.a,Y.work.a)&&deq(T2.work.b,Y.work.b)&&deq(T2.work.c,Y.work.c)); }
// ---- 三間 ----
const SH={teishoku:{zone:'wz_teishoku',L:K,exit:'離開小路',ver:3,n:22,player:16,tags:{corner:2,bar:6,door:1}},
          brunch:{zone:'wz_brunch',L:S,exit:'離開 SUNNY SIDE',ver:3,n:14,player:14,tags:{sofa:2,bar:2,door:1,window:1}},
          teahouse:{zone:'wz_teahouse',L:Y,exit:'離開一盞',ver:2,n:13,player:13,tags:{}}};
const Zs={};
for(const [k,X] of Object.entries(SH)){ const R=loadZone(X.zone), z=R.z, its=R.its, L=W[k]; Zs[k]={z,its};
  const mk='bldg.wz_'+k+'_interior_v'+X.ver, man=ASSETS.manifest[mk];
  check('A1 '+L.name+'：正式模型登錄 '+mk+'＝'+X.L.glb+'（檔案在）；舊的 bldg.wz_'+k+'_interior 不動',!!man&&man.url===X.L.glb&&man.type==='building'&&fs.existsSync(path.join(ROOT,X.L.glb))&&(!ASSETS.manifest['bldg.wz_'+k+'_interior']||/second_ai\/wz_\w+_interior\.glb$/.test(ASSETS.manifest['bldg.wz_'+k+'_interior'].url)),J(man&&man.url));
  check('A1 '+L.name+'：LICENSES.md 有一行',rd('LICENSES.md').includes('`'+X.L.glb+'`'));
  const seatIts=its.filter(i=>i.seat&&i.shop===k), tagN={}; for(const q of z.seats) if(q.tag) tagN[q.tag]=(tagN[q.tag]|0)+1;
  const zN=L.seats.filter(s=>!s.npcOnly).length;   /* 區域的座位表：配置的 npcOnly 拿掉；玩家坐不進去的（zones3d.js WZ_AA_NOSIT）留著、標 npcOnly（偶遇、路人照坐）*/
  check('A2 '+L.name+'：配置 '+X.n+' 個座位、區域座位 '+zN+' 個、玩家能坐（有按鈕）'+X.player+' 個；tag '+J(X.tags),L.seats.length===X.n&&z.seats.length===zN&&z.seats.filter(q=>!q.npcOnly).length===X.player&&seatIts.length===X.player&&J(Object.keys(X.tags).sort().map(t=>[t,tagN[t]]))===J(Object.keys(X.tags).sort().map(t=>[t,X.tags[t]]))&&Object.keys(tagN).length===Object.keys(X.tags).length,J({n:L.seats.length,z:z.seats.length,btn:seatIts.length,tagN}));
  const sp=[z.spawn.x,z.spawn.z]; check('A3 '+L.name+'：出生點站得住',E.canStand(sp[0],sp[1],0.32,0),J(sp));
  const ex=its.find(i=>i.exit&&i.exit.to==='wenzhou'); const tp=ex&&touchable(ex,sp);
  check('A3 '+L.name+'：出口「'+X.exit+'」按得到、從出生點走得到',!!ex&&ex.label===X.exit&&!!tp,J(ex&&[ex.label,ex.x,ex.z]));
  const bad=[]; for(const it of its.filter(i=>(i.seat&&i.shop===k)||i.wzShop===k)) if(!touchable(it,sp)) bad.push((it.label||it.kind)+'@'+r2(it.x)+','+r2(it.z));
  check('A3 '+L.name+'：每個座位、互動點都按得到、從出生點走得到（'+its.filter(i=>(i.seat&&i.shop===k)||i.wzShop===k).length+' 個）',!bad.length,bad.join(' '));
  // A5 孤島
  { const n=z.nav, a=n.toWorld(0,0), b=n.toWorld(n.cols-1,n.rows-1), minx=Math.min(a[0],b[0]), maxx=Math.max(a[0],b[0]), minz=Math.min(a[1],b[1]), maxz=Math.max(a[1],b[1]), h=0.1;
    const Wd=Math.floor((maxx-minx)/h)+1, Hd=Math.floor((maxz-minz)/h)+1, St=new Uint8Array(Wd*Hd), lab=new Int32Array(Wd*Hd).fill(-1), comps=[];
    for(let j=0;j<Hd;j++) for(let i=0;i<Wd;i++) St[j*Wd+i]=E.canStand(minx+i*h,minz+j*h,0.3,0)?1:0;
    for(let s0=0;s0<Wd*Hd;s0++){ if(!St[s0]||lab[s0]>=0) continue; const q=[s0]; lab[s0]=comps.length; let cnt=0, sx=0, sz=0;
      while(q.length){ const c=q.pop(); cnt++; const ci=c%Wd, cj=(c/Wd)|0; sx+=ci; sz+=cj; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ni=ci+di, nj=cj+dj; if(ni<0||nj<0||ni>=Wd||nj>=Hd) continue; const t=nj*Wd+ni; if(St[t]&&lab[t]<0){ lab[t]=comps.length; q.push(t); } } }
      comps.push({m2:r2(cnt*h*h),x:r2(minx+sx/cnt*h),z:r2(minz+sz/cnt*h)}); }
    comps.sort((p,q)=>q.m2-p.m2); const isl=comps.slice(1);
    check('A5 '+L.name+'：沒有走不出去的小孤島（canStand 0.1 m 取樣，主要區域 '+(comps[0]?comps[0].m2:0)+' m²）',!isl.length,J(isl.slice(0,8))); } }
// A2 細項
{ const R0=loadZone('wz_teishoku'), z=R0.z, its=R0.its; const np=K.seats.filter(s=>s.npcOnly);
  check('A2 小路：(3.05, 3.45) 是配置唯一的 npcOnly；不在區域的座位、沒有「坐下」按鈕',np.length===1&&np[0].x===3.05&&np[0].z===3.45&&!z.seats.some(q=>Math.hypot(q.x-3.05,q.z-3.45)<0.05)&&!its.some(i=>i.seat&&Math.hypot(i.seat.x-3.05,i.seat.z-3.45)<0.05));
  const bar=its.filter(i=>i.seat&&i.label==='坐吧台'), booth=its.filter(i=>i.seat&&i.label==='坐卡座');
  check('A2 小路：吧台六張「坐吧台」（lift 0.27）',bar.length===6&&bar.every(i=>i.seat.lift===0.27));
  const NS=[[-0.15,3.45],[1.1,3.45],[1.8,3.45],[-3.6,0.1],[-3.6,0.7]], nsZ=NS.map(p=>z.seats.find(q=>Math.hypot(q.x-p[0],q.z-p[1])<0.01));
  check('A2 小路：玩家坐不進去的五張（窗邊隔板座靠窗三張、西牆卡座兩張；導航格 0.2 m 量到隔板以後）沒有按鈕、在區域座位表標 npcOnly（卡座照舊 tag corner）',booth.length===0&&nsZ.every(q=>q&&q.npcOnly)&&!its.some(i=>i.seat&&NS.some(p=>Math.hypot(i.seat.x-p[0],i.seat.z-p[1])<0.01))&&nsZ.slice(3).every(q=>q.tag==='corner'),J(nsZ));
  check('A2 小路：導航格 0.2 m（0.1 m 厚的玻璃隔板擋得住：隔板上每一點都站不住）',z.nav.cell===0.2&&[-0.5,1.45,3.4].every(x=>[2.6,3.0,3.4,3.8].every(zz=>!E.canStand(x,zz,0.05,0))),J(z.nav.cell||z.nav.cs)); }
{ const its=Zs.brunch.its, bar=its.filter(i=>i.seat&&i.label==='坐吧台'); check('A2 SUNNY SIDE：出餐檯兩張「坐吧台」（lift 0.27，tag bar）',bar.length===2&&bar.every(i=>i.seat.lift===0.27)&&Zs.brunch.z.seats.filter(q=>q.tag==='bar').every(q=>q.lift===0.27)); }
{ const z=Zs.teahouse.z, fl=z.seats.filter(q=>q.floor===0.08); check('A2 一盞：茶席六個、緣側兩個、和室四個跪坐（floor 0.08）；水屋旁木凳 (3.05, 3.35) 是椅子',fl.length===12&&z.seats.some(q=>q.x===3.05&&q.z===3.35&&!q.floor),fl.length+''); }
// A4 阻擋
{ const blk=(k,pts)=>{ loadZone(SH[k].zone); return pts.filter(p=>E.canStand(p[0],p[1],0.1,0)); };
  const t=blk('teishoku',[[-0.5,3.2],[1.45,3.2],[3.4,3.2],[-3.725,0.4],[-2.55,0.4],[0.9,0.75],[0.475,3.25]]); check('A4 小路：隔板三道、卡座、卡座桌、中間四人桌、窗邊座一的桌子擋住',!t.length,J(t));
  const s=blk('brunch',[[-2.975,-0.1],[-1.575,-0.85],[-1.575,0.65],[2.35,2.75],[-2.1,3.3],[-0.3,1.0]]); check('A4 SUNNY SIDE：長沙發、卡座桌兩張、大理石小圓桌兩張、中間方桌擋住',!s.length,J(s));
  const y=blk('teahouse',[[-1.8,4.55],[3.85,4.55],[-0.55,-0.95],[-1.6,1.7],[3.75,1.3]]); check('A4 一盞：甕、東南角盆栽、坐墊疊、茶席矮桌、水屋擋住',!y.length,J(y)); }
// A7 店員、打工
{ const c=S.clerk; check('A7 SUNNY SIDE 店員：配置 clerk (2.6, −2.05, −0.6)；story3d.js 讀 WZ_SHOPS_LAYOUT.brunch.clerk',!!c&&c.x===2.6&&c.z===-2.05&&c.yaw===-0.6&&/zoneId==='wz_brunch'\)\{ const LC=typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT\.brunch&&WZ_SHOPS_LAYOUT\.brunch\.clerk; if\(LC\) clerk\(LC\.x,LC\.z,LC\.yaw,46\)/.test(rd('src/story3d.js')));
  for(const k of ['brunch','teahouse']){ const R=loadZone(SH[k].zone), L=W[k], sp=[R.z.spawn.x,R.z.spawn.z], bad=[];
    for(const ph of ['a','b','c']) { const p=L.work[ph]&&L.work[ph].me; if(!p) continue; if(!E.canStand(p.x,p.z,0.3,0)||!walk(sp,[p.x,p.z]).ok) bad.push(ph+'.me'); }   /* 老闆、同事是 NPC（直接放、不走路；廚房裡的點照舊，和 tests/wz_work_spots_unit.js 一樣只查祐廷的）*/
    const e=L.work.end; if(!E.canStand(e.x,e.z,0.3,0)||!walk(sp,[e.x,e.z]).ok) bad.push('end');
    check('A7 '+L.name+'：打工祐廷的站位（a／b／c）與下班的點站得住、從出生點走得到',!bad.length,bad.join(' ')); } }
// A6 正式模型接上（假的 GLB）
(async()=>{
  const mkScene=(mats,glows,views)=>()=>{ const g=new THREE.Group(); for(const nm of mats){ const me=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),new THREE.MeshStandardMaterial({name:nm})); me.name=nm; g.add(me); }
    for(const [nm,y] of glows){ const o=new THREE.Object3D(); o.name=nm; o.position.set(0,y,0); o.userData={glow:'rgba(255,206,150,1)',size:0.6,day:0,night:0.6}; g.add(o); }
    for(const nm of views){ const me=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshStandardMaterial({name:'view_'+nm,emissive:0xffffff,emissiveIntensity:1})); me.name=nm; me.userData.dir=[0,0,-1]; g.add(me); } return g; };
  FAKE={'bldg.wz_brunch_interior_v3':mkScene(['sns_bulb','sns_vcm','sns_wall_cream'],[['GLOW_pendant_10',2],['GLOW_pendant_11',2],['GLOW_spot_1',2.5]],['WALL_front_VIEW_sns_window_view','WALL_right_VIEW_sns_window_view']),
        'bldg.wz_teishoku_interior_v3':mkScene(['kmc_bulb','kmc_vcm'],[['GLOW_washi_1',2.3],['GLOW_pendant_10',1.9]],['WALL_front_VIEW_kmc_window_view']),
        'bldg.wz_teahouse_interior_v2':mkScene(['wzs_washi','wzs_pendant','yzn_vc'],[['GLOW_washi_4',2.1],['GLOW_andon_1',1]],[])};
  for(const k of ['brunch','teishoku','teahouse']){ pend.length=0; const R=loadZone(SH[k].zone), z=R.z; await Promise.all(pend); await new Promise(r=>setTimeout(r,0));
    const L=W[k], glow=z.group.getObjectByName('wz_'+k+'_glows'), nG=FAKE['bldg.wz_'+k+'_interior_v'+SH[k].ver]().children.filter(o=>o.userData&&o.userData.glow).length;
    let tog=null; if(glow&&z.onLamps){ z.onLamps(true); const on=glow.material.emissiveIntensity; z.onLamps(false); tog=[on,glow.material.emissiveIntensity]; }
    check('A6 '+L.name+'：正式模型接上（z.formal）、GLOW_* '+nG+' 個合成一個網格、開燈 1／關燈 0',!!z.formal&&z.aaGlows===nG&&!!glow&&J(tog)===J([1,0]),J({formal:!!z.formal,n:z.aaGlows,tog}));
    const views=[]; z.group.traverse(o=>{ if(o.isMesh&&/VIEW/.test(o.name)) views.push(o); });
    if(views.length){ z.applyTime(21,'clear'); const n=views.map(o=>r2(o.material.color.r)); z.applyTime(12,'clear'); const d=views.map(o=>r2(o.material.color.r)); check('A6 '+L.name+'：窗景卡晚上調暗（21:00 0.18、12:00 1）',n.every(v=>v===0.18)&&d.every(v=>v===1),J({n,d})); }
    const st=[]; z.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.userData.seeThrough) st.push(o.material.name); });
    const want={brunch:['sns_bulb'],teishoku:[],teahouse:['wzs_washi','wzs_pendant']}[k];
    check('A6 '+L.name+'：網點透空的材質 '+J(want)+'（AA 新模型的前綴 sns／kmc／yzn 照去掉前綴比；SUNNY SIDE 的吊燈罩沒有自己的材質，等 LAWWW2）',J(st.sort())===J(want.slice().sort()),J(st)); }
  FAKE=null;
  console.log(fails?('FAILED '+fails):'ALL PASS'); const r=cp.spawnSync('node',[__filename,'B'],{encoding:'utf8',maxBuffer:1<<26}); process.stdout.write(r.stdout||''); process.stderr.write(r.stderr||''); process.exit(fails||r.status?1:0);
})().catch(e=>{ console.log('FAIL A 例外 '+String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); process.exit(1); });
}

function partB(){
const H=require('./pg_harness.js'); const {check}=H; console.warn=()=>{};
for(const f of ['src/data/shop_enc.js','src/shopenc3d.js','src/wzshops3d.js','src/data/food_fav_lines.js']){ let src=rd(f); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const D655=git('10020abda',AA655)||git('origin/claude/story-planning',AA655), D659=git('21beb9d12',AA659)||git('origin/claude/story-planning',AA659);
const s7=D655?D655.slice(D655.indexOf('## 7.')):'', s2=D659?D659.slice(D659.indexOf('## 2. SUNNY SIDE'),D659.indexOf('## 3.')):'', s3=D659?D659.slice(D659.indexOf('## 3.')):'';
if(!D655||!D659) console.log('SKIP B 讀不到 AA_655／AA_659（企劃線沒 fetch）：逐字對照略過');
// AA_655 第 7 節
const st=rd('src/story3d.js'), r2y=rd('src/r2y3b3d.js'), qx=rd('src/data/sis_qixi_events.js'), zs=rd('src/zones3d.js'), tk=rd('src/townkit3d.js');
check('B AA_655 §7-2 明軒「小碗乾麵＋貢丸湯」價錢 100（原本 70）',st.includes("['林家乾麵（溫州街）','小碗乾麵＋貢丸湯','100',")&&!st.includes("'小碗乾麵＋貢丸湯','70'")&&(!s7||s7.includes('改成 **100**')));
const SAKE='（學姊點了一合清酒。「一杯就好。」）';
check('B AA_655 §7-3 學姊點清酒那一句逐字',WZS.WITH_SIS_SAKE===SAKE&&(!s7||s7.includes('「'+SAKE+'」')));
{ const G=H.fresh('2026-10-14',19,'wz_teishoku',{}); const GM={G}; global.EAT=global.EAT||{}; const keep=EAT.lastTog;
  EAT.lastTog={key:'巷子裡定食',id:'heroine_05',day:G.day}; const a=WZS.withOrder(GM,'teishoku'); EAT.lastTog={key:'巷子裡定食',id:'zhe',day:G.day}; const b=WZS.withOrder(GM,'teishoku'); EAT.lastTog=keep;
  check('B 小路：學姊一起吃＝「（學姊點了一合清酒。「一杯就好。」）」（不說兩次）；阿哲照共用那一句「（{人}點了生啤酒。）」',a===SAKE&&/^（.+點了生啤酒。）$/.test(b||''),J([a,b])); }
check('B AA_655 §7-5 r2y3b3d：place「2:30 AM（店休）」、title「和芷若：2:30 AM（店休）」',r2y.includes("place:'2:30 AM（店休）',title:'和芷若：2:30 AM（店休）',")&&!r2y.includes("place:'兩點半（店休）'")&&(!s7||s7.includes("`'2:30 AM（店休）'`")));
check('B AA_655 §7 七夕選項「烤雞串。」（原本「薑汁燒肉。」）；後面沒有寫到薑汁燒肉',qx.includes("{text:'「烤雞串。」',goto:'a_pork'}")&&!/薑汁燒肉/.test(qx)&&(!s7||s7.includes('改成「烤雞串。」')));
{ const row=SHOP_ENC.rows.find(r=>r.who==='heroine_05'&&r.spot==='wz_lin'); const dt=row&&row.lines&&row.lines.dating||[];
  check('B AA_655 §7 學姊林家交往版「今天的餛飩分你一半。」（shop_enc.js 由匯入工具照第 7 節改；沒有「魚分你一半」）',dt.some(x=>x.includes('今天的餛飩分你一半。'))&&!JSON.stringify(SHOP_ENC).includes('魚分你一半')&&(!s7||s7.includes('改成「今天的餛飩分你一半。」')),J(dt)); }
check('B AA_655 §7 備用招牌：小路 sub「居酒屋」、直招牌「酒処」、townkit 櫥窗「本日のおすすめ　焼き鳥・だし巻き玉子」',/shop:\{type:'teishoku',name:'小路',sub:'居酒屋',[^}]*vertical:'酒処'/.test(zs)&&tk.includes("'本日のおすすめ　焼き鳥・だし巻き玉子'")&&!tk.includes('本日定食　鯖魚・豚汁')&&(!s7||['「居酒屋」','「酒処」','「本日のおすすめ　焼き鳥・だし巻き玉子」'].every(t=>s7.includes(t))));
check('B AA_655 §7 可昕「紅茶。……也可以。」拿掉（紅茶是選對的那一樣，用不到）',!rd('src/data/food_fav_lines.js').includes('紅茶。……也可以。')&&!FOOD_FAV_LINES.kexin.wrong['紅茶']&&!!FOOD_FAV_LINES.kexin.wrong['奶茶']);
// AA_659 第 2 節
const B=WZS.BRUNCH, rows=[...(s2.matchAll(/^\| (\S+) \| (\d+) \| (.+?) \|$/mg))].map(m=>[m[1],+m[2],m[3]]).filter(r=>r[0]!=='品項');
check('B AA_659 §2 S.BRUNCH 六樣（品項、價錢、吃完的旁白逐字）',B.length===6&&(!s2||J(B)===J(rows)),J(B.map(x=>x[0])));
const day=wd=>{ for(let d=1;d<40;d++) if(CALENDAR.dateOf(d).wd===wd) return d; };
const lines=wd=>{ const G=H.fresh('2026-10-14',10,'wz_brunch',{}); G.day=day(wd); return WZS.boardLines(G); };
const HEAD='（深綠色的菜單板最下面，用粉筆多寫了一行：）';
const want={2:'今日推薦：班尼迪克蛋。蛋是三分四十秒，不是三分半。',3:'今日推薦：班尼迪克蛋。蛋是三分四十秒，不是三分半。',4:'今日推薦：法式火腿起司三明治。上面那顆蛋，老闆娘說要「看得到太陽」。',5:'今日推薦：法式火腿起司三明治。上面那顆蛋，老闆娘說要「看得到太陽」。',6:'今日推薦：法式吐司。週末，甜一點也沒關係。'};
const got={}; for(const wd of [2,3,4,5,6,7]) got[wd]=lines(wd);
check('B AA_659 §2 看今日推薦：先說固定那句，再說當天的推薦（週二～週六）',Object.entries(want).every(([wd,t])=>J(got[wd])===J([HEAD,t]))&&(!s2||[HEAD.slice(1,-1)].concat(Object.values(want)).every(t=>s2.includes(t))),J(got));
check('B AA_659 §2 週日：老闆娘決定＋小字',J(got[7])===J([HEAD,'今日推薦：老闆娘決定。','（下面一行小字：她今天心情很好。）'])&&(!s2||s2.includes('今日推薦：老闆娘決定。（下面一行小字：她今天心情很好。）')));
check('B AA_659 §2 舊存檔「半熟蛋吐司套餐」的老樣子對到班尼迪克蛋',WZS.BRUNCH_OLD['半熟蛋吐司套餐']==='班尼迪克蛋'&&/R\.last\['溫州街・半熟'\]=S\.BRUNCH_OLD\[l\]/.test(rd('src/wzshops3d.js')));
check('B AA_659 §3 掛軸第 1 句換成水墨山水、第 2 句照舊',WZS.TOKONOMA[0]==='（掛軸上是一幅淡淡的山水。山很遠，前面一條小路，路上沒有人。）'&&WZS.TOKONOMA[1]==='下面的花器插著一枝花，看起來是院子剪的。床之間不放東西，也不坐人。'&&(!s3||s3.includes(WZS.TOKONOMA[0])));
// 店內偶遇：阿哲坐在吧檯
{ const row=SHOP_ENC.rows.find(r=>r.who==='zhe'&&r.spot==='wz_brunch');
  check('B shop_enc.js：阿哲 SUNNY SIDE 那一列（「他坐在吧檯」）tag bar（匯入工具照 AA_659 §2 加的）',!!row&&row.tag==='bar'&&/坐在吧檯/.test(row.why)&&/r\['tag'\] = 'bar'/.test(rd('tools/shop_enc/import_shop_enc.py'))&&(!s2||s2.includes('「阿哲坐在吧檯，面前三個空盤子」就挑這兩張')));
  const L=require(path.join(ROOT,'src/data/sunnyside_layout.js')), seats=L.seats.filter(s=>!s.npcOnly).map(s=>Object.assign({},s));
  const fake={G:H.fresh('2026-10-14',10,'wz_brunch',{}),E:{zone:{seats},npcs:[],interactables:[]}};
  const p=SHOPENC.seatPick(fake,'wz_brunch',row); check('B SHOPENC.seatPick：阿哲挑出餐檯的高腳凳（tag bar）',!!p&&p.tag==='bar'&&p.kind==='stool',J(p)); }
H.done();
}

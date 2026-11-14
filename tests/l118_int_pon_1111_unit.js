// 118 巷新室內三間：奈良咖哩（omu）、迪倫窯烤披薩（noodle2）、義大麵屋（pasta）——L118-SHOPS-REDO-1111（USER_WANTS X338；使用者 2026-11-11 換店＋參考圖）。
// 室內由 tools/blender/env_second/l118_int_<id>.py 產生（LAWWW 的 Blender 子代理臨時代 LAWWW2 做）。不用瀏覽器；這是模擬，不是真實玩家流程（D131）。
//   A 配置（src/data/l118_shop_layouts.js）：店名＝店家資料的新店名；座位數；至少一張四人桌（同一個 table 值 ≥ 4 個座位；午餐邀約最多四個人坐同一桌）；
//     店員、點餐在界內；「看東西」只有一個，note＝AA_772 look_lines 那一句（舊的 look 點拿掉）；匯出時的導航檢查（navcheck.problems）是空的；
//     離走道遠的座位（r）走近點 ap 在互動半徑裡。
//   B 模型（GLB）：天花板材質單面；樑、吊燈、管線在 CEIL_*（鏡頭高過天花板時 zones3d.js ceilHide 一起藏）；迪倫的窯火是 GLOW_ 材質；
//     檔案大小在重做前那一間的 1.5 倍以內（重做前：omu 1310256、noodle2 1202232、pasta 1518072 bytes）。
//   C 不卡人（汀州鮮果 BUG-XIANGUO-TRAP-1111 的教訓；做法同 tests/tz_shops_notrap_1111_unit.js）：在 Node 建出遊戲真正的區域，從進門的位置用 E.canStand（玩家半徑 0.32）
//     每 0.25 m 掃出所有站得到的點，每一個點都用引擎的找路＋移動碰撞（E.simWalk，兩種幀率）走回「離開」的互動半徑裡；
//     每張椅子的走近點（ap）站得住、從進門的位置走得到。
// 用法：node tests/l118_int_pon_1111_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
process.on('unhandledRejection',()=>{});
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/lane118_shops.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|LANE118_SHOPS|L118_SHOP_LAYOUTS|L118S|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
/* 每間：座位數、AA_772 look_lines（企劃線 docs/story_planning/AA_772_l118_shops_redo_fix.json）的那一句和放在哪樣東西上、重做前的 GLB 大小、一定要有的 GLOW_ 材質 */
const WANT={
  omu:{name:'奈良咖哩',seats:20,look:['curry_photos','（牆上的照片都是咖哩飯。每一張的福神漬都放在同一個位置。）'],old:1310256,glow:[]},
  noodle2:{name:'迪倫窯烤披薩',seats:10,look:['oven','（窯裡的火是橘色的。站近一點，臉會熱。）'],old:1202232,glow:['GLOW_l118_noodle2_fire']},
  pasta:{name:'義大麵屋',seats:21,look:['open_kitchen','（鍋子一翻，蒜的味道飄到吧檯這一邊。）'],old:1518072,glow:[]},
};
const ONLY=process.argv[2]?process.argv[2].split(','):Object.keys(WANT);
const DONE=id=>{ const L=L118_SHOP_LAYOUTS[id]; return !!L&&/l118_int_/.test(L.src||''); };   /* 還沒重做的那一間（配置的 src 不是 l118_int_*.py）＝FAIL，不是跳過 */
function glb(rel){ const b=fs.readFileSync(path.join(ROOT,rel)), n=b.readUInt32LE(12); return {j:JSON.parse(b.slice(20,20+n).toString('utf8')),bytes:b.length}; }
const STEP=0.25, R=0.32;
for(const id of ONLY){ const W=WANT[id], L=L118_SHOP_LAYOUTS[id], tag=W.name+'（'+id+'）';
  check(tag+'：室內是新做的（配置的 src 是 l118_int_'+id+'.py）',DONE(id),L&&L.src); if(!DONE(id)) continue;
  const B=L.bounds, inB=q=>q&&q.x>B.x0&&q.x<B.x1&&q.z>B.z0&&q.z<B.z1, data=LANE118_SHOPS.shops.find(s=>s.id===id);
  // A
  /* 配置的 name／type 照舊是換店以前的（遊戲靠它把街上招牌的舊字、按鈕上的店名換成店家資料的新店名：zones3d.js ud118、l118_shops3d.js reName）；玩家看到的區域名稱是新店名 */
  check(tag+'：A 區域名稱是店家資料的新店名（配置的 name 是換店以前的或新的都可以）',!!data&&data.name===W.name&&Z3.ZONES['l118_'+id].name===W.name+'（118 巷）',Z3.ZONES['l118_'+id].name+'　配置記的：'+L.name+'／'+L.type);
  check(tag+'：A 寬、深、門的位置和重做前一樣（街上的門口不變）',JSON.stringify([B.x1-B.x0,B.z1-B.z0,L.door.x])===JSON.stringify({omu:[6.6,8,-2.2],noodle2:[6.6,8.5,1.6],pasta:[7.6,8.5,-2.6]}[id]),JSON.stringify([B.x1-B.x0,B.z1-B.z0,L.door.x]));
  if(W.seats!=null) check(tag+'：A 座位 '+W.seats+' 個',L.seats.length===W.seats,String(L.seats.length));
  const byT={}; for(const s of L.seats){ const k=s.table.join(','); (byT[k]=byT[k]||[]).push(s); }
  const four=Object.entries(byT).filter(([k,a])=>a.length>=4&&!a.some(s=>s.lift)); check(tag+'：A 至少一張四人桌（同一個 table 值 ≥ 4 個座位，不算吧台）',four.length>=1,Object.entries(byT).map(([k,a])=>k+'×'+a.length).join('　'));
  check(tag+'：A 四人桌的四個位子圍著同一張桌子（離桌子中心 ≤ 1.1 m）',four.every(([k,a])=>{ const [tx,tz]=k.split(',').map(Number); return a.every(s=>Math.hypot(s.x-tx,s.z-tz)<=1.1); }));
  check(tag+'：A 店員、點餐在界內；有「離開」',inB(L.clerk)&&inB(L.order)&&L.exits.length===1&&L.order.r>=0.7,JSON.stringify([L.clerk.x,L.clerk.z,L.order.x,L.order.z]));
  check(tag+'：A 「看東西」只有一個：'+W.look[0]+'，note＝AA_772 look_lines 那一句',L.interact.length===1&&L.interact[0].id===W.look[0]&&L.interact[0].note===W.look[1]&&L118S.lookText(id,L.interact[0])===W.look[1],JSON.stringify(L.interact.map(q=>[q.id,q.note])));
  const lj=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/l118_'+id+'.layout.json'),'utf8'));
  check(tag+'：A 匯出時的導航檢查沒有問題（navcheck.problems 空的、有做縫的檢查）',lj.navcheck&&Array.isArray(lj.navcheck.problems)&&lj.navcheck.problems.length===0&&!!lj.navcheck.trap_check,JSON.stringify(lj.navcheck&&lj.navcheck.problems));
  const farBad=L.seats.filter(s=>s.r&&!(s.i&&!s.ap)&&(!s.ap||Math.hypot(s.ap[0]-(s.i?s.i[0]:s.x),s.ap[1]-(s.i?s.i[1]:s.z))>s.r-0.05));   /* L118-IT-REACH-1111 收尾（11-12）：配置寫了按鈕位置 i 的，半徑從按鈕量（不是從椅子）*/   /* 有 i 沒有 ap＝外側那張：按鈕就在走道上，走近點照遊戲預設 */ check(tag+'：A 離走道遠的座位（寫了 r）：走近點 ap 在互動半徑裡',farBad.length===0,JSON.stringify(farBad.map(s=>[s.x,s.z,s.r,s.ap])));
  const lifts=L.seats.filter(s=>s.lift); check(tag+'：A 吧台高腳椅的 lift 都是 0.29（座面 0.76 − 0.47）',lifts.every(s=>Math.abs(s.lift-0.29)<1e-6),lifts.length+' 個');
  // B
  const G=glb('assets/models/env/second_ai/l118_'+id+'.glb'), mats=G.j.materials, nodes=G.j.nodes.map(n=>n.name||'');
  const ceil=mats.filter(m=>/ceiling$/.test(m.name)); check(tag+'：B 天花板材質單面（'+ceil.map(m=>m.name).join('、')+'）',ceil.length>=1&&ceil.every(m=>!m.doubleSided));
  check(tag+'：B 樑、吊燈、管線在 CEIL_fix／CEIL_bulbs（ceilHide）',nodes.includes('CEIL_fix')&&nodes.includes('CEIL_bulbs'),nodes.filter(n=>/^CEIL_/.test(n)).join('、'));
  check(tag+'：B 發光材質（GLOW_）'+(W.glow.length?'：'+W.glow.join('、'):''),mats.some(m=>/^GLOW_/.test(m.name))&&W.glow.every(g=>mats.some(m=>m.name===g)),mats.filter(m=>/^GLOW_/.test(m.name)).map(m=>m.name).join('、'));
  check(tag+'：B 牆分四組 WALL_N／W／E／S、兩側鄰居店面卡',['WALL_N_','WALL_W_','WALL_E_','WALL_S_'].every(p=>nodes.some(n=>n.startsWith(p)))&&nodes.includes('WALL_W_nb_view')&&nodes.includes('WALL_E_nb_view'));
  check(tag+'：B GLB 大小在重做前的 1.5 倍以內',G.bytes<=W.old*1.5,G.bytes+' bytes（重做前 '+W.old+'，'+(G.bytes/W.old).toFixed(2)+' 倍）');
  // C
  const z=loadZone('l118_'+id), nav=z.nav, sp=z.spawn, ex=E.interactables.find(i=>i.exit);
  const X0=nav.ox, Z0=nav.oz, Wd=nav.cols*nav.cell, D=nav.rows*nav.cell, key=(i,j)=>i+','+j;
  const ok=(i,j)=>{ const x=X0+i*STEP, zz=Z0+j*STEP; return x>X0&&zz>Z0&&x<X0+Wd&&zz<Z0+D&&E.canStand(x,zz,R,0); };
  const si=Math.round((sp.x-X0)/STEP), sj=Math.round((sp.z-Z0)/STEP); let start=null;
  for(let d=0;d<4&&!start;d++) for(let a=-d;a<=d&&!start;a++) for(let b=-d;b<=d&&!start;b++) if(ok(si+a,sj+b)) start=[si+a,sj+b];
  if(!start||!ex){ check(tag+'：C 進門的位置站得住、有「離開」',false,JSON.stringify([sp,ex&&ex.label])); continue; }
  const seen=new Set([key(...start)]), q=[start]; while(q.length){ const [i,j]=q.pop(); for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const k=key(i+a,j+b); if(!seen.has(k)&&ok(i+a,j+b)){ seen.add(k); q.push([i+a,j+b]); } } }
  const pts=[...seen].map(k=>k.split(',').map(Number)).map(([i,j])=>[+(X0+i*STEP).toFixed(2),+(Z0+j*STEP).toFixed(2)]);
  const bad=[]; for(const p of pts) for(const dt of [0.1,0.033]){ const r=E.simWalk(p[0],p[1],ex.x,ex.z,{lv0:0,lv1:0,dt,speed:1.45}); const end=r&&r.x!=null?[r.x,r.z]:(r&&r.ok?[ex.x,ex.z]:null);
    if(!end||Math.hypot(end[0]-ex.x,end[1]-ex.z)>ex.radius+1e-6){ bad.push([p[0],p[1],dt,end&&end.map(v=>+v.toFixed(2)),r&&r.reason]); break; } }
  check(tag+'：C 站得到的 '+pts.length+' 個點（每 '+STEP+' m）都走得回「'+ex.label+'」的半徑裡（走路、30 fps 和 10 fps）',pts.length>40&&!bad.length,bad.length+' 個出不來：'+JSON.stringify(bad.slice(0,6)));
  check(tag+'：C 「離開」的按鈕是新店名',ex.label==='離開'+W.name,ex.label);
  const apBad=[]; for(const s of L.seats){ const ap=s.ap||[s.x+Math.sin(s.yaw)*0.5,s.z+Math.cos(s.yaw)*0.5]; if(!E.canStand(ap[0],ap[1],0.3,0)){ apBad.push([s.x,s.z,'站不住']); continue; }
    const r=E.simWalk(sp.x,sp.z,ap[0],ap[1],{lv0:0,lv1:0,dt:0.033,speed:1.45}), end=r&&r.x!=null?[r.x,r.z]:(r&&r.ok?ap:null); if(s.ap&&(!end||Math.hypot(end[0]-ap[0],end[1]-ap[1])>0.45)) apBad.push([s.x,s.z,'走不到',end&&end.map(v=>+v.toFixed(2))]); }
  check(tag+'：C 每張椅子的走近點站得住、從進門的位置走得到',apBad.length===0,JSON.stringify(apBad.slice(0,6)));
  const itO=E.interactables.find(i=>i.shop118===id), itL=E.interactables.find(i=>i.look);
  const near=(x,z,rr)=>{ for(let d=0;d<=rr;d+=0.1) for(let a=0;a<16;a++){ const tx=x+Math.cos(a/8*Math.PI)*d, tz=z+Math.sin(a/8*Math.PI)*d; if(E.canStand(tx,tz,R,0)&&seen.has(key(Math.round((tx-X0)/STEP),Math.round((tz-Z0)/STEP)))) return true; } return false; };
  check(tag+'：C 點餐、看東西的互動點旁邊站得到（從進門的位置走得到的地方）',!!itO&&!!itL&&near(itO.x,itO.z,itO.radius-0.1)&&near(itL.x,itL.z,itL.radius-0.1)&&itO.label==='點餐（'+W.name+'）',JSON.stringify([itO&&itO.label,itL&&itL.label])); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);

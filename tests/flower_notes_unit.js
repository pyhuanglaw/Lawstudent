// 花序 Flower Notes（公館 G11 的雙層花藝店；FLOWER-NOTES-ART-1110，X325；LAWWW2 帳號 A 2026-11-10）的導航（不需要瀏覽器）：
// 在 Node 裡建出遊戲真正的公館（gongguan）與花序（flower_notes），用引擎真正的找路＋移動碰撞（E.simWalk：走路、跑步＋低幀率）檢查：
//   公館：G11 門口有「進入花序」、站得住；從花序出來的位置站得住、離門口互動點的處理
//   花序：兩層導航；入口 → 樓梯（往北）→ 二樓教室（第 1 層、高 3.9）；二樓 → 一樓；樓梯頂端在第 0 層站不住；
//         每一個座位走得到；每一個互動點、每一個「看」的位置站得住、走得到；家具站不進去；店員的位置在櫃檯後面
// 這是模擬（證明路走得通、高度對），不是真實玩家流程（D131）。用法：node tests/flower_notes_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const need=['src/data/flower_notes_layout.js','src/flower_notes3d.js'].filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(need.length){ check('0. 花序的檔案在',false,need.join(' ')); console.log('FAILED: '+fails); process.exit(1); }
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/flower_notes_layout.js','src/flower_notes3d.js','src/data/flower_notes_text.js','src/flower_notes_sys3d.js'];   /* 後兩個：AA_792 的「看」（FLOWER-NOTES-1110；互動點由 FNS 包住區域的 build 加上去，下面 4、4b 一起查走不走得到）*/
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|FN3|LINZE_LAYOUT|CLASSROOM_LAYOUT|FLOWER_NOTES_LAYOUT|FLOWER_NOTES_TEXT|FNS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt,speed)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt:dt||1/30,speed});
const walk=(a,b)=>{ for(const [dt,sp] of [[1/30,1.8],[0.1,4.8]]){ const r=sim(a,b,dt,sp); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:sp},r); } return {ok:true}; };
const fmt=r=>JSON.stringify(r).slice(0,200);
const stand=(x,z,lv,r)=>E.canStand(x,z,r==null?0.32:r,lv|0);
function standNear(it){ const R=Math.min(it.radius||it.r||1,1.2), lv=it.lv|0; if(stand(it.x,it.z,lv)) return [it.x,it.z,lv]; for(let r=0.15;r<=R-0.1;r+=0.15) for(let a=0;a<16;a++){ const x=it.x+Math.cos(a/16*Math.PI*2)*r, z=it.z+Math.sin(a/16*Math.PI*2)*r; if(stand(x,z,lv)) return [x,z,lv]; } return null; }
function approach(seat){ const yaw=seat.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lv=seat.lv|0; for(const [dx,dz] of [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=seat.x+dx, z=seat.z+dz; if(stand(x,z,lv,0.3)) return [x,z,lv]; } return null; }
const L=FLOWER_NOTES_LAYOUT, Y1=L.floors[1].y, T=L.stair;
check('0. Z3.ZONES.flower_notes 有登記；index.html 載入配置和區域',!!Z3.ZONES.flower_notes&&/src\/data\/flower_notes_layout\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8'))&&/src\/flower_notes3d\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8')));
check('0. 樓梯的數字對得起來：階數 × 階高＝樓高、階數 × 踏面＝水平長度',Math.abs(T.risers*T.rise-Y1)<1e-6&&Math.abs(T.risers*T.tread-(T.zBottom-T.zTop))<1e-6,`${T.risers}×${T.rise}＝${(T.risers*T.rise).toFixed(3)}；${(T.risers*T.tread).toFixed(2)}／${(T.zBottom-T.zTop).toFixed(2)}`);

// ---------- 公館：G11 門口 ----------
{ const z=loadZone('gongguan'); const door=E.interactables.find(i=>i.exit&&i.exit.to==='flower_notes');
  check('1. 公館 G11 門口有「進入花序」（exit → flower_notes），進去站在一樓門內',!!door&&door.exit.spawn.x===L.spawn.x&&door.exit.spawn.z===L.spawn.z,door?`(${door.x},${door.z}) ${door.label}`:'沒有');
  const b=(z.buildings||[]).find(q=>q.userData&&q.userData.ggShop==='G11');
  check('1. 門口在 G11 那一棟的正前面（騎樓裡）',!!door&&!!b&&Math.abs(door.x-b.position.x)<0.05&&door.z>19&&door.z<22.2,b?`樓 x ${b.position.x}`:'找不到 G11');
  if(door){ const p=standNear(door); check('1. 門口站得住',!!p,JSON.stringify(p));
    const o=[FN3.GG.cx,FN3.GG.outZ,0]; check('1. 從花序出來站的地方站得住（G11 門前的人行道）、走得回門口',stand(o[0],o[1],0)&&!!p&&walk(o,p).ok,JSON.stringify(o)); } }

// ---------- 舊花攤拿掉、G11 門前沒有柱子（B 件）----------
{ const z=loadZone('gongguan'); const stall=E.interactables.filter(i=>i.kind==='gg_flower'), cx=FN3.GG.cx;
  check('1b. 公館沒有舊花攤了：沒有 kind gg_flower 的互動點、資產清單沒有 bldg.gg_flower_stall、原本攤子的位置 (−47, 11.7) 走得過去',!stall.length&&!ASSETS.manifest['bldg.gg_flower_stall']&&stand(-47,11.7,0)&&!fs.existsSync(path.join(ROOT,'assets/models/env/second_ai/gg_flower_stall.glb')),stall.map(i=>i.label).join(' '));
  check('1b. G11 店門正前面沒有騎樓柱（中間那根拿掉；兩邊分界的柱子照舊）',stand(cx,19.3,0)&&stand(cx,20.2,0)&&!stand(cx-5,19.3,0),'cx '+cx);
  let J=null; try{ J=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gongguan_shops.props.json'),'utf8')); }catch(e){}
  let imgs=[]; try{ const d=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gongguan_shops.glb')), jl=d.readUInt32LE(12); imgs=(JSON.parse(d.slice(20,20+jl).toString('utf8')).images||[]).map(i=>i.name); }catch(e){}
  const src=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/textures/gen/gg_fronts_atlas.json'),'utf8');
  check('1b. 公館店面街的貼圖集有花序外觀（招牌、二樓、櫥窗、門）和三間的招牌（安泰、汀州鮮果、榮恩典）',['ggfn_sign','ggfn_up','ggfn_winl','ggfn_door','ggfn_winr','ggantai_sign','ggfruit_sign','ggrong_sign'].every(k=>src.includes('"'+k+'"'))&&imgs.some(n=>/gg_fronts_atlas/.test(n)),imgs.filter(n=>/fronts/.test(n)).join(' ')); }

// ---------- 花序 ----------
{ const z=loadZone('flower_notes'); const N0=z.levels[0], N1=z.levels[1], SP=[L.spawn.x,L.spawn.z,0];
  check('2. 兩層導航格（第 1 層地板 3.9）、同尺寸同原點',z.levels.length===2&&N1.y0===Y1&&N0.cols===N1.cols&&N0.rows===N1.rows&&N0.ox===N1.ox&&N0.oz===N1.oz);
  const ex=E.interactables.find(i=>i.exit&&i.exit.to==='gongguan');
  check('2. 入口出生點站得住；「離開花序」在門口、回到公館 G11 門前',stand(SP[0],SP[1],0)&&!!ex&&!!standNear(ex)&&ex.exit.spawn.x===FN3.GG.cx&&ex.exit.spawn.z===FN3.GG.outZ,ex?`距離 ${Math.hypot(SP[0]-ex.x,SP[1]-ex.z).toFixed(2)}`:'');
  const up=[-1.0,-4.0,1], sx=(T.x0+T.x1)/2;
  { const r=walk(SP,up); check('3. 一樓入口 → 樓梯 → 二樓教室（走路、跑步＋低幀率）',r.ok,fmt(r)); const r2=walk(up,SP); check('3. 二樓教室 → 一樓入口',r2.ok,fmt(r2)); }
  { const r=sim(SP,up,1/30,1.8); const ys=(r.path||r.pts||[]); check('3. 走到二樓以後在第 1 層、高度＝3.9',r.ok&&(r.lv===1||r.lv===undefined)&&(r.y===undefined||Math.abs(r.y-Y1)<0.05),fmt({lv:r.lv,y:r.y})); }
  check('3. 樓梯頂端在第 0 層站不住（一樓不能直接走進去）；樓梯中段在一樓高度不是 0',!stand(sx,T.zTop+0.2,0)&&N0.heightAt&&Math.abs(N0.heightAt(sx,(T.zTop+T.zBottom)/2)-Y1/2)<0.25,N0.heightAt?String(N0.heightAt(sx,(T.zTop+T.zBottom)/2)):'沒有 heightAt');
  check('3. 樓梯西側的欄杆擋住（不能從旁邊走上樓梯）；二樓的樓梯開口不能從教室直接走下去',!stand(T.railX-0.05,-2,0)&&!stand(T.railX-0.05,-2,1));
  check('3. 二樓南緣的玻璃欄杆：欄杆外（挑高區）在第 1 層站不住',!stand(0,L.upper.railZ+0.6,1)&&!stand(-3,3,1)&&stand(0,L.upper.railZ-0.8,1));
  { const bad=[]; for(const q of L.seats1){ const a=approach({x:q.x,z:q.z,yaw:q.yaw,lv:1}); if(!a||!walk(up,a).ok) bad.push(q.id); } check('4. 二樓十二個座位都有「坐下」、走得到',E.interactables.filter(i=>i.fnSeat).length===12&&!bad.length,bad.join(' ')); }
  { const bad=[]; for(const it of E.interactables){ const p=standNear(it); if(!p||!walk(it.lv?up:SP,p).ok) bad.push(it.label+'@'+it.x+','+it.z); } check('4. 每一個互動點旁邊站得住、走得到',!bad.length,bad.join(' ')||E.interactables.length+' 個'); }
  { const bad=[]; for(const q of L.looks){ const p=standNear(q); if(!p||!walk(q.lv?up:SP,p).ok) bad.push(q.id); } check('4. 配置裡每一個「看」的位置站得住、走得到（句子等 AA）',!bad.length&&z.fnLooks===L.looks,bad.join(' ')); }
  { const LK=E.interactables.filter(i=>i.fnLook), keys=Object.keys(FLOWER_NOTES_TEXT.looks), bad=[];   /* 4b（FLOWER-NOTES-1110）：AA_792 的 13 區「看」——站在那個位置的時候，最近的互動點就是它（不會被買花、離開、坐下搶走）*/
    for(const it of LK){ const p=standNear(it); if(!p){ bad.push(it.fnLook+' 站不住'); continue; } const near=E.interactables.filter(q=>(q.lv|0)===(it.lv|0)&&Math.hypot(q.x-p[0],q.z-p[1])<=q.radius).sort((a,b)=>Math.hypot(a.x-p[0],a.z-p[1])-Math.hypot(b.x-p[0],b.z-p[1]))[0]; if(near!==it) bad.push(it.fnLook+' 被 '+(near&&near.label)+' 搶走'); if(it.look!==FLOWER_NOTES_TEXT.looks[it.fnLook]) bad.push(it.fnLook+' 的字不是稿的'); }
    check('4b. AA_792 的「看」：13 個 key 都有互動點（'+LK.length+' 個）、站得住、站在那裡最近的就是它；買花的互動點沒有暫用的 look',keys.length===13&&keys.every(k=>LK.some(i=>i.fnLook===k))&&!bad.length&&!E.interactables.find(i=>i.kind==='gg_flower').look,bad.join('；')); }
  { const buy=E.interactables.find(i=>i.kind==='gg_flower'), C=L.counter; check('5. 買花的互動點在收銀櫃檯前（kind gg_flower，LAWWW 接）；店員站在櫃檯後面、站得住',!!buy&&buy.x<C.x0&&z.fnClerk.x>C.x1&&stand(z.fnClerk.x,z.fnClerk.z,0),buy?`(${buy.x},${buy.z})`:''); }
  { const inside=[]; for(const lv of [0,1]) for(const b of FN3.blocks(L,lv)) if(stand(b[0],b[1],lv,0.2)) inside.push(lv+':'+b.join('/')); check('5. 家具裡面站不住（展示台、櫃檯、花台、冷藏櫃、桌子…）',!inside.length,inside.slice(0,4).join(' ')); }
  { const d=L.display; check('5. 中央展示台四周繞得過去（入口 → 展示台後面 → 冷藏花櫃）',walk(SP,[d.x,d.z-d.d/2-0.8,0]).ok&&walk(SP,[0.1,-5.4,0]).ok&&walk(SP,[-3.4,-2.6,0]).ok); }
  check('6. 樓板資料給鏡頭（zone.slabs）扣掉樓梯開口；點樓梯＝走完這一跑（stairEnds）',(z.slabs||[]).length>=2&&z.walkMeshes.some(m=>m.userData.stairEnds),String((z.slabs||[]).length)); }
/* 7. 美術第 2 版（BB 11-11 01:50 的六點；LAWWW2 帳號 A 11-11） */
{ const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8'), py=rd('tools/blender/env_second/flower_notes_interior.py'), st=rd('tools/blender/env_second/wz_street.py'), kit=rd('tools/blender/env_second/wz_shopkit.py'), tex=rd('tools/blender/env_second/gg_shops6_tex.py');
  let G={nodes:[],materials:[],images:[]}; try{ const d=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/flower_notes_interior.glb')), jl=d.readUInt32LE(12); G=JSON.parse(d.slice(20,20+jl).toString('utf8')); }catch(e){}
  const nd=n=>(G.nodes||[]).find(q=>q.name===n), mats=(G.materials||[]).map(m=>m.name), WW=L.front.westWin2, cab=L.items1.find(i=>i.kind==='low_cabinet');
  check('7. 室內的牆：米白暖色的平塗（fn_wall_cream），不是灰泥貼圖（fn_travertine）',mats.includes('fn_wall_cream')&&!mats.includes('fn_travertine'),mats.join(' '));
  check('7. 花：一朵朵有花瓣（flower：外圈＋內圈＋花心）、花束有兩層包裝紙和蝴蝶結；一團花不再是幾顆球',/def flower\(c, x, y, z, r, cols/.test(py)&&/def leafq\(/.test(py)&&/兩層包裝紙/.test(py)&&/蝴蝶結/.test(py)&&!/blob\(c, x \+ math\.cos\(a\) \* rd, y \+ RR\.uniform\(-0\.25, 0\.45\) \* r/.test(py));
  const dirOk=n=>{ const q=nd(n); return !!q&&q.extras&&JSON.stringify(q.extras.dir)==='[1,0,0]'; };
  check('7. 二樓教室西牆整面落地窗：配置 front.westWin2（窗台離地 ≤ 0.2 m、到天花板下 ≤ 0.4 m、長 ≥ 6 m）；模型有玻璃、窗框、窗外的行道樹（WALL_L1_W_GLASS／FRAME／VIEW，dir 朝室內＝跟著西牆淡出）；窗景貼圖 fn_view2f',
    !!WW&&WW.sill<=0.2&&WW.top<=0.4&&WW.z1-WW.z0>=6&&dirOk('WALL_L1_W_GLASS')&&dirOk('WALL_L1_W_FRAME')&&dirOk('WALL_L1_W_VIEW')&&(G.images||[]).some(i=>i.name==='fn_view2f'),JSON.stringify(WW));
  check('7. 西牆原本擋住整面牆的高玻璃櫃改成窗前的矮櫃（高 ≤ 0.9 m；範圍沒變：導航一樣、站不進去）',!L.items1.some(i=>i.kind==='glass_cabinet')&&!!cab&&cab.h<=0.9&&cab.x0===-5.0&&cab.x1===-4.5&&cab.z0===-5.4&&cab.z1===-1.4&&(()=>{ loadZone('flower_notes'); return !stand(-4.75,-3.4,1,0.2); })());
  const i11=st.indexOf("'G11': dict("), g11=i11>=0?st.slice(i11,st.indexOf('\n',st.indexOf('props=',i11))):''; let fp=[]; try{ fp=JSON.parse(rd('assets/models/env/second_ai/gongguan_shops.props.json')).props||[]; }catch(e){}
  const tr=fp.filter(q=>q.tag==='gg_fn_tree'), bx=fp.filter(q=>q.tag==='gg_fn_box'), deep=tr.concat(bx).map(q=>22.0-q.rect[1]);
  check('7. 外觀：牆改平塗的米白石材（wall_flat）、招牌重畫（gg_shops6_tex.fn_sign：深色字「花序｜Flower Notes」）、門口兩棵樹＋兩個長花箱（原型 p_fntree／p_fnbox）',
    /wall_flat=True/.test(g11)&&(g11.match(/\('fn_tree'/g)||[]).length===2&&(g11.match(/\('fn_box'/g)||[]).length===2&&/def fn_sign\(/.test(tex)&&/t1 = '花序'; t2 = 'Flower Notes'/.test(tex)&&/def p_fntree\(/.test(kit)&&/def p_fnbox\(/.test(kit)&&/def gg_flatwall\(/.test(kit));
  check('7. 樹和花箱的腳印寫進 props.json（各兩個），都貼著店面（凸進騎樓 ≤ 0.6 m：騎樓 3 m 還剩 2.4 m 走路）',tr.length===2&&bx.length===2&&deep.every(d=>d>0&&d<=0.6),deep.map(d=>d.toFixed(2)).join(' ')); }
/* 8. 沒有站得進去、走不出來的縫（LAWWW 11-11 02:56：照 tests/tz_shops_notrap_1111_unit.js 的做法，花序一樓、二樓也要有；第 2 版二樓換了矮櫃、一樓多了花）：
      每一層從一個站得住的點出發，每 0.25 m 掃出所有走得到的點；每一個點都用引擎真正的找路＋移動碰撞走到「離開」（一樓的店門；二樓的點要先下樓梯），停下來的地方要在互動半徑裡 */
{ const z=loadZone('flower_notes'), ex=E.interactables.find(i=>i.exit), STEP=0.25, R=0.32, navs=z.levels||[z.nav], sp=z.spawn, tot=[];
  for(const lv of [0,1]){ const nav=navs[lv]||navs[0], X0=nav.ox, Z0=nav.oz, Wn=nav.cols*nav.cell, Dn=nav.rows*nav.cell, key=(i,j)=>i+','+j;
    const ok=(i,j)=>{ const x=X0+i*STEP, zz=Z0+j*STEP; return x>X0&&zz>Z0&&x<X0+Wn&&zz<Z0+Dn&&E.canStand(x,zz,R,lv); };
    const s0=lv===0?[sp.x,sp.z]:[L.tables1[2].x,L.tables1[2].z+1.6], si=Math.round((s0[0]-X0)/STEP), sj=Math.round((s0[1]-Z0)/STEP); let start=null;
    for(let d=0;d<6&&!start;d++) for(let a=-d;a<=d&&!start;a++) for(let b=-d;b<=d&&!start;b++) if(ok(si+a,sj+b)) start=[si+a,sj+b];
    if(!start||!ex){ check('8. 花序 '+(lv+1)+'F：出發點站得住、有「離開」',false,JSON.stringify([s0,ex&&ex.label])); continue; }
    const seen=new Set([key(...start)]), q=[start]; while(q.length){ const [i,j]=q.pop(); for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const k=key(i+a,j+b); if(!seen.has(k)&&ok(i+a,j+b)){ seen.add(k); q.push([i+a,j+b]); } } }
    const pts=[...seen].map(k=>k.split(',').map(Number)).map(([i,j])=>[+(X0+i*STEP).toFixed(2),+(Z0+j*STEP).toFixed(2)]), bad=[];
    for(const p of pts) for(const dt of [0.1,0.033]){ const r=E.simWalk(p[0],p[1],ex.x,ex.z,{lv0:lv,lv1:ex.lv|0,dt,speed:1.45}); const end=r&&r.x!=null?[r.x,r.z]:(r&&r.ok?[ex.x,ex.z]:null);
      if(!end||Math.hypot(end[0]-ex.x,end[1]-ex.z)>(ex.radius||1)+1e-6){ bad.push([p[0],p[1],dt,end&&end.map(v=>+v.toFixed(2)),r&&r.reason]); break; } }
    tot.push(pts.length);
    check('8. 花序 '+(lv+1)+'F：站得到的 '+pts.length+' 個點（每 '+STEP+' m）都走得回「'+ex.label+'」的半徑裡（走路、30 fps 和 10 fps'+(lv?'；先下樓梯':'')+'）',pts.length>(lv?150:300)&&!bad.length,bad.length+' 個出不來：'+JSON.stringify(bad.slice(0,6))); } }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);

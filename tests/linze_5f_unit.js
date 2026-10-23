// 霖澤館 5F 研究室樓層（CLOSED-SPACES-1023，LAWWW2-B；AA_399 第 1 節；使用者 2026-10-23「遊戲裡任何現在關起來的空間都可以開始開發」）——不需要瀏覽器。
//   1. 配置、區域、正式模型登記：linze_5f 有、GLB／配置檔在；
//   2. 樓梯：5F 往下到 4F（4F 樓梯間門口）、往上 6F 關著；4F 往上照舊關著（刷卡門：怎麼進 5F 由劇情決定）；
//   3. 電梯：5F 可以到 1F–4F、6F 以上按不亮；3F、4F 的電梯照舊不停 5F（教職員證）；
//   4. 教授研究室四扇門有在室狀態（note）、遊戲的「看」用 note；
//   5. 研究室：八張桌子（AA_399 1-1 更正，企劃 8a21184d）；學姊的位子在門邊、是 spots（不在 seats，玩家不能坐）；她旁邊的空位玩家坐得到；檯燈的點光、主角站的位置跟著她的桌子；會議室進不去（門擋住）；
//   6. 「口試中」、研究室的燈：LZUP.examSign／labLights 照狀態開關（正式模型載好前叫也記得）；
//   7. 導航：照遊戲的格子（0.4 m、牆內縮 0.25、blockRect 最小 0.4）從電梯、樓梯間走得到每個座位的走近點、每個「看」、研究室的門口、會議室門口；會議室裡面走不到；
//   8. 窗景照片 linze_5f_day／night 在；guide3d.js 有 5F 的區域、電梯連結（只往下，不指路上 5F）。
// 修改前（沒有 5F）1～8 FAIL。用法：node tests/linze_5f_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={M:()=>({})}; global.Z3={ZONES:{}}; global.ASSETS={manifest:{}};
global.CHAR={ build:()=>({position:{x:0,y:0,z:0,set(){}},rotation:{y:0}}) }; global.STORY={ extraSpec:i=>({i}) };
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|LINZE_LAYOUT|LINZE_UPPER_LAYOUTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/linze_layout.js','src/data/linze_upper_layouts.js','src/linze_upper3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const LU=typeof LINZE_UPPER_LAYOUTS!=='undefined'?LINZE_UPPER_LAYOUTS:{}, L5=LU['5f'], L4=LU['4f'], L3=LU['3f'];
const ex=p=>fs.existsSync(path.join(ROOT,p));
check('1. 配置 5F、區域 linze_5f、正式模型 bldg.linze_5f 登記、GLB 和配置檔都在', !!L5&&L5.zone==='linze_5f'&&!!Z3.ZONES.linze_5f&&!!ASSETS.manifest['bldg.linze_5f']&&ex('assets/models/env/second_ai/linze_5f.glb')&&ex('assets/models/env/second_ai/linze_5f.layout.json'));
if(!L5){ console.log('\n'+(fails+1)+' FAIL（後面的檢查要 5F 的配置）'); process.exit(1); }
{ const st=L5.stairs, d4=L4.stairs.spawn;
  check('2. 5F 走樓梯下樓＝到 4F（4F 樓梯間門口）；往上 6F 關著、有說明', st.down.to==='linze_4f'&&/4F/.test(st.down.label)&&!st.up.to&&/6F/.test(st.up.label)&&/刷教職員證/.test(st.up.closed||''), JSON.stringify(st.up));
  check('2. 4F 往上照舊關著（刷卡門；學姊開門由劇情接）、3F 往上到 4F', !L4.stairs.up.to&&/5F/.test(L4.stairs.up.label)&&L3.stairs.up.to==='linze_4f'); }
{ const F=L5.elevator.floors, open=F.filter(q=>q.open).map(q=>q.zone+':'+(q.lv==null?'':q.lv)), six=F.find(q=>/6F/.test(q.label));
  check('3. 5F 的電梯：1F、2F、3F、4F、5F 開；6F–8F 按不亮', JSON.stringify(open)===JSON.stringify(['linze:0','linze:1','linze_3f:','linze_4f:','linze_5f:'])&&!!six&&!six.open&&/教職員證/.test(six.closed||''), JSON.stringify(open));
  const r3=L3.elevator.floors.find(q=>/5F/.test(q.label)), r4=L4.elevator.floors.find(q=>/5F/.test(q.label));
  check('3. 3F、4F 的電梯照舊不停 5F（5F–8F 按不亮）', !!r3&&!r3.open&&!!r4&&!r4.open&&!L3.elevator.floors.some(q=>q.zone==='linze_5f')&&!L4.elevator.floors.some(q=>q.zone==='linze_5f')); }
// 區域建起來（假的 E3、Z3.room）：拿互動點
const mkV=()=>({x:0,y:0,z:0,set(){ return this; },copy(){ return this; },addScaledVector(){ return this; },fromArray(){ return this; },applyMatrix4(){ return this; }});
global.THREE={Group:function(){ this.children=[]; this.add=o=>this.children.push(o); this.remove=()=>{}; this.position=mkV(); this.rotation=mkV(); this.userData={}; },
  Mesh:function(){ this.position=mkV(); this.rotation=mkV(); this.userData={}; }, PlaneGeometry:function(){}, BoxGeometry:function(){}, PointLight:function(){ this.position=mkV(); this.userData={}; }};
global.W3={stoneTex:()=>({})}; global.ASSETS.loadOne=()=>new Promise(()=>{});   /* 正式模型不載（只看配置建出來的導航格、互動點）*/
global.E3={NavGrid:function(W,D,cs,ox,oz){ this.W=W; this.D=D; this.cs=cs; this.ox=ox; this.oz=oz; this.cols=Math.ceil(W/cs); this.rows=Math.ceil(D/cs); this.b=new Uint8Array(this.cols*this.rows);
  const w2=(c,r)=>[ox+(c+0.5)*cs,oz+(r+0.5)*cs];
  this.blockOutside=(x0,z0,x1,z1)=>{ for(let r=0;r<this.rows;r++) for(let c=0;c<this.cols;c++){ const [x,z]=w2(c,r); if(x<x0||x>x1||z<z0||z>z1) this.b[r*this.cols+c]=1; } };
  this.blockRect=(cx,cz,w,d)=>{ for(let r=0;r<this.rows;r++) for(let c=0;c<this.cols;c++){ const [x,z]=w2(c,r); if(Math.abs(x-cx)<=w/2&&Math.abs(z-cz)<=d/2) this.b[r*this.cols+c]=1; } };
  this.cellOf=(x,z)=>[Math.floor((x-ox)/cs),Math.floor((z-oz)/cs)]; this.w2=w2; }};
global.Z3.room=(E,o)=>{ const g=new THREE.Group(); return {group:g,walls:[],winParts:[],onLamps(){},applyTime(){}}; };
const IT=[]; const E={interactables:IT}; const z=Z3.ZONES.linze_5f.build(E); const nav=z.nav;
{ const doors=L5.doors.filter(d=>d.kind==='room'), looks=IT.filter(q=>/^50[1-4] 研究室$/.test(q.label));
  check('4. 北牆四間教授研究室（501–504），每扇門有在室狀態的 note；「看」用 note（不再是「這個時段有課」）', doors.length===4&&doors.every(d=>/教授研究室/.test(d.note||'')&&/「(在研究室|上課中|外出|開會中)」/.test(d.note))&&looks.length===4&&looks.every(q=>/教授研究室/.test(q.look)&&!/這個時段有課/.test(q.look)), looks.map(q=>q.look).join('／'));
  const l3=IT.length; }
{ const sp=L5.spots||{}, S=L5.seats, near=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z)<0.3;
  const lab0=(L5.rooms||[]).find(r=>r.id==='lab'), desks=L5.blocks.filter(b=>b.why==='desk'&&lab0&&b.x0>=lab0.x0-0.05&&b.x1<=lab0.x1+0.05&&b.z0>=lab0.z0&&b.z1<=lab0.z1);
  check('5. 研究室八張桌子（AA_399 1-1 更正：「研究室有八張桌子」）', desks.length===8, desks.length+' 張');
  check('5. 學姊的位子是 spots.sis_desk：門邊（離研究室的門 1.6 m 以內：「門一開就撞到椅背」）、面向窗；不在 seats（玩家不能坐）', !!sp.sis_desk&&!!lab0&&Math.hypot(sp.sis_desk.x-lab0.door.x,sp.sis_desk.z-lab0.door.z)<1.6&&Math.abs(sp.sis_desk.yaw)<0.01&&!S.some(s=>near(s,sp.sis_desk)), sp.sis_desk&&JSON.stringify([sp.sis_desk.x,sp.sis_desk.z]));
  check('5. 跟著她的桌子：檯燈的點光（spots.sis_lamp，桌上、離她 1.2 m 以內）、主角站的位置（spots.me_desk，離她 1 m 以內）；linze_upper3d.js 讀 sis_lamp、lab5f3d.js 讀 me_desk',
    !!sp.sis_lamp&&!!sp.me_desk&&Math.hypot(sp.sis_lamp.x-sp.sis_desk.x,sp.sis_lamp.z-sp.sis_desk.z)<1.2&&sp.sis_lamp.z>sp.sis_desk.z&&Math.hypot(sp.me_desk.x-sp.sis_desk.x,sp.me_desk.z-sp.sis_desk.z)<1.0
    &&/L\.spots\.sis_lamp/.test(fs.readFileSync(path.join(ROOT,'src/linze_upper3d.js'),'utf8'))&&/DESK_ME='me_desk'/.test(fs.readFileSync(path.join(ROOT,'src/lab5f3d.js'),'utf8')));
  const bs=S.find(s=>/旁邊的空位/.test(s.label||''));
  check('5. 她旁邊的空位玩家坐得到（seats「坐在旁邊的空位」、study）、和她的位子並排', !!bs&&bs.kind==='study'&&Math.abs(bs.z-sp.sis_desk.z)<0.01&&Math.abs(bs.x-sp.sis_desk.x)<1.6);
  const R=(L5.rooms||[]).find(r=>r.id==='meeting'), lab=(L5.rooms||[]).find(r=>r.id==='lab');
  check('5. 會議室進不去（門關著、門口有擋）、研究室的門開著；房間範圍寫在 rooms', !!R&&R.door&&!R.door.open&&L5.blocks.some(b=>b.why==='meeting_door')&&!!lab&&lab.door.open&&!S.some(s=>R&&s.x>R.x0&&s.x<R.x1&&s.z>R.z0&&s.z<R.z1)); }
{ const mk=n=>({name:n,isMesh:true,visible:true}); const ok=typeof LZUP==='object'&&typeof LZUP.examSign==='function'&&typeof LZUP.labLights==='function';
  check('6. LZUP.examSign、labLights、state5 在；預設不顯示「口試中」、燈全開', ok&&LZUP.state5().exam===false&&LZUP.state5().lab==='all');
  if(ok){ LZUP.examSign(true); LZUP.labLights('sis'); const s1=LZUP.state5(); LZUP.labLights('bogus'); const s2=LZUP.state5(); LZUP.examSign(false); LZUP.labLights('all');
    check('6. examSign(true)、labLights(\'sis\') 記得狀態；不認得的值回到全開；叫回來恢復', s1.exam===true&&s1.lab==='sis'&&s2.lab==='all'&&LZUP.state5().exam===false);
    const src=fs.readFileSync(path.join(ROOT,'src/linze_upper3d.js'),'utf8');
    check('6. 正式模型載好時照狀態開關節點（EXAM_SIGN、LAB_tubes、LAB_SIS_LAMP）', /EXAM_SIGN/.test(src)&&/LAB_tubes/.test(src)&&/LAB_SIS_LAMP/.test(src)&&/apply5\(\)/.test(src));
    check('6. 「口試中」用材質的 visible 開關（它是 WALL_ 牆面：引擎每一格照淡出改 o.visible，hideFaded）', /nodes5\.exam\)\s*for\(const m of \[\]\.concat\(o\.material\)\)\s*if\(m\)\s*m\.visible=st5\.exam/.test(src));
    const amb=m=>{ E.hemi={intensity:1.05}; E.sun={intensity:0}; LZUP.labLights(m); z.applyTime(21,'clear'); return E.hemi.intensity; }; const a1=amb('sis'), a2=amb('all');   /* 室內：引擎設完環境光以後叫區域的 applyTime（engine3d.js applyTime 的室內分支）*/
    check('6. 只開學姊那一盞燈（sis）：整層的環境光調暗（區域的 applyTime）；全開時不動', a1<0.4&&a2===1.05, a1.toFixed(3)+'／'+a2);
    const nd=L5.nodes||{}; check('6. 配置的 nodes 寫了三個節點名字', !!nd.WALL_P3_EXAM_SIGN&&!!nd.LAB_tubes&&!!nd.LAB_SIS_LAMP); } }
// 7. 導航（和 lane118_shops.navcheck 同一套規則，但用遊戲建出來的格子）
{ const cs=nav.cs, free=(x,z)=>{ const [c,r]=nav.cellOf(x,z); return c>=0&&r>=0&&c<nav.cols&&r<nav.rows&&!nav.b[r*nav.cols+c]; }, clear=(x,z,r)=>free(x,z)&&free(x+r,z)&&free(x-r,z)&&free(x,z+r)&&free(x,z-r);
  const flood=(sx,sz)=>{ const s0=nav.cellOf(sx,sz), seen=new Set([s0+'']), q=[s0]; while(q.length){ const [c,r]=q.pop(); for(let dc=-1;dc<=1;dc++) for(let dr=-1;dr<=1;dr++){ const n=[c+dc,r+dr], k=n+''; if(seen.has(k)||n[0]<0||n[1]<0||n[0]>=nav.cols||n[1]>=nav.rows||nav.b[n[1]*nav.cols+n[0]]) continue; const [x,z]=nav.w2(...n); if(!clear(x,z,0.33)) continue; seen.add(k); q.push(n); } } return seen; };
  const reach=(seen,x,z)=>{ if(!free(x,z)||!clear(x,z,0.3)) return false; const [c,r]=nav.cellOf(x,z); for(let dc=-1;dc<=1;dc++) for(let dr=-1;dr<=1;dr++) if(seen.has([c+dc,r+dr]+'')) return true; return false; };
  const near=(seen,x,z,rad)=>{ for(let dx=-4;dx<=4;dx++) for(let dz=-4;dz<=4;dz++) if(Math.hypot(dx*0.2,dz*0.2)<=rad&&reach(seen,x+dx*0.2,z+dz*0.2)) return true; return false; };
  const bad=[]; for(const [nm,sp] of [['電梯',L5.spawn],['樓梯間',L5.stairs.spawn]]){ const seen=flood(sp.x,sp.z);
    for(const s of L5.seats){ const fx=Math.sin(s.yaw||0), fz=Math.cos(s.yaw||0);   /* 和 game3d.js 的 seatApproach 同一組候選點：ap、前 0.5、後 0.6、兩側 0.55、後 0.7／0.75、前 0.8、後 0.9 */
      const cand=[...(s.ap?[s.ap]:[]),...[[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]].map(([dx,dz])=>[s.x+dx,s.z+dz])];
      if(!cand.some(([x,zz])=>reach(seen,x,zz))) bad.push(nm+'→座位 '+(s.label||'')+' '+[s.x,s.z]); }
    for(const q of IT){ if(q.seat) continue; if(!near(seen,q.x,q.z,q.radius||0.8)) bad.push(nm+'→'+q.label); }
    for(const k of ['lab_door','meeting_door','sis_desk','me_desk','desk_c','desk_d','corridor']){ const p=L5.spots[k], a=p.ap||[p.x,p.z]; if(!near(seen,a[0],a[1],0.4)) bad.push(nm+'→spots.'+k); }
    const M=L5.rooms.find(r=>r.id==='meeting'); let inM=0; for(const k of seen){ const [c,r]=k.split(',').map(Number), [x,zz]=nav.w2(c,r); if(x>M.x0+0.3&&zz>M.z0+0.3) inM++; } if(inM) bad.push(nm+'：會議室裡面有 '+inM+' 格走得到'); }
  check('7. 從電梯、樓梯間走得到每個座位的走近點、每個互動點、研究室門口、會議室門口、學姊和背景碩士生的位子；會議室裡面走不到', bad.length===0, bad.slice(0,6).join('；')); }
{ const g=fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8');
  check('8. 窗景照片 linze_5f_day、linze_5f_night 在', ex('assets/models/env/views/linze_5f_day.webp')&&ex('assets/models/env/views/linze_5f_night.webp'));
  check('8. guide3d.js：5F 往下的區域連結、電梯連結；別的樓層不指路上 5F', /linze_5f:\['linze_4f'\]/.test(g)&&/linze_5f:\['linze','linze_3f','linze_4f'\]/.test(g)&&!/linze_4f:\[[^\]]*linze_5f/.test(g)&&!/linze_3f:\[[^\]]*linze_5f/.test(g)); }
console.log(fails?('\n'+fails+' FAIL'):'\nALL PASS'); process.exit(fails?1:0);

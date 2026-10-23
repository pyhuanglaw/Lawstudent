// 總圖研究小間（2F 東側）＋5F 書庫（CLOSED-SPACES-1023 第 3 項，LAWWW2-B；AA_399 第 3 節，AA-B）——不需要瀏覽器。
//   1. 配置、區域、正式模型登記：library_carrels、library_stacks 有、GLB／配置檔在、index.html 有載入（配置在區域檔前面、都在 library3d.js 後面）；
//   2. 研究小間的進出：大廳二樓東牆「研究小間」的門（library_layout.js doors carrels 的 to／back）→ 研究小間的門廳；研究小間「回 2F 自習區」→ 大廳那扇門前（back）；
//      兩邊的出生點離按鈕夠遠（一進來不會馬上跳出按鈕）；
//   3. 研究小間：十間（北 01～05、南 06～10），學姊的 03 和玩家的 08 隔著走廊正對面；AA_399 3-1 要的站位（sis_knock 在走廊、面向 03 的門；sis_seat 在 03 裡面；
//      sis_note 在 03 門上的小窗）、節點（CARREL08_DOOR_*、SIS_CARREL_*、STICKY_SIS）；08 沒有預約：門擋著、沒有座位；有預約（G.flags.carrelDay＝今天）：門開、可以坐；
//      學姊的時期（2028-02～2029-05）、在的時段（平日 14～17）；
//   4. 電梯：大廳、3F 閱覽室、5F 書庫三部電梯的樓層都是 1F～6F 連號：5F 書庫開、4F 和 6F 關（說明整理中）；往書庫的出生點在書庫電梯的車廂裡、往大廳／閱覽室的在那一部的車廂裡；
//   5. 書庫：十排（R1 期刊…R10 300）＋最裡面靠西牆的參考書；「看那一排」interact（row_300…row_380、row_j、row_ref）；
//      方奕廷（spots.fang）在最裡面那一排的走道、面向西牆的參考書（AA_399 3-3），植物圖鑑那一格（spots.ref_plant）在他面前；
//   6. 導航（照遊戲的格子）：兩個區域從出生點走得到每個座位的走近點、每個互動點、每個 spot（03 裡面的 sis_seat 除外：門關著，NPC 直接放）；
//      08：有預約走得到椅子、沒有預約進不去；
//   7. 背景的讀者只坐窗下閱覽桌、只在開館時段；story3d.js 進來、待著叫 LUP.populate；guide3d.js（大廳 ⇄ 研究小間、電梯 ⇄ 書庫）、placemap、places（名字、開館時間）。
// 修改前（沒有這兩個區域）：第 1 項 FAIL、後面不跑。用法：node tests/library_upper_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={M:()=>({})}; global.Z3={ZONES:{}}; global.ASSETS={manifest:{}};
global.CHAR={ build:()=>({position:{x:0,y:0,z:0,set(){}},rotation:{y:0}}) }; global.STORY={ extraSpec:i=>({i}) };
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|LIBRARY_LAYOUT|LIBRARY_UPPER_LAYOUTS|LB3|LUP)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const ex=p=>fs.existsSync(path.join(ROOT,p));
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
for(const f of ['src/data/calendar.js','src/data/library_layout.js','src/data/library_upper_layouts.js','src/library3d.js','src/library_upper3d.js']) if(ex(f)) load(f);
const LL=typeof LIBRARY_LAYOUT!=='undefined'?LIBRARY_LAYOUT:null, LU=typeof LIBRARY_UPPER_LAYOUTS!=='undefined'?LIBRARY_UPPER_LAYOUTS:null;
const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), at=s=>idx.indexOf(s);
check('1. 配置（carrels、stacks）、區域 library_carrels、library_stacks、正式模型登記、GLB 和配置檔都在、index.html 載入（配置在區域檔前面、都在 library3d.js 後面）',
  !!LU&&!!LU.carrels&&!!LU.stacks&&!!Z3.ZONES.library_carrels&&!!Z3.ZONES.library_stacks&&!!ASSETS.manifest['bldg.library_carrels']&&!!ASSETS.manifest['bldg.library_stacks']
  &&['library_carrels','library_stacks'].every(k=>ex('assets/models/env/second_ai/'+k+'.glb')&&ex('assets/models/env/second_ai/'+k+'.layout.json'))
  &&at('src/data/library_upper_layouts.js')>at('src/library3d.js')&&at('src/data/library_upper_layouts.js')<at('src/library_upper3d.js'));
if(!LU||!LL||!LL.stacks){ console.log('\n'+(fails+1)+' FAIL（後面的檢查要研究小間、書庫的配置）'); process.exit(1); }
// 假的 THREE、E3、Z3.room、B3.buildElevator：拿互動點和導航格
const mkV=()=>({x:0,y:0,z:0,set(){ return this; },copy(){ return this; }});
global.THREE={Group:function(){ this.children=[]; this.add=o=>this.children.push(o); this.remove=()=>{}; this.position=mkV(); this.rotation=mkV(); this.userData={}; },
  Mesh:function(){ this.position=mkV(); this.rotation=mkV(); this.userData={}; }, PlaneGeometry:function(){}, BoxGeometry:function(){}, PointLight:function(){ this.position=mkV(); this.userData={}; }};
global.W3={stoneTex:()=>({})}; global.ASSETS.loadOne=()=>new Promise(()=>{});
global.E3={NavGrid:function(W,D,cs,ox,oz){ this.W=W; this.D=D; this.cs=cs; this.ox=ox; this.oz=oz; this.cols=Math.ceil(W/cs); this.rows=Math.ceil(D/cs); this.b=new Uint8Array(this.cols*this.rows);
  const w2=(c,r)=>[ox+(c+0.5)*cs,oz+(r+0.5)*cs];
  this.blockOutside=(x0,z0,x1,z1)=>{ for(let r=0;r<this.rows;r++) for(let c=0;c<this.cols;c++){ const [x,z]=w2(c,r); if(x<x0||x>x1||z<z0||z>z1) this.b[r*this.cols+c]=1; } };
  this.blockRect=(cx,cz,w,d)=>{ for(let r=0;r<this.rows;r++) for(let c=0;c<this.cols;c++){ const [x,z]=w2(c,r); if(Math.abs(x-cx)<=w/2&&Math.abs(z-cz)<=d/2) this.b[r*this.cols+c]=1; } };
  this.cellOf=(x,z)=>[Math.floor((x-ox)/cs),Math.floor((z-oz)/cs)]; this.w2=w2; }};
global.Z3.room=(E,o)=>{ const g=new THREE.Group(); return {group:g,walls:[],winParts:[],onLamps(){},applyTime(){},opts:o}; };
let elevArgs=null; global.B3={buildElevator:(RL,g,nav,nav1,z)=>{ elevArgs=RL; const EL=RL.elevator; return {cx:(EL.x0+EL.x1)/2,cz:(EL.z0+EL.z1)/2,floors:EL.floors,base:EL.base,update(){},placeAt(){}}; }};
const build=(id,G)=>{ global.GAME=G?{G}:undefined; const IT=[], E={interactables:IT}; const z=Z3.ZONES[id].build(E); return {z,IT,nav:z.nav}; };
// 導航（和 lane118_shops.navcheck、library_b1_unit 同一套規則）
function walker(nav){ const free=(x,zz)=>{ const [c,r]=nav.cellOf(x,zz); return c>=0&&r>=0&&c<nav.cols&&r<nav.rows&&!nav.b[r*nav.cols+c]; }, clear=(x,zz,r)=>free(x,zz)&&free(x+r,zz)&&free(x-r,zz)&&free(x,zz+r)&&free(x,zz-r);
  const flood=(sx,sz)=>{ const s0=nav.cellOf(sx,sz), seen=new Set([s0+'']), q=[s0]; while(q.length){ const [c,r]=q.pop(); for(let dc=-1;dc<=1;dc++) for(let dr=-1;dr<=1;dr++){ const n=[c+dc,r+dr], k=n+''; if(seen.has(k)||n[0]<0||n[1]<0||n[0]>=nav.cols||n[1]>=nav.rows||nav.b[n[1]*nav.cols+n[0]]) continue; const [x,zz]=nav.w2(...n); if(!clear(x,zz,0.33)) continue; seen.add(k); q.push(n); } } return seen; };
  const reach=(seen,x,zz)=>{ if(!free(x,zz)||!clear(x,zz,0.3)) return false; const [c,r]=nav.cellOf(x,zz); for(let dc=-1;dc<=1;dc++) for(let dr=-1;dr<=1;dr++) if(seen.has([c+dc,r+dr]+'')) return true; return false; };
  const near=(seen,x,zz,rad)=>{ for(let dx=-4;dx<=4;dx++) for(let dz=-4;dz<=4;dz++) if(Math.hypot(dx*0.2,dz*0.2)<=rad&&reach(seen,x+dx*0.2,zz+dz*0.2)) return true; return false; };
  const seatOk=(seen,s)=>{ const fx=Math.sin(s.yaw||0), fz=Math.cos(s.yaw||0);
    const cand=[...(s.ap?[s.ap]:[]),...[[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]].map(([dx,dz])=>[s.x+dx,s.z+dz])];
    return cand.some(([x,zz])=>reach(seen,x,zz)); };
  return {free,clear,flood,reach,near,seatOk}; }
const C=LU.carrels, S=LU.stacks, door=LL.doors.find(d=>d.id==='carrels');
// 2. 研究小間的進出
{ const lib=fs.readFileSync(path.join(ROOT,'src/library3d.js'),'utf8'); const {IT}=build('library_carrels',null); const back=IT.find(q=>q.exit&&q.exit.to==='library_hall');
  check('2. 大廳二樓東牆的門：to library_carrels、back（二樓、面向西）；library3d.js 有研究小間區域時「研究小間」是出口、站到研究小間的出生點',
    !!door&&door.to==='library_carrels'&&door.lv===1&&!!door.back&&door.back.lv===1&&Math.abs(door.back.yaw+Math.PI/2)<0.01&&/goes\?\{[^}]*exit:\{to:d\.to,spawn:Object\.assign\(\{\},LIBRARY_UPPER_LAYOUTS\.carrels\.spawn\)\}\}/.test(lib));
  check('2. 研究小間「回 2F 自習區」→ library_hall、站到大廳那扇門前（doors carrels 的 back）', !!back&&back.exit.spawn.x===door.back.x&&back.exit.spawn.z===door.back.z&&back.exit.spawn.lv===1);
  const dx=door.x+Math.sin(door.ry)*0.75, dz=door.z+Math.cos(door.ry)*0.75;
  check('2. 出生點離按鈕夠遠：研究小間（離「回 2F 自習區」）、大廳（back 離「研究小間」的門 1.0 m 的範圍）', !!back&&Math.hypot(C.spawn.x-back.x,C.spawn.z-back.z)>back.radius&&Math.hypot(door.back.x-dx,door.back.z-dz)>1.0,
    (back?Math.hypot(C.spawn.x-back.x,C.spawn.z-back.z).toFixed(2):'')+'／'+Math.hypot(door.back.x-dx,door.back.z-dz).toFixed(2)); }
// 3. 研究小間：十間、03 和 08、站位、節點、預約
{ const cs=C.carrels||[], c3=cs.find(c=>c.id==='03'), c8=cs.find(c=>c.id==='08'), sp=C.spots||{};
  check('3. 十間（北 01～05、南 06～10）；學姊 03 在北排、玩家 08 在南排，隔著走廊正對面', cs.length===10&&cs.filter(c=>c.row==='N').length===5&&!!c3&&c3.row==='N'&&c3.sis&&!!c8&&c8.row==='S'&&c8.mine&&Math.abs(c3.x0-c8.x0)<0.01);
  const inC=(p,c)=>p.x>c.x0&&p.x<c.x1&&p.z>c.z0&&p.z<c.z1;
  check('3. spots：sis_knock 在走廊、面向 03 的門（1 m 內）；sis_seat 在 03 裡面；sis_note 在 03 門上的小窗（小窗的 x、y 範圍內，門裡面 3 cm 內）',
    !!sp.sis_knock&&!inC(sp.sis_knock,c3)&&Math.hypot(sp.sis_knock.x-c3.door.x,sp.sis_knock.z-c3.door.z)<1.0&&Math.cos(sp.sis_knock.yaw)<-0.9
    &&!!sp.sis_seat&&inC(sp.sis_seat,c3)&&!!sp.sis_note&&sp.sis_note.x>c3.door.win[0]&&sp.sis_note.x<c3.door.win[1]&&sp.sis_note.y>c3.door.win[2]&&sp.sis_note.y<c3.door.win[3]&&Math.abs(sp.sis_note.z-c3.door.z)<0.03&&sp.sis_note.z<c3.door.z);
  const nd=C.nodes||{}; check('3. 節點寫在配置：CARREL08_DOOR_SHUT／OPEN、SIS_CARREL_*、SIS_CARREL_LAMP、STICKY_SIS、CARREL_SKY', ['CARREL08_DOOR_SHUT*','CARREL08_DOOR_OPEN*','SIS_CARREL_*','SIS_CARREL_LAMP','STICKY_SIS','CARREL_SKY'].every(k=>nd[k]));
  const a=build('library_carrels',{day:300,hour:15,flags:{}}), b=build('library_carrels',{day:300,hour:15,flags:{carrelDay:300}});
  const seat8=(r)=>r.IT.find(q=>q.seat&&q.x>c8.x0&&q.x<c8.x1&&q.z>c8.z0&&q.z<c8.z1), look8=r=>r.IT.find(q=>q.id==='door08');
  check('3. 08 沒有預約：沒有座位、門是「看」（說預約）；今天有預約（G.flags.carrelDay＝今天）：可以坐、門不用看', !seat8(a)&&!!look8(a)&&/預約/.test(look8(a).look)&&!!seat8(b)&&!look8(b)&&!!seat8(b).study);
  const D=d=>{ const s=CALENDAR.tOf?null:null; let lo=1, hi=4000; while(lo<hi){ const m=(lo+hi)>>1, o=CALENDAR.dateOf(m), k=o.y*10000+o.m*100+o.d; if(k<d) lo=m+1; else hi=m; } return lo; };
  if(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf){ const d1=D(20280301), d0=D(20271201), d2=D(20290701), wd=n=>CALENDAR.dateOf(n).wd; let w=d1; while(wd(w)>5||(CALENDAR.holiday&&CALENDAR.holiday(w))) w++;
    check('3. 學姊用 03 的時期（2028-02～2029-05）：2027-12 不在、2028-03 在、2029-07 不在；在的時段＝平日 14～17', !LUP.sisPeriod({day:d0})&&LUP.sisPeriod({day:d1})&&!LUP.sisPeriod({day:d2})&&LUP.sisHere({day:w,hour:15})&&!LUP.sisHere({day:w,hour:18})&&!LUP.sisHere({day:w+(6-wd(w)),hour:15}),
      CALENDAR.dateOf(w).key); }
  else check('3. 學姊用 03 的時期（要 calendar.js）', false); }
// 4. 電梯
{ const hf=LB3.hallFloors(LL), rf=LB3.readingFloors(LL), sf=LUP.stacksFloors(), SE=LL.stacks.elevator;
  const ok=fl=>fl.length===6&&fl.every((f,i)=>f.num===i+1)&&/^4F/.test(fl[3].label)&&!fl[3].open&&/整理/.test(fl[3].why)&&/^5F 書庫/.test(fl[4].label)&&fl[4].open&&/^6F/.test(fl[5].label)&&!fl[5].open&&/整理/.test(fl[5].why);
  const inCar=(sp,EL)=>!!sp&&sp.elev&&sp.x>EL.x0&&sp.x<EL.x1&&sp.z>EL.z0&&sp.z<EL.z1;
  check('4. 三部電梯（大廳、3F 閱覽室、5F 書庫）的樓層 1F～6F 連號：5F 書庫開，4F、6F 關（整理中）', ok(hf)&&ok(rf)&&ok(sf), [hf,rf,sf].map(f=>f.map(x=>x.label.slice(0,2)+(x.open?'':'×')).join(' ')).join('｜'));
  check('4. 往 5F 的出生點在書庫電梯的車廂裡；書庫往 1F／2F 在大廳電梯（那一層）、往 3F 在閱覽室電梯', inCar(hf[4].spawn,SE)&&hf[4].zone==='library_stacks'&&inCar(rf[4].spawn,SE)&&inCar(sf[0].spawn,LL.elevator)&&sf[1].spawn.lv===1&&inCar(sf[2].spawn,LL.reading.elevator)&&!sf[4].zone&&sf[4].lv===0);
  const r=build('library_stacks',null); check('4. 書庫的電梯：B3.buildElevator、第 0 層＝5F（base 5）、只有一層；「搭電梯」在電梯門口（callZ）', !!elevArgs&&elevArgs.elevator.base===5&&elevArgs.floors.length===1&&r.IT.some(q=>q.elevator&&Math.abs(q.z-SE.callZ)<0.01)); }
// 5. 書庫：書架、看那一排、方奕廷
{ const rows=S.rows||[], ids=new Set(S.interact.map(q=>q.id)), sp=S.spots||{};
  check('5. 十排（R1 期刊…R10 300 科學總論）＋最裡面靠西牆的參考書（不外借）', rows.length===11&&rows[0].cls==='J'&&rows[9].cls==='300'&&rows[2].cls==='370'&&rows[10].id==='row_ref'&&rows[10].x<rows[0].x);
  check('5. 「看那一排」interact：row_300…row_380、row_j、row_ref', ['row_300','row_310','row_320','row_330','row_340','row_350','row_360','row_370','row_380','row_j','row_ref'].every(k=>ids.has(k)));
  const ref=rows[10], r1=rows[0]; check('5. 方奕廷（spots.fang）在最裡面那一排的走道（西牆參考書和 R1 中間）、面向西；植物圖鑑那一格（ref_plant）在他正前方、靠西牆',
    !!sp.fang&&sp.fang.x>ref.x&&sp.fang.x<r1.x&&Math.sin(sp.fang.yaw)<-0.9&&!!sp.ref_plant&&Math.abs(sp.ref_plant.z-sp.fang.z)<0.01&&sp.ref_plant.x<sp.fang.x&&sp.ref_plant.x<S.bounds.x0+0.6); }
// 6. 導航
{ const bad=[];
  for(const [id,L,G] of [['library_carrels',C,{day:300,hour:15,flags:{carrelDay:300}}],['library_stacks',S,null]]){ const r=build(id,G), w=walker(r.nav); const sp=L.spawn;
    if(!w.clear(sp.x,sp.z,0.33)) bad.push(id+' 出生點站不住'); const seen=w.flood(sp.x,sp.z);
    for(const s of r.z.seats) if(!w.seatOk(seen,s)) bad.push(id+' 座位 '+[s.x,s.z]);
    for(const q of r.IT){ if(q.seat) continue; if(!w.near(seen,q.x,q.z,q.radius||0.8)) bad.push(id+' '+q.label); }
    for(const [k,p] of Object.entries(L.spots||{})){ if(k==='sis_seat'||k==='sis_note'||k==='ref_plant') continue; if(!w.near(seen,p.x,p.z,0.4)) bad.push(id+' spots.'+k); } }
  check('6. 兩個區域：出生點走得到每個座位的走近點、每個互動點、每個 spot（sis_seat、sis_note、ref_plant 是東西的位置，不用走到）', bad.length===0, bad.slice(0,6).join('；'));
  const c8=C.carrels.find(c=>c.id==='08'), s8=C.spots.my_seat, a=build('library_carrels',{day:300,hour:15,flags:{}}), wa=walker(a.nav), sa=wa.flood(C.spawn.x,C.spawn.z);
  const in8=[...sa].some(k=>{ const [c,r]=k.split(',').map(Number), [x,zz]=a.nav.w2(c,r); return x>c8.x0&&x<c8.x1&&zz>c8.z0+0.1&&zz<c8.z1-0.1&&Math.abs(zz)>1.6; });
  check('6. 08 沒有預約：走不進去（門擋著）', !in8&&!!s8); }
// 7. 背景的讀者、登記
{ const r=build('library_stacks',null), seats=r.z.seats; const w15=LUP.want({hour:15,day:40},seats), w23=LUP.want({hour:23,day:40},seats);
  check('7. 背景的讀者只坐窗下的閱覽桌（study）、開館時段有人、22:00 以後沒有', w15.length>0&&w15.every(i=>seats[i].study&&seats[i].z>7)&&w23.length===0, w15.length+' 位');
  const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), g=fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8'), pm=fs.readFileSync(path.join(ROOT,'src/placemap3d.js'),'utf8'), pl=fs.readFileSync(path.join(ROOT,'src/data/places.js'),'utf8');
  check('7. story3d.js 進來、待著都叫 LUP.populate（書庫）', /zoneId==='library_stacks'&&typeof LUP!=='undefined'\)\{ try\{ LUP\.populate\(GM,true\)/.test(st)&&/LUP\.populate\(GM,false\)/.test(st));
  check('7. guide3d.js（大廳 ⇄ 研究小間、電梯 ⇄ 書庫）、placemap 的地圖釘（總圖）、places 的名字和開館時間', /library_hall:\['campus','library','library_b1','library_carrels'\]/.test(g)&&/library_carrels:\['library_hall'\]/.test(g)&&/library_stacks:\['library_hall','library'\]/.test(g)
    &&/library_carrels:'library',library_stacks:'library'/.test(pm)&&/library_carrels:'總圖 2F 研究小間'/.test(pl)&&/library_stacks:'總圖 5F 書庫'/.test(pl)&&/library_stacks:\{open:8,close:22/.test(pl)); }
console.log(fails?('\n'+fails+' FAIL'):'\nALL PASS'); process.exit(fails?1:0);

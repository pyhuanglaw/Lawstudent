// 慢輪單車進得去、買車換車；單車自動停在剛離開的建築外最近的合法停車處（BIKE-SHOP-PARK-1104；AA_646；使用者 11-04 01:0x
//   「公館店面輪轉單車也要改成可以進去　可以買新的單車　單車我希望以後改成會自動出現在我剛離開的建築外合法停車的地方　不要只在宿舍樓下」）——不需要瀏覽器。
// 建出遊戲真正的區域（校園、公館、溫州街、118 巷、新生南路、慢輪單車），用 bike3d.js、bikeshop3d.js 真正的程式。
// 修改前（開發分支 393712ba7）：BIKE.KINDS、BIKE.migrate、BIKE.parkSpots、BIKESHOP 都沒有，第 1 項以後全部失敗；公館店門口只有「找車行老闆」（第 4 項失敗）；
//   從便利商店出來車停在門旁邊 2～3 m、從法律系館A出來車留在原地（第 9 項失敗）。
// 用法：node tests/bike_shop_park_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/lane118_props.js',
  'src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/bike3d.js','src/bikeshop3d.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:(/xinsheng3d|mokuyobi3d/.test(f)?3:4)));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===3)).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
// 車的模型：照 GLB 的節點表建（tests/bike_unit.js 同一個做法）
const glb=fs.readFileSync(path.join(ROOT,'assets/models/env/bike_ride.glb')); const GJ=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString());
const objs=GJ.nodes.map(n=>{ const o=new THREE.Object3D(); o.name=n.name; if(n.translation) o.position.fromArray(n.translation); if(n.rotation) o.quaternion.fromArray(n.rotation); return o; });
GJ.nodes.forEach((n,i)=>{ for(const c of n.children||[]) objs[i].add(objs[c]); }); const bikeScene=new THREE.Group(); for(const i of GJ.scenes[0].nodes) bikeScene.add(objs[i]);
ASSETS.loadOne=k=>k==='prop.bike_ride'?Promise.resolve({scene:bikeScene}):Promise.reject(new Error('no '+k));
const DK=(y,m,d)=>{ for(let k=1;k<4000;k++){ const t=CALENDAR.dateOf(k); if(t.y===y&&t.m===m&&t.d===d) return k; } return null; };
let toasts=[], said=[], picks=[], opts=[];
const G={zone:'campus',day:DK(2026,9,15),hour:15,flags:{BIKE_TIP:true},money:30000}; global.GAME={G};
const GM={E,G,toast:t=>toasts.push(t),sceneBegin(){},sceneEnd(){},memo(){},money(d){ G.money+=d; },advance(h){ G.hour+=h; },
  say:async(w,t)=>{ said.push((w?w.name+'：':'')+t); }, choose:async o=>{ opts.push(o.map(q=>q.t)); const p=picks.shift(); if(typeof p==='string'){ const k=o.findIndex(q=>q.t.includes(p)); return k<0?o.length-1:k; } return p==null?o.length-1:p; }};
global.GAME=Object.assign(GM,{G});
const P={obj:new THREE.Group(),lv:0,radius:0.32,pose:'idle'}; E.player=P; E.scene.add(P.obj);
function loadZone(id,sp){ if(E.zone&&E.zone.group.parent) E.scene.remove(E.zone.group); E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
  const z=Z3.ZONES[id].build(E); z.def=Z3.ZONES[id]; E.zone=z; E.scene.add(z.group); E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null; E.indoor=!!Z3.ZONES[id].indoor;
  const s=sp||z.spawn; P.obj.position.set(s.x,0,s.z); P.obj.rotation.set(0,s.yaw||0,0); P.lv=s.lv|0; P.path=null; P.pose='idle'; return z; }
const tick=()=>new Promise(r=>setTimeout(r,0));
async function enter(to,sp,opts){ BIKE.beforeEnter(GM,to,opts||{}); loadZone(to,sp); G.zone=to; P.pose='idle'; P.idlePose='idle'; BIKE.afterEnter(GM,to); await tick(); await tick(); }
const vis=it=>!it.hidden;
const exitTo=(to,label)=>E.interactables.find(i=>i.exit&&i.exit.to===to&&vis(i)&&(!label||i.label===label));
const parkedObj=()=>E.zone.group.children.find(o=>o.name==='bike_ride');
const inSpots=(zone)=>BIKE.parkSpots(E,zone).some(q=>Math.hypot(q.x-G.bike.x,q.z-G.bike.z)<1e-6);
/* 從室內 inner 走出到 outer（出口照真的配置）：先進 inner（站在 outer 的那個門口），再從 inner 的出口出來 */
async function walkInOut(outer,inner,doorLabel){ const door=E.zone.def.id===outer?exitTo(inner,doorLabel):null; if(door) P.obj.position.set(door.x,0,door.z);
  await enter(inner,door?door.exit.spawn:undefined); const out=exitTo(outer); await enter(outer,out.exit.spawn); return {door,out}; }
(async()=>{
  // ---- 1 五款車、存檔欄位、舊存檔 ----
  { const K=BIKE.KINDS, ids=BIKE.KIND_ORDER; check('1 五款車（淑女車 4,200、城市通勤車 6,800、小折 12,800、登山車 15,800、公路車 22,800；AA_646 第 2 節的價格）、每款三到四色',
      J(ids)===J(['lady','city','fold','mtb','road'])&&J(ids.map(k=>K[k].price))===J([4200,6800,12800,15800,22800])&&ids.every(k=>K[k].colors.length>=3&&K[k].colors.length<=4),J(ids.map(k=>[k,K[k].price,K[k].colors.length])));
    check('1 沒有後座：小折、公路車（其他三款有載妹墊）',ids.filter(k=>K[k].seat===false).join()==='fold,road');
    const old={v:3,bike:{zone:'gongguan',x:1,z:2,yaw:0.5,riding:false}}; BIKE.migrate(old);
    check('1 舊存檔（G.bike 只有 zone,x,z,yaw,riding）讀檔：補 kind＝city、color＝null、owned＝[開局那台]，位置不動',old.bike.kind==='city'&&old.bike.color===null&&J(old.bike.owned)===J([{kind:'city',color:null}])&&old.bike.zone==='gongguan'&&old.bike.x===1&&old.bike.z===2,J(old.bike));
    const twice=JSON.parse(J(old)); BIKE.migrate(twice); check('1 讀兩次檔一樣（不會重複加 owned）',J(twice)===J(old));
    const none={v:3}; BIKE.migrate(none); check('1 沒有 bike 的舊存檔：不寫（照舊＝宿舍門口那台）',!('bike' in none));
    const bad={v:3,bike:'x'}; BIKE.migrate(bad); check('1 bike 壞掉（不是物件）：丟掉，之後當宿舍門口那台',!('bike' in bad));
    const weird={bike:{zone:'campus',x:0,z:0,yaw:0,kind:'rocket',color:5,owned:[{kind:'road',color:'#1d1f22'},null,{kind:'?'}]}}; BIKE.migrate(weird);
    check('1 款式、顏色壞掉：回到城市通勤車、原色；買過的照留（壞的那幾筆丟掉）',weird.bike.kind==='city'&&weird.bike.color===null&&J(weird.bike.owned)===J([{kind:'road',color:'#1d1f22'},{kind:'city',color:null}]),J(weird.bike));
    const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); check('1 game3d.js 讀檔的 migrate 呼叫 BIKE.migrate',/BIKE\.migrate\(s\)/.test(g3)); }
  // ---- 2 沒有後座的車不載人 ----
  { await BIKE.load(); G.bike={zone:'campus',x:25,z:57.9,yaw:Math.PI/2,riding:false,kind:'fold',color:'#b8262b'}; check('2 BIKE.hasSeat：小折＝false、城市通勤車＝true',BIKE.hasSeat(G)===false&&BIKE.hasSeat({bike:{kind:'city'}})===true&&BIKE.hasSeat({})===true);
    const o=BIKE.make('#b8262b','fold'); let cushion=null; o.traverse(n=>{ if(n.name==='rear_cushion') cushion=n; }); const o2=BIKE.make(null,'city'); let c2=null; o2.traverse(n=>{ if(n.name==='rear_cushion') c2=n; });
    check('2 小折的車：載妹墊（rear_cushion）藏起來；城市通勤車照舊',!!cushion&&cushion.visible===false&&!!c2&&c2.visible===true);
    const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
    check('2 story3d.js：rideMode 沒有後座＝refuse（照「不願意坐後座」一起走路）、rideBlock 用 AA_646 原句「（這台沒有後座。）」',/S\.rideMode=function\(n\)\{[^\n]*BIKE\.hasSeat\(G\)\) return 'refuse'/.test(st)&&/S\.rideBlock=function[^\n]*return BIKE\.NO_SEAT/.test(st)&&BIKE.NO_SEAT==='（這台沒有後座。）');
    E.rideMode=n=>BIKE.hasSeat(G)?'ride':'refuse';   /* 遊戲裡是 STORY.rideMode（上面那一項檢查） */
    await enter('campus',{x:20,z:54,yaw:Math.PI}); P.obj.position.set(G.bike.x,0,G.bike.z); BIKE.mount(GM); const rode=P.riding; E.npcs.push({beh:'follow',charId:'heroine_01',obj:new THREE.Object3D()}); BIKE.tick(GM,1/30);
    check('2 騎小折、有人開始跟著走：自動下車（一起走路）',rode&&!P.riding&&!!parkedObj()); E.npcs.length=0; delete E.rideMode;
    G.bike.kind='city'; G.bike.color=null; G.bike.owned=[{kind:'city',color:null}]; }
  // ---- 3 開店時間 ----
  { const wd=d=>CALENDAR.dateOf(d).wd; let mon=G.day; while(wd(mon)!==1) mon++; const tue=mon+1;
    check('3 營業時間（PLACES.hours.bikeshop）：週二 10:00 開、19:59 開、20:00 關、09:59 關；週一公休',PLACES.isOpen('bikeshop',10,tue)&&PLACES.isOpen('bikeshop',19.98,tue)&&!PLACES.isOpen('bikeshop',20,tue)&&!PLACES.isOpen('bikeshop',9.98,tue)&&!PLACES.isOpen('bikeshop',15,mon));
    G.day=tue; G.hour=15; await enter('gongguan',{x:-0.3,z:18,yaw:0}); const its=E.interactables.filter(i=>Math.hypot(i.x+0.3,i.z-21)<0.01);
    check('4 公館店門口（G06）：開店時「進入慢輪單車」（→ bikeshop 區域），沒有「找車行老闆」',its.some(i=>vis(i)&&i.label==='進入慢輪單車'&&i.exit&&i.exit.to==='bikeshop')&&!its.some(i=>vis(i)&&/找車行老闆/.test(i.label)),J(its.map(i=>[i.label,vis(i)])));
    G.hour=20.5; const shut=its.filter(vis); G.day=mon; G.hour=15; const shutMon=its.filter(vis); G.day=tue; G.hour=15;
    check('4 打烊（20:30）、週一：門口只有字「（鐵捲門拉下來了。門上寫：週一公休。）」（AA_646 原句），進不去',shut.length===1&&shut[0].look==='（鐵捲門拉下來了。門上寫：週一公休。）'&&!shut[0].exit&&shutMon.length===1&&shutMon[0].look===shut[0].look,J(shut.map(i=>i.label)));
    check('4 招牌、區域名：慢輪單車（PLACES.names.bikeshop、Z3.ZONES.bikeshop.name）',PLACES.names.bikeshop==='慢輪單車'&&Z3.ZONES.bikeshop.name==='慢輪單車'); }
  // ---- 5 店裡 ----
  { const door=exitTo('bikeshop'); P.obj.position.set(door.x,0,door.z); await enter('bikeshop',door.exit.spawn); const its=E.interactables;
    const looks=its.filter(i=>i.bikeLook), owner=its.find(i=>i.label==='找車行老闆'), out=exitTo('gongguan');
    check('5 店裡：五台展示車各一個「看這台車」、「找車行老闆」、「離開慢輪單車」',J(looks.map(i=>i.bikeLook))===J(BIKE.KIND_ORDER)&&!!owner&&!!out&&out.label==='離開慢輪單車',J(its.map(i=>i.label)));
    const sp=E.zone.spawn; let bad=[]; for(const it of looks.concat([owner,out])){ let at=null; for(let r=0;r<it.radius&&!at;r+=0.1) for(let k=0;k<8&&!at;k++){ const x=it.x+Math.sin(k*Math.PI/4)*r, z=it.z+Math.cos(k*Math.PI/4)*r; if(E.canStand(x,z,0.3,0)) at=[x,z]; }   /* 互動範圍裡有站得住的地方（出口在牆邊：店門口，和書店一樣）*/
      if(!at){ bad.push(it.label+' 站不住'); continue; } const p=E.nav.path(sp.x,sp.z,at[0],at[1]); if(!p) bad.push(it.label+' 走不到'); }
    check('5 每個互動點的範圍裡站得住、從進門的地方走得到',!bad.length,J(bad));
    check('5 進門的地方不在出口的範圍裡（一進門不會是「離開慢輪單車」）',Math.hypot(sp.x-out.x,sp.z-out.z)>out.radius+0.2,(Math.hypot(sp.x-out.x,sp.z-out.z)).toFixed(2));
    G.hour=11; const day=BIKESHOP.ownerSpot(G); G.hour=18; const eve=BIKESHOP.ownerSpot(G); G.hour=15;
    check('5 老闆：白天在修車區、17:00 以後在櫃台（AA_646 第 1 節）',day.at==='repair'&&eve.at==='counter'&&E.canStand(day.ix,day.iz,0.3,0)&&E.canStand(eve.ix,eve.iz,0.3,0));
    // ---- 6 買車 ----
    G.money=20000; said=[]; picks=[0,1]; const t0=G.hour; await BIKESHOP.lookBike(GM,'fold');
    check('6 看小折：旁白、「（這台沒有後座。）」、老闆一句（AA_646 原文）',said[0]==='（折起來只有一個行李箱大，可以帶上捷運。）'&&said[1]==='（這台沒有後座。）'&&said[2]==='車行老闆：搬家、出去玩都方便。',J(said.slice(0,3)));
    check('6 買小折（紅）：扣 12,800、記進買過的車、現在騎的＝小折紅、停在車行門口',G.money===7200&&BIKE.owns(G,'fold','#b8262b')&&G.bike.kind==='fold'&&G.bike.color==='#b8262b'&&G.bike.zone==='gongguan'&&G.bike.x===BIKESHOP.PARK.x&&G.bike.z===BIKESHOP.PARK.z&&!G.bike.riding,J(G.bike));
    check('6 調座墊：老闆「好，我幫你調一下座墊。……十分鐘。」、時間 +10 分、旁白、「騎看看。」',J(said.slice(3))===J(['車行老闆：好，我幫你調一下座墊。……十分鐘。','（老闆把座墊調到你的高度，按了兩下車鈴。）','車行老闆：騎看看。'])&&Math.abs(G.hour-t0-10/60)<1e-9,J(said.slice(3)));
    check('6 舊車留著：買過的車＝開局那台＋小折',J(G.bike.owned)===J([{kind:'city',color:null},{kind:'fold',color:'#b8262b'}]));
    said=[]; picks=[0]; const m0=G.money; await BIKESHOP.lookBike(GM,'road');
    check('7 錢不夠（7,200 買 22,800 的公路車）：老闆「這台不急。……下次再來看。」，不扣錢、不賣',said[said.length-1]==='車行老闆：這台不急。……下次再來看。'&&G.money===m0&&!BIKE.owns(G,'road',null)&&G.bike.kind==='fold',J(said));
    said=[]; picks=[0,1]; G.money=50000; await BIKESHOP.lookBike(GM,'fold'); check('7 同款同色已經買過：那個顏色不能選、不扣錢',G.money===50000&&G.bike.owned.length===2,J(opts[opts.length-1]));
    // ---- 8 找老闆：換一台騎、打氣 ----
    let sq=0; global.SIDEQ={bikeShop:async()=>{ sq++; return true; }}; said=[]; opts=[]; picks=['換一台騎','城市通勤車']; await BIKESHOP.owner(GM);
    check('8 找車行老闆：先照舊（SQ16 的招呼 SIDEQ.bikeShop）；「換一台騎」→「哪一台？」→ 換回城市通勤車（停在車行門口）',sq===1&&said.includes('車行老闆：哪一台？')&&G.bike.kind==='city'&&G.bike.color===null&&G.bike.x===BIKESHOP.PARK.x,J({said,opts}));
    said=[]; picks=['幫我打氣']; await BIKESHOP.owner(GM); check('8 「幫我打氣」：老闆「好了。」，不扣錢',said.includes('車行老闆：好了。')&&G.money===50000,J(said));
    said=[]; opts=[]; picks=['我想看車','登山車',0,0]; await BIKESHOP.owner(GM);
    check('8 「我想看車」→ 選登山車：說明、老闆一句、買（黑）',said.includes('（輪胎很粗，前面有避震。）')&&said.includes('車行老闆：你要騎山路的話。……校園裡騎會有點重。')&&G.bike.kind==='mtb'&&G.money===50000-15800,J(said));
    delete global.SIDEQ;
    // ---- 出店：車停在車行門口（人行道，不在騎樓）----
    await enter('gongguan',out.exit.spawn);
    check('8 出店：車停在車行門口的停車位（騎樓柱子外那一排機車的端點，z<19 不在騎樓）、站得住、不擋門、有「騎腳踏車」',G.bike.zone==='gongguan'&&Math.abs(G.bike.x-BIKESHOP.PARK.x)<1e-6&&Math.abs(G.bike.z-BIKESHOP.PARK.z)<1e-6&&G.bike.z<19&&BIKE.parkOK(E,{x:G.bike.x,z:G.bike.z,yaw:G.bike.yaw})&&!!parkedObj()&&E.interactables.some(i=>i.bike),J(G.bike));
    check('8 出店的地方（人行道）不在店門口互動範圍裡、站得住',E.canStand(out.exit.spawn.x,out.exit.spawn.z,0.3,0)&&Math.hypot(out.exit.spawn.x+0.3,out.exit.spawn.z-21)>2.4); }
  // ---- 9 自動停車：每一區的合法停車處 ----
  for(const id of ['campus','gongguan','wenzhou','lane118']){ loadZone(id); const S=BIKE.parkSpots(E,id); let bad=[];
    for(const q of S){ if(!BIKE.parkOK(E,q)) bad.push(q); if(id==='gongguan'&&q.z>=19) bad.push(['騎樓',q]); }
    check('9 '+id+'：合法停車處 '+S.length+' 個，每個都站得住（車頭、車尾）、不擋出入口'+(id==='gongguan'?'、都不在騎樓（z<19）':''),S.length>=2&&!bad.length,J(bad.slice(0,3))); }
  loadZone('xinsheng'); check('9 新生南路：還沒有停車架、停車格＝沒有合法停車處（車照舊）',BIKE.parkSpots(E,'xinsheng').length===0);
  // 校園：回宿舍再出來＝宿舍門口；法律系館A＝最近的停車架
  G.bike={zone:'gongguan',x:BIKESHOP.PARK.x,z:BIKESHOP.PARK.z,yaw:0,riding:false}; G.hour=15;
  await enter('campus',{x:20,z:56,yaw:0}); G.bike={zone:'gongguan',x:BIKESHOP.PARK.x,z:BIKESHOP.PARK.z,yaw:0,riding:false};
  { const r=await walkInOut('campus','dorm_hall'); check('9 車在公館，走回宿舍、再走出宿舍：車已經停在宿舍門口（不用走回公館牽車）',G.bike.zone==='campus'&&Math.abs(G.bike.x-25)<1e-6&&Math.abs(G.bike.z-57.9)<1e-6&&!!parkedObj(),J(G.bike)); }
  { P.obj.position.set(25,0,40); const r=await walkInOut('campus','linze'); const sp=r.out.exit.spawn, d=Math.hypot(G.bike.x-sp.x,G.bike.z-sp.z);
    check('9 走進法律系館A、出來：車停在出口最近的停車架（'+d.toFixed(1)+' m、≤ '+BIKE.MAXD+' m）、站得住',G.bike.zone==='campus'&&inSpots('campus')&&d<=BIKE.MAXD&&!!parkedObj(),J(G.bike));
    toasts=[]; G.flags.BIKE_PARK_TIP=false; await enter('linze',r.door.exit.spawn); await enter('campus',r.out.exit.spawn); await new Promise(res=>setTimeout(res,1600));
    check('9 第一次自動停車的提示（只一次；AA_646 原句）',toasts.filter(t=>t===BIKE.PARK_TIP).length===1&&BIKE.PARK_TIP==='（你的車停在門口的停車架。以後從哪裡出來，車就停在那裡。）'&&G.flags.BIKE_PARK_TIP===true,J(toasts));
    toasts=[]; await enter('linze',r.door.exit.spawn); await enter('campus',r.out.exit.spawn); await new Promise(res=>setTimeout(res,1600)); check('9 第二次不再提示',!toasts.includes(BIKE.PARK_TIP)); }
  // 公館便利商店、溫州街影印店、118 巷的店
  { await enter('gongguan',{x:-0.3,z:18,yaw:0}); const r=await walkInOut('gongguan','cvs'); const sp=r.out.exit.spawn, d=Math.hypot(G.bike.x-sp.x,G.bike.z-sp.z);
    check('9 公館：從便利商店出來，車在人行道上最近的停車處（'+d.toFixed(1)+' m）、不在騎樓',G.bike.zone==='gongguan'&&inSpots('gongguan')&&G.bike.z<19&&d<=BIKE.MAXD,J(G.bike)); }
  { await enter('wenzhou'); const ex=E.interactables.find(i=>i.exit&&/^wz_print$/.test(i.exit.to)); if(ex){ const r=await walkInOut('wenzhou','wz_print'); const sp=r.out.exit.spawn, d=Math.hypot(G.bike.x-sp.x,G.bike.z-sp.z);
      check('9 溫州街：從阿德影印輸出出來，車在最近的停車格旁（'+d.toFixed(1)+' m）',G.bike.zone==='wenzhou'&&inSpots('wenzhou')&&d<=BIKE.MAXD,J(G.bike)); } else check('9 溫州街有阿德影印輸出的門',false); }
  { await enter('lane118'); const sp0=E.zone.spawn; const d=Math.hypot(G.bike.x-sp0.x,G.bike.z-sp0.z);
    check('9 118 巷：從校園後門走進來，車在最近的機車格旁（'+d.toFixed(1)+' m）',G.bike.zone==='lane118'&&inSpots('lane118')&&d<=BIKE.MAXD,J(G.bike)); }
  // 新生南路：沒有合法停車處＝照舊
  { const before=J(G.bike); await enter('xinsheng'); check('9 走到新生南路：車不跟過來（照舊留在 118 巷）',J(G.bike)===before,J(G.bike)); }
  // ---- 10 不會走一段路車就跟著；讀檔不動；騎著換區域照舊 ----
  { await enter('campus',{x:25,z:50,yaw:0}); const s0=J(G.bike); P.obj.position.set(-60,0,0); BIKE.tick(GM,1/30); check('10 在同一區走來走去：車不會跟著（只在換區域那一刻）',J(G.bike)===s0);
    const saved=JSON.parse(J(G)); await enter('campus',{x:-60,z:0,yaw:0},{fromLoad:true}); check('10 讀檔（fromLoad）：車照存檔的位置，不自動移',G.bike.x===saved.bike.x&&G.bike.z===saved.bike.z);
    P.obj.position.set(G.bike.x,0,G.bike.z); BIKE.mount(GM); const gate=E.interactables.find(i=>i.exit&&i.exit.to==='gongguan'); await enter('gongguan',gate.exit.spawn);
    check('10 騎著出校門：到公館照舊在騎（不被放到停車架）',P.riding&&G.bike.riding&&G.bike.zone==='gongguan'); BIKE.dismount(GM); }
  // ---- 11 離門太遠的停車架：停在門旁邊（和騎著進門一樣）----
  { await enter('campus',{x:-110,z:0,yaw:0}); G.bike={zone:'wenzhou',x:0,z:0,yaw:0,riding:false}; await enter('gongguan',{x:-110,z:0,yaw:0}); const gate=E.interactables.filter(i=>i.exit&&i.exit.to==='campus')[0]; P.obj.position.set(gate.x,0,gate.z);
    await enter('campus',gate.exit.spawn); const sp=gate.exit.spawn, q=BIKE.legalSpot(E,'campus',sp.x,sp.z), d=Math.hypot(G.bike.x-sp.x,G.bike.z-sp.z);
    check('11 從公館走進校門（最近的停車架 '+(q?q.d.toFixed(0):'?')+' m，超過 '+BIKE.MAXD+' m）：車停在校門旁邊、站得住',!!q&&q.d>BIKE.MAXD&&G.bike.zone==='campus'&&d<6&&E.canStand(G.bike.x,G.bike.z,0.45,0),J({bike:G.bike,d})); }
  // ---- 12 index.html、LOADLOCKS ----
  { const ih=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), sc=[...ih.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
    check('12 index.html：bikeshop3d.js 緊接在 bike3d.js 後面（zones3d.js 之後、GAME.boot() 前面很遠）',sc.indexOf('src/bikeshop3d.js')===sc.indexOf('src/bike3d.js')+1&&sc.indexOf('src/zones3d.js')<sc.indexOf('src/bikeshop3d.js')&&/bikeshop3d\.js\?v=9\.10\.19/.test(ih));
    check('12 店裡的 busy 鎖登記 LOADLOCKS（讀檔放開）',typeof LOADLOCKS['bikeshop3d:busy']==='function'); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

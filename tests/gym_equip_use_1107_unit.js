// 健身房的器材一台一台能用＋升階看得出來（GYM-FIT-1107；使用者 11-07 試玩「健身器材我還是不能用 應該要讓騎腳踏車變快 肌肉線條更明顯」）——不需要瀏覽器。
// 在 Node 建出遊戲真正的 B1（Z3.ZONES.gym_b1＋CROWD＋FIT），器材資料是 gym_layout.js b1.fitness.equip（LAWWW2-B 4f05d68d0），旁白是 AA_713（src/data/gym_equip_lines.js）：
//   1. 22 件器材在 stand 各有一個互動點，字照種類（用跑步機、用腳踏車機、用划船機、用深蹲架、用史密斯機、用啞鈴、用臥推椅、做伸展）；
//      src/data/gym_equip_lines.js 和 AA_713@60f8f6b6a 一致（tools/story/import_gym_equip.py --check）、七種器材四階各三句、levelUp 三階；index.html 載入
//   2. 只在健身中心裡面出現：站在 stand 按鈕就是它（引擎真的 nearestInteractable）；走廊、游泳池看不到
//   3. 每一種器材按了：規則和「去健身房」同一套——扣一小時、扣這個時段的行動次數、體能 +2、fitDay；說旁白的時候人在那一台的 use（位置、朝向、跑步機皮帶 0.18 m）、
//      動作對（跑步機在「普通」用走的、之後用跑的；engine 的 poseHold 擋住）；旁白是 AA_713 那一種那一階的；做完站回 stand、姿勢 idle、poseHold 放開
//   4. 同一種器材同一階三句輪流（不連續重複）、換階換那一階的三句；墊子沒有稿＝FIT_LINES 提到伸展、或沒提到器材的那幾句（都沒有就不說話）；每週第 4 次起不加體能
//   5. 有路人正在用（或正走過去要用）的那一台：互動點不出現；直接叫也只說「有人在用」、不扣時間不扣錢不動人；啞鈴架兩個位子：一個有人，另一個照樣用；走開的人不算
//   6. 休館（每月第四個星期一）、清場以後、開館以前、這個時段排滿、錢不夠：不能用（不扣時間、不加體能、不坐上去）
//   7. 升階：體能跨過 25、50、75 那一次，做完運動提示一次——AA_713 levelUp 那一階一句（旁白）＋系統字「體能：○○（走路、騎腳踏車快了一點）」，走路、騎車加成馬上套用；
//      同一階第二次不再提示；舊存檔（沒有 upIx、已經結實）不補提，之後升到經常鍛鍊才提；「去健身房」、羽球也一樣；體育課、騎車升的等空下來、下車（FIT.tick）才提
//   8. 健身房器材的路人不會放在玩家身上（玩家用完站在深蹲架前面＝那一段不放深蹲的人）
//   9. 走路、騎車真的照體能變快：引擎點地面走一步的距離＝走路 1.12 倍、騎車 1.15 倍（經常鍛鍊；E.fitWalk／E.fitBike）
//  10. 舊存檔：沒有 G.daily、沒有 eqLast／upIx／upPend 也能用；存檔 JSON 來回不壞
// 修改前（開發分支 46c460c88＋器材資料 bc413d0b9）：沒有器材的互動點、沒有 GYM_EQUIP_LINES、沒有 FIT.upCheck——FAIL。用法：node tests/gym_equip_use_1107_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const warn0=console.warn; console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const GL=/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|GYM_LAYOUT|GYM_EQUIP_LINES|GY3|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|ACTIVITIES|COURSES|SYLLABUS|CLS|CROWD|PROPS|CHAR|FIT)$/;
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){},animate(){}};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),profSpec:c=>({id:c.id,name:c.name,sex:c.gender==='f'?'f':'m'}),CROWD_X:2};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>GL.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/gym_layout.js','src/gym3d.js','src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/courses.js','src/data/syllabus.js','src/classes3d.js','src/crowd3d.js']) load(f);
let eqData=true; try{ load('src/data/gym_equip_lines.js'); }catch(e){ eqData=false; }
load('src/fit3d.js');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, near=(a,b,t)=>Math.abs(a-b)<(t||0.011);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
const B=GYM_LAYOUT.b1, EQ=(B.fitness&&B.fitness.equip)||[], byId=id=>EQ.find(e=>e.id===id);
const KINDS=['treadmill','bike','rower','squat_rack','smith','db_rack','bench','mat'];
const LABEL={treadmill:'用跑步機',bike:'用腳踏車機',rower:'用划船機',squat_rack:'用深蹲架',smith:'用史密斯機',db_rack:'用啞鈴',bench:'用臥推椅',mat:'做伸展'};
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const WED='2025-10-15', MON4='2025-10-27';
const mkG=(key,h,gym)=>({day:dayOf(key),hour:h,weekday:CALENDAR.dateOf(dayOf(key)).wd%7,flags:{introDone:true,classDone:true,afternoonDone:true},stage:'law',money:1000,courses:{},daily:gym===undefined?{gym:{card:1,pass:key.slice(0,7)}}:gym});
/* 假的 GM：記台詞、選單、字卡；說話的那一刻記下玩家在哪裡、什麼動作 */
function mkGM(G,ans){ const q=(ans||[]).slice(); const L={says:[],menus:[],toasts:[],adv:0,spent:0,at:[],walk:null,scene:0};
  return {G,E,L,sceneBegin(){ L.scene++; E.player.busy=true; },sceneEnd(){ L.scene--; if(L.scene<=0) E.player.busy=false; },advance(h){ L.adv+=h; G.hour+=h; },toast(t){ L.toasts.push(t); },caption(a,t){ L.says.push(t); },money(d){ G.money+=d; L.spent-=d; },
    say:async(w,t)=>{ const P=E.player, p=P.obj.position; L.says.push(t); L.at.push({t,x:p.x,y:p.y,z:p.z,yaw:P.obj.rotation.y,pose:P.pose,hold:!!(P.poseHold&&P.poseHold())}); },
    choose:async o=>{ L.menus.push(o.map(x=>x.t)); const a=q.shift(); return a==null?o.length-1:a; },
    walkTo:async(P,x,z,o)=>{ L.walk=[x,z]; E.placeAt(P,x,z,o&&o.lv); return true; }, sleep:async()=>{} }; }
let ZB=null;
function enterB1(G,at,crowd){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.gym_b1.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(z.nav) z.nav._cm=null; ZB=z;
  const o=new THREE.Object3D(); E.player={obj:o,radius:0.32,lv:0,seat:null,pose:'idle',busy:false}; const p=at||z.spawn; E.placeAt(E.player,p.x,p.z,0); E.camera=null; G.zone='gym_b1';
  global.GAME=mkGM(G); if(crowd) CROWD.enter({G,E,hourRate:1/150,sitAt(){}},'gym_b1'); return z; }
const itOf=id=>E.interactables.find(i=>i.gymEquip===id);
const standAt=e=>{ E.placeAt(E.player,e.stand.x,e.stand.z,0); };
const press=async(G,id,ans)=>{ const gm=mkGM(G,ans); global.GAME=gm; await GY3.useEquip(gm,byId(id)); return gm; };
const AAL=(kind,st)=>eqData&&GYM_EQUIP_LINES.kinds&&GYM_EQUIP_LINES.kinds[kind]?GYM_EQUIP_LINES.kinds[kind][st]:null;
const fake=(x,z,o)=>{ const n=Object.assign({obj:{position:new THREE.Vector3(x,0,z)},lv:0},o||{}); E.npcs.push(n); return n; };
const gymR=G=>G.daily.gym;

(async()=>{
// ---------- 1 ----------
{ const G=mkG(WED,10); enterB1(G); const its=E.interactables.filter(i=>i.gymEquip); const bad=EQ.filter(e=>{ const it=itOf(e.id); return !it||it.label!==LABEL[e.kind]||!near(it.x,e.stand.x)||!near(it.z,e.stand.z)||!it.onInteract; }).map(e=>e.id);
  check('1. 22 件器材在 stand 各一個互動點、字照種類（'+KINDS.map(k=>LABEL[k]).join('、')+'）',EQ.length===22&&its.length===22&&!bad.length,its.length+' 個；不對 '+bad.join('、'));
  let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(ROOT,'tools/story/import_gym_equip.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const shape=eqData&&KINDS.filter(k=>k!=='mat').every(k=>['普通','有在運動','結實','經常鍛鍊'].every(s=>(AAL(k,s)||[]).length===3))&&!AAL('mat','普通')&&['有在運動','結實','經常鍛鍊'].every(s=>(GYM_EQUIP_LINES.levelUp[s]||[]).length===2)&&/AA_713_gym_equip\.json@60f8f6b6a/.test(GYM_EQUIP_LINES.src);
  check('1. src/data/gym_equip_lines.js 和 AA_713@60f8f6b6a 一致（import_gym_equip.py --check）；七種器材四階各三句（dumbbell＝db_rack、squat＝squat_rack；墊子沒有稿）、levelUp 三階各兩句；index.html 在 gym3d.js 前面載入',ok&&shape&&/gym_layout\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/gym_equip_lines\.js\?v=[^"]+"><\/script>\n<script src="src\/gym3d\.js/.test(html),out.trim().slice(0,200)); }
// ---------- 2 ----------
{ const G=mkG(WED,10); enterB1(G); const bad=[];
  for(const e of EQ){ standAt(e); const it=itOf(e.id), n=E.nearestInteractable(); if(it.hidden||n!==it) bad.push(e.id+'→'+(n&&n.label)); }
  const out=[[4.1,2.0],[-10,1.2],[0,-2],[17.4,-3.2],[18,7]].map(([x,z])=>{ E.placeAt(E.player,x,z,0); return E.interactables.filter(i=>i.gymEquip&&!i.hidden).length; });
  check('2. 站在每一件的 stand：按鈕就是那一件（22 件）；走廊、游泳池、大廳看不到器材的按鈕',!bad.length&&out.every(n=>n===0),bad.join('、')+' '+J(out)); }
// ---------- 3 ----------
{ const bad=[], info=[]; const pick={treadmill:'treadmill_2',bike:'bike_3',rower:'rower_2',squat_rack:'squat_rack_1',smith:'smith_1',db_rack:'db_rack_1',bench:'bench_2',mat:'mat_3'};
  for(const k of KINDS){ const e=byId(pick[k]), G=mkG(WED,10); enterB1(G,e.stand); const gm=await press(G,e.id); const L=gm.L, r=gymR(G), u=e.use[0], a=L.at[L.at.length-1]||null, P=E.player.obj.position;
    const used=CLS.slotsOn(G)?(CLS.slotRec(G).used.am|0):1, want=k==='treadmill'?'walk':u.pose, lines=AAL(k,'普通');
    const ok=Math.abs(L.adv-1)<1e-9&&used===1&&r.fit===2&&r.fitN===1&&r.fitDay===G.day&&L.spent===0
      &&(k==='mat'||(!!a&&near(a.x,u.x)&&near(a.z,u.z)&&near(a.y,u.y||0)&&near(a.yaw,u.yaw)&&a.pose===want&&lines.includes(a.t)&&a.hold===true))
      &&near(P.x,e.stand.x)&&near(P.z,e.stand.z)&&near(E.player.obj.rotation.y,e.stand.yaw)&&E.player.pose==='idle'&&!(E.player.poseHold&&E.player.poseHold())&&GY3.using()===null;
    if(!ok) bad.push(k+' '+J({adv:L.adv,used,fit:r.fit,at:a,stand:[+P.x.toFixed(2),+P.z.toFixed(2)],pose:E.player.pose}));
    info.push(k+':'+(a?a.pose:'—')); }
  check('3. 八種器材各按一次：扣一小時、扣上午的行動次數、體能 +2、fitDay；說旁白時人在 use（位置、朝向、跑步機 0.18 m）、動作對（跑步機「普通」用走的；用的時候 poseHold 擋住、用完放開）、旁白是 AA_713 那一種「普通」的；做完站回 stand、idle',!bad.length,bad.join('；')||info.join(' '));
  const G=mkG(WED,10,{gym:{card:1,pass:'2025-10',fit:30}}); const e=byId('treadmill_4'); enterB1(G,e.stand); const gm=await press(G,e.id); const a=gm.L.at[0];
  check('3. 跑步機在「有在運動」以後用跑的（pose run＝crowd3d.js 路人那一套）、poseHold 擋住（停著不變回 idle）',!!a&&a.pose==='run'&&a.hold&&near(a.y,0.18),J(a));
  const E0=byId('bike_1'); const G2=mkG(WED,10); enterB1(G2,E0.stand); await press(G2,E0.id); const g2=await press(G2,E0.id);
  check('3. 同一個上午第二次：「這個上午已經排滿了」，不扣時間、不坐上去',g2.L.adv===0&&g2.L.toasts.some(t=>/上午已經排滿了/.test(t))&&!g2.L.at.length&&!g2.L.walk,J(g2.L.toasts)); }
// ---------- 4 ----------
{ const e=byId('rower_1'), G=mkG(WED,9); enterB1(G,e.stand); const got=[];
  for(let k=0;k<4;k++){ G.hour=9; G.day+=1; if(CALENDAR.dateOf(G.day).wd>=6) G.hour=10; const gm=await press(G,e.id); got.push(gm.L.at.length?gm.L.at[0].t:null); }
  const L=AAL('rower','普通'); check('4. 划船機「普通」：三句照順序輪流、第四次回到第一句',J(got)===J([L[0],L[1],L[2],L[0]]),J(got));
  const r=gymR(G); r.fit=50; G.day+=1; G.hour=10; if(CALENDAR.dateOf(G.day).wd>=6) G.day+=2; const gm=await press(G,e.id);
  check('4. 體能 50 以上：換「結實」那三句的第一句',gm.L.at.length&&gm.L.at[0].t===AAL('rower','結實')[0],gm.L.at.length&&gm.L.at[0].t);
  const G3=mkG(WED,10); const b=byId('bench_1'); enterB1(G3,b.stand); const day0=G3.day; for(let k=0;k<4;k++){ G3.day=day0+k; G3.hour=10; await press(G3,b.id); }
  const wk=[0,1,2,3].map(k=>CALENDAR.dateOf(day0+k).wd); check('4. 同一週第 4 次起不加體能（每週最多 3 次，和「去健身房」同一個計數）',gymR(G3).fit===6&&gymR(G3).fitN===3,J([gymR(G3).fit,wk]));
  const m=byId('mat_1'), st=['普通','有在運動','結實','經常鍛鍊'], said={}; for(const [i,f] of [[0,0],[1,30],[2,55],[3,80]]){ const G4=mkG(WED,10,{gym:{card:1,pass:'2025-10',fit:f}}); enterB1(G4,m.stand); const gm=await press(G4,m.id); said[st[i]]=gm.L.at.map(a=>a.t); }
  const FL=GY3.FIT_LINES, ok=said['普通'].length===0&&J(said['有在運動'])===J([FL['有在運動'][0]])&&said['結實'].length===0&&J(said['經常鍛鍊'])===J([FL['經常鍛鍊'][0]]);
  check('4. 墊子（AA_713 沒有稿）：「有在運動」那句提到伸展、「經常鍛鍊」沒提到器材的三句輪流；「普通」「結實」FIT_LINES 每句都在講別的器材＝不說話（還是照樣練、扣時間）',ok,J(said)); }
// ---------- 5 ----------
{ const G=mkG(WED,10); const e=byId('treadmill_1'); enterB1(G,e.stand); const n=fake(e.use[0].x,e.use[0].z); const it=itOf(e.id);
  const h1=it.hidden, nb=E.nearestInteractable(); const gm=await press(G,e.id);
  check('5. 跑步機 1 上有路人：互動點不出現；直接叫只說「有人在用」、不扣時間不扣錢不走過去',h1&&nb!==it&&gm.L.toasts.includes('有人在用')&&gm.L.adv===0&&gm.L.spent===0&&!gm.L.walk&&!gm.L.at.length,J(gm.L));
  n.leaving=true; check('5. 那個人走開（leaving）：又出現',!it.hidden);
  E.npcs=[]; fake(e.use[0].x-3,e.use[0].z,{path:[[e.use[0].x-1,e.use[0].z],[e.use[0].x,e.use[0].z]]}); check('5. 有人正走過去要用（路線的終點在那一台）：不出現',it.hidden);
  E.npcs=[]; const d=byId('db_rack_1'); fake(d.use[0].x,d.use[0].z); standAt(d); const G2=mkG(WED,10); const g2=await press(G2,d.id); const a=g2.L.at[0];
  check('5. 啞鈴架左邊的位子有人：互動點照樣出現、用右邊的位子（x '+d.use[1].x+'）',!itOf(d.id).hidden&&!!a&&near(a.x,d.use[1].x)&&near(a.z,d.use[1].z)&&a.pose==='gym_curl',J(a));
  fake(d.use[1].x,d.use[1].z); check('5. 兩個位子都有人：不出現',itOf(d.id).hidden);
  { const G3=mkG(WED,18.5); enterB1(G3,null,true); const on=EQ.filter(q=>q.use.every(u=>E.npcs.some(n=>Math.hypot(n.obj.position.x-u.x,n.obj.position.z-u.z)<0.05)));
    const hid=on.filter(q=>{ standAt(q); return itOf(q.id).hidden; }); const free=EQ.filter(q=>!on.includes(q)&&q.use.every(u=>!E.npcs.some(n=>Math.hypot(n.obj.position.x-u.x,n.obj.position.z-u.z)<0.3)));
    const shown=free.filter(q=>{ standAt(q); return !itOf(q.id).hidden; });
    check('5. 真的路人（crowd3d.js，平日 18:30）：在用的那幾台不出現（'+on.map(q=>q.id).join('、')+'），其他的出現',on.length>=2&&hid.length===on.length&&shown.length===free.length,on.length+'／'+free.length); } }
// ---------- 6 ----------
{ const e=byId('smith_1'), res=[];
  for(const [key,h,gym,want] of [[MON4,10,undefined,'今天第四個星期一，健身房休館。'],[WED,21.6,undefined,'健身房在清場了。明天吧。'],['2025-10-19',17.6,{gym:{card:1,pass:'2025-10'}},'健身房在清場了。明天吧。'],[WED,7.5,undefined,null]]){
    const G=mkG(key,h,gym); enterB1(G,e.stand); const fit0=gymR(G).fit|0; const gm=await press(G,e.id); res.push(gm.L.adv===0&&(gymR(G).fit|0)===fit0&&!gm.L.at.some(a=>a.pose!=='idle')&&!gm.L.walk&&(want?gm.L.says[0]===want:gm.L.says[0]===GY3.LOOK.gym_hours)); }
  check('6. 休館（第四個星期一）、平日 21:30／週日 17:30 以後、開館以前：說原因，不扣時間、不加體能、不走過去、不坐上去',res.every(Boolean),J(res));
  const G=mkG(WED,10,{gym:{card:1,pass:'2025-09',single:'2025-10'}}); G.money=30; enterB1(G,e.stand); const gm=await press(G,e.id);
  check('6. 這個月選了單次、錢不夠：「錢不夠」，不扣時間、不坐上去（站在 stand）',gm.L.toasts.includes('錢不夠')&&gm.L.adv===0&&!gm.L.at.length&&near(E.player.obj.position.x,e.stand.x),J(gm.L.toasts));
  const G2=mkG(WED,10,{}); enterB1(G2,e.stand); const g2=await press(G2,e.id,[1]);
  check('6. 還沒辦會員證：先在這裡辦卡（和「去健身房」同一段，選月票扣 200），再上去練',g2.L.says[0]==='B1 的櫃台。阿姨推過來一張同意書。'&&g2.L.spent===200&&gymR(G2).card&&gymR(G2).pass==='2025-10'&&g2.L.at.some(a=>a.pose==='gym_squat'),J(g2.L.says.slice(0,2))); }
// ---------- 7 ----------
{ const lu=s=>GYM_EQUIP_LINES.levelUp[s], T=s=>'體能：'+s+'（走路、騎腳踏車快了一點）';
  const e=byId('bike_2'); const G=mkG(WED,10,{gym:{card:1,pass:'2025-10',fit:24}}); enterB1(G,e.stand); E.fitWalk=undefined; E.fitBike=undefined; const gm=await press(G,e.id); const L=gm.L;
  const iLine=L.says.findIndex(t=>lu('有在運動').includes(t)), iEq=L.says.findIndex(t=>AAL('bike','有在運動').includes(t));
  check('7. 體能 24 → 26（跨過 25）：練完那句以後，一句 AA_713 levelUp「有在運動」＋「'+T('有在運動')+'」；走路、騎車加成馬上變 1.04／1.05',iEq>=0&&iLine>iEq&&L.toasts.filter(t=>t===T('有在運動')).length===1&&E.fitWalk===1.04&&E.fitBike===1.05&&gymR(G).upIx===1&&!gymR(G).upPend,J([L.says,L.toasts,E.fitWalk,E.fitBike]));
  G.day+=1; G.hour=10; const g2=await press(G,e.id); check('7. 同一階第二次：不再提示',!g2.L.says.some(t=>lu('有在運動').includes(t))&&!g2.L.toasts.some(t=>/^體能：/.test(t)));
  const G2=mkG(WED,10,{gym:{card:1,pass:'2025-10',fit:60}}); enterB1(G2,e.stand); const g3=await press(G2,e.id);
  check('7. 舊存檔（沒有 upIx、已經結實 60）：練完不補提以前升過的',!g3.L.toasts.some(t=>/^體能：/.test(t))&&!g3.L.says.some(t=>Object.values(GYM_EQUIP_LINES.levelUp).some(a=>a.includes(t)))&&gymR(G2).upIx===2);
  gymR(G2).fit=74; G2.day+=1; G2.hour=10; const g4=await press(G2,e.id); check('7. 之後升到經常鍛鍊（74 → 76）：提示一次',g4.L.toasts.filter(t=>t===T('經常鍛鍊')).length===1&&g4.L.says.some(t=>lu('經常鍛鍊').includes(t)),J(g4.L.toasts));
  const G3=mkG(WED,10,{gym:{card:1,pass:'2025-10',fit:49}}); enterB1(G3); const gw=mkGM(G3); global.GAME=gw; await GY3.workout(gw);
  check('7. 「去健身房」（49 → 51）：FIT_LINES 結實那句以後提示「結實」一次',gw.L.toasts.filter(t=>t===T('結實')).length===1&&gw.L.says.some(t=>lu('結實').includes(t))&&GY3.FIT_LINES['結實'].includes(gw.L.says[0]),J(gw.L.says));
  const G4=mkG(WED,13,{gym:{card:1,pass:'2025-10',fit:24}}); enterB1(G4); const gb=mkGM(G4,[0]); global.GAME=gb; await GY3.badminton(gb); check('7. 打羽球（24 → 25）：打完提示「有在運動」一次',gb.L.toasts.filter(t=>t===T('有在運動')).length===1,J(gb.L.toasts));
  const G5=mkG(WED,15,{gym:{card:1,pass:'2025-10',fit:49}}); enterB1(G5); const gt=mkGM(G5); gt.D={active:false}; FIT.pe(G5,{id:'pe_y1s1'});
  E.player.riding=true; const r1=FIT.tick(gt); await new Promise(r=>setTimeout(r,5)); const t1=gt.L.toasts.slice();
  E.player.riding=false; const r2=FIT.tick(gt); await new Promise(r=>setTimeout(r,5)); const r3=FIT.tick(gt); await new Promise(r=>setTimeout(r,5));
  check('7. 體育課升的（49 → 50）：騎著車不提示；下車、空下來（FIT.tick）提示一次，之後不再',!r1&&!t1.length&&r2===true&&gt.L.toasts.filter(t=>t===T('結實')).length===1&&gt.L.says.some(t=>lu('結實').includes(t))&&!r3,J([r1,t1,r2,gt.L.toasts,r3])); }
// ---------- 8 ----------
{ const e=byId('squat_rack_1'), u=e.use[0]; let away=0, onMe=0;
  for(const h of [8.5,10.2,12.6,15,17.4,18.5,19.6,21]){ enterB1(mkG(WED,h),{x:18,z:7},true); if(E.npcs.some(n=>Math.hypot(n.obj.position.x-u.x,n.obj.position.z-u.z)<0.05)) away++;
    enterB1(mkG(WED,h),e.stand,true); if(E.npcs.some(n=>Math.hypot(n.obj.position.x-u.x,n.obj.position.z-u.z)<0.5)) onMe++; }
  check('8. 玩家站在深蹲架 1 前面（用完站回 stand）：那一段不放深蹲的路人在玩家身上（玩家不在時 8 段裡有 '+away+' 段有人）',away>=1&&onMe===0,J([away,onMe])); }
// ---------- 9 ----------
{ const G=mkG(WED,10,{gym:{card:1,pass:'2025-10',fit:80}}); enterB1(G,{x:-20,z:8}); FIT.sync({G,E}); const P=E.player, step=(riding)=>{ E.placeAt(P,-20,8,0); P.riding=riding; P.run=false; P.busy=false; P.path=[[0,8]]; P.onArrive=null; const x0=P.obj.position.x; E.playerPathStep(P,0.05); return P.obj.position.x-x0; };
  const w=step(false), b=step(true); G.daily.gym.fit=0; FIT.sync({G,E}); const w0=step(false), b0=step(true); P.riding=false;
  check('9. 引擎點地面走一步：經常鍛鍊走路是普通的 1.12 倍、騎車 1.15 倍（E.fitWalk／E.fitBike 由 FIT.sync 設）',near(w/w0,1.12,0.002)&&near(b/b0,1.15,0.002)&&near(w0,E.SPD.walk*0.05,0.002)&&near(b0,E.SPD.bike*0.05,0.002),J([w,w0,b,b0].map(v=>+v.toFixed(4))));
  const en=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'); check('9. 引擎：停著的時候 run／walk 只有 poseHold（用器材）擋住才不變回 idle',/if\(\(P\.pose==='walk'\|\|P\.pose==='run'\)&&!\(P\.poseHold&&P\.poseHold\(\)\)\)\{ P\.pose='idle'; \}/.test(en)); }
// ---------- 10 ----------
{ const e=byId('treadmill_3'); const G=mkG(WED,10,undefined); delete G.daily; enterB1(G,e.stand); const gm=await press(G,e.id,[0]);
  check('10. 舊存檔沒有 G.daily：先辦卡（選單次）再練，照常',!!G.daily&&!!G.daily.gym&&G.daily.gym.card&&gm.L.at.some(a=>a.pose==='walk')&&G.daily.gym.fit===2);
  const G2=mkG(WED,10,{gym:{card:1,pass:'2025-10',fit:10,fitLast:{'普通':1}}}); enterB1(G2,e.stand); await press(G2,e.id); const s=J(G2), back=JSON.parse(s);
  check('10. 舊存檔沒有 eqLast／upIx／upPend：用得了；存檔 JSON 來回一樣、沒有 NaN',!/NaN|undefined/.test(s)&&J(back)===s&&back.daily.gym.eqLast&&back.daily.gym.eqLast['treadmill|普通']===0&&back.daily.gym.upIx===0,J(back.daily.gym)); }
console.warn=warn0; console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

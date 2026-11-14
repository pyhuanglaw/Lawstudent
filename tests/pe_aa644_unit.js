// 體育課在體育館裡真的上課（AA_644，企劃線 96d771c8d，AA 定稿 D109；PE-IN-GYM-AA644-1103；接 BUG-PE-DOOR-2D-1103）——不需要瀏覽器。用法：node tests/pe_aa644_unit.js
//   0. 讀稿：三學期每週一句旁白（各 16 句）一字不差、游泳週＝稿上地點寫 B1 的週、B1 沒開的那一句
//   1. 1F 球場的站位（遊戲真正的體育館＋人群）：老師在中圈北邊面向南、同學約 10 人在南邊圍成半圈面向老師、玩家站在半圈最南邊；那段時間兩面羽球場不打
//   2. 游泳週（大一上第 10～16 週）在 B1 游泳池：門口「進去上課」進 gym_b1 站在池邊；老師站池邊、同學坐池邊的長椅（公眾的長椅那段時間空出來、救生員照舊）；1F 球場沒有那一班
//      B1 那天沒開（第四個星期一）＝在球場、旁白換成「今天在球場講游泳的安全守則」
//   3. 朋友：有修這堂、在場（這學期在學校、認識；宥辰第 14 週以後）的站進半圈（換掉離玩家最近的路人），不在＝旁白名字換成「有人」；朋友不能搭話、下課離開
//   4. 經濟系那一年（pe_y0s1）：大一上第 1～8 週的旁白，名字換經濟系的同學（阿哲→韋綸、柏翰→阿勳），沒有法律系的朋友
//   5. 實際上課（CLS.attend）：旁白取代台詞池那一句和同學反應、館內沒有「黑板」字幕；出席、缺席（遲到超過 15 分鐘）照舊記
// 修改前（開發分支 62dc4d0fe）：沒有 CLS.PE_NARR、CLS.peNarr、CLS.pePlace——全部 FAIL。
require('./alison.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const warn0=console.warn; console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const GL=/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|GYM_LAYOUT|GY3|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|ACTIVITIES|COURSES|SYLLABUS|CLS|CROWD|PROPS|CHAR)$/;
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/gym_layout.js','src/gym3d.js','src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/courses.js','src/data/syllabus.js','src/classes3d.js','src/crowd3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>GL.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const done=()=>{ console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}};
/* 朋友在不在：測試自己定（STORY.present、STORY.knows） */
const HERE=new Set(), KNOW=new Set();
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),profSpec:c=>({id:c.id,name:c.name,sex:c.gender==='f'?'f':'m'}),CROWD_X:2,YOUCHEN:'classmate_youchen',present:id=>HERE.has(id),knows:id=>KNOW.has(id)};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
global.GAME={G:null};
const said=[], caps=[], entered=[];
const mkGM=G=>{ const GM={G,E,hourRate:1/150,npc:{},enterN:0,
    sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,st.y||0,st.z); n.obj.rotation.y=st.yaw||0; },
    spawnCharacter(id,x,z,o){ o=o||{}; if(GM.npc[id]) return GM.npc[id]; const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=o.yaw||0; const n=E.addNPC({obj:g,id,charId:id,name:id,lv:o.lv|0,talk:o.talk,talkLabel:o.talkLabel,greet:o.greet}); if(o.seat) GM.sitAt(n,o.seat); if(o.pose){ n.pose=o.pose; n.idlePose=o.pose; } GM.npc[id]=n; return n; },
    sceneBegin(){},sceneEnd(){},choose:async()=>0,toast(){},caption:(a,b)=>caps.push([a,b]),fade:()=>Promise.resolve(),advance(h){ G.hour+=h; },autosave(){},refreshGoal(){},setGoal(){},updateHUD(){},memo(){},energy(){},money(){},
    say:async(w,t)=>{ said.push({who:w?(w.name||String(w)):null,t:String(t)}); },
    enter:async(z,sp)=>{ entered.push([z,sp]); enterZ(GM,z,sp); }};
  return GM; };
function enterZ(GM,id,sp){ const G=GM.G; GAME.G=G; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; else if(z.nav) z.nav._cm=null;
  const p=sp||z.spawn; E.player={obj:{position:new THREE.Vector3(p.x,0,p.z),rotation:{y:p.yaw||0}},radius:0.32,lv:0,seat:null}; E.camera=null; G.zone=id; GM.npc={}; GM.enterN=(GM.enterN|0)+1; CROWD.enter(GM,id); return z; }
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mkG=(key,h)=>({day:dayOf(key),hour:h,flags:{},weekday:CALENDAR.dateOf(dayOf(key)).wd%7,stage:'law',zone:'campus'});
const ppl=()=>E.npcs.filter(n=>n.crowd&&/^gym_/.test(n.crowd)), role=r=>ppl().filter(n=>n.crowdRole===r);
const peIt=G=>CLS.dayItems(G).find(it=>it.room&&it.room.door==='gym')||null;
const faces=(n,P)=>{ const a=Math.atan2(P.x-n.obj.position.x,P.z-n.obj.position.z); return Math.cos(a-n.obj.rotation.y)>0.95; };
const J=JSON.stringify;
/* 課表上的日子（tests/probe：大一上週一下午二）：第 4 週 9/22 是第四個星期一（體育館休館，球場照舊上課）；第 10 週 11/3 游泳、第 13 週 11/24 第四個星期一 */
const W8='2025-10-20', W10='2025-11-03', W13='2025-11-24', W14='2025-12-01', Y1S2_W3='2026-03-09', Y2S1_W9='2026-11-02', Y2S1_W12='2026-11-23', Y0_W2='2024-09-11';

(async()=>{
  /* ========== 0 讀稿 ========== */
  let doc=''; try{ doc=cp.execSync('git show 92c089f47:"docs/story_planning/AA_644_體育課在體育館_每週旁白.md"',{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){}
  check('0. 讀稿：AA_644 @92c089f47（企劃線；§5 改第 2、4、6、8 週和游泳週中間休館）',doc.length>2000&&doc.indexOf('## 2. 每週一句旁白')>=0,doc.length+' 字');
  const sec=(tag)=>{ const a=doc.indexOf(tag); if(a<0) return []; const b=doc.indexOf('\n###',a+3), part=doc.slice(a,b<0?doc.indexOf('\n## 3',a):b), rows=[];
    for(const l of part.split('\n')){ const m=/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*(.+?)\s*\|\s*$/.exec(l); if(m) rows.push({w:+m[1],at:m[2],t:m[3]}); } return rows; };
  const D={pe_y1s1:sec('### 大一上（`pe_y1s1`'),pe_y1s2:sec('### 大一下（`pe_y1s2`'),pe_y2s1:sec('### 大二上（`pe_y2s1`')};
  /* §5（BB 23:43 三件）：大一上第 2、4、6、8 週換句（表格沒改，以 §5 為準）——每一句都要在 §5 裡 */
  const S5={2:'（暖身跑了六圈。最後一圈大家都在用走的。）',4:'（折返跑。阿哲跑在最前面，回頭喊你們快一點。）',6:'（分組三對三。球一直打到界外。）',8:'（分組比賽。柏翰站在籃下，算好位置才動。輸的那一組收球。）'};
  { const sec5=doc.slice(Math.max(0,doc.indexOf('## 5.'))); check('0. §5 的四句都在稿 §5 裡',doc.indexOf('## 5.')>0&&Object.values(S5).every(t=>sec5.indexOf(t)>=0)); }
  for(const r of D.pe_y1s1) if(S5[r.w]) r.t=S5[r.w];
  const N=typeof CLS.PE_NARR==='object'&&CLS.PE_NARR?CLS.PE_NARR:{};
  for(const cid of ['pe_y1s1','pe_y1s2','pe_y2s1']){ const rows=D[cid], L=N[cid]||[], bad=rows.filter((r,i)=>r.w!==i+1||L[i]!==r.t).map(r=>r.w+'：'+r.t+' ≠ '+L[r.w-1]);
    check('0. '+cid+'：16 句旁白和稿一字不差（照週次）',rows.length===16&&L.length===16&&!bad.length,rows.length+'／'+L.length+' '+bad.slice(0,3).join('｜')); }
  { const swim=D.pe_y1s1.filter(r=>/B1/.test(r.at)).map(r=>r.w); const others=D.pe_y1s2.concat(D.pe_y2s1).filter(r=>/B1/.test(r.at));
    check('0. 游泳週＝稿上地點寫「B1 游泳池」的週（大一上第 10～16 週；大一下、大二上都在球場）',J(swim)===J([10,11,12,13,14,15,16])&&J((CLS.PE_SWIM||{}).pe_y1s1)===J(swim)&&!others.length&&Object.keys(CLS.PE_SWIM||{}).length===1,J(swim));
    const m=/「(（今天在球場[^」]+）)」/.exec(doc); check('0. B1 沒開那一句和稿一樣',!!m&&CLS.PE_SWIM_CLOSED===m[1],m&&m[1]);
    const ex=/「阿哲跑在最前面」改成「(有人)跑在最前面」/.exec(doc); check('0. 朋友不在的版本照稿第 3 節的例子：名字換成「'+(ex?ex[1]:'?')+'」',!!ex);
    // CANON-NO-ECON-1112：經濟系那一年拿掉（第 0 項 經濟系的名字（CLS.PE_Y0））
    check('0. 有修這堂的朋友（稿：阿哲、柏翰、明軒、Alison、芯慈、宥辰）',/阿哲、柏翰、明軒、Alison、芯慈、宥辰/.test(doc)&&J(CLS.PE_FRIENDS)===J(['zhe','classmate_bohan','classmate_mingxuan','yu','classmate_xinci','classmate_youchen']));
    const nm=CLS.PE_NAME||{}; check('0. 旁白裡出現的名字每一個都對到人物（阿哲、柏翰、明軒、Alison、芯慈）',Object.values(N).flat().every(t=>!/阿哲|柏翰|明軒|Alison|芯慈|宥辰/.test(t)||Object.keys(nm).some(k=>t.indexOf(k)>=0))&&Object.values(nm).every(id=>!!CHARACTERS[id])); }
  if(!CLS.peNarr||!CLS.pePlace){ done(); return; }

  /* ========== 1 球場站位 ========== */
  { const G=mkG(W8,15.6), GM=mkGM(G), it=peIt(G); enterZ(GM,'gym',CLS.PE_IN_GYM); const t=role('pe_teacher')[0], st=role('pe_student'), P=CLS.PE_IN_GYM;
    check('1. 大一上第 8 週（10/20）體育課：在 1F 球場上（CLS.pePlace＝gym、中圈前的站位）',!!it&&J(CLS.pePlace(G,it))===J(Object.assign({zone:'gym'},CLS.PE_IN_GYM)),it&&it.c.id);
    check('1. 老師：中圈北邊（中圈 (0,−4)，半徑 1.8 m）、面向南（面向學生）、名牌「體育老師」',!!t&&t.obj.position.z<-5.8&&Math.abs(t.obj.position.x)<0.3&&Math.cos(t.obj.rotation.y)>0.99&&t.name==='體育老師',t?t.name+' '+t.obj.position.x.toFixed(2)+','+t.obj.position.z.toFixed(2):'沒有');
    const R=CROWD.PE_RING, d=n=>Math.hypot(n.obj.position.x-R.c[0],n.obj.position.z-R.c[1]);
    check('1. 同學 10 人圍成半圈：都在圓心 (0,−6.8) 半徑 4.2 m 上、在老師南邊或兩側、每個人面向老師',st.length===10&&st.every(n=>Math.abs(d(n)-R.r)<0.05&&n.obj.position.z>t.obj.position.z-1&&faces(n,t.obj.position)),st.length+' 人');
    check('1. 玩家站在半圈最南邊那一格、面向老師（同一個圓上）',Math.abs(Math.hypot(P.x-R.c[0],P.z-R.c[1])-R.r)<0.05&&Math.cos(P.yaw-Math.atan2(t.obj.position.x-P.x,t.obj.position.z-P.z))>0.99);
    const near=st.map(n=>Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z)).sort((a,b)=>a-b);
    check('1. 半圈的人不擠在玩家身上（最近 1.4 m 以上）、站得住',near[0]>1.4&&st.every(n=>E.canStand(n.obj.position.x,n.obj.position.z,0.3,0))&&E.canStand(P.x,P.z,0.3,0),near[0].toFixed(2));
    check('1. 上課那段時間兩面羽球場沒人打（整個球場是那一班的）',!role('badminton').length,role('badminton').length+' 人');
    check('1. 一層最多 16 個完整人物',ppl().length<=16,ppl().length+' 人');
    enterZ(GM,'gym',null); G.hour=18.2; enterZ(GM,'gym',null); check('1. 下課以後（18:12）：老師、同學走了，羽球場照舊有人',!role('pe_teacher').length&&!role('pe_student').length&&role('badminton').length>=2,role('badminton').length+' 人打羽球'); }

  /* ========== 2 游泳週 ========== */
  { const G=mkG(W10,15.6), GM=mkGM(G), it=peIt(G);
    check('2. 大一上第 10 週（11/3）是游泳週、B1 開著：CLS.peSwim、pePlace＝gym_b1 的池邊',!!it&&it.week===10&&CLS.peSwim(G,it)&&CLS.pePlace(G,it).zone==='gym_b1',it&&('w'+it.week));
    entered.length=0; const att0=CLS.attend; let got=null; CLS.attend=async(gm,x,o)=>{ got=o; }; await CLS.doorInteract(GM,'gym'); CLS.attend=att0;
    const en=entered[0]; check('2. 校園門口「進去上課」：走進 B1（gym_b1）、站在池邊（CLS.PE_POOL），帶 inGym 上課',!!en&&en[0]==='gym_b1'&&Math.abs(en[1].x-CLS.PE_POOL.x)<0.01&&Math.abs(en[1].z-CLS.PE_POOL.z)<0.01&&!!got&&got.inGym===true,J(entered));
    const P=CLS.PE_POOL, t=role('pe_swim_teacher')[0], st=role('pe_swim'), sit=st.filter(n=>n.seat), B=GYM_LAYOUT.b1.pool;
    check('2. 池邊：玩家站得住、在游泳池那一側（池子外、牆的北邊）',E.canStand(P.x,P.z,0.3,0)&&P.z<B.z1&&!(P.x>B.basin.x0&&P.x<B.basin.x1&&P.z>B.basin.z0&&P.z<B.basin.z1));
    check('2. 老師站池邊（站得住、面向長椅）、名牌「體育老師」；玩家面向老師',!!t&&t.name==='體育老師'&&E.canStand(t.obj.position.x,t.obj.position.z,0.3,0)&&t.obj.position.z<B.z1&&Math.cos(t.obj.rotation.y)>0.99&&Math.cos(P.yaw-Math.atan2(t.obj.position.x-P.x,t.obj.position.z-P.z))>0.99,t?t.obj.position.x+','+t.obj.position.z:'沒有');
    const PB=GYM_LAYOUT.b1.poolBenches;
    check('2. 同學坐在池邊的長椅（6 個坐、面向池子）＋旁邊站 2 個；坐的都在長椅上',sit.length===6&&st.length===8&&sit.every(n=>n.pose==='sit'&&PB.some(b=>Math.abs(n.obj.position.x-b[0])<0.8&&Math.abs(n.obj.position.z-b[1])<0.3)&&Math.cos(n.obj.rotation.y)<-0.99)&&st.filter(n=>!n.seat).every(n=>E.canStand(n.obj.position.x,n.obj.position.z,0.3,0)&&faces(n,t.obj.position)),sit.length+' 坐、'+(st.length-sit.length)+' 站');
    check('2. 上課那段時間池邊長椅沒有一般的人（給那一班）；救生員照舊在',!role('pool_bench').length&&role('lifeguard').length===1);
    check('2. B1 最多 16 個完整人物',ppl().length<=16,ppl().length+' 人');
    const pi=E.interactables.find(q=>q.label==='體育課集合（池邊）'); check('2. 池邊有「體育課集合（池邊）」（那天有游泳課才看得到；在走廊看不到）',!!pi&&pi.visIf({x:P.x,z:P.z})&&!pi.visIf({x:18,z:7})&&E.canStand(pi.x,pi.z,0.3,0));
    enterZ(GM,'gym',null); check('2. 游泳週的 1F 球場：沒有那一班（老師、半圈都不在），羽球照打',!role('pe_teacher').length&&!role('pe_student').length&&role('badminton').length>=2);
    /* 館內 1F 中圈「體育課集合」→ 下樓到池邊 */
    const ci=E.interactables.find(q=>q.label==='體育課集合'); entered.length=0; got=null; CLS.attend=async(gm,x,o)=>{ got=o; }; const GA=global.GAME; global.GAME=GM; await ci.onInteract(); global.GAME=GA; await new Promise(r=>setTimeout(r,0)); CLS.attend=att0;
    check('2. 館內 1F 中圈「體育課集合」：游泳週＝下樓到池邊再上課',entered.length===1&&entered[0][0]==='gym_b1'&&!!got&&got.inGym===true,J(entered.map(e=>e[0])));
    G.hour=18.2; enterZ(GM,'gym_b1',null); check('2. 下課以後：那一班走了、長椅又有一般的人',!role('pe_swim').length&&!role('pe_swim_teacher').length&&role('pool_bench').length>=1);
    const G13=mkG(W13,15.6), it13=peIt(G13);
    check('2. 第 13 週（11/24，第四個星期一 B1 休館）：在 1F 球場上、旁白換成 §5「（今天 B1 游泳池休館，改在球場練划手和換氣的動作。）」（已經下過水）',!!it13&&it13.week===13&&!CLS.peSwim(G13,it13)&&CLS.pePlace(G13,it13).zone==='gym'&&CLS.peNarr(G13,it13)===CLS.PE_SWIM_CLOSED_MID&&CLS.PE_SWIM_CLOSED_MID==='（今天 B1 游泳池休館，改在球場練划手和換氣的動作。）',it13&&CLS.peNarr(G13,it13));
    const GM13=mkGM(G13); enterZ(GM13,'gym',CLS.PE_IN_GYM); check('2. 第 13 週：半圈在球場（老師＋10 人）',role('pe_teacher').length===1&&role('pe_student').length===10);
    const z0=Z3.ZONES.gym_b1; delete Z3.ZONES.gym_b1; const Gx=mkG(W10,15.6), itx=peIt(Gx); const nb=!CLS.peSwim(Gx,itx)&&CLS.pePlace(Gx,itx).zone==='gym'&&CLS.peNarr(Gx,itx)===CLS.PE_SWIM_CLOSED; Z3.ZONES.gym_b1=z0;
    check('2. 沒有 B1 區域（還沒開放）：游泳週照舊在球場、用 B1 沒開那一句',nb); }

  /* ========== 3 朋友 ========== */
  { HERE.clear(); KNOW.clear(); const G=mkG(W8,15.6), it=peIt(G);
    const w2=Object.assign({},it,{week:4}), w6=Object.assign({},it,{week:8});   /* AA_644 §5：有名字的兩句搬到第 4、8 週 */
    check('3. 沒有朋友在場：第 4 週「有人跑在最前面」、第 8 週「有人站在籃下」（§5）',CLS.peNarr(G,w2)==='（折返跑。有人跑在最前面，回頭喊你們快一點。）'&&CLS.peNarr(G,w6)==='（分組比賽。有人站在籃下，算好位置才動。輸的那一組收球。）',CLS.peNarr(G,w2)+CLS.peNarr(G,w6));
    HERE.add('zhe'); check('3. 阿哲這學期在學校、還不認識：照舊「有人」',CLS.peNarr(G,w2).indexOf('有人跑在最前面')>=0);
    KNOW.add('zhe'); check('3. 阿哲在場、認識：「阿哲跑在最前面」（稿上那一句）',CLS.peNarr(G,w2)===CLS.PE_NARR.pe_y1s1[3]);
    const G2=mkG(Y1S2_W3,15.6), i2=peIt(G2); check('3. Alison 不在：「有人每打一球就喊一聲」（名字後面的半形空格一起拿掉）',!!i2&&i2.week===3&&CLS.peNarr(G2,i2)==='（兩人一組對打。有人每打一球就喊一聲。）',i2&&CLS.peNarr(G2,i2));
    HERE.add('yu'); KNOW.add('yu'); check('3. Alison 在：照稿',CLS.peNarr(G2,i2)===CLS.PE_NARR.pe_y1s2[2]);
    const G3=mkG(Y2S1_W12,15.6), i3=peIt(G3); HERE.delete('zhe'); check('3. 大二上第 12 週阿哲不在：「有人傳給你一球，你沒進，他說沒事啦。」',!!i3&&i3.week===12&&CLS.peNarr(G3,i3)==='（分組比賽。有人傳給你一球，你沒進，他說沒事啦。）',i3&&CLS.peNarr(G3,i3)); HERE.add('zhe');
    for(const id of ['classmate_youchen','classmate_bohan']){ HERE.add(id); KNOW.add(id); }
    check('3. 宥辰：常常不在，第 14 週以後才來（第 8 週不算在場、第 14 週在）',!CLS.peFriends(G,it).includes('classmate_youchen')&&CLS.peFriends(mkG(W14,15.6),peIt(mkG(W14,15.6))).includes('classmate_youchen'));
    /* 站進半圈 */
    const GM=mkGM(G); enterZ(GM,'gym',CLS.PE_IN_GYM); const before=role('pe_student').map(n=>n.crowdKey), fr=CLS.peFriends(G,it); const cast=CLS.peCast(GM,it);
    const P=CLS.PE_IN_GYM, st=role('pe_student'), idx=k=>+String(k).split('|').pop();
    check('3. 有修這堂、在場的朋友（阿哲、柏翰、Alison）站進半圈：換掉離玩家最近的 3 個路人，總人數不變（10）',J(fr)===J(['zhe','classmate_bohan','yu'])&&cast.length===3&&st.length===7&&cast.every(n=>Math.abs(Math.hypot(n.obj.position.x-CROWD.PE_RING.c[0],n.obj.position.z-CROWD.PE_RING.c[1])-CROWD.PE_RING.r)<0.05&&faces(n,role('pe_teacher')[0].obj.position))&&st.every(n=>idx(n.crowdKey)>3),J(fr)+' '+st.map(n=>idx(n.crowdKey)).join(','));
    const nearF=Math.max(...cast.map(n=>Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z))), nearX=Math.min(...st.map(n=>Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z)));
    check('3. 朋友比路人更靠近玩家',nearF<=nearX+1e-6,nearF.toFixed(2)+' ≤ '+nearX.toFixed(2));
    check('3. 朋友不能搭話（旁白裡出現就好，不另開對話）、下課（'+it.t1.toFixed(2)+'）照作息離開',cast.every(n=>!n.talk&&n.until===it.t1&&n.peFriend===it.key));
    CROWD.resync(GM); check('3. 人群重排（時間跳了）：換掉的位子不再放路人（不會兩個人疊在一起）',role('pe_student').length===7&&!role('pe_student').some(n=>idx(n.crowdKey)<=3));
    CLS.peCast(GM,it); check('3. 再叫一次不重複生（同一個人一個）',E.npcs.filter(n=>n.charId==='zhe').length===1&&role('pe_student').length===7);
    /* 游泳週：朋友坐上長椅 */
    const Gs=mkG(W10,15.6), its=peIt(Gs), GMs=mkGM(Gs); enterZ(GMs,'gym_b1',CLS.PE_POOL); const cs=CLS.peCast(GMs,its);
    check('3. 游泳週：朋友坐上池邊的長椅（離玩家最近的位子），長椅上的人數不變（6）',cs.length===3&&cs.every(n=>n.seat&&n.pose==='sit')&&role('pe_swim').filter(n=>n.seat).length===3,cs.map(n=>n.charId+(n.seat?'坐':'站')).join(' '));
    HERE.clear(); KNOW.clear(); }

  // CANON-NO-ECON-1112：經濟系那一年拿掉（第 4 項 經濟系那一年的體育課（pe_y0s1、pe_y0s2））

  /* ========== 5 實際上課 ========== */
  { HERE.add('zhe'); KNOW.add('zhe');
    const run=async(key,h,o)=>{ const G=Object.assign(mkG(key,h),{money:1000,daily:{},energy:70}), GM=mkGM(G), it=peIt(G); said.length=0; caps.length=0; const P=CLS.pePlace(G,it); enterZ(GM,P.zone,P); let r=null, err='';
      try{ r=await CLS.attend(GM,it,Object.assign({door:true,inGym:true},o||{})); }catch(e){ err=String(e&&e.stack||e).split('\n').slice(0,3).join(' / '); } return {G,GM,it,r,err,R:CLS.rec(G),L:said.map(s=>s.t)}; };
    const a=await run(W8,15.4); const pool=(SYLLABUS.pools.pe_y1s1||{}), w8=CLS.PE_NARR.pe_y1s1[7].replace('柏翰','有人');   /* §5：第 8 週有柏翰的名字；這裡柏翰不在場＝「有人」*/
    check('5. 第 8 週上課（CLS.attend）：說了這週的旁白「'+w8+'」',!a.err&&a.L.includes(w8),a.err||J(a.L));
    check('5. 台詞池那一句、同學反應不說（旁白取代）',!a.L.some(t=>(pool.lines||[]).some(l=>t.indexOf(l)>=0))&&!a.L.some(t=>(pool.react||[]).some(r=>t.indexOf(r.text)>=0)),J(a.L));
    check('5. 館內沒有「黑板」字幕（體育館沒有黑板）',!caps.some(c=>c[0]==='黑板'),J(caps));
    check('5. 出席照舊：done、attend +1、沒有缺席；時間快轉到下課',a.r===true&&a.R.done[a.it.key]===1&&a.R.attend.pe_y1s1===1&&!a.R.abs[a.it.key]&&a.G.hour>=a.it.t1-1e-6);
    check('5. 上課時阿哲（在場、認識）站進半圈（CLS.attend 帶 inGym 會叫 CLS.peCast）',!!a.GM.npc.zhe&&a.GM.npc.zhe.peFriend===a.it.key&&a.GM.npc.zhe.until===a.it.t1);
    const b=await run(W10,15.4); check('5. 游泳週上課：在 B1、說第 10 週的旁白',!b.err&&b.G.zone==='gym_b1'&&b.L.includes(CLS.PE_NARR.pe_y1s1[9]),b.err||J(b.L));
    const c=await run(W14,15.5+20/60); check('5. 遲到超過 15 分鐘、選了還是進去聽：記缺席（R.abs）、旁白照說',!c.err&&c.R.abs[c.it.key]===1&&c.L.includes(CLS.PE_NARR.pe_y1s1[13]),c.err||J(c.L));
    check('5. 遲到超過 15 分鐘（AA_644 §4）：體育館版「（你到的時候…）」，沒有教室的「從後門進去」',!c.err&&c.L.some(x=>/^（你到的時候大家已經/.test(x))&&!c.L.some(x=>/從後門進去/.test(x)),c.err||J(c.L));
    HERE.delete('zhe'); const d=await run(Y2S1_W9,15.4); check('5. 大二上第 9 週：阿哲不在場＝「有人說終於輪到籃球了。」（AA_644 §4：不認識的人不會知道他等一年）',!d.err&&d.it.week===9&&d.L.includes('（換籃球。有人說終於輪到籃球了。）')&&!d.L.some(x=>/等一年/.test(x)),d.err||J(d.L));
    HERE.clear(); KNOW.clear(); }
  /* AA_644 §4（AA 11-03 23:36）：第 16 週休館版、遲到 1～15 分鐘的體育館版 */
  check('6. 第 16 週碰到 B1 休館＝「（B1 游泳池今天休館。期末改在球場考體適能。）」；其他游泳週照舊「下週下水」',CLS.PE_SWIM_CLOSED16==='（B1 游泳池今天休館。期末改在球場考體適能。）'&&/\(it\.week\|0\)===16\?S\.PE_SWIM_CLOSED16:\(\(it\.week\|0\)>=11\?S\.PE_SWIM_CLOSED_MID:S\.PE_SWIM_CLOSED\)/.test(require('fs').readFileSync(require('path').join(__dirname,'..','src/classes3d.js'),'utf8')));
  check('6. 遲到的體育館版（球場／游泳池各兩句，照 AA_644 §4）',J(CLS.PE_LATE)===J({gym:{abs:'（你到的時候大家已經在暖身了。你站到半圈最後面。）',late:'先跑兩圈再進來。'},gym_b1:{abs:'（你到的時候大家已經下水了。）',late:'先在池邊暖身。'}}));
  console.warn=warn0; done();
})().catch(e=>{ console.log('ERR',e.stack); process.exit(1); });

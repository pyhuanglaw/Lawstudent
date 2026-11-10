/* 山嵐書店的按鈕與旁白（src/shanlan_sys3d.js 包住 SH3.zone.build；AA_695 企劃線 88ed60310，任務 ART-SHANLAN-BOOKSTORE-1103）：不需要瀏覽器，在 Node 裡建出遊戲真正的區域 xs_shanlan，
   用假的 GM（記下說了什麼、時間、坐下站起）按按鈕：
   ① src/shanlan_sys3d.js 載得到（SHL）、SH3.zone.build 已經包上；index.html 接在 shanlan3d.js、story3d.js 後面、GAME.boot() 前面；白名單 AA_695@88ed60310 approved
   ② 建出來的區域：配置 interact 7 個點都有按鈕（名字照配置、樓層照配置、位置照配置），旁白一字照 AA_695 第 1 節；
      floorSit 10 處都有按鈕（坐在書架中間看書／坐在法律區看書、樓層照配置）；原本 16 個座位、出口不變；再建一次不重複；新生南路沒有這些按鈕
   ③ 看看：說 AA_695 那一句、時間不動
   ④ 坐地板：走過去、坐在地上（sitAt 的 floor＝跪坐那一套、樓層照配置）、手上拿書（read 姿勢；BUG-SHANLAN-BOOK，使用者 11-07）、轉暗、時間剛好過一小時、那一區那一句、起身；
      藝術區 17:00 以前白天那一句、17:00 以後「窗外已經暗了」；G 除了時間以外什麼都沒變（D118：不加讀書進度、不加數值）
   ⑤ 打烊前不到一小時（週四 21:30；AA_613 22:00 關）坐地板按鈕藏起來、按了也不過時間；週四 20:30、週五 21:30（23:00 關）照常
   ⑥ AA_695 原稿（git show 88ed60310）逐句找得到程式裡的每一句
   修改前（開發分支 b9b91e569）：沒有 src/shanlan_sys3d.js＝載入就停（FAILED 1）。修改後 ALL PASS。
   用法：node tests/shanlan_act_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址）
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/shanlan_layout.js','src/shanlan3d.js','src/shanlan_sys3d.js'];
const miss=files.filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(miss.length){ check('① 檔案都在',false,miss.join('、')); console.log('FAILED '+fails); process.exit(1); }
/* 遊戲裡 story3d.js 比 shanlan_sys3d.js 先載：這裡用一個最小的 STORY（只有 interact，其他按鈕回 false）*/
let baseCalls=0; global.STORY={interact:async()=>{ baseCalls++; return false; }};
global.GAME={G:null};
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const L=SHANLAN_LAYOUT, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sec=(n,f)=>{ try{ return f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const asec=async(n,f)=>{ try{ return await f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };

/* AA_695 的句子（一字照抄；第 1 節照配置 interact 的順序、第 2 節照 section）*/
const LOOK=['（平台上擺著這個月的新書。有一本法律的，書腰寫「給第一次打官司的人」。）','（這一座是翻譯小說。每一本旁邊都立著一張店員手寫的小卡。）','（雜誌牆從地板排到天花板。最上面那一排，要踮腳才拿得到。）',
  '（筆都可以試寫。試寫的那張紙已經寫滿了，大部分是名字。）','（店員在幫前面的人包書套。你手上沒有要買的。）','（六法排了三種版本。考試用書那一櫃，最下面一層翻得最舊。）','（走道上坐了三個人，各看各的。沒有店員來趕人。）'];
const SIT={'文學':'（你坐在書架中間，看完半本小說。旁邊的人換了兩個。）','藝術':'（你翻了一本攝影集。抬頭的時候窗外已經暗了。）','法律':'（你在法律區翻了一本《民法總則》的新版，翻到一半，覺得還是圖書館的舊版好讀。）',
  '人文':'（你翻了一本寫城市的書，看到第三章，腳麻了。）','一樓書架':'（一樓有人在結帳，有人在講電話。你還是看完了兩篇短篇。）'};
const ART_DAY='（你翻了一本攝影集。抬頭的時候，對面那個人也在看同一本。）';

// ①
{ const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), ix=f=>html.indexOf('<script src="'+f), boot=html.indexOf('GAME.boot()');
  const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.find(f=>/AA_695_/.test(f.path));
  check('① SHL 載得到、SH3.zone.build 已經包上（Z3.ZONES.xs_shanlan 就是 SH3.zone）',typeof SHL!=='undefined'&&SH3.zone._shl===true&&Z3.ZONES.xs_shanlan===SH3.zone);
  check('① index.html：shanlan_sys3d.js 在 shanlan3d.js、story3d.js 後面、GAME.boot() 前面',ix('src/shanlan_sys3d.js')>Math.max(ix('src/shanlan3d.js'),ix('src/story3d.js'))&&ix('src/shanlan3d.js')>0&&ix('src/shanlan_sys3d.js')<boot);
  check('① 白名單：AA_695@88ed60310 approved（kind text）',!!allow&&allow.sha==='88ed60310'&&allow.status==='approved'&&allow.kind==='text',allow?J([allow.sha,allow.status]):'沒有'); }

const BTN=()=>E.interactables.filter(q=>q.shlLook||q.shlSit);
let z=null;
// ②
sec('②',()=>{ z=loadZone('xs_shanlan');
  const looks=E.interactables.filter(q=>q.shlLook), sits=E.interactables.filter(q=>q.shlSit), seats=E.interactables.filter(q=>q.seat), ex=E.interactables.filter(q=>q.exit);
  check('② 互動點 7 個都有按鈕：名字、樓層、位置照配置，旁白一字照 AA_695 第 1 節',J(looks.map(q=>[q.label,q.lv,q.x,q.z,q.shlLook]))===J(L.interact.map((q,i)=>[q.label,q.lv|0,q.x,q.z,LOOK[i]])),J(looks.map(q=>q.label)));
  check('② 坐地板 10 處都有按鈕：名字（坐在書架中間看書／坐在法律區看書）、樓層、位置、區照配置',sits.length===10&&J(sits.map(q=>[q.label,q.lv,q.x,q.z,q.shlSit.section,q.shlSit.lv]))===J(L.floorSit.map(q=>[q.label,q.lv|0,q.x,q.z,q.section,q.lv|0]))&&sits.every(q=>['坐在書架中間看書','坐在法律區看書'].includes(q.label)),J(sits.map(q=>q.label)));
  check('② 原本的 16 個座位（長椅、閱讀桌照舊）、出口「離開山嵐書店」不變；新按鈕都不是座位（不帶 seat）',seats.length===16&&ex.length===1&&ex[0].label==='離開山嵐書店'&&BTN().every(q=>!q.seat&&!q.exit)&&E.interactables.length===16+1+7+10,String(E.interactables.length));
  loadZone('xs_shanlan'); const n2=BTN().length; loadZone('xinsheng'); const n3=BTN().length;
  check('② 再進一次店：按鈕還是 17 個（不重複加）；新生南路沒有這些按鈕',n2===17&&n3===0,J([n2,n3])); });

// 假的 GM
const wd=d=>CALENDAR.dateOf(d).wd; let THU=1, FRI=1; while(wd(THU)!==4) THU++; while(wd(FRI)!==5) FRI++;
function mkGM(hour,day){ const G={hour,day,zone:'xs_shanlan',stats:{study:5,charm:3},legal:{k:{a:1}},notes:[],flags:{x:1},money:500,rel:{an:2}}; GAME.G=G;
  const log={said:[],walk:[],sit:[],stand:0,fade:[],adv:[],scene:0};
  const P=E.player; P.seat=null;
  const GM={G,E,
    say:async(sp,t)=>{ log.said.push([sp,t,E.player.pose]); }, sceneBegin(){ log.scene++; }, sceneEnd(){ log.scene--; },
    walkTo:async(ent,x,zz,o)=>{ log.walk.push([x,zz,o&&o.lv]); }, seatApproach:s=>[s.x+Math.sin(s.yaw)*0.6,s.z+Math.cos(s.yaw)*0.6],
    sitAt(ent,s){ log.sit.push(Object.assign({},s)); ent.seat=s; ent.pose='sit'; }, standUp(ent){ log.stand++; ent.seat=null; ent.pose='idle'; },
    fade:async on=>{ log.fade.push(on); }, advance(h){ log.adv.push(h); G.hour+=h; }, autosave(){}, toast(){} };
  return {G,GM,log}; }
const strip=G=>{ const o=Object.assign({},G); delete o.hour; return J(o); };

(async()=>{
await asec('③',async()=>{ z=loadZone('xs_shanlan'); const bad=[];
  for(const it of E.interactables.filter(q=>q.shlLook)){ const {G,GM,log}=mkGM(15,THU), b0=baseCalls, r=await STORY.interact(it,GM);
    if(!(r===true&&log.said.length===1&&log.said[0][0]===null&&log.said[0][1]===it.shlLook&&G.hour===15&&!log.adv.length&&log.scene===0&&baseCalls===b0)) bad.push(it.label+' '+J(log)); }
  check('③ 看看 7 個：說 AA_695 那一句（旁白）、時間不動',!bad.length,bad.join('｜'));
  const {GM}=mkGM(15,THU), b0=baseCalls; await STORY.interact({label:'別的',x:0,z:0},GM); check('③ 別的按鈕照舊交給原本的 STORY.interact',baseCalls===b0+1); });

await asec('④',async()=>{ z=loadZone('xs_shanlan'); const bad=[];
  for(const it of E.interactables.filter(q=>q.shlSit)){ for(const h of [15,18]){ const {G,GM,log}=mkGM(h,THU), before=strip(G), r=await STORY.interact(it,GM), sp=it.shlSit;
    const want=sp.section==='藝術'&&h<17?ART_DAY:SIT[sp.section], s=log.sit[0]||{};
    const ok=r===true&&log.walk.length===1&&log.walk[0][2]===sp.lv&&log.sit.length===1&&s.x===sp.x&&s.z===sp.z&&s.yaw===sp.yaw&&s.lv===sp.lv&&s.floor>0&&s.floor<0.1
      &&J(log.fade)===J([true,false])&&J(log.adv)===J([1])&&Math.abs(G.hour-(h+1))<1e-9&&log.said.length===1&&log.said[0][0]===null&&log.said[0][1]===want&&log.said[0][2]==='read'&&log.stand===1&&!E.player.seat&&strip(G)===before&&log.scene===0;
    if(!ok) bad.push(sp.section+'('+sp.x+','+sp.z+')@'+h+' '+J(log).slice(0,240)); } }
  check('④ 坐地板 10 處（15:00、18:00 各一次）：走過去、坐在地上（floor）、轉暗、過一小時、那一區那一句、起身；G 除了時間都沒變',!bad.length,bad.join('｜'));
  const art=E.interactables.find(q=>q.shlSit&&q.shlSit.section==='藝術');
  const r1=mkGM(16.9,THU); await STORY.interact(art,r1.GM); const r2=mkGM(17,THU); await STORY.interact(art,r2.GM);
  check('④ 藝術區：16:54 坐下＝白天那一句、17:00 坐下＝「窗外已經暗了」',r1.log.said[0][1]===ART_DAY&&r2.log.said[0][1]===SIT['藝術'],J([r1.log.said,r2.log.said])); });

await asec('⑤',async()=>{ z=loadZone('xs_shanlan'); const sits=E.interactables.filter(q=>q.shlSit), looks=E.interactables.filter(q=>q.shlLook);
  const hid=(h,d)=>{ mkGM(h,d); return sits.map(q=>!!q.hidden); };
  check('⑤ 週四 21:30（22:00 關）坐地板的按鈕都藏起來；看看照常',hid(21.5,THU).every(Boolean)&&looks.every(q=>!q.hidden));
  check('⑤ 週四 20:30、週五 21:30（23:00 關）、週四 11:00 照常',!hid(20.5,THU).some(Boolean)&&!hid(21.5,FRI).some(Boolean)&&!hid(11,THU).some(Boolean));
  const {G,GM,log}=mkGM(21.5,THU); const r=await STORY.interact(sits[0],GM);
  check('⑤ 打烊前不到一小時硬按：不坐、不過時間、不說話',r===true&&G.hour===21.5&&!log.adv.length&&!log.sit.length&&!log.said.length,J(log)); });

sec('⑥',()=>{ let md=null; try{ md=cp.execSync('git show 88ed60310:"docs/story_planning/AA_695_山嵐書店互動點與坐地板的字.md"',{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ md=null; }
  if(md==null){ console.log('略過 ⑥：這個 clone 沒有企劃線的 88ed60310（git fetch origin claude/magical-albattani-bk7b4n）'); return; }
  const all=LOOK.concat(Object.values(SIT),[ART_DAY]), prog=SHL.L.look.map(o=>o.text).concat(Object.values(SHL.L.sit),[SHL.L.sitArtDay]);
  const miss=prog.filter(t=>!md.includes(t)); check('⑥ 程式裡的 13 句都在 AA_695 原稿裡一字不差（和這個測試寫的一樣）',!miss.length&&J(prog.slice().sort())===J(all.slice().sort()),miss.join('｜')); });

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();

/* EAT-EFFECT-1020 最後一項：公館宵夜滷味攤的點餐（AA_841，企劃線 1f5d6efed；使用者 X67）——不需要瀏覽器。這是模擬，不是真實玩家流程（D131）。
   字 src/data/luwei_stall.js（tools/story/import_luwei_stall.py）、程式 src/luwei3d.js、接線 src/eat3d.js（outingFirst）、index.html。
   0 檔案、index.html 的順序、白名單、匯入工具 --check
   1 逐字對稿：四種夾法和價錢、半價（30／45／60／25）、辣度三選、熟客句、回話、八句台詞、半價那一句（稿的字抄在這支測試裡，企劃線的 commit 拿不到也比得到）；
     熟客句「不要辣」、回話、誰說的＝eat_lines.js 現有的
   2 什麼時候在：17:59 不在、18:00～23:59 營業、0:00～0:59 在收、1:00 不在；颱風假整天不在；半價 22:00 起
   3 真的公館區域（zones3d.js）：互動點「看滷味」在攤車前面站得到；那一段人行道原本是空的；攤車擺出來才擋（老闆站的地方走不進去、客人站的地方站得住、人行道還是走得過去）；
     收起來以後導航和原本一模一樣（沒有看不見的牆）；玩家站在那裡＝先不擺；模型沒載到＝不擋；老闆在營業、在收的時候在，其他時間不在（有人顧攤，§12）
   4 點餐：第一次（greet → 選單 → take → 要辣嗎 → wait → done → 第一次的旁白；扣錢、過 5 分鐘、記吃過的、記夾法和辣度）；十點以後（多一句、半價）；錢不夠；算了；
     第 5 次起熟客句照上次的辣度（只說一次）＋「老樣子」（回話、不再問辣度）；還沒開／在收／颱風各一句、不出選單
   5 和人一起來（EAT.outingFirst，考完的宵夜）：只多了選夾法和辣度（不說 greet／take／wait／done、時間不動）；算了＝沒吃；別的地方照舊
   6 舊存檔：沒有 G.eat、只有以前考完宵夜記的「滷味」（次數很多）＝第一次照樣問、沒有老樣子、不說熟客句
   7 半價的時間和阿哲、子晴說過的「十點後半價」一致（程式 22:00 起；那兩句還在）
   修改前（開發分支 345773e563：沒有 luwei_stall.js、luwei3d.js）：0 就 FAIL。用法：node tests/luwei_stall_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), SHA='1f5d6efed', SRC='docs/story_planning/AA_841_luwei_stall.json';
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); const warn0=console.warn; console.warn=()=>{};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const done=()=>{ console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); };
const J=JSON.stringify;
const need=['src/data/luwei_stall.js','src/luwei3d.js','tools/story/import_luwei_stall.py'].filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(need.length){ check('0. 滷味攤的檔案在',false,need.join(' ')); done(); }
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/tingzhou_layout.js','src/tingzhou3d.js',
  'src/data/calendar.js','src/data/night_market.js','src/night_market3d.js','src/season_deco3d.js','src/data/eat_lines.js','src/eat3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^[A-Z][A-Z0-9_]*$/.test(n)?'globalThis.'+n+'=':m); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});   /* 模型不載（第 3 項自己放一個假的）*/
/* 假的人物、劇情（老闆的外觀）、遊戲 */
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0,set(){}},userData:{},visible:true});
global.CHAR={build:()=>mkObj()}; let pops=0; global.STORY={extraSpec:i=>({i,bag:'bag'}),populate(){ pops++; }};
let said=[], opts=[], picks=[], toasts=[], G=null, saves=0;
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const GM={get G(){ return G; },E,npc:{},sceneBegin(){},sceneEnd(){},autosave(){ saves++; },toast(t){ toasts.push(t); },advance(h){ G.hour+=h; },money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push([who?(who.name||String(who)):null,t]); },
  choose:async o=>{ opts.push(o.map(q=>q.t)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>q.t.indexOf(want)===0); if(k<0) throw new Error('選單沒有「'+want+'」：'+J(o.map(q=>q.t))); return k; } return want==null?0:want; }};
global.GAME=GM;
for(const f of ['src/data/luwei_stall.js','src/luwei3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const D=LUWEI_STALL, S=LW3, EL=EAT_LINES, KEY='宵夜（滷味攤）', html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const DK=k=>{ for(let d=0;d<3000;d++) if(CALENDAR.dateOf(d).key===k) return d; return null; };
let TY=null, DAY=null; for(let d=DK('2025-09-01');d<DK('2025-09-01')+500;d++){ if(CALENDAR.typhoon(d)){ if(TY==null) TY=d; } else if(DAY==null&&d>DK('2025-10-01')) DAY=d; }
const fresh=(h,o)=>{ G=Object.assign({day:DAY,hour:h,zone:'gongguan',money:5000,flags:{},name:'祐廷'},o||{}); said=[]; opts=[]; picks=[]; toasts=[]; return G; };
const texts=()=>said.map(s=>s[1]);
const TABLE={ menu:[['夾一小籃',60,30],['夾一般的量',90,45],['夾滿一籃',120,60],['只要王子麵加青菜',45,25]], ask:'要辣嗎？', options:['不要辣','小辣','中辣'],
  regular:{'不要辣':'一樣不要辣？','小辣':'一樣小辣？','中辣':'一樣中辣？'}, reply:'好。一樣。', half:'十點以後半價，剩的不多了。',
  lines:{greet:'自己夾，夾好給我。',take:'（你把籃子遞過去。老闆看一眼就報了價錢。）',wait:'好了叫你。',done:'同學，你的。小心燙。',no_money:'（你數了一下口袋裡的錢，把籃子放回去。）',
    not_open:'（攤子還沒推出來。六點以後才有。）',closed:'（鍋子蓋起來了，老闆在收籃子。）',typhoon:'（平常擺攤的位置是空的。）'} };
const FIRST='（滷味要自己夾到籃子裡。你夾太多了，老闆看了一眼，沒有說什麼。）';

(async()=>{
  /* ===== 0 ===== */
  { const iD=html.indexOf('src/data/luwei_stall.js'), iC=html.indexOf('src/luwei3d.js'), ver=s=>(new RegExp(s.replace(/[.\/]/g,'\\$&')+'\\?v=([0-9.]+)').exec(html)||[])[1];
    check('0. index.html 載入 luwei_stall.js（資料）、luwei3d.js（程式），在 zones3d／tingzhou3d／night_market3d／season_deco3d／eat3d／story3d 後面、shoplife3d 前面（SHOPLIFE 要排在所有會放店員的模組後面，tests/shop_life_audit_1112_unit.js）；版本參數和旁邊的一樣',
      iD>0&&iC>iD&&['src/zones3d.js','src/tingzhou3d.js','src/night_market3d.js','src/season_deco3d.js','src/eat3d.js','src/story3d.js'].every(f=>html.indexOf(f)>0&&html.indexOf(f)<iD)&&iC<html.indexOf('src/shoplife3d.js')&&!!ver('src/luwei3d.js')&&ver('src/luwei3d.js')===ver('src/shoplife3d.js')&&ver('src/data/luwei_stall.js')===ver('src/shoplife3d.js'));
    const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')), e=allow.files.filter(x=>x.path===SRC);
    check('0. 白名單有 AA_841 那一筆（approved、'+SHA+'）；資料檔寫的來源一樣',e.length===1&&e[0].status==='approved'&&e[0].sha===SHA&&!!e[0].approvedBy&&D.src===SRC+'@'+SHA,J(e.map(x=>[x.sha,x.status])));
    let out='', ok=false, skip=false; try{ cp.execFileSync('git',['-C',ROOT,'cat-file','-e',SHA+':'+SRC],{stdio:'ignore'}); }catch(err){ skip=true; }
    if(!skip){ try{ out=cp.execFileSync('python3',[path.join(ROOT,'tools/story/import_luwei_stall.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(err){ out=String(err.stderr||err.message).slice(0,200); } }
    check('0. 匯入工具 --check：資料檔和企劃稿一致'+(skip?'（這個複本沒有企劃線的 '+SHA+'，略過；逐字對稿看第 1 項）':''),skip||ok,out.trim().slice(0,100));
    check('0. 載入：LW3.order／interact／state／sync／attach／placeKeeper；公館的 build、STORY.populate 包上',['order','interact','state','sync','attach','placeKeeper','prices'].every(k=>typeof S[k]==='function')&&Z3.ZONES.gongguan._lw3===true&&STORY._lw3Pop===true); }
  if(fails) return done();

  /* ===== 1 逐字對稿 ===== */
  check('1. 四種夾法、價錢、半價', J(D.menu.map(m=>[m.name,m.price,m.half]))===J(TABLE.menu), J(D.menu));
  check('1. 辣度：問的一句、三選、熟客句、回話', D.spice.ask===TABLE.ask&&J(D.spice.options)===J(TABLE.options)&&J(D.spice.regular)===J(TABLE.regular)&&D.spice.reply===TABLE.reply, J(D.spice));
  check('1. 八句台詞＋半價那一句', J(D.lines)===J(TABLE.lines)&&D.half.line===TABLE.half, J([D.lines,D.half.line]));
  check('1. 招牌「滷味」、老闆、每天 18:00～24:00、颱風天不出攤、半價 22:00～24:00', D.sign==='滷味'&&D.who==='老闆'&&D.open.from===18&&D.open.to===24&&D.typhoonOff===true&&D.half.from===22&&D.half.to===24, J([D.sign,D.who,D.open,D.half.from]));
  { const T=EL.staff[KEY]; check('1. 熟客句「不要辣」、回話、誰說的＝eat_lines.js 現有的（'+KEY+'）；第一次的旁白是現有那一句', !!T&&T.line5===D.spice.regular['不要辣']&&T.same===D.spice.reply&&T.who===D.who&&EL.first['宵夜（公館滷味攤）']===FIRST&&EAT.shopOf(KEY)==='宵夜（公館滷味攤）', J(T)); }
  check('1. 按鈕＝「看」＋招牌（夜市的寫法）', S.label()==='看滷味'&&S.KEY===KEY);

  /* ===== 2 什麼時候在 ===== */
  { const st=(h,day)=>S.state({day:day==null?DAY:day,hour:h});
    check('2. 17:59 不在、18:00 營業、23:59 營業、0:00 在收、0:59 在收、1:00 不在、12:00 不在', J([17.99,18,23.99,0,0.99,1,12].map(h=>st(h)))===J(['away','open','open','closing','closing','away','away']), J([17.99,18,23.99,0,0.99,1,12].map(h=>st(h))));
    check('2. 颱風假（'+(TY!=null?CALENDAR.dateOf(TY).key:'沒有')+'）整天不出攤', TY!=null&&[12,19,22.5].every(h=>st(h,TY)==='typhoon')&&!S.present({day:TY,hour:20}), String(TY));
    check('2. 半價：21:59 原價、22:00 起半價', J(S.prices({day:DAY,hour:21.99}))===J([60,90,120,45])&&J(S.prices({day:DAY,hour:22}))===J([30,45,60,25])&&!S.isHalf({day:DAY,hour:21.99})&&S.isHalf({day:DAY,hour:23.9})); }

  /* ===== 3 真的公館區域 ===== */
  { fresh(12); E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; E.addNPC=n=>{ E.npcs.push(n); return n; };
    const z=Z3.ZONES.gongguan.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(60,0,14),rotation:{y:0}},radius:0.32,lv:0};
    const q=z.lwStall, it=E.interactables.find(i=>i.lwStall), c=S.custSpot(), k=S.keeperSpot(), R=S.rects(), b0=z.nav.b.slice();
    check('3. 公館建好：zone.lwStall、互動點「看滷味」在攤車前面', !!q&&q.id==='st_luwei'&&!!it&&it.label==='看滷味'&&it.x===c.x&&it.z===c.z&&typeof it.onInteract==='function', J(it&&[it.label,it.x,it.z]));
    let free=true, nn=0; for(const r of R) for(let x=r[0]+0.3;x<=r[1]-0.3;x+=0.25) for(let zz=r[2]+0.3;zz<=r[3]-0.3;zz+=0.25){ nn++; if(!E.canStand(x,zz,0.3,0)) free=false; }
    const others=E.interactables.filter(i=>i!==it&&i.x!=null&&R.some(r=>i.x>r[0]-1&&i.x<r[1]+1&&i.z>r[2]-1&&i.z<r[3]+1)).map(i=>i.label), gg=(z.ggStalls||[]).filter(s=>Math.abs(s.x-S.AT.x)<6);
    check('3. 那一段人行道原本是空的（'+nn+' 個點都站得住）；1 m 內沒有別的互動點、6 m 內沒有夜市的攤', free&&nn>20&&!others.length&&!gg.length, J([others,gg.map(s=>s.id)]));
    check('3. 沒有模型：營業時間也不擋（不留看不見的牆）；互動點照樣能買', (()=>{ G.hour=20; S.sync(GM,z); return q.shown===true&&q.cells==null&&J(Array.from(z.nav.b))===J(Array.from(b0)); })());
    G.hour=12; S.sync(GM,z); q.model={visible:false};   /* 假的模型 */
    check('3. 12:00：攤車不在、不擋', q.shown===false&&q.model.visible===false&&q.cells==null&&E.canStand(S.AT.x,S.AT.z,0.3,0));
    G.hour=20; E.player.obj.position.set(S.AT.x,0,S.AT.z); S.sync(GM,z);
    check('3. 20:00 玩家剛好站在那裡：先不擺', q.shown===false&&q.model.visible===false&&q.cells==null);
    E.player.obj.position.set(c.x,0,c.z+1.5); S.sync(GM,z);
    check('3. 走開以後擺出來：攤車看得到、擋起來；老闆站的地方走不進去、客人站的地方站得住', q.shown===true&&q.model.visible===true&&Array.isArray(q.cells)&&q.cells.length>0&&!E.canStand(k.x,k.z,0.3,0)&&!E.canStand(S.AT.x,S.AT.z-0.1,0.3,0)&&E.canStand(c.x,c.z,0.3,0)&&q.isOpen===true, J([q.shown,q.cells&&q.cells.length]));
    { let ok=true; for(let x=S.AT.x-6;x<=S.AT.x+6;x+=0.25) if(!E.canStand(x,14.5,0.3,0)||!E.canStand(x,16,0.3,0)) ok=false;
      const w=E.simWalk?E.simWalk(S.AT.x-7,13,S.AT.x+5,13,{lv0:0,lv1:0,dt:0.033,speed:1.45}):null, end=w&&(w.x!=null?[w.x,w.z]:(w.ok?[S.AT.x+5,13]:null));
      check('3. 擺出來以後人行道還是走得過去（z 14.5、16 那兩條線都站得住；從攤子西邊走到東邊走得到）', ok&&(!E.simWalk||(!!end&&Math.hypot(end[0]-(S.AT.x+5),end[1]-13)<0.6)), J([ok,end])); }
    STORY.populate('gongguan',GM); const kp=E.npcs.find(n=>n.stallKeeper==='st_luwei');
    check('3. 有人顧攤：老闆站在攤車後面、面向客人（+z）、不背包、營業中看得到', !!kp&&kp.obj.position.x===k.x&&kp.obj.position.z===k.z&&kp.obj.rotation.y===0&&kp.obj.visible===true&&kp._stall===q&&kp.frozen===true&&E.npcs.filter(n=>n.stallKeeper==='st_luwei').length===1, J(kp&&[kp.obj.position.x,kp.obj.position.z]));
    STORY.populate('gongguan',GM); check('3. 再進一次區域不會多一個老闆', E.npcs.filter(n=>n.stallKeeper==='st_luwei').length===1);
    G.day=DAY+1; G.hour=0.5; z.applyTimeOutdoor(0.5,E); check('3. 0:30 在收：攤車、老闆還在', q.shown===true&&q.model.visible===true&&kp.obj.visible===true);
    G.hour=2; z.applyTimeOutdoor(2,E);
    check('3. 2:00 收走：攤車、老闆不在；導航和原本一模一樣', q.shown===false&&q.model.visible===false&&kp.obj.visible===false&&q.cells==null&&q.isOpen===false&&J(Array.from(z.nav.b))===J(Array.from(b0)));
    G.day=TY; G.hour=20; z.applyTimeOutdoor(20,E); check('3. 颱風假 20:00：位置是空的', q.shown===false&&kp.obj.visible===false&&q.cells==null);
    E.npcs=[]; }

  /* ===== 4 點餐 ===== */
  const zone={lwStall:null};   /* 沒有 3D 的區域物件：S.interact 的 sync 直接略過 */
  { fresh(19); picks=['夾一般的量','小辣']; const r=await S.interact(GM,zone);
    check('4. 第一次：老闆 greet → 選單 → 旁白 take → 老闆「要辣嗎？」→ 老闆 wait → 老闆 done → 第一次的旁白（現有那句）', r==='夾一般的量'&&J(said)===J([['老闆',D.lines.greet],[null,D.lines.take],['老闆',D.spice.ask],['老闆',D.lines.wait],['老闆',D.lines.done],[null,FIRST]]), J(said));
    check('4. 選單＝四種夾法「夾法　價錢 元」＋「算了」；辣度三選', J(opts)===J([['夾一小籃　60 元','夾一般的量　90 元','夾滿一籃　120 元','只要王子麵加青菜　45 元','算了'],['不要辣','小辣','中辣']]), J(opts));
    check('4. 扣 90、時間過 5 分鐘、次數 1、記夾法和辣度、「吃過的」記「滷味」', G.money===4910&&Math.abs(G.hour-(19+5/60))<1e-9&&G.eat.n[KEY]===1&&G.eat.last[KEY]==='夾一般的量'&&G.eat.lwSpice==='小辣'&&G.eat.ate.length===1&&G.eat.ate[0].shop==='宵夜（公館滷味攤）'&&G.eat.ate[0].item==='滷味', J(G.eat));
    said=[]; opts=[]; picks=['只要王子麵','不要辣']; G.hour=20; await S.interact(GM,zone);
    check('4. 第二次：沒有第一次的旁白、沒有熟客句、沒有老樣子；吃過的不重複', J(texts())===J([D.lines.greet,D.lines.take,D.spice.ask,D.lines.wait,D.lines.done])&&opts[0].length===5&&G.money===4910-45&&G.eat.ate.length===1&&G.eat.lwSpice==='不要辣', J([texts(),opts[0]])); }
  { fresh(22.5); picks=['夾滿一籃','中辣']; await S.interact(GM,zone);
    check('4. 22:30：greet 後面多一句「十點以後半價，剩的不多了。」（老闆說）；選單是半價；扣 60', J(said.slice(0,2))===J([['老闆',D.lines.greet],['老闆',D.half.line]])&&J(opts[0])===J(['夾一小籃　30 元','夾一般的量　45 元','夾滿一籃　60 元','只要王子麵加青菜　25 元','算了'])&&G.money===4940, J([said.slice(0,2),opts[0],G.money])); }
  { fresh(19,{money:50}); picks=['夾滿一籃']; const r=await S.interact(GM,zone);
    check('4. 錢不夠（50 元選 120 的）：旁白 no_money、不扣錢、不算一次、不問辣度', r==='poor'&&J(said)===J([['老闆',D.lines.greet],[null,D.lines.no_money]])&&G.money===50&&!(G.eat.n[KEY]>0)&&opts.length===1, J(said));
    fresh(19,{money:50}); picks=['只要王子麵','不要辣']; const r2=await S.interact(GM,zone); check('4. 50 元買得起 45 的', r2==='只要王子麵加青菜'&&G.money===5);
    fresh(19); picks=['算了']; const r3=await S.interact(GM,zone); check('4. 算了：只有 greet、不扣錢', r3==='no'&&J(texts())===J([D.lines.greet])&&G.money===5000&&!(G.eat.n[KEY]>0)); }
  { fresh(19); for(let i=0;i<4;i++){ picks=['夾一小籃','小辣']; G.hour=19; await S.interact(GM,zone); } said=[]; opts=[]; const m0=G.money; G.hour=19; picks=['老樣子'];
    const r=await S.interact(GM,zone);
    check('4. 第 5 次（上次小辣）：greet 後面老闆「一樣小辣？」；選單多「老樣子」（在算了前面）', J(said.slice(0,2))===J([['老闆',D.lines.greet],['老闆','一樣小辣？']])&&J(opts[0].slice(4))===J(['老樣子','算了']), J([said.slice(0,2),opts[0]]));
    check('4. 選老樣子：老闆「好。一樣。」、不再問辣度、同一種夾法和辣度、扣 60', r==='夾一小籃'&&J(texts())===J([D.lines.greet,'一樣小辣？',D.spice.reply,D.lines.take,D.lines.wait,D.lines.done])&&opts.length===1&&G.money===m0-60&&G.eat.lwSpice==='小辣'&&S.lastOrder.usual===true, J(texts()));
    said=[]; opts=[]; G.hour=19; picks=['夾滿一籃','中辣']; await S.interact(GM,zone);
    check('4. 第 6 次：熟客句不再說（只說一次）；還是有老樣子；改選別的照樣問辣度', !texts().includes('一樣小辣？')&&opts[0].includes('老樣子')&&texts().includes(D.spice.ask)&&G.eat.lwSpice==='中辣'&&G.eat.last[KEY]==='夾滿一籃', J(texts()));
    said=[]; opts=[]; G.hour=19; G.money=40; picks=['算了']; await S.interact(GM,zone);
    check('4. 錢不夠付上次那一種：沒有老樣子', !opts[0].includes('老樣子'), J(opts[0])); }
  { fresh(19); for(let i=0;i<4;i++){ picks=['夾一小籃','中辣']; G.hour=19; await S.interact(GM,zone); } said=[]; G.hour=19; picks=['算了']; await S.interact(GM,zone);
    check('4. 上次中辣：熟客句「一樣中辣？」', texts()[1]==='一樣中辣？', J(texts()));
    fresh(19); for(let i=0;i<4;i++){ picks=['夾一小籃','不要辣']; G.hour=19; await S.interact(GM,zone); } said=[]; G.hour=19; picks=['算了']; await S.interact(GM,zone);
    check('4. 上次不要辣：熟客句＝現有的「一樣不要辣？」', texts()[1]==='一樣不要辣？'&&texts()[1]===EL.staff[KEY].line5, J(texts())); }
  { fresh(12); const r1=await S.interact(GM,zone), a=J(said); fresh(0.5,{day:DAY+1}); const r2=await S.interact(GM,zone), b=J(said); fresh(20,{day:TY}); const r3=await S.interact(GM,zone), c=J(said);
    check('4. 12:00「攤子還沒推出來」、0:30「鍋子蓋起來了」、颱風假「位置是空的」：各一句旁白、不出選單、不扣錢', r1==='away'&&a===J([[null,D.lines.not_open]])&&r2==='closing'&&b===J([[null,D.lines.closed]])&&r3==='typhoon'&&c===J([[null,D.lines.typhoon]])&&opts.length===0&&G.money===5000, J([a,b,c])); }

  /* ===== 5 和人一起來 ===== */
  { fresh(20.5); picks=['夾一般的量','小辣']; const r=await EAT.outingFirst(GM,{place:'公館滷味攤'});
    check('5. 考完的宵夜（20:30）：選夾法 → 老闆「要辣嗎？」→ 第一次的旁白；不說 greet／take／wait／done；扣 90、時間不動', r===true&&J(said)===J([['老闆',D.spice.ask],[null,FIRST]])&&opts.length===2&&opts[0].length===5&&G.money===4910&&G.hour===20.5&&G.eat.n[KEY]===1&&G.eat.last[KEY]==='夾一般的量'&&G.eat.lwSpice==='小辣', J([said,G.hour,G.money]));
    fresh(22.5); picks=['夾一小籃','不要辣']; await EAT.outingFirst(GM,{place:'公館滷味攤'}); check('5. 22:30 的宵夜（阿哲週五）：半價 30', G.money===4970&&opts[0][0]==='夾一小籃　30 元', J(opts[0]));
    fresh(20.5); picks=['算了']; const r2=await EAT.outingFirst(GM,{place:'公館滷味攤'}); check('5. 算了＝這一趟沒吃：不扣錢、不記吃過的、沒有旁白', r2===false&&said.length===0&&G.money===5000&&!(G.eat.ate||[]).length);
    fresh(20.5,{money:20}); picks=['夾一小籃']; const r3=await EAT.outingFirst(GM,{place:'公館滷味攤'}); check('5. 錢不夠：no_money 一句、沒吃', r3===false&&J(said)===J([[null,D.lines.no_money]])&&G.money===20);
    fresh(20.5); const r4=await EAT.outingFirst(GM,{place:'宿舍旁的滷味攤'}); check('5. 別的地方（宿舍旁的滷味攤）照舊：不出選單', r4===false&&opts.length===0&&said.length===0); }

  /* ===== 6 舊存檔 ===== */
  { fresh(19,{eat:{n:{[KEY]:7},last:{[KEY]:'滷味'},first:{[KEY]:100},l5:{},tog:{},ate:[{shop:'宵夜（公館滷味攤）',item:'滷味',day:100}]}}); picks=['夾一小籃','小辣']; const r=await S.interact(GM,zone);
    check('6. 以前考完宵夜吃過 7 次（只記「滷味」、沒有辣度）：不說熟客句、沒有老樣子、照樣問辣度；買得到、吃過的不重複', r==='夾一小籃'&&J(texts())===J([D.lines.greet,D.lines.take,D.spice.ask,D.lines.wait,D.lines.done])&&opts[0].length===5&&G.eat.l5[KEY]==null&&G.eat.n[KEY]===8&&G.eat.ate.length===1, J([texts(),opts[0]]));
    said=[]; opts=[]; G.hour=19; picks=['老樣子']; await S.interact(GM,zone); check('6. 下一次起有熟客句和老樣子', texts()[1]==='一樣小辣？'&&opts[0].includes('老樣子'), J(texts()));
    fresh(19); delete G.eat; picks=['夾一小籃','小辣']; const r2=await S.interact(GM,zone); check('6. 沒有 G.eat 的存檔：從空的開始', r2==='夾一小籃'&&G.eat.n[KEY]===1); }

  /* ===== 7 半價的時間和台詞一致 ===== */
  { const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), inv=fs.readFileSync(path.join(ROOT,'src/data/invites.js'),'utf8');
    const zq=/\{id:'zq_f1',h:\(\)=>([\d.]+),[\s\S]{0,200}?'滷味','十點後半價','你要來嗎'/.exec(st);
    check('7. 子晴的訊息「滷味／十點後半價／你要來嗎」（21:30 傳，還沒十點）、阿哲「你知道公館哪家滷味十點後半價嗎？」都在；程式的半價＝22:00 起', !!zq&&+zq[1]<D.half.from&&inv.includes('你知道公館哪家滷味十點後半價嗎？')&&D.half.from===22&&D.half.line.indexOf('十點以後半價')===0, J(zq&&zq[1])); }

  done();
})().catch(e=>{ console.error(e); process.exit(1); });

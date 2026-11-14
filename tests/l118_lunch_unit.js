// 118 巷課後午餐邀約（L118-LUNCH-INVITE-1111，使用者 2026-11-11 規格 docs/handoff/user_specs/L118_LUNCH_1111.md，X339）：src/l118_lunch3d.js＋src/data/l118_lunch.js
//   （tools/story/import_l118_lunch.py 從白名單上的 AA_771 產生）＋classes3d.js 的 CLS.afterMenu 接線。不用瀏覽器。
//   A  正式資料：匯入工具 --check、格式、id、special 的 when 沒有讀不懂的、index.html 有載入、白名單有那一筆；沒有白名單＝工具停下來不產生檔
//   B  規格第十二節「特別測試」十項（B1～B10，用測試自己的假資料：句子都是「〔測試〕…」，不進 src）
//   C  機制：決定性亂數、級距機率、加權抽與連續婉拒倍率、錢不夠、不越過下午的課、每週上限 6、結算只一次、資料不在＝不開、阿哲週一已約＝不邀、舊存檔
//   D  AA_771 的規則：十二點前後才判、一一八茶飲不當午餐、慢讀咖啡只有以安、沒開換下一間、柏翰沛珊大二上不同桌、n 欄、婉拒回覆輪流、只加熟悉、
//      special 的條件／偶遇的人／同一天 H 事件、first 不能略過、不認得的條件不播
//   E  接線：CLS.afterMenu（吃完照常出下課選單、不再出「先去吃飯」；課後劇情那天不邀）、3D 進店坐同一桌（假的區域）、讀檔的鎖
//   F  正式資料跑一學期：邀約的每一句都在資料檔裡
// 用法：node tests/l118_lunch_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(HOMETOWN_LINES|HV|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS|ROM|MSG|MSG_POOL|MSG2_POOL|VAC|VAC_DATA|L118|LANE118_SHOPS|LANE118_LAYOUT|SISG|EAT|EAT_LINES|L118_LUNCH_DATA|LUNCH118|L118_SHOP_LAYOUTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/home3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/vac_activities.js','src/vac3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/data/l118_shop_layouts.js','src/data/eat_lines.js','src/eat3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);
/* 沒有資料檔、沒有模組的時候：CLS.afterMenu 照舊（typeof 判斷）*/
check('0. 還沒載入午餐模組：LUNCH118 不存在、CLS.afterMenu 照舊是函式',typeof LUNCH118==='undefined'&&typeof CLS.afterMenu==='function');
const HAS_DATA=fs.existsSync(path.join(ROOT,'src/data/l118_lunch.js'));
if(HAS_DATA) load('src/data/l118_lunch.js');
load('src/l118_lunch3d.js');
const REAL=typeof L118_LUNCH_DATA!=='undefined'?L118_LUNCH_DATA:null;
global.ADV={active:false,preload(){},begin(o){ ADV.active=true; advBg.push(o&&o.background); },end(){ ADV.active=false; },log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, moneyLog=[], advBg=[], entered=[], saves=0, toasts=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0,seat:null},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){ GM.depth++; },sceneEnd(){ GM.depth--; },depth:0,face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){ saves++; },addNote(){},energy(){},
  money(d){ G.money+=d; moneyLog.push(d); },setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z,sp,o)=>{ entered.push(z); G.zone=z; if(GM.onEnter) GM.onEnter(z,o); if(o&&o.onLoaded) o.onLoaded(); },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),
  sitAt(ent,st){ ent.seat=st; ent.pose='sit'; },standUp(ent){ ent.seat=null; ent.pose='idle'; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,id:who&&who.charId||null,t}); },
  choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},stage:'law',visited:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; moneyLog=[]; advBg=[]; entered=[]; toasts=[]; GM.npc={}; GM.depth=0; GM.onEnter=null; E.interactables=[]; E.npcs=[]; E.player.seat=null; E.zone={roomAt:()=>null,seats:[]}; ADV.active=false; if(STORY._fy) STORY._fy.reset(); if(CLS.clearPending) CLS.clearPending(); };
const LV={ACQ:[10,0,0],FAM:[25,0,0],FRI:[45,30,0],CLO:[65,50,45]};
const know=(id,lv)=>{ SOCIAL.meet(id,'test'); const r=SOCIAL.rel(id), v=LV[lv||'ACQ']; r.fam=v[0]; r.trust=v[1]; r.comf=v[2]; if(id==='zhe') G.flags.MET_ZHE=true; };
const AN='heroine_01', ZHE='zhe', YU='yu', BH='classmate_bohan', PS='classmate_peishan', MX='classmate_mingxuan', XC='classmate_xinci', SIS='heroine_05', YT='heroine_03';
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
/* 舊開局的存檔一開始就認識阿哲（STORY.knows 既有的規則）；這支測試要測「一個都不認識」，阿哲改成照 FIRST_MET（know() 會記）*/
const KNOWS0=STORY.knows; STORY.knows=(id,g)=>id===ZHE?SOCIAL.has(ZHE,'FIRST_MET'):KNOWS0(id,g);
/* 營業時間：九間店的資料之後會重匯（店名、菜單、價錢、時間都可能改），測試不寫死哪一天哪一間開——預設「資料裡有的店都開著」，要測營業時間的地方自己換（openIf），F 節用真的 */
const ISOPEN0=L118.isOpen; let openIf=null; L118.isOpen=(id,g)=>openIf?openIf(id,g):ISOPEN0(id,g); const openAll=()=>{ openIf=id=>!!L118.shop(id); }; openAll();
/* 店名、菜單、價錢一律從 LANE118_SHOPS 讀（測試也不寫死）；主餐的規則照 S.meal 的說明另外算一次來對 */
const SH=id=>L118.shop(id), mainsOf=id=>{ const s=SH(id), base=s.menu[0][1]; return LUNCH118.CFG.firstItemTypes.includes(s.type)?[s.menu[0]]:s.menu.filter(m=>m[1]>=base*LUNCH118.CFG.sideRatio); };
const cheapOf=id=>mainsOf(id).slice().sort((a,b)=>a[1]-b[1])[0], priceyOf=id=>mainsOf(id).slice().sort((a,b)=>b[1]-a[1])[0];
const canon=x=>Array.isArray(x)?x.map(canon):(x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canon(x[k])])):x);
const T=k=>'〔測試〕'+k;
/* 測試的假資料（只在這支測試裡；句子都是「〔測試〕…」）*/
const mk=(id,nm,prefs,w)=>({name:nm,weight:w==null?1:w,prefs});
const TEST={ src:'test', window:{from:11.5,to:12.5},
  who:{ [ZHE]:mk(ZHE,'阿哲',{noodle2:3,dian:1}), [AN]:mk(AN,'以安',{omu:2,cafe2:1}), [BH]:mk(BH,'柏翰',{self:1}), [PS]:mk(PS,'沛珊',{pasta:1,korea:1}), [YU]:mk(YU,'Alison',{korea:1}) },
  options:{accept:T('接受'),decline:T('婉拒'),skip:T('快速略過')},
  invite:Object.fromEntries([[ZHE,'阿哲'],[AN,'以安'],[BH,'柏翰'],[PS,'沛珊'],[YU,'Alison']].map(([id,n])=>[id,{lines:[T(n+'邀約一 {店名}'),T(n+'邀約二 {店名}')],declineReply:[T(n+'被拒一'),T(n+'被拒二'),T(n+'被拒三')]}])),
  lunch:[ {id:'T-zhe',who:[ZHE],lines:[[ZHE,T('阿哲午餐 {name}')],['player',T('祐廷回阿哲')],[null,T('旁白一')]]}, {id:'T-zhe-b',who:[ZHE],lines:[[ZHE,T('阿哲午餐二')]]},
    {id:'T-an',who:[AN],lines:[[AN,T('以安午餐')]]}, {id:'T-bohan',who:[BH],lines:[[BH,T('柏翰午餐')]]}, {id:'T-ps',who:[PS],lines:[[PS,T('沛珊午餐')]]}, {id:'T-yu',who:[YU],lines:[[YU,T('Alison 午餐')]]},
    {id:'T-zhe-yu-n3',who:[ZHE,YU],n:3,lines:[[ZHE,T('三個人：阿哲')],[YU,T('三個人：Alison')]]}, {id:'T-zhe-dian',who:[ZHE],shop:['dian'],lines:[[ZHE,T('只在滇香')]]} ],
  special:[ {id:'TS-talk-zhe',kind:'talk',who:[ZHE],bonus:{[ZHE]:1},first:true,when:{inParty:[ZHE],minTier:2},lines:[[ZHE,T('阿哲多講一件')]]},
    {id:'TS-meet-sis',kind:'meet',who:[SIS],bonus:{[SIS]:1},first:true,when:{knows:[SIS],present:[SIS],notH:['H1']},lines:[[null,T('遇到學姊')],[SIS,T('學姊一句')],['助教',T('路人一句')]]},
    {id:'TS-unknown',kind:'meet',who:[],first:true,when:{unknown:['看不懂的條件']},lines:[[null,T('不該出現')]]} ],
  arrive:{noodle2:T('到 {店名}'),dian:T('到滇香')}, leave:[T('吃完一'),T('吃完二')], skipLine:T('略過 {同行}｜{店名}｜{品名}｜{金額}'),
  noMoney:{narr:T('錢不夠旁白'),player:T('錢不夠選項'),reply:T('沒關係')} };
const useTest=d=>{ globalThis.L118_LUNCH_DATA=d===undefined?JSON.parse(J(TEST)):d; };
const RND0=LUNCH118.rnd;
/* 指定亂數（鹽 → 值）；沒指定的鹽＝dflt（預設 0：一定中、抽第一個）*/
const rig=(map,dflt)=>{ LUNCH118.rnd=(g,salt)=>Object.prototype.hasOwnProperty.call(map||{},salt)?map[salt]:(dflt==null?0:dflt); };
const unrig=()=>{ LUNCH118.rnd=RND0; };
const termDay=(t,w,wd)=>STORY.termDay(t,w,wd);
const amIt=()=>CLS.dayItems(G).find(q=>q.slot.block==='am');
/* 大一上有法律系館上午課的週一（憲法）：第 4 週起；MON＝第一個 */
const LAWMON=[]; for(let w=4;w<=15;w++){ const d=termDay('Y1S1',w,1); if(d==null) continue; G={day:d,hour:12,flags:{},courses:{},stage:'law'}; const q=amIt(); if(q&&LUNCH118.lawAm(G,q)) LAWMON.push(d); }
const MON=LAWMON[0], TUE=MON+1, WED=MON+2, THU=MON+3;
/* 上午那一堂剛下課（12:10、在教室、那一堂上過了）；who＝[人, 熟悉程度] */
const after=(day,who,o)=>{ o=o||{}; fresh(day,12+10/60,o.zone||'classroom',o.flags); for(const [id,lv] of who||[]) know(id,lv); if(o.money!=null) G.money=o.money; const it=amIt(); if(it&&!o.notDone) CLS.rec(G).done[it.key]=1; return it; };
const snap=()=>J({money:G.money,rel:G.social.rel,l118:G.l118,eat:G.eat,slots:G.slots});

(async()=>{
  // ================= A 正式資料與匯入工具 =================
  { const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), iD=html.indexOf('src/data/l118_lunch.js'), iM=html.indexOf('src/l118_lunch3d.js'), iL=html.indexOf('src/lane118.js'), iC=html.indexOf('src/classes3d.js');
    check('A1. index.html 載入資料檔和模組（資料在前、都在 lane118.js 後面）',iD>0&&iM>iD&&iD>iL&&iC>0);
    const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')), ent=allow.files.filter(e=>/l118_lunch\.json$/.test(e.path)&&e.status==='approved');
    check('A2. 白名單有午餐稿那一筆（approved、有 sha、approvedBy）',ent.length===1&&!!ent[0].sha&&!!ent[0].approvedBy,J(ent.map(e=>e.path+'@'+e.sha)));
    check('A3. 資料檔在、S.dataOk',HAS_DATA&&!!REAL&&LUNCH118.dataOk());
    if(REAL&&ent.length){ const SHA=ent[0].sha; let has=false; try{ cp.execFileSync('git',['cat-file','-e',SHA+'^{commit}'],{cwd:ROOT,stdio:'ignore'}); has=true; }catch(e){}
      let ok=false, out=''; if(has){ try{ out=cp.execFileSync('python3',[path.join(ROOT,'tools/story/import_l118_lunch.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(err){ out=String(err.stderr||err.message).slice(0,300); } }
      check('A4. 匯入工具 --check：資料檔和企劃稿一致'+(has?'':'（這個複本沒有企劃線的 '+SHA+'，略過）'),!has||ok,out.trim().slice(0,160));
      if(has){ const src=JSON.parse(cp.execFileSync('git',['show',SHA+':'+ent[0].path],{cwd:ROOT,encoding:'utf8'})); const strip=x=>{ const y=JSON.parse(J(x)); delete y.src; delete y.window; delete y.shopRules; for(const s of y.special||[]) delete s.when; return y; }; const a=strip(REAL), b=require('./aa959_map.js').mapDeep(strip(src),'l118_lunch.js');   /* RC2-PORT-DEV-1114：AA_959 第 759、760 列（「不要笑」留給沛珊），稿上的字照表換完再比 */
        check('A5. 一字照稿：去掉工具加的 src、window、shopRules、special.when 以後和稿完全一樣（欄位順序不算）',J(canon(a))===J(canon(b))); } }
    if(REAL){ const shops=LANE118_SHOPS.shops.map(s=>s.id), W=REAL.who, ids=Object.keys(W);
      check('A6. who 的人物都在 CHARACTERS；每個人的 prefs 至少有一間現在的資料裡能當午餐的店',ids.length>0&&ids.every(id=>CHARACTERS[id]&&Object.keys(W[id].prefs).some(s=>shops.includes(s)&&LUNCH118.lunchShop(s))));
      check('A7. 每個人都有邀約的句子、都有「只有他、不限店、不限人數」的午餐對話',ids.every(id=>REAL.invite[id]&&REAL.invite[id].lines.length&&REAL.lunch.some(g=>g.who.length===1&&g.who[0]===id&&!g.shop&&g.n==null)));
      check('A8. special 的 when 沒有讀不懂的條件、鍵都是遊戲認得的',REAL.special.every(s=>s.when&&!s.when.unknown&&Object.keys(s.when).every(k=>['inParty','minTier','termFrom','terms','knows','present','reachable','notH','flags','weekday','inTerm','weekFrom','shopOpen','at'].includes(k))),J(REAL.special.filter(s=>!s.when||s.when.unknown).map(s=>s.id)));
      const KEYS=new Set(['店名','name','發起人','同行','品名','金額']), all=[]; const walk=x=>{ if(typeof x==='string') all.push(x); else if(x&&typeof x==='object') for(const k of Object.keys(x)) if(k!=='_meta'&&k!=='cond'&&k!=='note') walk(x[k]); }; walk(REAL);
      check('A9. 句子裡的大括號只有認得的那幾個',all.every(t=>(t.match(/\{([^{}]*)\}/g)||[]).every(m=>KEYS.has(m.slice(1,-1)))));
      check('A10. 時間窗在資料檔（11:30～12:30）',REAL.window&&REAL.window.from===11.5&&REAL.window.to===12.5,J(REAL.window));
      useTest(REAL); const sr=LUNCH118.shopRules(); check('A10. 店的規則在資料檔（shopRules：不當午餐的店、只有某些人會選的店），遊戲讀得到；資料沒有 shopRules＝用預設',!!REAL.shopRules&&Array.isArray(REAL.shopRules.noLunch)&&sr.noLunch===REAL.shopRules.noLunch&&sr.onlyFor===REAL.shopRules.onlyFor&&(()=>{ useTest(); return LUNCH118.shopRules().noLunch===LUNCH118.RULES.noLunch; })(),J(REAL.shopRules)); useTest(REAL); }
    /* 白名單沒有那一筆＝停下來、不產生檔（用不存在的稿名）*/
    { let code=0, err=''; const outP=path.join(ROOT,'src/data/l118_lunch.js'), before=HAS_DATA?fs.readFileSync(outP,'utf8'):null; try{ cp.execFileSync('python3',[path.join(ROOT,'tools/story/import_l118_lunch.py'),'--path','docs/story_planning/AA_沒有這份稿.json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(e){ code=e.status; err=String(e.stderr||''); }
      check('A11. 白名單沒有那份稿：工具停下來說明（結束碼不是 0）、資料檔沒被動到',code!==0&&/白名單/.test(err)&&(HAS_DATA?fs.readFileSync(outP,'utf8')===before:!fs.existsSync(outP)),err.trim().slice(0,80)); }
    const srcMod=fs.readFileSync(path.join(ROOT,'src/l118_lunch3d.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
    check('A12. 模組裡沒有寫死的台詞（除了註解，沒有全形括號旁白、沒有「」的句子）、不用 Math.random、不叫 slotUse',!/（[^）]*。）/.test(srcMod)&&!/「[^」]*」/.test(srcMod)&&!/Math\.random/.test(srcMod)&&!/slotUse|slotFill/.test(srcMod)); }

  useTest();
  // ================= B 規格第十二節十項 =================
  // B1 上午沒在法學院上課，不觸發
  { rig({});
    let it=after(TUE,[[ZHE,'CLO'],[AN,'CLO']]); const r1=await LUNCH118.afterClass(GM,it.key);
    check('B1. 週二上午在博思教學館上國文（不是法律系館）：不邀、沒有任何字、沒記「今天判過」',it.room.zone==='boya'&&r1===false&&!said.length&&!opts.length&&!(G.l118&&G.l118.inv&&G.l118.inv.day===G.day),it.c.id);
    it=after(THU,[[ZHE,'CLO']]); const r2=await LUNCH118.afterClass(GM,it.key); check('B1. 週四上午在共同教學館上英文：不邀',it.room.zone==='gongtong'&&r2===false&&!said.length);
    fresh(THU,15+10/60,'classroom'); know(ZHE,'CLO'); const pm=CLS.dayItems(G).find(q=>q.slot.block==='pm1'); CLS.rec(G).done[pm.key]=1; const r3=await LUNCH118.afterClass(GM,pm.key);
    check('B1. 週四下午在法律系館上民總（下午的課）：不邀',pm.room.zone==='classroom'&&r3===false&&!said.length);
    it=after(MON,[[ZHE,'CLO']],{notDone:true}); check('B1. 週一上午的憲法沒去上：不邀',(await LUNCH118.afterClass(GM,it.key))===false&&LUNCH118.plan(GM,it).no==='notAttended');
    it=after(MON,[[ZHE,'CLO']]); G.stage='econ'; check('B1. 經濟系那一年：不邀',LUNCH118.plan(GM,it).no==='off'); unrig(); }
  // B2 上午上課但沒有認識的人，不觸發
  { rig({}); const it=after(MON,[]); const P=LUNCH118.plan(GM,it), r=await LUNCH118.afterClass(GM,it.key);
    check('B2. 週一憲法（法律系館A 201）下課、同堂一個都不認識：不邀（nobody）、沒有字',it.c.id==='const_1'&&P.no==='nobody'&&r===false&&!said.length&&!opts.length,J(P));
    after(MON,[[SIS,'CLO'],[YT,'CLO']]); check('B2. 只認識不同堂的人（學姊、語彤）：不邀',LUNCH118.plan(GM,amIt()).no==='nobody');
    const it3=after(MON,[[ZHE,'CLO']]); check('B2. 對照：認識同堂的阿哲＝有資格',J(LUNCH118.eligible(G,it3))===J([ZHE])); unrig(); }
  // B3 有多位熟人時，每天仍最多一場邀約
  { rig({}); const it=after(MON,[[ZHE,'CLO'],[AN,'CLO'],[BH,'FRI'],[PS,'FAM'],[YU,'ACQ']]); picks=[T('婉拒')];
    const r1=await LUNCH118.afterClass(GM,it.key), n1=opts.length, s1=said.length; const r2=await LUNCH118.afterClass(GM,it.key), r3=await LUNCH118.afterClass(GM,it.key);
    check('B3. 五個熟人同堂：只出一次邀約（一個人說一句、一個選單），同一天再叫兩次都不邀',r1==='decline'&&n1===1&&r2===false&&r3===false&&opts.length===1&&said.length===s1,J([r1,r2,r3,opts.length]));
    check('B3. 邀約是 NPC 說的（發起人的句子）、選項只有接受／婉拒（不選餐廳）',/邀約/.test(said[0].t)&&!!said[0].who&&J(opts[0])===J([T('接受'),T('婉拒')]),J([said[0],opts[0]]));
    unrig(); let days=0, inv=0, multi=0; for(const t of ['Y1S1','Y1S2']) for(let w=2;w<=15;w++) for(const wd of [1,3]){ const d=termDay(t,w,wd); if(d==null) continue; const it2=after(d,[[ZHE,'CLO'],[AN,'CLO'],[BH,'FRI'],[PS,'FAM'],[YU,'ACQ']]); if(!it2||!LUNCH118.lawAm(G,it2)) continue; days++; picks=[T('婉拒'),T('婉拒'),T('婉拒')];
      await LUNCH118.afterClass(GM,it2.key); await LUNCH118.afterClass(GM,it2.key); if(opts.length) inv++; if(opts.length>1) multi++; }
    check('B3. 大一兩學期的週一、週三（真的亂數）：有邀約的日子每天只有一場；不是每天都邀',days>=40&&inv>0&&inv<days&&multi===0,J({days,inv,multi})); }
  // B4 同行人數不超過四人
  { let max=0, min=9, n=0, bad=0; const seen={}; for(let d=1;d<=3000;d++){ fresh(d,12+10/60,'classroom'); for(const id of [ZHE,AN,BH,PS,YU]) know(id,'CLO'); const it={key:'k'+d,t1:12+10/60,c:{id:'x',kind:'required'},room:{zone:'classroom'}}; CLS.rec(G).done[it.key]=1;
      const keep=[LUNCH118.eligible,LUNCH118.shopsOf,LUNCH118.limit]; LUNCH118.eligible=()=>[ZHE,AN,BH,PS,YU]; LUNCH118.shopsOf=(g,id)=>Object.keys(TEST.who[id].prefs); LUNCH118.limit=()=>24;
      const P=LUNCH118.plan(GM,it); [LUNCH118.eligible,LUNCH118.shopsOf,LUNCH118.limit]=keep; if(P.no) continue; n++; const k=P.party.length+1; max=Math.max(max,k); min=Math.min(min,k); seen[k]=(seen[k]|0)+1; if(new Set(P.party).size!==P.party.length||P.party[0]!==P.who||P.mates.length>2) bad++; }
    check('B4. 3000 天、五個人都有資格：含玩家 2～4 人（沒有超過四人、沒有重複的人、發起人在裡面），二、三、四人都出現過',n>1500&&max===4&&min===2&&bad===0&&seen[2]>0&&seen[3]>0&&seen[4]>0,J({n,seen,bad})); }
  // B5 只扣玩家自己的餐費
  { rig({n:0.99,mate0:0,mate1:0}); const it=after(MON,[[ZHE,'CLO'],[AN,'CLO'],[BH,'CLO']]); const P=LUNCH118.plan(GM,it); picks=[T('接受')]; const m0=G.money; const r=await LUNCH118.afterClass(GM,it.key);
    const menu=L118.shop(P.shop).menu, price=(menu.find(m=>m[0]===P.item)||[])[1];
    check('B5. 四個人一起吃（玩家＋3）：GM.money 只叫一次、扣的是菜單上玩家自己那一樣的價錢（不是乘以人數）',r==='done'&&P.party.length===3&&moneyLog.length===1&&moneyLog[0]===-price&&G.money===m0-price&&price>0,J({party:P.party,item:P.item,price,moneyLog}));
    check('B5. 價錢從 LANE118_SHOPS 的菜單來（品名在那間店的菜單上）',menu.some(m=>m[0]===P.item&&m[1]===P.price)); unrig(); }
  // B6 午餐不占任何行動格
  { rig({}); const it=after(MON,[[ZHE,'CLO']]); CLS.slotFillSpan(G,it.t0,it.t1); const s0=J(G.slots); let used=0; const k1=CLS.slotUse, k2=CLS.slotFill; CLS.slotUse=function(){ used++; return k1.apply(this,arguments); }; CLS.slotFill=function(){ used++; return k2.apply(this,arguments); };
    picks=[T('接受')]; const r=await LUNCH118.afterClass(GM,it.key); CLS.slotUse=k1; CLS.slotFill=k2;
    check('B6. 接受、吃完：G.slots 和吃之前一模一樣、沒有叫 slotUse／slotFill；下午那一格還在',r==='done'&&J(G.slots)===s0&&used===0&&CLS.slotLeft(G,'pm','study')===1,J(G.slots));
    check('B6. 時間有過（12:10 → 12:50 左右），但沒有超過 13:00',G.hour>12.5&&G.hour<=13+1e-6,String(G.hour)); unrig(); }
  // B7 連續拒絕只影響對應角色
  { rig({}); const day=d=>LAWMON[d]; let it=after(day(0),[[ZHE,'CLO'],[AN,'CLO']]); const keepL=G.l118; picks=[T('婉拒')]; const rel0=J(G.social.rel);
    const r=await LUNCH118.afterClass(GM,it.key), who=said[0].id, other=who===ZHE?AN:ZHE, I=G.l118.inv;
    check('B7. 婉拒：他回一句、他的連續婉拒 1、另一個人 0、好感一點都沒變、沒扣錢',r==='decline'&&I.decl[who]===1&&!(I.decl[other]>0)&&J(G.social.rel)===rel0&&!moneyLog.length&&/被拒一/.test(said[1].t),J([I.decl,lines()]));
    /* 倍率：0、1 次 1；2 次 0.75；3 次 0.5；4 次以上 0.25（不是 0）*/
    const wOf=n=>{ const keep=[LUNCH118.eligible,LUNCH118.shopsOf,LUNCH118.limit]; LUNCH118.eligible=()=>[ZHE,AN]; LUNCH118.shopsOf=(g,id)=>Object.keys(TEST.who[id].prefs); LUNCH118.limit=()=>24; let z=0, tot=0; unrig();
      for(let d=1;d<=4000;d++){ fresh(d,12+10/60,'classroom'); know(ZHE,'CLO'); know(AN,'CLO'); LUNCH118.rec(G).decl[ZHE]=n; const it2={key:'k',t1:12+10/60,c:{kind:'required'},room:{zone:'classroom'}}; CLS.rec(G).done.k=1; const P=LUNCH118.plan(GM,it2); if(P.no) continue; tot++; if(P.who===ZHE) z++; }
      [LUNCH118.eligible,LUNCH118.shopsOf,LUNCH118.limit]=keep; return z/tot; };
    const f=[0,1,2,3,4,9].map(wOf), exp=[0.5,0.5,0.75/1.75,0.5/1.5,0.25/1.25,0.25/1.25];
    check('B7. 阿哲被連續婉拒 0／1／2／3／4／9 次，他當發起人的比例照倍率 1／1／0.75／0.5／0.25／0.25 下降（另一個人不受影響、阿哲不會變成 0）',f.every((x,i)=>Math.abs(x-exp[i])<0.035)&&f[5]>0.1,J(f.map(x=>+x.toFixed(3)))+' 期望 '+J(exp.map(x=>+x.toFixed(3))));
    rig({}); it=after(day(1),[[ZHE,'CLO'],[AN,'CLO']]); const I2=LUNCH118.rec(G); I2.decl[ZHE]=3; I2.decl[AN]=2; picks=[T('接受')]; await LUNCH118.afterClass(GM,it.key); const w2=said[0].id;
    check('B7. 接受了他的邀約：他的連續婉拒歸零，另一個人的不動',I2.decl[w2]===0&&I2.decl[w2===ZHE?AN:ZHE]===(w2===ZHE?2:3),J(I2.decl)); unrig(); void keepL; }
  // B8 快速略過不會重複扣款或發放好友值
  { rig({}); let it=after(MON,[[ZHE,'FAM']]); picks=[T('接受')]; await LUNCH118.afterClass(GM,it.key); const first=J(opts[0]);
    check('B8. 第一次：沒有「快速略過」（還沒看過普通午餐），完整演出',first===J([T('接受'),T('婉拒')])&&G.l118.inv.seen===1&&lines().some(t=>/阿哲午餐/.test(t)),first);
    /* 隔一週同一份存檔 */
    const keep=JSON.parse(J(G)); it=(()=>{ const d=LAWMON[1]; const g=keep; fresh(d,12+10/60,'classroom'); G.l118=g.l118; G.eat=g.eat; G.social=g.social; SOCIAL.bind(G); G.money=g.money; G.flags.MET_ZHE=true; G.l118.inv.sp['TS-talk-zhe']=d-7;   /* 上週才看過那一段特殊：這一次是普通午餐 */ const q=amIt(); CLS.rec(G).done[q.key]=1; return q; })();
    const fam0=SOCIAL.rel(ZHE).fam, tr0=SOCIAL.rel(ZHE).trust, m0=G.money, P=LUNCH118.plan(GM,it); picks=[T('快速略過')]; const r=await LUNCH118.afterClass(GM,it.key);
    check('B8. 第二次：多一個「快速略過」；選了＝不換場景、不演午餐對話，只顯示略過那一行（同行、店名、品名、金額都填好）',r==='skip'&&J(opts[0])===J([T('接受'),T('快速略過'),T('婉拒')])&&!entered.length&&!lines().some(t=>/午餐|到 |吃完/.test(t))&&said[said.length-1].t===T('略過 阿哲｜'+P.shopName+'｜'+P.item+'｜'+P.price),J(lines()));
    check('B8. 略過照樣：扣一次自己的餐費、阿哲熟悉 +2（一次）、記今天吃過、時間有過',moneyLog.length===1&&G.money===m0-P.price&&SOCIAL.rel(ZHE).fam===fam0+2&&SOCIAL.rel(ZHE).trust===tr0&&LUNCH118.doneToday(G)&&G.hour>12.5,J({moneyLog,fam:SOCIAL.rel(ZHE).fam,h:G.hour}));
    const s1=snap(); const again=LUNCH118.settle(GM,P,{skip:true}), again2=LUNCH118.settle(GM,LUNCH118.plan(GM,it)||P,{}); const r2=await LUNCH118.afterClass(GM,it.key);
    check('B8. 再結算一次（同一份計畫、新的計畫、再叫 afterClass）：都不做，錢、好感、紀錄一模一樣',again===null&&again2===null&&r2===false&&snap()===s1&&moneyLog.length===1);
    check('B8. 略過不算「完整看過」（seen 還是 1），吃過幾次 n＝2',G.l118.inv.seen===1&&G.l118.inv.n===2,J(G.l118.inv));
    /* first 的特殊還沒看過＝不提供略過 */
    it=(()=>{ const d=LAWMON[2], g=JSON.parse(J(G)); fresh(d,12+10/60,'classroom'); G.l118=g.l118; G.eat=g.eat; G.social=g.social; SOCIAL.bind(G); G.flags.MET_ZHE=true; delete G.l118.inv.sp['TS-talk-zhe'];   /* 當作還沒看過 */ const q=amIt(); CLS.rec(G).done[q.key]=1; return q; })();
    const P3=LUNCH118.plan(GM,it); picks=[T('接受')]; const fam1=SOCIAL.rel(ZHE).fam; await LUNCH118.afterClass(GM,it.key);
    check('B8. 這一次抽到還沒看過的 first 特殊（阿哲多講一件）：不提供「快速略過」、照演、阿哲 +2 再 +1',P3.sp&&P3.sp.id==='TS-talk-zhe'&&J(opts[0])===J([T('接受'),T('婉拒')])&&lines().some(t=>/多講一件/.test(t))&&SOCIAL.rel(ZHE).fam===fam1+3&&G.l118.inv.sp['TS-talk-zhe']===G.day,J([P3.sp&&P3.sp.id,opts[0],SOCIAL.rel(ZHE).fam-fam1]));
    unrig(); }
  // B9 存讀檔後不會再次觸發同一天的午餐
  { rig({}); let it=after(MON,[[ZHE,'CLO']]); picks=[T('接受')]; await LUNCH118.afterClass(GM,it.key); const save=JSON.parse(J(G)), m=G.money;
    G=JSON.parse(J(save)); SOCIAL.bind(G); said=[]; opts=[]; moneyLog=[]; G.hour=12+10/60; G.zone='classroom'; const r=await LUNCH118.afterClass(GM,it.key);
    check('B9. 吃完存檔 → 讀檔 → 同一天再叫：不邀、不扣錢、沒有字',r===false&&!said.length&&!opts.length&&G.money===m&&G.l118.inv.day===MON&&G.l118.inv.done===MON);
    it=after(MON,[[ZHE,'CLO']]); picks=[T('婉拒')]; await LUNCH118.afterClass(GM,it.key); G=JSON.parse(J(G)); SOCIAL.bind(G); said=[]; opts=[];
    check('B9. 婉拒以後存讀檔：同一天不再邀',(await LUNCH118.afterClass(GM,it.key))===false&&!opts.length);
    rig({hit:0.99}); it=after(MON,[[ZHE,'CLO']]); const r0=await LUNCH118.afterClass(GM,it.key); const I=G.l118.inv; rig({}); G=JSON.parse(J(G)); SOCIAL.bind(G);
    check('B9. 那天沒抽中也記「今天判過」（hit:false）：存讀檔以後就算亂數會中也不再判',r0===false&&I.day===MON&&I.hit===false&&(await LUNCH118.afterClass(GM,it.key))===false&&!opts.length);
    unrig(); const one=()=>{ const q=after(WED,[[ZHE,'CLO'],[AN,'FRI'],[BH,'FAM'],[PS,'ACQ']]); const P=LUNCH118.plan(GM,q); return J(P.no?{no:P.no}:{who:P.who,party:P.party,shop:P.shop,item:P.item,grp:P.grp.id,sp:P.sp&&P.sp.id,inv:P.inviteLine,leave:P.leave}); };
    const a=one(), b=one(); const c=(()=>{ const q=after(WED,[[ZHE,'CLO'],[AN,'FRI'],[BH,'FAM'],[PS,'ACQ']]); G=JSON.parse(J(G)); SOCIAL.bind(G); return J((P=>P.no?{no:P.no}:{who:P.who,party:P.party,shop:P.shop,item:P.item,grp:P.grp.id,sp:P.sp&&P.sp.id,inv:P.inviteLine,leave:P.leave})(LUNCH118.plan(GM,q))); })();
    check('B9. 決定性：同一天、同樣的狀態重算三次（含存讀檔一次）結果完全一樣（真的亂數，不是 Math.random）',a===b&&b===c,a); }
  // B10 現有餐廳功能及舊存檔仍正常
  { rig({shop:0}); let it=after(MON,[[ZHE,'CLO']]); const was=G.l118===undefined, P0=LUNCH118.plan(GM,it); check('B10. 舊存檔（沒有 G.l118）：照常判定、不丟例外',was&&!P0.no&&J(G.l118.inv.decl)==='{}');
    const sid=P0.shop, s=SH(sid), last=priceyOf(sid), other=LANE118_SHOPS.shops.find(q=>q.id!==sid&&LUNCH118.lunchShop(q.id)).id;
    G.l118={n:{[sid]:7,[other]:2},d:{[sid]:MON-7},last:{[sid]:last[0]},w:{['zhe@'+sid]:{n:3,d0:1,d:MON-7}},once:{H4:5},rankAt:{term:'Y1S1',week:3}}; G.eat={n:{[s.name]:7},last:{[s.name]:last[0]},l5:{},first:{[s.name]:3},ate:[{shop:EAT.shopOf(s.name)||s.name,item:last[0],day:3}],tog:{}};
    const P=LUNCH118.plan(GM,it); picks=[T('接受')]; await LUNCH118.afterClass(GM,it.key); const R=G.l118;
    check('B10. 舊存檔有 118 巷的紀錄（沒有 inv）：點上次在那間店點的那一樣（價錢照現在的菜單）；熟客次數 7→8、上次點的照舊、和阿哲一起吃 3→4、別間店、H4、rankAt 不動、多了 inv',
      P.shop===sid&&P.item===last[0]&&moneyLog.length===1&&moneyLog[0]===-last[1]&&R.n[sid]===8&&R.n[other]===2&&R.d[sid]===MON&&R.last[sid]===last[0]&&R.w['zhe@'+sid].n===4&&R.once.H4===5&&R.rankAt.week===3&&R.inv.done===MON,J([P.shop,P.item,moneyLog,R.n,R.w]));
    check('B10. 「吃過的」也記（EAT 次數 7→8；已經吃過的品項不重複加）',G.eat.n[s.name]===8&&G.eat.ate.length===1&&G.eat.last[s.name]===last[0],J(G.eat));
    /* 存檔記的品名後來不在菜單上（店重新設計、菜單換了）：不出錯，當作沒點過 */
    it=after(MON,[[ZHE,'CLO']]); G.l118={n:{[sid]:3},d:{},last:{[sid]:'已經下架的那一道'},w:{},once:{}}; G.eat={n:{},last:{[s.name]:'已經下架的那一道'},l5:{},first:{},ate:[],tog:{}}; const Pg=LUNCH118.plan(GM,it), ch=cheapOf(sid); picks=[T('接受')]; const rg=await LUNCH118.afterClass(GM,it.key);
    check('B10. 存檔裡上次點的品名已經不在菜單上：不丟例外，改點最便宜的主餐、照現在的價錢扣一次，紀錄換成新的品名',!Pg.no&&Pg.item===ch[0]&&Pg.price===ch[1]&&rg==='done'&&moneyLog.length===1&&moneyLog[0]===-ch[1]&&G.l118.last[sid]===ch[0],J([Pg.item,moneyLog]));
    /* prefs 裡有資料沒有的店、被標成不當午餐的店 */
    { const d0=JSON.parse(J(TEST)); d0.who[ZHE].prefs={drink_a:50,no_such_shop:50,[other]:1}; d0.lunch=d0.lunch.filter(g=>!g.shop); useTest(d0); it=after(MON,[[ZHE,'CLO']]); let P1=null, threw=false; try{ P1=LUNCH118.plan(GM,it); }catch(e){ threw=true; }
      check('B10. prefs 寫了資料沒有的店 id（drink_a、亂寫的）：跳過不報錯，選有的那一間',!threw&&P1&&!P1.no&&P1.shop===other,J(P1&&(P1.no||P1.shop)));
      const so=SH(other); so.noLunch=true; const a=LUNCH118.lunchShop(other), P2=LUNCH118.plan(GM,it); delete so.noLunch; so.takeout=true; const b=LUNCH118.lunchShop(other); delete so.takeout; so.lunch=false; const c=LUNCH118.lunchShop(other); delete so.lunch;
      check('B10. 店的資料標成不當午餐（noLunch／takeout／lunch:false）：跳過（只剩這間＝不邀，不報錯）',a===false&&b===false&&c===false&&P2.no==='noShop'&&LUNCH118.lunchShop(other)===true); useTest(); }
    /* 店門口點餐照舊 */
    { fresh(MON,12.5,'lane118'); const s2=LANE118_SHOPS.shops[0]; openIf=id=>id===s2.id; const inv0={day:MON,done:MON,decl:{zhe:2},seen:3}; G.l118={n:{},d:{},last:{},w:{},once:{},inv:JSON.parse(J(inv0))}; picks=[s2.menu[0][0]]; const m0=G.money; await L118.order(GM,s2.id); openAll();
      check('B10. 吃過午餐的同一天，店門口照樣可以點餐（L118.order 照舊：招呼、點餐、扣菜單上的價錢、記次數），inv 不被動到',G.money===m0-s2.menu[0][1]&&G.l118.n[s2.id]===1&&lines().some(t=>t.includes(s2.menu[0][0]))&&J(G.l118.inv)===J(inv0),J(lines())); }
    G.l118='壞掉的'; check('B10. G.l118 是壞的值：rec 從空的開始、不丟例外',!!LUNCH118.rec(G)&&typeof G.l118==='object'&&J(G.l118.inv.decl)==='{}');
    for(const t of ['lane118_unit']){ const r=cp.spawnSync('node',[path.join(ROOT,'tests',t+'.js')],{encoding:'utf8',timeout:600000}); check('B10. 現有的 118 巷測試 '+t+' 照樣全過',r.status===0&&!/^FAIL/m.test(r.stdout||''),(r.stdout||'').split('\n').filter(l=>/^FAIL/.test(l)).slice(0,3).join(' / ')); }
    unrig(); }

  // ================= C 機制 =================
  // C1 亂數：均勻、不同用途互不相干
  { const N=20000; let a=0,b=0,c=0,both=0; for(let d=-200;d<N-200;d++){ const g={day:d}, x=RND0(g,'hit'), y=RND0(g,'who'); if(x<0.2) a++; if(x<0.65) b++; if(y<0.5) c++; if(x<0.5&&y<0.5) both++; if(!(x>=0&&x<1)) a=-1e9; }
    check('C1. S.rnd：0～1、兩萬天裡 <0.2 的約兩成、<0.65 的約六成五、不同的鹽互相獨立；同一天同一個鹽每次一樣、不看別的狀態',Math.abs(a/N-0.2)<0.012&&Math.abs(b/N-0.65)<0.012&&Math.abs(c/N-0.5)<0.012&&Math.abs(both/N-0.25)<0.012&&RND0({day:7,hour:3,money:1},'x')===RND0({day:7},'x')&&RND0({day:7},'x')!==RND0({day:8},'x'),J([a/N,b/N,c/N,both/N])); }
  // C2 級距 → 機率
  { const rate=lv=>{ const keep=[LUNCH118.eligible,LUNCH118.shopsOf,LUNCH118.limit]; LUNCH118.eligible=()=>[ZHE,AN]; LUNCH118.shopsOf=(g,id)=>Object.keys(TEST.who[id].prefs); LUNCH118.limit=()=>24; let hit=0, N=4000;
      for(let d=1;d<=N;d++){ fresh(d,12+10/60,'classroom'); know(ZHE,lv); know(AN,'ACQ'); CLS.rec(G).done.k=1; const P=LUNCH118.plan(GM,{key:'k',t1:12+10/60,c:{kind:'required'},room:{zone:'classroom'}}); if(!P.no) hit++; else if(P.no!=='roll') hit=-1e9; }
      [LUNCH118.eligible,LUNCH118.shopsOf,LUNCH118.limit]=keep; return hit/N; };
    const f=['ACQ','FAM','FRI','CLO'].map(rate);
    check('C2. 最熟的人是剛認識／有點熟／朋友／好朋友：邀約機率約 20／40／65／80%（看最熟的那一位，另一位只是剛認識）',[0.2,0.4,0.65,0.8].every((p,i)=>Math.abs(f[i]-p)<0.03),J(f.map(x=>+x.toFixed(3))));
    fresh(1,12,'campus'); know(ZHE,'CLO'); const t0=LUNCH118.tier(ZHE); G.flags.dating_heroine_01=true; know(AN,'ACQ'); SOCIAL.meet(BH,'x'); SOCIAL.rel(BH).fam=0;
    check('C2. 級距對 SOCIAL.stage：好朋友＝4、交往中（RELATIONSHIP）也算 4、認識了但熟悉 0 墊底算 1、陌生人 raw 0',t0===4&&LUNCH118.tier(AN)===4&&SOCIAL.rel(BH).fam===0&&LUNCH118.tier(BH)===1&&LUNCH118.tierRaw(BH)===0&&J(LUNCH118.CFG.prob)===J({1:0.2,2:0.4,3:0.65,4:0.8})); }
  // C3 加權抽發起人（不是永遠最熟的）、人物的 weight
  { const frac=(lvA,wA)=>{ const keep=[LUNCH118.eligible,LUNCH118.shopsOf,LUNCH118.limit]; LUNCH118.eligible=()=>[ZHE,AN]; LUNCH118.shopsOf=(g,id)=>Object.keys(TEST.who[id].prefs); LUNCH118.limit=()=>24; const d0=JSON.parse(J(TEST)); d0.who[AN].weight=wA; useTest(d0); let z=0,t=0;
      for(let d=1;d<=5000;d++){ fresh(d,12+10/60,'classroom'); know(ZHE,'CLO'); know(AN,lvA); CLS.rec(G).done.k=1; const P=LUNCH118.plan(GM,{key:'k',t1:12+10/60,c:{kind:'required'},room:{zone:'classroom'}}); if(P.no) continue; t++; if(P.who===AN) z++; }
      [LUNCH118.eligible,LUNCH118.shopsOf,LUNCH118.limit]=keep; useTest(); return z/t; };
    const a=frac('ACQ',1), b=frac('FAM',1), c=frac('CLO',1), d=frac('CLO',0.4);
    check('C3. 阿哲好朋友（權重 4）、以安剛認識（1）／有點熟（2）／好朋友（4）：以安當發起人約 1/5、2/6、4/8——普通同學也有機會，不是永遠最熟的',Math.abs(a-0.2)<0.03&&Math.abs(b-1/3)<0.03&&Math.abs(c-0.5)<0.03&&a>0.1,J([a,b,c].map(x=>+x.toFixed(3))));
    check('C3. 資料檔 who.weight 0.4：兩個都是好朋友時她約 0.4/1.4',Math.abs(d-0.4/1.4)<0.03,String(+d.toFixed(3))); }
  // C4 錢不夠
  { rig({shop:0}); let it=after(MON,[[ZHE,'CLO']]); const sid=LUNCH118.plan(GM,it).shop, ch=cheapOf(sid);
    it=after(MON,[[ZHE,'CLO']],{money:ch[1]-1}); const P=LUNCH118.plan(GM,it); picks=[T('錢不夠選項')]; const r=await LUNCH118.afterClass(GM,it.key);
    check('C4. 身上的錢比那間店最便宜的一餐少 1 元：邀約 → 錢不夠的旁白 → 選項是「錢不夠」那一句＋婉拒（沒有接受）→ 他回一句；不扣錢、不算婉拒、沒有去',P.poor===true&&r==='poor'&&J(opts[0])===J([T('錢不夠選項'),T('婉拒')])&&J(lines().slice(1))===J([T('錢不夠旁白'),'阿哲：'+T('沒關係')])&&G.money===ch[1]-1&&!moneyLog.length&&!(G.l118.inv.decl[ZHE]>0)&&!LUNCH118.doneToday(G)&&!entered.length,J([opts,lines(),G.l118.inv]));
    it=after(MON,[[ZHE,'CLO']],{money:ch[1]-1}); picks=[T('婉拒')]; const r2=await LUNCH118.afterClass(GM,it.key); check('C4. 錢不夠時選婉拒：照一般的婉拒（記一次）、錢不動',r2==='decline'&&G.l118.inv.decl[ZHE]===1&&G.money===ch[1]-1);
    it=after(MON,[[ZHE,'CLO']],{money:ch[1]}); picks=[T('接受')]; await LUNCH118.afterClass(GM,it.key); check('C4. 錢剛好夠最便宜的一餐：吃得起，扣到 0、不會變負的',G.money===0&&moneyLog.length===1&&moneyLog[0]===-ch[1],J(moneyLog));
    const d0=JSON.parse(J(TEST)); delete d0.noMoney; useTest(d0); it=after(MON,[[ZHE,'CLO']],{money:0}); picks=[0]; const r3=await LUNCH118.afterClass(GM,it.key);
    check('C4. 資料沒有 noMoney：接受那一顆變灰，按了＝不去、不扣錢（不補任何句子）',r3==='poor'&&G.money===0&&said.length===1&&!moneyLog.length,J(lines())); useTest();
    /* 吃什麼的規則：每一間店都照現在的菜單對一次（不寫死品名、價錢）*/
    fresh(MON,12,'campus'); const bad=[]; for(const s of LANE118_SHOPS.shops){ G.money=99999; G.l118=undefined; G.eat=undefined; const c=cheapOf(s.id), p=priceyOf(s.id), base=s.menu[0][1], first=LUNCH118.CFG.firstItemTypes.includes(s.type);
        const a=LUNCH118.meal(G,s.id); if(a.item!==c[0]||a.price!==c[1]||!a.ok||!s.menu.some(m=>m[0]===a.item&&m[1]===a.price)||(!first&&a.price<base*0.5)) bad.push(s.id+' 沒點過');
        L118.rec(G).last[s.id]=p[0]; const b=LUNCH118.meal(G,s.id); if(b.item!==p[0]||b.price!==p[1]) bad.push(s.id+' 上次點的');
        G.money=c[1]; const e=LUNCH118.meal(G,s.id); if(!(e.ok&&e.price<=c[1])) bad.push(s.id+' 錢只夠最便宜的');
        G.money=c[1]-1; const f=LUNCH118.meal(G,s.id); if(f.ok!==false) bad.push(s.id+' 錢不夠');
        G.money=99999; L118.rec(G).last[s.id]='已經下架的那一道'; const g=LUNCH118.meal(G,s.id); if(g.item!==c[0]) bad.push(s.id+' 品名不在菜單');
        G.l118=undefined; G.eat={last:{[s.name]:p[0]}}; const h=LUNCH118.meal(G,s.id); if(h.item!==p[0]) bad.push(s.id+' 只有 G.eat 的紀錄'); }
    check('C4. 每一間店（照現在的菜單）：沒點過＝最便宜的主餐（價錢不到菜單第一樣一半的加點、配菜不算；手搖飲、咖啡＝第一樣）；上次點的買得起就點它；錢只夠便宜的＝換便宜的；不夠＝ok:false；品名不在菜單＝當沒點過；只有 G.eat 的紀錄也認',bad.length===0,J(bad));
    check('C4. 沒有菜單的店、不存在的店：meal 回 null、不丟例外',LUNCH118.meal(G,'no_such_shop')===null); unrig(); }
  // C5 不越過下午的課、下一件固定的事
  { rig({}); let it=after(termDay('Y2S1',4,2),[[ZHE,'CLO']]); const nx=CLS.dayItems(G).find(q=>q.slot.block==='pm1'); const P=LUNCH118.plan(GM,it);
    const plAt=CLS.goPlan({G:Object.assign({},G,{zone:'l118_'+P.shop}),E:null},nx);
    check('C5. 大二上週二：上午刑分（法律系館A）→ 13:20 物權（法律系館B）。午餐照邀，吃完的時間不晚於「從那間店出發去下一堂」的出門時間',it.c.id==='crim_spec'&&nx.c.id==='property'&&!P.no&&P.hEnd<=plAt.depart+1e-6&&P.lim===plAt.depart&&P.hEnd-P.hA>=LUNCH118.CFG.minEatH-1e-6,J({hEnd:P.hEnd,depart:plAt.depart,hA:P.hA}));
    picks=[T('接受')]; await LUNCH118.afterClass(GM,it.key); const st=CLS.status(G,nx), late=CLS.goPlan(GM,nx).late;
    check('C5. 吃完：下午那一堂還沒開始、現在出門不會遲到（沒有被跳過）',G.hour<=plAt.depart+1e-6&&(st==='upcoming'||st==='open')&&late<=0&&!CLS.rec(G).done[nx.key],J({h:G.hour,st,late}));
    /* 下一件事太近＝不邀 */
    it=after(MON,[[ZHE,'CLO']]); G.invites=[{id:'x',day:MON,h:12.75,accepted:true,done:false,label:'約好的見面',who:AN,place:'cafe'}]; const P2=LUNCH118.plan(GM,it);
    check('C5. 12:45 有已經答應的邀約：來不及吃＝不邀（noTime），當天照樣記判過',P2.no==='noTime'&&(await LUNCH118.afterClass(GM,it.key))===false&&!said.length&&G.l118.inv.day===MON&&G.l118.inv.hit===false,J(P2));
    it=after(MON,[[ZHE,'CLO']]); G.invites=[{id:'x',day:MON,h:13+10/60,accepted:true,done:false,label:'約好的見面',who:AN,place:'cafe'}]; const P3=LUNCH118.plan(GM,it);
    check('C5. 13:10 有邀約：照邀，但最晚吃到 13:00（邀約前 10 分鐘）以前',!P3.no&&P3.hEnd<=13+1e-6&&P3.lim<=13+1e-6,J({hEnd:P3.hEnd,lim:P3.lim}));
    it=after(MON,[[ZHE,'CLO']]); const P4=LUNCH118.plan(GM,it); check('C5. 一般的日子（下一堂 15:30）：12:10 下課 → 12:20 到店 → 吃到 12:50',Math.abs(P4.hA-(12+20/60))<1e-6&&Math.abs(P4.hEnd-(12+50/60))<1e-6,J([P4.hA,P4.hEnd])); unrig(); }
  // C6 每週上限 6、只加熟悉
  { rig({sp:0.99}); const wk=LAWMON[2]; let g0=null; const got=[]; for(let i=0;i<5;i++){ const d=wk+i; fresh(d,12+10/60,'classroom'); if(g0){ G.social=g0.social; SOCIAL.bind(G); G.l118=g0.l118; G.eat=g0.eat; } else know(ZHE,'FAM'); G.flags.MET_ZHE=true;
      const it={key:'k'+d,t1:12+10/60,c:{kind:'required'},room:{zone:'classroom'}}; CLS.rec(G).done[it.key]=1; const keep=[LUNCH118.eligible,LUNCH118.limit,LUNCH118.shopsOf]; LUNCH118.eligible=()=>[ZHE]; LUNCH118.limit=()=>24; LUNCH118.shopsOf=()=>['noodle2'];
      const P=LUNCH118.plan(GM,it), f0=SOCIAL.rel(ZHE).fam; const st=LUNCH118.settle(GM,P,{}); [LUNCH118.eligible,LUNCH118.limit,LUNCH118.shopsOf]=keep; got.push(SOCIAL.rel(ZHE).fam-f0); g0=JSON.parse(J(G)); void st; }
    check('C6. 同一週和阿哲吃五次午餐：熟悉 +2、+2、+2、0、0（一週最多 +6）；錢每次照扣',J(got)===J([2,2,2,0,0])&&g0.l118.inv.wk[ZHE].pts===6,J(got));
    fresh(wk+7,12+10/60,'classroom'); G.social=g0.social; SOCIAL.bind(G); G.l118=g0.l118; G.flags.MET_ZHE=true; const f1=SOCIAL.rel(ZHE).fam; check('C6. 下一週重新算：又可以 +2',LUNCH118.give(G,ZHE,2)===2&&SOCIAL.rel(ZHE).fam===f1+2&&G.l118.inv.wk[ZHE].pts===2,J(G.l118.inv.wk));
    fresh(wk,12,'campus'); know(ZHE,'FAM'); check('C6. 一次給 9（+2 再加很多 bonus）也只到 6',LUNCH118.give(G,ZHE,9)===6&&LUNCH118.give(G,ZHE,1)===0);
    rig({}); const it=after(MON,[[AN,'FRI']],{flags:{dating_heroine_01:true}}); const r0=JSON.parse(J(SOCIAL.rel(AN))); picks=[T('接受')]; await LUNCH118.afterClass(GM,it.key); const r1=SOCIAL.rel(AN);
    check('C6. 和交往中的以安吃午餐：只有熟悉 +2，信任、自在、戀愛（rom、npcRom）都不變（午餐不是約會）',r1.fam===r0.fam+2&&r1.trust===r0.trust&&r1.comf===r0.comf&&r1.rom===r0.rom&&r1.npcRom===r0.npcRom,J([r0,r1])); unrig(); }
  // C7 結算只一次（先記再做）
  { rig({}); const it=after(MON,[[ZHE,'CLO'],[AN,'CLO']]); const P=LUNCH118.plan(GM,it); const a=LUNCH118.settle(GM,P,{}); const s1=snap(); const b=LUNCH118.settle(GM,P,{}), c=LUNCH118.settle(GM,Object.assign({},P,{settled:false}),{skip:true});
    check('C7. S.settle 連叫三次（同一份、複製一份）：只有第一次做事，後面回 null、狀態不變',!!a&&b===null&&c===null&&snap()===s1&&moneyLog.length===1);
    const it2=after(MON,[[ZHE,'CLO']]); let order=[]; const km=GM.money; GM.money=function(d){ order.push('money:'+(G.l118.inv.done===G.day)); return km.call(GM,d); }; LUNCH118.settle(GM,LUNCH118.plan(GM,it2),{}); GM.money=km;
    check('C7. 扣錢以前已經記了「今天結算過」（中途出錯也不會發第二次）',J(order)===J(['money:true'])); unrig(); }
  // C8 資料檔不在＝整個系統不開
  { rig({}); for(const [nm,d] of [['不存在（null）',null],['空的物件',{}],['沒有 lunch',Object.assign(JSON.parse(J(TEST)),{lunch:[]})],['沒有選項的字',Object.assign(JSON.parse(J(TEST)),{options:{}})],['沒有邀約的句子',Object.assign(JSON.parse(J(TEST)),{invite:{}})]]){ useTest(d); const it=after(MON,[[ZHE,'CLO'],[AN,'CLO']]); const r=await LUNCH118.afterClass(GM,it.key);
      check('C8. 資料'+nm+'：dataOk 是 false、不邀、沒有任何字、沒有選單、不動存檔',LUNCH118.dataOk()===false&&r===false&&!said.length&&!opts.length&&G.l118===undefined&&LUNCH118.plan(GM,it).no==='off'); }
    delete globalThis.L118_LUNCH_DATA; const it=after(MON,[[ZHE,'CLO']]); check('C8. 連 L118_LUNCH_DATA 這個全域都沒有（檔案沒載到）：不丟例外、不邀',LUNCH118.dataOk()===false&&(await LUNCH118.afterClass(GM,it.key))===false&&!said.length); useTest(); unrig(); }
  // C9 阿哲週一手機揪午餐
  { rig({}); let it=after(MON,[[ZHE,'CLO'],[AN,'CLO']]); G.flags.L118_LUNCH={day:MON,shop:'noodle2',with:['zhe','yu']};
    check('C9. 週一阿哲手機揪了、已經答應（L118_LUNCH 是今天）：不當面邀',LUNCH118.plan(GM,it).no==='zheLunch'&&(await LUNCH118.afterClass(GM,it.key))===false&&!said.length);
    it=after(MON,[[ZHE,'CLO'],[AN,'CLO']]); G.flags.L118_PICK=MON+':dian'; check('C9. 剛回了「走。」還沒排進行程（L118_PICK）：也不邀',LUNCH118.plan(GM,it).no==='zheLunch');
    it=after(MON,[[ZHE,'CLO'],[AN,'CLO']]); G.flags.L118_LUNCH={day:MON-7,shop:'noodle2',with:['zhe']}; check('C9. 上週的約不算：照常判定',!LUNCH118.plan(GM,it).no);
    it=after(MON,[[ZHE,'CLO'],[AN,'ACQ']]); const k=PHONE.sent; PHONE.sent=(g,tag)=>tag==='l118_lunch_'+MON||k.call(PHONE,g,tag); const P=LUNCH118.plan(GM,it); PHONE.sent=k;
    check('C9. 阿哲今天傳了訊息、還沒回（或回了不行）：其他人照常判定，阿哲不當發起人也不同行',!P.no&&P.who===AN&&!P.party.includes(ZHE)&&P.top===1,J([P.who,P.party,P.top])); unrig(); }
  // C10 同堂的判斷：照既有的作息
  { let it=after(MON,[[ZHE,'CLO'],[AN,'CLO'],[BH,'CLO'],[PS,'CLO'],[YU,'CLO'],[MX,'CLO'],[XC,'CLO'],['classmate_youchen','CLO'],[SIS,'CLO'],[YT,'CLO'],['kai','CLO']]); useTest(REAL||undefined); const el=LUNCH118.eligible(G,it); useTest();
    check('C10. 正式資料、週一憲法（必修）：同屆的同學都算同堂；學姊、語彤、阿凱不算（宥辰照他的出席：這一週早上不來）',[ZHE,AN,BH,PS,YU,MX,XC].every(id=>el.includes(id))&&![SIS,YT,'kai'].some(id=>el.includes(id))&&!el.includes('classmate_youchen'),J(el));
    const e=STORY.schedEnt(CHARACTERS[ZHE],Object.assign({},G,{hour:it.t1-0.05})); check('C10. 用的是 STORY.schedEnt（classmateClass）回的那一堂（cls＝這一堂的 key）',!!e&&e.cls===it.key&&LUNCH118.inClass(G,ZHE,it)&&!LUNCH118.inClass(G,SIS,it));
    const k=STORY.present; STORY.present=(id,g)=>id===AN?false:k(id,g); const el2=LUNCH118.eligible(G,it); STORY.present=k; check('C10. 這學期不在學校的人（STORY.present）不算',!el2.includes(AN)&&el2.includes(ZHE));
    it=after(MON,[[AN,'CLO']]); G.invites=[{id:'iv',who:AN,day:MON,h:11.5,accepted:true,state:'accepted',done:false,place:'cafe',label:'x'}]; const eA=STORY.schedEnt(CHARACTERS[AN],Object.assign({},G,{hour:it.t1-0.05}));
    check('C10. 她那個時間照作息不在這一堂（例：和人約了在別的地方）就不算同堂——和 schedEnt 一致',LUNCH118.inClass(G,AN,it)===(!!eA&&eA.cls===it.key)); }

  // ================= D AA_771 的規則 =================
  // D1 十二點前後下課才判
  { fresh(MON,10,'classroom'); const base={key:'k',c:{kind:'required'},room:{zone:'classroom'}}; const L=t1=>LUNCH118.lawAm(G,Object.assign({},base,{t1}));
    check('D1. 下課時間 11:30～12:30 才算（12:10、11:30、12:30 算；10:00、11:00、12:40、15:10 不算）',L(12+10/60)&&L(11.5)&&L(12.5)&&!L(10)&&!L(11)&&!L(12+40/60)&&!L(15+10/60));
    const d0=JSON.parse(J(TEST)); d0.window={from:9.5,to:10.5}; useTest(d0); check('D1. 時間窗讀資料檔的 window（改成 9:30～10:30：十點下課的算、12:10 的不算）',L(10)&&!L(12+10/60)); useTest();
    check('D1. 期末考那一堂、服務學習、校外、其他教學館不算',!LUNCH118.lawAm(G,Object.assign({},base,{t1:12.17,exam:'final'}))&&!LUNCH118.lawAm(G,Object.assign({},base,{t1:12.17,c:{kind:'service'}}))&&!LUNCH118.lawAm(G,{key:'k',t1:12.17,c:{kind:'required'},room:{offsite:true}})&&!LUNCH118.lawAm(G,{key:'k',t1:12.17,c:{kind:'general'},room:{zone:'gongtong',room:'102',door:'common'}})&&!LUNCH118.lawAm(G,{key:'k',t1:12.17,c:{kind:'general'},room:{door:'gym'}}));
    check('D1. 法律系館A 201、202、法律系館B 多功能教室、研討室都算',['L201','LINZE','L202','WMULTI','WSEM'].every(r=>LUNCH118.lawAm(G,{key:'k',t1:12.17,c:{kind:'required'},room:COURSES.rooms[r]}))&&!['GONGTONG','PUTONG','BOYA','GYM','OFF','LAWLIB_DESK','CAMPUS_SVC'].some(r=>LUNCH118.lawAm(G,{key:'k',t1:12.17,c:{kind:'required'},room:COURSES.rooms[r]})));
    const it=after(MON,[[ZHE,'CLO']]); G.hour=12.75; check('D1. 下課以後拖到 12:45 才空下來：不邀（late）',LUNCH118.plan(GM,it).no==='late'); }
  // D2 店：一一八茶飲不當午餐、慢讀咖啡只有以安、沒開換下一間
  { const RU=LUNCH118.shopRules(), only=Object.keys(RU.onlyFor), lunchIds=LANE118_SHOPS.shops.map(s=>s.id).filter(id=>LUNCH118.lunchShop(id)&&!only.includes(id)), [a,b,c]=lunchIds;
    fresh(MON,12+10/60,'classroom'); const gA=Object.assign({},G,{hour:12+20/60});
    { const d0=JSON.parse(J(TEST)); d0.who[ZHE].prefs=Object.assign(Object.fromEntries(RU.noLunch.concat(only).map(id=>[id,9])),{[a]:1}); useTest(d0);
      check('D2. 規則（S.RULES）：不當午餐的店（'+RU.noLunch.join('、')+'）寫在 prefs 裡也不會選；只有某些人會選的店（'+only.join('、')+'）別人不會選',J(LUNCH118.shopsOf(G,ZHE,gA))===J([a])&&RU.noLunch.every(id=>!LUNCH118.lunchShop(id))&&only.every(id=>!RU.onlyFor[id].includes(ZHE)),J(LUNCH118.shopsOf(G,ZHE,gA)));
      for(const id of only){ const w=RU.onlyFor[id][0]; if(!d0.who[w]||!SH(id)) continue; d0.who[w].prefs={[id]:1}; useTest(d0); check('D2. '+id+' 只有 '+w+' 會選：他的 prefs 寫了就選得到',J(LUNCH118.shopsOf(G,w,gA))===J([id])); } useTest(); }
    /* 沒開的店：問的是「到店那一刻」（下課後 10 分鐘）*/
    const d1=JSON.parse(J(TEST)); d1.who[ZHE].prefs={[a]:100,[b]:100,[c]:1}; d1.who[AN].prefs={[b]:1}; d1.lunch=d1.lunch.filter(g=>!g.shop); useTest(d1); rig({shop:0}); const asked=[]; openIf=(id,g)=>{ asked.push(g.hour); return id===c; }; let it=after(MON,[[ZHE,'CLO']]); const P=LUNCH118.plan(GM,it);
    check('D2. 阿哲最想去的兩間今天沒開：換成開著的那一間（不會約去沒開的店）；營業時間問的是到店那一刻（12:20），用 L118.isOpen',!P.no&&P.shop===c&&asked.length>0&&asked.every(h=>Math.abs(h-(12+20/60))<1e-6),J([P.shop,asked.slice(0,2)]));
    openIf=()=>false; it=after(MON,[[ZHE,'CLO'],[AN,'ACQ']]); const P2=LUNCH118.plan(GM,it); openIf=id=>id===b; d1.who[ZHE].prefs={[a]:1}; useTest(d1); const P3=LUNCH118.plan(GM,it);
    check('D2. 大家想去的店都沒開：不邀（noShop）；只有以安想去的那間開著：阿哲不當發起人，換以安',P2.no==='noShop'&&!P3.no&&P3.who===AN&&P3.shop===b,J([P2.no,P3.who]));
    openAll(); useTest(); it=after(MON,[[ZHE,'CLO']]); picks=[T('婉拒')]; const Pn=LUNCH118.plan(GM,it); await LUNCH118.afterClass(GM,it.key); const nm=SH(Pn.shop).name;
    check('D2. {店名} 從 LANE118_SHOPS 讀（不寫死）：邀約的句子裡是那間店現在的名字',said[0].t===T('阿哲邀約一 '+nm),said[0].t);
    const keepName=SH(Pn.shop).name; SH(Pn.shop).name='改名以後的店'; it=after(MON,[[ZHE,'CLO']]); picks=[T('婉拒')]; await LUNCH118.afterClass(GM,it.key); SH(Pn.shop).name=keepName;
    check('D2. 店改名（資料重匯）以後：句子裡跟著換成新店名，程式不用改',said[0].t===T('阿哲邀約一 改名以後的店'),said[0].t); unrig(); }
  // D3 柏翰＋沛珊大二上不同桌
  { const run=(term)=>{ let both=0, n=0; const keep=[LUNCH118.eligible,LUNCH118.shopsOf,LUNCH118.limit]; LUNCH118.eligible=()=>[BH,PS,ZHE]; LUNCH118.shopsOf=(g,id)=>Object.keys(TEST.who[id].prefs); LUNCH118.limit=()=>24; const r=CALENDAR.termDays(term);
      for(let d=r.from;d<=r.to;d++){ fresh(d,12+10/60,'classroom'); for(const id of [BH,PS,ZHE]) know(id,'CLO'); CLS.rec(G).done.k=1; rig({hit:0,sp:0.99,n:0.99,who:RND0(G,'who'),shop:RND0(G,'shop'),mate0:RND0(G,'mate0'),mate1:RND0(G,'mate1')}); const P=LUNCH118.plan(GM,{key:'k',t1:12+10/60,c:{kind:'required'},room:{zone:'classroom'}}); if(P.no) continue; n++; if(P.party.includes(BH)&&P.party.includes(PS)) both++; }
      [LUNCH118.eligible,LUNCH118.shopsOf,LUNCH118.limit]=keep; unrig(); return {n,both}; };
    const a=run('Y2S1'), b=run('Y1S2');
    check('D3. 大二上整學期（每次都想湊四個人）：柏翰、沛珊從來不同桌；大一下可以同桌',a.n>50&&a.both===0&&b.both>0,J([a,b])); }
  // D4 n 欄、shop 欄、對話怎麼挑
  { const ids=(party,shop)=>LUNCH118.groupsFor(party,shop).map(g=>g.id).sort();
    check('D4. 阿哲＋Alison（含玩家三人）在麵舖：可以演 n=3 的那一組和各自的單人組；在滇香多「只在滇香」那一組',J(ids([ZHE,YU],'noodle2'))===J(['T-yu','T-zhe','T-zhe-b','T-zhe-yu-n3'])&&ids([ZHE,YU],'dian').includes('T-zhe-dian')&&!ids([ZHE,YU],'noodle2').includes('T-zhe-dian'));
    check('D4. 阿哲＋Alison＋以安（四人）：n=3 的那一組不抽',!ids([ZHE,YU,AN],'noodle2').includes('T-zhe-yu-n3')&&ids([ZHE,YU,AN],'noodle2').includes('T-an'));
    fresh(MON,12,'campus'); const a=LUNCH118.pickGroup(G,[ZHE,YU],'noodle2').id; LUNCH118.rec(G).lg['T-zhe-yu-n3']=MON-7; const b=LUNCH118.pickGroup(G,[ZHE,YU],'noodle2').id; const I=LUNCH118.rec(G); for(const k of ['T-zhe','T-zhe-b','T-yu']) I.lg[k]=MON-1; const c=LUNCH118.pickGroup(G,[ZHE,YU],'noodle2').id;
    check('D4. 沒演過的先（人多的組先）；演過了就換沒演過的；都演過＝最久沒演的那一組',a==='T-zhe-yu-n3'&&['T-zhe','T-zhe-b','T-yu'].includes(b)&&c==='T-zhe-yu-n3',J([a,b,c])); }
  // D5 婉拒回覆輪著用
  { rig({}); const got=[]; let g0=null; for(let i=0;i<5;i++){ const d=LAWMON[i]; fresh(d,12+10/60,'classroom'); if(g0){ G.social=g0.social; SOCIAL.bind(G); G.l118=g0.l118; } else know(ZHE,'CLO'); G.flags.MET_ZHE=true; const it=amIt(); CLS.rec(G).done[it.key]=1; picks=[i===2?T('接受'):T('婉拒')]; await LUNCH118.afterClass(GM,it.key); got.push(i===2?'（接受）':said[1].t); g0=JSON.parse(J(G)); }
    check('D5. 婉拒阿哲四次（中間接受一次）：回的句子一、二、（接受）、三、一——輪著用，接受以後不會倒回第一句；連續次數接受後歸零',J(got)===J([T('阿哲被拒一'),T('阿哲被拒二'),'（接受）',T('阿哲被拒三'),T('阿哲被拒一')])&&g0.l118.inv.decl[ZHE]===2&&g0.l118.inv.dn[ZHE]===4,J(got)); unrig(); }
  // D6 特殊：條件、偶遇的人、H 事件、不認得的條件
  { rig({sp:0}); let it=after(MON,[[ZHE,'ACQ']]); let P=LUNCH118.plan(GM,it); check('D6. 阿哲只是剛認識（條件要有點熟以上）、不認識學姊：抽到特殊也沒有成立的＝普通午餐',!P.no&&P.sp===null);
    it=after(MON,[[ZHE,'ACQ'],[SIS,'ACQ']]); P=LUNCH118.plan(GM,it); check('D6. 認識學姊、她這學期在學校、那個時間不是在上課打工：偶遇學姊成立',P.sp&&P.sp.id==='TS-meet-sis',J(P.sp&&P.sp.id));
    picks=[T('接受')]; const f0=SOCIAL.rel(SIS).fam, z0=SOCIAL.rel(ZHE).fam; await LUNCH118.afterClass(GM,it.key); const L=lines(), iMeet=L.findIndex(t=>/遇到學姊/.test(t)), iLunch=L.findIndex(t=>/阿哲午餐/.test(t)), iArr=L.findIndex(t=>/到 /.test(t));
    check('D6. 演出順序：邀約 → 到店旁白 → 偶遇 → 午餐對話 → 吃完旁白；偶遇的人 +1、同行 +2；路人的稱呼直接當名字',iArr>0&&iMeet>iArr&&iLunch>iMeet&&/吃完/.test(L[L.length-1])&&SOCIAL.rel(SIS).fam===f0+1&&SOCIAL.rel(ZHE).fam===z0+2&&said.some(s=>s.who==='助教')&&said.some(s=>s.id===SIS),J(L));
    it=after(MON,[[ZHE,'ACQ'],[SIS,'ACQ']]); L118.rec(G).once.H1=MON; P=LUNCH118.plan(GM,it); check('D6. 同一天已經演過學姊的 H 事件（H1）：不抽偶遇學姊',P.sp===null);
    it=after(MON,[[ZHE,'ACQ'],[SIS,'ACQ']]); const k=STORY.schedEnt; STORY.schedEnt=(c,g)=>c.id===SIS?{zone:'lawlib',act:'ta',from:12,to:14,days:[1]}:k(c,g); P=LUNCH118.plan(GM,it); STORY.schedEnt=k; check('D6. 學姊那個時間在當助教（作息）：不會在 118 巷遇到她',P.sp===null);
    it=after(MON,[[ZHE,'ACQ'],[SIS,'ACQ']]); const kp=STORY.present; STORY.present=(id,g)=>id===SIS?false:kp(id,g); P=LUNCH118.plan(GM,it); STORY.present=kp; check('D6. 學姊這學期不在學校：不抽',P.sp===null);
    const d0=JSON.parse(J(TEST)); d0.special=[d0.special[2]]; useTest(d0); it=after(MON,[[ZHE,'CLO']]); P=LUNCH118.plan(GM,it); check('D6. 條件有讀不懂的（when.unknown）：那一組永遠不播',!P.no&&P.sp===null);
    d0.special=[{id:'X',kind:'meet',who:[],when:{someNewKey:1},lines:[[null,T('不該出現')]]}]; useTest(d0); check('D6. when 有遊戲不認得的鍵：不播',LUNCH118.plan(GM,it).sp===null); useTest();
    /* whenOk 各鍵 */
    it=after(MON,[[ZHE,'FAM'],[AN,'FRI']]); const ctx={party:[ZHE],shop:'noodle2',who:ZHE,gA:Object.assign({},G,{hour:12.33})}, sp={who:[ZHE]}, W=w=>LUNCH118.whenOk(G,w,sp,ctx);
    check('D6. whenOk：inParty、minTier（看 inParty／who 的人）、terms、termFrom、flags、weekday、inTerm、weekFrom、shopOpen、at',
      W({inParty:[ZHE]})&&!W({inParty:[AN]})&&W({minTier:2})&&!W({minTier:3})&&W({terms:['Y1S1']})&&!W({terms:['Y1S2']})&&W({termFrom:'Y1S1'})&&!W({termFrom:'Y1S2'})&&W({flags:['YT_MET_JOB']})&&!W({flags:['NOPE']})&&W({weekday:true})&&W({inTerm:true})&&W({weekFrom:4})&&!W({weekFrom:5})&&(()=>{ const [x,y]=LANE118_SHOPS.shops.map(q=>q.id); openIf=id=>id===x; const r=W({shopOpen:[x]})&&!W({shopOpen:[y]}); openAll(); return r; })()&&W({at:'leave'})&&!W({at:'x'})&&W(undefined)&&!W({unknown:['x']}));
    /* 看過的特殊：隔 30 天才再出現 */
    it=after(MON,[[ZHE,'FAM']]); LUNCH118.rec(G).sp['TS-talk-zhe']=MON-10; const Pa=LUNCH118.plan(GM,it); LUNCH118.rec(G).sp['TS-talk-zhe']=MON-40; const Pb=LUNCH118.plan(GM,it);
    check('D6. 10 天前看過的特殊不再抽；40 天前看過的可以再出現，而且這次可以快速略過（不是第一次）',Pa.sp===null&&Pb.sp&&Pb.sp.id==='TS-talk-zhe'&&(()=>{ LUNCH118.rec(G).seen=1; return LUNCH118.canSkip(G,Pb)===true&&LUNCH118.canSkip(G,Object.assign({},Pb,{sp:Object.assign({},Pb.sp,{id:'NEW'})}))===false; })());
    unrig(); it=after(MON,[[ZHE,'CLO'],[SIS,'CLO']]); let nsp=0, nn=0; const keep=[LUNCH118.eligible,LUNCH118.shopsOf,LUNCH118.limit]; LUNCH118.eligible=()=>[ZHE]; LUNCH118.shopsOf=()=>['noodle2']; LUNCH118.limit=()=>24;
    for(let d=1;d<=5000;d++){ G.day=d; G.weekday=wdOf(d); CLS.rec(G).done.k=1; const k2=LUNCH118.whenOk; LUNCH118.whenOk=()=>true; const P5=LUNCH118.plan(GM,{key:'k',t1:12+10/60,c:{kind:'required'},room:{zone:'classroom'}}); LUNCH118.whenOk=k2; if(P5.no) continue; nn++; if(P5.sp) nsp++; } [LUNCH118.eligible,LUNCH118.shopsOf,LUNCH118.limit]=keep;
    check('D6. 特殊大約兩成（真的亂數，條件都成立時）',Math.abs(nsp/nn-0.2)<0.025,String(+(nsp/nn).toFixed(3))); }

  // ================= E 接線 =================
  // E1 CLS.afterMenu：吃完照常出下課選單；今天吃過不再出「先去吃飯」
  { rig({}); let it=after(MON,[[ZHE,'CLO']]); picks=[T('接受'),'先自由活動']; const r=await CLS.afterMenu(GM,it.key); const menu=opts[1]||[];
    check('E1. CLS.afterMenu：先出午餐邀約（接受、吃完），接著照常出下課選單；選單裡沒有「先去吃飯，再去下一堂」，其他照舊',r===true&&J(opts[0])===J([T('接受'),T('婉拒')])&&menu.some(t=>/讀書/.test(t))&&menu.some(t=>/自由活動/.test(t))&&menu.some(t=>/下一堂不去/.test(t))&&!menu.some(t=>/先去吃飯/.test(t))&&LUNCH118.doneToday(G),J(opts));
    it=after(MON,[[ZHE,'CLO']]); picks=[T('婉拒'),'先自由活動']; await CLS.afterMenu(GM,it.key); check('E1. 婉拒：接著的下課選單照舊有「先去吃飯，再去下一堂」',(opts[1]||[]).some(t=>/先去吃飯/.test(t)),J(opts[1]));
    it=after(MON,[]); picks=['先自由活動']; await CLS.afterMenu(GM,it.key); check('E1. 沒有人邀：下課選單和原本一模一樣（第一個選單就是它）',opts.length===1&&opts[0].some(t=>/先去吃飯/.test(t))&&!said.length,J(opts));
    it=after(MON,[[ZHE,'CLO']]); picks=['先自由活動']; await CLS.afterMenu(GM,it.key,{day:MON,key:it.key,ev:1}); check('E1. 這一堂下課演了課後劇情（afterP.ev）：這一天不邀，直接出下課選單；當天記判過',!said.length&&opts.length===1&&opts[0].some(t=>/先去吃飯/.test(t))&&G.l118.inv.day===MON&&G.l118.inv.hit===false,J(opts));
    const src=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8'); check('E1. classes3d.js：attend 記 afterP.ev、oneTick 把 afterP 傳給 afterMenu',/afterP\.ev=1/.test(src)&&/S\.afterMenu\(GM,a\.key,a\)/.test(src));
    it=after(termDay('Y1S1',4,3),[[ZHE,'CLO']]); picks=[T('接受')]; await CLS.afterMenu(GM,it.key); const nx=CLS.goList(G).filter(q=>!CLS.rec(G).done[q.key]); check('E1. 吃完、今天後面沒有課（或有課）都不丟例外，場景深度歸零',GM.depth===0,J([nx.map(q=>q.c.id),opts.length])); unrig(); }
  // E2 完整演出的順序、2D 的備案、3D 進店坐同一桌
  { rig({sp:0.99}); let it=after(MON,[[ZHE,'CLO']]); const sid0=LUNCH118.plan(GM,it).shop; picks=[T('接受')]; const r=await LUNCH118.afterClass(GM,it.key); const nm=SH(sid0).name;
    check('E2. 沒有 3D 區域（Node）：深色底 2D 演；順序＝邀約 → 到店旁白 → 午餐對話（{name} 換成玩家的名字、player＝祐廷、null＝旁白）→ 吃過的第一次旁白（EAT，既有）→ 吃完旁白',
      r==='done'&&J(advBg)===J(['dark'])&&ADV.active===false&&!entered.length&&J(lines().slice(0,5))===J(['阿哲：'+T('阿哲邀約一 '+nm),T('到 '+nm),'阿哲：'+T('阿哲午餐 祐廷'),'祐廷：'+T('祐廷回阿哲'),T('旁白一')])&&lines()[lines().length-1]===T('吃完一')&&GM.depth===0&&saves>0,J(lines()));
    { const firstLine=EAT.shopOf(nm)?EAT_LINES.first[EAT.shopOf(nm)]:null; check('E2. 吃過的：第一次吃這間店的旁白是 EAT 既有的那一句（eat_lines 有這間店才說），不是這個模組寫的',firstLine?(lines().length===7&&lines()[5]===firstLine):lines().length===6,J(lines().slice(5))); }
    /* 3D：假的店內區域 */
    /* 假的店內配置（不靠現在九間店的配置檔）：A 桌兩個位子（一個坐了路人）、B 桌四個位子、C 桌兩個位子、吧檯兩張高腳椅 */
    const LAY={seats:[{x:0,z:0,yaw:0,table:[0,0.5]},{x:0,z:1,yaw:3.14,table:[0,0.5]},{x:3,z:0,yaw:0,table:[3,0.5]},{x:3.6,z:0,yaw:0,table:[3,0.5]},{x:3,z:1,yaw:3.14,table:[3,0.5]},{x:3.6,z:1,yaw:3.14,table:[3,0.5]},{x:6,z:0,yaw:0,table:[6,0.5]},{x:6,z:1,yaw:3.14,table:[6,0.5]},{x:8,z:3,yaw:0,lift:0.29,table:[8,3.5]},{x:8.8,z:3,yaw:0,lift:0.29,table:[8.8,3.5]}],spawn:{x:1,z:4,yaw:3.14}};
    global.Z3={ZONES:{['l118_'+sid0]:{}}}; const LAY0=L118_SHOP_LAYOUTS[sid0]; L118_SHOP_LAYOUTS[sid0]=LAY; it=after(MON,[[ZHE,'CLO'],[AN,'CLO'],[BH,'CLO']]); rig({n:0.99,sp:0.99});
    GM.onEnter=z=>{ E.zone={seats:LAY.seats.map(s=>Object.assign({x:s.x,z:s.z,yaw:s.yaw,lv:0},s.lift?{lift:s.lift}:{})),spawn:LAY.spawn}; E.npcs=[{name:'',isExtra:true,seat:E.zone.seats[0]}]; GM.npc={}; };
    GM.spawnCharacter=(id,x,z,o)=>{ const n={charId:id,name:id,obj:{position:{x,y:0,z}},seat:o&&o.seat||null,pose:o&&o.pose}; GM.npc[id]=n; E.npcs.push(n); return n; };
    picks=[T('接受')]; const P=LUNCH118.plan(GM,it); let mid=null; const ks=GM.say; GM.say=async(w,t)=>{ if(!mid&&/午餐/.test(t)) mid={me:E.player.seat,npcs:P.party.map(id=>GM.npc[id]),spk:w}; return ks(w,t); }; await LUNCH118.afterClass(GM,it.key); GM.say=ks;
    const tk=st=>{ const q=LAY.seats.find(s=>Math.abs(s.x-st.x)<0.02&&Math.abs(s.z-st.z)<0.02); return q.table.join(','); };
    check('E2. 3D：進那間店（GM.enter l118_<店>，黑幕裡 onLoaded），不開 2D；玩家和三個同行都坐下、四個人同一張桌子（坐得下的那張四人桌）、沒坐到路人的位子',J(entered)===J(['l118_'+sid0])&&!advBg.length&&!!mid&&!!mid.me&&mid.npcs.length===3&&mid.npcs.every(n=>n&&n.seat&&n.pose==='sit')&&new Set([mid.me].concat(mid.npcs.map(n=>n.seat)).map(tk)).size===1&&new Set([mid.me].concat(mid.npcs.map(n=>n.seat))).size===4&&![mid.me].concat(mid.npcs.map(n=>n.seat)).includes(E.zone.seats[0]),J(mid&&[mid.me].concat(mid.npcs.map(n=>n&&n.seat))));
    check('E2. 3D：說話的人用店裡那個 3D 人物；吃完玩家站起來、人留在店裡、同行的人時段到了（until ≤ 現在）自己走',!!mid&&mid.spk===mid.npcs.find(n=>n.charId===mid.spk.charId)&&E.player.seat===null&&G.zone==='l118_'+sid0&&P.party.every(id=>GM.npc[id].until<=G.hour+1e-9&&GM.npc[id].lunch118===MON),J(P.party.map(id=>GM.npc[id].until)));
    /* 沒有一張坐得下的桌子：併相鄰的兩張（不會東一個西一個）*/
    it=after(MON,[[ZHE,'CLO'],[AN,'CLO'],[BH,'CLO']]); GM.onEnter=z=>{ E.zone={seats:LAY.seats.map(s=>Object.assign({x:s.x,z:s.z,yaw:s.yaw,lv:0},s.lift?{lift:s.lift}:{})),spawn:LAY.spawn}; E.npcs=[2,3].map(i=>({name:'',isExtra:true,seat:E.zone.seats[i]})); GM.npc={}; }; picks=[T('接受')]; const Pm=LUNCH118.plan(GM,it); let seatsM=null; const ks2=GM.say; GM.say=async(w,t)=>{ if(!seatsM&&/午餐/.test(t)) seatsM=[E.player.seat].concat(Pm.party.map(id=>GM.npc[id]&&GM.npc[id].seat)); return ks2(w,t); }; await LUNCH118.afterClass(GM,it.key); GM.say=ks2;
    check('E2. 3D：四人桌被路人坐了兩個位子：四個人併相鄰的兩張桌子（B 桌剩的兩個＋隔壁一張的兩個），不坐吧檯',!!seatsM&&seatsM.every(Boolean)&&new Set(seatsM).size===4&&new Set(seatsM.map(tk)).size===2&&seatsM.filter(st=>tk(st)==='3,0.5').length===2&&!seatsM.some(st=>st.lift),J(seatsM));
    /* 位子不夠 */
    it=after(MON,[[ZHE,'CLO'],[AN,'CLO']]); GM.onEnter=z=>{ E.zone={seats:[{x:0,z:0,yaw:0,lv:0},{x:0,z:1,yaw:0,lv:0}],spawn:{x:1,z:1,yaw:0}}; E.npcs=[]; GM.npc={}; }; picks=[T('接受')]; const P2=LUNCH118.plan(GM,it); await LUNCH118.afterClass(GM,it.key);
    check('E2. 3D：店裡只剩兩個空位、三個人：坐得下的先坐（玩家＋發起人），照樣演完、照樣結算三個人',P2.party.length===2&&!!GM.npc[P2.who]&&!GM.npc[P2.mates[0]]&&LUNCH118.doneToday(G)&&moneyLog.length===1&&SOCIAL.rel(P2.mates[0]).fam===LV.CLO[0]+2);
    /* 進店失敗 */
    it=after(MON,[[ZHE,'CLO']]); const ke=GM.enter; GM.enter=async()=>{ throw new Error('區域壞了'); }; picks=[T('接受')]; const kw=console.warn; console.warn=()=>{}; const r3=await LUNCH118.afterClass(GM,it.key); console.warn=kw; GM.enter=ke;
    check('E2. 3D 進店丟例外：退回 2D 演完（不卡住、場景深度歸零、照樣結算一次）',r3==='done'&&J(advBg)===J(['dark'])&&GM.depth===0&&moneyLog.length===1&&G.zone==='classroom');
    L118_SHOP_LAYOUTS[sid0]=LAY0; delete global.Z3; delete GM.spawnCharacter; GM.onEnter=null; unrig(); }
  // E3 讀檔的鎖、不留場景
  { const src=fs.readFileSync(path.join(ROOT,'src/l118_lunch3d.js'),'utf8'); check('E3. busy 旗標登記了讀檔的鎖（LOADLOCKS l118_lunch3d:busy）',/\['l118_lunch3d:busy'\]=\(\)=>\{ busy=false; \};/.test(src)&&typeof globalThis.LOADLOCKS['l118_lunch3d:busy']==='function');
    rig({}); const it=after(MON,[[ZHE,'CLO']]); let res=null; const kc=GM.choose; GM.choose=()=>new Promise(r=>{ res=r; }); const p=LUNCH118.afterClass(GM,it.key); await new Promise(r=>setTimeout(r,5));
    const it2=amIt(); G.l118.inv.day=null; const r2=await LUNCH118.afterClass(GM,it2.key); globalThis.LOADLOCKS['l118_lunch3d:busy'](); G.l118.inv.day=null; GM.choose=kc; picks=[T('婉拒')]; const r3=await LUNCH118.afterClass(GM,it2.key); res(1); await p;
    check('E3. 邀約的選單開著的時候再叫一次＝不重入；讀檔放開鎖以後可以重新開始',r2===false&&r3==='decline'); unrig(); }

  // ================= F 正式資料跑大一上、大一下 =================
  if(REAL){ useTest(REAL); openIf=null;   /* 真的營業時間 */ const ALL=new Set(); const walk=x=>{ if(typeof x==='string') ALL.add(x); else if(x&&typeof x==='object') for(const k of Object.keys(x)) if(k!=='_meta'&&k!=='cond'&&k!=='note') walk(x[k]); }; walk(REAL);
    const friends=[ZHE,AN,BH,PS,YU,MX,XC,'classmate_youchen',SIS,YT,'heroine_04','kai']; let inv=0, done=0, bad=[], whoSeen=new Set(), shops=new Set(), sps=new Set(), tea=0, cafeOther=0, days=0, g0=null, maxParty=0, moneyBad=0;
    const unfill=(t,P)=>{ /* 把填好的句子還原成資料檔的原句來比 */ for(const raw of ALL){ if(raw===t||LUNCH118.fill(raw,P,G)===t) return true; } return false; };
    for(const term of ['Y1S1','Y1S2']) for(let w=1;w<=16;w++) for(let wd=1;wd<=5;wd++){ const d=termDay(term,w,wd); if(d==null) continue; fresh(d,12+10/60,'classroom');
        if(g0){ G.social=g0.social; SOCIAL.bind(G); G.l118=g0.l118; G.eat=g0.eat; G.money=g0.money; G.flags.MET_ZHE=true; } else for(const id of friends) know(id,'FRI');
        const it=amIt(); if(!it||!LUNCH118.lawAm(G,it)){ continue; } CLS.rec(G).done[it.key]=1; days++; const P=LUNCH118.plan(GM,it); const m0=G.money; picks=[(days%4===0)?REAL.options.decline:REAL.options.accept];
        const r=await LUNCH118.afterClass(GM,it.key); if(r===false){ g0=JSON.parse(J(G)); continue; } inv++; whoSeen.add(P.who); shops.add(P.shop); maxParty=Math.max(maxParty,P.party.length+1); if(LUNCH118.shopRules().noLunch.includes(P.shop)||!LUNCH118.lunchShop(P.shop)) tea++; if(LUNCH118.shopRules().onlyFor[P.shop]&&!LUNCH118.shopRules().onlyFor[P.shop].includes(P.who)) cafeOther++;
        if(r==='done'){ done++; if(P.sp) sps.add(P.sp.id); if(G.money!==m0-P.price) moneyBad++; }
        for(const s of said){ if(EAT_LINES.first&&Object.values(EAT_LINES.first).includes(s.t)) continue; if(!unfill(s.t,P)) bad.push(s.t); if(/[{}]/.test(s.t)) bad.push('沒填好：'+s.t); }
        for(const o of opts[0]||[]) if(!ALL.has(o)) bad.push('選項：'+o);
        g0=JSON.parse(J(G)); }
    check('F1. 正式資料、大一兩學期（真的亂數；每四次婉拒一次）：有邀約、有吃完的；每一句（邀約、選項、對話、旁白）都是資料檔裡的句子，大括號都填好',days>=50&&inv>=10&&done>=8&&bad.length===0,J({days,inv,done,bad:bad.slice(0,4)}));
    check('F2. 不只一個人發起、不只一間店；沒有約去不當午餐的店、限定某些人的店只有那些人約（S.RULES）；含玩家最多四人；每次只扣自己那一份',whoSeen.size>=3&&shops.size>=3&&tea===0&&cafeOther===0&&maxParty<=4&&moneyBad===0,J({who:[...whoSeen],shops:[...shops],sps:[...sps],maxParty}));
    check('F3. 存檔的 inv 欄位都在、沒有奇怪的值',g0&&['day','hit','done','n','seen','decl','dn','lg','sp','wk'].every(k=>k in g0.l118.inv)&&Object.values(g0.l118.inv.wk).every(e=>e.pts<=6),J(g0&&Object.keys(g0.l118.inv)));
    useTest(); openAll(); }
  else check('F. 沒有正式資料檔（AA 還沒交稿）：略過',true);

  console.log(fails?('\nFAILED '+fails):'\nALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

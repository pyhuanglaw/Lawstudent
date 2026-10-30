// INVITE-MENU-1030（使用者 2026-10-30 04:2x：「學姊也不能約她 其他活動 請幫我檢查統一每個可攻略角色約她的選項要更多 如果太多就分階層」）。不需要瀏覽器。
// 用法：node tests/invite_menu_unit.js
//   A 分層：第一層照分類（AA_535 第 2 節的名稱：念書／吃飯／喝咖啡、喝茶／散步／運動／出去玩…／這個時候才有），一層最多 8 列；一類只有一個＝直接列；整類約不了＝灰掉、小字寫原因
//   A 校外第二層照地點分類（DATE.GROUPS）；B 當面也能約校外（不用聯絡方式、她當面答應、不寫手機）；C 學姊晚上在 Café：sisCafe 演完有「約她去…」
//   D 可昕交往中：校內地點照現有台詞開；E 沛珊在台南：校內地點不列；F 「其他日子…」：之後 7 天選一天（學姊約得到週末）；G 舊邀約、資料格式不變
// 修改前（postrel-1030）這個測試會失敗。
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INVITE_REPLIES|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|FREE_TRIPS|TRIP|ENCOUNTERS|ENC_WALK|ENC|DORM_ROOM|SISG)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
global.CHAR={setExpr(){},build:()=>mkObj()};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+String(info).slice(0,700):'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/data/invite_replies.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/sis_grad3d.js',
  'src/data/dorm_room_layout.js','src/story3d.js','src/classes3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const D=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
const nextWd=(d,wd)=>{ while(wdOf(d)!==wd) d++; return d; };
let G=null, said=[], picks=[], opts=[], full=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const J=x=>JSON.stringify(x);
/* 選項：picks 的下一個（字串＝選項包含它；RegExp＝符合；數字＝第幾個）；找不到＝選最後一個（算了／返回）、不消耗 picks */
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(n){ G.money+=n; },setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ const T=o.map(q=>q.t||q.text); opts.push(T); full.push(o); if(opts.length>80) throw new Error('選項一直重來：'+J(opts.slice(-3))); if(picks.length){ const w=picks[0]; if(typeof w==='number'){ picks.shift(); return w; } const k=T.findIndex(x=>w instanceof RegExp?w.test(x):x.includes(w)); if(k>=0){ picks.shift(); return k; } } return o.length-1; }};
const fresh=(day,hour,flags)=>{ G={v:3,stage:'law',day,hour,zone:'dorm',weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,afternoonDone:true,classDone:true,introDone:true,metAn:true,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,contacts:{},invites:[],stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; picks=[]; opts=[]; full=[]; GM.npc={}; if(STORY._fy) STORY._fy.reset(); return G; };
const S3={fam:22,trust:12,comf:8,npcRom:2,rom:0}, S4={fam:30,trust:20,comf:15,npcRom:10,rom:0}, S5={fam:45,trust:30,comf:20,npcRom:35,rom:10}, S6={fam:60,trust:45,comf:40,npcRom:55,rom:30};
const know=(id,rel,noContact)=>{ SOCIAL.remember(id,'FIRST_MET',''); Object.assign(SOCIAL.rel(id),rel); if(!noContact) G.contacts[id]=1; };
const T=()=>said.map(s=>s.t), thread=id=>(G.msgs||[]).filter(m=>m.th==='p:'+id).map(m=>(m.from||'')+':'+m.text);
const ask=async(id,pk,n,together)=>{ said=[]; opts=[]; full=[]; picks=pk||[]; let r=null, err=null; try{ r=await INV.flow(GM,id,n||null,!!together); }catch(e){ err=String(e&&e.stack||e); } return {r,err,opts:opts.slice(),full:full.slice(),L:T().concat(err?['（例外）'+err]:[])}; };
const max8=a=>a.opts.every(o=>o.length<=8);
const GROUPS=()=>DATE.GROUPS||[{id:'tpe_art',t:'',ids:['D01','D02','D03','D04','D05','D06']},{id:'ntp_sea',t:'',ids:['D13','D14','D16','D17','D23']}];   /* 修改前沒有 DATE.GROUPS：照稿的分組跑下去（各項照樣 FAIL）*/
const CATS=['念書…','吃飯…','喝咖啡、喝茶…','散步…','運動…'];   /* 法律系那幾年：念書＝總圖＋慢讀咖啡＋法圖（AA_535、AA_535b）；散步＝溫州街＋映月湖（AA_535b）*/
(async()=>{
  const mon=nextWd(D('2026-03-09'),1), tue=mon+1, sat=nextWd(mon,6), sun=sat+1;   // 大一下（學姊筆試、放榜以後）
  // ===== A. 第一層照分類 =====
  { fresh(mon,10); know('heroine_01',S5);
    const a=await ask('heroine_01',['算了']);
    check('A1. 手機約以安：第一層＝念書…／吃飯…／喝咖啡、喝茶…／散步…／運動…／出去玩…／算了',J(a.opts[0])===J(CATS.concat(['出去玩…','算了'])),J(a.opts[0])+a.err);
    check('A1. 一層不超過 8 列',max8(a),J(a.opts.map(o=>o.length)));
    const f=a.full[0]||[]; const meal=f.find(o=>o.t==='吃飯…')||{};
    check('A1. 一類的小字列裡面的地點（吃飯…：阿鳳麵店、半熟）',/阿鳳麵店/.test(meal.hint||'')&&/半熟/.test(meal.hint||'')&&!meal.dim,J(meal));
    const b=await ask('heroine_01',['吃飯','返回','喝咖啡','返回','運動','返回','念書','返回','算了']);
    check('A2. 吃飯…：麵店、半熟＋返回；返回回到第一層',J(b.opts[1])===J(['去阿鳳麵店吃飯','去半熟吃早午餐','返回'])&&J(b.opts[2])===J(b.opts[0]),J(b.opts.slice(0,3)));
    check('A2. 喝咖啡、喝茶…：兩點半 Café、一盞、慢讀咖啡＋返回',J(b.opts[3])===J(['去兩點半 Café 坐坐','去一盞喝茶','去慢讀咖啡念書','返回']),J(b.opts[3]));
    check('A2. 念書…：總圖、慢讀咖啡（同一個地點可以放兩類）、法圖＋返回',J(b.opts[7])===J(['去總圖一起念書','去慢讀咖啡念書','去法圖一起念書','返回']),J(b.opts[7]));
    check('A2. 運動…：羽球、晨跑＋返回',J(b.opts[5])===J(['去新體育館打羽球','去椰影大道晨跑','返回']),J(b.opts[5]));
    const c=await ask('heroine_01',['吃飯','麵店',/^明天/]);
    const iv=(G.invites||[]).slice(-1)[0]||{};
    check('A3. 從分類選地點：照原本的流程排進 INV（accepted、by player、地點 noodle）',!!c.r&&iv.place==='noodle'&&iv.state==='accepted'&&iv.by==='player'&&iv.who==='heroine_01',J([iv,c.L.slice(-3)]));
  }
  // 整類都約不了：灰掉、小字寫原因；選了說原因、再選一次
  { fresh(mon,10); know('heroine_01',{fam:10,trust:4,comf:2,npcRom:0,rom:0});
    const st=SOCIAL.stage('heroine_01');
    const a=await ask('heroine_01',['吃飯','算了']); const f=a.full[0]||[], meal=f.find(o=>o.t==='吃飯…')||{};
    check('A4. 還沒到有點熟（'+st+'）：吃飯…整類灰掉、小字「再熟一點，才約得出去吃飯。」',meal.dim===true&&meal.hint==='再熟一點，才約得出去吃飯。',J(meal));
    check('A4. 選了灰掉的一類：說原因、留在第一層',a.L.includes('再熟一點，才約得出去吃飯。')&&J(a.opts[1])===J(a.opts[0]),J([a.L,a.opts.length]));
    const sit=f.find(o=>o.t==='喝咖啡、喝茶…')||{};
    check('A4. 一類裡還有約得到的（Café、慢讀）：不灰、小字只列約得到的（一盞要朋友）',!sit.dim&&sit.hint==='兩點半 Café、慢讀咖啡',J(sit));
  }
  // ===== A. 校外第二層 =====
  { fresh(sat-1,10); know('heroine_01',S5);
    const a=await ask('heroine_01',['出去玩','算了']);
    const L2=a.opts[1]||[];
    check('A5. 出去玩…第二層照地區和天數分類（AA_535：臺北市；新北市、桃園；一整天；不再平鋪 28～30 列）、不超過 8 列',L2.length>=3&&L2.length<=8&&L2.includes('臺北市：看展・電影…')&&L2.includes('新北市、桃園：海邊…')&&L2.includes('一整天（宜蘭、中南部）…')&&L2[L2.length-1]==='算了',J(L2));
    const flat=Object.keys(DATE_DATA.locations).filter(k=>DATE.listable(k)&&DATE.kindAt(k,10)).length;
    check('A5. 前提：可以列的校外地點有 '+flat+' 個（平鋪會超過 8 列）',flat>8,flat);
    const grp={}; for(const g of GROUPS()) for(const k of g.ids) grp[k]=(grp[k]||0)+1;
    const all=Object.keys(DATE_DATA.locations).filter(k=>(DATE.loc(k).kinds||[]).some(x=>x!=='overnight'));
    check('A5. DATE.GROUPS：一日、半日的地點每個剛好分到一類，一類最多 7 個',all.every(k=>grp[k]===1)&&!!DATE.GROUPS&&DATE.GROUPS.every(g=>g.ids.length<=7),J(all.filter(k=>grp[k]!==1)));
    const b=await ask('heroine_01',['出去玩','海邊','返回','算了']);
    const sea=GROUPS().find(g=>g.id==='ntp_sea').ids.filter(k=>DATE.listable(k)&&DATE.kindAt(k,10)).map(k=>DATE.loc(k).name);
    check('A5. 海邊…：第三層列海邊的地點＋返回；返回回到第二層',sea.length>1?J(b.opts[2])===J(sea.concat(['返回']))&&J(b.opts[3])===J(b.opts[1]):true,J([sea,b.opts[2]]));
    check('A5. 校外的每一層也不超過 8 列',max8(b),J(b.opts.map(o=>o.length)));
  }
  // ===== B. 當面也能約校外 =====
  { fresh(sat-1,10); know('heroine_01',S5,true);   // 沒有聯絡方式（當面不用）
    const n={obj:mkObj()}; const a=await ask('heroine_01',['算了'],n,true); const f=a.full[0]||[], o=f.find(x=>x.t==='出去玩…');
    check('B1. 當面約以安（together）：第一層也有「出去玩…」（校外）、沒有聯絡方式也約得到（不灰）',!!o&&!o.dim,J(a.opts[0])+' '+J(o));
    const city=GROUPS().find(g=>g.id==='tpe_art').ids.find(k=>DATE.listable(k)&&DATE.kindAt(k,10));
    if(city){ const nm=DATE.loc(city).name, d=sat;
      const b=await ask('heroine_01',['出去玩','看展',nm,new RegExp('^(今天 |明天 )?'+CALENDAR.dateOf(d).m+'/'+CALENDAR.dateOf(d).d+'（'),/^1[03]:00 出發/,'就這樣約'],n,true);
      const t=(G.trips||[]).slice(-1)[0]||{};
      check('B2. 當面約校外：照手機那一套排進 DATE（booked、by player、那一天）',t.who==='heroine_01'&&t.status==='booked'&&t.by==='player'&&t.day===d&&(t.locs||[])[0]===city,J([t,b.L.slice(-4),b.full.slice(-2)]));
      check('B2. 當面約完不寫手機（她的那一句當面講、沒有「（手機）」）',thread('heroine_01').length===0&&!said.some(s=>/（手機）/.test(s.who||'')),J([thread('heroine_01'),said.slice(-4)]));
    } else check('B2. 前提：市區有可以列的地點',false);
  }
  // ===== C. 學姊晚上在 Café：sisCafe 演完有「約她去…」 =====
  { fresh(tue,20,{met_sis:true}); G.zone='cafe'; know('heroine_05',S4);
    const n={obj:mkObj(),name:'溫學姊'}; let err=null;
    try{ picks=[]; await STORY._v1.talkSis(GM,n); }catch(e){ err=String(e&&e.stack||e); }   /* 第一次可能先演升階的門檻台詞（relUp：這一次就不閒聊），第二次才是 Café 那一段 */
    said=[]; opts=[]; full=[]; picks=[0,'約她去','算了'];
    try{ await STORY._v1.talkSis(GM,n); }catch(e){ err=String(e&&e.stack||e); }
    const ix=opts.findIndex(o=>o.includes('約她去…'));
    check('C1. 學姊晚上（20:00）在 Café：Café 那一段照舊演（便條）',said.some(s=>/便條/.test(s.t)),J(said.map(s=>s.t))+(err||''));
    check('C1. 演完多一個選單有「約她去…」（原本 19:00 以後直接結束）',ix>=0&&said.findIndex(s=>/便條/.test(s.t))>=0,J(opts)+(err||''));
    check('C1. 選了「約她去…」接 INV.flow：分類的第一層（當面也有出去玩…）',ix>=0&&!!opts[ix+1]&&opts[ix+1].includes('念書…')&&opts[ix+1].includes('出去玩…'),J(opts[ix+1]));
  }
  // ===== D. 可昕交往中：校內地點照現有台詞開 =====
  { fresh(mon,10,{dating_kexin:true}); know('kexin',S6);
    const own=['cafe','library','noodle','wenzhou','brunch','teahouse','gym_badminton','run_avenue','slowread'].map(p=>[p,INV.kxPlaceLine?INV.kxPlaceLine(G,INV.place(p)):null]);
    check('D1. 可昕交往中：Café、總圖、麵店、溫州街、半熟、一盞、羽球、晨跑、慢讀都有她自己的答應句（AA_415 kx21～kx26、AA_417、AA_535）',own.every(x=>x[1]==='own'),J(own));
    const a=await ask('kexin',['算了']);
    check('D1. 手機約可昕：第一層有念書、吃飯、喝咖啡喝茶、散步、運動、出去玩（原本只有羽球、晨跑、去校外）',J(a.opts[0])===J(CATS.concat(['出去玩…','算了'])),J(a.opts[0])+(a.err||''));
    const b=await ask('kexin',['喝咖啡','兩點半','其他日子',/（週六）$/,'15:30']);
    const iv=(G.invites||[]).slice(-1)[0]||{};
    check('D2. 約可昕週六去 Café：照原本的流程（accepted、by player）、答應句是 AA_415 kx21',iv.who==='kexin'&&iv.place==='cafe'&&iv.state==='accepted'&&iv.by==='player'&&wdOf(iv.day)===6&&b.L.some(t=>t.includes('首都帝大的 Café？好。我要坐你平常坐的那張。')),J([iv,b.L]));
    fresh(mon,10,{}); know('kexin',S6);
    check('D3. 沒交往的可昕照舊：手機約不到（她在木柵大學，不用這個清單約）',INV.canInvite(G,'kexin')===false);
  }
  // ===== E. 沛珊在台南：校內地點不列 =====
  { const d=nextWd(D('2027-10-04'),1); fresh(d,10,{PS_RECONNECT:true}); know('classmate_peishan',S5);
    const p=STORY.presence('classmate_peishan',G);
    check('E0. 前提：2027-10 沛珊在台南（presence kind city）',p.here===false&&p.kind==='city'&&p.city==='台南',J(p));
    const a=await ask('classmate_peishan',['算了']); const O=a.opts[0]||[];
    check('E1. 手機約沛珊（台南）：校內地點一個都不列（比照以安、芷若在台中）',!O.some(t=>CATS.includes(t)||/Café|總圖|阿鳳|溫州街|半熟|一盞|羽球|晨跑/.test(t)),J(O)+(a.err||''));
    check('E1. 留可行的：出去玩…、我去台南找妳？',O.includes('出去玩…')&&O.some(t=>/台南/.test(t))&&O[O.length-1]==='算了',J(O));
  }
  // ===== F. 其他日子：學姊平日白天在總圖 → 約週末 =====
  { fresh(tue,10); know('heroine_05',S4);
    const a=await ask('heroine_05',['念書','去總圖','其他日子','返回','算了']);
    const T1=a.opts[2]||[], DL=a.opts[3]||[];
    check('F1. 時間的清單多一個「其他日子…」',T1.includes('其他日子…')&&T1[T1.length-1]==='算了',J(T1));
    check('F1. 其他日子：之後 2～7 天（標星期）＋返回，有週六、週日',DL.length===7&&DL[6]==='返回'&&DL.some(t=>/（週六）$/.test(t))&&DL.some(t=>/（週日）$/.test(t))&&DL[0].startsWith(CALENDAR.dateOf(tue+2).m+'/'+CALENDAR.dateOf(tue+2).d+'（'),J(DL));
    check('F1. 返回回到時間的清單',J(a.opts[4])===J(T1),J(a.opts[4]));
    const b=await ask('heroine_05',['念書','去總圖','其他日子',/（週六）$/,'10:00']);
    const iv=(G.invites||[]).slice(-1)[0]||{};
    check('F2. 學姊週六 10:00 去總圖：約得到（accepted、by player、週六 10:00；平日白天是「我就在總圖」）',iv.who==='heroine_05'&&iv.place==='library'&&iv.state==='accepted'&&iv.by==='player'&&iv.day===nextWd(tue,6)&&Math.abs(iv.h-10)<1e-6,J([iv,b.L]));
    const c=await ask('heroine_05',['念書','去總圖','明天 12:10']);
    check('F2. 對照：平日（明天 12:10）照舊是她自己的規則（她就在總圖、不排邀約）',c.L.some(t=>/我就在總圖/.test(t)),J(c.L));
    Object.assign(SOCIAL.rel('heroine_05'),S5); const g=await ask('heroine_05',['運動','晨跑','其他日子',/（週日）$/,'返回']); const tt=g.opts[4]||[];
    check('F3. 只有固定時間的地點（晨跑 06:30）：其他日子也只列那個時間',J(tt)===J(['06:30','換一天']),J(tt));
  }
  // ===== G. 舊存檔、已排好的邀約不受影響 =====
  { fresh(mon,10); know('heroine_01',S5); know('zhe',S4);
    const old={id:'iv1',who:'zhe',place:'noodle',zone:'noodle',day:mon+1,h:19,state:'accepted',accepted:true,by:'player',now:false,label:'和阿哲約在阿鳳麵店'}; G.invites.push(JSON.parse(J(old))); G.invSeq=1;
    const a=await ask('heroine_01',['喝咖啡','兩點半',/^明天 12:10/]);
    const nw=G.invites.slice(-1)[0];
    check('G1. 舊的那一筆一個欄位都沒變、新的照舊編號（iv2）',J(G.invites[0])===J(old)&&nw.id==='iv2'&&nw.who==='heroine_01',J(G.invites));
    check('G1. 新的一筆欄位和原本一樣（沒有多的欄位）',J(Object.keys(nw).sort())===J(['accepted','by','day','h','id','label','now','place','state','who','zone']),J(Object.keys(nw)));
    check('G1. 舊的那一筆照舊算數（S.booked、upcoming）',!!INV.booked(G,'zhe')&&INV.upcoming(G).some(v=>v.id==='iv1'));
  }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });

// 寒暑假回老家的所在地（任務 HOLIDAY-PRESENCE-1021；AA-C 清查 4739fca1 第 C 類第 4 點）——不需要瀏覽器。用法：node tests/holiday_presence_unit.js
// 起因：以安、阿哲、柏翰寒暑假回老家（手機傳「回台中了」「我明天回高雄」「我今天回新竹」），characters.js 的 presence 沒記，玩家照樣約得到臺北的地點。
//   1. 每一段的頭一天、最後一天 STORY.presence 是 kind 'home'＋城市；前一天、回來那天在臺北（日期照訊息表、AA_197 1-4、AA_264 第 5 節、AA_345 H2／H6、AA_350 N8、BB_171 第 1 節）；
//      人物線索（STORY.whereIs）寫 absentDates 的原因
//   2. 邀約：手機朋友頁「回○○了，不在臺北。」、約那幾天＝「○○寒暑假回○○了，不在臺北。」；回來那天照常約；約的那一天照那一天算（今天在臺北、約到她回老家的日子也不行）
//   3. 柏翰：寒暑假的週四搭客運上來總圖（absentDates 的 exceptWd:[4]；AA_197 1-4、AA_241 第 5 節、AA_250 大一上「中間每週四會上來總圖」）：
//      週四在臺北、約得到；約的那一天照那一天算星期（不是今天的星期）；presence 的結果不帶 exceptWd
//   4. 原本做好的照演：以安 D26 臺中、阿哲 D29 高雄的偶遇（在他們老家的城市）；臺北的偶遇（阿哲 D04 西門町）那幾天不出現；
//      芷若在台中的日子手機照常（不是「她在英國，只寄明信片」）；劇情寫死的生人物（校園傍晚的以安、下午的阿哲、宿舍晚上的阿凱）回老家的日子不出現
//   明軒（AA_350 N8，LAWWW-C 補充）：三個寒假的除夕不在臺北、2029-08-14（二）不在（麵店也不在）、8/21 在。
// 修改前（開發分支 3ae17a4e）50 項 FAIL 41：原本就有的段落（明軒 2026、芷若 2029、以安 2028）、週四的日子、作息以外的第 1、2、3 項，和第 4 項的西門町偶遇、三個生人物；
//   偶遇 D26／D29、芷若手機那三項修改前就 PASS——是防回歸：改資料以後也要照常。
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|FREE_TRIPS|TRIP|ENCOUNTERS|ENC_WALK|ENC|DORM_ROOM)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
global.CHAR={setExpr(){},build:()=>mkObj()};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js',
  'src/data/dorm_room_layout.js','src/story3d.js','src/classes3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/data/enc_walk.js','src/encounter3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const D=k=>STORY.dayOfKey(k), K=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const P=(id,day)=>STORY.presence(id,{day,flags:{},stage:'law'});
const NM={heroine_01:'以安',zhe:'阿哲',classmate_bohan:'柏翰',classmate_mingxuan:'明軒',heroine_02:'芷若',kai:'阿凱'};
let G=null;
const GM0={get G(){ return G; },E:{npcs:[],interactables:[],zone:{seats:[]},player:{obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0}},npc:{},D:{active:false}};
const fresh=(day,hour,zone,flags)=>{ G={v:3,stage:'law',day,hour,zone:zone||'campus',weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,afternoonDone:true,classDone:true,introDone:true,metAn:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,contacts:{},invites:[],stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM0); INV.rec(G); return G; };
const know=(id,fam)=>{ SOCIAL.remember(id,'FIRST_MET',''); const r=SOCIAL.rel(id); r.fam=fam||30; r.trust=10; r.comf=10; G.contacts[id]=1; };

/* ---------- 每一段（迄日不含＝回臺北那天）：[人物, 起, 迄, 城市, 例外的星期幾] ---------- */
const SEG=[
  ['heroine_01','2026-01-20','2026-02-21','台中'],['heroine_01','2026-07-25','2026-08-08','台中'],['heroine_01','2027-02-01','2027-02-21','台中'],['heroine_01','2027-07-24','2027-08-08','台中'],['heroine_01','2029-02-09','2029-02-18','台中'],
  ['zhe','2026-01-02','2026-02-20','高雄'],['zhe','2026-07-01','2026-08-21','高雄'],['zhe','2027-01-05','2027-02-20','高雄'],['zhe','2027-07-01','2027-08-21','高雄'],['zhe','2028-01-04','2028-02-20','高雄'],['zhe','2028-07-01','2028-08-21','高雄'],['zhe','2029-01-03','2029-02-17','高雄'],
  ['classmate_bohan','2026-01-09','2026-02-19','新竹',[4]],['classmate_bohan','2026-06-27','2026-09-07','新竹',[4]],['classmate_bohan','2027-01-09','2027-02-19','新竹',[4]],['classmate_bohan','2028-01-09','2028-02-19','新竹',[4]],['classmate_bohan','2029-02-12','2029-02-15','新竹'],
  ['classmate_mingxuan','2027-02-02','2027-02-09','彰化'],['classmate_mingxuan','2028-01-22','2028-01-29','彰化'],['classmate_mingxuan','2029-02-09','2029-02-16','彰化'],['classmate_mingxuan','2029-08-10','2029-08-17','彰化'],
  ['heroine_02','2026-01-26','2026-02-19','台中'],['heroine_02','2026-07-01','2026-08-26','台中'],
  ['kai','2026-02-13','2026-02-21','宜蘭']];
const exempt=(s,d)=>!!s[4]&&s[4].includes(wdOf(d));
const firstIn=s=>{ let d=D(s[1]); while(exempt(s,d)) d++; return d; }, lastIn=s=>{ let d=D(s[2])-1; while(exempt(s,d)) d--; return d; };
const home=(p,city)=>p.here===false&&p.kind==='home'&&p.home===city;
(async()=>{
  check('0. 日子都在日曆裡（STORY.dayOfKey 找得到）',SEG.every(s=>D(s[1])!=null&&D(s[2])!=null));
  /* ===== 1. presence ===== */
  for(const s of SEG){ const [id,a,b,city]=s, f=firstIn(s), l=lastIn(s), pf=P(id,f), pl=P(id,l), pb=P(id,D(b)), p0=P(id,D(a)-1);
    check('1. '+NM[id]+' '+a+'～'+b+'（迄日不含）：'+K(f)+'、'+K(l)+' 回'+city+'；前一天 '+K(D(a)-1)+'、回來那天 '+b+' 在臺北',home(pf,city)&&home(pl,city)&&pb.here===true&&p0.here===true,JSON.stringify([pf,pl,pb,p0].map(p=>p.here?'here':p.kind+':'+p.home))); }
  /* 明軒（AA_350 N8，AA-C 3f406dbc；LAWWW-C 補充）：三個寒假的除夕不在臺北；2029-08-14（二）不在（麵店也不在）、8/21 在 */
  { const M='classmate_mingxuan', eve=['2027-02-05','2028-01-25','2029-02-12'];
    check('1. 明軒（AA_350 N8）：三個寒假的除夕（'+eve.join('、')+'）回彰化過年；2029-08-14 回彰化、2029-08-21 在臺北',eve.every(k=>home(P(M,D(k)),'彰化'))&&home(P(M,D('2029-08-14')),'彰化')&&P(M,D('2029-08-21')).here===true,JSON.stringify(eve.concat(['2029-08-14','2029-08-21']).map(k=>k+':'+(P(M,D(k)).here?'here':P(M,D(k)).kind))));
    const at=(k,h)=>{ fresh(D(k),h,'noodle'); know(M); return STORY.whereIs(GM0,M); }, w14=at('2029-08-14',18.5), w21=at('2029-08-21',18.5);
    check('1. 明軒週二 18:00 的麵店（作息 2028-05-02～2029-08-28）：2029-08-14 不在（回彰化）、8/21 在',!!w14&&w14.zone===null&&w14.away==='回彰化'&&!!w21&&w21.zone==='noodle',JSON.stringify([w14,w21])); }
  { const p=P('heroine_01',D('2026-01-25')); fresh(D('2026-01-25'),15,'campus'); know('heroine_01'); const w=STORY.whereIs(GM0,'heroine_01');
    check('1. 人物線索：以安 2026-01-25 寫「回台中過年」（absentDates 的原因），不在任何場景',p.away==='回台中過年'&&!!w&&w.zone===null&&w.away==='回台中過年',JSON.stringify([p,w])); }
  check('1. 原本就有的照舊：以安 2028-01-24～01-28 回台中、日本 3/25～8/4；明軒 2026-08-10～08-16；芷若 2029-08-25～08-31 回台中',home(P('heroine_01',D('2028-01-26')),'台中')&&P('heroine_01',D('2028-01-29')).here&&P('heroine_01',D('2028-05-01')).kind==='abroad'&&home(P('classmate_mingxuan',D('2026-08-12')),'彰化')&&home(P('heroine_02',D('2029-08-27')),'台中'));
  check('1. 芷若大三上（英國，學期的 absent）照舊；大一寒假前後在 Café 那幾天照舊在',P('heroine_02',D('2027-10-15')).kind==='absent'&&P('heroine_02',D('2026-01-23')).here&&P('heroine_02',D('2026-09-01')).here);
  /* ===== 2. 邀約 ===== */
  for(const id of Object.keys(NM)){ const s=SEG.find(x=>x[0]===id), d=firstIn(s), city=s[3]; fresh(d,14,'campus'); know(id);
    const why=INV.whyNot(G,id), r=INV.decide(G,id,'cafe',d,15), rep=r&&r.why==='away'?INV.reply(G,id,'cafe',r):'';
    fresh(D(s[2]),14,'campus'); know(id); const back=INV.whyNot(G,id);
    check('2. 邀約：'+NM[id]+' '+K(d)+' 朋友頁「回'+city+'了，不在臺北。」、約那天＝「…寒暑假回'+city+'了，不在臺北。」；'+s[2]+' 回來了照常約',why==='回'+city+'了，不在臺北。'&&r.res==='decline'&&r.why==='away'&&/寒暑假回(.+)了，不在臺北。$/.test(rep)&&rep.endsWith('寒暑假回'+city+'了，不在臺北。')&&back==='',JSON.stringify([why,r,rep,back])); }
  { fresh(D('2026-01-18'),14,'campus'); know('heroine_01'); const r=INV.decide(G,'heroine_01','cafe',D('2026-01-22'),15), r2=INV.decide(G,'heroine_01','cafe',D('2026-01-19'),15);
    check('2. 1/18 約以安：1/22（她回台中了）不行、1/19 可以（約的那一天算，不是今天）',r.why==='away'&&r2.why!=='away',JSON.stringify([r,r2])); }
  /* ===== 3. 柏翰的週四 ===== */
  { const B='classmate_bohan', thu=['2026-01-15','2026-07-02','2026-08-20','2027-01-14','2028-01-13'], fri=['2026-01-16','2026-07-03','2026-08-21','2027-01-15','2028-01-14'];
    check('3. 0. '+thu.join('、')+' 是週四',thu.every(k=>wdOf(D(k))===4));
    check('3. 柏翰：寒暑假的週四在臺北（上來總圖），隔天週五回新竹',thu.every(k=>P(B,D(k)).here===true)&&fri.every(k=>home(P(B,D(k)),'新竹')),JSON.stringify(thu.concat(fri).map(k=>k+':'+(P(B,D(k)).here?'here':P(B,D(k)).kind))));
    check('3. presence 的結果不帶 exceptWd（只是用來判斷）',!('exceptWd' in P(B,D('2026-07-03'))));
    fresh(D('2026-07-02'),10,'library'); know(B); const e=STORY.schedEnt(CHARACTERS[B],G);
    check('3. 大一暑假的週四 10:00 在總圖（作息「總圖（暑假的週四）」）、手機約得到',!!e&&e.zone==='library'&&INV.whyNot(G,B)==='',JSON.stringify([e&&e.zone,INV.whyNot(G,B)]));
    const r=INV.decide(G,B,'cafe',D('2026-07-03'),15);
    check('3. 週四約週五（2026-07-03）：照那一天算星期＝回新竹了',r.why==='away',JSON.stringify(r));
    fresh(D('2026-07-03'),10,'campus'); know(B); const r2=INV.decide(G,B,'cafe',D('2026-07-09'),15);
    check('3. 週五約下週四（7/09）：不是「回新竹了」（今天是週五也一樣）',r2.why!=='away'&&INV.whyNot(G,B)==='回新竹了，不在臺北。',JSON.stringify([r2,INV.whyNot(G,B)])); }
  /* ===== 4. 原本做好的照演 ===== */
  const encAt=(key,h,spot,ids)=>{ fresh(D(key),h,'gongguan'); for(const id of ids) know(id); return ENC.candidates(G,spot).map(c=>c.row.who); };
  { const a=encAt('2026-01-24',15,'D26',['heroine_01']), b=encAt('2029-02-10',15,'D26',['heroine_01']);
    check('4. 以安 D26 臺中（她回台中的日子的週六 14～17）：2026-01-24、2029-02-10 照樣遇得到',a.includes('heroine_01')&&b.includes('heroine_01'),JSON.stringify([a,b])); }
  { const a=encAt('2026-02-14',15,'D29',['zhe']), b=encAt('2028-07-08',15,'D29',['zhe']);
    check('4. 阿哲 D29 高雄駁二（他回高雄的日子的週六）：2026-02-14、2028-07-08 照樣遇得到',a.includes('zhe')&&b.includes('zhe'),JSON.stringify([a,b])); }
  { const a=encAt('2026-01-10',20,'D04',['zhe']), b=encAt('2025-12-27',20,'D04',['zhe']);
    check('4. 阿哲 D04 西門町（週六 19～22）：回高雄的 2026-01-10 不在；回去以前的 2025-12-27 照常',!a.includes('zhe')&&b.includes('zhe'),JSON.stringify([a,b])); }
  { const Z='heroine_02', at=k=>{ fresh(D(k),20,'campus'); know(Z); return MSG.open(G,Z); }, o1=at('2026-02-01'), o2=at('2026-08-01'), o3=at('2027-10-15');
    check('4. 芷若回台中（2026-02-01、2026-08-01）手機照常（不是「她在英國，只寄明信片」）；大三上在英國照舊',o1.ok&&o2.ok&&!o3.ok&&o3.why==='她在英國，只寄明信片',JSON.stringify([o1,o2,o3])); }
  { const pop=(zone,key,h)=>{ const day=D(key); fresh(day,h,zone); const ids=[];
      const E={npcs:[],interactables:[],q:{level:'high'},zone:{seats:[],spots:{}},levels:null,indoor:zone!=='campus',player:{obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},addNPC(n){ this.npcs.push(n); return n; },removeNPC(n){ this.npcs=this.npcs.filter(m=>m!==n); }};
      const GM={E,G,npc:{},D:{active:false}};
      GM.spawnNPC=(id)=>{ ids.push(id); const n={id,obj:mkObj(),charId:id}; GM.npc[id]=n; E.npcs.push(n); return n; };
      GM.spawnCharacter=(id)=>{ ids.push(id); const n={id,obj:mkObj(),charId:id}; GM.npc[id]=n; E.npcs.push(n); return n; };
      GM.spawnExtra=()=>{}; GM.removeNPC=id=>{ delete GM.npc[id]; }; EVENTS.bind(GM);
      try{ STORY.populate(zone,GM); }catch(e){ return ['ERR:'+e.message]; } finally { EVENTS.bind(GM0); } return ids; };
    const an1=pop('campus','2026-01-25',18.5), an0=pop('campus','2026-01-19',18.5), zh1=pop('campus','2026-01-10',16), zh0=pop('campus','2025-12-30',16), ka1=pop('dorm','2026-02-15',22), ka0=pop('dorm','2026-02-21',22);
    check('4. 校園傍晚散步的以安：回台中的 2026-01-25 18:30 不出現；1/19 照常',!an1.includes('an')&&an0.includes('an'),JSON.stringify([an1,an0]));
    check('4. 校園下午的阿哲：回高雄的 2026-01-10 16:00 不出現；12/30 照常',!zh1.includes('zhe')&&zh0.includes('zhe'),JSON.stringify([zh1,zh0]));
    check('4. 宿舍晚上的阿凱：回宜蘭的 2026-02-15 22:00 不在房間；2/21 回來了',!ka1.includes('kai')&&ka0.includes('kai'),JSON.stringify([ka1,ka0])); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

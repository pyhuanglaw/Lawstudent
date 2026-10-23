// 曼谷那幾天芷若的 presence（BB 帳號 A 10-22 09:27 讀碼；企劃線 AA_244 2d3a0735「大三暑假：子晴，曼谷」〔芷若×子晴交往中〕、BB_194 23-4）——不需要瀏覽器。
//   原本 characters.js 芷若大三暑假只有「回台中」（2028-07-01～08-01）：她們交往中、ZRZQ 把芷若加進同行的人、夜市那天有椰子汁的旁白，
//   手機「現在大概在」、去找她、邀約卻說她在台中。現在芷若多一筆 ['2028-07-03','2028-07-08','在曼谷','trip',{signal:true,when}]（寫法同子晴、阿凱），
//   when＝ZRZQ.bkkWith（7/3 那天她們交往中）；presCore（story3d.js）的 absentDates 多一個 when 條件：不成立就看下一筆（回台中）。
//   1 交往中（4-4 大三下 6/2 開始）：7/5 芷若、子晴、阿凱「現在大概在」都是在曼谷（trip、有訊號、7/8 回來）
//   2 7/2、7/8：芷若照舊在台中（回台中那一筆）；子晴、阿凱 7/8 回來
//   3 沒在一起（friends、mutual_interest、held）＝7/5 照舊在台中；祐廷和子晴交往中（ZZ 不會是 dating）也一樣
//   4 跟祐廷有沒有一起去無關（報名去、沒去、人在日本都一樣）
//   5 只讀存檔：presence 不替沒有 ZZ 的舊存檔建一筆；結果不帶 when
// 修改前（開發分支 33103bab）：第 1 項 FAIL（芷若 7/5 在台中）。用法：node tests/zz_bkk_presence_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|ACTIVITIES|ZRZQ|ZRZQ_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
const zrzqOk=fs.existsSync(path.join(ROOT,'src/zrzq3d.js')); if(zrzqOk){ load('src/data/zrzq_events.js'); load('src/zrzq3d.js'); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, D=k=>STORY.dayOfKey(k);
check('0. 有 ZRZQ（src/zrzq3d.js）',zrzqOk&&typeof ZRZQ!=='undefined');
let G=null; const GM={get G(){ return G; },E:{zone:null,npcs:[]},npc:{}};
const at=(key,h,zz,flags)=>{ const day=D(key); G={day,hour:h,zone:'campus',stage:'law',weekday:CALENDAR.dateOf(day).wd%7,flags:Object.assign({introDone:true,afternoonDone:true,classDone:true,metAn:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null};
  if(zz) G.flags.ZZ=Object.assign({v:1,state:'friends',since:D('2027-02-15'),ev:{},yt:'none',sem:{},fy:null,f3:null,forceB:false,held:null,version:null,month:null,ending:null},zz);
  SOCIAL.bind(G); return G; };
const P=id=>STORY.presence(id,G), W=id=>{ const w=STORY.whereIs(GM,id); return w?(w.away||w.zone||'?'):null; };
const DATING={state:'dating',datingDay:D('2028-06-02'),datingTerm:'Y3S2'};
/* 1 */
at('2028-07-05',15,DATING);
{ const p2=P('heroine_02'), p4=P('heroine_04'), pk=P('kai');
  check('1. 交往中：7/5 芷若在曼谷（trip、有訊號、7/8 回來）',p2.here===false&&p2.away==='在曼谷'&&p2.kind==='trip'&&p2.signal===true&&p2.back===D('2028-07-08'),J(p2));
  check('1. 7/5 子晴、阿凱也在曼谷（同一筆）',p4.away==='在曼谷'&&pk.away==='在曼谷'&&p4.back===p2.back&&pk.back===p2.back,J([p4,pk]));
  check('1. 手機「現在大概在」：三個人都寫在曼谷',['heroine_02','heroine_04','kai'].every(id=>W(id)==='在曼谷'),J(['heroine_02','heroine_04','kai'].map(W)));
  check('1. 7/3、7/7 也在曼谷（含頭尾）',(at('2028-07-03',9,DATING),P('heroine_02').away==='在曼谷')&&(at('2028-07-07',22,DATING),P('heroine_02').away==='在曼谷')); }
/* 2 */
{ at('2028-07-02',15,DATING); const a=P('heroine_02'); at('2028-07-08',15,DATING); const b=P('heroine_02'), b4=P('heroine_04'), bk=P('kai');
  check('2. 7/2、7/8：芷若照舊在台中（回台中那一筆）',a.away==='回台中'&&a.kind==='home'&&a.home==='台中'&&b.away==='回台中'&&b.home==='台中',J([a,b]));
  check('2. 7/8：子晴、阿凱回來了（不在曼谷）',b4.away!=='在曼谷'&&bk.away!=='在曼谷',J([b4,bk])); }
/* 3 */
{ const L=[['friends',{state:'friends'}],['mutual_interest',{state:'mutual_interest'}],['held（英國）',{state:'held',held:'uk'}],['held（方奕廷）',{state:'held',held:'fy',fy:'seeing'}],['沒有 ZZ',null],['7/3 以後才交往',{state:'dating',datingDay:D('2028-07-04'),datingTerm:'Y3S2'}]]
    .map(([n,z])=>{ at('2028-07-05',15,z); const p=P('heroine_02'); return [n,p.away,p.home]; });
  check('3. 沒在一起（friends、mutual_interest、held 兩種、沒有 ZZ）＝7/5 照舊在台中；7/3 那天還沒交往也一樣',L.every(x=>x[1]==='回台中'&&x[2]==='台中'),J(L)); }
{ at('2028-07-05',15,{state:'feelings_emerging'},{dating_heroine_04:true}); const p=P('heroine_02'), p4=P('heroine_04');
  check('3. 祐廷和子晴交往中（ZZ 不會是 dating）：芷若在台中、子晴照舊在曼谷',p.away==='回台中'&&p4.away==='在曼谷',J([p.away,p4.away])); }
/* 4 */
{ const L=[['報名去',{VAC_T03:'going'}],['沒去',{VAC_T03:'no'}],['人在日本',{JP_ROUTE:true}]].map(([n,f])=>{ at('2028-07-05',15,DATING,f); return [n,P('heroine_02').away]; });
  check('4. 跟祐廷有沒有一起去無關：三種都在曼谷',L.every(x=>x[1]==='在曼谷'),J(L)); }
/* 5 */
{ at('2028-07-05',15,null); P('heroine_02'); W('heroine_02');
  check('5. 只讀存檔：沒有 ZZ 的舊存檔問 presence 不會建 ZZ',G.flags.ZZ===undefined,J(G.flags.ZZ));
  at('2028-07-05',15,DATING); const p=P('heroine_02');
  check('5. 結果不帶 when（只有 here、away、kind、back、signal）',!('when' in p)&&J(Object.keys(p).sort())===J(['away','back','here','kind','signal']),J(Object.keys(p)));
  const e=CHARACTERS.heroine_02.presence.absentDates, i=e.findIndex(x=>x[0]==='2028-07-03'), j=e.findIndex(x=>x[0]==='2028-07-01');
  check('5. 芷若那一筆放在「回台中」前面（第一個符合的那筆算）、寫法同子晴',i>=0&&j>=0&&i<j&&J(e[i].slice(0,4))===J(CHARACTERS.heroine_04.presence.absentDates.find(x=>x[0]==='2028-07-03').slice(0,4))&&typeof e[i][4].when==='function',J([i,j])); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

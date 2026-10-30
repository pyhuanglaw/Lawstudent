// AA_506 第 0 節（企劃線 010515370，AA-C 10-28）給 LAWWW 先修的現有內容——不需要瀏覽器。
//   第 2 點：學姊大二暑假（2027-06-14～08-31）平日週二、四在法圖（7/28 她傳「法圖暑假開到五點」），週一、三、五照舊總圖。
//   第 1 點：子晴階梯 Q4-L1 第二句「……然後手癢，想把它做大。」、第一個選項「做多大？」→「還不知道。先做到我自己想玩為止。」（import_ladder.py 疊在大二下，AA 03:23）。
//   第 3 點：vac_activities C17 可昕視訊那句「全台北的律師」改「全台灣的律師」（她在高雄實習）。
// 修改前（開發分支 718ed1c48）：第 1、3 項 FAIL；第 4 項（Q4-L1）修改前（3f45d21e3）FAIL。用法：node tests/aa506_s0_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|ACTIVITIES|VAC_ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
const ent=(key,h)=>{ const day=STORY.dayOfKey(key); const G={day,hour:h,zone:'library',stage:'law',weekday:CALENDAR.dateOf(day).wd%7,flags:{introDone:true,afternoonDone:true}}; const e=STORY.schedEnt(CHARACTERS.heroine_05,G); return e?e.zone:null; };
/* 2027-07-27（二）、07-29（四）、07-26（一）、07-28（三）、07-30（五） */
const tue=ent('2027-07-27',10), thu=ent('2027-07-29',15), mon=ent('2027-07-26',10), wed=ent('2027-07-28',10), fri=ent('2027-07-30',10);
check('1. 大二暑假週二、週四白天：學姊在法圖（lawlib）',tue==='lawlib'&&thu==='lawlib',J({tue,thu}));
check('2. 大二暑假週一、三、五白天：照舊在總圖（library）',mon==='library'&&wed==='library'&&fri==='library',J({mon,wed,fri}));
const spring=ent('2027-04-13',10), y1sum=ent('2026-07-28',10);
check('2. 別的時候不變：大二下學期中的週二白天照舊總圖',spring==='library',J({spring}));
check('2. 大一暑假週二照舊總圖（只改大二暑假）',y1sum==='library',J(y1sum));
const src=fs.readFileSync(path.join(ROOT,'src/data/vac_activities.js'),'utf8');
check('3. C17 可昕視訊：「……全台灣的律師都在講這句吧。」（不是全台北）',src.includes("text:'……全台灣的律師都在講這句吧。'")&&!src.includes('全台北的律師'));
{ const L=fs.readFileSync(path.join(ROOT,'src/data/ladder.js'),'utf8'); const m=L.match(/const LADDER=(\{.*\});\n/); const LD=m?JSON.parse(m[1]):null;
  const st=LD&&((LD.byTerm.Y2S2||{}).heroine_04||{steps:[]}).steps.find(x=>x.id==='Q4-L1');
  check('4. 子晴 Q4-L1：第二句「……然後手癢，想把它做大。」、選項「做多大？」→「還不知道。先做到我自己想玩為止。」、第二個選項照舊',!!st&&st.lines[1]==='……然後手癢，想把它做大。'&&st.choices[0].t==='「做多大？」'&&st.choices[0].reply==='還不知道。先做到我自己想玩為止。'&&st.choices[1].t==='「第一關好玩嗎？」'&&st.mem==='ZQ4_SECOND_LEVEL',st?J({l:st.lines,c:st.choices.map(c=>c.t)}):'找不到 Q4-L1'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

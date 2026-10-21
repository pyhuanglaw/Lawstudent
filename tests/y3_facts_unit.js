// 大三的劇情事實到了時間一律記（AA_326：2-Y3-09 颱風假、2-Y3-17 續約 RENT_RENEWED、2-Y3-20 事件 13 YT_EV13）——不需要瀏覽器。
//   1. 2027-10-13 是颱風假（停課）；前一晚 20:00 手機新聞「明天停止上班上課。」；
//   2. 2027-11-24 15:30 起 RENT_RENEWED（之前沒有）；2027-12-16 20:00 起 YT_EV13；舊存檔讀進來已經過了那天＝直接記；
//   3. 經濟系那一年不記；4. STORY.careerTick（S.tick 每格）會叫它。
// 修改前 1～4 FAIL。用法：node tests/y3_facts_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|PHONE)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/phone3d.js','src/story3d.js']) load(f);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const mk=(k,hh,o)=>{ const d=STORY.dayOfKey(k); const G=Object.assign({day:d,hour:hh,stage:'law',flags:{},msgs:[],phone:{groups:{},seen:{},q:[],n:0},social:null},o||{}); SOCIAL.bind(G); return G; };
const ty=STORY.dayOfKey('2027-10-13');
check('1. 2027-10-13 是颱風假', CALENDAR.typhoon(ty)===true);
{ const G=mk('2027-10-12',19.9); const ok=typeof STORY.y3Facts==='function'; if(ok) STORY.y3Facts(G); const q=(G.phone.q||[]).concat(G.msgs||[]); const has=JSON.stringify(q).includes('明天停止上班上課。');
  check('1. 前一晚排好 20:00 的停課新聞', ok&&has&&PHONE.sent(G,'ty3_news'), JSON.stringify(q).slice(0,200)); }
{ let G=mk('2027-11-24',15.4); if(STORY.y3Facts) STORY.y3Facts(G); const before=!!G.flags.RENT_RENEWED; G.hour=15.5; STORY.y3Facts&&STORY.y3Facts(G);
  check('2. 11/24 15:30 以前沒有、15:30 起 RENT_RENEWED', !before&&G.flags.RENT_RENEWED===true); }
{ let G=mk('2027-12-16',19.9); if(STORY.y3Facts) STORY.y3Facts(G); const before=!!G.flags.YT_EV13; G.hour=20; STORY.y3Facts&&STORY.y3Facts(G);
  check('2. 12/16 20:00 以前沒有、20:00 起 YT_EV13（語彤大三下的閒聊階梯 Y6-L1／L7 讀 S.ytEv13）', !before&&G.flags.YT_EV13===true&&STORY.ytEv13(G)); }
{ const G=mk('2028-03-01',10); STORY.y3Facts&&STORY.y3Facts(G); check('2. 舊存檔讀進來已經過了那兩天：直接記', G.flags.RENT_RENEWED===true&&G.flags.YT_EV13===true); }
{ const G=mk('2028-03-01',10,{stage:'econ'}); STORY.y3Facts&&STORY.y3Facts(G); check('3. 經濟系那一年不記', !G.flags.RENT_RENEWED&&!G.flags.YT_EV13); }
{ const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('4. careerTick（S.tick 每格）會叫 y3Facts', /S\.careerTick=function\(G\)\{ const F=G\.flags; if\(\(G\.stage\|\|'law'\)!=='law'\) return; S\.y3Facts\(G\);/.test(st)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

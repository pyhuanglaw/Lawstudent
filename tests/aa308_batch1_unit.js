// AA_308 第 1、2、6、10 節＋AA_309 第 4 列（經濟系 30 分鐘版；使用者 10-20 選擇題）——不需要瀏覽器。
//   1. 12/13 以前的補習班演出來：ev_y0_cram／ev_y0_cram_h 在 30 分鐘版的停點（KEEP）；第一句「十二月十三日下午……」（前一天的電話不演，不說「隔天」）；
//      ECONFF.defaults 的「可以免費」（CRAM_FREE_KNOWN）只在 12/13～12/14 都錯過才補記——修改前 12/13 一到就記，那場永遠演不到。
//   2. 1/8（三）18:30 公館吃麵（新事件 ev_y0_jan8／_h，在家的快轉會停）：18:30 以前、1/9 不演；演過（Y0_JAN8）另一個版本不再演；句子、表情照 AA_308 第 2、9 節。
//   3. 日期卡：11/7～12/12、12/14～12/30（期末考完、寒假開始）、1/1～1/7、1/9～1/27（tests/econ_ff_unit.js 也查）。
//   4. 7/12 對答案只講她自己的；9/13 保齡球品妤「都帶了吧？來，抽籤。」。
// 用法：node tests/aa308_batch1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|ECONFF)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js','src/econff3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const ev=id=>STORY_EVENTS.find(e=>e.id===id), D=k=>STORY.dayOfKey(k);
const texts=e=>(e&&e.dialogue||[]).filter(l=>l.text).map(l=>l.text);
const G=(key,h,flags)=>({day:D(key),hour:h,stage:'econ',zone:'campus',flags:Object.assign({E01_MORNING:true,Y0_MOVED_OUT:true},flags||{}),events:{done:{},last:{},count:0}});
// 1
check('1. 補習班兩個版本都在 30 分鐘版的停點（KEEP）', ECONFF.KEEP.has('ev_y0_cram')&&ECONFF.KEEP.has('ev_y0_cram_h'));
check('1. 第一句「十二月十三日下午，你在外面晃，晃到以前的補習班那條街。」', texts(ev('ev_y0_cram'))[0]==='十二月十三日下午，你在外面晃，晃到以前的補習班那條街。', texts(ev('ev_y0_cram'))[0]);
{ const g=G('2024-12-13',15); ECONFF.defaults(g); check('1. 12/13 15:00：還不算知道可以免費（那場才演得到）', !g.flags.CRAM_FREE_KNOWN);
  check('1. 12/13 15:00 在家：補習班（在家版）的條件成立', !!ev('ev_y0_cram_h').prereq.custom(g));
  const g2=G('2024-12-15',10); ECONFF.defaults(g2); check('1. 12/15：都錯過了才補記 CRAM_FREE_KNOWN（2/13 水餃店約 2/14 要用）', g2.flags.CRAM_FREE_KNOWN===true); }
// 2
const j=ev('ev_y0_jan8_h'), jo=ev('ev_y0_jan8');
check('2. 1/8 公館吃麵兩個版本在、在停點（KEEP）', !!j&&!!jo&&ECONFF.KEEP.has('ev_y0_jan8')&&ECONFF.KEEP.has('ev_y0_jan8_h'));
if(j){ check('2. 1/8 18:00 還不演', !j.prereq.custom(G('2025-01-08',18)));
  check('2. 1/8 18:30 在家：演', !!j.prereq.custom(G('2025-01-08',18.5)));
  check('2. 1/9 不演（只有那天）', !j.prereq.custom(G('2025-01-09',19)));
  check('2. 演過（Y0_JAN8）另一個版本不再演', !jo.prereq.custom(G('2025-01-08',19,{Y0_JAN8:true}))&&!j.prereq.custom(G('2025-01-08',19,{Y0_JAN8:true})));
  const T=texts(j); check('2. 句子照 AA_308 第 2 節＋AA_368 M4（1/3、1/6 的私訊已經講過「整科就這一份」「不能補交」，這裡不重講；12/20 到 1/8 是 19 天）：「期末考考完快三個禮拜了」「……葉老師那封信，我又看了一次。」「還是不能補交。」、簡章還在我桌上、先吃麵', T[0]==='（一月八日。期末考考完快三個禮拜了。她還沒回高雄，約你在公館吃麵。）'&&T[1]==='……葉老師那封信，我又看了一次。'&&T[2]==='還是不能補交。'&&!T.includes('……國文那份報告，我記錯時間了。')&&!T.includes('老師回信說，不能補交。')&&T.includes('我十二月去問的那個重考班，簡章還在我桌上。')&&T.includes('先吃麵。麵要糊了。')&&T[T.length-1]==='（那天晚上，誰都沒有說要怎樣。）', JSON.stringify(T));
  const ch=j.dialogue.find(l=>l.choice); check('2. AA_368 M4：選項「妳打算怎麼辦？」「（等她說下去）」（原本「整科就那一份？」）', !!ch&&ch.choice.map(c=>c.text).join('|')==='「妳打算怎麼辦？」|（等她說下去）');
  { const D=j.dialogue, at=lb=>{ const i=D.findIndex(l=>l.label===lb); return D[i+1]&&D[i+1].text; }; check('2. AA_368 M4：j8a →「……還不知道。」；j8b →「整科就那一份。……我一直在想這件事。」；之後 j8c 不改（「我十二月去問的那個重考班……」）', at('j8a')==='……還不知道。'&&at('j8b')==='整科就那一份。……我一直在想這件事。'&&at('j8c')==='我十二月去問的那個重考班，簡章還在我桌上。', JSON.stringify([at('j8a'),at('j8b'),at('j8c')])); }
  const ex=t=>(j.dialogue.find(l=>l.text===t)||{}).expression; check('2. 表情照 AA_308 第 9 節（國文 sad、開玩笑 surprised、先吃麵 smile）', ex('……葉老師那封信，我又看了一次。')==='sad'&&ex('還是不能補交。')==='sad'&&ex('……你那天傳訊息，我以為你在開玩笑。')==='surprised'&&ex('先吃麵。麵要糊了。')==='smile');
  check('2. 背景是麵店（noodle_table）', (j.dialogue[0]||{}).bg==='noodle_table'); }
// 4
{ const T=texts(ev('ev_y0_exam2')); check('4. 7/12 對答案（ev_y0_exam2）：沒有「……你數學一百？」「好像是。」；「數學我錯一題。」', !T.includes('……你數學一百？')&&!T.includes('好像是。')&&T.includes('數學我錯一題。'), JSON.stringify(T.slice(-6))); }
{ const T=texts(ev('ev_y0_e14')); check('4. 9/13 保齡球：品妤「都帶了吧？來，抽籤。」（旁白講過帶制服，不重複）', T[1]==='都帶了吧？來，抽籤。'&&!T.includes('大家都帶了吧？高中制服。抽籤交換。'), T[1]); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

// AA_308 第 4 節＋AA_309 第 2、3 列（經濟系；使用者 10-20 選「媽媽不罵」）——不需要瀏覽器。
//   1. 10/17 捷運上的電話之後回家跟媽媽說（ev_y0_e30 結尾，2D home_living）：「……想好了？」「你從小就想念法律。」「鑰匙在老地方。開慢一點。」；
//      電話裡可昕的表情照 AA_308 第 9 節（蛤 surprised、你現在在哪 serious、休學又不是不能進校門 annoyed）。
//   2. 車上那場第一句「（你拿了車鑰匙出門。）」（原本「你到家，拿了家裡的車鑰匙」）。
//   3. 車上那場 17:40 到社科院門口：快轉 16:10 出發（OUT 的到達＝max(出發＋1.5 小時, 17:40)）；原本 17:40 才出發、19:10 才到——她說五點下課，等了兩個多小時。
//      回到宿舍照舊「快十一點」：17:40＋hours 在 22:40～23:00。
//   4. 可昕不在場的場景後面不接她的閒聊階梯（通則）：結尾她不在的出遊標 kxAway（10/17 回 412、8/30 一個人開車下山、跨年回程的高鐵）；
//      outings3d.js 的「沒回的訊息那句」「閒聊階梯」「畫面留在她身上」三個地方都看 kxAway。
// 修改前 1～4 都 FAIL。用法：node tests/aa308_batch2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|ECONFF)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js','src/econff3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=e=>(e&&e.dialogue||[]).filter(l=>l.text);
// 1
{ const e=ev('ev_y0_e30'), L=lines(e), T=L.map(l=>l.text), i=T.indexOf('（她掛掉了。）');
  check('1. 電話之後回家跟媽媽說：（臺北的家……記帳。）→「媽。我今天去辦休學了。」→「……想好了？」→「（看了你一下）你從小就想念法律。」→「我想借車。」→「鑰匙在老地方。開慢一點。」',
    i>=0&&T[i+1]==='（臺北的家。媽媽坐在客廳的桌子前記帳。）'&&T[i+2]==='媽。我今天去辦休學了。'&&T.includes('……想好了？')&&T.includes('（看了你一下）你從小就想念法律。')&&T.includes('我想借車。')&&T[T.length-1]==='鑰匙在老地方。開慢一點。', JSON.stringify(T.slice(i)));
  check('1. 媽媽那段在客廳（home_living），說話的人是「媽媽」', e.dialogue.some(l=>l.bg==='home_living')&&L.filter(l=>l.speaker==='媽媽').length===3);
  const ex=t=>(L.find(l=>l.text===t)||{}).expression;
  check('1. 電話裡可昕的表情（AA_308 第 9 節）', ex('……蛤？')==='surprised'&&ex('今天？快期中考了耶。')==='surprised'&&ex('你現在在哪。')==='serious'&&ex('你現在回來學校找我。我還有一堂，五點下課。社科院門口。')==='serious'&&ex('休學又不是不能進校門。')==='annoyed'); }
// 2、3
{ const e=ev('ev_y0_e26'), T=lines(e).map(l=>l.text);
  check('2. 車上那場第一句「（你拿了車鑰匙出門。）」', T[0]==='（你拿了車鑰匙出門。）'&&!T.includes('（你到家，拿了家裡的車鑰匙。）'), T[0]);
  const st=ECONFF.STEPS.find(s=>s.ev==='ev_y0_e26'), meet=17+40/60, arrive=Math.max(st.h+1.5,meet);
  check('3. 快轉 16:10 出發 → 17:40 到社科院門口（原本 19:10）', Math.abs(st.h-(16+10/60))<1e-6&&Math.abs(arrive-meet)<1e-6, 'step '+st.h.toFixed(2)+' arrive '+arrive.toFixed(2));
  const end=meet+(e.hours||0); check('3. 回到宿舍照舊快十一點（22:40～23:00）', end>=22+40/60&&end<=23, end.toFixed(2)); }
// 4
for(const id of ['ev_y0_e26','ev_y0_e37','ev_nye_river','ev_kx_nye_river_y2','ev_kx_nye_river_y3','ev_kx_nye_river_y4']) check('4. '+id+' 結尾她不在（kxAway）', ev(id)&&ev(id).kxAway===true);
{ const src=fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8');
  check('4. outings3d.js：kxHere 看 kxAway，沒回的訊息那句、閒聊階梯、畫面都只在她在場時', /const kxHere=\(ev\.participants\|\|\[\]\)\.includes\('kexin'\)&&!ev\.kxAway;/.test(src)&&/const kxTail=kxHere&&/.test(src)&&/if\(kxHere&&typeof STORY!=='undefined'&&STORY\.neededMiss\)/.test(src)&&/if\(kxHere&&typeof STORY!=='undefined'&&STORY\.ladNext\)/.test(src)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

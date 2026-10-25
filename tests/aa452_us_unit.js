// AA_452（企劃線 8d9910961，AA-B 2026-10-25 03:0x；讀 BB-B 美國交換逐日劇本（挽回中）fc1642184）——不需要瀏覽器。台詞逐字對 AA_452。
//   1-1 12/2 挽回中的初雪排進行程（19:45 問「出發」；不去了＝沒演；舊存檔照舊自動到場）　1-2 何俊朗群組第二句換字
//   1-3 9/13 鍋子　1-4 感恩節湖邊開頭一句旁白　1-5 機場媽媽在揮手　1-6 10/4 回公寓換句　1-7 挽回中返台字卡「舊金山轉機」
// 修改前（開發分支 b00b922fc）：每一節至少一項 FAIL。用法：node tests/aa452_us_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const H=require('./pg_harness.js');
const ROOT=H.ROOT, {check,GM,E}=H, J=JSON.stringify, S5='heroine_05';
global.Z3={ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y3B|R2Y3B_EVENTS|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|US208|ROM|PORTRAIT_ONLY)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const loadErr=[];
for(const f of ['src/exchange3d.js','src/data/us_layouts.js','src/us3d.js','src/y34b3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js','src/us208_3d.js','src/data/us_blank_lines.js','src/us_blank3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
let doc=''; try{ doc=cp.execSync('git show 8d9910961:"docs/story_planning/AA_452_美國交換讀後_挽回中.md"',{cwd:ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const inDoc=t=>doc.indexOf(t)>=0;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
GM.caption=()=>{}; GM.toast=()=>{}; GM.studySession=async()=>{};
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},seat:(o&&o.seat)||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; return n; }; GM.removeNPC=id=>{ delete GM.npc[id]; };
const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},f||{});
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'us_apartment',US(flags)); G.contacts=G.contacts||{}; G.msgs=G.msgs||[]; G.visited=G.visited||{}; G.vac=G.vac||{reg:{}}; ROM.rec(G); E.player.busy=false; E.paused=false;
  SOCIAL.remember(S5,'FIRST_MET',''); PHONE.join(G,'us_exchange','交換生'); return G; };
const dateSis=()=>{ const G=H.G; G.flags.dating_heroine_05=true; G.flags.CALLED_SHUYU=true; const r=ROM.get(G,S5); r.status='dating'; };
const at=(key,h)=>{ const G=H.G; G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const th=t=>(H.G.msgs||[]).filter(m=>m.th===t);
const fm=m=>(m.from||'')+'|'+(m.name||'')+'|'+m.text;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const said=()=>H.said.map(s=>s.t);
const play=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id),{noTitle:true}); return said(); };
const settle=async()=>{ for(let i=0;i<50&&US_BLANK.isBusy&&US_BLANK.isBusy();i++) await new Promise(r=>setTimeout(r,0)); };
const LG='npc_long|何俊朗|', ISA='us_isa|國際學生會|';


const SNOW0='（下雪了。學姊坐在小教堂前面的台階上，沒有撐傘。）';
const done=id=>!!(H.G.events&&H.G.events.done&&H.G.events.done[id]);
const waitFor=async f=>{ for(let i=0;i<400&&!f();i++) await new Promise(r=>setTimeout(r,0)); return f(); };
(async()=>{
await sec(0,()=>{
  check('0. 美國篇的檔案都載得到',!loadErr.length,loadErr.join('；'));
  check('0. 讀稿（企劃線 8d9910961 AA_452）',doc.length>2000&&inDoc('### 1-1.')&&inDoc('### 1-7.')); });

/* ======================= 1-1、1-2 12/2 挽回中的初雪 ======================= */
await sec('1-1',async()=>{
  check('1-2. 稿裡有「上次那種落地就化了。這次會積起來。」',inDoc('上次那種落地就化了。這次會積起來。'));
  let G=fresh('2028-12-02',17.5,'us_apartment',{US1:'alone',US2:'repair'}); at('2028-12-02',18.05); rules();
  const m=byTag('us_snow_msg').map(fm), q=OUT.get(G,'us_snow_r');
  check('1-2. 18:00 交換生群組何俊朗：「今晚會積雪。」「上次那種落地就化了。這次會積起來。」（沒有「不是上次那種」）',J(m)===J([LG+'今晚會積雪。',LG+'上次那種落地就化了。這次會積起來。']),J(m));
  check('1-1. 挽回中也排進行程：初雪（小教堂前的台階）20:00、到 23:00 都能去',!!q&&q.state==='planned'&&q.ev==='ev_us_snow_repair'&&q.h===20&&q.late===3&&q.place==='小教堂前的台階',J(q));
  const why=await USL.jump(GM,T(D('2028-12-03'),9)), stop=CALENDAR.dateOf(G.day).key+' '+G.hour, due=OUT.due(G);
  check('1-1. 快轉「到下一個有事的日子」：停在 12/2 19:45（出發前），問「出發：初雪」',why==='out'&&stop==='2028-12-02 19.75'&&!!due&&due.id==='us_snow_r',J({why,stop,due:due&&due.id}));
  H.said=[]; H.opts=[]; H.picks=[0,0,0]; const r=await OUT.prompt(GM,due);
  check('1-1. 選「出發：初雪」＝演 ev_us_snow_repair（下雪了，學姊坐在台階上）',r==='go'&&said().indexOf(SNOW0)>=0&&done('ev_us_snow_repair'),J({r,o:H.opts[0],s:said().slice(0,3)}));
  G=fresh('2028-12-02',17.5,'us_apartment',{US1:'alone',US2:'repair'}); at('2028-12-02',18.05); rules(); at('2028-12-02',19.8); H.said=[]; H.picks=[2]; const r2=await OUT.prompt(GM,OUT.due(G));
  at('2028-12-02',20.5); R2Y4A.tick(GM,0.5); await waitFor(()=>false||said().indexOf(SNOW0)>=0);
  check('1-1. 「不去了」＝沒演（20:30 人在公寓也不再自動到場）',r2==='no'&&said().indexOf(SNOW0)<0&&!done('ev_us_snow_repair')&&OUT.get(G,'us_snow_r').state==='missed',J({r2,s:said()}));
  G=fresh('2028-12-02',18.1,'us_apartment',{US1:'alone',US2:'repair',US_SNOW_MODE:'repair'}); PHONE.at(G,D('2028-12-02'),18,[{th:'g:us_exchange',from:'npc_long',name:'何俊朗',text:'今晚會積雪。'}],'us_snow_msg'); PHONE.tick(G);
  at('2028-12-02',20.1); rules(); H.said=[]; H.picks=[0,0,0]; R2Y4A.tick(GM,0.5); await waitFor(()=>done('ev_us_snow_repair'));
  check('1-1. 舊存檔（18:00 的訊息已經傳了、沒有行程）：20:00 以後照舊自動到場',done('ev_us_snow_repair')&&said().indexOf(SNOW0)>=0,J(said().slice(0,2))); });

/* ======================= 1-3～1-6 台詞 ======================= */
await sec('1-3',async()=>{ const A='（你去 C 棟還上個禮拜跟她室友借的鍋子。廚房朝客廳的窗口開著，她站在爐子前面，水還沒滾。你把鍋子放在窗口的吧台上。）';
  check('1-3. 稿裡有',inDoc(A.slice(1,-1)));
  fresh('2028-09-13',18.5,'us_shared',{US1:'alone'}); const L=await play('ev_us2_repair',[0]);
  check('1-3. 9/13 退回的報告：第一句交代鍋子',L[0]===A,J(L.slice(0,2))); });
await sec('1-4',async()=>{ const A='（湖邊。何俊朗和其他人走在前面。她放慢腳步，走到你旁邊。）', B='（湖邊。大家走在前面。她放慢腳步，走到你旁邊。）';
  check('1-4. 稿裡有兩句',inDoc(A.slice(1,-1))&&inDoc(B.slice(1,-1)));
  fresh('2028-11-23',10,'us_outside',{US1:'alone',US2:'repair',MET_LONG:true}); let L=await play('ev_us3_lake',[0,0,0]); const i=L.indexOf('分手那天，你沒有解釋。');
  check('1-4. 感恩節湖邊（挽回中、見過何俊朗）：「分手那天」前面一句旁白',i>0&&L[i-1]===A,J(L.slice(0,4)));
  fresh('2028-11-23',10,'us_outside',{US1:'alone',US2:'repair'}); L=await play('ev_us3_lake',[0,0,0]); const k=L.indexOf('分手那天，你沒有解釋。');
  check('1-4. 沒見過何俊朗：「（湖邊。大家走在前面。……）」',k>0&&L[k-1]===B,J(L.slice(0,4))); });
await sec('1-5',async()=>{ fresh('2028-12-23',5.7,'airport_arr',{US1:'alone',US2:'repair',US_TRIP_MODE:'bloom',US_TRIP_DONE:true}); const L=await play('ev_us_return');
  check('1-5. 12/23 機場（沒有交往）：「她先走了」之後「（出口，媽媽在揮手。）」',L.slice(-2)[1]==='（出口，媽媽在揮手。）'&&L.slice(-2)[0].indexOf('你看見她先走了')>=0&&inDoc('出口，媽媽在揮手。'),J(L)); });
await sec('1-6',async()=>{ const A='（回到公寓，你在筆記本最後一頁寫了「誰都」和「誰也」。看了很久，還是聽不出來。）';
  fresh('2028-10-04',22,'us_apartment',{MET_LONG:true}); const L=await play('ev_usl_long4');
  check('1-6. 10/4 回公寓：換成「誰都」「誰也」那一句（「……條文也是。」只留在 10/25 中餐館）',J(L)===J([A])&&inDoc(A.slice(1,-1)),J(L)); });

/* ======================= 1-7 返台字卡 ======================= */
await sec('1-7',async()=>{ const cards=[]; const tc=GM.titleCard; GM.titleCard=async(a,b)=>{ cards.push(a+'｜'+b); };
  const land=EXCH.onLand; EXCH.onLand=async()=>{};
  try{ for(const mode of ['bloom','sf']){ fresh('2028-12-21',23.95,'us_outside',{US1:'alone',US2:'repair',US_TRIP_MODE:mode,US_TRIP_DONE:true}); await EXCH.returnHome(GM,{force:true}); } }
  finally{ GM.titleCard=tc; EXCH.onLand=land; }
  check('1-7. 返台字卡：挽回中（布魯明頓）「舊金山轉機」、交往中（舊金山那一週）照舊「舊金山起飛」',cards.indexOf('飛回臺灣｜舊金山轉機　約 14 小時')>=0&&cards.indexOf('飛回臺灣｜舊金山起飛　約 14 小時')>=0,J(cards)); });

H.done();
})();

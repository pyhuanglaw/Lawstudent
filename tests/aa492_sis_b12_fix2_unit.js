// AA_492 學姊第十二批實作以後的三件（SIS-B12-FIX-1027 第二輪；AA 分支 2a5b78ee3，AA-C 2026-10-27 22:35）——不需要瀏覽器。
//   0  讀稿 AA_492（2a5b78ee3）：「我在{國}。」、Kevin、學姊兩句、行程取消的系統提示、約會補演的兩版（旁白、書瑀）都和稿一樣
//   1  12-6b 7/13 那天寒暑假出國中（AA_492 第 1 節）：給一個替代選項「我在{國}。」（{國}＝那一趟「飛往〇〇」去掉「飛往」：C10 加州＝美國、C08 首爾＝韓國、
//        手機自己排的出國旅遊 T13 泰國＝泰國）；回了 → Kevin「對齁 學弟在{國}」、學姊「題目傳給你。」；不排、不記 missed；
//        T13 那一趟取消了＝人在臺灣（照舊「我去。」／「這週不行。」）；沒認識她照舊沒有選項；日本路線照舊「我在日本。」；沒出國照舊兩個選項
//   2  取消的提示（AA_492 第 1 節）：已經排好 7/13、後來才出國而取消的，取消那一刻手機系統提示「行程取消：法圖・討論室（讀書會最後一次）。那天你在國外。」一則（不重複）；
//        回了「我去。」還沒排、就排了出國旅遊的也提示；沒回、回「這週不行。」、出國中回「我在{國}。」的不提示
//   3  12-7 考研究所的玩家（R3.gradExam）不問選項一（AA_492 第 2 節）：「{稱呼}。坐。」之後直接「她把自己的計畫本翻開」、選項二、「另外一本」、結尾照舊；
//        不考研究所（Y4_PATH 不是 grad、推甄上了）照舊問；12-7 演了「另外一本」記 SIS_BOOK_BACK（both、沒選書的不記）
//   4  朋友版「另外一本」之後才交往的（AA_492 第 3 節）：交往中、SIS_BOOK law／novel、聽的是朋友版、兩版都沒演過的，她回臺灣以後、畢業典禮以前，
//        下一次和她正式約會的結尾（DATE.settle：一般、快速約會；DATE.settleOvernight：兩天一夜）演一次——旁白（不寫名字）＋說話人「書瑀」；演完記 SIS_BOOK_BACK、不再演；
//        沒交往、前任、交往版（SIS_BOOK_WITH_YOU）、both、12-7 演過、記過 SIS_BOOK_BACK、她回來以前、畢業典禮那天以後、和別人約會：不演；
//        舊存檔（沒有 SIS_BOOK_WITH_YOU）：選書那天以後才交往＝朋友版（演），選書那天已經在交往＝交往版（不演）
// 修改前（開發分支 de75d3106）：1、2、3、4 各至少一項 FAIL（0 也有：遊戲裡還沒有這幾句）。用法：node tests/aa492_sis_b12_fix2_unit.js
// 2026-10-28 AA_523 第 6-12 點改的（企劃線 0d7b5388b，SIS-B16-1028）：12-7 選項二的第三個「美國好玩嗎？」換成「回來以後，習慣嗎？」——第 3 項的選項二照新的寫（新句子在 tests/aa523_sis_b16_unit.js、tests/aa470_sis_b12_unit.js 對 AA_523 的稿）
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, ID='heroine_05', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/group3d.js','src/y34b3d.js','src/sis_grad3d.js','src/r3_3d.js',
  'src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js','src/data/sis_jp_events.js','src/sis_jp3d.js','src/data/sis_b8_events.js','src/sis_b8_3d.js',
  'src/data/sis_b9_events.js','src/sis_b9_3d.js','src/data/sis_b10_events.js','src/sis_b10_3d.js','src/family_xmas3d.js','src/data/sis_b11_events.js','src/sis_b11_3d.js',
  'src/data/sis_b12_events.js','src/sis_b12_3d.js']) L3(f);   /* index.html 的順序（同 tests/aa490_sis_b12_fix_unit.js；多 r3_3d.js：12-7 的 R3.gradExam）*/
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{};
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const LN=()=>typeof SISB12_LINES!=='undefined'?SISB12_LINES:{};
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag), TH=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const fresh=(key,h,kind,flags,o)=>{ o=o||{}; const met=kind!=='none';
  const G=H.fresh(key,h,o.zone||'dorm',Object.assign({EXCHANGE_ROUTE:o.route||'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true},met?{met_sis:true,SIS_W1:true}:{},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; PHONE.rec(G); if(o.grp!==false) PHONE.join(G,'family_law','法律系直屬家族');
  if(kind==='fam') H.FAMILIAR(ID); else if(kind==='friend') H.FRIEND(ID); else if(kind==='dating'){ H.FRIEND(ID); H.date(ID); } else if(kind==='ex'){ H.FRIEND(ID); H.date(ID); ROM.end(G,ID,'test'); }
  H.at(key,h); E.player.busy=false; E.paused=false; return G; };   /* 同 tests/aa490_sis_b12_fix_unit.js */
const at=(key,h)=>{ H.at(typeof key==='number'?keyOf(key):key,h); };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const reg=(key,v)=>{ VAC.rec(H.G).reg[key]=v||'yes'; };
const runEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(STORY_EVENTS.find(e=>e.id===id)); };
/* 手機自己排的出國旅遊（vac3d.js S.plan13 記的那一筆＋OUT 的出遊）*/
const t13=(dest,from,to,state)=>{ const V=VAC.rec(H.G), L=V.t13||(V.t13=[]), n=L.length+1; L.push({n,dest,from:D(from),to:D(to),with:null,gf:false,season:'summer'});
  OUT.plan(H.G,{id:'vac_t13_'+n,ev:'ev_vac_key',day:D(from),h:8,late:0.5,place:'x',title:'出國旅遊',travel:'去機場 約 1 小時',travelH:1,back:'回到臺北。',vac:{key:'T13#'+n,k:'trip'}});
  if(state){ const q=OUT.get(H.G,'vac_t13_'+n); if(q) q.state=state; } return n; };

(async()=>{
check('0. 檔案都載得到',!loadErr.length,J(loadErr));
let doc=''; try{ doc=cp.execSync('git show 2a5b78ee3:"docs/story_planning/AA_492_回LAWWW_學姊第十二批實作後_出國中的讀書會_讀書計畫問兩次_另外一本.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
check('0. 讀得到 AA_492（AA 分支 2a5b78ee3）',doc.length>500,'沒有 2a5b78ee3：git fetch origin claude/magical-albattani-bk7b4n');
await sec(0,async()=>{ const L=LN(), A=L.lastAway||{}, B=L.bookLate||{};
  const q=s=>doc.indexOf(s)>=0;
  check('0. 「我在{國}。」→ Kevin「對齁 學弟在{國}」→ 學姊「題目傳給你。」照稿',A.t==='我在{國}。'&&J(A.say)===J([['k','對齁 學弟在{國}'],['s','題目傳給你。']])&&q('選項：「我在{國}。」')&&q('Kevin：對齁 學弟在{國}')&&q('學姊：題目傳給你。'),J(A));
  check('0. 行程取消的系統提示照稿',L.lastCancel==='行程取消：法圖・討論室（讀書會最後一次）。那天你在國外。'&&q('> '+L.lastCancel),L.lastCancel);
  const both=[['law','（她的包包裡露出那本小說。書籤還在快一半的地方。）','回來以後開始看。……還沒看完。'],['novel','（她的包包裡是那本舊的刑訴，書背的膠帶換了新的。）','回來第一個禮拜翻完了。問號少了一點。']];
  check('0. 約會補演兩版（旁白、書瑀）照稿',both.every(([k,n,s])=>J(B[k])===J([n,s])&&q('旁白：'+n)&&q('書瑀：'+s)),J(B)); });

/* ---- 1 12-6b 出國中的替代選項 ---- */
await sec(1,async()=>{ const a=D('2028-07-10'), d=D('2028-07-13');
  const opts=()=>{ const m=byTag('sisb12_last_ask').find(x=>x.ask); return m?m.ask.opts.map(o=>o.t):null; };
  const APP={C08:{VAC_C08_APP:true}};   /* C08 要寫過申請資料才錄取（同 aa490 第 6 節）*/
  const pass=()=>{ at(d,19.9); for(const x of OUT.expire(H.G)) OUT.onMissed(GM,x); at(d+1,9); ph(); };
  const bad=[];
  for(const [n,setup,want] of [['C10 加州',()=>reg('C10@Y3'),'美國'],['C08 首爾',()=>reg('C08@Y3'),'韓國'],['T13 泰國 7/12～7/15',()=>t13('th','2028-07-12','2028-07-15'),'泰國']]){
    fresh('2028-07-10',20,'friend',APP[n.slice(0,3)]||{}); setup(); at(a,21); ph(); const o=opts();
    if(J(o)!==J(['我在'+want+'。'])){ bad.push(n+'：選項 '+J(o)); continue; }
    PHONE.answer(H.G,'sisb12_last_ask',0); const G1=TH('g:family_law').slice(-3).map(m=>[m.from,m.text]); ph();
    if(J(G1)!==J([['player','我在'+want+'。'],['kevin','對齁 學弟在'+want],[ID,'題目傳給你。']])) bad.push(n+'：回覆 '+J(G1));
    if(OUT.get(H.G,'sisb12_famstudy_last')) bad.push(n+'：排了出遊'); if(H.G.flags.SIS_FAMSTUDY_LAST_GO!=null) bad.push(n+'：記了 GO');
    pass(); if(H.G.flags.SIS_FAM_STUDY_LAST!=null) bad.push(n+'：記了 '+H.G.flags.SIS_FAM_STUDY_LAST); if(byTag('sisb12_last_cancel').length) bad.push(n+'：多了取消提示'); }
  check('1. 7/13 出國中（C10 加州、C08 首爾、手機排的泰國）：「我在美國。」／「我在韓國。」／「我在泰國。」→ Kevin「對齁 學弟在〇〇」、學姊「題目傳給你。」；不排、不記 missed、沒有取消提示',!bad.length,J(bad));
  fresh('2028-07-10',20,'friend'); t13('th','2028-07-12','2028-07-15','cancelled'); at(a,21); ph(); const o1=opts();
  fresh('2028-07-10',20,'friend'); t13('vn','2028-07-14','2028-07-17'); at(a,21); ph(); const o2=opts();
  check('1. 出國旅遊取消了、7/14 才出發：人在臺灣，照舊「我去。」／「這週不行。」',J(o1)===J(['我去。','這週不行。'])&&J(o2)===J(['我去。','這週不行。']),J({o1,o2}));
  fresh('2028-07-10',20,'none'); reg('C10@Y3'); at(a,21); ph();
  check('1. 沒認識她（出國中）：三則照收、沒有選項',byTag('sisb12_last_ask').length===3&&!byTag('sisb12_last_ask').some(x=>x.ask));
  fresh('2028-07-10',20,'friend',{},{route:'JP'}); H.G.flags.JP_DEPARTED=D('2028-03-25'); reg('C10@Y3'); at(a,22.5); ph();
  check('1. 日本路線照舊「我在日本。」',J(opts())===J(['我在日本。']),J(opts()));
  fresh('2028-07-10',20,'friend'); at(a,21); ph();
  check('1. 沒出國：照舊「我去。」／「這週不行。」',J(opts())===J(['我去。','這週不行。']),J(opts()));
  check('1. VAC.abroadDest：C10＝美國、T13 越南＝越南、不在國外＝null',(()=>{ fresh('2028-07-10',20,'friend'); reg('C10@Y3'); const x=VAC.abroadDest(H.G,d); fresh('2028-07-10',20,'friend'); t13('vn','2028-07-12','2028-07-15'); const y=VAC.abroadDest(H.G,d), z=VAC.abroadDest(H.G,D('2028-07-20')); return x==='美國'&&y==='越南'&&z===null; })()); });

/* ---- 2 取消的提示 ---- */
await sec(2,async()=>{ const a=D('2028-07-10'), d=D('2028-07-13'), CAN='行程取消：法圖・討論室（讀書會最後一次）。那天你在國外。';
  const sys=()=>TH('sys').filter(m=>m.text===CAN);
  fresh('2028-07-10',20,'friend'); at(a,21); ph(); PHONE.answer(H.G,'sisb12_last_ask',0); ph(); const s0=(OUT.get(H.G,'sisb12_famstudy_last')||{}).state;
  at(a+1,10); t13('th','2028-07-12','2028-07-15'); ph(); const s1=(OUT.get(H.G,'sisb12_famstudy_last')||{}).state, n1=sys().length; at(a+1,15); ph(); at(a+2,9); ph();
  check('2. 已經排好 7/13、後來排了出國旅遊：取消（cancelled）那一刻系統提示一則（不重複）',s0==='planned'&&s1==='cancelled'&&n1===1&&sys().length===1&&byTag('sisb12_last_cancel').length===1,J({s0,s1,n1,n:sys().length}));
  fresh('2028-07-10',20,'friend'); at(a,21); ph(); PHONE.answer(H.G,'sisb12_last_ask',0); ph(); reg('C10@Y3'); at(a+1,9); ph();
  check('2. 舊存檔（排好以後才報出國活動）：一樣提示',sys().length===1&&(OUT.get(H.G,'sisb12_famstudy_last')||{}).state==='cancelled');
  fresh('2028-07-10',20,'friend'); at(a,21); ph(); t13('th','2028-07-12','2028-07-15'); PHONE.answer(H.G,'sisb12_last_ask',0); ph();
  check('2. 回「我去。」（還沒排）以後才排出國旅遊：不排、提示一則',!OUT.get(H.G,'sisb12_famstudy_last')&&sys().length===1,J(OUT.rec(H.G).map(q=>q.id)));
  const none=[]; for(const [n,f] of [['沒回',()=>{}],['回「這週不行。」',()=>PHONE.answer(H.G,'sisb12_last_ask',1)]]){ fresh('2028-07-10',20,'friend'); at(a,21); ph(); f(); ph(); t13('th','2028-07-12','2028-07-15'); at(a+1,9); ph(); if(sys().length) none.push(n); }
  fresh('2028-07-10',20,'friend'); reg('C10@Y3'); at(a,21); ph(); PHONE.answer(H.G,'sisb12_last_ask',0); ph(); at(d,20); ph(); if(sys().length) none.push('出國中回「我在美國。」');
  check('2. 沒回、回「這週不行。」、出國中回「我在〇〇。」：沒有取消提示',!none.length,J(none));
  check('2. 提示在「通知」那一串（th sys），選的是系統提示不是誰的訊息',(()=>{ fresh('2028-07-10',20,'friend'); at(a,21); ph(); PHONE.answer(H.G,'sisb12_last_ask',0); ph(); reg('C10@Y3'); ph(); const m=sys()[0]; return !!m&&!m.from&&!m.ask; })()); });

/* ---- 3 12-7 考研究所的玩家不問選項一 ---- */
await sec(3,async()=>{ const Q1=['十月那份讀書計畫。後來照著做了多少？','寒假你怎麼排的？'], OPEN='（她把自己的計畫本翻開，推到你面前。一月那一頁，大部分格子是空的。）';
  const run=async(flags,picks)=>{ fresh('2029-01-08',19.5,'friend',Object.assign({SIS_PLAN_POSTED:true},flags),{zone:'cafe'}); await runEv('ev_sis_blank_jan',picks||[]); return {L:H.said.map(x=>x.t),O:H.opts.slice()}; };
  const g=await run({Y4_PATH:'grad'});
  const i0=g.L.findIndex(t=>/。坐。$/.test(t)), i1=g.L.indexOf(OPEN);
  check('3. 前提：R3.gradExam（臺灣路線、Y4_PATH grad、推甄沒上）＝考研究所',typeof R3!=='undefined'&&R3.gradExam(H.G)===true);
  check('3. 考研究所的玩家：「{稱呼}。坐。」之後直接「她把自己的計畫本翻開」，沒有「十月那份讀書計畫」「寒假你怎麼排的？」、沒有選項一',i0>=0&&i1===i0+1&&!Q1.some(q=>g.L.includes(q))&&!g.O.some(o=>o.some(t=>/大概一半/.test(t)))&&J(g.O[0])===J(['「空著不好嗎？」','「我幫妳寫一格？」','「回來以後，習慣嗎？」']),J({L:g.L.slice(0,4),O:g.O}));
  check('3. 考研究所的玩家：選項二以後、結尾照舊（「下學期要的書…」、記憶 SIS_BLANK_JAN）',g.L.includes('下學期要的書，開學以前跟我說。法圖寒假開得很短。')&&SOCIAL.has(ID,'SIS_BLANK_JAN'));
  const cases=[['Y4_PATH 不是 grad',{Y4_PATH:'job'}],['推甄上了',{Y4_PATH:'grad',Y4_PUSH:'pass'}],['沒有 Y4_PATH',{}]], bad=[];
  for(const [n,f] of cases){ const r=await run(f); if(!r.L.includes(Q1[0])||J(r.O[0])!==J(['「大概一半。」','「每一天都照做。」','「沒照做。」'])) bad.push(n+'：'+J(r.O[0])); }
  check('3. 不考研究所（Y4_PATH 不是 grad、推甄上了、沒選）：照舊問「十月那份讀書計畫…」、選項一',!bad.length,J(bad));
  const bk=[]; for(const [k,want] of [['law',true],['novel',true],['both',undefined],[undefined,undefined]]){ const r=await run(k?{SIS_BOOK:k}:{}); if(H.G.flags.SIS_BOOK_BACK!==want) bk.push(k+'：'+H.G.flags.SIS_BOOK_BACK); }
  check('3. 12-7 演了「另外一本」（law、novel）記 SIS_BOOK_BACK；both、沒選書的不記',!bk.length,J(bk)); });

/* ---- 4 朋友版之後才交往的：下一次正式約會的結尾補演 ---- */
await sec(4,async()=>{ const NAR={law:'（她的包包裡露出那本小說。書籤還在快一半的地方。）',novel:'（她的包包裡是那本舊的刑訴，書背的膠帶換了新的。）'}, SAY={law:'回來以後開始看。……還沒看完。',novel:'回來第一個禮拜翻完了。問號少了一點。'};
  let tn=0; const date=async(o)=>{ o=o||{}; const G=H.G, t={trip:'T49'+String(++tn).padStart(3,'0'),who:o.who||ID,locs:['D15'],day:G.day,depart:18,back:22,transport:'car',departed:true,status:'booked',spots:['D15.view']};
    H.said=[]; H.opts=[]; H.picks=[]; if(o.overnight) await DATE.settleOvernight(GM,t,['D15.view'],[{id:'D15.view',name:'夜景'}],1,G.money|0); else await DATE.settle(GM,t,['D15.view'],[{id:'D15.view',name:'夜景'}],1,G.money|0,o.quick?{quick:true}:undefined);
    return H.said.map(x=>[x.who,x.t]); };
  const has=(L,k)=>{ const i=L.findIndex(x=>x[1]===NAR[k]); return i>=0&&L[i][0]===null&&!!L[i+1]&&J(L[i+1])===J(['書瑀',SAY[k]]); };
  const any=L=>L.some(x=>x[1]===NAR.law||x[1]===NAR.novel);
  const setup=(key,book,flags,kind)=>fresh(key,10,kind||'dating',Object.assign({SIS_BOOK:book,SIS_BOOK_WITH_YOU:false},flags||{}));
  for(const k of ['law','novel']){ setup('2029-03-10',k); const L1=await date(), b1=H.G.flags.SIS_BOOK_BACK; const L2=await date();
    check('4. '+k+'：交往中、朋友版、兩版都沒演過：約會結尾演一次（旁白不寫名字＋書瑀「'+SAY[k]+'」）、記 SIS_BOOK_BACK、下一次不再演',has(L1,k)&&b1===true&&!any(L2),J({L1,b1,L2})); }
  { setup('2029-03-10','law'); const L=await date({quick:true}); setup('2029-03-10','novel'); const M=await date({overnight:true});
    check('4. 快速約會、兩天一夜也是正式約會：一樣演一次',has(L,'law')&&has(M,'novel'),J({L,M})); }
  { setup('2029-03-10','law'); const L=await date(), i=L.findIndex(x=>x[1]===NAR.law), j=L.findIndex(x=>/^（今天去了/.test(x[1]));
    check('4. 演在約會的結尾、結算那一句之前',i>=0&&j>i,J(L)); }
  const no=[]; const tryNo=async(n,f)=>{ await f(); const L=await date(); if(any(L)||H.G.flags.SIS_BOOK_BACK) no.push(n); };
  await tryNo('沒交往',()=>setup('2029-03-10','law',{},'friend'));
  await tryNo('前任',()=>setup('2029-03-10','law',{},'ex'));
  await tryNo('交往版（SIS_BOOK_WITH_YOU）',()=>setup('2029-03-10','law',{SIS_BOOK_WITH_YOU:true}));
  await tryNo('both',()=>setup('2029-03-10','both'));
  await tryNo('沒選書',()=>setup('2029-03-10',undefined));
  await tryNo('12-7 演過',()=>{ setup('2029-03-10','law'); H.G.events.done.ev_sis_blank_jan=1; });
  await tryNo('她回來以前（12/22）',()=>setup('2028-12-22','law'));
  await tryNo('畢業典禮那天（6/2）',()=>setup('2029-06-02','law'));
  { setup('2029-03-10','law'); H.G.flags.SIS_BOOK_BACK=true; const L=await date(); if(any(L)) no.push('記過 SIS_BOOK_BACK'); }
  { setup('2029-03-10','law'); H.FRIEND('heroine_01'); const L=await date({who:'heroine_01'}); if(any(L)||H.G.flags.SIS_BOOK_BACK) no.push('和以安約會'); }
  check('4. 沒交往、前任、交往版、both、沒選書、12-7 演過、記過、她回來以前、畢業典禮那天、和別人約會：不演、不記',!no.length,J(no));
  { setup('2028-12-23','novel'); const a=await date(); setup('2029-06-01','law'); const b=await date();
    check('4. 她回臺灣那天（12/23）、畢業典禮前一天（6/1）：演',has(a,'novel')&&has(b,'law'),J({a,b})); }
  /* 舊存檔：沒有 SIS_BOOK_WITH_YOU——選書那天（events.last.ev_sis_which_book）以後才交往＝朋友版 */
  { const w=D('2028-07-20'); setup('2029-03-10','law'); delete H.G.flags.SIS_BOOK_WITH_YOU; H.G.events.last.ev_sis_which_book=w; const R=ROM.get(H.G,ID); R.sinceDay=w+40; const a=await date();
    setup('2029-03-10','law'); delete H.G.flags.SIS_BOOK_WITH_YOU; H.G.events.last.ev_sis_which_book=w; ROM.get(H.G,ID).sinceDay=w-10; const b=await date();
    check('4. 舊存檔：選書那天以後才交往＝朋友版（演）；選書那天已經在交往＝交往版（不演，12/24 那一頓演過）',has(a,'law')&&!any(b),J({a,b})); }
  check('4. 交往中的顯示名字是「書瑀」（social3d.js CALLED_SHUYU）',(()=>{ setup('2029-03-10','law'); return SOCIAL.displayName(ID)==='書瑀'; })()); });

H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

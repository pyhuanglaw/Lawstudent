// AA_490 學姊第十二批的修正（SIS-B12-FIX-1027；企劃線 a4f530c11，AA-C 2026-10-27，依據 BB-C BB_218 最後一節 e936b4624）＋LAWWW-C ②——不需要瀏覽器。
//   0  讀稿 AA_490（a4f530c11）：兩句小字、日本路線 5/29 換的那一句都在稿裡、遊戲裡的字和稿一樣
//   1  12-5 法圖的午休改週五：她的作息不改（兩筆 linze_5f 照舊到 2029-05-31；週一～四中午在霖澤館 5F）；照她「真的在法圖」的時間（STORY.schedEnt）逐日查 2/21～4/30——
//        臺灣、美國路線＝3/3～4/21 八個週五、日本路線＝3/3～3/24 四個週五（12:00～13:59 找她說話先演）；週一～四（就算人在法圖）、窗口外的週五、12 點前、14:00、週六不演；
//        3/3 演完只演一次；4/21（五）美國路線交往中實際演一次
//   2  4-2 交往版「書推過去」：12/24 那一頓約在別家（阿鳳麵店、半熟）也演，一字不改、兩個選項照舊；沒聽過「放你那邊」的照舊沒有
//   3  12-4 9/13 群組「我去。」的小字「那天晚上也是公法讀書會」：大三上（9/9 第 1 週）去過公法讀書會（聽完、中途離開都算）的才有；沒認識她的也一樣；
//        只在以前學期去過、沒去過：沒有；「這週不行。」沒有；回「我去。」照舊排 9/16；手機按鈕畫得出小字（game3d.js askBtns，抽出那一行來跑）
//   4  12-3 1/12 群組「我也在。」的小字「那天晚上有托福班」：報了 C04W 大二寒假班（12/28～1/20 週一、三晚上；1/13 週三有課）才有（yes、done 都算）；
//        沒報、報的是 C04W 別年、C04 暑期班：沒有；托福班白天上課（slot 改 day）、1/13 不是上課日（只上週一）：沒有
//   5  日本路線 2028-05-29：第二句換成「讀書會還在。Kevin 說考完國考才算結束。」，照片那一則照舊；舊句「柏翰在帶」不在遊戲裡
//      （2026-10-30 AA_539 1-5，企劃線 c9f6dd6cb：第二句再換成「讀書會還在。Kevin 說要讀到考前一個月。」——期待值跟著改，見 tests/aa539_sis_reread_unit.js 1-5）
//   6  ② 12-6b 寒暑假出國中（VAC.abroadOn：C10 加州 6/21～7/31、C08 首爾 7/13 出發）：7/10 群組三則照收、沒有「我去。」（AA_492 第 1 節起改成「我在〇〇。」，見 tests/aa492_sis_b12_fix2_unit.js）、不排、不記 missed；
//        曼谷 7/3～7/7 回來了、沒報出國：照舊有「我去。」／「這週不行。」、回了照排；
//        舊存檔（改之前已經收到有選項的那一則）：出國中回「我去。」不排；已經排好的取消（cancelled，同 VAC.drop），過了時間也不變 missed
// 修改前（int-usapt-1027 b49841b83）：1、2、3、4、5、6 各至少一項 FAIL（0 也有：遊戲裡還沒有兩句小字、5/29 還是舊句）。用法：node tests/aa490_sis_b12_fix_unit.js
// 2026-10-28 AA_518 第 1-9 改的（企劃線 973dd1b74，SIS-B15-1028）：2028-06-28 那一晚清研究室多一筆 linze_5f（note 開頭 AA_518）——第 1 節「不改的兩筆」不算它。
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, ID='heroine_05', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/group3d.js','src/y34b3d.js','src/sis_grad3d.js',
  'src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js','src/data/sis_jp_events.js','src/sis_jp3d.js','src/data/sis_b8_events.js','src/sis_b8_3d.js',
  'src/data/sis_b9_events.js','src/sis_b9_3d.js','src/data/sis_b10_events.js','src/sis_b10_3d.js','src/family_xmas3d.js','src/data/sis_b11_events.js','src/sis_b11_3d.js',
  'src/data/sis_b12_events.js','src/sis_b12_3d.js']) L3(f);   /* index.html 的順序（同 tests/aa470_sis_b12_unit.js）*/
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{};
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const X=()=>typeof SISB12!=='undefined'?SISB12:null, LN=()=>typeof SISB12_LINES!=='undefined'?SISB12_LINES:{};
const said=()=>H.said.map(x=>x.t), has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag), TH=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const evDone=id=>!!(H.G.events&&H.G.events.done&&H.G.events.done[id]);
const relNow=()=>Object.assign({},SOCIAL.rel(ID)), dRel=(a,b)=>({fam:b.fam-a.fam,trust:b.trust-a.trust,comf:b.comf-a.comf});
/* 存檔：kind＝'none'（沒認識）／'fam'（熟悉）／'friend'（朋友）／'dating'（交往中）／'ex'（前任）——同 tests/aa470_sis_b12_unit.js */
const fresh=(key,h,kind,flags,o)=>{ o=o||{}; const met=kind!=='none';
  const G=H.fresh(key,h,o.zone||'dorm',Object.assign({EXCHANGE_ROUTE:o.route||'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true},met?{met_sis:true,SIS_W1:true}:{},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; PHONE.rec(G); if(o.grp!==false) PHONE.join(G,'family_law','法律系直屬家族');
  if(kind==='fam') H.FAMILIAR(ID); else if(kind==='friend') H.FRIEND(ID); else if(kind==='dating'){ H.FRIEND(ID); H.date(ID); } else if(kind==='ex'){ H.FRIEND(ID); H.date(ID); ROM.end(G,ID,'test'); }
  H.at(key,h); E.player.busy=false; E.paused=false; return G; };
const at=(key,h)=>{ H.at(typeof key==='number'?keyOf(key):key,h); };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const talk=async(zone,picks)=>{ H.G.zone=zone; H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); return SISY23.preTalk(GM); };   /* 找她說話：talkSis 在說話前問 SISY23.preTalk */
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const reg=(key,v)=>{ VAC.rec(H.G).reg[key]=v||'yes'; };   /* 寒暑假活動報名（G.vac.reg：'C04W@Y2'＝'yes' 報了／'done' 去過）*/
const plg=(key,end)=>{ H.G.acts.att['public_law_group@'+D(key)]={h:20,end:end||'full'}; };   /* 公法讀書會的到場紀錄（ACTIVITIES.markAttended 的格式；end 'left'＝中途離開）*/
const escH=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);   /* 同 game3d.js */
/* 手機的按鈕：抽 game3d.js 的 askBtns 那一行出來跑（game3d.js 整支要瀏覽器）*/
const g3src=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'), g3m=g3src.match(/^\s*const askBtns=(m=>.*?\+'<\/div>');/m);   /* 到 .join('')+'</div>'; 為止（後面可以有註解）*/
const askBtns=m=>{ if(!g3m) return ''; return new Function('escH','G','PHONE','return ('+g3m[1]+')')(escH,H.G,PHONE)(m); };

(async()=>{
let doc=''; try{ doc=cp.execSync('git show a4f530c11:"docs/story_planning/AA_490_回LAWWW_學姊第十二批三件_法圖午休改週五_書推過去_讀書會撞期.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const JP0529=['（照片：法圖討論室的白板，寫滿了字）','讀書會還在。Kevin 說要讀到考前一個月。'];   /* 2026-10-30 AA_539 1-5（企劃線 c9f6dd6cb）再換第二句：讀書會最後一次 7/13、國考 8/26（AA_490 的「Kevin 說考完國考才算結束。」對不上）*/

/* ---- 0 讀稿 ---- */
await sec(0,()=>{
  check('0. 讀得到稿（AA_490 a4f530c11）、檔都載得到',!!doc&&doc.indexOf('## 5. 給 LAWWW')>0&&!loadErr.length&&!!X(),J(loadErr));
  check('0. 稿裡的兩句小字：「那天晚上也是公法讀書會」「那天晚上有托福班」；遊戲裡（SISB12_LINES）一字不差',doc.includes('加小字：「那天晚上也是公法讀書會」')&&doc.includes('加小字「那天晚上有托福班」')&&LN().studyHint==='那天晚上也是公法讀書會'&&LN().hotHint==='那天晚上有托福班',J({studyHint:LN().studyHint,hotHint:LN().hotHint}));
  const m=(typeof SISJP_LINES!=='undefined'&&SISJP_LINES.msgs||[]).find(x=>x.day==='2028-05-29');
  check('0. 日本路線 5/29：稿 AA_490「學姊：讀書會還在。Kevin 說考完國考才算結束。」（AA_539 1-5 再換成「讀書會還在。Kevin 說要讀到考前一個月。」）＝遊戲第二句；照片那一則照舊',doc.includes('> 學姊：讀書會還在。Kevin 說考完國考才算結束。')&&!!m&&J(m.L)===J(JP0529),J(m)); });

/* ---- 1 12-5 法圖的午休：週五 ---- */
await sec(1,async()=>{ const c=CHARACTERS[ID], L5=(c.daily_schedule||[]).filter(e=>e.zone==='linze_5f'&&!/^AA_51[28]/.test(e.note||''));   /* 2026-10-28 AA_518 1-9（企劃線 973dd1b74）：2028-06-28 那一晚清研究室的一筆也不算（tests/aa518_sis_b15_unit.js）*/   /* 2026-10-28 AA_512（企劃線 c444f0757）另外加的兩筆 linze_5f（13-3 兩天傍晚、交往中週一三晚上）不算在「不改」的這兩筆裡（tests/aa512_sis_b13_unit.js）*/
  check('1. 她的作息不改：兩筆 linze_5f（週一～週四）結束日照舊 2029-05-31',L5.length===2&&L5.every(e=>J(e.days)===J([1,2,3,4])&&Array.isArray(e.dates)&&e.dates.length===1&&e.dates[0][1]==='2029-05-31'),J(L5.map(e=>[e.from,e.to,e.dates])));
  const where=(key,h)=>{ fresh(key,h,'fam'); const e=STORY.schedEnt(c,H.G); return e?e.zone:null; };
  const wk=['2028-03-06','2028-03-07','2028-03-08','2028-03-09','2028-04-17','2028-04-20'].map(k=>where(k,12.5)), fr=['2028-03-03','2028-03-31','2028-04-21'].map(k=>where(k,12));
  check('1. 週一～週四中午她在霖澤館 5F 研究室；週五 12:00 在法圖',wk.every(z=>z==='linze_5f')&&fr.every(z=>z==='lawlib'),J({wk,fr}));
  /* 照她真的在法圖的時間（BB：單元測試直接設 zone 呼叫 preTalk 測不到）：2/21～4/30 每天 12:00～13:59 五個時間，她在法圖、玩家也在法圖、說話先演的日子 */
  const ROUTES=['TW','US','JP'], got={TW:[],US:[],JP:[]};
  for(let d=D('2028-02-21');d<=D('2028-04-30');d++){ const hit={};
    for(const h of [12,12.5,13,13.5,13.98]){ fresh(keyOf(d),h,'fam'); if((STORY.schedEnt(c,H.G)||{}).zone!=='lawlib') continue; H.G.zone='lawlib';
      for(const r of ROUTES){ H.G.flags.EXCHANGE_ROUTE=r; if(X().preTalkEv(H.G)==='ev_sis_lawlib_kevin') hit[r]=true; } }
    for(const r of ROUTES) if(hit[r]) got[r].push(keyOf(d).slice(5)); }
  const F8=['03-03','03-10','03-17','03-24','03-31','04-07','04-14','04-21'];
  check('1. 臺灣路線：她在法圖、找她說話就演的日子＝3/3～4/21 八個週五',J(got.TW)===J(F8),J(got.TW));
  check('1. 美國路線：同上八個週五',J(got.US)===J(F8),J(got.US));
  check('1. 日本路線（3/25 出發）：只到 3/24，四個週五',J(got.JP)===J(F8.slice(0,4)),J(got.JP));
  const no=[]; for(const [n,key,h,route] of [['3/1（三）','2028-03-01',12.5],['3/6（一）','2028-03-06',12.5],['3/9（四）','2028-03-09',13],['4/20（四）','2028-04-20',13],['2/25（五，窗口前）','2028-02-25',12.5],['4/28（五，窗口後）','2028-04-28',12.5],
      ['3/3 11:54','2028-03-03',11.9],['3/3 14:00','2028-03-03',14],['3/4（六）','2028-03-04',12.5],['日本路線 3/31（五）','2028-03-31',12.5,'JP']]){ fresh(key,h,'fam',{},{route}); H.G.zone='lawlib'; if(X().preTalkEv(H.G)) no.push(n); }
  check('1. 週一～週四（就算人在法圖）、窗口外的週五、12 點前、14:00、週六、日本路線 3/31：不演',!no.length,J(no));
  fresh('2028-03-03',12.5,'fam'); const r0=relNow(); const ran=await talk('lawlib',[2,0]); const d1=dRel(r0,relNow());
  check('1. 3/3（五）12:30 熟悉、法圖找她說話：先演「法圖的午休」（Kevin 同框照稿）；熟悉 +1、自在 +2；記憶 SIS_LAWLIB_KEVIN',ran===true&&seq(['（法圖最裡面那張桌子。她對面坐著 Kevin，額頭貼在一疊考古題上。）','學弟……救我。','他沒事。他在休息。'])&&H.said[1].who==='Kevin'&&d1.fam===1&&d1.comf===2&&SOCIAL.has(ID,'SIS_LAWLIB_KEVIN'),J({d1,s:said().slice(0,4)}));
  at('2028-03-10',12.5); H.G.zone='lawlib'; check('1. 演過了：3/10（五）不再演',evDone('ev_sis_lawlib_kevin')&&X().preTalkEv(H.G)==null);
  fresh('2028-04-21',13,'dating',{},{route:'US'}); const ran2=await talk('lawlib',[1,1]);
  check('1. 4/21（五）13:00 美國路線、交往中：照樣演（選項一「妳以前不睡覺？」；兩點了去研究小間）',ran2===true&&J(H.opts[0])===J(['「妳以前不睡覺？」','「Kevin 學長加油。」','「那我不吵你們。」'])&&seq(['學弟好溫暖。學姊妳學一下。','那先不要想。大四上再想也來得及。','兩點了。我去研究小間。']),J({o:H.opts,s:said()})); });

/* ---- 2 4-2 交往版「書推過去」：約在別家也演 ---- */
await sec(2,async()=>{ const PUSH='（你把那本書推過去。這半年，它一直放在你書桌最上面那一格。）', BM='（翻到書籤那一頁）……你沒有往後翻。';
  const dinner=async(te,flags,picks)=>{ fresh('2028-12-24',18.5,'dating',flags); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await TERMEND.dinner(GM,{te:Object.assign({term:'Y4S1',who:ID,kind:'gf'},te)}); };
  await dinner({place:'noodle',placeName:'阿鳳麵店'},{SIS_BOOK:'law',SIS_BOOK_WITH_YOU:true},[0]);
  check('2. 12/24 約在阿鳳麵店（不是法圖旁邊那家）：也演「（你把那本書推過去。…）」「（翻到書籤那一頁）……你沒有往後翻。」；選項「我翻了一頁。」「沒有。」→「哪一頁。……算了，不要講。」',
    seq([PUSH,BM,'哪一頁。……算了，不要講。'])&&H.opts.some(o=>J(o)===J(['「我翻了一頁。」','「沒有。」']))&&!has('（下午的人散了，店裡只剩你們這一桌。）'),J({o:H.opts,s:said()}));
  await dinner({place:'brunch',placeName:'半熟'},{SIS_BOOK:'novel',SIS_BOOK_WITH_YOU:true},[1]);
  const li=t=>said().lastIndexOf(t);   /* 「嗯。」前面的閒聊也有：看最後一次 */
  check('2. 約在半熟：也演；「沒有。」→「嗯。」',seq([PUSH,BM])&&li('嗯。')===idx(BM)+1&&has('（半熟。）'),J(said()));
  await dinner({},{SIS_BOOK:'law',SIS_BOOK_WITH_YOU:true},[0]);
  check('2. 她約的那一家（法圖旁邊的簡餐）照舊演，在收尾那句旁白前面',seq([PUSH,BM,'哪一頁。……算了，不要講。','（她看了一下錶，沒有要起身的意思。）']),J(said()));
  const none=[]; for(const [n,f] of [['聽的是朋友版',{SIS_BOOK:'law',SIS_BOOK_WITH_YOU:false}],['both',{SIS_BOOK:'both',SIS_BOOK_WITH_YOU:false}],['沒演過帶哪一本',{}]]){ await dinner({place:'noodle',placeName:'阿鳳麵店'},f); if(has(PUSH)||has(BM)) none.push(n); }
  check('2. 約在別家、沒聽過「放你那邊」的（朋友版、both、沒演過）：照舊沒有',!none.length,J(none)); });

/* ---- 3 12-4 家族讀書會 vs. 公法讀書會：9/13 群組「我去。」的小字 ---- */
await sec(3,async()=>{ const a=D('2027-09-13'), d=D('2027-09-16'), HINT='那天晚上也是公法讀書會';
  const ask=()=>{ const m=byTag('sisb12_study_ask').find(x=>x.ask); return m?m.ask.opts:null; };
  fresh('2027-09-13',20,'friend'); plg('2027-09-09'); at(a,21); ph(); const o1=ask();
  check('3. 大三上 9/9（四，第 1 週）去過公法讀書會：「我去。」旁邊小字「那天晚上也是公法讀書會」；「這週不行。」沒有',!!o1&&J(o1.map(o=>o.t))===J(['我去。','這週不行。'])&&o1[0].hint===HINT&&!o1[1].hint,J(o1));
  const html=askBtns(byTag('sisb12_study_ask').find(x=>x.ask));
  check('3. 手機按鈕（game3d.js askBtns）：「我去。」那一顆畫出小字；「這週不行。」那一顆沒有',!!g3m&&/>我去。<div[^>]*>那天晚上也是公法讀書會<\/div><\/button>/.test(html)&&/>這週不行。<\/button>/.test(html),html.slice(0,400));
  PHONE.answer(H.G,'sisb12_study_ask',0); ph(); const q=OUT.get(H.G,'sisb12_famstudy');
  check('3. 照撞期處理：回「我去。」照舊排 9/16（四）19:00 法圖討論室（不換日子）',!!q&&q.day===d&&q.h===19&&q.title==='法圖・討論室（家族讀書會）',J(q));
  fresh('2027-09-13',20,'none'); plg('2027-09-09'); at(a,21); ph(); const o2=ask();
  check('3. 沒認識學姊的（選項所有人）：去過一樣有小字',!!o2&&o2[0].hint===HINT,J(o2));
  fresh('2027-09-13',20,'friend'); plg('2027-09-09','left'); at(a,21); ph(); const o3=ask();
  check('3. 中途離開也算去過：有小字',!!o3&&o3[0].hint===HINT,J(o3));
  const no=[]; for(const [n,keys] of [['沒去過',[]],['只在大二下去過（2027-05-27）',['2027-05-27']],['只在大二上去過',['2026-12-17']]]){ fresh('2027-09-13',20,'friend'); keys.forEach(k=>plg(k)); at(a,21); ph(); const o=ask(); if(!o||o[0].hint||o[1].hint) no.push(n); }
  check('3. 這學期沒去過（沒去過、只在以前學期去過）：沒有小字',!no.length,J(no));
  fresh('2027-09-13',20,'friend'); at(a,21); ph(); const h0=askBtns(byTag('sisb12_study_ask').find(x=>x.ask));
  check('3. 沒有小字的按鈕照舊（只有選項的字）',/>我去。<\/button>/.test(h0)&&!/<div[^>]*>那天晚上/.test(h0),h0.slice(0,300)); });

/* ---- 4 12-3 大二寒假火鍋 vs. C04W 托福寒假班：1/12 群組「我也在。」的小字 ---- */
await sec(4,async()=>{ const a=D('2027-01-12'), HINT='那天晚上有托福班';
  const ask=()=>{ const m=byTag('sisb12_hot_ask').find(x=>x.ask); return m?m.ask.opts:null; };
  const run=(kind,regs)=>{ fresh('2027-01-12',20,kind); (regs||[]).forEach(([k,v])=>reg(k,v)); at(a,21); ph(); return ask(); };
  const I=VAC.inst('C04W','Y2');
  check('4. 前提：C04W 大二寒假班 12/28～1/20、晚上（slot eve），1/13（三）是上課日',!!I&&keyOf(I.from)==='2026-12-28'&&keyOf(I.to)==='2027-01-20'&&I.A.slot==='eve'&&VAC.daysOf(I).includes(D('2027-01-13')),J(I&&{from:keyOf(I.from),to:keyOf(I.to),slot:I.A.slot}));
  const o1=run('fam',[['C04W@Y2','yes']]);
  check('4. 報了 C04W（大二寒假班）：「我也在。」旁邊小字「那天晚上有托福班」',!!o1&&J(o1.map(o=>o.t))===J(['我也在。'])&&o1[0].hint===HINT,J(o1));
  const html=askBtns(byTag('sisb12_hot_ask').find(x=>x.ask));
  check('4. 手機按鈕畫出小字',/>我也在。<div[^>]*>那天晚上有托福班<\/div><\/button>/.test(html),html.slice(0,300));
  PHONE.answer(H.G,'sisb12_hot_ask',0); ph(); const q=OUT.get(H.G,'sisb12_hotpot');
  check('4. 照撞期處理：回「我也在。」照舊排 1/13（三）19:00 火鍋',!!q&&q.day===D('2027-01-13')&&q.h===19,J(q));
  const o2=run('dating',[['C04W@Y2','done']]);
  check('4. 報名狀態 done（上完了）也算；交往中一樣',!!o2&&o2[0].hint===HINT,J(o2));
  const no=[]; for(const [n,regs] of [['沒報',[]],['報的是 C04W 大三（Y3）',[['C04W@Y3','yes']]],['報的是 C04 暑期班',[['C04@Y2','yes'],['C04@Y1','done']]],['報了又取消（no）',[['C04W@Y2','no']]]]){ const o=run('fam',regs); if(!o||o[0].hint) no.push(n); }
  check('4. 沒報、別年、暑期班、取消：沒有小字',!no.length,J(no));
  const VD=vm.runInThisContext('VAC_DATA'), A0=VD.A.C04W, keep={slot:A0.slot,wd:A0.wd}; let oDay=null, oMon=null;
  try{ A0.slot='day'; oDay=run('fam',[['C04W@Y2','yes']]); A0.slot=keep.slot; A0.wd=[1]; oMon=run('fam',[['C04W@Y2','yes']]); } finally { A0.slot=keep.slot; A0.wd=keep.wd; }
  check('4. 托福班那天白天上課（slot 改 day）：不撞、沒有小字；1/13 不是上課日（只上週一）：沒有小字',!!oDay&&!oDay[0].hint&&!!oMon&&!oMon[0].hint,J({oDay,oMon}));
  const o5=run('ex',[['C04W@Y2','yes']]);
  check('4. 前任（沒有選項）：沒有選項也就沒有小字',o5===null); });

/* ---- 5 日本路線 2028-05-29 ---- */
await sec(5,async()=>{
  fresh('2028-03-24',10,'friend',{},{route:'JP'}); for(let d=D('2028-03-24');d<=D('2028-05-30');d++){ at(d,20); ph(); at(d,22.5); ph(); }
  const M=TH('p:'+ID).filter(m=>keyOf(m.day)==='2028-05-29');
  check('5. 日本路線 5/29 她私訊：「（照片：法圖討論室的白板，寫滿了字）」「讀書會還在。Kevin 說要讀到考前一個月。」（AA_539 1-5）',J(M.map(m=>m.text))===J(JP0529),J(M.map(m=>m.text)));
  const src=fs.readFileSync(path.join(H.ROOT,'src/data/sis_jp_events.js'),'utf8');
  check('5. 舊句「讀書會還在，柏翰在帶。……他比我凶。」不在遊戲裡（註解以外）',!/'讀書會還在，柏翰在帶。……他比我凶。'/.test(src)&&!TH('p:'+ID).some(m=>/柏翰在帶/.test(m.text))); });

/* ---- 6 ② 12-6b 寒暑假出國中 ---- */
await sec(6,async()=>{ const a=D('2028-07-10'), d=D('2028-07-13');
  const lastMs=()=>byTag('sisb12_last_ask'), opts=()=>{ const m=lastMs().find(x=>x.ask); return m?m.ask.opts.map(o=>o.t):null; };
  const pass=()=>{ at(d,19.9); for(const x of OUT.expire(H.G)) OUT.onMissed(GM,x); at(d+1,9); ph(); };
  const APP={C10:{},C08:{VAC_C08_APP:true}};   /* C08 要寫過申請資料才錄取（沒寫的甄選日 VAC 改成 rejected＝沒出國）*/
  check('6. 前提：C10 加州（6/21～7/31）、C08 首爾（7/13 出發，寫過申請資料＝錄取）7/13 都在國外（VAC.abroadOn；跑過手機規則以後也是）',(()=>{ fresh('2028-07-10',20,'friend'); reg('C10@Y3'); ph(); const x=VAC.abroadOn(H.G,d); fresh('2028-07-10',20,'friend',APP.C08); reg('C08@Y3'); ph(); return x&&VAC.abroadOn(H.G,d)&&!VAC.abroadOn(H.G,a); })());
  const bad=[]; for(const [n,k] of [['C10 加州','C10@Y3'],['C08 首爾','C08@Y3']]){ fresh('2028-07-10',20,'friend',APP[k.slice(0,3)]); reg(k); at(a,23.9); ph(); at(a+1,9); ph();
    const L7=lastMs(); if(J(L7.map(x=>x.text))!==J(['最後一次家族讀書會 這週四','學姊下個月就飛了 我下個月就考了','題目我出好了。'])) bad.push(n+'：三則沒收到');
    { const m=L7.find(x=>x.ask), o=m?m.ask.opts.map(q=>q.t):[]; if(o.some(t=>t==='我去。'||t==='這週不行。')) bad.push(n+'：有「我去。」'); }   /* AA_492 第 1 節起：出國中改成一個替代選項「我在〇〇。」（tests/aa492_sis_b12_fix2_unit.js 第 1 節）*/
    H.G.flags.SIS_FAMSTUDY_LAST_GO=true; ph(); if(OUT.get(H.G,'sisb12_famstudy_last')) bad.push(n+'：排了出遊'); pass(); if(H.G.flags.SIS_FAM_STUDY_LAST!=null) bad.push(n+'：記了 '+H.G.flags.SIS_FAM_STUDY_LAST); }
  check('6. 報了 C10 加州、C08 首爾（7/13 人在國外）：7/10 群組三則照收、沒有「我去。」（不收邀約；AA_492 第 1 節起只有「我在〇〇。」）；就算有「我去。」的旗標也不排、不記 missed',!bad.length,J(bad));
  const ok=[]; for(const [n,regs] of [['曼谷 7/3～7/7 回來了',[['T03@Y3','yes']]],['沒報出國',[]]]){ fresh('2028-07-10',20,'friend'); regs.forEach(([k,v])=>reg(k,v)); at(a,21); ph(); const o=opts(); PHONE.answer(H.G,'sisb12_last_ask',0); ph(); const q=OUT.get(H.G,'sisb12_famstudy_last'); if(J(o)===J(['我去。','這週不行。'])&&!!q&&q.state==='planned'&&q.day===d) ok.push(n); }
  check('6. 曼谷回來了、沒報出國：照舊「我去。」／「這週不行。」，回了排 7/13 19:00',ok.length===2,J(ok));
  fresh('2028-07-10',20,'friend'); at(a,21); ph(); reg('C10@Y3'); PHONE.answer(H.G,'sisb12_last_ask',0); ph();
  check('6. 舊存檔（改之前收到有選項的那一則、出國中）：回「我去。」不排',!OUT.get(H.G,'sisb12_famstudy_last'),J(OUT.rec(H.G)));
  fresh('2028-07-10',20,'friend'); at(a,21); ph(); PHONE.answer(H.G,'sisb12_last_ask',0); ph(); const q0=OUT.get(H.G,'sisb12_famstudy_last'), s0=q0&&q0.state; reg('C10@Y3'); at(a+1,9); ph(); const s1=(OUT.get(H.G,'sisb12_famstudy_last')||{}).state; pass();
  check('6. 舊存檔（已經排好、出國中）：取消（cancelled），過了時間不變 missed、不記 SIS_FAM_STUDY_LAST',s0==='planned'&&s1==='cancelled'&&(OUT.get(H.G,'sisb12_famstudy_last')||{}).state==='cancelled'&&H.G.flags.SIS_FAM_STUDY_LAST==null,J({s0,s1,f:H.G.flags.SIS_FAM_STUDY_LAST}));
  fresh('2028-07-10',20,'friend',{},{route:'JP'}); H.G.flags.JP_DEPARTED=D('2028-03-25'); at(a,22.5); ph();
  check('6. 日本路線照舊：「我在日本。」',J(opts())===J(['我在日本。']),J(opts())); });

H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

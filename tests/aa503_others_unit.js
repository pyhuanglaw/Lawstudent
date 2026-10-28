// 別人說起她（AA_503 @ d13ab3ab7、AA_504 @ 62849944b、AA_505 @ 795fbecfd，每位女主角那一節最後；HEROINE-LIFE-1028，
// 使用者 2026-10-28 01:2x「可攻略女主角 感覺都沒有自己的生活」，USER_WANTS X122★）——不需要瀏覽器。src/data/heard_lines.js（台詞）、src/heard3d.js（HEARD）。
//   0  載得到、index.html 順序（dorm203_3d.js 以後、bbpack_events.js 前面）；遊戲裡每一句都在它那一份稿裡（git show，一字不差）；
//      稿上「別人說起她」的每一句，不是在遊戲裡，就是在「沒做」的清單（二十位同學 pool_*、小婷、大一的學妹、阿凱大二上、本來就有的）——沒有漏掉沒說的
//   1  閒聊前一句（STORY.PRE_TALK）：每一句在它的那幾天才說（前一天、過了 until 都不說）、要認識說的那個人、一句只說一次、同一個人一天最多一句、
//      陳助教兩句照順序；以安說沛珊和柏翰（沒和沛珊交往的才有）；柏翰那句等現有的「沛珊在群組說了。」先說
//   2  203 阿凱：練習賽私訊選「他沒講。」→ 下一次在 203 阿凱「子晴叫你恭喜我？……喔。好。謝謝。」、記 KAI_COUNTED（AA_503 第 11 節的測試建議）；
//      選別的沒有；「系上那個練習賽，子晴第三。……」第 11 週週六以後；「子晴那場比賽沒去。……」大一下第 9 週；和 AA_502 的三句共用一天一句
//   3  麵店長桌：阿哲兩則（大一上輪到才演、只演一次；大一下第 9 週先挑、只演一次、不動輪到第幾則）
//   4  手機：Kevin 家族群組三次（12/15 在聖誕那幾則之前、6/20、1/23）、予樂三次（見過予樂才有）、品妤「走啦」群組兩次；條件不對不傳、晚三天以上不補
// 修改前（開發分支 a57127ab4：沒有 heard_lines.js、heard3d.js；src、index.html 換回 a57127ab4 實際跑過）：FAILED 8——第 0 段 4 項（載入與順序、對稿 0 句、
//   稿上 54 句沒有一句在遊戲裡、203 阿凱那一句）、第 1～4 段各 1 項（沒有 HEARD 就停）。修改後 ALL PASS。用法：node tests/aa503_others_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const SPEC={AA_503:['docs/story_planning/AA_503_女主角自己的生活_大一上_動態頁_圈子_她的事.md','d13ab3ab7'],AA_504:['docs/story_planning/AA_504_女主角自己的生活_大一下與暑假.md','62849944b'],AA_505:['docs/story_planning/AA_505_女主角自己的生活_大二上與寒假.md','795fbecfd']};
const show=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ return ''; } };
const DOC={}; for(const k in SPEC) DOC[k]=show(SPEC[k][1],SPEC[k][0]);
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
const errs=[];
for(const [f,n] of [['src/family_xmas3d.js',['FAMXMAS']],['src/data/noodle_table.js',['NOODLE_TABLE']],['src/data/dorm_room_layout.js',['DORM_ROOM']],['src/data/dorm203_lines.js',['DORM203_LINES']],['src/dorm203_3d.js',['DORM203']],['src/data/heard_lines.js',['HEARD_LINES']],['src/heard3d.js',['HEARD']]]){
  try{ if(fs.existsSync(path.join(H.ROOT,f))) loadG(f,n); else errs.push('沒有 '+f); }catch(e){ errs.push(f+'：'+(e&&e.message||e)); } }
const HAS=()=>typeof HEARD!=='undefined', HL=()=>typeof HEARD_LINES!=='undefined'?HEARD_LINES:{talk:[],kai203:[],noodle:{},phone:[]};
const sec=async(name,fn)=>{ try{ await fn(); }catch(e){ check(name+'（例外）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' | ').slice(0,240)); } };
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const DK=k=>PG.DK(k);
const TDt=(term,w,wd)=>{ const R=CALENDAR.termDays(term); return R.from+(w-1)*7+(wd-1); };
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wdOf(d); };
const fresh=(d,h,flags,zone)=>{ const G=H.fresh(CALENDAR.dateOf(d).key,h,zone||'dorm',flags); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; return G; };
const meet=(...ids)=>{ for(const id of ids) H.rel(id,45,30,10); };
const said=()=>H.said.map(s=>s.t);
const who=id=>({name:id});
const srcOf=e=>e.src?e.src.split(' ')[0]:(e.once?'AA_'+e.once.slice(1,4):null);

(async()=>{
/* ---------- 0 載入、對稿 ---------- */
await sec('0',async()=>{ const sc=f=>html.indexOf('<script src="'+f), iD=sc('src/dorm203_3d.js'), iL=sc('src/data/heard_lines.js'), iH=sc('src/heard3d.js'), iB=sc('src/data/bbpack_events.js'), iS=sc('src/story3d.js'), iN=sc('src/data/noodle_table.js');
  check('0. 載得到；index.html：heard_lines.js → heard3d.js 在 story3d.js、noodle_table.js、dorm203_3d.js 以後，bbpack_events.js 前面',!errs.length&&iL>iD&&iH>iL&&iB>iH&&iH>iS&&iH>iN&&iD>0,J(errs));
  const L=HL(), all=[]; for(const e of L.talk) all.push([srcOf(e),e.t,e.id]); for(const e of L.kai203) all.push([srcOf(e),e.t,e.id]);
  for(const k in L.noodle) for(const e of L.noodle[k]) for(const d of e.dialogue) all.push([srcOf(e),d.text,e.once]);
  for(const e of L.phone) for(const it of e.items) all.push([srcOf(e),it[2],e.id]);
  const bad=all.filter(([s,t])=>!DOC[s]||!DOC[s].includes(t));
  check('0. 遊戲裡每一句都在它那一份稿裡（AA_503 d13ab3ab7、AA_504 62849944b、AA_505 795fbecfd，一字不差；'+all.length+' 句）',all.length===42&&Object.values(DOC).every(d=>d.length>1000)&&!bad.length,J(bad.slice(0,6)));
  /* 稿上的「別人說起她」（X-4）每一句 */
  const got=new Set(all.map(x=>x[1])), heard=[];
  for(const k of ['AA_503','AA_504','AA_505']){ let on=false, last=''; for(const l of (DOC[k]||'').split('\n')){ if(/^### \d+-4\. 別人說起她/.test(l)){ on=true; continue; } if(/^(### |## |---)/.test(l)){ on=false; continue; } if(!on) continue; let m;
      if((m=/^\s*- ([^：「]+)：「([^」]*)」/.exec(l))){ last=m[1]; heard.push([k,m[1],m[2]]); }
      else if((m=/^\s*- 「([^」]*)」/.exec(l))) heard.push([k,last,m[1]]);
      else if((m=/^\s*> ([^：]+)：(.+)$/.exec(l))) heard.push([k,m[1],m[2].trim()]);
      else if((m=/^\s*- ([^：「]+)：\s*$/.exec(l))) last=m[1]; } }
  const NOT_DONE={
    '以安每次都比我早到一點點。我開始懷疑她住在教室裡。':'曾靖雯（AA_498 已有）','語彤在社工系的課坐第一排。':'蘇承恩（已有）','子晴說我彈得太快。我說她講話太快。':'劉晏如（已有）',
    '沛珊交了一份她沒修的課的報告。老師在最後問她為什麼不修。我覺得那是今年最好的問題。':'廖芸萱 pool_15',
    '以安說她日文課七點。我說那比我早餐晚一個小時。她看了我一眼。':'曾靖雯 pool_7','學姊說我的比較好。她自己的那杯，冬天一直有人點。……沒有在菜單上的那杯。':'小婷（不是 3D 人物）',
    '子晴叫晨希站她旁邊。晨希緊張到一直喝水。':'劉晏如 pool_5','沛珊這學期沒來旁聽。她說週二、四要去教小朋友。……她說教小朋友也是在問『為什麼』。':'廖芸萱 pool_15',
    '學姊帶新人的時候，講話變慢。帶我的時候沒有。':'小婷（不是 3D 人物）','民總最後一排那個社會系的學姊，都不講話。可是她的筆記比我們少一半，都是重點。':'大一的學妹（3D 標籤人物）',
    '我按不出 C，子晴來教。她教了十分鐘，學妹就會了。我學了一學期。':'葉晨希 pool_11','子晴不去實驗室。她說她要做自己的東西。……我覺得她做得到。':'阿凱大二上（3D 裡沒有他）',
    '沛珊這學期都沒來旁聽。她說要念書。……她以前念書也會來的。':'廖芸萱 pool_15'};
  const miss=heard.filter(([k,w,t])=>!got.has(t)&&!NOT_DONE[t]), extra=Object.keys(NOT_DONE).filter(t=>!heard.some(x=>x[2]===t)||got.has(t));
  check('0. 稿上「別人說起她」'+heard.length+' 句：'+heard.filter(x=>got.has(x[2])).length+' 句在遊戲裡、'+Object.keys(NOT_DONE).length+' 句列在沒做（pool_*、小婷、大一的學妹、阿凱大二上、本來就有的），沒有漏掉',heard.length>=40&&!miss.length&&!extra.length,J({miss,extra}));
  const prac=(DOC.AA_503.match(/> 阿凱：(子晴叫你恭喜我？[^\n]*)/)||[])[1];
  check('0. AA_503 7-2 阿凱那一句（練習賽「他沒講。」之後）在遊戲裡',!!prac&&HL().kai203.some(e=>e.t===prac),J(prac)); });

/* ---------- 1 閒聊前一句 ---------- */
await sec('1',async()=>{ if(!HAS()){ check('1. HEARD',false,'沒有 HEARD'); return; }
  check('1. 接在 STORY.PRE_TALK（talkCharacter 閒聊前面）',STORY.PRE_TALK.length>0);
  const D=d=>CALENDAR.dateOf(d).key;
  const win=e=>({a:HEARD.when(e.from),b:e.until?HEARD.when(e.until):null});
  const setup=(e,d,h)=>{ fresh(d,h==null?12:h,{}); meet(e.who); if(e.about) meet(e.about); if(e.after) HEARD.rec(H.G).said[e.after]=d-1; };   /* cond：psBohan（沒和沛珊交往）、bhAfterSplit（群組沒說分手）新局本來就成立 */
  const bad=[];
  for(const e of HL().talk){ const w=win(e); if(!w.a){ bad.push(e.id+' from'); continue; }
    const h0=w.a.h!=null?w.a.h+0.01:12;
    setup(e,w.a.day,h0); const okIn=HEARD.talkDue(H.G,e.who); const inOk=!!okIn&&okIn.id===e.id;
    setup(e,w.a.day-1,23.9); const before=HEARD.talkDue(H.G,e.who); const beforeOk=!before||before.id!==e.id;
    let afterOk=true; if(w.b){ setup(e,w.b.day,12); const last=HEARD.talkDue(H.G,e.who); setup(e,w.b.day+1,12); const after=HEARD.talkDue(H.G,e.who); afterOk=!!last&&last.id===e.id&&(!after||after.id!==e.id); }
    if(!(inOk&&beforeOk&&afterOk)) bad.push(e.id+' '+J({inOk,beforeOk,afterOk,from:e.from,until:e.until,day:D(w.a.day)})); }
  check('1. 每一句（'+HL().talk.length+' 句）在它的那幾天才說：from 那天有、前一天沒有、until 那天有、隔天沒有',HL().talk.length===20&&!bad.length,J(bad.slice(0,6)));
  /* 要認識她、一句一次、一天一句 */
  const ps=HL().talk.find(e=>e.id==='h503_ps_an'); const d=TDt('Y1S1',8,2);
  fresh(d,12,{}); meet('classmate_peishan'); check('1. 沛珊說以安：玩家還不認識以安＝不說',!HEARD.talkDue(H.G,'classmate_peishan'));
  meet('heroine_01'); H.said=[]; await HEARD.preTalk(GM,who('沛珊'),'classmate_peishan'); const s1=said();
  H.said=[]; await HEARD.preTalk(GM,who('沛珊'),'classmate_peishan'); at(d+1,12); await HEARD.preTalk(GM,who('沛珊'),'classmate_peishan'); const s2=said();
  check('1. 認識以安：第一次說話先說「以安寫的宿舍規則，我只看得懂兩頁。第三頁都是條文。」；同一天、之後都不再說（一句一次）',J(s1)===J([ps.t])&&!s2.length&&HEARD.rec(H.G).said.h503_ps_an===d,J({s1,s2}));
  /* 透過 STORY.PRE_TALK（跟其他掛勾一起跑）*/
  fresh(d,12,{}); meet('classmate_peishan','heroine_01'); H.said=[]; for(const f of STORY.PRE_TALK){ try{ await f(GM,who('沛珊'),'classmate_peishan'); }catch(e){} }
  check('1. 透過 STORY.PRE_TALK 也一樣（talkCharacter 照作息出現的沛珊）',said().includes(ps.t),J(said()));
  /* 陳助教兩句：照順序、一天一句 */
  const d2=TDt('Y1S1',5,3); fresh(d2,15,{}); meet('npc_ta_chen','heroine_05'); H.said=[]; await HEARD.preTalk(GM,who('陳助教'),'npc_ta_chen'); await HEARD.preTalk(GM,who('陳助教'),'npc_ta_chen'); const c1=said();
  at(d2+1,15); H.said=[]; await HEARD.preTalk(GM,who('陳助教'),'npc_ta_chen'); const c2=said();
  check('1. 陳助教「閒聊加兩句」：第一天第一句（同一天不說第二句）、隔天第二句',J(c1)===J(['書瑀每天坐同一個位子。我叫她起來走走，她說走走會忘記第三章。'])&&J(c2)===J(['她說考完要睡三天。我賭她只能睡一天。']),J({c1,c2}));
  at(DK('2026-02-02'),15); HEARD.rec(H.G).said={}; HEARD.rec(H.G).day={}; check('1. 陳助教：學姊 2/2 考試那天起不說（考前的話）',!HEARD.talkDue(H.G,'npc_ta_chen'));
  /* 以安說沛珊和柏翰：沒和沛珊交往的才有 */
  const d3=DK('2026-04-16'); fresh(d3,12,{}); meet('heroine_01','classmate_peishan'); const a=HEARD.talkDue(H.G,'heroine_01');
  fresh(d3,12,{dating_classmate_peishan:true}); meet('heroine_01','classmate_peishan'); const b=HEARD.talkDue(H.G,'heroine_01');
  check('1. 以安（4/15 以後）「沛珊上禮拜跟我說的。……」：沛珊和柏翰在交往＝有；玩家和沛珊交往中＝沒有',!!a&&a.id==='h504_an_ps'&&!b,J([a&&a.id,b&&b.id]));
  /* 柏翰那句：等現有的「沛珊在群組說了。」先說、不同一天 */
  const d4=TDt('Y2S1',7,2); fresh(d4,12,{}); meet('classmate_bohan','classmate_peishan'); PHONE.postAt(H.G,{th:'g:law_class',from:'classmate_peishan',text:'x',tag:'ps_split_group'},d4-2,21);
  const c0=HEARD.talkDue(H.G,'classmate_bohan'); H.G.flags.BH_SPLIT_TALKED=d4; const c3=HEARD.talkDue(H.G,'classmate_bohan'); at(d4+1,12); const c4=HEARD.talkDue(H.G,'classmate_bohan');
  check('1. 柏翰（大二上第 7 週以後）「沛珊把題目整理交給我了。……」：群組說了分手、他還沒說「沛珊在群組說了。」＝先不說；他說的那一天也不說；隔天才說',!c0&&!c3&&!!c4&&c4.id==='h505_bh_ps',J([c0&&c0.id,c3&&c3.id,c4&&c4.id]));
  fresh(d4,12,{dating_classmate_peishan:true}); meet('classmate_bohan','classmate_peishan'); check('1. 玩家和沛珊交往中：柏翰那句沒有',!HEARD.talkDue(H.G,'classmate_bohan')); });

/* ---------- 2 203 阿凱 ---------- */
await sec('2',async()=>{ if(!HAS()||typeof DORM203==='undefined'){ check('2. 203',false,'沒有 HEARD 或 DORM203'); return; }
  const F4={DORM_FOUR:true,introDone:true,MET_KAI:true,MET_ZHE:true}, kai={name:'阿凱'};
  check('2. 包住 DORM203.kaiTalk（talkKai 在原本的房間句之前問）',DORM203._heard===true);
  const SAT=TDt('Y1S1',11,6);
  const go=async(flag,day,h)=>{ fresh(day,h,Object.assign({},F4,flag==null?{}:{ZQ_PRACTICE:flag})); meet('kai','heroine_04'); H.said=[]; const r=await DORM203.kaiTalk(GM,kai); return {r,s:said()}; };
  let x=await go('tell',SAT+1,21);
  check('2. AA_503 第 11 節：練習賽私訊選「他沒講。」（ZQ_PRACTICE tell）→ 下一次在 203 阿凱「子晴叫你恭喜我？……喔。好。謝謝。」、記 KAI_COUNTED',x.r===true&&J(x.s)===J(['子晴叫你恭喜我？……喔。好。謝謝。'])&&H.G.flags.KAI_COUNTED===true,J(x));
  H.said=[]; const again=await DORM203.kaiTalk(GM,kai); at(SAT+2,21); H.said=[]; await DORM203.kaiTalk(GM,kai); const nx=said();
  check('2. 同一天一句（AA_502 的三句也算在一起）；隔天接著「系上那個練習賽，子晴第三。她一直說下次要贏我。」',again===false&&J(nx)===J(['系上那個練習賽，子晴第三。她一直說下次要贏我。']),J({again,nx}));
  for(const f of ['third','sticker',null]){ x=await go(f,SAT+1,21); check('2. 選「'+(f==='third'?'妳第三也很強。':f==='sticker'?'（貼圖）':'沒有那則私訊')+'」：沒有恭喜那一句、沒有 KAI_COUNTED（說的是「系上那個練習賽……」）',J(x.s)===J(['系上那個練習賽，子晴第三。她一直說下次要贏我。'])&&!H.G.flags.KAI_COUNTED,J(x)); }
  x=await go(null,SAT,17.5); const pre=x.s; x=await go(null,SAT,18.5);
  check('2. 「系上那個練習賽……」第 11 週週六 18:00（練習賽、子晴第 3 則動態）以後才說；之前是 AA_502 的句子',!pre.includes('系上那個練習賽，子晴第三。她一直說下次要贏我。')&&J(x.s)===J(['系上那個練習賽，子晴第三。她一直說下次要贏我。']),J({pre,s:x.s}));
  fresh(SAT+1,21,F4); meet('kai'); H.said=[]; await DORM203.kaiTalk(GM,kai); check('2. 不認識子晴：阿凱不講子晴',!said().some(t=>/子晴/.test(t)),J(said()));
  /* 大一下第 9 週 */
  const W9=TDt('Y1S2',9,2); fresh(W9,21,F4); meet('kai','heroine_04'); const R=HEARD.rec(H.G); R.said.h503_kai_third=1; H.said=[]; await DORM203.kaiTalk(GM,kai); const w9=said();
  fresh(TDt('Y1S2',10,2),21,F4); meet('kai','heroine_04'); HEARD.rec(H.G).said.h503_kai_third=1; H.said=[]; await DORM203.kaiTalk(GM,kai); const w10=said();
  check('2. AA_504：大一下第 9 週阿凱「子晴那場比賽沒去。……我也沒問。」；第 10 週就不說',J(w9)===J(['子晴那場比賽沒去。……我也沒問。'])&&!w10.includes('子晴那場比賽沒去。……我也沒問。'),J({w9,w10}));
  fresh(DK('2026-06-15'),21,F4); meet('kai','heroine_04'); H.said=[]; const out=await DORM203.kaiTalk(GM,kai); check('2. 6/15 搬出 203 以後：沒有（203 那段才有）',out===false&&!said().length); });

/* ---------- 3 麵店長桌 ---------- */
await sec('3',async()=>{ if(!HAS()||typeof NOODLE_TABLE==='undefined'){ check('3. 長桌',false,'沒有'); return; }
  const Y1=NOODLE_TABLE.Y1, ig=Y1.findIndex(e=>e.once==='h503_zhe_garlic'), ih=Y1.findIndex(e=>e.once==='h504_zhe_hand');
  check('3. 兩則加在大一那一組後面（原本的八則不動）',ig===8&&ih===9&&Y1.length===10,J([ig,ih,Y1.length]));
  const setup=(d)=>{ fresh(d,18,{MET_ZHE:true},'noodle'); meet('zhe','heroine_03','yu','classmate_bohan','classmate_xinci'); PHONE.join(H.G,'noodle_team','麵店團'); };
  const W9=TDt('Y1S2',9,2); setup(W9); H.G.flags.ndlTalkN={Y1:3}; const p=STORY.ndlTalkPick(H.G);
  H.said=[]; await STORY.ndlTalk(GM); const s=said();
  check('3. AA_504：大一下第 9 週的麵店日先挑阿哲「阿姨的手包起來了。……」（只演一次、不動輪到第幾則）',!!p&&p.e.once==='h504_zhe_hand'&&J(s)===J(['阿姨的手包起來了。語彤一個人顧店。我去幫忙收碗，她說你坐著。'])&&H.G.flags.ndlTalkN.Y1===3&&H.G.flags.ndlTalkOnce.h504_zhe_hand===W9,J({s,N:H.G.flags.ndlTalkN}));
  at(W9+2,18); const p2=STORY.ndlTalkPick(H.G); check('3. 同一週的下一個麵店日：照原本輪到的第 4 則',!!p2&&p2.i===3,J(p2&&[p2.i,p2.e.once]));
  setup(TDt('Y1S2',10,2)); H.G.flags.ndlTalkN={Y1:3}; const p3=STORY.ndlTalkPick(H.G); check('3. 第 10 週沒有那一則',!!p3&&p3.e.once!=='h504_zhe_hand');
  /* 大一上：輪到才演、只演一次 */
  const W6=TDt('Y1S1',6,2); setup(W6); H.G.flags.ndlTalkN={Y1:8}; const g=STORY.ndlTalkPick(H.G); H.said=[]; await STORY.ndlTalk(GM); const sg=said();
  check('3. AA_503：大一上輪到第 9 則＝阿哲「語彤今天又在剝蒜頭。我去幫忙，被阿姨趕出來。」；演完輪到第 10 則',!!g&&g.e.once==='h503_zhe_garlic'&&J(sg)===J(['語彤今天又在剝蒜頭。我去幫忙，被阿姨趕出來。'])&&H.G.flags.ndlTalkN.Y1===9,J({sg,N:H.G.flags.ndlTalkN}));
  H.G.flags.ndlTalkN={Y1:8}; at(W6+7,18); const g2=STORY.ndlTalkPick(H.G); check('3. 演過了：下一輪輪到它就跳過（只演一次）',!!g2&&g2.e.once!=='h503_zhe_garlic',J(g2&&[g2.i,g2.e.once]));
  setup(TDt('Y1S2',3,2)); H.G.flags.ndlTalkN={Y1:8}; const g3=STORY.ndlTalkPick(H.G); check('3. 大一下輪到它：不演（大一上才有）',!!g3&&g3.e.once!=='h503_zhe_garlic');
  });

/* ---------- 4 手機 ---------- */
await sec('4',async()=>{ if(!HAS()){ check('4. 手機',false,'沒有 HEARD'); return; }
  const run=(d,h)=>{ at(d,h); HEARD.phone(H.G); PHONE.tick(H.G); };
  const msgs=tag=>(H.G.msgs||[]).filter(m=>m.tag==='heard_'+tag);
  /* Kevin 12/15：聖誕那幾則（21:00）之前 */
  const D1215=DK('2025-12-15'); fresh(D1215,20,{}); PHONE.join(H.G,'family_law','法律系家族'); run(D1215,20.8); const k0=msgs('h503_kevin').length; run(D1215,21.2); STORY.phoneRules(GM); PHONE.tick(H.G);
  const fam=(H.G.msgs||[]).filter(m=>m.th==='g:family_law'), iK=fam.findIndex(m=>m.tag==='heard_h503_kevin'), iX=fam.findIndex(m=>m.tag==='famx_y1_grp');
  check('4. AA_503：Kevin 12/15 20:50 家族群組兩則（「學姊最近都在總圖 大家不要吵她喔」「有事找我 我比較閒」），排在 21:00 聖誕那幾則前面',k0===0&&J(msgs('h503_kevin').map(m=>[m.from,m.name,m.text]))===J([['kevin','Kevin','學姊最近都在總圖 大家不要吵她喔'],['kevin','Kevin','有事找我 我比較閒']])&&iK>=0&&(iX<0||iK<iX),J({iK,iX}));
  fresh(D1215,20,{}); run(D1215,22); check('4. 不在家族群組：沒有（x:famGroup）',!msgs('h503_kevin').length&&HEARD.rec(H.G).ph.h503_kevin==='x:famGroup');
  fresh(D1215+5,12,{}); PHONE.join(H.G,'family_law','法律系家族'); run(D1215+5,12); check('4. 晚三天以上（存檔停在以前、跳過去）：不補（x:late）',!msgs('h503_kevin').length&&HEARD.rec(H.G).ph.h503_kevin==='x:late');
  const D620=DK('2026-06-20'); fresh(D620,20,{}); PHONE.join(H.G,'family_law','法律系家族'); run(D620,21.1);
  check('4. AA_504：Kevin 6/20 學姊學游泳四則（學姊「早上七點。」、Kevin「……那算了」）',J(msgs('h504_kevin').map(m=>[m.name,m.text]))===J([['Kevin','學姊說她在學游泳'],['Kevin','學姊妳下次游泳可以約家族一起去啊'],['溫學姊','早上七點。'],['Kevin','……那算了']]),J(msgs('h504_kevin').map(m=>m.text)));
  const D123=DK('2027-01-23'); fresh(D123,20,{}); PHONE.join(H.G,'family_law','法律系家族'); run(D123,21.1);
  check('4. AA_505：Kevin 1/23 學姊去池上四則（學姊「冬天。」）',J(msgs('h505_kevin').map(m=>m.text))===J(['學姊去池上了','她只傳了一張照片給我 稻田 沒有稻子','學姊妳要不要說明一下','冬天。']));
  /* 予樂：見過予樂（予樂的宵夜）才有 */
  const W11=TDt('Y1S1',11,4); fresh(W11,23,{}); run(W11,23.8); const y0=msgs('h503_yule').length;
  fresh(W11,23,{yulePassDay:TDt('Y1S1',6,3)}); run(W11,23.5); const y1=msgs('h503_yule').length; run(W11,23.8);
  check('4. AA_503：予樂（見過她：去過予樂的宵夜）第 11 週週四 23:40「可昕的報告被誇了 她嘴上說還好 其實開心到睡不著」（p:yule）；沒見過予樂＝沒有',y0===0&&y1===0&&J(msgs('h503_yule').map(m=>[m.th,m.from,m.text]))===J([['p:yule','yule','可昕的報告被誇了 她嘴上說還好 其實開心到睡不著']])&&PHONE.title(H.G,'p:yule')==='予樂',J(msgs('h503_yule')));
  const D722=DK('2026-07-22'); fresh(D722,21,{yulePassDay:1}); run(D722,22.1);
  check('4. AA_504：予樂 7/22 22:00 兩則（她搭高鐵走的那晚）',J(msgs('h504_yule').map(m=>m.text))===J(['可昕的媽媽煮了一桌 可昕一直叫她不要再煮了','她在家跟在學校差好多']));
  const S11=TDt('Y2S1',11,6); fresh(S11,23,{}); H.G.events.done.ev_kexin_yule_pass=1; run(S11,23.9);
  check('4. AA_505：予樂第 11 週週六 23:50 兩則（可昕「輸了。」那晚）',J(msgs('h505_yule').map(m=>m.text))===J(['可昕輸了以後回宿舍 一句話都沒講 直接開始寫下一份','我好怕她']));
  /* 品妤：「走啦」群組 */
  const W6=TDt('Y1S1',6,2); fresh(W6,21,{}); PHONE.join(H.G,'econ_friends','走啦'); run(W6,21.4);
  check('4. AA_503：品妤第 6 週週二 21:20 在「走啦」群組「可昕上禮拜貼她們系的烤肉。她烤的玉米全部是焦的。」',J(msgs('h503_pinyu').map(m=>[m.th,m.name,m.text]))===J([['g:econ_friends','品妤','可昕上禮拜貼她們系的烤肉。她烤的玉米全部是焦的。']]));
  const W12=TDt('Y2S1',12,2); fresh(W12,21,{}); PHONE.join(H.G,'econ_friends','走啦'); run(W12,21.4);
  check('4. AA_505：品妤第 12 週週二 21:20「可昕說她模擬法庭輸給一個大三的。……」',J(msgs('h505_pinyu').map(m=>m.text))===J(['可昕說她模擬法庭輸給一個大三的。她講的時候一直在笑，你知道那代表她很生氣。']));
  fresh(W12,21,{}); run(W12,21.4); check('4. 不在「走啦」群組：沒有',!msgs('h505_pinyu').length);
  /* 接在 STORY.PHONE_RULES */
  fresh(D620,20,{}); PHONE.join(H.G,'family_law','法律系家族'); at(D620,21.1); STORY.phoneRules(GM); PHONE.tick(H.G); check('4. 接在 STORY.PHONE_RULES（每次手機規則都跑）',msgs('h504_kevin').length===4); });

H.done();
})();

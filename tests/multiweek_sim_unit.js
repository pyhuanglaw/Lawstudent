// 連續多週遊玩的模擬（ChatGPT 審查第七點「連續多週遊玩的測試方案」的模擬層；瀏覽器層見 docs/TESTING.md 第九節）——不需要瀏覽器。
// 用遊戲真正的課表、跳過時間（CLS.skipTo）、上課（CLS.attend）、起床（CLS.morning）程式，從第 3 天（9/19）一天一天玩到大一下第 2 週（2026-03-08），
// 睡覺照 story3d.js 的 sleepNow（天數 +1、星期 +1、07:30）。玩家的作息固定：平日去上課，但每個奇數週的週五翹課、週三下午的課翹掉，考試週全部去。
// 每天檢查：星期和日曆一致；昨天的每一堂課都是「上過」或「沒去」（不會停在還沒開始／可以進教室）；出席次數＝上過的堂數；時間不跨過午夜。
// 整段檢查：大一上的成績單只在學期結束後第一個早上發一次（內容照準備次數）；大一下的選課結果只問一次（選了不修，之後週二下午沒有課）；
//   期中、期末考週的提醒每學期各一次；國定假日沒有課；課表紀錄（存檔的 courses）大小不會一直長。這是模擬，不是瀏覽器裡的玩家流程，也不是 iPhone 實機。
// 用法：node tests/multiweek_sim_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const END=dayOf('2026-03-08');
const G={day:3,hour:7.5,weekday:5,zone:'dorm',flags:{},energy:80,goal:'',goalDest:null};
const log={say:[],toast:[],choose:[]};
let answer=null;   // 這一次 choose 要選第幾個（null＝第一個）
const GM={G,E:{zone:null,player:{busy:false,obj:{position:{x:0,z:0}}}},D:{active:false},S:{},titleIdle:false,
  sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ log.say.push(G.day+':'+t); },toast:t=>log.toast.push(G.day+':'+t),caption(){},autosave(){},setGoal(t,d){ G.goal=t; G.goalDest=d||null; },
  choose:async o=>{ log.choose.push(G.day+':'+o.map(q=>q.t).join('/')); const i=typeof answer==='function'?answer(o):answer; return i==null?0:i; },
  fade:async()=>{},sleep:async()=>{},advance(h){ G.hour+=h; },energy(d){ G.energy=Math.max(0,Math.min(100,G.energy+d)); },money(){}};
const R=()=>CLS.rec(G);
const wd=d=>CALENDAR.dateOf(d).wd;   // 1＝週一 … 7＝週日
const termOf=d=>CALENDAR.termOf(d);
const bad={weekday:[],pending:[],attend:[],midnight:[],holiday:[]};
const sizes=[];
(async()=>{
  for(let guard=0; G.day<=END&&guard<400; guard++){
    // ---- 早上（起床）：成績單、選課結果、開學、考試週的提醒 ----
    answer=o=>{ const k=o.findIndex(q=>/^這學期不修/.test(q.t)); return k>=0?k:0; };   // 選課：法律與社會（下）選「不修」；其他照預設
    await CLS.morning(GM);
    answer=null;
    if(G.weekday!==wd(G.day)%7) bad.weekday.push(G.day);
    const items=CLS.dayItems(G).filter(it=>!CLS.storyClass(G,it));
    if(CALENDAR.holiday(G.day)&&items.length) bad.holiday.push(G.day);
    const t=termOf(G.day), w=wd(G.day);
    for(const it of items){
      const exam=!!it.exam, skip=!exam&&((w===5&&t&&t.week%2===1)||(w===3&&it.t0>12));
      if(skip) continue;
      if(G.hour<it.t0-1/6){ answer=0; await CLS.skipTo(GM,it.t0-1/6); answer=null; }   // 「等到下一堂課前」（經過翹掉的課會先問，選「照樣跳過」）
      if(CLS.status(G,it)==='open') await CLS.attend(GM,it);
    }
    answer=0; if(G.hour<20) await CLS.skipTo(GM,20); answer=null;   // 晚上（經過的課照樣跳過）
    if(G.hour>=24) bad.midnight.push(G.day);
    // ---- 這一天結束：每一堂都是上過或沒去 ----
    G.hour=23.5;
    for(const it of items){ const s=CLS.status(G,it); if(s!=='done'&&s!=='missed') bad.pending.push(G.day+' '+it.c.name+' '+s); }
    if(wd(G.day)===7) sizes.push(JSON.stringify(G).length);
    // ---- 睡覺（story3d.js 的 sleepNow）----
    G.day++; G.weekday=(G.weekday+1)%7; G.hour=7.5;
  }
  check('模擬到 2026-03-08（大一下第 2 週）',G.day===END+1,'第 '+(G.day-1)+' 天');
  check('每天的星期和日曆一致（睡一次 +1）',!bad.weekday.length,bad.weekday.slice(0,5).join(','));
  check('國定假日沒有課',!bad.holiday.length,bad.holiday.join(','));
  check('每一天結束時，每一堂課都是「上過」或「沒去」',!bad.pending.length,bad.pending.slice(0,5).join(' | '));
  check('跳過時間不跨過午夜',!bad.midnight.length,bad.midnight.join(','));
  // 出席次數：照 done 的 key 和那一堂是不是考試重算
  { const exp={}; const keyMap={};
    for(let d=3; d<=END; d++) for(const it of CLS.dayItems(G,d)) keyMap[it.key]=it;
    for(const k in R().done){ const it=keyMap[k]; if(it&&!it.exam) exp[it.c.id]=(exp[it.c.id]||0)+1; }
    const diff=Object.keys(Object.assign({},exp,R().attend)).filter(id=>(exp[id]||0)!==(R().attend[id]||0));
    check('出席次數＝上過的堂數（考試不算出席）',!diff.length,diff.map(id=>id+' '+(R().attend[id]||0)+'≠'+(exp[id]||0)).join(', '));
    const fri=Object.keys(R().done).filter(k=>{ const it=keyMap[k]; return it&&!it.exam&&wd(it.day)===5&&termOf(it.day).week%2===1; });
    check('翹掉的課（奇數週週五）沒有記成上過',!fri.length,fri.slice(0,3).join(','));
    check('大一上的每一門課都上過好幾次（模擬真的在上課）',CLS.termCourses(G,'Y1S1').filter(c=>c.kind!=='service').every(c=>(R().attend[c.id]||0)>=3||c.id==='civ_general'),JSON.stringify(R().attend));
    /* 服務學習（一）在週三下午一：這個模擬的玩家週三下午都翹掉——一次都沒去，所以第 15、16 週有補做（也翹掉）、成績單不列（AA_110 6-1）*/
    const svcItems=Object.values(keyMap).filter(it=>it.c.id==='service_1');
    check('服務學習（一）：週三下午都翹掉＝0 次；排了 9 次＋第 15、16 週補做 2 次；成績單不列',(R().attend.service_1||0)===0&&svcItems.length===11&&svcItems.filter(it=>it.week>=15).length===2,svcItems.map(it=>it.week).join(',')); }
  { const g=log.say.filter(s=>/大一上的成績出來了/.test(s)); const d0=dayOf('2026-01-05');
    check('大一上的成績單：只發一次、在學期結束後的第一個早上（2026-01-05）',g.length===1&&g[0].startsWith(d0+':'),g.join(' | '));
    const rep=R().grades.Y1S1||{}; const okv=Object.keys(rep).every(id=>rep[id]===(CLS.attCourse(CLS.byId(id))?((R().attend[id]||0)>=CLS.ATT_PASS?'及格':'不及格'):CLS.gradeOf(R().prep[id]||0)));
    check('成績：法律課照準備次數（≥10 很好、≥5 不錯、其他 過了）；看出席的課照出席三堂（D43）',okv&&Object.keys(rep).length>=5,JSON.stringify(rep)); }
  { const sel=log.say.filter(s=>/選課結果出來了/.test(s)); const d0=dayOf('2026-02-22');
    check('大一下的選課結果：只問一次、在開學前一天（2026-02-22）',sel.length===1&&sel[0].startsWith(d0+':'),sel.join(' | '));
    check('大一下的課表沒有法律與社會（下）（2026-10-14 課程調整刪掉，AA_130）、週二下午沒有課；也沒有那個選修群組',R().electives.Y1S2_ls===undefined&&!CLS.dayItems(G,dayOf('2026-03-03')).some(it=>it.c.id==='law_society_2'||(it.slot&&it.slot.wd===2&&it.slot.block==='pm1')),JSON.stringify(R().electives)); }
  { const ex=log.toast.filter(s=>/考週開始了/.test(s)).map(s=>s.split(':')[0]);
    check('期中、期末考週的提醒：大一上各一次（共兩次）',ex.length===2,ex.join(',')); }
  { const st=log.toast.filter(s=>/開學了/.test(s)); check('「大一下開學了」只提醒一次（2026-02-23）',st.length===1&&st[0].startsWith(dayOf('2026-02-23')+':'),st.join(' | ')); }
  { const grow=sizes.length>=4?(sizes[sizes.length-1]-sizes[0])/(sizes.length-1):0;
    check('課表紀錄（存檔裡的 courses）大小：每週增加 < 4 KB、24 週後 < 120 KB（不會一直長到存不下）',grow<4096&&sizes[sizes.length-1]<120*1024,'第一週 '+sizes[0]+' B → 最後 '+sizes[sizes.length-1]+' B，每週 +'+Math.round(grow)+' B'); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

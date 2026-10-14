// 選課結果（AA_104 第 2 節「新學期第一週開始前一天，出現選課結果：顯示新學期的課表，選修讓玩家二選一」；AA_110 第 4 點）——不需要瀏覽器。
// 2026-10-13：課表資料有選修群組（choice），遊戲裡卻沒有讓玩家選的地方，全部照預設（ChatGPT 審查第七點「選擇不同課程後的玩家流程」測不了）。
// 檢查：選修群組的資料；開學前一天早上（起床時 CLS.morning）出現、預設排第一；選「不修」以後課表、今天的課、跳過時間都沒有那一堂；選「修」照常；
//   兩組二選一（大四上）；開學頭兩週才第一次起床也會問；第三週以後才第一次起床（舊存檔）照預設、不問；同一學期只問一次；跟著存檔；大一上不問。
// 修改前：CLS.selectTerm 不存在、起床時不會問（第 2 段以後都會失敗）。
// 用法：node tests/course_select_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mkG=(day,hour)=>({day,hour,flags:{},weekday:CALENDAR.dateOf(day).wd%7,zone:'dorm'});
/* 起床時的 GM：picks＝每一次選項要選第幾個（照順序）；log 記下說的話、選項、提示 */
function mkGM(G,picks){ const log=[]; let k=0;
  return {G,log,D:{active:false},E:{player:{busy:false}},sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ log.push('say:'+t); },toast:t=>log.push('toast:'+t),
    choose:async o=>{ log.push('choose:'+o.map(q=>q.t+'〔'+(q.hint||'')+'〕').join(' / ')); const i=picks[k++]; return i==null?0:i; },
    fade:async()=>{},advance(hh){ G.hour+=hh; },sleep:async()=>{},caption:(w,t)=>log.push('caption:'+t),autosave(){ log.push('autosave'); },setGoal(){} }; }
const has=(G,term,id)=>CLS.termCourses(G,term).some(c=>c.id===id);
(async()=>{
  // ---------- 1. 資料 ----------
  { const gs=t=>(CLS.choiceGroups?CLS.choiceGroups(t):[]).map(g=>g.group+':'+g.opts.map(c=>c.id).join('|')+(g.none?'|none':'')+'＞'+g.def);
    check('選修群組：大一下「法律與社會（下）」可以不修；大三下勞動法／公平交易法、大四上勞動社會法／財稅法、刑事／公法判決研討各二選一；其他學期沒有',
      JSON.stringify(gs('Y1S2'))===JSON.stringify(['Y1S2_ls:law_society_2|none＞law_society_2'])&&JSON.stringify(gs('Y3S2'))===JSON.stringify(['Y3S2_elec:labor_law|fair_trade＞labor_law'])
      &&gs('Y4S1').length===2&&['Y1S1','Y2S1','Y2S2','Y3S1','Y4S2','Y0S1','Y0S2'].every(t=>!gs(t).length),JSON.stringify(['Y1S2','Y3S2','Y4S1'].map(gs))); }
  // ---------- 2. 大一下：開學前一天（2026-02-22 週日）早上 ----------
  const SUN=dayOf('2026-02-22'), TUE=dayOf('2026-02-24');
  { const G=mkG(SUN,7.5), GM=mkGM(G,[1]); await CLS.morning(GM);
    const ch=GM.log.find(t=>t.startsWith('choose:'))||'';
    check('開學前一天早上起床：「選課結果出來了：大一下」，問法律與社會（下）要不要修（預設「修」排第一，寫時段與教室）',GM.log.includes('say:選課結果出來了：大一下。')&&/^choose:法律與社會（下）〔週二下午一・霖澤館 201〕 \/ 這學期不修法律與社會（下）/.test(ch),GM.log.join(' | '));
    check('選「不修」：大一下的課表沒有法律與社會（下）；重修的經濟學原理（下）照樣在',G.courses.electives.Y1S2_ls==='none'&&!has(G,'Y1S2','law_society_2')&&has(G,'Y1S2','econ_principles_2'),JSON.stringify(G.courses.electives));
    const G2=Object.assign(JSON.parse(JSON.stringify(G)),{day:TUE,hour:8,weekday:2});
    const items=CLS.dayItems(G2).map(it=>CLS.hhmm(it.t0)+' '+it.c.name);
    check('不修：週二只有上午的大一國文（下），下午沒有課',items.length===1&&/大一國文（下）/.test(items[0]),items.join('、'));
    check('不修：手機課表的週二下午一是空的',!/法律與社會（下）/.test(CLS.weekHTML(G2)));
    const GM2=mkGM(G2,[0]); G2.hour=12.5; const r=await CLS.skipTo(GM2,17.5);
    check('不修：週二 12:30 跳到 17:30 不會問「會錯過」（中間沒有課）',r===true&&Math.abs(G2.hour-17.5)<1e-9&&!GM2.log.some(t=>/^choose:照樣跳過/.test(t)),GM2.log.join(' | '));
    const n0=GM.log.length; G.day=SUN+1; G.hour=7.5; G.weekday=1; await CLS.morning(GM);
    check('隔天（開學第一天）不再問，只提醒「大一下開學了」',!GM.log.slice(n0).some(t=>t.startsWith('choose:'))&&GM.log.slice(n0).some(t=>/大一下開學了/.test(t)),GM.log.slice(n0).join(' | '));
    const back=JSON.parse(JSON.stringify(G)); check('跟著存檔（JSON 來回一次，選的課還在）',back.courses.electives.Y1S2_ls==='none'&&!has(back,'Y1S2','law_society_2')); }
  { const G=mkG(SUN,7.5), GM=mkGM(G,[0]); await CLS.morning(GM);
    const G2=Object.assign(G,{day:TUE,hour:12.5,weekday:2}); const items=CLS.dayItems(G2).map(it=>CLS.hhmm(it.t0)+' '+it.c.name);
    check('選「修」：週二 13:20 法律與社會（下）（霖澤館 201）在今天的課',G.courses.electives.Y1S2_ls==='law_society_2'&&items.includes('13:20 法律與社會（下）'),items.join('、'));
    const GM2=mkGM(G2,[1]); const r=await CLS.skipTo(GM2,17.5);
    check('修：週二 12:30 跳到 17:30 先問「會錯過 13:20 法律與社會（下）」',r===false&&GM2.log.some(t=>/^choose:照樣跳過〔會錯過：13:20 法律與社會（下）〕/.test(t)),GM2.log.join(' | ')); }
  // ---------- 2b. 大一下的通識（交接包 v2 第 3 節第 1 週）：接 v1 的選課結果 ----------
  { const G=mkG(SUN,7.5), GM=mkGM(G,[0]); await CLS.morning(GM); const L=GM.log.filter(t=>t.startsWith('say:'));
    check('大一下：v1 選「下學期再選」（或沒遇到）的玩家：「「城市與散步」——備取三。差一點。」「選上的是「天文與我們」。」',L[1]==='say:「城市與散步」——備取三。差一點。'&&L[2]==='say:選上的是「天文與我們」。',L.join(' | '));
    const G2=mkG(SUN,7.5); G2.flags.ge_walk_waitlist=true; const GM2=mkGM(G2,[0]); await CLS.morning(GM2); const L2=GM2.log.filter(t=>t.startsWith('say:'));
    check('大一下：v1 選加簽的玩家：「上學期加簽沒成功的「城市與散步」，這學期——備取三。」',L2[1]==='say:上學期加簽沒成功的「城市與散步」，這學期——備取三。'&&L2[2]==='say:選上的是「天文與我們」。',L2.join(' | '));
    const D=dayOf('2028-09-03'), G3=mkG(D,7.5), GM3=mkGM(G3,[0,0]); await CLS.morning(GM3); check('其他學期沒有這兩句',!GM3.log.some(t=>/城市與散步|天文與我們/.test(t))); }
  { const c=COURSES.list?COURSES.list.find(q=>q.id==='ge_y1s2'):(Array.isArray(COURSES)?COURSES.find(q=>q.id==='ge_y1s2'):Object.values(COURSES).flat().find(q=>q&&q.id==='ge_y1s2'));
    check('大一下的通識課名是「通識：天文與我們」（AA 同意改名；課表、手機都顯示這個名字）',!!c&&c.name==='通識：天文與我們',c&&c.name); }
  // ---------- 3. 大四上：兩組二選一 ----------
  { const T0=CALENDAR.termOf(dayOf('2028-09-04')), D=dayOf('2028-09-03'); const G=mkG(D,7.5), GM=mkGM(G,[1,1]); await CLS.morning(GM);
    const chs=GM.log.filter(t=>t.startsWith('choose:'));
    check('大四上（開學前一天）：問兩次，各兩個選項（預設排第一）',T0&&T0.id==='Y4S1'&&chs.length===2&&chs.every(t=>t.split(' / ').length===2),chs.join(' | '));
    const cs=CLS.termCourses(G,'Y4S1').map(c=>c.id);
    check('都選第二個：財稅法、公法判決研討（萬才館研討室）；沒有勞動社會法、刑事判決研討',cs.includes('tax_law')&&cs.includes('public_judgment_sem')&&!cs.includes('labor_social')&&!cs.includes('crim_judgment_sem'),cs.join(',')); }
  // ---------- 4. 錯過前一天、舊存檔、大一上 ----------
  { const G=mkG(dayOf('2026-02-25'),7.5), GM=mkGM(G,[1]); await CLS.morning(GM);
    check('錯過開學前一天（第一週週三才第一次起床）：照樣問一次',GM.log.some(t=>t.startsWith('choose:'))&&G.courses.electives.Y1S2_ls==='none',GM.log.join(' | ')); }
  { const G=mkG(dayOf('2026-03-10'),7.5), GM=mkGM(G,[1]); await CLS.morning(GM);
    check('第三週以後才第一次起床（舊存檔）：不問、照預設（有修法律與社會（下））',!GM.log.some(t=>t.startsWith('choose:'))&&has(G,'Y1S2','law_society_2')&&G.courses.note.sel_Y1S2===1,GM.log.join(' | '));
    G.day+=1; await CLS.morning(GM); check('之後也不再問',!GM.log.some(t=>t.startsWith('choose:'))); }
  { const G=mkG(3,7.5), GM=mkGM(G,[1]); await CLS.morning(GM);
    check('大一上（第 3 天）：不問（遊戲從第 3 週開始，算已選），法律與社會照常',!GM.log.some(t=>t.startsWith('choose:'))&&has(G,'Y1S1','law_society'),GM.log.join(' | ')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

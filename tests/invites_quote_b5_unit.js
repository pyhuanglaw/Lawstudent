// 有名字說的台詞拿掉「」第五批（TEXT-QUOTE-UNIFY-1108，AA-B 2026-11-08 11:05）——不需要瀏覽器（D131）。第一、二批 tests/invites_quote_unit.js，第三批 _b3，第四批 _b4。
// 規則（同第四批）：在對話框「有名字」說出來的（GM.say(who,…) who 不是 null）拿掉說的話外面那一對「」，別的字一個都不改；
//   選項、沒有名字的（旁白（…）、toast、手機訊息、房間物品 GM.say(null,…)）照留。
// 這一批（第四批列給 AA-B 看、照留的那幾種）：
//   1. 動作在前面的「（動作）「說的話」」→「（動作）說的話」（拿掉裡面那一對，動作照舊在前面）：
//      學姊挽回中的短招呼第一句（src/sis_b13_3d.js S.greetTexts：原本 smallQ 包成「（她點了一下頭。）「早。」」，現在＝稿上的「（她點了一下頭。）早。」）、
//      美國法學院圖書館的閒聊 libTalk 三句（src/data/us_life_events.js）——都放進 SMALLTALK（story3d.js S.smallTalk → talkCharacter 的 GM.say(who,L.say)）＝有名字。
//      第四批碰過的那幾套（SMALLTALK、法律系同學的閒聊與招呼、木曜日、日常失速、公館店員）沒有別的這種句子；別的地方（選項、路人、手機、invites.js「（走出法圖）「……」」…）不在這一批，測試輸出列出來
//   2. 說的話在前、動作在後的「「說的話」（動作）」→「說的話（動作）」（順序照舊）：法律系同學之後的招呼四句（src/data/pool_story_b2.js 1 句、_b3.js 3 句）；
//      pool3d.js sayAny 看整句是不是一對（）（S.narrWhole，第四批）＝這四句照舊是他（她）說的
//   3. src/aa614_3d.js S.L.inv 七句（打工撞到邀約、改時間的回覆：S.invRule 回的 lines → invites3d.js S.playLines(GM,who,…)）＝有名字，拿掉外面的「」
//   4. 經濟系同學在社科圖（src/data/econfr_soclib.js；src/econsl3d.js GM.say(who,…)）：自我介紹 4、閒聊 23、本人說的招呼 2＝29 句拿掉外面的「」；
//      旁白（narr、greetAll、整句在（）裡的招呼 8 句）照留；econsl3d.js 的 sayAny 看開頭的（——本人說的那兩句拿掉「」以後開頭不是（，照舊是本人說的
// 說過了的記號（存檔）：SMALLTALK 記句子本身（G.social.small[id] 的 used、last、once）、經濟系同學記在 G.flags.ECON_SL[id].once（key＝句子）——
//   STORY.smallQuoteMigrate（game3d.js migrate）加：動作在前面的（S.smallActUnq）、ECON_SL（只換這個人 talk 表上的句子）。改時間的回覆、pool 的招呼不用句子當記號
//   （invites3d.js 記 S.lineKey＝本來就拿掉外面的「」再比；pool 的 greet 記輪到第幾句 r.g），不用換
// 檢查（BASE＝91320de2b，第五批以前的開發分支 head）：
//   21. 分類：每一套有名字說的沒有「」包著說的話（三種寫法都沒有）、沒名字的照留；第四批那幾個檔沒有剩下這兩種寫法；
//       別的地方剩下的（第六批做完以後）＝照留的 16 個（大一女舍門口沒名字、路人分科系拆開播、選項）
//   22. 資料和 BASE 逐句比：改到的都是上面三種之一、改了幾句、其他欄位（when、條件、旁白、選項）一字不差
//   23. 原始碼逐行比（第五批那一個 commit 本身：commit 以前比 BASE 和現在的檔）：資料檔字串以外一字不差、每個檔改幾行幾個字串；程式只改了這幾處；只動了這幾個 src 檔
//   24. 演出來（另開 node，一次用 BASE 的檔、一次用現在的檔；index.html 全部載入）：學姊挽回中的短招呼、法學院圖書館的閒聊、法律系同學的閒聊與招呼、
//       改時間的回覆七句、經濟系同學在社科圖（沒玩前傳、玩過前傳、阿勳在別處）——每一句說的人和 BASE 一樣、字只差這一批的那一對「」、有名字的沒有一句還被「」包著
//   25. 舊存檔：BASE 的程式先聊幾天存起來，現在的程式讀檔（smallQuoteMigrate）接著聊——和 BASE 一路聊下去一樣；不換的話會不一樣（重說）；換記號的規則逐項（對不到的照留、換兩次一樣）
//   26. 讀這些句子的程式沒動（說的人那個參數、旁白／說的話怎麼分）
// 修改前（BASE 的 src 檔換回來跑）：見 commit 訊息。用法：node tests/invites_quote_b5_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..'), BASE='91320de2b', TITLE='有名字說的台詞拿掉外面的「」第五批';
const CHANGED=['src/data/us_life_events.js','src/sis_b13_3d.js','src/data/sis_b13_events.js','src/data/pool_story_b2.js','src/data/pool_story_b3.js','src/aa614_3d.js',
  'src/data/econfr_soclib.js','src/econsl3d.js','src/story3d.js','src/game3d.js'];
const gitShow=(r,f)=>cp.execFileSync('git',['-C',ROOT,'show',r+':'+f],{encoding:'utf8',maxBuffer:1<<28});
const cur=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
/* 外面整句一對「」（「A」「B」這種好幾段的不算）——和 src/invites3d.js 的 S.unq、story3d.js S.smallUnq 同一把尺 */
const wrapped=t=>{ if(typeof t!=='string'||t.length<2||t[0]!=='「'||t[t.length-1]!=='」') return false; let d=0; for(let i=0;i<t.length;i++){ const c=t[i]; if(c==='「') d++; else if(c==='」'){ d--; if(d===0&&i!==t.length-1) return false; } } return d===0; };
const unq=t=>wrapped(t)?t.slice(1,-1):t;
/* 開頭一對（…）結束的位置（沒有＝-1）；整句一對（）＝旁白 */
const parEnd=t=>{ if(typeof t!=='string'||t[0]!=='（') return -1; let d=0; for(let i=0;i<t.length;i++){ const c=t[i]; if(c==='（') d++; else if(c==='）'){ d--; if(d===0) return i; } } return -1; };
const isNarr=t=>typeof t==='string'&&t.length>1&&parEnd(t)===t.length-1;
/* 第五批的兩種寫法：（動作）「說的話」→（動作）說的話；「說的話」（動作）→說的話（動作） */
const actQ=t=>{ const k=parEnd(t); return k>=0&&k<t.length-1&&wrapped(t.slice(k+1)); };
const actUnq=t=>actQ(t)?t.slice(0,parEnd(t)+1)+unq(t.slice(parEnd(t)+1)):t;
const qEnd=t=>{ if(typeof t!=='string'||t[0]!=='「') return -1; let d=0; for(let i=0;i<t.length;i++){ const c=t[i]; if(c==='「') d++; else if(c==='」'){ d--; if(d===0) return i; } } return -1; };
const sayQ=t=>{ const k=qEnd(t); return k>0&&k<t.length-1&&isNarr(t.slice(k+1)); };
const sayUnq=t=>sayQ(t)?t.slice(1,qEnd(t))+t.slice(qEnd(t)+1):t;
const quoted=t=>wrapped(t)||actQ(t)||sayQ(t);   /* 說的話還被一對「」包著（三種寫法任一種）*/
const step=t=>wrapped(t)?unq(t):(actQ(t)?actUnq(t):(sayQ(t)?sayUnq(t):t));   /* BASE 的一句 → 這一批以後應該是的字 */
const kindOf=(a,b)=>a===b?'same':(wrapped(a)&&unq(a)===b?'unq':(actQ(a)&&actUnq(a)===b?'act':(sayQ(a)&&sayUnq(a)===b?'say':null)));
const noComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');
const blankComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,''));   /* 註解拿掉（換行留著）*/
const LIT=/'((?:[^'\\\n]|\\.)*)'/g;
const ECON_IDS=['econ_pinyu','econ_zhengxun','econ_tangrui','econ_weilun'];

if(process.env.QUOTE_B5_PROBE) (async()=>{
  /* ===================== 演出來（子程序）：QUOTE_B5_PROBE=old 讀 BASE 的 CHANGED，=new 讀現在的；index.html 的 src 全部載入（同 tests/econ_soclib_1030_unit.js）===================== */
  const mode=process.env.QUOTE_B5_PROBE;
  if(mode==='old'){ const OLD={}; for(const f of CHANGED) OLD[path.join(ROOT,f)]=gitShow(BASE,f); const real=fs.readFileSync;
    fs.readFileSync=function(p){ if(typeof p==='string'){ const k=path.resolve(p); if(OLD[k]!=null) return OLD[k]; } return real.apply(fs,arguments); }; }
  const IN=mode==='new'?JSON.parse(fs.readFileSync(0,'utf8')||'{}'):{};
  const out={errs:[]};
  console.warn=()=>{}; console.log=()=>{};
  /* 亂數固定（BASE、現在、讀檔前後都從同一個種子開始）：每一段開頭 seed() */
  let SEED=1; const seed=v=>{ SEED=(v>>>0)||1; }; Math.random=()=>{ SEED=(Math.imul(SEED,1664525)+1013904223)>>>0; return SEED/4294967296; };
  const H=require('./pg_harness.js'); const {GM,E}=H;
  const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{}});
  global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
  global.CHAR=Object.assign(global.CHAR||{},{build:()=>mkObj(),setExpr(){}});
  const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
    'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
    'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
  const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  for(const f of [...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f))){
    try{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ out.errs.push('載入 '+f+'：'+String(e&&e.message||e).slice(0,160)); } }
  GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.D=GM.D||{}; GM.D.busyDepth=0;
  if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};
  const keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7, TD=(t,w,wd)=>STORY.termDayIn?STORY.termDayIn(t,w,wd):STORY.termDay(t,w,wd), DK=k=>STORY.dayOfKey(k);
  const P=(k,a)=>{ out[k]=(out[k]||[]).concat(a); };
  const rec=()=>H.said.map(s=>[s.who,s.t]);
  const sec=async(k,f)=>{ seed(k.length*7919); try{ await f(); }catch(e){ out.errs.push(k+'：'+String(e&&e.stack||e).split('\n').slice(0,3).join(' / ').slice(0,400)); } };
  const settle=async()=>{ for(let i=0;i<200&&(EVENTS.running||(GM.D&&GM.D.busyDepth>0));i++) await new Promise(r=>setTimeout(r,0)); await new Promise(r=>setTimeout(r,0)); };
  const setDay=(G,d,h,zone)=>{ H.at(keyOf(d),h); if(zone) G.zone=zone; };
  const bindAll=()=>{ SOCIAL.bind(H.G); EVENTS.bind(GM); INV.rec(H.G); STORY._bindGM(GM); if(typeof POOL!=='undefined'&&POOL.bind) POOL.bind(GM); };
  const prep=G=>{ G.outings=G.outings||[]; G.acts=G.acts||{att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=G.invites||[]; G.goal=G.goal||''; PHONE.rec(G);
    E.player.busy=false; E.paused=false; E.player.lv=0; E.player.seat=null; E.npcs.length=0; GM.npc={}; ADV.active=false; STORY._bindGM(GM); return G; };
  const who=id=>({name:SOCIAL.displayName(id),charId:id});
  const S5='heroine_05';
  /* 閒聊（SMALLTALK）一次：照 talkCharacter 的寫法——say＝GM.say(who,…)、narr＝GM.say(null,…) */
  const small=id=>{ const L=STORY.smallTalk(H.G,id); return L.say?[[who(id).name,L.say]]:[[null,L.narr]]; };
  /* 美國路線：kind＝'ex'（交往過、分開了＝挽回中）／'dating' */
  const us=(key,h,kind,zone)=>{ const G=H.fresh(key,h,zone||'us_lawlib',{EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:DK('2028-08-02'),US1:'alone',met_sis:true,SIS_W1:true,introDone:true,afternoonDone:true,classDone:true});
    prep(G); H.FRIEND(S5); H.date(S5); if(kind==='ex') ROM.end(G,S5,'test'); return G; };
  const weekdays=(from,n)=>{ const L=[]; for(let d=DK(from);L.length<n;d++){ const w=wdOf(d); if(w>=1&&w<=5) L.push(d); } return L; };
  /* SMALLTALK 全部（各檔推進來的都在）*/
  out.st={}; for(const id of Object.keys(SMALLTALK)) out.st[id]=(SMALLTALK[id]||[]).map(e=>typeof e==='string'?e:e&&e.t);
  if(typeof SISB13!=='undefined'&&SISB13.greetTexts) out.sisGreet=SISB13.greetTexts();
  if(typeof POOL!=='undefined'&&POOL.narrWhole){ const G4=[]; for(const id of Object.keys(POOL.LINES)) for(const g of ((POOL.LINES[id]&&POOL.LINES[id].greet)||[])) G4.push([id,g,POOL.narrWhole(g)]); out.poolGreet=G4; }
  /* ---------- 24a 學姊挽回中的短招呼、法學院圖書館的閒聊（SMALLTALK）---------- */
  await sec('us',async()=>{ us('2028-10-02',10,'ex'); for(const d of weekdays('2028-10-02',6)){ setDay(H.G,d,10,'us_lawlib'); P('us',small(S5).map(x=>['ex',keyOf(d)].concat(x))); }
    us('2028-09-11',10,'dating'); for(const d of weekdays('2028-09-11',10)){ setDay(H.G,d,10,'us_lawlib'); P('us',small(S5).map(x=>['dating',keyOf(d)].concat(x))); } });
  /* ---------- 24b 法律系同學（pool3d.js 的閒聊、之後的招呼）：每學期第 1 週起每天一次（同第四批）---------- */
  const POOLIDS=typeof POOL!=='undefined'?Object.keys(POOL.LINES).filter(id=>POOL.LINES[id]&&(POOL.LINES[id].talk||[]).length):[];
  await sec('pool',async()=>{ for(const id of POOLIDS){ for(const t of ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2']){ const d0=TD(t,1,1); if(d0==null) continue; H.fresh(keyOf(d0),12.5,'campus',{afternoonDone:true}); bindAll(); H.FAMILIAR(id);
      for(let k=0;k<45;k++){ setDay(H.G,d0+k,12.5,'campus'); H.said=[]; await POOL.smallTalk(GM,who(id),id); P('pool',rec().map(x=>[id,t+'+'+k].concat(x))); } } } });
  /* ---------- 24c 改時間的回覆（aa614_3d.js S.invRule → invites3d.js S.playLines(GM,who,…)；邀約的設定同 tests/aa614_jobs_unit.js 第 2 節）---------- */
  await sec('inv',async()=>{ const MX='classmate_mingxuan', PS='classmate_peishan', KAI='kai', YT='heroine_03', YU='yu';
    const SC=[['mx',MX,TD('Y1S1',6,2),'wenzhou',19.5],['ps',PS,TD('Y1S1',6,3),'wenzhou',18.5],['kai',KAI,TD('Y1S1',6,6),'wenzhou',14],['ytOff',YT,TD('Y1S1',6,6),'wenzhou',14],
      ['ytBoth',YT,TD('Y1S1',6,7),'cafe',15.5,true],['yu',YU,TD('Y1S1',6,5),'wenzhou',19],['yuSat',YU,TD('Y1S1',6,6),'wenzhou',19]];
    for(const [k,id,d,pid,h,tea] of SC){ const G=H.fresh(keyOf(d),10,'dorm',{}); prep(G); H.FRIEND(id); G.contacts[id]=1; const P0=INV.place(pid);
      const m0=AA614.meTea; if(tea) AA614.meTea=()=>true; let r; try{ r=INV.personal(G,id,P0,d,h,INV.decide(G,id,pid,d,h)); }finally{ AA614.meTea=m0; }
      H.said=[]; if(r&&r.lines) await INV.playLines(GM,who(id),r.lines,r); P('inv',rec().map(x=>[k,r&&r.res,r&&r.why||null].concat(x))); } });
  /* ---------- 24d 經濟系同學在社科圖（CANON-NO-ECON-1112 第三批：這一項拿掉） ---------- */
  /* ---------- 25 舊存檔：old＝BASE 的程式先聊、存起來、再一路聊下去；new＝讀那個存檔（換記號／不換）接著聊 ---------- */
  const MIG={
    /* econ（CANON-NO-ECON-1112 第三批：這一項拿掉） */
    ex:{start:()=>us('2028-10-02',10,'ex'),days:()=>weekdays('2028-10-02',8),cut:2,run:async d=>{ setDay(H.G,d,10,'us_lawlib'); return small(S5).map(x=>[keyOf(d)].concat(x)); }},
    dating:{start:()=>us('2028-09-11',10,'dating'),days:()=>weekdays('2028-09-11',12),cut:3,run:async d=>{ setDay(H.G,d,10,'us_lawlib'); return small(S5).map(x=>[keyOf(d)].concat(x)); }} };
  await sec('mig',async()=>{ out.mig={};
    for(const k of Object.keys(MIG)){ const M=MIG[k], days=M.days(), R={};
      if(mode==='old'){ seed(11); M.start(); for(const d of days.slice(0,M.cut)) await M.run(d); R.snap=JSON.stringify(H.G); seed(13); R.next=[]; for(const d of days.slice(M.cut)) R.next.push(...(await M.run(d))); }
      else if(IN.mig&&IN.mig[k]){ for(const doMig of [true,false]){ H.G=JSON.parse(IN.mig[k]); bindAll(); prep(H.G); let n=null; if(doMig) n=STORY.smallQuoteMigrate?STORY.smallQuoteMigrate(H.G):null;
          seed(13); const L=[]; for(const d of days.slice(M.cut)) L.push(...(await M.run(d))); if(doMig){ R.n=n; R.next=L; R.small=H.G.social&&H.G.social.small&&H.G.social.small[S5]||null; } else R.noFix=L; } }
      out.mig[k]=R; } });
  /* ---------- 25 換記號的規則（只有 new）---------- */
  if(mode==='new') await sec('unit',async()=>{ const S=()=>({social:{small:{[S5]:{day:3,
        used:['（她點了一下頭。）「早。」','（她小聲）「三明治店十二點人很多。你先去占位子。」','__greet','（她小聲）「不在表上的句子。」','「A」「B」'],
        last:'（她指了一下桌上的紙杯）「圖書館的咖啡機又壞了。這杯是外面買的。」',
        once:{'（她點了一下頭。）「早。」':true,'「這邊的咖啡很淡。我開始喝茶了。」':true,'（她點了一下頭。）早。':true}}}}});   /* flags.ECON_SL（CANON-NO-ECON-1112 第三批：這一項拿掉） */
    const s=S(), n1=STORY.smallQuoteMigrate(s), j1=JSON.stringify(s), n2=STORY.smallQuoteMigrate(s), j2=JSON.stringify(s);
    const s2={social:{},flags:{}}, n3=STORY.smallQuoteMigrate(s2);   /* ECON_SL（CANON-NO-ECON-1112 第三批：這一項拿掉） */
    let thrown=[]; for(const x of [null,undefined,{},{social:null},{social:{small:null},flags:null},{flags:{ECON_SL:[]}},{flags:{ECON_SL:'x'}}]){ try{ STORY.smallQuoteMigrate(x); }catch(e){ thrown.push(String(e)); } }
    out.unit={n1,n2,s:JSON.parse(j1),same:j1===j2,n3,s2,thrown}; });
  process.stdout.write('@@B5@@'+JSON.stringify(out)+'\n',()=>process.exit(0));
})().catch(e=>{ process.stdout.write('@@B5@@'+JSON.stringify({errs:['例外：'+String(e&&e.stack||e).slice(0,600)]})+'\n',()=>process.exit(0)); });
else main();

/* ===================== 主程式 ===================== */
function main(){
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, sample=L=>L.slice(0,6).join('／')+(L.length>6?'…（共 '+L.length+'）':'');
const lits=s=>{ const t=noComments(s), o=[]; let m; LIT.lastIndex=0; while((m=LIT.exec(t))) o.push(m[1]); return o; };
const loadData=(files,names,rd)=>{ const c=vm.createContext({console}); c.globalThis=c; for(const f of files) vm.runInContext(rd(f).replace(/^const (\w+)\s*=/mg,(m,n)=>names.test(n)?'globalThis.'+n+'=':m),c,{filename:f}); return c; };
const rdBase=f=>gitShow(BASE,f);
const POOL_FILES=['src/data/pool_story.js','src/data/pool_story_b2.js','src/data/pool_story_b3.js','src/data/pool_story_b4.js'], PSK=['POOL_STORY','POOL_STORY_B2','POOL_STORY_B3','POOL_STORY_B4'];
const PSN=/^(POOL_STORY|POOL_STORY_B2|POOL_STORY_B3|POOL_STORY_B4)$/;
const PS={old:loadData(POOL_FILES,PSN,rdBase),now:loadData(POOL_FILES,PSN,cur)};
/* EC（econfr_soclib.js）（CANON-NO-ECON-1112 第三批：這一項拿掉） */
const arr=(src,re)=>{ const m=re.exec(noComments(src)); return m?vm.runInNewContext('('+m[1]+')'):null; };
const LIB={old:arr(rdBase('src/data/us_life_events.js'),/libTalk:(\[[^\]]*\])/),now:arr(cur('src/data/us_life_events.js'),/libTalk:(\[[^\]]*\])/)};
const INVL={old:arr(rdBase('src/aa614_3d.js'),/\binv:(\{[^}]*\})/),now:arr(cur('src/aa614_3d.js'),/\binv:(\{[^}]*\})/)};
const REPAIR={old:arr(rdBase('src/data/sis_b13_events.js'),/repairGreet:(\[[^\]]*\])/),now:arr(cur('src/data/sis_b13_events.js'),/repairGreet:(\[[^\]]*\])/)};
/* sis_b13_3d.js 的 S.greetTexts（BASE：smallQ 包「」；現在：稿上的字）——照原始碼那幾行算 */
const greetTexts=(src,L)=>{ const s=noComments(src), q=/const smallQ=t=>\{[^\n]*\};/.exec(s), g=/S\.greetTexts=\(\)=>([^\n;]*);/.exec(s); if(!g) return null; return vm.runInNewContext('(function(L){ '+(q?q[0]:'')+' return ('+g[1]+'); })')({repairGreet:L}); };
const GT={old:greetTexts(rdBase('src/sis_b13_3d.js'),REPAIR.old),now:greetTexts(cur('src/sis_b13_3d.js'),REPAIR.now)};
const poolGreets=C=>{ const o=[]; for(const k of PSK){ const LN=(C[k]||{}).LINES||{}; for(const id of Object.keys(LN)) for(const g of (LN[id].greet||[])) o.push([k,id,g]); } return o; };
/* econNamed（CANON-NO-ECON-1112 第三批：這一項拿掉） */

/* ---------- 演出來（BASE、現在各跑一次）---------- */
const runProbe=(m,input)=>{ let o=''; try{ o=cp.execFileSync(process.execPath,[__filename],{env:Object.assign({},process.env,{QUOTE_B5_PROBE:m}),encoding:'utf8',maxBuffer:1<<29,input:input||'',stdio:['pipe','pipe','pipe']}); }catch(e){ o=String(e.stdout||''); }
  const line=o.split('\n').find(l=>l.startsWith('@@B5@@')); return line?JSON.parse(line.slice(6)):{errs:['子程序沒有結果：'+o.slice(-300)]}; };
const O=runProbe('old'), migIn={}; for(const k of Object.keys((O.mig||{}))) if(O.mig[k]&&O.mig[k].snap) migIn[k]=O.mig[k].snap;
const N=runProbe('new',J({mig:migIn}));

/* ---------- 21. 分類 ---------- */
{ const st=N.st||{}, all=[]; for(const id of Object.keys(st)) for(const t of st[id]) all.push([id,t]);
  const bad=all.filter(([id,t])=>quoted(t));
  check('21. SMALLTALK（events.js＋各檔推進來的，'+all.length+' 句；閒聊＝GM.say(who,…) 有名字）沒有一句還被「」包著（整句、（動作）「…」、「…」（動作）都沒有）',all.length>=150&&bad.length===0,sample(bad.map(x=>x.join(':'))));
  const h5=st.heroine_05||[];
  check('21. 學姊挽回中的短招呼（sis_b13_3d.js S.greetTexts）＝稿上的三句（sis_b13_events.js repairGreet）一字不差，動作在前面的「（她點了一下頭。）早。」；都在 SMALLTALK.heroine_05',
    J(N.sisGreet)===J(REPAIR.now)&&J(GT.now)===J(REPAIR.now)&&REPAIR.now[0]==='（她點了一下頭。）早。'&&REPAIR.now.every(t=>h5.includes(t)),J([N.sisGreet,GT.now]));
  check('21. 法學院圖書館的閒聊 libTalk 三句：動作在前面、說的話沒有「」（「（她小聲）三明治店十二點人很多。你先去占位子。」）；都在 SMALLTALK.heroine_05',
    !!LIB.now&&LIB.now.length===3&&LIB.now.every(t=>parEnd(t)>0&&parEnd(t)<t.length-1&&!/[「」]/.test(t.slice(parEnd(t)+1)))&&LIB.now.includes('（她小聲）三明治店十二點人很多。你先去占位子。')&&LIB.now.every(t=>h5.includes(t)),J(LIB.now));
  const pg=poolGreets(PS.now), sp=pg.filter(x=>!isNarr(x[2])), narr=pg.filter(x=>isNarr(x[2]));
  check('21. 法律系同學之後的招呼：本人說的 '+sp.length+' 句沒有一句還被「」包著；整句旁白 '+narr.length+' 句照留',sp.length>=36&&narr.length===20&&!sp.some(x=>quoted(x[2])),sample(sp.filter(x=>quoted(x[2])).map(x=>x[2])));
  const FOUR=['……嗯。（他點頭，比你預期的大聲一點。）','先吃再說！（塞給你一顆糖）','再一次。（她說的是手上的和弦，不是對你）','我先走了！（他還沒停下來）'];
  const NW=N.poolGreet||[];
  check('21. 說的話在前、動作在後的四句＝「……嗯。（他點頭，比你預期的大聲一點。）」「先吃再說！（塞給你一顆糖）」「再一次。（她說的是手上的和弦，不是對你）」「我先走了！（他還沒停下來）」；pool3d.js S.narrWhole＝不是旁白（他說的）',
    FOUR.every(t=>sp.some(x=>x[2]===t))&&FOUR.every(t=>NW.some(x=>x[1]===t&&x[2]===false))&&NW.length===pg.length&&NW.every(x=>x[2]===isNarr(x[1])),J(NW.filter(x=>FOUR.includes(x[1]))));
  const iv=INVL.now||{}, ik=Object.keys(iv);
  check('21. aa614_3d.js S.L.inv（改時間的回覆，'+ik.length+' 句：'+ik.join('、')+'）沒有外面的「」',J(ik)===J(['mx','ps','kai','ytBoth','ytOff','yu','yuSat'])&&ik.every(k=>typeof iv[k]==='string'&&!quoted(iv[k])&&!/^[「」]|[「」]$/.test(iv[k])),J(iv));
  /* 經濟系同學在社科圖那一項（CANON-NO-ECON-1112 第三批：這一項拿掉） */
  /* 第四批碰過的那幾套、這一批的檔：字串常值沒有剩下（動作）「…」、「…」（動作）這兩種寫法 */
  const SYS=['src/data/pool_story.js','src/data/pool_story_b2.js','src/data/pool_story_b3.js','src/data/pool_story_b4.js','src/data/econfr_soclib.js','src/aa614_3d.js','src/sis_b13_3d.js','src/data/sis_b13_events.js',
    'src/data/us_life_events.js','src/mokuyobi_sys3d.js','src/offbeat_sys3d.js','src/ggshops_sys3d.js','src/gg2shops3d.js','src/sup519_3d.js','src/data/aa519_lines.js'];
  const left=[]; for(const f of SYS) if(fs.existsSync(path.join(ROOT,f))) for(const t of lits(cur(f))) if(actQ(t)||sayQ(t)) left.push(f+'：'+t);
  check('21. 第四、五批那幾套的檔（pool、經濟系同學、aa614、學姊第十三批、美國生活、木曜日、日常失速、公館店員、SMALL_DAILY）沒有剩下（動作）「…」、「…」（動作）的字串',left.length===0,sample(left));
  /* 別的地方還有的（不在這一批：選項、路人、手機、invites.js、課堂…）——第五批列給 AA-B 看；第六批（TEXT-QUOTE-UNIFY-1108 最後一批，tests/invites_quote_b6_unit.js）做完有名字的九句以後，
     剩下的就是照留的這 16 個：大一女舍門口四句（沒名字：S.overhear＝GM.say(null,…)）、路人分科系五句（CROWD.deptSteps 拆開播，說的話本來就不帶「」）、選項七個（choice 的 text）*/
  const KNOWN_LEFT=['crowd3d.js：（一個女生拖著兩個行李箱，在門口打電話）「媽，我到了。……沒有電梯啦，我爬上來的。五樓。」','crowd3d.js：（提著兩袋宵夜的人）「鹹酥雞到了，誰下來拿？」','crowd3d.js：（在門口講電話）「沒有啦，我只是想打給你。」','crowd3d.js：（抱著一疊書的人）「總圖還有位子嗎？……那我去社科圖。」',
    'data/crowd_depts.js：（他邊走邊講電話）「板子放在你桌上了。……那顆電容是新的，這次不要再燒掉。」','data/crowd_depts.js：（他盯著手機）「又錯一筆測資。……到底是哪一筆。」','data/crowd_depts.js：（她講電話）「阿嬤那邊我禮拜四再去一次。她上次說要教我摺紙鶴。」','data/crowd_depts.js：（她在柱子上貼傳單：「徵求受試者，心理系實驗」。）「……膠帶又用完了。」','data/crowd_depts.js：（他對著一棵樹念台詞）「……你為什麼不早說？——不對，這一句要更小聲。」',
    // CANON-NO-ECON-1112：經濟系那一年拿掉（照留清單裡「（繼續演品妤）「你想說什麼？」」是經濟系那一年事件的選項，拿掉（清單 16→15））
    'data/events.js：「謝謝學姊。」（拿了書狀就走）','data/events.js：（替她答）「她想知道法律外面還有什麼。」','data/r2y4a_events.js：（再問一次）「妳還好嗎？」','data/r2y4a_events.js：（指著法律系館B）「先記得這棟就好。」','data/r2y4a_events.js：（收下）「謝謝阿嬤。」','y2r2_3d.js：（裝不知道）「恭喜！」',
    /* （CANON-NO-ECON-1112 第四批：AA_876 D3 的選項字（祐廷的選項，動作＋說的話；選項照留那一類）一個）*/
    'kxdrift3d.js：（把書蓋起來）「我在聽，妳講。」'];
  const others=[]; (function walk(d){ for(const f of fs.readdirSync(path.join(ROOT,d))){ const p=d+'/'+f; if(fs.statSync(path.join(ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)&&!SYS.includes(p)) for(const t of lits(cur(p))) if(actQ(t)||sayQ(t)) others.push(p+'：'+t); } })('src');
  console.log('（21. 不在這一批、還有（動作）「…」或「…」（動作）的字串 '+others.length+' 個：'+others.map(x=>x.replace(/^src\//,'')).join('／')+'）');
  const OL=others.map(x=>x.replace(/^src\//,'')).sort(), KL=KNOWN_LEFT.slice().sort();
  check('21. 不在這一批、還有（動作）「…」或「…」（動作）的字串（第六批做完以後）＝照留的 '+KL.length+' 個（大一女舍門口沒名字 4、路人分科系拆開播 5、選項 7），一個不多一個不少',J(OL)===J(KL),sample(OL.filter(x=>!KL.includes(x)).concat(KL.filter(x=>!OL.includes(x)).map(x=>'少了 '+x)))); }

/* ---------- 22. 資料和 BASE 逐句比 ---------- */
{ const chg=(a,b,want)=>{ const bad=[]; let n=0; if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length) return {n:-1,bad:['句數不同']}; a.forEach((x,i)=>{ const k=kindOf(x,b[i]); if(k==='same') return; if(k===want) n++; else bad.push(x+' → '+b[i]); }); return {n,bad}; };
  let r=chg(LIB.old,LIB.now,'act');
  check('22. libTalk 和 '+BASE+' 逐句比：三句都是（動作）「說的話」→（動作）說的話',r.n===3&&!r.bad.length&&LIB.old.every(actQ),sample(r.bad));
  r=chg(GT.old,GT.now,'act');
  check('22. 學姊挽回中的短招呼（S.greetTexts）和 '+BASE+' 比：第一句「（她點了一下頭。）「早。」」→「（她點了一下頭。）早。」，另外兩句一樣（第四批已經拿掉）；稿 repairGreet 一字不差',
    r.n===1&&!r.bad.length&&!!GT.old&&GT.old[0]==='（她點了一下頭。）「早。」'&&GT.old[1]===GT.now[1]&&GT.old[2]===GT.now[2]&&J(REPAIR.old)===J(REPAIR.now),J([GT.old,GT.now]));
  /* pool：整份資料比，改到的只能是 greet 裡「「…」（…）」→「…（…）」 */
  const bad=[], hit=[], A799=require('./aa799_expect.js'); const walk=(a,b,p)=>{ if(typeof a==='string'||typeof b==='string'){ if(a===b||A799.isAA799(a,b)) return;   /* AA_799（X324 G 區）pool secret「其實……」12 句照稿換了 */ if(typeof a==='string'&&typeof b==='string'&&kindOf(a,b)==='say'&&/\.greet\.\d+$/.test(p)) hit.push(p+'：'+b); else bad.push(p+'：'+J(a)+' → '+J(b)); return; }
    if(typeof a==='function'||typeof b==='function'){ if(String(a)!==String(b)) bad.push(p+'：函式不同'); return; }
    if(a===null||b===null||typeof a!=='object'||typeof b!=='object'){ if(a!==b) bad.push(p+'：'+J(a)+' → '+J(b)); return; }
    const ka=Object.keys(a), kb=Object.keys(b); if(J(ka)!==J(kb)){ bad.push(p+'：欄位不同'); return; } for(const k of ka) walk(a[k],b[k],p+'.'+k); };
  for(const k of PSK) walk(PS.old[k],PS.now[k],k);
  check('22. pool 的資料（四個檔）和 '+BASE+' 比：只改了 '+hit.length+' 句之後的招呼（「說的話」（動作）→說的話（動作）），其他（閒聊、旁白、選項、場景、條件）一字不差',hit.length===4&&!bad.length,sample(bad)+'｜'+sample(hit));
  const io=INVL.old||{}, inw=INVL.now||{}, ib=[]; let ni=0; for(const k of Object.keys(io)){ const t=kindOf(io[k],inw[k]); if(t==='unq') ni++; else ib.push(k+'：'+io[k]+' → '+inw[k]); }
  check('22. aa614_3d.js S.L.inv 和 '+BASE+' 比：七句都只拿掉外面的「」（欄位一樣）',ni===7&&!ib.length&&J(Object.keys(io))===J(Object.keys(inw)),sample(ib));
  /* econfr_soclib.js 和 BASE 比（CANON-NO-ECON-1112 第三批：這一項拿掉） */
  /* SMALLTALK（index.html 全部載入以後）和 BASE 比 */
  const so=O.st||{}, sn=N.st||{}, sb=[], sh=[]; for(const id of Object.keys(sn)){ const a=so[id]||[], b=sn[id]; if(a.length!==b.length){ sb.push(id+'：句數 '+a.length+' → '+b.length); continue; } a.forEach((x,i)=>{ const k=kindOf(x,b[i]); if(k==='same') return; if(k==='act') sh.push(id+'：'+b[i]); else sb.push(id+'：'+x+' → '+b[i]); }); }
  check('22. SMALLTALK（全部載入以後）和 '+BASE+' 比：只改了學姊的 '+sh.length+' 句（（動作）「…」→（動作）…：挽回中的短招呼一句、libTalk 三句），其他一字不差、順序一樣',
    sh.length===4&&sh.every(x=>/^heroine_05：/.test(x))&&!sb.length&&J(Object.keys(so).sort())===J(Object.keys(sn).sort()),sample(sb)+'｜'+sample(sh)); }

/* ---------- 23. 原始碼逐行比（這一個 commit 本身）---------- */
const findC5=()=>{ try{ const L=cp.execFileSync('git',['-C',ROOT,'log','--format=%H %s','-F','--grep='+TITLE],{encoding:'utf8',maxBuffer:1<<26}).split('\n'); const x=L.find(l=>l.slice(41).startsWith(TITLE)); return x?x.slice(0,40):null; }catch(e){ return null; } };   /* 標題開頭是 TITLE 的那一個 commit；找不到（commit 以前）＝比 BASE 和現在的檔 */
{ const C5=findC5(), A_=f=>C5?gitShow(C5+'^',f):gitShow(BASE,f), B_=f=>C5?gitShow(C5,f):cur(f);
  console.log('（23. 比的是 '+(C5?'第五批那一個 commit '+C5.slice(0,9)+'^ → '+C5.slice(0,9):'commit 以前：'+BASE+' → 現在的檔')+'）');
  const files=(C5?cp.execFileSync('git',['-C',ROOT,'diff','--name-only',C5+'^',C5,'--','src'],{encoding:'utf8'}):cp.execFileSync('git',['-C',ROOT,'diff','--name-only',BASE,'--','src'],{encoding:'utf8'})).split('\n').filter(Boolean).sort();
  check('23. 改到的 src 檔就是這 '+CHANGED.length+' 個',J(files)===J(CHANGED.slice().sort()),J(files));
  const split=l=>{ const code=[], lit=[]; let last=0, m; LIT.lastIndex=0; while((m=LIT.exec(l))){ code.push(l.slice(last,m.index)); lit.push(m[1]); last=m.index+m[0].length; } code.push(l.slice(last).replace(/\s+$/,'')); return {code,lit}; };
  const nonBlank=s=>blankComments(s).split('\n').filter(l=>l.trim());
  /* 資料檔：改到的那一行，字串以外一字不差；改到的字串都是這個檔那一種寫法 */
  const WANT={'src/data/us_life_events.js':['act',1,3],'src/data/pool_story_b2.js':['say',1,1],'src/data/pool_story_b3.js':['say',3,3],'src/aa614_3d.js':['unq',2,7],'src/data/econfr_soclib.js':['unq',29,29]};
  const per={}, bad=[];
  for(const f of Object.keys(WANT)){ const A=nonBlank(A_(f)), B=nonBlank(B_(f)); if(A.length!==B.length){ bad.push(f+'：註解以外的行數不同 '+A.length+' → '+B.length); continue; }
    let nl=0, nt=0; A.forEach((a,i)=>{ const b=B[i]; if(a===b) return; nl++; const x=split(a), y=split(b);
      if(J(x.code)!==J(y.code)){ bad.push(f+'：「'+a.trim().slice(0,40)+'」程式（字串以外）不一樣'); return; } if(x.lit.length!==y.lit.length){ bad.push(f+'：字串個數不一樣'); return; }
      x.lit.forEach((s,k)=>{ const t=y.lit[k]; if(s===t) return; if(kindOf(s,t)===WANT[f][0]) nt++; else bad.push(f+'：「'+s.slice(0,20)+'」→「'+t.slice(0,20)+'」不是這一批的寫法'); }); });
    per[f]=[nl,nt]; }
  const want={}; for(const f of Object.keys(WANT)) want[f]=WANT[f].slice(1);
  check('23. 資料檔：字串以外一字不差，改到的字串都是這個檔那一種（libTalk（動作）「…」、pool「…」（動作）、aa614／經濟系外面的「」）；每個檔 [改了幾行, 幾個字串]：'+J(per),!bad.length&&J(per)===J(want),sample(bad)||J(per));
  /* 只改註解的檔 */
  const cm=['src/data/sis_b13_events.js','src/game3d.js','src/econsl3d.js'].filter(f=>J(nonBlank(A_(f)))!==J(nonBlank(B_(f))));
  check('23. sis_b13_events.js、game3d.js、econsl3d.js 只改了註解（註解以外一字不差）',!cm.length,J(cm));
  /* 程式：sis_b13_3d.js 拿掉 smallQ、S.greetTexts 改成稿上的字；story3d.js 加 S.smallActUnq、S.smallQuoteMigrate 換一版（其他一字不差）*/
  const sA=nonBlank(A_('src/sis_b13_3d.js')).filter(l=>!/^\s*const smallQ=t=>\{/.test(l)).map(l=>l.replace("S.greetTexts=()=>(L.repairGreet||[]).map(smallQ);","S.greetTexts=()=>(L.repairGreet||[]).slice();")), sB=nonBlank(B_('src/sis_b13_3d.js'));
  check('23. sis_b13_3d.js：只拿掉 smallQ、S.greetTexts＝(L.repairGreet||[]).slice()（註解以外一字不差）',J(sA)===J(sB)&&sA.length===nonBlank(A_('src/sis_b13_3d.js')).length-1);
  const cut=L=>{ const i=L.findIndex(l=>/^\s*S\.smallQuoteMigrate=function\(s\)\{/.test(l)); if(i<0) return {L,blk:null}; const j=L.findIndex((l,k)=>k>i&&/^\s*return n; \};$/.test(l)); if(j<0) return {L,blk:null}; return {L:L.slice(0,i).concat(L.slice(j+1)),blk:L.slice(i,j+1)}; };
  const tA=cut(nonBlank(A_('src/story3d.js'))), tB0=nonBlank(B_('src/story3d.js')), tB=cut(tB0.filter(l=>!/^\s*S\.smallActUnq=k=>\{/.test(l)));
  const blk=(tB.blk||[]).join('\n');
  check('23. story3d.js：只加 S.smallActUnq 一行、S.smallQuoteMigrate 換一版（其他一字不差）；新版用 S.smallUnq 和 S.smallActUnq 對照閒聊表、也換 flags.ECON_SL（ECONFR_SOCLIB 的 talk）',
    !!tA.blk&&!!tB.blk&&J(tA.L)===J(tB.L)&&tB0.filter(l=>/^\s*S\.smallActUnq=k=>\{/.test(l)).length===1&&/S\.smallUnq\(k\),S\.smallActUnq\(k\)/.test(blk)&&/S\.smallKnown\(\)/.test(blk)&&/s\.flags&&s\.flags\.ECON_SL/.test(blk)&&/ECONFR_SOCLIB\.people/.test(blk),
    tA.L.length+' → '+tB.L.length); }

/* ---------- 24. 演出來：BASE 和現在各跑一次 ---------- */
check('24. 兩次都跑得起來（'+BASE+' 的檔、現在的檔；index.html 全部載入、沒有例外）',!(O.errs||[]).length&&!(N.errs||[]).length,sample((O.errs||[]).concat(N.errs||[])));
const cmp=(A,B,kinds)=>{ const bad=[], nw=[], hit=new Set(); let ch=0, named=0; A=A||[]; B=B||[];
  if(A.length!==B.length) bad.push('句數 '+A.length+' → '+B.length);
  else A.forEach((a,i)=>{ const b=B[i], ta=a[a.length-1], tb=b[b.length-1];
    if(J(a.slice(0,-1))!==J(b.slice(0,-1))) bad.push('說的人不一樣：'+J(a)+' → '+J(b));
    else if(ta!==tb){ const k=kindOf(ta,tb); if(k&&k!=='same'&&kinds.includes(k)&&b[b.length-2]!=null){ ch++; hit.add(tb); } else bad.push(J(a)+' → '+J(b)); }
    if(b[b.length-2]!=null){ named++; if(quoted(tb)) nw.push(J(b)); } });
  return {bad,nw,ch,named,hit}; };
{ const KEYS={us:['學姊在美國法學院圖書館（挽回中的短招呼、交往中的 libTalk；SMALLTALK）',['act'],4],pool:['法律系同學的閒聊、之後的招呼（pool3d.js）',['say'],4],inv:['改時間的回覆七句（aa614 S.invRule → INV.playLines）',['unq'],7]};   /* econ（CANON-NO-ECON-1112 第三批：這一項拿掉） */
  for(const k of Object.keys(KEYS)){ const r=cmp(O[k],N[k],KEYS[k][1]);
    check('24. '+KEYS[k][0]+'：'+(N[k]||[]).length+' 句，說的人和 '+BASE+' 一樣、字只差這一批的那一對「」（拿掉 '+r.ch+' 次、'+r.hit.size+' 種句子）',(N[k]||[]).length>0&&r.bad.length===0&&r.hit.size>=KEYS[k][2],sample(r.bad));
    check('24. '+KEYS[k][0]+'：有名字說的 '+r.named+' 句沒有一句還被「」包著',r.named>0&&r.nw.length===0,sample(r.nw)); }
  const has=(k,f)=>(N[k]||[]).some(f), T=r=>r[r.length-1], W=r=>r[r.length-2];
  check('24. 挽回中：學姊（有名字）說「（她點了一下頭。）早。」，只說一次；交往中：libTalk 三句都是她說的（有名字）',(N.us||[]).filter(r=>r[0]==='ex'&&T(r)==='（她點了一下頭。）早。'&&W(r)).length===1&&LIB.now.every(t=>has('us',r=>r[0]==='dating'&&T(r)===t&&W(r))));
  check('24. 之後的招呼四句：本人說的（有名字），字＝說的話（動作）',['……嗯。（他點頭，比你預期的大聲一點。）','先吃再說！（塞給你一顆糖）','再一次。（她說的是手上的和弦，不是對你）','我先走了！（他還沒停下來）'].every(t=>has('pool',r=>T(r)===t&&W(r))&&!has('pool',r=>T(r)===t&&!W(r))));
  const iv=INVL.now||{}, IK=['mx','ps','kai','ytOff','ytBoth','yu','yuSat'];
  check('24. 改時間的回覆：七種情境都是改時間（resched）、各說一句、說的人＝被約的那個人（明軒、沛珊、阿凱、語彤兩種、Alison 兩種），字＝S.L.inv',
    IK.every(k=>{ const L=(N.inv||[]).filter(r=>r[0]===k); return L.length===1&&L[0][1]==='resched'&&!!W(L[0])&&T(L[0])===iv[k]; }),J(N.inv));
  /* 經濟系同學兩項（CANON-NO-ECON-1112 第三批：這一項拿掉） */ }

/* ---------- 25. 舊存檔 ---------- */
{ const MO=O.mig||{}, MN=N.mig||{};
  for(const [k,nm] of [/* econ（CANON-NO-ECON-1112 第三批：這一項拿掉） */['ex','學姊挽回中的短招呼（兩天存檔）'],['dating','法學院圖書館的閒聊（三天存檔）']]){ const o=MO[k]||{}, n=MN[k]||{};
    const r=cmp(o.next,n.next,['unq','act']), r0=cmp(o.next,n.noFix,['unq','act']);
    check('25. 舊存檔：'+nm+'——'+BASE+' 的程式聊了存起來、現在的程式讀檔（smallQuoteMigrate 換了 '+n.n+' 個記號）接著聊：'+(n.next||[]).length+' 句和 BASE 一路聊下去一樣',
      (n.n|0)>=1&&(n.next||[]).length>0&&r.bad.length===0&&r.nw.length===0,sample(r.bad.concat(r.nw)));
    check('25. 舊存檔：'+nm+'——不換記號的話會不一樣（'+r0.bad.length+' 處：說過的又說、輪流亂掉）——確定上面那一項真的有在比',r0.bad.length>0); }
  const U=N.unit||{}, s=U.s||{}, h=(((s.social||{}).small||{}).heroine_05)||{};
  check('25. 換記號（SMALLTALK）：「（她點了一下頭。）「早。」」→「（她點了一下頭。）早。」、libTalk 的（動作）「…」→（動作）…、「這邊的咖啡很淡。…」拿掉外面的「」；對不到的（「（她小聲）「不在表上的句子。」」、「A」「B」、__greet）照留；新舊都有的留新的那一個',
    J(h.used)===J(['（她點了一下頭。）早。','（她小聲）三明治店十二點人很多。你先去占位子。','__greet','（她小聲）「不在表上的句子。」','「A」「B」'])&&h.last==='（她指了一下桌上的紙杯）圖書館的咖啡機又壞了。這杯是外面買的。'&&
    J(Object.keys(h.once||{}).sort())===J(['（她點了一下頭。）早。','這邊的咖啡很淡。我開始喝茶了。'].sort()),J(h));
  /* 換記號（flags.ECON_SL）（CANON-NO-ECON-1112 第三批：這一項拿掉） */
  check('25. 換記號：一共換了 '+U.n1+' 個；再換一次＝0 個、存檔一模一樣；只有 flags 的存檔沒有東西可換（'+U.n3+' 個；ECON_SL（CANON-NO-ECON-1112 第三批：這一項拿掉））；null、空的、壞掉的不丟例外',
    U.n1===5&&U.n2===0&&U.same===true&&U.n3===0&&J(U.thrown)===J([]),J({n1:U.n1,n2:U.n2,n3:U.n3,thrown:U.thrown}));
  check('25. game3d.js 讀檔（migrate）照舊叫 STORY.smallQuoteMigrate（在 POOL.migrate 後面）',/POOL\.migrate\(s\);[^\n]*\n[^\n]*STORY\.smallQuoteMigrate\(s\)/.test(cur('src/game3d.js'))); }

/* ---------- 26. 讀這些句子的程式沒動 ---------- */
{ const st=noComments(cur('src/story3d.js'));
  const C5=findC5(), i5=C5?gitShow(C5,'src/invites3d.js'):cur('src/invites3d.js'), i5p=C5?gitShow(C5+'^','src/invites3d.js'):gitShow(BASE,'src/invites3d.js');   /* 第六批（TEXT-QUOTE-UNIFY-1108 最後一批）換了 S.narrLine：看第五批那一個 commit 本身 */
  check('26. pool3d.js 和 '+BASE+' 一字不差（之後的招呼 sayAny 看 S.narrWhole）；invites3d.js 第五批沒動（'+(C5?C5.slice(0,9)+'^ → '+C5.slice(0,9):'commit 以前：'+BASE+' → 現在的檔')+' 一字不差、＝'+BASE+'；改時間的回覆 S.playLines(GM,who,…)、S.narrLine——第六批以後 S.narrLine 看整句一對（），tests/invites_quote_b6_unit.js）',
    cur('src/pool3d.js')===gitShow(BASE,'src/pool3d.js')&&i5===i5p&&i5p===gitShow(BASE,'src/invites3d.js')&&/if\(S\.narrLine\(t\)\) await GM\.say\(null,t\); else await GM\.say\(who,t\);/.test(noComments(cur('src/invites3d.js'))));
  check('26. story3d.js：閒聊 GM.say(who,L.say)、旁白 GM.say(null,L.narr)；經濟系同學 ECONSL.talk 兩個掛勾（CANON-NO-ECON-1112 第三批：這一項拿掉）',/const L=S\.smallTalk\(G,id\); if\(L\.say\) await GM\.say\(who,L\.say,\{expr:'smile'\}\); else await GM\.say\(null,L\.narr\);/.test(st)&&!/ECONSL/.test(st));
  /* econsl3d.js 兩項（CANON-NO-ECON-1112 第三批：這一項拿掉） */ }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}

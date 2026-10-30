// AA_531 D99 美國交換（企劃線 475f55fe6，AA-B 定稿 D109；任務 AA531-US-FIX-1030；D99 第三優先）——不需要瀏覽器。用法：node tests/aa531_us_unit.js
//   0  稿讀得到；遊戲裡這一批的新句都在 AA_531 稿裡（一字不差）、稿第 2、4、5、6、7-3、7-4 節的句子都在遊戲裡；白名單有 AA_531；ladder.js、msg_pool.js 是工具產生的
//   1  人在國外（美國、日本）阿哲週一不揪 118 午餐（臺灣路線照揪）；美國那一學期整段掃過：阿哲、麵店團沒有要你「走。」的、沒有排 118 午餐的出遊
//   2  和臺灣的人交往中、人在美國：以安、語彤、子晴、沛珊各五樣（七夕、中秋、視訊、12/23；以安兩次視訊：10/19 有接挪到 10/29、11/19 只給第一次有接的）；時間照時差；沒交往、臺灣路線沒有
//   3  3-1 沛珊 ps3 國外的月份不算（10/31 不發、不加裂縫）；3-2 子晴 zq2 美國照臺灣時間、第二個選項換國外版（日本不傳）；3-3 語彤「阿姨問你怎麼沒來」國外不用、美國版
//   4  9/3 21:00 勞動節烤肉：交往中學姊私訊、挽回中社區的信；回好＝排 9/4 17:00 會所，演 ev_usl_bbq
//   5  上課每門十二句輪流；us_comp 12/7 期末報告、us_intro 12/6 期末考（一鍵上課演、快轉停）
//   6  大峽谷 10/9、10/11 兩個版本補句（位置）
//   7  7-1 以安生日美國自動排視訊；7-2 可昕七夕美國只演 usl_qixi；7-3 挽回中的招呼；7-4 朋友版週日視訊七句輪流
// 修改前（postrel-1030 2eeb91a85，git archive 那一版放進這支測試真的跑過，稿從這個 repo 讀：AA531_DOCREPO）：第 0 節「稿讀得到」以外全部 FAIL。
// 在沒有 .git 的目錄跑：設環境變數 AA531_DOCREPO＝這個 repo 的目錄
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa523_sis_b16_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
{ const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,120)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.removeNPC=()=>{}; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};   /* 家人群組的週訊息和這裡無關 */
const D=k=>typeof k==='number'?k:STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(D(d)).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null;
const AN='heroine_01', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},f||{});
const TW=f=>Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1,Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08'),ROOM_Y4:D('2028-09-03')},f||{});
const JP=f=>Object.assign({EXCHANGE_ROUTE:'JP',EXCH_RULE:1,JP_DEPARTED:D('2028-03-25')},f||{});
const at=(d,h)=>{ const G=H.G; G.day=D(d); G.hour=h; G.weekday=wdOf(G.day); };
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(typeof key==='number'?keyOf(key):key,h,zone||'dorm',Object.assign({introDone:true,afternoonDone:true,classDone:true,noodleTableDay:D('2025-09-20'),L118_FIRST_SENT:true},flags||{}));
  G.outings=[]; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; G.acts={att:{}}; G.visited={}; PHONE.rec(G); E.player.busy=false; E.paused=false; GM.npc={}; ADV.active=false; if(STORY._bindGM) STORY._bindGM(GM); at(G.day,h); return G; };
const date=(id,since)=>{ const G=H.G; H.FRIEND(id); G.flags['dating_'+id]=true; const R=ROM.get(G,id); R.status='dating'; R.sinceDay=since!=null?D(since):G.day-60; if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(G,id); };
const friend=id=>{ H.FRIEND(id); if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(H.G,id); };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const phAt=(d,h)=>{ at(d,h); ph(); };
const tagMsgs=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const thTexts=th=>(H.G.msgs||[]).filter(m=>(m.th||'')===th).map(m=>m.text);
const outIds=()=>(H.G.outings||[]).map(q=>q.id);
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const runEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const e=ev(id); if(!e) throw new Error('沒有事件 '+id); await EVENTS.run(e); };
const said=()=>H.said.map(x=>x.t), has=t=>H.said.some(x=>x.t===t);
const seq=(a,L)=>{ L=L||said(); let p=-1; for(const t of a){ const k=L.indexOf(t,p+1); if(k<0) return false; p=k; } return true; };

/* ---------- 稿 ---------- */
const SHA='475f55fe6', DOCF='docs/story_planning/AA_531_D99美國交換_人在美國還被揪118午餐_在臺灣的伴侶四個月沒聯絡_上課期末.md';
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:process.env.AA531_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ DOC=''; }
const part=(a,b)=>{ const i=DOC.indexOf(a); if(i<0) return ''; const j=b?DOC.indexOf(b,i+1):-1; return DOC.slice(i,j<0?DOC.length:j); };
const SPK=/^(以安|語彤|子晴|沛珊|學姊|書瑀|教授)：/;
const unq=t=>String(t).trim().replace(/^「(.*)」$/,'$1');
/* 第 2 節的表：| 什麼時候 | 內容 |——內容用「／」分開、說話的人拿掉；「每月」那一列是第 3 節的事 */
const tableLines=sub=>{ const out=[]; for(const l of sub.split('\n')){ const c=l.split('|').map(x=>x.trim()); if(c.length<4||/^-+$/.test(c[1])||/什麼時候/.test(c[1])||/^每月/.test(c[1])) continue; for(const p of c[2].split('／')) out.push(p.trim().replace(SPK,'')); } return out.filter(Boolean); };
const S2=part('## 2. ','## 3. '), S3=part('## 3. ','## 4. '), S4=part('## 4. ','## 5. '), S5=part('## 5. ','## 6. '), S6=part('## 6. ','## 7. '), S7=part('## 7. ','## 8. ');
const DOC2=['### 2-1','### 2-2','### 2-3','### 2-4'].map((h,i,a)=>{ const k=S2.indexOf(h), n=i<a.length-1?S2.indexOf(a[i+1]):S2.length; return tableLines(S2.slice(k,n)); });
const quotes=t=>String(t).split('\n').map(l=>/^\s*>\s*(.+)$/.exec(l)).filter(Boolean).map(m=>m[1].trim().replace(SPK,''));
const S51=String(S5.split('### 5-2')[0]||''), DOC51=S51.split('\n').map(l=>/^\s{2,}- (.+)$/.exec(l)).filter(Boolean).map(m=>m[1].trim());
const S52=String(S5.split('### 5-2')[1]||''), DOC52=quotes(S52).concat([...S52.matchAll(/「(（[^」]+）)」→(（[^\n]+）)/g)].flatMap(m=>[m[1],m[2]]));
const DOC6=[]; for(const l of S6.split('\n')){ const c=l.split('|').map(x=>x.trim()); if(c.length>=5&&/交往/.test(c[1])) for(const k of [2,3]) for(const p of c[k].split('／')) DOC6.push(p.trim().replace(SPK,'')); }
const DOC74=String(S7.split('### 7-4')[1]||'').split('\n').map(l=>/^\s*\d\. (（[^\n]+?）)(（原句）)?\s*$/.exec(l)).filter(Boolean).map(m=>m[1]);
const DOC4=quotes(S4), DOC32=quotes(S3.split('### 3-2')[1]||'').filter(t=>!/^$/.test(t)), DOC33=quotes(S3.split('### 3-3')[1]||'');
const DOC73=quotes(S7.split('### 7-3')[1]||'');

/* ---------- 遊戲這一批的字 ---------- */
const X=typeof US_LIFE_EVENTS!=='undefined'?US_LIFE_EVENTS.DATA:{};
const evTexts=id=>{ const e=ev(id), A=[]; for(const l of ((e&&e.dialogue)||[])){ if(typeof l.text==='string') A.push(l.text); if(l.choice) for(const c of l.choice) A.push(c.text); } return A; };
const aaLines=id=>{ const e=ev(id), A=[]; for(const l of ((e&&e.dialogue)||[])){ if(l.aa531&&typeof l.text==='string') A.push(l.text); } return A; };
const TWEV=['ev_usl_tw_an_v1','ev_usl_tw_an_v2','ev_usl_tw_yt_v','ev_usl_tw_zq_v','ev_usl_tw_ps_v'];
const gameNew=()=>{ const A=[]; const a=X.aa531||{}; for(const id in a) for(const it of a[id]) if(it.msgs) A.push(...it.msgs);
  for(const id of TWEV.concat(['ev_usl_comp_final','ev_usl_intro_final'])) A.push(...evTexts(id));
  for(const k of ['us_intro','us_comp','us_writing']) A.push(...((X.classLines||{})[k]||[]).slice(8));
  const M=X.msgs||{}; if(M.bbqAsk){ A.push(...M.bbqAsk,M.bbqMail,...M.bbqMailOpts); for(const [t,r] of M.bbqAskOpts) A.push(t,r); }
  const z=((typeof CRACKTALK_LINES!=='undefined'&&CRACKTALK_LINES.SRC2)||{}).zq2||{}; if(z.abroadOpt) A.push(z.abroadOpt[0],...z.abroadOpt[1]);
  for(const e of (((typeof MSG_POOL!=='undefined'&&MSG_POOL.people[YT])||{}).replies||[])) if(/AA_531/.test(e.src||'')) A.push(...e.msgs);
  for(const id of ['ev_us_canyon','ev_sis_canyon','ev_sis_video']) A.push(...aaLines(id));
  if(typeof SISB16_LINES!=='undefined'&&SISB16_LINES.greetUSRepair) A.push(SISB16_LINES.greetUSRepair);
  return A.filter(t=>typeof t==='string'&&t.length); };
const gameSet=()=>new Set(gameNew());

(async()=>{
/* ======================= 0 ======================= */
await sec(0,()=>{
  check('0. 讀得到稿（AA_531 '+SHA+'：第 2 節四位的表、5-1 十二句、5-2 兩場、第 6 節表、7-4 七句）',DOC.length>6000&&DOC2.every(L=>L.length>=8)&&DOC51.length===12&&DOC74.length===7,J({len:DOC.length,d2:DOC2.map(L=>L.length),d51:DOC51.length,d74:DOC74.length}));
  check('0. 全部的檔載入沒有錯誤；這一批的模組都在（USL、L118、CRACKTALK、FEST、R2Y4B、SISB16、MSG）',!loadErr.length&&[typeof USL,typeof L118,typeof CRACKTALK,typeof FEST,typeof R2Y4B,typeof SISB16,typeof MSG].every(t=>t==='object'),J(loadErr));
  const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===DOCF);
  check('0. 劇情匯入白名單有 AA_531（sha '+SHA+'、approved、AA-B 定稿（D109）、任務 AA531-US-FIX-1030）',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].approvedBy==='AA-B 定稿（D109）'&&A[0].task==='AA531-US-FIX-1030',J(A.map(e=>({sha:e.sha,status:e.status,by:e.approvedBy,task:e.task}))));
  const G0=gameNew(), notIn=[...new Set(G0)].filter(t=>DOC.indexOf(t)<0);
  check('0. 遊戲 → 稿：這一批的新句（'+new Set(G0).size+' 句：四位的私訊、五場視訊、勞動節、上課十二句、兩場期末、子晴國外版選項、語彤國外版、大峽谷、七句旁白、挽回中招呼）都在稿裡（一字不差）',new Set(G0).size>=80&&!notIn.length,J({n:new Set(G0).size,notIn}));
  const GS=gameSet(), lost=t=>!GS.has(t)&&!GS.has(unq(t));
  const miss2=DOC2.map(L=>L.filter(lost));
  check('0. 稿 → 遊戲：第 2 節四位的表（'+DOC2.map(L=>L.length).join('、')+' 句）每一句都在遊戲裡',DOC2.every(L=>L.length)&&miss2.every(L=>!L.length),J(miss2));
  check('0. 稿 → 遊戲：5-1 三門各四句（12 句）、5-2 兩場（'+DOC52.length+' 句）、第 6 節表（'+DOC6.length+' 句）都在遊戲裡',DOC51.length===12&&DOC52.length>=7&&DOC6.length===9&&![...DOC51,...DOC52,...DOC6].some(lost),J([...DOC51,...DOC52,...DOC6].filter(lost)));
  const n74=evTexts('ev_sis_video'); check('0. 稿 → 遊戲：7-4 七句（第 1 句原句）都在 ev_sis_video 的 vn',DOC74.length===7&&DOC74.every(t=>n74.includes(t)),J(DOC74.filter(t=>!n74.includes(t))));
  check('0. 稿 → 遊戲：第 4 節（學姊兩句、社區的信）、3-2 國外版、3-3 語彤、7-3 挽回中招呼都在遊戲裡',DOC4.length===3&&!DOC4.some(lost)&&DOC32.some(t=>unq(t)==='我這邊中午。開視訊陪妳？')&&!DOC32.map(unq).some(lost)&&DOC33.length===1&&!DOC33.some(lost)&&DOC73.length===1&&!DOC73.some(lost),J({DOC4,DOC32,DOC33,DOC73}));
  const gb=((LADDER.byTerm.Y4S1||{})[SIS]||{greet:{}}).greet.base||[];
  check('0. ladder.js（tools/ladder/import_ladder.py 讀白名單上的 AA_531 疊上去）：學姊大四上招呼 base 有「這邊的飲水機只有冰的。我自己帶。」，放在回來以後那一句後面；來源寫了 AA_531@'+SHA,
    gb.indexOf('這邊的飲水機只有冰的。我自己帶。')===gb.indexOf(SISB16_LINES.greetBack)+1&&LADDER.source.indexOf('AA_531@'+SHA)>=0&&/AA_531_/.test(fs.readFileSync(path.join(H.ROOT,'tools/ladder/import_ladder.py'),'utf8')),J(gb));
  check('0. msg_pool.js（tools/msg/build_pool.py → to_js.py）：source 有 AA_531、語彤的美國版是產生器寫的',MSG_POOL.source.AA_531===SHA&&/在店裡。阿姨問你美國有沒有麵。/.test(fs.readFileSync(path.join(H.ROOT,'tools/msg/build_pool.py'),'utf8'))); });

/* ======================= 1 118 午餐 ======================= */
await sec(1,()=>{
  const mondays=(a,b)=>{ const out=[]; for(let d=D(a);d<=D(b);d++){ const t=CALENDAR.termOf(d); if(wdOf(d)===1&&t&&t.week>=2&&t.week<=15) out.push(d); } return out; };
  const lunchAt=(flags,a,b,zone)=>{ fresh(a,9,zone,flags); PHONE.join(H.G,'noodle_team','麵店團'); friend('zhe'); friend('yu'); const got=[];
    for(const d of mondays(a,b)){ for(const h of [12,12.1,12.2]){ phAt(d,h); } if(tagMsgs('l118_lunch_'+d).length) got.push(keyOf(d)); } return {n:mondays(a,b).length,got}; };
  const us=lunchAt(US(),'2028-09-04','2028-12-15','us_apartment'), tw=lunchAt(TW(),'2028-09-04','2028-12-15','dorm'), jp=lunchAt(JP(),'2028-03-26','2028-06-30','jp_dorm');
  check('1. 美國路線 9/11～12/11 的週一（'+us.n+' 個）：阿哲不揪 118 午餐（原本 14 次，回「走。」還排出遊）',us.n>=12&&!us.got.length,J(us));
  check('1. 日本路線（3/25～8/5 在國外）的週一（'+jp.n+' 個）：也不揪',jp.n>=8&&!jp.got.length,J(jp));
  check('1. 臺灣路線同一學期：照揪（每個週一一則）',tw.n>=12&&tw.got.length===tw.n,J({n:tw.n,got:tw.got.length}));
  fresh('2028-09-11',12,'us_apartment',US()); check('1. L118.meAbroad：美國路線 9/11 是、臺灣路線不是',L118.meAbroad(H.G)===true&&(fresh('2028-09-11',12,'dorm',TW()),L118.meAbroad(H.G)===false));
  /* 其他阿哲揪人的：整段掃（每天 7:30、12:00、17:30、19:00、21:00、21:30）——不能有要你「走。」「去。」的、不能排 118 午餐／宵夜／烤肉的出遊 */
  fresh('2028-08-02',6,'us_apartment',US()); PHONE.join(H.G,'noodle_team','麵店團'); PHONE.join(H.G,'family_law','家族'); for(const id of ['zhe','yu',AN,'classmate_bohan','kai',YT]) friend(id);
  const outs=new Set();
  for(let d=D('2028-08-02');d<D('2028-12-23');d++) for(const h of [7.5,12,12.1,17.5,19,21,21.5]){ phAt(d,h); for(const q of H.G.outings) outs.add(q.id); }
  const asks=(H.G.msgs||[]).filter(m=>(m.from==='zhe'||/noodle_team|p:zhe/.test(m.th||''))&&m.ask).map(m=>m.tag+'：'+m.ask.opts.map(o=>o.t).join('／'));
  const bad=asks.filter(a=>/走。|去。|我去/.test(a)), badOut=[...outs].filter(id=>/^(l118_lunch_|bbq$|supper_mid|y4_ma|y4_xmas)/.test(id));
  check('1. 美國那一學期整段掃：阿哲、麵店團沒有要你「走。」「去。」的（剩下的都是照美國寫的：'+asks.map(a=>a.split('：')[0]).join('、')+'）、沒有排 118 午餐、宵夜、烤肉',!bad.length&&!badOut.length&&!(H.G.msgs||[]).some(m=>/^(l118_lunch_|rt_zhe_ndl_)/.test(m.tag||'')),J({bad,badOut})); });

/* ======================= 2 和臺灣的人交往中 ======================= */
const pTW=(id,k)=>((X.aa531||{})[id]||[]).find(x=>x.k===k)||{};
await sec(2,async()=>{
  /* 時差：8/26、10/3、10/15、10/22、11/12 美東 −12；11/19、11/26 冬令 −13 */
  const want={[AN]:[['qixi','2028-08-26',9],['moon','2028-10-03',8]],[YT]:[['qixi','2028-08-26',10],['moon','2028-10-03',9]],[ZQ]:[['qixi','2028-08-26',11.5],['moon','2028-10-03',10]],[PS]:[['qixi','2028-08-26',9.5],['moon','2028-10-03',8.5]]};
  const got={}, early={};
  for(const id of [AN,YT,ZQ,PS]){ fresh('2028-08-20',9,'us_apartment',US()); date(id,'2028-06-01'); got[id]=[]; early[id]=[];
    for(const [k,day,h] of want[id]){ phAt(day,h-0.25); if(tagMsgs('usl_tw_'+id+'_'+k).length) early[id].push(k); phAt(day,h); const M=tagMsgs('usl_tw_'+id+'_'+k); got[id].push(M.length&&M[0].day===D(day)&&Math.abs(M[0].h-h)<0.01&&M[0].th==='p:'+id&&!M.some(m=>m.ask)&&J(M.map(m=>m.text))===J(pTW(id,k).msgs)); } }
  check('2. 四位的七夕（8/26）、中秋（10/3）私訊：臺灣時間換成當地（以安 21:00→09:00、語彤 22:00→10:00、子晴 23:30→11:30、沛珊 21:30→09:30；中秋早一小時那一套）、不用回、字照稿；時間到以前不發',
    Object.values(got).every(a=>a.length===2&&a.every(Boolean))&&Object.values(early).every(a=>!a.length),J({got,early}));
  /* 視訊：前一天起排；子晴 10/15 臺灣 20:00＝08:00、語彤 11/12 22:30＝09:30、沛珊 11/26 21:00＝08:00 */
  const vids=[[YT,'v','2028-11-12',9.5,'ev_usl_tw_yt_v'],[ZQ,'v','2028-10-15',8,'ev_usl_tw_zq_v'],[PS,'v','2028-11-26',8,'ev_usl_tw_ps_v'],[AN,'v1','2028-10-22',9,'ev_usl_tw_an_v1']], vr={};
  for(const [id,k,day,h,e] of vids){ fresh('2028-10-01',9,'us_apartment',US()); date(id,'2028-06-01'); phAt(D(day)-2,12); const before=!!OUT.get(H.G,'usl_tw_'+id+'_'+k); phAt(D(day)-1,12); const q=OUT.get(H.G,'usl_tw_'+id+'_'+k);
    vr[id+k]=!before&&!!q&&q.day===D(day)&&Math.abs(q.h-h)<0.01&&q.ev===e&&q.call===true&&q.place==='視訊'&&q.verb==='接起來'&&q.alarm===true; }
  check('2. 視訊（出遊、她打來、鬧鐘會叫）：語彤 11/12 09:30、子晴 10/15 08:00（臺灣 20:00，AA 沒寫時間）、沛珊 11/26 08:00（冬令）、以安 10/22 09:00；前一天才排',Object.values(vr).every(Boolean),J(vr));
  /* 以安：10/19 那一通有接＝第一次挪到 10/29；第二次 11/19 只給第一次有接的 */
  fresh('2028-10-01',9,'us_apartment',US()); date(AN,'2028-06-01'); OUT.plan(H.G,{id:'y4_an18_video',ev:'ev_an_her_choice_video',day:D('2028-10-19'),h:10,place:'視訊',title:'t'}); OUT.get(H.G,'y4_an18_video').state='done';
  phAt('2028-10-21',12); const n22=!OUT.get(H.G,'usl_tw_heroine_01_v1'); phAt('2028-10-28',12); const q29=OUT.get(H.G,'usl_tw_heroine_01_v1');
  phAt('2028-11-18',12); const no2=!OUT.get(H.G,'usl_tw_heroine_01_v2'); H.G.flags.USL_TW_AN_V1=true; phAt('2028-11-18',12.25); const q2=OUT.get(H.G,'usl_tw_heroine_01_v2');
  check('2. 以安：10/19 那一通（y4_an18_video）有接＝第一次不排 10/22、挪到 10/29 09:00；第二次 11/19 08:00（冬令，美東早上八點）只給第一次有接的（USL_TW_AN_V1）',n22&&!!q29&&q29.day===D('2028-10-29')&&q29.h===9&&no2&&!!q2&&q2.day===D('2028-11-19')&&q2.h===8,J({n22,q29:q29&&[keyOf(q29.day),q29.h],no2,q2:q2&&[keyOf(q2.day),q2.h]}));
  /* 演：以安第一次（記 USL_TW_AN_V1）、子晴（十分鐘）*/
  fresh('2028-10-21',9,'us_apartment',US()); date(AN,'2028-06-01'); phAt('2028-10-21',12); at('2028-10-22',8.8); await goOut('usl_tw_heroine_01_v1');
  const anV=seq(['（視訊。她那邊是晚上九點，桌上攤著手帳。你這邊的早餐還沒吃完。）','你那邊幾點？','……我算錯了。我以為你吃完了。','下次我照你那邊的時間排。'])&&H.G.flags.USL_TW_AN_V1===true;
  fresh('2028-10-14',9,'us_apartment',US()); date(ZQ,'2028-06-01'); phAt('2028-10-14',12); at('2028-10-15',7.9); await goOut('usl_tw_heroine_04_v'); const zqV=seq(['（視訊。她在公司的茶水間，背後的白板寫滿了字。）','我只有十分鐘','……你那邊天亮了嗎'])&&Math.abs(ev('ev_usl_tw_zq_v').hours-1/6)<1e-6;
  check('2. 演得出來：以安第一次（四句、記 USL_TW_AN_V1）、子晴（三句；十分鐘＝出遊 10 分鐘）',anV&&zqV,J(said()));
  /* 12/23：人已經回到臺灣（臺灣時間）*/
  const ret={}; for(const id of [AN,YT,ZQ,PS]){ fresh('2028-12-23',6,'dorm',US({US_RETURNED:D('2028-12-23')})); date(id,'2028-06-01'); const h=pTW(id,'ret').h; phAt('2028-12-23',h-0.25); const e0=tagMsgs('usl_tw_'+id+'_ret').length; phAt('2028-12-23',h); const M=tagMsgs('usl_tw_'+id+'_ret'); ret[id]=!e0&&M.length===2&&M[0].h===h&&J(M.map(m=>m.text))===J(pTW(id,'ret').msgs); }
  check('2. 12/23 回國那天（人在臺灣、臺灣時間）：以安 20:00「到了傳一句。」「明天見。」、語彤 21:00、子晴 23:00、沛珊 21:30',Object.values(ret).every(Boolean)&&pTW(AN,'ret').h===20&&pTW(YT,'ret').h===21&&pTW(ZQ,'ret').h===23&&pTW(PS,'ret').h===21.5,J(ret));
  /* 沒交往、臺灣路線：沒有 */
  fresh('2028-08-20',9,'us_apartment',US()); for(const id of [AN,YT,ZQ,PS]) friend(id); phAt('2028-08-26',12); phAt('2028-10-03',12); phAt('2028-11-11',12);
  const none1=!(H.G.msgs||[]).some(m=>/^usl_tw_/.test(m.tag||''))&&!outIds().some(i=>/^usl_tw_/.test(i));
  fresh('2028-08-20',9,'dorm',TW()); for(const id of [AN,YT,ZQ,PS]) date(id,'2028-06-01'); phAt('2028-08-26',23.9); phAt('2028-10-03',23.9); phAt('2028-11-11',12);
  const none2=!(H.G.msgs||[]).some(m=>/^usl_tw_/.test(m.tag||''))&&!outIds().some(i=>/^usl_tw_/.test(i));
  check('2. 沒有交往（朋友）、臺灣路線（交往中）：這一批都不發、不排',none1&&none2,J({none1,none2})); });

/* ======================= 3 人在美國收到的 ======================= */
await sec(3,()=>{
  /* 3-1 沛珊 ps3 */
  const ps3=()=>(H.G.msgs||[]).filter(m=>m.from===PS&&/這個月你也沒來|下了三天雨|很像你|格子，我又空下來/.test(m.text));
  fresh('2028-10-31',22,'us_apartment',US()); date(PS,'2028-06-01'); const ck=k=>H.G.flags[(ROM.CRACK||{})[PS]]|0, c0=ck();
  const mcUS=[CRACKTALK.monthCounts(H.G,'2028-09'),CRACKTALK.monthCounts(H.G,'2028-10'),CRACKTALK.monthCounts(H.G,'2028-11')];
  for(const h of [22.9,23,23.25]) phAt('2028-10-31',h); const usPs=ps3().length;
  fresh('2028-10-31',22,'dorm',TW()); date(PS,'2028-06-01'); const mcTW=[CRACKTALK.monthCounts(H.G,'2028-09'),CRACKTALK.monthCounts(H.G,'2028-10')]; for(const h of [22.9,23,23.25]) phAt('2028-10-31',h); const twPs=ps3().length;
  check('3-1. 沛珊 ps3「這個月你也沒來。」：人在美國的月份不算（美國路線 9～11 月 monthCounts＝false；臺灣路線 9、10 月照算）——美國 10/31 23:00 不發、不加裂縫；臺灣路線照發',
    J(mcUS)===J([false,false,false])&&J(mcTW)===J([true,true])&&usPs===0&&twPs===1,J({mcUS,mcTW,usPs,twPs}));
  /* 3-2 子晴 zq2：9 月第一個週三 9/6 臺灣 23:30＝美東 11:30 */
  const zq2=()=>(H.G.msgs||[]).find(m=>m.ask&&/^ct_zq2_/.test(m.ask.id||''));
  fresh('2028-09-06',11,'us_apartment',US()); date(ZQ,'2028-06-01'); const crk=()=>H.G.flags[(ROM.CRACK||{})[ZQ]]|0, z0=crk();
  phAt('2028-09-06',11.25); const e0=!zq2(); phAt('2028-09-06',11.5); const m=zq2(); const o=m&&m.ask.opts.map(x=>x.t);
  const r=m?PHONE.answer(H.G,m.ask.id,1):null; ph(); const rep=r?r.out.slice(1).map(x=>x.text):null;
  check('3-2. 子晴 zq2 人在美國：照臺灣時間（9/6 23:30＝當地 11:30，以前不發）、第二個選項是「我這邊中午。開視訊陪妳？」→「……好」「不要講話就好」、不加裂縫（同原本的第二個選項）',
    e0&&!!m&&m.day===D('2028-09-06')&&m.h===11.5&&J(o)===J(['妳要不要先休息？','我這邊中午。開視訊陪妳？'])&&J(rep)===J(['……好','不要講話就好'])&&crk()===z0,J({e0,day:m&&keyOf(m.day),h:m&&m.h,o,rep}));
  fresh('2028-09-06',23,'dorm',TW()); date(ZQ,'2028-06-01'); phAt('2028-09-06',23.5); const mt=zq2();
  fresh('2028-08-02',23,'jp_dorm',JP()); date(ZQ,'2028-06-01'); phAt('2028-08-02',23.5); phAt('2028-08-03',0.6); const mj=zq2();
  check('3-2. 臺灣路線照原本（「要我過去陪妳加班嗎？」）；日本路線人在國外的那個月（8/2）不傳',!!mt&&mt.ask.opts[1].t==='要我過去陪妳加班嗎？'&&!mj,J({tw:mt&&mt.ask.opts.map(x=>x.t),jp:!!mj}));
  /* 3-3 語彤 */
  const P=MSG_POOL.people[YT].replies, a=P.find(e=>e.msgs[0]==='在店裡。阿姨問你怎麼沒來。'), b=P.find(e=>e.msgs[0]==='在店裡。阿姨問你美國有沒有麵。');
  fresh('2028-10-10',20,'us_apartment',US()); const us=[MSG.tagOk(H.G,YT,'祐廷在臺灣'),MSG.tagOk(H.G,YT,'美國路線')];
  fresh('2028-10-10',20,'dorm',TW()); const tw=[MSG.tagOk(H.G,YT,'祐廷在臺灣'),MSG.tagOk(H.G,YT,'美國路線')];
  check('3-3. 語彤「在店裡。阿姨問你怎麼沒來。」標「祐廷在臺灣」（人在國外不用）；美國版「在店裡。阿姨問你美國有沒有麵。」標「美國路線」（同一層 L、同一個「店裡的時間」）',
    !!a&&!!b&&a.tags.includes('祐廷在臺灣')&&b.tags.includes('美國路線')&&a.tier===b.tier&&b.tags.includes('店裡的時間')&&J(us)===J([false,true])&&J(tw)===J([true,false]),J({a:a&&a.tags,b:b&&b.tags,us,tw})); });

/* ======================= 4 勞動節 ======================= */
await sec(4,async()=>{
  fresh('2028-09-03',20,'us_apartment',US()); date(SIS,'2028-07-01'); phAt('2028-09-03',20.75); const e0=!tagMsgs('usl_bbq_ask').length; phAt('2028-09-03',21);
  const M=tagMsgs('usl_bbq_ask'), m=M.find(x=>x.ask); const o=m&&m.ask.opts.map(x=>x.t);
  const r=m?PHONE.answer(H.G,'usl_bbq_ask',0):null; ph(); const q=OUT.get(H.G,'usl_bbq');
  check('4. 交往中：9/3 21:00 學姊私訊「明天勞動節。會所後面有烤肉，五點。」「社區辦的。不用帶東西。」，選項「好。」／「我想在家休息。」；回「好。」她「好。」→ 排 9/4 17:00 會所（走過去約 3 分鐘）',
    e0&&J(M.map(x=>x.text))===J(['明天勞動節。會所後面有烤肉，五點。','社區辦的。不用帶東西。'])&&M[0].th==='p:'+SIS&&M[0].h===21&&J(o)===J(['好。','我想在家休息。'])&&!!r&&r.out[1].text==='好。'&&!!q&&q.day===D('2028-09-04')&&q.h===17&&q.ev==='ev_usl_bbq'&&q.travel==='走過去約 3 分鐘',J({e0,M:M.map(x=>x.text),o,q:q&&[keyOf(q.day),q.h,q.ev,q.travel]}));
  at('2028-09-04',16.9); await goOut('usl_bbq'); const done=!!(H.G.events.done&&H.G.events.done.ev_usl_bbq)&&has('（會所後面的草地，兩台烤肉架。美國人排隊拿漢堡，每個人都說了一次「Happy Labor Day」。）');
  check('4. 出遊演 ev_usl_bbq（會所後面的草地；交往中那一版「台灣的中秋也是烤肉。……」）',done&&has('台灣的中秋也是烤肉。……這裡的肉比較大塊。'),J(said()));
  fresh('2028-09-03',20,'us_apartment',US()); date(SIS,'2028-07-01'); phAt('2028-09-03',21); PHONE.answer(H.G,'usl_bbq_ask',1); ph(); const no=!OUT.get(H.G,'usl_bbq')&&tagMsgs('usl_bbq_ask').some(x=>x.text==='嗯。'||x.from===SIS);
  fresh('2028-09-03',20,'us_apartment',US()); phAt('2028-09-03',21); const S=tagMsgs('usl_bbq_ask'); const so=S[0]&&S[0].ask?S[0].ask.opts.map(x=>x.t):null; PHONE.answer(H.G,'usl_bbq_ask',0); ph(); const q2=OUT.get(H.G,'usl_bbq');
  check('4. 回「我想在家休息。」不排；挽回中（不是交往中）：系統訊息「（社區寄來的信：明天 17:00，會所後面的草地，勞動節烤肉。）」選項「（去）」／「（不去）」，回（去）也排 9/4 17:00',
    no&&S.length===1&&S[0].th==='sys'&&S[0].text==='（社區寄來的信：明天 17:00，會所後面的草地，勞動節烤肉。）'&&J(so)===J(['（去）','（不去）'])&&!!q2&&q2.h===17&&!(H.G.msgs||[]).some(x=>x.th==='p:'+SIS),J({no,S:S.map(x=>x.text),so,q2:!!q2})); });

/* ======================= 5 上課 ======================= */
await sec(5,async()=>{
  const CL=X.classLines||{}, ids=['us_intro','us_comp','us_writing'], NEW=[DOC51.slice(0,4),DOC51.slice(4,8),DOC51.slice(8,12)];
  fresh('2028-08-21',9,'us_apartment',US());
  check('5-1. 三門都是十二句：第 9～12 句＝稿 5-1 那四句（照順序、一字不差）；第 9 次上那門課是新的第一句、第 13 次回到第一句',
    ids.every((id,i)=>(CL[id]||[]).length===12&&J(CL[id].slice(8))===J(NEW[i])&&USL.classLine(id,8,H.G)===NEW[i][0]&&USL.classLine(id,11,H.G)===NEW[i][3]&&USL.classLine(id,12,H.G)===USL.classLine(id,0,H.G)),J(ids.map(id=>(CL[id]||[]).length)));
  const sp=(id,day)=>USL.special(H.G,{c:{id},day:D(day)});
  check('5-2. 最後一堂：us_comp 12/7（四）＝ev_usl_comp_final、us_intro 12/6（三）＝ev_usl_intro_final；Legal Writing 12/8、期中 10/26 照舊；其他天沒有',sp('us_comp','2028-12-07')==='ev_usl_comp_final'&&sp('us_intro','2028-12-06')==='ev_usl_intro_final'&&sp('us_writing','2028-12-08')==='ev_usl_lastclass'&&sp('us_comp','2028-10-26')==='ev_usl_midterm'&&sp('us_comp','2028-12-05')===null&&sp('us_intro','2028-12-04')===null&&wdOf('2028-12-07')===4&&wdOf('2028-12-06')===3);
  fresh('2028-12-07',12.5,'us_apartment',US()); let it=USL.items(H.G).find(x=>x.c.id==='us_comp'); H.said=[]; H.opts=[]; H.picks=['只講']; await USL.attend(GM,it);
  const a=seq(['（期末報告。你和德國來的交換生站在講台前面，投影片第一頁寫著 Privacy。）','（他講德國的部分講了十二分鐘。輪到你的時候，教授看了一下錶。）','Five minutes.','（你只講了一個案子。下課的時候，教授經過你旁邊，說了一句：Good choice.）'])&&H.said.some(x=>x.t==='Five minutes.'&&x.who==='教授')&&J(H.opts[0])===J(['（照稿念完）','（只講臺灣那一個案子）'])&&!has('（你講得很快。最後一張投影片放上去的時候，剛好五分鐘。）');
  fresh('2028-12-06',9.5,'us_apartment',US()); it=USL.items(H.G).find(x=>x.c.id==='us_intro'); H.said=[]; await USL.attend(GM,it); const b=seq(['（期末考。三題申論，都是陪審團。寫到第三題，你的手開始痠。）','（交卷的時候，教授對每個人都說了一次 Happy holidays.）']);
  check('5-2. 一鍵上課 12/7 Comparative：期末報告三句＋教授「Five minutes.」、兩個選項、選「只講臺灣那一個案子」那一句；12/6 Introduction：期末考兩句',a&&b,J(said()));
  fresh('2028-12-05',21,'us_apartment',US()); const n1=USL.nextStop(H.G,T(D('2028-12-05'),21)); fresh('2028-12-06',11.5,'us_apartment',US()); const n2=USL.nextStop(H.G,T(D('2028-12-06'),11.5));
  check('5-2. 快轉停在最後一堂開始前一小時：12/6 09:00（Introduction 10:00）、12/7 12:00（Comparative 13:00）',n1===T(D('2028-12-06'),9)&&n2===T(D('2028-12-07'),12),J([n1,n2].map(t=>t==null?null:keyOf(Math.floor(t/24))+' '+(t%24)))); });

/* ======================= 6 大峽谷 ======================= */
await sec(6,()=>{
  const pos=(id,a)=>{ const L=(ev(id)||{dialogue:[]}).dialogue, i=L.findIndex(l=>l.titleCard===a[0]), j=L.findIndex((l,k)=>k>i&&l.advance!=null), mid=L.slice(i,j).map(l=>l.text).filter(Boolean); return i>=0&&j>i&&J(mid.slice(1))===J(a.slice(1))?mid:mid.concat(['×']); };
  const us9=pos('ev_us_canyon',['10/9（一）','……照片拍不進去。','（她還是拍了一張，看了一眼，刪掉。）','用看的就好。']);
  const us11=pos('ev_us_canyon',['10/11（三）','明天峽谷那邊風大。外套帶厚的。','（她把兩支手機的鬧鐘都設好，才關燈。）']);
  const tw9=pos('ev_sis_canyon',['10/9（一）','……照片拍不進去。','（她拍了一張，看了一下，沒有刪。）']);
  const tw11=pos('ev_sis_canyon',['10/11（三）','明天風大。外套帶厚的。','（關燈以前，她問你鬧鐘設幾點。）']);
  const ok=L=>!L.includes('×');
  check('6. 交往中（美國路線 ev_us_canyon）10/9 第一眼那一句後面「……照片拍不進去。」（她還是拍了一張……刪掉）「用看的就好。」；10/11 汽車旅館那一句後面兩句',ok(us9)&&ok(us11),J({us9,us11}));
  check('6. 還沒交往（臺灣、日本路線 ev_sis_canyon）10/9、10/11 補句（沒有刪；她問你鬧鐘設幾點）；說話的是學姊（heroine_05）',ok(tw9)&&ok(tw11)&&aaLines('ev_sis_canyon').length===4&&aaLines('ev_us_canyon').length===5,J({tw9,tw11})); });

/* ======================= 7 小的 ======================= */
await sec(7,async()=>{
  /* 7-1 以安生日 */
  fresh('2028-09-14',10,'us_apartment',US()); date(AN,'2028-06-01'); phAt('2028-09-14',10); const q=OUT.get(H.G,'fest_heroine_01_bday_2028_video');
  const qok=!!q&&q.day===D('2028-09-15')&&q.h===9&&q.call===true&&q.place==='視訊'&&q.verb==='打視訊給她';
  let played=false; if(q){ at('2028-09-15',8.8); await goOut(q.id); played=seq(['你那邊是早上吧。我這邊快睡了。','……生日還剩三個小時。你剛好趕上。']); }
  fresh('2028-09-14',10,'us_apartment',US()); H.FAMILIAR(AN); phAt('2028-09-14',10); const nf=!OUT.get(H.G,'fest_heroine_01_bday_2028_video');
  fresh('2028-09-14',10,'dorm',TW()); date(AN,'2028-06-01'); phAt('2028-09-14',10); const nt=!OUT.get(H.G,'fest_heroine_01_bday_2028_video');
  check('7-1. 以安 9/15 生日、人在美國、交往中：前一天自動排視訊（9/15 當地 09:00＝臺灣 21:00，你打給她），演 vid 那兩句；只是有點熟（第 5 階以下）、臺灣路線不自動排',qok&&played&&nf&&nt,J({q:q&&[keyOf(q.day),q.h,q.verb],played,nf,nt}));
  /* 7-2 可昕七夕 */
  fresh('2028-08-24',10,'us_apartment',US()); date(KX,'2028-01-01'); for(const [d,h] of [['2028-08-25',10],['2028-08-25',21],['2028-08-26',8]]) phAt(d,h);
  const kx=[!!OUT.get(H.G,'usl_qixi'),outIds().filter(i=>/^fest_kexin_qixi/.test(i)),FEST.dedicated(H.G,KX,'qixi',2028)];
  check('7-2. 和可昕交往、人在美國的七夕：只排 usl_qixi，FEST 的臺灣版（「你不來，我就自己看港口。」）不排（dedicated）',kx[0]===true&&!kx[1].length&&kx[2]===true,J(kx));
  /* 7-3 挽回中的招呼 */
  const GI=STORY.LADDER_GREET_IF, US0=SISB16_LINES.greetUS, RP=SISB16_LINES.greetUSRepair, BK=SISB16_LINES.greetBack;
  fresh('2028-11-01',10,'us_lawlib',US()); date(SIS,'2028-07-01'); const d=[GI[US0].test(H.G),GI[RP].test(H.G),GI[BK].test(H.G)];
  fresh('2028-11-01',10,'us_lawlib',US()); H.FRIEND(SIS); const r=[GI[US0].test(H.G),GI[RP].test(H.G),GI[BK].test(H.G)];
  fresh('2028-11-01',10,'dorm',TW()); H.FRIEND(SIS); const t=[GI[US0].test(H.G),GI[RP].test(H.G)];
  at('2028-12-24',10); fresh('2028-12-24',10,'campus',US()); H.FRIEND(SIS); const b=[GI[US0].test(H.G),GI[RP].test(H.G),GI[BK].test(H.G)];
  const got=[]; fresh('2028-11-01',10,'us_lawlib',US()); H.FRIEND(SIS); for(let i=0;i<15;i++){ H.G.social.greetUsed={}; H.G.day=D('2028-11-01')+i; const g=STORY.ladGreet&&STORY.ladGreet(H.G,SIS); if(g) got.push(g); }
  check('7-3. 學姊的美國招呼：交往中＝遞保溫瓶那一句；挽回中（美國路線、沒在交往）＝「這邊的飲水機只有冰的。我自己帶。」、不遞保溫瓶；12/24 回來以後兩句都不說、說回來的那一句；臺灣路線照原本',
    J(d)===J([true,false,false])&&J(r)===J([false,true,false])&&J(t)===J([true,false])&&J(b)===J([false,false,true])&&got.length>0&&!got.includes(US0)&&got.includes(RP),J({d,r,t,b,got}));
  /* 7-4 朋友版週日視訊七句輪流 */
  const Rr={}, seqN=[]; for(let d=D('2028-08-06');d<=D('2028-12-17');d+=7) seqN.push([keyOf(d),R2Y4B.saVNarrNext(Rr,d)]);
  const idx=seqN.map(x=>x[1]), w=D('2028-11-06');
  check('7-4. 七句照順序輪流（第 1 句原句起）、不和上一週同一句、第 7 句只在 11/6 以後的週日（冬令）、七句都輪得到',idx[0]===0&&idx.every((v,i)=>i===0||v!==idx[i-1])&&seqN.every(([k,v])=>v!==6||D(k)>=w)&&seqN.some(([k,v])=>v===6)&&new Set(idx).size===7&&J(idx.slice(0,7))===J([0,1,2,3,4,5,0]),J(seqN));
  const narr=async k=>{ fresh('2028-11-12',9,'dorm',TW()); H.FRIEND(SIS); const sa={k:20,set:3}; if(k!=null) sa.narr=k; OUT.plan(H.G,{id:'y4_sa_v_20',ev:'ev_sis_video',day:H.G.day,h:10,place:'視訊',title:'t',sa}); at('2028-11-12',10); await runEv('ev_sis_video'); return said().filter(t=>/^（視訊。/.test(t)); };
  const all=[]; for(let k=0;k<7;k++) all.push(await narr(k)); const old=await narr(null);
  check('7-4. ev_sis_video 旁白那一週：出遊記的第幾句就演那一句（一次一句）；舊存檔排好的（沒有記）＝第 1 句原句',all.every((L,k)=>L.length===1&&L[0]===DOC74[k])&&old.length===1&&old[0]===DOC74[0],J({all,old}));
  /* 接進每週那一套：臺灣路線、朋友 T3，三組用完以後的旁白週記了 narr */
  fresh('2028-08-05',9,'dorm',TW()); H.CLOSE(SIS); if(INV.addContact) INV.addContact(H.G,SIS); const F=H.G.flags; F.SIS_AB={k:-1,tier:3,i1:9,i2:9,i3:3,ix:9,t1k:-9,log:[],v:2,t3:4};
  if(typeof DATE!=='undefined'&&DATE.stageNum){ const s0=DATE.stageNum; DATE.stageNum=id=>id===SIS?6:s0(id); try{ for(let d=D('2028-08-06');d<=D('2028-09-03');d+=7) phAt(d,8.1); } finally { DATE.stageNum=s0; } }
  const vq=OUT.rec(H.G).filter(x=>/^y4_sa_v_/.test(x.id)).map(x=>[keyOf(x.day),x.sa.set,x.sa.narr]);
  check('7-4. 每週那一套（R2Y4B saWeekly）：旁白那幾週（set 3）照順序記 narr 0、1、2…',vq.length>=3&&vq.every((x,i)=>x[1]===3&&x[2]===i),J(vq)); });

H.done();
})();

// AA_516 學姊第十四批：她在美國的五個月（企劃線 a9b87c588 → cf7d5fa94 第 7 節：4-3 結帳那句改「……我的也舊了。順便。」、日本路線沒有 2-3 → 3cd10909b 第 8 節：懸著的承諾補兩句（下次你用我的碗、你站右邊）→ d6f8621ac 第 8 節第 3 點：碗那一句的位置；AA-C 2026-10-28；任務 SIS-B14-1028、SIS-B14-AAFIX-1028、SIS-LEAD-1021、D111、USER_WANTS C25）——不需要瀏覽器。
// 第 7 節（cf7d5fa94）修改前（只拿掉 sis_b14_events.js 那一句的改動，白名單、測試用新的）：FAILED 3（第 0 段雙向對稿兩項、第 7 段 4-3 逐字）；修改後 ALL PASS。
// 第 8 節（3cd10909b，SIS-B14-AAFIX-1028）修改前（只拿掉這次 src 的改動：us208_3d.js、us_blank3d.js、sis_b14_3d.js、data/sis_b14_events.js、data/r2y4a_events.js、data/r2y4b_events.js；白名單、測試用新的）：FAILED 10、PASS 110
//   （FAIL＝第 0 段 SISB14_LINES 對照的兩句一項；第 10 段九項：稿 → 遊戲、七場開頭、只一次、滷肉的順序、私訊「我過去。」的出遊、h9 記 SIS14_RIGHT、接機戀人版、CG 冬天版、日本路線；
//    PASS＝讀稿、白名單、七場的 id、「不該有」那幾項：沒吃過咖哩、舊存檔已經演過一場、兩個人版／家族共乘）；修改後 ALL PASS（120 項）。
// 第 8 節第 3 點（d6f8621ac，SIS-B14-AAFIX-1028 續：碗那一句的位置）修改前（只拿掉這次 src 的改動：data/r2y4a_events.js、us208_3d.js、us_blank3d.js、sis_b14_3d.js、data/sis_b14_events.js；
//   白名單、測試用新的；那時七場第一句都是碗那一句）：FAILED 9、PASS 115
//   （FAIL＝第 10 段第 3 點九項：放的地方、US2「那就寫妳。」分碗後面、US2 另外兩支順延到 3-2、沒去 US2（3-1 不算）、七場各自當第一場、舊存檔、滷肉的順序、US2 私訊「我過去。」的出遊、3-2 私訊「我過去。」的出遊；
//    PASS＝第 0～9 段、讀稿、稿 → 遊戲、七場的 id、沒吃過咖哩、第 2 點五項）；修改後 ALL PASS（124 項）。
// 台詞逐字對稿（git show d6f8621ac，第 1～7 節和 a9b87c588／cf7d5fa94 相同、第 8 節第 1～2 點和 3cd10909b 相同：第 2～5 節的「>」、選項、說明裡的「」；第 1 節表格「改成」那一欄；第 8 節兩句；兩個方向）。
// 玩家：A 臺灣交往中、B 日本交往中、C 臺灣朋友（T3）、D 沒見過她（1-6）、E 美國交往中、F 美國沒交往（挽回中）。
//   0  讀稿、新檔載得到、index.html 順序；稿 → 遊戲（每一句、每個選項、說明裡的「」、第 1 節改成的字）、遊戲 → 稿（新檔每一句＋各檔帶 aa516 的行＋改字）；第 1 節換掉的舊句不在遊戲裡
//   1  第 1 節：1-1 g6、1-2 12/20 截圖在前、1-3 大峽谷才交往（10/22 開頭那一句一次、h5 不是 g1）、1-4 動態、1-5 13-7 20:30 和跨年私訊 21:00 錯開、1-6 接機按鈕要見過她、
//      1-7 saOn 要聯絡方式（家族群組照片照常）、1-8～1-10 家族群組 11/19、12/3、12/6、1-11 秋假 10/9、10/10、1-12 美國路線不送書
//   2  2-1 8/3 22:00 電話：交往中＋送機（family／airport）接起來逐字、三個選項；沒接 22:40；人在家過了時間；第一次跑規則已經 23:00；沒交往、日本、客運都沒有；跳過時間停 22:00
//   3  2-2 週日視訊：臺灣交往中 20 週（旁白五週 8/6、8/27、9/10、10/8、10/29）；h1～h9 逐字兩個選項；h5「好吃嗎？」記 SIS14_CURRY_PROMISE；日本路線同；舊存檔 h 組不往後擠；舊的旁白（gset 6）照舊
//   4  2-3 等你考完：交往中 10/26 13:00、朋友 21:00、兩個回覆；那天自己先傳過＝沒有；沒有便條＝沒有
//   5  2-5 12/30 21:00 →「好。」→ 12/31 12:00 她家（兩個選項）；沒回、沒有 h5 那一句、美國路線、12/31 已經不在交往＝沒有
//   6  第 3 節 T3（朋友）：v0～v2 以後 t4 9/17、t5 10/22、t6 11/19、t7 12/17（其他週旁白）；t4～t7 逐字兩個選項
//   7  第 4 節美國交往中：4-1 9/1 21:00 → 9/2 14:00 208；4-2 SU-L6 → 隔天 07:00（沒到 07:15 兩則；隔天她去芝加哥＝不排）；
//      4-3 SU-L7「好。週六。」→ 那個週六 10:00（芝加哥那個週六順延）、12/2 初雪開頭那一句；4-4 第四十天「我過去。」→ 當晚 22:30；4-5 SU-L8 → 12/16 離開那天那一句
//   8  第 5 節挽回中：9/2 10:00 交換生群組一則、回「收到。」REPAIR +1（同一週其他來源不再加）；交往中沒有
//   9  舊存檔：沒有新旗標照常跑、不丟例外；這一批沒有 3D 當面的入口（全部是出遊、電話、視訊、私訊；PRIVTALK 不用登記）
//   10 第 8 節（3cd10909b → d6f8621ac 第 3 點）懸著的承諾兩句：稿 → 遊戲（兩句「>」）；第 1 點 4-1 吃過咖哩（SIS14_US_CURRY）＝之後第一次有吃東西的 208 場景那一句（第 3 點）——
//      先算 9/13 US2（ev_us2_kitchen）：選「那就寫妳。」那一支接在「（她把麵分到兩個碗。）」後面（坐高腳椅、回 18:00 私訊「我過去。」的出遊兩條路）；
//      沒演到（沒去 US2、選了沒有分碗的另外兩支）＝3-2 滷肉、接在第一句旁白後面（走進 208、回週末私訊「我過去。」兩條路）；3-1 看作業那一類（其他六場）不放、先演了也不算；
//      只一次（SIS14_BOWL；US2 演了 3-2 就沒有）、沒有 SIS14_US_CURRY 沒有；滷肉那一場「（你認得那包八角。）」接在碗那一句後面；
//      舊存檔（3cd10909b 那一版 3-1 已經演過碗＝不再演；3-1、US2 演過、還沒演過碗＝3-2 照樣有）；
//      第 2 點 h9「我會去接妳。」記 SIS14_RIGHT（另一個不記）＝12/23 接機戀人版第一句旁白前面那一句（CG 冬天版通過沒通過都接「她一出來就看到你。」）、日本路線一樣；沒有 SIS14_RIGHT、兩個人版、家族共乘沒有
// 修改前（開發分支 67a602cd0：那一版的 index.html、src/、tests/、lib/ 放進這支測試真的跑過，稿從這個 repo 讀：AA516_DOCREPO）：FAILED 81、PASS 13
//   （PASS＝讀稿、日子、「不該有／照舊」那一類：2-1 沒交往等都沒有、舊的旁白、自己先傳過、4-2 另一個選項、交往中沒有群組那一則、新的局沒有 SIS14_*；
//    第 5 節、第 7 節 4-3 找不到新事件、丟例外中斷）。修改後 ALL PASS（105 項）。
// 全部 Node 單元測試（tests/*_unit.js，這一批的成果 7510f9279，2026-10-28）：723 支，結束碼不是 0 的 1 支＝tests/room_ceiling_unit.js（霖澤館大廳吊燈，已知、和這一批無關）。
// 照 AA_516 第 1 節改的舊測試：aa392_sis_b6（1-1 g6、1-3）、r2y4a_events（1-2）、r2y4b_events（1-11）、aa464_y4s1（1-8～1-10）、aa508_509_feed（1-4）、aa512_sis_b13（1-5，稿 a9b87c588）；
//   第 5 節：aa424_us_blank（9/2）；2D 背景：scene_bg_keys（PENDING 兩個）。
// 用法：node tests/aa516_sis_b14_unit.js（在沒有 .git 的目錄跑，設環境變數 AA516_DOCREPO＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, ID='heroine_05', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa512_sis_b13_unit.js：pg_harness 已經載過的不再載；畫 3D 的幾支在 Node 載不進來，跳過）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
{ const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,120)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};   /* 家人群組的週訊息和這裡無關 */
const X=()=>typeof SISB14!=='undefined'?SISB14:null, RB=()=>typeof R2Y4B!=='undefined'?R2Y4B:null;
const D=k=>typeof k==='number'?k:STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const said=()=>H.said.map(x=>x.t), has=t=>H.said.some(x=>x.t===t);
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag), TH=th=>(H.G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null;
const wait=()=>new Promise(r=>setTimeout(r,0));
/* 存檔：kind＝'none'（沒見過她）／'fam'（熟悉）／'friend'（朋友）／'dating'（交往中）／'ex'（前任）*/
const fresh=(key,h,kind,flags,o)=>{ o=o||{}; const met=kind!=='none';
  const G=H.fresh(typeof key==='number'?keyOf(key):key,h,o.zone||'dorm',Object.assign({EXCHANGE_ROUTE:o.route||'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true},met?{met_sis:true,SIS_W1:true}:{},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G); if(o.grp!==false) PHONE.join(G,'family_law','法律系直屬家族');
  if(kind==='fam') H.FAMILIAR(ID); else if(kind==='friend') H.FRIEND(ID); else if(kind==='dating'){ H.FRIEND(ID); H.date(ID); } else if(kind==='ex'){ H.FRIEND(ID); H.date(ID); ROM.end(G,ID,'test'); }
  if(met&&typeof INV!=='undefined'&&INV.addContact) INV.addContact(G,ID);
  E.player.busy=false; E.paused=false; E.player.lv=0; E.player.seat=null; E.player.obj.position.x=0; E.player.obj.position.z=0; E.npcs.length=0; GM.npc={}; ADV.active=false; if(typeof SUP497!=='undefined') SUP497.bind(GM); STORY._bindGM(GM);
  H.at(typeof key==='number'?keyOf(key):key,h); return G; };
const us=(key,h,kind,fl)=>fresh(key,h,kind,Object.assign({US_ARRIVED:true,US1:'together'},fl||{}),{route:'US',zone:'us_apartment'});
const at=(key,h)=>{ H.at(typeof key==='number'?keyOf(key):key,h); };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const phAt=(key,h)=>{ at(key,h); ph(); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const runEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const e=ev(id); if(!e) throw new Error('沒有事件 '+id); await EVENTS.run(e); };
const answer=(id,k)=>PHONE.answer(H.G,id,k);
const askOpts=id=>{ const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id===id); return m?m.ask.opts.map(o=>o.t):null; };
const expire=()=>{ for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); };   /* 出遊過了時間＝missed（遊戲裡是 OUT.tick）*/
/* 每週視訊：直接排一格演（gset：交往中那一套；set：朋友 T3）*/
const vidGf=async(key,gset,picks,fl,o)=>{ fresh(key,10,'dating',fl,o); const q={id:'y4_sa_g_t',ev:'ev_sis_video_gf',day:D(key),h:10,late:1,place:'視訊',verb:'接起來',title:'視訊',travel:'',travelH:0,sa:{k:0,gset}}; OUT.rec(H.G).push(Object.assign({state:'planned',ask:null},q)); await goOut(q.id,picks); };
const vidT3=async(key,set,picks)=>{ fresh(key,10,'friend'); const q={id:'y4_sa_v_t',ev:'ev_sis_video',day:D(key),h:10,late:1,place:'視訊',verb:'接起來',title:'視訊',travel:'',travelH:0,sa:{k:0,set}}; OUT.rec(H.G).push(Object.assign({state:'planned',ask:null},q)); await goOut(q.id,picks); };
/* 一天一天走（R2Y4B 的手機規則）：每週的視訊到了當作接了（miss(k) 為真＝沒接）*/
const walk=(d0,d1,miss)=>{ for(let d=D(d0);d<=D(d1);d++) for(const h of [6,7.5,8.5,9.5,10.5,12,20]){ at(d,h); RB().phone(H.G,GM); PHONE.tick(H.G);
  for(const q of OUT.rec(H.G)) if(/^y4_sa_(g|v)_/.test(q.id)&&q.state==='planned'&&T(q.day,q.h)<=T(d,h)){ if(miss&&q.sa&&miss(q.sa.k)){ q.state='missed'; OUT.onMissed(GM,q); } else q.state='done'; } } };
const gv=re=>OUT.rec(H.G).filter(q=>re.test(q.id)).sort((a,b)=>a.day-b.day);
const stepOf=id=>{ const L=LADDER&&LADDER.byTerm&&LADDER.byTerm.Y4S1&&LADDER.byTerm.Y4S1[ID]; return L&&L.steps?L.steps.find(s=>s.id===id)||null:null; };
const lad=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const st=stepOf(id); if(!st) throw new Error('沒有閒聊階梯 '+id); await STORY.ladPlay(GM,ID,ID,st); };

/* ---------- 讀稿 ---------- */
const SHA='913802344', DOCF='docs/story_planning/AA_516_學姊第十四批_她在美國的五個月.md';
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:process.env.AA516_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ DOC=''; }
const part=(a,b,src)=>{ const S=src==null?DOC:src, i=S.indexOf(a); if(i<0) return ''; const j=b?S.indexOf(b,i+1):-1; return S.slice(i,j<0?S.length:j); };
const S1=part('## 1. 修正','## 2. '), BODY=part('## 2. ','## 6. ');   /* 第 1 節（表）、第 2～5 節（台詞）*/
const qtext=s=>/^（/.test(s)?s:s.slice(s.indexOf('：')+1);   /* 「> 學姊：…」→ 那一句；「> （…）」→ 旁白整句 */
const QUOTES=BODY.split('\n').map(l=>/^\s*>\s*(.+)$/.exec(l)).filter(Boolean).map(m=>qtext(m[1].trim()));
const OPTRE=/^- (「[^」]+」|（[^）]+）)→(.*)$/;
const inl=s=>[...String(s).matchAll(/「([^」]+)」|（[^）]+）/g)].map(x=>x[1]!=null?x[1]:x[0]);   /* →右邊寫在同一行的回覆：「…」、（旁白）*/
const OPTS=[], INLR=[]; for(const l of BODY.split('\n')){ const m=OPTRE.exec(l.trim()); if(!m) continue; OPTS.push(m[1]); INLR.push(...inl(m[2])); }
/* 一段（h1、t4、2-1…）：pre＝選項前的句子、opts＝[{o,r}]（r：縮排在那個選項下面的「>」或同一行 → 右邊的）、post＝選項後回到頂格的句子 */
const blk=t=>{ const out={pre:[],opts:[],post:[]}; let cur=null, ci=-1;
  for(const raw of String(t).split('\n')){ const ind=raw.length-raw.trimStart().length, l=raw.trim(); let m=OPTRE.exec(l);
    if(m){ cur={o:m[1],r:inl(m[2])}; ci=ind; out.opts.push(cur); continue; }
    m=/^>\s*(.+)$/.exec(l); if(!m){ if(/^- /.test(l)&&cur&&ind<=ci) cur=null; continue; }
    const s=qtext(m[1].trim()); if(cur&&ind>ci) cur.r.push(s); else if(out.opts.length){ cur=null; out.post.push(s); } else out.pre.push(s); }
  return out; };
const want=(b,k)=>b.pre.concat(b.opts.length?b.opts[k].r:[],b.post);
const unq=t=>String(t).replace(/^「|」$/g,'');
/* 第 1 節的表：| 1-x | 哪裡 | 現在 | 改成 | */
const ROW={}; for(const l of S1.split('\n')){ const c=l.split('|').map(x=>x.trim()); if(/^1-\d+$/.test(c[1]||'')) ROW[c[1]]={now:inl(c[3]).filter(x=>!/^（/.test(x)||/^（照片/.test(x)),to:inl(c[4]).filter(x=>!/^（/.test(x)||/^（照片/.test(x))}; }

/* 第 8 節（3cd10909b）：懸著的承諾，兩句（第 1 點 4-1 碗、第 2 點 h9 右邊）；第 3 點（d6f8621ac）：碗那一句放哪一場、放在哪裡；第 4 點（913802344）：碗那一句的細位置 */
const S8=part('## 8. ',null), S8B1=part('1. **4-1','2. **h9',S8), S8B2=part('2. **h9','3. **第 1 點',S8), S8B3=part('3. **第 1 點','4. **碗那一句的細位置',S8), S8B4=part('4. **碗那一句的細位置',null,S8);
/* 稿裡寫在說明句、手機訊息裡的（從稿讀；測試拿這些比遊戲，不拿遊戲的 SISB14_LINES 比遊戲）*/
const one=(re,src)=>{ const m=re.exec(src==null?BODY:src); return m?m.slice(1):[]; };
const quotesOf=t=>String(t).split('\n').map(l=>/^\s*>\s*(.+)$/.exec(l)).filter(Boolean).map(m=>qtext(m[1].trim()));
const DX={
  canyonOpen:(ROW['1-3']||{to:[]}).to[0],
  callMiss:one(/22:40 私訊「([^」]+)」/)[0],
  examGf:quotesOf(part('- **交往中**','- 「考完了。」',part('### 2-3','### 2-4'))),
  examFriend:quotesOf(part('- **朋友**','- 「考完了。」',part('### 2-3','### 2-4'))),
  curryHome:one(/21:00 私訊：「([^」]+)」/,part('### 2-5','## 3.'))[0],
  usCurry:quotesOf(part('- 9/1（五）21:00','- 「好。」',part('### 4-1','### 4-2'))),
  eggsMiss:one(/07:15 私訊「([^」]+)」「([^」]+)」/),
  snowCoat:one(/開頭多一句旁白：「([^」]+)」/,part('### 4-3','### 4-4'))[0],
  leaveBook:quotesOf(part('### 4-5','## 5.'))[0],
  bowl:quotesOf(S8B1)[0], right:quotesOf(S8B2)[0] };
/* 遊戲這一批的字：新檔（SISB14_LINES、SISB14_EVENTS）＋各檔帶 aa516 的行（事件的台詞、選項）＋改字（12/20 的截圖、家族群組三句、9/2 交換生群組）*/
const strDeep=(v,out)=>{ if(v==null) return out; if(typeof v==='string'){ out.push(v); return out; } if(Array.isArray(v)){ v.forEach(x=>strDeep(x,out)); return out; } if(typeof v==='object') for(const k in v) strDeep(v[k],out); return out; };
const evTexts=(L,pick)=>{ const A=[]; for(const l of (L||[])){ if(typeof l.text==='string'&&pick(l)) A.push(l.text); if(l.choice) for(const c of l.choice) if(pick(c)||pick(l)) A.push(c.text); } return A; };
const grp0902=()=>((typeof US_BLANK!=='undefined'&&US_BLANK.GRP)||[]).find(r=>r.d==='2028-09-02')||null;
const mineTexts=()=>{ const A=[]; if(typeof SISB14_LINES!=='undefined') strDeep(SISB14_LINES,A);
  const mine=new Set(); if(typeof SISB14_EVENTS!=='undefined') for(const e of SISB14_EVENTS) for(const l of (e.dialogue||[])) mine.add(l);
  for(const e of STORY_EVENTS) A.push(...evTexts(e.dialogue,l=>!!l.aa516||mine.has(l)));
  if(typeof R2Y4A!=='undefined'&&R2Y4A.PICKUP_SHOT) A.push(R2Y4A.PICKUP_SHOT);
  if(typeof Y34B!=='undefined'){ A.push(Y34B.M6_QUIET[9],Y34B.M6_QUIET[11],Y34B.M6_WED[12][0]); }
  const g=grp0902(); if(g){ A.push(...g.post,g.reply); }
  return A.filter(t=>typeof t==='string'&&t.length); };
const allTexts=()=>{ const A=mineTexts(); for(const e of STORY_EVENTS) A.push(...evTexts(e.dialogue,()=>true)); return new Set(A.concat(A.map(unq))); };

(async()=>{
/* ---- 0 ---- */
await sec(0,()=>{ const a=s=>html.indexOf(s);
  check('0. 讀得到稿（AA_516 '+SHA+'：第 1 節的表、2-1～2-5、第 3 節 t4～t7、4-1～4-5、第 5 節）',DOC.length>6000&&!!S1&&BODY.indexOf('**h9（12/17 起）')>0&&BODY.indexOf('**t7（12/17 起）')>0&&BODY.indexOf('### 4-5')>0&&Object.keys(ROW).length===12,J({len:DOC.length,rows:Object.keys(ROW)}));
  { const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_516_/.test(e.path));
    check('0. 劇情匯入白名單有 AA_516（sha '+SHA+'＝AA 加了第 8 節第 4 點那一版、approved、任務 SIS-B14-1028）；這支測試對同一版的稿',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].task==='SIS-B14-1028',J(A.map(e=>({sha:e.sha,status:e.status,task:e.task})))); }
  check('0. 新檔載得到（SISB14、SISB14_LINES、SISB14_EVENTS）；全部的檔載入沒有錯誤',!loadErr.length&&!!X()&&typeof SISB14_LINES!=='undefined'&&Array.isArray(typeof SISB14_EVENTS!=='undefined'?SISB14_EVENTS:null),J(loadErr));
  check('0. index.html：sis_b13_3d.js → data/sis_b14_events.js → sis_b14_3d.js；在 GAME.boot() 前面',
    /src\/sis_b13_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/sis_b14_events\.js\?v=[^"]+"><\/script>\n<script src="src\/sis_b14_3d\.js\?v=[^"]+"><\/script>/.test(html)&&a('src/sis_b14_3d.js')<a('<script>GAME.boot();</script>'));
  const GS=allTexts();
  /* 稿 → 遊戲 */
  const lostQ=QUOTES.filter(t=>!GS.has(t)), lostO=OPTS.filter(o=>!GS.has(o)&&!GS.has(unq(o))), lostR=INLR.filter(t=>!GS.has(t));
  check('0. 稿 → 遊戲：第 2～5 節每一句「>」（'+QUOTES.length+' 句）都在遊戲裡',QUOTES.length===86&&!lostQ.length,J(lostQ));
  check('0. 稿 → 遊戲：每個選項（'+OPTS.length+' 個）、→ 同一行的回覆（'+INLR.length+' 句）都在遊戲裡',OPTS.length===39&&INLR.length===16&&!lostO.length&&!lostR.length,J({lostO,lostR}));
  const INLINE=['打了。你在忙。……群組見。','明天中午，我家。……鍋子洗好了。','好。','三顆。吃完了。','……第四顆留給你。','（你穿著那件外套。她也是。）','勞動節週末，法學院圖書館只開到下午五點。','收到。','峽谷回來以後，第一次這樣打給你。'];   /* 稿寫在說明句裡的（「」括起來）*/
  check('0. 稿寫在說明裡的句子（22:40 私訊、12/30 私訊與「好。」、07:15 兩則、初雪那一句、9/2 交換生群組與「收到。」、1-3 開頭那一句）都在稿裡、也在遊戲裡',INLINE.every(t=>DOC.indexOf('「'+t+'」')>=0&&GS.has(t)),J(INLINE.filter(t=>!(DOC.indexOf('「'+t+'」')>=0&&GS.has(t)))));
  /* 遊戲 → 稿 */
  const M=mineTexts(), notIn=[...new Set(M)].filter(t=>DOC.indexOf(t)<0&&DOC.indexOf(unq(t))<0);
  check('0. 遊戲 → 稿：新檔的每一句、各檔帶 aa516 的行、改字（'+new Set(M).size+' 句）都在稿裡（一字不差）',new Set(M).size>=150&&!notIn.length,J(notIn));
  /* 第 1 節：改成的字在遊戲裡、換掉的不在 */
  const to=['1-1','1-2','1-3','1-8','1-9','1-10'].map(k=>ROW[k]&&ROW[k].to).flat().filter(Boolean);
  check('0. 第 1 節「改成」那一欄（1-1 兩句、1-2 截圖、1-3、1-8、1-9、1-10）都在遊戲裡',to.length===7&&to.every(t=>GS.has(t)),J(to.filter(t=>!GS.has(t))));
  const old=['1-1','1-8','1-9','1-10'].map(k=>ROW[k]&&ROW[k].now).flat().filter(Boolean), live=new Set(STORY_EVENTS.map(e=>evTexts(e.dialogue,()=>true)).flat().concat(Y34B.M6_QUIET,Object.values(Y34B.M6_WED).flat()));
  check('0. 第 1 節「現在」那一欄換掉的（g6 兩句、家族群組三句）不在遊戲裡',old.length===5&&old.every(t=>!live.has(t)),J(old.filter(t=>live.has(t))));
  const EVS=typeof SISB14_EVENTS!=='undefined'?SISB14_EVENTS:[];
  check('0. 新的事件都是出遊（電話、視訊、私訊約好的 2D）：沒有 3D 當面的入口（PRIVTALK 不用登記）',EVS.length===6&&EVS.every(e=>e.trigger==='outing'&&!e.near&&!e.prereq),J(EVS.map(e=>e.id+':'+e.trigger)));
  const LX=typeof SISB14_LINES!=='undefined'?SISB14_LINES:{}, keys=Object.keys(DX);
  check('0. 稿裡手機那幾則、說明裡的句子（'+keys.join('、')+'）讀得到，SISB14_LINES 一字不差',keys.every(k=>DX[k]&&DX[k].length)&&DX.examGf.length===2&&DX.examFriend.length===1&&DX.usCurry.length===2&&DX.eggsMiss.length===2&&keys.every(k=>J(LX[k])===J(DX[k])),J({DX,LX:keys.map(k=>LX[k])})); });

/* ---- 1 第 1 節 ---- */
await sec(1,async()=>{
  /* 1-1 */
  await vidGf('2028-12-10',5,[0]); check('1. 1-1 g6（12/10）：「二十三號晚上八點落地。」「班次，回去前傳給你。」（沒有「早上到」「傳給你了」）',J(said().slice(0,2))===J(ROW['1-1'].to)&&!has('二十三號早上到。')&&!has('機場的班次我傳給你了。'),J(said()));
  /* 1-2 */
  fresh('2028-12-20',21.1,'dating'); ph(); const dm=byTag('y4_pickup_dm').map(m=>m.text);
  check('1. 1-2 戀人版 12/20 21:00 私訊：先「📷（截圖：班機時間，桃園 20:05 抵達）」再「這週六，晚上八點。你來。」',J(dm)===J([ROW['1-2'].to[0],'這週六，晚上八點。你來。']),J(dm));
  /* 1-3 */
  fresh('2028-08-02',20,'friend'); H.rel(ID,60,45,40); walk('2028-08-03','2028-10-06');
  OUT.plan(H.G,{id:'y4_sis_canyon',ev:'ev_sis_canyon',day:D('2028-10-07'),h:7,place:'桃園機場',title:'秋假',travel:'',travelH:1}); OUT.get(H.G,'y4_sis_canyon').state='done';
  at('2028-10-13',18); RB().canyonAfter(H.G,'tw'); at('2028-10-15',21); RB().phone(H.G,GM); walk('2028-10-15','2028-12-20');
  const C=gv(/^y4_sa_g_/).map(q=>keyOf(q.day)+':'+q.sa.gset);
  check('1. 1-3 大峽谷才交往（SIS_GF_CANYON）：大峽谷那一週不排；10/22 是 h5（gset 11，不是 g1）、10/29 旁白、11/5 g4、之後照日期（h6 11/12、h7 11/19、g5 11/26、h8 12/3、g6 12/10、h9 12/17）',H.G.flags.SIS_GF_CANYON!=null&&J(C)===J(['2028-10-22:11','2028-10-29:6','2028-11-05:3','2028-11-12:12','2028-11-19:13','2028-11-26:4','2028-12-03:14','2028-12-10:5','2028-12-17:15']),J(C));
  { const F0=Object.assign({},H.G.flags); await vidGf('2028-10-22',11,[1],{SIS_GF_CANYON:F0.SIS_GF_CANYON}); const s1=said(); const flag=H.G.flags.SIS14_CANYON_OPEN;
    const q={id:'y4_sa_g_t2',ev:'ev_sis_video_gf',day:D('2028-10-29'),h:10,late:1,place:'視訊',verb:'接起來',title:'視訊',travel:'',travelH:0,sa:{k:12,gset:6}}; OUT.rec(H.G).push(Object.assign({state:'planned',ask:null},q)); at('2028-10-29',10); await goOut(q.id); const s2=said();
    check('1. 1-3 開始交往後第一次女朋友視訊：開頭「峽谷回來以後，第一次這樣打給你。」→ h5；記 SIS14_CANYON_OPEN；下一次（10/29）沒有',s1[0]===DX.canyonOpen&&s1[1]==='宿舍廚房的鍋子太薄了，咖哩會黏底。'&&flag===true&&!s2.includes(DX.canyonOpen),J({s1,s2})); }
  await vidGf('2028-10-22',11,[1]); check('1. 1-3 不是大峽谷才交往的：沒有那一句',said()[0]==='宿舍廚房的鍋子太薄了，咖哩會黏底。'&&!has(DX.canyonOpen),J(said()));
  /* 1-4 */
  const W=FEED.WENT.sisUS; const w1=W({flags:{EXCHANGE_ROUTE:'US',dating_heroine_05:true}}), w2=W({flags:{EXCHANGE_ROUTE:'US'}}), w3=W({flags:{EXCHANGE_ROUTE:'US',EX_heroine_05:true}}), w4=W({flags:{EXCHANGE_ROUTE:'TW',dating_heroine_05:true}});
  check('1. 1-4 動態 WENT.sisUS：美國路線而且交往中＝「你的」那一版；挽回中、挽回不成、臺灣路線＝一般版',w1===true&&w2===false&&w3===false&&w4===false,J([w1,w2,w3,w4]));
  /* 1-5 */
  { const a=D('2028-12-26'); fresh(a,20,'dating'); phAt(a,20.45); const w0=byTag('sisb13_welcome_ask').length; phAt(a,20.6); const w=byTag('sisb13_welcome_ask'), n0=byTag('sisb10_nye_ask_y4').length; phAt(a,21.05); const n=byTag('sisb10_nye_ask_y4');
    check('1. 1-5 12/26：家族群組 13-7 在 20:30（20:27 還沒有）；交往中的跨年私訊 21:00 才來（兩則錯開）',w0===0&&w.length===2&&w.every(m=>m.h>=20.5&&m.h<20.75)&&n0===0&&n.length>=1&&n.every(m=>m.h>=21),J({w:w.map(m=>m.h),n:n.map(m=>m.h)})); }
  /* 1-6 */
  fresh('2028-12-20',21.1,'none'); ph(); const g1=txt('g:family_law'), b1=PHONE.byAsk(H.G,'y4_pickup');
  fresh('2028-12-20',21.1,'fam'); ph(); const b2=PHONE.byAsk(H.G,'y4_pickup');
  check('1. 1-6 接機家族版：沒見過她＝群組兩句照看到、沒有「我去接。我有車。」；見過（熟悉）＝有按鈕',g1.includes('這週六晚上八點落地。')&&g1.includes('……有人有空嗎。')&&!b1&&!!b2&&J(b2.ask.opts.map(o=>o.t))===J(['我去接。我有車。']),J({g1,b1:!!b1,b2:b2&&b2.ask.opts}));
  /* 1-7 */
  { const c0=INVITE_DATA.contacts0; let on1=null, on0=null, sa=0, m6=0;
    try{ fresh('2028-08-05',20,'dating'); on1=RB().saOn(H.G); INVITE_DATA.contacts0=c0.filter(x=>x!==ID); delete H.G.contacts[ID]; on0=RB().saOn(H.G);
      for(let d=D('2028-08-06');d<=D('2028-08-15');d++) for(const h of [9.5,10.5,20.5]){ at(d,h); ph(); }
      sa=(H.G.msgs||[]).filter(m=>/^y4_sa_/.test(m.tag||'')).length+OUT.rec(H.G).filter(q=>/^y4_sa_/.test(q.id)).length; m6=(H.G.msgs||[]).filter(m=>/^y4_m6_/.test(m.tag||'')).length; }
    finally{ INVITE_DATA.contacts0=c0; }
    check('1. 1-7 saOn：有她的聯絡方式才開（每週的私訊、視訊）；沒有聯絡方式＝都沒有，家族群組的照片照常',on1===true&&on0===false&&sa===0&&m6>=8,J({on1,on0,sa,m6})); }
  /* 1-8～1-10 */
  { fresh('2028-08-01',9,'friend'); for(const [k,h] of [['2028-11-19',20.5],['2028-12-03',20.5],['2028-12-06',9.5]]){ at(k,h); ph(); }
    const s19=txt('g:family_law').filter((t,i,A)=>byTag('y4_m6_sun_'+D('2028-11-19')).some(m=>m.text===t)), s3=byTag('y4_m6_sun_'+D('2028-12-03')).map(m=>m.text), w6=byTag('y4_m6_d'+D('2028-12-06')).map(m=>m.text);
    check('1. 1-10 11/19（日）「今天不吵。這禮拜四感恩節，大家都要回家。」；1-8 12/3（日）「今天不吵。雪積起來了。」；1-9 12/6（三）照片「（照片：積雪的步道，上面一排腳印）」',s19.includes(ROW['1-10'].to[0])&&s3.includes(ROW['1-8'].to[0])&&w6.includes(ROW['1-9'].to[0])&&CALENDAR.dateOf(D('2028-12-06')).wd===3,J({s19,s3,w6})); }
  /* 1-11 */
  { us('2028-10-07',9.1,'friend',{MET_LONG:true}); const a7=RB().usFallDue(H.G); at('2028-10-08',9.1); const a8=RB().usFallDue(H.G); at('2028-10-09',8.9); const b9=RB().usFallDue(H.G); at('2028-10-09',9.1); const a9=RB().usFallDue(H.G);
    H.said=[]; await RB().usFall(GM,1); at('2028-10-10',9.1); const a10=RB().usFallDue(H.G); await RB().usFall(GM,a10);
    check('1. 1-11 美國路線挽回中：秋假兩個摘要日 10/9、10/10 09:00 以後（10/7、10/8 沒有）；字不改',a7==null&&a8==null&&b9==null&&a9===1&&a10===2&&has('秋假。社區的停車場空了一半。')&&has('何俊朗去了芝加哥找朋友。你把三門課的閱讀都讀完了。'),J({a7,a8,b9,a9,a10,s:said()})); }
  /* 1-12 */
  { us('2028-09-17',20,'fam',{SIS_BOOK:'law'}); phAt('2028-09-18',9.2); const u=byTag('sisb9_book_law').length; fresh('2028-09-17',20,'fam',{SIS_BOOK:'law'}); phAt('2028-09-18',9.2); const t=byTag('sisb9_book_law').length;
    us('2028-08-14',20,'fam',{SIS_BOOK:'both'}); phAt('2028-08-14',21.1); const ub=(H.G.msgs||[]).some(m=>m.ask&&m.ask.id==='sisb9_book_remind');
    check('1. 1-12 SIS_BOOK：美國路線不送書的照片（9/18）、不提醒寄書；臺灣路線照舊',u===0&&!ub&&t===2,J({u,t,ub})); } });

/* ---- 2 2-1 8/3 那一通電話 ---- */
await sec(2,async()=>{ const d=D('2028-08-03'), B=blk(part('### 2-1','### 2-2'));
  check('2. 日子：2028-08-03 週四；稿 2-1 讀得到（四句、三個選項、最後一句）',CALENDAR.dateOf(d).wd===4&&B.pre.length===4&&B.opts.length===3&&B.post.length===1,J(B));
  fresh(d,19.5,'dating',{SIS_SENDOFF:'family'}); phAt(d,19.9); const q0=OUT.get(H.G,'sisb14_call0803'); phAt(d,20.05); const q=OUT.get(H.G,'sisb14_call0803');
  check('2. 交往中、家族共乘送機：8/3 20:00（前 2 小時）才排、22:00「書瑀打電話來」接起來（電話、不跳排進行程、不叫醒）',!q0&&!!q&&q.day===d&&q.h===22&&q.late===0.5&&q.call===true&&q.verb==='接起來'&&q.place==='電話'&&q.silent===true&&q.alarm===false&&q.ev==='ev_sis14_call0803',J(q));
  const stop=(CLS.STOP_FNS||[]).map(f=>{ try{ return f(H.G,20,23)||[]; }catch(e){ return []; } }).flat();
  check('2. 跳過時間：停在 22:00（手機響了）',stop.some(s=>s.h===22&&s.why==='手機響了'),J(stop));
  at(d,21.9); await goOut('sisb14_call0803',[0]); const s0=said();
  check('2. 接起來（「累嗎？」）：照稿四句 → 選項 →「累。……可是睡不著。這邊才早上十點。」→「下週日開始，每個禮拜打。……這是第一通，不算。」；記 SIS14_CALL0803',J(s0)===J(want(B,0))&&H.G.flags.SIS14_CALL0803===true&&J(H.opts[0])===J(B.opts.map(o=>o.o)),J(s0));
  for(const k of [1,2]){ fresh(d,21.5,'dating',{SIS_SENDOFF:'airport'}); ph(); at(d,21.9); await goOut('sisb14_call0803',[k]);
    check('2. 機場等她（airport）也有；選項 '+(k+1)+'：'+B.opts[k].o,J(said())===J(want(B,k)),J(said())); }
  fresh(d,20.5,'dating',{SIS_SENDOFF:'family'}); ph(); at(d,22.6); expire(); at(d,23); PHONE.tick(H.G); const m1=TH('p:'+ID).filter(m=>m.tag==='sisb14_call0803_miss');   /* 23:00 才看：照原本的時間補進去（PHONE.tick 15 分鐘以上）*/
  check('2. 22:30 還沒接：22:40 私訊「打了。你在忙。……群組見。」；SIS14_CALL0803 missed',m1.length===1&&m1[0].text===DX.callMiss&&Math.abs(m1[0].h-(22+40/60))<0.02&&H.G.flags.SIS14_CALL0803==='missed',J(m1));
  fresh(d,20.5,'dating',{SIS_SENDOFF:'family'}); ph(); phAt(d,22.6); at(d,22.7); PHONE.tick(H.G);
  check('2. 人在家（OUT.tick 不跑）：過了 22:30 規則自己記沒接、22:40 那一則',H.G.flags.SIS14_CALL0803==='missed'&&OUT.get(H.G,'sisb14_call0803').state==='missed'&&byTag('sisb14_call0803_miss').length===1);
  fresh(d,23,'dating',{SIS_SENDOFF:'family'}); ph(); check('2. 第一次跑規則已經 23:00（整段在別的劇情裡）：照沒接（22:40 那一則）',!OUT.get(H.G,'sisb14_call0803')&&byTag('sisb14_call0803_miss').length===1&&H.G.flags.SIS14_CALL0803==='missed');
  const none=[]; for(const [kind,fl,route] of [['friend',{SIS_SENDOFF:'two'}],['dating',{SIS_SENDOFF:'bus'}],['dating',{}],['dating',{SIS_SENDOFF:'family'},'JP']]){ fresh(d,20.5,kind,fl,{route}); ph(); at(d,23); ph(); if(OUT.get(H.G,'sisb14_call0803')||byTag('sisb14_call0803_miss').length) none.push(kind+J(fl)+(route||'')); }
  check('2. 沒交往（兩個人送機）、客運、沒有送機、日本路線：都沒有這一通',!none.length,J(none)); });

/* ---- 3 2-2 週日視訊 ---- */
await sec(3,async()=>{
  const HS=[1,2,3,4,5,6,7,8,9].map(i=>blk(part('**h'+i+'（',i<9?'**h'+(i+1)+'（':'### 2-3',BODY)));
  check('3. 稿讀得到 h1～h9（每組兩句以上、兩個選項）',HS.every(b=>b.pre.length>=2&&b.opts.length===2&&b.opts.every(o=>o.r.length>=1)),J(HS.map(b=>[b.pre.length,b.opts.length])));
  fresh('2028-08-02',20,'dating'); walk('2028-08-03','2028-12-20'); const V=gv(/^y4_sa_g_/).map(q=>keyOf(q.day).slice(5)+':'+q.sa.gset);
  const WANT=['08-06:6','08-13:0','08-20:7','08-27:6','09-03:1','09-10:6','09-17:8','09-24:9','10-01:2','10-08:6','10-15:10','10-22:11','10-29:6','11-05:3','11-12:12','11-19:13','11-26:4','12-03:14','12-10:5','12-17:15'];
  check('3. 臺灣路線交往中：二十個週日 10:00，g1～g6、h1～h9 照「從哪一天起」各一次（同一週 g 先）；旁白五週 8/6、8/27、9/10、10/8、10/29',J(V)===J(WANT),J(V));
  for(let i=0;i<9;i++) for(const k of [0,1]){ await vidGf(['2028-08-20','2028-09-17','2028-09-24','2028-10-15','2028-10-22','2028-11-12','2028-11-19','2028-12-03','2028-12-17'][i],7+i,[k]);
    check('3. h'+(i+1)+' 選「'+unq(HS[i].opts[k].o)+'」：照稿逐字（'+want(HS[i],k).length+' 句）'+(i===4?'；'+(k===0?'記':'不記')+' SIS14_CURRY_PROMISE':''),J(said())===J(want(HS[i],k))&&J(H.opts[0])===J(HS[i].opts.map(o=>o.o))&&(i!==4||(k===0?H.G.flags.SIS14_CURRY_PROMISE===true:H.G.flags.SIS14_CURRY_PROMISE==null)),J(said())); }
  fresh('2028-08-05',20,'dating',{JP_DEPARTED:D('2028-03-25'),JP_RETURNED:D('2028-08-05')},{route:'JP'}); walk('2028-08-06','2028-09-18'); const VJ=gv(/^y4_sa_g_/).map(q=>keyOf(q.day).slice(5)+':'+q.sa.gset);
  check('3. 日本路線交往中（8/5 回臺灣）：一樣（8/6 旁白、8/13 g1、8/20 h1、8/27 旁白、9/3 g2、9/10 旁白、9/17 h2）',J(VJ)===J(WANT.slice(0,7)),J(VJ));
  /* 舊存檔：這一套排到 10/1（g1～g3 演過）、沒有 h 組的紀錄（gh）——之前該演的 h1～h3 不補，10/8 旁白、10/15 h4 */
  fresh('2028-10-01',20,'dating'); H.G.flags.SIS_AB={k:8,tier:0,i1:2,i2:0,i3:0,ix:2,t1k:-9,log:[],v:2,g:3};
  walk('2028-10-02','2028-10-23'); const VO=gv(/^y4_sa_g_/).map(q=>keyOf(q.day).slice(5)+':'+q.sa.gset);
  check('3. 舊存檔（沒有 gh）：從這一週起照日期（10/8 旁白、10/15 h4、10/22 h5），之前的 h1～h3 不往後擠',J(VO)===J(['10-08:6','10-15:10','10-22:11']),J(VO));
  await vidGf('2028-10-08',6); check('3. 舊存檔排好的旁白（gset 6）照舊是那一行旁白',said()[0]===RB().SA_VG_NARR,J(said())); });

/* ---- 4 2-3 等你考完 ---- */
await sec(4,async()=>{ const a=D('2028-10-25'), d=D('2028-10-26');
  const setup=(kind,fl)=>{ fresh(a,20.5,kind,Object.assign({Y4_PATH:'grad'},fl||{})); phAt(a,21.1); return PHONE.sent(H.G,'y4_push_note'); };
  const n1=setup('dating'); phAt(d,12.9); const e0=byTag('sisb14_exam').length; phAt(d,13.05); const M=byTag('sisb14_exam');
  check('4. 交往中：10/25 便條（多「考完傳訊息。我這邊是晚上，我等。」）→ 10/26（四）13:00「考完了嗎。」「……我這邊一點。說好等的。」＋兩個回覆；12:54 還沒有；記 SIS14_EXAM_WAIT gf',n1&&txt('p:'+ID).includes('考完傳訊息。我這邊是晚上，我等。')&&CALENDAR.dateOf(d).wd===4&&e0===0&&J(M.map(m=>m.text))===J(DX.examGf)&&M.every(m=>m.h>=13&&m.h<13.25)&&J(askOpts('sisb14_exam'))===J(['考完了。','還不知道考得怎樣。'])&&H.G.flags.SIS14_EXAM_WAIT==='gf',J(M));
  answer('sisb14_exam',0); const r0=txt('p:'+ID).slice(-1)[0]; setup('dating'); phAt(d,13.05); answer('sisb14_exam',1); const r1=txt('p:'+ID).slice(-1)[0];
  check('4. 「考完了。」→「好。……那我去睡了。」；「還不知道考得怎樣。」→「不知道是對的。……睡了。」',r0==='好。……那我去睡了。'&&r1==='不知道是對的。……睡了。',J([r0,r1]));
  setup('friend'); phAt(d,13.05); const f0=byTag('sisb14_exam').length; phAt(d,20.9); const f1=byTag('sisb14_exam').length; phAt(d,21.05); const F=byTag('sisb14_exam');
  check('4. 朋友（推甄便條朋友版）：13:00 沒有、21:00「考完了嗎。」＋兩個回覆；SIS14_EXAM_WAIT friend',f0===0&&f1===0&&J(F.map(m=>m.text))===J(DX.examFriend)&&J(askOpts('sisb14_exam'))===J(['考完了。','還不知道考得怎樣。'])&&H.G.flags.SIS14_EXAM_WAIT==='friend',J(F));
  answer('sisb14_exam',1); const fr=txt('p:'+ID).slice(-1)[0]; check('4. 朋友版兩個回覆都是「嗯。辛苦了。」',fr==='嗯。辛苦了。'&&BODY.indexOf('- 「考完了。」→「嗯。辛苦了。」')>0&&BODY.indexOf('- 「還不知道考得怎樣。」→「嗯。辛苦了。」')>0);
  setup('dating'); at(d,11); H.G.msgChat=Object.assign(H.G.msgChat||{},{sent:{[ID]:d}}); phAt(d,13.05); phAt(d,21.05); const s0=byTag('sisb14_exam').length;
  setup('dating',{Y4_PATH:'bar'}); phAt(d,13.05); const s1=byTag('sisb14_exam').length;
  check('4. 那天自己先傳過訊息給她（MSG）＝沒有；沒有 10/25 便條（不是推甄）＝沒有',s0===0&&s1===0&&!H.G.flags.SIS14_EXAM_WAIT,J([s0,s1])); });

/* ---- 5 2-5 鍋子那一句的兌現 ---- */
await sec(5,async()=>{ const a=D('2028-12-30'), d=D('2028-12-31'), B=blk(part('### 2-5','## 3.'));
  check('5. 日子：12/30 週六、12/31 週日；稿 2-5 讀得到（三句、兩個選項）',CALENDAR.dateOf(a).wd===6&&CALENDAR.dateOf(d).wd===7&&B.pre.length===3&&B.opts.length===2,J(B));
  fresh(a,20.5,'dating',{SIS14_CURRY_PROMISE:true}); phAt(a,20.95); const m0=byTag('sisb14_curry_home_ask').length; phAt(a,21.05); const M=byTag('sisb14_curry_home_ask');
  check('5. h5 選過「好吃嗎？」、交往中：12/30 21:00 私訊「明天中午，我家。……鍋子洗好了。」＋「好。」（20:57 還沒有）',m0===0&&J(M.map(m=>m.text))===J([DX.curryHome])&&J(askOpts('sisb14_curry_home_ask'))===J(['好。']),J(M));
  answer('sisb14_curry_home_ask',0); ph(); const q=OUT.get(H.G,'sisb14_curry_home');
  check('5. 回「好。」→ 12/31（日）12:00「學姊的新家」出遊 2 小時',!!q&&q.day===d&&q.h===12&&q.hours===2&&q.place==='學姊的新家'&&q.ev==='ev_sis14_curry_home',J(q));
  at(d,11.4); await goOut('sisb14_curry_home',[0]); const s0=said(), bg=ev('ev_sis14_curry_home').dialogue[0];
  check('5. 演（「好吃。」）：照稿逐字；底圖照 AA_512 13-2（學姊的新家）；記 SIS14_CURRY_HOME',J(s0)===J(want(B,0))&&bg.bg==='sis_new_home'&&bg.scene==='學姊的新家'&&H.G.flags.SIS14_CURRY_HOME===true,J(s0));
  fresh(a,21.05,'dating',{SIS14_CURRY_PROMISE:true}); ph(); answer('sisb14_curry_home_ask',0); ph(); at(d,11.4); await goOut('sisb14_curry_home',[1]);
  check('5. 演（（再一碗））：照稿逐字',J(said())===J(want(B,1)),J(said()));
  fresh(d,8,'dating',{SIS14_CURRY_PROMISE:true}); ph(); const bf=byTag('sisb14_curry_home_ask'); answer('sisb14_curry_home_ask',0); ph(); const qb=OUT.get(H.G,'sisb14_curry_home');
  check('5. 規則晚跑到（12/31 08:00 才第一次跑）：照 12/30 21:00 補那一則，回「好。」照排 12:00',bf.length===1&&bf[0].day===a&&Math.abs(bf[0].h-21)<0.02&&!!qb&&qb.day===d&&qb.h===12,J({bf,qb}));
  fresh(a,21.05,'dating',{SIS14_CURRY_PROMISE:true}); ph(); phAt(d,12); const nr=!OUT.get(H.G,'sisb14_curry_home');
  fresh(a,21.05,'dating'); ph(); const np=!byTag('sisb14_curry_home_ask').length;
  us(a,21.05,'dating',{SIS14_CURRY_PROMISE:true,US_RETURNED:D('2028-12-23')}); ph(); const nu=!byTag('sisb14_curry_home_ask').length;
  fresh(a,21.05,'dating',{SIS14_CURRY_PROMISE:true}); ph(); answer('sisb14_curry_home_ask',0); ph(); ROM.end(H.G,ID,'test'); phAt(d,10); const qx=OUT.get(H.G,'sisb14_curry_home');
  check('5. 沒回「好。」＝不排；沒有 h5 那一句＝沒有私訊；美國路線＝沒有；12/31 前已經不在交往＝取消',nr&&np&&nu&&!!qx&&qx.state==='cancelled',J({nr,np,nu,qx:qx&&qx.state})); });

/* ---- 6 第 3 節 T3（朋友）---- */
await sec(6,async()=>{
  const TS=[4,5,6,7].map(i=>blk(part('**t'+i+'（',i<7?'**t'+(i+1)+'（':'## 4.',BODY)));
  check('6. 稿讀得到 t4～t7（兩句、兩個選項、→ 同一行的回覆）',TS.every(b=>b.pre.length===2&&b.opts.length===2&&b.opts.every(o=>o.r.length>=1)),J(TS));
  const st0=RB().saTarget; let VT=[];
  try{ RB().saTarget=()=>3; fresh('2028-08-02',20,'friend'); walk('2028-08-03','2028-12-20'); VT=gv(/^y4_sa_v_/).map(q=>keyOf(q.day).slice(5)+':'+q.sa.set); } finally { RB().saTarget=st0; }
  const WT=['08-06:0','08-13:1','08-20:2','08-27:3','09-03:3','09-10:3','09-17:4','09-24:3','10-01:3','10-08:3','10-15:3','10-22:5','10-29:3','11-05:3','11-12:3','11-19:6','11-26:3','12-03:3','12-10:3','12-17:7'];
  check('6. [前置：T3 固定] 朋友 T3：v0～v2 8/6～8/20 照舊；之後 t4 9/17、t5 10/22、t6 11/19、t7 12/17（各一次，其他週旁白 set 3）',J(VT)===J(WT),J(VT));
  for(let i=0;i<4;i++) for(const k of [0,1]){ await vidT3(['2028-09-17','2028-10-22','2028-11-19','2028-12-17'][i],4+i,[k]);
    check('6. t'+(4+i)+' 選「'+unq(TS[i].opts[k].o)+'」：照稿逐字',J(said())===J(want(TS[i],k))&&J(H.opts[0])===J(TS[i].opts.map(o=>o.o)),J(said())); }
  await vidT3('2028-10-29',3); check('6. 旁白（set 3）照舊',said()[0]===RB().SA_V_NARR,J(said())); });

/* ---- 7 第 4 節 美國路線交往中 ---- */
await sec(7,async()=>{
  /* 4-1 */
  { const a=D('2028-09-01'), d=D('2028-09-02'); const B=blk(part('- 9/2（六）14:00，208','- 記 `SIS14_US_CURRY`'));
    check('7. 4-1 日子：9/1 週五、9/2 週六；稿讀得到 208 那四句',CALENDAR.dateOf(a).wd===5&&CALENDAR.dateOf(d).wd===6&&B.pre.length===4,J(B));
    us(a,20.5,'dating'); phAt(a,20.95); const m0=byTag('sisb14_us_curry_ask').length; phAt(a,21.05); const M=byTag('sisb14_us_curry_ask');
    check('7. 4-1 9/1 21:00（當地）私訊「第一週，活下來了。」「明天下午，208。我煮咖哩。」＋兩個回覆',m0===0&&J(M.map(m=>m.text))===J(DX.usCurry)&&J(askOpts('sisb14_us_curry_ask'))===J(['好。','我帶什麼？']),J(M));
    answer('sisb14_us_curry_ask',1); ph(); const r=txt('p:'+ID).slice(-1)[0], q=OUT.get(H.G,'sisb14_us_curry');
    check('7. 4-1「我帶什麼？」→「碗。我這邊只有一個。」；排 9/2（六）14:00 C 棟 208 出遊 2 小時',r==='碗。我這邊只有一個。'&&!!q&&q.day===d&&q.h===14&&q.hours===2&&q.place==='C 棟 208',J({r,q}));
    at(d,13.8); await goOut('sisb14_us_curry'); check('7. 4-1 演：照稿四句（208 的廚房、超重兩公斤、碗）；記 SIS14_US_CURRY',J(said())===J(want(B,0))&&H.G.flags.SIS14_US_CURRY===true,J(said()));
    us(a,21.05,'dating'); ph(); answer('sisb14_us_curry_ask',0); const r0=txt('p:'+ID).slice(-1)[0]; ph(); const q0=OUT.get(H.G,'sisb14_us_curry');
    us(a,21.05,'dating'); ph(); phAt(d,14); const nq=!OUT.get(H.G,'sisb14_us_curry');
    us(a,21.05,'friend'); ph(); const nf=!byTag('sisb14_us_curry_ask').length; fresh(a,21.05,'dating'); ph(); const nt=!byTag('sisb14_us_curry_ask').length;
    check('7. 4-1「好。」→「兩點。帶碗，我這邊只有一個。」也排；沒回＝不排；挽回中、臺灣路線＝沒有',r0==='兩點。帶碗，我這邊只有一個。'&&!!q0&&nq&&nf&&nt,J({r0,q0:!!q0,nq,nf,nt})); }
  /* 4-2 */
  { const B=blk(part('### 4-2','### 4-3')), d0=D('2028-10-04');
    us(d0,19,'dating'); await lad('SU-L6',[0]); const rp=said().slice(-1)[0], q=OUT.get(H.G,'sisb14_eggs');
    check('7. 4-2 SU-L6「明天早上我來煮。」→「好。七點。你遲到的話，我先吃三顆。」；記 SIS14_EGGS_DAY；排隔天 07:00 C 棟 208（遲到 10 分鐘內算到）',rp==='好。七點。你遲到的話，我先吃三顆。'&&H.G.flags.SIS14_EGGS_DAY===d0&&!!q&&q.day===d0+1&&q.h===7&&Math.abs(q.late-1/6)<1e-9&&q.place==='C 棟 208',J({rp,q}));
    for(const k of [0,1]){ if(k){ us(d0,19,'dating'); await lad('SU-L6',[0]); } at(d0+1,6.8); await goOut('sisb14_eggs',[k]);
      check('7. 4-2 演（'+B.opts[k].o+'）：照稿逐字（七點、煮吧、回覆、十八顆蛋少了四顆）；記 SIS14_EGGS',J(said())===J(want(B,k))&&H.G.flags.SIS14_EGGS===true,J(said())); }
    us(d0,19,'dating'); await lad('SU-L6',[0]); at(d0+1,7.2); expire(); at(d0+1,7.6); PHONE.tick(H.G); const mm=byTag('sisb14_eggs_miss');   /* 07:36 才看：照原本的時間補進去 */
    check('7. 4-2 沒到（07:10 以後）：07:15 私訊「三顆。吃完了。」「……第四顆留給你。」；SIS14_EGGS missed',J(mm.map(m=>m.text))===J(DX.eggsMiss)&&mm.every(m=>Math.abs(m.h-7.25)<0.02)&&H.G.flags.SIS14_EGGS==='missed',J(mm));
    us(d0,19,'dating'); await lad('SU-L6',[1]); const r1=said().slice(-1)[0];
    us('2028-11-10',20,'dating'); await lad('SU-L6',[0]); const chi=OUT.get(H.G,'sisb14_eggs');
    check('7. 4-2「不能只買半盒？」＝不排；隔天一早她去芝加哥（11/10 選）＝不排',r1==='不行。我問過了。'&&!chi,J({r1,chi})); }
  /* 4-3 */
  { const B=blk(part('### 4-3','### 4-4'));
    us('2028-11-14',15,'dating'); await lad('SU-L7',[1]); const rp=said().slice(-1)[0], q=OUT.get(H.G,'sisb14_coat');
    check('7. 4-3 SU-L7「好。週六。」→「早上去。下午人很多。」；11/14（二）選＝那個週六 11/18 10:00 草原超市旁邊那家店，出遊 1.5 小時',rp==='早上去。下午人很多。'&&!!q&&keyOf(q.day)==='2028-11-18'&&q.h===10&&q.hours===1.5&&q.place==='草原超市旁邊那家店'&&CALENDAR.dateOf(q.day).wd===6,J({rp,q}));
    at(q.day,9.5); await goOut('sisb14_coat'); check('7. 4-3 演：照稿逐字（外套、三件、第一件、她手上也多了一件）；記 SIS14_COAT',J(said())===J(want(B,0))&&H.G.flags.SIS14_COAT===true,J(said()));
    const coat=Object.assign({},H.G.flags); us('2028-12-02',20,'dating',{SIS14_COAT:true}); await runEv('ev_us_first_snow',[1]); const sn=said();
    us('2028-12-02',20,'dating'); await runEv('ev_us_first_snow',[1]); const sn0=said();
    check('7. 4-3 12/2 初雪：有 SIS14_COAT＝開頭「（你穿著那件外套。她也是。）」，接原本那句；沒有＝照舊',coat.SIS14_COAT===true&&sn[0]===DX.snowCoat&&sn[1]==='（她坐在台階最上面一階，旁邊放著兩杯熱可可。你坐下的時候，她把一杯推過來。）'&&!sn0.includes(DX.snowCoat),J({sn:sn.slice(0,2),sn0:sn0.slice(0,1)}));
    const sat=async(k,h)=>{ us(k,h,'dating'); await lad('SU-L7',[1]); const x=OUT.get(H.G,'sisb14_coat'); return x?keyOf(x.day):null; };
    const c8=await sat('2028-11-08',15), c18a=await sat('2028-11-18',9), c18b=await sat('2028-11-18',15);
    check('7. 4-3 那一週的週六：11/8（三）選＝11/11 她在芝加哥、順延 11/18；週六 09:00 選＝當天；週六 15:00 選＝下一個週六',c8==='2028-11-18'&&c18a==='2028-11-18'&&c18b==='2028-11-25',J([c8,c18a,c18b]));
    us('2028-11-14',15,'dating'); await lad('SU-L7',[0]); const r0=said().slice(-1)[0];
    check('7. 4-3「妳的也很薄。」→「我的裡面有一層。……好，我的也換。」照舊、不排這一趟',r0==='我的裡面有一層。……好，我的也換。'&&!OUT.get(H.G,'sisb14_coat')&&H.G.flags.SIS14_COAT_DAY==null,J(r0)); }
  /* 4-4 */
  { const B=blk(part('### 4-4','### 4-5')), d=D('2028-09-11');
    us(d,21.5,'dating'); phAt(d,22.05); answer('sisb13_day40',1); const r=txt('p:'+ID).slice(-1)[0], q=OUT.get(H.G,'sisb14_day40');
    check('7. 4-4 第四十天選「我過去。」（「好。……帶傘，外面在下雨。」）→ 當晚 22:30（當地）C 棟門口、不用移動、出遊 0.5 小時',r==='好。……帶傘，外面在下雨。'&&!!q&&q.day===d&&q.h===22.5&&q.travelH===0&&q.hours===0.5&&q.place==='C 棟門口',J({r,q}));
    at(d,22.3); await goOut('sisb14_day40'); check('7. 4-4 演：照稿逐字（兩把傘、你兩手空空、早餐店、雨停了）；記 SIS14_DAY40_WENT',J(said())===J(want(B,0))&&H.G.flags.SIS14_DAY40_WENT===true,J(said()));
    us(d,21.5,'dating'); phAt(d,22.05); answer('sisb13_day40',0); const n0=!OUT.get(H.G,'sisb14_day40');
    us(d,21.5,'dating'); phAt(d,22.05); at(d+1,10); answer('sisb13_day40',1); const n1=!OUT.get(H.G,'sisb14_day40');
    check('7. 4-4「想什麼？」＝不排；隔天才回「我過去。」＝不排（說的是當晚）',n0&&n1,J({n0,n1})); }
  /* 4-5 */
  { us('2028-11-29',15,'dating'); await lad('SU-L8',[0]); const rp=said().slice(-1)[0], f=H.G.flags.SIS14_BOOK4; await runEv('ev_us_leave'); const lv=said();
    us('2028-11-29',15,'dating'); await lad('SU-L8',[1]); const f1=H.G.flags.SIS14_BOOK4; await runEv('ev_us_leave'); const lv1=said();
    check('7. 4-5 SU-L8「那這次超重什麼？」（「書。三本。第四本你幫我拿。」）→ 12/16 離開那天開頭「（你的背包裡多了一本她的書。比你自己的三本都重。）」；選另一個＝沒有',rp==='書。三本。第四本你幫我拿。'&&f===true&&lv[0]===DX.leaveBook&&f1==null&&!lv1.includes(DX.leaveBook),J({rp,lv:lv.slice(0,2),lv1:lv1.slice(0,1)})); }
  /* 閒聊階梯的回覆照舊（包一層不改字）*/
  { const st=stepOf('SU-L6'); const r=STORY.ladReply(st,st.choices[0],{flags:{}},'kai'); check('7. STORY.ladReply 包一層：回覆照舊、別人的閒聊不記',r===st.choices[0].reply); } });

/* ---- 8 第 5 節 挽回中 ---- */
await sec(8,async()=>{ const d=D('2028-09-02');
  const g=grp0902(); check('8. US_BLANK.GRP 9/2（週六）：她貼「勞動節週末，法學院圖書館只開到下午五點。」、回「收到。」、之後無',!!g&&CALENDAR.dateOf(d).wd===6&&J(g.post)===J(['勞動節週末，法學院圖書館只開到下午五點。'])&&g.reply==='收到。'&&!g.after,J(g));
  us(d,9.9,'friend',{US2:'repair'}); PHONE.join(H.G,'us_exchange','交換生群組'); ph(); const m0=byTag('usb_grp_0902').length; phAt(d,10.05); const M=byTag('usb_grp_0902');
  check('8. 挽回中：9/2 10:00 交換生群組一則（09:54 還沒有）；三個回法照那張表',m0===0&&J(M.map(m=>m.th+'|'+m.from+'|'+m.text))===J(['g:us_exchange|heroine_05|勞動節週末，法學院圖書館只開到下午五點。'])&&J(askOpts('usb_grp_0902'))===J(['收到。','（私訊她）……妳最近好嗎？','（不回）']),J(M));
  const r0=(H.G.flags.REPAIR||{})[ID]|0; answer('usb_grp_0902',0); ph(); const r1=(H.G.flags.REPAIR||{})[ID]|0; const more=R2Y4A.repairAdd(H.G,'test_same_week');
  check('8. 回「收到。」：REPAIR +1；同一週其他來源不再加（一週最多 +1）',r1===r0+1&&more===false&&(H.G.flags.REPAIR||{})[ID]===r1,J({r0,r1,more}));
  us(d,9.9,'dating',{US2:'dating'}); PHONE.join(H.G,'us_exchange','交換生群組'); phAt(d,10.05); check('8. 交往中：沒有這一則',!byTag('usb_grp_0902').length); });

/* ---- 9 舊存檔 ---- */
await sec(9,async()=>{ let ok=true, err='';
  try{ for(const [k,h,kind,route] of [['2028-08-03',22,'dating'],['2028-10-26',13.1,'friend'],['2028-12-30',21.1,'dating'],['2028-09-01',21.1,'dating','US'],['2028-09-11',22.6,'dating','US']]){
      const G=route==='US'?us(k,h,kind):fresh(k,h,kind); delete G.msgChat; ph(); if(!X()) throw new Error('沒有 SISB14'); X().phone(G); }
    X().phone({flags:{},stage:'law',day:D('2028-08-03'),hour:22,msgs:[]}); X().onAnswer(H.G,null,null); X().onLad(H.G,null,null,ID); X().onLad({flags:{}},{id:'SU-L6'},{t:'「明天早上我來煮。」'},ID); }
  catch(e){ ok=false; err=String(e&&e.stack||e).split('\n').slice(0,2).join(' / '); }
  check('9. 舊存檔（沒有 SIS14_*、沒有 msgChat、SIS_AB 沒有 gh／t3）照常跑、不丟例外',ok,err);
  const F=fresh('2028-08-05',20,'dating').flags; check('9. 新的局沒有預先寫進任何 SIS14_* 旗標（都是用到才寫）',!Object.keys(F).some(k=>/^SIS14_/.test(k)),J(Object.keys(F).filter(k=>/^SIS14_/.test(k)))); });

/* ---- 10 第 8 節（3cd10909b → d6f8621ac 第 3 點 → 913802344 第 4 點，SIS-B14-AAFIX-1028）懸著的承諾：兩句 ---- */
await sec(10,async()=>{ const S8Q=quotesOf(S8), GS=allTexts();
  const SPLIT=one(/`ev_us2_kitchen` 有「(（[^」]+）)」那一支的，接在那一句後面/,S8B3)[0]||null;   /* 第 3 點寫的 US2 那一句（分碗）：從稿讀 */
  const [B_OPT,B_NEXT]=one(/「([^」]+)」那一支：放在「([^」]+)」前面/,S8B4), [C_OPT,C_PREV]=one(/「([^」]+)」那一支：放在「([^」]+)」後面/,S8B4);   /* 第 4 點：US2 另外兩支各放在哪一句前面／後面（從稿讀）*/
  const LU_AFTER=one(/3-2 滷肉：碗那句移到她說「([^」]+)」後面/,S8B4)[0]||null;   /* 第 4 點：3-2 她說的那一句（從稿讀）*/
  check('10. 稿第 8 節讀得到：兩句「>」；第 1 點（4-1、SIS14_US_CURRY、一次）、第 2 點（h9「我會去接妳。」記 SIS14_RIGHT、ev_sis_pickup、「她一出來就看到你。」照舊）、'
    +'第 3 點（只放有吃東西的 208 場景：先算 9/13 US2 ev_us2_kitchen、沒演到放 3-2 ev_us208_lurou、3-1 看作業那一類不放；接在第一句旁白後面、ev_us2_kitchen 有「'+SPLIT+'」那一支接在那一句後面；字照第 1 點、沒有新的「>」）、'
    +'第 4 點（US2 另外兩支都要出：「'+B_OPT+'」放在「'+B_NEXT+'」前面、「'+C_OPT+'」放在「'+C_PREV+'」後面；3-2 移到她說「'+LU_AFTER+'」後面、不放在剛進門；4-2 煎蛋不算；US2、3-2 都沒演到的沒有；沒有新的「>」）',
    S8Q.length===2&&J(S8Q)===J([DX.bowl,DX.right])&&S8B1.indexOf('「……下次你用我的碗。」')>0&&S8B1.indexOf('`SIS14_US_CURRY`')>0&&S8B1.indexOf('- 一次。')>0
    &&S8B2.indexOf('h9 選「我會去接妳。」的，記 `SIS14_RIGHT`')>0&&S8B2.indexOf('`ev_sis_pickup`')>0&&S8B2.indexOf('後面「她一出來就看到你。」照舊')>0
    &&S8B3.indexOf('只放在有吃東西的 208 場景')>0&&S8B3.indexOf('先算 9/13 的 US2（`ev_us2_kitchen`）')>0&&S8B3.indexOf('沒演到的話，放 3-2 滷肉（`ev_us208_lurou`）')>0&&S8B3.indexOf('3-1 看作業那一類不放')>0
    &&S8B3.indexOf('**放在哪裡**：接在第一句旁白後面')>0&&!!SPLIT&&S8B3.indexOf('字照第 1 點')>0&&quotesOf(S8B3).length===0
    &&S8B4.indexOf('US2 另外兩支都要出')>0&&B_OPT==='先吃麵。'&&B_NEXT==='（你們隔著窗口吃完泡麵。）'&&C_OPT==='書瑀，休息一下。'&&C_PREV==='……休息完再改。先吃麵。'
    &&LU_AFTER==='亞洲超市買得到八角。'&&S8B4.indexOf('不放在剛進門')>0&&S8B4.indexOf('4-2 煎蛋不算')>0&&S8B4.indexOf('US2、3-2 都沒演到的玩家沒有這一句')>0&&quotesOf(S8B4).length===0,
    J({S8Q,b1:S8B1.length,b2:S8B2.length,b3:S8B3.length,b4:S8B4.length,SPLIT,B_OPT,B_NEXT,C_OPT,C_PREV,LU_AFTER}));
  check('10. 稿 → 遊戲：第 8 節兩句都在遊戲裡',S8Q.length===2&&S8Q.every(t=>GS.has(t)),J(S8Q.filter(t=>!GS.has(t))));

  /* ---------- 第 1 點＋第 3、4 點：4-1「……下次你用我的碗。」→ 之後第一次有吃東西的 208 場景（先 9/13 US2，三支都有；沒演到＝3-2 滷肉她說「亞洲超市買得到八角。」後面；其他六場、4-2 煎蛋不放）---------- */
  const s208=(key,h,fl,o)=>fresh(key,h,'dating',Object.assign({US_ARRIVED:true,US1:'together',US2:'there'},fl||{}),Object.assign({route:'US',zone:'us_shared'},o||{}));
  const play208=async picks=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const r=US208.tick(GM,0.5); for(let i=0;i<400&&US208.isBusy();i++) await wait(); return r; };   /* 走進 208（同 tests/aa412_us_unit.js）*/
  const first=n=>{ const s=US208.SCENES.find(x=>x.n===n), l=s&&s.dialogue.find(x=>!!x&&typeof x.text==='string'&&!x.if&&!x.unless); return l?l.text:null; };   /* 那一場原本的第一句（沒有條件的）*/
  /* 9/13 18:30 坐到 C 棟 208 窗口的高腳椅（R2Y4A.tick，同 tests/aa453_us_unit.js 1-3）；picks：選項的第幾個（kA「那就寫妳。」／kB「先吃麵。」／kC「書瑀，休息一下。」，下面從事件找）*/
  const us2=async(picks,fl)=>{ fresh('2028-09-13',18.6,'dating',Object.assign({US_ARRIVED:true,US1:'together'},fl||{}),{route:'US',zone:'us_shared'}); E.player.seat={lift:0.31};
    H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const r=R2Y4A.tick(GM,0.5); for(let i=0;i<400&&!(H.G.events.done.ev_us2_kitchen&&!R2Y4A.isBusy());i++) await wait(); E.player.seat=null; return {r,s:said()}; };
  const isBowl=l=>!!l&&l.text===DX.bowl, lab=(L,i)=>{ for(let j=i;j>=0;j--) if(L[j]&&L[j].label) return L[j].label; return null; };   /* lab：第 i 行在哪一支（前面最近的 label）*/
  const seq=(a,x)=>{ for(let i=0;i+x.length<=a.length;i++) if(x.every((t,j)=>a[i+j]===t)) return true; return false; };   /* x 在 a 裡連續出現 */
  const cnt=(a,t)=>a.filter(x=>x===t).length;
  const K0='（她在煮泡麵，兩包。）', A1='對。', A2='我要寫法服那兩年遇到的人。週六早上，那些拿著存證信函來問的阿伯阿姨。', B1='……好。', B3='評價？';   /* US2 第一句、「那就寫妳。」那一支分碗前後兩句、「先吃麵。」那一支她的第一句、吃完泡麵後她那句（r2y4a_events.js）*/
  const LU2='亞洲超市買得到八角。冰糖沒有，我用一般的糖。', LU3='……所以有一點焦。', MK='（你認得那包八角。）';   /* 3-2 她第一句、第二句（us208_3d.js）；去過竹葉亞洲超市的那一句（us_blank_lines.js，AA_424 接在第一句旁白後面）*/
  const SC=[['3-1','ev_us208_memo','2028-09-16'],['3-2','ev_us208_lurou','2028-09-30'],['3-3','ev_us208_clipping','2028-10-14'],['3-4','ev_us208_rehearsal','2028-10-28'],['3-5','ev_us208_extra_hour','2028-11-05'],['3-6','ev_us208_plant','2028-11-18'],['3-7','ev_us208_lastweek','2028-12-09']];   /* 每一場自己當第一場的那一天（前面的都過了範圍）*/
  check('10. 208 的七場＝us208_3d.js ev_us208_memo～ev_us208_lastweek（3-2 滷肉＝ev_us208_lurou）',typeof US208!=='undefined'&&J(US208.SCENES.map(s=>[s.n,s.ev]))===J(SC.map(x=>[x[0],x[1]])),J(typeof US208!=='undefined'&&US208.SCENES.map(s=>[s.n,s.ev])));
  const KD=(ev('ev_us2_kitchen')||{dialogue:[]}).dialogue, CH=(KD.find(l=>!!l&&Array.isArray(l.choice))||{choice:[]}).choice;
  const kOf=t=>CH.findIndex(c=>c.text==='「'+t+'」'), kA=kOf('那就寫妳。'), kB=kOf(B_OPT), kC=kOf(C_OPT);   /* US2 三個選項是第幾個（「先吃麵。」「書瑀，休息一下。」的字從稿讀）*/
  { const kb=KD.map((l,i)=>isBowl(l)?i:-1).filter(i=>i>=0), LD=US208.SCENES[1].dialogue, lb=LD.map((l,i)=>isBowl(l)?i:-1).filter(i=>i>=0), withBowl=STORY_EVENTS.filter(e=>(e.dialogue||[]).some(isBowl)).map(e=>e.id).sort();
    const nx=l=>!l?null:l.text!=null?l.text:l.label?'label:'+l.label:null, br={}; for(const i of kb) br[lab(KD,i)]={prev:nx(KD[i-1]),next:nx(KD[i+1])};
    const gA=kA>=0?CH[kA].goto:null, gB=kB>=0?CH[kB].goto:null, gC=kC>=0?CH[kC].goto:null;
    check('10. 第 3、4 點 放的地方（事件的台詞）：US2 ev_us2_kitchen 三支各一行——「那就寫妳。」在「'+SPLIT+'」下一行、「'+B_OPT+'」在「'+B_NEXT+'」上一行、「'+C_OPT+'」在「'+C_PREV+'」下一行；'
      +'七場只有 3-2 滷肉一行，在她說「'+LU_AFTER+'」那句的下一行（「'+MK+'」照 AA_424 在第一句旁白的下一行）；每一行都有條件、記 SIS14_BOWL；其他事件（4-2 煎蛋 ev_sis14_eggs 等）都沒有',
      J(withBowl)===J(['ev_us208_lurou','ev_us2_kitchen'])&&!!ev('ev_sis14_eggs')&&!(ev('ev_sis14_eggs').dialogue||[]).some(isBowl)
      &&kA>=0&&kB>=0&&kC>=0&&kb.length===3&&J(Object.keys(br).sort())===J(['a','b','c'])&&J([gA,gB,gC].sort())===J(['a','b','c'])
      &&!!br[gA]&&br[gA].prev===SPLIT&&br[gA].next===A2&&cnt(KD.map(l=>l&&l.text),SPLIT)===1
      &&!!br[gB]&&br[gB].prev===B1&&br[gB].next===B_NEXT&&!!br[gC]&&br[gC].prev===C_PREV&&br[gC].next==='label:end'
      &&lb.length===1&&LD[0].speaker===null&&!LD[0].if&&LD[0].text===first('3-2')&&!!LD[1]&&LD[1].text===MK&&!!LD[1].if
      &&LD[lb[0]-1].text===LU2&&LU2.indexOf(LU_AFTER)===0&&nx(LD[lb[0]+1])===LU3
      &&kb.map(i=>KD[i]).concat(lb.map(i=>LD[i])).every(l=>!!l&&!!l.if&&l.speaker===null&&!!l.set&&l.set.SIS14_BOWL===true),
      J({withBowl,k:[kA,kB,kC],g:[gA,gB,gC],br,lb,around:lb.length?[LD[lb[0]-1]&&LD[lb[0]-1].text,nx(LD[lb[0]+1])]:null,l1:LD[1]&&LD[1].text})); }
  /* US2 三支（坐高腳椅）：各自的位置、一次、記 SIS14_BOWL；之後 3-2 滷肉沒有（只一次）*/
  for(const [k,name,want,last] of [[kA,'那就寫妳。',[A1,SPLIT,DX.bowl,A2],false],[kB,B_OPT,[B1,DX.bowl,B_NEXT,B3],false],[kC,C_OPT,[C_PREV,DX.bowl],true]]){
    const u=await us2([k],{SIS14_US_CURRY:true}); const b=H.G.flags.SIS14_BOWL, u2=H.G.flags.US2; at('2028-09-30',15); const d=US208.due(H.G); await play208([0]); const l=said();
    check('10. 第 '+(name==='那就寫妳。'?'3':'4')+' 點 9/13 US2（坐高腳椅）選「'+name+'」：第一句照舊「'+K0+'」；'+want.map(t=>'「'+(t.length>14?t.slice(0,12)+'……':t)+'」').join('→')+(last?'（最後一句）':'')+'；記 SIS14_BOWL；之後 3-2 滷肉「'+first('3-2')+'」→「'+LU2.slice(0,10)+'……」→「'+LU3+'」沒有（只一次）',
      k>=0&&u.r===true&&u.s[0]===K0&&seq(u.s,want)&&cnt(u.s,DX.bowl)===1&&(!last||u.s[u.s.length-1]===DX.bowl)&&b===true&&u2==='there'
      &&!!d&&d.n==='3-2'&&J(l.slice(0,3))===J([first('3-2'),LU2,LU3])&&!l.includes(DX.bowl)&&H.G.flags.SIS14_BOWL===true,
      J({k,r:u.r,s:u.s.slice(-6),b,u2,d:d&&d.n,l:l.slice(0,3)})); }
  /* 沒去 US2：3-1 看作業先演＝不算；3-2 她說「亞洲超市買得到八角。」那句後面；之後 3-3 沒有 */
  { s208('2028-09-16',15,{SIS14_US_CURRY:true,US2:'missed'}); await play208([0]); const m1=said(), mb=H.G.flags.SIS14_BOWL; at('2028-09-30',15); await play208([0]); const m2=said(), m2b=H.G.flags.SIS14_BOWL; at('2028-10-14',15); await play208([0]); const m3=said();
    check('10. 第 3、4 點 沒去 9/13 US2（US2 missed）：3-1 看作業先演＝沒有、不記；3-2 滷肉「'+first('3-2')+'」→「'+LU2.slice(0,10)+'……」→「'+DX.bowl+'」→「'+LU3+'」（不在剛進門）、記 SIS14_BOWL；之後 3-3 沒有',
      m1[0]===first('3-1')&&!m1.includes(DX.bowl)&&mb==null&&J(m2.slice(0,4))===J([first('3-2'),LU2,DX.bowl,LU3])&&cnt(m2,DX.bowl)===1&&m2b===true&&m3[0]===first('3-3')&&!m3.includes(DX.bowl),
      J({m1:m1.slice(0,2),mb,m2:m2.slice(0,4),m2b,m3:m3.slice(0,2)})); }
  /* 七場各自當第一場：只有 3-2 有；US2、3-2 都沒演到（3-3～3-7 先演）＝沒有 */
  { const got=[]; for(const [n,id,k] of SC){ s208(k,15,{SIS14_US_CURRY:true,US2:'missed'}); const due=US208.due(H.G); const r=await play208([0]); const s=said();
      got.push({n,due:due&&due.n,r,s0:s[0],first:first(n),at:s.indexOf(DX.bowl),prev:s[s.indexOf(DX.bowl)-1]||null,bowl:H.G.flags.SIS14_BOWL,done:!!H.G.events.done[id]}); }
    check('10. 第 3、4 點 七場各自當第一場（吃過咖哩、沒去 US2、還沒演過那一句）：只有 3-2 滷肉有（她說「'+LU_AFTER+'」那句後面＝第 3 句、記 SIS14_BOWL）；其他六場（3-1 看作業那一類；3-3～3-7＝US2、3-2 都沒演到）第一句照舊、沒有、不記',
      got.length===7&&got.every((g,i)=>g.due===SC[i][0]&&g.r===true&&!!g.first&&g.s0===g.first&&g.done&&(g.n==='3-2'?g.at===2&&g.prev===LU2&&g.bowl===true:g.at<0&&g.bowl==null)),J(got)); }
  /* 4-2 煎蛋不算（盤子，不是碗）：不放、也不算演過 */
  { const d0=D('2028-09-24'); us(d0,19,'dating',{SIS14_US_CURRY:true,US2:'missed'}); await lad('SU-L6',[0]); const q=OUT.get(H.G,'sisb14_eggs'); at(d0+1,6.8); await goOut('sisb14_eggs',[0]); const e1=said(), eb=H.G.flags.SIS14_BOWL, ee=H.G.flags.SIS14_EGGS;
    H.G.zone='us_shared'; E.player.busy=false; E.paused=false; ADV.active=false; at('2028-09-30',15); await play208([0]); const e2=said();
    check('10. 第 4 點 4-2 煎蛋不算：吃過咖哩、沒去 US2，9/24 選 SU-L6「明天早上我來煮。」→ 9/25 07:00 煎蛋（C 棟 208）沒有那一句、不記 SIS14_BOWL；9/30 3-2 滷肉照樣有（她說「'+LU_AFTER+'」那句後面）',
      !!q&&q.day===d0+1&&ee===true&&e1.length>0&&!e1.includes(DX.bowl)&&eb==null&&J(e2.slice(0,4))===J([first('3-2'),LU2,DX.bowl,LU3])&&H.G.flags.SIS14_BOWL===true,J({q:!!q,ee,e1:e1.slice(0,2),eb,e2:e2.slice(0,4)})); }
  /* 沒吃過 4-1 的咖哩 */
  { const n=[]; for(const k of [kA,kB,kC]){ const u=await us2([k]); n.push({k,r:u.r,has:u.s.includes(DX.bowl),b:H.G.flags.SIS14_BOWL}); }
    const n1=await us2([kA]); at('2028-09-30',15); await play208([0]); const n2=said();
    check('10. 第 1 點 沒有 SIS14_US_CURRY（沒吃過 4-1 的咖哩）：US2 三支、3-2 滷肉都沒有、不記 SIS14_BOWL（「那就寫妳。」照舊「'+A1+'」→「'+SPLIT+'」→「'+A2.slice(0,12)+'……」）',
      n.length===3&&n.every(x=>x.k>=0&&x.r===true&&!x.has&&x.b==null)&&n1.r===true&&seq(n1.s,[A1,SPLIT,A2])&&J(n2.slice(0,3))===J([first('3-2'),LU2,LU3])&&!n2.includes(DX.bowl)&&H.G.flags.SIS14_BOWL==null,J({n,n2:n2.slice(0,3)})); }
  /* 舊存檔 */
  { const o=[]; for(const k of [kA,kB,kC]){ const u=await us2([k],{SIS14_US_CURRY:true,SIS14_BOWL:true}); o.push({k,r:u.r,has:u.s.includes(DX.bowl)}); }
    s208('2028-09-30',15,{SIS14_US_CURRY:true,SIS14_BOWL:true}); H.G.events.done.ev_us208_memo=1; await play208([0]); const o1=said();
    s208('2028-09-30',15,{SIS14_US_CURRY:true}); H.G.events.done.ev_us208_memo=1; H.G.events.done.ev_us2_kitchen=1; await play208([0]); const o2=said();
    check('10. 第 3、4 點 舊存檔：已經演過那一句的（SIS14_BOWL：3cd10909b 那一版 3-1 先演、d6f8621ac 那一版 3-2 剛進門）＝US2 三支、3-2 都不再出；'
      +'US2 演過、還沒演過那一句（d6f8621ac 那一版選了另外兩支）＝3-2 照樣有（她說「'+LU_AFTER+'」那句後面）、記 SIS14_BOWL',
      o.length===3&&o.every(x=>x.k>=0&&x.r===true&&!x.has)&&J(o1.slice(0,3))===J([first('3-2'),LU2,LU3])&&!o1.includes(DX.bowl)&&J(o2.slice(0,4))===J([first('3-2'),LU2,DX.bowl,LU3])&&H.G.flags.SIS14_BOWL===true,
      J({o,o1:o1.slice(0,3),o2:o2.slice(0,4)})); }
  /* 滷肉的順序：「（你認得那包八角。）」回到第一句旁白後面（AA_424）、碗那一句在她說「亞洲超市買得到八角。」後面 */
  { s208('2028-09-30',15,{SIS14_US_CURRY:true,US2:'missed'}); SOCIAL.remember(ID,'US_ASIAN_MARKET',''); await play208([0]); const l1=said().slice(0,5);
    s208('2028-09-30',15); SOCIAL.remember(ID,'US_ASIAN_MARKET',''); await play208([0]); const l0=said().slice(0,4);
    check('10. 第 4 點 3-2 滷肉、去過竹葉亞洲超市（US_ASIAN_MARKET）：「（還沒進門就聞到了……）」→「'+MK+'」（照 AA_424，第一句旁白後面）→「'+LU2.slice(0,10)+'……」→「'+DX.bowl+'」→「'+LU3+'」；沒吃過咖哩照舊四句（AA_412 3-2＋AA_424）',
      J(l1)===J([first('3-2'),MK,LU2,DX.bowl,LU3])&&J(l0)===J([first('3-2'),MK,LU2,LU3]),J({l1,l0})); }
  /* 回私訊「我過去。」的出遊：US2（9/13 18:00 那一則，AA_453 1-3）、3-2（週末 14:00 那一則，AA_454 1）*/
  { fresh('2028-09-13',17.9,'dating',{US_ARRIVED:true,US1:'together',SIS14_US_CURRY:true},{route:'US',zone:'us_apartment'}); phAt('2028-09-13',18.05); const m=PHONE.byAsk(H.G,'us2_ask'); if(m) answer('us2_ask',0); ph(); const q=OUT.get(H.G,'us2_kitchen');
    if(q) at('2028-09-13',q.h-0.1); await goOut('us2_kitchen',[kB]); const s=said();
    check('10. 第 4 點 回 9/13 18:00 她私訊「我過去。」的出遊（不是自己坐高腳椅）也一樣：選「'+B_OPT+'」＝「'+B1+'」→「'+DX.bowl+'」→「'+B_NEXT+'」、記 SIS14_BOWL',
      kB>=0&&!!m&&!!q&&q.ev==='ev_us2_kitchen'&&s[0]===K0&&seq(s,[B1,DX.bowl,B_NEXT])&&cnt(s,DX.bowl)===1&&H.G.flags.SIS14_BOWL===true,J({m:!!m,q:q&&{ev:q.ev,h:q.h},s:s.slice(-7)})); }
  { const d=D('2028-09-30'); s208(d,13.9,{SIS14_US_CURRY:true,US2:'missed'},{zone:'us_apartment'}); phAt(d,14.05); const m=PHONE.byAsk(H.G,'us208_ask_0930'); if(m) answer('us208_ask_0930',0); ph(); const q=OUT.get(H.G,'us208_0930');
    if(q) at(d,q.h-0.1); await goOut('us208_0930',[0]); const s=said();
    check('10. 第 4 點 回她週末 14:00 私訊「我過去。」的出遊（AA_454 1，不是自己走進 208）：3-2 滷肉一樣在她說「'+LU_AFTER+'」那句後面、記 SIS14_BOWL',
      !!m&&!!q&&q.ev==='ev_us208_lurou'&&J(s.slice(0,4))===J([first('3-2'),LU2,DX.bowl,LU3])&&H.G.flags.SIS14_BOWL===true,J({m:!!m,q:q&&{ev:q.ev,h:q.h},s:s.slice(0,4)})); }

  /* ---------- 第 2 點：h9「出口那邊，你站右邊。我出來先看右邊。」→ 12/23 接機戀人版 ---------- */
  await vidGf('2028-12-17',15,[0]); const r0=H.G.flags.SIS14_RIGHT, h0=said(); await vidGf('2028-12-17',15,[1]); const r1=H.G.flags.SIS14_RIGHT;
  check('10. 第 2 點 h9 選「我會去接妳。」記 SIS14_RIGHT（她回「嗯。……出口那邊，你站右邊。我出來先看右邊。」照舊）；選「還是開一下。」不記',r0===true&&h0.includes('嗯。……出口那邊，你站右邊。我出來先看右邊。')&&r1==null,J({r0,r1,h0}));
  const pk=async(kind,fl,o,pre)=>{ fresh('2028-12-20',21.1,kind,fl,o); if(pre) pre(); ph(); if(PHONE.byAsk(H.G,'y4_pickup_two')) answer('y4_pickup_two',0); else if(PHONE.byAsk(H.G,'y4_pickup')) answer('y4_pickup',0); ph();
    const q=OUT.get(H.G,'y4_sis_pickup'); if(!q) return {v:H.G.flags.SIS_PICKUP_V||null,s:[]}; at('2028-12-23',19.6); await goOut('y4_sis_pickup',[0]); return {v:H.G.flags.SIS_PICKUP_V,s:said()}; };   /* 12/20 21:00 → 12/23 20:30 入境大廳 */
  const LOVE1='（她一出來就看到你。推車停在原地，她走過來，抱住你。）';
  const p1=await pk('dating',{SIS14_RIGHT:true}), p0=await pk('dating');
  check('10. 第 2 點 12/23 接機戀人版、有 SIS14_RIGHT：第一句旁白前面「'+DX.right+'」，接「（她一出來就看到你。……抱住你。）」「（很久，她才放開。）」；沒有 SIS14_RIGHT 照舊',
    p1.v==='lover'&&J(p1.s.slice(0,3))===J([DX.right,LOVE1,'（很久，她才放開。）'])&&p1.s.filter(t=>t===DX.right).length===1&&p0.v==='lover'&&p0.s[0]===LOVE1&&!p0.s.includes(DX.right),J({p1:p1.s.slice(0,3),p0:p0.s.slice(0,2)}));
  { const cg0=ADV.cg, had=CG_REGISTRY.cg_airport_pickup_heroine05, rd=had?had.redrawn:undefined; let pc=null;
    try{ ADV.cg=function(id){ const r=cg0.apply(this,arguments); H.said.push({who:'CG',t:id}); return r; }; if(had) had.redrawn=true; else CG_REGISTRY.cg_airport_pickup_heroine05={file:'(測試)',redrawn:true};
      pc=await pk('dating',{SIS14_RIGHT:true}); }
    finally{ ADV.cg=cg0; if(had){ if(rd===undefined) delete had.redrawn; else had.redrawn=rd; } else delete CG_REGISTRY.cg_airport_pickup_heroine05; }
    check('10. 第 2 點 冬天版 CG 通過以後（戀人版第一句拆成兩句、CG 夾在中間）：一樣先「'+DX.right+'」，再「（她一出來就看到你。推車停在原地。）」→ CG →「（她走過來，抱住你。）」',
      !!pc&&J(pc.s.slice(0,4))===J([DX.right,'（她一出來就看到你。推車停在原地。）','cg_airport_pickup_heroine05','（她走過來，抱住你。）']),J(pc&&pc.s.slice(0,4))); }
  const pj=await pk('dating',{SIS14_RIGHT:true,JP_DEPARTED:D('2028-03-25'),JP_RETURNED:D('2028-08-05')},{route:'JP'});
  check('10. 第 2 點 日本路線交往中（h9 照臺灣，稿 2-4）：一樣',pj.v==='lover'&&J(pj.s.slice(0,2))===J([DX.right,LOVE1]),J(pj));
  const pt=await pk('friend',{SIS14_RIGHT:true},null,()=>SOCIAL.remember(ID,'DROVE_HER','')), pf=await pk('fam',{SIS14_RIGHT:true});
  check('10. 第 2 點 只有戀人版：兩個人版、家族共乘就算有 SIS14_RIGHT（後來分開了）也沒有那一句',pt.v==='two'&&pt.s[0]==='（她推著行李推車走出來。看到你，停了一下。）'&&!pt.s.includes(DX.right)&&pf.v==='family'&&pf.s.length>0&&!pf.s.includes(DX.right),J({pt:[pt.v,pt.s.slice(0,1)],pf:[pf.v,pf.s.slice(0,1)]}));
});

H.done();
})();

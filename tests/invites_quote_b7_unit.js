// 有名字說的台詞拿掉「」第七批（TEXT-QUOTE-UNIFY-1108，AA-B 2026-11-08 12:29「做（兩種都做）」）——不需要瀏覽器（D131）。第一、二批 tests/invites_quote_unit.js，第三批 _b3，第四批 _b4，第五批 _b5，第六批 _b6。
// 規則（同前幾批）：在對話框「有名字」說出來的台詞，外面不包整句的「」；對話框沒有名字的（旁白、音效）、選項、手機訊息照留；句子裡面引用的「」照留。
// 這一批：
//   (1) STORY_EVENTS 裡有名字、整句「…」的 23 句（第六批列給 AA-B 看的那 23 句），拿掉外面那一對：
//       src/data/events.js 15 句（林教授刑訴課堂開場三句、許教授研究室三句、周教授研究室四句、林教授下課後三句、刑訴小考兩句；舊課堂 ev_class_crimpro、ev_quiz_crimpro 停用、定義留給舊存檔，一起改）、
//       src/y2r2_3d.js 明軒「……我的呢？」、src/friends2_3d.js 宥辰背民法第 71 條兩句（條文字一字不動）、src/data/bbpack_events.js 采蓁日劇台詞五句（g3 的 line）
//       ——都是事件的一步（speaker＝人物 → events3d.js runBody 的 GM.say(who,…)，對話框有名字）
//   (2) src/legal3d.js LEGAL.ask 出題的人（who＝{name:byName}，有名字）：程式自己在題目、選項外面加的那一對「」拿掉——
//       課堂是非題「'「'+stmt(q)+'——這句話對不對？'+G.name+'，你說。」'」、課堂選擇題「'「'+q.q+'」'」和選項那一句、讀書會選擇題的選項、同學（含小考、研究室）選擇題的選項；
//       q.q（src/data/legal_qbank.js，使用者給的題目）一字不動，裡面原本有的「」照留（Q004「罪疑唯輕」…）；給玩家選的選項（GM.choose 的 '「對。」'、'「'+o.k+'，'+o.t+'。」'）照留
// 照留：STORY_EVENTS 沒有名字的「嗶——」（ev_l1_elevator，沒有 speaker）、選項 1782 個；legal3d.js 表上整句「…」的句子（CLASS_INTRO、MATE_ASK…，字串本身就包著，不是程式包的）列給 AA-B 看（第 33 項印出來）
// 說過了的記號（存檔）：這些句子都不當記號（事件記 id、周教授記 ZHOU_ASKED、日劇記 JP_DRAMA_n／JP_G3_USED、課堂記題號）——第 38 項演完比存檔
// 檢查（BASE＝0e2690b0b，第七批以前的開發分支 head）：
//   33. 分類：BASE 有名字、整句「」的就是這 23 句；現在 0 句；沒名字的、選項一樣；說的人和 BASE 一樣；legal3d.js 程式包的「」只剩選項
//   34. 資料和 BASE 逐句比：STORY_EVENTS（全部載入以後）只改了這 23 句、只差外面那一對「」
//   35. 原始碼逐行比（第七批那一個 commit 本身，用 commit 標題找；commit 以前比 BASE 和現在的檔）：只動 5 個 src 檔；資料字串以外一字不差；legal3d.js 只拿掉程式包的那幾對；題庫一字不差
//   36. 讀書區：LIBQ.quiet 加（小聲）的時候本來就先拿掉外面的「」——BASE 的字和現在的字加完一樣（23 句、84 題的每一種出題句）
//   37. 演出來（另開 node，一次用 BASE 的檔、一次用現在的檔；index.html 全部載入）：周教授、許教授研究室、林教授下課後、刑訴課堂與小考、宥辰、明軒、采蓁日劇五題、23 句一句一句演、
//       LEGAL.ask 五種情境 × 是非／選擇——說的人一樣、字只差那一對「」；讀書區兩邊一模一樣
//   38. 存檔：每一段演完，BASE 和現在的存檔一模一樣，裡面沒有這 23 句（不用換記號；STORY.smallQuoteMigrate 不用改）
// 修改前（BASE 的 src 檔換回來跑）：見 commit 訊息。用法：node tests/invites_quote_b7_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), vm=require('vm'), crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..'), BASE='0e2690b0b', TITLE='有名字說的台詞拿掉外面的「」第七批';
const CHANGED=['src/data/events.js','src/y2r2_3d.js','src/friends2_3d.js','src/data/bbpack_events.js','src/legal3d.js'];
/* CANON-NO-ECON-1112 第四批：照 AA_889～AA_897、AA_873～AA_885 換字的場次不比（逐字對稿在各自的測試）*/
const CHG4=['ev_kexin_good_class','ev_kexin_quiz_y2','ev_kexin_xmas_y2','ev_kexin_birthday_y2','ev_kexin_birthday_y2_call','ev_kexin_summer_plan','ev_kexin_summer_plan_call','ev_kexin_presentation','ev_kexin_own_paths','ev_kexin_bus_home','ev_kexin_bad_exam','ev_kexin_call_helper','ev_kexin_tutor_practice','ev_kexin_k20','ev_kx_s1_deposit','ev_kx_s1_heard','ev_kx_s6_same','ev_kexin_birthday_y1s2','ev_kexin_birthday_y1s2_drink','ev_kexin_birthday_y1s2_late','ev_kexin_birthday_y1s2_next'];
const GONE_EV=['ev_kexin_tour_nccu','ev_kexin_yule_pass','ev_kexin_video_study','ev_kexin_birthday_y1','ev_kexin_our_day','ev_kexin_our_day_wk','ev_kexin_nye_missed_call','ev_kexin_anniv_missed_call','ev_kexin_reschedule','ev_kx_nye_video_y2','ev_kx_nye_video_y3','ev_kx_nye_video_y4','ev_kexin_kh_missed_call','ev_kexin_qixi_video','ev_kexin_30min','ev_kexin_lecture_ntu','ev_kexin_lecture_table','ev_kexin_juniors_video','ev_kexin_kn_call_y3','ev_kexin_last_study_night','ev_kexin_two_circles','ev_kexin_call_helper2','ev_kexin_k18_call','ev_kexin_k20_call','ev_kexin_juniors_dinner','ev_kexin_film_night','ev_kexin_quiz_y2_video','ev_econ_night_y2','ev_kexin_video_report'].concat(Array.from({length:9},(_,i)=>'ev_kx_drift_r'+['1','1b','2','3','4','5','5_call','6','7'][i]));   /* CANON-NO-ECON-1112 第三批拿掉的事件：BASE、現在兩邊都不比（這一項拿掉）*/
const gitShow=(r,f)=>cp.execFileSync('git',['-C',ROOT,'show',r+':'+f],{encoding:'utf8',maxBuffer:1<<28});
const cur=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
/* 演出來的「現在」那一邊：legal3d.js、classes3d.js 讀第八批那一個 commit 的版本（用標題找）——之後 BUG-LEGAL-PROF-TONE-1108（AA-B 11-08 13:38：教授出題不用 MATE_*、鄭教授開場拆三段）
   故意改了說的話，不只是「」；這一批只驗「」那一部分，後來那一改由 tests/legal_prof_tone_unit.js 驗（找不到 commit＝照舊讀現在的檔） */
const PIN_TITLE='有名字說的台詞拿掉外面的「」第八批', PIN_FILES=['src/legal3d.js','src/classes3d.js'];
const pinC8=(()=>{ try{ const L=cp.execFileSync('git',['-C',ROOT,'log','--format=%H %s','-F','--grep='+PIN_TITLE],{encoding:'utf8',maxBuffer:1<<26}).split('\n'); const x=L.find(l=>l.slice(41).startsWith(PIN_TITLE)); return x?x.slice(0,40):null; }catch(e){ return null; } })();
/* 同前幾批的尺 */
const wrapped=t=>{ if(typeof t!=='string'||t.length<2||t[0]!=='「'||t[t.length-1]!=='」') return false; let d=0; for(let i=0;i<t.length;i++){ const c=t[i]; if(c==='「') d++; else if(c==='」'){ d--; if(d===0&&i!==t.length-1) return false; } } return d===0; };
const unq=t=>wrapped(t)?t.slice(1,-1):t;
const noComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');
const blankComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,''));
const LIT=/'((?:[^'\\\n]|\\.)*)'/g;
/* 這一批的 23 句：[檔, 事件, BASE 的字（說的人）] */
const TW=[
  ['src/data/events.js','ev_class_crimpro','「上週我們談了刑事訴訟的目的。有人以為就是『把壞人抓到』——今天我們從被告的位置看一次。」','prof_lin'],
  ['src/data/events.js','ev_class_crimpro','「下一個問題比較實務。警察局的訊問室裡發生的事，法院要怎麼看？」','prof_lin'],
  ['src/data/events.js','ev_class_crimpro','「這兩題會出現在期中。不是威脅，是預告。」','prof_lin'],
  ['src/data/events.js','ev_prof_xu_office','「讀一個問題讀兩年。大部分人以為是讀更多條文，其實是讀更少、讀更深。」','prof_xu'],
  ['src/data/events.js','ev_prof_xu_office','「你才一年級。先把民總讀好——但如果哪堂課讓你下課還在想，記得那是什麼課。」','prof_xu'],
  ['src/data/events.js','ev_prof_xu_office','「先不要讀教科書以外的東西。真的要讀，就讀『怎麼問問題』的書。」','prof_xu'],
  ['src/data/events.js','ev_prof_zhou_office','「你上次答得不錯。有問題？」','prof_zhou'],
  ['src/data/events.js','ev_prof_zhou_office','「有問題就問。沒問題就回去讀。」','prof_zhou'],
  ['src/data/events.js','ev_prof_zhou_office','「好問題。看他有沒有『合理注意的可能』。網頁掛三天沒改，跟掛三分鐘，不一樣。」','prof_zhou'],
  ['src/data/events.js','ev_prof_zhou_office','「一年級不用讀太多。一本，讀三遍。」','prof_zhou'],
  ['src/data/events.js','ev_prof_lin_after','「你剛剛那題——」','prof_lin'],
  ['src/data/events.js','ev_prof_lin_after','「很多人第一年都以為刑訴只是抓壞人。等你看過一個無罪判決，就會懂。」','prof_lin'],
  ['src/data/events.js','ev_prof_lin_after','「來研究室也可以。週二下午。」','prof_lin'],
  ['src/data/events.js','ev_quiz_crimpro','「今天先小考。三題，不算分，但我會記得誰寫對。」','prof_lin'],
  ['src/data/events.js','ev_quiz_crimpro','「收卷。下週講強制處分。」','prof_lin'],
  ['src/y2r2_3d.js','ev_zhe_game_y2s2','「……我的呢？」','classmate_mingxuan'],
  ['src/friends2_3d.js','ev_f2_youchen_back','「法律行為，違反強制或禁止之規定者，無效。」','classmate_youchen'],
  ['src/friends2_3d.js','ev_f2_youchen_back','「但其規定並不以之為無效者，不在此限。」','classmate_youchen'],
  ['src/data/bbpack_events.js','ev_jp_g3','「お疲れさまです。」','采蓁'],
  ['src/data/bbpack_events.js','ev_jp_g3','「ただいま。」','采蓁'],
  ['src/data/bbpack_events.js','ev_jp_g3','「別に。」','采蓁'],
  ['src/data/bbpack_events.js','ev_jp_g3','「よろしくお願いします。」','采蓁'],
  ['src/data/bbpack_events.js','ev_jp_g3','「まさか。」','采蓁'] ];
const OLD23=TW.map(x=>x[2]), NEW23=OLD23.map(unq);
/* legal3d.js 程式包的那幾對（BASE → 現在；註解以外，套上這幾個替換＝現在的那幾行）*/
const LEGAL_REP=[
  ["await say('「'+stmt(q)+'——這句話對不對？'+G.name+'，你說。」','serious');","await say(stmt(q)+'——這句話對不對？'+G.name+'，你說。','serious');"],
  ["await say('「'+q.q+'」','serious');","await say(q.q,'serious');"],
  ["await say('「'+opts4(q).map(o=>o.k+'、'+o.t).join('；')+'。'+G.name+'，你選哪個？」','neutral');","await say(opts4(q).map(o=>o.k+'、'+o.t).join('；')+'。'+G.name+'，你選哪個？','neutral');"],
  ["if(q.type==='mc') await say('「'+opts4(q).map(o=>o.k+'、'+o.t).join('；')+'」','neutral');","if(q.type==='mc') await say(opts4(q).map(o=>o.k+'、'+o.t).join('；'),'neutral');"],
  ["await say(fill(pick(MATE_MC),q),'thinking'); await say('「'+opts4(q).map(o=>o.k+'、'+o.t).join('；')+'」','neutral');","await say(fill(pick(MATE_MC),q),'thinking'); await say(opts4(q).map(o=>o.k+'、'+o.t).join('；'),'neutral');"]];
const QIDS=['Q001','Q002','Q004'];   /* 是非題、選擇題、題目開頭就有「」的選擇題（「罪疑唯輕」主要作用於：）*/
const CTXS=['class','study','classmate','quiz','office'];

if(process.env.QUOTE_B7_PROBE) (async()=>{
  /* ===================== 演出來（子程序）：QUOTE_B7_PROBE=old 讀 BASE 的 CHANGED，=new 讀現在的；index.html 的 src 全部載入（同第六批）===================== */
  const mode=process.env.QUOTE_B7_PROBE;
  if(mode==='old'){ const OLD={}; for(const f of CHANGED) OLD[path.join(ROOT,f)]=gitShow(BASE,f); const real=fs.readFileSync;
    fs.readFileSync=function(p){ if(typeof p==='string'){ const k=path.resolve(p); if(OLD[k]!=null) return OLD[k]; } return real.apply(fs,arguments); }; }
  /* 2026-11-11 之後故意改的劇情（不是第七批的範圍，各自有逐句對稿的測試）：這幾個檔用改之前那一版（9d45ef8b3，這支測試在那裡全過）比——
     AA_814（企劃線 91c6aaf9f，tests/aa814_prio_gap_1111_unit.js）：events.js 1/8 j8a 補一句、2/14 E27b 加五格；r2y4a_events.js 美國交換三處；
     AA_742 第 ③ 節（tests/gg_shops3_story_1111_unit.js）：sis_grad3d.js 場景名「公館・日日定食」→「汀州路・泰米村食」 */
  const LATER_PIN='9d45ef8b3', LATER_FILES=['src/data/events.js','src/data/r2y4a_events.js','src/sis_grad3d.js'];
  { const PL={}; for(const f of LATER_FILES) if(mode==='new'||!CHANGED.includes(f)) PL[path.join(ROOT,f)]=gitShow(LATER_PIN,f); const real=fs.readFileSync;   /* 兩邊都釘（old＝BASE 的 CHANGED 照舊從 BASE 讀，其他檔原本讀現在的）*/
    fs.readFileSync=function(p){ if(typeof p==='string'){ const k=path.resolve(p); if(PL[k]!=null) return PL[k]; } return real.apply(fs,arguments); }; }
  if(mode==='new'&&pinC8){ const PN={}; for(const f of PIN_FILES) PN[path.join(ROOT,f)]=gitShow(pinC8,f); const real=fs.readFileSync;
    fs.readFileSync=function(p){ if(typeof p==='string'){ const k=path.resolve(p); if(PN[k]!=null) return PN[k]; } return real.apply(fs,arguments); }; }
  const out={errs:[]};
  console.warn=()=>{}; console.log=()=>{};
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
  GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.D=GM.D||{}; GM.D.busyDepth=0; GM.D.active=false;
  /* 筆記、日誌照 game3d.js 寫進存檔（第 38 項比存檔）*/
  GM.addNote=(id,title,body)=>{ const G=H.G; G.notes=G.notes||[]; if(G.notes.find(n=>n.id===id)) return false; G.notes.push({id,title,body,day:G.day}); return true; }; GM.hasNote=id=>!!(H.G.notes||[]).find(n=>n.id===id);
  GM.memo=t=>{ const G=H.G; G.memo=G.memo||[]; G.memo.push(t&&typeof t==='object'?Object.assign({day:G.day},t):{day:G.day,t}); };
  if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};
  const say0=GM.say; GM.say=async(who,t,o)=>say0(who,typeof LIBQ!=='undefined'?LIBQ.whisper(GM,who,t):t,o);   /* game3d.js 的 say：讀書區加（小聲）*/
  const rec=()=>H.said.map(s=>[s.who,s.t]);
  const sec=async(k,f)=>{ seed(k.length*7919); try{ await f(); }catch(e){ out.errs.push(k+'：'+String(e&&e.stack||e).split('\n').slice(0,3).join(' / ').slice(0,400)); } };
  const P_=H.E.player, at=(zone,lv,x,z)=>{ H.G.zone=zone; P_.lv=lv|0; P_.obj.position.x=x||0; P_.obj.position.z=z||0; };
  const keyOf=d=>CALENDAR.dateOf(d).key, TD=(t,w,wd)=>STORY.termDay(t,w,wd);
  const fresh=(d,h,zone,flags)=>{ const G=H.fresh(typeof d==='number'?keyOf(d):d,h,zone||'campus',Object.assign({introDone:true,afternoonDone:true,classDone:true},flags||{})); G.notes=[]; G.memo=[]; E.player.busy=false; at(G.zone,0,0,0); if(typeof LIBQ!=='undefined') LIBQ.reset(); LEGAL.bind(G,GM); return G; };
  const ev=id=>STORY_EVENTS.find(e=>e.id===id);
  const asked=[]; const ask0=LEGAL.ask; LEGAL.ask=async function(spec,e){ const r=await ask0.apply(this,arguments); asked.push(r&&r.q?r.q.id:null); return r; };   /* 記下問了哪一題（第 37 項對題目字）*/
  const saveOf=()=>{ const j=JSON.stringify(H.G); return {md5:crypto.createHash('md5').update(j).digest('hex'),len:j.length,has:OLD23.concat(NEW23).filter(s=>j.includes(s))}; };
  out.save={}; out.play={};
  const run=async(k,id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); asked.length=0; const e=ev(id); if(!e){ out.play[k]={lines:[['（沒有事件）',id]],asked:[]}; return; } await EVENTS.run(e); out.play[k]={lines:rec(),asked:asked.slice()}; out.save[k]=saveOf(); };
  /* ---------- 33／34 掃描：STORY_EVENTS 每一步的 text（包含巢狀）、說的人（照 events3d.js runBody）---------- */
  await sec('scan',async()=>{ fresh('2026-10-07',10,'campus'); const L=[];
    for(const e of STORY_EVENTS.filter(e=>!GONE_EV.includes(e.id))){ const seen=new Set(); (function w(a,p){ if(Array.isArray(a)) a.forEach((x,i)=>w(x,p+'['+i+']')); else if(a&&typeof a==='object'&&!seen.has(a)){ seen.add(a);
      if(typeof a.text==='string'&&(wrapped(a.text)||NEW23.includes(a.text))){ const choice=/\.choice\[\d+\]$/.test(p); let kind, name=null;
        if(choice) kind='choice'; else if(a.phone||a.phoneMe) kind='phone'; else if(a.speaker&&a.speaker!=='player'&&a.speaker!=='narrator'){ const sid=EVENTS.speakerId(a.speaker); name=a.name||(sid!==a.speaker?a.speaker:(SOCIAL.npcName?SOCIAL.npcName(a.speaker):SOCIAL.displayName(a.speaker))); kind=name?'named':'nameless'; }
        else if(a.speaker==='player'){ kind='named'; name=H.G.name; } else kind='nameless';
        L.push({ev:e.id,p,kind,speaker:a.speaker===undefined?null:a.speaker,name,text:a.text,wrapped:wrapped(a.text)}); }
      for(const k of Object.keys(a)) if(k!=='text') w(a[k],p+'.'+k); } })(e.dialogue,''); }
    out.scan=L; });
  /* ---------- 34 資料：STORY_EVENTS 的字串（全部載入以後，同第六批）---------- */
  { const J0=x=>JSON.stringify(x); const dump=(o,p,acc,seen)=>{ seen=seen||new Set(); if(o==null){ acc.push([p,String(o)]); return acc; } if(typeof o==='string'||typeof o==='number'||typeof o==='boolean'){ acc.push([p,typeof o==='string'?o:J0(o)]); return acc; }
      if(typeof o==='function'){ acc.push([p,'fn:'+String(o)]); return acc; } if(seen.has(o)){ acc.push([p,'(seen)']); return acc; } seen.add(o); for(const k of Object.keys(o)) dump(o[k],p+'.'+k,acc,seen); return acc; };
    out.data=dump(STORY_EVENTS.filter(e=>!GONE_EV.includes(e.id)).map(e=>({id:e.id,dialogue:e.dialogue})),'STORY_EVENTS',[]).filter(x=>!/^fn:/.test(x[1])); }
  /* ---------- 36 讀書區：LIBQ.quiet 的加法（BASE、現在的字各加一次）---------- */
  { const QB=QBANK, st=q=>q.q.replace(/。$/,''), op=q=>['A','B','C','D'].map(k=>k+'、'+q.options[k]).join('；'), forms=[];
    for(const q of QB){ if(q.type==='tf') forms.push(st(q)+'——這句話對不對？祐廷，你說。'); else forms.push(q.q,op(q)+'。祐廷，你選哪個？',op(q)); }
    out.quiet={legal:forms.map(t=>[t,LIBQ.quiet('「'+t+'」'),LIBQ.quiet(t)]),lines:OLD23.map((t,i)=>[t,LIBQ.quiet(t),LIBQ.quiet(NEW23[i])])}; }
  /* ---------- 37 演出來：周教授研究室（大一上第 4 週週四）：無過失、推薦書、classAnswerPlus 的招呼 ---------- */
  await sec('zhou',async()=>{ const T1=TD('Y1S1',4,4);
    fresh(T1,15.5,'wancai'); await run('zhou_q88','ev_prof_zhou_office',['無過失']);
    H.at(keyOf(T1+7),15.5); await run('zhou_book','ev_prof_zhou_office',['推薦一本書']);
    fresh(T1,15.5,'wancai',{classAnswerPlus:true}); await run('zhou_plus','ev_prof_zhou_office',['沒事']); });
  /* ---------- 許教授研究室（大一上第 6 週週三）：法研所、推薦書 ---------- */
  await sec('xu',async()=>{ const D=TD('Y1S1',6,3);
    fresh(D,14.5,'wancai'); await run('xu_grad','ev_prof_xu_office',['法研所']);
    H.at(keyOf(D+7),14.5); await run('xu_book','ev_prof_xu_office',['推薦一本一年級']); });
  /* ---------- 林教授下課後（大三上）：第一次（Q001 卡過＝多那一句；同學情境出題 prefer confused）---------- */
  await sec('lin',async()=>{ fresh(TD('Y3S1',3,2),12.0,'campus'); LEGAL.rec('Q001').state='confused'; await run('lin_after','ev_prof_lin_after',[0,0]); });
  /* ---------- 刑訴課堂、小考（停用的舊事件，定義留給舊存檔：直接演；課堂情境、小考情境出題）---------- */
  await sec('crim',async()=>{ fresh(TD('Y3S1',3,2),10.0,'classroom'); await run('crim_class','ev_class_crimpro',[0,0]); H.at(keyOf(TD('Y3S1',5,2)),10.0); await run('crim_quiz','ev_quiz_crimpro',[0,0,0]); });
  /* ---------- 宥辰「我回來了」、明軒送水、采蓁日劇五題 ---------- */
  await sec('yc',async()=>{ fresh(TD('Y1S1',15,4),9.0,'classroom'); await run('yc_back','ev_f2_youchen_back',[]); });
  await sec('mx',async()=>{ fresh(TD('Y2S2',8,6),15.0,'campus'); await run('mx_water','ev_zhe_game_y2s2',['送水']); });
  await sec('jp',async()=>{ fresh(TD('Y2S1',2,1),13.0,'gongtong',{JP_MET:true}); const ANS=['「辛苦了。」','「我回來了。」','「沒什麼。」','「兩個都是。」','「不會吧。」'];
    for(let n=1;n<=5;n++) await run('jp_'+n,'ev_jp_g3',[ANS[n-1]]); });
  /* ---------- 23 句一句一句演（照事件裡那一步的 speaker、expression、name；讀書區外、讀書區（總圖 3F）各一次）---------- */
  await sec('steps',async()=>{ for(const [k,zone] of [['out','campus'],['lib','library']]){ const L=[];
      for(const t of (mode==='old'?OLD23:NEW23)){ const st=(out.scan||[]).find(s=>s.text===t&&s.kind!=='choice'); if(!st){ L.push(['（找不到）',t]); continue; }
        fresh('2027-11-10',15,zone); H.said=[]; await EVENTS.runLines([{speaker:st.speaker,text:st.text}],{id:'__b7'}); L.push(...rec()); }
      out.play['steps_'+k]={lines:L,asked:[]}; out.save['steps_'+k]=saveOf(); } });
  /* ---------- LEGAL.ask：五種情境 × 是非題、選擇題、開頭就有「」的選擇題；讀書區外、讀書區各一次 ---------- */
  await sec('legal',async()=>{ for(const [k,zone] of [['out','campus'],['lib','library']]) for(const ctx of CTXS) for(const qid of QIDS){ const G=fresh('2026-10-07',10,zone); seed(ctx.length*31+qid.charCodeAt(3));
      H.said=[]; H.picks=[0]; asked.length=0; await LEGAL.ask({context:ctx,by:ctx==='study'?'heroine_05':'prof_lin',qid,quiet:true}); out.play['legal_'+k+'_'+ctx+'_'+qid]={lines:rec(),asked:asked.slice()}; out.save['legal_'+k+'_'+ctx+'_'+qid]=saveOf(); } });
  process.stdout.write('@@B7@@'+JSON.stringify(out)+'\n',()=>process.exit(0));
})().catch(e=>{ process.stdout.write('@@B7@@'+JSON.stringify({errs:['例外：'+String(e&&e.stack||e).slice(0,600)]})+'\n',()=>process.exit(0)); });
else main();

/* ===================== 主程式 ===================== */
function main(){
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, sample=L=>L.slice(0,6).join('／')+(L.length>6?'…（共 '+L.length+'）':'');
const lits=s=>{ const t=noComments(s), o=[]; let m; LIT.lastIndex=0; while((m=LIT.exec(t))) o.push(m[1]); return o; };
const runProbe=m=>{ let o=''; try{ o=cp.execFileSync(process.execPath,[__filename],{env:Object.assign({},process.env,{QUOTE_B7_PROBE:m}),encoding:'utf8',maxBuffer:1<<29,stdio:['pipe','pipe','pipe']}); }catch(e){ o=String(e.stdout||''); }
  const line=o.split('\n').find(l=>l.startsWith('@@B7@@')); return line?JSON.parse(line.slice(6)):{errs:['子程序沒有結果：'+o.slice(-300)]}; };
const O=runProbe('old'), N=runProbe('new');
/* 題庫（BASE 的檔；第 35 項另外查現在的檔一字不差）：程式包「」的那幾種句子 */
const QB=(()=>{ const c=vm.createContext({}); vm.runInContext(gitShow(BASE,'src/data/legal_qbank.js').replace(/^const QBANK\s*=/m,'globalThis.QBANK='),c); return vm.runInContext('globalThis.QBANK',c); })();
const st=q=>q.q.replace(/。$/,''), op=q=>['A','B','C','D'].map(k=>k+'、'+q.options[k]).join('；');
const formsOf=q=>q.type==='tf'?[st(q)+'——這句話對不對？祐廷，你說。']:[q.q,op(q)+'。祐廷，你選哪個？',op(q)];
/* 第八批（TEXT-QUOTE-UNIFY-1108，AA-B 11-08 13:05、13:14；tests/invites_quote_b8_unit.js）：legal3d.js 13 張表的 36 句拿掉外面那一對「」，句尾是答案（{core}）、填完沒有標點的補一個「。」。
   第 33、37 項看得到這一批以後的 legal3d.js：只認「BASE 的表（0e2690b0b，第七批沒動）× 84 題填完的那一句」→「拿掉外面那一對（＋句尾是答案的補「。」）」，一句一句寫死比；第七批自己的檢查（23 句、程式包的那一對）照舊 */
const B8=(()=>{ const T=['CLASS_INTRO','CLASS_OK','CLASS_BAD','CLASS_UNSURE','MATE_ASK','MATE_MC','MATE_OK','MATE_BAD','STUDY_ASK','STUDY_OK','STUDY_BAD','STUDY_UNSURE','MATE_UNSURE'];
  const L=gitShow(BASE,'src/legal3d.js').split('\n').map(l=>l.replace(/\/\*[\s\S]*?\*\//g,'')), one=re=>L.filter(l=>re.test(l))[0]||'';
  const c=vm.createContext({G:{name:'祐廷'}}); vm.runInContext(['stmt','coreText','fill'].map(n=>one(new RegExp('^  function '+n+'\\('))).concat(T.map(n=>one(new RegExp('^  const '+n+'=')))).join('\n')+'\nglobalThis.K={fill,T:{'+T.join(',')+'}};',c);
  const K=vm.runInContext('globalThis.K',c), m=new Map(), tl=[]; for(const n of T){ const x=K.T[n]; (Array.isArray(x)?[x]:Object.values(x)).forEach(a=>tl.push(...a)); }
  for(const t of tl) for(const q of QB){ const a=K.fill(t,q); if(!wrapped(a)) continue; const u=unq(a); m.set(a,/\{core\}」$/.test(t)&&!/[。！？!?…」』）)]$/.test(u)?u+'。':u); }
  return {m,n:tl.length}; })();

/* ---------- 33. 分類 ---------- */
check('33. 兩次都跑得起來（'+BASE+' 的檔、現在的檔；index.html 全部載入、沒有例外）',!(O.errs||[]).length&&!(N.errs||[]).length,sample((O.errs||[]).concat(N.errs||[])));
{ const CHG=new Set(['ev_xinci_double','ev_b6_lecture','ev_b10_table'].concat(CHG4)), haveEv=new Set((N.scan||[]).map(s=>s.ev));   /* CANON-NO-ECON-1112 第三批：整場拿掉的事件、拿掉幾列的三場不比 */
  const so=(O.scan||[]).filter(s=>haveEv.has(s.ev)&&!CHG.has(s.ev)), sn=(N.scan||[]).filter(s=>!CHG.has(s.ev));
  const named=L=>L.filter(s=>s.kind==='named'&&s.wrapped);
  const no=named(so), nn=named(sn);
  check('33. BASE：STORY_EVENTS 有名字、整句「…」的＝這 23 句（事件、說的人、字一句一句對）',no.length===23&&TW.every(([f,e,t,sp])=>no.filter(s=>s.ev===e&&s.text===t&&s.speaker===sp).length===1),sample(no.map(s=>s.ev+'：'+s.text)));
  check('33. 現在：STORY_EVENTS 有名字、整句「…」的 0 句',nn.length===0,sample(nn.map(s=>s.ev+'：'+s.text)));
  const nl=L=>L.filter(s=>s.kind==='nameless'&&s.wrapped).map(s=>[s.ev,s.p,s.speaker,s.text]), ch=L=>L.filter(s=>s.kind==='choice'&&s.wrapped).map(s=>[s.ev,s.p,s.text]), ph=L=>L.filter(s=>s.kind==='phone'&&s.wrapped).map(s=>[s.ev,s.p,s.text]);
  /* 2026-11-11（X327 沛珊重寫，AA_766_peishan_leftover2.json@1e647bb05）：D4c「沛珊的問題」的選項換了字（九個帶「」的選項；個數、位置不變）——選項逐個比，那幾個照 tests/peishan_rewrite_1111.js 的 PAIRS 算，其他一模一樣 */
  const chSame=(A,B)=>A.length===B.length&&A.every((a,i)=>a[0]===B[i][0]&&a[1]===B[i][1]&&(a[2]===B[i][2]||require('./peishan_rewrite_1111.js').pair(a[2],B[i][2])));
  check('33. 照留：沒有名字的「嗶——」（ev_l1_elevator，沒有 speaker＝GM.say(null,…)）、選項 '+ch(sn).length+' 個、手機 '+ph(sn).length+' 句——和 BASE 一模一樣（D4c 沛珊的問題那幾個選項照 AA_766 換字）',
    J(nl(sn))===J([['ev_l1_elevator','[7]',null,'「嗶——」']])&&J(nl(so))===J(nl(sn))&&ch(sn).length>1500&&chSame(ch(so),ch(sn))&&J(ph(so))===J(ph(sn)),J([nl(sn),ch(so).length,ch(sn).length,ch(so).filter((a,i)=>J(a)!==J(ch(sn)[i])).length]));
  const bad=[]; for(const [f,e,t,sp] of TW){ const a=so.find(s=>s.ev===e&&s.text===t), b=sn.find(s=>s.ev===e&&s.text===unq(t)); if(!a||!b){ bad.push('找不到 '+e+'：'+t); continue; }
    if(a.p!==b.p||a.speaker!==b.speaker||a.name!==b.name||!b.name||b.kind!=='named'||b.wrapped) bad.push(e+'：'+J([a,b])); }
  console.log('（33. 說的人：'+[...new Set(sn.filter(s=>NEW23.includes(s.text)).map(s=>s.ev+'＝'+s.name))].join('、')+'）');
  check('33. 23 句現在的字＝拿掉外面那一對（'+NEW23.slice(0,3).join('／')+'…）；在事件裡的位置、speaker、對話框的名字和 BASE 一樣（都有名字）',bad.length===0,sample(bad));
  /* 23 句在 src 裡只出現在自己那個檔、一次（沒有別的程式拿這些字當記號或比對）*/
  const LIT2=/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g, allLits=s=>{ const o=[]; let m; LIT2.lastIndex=0; while((m=LIT2.exec(s))) o.push(m[1]!=null?m[1]:(m[2]!=null?m[2]:m[3])); return o; };   /* 整個字串常值一樣才算（「よろしくお願いします。」也是立衡自我介紹的後半句，不算）*/
  const hits=[]; (function walk(d){ for(const f of fs.readdirSync(path.join(ROOT,d)).sort()){ const p=d+'/'+f; if(fs.statSync(path.join(ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)){ const L=allLits(noComments(cur(p))); TW.forEach(([f0,e,t],i)=>{ for(const x of [t,NEW23[i]]){ const n=L.filter(y=>y===x).length; if(n) hits.push([i,p,x,n]); } }); } } })('src');
  const okSrc=TW.every(([f0],i)=>{ const h=hits.filter(x=>x[0]===i); return h.length===1&&h[0][1]===f0&&h[0][2]===NEW23[i]&&h[0][3]===1; });
  check('33. 23 句在 src（註解以外的字串常值）只出現在自己那個檔、一次（舊的字沒有了；沒有別的程式拿這些字比對）',okSrc,sample(hits.filter(x=>x[2]===OLD23[x[0]]||x[1]!==TW[x[0]][0]||x[3]!==1).map(x=>x[1]+'：'+x[2]+'×'+x[3])));
  /* legal3d.js：程式包「」的只剩選項 */
  const LG=noComments(cur('src/legal3d.js')), say=[...LG.matchAll(/await say\(([^;]*?),'(?:serious|neutral|thinking|smile)'\)/g)].map(m=>m[1]);
  check('33. legal3d.js LEGAL.ask：出題的人說的（say(…)）沒有一句是程式在外面包「」的；課堂選擇題說的就是 q.q；程式加的「」只剩給玩家選的選項（GM.choose：「對。」「不對。」、「A，…。」）',
    say.length>=8&&!say.some(s=>/^'「'\+|\+'[^']*」'$/.test(s))&&say.includes('q.q')&&(LG.match(/'「'\+/g)||[]).length===1&&/options=opts4\(q\)\.map\(o=>\(\{t:'「'\+o\.k\+'，'\+o\.t\+'。」',v:o\.k\}\)\)/.test(LG)&&/\{t:'「對。」',v:'對'\},\{t:'「不對。」',v:'錯'\}/.test(LG),J(say));
  const wl=lits(cur('src/legal3d.js')).filter(wrapped), wlo=lits(gitShow(BASE,'src/legal3d.js')).filter(wrapped);
  console.log('（33. legal3d.js 表上整句「…」：BASE '+wlo.length+' 個（第七批沒動，列給 AA-B）；第八批拿掉 36 句外面那一對，現在剩給玩家選的 '+wl.length+' 個：'+wl.join('／')+'）');
  /* 第七批：表上的字串沒動（第 35 項比第七批那一個 commit 本身）。第八批（tests/invites_quote_b8_unit.js）以後：BASE 的 40 個＝表上 36 句＋選項 4 個；現在只剩選項 4 個，表上 36 句拿掉外面那一對的字都在 */
  const OPT4=['「對。」','「不對。」','「……我不確定。」','「……不確定。」'], litN=lits(cur('src/legal3d.js')), tab=wlo.filter(t=>!OPT4.includes(t));
  check('33. legal3d.js 表上整句「…」的字串（CLASS_INTRO、MATE_ASK…，字串本身就包著）第七批沒動（BASE '+wlo.length+' 個＝表上 '+tab.length+' 句＋選項 4 個）；第八批以後只剩選項 4 個，表上 '+tab.length+' 句拿掉外面那一對的字各在一次',
    wlo.length===40&&tab.length===36&&J(wl)===J(OPT4)&&B8.n===36&&tab.every(t=>litN.filter(x=>x===unq(t)).length===1)); }

/* ---------- 34. 資料和 BASE 逐句比 ---------- */
{ const reId=L=>{ const id={}; for(const [p,v] of L){ const m=/^STORY_EVENTS\.(\d+)\.id$/.exec(p); if(m) id[m[1]]=v; } return L.map(([p,v])=>[p.replace(/^STORY_EVENTS\.(\d+)/,(z,i)=>'STORY_EVENTS.'+id[i]),v]); };   /* CANON-NO-ECON-1112 第三批：路徑換成事件 id，整場拿掉的事件、拿掉幾列的三場不比 */
  const CHG=new Set(['ev_xinci_double','ev_b6_lecture','ev_b10_table'].concat(CHG4)), B=reId(N.data||[]).filter(x=>!CHG.has(x[0].split('.')[1])), have=new Set(B.map(x=>x[0].split('.')[1])), A=reId(O.data||[]).filter(x=>have.has(x[0].split('.')[1])), bad=[], hit=[];
  if(A.length!==B.length) bad.push('字串個數 '+A.length+' → '+B.length);
  else A.forEach((a,i)=>{ const b=B[i]; if(a[0]!==b[0]){ bad.push('路徑不同：'+a[0]+' → '+b[0]); return; } if(a[1]===b[1]) return; if(require('./peishan_rewrite_1111.js').pair(a[1],b[1])) return; if(require('./kx_rewrite_1112.js').pair(a[1],b[1])) return;   /* 2026-11-12（X324 可昕續改，AA_827_kx_triple_short_2.json@07d50af2f7：手寫檔七句 old→new，清單在 tests/kx_rewrite_1112.js、逐列對稿在 tests/kx_triple2_1112_unit.js）：bbpack_events.js「我來找品妤，順便找你。順序不要問。」照新稿算。舊期望：這一句和 BASE 一字不差 */   /* 2026-11-11（X327 沛珊重寫第四批以後：AA_759、AA_761、AA_762、AA_763；清單在 tests/peishan_rewrite_1111.js 的 PAIRS） */ if(wrapped(a[1])&&unq(a[1])===b[1]&&OLD23.includes(a[1])) hit.push(a[1]); else bad.push(a[0]+'：'+a[1]+' → '+b[1]); });
  check('34. STORY_EVENTS（全部載入以後，每一場的 dialogue，'+B.length+' 個值）和 '+BASE+' 比：只改了這 23 句（一句一次）、只差外面那一對「」，其他一字不差',A.length>30000&&bad.length===0&&J(hit.slice().sort())===J(OLD23.slice().sort()),sample(bad)+'｜'+hit.length); }

/* ---------- 35. 原始碼逐行比（這一個 commit 本身）---------- */
const findC7=()=>{ try{ const L=cp.execFileSync('git',['-C',ROOT,'log','--format=%H %s','-F','--grep='+TITLE],{encoding:'utf8',maxBuffer:1<<26}).split('\n'); const x=L.find(l=>l.slice(41).startsWith(TITLE)); return x?x.slice(0,40):null; }catch(e){ return null; } };
{ const C7=findC7(), A_=f=>C7?gitShow(C7+'^',f):gitShow(BASE,f), B_=f=>C7?gitShow(C7,f):cur(f);
  console.log('（35. 比的是 '+(C7?'第七批那一個 commit '+C7.slice(0,9)+'^ → '+C7.slice(0,9):'commit 以前：'+BASE+' → 現在的檔')+'）');
  const files=(C7?cp.execFileSync('git',['-C',ROOT,'diff','--name-only',C7+'^',C7,'--','src'],{encoding:'utf8'}):cp.execFileSync('git',['-C',ROOT,'diff','--name-only',BASE,'--','src'],{encoding:'utf8'})).split('\n').filter(Boolean).sort();
  check('35. 改到的 src 檔就是這 '+CHANGED.length+' 個（'+CHANGED.join('、')+'）',J(files)===J(CHANGED.slice().sort()),J(files));
  const split=l=>{ const code=[], lit=[]; let last=0, m; LIT.lastIndex=0; while((m=LIT.exec(l))){ code.push(l.slice(last,m.index)); lit.push(m[1]); last=m.index+m[0].length; } code.push(l.slice(last).replace(/\s+$/,'')); return {code,lit}; };
  const nonBlank=s=>blankComments(s).split('\n').map(l=>l.replace(/\s+$/,'')).filter(l=>l.trim());
  const WANT={'src/data/events.js':[8,15],'src/y2r2_3d.js':[1,1],'src/friends2_3d.js':[2,2],'src/data/bbpack_events.js':[5,5]};
  const per={}, bad=[], got=[];
  for(const f of Object.keys(WANT)){ const A=nonBlank(A_(f)), B=nonBlank(B_(f)); if(A.length!==B.length){ bad.push(f+'：註解以外的行數不同 '+A.length+' → '+B.length); continue; }
    let nl=0, nt=0; A.forEach((a,i)=>{ const b=B[i]; if(a===b) return; nl++; const x=split(a), y=split(b);
      if(J(x.code)!==J(y.code)){ bad.push(f+'：「'+a.trim().slice(0,40)+'」程式（字串以外）不一樣'); return; } if(x.lit.length!==y.lit.length){ bad.push(f+'：字串個數不一樣'); return; }
      x.lit.forEach((s,k)=>{ const t=y.lit[k]; if(s===t) return; if(wrapped(s)&&unq(s)===t&&TW.some(q=>q[0]===f&&q[2]===s)){ nt++; got.push(s); } else bad.push(f+'：「'+s.slice(0,20)+'」→「'+t.slice(0,20)+'」不是這一批的那幾句'); }); });
    per[f]=[nl,nt]; }
  check('35. 資料：字串以外一字不差，改到的字串就是這 23 句（只拿掉外面那一對「」）；每個檔 [改了幾行, 幾個字串]：'+J(per),!bad.length&&J(per)===J(WANT)&&J(got.slice().sort())===J(OLD23.slice().sort()),sample(bad)||J(per));
  const LA=nonBlank(A_('src/legal3d.js')), LB=nonBlank(B_('src/legal3d.js')), rep=l=>LEGAL_REP.reduce((s,[o,n])=>s.split(o).join(n),l), diffAt=LA.map((l,i)=>l!==LB[i]?i:-1).filter(i=>i>=0);
  const used=LEGAL_REP.map(([o])=>LA.filter(l=>l.includes(o)).length);
  check('35. legal3d.js：註解以外，只有 LEGAL.ask 出題那 3 行不一樣，就是拿掉程式包的那 5 對「」（BASE 套上那 5 個替換＝現在，一字不差；每個替換在 BASE 剛好一處）',
    LA.length===LB.length&&diffAt.length===3&&J(LA.map(rep))===J(LB)&&used.every(n=>n===1),J([LA.length,LB.length,diffAt,used]));
  /* 2026-11-11：syllabus.js 重匯（大一上三科課堂內容補寫，AA d3a22505b、BB_332～334）、exam_bank.js 重匯（CRIM45_33 加 askedIn，AA 869834859）——這兩個檔不再要求和 BASE 整檔一樣（舊期望：三個檔都沒改）；
     改成：legal_qbank.js 整檔不變；exam_bank.js 在 BASE 就有的題，題目、選項、答案一字不差（D12：題庫不可改答案） */
  const frozen=['src/data/legal_qbank.js'];
  let fd=cp.execFileSync('git',['-C',ROOT,'diff','--name-only',BASE,'--',...frozen],{encoding:'utf8'}).trim();
  { const qs=src=>{ const m={}; for(const q of (new Function(src.replace(/^const EXAM_BANK\s*=/m,'return ')))().questions) m[q.id]=J([q.q,q.options,q.answer]); return m; };
    const a0=qs(gitShow(BASE,'src/data/exam_bank.js')), b0=qs(cur('src/data/exam_bank.js')); const ch=Object.keys(a0).filter(k=>a0[k]!==b0[k]); if(ch.length) fd=(fd?fd+' ':'')+'exam_bank 題目／選項／答案變了：'+ch.slice(0,5).join(','); }
  const md5=s=>crypto.createHash('md5').update(s).digest('hex');
  check('35. 題庫一字不差：legal_qbank.js（md5 和 '+BASE+' 一樣）；exam_bank.js 原有的題目、選項、答案都沒改（2026-11-11 起；syllabus.js 已重匯不再比）',!fd&&md5(cur('src/data/legal_qbank.js'))===md5(gitShow(BASE,'src/data/legal_qbank.js')),fd); }

/* ---------- 36. 讀書區：加（小聲）的時候先拿掉外面的「」——BASE 的字、現在的字加完一樣 ---------- */
{ const q=N.quiet||{}, lg=q.legal||[], ln=q.lines||[];
  const badL=lg.filter(([t,a,b])=>a!==b||!/^（小聲）/.test(b)).map(x=>x[0]), badS=ln.filter(([t,a,b])=>a!==b).map(x=>x[0]);
  const nF=QB.reduce((n,x)=>n+formsOf(x).length,0);
  check('36. LIBQ.quiet：84 題程式出題的每一種句子（是非 1 種、選擇 3 種，'+lg.length+' 句）BASE「…」和現在的加完一樣、都加了（小聲）（開頭就有「」的 Q004、Q030、Q058、Q059 也一樣）',QB.length===84&&lg.length===nF&&J(lg.map(x=>x[0]))===J([].concat(...QB.map(formsOf)))&&badL.length===0,sample(badL)+' '+lg.length+'/'+nF);
  check('36. LIBQ.quiet：23 句 BASE 的字和現在的字加完一樣',ln.length===23&&badS.length===0,sample(badS)); }

/* ---------- 37. 演出來：BASE 和現在各跑一次 ---------- */
const cmp=(A,B,asked)=>{ const r={bad:[],n23:0,nL:0,n8:0,tw:[]}; A=A||[]; B=B||[]; const forms=new Set(); for(const id of (asked||[])){ const q=QB.find(x=>x.id===id); if(q) formsOf(q).forEach(t=>forms.add(t)); }
  if(A.length!==B.length) r.bad.push('句數 '+A.length+' → '+B.length);
  else A.forEach((a,i)=>{ const b=B[i]; if(a[0]!==b[0]){ r.bad.push('說的人不一樣：'+J(a)+' → '+J(b)); return; } if(a[1]===b[1]) return; if(!b[0]){ r.bad.push('沒有名字的句子改了：'+J(a)+' → '+J(b)); return; }
    if(OLD23.includes(a[1])&&unq(a[1])===b[1]){ r.n23++; r.tw.push(a[1]); } else if(forms.has(b[1])&&a[1]==='「'+b[1]+'」') r.nL++; else if(B8.m.has(a[1])&&B8.m.get(a[1])===b[1]) r.n8++;   /* 第八批：表上的句子（只認 BASE 的表填完的那一句、照第八批的改法）*/ else r.bad.push(J(a)+' → '+J(b)); });
  return r; };
const PO=O.play||{}, PN=N.play||{};
{ const want={zhou_q88:[2,0],zhou_book:[2,0],zhou_plus:[1,0],xu_grad:[2,0],xu_book:[1,0],yc_back:[2,0],mx_water:[1,0],jp_1:[1,0],jp_2:[1,0],jp_3:[1,0],jp_4:[1,0],jp_5:[1,0]};
  const seen=new Set();
  for(const k of Object.keys(want)){ const r=cmp((PO[k]||{}).lines,(PN[k]||{}).lines,(PN[k]||{}).asked); r.tw.forEach(t=>seen.add(t));
    check('37. 演出來 '+k+'（'+(((PN[k]||{}).lines)||[]).length+' 句）：說的人和 BASE 一樣，'+want[k][0]+' 句只差外面那一對「」，其他一字不差',((PN[k]||{}).lines||[]).length>=want[k][0]&&r.bad.length===0&&r.n23===want[k][0]&&r.nL===want[k][1],sample(r.bad)+' '+J([r.n23,r.nL,(PN[k]||{}).lines])); }
  /* 有出題的事件：林教授下課後（同學情境）、刑訴課堂（課堂情境）、小考（小考情境）——23 句以外，程式包的「」也拿掉了（題目照 BASE 的題庫一字不差）*/
  for(const [k,n23] of [['lin_after',3],['crim_class',3],['crim_quiz',2]]){ const P=PN[k]||{}, r=cmp((PO[k]||{}).lines,P.lines,P.asked); r.tw.forEach(t=>seen.add(t));
    check('37. 演出來 '+k+'（'+((P.lines||[]).length)+' 句，問了 '+J(P.asked)+'）：說的人和 BASE 一樣，'+n23+' 句只差外面那一對「」、出題的 '+r.nL+' 句只差程式包的那一對（題目字一字不差），其他一字不差',
      (P.lines||[]).length>3&&(P.asked||[]).length>=1&&J(P.asked)===J((PO[k]||{}).asked)&&r.bad.length===0&&r.n23===n23,sample(r.bad)+' '+J(P.lines)); }
  const so=cmp((PO.steps_out||{}).lines,(PN.steps_out||{}).lines,[]); so.tw.forEach(t=>seen.add(t));
  check('37. 23 句一句一句演（讀書區外）：每一句都是有名字的人說的、說的人和 BASE 一樣、只差外面那一對「」',(PN.steps_out||{}).lines&&PN.steps_out.lines.length===23&&PN.steps_out.lines.every(x=>!!x[0])&&so.bad.length===0&&so.n23===23,sample(so.bad));
  check('37. 23 句每一句都演到了（完整事件或一句一句演）',OLD23.every(t=>seen.has(t)),sample(OLD23.filter(t=>!seen.has(t))));
  const sl=PN.steps_lib||{};
  check('37. 23 句在讀書區（總圖 3F）：和 BASE 一模一樣（（小聲）加上去的時候本來就拿掉外面的「」），都加了（小聲）',(sl.lines||[]).length===23&&J(sl.lines)===J((PO.steps_lib||{}).lines)&&sl.lines.every(x=>/小聲/.test(x[1])),J(sl.lines));
  /* LEGAL.ask：五種情境 × 三題 */
  const per={}, badL=[], lib=[];
  for(const ctx of CTXS) for(const qid of QIDS){ const k='legal_out_'+ctx+'_'+qid, P=PN[k]||{}, r=cmp((PO[k]||{}).lines,P.lines,P.asked); if(r.bad.length||J(P.asked)!==J([qid])) badL.push(k+'：'+sample(r.bad)+J(P.asked)); per[ctx+'_'+qid]=r.nL;
    const kl='legal_lib_'+ctx+'_'+qid, LN=(PN[kl]||{}).lines||[], LO=(PO[kl]||{}).lines||[], P8='（小聲）';   /* 第八批：補了「。」的那一句只差最後那一個（（小聲）後面的字＝BASE 的表填完拿掉外面那一對＋「。」）；其他一字不差 */
    if(!LN.length||LN.length!==LO.length||!LN.every((x,i)=>{ const o=LO[i]; return x[0]===o[0]&&(x[1]===o[1]||(x[1].startsWith(P8)&&o[1].startsWith(P8)&&B8.m.get('「'+o[1].slice(P8.length)+'」')===x[1].slice(P8.length))); })) lib.push(kl); }
  const tf=QB.find(q=>q.id==='Q001').type==='tf', W={}; for(const ctx of CTXS) for(const qid of QIDS){ const mc=QB.find(q=>q.id===qid).type==='mc'; W[ctx+'_'+qid]=ctx==='class'?(mc?2:1):(mc?1:0); }
  console.log('（37. 出題拿掉「」的句數 '+J(per)+'）');
  check('37. LEGAL.ask 五種情境（課堂、讀書會、同學、小考、研究室）× 是非題 Q001、選擇題 Q002、Q004：說的人和 BASE 一樣（出題的人有名字），只差程式包的那一對——課堂是非 1 句、課堂選擇 2 句（題目、選項）、其他情境選擇 1 句（選項）、其他是非 0 句',
    tf&&!badL.length&&J(per)===J(W),sample(badL)+' '+J(per));
  const c4=(PN.legal_out_class_Q004||{}).lines||[], q4=QB.find(q=>q.id==='Q004');
  check('37. 課堂選擇題 Q004：林教授說的就是題庫的 q.q 一字不差「'+q4.q+'」（裡面原本的「」照留），BASE 是「「…」」',c4.some(x=>x[0]&&x[1]===q4.q)&&((PO.legal_out_class_Q004||{}).lines||[]).some(x=>x[1]==='「'+q4.q+'」'),J(c4));
  check('37. LEGAL.ask 在讀書區：和 BASE 一模一樣（'+CTXS.length*QIDS.length+' 種）',lib.length===0,sample(lib)); }

/* ---------- 38. 存檔 ---------- */
{ const so=O.save||{}, sn=N.save||{}, ks=Object.keys(sn), bad=ks.filter(k=>!so[k]||so[k].md5!==sn[k].md5||sn[k].has.length||so[k].has.length);
  check('38. 每一段演完，存檔和 BASE 一模一樣（'+ks.length+' 種情境，md5 一樣），裡面沒有這 23 句（新、舊的字都沒有）＝不用換記號',ks.length>=40&&J(Object.keys(so).sort())===J(ks.slice().sort())&&bad.length===0,sample(bad.map(k=>k+J([so[k],sn[k]]))));
  const SM=noComments(cur('src/story3d.js'));
  check('38. 讀檔換記號（STORY.smallQuoteMigrate）不用改：story3d.js、game3d.js 這一批沒動',!CHANGED.includes('src/story3d.js')&&!CHANGED.includes('src/game3d.js')&&/S\.smallQuoteMigrate=function\(s\)\{/.test(SM)); }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}

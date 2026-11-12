// 有名字說的台詞拿掉「」第六批（最後一批；TEXT-QUOTE-UNIFY-1108，AA-B 2026-11-08 11:50）——不需要瀏覽器（D131）。第一、二批 tests/invites_quote_unit.js，第三批 _b3，第四批 _b4，第五批 _b5。
// 規則（同第五批）：在對話框「有名字」說出來的「（動作）「說的話」」→「（動作）說的話」（拿掉裡面那一對「」，動作照舊在前面），別的字一個都不改；
//   對話框沒有名字的（GM.say(null,…)、旁白、字幕沒名字）、選項、稿的紀錄照留。
// 這一批（第五批第 21 項列出來的那 25 個字串，AA-B 的單子；一句一句看說的人）：
//   有名字、改了（9 句）：
//     src/data/invites.js 沛珊第一次去法圖 firstAt 第二句「（走出法圖）館員人好好。我以為法圖的人都很兇。」（INV.meet → S.playLines(GM,who,…)）；
//     src/y2r2_3d.js 明軒「（跑過記分台）你翻慢一點，我緊張。」、src/data/bbpack_events.js Alison「（便利貼）四年了。」（事件 speaker＝人物 → events3d.js GM.say(who,…)）；
//     src/data/zrzq_events.js 子晴「（打字，念出來）在吃宵夜。第二份。」（['zq',…] → ZRZQ_TOLINES speaker heroine_04 → 事件）；
//     src/data/encounters.js 語彤「（她把鏡頭蓋遞給你）拿一下。」（ENC.meet 的 ESAY(GM,who,t)）；
//     src/legal3d.js 課堂旁邊同學小聲的四句（chorus：GM.say(cw,t)，cw＝那個同學的名字）
//   沒有名字、照留：src/crowd3d.js 大一女舍門口的四句（S.FDORM_LINES → S.giveLines → S.overhear 的字串＝{t}，GM.say(null,…)）；
//   播的時候拆開、照留：src/data/crowd_depts.js 路人五句（照稿連「」存；CROWD.deptSteps：（動作）＝旁白沒名字，說的話＝有名字、本來就不帶「」）；
//   選項照留：events.js 三個、r2y4a_events.js 三個、y2r2_3d.js 一個（choice 的 text）
//   雙引號的字串（第五批的掃描只看單引號）另外七種、十一個也看過：選項（ladder.js、date_lines.js 的 t）、稿的紀錄（invite_replies.js 的 say、library_3f_layout.js 的 what）、
//     沒有名字（shop_enc.js 三句：shopenc3d.js／wzshops3d.js 看開頭的（ ＝GM.say(null,…)；retake_home.js 一句：econff3d.js 看開頭的（ ＝speaker:null）——都照留
// 偵測器：src/invites3d.js S.narrLine 原本＝「（ 開頭、不是（…小聲…）後面還有字、不是（走出…）「」＝旁白；拿掉「」以後「（走出法圖）館員人好好……」會被當成旁白（沒有名字）。
//   改成整句是一對（…）才是旁白（同 pool3d.js S.narrWhole）：INVITE_DATA、INVITE_REPLIES（say、src 是紀錄不播）、改時間的回覆、ACC0、學姊婉拒、一起走路的那一則每一句分法都和原本一樣，
//   沒有「本來是旁白、）後面還有字」的句子（有的話要列出來給 AA-B，不改）。
//   src/libquiet3d.js：LIBQ.isOut／needsPrefix 看的是開頭「（走出」（沒有看「），拿掉「」以後照舊——只改註解；演出來和原本一樣（那句是她說的、不加（小聲）、之後到道別都不加）
// 說過了的記號（存檔）：這幾句都不當記號（firstAt 記 iv.faDone、事件記 id、偶遇記 encLog／memo、課堂記題號），不用換——第 32 項演完看存檔裡沒有這幾句
// 檢查（BASE＝cda383b07，第六批以前的開發分支 head）：
//   27. 分類：九句有名字的現在的字和說的路徑；剩下的（動作）「…」、「…」（動作）就是照留的那幾種（選項、沒名字、拆開播、紀錄），一個不多一個不少
//   28. 資料和 BASE 逐句比：INVITE_DATA、ENCOUNTERS、ZRZQ_LINES、STORY_EVENTS（全部載入以後）只改了這幾句，而且只差裡面那一對「」
//   29. 原始碼逐行比（第六批那一個 commit 本身，用 commit 標題找；commit 以前比 BASE 和現在的檔）：只動這 8 個 src 檔；資料字串以外一字不差；invites3d.js 只換 S.narrLine；libquiet3d.js 只改註解
//   30. 偵測器：S.narrLine 的每一句輸入（INVITE_DATA、INVITE_REPLIES 等）BASE／現在分法一樣；舊的 S.narrLine 拿到現在的字只有那一句不一樣（所以要一起改）；
//       LIBQ.isOut／needsPrefix 每一句都一樣；現在的 S.narrLine＝POOL.narrWhole
//   31. 演出來（另開 node，一次用 BASE 的檔、一次用現在的檔；index.html 全部載入）：沛珊第一次去法圖（讀書區，LIBQ）、那兩句在讀書區外、三場事件的那幾步、語彤的偶遇、課堂同學小聲、
//       大一女舍門口、路人分科系——說的人和 BASE 一樣、字只差這一批的那一對「」；在讀書區加（小聲）的方式一樣
//   32. 存檔：演完以後存檔裡沒有這幾句（不用換記號）
// 修改前（BASE 的 src 檔換回來跑）：見 commit 訊息。用法：node tests/invites_quote_b6_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..'), BASE='cda383b07', TITLE='有名字說的台詞拿掉外面的「」第六批';
/* 11-10 AA_731（企劃線 94ab0865e，BUG-INV-ACC-TIME-1110）：答應句不寫幾點、週末、早上——這十句和來源 commit（AA_415 c71772fbc、AA_721 b782e2c08）的改變不算「多改」 */
const A731=[["好。九點，不要遲到。", "好。不要遲到。"], ["早上？……十點以後可以。", "Daybreak？……好。我會起來。"], ["好。週末早上我剛好有空。", "好。那天我空下來。"], ["SUNNY SIDE。好。我九點到。", "SUNNY SIDE。好。我會準時到。"], ["SUNNY SIDE？我從木柵大學過來要四十分鐘。好，我十點到。", "SUNNY SIDE？我從木柵大學過來要四十分鐘。好，我早一點出門。"], ["十二點？好，那是我的早餐。", "早午餐？好，那是我的早餐。"], ["十二點 好 那是我的早餐", "早午餐 好 那是我的早餐"], ["好。我九點以前要回店裡。", "好。……我跟店裡說一聲。"], ["好。週末的話。", "好啊。我想找一張老唱片。"], ["蛋包飯？好。週末的話。", "蛋包飯？好。我坐捷運過去。"],
  /* 2026-11-11 改期望（X327 沛珊重寫，AA_755_peishan_feed_misc@c5094495d）：沛珊 invites.js 四處五句（firstAt.brunch 兩句、acc.brunch.A／R、acc.run_avenue）和 invite_replies.js 同句的 ps5、ps9 換了字——和 BASE 比的時候這五句照新稿算（逐字比對 tests/peishan_feed_misc_1111_unit.js） */
  ["她翻蛋的時候手腕都不動耶。我媽也是。", "你看她翻蛋，手腕都不動欸。"], ["我到現在還學不會。", "我在家試過一次，蛋飛到抽油煙機上，我媽到現在還會講。"], ["早餐店的女兒，去吃別人的早午餐。……好，我去研究。", "早午餐！好啊，那種不用太早起的我最可以。"], ["好。我想看他們的蛋怎麼翻。", "好啊。我想坐吧台，可以看他們做。"], ["好啊！早上我很習慣，在家的時候四點半就要起來幫忙開店。", "好啊！可是你要打給我，我鬧鐘要響三次才起得來。"]];
A731.push(...require('./peishan_rewrite_1111.js').PAIRS);   /* 2026-11-11（X327 沛珊重寫第四批以後：AA_759、AA_761、AA_762、AA_763；清單在 tests/peishan_rewrite_1111.js 的 PAIRS）：事件、零散檔案裡她的句子換了字，和 BASE 比的時候照新稿算 */
/* 2026-11-11（X324 D 區）：覆蓋層（白名單 overlay:true 的稿：AA_783 invites／invite_replies、AA_784 invites；tests/overlay_expect.js 讀，不手抄）換的字，和 BASE 比的時候照稿算。逐列對稿在 tests/invite_overlay_1111_unit.js */
A731.push(...['invites','invite_replies'].flatMap(f=>require('./overlay_expect.js').rows(f).map(r=>[r.old,r.new])));
/* 同一格先被前面的稿（AA_731、AA_772 fix）換過、再被覆蓋層換一次（例：子晴 daybreak「早上？……十點以後可以。」→ AA_731「Daybreak？……好。我會起來。」→ AA_784「Daybreak？好。我會起來。」）：OVS＝把覆蓋層的舊字整句換成新字，接在前面那一步後面 */
const OVR=['invites','invite_replies'].flatMap(f=>require('./overlay_expect.js').rows(f)).sort((x,y)=>y.old.length-x.old.length), OVS=t=>typeof t==='string'?OVR.reduce((x,r)=>x.split(r.old).join(r.new),t):t;
const aa731=(a,b)=>{ if(typeof a!=='string'||typeof b!=='string') return false; if(require('./kx_rewrite_1112.js').pair(a,b)) return true;   /* 2026-11-12（X324 可昕續改，AA_827_kx_triple_short_2.json@07d50af2f7：手寫檔七句 old→new，清單在 tests/kx_rewrite_1112.js、逐列對稿在 tests/kx_triple2_1112_unit.js）：invites.js 可昕羽球答應句、第一次到總圖那一句（在函式原始碼裡）、bbpack_events.js 一句照新稿算。舊期望：這三句和 BASE 一字不差 */ if(!A731._772){ A731._772=true; A731.push(...require('./l118_redo772_expect.js').rows); }   /* 2026-11-11：AA_772 的 fix 列（白名單上的版本）照新稿算 */ const s=t=>t.replace(/^「|」$/g,''); if(A731.some(([o,n])=>s(a)===o&&(s(b)===n||OVS(n)===s(b))||(a.includes(o)&&(a.split(o).join(n)===b||OVS(a.split(o).join(n))===b)))) return true; const r=t=>t.replace(/@(b782e2c08|c71772fbc)/g,'@94ab0865e'); return r(a)===b||(a==='c71772fbc'&&b==='94ab0865e'); };
const CHANGED=['src/data/invites.js','src/invites3d.js','src/libquiet3d.js','src/y2r2_3d.js','src/data/bbpack_events.js','src/data/zrzq_events.js','src/data/encounters.js','src/legal3d.js'];
const GONE_EV=['ev_kexin_tour_nccu','ev_kexin_yule_pass','ev_kexin_video_study','ev_kexin_birthday_y1','ev_kexin_our_day','ev_kexin_our_day_wk','ev_kexin_nye_missed_call','ev_kexin_anniv_missed_call','ev_kexin_reschedule','ev_kx_nye_video_y2','ev_kx_nye_video_y3','ev_kx_nye_video_y4','ev_kexin_kh_missed_call','ev_kexin_qixi_video','ev_kexin_30min','ev_kexin_lecture_ntu','ev_kexin_lecture_table','ev_kexin_juniors_video','ev_kexin_kn_call_y3','ev_kexin_last_study_night','ev_kexin_two_circles','ev_kexin_call_helper2','ev_kexin_k18_call','ev_kexin_k20_call','ev_kexin_juniors_dinner','ev_kexin_film_night','ev_kexin_quiz_y2_video','ev_econ_night_y2','ev_kexin_video_report'].concat(Array.from({length:9},(_,i)=>'ev_kx_drift_r'+['1','1b','2','3','4','5','5_call','6','7'][i]));   /* CANON-NO-ECON-1112 第三批拿掉的事件：BASE、現在兩邊都不比（這一項拿掉）*/
const gitShow=(r,f)=>cp.execFileSync('git',['-C',ROOT,'show',r+':'+f],{encoding:'utf8',maxBuffer:1<<28});
const cur=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
/* 同第五批的尺 */
const wrapped=t=>{ if(typeof t!=='string'||t.length<2||t[0]!=='「'||t[t.length-1]!=='」') return false; let d=0; for(let i=0;i<t.length;i++){ const c=t[i]; if(c==='「') d++; else if(c==='」'){ d--; if(d===0&&i!==t.length-1) return false; } } return d===0; };
const unq=t=>wrapped(t)?t.slice(1,-1):t;
const parEnd=t=>{ if(typeof t!=='string'||t[0]!=='（') return -1; let d=0; for(let i=0;i<t.length;i++){ const c=t[i]; if(c==='（') d++; else if(c==='）'){ d--; if(d===0) return i; } } return -1; };
const isNarr=t=>typeof t==='string'&&t.length>1&&parEnd(t)===t.length-1;
const actQ=t=>{ const k=parEnd(t); return k>=0&&k<t.length-1&&wrapped(t.slice(k+1)); };
const actUnq=t=>actQ(t)?t.slice(0,parEnd(t)+1)+unq(t.slice(parEnd(t)+1)):t;
const qEnd=t=>{ if(typeof t!=='string'||t[0]!=='「') return -1; let d=0; for(let i=0;i<t.length;i++){ const c=t[i]; if(c==='「') d++; else if(c==='」'){ d--; if(d===0) return i; } } return -1; };
const sayQ=t=>{ const k=qEnd(t); return k>0&&k<t.length-1&&isNarr(t.slice(k+1)); };
const quoted=t=>wrapped(t)||actQ(t)||sayQ(t);
const kindOf=(a,b)=>a===b?'same':(actQ(a)&&actUnq(a)===b?'act':null);
const noComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');
const blankComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,''));
const LIT=/'((?:[^'\\\n]|\\.)*)'/g, LIT2=/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g;
/* 這一批的九句：[檔, 舊的字（BASE）, 現在的字, 說的人] */
const NINE=[
  ['src/data/invites.js','（走出法圖）「館員人好好。我以為法圖的人都很兇。」','（走出法圖）館員人好好。我以為法圖的人都很兇。','沛珊'],
  ['src/y2r2_3d.js','（跑過記分台）「你翻慢一點，我緊張。」','（跑過記分台）你翻慢一點，我緊張。','明軒'],
  ['src/data/bbpack_events.js','（便利貼）「四年了。」','（便利貼）四年了。','Alison'],
  ['src/data/zrzq_events.js','（打字，念出來）「在吃宵夜。第二份。」','（打字，念出來）在吃宵夜。第二份。','子晴'],
  ['src/data/encounters.js','（她把鏡頭蓋遞給你）「拿一下。」','（她把鏡頭蓋遞給你）拿一下。','語彤'],
  ['src/legal3d.js','（小聲）「你剛剛怎麼知道的？」','（小聲）你剛剛怎麼知道的？','chorus'],
  ['src/legal3d.js','（小聲）「……好喔。」','（小聲）……好喔。','chorus'],
  ['src/legal3d.js','（小聲）「我也選那個。」','（小聲）我也選那個。','chorus'],
  ['src/legal3d.js','（小聲）「這題我上週錯過。」','（小聲）這題我上週錯過。','chorus'] ];
const SPEECH=NINE.map(x=>x[2].slice(parEnd(x[2])+1));   /* 說的話本身（存檔裡不該有）*/
/* 第七批（TEXT-QUOTE-UNIFY-1108，AA-B 11-08 12:29；tests/invites_quote_b7_unit.js）：STORY_EVENTS 有名字、整句「…」的 23 句拿掉外面那一對。第 28 項的 STORY_EVENTS 只有 CHANGED 那幾個檔換成 BASE 的版本
   （events.js、friends2_3d.js 不在裡面，兩邊都讀現在的檔），所以看得到的是 y2r2_3d.js、bbpack_events.js 這 6 句（BASE＝cda383b07 的字）；23 句全部在第七批的測試裡比 */
const SEVEN=['「……我的呢？」','「お疲れさまです。」','「ただいま。」','「別に。」','「よろしくお願いします。」','「まさか。」'];
const OUTL={old:NINE[0][1],now:NINE[0][2]};

if(process.env.QUOTE_B6_PROBE) (async()=>{
  /* ===================== 演出來（子程序）：QUOTE_B6_PROBE=old 讀 BASE 的 CHANGED，=new 讀現在的；index.html 的 src 全部載入（同第五批）===================== */
  const mode=process.env.QUOTE_B6_PROBE;
  if(mode==='old'){ const OLD={}; for(const f of CHANGED) OLD[path.join(ROOT,f)]=gitShow(BASE,f); const real=fs.readFileSync;
    fs.readFileSync=function(p){ if(typeof p==='string'){ const k=path.resolve(p); if(OLD[k]!=null) return OLD[k]; } return real.apply(fs,arguments); }; }
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
  if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};
  const say0=GM.say; GM.say=async(who,t,o)=>say0(who,typeof LIBQ!=='undefined'?LIBQ.whisper(GM,who,t):t,o);   /* game3d.js 的 say：讀書區加（小聲）*/
  const rec=()=>H.said.map(s=>[s.who,s.t]);
  const sec=async(k,f)=>{ seed(k.length*7919); try{ await f(); }catch(e){ out.errs.push(k+'：'+String(e&&e.stack||e).split('\n').slice(0,3).join(' / ').slice(0,400)); } };
  const P_=H.E.player, at=(zone,lv,x,z)=>{ H.G.zone=zone; P_.lv=lv|0; P_.obj.position.x=x||0; P_.obj.position.z=z||0; };
  const npc=id=>({id,charId:id,name:SOCIAL.displayName(id),obj:{position:{x:1,y:0,z:1},rotation:{y:0}},pose:'read',idlePose:'read'});
  const saveHas=()=>{ const j=JSON.stringify(H.G); return SPEECH.filter(s=>j.includes(s)); };
  out.save={};
  /* ---------- 30 偵測器的輸入：INVITE_DATA、INVITE_REPLIES（say、src 是表上原文的紀錄，不播）、改時間的回覆、ACC0、學姊婉拒、一起走路那一則（r3_3d.js 包的 INV.walkPick）---------- */
  { const inp=[], seen=new Set(); const LITX=/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
    const lits=fn=>{ const s=String(fn), o=[]; let m; LITX.lastIndex=0; while((m=LITX.exec(s))) o.push(m[1]!=null?m[1]:(m[2]!=null?m[2]:m[3])); return o; };
    const walk=(o,p,skip)=>{ if(o==null) return; if(typeof o==='string'){ inp.push([p,o]); return; } if(typeof o==='function'){ lits(o).forEach((t,i)=>inp.push([p+'()#'+i,t])); return; }
      if(typeof o!=='object'||seen.has(o)) return; seen.add(o); for(const k of Object.keys(o)){ if(skip&&skip(k)) continue; walk(o[k],p+'.'+k,skip); } };
    walk(INVITE_DATA,'INVITE_DATA');
    if(typeof INVITE_REPLIES!=='undefined') walk(INVITE_REPLIES,'INVITE_REPLIES',k=>k==='say'||k==='src');
    if(typeof AA614!=='undefined') walk(AA614.L&&AA614.L.inv,'AA614.L.inv');
    if(typeof OFFB!=='undefined') walk(OFFB.ACC0,'OFFB.ACC0'); if(typeof MOKS!=='undefined') walk(MOKS.ACC0,'MOKS.ACC0'); if(typeof GG2!=='undefined') walk(GG2.ACC0,'GG2.ACC0');
    if(typeof SISG!=='undefined'){ walk(SISG.DECLINE,'SISG.DECLINE'); walk(SISG.DECLINE_OFF,'SISG.DECLINE_OFF'); walk(SISG.STUDY_YES,'SISG.STUDY_YES'); }
    inp.push(...lits(INV.walkPick).map((t,i)=>['INV.walkPick()#'+i,t]));
    out.inputs=inp.map(([p,t])=>[p,t,!!INV.narrLine(t),!!LIBQ.isOut(t),!!LIBQ.needsPrefix(t),typeof POOL!=='undefined'&&POOL.narrWhole?!!POOL.narrWhole(t):null]);
    out.edge=[['（小聲）好。'],['（她笑了。）'],['（走出法圖）館員人好好。'],['（走出法圖）「後面。」'],['（走出法圖，她回頭看了一下門口。）'],['好。'],['「好。」'],['（她（小聲）說了什麼。）'],['（a）（b）'],['（沒有結尾'],[''],[null],[{me:'嗯。'}]].map(([t])=>[t,!!INV.narrLine(t)]); }
  /* ---------- 這一批九句在這個版本的字（從遊戲的資料拿）---------- */
  const findSteps=re=>{ const L=[]; for(const ev of (typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[])){ const seen=new Set(); (function w(a,p){ if(Array.isArray(a)) a.forEach((x,i)=>w(x,p+'['+i+']')); else if(a&&typeof a==='object'&&!seen.has(a)){ seen.add(a); if(typeof a.text==='string'&&re.test(a.text)) L.push({ev:ev.id,p,speaker:a.speaker,name:a.name,expression:a.expression,text:a.text,choice:false});
      if(Array.isArray(a.choice)) a.choice.forEach((c,i)=>{ if(c&&typeof c.text==='string'&&re.test(c.text)) L.push({ev:ev.id,p:p+'.choice['+i+']',text:c.text,choice:true}); }); for(const k of Object.keys(a)) if(k!=='text'&&k!=='choice') w(a[k],p+'.'+k); } })(ev.dialogue,''); } return L; };
  await sec('find',async()=>{ const PS=INVITE_DATA.lawlibLines.classmate_peishan.firstAt;
    const legalSrc=fs.readFileSync(path.join(ROOT,'src/legal3d.js'),'utf8'), m=/result==='ok'\?pick\((\[[^\]]*\])\):pick\((\[[^\]]*\])\)/.exec(legalSrc);
    out.st={mx:findSteps(/你翻慢一點，我緊張/),yu:findSteps(/四年了。/).filter(s=>/便利貼/.test(s.text)),zq:findSteps(/在吃宵夜。第二份/),opt:findSteps(/^（(替她答|繼續演品妤|再問一次|指著法律系館B|收下|裝不知道)）「|^「謝謝學姊。」（拿了書狀就走）$/)};
    out.nine=[PS[1],(out.st.mx[0]||{}).text,(out.st.yu[0]||{}).text,ZRZQ_LINES.UK[0][1][1],(ENCOUNTERS.rows.find(r=>r.who==='heroine_03'&&r.spot==='D12')||{lines:{friend:[]}}).lines.friend[0]].concat(m?vm.runInNewContext(m[1]).concat(vm.runInNewContext(m[2])):[]);
    out.uk=ZRZQ_LINES.UK[0]; out.ukSteps=ZRZQ_TOLINES(ZRZQ_LINES.UK[0]).map(l=>[l.speaker,l.name||null,l.text]);
    out.quiet=out.nine.map(t=>[t,!!LIBQ.needsPrefix(t),LIBQ.quiet(t)]); });
  /* ---------- 28 資料（全部載入以後）：INVITE_DATA、ENCOUNTERS、ZRZQ_LINES、STORY_EVENTS 的字串 ---------- */
  { const dump=(o,p,acc,seen)=>{ seen=seen||new Set(); if(o==null){ acc.push([p,String(o)]); return acc; } if(typeof o==='string'||typeof o==='number'||typeof o==='boolean'){ acc.push([p,typeof o==='string'?o:J0(o)]); return acc; }
      if(typeof o==='function'){ acc.push([p,'fn:'+String(o)]); return acc; } if(seen.has(o)){ acc.push([p,'(seen)']); return acc; } seen.add(o); for(const k of Object.keys(o)) dump(o[k],p+'.'+k,acc,seen); return acc; };
    const J0=x=>JSON.stringify(x);
    out.data={inv:dump(INVITE_DATA,'INVITE_DATA',[]),enc:dump(ENCOUNTERS,'ENCOUNTERS',[]),zrzq:dump(ZRZQ_LINES,'ZRZQ_LINES',[]),
      ev:dump((typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[]).filter(e=>!GONE_EV.includes(e.id)).map(e=>({id:e.id,dialogue:e.dialogue})),'STORY_EVENTS',[]).filter(x=>!/^fn:/.test(x[1]))}; }
  /* ---------- 31a 沛珊第一次去法圖（讀書區：INV.meet、LIBQ.scope；同 tests/libq_out_1102_unit.js 第 2 節）---------- */
  await sec('meet',async()=>{ const PS='classmate_peishan';
    H.fresh('2026-10-07',15,'lawlib'); H.FRIEND(PS); at('lawlib',1,0,0); LIBQ.reset(); if(typeof STUDYN!=='undefined') STUDYN.of(H.G,PS).last=H.G.day;
    const iv=INV.accept(H.G,PS,'lawlib',H.G.day,15); const n=npc(PS); H.said=[]; await INV.meet(GM,iv,n);
    out.meet=rec(); out.meetLoud=LIBQ.isLoud(); at('library',0,0,0); out.meetBal=LIBQ.quietNow(GM)===true; out.save.meet=saveHas();
    /* 同一個地方第二次（firstAt 不演）*/
    H.said=[]; H.G.hour=19; at('lawlib',1,0,0); const iv2=INV.accept(H.G,PS,'lawlib',H.G.day,19); await INV.meet(GM,iv2,n); out.meet2=rec(); out.save.meet2=saveHas();
    /* 讀書區外直接播 firstAt（INV.playLines）*/
    H.fresh('2026-10-07',15,'campus'); at('campus',0,0,0); LIBQ.reset(); H.said=[]; await INV.playLines(GM,{name:SOCIAL.displayName(PS),charId:PS},INVITE_DATA.lawlibLines.classmate_peishan.firstAt); out.fa=rec();
    /* 帶 scope：那一句起不加（小聲）（同 libq_out_1102 第 2 節的寫法，換成這一句）*/
    H.fresh('2026-10-07',15,'lawlib'); at('lawlib',1,0,0); LIBQ.reset(); const LQ=LIBQ.scope(); H.said=[]; const w={name:SOCIAL.displayName(PS),charId:PS};
    try{ await INV.playLines(GM,w,['前面。',INVITE_DATA.lawlibLines.classmate_peishan.firstAt[1],'再後面。'],undefined,LQ); await GM.say(w,'道別。'); } finally { LQ.end(); }
    out.scope=rec(); out.scopeBal=!LIBQ.isLoud(); });
  /* ---------- 31b 事件的那幾步（events3d.js runLines：speaker＝人物 → GM.say(who,…)）：讀書區外、讀書區（總圖 3F）各一次 ---------- */
  await sec('ev',async()=>{ out.ev={};
    for(const [k,zone] of [['out','campus'],['lib','library']]){ const L=[];
      for(const [nm,st] of [['mx',(out.st.mx||[])[0]],['yu',(out.st.yu||[])[0]]]){ if(!st) continue; H.fresh('2027-11-10',15,zone,{}); at(zone,0,0,0); LIBQ.reset(); H.said=[]; await EVENTS.runLines([{speaker:st.speaker,expression:st.expression,name:st.name,text:st.text}],{id:'__b6_'+nm}); L.push(...rec().map(x=>[nm].concat(x))); out.save['ev_'+nm+'_'+k]=saveHas(); }
      H.fresh('2027-11-10',23,zone,{}); at(zone,0,0,0); LIBQ.reset(); H.said=[]; await EVENTS.runLines(ZRZQ_TOLINES(ZRZQ_LINES.UK[0]),{id:'__b6_uk'}); L.push(...rec().map(x=>['uk'].concat(x))); out.save['ev_uk_'+k]=saveHas();
      out.ev[k]=L; } });
  /* ---------- 31c 語彤在大稻埕的偶遇（ENC.meet：朋友，打招呼）---------- */
  await sec('enc',async()=>{ const row=ENCOUNTERS.rows.find(r=>r.who==='heroine_03'&&r.spot==='D12'); H.fresh('2026-10-11',18,'campus'); H.FRIEND('heroine_03'); LIBQ.reset(); H.said=[]; H.picks=['打招呼'];
    out.encR=await ENC.meet(GM,row,{t:'friend',st:'FRIEND'}); out.enc=rec(); out.encName=SOCIAL.displayName('heroine_03'); out.save.enc=saveHas(); });
  /* ---------- 31d 課堂旁邊的同學小聲（LEGAL.ask 的 chorus）：答對、答錯各演到兩句 ---------- */
  await sec('legal',async()=>{ const CH='classmate_mingxuan', BY='heroine_01', q=QBANK.find(x=>x.type==='tf'); const L=[];
    const np0=EVENTS.npcOf; EVENTS.npcOf=id=>(id===CH||id===BY)?{obj:mkObj()}:np0(id);
    try{ for(const want of ['ok','bad']) for(let s=1;s<=40;s++){ H.fresh('2025-10-01',10,'campus'); at('campus',0,0,0); LIBQ.reset(); LEGAL.bind(H.G,GM); seed(s*97+(want==='ok'?1:2)); H.said=[];
        const right=q.answer==='對'?'「對。」':'「不對。」', wrong=q.answer==='對'?'「不對。」':'「對。」'; H.picks=[want==='ok'?right:wrong];
        await LEGAL.ask({context:'classmate',by:BY,qid:q.id,chorus:CH,quiet:true}); const r=rec(); L.push([want,s].concat(r[r.length-1]||[null,null])); out.save['legal_'+want]=saveHas(); } }
    finally { EVENTS.npcOf=np0; }
    out.legal=L; out.legalName=SOCIAL.displayName(CH); });
  /* ---------- 31e 大一女舍門口（CROWD.giveLines → S.overhear）、路人分科系（CROWD.deptSteps）---------- */
  await sec('crowd',async()=>{ const L=[]; for(const k of Object.keys(CROWD.FDORM_LINES)) for(const t of CROWD.FDORM_LINES[k]){ H.fresh('2026-09-08',20,'campus'); H.said=[]; const n={obj:mkObj()};
      const got=CROWD.giveLines(GM,{lines:()=>[t],talkLabel:'聽一句'},{key:'x'},[n]); if(got.length&&n.talk) await n.talk(); L.push(...rec().map(x=>[k,t].concat(x))); }
    out.fdorm=L;
    const D=[]; for(const g of (CROWD_DEPTS.DEPTS||[])) for(const col of Object.keys(g.L||{})) for(const raw of (g.L[col]||[])) if(typeof raw==='string'&&actQ(raw)) D.push([g.id,raw,CROWD.deptSteps(raw,g.id+'系的學生')]);
    out.dept=D; });
  process.stdout.write('@@B6@@'+JSON.stringify(out)+'\n',()=>process.exit(0));
})().catch(e=>{ process.stdout.write('@@B6@@'+JSON.stringify({errs:['例外：'+String(e&&e.stack||e).slice(0,600)]})+'\n',()=>process.exit(0)); });
else main();

/* ===================== 主程式 ===================== */
function main(){
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, sample=L=>L.slice(0,6).join('／')+(L.length>6?'…（共 '+L.length+'）':'');
const lits=(s,re)=>{ const t=noComments(s), o=[]; let m; re=re||LIT; re.lastIndex=0; while((m=re.exec(t))) o.push(m[1]!=null?m[1]:m[2]); return o; };
const runProbe=m=>{ let o=''; try{ o=cp.execFileSync(process.execPath,[__filename],{env:Object.assign({},process.env,{QUOTE_B6_PROBE:m}),encoding:'utf8',maxBuffer:1<<29,stdio:['pipe','pipe','pipe']}); }catch(e){ o=String(e.stdout||''); }
  const line=o.split('\n').find(l=>l.startsWith('@@B6@@')); return line?JSON.parse(line.slice(6)):{errs:['子程序沒有結果：'+o.slice(-300)]}; };
const O=runProbe('old'), N=runProbe('new');

/* ---------- 27. 分類 ---------- */
{ const nine=N.nine||[], nineO=O.nine||[];
  check('27. 九句在遊戲的資料裡：現在的字＝（動作）說的話（'+NINE.map(x=>x[2]).join('／')+'）；BASE＝（動作）「說的話」',J(nine)===J(NINE.map(x=>x[2]))&&J(nineO)===J(NINE.map(x=>x[1]))&&NINE.every(x=>actQ(x[1])&&actUnq(x[1])===x[2]&&!quoted(x[2])),J([nineO,nine]));
  for(const [f,a,b] of NINE){ const L=lits(cur(f)), LO=lits(gitShow(BASE,f)); if(f==='src/legal3d.js'&&a!==NINE[5][1]) continue;
    const ok=f==='src/legal3d.js'?NINE.slice(5).every(x=>L.filter(t=>t===x[2]).length===1&&!L.includes(x[1])&&LO.filter(t=>t===x[1]).length===1):(L.filter(t=>t===b).length===1&&!L.includes(a)&&LO.filter(t=>t===a).length===1);
    check('27. '+f+'：'+(f==='src/legal3d.js'?'四句':'「'+b+'」')+'在原始碼只有一個、舊的字沒有了',ok); }
  const st=N.st||{}, mx=st.mx||[], yu=st.yu||[];
  check('27. y2r2_3d.js 明軒那一步：事件的 speaker＝classmate_mingxuan（有名字）、一個事件一步',mx.length===1&&mx[0].speaker==='classmate_mingxuan'&&!mx[0].choice&&mx[0].text===NINE[1][2],J(mx));
  check('27. bbpack_events.js Alison 那一步：事件的 speaker＝yu（Alison，有名字）、一步',yu.length===1&&yu[0].speaker==='yu'&&!yu[0].choice&&yu[0].text===NINE[2][2],J(yu));
  const zq=st.zq||[];
  check('27. zrzq_events.js 英國遠距第一則：[\'zq\',…]（子晴）→ ZRZQ_TOLINES speaker heroine_04、沒有另外的名字（手機、明信片）；推進 STORY_EVENTS 的預設版也是 heroine_04 說的（一步）',J(N.uk&&N.uk[1])===J(['zq',NINE[3][2]])&&J((N.ukSteps||[])[1])===J(['heroine_04',null,NINE[3][2]])&&zq.length===1&&zq[0].speaker==='heroine_04'&&!zq[0].name&&!zq[0].choice,J([N.ukSteps,zq]));
  /* 剩下的（動作）「…」、「…」（動作）：單引號（第五批第 21 項的掃描）＋雙引號，一個一個對到照留的理由 */
  const KEEP={
    'src/crowd3d.js':['nameless',['（一個女生拖著兩個行李箱，在門口打電話）「媽，我到了。……沒有電梯啦，我爬上來的。五樓。」','（提著兩袋宵夜的人）「鹹酥雞到了，誰下來拿？」','（在門口講電話）「沒有啦，我只是想打給你。」','（抱著一疊書的人）「總圖還有位子嗎？……那我去社科圖。」']],
    'src/data/crowd_depts.js':['split',['（他邊走邊講電話）「板子放在你桌上了。……那顆電容是新的，這次不要再燒掉。」','（他盯著手機）「又錯一筆測資。……到底是哪一筆。」','（她講電話）「阿嬤那邊我禮拜四再去一次。她上次說要教我摺紙鶴。」','（她在柱子上貼傳單：「徵求受試者，心理系實驗」。）「……膠帶又用完了。」','（他對著一棵樹念台詞）「……你為什麼不早說？——不對，這一句要更小聲。」']],
    // CANON-NO-ECON-1112：經濟系那一年拿掉（照留清單裡經濟系那一年的兩句拿掉（events.js 選項一句、retake_home.js 一句），econff3d.js 的那一格跟著拿掉）
    'src/data/events.js':['choice',['「謝謝學姊。」（拿了書狀就走）','（替她答）「她想知道法律外面還有什麼。」']],
    'src/data/r2y4a_events.js':['choice',['（再問一次）「妳還好嗎？」','（指著法律系館B）「先記得這棟就好。」','（收下）「謝謝阿嬤。」']],
    'src/y2r2_3d.js':['choice',['（裝不知道）「恭喜！」']] };
  const KEEP2={
    'src/data/ladder.js':['choice',['（喝掉，說）「我也太兇了。」']],'src/data/date_lines.js':['choice',['「一起拍？」（第 6 階以上）']],
    /* 2026-11-11（L118-LUNCH-INVITE-1111／L118-SHOPS-REDO-1111；AA_771 最終版 @1669b3ae0）：午餐邀約多一個選項 options.skip「好，走。」（直接到吃完）——選項字（GM.choose 的 t），照既有選項的慣例留「」（同一個檔的 accept、decline 也是帶「」的選項）；舊期望：沒有這一格 */
    'src/data/l118_lunch.js':['choice',['「好，走。」（直接到吃完）']],
    /* 2026-11-11（X324 A 區，AA_708@d30416e6b）：一起活動 98 場都補了兩個選項；其中 13 個選項字是「（小聲）「…」」這種動作＋說的話（電影院裡小聲講；祐廷的選項，選項照留那一類，都在 opts 的 t，不是誰說的台詞）；舊期望：沒有這一格 */
    'src/data/activity_scenes.js':['choice',['「謝謝。」（吃大的）','（小聲）「對，他前面說沒看到。」','（小聲）「先看，散場再講。」','（小聲）「我沒聽到。」','（小聲）「妳在看哪裡？」','（小聲）「像蘇姨。」','（小聲）「什麼是粒子系統？」','（小聲）「看電影。」','（小聲）「好看嗎？」','（小聲）「像妳。」','（小聲）「片尾不算。」','（小聲）「來得及。」','（小聲）「要不要假裝哭一下？」']],
    'src/data/invite_replies.js':['record',['「好。」（她把吧檯又擦了一遍，才回你。）','「嗯。」（她只回一個字，可是三秒就回了。）','「好。我會去。」（她回得很快，然後很久沒有下一則。）']],
    'src/data/library_3f_layout.js':['record',['「看桌上的紙條」（守誠那張桌子；pool_more3d.js 的 POP）','「看期刊架」（語彤的系刊；r2y4a3d.js 的 shelfPlace）']],
    'src/data/shop_enc.js':['nameless',['（她翻了十分鐘，把書遞給你。）「第三章的筆記最好看。」','（她把手機遞過來。）「加一下吧。看到好書跟你說。」','（他把印好的講義對齊，用長尾夾夾好。）「拿去。考好一點。」']],
    // CANON-NO-ECON-1112：經濟系那一年拿掉（retake_home.js 那一句沒名字的）
    /* 2026-11-10 改期望：AA_745 電影散場的選項字（祐廷的選項，動作＋說的話；選項照留那一類）三個 */
    'src/data/movie_plots.js':['choice',['（回一則語音）「第三天。來不及的話，哪一塊可以先砍？」','（小聲）「也幫我印一張。」','（小聲）「妳真的去了喔。」']],
    /* 2026-11-11（AA_811@fb1256280，DLG-FULL-REVIEW-1110）：子晴語音第九則的回覆選項（祐廷的選項，動作＋說的話；選項照留那一類）；舊期望：沒有這一格 */
    'src/data/aa811_lines.js':['choice',['（回語音）「恭喜。開門那個聲音我聽到了。」']],
    /* 2026-11-10 改期望（TERMEND-OPTS-1110）：AA_748／AA_749 期末飯的選項字（祐廷的選項，動作＋說的話；選項照留那一類）三個 */
    'src/data/termend_opts.js':['choice',['（兩手捧著杯子。）「謝謝。」','（從頭看到尾。）「沒有傘。」','（把自己的手機遞過去。）「我的也是。」',
      /* 2026-11-10 改期望：朋友版七學期（AA_749 @5ffd725b8）多兩個選項字，同一類 */
      '（指了最近的一顆。）「這個一天就可以來回。」','（聽完。）「第二句很好。最後一句太長。」',
      /* 2026-11-11 改期望（SHE-FIRST-1110，AA_751@33a1769f8）：沛珊告白三個回應的第二個（祐廷的選項，動作＋說的話；選項照留那一類）一個 */
      '（把她拉回來，牽住她的手。）「妳倒著走會撞到人。」']] };
  const scan=re=>{ const o=[]; (function walk(d){ for(const f of fs.readdirSync(path.join(ROOT,d)).sort()){ const p=d+'/'+f; if(fs.statSync(path.join(ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)) for(const t of lits(cur(p),re)) if(actQ(t)||sayQ(t)) o.push(p+'：'+t); } })('src'); return o.sort(); };
  const flat=K=>{ const o=[]; for(const f of Object.keys(K)) for(const t of K[f][1]) o.push(f+'：'+t); return o.sort(); };
  const s1=scan(LIT), want1=flat(KEEP);
  check('27. 單引號的字串（第五批第 21 項那一套掃描）：剩下 '+s1.length+' 個＝照留的 '+want1.length+' 個（路人沒名字 4、分科系拆開播 5、選項 7），一個不多一個不少',J(s1)===J(want1),sample(s1.filter(x=>!want1.includes(x)).concat(want1.filter(x=>!s1.includes(x)).map(x=>'少了 '+x))));
  const s2=scan(LIT2), want2=flat(Object.assign({},KEEP,KEEP2));
  check('27. 單、雙引號一起掃：剩下 '+s2.length+' 個＝照留的 '+want2.length+' 個（再加：選項 2＋午餐邀約選項 1＋一起活動選項 13＋電影選項 3＋子晴語音選項 1＋期末飯選項 6、稿的紀錄 5、沒名字 4）',J(s2)===J(want2),sample(s2.filter(x=>!want2.includes(x)).concat(want2.filter(x=>!s2.includes(x)).map(x=>'少了 '+x))));
  /* 照留的理由：選項＝choice 的 text；沒名字＝播的程式看開頭的（給 null；拆開播＝deptSteps；紀錄＝不播的欄位 */
  const opt=st.opt||[];
  check('27. 選項（events.js 三個、r2y4a_events.js 三個、y2r2_3d.js 一個）都是事件 choice 的 text（GM.choose，不是誰說的）',KEEP['src/data/events.js'][1].concat(KEEP['src/data/r2y4a_events.js'][1],KEEP['src/y2r2_3d.js'][1]).every(t=>opt.some(s=>s.text===t&&s.choice)&&!opt.some(s=>s.text===t&&!s.choice)),J(opt.map(s=>[s.ev,s.choice,s.text])));
  const LD=cur('src/data/ladder.js'), DL=cur('src/data/date_lines.js'), IR=cur('src/data/invite_replies.js'), L3=cur('src/data/library_3f_layout.js');
  check('27. 雙引號的選項、紀錄：ladder.js、date_lines.js 是 choices 的 "t"；invite_replies.js 是 "say"（表上原文，播的是 lines）；library_3f_layout.js 是 "what"（說明）',
    LD.includes('{"t": "（喝掉，說）「我也太兇了。」"')&&DL.includes('{"t": "「一起拍？」（第 6 階以上）"')&&KEEP2['src/data/invite_replies.js'][1].every(t=>IR.includes('"say":"'+t+'"'))&&KEEP2['src/data/library_3f_layout.js'][1].every(t=>L3.includes('"what": "'+t+'"')));
  const SE=noComments(cur('src/shopenc3d.js')), WZ=noComments(cur('src/wzshops3d.js')), CR=noComments(cur('src/crowd3d.js'));
  check('27. 沒名字的：shop_enc.js 三句（shopenc3d.js 知寧選項的回覆、加聯絡人那句、wzshops3d.js 阿德）、retake_home.js 一句（econff3d.js）播的時候看開頭的（ ＝沒有名字；大一女舍門口（crowd3d.js S.overhear）字串＝沒有名字',
    /for\(const t of L\) await GM\.say\(\/\^（\/\.test\(t\)\?null:she,t\);/.test(SE)&&/await GM\.say\(\/\^（\/\.test\(P\.contact\.line\)\?null:zn,P\.contact\.line\);/.test(SE)&&/for\(const t of q\.lines\) await GM\.say\(\/\^（\/\.test\(t\)\?null:\{name:q\.name\},t\);/.test(WZ)
    &&/S\.overhear=async function\(GM,n,script\)\{[^\n]*map\(x=>typeof x==='string'\?\{t:x\}:x\)/.test(CR)&&/GM\.say\(x\.who\?\{name:x\.who,obj:n&&n\.obj\}:null,x\.t\)/.test(CR));
  const fd=N.fdorm||[];
  check('27. 演出來：大一女舍門口（CROWD.giveLines → 點了聽一句；（動作）「…」四句＋整句「…」一句）都是沒名字的對話框、字照留、和 BASE 一樣',fd.length===5&&fd.filter(r=>actQ(r[1])).length===4&&fd.every(r=>r[2]===null&&r[3]===r[1])&&J(fd)===J(O.fdorm),J(fd));
  const dp=N.dept||[];
  check('27. 演出來：路人分科系五句（CROWD.deptSteps）＝（動作）沒名字＋說的話有名字、本來就不帶「」；和 BASE 一樣',dp.length===5&&dp.every(([id,raw,s])=>s.length===2&&s[0].who===null&&s[0].t===raw.slice(0,parEnd(raw)+1)&&s[1].who===id+'系的學生'&&s[1].t===unq(raw.slice(parEnd(raw)+1))&&!/^「|」$/.test(s[1].t))&&J(dp)===J(O.dept),J(dp.map(x=>x[2]))); }

/* ---------- 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版；AA_772、AA_721 @白名單）第 28 項 INVITE_DATA、第 30 項：比法改寫 ----------
   舊期望：INVITE_DATA（和 S.narrLine 的輸入）照陣列位置和 BASE 逐值比，個數一樣、只差那一句。
   改版以後邀約地點有增有改（多 l118_cafe2、l118_drink_a、l118_drink_b；l118_tea 改吃飯類；慢讀搬到木曜日；mokuyobi 少 verbStudy），位置全部錯開——
   新期望（不是只比個數，也不是略過）：兩邊的地點改用地點 id 當路徑；BASE 的字先照白名單上的 AA_772 換（fix 列）；剩下不一樣的每一格都要對得到 AA_772／AA_721 明寫的差異：
     E1 新地點（只有現在有）：剛好是 AA_772 invite_places 裡 BASE 沒有的那幾個 id；店名、動詞逐值＝AA_772；它們的答應句、第一次那一句逐值＝AA_721（INVITE_PLACE_LINES，匯入工具 --check 對稿）
     E2 118 巷原有地點：店名、動詞＝AA_772 invite_places；營業時間那幾格（windows、off、days）＝店家資料；l118_tea 改吃飯類＝其他欄位和另一間吃飯的店（l118_dian）一樣
     E3 slowread：zone、name、verb、hours、timesBy、cats、show＝AA_772 slowread_to_mokuyobi.place 寫的值（show 和 mokuyobi 那個地點同一個條件）
     E4 mokuyobi：verbStudy 拿掉、cats 只剩 sit（AA_772 明寫）
     E5 118 巷地點的答應句、第一次那一句、不去的那一句（AA_721 整份重寫）＝INVITE_PLACE_LINES 現在的值
     E6 子晴 first 第三句（AA_772 第 68 列，照路徑）；沛珊改約的時間 10→19（AA_772 rules；函式原始碼）
   其他任何不一樣＝FAIL，逐格列出來 */
const R772=require('./l118_redo772_expect.js');
const PL772=(()=>{ try{ const t=cur('src/data/invite_place_lines.js'); return JSON.parse(t.slice(t.indexOf('{',t.indexOf('const INVITE_PLACE_LINES=')),t.lastIndexOf('}')+1)); }catch(e){ return {places:{}}; } })();
const SH772=(()=>{ try{ const t=cur('src/data/lane118_shops.js'); return JSON.parse(t.slice(t.indexOf('{',t.indexOf('const LANE118_SHOPS=')),t.lastIndexOf('}')+1)); }catch(e){ return {shops:[]}; } })();
const rekey772=list=>{ const ids={}; for(const e of list){ const m=/^INVITE_DATA\.places\.(\d+)\.id$/.exec(e[0]); if(m) ids[m[1]]=e[1]; } return list.map(e=>{ const m=/^INVITE_DATA\.places\.(\d+)(.*)$/.exec(e[0]); return m&&ids[m[1]]!=null&&(m[2]===''||/^[.(]/.test(m[2]))?['INVITE_DATA.places['+ids[m[1]]+']'+m[2]].concat(e.slice(1)):e; }); };
const strip772=v=>typeof v==='string'?v.replace(/\/\*[\s\S]*?\*\//g,'').replace(/[ \t]+/g,' ').trim():v;
/* 回傳 {bad:[說明], pairs:[[a 的那一筆, b 的那一筆]]（兩邊都有的路徑）, onlyB:[…]}；same(a,b,path)＝呼叫的地方原本的判斷（那一句、aa731…）*/
function cmp772(A0,B0,same){ const A=rekey772(A0), B=rekey772(B0), mA=new Map(), mB=new Map(), bad=[], pairs=[]; for(const e of A){ if(mA.has(e[0])) bad.push('BASE 路徑重複：'+e[0]); mA.set(e[0],e); } for(const e of B){ if(mB.has(e[0])) bad.push('現在路徑重複：'+e[0]); mB.set(e[0],e); }
  const ip=R772.d.invite_places, IPN={}; for(const [k,n,v] of ip.meal.concat(ip.walk)) IPN['l118_'+k]={name:n,verb:v,walk:ip.walk.some(x=>x[0]===k),k};
  const idsA=new Set(A.filter(e=>/^INVITE_DATA\.places\[[^\]]+\]\.id$/.test(e[0])).map(e=>e[1])), idsB=new Set(B.filter(e=>/^INVITE_DATA\.places\[[^\]]+\]\.id$/.test(e[0])).map(e=>e[1]));
  const NEW=[...idsB].filter(x=>!idsA.has(x)), GONE=[...idsA].filter(x=>!idsB.has(x)), wantNew=Object.keys(IPN).filter(x=>!idsA.has(x));
  if(JSON.stringify(NEW.slice().sort())!==JSON.stringify(wantNew.slice().sort())) bad.push('E1 新地點要剛好是 AA_772 invite_places 多的那幾個：'+JSON.stringify([NEW,wantNew])); if(GONE.length) bad.push('地點不見了：'+GONE.join('、'));
  const valB=p=>{ const e=mB.get(p); return e?e[1]:undefined; }, placeOf=p=>{ const m=/^INVITE_DATA\.places\[([^\]]+)\](.*)$/.exec(p); return m?[m[1],m[2]]:null; };
  const hoursOk=(id,suf,v)=>{ const sh=SH772.shops.find(q=>'l118_'+q.id===id); if(!sh) return false; const c=sh.hours.closed||[]; const exp={}; sh.hours.open.forEach((w,i)=>{ exp['.windows.'+i+'.0']=String(w[0]); exp['.windows.'+i+'.1']=String(w[1]); }); c.forEach((d,i)=>{ exp['.off.'+i]=String(d); }); [0,1,2,3,4,5,6].filter(d=>!c.includes(d)).forEach((d,i)=>{ exp['.days.'+i]=String(d); }); if(exp[suf]===String(v)) return true;
    /* 這支測試的環境沒有載入店家資料時，invites.js 用它自己的預設時段（11～14、17～20、沒有公休）*/ const fb={'.windows.0.0':'11','.windows.0.1':'14','.windows.1.0':'17','.windows.1.1':'20'}; [0,1,2,3,4,5,6].forEach((d,i)=>{ fb['.days.'+i]=String(d); }); return fb[suf]===String(v); };
  const sm=R772.d.slowread_to_mokuyobi.place, SR={'.zone':'wz_mokuyobi','.name':'木曜日','.verb':'去木曜日念書','.hours.0':'13','.hours.1':'22','.timesBy.wk.0':'15.5','.timesBy.wk.1':'19','.timesBy.we.0':'14','.timesBy.we.1':'15.5','.timesBy.we.2':'19','.timesBy.we.3':undefined,'.cats.0':'study'};
  if(!(/wz_mokuyobi/.test(sm)&&/「木曜日」/.test(sm)&&/「去木曜日念書」/.test(sm)&&/\[13,22\]/.test(sm)&&/平日 15:30、19:00/.test(sm)&&/週末 14:00、15:30、19:00/.test(sm)&&/verbStudy 拿掉/.test(sm))) bad.push('E3／E4：AA_772 slowread_to_mokuyobi.place 的字和這支測試認得的不一樣（稿改了，這裡要跟著看）');
  const plLine=(pid,p)=>{ const m=/^INVITE_DATA\.people\.([^.]+)\.(acc|firstAt)\.(l118_[a-z0-9_]+)(?:\.([A-Z]))?\.(\d+)$/.exec(p)||null; return m; };
  const explained=(p,a,b)=>{ const q=placeOf(p);
    if(q){ const [id,suf]=q; if(NEW.includes(id)){ if(suf==='.name') return b===IPN[id].name; if(suf==='.verb') return b===IPN[id].verb; if(/^\.(windows|off|days)\./.test(suf)) return hoursOk(id,suf,b); return true; }   /* 新地點的其他欄位：下面 E1 另外逐值驗 */
      if(IPN[id]){ if(suf==='.name') return b===IPN[id].name; if(suf==='.verb') return b===IPN[id].verb; if(/^\.(windows|off|days)\./.test(suf)) return b===undefined?true:hoursOk(id,suf,b);
        if(id==='l118_tea'&&!IPN[id].walk){ const d=valB('INVITE_DATA.places[l118_dian]'+suf); return b===d||(typeof b==='string'&&typeof d==='string'&&b.split('l118_tea').join('l118_dian')===d)||(a!==undefined&&b===undefined&&d===undefined); } }
      if(id==='slowread'){ if(suf in SR) return b===SR[suf]; if(suf==='.cats.1') return b===undefined; if(suf==='.show') return strip772(b)===strip772(valB('INVITE_DATA.places[mokuyobi].show')); if(/^\.show\(\)#\d+$/.test(suf)) return b===undefined;   /* 原本 show 裡的字（'law'）跟著條件換掉沒有了 */ }
      if(id==='mokuyobi'){ if(suf==='.verbStudy') return b===undefined; if(suf==='.cats.1') return b===undefined; if(suf==='.cats.0') return b==='sit'; if(suf===''||/^\.\w+$/.test(suf)) return strip772(a)===strip772(b); } }
    /* E5：118 巷地點的答應句、第一次那一句、不去的那一句＝AA_721 現在的值 */
    let m=/^INVITE_DATA\.people\.([^.]+)\.(acc|firstAt)\.(l118_[a-z0-9_]+)((?:\.[A-Za-z0-9]+)*)$/.exec(p);
    if(m){ if(b===undefined) return !!IPN[m[3]]||true; const src=((PL772.places[m[3]]||{})[m[1]]||{})[m[2]]; const flat=[]; (function w(x){ if(typeof x==='string') flat.push(x.replace(/^「|」$/g,'')); else if(x&&typeof x==='object') Object.values(x).forEach(w); })(src); return flat.includes(String(b).replace(/^「|」$/g,'')); }
    m=/^INVITE_DATA\.places\[(l118_[a-z0-9_]+)\]\.noWho\.([^.]+)$/.exec(p); if(m){ if(b===undefined) return true; return (((PL772.places[m[1]]||{})[m[2]]||{}).no||'').replace(/^「|」$/g,'')===String(b).replace(/^「|」$/g,''); }
    m=/^INVITE_DATA\.seatOpen\.byPlace\.(l118_[a-z0-9_]+)$/.exec(p); if(m) return a===undefined&&b==='meal'&&!!IPN[m[1]]&&!IPN[m[1]].walk;
    /* E6 */
    if(/^INVITE_DATA\.people\.heroine_04\.first\.slowread\.2$/.test(p)||/^INVITE_DATA\.slowreadLines\.heroine_04\.first\.2$/.test(p)) { const n3=(R772.d.fix.find(r=>/第三句：/.test(r.old))||{}).new; return b===n3||b===OVS(n3); }   /* 2026-11-11：X324 覆蓋層（AA_784）再拿掉刪節號（OVS）*/
    if(typeof a==='string'&&typeof b==='string'){ const na=R772.fix(strip772(a)), nb=strip772(b); if(na===nb||OVS(na)===nb) return true;   /* 2026-11-11：AA_772 換過以後再被 X324 覆蓋層換一次（OVS）*/
      if(/classmate_peishan/.test(p)&&na.split(",10)) alt={day:d,h:10};").join(",19)) alt={day:d,h:19};")===nb) return true; }
    return false; };
  for(const [p,ea] of mA){ const eb=mB.get(p); if(!eb){ if(!explained(p,ea[1],undefined)) bad.push('現在沒有了：'+p+'：'+String(ea[1]).slice(0,80)); continue; } if(ea[1]===eb[1]||same(ea,eb,p)){ pairs.push([ea,eb]); continue; } if(explained(p,ea[1],eb[1])){ pairs.push([ea,eb,true]); continue; } bad.push('不一樣：'+p+'：'+String(ea[1]).slice(0,80)+' → '+String(eb[1]).slice(0,80)); }
  const onlyB=[]; for(const [p,eb] of mB){ if(mA.has(p)) continue; onlyB.push(eb); if(!explained(p,undefined,eb[1])) bad.push('多出來：'+p+'：'+String(eb[1]).slice(0,80)); }
  /* E1 新地點逐值：id、區域、類別和 AA_772 changes 寫的一樣（吃飯類照另一間吃飯的店；外帶飲料店＝散步類、朋友以上、半小時、14／16／19.5、區域 lane118）*/
  if(valB('INVITE_DATA.places[l118_dian].stay')!==undefined) for(const id of NEW){ const g=suf=>valB('INVITE_DATA.places['+id+']'+suf),   /* 只有整份資料的傾印有數字欄位（S.narrLine 的輸入只有字串，不在這裡驗）*/ d=suf=>valB('INVITE_DATA.places[l118_dian]'+suf), I=IPN[id]||{};
    const ok=I.walk?(g('.kind')==='walk'&&g('.minStage')==='FRIEND'&&g('.stay')==='0.5'&&g('.memory')==='WALKED_TOGETHER'&&g('.cats.0')==='walk'&&g('.cats.1')===undefined&&JSON.stringify([g('.times.0'),g('.times.1'),g('.times.2')])===JSON.stringify(['14','16','19.5'])&&g('.zone')==='lane118')
      :(['.kind','.minStage','.stay','.memory','.sitAct','.seatPose','.cats.0','.cats.1','.times.0','.times.1','.times.2','.times.3'].every(k=>g(k)===d(k))&&g('.zone')===id);
    if(!ok||g('.id')!==id||g('.name')!==I.name||g('.verb')!==I.verb) bad.push('E1 新地點 '+id+' 的設定和 AA_772 invite_places 寫的不一樣'); }
  return {bad,pairs,onlyB,NEW}; }
if(process.env.L118_B6_DEBUG){ const r=cmp772((O.data||{}).inv||[],(N.data||{}).inv||[],(a,b)=>aa731(a[1],b[1])), r2=cmp772(O.inputs||[],N.inputs||[],(a,b)=>aa731(a[1],b[1])); require('fs').writeFileSync(process.env.L118_B6_DEBUG,r.bad.join('\n')+'\n=====\n'+r2.bad.join('\n')); }
/* 比法本身的檢查（2026-11-11）：故意改一格、拿掉一格、改新地點的店名、改 118 巷地點的動詞——都要被抓到（不是只比個數、不是整塊略過）*/
{ const A=(O.data||{}).inv||[], B=(N.data||{}).inv||[], same=(a,b)=>aa731(a[1],b[1])||kindOf(a[1],b[1])==='act', base=cmp772(A,B,same).bad.length;
  const mut=f=>{ const C=B.map(e=>e.slice()); f(C); return cmp772(A,C,same).bad.length; }, at=re=>C=>{ const e=C.find(x=>re.test(x[0])); if(e) e[1]=e[1]+'（改）'; };
  const ids={}; for(const e of B){ const m=/^INVITE_DATA\.places\.(\d+)\.id$/.exec(e[0]); if(m) ids[e[1]]=m[1]; }
  const r=[mut(at(new RegExp('^INVITE_DATA\\.places\\.'+ids.cafe+'\\.verb$'))),mut(at(new RegExp('^INVITE_DATA\\.places\\.'+ids.l118_cafe2+'\\.name$'))),mut(at(new RegExp('^INVITE_DATA\\.places\\.'+ids.l118_dian+'\\.verb$'))),
    mut(at(new RegExp('^INVITE_DATA\\.places\\.'+ids.slowread+'\\.zone$'))),mut(C=>{ const i=C.findIndex(x=>/^INVITE_DATA\.people\.heroine_01\.acc\.cafe/.test(x[0])); if(i>=0) C.splice(i,1); }),mut(at(/^INVITE_DATA\.people\.heroine_03\.first\.slowread\.0$/)),mut(at(/^INVITE_DATA\.people\.heroine_01\.acc\.l118_cafe2/))];
  check('28b. 比法本身：沒改＝0 個不一樣；故意改別的地點的動詞、新地點的店名、118 巷地點的動詞、slowread 的區域、拿掉一句、改慢讀那一組的一句、改新地點的答應句——每一種都抓得到',base===0&&ids.cafe!=null&&ids.l118_cafe2!=null&&r.every(n=>n>=1),J([base,r])); }
/* ---------- 28. 資料和 BASE 逐句比 ---------- */
{ for(const [k,nm,want] of [['inv','INVITE_DATA（invites.js 和推進來的）',[NINE[0]]],['enc','ENCOUNTERS（偶遇）',[NINE[4]]],['zrzq','ZRZQ_LINES（子晴芷若）',[NINE[3]]],['ev','STORY_EVENTS（全部載入以後，每一場的 dialogue；子晴那一場是 ZRZQ_EVENTS 推進來的預設版）',[NINE[1],NINE[2],NINE[3]]]]){
    const A=(O.data||{})[k]||[], B=(N.data||{})[k]||[], bad=[], hit=[], hit7=[];
    if(k==='inv'){ const isWant=(a,b)=>kindOf(a,b)==='act'&&want.some(x=>x[1]===a&&x[2]===b); const r=cmp772(A,B,(a,b)=>aa731(a[1],b[1])||isWant(a[1],b[1])); bad.push(...r.bad); for(const [a,b] of r.pairs) if(a[1]!==b[1]&&isWant(a[1],b[1])) hit.push(b[0]); }   /* 2026-11-11：INVITE_DATA 改用地點 id 對、照 AA_772／AA_721 逐格驗（上面 cmp772）*/
    else if(A.length!==B.length) bad.push('字串個數 '+A.length+' → '+B.length);
    else A.forEach((a,i)=>{ const b=B[i]; if(a[0]!==b[0]){ bad.push('路徑不同：'+a[0]+' → '+b[0]); return; } if(a[1]===b[1]) return; if(aa731(a[1],b[1])) return; if(kindOf(a[1],b[1])==='act'&&want.some(x=>x[1]===a[1]&&x[2]===b[1])) hit.push(b[0]);
      else if(k==='ev'&&wrapped(a[1])&&unq(a[1])===b[1]&&SEVEN.includes(a[1])) hit7.push(a[1]); else bad.push(a[0]+'：'+a[1]+' → '+b[1]); });
    /* 第七批（tests/invites_quote_b7_unit.js）：STORY_EVENTS 有名字、整句「…」的拿掉外面那一對——這裡看得到的是上面 SEVEN 那 6 句，只認這 6 句、只差外面那一對、一句一次；其他資料（inv、enc、zrzq）沒有 */
    const w7=k==='ev'?SEVEN:[];
    check('28. '+nm+' 和 '+BASE+' 比（'+B.length+' 個值，含函式原始碼）：只改了 '+hit.length+' 個（'+want.map(x=>x[2]).join('、')+'），只差裡面那一對「」'+(w7.length?'；加上第七批的 '+hit7.length+' 句（只差外面那一對「」）':'')+'，其他一字不差',
      A.length>100&&bad.length===0&&hit.length===want.length&&J(hit7.slice().sort())===J(w7.slice().sort()),sample(bad)+'｜'+sample(hit)+'｜'+sample(hit7)); } }

/* ---------- 29. 原始碼逐行比（這一個 commit 本身）---------- */
const findC6=()=>{ try{ const L=cp.execFileSync('git',['-C',ROOT,'log','--format=%H %s','-F','--grep='+TITLE],{encoding:'utf8',maxBuffer:1<<26}).split('\n'); const x=L.find(l=>l.slice(41).startsWith(TITLE)); return x?x.slice(0,40):null; }catch(e){ return null; } };
{ const C6=findC6(), A_=f=>C6?gitShow(C6+'^',f):gitShow(BASE,f), B_=f=>C6?gitShow(C6,f):cur(f);
  console.log('（29. 比的是 '+(C6?'第六批那一個 commit '+C6.slice(0,9)+'^ → '+C6.slice(0,9):'commit 以前：'+BASE+' → 現在的檔')+'）');
  const files=(C6?cp.execFileSync('git',['-C',ROOT,'diff','--name-only',C6+'^',C6,'--','src'],{encoding:'utf8'}):cp.execFileSync('git',['-C',ROOT,'diff','--name-only',BASE,'--','src'],{encoding:'utf8'})).split('\n').filter(Boolean).sort();
  check('29. 改到的 src 檔就是這 '+CHANGED.length+' 個',J(files)===J(CHANGED.slice().sort()),J(files));
  const split=l=>{ const code=[], lit=[]; let last=0, m; LIT.lastIndex=0; while((m=LIT.exec(l))){ code.push(l.slice(last,m.index)); lit.push(m[1]); last=m.index+m[0].length; } code.push(l.slice(last).replace(/\s+$/,'')); return {code,lit}; };
  const nonBlank=s=>blankComments(s).split('\n').filter(l=>l.trim());
  const WANT={'src/data/invites.js':[1,1],'src/y2r2_3d.js':[1,1],'src/data/bbpack_events.js':[1,1],'src/data/zrzq_events.js':[1,1],'src/data/encounters.js':[1,1],'src/legal3d.js':[1,4]};
  const per={}, bad=[], got=[];
  for(const f of Object.keys(WANT)){ const A=nonBlank(A_(f)), B=nonBlank(B_(f)); if(A.length!==B.length){ bad.push(f+'：註解以外的行數不同 '+A.length+' → '+B.length); continue; }
    let nl=0, nt=0; A.forEach((a,i)=>{ const b=B[i]; if(a===b) return; nl++; const x=split(a), y=split(b);
      if(J(x.code)!==J(y.code)){ bad.push(f+'：「'+a.trim().slice(0,40)+'」程式（字串以外）不一樣'); return; } if(x.lit.length!==y.lit.length){ bad.push(f+'：字串個數不一樣'); return; }
      x.lit.forEach((s,k)=>{ const t=y.lit[k]; if(s===t) return; if(kindOf(s,t)==='act'&&NINE.some(q=>q[0]===f&&q[1]===s&&q[2]===t)){ nt++; got.push(t); } else bad.push(f+'：「'+s.slice(0,20)+'」→「'+t.slice(0,20)+'」不是這一批的那幾句'); }); });
    per[f]=[nl,nt]; }
  check('29. 資料：字串以外一字不差，改到的字串就是這九句（只拿掉裡面那一對「」）；每個檔 [改了幾行, 幾個字串]：'+J(per),!bad.length&&J(per)===J(WANT)&&J(got.slice().sort())===J(NINE.map(x=>x[2]).sort()),sample(bad)||J(per));
  check('29. libquiet3d.js 只改了註解（LIBQ.isOut／needsPrefix 照舊看開頭「（走出」）',J(nonBlank(A_('src/libquiet3d.js')))===J(nonBlank(B_('src/libquiet3d.js')))&&/const OUT_HEAD='（走出';/.test(B_('src/libquiet3d.js')));
  const isNL=l=>/^\s*S\.narrLine=t=>/.test(l), iA=nonBlank(A_('src/invites3d.js')), iB=nonBlank(B_('src/invites3d.js'));
  check('29. invites3d.js：只換了 S.narrLine 那一行（註解以外其他一字不差）；新的那一支＝整句一對（）（同 pool3d.js S.narrWhole 的寫法）',
    iA.filter(isNL).length===1&&iB.filter(isNL).length===1&&J(iA.filter(l=>!isNL(l)))===J(iB.filter(l=>!isNL(l)))&&iA.find(isNL).trim()==="S.narrLine=t=>/^（/.test(t)&&!/^（[^）]*小聲[^）]*）./.test(t)&&!/^（走出[^）]*）「/.test(t);"
    &&iB.find(isNL).trim()==="S.narrLine=t=>{ if(typeof t!=='string'||t[0]!=='（') return false; let d=0; for(let i=0;i<t.length;i++){ const ch=t[i]; if(ch==='（') d++; else if(ch==='）'){ d--; if(d===0) return i===t.length-1; } } return false; };",
    J([iA.find(isNL),iB.find(isNL)])); }

/* ---------- 30. 偵測器 ---------- */
{ const IO=O.inputs||[], IN=N.inputs||[], bad=[], lq=[];
  const nlOf=src=>{ const m=/^\s*S\.narrLine=(t=>[^\n]*);\s*$/m.exec(noComments(src)); return m?vm.runInNewContext('('+m[1].replace(/;$/,'')+')'):null; };
  const oldNL=nlOf(gitShow(BASE,'src/invites3d.js')), newNL=nlOf(cur('src/invites3d.js'));
  /* 2026-11-11：改用地點 id 對、照 AA_772／AA_721 逐格驗（cmp772；舊期望：照位置逐句比、個數一樣）。兩邊都有、字一樣（或只差那一句／AA_731 那幾句）的才比「分法」；
     AA_772／AA_721 換了字的句子和新地點的句子另外驗：現在的 S.narrLine 對它們的分法＝新的寫法（整句一對（）才是旁白）*/
  { const r=cmp772(IO,IN,(a,b)=>(a[1]===OUTL.old&&b[1]===OUTL.now)||aa731(a[1],b[1])); bad.push(...r.bad);
    const whole=t=>{ if(typeof t!=='string'||t[0]!=='（') return false; let d=0; for(let i=0;i<t.length;i++){ const ch=t[i]; if(ch==='（') d++; else if(ch==='）'){ d--; if(d===0) return i===t.length-1; } } return false; };
    for(const [a,b,ch0] of r.pairs){ const changed=ch0||(a[1]!==b[1]&&typeof a[1]==='string'&&(R772.fix(a[1],1)===b[1]||OVS(R772.fix(a[1],1))===b[1]||OVS(a[1])===b[1]));   /* 2026-11-11：AA_772 換過、再被 X324 覆蓋層換（OVS）的也算換過字 */   /* AA_772 換過字的（例：前面加（小聲））*/ if(changed){ if(b[2]!==whole(b[1])) bad.push('分法不對（換過字的句子）：'+b[0]+'：'+b[1]); continue; } if(a[2]!==b[2]) bad.push('分法不一樣：'+b[0]+'：'+b[1]); if(a[3]!==b[3]||a[4]!==b[4]) lq.push(b[0]+'：'+b[1]); }
    for(const b of r.onlyB) if(b[2]!==whole(b[1])) bad.push('分法不對（新地點的句子）：'+b[0]+'：'+b[1]); }
  const nNarr=IN.filter(x=>x[2]).length, nParen=IN.filter(x=>typeof x[1]==='string'&&x[1][0]==='（').length;
  check('30. S.narrLine 的輸入（INVITE_DATA、INVITE_REPLIES、改時間的回覆、ACC0、學姊婉拒、一起走路：'+IN.length+' 句，（ 開頭 '+nParen+'、旁白 '+nNarr+'）：BASE 的程式拿 BASE 的字、現在的程式拿現在的字，每一句分法一樣；字只差這一句',
    IN.length>1500&&nNarr>100&&bad.length===0&&IN.filter(x=>x[1]===OUTL.now).length===1&&IO.filter(x=>x[1]===OUTL.old).length===1,sample(bad));
  const flip=IN.filter(x=>typeof x[1]==='string'&&!!oldNL(x[1])!==!!newNL(x[1])).map(x=>x[1]);
  check('30. 舊的 S.narrLine 拿到現在的字：只有「'+OUTL.now+'」不一樣（舊的會當成旁白、沒有名字——所以一起改）；BASE 的字兩支都一樣',!!oldNL&&!!newNL&&J(flip)===J([OUTL.now])&&oldNL(OUTL.now)===true&&newNL(OUTL.now)===false&&IO.every(x=>typeof x[1]!=='string'||!!oldNL(x[1])===!!newNL(x[1])),J(flip));
  const trail=IO.filter(x=>typeof x[1]==='string'&&x[2]&&!isNarr(x[1])).map(x=>x[0]+'：'+x[1]);
  console.log('（30. 原本當旁白、）後面還有字的句子：'+(trail.length?trail.join('／'):'沒有')+'）');
  check('30. 沒有「原本是旁白、整句不是一對（）」的句子（有的話要列給 AA-B，不改）：'+trail.length+' 句',trail.length===0,sample(trail));
  check('30. LIBQ.isOut、needsPrefix：每一句 BASE／現在一樣（「（走出法圖）……」那句兩邊都是走出館外、不加（小聲））',lq.length===0&&IN.some(x=>x[1]===OUTL.now&&x[3]===true&&x[4]===false)&&IO.some(x=>x[1]===OUTL.old&&x[3]===true&&x[4]===false),sample(lq));
  check('30. 現在的 S.narrLine＝pool3d.js POOL.narrWhole（每一句）',IN.length>0&&IN.every(x=>x[5]===null||typeof x[1]!=='string'||x[2]===x[5]),sample(IN.filter(x=>typeof x[1]==='string'&&x[2]!==x[5]).map(x=>x[1])));
  const E=Object.fromEntries((N.edge||[]).map(([t,v])=>[J(t),v]));
  check('30. S.narrLine 的邊界：整句一對（）＝旁白（含裡面還有（小聲）的、（走出法圖，…。）這種）；（小聲）／（走出法圖）後面有字、「…」、沒有結尾、（a）（b）、空的、不是字串＝不是旁白',
    E[J('（她笑了。）')]===true&&E[J('（她（小聲）說了什麼。）')]===true&&E[J('（走出法圖，她回頭看了一下門口。）')]===true&&['（小聲）好。','（走出法圖）館員人好好。','（走出法圖）「後面。」','好。','「好。」','（a）（b）','（沒有結尾',''].every(t=>E[J(t)]===false)&&E[J(null)]===false&&E[J({me:'嗯。'})]===false,J(N.edge)); }

/* ---------- 31. 演出來：BASE 和現在各跑一次 ---------- */
check('31. 兩次都跑得起來（'+BASE+' 的檔、現在的檔；index.html 全部載入、沒有例外）',!(O.errs||[]).length&&!(N.errs||[]).length,sample((O.errs||[]).concat(N.errs||[])));
const cmp=(A,B)=>{ const bad=[]; let ch=0; A=A||[]; B=B||[]; if(A.length!==B.length) bad.push('句數 '+A.length+' → '+B.length);
  else A.forEach((a,i)=>{ const b=B[i], ta=a[a.length-1], tb=b[b.length-1]; if(J(a.slice(0,-1))!==J(b.slice(0,-1))) bad.push('說的人不一樣：'+J(a)+' → '+J(b)); else if(ta!==tb){ if(NINE.some(x=>ta===x[1]&&tb===x[2])&&b[b.length-2]!=null) ch++; else bad.push(J(a)+' → '+J(b)); } });
  return {bad,ch}; };
{ const PSN='沛珊', W=r=>r[r.length-2], T=r=>r[r.length-1], isQ=t=>/^（小聲）|^（[^（）]*小聲。?）/.test(t);
  /* 31a 沛珊第一次去法圖 */
  const m=N.meet||[], k=m.findIndex(r=>T(r)===OUTL.now), r=cmp(O.meet,N.meet);
  check('31. 沛珊第一次去法圖（讀書區 INV.meet）：'+m.length+' 句，說的人和 BASE 一樣、字只差那一句裡面的「」',m.length>2&&r.bad.length===0&&r.ch===1,sample(r.bad));
  check('31. 沛珊第一次去法圖：櫃台那句旁白沒名字；「'+OUTL.now+'」是沛珊說的（有名字）、不加（小聲）；之後到道別都不加（同 BASE）',k>0&&W(m[k-1])===null&&W(m[k])===PSN&&m.slice(k+1).filter(x=>W(x)).length>0&&m.slice(k+1).every(x=>!W(x)||!isQ(T(x)))&&(O.meet||[]).findIndex(x=>T(x)===OUTL.old)===k,J(m));
  check('31. 沛珊第一次去法圖：見面結束 LIBQ 配對（不再是大聲、讀書區又會加）',N.meetLoud===false&&N.meetBal===true&&O.meetLoud===false&&O.meetBal===true);
  const r2=cmp(O.meet2,N.meet2);
  check('31. 同一個地方第二次（不演 firstAt）：和 BASE 一模一樣、道別照加（小聲）',(N.meet2||[]).length>0&&r2.bad.length===0&&r2.ch===0&&(N.meet2||[]).some(x=>W(x)&&isQ(T(x))),J(N.meet2));
  check('31. 讀書區外直接播 firstAt（INV.playLines）：櫃台那句沒名字、「'+OUTL.now+'」沛珊說的；BASE 同（字只差裡面的「」）',J(N.fa)===J([[null,'（她在借書櫃台問了館員三個問題，館員都回答了。）'],[PSN,OUTL.now]])&&J(O.fa)===J([[null,'（她在借書櫃台問了館員三個問題，館員都回答了。）'],[PSN,OUTL.old]]),J([O.fa,N.fa]));
  check('31. 帶 LIBQ.scope：前面那句加（小聲）、那一句是她說的不加、之後到道別都不加；結束配對（同 BASE，只差裡面的「」）',
    J(N.scope)===J([[PSN,'（小聲）前面。'],[PSN,OUTL.now],[PSN,'再後面。'],[PSN,'道別。']])&&J(O.scope)===J([[PSN,'（小聲）前面。'],[PSN,OUTL.old],[PSN,'再後面。'],[PSN,'道別。']])&&N.scopeBal===true&&O.scopeBal===true,J([O.scope,N.scope]));
  /* 31b 事件 */
  for(const [kk,nm] of [['out','讀書區外'],['lib','讀書區（總圖 3F）']]){ const A=((O.ev||{})[kk])||[], B=((N.ev||{})[kk])||[];
    const bad=[]; let ch=0; if(A.length!==B.length) bad.push('句數 '+A.length+' → '+B.length); else A.forEach((a,i)=>{ const b=B[i]; if(a[0]!==b[0]||a[1]!==b[1]) bad.push('說的人不一樣：'+J(a)+' → '+J(b)); else if(a[2]!==b[2]){ if(actQ(a[2])&&actUnq(a[2])===b[2]&&b[1]) ch++; else bad.push(J(a)+' → '+J(b)); } });
    check('31. 事件的那幾步（'+nm+'：明軒、Alison、子晴英國遠距那一則 5 句）：'+B.length+' 句，說的人和 BASE 一樣、字只差裡面的「」（'+ch+' 句）',B.length===7&&bad.length===0&&ch===3,sample(bad)+' '+J(B)); }
  const eo=(N.ev||{}).out||[];
  check('31. 讀書區外：明軒、Alison、子晴說那三句（有名字），字＝現在的字',[['mx',NINE[1][2]],['yu',NINE[2][2]],['uk',NINE[3][2]]].every(([k2,t])=>eo.some(x=>x[0]===k2&&x[1]&&x[2]===t))&&eo.filter(x=>x[0]==='uk').length===5,J(eo));
  const el=(N.ev||{}).lib||[], elO=(O.ev||{}).lib||[];
  check('31. 讀書區：那三句的（小聲）合進動作的括號（「（跑過記分台，小聲）你翻慢一點，我緊張。」；BASE＝「（跑過記分台，小聲）「你翻慢一點，我緊張。」」）',
    el.some(x=>x[0]==='mx'&&x[2]==='（跑過記分台，小聲）你翻慢一點，我緊張。')&&elO.some(x=>x[0]==='mx'&&x[2]==='（跑過記分台，小聲）「你翻慢一點，我緊張。」')&&el.some(x=>x[0]==='uk'&&x[2]==='（打字，念出來，小聲）在吃宵夜。第二份。')&&el.some(x=>x[0]==='yu'&&x[2]==='（便利貼，小聲）四年了。'),J(el));
  /* 九句在讀書區的加法 */
  const QO=O.quiet||[], QN=N.quiet||[];
  check('31. 九句在讀書區：要不要加（小聲）和 BASE 一樣（課堂那四句本來就是（小聲）開頭、不再加）；加了以後只差裡面的「」',QO.length===9&&QN.length===9&&QO.every((q,i)=>q[1]===QN[i][1]&&actUnq(q[2])===QN[i][2])&&QN.slice(5).every(q=>q[1]===false&&q[2]===q[0])&&QN[0][1]===false,J(QN));
  /* 31c 偶遇 */
  const en=N.enc||[], ro=cmp(O.enc,N.enc);
  check('31. 語彤在大稻埕的偶遇（朋友、打招呼）：「'+NINE[4][2]+'」是語彤說的（有名字），前面的 why 沒名字；說的人和 BASE 一樣、字只差那一對「」',
    en.length>=3&&W(en[0])===null&&!!N.encName&&en.some(x=>T(x)===NINE[4][2]&&W(x)===N.encName)&&ro.bad.length===0&&ro.ch===1,sample(ro.bad)+' '+J(en));
  /* 31d 課堂 */
  const lg=N.legal||[], lo=O.legal||[], lbad=[]; let lch=0;
  if(lg.length!==lo.length) lbad.push('次數不同'); else lo.forEach((a,i)=>{ const b=lg[i]; if(a[0]!==b[0]||a[1]!==b[1]||a[2]!==b[2]) lbad.push('說的人不一樣：'+J(a)+' → '+J(b)); else if(a[3]!==b[3]){ if(actQ(a[3])&&actUnq(a[3])===b[3]) lch++; else lbad.push(J(a)+' → '+J(b)); } });
  const seenT=new Set(lg.map(x=>x[3]));
  check('31. 課堂旁邊的同學小聲（LEGAL.ask chorus，答對、答錯各 40 次）：最後一句是那個同學說的（'+N.legalName+'）、四句都演到；說的人和 BASE 一樣、字只差裡面的「」',
    lg.length===80&&lg.every(x=>x[2]===N.legalName)&&NINE.slice(5).every(x=>seenT.has(x[2]))&&[...seenT].every(t=>NINE.slice(5).some(x=>x[2]===t))&&lbad.length===0&&lch===80&&lg.filter(x=>x[0]==='ok').every(x=>[NINE[5][2],NINE[6][2]].includes(x[3]))&&lg.filter(x=>x[0]==='bad').every(x=>[NINE[7][2],NINE[8][2]].includes(x[3])),sample(lbad)+' '+J([...seenT])); }

/* ---------- 32. 存檔 ---------- */
{ const so=O.save||{}, sn=N.save||{}, ks=Object.keys(sn);
  check('32. 演完以後存檔裡沒有這幾句說的話（BASE、現在都是；firstAt 記 iv.faDone、事件記 id、偶遇記 encLog／memo、課堂記題號）＝舊存檔不用換記號（'+ks.length+' 種情境）',
    ks.length>=10&&J(Object.keys(so).sort())===J(ks.slice().sort())&&ks.every(k=>Array.isArray(sn[k])&&sn[k].length===0&&Array.isArray(so[k])&&so[k].length===0),J({so,sn}));
  const SM=noComments(cur('src/story3d.js'));
  check('32. 讀檔換記號（STORY.smallQuoteMigrate）只看閒聊表、經濟系同學表（這幾句都不在那裡），這一批不用改',!CHANGED.includes('src/story3d.js')&&/S\.smallQuoteMigrate=function\(s\)\{/.test(SM)); }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}

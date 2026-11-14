// 有名字說的台詞拿掉「」第八批（TEXT-QUOTE-UNIFY-1108，AA-B 2026-11-08 13:05「(1) 做…(2) 只做有名字的…(4) 停用的舊事件一起改：OK」、13:14「補（結尾不是標點才補「。」，題庫不改；跟第八批一起進）」）——不需要瀏覽器（D131）。
// 第一、二批 tests/invites_quote_unit.js，第三批 _b3，第四批 _b4，第五批 _b5，第六批 _b6，第七批 _b7。
// 規則（同前幾批）：在對話框「有名字」說出來的台詞，外面不包整句的「」；對話框沒有名字的（旁白、名字寫在字裡的）、選項、手機訊息照留；句子裡面引用的「」照留。
// 這一批：
//   (1) src/legal3d.js 13 張表 36 句（CLASS_INTRO、CLASS_OK／BAD／UNSURE、MATE_ASK／MC／OK／BAD／UNSURE、STUDY_ASK／OK／BAD／UNSURE）外面的「」拿掉——
//       都是 LEGAL.ask 的 say(…)＝GM.say(who,…)、who＝{name:SOCIAL.displayName(by)}（有名字；呼叫的地方 by 都是人物：prof_lin、heroine_05、classmate_bohan）；
//       填進去的題目字（{stmt}、{q}、{core}）一字不動，原本有的「」照留；給玩家選的選項（GM.choose：「對。」「不對。」「……我不確定。」「……不確定。」）照留
//   (1b) 13:14 補：句尾是程式填進去的答案（{core} 在最後：CLASS_BAD 4 句、CLASS_UNSURE 2 句、MATE_BAD 3 句）、填完結尾不是標點＝補一個「。」；
//       已經是標點（。！？…」』）等）的不補。在 fill() 裡做；題庫（legal_qbank.js、exam_bank.js、syllabus.js）一字不改
//   (2) src/classes3d.js 課堂沒有 syllabus（沒審查的週、沒有台詞池）時教授的開場 STYLE：同一個字串兩條路——
//       教授在場（S.attend 的 GM.say(prof,…)，對話框是教授的名字）＝拿掉外面的「」（S.unq，只拿整句一對的）；
//       不在場（EVENTS.npcOf 找不到：「周老師：「…」」、對話框沒有名字；y5s1_3d.js 大五補修的重播也是）照留、一字不改。STYLE 的字本身不改
//       鄭教授那一句「「我先畫張圖。」黑板上多了一塊地…」不是整句一對（「」後面還有旁白），S.unq 不動——列給 AA-B
// 說過了的記號（存檔）：這些句子都不當記號（課堂記題號 G.legal、上課記 G.courses 的 key），第 44 項演完比存檔
// 檢查（BASE＝c1f229e34，第八批以前的開發分支 head）：
//   39. 分類：BASE legal3d.js 整句「…」＝這 36 句＋選項 4 個；現在只剩選項；36 句在 13 張表裡的位置；演出來 36 句都演到、都是有名字的人說的；
//       STYLE 12 位：11 句整句「…」、鄭教授不是；所有課（課表上的每一堂、每一門課 × 16 週）ct.line 整句「…」的只有 STYLE 那 11 位的開場（syllabus、台詞池、第二格沒有）
//   40. 表和 BASE 逐句比：13 張表結構一樣、每句只差外面那一對；36 句 × 84 題填完：現在＝BASE 拿掉外面那一對（＋句尾答案沒有標點的那 9 句補一個「。」），題目字一字不差
//   41. 原始碼逐行比（第八批那一個 commit 本身，用 commit 標題找；commit 以前比 BASE 和現在的檔）：只動 legal3d.js、classes3d.js；
//       legal3d.js＝13 張表的字串只差外面那一對、fill 多補「。」那一段（加 END_P 一行）；classes3d.js＝加 S.unq 一行、教授在場那一句套 S.unq；其他一字不差；題庫一字不差
//   42. 讀書區（LIBQ.quiet 加（小聲））：36 句 × 84 題、STYLE 開場，BASE 和現在加完一樣（補了「。」的只差那一個「。」）；LEGAL.ask 在讀書區演出來一樣
//   43. 演出來（另開 node，一次用 BASE 的檔、一次用現在的檔；index.html 全部載入）：LEGAL.ask 八種（情境×出題的人）× 五題 × 答對／答錯／不確定 × 4 個亂數——
//       說的人一樣、只差外面那一對（＋補的「。」）；補「。」：沒有標點的答案補一個、題庫 core 本來有「。」的只有一個、已經是標點的不補（另外放 4 題測試題）；
//       上課（STYLE 那 11 位教授有課的，在場、不在場各一次）：不在場一字不差、在場只有開場那一句只差外面那一對、說的人是教授（有名字）
//   44. 存檔：每一段演完，BASE 和現在的存檔一模一樣，裡面沒有改到的句子（不用換記號；STORY.smallQuoteMigrate 不用改）；36 句在 src 只出現在 legal3d.js
// 修改前（BASE 的 src 檔換回來跑）：見 commit 訊息。用法：node tests/invites_quote_b8_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), vm=require('vm'), crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..'), BASE='c1f229e34', TITLE='有名字說的台詞拿掉外面的「」第八批';
const CHANGED=['src/classes3d.js','src/legal3d.js'];
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
const END_P=/[。！？!?…」』）)]$/;   /* 結尾已經是標點（同 legal3d.js 的 END_P）*/
const TABLES=['CLASS_INTRO','CLASS_OK','CLASS_BAD','CLASS_UNSURE','MATE_ASK','MATE_MC','MATE_OK','MATE_BAD','STUDY_ASK','STUDY_OK','STUDY_BAD','STUDY_UNSURE','MATE_UNSURE'];
/* 這一批的 36 句：[表, 出題的人（表是照人分的才有）, BASE 的字] */
const OLD36=[
  ['CLASS_INTRO','prof_lin','「我們看一個實務上常見的情況。」'],['CLASS_INTRO','prof_lin','「先不要翻條文，用你們現在的理解。」'],['CLASS_INTRO','prof_lin','「這題判決和學說有不同看法，先講你的。」'],
  ['CLASS_INTRO','prof_zhou','「來，換個角度。」'],['CLASS_INTRO','default','「這個問題——」'],
  ['CLASS_OK','prof_lin','「對。這個你們之後會在判決裡一直看到。」'],['CLASS_OK','prof_lin','「可以。坐下。」'],['CLASS_OK','prof_lin','「嗯，重點抓到了。」'],['CLASS_OK','default','「很好。」'],
  ['CLASS_BAD','prof_lin','「不是。這是很多人第一年都會混淆的地方——{core}」'],['CLASS_BAD','prof_lin','「差一點。想一下：{core}」'],['CLASS_BAD','prof_lin','「……這個之後考試會出。{core}」'],['CLASS_BAD','default','「再想一下。{core}」'],
  ['CLASS_UNSURE','prof_lin','「沒關係，不確定比亂答好。記住：{core}」'],['CLASS_UNSURE','default','「先記住：{core}」'],
  ['MATE_ASK',null,'「欸，我覺得{stmt}——對吧？」'],['MATE_ASK',null,'「我剛剛跟柏翰吵這個：{stmt}。你覺得？」'],['MATE_ASK',null,'「考古題有一題：{stmt}。這是對的嗎？」'],
  ['MATE_MC',null,'「那個——{q} 你覺得是哪個？」'],['MATE_MC',null,'「老師講的那題我沒跟上：{q}」'],
  ['MATE_OK',null,'「喔——所以是這樣。好我懂了。」'],['MATE_OK',null,'「……你怎麼記得住。」'],['MATE_OK',null,'「對吼。」'],
  ['MATE_BAD',null,'「我也這樣想，可是筆記上寫的好像不是……{core}」'],['MATE_BAD',null,'「嗯？我筆記上寫：{core}」'],['MATE_BAD',null,'「等等，我查一下……{core}」'],
  ['STUDY_ASK',null,'「這一題，{name}你來。{q}」'],['STUDY_ASK',null,'「下一個：{q}」'],
  ['STUDY_OK',null,'「對。下一題。」'],['STUDY_OK',null,'「好，這題可以。」'],
  ['STUDY_BAD',null,'「錯。這裡的重點是——{core}。不要再混。」'],['STUDY_BAD',null,'「不對。{core}。這個上次讀書會就講過。」'],
  ['STUDY_UNSURE',null,'「不確定就先記起來：{core}。」'],['STUDY_UNSURE',null,'「好，先記：{core}。下次我會再問。」'],
  ['MATE_UNSURE',null,'「你也不知道喔……我筆記上寫：{core}。」'],['MATE_UNSURE',null,'「那我們都不知道。等等問柏翰……啊他寫：{core}。」'] ];
const OLDS=OLD36.map(x=>x[2]), NEWS=OLDS.map(unq);
const CORE_END=NEWS.filter(t=>/\{core\}$/.test(t));   /* 句尾是答案的那 9 句（補「。」）*/
const OPT4=['「對。」','「不對。」','「……我不確定。」','「……不確定。」'];   /* 給玩家選的（照留）*/
const STYLE_P=['prof_zhou','prof_zhang','prof_wu','prof_huang','prof_xu','prof_tsai','prof_lin','prof_chen','prof_zheng','prof_ye','prof_he','prof_jian'];
/* 原始碼的改法（註解拿掉以後）：legal3d.js 加一行、換 fill 那一行；classes3d.js 加一行、換教授那一句 */
const LEGAL_INS=String.raw`  const END_P=/[。！？!?…」』）)]$/;`;
const LEGAL_FILL=[String.raw`  function fill(t,q){ return t.replace('{core}',coreText(q)).replace('{stmt}',stmt(q)).replace('{q}',q.q).replace('{name}',G.name); }`,
  String.raw`  function fill(t,q){ const s=t.replace('{core}',coreText(q)).replace('{stmt}',stmt(q)).replace('{q}',q.q).replace('{name}',G.name); return /\{core\}$/.test(t)&&!END_P.test(s)?s+'。':s; }`];
const CLS_INS=String.raw`  S.unq=t=>{ if(typeof t!=='string'||t.length<2||t[0]!=='「'||t[t.length-1]!=='」') return t; let d=0; for(let i=0;i<t.length;i++){ const ch=t[i]; if(ch==='「') d++; else if(ch==='」'){ d--; if(d===0&&i!==t.length-1) return t; } } return d===0?t.slice(1,-1):t; };`;
const CLS_REP=[String.raw`await GM.say(prof||null,(prof?'':(ct.prof||S.profName(c))+'：')+ct.line);`,String.raw`await GM.say(prof||null,prof?S.unq(''+ct.line):(ct.prof||S.profName(c))+'：'+ct.line);`];
/* legal3d.js 的表和 fill（從原始碼那幾行拿出來跑；BASE、現在各一份）*/
const legalKit=src=>{ const L=src.split('\n').map(l=>l.replace(/\/\*[\s\S]*?\*\//g,'')); const one=(re,opt)=>{ const x=L.filter(l=>re.test(l)); if(x.length>1||(!opt&&!x.length)) throw new Error('legal3d.js：'+re+' 找到 '+x.length+' 行'); return x[0]||''; };
  const code=[one(/^  const END_P=/,true)].concat(['stmt','coreText','fill'].map(n=>one(new RegExp('^  function '+n+'\\('))),TABLES.map(n=>one(new RegExp('^  const '+n+'=')))).join('\n');
  const c=vm.createContext({G:{name:'祐廷'}}); vm.runInContext(code+'\nglobalThis.K={stmt,coreText,fill,T:{'+TABLES.join(',')+'}};',c); return vm.runInContext('globalThis.K',c); };
const flat=K=>{ const o=[]; for(const n of TABLES){ const T=K.T[n]; if(Array.isArray(T)) T.forEach(s=>o.push([n,null,s])); else for(const k of Object.keys(T)) T[k].forEach(s=>o.push([n,k,s])); } return o; };
/* classes3d.js 的 STYLE（從原始碼拿出來跑）*/
const styleKit=src=>{ const i=src.indexOf('\n  const STYLE={'), j=src.indexOf('\n  };',i); if(i<0||j<0) throw new Error('classes3d.js：找不到 STYLE'); const c=vm.createContext({}); vm.runInContext('globalThis.STYLE=(function(){'+src.slice(i,j+5)+' return STYLE; })();',c); return vm.runInContext('globalThis.STYLE',c); };
const QIDS=['Q001','Q002','Q004','Q016','Q017'];   /* 是非（core 有「。」）、選擇（core 有「。」）、題目開頭就有「」的選擇、選擇（沒有 core：答案＝選項的字，沒有標點）、是非（沒有 core）*/
const COMBOS=[['class','prof_lin'],['class','prof_zhou'],['class','classmate_bohan'],['study','heroine_05'],['study','classmate_bohan'],['quiz','prof_lin'],['classmate','prof_lin'],['office','prof_lin']];
const RES=['ok','bad','unsure'], SEEDS=[1,2,3,4];
/* 測試題（只在第 43 項演，演完拿掉）：答案的結尾已經是標點＝不補；core 本來有「。」＝只有一個 */
const SYNTH=[{id:'QB8_DOT',section:'測試',type:'mc',q:'（測試）哪一個？',options:{A:'選項甲。',B:'選項乙',C:'選項丙',D:'選項丁'},answer:'A'},
  {id:'QB8_QM',section:'測試',type:'mc',q:'（測試）哪一個？',options:{A:'選項甲？',B:'選項乙',C:'選項丙',D:'選項丁'},answer:'A'},
  {id:'QB8_CLOSE',section:'測試',type:'tf',q:'（測試）這句話。',answer:'對',core:'核心是「引號」'},
  {id:'QB8_CORE',section:'測試',type:'tf',q:'（測試）這句話。',answer:'錯',core:'核心句子。'}];

if(process.env.QUOTE_B8_PROBE) (async()=>{
  /* ===================== 演出來（子程序）：QUOTE_B8_PROBE=old 讀 BASE 的 CHANGED，=new 讀現在的；index.html 的 src 全部載入（同第六、七批）===================== */
  const mode=process.env.QUOTE_B8_PROBE;
  if(mode==='old'){ const OLD={}; for(const f of CHANGED) OLD[path.join(ROOT,f)]=gitShow(BASE,f); const real=fs.readFileSync;
    fs.readFileSync=function(p){ if(typeof p==='string'){ const k=path.resolve(p); if(OLD[k]!=null) return OLD[k]; } return real.apply(fs,arguments); }; }
  if(mode==='new'&&pinC8){ const PN={}; for(const f of PIN_FILES) PN[path.join(ROOT,f)]=gitShow(pinC8,f); const real=fs.readFileSync;
    fs.readFileSync=function(p){ if(typeof p==='string'){ const k=path.resolve(p); if(PN[k]!=null) return PN[k]; } return real.apply(fs,arguments); }; }
  const out={errs:[]};
  console.warn=()=>{}; console.log=()=>{};
  let SEED=1; Math.random=()=>{ SEED=(Math.imul(SEED,1664525)+1013904223)>>>0; return SEED/4294967296; }; const seed=v=>{ SEED=(v>>>0)||1; for(let i=0;i<3;i++) Math.random(); };   /* 先丟掉前三個（相鄰的種子第一個亂數幾乎一樣，表上的句子會一直抽到同一句）*/
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
  /* 筆記、日誌照 game3d.js 寫進存檔（第 44 項比存檔）*/
  GM.addNote=(id,title,body)=>{ const G=H.G; G.notes=G.notes||[]; if(G.notes.find(n=>n.id===id)) return false; G.notes.push({id,title,body,day:G.day}); return true; }; GM.hasNote=id=>!!(H.G.notes||[]).find(n=>n.id===id);
  GM.memo=t=>{ const G=H.G; G.memo=G.memo||[]; G.memo.push(t&&typeof t==='object'?Object.assign({day:G.day},t):{day:G.day,t}); };
  if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};
  const say0=GM.say; GM.say=async(who,t,o)=>say0(who,typeof LIBQ!=='undefined'?LIBQ.whisper(GM,who,t):t,o);   /* game3d.js 的 say：讀書區加（小聲）*/
  const rec=()=>H.said.map(s=>[s.who,s.t]);
  const sec=async(k,f)=>{ seed(k.length*7919); try{ await f(); }catch(e){ out.errs.push(k+'：'+String(e&&e.stack||e).split('\n').slice(0,3).join(' / ').slice(0,400)); } };
  const P_=H.E.player, at=(zone,lv,x,z)=>{ H.G.zone=zone; P_.lv=lv|0; P_.obj.position.x=x||0; P_.obj.position.z=z||0; };
  const keyOf=d=>CALENDAR.dateOf(d).key;
  const fresh=(d,h,zone,flags)=>{ const G=H.fresh(typeof d==='number'?keyOf(d):d,h,zone||'campus',Object.assign({introDone:true,afternoonDone:true,classDone:true},flags||{})); G.notes=[]; G.memo=[]; E.player.busy=false; at(G.zone,0,0,0); if(typeof LIBQ!=='undefined') LIBQ.reset(); LEGAL.bind(G,GM); return G; };
  const asked=[]; const ask0=LEGAL.ask; LEGAL.ask=async function(spec,e){ const r=await ask0.apply(this,arguments); asked.push(r&&r.q?r.q.id:null); return r; };   /* 記下問了哪一題 */
  const saveOf=lines=>{ const j=JSON.stringify(H.G); return {md5:crypto.createHash('md5').update(j).digest('hex'),len:j.length,has:[...new Set(lines.filter(t=>typeof t==='string'&&t.length>1&&j.includes(t)))]}; };
  const K=legalKit(fs.readFileSync(path.join(ROOT,'src/legal3d.js'),'utf8'));   /* 這一次載入的 legal3d.js（old＝BASE）*/
  out.kitFlat=flat(K);
  /* ---------- 39 每一堂課的 ct.line（課表上的每一堂；每一門課 × 16 週）、走哪一條（照 S.content 的順序）---------- */
  const branch=it=>{ const c=it.c; if(c.second&&c.second.length&&CLS.slotOrder(it).i>=1&&!CLS.earlierSlotsOff(it)) return 'second'; if(c.syllabus&&CLS.sylReviewed(c,it.week)&&c.syllabus.find(q=>q.w===it.week)) return 'syl'; if(c.pool&&c.pool.lines&&c.pool.lines.length) return 'pool'; return c.prof&&STYLE_P.includes(c.prof)?'style':'general'; };
  out.content=[]; out.items={};
  await sec('content',async()=>{ const G=fresh('2026-10-07',10,'campus');
    for(let d=-420;d<1500;d++){ if(!CALENDAR.termOf(d)) continue; let items=[]; try{ G.day=d; items=CLS.dayItems(G,d); }catch(e){ continue; }
      for(const it of items){ if(it.exam) continue; let ct=null; try{ ct=CLS.content(it); }catch(e){ out.errs.push('content '+d+' '+it.c.id+'：'+String(e&&e.message||e).slice(0,120)); continue; }
        const b=branch(it), row=[d,it.c.id,it.week,it.c.prof||null,''+ct.line,b,CLS.topic(it.c,it.week)||it.c.name,it.c.name]; out.content.push(row);
        /* 上課要演的那幾堂：每位教授第一堂走 STYLE 的（自然的）；沒有的話第一堂一般的課（拿掉 syllabus、台詞池、第二格＝一樣走 STYLE）*/
        const p=it.c.prof; if(p&&STYLE_P.includes(p)&&it.c.kind!=='service'&&CLS.slotOrder(it).i<1){ const x=out.items[p]; if(!x||(!x.natural&&b==='style')) out.items[p]={d,cid:it.c.id,week:it.week,natural:b==='style'}; } } } });
  out.contentAll=[];
  await sec('contentAll',async()=>{ fresh('2026-10-07',10,'campus');
    for(const c of COURSES.list) for(let w=1;w<=16;w++){ const slot=(c.slots||[])[0]||{wd:1,block:'am'}; let day=1; try{ if(/^Y\dS\d$/.test(c.term||'')) day=STORY.termDay(c.term,w,slot.wd===7?0:slot.wd); }catch(e){}
      const it={c,week:w,day,slot,key:'b8:'+c.id+':'+w,term:c.term,t0:9,t1:12}; let ct=null; try{ ct=CLS.content(it); }catch(e){ out.contentAll.push([c.id,w,c.prof||null,null,'err']); continue; }
      out.contentAll.push([c.id,w,c.prof||null,''+ct.line,branch(it),CLS.topic(c,w)||c.name]); } });
  /* ---------- 43 上課：每位教授在場、不在場各一次 ---------- */
  out.cls={}; out.save={}; out.play={};
  await sec('cls',async()=>{ for(const p of STYLE_P){ const x=out.items[p]; if(!x) continue;
      for(const present of [false,true]){ const G=fresh(x.d,9,'campus'); let it=CLS.dayItems(G,x.d).find(q=>q.c.id===x.cid&&!q.exam&&CLS.slotOrder(q).i<1); if(!it){ out.errs.push('找不到 '+p+' 那一堂'); continue; }
        if(!x.natural) it=Object.assign({},it,{c:Object.assign({},it.c,{syllabus:null,pool:null,second:null})});
        G.hour=it.t0; at('campus',0,0,0); GM.npc={}; if(present) GM.npc[p]={name:SOCIAL.npcName(p),obj:mkObj(),charId:p,pose:'idle'};
        seed(7+p.length); H.said=[]; H.picks=[0,0,0,0]; asked.length=0; const r=await CLS.attend(GM,it,{inScene:true}); const k='cls_'+p+'_'+(present?'in':'out');
        out.play[k]={lines:rec(),asked:asked.slice(),ret:r,branch:branch(it),topic:CLS.topic(it.c,it.week)||it.c.name,profName:present?SOCIAL.npcName(p):null}; out.save[k]=saveOf(H.said.map(s=>s.t)); } } });
  /* ---------- 43 LEGAL.ask：八種 × 五題 × 答對／答錯／不確定 × 4 個亂數（讀書區外）；讀書區各一次 ---------- */
  const pickFor=(q,res)=>{ if(res==='unsure') return q.type==='tf'?'「……我不確定。」':'「……不確定。」'; const ok=res==='ok';
    if(q.type==='tf') return (q.answer==='對')===ok?'「對。」':'「不對。」'; return '「'+(ok?q.answer:(q.answer==='A'?'B':'A'))+'，'; };
  const legalRun=async(k,zone,ctx,by,qid,res,sd)=>{ const G=fresh('2026-10-07',10,zone); seed(sd*101+ctx.length*31+qid.charCodeAt(3)); const q=LEGAL.byId(qid);
    H.said=[]; H.picks=[pickFor(q,res)]; asked.length=0; const r=await LEGAL.ask({context:ctx,by,qid,quiet:false});
    out.play[k]={lines:rec(),asked:asked.slice(),result:r&&r.result,by,byName:SOCIAL.displayName(by),ctx,qid,res}; out.save[k]=saveOf(H.said.map(s=>s.t)); };
  await sec('legal',async()=>{ for(const [ctx,by] of COMBOS) for(const qid of QIDS) for(const res of RES){ for(const sd of SEEDS) await legalRun(['legal','out',ctx,by,qid,res,sd].join('_'),'campus',ctx,by,qid,res,sd);
      await legalRun(['legal','lib',ctx,by,qid,res,1].join('_'),'library',ctx,by,qid,res,1); } });
  /* ---------- 43 測試題（答案結尾已經是標點、core 本來有「。」）：放進 QBANK 演完拿掉 ---------- */
  await sec('synth',async()=>{ for(const s of SYNTH) QBANK.push(JSON.parse(JSON.stringify(s)));
    try{ for(const s of SYNTH) for(const [ctx,by] of [['class','prof_lin'],['class','classmate_bohan'],['classmate','prof_lin']]) for(const res of ['bad','unsure']) for(const sd of SEEDS) await legalRun(['synth',s.id,ctx,by,res,sd].join('_'),'campus',ctx,by,s.id,res,sd); }
    finally{ for(const s of SYNTH){ const i=QBANK.findIndex(q=>q.id===s.id); if(i>=0) QBANK.splice(i,1); } } out.qbankN=QBANK.length; });
  /* ---------- 42 讀書區：LIBQ.quiet 的加法（這一次的表 × 84 題；STYLE 的開場）---------- */
  { const fl=flat(K), L=[]; for(const [n,k,t] of fl) for(const q of QBANK) L.push([n,k,t,q.id,LIBQ.quiet(K.fill(t,q))]); out.quiet=L;
    out.quietStyle=out.content.filter(r=>r[5]==='style').slice(0,40).map(r=>[r[4],LIBQ.quiet(r[4]),LIBQ.quiet(unq(r[4]))]); }
  process.stdout.write('@@B8@@'+JSON.stringify(out)+'\n',()=>process.exit(0));
})().catch(e=>{ process.stdout.write('@@B8@@'+JSON.stringify({errs:['例外：'+String(e&&e.stack||e).slice(0,600)]})+'\n',()=>process.exit(0)); });
else main();

/* ===================== 主程式 ===================== */
function main(){
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, sample=L=>L.slice(0,6).join('／')+(L.length>6?'…（共 '+L.length+'）':'');
const lits=s=>{ const t=noComments(s), o=[]; let m; LIT.lastIndex=0; while((m=LIT.exec(t))) o.push(m[1]); return o; };
const runProbe=m=>{ let o=''; try{ o=cp.execFileSync(process.execPath,[__filename],{env:Object.assign({},process.env,{QUOTE_B8_PROBE:m}),encoding:'utf8',maxBuffer:1<<30,stdio:['pipe','pipe','pipe']}); }catch(e){ o=String(e.stdout||''); }
  const line=o.split('\n').find(l=>l.startsWith('@@B8@@')); return line?JSON.parse(line.slice(6)):{errs:['子程序沒有結果：'+o.slice(-300)]}; };
const O=runProbe('old'), N=runProbe('new');
const QB=(()=>{ const c=vm.createContext({}); vm.runInContext(gitShow(BASE,'src/data/legal_qbank.js').replace(/^const QBANK\s*=/m,'globalThis.QBANK='),c); return vm.runInContext('globalThis.QBANK',c); })();
let KO=null, KN=null; try{ KO=legalKit(gitShow(BASE,'src/legal3d.js')); KN=legalKit(cur('src/legal3d.js')); }catch(e){ check('legal3d.js 的表和 fill 拿得出來',false,String(e.message)); }
let SO=null, SN=null; try{ SO=styleKit(gitShow(BASE,'src/classes3d.js')); SN=styleKit(cur('src/classes3d.js')); }catch(e){ check('classes3d.js 的 STYLE 拿得出來',false,String(e.message)); }
/* 這一批的改法：BASE 的一句 → 現在的一句（拿掉外面那一對；句尾是答案、沒有標點的補「。」）*/
const xform=(oldLine,tmplNew)=>{ const u=unq(oldLine); return /\{core\}$/.test(tmplNew)&&!END_P.test(u)?u+'。':u; };
/* BASE 每一句填完的字 → [第幾句, 題號]（演出來的時候認是哪一句）*/
const allQ=QB.concat(SYNTH);
const fillIdx=K=>{ const m=new Map(); if(!K) return m; flat(K).forEach(([n,k,t],i)=>{ for(const q of allQ){ const s=K.fill(t,q); if(!m.has(s)) m.set(s,[]); m.get(s).push([i,q.id]); } }); return m; };
const FO=fillIdx(KO), FN=fillIdx(KN);

/* ---------- 39. 分類 ---------- */
check('39. 兩次都跑得起來（'+BASE+' 的檔、現在的檔；index.html 全部載入、沒有例外）',!(O.errs||[]).length&&!(N.errs||[]).length,sample((O.errs||[]).concat(N.errs||[])));
{ const wlo=lits(gitShow(BASE,'src/legal3d.js')).filter(wrapped), wln=lits(cur('src/legal3d.js')).filter(wrapped);
  check('39. BASE legal3d.js 整句「…」的字串＝這 36 句（13 張表）＋給玩家選的 4 個（'+OPT4.join('')+'）',J(wlo)===J(OLDS.concat(OPT4)),J(wlo));
  check('39. 現在 legal3d.js 整句「…」的只剩給玩家選的 4 個（GM.choose 的選項照留）',J(wln)===J(OPT4),J(wln));
  const fo=KO?flat(KO):[], fn=KN?flat(KN):[];
  check('39. 36 句在 13 張表裡的位置（表、出題的人）：BASE 和這一批的單子一模一樣；現在同一個位置是拿掉外面那一對的字',J(fo)===J(OLD36)&&J(fn)===J(OLD36.map(([n,k,t])=>[n,k,unq(t)])),J([fo.length,fn.length]));
  check('39. 子程序讀到的表（BASE／現在）和原始碼一樣',J(O.kitFlat)===J(fo)&&J(N.kitFlat)===J(fn));
  /* LEGAL.ask：表上的句子都經過 say（who＝{name:byName}）*/
  const LG=noComments(cur('src/legal3d.js'));
  check('39. LEGAL.ask：說的人 who＝{name:SOCIAL.displayName(by)}，say(t)＝GM.say(who,t)；13 張表只在 say(…) 和 table 那一行用',
    /const byName=SOCIAL\.displayName\(by\);/.test(LG)&&/const who=\{name:byName,/.test(LG)&&/const say=\(t,expr\)=>\{[^}]*return GM\.say\(who,t,/.test(LG)&&
    TABLES.every(n=>{ const uses=LG.split('\n').filter(l=>new RegExp('\\b'+n+'\\b').test(l)&&!new RegExp('^  const '+n+'=').test(l)); return uses.length>=1&&uses.every(l=>/const table=|await say\(/.test(l)); }));
  /* 演出來：36 句都演到、都是有名字的人說的（名字＝SOCIAL.displayName(by)）*/
  const seen={o:new Set(),n:new Set()}, noName=[];
  for(const [P,F,s] of [[O.play||{},FO,seen.o],[N.play||{},FN,seen.n]]) for(const k of Object.keys(P)){ if(!/^(legal|synth)_/.test(k)) continue; const p=P[k];
    for(const [who,t] of p.lines||[]){ const hit=F.get(t); if(!hit) continue; for(const [i] of hit) s.add(i); if(!who||who!==p.byName) noName.push(k+'：'+J([who,t])); } }
  check('39. 演出來（第 43 項那些）：36 句每一句 BASE、現在都演到了',seen.o.size===36&&seen.n.size===36,J([seen.o.size,seen.n.size,OLD36.filter((x,i)=>!seen.n.has(i)).map(x=>x[2])]));
  check('39. 演出來：36 句每一次都是有名字的人說的（對話框的名字＝出題的人 SOCIAL.displayName(by)：林教授、周教授、柏翰、學姊…）',noName.length===0,sample(noName));
  /* STYLE：12 位，11 位整句「…」，鄭教授不是 */
  const T0='（主題）', sw=SO?STYLE_P.filter(p=>wrapped(SO[p](T0)[0])):[], sz=SO?SO.prof_zheng(T0)[0]:'';
  console.log('（39. STYLE 開場：'+(SO?STYLE_P.map(p=>p+'＝'+SO[p](T0)[0]).join('／'):'')+'）');
  check('39. classes3d.js STYLE 12 位的開場：11 位整句「…」（鄭教授「「我先畫張圖。」黑板上…」不是整句一對＝不動，列給 AA-B）；STYLE、GENERAL 的字 BASE 和現在一樣',
    !!SO&&!!SN&&J(STYLE_P.slice().sort())===J(Object.keys(SO).sort())&&sw.length===11&&!sw.includes('prof_zheng')&&/^「我先畫張圖。」黑板上/.test(sz)&&STYLE_P.every(p=>J(SO[p](T0))===J(SN[p](T0))&&J(SO[p]('甲「乙」'))===J(SN[p]('甲「乙」')))&&
    /const GENERAL=t=>\['老師今天上'\+t\+'。','旁邊的人打了一個呵欠，又趕快坐直。'\];/.test(cur('src/classes3d.js')),J(sw));
  /* 每一堂課的 ct.line：整句「…」的只有 STYLE 那 11 位（教授在場那一條路 S.unq 只會動到這些）*/
  const rows=(N.content||[]), rowsA=(N.contentAll||[]).filter(r=>r[4]!=='err'), bad=[];
  for(const r of rows){ const [d,cid,w,p,line,b,t]=r; const isStyle=b==='style'; if(isStyle&&SO&&line!==SO[p](t)[0]) bad.push('STYLE 不是 '+cid+' w'+w); if(wrapped(line)!==(isStyle&&p!=='prof_zheng')) bad.push(cid+' w'+w+' '+b+'：'+line); }
  for(const r of rowsA){ const [cid,w,p,line,b,t]=r; if(b==='style'&&SO&&line!==SO[p](t)[0]) bad.push('STYLE 不是 '+cid+' w'+w); if(wrapped(line)!==(b==='style'&&p!=='prof_zheng')) bad.push(cid+' w'+w+' '+b+'：'+line); }
  const stN=rows.filter(r=>r[5]==='style'), stA=rowsA.filter(r=>r[4]==='style');
  console.log('（39. 課表上的 '+rows.length+' 堂（不含考試）走 STYLE 的 '+stN.length+' 堂：'+[...new Set(stN.map(r=>r[3]+' '+r[1]))].join('、')+'；每一門課 × 16 週 '+rowsA.length+' 個裡走 STYLE 的 '+stA.length+' 個：'+[...new Set(stA.map(r=>r[2]+' '+r[0]))].join('、')+'）');
  check('39. 每一堂課的教授那一句（ct.line；課表上的 '+rows.length+' 堂、每一門課 × 16 週 '+rowsA.length+' 個）：整句「…」的就是走 STYLE 的那幾堂（鄭教授以外），syllabus、台詞池、第二格、GENERAL 沒有；BASE 和現在一字不差',
    rows.length>500&&rowsA.length>500&&stN.length>0&&stA.length>0&&bad.length===0&&J(O.content)===J(N.content)&&J(O.contentAll)===J(N.contentAll),sample(bad)); }

/* ---------- 40. 表和 BASE 逐句比；36 句 × 84 題填完 ---------- */
if(KO&&KN){ const fo=flat(KO), fn=flat(KN), bad=[], dot={}, dotBad=[];
  if(fo.length!==fn.length) bad.push('句數 '+fo.length+' → '+fn.length);
  fo.forEach(([n,k,t],i)=>{ const [n2,k2,t2]=fn[i]||[]; if(n!==n2||k!==k2) bad.push('位置不同 '+i); if(!wrapped(t)||unq(t)!==t2) bad.push(n+'：'+t+' → '+t2); });
  check('40. 13 張表（'+fo.length+' 句）：結構（表、出題的人、順序）和 '+BASE+' 一樣，每一句只差外面那一對「」',fo.length===36&&bad.length===0,sample(bad));
  const bad2=[]; let nq=0;
  fo.forEach(([n,k,t],i)=>{ const tn=fn[i][2]; for(const q of QB){ const a=KO.fill(t,q), b=KN.fill(tn,q); nq++;
      if(!wrapped(a)) bad2.push('BASE 填完不是整句一對：'+a);
      if(b!==xform(a,tn)) bad2.push(n+' '+q.id+'：'+a+' → '+b);
      if(tn.includes('{q}')&&!b.includes(q.q)) bad2.push('題目字不見了 '+q.id);
      if(tn.includes('{stmt}')&&!b.includes(KO.stmt(q))) bad2.push('題目字不見了 '+q.id);
      if(tn.includes('{core}')&&!b.includes(KO.coreText(q))) bad2.push('答案字不見了 '+q.id);
      if(b!==unq(a)){ dot[n]=(dot[n]||0)+1; if(b!==unq(a)+'。'||!/\{core\}$/.test(tn)||/。。$/.test(b)) dotBad.push(n+' '+q.id+'：'+b); } } });
  check('40. 36 句 × 84 題（'+nq+' 句）填完：現在＝BASE 拿掉外面那一對（句尾是答案、填完沒有標點的那幾句再補一個「。」），題目字（q.q、stmt）、答案字（coreText）一字不差',nq===36*84&&bad2.length===0,sample(bad2));
  console.log('（40. 補了「。」的：'+J(dot)+'；句尾是答案的 '+CORE_END.length+' 句：'+CORE_END.join('／')+'）');
  check('40. 補「。」：只有句尾是答案的那 9 句（CLASS_BAD 4、CLASS_UNSURE 2、MATE_BAD 3），84 題每一題都補（題庫的答案結尾都不是標點：core 的「。」coreText 本來就拿掉、選項沒有標點），補一個、沒有「。。」',
    CORE_END.length===9&&J(dot)===J({CLASS_BAD:4*84,CLASS_UNSURE:2*84,MATE_BAD:3*84})&&dotBad.length===0,sample(dotBad)+J(dot));
  check('40. stmt、coreText 和 BASE 一樣（題目、答案怎麼拿沒改；只有 fill 最後補標點）',J(QB.map(q=>[KO.stmt(q),KO.coreText(q)]))===J(QB.map(q=>[KN.stmt(q),KN.coreText(q)])));
  /* (a)(b) 直接看：沒有標點的答案、core 本來有「。」的 */
  const q16=QB.find(q=>q.id==='Q016'), q1=QB.find(q=>q.id==='Q001'), bd=fn.filter(x=>x[0]==='CLASS_BAD'&&x[1]==='prof_lin')[0][2];
  const a16=KN.fill(bd,q16), a1=KN.fill(bd,q1);
  check('40. (a) 答案沒有標點（Q016 選項「'+q16.options[q16.answer]+'」）：「'+a16+'」結尾剛好一個「。」；BASE 是「'+KO.fill(OLD36[9][2],q16)+'」',/強化法律上防禦能力。$/.test(a16)&&!/。。$/.test(a16)&&KO.fill(OLD36[9][2],q16).endsWith('強化法律上防禦能力」'),a16);
  check('40. (b) 題庫 core 本來結尾有「。」（Q001「'+q1.core+'」）：「'+a1+'」只有一個「。」（沒有「。。」）',a1.endsWith(q1.core)&&!/。。$/.test(a1),a1); }

/* ---------- 41. 原始碼逐行比（這一個 commit 本身）---------- */
const findC8=()=>{ try{ const L=cp.execFileSync('git',['-C',ROOT,'log','--format=%H %s','-F','--grep='+TITLE],{encoding:'utf8',maxBuffer:1<<26}).split('\n'); const x=L.find(l=>l.slice(41).startsWith(TITLE)); return x?x.slice(0,40):null; }catch(e){ return null; } };
{ const C8=findC8(), A_=f=>C8?gitShow(C8+'^',f):gitShow(BASE,f), B_=f=>C8?gitShow(C8,f):cur(f);
  console.log('（41. 比的是 '+(C8?'第八批那一個 commit '+C8.slice(0,9)+'^ → '+C8.slice(0,9):'commit 以前：'+BASE+' → 現在的檔')+'）');
  const files=(C8?cp.execFileSync('git',['-C',ROOT,'diff','--name-only',C8+'^',C8,'--','src'],{encoding:'utf8'}):cp.execFileSync('git',['-C',ROOT,'diff','--name-only',BASE,'--','src'],{encoding:'utf8'})).split('\n').filter(Boolean).sort();
  check('41. 改到的 src 檔就是這 '+CHANGED.length+' 個（'+CHANGED.join('、')+'）',J(files)===J(CHANGED.slice().sort()),J(files));
  const split=l=>{ const code=[], lit=[]; let last=0, m; LIT.lastIndex=0; while((m=LIT.exec(l))){ code.push(l.slice(last,m.index)); lit.push(m[1]); last=m.index+m[0].length; } code.push(l.slice(last).replace(/\s+$/,'')); return {code,lit}; };
  const nonBlank=s=>blankComments(s).split('\n').map(l=>l.replace(/\s+$/,'')).filter(l=>l.trim());
  /* legal3d.js */
  { const A=nonBlank(A_('src/legal3d.js')), B=nonBlank(B_('src/legal3d.js')), bad=[], got=[];
    const iIns=B.indexOf(LEGAL_INS), B2=B.filter((l,i)=>i!==iIns);
    if(iIns<0||B.filter(l=>l===LEGAL_INS).length!==1) bad.push('END_P 那一行不是剛好一行'); else if(B[iIns+1]!==LEGAL_FILL[1]) bad.push('END_P 那一行不在 fill 前面');
    if(A.length!==B2.length) bad.push('註解以外的行數 '+A.length+' → '+B2.length+'（多一行 END_P 以外）');
    else { let nl=0; A.forEach((a,i)=>{ const b=B2[i]; if(a===b) return; nl++;
      if(a===LEGAL_FILL[0]){ if(b!==LEGAL_FILL[1]) bad.push('fill 那一行不是這一批的改法'); return; }
      const x=split(a), y=split(b); if(J(x.code)!==J(y.code)){ bad.push('「'+a.trim().slice(0,40)+'」程式（字串以外）不一樣'); return; } if(x.lit.length!==y.lit.length){ bad.push('字串個數不一樣'); return; }
      if(!TABLES.some(n=>a.startsWith('  const '+n+'='))) bad.push('不是那 13 張表的一行：'+a.slice(0,40));
      x.lit.forEach((s,k)=>{ const t=y.lit[k]; if(s===t) return; if(wrapped(s)&&unq(s)===t&&OLDS.includes(s)) got.push(s); else bad.push('「'+s.slice(0,20)+'」→「'+t.slice(0,20)+'」不是這一批的那幾句'); }); });
      if(nl!==14) bad.push('改了 '+nl+' 行（要 13 張表＋fill）'); }
    check('41. legal3d.js：註解以外，多了 END_P 一行（在 fill 前面）、fill 那一行換成「結尾不是標點才補「。」」、13 張表那 13 行只拿掉 36 句外面那一對「」（字串以外一字不差），其他一字不差',
      !bad.length&&J(got.slice().sort())===J(OLDS.slice().sort()),sample(bad)+' '+got.length); }
  /* classes3d.js */
  { const A=nonBlank(A_('src/classes3d.js')), B=nonBlank(B_('src/classes3d.js')), bad=[];
    const iIns=B.indexOf(CLS_INS), B2=B.filter((l,i)=>i!==iIns);
    if(iIns<0||B.filter(l=>l===CLS_INS).length!==1) bad.push('S.unq 那一行不是剛好一行'); else if(!/^  const GENERAL=t=>/.test(B[iIns-1])) bad.push('S.unq 那一行不在 GENERAL 後面');
    const used=A.filter(l=>l.includes(CLS_REP[0])).length, rep=l=>l.split(CLS_REP[0]).join(CLS_REP[1]);
    check('41. classes3d.js：註解以外，多了 S.unq 一行（在 STYLE、GENERAL 後面；同 invites3d.js、libquiet3d.js 的 S.unq）、教授那一句換成「在場＝S.unq(ct.line)、不在場＝名字：ct.line（和原本一字不差）」，其他一字不差',
      !bad.length&&used===1&&A.length===B2.length&&J(A.map(rep))===J(B2),sample(bad)+' '+J([A.length,B.length,used])); }
  /* 2026-11-11：syllabus.js 重匯（大一上三科課堂內容補寫，AA d3a22505b、BB_332～334）、exam_bank.js 重匯（CRIM45_33 加 askedIn，AA 869834859）——這兩個檔不再比整檔（舊期望：三個檔 md5 都和 BASE 一樣）；
     改成：legal_qbank.js 整檔不變；exam_bank.js 在 BASE 就有的題，題目、選項、答案一字不差（D12） */
  const frozen=['src/data/legal_qbank.js'];
  let fd=cp.execFileSync('git',['-C',ROOT,'diff','--name-only',BASE,'--',...frozen],{encoding:'utf8'}).trim();
  { const qs=src=>{ const m={}; for(const q of (new Function(src.replace(/^const EXAM_BANK\s*=/m,'return ')))().questions) m[q.id]=J([q.q,q.options,q.answer]); return m; };
    const a0=qs(gitShow(BASE,'src/data/exam_bank.js')), b0=qs(cur('src/data/exam_bank.js')); const ch=Object.keys(a0).filter(k=>a0[k]!==b0[k]); if(ch.length) fd=(fd?fd+' ':'')+'exam_bank 題目／選項／答案變了：'+ch.slice(0,5).join(','); }
  const md5=s=>crypto.createHash('md5').update(s).digest('hex'), mm=frozen.map(f=>md5(cur(f))===md5(gitShow(BASE,f)));
  check('41. (c) 題庫一字不差：legal_qbank.js 的 md5 和 '+BASE+' 一樣（git diff 也沒有）、exam_bank.js 原有的題目選項答案都沒改（2026-11-11 起；syllabus.js 已重匯不再比）；子程序演完 QBANK 還是 84 題（測試題拿掉了）',!fd&&mm.every(Boolean)&&(N.qbankN===84)&&(O.qbankN===84),fd+J(mm)+J([O.qbankN,N.qbankN])); }

/* ---------- 42. 讀書區：加（小聲）的時候先拿掉外面的「」——BASE 的字、現在的字加完一樣（補了「。」的只差那一個「。」）---------- */
{ const qo=O.quiet||[], qn=N.quiet||[], bad=[];
  if(qo.length!==qn.length) bad.push('個數 '+qo.length+' → '+qn.length);
  else qo.forEach((a,i)=>{ const b=qn[i]; const dotted=/\{core\}$/.test(b[2])&&KO&&!END_P.test(unq(KO.fill(a[2],QB.find(q=>q.id===a[3])))); if(a[3]!==b[3]||(dotted?b[4]!==a[4]+'。':b[4]!==a[4])||!/^（小聲）/.test(b[4])) bad.push(J([a,b])); });
  check('42. LIBQ.quiet：36 句 × 84 題（'+qn.length+' 句）BASE「…」和現在加完一樣（補了「。」的那幾句只差最後那一個「。」），都加了（小聲）',qn.length===36*84&&bad.length===0,sample(bad));
  const qs=N.quietStyle||[];
  check('42. LIBQ.quiet：STYLE 的開場（'+qs.length+' 句）BASE「…」和拿掉外面那一對以後加完一樣',qs.length>0&&qs.every(x=>x[1]===x[2]&&/^（小聲）/.test(x[1])),J(qs.slice(0,2))); }

/* ---------- 43. 演出來：BASE 和現在各跑一次 ---------- */
const PO=O.play||{}, PN=N.play||{};
const cmpLegal=(A,B)=>{ const r={bad:[],n:0,dot:0}; A=A||[]; B=B||[];
  if(A.length!==B.length) r.bad.push('句數 '+A.length+' → '+B.length);
  else A.forEach((a,i)=>{ const b=B[i]; if(a[0]!==b[0]){ r.bad.push('說的人不一樣：'+J(a)+' → '+J(b)); return; } if(a[1]===b[1]) return; if(!b[0]){ r.bad.push('沒有名字的句子改了：'+J(a)+' → '+J(b)); return; }
    const ho=FO.get(a[1]); if(!ho){ r.bad.push('不是 36 句之一：'+J(a)+' → '+J(b)); return; } const ok=ho.some(([ti,qid])=>{ const tn=flat(KN)[ti][2]; return b[1]===xform(a[1],tn); }); if(!ok){ r.bad.push(J(a)+' → '+J(b)); return; } r.n++; if(b[1]!==unq(a[1])) r.dot++; });
  return r; };
{ const per={}, bad=[], libBad=[]; let nRun=0, nCh=0, nDot=0;
  for(const [ctx,by] of COMBOS) for(const qid of QIDS) for(const res of RES){ for(const sd of SEEDS){ const k=['legal','out',ctx,by,qid,res,sd].join('_'), P=PN[k]||{}, Q=PO[k]||{}; nRun++;
      const r=cmpLegal(Q.lines,P.lines); nCh+=r.n; nDot+=r.dot; per[ctx+'/'+by]=(per[ctx+'/'+by]||0)+r.n;
      if(r.bad.length||J(P.asked)!==J([qid])||J(Q.asked)!==J([qid])||P.result!==res||Q.result!==res||!(P.lines||[]).length) bad.push(k+'：'+sample(r.bad)+J([P.asked,P.result])); }
    const kl=['legal','lib',ctx,by,qid,res,1].join('_'), L=(PN[kl]||{}).lines||[], Lo=(PO[kl]||{}).lines||[];
    const sameLib=L.length===Lo.length&&L.every((x,i)=>x[0]===Lo[i][0]&&(x[1]===Lo[i][1]||(x[1]===Lo[i][1]+'。'&&!END_P.test(Lo[i][1])&&/^（小聲）/.test(Lo[i][1]))));   /* 補了「。」的只差最後那一個 */
    if(!L.length||!sameLib||!L.some(x=>/小聲/.test(x[1]))) libBad.push(kl+'：'+J([Lo,L]).slice(0,300)); }
  console.log('（43. LEGAL.ask 讀書區外 '+nRun+' 次：改了 '+nCh+' 句（其中補「。」'+nDot+' 句）；每一種 '+J(per)+'）');
  check('43. LEGAL.ask 八種（課堂：林教授、周教授、柏翰；讀書會：學姊、柏翰；小考、同學、研究室：林教授）× 五題（Q001、Q002、Q004、Q016、Q017）× 答對／答錯／不確定 × 4 個亂數：說的人和 BASE 一樣、問的題一樣、結果一樣；不一樣的只有 36 句那幾句（只差外面那一對，句尾是答案的補一個「。」），題目、選項一字不差',
    nRun===COMBOS.length*QIDS.length*RES.length*SEEDS.length&&bad.length===0&&nCh>nRun&&nDot>0,sample(bad));
  check('43. LEGAL.ask 在讀書區（總圖 3F；'+COMBOS.length*QIDS.length*RES.length+' 種）：和 BASE 一樣（（小聲）加上去的時候本來就拿掉外面的「」；補了「。」的只差那一個），都加了（小聲）',libBad.length===0,sample(libBad));
  /* (a)(b)(d)：答錯、不確定那一句的結尾 */
  const endOf=(k,re)=>((PN[k]||{}).lines||[]).filter(x=>re.test(x[1])).map(x=>x[1]);
  const a16=endOf('legal_out_class_prof_lin_Q016_bad_1',/強化法律上防禦能力[。」]?$/), a16o=((PO.legal_out_class_prof_lin_Q016_bad_1||{}).lines||[]).filter(x=>/強化法律上防禦能力[。」]?$/.test(x[1])).map(x=>x[1]);   /* 答錯那一句（選項那一句不算：結尾是「你選哪個？」）*/
  check('43. (a) 林教授課堂答錯 Q016（答案＝選項的字「強化法律上防禦能力」，沒有標點）：「'+a16[0]+'」結尾剛好一個「。」；BASE「'+a16o[0]+'」',a16.length===1&&/強化法律上防禦能力。$/.test(a16[0])&&!/。。$/.test(a16[0])&&a16o.length===1&&/強化法律上防禦能力」$/.test(a16o[0]),J([a16,a16o]));
  const ends=[]; for(const k of Object.keys(PN)) if(/^legal_out_.*_(bad|unsure)_/.test(k)){ const p=PN[k]; for(const [w,t] of p.lines||[]){ const h=FN.get(t); if(h&&h.some(([ti])=>/\{core\}$/.test(flat(KN)[ti][2]))) ends.push([k,t]); } }
  check('43. (a)(b) 答錯、不確定、句尾是答案的那幾句（演出來 '+ends.length+' 句；Q001、Q002、Q004 的 core 本來有「。」、Q016、Q017 沒有 core）：結尾都剛好一個「。」，沒有「。。」',ends.length>20&&ends.every(([k,t])=>/[^。]。$/.test(t)),sample(ends.filter(([k,t])=>!/[^。]。$/.test(t)).map(x=>x.join('：'))));
  const sy=[], syBad=[]; for(const s of SYNTH) for(const [ctx,by] of [['class','prof_lin'],['class','classmate_bohan'],['classmate','prof_lin']]) for(const res of ['bad','unsure']) for(const sd of SEEDS){ const k=['synth',s.id,ctx,by,res,sd].join('_'), P=PN[k]||{}, Q=PO[k]||{}; const r=cmpLegal(Q.lines,P.lines);
      if(r.bad.length||J(P.asked)!==J([s.id])) syBad.push(k+'：'+sample(r.bad)); for(const [w,t] of P.lines||[]){ const h=FN.get(t); if(h&&h.some(([ti,qid])=>qid===s.id&&/\{core\}$/.test(flat(KN)[ti][2]))) sy.push([s.id,t]); } }
  const want={QB8_DOT:'答案是 A、選項甲。',QB8_QM:'答案是 A、選項甲？',QB8_CLOSE:'核心是「引號」',QB8_CORE:'核心句子。'};   /* 結尾就是答案本身（沒有多補）*/
  const syW=sy.filter(([id,t])=>!t.endsWith(want[id])||/。。$/.test(t)||/[。？」]。$/.test(t));
  console.log('（43. 測試題：'+[...new Set(sy.map(x=>x[1]))].join('／')+'）');
  check('43. (b) 答案結尾已經是標點的不補（測試題：選項「選項甲。」「選項甲？」、core「核心是「引號」」）、core 本來有「。」的只有一個（「核心句子。」）；說的人和 BASE 一樣',
    syBad.length===0&&SYNTH.every(s=>sy.some(x=>x[0]===s.id))&&syW.length===0,sample(syBad.concat(syW.map(x=>x.join('：'))))); }
/* 上課 */
{ const done=[], bad=[];
  for(const p of STYLE_P){ const ko='cls_'+p+'_out', ki='cls_'+p+'_in', Oo=PO[ko]||{}, No=PN[ko], Oi=PO[ki]||{}, Ni=PN[ki]||{}; if(!No){ continue; } done.push(p);   /* 陳教授沒有開課（courses.js 沒有 prof_chen）＝STYLE 那一句演不到，只在第 39 項看字 */
    if(J(No.lines)!==J(Oo.lines)||!(No.lines||[]).length) bad.push(p+' 不在場不一樣：'+J([Oo.lines,No.lines]));
    if((No.asked||[]).length||(Ni.asked||[]).length) bad.push(p+' 有出題（這一堂不能拿來比）');
    const st=SO&&SO[p](No.topic)[0], A=Oi.lines||[], B=Ni.lines||[]; if(!B.length||A.length!==B.length){ bad.push(p+' 在場句數 '+A.length+' → '+B.length); continue; }
    const diff=A.map((a,i)=>[a,B[i]]).filter(([a,b])=>J(a)!==J(b));
    if(No.branch!=='style'||Ni.branch!=='style') bad.push(p+' 不是走 STYLE');
    const absLine=(No.lines||[]).find(x=>x[0]===null&&x[1].endsWith('：'+st)); if(!absLine) bad.push(p+' 不在場：找不到「老師：「…」」那一句（對話框沒名字）');
    if(p==='prof_zheng'){ if(diff.length) bad.push(p+' 在場不該改：'+J(diff)); continue; }
    if(diff.length!==1) { bad.push(p+' 在場改了 '+diff.length+' 句：'+J(diff)); continue; }
    const [[wa,ta],[wb,tb]]=diff[0]; if(ta!==st||tb!==unq(st)||wa!==wb||!wb||wb!==Ni.profName) bad.push(p+' 在場：'+J(diff[0])); }
  console.log('（43. 上課演到的教授：'+done.join('、')+'；'+done.map(p=>p+(PN['cls_'+p+'_in']||{}).branch).length+' 位）');
  // CANON-NO-ECON-1112：經濟系那一年拿掉（黃教授（prof_huang）唯一的課是經濟系大一下的法學緒論，拿掉以後演到的教授 11 位→10 位）
  check('43. 上課沒有 syllabus（走 STYLE）的那一堂，教授不在場：和 BASE 一字不差（「周老師：「今天講…」」對話框沒有名字、照留）',done.length>=10&&!bad.some(b=>/不在場/.test(b)),sample(bad));
  check('43. 教授在場：說的人是教授（對話框＝'+done.filter(p=>p!=='prof_zheng').map(p=>(PN['cls_'+p+'_in']||{}).profName).join('、')+'），只有開場那一句只差外面那一對「」，其他一字不差；鄭教授那一句（不是整句一對）一字不差',
    done.length>=10&&done.includes('prof_zheng')&&bad.length===0,sample(bad)); }

/* ---------- 44. 存檔 ---------- */
{ const so=O.save||{}, sn=N.save||{}, ks=Object.keys(sn), bad=ks.filter(k=>!so[k]||so[k].md5!==sn[k].md5);
  /* 改到的句子（演出來不一樣的那幾句）不在存檔裡 */
  const ch=[]; for(const k of ks){ const A=(PO[k]||{}).lines||[], B=(PN[k]||{}).lines||[]; A.forEach((a,i)=>{ const b=B[i]; if(b&&a[1]!==b[1]){ if((so[k].has||[]).includes(a[1])) ch.push(k+'：'+a[1]); if((sn[k].has||[]).includes(b[1])) ch.push(k+'：'+b[1]); } }); }
  check('44. 每一段演完，存檔和 BASE 一模一樣（'+ks.length+' 種情境，md5 一樣）',ks.length>=500&&J(Object.keys(so).sort())===J(ks.slice().sort())&&bad.length===0,sample(bad.map(k=>k+J([so[k],sn[k]]))));
  check('44. 改到的句子（BASE、現在的字）都不在存檔裡＝不用換記號',ch.length===0,sample(ch));
  /* 36 句在 src 只在 legal3d.js（舊的字沒有了）；「很好。」別的檔也有，是各自的台詞（明軒、品妤、可昕、成績的等級字…），沒有拿 LEGAL 說的話比對 */
  const LIT2=/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g, allLits=s=>{ const o=[]; let m; LIT2.lastIndex=0; while((m=LIT2.exec(s))) o.push(m[1]!=null?m[1]:(m[2]!=null?m[2]:m[3])); return o; };
  const hits=[]; (function walk(d){ for(const f of fs.readdirSync(path.join(ROOT,d)).sort()){ const p=d+'/'+f; if(fs.statSync(path.join(ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)){ const L=allLits(noComments(cur(p))); OLDS.forEach((t,i)=>{ for(const x of [t,NEWS[i]]){ const n=L.filter(y=>y===x).length; if(n) hits.push([i,p,x,n]); } }); } } })('src');
  const okNew=OLDS.every((t,i)=>{ const h=hits.filter(x=>x[0]===i&&x[1]==='src/legal3d.js'); return h.length===1&&h[0][2]===NEWS[i]&&h[0][3]===1; });
  const others=hits.filter(x=>x[1]!=='src/legal3d.js'), okOthers=others.every(x=>x[2]==='很好。'||x[2]==='「很好。」');
  const cmpUse=fs.readdirSync(path.join(ROOT,'src')).filter(f=>/\.js$/.test(f)).filter(f=>/(===|!==|==)\s*'很好。'|'很好。'\s*(===|!==|==)|\.includes\('很好。'\)|indexOf\('很好。'\)/.test(noComments(cur('src/'+f))));
  console.log('（44. legal3d.js 以外也有的：'+others.map(x=>x[1]+' '+x[2]+'×'+x[3]).join('、')+'）');
  check('44. 36 句在 src（註解以外的字串常值）：legal3d.js 裡現在的字各一次、BASE 的字沒有了；別的檔只有「很好。」（各自的台詞），沒有程式拿它比對',okNew&&okOthers&&!hits.some(x=>x[1]==='src/legal3d.js'&&x[2]===OLDS[x[0]])&&cmpUse.length===0,sample(hits.map(x=>x[1]+'：'+x[2]))+J(cmpUse));
  const SM=noComments(cur('src/story3d.js'));
  check('44. 讀檔換記號（STORY.smallQuoteMigrate）不用改：story3d.js、game3d.js 這一批沒動',!CHANGED.includes('src/story3d.js')&&!CHANGED.includes('src/game3d.js')&&/S\.smallQuoteMigrate=function\(s\)\{/.test(SM)); }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}

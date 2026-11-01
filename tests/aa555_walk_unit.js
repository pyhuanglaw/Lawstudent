// AA_555（企劃線 56c11668d；AA555-WALK-TALK-1031）× AA_118：AA 六位的同行聊天（每人每學年 6 句）、手機小事（每人每學期 2 則）——不需要瀏覽器。用法：node tests/aa555_walk_unit.js
//   0 讀稿：AA_118 第 2 節（同行聊天表）、第 3 節（手機小事表）、AA_555 第 1、2 節（改稿）、AA_185 3-14（以安交換說明會那句的新寫），照稿算出每人每學年／每學期應該有的句子
//   1 同行聊天：src/data/invites.js 的 walk118 每一句逐字＝稿（AA_555 有列的照「改」，沒列的照 AA_118，小語→Alison）；AA_555 刪掉的句子不在；每人每學年的句數照稿
//   2 同行聊天的條件真的跑：把四年每一天（早、傍晚、晚上）×三種玩家狀態跑一遍每一句的 if，每一句都在稿上的那一學年出現得了、別的學年不會出現
//   3 S.walkPick：AA_118 的句子和 AA_70 原有的一起輪、每句只說一次（G.flags.walkSaid）、目的地對得上才說、Alison 的 BREAKFAST_YU 先說「欸，今天也經過！」、經濟系那一年沒有
//   4 手機小事：src/aa555_3d.js（每天的手機小事＋固定日子）＋r3_3d.js（Alison 大三中秋）＋story3d.js（柏翰 han3_chart）每一則逐字＝稿、在稿上的那個學期；沒接的五則列出來
//   5 手機小事的條件真的跑：每天的手機小事四年每一天跑 term＋ok，只在稿上那個學期；固定日子在那個學期
//   6 真的收到：dailyPhone（一天一則、第 4 週起、每則一次）、固定日子（PHONE.at）、「隔天」「三週後」的第二則、人在日本照當地時間、路線條件
// 修改前（開發分支 f49a7c017）：第 0 節以外每一節都 FAIL（walk118、src/aa555_3d.js 都還沒有）。
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
GM.toast=()=>{}; GM.caption=()=>{};
const loadErr=[];
const L3=(f,exp)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const (\w+)\s*=/mg,(m,n)=>exp.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(s,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
L3('src/r3_3d.js',/^R3$/); L3('src/aa555_3d.js',/^AA555$/);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const git=p=>{ try{ return cp.execSync('git -c core.quotepath=false show 56c11668d:"'+p+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const ls=()=>{ try{ return cp.execSync('git -c core.quotepath=false ls-tree -r --name-only 56c11668d -- docs/story_planning',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}).split('\n'); }catch(e){ return []; } };
const files=ls(), fOf=re=>files.find(f=>re.test(f))||'';
const A118=git(fOf(/AA_118_/)), A555=git(fOf(/AA_555_/)), A185=git(fOf(/AA_185_/));

/* ================= 0 讀稿 ================= */
const NM={'阿哲':'zhe','Alison':'yu','許柏翰':'classmate_bohan','柏翰':'classmate_bohan','吳芯慈':'classmate_xinci','芯慈':'classmate_xinci','陳語彤':'heroine_03','語彤':'heroine_03','以安':'heroine_01','沈以安':'heroine_01'};
const NAME=new Proxy(NM,{get:(o,k)=>typeof k==='string'?o[k.replace(/（.*$/,'')]:undefined});   /* 標題「沈以安（新版，`AA_113`）」「Alison（原「小語」…）」：括號以前是名字 */
const YN={'大一':1,'大二':2,'大三':3,'大四':4};
const cells=l=>l.split('|').slice(1,-1).map(x=>x.trim());
const between=(s,a,b)=>{ const i=s.indexOf(a); if(i<0) return ''; const j=b?s.indexOf(b,i+a.length):-1; return s.slice(i,j<0?undefined:j); };
const quoteSpan=s=>{ const i=s.indexOf('「'), j=s.lastIndexOf('」'); return i<0||j<i?'':s.slice(i,j+1); };
const pref=s=>{ const q=quoteSpan(s); return q?q.slice(1,-1).replace(/……$/,''):''; };
/* AA_118 第 2 節 */
const W118={};   /* id → [{y, timing, text}] */
{ const s=between(A118,'## 2. 同行聊天','## 3. 手機小事池'); let cur=null;
  for(const l of s.split('\n')){ const m=/^### 2-\d\. (\S+)/.exec(l); if(m){ cur=NAME[m[1]]; continue; } if(!cur||!/^\| 大/.test(l)) continue; const c=cells(l); (W118[cur]||(W118[cur]=[])).push({y:YN[c[0]],timing:c[1],text:c[2]}); } }
/* AA_555 第 1 節 */
const M555={}, DEL555=[];
{ const s=between(A555,'## 1. 同行聊天','## 2. 手機小事'); let cur=null, xc=false;
  for(const l of s.split('\n')){ const m=/^### 1-\d\. (\S+)/.exec(l); if(m){ cur=NAME[m[1]]; xc=cur==='classmate_xinci'; continue; }
    if(/^- 刪掉的原句/.test(l)){ for(const q of l.match(/「[^」]*」/g)||[]) DEL555.push(q.slice(1,-1)); continue; }
    if(!cur||!/^\| 大/.test(l)) continue; const c=cells(l); (M555[cur]||(M555[cur]=[])).push(xc?{y:YN[c[0].slice(0,2)],timing:c[1],text:c[2]}:{y:YN[c[0].slice(0,2)],orig:c[1],text:c[2]}); } }
const AN185=(/`AA_118` 那句改成（新寫）：(「[^」]*」)/.exec(A185)||[])[1]||'';
/* 照稿算出最後的句子：{id: [{y, text, variants?}]} */
const EXP={}, UNMATCHED=[];
for(const id in W118){ const rows=W118[id].map(r=>Object.assign({},r)), mods=M555[id]||[];
  if(id==='classmate_xinci'){ const out=[];   /* AA_555 1-4：整張表重排（照原句的從 AA_118 找）*/
    for(const r of mods){ if(/^照原句/.test(r.text)){ const hint=(/「([^」]*)」/.exec(r.text)||[])[1]; let src=hint?rows.find(x=>x.y===r.y&&x.text.includes(hint.replace(/^……|……$/g,''))):null; if(!src) src=rows.find(x=>x.y===r.y&&x.timing===r.timing); if(!src){ UNMATCHED.push(id+' '+r.timing); continue; } out.push({y:r.y,text:src.text}); }
      else out.push({y:r.y,text:quoteSpan(r.text)}); }
    EXP[id]=out; continue; }
  for(const m of mods){ const p=pref(m.orig); const k=rows.findIndex(x=>!x.done&&x.text.replace(/^（[^）]*）/,'').includes(p)); if(!p||k<0){ UNMATCHED.push(id+' '+m.orig); continue; } rows[k].text=quoteSpan(m.text); rows[k].y=m.y; rows[k].done=true; }
  if(id==='heroine_01'){ const k=rows.findIndex(x=>/交換說明會之後/.test(x.timing)); if(k>=0&&AN185) rows[k].text=AN185; else UNMATCHED.push('以安 AA_185 3-14'); }
  EXP[id]=rows.map(r=>({y:r.y,text:r.text})); }
const splitVar=t=>{ const m=/^有 `([A-Z_]+)`：(「[^」]*」)／沒有：(「[^」]*」)$/.exec(t); return m?[m[2],m[3]]:[t]; };   /* Alison 大四上總圖：有 YU_ALONE／沒有 兩個版本 */
check('0. 稿讀得到（AA_118、AA_555、AA_185 @56c11668d）；模組都載得到',A118.length>10000&&A555.length>4000&&!!AN185&&!loadErr.length,loadErr.join('　')||'git fetch 企劃線（56c11668d）');
check('0. 同行聊天：AA_118 六人各 24 句、AA_555 的改稿每一列都對到原句（芯慈 1-4 整張 24 列）',Object.keys(W118).length===6&&Object.values(W118).every(L=>L.length===24)&&!UNMATCHED.length&&EXP.classmate_xinci&&EXP.classmate_xinci.length===24,J({n:Object.fromEntries(Object.entries(W118).map(([k,v])=>[k,v.length])),UNMATCHED}));
const WALK=(typeof INVITE_DATA!=='undefined'&&INVITE_DATA.walk118)||null;

/* ================= 1 同行聊天：逐字 ================= */
const CH=['zhe','yu','classmate_bohan','classmate_xinci','heroine_03','heroine_01'];
const gameText=id=>{ const by={}; for(const e of ((WALK||{})[id]||[])){ const t=e.l[e.l.length-1]; const L=(by[e.one]||(by[e.one]=[])); if(!L.includes(t)) L.push(t); } return by; };   /* 同一句的幾個版本主句一樣（Alison 大一早上：有沒有 BREAKFAST_YU）＝算一個 */
sec('1',()=>{
  check('1. invites.js 有 walk118（AA 六位）',!!WALK&&CH.every(id=>Array.isArray(WALK[id])),J(WALK&&Object.keys(WALK)));
  for(const id of CH){ const exp=(EXP[id]||[]).map(r=>splitVar(r.text)), by=gameText(id), got=Object.values(by);
    const norm=a=>a.slice().sort().join('｜'), es=exp.map(norm).sort(), gs=got.map(norm).sort();
    check('1. '+id+'：24 句（一句一個 one；有版本的算一句）逐字＝稿',J(es)===J(gs),J({少:es.filter(x=>!gs.includes(x)),多:gs.filter(x=>!es.includes(x))}));
    const inWalk=Object.values((INVITE_DATA.people[id]||{}).walk||{}).flatMap(v=>[].concat(v)).filter(e=>e&&e.one);
    check('1. '+id+'：每一句都真的放進 people.'+id+'.walk（目的地或 any）',inWalk.length===((WALK||{})[id]||[]).length&&inWalk.length>=24,J(inWalk.length)); }
  const all=CH.flatMap(id=>Object.values(gameText(id)).flat());
  check('1. AA_555 刪掉的原句（芯慈 8 句＋各人換掉的）都不在：「我最怕例外」「以安又是第一」「第一名」「恭喜，妳本來就可以」「雙主修改成輔系了」、模擬法庭、三件事、芷若說英國、阿嬤又來問那棵樹',
    !all.some(t=>/我最怕例外|以安又是第一|第一名|妳本來就可以|雙主修改成輔系|模擬法庭|三件事|芷若說英國|芷若那邊下雨|那棵樹|平均七十一|法服第一次值班|我不能接阿姨的案子/.test(t))&&DEL555.length>=7&&DEL555.every(q=>!all.some(t=>t.includes(q))),J(all.filter(t=>/最怕例外|第一名|模擬法庭|三件事/.test(t))));
  check('1. 「小語」都換 Alison（Alison 和中文之間空一格）',!all.some(t=>/小語/.test(t))&&all.filter(t=>/Alison/.test(t)).length===2&&all.every(t=>!/Alison[^\s」，。]/.test(t)),J(all.filter(t=>/Alison|小語/.test(t)))); });

/* ================= 2 同行聊天：條件真的跑 ================= */
const yOf=d=>{ const x=CALENDAR.dateOf(d); return x.y-(x.m>=9?2024:2025); };
const ALL_EV=[...new Set((fs.readFileSync(path.join(H.ROOT,'src/data/invites.js'),'utf8').split('AA_118 第 2 節「一起走路聊什麼」')[1]||'').concat(fs.existsSync(path.join(H.ROOT,'src/aa555_3d.js'))?fs.readFileSync(path.join(H.ROOT,'src/aa555_3d.js'),'utf8'):'').match(/'ev_[a-z0-9_]+'/g)||[])].map(x=>x.slice(1,-1));   /* 兩段程式裡用到的事件 */
const MEMS=[['yu','BREAKFAST_YU'],['yu','YU_ALONE'],['yu','YU_CLUB_BEAR'],['heroine_03','RENT_CONSULTATION'],['heroine_03','LAW_MEETS_LIFE']];
const NOTDONE=['ev_yu_together','ev_zhe_deposit','ev_bohan_third_floor','ev_an_dorm_appeal_result','ev_yt_moon','ev_yt_ta_news_lib'];
const STATE=(kind,route)=>{ const G=H.fresh('2025-09-01',10,'campus',{}); G.contacts={}; for(const id of CH) G.contacts[id]=-900; PHONE.rec(G);
  for(const g of ['noodle_team','lawclub_study','public_law']) PHONE.join(G,g,g);
  if(kind!=='none'){ for(const [w,t] of MEMS) SOCIAL.remember(w,t,''); for(const id of CH) H.FRIEND(id);
    Object.assign(G.flags,{YU2_PICK:'a',ZHE2_ASKED:1,YT_TA:true,AN_CHOICE:'dm',SIS_RESULT_OUT:true,SK10_DONE:['Y2S1_6'],EXCHANGE_ROUTE:route||'TW'}); if(kind==='all') Object.assign(G.flags,{BH4_DONE:true,STUDYGROUP_LEADER:false});
    for(const ev of ALL_EV){ if(kind==='mixed'&&NOTDONE.includes(ev)) continue; G.events.done[ev]=1; G.events.last[ev]=-500; }
    const R=CLS.rec(G); R.disc.B_Y1S1_const_1_w11=0; const a12=STORY.termDay('Y2S1',12,1); R.done[a12+':admin_law']=1; for(let d=0;d<1500;d++) R.note['skip_'+d+':x']=1; }
  else G.flags.EXCHANGE_ROUTE=route||'TW';
  return G; };
const D0=D('2025-09-01'), D1=D('2029-08-31');
sec('2',()=>{ if(!WALK){ check('2. 沒有 walk118',false); return; }
  const reach={}; const states=[STATE('all'),STATE('mixed'),STATE('none')];
  for(const G0 of states){ H.G=G0; SOCIAL.bind(G0);
    for(let d=D0;d<=D1;d++){ G0.day=d; G0.weekday=wdOf(d); for(const h of [9,17.5,21]){ G0.hour=h;
      for(const id of CH) for(const e of WALK[id]){ let ok=false; try{ ok=!!e.if(G0,{}); }catch(x){ ok=false; } if(ok){ const k=id+'|'+e.one+'|'+e.l.join(''); (reach[k]||(reach[k]=new Set())).add(yOf(d)); } } } } }
  for(const id of CH){ const exp=EXP[id]||[], bad=[], never=[];
    for(const e of WALK[id]){ const k=id+'|'+e.one+'|'+e.l.join(''), r=reach[k]; const t=e.l[e.l.length-1]; const row=exp.find(x=>splitVar(x.text).includes(t));
      if(!r||!r.size){ never.push(e.one+' '+t.slice(0,12)); continue; } if(!row||[...r].some(y=>y!==row.y)) bad.push(e.one+' 稿：'+(row&&row.y)+' 跑出：'+[...r].join(',')); }
    check('2. '+id+'：每一句都跑得出來（四年每天×早／傍晚／晚上×三種玩家），而且只在稿上那一學年',!bad.length&&!never.length,J({never,bad}));
    const per=[1,2,3,4].map(y=>exp.filter(x=>x.y===y).length);
    check('2. '+id+'：每學年的句數照稿（大一～大四）',J(per)===J([1,2,3,4].map(y=>new Set(WALK[id].filter(e=>{ const r=reach[id+'|'+e.one+'|'+e.l.join('')]; return r&&r.has(y); }).map(e=>e.one)).size)),J(per)); }
  /* 抽幾句看條件的界線 */
  const G=STATE('none'); H.G=G; const at=(k,h)=>{ G.day=D(k); G.hour=h; G.weekday=wdOf(G.day); };
  const can=(id,one)=>WALK[id].filter(e=>e.one===one).some(e=>e.if(G,{}));
  at('2025-09-17',21); const a=can('zhe','w118_zhe_2'); at('2025-09-24',21); const b=can('zhe','w118_zhe_2'); at('2025-10-01',21); const c=can('zhe','w118_zhe_2');
  check('2. 阿哲「椰影大道走到底要七分鐘…」開學第三週：第 3、4 週有、第 5 週沒有',a&&b&&!c,J([a,b,c]));
  at('2025-11-27',21); const d1=can('heroine_01','w118_an_4'); CLS.rec(G).disc.B_Y1S1_const_1_w11=1; const d2=can('heroine_01','w118_an_4'); CLS.rec(G).disc.B_Y1S1_const_1_w11=0; const d3=can('heroine_01','w118_an_4');
  check('2. 以安新 2：沒去／選別的沒有，選「不行」才有',!d1&&!d2&&d3,J([d1,d2,d3]));
  G.flags.EXCHANGE_ROUTE='JP'; at('2028-04-30',21); const j=can('zhe','w118_zhe_18'); G.flags.EXCHANGE_ROUTE='TW'; const t=can('zhe','w118_zhe_18');
  check('2. 台灣路線的句子（阿哲冠軍賽之後）：日本路線沒有、台灣路線有',!j&&t,J([j,t]));
  at('2025-10-01',21); G.flags.YU2_PICK=null; const e1=can('yu','w118_yu_9'); at('2026-10-01',10); const e2=can('yu','w118_yu_9'); G.flags.YU2_PICK='a'; const e3=can('yu','w118_yu_9'); G.events.done.ev_yu_together=1; const e4=can('yu','w118_yu_9'); delete G.events.done.ev_yu_together;
  check('2. Alison「阿哲最近一直剛好路過晨思鐘…」：大二上早上、語 2 之後（YU2_PICK）、還沒在一起',!e1&&!e2&&e3&&!e4,J([e1,e2,e3,e4])); });

/* ================= 3 S.walkPick ================= */
sec('3',()=>{ if(!WALK){ check('3. 沒有 walk118',false); return; }
  const G=H.fresh('2025-10-01',21,'campus',{}); G.contacts={zhe:-10};
  const pick=(id,pid,n)=>{ const out=[]; for(let i=0;i<n;i++){ const p=INV.walkPick(G,id,pid); if(!p) break; out.push(p.lines.join('')); p.next(); } return out; };
  const L=pick('zhe','noodle',40), a118=L.filter(t=>WALK.zhe.some(e=>e.l.join('')===t)), a70=L.filter(t=>!WALK.zhe.some(e=>e.l.join('')===t));
  const avail=WALK.zhe.filter(e=>(e.where==='noodle'||e.where==='any')&&e.if(G,{})).map(e=>e.l.join(''));
  check('3. 阿哲（大一上第 5 週、去麵店）：AA_118 的句子和 AA_70 原有的一起輪；AA_118 每句只說一次、條件成立的都說到了；AA_70 的照舊重複',new Set(a118).size===a118.length&&J([...new Set(a118)].sort())===J(avail.sort())&&a70.length>=3&&new Set(a70).size<a70.length,J({a118,avail,a70:a70.slice(0,4)}));
  check('3. 說過的記在 G.flags.walkSaid（鍵＝one、值＝那一天）',avail.length>0&&Object.keys(G.flags.walkSaid||{}).length===avail.length&&Object.values(G.flags.walkSaid).every(v=>v===G.day),J(G.flags.walkSaid));
  const G2=H.fresh('2025-10-01',21,'campus',{}); const Lc=[]; for(let i=0;i<30;i++){ const p=INV.walkPick(G2,'zhe','cafe'); if(!p) break; Lc.push(p.lines.join('')); p.next(); }
  check('3. 目的地：「法律系館A → 麵店」那句只在去麵店的路上，去 Café 不說',L.includes('「哥，第一排的人都在幹嘛？我坐後面只看得到他們的後腦勺在點頭。」')&&!Lc.includes('「哥，第一排的人都在幹嘛？我坐後面只看得到他們的後腦勺在點頭。」'),J(Lc.slice(0,5)));
  const G3=H.fresh('2025-10-01',9,'campus',{}); SOCIAL.remember('yu','BREAKFAST_YU',''); let y=null; for(let i=0;i<20&&!y;i++){ const p=INV.walkPick(G3,'yu','library'); if(!p) break; if(p.lines.some(t=>/晨思鐘到底/.test(t))) y=p.lines; p.next(); }
  const G4=H.fresh('2025-10-01',9,'campus',{}); let y2=null; for(let i=0;i<20&&!y2;i++){ const p=INV.walkPick(G4,'yu','library'); if(!p) break; if(p.lines.some(t=>/晨思鐘到底/.test(t))) y2=p.lines; p.next(); }
  check('3. Alison 大一早上：有 BREAKFAST_YU 先說「欸，今天也經過！」（AA_118 稿上那一句）；沒有就只說主句；兩個版本算同一句',J(y)===J(['「欸，今天也經過！」','「晨思鐘到底幾點會敲？……不要查，我想先聽你猜。」'])&&J(y2)===J(['「晨思鐘到底幾點會敲？……不要查，我想先聽你猜。」'])&&A118.includes('「欸，今天也經過！」'),J([y,y2]));
  const G5=H.fresh('2025-10-01',21,'campus',{}); delete G5.flags.walkSaid; const ok5=!!INV.walkPick(G5,'classmate_bohan','library');
  const G6=H.fresh('2024-10-08',21,'campus',{}); G6.stage='econ'; const L6=[]; for(let i=0;i<10;i++){ const p=INV.walkPick(G6,'zhe','noodle'); if(!p) break; L6.push(p.lines.join('')); p.next(); }
  check('3. 舊存檔（沒有 walkSaid）照常；經濟系那一年（學年 0）沒有 AA_118 的句子；柏翰原本沒有 walk，現在有',ok5&&!L6.some(t=>WALK.zhe.some(e=>e.l.join('')===t)),J(L6)); });

/* ================= 4 手機小事：逐字 ================= */
const TERMN={'大一上':'Y1S1','大一下':'Y1S2','大二上':'Y2S1','大二下':'Y2S2','大三上':'Y3S1','大三下':'Y3S2','大四上':'Y4S1','大四下':'Y4S2'};
const P118=[];   /* {term, who, cond, content} */
{ const s=between(A118,'## 3. 手機小事池','## 5. 有建築'); let term=null;
  for(const l of s.split('\n')){ const m=/^### (\S{3})/.exec(l); if(m){ term=TERMN[m[1]]; continue; } if(!term||!/^\| [^人-]/.test(l)||/^\| ~~/.test(l)) continue; const c=cells(l); if(!NAME[c[0]]) continue; P118.push({term,who:NAME[c[0]],cond:c[1],content:c[2]}); } }
const MP=[];
{ const s=between(A555,'## 2. 手機小事','## 3. 三個地方'); for(const l of s.split('\n')){ if(!/^\| 大/.test(l)) continue; const c=cells(l); MP.push({term:TERMN[c[0]],who:NAME[c[1]],orig:c[2],to:c[3]}); } }
const ZHE_GE=/總圖那則改「([^」]+)」/.exec(A555);
/* 稿的內容 → 手機一則一則（照 aa555_3d.js 檔頭的寫法）*/
function bubbles(s){ const out=[]; let i=0, voice=null;
  const grab=(o,c)=>{ let d=0, j=i; for(;j<s.length;j++){ if(s[j]===o) d++; else if(s[j]===c){ d--; if(!d) break; } } const r=s.slice(i+1,j); i=j+1; return r; };
  while(i<s.length){ const ch=s[i];
    if(ch==='「'){ let t=grab('「','」'); if(voice){ t='（'+voice+'）'+t; voice=null; } out.push(t); continue; }
    if(ch==='（'){ const t=grab('（','）'); if(/^照片：/.test(t)) out.push('📷（'+t.slice(3)+'）'); else if(/^一個資料夾/.test(t)) out.push('📎（'+t+'）'); else if(/^(一張表|一張截圖|一張試算表截圖)/.test(t)) out.push('📷（'+t+'）'); else if(t==='斷掉'&&out.length) out[out.length-1]+='（斷掉）'; continue; }
    const m=/^語音訊息，([^：]+)：/.exec(s.slice(i)); if(m){ voice='語音，'+m[1]; i+=m[0].length; continue; }
    i++; }
  return out; }
const SKIP={ 'Y3S1|zhe':'系籃群組：遊戲沒有系籃群組', 'Y4S1|heroine_01':'新 18「研究所，我決定了：公法。」：遊戲的新 18 是商法組（y34b3d.js an18Dm 已有私訊）', 'Y4S2|heroine_01|研究所放榜':'畢業後的「公法所放榜」：同上，而且是 2030 年 3 月', 'Y4S2|heroine_03':'16b：r2y4b3d.js 2-Y4-37 已有 4/19 阿姨的照片', 'Y4S2|zhe|ZHE_PHOTOS':'搬出租屋那天：遊戲沒有這一天（不算配額）' };
const skipKey=r=>{ for(const k in SKIP){ const [t,w,c]=k.split('|'); if(r.term===t&&r.who===w&&(!c||r.cond.includes(c))&&(k!=='Y3S1|zhe'||/隊長/.test(r.cond))&&(k!=='Y4S1|heroine_01'||/新 18/.test(r.cond))&&(k!=='Y4S2|heroine_03'||/16b/.test(r.cond))) return k; } return null; };
const PEXP=[], PUN=[];
for(const r of P118){ const mods=MP.filter(m=>m.term===r.term&&m.who===r.who); let mod=null;
  for(const m of mods){ const q=(/「([^」]*)」/.exec(m.orig)||[])[1]; const cond=(/^條件「([^」]+)」/.exec(m.orig)||[])[1];
    if(cond?r.cond.includes(cond):(q?r.content.includes(q.replace(/……$/,'').replace(/^……/,'')):(/祐廷接了讀書會/.test(m.orig)&&/祐廷接了讀書會/.test(r.cond)))){ mod=m; break; } }
  let b=bubbles(r.content), special=null;
  if(mod){ if(/^\*\*遊戲裡已改過/.test(mod.to)) special='han3'; else if(/照用|條件改|換 Alison|^「……|……」$/.test(mod.to)) {} else b=bubbles(mod.to); }
  if(r.who==='zhe'&&b[0]==='哥我今天在總圖'&&ZHE_GE) b[0]=ZHE_GE[1];
  PEXP.push({term:r.term,who:r.who,cond:r.cond,b,special,skip:skipKey(r),mod:!!mod}); }
check('0. 手機小事：AA_118 八學期（刪掉的語彤法服那則不算）＋ZHE_PHOTOS；AA_555 第 2 節每一列都對到原句',P118.length===96&&MP.length===21&&MP.every(m=>PEXP.some(p=>p.mod&&p.term===m.term&&p.who===m.who)),J({n:P118.length,mp:MP.length,沒對到:MP.filter(m=>!PEXP.some(p=>p.mod&&p.term===m.term&&p.who===m.who)).map(m=>m.term+m.who+m.orig)}));
const A5=(typeof AA555!=='undefined')?AA555:null;
const termOfAt=d=>{ const t=CALENDAR.termOf(d); if(t) return t.id; const m=CALENDAR.dateOf(d).m; for(let k=1;k<200;k++){ const x=CALENDAR.termOf(m<=2?d+k:d-k); if(x) return x.id; } return null; };   /* 寒假（1～2 月）算下一學期、暑假算上一學期（稿把「寒假回新竹」放大一下、「暑期實習之後」放大三下）*/
const termOfDP=dp=>{ for(const id of Object.values(TERMN)) for(let w=1;w<=16;w++) if(dp.term({id,week:w,exam:null})) return id; return null; };
const strip=it=>it.text;
const gameP=()=>{ const L=[]; if(!A5) return L;
  for(const d of A5.DP){ const G=H.fresh('2026-03-02',10,'campus',{}); L.push({src:'dp',id:d.id,term:termOfDP(d),who:d.who,b:d.items(G).map(strip).concat(d.then?d.then.items(G).map(strip):[])}); }
  for(const a of A5.AT){ const G=H.fresh('2026-03-02',10,'campus',{}); L.push({src:'at',id:a[0],term:termOfAt(a[2]()),who:a[1],b:a[5](G).map(strip),day:a[2]()}); }
  const moon=(R3.DP3_AT||[]).find(x=>x[0]==='y3_yu_moon'); if(moon){ const G=H.fresh('2027-09-15',10,'campus',{}); L.push({src:'r3',id:'y3_yu_moon',term:'Y3S1',who:'yu',b:moon[4](G).map(strip)}); }
  return L; };
sec('4',()=>{ const GP=gameP(); check('4. src/aa555_3d.js 載得到（每天的手機小事、固定日子）',!!A5&&A5.DP.length>0&&A5.AT.length>0,loadErr.join('　'));
  const used=new Set(), miss=[];
  for(const p of PEXP){ if(p.skip||p.special) continue; const k=GP.findIndex((g,i)=>!used.has(i)&&g.who===p.who&&g.term===p.term&&J(g.b)===J(p.b)); if(k<0){ miss.push(p.term+' '+p.who+' '+J(p.b)); continue; } used.add(k); }
  check('4. 稿上每一則（沒接的五則以外）都在遊戲裡、逐字一樣、在稿上的那個學期、是那個人傳的',!miss.length,J(miss.slice(0,6)));
  check('4. 遊戲裡沒有稿上沒有的（aa555_3d.js 每一則都對到稿的一列）',used.size===GP.length,J(GP.filter((g,i)=>!used.has(i)).map(g=>g.id)));
  const src=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'), h3=(/PHONE\.at\(G,w2,21,\[\{th:'g:law_class',from:'classmate_bohan',text:'([^']+)'\}\],'han3_chart'\)/.exec(src)||[])[1];
  const want=(/照現在\*\*：「([^」]+)」/.exec(A555)||[])[1];
  check('4. 大二下柏翰「祐廷接了讀書會」：AA_555「遊戲裡已改過，照現在」＝story3d.js han3_chart 的字一樣',!!want&&h3===want,J([h3,want]));
  const sk=PEXP.filter(p=>p.skip).map(p=>p.skip);
  check('4. 沒接的五則（寫在回報要問 AA）：'+Object.values(SKIP).join('／'),sk.length===5&&new Set(sk).size===5,J(sk));
  const per={}; for(const p of PEXP) if(!/ZHE_PHOTOS/.test(p.cond)){ const k=p.who+'|'+p.term; per[k]=(per[k]||0)+1; }
  check('4. 稿上每人每學期 2 則（語彤大二上刪了一則＝1）',Object.entries(per).every(([k,n])=>n===(k==='heroine_03|Y2S1'?1:2))&&Object.keys(per).length===48,J(per)); });

/* ================= 5 手機小事：條件真的跑 ================= */
sec('5',()=>{ if(!A5){ check('5. 沒有 aa555_3d.js',false); return; }
  const reach={}; const states=[STATE('all'),STATE('mixed'),STATE('none'),STATE('all','JP'),STATE('all','US')]; states[0].weather='rain';
  for(const G0 of states){ H.G=G0; SOCIAL.bind(G0); for(let d=D0;d<=D1;d++){ G0.day=d; G0.weekday=wdOf(d); G0.hour=10; const t=STORY.dpTerm(G0); if(!t) continue;
      for(const dp of A5.DP){ let ok=false; try{ ok=!!dp.term(t)&&!!dp.ok(G0,d); }catch(x){} if(ok) (reach[dp.id]||(reach[dp.id]=new Set())).add(t.id); } } }
  const bad=[], never=[]; for(const dp of A5.DP){ const r=reach[dp.id], want=termOfDP(dp); if(!r||!r.size) never.push(dp.id); else if([...r].some(x=>x!==want)) bad.push(dp.id+' '+[...r].join(',')); }
  check('5. 每天的手機小事：每一則都跑得出來（四年每天×五種玩家狀態，用 dailyPhone 一樣的 dpTerm＋term＋ok），而且只在那個學期',!never.length&&!bad.length,J({never,bad}));
  const atBad=A5.AT.filter(a=>{ const d=a[2](); return d==null||!['all','mixed','none'].some(k=>{ const G=STATE(k); H.G=G; G.day=d; return a[4](G,d); }); }).map(a=>a[0]);
  check('5. 固定日子的每一則：日子算得出來、條件在那一天成立',!atBad.length,J(atBad));
  const G=STATE('none'); H.G=G; const ok=(id,k,mut)=>{ const d=D(k); G.day=d; G.weekday=wdOf(d); if(mut) mut(); const dp=A5.DP.find(x=>x.id==='a118_'+id); const t=STORY.dpTerm(G); return !!t&&dp.term(t)&&dp.ok(G,d); };
  const r1=ok('y1s1_yt_rain','2025-10-08'), r2=ok('y1s1_yt_rain','2025-10-08',()=>{ G.weather='rain'; }); G.weather='clear';
  check('5. 語彤「（照片：麵店門口的雨）今天沒人。」只在下雨天',!r1&&r2,J([r1,r2]));
  const o1=ok('y3s2_an_onigiri','2028-04-10',()=>{ G.flags.EXCHANGE_ROUTE='JP'; }), o2=ok('y3s2_an_onigiri','2028-04-10',()=>{ G.flags.EXCHANGE_ROUTE='TW'; }), o3=ok('y3s2_an_onigiri','2028-04-10',()=>{ G.flags.EXCHANGE_ROUTE='US'; });
  check('5. 以安飯糰：台灣、美國路線的祐廷收到；日本路線不另傳',!o1&&o2&&o3,J([o1,o2,o3]));
  const c1=ok('y1s1_an_row','2025-10-08'), c2=ok('y1s1_an_row','2025-10-09');   /* 民總週四：週三晚上傳 */
  check('5. 以安「明天民總，第二排。」：隔天有民總（週三晚上）才傳',c1&&!c2,J([c1,c2])); });

/* ================= 6 真的收到 ================= */
const runH=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); } };
const only=(ids,k,h0,h1,setup)=>{ const G=STATE('none'); H.G=G; SOCIAL.bind(G); const d=typeof k==='number'?k:D(k); G.day=d; G.weekday=wdOf(d); G.hour=h0; if(setup) setup(G);
  const keep=STORY.DAILY_PHONE.slice(); STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep.filter(x=>ids.includes(x.id)));
  try{ runH(h0,h1); } finally { STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep); } return G; };
const msgs=(G,re)=>(G.msgs||[]).filter(m=>re.test(m.tag||'')).map(m=>(m.from||'')+':'+m.text);
sec('6',()=>{ if(!A5){ check('6. 沒有 aa555_3d.js',false); return; }
  let G=only(['a118_y1s1_yt_dish'],'2025-10-22',7,23.9); const hs=(G.msgs||[]).filter(m=>/^dp_a118_y1s1_yt_dish_/.test(m.tag)).map(m=>m.h);
  check('6. dailyPhone：語彤「📷（一碟小菜）」21:20、十分鐘後「阿姨說是送的。」（大一上第 8 週）',J(msgs(G,/^dp_a118_y1s1_yt_dish_/))===J(['heroine_03:📷（一碟小菜）','heroine_03:阿姨說是送的。'])&&hs.length===2&&Math.abs(hs[0]-(21+20/60))<0.06&&Math.abs(hs[1]-21.5)<0.06,J((G.msgs||[]).map(m=>[m.tag,m.h])));
  G=only(['a118_y1s2_yt_noodle'],STORY.termDay('Y1S2',3,3),7,23.9); const n3=msgs(G,/a118/).length; G=only(['a118_y1s2_yt_noodle'],STORY.termDay('Y1S2',4,3),7,23.9); const n4=msgs(G,/a118/).length;
  check('6. 每學期第 4 週起（大一下第 3 週沒有、第 4 週有）',n3===0&&n4===1,J([n3,n4]));
  { const G1=STATE('none'); H.G=G1; SOCIAL.bind(G1); const d=STORY.termDay('Y2S2',5,1); const keep=STORY.DAILY_PHONE.slice(); STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep.filter(x=>x.id==='a118_y2s2_xc_report'));
    try{ for(let k=0;k<20;k++){ G1.day=d+k; G1.weekday=wdOf(G1.day); runH(7,23.9,0.1); } } finally { STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep); }
    check('6. 每則一次（20 天只收到一次）',msgs(G1,/a118_y2s2_xc_report/).length===1,J(msgs(G1,/a118/))); }
  { const G1=STATE('none'); H.G=G1; SOCIAL.bind(G1); const d=STORY.termDay('Y2S1',4,1); const keep=STORY.DAILY_PHONE.slice(); STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep.filter(x=>x.id==='a118_y2s1_an_rules'));
    let first=null; try{ for(let k=0;k<30;k++){ G1.day=d+k; G1.weekday=wdOf(G1.day); runH(7,23.9,0.1); if(first==null&&msgs(G1,/a118_y2s1_an_rules/).length) first=G1.day; } } finally { STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep); }
    const two=(G1.msgs||[]).find(m=>m.tag==='a118_then_y2s1_an_rules');
    check('6. 以安新 8「新規則：…第十條，不准賴。」→ 三週後（21 天後同一時間）「規則改成三條了。」',first!=null&&!!two&&two.text==='規則改成三條了。'&&two.day===first+21&&Math.abs(two.h-(21+40/60))<0.11,J([first,two&&[two.day,two.h,two.text]])); }
  { const G1=STATE('none'); H.G=G1; SOCIAL.bind(G1); const d=STORY.termDay('Y1S1',5,1); for(let k=0;k<3;k++){ G1.day=d+k; G1.weekday=wdOf(G1.day); runH(7,23.9,0.1); }
    const L=(G1.msgs||[]).filter(m=>/^a118_y1s1_bh_count/.test(m.tag)).map(m=>[m.day-d,+m.h.toFixed(2),m.text]);
    check('6. 固定日子：柏翰「期中前二十一天。」大一上第 5 週週一（第 8 週週一前 21 天）22:00、「二十天。」隔天 22:00',J(L)===J([[0,22,'期中前二十一天。'],[1,22,'二十天。']]),J(L)); }
  { const G1=STATE('none'); H.G=G1; SOCIAL.bind(G1); const d=D('2029-06-02'); G1.day=d; G1.weekday=wdOf(d); runH(7,23.9,0.1); const L=msgs(G1,/^a118_y4s2_/);
    check('6. 畢業典禮 6/2：柏翰最後一排的照片、芯慈「我媽哭了。我沒有。」、Alison「拍了兩百張。…」',L.includes('classmate_bohan:📷（從最後一排拍的會場）')&&L.includes('classmate_xinci:……有一點。')&&L.includes('yu:拍了兩百張。只有一張是我一個人。我最喜歡那一張。'),J(L)); }
  { const G1=STATE('none'); H.G=G1; SOCIAL.bind(G1); const d=D('2027-09-15'); G1.day=d; G1.weekday=wdOf(d); runH(20,23.9,0.1); const L=(G1.msgs||[]).filter(m=>/^r3_y3_yu_moon/.test(m.tag)).map(m=>m.text);
    check('6. Alison 大三上中秋（r3_3d.js y3_yu_moon）：9/15 22:30 法一吃飯群組「今年中秋有月亮」「去年下雨」「我記得」（AA_555）；不用認識芷若',J(L)===J(['今年中秋有月亮','去年下雨','我記得']),J(L)); }
  { const G1=only(['a118_y3s2_yu_abroad'],'2028-04-12',7,23.9,G=>{ G.flags.EXCHANGE_ROUTE='JP'; }); const m=(G1.msgs||[]).find(x=>/a118_y3s2_yu_abroad/.test(x.tag));
    const G2=only(['a118_y3s2_yu_abroad'],'2028-04-12',7,23.9,G=>{ G.flags.EXCHANGE_ROUTE='TW'; });
    check('6. 國外路線（日本）：Alison「欸你在國外會不會一個人吃飯」照當地時間（臺灣 21:30＝日本 22:30）；台灣路線沒有',!!m&&Math.abs(m.h-22.5)<0.01&&!msgs(G2,/a118/).length,J([m&&m.h,msgs(G2,/a118/)])); }
  { const G1=only(['a118_y2s1_zhe_together'],STORY.termDay('Y2S1',15,6),7,23.9,G=>{ G.events.done.ev_yu_together=1; }); const L=msgs(G1,/a118_y2s1_zhe_together/), th=(G1.msgs||[]).filter(m=>/a118_y2s1_zhe_together/.test(m.tag)).map(m=>m.th);
    check('6. 阿哲語 3：法一吃飯群組（noodle_team）阿哲兩則、Alison「沒有人問你」',J(L)===J(['zhe:從今天開始，我跟 Alison 坐一起','zhe:其他人照舊','yu:沒有人問你'])&&th.every(t=>t==='g:noodle_team'),J([L,th])); } });

setTimeout(()=>H.done(),0);

// AA_811 接進遊戲（MOVIE-TALK-1110 欠的兩組；任務 DLG-FULL-REVIEW-1110）——不需要瀏覽器（D131）。
// 稿：企劃線 docs/story_planning/AA_811_movie_talk_hehuan_voice.json@fb1256280 → src/data/aa811_lines.js（tools/story/import_aa811.py）；規則 src/aa811_3d.js。檢查：
//   0. 白名單 AA_811@fb1256280 approved；匯入工具 --check 一致；資料逐句對稿（讀不到稿＝只跳過那一項）；index.html 在 movies3d.js 之後載入
//   1. 合歡山北峰出不出現：沒有 SIS_HEHUAN 不出現；6/15～10/31 的週六、週日（明天起 7 天內）才出現、日子只列週末；颱風假、那天有別的出遊不列；約好了＝灰掉；去過了＝不出現；只給學姊
//   2. 約（INV.flow「這個時候才有」）：當面、手機都可以；她答應那一句照稿（手機＝寫進對話串）；排成出遊（04:00、ev_sis_hehuan、noRain、dawn）；「約好了：…」
//   3. 出發的時間窗 03:15～03:30；鬧鐘 03:00（可以早於 06:30）；那一天 2D 演完 04:00 → 22:00；背景 客運 → 山上 → 回程客運
//   4. friend／dating 兩版各演一次：只演自己那一版的句子、選項照稿、fx（love＝她的戀愛、friend＝友情；同一趟戀愛最多 +2）、SIS_HEHUAN_WENT、記一次正式校外約會；說出來的都在稿裡（系統字另列）
//   5. 下雨：不問出發、記 missed／rained、一行系統字；之後還可以再約
//   6. 子晴語音：D0＝「第一天」那則的日子（ON_MK 記 ZQ_VOICE_D0）；回第三天那則＝一次排好十則（日子＝D0＋N−1、不數了＝D0＋36，22:00～23:40）；
//      只有第九則可以回、兩個選項與 fx；其他不可回；讀檔不重送；沒回＝沒有；回得晚＝不補在過去、照順序；舊存檔的 D0 推法；舊存檔 ZQ_VOICE_MEMO 已經有＝手機規則補排
// 修改前（e9f724ad7，還沒有 src/aa811_3d.js）：FAIL。用法：node tests/aa811_hehuan_voice_1111_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadErr=[];
const loadG=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ vm.runInThisContext(fs.readFileSync(p,'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='),{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,200)); return false; } };
global.NY3={houseLights(){ return true; }, lobby:{build(){ return {group:null,seats:[]}; }}, hall:{build(){ return {group:null,seats:[]}; }}};
global.Z3={ZONES:{xs_nanyang:NY3.lobby,xs_nanyang_hall:NY3.hall}};
for(const f of ['src/data/study_scenes.js','src/data/activity_scenes.js','src/studyn3d.js','src/data/nanyang_layout.js','src/nanyang_sys3d.js','src/data/nanyang_movies.js','src/data/movie_plots.js','src/movies3d.js','src/data/pg_dates.js','src/pgdates3d.js','src/data/aa811_lines.js','src/aa811_3d.js']) loadG(f);
check('0. 載入沒有錯（movies3d、pgdates3d、aa811_lines、aa811_3d）',!loadErr.length&&typeof AA811!=='undefined'&&typeof AA811_LINES!=='undefined'&&typeof MOVIES!=='undefined',J(loadErr));
if(typeof AA811==='undefined'){ H.done(); }
const DOC='docs/story_planning/AA_811_movie_talk_hehuan_voice.json', SHA='fb1256280';
const D=k=>H.D(k), WD=d=>CALENDAR.dateOf(d).wd%7;
const SIS='heroine_05', ZQ='heroine_04', HH=AA811_LINES.hehuan, ZV=AA811_LINES.zq_voice;
/* 選項：picks 照順序（字串＝那一項的字含有它；分層選單裡要選的在某一類＝先選那一類，同一個字留給下一層）；記下每一組 */
let PICKS=[], CH=[], TOASTS=[];
let NCH=0; GM.choose=async o=>{ if(++NCH>3000) throw new Error('選項太多次（迴圈？）'+J(CH.slice(-3))); const T=o.map(q=>q.t||q.text); CH.push(T); if(!PICKS.length) return T.length-1;   /* 沒有要選的＝最後一個（算了／返回），不會卡在灰掉的那一類 */ const want=PICKS.shift(); if(typeof want==='number') return want; if(typeof want==='string'){ let k=T.findIndex(t=>t===want); if(k<0) k=T.findIndex(t=>t.includes(want)); if(k<0){ k=o.findIndex(q=>(q.sub||[]).some(s=>s.includes(want))); if(k>=0) PICKS.unshift(want); } return k<0?0:k; } return 0; };
GM.toast=t=>{ TOASTS.push(t); };
GM.money=d=>{ H.G.money+=d; };
let ADJ=[]; { const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ ADJ.push([id,Object.assign({},d)]); return a0.apply(this,arguments); }; }
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone||'dorm'); G.invites=[]; G.msgs=G.msgs||[]; G.money=20000; G.contacts={[SIS]:1,[ZQ]:1}; PICKS=[]; CH=[]; TOASTS=[]; ADJ=[]; return G; };
const sis=(G,o)=>{ H.CLOSE(SIS); G.flags.SIS_HEHUAN=D('2029-01-20'); Object.assign(G.flags,o||{}); return G; };
const say=()=>H.said.map(s=>s.t);
const sumAdj=(id,k)=>ADJ.filter(([w])=>w===id).reduce((s,[,d])=>s+(+d[k]||0),0);
(async()=>{
  /* ---------- 0. 白名單、匯入工具、稿 ---------- */
  const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')), e=A.files.find(x=>x.path===DOC);
  check('0. 白名單有 AA_811@fb1256280（approved、approvedBy、kind json）',!!e&&e.sha===SHA&&e.status==='approved'&&!!e.approvedBy&&e.kind==='json',J(e));
  let ck=''; try{ ck=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_aa811.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(err){ ck='ERR '+String(err.stderr||err.message||err).slice(0,300); }
  if(/讀不到|fatal|invalid object|CalledProcessError/i.test(ck)) console.log('（跳過：匯入工具讀不到 '+SHA+'，企劃線沒 fetch）'); else check('0. tools/story/import_aa811.py --check：src/data/aa811_lines.js 和稿一致',/^OK/.test(ck),ck);
  let doc=null; try{ doc=JSON.parse(cp.execFileSync('git',['-C',H.ROOT,'show',SHA+':'+DOC],{encoding:'utf8',stdio:['ignore','pipe','ignore']})); }catch(err){ doc=null; }
  if(doc){
    check('0. 合歡山北峰 dialogue 和稿一字不差（'+doc.hehuan.dialogue.length+' 格）',J(HH.dialogue)===J(doc.hehuan.dialogue),'');
    check('0. id、title、who 照稿；她答應那一句在稿的 when 裡',HH.id===doc.hehuan.id&&HH.title===doc.hehuan.title&&HH.who===doc.hehuan.who&&doc.hehuan.when.includes('她答應的句子：「'+HH.accept+'」')&&HH.accept==='好。四點的客運。',J([HH.id,HH.title,HH.accept]));
    check('0. 子晴十則、第九則兩個回覆和稿一字不差',J(ZV.msgs)===J(doc.zq_voice.msgs)&&J(ZV.reply9)===J(doc.zq_voice.reply9)&&ZV.flag===doc.zq_voice.flag&&ZV.who===doc.zq_voice.who,'');
    check('0. 稿的時間規格：04:00 出發、22:00 回到臺北、hours 18；2029-06-15～2029-10-31；第 N 天＝D0＋N−1、不數了＝D0＋36',/04:00 出發 → 22:00 回到臺北（hours 18）/.test(doc.hehuan.trip)&&doc.hehuan.when.includes('2029-06-15～2029-10-31')&&doc.zq_voice.when.includes('D0＋N−1')&&doc.zq_voice.when.includes('D0＋36')&&AA811.EV.hours===18&&AA811.HH.from==='2029-06-15'&&AA811.HH.to==='2029-10-31','');
  } else console.log('（跳過：讀不到 '+SHA+':'+DOC+'，企劃線沒 fetch）');
  const idx=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), iM=idx.indexOf('src/movies3d.js?v='), iL=idx.indexOf('src/data/aa811_lines.js?v='), iS=idx.indexOf('src/aa811_3d.js?v=');
  check('0. index.html：aa811_lines.js、aa811_3d.js 在 movies3d.js 之後（同一個 ?v=）',iM>0&&iL>iM&&iS>iL&&idx.slice(iM,iS).split('?v=').length===3&&/aa811_3d\.js\?v=9\.10\.25/.test(idx),J([iM,iL,iS]));
  check('0. ev_sis_hehuan 登記在 STORY_EVENTS（trigger outing、hours 18）',STORY_EVENTS.some(x=>x.id==='ev_sis_hehuan'&&x.trigger==='outing'&&x.hours===18&&typeof x.beforeOuting==='function'),'');

  /* ---------- 1. 出不出現 ---------- */
  { const G=fresh('2029-06-12',15); H.CLOSE(SIS);
    check('1. 沒有 SIS_HEHUAN（電影那一題沒答應）＝不出現',AA811.hhOffer(G,SIS)===null&&AA811.when(G,SIS,null)===null,'');
    sis(G); const o=AA811.hhOffer(G,SIS), days=AA811.hhDays(G);
    check('1. 有 SIS_HEHUAN、6/12（二）：出現，日子＝6/16（六）、6/17（日）（6/15 是週五不算）',!!o&&!o.dim&&o.t==='合歡山北峰'&&J(days)===J([D('2029-06-16'),D('2029-06-17')])&&days.every(d=>[0,6].includes(WD(d))),J({o,days}));
    check('1. 只給學姊（子晴、以安沒有這一項）',AA811.hhOffer(G,ZQ)===null&&AA811.hhOffer(G,'heroine_01')===null,'');
    G.day=D('2029-06-08'); check('1. 6/8（五）：7 天內（6/9～6/15）碰不到 6/15 以後的週末＝不出現',AA811.hhOffer(G,SIS)===null,J(AA811.hhCand(G)));
    G.day=D('2029-06-09'); check('1. 6/9（六）：只有 6/16',J(AA811.hhDays(G))===J([D('2029-06-16')]),J(AA811.hhDays(G)));
    G.day=D('2029-10-26'); check('1. 10/26（五）：10/27、10/28',J(AA811.hhDays(G))===J([D('2029-10-27'),D('2029-10-28')]),J(AA811.hhDays(G)));
    G.day=D('2029-10-28'); check('1. 10/28 以後：11/3 已經過了 10/31＝不出現',AA811.hhOffer(G,SIS)===null,J(AA811.hhCand(G)));
    G.day=D('2029-06-12');
    const ty0=CALENDAR.typhoon; CALENDAR.typhoon=d=>d===D('2029-06-16')||ty0.call(CALENDAR,d); const dT=AA811.hhDays(G); CALENDAR.typhoon=ty0;
    check('1. 颱風假（6/16）不列',J(dT)===J([D('2029-06-17')]),J(dT));
    OUT.plan(G,{id:'x_other',ev:'ev_none',day:D('2029-06-17'),h:14,title:'別的事',silent:true}); const dO=AA811.hhDays(G);
    check('1. 那一天有別的出遊（6/17）不列',J(dO)===J([D('2029-06-16')])&&AA811.hhBusy(G,D('2029-06-17'))!=='',J([dO,AA811.hhBusy(G,D('2029-06-17'))]));
    OUT.plan(G,{id:'x_other2',ev:'ev_none',day:D('2029-06-16'),h:14,title:'別的事',silent:true}); const oB=AA811.hhOffer(G,SIS);
    check('1. 兩天都有事：灰掉（系統字）',!!oB&&oB.dim&&oB.why===AA811.HH_ALL_BUSY,J(oB));
    G.outings=[]; G.flags.SIS_HEHUAN_WENT=true; check('1. SIS_HEHUAN_WENT（去過了）＝不出現',AA811.hhOffer(G,SIS)===null,'');
    delete G.flags.SIS_HEHUAN_WENT; G.flags.SIS_HEHUAN=false; check('1. SIS_HEHUAN＝false 也不出現',AA811.hhOffer(G,SIS)===null,''); }

  /* ---------- 2. 約 ---------- */
  let G2=null, q2=null;
  { const G=fresh('2029-06-12',15); sis(G); H.said=[]; PICKS=['合歡山北峰',0];
    const r=await INV.flow(GM,SIS,null); q2=OUT.rec(G).find(q=>q.ev==='ev_sis_hehuan'); G2=G;
    const menu=CH[0]||[], all=CH.flat();
    check('2. 手機約學姊：清單出現「合歡山北峰」（這個時候才有）',all.some(t=>t==='合歡山北峰'),J(CH));
    check('2. 選日子：只有 6/16（六）、6/17（日）＋算了',J(CH[CH.length-1])===J([DATE.dayLabel(G,D('2029-06-16')),DATE.dayLabel(G,D('2029-06-17')),'算了']),J(CH[CH.length-1]));
    const th=(G.msgs||[]).filter(m=>m.th==='p:'+SIS).map(m=>m.text);
    check('2. 她答應那一句照稿（手機＝「（手機）」＋寫進對話串）',say().includes('好。四點的客運。')&&H.said.some(s=>s.t==='好。四點的客運。'&&/（手機）$/.test(s.who||''))&&th.includes('好。四點的客運。'),J({said:H.said,th}));
    check('2. 排成出遊：6/16 04:00、ev_sis_hehuan、late −0.5、travelH 0.5、noRain、dawn、回到臺北',r===D('2029-06-16')&&!!q2&&q2.day===D('2029-06-16')&&q2.h===4&&q2.late===-0.5&&q2.travelH===0.5&&q2.noRain===true&&q2.dawn===true&&q2.back==='回到臺北。'&&q2.who===SIS&&q2.state==='planned',J(q2));
    check('2. 「約好了：明天…」系統字（同 DATE.menu）',say().includes('約好了：'+DATE.dayLabel(G,D('2029-06-16')).trim()+' 04:00，合歡山北峰。'),J(say()));
    const o=AA811.hhOffer(G,SIS); check('2. 約好了以後：灰掉「已經約好了」',!!o&&o.dim&&o.why==='已經約好了',J(o));
    H.said=[]; PICKS=['合歡山北峰']; CH=[]; await INV.flow(GM,SIS,null); check('2. 再選一次：說「已經約好了。」、不重複排',say().includes('已經約好了。')&&OUT.rec(G).filter(q=>q.ev==='ev_sis_hehuan').length===1,J(say()));
    const Gf=fresh('2029-06-12',15); sis(Gf); H.said=[]; PICKS=['合歡山北峰',1]; const n={obj:{position:{x:0,y:0,z:0}}};
    const rf=await INV.flow(GM,SIS,n); const qf=OUT.rec(Gf).find(q=>q.ev==='ev_sis_hehuan');
    check('2. 當面約也可以：她當面說（不寫進手機）、6/17',rf===D('2029-06-17')&&!!qf&&H.said.some(s=>s.t==='好。四點的客運。'&&!/（手機）/.test(s.who||''))&&!(Gf.msgs||[]).some(m=>m.text==='好。四點的客運。'),J({said:H.said,qf}));
    const Gz=fresh('2029-06-12',15); sis(Gz); H.FRIEND(ZQ); PICKS=[]; CH=[]; PICKS=['算了']; await INV.flow(GM,ZQ,null);
    check('2. 約子晴的清單沒有「合歡山北峰」',!CH.flat().some(t=>t==='合歡山北峰'),J(CH)); }

  /* ---------- 3. 出發、鬧鐘、那一天 ---------- */
  { const G=G2, q=q2, d=D('2029-06-16'); H.G=G; SOCIAL.bind(G);   /* 第 2 節後面開了別的存檔：換回約好的那一個 */
    G.day=d; G.hour=3.1; check('3. 03:06 還不問出發',OUT.due(G)===null,'');
    G.hour=3.26; check('3. 03:16 問出發（03:15～03:30）',OUT.due(G)===q,'');
    G.hour=3.55; check('3. 03:33 過了＝不問（沒趕上客運）',OUT.due(G)===null,'');
    G.day=d-1; G.hour=22; const A=STORY.wakeAlarms(G,d), a=A.find(x=>/合歡山北峰/.test(x.why));
    check('3. 鬧鐘：出發前 30 分鐘＝03:00（dawn）',!!a&&Math.abs(a.h-3)<1e-9&&a.dawn===true,J(A));
    const BO=STORY.bedOptions(G), mo=BO.find(o=>o.kind==='sleep');
    check('3. 前一晚睡覺：鬧鐘 03:00 叫醒（可以早於 06:30）',!!mo&&Math.abs(mo.wake-3)<1e-9&&/03:00/.test(mo.hint||''),J(BO));
    { const Gx=fresh('2029-06-15',22); OUT.plan(Gx,{id:'x_early',ev:'ev_none',day:d,h:5,travelH:0.5,title:'別的早上',silent:true}); const bo=STORY.bedOptions(Gx).find(o=>o.kind==='sleep');
      check('3. 別的出遊（沒有 dawn）鬧鐘照舊最早 06:30',!!bo&&Math.abs(bo.wake-6.5)<1e-9,J(bo)); H.G=G; SOCIAL.bind(G); }
    { const F0=Object.assign({},G.flags), d0=JSON.stringify(PG.rec(G).done); G.flags.GRADUATED=true; PG.rec(G).done.grad=1; G.day=d; G.hour=1;
      check('3. 畢業後篇（PG.on）：跳到下一件事停在 03:15（出遊該問的時間）',PG.on(G)&&Math.abs(PG.nextStop(G)-(d*24+3.25))<1e-6,J([PG.on(G),PG.nextStop(G)-d*24]));
      G.flags=F0; PG.rec(G).done=JSON.parse(d0); }
    G.day=d; G.hour=3.26; H.said=[]; H.bgs=[]; H.cards=[]; PICKS=[0,0]; ADJ=[];
    const ok=await OUT.go(GM,q);
    check('3. 出發：演完、q done、時間 04:00＋18＝22:00（同一天）',ok===true&&q.state==='done'&&G.day===d&&Math.abs(G.hour-22)<1e-6,J({ok,st:q.state,day:G.day,h:G.hour}));
    const img=k=>OUT.bg(k).image, bgs=H.bgs.map(b=>b&&b.image||b);
    const iB=bgs.indexOf(img('coach_night')), iM=bgs.indexOf(img('trip_mountain')), iB2=bgs.lastIndexOf(img('coach_night'));
    check('3. 背景：客運（coach_night）→ 山上（trip_mountain）→ 回程客運',iB>=0&&iM>iB&&iB2>iM,J(bgs));
    check('3. 字卡＝標題（和'+SOCIAL.displayName(SIS)+'去合歡山北峰）',H.cards.some(c=>c[0]==='和'+SOCIAL.displayName(SIS)+'去合歡山北峰'),J(H.cards)); }

  /* ---------- 4. 兩版 ---------- */
  const scriptTexts=new Set(); for(const x of HH.dialogue){ if(x.text) scriptTexts.add(x.text); if(x.line) scriptTexts.add(x.line.text); for(const c of (x.choice||[])) for(const s of (c.say||[])) scriptTexts.add(s.text); }
  const SYS=new Set(['回到臺北。']);
  const playV=async(dt,picks)=>{ const G=fresh('2029-06-12',15); sis(G); if(dt) H.date(SIS); AA811.hhPlan(G,D('2029-06-16')); const q=OUT.rec(G).find(x=>x.ev==='ev_sis_hehuan');
    G.day=D('2029-06-16'); G.hour=3.26; H.said=[]; CH=[]; ADJ=[]; PICKS=picks.slice(); G.flags.FX_CAP={}; const r0=SOCIAL.rel(SIS), b={rom:+r0.npcRom||0,fam:+r0.fam||0};
    await OUT.go(GM,q); return {G,q,b}; };
  const ifLines=v=>HH.dialogue.filter(x=>x.if===v).map(x=>x.line.text), base=HH.dialogue.filter(x=>x.text).map(x=>x.text);
  { const {G}=await playV(false,['「水，還有一件外套。」','「恭喜妳寫完。」']); const S=say();
    check('4. 朋友版：所有共同的句子照順序、朋友版四句都有、交往版一句都沒有',base.every(t=>S.includes(t))&&ifLines('friend').every(t=>S.includes(t))&&!ifLines('dating').some(t=>S.includes(t)),J(S));
    check('4. 兩組選項照稿（三個、字一樣）',J(CH[0])===J(HH.dialogue.find(x=>x.choice).choice.map(c=>c.t))&&J(CH[1])===J(HH.dialogue.filter(x=>x.choice)[1].choice.map(c=>c.t)),J(CH));
    check('4. 選「水，還有一件外套」＋「恭喜妳寫完」：她回稿上那幾句；戀愛 +1、友情（熟悉）+1＋2',S.includes('外套借我。我的太薄了。')&&S.includes('剩下的只有印。印完那天，我會請你吃飯。')&&sumAdj(SIS,'npcRom')===1&&sumAdj(SIS,'fam')===3&&sumAdj(SIS,'trust')===3&&sumAdj(SIS,'comf')===3,J(ADJ));
    check('4. 演完：SIS_HEHUAN_WENT、記一次正式校外約會（G.trips 合歡山北峰）、清單不再出現',G.flags.SIS_HEHUAN_WENT===true&&(G.trips||[]).some(t=>t.who===SIS&&t.locs[0]==='合歡山北峰'&&t.counted)&&AA811.hhOffer(G,SIS)===null,J(G.trips));
    const extra=S.filter(t=>!scriptTexts.has(t)&&!SYS.has(t)); check('4. 演出來的每一句都在稿裡（沒有自己寫的句子）',!extra.length,J(extra));
    check('4. 不開新的邀約（沒有新的出遊、沒有新的約）',OUT.rec(G).filter(q=>q.state==='planned').length===0&&!(G.invites||[]).length,J(OUT.rec(G))); }
  { const {G}=await playV(true,['「泡麵。」','（不說話，跟她一起看雲）']); const S=say();
    check('4. 交往版：交往版四句都有、朋友版一句都沒有',ifLines('dating').every(t=>S.includes(t))&&!ifLines('friend').some(t=>S.includes(t))&&base.every(t=>S.includes(t)),J(S));
    check('4. 選「泡麵」（love 2）＋「不說話」（love 2）：同一趟她的戀愛最多 +2（FX-LOVE-CAP）',S.includes('……分我一半。')&&S.includes('嗯。這樣就好。')&&sumAdj(SIS,'npcRom')===2&&sumAdj(SIS,'fam')===0,J(ADJ));
    const extra=S.filter(t=>!scriptTexts.has(t)&&!SYS.has(t)); check('4. 交往版說出來的也都在稿裡',!extra.length,J(extra)); }
  { const {G}=await playV(false,['「沒什麼。」','「下一座要去哪？」']); const S=say();
    check('4. 選「沒什麼」＋「下一座要去哪」：友情 +1＋1、戀愛 0',S.includes('那你背那麼大一個包。')&&S.includes('我想先練習一陣子，什麼都不排。')&&sumAdj(SIS,'npcRom')===0&&sumAdj(SIS,'fam')===2,J(ADJ)); }

  /* ---------- 5. 下雨 ---------- */
  { const G=fresh('2029-06-12',15); sis(G); AA811.hhPlan(G,D('2029-06-16')); const q=OUT.rec(G).find(x=>x.ev==='ev_sis_hehuan');
    G.day=D('2029-06-16'); G.hour=3.26; G.weather='rain';
    check('5. 下雨：不問出發',OUT.due(G)===null,'');
    G.hour=3.0; check('5. 還沒到該問的時間：不急著取消',OUT.expire(G).length===0&&q.state==='planned','');
    G.hour=3.26; TOASTS=[]; OUT.tick(GM);
    check('5. 到了該問的時間在下雨：missed、rained、一行系統字',q.state==='missed'&&q.rained===true&&TOASTS.some(t=>t==='下雨了，和'+SOCIAL.displayName(SIS)+'去合歡山北峰的行程取消。'),J({st:q.state,TOASTS}));
    G.day=D('2029-06-19'); G.hour=15; G.weather='clear'; const o=AA811.hhOffer(G,SIS);
    check('5. 之後還可以再約（沒有 SIS_HEHUAN_WENT、不是「已經約好了」）',!!o&&!o.dim&&G.flags.SIS_HEHUAN_WENT==null,J(o));
    const G3=fresh('2029-06-12',15); sis(G3); AA811.hhPlan(G3,D('2029-06-16')); const q3=OUT.rec(G3).find(x=>x.ev==='ev_sis_hehuan'); G3.day=D('2029-06-16'); G3.hour=3.26; G3.weather='cloudy';
    check('5. 陰天照常',OUT.due(G3)===q3,'');
    const G4=fresh('2029-06-12',15); OUT.plan(G4,{id:'x_rain',ev:'ev_none',day:G4.day,h:16,title:'別的',silent:true}); G4.hour=15.8; G4.weather='rain';
    check('5. 沒有 noRain 的出遊下雨照舊會問',!!OUT.due(G4),''); }

  /* ---------- 6. 子晴語音 ---------- */
  const OFF=[], NUM={一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10};
  const cn=s=>{ if(s.length===1) return NUM[s]; if(s[0]==='十') return 10+(NUM[s[1]]||0); return NUM[s[0]]*10+(s[2]?NUM[s[2]]:0); };
  for(const t of ZV.msgs){ const m=/第(.+?)天/.exec(t); OFF.push(m?cn(m[1])-1:36); }
  check('6. 稿上的第 N 天 → D0＋N−1（不數了＝D0＋36）和 S.ZQ.off 一致',J(OFF)===J(AA811.ZQ.off),J({OFF,code:AA811.ZQ.off}));
  const watch=async(G,ans,lateDays)=>{ G.flags.MOVIE_LOVE={}; G.flags.FX_CAP={}; H.FRIEND(ZQ); PICKS=[0];
    await MOVIES.after(GM,{place:'xs_nanyang',film:'m2909a',who:ZQ,id:'izq'},{name:'子晴',charId:ZQ});
    const W=G.day; let D0=null;
    for(let k=1;k<=3;k++){ G.day=W+k; G.hour=22.1; PHONE.tick(G); }
    D0=G.flags.ZQ_VOICE_D0; const m3=(G.msgs||[]).find(x=>x.tag==='mv745_m2909a_heroine_04_2'&&x.ask);
    if(lateDays){ G.day+=lateDays; G.hour=21; }
    let a=null; if(m3&&ans!=null) a=PHONE.answer(G,m3.ask.id,ans); return {W,D0,m3,a}; };
  { const G=fresh('2029-09-08',19,'xs_nanyang'); const {W,D0,m3,a}=await watch(G,0);
    check('6. D0＝「第一天」那則送到的那一天（看完隔天；ON_MK 記 ZQ_VOICE_D0）',D0===W+1&&(G.msgs||[]).some(m=>m.tag==='mv745_m2909a_heroine_04_0'&&m.day===D0),J({W,D0}));
    check('6. 回第三天那則＝ZQ_VOICE_MEMO、一次排好十則（ZQ_VOICE_Q＝D0）',!!m3&&!!a&&G.flags.ZQ_VOICE_MEMO!=null&&G.flags.ZQ_VOICE_Q===D0&&PHONE.rec(G).q.filter(q=>/^zqvoice_/.test(q.tag)).length===10,J({a:!!a,F:G.flags.ZQ_VOICE_Q}));
    const Q=PHONE.rec(G).q.filter(q=>/^zqvoice_/.test(q.tag)).sort((x,y)=>(x.day*24+x.h)-(y.day*24+y.h));
    check('6. 十則的日子＝D0＋N−1（第五天 D0＋4 … 第三十四天 D0＋33、不數了 D0＋36）、照順序',J(Q.map(q=>q.day-D0))===J(OFF)&&J(Q.map(q=>q.tag))===J(OFF.map((o,i)=>'zqvoice_'+(i+1))),J(Q.map(q=>[q.tag,q.day-D0])));
    check('6. 時間都在 22:00～23:40、每一則固定（不是隨機）',Q.every(q=>q.h>=22-1e-9&&q.h<=23+40/60+1e-9)&&J(Q.map(q=>q.h))===J(AA811.ZQ.h),J(Q.map(q=>q.h)));
    check('6. 私訊 p:heroine_04、照稿（不加句號）',Q.every((q,i)=>q.items.length===1&&q.items[0].th==='p:'+ZQ&&q.items[0].from===ZQ&&q.items[0].text===ZV.msgs[i]),'');
    check('6. 只有第九則可以回：兩個選項照稿、fx（love 1／友情 1）',Q.every((q,i)=>i===8?!!q.items[0].ask:!q.items[0].ask)&&J(Q[8].items[0].ask.opts.map(o=>o.t))===J(ZV.reply9.opts.map(o=>o.t))&&J(Q[8].items[0].ask.opts.map(o=>o.fx))===J([{love:1},{fr:1}]),J(Q[8].items[0].ask));
    const S0=J(G); const G1=JSON.parse(S0); H.G=G1; SOCIAL.bind(G1); AA811.zqSched(G1); STORY.phoneRules(GM);
    check('6. 讀檔（存檔 JSON 來回）以後不重排、不重送',PHONE.rec(G1).q.filter(q=>/^zqvoice_/.test(q.tag)).length===10,J(PHONE.rec(G1).q.length));
    const G2x=G1; for(let d=G2x.day;d<=D0+40;d++){ G2x.day=d; G2x.hour=23.9; PHONE.tick(G2x); }
    const M=(G2x.msgs||[]).filter(m=>/^zqvoice_/.test(m.tag||''));
    check('6. 時間到了十則都送到、順序照稿、日子照排',M.length===10&&J(M.map(m=>m.text))===J(ZV.msgs)&&J(M.map(m=>m.day-D0))===J(OFF),J(M.map(m=>[m.day-D0,m.h,m.text.slice(0,8)])));
    check('6. 其他九則不能回（PHONE.pending 只剩第九則）',PHONE.pending(G2x).filter(m=>m.th==='p:'+ZQ).length===1&&PHONE.pending(G2x).some(m=>m.ask&&m.ask.id==='zqvoice_9'),J(PHONE.pending(G2x).map(m=>m.text)));
    for(let d=G2x.day+1;d<=D0+45;d++){ G2x.day=d; PHONE.tick(G2x); } STORY.phoneRules(GM);
    check('6. 再過幾天、手機規則再跑：不重送',(G2x.msgs||[]).filter(m=>/^zqvoice_/.test(m.tag||'')).length===10,'');
    ADJ=[]; G2x.flags.FX_CAP={}; const r=PHONE.answer(G2x,'zqvoice_9',0); const th=(G2x.msgs||[]).filter(m=>m.th==='p:'+ZQ).map(m=>m.text);
    check('6. 回第九則第一個：貼出去照選項字、她回「你下載了」「……你是第四十一個」、她的戀愛 +1',!!r&&th.includes(ZV.reply9.opts[0].t)&&th.includes('你下載了')&&th.includes('……你是第四十一個')&&sumAdj(ZQ,'npcRom')===1,J({th:th.slice(-4),ADJ}));
    check('6. 回過就不能再回',PHONE.answer(G2x,'zqvoice_9',1)===null,'');
    H.G=G; }
  { const G=fresh('2029-09-08',19,'xs_nanyang'); await watch(G,0); const end=G.day+40; for(let d=G.day;d<=end;d++){ G.day=d; G.hour=23.9; PHONE.tick(G); } G.flags.FX_CAP={}; ADJ=[];
    const r=PHONE.answer(G,'zqvoice_9',1); check('6. 回第九則第二個「恭喜！」：她回「嗯。謝謝」、友情 +1、戀愛 0',!!r&&(G.msgs||[]).some(m=>m.text==='嗯。謝謝'&&m.from===ZQ)&&sumAdj(ZQ,'fam')===1&&sumAdj(ZQ,'npcRom')===0,J(ADJ)); }
  { const G=fresh('2029-09-08',19,'xs_nanyang'); await watch(G,1); STORY.phoneRules(GM);
    check('6. 第三天選「（不回，照她說的。）」＝沒有 ZQ_VOICE_MEMO、不排',G.flags.ZQ_VOICE_MEMO==null&&!PHONE.rec(G).q.some(q=>/^zqvoice_/.test(q.tag))&&G.flags.ZQ_VOICE_Q==null,''); }
  { const G=fresh('2029-09-08',19,'xs_nanyang'); const {D0}=await watch(G,0,6); const now=G.day*24+G.hour;
    const Q=PHONE.rec(G).q.filter(q=>/^zqvoice_/.test(q.tag)).sort((x,y)=>(x.day*24+x.h)-(y.day*24+y.h));
    const days=Q.map(q=>q.day-D0);
    check('6. 回得晚（第三天那則過了 6 天才回）：不補在過去、從現在起一天一則、照順序，之後照原本的日子',Q.length===10&&Q.every(q=>q.day*24+q.h>now)&&J(Q.map(q=>q.tag))===J(OFF.map((o,i)=>'zqvoice_'+(i+1)))&&days.every((x,i)=>i===0||x>days[i-1])&&J(days.slice(3))===J(OFF.slice(3)),J({D0,now:now-D0*24,days})); }
  { const G=fresh('2029-09-08',19);
    G.msgs=[{day:G.day-30,h:22,th:'p:'+ZQ,from:ZQ,text:'x',tag:'mv745_m2909a_heroine_04_0'}]; check('6. 舊存檔 D0：「第一天」那則訊息的日子',AA811.zqD0(G)===G.day-30,'');
    G.msgs=[]; G.flags.MOVIE_SEEN={[ZQ]:{m2909a:G.day-40}}; check('6. 舊存檔 D0：沒有那則訊息＝看完那天＋1',AA811.zqD0(G)===G.day-39,'');
    G.flags.MOVIE_SEEN={}; G.flags.ZQ_VOICE_MEMO=G.day-20; check('6. 舊存檔 D0：只有 ZQ_VOICE_MEMO＝那一天−2',AA811.zqD0(G)===G.day-22,'');
    G.flags.ZQ_VOICE_D0=G.day-21; check('6. 有 ZQ_VOICE_D0 就照它',AA811.zqD0(G)===G.day-21,'');
    delete G.flags.ZQ_VOICE_D0; G.hour=15; STORY.phoneRules(GM); const Q=PHONE.rec(G).q.filter(q=>/^zqvoice_/.test(q.tag));
    check('6. 舊存檔 ZQ_VOICE_MEMO 已經有、還沒排：手機規則補排十則（都在之後、照順序）',Q.length===10&&G.flags.ZQ_VOICE_Q===G.day-22&&Q.every(q=>q.day*24+q.h>G.day*24+G.hour),J(Q.map(q=>q.day-G.day))); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

// AA_384（企劃線 b6588bf5；AA 2026-10-22 回 LAWWW 的十四題，AA_351 本文同一個 commit 跟著改）可昕「慢慢分手」實作後——不需要瀏覽器。
//   1  讀稿：KXDRIFT.LF（朋友層的訊息回覆、第二批、尾聲朋友版、一學期一次的午餐、畢業那天 12:00）每一句都逐字在 AA_384；AA_384 第 1、2、3、7 項的每一句程式都有；「祐廷在國外」照 MSG_POOL 的 L 層那兩則
//   2  第 1 項 朋友層 R：照朋友以前照短回覆（沒有晚安、生日、新年）；照朋友以後 chat 平常三則輪流、考試週、放假在高雄（她在臺北的放假日用一般版）、深夜（她回的那一刻）、睡了隔天早上回＝一般版；
//        share 三種；晚安兩則輪流（不看熟悉度；白天沒有）；第二批：她的生日 4/24、新年；謝謝、還好嗎不開；祐廷在國外（美國、日本）她那邊 23:30 以後＝L 層那兩則、她照臺灣的時間回；
//        走完 D6 那頓午餐以後真的用朋友層；交往中照舊 L 層
//   3  第 2 項 尾聲：drift＝她在同一桌、最後一個（旁白＋兩句）、沒有前任那一版；一般分手照前任那一版；交往中照舊
//   4  第 3 項 一學期一次的午餐：照朋友的下一個學期起（寒暑假算前一個學期）；第 6 週週四 21:00「週六中午，公館。予樂也來。」；好＝週六 12:30 公館、三套輪流（演過才換下一套）；
//        那天不行＝「好。下次。」那學期不排；沒回＝不排；沒到＝她傳一則、不扣任何數字；交換那一學期（日本大三下、美國大四上）不排；大四下以後沒有；交往中、還沒照朋友都沒有；讀檔時那一週已經過了＝不排
//   5  第 4 項 D6 第一則沒有「祐廷的生日」
//   6  第 5 項 D0、D1、D1b 只看玩家自己約的：她們約你的（INV.offer）兩個人都在那裡直接開始也不問、不算；劇情裡在手機答應的出遊不算；對照：玩家自己約的照算
//   7  第 6 項 D1 拿掉 118 巷
//   8  第 7 項 畢業典禮那天 12:00：drift＝「恭喜。」「下禮拜六換我。……予樂會拍一百張。」；一般分手照舊「恭喜。」
// 修改前（開發分支 8352054b，git archive 匯出的乾淨副本＋.git 連結）：FAILED 27（第 4 節一開始就丟例外，一節算一項）、PASS 14——都是對照項或「本來就該這樣」的確認：
//   讀得到稿、MSG_POOL 的「祐廷在國外」兩則、照朋友以前的短回覆兩項、沒有問課、謝謝還好嗎不開、交往中 L 層、尾聲兩個對照、自然的日子只有放榜、劇情出遊不算、玩家自己約的照算、畢業那天兩個對照。
// 用法：node tests/aa384_kx_friend_unit.js（第 1 節要讀企劃線的 b6588bf5：git fetch 過企劃線才讀得到）
'use strict';
require('./alison.js');   // 讀企劃稿（git show）照匯入工具同一套換：Alison、虛構校名（WORLD-RENAME-1030，docs/WORLD_NAMING.md）
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|PG_DATES|PGDATE|KXOD|KXDRIFT|MSG|MSG_POOL|MSG2_POOL|HV|HOMETOWN_LINES)$/;
const load=f=>{ if(!fs.existsSync(path.join(H.ROOT,f))) return false; let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; };
global.CG_REGISTRY={};
/* index.html 的順序（同 tests/aa351_kx_drift_unit.js）*/
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/data/pg_dates.js','src/pgdates3d.js','src/kxod3d.js','src/kxdrift3d.js']) load(f);
const K=typeof KXDRIFT!=='undefined'?KXDRIFT:{};
const T=(d,h)=>d*24+h, D=k=>STORY.dayOfKey(k), key=d=>CALENDAR.dateOf(d).key, wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const setT=(G,d,h)=>{ G.day=d; G.hour=h; G.weekday=wdOf(d); };
const tick=G=>{ K.rule(G); if(typeof KXOD!=='undefined'&&KXOD.rule) KXOD.rule(G); for(const q of OUT.expire(G)) OUT.onMissed(GM,q); PHONE.tick(G); };
const go=async(G,q,picks)=>{ if(!q) return []; const dep=T(q.day,q.h)-(q.travelH||0)-0.05; if(T(G.day,G.hour)<dep){ const d=Math.floor(dep/24+1e-9); setT(G,d,dep-d*24); } H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await OUT.go(GM,q); return H.lines(); };
const msgs=(G,th)=>(G.msgs||[]).filter(m=>m.th===(th||'p:kexin'));
const fresh=(k,h,more)=>{ const G=H.fresh(k,h,'dorm',Object.assign({dating_kexin:true,KX_OUR_DAY:{day:'sat',mode:'mid'},EXCHANGE_ROUTE:'TW'},more||{})); ROM.rec(G); return G; };
const R=G=>G.flags.KX_DRIFT||{};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const askOf=(G,id)=>(G.msgs||[]).find(m=>m.ask&&(id instanceof RegExp?id.test(m.ask.id):m.ask.id===id))||null;
const outs=(G,re)=>OUT.rec(G).filter(q=>re.test(String(q.id||'')));
/* [前置] 慢慢分手分開了（KXDRIFT.end）；friend＝D6 已經照朋友（r6 friend，那一天＝friendKey）。真的走過 D6 的在第 2 節最後一項 */
const ended=(k,h,more)=>{ const G=fresh(k,h,more); K.rule(G); K.end(G,'meet'); return G; };
const friendG=(k,h,more,fk)=>{ const G=ended(k,h,more); const r=K.rec(G); r.r6={st:'friend',friend:fk?D(fk):G.day}; return G; };
/* 傳一則，時間走到她回的那一刻：回傳 {r, her:[她回的泡泡]} */
const send=(G,d,h,topic,sub)=>{ setT(G,d,h); MSG.rec(G).sent={}; const before=new Set(G.msgs||[]); const r=MSG.send(G,'kexin',topic,sub);   /* G.msgs 照時間排（測試的日子不一定照順序）：用「新出現的那幾則」找 */
  if(r&&r.at){ const t=T(r.at.day,r.at.h)+0.01, dd=Math.floor(t/24+1e-9); setT(G,dd,t-dd*24); PHONE.tick(G); }
  return {r,her:msgs(G).filter(m=>!before.has(m)&&m.from==='kexin').map(m=>m.text)}; };
const topicsAt=(G,d,h)=>{ setT(G,d,h); MSG.rec(G).sent={}; return MSG.topics(G,'kexin').map(q=>q.k); };
const LFm=(topic,variant)=>((K.LF&&K.LF.msg)||[]).filter(e=>e.topic===topic&&(variant===undefined||e.variant===variant)).map(e=>e.msgs);
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
let cgAt=[]; { const oc=ADV.cg; ADV.cg=function(id){ cgAt.push(H.said.length); return oc.call(this,id); }; }   /* CG-10 出現的時候已經說了幾句（同 tests/epilogue_unit.js）*/
const epi=async(flags)=>{ const G=H.fresh('2034-06-03',18,'dorm',Object.assign({},flags)); graduated(G); G.flags.FIRST_DAY_SEEN=true; PG.rec(G).done.first=1;
  H.said=[]; H.cards=[]; H.cgs=[]; H.entered=[]; H.bgs=[]; cgAt=[]; H.GM.running=true; await H.run('epi'); return G; };
const DRIFT={dating_kexin:false,EX_kexin:true,KX_ENDED:'drift',KX_ENDED_ON:500};

(async()=>{
check('0. 載入 src/kxdrift3d.js：朋友層的句子 KXDRIFT.LF、一學期一次的午餐 ev_kx_drift_r7',!!K.LF&&typeof K.r7Rule==='function'&&STORY_EVENTS.some(e=>e.id==='ev_kx_drift_r7'),String(!!K.LF));

/* ---------- 1 讀稿 ---------- */
await sec(1,async()=>{ let doc=''; try{ doc=cp.execSync('git show b6588bf5:"docs/story_planning/AA_384_可昕慢慢分手_實作後十四題.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
  check('1. 讀得到稿（企劃線 b6588bf5 的 AA_384）',doc.length>1000,String(doc.length));
  const LF=K.LF||{}, L=LF.lunch||{}, prog=[];
  for(const e of (LF.msg||[]).concat(LF.msg2||[])) prog.push(...e.msgs);
  for(const x of (LF.epi||[])) prog.push(x[1]);
  prog.push(L.ask,L.no,L.missed,...(L.opts||[]),...[].concat(...(L.sets||[])),...(LF.grad||[]));
  const vars=[...new Set((LF.msg||[]).map(e=>e.variant).filter(Boolean))];
  const bad=prog.concat(vars).filter(t=>typeof t!=='string'||!doc.includes(t));
  check('1. KXDRIFT.LF 的每一句（訊息回覆、第二批、尾聲、午餐、畢業那天）和情況版的名字都逐字在 AA_384',prog.length>=30&&vars.length===3&&!bad.length,'共 '+prog.length+' 句；不在稿裡：'+JSON.stringify(bad.slice(0,8)));
  const part=(a,b)=>{ const i=doc.indexOf(a), j=doc.indexOf(b,i+1); return i<0?'':doc.slice(i,j<0?undefined:j); };
  const secs=[part('### 1.','### 2.'),part('### 2.','### 3.'),part('### 3.','## B.'),part('### 7.','### 8.')];
  const want=new Set(); for(const s of secs) for(const ln of s.split('\n')){ if(/^#/.test(ln.trim())) continue; for(const q of ln.matchAll(/「([^」]+)」/g)) want.add(q[1]); }
  want.delete('問課'); want.delete('照朋友');   /* 「可昕本來就沒有『問課』這個話題」「從『照朋友』的下一個學期起」：話題、規則的名字，不是台詞 */
  const miss=[...want].filter(w=>!prog.some(t=>typeof t==='string'&&(t===w||t.includes(w))));
  check('1. AA_384 第 1、2、3、7 項的每一句（表格裡她回的、第二批、旁白、午餐的手機字和三套、沒到、畢業那天）程式都有',want.size>=30&&!miss.length,'共 '+want.size+' 句；程式沒有：'+JSON.stringify(miss.slice(0,8)));
  const ev=STORY_EVENTS.find(e=>e.id==='ev_kx_drift_r7'), evT=ev?ev.dialogue.filter(l=>typeof l.text==='string').map(l=>l.text):[];
  check('1. 一學期一次的午餐（ev_kx_drift_r7）的對話＝三套（旁白＋她一句，照順序）',evT.length===6&&eq(evT,[].concat(...(L.sets||[])))&&ev.dialogue.filter(l=>typeof l.text==='string').every(l=>/^（/.test(l.text)?l.speaker==null:l.speaker==='kexin'),JSON.stringify(evT));
  const ab=((MSG_POOL.people.kexin||{}).replies||[]).filter(e=>e.topic==='chat'&&e.variant==='祐廷在國外');
  check('1. 「祐廷在國外」照 L 層那兩則（MSG_POOL 可昕：美國路線、日本路線各一）',ab.length===2&&ab.some(e=>(e.tags||[]).includes('美國路線'))&&ab.some(e=>(e.tags||[]).includes('日本路線')),JSON.stringify(ab.map(e=>e.msgs))); });

/* ---------- 2 第 1 項 朋友層 R ---------- */
await sec(2,async()=>{
  { const G=ended('2027-03-01',12); const E=G.flags.KX_ENDED_ON; const s=send(G,E+5,14,'chat'); const tp=topicsAt(G,E+6,22);
    check('2. 照朋友以前（前 60 天）：照 D6 的短回覆「嗯」；晚上沒有晚安',!!s.r&&!!s.r.short&&eq(s.her,['嗯'])&&!tp.includes('night'),JSON.stringify({her:s.her,tp}));
    const G2=ended('2028-03-01',12); setT(G2,D('2028-04-24'),12); const t2=MSG.topics(G2,'kexin').map(q=>q.k);
    check('2. 照朋友以前碰到她的生日（4/24）：沒有「生日快樂」',!t2.includes('bday'),JSON.stringify(t2)); }
  { const G=friendG('2027-09-20',12); const a=send(G,D('2027-10-04'),14,'chat'), b=send(G,D('2027-10-05'),14,'chat'), c=send(G,D('2027-10-06'),14,'chat'), d=send(G,D('2027-10-07'),14,'chat');
    const gen=LFm('chat',null);
    check('2. 照朋友以後 chat 平常：三則輪流（「在爬坡。」「你呢？又在總圖？」→「在宿舍寫報告。」…→「在等公車。」「幹嘛？」→ 又從頭）',gen.length===3&&eq([a.her,b.her,c.her,d.her],[gen[0],gen[1],gen[2],gen[0]])&&eq(gen[0],['在爬坡。','你呢？又在總圖？']),JSON.stringify([a.her,b.her,c.her,d.her]));
    const x=send(G,D('2027-10-25'),14,'chat');
    check('2. 考試週（大三上期中考那一週）：「在念。考完再說。」',eq(x.her,['在念。考完再說。']),JSON.stringify(x.her));
    const y=send(G,D('2027-10-13'),23+1/6,'chat');
    check('2. 深夜（23:10 傳、她 23 點以後回）：「還沒睡。報告寫不完。」「你也早點睡。」',eq(y.her,['還沒睡。報告寫不完。','你也早點睡。'])&&y.r.at.h>=23,JSON.stringify({her:y.her,at:y.r&&y.r.at}));
    const z=send(G,D('2027-10-14'),1,'chat');
    check('2. 01:00 傳（她睡了）：隔天早上才回＝一般版，不是「還沒睡」那一則',!!z.r&&!!z.r.at.late&&z.r.at.h>=8&&gen.some(m=>eq(m,z.her)),JSON.stringify({her:z.her,at:z.r&&z.r.at}));
    const w=send(G,D('2028-01-20'),14,'chat');
    check('2. 寒假、她在高雄：「在高雄。」「（照片：一碗很大的肉燥飯）」',eq(w.her,['在高雄。','（照片：一碗很大的肉燥飯）']),JSON.stringify(w.her));
    const v=send(G,D('2028-12-25'),14,'chat');
    check('2. 放假但她還在臺北（大四寒假 12/25 留在臺北）：一般版',gen.some(m=>eq(m,v.her)),JSON.stringify(v.her));
    const sc=send(G,D('2027-10-08'),14,'share','cat'), sf=send(G,D('2027-10-09'),14,'share','food'), sn=send(G,D('2027-10-10'),14,'share','notes');
    check('2. 分享：貓「木柵大學的貓還是比較胖。」、吃的「看起來不錯。」「下次跟予樂去吃。」、講義「你的字還是一樣醜。」',eq(sc.her,['木柵大學的貓還是比較胖。'])&&eq(sf.her,['看起來不錯。','下次跟予樂去吃。'])&&eq(sn.her,['你的字還是一樣醜。']),JSON.stringify([sc.her,sf.her,sn.her]));
    const tpDay=topicsAt(G,D('2027-10-11'),15), tpNight=topicsAt(G,D('2027-10-11'),22);
    const n1=send(G,D('2027-10-11'),22,'night'), n2=send(G,D('2027-10-12'),22,'night'), n3=send(G,D('2027-10-15'),22,'night');
    check('2. 晚安：晚上才有（下午沒有；不看熟悉度——這個存檔她只有第 1 階）、兩則輪流「晚安。」「嗯，晚安。」',!tpDay.includes('night')&&tpNight.includes('night')&&DATE.stageNum('kexin')<4&&eq([n1.her,n2.her,n3.her],[['晚安。'],['嗯，晚安。'],['晚安。']]),JSON.stringify({tpDay,tpNight,st:DATE.stageNum('kexin'),n:[n1.her,n2.her,n3.her]}));
    check('2. 沒有「問課」',!tpDay.includes('course')&&!tpNight.includes('course'),JSON.stringify(tpDay));
    { const G3=friendG('2027-09-20',12); G3.flags.dating_heroine_02=true; const a=topicsAt(G3,D('2027-10-11'),22); ROM.learn(G3,'kexin','heroine_02','test'); const b=topicsAt(G3,D('2027-10-11'),22);
      check('2. 祐廷和別人交往中：她不知道照樣有晚安；她知道了（ROM.knowsOf）就不開晚安（照 MSG 的規則）',a.includes('night')&&!b.includes('night')&&b.includes('chat'),JSON.stringify({a,b})); }
    setT(G,D('2028-04-24'),12); const tb=MSG.topics(G,'kexin').map(q=>q.k); const bd=send(G,D('2028-04-24'),12,'bday');
    check('2. 第二批：她的生日 4/24 有「生日快樂」→「謝謝。」「……你還記得喔。」',tb.includes('bday')&&eq(bd.her,['謝謝。','……你還記得喔。']),JSON.stringify({tb,her:bd.her}));
    setT(G,D('2028-01-01'),12); const tn=MSG.topics(G,'kexin').map(q=>q.k); const ny=send(G,D('2028-01-01'),12,'newyear');
    check('2. 第二批：新年（1/1）「新年快樂」→「新年快樂。」「（長頸鹿貼圖）」',tn.includes('newyear')&&eq(ny.her,['新年快樂。','（長頸鹿貼圖）']),JSON.stringify({tn,her:ny.her}));
    setT(G,D('2027-11-17'),12); G.events.last.ev_kexin_bad_exam=D('2027-11-16'); const tk=MSG.topics(G,'kexin').map(q=>q.k);
    check('2. 謝謝、還好嗎不開（她考壞的隔天也沒有「還好嗎」）',!tk.includes('ok')&&!tk.includes('thanks'),JSON.stringify(tk)); }
  { const G=friendG('2028-09-01',12,{EXCHANGE_ROUTE:'US'}); const s=send(G,D('2028-10-12'),11.6,'chat'), tw=s.r?T(s.r.at.day,s.r.at.h)+12:0, twh=tw-Math.floor(tw/24)*24;
    check('2. 祐廷在美國（交換）、她那邊 23:36 傳（當地 11:36）：她照臺灣的時間回（23:30 以後）＝「我這邊要睡了。」「你那邊應該才剛開始。」',eq(s.her,['我這邊要睡了。','你那邊應該才剛開始。'])&&(twh>=23.5||twh<1),JSON.stringify({her:s.her,at:s.r&&s.r.at,tw:twh}));
    const u=send(G,D('2028-10-13'),2,'chat');
    check('2. 祐廷在美國、當地 02:00（她那邊下午兩點）：不用那一則（一般版）',!!u.r&&LFm('chat',null).some(m=>eq(m,u.her)),JSON.stringify(u.her)); }
  { const G=friendG('2028-03-01',12,{EXCHANGE_ROUTE:'JP'}); const s=send(G,D('2028-04-10'),0.6,'chat');
    check('2. 祐廷在日本、當地 00:36（她那邊 23:36）：「我這邊十二點了。」「你那邊一點了，快去睡。」，當地 00:41～01:06 回（不是隔天早上）',eq(s.her,['我這邊十二點了。','你那邊一點了，快去睡。'])&&!!s.r&&!s.r.at.late&&s.r.at.day===D('2028-04-10')&&s.r.at.h<1.2,JSON.stringify({her:s.her,at:s.r&&s.r.at})); }
  { const G=fresh('2027-10-04',14); const s=send(G,D('2027-10-04'),14,'chat'), L=((MSG_POOL.people.kexin||{}).replies||[]).filter(e=>e.tier==='L').map(e=>JSON.stringify(e.msgs));
    check('2. 對照：交往中照舊 L 層（不是朋友層）',!!s.r&&s.r.ok&&L.includes(JSON.stringify(s.her))&&!LFm('chat').some(m=>eq(m,s.her)),JSON.stringify(s.her)); }
  { const G=ended('2026-12-25',20); const E=G.flags.KX_ENDED_ON; for(let t=T(E+61,20);t<=T(E+61,21.5);t+=0.5){ const d=Math.floor(t/24); setT(G,d,t-d*24); tick(G); }
    const a1=askOf(G,'kx_drift_r6_ask1'); PHONE.answer(G,a1.ask.id,0); tick(G); const q=outs(G,/^kx_drift_r6_/)[0]; await go(G,q,[]);
    const s=send(G,q.day+2,14,'chat');
    check('2. 真的走完 D6 那頓午餐以後：她用朋友層回（不再只回短的）',R(G).r6.st==='friend'&&!!s.r&&!s.r.short&&LFm('chat').some(m=>eq(m,s.her)),JSON.stringify({st:R(G).r6&&R(G).r6.st,her:s.her})); } });

/* ---------- 3 第 2 項 尾聲 ---------- */
await sec(3,async()=>{ const nm=SOCIAL.displayName('kexin');
  { await epi(DRIFT); const iN=H.said.findIndex(s=>s.who==null&&s.t==='（可昕最後一個到，外套還沒脫。）'), a=H.said[iN+1], b=H.said[iN+2], iKai=H.said.findIndex(s=>s.who&&/^所以那個玩家可以告我們嗎/.test(s.t));
    check('3. 分開以後當朋友：她坐在同一桌——旁白「（可昕最後一個到，外套還沒脫。）」、可昕「我遲到了。」「……這次換我。」',iN>=0&&!!a&&a.who===nm&&a.t==='我遲到了。'&&!!b&&b.who===nm&&b.t==='……這次換我。',JSON.stringify(H.said.slice(Math.max(0,iN-1),iN+3)));
    check('3. 照 EPI_ORDER 的位置（最後一個）：在同一桌的人後面（阿凱之後）、在 CG-10 之前；沒有前任那一版（店的另一頭）',iKai>=0&&iN>iKai&&PG.EPI_ORDER[PG.EPI_ORDER.length-1]==='kexin'&&!H.has('我那桌是事務所的人。……你們慢慢吃。')&&cgAt.length>0&&iN+2<cgAt[0],JSON.stringify({iKai,iN,cgAt})); }
  { await epi({dating_kexin:false,EX_kexin:true});
    check('3. 對照：一般分手（不是 drift）照舊是前任那一版，不在同一桌',H.has('我那桌是事務所的人。……你們慢慢吃。')&&!H.has('（可昕最後一個到，外套還沒脫。）')&&!H.has('……這次換我。'),''); }
  { await epi({dating_kexin:true});
    check('3. 對照：交往中照舊（「書狀寫到一半。……先吃。」）',H.has('書狀寫到一半。……先吃。')&&!H.has('……這次換我。'),''); } });

/* ---------- 4 第 3 項 一學期一次的午餐 ---------- */
await sec(4,async()=>{ const THU=t=>STORY.termDay(t,6,4), SAT=t=>STORY.termDay(t,6,6);
  const at21=(G,t)=>{ setT(G,THU(t),21.05); tick(G); return askOf(G,'kx_drift_r7_ask_'+t); };
  const lunch=async(G,t,pick)=>{ const a=at21(G,t); if(!a) return {a,L:null}; PHONE.answer(G,a.ask.id,pick); tick(G); const q=OUT.get(G,'kx_drift_r7_'+t); return {a,q,L:q&&pick===0?await go(G,q,[]):null}; };
  const S1=K.LF.lunch.sets;
  const G=friendG('2027-03-06',12); const a0=at21(G,'Y2S2');
  check('4. 照朋友那個學期（大二下第 2 週照朋友）：第 6 週不約（下一個學期起）',!a0&&!outs(G,/^kx_drift_r7/).length,JSON.stringify(R(G).r7));
  let {a,q,L}=await lunch(G,'Y3S1',0);
  check('4. 下一個學期（大三上）第 6 週週四 21:00：「週六中午，公館。予樂也來。」（「好。」／「那天不行。」）',!!a&&a.text==='週六中午，公館。予樂也來。'&&a.day===THU('Y3S1')&&Math.abs(a.h-21)<0.1&&wdOf(a.day)===4&&eq(a.ask.opts.map(o=>o.t),['好。','那天不行。']),JSON.stringify(a&&{t:a.text,d:key(a.day),h:a.h}));
  check('4. 「好。」：週六 12:30 公館（出遊）',!!q&&q.day===SAT('Y3S1')&&wdOf(q.day)===6&&q.h===12.5&&q.place==='公館',JSON.stringify(q&&{d:key(q.day),h:q.h,p:q.place,t:q.title}));
  check('4. 第一套：旁白「（予樂一坐下就開始講她的報告。…）」、可昕「你還是點一樣的。」',!!L&&L[0]===S1[0][0]&&(L[1]||'').endsWith('你還是點一樣的。')&&L.length===2&&R(G).r7.n===1,JSON.stringify(L));
  ({a,q,L}=await lunch(G,'Y3S2',0));
  check('4. 下一個學期（大三下，台灣路線）：第二套（「（可昕先到，已經幫三個人點好了。）」「予樂說要減肥…」）',!!L&&L[0]===S1[1][0]&&(L[1]||'').endsWith(S1[1][1]),JSON.stringify(L));
  ({a,q,L}=await lunch(G,'Y4S1',1)); const tail=msgs(G).slice(-2).map(m=>(m.from==='player'?'我：':'')+m.text);
  check('4. 「那天不行。」：她回「好。下次。」，那學期不排（沒有出遊）',!!a&&eq(tail,['我：那天不行。','好。下次。'])&&!OUT.get(G,'kx_drift_r7_Y4S1')&&R(G).r7.t.Y4S1.st==='declined',JSON.stringify({tail,x:R(G).r7.t.Y4S1}));
  ({a,q,L}=await lunch(G,'Y4S2',0));
  check('4. 再下一個學期（大四下）照約；不行的那學期沒演，所以是第三套（「（予樂遲到了。可昕看了一下手機。）」「……十二分鐘。她比你還誇張。」）',!!L&&L[0]===S1[2][0]&&(L[1]||'').endsWith(S1[2][1])&&R(G).r7.n===3,JSON.stringify(L));
  setT(G,D('2029-10-11'),21.05); tick(G); setT(G,D('2030-03-28'),21.05); tick(G);
  check('4. 大四下以後（畢業以後）沒有',!(G.msgs||[]).some(m=>m.ask&&/^kx_drift_r7_ask_/.test(m.ask.id)&&m.day>D('2029-06-30')),'');
  /* 沒到 */
  { const G2=friendG('2027-03-06',12); const crack=+G2.flags.KX_CRACK||0, rel=JSON.stringify(SOCIAL.rel('kexin')); const b=at21(G2,'Y3S1'); PHONE.answer(G2,b.ask.id,0); tick(G2); const q2=OUT.get(G2,'kx_drift_r7_Y3S1');
    setT(G2,q2.day,13.3); tick(G2); setT(G2,q2.day,14); tick(G2); const mm=msgs(G2).filter(m=>m.tag==='kx_drift_r7_missed_Y3S1').map(m=>m.text);
    check('4. 沒到：她傳「我們吃完了。予樂說你欠她一頓。」，不扣任何數字（KX_CRACK、和她的關係都不變；也不換下一套）',q2.state==='missed'&&eq(mm,['我們吃完了。予樂說你欠她一頓。'])&&(+G2.flags.KX_CRACK||0)===crack&&JSON.stringify(SOCIAL.rel('kexin'))===rel&&(R(G2).r7.n|0)===0&&R(G2).r7.t.Y3S1.st==='missed',JSON.stringify({st:q2.state,mm,n:R(G2).r7.n}));
    const c=at21(G2,'Y3S2'); setT(G2,SAT('Y3S2'),11.6); tick(G2);
    check('4. 到週六 11:30 都沒回：那學期不排（不傳別的）',!!c&&!OUT.get(G2,'kx_drift_r7_Y3S2')&&R(G2).r7.t.Y3S2.st==='noreply'&&msgs(G2).slice(-1)[0].text==='週六中午，公館。予樂也來。',JSON.stringify(R(G2).r7.t.Y3S2)); }
  /* 交換那一學期 */
  { const GJ=friendG('2027-03-06',12,{EXCHANGE_ROUTE:'JP'}); const j=at21(GJ,'Y3S2'), j2=at21(GJ,'Y4S1');
    const GU=friendG('2027-03-06',12,{EXCHANGE_ROUTE:'US'}); const u=at21(GU,'Y4S1'), u2=at21(GU,'Y3S2');
    check('4. 交換那一學期不排：日本路線大三下、美國路線大四上（別的學期照約）',!j&&!!j2&&!u&&!!u2&&R(GJ).r7.t.Y3S2.st==='exch'&&R(GU).r7.t.Y4S1.st==='exch',JSON.stringify({jp:R(GJ).r7.t,us:R(GU).r7.t})); }
  /* 照朋友那天在寒假：算前一個學期 */
  { const GB=friendG('2026-12-01',12,null,'2027-02-15'); const b1=at21(GB,'Y2S2');
    check('4. 照朋友那天在寒假（2/15）：算大二上的寒假，下一個學期（大二下）第 6 週就約',!!b1,JSON.stringify(R(GB).r7)); }
  /* 讀檔時那一週已經過了 */
  { const GL=friendG('2027-03-06',12); setT(GL,SAT('Y3S1'),12); tick(GL);
    check('4. 讀進來的時候第 6 週的週六中午已經過了：這學期不排',!askOf(GL,'kx_drift_r7_ask_Y3S1')&&R(GL).r7.t.Y3S1.st==='late',JSON.stringify(R(GL).r7)); }
  /* 對照：交往中、還沒照朋友 */
  { const GD=fresh('2027-10-01',12); const d1=at21(GD,'Y3S1'); const GE=ended('2027-09-01',12); const e1=at21(GE,'Y3S1');
    check('4. 對照：交往中沒有；分開了、還沒照朋友（D6 那頓午餐以前）也沒有',!d1&&!e1&&!outs(GD,/^kx_drift_r7/).length,''); } });

/* ---------- 5 第 4 項 D6 第一則 ---------- */
await sec(5,async()=>{ const s=JSON.stringify(K.L||{});
  check('5. D6 第一則拿掉「祐廷的生日」：KXDRIFT.L.r6 沒有 bday、沒有「生日快樂。」、沒有 YT_BDAY',!!K.L&&!!K.L.r6&&!('bday' in K.L.r6)&&!/生日快樂。/.test(s)&&!('YT_BDAY' in K),JSON.stringify(Object.keys((K.L&&K.L.r6)||{})));
  const G=ended('2028-09-20',12); const C=K.occasions(G,G.flags.KX_ENDED_ON);
  check('5. 自然的日子只剩放榜、考上（她自己的好消息是都沒有的時候）',C.every(c=>c.kind==='pass'),JSON.stringify(C)); });

/* ---------- 6 第 5 項 只看玩家自己約的 ---------- */
await sec(6,async()=>{ const G=fresh('2026-10-07',12); H.FRIEND('heroine_01'); INV.addContact(G,'heroine_01'); tick(G);
  const iv=INV.offer(G,'heroine_01','noodle',D('2026-10-08'),18,'（測試：她約你明天去公館吃麵）'); const ans=INV.answer(G,iv.id,'yes');
  setT(G,iv.day,iv.h); H.said=[]; H.opts=[]; H.picks=[1]; await INV.startTogether(GM,iv,{obj:{position:{x:0,y:0,z:0}}}); setT(G,iv.day,22); tick(G);
  check('6. 她約你的（INV.offer，例：劇情事件發的邀約）答應了、兩個人都在那裡直接開始：不問「（跟可昕說一聲）」、不記、沒有 D1',!!ans&&ans.res==='accept'&&iv.state==='done'&&!H.opts.some(o=>o.includes('（跟可昕說一聲）'))&&!(R(G).outs||[]).length&&!outs(G,/^kx_drift_r1_/).length,JSON.stringify({opts:H.opts,outs:R(G).outs,st:iv.state}));
  /* 劇情裡在手機答應的出遊：手機一則（回「好。」）→ OUT.plan 的事件 */
  if(!STORY_EVENTS.some(e=>e.id==='ev_t_aa384_story')) STORY_EVENTS.push({id:'ev_t_aa384_story',title:'測試：劇情出遊',participants:['heroine_02'],location:'any',trigger:'outing',background:'dark',hours:1,dialogue:[{scene:'公館'},{speaker:null,text:'（測試：芷若的劇情出遊）'}]});
  const G2=fresh('2026-10-07',12); H.FRIEND('heroine_02'); tick(G2);
  PHONE.post(G2,{th:'p:heroine_02',from:'heroine_02',text:'（測試：週四晚上公館？）',ask:{id:'t_aa384_story',opts:[{t:'好。',set:{T_AA384_STORY:'yes'}}]}}); H.opts=[]; PHONE.answer(G2,'t_aa384_story',0);
  OUT.plan(G2,{id:'t_aa384_story_out',ev:'ev_t_aa384_story',day:D('2026-10-08'),h:18,place:'公館',title:'和芷若：公館',travel:'',travelH:1/6}); const q=OUT.get(G2,'t_aa384_story_out'); await go(G2,q,[]); setT(G2,q.day,22); tick(G2);
  check('6. 劇情裡在手機答應的出遊（公館）：不問、不記、沒有 D1、D1b 不算',q.state==='done'&&!H.opts.some(o=>o.includes('（跟可昕說一聲）'))&&!(R(G2).outs||[]).length&&!outs(G2,/^kx_drift_r1_/).length,JSON.stringify({opts:H.opts,outs:R(G2).outs}));
  /* 對照：玩家自己約的 */
  const G3=fresh('2026-10-07',12); H.FRIEND('heroine_01'); INV.addContact(G3,'heroine_01'); tick(G3); const iv3=INV.accept(G3,'heroine_01','noodle',D('2026-10-08'),18,{by:'player'}); H.opts=[]; H.picks=[1]; await K.invTell(GM,iv3);
  setT(G3,iv3.day,iv3.h); await INV.meet(GM,iv3,null); tick(G3);
  check('6. 對照：玩家自己約的吃飯（INV.accept by player）照問、照記、沒說＝D1',H.opts.some(o=>o.includes('（跟可昕說一聲）'))&&(R(G3).outs||[]).length===1&&outs(G3,/^kx_drift_r1_/).length===1,JSON.stringify({opts:H.opts,outs:(R(G3).outs||[]).length})); });

/* ---------- 7 第 6 項 D1 拿掉 118 巷 ---------- */
await sec(7,async()=>{ const ev=STORY_EVENTS.find(e=>e.id==='ev_kx_drift_r1');
  check('7. D1 拿掉 118 巷：KXDRIFT.L.r1.where 只有公館、溫州街；事件裡沒有「118 巷」那一句',!!K.L&&eq(Object.keys(K.L.r1.where),['公館','溫州街'])&&!!ev&&!ev.dialogue.some(l=>typeof l.text==='string'&&/118/.test(l.text)),JSON.stringify(K.L&&K.L.r1.where));
  check('7. 118 巷的區域不算 D1 的地點（公館、溫州街照舊）',K.AREA('lane118')===null&&K.AREA('l118_shop')===null&&K.AREA('noodle')==='公館'&&K.AREA('wz_brunch')==='溫州街'&&K.AREA('wenzhou')==='溫州街',JSON.stringify([K.AREA('lane118'),K.AREA('l118_shop')])); });

/* ---------- 8 第 7 項 畢業典禮那天 12:00 ---------- */
await sec(8,async()=>{ const run=flags=>{ const G=H.fresh('2029-06-02',11.5,'dorm',Object.assign({},flags)); H.at('2029-06-02',12.05); H.tick(); return msgs(G).filter(m=>m.tag==='pg_kx_ex').map(m=>m.text); };
  const a=run(DRIFT);
  check('8. 分開以後當朋友：12:00「恭喜。」「下禮拜六換我。……予樂會拍一百張。」',eq(a,['恭喜。','下禮拜六換我。……予樂會拍一百張。']),JSON.stringify(a));
  const b=run({dating_kexin:false,EX_kexin:true});
  check('8. 對照：其他分開的方式照舊「恭喜。」',eq(b,['恭喜。']),JSON.stringify(b));
  const c=run({dating_kexin:true});
  check('8. 對照：交往中沒有這一則',!c.length,JSON.stringify(c)); });

H.done();
})();

// AA_390（企劃線 5f4b9c7b；任務 ZR-SENDOFF-L-1023、AA389-ZR-SENDOFF-1023）：芷若出發那天（2027-09-02 桃園機場）——不需要瀏覽器。
// 台詞一字照稿（D100、D109）。src/zr_sendoff3d.js（ZRSENDOFF）；期末聚餐的鉤子 src/data/termend_lines.js HOOK_ZR_SENDOFF（選項打開，tests/termend_unit.js 第 12 項）。
//   0 讀稿（每一句台詞、選項、手機都在稿裡）、index.html 接線、人物頁記憶名稱
//   1 第 1 節：有 HOOK_ZR_SENDOFF＝9/1 21:00 兩則＋三個回覆；沒答應、9/2 在外地（寒暑假行事曆的外地活動）＝沒有
//   2 第 2 節：「會到。」「妳東西收好了嗎？」＝她回、排 9/2 08:30 出遊（機場捷運 1 小時）；「沒辦法去」＝她回「好。」、declined、09:40「我出發了。」
//   3 第 3 節：出遊逐句（一般版）、選項（6/3 拿到 TICKET_STUB 的／沒有的換第三個）、媽媽的兩個選項；met、熟悉 +3、自在 +2、記憶 ZR_SAW_OFF
//   4 3-1 交往中：地址那句換、出境那句換成抓手那一句
//   5 第 4 節：會到但 09:30 沒到（出遊沒去）＝missed、09:40「我要進去了。」、不扣關係
//   6 第 5 節：6/3 最後一個班沒到＋演了這一場＝機場給票根（TICKET_STUB）、1B-06 的 9/2 10:00 三則不傳；沒演這一場＝照傳三則
// 修改前（開發分支 39d8642e）：沒有 ZRSENDOFF（全部 FAIL）。用法：node tests/aa390_zr_sendoff_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/y2b_events.js','src/y2b3d.js']) load(f);
const okNew=load('src/zr_sendoff3d.js');
let doc=''; for(const r of ['5f4b9c7b','origin/claude/cool-heisenberg-o8kuqx']){ try{ doc=cp.execSync('git show '+r+':"docs/story_planning/AA_390_芷若2027年9月2日出發那天.md"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); if(doc) break; }catch(e){ doc=''; } }
const inDoc=t=>doc.indexOf(t.replace(/^「|」$/g,''))>=0;
const J=JSON.stringify, ZR='heroine_02', X=()=>typeof ZRSENDOFF!=='undefined'?ZRSENDOFF:null;
const D=k=>STORY.dayOfKey(k);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).slice(0,300)); } };
/* ---- 台詞（照 AA_390 原文抄）---- */
const ASK=['明天八點半，第二航廈。','你說要來的。'], OPTS=['會到。','妳東西收好了嗎？','明天臨時有事，沒辦法去。'], REPLY=['嗯。','收了三次。每次都多一件。','好。'];
const HEAD=['（八點半。她推著一個很大的行李箱，旁邊站著一個比她矮一點的阿姨。）','我媽。','你好。她說有同學要來，我還不信。','……媽。','（她從外套口袋拿出一張摺好的紙。）','那邊的地址。'];
const ADDR='電影看完，寫的那一句寄這裡。', ADDR_GF='二月回來。……第一張明信片寄給你。';
const STUB_L=['（她又拿出一張電影票根。）','這個本來放在櫃台。你沒來拿。'];
const C1=['「到了傳訊息給我。」','那邊我只寄明信片。……傳訊息的話，我會一直看手機。'], C2=['「電影我還沒看。」','九月才開始。慢慢看。'], C3=['「妳那邊冷嗎？」','查過了，比臺北冷十度。我帶了兩件外套。……我媽又塞了一件。'];
const GO=['（廣播叫了她那班飛機。她把行李箱推給櫃台以後，只剩一個背包。）','好。'], WAVE='（她走到出境的門口，回頭揮了一下手，進去了。）', HAND='（她在門口停了一下，抓了一下你的手，才進去。）';
const MOM='我搭十點的客運回台中。你呢？', M1=['「我回學校。」','好。路上小心。'], M2=['「我送您到客運站。」','（你們走到客運站。她上車以前，跟你點了一下頭。）'];
const MISS='我要進去了。', DECL='我出發了。';
/* ---- 前置 ---- */
/* [前置] 大二下期末聚餐答應了「出發那天我去送妳」（HOOK_ZR_SENDOFF＝那天；termend_unit.js 第 12 項測選項本身）、有她的聯絡方式、朋友 */
const setup=(key,h,flags,o)=>{ const G=H.fresh(key,h,'dorm',Object.assign({HOOK_ZR_SENDOFF:D('2027-06-11')},flags||{})); G.contacts={}; G.outings=[]; INV.addContact(G,ZR); H.FRIEND(ZR); if(STORY._bindGM) STORY._bindGM(GM); if(o&&o.pre) o.pre(G); return G; };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const herT=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+ZR&&m.from===ZR).map(m=>m.text);
const said=()=>H.said.map(s=>s.t);
const seq=(got,want)=>{ for(let i=0;i+want.length<=got.length;i++) if(want.every((w,k)=>got[i+k]===w)) return true; return false; };
const relOf=()=>{ const r=SOCIAL.rel(ZR); return ['fam','trust','comf','rom'].map(k=>+r[k]||0); };
const asked=()=>PHONE.byAsk(H.G,'zr_sendoff_ask_2027');
const q0=()=>OUT.get(H.G,'zr_sendoff_2027');
const invite=(flags,o)=>{ setup('2027-09-01',20.5,flags,o); rules(); const early=!!asked(); H.at('2027-09-01',21.05); rules(); return {early,m:asked()}; };
const play=async(ans,picks,o)=>{ o=o||{}; invite(o.flags,o); PHONE.answer(H.G,'zr_sendoff_ask_2027',ans); rules(); H.at('2027-09-02',7.4); rules(); const q=q0();
  H.said=[]; H.opts=[]; H.picks=picks.slice(); H.bgs=[]; const r0=relOf(); if(q) await OUT.go(GM,q); return {q,r0,r1:relOf()}; };

(async()=>{
  /* ======================= 0 讀稿、接線 ======================= */
  check('0. 讀稿（企劃線 5f4b9c7b AA_390）',doc.length>2000&&inDoc('## 5. 和其他件事怎麼接'));
  check('0. 新檔載得到：ZRSENDOFF、ev_zr_sendoff_2027（出遊、只演一次）',okNew&&!!X()&&!!ev('ev_zr_sendoff_2027')&&ev('ev_zr_sendoff_2027').trigger==='outing'&&ev('ev_zr_sendoff_2027').once===true);
  { const all=[].concat(ASK,OPTS,REPLY,HEAD,[ADDR,ADDR_GF],STUB_L,C1,C2,C3,GO,[WAVE,HAND,MOM],M1,M2,[MISS,DECL,'她出發那天，你去了機場']); const miss=all.filter(t=>!inDoc(t));
    check('0. 這份測試抄的每一句都在稿裡（'+all.length+' 句）',!miss.length,miss.join('｜')); }
  { const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); check('0. index.html：zr_sendoff3d.js 接在 zr_last3d.js 後面（?v= 一樣）',/src\/zr_last3d\.js\?v=([^"]+)"><\/script>\n<script src="src\/zr_sendoff3d\.js\?v=\1"><\/script>/.test(html)); }
  check('0. 人物頁的記憶名稱：ZR_SAW_OFF',/MEMORY_LABEL\.ZR_SAW_OFF='她出發那天，你去了機場'/.test(fs.readFileSync(path.join(H.ROOT,'src/social3d.js'),'utf8')));

  /* ======================= 1 誰會演 ======================= */
  await sec('1',async()=>{
    const a=invite(); check('1. 答應了送機：9/1 21:00 以前沒有、21:00 兩則（照稿），最後一則帶三個回覆',!a.early&&!!a.m&&J(herT())===J(ASK)&&J(a.m.ask.opts.map(o=>o.t))===J(OPTS),J({t:herT(),o:a.m&&a.m.ask.opts.map(o=>o.t)}));
    const b=invite({HOOK_ZR_SENDOFF:undefined}); delete H.G.flags.HOOK_ZR_SENDOFF; rules(); check('1. 期末沒答應：沒有 9/1 那一則',!asked()&&!herT().length,J(herT()));
    const c=invite(null,{pre:G=>{ G.trips=[{status:'booked',day:D('2027-09-01'),depart:9,back:20,kind:'overnight',nights:1,who:'heroine_01',locs:[]}]; }});
    check('1. 9/2 在外地（兩天一夜的校外約會佔到 9/2）：沒有',!c.m,J(X()&&X().cond(H.G,true))); });

  /* ======================= 2 第 2 節的回覆 ======================= */
  await sec('2',async()=>{
    for(const k of [0,1]){ invite(); PHONE.answer(H.G,'zr_sendoff_ask_2027',k); rules(); const q=q0();
      check('2. 回「'+OPTS[k]+'」：她回「'+REPLY[k]+'」、排 9/2 08:30 機場出遊（機場捷運 1 小時、1.5 小時、alarm）',herT().slice(-1)[0]===REPLY[k]&&!!q&&q.day===D('2027-09-02')&&q.h===8.5&&q.travelH===1&&q.alarm===true&&q.ev==='ev_zr_sendoff_2027',J({t:herT(),q})); }
    invite(); PHONE.answer(H.G,'zr_sendoff_ask_2027',2); rules(); const r0=relOf();
    check('2. 回「沒辦法去」：她回「好。」、declined、沒有出遊',herT().slice(-1)[0]==='好。'&&H.G.flags.ZR_SENDOFF_2027==='declined'&&!q0(),J({t:herT(),f:H.G.flags.ZR_SENDOFF_2027}));
    H.at('2027-09-02',9.6); rules(); check('2. 沒辦法去：09:40 以前沒有那一則',!herT().includes(DECL));
    H.at('2027-09-02',9.7); rules(); check('2. 沒辦法去：09:40「我出發了。」（只有這一句）、不扣關係',herT().slice(-1)[0]===DECL&&!herT().includes(MISS)&&J(relOf())===J(r0),J(herT())); });

  /* ======================= 3 第 3 節（一般版）======================= */
  await sec('3',async()=>{
    const {q,r0,r1}=await play(0,[0,0]); const L=said();
    check('3. 出遊排著、去了：演 ev_zr_sendoff_2027',!!q&&L.length>0,J(q));
    check('3. 開頭照稿：她、媽媽、地址、「電影看完，寫的那一句寄這裡。」',seq(L,HEAD.concat([ADDR])),J(L.slice(0,9)));
    check('3. 芷若媽媽的說話框寫「芷若媽媽」',H.said.filter(s=>s.t===HEAD[2]||s.t===MOM).every(s=>s.who==='芷若媽媽'),J(H.said.filter(s=>s.t===HEAD[2]).map(s=>s.who)));
    check('3. 第一個選項：沒有票根＝「到了傳訊息給我。」「妳那邊冷嗎？」',J(H.opts[0])===J([C1[0],C3[0]]),J(H.opts[0]));
    check('3. 選第一個：她回那一句；之後廣播、「好。」、揮手；媽媽問「你呢？」',seq(L,[C1[1]].concat(GO,[WAVE,MOM]))&&!L.includes(HAND),J(L));
    check('3. 第二個選項：「我回學校。」「我送您到客運站。」；選 0＝「好。路上小心。」',J(H.opts[1])===J([M1[0],M2[0]])&&L.slice(-1)[0]===M1[1],J({o:H.opts[1],e:L.slice(-1)}));
    check('3. 結果：met、熟悉 +3、自在 +2、記憶 ZR_SAW_OFF',H.G.flags.ZR_SENDOFF_2027==='met'&&r1[0]-r0[0]===3&&r1[2]-r0[2]===2&&r1[1]===r0[1]&&SOCIAL.has(ZR,'ZR_SAW_OFF'),J({r0,r1,f:H.G.flags.ZR_SENDOFF_2027}));
    H.at('2027-09-02',11); rules(); check('3. 去了：09:40 那一則不傳',!herT().includes(MISS)&&!herT().includes(DECL),J(herT()));
    const b=await play(1,[1,1],{pre:G=>{ SOCIAL.remember(ZR,'TICKET_STUB','最後一個班，她給的電影票根'); G.flags.ZR_LAST_SHIFT='seen'; G.events.done.ev_zhiruo_last_shift=1; }}); const L2=said();
    check('3. 有票根（6/3 去了）：第三個換「電影我還沒看。」→「九月才開始。慢慢看。」；沒有機場票根那兩句',J(H.opts[0])===J([C1[0],C2[0]])&&L2.includes(C2[1])&&!L2.includes(STUB_L[0]),J(H.opts[0]));
    check('3. 選「我送您到客運站。」：旁白那一句',L2.slice(-1)[0]===M2[1],J(L2.slice(-2))); });

  /* ======================= 4 3-1 交往中 ======================= */
  await sec('4',async()=>{
    await play(0,[0,0],{pre:G=>{ ROM.start(G,ZR); }}); const L=said();
    check('4. 交往中：地址那句換「二月回來。……第一張明信片寄給你。」，媽媽兩句照舊',seq(L,HEAD.concat([ADDR_GF]))&&!L.includes(ADDR),J(L.slice(0,8)));
    check('4. 交往中：出境那一句是「抓了一下你的手，才進去。」（不重複揮手進去那句）',L.includes(HAND)&&!L.includes(WAVE),J(L)); });

  /* ======================= 5 第 4 節：會到但沒去 ======================= */
  await sec('5',async()=>{
    invite(); PHONE.answer(H.G,'zr_sendoff_ask_2027',0); rules(); const r0=relOf(); H.at('2027-09-02',9.55); rules();
    check('5. 會到、09:30 還沒到機場：missed',H.G.flags.ZR_SENDOFF_2027==='missed',J(H.G.flags.ZR_SENDOFF_2027));
    check('5. 09:40 以前沒有那一則',!herT().includes(MISS));
    H.at('2027-09-02',9.7); rules(); check('5. 09:40「我要進去了。」（只有這一句）、不扣關係',herT().slice(-1)[0]===MISS&&herT().filter(t=>t===MISS).length===1&&J(relOf())===J(r0),J(herT()));
    invite(); H.at('2027-09-02',9.7); rules(); check('5. 沒回她（暫定）：照答應了沒來（missed、「我要進去了。」）',H.G.flags.ZR_SENDOFF_2027==='missed'&&herT().slice(-1)[0]===MISS,J({f:H.G.flags.ZR_SENDOFF_2027,t:herT()})); });

  /* ======================= 6 第 5 節：6/3 沒到的票根 ======================= */
  await sec('6',async()=>{
    await play(0,[1,0]); const L=said();
    check('6. 6/3 沒到、演了這一場：地址之後她拿出票根（兩句），記 TICKET_STUB',seq(L,[ADDR].concat(STUB_L))&&SOCIAL.has(ZR,'TICKET_STUB'),J(L.slice(5,10)));
    check('6. 票根是剛在機場拿到的：第三個選項是「妳那邊冷嗎？」（〔有 TICKET_STUB〕＝6/3 就拿到的）',J(H.opts[0])===J([C1[0],C3[0]])&&L.includes(C3[1]),J(H.opts[0]));
    H.at('2027-09-02',10.5); rules(); const t=(H.G.msgs||[]).filter(m=>m.th==='p:'+ZR).map(m=>m.text);
    check('6. 演了這一場：1B-06 的 9/2 10:00 三則（「今天出發去英國了。」）不傳',!t.includes('今天出發去英國了。')&&H.G.flags.ZR_LAST_SHIFT==='airport',J({t,f:H.G.flags.ZR_LAST_SHIFT}));
    invite(); PHONE.answer(H.G,'zr_sendoff_ask_2027',0); rules(); H.at('2027-09-02',10.5); rules(); const t2=(H.G.msgs||[]).filter(m=>m.th==='p:'+ZR).map(m=>m.text);
    check('6. 沒演這一場（會到但沒去）：照 1B-06 傳三則',t2.includes('今天出發去英國了。')&&t2.includes(MISS),J(t2)); });

  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

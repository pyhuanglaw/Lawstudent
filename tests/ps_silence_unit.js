// 沛珊沒交往的線（AA_723 peishan，企劃線 fca9bcb69；AA723-CONFESS-PS-1107）——不需要瀏覽器（D131）。src/ps_silence3d.js＋story3d.js STORY.psNewLine／psPre／psSilent
//   0 index.html：data/aa723.js、ps_silence3d.js 接在 arcinv3d.js 後面（?v= 和旁邊一樣）；import_aa723.py --check
//   1 沉默期 2026-12-18～2028-12-29 18:30（沒交往）：聯絡不到、手機人物頁「很久沒有消息」、約她＝「沛珊沒有回覆。」、私訊只顯示已送達、她不回；
//     交往中照舊（消失期 keep、8/6 以後台中）；舊存檔已經照原本的流程聯絡上（PS_BACK_READ）照舊；重聚以後照一般的朋友
//   2 reply1：12/18 以後傳過 2 則、3/15 當天傳 → 22:30 她回一串（三個選項、rel、say、end 第二句灰字）；只回一次；3/15 22:30 以後才傳＝30 分鐘以後
//   3 reply1：3/15 沒傳（或只傳了那一則）＝4/20 起傳的那一則 30 分鐘以後；4/20 以前不回；之後不再回
//   4 2027-08-06～09-04：沒交往的線沒有 8/7 那通電話、那兩則、第一次回覆「好久不見」、跳過時間不停；12/18～重聚之間她不主動傳（出國時的訊息、10/15 二手書店）
//   5 重聚：12/26 21:00 公法讀書會群組（認識的人才說話；最後是她、Alison 接）、排 12/29 18:30 林家乾麵、那一場照稿（一則都沒傳＝最後換 last2）、
//     演完／沒去／不在群組都記 PS_REUNION、PS_RECONNECT；交往中沒有
//   6 remove：台南、美術館（hometown3d.js）、11/08 試教（r2y4a3d.js）、psReconnected／psOpenOk（r2y4b3d.js、v6b_3d.js）、psEDue（multirel3d.js）、
//     ps_class（termend3d.js）、psCampAuto（r3_3d.js）都要 PS_REUNION；交往中、舊存檔照舊
// （沒做、交 AA：她的動態 AA_506～509 6-3〔feed_y2s2～y4s1 的 ps1d、ps1e～ps4e、ps1f～ps5f、ps1g～ps3g，動態的私訊她會回〕、柏翰說起她的動態 h506～h509 和 AA_723「不出現在任何地方」「沒有人知道」衝突）
// 修改前（開發分支 156774a92＋匯入 8918daa98）：沒有 src/ps_silence3d.js、STORY.psSilent——FAIL。用法：node tests/ps_silence_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
let okLoad=true;
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/aa723.js','src/ps_silence3d.js','src/data/y2b_events.js','src/y2b3d.js','src/data/hometown_lines.js','src/hometown3d.js',
  'src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/v6b_3d.js','src/data/multirel_lines.js','src/multirel3d.js','src/data/r3_events.js','src/r3_3d.js']){
  try{ if(!L3(f)){ okLoad=false; console.log('（沒有 '+f+'）'); } }catch(e){ okLoad=false; console.log('載入 '+f+' 失敗：'+String(e&&e.message||e).slice(0,200)); } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.openPhone=()=>{};
const PS='classmate_peishan', TH='p:'+PS, D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;
const ok=()=>typeof PSSIL!=='undefined'&&!!STORY.psSilent;
const P_=()=>typeof AA723!=='undefined'?AA723.peishan:{reply1:{thread:[],opts:[],end:[]},reunion:{group:[],scene:[],last2:[],plan:{}}};
const setT=(G,key,h)=>{ G.day=D(key); G.hour=h; G.weekday=CALENDAR.dateOf(G.day).wd%7; };
const rules=G=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const run=(G,key,h0,h1,st)=>{ st=st||0.25; for(let h=h0;h<=h1+1e-9;h+=st){ setT(G,key,+h.toFixed(3)); rules(G); } };
/* 沒交往、朋友、有她的聯絡方式、在公法讀書會群組；Alison、以安、阿哲認識 */
const fresh=(key,h,flags,o)=>{ o=o||{}; const G=H.fresh(key,h,'dorm',Object.assign({MET_ZHE:true,met_yu:true},flags||{})); G.contacts={}; G.invites=[]; G.outings=[];
  H.FRIEND(PS); INV.addContact(G,PS); if(o.group!==false) PHONE.join(G,'public_law','公法讀書會'); for(const id of ['yu','zhe']) H.FRIEND(id); if(o.an!==false) H.FRIEND('heroine_01'); return G; };
const dateKeep=G=>{ G.flags.dating_classmate_peishan=true; const r=ROM.get(G,PS); r.status='dating'; r.sinceDay=D('2026-10-01'); return G; };
const freshD=(key,h,flags,o)=>dateKeep(fresh(key,h,flags,o));   /* 2026-10-01 起和她交往（消失期開始時交往中＝AA_276 keep）*/
const thr=G=>(G.msgs||[]).filter(m=>m.th===TH);
const herTx=G=>thr(G).filter(m=>m.from===PS).map(m=>m.text);
const q=(G,tag)=>PHONE.rec(G).q.find(x=>x.tag===tag);
const send=(G,key,h,topic)=>{ setT(G,key,h); const tp=MSG.topics(G,PS); const k=topic&&tp.some(x=>x.k===topic)?topic:(tp[0]&&tp[0].k); return k?MSG.send(G,PS,k):{ok:false,why:'沒有話題'}; };
(async()=>{
/* ---------------- 0 ---------------- */
await sec(0,async()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. index.html：data/aa723.js、ps_silence3d.js 接在 arcinv3d.js 後面（?v= 和旁邊一樣）',/src\/arcinv3d\.js\?v=([^"]+)"><\/script>\n<script src="src\/data\/aa723\.js\?v=\1"><\/script>\n<script src="src\/ps_silence3d\.js\?v=\1"><\/script>/.test(html));
  let out='', good=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_aa723.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); good=/^OK/m.test(out); }catch(e){ out=String(e.stderr||e.message); }
  check('0. src/data/aa723.js 和 AA_723@fca9bcb69 一致（import_aa723.py --check）',good,out.trim().slice(0,200));
  check('0. 模組都載得起來；STORY.psSilent、PSSIL 存在；重聚那一場是 outing 事件',okLoad&&ok()&&STORY_EVENTS.some(e=>e.id==='ev_pssil_reunion'&&e.trigger==='outing')); });
if(!ok()){ H.done(); return; }
/* ---------------- 1 ---------------- */
await sec(1,async()=>{
  const at=(key,h,flags,setup)=>{ const G=fresh(key,h,flags); if(setup) setup(G); return G; };
  const keys=['2026-12-19','2027-03-15','2027-08-07','2027-10-15','2028-01-12','2028-07-20','2028-12-28'];
  const R=keys.map(k=>{ const G=at(k,15); const p=STORY.presence(PS,G), w=STORY.whereIs(GM,PS), o=MSG.open(G,PS); return [k,p.kind,p.away,w&&w.away,INV.whyNot(G,PS),INV.canInvite(G,PS),o.mode]; });
  check('1. 沒交往：12/19、3/15、8/7、10/15、1/12、7/20、12/28 都聯絡不到、手機「很久沒有消息」、約她「沛珊沒有回覆。」、私訊只顯示已送達',R.every(r=>r[1]==='unreachable'&&r[2]==='很久沒有消息'&&r[3]==='很久沒有消息'&&r[4]==='沛珊沒有回覆。'&&r[5]===false&&r[6]==='silent'),J(R));
  { const G=at('2028-12-29',17); const a=STORY.psSilent(G)&&STORY.presence(PS,G).kind==='unreachable'; setT(G,'2028-12-29',19); const b=!STORY.psSilent(G)&&STORY.presence(PS,G).kind!=='unreachable';
    check('1. 12/29 17:00 還在沉默期、18:30 以後不是',a&&b,J(STORY.presence(PS,G))); }
  { const G=at('2027-01-10',15); const r=send(G,'2027-01-10',15); run(G,'2027-01-10',15,26); setT(G,'2027-01-11',12); rules(G);
    check('1. 沉默期傳訊息：已送達（silent）、記在 G.msgs、她不回、手機不排她的回覆',r.ok&&r.silent&&thr(G).filter(m=>m.from==='player').length===1&&!herTx(G).length&&!PHONE.rec(G).q.some(x=>(x.items||[]).some(i=>i.from===PS)),J({r,m:thr(G)})); }
  { const G=at('2027-03-01',15,{},dateKeep); const p=STORY.presence(PS,G); setT(G,'2027-08-10',15); const p2=STORY.presence(PS,G);
    check('1. 交往中照舊：消失期 keep（在台中老家念書）、私訊 keep；8/10 在台中、不是聯絡不到',p.keep===true&&MSG.open(Object.assign({},G,{day:D('2027-03-01')}),PS).mode==='keep'&&p2.kind==='home'&&p2.home==='台中'&&!STORY.psSilent(G),J([p,p2])); }
  { const G=at('2027-10-15',15,{PS_BACK_READ:D('2027-08-07')}); const p=STORY.presence(PS,G);
    check('1. 舊存檔已經照原本流程聯絡上（PS_BACK_READ）：照舊在台南、不是沉默期',!STORY.psNewLine(G)&&!STORY.psSilent(G)&&p.kind==='city'&&p.city==='台南'&&!p.lost&&MSG.open(G,PS).mode!=='silent',J(p)); }
  { const G=at('2029-03-07',15,{PS_REUNION:D('2028-12-29')}); const p=STORY.presence(PS,G);
    check('1. 重聚以後：在台南、不是 lost、私訊照常（不是 silent）',p.kind==='city'&&!p.lost&&MSG.open(G,PS).ok&&MSG.open(G,PS).mode!=='silent'&&!STORY.psPre(G),J([p,MSG.open(G,PS)])); }
  { const G=at('2026-12-10',15); check('1. 12/18 以前照舊（還在臺北、不是沉默期）',!STORY.psSilent(G)&&STORY.presence(PS,G).kind!=='unreachable'); }
});
/* ---------------- 2 reply1：3/15 ---------------- */
await sec(2,async()=>{ const RP=P_().reply1;
  const G=fresh('2027-01-10',15); send(G,'2027-01-10',15); const r=send(G,'2027-03-15',12,'bday'); run(G,'2027-03-15',12,22.25);
  const before=herTx(G).length; setT(G,'2027-03-15',22.5); rules(G); const got=herTx(G);
  check('2. 傳過 2 則、3/15 當天傳（生日快樂）：22:30 以前沒有；22:30 她回 thread 三句＋text',r.ok&&before===0&&J(got)===J(RP.thread.concat([RP.text])),J({before,got,r}));
  const m=PHONE.byAsk(G,'pssil:reply1'); check('2. 最後一則三個選項（照稿）',!!m&&J(m.ask.opts.map(o=>o.t))===J(RP.opts.map(o=>o.t))&&m.h===22.5,J(m&&m.ask));
  const r0=Object.assign({},SOCIAL.rel(PS)); const a=PHONE.answer(G,'pssil:reply1',0); const r1=SOCIAL.rel(PS);
  const tail=thr(G).slice(-5);
  check('2. 回「沒關係，慢慢想。」：信任 +2、她回 say 兩句、接 end 兩句（第二句是旁白：灰字 narr）',!!a&&r1.trust-r0.trust===2&&J(tail.map(x=>x.text))===J([RP.opts[0].t].concat(RP.opts[0].say,RP.end))&&tail[4].narr===true&&tail[4].who==null&&!tail[4].from&&tail[3].from===PS,J({rel:[r0.trust,r1.trust],tail}));
  const n0=herTx(G).length; send(G,'2027-03-20',15); run(G,'2027-03-20',15,24); send(G,'2027-05-02',15); run(G,'2027-05-02',15,24);
  check('2. 只回這一次：之後（3/20、4/20 以後）傳的都不回',herTx(G).length===n0&&MSG.open(G,PS).mode==='silent',J(herTx(G).slice(n0)));
  const G2=fresh('2027-01-10',15); send(G2,'2027-01-10',15); run(G2,'2027-03-15',20,23); send(G2,'2027-03-15',23.5,'bday'); run(G2,'2027-03-15',23.5,25);
  const m2=(G2.msgs||[]).find(x=>x.th===TH&&x.from===PS);
  check('2. 3/15 23:30 才傳：30 分鐘以後（3/16 00:00）她才回，排在你那則後面',!!m2&&T(m2.day,m2.h)===T(D('2027-03-15'),24)&&J(herTx(G2))===J(RP.thread.concat([RP.text])),J(m2&&[m2.day,m2.h]));
  const G3=freshD('2027-03-01',15); send(G3,'2027-03-01',15); send(G3,'2027-03-15',12,'bday'); run(G3,'2027-03-15',12,24);
  check('2. 交往中：沒有 reply1（照 AA_276 的 keep 回）',!PHONE.sent(G3,'pssil_reply1')&&!PHONE.byAsk(G3,'pssil:reply1')); });
/* ---------------- 3 reply1：4/20 以後 ---------------- */
await sec(3,async()=>{ const RP=P_().reply1;
  const G=fresh('2027-01-10',15); send(G,'2027-01-10',15); run(G,'2027-03-15',20,24); send(G,'2027-04-10',15); run(G,'2027-04-10',15,24);
  const b0=herTx(G).length; const t=send(G,'2027-04-22',15); setT(G,'2027-04-22',15.4); rules(G); const b1=herTx(G).length; setT(G,'2027-04-22',15.5); rules(G);
  check('3. 3/15 沒傳：4/10 傳的不回；4/22 15:00 傳的 30 分鐘以後（15:30）她回 reply1',t.ok&&b0===0&&b1===0&&J(herTx(G))===J(RP.thread.concat([RP.text])),J({b0,b1,got:herTx(G)}));
  const c0=SOCIAL.rel(PS).comf; PHONE.answer(G,'pssil:reply1',2); const c1=SOCIAL.rel(PS).comf, n=herTx(G).length; send(G,'2027-05-01',15); run(G,'2027-05-01',15,24);
  check('3. 回「要不要我去台中看妳？」：自在 +1、她回「不要。」「……現在不要。我會再跟你說。」「我先不說了。」；5/1 傳的不再回',c1-c0===1&&herTx(G).length===n&&J(herTx(G).slice(-3))===J(RP.opts[2].say.concat([RP.end[0]])),J({c:[c0,c1],t:herTx(G).slice(-4)}));
  const G2=fresh('2027-03-15',12); send(G2,'2027-03-15',12,'bday'); run(G2,'2027-03-15',12,24); const a=herTx(G2).length; send(G2,'2027-04-21',10); setT(G2,'2027-04-21',10.6); rules(G2);
  check('3. 12/18 以後只傳了 3/15 那一則：3/15 不回；4/21 再傳（第 2 則）30 分鐘以後回',a===0&&J(herTx(G2))===J(RP.thread.concat([RP.text])),J({a,got:herTx(G2)}));
  const G3=fresh('2027-04-25',12); send(G3,'2027-04-25',12); setT(G3,'2027-04-25',13); rules(G3);
  check('3. 整段只傳過 1 則（4/25）：不回（「謝謝你一直傳」要傳過至少 2 則）',!herTx(G3).length); });
/* ---------------- 4 2027-08-06～09-04、她不主動 ---------------- */
await sec(4,async()=>{
  const G=fresh('2027-01-10',15); send(G,'2027-01-10',15); run(G,'2027-08-07',18,23);
  check('4. 消失期傳過訊息（沒交往）：8/7 21:00 她不打來（沒排電話）、沒有那兩則、PS_BACK_READ 不記',!OUT.get(G,'y3_ps_back_call')&&!PHONE.sent(G,'ps_back_read')&&G.flags.PS_BACK_READ==null&&!herTx(G).length,J({out:OUT.get(G,'y3_ps_back_call'),her:herTx(G)}));
  setT(G,'2027-08-07',20); const stop=(CLS.STOP_FNS||[]).map(f=>f(G)).flat().filter(x=>x&&x.why==='手機響了');
  check('4. 8/7 跳過時間不停在「手機響了」',!stop.length,J(stop));
  check('4. 之後第一次傳（8/12）：沒有「好久不見」（只顯示已送達；這一則是 4/20 以後第 2 則＝她回 reply1 那一次）；PS_BACK_FIRST 不記',(()=>{ const r=send(G,'2027-08-12',15); run(G,'2027-08-12',15,24); return r.ok&&r.silent&&!Y2B.psFirstDue(G)&&G.flags.PS_BACK_FIRST==null&&!herTx(G).some(t=>/好久不見/.test(t))&&J(herTx(G))===J(P_().reply1.thread.concat([P_().reply1.text])); })(),J(herTx(G)));
  run(G,'2027-10-15',20,23.5); check('4. 10/15 21:00 二手書店那兩則：沒交往的線不傳',!PHONE.sent(G,'ps_y3_bookstore'));
  const G2=fresh('2027-10-15',20,{PS_BACK_READ:D('2027-08-07')}); run(G2,'2027-10-15',20,22);
  check('4. 舊存檔（8/7 那通接過）：10/15 照舊傳二手書店那兩則',PHONE.sent(G2,'ps_y3_bookstore'));
  const G3=freshD('2027-08-07',20); run(G3,'2027-08-07',20,22); check('4. 交往中：8/7 也沒有那通（照舊只有沒交往的才有）',!OUT.get(G3,'y3_ps_back_call'));
  /* 出國時朋友的訊息（vac3d.js tripMsgs）：沛珊朋友那一則（mid「問你一件事」）2027-08 起沉默期不傳；12/17 以前照舊 */
  const M=VAC_DATA&&VAC_DATA.TRIP_MSG, I0=VAC.all().find(I=>I.A.place&&I.A.place.kind==='abroad'&&I.A.trip&&I.from>D('2027-08-06')&&I.to<D('2028-12-29'));
  if(M&&M.friend&&M.friend[PS]&&I0){ const G4=fresh('2027-01-10',15); setT(G4,CALENDAR.dateOf(I0.from).key,8); VAC.tripMsgs(G4,I0); const has=PHONE.rec(G4).q.some(x=>(x.items||[]).some(i=>i.from===PS));
    check('4. 沉默期出國（'+I0.key+'）：沛珊不傳朋友那一則',!has,J(PHONE.rec(G4).q.filter(x=>(x.items||[]).some(i=>i.from===PS)))); }
  else check('4. 找得到 2027-08～2028-12 的出國活動（測 vac3d.js 朋友的訊息）',false,J({M:!!M,I0:!!I0}));
  const G5=freshD('2027-03-15',12); setT(G5,'2027-08-07',12); const p=STORY.presence(PS,G5);
  check('4. 交往中 8/7：她在台中（不是沉默期），8/6 放榜那天照 AA_276',p.kind==='home'&&!STORY.psSilent(G5)); });
/* ---------------- 5 重聚 ---------------- */
await sec(5,async()=>{ const RU=P_().reunion, d29=D(RU.plan.day);
  const G=fresh('2027-01-10',15); send(G,'2027-01-10',15); run(G,'2028-12-26',20,21.25);
  const grp=(G.msgs||[]).filter(m=>m.th==='g:public_law'&&m.tag==='pssil_reunion_grp').map(m=>[m.from,m.text]);
  check('5. 12/26 21:00 公法讀書會群組：Alison、阿哲、她、Alison、以安（照稿）',J(grp)===J(RU.group),J(grp));
  const o=OUT.get(G,'pssil_reunion');
  check('5. 排進行程：12/29 18:30 溫州街（林家乾麵）「大家和沛珊吃飯」騎車約 10 分鐘',!!o&&o.day===d29&&o.h===18.5&&o.place===RU.plan.place&&o.title===RU.plan.title&&o.travel===RU.plan.travel&&o.ev==='ev_pssil_reunion',J(o));
  setT(G,'2028-12-29',18.2); H.said=[]; await OUT.go(GM,o); const got=H.said.map(s=>s.t);
  check('5. 那一場照稿（十句；她的句子是她說、括號是旁白）',J(got)===J(RU.scene)&&H.said.filter(s=>s.who).every(s=>!/^（/.test(s.t)),J(H.said));
  check('5. 演完：PS_REUNION＝12/29、PS_RECONNECT；之後照一般的朋友（不是沉默期、psReconnected）',G.flags.PS_REUNION===d29&&G.flags.PS_RECONNECT===true&&!STORY.psPre(G)&&!STORY.psSilent(G)&&R2Y4B.psReconnected(G)&&MSG.open(G,PS).mode!=='silent',J({f:G.flags.PS_REUNION,r:G.flags.PS_RECONNECT}));
  const G2=fresh('2028-12-20',12); run(G2,'2028-12-26',20.5,21.25); const o2=OUT.get(G2,'pssil_reunion'); setT(G2,'2028-12-29',18.2); H.said=[]; await OUT.go(GM,o2); const got2=H.said.map(s=>s.t);
  const cut=RU.scene.findIndex(t=>/^（散場的時候/.test(t));
  check('5. 沉默期一則私訊都沒傳：最後換 last2（「（散場的時候，她跟每個人揮手…）」「我們之後再約喔～」），不說原本的最後兩句',J(got2)===J(RU.scene.slice(0,cut).concat(RU.last2))&&!got2.includes(RU.scene[RU.scene.length-1]),J(got2.slice(-4)));
  const G3=fresh('2028-12-20',12,{},{an:false}); run(G3,'2028-12-26',20.5,21.25); const g3=(G3.msgs||[]).filter(m=>m.th==='g:public_law'&&m.tag==='pssil_reunion_grp').map(m=>m.from);
  check('5. 不認識以安：群組裡沒有她那一句；她的那句以後 Alison 接',J(g3)===J(['yu','zhe',PS,'yu']),J(g3));
  const G4=fresh('2028-12-20',12,{},{group:false}); run(G4,'2028-12-26',20.5,21.25);
  const noG=!(G4.msgs||[]).some(m=>m.tag==='pssil_reunion_grp')&&!OUT.get(G4,'pssil_reunion'); run(G4,'2028-12-29',18,19.5);
  check('5. 不在公法讀書會群組：沒有那幾則、不排；12/29 18:30 以後照樣記 PS_REUNION',noG&&G4.flags.PS_REUNION===d29,J(G4.flags.PS_REUNION));
  const G5=fresh('2028-12-20',12); run(G5,'2028-12-26',20.5,21.25); const o5=OUT.get(G5,'pssil_reunion'); setT(G5,'2028-12-29',19.6); OUT.expire(G5).forEach(x=>OUT.onMissed(GM,x));
  check('5. 沒去（過了時間）：記 PS_REUNION、之後照一般的朋友',o5&&o5.state==='missed'&&G5.flags.PS_REUNION===d29&&!STORY.psPre(G5),J(o5));
  const G6=freshD('2028-12-20',12); run(G6,'2028-12-26',20.5,21.25);
  check('5. 交往中：沒有那幾則、不排、不記 PS_REUNION',!(G6.msgs||[]).some(m=>m.tag==='pssil_reunion_grp')&&!OUT.get(G6,'pssil_reunion')&&G6.flags.PS_REUNION==null);
  const G7=fresh('2028-12-20',12,{PS_BACK_READ:D('2027-08-07')}); run(G7,'2028-12-26',20.5,21.25);
  check('5. 舊存檔已經聯絡上（PS_BACK_READ）：沒有重聚那幾則',!(G7.msgs||[]).some(m=>m.tag==='pssil_reunion_grp')); });
/* ---------------- 6 remove ---------------- */
await sec(6,async()=>{
  { const G=fresh('2027-10-13',12); H.CLOSE(PS); const o=HV.offer(G,PS); setT(G,'2027-10-20',21.5); HV.museumPhone(G);
    const G2=fresh('2029-03-07',12,{PS_REUNION:D('2028-12-29')}); H.CLOSE(PS); const o2=HV.offer(G2,PS);
    check('6. hometown3d：沒交往重聚以前不能去台南找她、她不約美術館；重聚以後學期中「我去台南找妳？」出現',o===null&&!PHONE.rec(G).q.some(x=>/^ps_museum_/.test(x.tag||''))&&!!o2,J({o,o2})); }
  { const US={EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar'};
    const go=fl=>{ const G=fresh('2028-11-07',8,Object.assign({},US,fl||{})); const d0=G.day; for(let d=d0;d<=d0+4;d++){ G.day=d; for(const h of [10,14,20,23.9]){ G.hour=h; R2Y4A.phoneY4(G); PHONE.tick(G); } } return PHONE.sent(G,'y4_us_ps_lesson'); };
    const a=go(), b=go({PS_BACK_READ:D('2027-08-07')}), c=go({PS_REUNION:D('2028-11-01')});
    check('6. r2y4a3d 11/08 試教那一則：沒交往的線（還沒重聚）不傳；舊存檔照舊傳；判斷看 PS_REUNION（測試直接記在 11/08 以前＝傳）',!a&&b&&c,J([a,b,c])); }
  { const mk=fl=>{ const G=fresh('2029-03-07',12,fl); return G; };
    const n=mk(), r=mk({PS_REUNION:D('2028-12-29')}), o=mk({PS_BACK_READ:D('2027-08-07')}), dt=dateKeep(mk());
    const A=[R2Y4B.psReconnected(n),R2Y4B.psReconnected(r),R2Y4B.psReconnected(o),R2Y4B.psOpenOk(n),R2Y4B.psOpenOk(r),R2Y4B.psOpenOk(dt),V6B.psReconnected(n),V6B.psReconnected(r)];
    check('6. r2y4b3d psReconnected／psOpenOk、v6b_3d：沒交往看 PS_REUNION；舊存檔、交往中照舊',J(A)===J([false,true,true,false,true,true,false,true]),J(A)); }
  { const X=MREL, setup=fl=>{ const G=fresh('2027-08-20',12,fl); G.day=STORY.termDay('Y3S1',5,3); G.hour=10; H.CLOSE(PS); Object.assign(SOCIAL.rel(PS),{npcRom:40,fam:50,trust:30});
      const st=X.startStrain(G,PS,'kexin',{ver:'base'}); st.result='D'; st.phase='ended'; st.endedDay=STORY.dayOfKey('2027-09-01')-100; return G; };
    const a=X.psEDue(setup()), b=X.psEDue(setup({PS_RECONNECT:true})); const G3=setup({PS_REUNION:D('2028-12-29')}); G3.day=STORY.termDay('Y4S2',3,3); const c=X.psEDue(G3);
    check('6. multirel3d psEDue（分手以後重新開始）：沒交往的線重聚以前不演；舊存檔照舊；重聚以後照原本的條件',!a&&b&&c,J([a,b,c])); }
  { const G=fresh('2028-01-05',20); H.CLOSE(PS); const h1=TERMEND.hookFor(G,'Y3S1',PS); const G2=freshD('2028-01-05',20); H.CLOSE(PS); const h2=TERMEND.hookFor(G2,'Y3S1',PS);
    const c1=TERMEND.c15Plan(G,'ps_class');
    check('6. termend3d ps_class（2028-01-12 台中的國小）：沒交往不播（鉤子不出、不排）；交往中照舊',h1===null&&!c1&&!OUT.get(G,'c15_ps_class')&&!!h2,J([h1,h2&&h2.say])); }
  { const G=fresh('2029-07-24',12,{PS_REUNION:D('2028-12-29')}); const G2=fresh('2029-07-24',12);
    check('6. r3_3d psCampAuto（2029 營隊那幾天自動回）：重聚以後算重新聯絡上；沒重聚不算',R3.psCampAuto(G)&&!R3.psCampAuto(G2)); }
  { const G=fresh('2028-12-29',20,{PS_REUNION:D('2028-12-29')}); STORY.phoneRules(GM); const t=CHARACTERS[PS].tagByPY;
    check('6. 重聚以後資料頁「教育系」（tagByPY ifFlag PS_RECONNECT 由 r2y4b3d 照 PS_REUNION 補記）',G.flags.PS_RECONNECT===true&&J(t[4].ifFlag).includes('PS_RECONNECT'),J(G.flags.PS_RECONNECT)); }
});
H.done();
})();

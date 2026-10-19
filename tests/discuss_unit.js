// 討論型 B 課堂（AA_119；BB 的 syllabus（企劃分支 claude/story-planning）：obs.kind==='discuss'）＋翹課的轉述（AA_104 4-2）——不需要瀏覽器。
// 流程：教授一句 → 教授問（prompt）→ 回想（選項前的）→ 三個看法＋「我想先聽別人說」→ 那個選項的結果 → 兩三位同學依序回應（回想 after 那位的接在後面）→ 教授收尾（不說誰對）。
// 檢查：播放順序；記下玩家的看法（G.courses.disc[record]＝選項序號）；去過就有「理解」（G.flags 的 U_*）；回想讀之前的看法（said 的 {choice}／listened／missed）、
//   去過的課（attended 學期:課程:w週）、人物記憶（memory）、旗標；不計分（出席、準備和一般的課一樣）；舊存檔沒有 disc 從空的開始。
//   翹課：討論週下課後手機多一行那一週的轉述（skip_line）；一般的週「偶爾」（那門課這學期第 1、4、7…次沒去）用那門課的 skip 句子；去了、考試、服務學習、第二天的劇情課不發；
//   下課前不發、只發一次；睡過一整天的，前一天的照下課時間排進訊息。
// 用法：node tests/discuss_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|SYLLABUS|CLS|INV|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/activities.js','src/invites3d.js','src/classes3d.js']) load(f);
/* 這裡檢查討論課的流程：當作每一週都審查過（法律審查的閘門——沒審查的週不用 BB 的內容——在 tests/syllabus_unit.js 檢查）*/
SYLLABUS.reviewed=[]; for(const id in SYLLABUS.courses) for(const w of SYLLABUS.courses[id]) SYLLABUS.reviewed.push(id+'|'+w.w);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const MEM={}; global.SOCIAL={has:(id,tag)=>!!(MEM[id]&&MEM[id].includes(tag)),displayName:id=>(CHARACTERS[id]||{}).name||id};
const said=[]; let answer=0, chose=[];
let G;
const GM={get G(){ return G; },E:{zone:null,interactables:[],player:{busy:false,obj:{position:{x:0,z:0}}}},D:{active:false},S:{},
  sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ said.push(t); },toast(){},caption(){},autosave(){},setGoal(){},enter:async()=>{},
  choose:async o=>{ chose.push(o.map(q=>q.t)); said.push('〔選項〕'); return answer; },fade:async()=>{},sleep:async()=>{},advance(h){ G.hour+=h; },energy(){},money(){}};
const fresh=()=>{ G={day:1,hour:8,weekday:3,zone:'campus',flags:{},energy:80,goal:'',goalDest:null,msgs:[],courses:{}}; return G; };
/* 某學期某週那門課的那一堂（選修就先選它）*/
const itemOf=(term,week,cid)=>{ const c=CLS.byId(cid); if(c&&c.choice) CLS.rec(G).electives[c.choice.group]=cid;
  for(let d=1;d<1700;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==term||t.week!==week) continue; const it=CLS.dayItems(G,d).find(q=>q.c.id===cid); if(it) return it; } return null; };
const obsOf=(cid,w)=>SYLLABUS.courses[cid].find(q=>q.w===w).obs;
const attendAt=async(it,ans)=>{ G.day=it.day; G.hour=it.t0; said.length=0; chose=[]; answer=ans; await CLS.attend(GM,it,{door:true}); return said.slice(); };
(async()=>{
  /* A：民法總則第 14 週（網拍標錯價，U_SALE、U_CONTRACT）*/
  fresh(); const itA=itemOf('Y1S1',14,'civ_general'), ob=obsOf('civ_general',14);
  check('民法總則第 14 週是討論型 B：四個選項（最後一個「我想先聽別人說。」）、兩到三位同學回應、教授收尾、記錄 B_Y1S1_civ_general_w14',!!itA&&ob.kind==='discuss'&&ob.options.length===4&&ob.options[3].text==='我想先聽別人說。'&&ob.replies.length>=2&&ob.replies.length<=3&&!!ob.close&&ob.record==='B_Y1S1_civ_general_w14');
  const L=await attendAt(itA,0);
  const iP=L.indexOf(ob.prompt), iC=L.indexOf('〔選項〕'), iR=L.indexOf(ob.options[0].result), iRep=ob.replies.map(r=>L.findIndex(t=>t.includes(r.text))), iClose=L.findIndex(t=>t.endsWith(ob.close));
  check('順序：教授一句 → 教授問 → 選項 → 選的那個結果 → 同學依序回應 → 教授收尾',L[0].includes(SYLLABUS.courses.civ_general.find(q=>q.w===14).line)&&iP>0&&iC>iP&&iR>iC&&iRep.every((x,k)=>x>iR&&(k===0||x>iRep[k-1]))&&iClose>iRep[iRep.length-1],JSON.stringify(L).slice(0,400));
  check('選項是那四句',JSON.stringify(chose[0])===JSON.stringify(ob.options.map(o=>o.text)),JSON.stringify(chose[0]));
  check('同學回應照人物顯示名字、用引號',ob.replies.every(r=>L.some(t=>t===((CHARACTERS[r.who]||{}).name||r.who)+'：「'+r.text+'」')),L.filter(t=>/：「/.test(t)).join(' / '));
  check('教授收尾有教授的稱呼（不說誰對：照 BB 的句子）',/^周老師：/.test(L[iClose]),L[iClose]);
  const R=CLS.rec(G);
  check('記下玩家的看法：disc.B_Y1S1_civ_general_w14＝0（第一個看法）',R.disc.B_Y1S1_civ_general_w14===0,JSON.stringify(R.disc));
  check('去過就有理解：U_SALE、U_CONTRACT',G.flags.U_SALE===true&&G.flags.U_CONTRACT===true);
  check('不計分：出席 +1、準備 +1（和一般的課一樣）、下課',R.attend.civ_general===1&&R.prep.civ_general===1&&R.done[itA.key]===1);
  /* B：選「我想先聽別人說」*/
  fresh(); const L2=await attendAt(itemOf('Y1S1',14,'civ_general'),3);
  check('選「我想先聽別人說」：結果那一句、同學照樣回應、記下 3',L2.includes(ob.options[3].result)&&ob.replies.every(r=>L2.some(t=>t.includes(r.text)))&&CLS.rec(G).disc.B_Y1S1_civ_general_w14===3);
  /* C：回想讀之前的看法（大四上公法判決研討第 3 週讀大一憲法第 11 週）*/
  const obC=obsOf('public_judgment_sem',3), rc=obC.recall.find(r=>r.record==='B_Y1S1_const_1_w11'), obK=obsOf('const_1',11);
  const runC=async disc=>{ fresh(); if(disc!=null) CLS.rec(G).disc.B_Y1S1_const_1_w11=disc; const it=itemOf('Y4S1',3,'public_judgment_sem'); const L=await attendAt(it,0); return {L,i:L.indexOf('〔選項〕')}; };
  { const {L,i}=await runC(1); const want=rc.said.replace('{choice}',obK.options[1].text); const j=L.indexOf(want);
    check('大一選了第二個看法：大四上那一堂，選項前多一句「'+want+'」',j>=0&&j<i,JSON.stringify(L.slice(0,i+1))); }
  { const {L,i}=await runC(3); const j=L.indexOf(rc.listened); check('大一選「先聽別人說」：「'+rc.listened+'」',j>=0&&j<i); }
  { const {L,i}=await runC(null); const j=L.indexOf(rc.missed); check('大一那一堂沒去：「'+rc.missed+'」',!!rc.missed&&j>=0&&j<i); }
  /* D：回想 attended（after 某位同學）——測試專用的假資料（2026-10-14 課程調整刪了公平交易法，AA_130 第 6 節：改用假資料）：
     把原本公平交易法第 15 週那一堂（討論型，芯慈的回應之後讀大一上經原第 10 週）只在這個測試裡掛到同一個時段的勞動法第 15 週（大三下週四上午）*/
  const FAKE_W15={w:15,tpl:'B',board:['案例討論','（測試用）','三家早餐店同一天漲價'],line:'（測試用）三家早餐店，同一天漲五元。',react:[],
    obs:{kind:'discuss',prompt:'（測試用）你們覺得呢？',options:[{text:'有約好',result:'（測試用）'},{text:'剛好同一天',result:'（測試用）'},{text:'看有沒有交換價格',result:'（測試用）'},{text:'我想先聽別人說。',result:'（測試用）'}],
      replies:[{who:'classmate_xinci',text:'（測試用）大一經原的早餐店賽局。'},{who:'zhe',text:'（測試用）麵店早上沒開。'}],close:'（測試用）',record:'B_Y3S2_labor_law_w15',
      recall:[{attended:'Y1S1:econ_principles_1:w10',say:'（測試用）你想起經原老師說的：囚犯困境的早餐版。',after:'classmate_xinci'}]}};
  const LW=SYLLABUS.courses.labor_law, LWi=LW.findIndex(q=>q.w===15), LW0=LW[LWi]; LW[LWi]=FAKE_W15; const RV=SYLLABUS.reviewed, rvAdd=!RV.includes('labor_law|15'); if(rvAdd) RV.push('labor_law|15');
  const obD=obsOf('labor_law',15), rd=obD.recall[0];
  check('（假資料）大三下週四上午第 15 週的回想：attended Y1S1:econ_principles_1:w10、after classmate_xinci',rd.attended==='Y1S1:econ_principles_1:w10'&&rd.after==='classmate_xinci');
  const runD=async went=>{ fresh(); if(went){ const e=itemOf('Y1S1',10,'econ_principles_1'); CLS.rec(G).done[e.key]=1; } const it=itemOf(obD.record.split('_')[1],15,'labor_law'); return attendAt(it,0); };
  { const L=await runD(true); const ix=L.findIndex(t=>t.includes(obD.replies.find(r=>r.who==='classmate_xinci').text)), j=L.indexOf(rd.say);
    check('去過大一上經原第 10 週：芯慈的回應之後接「'+rd.say+'」',ix>=0&&j===ix+1,JSON.stringify(L.slice(ix,ix+2))); }
  { const L=await runD(false); check('沒去過：沒有那一句',!L.includes(rd.say)); }
  LW[LWi]=LW0; if(rvAdd) RV.splice(RV.indexOf('labor_law|15'),1);   /* 還原：假資料只在這一段 */
  check('attendedWeek：用上課紀錄（日期:課程:時段）找學期與週次',(()=>{ fresh(); const e=itemOf('Y1S1',10,'econ_principles_1'); CLS.rec(G).done[e.key]=1; return CLS.attendedWeek(G,'Y1S1:econ_principles_1:w10')&&!CLS.attendedWeek(G,'Y1S1:econ_principles_1:w11')&&!CLS.attendedWeek(G,'Y1S2:econ_principles_1:w10'); })());
  /* E：回想 memory（行政救濟第 13 週：語彤 LAW_MEETS_LIFE）*/
  const obE=obsOf('admin_remedy',13), re=obE.recall[0];
  { fresh(); MEM.heroine_03=['LAW_MEETS_LIFE']; const L=await attendAt(itemOf(obE.record.split('_')[1],13,'admin_remedy'),0); delete MEM.heroine_03; fresh(); const L0=await attendAt(itemOf(obE.record.split('_')[1],13,'admin_remedy'),0);
    check('語彤記得 LAW_MEETS_LIFE：選項前多一句「'+re.say.slice(0,12)+'…」；沒有那個記憶就沒有',L.includes(re.say)&&!L0.includes(re.say)); }
  /* F：舊存檔 */
  { G={day:3,hour:8,flags:{},courses:{done:{},attend:{},prep:{},electives:{},grades:{},note:{}}}; const R0=CLS.rec(G); check('舊存檔沒有 disc：從空的開始',R0.disc&&typeof R0.disc==='object'&&!Object.keys(R0.disc).length); }
  /* G：翹課的轉述 */
  fresh(); const itS=itemOf('Y1S1',14,'civ_general'), sl=ob.skip_line; G.day=itS.day; G.hour=itS.t1-0.3;
  const wantS='（群組）'+((CHARACTERS[sl.who]||{}).name||sl.who)+'：'+sl.text;
  CLS.skipNotes(GM); check('討論週：下課前不發（同一天前面已經下課的課照常）',!G.msgs.some(m=>m.text===wantS));
  G.hour=itS.t1+0.5; CLS.skipNotes(GM); const m1=G.msgs.find(m=>m.text===wantS);
  check('討論週：下課以後手機多一行那一堂的轉述（skip_line，和 BB 的 skip 句子同一個格式）、時間是下課後',!!m1&&m1.day===itS.day&&Math.abs(m1.h-(itS.t1+0.15))<0.02,m1&&m1.text);
  CLS.skipNotes(GM); check('只發一次',G.msgs.filter(m=>m.text===wantS).length===1);
  /* 3D 場景裡、說轉述的同學不在玩家身邊（例：中午在校園）：照樣發——群組訊息；「同學要真的在教室」（inScene，f977d81b）只管課堂上的反應句。
     2026-10-19 flow_discuss_class B 抓到：修改前不發 */
  fresh(); { const it=itemOf('Y1S1',14,'civ_general'); G.day=it.day; G.hour=it.t1+0.5; global.GAME={E:{npcs:[]}}; global.EVENTS={npcOf:()=>null};
    try{ CLS.skipNotes(GM); } finally { delete global.GAME; delete global.EVENTS; }
    check('3D 場景裡、說轉述的同學不在身邊：照樣發',G.msgs.some(m=>m.text===wantS)); }
  fresh(); { const it=itemOf('Y1S1',14,'civ_general'); CLS.rec(G).done[it.key]=1; G.day=it.day; G.hour=it.t1+1; CLS.skipNotes(GM); check('去上課了：不發',!G.msgs.some(m=>m.text===wantS)); }
  /* 一般的週：偶爾（第 1、4、7…次沒去）*/
  fresh(); { const c=CLS.byId('civ_general'), Ls=c.skipLines||SYLLABUS.skip.civ_general; const weeks=[4,5,6,7]; const got=[];   /* 第 3 週那一堂是第二天的劇情課（不算翹課）*/
    for(const w of weeks){ const it=itemOf('Y1S1',w,'civ_general'); G.day=it.day; G.hour=it.t1+0.5; const before=G.msgs.length; CLS.skipNotes(GM); got.push((G.msgs.slice(before).find(m=>Ls.includes(m.text))||{}).text||''); }
    check('一般的週：這學期第 1 次沒去民總有一行、第 2、3 次沒有、第 4 次換下一句（第 3 週是劇情課，不算）',got[0]===Ls[0]&&!got[1]&&!got[2]&&got[3]===Ls[1%Ls.length],JSON.stringify(got)); }
  /* 睡過一整天：前一天的照下課時間排進訊息（排在今天早上的訊息前面）*/
  fresh(); { const it=itemOf('Y1S1',14,'civ_general'); G.day=it.day+1; G.hour=7.5; INV.msg(G,null,'今天早上的訊息'); CLS.skipNotes(GM); const k=G.msgs.findIndex(m=>m.text===wantS);
    check('睡過那一天：隔天早上補進前一天那堂課的轉述（日期、時間是那堂課下課，排在今天早上的訊息前面）',k===0&&G.msgs[0].day===it.day&&G.msgs[1].text==='今天早上的訊息',JSON.stringify(G.msgs)); }
  /* 不發的：考試、服務學習、第二天的劇情課 */
  fresh(); { const ex=itemOf('Y1S1',8,'civ_general'); G.day=ex.day; G.hour=ex.t1+1; CLS.skipNotes(GM); check('考試週：不發',!G.msgs.length&&!!ex.exam); }
  fresh(); { const sv=itemOf('Y1S1',4,'service_1'); G.day=sv.day; G.hour=sv.t1+1; const before=G.msgs.length; CLS.skipNotes(GM); check('服務學習：不發',!G.msgs.slice(before).some(m=>/服務/.test(m.text))&&!G.msgs.length||G.msgs.every(m=>!/服務學習/.test(m.text))); }
  fresh(); { const d2=CLS.dayItems(G,2).find(q=>q.c.id==='civ_general'); if(d2){ G.day=3; G.hour=8; CLS.skipNotes(GM); check('第二天的民總（劇情課）：隔天不發',!G.msgs.length); } else check('第二天的民總（劇情課）：那天沒有排課',true); }
  fresh(); { G.day=1; G.hour=21.5; const n1=CLS.dayItems(G,1).length; CLS.skipNotes(GM); const a1=G.msgs.length; G.day=2; G.hour=22; const n2=CLS.dayItems(G,2).length; CLS.skipNotes(GM); G.day=3; G.hour=7.5; CLS.skipNotes(GM);
    check('第一、二天（劇情）的課：不算翹課、不發（第一天晚上才到宿舍）',!a1&&!G.msgs.length,'第一天 '+n1+' 堂、第二天 '+n2+' 堂'); }
  /* 使用者 2026-10-16：「第二天……卻顯示當天早上有一堂課沒有參加」——第 2 天遊戲從 13:05 開始，早上的大一英文不排（下午的民總照舊、算劇情課）*/
  fresh(); { const its=CLS.dayItems(G,2); check('第二天：13:05 以前的課不排（大一英文不顯示沒去）',!its.some(q=>q.t0<13)&&its.some(q=>q.c.id==='civ_general'),JSON.stringify(its.map(q=>q.c.name)));
    const d9=CLS.dayItems(G,9); check('之後的週四照常有大一英文',d9.some(q=>q.c.id==='english_y1'),JSON.stringify(d9.map(q=>q.c.name))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

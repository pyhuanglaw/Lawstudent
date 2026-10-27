// AA_463 法律系大三下讀一遍（留在臺灣；企劃線 878496edb，AA-B 2026-10-25 13:1x；D109）——不需要瀏覽器。台詞逐字對 AA_463（從企劃線 git show 讀稿、解析表格）。
//   0 讀稿（第 1 節十則、第 2 節的表、第 3 節那一句、第 4 節三張表）；資料照稿一字不差；新檔載得到
//   1 以安在日本（r2y3b3d.js abPhone／S.abPickT1；台灣、美國路線、還沒交往、T1）：十則照順序各傳一次——3/26 到的那週「公寓房間」（第 7 節改字）、4/9 飯糰（不再是到的第二天）、4/23 櫻花（四月）、
//     6/18 梅雨（六月）、7/30 行李箱（七月底），其他照順序補空的那一週；十則傳完不再傳；每則兩個回覆按鈕、她回一句；舊存檔（原本四則的 n1／n1s）不重傳舊的、接著傳新的
//   2 母親節（home3d.js S.grpPick＋twfill3d.js TWFILL.sisMom）：2028 5/10 姊姊在家人群組問、回了「回。」＝5/11 媽媽「你姊說你禮拜天要回來 不用買東西」（回「會回去」好＋愛心貼圖、
//     回「這週不回」好 那打電話就好）；回「這週不行。」或沒回＝照平常輪（不說母親節）；其他年份（2027）照 AA_458
//   3 端午（twfill3d.js S.zongziHome／TWFILL.zongziShip）：2028 5/25 回「會回去」＝5/28 不傳「粽子寄去宿舍了」；回「這週不回」＝她回「好 那我寄過去」、5/28 照傳；沒回＝5/28 照傳；
//     其他年份回「這週不回」照舊「好 粽子冰起來」
//   4 沛珊在台南（cracktalk3d.js S.ps）：② 照第幾次換（第 1 次原句；回覆①加裂縫、②不加；第 5 次起從第 2 次再輪；舊存檔照已經收過幾次）；③ 照第幾次換（第 5 次起從 2 再輪；舊存檔問過算一次）；
//     ① 照學期換（大三下、大四上、大四下；祐廷的回覆固定）
//   7 第 7 節（企劃線 7fa83ebc9，回 LAWWW-B 施工問題）：② 以安住公寓改字（第 1 則「公寓房間」、第 8 則回覆①「公寓有烘衣機嗎？」→「樓下有。……」）；
//     ③ 沛珊① 觸發條件：第 8 或第 9 週有期中考＝有考試的第一個週五發第 8 週那一版（不加）、兩週都有的第二個週五發第 9 週那一版（+1）；每個她在台南的學期都至少一次，四組都用得到
// 修改前（0b474c8b4）：1～4 每一節至少一項 FAIL；7 在 89ac3bb65 FAIL。用法：node tests/aa463_y3s2_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/msg3d.js','src/zr_uk3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/exchange3d.js',
  'src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js','src/data/twfill_events.js','src/twfill3d.js']) L3(f);   /* index.html 的順序（照 r2y3b_events_unit.js、v6_crack_unit.js、aa342_twfill_unit.js 載的檔）*/
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{};
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const AN='heroine_01', PS='classmate_peishan';
const fresh=(k,h,flags,zone)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign({introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true,ROOM_Y2:true,ROOM_Y3:true,EXCHANGE_ROUTE:'TW',EXCH_RULE:1},flags||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; PHONE.rec(G); E.player.busy=false; E.paused=false; return G; };
const at=(d,h)=>{ const G=H.G; G.day=typeof d==='number'?d:D(d); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const run=(d,h0,h1,st)=>{ st=st||0.25; const dd=typeof d==='number'?d:D(d); for(let h=h0;h<=h1+1e-9;h+=st){ at(dd,+h.toFixed(3)); rules(); } };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const TH=th=>(H.G.msgs||[]).filter(m=>m.th===th);

/* ---- 讀稿（企劃線 878496edb）---- */
let doc=''; try{ doc=cp.execSync('git show 7fa83ebc9:"docs/story_planning/AA_463_法律系大三下讀一遍_以安在日本的私訊_母親節姊姊和媽媽_沛珊的裂縫談話.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const rows=t=>t.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|\s*-/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const strip=s=>String(s||'').replace(/（原句）$/,'').replace(/（`[^）]*）$/,'').trim();
const msgsOf=s=>strip(s).split('／');
const rep=s=>{ const i=s.indexOf('→'); return i<0?null:[s.slice(0,i),msgsOf(s.slice(i+1))]; };
/* 第 1 節 */
const T1R=rows(part('## 1.','## 2.')).filter(r=>/^\d+$/.test(r[0])).map(r=>({n:+r[0],when:r[1],L:msgsOf(r[2]),o1:r[3],o2:r[4]}));
/* 第 7 節②（以安住公寓）：第 1 則、第 8 則回覆①改字，蓋過第 1 節的表 */
const S7=part('## 7.'), S7a=(S7.match(/第 1 則：(.+)$/m)||[])[1], S7b=S7.match(/第 8 則回覆①：「([^」]+)」→ (.+)$/m);
if(S7a&&T1R[0]) T1R[0].L=msgsOf(S7a.trim()); if(S7b&&T1R[7]) T1R[7].o1=S7b[1]+'→'+S7b[2].trim();
const OLD_T1O={'飯糰':[['照 1、2、3 的順序拉。','……你早點說。'],['拉破了也能吃。','我知道。我吃了三個破的。']],'櫻花':[['臺北的已經謝了。','嗯。這邊才剛開。'],['好看。','嗯。']],
  '洗衣機':[['一百圓是多少？','二十幾塊。我記了匯率。'],['手帳記幾頁了？','十一頁。']],'號碼牌':[['辛苦了。','嗯。'],['排到了嗎？','排到了。辦完只要五分鐘。']]};   /* 原本四則的回覆（「照舊」）*/
const oldKey=L=>Object.keys(OLD_T1O).find(k=>L[0].includes(k));
const T1O=T1R.map(r=>r.o1==='照舊'?OLD_T1O[oldKey(r.L)]:[rep(r.o1),rep(r.o2)].map(x=>x&&[x[0],x[1].join('')]));
/* 第 2、3 節 */
const T2=rows(part('## 2.','## 3.')).find(r=>r[0]==='回。')||[];
const MOM_SIS=T2[1], MOM_YES=(T2[2]||'').split('＋'), MOM_NO=T2[3];
const SHIP=((part('## 3.','## 4.').match(/她回的改成「([^」]+)」/)||[])[1]);
const ZONGZI='粽子寄去宿舍了。十顆。分給室友。', MOM_OLD='禮拜天母親節 不用買東西 回來吃飯就好', DRAGON='端午回來嗎 粽子買好了', DRAGON_NO_OLD='好 粽子冰起來';
/* 第 4 節 */
const P2=rows(part('### 4-1.','### 4-2.')).filter(r=>/^\d$/.test(r[0])).map(r=>({ask:strip(r[1]),o:[rep(r[2]),rep(r[3])]}));
const P3=rows(part('### 4-2.','### 4-3.')).filter(r=>/^\d$/.test(r[0])).map(r=>msgsOf(r[1]));
const TERMS={大三上:'Y3S1',大三下:'Y3S2',大四上:'Y4S1',大四下:'Y4S2'};
const P1={}; for(const r of rows(part('### 4-3.','## 5.'))) if(TERMS[r[0]]) P1[TERMS[r[0]]]={ask:strip(r[1]),w8:msgsOf(r[2]),w9:msgsOf(r[3])};

(async()=>{
/* ---- 0 ---- */
await sec(0,()=>{
  check('0. 讀得到稿、檔都載得到（R2Y3B、CRACKTALK、TWFILL、HOME）',!!doc&&!loadErr.length&&['R2Y3B','R2Y3B_EVENTS','CRACKTALK','CRACKTALK_LINES','TWFILL','HOME'].every(n=>typeof globalThis[n]!=='undefined'),J(loadErr));
  check('0. 稿裡讀得到：第 1 節十則（每則照片＋一句、兩個回覆）、第 2 節那一列、第 3 節那一句、4-1 四則、4-2 四則、4-3 四個學期',T1R.length===10&&T1R.every(r=>r.L.length===2&&/^（照片：/.test(r.L[0]))&&T1O.every(o=>!!o&&o.length===2&&o.every(x=>!!x&&!!x[0]&&!!x[1]))&&!!MOM_SIS&&MOM_YES.length===2&&!!MOM_NO&&!!SHIP&&P2.length===4&&P2.every(x=>x.o.every(Boolean))&&P3.length===4&&Object.keys(P1).length===4,
    J({T1R:T1R.map(r=>r.L),T1O,MOM_SIS,MOM_YES,MOM_NO,SHIP,P2,P3,P1}));
  const AB=R2Y3B_EVENTS.AB;
  check('0. AB.t1＝第 1 節十則（照順序；原本四則在第 2、3、4、5 則）',J(AB.t1)===J(T1R.map(r=>r.L)),J(AB.t1));
  check('0. AB.t1O＝第 1 節的回覆（新的六則照稿；「照舊」的四則是原本的回覆）',J(AB.t1O)===J(T1O),J(AB.t1O));
  const X=CRACKTALK_LINES.SRC2;
  check('0. 沛珊② 第 1 次＝ps2 原句、第 2～4 次＝ps2x（照 4-1 的表；回覆①加裂縫、②不加）',X.ps2.ask===P2[0].ask&&J(X.ps2.opts.map(o=>[o[0],o[1]]))===J(P2[0].o)&&(X.ps2x||[]).length===3&&X.ps2x.every((x,i)=>x.ask===P2[i+1].ask&&J(x.opts.map(o=>[o[0],o[1]]))===J(P2[i+1].o)&&x.opts[0][2]===1&&x.opts[1][2]===0),J(X.ps2x));
  check('0. 沛珊③ 第 1 次＝ps3、第 2～4 次＝ps3x（照 4-2 的表）',J(X.ps3)===J(P3[0])&&J(X.ps3x)===J(P3.slice(1)),J([X.ps3,X.ps3x]));
  check('0. 沛珊① 大三上＝原句、大三下／大四上／大四下照 4-3 的表',X.ps1.ask===P1.Y3S1.ask&&J(X.ps1.w8)===J(P1.Y3S1.w8)&&J(X.ps1.w9)===J(P1.Y3S1.w9)&&['Y3S2','Y4S1','Y4S2'].every(t=>J(X.ps1.byTerm[t])===J(P1[t])),J(X.ps1));
});

/* ---- 1 以安在日本：十則 ---- */
const abG=(flags)=>{ fresh('2028-03-26',19,flags); H.FAMILIAR(AN); INV.addContact(H.G,AN); H.G.contacts[AN]=1; return H.G; };
const SUNS=()=>R2Y3B.abSundays();
const t1Of=wk=>byTag('y3_ab_w'+wk).filter(m=>m.from===AN).map(m=>m.text);
const sweep=(from)=>{ const out=[]; for(const w of SUNS()){ if(from&&w.day<from) continue; at(w.day,20.05); rules(); const L=t1Of(w.wk); if(L.length) out.push({wk:w.wk,key:keyOf(w.day),L}); at(w.day+1,19); rules(); } return out; };
await sec(1,()=>{
  abG(); const S=sweep(); const idx=S.map(x=>T1R.findIndex(r=>J(r.L)===J(x.L)));
  check('1. 一直是 T1（沒回）：單週週日 10 則，十則各一次（沒有重複）',S.length===10&&new Set(idx).size===10&&idx.every(i=>i>=0)&&H.G.flags.AN_ABROAD_TIER===1,J(S.map(x=>[x.key,x.L[1]])));
  const on=n=>(S.find(x=>J(x.L)===J(T1R[n-1].L))||{}).key;
  check('1. 3/26（她到日本那週）＝第 1 則「'+T1R[0].L[1]+'」；飯糰「我研究了三天」不在 3/26（4/9）',on(1)==='2028-03-26'&&on(2)==='2028-04-09'&&S[0].L[1]!==T1R[1].L[1],J([on(1),on(2)]));
  check('1. 有月份的照月份：櫻花在四月（'+on(3)+'）、梅雨在六月（'+on(8)+'）、行李箱在七月底（'+on(10)+'）',/^2028-04/.test(on(3)||'')&&/^2028-06/.test(on(8)||'')&&on(10)==='2028-07-30');
  check('1. 其他照順序補空的那一週：1→2→4→5→6→7→9（中間插櫻花、梅雨、行李箱）',J(idx.filter(i=>![2,7,9].includes(i)).map(i=>i+1))===J([1,2,4,5,6,7,9]),J(idx.map(i=>i+1)));
  check('1. 十則傳完：之後的單週不再傳（S.abPickT1 回 -1）',R2Y3B.abPickT1(H.G,R2Y3B.abRec(H.G),D('2028-08-13'),T1R.length)===-1);
  /* 回覆按鈕 */
  abG(); const w11=SUNS().find(w=>keyOf(w.day)==='2028-06-04'); for(const w of SUNS()){ if(w.day>w11.day) break; at(w.day,20.05); rules(); if(w.day<w11.day){ at(w.day+1,19); rules(); } }
  at(w11.day,20.1); const m=PHONE.byAsk(H.G,'y3_ab_w'+w11.wk), six=T1R[5];
  check('1. 6/4 第 6 則「'+six.L[1]+'」：兩個回覆按鈕「'+T1O[5][0][0]+'」「'+T1O[5][1][0]+'」',!!m&&J(t1Of(w11.wk))===J(six.L)&&J(m.ask.opts.map(o=>o.t))===J([T1O[5][0][0],T1O[5][1][0]]),J(m&&m.ask.opts.map(o=>o.t)));
  if(m){ PHONE.answer(H.G,'y3_ab_w'+w11.wk,0); PHONE.tick(H.G); }
  check('1. 回「'+T1O[5][0][0]+'」→ 她回「'+T1O[5][0][1]+'」；算回了',J(TH('p:'+AN).slice(-2).map(x=>x.text))===J([T1O[5][0][0],T1O[5][0][1]])&&(R2Y3B.abSettle(H.G),R2Y3B.abRec(H.G).log.slice(-1)[0].replied===true),J(TH('p:'+AN).slice(-2).map(x=>x.text)));
  /* 舊存檔：原本四則傳過飯糰、櫻花（n1s 舊的位置 1、0）*/
  abG(); const w5=SUNS().find(w=>w.wk===5); at(w5.day,19); H.G.flags.AN_ABROAD={log:[{day:D('2028-03-26'),h:20,kind:'msg',wk:1,tier:1,replied:false},{day:D('2028-04-09'),h:20,kind:'msg',wk:3,tier:1,replied:false}],tier:1,wk:4,n1:2,n1s:[1,0],n2:0,n3:0};
  const So=sweep(w5.day), io=So.map(x=>T1R.findIndex(r=>J(r.L)===J(x.L))+1);
  check('1. 舊存檔（原本四則已經傳過飯糰、櫻花）：4/23 起接新的 4→5→6→7→8（梅雨，六月）→9→10（行李箱，七月底），飯糰、櫻花不再傳；到的那週那則已經過了不補；剩下的傳完那一週（7/16）不傳',J(io)===J([4,5,6,7,8,9,10])&&(So.find(x=>x.L[1]===T1R[7].L[1])||{}).key.slice(0,7)==='2028-06'&&(So.find(x=>x.L[1]===T1R[9].L[1])||{}).key==='2028-07-30',J(So.map(x=>[x.key,T1R.findIndex(r=>J(r.L)===J(x.L))+1])));
  abG(); at(w5.day,19); H.G.flags.AN_ABROAD={log:[],tier:1,wk:4,n1:2,n2:0,n3:0};   /* 更舊的存檔：只有 n1（照原本的輪流＝傳過第 0、1 則：櫻花、飯糰）*/
  const So2=sweep(w5.day), io2=So2.map(x=>T1R.findIndex(r=>J(r.L)===J(x.L))+1);
  check('1. 更舊的存檔（只有 n1:2）：同上',io2[0]===4&&!io2.includes(2)&&!io2.includes(3),J(io2));
  /* 第 4 階以上（T2、T3）的週不傳 T1；回到 T1 再接著傳 */
  abG(); at(D('2028-04-09'),19); H.CLOSE(AN); H.G.flags.AN_ABROAD={log:[{day:D('2028-03-26'),h:20,kind:'msg',wk:1,tier:1,replied:true},{day:D('2028-04-02'),h:20,kind:'msg',wk:2,tier:1,replied:true}],tier:1,wk:2,n1:0,n1s:[],t1s:[0],n2:0,n3:0};
  at(D('2028-04-09'),20.05); rules(); check('1. 第 4 階＋回了：T2，不傳 T1（t1s 不變）',H.G.flags.AN_ABROAD_TIER>=2&&!t1Of(3).some(t=>T1R.some(r=>r.L[1]===t))&&J(R2Y3B.abRec(H.G).t1s)===J([0]),J(R2Y3B.abRec(H.G).t1s));
});

/* ---- 7② 以安住公寓 ---- */
await sec('7',()=>{
  check('7. ② 讀得到第 7 節的兩處改字（第 1 則、第 8 則回覆①）',!!S7a&&!!S7b&&/公寓房間/.test(S7a)&&/^公寓/.test(S7b[1]),J({S7a,S7b:S7b&&S7b.slice(1)}));
  const AB=R2Y3B_EVENTS.AB;
  check('7. ② 第 1 則「'+T1R[0].L[0]+'」、第 8 則回覆①「'+T1O[7][0][0]+'」→「'+T1O[7][0][1]+'」（不再說宿舍）',J(AB.t1[0])===J(T1R[0].L)&&J(AB.t1O[7][0])===J(T1O[7][0])&&!J(AB.t1).includes('宿舍')&&!J(AB.t1O[7]).includes('宿舍'),J([AB.t1[0],AB.t1O[7]]));
  abG(); at(D('2028-03-26'),20.05); rules(); check('7. ② 實際跑 3/26：第一則是「（照片：公寓房間，箱子還沒拆）」',J(t1Of(1))===J(T1R[0].L),J(t1Of(1)));
});

/* ---- 2 母親節 ---- */
const momG=(k,h)=>{ fresh(k,h); PHONE.join(H.G,'home','家人'); return H.G; };
const homeAsk=d=>(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='home_ask_'+d)||null;
const homeAfter=d=>TH('g:home').filter(m=>m.day===d&&m.h>20&&m.from==='mom').map(m=>m.text);
await sec(2,()=>{
  const d10=D('2028-05-10'), d11=D('2028-05-11');
  const sis=(ans)=>{ momG('2028-05-10',20); run(d10,20.75,21.25); const s=byTag('tw_y3_mom_day_ask')[0]; if(s&&ans!=null) PHONE.answer(H.G,'tw_y3_mom_day_ask',ans); run(d11,19.5,20.25); return s; };
  { const s=sis(0), m=homeAsk(d11);
    check('2. [前置] 5/10 21:00 姊姊「禮拜天母親節 你回不回來吃」→ 回「回。」',!!s&&s.from==='sister'&&H.G.flags.Y3_MOM_DAY==='go',J(s&&s.text));
    check('2. 回了「回。」：5/11 20:00 媽媽「'+MOM_SIS+'」（第 2 節；不再問一次）',!!m&&m.text===MOM_SIS&&m.text!==MOM_OLD&&J(m.ask.opts.map(o=>o.t))===J(['會回去','這週不回']),J(m&&m.text));
    if(m) PHONE.answer(H.G,m.ask.id,0); check('2. 回「會回去」→「'+MOM_YES.join('」＋「')+'」',J(homeAfter(d11))===J(MOM_YES),J(homeAfter(d11))); }
  { sis(0); const m=homeAsk(d11); if(m) PHONE.answer(H.G,m.ask.id,1); check('2. 回「這週不回」→「'+MOM_NO+'」',J(homeAfter(d11))===J([MOM_NO]),J(homeAfter(d11))); }
  { sis(1); const m=homeAsk(d11), C=HOME.rec(H.G).grp||{};
    check('2. 姊姊那則回「這週不行。」：5/11 照平常輪（不說母親節）；算一次平常',!!m&&!/母親節/.test(m.text)&&m.text!==MOM_SIS&&(C.p|0)>=1&&['p1','p3','old'].includes(m.ask.k),J(m&&[m.text,m.ask.k,C])); }
  { sis(null); const m=homeAsk(d11);
    check('2. 姊姊那則沒回：5/11 照平常輪（不說母親節）',!!m&&!/母親節/.test(m.text)&&m.text!==MOM_SIS&&m.ask.k!=='mom',J(m&&[m.text,m.ask.k])); }
  { const d=D('2027-05-06'); momG(d,19); run(d,19.5,20.25); const m=homeAsk(d);
    check('2. 其他年份（2027 母親節前的週四，沒有姊姊那則）：照 AA_458「'+MOM_OLD+'」',!!m&&m.text===MOM_OLD&&!PHONE.sent(H.G,'tw_y3_mom_day_ask'),J(m&&m.text)); }
  { momG('2028-05-10',20); H.G.flags.EXCHANGE_ROUTE='JP'; run(d10,20.75,21.25); check('2. 對照：沒有姊姊那則的路線不受影響（TWFILL.sisMom＝null）',TWFILL.sisMom(H.G,d11)===null); }
});

/* ---- 3 端午 ---- */
await sec(3,()=>{
  const d25=D('2028-05-25'), d28=D('2028-05-28');
  const drg=(ans)=>{ momG('2028-05-25',19); run(d25,19.5,20.25); const m=homeAsk(d25); if(m&&ans!=null) PHONE.answer(H.G,m.ask.id,ans); run(d25,20.5,22.5,0.5); for(const k of ['2028-05-26','2028-05-27']) run(D(k),8,23.5,0.5); run(d28,8,13,0.5); return m; };
  { const m=drg(0);
    check('3. [前置] 5/25 20:00 媽媽「'+DRAGON+'」',!!m&&m.text===DRAGON&&m.ask.k==='dragon',J(m&&m.text));
    check('3. 回「會回去」：5/28 12:00 不傳「'+ZONGZI+'」（第 3 節）',!byTag('tw_y3_zongzi').length&&!TH('p:mom').some(x=>x.text===ZONGZI),J(TH('p:mom').map(x=>x.text))); }
  { drg(1); const R=homeAfter(d25), Z=byTag('tw_y3_zongzi');
    check('3. 回「這週不回」：媽媽回「'+SHIP+'」（不是「'+DRAGON_NO_OLD+'」）',J(R)===J([SHIP]),J(R));
    check('3. 回「這週不回」：5/28 12:00 照傳「'+ZONGZI+'」',Z.length===1&&Z[0].text===ZONGZI&&Z[0].day===d28&&Math.abs(Z[0].h-12)<0.01,J(Z.map(x=>[keyOf(x.day),x.h,x.text]))); }
  { drg(null); const Z=byTag('tw_y3_zongzi'); check('3. 沒回：5/28 照傳',Z.length===1&&Z[0].text===ZONGZI,J(Z.map(x=>x.text))); }
  { const d=D('2027-06-03'); momG(d,19); run(d,19.5,20.25); const m=homeAsk(d); if(m) PHONE.answer(H.G,m.ask.id,1);
    check('3. 其他年份（2027 端午前的週四）回「這週不回」：照 AA_458「'+DRAGON_NO_OLD+'」',!!m&&m.text===DRAGON&&J(homeAfter(d))===J([DRAGON_NO_OLD]),J(m&&[m.text,homeAfter(d)])); }
});

/* ---- 4 沛珊 ---- */
const psG=(k)=>{ fresh(k,10,{}); H.CLOSE(PS); INV.addContact(H.G,PS); H.G.contacts[PS]=0; ROM.start(H.G,PS); H.G.flags['dating_'+PS]=true; ROM.get(H.G,PS).sinceDay=D('2027-09-01'); return H.G; };
const termDay=(tid,w,wd)=>{ const R=CALENDAR.termDays(tid); for(let d=R.from;d<=R.to;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===tid&&t.week===w&&wdOf(d)===wd) return d; } return null; };
const ctTxt=tag=>byTag(tag).map(m=>m.text);
const cnt=()=>CRACKTALK.count(H.G,PS), clr=()=>{ const k=CRACKTALK.key(PS); if(k) H.G.flags[k]=0; };
await sec(4,()=>{
  /* ② 四個學期 */
  psG('2027-09-20'); const got=[]; const TT=['Y3S1','Y3S2','Y4S1','Y4S2'];
  for(const [i,tid] of TT.entries()){ const d=termDay(tid,5,3); if(d==null){ got.push(null); continue; } clr(); at(d,23.2); rules(); const tag='ct_ps2_'+tid, m=PHONE.byAsk(H.G,tag);
    got.push({tid,ask:ctTxt(tag)[0],o:m?m.ask.opts.map(o=>o.t):null}); const c0=cnt(); if(m) PHONE.answer(H.G,tag,i===0?1:0); at(d+1,9); rules(); got[i].reply=TH('p:'+PS).filter(x=>x.tag===tag+'_r').map(x=>x.text); got[i].add=cnt()-c0; }
  check('4. ② 大三上～大四下第 5 週週三 23:10：照第幾次換（第 1 次原句，'+P2.slice(1).map(x=>x.ask.slice(0,8)+'…').join('、')+'）',got.every(Boolean)&&got.every((g,i)=>g.ask===P2[i].ask&&J(g.o)===J(P2[i].o.map(x=>x[0]))),J(got.map(g=>g&&[g.tid,g.ask,g.o])));
  check('4. ② 第 1 次回②（不加）、第 2～4 次回①（加裂縫，第 2、3 則又用法律回答、第 4 則不當一回事）；她回的照 4-1 的表',got[0].add===0&&J(got[0].reply)===J(P2[0].o[1][1])&&got.slice(1).every((g,i)=>g.add===1&&J(g.reply)===J(P2[i+1].o[0][1])),J(got.map(g=>g&&[g.add,g.reply])));
  /* 第 5 次起從第 2 次再輪 */
  check('4. ② 第 5 次起從第 2 次再輪（S.nthRot：0,1,2,3,1,2,3,1）',J([0,1,2,3,4,5,6,7].map(c=>CRACKTALK.nthRot(c,4)))===J([0,1,2,3,1,2,3,1]));
  /* 舊存檔：大三上已經收過（舊的 sent，沒有 v2）＝大三下是第 2 次；大三上那則的回覆照第 1 則算 */
  psG('2028-02-20'); const R=CRACKTALK.src(H.G); (R.ps||(R.ps={})).sent={ps2_Y3S1:termDay('Y3S1',5,3)}; const d2=termDay('Y3S2',5,3); at(d2,23.2); rules();
  check('4. ② 舊存檔（大三上已經收過、沒有記第幾則）：大三下＝第 2 則「'+P2[1].ask.slice(0,12)+'…」',ctTxt('ct_ps2_Y3S2')[0]===P2[1].ask,J(ctTxt('ct_ps2_Y3S2')));
  /* ③ 連兩個月沒去台南：每次換 */
  psG('2027-10-01'); const p3=[]; let mm=null;
  for(let d=D('2027-10-01');d<=D('2029-05-31');d++){ if(CALENDAR.dateOf(d+1).key.slice(8)!=='01') continue; clr(); at(d,23.1); rules(); const L=(H.G.msgs||[]).filter(m=>/^ct_classmate_peishan_ps3_/.test(m.tag||'')&&m.day===d).map(m=>m.text); if(L.length) p3.push({k:keyOf(d),L}); if(!H.G.flags['dating_'+PS]) break; }
  const ex3=p3.map((x,i)=>P3[CRACKTALK.nthRot(i,4)]);
  check('4. ③ 連兩個月沒去台南（月底 23:00）：第 1 次「'+P3[0].join('')+'」、之後照 4-2 換，第 5 次起從 2 再輪（共 '+p3.length+' 次）',p3.length>=5&&J(p3.map(x=>x.L))===J(ex3),J(p3.map(x=>[x.k,x.L.join('／')])));
  check('4. ③ 每次照舊 +1（避不掉）',(()=>{ psG('2027-10-01'); at('2027-11-30',23.1); clr(); rules(); return cnt()===1; })());
  /* 舊存檔：問過一次（m3）、沒有 n3＝下一次是第 2 句 */
  psG('2027-10-01'); { const R3=CRACKTALK.src(H.G); (R3.ps||(R3.ps={})).m3='2027-11'; } at('2028-04-30',23.1); clr(); rules();
  const o3=(H.G.msgs||[]).filter(m=>/^ct_classmate_peishan_ps3_/.test(m.tag||'')).map(m=>m.text);
  check('4. ③ 舊存檔（問過一次、沒有記第幾次）：下一次＝第 2 句「'+P3[1].join('')+'」',J(o3)===J(P3[1]),J(o3));
  /* ① 照學期 */
  /* ① 第 7 節③：第 8 或第 9 週有期中考的第一個週五＝第 8 週那一版（不加）；兩週都有的，第二個週五＝第 9 週那一版（+1）*/
  const ME='這週考試，下週好不好？';
  const ps1=(tid)=>{ const f8=termDay(tid,8,5), f9=termDay(tid,9,5); psG(keyOf(f8-3)); const MW=CRACKTALK.midWeeks(H.G,tid); clr(); const c0=cnt(); at(f8,21.05); rules(); const c8=cnt(); at(f9,21.05); rules();
    return {MW,a:ctTxt('ct_ps1_'+tid+'_8'),b:ctTxt('ct_ps1_'+tid+'_9'),add8:c8-c0,add9:cnt()-c8}; };
  const r1={}; for(const tid of ['Y3S1','Y3S2','Y4S1','Y4S2']) r1[tid]=ps1(tid);
  const exp1=(tid,x)=>{ const P=P1[tid], first=[P.ask,ME].concat(P.w8), sec=[P.ask,ME].concat(P.w9);
    if(x.MW[8]&&x.MW[9]) return J(x.a)===J(first)&&x.add8===0&&J(x.b)===J(sec)&&x.add9===1;   /* 兩週都有 */
    if(x.MW[8]) return J(x.a)===J(first)&&x.add8===0&&!x.b.length&&x.add9===0;   /* 只有第 8 週 */
    if(x.MW[9]) return !x.a.length&&J(x.b)===J(first)&&x.add9===0;   /* 只有第 9 週：第 9 週的週五發第 8 週那一版 */
    return false; };
  check('7. ① 大三上～大四下每個她在台南的學期都至少收到一次（第 7 節③）：有考試的第一個週五＝問＋「'+ME+'」＋第 8 週那一版、不加；兩週都有的第二個週五＝第 9 週那一版、+1（'+Object.keys(r1).map(t=>t+':'+(r1[t].MW[8]?'8':'')+(r1[t].MW[9]?'9':'')).join(' ')+'）',
    Object.keys(r1).every(t=>exp1(t,r1[t])),J(r1));
  check('7. ① 四組都用得到（大三上的原句、大三下、大四上、大四下）',new Set(Object.values(r1).map(x=>(x.a[0]||x.b[0]))).size===4&&(r1.Y3S1.a[0]||r1.Y3S1.b[0])===CRACKTALK_LINES.SRC2.ps1.ask,J(Object.values(r1).map(x=>x.a[0]||x.b[0])));
  check('4. ① 大三上、大五上（表上沒有的學期）照原句',!CRACKTALK_LINES.SRC2.ps1.byTerm.Y3S1&&!CRACKTALK_LINES.SRC2.ps1.byTerm.Y5S1);
  /* 只有第 9 週有期中考的學期（目前課表沒有，造一個）：第 9 週的週五發第 8 週那一版、不加 */
  { const tid='Y3S2', f9=termDay(tid,9,5); psG(keyOf(f9-3)); const C=CRACKTALK, keep=C.midWeeks; C.midWeeks=()=>({8:false,9:true}); try{ clr(); at(termDay(tid,8,5),21.05); rules(); const a=ctTxt('ct_ps1_'+tid+'_8'); const c0=cnt(); at(f9,21.05); rules();
      check('7. ① 只有第 9 週有期中考（造的課表）：第 9 週的週五發第 8 週那一版（「'+P1[tid].w8.join('')+'」）、不加',!a.length&&J(ctTxt('ct_ps1_'+tid+'_9'))===J([P1[tid].ask,ME].concat(P1[tid].w8))&&cnt()===c0,J(ctTxt('ct_ps1_'+tid+'_9'))); } finally { C.midWeeks=keep; } }
});

H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });

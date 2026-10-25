// AA_465 法律系大四下讀一遍（企劃線 ee0d6b70d，AA-B 2026-10-25 14:3x）第 1、2 節——不需要瀏覽器。台詞逐字對 AA_465（從企劃線讀稿、解析引文）。第 3 節（r2y4b3d 春假選完的回答）在另一條分支做，這裡不測。
//   0 讀稿（第 1 節媽媽兩則、爸爸一則；第 2 節新舊各兩則）；HOME.GROUP_GRAD、HOME.FAM_DAYS.gradDad、SIDEQ 貓的第 6 張照稿
//   1 畢業典禮那一週的週四（2029-05-31，典禮 06-02 週六）：媽媽兩則「禮拜六典禮 你爸明天回來」「典禮完一起吃中午 你姊也來」，不問、不用回、兩小時後爸爸不傳「？」；
//     原本那天的「考完東西先搬一些回來」（期末下學期）不再出現；排在節日之前（那一週有節日也是畢業那兩則）；別的學期、別的週四不受影響；不是法律系（沒去典禮）照原本；舊存檔那個週四已經收過的不重發；
//     典禮前一天（06-01）21:00 爸爸「📷（桃園機場的入境大廳）」：家人群組、不用回；住家裡的也傳；人在國外、不在家人群組不傳；睡過了照原本的時間補，過了那一段不補
//   2 子晴的貓第 6 張（2029-06-02 12:00）：「（照片：貓趴在一張畢業證書上）」「去年的。今天借牠拍一張。……畢業快樂。」；交往中的「（去看貓）」照舊
//   7 第 7 節（企劃線 9a3de960f）：住家裡（HOME.LIVE_GROUP，載真的 src/jpprep3d.js）的玩家 05-31 媽媽那兩則不發，改成姊姊在家人群組一句 20:00「禮拜六我請假了 典禮見」（不用回、爸爸不傳「？」；
//     那個週四住家裡版的 H1～H6 不另外發）；別的週四住家裡版照舊；06-01 爸爸的照片照舊傳；舊存檔那個週四已經收過住家裡版的不重發
// 修改前（c7d701caf）：0～2 每一節至少一項 FAIL；第 7 節：40cb58935 上 FAIL。用法：node tests/aa465_y4s2_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify, ZQ='heroine_04';
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SIDEQ|ZQTB|MSG|MSG_POOL|MSG2_POOL)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/data/wz_park_layout.js','src/wzpark3d.js','src/wzshops3d.js','src/sideq3d.js']) L3(f);   /* 照 aa397_sideq_unit.js 載的檔 */
GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const at=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); };
const fresh=(k,h,flags,zone)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign({introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; PHONE.rec(G); return G; };
const hr=()=>{ HOME.phoneRules(GM); PHONE.tick(H.G); };
const fam=()=>(H.G.msgs||[]).filter(m=>m.th==='g:home'&&(m.from==='mom'||m.from==='dad'));
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const nm=m=>(m.from==='dad'?'爸爸':'媽媽')+'：'+m.text;

/* ---- 讀稿（企劃線 ee0d6b70d）---- */
let doc=''; try{ doc=cp.execSync('git'+' show ee0d6b70d:"docs/story_planning/AA_465_法律系大四下讀一遍_畢業那一週的家人群組_子晴的貓_八學期總清單.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const quotes=t=>t.split('\n').map(l=>l.trim()).filter(l=>/^> \S/.test(l)).map(l=>l.slice(2)).map(q=>{ const i=q.indexOf('：'); return {who:q.slice(0,i),t:q.slice(i+1)}; });
const P1=part('## 1.','## 2.'), Q1=quotes(P1), MOM=Q1.filter(q=>q.who==='媽媽').map(q=>q.t), DAD=Q1.filter(q=>q.who==='爸爸').map(q=>q.t);
const P2=part('## 2.','## 3.'), Q2=quotes(P2), OLD2=Q2.slice(0,2).map(q=>q.t), NEW2=Q2.slice(2,4).map(q=>q.t);
const GRAD=D('2029-06-02'), THU=GRAD-2, EVE=GRAD-1;
let doc7=''; try{ doc7=cp.execSync('git show 9a3de960f:"docs/story_planning/AA_465_法律系大四下讀一遍_畢業那一週的家人群組_子晴的貓_八學期總清單.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc7=''; }   /* 第 7 節：回 LAWWW-B 的施工問題 */
const P7=(()=>{ const i=doc7.indexOf('## 7.'); return i<0?'':doc7.slice(i); })(), Q7=quotes(P7);

(async()=>{
/* ---- 0 讀稿、資料照稿 ---- */
await sec(0,()=>{
  check('0. 讀得到稿、SIDEQ 載得到',!!doc&&!loadErr.length&&typeof SIDEQ!=='undefined',J(loadErr));
  check('0. 稿裡的都讀得到（第 1 節媽媽兩則、爸爸一則、典禮 2029-06-02、06-01 21:00；第 2 節舊兩則、新兩則）',MOM.length===2&&DAD.length===1&&/2029-06-02/.test(P1)&&/典禮前一天（6\/1）21:00/.test(P1)&&/不問、不用回/.test(P1)&&/爸爸不傳「？」/.test(P1)&&OLD2.length===2&&NEW2.length===2&&Q2.every(q=>q.who==='子晴'),J({MOM,DAD,OLD2,NEW2}));
  check('0. HOME.GROUP_GRAD＝第 1 節媽媽兩則、HOME.FAM_DAYS.gradDad＝爸爸那則',J(HOME.GROUP_GRAD)===J(MOM)&&J((HOME.FAM_DAYS.gradDad||[]).map(x=>x[1]))===J(DAD)&&(HOME.FAM_DAYS.gradDad||[]).every(x=>x[0]==='dad'),J([HOME.GROUP_GRAD,HOME.FAM_DAYS.gradDad]));
  check('0. SIDEQ 貓的第 6 張＝第 2 節的新句（舊句不在）',!!SIDEQ&&J(SIDEQ.LINES.CAT.photos[5])===J(NEW2)&&!J(SIDEQ.LINES.CAT).includes(OLD2[1]),J(SIDEQ&&SIDEQ.LINES.CAT.photos[5]));
});

/* ---- 1 畢業典禮那一週 ---- */
const askOf=d=>(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='home_ask_'+d)||null;
const thuOf=d=>fam().filter(m=>m.day===d&&m.from==='mom').map(m=>m.text);
const sim=(d0,d1)=>{ const out=[]; for(let d=d0;d<=d1;d++){ if(wdOf(d)!==4) continue; at(d,20.05); hr(); at(d,23.5); hr(); out.push({d,key:keyOf(d),t:thuOf(d)}); } return out; };
await sec(1,()=>{
  check('1. 日子：2029-06-02 是週六、05-31 是週四（大四下第 15 週，期末）',wdOf(GRAD)===6&&wdOf(THU)===4&&(CALENDAR.termOf(THU)||{}).id==='Y4S2'&&(CALENDAR.termOf(THU)||{}).exam==='final');
  fresh(D('2029-02-19'),8,{}); PHONE.join(H.G,'home','家人'); const s=sim(D('2029-02-19'),D('2029-06-03'));
  const g=s.find(e=>e.d===THU)||{}, ms=fam().filter(m=>m.day===THU);
  check('1. 05-31 20:00 媽媽兩則「'+MOM.join('」「')+'」（家人群組）',J(g.t)===J(MOM)&&ms.length===2&&ms.every(m=>m.from==='mom'&&m.th==='g:home'&&m.h>=20&&m.h<20.3),J(ms.map(m=>[m.text,m.h])));
  check('1. 不問、不用回：兩則都沒有 ask',ms.every(m=>!m.ask),J(ms.map(m=>m.ask||null)));
  check('1. 兩小時後（22:00 以後）爸爸不傳「？」',!fam().some(m=>m.from==='dad'&&m.day===THU)&&!byTag('home_ask_'+THU+'_dad').length,J(fam().filter(m=>m.day===THU).map(nm)));
  check('1. 原本那天的期末下學期「'+HOME.GROUP_WK.fin2[0]+'」大四下不再出現',!s.some(e=>e.t.includes(HOME.GROUP_WK.fin2[0])),J(s.map(e=>[e.key.slice(5),e.t[0]||null])));
  check('1. 其他週四照舊（5/24 有一句、要回；畢業那兩則只在 05-31）',s.filter(e=>e.d!==THU).every(e=>e.t.length===1&&!MOM.includes(e.t[0]))&&!!askOf(D('2029-05-24')),J(s.map(e=>[e.key.slice(5),e.t])));
  /* 別的學期：沒有 grad */
  const other=CALENDAR.TERMS.filter(t=>/^Y[1-4]S[12]$/.test(t.id)).map(t=>{ const P=HOME.grpPlan(H.G,t.id); return [t.id,Object.keys(P).filter(d=>P[d]==='grad').map(d=>keyOf(+d))]; });
  check('1. 整個大學八學期只有 2029-05-31 是畢業那一週',other.every(([id,L])=>id==='Y4S2'?J(L)===J(['2029-05-31']):!L.length),J(other));
  /* 排在節日之前：那一週有節日（把 06-03 暫時當成端午）也是畢業那兩則 */
  const fst=CALENDAR.fest; let pk;
  try{ CALENDAR.fest=d=>d===GRAD+1?'端午':fst.call(CALENDAR,d); pk=HOME.grpPlan(H.G,'Y4S2')[THU]; } finally { CALENDAR.fest=fst; }
  check('1. 排在節日之前（06-03 暫時當成端午：05-31 照樣是畢業那兩則，不是「端午回來嗎」）',pk==='grad',pk);
  /* 不是法律系（沒去典禮）：照原本 */
  fresh(D('2029-05-28'),8,{}); H.G.stage='econ'; const pe=HOME.grpPlan(H.G,'Y4S2')[THU];
  check('1. 不是法律系（沒有參加典禮的那一組）：照原本（期末下學期）',pe==='fin2',pe);
  /* 舊存檔：05-31 已經用舊的句子收過 */
  fresh(D('2029-05-31'),19,{}); PHONE.join(H.G,'home','家人'); H.G.msgs.push({day:THU,h:20,th:'g:home',from:'mom',name:'媽媽',text:HOME.GROUP_WK.fin2[0],tag:'home_ask_'+THU,ask:{id:'home_ask_'+THU,until:THU*24+22,k:'fin2',opts:[]}}); at(THU,20.5); hr();
  check('1. 舊存檔（05-31 已經收過舊的「'+HOME.GROUP_WK.fin2[0]+'」）：不重發畢業那兩則',thuOf(THU).length===1&&!thuOf(THU).some(t=>MOM.includes(t)),J(thuOf(THU)));
  /* 典禮前一天 21:00 爸爸 */
  const dad=()=>fam().filter(m=>m.from==='dad'&&/^home_grad_dad_/.test(m.tag||'')).map(m=>({t:m.text,day:m.day,h:Math.round(m.h*100)/100,tag:m.tag,ask:!!m.ask}));
  fresh(EVE,20,{}); PHONE.join(H.G,'home','家人'); at(EVE,20.9); hr(); const d0=dad().length; at(EVE,21.05); hr(); const d1=dad();
  check('1. 06-01 21:00 爸爸「'+DAD[0]+'」：家人群組、不用回、tag home_grad_dad_<日>',d0===0&&d1.length===1&&d1[0].t===DAD[0]&&d1[0].day===EVE&&d1[0].h>=21&&d1[0].h<21.3&&!d1[0].ask&&d1[0].tag==='home_grad_dad_'+EVE,J(d1));
  at(EVE,23); hr(); at(GRAD,9); hr(); check('1. 只傳一次',dad().length===1);
  const lh=HOME.livesHome; HOME.livesHome=()=>true; fresh(EVE,21.05,{}); PHONE.join(H.G,'home','家人'); hr(); const dl=dad().length; HOME.livesHome=lh;
  check('1. 住家裡的也傳（同中秋、颱風的爸爸那張）',dl===1);
  const ab=STORY.abroad; STORY.abroad=()=>true; fresh(EVE,21.05,{}); PHONE.join(H.G,'home','家人'); hr(); const da=dad().length; STORY.abroad=ab;
  fresh(EVE,21.05,{}); hr(); const dn=dad().length;
  check('1. 人在國外、不在家人群組：不傳',da===0&&dn===0,J([da,dn]));
  fresh(EVE,20,{}); PHONE.join(H.G,'home','家人'); at(GRAD,8.5); hr();
  check('1. 睡過了（06-02 早上才跑規則）：補在 06-01 21:00',J(dad().map(x=>[x.day,x.h]))===J([[EVE,21]]),J(dad()));
  fresh(GRAD+2,9,{}); PHONE.join(H.G,'home','家人'); hr(); const late=dad().length;
  fresh(EVE,21.05,{}); H.G.stage='econ'; PHONE.join(H.G,'home','家人'); hr(); const ec=dad().length;
  check('1. 過了那一段（06-04 以後才讀檔）不補；不是法律系不傳',late===0&&ec===0,J([late,ec]));
  check('1. 別的日子沒有那張（06-01 以外的前一天，例：2028-06-02 子晴的典禮前一天）',(()=>{ fresh(D('2028-06-02'),21.05,{}); PHONE.join(H.G,'home','家人'); hr(); return dad().length===0; })());
});

/* ---- 2 子晴的貓第 6 張 ---- */
const zq=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+ZQ&&m.from===ZQ);
const setD=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wdOf(d); };
await sec(2,()=>{
  const d6=SIDEQ.firstSat(SIDEQ.PHOTO_MONTHS[5]);
  check('2. 第 6 張的日子＝2029-06-02（你的畢業典禮那天，6 月第一個週六）',d6===GRAD);
  H.fresh('2029-06-01',10,'dorm',{EXCHANGE_ROUTE:'TW'}); H.G.outings=[]; H.FRIEND(ZQ); INV.addContact(H.G,ZQ); setD(GRAD,12.2); SIDEQ.phone(H.G); PHONE.tick(H.G);
  const m=zq().filter(x=>x.tag==='sqcat_ph5'||x.day===GRAD);
  check('2. 06-02 12:00 子晴「'+NEW2.join('」「')+'」（原本「'+OLD2[1]+'」）',J(m.map(x=>x.text))===J(NEW2)&&m.every(x=>x.day===GRAD&&x.h>=12&&x.h<12.3)&&!zq().some(x=>OLD2.includes(x.text)),J(m.map(x=>[x.text,x.h])));
  H.fresh('2029-06-01',10,'dorm',{EXCHANGE_ROUTE:'TW'}); H.G.outings=[]; H.FRIEND(ZQ); INV.addContact(H.G,ZQ); H.date(ZQ); setD(GRAD,12.2); SIDEQ.phone(H.G); PHONE.tick(H.G);
  const v=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='sqcat_visit5');
  check('2. 交往中：最後一則（新句）照舊可以回「（去看貓）」',!!v&&v.text===NEW2[1]&&J(v.ask.opts.map(o=>o.t))===J(['（去看貓）']),J(v&&[v.text,v.ask]));
  H.fresh('2029-06-01',10,'dorm',{EXCHANGE_ROUTE:'TW'}); H.G.outings=[]; H.FRIEND(ZQ); INV.addContact(H.G,ZQ); H.G.msgs.push({day:GRAD,h:12,th:'p:'+ZQ,from:ZQ,text:OLD2[1],tag:'sqcat_ph5'}); setD(GRAD,12.5); SIDEQ.phone(H.G); PHONE.tick(H.G);
  check('2. 舊存檔（已經收過舊的那張）：不重發',zq().length===1&&zq()[0].text===OLD2[1],J(zq().map(x=>x.text)));
});
/* ---- 7 住家裡的玩家：姊姊一句（第 7 節）---- */
await sec(7,()=>{
  const ok=L3('src/data/jpprep_events.js')&&L3('src/jpprep3d.js');   /* 真的住家裡版（AA_442 第 1 節，HOME.LIVE_GROUP）*/
  check('7. 讀得到第 7 節：姊姊一句（5/31 週四 20:00，不用回）、6/1 爸爸照樣傳；住家裡版載得到',Q7.length===1&&Q7[0].who==='姊姊'&&/5\/31 週四 20:00，不用回/.test(P7)&&/住家裡的照樣傳/.test(P7)&&ok&&typeof HOME.LIVE_GROUP==='function',J([Q7,loadErr]));
  check('7. HOME.GRAD_SIS＝「'+(Q7[0]||{}).t+'」',HOME.GRAD_SIS===(Q7[0]||{}).t,HOME.GRAD_SIS);
  const lh=HOME.livesHome, live=()=>{ HOME.livesHome=()=>true; };
  try{
    live(); fresh(D('2029-05-21'),8,{}); PHONE.join(H.G,'home','家人'); for(const d of [THU-7,THU]){ at(d,20.05); hr(); at(d,23.5); hr(); }
    const t=fam().concat((H.G.msgs||[]).filter(m=>m.th==='g:home'&&m.from==='sister')).filter((m,i,a)=>a.indexOf(m)===i), on=d=>t.filter(m=>m.day===d), o=on(THU);
    check('7. 住家裡、05-31 20:00：只有姊姊一則「'+HOME.GRAD_SIS+'」（家人群組、不用回），媽媽那兩則不發、那個週四住家裡版的句子不另外發',o.length===1&&o[0].from==='sister'&&o[0].name==='姊姊'&&o[0].text===(Q7[0]||{}).t&&o[0].th==='g:home'&&!o[0].ask&&o[0].h>=20&&o[0].h<20.3&&o[0].tag==='home_live_'+THU&&!t.some(m=>MOM.includes(m.text)),J(o.map(m=>[m.from,m.text,m.h,m.tag])));
    check('7. 兩小時後爸爸不傳「？」',!t.some(m=>m.day===THU&&m.from==='dad'));
    const w=on(THU-7);
    check('7. 前一個週四（05-24）住家裡版照舊（JPPREP 的一則、沒有姊姊那句）',w.length>=1&&w.every(m=>m.text!==HOME.GRAD_SIS&&!m.ask)&&w.some(m=>/^home_live_/.test(m.tag||'')),J(w.map(m=>[m.from,m.text])));
    live(); fresh(EVE,21.05,{}); PHONE.join(H.G,'home','家人'); hr();
    check('7. 住家裡（真的住家裡版）：06-01 21:00 爸爸的照片照舊傳',fam().filter(m=>m.from==='dad'&&m.text===DAD[0]&&m.day===EVE).length===1,J(fam().map(nm)));
    live(); fresh(THU,19,{}); PHONE.join(H.G,'home','家人'); H.G.msgs.push({day:THU,h:20,th:'g:home',from:'mom',name:'媽媽',text:'（舊的住家裡版）',tag:'home_live_'+THU}); at(THU,20.5); hr();
    check('7. 舊存檔（05-31 已經收過住家裡版那一則）：不重發、沒有姊姊那句',!(H.G.msgs||[]).some(m=>m.text===HOME.GRAD_SIS)&&byTag('home_live_'+THU).length===1);
    HOME.livesHome=lh; fresh(THU,19,{}); PHONE.join(H.G,'home','家人'); at(THU,20.05); hr();
    check('7. 不是住家裡：照第 1 節（媽媽兩則），沒有姊姊那句',J(thuOf(THU))===J(MOM)&&!(H.G.msgs||[]).some(m=>m.text===HOME.GRAD_SIS));
  } finally { HOME.livesHome=lh; }
});
H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });

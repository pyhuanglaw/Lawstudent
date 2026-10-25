// AA_459 法律系大一下讀一遍（企劃線 c0972cd32，AA-B 2026-10-25 10:5x；接 AA_458）——不需要瀏覽器。台詞逐字對 AA_459（從企劃線 git show 讀稿、解析表格與引文）。
//   0 讀稿（1-1、1-2、1-3 的表、2-1～2-3、第 3、4 節的引文、第 5 節的表都讀得到）；HOME.GROUP_WK 的連假②、期中、期末上下學期照稿
//   1 媽媽的週四群組：大一下逐週＝1-3 的表（新開局、舊開局都一樣；平常、長輩圖照「這學期」用到第幾次）；期中只用一次（4/16，4/23 是平常①）；期末下學期 6/11「考完東西先搬一些回來」、
//     期末上學期那句（fin1）照第 8 節（企劃線 cb5caad65）刪掉：大二上 12/24 第 16 週沒被佔走時照平常排；各自的回覆；春天不再說「天氣變涼了」；一字不差的只剩「這週回來吃飯嗎」「回來的話先講 我多煮」各兩次；
//     舊存檔（G.home.grp 沒有學期）不在學期中間重來
//   2 家族群組：2-1 咖哩「下週五」；2-2 沒去咖哩、說過要請的期末那三句換字（tag 照舊）；2-3 學姊上榜聚餐那則，收過咖哩邀約的 Kevin 多一句（沒收過的沒有）
//   3 見習團落選：系統通知帶名字（sel.name）；阿哲私訊兩句（不在麵店團群組）、寒假的活動第二句照舊換；系辦／事務所的信（noGroup）照舊沒有阿哲
//   4 唐睿的即興劇（SK07）和法律生活營籌備會撞期：那晚 19:00 已經有籌備會＝唐睿多一句、要回（「我去。」＝排出遊；「那天晚上有籌備會。」＝「好。品妤會錄。」、不排、那天晚上品妤傳影片）；
//     沒撞期照舊直接排、不問；舊存檔（已經收過 sk07_call）不重發
//   5 四處換字：麵店團春假照片「明天下午」、可昕生日回「謝謝。」、沛珊美術館邀約（date_wish.js，wish_bb.json 的換字由 tools/date/import_wish.py 做）、學姊畢業那天早上補句號
// 修改前（開發分支 a2a423fae）：0～5 每一節至少一項 FAIL（實測 24 項 FAIL、第 4 節中途丟例外）。第 8 節（fin1 刪掉）：c7d701caf 上 FAIL。用法：node tests/aa459_y1s2_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(SISG|DATE_WISH|BBPACK|FAMXMAS)$/;
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/bbpack_events.js','src/bbpack3d.js','src/family_xmas3d.js','src/sis_grad3d.js','src/data/date_wish.js']) L3(f);   /* 照 aa458_y1s1_unit.js、sis_grad_unit.js、date_wish_unit.js 載的檔 */
GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7, termDay=(t,w,wd)=>STORY.termDay(t,w,wd);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const at=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); };
const NEW={LAW_START_DAY:STORY.LAW_D0,MAIN_D1:STORY.MAIN_D1_NEW};   /* 新開局（主線第一天 9/3）；沒有＝舊開局（9/17）*/
const fresh=(k,h,flags,zone)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign({introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; PHONE.rec(G); E.player.busy=false; E.paused=false; return G; };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); } };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const thread=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const nm=m=>(m.name||m.from)+'：'+m.text;

/* ---- 讀稿（企劃線 c0972cd32）---- */
let doc=''; try{ doc=cp.execSync('git show c0972cd32:"docs/story_planning/AA_459_法律系大一下讀一遍_媽媽群組補兩條_家族群組_落選通知_撞期.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const rows=t=>t.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|\s*-/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const quotes=t=>t.split('\n').map(l=>l.trim()).filter(l=>/^> \S/.test(l)).map(l=>l.slice(2));
const sp=q=>{ const i=q.indexOf('：'); return {who:q.slice(0,i),t:q.slice(i+1)}; };
const P11=part('### 1-1','### 1-2'), LJ1=quotes(P11)[0], LJ1Y=(P11.match(/回「會回去」：「([^」]+)」/)||[])[1], LJ1N=(P11.match(/回「這週不回」：「([^」]+)」/)||[])[1];
const T12={}; for(const r of rows(part('### 1-2','### 1-3'))){ const k={'期中':'exam','期末（上學期）':'fin1','期末（下學期）':'fin2'}[r[0]]; if(k) T12[k]=[r[2].replace(/（照 `AA_458`）$/,''),[r[3]],[r[4]]]; }
const T13=rows(part('### 1-3','## 2.')).filter(r=>/^\d{1,2}\/\d{1,2}$/.test(r[0])).map(r=>{ const [m,d]=r[0].split('/').map(Number); return {key:'2026-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'),kind:r[1],t:r[2]}; });
const Q21=quotes(part('### 2-1','### 2-2')).map(sp), P22=part('### 2-2','### 2-3'), Q22=quotes(P22.slice(P22.indexOf('**改成**'))).map(sp), Q22old=quotes(P22).map(sp).slice(3,6), Q23=quotes(part('### 2-3','## 3.')).map(sp);
const Q3=quotes(part('## 3.','## 4.')), Q3sys=Q3[0], Q3zhe=Q3.slice(1).map(sp), P4=part('## 4.','## 5.'), Q4=quotes(P4).map(sp);
const O4=[(P4.match(/回「(我去。)」/)||[])[1],(P4.match(/回「(那天晚上有籌備會。)」/)||[])[1]], R4=(P4.match(/唐睿回「([^」]+)」/)||[])[1], V4=(P4.match(/沒到的那一版傳影片（「([^」]+)」）/)||[])[1];
const T5=rows(part('## 5.','## 6.')).filter(r=>r.length>=3&&r[0]!=='哪裡');
let doc8=''; try{ doc8=cp.execSync('git show cb5caad65:"docs/story_planning/AA_459_法律系大一下讀一遍_媽媽群組補兩條_家族群組_落選通知_撞期.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc8=''; }   /* 第 8 節：回 LAWWW-B 的施工問題（企劃線 cb5caad65）*/
const P8=(()=>{ const i=doc8.indexOf('## 8.'); return i<0?'':doc8.slice(i); })();
const WIN={sis:'學姊',kevin:'Kevin'}, WHO={'學姊':'heroine_05','Kevin':'kevin','阿哲':'zhe','唐睿':'econ_tangrui'};

(async()=>{
/* ---- 0 讀稿、資料照稿 ---- */
await sec(0,()=>{
  check('0. 讀得到稿、檔都載得到（SISG、DATE_WISH）',!!doc&&!loadErr.length&&typeof SISG!=='undefined'&&typeof DATE_WISH!=='undefined',J(loadErr));
  check('0. 稿裡的都讀得到（1-1 一句＋回覆、1-2 三列、1-3 十六週、2-1、2-2 新舊各三句、2-3、第 3 節三則、第 4 節兩則＋兩個選項＋回覆＋影片、第 5 節四列）',
    LJ1==='這次連假 回來住幾天'&&!!LJ1Y&&!!LJ1N&&Object.keys(T12).length===3&&T13.length===16&&T13.every(r=>D(r.key)!=null&&wdOf(D(r.key))===4)&&Q21.length===1&&Q22.length===3&&Q22old.length===3&&Q23.length===1&&/\{名稱\}/.test(Q3sys||'')&&Q3zhe.length===2&&Q4.length===2&&O4.every(Boolean)&&!!R4&&!!V4&&T5.length===4,
    J({LJ1,T12:Object.keys(T12),T13:T13.length,Q:[Q21.length,Q22.length,Q22old.length,Q23.length,Q3.length,Q4.length],O4,R4,V4,T5:T5.length}));
  const W=HOME.GROUP_WK||{};
  check('0. HOME.GROUP_WK：連假②「'+LJ1+'」（回「'+LJ1Y+'」／「'+LJ1N+'」）',J(W.lj1)===J([LJ1,[LJ1Y],[LJ1N]]),J(W.lj1));
  check('0. HOME.GROUP_WK：期中、期末（下學期 fin2）照 1-2 的表（媽媽那句、回「會回去」、回「這週不回」）',['exam','fin2'].every(k=>J(W[k])===J(T12[k])),J(['exam','fin2'].map(k=>[k,W[k],T12[k]])));
  check('0. 第 8 節：「期末（上學期）」那句（fin1「'+T12.fin1[0]+'」）刪掉——HOME.GROUP_WK 沒有 fin1、也沒有那句',/fin1）：刪掉/.test(P8)&&/下學期那句（「考完東西先搬一些回來」）照舊/.test(P8)&&!('fin1' in W)&&!Object.values(W).some(x=>x&&x[0]===T12.fin1[0]),J([P8.slice(0,80),Object.keys(W)]));
});

/* ---- 1 媽媽的週四群組 ---- */
const askOf=d=>(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='home_ask_'+d)||null;
const hr=()=>{ HOME.phoneRules(GM); PHONE.tick(H.G); };
const sim=(d0,d1,ans)=>{ const out=[]; for(let d=d0;d<=d1;d++){ if(wdOf(d)!==4) continue; at(d,20.05); hr(); const m=askOf(d); const e={d,key:keyOf(d),t:m?m.text:null,k:m&&m.ask.k};
    if(m&&ans){ const a=ans(e,out.length); const r=PHONE.answer(H.G,m.ask.id,a); e.a=a; e.r=r?r.out.filter(x=>x.from==='mom').map(x=>x.text):null; }
    at(d,23.5); hr(); out.push(e); } return out; };
const Y1S2=e=>e.t&&e.key>='2026-02-23'&&e.key<='2026-06-14';
await sec(1,()=>{
  fresh(D('2025-09-01'),8,NEW); const s=sim(D('2025-09-01'),D('2026-06-14')).filter(Y1S2);
  check('1. 新開局：大一下逐週＝1-3 的表（2/26 連假① 起十六週，句子一字不差）',J(s.map(e=>[e.key,e.t]))===J(T13.map(r=>[r.key,r.t])),J(s.map(e=>[e.key.slice(5),e.t])));
  const C=HOME.rec(H.G).grp||{}; check('1. 平常、長輩圖照「這學期」用到第幾次：大一下 3/5 平常①、3/12 第一張長輩圖（大一上用了 7 次平常、3 張）；G.home.grp 記學期 Y1S2、平常 8 次、長輩圖 4 張',s[1]&&s[1].t===HOME.GROUP_WK.p1[0]&&s[2]&&s[2].t===HOME.ELDER[0]&&C.t==='Y1S2'&&C.p===8&&C.e===4,J(C));
  const g=k=>s.find(e=>e.key===k)||{};
  check('1-1. 4/2（春假 4/3～4/6 放四天）連假②「'+LJ1+'」（原本「放三天 回來住兩晚」）',g('2026-04-02').t===LJ1&&g('2026-04-02').k==='lj1');
  check('1-2. 期中只用一次：4/16（第 8 週）「'+T12.exam[0]+'」、4/23（第 9 週）平常①「'+HOME.GROUP_WK.p1[0]+'」',g('2026-04-16').k==='exam'&&g('2026-04-23').k==='p1'&&CALENDAR.termOf(D('2026-04-23')).exam==='mid'&&s.filter(e=>e.k==='exam').length===1);
  check('1-2. 期末（下學期）6/11（第 16 週）「'+T12.fin2[0]+'」',g('2026-06-11').t===T12.fin2[0]&&g('2026-06-11').k==='fin2'&&CALENDAR.termOf(D('2026-06-11')).exam==='final');
  check('1-3. 春天不再說「天氣變涼了 外套帶回去」（原本 3/5、4/9、5/14 都說）；5/14 天氣熱',!s.some(e=>/天氣變涼了/.test(e.t))&&g('2026-05-14').k==='hot');
  const cnt={}; for(const e of s) cnt[e.t]=(cnt[e.t]||0)+1; const dup=Object.keys(cnt).filter(t=>cnt[t]>1).sort();
  check('1-3. 大一下一字不差的只剩「這週回來吃飯嗎」兩次、「回來的話先講 我多煮」兩次',J(dup)===J([HOME.GROUP_WK.p1[0],HOME.GROUP_WK.p3[0]].sort())&&dup.every(t=>cnt[t]===2),J(cnt));
  fresh(D('2025-09-01'),8,{}); const o=sim(D('2025-09-01'),D('2026-06-14')).filter(Y1S2);
  check('1. 舊開局（9/17）：大一下一樣是 1-3 的表（平常照這學期算）',J(o.map(e=>[e.key,e.t]))===J(T13.map(r=>[r.key,r.t])),J(o.map(e=>[e.key.slice(5),e.t])));
  /* 回覆 */
  const rep=(key,k,a)=>{ const d=D(key); fresh(D('2026-02-23'),8,{}); sim(D('2026-02-23'),d-1); const r=sim(d,d,()=>a)[0]; return r.k===k?J(r.r):'種類不對：'+r.k; };
  const bad=[]; for(const [key,k] of [['2026-04-02','lj1'],['2026-04-16','exam'],['2026-06-11','fin2']]) for(const a of [0,1]){ const w=k==='lj1'?[[LJ1Y],[LJ1N]][a]:T12[k][a+1]; const got=rep(key,k,a); if(got!==J(w)) bad.push([key,k,a,got,w]); }
  check('1. 回覆照稿：連假②「'+LJ1Y+'」／「'+LJ1N+'」、期中「'+T12.exam[1]+'」／「'+T12.exam[2]+'」、期末（下學期）「'+T12.fin2[1]+'」／「'+T12.fin2[2]+'」',!bad.length,J(bad));
  /* 期末（上學期）：現在的日曆上，每個上學期第 16 週的週四都被冬至（大一上 12/18）或聖誕連假（12/25 行憲紀念日放假：大二上 12/24、大三上 12/23、大四上 12/21）佔走——照 1-2 的順序連假優先，fin1 現在不會出現。
     這裡把大二上的 12/25 當成上課日（CALENDAR.holiday 暫時換掉），測第 16 週週四沒被佔走時的句子和回覆 */
  const f1=D('2026-12-24'), hol=CALENDAR.holiday, plain=()=>{ CALENDAR.holiday=d=>d===f1+1?null:hol.call(CALENDAR,d); };
  const allS1=CALENDAR.TERMS.filter(t=>/^Y[1-4]S1$/.test(t.id)).map(t=>{ fresh(D('2025-09-01'),8,{}); const P=HOME.grpPlan(H.G,t.id), d=Object.keys(P).map(Number).find(x=>(CALENDAR.termOf(x)||{}).exam==='final'); return [t.id,d!=null&&keyOf(d),d!=null&&P[d]]; });
  check('1-2. 現在的日曆：上學期第 16 週的週四都被冬至、聖誕連假佔走（子代理查的；AA_459 第 8 節據此刪掉 fin1）',allS1.length>=4&&allS1.every(r=>['dz','lj0','lj1','lj2'].includes(r[2])),J(allS1));
  let r1, r2; try{ plain(); fresh(D('2026-09-07'),8,{}); sim(D('2026-09-07'),f1-1); r1=sim(f1,f1,()=>0)[0]; fresh(D('2026-09-07'),8,{}); sim(D('2026-09-07'),f1-1); r2=sim(f1,f1,()=>1)[0]; } finally { CALENDAR.holiday=hol; }
  check('1-2. 期末（上學期）那句刪掉（第 8 節）：第 16 週週四沒被佔走（大二上 12/24、12/25 當成上課日）也不說「'+T12.fin1[0]+'」，照平常排（平常①～④）；12/17 冬至',!!r1&&r1.k!=='fin1'&&r1.t!==T12.fin1[0]&&r2.t!==T12.fin1[0]&&['p1','p3','old'].includes(r1.k)&&CALENDAR.termOf(f1).exam==='final'&&(askOf(D('2026-12-17'))||{}).text===HOME.GROUP_WK.dz[0],J([r1,r2]));
  /* 舊存檔：G.home.grp 有次數、沒有學期（AA_458 的版本）→ 不在學期中間重來 */
  { const d=D('2026-04-23'); fresh(d,19,{}); H.G.home={at:false,used:{},ate:{},grp:{p:1,e:1}}; at(d,20.05); hr(); const m=askOf(d);
    check('1. 舊存檔（G.home.grp 沒有記學期）：接著原本的次數（第 2 次平常＝長輩圖第 2 張「'+HOME.ELDER[1]+'」），之後記學期',!!m&&m.text===HOME.ELDER[1]&&HOME.rec(H.G).grp.t==='Y1S2'&&HOME.rec(H.G).grp.p===2,J([m&&m.text,HOME.rec(H.G).grp])); }
});

/* ---- 2 家族群組 ---- */
const FT='g:family_law', grp=()=>PHONE.join(H.G,'family_law','法律系直屬家族');
await sec(2,()=>{
  const dJ=termDay('Y1S2',3,2), dI=termDay('Y1S2',3,5);
  fresh(dJ,18,{SAID_TREAT_SIS:true}); grp(); run(18,21.2); at(dI,18); run(18,21.5); const inv=byTag('fam_dinner_inv');
  check('2-1. 3/13（第 3 週週五）21:00 Kevin「'+Q21[0].t+'」（約的是第 4 週週五 3/20）；學姊那三句、選項照舊',keyOf(dI)==='2026-03-13'&&inv.length===4&&nm(inv[0])===Q21[0].who+'：'+Q21[0].t&&J(inv[0].ask.opts.map(o=>o.t))===J(['去。','這次不行。'])&&inv[2].text==='我以為那是客套話。',J(inv.map(nm)));
  const dF=D('2026-06-12'), fin=setup=>{ fresh(dF,20,{SAID_TREAT_SIS:true}); grp(); if(setup) setup(); run(20,21.2); return byTag('fam_final_y1s2').map(m=>(WIN[m.from==='heroine_05'?'sis':m.from]||m.name||m.from)+'：'+m.text); };
  const L=fin();
  check('2-2. 沒去咖哩、說過要請：6/12 21:00 Kevin 揪火鍋，後面三句換成「'+Q22.map(q=>q.t).join('」「')+'」（原本「'+Q22old[1].t+'」）',J(L.slice(1))===J(Q22.map(q=>q.who+'：'+q.t))&&!L.some(t=>/客套/.test(t)),J(L));
  const L2=fin(()=>{ SOCIAL.remember('heroine_05','FAMILY_DINNER',''); });
  check('2-2. 去了咖哩（FAMILY_DINNER）：不是那三句（照舊「收到。」）',J(L2.slice(1))===J(['學姊：收到。']),J(L2));
  fresh(dF,20,{SAID_TREAT_SIS:true}); grp(); H.G.msgs.push({day:dF,h:21,th:FT,from:'kevin',name:'Kevin',text:'期末考完，家族聚餐。這次地方我選：公館的火鍋吃到飽。全家族。',tag:'fam_final_y1s2'}); run(20,21.2);
  check('2-2. 舊存檔已經收過期末那則（舊的三句）：不重發',byTag('fam_final_y1s2').length===1);
  /* 2-3 學姊上榜聚餐：收過咖哩邀約的，Kevin 多一句 */
  const d=D('2026-03-23'), rank=withInv=>{ fresh(d,20.5,{SIS_W1:true}); H.FAMILIAR('heroine_05'); grp(); if(withInv) H.G.msgs.push({day:dI,h:21,th:FT,from:'kevin',name:'Kevin',text:'下週五六點半，永康街那家咖哩。全家族。',tag:'fam_dinner_inv'}); run(20.9,21.1); return byTag('sisg_rank_dinner'); };
  const g1=rank(true), g0=rank(false);
  check('2-3. 3/23 21:00 上榜聚餐那則後面 Kevin「'+Q23[0].t+'」（收過 3/13 咖哩那則）；「去。」的選項照舊在第一則',g1.length===2&&g1[0].text==='學姊上榜聚餐！這週五七點，公館的日日定食。這次我們請學姊'&&g1[0].ask&&g1[0].ask.id==='sisg_rank_dinner_q'&&nm(g1[1])===Q23[0].who+'：'+Q23[0].t,J(g1.map(nm)));
  check('2-3. 沒收過咖哩那則（不在家族群組的時候、或沒有那一則）：沒有那一句',g0.length===1&&!g0.some(m=>m.text===Q23[0].t),J(g0.map(nm)));
});

/* ---- 3 見習團落選 ---- */
const LAWC=()=>{ PHONE.join(H.G,'law_class','法律系（全班）'); PHONE.join(H.G,'noodle_team','麵店團'); };
await sec(3,()=>{
  const rej=(key,sDay,rDay,setup)=>{ fresh(sDay,9.5,{}); LAWC(); if(setup) setup(); VAC.signup(H.G,key,'yes'); at(rDay,11.9); run(11.9,12.2); return byTag('vac_sel_'+key); };
  const I8=VAC.inst('C08','Y1'), R8=rej('C08@Y1',termDay('Y1S2',6,1),termDay('Y1S2',12,1)), want=Q3sys.replace('{名稱}',I8.A.select.name);
  check('3. 首爾交流沒上（沒寫申請資料）：「'+want+'」（通知帶名字，同錄取那則的 sel.name）',R8.filter(m=>m.th==='sys').map(m=>m.text).join('|')===want,J(R8.map(m=>m.text)));
  check('3. 阿哲私訊「'+Q3zhe.map(q=>q.t).join('」「')+'」；麵店團群組沒有他那一句',J(R8.filter(m=>m.th==='p:zhe').map(m=>nm({from:'阿哲',text:m.text})))===J(Q3zhe.map(q=>q.who+'：'+q.t))&&R8.filter(m=>m.th==='p:zhe').every(m=>m.from==='zhe')&&!thread('g:noodle_team').some(m=>m.from==='zhe'&&/沒差啦/.test(m.text)),J(R8.map(m=>[m.th,m.text])));
  const I11=VAC.inst('C11','Y2'), R11=rej('C11@Y2',termDay('Y2S1',5,1),termDay('Y2S1',8,1));
  check('3. 寒假的活動（東京）：「'+Q3sys.replace('{名稱}',I11.A.select.name)+'」；阿哲私訊第一句照稿、第二句「沒差啦 過年比較重要」（照舊換）',R11.some(m=>m.th==='sys'&&m.text===Q3sys.replace('{名稱}',I11.A.select.name))&&J(R11.filter(m=>m.th==='p:zhe').map(m=>m.text))===J([Q3zhe[0].t,'沒差啦 過年比較重要']),J(R11.map(m=>[m.th,m.text])));
  const R16=rej('C16@Y2',termDay('Y2S2',10,1),termDay('Y2S2',14,1));
  check('3. 法扶實習（noGroup）：照舊只有系辦的信，沒有阿哲',R16.length===1&&R16[0].name==='系辦（信）'&&!thread('p:zhe').length,J(R16.map(m=>[m.th,m.text])));
  const R8b=rej('C08@Y1',termDay('Y1S2',6,1),termDay('Y1S2',12,1),()=>{ delete PHONE.rec(H.G).groups.noodle_team; });
  check('3. 不在麵店團（不熟阿哲）：只有系統通知',R8b.length===1&&R8b[0].th==='sys',J(R8b.map(m=>[m.th,m.text])));
});

/* ---- 4 唐睿的即興劇和籌備會撞期 ---- */
await sec(4,async()=>{
  const mon=termDay('Y1S2',14,1), wed=termDay('Y1S2',14,3), TG='g:econ_friends';
  const setup=camp=>{ fresh(termDay('Y1S2',13,1),9.5,{}); LAWC(); PHONE.join(H.G,'econ_friends','走啦'); if(camp) VAC.signup(H.G,'C02@Y1','yes'); at(mon,20.9); run(20.9,21.2); return byTag('sk07_call'); };
  const prep=()=>OUT.rec(H.G).find(q=>q.vac&&q.vac.k==='prep'&&q.day===wed);
  const c0=setup(false);
  check('4. 沒撞期（沒報隊輔）：照舊——唐睿一則「'+Q4[0].t+'」、不問、直接排 5/27 19:00 出遊',keyOf(wed)==='2026-05-27'&&c0.length===1&&c0[0].text===Q4[0].t&&!c0[0].ask&&!!OUT.get(H.G,'sk07_improv')&&OUT.get(H.G,'sk07_improv').day===wed&&OUT.get(H.G,'sk07_improv').h===19,J(c0.map(m=>m.text)));
  const c1=setup(true), m=c1[1];
  check('4. 報了隊輔（籌備會第 14 週週三 19:00）：唐睿兩則「'+Q4.map(q=>q.t).join('」「')+'」，要回「'+O4.join('」／「')+'」；先不排出遊',!!prep()&&prep().h===19&&J(c1.map(x=>x.text))===J(Q4.map(q=>q.t))&&c1.every(x=>x.from===WHO[Q4[0].who]&&x.th===TG)&&!!m&&!!m.ask&&J(m.ask.opts.map(o=>o.t))===J(O4)&&!OUT.get(H.G,'sk07_improv'),J([c1.map(x=>x.text),m&&m.ask&&m.ask.opts.map(o=>o.t)]));
  PHONE.answer(H.G,m.ask.id,0); run(21.2,21.3);
  check('4. 回「'+O4[0]+'」：排出遊（5/27 19:00 博雅），籌備會照樣在行程裡（玩家自己選的）',!!OUT.get(H.G,'sk07_improv')&&OUT.get(H.G,'sk07_improv').day===wed&&OUT.get(H.G,'sk07_improv').h===19&&!!prep());
  const no=answer=>{ const c=setup(true); if(answer!=null) PHONE.answer(H.G,c[1].ask.id,answer); run(21.2,21.3); const rp=thread(TG).filter(x=>x.from==='econ_tangrui').map(x=>x.text); at(wed,21.4); run(21.4,21.6); return {rp,plan:OUT.get(H.G,'sk07_improv'),vid:byTag('sk07_video')}; };
  const n1=no(1);
  check('4. 回「'+O4[1]+'」：唐睿「'+R4+'」、不排出遊',n1.rp.slice(-1)[0]===R4&&!n1.plan,J(n1.rp));
  check('4. 那天晚上 21:30 品妤在群組傳影片：「📹（一段影片）」「'+V4+'」（同 ev_sk07_improv 沒到的那一版）',n1.vid.length===2&&n1.vid[1].text===V4&&n1.vid.every(x=>x.from==='econ_pinyu'&&x.th===TG&&x.day===wed&&x.h>=21.5&&x.h<21.65),J(n1.vid.map(x=>[x.text,x.h])));
  const n2=no(null);
  check('4. 沒回（子代理判斷：當作沒去）：不排、那天晚上一樣有影片',!n2.plan&&n2.vid.length===2,J(n2.vid.map(x=>x.text)));
  fresh(termDay('Y1S2',13,1),9.5,{}); LAWC(); PHONE.join(H.G,'econ_friends','走啦'); VAC.signup(H.G,'C02@Y1','yes'); H.G.msgs.push({day:mon,h:21,th:TG,from:'econ_tangrui',name:'唐睿',text:Q4[0].t,tag:'sk07_call'}); at(mon,21.3); run(21.3,21.5); at(wed,21.4); run(21.4,21.6);
  check('4. 舊存檔（已經收過舊的那一則）：不重發、不問、不補影片',byTag('sk07_call').length===1&&!byTag('sk07_video').length&&H.G.flags.SK07_ASKED==null);
});

/* ---- 5 小改字 ---- */
await sec(5,()=>{
  const T=k=>T5.find(r=>r[0].includes(k))||[];
  const ndl=T('2572'), kx=T('1967'), wish=T('date_wish'), grad=T('sis_grad3d');
  const Dd=STORY.springDays(); fresh(Dd.inv1,18,{}); PHONE.join(H.G,'noodle_team','麵店團'); STORY.springChoose(GM,'dorm',{silent:true}); at(Dd.d0,20.6); PHONE.tick(H.G); const ph=byTag('ndl_spring_photos').map(m=>m.text);
  check('5. 春假沒去的麵店團照片（4/3 20:30）以安「'+ndl[2]+'」（原本「'+ndl[1]+'」）；旅行事件裡的同一句不動',ph.includes(ndl[2])&&!ph.includes(ndl[1])&&J(STORY_EVENTS.find(e=>e.id==='ev_noodle_trip_spring_y1').dialogue).includes(ndl[1]),J(ph));
  const bd=termDay('Y1S2',9,5); fresh(bd,9,{dating_kexin:true}); run(9,9.2); const dm=byTag('kx_bday_draft')[0]; const r=dm&&PHONE.answer(H.G,dm.ask.id,0);
  check('5. 可昕生日回「生日快樂。」：她「'+kx[2]+'」（原本「'+kx[1]+'」）',!!r&&r.out.filter(x=>x.from==='kexin').map(x=>x.text).join('|')===kx[2],J(r&&r.out.map(x=>x.text)));
  const ps=(DATE_WISH.events.classmate_peishan||{}).herInvite||{}, all=J(DATE_WISH.events.classmate_peishan);
  check('5. 沛珊美術館的心願邀約「'+wish[2]+'」（原本「'+wish[1]+'」；date_wish.js 兩處，tools/date/import_wish.py 的 REPLACE）',(ps.lines||[]).some(x=>x.text===wish[2])&&!all.includes(wish[1])&&all.split(wish[2]).length-1===2,J((ps.lines||[]).map(x=>x.text)));
  const gd=D('2026-06-06'); fresh(gd,8.5,{SIS_W1:true}); H.FAMILIAR('heroine_05'); run(8.5,8.6); const gm=byTag('sisg_grad_msg');
  check('5. 學姊畢業那天早上（6/6 08:00）「'+grad[2]+'」（補句號）',gm.length===1&&gm[0].text===grad[2]&&gm[0].text!==grad[1],J(gm.map(m=>m.text)));
});
H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });

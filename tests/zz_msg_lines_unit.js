// 芷若×子晴交往中的兩則訊息（ZZ-MSGPOOL-LINE-1022、ZZ-FANG-EV2-DECLINED-1022；AA_232 進開發分支時留下的）——不需要瀏覽器。
//   1 子晴「芷若在英國」那三則（BB_178 第 2 節 bb6baddf；tools/msg/build_pool.py 收進回覆池；AA_385 第 9 節選③，企劃線 028dc128）：
//     交往中（ZZ.state＝dating）＝「剛跟芷若視訊完」「她那邊才下午」〔週日 22:30 以後〕：週日 22:40 用，週日 21:00、週六 22:40 不用；
//     friends、feelings_emerging、mutual_interest、held＝好朋友「芷若這個月打來了」「她說那邊的貓不給摸」〔每月第一個週日以後那一週〕；
//     「兩人是朋友」（下雨的照片）只給沒有 ZZ 的舊存檔
//   2 方奕廷「還好嗎（F3 芷若婉拒）」（AA_257 §8；msg2_pool 的 cond f3_declined）：他傳「她跟我說了。」那三則（zrzq3d.js，tag zz_f3_fang）收到那天起 3 天開；
//     排著還沒收到、第 4 天不開；A「還好。謝謝。」、R「還好。她說得很清楚。……這樣比較好。」
//   3 S.tok「週日 22:30 以後」（只有一個星期幾）、「每月第一個週日以後那一週」
// 修改前（開發分支 ddeb53a0）：第 1、2、3 項 FAIL；第 9 節（好朋友那一句）修改前（3740c127）：第 0、1、3 項 FAIL。用法：node tests/zz_msg_lines_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H;
const NAMES=/^(MSG|MSG_POOL|MSG2_POOL|ZRZQ|ZRZQ_LINES)$/;
const load=f=>{ if(!fs.existsSync(path.join(H.ROOT,f))) return false; let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; };
global.CG_REGISTRY={};
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/zrzq_events.js','src/zrzq3d.js']) load(f);   /* index.html 的順序：zrzq3d.js 在 msg3d.js 後面（包住 MSG.tok）*/
const D=k=>STORY.dayOfKey(k), wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; }, J=x=>JSON.stringify(x), eq=(a,b)=>J(a)===J(b);
const setT=(G,d,h)=>{ G.day=d; G.hour=h; G.weekday=wdOf(d); };
const nextWd=(k,wd)=>{ let d=D(k); while(wdOf(d)!==wd) d++; return d; };
const ZQ='heroine_04', ZR='heroine_02', FY='npc_fangyt';
const know=(id,f,t)=>{ INV.addContact(H.G,id); SOCIAL.remember(id,'FIRST_MET',''); const r=SOCIAL.rel(id); r.fam=f; r.trust=t; };
/* [前置] 芷若在英國（2027-09-03～2028-02-12）、子晴 R、祐廷認識芷若；zz＝她們的狀態 */
const zq=(d,h,state)=>{ const G=H.fresh('2027-09-20',h,'dorm',{}); setT(G,d,h); know(ZQ,45,30); know(ZR,25,0); G.events.done.ev_ziqing_secret_game=1;
  const R=ZRZQ.rec(G); R.state=state; if(state==='dating'){ R.datingDay=D('2027-06-04'); R.datingTerm='Y2S2'; } G.flags.ZZ_STATE=state; return G; };
const pickZR=G=>{ const out=[]; for(let i=0;i<4;i++){ const e=MSG.pick(G,ZQ,'chat',null,{}); out.push(e?e.msgs:null); } return out; };
const DATE_L=['剛跟芷若視訊完','她那邊才下午'], FRI_L=['芷若發了一張下雨的照片','她那邊好像每天都在下雨'], GOOD_L=['芷若這個月打來了','她說那邊的貓不給摸'];
const pool=((MSG_POOL.people[ZQ]||{}).replies||[]).filter(e=>e.variant==='芷若在英國');
check('0. 回覆池：子晴「芷若在英國」三則（兩人是朋友、兩人是好朋友〔每月第一個週日以後那一週〕、兩人交往中〔週日 22:30 以後〕），R 層',pool.length===3&&pool.every(e=>e.tier==='R')&&pool.some(e=>eq(e.msgs,FRI_L)&&eq(e.tags,['兩人是朋友']))&&pool.some(e=>eq(e.msgs,GOOD_L)&&eq(e.tags,['兩人是好朋友','每月第一個週日以後那一週']))&&pool.some(e=>eq(e.msgs,DATE_L)&&eq(e.tags,['兩人交往中','週日 22:30 以後'])),J(pool.map(e=>[e.tier,e.tags,e.msgs])));
const ALL3=[DATE_L,FRI_L,GOOD_L], any3=L=>L.some(m=>ALL3.some(x=>eq(m,x)));
/* 1 */
{ const sun=nextWd('2027-10-10',0), sat=sun-1;
  const G=zq(sun,22.67,'dating'), L=pickZR(G);
  check('1. 交往中、芷若在英國、週日 22:40：子晴「剛跟芷若視訊完」「她那邊才下午」',L.some(m=>eq(m,DATE_L))&&!L.some(m=>eq(m,FRI_L)),J(L));
  const G2=zq(sun,21,'dating'), L2=pickZR(G2), G3=zq(sat,22.67,'dating'), L3=pickZR(G3);
  check('1. 週日 21:00、週六 22:40：不用那一句（也不用「兩人是朋友」那一句）',!L2.concat(L3).some(m=>eq(m,DATE_L)||eq(m,FRI_L)),J({L2,L3}));
  const first=(()=>{ let d=D('2027-11-01'); while(wdOf(d)!==0) d++; return d; })();   /* 2027-11 第一個週日 */
  const LG=['friends','feelings_emerging','mutual_interest','held'].map(st=>{ const G=zq(first+3,15,st); return [st,pickZR(G)]; });
  check('1. 好朋友（friends、feelings_emerging、mutual_interest、held）、那個月第一個週日起的那一週：「芷若這個月打來了」「她說那邊的貓不給摸」',LG.every(([st,L])=>L.some(m=>eq(m,GOOD_L))&&!L.some(m=>eq(m,FRI_L)||eq(m,DATE_L))),J(LG));
  const G5=zq(first+7,15,'friends'), L5=pickZR(G5), G6=zq(first-1,15,'friends'), L6=pickZR(G6);
  check('1. 好朋友、第一個週日那一週以外（第 8 天、前一天）：三則都不用',!any3(L5)&&!any3(L6),J({L5,L6}));
  const G7=zq(first+3,15,'dating'), L7=pickZR(G7);
  check('1. 交往中、第一個週日那一週的週三下午：好朋友那一句不用（交往中只有週日 22:30 以後那一句）',!any3(L7),J(L7));
  const G8=zq(sun,22.67,'friends'); delete G8.flags.ZZ; delete G8.flags.ZZ_STATE; const L8=pickZR(G8);
  check('1. 沒有 ZZ 的舊存檔＝「兩人是朋友」那一句（下雨的照片，備援）',L8.some(m=>eq(m,FRI_L))&&!L8.some(m=>eq(m,DATE_L)||eq(m,GOOD_L)),J(L8));
  const G9=zq(sun,22.67,'friends'), L9=pickZR(G9);
  check('1. 有 ZZ（friends）、不在那一週：不用下雨那一句（AA_385 第 9 節：只給沒有 ZZ 的舊存檔）',!L9.some(m=>eq(m,FRI_L)),J(L9)); }
/* 2 */
{ const d0=D('2028-05-30');
  const mk=(f,t)=>{ const G=H.fresh('2028-05-29',12,'dorm',{}); setT(G,d0,12); know(FY,f,t); const R=ZRZQ.rec(G); R.state='dating'; R.fy='declined'; R.f3='dating'; G.flags.FANG_F3_DAY=D('2028-05-29');
    PHONE.at(G,d0,21,ZRZQ_LINES.F3_FANG.map(t=>({th:'p:'+FY,from:FY,text:t})),'zz_f3_fang'); return G; };
  const top=(G,d,h)=>{ setT(G,d,h); PHONE.tick(G); MSG.rec(G).sent={}; return MSG.topics(G,FY).map(q=>q.k); };
  const G=mk(25,0); const t0=top(G,d0,20), t1=top(G,d0,21.5), t3=top(G,d0+3,20), t4=top(G,d0+4,20);
  check('2. 排著還沒收到（20:00）不開；21:00 收到以後開，到第 3 天；第 4 天不開',!t0.includes('ok')&&t1.includes('ok')&&t3.includes('ok')&&!t4.includes('ok'),J({t0,t1,t3,t4,got:(G.msgs||[]).filter(m=>m.tag==='zz_f3_fang').map(m=>m.text)}));
  const send=(G,d,h)=>{ setT(G,d,h); PHONE.tick(G); MSG.rec(G).sent={}; const before=new Set(G.msgs); const r=MSG.send(G,FY,'ok'); if(r&&r.at){ setT(G,r.at.day,r.at.h+0.01); PHONE.tick(G); } return (G.msgs||[]).filter(m=>!before.has(m)&&m.from===FY).map(m=>m.text); };
  const a=send(mk(25,0),d0+1,12), r=send(mk(45,30),d0+1,12);
  check('2. 回覆：A「還好。謝謝。」、R「還好。她說得很清楚。……這樣比較好。」',eq(a,['還好。謝謝。'])&&eq(r,['還好。她說得很清楚。……這樣比較好。']),J({a,r})); }
/* 3 */
{ const G=H.fresh('2027-09-20',12,'dorm',{}); const sun=nextWd('2027-10-10',0);
  const L=[[sun,22.4],[sun,22.5],[sun,23.9],[sun-1,23],[sun+1,0.2]].map(([d,h])=>{ setT(G,d,h); return MSG.tok(G,ZQ,'週日 22:30 以後'); });
  check('3. S.tok「週日 22:30 以後」：週日 22:24 否、22:30 是、23:54 是；週六 23:00、週一 00:12 否',eq(L,[false,true,true,false,false]),J(L));
  const L2=[['2027-11-06',false],['2027-11-07',true],['2027-11-13',true],['2027-11-14',false],['2027-12-05',true],['2027-12-04',false],['2028-01-02',true],['2028-01-01',false]].map(([k,want])=>{ setT(G,D(k),12); return [k,MSG.tok(G,ZQ,'每月第一個週日以後那一週'),want]; });
  check('3. S.tok「每月第一個週日以後那一週」：第一個週日起七天（2027-11-07～11-13、12-05～、2028-01-02～）',L2.every(x=>x[1]===x[2]),J(L2)); }
H.done();

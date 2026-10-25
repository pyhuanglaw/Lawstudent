// AA_471 第 1、2 節（企劃線 763993620）：畢業以後的兩個程式條件
//   1 日本路線住家裡版家人群組（jpprep3d.js S.jpOn）只到大四上開學 2028-09-04（搬進 409）為止；畢業 6/28 搬回家以後 JP.movedOut 又成立，原本一路發到 2030
//   2 cracktalk3d.js S.termKey：最後一個學期以後不要每天一個鍵（原本 220 天找不到就回 'D'+日子）：大五上（CALENDAR.termOfDelayed）＝'Y5S1'、之後＝'PG'；裂縫次數不再每天歸零
// 修改前（開發分支 1dacc06af）：1-b、2 FAIL。用法：node tests/pg_jpon_termkey_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/holff3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js','src/data/jpprep_events.js','src/jpprep3d.js',
  'src/data/cracktalk_lines.js','src/cracktalk3d.js']) L3(f);
GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key;
const setT=(k,h)=>{ const G=H.G, d=typeof k==='number'?k:D(k); G.day=d; G.hour=h; G.weekday=CALENDAR.dateOf(d).wd%7; E.hour=h; };
check('0. 檔案載得到（jpprep3d、jp3d、cracktalk3d）',!loadErr.length&&typeof JPPREP!=='undefined'&&typeof JP!=='undefined'&&typeof CRACKTALK!=='undefined',J(loadErr));

/* ---------- 1 日本路線住家裡版家人群組 ---------- */
try{
  const G=H.fresh('2028-02-20',20.05,'dorm',{EXCHANGE_ROUTE:'JP',EXCH_RULE:1,X1_JP:D('2028-02-20')}); G.acts={att:{}}; G.outings=[]; HOME.rec(G).at=true;
  setT('2028-08-10',20.05); delete G.flags.ROOM_Y4;
  check('1-a 8/5 回來以後的暑假（2028-08-10）照舊發（JP.movedOut、jpOn）',!!JP.movedOut(G)&&!!JPPREP.jpOn(G),J([JP.movedOut(G),JPPREP.jpOn(G)]));
  G.flags.ROOM_Y4=true; setT('2028-09-07',20.05);
  check('1-a 搬進 409 以後（2028-09-07）不發',!JPPREP.jpOn(G));
  delete G.flags.ROOM_Y4; setT('2029-07-05',20.05);   /* 畢業 6/28 搬回家：ROOM_Y4 不在了，JP.movedOut 又成立 */
  const mo=!!JP.movedOut(G);
  check('1-b 畢業搬回家以後（2029-07-05）JP.movedOut 雖然又成立，jpOn 不成立（只到 2028-09-04）',mo&&!JPPREP.jpOn(G),J([mo,JPPREP.jpOn(G)]));
  const before=(G.msgs||[]).length; STORY.phoneRules(GM); PHONE.tick(G);
  const got=(G.msgs||[]).slice(before).filter(m=>m.th==='g:home');
  check('1-b 2029-07-05 週四 20:05 跑規則：家人群組沒有住家裡版那一則',!got.length,J(got.map(m=>m.text)));
  let n=0; for(let d=D('2029-07-01');d<=D('2030-12-31');d++){ setT(d,20.05); if(G.weekday===4&&JPPREP.jpOn(G)) n++; }
  check('1-b 2029-07～2030-12 的週四 jpOn 都不成立（原本 76 個週四）',n===0,String(n));
}catch(e){ check('1. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); }

/* ---------- 2 學期鍵 ---------- */
try{
  const G=H.fresh('2026-09-01',12,'dorm',{});
  const tk=k=>CRACKTALK.termKey(G,D(k));
  const y4s2=(()=>{ for(let i=0;i<220;i++){ const t=CALENDAR.termOf(D('2029-07-15')-i); if(t) return t.id; } return null; })();
  check('2. 暑假（2029-07-15）＝前一個學期 '+y4s2,tk('2029-07-15')===y4s2,tk('2029-07-15'));
  check('2. 交換延畢的大五上（2029-10-01，termOfDelayed）＝Y5S1',tk('2029-10-01')==='Y5S1',tk('2029-10-01'));
  check('2. 大五上結束以後（2029-12-30）＝PG',tk('2029-12-30')==='PG',tk('2029-12-30'));
  const ks=['2030-01-10','2030-01-17','2030-03-01','2030-06-27','2030-12-12'].map(tk);
  check('2. 2030 年每一天都是同一個鍵 PG（原本每天 D+日子）',ks.every(k=>k==='PG'),J(ks));
  check('2. 學期中照舊（2026-10-01＝那個學期）',tk('2026-10-01')===(CALENDAR.termOf(D('2026-10-01'))||{}).id,tk('2026-10-01'));
  const id=Object.keys(ROM.CRACK||{})[0], k=id&&ROM.CRACK[id];
  if(k){ setT('2030-02-07',12); G.flags[k]=2; G.flags[k+'_TERM']=CRACKTALK.termKey(G); setT('2030-03-07',12);
    check('2. 裂縫次數 2030-02-07 記 2 次，一個月後還是 2（原本每天歸零）',CRACKTALK.count(G,id)===2,String(CRACKTALK.count(G,id))); }
  else check('2. 找得到 ROM.CRACK',false,'');
}catch(e){ check('2. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); }
H.done();

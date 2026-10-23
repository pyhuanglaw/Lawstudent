// ZR_FY（芷若選了方奕廷）原本整個遊戲沒有地方設（AA_385 子代理 10-22 回報）——不需要瀏覽器。
//   讀它的地方：尾聲 postgrad3d.js S.epiLine（芷若那一句 zr.fy：「（他去倒水的時候）他到現在還記得我每一部看過的電影。……」）、2029 明信片「另一種筆跡」那一行（r2y4a3d.js，AA_345 F3）。
//   現在 zrzq3d.js 的 mirror 照 ZZ.fy='seeing' 記 ZR_FY（只會變 true）：
//   1 舊存檔 F3 芷若接受了（FANG_F3 direct／bought／self／nocall）＝ZZ 建起來 fy seeing → ZR_FY true；尾聲芷若那一句是 zr.fy
//   2 新的：fy went → 看完電影以後 seeing → ZR_FY true
//   3 對照：婉拒（declined）、沒有 F3、和祐廷交往中＝沒有 ZR_FY；尾聲照原本（main／me）
// 修改前（開發分支 9df36c20）：第 1、2 項 FAIL。用法：node tests/zr_fy_flag_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H;
const NAMES=/^(ZRZQ|ZRZQ_LINES|MSG|MSG_POOL|MSG2_POOL)$/;
const load=f=>{ if(!fs.existsSync(path.join(H.ROOT,f))) return false; let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; };
global.CG_REGISTRY={};
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/zrzq_events.js','src/zrzq3d.js']) load(f);
const J=x=>JSON.stringify(x), D=k=>STORY.dayOfKey(k);
const EPI=(typeof POSTGRAD_LINES!=='undefined'&&POSTGRAD_LINES.EPI)||null;
const zrLine=G=>{ const L=PG.epiLine(G,'heroine_02')||[]; return L.map(x=>Array.isArray(x)?x[1]:x); };
const FYL=EPI&&EPI.zr&&EPI.zr.fy, MAIN=EPI&&EPI.zr&&EPI.zr.main;
check('0. 尾聲芷若那兩版（zr.fy、zr.main）都在（postgrad_lines.js）',Array.isArray(FYL)&&Array.isArray(MAIN),J({FYL,MAIN}));
/* 1 */
{ const G=H.fresh('2028-06-10',12,'dorm',{FANG_F3:'direct',FANG_F3_DAY:D('2028-05-29')}); ZRZQ.sync(G);
  check('1. 舊存檔 F3 芷若接受了（FANG_F3 direct）：ZZ fy seeing、ZR_FY true',G.flags.ZZ&&G.flags.ZZ.fy==='seeing'&&G.flags.ZR_FY===true,J({fy:G.flags.ZZ&&G.flags.ZZ.fy,ZR_FY:G.flags.ZR_FY}));
  check('1. 尾聲芷若那一句是 zr.fy（他到現在還記得我每一部看過的電影）',J(zrLine(G))===J(FYL),J(zrLine(G))); }
/* 2 */
{ const G=H.fresh('2028-05-29',22,'dorm',{FANG_F3:'direct',FANG_F3_DAY:D('2028-05-29')}); const R=ZRZQ.rec(G); R.state='feelings_emerging'; R.fy=null; R.f3=null; R.f3Day=null; ZRZQ.f3Sync(G);   /* [前置] F3 那天兩人 feelings_emerging、都單身＝接受、去看了（went、first）*/
  const went=R.fy; const s=ZRZQ.mindSlot?ZRZQ.mindSlot(G):null; if(s){ G.day=s.day+1; G.hour=12; } ZRZQ.sync(G);
  check('2. 新的：F3 那天 feelings_emerging＝去看了（went），看完電影以後 seeing＝ZR_FY true',went==='went'&&!!s&&R.fy==='seeing'&&G.flags.ZR_FY===true,J({went,slot:s&&s.day,fy:R.fy,ZR_FY:G.flags.ZR_FY})); }
/* 3 */
{ const L=[]; { const G=H.fresh('2028-06-10',12,'dorm',{}); const R=ZRZQ.rec(G); R.state='dating'; R.fy='declined'; ZRZQ.sync(G); L.push(['declined',G.flags.ZR_FY,zrLine(G)]); }
  { const G=H.fresh('2028-06-10',12,'dorm',{}); ZRZQ.sync(G); L.push(['沒有 F3',G.flags.ZR_FY,zrLine(G)]); }
  check('3. 對照：婉拒、沒有 F3＝沒有 ZR_FY；尾聲芷若照原本那一句（main）',L.every(x=>x[1]==null&&J(x[2])===J(MAIN)),J(L)); }
H.done();

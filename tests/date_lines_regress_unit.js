// 約會預約的句子不能被重匯蓋回舊版（BUG-DATE-LINES-REVERT-1022）——不需要瀏覽器。
//   634f6324（10-21 DATE-L 第一批）重跑 tools/date/import_date_lines.py 時，白名單的 BB_128 還停在 741e94f1、AA_127 停在 5e910dd2，
//   把 AA 改進企劃原檔的句子蓋回舊版（v9.10.3～v9.10.5 線上都是），包括使用者 10-18 選擇題「可昕不出假設題」（AA_295，4bc3fab5 拿掉的三句又回來）。
//   10-22 白名單換 BB_128@3229ad05、AA_127@10816dd5 重匯（AA_313 盤點子代理查到）。
//   1 可昕（kexin）的預約句子沒有「假設」（AA_295；使用者 10-18：她不要有這個習慣）
//   2 子晴沒有「欸不是」「這不是問句」「存檔」、學姊沒有「重點是」「三件事」「學弟，」（AA_313 6-1）
//   3 救回的句子逐句在（可昕、以安、語彤、子晴、學姊、沛珊；16 處）
// 修改前（開發分支 51f91161）：第 1～3 項 FAIL。用法：node tests/date_lines_regress_unit.js
'use strict';
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const t=fs.readFileSync(path.join(ROOT,'src/data/date_lines.js'),'utf8').split('\n')[2], DL=JSON.parse(t.slice(t.indexOf('=')+1,t.lastIndexOf(';')));
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const all=id=>JSON.stringify(DL.lines[id]||{}), J=JSON.stringify;
check('0. 白名單版本：BB_128＠9aa8ec40c（11-08 AA_593 學姊①b 3-6；之前 ab9d70fe0 10-27 AA_475 第 1、3 節；之前 a1bc53f4c 10-24 AA_447 芷若「是A，不是B」；之前 a5b936a69 AA_439 禁用句；之前 efe575813 AA_436 學姊數東西四句；之前 1ced2f8b3 AA_432 可昕出發句、e78814663 AA_426 第 6 節重訪句、967b4273a、ffd7eef8 AA_398 學姊不數件數、3229ad05）、AA_127＠482c7f6e9（10-27 AA_475 第 1 節；之前 967b4273a AA_426；之前 345234b3 AA_389 第 7 點；不是 741e94f1／5e910dd2）',/BB_128[^＋]*@(ab9d70fe0|9aa8ec40c)/.test(DL.source)&&/AA_127[^＋]*@482c7f6e9/.test(DL.source),DL.source.slice(0,160));
check('1. 可昕的預約句子沒有「假設」（AA_295，使用者 10-18 選擇題）',!/假設/.test(all('kexin')),all('kexin').slice(0,300));
const zq=all('heroine_04'), sis=all('heroine_05');
check('2. 子晴沒有「欸不是」「這不是問句」「存檔」；學姊沒有「重點是」「三件事」「學弟，」（AA_313 6-1）',!/欸不是|這不是問句|存檔/.test(zq)&&!/重點是|三件事|學弟，/.test(sis),J({zq:zq.slice(0,200),sis:sis.slice(0,200)}));
/* 2b. 學姊在 date_lines.js 的任何地方（預約句＋32 個地點）沒有數東西、沒有「三顆／兩顆」這種數量、不叫「學弟」（AA_432，企劃線 1ced2f8b3：D06、D10、D18、D31 改寫，D18 階梯整段換掉）。
   數東西＝說出口的句子、選項裡有「數」（「分數」「人數」是名詞，不算）；數量＝兩～十＋「顆」（「一顆茶葉蛋」「撿起一顆石頭」是一個，不算）；學弟＝叫祐廷（「研究室的學弟」「學弟妹」是說別人，不算）。旁白不看（D13 欄杆「像在數什麼」是旁白） */
{ const said=[]; const walk=(o,narr)=>{ if(typeof o==='string'){ if(!narr) said.push(o); return; } if(Array.isArray(o)) return o.forEach(x=>walk(x,narr)); if(!o||typeof o!=='object') return;
    if(typeof o.text==='string'&&o.who!=='note') { if(o.who!=='narr') said.push(o.text); } if(typeof o.t==='string') said.push(o.t); for(const k in o) if(k!=='text'&&k!=='t'&&k!=='who') walk(o[k],narr); };
  walk(DL.lines.heroine_05||{}); for(const k in DL.loc||{}) walk(((DL.loc[k]||{}).lines||{}).heroine_05||{});
  const bad=said.filter(t=>/數/.test(String(t).replace(/分數|人數/g,''))||/[二兩三四五六七八九十]顆/.test(t)||/(^|[^的])學弟(?!妹)/.test(t));
  check('2b. 學姊（預約句＋D01～D32）沒有數東西、「三顆／兩顆」、叫「學弟」（AA_432：D06 數雲、D10 我數了、D18 三顆／階梯數到十／學弟，走裡面、D31 兩顆都改了）',said.length>1000&&bad.length===0,said.length+' 句；'+J(bad)); }
const L=DL.lines, want=[
  [L.kexin.flaked,[['我等了很久。','你要給我一個解釋。']]]/* 2026-11-12（CANON-NO-ECON-1112 第五批）：AA_921 §3-1＋§4 再換（tests/date_src_sha.js SHORT921_1112；舊期望 AA_769「我等了四十分鐘。」「你欠我一個解釋，還有一頓飯。」） */,[L.kexin.depart,['我到了。你在哪？','你不會遲到吧。……不會。','我出門了。你不准比我晚到。']],[L.kexin.cancel,['好。下次。','好。我去找我室友吃宵夜。']]/* （CANON-NO-ECON-1112 第四批：照 AA_899 換字）*/,[L.kexin.enough,['好，我沒電了。手機。……我也是。','我腳痠了。再走我會開始找你麻煩。']],   /* 2026-11-11（X324 可昕約會台詞重寫，AA f9c1a2b80）（AA_769_kx_date_common.json）：可昕放鴿子兩句、出發第三句、玩夠了第二句照新稿換（原本救回的是「第二次了。」「……第三次我就不問了。」「火車票我買了。你那張也買了。」「回去吧。明天還要早起。」；逐字對稿在 tests/kx_dates_1111_unit.js 第 6 節）*/
  [L.heroine_01.accept,['好。我記到行事曆了。','可以。那天我沒有排別的。']],[L.heroine_01.acceptDating,['好。那天我空下來。']],[L.heroine_03.flaked,[['嗯。第二次了。','班也請了。下次不能來，先跟我說。']]]   /* 2026-11-11（X324 語彤約會台詞重寫，AA_767_yt_date_common.json@0a2136911）：原本救回的是「……嗯。」「我那天有跟蘇姨請假。」，這兩句照新稿換了（逐字對稿在 tests/yt_dates_1111_unit.js 第 6 節）；同一天 AA_780_an_date_followup.json@248c8e390 第一則再換（第二次當天取消的當下說的，沒有人等過；舊期望「那天我等了一下。」；逐字在 tests/an_dates_1111_unit.js 第 9 節）*/,
  [L.heroine_04.cancel,['臨時取消？好啦，我回去睡回籠覺。','好。我自己去打電動，你不要後悔。']],[L.heroine_04.flaked,['又取消。我鬧鐘都設好了。這種事不要有第三次。']]   /* 2026-11-11 AA_780_an_date_followup.json@248c8e390 再換（同上；舊期望＝AA_775 的「那天我設了鬧鐘，還真的起來了，結果你沒來。這種事一次就好。」）*/,[L.heroine_04.depart,['我已經到了。你在哪。','我出門了。下午兩點出門，算早。','今天我有睡飽。這很重要。']],[L.heroine_04.enough,['好，我今天的份用完了，是開心的那種用完。','腳好痠。我沒有在撒嬌。']],[L.heroine_04.leaveEarly,['才剛到？……好。下次補。']],   /* 2026-11-11（X324 子晴約會台詞重寫，AA_775_zq_date_common.json@02078efc0）：子晴取消兩句、放鴿子、玩夠了第一句照新稿換（原本救回的是「臨時取消？……好啦，下次你請。」「好。我自己去打。」「第二次了。我記下來了。」「好，我電量剩一格。回家。」；出發三句、玩夠了第二句、提早走不改；逐字對稿在 tests/zq_dates_1111_unit.js 第 6 節）*/
  [L.heroine_05.flaked,[['第二次了。','我不喜歡這樣。']]]   /* AA_593 第 66 列、使用者 11-02 第 10 節第 8 題：放鴿子第二句「我不喜歡這樣。」（企劃線 9aa8ec40c）*/,[L.heroine_05.depart,['我到了。不用跑，慢慢來。','我出門了。','我在路口。你從哪邊過來？']],[L.heroine_05.enough,['……今天差不多了，我們走吧。','我腳痠了。這句是實話。']],   /* 2026-11-11（X324 學姊約會台詞重寫，AA 82c946ad7）（AA_765_sis_date_common.json@808a6d846）：depart 第三句原本「車停哪裡？我在路口。」、enough 第二句原本「明天八點有課。我不是想走。」（逐字對稿在 tests/sis_dates_1111_unit.js）*/
  [L.classmate_peishan.accept,['好啊，去！','好，那天我空下來，誰約我都不去。']]];   /* 2026-11-11（X327 沛珊重寫，AA_758_peishan_date_common.json@bed993604）：原本救回的是「好。謝謝你約我。」「好，那天我空下來。」，這兩句照新稿換了（逐字對稿在 tests/peishan_dates_1111_unit.js）*/
const bad=want.filter(([a,b])=>J(a)!==J(require('./ellipsis694.js').deep(b)));   /* AA_694（DATE-ELLIPSIS-1105）：救回的句子照同一條規則拿掉句首、。！？後、）後的「……」再比 */
check('3. 救回的句子逐句在（16 處：可昕 4、以安 2、語彤 1、子晴 5、學姊 3、沛珊 1）',!bad.length,J(bad.map(([a,b])=>({have:a,want:b}))).slice(0,600));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

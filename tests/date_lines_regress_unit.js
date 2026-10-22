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
check('0. 白名單版本：BB_128＠3229ad05、AA_127＠10816dd5（不是 741e94f1／5e910dd2）',/BB_128[^＋]*@3229ad05/.test(DL.source)&&/AA_127[^＋]*@10816dd5/.test(DL.source),DL.source.slice(0,160));
check('1. 可昕的預約句子沒有「假設」（AA_295，使用者 10-18 選擇題）',!/假設/.test(all('kexin')),all('kexin').slice(0,300));
const zq=all('heroine_04'), sis=all('heroine_05');
check('2. 子晴沒有「欸不是」「這不是問句」「存檔」；學姊沒有「重點是」「三件事」「學弟，」（AA_313 6-1）',!/欸不是|這不是問句|存檔/.test(zq)&&!/重點是|三件事|學弟，/.test(sis),J({zq:zq.slice(0,200),sis:sis.slice(0,200)}));
const L=DL.lines, want=[
  [L.kexin.flaked,[['第二次了。','……第三次我就不問了。']]],[L.kexin.depart,['我到了。這是告知。','你不會遲到吧。……不會。','火車票我買了。你那張也買了。']],[L.kexin.cancel,['好。下次。','好。我去找予樂吃宵夜。']],[L.kexin.enough,['好，我沒電了。手機。……我也是。','回去吧。明天還要早起。']],
  [L.heroine_01.accept,['好。我記到行事曆了。','可以。那天我沒有排別的。']],[L.heroine_01.acceptDating,['好。那天我空下來。']],[L.heroine_03.flaked,[['……嗯。','我那天有跟阿姨請假。']]],
  [L.heroine_04.cancel,['臨時取消？……好啦，下次你請。','好。我自己去打。']],[L.heroine_04.flaked,['第二次了。我記下來了。']],[L.heroine_04.depart,['我已經到了。你在哪。','我出門了。下午兩點出門，算早。','今天我有睡飽。這很重要。']],[L.heroine_04.enough,['好，我電量剩一格。回家。','腳好痠。我沒有在撒嬌。']],[L.heroine_04.leaveEarly,['才剛到？……好。下次補。']],
  [L.heroine_05.flaked,[['第二次了。','那一格我劃掉了。']]],[L.heroine_05.depart,['我到了。不用跑，慢慢來。','我出門了。','車停哪裡？我在路口。']],[L.heroine_05.enough,['……今天差不多了，我們走吧。','明天八點有課。我不是想走。']],
  [L.classmate_peishan.accept,['好。謝謝你約我。','好，那天我空下來。']]];
const bad=want.filter(([a,b])=>J(a)!==J(b));
check('3. 救回的句子逐句在（16 處：可昕 4、以安 2、語彤 1、子晴 5、學姊 3、沛珊 1）',!bad.length,J(bad.map(([a,b])=>({have:a,want:b}))).slice(0,600));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

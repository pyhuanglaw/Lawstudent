// DECIDE.tick 有註冊進 STORY.PHONE_RULES（BUG-DECIDE-TICK-UNREG-1108，CC-B／BB-B 2026-11-08 07:2x）——不需要瀏覽器（D131）。
// 起因：index.html 先載入 src/decide3d.js、後載入 src/story3d.js；decide3d.js 結尾「STORY 在就推 STORY.PHONE_RULES」那時 STORY 還沒有，
//   DECIDE.tick 從來沒註冊：決定拍三天內沒見到她、第 due+3 天改傳訊息（DECIDE_SAY）整個不會送（CC 瀏覽器：PHONE_RULES 109 條、includes(DECIDE.tick)＝false）。
// 修法：story3d.js 建 PHONE_RULES 時，DECIDE 已經在就補上 DECIDE.tick。
// 檢查（照 index.html 的順序：DECIDE 先、STORY 後）：
//   1. index.html：decide3d.js 在 story3d.js 前面（這一支量的就是這個順序）
//   2. DECIDE 先載、再載一次 story3d.js（新的 STORY）：PHONE_RULES 有 DECIDE.tick、只有一次
//   3. 跑新的 STORY 的 phoneRules：DECIDE_SAY 到了 due+3 送出（played、byMsg、手機有那兩句）
//   4. 舊存檔（以前沒註冊、沒送的一直留著）：拖過 due+10 的記過期、不補傳；due+10 當天照送
// 修改前：2、3 FAIL。用法：node tests/decide_tick_reg_unit.js
'use strict';
const H=require('./pg_harness.js');
const {check,GM}=H, J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const iD=html.indexOf('<script src="src/decide3d.js'), iS=html.indexOf('<script src="src/story3d.js');
check('1. index.html：decide3d.js 在 story3d.js 前面（DECIDE 先、STORY 後）',iD>0&&iS>iD,J({iD,iS}));
const loadAs=(f,from,to)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); s=s.replace(new RegExp('^const '+from+'\\s*=','m'),'globalThis.'+to+'='); vm.runInThisContext(s,{filename:f}); };
for(const [f,n] of [['src/data/heroine_arcs.js','HEROINE_ARCS'],['src/data/arc_rot.js','ARC_ROT'],['src/data/decide_rules.js','DECIDE_RULES']]) if(fs.existsSync(path.join(H.ROOT,f))) loadAs(f,n,n);
const STORY0=globalThis.STORY;
globalThis.STORY=undefined;   /* 照 index.html：decide3d.js 載入的時候 STORY 還沒有 */
loadAs('src/decide3d.js','DECIDE','DECIDE');
const D=globalThis.DECIDE;
loadAs('src/story3d.js','STORY','STORY2');   /* 再載一次 story3d.js＝index.html 裡接在後面的那一次 */
const S2=globalThis.STORY2; globalThis.STORY=STORY0;
const n=(S2&&S2.PHONE_RULES||[]).filter(f=>f===D.tick).length;
check('2. DECIDE 先、STORY 後：STORY.PHONE_RULES 有 DECIDE.tick（一次）',!!D&&typeof D.tick==='function'&&n===1,J({n,len:(S2&&S2.PHONE_RULES||[]).length}));
{ const G=H.fresh('2026-01-28',20,'dorm'); const who='heroine_05';
  G.flags.DECIDE_SAY=[{who,key:'exam',due:G.day-3,say:['謝謝你的綠茶。','最後一晚，我想一個人。……考完請你吃飯。'],played:false}];
  if(S2&&S2.phoneRules) S2.phoneRules(GM); if(typeof PHONE!=='undefined'&&PHONE.tick) PHONE.tick(G);
  const x=G.flags.DECIDE_SAY[0], got=(G.msgs||[]).filter(m=>m.th==='p:'+who).map(m=>m.text);
  check('3. 跑 STORY.phoneRules：DECIDE_SAY 到了 due+3 送出（played、byMsg、手機有那兩句）',x.played===G.day&&x.byMsg===true&&got.includes('謝謝你的綠茶。')&&got.includes('最後一晚，我想一個人。……考完請你吃飯。'),J({x,got})); }
{ const G=H.fresh('2026-03-01',20,'dorm'); const who='heroine_05';
  G.flags.DECIDE_SAY=[{who,key:'exam',due:G.day-20,say:['謝謝你的綠茶。'],played:false},{who,key:'x2',due:G.day-10,say:['十天整的那一句。'],played:false}];
  const n0=(G.msgs||[]).length; if(S2&&S2.phoneRules) S2.phoneRules(GM); if(typeof PHONE!=='undefined'&&PHONE.tick) PHONE.tick(G);
  const a=G.flags.DECIDE_SAY[0], b=G.flags.DECIDE_SAY[1], got=(G.msgs||[]).slice(n0).map(m=>m.text);
  check('4. 舊存檔拖過 due+10 的不補傳（記 expired、played）；剛好 due+10 的照送',a.played===G.day&&a.expired===true&&!got.includes('謝謝你的綠茶。')&&b.played===G.day&&!b.expired&&got.includes('十天整的那一句。'),J({a,b,got})); }
H.done();

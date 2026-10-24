// 進場事件先劇情、再隨機（BUG-CAFE-RANDOM-ORDER-1022；BB_218 RELEASE-9105 P3）——不需要瀏覽器。
//   一次進場只演一件。隨機的生活小事（random_weight）排在清單前面時，原本會搶走劇情事件那一次進場：
//   大四 9/4（日本路線）進 Café，「咖啡買錯」（ev_wrong_coffee，35%）先演，主線「回來」（ev_back_home_cafe）要出去再進來才演。
//   1 兩件都成立、隨機那件骰到了：演「回來」
//   2 「回來」演過以後：隨機那件照舊（骰到才演，沒骰到什麼都不演）
//   3 劇情事件之間照原本的清單順序；只有隨機的時候照舊骰
// 修改前（開發分支 9072e238）：第 1、3 項 FAIL。用法：node tests/enter_order_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H;
global.CG_REGISTRY={};
for(const f of ['src/data/r2y4a_events.js']){ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^R2Y4A_EVENTS$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
const J=x=>JSON.stringify(x), D=k=>STORY.dayOfKey(k);
const idx=id=>STORY_EVENTS.findIndex(e=>e.id===id), ev=id=>STORY_EVENTS.find(e=>e.id===id);
let ran=[]; EVENTS.run=async e=>{ ran.push(e.id); };   /* 只記 onEnter 挑了哪一件 */
const R0=Math.random, roll=v=>{ Math.random=()=>v; };
const enter=z=>{ ran=[]; const r=EVENTS.onEnter(z); return {r,ran:ran.slice()}; };
check('0. 情境：「咖啡買錯」在清單上排在「回來」前面（隨機、35%）',idx('ev_wrong_coffee')>=0&&idx('ev_back_home_cafe')>idx('ev_wrong_coffee')&&ev('ev_wrong_coffee').random_weight===0.35,J({wrong:idx('ev_wrong_coffee'),back:idx('ev_back_home_cafe')}));
/* 1 */
{ const G=H.fresh('2028-09-05',15,'cafe',{EXCHANGE_ROUTE:'JP',CAFE_VISITS:4}); roll(0);
  const both=[EVENTS.check(ev('ev_wrong_coffee')),EVENTS.check(ev('ev_back_home_cafe'))]; const a=enter('cafe');
  check('1. 日本路線 9/5 進 Café、兩件都成立、隨機那件骰到了：演「回來」，不是「咖啡買錯」',J(both)===J([true,true])&&a.r===true&&J(a.ran)===J(['ev_back_home_cafe']),J({both,a,route:STORY.route(G)})); }
/* 2 */
{ const G=H.fresh('2028-09-05',15,'cafe',{EXCHANGE_ROUTE:'JP',CAFE_VISITS:4,BACK_HOME:D('2028-09-05')});
  roll(0); const a=enter('cafe'); roll(0.99); const b=enter('cafe');
  check('2. 「回來」演過以後：骰到＝「咖啡買錯」；沒骰到＝什麼都不演',J(a.ran)===J(['ev_wrong_coffee'])&&b.r===false&&!b.ran.length,J({a,b})); }
/* 3 */
{ const G=H.fresh('2028-03-08',15,'zz_order',{}); const mk=(id,more)=>Object.assign({id,title:id,participants:[],location:'zz_order',trigger:'enter',background:'freeze',dialogue:[{speaker:null,text:id}]},more||{});
  const T=[mk('t_rand1',{random_weight:0.5}),mk('t_story1'),mk('t_rand2',{random_weight:0.5}),mk('t_story2')]; STORY_EVENTS.push(...T);
  roll(0); const a=enter('zz_order');
  T[1].off='測試'; const b=enter('zz_order');
  T[3].off='測試'; const c=enter('zz_order'); roll(0.9); const d=enter('zz_order');
  STORY_EVENTS.splice(STORY_EVENTS.length-T.length,T.length);
  check('3. 劇情事件之間照清單順序（先 t_story1、再 t_story2）；都沒有了才輪到隨機的（照清單順序骰）',J(a.ran)===J(['t_story1'])&&J(b.ran)===J(['t_story2'])&&J(c.ran)===J(['t_rand1'])&&d.r===false,J({a:a.ran,b:b.ran,c:c.ran,d})); }
Math.random=R0;
H.done();

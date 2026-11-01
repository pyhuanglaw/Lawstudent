// 一定要回的訊息沒回、玩家按關閉手機：提示說是誰在等（BB-B 11-01 BB_218 n40_cardsdiag2：只有「先回覆。」一閃，玩家不知道要回哪一串）——不需要瀏覽器。
//   從 src/game3d.js 抽出 userClosePhone 那一行，用真的 PHONE（src/phone3d.js）跑：可昕私訊在等＝「先回覆可昕。」；群組在等＝「先回覆<群組名>。」；沒有在等＝關掉。
// 修改前（開發分支 d506a6a2f）：提示固定是「先回覆。」——FAIL。用法：node tests/phone_must_toast_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check}=H, J=JSON.stringify;
const src=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
const m=src.match(/const userClosePhone=\(\)=>\{[^\n]*?closePhone\(\); \};/);
check('0. game3d.js 找得到 userClosePhone',!!m);
if(!m) H.done();
const run=(G,phoneThread)=>{ const out={toast:[],closed:0}; const f=new Function('G','PHONE','phoneThread','toast','closePhone',m[0]+' return userClosePhone;')(G,PHONE,phoneThread,t=>out.toast.push(t),()=>out.closed++); f(); return out; };
{ const G=H.fresh('2025-04-24',22.5,'home',{}); INV.addContact(G,'kexin'); PHONE.at(G,G.day,22,[{th:'p:kexin',from:'kexin',text:'蛋糕有你的份。我先吃了。',ask:{id:'t_must',must:true,until:(G.day+5)*24,opts:[{t:'好',say:[]}]}}],'t_must'); PHONE.tick(G);
  const a=run(G,null), b=run(G,'p:kexin');
  check('1. 可昕那一則一定要回、還沒回：按關閉＝「先回覆可昕。」、手機不關（在列表、在她那一串都一樣）',J(a.toast)===J(['先回覆'+PHONE.title(G,'p:kexin')+'。'])&&/可昕/.test(a.toast[0])&&a.closed===0&&J(b.toast)===J(a.toast)&&b.closed===0,J([a,b]));
  PHONE.answer(G,'t_must',0); const c=run(G,null); check('2. 回了以後：關得掉、沒有提示',c.closed===1&&c.toast.length===0,J(c)); }
H.done();

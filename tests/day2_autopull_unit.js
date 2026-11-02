// UX-DAY2-AUTOPULL（BB 2026-11-02 15:34；CC：使用者電腦阿哲那一段演完 2.83 秒就被帶走）：
// 還沒演阿哲那一段＝照舊（空下來就帶到霖澤館前）；演過了＝上課前 5 分鐘（13:15）以後、而且空下來 8 秒才帶進 201；「民總不能翹」不變
const H=require('./pg_harness.js'); const {check}=H, J=JSON.stringify;
(async()=>{
  const G=H.fresh('2025-09-01',13+5/60,'campus'); G.day=2; G.weekday=4; G.stage='law'; delete G.flags.MAIN_D1; G.flags.classDone=false; G.flags.classNow=false;
  check('0. 前提：主線第 2 天（週四）13:05＝day2Due',STORY.mainDay(G)===2&&CLS.day2Due(G),J({md:STORY.mainDay(G),h:G.hour}));
  G.flags.campusIntro=false;
  check('1. 還沒演阿哲那一段：照舊帶到霖澤館前（空下來 1.5 秒＝FREE_MS 那一層管）',CLS.day2PullReady(G,1500));
  G.flags.campusIntro=true;
  check('2. 演完、13:05、剛恢復控制 3 秒：不帶走（BB：快的手機 2.83 秒就被拉走）',!CLS.day2PullReady(G,3000));
  check('3. 演完、13:05、空了 30 秒：還沒到 13:15，不帶走（給玩家自己走過去）',!CLS.day2PullReady(G,30000));
  G.hour=13+15/60;
  check('4. 13:15、空了 5 秒：還不帶（至少 8 秒）',!CLS.day2PullReady(G,5000));
  check('5. 13:15、空了 8 秒：帶進 201（民總不能翹）',CLS.day2PullReady(G,8000));
  G.hour=14.5; check('6. 14:30 還沒上：照舊帶（day2Due 到 15:12）',CLS.day2Due(G)&&CLS.day2PullReady(G,9000));
  const src=require('fs').readFileSync(H.ROOT+'/src/classes3d.js','utf8');
  check('7. oneTick 用 day2PullReady（靜態）',/S\.day2Due\(G\)&&S\.day2PullReady\(G,now-freeSince\)/.test(src));
  check('8. 帶進 201 前的字幕「快上課了。走路到法律系館A 201。」（靜態）',src.includes("to==='classroom'?'快上課了。走路到法律系館A 201。'"));
  H.done();
})();

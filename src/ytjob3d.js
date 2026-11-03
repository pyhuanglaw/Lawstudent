/* ===== 語彤：只有在一盞茶屋打工當同事才會認識（AA_610，STORY-JOB-COWORKER-ROMANCE-1103；AA_624 照舊）=====
   使用者 11-03：「我希望有至少一個除了法律系女主角的可攻略對象，是只能透過打工當同事認識」→「語彤」；「兩人在溫州街同一家店打工」「認識了才有」。
   - YT_MET_JOB：在一盞茶屋上第一班、遇到她（她週六、日 13:00～17:00 都在）＝這一班的開頭（接在蘇姨「水不要滾太久。滾久了，水就老了。」之後）演 AA_610 第 2 節，
     收店那兩句在三段工作之後（JOBS.SHIFT_EV）；演完記 YT_MET_JOB、SOCIAL.meet heroine_03（where tea）、熟悉 +2。
   - 認識以前，她的入口全部關著（每一個入口的擋法見 tests/aa610_ytjob_unit.js 的清單）：
     ①事件：participants 有 heroine_03 的不演（events3d.js X.check）；②作息：不在遊戲裡（story3d.js schedEnt）；③認不認識（STORY.knows）＝不認識：
       閒聊階梯、邀約、別人轉述（heard、圈子）、期末飯、偶遇、出遊、動態、人物頁都看這個；④記憶、見面（SOCIAL.remember／meet）不記；
     ⑤手機：她傳的、她的私訊串、群組裡她說的那一句都不送（PHONE.at／post；一則都不剩＝記成傳過，認識以後不補舊的）。
   - 舊存檔：已經認識她（FIRST_MET、met_heroine_03、熟悉度不是陌生人）＝讀檔記 YT_MET_JOB（照舊，GM.migrate 叫 YTJOB.migrate）。
   - 她從來不在燒臘店（AA_624；schedEnt 擋 zone noodle）。原本麵店的作息（週二、四顧店、大二起週六備料、2029 暑假週四）拿掉，改週六、日 13～17 在一盞茶屋（characters.js）。
   一起上班時的小對話（AA_610 第 3 節）、AA_624 的新事件：等 AA_625 的台詞，這裡還沒做。測試：node tests/aa610_ytjob_unit.js */
'use strict';
const YTJOB=(function(){
  const S={}, YT='heroine_03';
  S.met=G=>!!(G&&G.flags&&G.flags.YT_MET_JOB);
  /* 舊存檔：已經認識的照舊 */
  S.wasMet=function(s){ if(!s) return false; const F=s.flags||{}; if(F.YT_MET_JOB||F.met_heroine_03) return true;
    const M=s.social&&s.social.mem&&s.social.mem[YT]; if(Array.isArray(M)&&M.some(m=>m&&m.tag==='FIRST_MET')) return true;
    const R=s.social&&s.social.rel&&s.social.rel[YT]; if(R&&((R.fam|0)>=5||(R.trust|0)>0||(R.rom|0)>0)) return true;   /* 熟悉度不是陌生人（SOCIAL.friendLevel：fam 5 以上＝ACQUAINTANCE）*/
    if(F.dating_heroine_03||F.EX_heroine_03) return true; return false; };
  S.migrate=function(s){ if(!s||!s.flags||typeof s.flags!=='object') return false; if(s.flags.YT_MET_JOB) return false; if(!S.wasMet(s)) return false; s.flags.YT_MET_JOB=true; return true; };
  /* 第一班（AA_610 第 2 節；台詞一字照稿）*/
  S.A=[ [null,'（水屋裡，一個綁馬尾的女生正在一個一個擦茶杯。）'], ['蘇姨','語彤，他今天第一天。妳帶他。'], [YT,'……嗯。'], [YT,'客人坐下先給水，不要先問點什麼。他們會自己看。'],
    {choice:[{t:'「好。」',say:[[null,'（她點了一下頭，回去擦杯子。）']]},{t:'「妳在這裡做多久了？」',say:[[YT,'高三暑假開始。']]}]} ];
  S.B=[ [null,'（一個下午下來，她跟你講的話不超過十句。）'], [null,'（收店的時候，她倒了一杯剩下的烏龍茶，放在你旁邊。）'], [YT,'第一天都這樣。下週就順了。'] ];
  S._pend=null;
  S.firstShift=async function(GM,ctx){ const G=GM.G; if(S.met(G)||typeof JOBS==='undefined'||!JOBS.play) return false; await JOBS.play(GM,S.A); S._pend=G.day; return true; };
  S.closeShift=async function(GM,k){ const G=GM.G; if(k!=='tea'||S._pend!==G.day||S.met(G)) return false; S._pend=null; await JOBS.play(GM,S.B);
    G.flags.YT_MET_JOB=true; if(typeof SOCIAL!=='undefined'){ SOCIAL.meet(YT,'tea'); const r=SOCIAL.rel(YT); r.fam=(r.fam|0)+2; } return true; };
  /* 手機：認識以前她的訊息都不送 */
  const ytItem=it=>!!it&&(it.from===YT||it.th==='p:'+YT);
  S.gatePhone=function(){ if(typeof PHONE==='undefined'||PHONE._ytjob) return; PHONE._ytjob=true; const at0=PHONE.at, post0=PHONE.post;
    PHONE.at=function(G,day,h,items,tag){ if(!S.met(G)&&Array.isArray(items)&&items.some(ytItem)){ const rest=items.filter(it=>!ytItem(it));
        if(!rest.length){ if(tag&&!PHONE.sent(G,tag)){ const P=PHONE.rec(G); (P.cut=P.cut||[]).push(tag); } return false; } items=rest; }
      return at0.call(this,G,day,h,items,tag); };
    PHONE.post=function(G,m){ if(!S.met(G)&&ytItem(m)) return null; return post0.apply(this,arguments); }; };
  S.install=function(){ S.gatePhone(); if(typeof JOBS!=='undefined'&&Array.isArray(JOBS.SHIFT_EV)&&!JOBS._ytjob){ JOBS._ytjob=true; JOBS.SHIFT_EV.unshift(async(GM,k)=>{ await S.closeShift(GM,k); }); } };
  S.install();
  return S;
})();
if(typeof window!=='undefined') window.YTJOB=YTJOB;

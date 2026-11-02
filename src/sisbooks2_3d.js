/* 學姊第二次傳書（AA_552 第 2 節，取代 BB_156 的時間和台詞；任務 SIS-BOOKS-Y2S1-1031）：她碩一搬研究室，把大學部大二上的書清出來。
   - 條件：法律系；第一次傳書拿到了（SIS_OLD_BOOKS）或認識她（met_sis）。兩個都沒有＝整件不演。
   - 第一段（手機）：2026-09-05（六）17:05 私訊。一般三個回覆、交往中（書瑀）兩個；回任何一個＝學姊熟悉 +1；沒回也有第二段。讀檔時已經搬完（ROOM_Y2）＝不傳。
   - 第二段（管理室）：9/6 回宿舍那天、搬房間那段（story3d.js unboxY2，ROOM_Y2）之後；9/6 沒回宿舍的＝大二上第一次回宿舍那天（到大二上結束）。
     一般：一箱書＋便利貼兩行；朋友以上多一本舊法典＋便利貼（SIS_OLD_CODE）。交往中：書瑀在管理室前面（2D），一定有法典、沒有「以後的書，問 Kevin」。
   - 回聲：拿到書以後的第一堂行政法（admin_law），老師那一句之後兩句旁白；只一次；已經上過大二上行政法的舊存檔不補。
   - 房間書架：SIS_OLD_BOOKS_2（三本）、SIS_OLD_CODE（法典）；只給書架用。
   - 不寫「最後」「畢業」；第一次傳書一句都不改。 */
'use strict';
const SISBOOKS2=(function(){
  const S={}, ID='heroine_05';
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dating=G=>!!(G&&G.flags&&G.flags['dating_'+ID]);
  const friend=()=>typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel&&['FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel(ID));
  S.eligible=G=>law(G)&&!!(G.flags.SIS_OLD_BOOKS||G.flags.met_sis);
  S.D_MSG='2026-09-05'; S.D_BOX='2026-09-06';
  /* ---- 第一段：手機 ---- */
  const P=t=>({th:'p:'+ID,from:ID,text:t});
  S.msgLines=G=>dating(G)?[P('我今天搬研究室。清出三本大二上的書。'),P('明天你搬宿舍，我拿過去。')]:[P('我今天搬研究室。清出三本大二上的書。'),P('明天放男宿管理室。')];
  S.opts=G=>dating(G)?[{t:'我下去接妳。',say:[P('好。四點。')]},{t:'很重的話我去拿。',say:[P('不重。……有一點。')]}]
    :[{t:'謝謝學姊。',say:[P('這次比較重。')]},{t:'研究室在哪？',say:[P('五樓。窗戶對著一棵樹。')]},{t:'上次那三本我還在用。',say:[P('那就好。這三本也一樣。')]}];
  S.phone=function(G){ if(!S.eligible(G)||sent(G,'sis_books2')||G.flags.ROOM_Y2) return; const d=DK(S.D_MSG); if(d==null) return;
    if(!(G.day===d&&G.hour>=17+5/60)&&G.day!==d+1) return;   /* 9/5 17:05 以後；9/6 搬房間以前讀進來的照樣補 */
    if(typeof INV!=='undefined'&&INV.hasContact&&!INV.hasContact(G,ID)) return;
    if((typeof ROM!=='undefined'&&!!ROM.exOf&&ROM.exOf(G,ID))) return;   /* AA_600 B23：前任不傳（書照樣放管理室：第二段的事件不看這一則）*/
    const L=S.msgLines(G); L[L.length-1].ask={id:'sis_books2_ask',until:(d+1)*24+16,opts:S.opts(G)}; PHONE.at(G,d,17+5/60,L,'sis_books2'); };
  S.onAnswer=function(G,m){ if(m&&m.ask&&m.ask.id==='sis_books2_ask'&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(ID,{fam:1},'sis_books2'); };
  /* ---- 第二段：管理室（事件）---- */
  const due=G=>{ if(!S.eligible(G)||!G.flags.ROOM_Y2||G.flags.ROOM_Y2_MOVING) return false; const d=DK(S.D_BOX), r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y2S1'):null; return d!=null&&G.day>=d&&G.day<=(r?r.to:d+120); };
  S.EVENT={ id:'ev_sis_books_y2s1', title:'舊教科書', participants:[], location:['dorm','dorm_hall'], trigger:'auto', once:true, priority:6, background:'blur',
    prereq:{custom:due},
    dialogue:[
      {unless:{flags:['dating_'+ID]},speaker:null,text:'（管理室有你的一箱書。上面貼著一張便利貼，跟上次一樣。）'},
      {unless:{flags:['dating_'+ID]},speaker:null,text:'（便利貼：「行政法、刑分、物權。後半本我擦掉了，換你寫。」）'},
      {unless:{flags:['dating_'+ID]},speaker:null,text:'（下面還有一行，比較小：「以後的書，問 Kevin。」）'},
      {unless:{flags:['dating_'+ID]},if:{custom:()=>friend()},speaker:null,text:'（箱子最下面還有一本舊法典，側邊貼滿了索引貼。）'},
      {unless:{flags:['dating_'+ID]},if:{custom:()=>friend()},speaker:null,text:'（另一張便利貼：「條文是舊的，不要用。貼法可以照抄。」）'},
      {unless:{flags:['dating_'+ID]},if:{custom:()=>friend()},set:{SIS_OLD_CODE:true}},
      {if:{flags:['dating_'+ID]},speaker:null,text:'（管理室前面，書瑀坐在一個紙箱上。）'},
      {if:{flags:['dating_'+ID]},speaker:ID,expression:'neutral',text:'行政法、刑分、物權。後半本我擦掉了。'},
      {if:{flags:['dating_'+ID]},speaker:ID,expression:'smile',text:'……換你寫。'},
      {if:{flags:['dating_'+ID]},speaker:null,text:'（箱子最下面是她的舊法典，側邊貼滿了索引貼。）'},
      {if:{flags:['dating_'+ID]},speaker:ID,expression:'neutral',text:'條文是舊的，不要用。貼法可以照抄。'},
      {if:{flags:['dating_'+ID]},set:{SIS_OLD_CODE:true}} ],
    consequences:{flags:{SIS_OLD_BOOKS_2:true},memo:'學姊大二上的舊書'} };
  /* ---- 回聲：第一堂行政法（老師那一句之後）---- */
  S.echoDue=(G,it)=>law(G)&&!!G.flags.SIS_OLD_BOOKS_2&&!G.flags.SIS_BOOKS2_ECHO&&!!it&&!!it.c&&it.c.id==='admin_law'&&!it.exam;
  S.inClass=async function(GM,it){ const G=GM&&GM.G; if(!S.echoDue(G,it)) return false; G.flags.SIS_BOOKS2_ECHO=G.day;
    await GM.say(null,dating(G)?'（你翻開書瑀的行政法。她的字停在一半。）':'（你翻開學姊的行政法。她的字停在一半。）');
    await GM.say(null,'（老師講到第一個重點。你在空白的地方，寫了第一行自己的字。）'); return true; };
  /* 舊存檔：拿書以前已經上過大二上的行政法＝不補回聲 */
  S.markOldEcho=function(G){ if(!law(G)||G.flags.SIS_BOOKS2_ECHO||typeof CLS==='undefined'||!CLS.rec) return; const R=CLS.rec(G); if((R.attend&&R.attend.admin_law|0)>0&&!G.flags.SIS_OLD_BOOKS_2) G.flags.SIS_BOOKS2_ECHO='old'; };
  /* ---- 房間書架 ---- */
  S.room=function(G,L){ if(!law(G)) return; const F=G.flags;
    if(F.SIS_OLD_BOOKS_2) L.push([dating(G)?'書瑀的大二上舊書':'學姊的大二上舊書',dating(G)?'書瑀的三本大二上舊書。後半本是空的，現在有你的字。':'學姊的三本大二上舊書。後半本是空的，現在有你的字。']);
    if(F.SIS_OLD_CODE) L.push(['她的舊法典','她的舊法典。條文是舊的，貼法照抄了。']); };
  /* ---- 掛勾 ---- */
  if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e.id===S.EVENT.id)) STORY_EVENTS.push(S.EVENT);
  if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)) PHONE.ON_ANSWER.push((G,m)=>S.onAnswer(G,m));
  if(typeof CLS!=='undefined'&&Array.isArray(CLS.IN_CLASS)){ const f=(GM,it)=>S.inClass(GM,it); f.due=(G,it)=>S.echoDue(G,it); CLS.IN_CLASS.push(f); }
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>{ S.markOldEcho(G); S.phone(G); });
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,L)=>S.room(G,L)); }
  return S;
})();
if(typeof window!=='undefined') window.SISBOOKS2=SISBOOKS2;

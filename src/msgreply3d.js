/* ===== 女主角主動傳來的訊息：可以用選項回（MSG-REPLY-1107；USER_WANTS X262）=====
   使用者 11-07 試玩：「女主角都不能傳訊息 但是 至少他們傳給我 可以給我選項回覆 依照選項增加或降低好感」「芯慈 我又不能回 他問我 我睡了嗎」
   台詞：AA_709（src/data/msg_replies.js，tools/story/import_msg_replies.py 產生）——她「分享生活」的那一串，最後一則（text，逐字）掛三個回覆選項。
   - 掛的時機：那一則訊息送出的那一刻（PHONE.ON_MK：phone3d.js 的 mk）；人＝那一則的 from、內容逐字相同、本來沒有選項（ask）的才掛。
   - 回了：照 PHONE 現有「可以回的訊息」（ask）——祐廷那一句貼上去、她接著回（say）；好感照選項的 rel（PHONE.ON_ANSWER → SOCIAL.adjust）。
   - 沒回：不扣分（AA_709：分享生活的訊息她們多半說了不用回）；一天半以後選項收起來（ask.until）。
   - 舊存檔：已經收到的訊息不補選項（之後新收到的才有）。
   測試：node tests/msg_reply_unit.js */
'use strict';
const MSGR=(function(){
  const S={};
  const D=()=>(typeof MSG_REPLIES!=='undefined'&&MSG_REPLIES.people)||{};
  S.OPEN_H=36;   /* 一天半內可以回 */
  S.find=(id,text)=>{ const L=D()[id]; if(!L||typeof text!=='string') return null; const i=L.findIndex(e=>e.text===text); return i<0?null:{i,e:L[i]}; };
  S.attach=function(G,m){ if(!m||m.ask||!m.from||m.from==='player') return false; const id=m.from; if(m.th&&m.th!=='p:'+id) return false; const f=S.find(id,m.rk||m.text); if(!f) return false;   /* m.rk：有代入字的訊息對 AA_709 原句（phone3d.js）*/
    m.ask={id:'r709:'+id+':'+f.i+':'+m.day,until:m.day*24+m.h+S.OPEN_H,opts:f.e.opts.map(o=>Object.assign({t:o.t,say:(o.say||[]).map(t=>({from:id,text:t})),rel:o.rel,relWho:id},o.tell?{tell:o.tell}:{},o.fx?{fx:o.fx,fxWho:id}:{}))};   /* fx：DLG-FX-MECH-1110（PHONE.answer 算）*/
    if(f.e.set&&G&&G.flags&&G.flags[f.e.set]==null) G.flags[f.e.set]=G.day;   /* 收到這一串就記（AA_709：以安 AN_MSG_MOM_OK、AN_MSG_JAPAN；AA_712 以安第 4 拍的 alt 看這個）*/
    return true; };
  S.onAnswer=function(G,m,o){ if(!o||!o.relWho) return; if(o.rel&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(o.relWho,o.rel);
    if(o.tell&&G&&G.flags){ const T=G.flags.YT_TOLD||(G.flags.YT_TOLD={}), t=T[o.tell]||(T[o.tell]={}); if(t[o.relWho]==null) t[o.relWho]=G.day; } };   /* 選項講了祐廷自己的事（tell）：和故事線同一份 YT_TOLD（src/arcs3d.js）*/
  /* AA 新寫的五串（AA_709 new；遊戲裡原本沒有）：那一學期第幾週的週三、幾點傳；條件（cond）照稿；要有她的聯絡方式；tag 只送一次（PHONE.at 照時間送，睡過去照原本的時間補）*/
  S.COND={flag:(G,id,v)=>!!(G.flags&&G.flags[v]!=null&&G.flags[v]!==false), stage:(G,id,v)=>(typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):1)>=(+v)};
  S.condOk=(G,id,c)=>{ if(!c) return true; const i=c.indexOf(':'), f=S.COND[c.slice(0,i)]; return f?f(G,id,c.slice(i+1)):false; };
  S.newDay=function(n){ if(typeof CALENDAR==='undefined'||!Array.isArray(CALENDAR.TERMS)||typeof STORY==='undefined'||!STORY.dayOfKey) return null; const T=CALENDAR.TERMS.find(t=>t.id===n.term); if(!T) return null; const d0=STORY.dayOfKey(T.start); return d0==null?null:d0+(n.week-1)*7+2; };
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||typeof PHONE==='undefined'||!PHONE.at) return false;
    for(const [id,L] of Object.entries(D())) L.forEach((e,i)=>{ if(!e.new) return; const tag='r709new:'+id+':'+i; if(PHONE.sent(G,tag)) return; const d=S.newDay(e.new); if(d==null||G.day<d-1||G.day>d) return;
      if(typeof INV!=='undefined'&&INV.hasContact&&!INV.hasContact(G,id)) return; if(!S.condOk(G,id,e.new.cond)) return;
      PHONE.at(G,d,e.new.h,e.new.thread.concat([e.text]).map(t=>({th:'p:'+id,from:id,text:t})),tag); });
    return false; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.tick)) STORY.TICKS.push(S.tick);
  if(typeof PHONE!=='undefined'){ if(Array.isArray(PHONE.ON_MK)) PHONE.ON_MK.push(S.attach); if(Array.isArray(PHONE.ON_ANSWER)) PHONE.ON_ANSWER.push(S.onAnswer); }
  return S;
})();

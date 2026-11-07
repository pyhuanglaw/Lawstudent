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
  S.attach=function(G,m){ if(!m||m.ask||!m.from||m.from==='player') return false; const id=m.from; if(m.th&&m.th!=='p:'+id) return false; const f=S.find(id,m.text); if(!f) return false;
    m.ask={id:'r709:'+id+':'+f.i+':'+m.day,until:m.day*24+m.h+S.OPEN_H,opts:f.e.opts.map(o=>({t:o.t,say:(o.say||[]).map(t=>({from:id,text:t})),rel:o.rel,relWho:id}))}; return true; };
  S.onAnswer=function(G,m,o){ if(!o||!o.rel||!o.relWho||typeof SOCIAL==='undefined'||!SOCIAL.adjust) return; SOCIAL.adjust(o.relWho,o.rel); };
  if(typeof PHONE!=='undefined'){ if(Array.isArray(PHONE.ON_MK)) PHONE.ON_MK.push(S.attach); if(Array.isArray(PHONE.ON_ANSWER)) PHONE.ON_ANSWER.push(S.onAnswer); }
  return S;
})();

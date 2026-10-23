/* ===== 可昕的學期末約會「寒假來高雄」的下文（AA_401 第 2、3 節＋大五上的週六提醒，企劃線 18251b0e1；任務 AA389-REST-L-1023／AA389-KX-TERMDATE-1023）=====
   學期末約會的二選一在 termend_lines.js 的 KX_ASK（termend3d.js kexinDinner 接在 table 後面），記 KX_KHH[學期＋W／S]、KX_Y5_CALL。台詞照稿一字不改。
   - 答應了（yes）的那一次寒暑假（她在高雄＝STORY.presence('kexin').kind 'home'）：她回高雄的第 3 天 21:00 一則；最後一天 21:00 玩家還沒去（那一段寒暑假沒有演過 ev_hv_kx）＝一則。
     大二上回「寒假我可能沒空。」（Y2W no）：寒假她在高雄的第 5 天 21:00 夜市的照片，一次。沒去不扣關係。
   - 去了高雄那一天（hometown3d.js S.play 的接人之後問 S.pickLine）：答應過的那一次寒暑假，第一次去，多一句（大二寒假、大二暑假（其他）、大三寒假、大四寒假）。
   - 大五上選「週末一定打。」：受訓期間第一個週六（pgdates3d.js 我們的日子裡第一格電話）22:00 手機提醒「打給可昕」；打了照現有的電話接。
   哪一次寒暑假：照她回高雄那一天的年月——一、二月＝前一學年的寒假（2027＝Y2W），七、八月＝那一學年的暑假（2027＝Y2S）。
   測試：node tests/aa401_kx_khh_unit.js */
'use strict';
const KXKHH=(function(){
  const S={}, KX='kexin';
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dm=t=>({th:'p:'+KX,from:KX,text:t});
  const home=(G,day)=>{ if(typeof STORY==='undefined'||!STORY.presence) return false; const p=STORY.presence(KX,Object.assign({},G,{day})); return !!p&&p.here===false&&p.kind==='home'; };
  const C10=G=>typeof VAC!=='undefined'&&!!VAC.enrolled&&VAC.enrolled(G,'C10');
  const US=G=>typeof STORY!=='undefined'&&STORY.route&&STORY.route(G)==='US';
  /* 她這一段在高雄：{a 第一天, b 最後一天, key} */
  S.run=function(G,day){ if(day==null) day=G.day; if(!home(G,day)) return null; let a=day, b=day; while(a>day-90&&home(G,a-1)) a--; while(b<day+90&&home(G,b+1)) b++;
    const d=CALENDAR.dateOf(a), Y=d.y-2025; let key=null; if(d.m<=2) key='Y'+Y+'W'; else if(d.m===12) key='Y'+(Y+1)+'W'; else if(d.m>=6&&d.m<=9) key='Y'+Y+'S';   /* 十二月底就回高雄的＝下一年一月那個寒假 */ return key?{a,b,key}:null; };
  S.MSG3={Y2W:G=>['夜市週二、週五才有。','你說要來的。'],Y2S:G=>C10(G)?['你哪天出發？出發前那個禮拜，選一天。']:['這次待到晚上。你說的。'],Y3W:G=>['我排好了。你來就好。'],
    Y3S:G=>US(G)?['七月你空哪天。']:['一次就好。……可是要來。'],Y4W:G=>['兩個位子我占好了。']};
  S.PICK={Y2W:G=>'夜市晚上才有。白天先帶你去別的地方。',Y2S:G=>C10(G)?null:'末班高鐵十點半。我查過了。',Y3W:G=>'今天去的地方，我也沒去過。',Y4W:G=>'位子在三樓靠窗。你的筆記帶了吧。'};
  const visited=(G,R)=>typeof OUT!=='undefined'&&OUT.rec(G).some(q=>q.ev==='ev_hv_kx'&&q.state==='done'&&q.day>=R.a&&q.day<=R.b);
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; const F=G.flags, KH=F.KX_KHH||{};
    const R=S.run(G); if(R){ const v=KH[R.key];
      if(v==='yes'&&S.MSG3[R.key]){ const d3=R.a+2; if(G.day>=d3&&now(G)>=T(d3,21)&&G.day<=d3+1) PHONE.at(G,d3,21,S.MSG3[R.key](G).map(dm),'kxkhh_d3_'+R.key);
        if(G.day===R.b&&G.hour>=21&&!visited(G,R)) PHONE.at(G,R.b,21,(R.key==='Y2W'?['（照片：夜市的燈）','我自己來了。']:['我明天回去了。','……下次。']).map(dm),'kxkhh_last_'+R.key); }
      if(R.key==='Y2W'&&v==='no'){ const d5=R.a+4; if(G.day>=d5&&now(G)>=T(d5,21)&&G.day<=d5+1) PHONE.at(G,d5,21,['（照片：夜市的燈）','這是你說沒空的那個夜市。'].map(dm),'kxkhh_no_Y2W'); } }
    if(F.KX_Y5_CALL==='sat'&&typeof PGDATE!=='undefined'&&PGDATE.kxList){ let s=null; try{ s=(PGDATE.kxList(G)||[]).find(x=>x.kind==='call'); }catch(e){ s=null; }
      if(s&&G.day===s.day&&G.hour>=22&&!sent(G,'kxkhh_y5_call')) PHONE.at(G,s.day,22,[{th:'sys',text:'打給可昕'}],'kxkhh_y5_call'); } };
  /* hometown3d.js：答應過的那一次寒暑假，第一次去，接人之後多一句 */
  S.pickLine=function(G){ const R=S.run(G); if(!R) return null; const KH=(G.flags.KX_KHH)||{}; if(KH[R.key]!=='yes'||!S.PICK[R.key]) return null; const U=G.flags.KX_KHH_PICKED||(G.flags.KX_KHH_PICKED={}); if(U[R.key]) return null;
    const t=S.PICK[R.key](G); if(!t) return null; U[R.key]=G.day; return t; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  return S;
})();

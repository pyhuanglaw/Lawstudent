/* ===== AA_442 第 1、2 節（AA-B 2026-10-24，企劃線 d94d259ec；第①級、D109）=====
   台詞在 src/data/jpprep_events.js（JPPREP_LINES、JPPREP_EVENTS，照稿不改字）。這個檔只接線：
   第 1 節 住家裡的週四 20:00 家人群組（home3d.js 的 S.phoneRules 先問 HOME.LIVE_GROUP）：
     - 住家裡（HOME.livesHome：經濟系休學在家、法律系放假住家裡、日本路線住家裡、畢業以後住家裡）＝住家裡版 H1～H6，照 G.day/7 每週輪一則；不問、不用回，兩小時後爸爸也不傳「？」。
       （AA_466 第 1 節：改成十二則照順序一輪用完才從頭、「國外」「在家」照 STORY.abroad 跳過、第 4 則國外版；見 S.groupNext。測試：node tests/aa466_jp_unit.js）
       （AA_466 第 5 節：日本路線退宿以後到搬進 409 都發——人在日本、8/5 回來以後的暑假也發，同一輪接著輪；見 S.jpOn。下面「日本路線回來以後不發」改掉了）
     - 什麼時候發（AA_443 第 3 節範圍更正）：只在原本就會發的時候換掉＝法律系、學期中（CALENDAR.termOf 有、STORY.mainDay≥2），人卻住家裡。
       實際用到：日本路線出發前 2/20～3/24（大三下學期中，JP.homeOn）、畢業以後住家裡（pgHome；學期表還在算的話——延畢）。
       寒暑假（法律系放假住家裡 breakMode、日本路線回來以後 8/5～9/3）原本就不發，維持不發。
       經濟系休學在家（baseMode）：AA_443 第 3 節列在適用裡，可是那一年 STORY.mainDay 是負的，home3d.js 原本就不發（不是問句版、是整則沒有）；
       這裡只換、不新增，照舊不發（要發的話：liveDue 的 on 加 HOME.baseMode(G)＆CALENDAR.termOf；經濟系的跳日期收到任何訊息都會停，每週四會多一個停點）。
     - 學期中住家裡的時候，家人群組照原本每次加入（PHONE.join），週四 20:00 才發。
     - 過年爸爸在家那幾天（除夕前 3 天到初五；2029 年他待到元宵 2/26，AA_440 第 4 節）不發。日本路線 3/23（四）換成 JP_0323 三句。
   第 2 節 日本路線出發前（2028-02-20～03-24，住臺北的家）：
     - 在家、在外面的一段（2/21、2/26、3/8、3/12、3/14、3/17、3/18、3/19、3/21；九個晚上的日文電話；挽回中 3/11；沒有電話的五個早上）＝JP.SCH 多幾列（w:'home'）：
       jp3d.js 的 homeRound 到了就演（JP.dueStop／playStop），快轉停在那裡（JP.nextStop）。
     - 手機（2/25 10:00 系統、2/25 21:00 以安、3/4 22:00 宜蓁、3/5 20:00 麵店團、3/10 10:00 系統、3/18 21:00 以安）＝STORY.PHONE_RULES；快轉停點＝JP.STOPS（排好了、還沒送到的照樣停）。
     - 3/1 14:00 行前說明會＝出遊（2/25 的通知送到以後排；家裡的選單「出發」，2D）。
     - 日文電話：2/25 回「好。」「十分鐘夠嗎？」＝AN_JP_CALL true、「我自己練就好。」＝false；有 true 的九個晚上 21:00 演（時間過 10 分鐘）。
       那天 20:30～21:30 已經排了別的（出遊、視訊、當面約）＝那一晚跳過，句子不往後挪。沒有電話的（挽回中、交往中沒有 AN_JP_CALL）＝那五天早上 10:00 一句旁白。
   存檔：旗標 AN_JP_CALL（true／false）、JPP_* 不用；JP.SCH 演過的照 G.jp.done；訊息照 PHONE 的 tag。
   測試：node tests/aa442_jpprep_unit.js */
'use strict';
const JPPREP=(function(){
  const S={};
  const X=typeof JPPREP_LINES!=='undefined'?JPPREP_LINES:null;
  if(!X) return S;
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, NOW=G=>T(G.day,G.hour);
  const Fl=G=>G.flags||(G.flags={});
  const law=G=>!!G&&(G.stage||'law')==='law';
  const isJP=G=>law(G)&&typeof STORY!=='undefined'&&!!STORY.route&&STORY.route(G)==='JP';
  const dat=G=>{ const f=Fl(G), R=f.romance||{}; return f.dating_heroine_01===true||!!(R.heroine_01&&R.heroine_01.status==='dating'); };   /* 同 jp3d.js */
  const callOn=G=>dat(G)&&Fl(G).AN_JP_CALL===true;
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const knows=(id,G)=>typeof STORY!=='undefined'&&STORY.knows?!!STORY.knows(id,G):(typeof SOCIAL!=='undefined'&&SOCIAL.has(id,'FIRST_MET'));
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const arrived=(G,tag)=>(G.msgs||[]).some(m=>m&&m.tag===tag)||!!(G.phone&&(G.phone.cut||[]).includes(tag));
  const NAME={mom:'媽媽',dad:'爸爸',sister:'姊姊'};
  const item=(th,from,text)=>{ if(from==null) return {th,who:null,text}; const o={th,from,text}; if(NAME[from]) o.name=NAME[from]; return o; };

  /* ===================== 第 1 節 住家裡的週四家人群組 ===================== */
  /* 過年爸爸在家（除夕前 3 天～初五；2029 待到元宵 2/26）*/
  S.dadHome=function(day){ if(typeof CALENDAR==='undefined'||!CALENDAR.holiday) return false; for(let x=day-5;x<=day+3;x++) if(CALENDAR.holiday(x)==='除夕') return true;
    const a=DK('2029-02-09'), b=DK('2029-02-26'); return a!=null&&b!=null&&day>=a&&day<=b; };
  /* AA_466 第 1 節：十二則照順序一輪用完才從頭（原本照 G.day/7 輪六則）。F.HOME_LIVE_N＝已經走過的位置數（第 n 個位置＝第 n%12 則）；
     輪到不能用的（HOME_GROUP_WHEN：國外／在家，照 STORY.abroad）跳下一則，跳過的那一則這一輪不再補。3/23 那三句（JP_0323）不佔位置。
     舊存檔沒有 HOME_LIVE_N＝照手機裡已經收過的住家裡版則數接著算（tag home_live_<日>，3/23 那天不算）*/
  S.abroadNow=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&!!STORY.abroad(G);
  S.groupUsable=(G,i)=>{ const w=(X.HOME_GROUP_WHEN||[])[i]; return !w||(w==='abroad'?S.abroadNow(G):!S.abroadNow(G)); };
  S.liveN=function(G){ const F=Fl(G); if(typeof F.HOME_LIVE_N==='number') return F.HOME_LIVE_N; const d23=DK('2028-03-23'), skip='home_live_'+d23, s=new Set(), ok=t=>typeof t==='string'&&/^home_live_-?\d+$/.test(t)&&t!==skip;
    const P=typeof PHONE!=='undefined'&&PHONE.rec?PHONE.rec(G):null; if(P){ for(const q of (P.q||[])) if(q&&ok(q.tag)) s.add(q.tag); for(const t of (P.cut||[])) if(ok(t)) s.add(t); }
    for(const m of (G.msgs||[])) if(m&&ok(m.tag)) s.add(m.tag); return s.size; };
  S.groupNext=function(G){ const n=X.HOME_GROUP.length, p=S.liveN(G); for(let j=p;j<p+n;j++) if(S.groupUsable(G,j%n)) return {pos:j,idx:j%n}; return {pos:p,idx:p%n}; };
  S.groupIdx=G=>S.groupNext(G).idx;
  S.groupLines=(G,i)=>{ const A=X.HOME_GROUP_ABROAD&&X.HOME_GROUP_ABROAD[i]; return A&&S.abroadNow(G)?A:X.HOME_GROUP[i]; };   /* 第 4 則人在國外：媽媽「換了 上個月就換了」*/
  S.is0323=G=>{ const d=DK('2028-03-23'); return d!=null&&G.day===d&&typeof JP!=='undefined'&&!!JP.homeOn&&!!JP.homeOn(G); };
  S.groupFor=function(G){ if(S.is0323(G)) return X.JP_0323; return S.groupLines(G,S.groupIdx(G)); };
  /* 學期中（原本 home3d.js 會發的時候：法律系、CALENDAR.termOf 有、STORY.mainDay≥2）*/
  S.termOn=function(G){ if(!law(G)) return false; const Tm=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null, md=typeof STORY!=='undefined'&&STORY.mainDay?STORY.mainDay(G):G.day; return !!Tm&&md>=2; };
  /* AA_466 第 5 節（企劃線 8a7f797ec）：日本路線退宿以後（JP.movedOut：出發前住臺北的家 → 人在日本（6/8 學期表結束以後也發）→ 8/5 回來以後住家裡的暑假，到搬進 409）每週四都發，
     同一輪接著輪、不重算（F.HOME_LIVE_N）；人在日本＝國外（STORY.abroad）；臺灣 20:00＝手機的當地時間 20＋時差（日本 21:00）。人在日本那一路由 jp3d.js 的 HOME.phoneRules 放行 */
  S.jpOn=G=>isJP(G)&&typeof JP!=='undefined'&&!!JP.movedOut&&!!JP.movedOut(G)&&!(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf&&CALENDAR.dateOf(G.day).key>='2028-09-04');   /* AA_471 第 1 節：只到大四上開學（2028-09-04 搬進 409）為止——畢業 6/28 搬回家以後 JP.movedOut 又成立，原本一路發到 2030（76 個週四、每則一個停點）；畢業以後照所有人一樣 */
  S.on=G=>S.termOn(G)||S.jpOn(G);
  S.liveH=G=>20+((typeof STORY!=='undefined'&&STORY.tzOffset?STORY.tzOffset(G,G.day):0)||0);
  S.liveDue=G=>S.on(G)&&G.weekday===4&&((G.hour%24)+24)%24>=S.liveH(G)&&!S.dadHome(G.day);   /* 寒暑假不發（AA_443 第 3 節；日本路線退宿以後例外，AA_466 第 5 節）*/
  S.liveGroup=function(G){ if(typeof PHONE==='undefined'||!S.on(G)) return false; PHONE.join(G,'home','家人');   /* 同 home3d.js：學期中就在家人群組裡 */
    if(!S.liveDue(G)) return false; const tag='home_live_'+G.day; if(PHONE.sent(G,tag)) return false; const h=S.liveH(G);
    if(S.is0323(G)) return PHONE.at(G,G.day,h,X.JP_0323.map(([w,t])=>item('g:home',w,t)),tag);
    const nx=S.groupNext(G), ok=PHONE.at(G,G.day,h,S.groupLines(G,nx.idx).map(([w,t])=>item('g:home',w,t)),tag); if(ok) Fl(G).HOME_LIVE_N=nx.pos+1; return ok; };

  /* ===================== 第 2 節 日本路線出發前 ===================== */
  S.K0='2028-02-20'; S.K1='2028-03-24';
  S.prep=G=>{ if(!isJP(G)||typeof JP==='undefined'||!JP.homeOn||!JP.homeOn(G)||(JP.departed&&JP.departed(G))) return false; const a=DK(S.K0), b=DK(S.K1); return a!=null&&b!=null&&G.day>=a&&G.day<=b; };
  /* 那天 20:30～21:30 已經排了別的（出遊、視訊、當面約）＝那一晚的電話跳過 */
  S.eveBusy=function(G,d){ const a=T(d,20.5), b=T(d,21.5), inW=t=>t>=a-1e-6&&t<=b+1e-6;
    if(typeof OUT!=='undefined'&&OUT.rec&&OUT.rec(G).some(q=>q&&(q.state==='planned'||q.state==='done')&&inW(T(q.day,q.h)))) return true;
    return Array.isArray(G.invites)&&G.invites.some(iv=>iv&&(iv.state==='accepted'||iv.state==='done')&&inW(T(iv.day,iv.h))); };
  const ok=G=>isJP(G)&&!(typeof JP!=='undefined'&&JP.departed&&JP.departed(G));
  S.SCH=[
    {k:'jpp_0221',d:'2028-02-21',h:8,w:'home',if:ok,ev:'ev_jpp_0221'},
    {k:'jpp_0226',d:'2028-02-26',h:11,w:'home',if:ok,ev:'ev_jpp_0226'},
    {k:'jpp_0308',d:'2028-03-08',h:14,w:'home',if:ok,sum:X.d0308},
    {k:'jpp_0311',d:'2028-03-11',h:14,w:'home',if:G=>ok(G)&&!dat(G),sum:X.rep0311},   /* 挽回中（交往中那天是和她去買，jp3d.js 的 jp_g0_bag）*/
    {k:'jpp_0312',d:'2028-03-12',h:10,w:'home',if:ok,ev:'ev_jpp_0312'},
    {k:'jpp_0314',d:'2028-03-14',h:10,w:'home',if:ok,ev:'ev_jpp_0314'},
    {k:'jpp_0317',d:'2028-03-17',h:11,w:'home',if:ok,ev:'ev_jpp_0317'},
    {k:'jpp_0318',d:'2028-03-18',h:15,w:'home',if:ok,sum:X.d0318},
    {k:'jpp_0319',d:'2028-03-19',h:20.5,w:'home',if:ok,ev:'ev_jpp_0319'},
    {k:'jpp_0321',d:'2028-03-21',h:18.5,w:'home',if:ok,ev:'ev_jpp_0321'} ]
    .concat(X.CALLS.map(([k])=>{ const id='ev_jpp_call_'+k.slice(5).replace('-',''); return {k:'jpp_call_'+k.slice(5).replace('-',''),d:k,h:21,w:'home',if:G=>ok(G)&&callOn(G)&&!S.eveBusy(G,DK(k)),ev:id}; }))
    .concat(X.MORNINGS.map(([k,t])=>({k:'jpp_am_'+k.slice(5).replace('-',''),d:k,h:10,w:'home',if:G=>ok(G)&&!callOn(G),sum:t})));
  if(typeof JP!=='undefined'&&Array.isArray(JP.SCH)) for(const s of S.SCH) if(!JP.SCH.some(q=>q.k===s.k)) JP.SCH.push(s);

  /* 手機：[tag, 日子, 幾點, 對話串, 句子（[誰,字]）或 fn(G), 條件, 回覆 fn(d)] */
  const AN='heroine_01', NG='g:noodle_team';
  S.MSGS=[
    {tag:'jpp_0225_info',day:'2028-02-25',h:10,th:'sys',ms:[[null,X.d0225]]},
    {tag:'jpp_0225_call',day:'2028-02-25',h:21,th:'p:'+AN,ms:X.callAsk.ms.map(t=>[AN,t]),if:dat,
      ask:()=>({until:T(DK('2028-02-29'),20),opts:X.callAsk.opts.map(([t,r,v])=>({t,set:{AN_JP_CALL:v},say:[{from:AN,text:r}]}))})},
    {tag:'jpp_0304',day:'2028-03-04',h:22,th:'p:sister',ms:X.d0304.ms.map(t=>['sister',t]),
      ask:d=>({until:T(d+1,18),opts:X.d0304.opts.map(([t,r])=>({t,say:[{from:'sister',name:'姊姊',text:r}]}))})},
    {tag:'jpp_0305',day:'2028-03-05',h:20,th:NG,ms:G=>X.d0305.filter(([w])=>knows(w,G)),if:G=>inGrp(G,'noodle_team')},   /* 照 STORY.knows：不認識的那一位不出現 */
    {tag:'jpp_0310',day:'2028-03-10',h:10,th:'sys',ms:[[null,X.d0310]]},
    {tag:'jpp_0318_bag',day:'2028-03-18',h:21,th:'p:'+AN,ms:X.bag.ms.map(t=>[AN,t]),if:dat,   /* 交往中（不論有沒有打電話）*/
      ask:d=>({until:T(d+1,18),opts:[{t:X.bag.notyet,say:[{from:AN,text:X.bag.notyetSay}]},{t:X.bag.done,say:[{from:AN,text:X.bag.doneSay[0]},{who:null,text:X.bag.doneSay[1]},{from:AN,text:X.bag.doneSay[2]}]}]})} ];
  S.gate=(G,m)=>{ try{ return S.prep(G)&&(!m.if||!!m.if(G)); }catch(e){ return false; } };
  S.send=function(G,m){ const d=DK(m.day); if(d==null||G.day<d||G.day>d+1||sent(G,m.tag)||!S.gate(G,m)) return false;
    const ms=typeof m.ms==='function'?m.ms(G):m.ms; if(!ms||!ms.length) return false; const M=ms.map(([w,t])=>item(m.th,w,t));
    if(m.ask){ const a=m.ask(d,G); M[M.length-1].ask=Object.assign({id:m.tag},a); }
    return PHONE.at(G,d,m.h,M,m.tag); };
  /* 3/1 14:00 行前說明會（一鍵，2D）：2/25 的通知送到以後排 */
  S.plan=function(G){ const d=DK('2028-03-01'); if(d==null||typeof OUT==='undefined'||!OUT.plan||OUT.get(G,'jpp_0301')||!arrived(G,'jpp_0225_info')||NOW(G)>=T(d,14.5)||!S.prep(G)) return false;
    return OUT.plan(G,{id:'jpp_0301',ev:'ev_jpp_0301',day:d,h:14,late:0.5,place:'國際事務處',title:'出國交換行前說明會',travel:'捷運＋公車 約 30 分鐘',travelH:0.5}); };
  S.phone=function(G){ if(!G||!G.flags||typeof PHONE==='undefined'||!isJP(G)) return; for(const m of S.MSGS){ try{ S.send(G,m); }catch(e){ console.warn('JPPREP '+m.tag,e); } } try{ S.plan(G); }catch(e){ console.warn('JPPREP plan',e); } };
  /* 快轉停點（住臺北的家）：手機那幾則的時間（排好了、還沒送到的照樣停）*/
  S.stops=function(G,now,where){ if(where!=='home'||!isJP(G)) return null; const out=[];
    for(const m of S.MSGS){ const d=DK(m.day); if(d==null||arrived(G,m.tag)) continue; const t=T(d,m.h); if(t<=now+1e-6) continue; if(sent(G,m.tag)||S.gate(Object.assign({},G,{day:d,hour:m.h}),m)) out.push(t); }
    return out; };

  /* ===================== 掛勾 ===================== */
  if(typeof HOME!=='undefined'&&'LIVE_GROUP' in HOME) HOME.LIVE_GROUP=G=>S.liveGroup(G);
  if(typeof JP!=='undefined'&&Array.isArray(JP.STOPS)) JP.STOPS.push((G,now,where)=>S.stops(G,now,where));
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  return S;
})();

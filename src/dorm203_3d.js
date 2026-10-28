/* ===== 203 室友日常：房間閒聊、四個人的六件小事、203 群組（AA_502，AA-C 2026-10-28，第②級；DORM203-MATES-1028 第二部分、USER_WANTS X123）=====
   使用者 2026-10-28 01:3x：「203 四人宿舍，認識阿凱、阿哲、柏翰 但我室友根本只有阿凱 第一天之後」。
   台詞在 src/data/dorm203_lines.js（DORM203_LINES，一字照稿）；誰幾點在房間（作息）在 src/story3d.js 的 S.r203Plan／S.dormWho（第 1 節）。
   只在法律系大一 203 四人房（DORM_FOUR，STORY.r203On）；大二以後的群組兩則照日期。
   ■ 第 1 節 走進來的一句旁白（S.walkIn，story3d.js 的 S.dormSpawn 從門口走進來時叫；起床、跳時間直接坐好的不說）：每人照順序輪流，同一天同一句不說第二次（阿凱只有一句＝一天一次）。
   ■ 第 2 節 在房間講話（S.roomTalk：talkCharacter 在閒聊階梯之前問；S.kaiTalk：talkKai 原本的房間句之前問）：每句一次，照稿的順序、學期、條件解鎖；
       一天最多一句新的，其他時候是稿「之後」那兩句輪流（阿凱：說完三句就是他原本的房間句）。房間外照各人原本的閒聊。
       「大一上」＝大一上起；「第 1～4 週」「期中前（第 1～7 週）」「期末前（第 10～15 週）」只在那一學期那幾週；「期中後」＝第 10 週起（之後的學期也算）。
       沛珊那一列：認識沛珊、而且她和柏翰在交往（STORY.partnerOn，玩家和沛珊交往＝沒有）。阿凱「上次宵夜是我下去拿的」：3-3 宵夜那晚算到他（R203_SUPPER_KAI）以後不出現，換成「上次宵夜，你說了謝謝」
       （只看宵夜那一晚，不看 KAI_COUNTED：練習賽也會記 KAI_COUNTED，AA_502 第 6 節第 9 點）。
   ■ 第 3 節 六件小事（STORY_EVENTS，trigger auto，location dorm，一次）：條件＝祐廷在房間、那個時間該在的人照作息都在（STORY.dormWho；正在走進來的等他坐下）。
       3-1 冷氣幾度：大一上第 3 週週二（9/16）22:30～23:30。之後這一學期，晚上（18:00～09:00）走進房間一週一次一句旁白；大一下第 1 週阿哲一句（字幕）。
       3-2 誰關燈：民法總則期中考前一晚（大一上第 8 週週三 10/22）23:00～23:30，開演時鐘到 23:30（稿「23:30。柏翰站在燈的開關旁邊。」）。隔天 ev_midterm_walkout 最後阿哲一句。
         （第 6 節第 5 點：柏翰那句是「我要睡了。明天考試。」——民總 13:20 考）
       3-3 宵夜：大一上第 13 週週四（11/27）23:00～23:30。KAI_COUNTED → 阿凱閒聊換句。
       3-4 帶回來的東西：大一下開學那天（2/23）晚上 22:30～23:30（柏翰 22:30 回來，四個人都在）。
       3-5 借襯衫：大一下第 13～15 週的週六 17:00～19:00（阿哲在房間）；三個週六哪一個在都可以，一次。R203_SHIRT → Alison 語 2 第三個徵兆（問祐廷那一段）開頭、或 ev_yu_together，她多一句（一次）。
         第 6 節第 4、7 點：柏翰週六在總圖（不在場，「會。」是阿哲自己答）；演完阿哲就出門（三個選項都是），19:00～22:00 照作息在西門町、22:00 回來（S.planFix）。
       3-6 最後一晚：大一下最後一天（6/14，期末考 6/8～6/11 以後）23:00～23:30，四個人都在；6/15 阿哲、柏翰搬出 203（第 6 節第 1 點）。
         暑假 203 只剩祐廷和阿凱（阿凱照原本 18:00～08:00），阿凱 9/6（主線 3）才搬去別棟。
     3-7 那一晚不在房間（作息上他們都在、祐廷沒看到）：不補演；隔天走進房間（或在房間醒來）一句旁白（字幕），只有隔天那一天。3-1＝結果照 25、3-5＝也記 R203_SHIRT、3-6 不補。
       他們自己不在（回家、出門）＝那一件沒有發生，什麼都沒有。
   ■ 第 4 節 203 群組（g:r203，名稱「203」）：9/1 21:00 阿哲建立；照表的日子送（條件是那件事發生了）；都是房間的事，不用回。
       不算手機的頻率上限（tag 用 rt_ 開頭＝例行訊息，story3d.js 每天的手機小事不讓位）；同一週（週一～週日）最多兩次。
       稿沒寫時間的：3-1 隔天 07:25（柏翰 07:20 出門）、大一下第 1 週＝開學前一天 2/22 21:00（「明天大家幾點到」接 3-4 開學那天晚上）、
       大一下第 9 週＝週一 4/20 22:00（阿哲 23:01 的照片同一晚）、搬出 203 那天 6/15 18:00、畢業典禮晚上 22:00；大一上第 5 週「某天」＝10/1（三）（STORY.R203_KEY_DAY）。
       「203（舊生）」改名：第 6 節第 1 點改到大二 9/6 晚上（阿凱搬去別棟那天；稿寫「晚上」＝21:00），不和 6/15 那兩則同一天。
   ■ 舊存檔（AA_502 第 5 節第 6 點）：G.flags.R203.from＝這個存檔第一次在 203 四人房時期跑到這裡的時間；在它以前的週不補（小事不演、不補旁白），群組在那一天建立、以前的訊息不補。
       不是四人房（沒有 DORM_FOUR）的舊存檔：什麼都沒有（照舊）。
   ■ 第 6 節第 8 點（現有事件）：ev_kai_late_screen（凌晨三點的螢幕）演的那一晚，阿凱在書桌前到 03:30（S.kaiLate／S.planFix；平常 02:00 上床）；
       ev_dorm_late_kai（23:30 以後、四人房那一行照誰在床上）改在 src/data/events.js（STORY.r203Beds）；手機「朋友」的阿凱照新作息（STORY.r203Where）。
   存檔：G.flags.R203＝{from, ev:{鍵:'played'|'missed'|'none'|'pre'}, nar:{鍵:那一晚是第幾天}, said:{鍵:第幾天}, talk:{人物:[說過的鍵]}, tday:{人物:第幾天}, after:{人物:第幾次},
     walk:{人物:{i,day,used}}, acWeek, acNew, g:{群組那一次:第幾天}, zheOut（3-5 演完阿哲出門的時間）, oldName}；旗標照稿：R203_AC（24／25／26）、R203_LIGHT（lamp／wait／off）、KAI_COUNTED、R203_SHIRT。
   測試：node tests/aa502_dorm203_unit.js */
'use strict';
const DORM203=(function(){
  const S={};
  if(typeof STORY==='undefined'||typeof DORM203_LINES==='undefined'||typeof STORY_EVENTS==='undefined') return S;
  const L=DORM203_LINES, BH='classmate_bohan', PS='classmate_peishan', IDS=['kai','zhe',BH], GID='r203', TH='g:'+GID;
  const DK=k=>STORY.dayOfKey?STORY.dayOfKey(k):null;
  const TD=(t,w,wd)=>STORY.termDayIn?STORY.termDayIn(t,w,wd):null;   /* wd：1＝週一 … 7＝週日 */
  const now=G=>G.day*24+(+G.hour||0), hh=G=>{ const x=+G.hour||0; return ((x%24)+24)%24; };
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const knows=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET');
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const busy=GM=>!!((GM.E&&GM.E.player&&GM.E.player.busy)||(GM.D&&GM.D.active)||(typeof ADV!=='undefined'&&ADV.active)||(typeof EVENTS!=='undefined'&&EVENTS.running));
  const term=d=>typeof CALENDAR!=='undefined'?CALENDAR.termOf(d):null;
  S.on=G=>law(G)&&!!(STORY.r203On&&STORY.r203On(G));
  /* 203 四人房的時期（阿哲、柏翰也住）：8/29～6/14 */
  S.moveOut=()=>{ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y1S2'):null; return r?r.to+1:DK('2026-06-15'); };
  S.era=G=>S.on(G)&&G.day<S.moveOut();
  /* 紀錄：203 四人房時期第一次跑到這裡才建（from＝那個時間；舊存檔在那以前的週不補）*/
  S.rec=function(G,make){ const F=G.flags; let R=F.R203; if(!R||typeof R!=='object'){ if(!make||!S.era(G)) return null; R=F.R203={from:now(G)}; }
    for(const k of ['ev','nar','said','talk','tday','after','walk','g']) if(!R[k]||typeof R[k]!=='object') R[k]={}; if(typeof R.from!=='number') R.from=now(G); return R; };

  /* ======================= 第 1 節：走進來的一句旁白 ======================= */
  S.walkInLine=function(G,id){ const R=S.rec(G,true), A=L.walkIn[id]; if(!R||!A||!A.length) return null; const w=R.walk[id]||(R.walk[id]={i:0,day:null,used:[]});
    if(w.day!==G.day){ w.day=G.day; w.used=[]; } const k=(w.i|0)%A.length; if(w.used.includes(k)) return null; w.used.push(k); w.i=(w.i|0)+1; return A[k]; };
  S.walkIn=function(GM,id){ const G=GM.G; if(!S.era(G)) return null; const t=S.walkInLine(G,id); if(t&&GM.caption){ GM.caption('',t,3600); S._capT=now(G); } return t; };

  /* ======================= 第 2 節：在房間講話 ======================= */
  const TERMS=['Y1S1','Y1S2'];
  S.rowOpen=function(G,id,r){ const F=G.flags, T=term(G.day), cur=T?T.id:(STORY.termAt?STORY.termAt(G.day):null), wk=T?T.week:99, ci=TERMS.indexOf(cur), ri=TERMS.indexOf(r.term);   /* 寒暑假＝前一個學期的最後（wk 99）*/
    if(ci<0||ri<0||ci<ri) return false;
    if(r.weeks&&(!T||cur!==r.term||wk<r.weeks[0]||wk>r.weeks[1])) return false;
    if(r.after&&ci===ri&&wk<r.after) return false;
    if(r.counted&&S.supperKai(G)) return false; if(r.needFlag&&!F[r.needFlag]) return false; if(r.need==='supper'&&!S.supperKai(G)) return false;
    if(r.need==='kai'&&!(knows('kai')||F.MET_KAI)) return false;
    if(r.need==='ge'&&!F.ZHE_CALLS_GE) return false;
    if(r.need==='ps'){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[PS]; if(!knows(PS)||!c||!c.partner||!STORY.partnerOn||!STORY.partnerOn(G,c.partner)) return false; }
    return true; };
  /* 3-3 宵夜那一晚有沒有算到阿凱（選「謝謝阿凱。」或「阿凱，你的肩膀濕了。」＝R203_SUPPER_KAI true；（吃）＝false）：2-3 阿凱「上次宵夜……」那一句只看這個，不看 KAI_COUNTED
     （KAI_COUNTED 有兩個來源：宵夜、AA_503 7-2 子晴練習賽；照舊兩邊都記，給之後讀——AA_502 第 6 節第 9 點，795fbecfd）。
     舊存檔（宵夜演過、還沒有這個記號）：KAI_COUNTED 是宵夜記的才算——練習賽選「他沒講。」（ZQ_PRACTICE tell）的分不出來，照沒算到 */
  S.supperKai=G=>{ const F=(G&&G.flags)||{}; if(F.R203_SUPPER_KAI!=null) return F.R203_SUPPER_KAI===true; return !!F.KAI_COUNTED&&F.ZQ_PRACTICE!=='tell'; };
  S.nextRow=function(G,id){ const R=S.rec(G,true), T=L.room[id]; if(!R||!T) return null; const said=R.talk[id]||[]; return T.rows.find(r=>!said.includes(r.k)&&S.rowOpen(G,id,r))||null; };
  const sayRow=async(GM,who,id,r)=>{ const R=S.rec(GM.G,true); (R.talk[id]||(R.talk[id]=[])).push(r.k); R.tday[id]=GM.G.day; await GM.say(who,r.t);
    if(typeof SOCIAL!=='undefined'&&SOCIAL.activity){ SOCIAL.activity(id,'chat'); SOCIAL.activity(id,'chatNew'); } };
  S.roomTalk=async function(GM,who,id){ const G=GM.G; if(G.zone!=='dorm'||!S.era(G)||(id!=='zhe'&&id!==BH)) return false; const R=S.rec(G,true); if(!R) return false;
    const r=R.tday[id]===G.day?null:S.nextRow(G,id); if(r){ await sayRow(GM,who,id,r); return true; }
    if(!(R.talk[id]||[]).length) return false;   /* 一句都還沒說過、現在也沒有能說的（8/29～8/31）：照原本的閒聊 */
    const A=L.room[id].after, a=A[(R.after[id]|0)%A.length]; R.after[id]=(R.after[id]|0)+1; await GM.say(a.speaker===null?null:who,a.text);
    if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) SOCIAL.activity(id,'chat'); return true; };
  S.kaiTalk=async function(GM,n){ const G=GM.G; if(G.zone!=='dorm'||!S.era(G)) return false; const R=S.rec(G,true); if(!R||R.tday.kai===G.day) return false;
    const r=S.nextRow(G,'kai'); if(!r) return false; await sayRow(GM,n,'kai',r); return true; };

  /* ======================= 第 3 節：四個人的小事 ======================= */
  const civMid=G=>{ try{ if(typeof CLS!=='undefined'&&CLS.examList){ const e=CLS.examList(G,'Y1S1').find(x=>x.c&&x.c.id==='civ_general'&&x.kind==='mid'); if(e) return e.day; } }catch(e){} const d=TD('Y1S1',8,4); return d; };
  S.EVS=[
    {k:'ac',id:'ev_r203_ac',title:'冷氣幾度',days:G=>[TD('Y1S1',3,2)],t:[22.5,23.5],need:IDS},
    {k:'light',id:'ev_r203_light',title:'誰關燈',days:G=>{ const d=civMid(G); return [d!=null?d-1:null]; },t:[23,23.5],need:IDS},
    {k:'supper',id:'ev_r203_supper',title:'宵夜，誰去拿',days:G=>[TD('Y1S1',13,4)],t:[23,23.5],need:IDS},
    {k:'gifts',id:'ev_r203_gifts',title:'帶回來的東西',days:G=>[TD('Y1S2',1,1)],t:[22.5,23.5],need:IDS},
    {k:'shirt',id:'ev_r203_shirt',title:'借襯衫',days:G=>[TD('Y1S2',13,6),TD('Y1S2',14,6),TD('Y1S2',15,6)],t:[17,19],need:['zhe']},
    {k:'last',id:'ev_r203_last',title:'最後一晚',days:G=>[S.moveOut()-1],t:[23,23.5],need:IDS,noMiss:true} ];
  S.ev=k=>S.EVS.find(e=>e.k===k)||null;
  /* 照作息，第 d 天 h 點，need 的人都在房間（不看玩家在哪；STORY.dormWho）*/
  S.allIn=function(G,need,d,h){ const G2=(d===G.day&&h===G.hour)?G:Object.assign({},G,{day:d,hour:h,weekday:typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:G.weekday}); let W=[]; try{ W=STORY.dormWho(G2)||[]; }catch(e){ return false; } return need.every(id=>W.some(w=>w[0]===id)); };
  S.evDue=function(G,GM,e){ if(!S.on(G)||G.zone!=='dorm') return false; const R=S.rec(G,true); if(!R||R.ev[e.k]) return false; const days=e.days(G);
    if(!days.includes(G.day)) return false; const x=hh(G); if(x<e.t[0]||x>=e.t[1]) return false; if(!S.allIn(G,e.need,G.day,G.hour)) return false;
    for(const id of e.need){ const n=GM&&GM.npc&&GM.npc[id]; if(n&&n.dormGo!=null) return false; }   /* 正在走進來（S.dormSpawn）：等他坐下 */
    return true; };
  const PART={ac:['kai','zhe',BH],light:[BH,'zhe','kai'],supper:['zhe',BH,'kai'],gifts:['zhe',BH,'kai'],shirt:['zhe'],last:['kai','zhe',BH]};   /* 3-5：柏翰週六在總圖（第 6 節第 7 點）*/
  for(const e of S.EVS){ if(STORY_EVENTS.some(x=>x.id===e.id)) continue; const lines=L.ev[e.k].slice();
    if(e.k==='light') lines[0]=Object.assign({advance:G=>Math.max(0,23.5-hh(G))},lines[0]);   /* 稿：「23:30。柏翰站在燈的開關旁邊。」——23:00～23:30 開演就到 23:30 */
    STORY_EVENTS.push({ id:e.id, title:e.title, participants:PART[e.k], location:'dorm', trigger:'auto', once:true, background:'blur', portraitLater:true, time:e.t, stage:'law',
      prereq:{custom:(G,GM)=>S.evDue(G,GM,e)}, dialogue:lines,
      after:G=>{ const R=S.rec(G,true); if(R) R.ev[e.k]='played'; if(e.k==='ac'&&R) R.acDay=G.day; if(e.k==='shirt'&&R) R.zheOut=now(G); } }); }   /* 3-5 演完阿哲出門（S.planFix）*/
  /* 3-7：那一晚過了還沒演＝照作息他們在、祐廷不在 → missed（隔天一句旁白）；他們不在 → none；那時候這個存檔還沒有紀錄（舊存檔）→ pre */
  S.resolve=function(G){ const R=S.rec(G,true); if(!R) return 0; let n=0; const t=now(G), F=G.flags;
    for(const e of S.EVS){ if(R.ev[e.k]||done(G,e.id)) continue; const days=e.days(G).filter(d=>d!=null); if(!days.length) continue; const end=Math.max(...days.map(d=>d*24+e.t[1])); if(t<end) continue;
      n++; if(end<=R.from){ R.ev[e.k]='pre'; continue; }
      const inDays=days.filter(d=>d*24+e.t[1]>R.from&&S.allIn(G,e.need,d,e.t[0]+0.01)); if(!inDays.length){ R.ev[e.k]='none'; continue; }
      R.ev[e.k]='missed'; if(!e.noMiss&&L.miss[e.k]) R.nar[e.k]=Math.max(...inDays);
      if(e.k==='ac'&&F.R203_AC==null){ F.R203_AC=25; R.acDay=Math.max(...inDays); }   /* 稿：結果照 25 */
      if(e.k==='shirt') F.R203_SHIRT=true; }   /* 稿：也記 R203_SHIRT */
    return n; };
  /* 走進房間（換區域、換一天＝在房間醒來）*/
  S._visit=null;
  const visit=G=>{ const k=G.zone+'|'+G.day; if(!S._visit||S._visit.k!==k) S._visit={k,t:now(G)}; return S._visit; };
  const capOK=G=>S._capT==null||now(G)-S._capT>=0.05||now(G)<S._capT;
  const cap=(GM,who,t)=>{ if(GM.caption) GM.caption(who,t,4200); S._capT=now(GM.G); return t; };
  /* 每一輪（STORY.TICKS）：3-7 的旁白、3-1 之後一週一次的旁白、大一下第 1 週阿哲那一句。都是字幕，不擋路，回傳 false */
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||!law(G)||!G.flags) return false; if(!G.flags.R203&&!S.era(G)) return false; S.resolve(G);
    if(G.zone!=='dorm'||!S.on(G)) return false; const R=S.rec(G,true), F=G.flags; if(!R) return false; const v=visit(G); if(busy(GM)||!capOK(G)) return false;
    for(const k in R.nar){ if(R.said[k]!=null||R.nar[k]!==G.day-1) continue; R.said[k]=G.day; cap(GM,'',L.miss[k]); return false; }   /* 只在隔天 */
    const T=term(G.day), x=hh(G);
    if(F.R203_AC!=null&&L.acWeekly[F.R203_AC]&&T&&T.id==='Y1S1'&&R.acDay!=null&&G.day>R.acDay&&R.said.ac!==G.day&&now(G)-v.t<0.25&&(x>=18||x<9)){   /* 3-7 那一句今天說過了＝這一週的從下一次開始 */ const wk=T.id+':'+T.week; if(R.acWeek!==wk){ R.acWeek=wk; cap(GM,'',L.acWeekly[F.R203_AC]); return false; } }
    if(F.R203_AC!=null&&!R.acNew&&T&&T.id==='Y1S2'&&T.week===1){ const z=GM.npc&&GM.npc.zhe; if(z&&z.dorm&&z.dormGo==null){ R.acNew=G.day; cap(GM,typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName('zhe'):'阿哲',L.acNewTerm); return false; } }
    return false; };

  /* ======================= 後果（第 5 節第 5 點）======================= */
  const evOf=id=>STORY_EVENTS.find(e=>e.id===id)||null;
  /* 3-2 → 隔天考完走出教室：ev_midterm_walkout 最後，阿哲一句（照記號）*/
  { const e=evOf('ev_midterm_walkout'); if(e&&Array.isArray(e.dialogue)&&!e._r203){ e._r203=true; for(const k of ['lamp','wait','off']) e.dialogue.push({if:{flagIs:{R203_LIGHT:k}},speaker:'zhe',text:L.walkout[k]}); } }
  /* 3-5 → Alison 那一句：語 2 第三個徵兆（她問祐廷「阿哲是不是對每個人都這麼好？」那一段，社課後或騎樓）的開頭，或 ev_yu_together（大二上 12/19）；先到的那一個，一次（認識 Alison）*/
  S.yuShirtDue=G=>!!(G&&G.flags&&G.flags.R203_SHIRT&&!G.flags.R203_SHIRT_YU&&(G.flags.met_yu||knows('yu')));
  const yuLine=()=>({if:{custom:G=>S.yuShirtDue(G)},speaker:'yu',expression:'neutral',text:L.shirtYu,set:{R203_SHIRT_YU:true}});
  for(const id of ['ev_yu_sign_question_club','ev_yu_sign_question_arcade']){ const e=evOf(id); if(e&&Array.isArray(e.dialogue)&&!e._r203){ e._r203=true; e.dialogue=[yuLine()].concat(e.dialogue); } }
  { const e=evOf('ev_yu_together'); if(e&&Array.isArray(e.dialogue)&&!e._r203){ e._r203=true; const i=e.dialogue.findIndex(l=>l&&typeof l.text==='string'&&l.text.indexOf('反正就這樣')===0); e.dialogue.splice(i<0?e.dialogue.length:i,0,yuLine()); } }   /* 「他說『沒事啦，就在一起啊』。哪有人這樣告白的。」之後 */

  /* ======================= 作息的兩個例外（第 6 節；story3d.js 的 S.r203Plan 最後問 S.planFix）======================= */
  /* 第 8 點：ev_kai_late_screen（凌晨三點的螢幕，睡著以後 03:00 演）演的那一晚，阿凱在書桌前到 03:30（只有那一晚；平常 02:00 上床）。
     睡著的那一刻才知道今晚演不演，所以還沒演過的時候看「現在去睡，睡著以後演的就是它」（EVENTS.sleepEvent，和 story3d.js 的 nightEvent 同一個判斷）：
     是＝今晚他照到 03:30（祐廷 02:00 以後還醒著，也看得到他在書桌前；凌晨 2:30 一定睡，S.forceHome）；演的時候（EVENTS.running）也算。
     演過以後＝只有演的那一晚（kaiScreenDay＝那一晚的日子，事件的 consequences 記的）*/
  const KLS='ev_kai_late_screen';
  S._kl=false;
  S.kaiLate=function(G,d){ const F=(G&&G.flags)||{}; if(done(G,KLS)) return F.kaiScreenDay===d;
    if(typeof EVENTS==='undefined'||d!==Math.floor((now(G)-6)/24)) return false;   /* 還沒演：只看今晚（18:00～隔天 06:00 算同一晚）*/
    if(EVENTS.running===KLS) return true; if(S._kl||G.zone!=='dorm') return false;
    const e=evOf(KLS), T=term(d); if(!e||!T||(e.term&&!e.term.includes(T.id))||(e.weeks&&!e.weeks.includes(T.week))) return false;
    if(e.time){ const x=hh(G), a=e.time[0], b=e.time[1]; if(b<=24?(x<a||x>=b):!(x>=a||x<b-24)) return false; }   /* 這個時間去睡不會演（同 EVENTS.check 的時間；先擋掉，不必每次問全部的睡覺事件）*/
    S._kl=true; try{ return (EVENTS.sleepEvent?EVENTS.sleepEvent():(EVENTS.check(e)?e:null))===e; }catch(err){ return false; } finally { S._kl=false; } };
  const ZHE_BACK=22;   /* 第 4 點：阿哲週六晚上照作息 19:00～22:00 在西門町（偶遇 D04），22:00 回來 */
  S.planFix=function(G,id,d,L){
    if(id==='kai'&&L.some(p=>p[1]===26&&p[3]==='bed')&&S.kaiLate(G,d)) return L.map(p=>p[1]===26&&p[3]==='bed'?[p[0],27.5,p[2],p[3]]:p);
    /* 第 4 點：3-5 借襯衫在 17:00，他借完就出門（三個選項都是：穿走襯衫、或「最後穿了球衣出門」）——那一段到演完為止、出門，22:00 回來 */
    if(id==='zhe'){ const R=G&&G.flags&&G.flags.R203, x=R&&typeof R.zheOut==='number'?R.zheOut:null;
      if(x!=null&&Math.floor(x/24)===d){ const hx=x-d*24, out=[]; for(const p of L){ if(!(p[0]<=hx&&hx<p[1])){ out.push(p); continue; }
          if(hx>p[0]) out.push([p[0],hx,p[2],'door']); if(p[1]>ZHE_BACK) out.push([Math.max(ZHE_BACK,hx),p[1],'door',p[3]]); }
        return out; } }
    return L; };

  /* ======================= 第 4 節：203 群組 ======================= */
  const P=()=>typeof PHONE!=='undefined'?PHONE:null;
  const wk=d=>{ const wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd:1; return d-(wd-1); };   /* 那一週的週一 */
  const awayAll=(G,d,ids)=>ids.some(id=>STORY.awayOnDate&&STORY.awayOnDate(id,Object.assign({},G,{day:d})));
  /* 一次（同一個日子、同一個 tag 開頭）：items 照 at 分批排進手機；同一週最多兩次 */
  const post=(G,R,k,d,items,h0,ok)=>{ const ph=P(); if(!ph||d==null||R.g[k]!=null) return false; const first=h0!=null?h0:(items[0].at!=null?items[0].at:21);
    if(now(G)<d*24+first) return false; if(d*24+first<R.from){ R.g[k]='pre'; return false; } if(ok===false){ R.g[k]='skip'; return false; }   /* ok＝那件事發生了（人在臺北…）*/
    if(!ph.inGroup(G,GID)){ R.g[k]='nogroup'; return false; }
    if(Object.values(R.g).filter(x=>typeof x==='number'&&wk(x)===wk(d)).length>=2){ R.g[k]='cap'; return false; }
    const by={}; for(const it of items){ const h=it.at!=null?it.at:first; (by[h]||(by[h]=[])).push(it.from?{th:TH,from:it.from,text:it.text}:{th:TH,text:it.text}); }
    let i=0; for(const h of Object.keys(by).map(Number).sort((a,b)=>a-b)) ph.at(G,d,h,by[h],'rt_r203_'+k+'_'+(i++));
    R.g[k]=d; return true; };
  const rename=(G,name)=>{ const ph=P(); const g=ph&&ph.rec(G).groups[GID]; if(g) g.name=name; };
  S.phone=function(G){ const ph=P(); if(!ph||!law(G)) return; const R=S.rec(G,true); if(!R) return; const t=now(G), Gr=L.group; S.resolve(G);   /* 3-1 隔天那一則看 3-1 的結果（人在外面、STORY.TICKS 還沒輪到也一樣）*/
    /* 9/1 21:00 阿哲建立；舊存檔：在這個存檔第一次跑到這裡的那一天建立（以前的訊息不補）*/
    { const d=DK('2025-09-01'); if(!ph.inGroup(G,GID)&&S.era(G)&&d!=null&&t>=d*24+21) ph.join(G,GID,Gr.name); }
    if(!ph.inGroup(G,GID)) return;
    post(G,R,'0901',DK('2025-09-01'),Gr.d0901);
    { const d=DK(STORY.R203_KEY_DAY); if(d!=null) post(G,R,'key',d,Gr.key,null,!awayAll(G,d,['zhe','kai']));
      if(R.g.key===d&&!R.keyName&&t>=d*24+Gr.keyRename.at){ R.keyName=true; rename(G,Gr.nameKey); ph.at(G,d,Gr.keyRename.at,[{th:TH,text:Gr.keyRename.text}],'rt_r203_key_name'); } }
    { const st=R.ev.ac; if((st==='played'||st==='missed')&&R.acDay!=null) post(G,R,'ac',R.acDay+1,Gr.ac,7+25/60); }   /* 3-1 冷氣之後隔天（柏翰 07:20 出門）*/
    { const d=TD('Y1S1',15,7); if(d!=null) post(G,R,'trash',d,Gr.trash,null,!awayAll(G,d,['kai'])); }
    { const d=TD('Y1S2',1,1); if(d!=null) post(G,R,'y1s2',d-1,Gr.y1s2,21,!awayAll(G,d-1,['zhe'])); }   /* 開學前一天（「明天大家幾點到」）*/
    { const d=TD('Y1S2',9,1); if(d!=null) post(G,R,'mid2',d,Gr.mid2); }
    { const d=S.moveOut(); if(d!=null) post(G,R,'out',d,Gr.out,18); }   /* 搬出 203 那天（阿哲、柏翰）*/
    { const d=DK('2026-09-06'), h=Gr.oldRename.at; if(R.outName&&R.g.old==null) R.g.old='early';   /* 第一輪（f26164cea）在 6/15 就改了名的存檔：不再改一次 */
      if(d!=null){ post(G,R,'old',d,[{text:Gr.oldRename.text}],h); if(R.g.old===d&&!R.oldName&&t>=d*24+h){ R.oldName=true; rename(G,Gr.nameOld); } } }   /* 「203（舊生）」：大二 9/6 晚上阿凱搬去別棟那天（第 6 節第 1 點）*/
    /* 大二以後：群組留著，只有兩則 */
    post(G,R,'accident',DK('2027-11-19'),Gr.accident);
    post(G,R,'grad',DK('2029-06-02'),Gr.grad,22); };

  if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>{ try{ return S.tick(GM); }catch(e){ console.warn('DORM203.tick',e); return false; } });
  if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  return S;
})();

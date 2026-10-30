/* ===== 經濟系的同學在社科院圖書館遇得到（AA_536，企劃線 1a65846c5；AA-B 定稿 D109；任務 ECON-FRIENDS-SOCLIB-1030，USER_WANTS X141）：點他們說話 =====
   使用者 2026-10-30 05:1x：「經濟系以前的同學 要能夠在社科院圖書館遇到吧」。台詞在 src/data/econfr_soclib.js（ECONFR_SOCLIB，照稿一字不差）。
   ■ 第 1 節 作息：src/data/characters.js 品妤、阿勳、唐睿、韋綸的 daily_schedule（zone soclib，seatAt 指座位；note 寫 AA_536）。家豪不出現（照現有）。
     品妤長桌（SK12 那張，座位 16）、阿勳北面窗邊、唐睿閱報區沙發（不和品妤同一張桌子）、韋綸另一張長桌。寒暑假、國定假日不在（noHoliday）。
   ■ 第 2 節 點他們說話（story3d.js talkCharacter 問 S.talk；做法照 pool3d.js 的 S.smallTalk）：
     - 還沒認識（沒有 FIRST_MET）：talkCharacter 的 first 那一段先問這裡（不走「你好，我是○○。經濟系的。」那一套）；說完照 talkCharacter 第一次說話記 SOCIAL.meet、熟悉＋3。
     - 認識以後：PRE_TALK、門檻台詞（SOCIAL.playUp）照舊先問，接在 POOL.talk 後面問這裡（同 pool 的位置）；說完照舊問「約他去…」那一層（offerInvite，現有規則不變）。
     - 這一學期還沒說過的那一句先說（照 ECONFR_SOCLIB 的順序）；一天最多一句；說完了（或今天已經說過一句）換打招呼輪流（本人那幾句＋館員那一句）。
       pool 的「今天說過了」是 STORY.greetB 的通用招呼（「期中加油。」、點頭旁白）——這裡不用：那些句子不在 AA_536，改用 AA_536 的打招呼輪流。
     - 第一次在社科圖說話（met 那一句）：前面一句旁白「（在社科圖講話要很小聲。）」；還沒有 MET_* 的再先說現有的自我介紹（品妤 MET_PINYU、阿勳 MET_XUN、
       唐睿 STORY.tangIntro、韋綸 STORY.wlIntro），說完記 MET_*。玩過經濟系前傳（PLAYED_Y0）本來就有 MET_XUN、MET_PINYU、KNOWS_TANG，tangIntro／wlIntro 也不成立＝直接說 met。
     - 品妤 SK12 那四天（2027-12-20～23）在社科圖點她：這裡不接（照事件；talkCharacter 照現有）。
     - 阿勳大三下 3/22 以後那一句「在別處遇到也可以說」：社科圖以外和他說話（認識、有 MET_XUN、今天還沒說過），這一次說這一句；其他時候照現有。
   不新增邀約、手機訊息、事件（第 3 節）。
   存檔：G.flags.ECON_SL＝{人物 id:{day:今天說過一句的那天, once:{句子:第幾天}, g:打招呼輪到第幾句}}；舊存檔沒有＝從那時起。MET_PINYU、MET_XUN、MET_TANG、MET_WEILUN 照現有的旗標。
   測試：node tests/econ_soclib_1030_unit.js */
'use strict';
const ECONSL=(function(){
  const S={}, L=typeof ECONFR_SOCLIB!=='undefined'?ECONFR_SOCLIB:{people:{}};
  S.L=L; S.IDS=Object.keys(L.people||{});
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const tid=G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; return t?t.id:null; };
  S.ZONE='soclib';
  S.XUN_DAY='2028-03-22';   /* SK13 阿勳的研究發表（同 econfr3d.js ECONFR.XUN_DAY）*/
  S.SK12_DAYS=['2027-12-20','2027-12-21','2027-12-22','2027-12-23'];   /* r3_events.js SK12 那張桌子 */
  S.sk12Day=G=>S.SK12_DAYS.some(k=>DK(k)===G.day);
  /* 閒聊的 when（data 檔開頭的說明）*/
  S.WHEN={ met:()=>true, any:()=>true, y0:G=>!!(G.flags&&G.flags.PLAYED_Y0),
    Y2:G=>/^Y2/.test(tid(G)||''), Y3:G=>/^Y3/.test(tid(G)||''),
    Y3S2pre:G=>{ const d=DK(S.XUN_DAY); return tid(G)==='Y3S2'&&(d==null||G.day<d); },
    Y3S2post:G=>{ const d=DK(S.XUN_DAY); return tid(G)==='Y3S2'&&d!=null&&G.day>d; } };
  for(const t of ['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2']) S.WHEN[t]=G=>tid(G)===t;
  /* 認識了沒（法律系時期）：還沒有的，met 那一句前面先自我介紹，說完記這個旗標 */
  S.MET={econ_pinyu:'MET_PINYU',econ_zhengxun:'MET_XUN',econ_tangrui:'MET_TANG',econ_weilun:'MET_WEILUN'};
  S.introDue=function(G,id){ const F=G.flags||{};
    if(id==='econ_tangrui') return typeof STORY!=='undefined'&&STORY.tangIntro?!!STORY.tangIntro(G):!F.MET_TANG;
    if(id==='econ_weilun') return typeof STORY!=='undefined'&&STORY.wlIntro?!!STORY.wlIntro(G):!F.MET_WEILUN;
    return !F[S.MET[id]]; };
  S.rec=function(G,id){ const F=G.flags||(G.flags={}); let R=F.ECON_SL; if(!R||typeof R!=='object'||Array.isArray(R)) R=F.ECON_SL={};
    let r=R[id]; if(!r||typeof r!=='object'||Array.isArray(r)) r=R[id]={day:null,once:{},g:0}; if(!r.once||typeof r.once!=='object'||Array.isArray(r.once)) r.once={}; return r; };
  S.saidLine=(G,id,t)=>S.rec(G,id).once[t]!=null;
  /* 下一句（照順序第一句「現在可以說、還沒說過」的；elsewhere＝社科圖以外，只看標了 elsewhere 的那幾句）*/
  S.nextLine=function(G,id,elsewhere){ const P=L.people&&L.people[id]; if(!P) return null; const r=S.rec(G,id);
    for(const e of P.talk||[]){ if(r.once[e.t]!=null) continue; if(elsewhere&&!e.elsewhere) continue; const w=S.WHEN[e.when]; if(w&&w(G)) return e; } return null; };
  S.greets=id=>{ const P=L.people&&L.people[id]; return ((P&&P.greet)||[]).concat(L.greetAll?[L.greetAll]:[]); };
  const sayAny=async(GM,who,t)=>{ if(/^（/.test(t)) await GM.say(null,t); else await GM.say(who,t); };
  const act=(id,fresh)=>{ if(typeof SOCIAL!=='undefined'&&SOCIAL.activity){ SOCIAL.activity(id,'chat'); if(fresh) SOCIAL.activity(id,'chatNew'); } };   /* 同 pool3d.js：聊天熟悉、新的一句自在 */
  /* 這一次是不是這裡接（talkCharacter 用；不說話）*/
  S.owns=function(G,id,first){ if(!law(G)||!(L.people&&L.people[id])) return false;
    if(G.zone===S.ZONE) return !(id==='econ_pinyu'&&S.sk12Day(G));
    if(first||S.introDue(G,id)) return false; const r=S.rec(G,id); return r.day!==G.day&&!!S.nextLine(G,id,true); };
  /* talkCharacter 呼叫：接了＝true（已經說完），不接＝false（照現有）*/
  S.talk=async function(GM,who,id,n,first){ const G=GM&&GM.G; if(!S.owns(G,id,first)) return false; const P=L.people[id], r=S.rec(G,id);
    if(G.zone!==S.ZONE){ const e=S.nextLine(G,id,true); await GM.say(who,e.t); r.once[e.t]=G.day; r.day=G.day; act(id,true); return true; }   /* 阿勳 3/22 以後那一句（在別處遇到）*/
    let line=false;
    if(r.day!==G.day){ const e=S.nextLine(G,id,false);
      if(e){ if(e.when==='met'){ if(L.narr) await GM.say(null,L.narr); if(S.introDue(G,id)&&P.intro){ await GM.say(who,P.intro); G.flags[S.MET[id]]=true; } }
        await GM.say(who,e.t); r.once[e.t]=G.day; r.day=G.day; line=true; } }
    if(!line){ const gL=S.greets(id); if(gL.length){ const k=(r.g|0)%gL.length; r.g=(r.g|0)+1; await sayAny(GM,who,gL[k]); } }
    if(first&&typeof SOCIAL!=='undefined'){ SOCIAL.meet(id,G.zone); SOCIAL.adjust(id,{fam:3}); }   /* 第一次說話：照 talkCharacter 的 first（記 FIRST_MET、熟悉＋3）*/
    else act(id,line);
    return true; };
  return S;
})();

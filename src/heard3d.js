/* ===== 別人說起她（AA_503～510 每位女主角那一節最後；HEROINE-LIFE-1028，使用者 2026-10-28 01:2x「可攻略女主角 感覺都沒有自己的生活」，USER_WANTS X122★）=====
   台詞在 src/data/heard_lines.js（HEARD_LINES，照稿一字不差；寫法見那個檔的開頭）。接在現有的系統上，不改那些系統的資料：
   ■ talk → STORY.PRE_TALK（talkCharacter 在閒聊前面先問：照作息出現的人；舊的固定時段 talkYu／talkKai 不經過這裡，同其他 PRE_TALK）。
   ■ kai203 → 包住 DORM203.kaiTalk（talkKai 在原本的房間句之前問；和 AA_502 的三句共用「一天最多一句新的」：DORM203.rec 的 tday.kai）。
   ■ noodle → 載入時加進 NOODLE_TABLE（once／pri 的挑法在 story3d.js S.ndlTalkPick）。
   ■ phone → STORY.PHONE_RULES：到了時間 PHONE.at（照原本的時間補；晚三天以上不補）。時間是臺灣時間；人在國外（日本、美國路線、寒暑假出國途中）照 STORY.tzOffset 換成當地時間（S.loc，第四輪加）。
   存檔：G.flags.HEARD＝{said:{句子 id:第幾天}, day:{人物:那一天說過}, ph:{訊息 id:'sent'|'x:原因'}}；舊存檔沒有＝從那時起。
   ■ 第五輪：說話的人是 pool_* 同學（AA_498 第一批，src/pool3d.js）、阿凱（2029-06-28 起週五公館）也走 talk（talkCharacter 照作息出現的人；認識以後）。
     大四下（Y4S2）後面沒有學期：'Y4S2:end'＝6/3（這一學期最後一天），要到暑假結束的寫日期（AA_510 那幾句寫 2029-09-02）。
   ■ AA_513（AA-C 2026-10-28，a2e4bf196）：阿凱說子晴那四句改成他的私訊（phone，條件 kaiZq；5/20 那一句在 src/y34b3d.js S.zqKaiPhone）；
     pass → STORY.TICKS：以安和媽媽在公館窗邊的路過字幕（S.pass；店門口的位置 S.GG_DOORS）。存檔：G.flags.AN_MOM_SEEN＝{學期:那一天}。
   測試：node tests/aa503_others_unit.js、node tests/aa508_509_feed_unit.js（第 6 段：AA_508、AA_509 的別人說起她）、node tests/aa510_511_feed_unit.js（AA_510 的別人說起她、第五輪補的曾靖雯、阿凱）、
     node tests/aa513_unit.js（阿凱的私訊、窗邊字幕） */
'use strict';
const HEARD=(function(){
  const S={};
  const L=typeof HEARD_LINES!=='undefined'?HEARD_LINES:{talk:[],kai203:[],noodle:{},phone:[],pass:[]};
  S.L=L;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const abs=(d,h)=>d*24+h, now=G=>abs(G.day,+G.hour||0);
  const knows=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET');
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const hasContact=(G,id)=>typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,id);
  const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const WD='一二三四五六日';
  const dayOfKey=k=>{ const [y,m,d]=k.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-CALENDAR.tOf(1))/864e5)+1; };
  const termR=t=>typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays(t):null;
  /* 'YYYY-MM-DD[ HH:MM]'、'Y1S1:W7三[ HH:MM]'、'Y1S1:end'（那一學期加上後面的寒暑假：下一學期開學前一天）→ {day, h} */
  const cache={};
  S.when=function(t){ if(typeof t!=='string'||typeof CALENDAR==='undefined') return null; if(t in cache) return cache[t]; let r=null, m;
    if((m=/^(\d{4}-\d\d-\d\d)(?: (\d\d):(\d\d))?$/.exec(t))) r={day:dayOfKey(m[1]),h:m[2]!=null?+m[2]+(+m[3])/60:null};
    else if((m=/^(Y\dS\d):W(\d+)([一二三四五六日])(?: (\d\d):(\d\d))?$/.exec(t))){ const R=termR(m[1]); if(R) r={day:R.from+(+m[2]-1)*7+WD.indexOf(m[3]),h:m[4]!=null?+m[4]+(+m[5])/60:null}; }
    else if((m=/^(Y\dS\d):end$/.exec(t))){ const i=TERMS.indexOf(m[1]), R=i>=0&&i+1<TERMS.length?termR(TERMS[i+1]):null, R0=termR(m[1]); if(R) r={day:R.from-1,h:null}; else if(R0) r={day:R0.to,h:null}; }
    return cache[t]=r; };
  /* 在不在可以說的那幾天（from 的時間有寫：那個時間以後；until：那一天整天）*/
  S.inWin=function(G,e){ if(e.from){ const a=S.when(e.from); if(!a) return false; if(a.h!=null?now(G)<abs(a.day,a.h):G.day<a.day) return false; }
    if(e.until){ const b=S.when(e.until); if(!b||G.day>b.day) return false; } return true; };
  S.rec=function(G){ const F=G.flags||(G.flags={}); let R=F.HEARD; if(!R||typeof R!=='object') R=F.HEARD={};
    for(const k of ['said','day','ph']) if(!R[k]||typeof R[k]!=='object') R[k]={}; return R; };
  S.COND={
    /* 沛珊和柏翰那一段在（同 FEED.COND.psBohan：characters.js 沛珊的 partner、STORY.partnerOn）*/
    psBohan:G=>{ const c=typeof CHARACTERS!=='undefined'?CHARACTERS.classmate_peishan:null; if(c&&c.partner&&typeof STORY!=='undefined'&&STORY.partnerOn) return !!STORY.partnerOn(G,c.partner); return !(G.flags&&G.flags.dating_classmate_peishan); },
    /* 柏翰：他和沛珊交往過（玩家沒有和沛珊交往）；現有的「沛珊在群組說了。」（STORY.bhSplitHeard：群組 ps_split_group 以後同一學期第一次說話）還沒說的先等它、說了的那一天不說 */
    bhAfterSplit:G=>{ const F=G.flags||{}; if(F.dating_classmate_peishan) return false; const D=(G.events&&G.events.done)||{};
      if(typeof PHONE!=='undefined'&&PHONE.sent(G,'ps_split_group')&&!D.ev_peishan_split&&!D.ev_peishan_bohan_split&&F.BH_SPLIT_TALKED==null) return false; return F.BH_SPLIT_TALKED!==G.day; },
    famGroup:G=>inGrp(G,'family_law'),
    econGroup:G=>inGrp(G,'econ_friends')&&hasContact(G,'kexin'),
    /* 予樂（只有立繪的人物，沒有 contacts 那一筆）：手機裡已經有她（kxdrift3d.js 的 yuleContact 同一個認法），或去過予樂的宵夜（見過她：ev_kexin_yule_pass）*/
    yule:G=>{ const F=G.flags||{}, D=(G.events&&G.events.done)||{}; return F.yulePassDay!=null||!!D.ev_kexin_yule_pass||(typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,'yule'))||(G.msgs||[]).some(m=>m&&m.th==='p:yule'); },
    /* 沒報 C12 京都語言課（AA_506 1-4 Alison 那句「7 月，沒報 C12 的玩家」）：VAC 的報名不是 yes／done */
    noC12:G=>{ const st=typeof VAC!=='undefined'&&VAC.state?VAC.state(G,'C12@Y2'):null; return !(st==='yes'||st==='done'); },
    /* 芯慈和以安和好以後（AA_507 1-4「第 13 週以後，和好以後」）：慈 5「對答案」演過（近、遠兩版都記 XC5_RECONCILE，r2y3a_events.js），
       或第 13 週已經過了（她們那一週在總圖三樓和好，玩家不在場也一樣）*/
    xcMade:G=>{ if(G.flags&&G.flags.XC5_RECONCILE) return true; const w=S.when('Y3S1:W14一'); return !!w&&G.day>=w.day; },
    /* 麵店團群組（AA_508、AA_509 的 Alison「麵店團群組或麵店」：照品妤「群組或偶遇」的做法放群組）*/
    noodleGroup:G=>inGrp(G,'noodle_team'),
    /* 子晴的私訊說芷若（AA_508、AA_509 2-4「私訊或公館」：放私訊）：有子晴的聯絡方式、認識芷若 */
    zqZr:G=>hasContact(G,'heroine_04')&&knows('heroine_02'),
    /* 阿凱的私訊說子晴（AA_513 第 1 節）：手機裡有阿凱（開場就有：INVITE_DATA.contacts0）、認識子晴；法律系由 S.phone 本身擋 */
    kaiZq:G=>hasContact(G,'kai')&&knows('heroine_04')
  };
  const condOk=(G,c)=>!c||!!(S.COND[c]&&S.COND[c](G));
  /* ---------- talk：閒聊前面先說一句 ---------- */
  S.talkDue=function(G,id){ if(!law(G)) return null; const R=S.rec(G); if(R.day[id]===G.day) return null;
    for(const e of L.talk||[]){ if(e.who!==id||R.said[e.id]!=null) continue; if(e.after&&R.said[e.after]==null) continue; if(e.about&&!knows(e.about)) continue;
      if(!S.inWin(G,e)||!condOk(G,e.cond)) continue; return e; }
    return null; };
  S.preTalk=async function(GM,who,id){ const G=GM&&GM.G; if(!G) return false; const e=S.talkDue(G,id); if(!e) return false; const R=S.rec(G); R.said[e.id]=G.day; R.day[id]=G.day; await GM.say(who,e.t); return true; };
  /* ---------- kai203：203 房間裡的阿凱 ---------- */
  S.kaiDue=function(G){ if(!law(G)||G.zone!=='dorm'||typeof DORM203==='undefined'||!DORM203.era||!DORM203.era(G)) return null; const R=S.rec(G), F=G.flags;
    for(const e of L.kai203||[]){ if(R.said[e.id]!=null) continue; if(e.flag&&Object.keys(e.flag).some(k=>F[k]!==e.flag[k])) continue; if(e.about&&!knows(e.about)) continue;
      if(!S.inWin(G,e)||!condOk(G,e.cond)) continue; return e; }
    return null; };
  S.kai203=async function(GM,n){ const G=GM&&GM.G; if(!G) return false; const D=typeof DORM203!=='undefined'&&DORM203.rec?DORM203.rec(G,true):null; if(!D||D.tday.kai===G.day) return false;
    const e=S.kaiDue(G); if(!e) return false; const R=S.rec(G); R.said[e.id]=G.day; D.tday.kai=G.day; if(e.set) Object.assign(G.flags,e.set);
    await GM.say(n,e.t); if(typeof SOCIAL!=='undefined'&&SOCIAL.activity){ SOCIAL.activity('kai','chat'); SOCIAL.activity('kai','chatNew'); } return true; };
  /* ---------- phone：群組、私訊 ---------- */
  S.LATE=72;   /* 晚三天以上（存檔停在很久以前、讀檔跳過）就不補 */
  /* 臺灣時間 → 遊戲時鐘（人在國外的時鐘是當地時間：日本、美國路線、寒暑假出國途中；同 FEED.loc、r2y4a3d.js 的 loc）。在臺灣＝不變 */
  S.loc=function(G,w){ const z=typeof STORY!=='undefined'&&STORY.tzOffset?(+STORY.tzOffset(G,w.day)||0):0; if(!z) return w; const t=abs(w.day,w.h)+z, d=Math.floor(t/24+1e-9); return {day:d,h:+(t-d*24).toFixed(4)}; };
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return 0; const R=S.rec(G), t=now(G); let n=0;
    for(const e of L.phone||[]){ if(R.ph[e.id]) continue; const w0=S.when(e.at); if(!w0||w0.h==null||abs(w0.day,w0.h)>t+24) continue; const w=S.loc(G,w0), t0=abs(w.day,w.h); if(t<t0) continue;   /* 一天以後的先不算時差 */
      if(t-t0>S.LATE){ R.ph[e.id]='x:late'; continue; } if(!condOk(G,e.cond)){ R.ph[e.id]='x:'+e.cond; continue; }
      PHONE.at(G,w.day,w.h,e.items.map(([from,name,text])=>({th:e.th,from,name,text})),'heard_'+e.id); R.ph[e.id]='sent'; n++; }
    return n; };
  /* ---------- pass：路過字幕（AA_513 第 2 節：以安和媽媽在公館窗邊）---------- */
  /* 公館南側店面街十五間店的門口：src/zones3d.js 公館（const FZ=19；店門互動點 z＝FZ+2＝21；店面從 x＝−68 起照 shops 的寬度 w 排、前 8 間後面各多 1.2 m，
     門口在每一間的 x0＋w/2＝zones3d.js 的 ix——麵店 −63〔y34b3d.js NOODLE_DOOR 同一點〕、茶行、書店、便利商店的互動點，輪轉單車「找車行老闆」−0.3）。
     這裡不改 zones3d.js（D108）；zones3d.js 的店面改了，這一份要跟著改：tests/aa513_unit.js 從 zones3d.js 原始碼重算一次比對 */
  S.GG_DOORS={z:21,x:[-63,-52.8,-41.6,-29.4,-19.2,-10,-0.3,9.9,19.6,28.1,37.1,46.6,55.6,64.1,73.1]};
  S.PASS_MS=6000;   /* 一句長的旁白（同 game3d.js 看告示的 4800～6000）*/
  S.later=(fn,ms)=>setTimeout(fn,ms);   /* 測試換成同步的 */
  S.nearDoors=function(key,p,r){ const D=S[key]; if(!D||!p) return false; for(const x of D.x) if(Math.hypot(p.x-x,p.z-D.z)<=r) return true; return false; };
  const seenOf=(G,e)=>{ const v=G.flags&&G.flags[e.flag]; return v&&typeof v==='object'?v:{}; };
  S.passDue=function(G,p){ if(!law(G)) return null; const h=+G.hour||0;
    for(const e of L.pass||[]){ if(G.zone!==e.zone||(e.about&&!knows(e.about))) continue; const R=seenOf(G,e);
      for(let i=0;i<e.terms.length;i++){ const term=e.terms[i], w=S.when(term+':'+e.at); if(!w||w.day!==G.day||h<e.from||h>=e.until||R[term]!=null) continue;
        if(!S.nearDoors(e.near,p,e.r)) continue;
        const n=e.terms.slice(0,i).filter(t=>R[t]!=null).length; return {e,term,t:e.t[Math.min(n,e.t.length-1)]}; } }   /* 第幾次看到用第幾句：前面的學期沒看到的，用第一句 */
    return null; };
  /* 每 0.5 秒（STORY.TICKS）：對話、劇情進行中不出；圈子的字幕（hcircle3d.js 走近時聽到）正在出就等它，出這一句的時候它也等（共用 HCIRCLE._capBusy，兩邊不互相蓋掉）*/
  S.pass=function(GM){ const G=GM&&GM.G, E=GM&&GM.E, pl=E&&E.player; if(!G||!pl||!pl.obj||pl.busy||(GM.D&&GM.D.active)||(typeof ADV!=='undefined'&&ADV.active)) return false;
    const HC=typeof HCIRCLE!=='undefined'&&HCIRCLE&&typeof HCIRCLE.tick==='function'?HCIRCLE:null; if(HC&&HC._capBusy) return false;
    const d=S.passDue(G,pl.obj.position); if(!d) return false;
    const F=G.flags||(G.flags={}); if(!F[d.e.flag]||typeof F[d.e.flag]!=='object') F[d.e.flag]={}; F[d.e.flag][d.term]=G.day;
    if(GM.caption){ GM.caption('',d.t,S.PASS_MS); if(HC){ HC._capBusy=true; S.later(()=>{ HC._capBusy=false; },S.PASS_MS); } }
    return true; };
  /* ---------- 接線 ---------- */
  if(typeof NOODLE_TABLE!=='undefined'&&L.noodle) for(const k of Object.keys(L.noodle)){ const T=NOODLE_TABLE[k]; if(!Array.isArray(T)) continue;
    for(const e of L.noodle[k]) if(!T.some(x=>x&&x.once&&x.once===e.once)) T.push(e); }
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PRE_TALK)) STORY.PRE_TALK.push((GM,who,id)=>S.preTalk(GM,who,id)); if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>{ try{ S.pass(GM); }catch(e){ console.warn('HEARD.pass',e); } return false; }); }   /* 路過字幕：回傳 false，不擋後面的 TICKS */
  if(typeof DORM203!=='undefined'&&typeof DORM203.kaiTalk==='function'&&!DORM203._heard){ const k0=DORM203.kaiTalk; DORM203.kaiTalk=async function(GM,n){ if(await S.kai203(GM,n)) return true; return k0.apply(this,arguments); }; DORM203._heard=true; }
  return S;
})();

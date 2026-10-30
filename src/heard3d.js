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
   ■ AA_520（AA-C 2026-10-28，481dd8238，予樂自己的線）：phone 的 ask（最後一則可以回：h509_yule 的三個選項，S.askOf）、COND.yuleOwn（yule＋和可昕沒有鬧翻）；
     h503_yule 後面兩句照原本的條件。予樂自己的事（十四則、演講那一晚、23:55、1/12、可昕 9/16）在 src/yule3d.js（tests/aa520_yule_unit.js）。
   測試：node tests/aa503_others_unit.js、node tests/aa508_509_feed_unit.js（第 6 段：AA_508、AA_509 的別人說起她）、node tests/aa510_511_feed_unit.js（AA_510 的別人說起她、第五輪補的曾靖雯、阿凱）、
     node tests/aa513_unit.js（阿凱的私訊、窗邊字幕） */
'use strict';
const HEARD=(function(){
  const S={};
  const L=typeof HEARD_LINES!=='undefined'?HEARD_LINES:{talk:[],kai203:[],noodle:{},phone:[],pass:[],label:[]};
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
    /* 予樂自己的事（AA_520 第 1 節）：yule＋和可昕沒有鬧翻（src/yule3d.js YULE.kxOk）；h509_yule 的選項用這個（沒有 YULE＝沒有選項，照原本兩則）*/
    yuleOwn:G=>S.COND.yule(G)&&typeof YULE!=='undefined'&&!!YULE.kxOk&&YULE.kxOk(G),
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
  /* ---------- 她本人在旁邊就不說（AA_527 2-1，企劃線 bfede0a62；heard_lines.js 全部、以後的批次照這條）----------
     說的那一刻，說起的那個人（about）和說的人（who）在同一個圈子（HCIRCLE 這一區現在成立的列，兩個人都在那一列；或 3D 裡她跟著說的人：_hcWith、配對、一起走），
     或她在玩家 4 m 內（同一層）＝不說，等下一次（不記說過）。例：12/11 子晴說芷若（兩個人同框）、筱涵說語彤（大三上週二、四 12～13）、晨希說子晴（吉他社）。
     手機（phone）不是當面說，不算；路過字幕（pass）是看到她本人，不算 */
  S.NEAR_R=4;
  let GMr=null; S.bind=gm=>{ if(gm) GMr=gm; return GMr; };
  const npcOf=(GM,id)=>{ if(!GM||!id) return null; if(typeof EVENTS!=='undefined'&&EVENTS.npcOf){ try{ const n=EVENTS.npcOf(id); if(n) return n; }catch(e){} } return (GM.npc&&GM.npc[id])||null; };
  S.herNear=function(G,about,who,GM){ if(!G||!about) return false; GM=GM||GMr;
    if(who&&typeof HCIRCLE!=='undefined'&&HCIRCLE&&typeof HCIRCLE.rowsIn==='function'){ try{ for(const r of HCIRCLE.rowsIn(G,G.zone)){ const ids=[r.who].concat(r.with||[]); if(ids.includes(about)&&ids.includes(who)) return true; } }catch(e){ console.warn('HEARD.herNear',e); } }
    const n=GM&&GM.G===G?npcOf(GM,about):null, p=n&&!n.hidden&&!n.leaving&&n.obj&&n.obj.position; if(!p) return false;
    const pl=GM.E&&GM.E.player, q=pl&&pl.obj&&pl.obj.position; if(q&&(n.lv|0)===(pl.lv|0)&&Math.hypot(p.x-q.x,p.z-q.z)<=S.NEAR_R) return true;
    const w=who&&npcOf(GM,who); if(w&&(n._hcWith===who||w._hcWith===about||n.paired===w||w.paired===n||n.buddy===w||w.buddy===n||n.chatWith===w||w.chatWith===n)) return true;
    return false; };
  /* ---------- talk：閒聊前面先說一句 ---------- */
  S.talkDue=function(G,id,GM){ if(!law(G)) return null; const R=S.rec(G); if(R.day[id]===G.day) return null;
    for(const e of L.talk||[]){ if(e.who!==id||R.said[e.id]!=null) continue; if(e.after&&R.said[e.after]==null) continue; if(e.about&&!knows(e.about)) continue;
      if(!S.inWin(G,e)||!condOk(G,e.cond)) continue; if(e.notZone&&G.zone===e.notZone) continue;   /* notZone：不在那一區說（AA_527 2-1 陳助教那幾句：他自己的時段，不在公館）*/
      if(e.about&&S.herNear(G,e.about,id,GM)) continue; return e; }
    return null; };
  S.preTalk=async function(GM,who,id){ const G=GM&&GM.G; if(!G) return false; S.bind(GM); const e=S.talkDue(G,id,GM); if(!e) return false; const R=S.rec(G); R.said[e.id]=G.day; R.day[id]=G.day; await GM.say(who,e.t); return true; };
  /* ---------- kai203：203 房間裡的阿凱 ---------- */
  S.kaiDue=function(G){ if(!law(G)||G.zone!=='dorm'||typeof DORM203==='undefined'||!DORM203.era||!DORM203.era(G)) return null; const R=S.rec(G), F=G.flags;
    for(const e of L.kai203||[]){ if(R.said[e.id]!=null) continue; if(e.flag&&Object.keys(e.flag).some(k=>F[k]!==e.flag[k])) continue; if(e.about&&!knows(e.about)) continue;
      if(!S.inWin(G,e)||!condOk(G,e.cond)) continue; if(e.about&&S.herNear(G,e.about,'kai')) continue; return e; }
    return null; };
  S.kai203=async function(GM,n){ const G=GM&&GM.G; if(!G) return false; S.bind(GM); const D=typeof DORM203!=='undefined'&&DORM203.rec?DORM203.rec(G,true):null; if(!D||D.tday.kai===G.day) return false;
    const e=S.kaiDue(G); if(!e) return false; const R=S.rec(G); R.said[e.id]=G.day; D.tday.kai=G.day; if(e.set) Object.assign(G.flags,e.set);
    await GM.say(n,e.t); if(typeof SOCIAL!=='undefined'&&SOCIAL.activity){ SOCIAL.activity('kai','chat'); SOCIAL.activity('kai','chatNew'); } return true; };
  /* ---------- phone：群組、私訊 ---------- */
  S.LATE=72;   /* 晚三天以上（存檔停在很久以前、讀檔跳過）就不補 */
  /* 臺灣時間 → 遊戲時鐘（人在國外的時鐘是當地時間：日本、美國路線、寒暑假出國途中；同 FEED.loc、r2y4a3d.js 的 loc）。在臺灣＝不變 */
  S.loc=function(G,w){ const z=typeof STORY!=='undefined'&&STORY.tzOffset?(+STORY.tzOffset(G,w.day)||0):0; if(!z) return w; const t=abs(w.day,w.h)+z, d=Math.floor(t/24+1e-9); return {day:d,h:+(t-d*24).toFixed(4)}; };
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return 0; const R=S.rec(G), t=now(G); let n=0;
    for(const e of L.phone||[]){ if(R.ph[e.id]) continue; const w0=S.when(e.at); if(!w0||w0.h==null||abs(w0.day,w0.h)>t+24) continue; const w=S.loc(G,w0), t0=abs(w.day,w.h); if(t<t0) continue;   /* 一天以後的先不算時差 */
      if(t-t0>S.LATE){ R.ph[e.id]='x:late'; continue; } if(!condOk(G,e.cond)){ R.ph[e.id]='x:'+e.cond; continue; }
      const M=e.items.map(([from,name,text])=>({th:e.th,from,name,text}));   /* items 第 4 欄（有的話）＝那一句的稿（例：'AA_520 2'），遊戲不讀 */
      if(e.ask&&M.length&&condOk(G,e.ask.cond)) M[M.length-1].ask=S.askOf(G,e.ask,M[M.length-1]);
      PHONE.at(G,w.day,w.h,M,'heard_'+e.id); R.ph[e.id]='sent'; n++; }
    return n; };
  /* ask：最後一則可以回（AA_520 第 5 節 h509_yule）。cond＝那個條件成立才有選項（不成立照原本那幾則）；until＝回覆期限（同 at 的寫法，臺灣時間；人在國外換當地，S.loc）；
     opts：[{t, r:[對方回的幾則（說的人同最後一則）], set:{旗標:值}}] */
  S.askOf=function(G,a,last){ const u=a.until?S.when(a.until):null, ul=u&&u.h!=null?S.loc(G,u):null;
    const o={id:a.id,opts:(a.opts||[]).map(x=>({t:x.t,say:(x.r||[]).map(text=>({from:last.from,name:last.name,text})),set:Object.assign({},x.set)}))}; if(ul) o.until=abs(ul.day,ul.h); return o; };
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
  S.pass=function(GM){ if(GM) S.bind(GM); const G=GM&&GM.G, E=GM&&GM.E, pl=E&&E.player; if(!G||!pl||!pl.obj||pl.busy||(GM.D&&GM.D.active)||(typeof ADV!=='undefined'&&ADV.active)) return false;
    const HC=typeof HCIRCLE!=='undefined'&&HCIRCLE&&typeof HCIRCLE.tick==='function'?HCIRCLE:null; if(HC&&HC._capBusy) return false;
    const d=S.passDue(G,pl.obj.position); if(!d) return false;
    const F=G.flags||(G.flags={}); if(!F[d.e.flag]||typeof F[d.e.flag]!=='object') F[d.e.flag]={}; F[d.e.flag][d.term]=G.day;
    if(GM.caption){ GM.caption('',d.t,S.PASS_MS); if(HC){ HC._capBusy=true; S.later(()=>{ HC._capBusy=false; },S.PASS_MS); } }
    return true; };
  /* ---------- label：標籤同伴說起她（AA_527 2-6：大一的學妹；資料見 heard_lines.js 的 label）---------- */
  S.LABEL_R=5;
  S.labelOn=function(G,e){ if(!law(G)||!e||G.zone!==e.zone) return false; const h=+G.hour||0; if(e.days&&!e.days.includes(G.weekday)) return false; if(!(h>=e.from&&h<e.to)) return false;
    const T=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; if(e.terms&&!(T&&e.terms.includes(T.id))) return false; if(e.weeks&&!(T&&e.weeks.includes(T.week))) return false; return true; };
  /* 現在要站在這一區的標籤（hcircle3d.js S.arrange 問：這幾個不放開）：說過的那一句就不再站 */
  S.labelWant=function(GM){ const G=GM&&GM.G, out=[]; if(!G) return out; const R=S.rec(G); for(const e of L.label||[]) if(R.said[e.id]==null&&S.labelOn(G,e)) for(const c of e.who) out.push(c); return out; };
  S.labelTick=function(GM){ const G=GM&&GM.G, E=GM&&GM.E, pl=E&&E.player, pp=pl&&pl.obj&&pl.obj.position; if(!G||!pp) return false; S.bind(GM); const R=S.rec(G);
    const HC=typeof HCIRCLE!=='undefined'&&HCIRCLE?HCIRCLE:null;
    for(const e of L.label||[]){ if(R.said[e.id]!=null||!S.labelOn(G,e)) continue;
      e.who.forEach((cid,k)=>{ let n=GM.npc&&GM.npc[cid]; if(n&&n.leaving){ n.leaving=false; n.arrived=false; n.beh='idle'; n.path=null; }
        if(!n&&HC&&HC.spawnLabel&&GM.spawnNPC){ const a=e.at[k%e.at.length]; HC.spawnLabel(GM,cid,{obj:{position:{x:a[0],y:0,z:a[1]}},lv:0},true,{x:a[0],z:a[1],yaw:a[2]||0}); } });
      const sp=GM.npc&&GM.npc[e.who[0]], q=sp&&!sp.hidden&&sp.obj&&sp.obj.position; if(!q||(sp.lv|0)!==(pl.lv|0)||Math.hypot(q.x-pp.x,q.z-pp.z)>S.LABEL_R) continue;
      if(pl.busy||(GM.D&&GM.D.active)||(typeof ADV!=='undefined'&&ADV.active)||(HC&&HC._capBusy)) continue;   /* 對話、劇情、圈子的字幕正在出：等一下 */
      if(e.about&&S.herNear(G,e.about,null,GM)) continue;   /* 她本人在旁邊（AA_527 2-1）*/
      R.said[e.id]=G.day; const name=(HC&&HC.PEOPLE&&HC.PEOPLE[e.who[0]]&&HC.PEOPLE[e.who[0]].label)||'';
      if(GM.caption){ GM.caption(name,e.t,S.PASS_MS); if(HC){ HC._capBusy=true; S.later(()=>{ HC._capBusy=false; },S.PASS_MS); } }
      return true; }
    return false; };
  /* ---------- 接線 ---------- */
  if(typeof NOODLE_TABLE!=='undefined'&&L.noodle) for(const k of Object.keys(L.noodle)){ const T=NOODLE_TABLE[k]; if(!Array.isArray(T)) continue;
    for(const e of L.noodle[k]) if(!T.some(x=>x&&x.once&&x.once===e.once)) T.push(e); }
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PRE_TALK)) STORY.PRE_TALK.push((GM,who,id)=>S.preTalk(GM,who,id)); if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>{ try{ S.pass(GM); }catch(e){ console.warn('HEARD.pass',e); } try{ S.labelTick(GM); }catch(e){ console.warn('HEARD.label',e); } return false; }); }   /* 路過字幕：回傳 false，不擋後面的 TICKS */
  if(typeof DORM203!=='undefined'&&typeof DORM203.kaiTalk==='function'&&!DORM203._heard){ const k0=DORM203.kaiTalk; DORM203.kaiTalk=async function(GM,n){ if(await S.kai203(GM,n)) return true; return k0.apply(this,arguments); }; DORM203._heard=true; }
  return S;
})();

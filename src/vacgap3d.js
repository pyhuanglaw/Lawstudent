/* ===== 假期空白（BB198-VACB22；寒暑假系統 D99 ①）：BB 人物的寒暑假、過年、回家回臺北 =====
   字：src/data/vacgap_lines.js（AA_928、AA_931、AA_933 定稿，一字不改）。日子、條件：BB_198 第 5、7 節＋BB_452～456；LAWWW-C 2026-11-13 的決定：
   - 可昕（和沛珊一樣走 STORY.homeAway 的人）回家、回臺北那兩則不照稿上的日子：presence 切換那天 18:00 傳（寒假、暑假都一樣；回臺北＝切回在臺北的第一天）。
   - 別人的訊息 FAMILIAR 以上（交往中也算）、有聯絡方式、那天聯絡得到（沛珊消失期、放榜後沒重新聯絡上＝不傳）。
   - 同一天 BB 人物的私訊（這個檔的）最多三則（BB_198 7-4 第 1 點）：交往中 > FRIEND > FAMILIAR，同一級照 5-2 表的順序；擠掉的不補發、記在 G.flags.VACGAP_CUT。
     5-2 表上已經處理好的（2026-02-19 明軒、方奕廷）直接寫成之後第一次遇到的招呼（mxBack.Y1S2、fyBackGreet）。群組訊息不算。
   - 阿凱電腦行那一場改在 203（BB_452 B 案；見第二批）。
   存檔：G.flags.HOMEMSG[人][假期]＝{go:day,back:day}（BB_198 7-3）、VACGAP_CAP[day]＝{keep,cut}、VACGAP_CUT（擠掉的 tag）、VACGAP_GREET（說過的招呼）；都是用到才建，舊存檔照常讀。
   測試：node tests/vacgap_msgs_unit.js、tests/vacgap_lines_unit.js */
'use strict';
const VACGAP=(function(){
  const S={}, L=typeof VACGAP_LINES!=='undefined'?VACGAP_LINES:null;
  const T=(d,h)=>d*24+h;
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const flags=G=>G.flags||(G.flags={});
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const met=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET');
  const stIx=id=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&SOCIAL.stage?SOCIAL.STAGES.indexOf(SOCIAL.stage(id)):-1;
  const STI=st=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES?SOCIAL.STAGES.indexOf(st):99;
  S.dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };   /* 同 events.js 的 DHN */
  const hasContact=(G,id)=>typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,id);
  const known=(G,id)=>id==='kexin'?(typeof STORY==='undefined'||!STORY.kxKnown||STORY.kxKnown(G)):met(id);
  /* 熟的程度：3＝交往中、2＝FRIEND 以上、1＝FAMILIAR、0＝不夠（不傳）*/
  S.level=function(G,id){ if(S.dating(G,id)) return 3; if(!known(G,id)) return 0; const i=stIx(id); if(i>=STI('FRIEND')) return 2; if(i>=STI('FAMILIAR')) return 1; return 0; };
  const presOn=(G,id,d)=>typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,Object.assign({},G,{day:d})):{here:true};
  /* 那一天聯絡得到：消失期（unreachable）、放榜後沒重新聯絡上（lost）＝不傳 */
  S.reachable=(G,id,d)=>{ const p=presOn(G,id,d); return !(p.kind==='unreachable'||p.lost); };
  const abTz=(G,d)=>typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,d)||0):0;   /* 人在國外：照當地時間收（同 holff3d.js）*/
  const brkOf=d=>typeof HOME!=='undefined'&&HOME.breakOf?HOME.breakOf(d):null;

  /* ---------- presence 切換那天（可昕、沛珊：homeAway）----------
     go：那天在老家（kind 'home'）、前一天不在；back：那天不在老家、前一天在。假期＝go 那天／back 前一天的 HOME.breakOf */
  S.isHome=(G,id,d)=>presOn(G,id,d).kind==='home';
  S.flipOn=function(G,id,d){ const a=S.isHome(G,id,d-1), b=S.isHome(G,id,d); if(b&&!a){ const B=brkOf(d)||brkOf(d+3); return B?{kind:'go',key:B.key}:null; } if(a&&!b){ const B=brkOf(d-1); return B?{kind:'back',key:B.key}:null; } return null; };

  /* ---------- 私訊的清單（回家回臺北＋過年）----------
     每一筆：{tag, who, day（數字）, h, ms, dt（交往中多的）, ord（同一級的順序）, ok(G)}。flip 的那幾筆只在切換那天算得出來 */
  const PS_ORDER=['heroine_02','classmate_peishan','kexin','kai','classmate_mingxuan','npc_fangyt'];   /* BB_198 5-2 表的順序 */
  const SHORT={heroine_02:'zr',classmate_peishan:'ps',kexin:'kx',kai:'kai',classmate_mingxuan:'mx',npc_fangyt:'fy',heroine_04:'zq'};
  S.homeTag=(who,key,kind)=>'msg_'+SHORT[who]+'_home_'+key+'_'+kind;
  /* 那一天的候選（day＝數字）*/
  S.cands=function(G,d){ const out=[]; if(!L) return out;
    PS_ORDER.forEach((who,oi)=>{ for(const r of (L.home[who]||[])){ const [key,kind,dk,h,ms,dt]=r; let day=null;
      if(dk==='flip'){ const f=S.flipOn(G,who,d); if(!f||f.kind!==kind||f.key!==key) continue; day=d; } else { day=DK(dk); if(day!==d) continue; }
      out.push({tag:S.homeTag(who,key,kind),who,day,h,ms,dt:dt||null,ord:oi,home:{key,kind}}); } });
    const LN=L.lny, add=(who,sk,y,X,extra)=>{ const day=DK(X.day); if(day!==d) return; out.push(Object.assign({tag:'msg_'+sk+'_lny_'+y,who,day,h:X.h,ms:X.ms,dt:X.dt||null,ord:10+PS_ORDER.indexOf(who)},extra||{})); };
    for(const y in LN.zq) add('heroine_04','zq',y,LN.zq[y],{alt:LN.zq[y].noDad?(G=>!(G.flags&&G.flags.DAD_PLAYS)?LN.zq[y].noDad:null):null});
    for(const y in LN.ps) add('classmate_peishan','ps',y,LN.ps[y]);
    for(const y in LN.kai) add('kai','kai',y,LN.kai[y]);
    for(const y in LN.mx) add('classmate_mingxuan','mx',y,LN.mx[y]);
    return out.filter(c=>S.eligible(G,c)); };
  S.eligible=(G,c)=>S.level(G,c.who)>0&&(hasContact(G,c.who)||S.dating(G,c.who))&&S.reachable(G,c.who,c.day);
  /* 一天最多三則：第一次輪到那一天就決定（交往中 > FRIEND > FAMILIAR，同一級照表）*/
  S.CAP=3;
  S.capFor=function(G,d){ const F=flags(G), C=F.VACGAP_CAP||(F.VACGAP_CAP={}); if(C[d]) return C[d];
    const cs=S.cands(G,d).map(c=>({c,lv:S.level(G,c.who)})).sort((a,b)=>b.lv-a.lv||a.c.ord-b.c.ord);
    const keep=cs.slice(0,S.CAP).map(x=>x.c.tag), cut=cs.slice(S.CAP).map(x=>x.c.tag);
    if(cut.length){ const X=F.VACGAP_CUT||(F.VACGAP_CUT=[]); for(const t of cut) if(!X.includes(t)) X.push(t); }
    return (C[d]={keep,cut}); };
  const rememberHome=(G,c)=>{ if(!c.home) return; const F=flags(G), H=F.HOMEMSG||(F.HOMEMSG={}), P=H[c.who]||(H[c.who]={}), R=P[c.home.key]||(P[c.home.key]={}); R[c.home.kind]=c.day; };
  S.privMsgs=function(G){ const now=T(G.day,G.hour);
    for(let d=G.day-2; d<=G.day; d++){ const cs=S.cands(G,d); if(!cs.length) continue;
      for(const c of cs){ if(PHONE.sent(G,c.tag)) continue; const h=c.h+abTz(G,d); if(now<T(d,h)) continue;
        const cap=S.capFor(G,d); if(!cap.keep.includes(c.tag)) continue;
        const ms=(c.alt&&c.alt(G))||c.ms, all=ms.concat(c.dt&&S.dating(G,c.who)?c.dt:[]), th='p:'+c.who;
        if(PHONE.at(G,d,h,all.map(t=>({th,from:c.who,text:t})),c.tag)) rememberHome(G,c); } } };

  /* ---------- 群組（不算在上限裡）：Kevin、學姊的過年（家族群組）、Kevin 日本八天 ----------*/
  const FT='g:family_law', KV=t=>({th:FT,from:'kevin',name:'Kevin',text:t}), SIS=t=>({th:FT,from:'heroine_05',name:'溫學姊',text:t});
  S.CNY1={2026:'2026-02-17',2027:'2027-02-06',2028:'2028-01-26',2029:'2029-02-13'};
  S.groupMsgs=function(G){ if(!L||!inGrp(G,'family_law')) return; const now=T(G.day,G.hour);
    for(const y in S.CNY1){ const d=DK(S.CNY1[y]); if(d==null) continue;
      { const tag='msg_kevin_lny_'+y; if(now>=T(d,10)&&G.day<=d+1&&!PHONE.sent(G,tag)) PHONE.at(G,d,10,L.lny.kevin[y].map(KV),tag); }
      { const tag='msg_sis_lny_'+y; if(now>=T(d,10+20/60)&&G.day<=d+1&&!PHONE.sent(G,tag)&&!S.dating(G,'heroine_05')) PHONE.at(G,d,10+20/60,[SIS(L.lny.sis[y])],tag); } }   /* 沒交往才回（交往中的除夕電話、初一私訊在 sis_b10） */
    L.kevinJp.forEach(([k,pic,t],i)=>{ const d=DK(k), tag='msg_kevin_jp_photo_'+(i+1); if(d==null||now<T(d,18)||G.day>d+1||PHONE.sent(G,tag)) return;
      const M=[KV(pic),KV(t)]; if(k==='2026-01-29') M.push(SIS(L.kevinJpSis)); PHONE.at(G,d,18,M,tag); }); };

  /* ---------- 招呼（STORY.PRE_TALK：認識的人說話前先說一句）----------
     明軒每學期第一次（AA_931 6-1；FAMILIAR 以上）；方奕廷大一寒假回來（2026-02-19 起第一次，大一下）*/
  const said=(G,k)=>!!(G.flags&&G.flags.VACGAP_GREET&&G.flags.VACGAP_GREET[k]!=null);
  const say=(G,k)=>{ const F=flags(G); (F.VACGAP_GREET||(F.VACGAP_GREET={}))[k]=G.day; };
  S.termId=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?((CALENDAR.termOf(G.day)||{}).id||null):null;
  S.greetFor=function(G,id){ if(!L||!law(G)||S.level(G,id)<1) return null;
    if(id==='classmate_mingxuan'){ const t=S.termId(G); if(!t||!L.mxBack[t]||said(G,'mx_'+t)) return null; return {k:'mx_'+t,t:L.mxBack[t]}; }
    if(id==='npc_fangyt'){ const d0=DK('2026-02-19'); if(d0==null||G.day<d0||S.termId(G)!=='Y1S2'||said(G,'fy_Y1W')) return null; return {k:'fy_Y1W',t:L.fyBackGreet}; }
    return null; };
  S.preTalk=async function(GM,who,id){ const G=GM&&GM.G; if(!G) return;
    if(id==='classmate_mingxuan'&&S.gymGreet){ const x=S.gymGreet(G); if(x){ if(x.lines) for(const t of x.lines) await GM.say(who,t); else await GM.say(null,x.nar); } }   /* AA_928 2-1 寒訓（第二批）*/
    const g=S.greetFor(G,id); if(!g) return; say(G,g.k); await GM.say(who,g.t); };

  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined'||!L) return; S.privMsgs(G); S.groupMsgs(G); };

  /* ================= 第二批：AA_928 當面的幾場（阿凱 203、明軒寒訓）=================
     ev_kai_winter_203（1-1）：大一寒假 2026-01-10 起，第一個祐廷在 203 的晚上 21:00～24:00；阿凱在房間（STORY.dormWho）；只有 203 四人房（DORM_FOUR，台詞寫阿哲、柏翰的床）。
     ev_kai_shop_visit（1-2，LAWWW-C 11-13 選 B：遊戲裡沒有電腦行，改成他把筆電帶回 203 修）：大一寒假、大一暑假，他打工的日子（二、四、六）19:00 以後、
       祐廷和他在 203（他還住 203：STORY.kaiRoommate）；每個假期第一次一場（ev_kai_shop_visit_Y1W／_Y1S），之後同一個假期在 203 和他說話＝一天一句招呼（輪流）。
       大一寒假 1/10 起那一晚要先演 1-1：1-1 還沒演的那幾天（1/10 以後）不演這一場。
     ev_kai_back_y1s2（1-4）：2026-02-20 22:00 起祐廷在房間＝他進門那一版；不在＝他回來以後祐廷第一次回 203（2/21 起、大一下第 1 週以內，他在房間）那一版。兩版只演一版。
     greet_mx_winter_gym（2-1）：2025-12-29～2026-01-23 週一、三、五 14:00～17:00 明軒在新體育館（STORY.SCHED_X）；第一次和他說話兩句、之後每天第一次一句旁白。*/
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const hh=G=>((G.hour%24)+24)%24;
  const kaiIn=G=>{ try{ return typeof STORY!=='undefined'&&!!STORY.dormWho&&(STORY.dormWho(G)||[]).some(w=>w[0]==='kai'); }catch(e){ return false; } };
  const r203=G=>typeof STORY!=='undefined'&&!!STORY.r203On&&STORY.r203On(G);
  const roommate=G=>typeof STORY!=='undefined'&&!!STORY.kaiRoommate&&STORY.kaiRoommate(G)&&!(G.flags&&G.flags.ROOM_Y2);
  const bkey=G=>{ const B=typeof HOME!=='undefined'&&HOME.lawBreak?HOME.lawBreak(G):null; return B?B.key:null; };
  S.W203_FROM='2026-01-10';
  S.winter203Due=G=>law(G)&&G.zone==='dorm'&&bkey(G)==='Y1W'&&G.day>=DK(S.W203_FROM)&&hh(G)>=21&&r203(G)&&kaiIn(G);
  S.REPAIR_KEYS=['Y1W','Y1S'];
  S.repairDue=(G,key)=>{ if(!law(G)||G.zone!=='dorm'||bkey(G)!==key||!roommate(G)||!kaiIn(G)) return false; const wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd%7:G.weekday; if(![2,4,6].includes(wd)||hh(G)<19) return false;
    if(key==='Y1W'){ const d0=DK(S.W203_FROM); if(G.day>=d0&&!(done(G,'ev_kai_winter_203')&&G.flags.KAI_W203_DAY!=null&&G.flags.KAI_W203_DAY<G.day)) return false; }   /* 1-1 先（同一晚不連演）*/
    return true; };
  S.BACK_DAY='2026-02-20';
  S.backInDue=G=>law(G)&&G.zone==='dorm'&&G.day===DK(S.BACK_DAY)&&hh(G)>=22&&!done(G,'ev_kai_back_y1s2_later')&&roommate(G);
  S.backLaterDue=G=>{ if(!law(G)||G.zone!=='dorm'||done(G,'ev_kai_back_y1s2')||!r203(G)||!kaiIn(G)) return false; const d=DK(S.BACK_DAY); return G.day>d&&G.day<=DK('2026-03-01'); };
  S.EVENTS=[];
  if(L){ S.EVENTS.push(
    { id:'ev_kai_winter_203', title:'寒假的 203', participants:['kai'], location:'dorm', trigger:'auto', time:[21,24], once:true, background:'blur', stage:'law',
      prereq:{custom:G=>S.winter203Due(G)}, dialogue:L.kaiWinter203, after:G=>{ flags(G).KAI_W203_DAY=G.day; } },
    ...S.REPAIR_KEYS.map(k=>({ id:'ev_kai_shop_visit_'+k, title:'帶回來修的筆電', participants:['kai'], location:'dorm', trigger:'auto', time:[19,24], once:true, background:'blur', stage:'law',
      prereq:{custom:G=>S.repairDue(G,k)}, dialogue:L.kaiRepair203, after:G=>{ const F=flags(G), R=F.KAI_REPAIR||(F.KAI_REPAIR={}); R[k]={day:G.day,i:0,last:G.day}; } })),
    { id:'ev_kai_back_y1s2', title:'宜蘭的餅', participants:['kai'], location:'dorm', trigger:'auto', time:[22,24], once:true, background:'blur', stage:'law',
      prereq:{custom:G=>S.backInDue(G)}, dialogue:L.kaiBackIn },
    { id:'ev_kai_back_y1s2_later', title:'宜蘭的餅', participants:['kai'], location:'dorm', trigger:'auto', time:[0,24], once:true, background:'blur', stage:'law',
      prereq:{custom:G=>S.backLaterDue(G)}, dialogue:L.kaiBackLater } ); }
  /* 1-2 之後的招呼：同一個假期、在 203 和阿凱說話，一天一句（輪流）。包住 STORY.kaiDormTalk（talkKai 先問它）*/
  S.kaiRepairGreet=function(G){ if(!L||!law(G)||G.zone!=='dorm') return null; const k=bkey(G), R=G.flags&&G.flags.KAI_REPAIR&&G.flags.KAI_REPAIR[k]; if(!R||R.day>=G.day||R.last===G.day) return null;
    const t=L.kaiRepairAfter[(R.i|0)%L.kaiRepairAfter.length]; R.i=(R.i|0)+1; R.last=G.day; return t; };
  /* 2-1 明軒寒訓 */
  S.GYM={from:'2025-12-29',to:'2026-01-23',days:[1,3,5],h:[14,17]};
  S.gymOn=G=>{ if(!law(G)) return false; const a=DK(S.GYM.from), b=DK(S.GYM.to); if(a==null||G.day<a||G.day>b) return false; const wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd%7:G.weekday; const x=hh(G); return S.GYM.days.includes(wd)&&x>=S.GYM.h[0]&&x<S.GYM.h[1]; };
  S.sched=function(c,G){ if(!c||c.id!=='classmate_mingxuan'||!G||!S.gymOn(G)) return null;
    return {days:S.GYM.days,from:S.GYM.h[0],to:S.GYM.h[1],zone:'gym',act:'linger',at:[-6.6,12.5,1.5708,0],noPair:true,label:'在系籃寒訓',note:'AA_928 2-1（BB198-VACB22）：大一寒假系籃寒訓'}; };
  S.gymGreet=function(G){ if(!L||!S.gymOn(G)||G.zone!=='gym') return null; const F=flags(G), R=F.MX_GYM||(F.MX_GYM={});
    if(R.first==null){ R.first=G.day; R.last=G.day; return {lines:L.mxGym}; } if(R.last===G.day) return null; R.last=G.day; return {nar:L.mxGymAgain}; };

  /* ---------- 登記 ----------*/
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.PRE_TALK)) STORY.PRE_TALK.push(S.preTalk);
    if(Array.isArray(STORY.SCHED_X)) STORY.SCHED_X.push(S.sched);
    if(typeof STORY.kaiDormTalk==='function'&&!STORY.kaiDormTalk._vacgap){ const k0=STORY.kaiDormTalk;   /* talkKai 先問 S.kaiDormTalk：1-2 之後的招呼排在前面 */
      STORY.kaiDormTalk=Object.assign(async function(GM,n){ const t=GM&&GM.G?S.kaiRepairGreet(GM.G):null; if(t){ await GM.say(n,t); return true; } return k0.apply(this,arguments); },{_vacgap:true}); } }
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  return S;
})();

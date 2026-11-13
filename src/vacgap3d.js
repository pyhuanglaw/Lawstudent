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
  S.preTalk=async function(GM,who,id){ const G=GM&&GM.G; if(!G) return; const g=S.greetFor(G,id); if(!g) return; say(G,g.k); await GM.say(who,g.t); };

  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined'||!L) return; S.privMsgs(G); S.groupMsgs(G); };

  /* ---------- 登記 ----------*/
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.PRE_TALK)) STORY.PRE_TALK.push(S.preTalk); }
  return S;
})();

/* ===== 經濟系的朋友：法律系那三年；何俊朗；日文班（AA_521，企劃線 0f4b48f20；AA-C 定稿 D109；任務 NPC-STORY2-1028、USER_WANTS X119）：接線 =====
   台詞在 src/data/econfr_lines.js（ECONFR_LINES，照稿一字不差）。
   ■ 第 1 節 校園日常 D2 照學期換句（現有的規則在 story3d.js S.b106d2Term／b106d2Due／b106d2Done、events.js ev_b106d2_*；擲骰、時間、地點、每天一句都不改）：
     - STORY.b106d2Key 包一層（這裡）：大一上照現有；大一下起每人每學期兩句（a、b，照順序），那學期說完就不站（b106d2Due 看鍵）、沒說到的不帶到下一學期；
       大一上現有的句子大一上沒說到的，大一下照舊可以說、排在新句子前面。鍵＝「人＿學期＿a/b」（wl_Y2S1_a），品妤一學期一句（py_Y3S2）；說過的照現有記 B106D2_SAID。
       條件：阿勳的新句子要 MET_XUN（第一次見面照現有：大一上那一句 xun_sched 先自我介紹）；大三下 a 只在 3/22 以前、b 只在 3/22（SK13 阿勳的研究發表）以後；
       唐睿大三下 b 要 4-2 那張畢業照（b106_42_photo）傳過以後；品妤要 MET_PINYU。
     - 句子：韋綸、唐睿、阿勳的事件（events.js）照鍵演，大一下起的那幾句載入時接在事件後面（S.patchD2；阿勳的事件 events.js 改成照鍵演，同另外兩位）；
       品妤新增 ev_b106d2_pinyu（這裡加進 STORY_EVENTS）：週五 12:05～12:25，普通教學館（她現有作息那一格：putong 下課的走廊）。
       大一下她本來就在（characters.js，有 MET_PINYU）；大二上～大三下這裡加一格作息（擲到、有話說才在，同其他人的 b106d2）。
   ■ 第 2 節「走啦」群組五則（g:econ_friends，在群組裡的才收到）、第 4 節日文班三則（g:jp_class，在日文班群組裡的才收到；4-3 只有日本路線、人在日本）：
       到了時間（臺灣時間；人在國外照當地時間，同 heard3d.js 的 HEARD.loc）就送一次；晚三天以上不補；到的時候條件不成立＝不送（記 x:原因）。
     4-3 回「好。」＝CZ_VET_PHOTO 'yes'：4/22（六）白天日本的摘要一句（JP.SCH 加一列 cz_vet_photo）；那一句演過以後，當晚 21:00（臺灣）采蓁兩則。「這週沒空。」＝'no'，她回一句；不回＝沒有後續。
   ■ 第 3 節何俊朗的招呼：src/data/us_life_events.js longGreet 加六句（from／to 日期範圍、tail＝沒有 LONG_HAIHAO 的不說的尾巴），src/us_life3d.js S.longGreet 看日期（那裡改）。
   存檔：旗標 CZ_VET_PHOTO（'yes'／'no'）；記帳 G.flags.EF_PH＝{訊息 id:'sent'|'x:原因'}；D2 照現有的 B106D2_SAID／B106D2_LAST。舊存檔沒有＝從那時起照常。
   測試：node tests/aa521_econ_friends_unit.js */
'use strict';
const ECONFR=(function(){
  const S={}, L=typeof ECONFR_LINES!=='undefined'?ECONFR_LINES:{d2:{},grp:[],jp:[]};
  S.L=L;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const abs=(d,h)=>d*24+h, now=G=>abs(G.day,+G.hour||0);
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  S.LATE=72;   /* 晚三天以上就不補（同 HEARD.LATE）*/

  /* ---------------- 第 1 節 D2 照學期換句 ---------------- */
  S.TERMS=['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'];
  S.XUN_DAY='2028-03-22';   /* SK13 阿勳的研究發表（r2y3b3d.js xunPhone）*/
  /* 那個人那一學期的鍵（照順序）*/
  S.keys=function(id,term){ const P=L.d2&&L.d2[id], T=P&&P.terms&&P.terms[term]; if(!T) return []; return Array.isArray(T)?[P.k+'_'+term]:Object.keys(T).map(x=>P.k+'_'+term+'_'+x); };
  /* 那一句的行（字串＝本人說、{n}＝旁白、{t,if}＝條件成立才有的一句）*/
  S.lines=function(id,key){ const P=L.d2&&L.d2[id]; if(!P||!key||key.indexOf(P.k+'_')!==0) return null; const m=/^[a-z]+_(Y\dS\d)(?:_([ab]))?$/.exec(key); if(!m) return null;
    const T=P.terms[m[1]]; if(!T) return null; return Array.isArray(T)?(m[2]?null:T):(m[2]?T[m[2]]||null:null); };
  /* 這一句現在可以說嗎（第 1-3～1-5 節的條件）*/
  S.keyOk=function(G,id,key){ const F=G.flags||{};
    if(id==='econ_zhengxun'){ if(!F.MET_XUN) return false; const d=DK(S.XUN_DAY); if(key==='xun_Y3S2_a') return d==null||G.day<d; if(key==='xun_Y3S2_b') return d!=null&&G.day>d; return true; }
    if(id==='econ_tangrui'&&key==='tr_Y3S2_b') return typeof PHONE!=='undefined'&&!!PHONE.sent&&PHONE.sent(G,'b106_42_photo');
    if(id==='econ_pinyu') return !!F.MET_PINYU;
    return true; };
  S.said=(G,k)=>{ const F=G.flags||{}, R=F.B106D2_SAID&&typeof F.B106D2_SAID==='object'?F.B106D2_SAID:{}; return R[k]!=null; };
  /* 照學期取鍵（k0＝原本的 STORY.b106d2Key：大一上的句子）*/
  S.d2Key=function(G,id,k0){ const P=L.d2&&L.d2[id]; if(!P) return k0(G,id);   /* 語彤等其他人照原本 */
    const T=typeof STORY!=='undefined'&&STORY.b106d2Term?STORY.b106d2Term(G):null; if(!T) return id==='econ_pinyu'?null:k0(G,id);   /* 不在 D2 的日子（b106d2Due 本來就擋）*/
    if(T.id==='Y1S1') return id==='econ_pinyu'?null:k0(G,id);   /* 大一上照現有（品妤大一下才開始）*/
    if(T.id==='Y1S2'&&id!=='econ_pinyu'){ const old=k0(G,id); if(old) return old; }   /* 大一上沒說到的排在前面 */
    for(const k of S.keys(id,T.id)) if(!S.said(G,k)&&S.keyOk(G,id,k)) return k;
    return null; };
  if(typeof STORY!=='undefined'&&typeof STORY.b106d2Key==='function'&&!STORY._econfrKey){ const k0=STORY.b106d2Key;
    STORY.b106d2Key=function(G,id){ const self=this; try{ return S.d2Key(G,id,(g,i)=>k0.call(self,g,i)); }catch(e){ console.warn('ECONFR d2Key',e); return k0.apply(this,arguments); } };
    STORY._econfrKey=true; }
  /* 事件的行：照鍵演 */
  S.evLines=function(id){ const P=L.d2&&L.d2[id], out=[]; if(!P) return out;
    for(const term of S.TERMS) for(const key of S.keys(id,term)){ const K={flagIs:{B106D2_K:key}};
      for(const x of S.lines(id,key)||[]){ if(typeof x==='string') out.push({if:K,speaker:P.sp,text:x,aa521:key});
        else if(x&&x.n) out.push({if:K,speaker:null,text:x.n,aa521:key});
        else if(x&&x.t) out.push({if:Object.assign({},K,x.if||{}),speaker:P.sp,text:x.t,aa521:key}); } }
    return out; };   /* aa521：測試對稿用（遊戲不讀）*/
  S.EV={econ_weilun:'ev_b106d2_weilun',econ_tangrui:'ev_b106d2_tang',econ_zhengxun:'ev_b106d2_xun'};
  S.patchD2=function(){ if(typeof STORY_EVENTS==='undefined') return 0; let n=0;
    for(const id in S.EV){ const e=STORY_EVENTS.find(x=>x.id===S.EV[id]); if(!e||!Array.isArray(e.dialogue)||e._aa521) continue; e.dialogue.push(...S.evLines(id)); e._aa521=true; n++; }
    return n; };
  /* 品妤的 D2：週五 12:05～12:25 普通教學館（她現有作息那一格），擲到、有話說才說；說完記鍵 */
  S.PY_EV={ id:'ev_b106d2_pinyu', title:'', participants:[], location:'putong', trigger:'auto', npcNear:'econ_pinyu', nearDist:3, term:S.TERMS.slice(), weekday:[5], time:[12+5/60,12+25/60], background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.b106d2Due&&STORY.b106d2Due(G,'econ_pinyu')},
    dialogue:[ {pick:{flag:'B106D2_K',from:G=>[STORY.b106d2Key(G,'econ_pinyu')]}} ].concat(S.evLines('econ_pinyu')),
    after:G=>{ STORY.b106d2Done(G,'econ_pinyu',G.flags.B106D2_K); delete G.flags.B106D2_K; } };
  /* 大二上～大三下她週五中午不在作息裡：加一格（擲到、有話說才在，同韋綸他們的 b106d2；大一下那一格 characters.js 本來就有）*/
  S.PY_SCHED={days:[5],from:12+5/60,to:12+25/60,zone:'putong',act:'linger',at:[-2.4,0.4,-Math.PI/2],label:'下課的走廊',terms:['Y2S1','Y2S2','Y3S1','Y3S2'],noHoliday:true,b106d2:true,
    if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.b106d2Due&&STORY.b106d2Due(G,'econ_pinyu')},note:'AA_521 1-5（0f4b48f20）：D2 品妤，週五 12:05～12:25（大一下那一格的位置）；擲到才在（src/econfr3d.js）'};
  S.addPinyu=function(){ if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(x=>x.id===S.PY_EV.id)) STORY_EVENTS.push(S.PY_EV);
    const c=typeof CHARACTERS!=='undefined'?CHARACTERS.econ_pinyu:null; if(c){ const Lst=c.daily_schedule||(c.daily_schedule=[]); if(!Lst.includes(S.PY_SCHED)) Lst.unshift(S.PY_SCHED); } };

  /* ---------------- 第 2、4 節 群組 ---------------- */
  S.rec=G=>{ const F=G.flags||(G.flags={}); let R=F.EF_PH; if(!R||typeof R!=='object') R=F.EF_PH={}; return R; };
  S.when=function(t){ const m=/^(\d{4}-\d\d-\d\d) (\d\d):(\d\d)$/.exec(String(t||'')); if(!m) return null; const d=DK(m[1]); return d==null?null:{day:d,h:+m[2]+(+m[3])/60}; };
  S.loc=(G,w)=>{ const H=typeof HEARD!=='undefined'?HEARD:null; return H&&H.loc?H.loc(G,w):w; };   /* 臺灣時間 → 遊戲時鐘（人在國外是當地時間）*/
  S.due=function(G,at){ const w0=S.when(at); if(!w0||abs(w0.day,w0.h)>now(G)+24) return null; const w=S.loc(G,w0), t0=abs(w.day,w.h); if(now(G)<t0) return null;
    if(now(G)-t0>S.LATE) return 'late'; return w; };
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  S.inJapan=G=>typeof STORY!=='undefined'&&!!STORY.route&&STORY.route(G)==='JP'&&typeof JP!=='undefined'&&!!JP.inJapan&&JP.inJapan(G);
  const M=th=>([from,name,text])=>({th,from,name,text});
  /* 一則（cond 不成立＝不送）；ask：最後一則可以回 */
  S.send=function(G,e,th,cond,ask){ const R=S.rec(G); if(R[e.id]) return false; const w=S.due(G,e.at); if(!w) return false; if(w==='late'){ R[e.id]='x:late'; return false; }
    if(!cond(G)){ R[e.id]='x:cond'; return false; } const items=e.t.map(M(th)); if(ask) items[items.length-1].ask=ask(G);
    PHONE.at(G,w.day,w.h,items,e.id); R[e.id]='sent'; return true; };
  S.grp=function(G){ for(const e of L.grp||[]) S.send(G,e,'g:econ_friends',g=>inGrp(g,'econ_friends')); };
  S.jpAsk=(G,e)=>{ const u=S.when(e.until), ul=u?S.loc(G,u):null, o={id:'cz_vet_photo',opts:(e.opts||[]).map(x=>({t:x.t,say:(x.r||[]).map(([from,name,text])=>({from,name,text})),set:Object.assign({},x.set)}))}; if(ul) o.until=abs(ul.day,ul.h); return o; };
  S.jp=function(G){ for(const e of L.jp||[]) S.send(G,e,'g:jp_class',g=>inGrp(g,'jp_class')&&(!e.jpOnly||S.inJapan(g)),e.opts?g=>S.jpAsk(g,e):null);
    const P=L.vetThanks; if(P&&G.flags.CZ_VET_PHOTO==='yes'&&S.photoDone(G)) S.send(G,P,'g:jp_class',g=>inGrp(g,'jp_class')); };
  /* 4-3 回「好。」：4/22（六）白天的摘要一句（JP.SCH，日本的時間）；演過了沒（JP 的 done 紀錄）*/
  S.photoDone=G=>{ const V=L.vetPhoto; if(!V||typeof JP==='undefined'||!JP.rec) return false; const R=JP.rec(G); return !!(R&&R.done&&R.done[V.k]!=null); };
  S.addPhotoStop=function(){ const V=L.vetPhoto; if(!V||typeof JP==='undefined'||!Array.isArray(JP.SCH)||JP.SCH.some(s=>s.k===V.k)) return;
    JP.SCH.push({k:V.k,d:V.d,h:V.h,w:'jp',if:G=>!!G&&!!G.flags&&G.flags.CZ_VET_PHOTO==='yes',sum:V.t}); };

  /* ---------------- 手機規則、掛勾 ---------------- */
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; for(const f of [S.grp,S.jp]){ try{ f(G); }catch(e){ console.warn('ECONFR phone',e); } } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._econfr){ STORY.PHONE_RULES.push(G=>S.phone(G)); STORY._econfr=true; }
  S.patchD2(); S.addPinyu(); S.addPhotoStop();
  return S;
})();

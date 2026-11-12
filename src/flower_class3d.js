/* ===== 花序 Flower Notes 二樓花藝課（FLOWER-CLASS-1112，USER_WANTS X346）=====
   使用者 11-12：「花店二樓可以上課要有劇情 做東西給女友?」「花藝課程你要寫劇情」「學姐才是這個游戲真正的女主角」
   字：AA_820（企劃線 65e38a5de，AA 定稿）——src/data/flower_class.js（FLOWER_CLASS，tools/flower/import_flower_class.py 產生）。這裡不寫句子；
     選單的字用稿的（signup.button、menu_title、課名、together.invite_button）和原本就有的（送禮系統的「送她禮物…」「算了」「包包已經放了 10 樣了」、價錢的「○○　900 元」）。
   規格（docs/handoff/user_specs/FLOWER_NOTES_1110.md 第六節、AA_820 rules）：不做小遊戲、不做材料合成；報名 → 轉暗 → 演一段 → 拿到成品。
   - 報名：二樓示範長桌旁邊的互動點（S.AT，按鈕＝signup.button）。花藝師 staff_ask → 這個月的課（三門：課名、價錢；提示＝做出來的成品）→ 付稿上的價錢 → 轉暗、演那一門課的 lines
       （同一門課第二次起只演 again 那一句）→ 時間往後稿上的時數（GM.advance）→ 成品放進送禮系統的包包（G.flags.GIFTH.bag，shop gg_flower）。
       一個禮拜（週一到週日）一次，自己上、一起上共用：上過＝花藝師 week_limit。錢不夠＝no_money（不扣）。包包滿了＝原本那一句提示（不扣）。
       營業時間照花序（FNS.open，10:00～21:00）；下課會超過打烊的那一門課灰掉，三門都排不進去＝closed 那一句。
   - 成品三樣（g_fc_*）：只能上課做——不在 GIFT_HOLIDAY.shops.gg_flower.items（買花清單沒有）；載入時加進 GIFT_HOLIDAY.items（made:true、only＝稿有反應的七位、沒有價錢）。
       可以重複做、重複送（GIFTH.givenTo 對 made 不擋）。
   - 送她：節日、生日照送禮系統原本的「送她禮物…」（包包裡的都列）；平常日子（不是她的送禮節日）包包裡有成品＝和她說話的選單也有「送她禮物…」（只列成品；S.talkOpts）。
       反應（GIFTH.MADE＝S.react）：交往中 give.<她>.dating、還沒交往 give.<她>.friend（{物}＝成品名）；不演送禮系統的 item／love-ok-no、不加一般送禮的好感（稿沒有寫）。
   - 一起上課（together）：交往中、她人在（STORY.presence）、那段時間沒有課和班（INV.busyAt）才列「約她一起上花藝課」（提示＝她的名字）；學姊另外要演過 s1（FC_SIS_S1）。
       付兩份、時數照那一門課、演 together.<她>（lines → 選項 → re → end；選項的 fx 照稿：SOCIAL.applyFx）；不演課的 lines、成品不進包包（稿：她也有一份了）。
   - story.first_class：第一次上課（自己上）、有交往中的對象＝接在那一門課 lines 第一句旁白後面演；選項記 G.flags.FC_DESC_direct／busy／none（只給學姊 s2 用）。
   - 學姊三場（story.sis，和學姊交往中）：s1＝第一次把成品送給她，取代 give.heroine_05.dating（選項 fx 照稿），記 FC_SIS_S1（開出一起上課）；
       s2＝s1 以後第一次約她一起上課，取代 together.heroine_05（if 的那幾句照 FC_DESC_*），記 FC_SIS_S2；
       s3＝s1 過五天以上、下一次當面跟她說話，閒聊前面先演（STORY.PRE_TALK；talkSis 走 SISY23.preTalk 那一串），記 FC_SIS_S3；一次。
   - story.after（其他六位）：交往中把成品送給她、過五天以上、還在交往，下一次當面說話先說那一句（STORY.PRE_TALK；可昕多半在出遊見面＝OUT.BEFORE，同 fit3d.js）；每人一次。
   存檔：沒有新的必要欄位。G.flags.FC＝{last:上一次上課那一天, n:{課:自己上過幾次}, cnt:自己上過幾次, gave:{人物:交往中第一次送的那一天}, after:{人物:說過的那一天}, s1:學姊 s1 那一天}；
     G.flags.FC_DESC_*、FC_SIS_S1／S2／S3。舊存檔沒有＝空的（讀的時候補）。
   測試：node tests/flower_class_aa820_1112_unit.js */
'use strict';
const FCLASS=(function(){
  const S={};
  const X=()=>typeof FLOWER_CLASS!=='undefined'?FLOWER_CLASS:null;
  const GH=()=>typeof GIFTH!=='undefined'?GIFTH:null;
  S.on=()=>!!X()&&!!GH()&&GH().on()&&typeof FNS!=='undefined';
  S.ZONE='flower_notes'; S.SHOP='gg_flower'; S.SIS='heroine_05'; S.DAYS=5;
  /* 報名的互動點：示範長桌（x −2.7～0.9、z −5.95～−5.05）東半邊前面；離「看示範桌」(−0.9,−4.5) 1.2 m、離最近的座位 t2a 0.9 m——站在這裡最近的就是它（測試第 2 節）*/
  S.AT={x:0.3,z:-4.65,lv:1,r:0.8};
  const rec=G=>{ const f=G.flags||(G.flags={}); let r=f.FC; if(!r||typeof r!=='object'||Array.isArray(r)) r=f.FC={};
    for(const k of ['n','gave','after']) if(!r[k]||typeof r[k]!=='object'||Array.isArray(r[k])) r[k]={}; r.cnt=r.cnt|0; return r; };
  S.rec=rec;
  const dating=(G,id)=>{ const f=(G&&G.flags)||{}, R=(f.romance||{})[id]; return f['dating_'+id]===true||!!(R&&R.status==='dating'); };
  S.dating=dating;
  S.partners=G=>{ const f=(G&&G.flags)||{}, out=new Set(Object.keys(f).filter(k=>/^dating_/.test(k)&&f[k]===true).map(k=>k.slice(7)));
    for(const id of Object.keys(f.romance||{})) if(dating(G,id)) out.add(id); return [...out]; };
  const staff=()=>({name:X().staff});
  const whoOf=(GM,w)=>w===X().staff?staff():GH().who(w,GM.npc&&(GM.npc[w]||(w===S.SIS?GM.npc.sis:null)));
  const sub=(t,thing)=>String(t).replace(/\{物\}/g,thing||'');

  /* ---------- 成品：加進送禮系統的品項（不進店的清單）---------- */
  S.ITEMS=()=>Object.keys((X()&&X().items)||{});
  S.register=function(){ if(!X()||typeof GIFT_HOLIDAY==='undefined'||!GIFT_HOLIDAY.items) return false;
    for(const gid of S.ITEMS()){ const it=X().items[gid]; if(!GIFT_HOLIDAY.items[gid]) GIFT_HOLIDAY.items[gid]={name:it.name,line:it.line,love:it.love.slice(),no:it.no.slice(),shop:it.shop,made:true,only:X().people.slice()}; }
    return true; };

  /* ---------- 演 ---------- */
  /* L 的一項：字串（narr＝整句旁白；不然「（」開頭是旁白、其他是 w 說的）或 {who,t[,if]}（if＝那個旗標有才演）。「（動作）話」拆成旁白＋說的（GIFTH.play，字不改）*/
  const play=async(GM,L,o)=>{ o=o||{}; const G=GM.G; for(const e of [].concat(L||[])){
      if(typeof e==='string'){ const s=sub(e,o.thing); if(o.narr||!o.who) await GM.say(null,s); else await GH().play(GM,o.who,[s],o.q); }
      else if(e&&e.t){ if(e.if&&!(G.flags&&G.flags[e.if])) continue; await GH().play(GM,e.who===(o.who&&o.who.charId)?o.who:whoOf(GM,e.who),[sub(e.t,o.thing)],o.q); } } };
  S.play=play;
  /* 選項：照稿的字列出來 → 那一項的 re（w 說的）→ fx（SOCIAL.applyFx：love＝她的戀愛、fr＝熟悉／信任／自在）、set（旗標）*/
  const pick=async(GM,C,o)=>{ const G=GM.G, k=await GM.choose(C.map(c=>({t:sub(c.t,o.thing)}))), c=C[k]||C[0];
    await play(GM,c.re,o);
    if(c.fx&&o.pid&&typeof SOCIAL!=='undefined'&&SOCIAL.applyFx) SOCIAL.applyFx(G,o.pid,c.fx);
    if(c.set) (G.flags||(G.flags={}))[c.set]=true;
    return c; };

  /* ---------- 時間：營業中、下課不超過打烊；一個禮拜一次 ---------- */
  S.fits=function(G,hours){ if(!FNS.open(G)) return false; const w=FNS.hours(); if(!w) return true; const h=(((+G.hour)||0)%24+24)%24; return h+hours<=w[1]+1e-6; };
  S.anyFits=G=>Object.keys(X().classes).some(k=>S.fits(G,X().classes[k].hours));
  S.weekOf=function(day){ const d=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day):null; return d?day-(((d.wd|0)+6)%7):Math.floor(day/7)*7; };   /* 那一週的週一（wd 1＝週一…7＝週日）*/
  S.weekUsed=function(G){ const r=G&&G.flags&&G.flags.FC; return !!r&&typeof r==='object'&&typeof r.last==='number'&&S.weekOf(r.last)===S.weekOf(G.day); };

  /* ---------- 一起上課：可以約誰 ---------- */
  S.canTogether=function(G,pid,hours){ if(!X().together[pid]||!X().together[pid].lines||!dating(G,pid)) return false;
    if(pid===S.SIS&&!(G.flags&&G.flags.FC_SIS_S1)) return false;   /* 學姊：s1 演過才開（稿 s1.set）*/
    if(typeof STORY!=='undefined'&&STORY.presence){ const p=STORY.presence(pid,G); if(p&&p.here===false) return false; }
    if(typeof INV!=='undefined'&&INV.busyAt){ try{ if(INV.busyAt(G,pid,G.day,(+G.hour||0)%24,hours)) return false; }catch(e){} }
    return true; };
  S.mates=(G,hours)=>X().people.filter(p=>S.canTogether(G,p,hours));

  /* ---------- 上課 ---------- */
  S.solo=async function(GM,key){ const G=GM.G, c=X().classes[key], R=rec(G), n=R.n[key]|0, first=!R.cnt;
    if(n>0) await play(GM,[c.again],{narr:true});   /* 同一門課第二次起：again 那一句帶過 */
    else { await play(GM,[c.lines[0]],{narr:true});
      if(first&&S.partners(G).length){ const F=X().story.first_class; await play(GM,F.lines,{narr:true}); await pick(GM,F.choice,{who:staff()}); }
      await play(GM,c.lines.slice(1),{narr:true}); }
    R.n[key]=n+1; R.cnt++; };
  S.together=async function(GM,pid){ const G=GM.G, who=whoOf(GM,pid);
    if(pid===S.SIS&&!G.flags.FC_SIS_S2){ const sc=X().story.sis.s2; G.flags.FC_SIS_S2=true;   /* 先記：演到一半出錯也不會重來 */
      await play(GM,sc.lines,{narr:true}); await pick(GM,sc.choice,{who,pid}); await play(GM,sc.end,{narr:true}); return 's2'; }
    const T=X().together[pid]; await play(GM,T.lines,{narr:true}); await pick(GM,T.choice,{who,pid}); await play(GM,[T.end],{narr:true}); return 'together'; };
  /* key＝哪一門課、pid＝一起上的人（沒有＝自己上）。回傳 'done'／'poor'／'full'／'week'／'closed' */
  S.take=async function(GM,key,pid){ const G=GM.G, c=X().classes[key], T=X().signup; if(!c) return null;
    if(!S.fits(G,c.hours)){ await GM.say(null,T.closed); return 'closed'; }
    if(S.weekUsed(G)){ await GM.say(staff(),T.week_limit); return 'week'; }
    const price=c.price*(pid?2:1);   /* 一起上課：祐廷付兩份（稿 together.cond）*/
    if((G.money|0)<price){ await GM.say(null,T.no_money); return 'poor'; }
    if(!pid&&GH().full(G)){ GM.toast&&GM.toast('包包已經放了 '+GH().MAX+' 樣了'); return 'full'; }   /* 成品放不進去：不收錢（送禮系統原本那一句）*/
    if(GM.money) GM.money(-price); else G.money=(G.money|0)-price;
    rec(G).last=G.day;
    await GM.fade(true);
    try{ if(pid) await S.together(GM,pid); else await S.solo(GM,key); }
    finally{ GM.advance(c.hours); await GM.fade(false); }
    if(!pid){ const B=GH().rec(G).bag; B.push({id:c.makes,day:G.day,shop:S.SHOP}); GM.toast&&GM.toast(X().items[c.makes].name+'（包包 '+GH().bag(G).length+'/'+GH().MAX+'）'); }
    if(GM.autosave) GM.autosave(); return 'done'; };

  /* ---------- 報名（示範長桌）---------- */
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['flower_class3d:busy']=()=>{ busy=false; };   /* 讀檔時放開 */
  S._reset=()=>{ busy=false; };
  S.signup=async function(GM){ const G=GM.G, T=X().signup; if(busy) return true; busy=true; GM.sceneBegin();
    try{ if(!S.anyFits(G)){ await GM.say(null,T.closed); return true; }
      if(S.weekUsed(G)){ await GM.say(staff(),T.week_limit); return true; }
      await GM.say(staff(),T.staff_ask);
      const keys=Object.keys(X().classes), opts=keys.map(k=>{ const c=X().classes[k]; return {t:c.name+'　'+c.price+' 元',hint:X().items[c.makes].name,dim:!S.fits(G,c.hours)}; }); opts.push({t:'算了'});
      const i=await GM.choose(opts,{note:T.menu_title}), key=keys[i]; if(!key) return true;
      const c=X().classes[key]; if(!S.fits(G,c.hours)){ await GM.say(null,T.closed); return true; }
      let pid=null; const M=S.mates(G,c.hours);
      if(M.length){ const o2=[{t:T.button}].concat(M.map(p=>({t:X().together.invite_button,hint:GH().who(p).name}))); o2.push({t:'算了'});
        const j=await GM.choose(o2); if(j<0||j>M.length) return true; if(j>0) pid=M[j-1]; }
      await S.take(GM,key,pid);
    } finally { busy=false; GM.sceneEnd(); } return true; };

  /* ---------- 送她：反應（GIFTH.hand 對 made 的成品呼叫；x.hand＝「你把○○遞給她。」、x.open＝節日的開場、x.q＝讀書區小聲）---------- */
  S.react=async function(GM,who,pid,gid,x){ const G=GM.G, V=X().give[pid], it=X().items[gid]; x=x||{}; if(!V||!it){ if(x.hand) await x.hand(); return null; }
    const dt=dating(G,pid), o={who,pid,thing:it.name,q:x.q}, R=rec(G);
    if(pid===S.SIS&&dt&&!G.flags.FC_SIS_S1){ const sc=X().story.sis.s1; G.flags.FC_SIS_S1=true; R.s1=G.day;   /* s1 取代 give.heroine_05.dating（第一次）；旁白自己有拿出來那一句，不另外演「你把…遞給…」*/
      if(x.open) await x.open(); await play(GM,sc.lines,Object.assign({},o,{narr:true})); await pick(GM,sc.choice,o); await play(GM,sc.end,Object.assign({},o,{narr:true})); return 's1'; }
    if(x.hand) await x.hand(); if(x.open) await x.open();
    await play(GM,V[dt?'dating':'friend'],o);
    if(dt&&pid!==S.SIS&&X().story.after[pid]&&R.after[pid]==null&&R.gave[pid]==null) R.gave[pid]=G.day;   /* story.after：交往中送的那一天起算 */
    return dt?'dating':'friend'; };

  /* ---------- 平常日子也可以送成品（節日、生日照送禮系統原本的選單，包包裡的都列）---------- */
  S.madeFor=(G,pid)=>GH().givable(G,pid).filter(b=>(GH().item(b.id)||{}).made);
  S.talkOpts=function(G,id){ if(!S.on()||!G||!X().give[id]||!X().give[id].friend||!GH().canGet(G,id)||GH().holOf(id,G.day)) return [];
    const L=S.madeFor(G,id); if(!L.length) return [];
    return [{t:GH().TALK,hint:'包包裡有 '+L.length+' 樣可以送她',run:async(GM,who)=>{ await S.giveTalk(GM,who||GH().who(id),id); }}]; };
  S.giveTalk=async function(GM,who,pid){ const G=GM.G, L=S.madeFor(G,pid); if(!L.length) return null;
    const opts=L.map(b=>({t:GH().item(b.id).name,hint:GH().shopName(b.shop)})); opts.push({t:'算了'});
    const i=await GM.choose(opts), b=L[i]; if(!b) return null; return GH().hand(GM,who,pid,b.id,null,{}); };

  /* ---------- 幾天以後 ---------- */
  S.s3Due=function(G){ const f=(G&&G.flags)||{}, r=f.FC; return !!f.FC_SIS_S1&&!f.FC_SIS_S3&&dating(G,S.SIS)&&!!r&&typeof r.s1==='number'&&G.day-r.s1>=S.DAYS; };
  S.sisS3=async function(GM,who){ const G=GM&&GM.G; if(!S.on()||!S.s3Due(G)) return false; const sc=X().story.sis.s3; G.flags.FC_SIS_S3=true; who=who||whoOf(GM,S.SIS);   /* 先記 */
    await play(GM,sc.lines,{who,narr:true}); await pick(GM,sc.choice,{who,pid:S.SIS}); return true; };
  S.afterDue=function(G,id){ const r=G&&G.flags&&G.flags.FC; if(!X()||id===S.SIS||!X().story.after[id]||!r||typeof r!=='object'||!r.gave||typeof r.gave[id]!=='number') return false;
    return !(r.after&&r.after[id]!=null)&&dating(G,id)&&G.day-r.gave[id]>=S.DAYS; };
  S.afterSay=async function(GM,who,id){ const G=GM&&GM.G; if(!S.on()||!S.afterDue(G,id)) return false; rec(G).after[id]=G.day; await play(GM,[X().story.after[id]],{who:who||whoOf(GM,id)}); return true; };
  S.preTalk=async function(GM,who,id){ if(id===S.SIS) return S.sisS3(GM,who); return S.afterSay(GM,who,id); };
  S.outingPre=async function(GM,q,ev){ if(!ev||!(ev.participants||[]).includes('kexin')||ev.kxAway) return; await S.afterSay(GM,GH().who('kexin'),'kexin'); };   /* 可昕多半在出遊見面（同 fit3d.js）*/

  /* ---------- 掛上去 ---------- */
  S.hookZone=function(){ if(typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES[S.ZONE]||Z3.ZONES[S.ZONE]._fclass||!X()) return false; const zd=Z3.ZONES[S.ZONE], b0=zd.build;
    zd.build=function(E){ const z=b0.call(this,E); E.interactables.push({x:S.AT.x,z:S.AT.z,radius:S.AT.r,lv:S.AT.lv,label:X().signup.button,fcSignup:true}); return z; };
    zd._fclass=true; return true; };
  if(X()){ S.register(); S.hookZone(); if(GH()) GH().MADE=(GM,who,pid,gid,x)=>S.react(GM,who,pid,gid,x); }
  if(X()&&typeof STORY!=='undefined'&&!STORY._fclass){ STORY._fclass=true;
    if(Array.isArray(STORY.TALK_OPTS)) STORY.TALK_OPTS.push((G,id)=>S.talkOpts(G,id));
    if(Array.isArray(STORY.PRE_TALK)) STORY.PRE_TALK.push((GM,who,id)=>S.preTalk(GM,who,id));
    if(STORY.interact){ const oi=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G; if(it&&it.fcSignup&&G&&G.zone===S.ZONE&&S.on()) return S.signup(GM); return oi.apply(this,arguments); }; } }
  if(X()&&typeof OUT!=='undefined'&&Array.isArray(OUT.BEFORE)) OUT.BEFORE.push(S.outingPre);
  if(X()&&typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._fclass){ const p0=SISY23.preTalk;   /* 學姊說話走 talkSis（SISY23.preTalk 那一串；同 fit3d.js）：前面沒有演別的才演，演完照常閒聊 */
    SISY23.preTalk=Object.assign(async function(GM){ const r=await p0.apply(this,arguments); if(!r){ try{ await S.sisS3(GM); }catch(e){ console.warn('FCLASS.sisS3',e); } } return r; },p0,{_fclass:true}); }
  return S;
})();
if(typeof window!=='undefined') window.FCLASS=FCLASS;

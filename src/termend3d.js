/* ===== 學期末的飯：告白只在學期末（BB_203，使用者 2026-10-17 確認；使用者 11:40 對 LAWWW-C「告白只在學期末」；任務 BB203-CONFESS-1017）=====
   - 時段：每學期第 16 週週四～放假後第 1 週週日（AA_250 各學期的「聚餐時段」＝CALENDAR.termDays 的最後一天 -3～+7）。大四下（畢業那天）另外做。
   - 時段第一天 00:00 以後第一次算的時候決定這學期的邀約（S.plan；中途條件變了不重算，BB_203 第 5 節）：
     ①心意的邀約：告白的條件到齊（DATE.canConfess：第 6 階、4 次正式約會含心願地點、她願意）＋她的戀愛到答應線（DATE.YES_LINE）＋這段期間不是特別不發的時候（學姊筆試、放榜前；沛珊重考期）。
     ②朋友的邀約：這學期 contact ≥ 6、熟度 FAMILIAR 以上的前兩名（BB_202 1-1；contact 照 S.contact 記）。
     ③保底（①②都沒有）：contact 最高、ACQUAINTANCE 以上的那一位；再沒有＝阿凱在宿舍當面「宵夜？」。
     交往中的女朋友另外有學期末約會（AA_250 10-3），不佔名額；可昕照 BB_202 第 6 節另外做。
   - 手機：時段第一天 20:00 不發心意邀約的手機一句（AA_254 第 9 節）、20:30 起各邀約一則；**只能接一個**——接了一個，其他的自動回「那天有約了。」（她們回婉拒那句）。
   - 飯＝出遊（OUT，事件 ev_termend_dinner 的 beforeOuting）：開場旁白（AA_250 0-1）→ 話題池 → 飯桌一句 → 收尾；
     心意的邀約接著回家的路上：說出來三句＋（先不說）→ 說出來＝答應、交往（ROM.start）；先不說＝她說 →「好。」交往／「讓我想想。」這學期不交往，下學期她用第二次的邀約再約。
   - 學期中、正式校外約會的收尾不再有告白（DATE.confessOffer 看 S.ON）。
   台詞全部在 data/termend_lines.js（AA 定稿照抄）。存檔：G.termend＝{contact:{學期:{id:{pts,k:{種類:哪一天}}}}, 學期:{plan, asks, picked, done, ...}, think:{id:哪一學期說讓我想想}}。測試：node tests/termend_unit.js */
const TERMEND=(function(){
  const S={}; S.ON=true;
  const L=()=>typeof TERMEND_LINES!=='undefined'?TERMEND_LINES:null;
  const T=(d,h)=>d*24+h;
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1'];
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  S.windowOf=function(id){ if(typeof CALENDAR==='undefined'||!CALENDAR.termDays) return null; const r=CALENDAR.termDays(id); return r?{id,from:r.to-3,to:r.to+7,termTo:r.to}:null; };
  S.window=function(G){ if(!G||(G.stage||'law')!=='law') return null; for(const id of TERMS){ const w=S.windowOf(id); if(w&&G.day>=w.from&&G.day<=w.to) return w; } return null; };
  S.rec=function(G,id){ const R=G.termend&&typeof G.termend==='object'?G.termend:(G.termend={}); if(!R.think||typeof R.think!=='object') R.think={}; if(!id) return R; return R[id]||(R[id]={}); };
  /* ---- 這學期常接觸的分數（BB_202 1-1）：同一天同一種只算一次。talk 閒聊 +1、meet 約好的見面／正式約會 +2、same 同一堂課／讀書會／社團 +1、together 劇情事件一起在場 +2 ---- */
  const PTS={talk:1,meet:2,same:1,together:2};
  const ACT2K={chat:'talk',chatNew:'talk',classmate:'same',cafe:'meet',library:'meet',meal:'meet',walk:'meet',acceptInvite:'meet',help:'together'};
  S.Y1S1_LINE={heroine_04:42,classmate_peishan:45,heroine_02:48,heroine_03:48,heroine_01:50};   /* 大一上學期末的答應線（BB_203 第 5 節 C3，bb863739；以安 50 是 AA 留 2 點餘裕）*/
  S.contact=function(G,id,kind){ if(!G||!id||!PTS[kind]||typeof CALENDAR==='undefined') return 0; const t=CALENDAR.termOf(G.day); if(!t||!(t.week>=1&&t.week<=16)) return 0;
    const R=S.rec(G), C=R.contact||(R.contact={}), M=C[t.id]||(C[t.id]={}), P=M[id]||(M[id]={pts:0,k:{}}); if(P.k[kind]===G.day) return 0; P.k[kind]=G.day; P.pts+=PTS[kind]; P.last=G.day; return PTS[kind]; };
  S.score=function(G,term,id){ const C=G.termend&&G.termend.contact; const P=C&&C[term]&&C[term][id]; return P?P.pts|0:0; };
  if(typeof SOCIAL!=='undefined') SOCIAL.onActivity=(G,id,kind)=>{ const k=ACT2K[kind]; if(k) S.contact(G,id,k); };
  const atLeast=(id,st)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES) return false; const A=SOCIAL.STAGES; return A.indexOf(SOCIAL.stage(id))>=A.indexOf(st); };
  const romStatus=(G,id)=>typeof ROM!=='undefined'&&ROM.get?ROM.get(G,id).status:'none';
  /* ---- 心意的邀約發不發（BB_203 第 5 節）：true＝發；{nope:'low'|'knows'|'preexam'}＝不發但時段第一天傳那一句（AA_254 第 9 節）；false＝不發、不傳 ---- */
  S.heartWhy=function(G,id,w){ if(typeof DATE==='undefined'||!DATE.canConfess) return false; const Lx=L(); if(!Lx||!Lx.HEART[id]) return false;
    if(G.flags&&G.flags['dating_'+id]) return false;   /* C4：交往中＝女朋友的學期末約會 */
    if(typeof ROM!=='undefined'&&ROM.canStart&&!ROM.canStart(G,id)) return false;   /* C8：分手以後還不能重新開始 */
    const y1=w&&w.id==='Y1S1';
    /* 大一上的學期末（使用者 2026-10-17 選 B，BB-C 93d4e0f4；門檻 BB-C bb863739＋12:14 更正以安 50）：第 5 階、2 次正式約會（不看心願地點）、她的戀愛到 Y1S1_LINE、祐廷的戀愛 30 以上；大一下起回到原本的條件 */
    let c;
    if(y1){ const r0=typeof SOCIAL!=='undefined'&&SOCIAL.rel?SOCIAL.rel(id):{}, st=DATE.stageNum?DATE.stageNum(id):0, ww=DATE.willing?DATE.willing(G,id):{ok:true};
      if(st<5||(DATE.log(G,id).count|0)<2||(+r0.rom||0)<30) c={ok:false,why:'stage'}; else if(!ww.ok) c={ok:false,why:ww.why};
      else c=id==='heroine_05'&&DATE.sisPreexam&&DATE.sisPreexam(G)?{ok:true,decline:'preexam'}:(id==='heroine_05'&&DATE.sisPrerank&&DATE.sisPrerank(G)?{ok:true,decline:'prerank'}:{ok:true}); }
    else c=DATE.canConfess(G,id);
    if(!c.ok) return c.why==='low'||c.why==='knows'?{nope:c.why}:false;   /* C1～C3 只是還沒到、C5 她自己有伴侶：不傳 */
    if(c.decline==='preexam'||c.decline==='prerank') return {nope:'preexam'};   /* 學姊：放榜（2026-03-23）以前不發（5-3）*/
    const D=typeof CONFESS_LINES!=='undefined'?CONFESS_LINES[id]:null; if(D&&typeof D.hideIf==='function'&&D.hideIf(G,null)) return false;   /* 沛珊重考期：聯絡不到，不傳 */
    const line=y1&&S.Y1S1_LINE[id]!=null?S.Y1S1_LINE[id]:(DATE.YES_LINE&&DATE.YES_LINE[id]), r=typeof SOCIAL!=='undefined'&&SOCIAL.rel?SOCIAL.rel(id):null; if(line!=null&&!(r&&(+r.npcRom||0)>=line)) return false;   /* C3：答應線（大一上用 Y1S1_LINE）*/
    return true; };
  S.friendOk=function(G,id,w){ if(G.flags&&G.flags['dating_'+id]) return false; const st=romStatus(G,id); if(st==='ended'||st==='friend_after_catch'||st==='paused') return false;
    if(id==='heroine_05'&&w.id==='Y1S1') return false;   /* 學姊筆試前不約（AA_250 10-2）*/
    if(id==='classmate_peishan'&&(w.id==='Y2S1'||w.id==='Y2S2')) return false;   /* 大二上說要重考以後不想見人、大二下聯絡不到（AA_250 第 3、4 節）*/
    if(id==='heroine_02'&&w.id==='Y3S1') return false;   /* 芷若在英國（AA_250 第 5 節）*/
    if(id==='heroine_01'&&w.id==='Y3S2') return false;   /* 以安在日本（AA_250 第 6 節）*/
    if(id==='heroine_05'&&w.id==='Y4S1') return false;   /* 學姊在美國（AA_250 第 7 節）*/
    const F=L().FRIEND[id]; if(!F) return false; if(w.id==='Y1S1'&&!F.y1s1) return false;
    if(typeof STORY!=='undefined'&&STORY.knows&&!STORY.knows(id,G)&&!(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(id,'FIRST_MET'))) return false; return true; };
  S.plan=function(G,w){ const R=S.rec(G,w.id); if(R.plan) return R.plan; const Lx=L(); const P={heart:[],friend:[],fallback:null,gf:[],nope:{}};
    for(const id of Object.keys(Lx.GF)) if(G.flags&&G.flags['dating_'+id]) P.gf.push(id);
    for(const id of Object.keys(Lx.HEART)){ const h=S.heartWhy(G,id,w); if(h===true) P.heart.push(id); else if(h&&h.nope) P.nope[id]=h.nope; }
    const taken=new Set(P.heart.concat(P.gf)), fam=id=>typeof SOCIAL!=='undefined'&&SOCIAL.rel?(+SOCIAL.rel(id).fam||0):0;
    const C=Object.keys(Lx.FRIEND).filter(id=>!taken.has(id)&&S.friendOk(G,id,w)).map(id=>({id,c:S.score(G,w.id,id)})).sort((a,b)=>b.c-a.c||fam(b.id)-fam(a.id));
    P.friend=C.filter(x=>x.c>=6&&atLeast(x.id,'FAMILIAR')).slice(0,2).map(x=>x.id);
    if(!P.heart.length&&!P.friend.length){ const b=C.find(x=>x.c>0&&atLeast(x.id,'ACQUAINTANCE')); if(b) P.friend=[b.id]; else P.fallback='kai'; }   /* BB_203 第 1 節第 7 點 */
    R.plan=P; return P; };
  const resolve=(x,G)=>typeof x==='function'?x(G):x;
  const lines=(x,G)=>{ x=resolve(x,G); return x==null?[]:(Array.isArray(x)?x:[x]); };
  /* ---- 手機（story3d.js 的 S.phoneRules 每次呼叫）---- */
  S.phone=function(GM){ const G=GM.G; if(!S.ON||typeof PHONE==='undefined'||!L()) return; const w=S.window(G); if(!w) { S.pickCheck(GM); return; } const now=T(G.day,G.hour);
    if(now<T(w.from,0)) return; const P=S.plan(G,w), R=S.rec(G,w.id), Lx=L(); R.asks=R.asks||{};
    const until=T(w.to,18);
    for(const id in P.nope){ const t=(Lx.NOPE[P.nope[id]]||{})[id], tag='te_nope_'+w.id+'_'+id; if(t&&now>=T(w.from,20)&&!PHONE.sent(G,tag)) PHONE.at(G,w.from,20,[{th:'p:'+id,from:id,text:t}],tag); }
    let n=0; const send=(id,kind,txt,no)=>{ const tag='te_'+w.id+'_'+id, h=20.5+(n++)*0.15; if(now<T(w.from,h)||PHONE.sent(G,tag)) return; const T2=lines(txt,G);
      const ask={id:tag,until,opts:[{t:'好。',set:{TE_PICK:w.id+'|'+id+'|'+kind}},{t:'那天有約了。',set:{TE_NO:w.id+'|'+id},say:no?[{from:id,text:no}]:[]}]};
      PHONE.at(G,w.from,h,T2.map((t,i)=>Object.assign({th:'p:'+id,from:id,text:t},i===T2.length-1?{ask}:{})),tag); R.asks[id]=tag; };
    for(const id of P.gf){ const g=Lx.GF[id], tag='te_gf_'+w.id+'_'+id; if(now>=T(w.from,20.25)&&!PHONE.sent(G,tag)) PHONE.at(G,w.from,20.25,[{th:'p:'+id,from:id,text:resolve(g.invite,G),ask:{id:tag,until,opts:[{t:'好。',set:{TE_GF:w.id+'|'+id}}]}}],tag); }
    for(const id of P.heart){ const h=Lx.HEART[id], again=R.second&&R.second[id]!=null?R.second[id]:(S.rec(G).think[id]!=null); (R.second||(R.second={}))[id]=again; send(id,'heart',again?h.invite2:h.invite,h.decline); }
    for(const id of P.friend){ const f=Lx.FRIEND[id]; send(id,'friend',w.id==='Y1S1'?f.y1s1:f.gen,f.no); }
    S.pickCheck(GM); };
  /* 接了一個：排出遊、其他的自動婉拒；女朋友的學期末約會另外排 */
  S.dinnerDay=function(G,w,spec,who){ const hh=spec.h||18.5, ok=d=>d>G.day||(d===G.day&&G.hour<hh-0.5); let lo=Math.max(w.from+1,G.day);
    if(who==='heroine_03'&&w.id==='Y1S2'){ const d=DK('2026-06-19'); if(d!=null) lo=Math.max(lo,d); }   /* 語彤 6/18 雙主修筆試以前不來（AA_250 第 2 節）*/
    if(spec.wd!=null){ for(let d=lo;d<=w.to;d++){ const wd=CALENDAR.dateOf(d).wd%7; if(wd===spec.wd&&ok(d)) return d; } }
    for(let d=Math.max(lo,w.from+2);d<=w.to;d++) if(ok(d)) return d; for(let d=lo;d<=w.to;d++) if(ok(d)) return d; return null; };
  S.planDinner=function(G,w,who,kind){ const Lx=L(), spec=kind==='heart'?Lx.HEART[who]:(kind==='gf'?Lx.GF[who]:(kind==='fallback'?Lx.FALLBACK[who]:Lx.FRIEND[who])); if(!spec||typeof OUT==='undefined') return false;
    const hh=(kind==='friend'&&spec.hGen&&w.id!=='Y1S1')?spec.hGen:(spec.h||18.5), day=S.dinnerDay(G,w,Object.assign({},spec,{h:hh}),who); if(day==null) return false; const P=Lx.PLACE[spec.place]||{}, pname=spec.placeName||P.name||'';
    return OUT.plan(G,{id:'te_'+(kind==='gf'?'gf_':'')+w.id+(kind==='gf'?'_'+who:''),ev:'ev_termend_dinner',day,h:hh,late:0.25,place:pname,title:'學期末的飯：'+nm(who)+(pname?'（'+pname+'）':''),travel:'走過去約 15 分鐘',travelH:0.25,te:{term:w.id,who,kind}}); };
  S.pickCheck=function(GM){ const G=GM.G, F=G.flags||{};
    if(typeof F.TE_GF==='string'){ const [term,who]=F.TE_GF.split('|'); delete F.TE_GF; const w=S.windowOf(term); if(w) S.planDinner(G,w,who,'gf'); }
    if(typeof F.TE_NO==='string'){ const [term,who]=F.TE_NO.split('|'); delete F.TE_NO; const R=S.rec(G,term); (R.no||(R.no={}))[who]=G.day; }
    if(typeof F.TE_PICK==='string'){ const [term,who,kind]=F.TE_PICK.split('|'); delete F.TE_PICK; const R=S.rec(G,term), w=S.windowOf(term); if(!w||R.picked) return;
      R.picked={who,kind,day:G.day}; S.planDinner(G,w,who,kind);
      for(const id in (R.asks||{})){ if(id===who) continue; const tag=R.asks[id], m=PHONE.byAsk?PHONE.byAsk(G,tag):null; if(m&&PHONE.askOpen(G,m)) PHONE.answer(G,tag,1); } } };   /* 只能接一個（BB_203 第 1 節第 3 點）*/
  /* ---- 保底：阿凱在宿舍當面「宵夜？」（時段裡、20:00 以後第一次在房間；一學期問一次）---- */
  S.kaiDue=function(G){ if(!S.ON||G.zone!=='dorm') return false; const w=S.window(G); if(!w) return false; const P=S.plan(G,w), R=S.rec(G,w.id); return P.fallback==='kai'&&!R.picked&&!R.kaiAsked&&G.day>=w.from&&G.hour>=20&&G.hour<24.5; };
  S.kaiAsk=async function(GM){ const G=GM.G, w=S.window(G); if(!w) return false; const R=S.rec(G,w.id), Lx=L(), K=Lx.FALLBACK.kai, me={name:nm('kai'),charId:'kai'}; R.kaiAsked=G.day; let k=1; GM.sceneBegin();
    try{ await GM.say(me,K.ask); k=await GM.choose([{t:'「好。」'},{t:'「那天有約了。」'}]); if(k!==0){ await GM.say(me,K.no); return false; } R.picked={who:'kai',kind:'fallback',day:G.day};
      await GM.fade(true); if(GM.titleCard) await GM.titleCard('學期末的飯：'+nm('kai')+'（公館宵夜）','走過去約 10 分鐘',2200); GM.advance(1/6); await GM.fade(false);
      await S.dinner(GM,{te:{term:w.id,who:'kai',kind:'fallback'}}); await GM.fade(true); GM.advance(1.5); if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); await GM.fade(false); if(GM.caption) GM.caption('','回到宿舍。',2200); }
    finally{ GM.sceneEnd(); } if(GM.autosave) GM.autosave(); return true; };
  /* ---- 飯（出遊事件 ev_termend_dinner 的 beforeOuting；保底阿凱直接叫）---- */
  const run=async(GM,who,arr)=>{ const G=GM.G, me={name:nm(who),charId:who}; for(let x of arr){ x=resolve(x,G); if(x==null) continue; if(Array.isArray(x)){ await run(GM,who,x); continue; }
      if(typeof x==='string') await GM.say(me,x); else if(x.narr) await GM.say(null,x.narr);
      else if(x.who==='narr') await GM.say(null,/^（/.test(x.text)?x.text:'（'+x.text+'）');   /* confess_lines.js 的寫法 */
      else if(x.who==='player') await GM.say({name:G.name||'祐廷'},x.text);
      else if(x.text) await GM.say(x.who&&x.who!==who?{name:nm(x.who),charId:x.who}:me,x.text,x.expr?{expr:x.expr}:undefined); } };
  S.dinner=async function(GM,q){ const G=GM.G, te=q&&q.te; if(!te) return false; const Lx=L(), who=te.who, kind=te.kind, R=S.rec(G,te.term);
    const spec=kind==='heart'?Lx.HEART[who]:(kind==='gf'?Lx.GF[who]:(kind==='fallback'?Lx.FALLBACK[who]:Lx.FRIEND[who])); if(!spec) return false;
    const P=Lx.PLACE[spec.place]||{}; if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:P.bg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(P.bg):'dark',right:{charId:who,expression:'neutral'}});
    const pool=((Lx.POOL[te.term]||{})[who]||[]).map(x=>resolve(x,G)).filter(x=>x!=null), me={name:G.name||'祐廷'}; let ri=0;
    const talk=async n=>{ for(let i=0;i<Math.min(n,pool.length);i++){ await run(GM,who,[pool[i]]); if(i<Math.min(n,pool.length)-1){ await GM.say(me,Lx.REPLY[(ri++)%Lx.REPLY.length]); } } };
    if(kind==='fallback'){ await run(GM,who,spec.open); await talk(2); await run(GM,who,spec.close); }
    else { await GM.say(null,P.open||'（'+(spec.placeName||P.name||'')+'。）');
      if(kind==='gf'){ await run(GM,who,lines(spec.table,G)); await talk(2); }
      else if(kind==='heart'){ await talk(2); await run(GM,who,lines(spec.table,G)); }
      else await talk(3);
      if(P.close) await GM.say(null,P.close); }
    R.done={who,kind,day:G.day};
    if(kind==='heart') await S.walkHome(GM,who,te.term);
    return true; };
  /* ---- 回家的路上（AA_254 第 0 節）---- */
  S.walkHome=async function(GM,who,term){ const G=GM.G, Lx=L(), h=Lx.HEART[who], R=S.rec(G,term), Rt=S.rec(G); if(!h) return null;
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:h.walkBg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(h.walkBg):'dark',right:{charId:who,expression:'neutral'}});
    await run(GM,who,h.walk);
    const D=typeof CONFESS_LINES!=='undefined'?CONFESS_LINES[who]:null;
    const say3=h.optsFrom==='confess'&&D&&D.choice?resolve(D.choice,G).map(q=>q.t):Lx.OPTS(h.buddy);
    const k=await GM.choose(say3.concat([Lx.NOT_YET_OPT]).map(t=>({t})));
    const start=()=>typeof ROM!=='undefined'&&ROM.start?ROM.start(G,who):((G.flags['dating_'+who]=true),true);
    if(k<3){ if(!start()) return 'blocked'; const yes=h.yes||(D&&D.yes?(typeof D.yes==='function'?D.yes(G,null,k):D.yes):[]); await run(GM,who,yes); (G.flags.confessed||(G.flags.confessed={}))[who]=G.day; delete Rt.think[who]; R.result='yes'; return 'yes'; }
    const second=Rt.think[who]!=null; await run(GM,who,second?h.she2:h.she);
    const a=await GM.choose(Lx.ANSWER.map(t=>({t})));
    if(a===0){ if(!start()) return 'blocked'; (G.flags.confessed||(G.flags.confessed={}))[who]=G.day; delete Rt.think[who]; R.result='sheSaid'; return 'sheSaid'; }
    await run(GM,who,[h.think]); Rt.think[who]=term; R.result='think'; return 'think'; };
  return S;
})();

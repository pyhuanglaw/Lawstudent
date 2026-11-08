/* ===== 決定拍打開的場景（AA_720，src/data/aa720.js；AA720-DECIDE-OPENED-1108；接 AA_719 src/decide3d.js）=====
   使用者 11-07 對 BB-B：「我想要的是我的選項會改變故事」；Q3「要分版本」（尾聲）。台詞照 AA_720 一字不改（D109，AA 定稿；tests/aa720_decide_opened_unit.js 逐句對 075eae472）。
   - 誰會演：她的決定拍（AA_719）真的演過、記了那個值（DECIDE[人][key]，不是預設值、不是過了 before 的 late）＝打開；舊存檔、沒演到＝照原本，不演。
   - 邀約（invite）：她傳訊息（PHONE.at，最後一則可以回；或接在決定拍 say 的最後一句之後，當面選 DECIDE.AFTER_SAY／傳訊息 DECIDE.MSG_ASK）
     → plan:true＝排那一場（OUT.plan；時間到跳「出發」）；「+1天」「下一週」「now」＝照稿；set＝不去（declined）；一直沒回＝不排、不扣。
   - 那一場（STORY_EVENTS 的事件，trigger:'outing'）：scene → 選項（她回 say、rel）→ end（→ opts2）；演完記 set、mem。地點字幕照稿 plan.place、背景照 import_aa720.py BG（沒有圖＝深色底）。
   - 答應了沒到（outingMissed）：missed 的訊息照稿的時間傳、記 missed 的 set；不扣關係、不重排。
   - 兩場是現有事件的加段（AA-B 交件訊息第 1 點）：ev_an_airport＝y34b3d.js ev_an_sendoff（3/24 22:30 她私訊、SENDOFF 兩處加「商法」紙條）；
     ev_zr_sendoff_airport＝zr_sendoff3d.js ev_zr_sendoff_2027（沒有 HOOK 也傳 9/1 那則、第二句換、地址那段之後加第一封信；之後第一次回房間讀信）。
   - 語彤 tell 取代 AA_624 事件 10'、事件 4（ytjob3d.js）；第 6 拍的 lines 換 beat6 三句（ARCS.resolve）。沛珊三場只有交往中（PS-2 ruleIf，decide3d.js）。學姊奶奶家：交往中＋wait。
   - 區塊：zr_letters（信寄到 Café、取代明信片；交往中第四封多一句、12/25 視訊照舊）、zr_call（週二、五 22:25）、zq_intern（暑假六則、假實習動態不傳、life／輪換句、大二上兩則動態、1/9 demo）、
     ps_result（2027-08-06 09:58 先傳兩則，psresults3d.js 照演）、kx_quiet、kx_eat（公館麵店）、kx_slot（週三／週六那一格）、kx_waited_after（等了一個小時以後兩天只回一句）。
   - ee689cfb8（AA720-WIRING-1108，AA-B wiringAnswers）：上面幾處照 AA 的回答改；AA_719 的 after 句子（DECIDE_RULES.afterQ）接到原本的訊息（S.AT_FIX）和子晴測試版那一場；
     子晴輪換句第 14、15 則 intern 版說 altIntern（src/arcs3d.js）。
   - 075eae472（AA720-WIRING-1108 第三輪，AA-B an1_later、wiringAnswers2）：以安 AN-1 later 版（含預設值）3/19 21:00 桌遊團群組 Alison、21:20 以安私訊三選項（不在群組＝只有私訊、第一句換）；
     1/9 demo 實習版三處照 ZQ-2（S.patchDemo）；沒交往 Café 當面版加「……獎學金拿到一半。」（y2r2_3d.js ev_zhiruo_admitted）；選信的 9/28 生日電話照原本打（Y2B.bdayCard，不用明信片）。
   - 尾聲（endings，第二批）：PG.epiLine 每位她原本的句子後面，照 order 取第一個符合的多一句；交往中＋CONF_FAIL[她]＝再加 confFail；都不符合＝照原本。
   存檔：G.flags.AA720＝{key:{st:'offer'|'planned'|'done'|'missed'|'declined'|'skip'|'na', inv, slot, plan, k, ...}}；舊存檔沒有＝都沒演過。
   測試：node tests/aa720_decide_opened_unit.js */
'use strict';
const AA720P=(function(){
  const S={};
  const A=()=>typeof AA720!=='undefined'?AA720:null;
  const DATA=()=>(A()&&A().data)||{}, EV=k=>(DATA().events||{})[k]||null, BLK=k=>DATA()[k]||null;
  const Q=k=>(A()&&A().cfg.quotes[k])||null, BGK=k=>(A()&&A().cfg.bg[k])||'dark';
  const F=G=>G.flags||(G.flags={});
  const dk=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>T(G.day,+G.hour||0);
  const wdOf=d=>CALENDAR.dateOf(d).wd%7;   /* 0＝週日 … 6＝週六 */
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const nameOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const met=id=>typeof SOCIAL!=='undefined'&&SOCIAL.metD?!!SOCIAL.metD(id):true;
  const contact=(G,id)=>typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,id);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const stage=id=>typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):3;
  S.dating=(G,id)=>{ const f=(G&&G.flags)||{}, RM=f.romance||{}; return f['dating_'+id]===true||!!(RM[id]&&RM[id].status==='dating'); };
  const text=(G,t)=>String(t).replace(/\{name\}/g,(G&&G.name)||'祐廷');
  S.rec=G=>{ const f=F(G); if(!f.AA720||typeof f.AA720!=='object') f.AA720={}; return f.AA720; };
  S.r=(G,k)=>{ const R=S.rec(G); return R[k]||(R[k]={}); };
  /* 她的決定：真的演過、記了（不是預設值、不是過了 before 才演到的 late）*/
  S.dec=(G,who,key)=>{ const D=G&&G.flags&&G.flags.DECIDE, r=D&&D[who]&&D[who][key]; if(r==null) return null; if(typeof r==='object'){ if(r.late||r.v==null) return null; return {v:r.v,day:r.day!=null?r.day:G.day}; } return {v:r,day:null}; };
  S.is=(G,who,key,v)=>{ const d=S.dec(G,who,key); return !!d&&[].concat(v).includes(d.v); };
  S.decDay=(G,who,key)=>{ const d=S.dec(G,who,key); return d?d.day:null; };
  /* 條件字串（尾聲 endIf）：dec:人.key=值（嚴格：真的決定過）、flag:X（有值）、flagIs:X=v、psSilDM（沉默期傳過私訊，AA_723）*/
  S.condOne=function(G,c){ let m=/^dec:([a-z0-9_]+)\.([a-z_]+)=([a-z_]+)$/.exec(c); if(m) return S.is(G,m[1],m[2],m[3]);
    m=/^flag:([A-Za-z0-9_]+)$/.exec(c); if(m){ const v=F(G)[m[1]]; return v!=null&&v!==false; }
    m=/^flagIs:([A-Za-z0-9_]+)=(.+)$/.exec(c); if(m) return String(F(G)[m[1]])===m[2];
    if(c==='psSilDM') return S.psSilDM(G);
    return false; };
  S.cond=(G,ors)=>Array.isArray(ors)&&ors.some(and=>and.every(c=>S.condOne(G,c)));
  /* 沛珊沉默期（2026-12-18～2028-12-28，AA_723）祐廷傳過私訊 */
  S.psSilDM=function(G){ const a=dk('2026-12-18'), b=dk('2028-12-29'); return a!=null&&b!=null&&(G.msgs||[]).some(m=>m&&m.th==='p:classmate_peishan'&&m.from==='player'&&m.day>=a&&m.day<b); };

  /* ---------- 演台詞 ---------- */
  const WHOS={yu:'yu',zhe:'zhe'};
  S.spk=function(G,sp,her){ if(sp==null) return null; const id=WHOS[sp]||(typeof CHARACTERS!=='undefined'&&CHARACTERS[sp]?sp:null); return id?{name:nameOf(id),charId:id}:{name:sp}; };
  S.herObj=id=>({name:nameOf(id),charId:id});
  S.play=async function(GM,her,L){ const G=GM.G; for(const t of L||[]){ if(Array.isArray(t)){ const s=text(G,t[1]); await GM.say(S.spk(G,t[0],her),s); continue; } const s=text(G,t); if(/^（/.test(s)) await GM.say(null,s); else await GM.say(S.herObj(her),s); } };
  S.rel=function(her,rel){ if(!rel||!Object.keys(rel).length||typeof SOCIAL==='undefined'||!SOCIAL.adjust) return; const d=Object.assign({},rel); if(stage(her)<3) delete d.npcRom; SOCIAL.adjust(her,d); };   /* 她的戀愛只在朋友以上才算（和 ARCS 的選項一樣）*/
  S.setF=(G,set,seen)=>{ if(!set) return; for(const k in set){ F(G)[k]=set[k]; if(seen) seen.add(k); } };
  S.mem=(her,mem)=>{ if(!mem||typeof SOCIAL==='undefined'||!SOCIAL.remember) return; for(const k in mem) if(!(SOCIAL.has&&SOCIAL.has(her,k))) SOCIAL.remember(her,k,mem[k]); };
  /* 選項：她回 say（alt.if 成立＝alt.say）、rel、set；回傳 {k,o} */
  S.choose=async function(GM,her,opts,seen){ const G=GM.G; const k=await GM.choose(opts.map(o=>({t:text(G,o.t)}))); const o=opts[k]||opts[0];
    const say=o.alt&&o.alt.if&&S.condOne(G,o.alt.if)?o.alt.say:o.say; S.rel(her,o.rel); S.setF(G,o.set,seen); await S.play(GM,her,say); return {k,o}; };

  /* ---------- 手機 ---------- */
  const PIC=/^（(照片|截圖|貼圖)/;
  S.item=(G,th,from,t)=>{ if(Array.isArray(t)) return {th,from:t[0],text:text(G,t[1])}; const s=text(G,t); return /^（/.test(s)&&!PIC.test(s)?{th,from,text:s,narr:true}:{th,from,text:s}; };   /* （…）＝灰字旁白；（照片／截圖／貼圖…）＝她傳的圖 */
  const TIMED=/^（(\d{1,2}):(\d{2})）(.+)$/;   /* 「（19:00）算了。」＝那個時間她再傳一則 */
  S.askOf=function(G,key,who,opts,until,th,idx){ th=th||'p:'+who; return {id:'aa720:'+key,until,opts:opts.map((o,j)=>Object.assign({t:o.t,say:(o.say||[]).filter(t=>!(typeof t==='string'&&TIMED.test(t))).map(t=>S.item(G,th,who,t)),aa720:{key,i:idx?idx[j]:j}},/^（/.test(o.t)?{post:false}:null))}; };   /* idx：選項是稿上那一組的第幾個（有些選項不給的時候，例：可昕「我現在過去」人在臺北才有）*/
  S.msgs=(G,who,L,th)=>(L||[]).map(t=>S.item(G,th||'p:'+who,who,t));
  /* 稿的 missed／after：[[HH:MM, 字]…] 或 [字…]（at 那天）*/
  S.timed=function(G,who,day,L,tag,h0){ if(typeof PHONE==='undefined'||!L||!L.length) return false; let n=0;
    for(const x of L){ const [hm,t]=Array.isArray(x)&&/^\d{1,2}:\d{2}$/.test(x[0])?x:[null,x]; const h=hm?(+hm.split(':')[0])+(+hm.split(':')[1])/60:h0; PHONE.at(G,day,h,[S.item(G,'p:'+who,who,t)],tag+'_'+(n++)); } return true; };
  S.ON={};   /* key → fn(G,i,m)：回了那則訊息的第 i 個選項 */
  S.OPTS={};   /* 不是一般邀約的那幾則：key → ()→稿上那一組選項 */
  S.onAnswer=function(G,m,o){ if(!o||!o.aa720) return; const {key,i}=o.aa720, x=S.ON[key]; if(!x) return; const ev=S.src(key), opts=S.OPTS[key]?S.OPTS[key](G):S.optsOf(key);
    const op=opts&&opts[i]; if(op){ S.rel(S.whoOf(key),op.rel); S.setF(G,op.set); for(const t of op.say||[]){ const mm=typeof t==='string'&&TIMED.exec(t); if(mm&&typeof PHONE!=='undefined') PHONE.at(G,G.day,(+mm[1])+(+mm[2])/60,[S.item(G,m.th||'p:'+S.whoOf(key),S.whoOf(key),mm[3])],'aa720_'+key+'_t'+i); } }
    try{ x(G,i,m,op,ev); }catch(e){ console.warn('AA720P.onAnswer',key,e); } };

  /* ---------- 排那一場 ---------- */
  S.K={};   /* key → {who, src, plan(G,r,o)→{d,h}, place, bg, title, hours, late, travel, travelH, back, sceneOf, after(G,GM) } */
  S.src=k=>S.K[k]&&S.K[k].src?S.K[k].src():EV(k);
  S.whoOf=k=>S.K[k]&&S.K[k].who||S.WHO[k]||(S.src(k)||{}).who;
  S.WHO={};
  S.optsOf=k=>S.K[k]&&S.K[k].opts?S.K[k].opts():((S.src(k)||{}).invite||{}).opts;
  S.outId=k=>'aa720_'+k;
  S.planOut=function(G,k,slot){ const K=S.K[k], E=S.src(k), P=Object.assign({},E.plan||{}, K.planX||{}); if(!slot||typeof OUT==='undefined') return false; const r=S.r(G,k);
    if(T(slot.d,slot.h)<now(G)-1e-6){ r.st='skip'; r.why='過了時間'; return false; }
    r.st='planned'; r.plan=slot;
    return OUT.plan(G,Object.assign({id:S.outId(k)+(K.idSuffix?K.idSuffix(G,r):''),ev:K.ev||k,day:slot.d,h:slot.h,late:P.late!=null?P.late:0.5,place:P.place,title:P.title,travel:P.travel||'',travelH:P.travelH!=null?P.travelH:0.25,alarm:true,aa720:k},P.back?{back:P.back}:null)); };
  /* 回邀約：plan:true＝r.slot；'+1天'＝隔一天；'下一週'＝下一週同一天；'now'＝現在＋20 分鐘；set＝不去 */
  S.answerPlan=function(G,k,op){ const r=S.r(G,k); r.k=op?S.optsOf(k).indexOf(op):-1; if(!op) return;
    if(op.set&&!op.plan){ r.st='declined'; return; }
    const p=op.plan; if(p==null||p===false){ r.st='none'; return; }
    let s=r.slot; if(p==='+1天') s={d:s.d+1,h:s.h}; else if(p==='下一週') s={d:s.d+7,h:s.h}; else if(p==='now'){ const t=now(G)+1/3, d=Math.floor(t/24); s={d,h:t-d*24}; }
    S.planOut(G,k,s); };
  S.missed=function(G,k){ const r=S.r(G,k), E=S.src(k)||{}, M=E.missed; if(r.st==='done') return; r.st='missed'; if(!M) return;
    const day=(r.plan&&r.plan.d!=null)?r.plan.d:G.day; S.timed(G,S.whoOf(k),day,M.msgs,'aa720_miss_'+k); if(M.set) S.setF(G,M.set); };
  /* 那一場：scene →（datingInsert）→ opts → end → opts2；set（選項沒有記的才記）、mem */
  /* 圖書館讀書區小聲講（D127、LIBQ）：B1 討論室（library_b1）照規則自動加（小聲）；其他的場景照稿（考前一晚的（小聲）是 AA 自己寫的、出了總圖不加）——
     不然從總圖 3F 出發的 2D 出遊（背景是深色底）會照 3D 的位置被當成讀書區 */
  S.QUIET_BG=['library_b1'];
  S.scene=async function(G,GM,k){ const K=S.K[k]; if(typeof LIBQ!=='undefined'&&LIBQ.loud&&!S.QUIET_BG.includes(BGK(K.bgKey||k))) return LIBQ.loud(()=>S.scene0(G,GM,k)); return S.scene0(G,GM,k); };
  S.scene0=async function(G,GM,k){ const K=S.K[k], E=S.src(k), her=S.whoOf(k), r=S.r(G,k), seen=new Set(); S.cur={G,k,h0:+G.hour||0};
    const sc=K.sceneOf?K.sceneOf(G,r):E.scene;
    if(E.datingInsert&&S.dating(G,her)){ const n=E.datingInsert.after|0; await S.play(GM,her,sc.slice(0,n+1)); await S.play(GM,her,E.datingInsert.lines); await S.play(GM,her,sc.slice(n+1)); }
    else await S.play(GM,her,sc);
    const opts=K.sceneOpts?K.sceneOpts(G,r):E.opts; if(opts&&opts.length){ const c=await S.choose(GM,her,opts,seen); r.sk=c.k; }
    await S.play(GM,her,K.endOf?K.endOf(G,r):E.end);
    if(E.opts2&&E.opts2.length){ const c=await S.choose(GM,her,E.opts2,seen); r.sk2=c.k; }
    const set=K.setOf?K.setOf(G,r):E.set; if(set) for(const x in set) if(!seen.has(x)) F(G)[x]=set[x];
    S.mem(her,K.memOf?K.memOf(G,r):E.mem); r.st='done'; r.doneDay=G.day;
    if(K.after) await K.after(G,GM,r); };
  S.event=function(k){ const K=S.K[k], E=S.src(k)||{}, P=Object.assign({},E.plan||{},K.planX||{}), ev={id:K.ev||k,title:P.title||k,participants:[S.whoOf(k)],location:'any',trigger:'outing',once:false,background:'dark',
      dialogue:[{scene:K.sceneLabel||P.place||'',bg:BGK(K.bgKey||k)},{call:async(G,GM)=>S.scene(G,GM,k)}],   /* bg 一定給（沒給＝人在家的時候換成家裡的背景，events3d.js）*/
      outingMissed:(G)=>{ if(K.missedFn) K.missedFn(G); else S.missed(G,k); }};
    Object.defineProperty(ev,'hours',{enumerable:true,get:()=>K.hoursFn?K.hoursFn(S.cur&&S.cur.G):(typeof P.hours==='number'?P.hours:1)});
    return ev; };

  /* ---------- 一般的邀約（傳訊息 → 回 → 排）---------- */
  /* inv(G)→{d,h}：什麼時候傳；slot(G,invDay)→{d,h}：plan:true 那一天；msgs(G)：傳哪幾則 */
  S.offer=function(G,k,at){ const K=S.K[k], r=S.r(G,k), who=S.whoOf(k); if(typeof PHONE==='undefined'||r.st) return false; const t0=Math.max(T(at.d,at.h),now(G)), d0=Math.floor(t0/24);
    const slot=K.slot(G,d0,r); if(!slot){ r.st='na'; return false; } r.slot=slot; r.inv={d:d0,h:t0-d0*24};
    if(T(slot.d,slot.h)-((S.src(k).plan||{}).travelH||0.25)<t0+0.25){ r.st='na'; r.why='來不及'; return false; }
    const until=K.until?K.until(G,r):T(slot.d,slot.h)-((S.src(k).plan||{}).travelH||0.25)-0.25;
    const L=S.msgs(G,who,K.msgs?K.msgs(G,r):(S.src(k).invite||{}).msgs); L[L.length-1].ask=S.askOf(G,k,who,S.optsOf(k),until);
    PHONE.at(G,d0,r.inv.h,L,'aa720_inv_'+k); r.st='offer'; r.until=until; return true; };
  S.offerExpire=function(G,k){ const r=S.r(G,k); if(r.st==='offer'&&r.until!=null&&now(G)>r.until){ r.st='skip'; if(S.K[k].onSkip) S.K[k].onSkip(G,r); return true; } return false; };
  const ansPlan=k=>(G,i,m,op)=>{ const r=S.r(G,k); if(r.st!=='offer') return; S.answerPlan(G,k,op); if(S.K[k].onAns) S.K[k].onAns(G,r,op,i); };
  /* 接在決定拍 say 後面的三個選項（ev_an_expo_together、ev_zr_call_mom both、ev_kx_mock_interview）：當面＝GM.choose；三天沒見面改傳訊息＝最後一則掛選項 */
  S.FROM_SAY={};   /* 'who:key' → {k, ok(G)} */
  S.afterSay=async function(GM,whoObj,id,x){ const f=S.FROM_SAY[x.who+':'+x.key]; const G=GM.G; if(!f||!f.ok(G)) return; const k=f.k, r=S.r(G,k); if(r.st) return;
    const slot=S.K[k].slot(G,G.day,r); if(!slot||T(slot.d,slot.h)<=now(G)){ r.st='na'; return; } r.slot=slot; r.inv={d:G.day,h:+G.hour||0}; r.st='offer';
    const opts=S.optsOf(k); const c=await S.choose(GM,S.whoOf(k),opts); S.answerPlan(G,k,c.o); if(S.K[k].onAns) S.K[k].onAns(G,r,c.o,c.k); };
  S.msgAsk=function(G,x){ const f=S.FROM_SAY[x.who+':'+x.key]; if(!f||!f.ok(G)) return null; const k=f.k, r=S.r(G,k); if(r.st) return null;
    const slot=S.K[k].slot(G,G.day,r); if(!slot||T(slot.d,slot.h)<=now(G)+0.5){ r.st='na'; return null; } r.slot=slot; r.inv={d:G.day,h:+G.hour||0}; r.st='offer';
    const until=T(slot.d,slot.h)-((S.src(k).plan||{}).travelH||0.25)-0.25; r.until=until; return S.askOf(G,k,S.whoOf(k),S.optsOf(k),until); };

  /* ================= 各場的時間（照稿；import_aa720.py AT 核對字）================= */
  const firstWd=(d0,w)=>{ for(let d=d0+1;d<=d0+7;d++) if(wdOf(d)===w) return d; return null; };   /* d0 之後（不含 d0）的第一個星期 w */
  const AN='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
  /* 以安 AN-1 first：說明會（2027-03-18 18:30；revealAt 那一場 say 的最後一句之後接三個選項）*/
  S.K.ev_an_expo_together={ who:AN, slot:()=>({d:dk('2027-03-18'),h:18.5}) };
  S.FROM_SAY['heroine_01:jp_tell']={k:'ev_an_expo_together',ok:G=>law(G)&&S.is(G,AN,'jp_tell','first')};
  /* 以安 AN-2 together：決定那天 21:00 她傳；隔天 19:00 總圖 B1 討論室（+1天＝後天）*/
  S.K.ev_an_grad_think={ who:AN, inv:G=>{ const d=S.decDay(G,AN,'grad'); return d==null?null:{d,h:21}; }, slot:(G,d0)=>({d:d0+1,h:19}), open:G=>S.is(G,AN,'grad','together') };
  /* 芷若 ZR-1 both：say（delay 1）之後；隔天 17:30 店後門 */
  S.K.ev_zr_call_mom={ who:ZR, src:()=>EV('ev_zr_call_mom').variants.both, slot:(G,d0)=>({d:d0+1,h:17.5}), opts:()=>EV('ev_zr_call_mom').variants.both.invite.opts };
  S.FROM_SAY['heroine_02:fund']={k:'ev_zr_call_mom',ok:G=>law(G)&&S.is(G,ZR,'fund','both')};
  /* 芷若 ZR-1 scholar／both：scholar＝決定那天＋2 天 21:00；both＝店後門那一場的隔週（那一場那天＋7）21:00、第一則換 altFirst；那週四 19:00 總圖 B1 */
  S.K.ev_zr_scholar_1={ who:ZR, open:G=>S.is(G,ZR,'fund',['scholar','both']),
    inv:G=>{ if(S.is(G,ZR,'fund','scholar')){ const d=S.decDay(G,ZR,'fund'); return d==null?null:{d:d+2,h:21}; } const c=S.rec(G).ev_zr_call_mom; if(!c||!c.st||c.st==='offer'||c.st==='planned') return null; const b=c.plan?c.plan.d:(c.slot?c.slot.d:(c.inv?c.inv.d:S.decDay(G,ZR,'fund'))); return b==null?null:{d:b+7,h:21}; },
    slot:(G,d0)=>({d:firstWd(d0,4),h:19}), msgs:G=>{ const E=EV('ev_zr_scholar_1').invite; return S.is(G,ZR,'fund','both')&&E.altFirst?E.altFirst.msgs:E.msgs; },
    onSkip:(G,r)=>{}, onAns:(G,r)=>{} };
  /* 芷若 ZR-1 scholar：_1 那天（那週四；沒去、不去也算）＋10 天 21:00；隔天 19:00 */
  S.K.ev_zr_scholar_2={ who:ZR, open:G=>S.is(G,ZR,'fund','scholar'),
    inv:G=>{ const s=S.rec(G).ev_zr_scholar_1; if(!s||!s.slot||s.st==='offer'||s.st==='planned') return null; return {d:s.slot.d+10,h:21}; }, slot:(G,d0)=>({d:d0+1,h:19}) };
  /* 芷若 ZR-2 visit：2028-02-14 21:00；2/15 15:00 桃園機場（祐廷那天在臺灣）*/
  S.K.ev_zr_return_airport={ who:ZR, open:G=>S.is(G,ZR,'distance','visit')&&!S.away(G,dk('2028-02-15')), inv:()=>({d:dk('2028-02-14'),h:21}), slot:()=>({d:dk('2028-02-15'),h:15}) };
  /* 語彤 YT-2 with：2026-07-02 21:00；7/3 13:50 總圖門口 */
  S.K.ev_yt_result_together={ who:YT, open:G=>S.is(G,YT,'dm','with'), inv:()=>({d:dk('2026-07-02'),h:21}), slot:()=>({d:dk('2026-07-03'),h:EV('ev_yt_result_together').plan.h}) };
  /* 子晴 ZQ-1 intern：2026-10-16（五）22:10；「我過去。」＝現在＋20 分鐘（騎樓的咖啡店）*/
  S.K.ev_zq_quit_intern={ who:ZQ, open:G=>S.is(G,ZQ,'summer','intern'), inv:()=>({d:dk('2026-10-16'),h:22+10/60}), slot:(G,d0)=>({d:d0,h:23.5}), until:(G,r)=>T(r.inv.d,23.5),
    msgs:()=>EV('ev_zq_quit_intern').invite.msgs, opts:()=>EV('ev_zq_quit_intern').invite.opts, planX:{h:null,late:0.5,travelH:1/3,hours:1} };
  /* 學姊 SIS-1 stay：2026-02-01（日）16:00；17:00 總圖 3F（late 1 小時）；到閉館（22:00）*/
  S.K.ev_sis_last_night={ who:SIS, open:G=>S.is(G,SIS,'exam','stay'), inv:()=>({d:dk('2026-02-01'),h:16}), slot:()=>({d:dk('2026-02-01'),h:17}),
    hoursFn:G=>{ const close=typeof PLACES!=='undefined'&&PLACES.hours&&PLACES.hours.library?PLACES.hours.library.close:22, h=G?+G.hour||17:17; return Math.max(0.25,close-h); } };
  /* 學姊 SIS-2 wait＋交往中：交往後、決定那天以後第三個週日 18:00（週五 21:00 她問；「下次可以嗎？」＝下一週）*/
  S.K.ev_sis_grandma_dinner={ who:SIS, open:G=>S.is(G,SIS,'tell_sis','wait')&&S.dating(G,SIS),
    inv:G=>{ const r=S.r(G,'ev_sis_grandma_dinner'); if(r.base==null){ const d=S.decDay(G,SIS,'tell_sis'), R=((G.flags.romance||{})[SIS])||{}; r.base=Math.max(d==null?-1e9:d,typeof R.sinceDay==='number'?R.sinceDay:G.day); }   /* 起算日記下來（舊存檔沒有交往的那一天＝第一次看到交往中的那天）*/
      let n=0, x=r.base; while(n<3){ x=firstWd(x,0); n++; } return {d:x-2,h:21}; },
    slot:(G,d0)=>({d:firstWd(d0,0),h:18}) };
  /* 沛珊 PS-2 before（交往中）：2026-12-17（四）20:30；21:00 課輔班門口 */
  S.K.ev_ps_before_leave={ who:PS, open:G=>S.is(G,PS,'tell','before'), inv:()=>({d:dk('2026-12-17'),h:20.5}), slot:()=>({d:dk('2026-12-17'),h:21}), until:()=>T(dk('2026-12-17'),21.25) };
  /* 沛珊：課輔班門口沒選「我明天去車站送妳」（或沒到）＝12/17 23:00 她問；12/18 09:40 臺北車站 */
  S.K.ev_ps_station_sendoff={ who:PS, src:()=>EV('ev_ps_station_sendoff'), opts:()=>EV('ev_ps_station_sendoff').msgAsk.opts, msgs:()=>EV('ev_ps_station_sendoff').msgAsk.msgs,
    open:G=>S.is(G,PS,'tell','before')&&S.r(G,'ev_ps_station_sendoff').st==null&&!(S.r(G,'ev_ps_before_leave').st==='done'&&S.r(G,'ev_ps_before_leave').sk===0),
    inv:G=>{ const b=S.r(G,'ev_ps_before_leave').st; return b&&b!=='offer'&&b!=='planned'?{d:dk('2026-12-17'),h:23}:(now(G)>=T(dk('2026-12-17'),23)?{d:dk('2026-12-17'),h:23}:null); },
    slot:()=>({d:dk('2026-12-18'),h:EV('ev_ps_station_sendoff').plan.h}) };
  /* 可昕 KX-1 rehearse：say（delay 3）之後；那天以後第一個週四 19:30 男生宿舍交誼廳；結果 plan 那天＋5 天 17:00 */
  S.K.ev_kx_mock_interview={ who:KX, slot:(G,d0)=>({d:firstWd(d0,4),h:19.5}) };
  S.FROM_SAY['kexin:after_fail']={k:'ev_kx_mock_interview',ok:G=>law(G)&&S.is(G,KX,'after_fail','rehearse')};
  /* 可昕 KX-1 eat：決定那天，現在＋1 小時（最晚 21:00）公館麵店；祐廷付三碗 */
  S.K.kx_eat={ who:KX, src:()=>BLK('kx_eat'), ev:'ev_kx_eat', bgKey:'kx_eat', slot:()=>null, cost:G=>S.EAT_COST };
  S.EAT_COST=3*(typeof PLACES!=='undefined'&&PLACES.prices&&PLACES.prices.noodle?PLACES.prices.noodle:100);   /* 稿沒有寫錢：一碗照公館燒臘的價錢（沒有就 100），LAWWW 定 */
  /* 那一場的附加：演完以後的訊息 */
  S.K.ev_kx_mock_interview.after=(G,GM,r)=>{ const R=EV('ev_kx_mock_interview').result; if(!R||typeof PHONE==='undefined') return; const d=r.plan.d+5; const L=S.msgs(G,KX,R.msgs); L[L.length-1].ask=S.askOf(G,'kx_mock_result',KX,R.opts,T(d+3,24)); PHONE.at(G,d,17,L,'aa720_kx_mock_result'); };
  S.K.ev_sis_last_night.after=(G)=>{ F(G).SIS_LAST_NIGHT=true; };
  S.K.ev_ps_before_leave.after=(G,GM,r)=>{ if(r.sk===0){ const st=S.r(G,'ev_ps_station_sendoff'); st.slot={d:dk('2026-12-18'),h:EV('ev_ps_station_sendoff').plan.h}; S.planOut(G,'ev_ps_station_sendoff',st.slot); } };   /* 「我明天去車站送妳。」＝排車站那一場（不再問）*/
  S.K.ev_zq_quit_intern.missedFn=G=>{ S.r(G,'ev_zq_quit_intern').st='missed'; };

  /* ================= 每次 STORY.phoneRules ================= */
  S.GEN=['ev_an_grad_think','ev_zr_scholar_1','ev_zr_scholar_2','ev_zr_return_airport','ev_yt_result_together','ev_zq_quit_intern','ev_sis_last_night','ev_sis_grandma_dinner','ev_ps_before_leave','ev_ps_station_sendoff'];
  S.tick=function(G){ if(!law(G)||!A()) return false; let did=false;
    for(const k of S.GEN){ const K=S.K[k], r=S.r(G,k); if(r.st==='offer'){ did=S.offerExpire(G,k)||did; continue; } if(r.st) continue; if(!K.open(G)) continue; if(!contact(G,K.who)) continue;
      const at=K.inv(G); if(!at||at.d==null) continue; if(now(G)<T(at.d,at.h)) continue; did=S.offer(G,k,at)||did; }
    for(const k of Object.keys(S.FROM_SAY).map(x=>S.FROM_SAY[x].k)) S.offerExpire(G,k);
    for(const f of S.RULES){ try{ did=f(G)||did; }catch(e){ console.warn('AA720P.rule',e); } }
    return did; };
  S.RULES=[];
  for(const k of S.GEN.concat(['ev_an_expo_together','ev_zr_call_mom','ev_kx_mock_interview'])) S.ON[k]=ansPlan(k);
  S.ON.kx_mock_result=()=>{}; S.OPTS.kx_mock_result=()=>EV('ev_kx_mock_interview').result.opts; S.WHO.kx_mock_result=KX;

  /* ================= 以安：送機（ev_an_airport＝ev_an_sendoff 加段）================= */
  const jp=G=>!!(G.flags&&G.flags.EXCHANGE_ROUTE==='JP');
  S.RULES.push(function anAirport(G){ const E=EV('ev_an_airport'), d=dk('2028-03-24'); if(d==null||!S.is(G,AN,'grad','together')||jp(G)||!contact(G,AN)) return false; const r=S.r(G,'ev_an_airport');
    if(r.st||now(G)<T(d,22.5)||G.day>d+1) return false; const L=S.msgs(G,AN,E.dm.msgs); L[L.length-1].ask=S.askOf(G,'ev_an_airport',AN,E.dm.opts,T(d+1,10.25)); PHONE.at(G,d,22.5,L,'aa720_an_airport'); r.st='offer'; return true; });
  S.OPTS.ev_an_airport=()=>EV('ev_an_airport').dm.opts;
  S.ON.ev_an_airport=(G,i,m,op)=>{ const r=S.r(G,'ev_an_airport'); r.st='answered'; r.k=i; if(op&&op.plan==='y3_an_sendoff'){ if(F(G).HOOK_AN_SENDOFF==null) F(G).HOOK_AN_SENDOFF=G.day; if(typeof Y34B!=='undefined'&&Y34B.planSendoff) Y34B.planSendoff(G); } };
  /* 以安 AN-1 later（an1_later，075eae472；含預設值：沒演到第 6 拍、過了 before 才演到的 late、舊存檔＝不是真的記了 first 的都算）：
     2027-03-19（五）21:00 桌遊團群組（noodle_team）Alison 一則；21:20 以安私訊（和她 FAMILIAR 以上、有她的聯絡方式）一則＋三個選項（她回兩句、rel）。
     21:00 那時不在群組＝沒有群組那則，私訊的第一句換成 an1_later.noGroup 那一句（選項一樣）。三天內補（照稿的時間）；aa555 y2s2_an_expo 照原本（稿 note）*/
  S.AN_LATER={day:'2027-03-19',grp:21,dm:21+20/60};
  S.anLater=G=>law(G)&&!S.is(G,AN,'jp_tell','first');
  S.anFam=G=>met(AN)&&typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&!!SOCIAL.stage&&SOCIAL.STAGES.indexOf(SOCIAL.stage(AN))>=SOCIAL.STAGES.indexOf('FAMILIAR');
  S.inGrp=G=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'noodle_team');
  S.RULES.push(function anLater(G){ if(!S.anLater(G)||typeof PHONE==='undefined') return false; const B=DATA().an1_later, d=dk(S.AN_LATER.day); if(!B||d==null||G.day>d+3) return false; const r=S.r(G,'an1_later'); let did=false;
    if(r.grp==null&&now(G)>=T(d,S.AN_LATER.grp)){ r.grp=S.inGrp(G); if(r.grp){ PHONE.at(G,d,S.AN_LATER.grp,S.msgs(G,'yu',B.group.msgs,B.group.th),'aa720_an_later_grp'); did=true; } }
    if(r.dm==null&&r.grp!=null&&now(G)>=T(d,S.AN_LATER.dm)){ r.dm=S.anFam(G)&&contact(G,AN); if(r.dm){ const L0=B.dm.msgs.slice(); if(!r.grp) L0[0]=Q('anLaterNoGroup'); const L=S.msgs(G,AN,L0); L[L.length-1].ask=S.askOf(G,'an1_later',AN,B.dm.opts,T(d+3,24)); PHONE.at(G,d,S.AN_LATER.dm,L,'aa720_an_later_dm'); did=true; } }
    return did; });
  S.OPTS.an1_later=()=>DATA().an1_later.dm.opts; S.WHO.an1_later=AN; S.ON.an1_later=(G,i)=>{ S.r(G,'an1_later').k=i; };   /* rel 在 onAnswer 加給以安 */
  S.anSlip=G=>S.is(G,AN,'grad','together')&&F(G).AN_GRAD_THINK===true;   /* 有 ev_an_grad_think 才有那張紙條（missed 的不加）*/
  S.patchSendoff=function(){ const ev=typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.find(e=>e&&e.id==='ev_an_sendoff'); const I=EV('ev_an_airport'); if(!ev||!I||!Array.isArray(ev.dialogue)||ev.aa720) return false; const D=ev.dialogue;
    const C=f=>({custom:f}), nar=t=>/^（/.test(t), mk=(t,c)=>({if:C(c),speaker:nar(t)?null:AN,text:t});
    const dAn=G=>S.dating(G,AN);
    const iOk=D.findIndex(l=>l&&Array.isArray(l.choice)&&l.choice.some(c=>c.goto==='so_ok')); if(iOk<0) return false;
    D.splice(iOk,0,...I.insert.friend.lines.map(t=>mk(t,G=>!dAn(G)&&S.anSlip(G))));
    const iL=D.findIndex(l=>l&&l.speaker===AN&&l.text==='你想去的地方，我不在的時候寫上去。回來我要看。'); if(iL>=0) D.splice(iL+1,0,...I.insert.dating.lines.map(t=>mk(t,G=>dAn(G)&&S.anSlip(G))));
    ev.aa720=true; return true; };

  /* ================= 芷若：店後門（tell）滷肉的作法；送機打開＋第一封信；信寄到 Café；十點半的電話 ================= */
  const zrOnShift=G=>{ if(!G||G.zone!=='cafe') return false; const n=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(ZR):null; if(n&&n.staff==='cafe'&&!n.leaving) return true; const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[ZR], e=c&&typeof STORY!=='undefined'&&STORY.schedEnt?STORY.schedEnt(c,G):null; return !!(e&&e.zone==='cafe'&&e.act==='barista'); };
  S.zrSayDay=G=>{ const L=(G.flags&&G.flags.DECIDE_SAY)||[]; const x=L.find(q=>q.who===ZR&&q.key==='fund'&&q.played!=null&&q.played!==false); return x?x.played:null; };
  S.recipeDue=G=>law(G)&&S.is(G,ZR,'fund','tell')&&!F(G).ZR_RECIPE&&S.zrSayDay(G)!=null&&G.day>=S.zrSayDay(G)+10&&zrOnShift(G);
  S.recipe=async function(GM){ const G=GM.G, V=EV('ev_zr_call_mom').variants.tell; F(G).ZR_RECIPE=true;   /* 先記（中途被打斷不重演）*/
    await S.inScene(GM,async()=>{ await S.play(GM,ZR,V.scene); await S.choose(GM,ZR,V.opts); S.setF(G,V.set); }); return true; };
  S.inScene=async function(GM,fn){ GM.sceneBegin(); try{ if(typeof ADV!=='undefined'&&ADV.begin&&!ADV.active) ADV.begin({background:'blur'}); await fn(); } finally { if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); } if(GM.autosave) GM.autosave(); };
  /* 送機（AA_390）打開：distance=letters＝沒有 HOOK 也傳 9/1 那則，第二句換；地址那段之後、選項之前第一封信 */
  S.zrLetters=G=>law(G)&&S.is(G,ZR,'distance','letters');
  S.patchZrSendoff=function(){ if(typeof ZRSENDOFF==='undefined'||ZRSENDOFF.aa720) return false; const Z=ZRSENDOFF, I=EV('ev_zr_sendoff_airport');
    Z.openNoHook=G=>S.zrLetters(G);
    Z.askLines=G=>{ const L=Z.LINES.ask.slice(); if(G.flags.HOOK_ZR_SENDOFF==null&&S.zrLetters(G)&&L[1]===Q('zrAskOrig')) L[1]=Q('zrAskAlt'); return L; };
    const D=Z.EVENT&&Z.EVENT.dialogue; if(Array.isArray(D)){ const i=D.findIndex(l=>l&&Array.isArray(l.choice)); if(i>=0){ const c={custom:G=>S.zrLetters(G)};
      D.splice(i,0,...I.insert.lines.map(t=>({if:c,speaker:/^（/.test(t)?null:ZR,text:t})),{if:c,set:{ZR_LETTERS:1}}); } }
    Z.aa720=true; return true; };
  /* 第一封信：9/2 演完以後第一次回到宿舍房間（或當天 22:00 提醒「芷若的信」）；答應了沒來（或沒去）＝留在 Café 櫃台，跟第二封一起拿 */
  S.letter1Due=G=>S.zrLetters(G)&&F(G).ZR_LETTERS===1&&!S.r(G,'zr_letters').l1&&F(G).ZR_SENDOFF_2027==='met';
  S.letter1=async function(GM){ const G=GM.G, r=S.r(G,'zr_letters'); r.l1=G.day; await S.inScene(GM,async()=>{ for(const t of EV('ev_zr_sendoff_airport').letter1.text) await GM.say({name:'芷若的信'},text(G,t)); }); return true; };
  S.LETTER_ZONES=['dorm','home_room','dorm_y24'];
  /* 信寄到 Café（取代英國的明信片）：到了那天以後第一次進 2:30 AM，店員在櫃台叫住你（一次一封、照順序）*/
  S.letterDue=function(G){ if(!S.zrLetters(G)||G.zone!=='cafe') return null; const B=BLK('zr_letters'), r=S.r(G,'zr_letters'), n=r.n|0; const L=B.letters[n]; if(!L) return null; const d=dk(L.arrive); return d!=null&&G.day>=d?n:null; };
  S.letter=async function(GM){ const G=GM.G, B=BLK('zr_letters'), r=S.r(G,'zr_letters'), n=S.letterDue(G); if(n==null) return false; r.n=n+1; r.read=r.read||{}; r.read[n]=G.day;
    const left=n===0&&!r.l1;   /* 第一封她出國前放在櫃台（9/2 沒有在機場拿到）*/
    await S.inScene(GM,async()=>{ const p=n===0?B.pickup:B.pickupAlt; await GM.say(S.spk(G,p[0]),p[1]);
      if(left){ await GM.say(S.spk(G,'店員'),Q('zrClerkLeft')); for(const t of EV('ev_zr_sendoff_airport').letter1.text) await GM.say({name:'芷若的信'},text(G,t)); r.l1=G.day; }
      for(const t of B.letters[n].text) await GM.say({name:'芷若的信'},text(G,t));
      if(n===S.LETTER4&&S.dating(G,ZR)){ await GM.say({name:'芷若的信'},text(G,Q('zrLetter4Video'))); r.xmas=G.day; S.xmasVideo(G); }
      await GM.say(null,B.after); }); return true; };
  /* 交往中＋信（ee689cfb8 wiringAnswers 6）：信只取代明信片，不取代 12/25 的視訊。原本是 12/17 那張明信片背面帶出來的（y2b3d.js），
     寫信的玩家改在第四封（letters[2]，12/10；第一封是 9/2 送機那一封）最後多一句「二十五號晚上視訊。…」、讀完排 12/25 20:00 那一通（Y2B.xmasVideo，同明信片那一版） */
  S.LETTER4=2;
  S.xmasVideo=function(G){ const d=dk('2027-12-25'); if(d==null||now(G)>=T(d,20.5)) return false; if(typeof Y2B!=='undefined'&&Y2B.xmasVideo) return Y2B.xmasVideo(G); return false; };
  /* 明信片（y2b3d.js 1B-10 Z10）：distance=letters 的玩家不寄（信取代）*/
  S.patchPostcards=function(){ if(typeof Y2B==='undefined'||!Y2B.pcCards||Y2B.pcCards.aa720) return false; const p0=Y2B.pcCards; const p1=function(G){ if(S.zrLetters(G)) return []; return p0.apply(this,arguments); }; p1.aa720=true; Y2B.pcCards=p1; return true; };
  /* 9/28 她的生日那一通（y2b3d.js 1B-10 AA_336 B6）：原本要讀過 9/24 那張明信片（寄給他本人的版本）才有（Y2B.bdayCard）。
     寫信的玩家沒有明信片，生日電話照原本來（075eae472 wiringAnswers2 7：不用明信片帶出來；同 12/25 視訊）：9/28 21:55「打給她。」「不打。」→ 22:00 視訊，其他照 y2b3d.js */
  S.patchBday=function(){ if(typeof Y2B==='undefined'||!Y2B.bdayCard||Y2B.bdayCard.aa720) return false; const b0=Y2B.bdayCard; const b1=function(G){ if(S.zrLetters(G)) return true; return b0.apply(this,arguments); }; b1.aa720=true; Y2B.bdayCard=b1; return true; };
  /* 沒交往在 Café 當面講的錄取（y2r2_3d.js ev_zhiruo_admitted）：ZR-1 scholar／both＝「我錄取了。英國那邊的信來了。」後面多她一句「……獎學金拿到一半。」（075eae472 wiringAnswers2 5；
     那一句演的時候才加。交往中 5/11 22:40 那則訊息是 S.AT_FIX y2r2_zr_admit）*/
  S.patchAdmitted=function(){ const ev=typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.find(e=>e&&e.id==='ev_zhiruo_admitted'); if(!ev||!Array.isArray(ev.dialogue)||ev.aa720||!Q('zrScholarCafe')) return false; const D=ev.dialogue;
    const i=D.findIndex(l=>l&&l.speaker===ZR&&l.text===Q('zrCafeAdmit')); if(i<0) return false; const c0=D[i].if&&D[i].if.custom;
    D.splice(i+1,0,{if:{custom:G=>(typeof c0!=='function'||!!c0(G))&&law(G)&&S.is(G,ZR,'fund',['scholar','both'])},speaker:ZR,text:Q('zrScholarCafe')}); ev.aa720=true; return true; };
  /* 十點半的電話（distance=call）：2027-09-07～2028-02-11 每週二、週五 22:25 她傳一則（照順序輪）；「今天不行」＝那一次不講 */
  S.zrCallOn=G=>law(G)&&S.is(G,ZR,'distance','call');
  S.RULES.push(function zrCall(G){ if(!S.zrCallOn(G)||typeof PHONE==='undefined') return false; const a=dk('2027-09-07'), b=dk('2028-02-11'), d=G.day; if(a==null||b==null||d<a||d>b) return false; const w=wdOf(d); if(w!==2&&w!==5) return false;
    if(now(G)<T(d,22+25/60)) return false; const tag='aa720_zrcall_'+d; if(sent(G,tag)) return false; const B=BLK('zr_call'), r=S.r(G,'zr_call'), i=(r.n|0)%B.msgs.length; r.n=(r.n|0)+1; r.last=d;
    const L=S.msgs(G,ZR,[B.msgs[i]]); L[0].ask=S.askOf(G,'zr_call',ZR,B.opts,T(d,22.5)); PHONE.at(G,d,22+25/60,L,tag);
    if(typeof OUT!=='undefined') OUT.plan(G,{id:'aa720_zrcall_'+d,ev:'ev_aa720_zr_call',day:d,h:22.5,late:0.25,place:'電話',verb:'接起來',no:'先不接',title:'芷若的電話',travel:'',travelH:0,call:true,silent:true}); return true; });
  S.OPTS.zr_call=()=>BLK('zr_call').opts; S.WHO.zr_call=ZR;
  S.ON.zr_call=(G,i,m,op)=>{ if(op&&op.skipCall&&typeof OUT!=='undefined'){ const q=OUT.get(G,'aa720_zrcall_'+G.day); if(q&&q.state==='planned') q.state='cancelled'; } };
  S.zrCallEvent={ id:'ev_aa720_zr_call', title:'芷若的電話', participants:[ZR], location:'any', trigger:'outing', once:false, background:'dark', hours:1/3,
    dialogue:[{scene:'電話',bg:'phone_street_night'},{call:async(G,GM)=>{ const B=BLK('zr_call'), r=S.r(G,'zr_call'), c=(r.c|0)%B.callLine.length; r.c=(r.c|0)+1; r.calls=(r.calls|0)+1; await GM.say(null,B.callLine[c]); }}] };
  /* E07 英國那一學期的視訊（每月，zr_uk3d.js）：開頭之後多一句（信拿過兩封以上／電話講過兩次以上；一次）*/
  S.e07Line=function(G){ const r=S.r(G,'zr_e07'); if(r.said) return null; if(S.zrLetters(G)&&(S.r(G,'zr_letters').n|0)>=2) return Q('zrLettersE07'); if(S.zrCallOn(G)&&(S.r(G,'zr_call').calls|0)>=2) return Q('zrCallE07'); return null; };
  S.patchE07=function(){ if(typeof ZRUK==='undefined'||!ZRUK.monthLines||ZRUK.monthLines.aa720) return false; const m0=ZRUK.monthLines; const m1=function(G){ const L=m0.apply(this,arguments); const t=Array.isArray(L)&&L.length?S.e07Line(G):null; if(t){ S.r(G,'zr_e07').said=G.day; return [L[0],{speaker:ZR,text:t}].concat(L.slice(1)); } return L; }; m1.aa720=true; ZRUK.monthLines=m1; return true; };

  /* ================= 語彤：自己跟媽媽說（取代 AA_624 事件 10'、事件 4）；一起看放榜 ================= */
  S.ytTell=G=>law(G)&&S.is(G,YT,'mom','tell');
  S.YT_DAY='2026-04-25';
  S.ytLive=async function(GM){ const G=GM.G, E=EV('ev_yt_tell_mom'), r=S.r(G,'ev_yt_tell_mom'); if(r.live) return false; r.live=G.day; S.ytMark(G);
    await S.play(GM,YT,E.live.scene); await S.choose(GM,YT,E.live.opts); return true; };
  S.ytMark=G=>{ const f=F(G), E=EV('ev_yt_tell_mom'); f.YT_PARENTS_KNOW='told'; f.YT_MOM_TOLD=true; if(f.YT_MOM_BACK==null) f.YT_MOM_BACK=dk(S.YT_DAY); if(f.YT_MOM_SEEN==null) f.YT_MOM_SEEN=true; f.YT_ABSENT_SEEN=true; S.mem(YT,E.mem); };
  S.patchYT=function(){ if(typeof YTJOB==='undefined'||YTJOB.aa720) return false; const Y=YTJOB;
    const ad0=Y.absentDay; Y.absentDay=function(G){ if(S.ytTell(G)) return false; return ad0.apply(this,arguments); };   /* 事件 4（週日她請假）不演：她週日照常上班 */
    const ms0=Y.midShift; Y.midShift=async function(GM,k){ const G=GM.G; if(k==='tea'&&S.ytTell(G)&&Y.momDay&&Y.momDay(G)&&!S.r(G,'ev_yt_tell_mom').live){ GM.G.flags.YT_MOM_HERE=true; return S.ytLive(GM); } if(S.ytTell(G)){ const f=G.flags; if(f.YT_MOM_BACK==null&&G.day>dk(S.YT_DAY)) S.ytMark(G); } return ms0.apply(this,arguments); };
    const mk0=Y.momKnown; Y.momKnown=function(G){ if(S.ytTell(G)){ if(G.day>=dk(S.YT_DAY)&&G.flags.YT_PARENTS_KNOW!=='told'&&now(G)>=T(dk(S.YT_DAY),15)) S.ytMark(G); return; } return mk0.apply(this,arguments); };
    Y.aa720=true; return true; };
  /* 自己走進一盞（沒有班）：那天 15:00～16:00 在 wz_teahouse 就演 */
  S.ytWalkInDue=G=>S.ytTell(G)&&G.zone==='wz_teahouse'&&G.day===dk(S.YT_DAY)&&(+G.hour||0)>=15&&(+G.hour||0)<16&&!S.r(G,'ev_yt_tell_mom').live;
  S.RULES.push(function ytPhone(G){ if(!S.ytTell(G)||typeof PHONE==='undefined'||!contact(G,YT)) return false; const E=EV('ev_yt_tell_mom'), d=dk(S.YT_DAY); if(d==null) return false; let did=false;
    if(now(G)>=T(d,15)&&G.flags.YT_PARENTS_KNOW!=='told') S.ytMark(G);
    if(now(G)>=T(d,21.5)&&!sent(G,'aa720_yt_night')){ PHONE.at(G,d,21.5,S.msgs(G,YT,E.night.msgs),'aa720_yt_night'); did=true; }
    if(now(G)>=T(d+1,21)&&!S.r(G,'ev_yt_tell_mom').live&&!sent(G,'aa720_yt_phone')){ const L=S.msgs(G,YT,E.phone.msgs); L[L.length-1].ask=S.askOf(G,'ev_yt_tell_mom',YT,E.phone.opts,T(d+3,24)); PHONE.at(G,d+1,21,L,'aa720_yt_phone'); did=true; }
    return did; });
  S.ON.ev_yt_tell_mom=()=>{}; S.OPTS.ev_yt_tell_mom=()=>EV('ev_yt_tell_mom').phone.opts;
  /* 第 6 拍「她在媽媽面前把茶倒完」：lines 換 beat6 三句（ask、選項、reply 不變）*/
  S.patchArcs=function(){ if(typeof ARCS==='undefined'||!ARCS.resolve||ARCS.resolve.aa720) return false; const r0=ARCS.resolve; const r1=function(G,id,b){ const o=r0.apply(this,arguments); if(id===YT&&b&&b.n===6&&S.ytTell(G)&&EV('ev_yt_tell_mom').beat6) o.lines=EV('ev_yt_tell_mom').beat6.lines.slice(); return o; }; r1.aa720=true; ARCS.resolve=r1;
    if(ARCS.lifeState&&!ARCS.lifeState.aa720){ const l0=ARCS.lifeState; const l1=function(G,id){ if(id===ZQ&&S.zqIntern(G)){ const s=ARCS.lifeStage(G,id), L=BLK('zq_intern').life; if(s===4&&L.s4) return L.s4.state; if(s===5&&L.s5) return L.s5.state; } return l0.apply(this,arguments); }; l1.aa720=true; ARCS.lifeState=l1; }
    if(ARCS.rotTier&&!ARCS.rotTier.aa720){ const t0=ARCS.rotTier; const t1=function(G,id,x){ if(id===ZQ&&S.zqIntern(G)&&x&&x.if==='ans:ZQ_PL_CAT_CO') return -1; return t0.apply(this,arguments); }; t1.aa720=true; ARCS.rotTier=t1; }   /* intern 版：ZQ_PL_CAT_CO（「叫我跟我爸說我在『貓』公司實習」）不出（ee689cfb8 zq_intern.rot「關掉照你」）；life 4、5 那兩則改說 altIntern（AA_717 ee689cfb8，src/arcs3d.js S.altIntern）*/
    if(ARCS.COND&&!ARCS.COND.zqQuitIntern) ARCS.COND.zqQuitIntern=G=>S.zqQuit(G);   /* altIntern 的「ZQ_QUIT_INTERN」（tools/story/import_arc_rot.py ALT_NAMED）*/
    if(ARCS.pick&&!ARCS.pick.aa720){ const k0=ARCS.pick; const k1=function(G,id,ctx){ const b=k0.apply(this,arguments); if(b||id!==SIS||!ctx||!ctx.quiet) return b; return S.quietBeat(G,k0.call(this,G,id,Object.assign({},ctx,{quiet:false}))); }; k1.aa720=true; ARCS.pick=k1; }
    if(ARCS.play&&!ARCS.play.aa720){ const p0=ARCS.play; const p1=async function(GM,who,id,b){ if(!b||!b.quietMove) return p0.apply(this,arguments); const M=S.QM();
        for(const t of M.open) await GM.say(/^（/.test(t)?null:who,text(GM.G,t));   /* 還在安靜區：她放下筆、比樓梯間 */
        const b2=Object.assign({},b,{opts:b.opts.map(o=>Object.assign({},o,{reply:(o.reply||[]).concat(M.close)}))});   /* 結尾一句（推門回去）接在她回的那幾句後面 */
        return typeof LIBQ!=='undefined'&&LIBQ.loud?LIBQ.loud(()=>p0.call(this,GM,who,id,b2)):p0.call(this,GM,who,id,b2); }; p1.aa720=true; ARCS.play=p1; }   /* 樓梯間不是安靜區：不加「（小聲）」*/
    return true; };
  /* 學姊第 6 拍在總圖安靜區（AA_720 quietMove，SIS1-QUIET-LIB-1108；4f37a68bb）：第 14 週到筆試只約得到總圖、第 6 拍 quietOk:false 一直演不到（1/31 以後才演到＝late）。
     輪到這一拍、人在安靜區：她起身、兩個人走到樓梯間再演——open 兩句 → 第一句旁白換成樓梯間那一句 → 第 2 句起照 AA_712 原稿（ask、三個選項、reply 不改）→ close 一句 → 回到原本的座位（不換場景）。
     SIS-1 的決定照常記（before 2026-01-31 不變）；AA_535 1-3 的地點不改。其他 quietOk:false 的拍不在這裡（要用的時候 AA 一拍一拍寫）*/
  S.QM=()=>{ const q=DATA().quietMove; return q&&q.sis_beat6||null; };
  S.quietBeat=function(G,b){ const M=S.QM(); if(!b||!M||b.n!==6||b.quietOk!==false||!Array.isArray(b.lines)||b.lines[0]!==M.replaceFirst.from) return null; return Object.assign({},b,{quietMove:true,lines:[M.replaceFirst.to].concat(b.lines.slice(1))}); };
  /* 一起看放榜：with＝原本 7/3 那則動態（feed yt_pass）不傳；沒來（missed）＝照稿 14:20 兩則（原本那則打開回來）*/
  S.ytPassClosed=G=>S.is(G,YT,'dm','with')&&F(G).YT_DM_RESULT==='with';

  /* ================= 子晴：暑假實習（intern）================= */
  S.zqIntern=G=>law(G)&&S.is(G,ZQ,'summer','intern');
  S.ZQ_CLOSED=['zq5b','zq6b','zq8b'];   /* AA_504 假實習：騎樓咖啡店那幾則（7/3、8/28）、7/17 爸爸問公司在哪（「公司叫貓、老闆是我」）*/
  S.RULES.push(function zqSummer(G){ if(!S.zqIntern(G)||typeof PHONE==='undefined'||!contact(G,ZQ)) return false; const B=BLK('zq_intern'); let did=false;
    B.summerMsgs.forEach((x,i)=>{ const m=/^(\d{4}-\d{2}-\d{2}) (\d{1,2}):(\d{2})$/.exec(x.at); if(!m) return; const d=dk(m[1]), h=(+m[2])+(+m[3])/60; if(d==null||now(G)<T(d,h)||G.day>d+3) return; const tag='aa720_zq_s'+i; if(sent(G,tag)) return;
      const L=S.msgs(G,ZQ,x.msgs); if(x.opts) L[L.length-1].ask=S.askOf(G,'zq_s'+i,ZQ,x.opts,T(d+3,24)); PHONE.at(G,d,h,L,tag); did=true; });
    return did; });
  for(let i=0;i<6;i++){ S.ON['zq_s'+i]=()=>{}; S.OPTS['zq_s'+i]=()=>BLK('zq_intern').summerMsgs[i].opts; S.WHO['zq_s'+i]=ZQ; }
  /* 辭掉延長的實習（10/16）：隔天 20:00 三則（沒來的：前面先加「我辭掉實習了。」）*/
  S.RULES.push(function zqNext(G){ if(!S.zqIntern(G)||typeof PHONE==='undefined'||!contact(G,ZQ)) return false; const N=EV('ev_zq_quit_intern').nextDay, d=dk('2026-10-17'); if(d==null||now(G)<T(d,20)||G.day>d+3||sent(G,'aa720_zq_next')) return false;
    const r=S.r(G,'ev_zq_quit_intern'); if(r.st==='planned'||r.st==='offer') return false; const L=(r.st==='done'?[]:[Q('zqQuitNo')]).concat(N.msgs); const M=S.msgs(G,ZQ,L); M[M.length-1].ask=S.askOf(G,'zq_next',ZQ,N.opts,T(d+3,24)); PHONE.at(G,d,20,M,'aa720_zq_next'); return true; });
  S.ON.zq_next=()=>{}; S.OPTS.zq_next=()=>EV('ev_zq_quit_intern').nextDay.opts; S.WHO.zq_next=ZQ;
  /* 大二上兩則動態（AA_505）：第 5 週（zq1c）、1/9（zq4c）intern 版換圖、換選項 */
  S.zqFeedPatch=function(G,p){ if(!p||p.who!==ZQ||!S.zqIntern(G)) return p;
    const C=((BLK('zq_intern')||{}).demoJan9||{}).captions||{};   /* 說明文字（ee689cfb8 demoJan9.captions：intern 版 zq1c「第一關」、zq4c「第二關」）*/
    if(p.id==='zq1c') return Object.assign({},p,{pic:Q('zqW5Pic'),dm:[Q('zqW5Opt'),Q('zqW5R1'),Q('zqW5R2')]},C.zq1c?{say:C.zq1c}:null);
    if(p.id==='zq4c'){ const v=(S.dec(G,ZQ,'level')||{}).v||'cat', sc=Q({shop:'zqJ9shop',tainan:'zqJ9tainan'}[v]||'zqJ9cat'); return Object.assign({},p,{pic:String(p.pic).replace(Q('zqJ9Orig'),'第二關，'+sc),cm:[Q('zqJ9Cm'),Q('zqJ9CmR')]},C.zq4c?{say:C.zq4c}:null); }
    return p; };
  S.patchFeed=function(){ if(typeof FEED==='undefined'||!FEED.blocked||FEED.blocked.aa720) return false; const b0=FEED.blocked; const b1=function(G,p,w){ if(p&&p.who===ZQ&&S.ZQ_CLOSED.includes(p.id)&&S.zqIntern(G)) return 'aa720'; return b0.apply(this,arguments); }; b1.aa720=true; FEED.blocked=b1;
    if(FEED.dmBlocked&&!FEED.dmBlocked.aa720){ const d0=FEED.dmBlocked; const d1=function(G,q){ if(q&&q.id==='yt_pass'&&S.ytPassClosed(G)) return 'aa720'; return d0.apply(this,arguments); }; d1.aa720=true; FEED.dmBlocked=d1; }   /* AA_719 YT-2 closes：7/3 那則私訊「上了。」「雙主修。」改成見面講 */
    return true; };

  /* 她辭掉延長的實習了（altIntern 第 15 則的前／後，ARCS.COND.zqQuitIntern）：演過騎樓那一場（ZQ_QUIT_INTERN），或 10/17 20:00 那則傳了（沒去、不回的版本她也辭了：「我辭掉實習了。」）*/
  S.zqQuit=G=>!!G&&!!G.flags&&(G.flags.ZQ_QUIT_INTERN===true||sent(G,'aa720_zq_next'));
  /* 1/9 資工系館 demo（termend_lines.js C15.zq_demo）intern 版：照 ZQ-2 的值（還沒決定＝default／cat）換四句——
     「第三關。橋是新的。」＝demoJan9.intern（ee689cfb8）；「一隻貓站在一座橋上」那句旁白、「你在橋的一半掉下去」那句旁白、「……第三關太難了。我回去改。」＝wiringAnswers2.3 那個值的三句（075eae472，import_aa720.py DEMO3 → cfg.demo3，整句換）*/
  S.zqDemoLine=G=>{ const I=((BLK('zq_intern')||{}).demoJan9||{}).intern||{}, v=(S.dec(G,ZQ,'level')||{}).v; return I[v]||I.default||null; };
  S.zqDemo3=G=>{ const D=(A()&&A().cfg.demo3)||{}, v=(S.dec(G,ZQ,'level')||{}).v; return D[v]||D.cat||null; };   /* wiringAnswers2.3 default：沒有 ZQ-2 值＝cat */
  S.patchDemo=function(){ const C=typeof TERMEND_LINES!=='undefined'&&TERMEND_LINES.C15&&TERMEND_LINES.C15.zq_demo; if(!C||C.aa720) return false; const L0=C.lines;
    C.lines=function(G){ const L=typeof L0==='function'?L0.apply(this,arguments):L0; if(!G||!S.zqIntern(G)||!Array.isArray(L)) return L; const t=S.zqDemoLine(G), V=S.zqDemo3(G);
      const nar=(x,k)=>!!x&&typeof x.narr==='string'&&!!Q(k)&&x.narr.includes(Q(k)), her=(x,t0)=>!!x&&x.who===ZQ&&x.text===t0;
      return L.map(x=>{ if(t&&her(x,Q('zqDemoOrig'))) return Object.assign({},x,{text:t}); if(!V) return x;
        if(nar(x,'zqDemoNarr')) return Object.assign({},x,{narr:V[0]}); if(nar(x,'zqDemoFall')) return Object.assign({},x,{narr:V[1]}); if(her(x,Q('zqDemoHard'))) return Object.assign({},x,{text:V[2]}); return x; }); };
    C.aa720=true; return true; };
  /* ZQ-2 的 after（AA_719，DECIDE_RULES.afterQ）：2028-03-08 總圖二樓測試版那一場（zq_testbuild3d.js），「第三關是九份…」那一句之前（沒有九份就在選項之前）她說第二關——shop、tainan 各一句；cat＝原本 */
  const DQ=k=>(typeof DECIDE_RULES!=='undefined'&&DECIDE_RULES.afterQ&&DECIDE_RULES.afterQ[k])||null;
  S.patchTestBuild=function(){ if(typeof ZQTB==='undefined'||!ZQTB.EVENT||ZQTB.EVENT.aa720||!DQ('zqTbShop')) return false; const D=ZQTB.EVENT.dialogue; if(!Array.isArray(D)) return false;
    let i=D.findIndex(l=>l&&l.speaker===ZQ&&l.text==='第三關是九份，燈籠那關。你回去自己玩。'); if(i<0) i=D.findIndex(l=>l&&Array.isArray(l.choice)); if(i<0) return false;
    D.splice(i,0,{if:{custom:G=>law(G)&&S.is(G,ZQ,'level','shop')},speaker:ZQ,text:DQ('zqTbShop')},{if:{custom:G=>law(G)&&S.is(G,ZQ,'level','tainan')},speaker:ZQ,text:DQ('zqTbTainan')});
    ZQTB.EVENT.aa720=true; return true; };

  /* ================= 學姊：考前一晚之後；Alison 猜到；阿哲被問 ================= */
  S.patchSisExam=function(){ if(typeof SISG==='undefined'||!SISG.breakRules||SISG.breakRules.aa720) return false; const b0=SISG.breakRules; const b1=function(G,t){ const d=dk('2026-02-02'), A=EV('ev_sis_last_night').after;
      if(d!=null&&F(G).SIS_LAST_NIGHT===true&&t>=T(d,17.5)&&t<T(d+3,0)&&!sent(G,'sisg_exam_done')&&typeof PHONE!=='undefined') PHONE.at(G,d,17.5,S.msgs(G,SIS,A.msgs),'sisg_exam_done');   /* 取代 alone 那則考完的訊息（同一個 tag）*/
      return b0.apply(this,arguments); }; b1.aa720=true; SISG.breakRules=b1; return true; };
  S.knows=G=>!!(G.flags&&G.flags.KNOWS_SIS_ALISON);
  S.RULES.push(function sisGuess(G){ if(!law(G)||!S.is(G,SIS,'tell_sis','guess')) return false; const r=S.r(G,'ev_sis_alison_guess'); if(r.st) return false; const d=S.decDay(G,SIS,'tell_sis'); if(d==null||now(G)<T(d+5,22)) return false;
    const E=EV('ev_sis_alison_guess'); if(S.knows(G)&&met('yu')&&contact(G,'yu')&&typeof PHONE!=='undefined'){ const L=S.msgs(G,'yu',E.withKnows.dm.msgs,'p:yu'); L[L.length-1].ask=S.askOf(G,'ev_sis_alison_guess','yu',E.withKnows.opts,T(d+8,24),'p:yu'); PHONE.at(G,d+5,22,L,'aa720_sis_guess'); r.st='dm'; F(G).SIS_FAMILY_KNOWS='guess'; return true; }
    r.st='next'; return true; });   /* 還不知道 Alison 是她妹妹：下一次和學姊見面她先說 */
  S.ON.ev_sis_alison_guess=(G,i)=>{ S.r(G,'ev_sis_alison_guess').k=i; };   /* rel 在 onAnswer 加給學姊（這一場的 who）*/
  S.OPTS.ev_sis_alison_guess=()=>EV('ev_sis_alison_guess').withKnows.opts;
  S.sisNextSay=async function(GM,who,id){ const G=GM&&GM.G; if(!G||id!==SIS) return false; const r=S.r(G,'ev_sis_alison_guess'); if(r.st!=='next') return false; r.st='done'; r.day=G.day; F(G).SIS_FAMILY_KNOWS='guess'; await S.play(GM,SIS,EV('ev_sis_alison_guess').noKnows.lines); return true; };
  /* 阿哲被問：決定那天以後，下一次公法讀書會散場（活動結束後接著演，classes3d.js afterActivity）*/
  S.zheEvent={ id:'ev_sis_alison_asks_zhe', title:'公法讀書會', participants:[], location:'any', afterActivity:'public_law_group', once:true, background:'blur',
    prereq:{custom:G=>law(G)&&S.is(G,SIS,'tell_sis','zhe')&&met('zhe')&&G.day>S.decDay(G,SIS,'tell_sis')&&!S.r(G,'ev_sis_alison_asks_zhe').st},
    dialogue:[{call:async(G,GM)=>{ const E=EV('ev_sis_alison_asks_zhe'), V=S.knows(G)&&met('yu')?E.withKnows:E.noKnows, r=S.r(G,'ev_sis_alison_asks_zhe'), seen=new Set(); r.st='playing';
      F(G).SIS_FAMILY_KNOWS=E.set.SIS_FAMILY_KNOWS; await S.play(GM,SIS,V.scene); const c=await S.choose(GM,SIS,V.opts,seen); r.k=c.k; r.st='done'; r.knows=V===E.withKnows; }}] };

  /* ================= 沛珊：放榜（2027-08-06；ee689cfb8 wiringAnswers 2）=================
     09:58 她先傳兩則「上了。」「台南。教育系。」（不用回、沒有選項）；psresults3d.js 原本 10:00「你現在在哪？」、10:02 客運兩則、12:00 總圖台階全部照演（「放榜那天，我先傳給你。」＝她先傳結果，再來找你）。
     只給 psresults3d.js 那一版的玩家（那天和她交往中、還沒演過）；4f37a68bb 的「……我可以打給你嗎？」＋三個選項作廢。*/
  S.PS_RESULT_H=9+58/60;
  S.psResult=function(G){ if(!law(G)||!S.is(G,PS,'tell','before')||typeof PHONE==='undefined') return false; const B=BLK('ps_result'), d=dk('2027-08-06'); if(d==null||G.day!==d||now(G)<T(d,S.PS_RESULT_H)||sent(G,'aa720_ps_result')||F(G).PS_RESULTS) return false;
    if(!(typeof PSR!=='undefined'&&PSR.on?PSR.on(G):S.dating(G,PS))) return false;
    PHONE.at(G,d,S.PS_RESULT_H,S.msgs(G,PS,B.msgs),'aa720_ps_result'); return true; };
  S.RULES.push(S.psResult);
  /* psresults3d.js 的手機規則比這裡早掛：在它前面先做（換掉 STORY.PHONE_RULES 裡那一個）*/
  S.patchPsr=function(){ if(typeof PSR==='undefined'||!PSR.phone||typeof STORY==='undefined'||!Array.isArray(STORY.PHONE_RULES)) return false; const i=STORY.PHONE_RULES.indexOf(PSR.phone); if(i<0) return false;
    const p0=PSR.phone, p1=function(G){ try{ S.psResult(G); }catch(e){ console.warn('AA720P.psResult',e); } return p0.apply(this,arguments); }; STORY.PHONE_RULES[i]=p1; return true; };

  /* ================= 可昕：quiet、eat、每週那一格、等了一個小時 ================= */
  S.RULES.push(function kxQuiet(G){ if(!law(G)||!S.is(G,KX,'after_fail','quiet')||typeof PHONE==='undefined'||!contact(G,KX)) return false; const d=S.decDay(G,KX,'after_fail'); if(d==null||now(G)<T(d+8,21)||sent(G,'aa720_kx_quiet')) return false;
    const B=BLK('kx_quiet'), L=S.msgs(G,KX,B.msgs); L[L.length-1].ask=S.askOf(G,'kx_quiet',KX,B.opts,T(d+11,24)); PHONE.at(G,d+8,21,L,'aa720_kx_quiet'); return true; });
  S.ON.kx_quiet=()=>{}; S.OPTS.kx_quiet=()=>BLK('kx_quiet').opts; S.WHO.kx_quiet=KX;
  S.RULES.push(function kxEat(G){ if(!law(G)||!S.is(G,KX,'after_fail','eat')) return false; const r=S.r(G,'kx_eat'); if(r.st) return false; const d=S.decDay(G,KX,'after_fail'); if(d==null||G.day!==d){ r.st='na'; return false; }
    const h=Math.min((+G.hour||0)+1,21); if(h<=(+G.hour||0)+0.25){ r.st='na'; r.why='太晚'; return false; } S.planOut(G,'kx_eat',{d,h}); return true; });
  S.K.kx_eat.after=(G,GM)=>{ const c=S.EAT_COST; if((G.money|0)>=c){ G.money=(G.money|0)-c; S.r(G,'kx_eat').paid=c; if(GM&&GM.toast) GM.toast('付了三碗（－'+c+' 元）',2400); } };
  S.K.kx_eat.missedFn=G=>{ S.r(G,'kx_eat').st='missed'; };
  /* 每週那一格（wed／sat；KX_SLOT_LATE=sat 也算）：那週還沒約她＝週三 18:00／週六 11:00 她傳；答應＝照一般的約（INV）排那一格 */
  S.slotOf=G=>{ if(S.is(G,KX,'slot','wed')) return 'wed'; if(S.is(G,KX,'slot','sat')||F(G).KX_SLOT_LATE==='sat') return 'sat'; return null; };
  const weekOf=d=>{ const w=wdOf(d), mon=d-((w+6)%7); return [mon,mon+6]; };
  S.kxBooked=function(G,a,b){ const iv=(G.invites||[]).some(q=>q&&q.who===KX&&q.day>=a&&q.day<=b&&['accepted','going','done'].includes(q.state));
    const out=(G.outings||[]).some(q=>{ if(!q||q.day<a||q.day>b||!['planned','done'].includes(q.state)) return false; const e=typeof STORY_EVENTS!=='undefined'&&q.ev?STORY_EVENTS.find(x=>x.id===q.ev):null; return !!(e&&(e.participants||[]).includes(KX))||!!(q.dateTrip&&typeof DATE!=='undefined'&&DATE.trip&&(DATE.trip(G,q.dateTrip)||{}).who===KX); });
    return iv||out; };
  S.SLOT={wed:{wd:3,ask:18,h:19,place:'noodle'},sat:{wd:6,ask:11,h:14,place:'cafe'}};   /* 稿「七點。公館。」「下午兩點」；地點：公館燒臘（公館）、2:30 AM（「你決定」：LAWWW 先排這一家）*/
  S.RULES.push(function kxSlot(G){ const s=S.slotOf(G); if(!s||!law(G)||typeof PHONE==='undefined'||!contact(G,KX)) return false; const C=S.SLOT[s], d=G.day; if(wdOf(d)!==C.wd||now(G)<T(d,C.ask)||(+G.hour||0)>=C.h) return false;
    const st=S.is(G,KX,'slot',['wed','sat'])?S.decDay(G,KX,'slot'):(S.r(G,'ev_kx_waited').slot||{}).d; if(st==null||d<=st) return false; const tag='aa720_kxslot_'+d; if(sent(G,tag)) return false;   /* 決定那天的隔天起（等了一個小時那天才定週六的＝那天以後）*/
    if(typeof STORY!=='undefined'&&STORY.presence&&STORY.presence(KX,G).here===false) return false; const [a,b]=weekOf(d); if(S.kxBooked(G,a,b)) return false;
    const B=BLK('kx_slot')[s], L=S.msgs(G,KX,B.ask.msgs); L[L.length-1].ask=S.askOf(G,'kx_slot_'+s,KX,B.opts,T(d,C.h-0.25)); PHONE.at(G,d,C.ask,L,tag); return true; });
  for(const s of ['wed','sat']){ S.OPTS['kx_slot_'+s]=()=>BLK('kx_slot')[s].opts; S.WHO['kx_slot_'+s]=KX; }
  for(const s of ['wed','sat']) S.ON['kx_slot_'+s]=(G,i,m,op)=>{ if(!op||!op.plan||typeof INV==='undefined'||!INV.accept) return; const C=S.SLOT[s]; if(!INV.place||!INV.place(C.place)) return; INV.accept(G,KX,C.place,G.day,C.h,{by:'her'}); };
  /* 一般的約（INV）約到那一格：她答應的那一句照 accept 輪流 */
  S.patchInv=function(){ if(typeof INV==='undefined'||!INV.personal||INV.personal.aa720) return false; const p0=INV.personal; const p1=function(G,id,P,day,h,r){ const out=p0.apply(this,arguments); if(id!==KX||!out||out.res!=='accept') return out; const s=S.slotOf(G); if(!s) return out;
      const C=S.SLOT[s], inSlot=s==='wed'?wdOf(day)===3&&h>=19&&h<22:wdOf(day)===6&&h>=13&&h<17; if(!inSlot) return out; const r2=S.r(G,'kx_slot'), A=BLK('kx_slot')[s].accept, i=(r2.acc|0)%A.length; r2.acc=(r2.acc|0)+1; return Object.assign({},out,{lines:[A[i]]}); }; p1.aa720=true; INV.personal=p1; return true; };
  /* 等了一個小時（show）：決定那天的下一個學期第 3 週週六；那一週（一～五）沒約過她 */
  S.kxWaitDay=function(G){ const d0=S.decDay(G,KX,'slot'); if(d0==null||!Array.isArray(CALENDAR.TERMS)) return null; const L=CALENDAR.TERMS.map(t=>({t,s:dk(t.start)})).filter(x=>x.s!=null&&x.s>d0).sort((a,b)=>a.s-b.s); if(!L.length) return null; const mon=L[0].s; return mon+(3-1)*7+5; };   /* 學期第一天是週一：第 3 週週六＝+19 */
  S.RULES.push(function kxWait(G){ if(!law(G)||!S.is(G,KX,'slot','show')) return false; const d=S.kxWaitDay(G), r=S.r(G,'ev_kx_waited'), E=EV('ev_kx_waited'); if(d==null) return false;
    if(!r.st&&now(G)>=T(d,10)&&G.day<=d){ if(S.kxBooked(G,d-5,d-1)){ r.st='skip'; F(G).KX_WAITED='skip'; r.shown=d; return true; }
      if(!contact(G,KX)||typeof PHONE==='undefined'){ r.st='na'; return false; } PHONE.at(G,d,10,S.msgs(G,KX,E.ask.msgs),'aa720_kx_wait_ask'); r.st='asked'; r.phase='show'; r.slot={d,h:16};
      if(typeof OUT!=='undefined') OUT.plan(G,{id:'aa720_kx_waited',ev:'ev_kx_waited',day:d,h:16,late:0.25,place:'公館捷運站',title:'公館捷運站（可昕）',travel:'',travelH:0.25,alarm:true}); return true; }
    if(r.st==='asked'&&r.phase==='show'&&now(G)>=T(d,17)&&typeof PHONE!=='undefined'&&!sent(G,'aa720_kx_wait_late')){ r.phase='late'; const idx=E.late.opts.map((o,i)=>i).filter(i=>i!==0||S.inTaipei(G)); const L=S.msgs(G,KX,E.late.msgs); L[L.length-1].ask=S.askOf(G,'ev_kx_waited',KX,idx.map(i=>E.late.opts[i]),T(d,19),null,idx); PHONE.at(G,d,17,L,'aa720_kx_wait_late'); return true; }
    if(r.st==='asked'&&r.phase==='late'&&now(G)>=T(d,19)&&r.k==null){ r.phase='none'; F(G).KX_WAITED='nothing'; S.rel(KX,E.late.opts[2].rel); const t=TIMED.exec(E.late.opts[2].say[0]); if(t&&typeof PHONE!=='undefined') PHONE.at(G,d,19,[S.item(G,'p:'+KX,KX,t[3])],'aa720_kx_wait_19'); return true; }   /* 一直沒回＝（不回）：19:00「算了。」*/
    return false; });
  S.inTaipei=G=>!(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G))&&!(typeof HOME!=='undefined'&&HOME.away&&HOME.away(G));
  S.OPTS.ev_kx_waited=()=>EV('ev_kx_waited').late.opts;
  S.ON.ev_kx_waited=(G,i)=>{ const r=S.r(G,'ev_kx_waited'); r.k=i;
    if(i===0){ r.phase='late_go'; const t=now(G)+1/3, d=Math.floor(t/24); if(typeof OUT!=='undefined') OUT.plan(G,{id:'aa720_kx_waited_late',ev:'ev_kx_waited',day:d,h:t-d*24,late:0.25,place:'公館捷運站',title:'公館捷運站（可昕）',travel:'',travelH:1/3,alarm:true}); }
    else { r.phase='none'; F(G).KX_WAITED='nothing'; } };
  S.kxWaitEvent={ id:'ev_kx_waited', title:'公館捷運站（可昕）', participants:[KX], location:'any', trigger:'outing', once:false, background:'dark', hours:2,
    dialogue:[{scene:'公館捷運站',bg:BG_GG()},{call:async(G,GM)=>typeof LIBQ!=='undefined'&&LIBQ.loud?LIBQ.loud(()=>S.kxWaitPlay(G,GM)):S.kxWaitPlay(G,GM)}],
    outingMissed:(G,GM,q)=>{ const r=S.r(G,'ev_kx_waited'); if(q&&q.id==='aa720_kx_waited_late'){ r.phase='none'; F(G).KX_WAITED='nothing'; } } };
  S.kxWaitPlay=async function(G,GM){ const E=EV('ev_kx_waited'), r=S.r(G,'ev_kx_waited');
      if(r.phase==='late_go'){ await S.play(GM,KX,E.scene.lines); const c=await S.choose(GM,KX,E.scene.opts); r.sk=c.k; F(G).KX_WAITED='late'; r.st='done'; return; }
      await S.play(GM,KX,E.showUp.lines); F(G).KX_WAITED='came'; r.st='done'; };
  function BG_GG(){ return (A()&&A().cfg.bg.ev_kx_waited)||'gongguan'; }
  /* 那一週約過她（skip）：下一次見面她多一句「這週你有出現。」（一次；七天內）*/
  S.kxShownSay=async function(GM,who,id){ const G=GM&&GM.G; if(!G||id!==KX) return false; const r=S.r(G,'ev_kx_waited'); if(r.st!=='skip'||r.shownSaid||r.shown==null||G.day>r.shown+7) return false; r.shownSaid=G.day; await GM.say(S.herObj(KX),Q('kxWeekShown')); return true; };

  /* ================= 可昕：等了一個小時以後兩天（kx_waited_after，ee689cfb8）=================
     KX_WAITED＝late（「我現在過去」、到了演那一場）或 nothing（不回、「我忘了」、答應了沒到）：那個週六（剩下的時間）和之後兩天，你傳訊息給她（MSG.send），她只回一句，照 kx_waited_after 六句輪流（用完從頭）；第三天起照常。
     came（16:15 以前到、她沒說什麼）、skip（那週約過她）不算。*/
  S.kxAfterLine=function(G,id){ if(id!==KX||!law(G)) return null; const w=F(G).KX_WAITED; if(w!=='late'&&w!=='nothing') return null; const r=S.r(G,'ev_kx_waited'), d=r.slot&&r.slot.d; if(d==null||G.day<d||G.day>d+2) return null;
    const L=(BLK('kx_waited_after')||{}).lines; if(!Array.isArray(L)||!L.length) return null; const R=S.r(G,'kx_waited_after'), i=(R.n|0)%L.length; R.n=(R.n|0)+1; R.last=G.day; return text(G,L[i]); };

  /* ================= AA_719 after 的句子接到原本的訊息（DECIDE_RULES.afterQ；PHONE.at 照 tag 換）=================
     - a118_y2s2_an_expo_0（aa555_3d.js 以安 3/18 說明會之後那則）：AN-1 first、說明會那一場有去（AN_EXPO＝went）＝換「…你那天坐我旁邊，第三頁的時候睡著了。」；missed／declined 照原本（AA_720 ev_an_expo_together note）
     - y3_an_sendoff_miss（y34b3d.js 3/25 11:40 登機證那幾則）：AN-2 alone＝出國那天只有一則「我上飛機了。」
     - y2r2_zr_admit（y2r2_3d.js 交往中 5/11 22:40「信來了。」「……錄取了。」）：ZR-1 scholar／both＝「……錄取了。」後面多一句「獎學金拿到一半。」*/
  S.AT_FIX={
    a118_y2s2_an_expo_0:(G,L)=>law(G)&&S.is(G,AN,'jp_tell','first')&&F(G).AN_EXPO==='went'&&DQ('anExpoFirst')?L.map(m=>m&&m.from===AN?Object.assign({},m,{text:DQ('anExpoFirst')}):m):null,
    y3_an_sendoff_miss:(G,L)=>law(G)&&S.is(G,AN,'grad','alone')&&DQ('anPlane')&&L.length?[Object.assign({},L.find(m=>m&&m.from===AN)||L[0],{text:DQ('anPlane')})]:null,
    y2r2_zr_admit:(G,L)=>{ if(!law(G)||!S.is(G,ZR,'fund',['scholar','both'])||!DQ('zrScholarHalf')) return null; const i=L.findIndex(m=>m&&m.text==='……錄取了。'), j=i>=0?i+1:Math.max(0,L.length-1); const m0=L[Math.max(0,j-1)]||{};
      return L.slice(0,j).concat([{th:m0.th||'p:'+ZR,from:ZR,text:DQ('zrScholarHalf')}],L.slice(j)); } };
  S.patchPhoneAt=function(){ if(typeof PHONE==='undefined'||!PHONE.at||PHONE.at.aa720) return false; const a0=PHONE.at;
    const a1=function(G,day,h,items,tag){ const f=tag&&S.AT_FIX[tag]; if(f&&G&&!(PHONE.sent&&PHONE.sent(G,tag))){ try{ const L=f(G,[].concat(items)); if(L) items=L; }catch(e){ console.warn('AA720P.at',tag,e); } } return a0.apply(this,[G,day,h,items,tag].concat([].slice.call(arguments,5))); };
    a1.aa720=true; PHONE.at=a1; return true; };

  /* ================= 尾聲（endings；PG.epiLine 包一層）================= */
  S.endExtra=function(G,id){ const E=(DATA().endings||{})[id], C=A()&&A().cfg.endIf[id]; if(!E||!C) return [];
    const partner=typeof PG!=='undefined'&&PG.dating?PG.dating(G,id):S.dating(G,id), side=partner?'partner':'friend'; const out=[];
    for(let i=0;i<E[side].length;i++){ if(!S.cond(G,C[side][i])) continue; if(id===SIS&&side==='partner'&&/^dec:heroine_05\.tell_sis=guess$/.test((C[side][i][0]||[])[0]||'')&&!S.knows(G)) continue;   /* guess 那句要 KNOWS_SIS_ALISON（沒有就往下找）*/
      out.push([id,E[side][i].line]); break; }
    if(partner&&E.confFail&&G.flags&&G.flags.CONF_FAIL&&G.flags.CONF_FAIL[id]!=null) out.push([id,E.confFail]);   /* 第一次告白失敗過（AA_723）：partner 那一句之後再加 */
    return out; };
  S.patchEpi=function(){ if(typeof PG==='undefined'||!PG.epiLine||PG.epiLine.aa720) return false; const e0=PG.epiLine; const e1=function(G,id){ const r=e0.apply(this,arguments); if(!r||!A()) return r; const x=S.endExtra(G,id); return x.length?r.concat(x):r; }; e1.aa720=true; PG.epiLine=e1; return true; };

  /* ================= 在場景裡（STORY.TICKS）：Café 的信、店後門的滷肉作法、宿舍房間的第一封信、一盞（走進去）================= */
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['aa720_3d:busy']=()=>{ busy=false; };
  S.sceneTick=function(GM){ const G=GM&&GM.G; if(busy||!G||!A()) return null; if(GM.D&&GM.D.active) return null; if(GM.E&&GM.E.player&&GM.E.player.busy) return null;
    let f=null; if(S.letterDue(G)!=null) f=S.letter; else if(S.recipeDue(G)) f=S.recipe; else if(S.letter1Due(G)&&S.LETTER_ZONES.includes(G.zone)) f=S.letter1; else if(S.ytWalkInDue(G)) f=async GM2=>S.inScene(GM2,()=>S.ytLive(GM2));
    if(S.letter1Due(G)&&!S.r(G,'zr_letters').l1toast&&now(G)>=T(G.day,22)&&GM.toast){ S.r(G,'zr_letters').l1toast=G.day; GM.toast('芷若的信',3200); }
    if(!f) return null; busy=true; return Promise.resolve(f(GM)).catch(e=>console.warn('AA720P.scene',e)).finally(()=>{ busy=false; }); };

  /* ================= 掛上去 ================= */
  S.away=function(G,d){ if(d==null) return false; if(typeof ZRSENDOFF!=='undefined'&&ZRSENDOFF.away) return ZRSENDOFF.away(G,d); return typeof STORY!=='undefined'&&STORY.abroad?!!STORY.abroad(Object.assign({},G,{day:d})):false; };
  S.EVENTS=()=>['ev_an_expo_together','ev_an_grad_think','ev_zr_call_mom','ev_zr_scholar_1','ev_zr_scholar_2','ev_zr_return_airport','ev_yt_result_together','ev_zq_quit_intern','ev_sis_last_night','ev_sis_grandma_dinner','ev_ps_before_leave','ev_ps_station_sendoff','ev_kx_mock_interview','kx_eat'].map(k=>S.event(k)).concat([S.zrCallEvent,S.kxWaitEvent,S.zheEvent]);
  S.install=function(){ if(!A()) return false;
    if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS()) if(!STORY_EVENTS.some(x=>x&&x.id===e.id)) STORY_EVENTS.push(e);
    if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)&&!STORY.PHONE_RULES.includes(S.tick)) STORY.PHONE_RULES.push(S.tick); if(Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.sceneTick)) STORY.TICKS.push(S.sceneTick);
      if(Array.isArray(STORY.PRE_TALK)){ for(const f of [S.sisNextSay,S.kxShownSay]) if(!STORY.PRE_TALK.includes(f)) STORY.PRE_TALK.push(f); } }
    if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)&&!PHONE.ON_ANSWER.includes(S.onAnswer)) PHONE.ON_ANSWER.push(S.onAnswer);
    if(typeof DECIDE!=='undefined'){ if(Array.isArray(DECIDE.AFTER_SAY)&&!DECIDE.AFTER_SAY.includes(S.afterSay)) DECIDE.AFTER_SAY.push(S.afterSay); if(Array.isArray(DECIDE.MSG_ASK)&&!DECIDE.MSG_ASK.includes(S.msgAsk)) DECIDE.MSG_ASK.push(S.msgAsk); }
    if(typeof INV!=='undefined'&&INV.meetOpen&&!INV.meetOpen._aa720){ const M0=INV.meetOpen; const M1=async function(GM,iv,who,o){ const r=await M0.apply(this,arguments); try{ await S.sisNextSay(GM,who,iv&&iv.who); await S.kxShownSay(GM,who,iv&&iv.who); }catch(e){ console.warn('AA720P.meetOpen',e); } return r; }; M1._aa720=true; Object.keys(M0).forEach(k=>{ if(k!=='_aa720') M1[k]=M0[k]; }); INV.meetOpen=M1; }   /* 約好的見面開場（同 CF723 normalSay）*/
    S.patchSendoff(); S.patchZrSendoff(); S.patchPostcards(); S.patchE07(); S.patchYT(); S.patchArcs(); S.patchFeed(); S.patchSisExam(); S.patchInv(); S.patchEpi(); S.patchPsr();
    S.patchFeedPost(); S.patchDemo(); S.patchTestBuild(); S.patchPhoneAt(); S.patchBday(); S.patchAdmitted();
    if(typeof MSG!=='undefined'&&Array.isArray(MSG.REPLY_OVERRIDE)&&!MSG.REPLY_OVERRIDE.includes(S.kxAfterLine)) MSG.REPLY_OVERRIDE.push(S.kxAfterLine);
    return true; };
  /* 動態換圖、換選項（zq1c、zq4c）*/
  S.patchFeedPost=function(){ if(typeof FEED==='undefined'||!FEED.post||FEED.post.aa720) return false; const g0=FEED.post; const g1=function(id,G){ const p=g0.apply(this,arguments); return G?S.zqFeedPatch(G,p):p; }; g1.aa720=true; FEED.post=g1; return true; };   /* 動態的圖、選項（FEED.card、answer 都用 S.post(id,G)）*/
  S.install();
  return S;
})();

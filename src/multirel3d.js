/* ===== 多線交往：知情、發現、挽回、結果（EVPKG-AA227-228-KNOW，USER_WANTS D35★；台詞 src/data/multirel_lines.js）=====
   定稿：AA_422（第一批）@5156f143、AA_423（第二批）@26357a44；AA_421 第 2 節（要做什麼）；機制 BB_194（第 2～10、13、16、19、22 節）。AA-B 2026-10-23（D109）。
   接在既有的系統上（不改它們的檔案，包一層）：romance3d.js（ROM：knowsRel、ROM.learn、ROM.knows、ytAnswer、PARAMS.acceptsOpen）、termend3d.js（心意邀約的回家路上 walkHome、heartWhy）、
   date3d.js（第一次正式校外約會的開頭 arriveLine、quickPick、scene、complete、menu）、story3d.js（TICKS、PHONE_RULES、PRE_TALK、TALK_OPTS、talkCharacter、在家的 y4HomeDue）、events3d.js（EVENTS.run：麵店團說溜嘴）。
   一、第一次 L3 的問句（AA_422 0-1）：她知道祐廷正在和別人交往（TERMEND.knownOthers，沒有 OPEN_OK）、她還沒在和祐廷交往，那之後第一次正式校外約會的到達那一句之後、第一個互動點之前，一位一次。
       記 <X>_ASKED_GF（AN／SIS／ZQ／ZR／YT（語彤）／PS）＝那一天；選項的 yt 照 ROM.ytAnswer 記 YT_HONEST／YT_DODGED。這一趟不出「快速約會」（才演得到開頭）。芷若第二問（5-2）也在這裡。
   二、知情版心意邀約（0-2）：回家路上她知道祐廷還在和別人交往＝換成 KNOW[她]；答應照 ROM.PARAMS.acceptsOpen（使用者 10-27 回答 C：七位都打開，AA_474；她的條件＝發邀約以前的 S.KNOWS_OK）；承諾記 YT_PROMISED[她]＝'exclusive'／'handle:<Y>'；
       不接受、說要處理、不知道＝這學期的「讓我想想」（G.termend.think）。下學期她再約：承諾做到了＝照原本的第二次（termend3d.js）；沒做到＝YT_BROKE_PROMISE[她]＋BROKE[她]，之後那一段還在的學期她不發心意邀約（heartWhy）。
       學姊（AA_474 1-2）：「她說可以。」第一次一律讓我想想；第二次（下學期）知情條件＋沒說謊＋中間兩次 L1／L2 才接受（S.sis2Ok）。
       芷若三個問題分三次（第一次邀約、之後第一次正式約會、下學期邀約），三次都照實＋acceptsOpen 才接受。可昕（分手後重新開始）要等 TERMEND_LINES.HEART.kexin（AA_254 第 7 節：還沒有她的心意邀約）。
       特別場景（七夕、七月最後一次、芷若 8/26、學姊大峽谷、學姊重新開始的告白）開始交往的那一刻她知道＝同一套（S.knowGate，AA_474 3b）。
   三、發現（0-3）：她和祐廷交往中、在交往期間經任何來源知道 Y（knowsRel 的 day ≥ 她那一段的開始日）、沒有 OPEN_OK、還沒演過這一對、不是祐廷自己說的 → G.flags.MREL.pend[她]。
       演的時機：以安＝和她說話、和她的正式約會、或公法讀書會散會（21:30 人在萬才館）；書瑀＝說話、正式約會；沛珊＝散會後回女舍的路上（只有 2026-10-01～12-16 學到的）；語彤＝她顧店的時候來麵店；
       子晴＝那天晚上 22:00 以後（男宿樓下；在家＝家那站出口）；芷若＝她上班的晚上留到打烊（人在 Café、她的班要結束）；可昕＝當晚 21:30 她打來、過來。她在國外或祐廷在國外＝演出來的視訊（沛珊在台南／台中＝電話）。
       版本：說會怎樣卻沒做到（broke）＞還有誰（她已經知道別的一段：more）＞李冠宏看到的（書瑀）＞一般（base，含各種變體）。以安 × 書瑀的法圖相遇（lawlib_meet）走 1A-02 的攤牌，子晴 × 芷若兩人都在交往走《星期五下午》，不在這裡。
       知道的來源另外加：讀書會散會以安→沛珊、週五子晴⇄芷若照 ROM.SPREAD 的時刻傳開可昕以外的人（ROM 只傳可昕）；麵店團說溜嘴（可昕在場的群聚：中秋烤肉、兩個圈子那一場）；李冠宏看到（和書瑀交往以後第二次在雙北和 Y 正式約會，隔天）。
       祐廷先坦白（以安、沛珊有台詞）：和她說話時的選項「我有件事要跟妳講。」／「那我也跟妳講一件事。」→ ROM.tellBy、YT_CONFESSED[她][Y]、演坦白版。沛珊還有還沒交往那一版（「我也喜歡另一個女生。」，S.likes）。
       沛珊：宥辰的三次互動、《換我講一件事》（PS_CONFESSED）、台南那幾年在「去台南找她的那一次」演（src/hometown3d.js 叫 MREL.hvMeet），那學期沒去＝電話（見「沛珊」那一節）。
   四、挽回、結果（AA_423）：發現以後 MREL.st[她]＝{y, n（第幾次冷靜）, day, …}；各人的流程見下面 FLOW。系統不自己分手：只有結果事件的 D、B 不接受。
       「接受同時交往」那一格照 ROM.PARAMS.acceptsOpen（AA_423 第 0 節；使用者 10-27 回答 C：七位都打開，條件照各人的結果，AA_474 第 4 節第 3 點不改）。祐廷的心意記 YT_INTENT[她]；AN_TALKED、AN_WILLING、SIS_TALKED、KX_TALKED（BB_194 §9 的名字）。
       可昕接受以後可以收回（AA_474 第 3 節，S.kxWithdraw）：①又說謊、②又和第三個人開始交往她從別人那裡先知道、③每個學期末她的戀愛 < 80 ＝下一次見面（公館捷運出口；國外、她在高雄＝視訊）；≥ 70 回 B（我們的日子暫停）、< 70 分手。
   五、誠實／閃避／說謊（BB_194 §24，任務 BB194-YTFLAGS）：選項標 yt（honest／dodge／claimEnded／claimNone，ytAbout:'y'＝這一場的 Y）交給 ROM.ytAnswer 比事實；劇本固定、照實的那一句用 {ytRec:'honest'}。
   存檔：G.flags.MREL＝{v, disc:{她:{Y:{day,ver}}}, pend, st, zr, zz, gh, scan, block, prom, once, like, liked, sk, sm, lc, gate, kxo, kwp}（AA_474 加的見 S.rec）、KX_WITHDREW；YT_CONFESSED／YT_PROMISED／YT_BROKE_PROMISE／YT_LIED／OPEN_OK／YT_INTENT 舊存檔沒有＝{}（ROM.rec 讀檔時補）；
     G.flags.PS_YC＝{n1,n2,n3}（第一次讀才建）、PS_CONFESSED（那一天）。
   測試：node tests/aa422_multirel_unit.js、node tests/aa423_multirel_unit.js、node tests/mrel_ps_turn_unit.js、node tests/aa474_acceptsopen_unit.js */
'use strict';
const MREL=(function(){
  const S={};
  const L=()=>typeof MULTIREL_LINES!=='undefined'?MULTIREL_LINES:null;
  const A1='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
  S.IDS=[A1,ZR,YT,ZQ,SIS,PS,KX];
  S.ASK_FLAG={heroine_01:'AN_ASKED_GF',heroine_05:'SIS_ASKED_GF',heroine_04:'ZQ_ASKED_GF',heroine_02:'ZR_ASKED_GF',heroine_03:'YT_ASKED_GF',classmate_peishan:'PS_ASKED_GF'};
  S.HURT={heroine_01:'AN_HURT',heroine_02:'ZR_HURT',heroine_03:'YT_HURT',heroine_04:'ZQ_HURT',heroine_05:'SIS_HURT',classmate_peishan:'PS_HURT',kexin:'KX_HURT'};   /* BB_194 §8：發現過（永遠留著）*/
  S.BASE={heroine_01:'以安',heroine_02:'芷若',heroine_03:'語彤',heroine_04:'子晴',heroine_05:'學姊',classmate_peishan:'沛珊',kexin:'可昕'};
  const T=(d,h)=>d*24+h, now=G=>T(G.day,+G.hour||0);
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const dating=(G,id)=>!!(G&&G.flags&&G.flags['dating_'+id]===true);
  const sub=(o,k)=>{ if(!o[k]||typeof o[k]!=='object') o[k]={}; return o[k]; };
  const nm=id=>typeof SOCIAL!=='undefined'?(SOCIAL.npcName?SOCIAL.npcName(id):SOCIAL.displayName(id)):id;
  const knows=(G,x,p)=>typeof ROM!=='undefined'&&ROM.knowsOf?ROM.knowsOf(G,x,p):false;
  const rom=id=>typeof SOCIAL!=='undefined'&&SOCIAL.rel?(+SOCIAL.rel(id).npcRom||0):0;
  const wdOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:0;
  const evDone=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  /* 旁邊有她的人（COMPANY-PRIV-1028，清單 src/privtalk3d.js）：問清單上那一筆（PRIVTALK.ok：等了 7 天、到期那天照出，AA_503 第 14 節共同的保底）；
     privLead＝那一段開始演（旁邊還有人＝先一句旁白，清掉等待）。sub＝同一筆裡的哪一段（各自等）*/
  const privOk=(G,x,GM,k,sub)=>typeof PRIVTALK==='undefined'||!PRIVTALK.ok||PRIVTALK.ok(G,x,k,GM,sub);
  const privLead=async(GM,k,x,sub)=>{ if(typeof PRIVTALK!=='undefined'&&PRIVTALK.lead) await PRIVTALK.lead(GM,k,x,sub); };

  /* ---------- 存檔 ---------- */
  S.FLAGS=['YT_CONFESSED','YT_PROMISED','YT_BROKE_PROMISE','YT_LIED','OPEN_OK','YT_HONEST','YT_DODGED','YT_INTENT'];
  /* 接受同時交往照 ROM.PARAMS.acceptsOpen（AA_423 第 0 節；使用者 10-27 回答 C：七位都打開，AA_474）：結果的「接受」（B／C 那一格）都要它，不然就是「不接受」那一格；真正的條件是各人自己的（結果照 BB_194，知情版心意邀約照 S.KNOWS_OK）*/
  S.acc=x=>!!(typeof ROM!=='undefined'&&ROM.PARAMS&&ROM.PARAMS.acceptsOpen&&ROM.PARAMS.acceptsOpen[x]);
  /* 祐廷的心意 YT_INTENT[她]（BB_194 §9：exclusive／both／unsure；每一場談話的選擇改寫它）*/
  S.intent=(G,x,v)=>{ if(v) S.defaults(G).YT_INTENT[x]=v; return v; };
  S.defaults=function(G){ const F=G.flags||(G.flags={}); for(const k of S.FLAGS) if(!F[k]||typeof F[k]!=='object') F[k]={}; return F; };   /* 舊存檔：曾坦白／承諾／違約／說謊／同意的紀錄＝空的（不追溯）*/
  S.rec=function(G){ const F=S.defaults(G); if(!F.MREL||typeof F.MREL!=='object') F.MREL={v:1}; const R=F.MREL; for(const k of ['disc','pend','st','zr','zz','gh','scan','block','prom','once','like','liked','cpend','rb']) sub(R,k); return R; };
  S.rs=(G,k)=>sub(S.rec(G),k);   /* 用到才建（舊存檔、沒用到的存檔不多欄位）*/
  /* AA_474 加的（用到才建：S.rs；舊存檔沒有＝空的，不追溯）：sk[學姊]＝演過知情對話沒有答應的那一次 {day,term}；sm[學姊]＝最近兩次正常見面的日子；lc[她]＝說謊記了幾次（YT_LIED 每記一次 +1）；
     gate[她]＝特別場景的知情對話（knowGate）{day,r,at}；kxo＝可昕接受那一次 {y,day,lc,since,terms}；kwp＝可昕收回還沒演 {why,y,z,day,h}（G.flags.KX_WITHDREW＝演過的那一次）*/
  S.st=(G,x)=>S.rec(G).st[x]||null;

  /* ---------- 叫法、期間（AA_422 0-4、AA_227 第二節）---------- */
  S.nameFor=function(G,x,y){ if(x===A1){ if(y===SIS) return '書瑀學姊'; if(y===ZQ) return '資工那個高子晴'; if(y===ZR) return 'Café 那個店員'; }
    if(x===KX&&!([A1,YT,PS].includes(y)&&G.flags&&G.flags.KX_MET_NOODLE_TEAM)) return '你們學校那個'+(S.BASE[y]||nm(y));   /* 可昕叫台大的人（不熟的）*/
    return S.BASE[y]||nm(y); };
  S.sinceDay=function(G,id){ if(typeof ROM==='undefined') return G.day; const R=ROM.get(G,id); if(typeof R.sinceDay==='number') return R.sinceDay;
    const s=R.since; if(typeof s==='string'){ let m=/^Y(\d)S(\d)W(\d+)$/.exec(s); if(m&&typeof STORY!=='undefined'&&STORY.termDay){ const d=STORY.termDay('Y'+m[1]+'S'+m[2],+m[3],1); if(d!=null) return d; }
      m=/^D(-?\d+)$/.exec(s); if(m) return +m[1];
      if(s==='Y0'||id===KX){ const k=G.flags&&G.flags.KX_DATING_SINCE, d=DK(typeof k==='string'?k:'2024-10-17'); if(d!=null) return d; } }
    return G.day; };   /* BB_194 §11：沒有開始日＝存檔那一天（保守，不說「瞞了很久」）*/
  S.durDays=(G,id)=>Math.max(0,G.day-S.sinceDay(G,id));
  const NUM=['零','一','兩','三','四','五','六','七','八','九','十','十一','十二'];
  S.durText=d=>d<7?'這禮拜才開始':(d<28?NUM[Math.floor(d/7)]+'個禮拜':(d<60?'一個多月':(d<365?NUM[Math.min(11,Math.floor(d/30))]+'個月':'一年多')));   /* BB_194 13-1（AA 的分級）*/
  S.dateText=d=>{ const x=CALENDAR.dateOf(d); return x.m+'月'+x.d+'號'; };

  /* ---------- 誰知道誰 ---------- */
  S.openOk=(G,x,y)=>!!(G.flags&&G.flags.OPEN_OK&&G.flags.OPEN_OK[x]&&G.flags.OPEN_OK[x][y]);
  S.knownOthers=(G,x)=>typeof ROM==='undefined'||!ROM.knows?[]:ROM.knows(G,x).filter(p=>!S.openOk(G,x,p));
  S.relAt=(G,x,y)=>{ const M=(G.flags&&G.flags.knowsRel&&G.flags.knowsRel[x])||{}; return M[y]||null; };
  S.newest=(G,x,ys)=>ys.slice().sort((a,b)=>{ const ra=S.relAt(G,x,a)||{day:-1e9,h:0}, rb=S.relAt(G,x,b)||{day:-1e9,h:0}; return T(rb.day,rb.h||0)-T(ra.day,ra.h||0); })[0]||null;
  S.lied=(G,x,y)=>!!(G.flags&&G.flags.YT_LIED&&G.flags.YT_LIED[x]&&(y?G.flags.YT_LIED[x][y]:Object.keys(G.flags.YT_LIED[x]).length));
  S.confessed=(G,x,y)=>!!(G.flags&&G.flags.YT_CONFESSED&&G.flags.YT_CONFESSED[x]&&G.flags.YT_CONFESSED[x][y]);
  S.lieCount=(G,x)=>{ const M=G.flags&&G.flags.YT_LIED&&G.flags.YT_LIED[x]; return M?Object.keys(M).filter(k=>M[k]).length:0; };
  /* 說謊記了幾次（YT_LIED 是 {她:{Y:true}}，同一位再說一次謊不會多一格；可昕收回 ①「YT_LIED.kexin 又記一筆」看這個，AA_474 第 3 節）：ROM.ytAnswer 回 'lied'、選項的 lie 各 +1 */
  S.lieN=(G,x)=>((S.rec(G).lc||{})[x]|0);
  S.lieMark=(G,x)=>{ if(!G||!x) return; const M=S.rs(G,'lc'); M[x]=(M[x]|0)+1; };

  /* ---------- 在哪裡（國外＝視訊；沛珊在台南、台中＝電話）---------- */
  const pres=(G,x)=>typeof STORY!=='undefined'&&STORY.presence?STORY.presence(x,G):{here:true};
  S.heAbroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&!!STORY.abroad(G);
  S.herAway=function(G,x){ const p=pres(G,x); if(p.here) return null; if(p.kind==='abroad'||(p.kind==='absent'&&/英國|日本|美國/.test(String(p.away||'')))) return 'video'; if(x===PS&&(p.kind==='city'||p.keep)) return 'phone'; return 'gone'; };
  S.sameCountry=function(G,x){ const r=typeof STORY!=='undefined'&&STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):null, a=String(pres(G,x).away||''); return (r==='JP'&&x===A1&&/日本/.test(a))||(r==='US'&&x===SIS&&/美國/.test(a)); };
  S.REMOTE_OK={heroine_01:true,heroine_05:true,heroine_02:true,kexin:true,classmate_peishan:true};   /* AA_422 0-3：以安日本、學姊美國、芷若英國、沛珊台南（電話）；可昕：祐廷在國外＝視訊（AA_227 5-2）*/
  S.remote=function(G,x){ const ha=S.heAbroad(G), sa=S.herAway(G,x); if(sa==='gone') return null; if(ha&&sa&&S.sameCountry(G,x)) return null; if(sa) return sa; if(ha) return 'video'; return null; };
  S.inTaiwanBoth=(G,x)=>!S.heAbroad(G)&&(()=>{ const p=pres(G,x); return p.here||p.kind==='taipei'; })();
  S.inDorm=G=>!(typeof HOME!=='undefined'&&((HOME.at&&HOME.at(G))||(HOME.movedOut&&HOME.movedOut(G))));

  /* ---------- 演出（AA 的稿照順序；字一字不改）---------- */
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  S.subst=function(t,G,c){ c=c||{}; let s=String(t);
    s=s.replace(/\{(芷若|子晴)的期間\}前/g,(m,k)=>{ const v=c[k==='芷若'?'durZr':'durZq']||''; return /開始$/.test(v)?v:v+'前'; });   /* 「這禮拜才開始」＋「前」不成句：照「這禮拜才開始」*/
    return s.replace(/\{name\}/g,G.name||'祐廷').replace(/\{她\}/g,c.her||'').replace(/\{期間\}/g,c.dur||'').replace(/\{Y\}/g,c.yName||'').replace(/\{第一位\}/g,c.first||'')
      .replace(/\{地點\}/g,c.place||'').replace(/\{D 地點\}/g,c.dloc||'').replace(/\{K7 禮物\}/g,c.k7||'').replace(/\{芷若的期間\}/g,c.durZr||'').replace(/\{子晴的期間\}/g,c.durZq||'')
      .replace(/\{子晴的日期\}/g,c.dateZq||'').replace(/\{芷若的日期\}/g,c.dateZr||''); };
  const condOk=(k,G,c)=>typeof k==='function'?!!k(G,c):(typeof k==='string'?!!(c.cond&&c.cond[k]&&c.cond[k](G,c)):!!k);
  S.who=(G,id)=>id&&typeof id==='object'?id:{name:nm(id),charId:id};
  S.say=async(GM,who,t,c)=>GM.say(who,S.subst(t,GM.G,c));
  S.run=async function(GM,x,items,c){ const G=GM.G; c=c||{}; if(c.x==null) c.x=x;
    for(let it of [].concat(items||[])){ if(c.stop) return c; if(typeof it==='function') it=it(G,c); if(it==null) continue;
      if(Array.isArray(it)){ await S.run(GM,x,it,c); continue; }
      if(typeof it==='string'){ await S.say(GM,S.who(G,x),it,c); continue; }
      if(it.end){ c.stop=true; return c; }
      if(it.if!==undefined){ await S.run(GM,x,condOk(it.if,G,c)?it.then:it.else,c); continue; }
      if(it.fx){ try{ it.fx(G,c); }catch(e){ console.warn('MREL fx',e); } continue; }
      if(it.ytRec!==undefined){ S.yt(G,c,it.ytRec); continue; }   /* 劇本固定、照實的那一句（BB_194 §24：直接記 YT_HONEST）*/
      if(it.bg!==undefined){ if(typeof ADV!=='undefined'&&ADV.setBg) ADV.setBg(it.bg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(it.bg):(it.bg||'dark')); if(it.cap&&GM.caption) GM.caption('',it.cap,2400); continue; }
      if(it.cg!==undefined){ if(typeof ADV!=='undefined'&&ADV.cg&&(typeof CG_REGISTRY==='undefined'||CG_REGISTRY[it.cg])) ADV.cg(it.cg); continue; }
      if(it.memory){ const ln=S.kxMemory(G,c); if(ln) await S.say(GM,S.who(G,x),ln,c); continue; }
      if(it.n!==undefined||it.narr!==undefined){ const t=it.n!==undefined?it.n:it.narr; await S.say(GM,null,t,c); continue; }
      if(it.p!==undefined){ await S.say(GM,{name:G.name||'祐廷'},it.p,c); continue; }
      if(it.ph!==undefined||it.pp!==undefined){ const me=it.pp!==undefined, id=it.from||x, t=S.subst(me?it.pp:it.ph,G,c);
        if(typeof PHONE!=='undefined'&&PHONE.post) PHONE.post(G,me?{th:'p:'+id,from:'player',who:null,text:t}:{th:'p:'+id,from:id,text:t});
        await GM.say({name:(me?(G.name||'祐廷'):nm(id))+'（手機）'},t); continue; }
      if(it.s!==undefined){ await S.say(GM,S.who(G,it.s),it.t,c); continue; }
      if(it.who==='narr'){ await S.say(GM,null,/^（/.test(it.text)?it.text:'（'+it.text+'）',c); continue; }   /* termend 的寫法 */
      if(it.text!==undefined){ await S.say(GM,it.who&&it.who!==x?S.who(G,it.who):S.who(G,x),it.text,c); continue; }
      if(it.c){ const O=it.c.filter(o=>o.if===undefined||condOk(o.if,G,c)); if(!O.length) continue; const k=await GM.choose(O.map(o=>({t:S.subst(o.t,G,c)}))); const o=O[k]||O[0];
        c.picks=(c.picks||[]).concat([o]); S.applyPick(G,c,o); if(c.onPick) c.onPick(G,c,o); await S.run(GM,x,o.then,c); continue; } }
    return c; };
  /* 選了的那一格：yt（ROM.ytAnswer）、lie（說謊＝YT_LIED[她][Y]）、promise、intent、set（記在這一場的 c.sets）*/
  /* yt：BB_194 §24（任務 BB194-YTFLAGS）——'honest'／'dodge'／'claimEnded'／'claimNone' 交給 ROM.ytAnswer 和事實比；ytAbout:'y'＝說的是這一場的 Y（「沒有，那是誤會。」＝說 Y 那一段不存在）*/
  S.yt=function(G,c,kind,about){ if(typeof ROM==='undefined'||!ROM.ytAnswer) return null; const r=ROM.ytAnswer(G,c.x,kind,about==='y'?c.y:about); if(r==='lied') c.lied=true; return r; };
  S.applyPick=function(G,c,o){ if(o.yt) S.yt(G,c,o.yt,o.ytAbout);
    if(o.lie&&c.y){ const M=sub(sub(S.defaults(G),'YT_LIED'),c.x); M[c.y]=true; c.lied=true; S.lieMark(G,c.x); }
    if(o.like) S.rec(G).liked[c.x]=G.day;   /* 祐廷親口承認在追她（S.likes）*/
    if(o.promise) c.promise=o.promise; if(o.intent) c.intent=o.intent; if(o.set) c.sets=Object.assign(c.sets||{},o.set);
    if(o.fx){ try{ o.fx(G,c); }catch(e){ console.warn('MREL pick fx',e); } } };

  /* ---------- 共用的條件（字裡的 if:'…'）---------- */
  S.FOOD_LOCS=['D09','D12','D18','D21','D23'];   /* 茶館、老街、漁港：到了就在吃東西的地點（語彤的問句「低頭吃東西」；其他「低頭看自己的手」，AA_425 2-1）*/
  S.lastMeet=function(G,x){ let d=-1e9; const Lg=typeof DATE!=='undefined'&&DATE.log?DATE.log(G,x):null; if(Lg&&Lg.last&&typeof Lg.last.day==='number') d=Math.max(d,Lg.last.day);
    for(const q of (G.outings||[])){ if(!q||q.state!=='done') continue; const ev=evOf(q.ev); const w=(q.te&&q.te.who)||(q.mrel&&q.mrel.x)||(ev&&(ev.participants||[])[0]); if(w===x&&typeof q.day==='number') d=Math.max(d,q.day); }
    return d; };
  S.ctx=function(G,x,y,o){ o=o||{}; const c=Object.assign({x,y,her:y?S.nameFor(G,x,y):'',yName:y?(S.BASE[y]||nm(y)):'',dur:y?S.durText(S.durDays(G,y)):'',cond:{}},o); const C=c.cond;
    C.remote=()=>!!c.remote; C.short=()=>!!y&&S.durDays(G,y)<7; C.long=()=>!!y&&S.durDays(G,y)>=180; C.lied=()=>!!y&&S.lied(G,x,y);
    C.kexinLied=()=>x===A1&&y===KX&&S.lied(G,A1,KX); C.longer=()=>!!y&&S.sinceDay(G,y)<S.sinceDay(G,x);
    C.inDorm=()=>S.inDorm(G); C.yKnowsX=()=>!!y&&knows(G,y,x); C.yNotKnowsX=()=>!y||!knows(G,y,x);
    C.preexam=()=>typeof DATE!=='undefined'&&!!DATE.sisPreexam&&DATE.sisPreexam(G); C.prerank=()=>typeof DATE!=='undefined'&&!!DATE.sisPrerank&&DATE.sisPrerank(G);
    C.psConfessed=()=>!!(G.flags&&G.flags.PS_CONFESSED); C.confessed=()=>!!y&&S.confessed(G,x,y);
    C.confessedHere=()=>C.confessed()&&!((S.rec(G).st[x]||{}).confessRemote);   /* 當面坦白的（芷若在英國是視訊）*/
    C.confessedRemote=()=>C.confessed()&&!!((S.rec(G).st[x]||{}).confessRemote);
    C.recent=()=>{ const d=S.lastMeet(G,x); return !!y&&d>=G.day-7&&d>=S.sinceDay(G,y); };   /* {最近一次}（BB_194 13-1）*/
    C.lastWeek=()=>{ const d=S.lastMeet(G,x), wd=(wdOf(G.day)+6)%7; return !!y&&d>=G.day-wd&&d>=S.sinceDay(G,y); };   /* 這禮拜（週一起）*/
    C.cry=()=>x===KX&&S.durDays(G,KX)>=365&&(evDone(G,'ev_kexin_anniversary_y1')||evDone(G,'ev_kexin_anniversary_yn'));   /* 交往一年以上＋週年演過（AA_227 5-2）*/
    C.auntIn=()=>S.auntIn(G);   /* 阿姨在店裡：看 3D 的阿姨在不在麵店（AA_503 第 14 節後補第 7 點，5ec2fe771；S.auntIn）——在＝不問「阿姨呢？」；不在＝「阿姨呢？」「去買東西。」。原本 19:00 以後（AA_425 第 1 節）*/
    C.auntLate=()=>S.auntIn(G)&&(((+G.hour||0)%24)+24)%24>=19;   /* 最後「阿姨，我等一下自己收。」「好啦，你們年輕人。」（阿姨先上樓）：阿姨在店裡、照原本 19:00 以後才出（AA_503 第 14 節後補第 8 點，企劃線 f6069e42d；19:00 以前阿姨在＝不問「阿姨呢？」，也還不收）*/
    C.said=()=>!!c.said; C.prevTold=()=>!!c.prevTold; C.eating=()=>S.FOOD_LOCS.includes(c.loc);
    C.slip=()=>!!c.slip; C.slipYu=()=>c.slip==='yu'; C.second=()=>!!c.second;
    C.overlap=()=>!!y&&c.prevDay!=null&&S.sinceDay(G,y)<=c.prevDay;
    return c; };

  /* ---------- 自動演的場景（ZRZQ.free 同一套：不在劇情、對話、約會、一起走路裡）---------- */
  S.free=function(GM){ const G=GM.G, E=GM.E, F=G.flags||{};
    if(E&&E.player&&E.player.busy) return false; if(GM.D&&GM.D.active) return false; if(typeof ADV!=='undefined'&&ADV.active) return false;
    if(typeof EVENTS!=='undefined'&&EVENTS.running) return false; if(GM.isEntering&&GM.isEntering()) return false;
    if(F.companion) return false; if((G.invites||[]).some(v=>v&&v.state==='going')) return false; if(typeof TRIP!=='undefined'&&TRIP.at&&TRIP.at(G)) return false;
    return true; };
  S.scene=async function(GM,o,fn){ const G=GM.G, bg=o.bg?(typeof OUT!=='undefined'&&OUT.bg?OUT.bg(o.bg):o.bg):(o.blur?'blur':'dark');
    GM.sceneBegin(o.x?{adv:o.x,background:bg}:undefined); try{ if(!o.x&&typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:bg}); if(o.cap&&GM.caption) GM.caption('',o.cap,2400); await fn(); }
    finally{ GM.sceneEnd(); if(typeof ADV!=='undefined'&&ADV.active&&ADV.end&&!(GM.D&&GM.D.busyDepth>0)) ADV.end(); }
    if(GM.autosave) GM.autosave(); return true; };
  const remoteBg=r=>r==='phone'?'phone_street_night':'video';

  /* =================== 一、第一次正式校外約會的問句（AA_422 0-1）=================== */
  S.askDue=function(G,x){ if(!law(G)||!S.ASK_FLAG[x]||!L()||!L().ASK[x]) return false; const F=G.flags||{}; if(F[S.ASK_FLAG[x]]!=null||dating(G,x)) return false;
    if(!S.knownOthers(G,x).length) return false;
    if(x===PS){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[PS]; if(c&&c.partner&&typeof STORY!=='undefined'&&STORY.partnerOn&&STORY.partnerOn(G,c.partner)) return false; }   /* 她自己沒有和柏翰交往中（AA_422 7-1）*/
    return true; };
  S.zrQ2Due=function(G,x){ if(x!==ZR||!law(G)) return false; const Z=S.rec(G).zr; return !!Z.q1&&!Z.q2&&!dating(G,ZR)&&S.knownOthers(G,ZR).length>0; };
  S.dateOpen=async function(GM,t){ const G=GM.G, x=t&&t.who; if(!x) return false;
    if(S.askDue(G,x)){ const y=S.newest(G,x,S.knownOthers(G,x)), c=S.ctx(G,x,y,{loc:(t.locs||[])[0]||null}); G.flags[S.ASK_FLAG[x]]=G.day; await S.run(GM,x,L().ASK[x],c); return true; }
    if(S.zrQ2Due(G,x)){ const y=S.newest(G,x,S.knownOthers(G,x)), c=S.ctx(G,x,y); const Z=S.rec(G).zr; await S.run(GM,x,L().ZR_Q2,c); Z.q2={day:G.day,y,ok:!c.lied}; return true; }
    return false; };

  /* =================== 二、知情版心意邀約（AA_422 0-2）=================== */
  S.prom=(G,x)=>{ const v=(S.defaults(G).YT_PROMISED||{})[x]; return v?Object.assign({v},S.rec(G).prom[x]||{}):null; };
  S.promise=function(G,x,v,ys,term){ const F=S.defaults(G), y=ys[0]; F.YT_PROMISED[x]=v==='handle'?'handle:'+y:v; S.rec(G).prom[x]={ys:ys.slice(),day:G.day,term:term||null}; };
  /* 承諾沒做到（下學期的心意邀約那天看）：exclusive＝那幾位還有人在交往；handle:Y＝Y 還在交往而且還不知道她；tell_first＝承諾以後開始的交往，她從別人那裡先知道 */
  S.promiseBroken=function(G,x){ const p=S.prom(G,x); if(!p) return false; const ys=p.ys||[];
    if(p.v==='exclusive') return ys.some(y=>dating(G,y));
    if(/^handle:/.test(p.v)){ const y=p.v.slice(7); return dating(G,y)&&!knows(G,y,x); }
    return false; };
  S.blocked=function(G,x){ const B=S.rec(G).block[x]; return !!B&&(B.ys||[]).some(y=>dating(G,y)); };   /* 「之後這一段還在的學期，她不發心意邀約」*/
  S.block=(G,x,ys)=>{ S.rec(G).block[x]={ys:ys.slice(),day:G.day}; };
  S.knowWalkDue=function(G,who,term){ if(!L()||!L().KNOW[who]||typeof TERMEND==='undefined') return false; if(who===KX&&!TERMEND.heart(KX,term)) return false;
    const again=TERMEND.rec(G).think[who]!=null, p=S.prom(G,who);
    if(again&&p){ if(S.promiseBroken(G,who)) return true; if(who!==ZR&&p.term&&p.term!==term) return false; }   /* 下學期：沒做到＝第二次；做到了＝照原本的第二次（AA_254；她答應＝OPEN_OK，termend3d.js 的 start）*/
    return S.knownOthers(G,who).length>0; };
  const resolveL=(x,G)=>{ x=typeof x==='function'?x(G):x; return x==null?[]:(Array.isArray(x)?x:[x]); };
  S.knowWalk=async function(GM,who,term){ const G=GM.G, Lx=typeof TERMEND_LINES!=='undefined'?TERMEND_LINES:null, h=TERMEND.heart(who,term), R=TERMEND.rec(G,term), Rt=TERMEND.rec(G), K=L().KNOW[who];
    if(!h||!Lx) return null; const again=Rt.think[who]!=null, ys=S.knownOthers(G,who), y=S.newest(G,who,ys)||(S.prom(G,who)||{ys:[]}).ys[0]||null, c=S.ctx(G,who,y);
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:h.walkBg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(h.walkBg):'dark',right:{charId:who,expression:'neutral'}});
    if(h.walkCaption&&GM.caption) GM.caption('',h.walkCaption,2400);
    await S.run(GM,who,resolveL(h.walk,G),c);
    const p=S.prom(G,who);
    if(again&&p&&S.promiseBroken(G,who)){ S.defaults(G).YT_BROKE_PROMISE[who]=G.flags.YT_PROMISED[who];
      const B=L().BROKE[who], bl=Array.isArray(B)?B:(B?B[p.v==='exclusive'?'exclusive':'handle']:null);
      if(bl) await S.run(GM,who,bl,c); S.block(G,who,(p.ys||[]).filter(q=>dating(G,q))); R.result='broken'; return 'broken'; }
    const D=typeof CONFESS_LINES!=='undefined'?CONFESS_LINES[who]:null;
    const say3=h.optsFrom==='confess'&&D&&D.choice?resolveL(D.choice,G).map(q=>q.t):Lx.OPTS(h.buddy);
    const k=await GM.choose(say3.concat([Lx.NOT_YET_OPT]).map(t=>({t}))), said=k<3; c.said=said; if(said) S.rec(G).liked[who]=G.day;
    if(!said) await S.run(GM,who,resolveL(again?(h.she2||h.she):h.she,G),c);
    const start=()=>{ const ok=typeof ROM!=='undefined'&&ROM.start?ROM.start(G,who):((G.flags['dating_'+who]=true),true); if(ok&&ys.length){ const M=sub(S.defaults(G).OPEN_OK,who); for(const q of ys) M[q]=true; } if(ok){ (G.flags.confessed||(G.flags.confessed={}))[who]=G.day; delete Rt.think[who]; R.result='yes'; if(who===SIS&&S.rec(G).sk) delete S.rec(G).sk[SIS]; } return ok; };
    const think=()=>{ Rt.think[who]=term; R.result='think'; return 'think'; };
    /* 芷若：第一次問「那你打算怎麼辦？」，第三次（之前問過第一次）問「你是真的想跟我在一起嗎？」（S.zrAsk）*/
    if(who===ZR){ const r=await S.zrAsk(GM,c,term,ys,start); if(r==='yes') return 'yes'; think(); return r==='no'?'no':'think'; }
    const qL=said?(K.say||K.q):(K.she||K.q); await S.run(GM,who,qL,c);
    const cc=await S.knowOpts(GM,who,K.opts,c,term,ys,{start,again:who===SIS?S.sisSecond(G,again):again});   /* 學姊：第一次一律讓我想想，第二次另外看 NEED.sis2（AA_474 1-2）*/
    if(cc.res) return cc.res; if(who===SIS) S.sisMark(G,term); return think(); };
  /* 芷若的三個問題（AA_422 5-2；學期末的知情版心意邀約、AA_474 3b 的特別場景同一套）：沒問過第一問＝第一問＋選項；問過＝第三問（第一、二問都照實＋沒說謊＋沒違約＋acceptsOpen＝接受）。
     回 'yes'（已經交往）／'no'（第三問不接受：之後那一段還在的學期不發心意邀約）／'think'／'promise'（第一問「我會跟她講。」）*/
  S.zrAsk=async function(GM,c,term,ys,start){ const G=GM.G, K=L().KNOW[ZR], Z=S.rec(G).zr, y=c.y;
    if(!Z.q1){ await S.run(GM,ZR,K.q,c); const cc=await S.knowOpts(GM,ZR,K.opts,c,term,ys); Z.q1={term,day:G.day,y}; return cc.res||cc.gate||'think'; }
    await S.run(GM,ZR,K.q3,c); const O=K.opts3, kk=await GM.choose(O.map(o=>({t:o.t}))), o=O[kk]||O[0]; S.applyPick(G,c,o); Z.q3={term,day:G.day,pick:kk};
    if(o.q3yes){ const ok=!!(Z.q1&&Z.q2&&Z.q2.ok)&&!S.lieCount(G,ZR)&&!S.defaults(G).YT_BROKE_PROMISE[ZR]&&S.acc(ZR)&&!S.zzPair(G,ZR,ys);
      if(ok&&start()){ await S.run(GM,ZR,o.yes,c); return 'yes'; } await S.run(GM,ZR,o.no,c); S.block(G,ZR,ys); return 'no'; }
    await S.run(GM,ZR,o.then,c); return 'think'; };
  /* 選項的「第二次另外要的條件」（again.need）。sis2＝學姊知情版的第二次（AA_474 1-2）：她的知情條件（termend3d.js S.KNOWS_OK）＋沒說謊＋兩次邀約中間至少兩次正常的 L1／L2 */
  S.NEED={ sis2:G=>S.sis2Ok(G) };
  /* 子晴、芷若（AA_474 1-4、1-5、第 2 節；使用者 10-17 定案「確定選朋友，不會三個人一起」）：她知道的那幾位裡有另一位＝知情條件不到（heartWhy 不發、只傳那一句）、也不會接受（開關打開也一樣）*/
  S.zzPair=(G,x,ys)=>{ const o=x===ZQ?ZR:(x===ZR?ZQ:null); return !!o&&(ys||S.knownOthers(G,x)).includes(o); };
  S.knowOpts=async function(GM,who,opts,c,term,ys,o2){ const G=GM.G; o2=o2||{};
    const O=opts.filter(o=>o.if===undefined||condOk(o.if,G,c)), k=await GM.choose(O.map(o=>({t:S.subst(o.t,G,c)}))), o=O[k]||O[0]; S.applyPick(G,c,o);
    await S.run(GM,who,o.then,c);
    let pr=o.promise||null, acc=o.accept, need=null;
    if(o.sub){ const s=await GM.choose(o.sub.map(q=>({t:q.t}))), q0=o.sub[s]||o.sub[0], q=o2.again&&q0.again?Object.assign({},q0,q0.again):q0;   /* 第二次換 again 那一套（學姊「她說可以。」，AA_474 第 5 節）*/
      S.applyPick(G,c,q); await S.run(GM,who,q.then,c); pr=q.promise||pr; if('accept' in q) acc=q.accept; need=q.need||null;
      if(q.first==='think'&&!o2.again) acc=null; }   /* 第一次一律讓我想想（AA_474 1-2：說完「……好。我想一下。」就停）*/
    if(pr&&ys.length) S.promise(G,who,pr,ys,term);
    if(acc){ const ok=S.acc(who)&&!S.zzPair(G,who,ys)&&(!need||!S.NEED[need]||!!S.NEED[need](G,who));   /* acceptsOpen（使用者 10-27 回答 C：七位都打開）；她的知情條件在發邀約以前已經看過（S.KNOWS_OK），這裡不再加（AA_474 第 4 節第 2 點）*/
      if(ok&&o2.start&&o2.start()){ await S.run(GM,who,acc.yes,c); c.res='yes'; return c; }
      await S.run(GM,who,acc.no,c); c.gate='no'; return c; }
    c.gate=pr&&ys.length?'promise':'think'; return c; };   /* c.gate：沒有答應的時候是哪一種（knowGate 用；knowWalk 一律算這學期的讓我想想）*/

  /* ---------- 學姊知情版的第一次／第二次（AA_474 1-2）----------
     第二次＝之前有過心意邀約的「讓我想想」（G.termend.think），或演過她的知情對話沒有答應（MREL.sk）；七月最後一次照 AA 算第二次（knowGate 的 again）。
     中間的 L1／L2 照 FLOW.heroine_05 的 meets 同一種算法：和她說話、和她的正式校外約會（MREL.meetAction 沒有別的事要演＝正常的一次）。MREL.sm[學姊]＝最近兩次的日子 */
  S.sisSecond=(G,again)=>!!again||(typeof TERMEND!=='undefined'&&!!TERMEND.rec&&TERMEND.rec(G).think[SIS]!=null)||!!(S.rec(G).sk||{})[SIS];
  S.sisMark=(G,term)=>{ S.rs(G,'sk')[SIS]={day:G.day,term:term||null}; };
  S.sisMet=G=>{ const M=S.rs(G,'sm'); M[SIS]=(Array.isArray(M[SIS])?M[SIS]:[]).concat([G.day]).slice(-2); };
  S.sisLastAsk=function(G){ let d=-1e9; const k=(S.rec(G).sk||{})[SIS]; if(k&&typeof k.day==='number') d=k.day;   /* 上一次的邀約：知情對話那天、或上一次心意邀約的飯（G.termend[那一學期].done）*/
    const th=typeof TERMEND!=='undefined'&&TERMEND.rec?TERMEND.rec(G).think[SIS]:null, Rd=th&&G.termend&&G.termend[th]&&G.termend[th].done; if(Rd&&Rd.who===SIS&&typeof Rd.day==='number') d=Math.max(d,Rd.day);
    return d; };
  S.sis2Ok=function(G){ const KO=typeof TERMEND!=='undefined'&&TERMEND.KNOWS_OK?TERMEND.KNOWS_OK[SIS]:null; if(!KO||!KO(G)||S.lied(G,SIS)) return false;
    const d=S.sisLastAsk(G); return ((S.rec(G).sm||{})[SIS]||[]).filter(x=>x>d).length>=2; };

  /* =================== 二之二、開始交往的那一刻她知道祐廷有別人（AA_474 第 4 節 3b，通則）===================
     學期末一般的心意邀約以外會開始交往的地方：以安七夕（r2y3b3d.js）、七月最後一次（r2y4b3d.js julyScene）、芷若 8/26（zr_last3d.js）、學姊大峽谷（r2y4b3d.js canyonKnow）、
     學姊重新開始的告白（date3d.js S.confess）。knownOthers(她) 有人＝先演她那一節的知情對話（KNOW[她]＋knowOpts；芷若照三問），台詞、條件、承諾、YT_* 記錄和心意邀約同一套；
     接受＝照那一場原本的答應（o.start：ROM.start＋OPEN_OK＋confessed）；其他＝那一場走它自己的「還沒」那一條（這裡不記 G.termend.think）。沒有人知道＝null（照原本）。
     Z13、Q15 不用這個：她知道＝不演特別版，改走一般的知情版心意邀約（r2y3b3d.js、rom1016_3d.js）。
     o：said（祐廷先說＝KNOW.say，沒有就 q；她先說＝KNOW.she，沒有就 q）、again（學姊算第二次）、term（承諾記在哪一學期）、start、at（哪一場，記在 MREL.gate）。
     回 'yes'／'promise'（說會分、會講：YT_PROMISED）／'no'（不接受）／'think'（讓我想想、不知道）；MREL.gate[她]＝{day, r, at} */
  S.knowsOther=(G,x)=>law(G)&&!!L()&&!!L().KNOW&&!!L().KNOW[x]&&S.knownOthers(G,x).length>0;
  S.startOpen=function(G,x,ys){ const ok=typeof ROM!=='undefined'&&ROM.start?ROM.start(G,x):((G.flags['dating_'+x]=true),true);
    if(ok){ const M=sub(S.defaults(G).OPEN_OK,x); for(const q of ys||[]) M[q]=true; (G.flags.confessed||(G.flags.confessed={}))[x]=G.day; } return ok; };
  S.termNow=G=>(typeof STORY!=='undefined'&&STORY.termAt&&STORY.termAt(G.day))||null;
  S.knowGate=async function(GM,x,o){ o=o||{}; const G=GM.G; if(!S.knowsOther(G,x)) return null;
    const K=L().KNOW[x], ys=S.knownOthers(G,x), y=S.newest(G,x,ys), c=S.ctx(G,x,y), term=o.term||S.termNow(G);
    c.said=!!o.said; if(o.said) S.rec(G).liked[x]=G.day;   /* 祐廷親口說了（同 knowWalk 的「說出來」）*/
    const start=()=>{ const ok=o.start?!!o.start(G):S.startOpen(G,x,ys); if(ok&&x===SIS&&S.rec(G).sk) delete S.rec(G).sk[SIS]; return ok; };
    let r;
    if(x===ZR) r=await S.zrAsk(GM,c,term,ys,start);
    else { await S.run(GM,x,o.said?(K.say||K.q):(K.she||K.q),c); const cc=await S.knowOpts(GM,x,K.opts,c,term,ys,{start,again:x===SIS?S.sisSecond(G,o.again):!!o.again}); r=cc.res||cc.gate||'think'; }
    if(x===SIS&&r!=='yes') S.sisMark(G,term);
    S.rs(G,'gate')[x]={day:G.day,r,at:o.at||''}; return r; };

  /* =================== 三、發現（AA_422 0-3）=================== */
  S.WINDOW_PS_END='2026-12-16';   /* 沛珊「她後來才發現」只會在這一天以前（AA_425 第 1 節：讀書會以安傳開、在場；大一下交往中的玩家也可能）*/
  S.excluded=function(G,x,y){ const r=S.relAt(G,x,y)||{};
    if((x===A1&&y===SIS)||(x===SIS&&y===A1)) if(r.source==='lawlib_meet'||(G.flags&&G.flags.TWO_HEARTS_MET!=null)) return true;   /* 1A-02 法圖相遇→兩點半 Café 攤牌 */
    if((x===ZQ&&y===ZR)||(x===ZR&&y===ZQ)) return true;   /* 兩人一起（《星期五下午》）*/
    if(x===PS){ const b=DK(S.WINDOW_PS_END); if(b!=null&&r.day>b) return true; }
    return false; };
  S.learnedDuring=(G,x,y)=>{ const r=S.relAt(G,x,y); if(!r) return x==='kai'; return r.day>=S.sinceDay(G,x); };
  S.scan=function(G){ if(!law(G)) return; const R=S.rec(G);
    for(const x of S.IDS){ if(R.pend[x]){ if(!dating(G,x)||!dating(G,R.pend[x].y)) delete R.pend[x]; else continue; }
      if(!dating(G,x)) continue; const D=R.disc[x]||{};
      let ys=(typeof ROM!=='undefined'&&ROM.knows?ROM.knows(G,x):[]).filter(y=>!S.openOk(G,x,y)&&!D[y]&&!S.confessed(G,x,y)&&!S.excluded(G,x,y)&&S.learnedDuring(G,x,y));
      if(!ys.length) continue;
      if(x===KX&&S.kwOn(G)){ const zs=ys.filter(z=>!S.ytSaid(G,KX,z));   /* 可昕收回 ②（AA_474 第 3 節）：她接受以後，祐廷又和第三個人交往、她從別人那裡先知道＝收回（不另外演發現）*/
        if(zs.length){ const D2=sub(R.disc,KX); for(const z of zs) D2[z]={day:G.day,ver:'withdraw'}; S.kwQueue(G,2,S.kxOpenY(G),S.newest(G,KX,zs)); ys=ys.filter(z=>!zs.includes(z)); if(!ys.length) continue; } }
      const y=S.newest(G,x,ys), r=S.relAt(G,x,y)||{}; R.pend[x]={y,day:r.day!=null?r.day:G.day,h:r.h!=null?r.h:+G.hour||0,src:r.source||''};
      if(/^slip:/.test(r.source||'')) R.pend[x].slip=/^slip:yu/.test(r.source)?'yu':'zhe';
      if(r.source==='seen_by:li_guanhong'){ const g=R.gh[y]||{}; R.pend[x].gh={place:g.place||'',known:[A1,YT,PS].includes(y)}; } } };
  S.prevKnown=function(G,x,y){ const R=S.rec(G), D=R.disc[x]||{}; let best=null;
    for(const q of S.IDS){ if(q===x||q===y) continue; const d=D[q]&&!D[q].skip?D[q]:null, cf=S.confessed(G,x,q), ok=S.openOk(G,x,q); if(d||cf||ok){ const day=d?d.day:(cf?G.flags.YT_CONFESSED[x][q]:0); if(!best||day>best.day) best={y:q,day}; } }
    return best; };
  /* 違約的發現：tell_first（以後有什麼我先講）＝承諾以後才開始的、她不是從祐廷那裡知道；exclusive＝說會分的那一位 */
  S.brokeFor=function(G,x,y){ const p=S.prom(G,x); if(!p) return false; const r=S.relAt(G,x,y)||{};
    if(p.v==='tell_first') return S.sinceDay(G,y)>=(p.day|0)&&r.source!=='yt_told';
    if(p.v==='exclusive') return (p.ys||[]).includes(y)||S.sinceDay(G,y)>=(p.day|0);
    if(/^handle:/.test(p.v)) return p.v.slice(7)===y&&!knows(G,y,x);
    return false; };
  /* 這一次見面能不能演發現（talk：和她說話；date：和她的正式校外約會）*/
  S.DISC_AT={heroine_01:['talk','date'],heroine_05:['talk','date'],classmate_peishan:['talk','date'],heroine_03:['noodle']};
  S.discDue=function(G,x,kind){ const p=S.rec(G).pend[x]; if(!p||!law(G)) return false; if(G.day===p.day&&(+G.hour||0)<p.h) return false;
    const A=S.DISC_AT[x]||[]; if(kind==='noodle'||(x===YT&&kind==='talk')) return x===YT&&G.zone==='noodle'&&S.ytShift(G);
    return A.includes(kind); };
  S.ytShift=G=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[YT], e=c&&typeof STORY!=='undefined'&&STORY.schedEnt?STORY.schedEnt(c,G):null; return !!(e&&e.zone==='noodle'); };
  /* 麵店的阿姨在不在店裡（PRIV-AUNT-1028；AA_503 第 14 節後補第 7 點，企劃線 5ec2fe771，BB-C 11:41 測出）：看 3D——阿姨的 3D 人物現在在不在麵店（圈子表 c503_6_2 那幾列：
     src/hcircle3d.js HCIRCLE.labelIn＝她那幾列現在成立，同 3D 生不生阿姨那一套）。原本 19:00 以後＝在（AA_425 第 1 節「阿姨 19:00 才來」），3D 的阿姨卻 17:30～20:30 站在店裡：
     18:00～19:00 那一場她問「阿姨呢？」，阿姨就在旁邊。3D 的時間不改（圈子表照舊）。沒有 HCIRCLE（只載 multirel3d.js 的測試）＝不在。
     第 8 點（企劃線 f6069e42d）：大二下以後每學期也有阿姨那一列（c503_14_1～5）；最後那三句（阿姨，我等一下自己收…）照原本 19:00 以後出＝C.auntLate */
  S.auntIn=G=>typeof HCIRCLE!=='undefined'&&!!HCIRCLE&&typeof HCIRCLE.labelIn==='function'&&!!HCIRCLE.labelIn(G,'hc_ayi','noodle');
  S.zrShiftEnd=function(G){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[ZR]; if(!c||typeof STORY==='undefined'||!STORY.schedEnt) return null; const e=STORY.schedEnt(c,G); return e&&e.zone==='cafe'&&e.act==='barista'?(+e.to||22):null; };
  S.playDisc=async function(GM,x,o){ o=o||{}; const G=GM.G, R=S.rec(G), p=R.pend[x]; if(!p) return false; const y=p.y, D=L().DISC[x]; if(!D){ delete R.pend[x]; return false; }
    delete R.pend[x]; const prev=S.prevKnown(G,x,y), broke=S.brokeFor(G,x,y);
    const c=S.ctx(G,x,y,{remote:o.remote||null,slip:p.slip||null,place:p.gh?p.gh.place:'',prevDay:prev?prev.day:null,first:prev?S.nameFor(G,x,prev.y):'',prevTold:!!(prev&&S.confessed(G,x,prev.y))});
    let lines, ver;
    if(broke&&D.broke){ lines=D.broke; ver='broke'; S.defaults(G).YT_BROKE_PROMISE[x]=G.flags.YT_PROMISED[x]; }
    else if(prev&&D.more){ lines=D.more; ver='more'; }
    else if(x===SIS&&p.gh&&D.ghUnknown){ ver='gh'; lines=p.gh.known?D.ghKnown.concat(D.base):D.ghUnknown; }
    else if(x===ZR&&o.remote&&D.uk){ lines=D.uk; ver='uk'; }
    else { lines=D.base; ver='base'; }
    if(x===KX&&!o.remote&&D.call&&ver!=='more') lines=D.call.concat([{bg:'dark',cap:S.inDorm(G)?'宿舍樓下':''}],lines);
    if(x===ZQ&&D.call&&ver!=='more') lines=D.call.concat([{bg:'dark',cap:S.inDorm(G)?'男宿樓下':'家那站出口'}],lines);
    if(o.remote==='video'&&ver!=='uk') lines=lines.concat([{n:'（視訊斷了。）'}]);
    sub(R.disc,x)[y]={day:G.day,ver,remote:o.remote||null}; G.flags[S.HURT[x]]=G.day;
    S.startStrain(G,x,y,{ver});
    await S.run(GM,x,lines,c);
    const st=S.st(G,x); if(st){ if(c.lied) st.lieDisc=true; if(c.sets&&c.sets.walked) st.walked=true; }
    if(x===KX&&c.lied&&st) st.exposeAt=G.day+3;   /* 「沒有，那是誤會。」：她之後一定會知道是謊（BB_194 13-4：3 天後下一次見面，5-2b）*/
    S.onDisc(G,x,st);
    return true; };
  S.startStrain=function(G,x,y,o){ const R=S.rec(G), old=R.st[x]; R.st[x]=Object.assign({y,n:(old?old.n|0:0)+1,day:G.day,lies0:S.lieCount(G,x),phase:'cool'},o||{}); return R.st[x]; };

  /* ---------- 祐廷先坦白（以安 AA_227 3-4 坦白版、沛珊 AA_228 3-3）---------- */
  S.CONFESS_OPT={heroine_01:'「我有件事要跟妳講。」',classmate_peishan:'「那我也跟妳講一件事。」'};
  S.confessFor=function(G,x){ if(!law(G)||!S.CONFESS_OPT[x]||!dating(G,x)) return null; const R=S.rec(G); if(R.pend[x]) return null;
    const ys=(typeof ROM!=='undefined'?ROM.partners(G):[]).filter(y=>y!==x&&!knows(G,x,y)&&!S.openOk(G,x,y)&&!S.confessed(G,x,y));
    return ys.length?ys[0]:null; };
  S.confess=async function(GM,x,y){ const G=GM.G, R=S.rec(G); if(!y) return false; const c=S.ctx(G,x,y);
    if(!dating(G,y)) return S.confessLike(GM,x,y);   /* 沛珊：還沒交往、只是喜歡（AA_228 3-3 原文那一版）*/
    if(typeof ROM!=='undefined'&&ROM.tellBy) ROM.tellBy(G,x,y); sub(S.defaults(G).YT_CONFESSED,x)[y]=G.day; sub(R.disc,x)[y]={day:G.day,ver:'confess'};
    S.startStrain(G,x,y,{ver:'confess',confessed:true}); await S.run(GM,x,L().DISC[x].confess,c); S.onDisc(G,x,S.st(G,x)); return true; };
  /* 「我也喜歡另一個女生。」（AA_228 3-3；只有沛珊有字）：喜歡＝還沒交往，但祐廷已經親口讓她知道（MREL.liked[她]）——第一次正式約會她問「你在追我？」選了承認的那一格（選項標 like）、
     或知情版心意邀約他自己先說了（knowWalk 的「說出來」）。記 MREL.like[沛珊][她]；不進冷靜期（她說「我們要聊一下」，AA 沒有寫之後那一段）。之後真的和她交往了，坦白交往那一版照樣可以講 */
  S.likes=function(G,x,y){ if(y===x||dating(G,y)||!S.IDS.includes(y)) return false; return S.rec(G).liked[y]!=null; };
  S.likeFor=function(G,x){ if(x!==PS||!law(G)||!dating(G,x)||!L().DISC[x].confessLike) return null; const M=S.rec(G).like[x]||{};
    return S.IDS.find(y=>!M[y]&&S.likes(G,x,y))||null; };
  S.confessLike=async function(GM,x,y){ const G=GM.G, c=S.ctx(G,x,y); sub(S.rec(G).like,x)[y]=G.day; await S.run(GM,x,L().DISC[x].confessLike,c); return true; };
  S.confessAny=(G,x)=>S.confessFor(G,x)||S.likeFor(G,x);
  /* ---------- 祐廷先坦白：學姊、子晴、芷若、語彤、可昕（AA_429 第 1 節）----------
     系統選項（和她說話的選單）：「（下次見面，自己跟她講{Y}的事）」→ MREL.cpend[她]＝{y,day,h}；下一次兩個人見面的時候演（S.confDue）：
       學姊＝隔天起 21:30～23:00 法圖外面的長椅（她念完書以後）；她在美國、祐廷在台灣＝21:00～23:30 視訊。
       子晴＝隔天起 22:00 以後溫州街小公園的鞦韆；2028-06-03 畢業以後＝公館的宵夜攤。只有她一個人的版本（Y 是芷若＝《星期五下午》那一場，不在這裡）。
       芷若＝她上班的晚上祐廷留到打烊（人在 Café、她的班要結束）；在英國＝每週的視訊（ZRUK.playW 那一層）。Y 是子晴同上。
       語彤＝她顧店的晚上祐廷在麵店（「等妳下班，可以講一下嗎？」→ 時間跳到 21:00 打烊）。
       可昕＝她下一次來找祐廷的出遊（來台大、我們的日子……出遊開始前 30 分鐘起，這一趟取消）或下一次正式校外約會；2029-06-28 退宿以後＝隔天起 21:30 家巷口。
     祐廷在國外時不給這個選項（AA 只寫了學姊、芷若在國外的視訊版）。之後照各人的挽回（AA_423），挽回第一段她多一句（multirel_lines.js 的 if:'confessed'）。 */
  S.CONF_LATER=[SIS,ZQ,ZR,YT,KX];
  S.confLaterOpt=(G,x,y)=>'（下次見面，自己跟她講'+(S.BASE[y]||nm(y))+'的事）';
  S.confLaterFor=function(G,x){ if(!law(G)||!S.CONF_LATER.includes(x)||!dating(G,x)||!L()||!L().CONF||!L().CONF[x]) return null; const R=S.rec(G); if(R.pend[x]||R.cpend[x]) return null;
    if(x===ZR&&S.heAbroad(G)&&S.herAway(G,ZR)!=='video') return null;   /* 祐廷在國外、芷若在台灣：AA 沒有寫這一版 */
    const ys=(typeof ROM!=='undefined'?ROM.partners(G):[]).filter(y=>y!==x&&!knows(G,x,y)&&!S.openOk(G,x,y)&&!S.confessed(G,x,y)&&!((x===ZQ&&y===ZR)||(x===ZR&&y===ZQ)));
    return ys[0]||null; };
  S.confLater=function(G,x,y){ S.rec(G).cpend[x]={y,day:G.day,h:+G.hour||0}; return true; };
  S.zqGrad=G=>{ const d=DK('2028-06-03'); return d!=null&&G.day>=d; };
  S.KX_MEET_EVS=['ev_kexin_visits_ntu','ev_kexin_our_day','ev_kexin_our_day_wk'];
  S.playConf=async function(GM,x,o){ o=o||{}; const G=GM.G, R=S.rec(G), p=R.cpend[x]; if(!p) return false; delete R.cpend[x]; const y=p.y;
    if(!dating(G,x)||!dating(G,y)||knows(G,x,y)) return false;
    if(x===YT&&!o.remote&&(+G.hour||0)<21&&GM.advance) GM.advance(21-(+G.hour||0));   /* 「等妳下班」→ 打烊 */
    if(o.remote==='video'&&typeof ADV!=='undefined'&&ADV.setBg) ADV.setBg(typeof OUT!=='undefined'&&OUT.bg?OUT.bg('video'):'video');
    const c=S.ctx(G,x,y,{remote:o.remote||null}); c.cond.grad=()=>S.zqGrad(G);
    if(typeof ROM!=='undefined'&&ROM.tellBy) ROM.tellBy(G,x,y); sub(S.defaults(G).YT_CONFESSED,x)[y]=G.day; sub(R.disc,x)[y]={day:G.day,ver:'confess',remote:o.remote||null};
    const st=S.startStrain(G,x,y,{ver:'confess',confessed:true,confessRemote:!!o.remote});
    await S.run(GM,x,L().CONF[x],c); if(o.remote==='video'&&!o.uk) await S.run(GM,x,[{n:'（視訊斷了。）'}],c);
    S.onDisc(G,x,st); return true; };
  /* 祐廷在國外（日本＋1、印第安納 −12／−13）：她那邊晚上 21:00～23:00 撥（AA_436 第 3 節第 3 點）＝祐廷這邊的時間 */
  S.herEvening=function(G){ const off=typeof STORY!=='undefined'&&STORY.tzOffset?STORY.tzOffset(G,G.day):0; let a=21+off; if(a<0) a+=24; if(a>=24) a-=24; const h=+G.hour||0; return h>=a&&h<a+2; };
  S.confDue=function(G){ if(!law(G)) return null; const R=S.rec(G), h=+G.hour||0, ab=S.heAbroad(G);
    for(const x of S.CONF_LATER){ const p=R.cpend[x]; if(!p) continue; const y=p.y;
      if(!dating(G,x)||!dating(G,y)||knows(G,x,y)){ delete R.cpend[x]; continue; }   /* 她先從別人那裡知道了＝照「發現」那一套 */
      const later=G.day>p.day, run=o=>async GM=>S.playConf(GM,x,o);
      if(ab&&x!==ZR&&S.remote(G,x)==='video'){ if((later||now(G)>=T(p.day,p.h)+0.25)&&S.herEvening(G)) return {k:'conf_remote',x,bg:'video',run:run({remote:'video'})}; continue; }   /* 祐廷在國外：視訊（芷若在英國＝每週的視訊那一層）*/
      if(x===SIS){ const rm=S.remote(G,SIS); if(rm==='video'){ if(later&&h>=21&&h<23.5) return {k:'conf_remote',x,bg:'video',run:run({remote:'video'})}; continue; }
        if(later&&h>=21.5&&h<23&&(S.inTaiwanBoth(G,SIS)||(ab&&S.sameCountry(G,SIS)))) return {k:'conf',x,cap:ab?'':'法圖外面的長椅',run:run()}; continue; }   /* 美國路線兩個人都在印第安納：當面，不寫法圖 */
      if(ab) continue;
      if(x===ZQ){ if(later&&h>=22&&S.inTaiwanBoth(G,ZQ)){ const g=S.zqGrad(G); return {k:'conf',x,bg:g?'gongguan':'wenzhou',cap:g?'公館的宵夜攤':'溫州街小公園的鞦韆',run:run()}; } continue; }
      if(x===ZR){ if(S.herAway(G,ZR)) continue; if(G.zone==='cafe'){ const e=S.zrShiftEnd(G); if(e!=null&&h>=e-0.25&&(later||h>=p.h+0.5)) return {k:'conf',x,blur:true,run:run()}; } continue; }
      if(x===YT){ if(G.zone==='noodle'&&S.ytShift(G)&&(later||h>=p.h+0.25)) return {k:'conf',x,blur:true,run:run()}; continue; }
      if(x===KX){ const d29=DK('2029-06-28'); if(d29!=null&&G.day>=d29){ if(later&&h>=21.5&&h<23) return {k:'conf',x,cap:S.inDorm(G)?'宿舍樓下':'家巷口',run:run()}; continue; }
        const t=now(G), q=(typeof OUT!=='undefined'&&OUT.rec?OUT.rec(G):[]).find(q=>q&&q.state==='planned'&&S.KX_MEET_EVS.includes(q.ev)&&t>=T(q.day,q.h)-0.5&&t<T(q.day,q.h)+(q.late||0.5));
        if(q) return {k:'conf',x,cap:q.place||'',run:async GM=>{ q.state='skipped'; q.mrelConf=G.day; return S.playConf(GM,x,{}); }}; } }   /* 她來了，聽完就走（這一趟不演原本的）*/
    return null; };
  /* 祐廷在國外時她不在眼前，和她說話的選單到不了：她那邊晚上 21:00～23:00 問一次（這一次出國、這一對一次；（先不說）＝這一趟不再問，回來以後照舊在說話的選單）。
     學姊也一樣（她在台灣、祐廷在日本＝她的視訊版）；芷若在英國＝每週的視訊開頭問（S.ukCallAction）*/
  S.CONF_ASK=[SIS,ZQ,YT,KX];
  S.confAskLabel=(G,x,y)=>'（打視訊給她，自己跟她講'+(S.BASE[y]||nm(y))+'的事）';
  S.confAskKey=(G,x,y)=>x+':'+y+':'+((typeof STORY!=='undefined'&&STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):'')||'');
  S.confAskDue=function(G){ if(!law(G)||!S.heAbroad(G)) return null; const R=S.rec(G), A=R.cask||(R.cask={});
    for(const x of S.CONF_ASK){ if(S.remote(G,x)!=='video') continue; const y=S.confLaterFor(G,x); if(!y||A[S.confAskKey(G,x,y)]) continue; if(!S.herEvening(G)) continue;
      return {k:'conf_ask',x,y,bg:'video',run:async GM=>S.confAsk(GM,x,y)}; }
    return null; };
  S.confAsk=async function(GM,x,y,o){ const G=GM.G, R=S.rec(G), A=R.cask||(R.cask={}); A[S.confAskKey(G,x,y)]=G.day;
    const k=await GM.choose([{t:S.confAskLabel(G,x,y)},{t:'（先不說）'}]); if(k!==0) return false;
    S.confLater(G,x,y); return S.playConf(GM,x,Object.assign({remote:'video'},o||{})); };

  /* =================== 可昕 結果 E（AA_429 第 2 節）：冷靜期結束（她傳照片的那一天）以後 28 天，祐廷沒有做挽回的任何一步＝第 28 天 21:30 她打來 → 照 D（分開）；第 30 天她的照片 =================== */
  S.kxStep=function(G,st){ if(seen(st,'back')||G.flags.MREL_KX_REPLY==='yes') return true; const d0=st.day;
    if((G.trips||[]).some(t=>t&&t.who===KX&&t.counted&&t.day>d0)) return true;
    return (G.outings||[]).some(q=>q&&q.state==='done'&&q.day>d0&&(((q.te&&q.te.who)===KX)||(q.mrel&&q.mrel.x===KX)||S.KX_MEET_EVS.includes(q.ev))); };
  S.kxEDue=function(G,st){ if(!st||st.phase==='ended'||st.phase==='done'||st.eDone||!seen(st,'self')||!L().KX_E) return false; const h=+G.hour||0;
    return G.day>=st.done.self+28&&h>=21.5&&h<23&&!S.heAbroad(G)&&!S.kxStep(G,st); };
  S.kxE=async function(GM,st){ const G=GM.G; st.eDone=G.day; await S.run(GM,KX,L().KX_E.call,S.ctx(G,KX,st.y)); S.end(G,KX); st.result='E'; st.endedDay=G.day;
    if(typeof PHONE!=='undefined'&&PHONE.at) PHONE.at(G,G.day+30,21,[{th:'p:'+KX,who:null,text:L().KX_E.post}],'mrel_kx_e_post_'+st.day); return true; };

  /* =================== 沛珊 結果 E：分手以後重新開始（AA_429 第 3 節）===================
     條件：她說的 D（和平分手）以後至少 90 天、祐廷單身、她第 5 階以上、不在消失期；消失期以前分的要等她回來（ev_peishan_back_call 以後）。一學期一次（「先不要講那個」「我還沒想好」＝下一學期還有）。
     在哪：去台南（寒暑假台中）找她的那一次（MREL.hvMeet）；那學期沒有＝她 23:00 以後打來（第 12 週以後、接下來 7 天沒約去找她）。 */
  S.psEDue=function(G){ const st=S.st(G,PS); if(!law(G)||!st||st.result!=='D'||st.endedDay==null||dating(G,PS)||!L().PS_E) return false;
    if(G.day<st.endedDay+90||(typeof ROM!=='undefined'&&ROM.partners(G).length)) return false;
    if(typeof DATE!=='undefined'&&DATE.stageNum&&DATE.stageNum(PS)<5) return false;
    const a=DK('2026-12-17'), b=DK('2027-08-06'); if(a!=null&&b!=null&&G.day>=a&&G.day<b) return false; if(pres(G,PS).lost) return false;
    if(a!=null&&st.endedDay<a&&!evDone(G,'ev_peishan_back_call')&&!(G.flags&&(G.flags.PS_BACK_FIRST||G.flags.PS_BACK_READ||G.flags.PS_RECONNECT))) return false;
    const tid=typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(G.day):null; return st.eTerm!==tid; };
  S.psE=async function(GM){ const G=GM.G, st=S.st(G,PS), c=S.ctx(G,PS,null); st.eTerm=typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(G.day):null;
    await S.run(GM,PS,L().PS_E,c); const s=c.sets||{};
    if(s.yes&&typeof ROM!=='undefined'&&ROM.start&&ROM.start(G,PS)){ st.phase='done'; st.result='E'; st.eDay=G.day; } return true; };

  /* =================== 以安、語彤好好分開或不回答之後，重新開始（AA_185 4-1，任務 AA185-V6）===================
     「被抓包」以外的兩種（ROM 最後一次分開的 how：apart_drift／drift＝不回答；two_hearts／mrel／zq_zr／caught／told＝被發現，不走這裡；其他＝好好分開）。都要祐廷先開口：
       以安：分開以後至少一學期（16 週）、第 5 階以上、她在臺北；公法讀書會的週四 21:30 散會人在萬才館＝「我想再寫一次理由欄。」／（先不說）。不回答的多一步（那一題）。
             →「……給我一週。」→ 7 天以後的讀書會散會「你先寫。」→ 回到第 6 階。
       語彤：分開以後至少 4 週；連續三個週四 18:30 人在總圖三樓（她的時間），第三個週四「……坐著也是坐著。」→ 回到第 6 階。
             不回答的先在週四打烊後（21:00～22:00 人在麵店）「我想把那個問題回答完。」／（先不說）→「……嗯。這次，不要讓我等。」，之後才算週四。
     學期末的心意邀約（BB_203）：這兩位這一次分開以後、上面那一場還沒做完以前，不發（「都要祐廷先開口」）；做完照一般條件（C1～C10）。S.REBUILD_GATE＝false 就不擋。
     重新交往的那一刻起 EX_<她> 清掉（前任版事件切回交往版；已經演過的不重演，相簿留著）。存檔：MREL.rb[她]＝{bd（這一次分開那天）, step, ...} */
  S.REBUILD_GATE=true;
  S.lastEnd=function(G,x){ const H=((typeof ROM!=='undefined'?ROM.get(G,x):{}).history)||[]; for(let i=H.length-1;i>=0;i--) if(H[i]&&H[i].ev==='end') return H[i]; return null; };
  S.CAUGHT_HOW=['two_hearts','mrel','zq_zr','caught','told'];
  S.endKind=e=>!e?null:(e.how==='apart_drift'||e.how==='drift'?'drift':(S.CAUGHT_HOW.includes(e.how)?'caught':'talk'));
  S.endDay=(G,e)=>{ if(!e) return null; if(typeof e.day==='number') return e.day; const sd=typeof STORY!=='undefined'&&STORY.breakupDaysAgo?STORY.breakupDaysAgo(G):null; return typeof sd==='number'?G.day-sd:G.day; };
  S.rb=function(G,x){ if(x!==A1&&x!==YT) return null; if(dating(G,x)||!(G.flags&&G.flags['EX_'+x])) return null; const e=S.lastEnd(G,x), k=S.endKind(e); if(!k||k==='caught') return null;
    const bd=S.endDay(G,e), R=S.rec(G); let r=R.rb[x]; if(!r||r.bd!==bd) r=R.rb[x]={bd,kind:k,step:k==='drift'&&x===YT?'answer':'open'}; return r; };
  S.rebuildBlock=(G,x)=>{ if(!S.REBUILD_GATE) return false; const r=S.rb(G,x); return !!r&&r.step!=='done'; };
  S.toStage6=function(id){ if(typeof SOCIAL==='undefined'||!SOCIAL.rel) return; const r=SOCIAL.rel(id), up=(k,v)=>{ if((+r[k]||0)<v) r[k]=v; }; up('fam',60); up('trust',45); up('comf',40); up('npcRom',55); up('rom',30); };   /* 第 6 階（date3d.js stageNum）*/
  S.anRbDue=function(G){ const r=S.rb(G,A1); if(!r||r.step==='done'||!law(G)) return null; const h=+G.hour||0;
    if(G.zone!=='wancai'||!S.plgOn(G,G.day)||h<21.5||h>=22.5||!pres(G,A1).here) return null;
    if(r.step==='open'){ if(G.day-r.bd<112||r.skipDay===G.day||(typeof DATE!=='undefined'&&DATE.stageNum&&DATE.stageNum(A1)<5)) return null; return 'open'; }
    if(r.step==='week'&&G.day>=(r.weekAt|0)) return 'form';
    return null; };
  S.anRb=async function(GM,step){ const G=GM.G, r=S.rb(G,A1), B=L().REBUILD.heroine_01;
    if(step==='form'){ await S.run(GM,A1,B.form,{}); S.toStage6(A1); r.step='done'; r.done=G.day; return true; }
    const k=await GM.choose([{t:B.opt},{t:'（先不說）'}]); if(k!==0){ r.skipDay=G.day; return false; }
    if(r.kind==='drift'){ await S.run(GM,A1,B.drift,{}); for(let i=0;i<8;i++){ const O=B.driftOpts, kk=await GM.choose(O.map(o=>({t:o.t}))), o=O[kk]||O[0]; await S.run(GM,A1,o.then,{}); if(!o.again) break; } }
    await S.run(GM,A1,B.week,{}); r.step='week'; r.weekAt=G.day+7; return true; };
  S.ytRbDue=function(G){ const r=S.rb(G,YT); if(!r||r.step==='done'||!law(G)||G.day-r.bd<28) return null; const h=+G.hour||0, thu=wdOf(G.day)===4;
    if(r.step==='answer'){ if(thu&&G.zone==='noodle'&&h>=21&&h<22&&r.skipDay!==G.day) return 'answer'; return null; }
    if(thu&&G.zone==='library'&&h>=18.5&&h<19&&(r.from==null||G.day>r.from)){ const L0=r.thu||(r.thu=[]); if(L0[L0.length-1]!==G.day){ if(L0.length&&G.day-L0[L0.length-1]!==7) L0.length=0; L0.push(G.day); } if(L0.length>=3) return 'seat'; }
    return null; };
  S.ytRb=async function(GM,step){ const G=GM.G, r=S.rb(G,YT), B=L().REBUILD.heroine_03;
    if(step==='seat'){ await S.run(GM,YT,B.seat,{}); S.toStage6(YT); r.step='done'; r.done=G.day; return true; }
    const k=await GM.choose([{t:B.opt},{t:'（先不說）'}]); if(k!==0){ r.skipDay=G.day; return false; }
    await S.run(GM,YT,B.answer,{}); r.step='thu'; r.from=G.day; r.thu=[]; return true; };

  /* =================== 沛珊：宥辰的三次互動、《換我講一件事》、台南那幾年（AA_228 3-3、3-4；AA_422 7-3；AA_423 6-1；AA_425 第 1 節）===================
     三次互動（放進既有的麵店團和她的閒聊，不另開事件）：G.flags.PS_YC＝{n1, n2, n3}（那一天）。三次都只是日常，誰都會遇到；只有認識的人說話（宥辰、沛珊都要認識）。
       n1：大一下麵店長桌＝考完的晚餐（events.js ev_midterm_supper_y1s2 的最後一行叫 MREL.ycSupper）。
       n2：大二上她說要重考以後（ev_peishan_decision 演過，AA_432）、還沒消失＝期中考那一週（第 8 週）週三 23:10 麵店團群組她那一句（P3 比較晚＝那之後的第一個週三，最晚第 15 週）；宥辰私下傳她的那一句祐廷看不到，切過去演（23:15 起第一個空檔，到隔天 22:00）。
           沒切到（一直在劇情裡）也算發生過（群組那句已經在了）。不在麵店團群組＝沒有這一次。
       n3：大三她在別的學校＝去台南找她（hometown3d.js 的那一天，地方那一段演完）或交往中的視訊，她提一次。
     《換我講一件事》：和她交往中＋三次都有＋n3 之後 7 天以上，一次（PS_CONFESSED＝那一天，「她坦白過」）。大三起她在台南＝去找她的那一次（台南、寒暑假的台中都算），
       那學期沒有去＝她打電話（21:30～23:00；學期第 12 週以後、接下來 7 天沒有約好去找她）。第四個選項「那我也跟妳講一件事。」只在祐廷也在交往／也喜歡別人時出現 → 3-3。
     祐廷先坦白（3-3）：她在臺北＝和她說話的選項（TALK_OPTS）；台南、消失期＝去找她的那一次、視訊裡多一個選擇（「那我也跟妳講一件事。」／（不說））。
     挽回（3-6 起）她在台南：去找她的那一次演；那學期沒去＝電話（同上的條件）。消失期（台中，keep）＝電話（AA_425 第 1 節）。 */
  S.ycRec=G=>{ const F=G.flags||(G.flags={}); if(!F.PS_YC||typeof F.PS_YC!=='object') F.PS_YC={}; return F.PS_YC; };
  const kn=(G,id)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const YCH='classmate_youchen';
  S.ycSupper=async function(GM){ const G=GM.G; if(!law(G)||!L()||!L().YC) return false; const Y=S.ycRec(G); if(Y.n1!=null||!kn(G,PS)||!kn(G,YCH)) return false;
    Y.n1=G.day; await S.run(GM,PS,L().YC.n1,{}); return true; };
  /* n2 的日子（AA_432：沛珊 P3 ev_peishan_decision 要演過）：演過、在第 8 週週三以前＝第 8 週週三；之後才演＝演完以後的第一個週三，最晚第 15 週；沒演過＝沒有這一次 */
  S.ycSongDay=function(G){ if(typeof STORY==='undefined'||!STORY.termDay) return null; const d0=STORY.termDay('Y2S1',8,3), d15=STORY.termDay('Y2S1',15,3); if(d0==null) return null;
    const dd=G&&G.events&&G.events.last?G.events.last.ev_peishan_decision:null; if(dd==null) return null; if(dd<=d0) return d0;
    let d=dd; while(wdOf(d)!==3&&d<dd+7) d++; return d15!=null&&d>d15?null:d; };
  S.YC_TAG='mrel_ps_song';
  S.ycPhone=function(G){ if(!law(G)||typeof PHONE==='undefined'||!L()||!L().YC) return; const d=S.ycSongDay(G), Y=S.ycRec(G); if(d==null||Y.n2!=null) return;
    const sent=PHONE.sent&&PHONE.sent(G,S.YC_TAG);
    if(!sent&&G.day>=d&&G.day<=d+1&&now(G)>=T(d,23+10/60)&&PHONE.inGroup&&PHONE.inGroup(G,'noodle_team')&&kn(G,PS)) PHONE.at(G,d,23+10/60,[{th:'g:noodle_team',from:PS,text:L().YC.group}],S.YC_TAG);
    if(sent&&now(G)>=T(d+1,22)) Y.n2=d; };   /* 沒切到：群組那句在了，算發生過 */
  S.ycCutDue=function(G){ const d=S.ycSongDay(G), Y=S.ycRec(G); if(d==null||Y.n2!=null||typeof PHONE==='undefined'||!PHONE.sent||!PHONE.sent(G,S.YC_TAG)||!kn(G,YCH)) return false; const t=now(G); return t>=T(d,23.25)&&t<T(d+1,22); };
  S.ycCut=async function(GM){ const G=GM.G; S.ycRec(G).n2=S.ycSongDay(G); await S.run(GM,PS,L().YC.n2,{}); return true; };
  S.inTainan=G=>{ const p=pres(G,PS); return !p.here&&!p.keep&&(p.city==='台南'||p.home==='台南'); };
  S.yc3Due=function(G){ const Y=S.ycRec(G); if(Y.n3!=null||!law(G)||!kn(G,YCH)) return false; const y3=typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay('Y3S1',1,1):null; return y3!=null&&G.day>=y3; };
  S.psTurnDue=function(G){ const F=G.flags||{}, Y=S.ycRec(G); if(!law(G)||!dating(G,PS)||F.PS_CONFESSED!=null||!L()||!L().PS_TURN) return false; return Y.n1!=null&&Y.n2!=null&&Y.n3!=null&&G.day>=Y.n3+7; };
  /* 那學期沒有去找她＝電話：學期第 12 週以後（或寒暑假），接下來 7 天沒有約好去找她 */
  S.psPhoneOk=function(G){ const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(t&&t.week<12) return false;
    const Q=typeof OUT!=='undefined'&&OUT.rec?OUT.rec(G):[]; return !Q.some(q=>q&&q.hv&&q.hv.id===PS&&q.state==='planned'&&q.day>=G.day&&q.day<=G.day+7); };
  S.psTurn=async function(GM){ const G=GM.G, y=S.confessAny(G,PS), c=S.ctx(G,PS,y); c.cond.ytOther=()=>!!y; G.flags.PS_CONFESSED=G.day;
    await S.run(GM,PS,L().PS_TURN,c); if(c.sets&&c.sets.ytTurn&&y) await S.confess(GM,PS,y); return true; };
  /* 去她的縣市那一天（hometown3d.js：地方那一段演完、閒聊階梯以前；v＝那一趟演哪一版，'keep'＝消失期的那個下午，'video'＝交往中的視訊）*/
  S.hvMeet=async function(GM,id,q,v){ const G=GM.G; if(id!==PS||!law(G)||!L()) return false; S.scan(G); const video=v==='video', st=S.rec(G).st[PS];
    if(st){ const a=S.FLOW.classmate_peishan.meet(G,st,video?'phone':'trip'); if(a){ await a.run(GM); return 'flow'; } }   /* 挽回、結果：這一次就是「去台南找她的那次」（AA_423 6-1）*/
    if(!video&&S.psEDue(G)){ await S.psE(GM); return 'restart'; }   /* 沛珊 E（AA_429 第 3 節）：吃完飯走回去的路上 */
    if(!video&&S.psTurnDue(G)){ await S.psTurn(GM); return 'turn'; }
    if(S.yc3Due(G)&&(video||S.inTainan(G))){ S.ycRec(G).n3=G.day; await S.run(GM,PS,L().YC.n3,{}); return 'yc3'; }
    const y=S.confessAny(G,PS); if(y){ const k=await GM.choose([{t:S.CONFESS_OPT[PS]},{t:'（不說）'}]); if(k===0){ await S.confess(GM,PS,y); return 'confess'; } }
    return false; };

  /* ---------- 傳開（BB_194 §3 ①：ROM.SPREAD 只傳可昕，這裡傳別人；時刻照 ROM.meetOn）---------- */
  S.spreadTick=function(G){ if(!law(G)||typeof ROM==='undefined'||!ROM.SPREAD||!ROM.meetOn) return 0; const R=S.rec(G), scan=R.scan, now0=now(G), K=ROM.relRec(G); let n=0;
    for(const r of ROM.SPREAD){ const src=K[r.from]||{};
      for(const y in src){ if(y===KX||y===r.to||y===r.from||!src[y]||knows(G,r.to,y)) continue; const key=r.from+'>'+r.to+':'+y, tk=T(src[y].day,src[y].h!=null?src[y].h:24);
        let d=Math.max(src[y].day,scan[key]!=null?scan[key]+1:src[y].day); const end=Math.min(G.day,d+400);
        for(;d<=end;d++){ if(d===G.day&&(+G.hour||0)<(r.meet==='fri'?16:21.5)) break; const m=ROM.meetOn(G,r,d); if(m&&T(d,m.t0)>tk){ if(T(d,m.t1)>now0) break; ROM.learn(G,r.to,y,'told_by:'+r.from,{day:d,h:m.t1}); n++; break; } scan[key]=d; } } }
    return n; };

  /* ---------- 李冠宏看到（AA_227 8-4、BB_194 16-2）：和書瑀交往以後，第二次在雙北和 Y 正式約會；隔天 ---------- */
  S.GH_AREAS=['臺北市','新北市'];
  S.onTripDone=function(G,t){ if(!law(G)||!t||!t.counted||t.who===SIS||!dating(G,SIS)||!dating(G,t.who)) return; if(typeof DATE==='undefined'||t.day<S.sinceDay(G,SIS)) return;
    const Lc=DATE.loc((t.locs||[])[0]); if(!Lc||!S.GH_AREAS.includes(Lc.area)) return; const R=S.rec(G), g=R.gh[t.who]||(R.gh[t.who]={n:0}); g.n++; g.place=Lc.name;
    if(g.n>=2&&!knows(G,SIS,t.who)&&!S.openOk(G,SIS,t.who)){ ROM.learn(G,SIS,t.who,'seen_by:li_guanhong',{day:t.day+1,h:12}); g.day=t.day+1; } };

  /* ---------- 麵店團說溜嘴（AA_227 8-4、BB_194 16-1）：可昕在場的群聚演完以後；阿哲優先，Alison 要有地點 ---------- */
  /* 可昕在場的麵店團群聚（AA_227 8-4：每年中秋、跨年頂樓、K12、二十三週年）：大一中秋烤肉（K3 她來）、K12 兩邊的朋友（ev_kexin_two_circles，y2b_events.js）、
     大二／大四中秋（她認識麵店團才來，KX_MET_NOODLE_TEAM）、二十三週年（1B-20 ev_noodle_23rd，y34b3d.js：同一個條件才有她那一句；美國路線不演）。跨年頂樓沒有接（AA_429 第 5 節：頂樓那一場只有大一，她不在）。一個存檔只演一次 */
  const KX_TEAM=G=>!!(G.flags&&G.flags.KX_MET_NOODLE_TEAM);
  S.SLIP_EVENTS={ ev_mid_autumn_bbq:G=>!!(G.flags&&G.flags.KX_BBQ_COME), ev_kexin_two_circles:()=>true, ev_y2_midautumn:KX_TEAM, ev_y4_midautumn:KX_TEAM, ev_noodle_23rd:G=>KX_TEAM(G)&&G.flags.ANNIV23!=='remote' };   /* 二十三週年：美國路線（ANNIV23 remote）不演（AA_429 第 5 節）*/
  S.slipFor=function(G,ev){ if(!law(G)||!ev||!S.SLIP_EVENTS[ev.id]||!dating(G,KX)) return null; let here=false; try{ here=S.SLIP_EVENTS[ev.id](G); }catch(e){} if(!here) return null;
    const O=S.rec(G).once; if(O.slip||Object.keys(O).some(k=>/^slip_/.test(k))) return null;   /* 一個存檔只演一次（AA_429 第 5 節）*/ const parts=ev.participants||[];
    const ys=(typeof ROM!=='undefined'?ROM.partners(G):[]).filter(y=>y!==KX&&!parts.includes(y)&&!knows(G,KX,y)&&!S.openOk(G,KX,y));
    for(const y of ys){ const L0=typeof DATE!=='undefined'&&DATE.log?DATE.log(G,y):null, tr=(G.trips||[]).filter(t=>t.who===y&&t.counted&&t.day>=G.day-13&&t.day<=G.day).pop();
      if(knows(G,'zhe',y)) return {y,who:'zhe'};
      if(knows(G,'yu',y)&&tr&&L0) return {y,who:'yu',dloc:(DATE.loc(tr.locs[0])||{}).name||''}; }
    return null; };
  S.afterEvent=async function(GM,ev){ const G=GM.G, s=S.slipFor(G,ev); if(!s) return false; S.rec(G).once['slip_'+ev.id]=G.day; S.rec(G).once.slip=ev.id; const c=S.ctx(G,KX,s.y,{dloc:s.dloc||''});
    await S.scene(GM,{x:KX,bg:'noodle_table'},async()=>{ await S.run(GM,KX,s.who==='yu'?L().DISC.kexin.slipYu:L().DISC.kexin.slipZhe,c); });
    ROM.learn(G,KX,s.y,'slip:'+s.who+'@'+ev.id); return true; };

  /* =================== 四、挽回、結果（AA_423）=================== */
  S.end=function(G,x,how){ if(typeof ROM==='undefined'||!ROM.end) return false; const ok=ROM.end(G,x,how||'mrel'); if(ok){ const R=ROM.get(G,x); R.by='her'; R.endedDay=G.day; } const st=S.st(G,x); if(st){ st.phase='ended'; st.result='D'; } return ok; };
  S.agree=function(G,x,y){ sub(S.defaults(G).OPEN_OK,x)[y]=true; S.defaults(G).YT_PROMISED[x]='tell_first'; S.rec(G).prom[x]={ys:[y],day:G.day}; const st=S.st(G,x); if(st){ st.phase='done'; st.result='C'; }
    if(x===KX) S.rec(G).kxo={y,day:G.day,lc:S.lieN(G,KX),since:S.sinceDay(G,KX)}; };   /* 知情後繼續（OPEN_OK、以後你要自己先講＝tell_first）；可昕記接受的那一次（收回看它，AA_474 第 3 節）*/
  S.liedSince=(G,x,st)=>S.lieCount(G,x)>(st?st.lies0|0:0)||!!(st&&st.lieDisc&&x!==KX);
  S.plg=()=>typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list?ACTIVITIES.list.find(a=>a.id==='public_law_group'):null;
  S.plgOn=(G,d)=>{ const a=S.plg(); return !!a&&ACTIVITIES.on(a,d,G); };
  /* 以安「下一個讀書會的週四」（BB_194 13-4）：大四上 11/30 交棒以後＝平日晚上總圖外面的長椅；寒暑假、考試週沒有讀書會＝下一個平日晚上 */
  S.anTalkDay=function(G,from){ const ho=DK('2028-11-30'); for(let d=from;d<from+120;d++){ const Gx=Object.assign({},G,{day:d}); if(!pres(Gx,A1).here) continue;
      if(ho!=null&&d>=ho){ const w=wdOf(d); if(w>=1&&w<=5) return d; continue; } if(S.plgOn(G,d)) return d; const T0=typeof CALENDAR!=='undefined'?CALENDAR.termOf(d):null; if(!T0&&wdOf(d)>=1&&wdOf(d)<=5) return d; }
    return null; };
  S.anBench=d=>{ const ho=DK('2028-11-30'); return ho!=null&&d>=ho; };
  /* 她在總圖讀書的那一天的晚上（《同一頁》）：以安的作息晚上不在總圖（傍晚在校園走走），所以照「那天有總圖的時段」，晚上 21:00 演（「那天晚上她念到閉館」）*/
  S.libNight=function(G,x,from){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[x]; if(!c||typeof STORY==='undefined'||!STORY.schedEnt) return null;
    for(let d=from;d<from+30;d++) for(const h of [10,11,14,15,19,20,21]){ const Gx=Object.assign({},G,{day:d,hour:h,weekday:wdOf(d)}); if(!pres(Gx,x).here) continue; const e=STORY.schedEnt(c,Gx); if(e&&(e.zone==='library'||e.zone==='library_hall')) return T(d,21); }
    return null; };
  S.OUT_EV='ev_mrel_outing';
  S.planOut=function(G,x,kind,day,h,o){ if(typeof OUT==='undefined'||!OUT.plan) return false; const id='mrel_'+x+'_'+kind+'_'+day; if(OUT.get&&OUT.get(G,id)) return false;
    return OUT.plan(G,Object.assign({id,ev:S.OUT_EV,day,h,late:0.75,mrel:{x,kind,tries:(o&&o.tries)|0}},o||{})); };
  /* 每個人發現以後要排的 */
  S.onDisc=function(G,x,st){ if(!st) return; const n=st.n|0;
    if(x===A1){ st.selfAt=S.libNight(G,A1,G.day+1); st.askAt=T(G.day+1,20); }
    if(x===SIS){ st.selfAt=T(G.day+3,21); }
    if(x===KX){ st.selfAt=T(G.day+2,17); }
    if(x===ZQ){ st.msgAt=T(G.day+7,21.5); if(n>=2) st.selfAt=T(G.day+3,21); }
    if(x===ZR){ if(n>=2) st.selfAt=T(G.day+3,22.5); }
    if(x===PS){ st.talkAt=G.day+3; } };

  /* ---------- 見面時演的（talk：和她說話；date：和她的正式約會；out：其他和她的出遊開頭）：回傳 async(GM,who)=>{}，abort＝之後不再照常 ---------- */
  S.meetAction=function(G,x,kind){ if(!law(G)) return null; const R=S.rec(G); S.scan(G);
    if(x===KX&&kind==='date'&&R.cpend[KX]&&!S.heAbroad(G)) return {abort:true,disc:true,run:async GM=>S.playConf(GM,KX,{})};   /* 可昕：說好下次見面講的，這一次正式約會講（講完她走了，這一趟不去）*/
    if(S.discDue(G,x,kind)) return {abort:true,disc:true,run:async GM=>S.playDisc(GM,x,{remote:null})};
    const st=R.st[x]; const F=S.FLOW[x]; if(st&&F&&F.meet){ const a=F.meet(G,st,kind); if(a) return a; }
    if(x===SIS&&(kind==='talk'||kind==='date')) S.sisMet(G);   /* 正常的一次見面（學姊知情版第二次要中間兩次，AA_474 1-2；同 FLOW.heroine_05 的 meets）*/
    return null; };
  S.meet=async function(GM,x,kind){ const a=S.meetAction(GM.G,x,kind); if(!a) return false; await a.run(GM); return a.abort?'abort':true; };

  /* ---------- 各人的流程 ---------- */
  const RL=x=>L().REPAIR[x];
  const seen=(st,k)=>!!(st.done&&st.done[k]);
  const mark=(st,k,G)=>{ (st.done||(st.done={}))[k]=G.day; };
  S.FLOW={
    /* 以安（AA_423 第 1 節）：傳「可以跟妳談一下嗎？」→「這禮拜不要。」→ 下一個讀書會的週四散會後研討室（第一段；「我不知道」下次再一次）→ 之後一次談完總圖外面（第二段）→ 再下一次：結果 */
    heroine_01:{
      tick(G,st){ const t=now(G); if(st.phase==='ended'||st.phase==='done') return S.FLOW.heroine_01.after(G,st);
        if(S.herAway(G,A1)) return null;   /* 日本那學期照 AA_254 第 10 節（jp3d.js）*/
        if(st.selfAt!=null&&!seen(st,'self')&&t>=st.selfAt) return {k:'self',bg:null,cap:'總圖三樓',cut:true,run:async GM=>{ mark(st,'self',G); await S.run(GM,A1,L().SELF.heroine_01[(st.n|0)>=2?1:0],S.ctx(G,A1,st.y)); }};
        if(!st.asked&&st.askAt!=null&&t>=st.askAt&&(+G.hour||0)>=20&&(st.askDay!==G.day)) return {k:'ask',noScene:true,run:async GM=>S.anAsk(GM,st)};
        if(st.talkAt!=null&&G.day>=st.talkAt&&(+G.hour||0)>=21.5&&(+G.hour||0)<23.5){ const step=st.next||'talk1';
          if(step==='result'&&st.saidB&&S.anResult(G,st)==='B'){ st.talkAt=S.anTalkDay(G,G.day+1); return null; }   /* B 只說一次；之後每個讀書會的週四再看 A／C／D */
          return {k:step,x:A1,bg:S.anBench(G.day)||step!=='talk1'?'library_gate_night':'wancai_seminar',run:async GM=>S.anStep(GM,st,step)}; }
        return null; },
      after(G,st){ if(st.result==='D'&&st.dAfterAt!=null&&!seen(st,'dafter')&&G.day>=st.dAfterAt&&G.day<=st.endedDay+14&&S.plgOn(G,G.day)&&G.zone==='wancai'&&(+G.hour||0)>=20&&(+G.hour||0)<21.5)
          return {k:'dafter',noScene:false,x:null,blur:true,run:async GM=>{ mark(st,'dafter',G); await S.run(GM,A1,RL(A1).result.Dafter,{}); }};
        return null; } },
    heroine_05:{
      tick(G,st){ const t=now(G); if(st.phase!=='cool') return null;
        if(st.selfAt!=null&&!seen(st,'self')&&t>=st.selfAt) return {k:'self',cap:'法學院圖書館',cut:true,run:async GM=>S.sisSelf(GM,st)};
        return null; },
      meet(G,st,kind){ if(st.phase!=='talked') return null; const y=st.y;
        if(!dating(G,y)) return {abort:true,run:async GM=>S.result(GM,SIS,st,'A')};
        if(S.liedSince(G,SIS,st)) return {abort:true,run:async GM=>S.result(GM,SIS,st,'D')};
        if((st.meets|0)>=2){ const r=st.intent==='both'?(rom(SIS)>=75&&S.acc(SIS)?'Byes':'Bno'):'C'; return {abort:true,run:async GM=>S.result(GM,SIS,st,r)}; }
        st.meets=(st.meets|0)+1; return null; } },
    kexin:{
      tick(G,st){ const t=now(G); if(st.phase==='ended'||st.phase==='done'||st.phase==='thinking') return null;
        if(st.selfAt!=null&&!seen(st,'self')&&t>=st.selfAt) return {k:'self',bg:'nccu_gate',cap:'政大',cut:true,run:async GM=>S.kxSelf(GM,st)};
        if(S.kxEDue(G,st)) return {k:'kx_e',x:KX,bg:'phone_street_night',cap:'電話',run:async GM=>S.kxE(GM,st)};   /* 結果 E（AA_429 第 2 節）*/
        if(seen(st,'n4')&&!seen(st,'hug')&&st.hugAt!=null&&t>=st.hugAt&&rom(KX)>=80&&!S.liedSince(G,KX,st)) return {k:'hug',x:KX,bg:'phone_street_night',run:async GM=>S.kxHug(GM,st)};
        return null; },
      meet(G,st,kind){ if(st.phase==='thinking') return S.kxThinkMeet(G,st,kind);   /* 收回以後回 B（AA_474 第 3 節）*/
        if(!seen(st,'back')||st.phase==='ended'||st.phase==='done') return null; const y=st.y;
        if(!seen(st,'n4')) return {abort:kind!=='out',run:async GM=>S.kxFour(GM,st)};
        if(!dating(G,y)) return {abort:kind!=='out',run:async GM=>S.result(GM,KX,st,'A')};
        if(!st.b1&&!seen(st,'hug')&&G.day<=(st.done.n4|0)+1) return null;   /* 隔天晚上她可能打來（5-5）：先等 */
        if(!st.b1){ if(seen(st,'hug')) return {abort:kind!=='out',run:async GM=>{ st.b1=G.day; await S.run(GM,KX,RL(KX).result.B1,S.ctx(G,KX,y)); }}; return {abort:kind!=='out',run:async GM=>S.result(GM,KX,st,'C')}; }
        if(G.day>st.b1){ const r=rom(KX)>=85&&!S.liedSince(G,KX,st)&&S.acc(KX)?'Byes':(rom(KX)<70?'Bno_D':'Bno_C'); return {abort:kind!=='out',run:async GM=>S.result(GM,KX,st,r)}; }
        return null; } },
    heroine_04:{
      tick(G,st){ const t=now(G); if(st.phase==='ended'||st.phase==='done') return null;
        if(st.selfAt!=null&&!seen(st,'self')&&t>=st.selfAt){ if(S.zqGrad(G)) return {k:'self',cap:'她租的套房',cut:true,run:async GM=>{ mark(st,'self',G); await S.run(GM,ZQ,L().SELF.heroine_04[3],{}); }};   /* 2028-06 畢業以後（AA_429 第 4 節）：不傳訊息給芷若 */
          const uk=S.herAway(G,ZR)==='video'; return {k:'self',cap:'吉他社辦',cut:true,run:async GM=>{ mark(st,'self',G); await S.run(GM,ZQ,L().SELF.heroine_04[uk?2:1],{}); }}; }
        if(st.msgAt!=null&&!seen(st,'msg')&&t>=st.msgAt&&S.inTaiwanBoth(G,ZQ)) return {k:'msg',noScene:true,run:async GM=>S.zqMsg(GM,st)};
        return null; },
      meet(G,st,kind){ if(st.phase!=='talked') return null; const y=st.y;
        if(S.liedSince(G,ZQ,st)) return {abort:true,run:async GM=>S.result(GM,ZQ,st,'D')};
        if(!dating(G,y)) return {abort:true,run:async GM=>S.result(GM,ZQ,st,'A')};
        if(G.day<(st.talkDay|0)+7) return null;
        const r=st.intent==='both'?(rom(ZQ)>=80&&S.acc(ZQ)?'Byes':'Bno'):(st.intent==='unsure'?'C':null); return r?{abort:true,run:async GM=>S.result(GM,ZQ,st,r)}:null; } },
    heroine_02:{
      tick(G,st){ const t=now(G); if(st.phase==='ended'||st.phase==='done') return null;
        if(st.selfAt!=null&&!seen(st,'self')&&t>=st.selfAt&&L().SELF.heroine_02[1]) return {k:'self',cap:'Café 打烊',cut:true,run:async GM=>{ mark(st,'self',G); await S.run(GM,ZR,L().SELF.heroine_02[1],{}); }};
        return null; },
      meet(G,st,kind){ if(kind!=='cafe') return null; const y=st.y;
        if(st.phase==='cool'&&G.day>st.day&&st.lastVisit!==G.day) return {abort:true,run:async GM=>S.zrCafe(GM,st)};
        if(st.phase!=='talked') return null;
        if(S.liedSince(G,ZR,st)) return {abort:true,run:async GM=>S.result(GM,ZR,st,'D')};
        if(!dating(G,y)) return {abort:true,run:async GM=>S.result(GM,ZR,st,'A')};
        if(G.day<(st.talkDay|0)+7) return null;
        const r=st.intent==='both'?(rom(ZR)>=80&&S.acc(ZR)?'Byes':'Bno'):(st.intent==='unsure'?'C':null); return r?{abort:true,run:async GM=>S.result(GM,ZR,st,r)}:null; } },
    heroine_03:{
      tick(G,st){ if(st.phase==='ended'||st.phase==='done') return null;
        if(st.phase==='cool'&&G.day>st.day&&G.zone==='noodle'&&S.ytShift(G)) return {k:'talk1',x:YT,blur:true,run:async GM=>S.ytTalk1(GM,st)};
        if(st.phase==='waiting'&&!st.dist&&G.day>=(st.talk1Day|0)+7&&!st.planned2){ st.planned2=G.day; S.planOut(G,YT,'talk2',G.day,21,{place:'總圖三樓外面的走廊',title:'總圖三樓外面的走廊',travel:'走過去約 10 分鐘',travelH:1/6}); }
        return null; },
      meet(G,st,kind){ const y=st.y;
        if(st.phase==='waiting'&&st.disturb&&G.day<=(st.talk1Day|0)+14&&kind==='talk'){ st.dist=(st.dist|0)+1; if(st.dist>=2) return {abort:true,run:async GM=>S.result(GM,YT,st,'D')}; st.distant=true; return null; }   /* 「打擾」（BB_194 13-4）*/
        if(st.phase!=='talked') return null;
        if(S.liedSince(G,YT,st)) return {abort:true,run:async GM=>S.result(GM,YT,st,'D')};
        if(!dating(G,y)) return {abort:true,run:async GM=>S.result(GM,YT,st,'A')};
        if(G.day<(st.talkDay|0)+3) return null;
        if(st.intent==='both'&&st.asked&&rom(YT)>=73&&S.acc(YT)) return {abort:true,run:async GM=>S.result(GM,YT,st,'B')};
        st.phase='distant'; st.result='C'; return null; } },
    classmate_peishan:{
      tick(G,st){ if(st.phase==='ended'||st.phase==='done') return null; const r=S.remote(G,PS);
        if(r==='phone'&&S.inTainan(G)&&!S.psPhoneOk(G)) return null;   /* 她在台南：等去台南找她的那一次（S.hvMeet）；那學期沒去才打電話（AA_423 6-1）*/
        if(r&&st.talkAt!=null&&G.day>=st.talkAt&&(+G.hour||0)>=21&&(+G.hour||0)<23.5){ const a=S.FLOW.classmate_peishan.meet(G,st,'phone'); if(a) return {k:'ps_phone',x:PS,bg:'phone_street_night',run:async GM=>a.run(GM)}; }
        return null; },
      meet(G,st,kind){ const y=st.y; if(st.phase==='ended'||st.phase==='done'||st.talkAt==null||G.day<st.talkAt) return null;
        if(st.phase==='cool') return {abort:true,run:async GM=>S.psTalk(GM,st)};
        if(st.phase==='psA'&&G.day>=(st.aDay|0)+7){ if(S.acc(PS)) return {abort:true,run:async GM=>S.psBounds(GM,st)}; st.phase='psThink'; }   /* 雙向協議也是同時交往：acceptsOpen 沒開＝停在 C（「上次那件事我還在想喔。」）*/
        if(st.phase==='psOnly') return {abort:true,run:async GM=>S.psResultA(GM,st)};
        if(st.phase==='psBoth'||(S.liedSince(G,PS,st)&&rom(PS)<85)) return {abort:true,run:async GM=>S.result(GM,PS,st,'D')};
        if(st.phase==='psThink'&&!seen(st,'cline')) return {abort:false,run:async GM=>{ mark(st,'cline',G); st.phase='distant'; await S.run(GM,PS,RL(PS).result.C,{}); }};
        return null; } } };

  /* 以安的傳訊息（玩家決定傳不傳；不傳＝三天後晚上再問一次）*/
  S.anAsk=async function(GM,st){ const G=GM.G, Rp=RL(A1); st.askDay=G.day; let k=1; GM.sceneBegin(); try{ k=await GM.choose([{t:'「'+Rp.ask+'」',hint:'傳訊息給'+nm(A1)},{t:'（先不傳）'}]); } finally{ GM.sceneEnd(); }
    if(k!==0){ st.askAt=T(G.day+3,20); return false; }
    st.asked=G.day; if(typeof PHONE!=='undefined'){ PHONE.post(G,{th:'p:'+A1,from:'player',who:null,text:Rp.ask}); PHONE.at(G,G.day,(+G.hour||0)+0.05,[{th:'p:'+A1,from:A1,text:Rp.notThisWeek}],'mrel_an_ask_'+G.day); }
    st.talkAt=S.anTalkDay(G,G.day+3); st.next='talk1'; return true; };
  /* 以安的結果（BB_194 §9、13-4）：D＝發現以後又說謊、或她的戀愛 < 60；A＝Y 真的結束了；C＝還想和 Y 在一起＋她的戀愛 ≥ 80＋第 6 階＋沒說謊；其他＝B */
  S.anResult=function(G,st){ if(S.liedSince(G,A1,st)||rom(A1)<60) return 'D'; if(!dating(G,st.y)) return 'A'; if(rom(A1)>=80&&S.acc(A1)&&typeof DATE!=='undefined'&&DATE.stageNum(A1)>=6) return 'C'; return 'B'; };
  S.anStep=async function(GM,st,step){ const G=GM.G, Rp=RL(A1), c=S.ctx(G,A1,st.y);
    if(step==='talk1'){ await S.run(GM,A1,Rp.talk1,c); if(c.sets&&c.sets.willing){ st.willing=G.day; st.talks=1; st.next='talk2'; G.flags.AN_WILLING=G.day; G.flags.AN_TALKED=1; } st.talkAt=S.anTalkDay(G,G.day+1); return; }
    if(step==='talk2'){ await S.run(GM,A1,Rp.talk2,c); st.talks=2; G.flags.AN_TALKED=2; st.next='result'; st.talkAt=S.anTalkDay(G,G.day+1); return; }
    const r=S.anResult(G,st);
    if(r==='B'&&st.saidB){ st.talkAt=S.anTalkDay(G,G.day+1); return; }
    await S.result(GM,A1,st,r); if(r==='B'){ st.saidB=G.day; st.phase='cool'; st.next='result'; st.talkAt=S.anTalkDay(G,G.day+1); } };
  /* 書瑀：前半（她自己的場景）＋她傳的四句 → 隔天公館的小店（她在美國＝隔天視訊）*/
  /* 前半照當時：放榜以後、碩一以前＝法四（AA_425）；之後上學期＝碩班報告、下學期＝法律扶助（AA_423 2-1；法服版拿掉）；第二次冷靜＝AA_227 8-3（美國版換那一句）*/
  S.sisVersion=function(G,st,us){ if((st.n|0)>=2) return us?'secondUs':'second'; const m1=DK('2026-09-01'); if(m1!=null&&G.day<m1) return 'law4';
    const term=typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(G.day):''; return /S2$/.test(term||'')?'aid':'report'; };
  S.sisSelf=async function(GM,st){ const G=GM.G, Sx=L().SELF.heroine_05; mark(st,'self',G); const us=S.herAway(G,SIS)==='video'&&!S.heAbroad(G), v=S.sisVersion(G,st,us);
    await S.run(GM,SIS,Sx[v],{}); await S.run(GM,SIS,us?RL(SIS).msgUs:RL(SIS).msg,{}); st.us=us;
    st.version=v; S.planOut(G,SIS,'dinner',G.day+1,us?21:19,us?{place:'視訊',title:'和'+nm(SIS)+'視訊',verb:'接起來',call:true,travel:'',travelH:0}:{place:'公館的小店',title:'公館的小店',travel:'走過去約 15 分鐘',travelH:0.25}); };
  S.sisDinner=async function(GM,st){ const G=GM.G, c=S.ctx(G,SIS,st.y,{second:(st.n|0)>=2,remote:st.us?'video':null}); await S.run(GM,SIS,RL(SIS).dinner,c);
    st.intent=S.intent(G,SIS,c.intent||'unsure'); if(c.promise&&st.y) S.promise(G,SIS,c.promise,[st.y]); st.phase='talked'; st.meets=0; st.talkDay=G.day; G.flags.SIS_TALKED=G.day; };
  /* 可昕：前半（政大）＋照片 →（回了）10 分鐘後／（沒回）隔天「明天晚上，公館。你出來。」→ 隔天 19:00 公館（後半）*/
  S.kxSelf=async function(GM,st){ const G=GM.G, Rp=RL(KX), two=(st.n|0)>=2; mark(st,'self',G); if(G.flags) G.flags.MREL_KX_REPLY=null;   /* 這一次的照片回不回（結果 E 看「挽回的任何一步」）*/ await S.run(GM,KX,L().SELF.kexin[two?1:0],{});
    if(typeof PHONE!=='undefined'){ const tag='mrel_kx_photo_'+st.day; const items=two?[{th:'p:'+KX,from:KX,text:Rp.see}]:[{th:'p:'+KX,from:KX,text:Rp.photo},{th:'p:'+KX,from:KX,text:Rp.dontReply}];
      items[items.length-1].ask={id:tag,opts:[{t:'（回她）',post:false,set:{MREL_KX_REPLY:'yes'}},{t:'（不回）',post:false,set:{MREL_KX_REPLY:'no'}}]}; PHONE.at(G,G.day,+G.hour||17,items,tag); st.photoTag=tag; } };
  S.kxPhone=function(G,st){ if(!st||!st.photoTag||seen(st,'meetMsg')||typeof PHONE==='undefined') return; const m=PHONE.byAsk?PHONE.byAsk(G,st.photoTag):null; if(!m) return; const Rp=RL(KX);
    let at=null; if(m.ans===0) at=T(m.day,m.h+1/6); else if(G.day>m.day) at=T(m.day+1,12); if(at==null||now(G)<at) return;
    mark(st,'meetMsg',G); const d=Math.floor(at/24); PHONE.at(G,d,at-d*24,[{th:'p:'+KX,from:KX,text:Rp.meet}],'mrel_kx_meet_'+st.day); S.planOut(G,KX,'back',d+1,19,{place:'公館',title:'公館（'+nm(KX)+'）',travel:'走過去約 15 分鐘',travelH:0.25}); };
  S.kxBack=async function(GM,st){ const G=GM.G, c=S.ctx(G,KX,st.y,{second:(st.n|0)>=2});
    if(st.exposeAt!=null&&!seen(st,'exposed')&&G.day>=st.exposeAt){ mark(st,'exposed',G); await S.run(GM,KX,L().DISC.kexin.exposed,c); }
    await S.run(GM,KX,RL(KX).back,c); mark(st,'back',G); st.phase='talking'; };
  S.kxMemory=function(G,c){ const M=RL(KX).memory, F=G.flags||{}, econ=Object.keys((G.events&&G.events.done)||{}).some(k=>/^ev_y0_/.test(k));
    const K7={ticket:'摩天輪票根的影本',planner:'行事曆'}, ok={e37:()=>evDone(G,'ev_y0_e37'),sea:()=>F.E35_PLAN==='sea',anniv:()=>econ&&evDone(G,'ev_kexin_anniversary_y1'),k7:()=>!econ&&!!K7[F.K7_GIFT]&&!!(F.KX_ANNIV&&F.KX_ANNIV[1]&&F.KX_ANNIV[1]!=='missed'),econ:()=>econ};
    for(const r of M) if(ok[r.if]&&ok[r.if]()){ c.k7=K7[F.K7_GIFT]||''; return r.line; } return null; };
  S.kxFour=async function(GM,st){ const G=GM.G, c=S.ctx(G,KX,st.y); await S.run(GM,KX,RL(KX).notEnough,c); mark(st,'n4',G); G.flags.KX_TALKED=G.day; st.hugAt=T(G.day+1,22); };
  S.kxHug=async function(GM,st){ const G=GM.G, c=S.ctx(G,KX,st.y), Rp=RL(KX); mark(st,'hug',G); await S.run(GM,KX,Rp.call,c); if(typeof ADV!=='undefined'&&ADV.setBg) ADV.setBg('dark'); if(GM.caption) GM.caption('',S.inDorm(G)?'宿舍樓下':'家巷口',2400);
    const ch=Rp.notEnough.find(it=>it&&it.c); if(ch) await S.run(GM,KX,[ch],c); await S.run(GM,KX,Rp.hug,c); G.flags.KX_HUGGED=G.day; };
  /* 子晴：冷靜期過了（7 天）她傳「宵夜」「你請」→ 那天晚上 22:00 公館的鹽酥雞攤 */
  S.zqMsg=async function(GM,st){ const G=GM.G; mark(st,'msg',G); if(typeof PHONE!=='undefined') PHONE.at(G,G.day,+G.hour||21.5,RL(ZQ).msg.map(t=>({th:'p:'+ZQ,from:ZQ,text:t})),'mrel_zq_msg_'+st.day);
    S.planOut(G,ZQ,'talk',G.day,22,{place:'公館的鹽酥雞攤',title:'宵夜（公館的鹽酥雞攤）',travel:'走過去約 15 分鐘',travelH:0.25}); };
  S.zqTalk=async function(GM,st){ const G=GM.G, c=S.ctx(G,ZQ,st.y); await S.run(GM,ZQ,RL(ZQ).talk,c); st.intent=S.intent(G,ZQ,c.intent||'unsure'); if(c.promise) S.promise(G,ZQ,c.promise,[st.y]); st.phase='talked'; st.talkDay=G.day; if(st.intent==='unsure'){ st.phase='distant'; st.result='C'; } };
  /* 芷若：冷靜期裡祐廷去 Café 當客人，她上班；選「等她下班」＝留到打烊 */
  S.zrCafe=async function(GM,st){ const G=GM.G, Rp=RL(ZR), c=S.ctx(G,ZR,st.y); await S.run(GM,ZR,Rp.greet,c);
    st.lastVisit=G.day; const k=await GM.choose([{t:Rp.waitOpt},{t:Rp.leaveOpt}]); if(k!==0) return 'left';   /* 點完就走＝照常點餐 */
    const end=S.zrShiftEnd(G); if(end!=null&&(+G.hour||0)<end&&GM.advance) GM.advance(end-(+G.hour||0));
    await S.run(GM,ZR,Rp.talk,c); st.intent=S.intent(G,ZR,c.intent||'unsure'); if(c.promise) S.promise(G,ZR,c.promise,[st.y]); st.phase='talked'; st.talkDay=G.day; if(st.intent==='unsure'){ st.phase='distant'; st.result='C'; } return 'talked'; };
  /* 語彤：之後第一次來麵店（第一段）→ 7 天沒有打擾＝她找他，總圖三樓外面的走廊（第二段＋她開口要求）*/
  S.ytTalk1=async function(GM,st){ const G=GM.G, c=S.ctx(G,YT,st.y); await S.run(GM,YT,RL(YT).talk1,c); st.talk1Day=G.day; st.disturb=!!(c.sets&&c.sets.disturb); st.phase='waiting'; };
  S.ytTalk2=async function(GM,st){ const G=GM.G, c=S.ctx(G,YT,st.y); await S.run(GM,YT,RL(YT).talk2,c); st.intent=S.intent(G,YT,c.intent||'unsure'); if(c.promise) S.promise(G,YT,c.promise,[st.y]);
    if(st.intent!=='unsure'){ await S.run(GM,YT,RL(YT).ask,c); st.asked=G.day; st.phase='talked'; st.talkDay=G.day; } else { st.phase='distant'; st.result='C'; } };
  /* 沛珊：AA_228 3-6 */
  S.psTalk=async function(GM,st){ const G=GM.G, c=S.ctx(G,PS,st.y); await S.run(GM,PS,RL(PS).talk,c); const s=c.sets||{};
    if(s.psA){ st.phase='psA'; st.aDay=G.day; } else if(s.psOnly) st.phase='psOnly'; else if(s.psBoth) st.phase='psBoth'; else st.phase='psThink'; st.talkAt=G.day+3;
    S.intent(G,PS,s.psOnly?'exclusive':(s.psA||s.psBoth?'both':'unsure')); };
  S.psBounds=async function(GM,st){ const G=GM.G; await S.run(GM,PS,RL(PS).bounds,S.ctx(G,PS,st.y)); G.flags.PS_MUTUAL=G.day; S.agree(G,PS,st.y); st.result='B'; st.bTerm={}; };
  S.psResultA=async function(GM,st){ const G=GM.G, c=S.ctx(G,PS,st.y); await S.run(GM,PS,RL(PS).result.A,c); const s=c.sets||{};
    if(s.psYes){ S.promise(G,PS,'exclusive',[st.y]); st.phase='done'; st.result='A'; } else { st.phase='psThink'; st.talkAt=G.day+3; } };
  /* 結果（AA_423 各節的表）*/
  S.result=async function(GM,x,st,r,o){ const G=GM.G, Rp=RL(x), c=S.ctx(G,x,st.y); const key=r==='Bno_D'||r==='Bno_C'?'Bno':r;
    const lines=((o&&o.uk&&Rp.resultUk)||Rp.result)[key]; if(lines) await S.run(GM,x,lines,c); st.result=r;
    if(r==='A'){ st.phase='done'; if(typeof ROM!=='undefined'&&ROM.mend) ROM.mend(G,x); }
    else if(r==='Byes'||(x===YT&&r==='B')||(x===A1&&r==='C')) S.agree(G,x,st.y);
    else if(r==='B'){ st.phase='cool'; }
    else if(r==='C'||r==='Bno_C'){ st.phase='distant'; }
    else if(r==='D'||r==='Bno'||r==='Bno_D'){ S.end(G,x); st.endedDay=G.day; if(x===A1) st.dAfterAt=G.day+1; }
    st.resultDay=G.day; return r; };

  /* =================== 可昕收回（AA_474 第 3 節；BB_194 第 9 節「她可以收回」）===================
     她接受以後（OPEN_OK.kexin[Y]，Y 還在交往），下面任一件＝下一次兩人見面演：①YT_LIED.kexin 又記一筆（S.lieN）；②祐廷又和第三個人開始交往、她從別人那裡先知道（S.scan：不另外演發現）；
     ③接受以後每個學期末（學期末的飯那個時段，TERMEND.window）看一次她的戀愛 < 80（她自己改變想法）。
     在哪：她約公館捷運出口，晚上（出遊 20:00，接受以後的隔天起）；祐廷或她在國外、她寒暑假在高雄＝演出來的視訊（同發現：她那邊 21:00～23:30）。
     演完：清掉 OPEN_OK.kexin[Y]、記 KX_WITHDREW {day, why, y, z, since}（每段交往只演一次）；她的戀愛 ≥ 70＝回 B（MREL.st.kexin.phase 'thinking'：我們的日子暫停，還一起吃飯）；< 70＝她提分手（ended，by her）。
     回 B 以後：Y（②那一位也是）真的結束了＝照 5-6 的 A；之後第一次見面（隔天起）祐廷再提兩個都要＝她直接答「我說過了。」（一次；不再走一次接受）。
     她約的那一則訊息、視訊的開頭 AA 沒有寫：沒有傳字，只排出遊（行程有標題）。*/
  S.KW_PLACE='公館捷運出口'; S.KW_H=20;
  S.ytSaid=(G,x,y)=>{ const r=S.relAt(G,x,y)||{}; return r.source==='yt_told'||r.source==='legacy'||S.confessed(G,x,y); };   /* 祐廷自己講的（tellBy／舊存檔他親口說的／先坦白）*/
  S.kxOpenY=G=>{ if(!dating(G,KX)) return null; const O=(G.flags&&G.flags.OPEN_OK&&G.flags.OPEN_OK[KX])||{}; return Object.keys(O).find(q=>O[q]&&q!==KX&&dating(G,q))||null; };
  S.kwDone=G=>{ const W=G.flags&&G.flags.KX_WITHDREW; return !!W&&W.since===S.sinceDay(G,KX); };   /* 這一段交往演過了 */
  S.kwOn=G=>law(G)&&!S.kwDone(G)&&!!S.kxOpenY(G);
  S.kwQueue=function(G,why,y,z){ const R=S.rec(G); if(R.kwp) return false; R.kwp={why,y,z:z||null,day:G.day,h:+(+G.hour||0).toFixed(2)}; return true; };
  S.kwTick=function(G){ if(!S.kwOn(G)) return; const R=S.rec(G); if(R.kwp) return; const y=S.kxOpenY(G);
    const o=R.kxo&&R.kxo.y===y&&R.kxo.since===S.sinceDay(G,KX)?R.kxo:(R.kxo={y,day:G.day,lc:S.lieN(G,KX),since:S.sinceDay(G,KX)});   /* 沒有接受紀錄（不應該發生）：從現在起算 */
    if(S.lieN(G,KX)>(o.lc|0)){ S.kwQueue(G,1,y); return; }   /* ① */
    const w=typeof TERMEND!=='undefined'&&TERMEND.window?TERMEND.window(G):null;
    if(w&&w.from>o.day){ const Tm=o.terms||(o.terms={}); if(Tm[w.id]==null){ Tm[w.id]=G.day; if(rom(KX)<80) S.kwQueue(G,3,y); } } };   /* ③ */
  S.kwRemote=G=>{ let rm=S.remote(G,KX); if(!rm&&pres(G,KX).kind==='home'&&!pres(G,KX).here) rm='video'; return rm?'video':null; };
  S.kwPlan=function(G){ const R=S.rec(G), p=R.kwp; if(!p) return; if(!dating(G,KX)){ delete R.kwp; return; } if(typeof OUT==='undefined'||!OUT.rec||S.kwRemote(G)) return;
    if(OUT.rec(G).some(q=>q&&q.state==='planned'&&q.mrel&&q.mrel.x===KX&&q.mrel.kind==='withdraw')) return;
    let d=Math.max(p.day+1,G.day); if(now(G)>T(d,S.KW_H+0.5)) d++;
    S.planOut(G,KX,'withdraw',d,S.KW_H,{place:S.KW_PLACE,title:S.KW_PLACE+'（'+nm(KX)+'）',travel:'走過去約 15 分鐘',travelH:0.25}); };
  S.kwDue=function(G){ const R=S.rec(G), p=R.kwp; if(!p||G.day<=p.day||R.pend[KX]) return null; if(!dating(G,KX)){ delete R.kwp; return null; }
    const h=+G.hour||0; if(S.kwRemote(G)&&h>=21&&h<23.5) return {k:'kx_withdraw_remote',x:KX,bg:'video',run:async GM=>S.kxWithdraw(GM,{remote:'video'})}; return null; };
  S.kxWithdraw=async function(GM,o){ o=o||{}; const G=GM.G, R=S.rec(G), p=R.kwp; if(!p) return false; delete R.kwp; if(!dating(G,KX)) return false;
    const y=p.y&&dating(G,p.y)?p.y:(S.kxOpenY(G)||p.y), W=L().KX_WITHDRAW, c=S.ctx(G,KX,y,{remote:o.remote||null});
    await S.run(GM,KX,p.why===3?W.self:W.broke,c);
    const O=S.defaults(G).OPEN_OK[KX]; if(O&&y) delete O[y];
    const D2=sub(R.disc,KX); if(y&&!D2[y]) D2[y]={day:G.day,ver:'withdraw'};   /* 不再被當成「被發現」演一次 */
    G.flags.KX_WITHDREW={day:G.day,why:p.why,y,z:p.z||null,since:S.sinceDay(G,KX)};
    const st=R.st[KX]||S.startStrain(G,KX,y,{ver:'withdraw'}); st.w={day:G.day,why:p.why,z:p.z||null};
    if(rom(KX)>=70){ await S.run(GM,KX,W.pause,c); st.phase='thinking'; st.result='W'; S.kxOdPause(G); }
    else { await S.run(GM,KX,W.end,c); S.end(G,KX); st.endedDay=G.day; }
    return true; };
  /* 回 B（thinking）以後的見面 */
  S.kxThinkMeet=function(G,st,kind){ if(!dating(G,KX)) return null; const w=st.w||(st.w={day:G.day}), left=[st.y,w.z].filter(q=>q&&dating(G,q));
    if(!left.length) return {abort:kind!=='out',run:async GM=>S.result(GM,KX,st,'A')};   /* 照 5-6 的 A */
    if(!w.told&&G.day>(w.day|0)) return {abort:false,run:async GM=>{ w.told=G.day; await S.run(GM,KX,L().KX_WITHDRAW.told,S.ctx(G,KX,st.y)); }};
    return null; };
  /* 我們的日子暫停（「我們的日子先停。」）：kxod3d.js、pgdates3d.js、story3d.js（大一下）排固定格以前看 kxOdPaused；回 A、分手以後照常 */
  S.kxOdPaused=G=>{ const M=G&&G.flags&&G.flags.MREL, st=M&&M.st?M.st[KX]:null; return !!st&&st.phase==='thinking'&&!!G.flags.dating_kexin&&S.kwDone(G); };   /* 這一段交往收回過、還在 B */
  S.kxOdPause=function(G){ if(typeof OUT==='undefined'||!OUT.rec) return; for(const q of OUT.rec(G)) if(q&&q.state==='planned'&&(/^kx_od_/.test(q.id||'')||q.ev==='ev_kexin_our_day'||q.ev==='ev_kexin_our_day_wk')) q.state='skipped'; };   /* 已經排好的固定格 */

  /* =================== 五、子晴、芷若兩個人一起（AA_227 6-4、6-5、6-6；AA_422 4-4、AA_423 4-1；BB_194 §22）=================== */
  S.zzDue=function(G){ if(!law(G)||!dating(G,ZQ)||!dating(G,ZR)) return false; const Z=S.rec(G).zz; if(Z.friday) return false;
    if(S.openOk(G,ZQ,ZR)||S.openOk(G,ZR,ZQ)) return false; if(knows(G,ZQ,ZR)&&knows(G,ZR,ZQ)) return false; if(S.heAbroad(G)) return false;
    if(wdOf(G.day)!==5||(+G.hour||0)<16) return false; return !!(typeof ROM!=='undefined'&&ROM.meetOn&&ROM.meetOn(G,{from:ZQ,to:ZR,meet:'fri'},G.day)); };
  S.zzCtx=function(G){ const c=S.ctx(G,ZQ,null), dq=S.durDays(G,ZQ), dr=S.durDays(G,ZR), sq=S.sinceDay(G,ZQ), sr=S.sinceDay(G,ZR);
    Object.assign(c,{durZq:S.durText(dq),durZr:S.durText(dr),dateZq:S.dateText(sq),dateZr:S.dateText(sr)});
    const nx=(G.trips||[]).filter(t=>t.who===ZQ&&t.status==='booked'&&t.day>=G.day).sort((a,b)=>a.day-b.day)[0], last=(G.trips||[]).filter(t=>t.who===ZQ&&t.counted).pop(), tr=nx||last;
    c.dloc=tr&&typeof DATE!=='undefined'?((DATE.loc(tr.locs[0])||{}).name||''):''; const C=c.cond;
    C.drive=()=>!!(nx&&nx.transport==='car'); C.same=()=>Math.abs(sq-sr)<=7; C.zqFirst=()=>!C.same()&&sq<sr; C.zrFirst=()=>!C.same()&&sr<sq; return c; };
  S.zzFriday=async function(GM){ const G=GM.G, Z=S.rec(G).zz; Z.knewBefore=knows(G,ZQ,ZR)||knows(G,ZR,ZQ); Z.friday=G.day; const c=S.zzCtx(G);
    await S.run(GM,ZQ,L().ZZ.friday,c); ROM.learn(G,ZQ,ZR,'ev_zq_zr_friday'); ROM.learn(G,ZR,ZQ,'ev_zq_zr_friday');
    let d=G.day+1; while(wdOf(d)!==6&&d<G.day+8) d++; Z.calloutAt=T(d,19.5); if(Z.knewBefore) Z.splitZrAt=T(d+1,21.5); };
  S.zzCallout=async function(GM){ const G=GM.G, Z=S.rec(G).zz, c=S.zzCtx(G); Z.callout=G.day;
    await S.run(GM,ZQ,L().ZZ.call,c); if(typeof ADV!=='undefined'&&ADV.setBg) ADV.setBg('dark'); if(GM.caption) GM.caption('',S.inDorm(G)?'男宿樓下':'家那站出口',2400);
    if(Z.knewBefore){ await S.run(GM,ZQ,L().ZZ.splitZq,c); S.zzEnd(G,ZQ); return; }
    await S.run(GM,ZQ,L().ZZ.callout,c); S.zzEnd(G,ZQ); S.zzEnd(G,ZR); };
  S.zzSplitZr=async function(GM){ const G=GM.G, Z=S.rec(G).zz; Z.splitZr=G.day; await S.run(GM,ZR,L().ZZ.splitZr,S.zzCtx(G)); S.zzEnd(G,ZR); };
  S.zzEnd=function(G,x){ const F=G.flags, Z=S.rec(G).zz; S.end(G,x,'zq_zr'); F.ZQ_ZR_ENDED_DAY=F.ZQ_ZR_ENDED_DAY||G.day; F[x===ZQ?'ZQ_ENDED':'ZR_ENDED']=G.day; sub(S.rec(G).disc,x)[x===ZQ?ZR:ZQ]={day:G.day,ver:'zz'};
    if(typeof SOCIAL!=='undefined'&&SOCIAL.rel){ SOCIAL.rel(x).npcRom=0; } if(typeof DATE!=='undefined'&&DATE.log){ const Lg=DATE.log(G,x); Lg.count=0; Lg.wish=false; } Z.endTerm=Z.endTerm||(typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(G.day):null); };
  const TERM_ORDER=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  /* 可以重新開始（BB_194 22-3）：分手那一學期的下一個學期整個過完；她在台灣（臺北）、自己沒有交往對象、熟度回到 FRIEND；只能其中一個 */
  S.zzCanRestart=function(G,x){ const Z=S.rec(G).zz, F=G.flags||{}; if(F.ZQ_ZR_ENDED_DAY==null) return true; if(F.RESTART_WITH&&F.RESTART_WITH!==x) return false;
    const i=TERM_ORDER.indexOf(Z.endTerm), cur=typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(G.day):null; if(i<0||TERM_ORDER.indexOf(cur)<i+2) return false;
    const p=pres(G,x); if(!(p.here||p.kind==='taipei')) return false; const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[x]; if(c&&c.partner&&typeof STORY!=='undefined'&&STORY.partnerOn&&STORY.partnerOn(G,c.partner)) return false;
    return typeof SOCIAL==='undefined'||!SOCIAL.STAGES||SOCIAL.STAGES.indexOf(SOCIAL.stage(x))>=SOCIAL.STAGES.indexOf('FRIEND'); };
  S.zzRefusing=(G,x)=>(x===ZQ||x===ZR)&&G.flags&&G.flags.ZQ_ZR_ENDED_DAY!=null&&!dating(G,x)&&!S.zzCanRestart(G,x);
  /* 分手以後：子晴第一次在校園遇到「嗨。」（走過去）＝這次不聊；芷若的第一句在吧檯（點餐那一邊，talkCharacter 那一層）；之後閒聊各一句；可以重新開始的那一天她先說（AA_227 6-6）*/
  /* 這一次說話要演哪一段（只讀）：'first'＝子晴第一次「嗨。」、'chat'＝之後各一句、'restart'＝可以重新開始那一天她先說；沒有＝null */
  S.zzPreDue=function(G,id){ const F=G.flags||{}, Z=S.rec(G).zz; if(F.ZQ_ZR_ENDED_DAY==null||(id!==ZQ&&id!==ZR)||dating(G,id)) return null; const o=Z.o||{};
    if(id===ZQ&&!o.first_heroine_04) return 'first';
    if(!o['chat_'+id]&&G.day>(o['first_'+id]!=null?o['first_'+id]:F.ZQ_ZR_ENDED_DAY)) return 'chat';
    if(!o['restart_'+id]&&S.zzCanRestart(G,id)) return 'restart';
    return null; };
  /* 旁邊有她的人（AA_503 第 14 節第 2 項「子晴、芷若分開以後第一次說話：擋」，清單 zz_after）：這一次不演、照常說話；等了 7 天照演（開頭一句旁白）*/
  S.zzPreTalk=async function(GM,who,id){ const G=GM.G, Z=S.rec(G).zz, A=L().ZZ_AFTER, k=S.zzPreDue(G,id); if(!k||!privOk(G,id,GM,'zz_after',k)) return false; const o=Z.o||(Z.o={});
    await privLead(GM,'zz_after',id,k);
    if(k==='first'){ o.first_heroine_04=G.day; await S.run(GM,id,A.first[id],{}); return 'abort'; }
    if(k==='chat'){ o['chat_'+id]=G.day; await S.say(GM,who||S.who(G,id),A.chat[id],{}); return true; }
    o['restart_'+id]=G.day; await S.run(GM,id,A.restart[id],{}); return true; };
  S.zzStartHook=function(G,x){ const F=G.flags||{}; if(F.ZQ_ZR_ENDED_DAY==null||(x!==ZQ&&x!==ZR)||F.RESTART_WITH) return; F.RESTART_WITH=x; S.rec(G).zz.tellAt=T(G.day,(+G.hour||0)+0.25); S.rec(G).zz.tellWho=x; };   /* 重新交往的那一位自己告訴另一位（BB_194 22-3）*/
  S.zzCap=function(G){ const F=G.flags||{}; if(!F.RESTART_WITH||typeof SOCIAL==='undefined'||!SOCIAL.rel) return; const o=F.RESTART_WITH===ZQ?ZR:ZQ, r=SOCIAL.rel(o); if((+r.npcRom||0)>=30) r.npcRom=29; };   /* 另一位：戀愛停在第 4 階以下 */
  S.zzTick=function(G){ if(!law(G)) return null; const Z=S.rec(G).zz, t=now(G);
    if(S.zzDue(G)) return {k:'zz_friday',cap:'週五下午，校園',bg:'ntu_avenue',cut:true,run:async GM=>S.zzFriday(GM)};
    if(Z.calloutAt!=null&&!Z.callout&&t>=Z.calloutAt&&!S.heAbroad(G)) return {k:'zz_callout',x:ZQ,bg:'phone_street_night',run:async GM=>S.zzCallout(GM)};
    if(Z.splitZrAt!=null&&!Z.splitZr&&Z.callout&&t>=Z.splitZrAt&&!S.heAbroad(G)) return {k:'zz_split_zr',x:ZR,cap:'Café 打烊',run:async GM=>S.zzSplitZr(GM)};
    if(Z.tellAt!=null&&!Z.told&&t>=Z.tellAt){ return {k:'zz_tell',cut:true,run:async GM=>{ Z.told=G.day; await S.run(GM,Z.tellWho,L().ZZ_AFTER.tell[Z.tellWho],S.ctx(G,Z.tellWho,null)); }}; }
    return null; };

  /* =================== 六、子晴 Q8 河堤沒遇到、說「改天講」的玩家：下一次見面她第一句（AA_422 4-5）=================== */
  S.zqDadDue=function(G){ const F=G.flags||{}; if(!F.ZQ_DAD_HEARD||F.ZQ_DAD_SAID||typeof PHONE==='undefined'||!PHONE.byAsk) return false; const m=PHONE.byAsk(G,'y2_zq_dad_msg'); return !!(m&&m.ans===0&&G.day>m.day); };
  S.zqDadSay=async function(GM,who){ const G=GM.G; G.flags.ZQ_DAD_SAID=G.day; for(const t of L().ZQ_DAD) await S.say(GM,who||S.who(G,ZQ),t,{}); return true; };

  /* =================== 芷若在英國：每週的視訊（src/zr_uk3d.js，AA_419 第 2 節；AA_425 第 1 節、2-4、2-6）=================== */
  S.zrWeekly=G=>{ if(typeof ZRUK==='undefined'||!ZRUK.playW||S.herAway(G,ZR)!=='video') return false; const w0=DK(ZRUK.W_FROM||'2028-09-01'); return w0!=null&&G.day>=w0; };
  S.ukCallAction=function(G){ if(!law(G)||S.herAway(G,ZR)!=='video') return null; const R=S.rec(G); S.scan(G);
    if(R.pend[ZR]) return async GM=>S.playDisc(GM,ZR,{remote:'video'});
    if(R.cpend[ZR]&&dating(G,ZR)&&dating(G,R.cpend[ZR].y)&&!knows(G,ZR,R.cpend[ZR].y)) return async GM=>S.playConf(GM,ZR,{remote:'video',uk:true});   /* 坦白（AA_436 第 3 節第 1 點 視訊版）*/
    { const y=S.confLaterFor(G,ZR), A=R.cask||{}; if(y&&!A[S.confAskKey(G,ZR,y)]) return async (GM,args)=>{ const ok=await S.confAsk(GM,ZR,y,{uk:true}); if(!ok&&S._pw&&args) return S._pw.apply(ZRUK,args); return ok; }; }   /* 她在英國：每週的視訊開頭問一次；（先不說）＝照常演那一週的話題 */
    const st=R.st[ZR]; if(!st) return null; const y=st.y;
    if(st.phase==='cool'&&G.day>st.day) return async GM=>{ const c=S.ctx(G,ZR,y,{remote:'video'}); await S.run(GM,ZR,RL(ZR).talkUk,c); st.intent=S.intent(G,ZR,c.intent||'unsure'); if(c.promise) S.promise(G,ZR,c.promise,[y]); st.phase='talked'; st.talkDay=G.day; st.uk=true; if(st.intent==='unsure'){ st.phase='distant'; st.result='C'; } };
    if(st.phase!=='talked') return null; let r=null;
    if(S.liedSince(G,ZR,st)) r='D'; else if(!dating(G,y)) r='A'; else if(G.day>=(st.talkDay|0)+7) r=st.intent==='both'?(rom(ZR)>=80&&S.acc(ZR)?'Byes':'Bno'):null;
    return r?async GM=>S.result(GM,ZR,st,r,{uk:true}):null; };

  /* =================== 每一格（STORY.TICKS）=================== */
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['multirel3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.dueAuto=function(G){ if(!law(G)) return null; const R=S.rec(G), t=now(G), h=+G.hour||0; S.scan(G);
    /* 發現：國外／電話；子晴那晚；芷若打烊；語彤顧店；可昕當晚；以安、沛珊讀書會散會 */
    for(const x of S.IDS){ const p=R.pend[x]; if(!p) continue; if(G.day===p.day&&h<p.h) continue; let rm=S.REMOTE_OK[x]?S.remote(G,x):null;
      if(x===KX&&!rm&&pres(G,KX).kind==='home'&&!pres(G,KX).here) rm='video';   /* 可昕寒暑假在高雄：當晚演出來的視訊（不是「我現在過去」）*/
      if(rm&&x===ZR&&S.zrWeekly(G)) continue;   /* 芷若在英國、交往中：每週的視訊裡演（AA_425 第 1 節；ZRUK.playW 那一層）*/
      if(rm&&h>=21&&h<23.5&&(G.day>p.day||p.h<21)) return {k:'disc_remote',x,bg:remoteBg(rm),run:async GM=>S.playDisc(GM,x,{remote:rm})};
      if(rm) continue;
      if(x===ZQ&&h>=22&&S.inTaiwanBoth(G,ZQ)) return {k:'disc',x,bg:'phone_street_night',run:async GM=>S.playDisc(GM,x,{})};
      if(x===ZR&&G.zone==='cafe'){ const e=S.zrShiftEnd(G); if(e!=null&&h>=e-0.25) return {k:'disc',x,blur:true,run:async GM=>S.playDisc(GM,x,{})}; }
      if(x===YT&&G.zone==='noodle'&&S.ytShift(G)) return {k:'disc',x,blur:true,run:async GM=>S.playDisc(GM,x,{})};
      if(x===KX&&h>=21.5&&h<24.5&&(G.day>p.day||p.h<21.5)&&!S.heAbroad(G)) return {k:'disc',x,bg:'phone_street_night',run:async GM=>S.playDisc(GM,x,{})};
      if((x===A1||x===PS)&&G.zone==='wancai'&&G.day>p.day&&S.plgOn(G,G.day)&&h>=21.5&&h<22.5) return {k:'disc',x,bg:x===A1?'wancai_seminar':'girls_dorm_gate',run:async GM=>S.playDisc(GM,x,{})}; }
    { const a=S.kwDue(G); if(a) return a; }   /* 可昕收回：國外、她在高雄＝視訊（AA_474 第 3 節；在臺北＝出遊，S.kwPlan）*/
    { const a=S.confDue(G); if(a) return a; }   /* 祐廷先坦白（AA_429）：說好下次見面講的 */
    { const a=S.confAskDue(G); if(a) return a; }   /* 祐廷在國外：問一次要不要視訊講（AA_436 第 3 節第 3 點）*/
    { const k=S.anRbDue(G); if(k) return {k:'an_rb_'+k,x:A1,bg:'wancai_seminar',run:async GM=>S.anRb(GM,k)}; }   /* 以安重新開始（AA_185 4-1）*/
    { const k=S.ytRbDue(G); if(k) return {k:'yt_rb_'+k,x:YT,blur:true,run:async GM=>S.ytRb(GM,k)}; }   /* 語彤重新開始（AA_185 4-1）*/
    if(S.psEDue(G)&&S.inTainan(G)&&S.psPhoneOk(G)&&!S.heAbroad(G)&&h>=23&&h<25) return {k:'ps_e_phone',x:PS,bg:'phone_street_night',cap:'電話',run:async GM=>S.psE(GM)};   /* 沛珊 E：那學期沒去台南＝她 23:00 以後打來（AA_429 第 3 節）*/
    if(S.ycCutDue(G)) return {k:'yc_cut',cut:true,cap:'沛珊的手機',run:async GM=>S.ycCut(GM)};   /* 宥辰私下傳她的那一句（AA_228 3-4 第 2 次）*/
    if(S.psTurnDue(G)&&S.inTainan(G)&&S.psPhoneOk(G)&&!S.heAbroad(G)&&h>=21.5&&h<23) return {k:'ps_turn_phone',x:PS,bg:'phone_street_night',cap:'電話',run:async GM=>S.psTurn(GM)};   /* 那學期沒去台南：她打電話（AA_422 7-3）*/
    { const z=S.zzTick(G); if(z) return z; }
    for(const x of S.IDS){ const st=R.st[x], F=S.FLOW[x]; if(!st||!F||!F.tick) continue; const a=F.tick(G,st); if(a) return Object.assign({x:a.x!==undefined?a.x:x},a); }
    return null; };
  S.play=async function(GM,a){ if(a.noScene) return a.run(GM); return S.scene(GM,{x:a.cut?null:a.x,bg:a.bg,blur:a.blur,cap:a.cap},()=>a.run(GM)); };
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!law(G)) return false; S._gm=GM; S.rec(G); S.spreadTick(G); S.scan(G); S.zzCap(G); S.ycPhone(G); S.kwTick(G); S.kwPlan(G);
    { const st=S.st(G,KX); if(st) S.kxPhone(G,st); }
    if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return false;   /* 在家：家裡的選單接（y4HomeDue）*/
    const a=S.dueAuto(G); if(!a||!S.free(GM)) return false; busy=true; S._p=S.play(GM,a).catch(e=>console.warn('MREL',a.k,e)).finally(()=>{ busy=false; }); return true; };
  S.phone=function(G,GM){ if(!law(G)) return; S.rec(G); const st=S.st(G,KX); if(st) S.kxPhone(G,st); S.ycPhone(G); S.kwTick(G); S.kwPlan(G); };

  /* =================== 接線 =================== */
  /* 出遊（自己排的：書瑀的小店、可昕的公館、子晴的宵夜、語彤的走廊）*/
  const OUTEV={ id:S.OUT_EV, get title(){ const q=S._q||S._lastQ; return q&&q.place&&q.place!=='視訊'?q.place:''; }, participants:[], location:'any', trigger:'outing', once:false, background:'dark', hours:1,
    beforeOuting:(G,GM,q)=>{ S._q=q; },
    dialogue:[ {call:async(G,GM)=>{ const q=S._q; S._q=null; S._lastQ=q; if(!q||!q.mrel) return; const {x,kind}=q.mrel, st=S.st(G,x);
      if(x===KX&&kind==='withdraw'){ if(typeof ADV!=='undefined'){ if(ADV.setBg&&typeof OUT!=='undefined'&&OUT.bg) ADV.setBg(OUT.bg('gongguan')); if(ADV.speaker) try{ ADV.speaker(x,'neutral'); }catch(e){} } if(GM.caption) GM.caption('',S.KW_PLACE,2400); return S.kxWithdraw(GM,{}); }   /* 可昕收回（AA_474 第 3 節）*/
      if(!st) return; if(typeof ADV!=='undefined'&&ADV.speaker) try{ ADV.speaker(x,'neutral'); }catch(e){}
      if(x===SIS&&kind==='dinner'){ if(typeof ADV!=='undefined'&&ADV.setBg) ADV.setBg(q.call?(OUT.bg?OUT.bg('video'):'video'):(OUT.bg?OUT.bg('y0_lane_shop'):'dark')); return S.sisDinner(GM,st); }
      if(x===KX&&kind==='back'){ if(typeof ADV!=='undefined'&&ADV.setBg&&OUT.bg) ADV.setBg(OUT.bg('gongguan')); return S.kxBack(GM,st); }
      if(x===ZQ&&kind==='talk'){ if(typeof ADV!=='undefined'&&ADV.setBg&&OUT.bg) ADV.setBg(OUT.bg('gongguan')); return S.zqTalk(GM,st); }
      if(x===YT&&kind==='talk2') return S.ytTalk2(GM,st); }} ],
    outingMissed:(G,GM,q)=>{ const m=q&&q.mrel; if(!m||(m.tries|0)>=2) return; S.planOut(G,m.x,m.kind,q.day+1,q.h,Object.assign({},q,{id:undefined,state:undefined,ask:undefined,mrel:undefined,tries:(m.tries|0)+1})); } };
  S.OUTEV=OUTEV;
  if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e.id===OUTEV.id)) STORY_EVENTS.push(OUTEV);
  if(typeof ROM!=='undefined'&&!ROM._mrel){
    const r0=ROM.rec; ROM.rec=function(G){ const r=r0.apply(this,arguments); try{ if(G&&G.flags) S.defaults(G); }catch(e){} return r; };   /* 讀檔時補（game3d.js migrate 叫 ROM.rec）*/
    const s0=ROM.start; ROM.start=function(G,id){ const ok=s0.apply(this,arguments); try{ if(ok) S.zzStartHook(G,id); if(ok&&(id===A1||id===YT)&&G.flags&&G.flags['EX_'+id]) delete G.flags['EX_'+id];
        if(ok&&id===KX){ const s=S.rec(G).st[KX]; if(s&&s.phase==='thinking') s.phase='ended'; } }catch(e){ console.warn('MREL start',e); } return ok; };   /* AA_185 4-1：重新交往那一刻起 EX 清掉、前任版切回交往版；和可昕重新交往＝上一段收回以後的 B 不帶過來 */
    const ya0=ROM.ytAnswer; if(ya0) ROM.ytAnswer=function(G,x){ const r=ya0.apply(this,arguments); try{ if(r==='lied'&&G&&G.flags) S.lieMark(G,x); }catch(e){ console.warn('MREL lie',e); } return r; };   /* 說謊記一筆（S.lieN；可昕收回 ①）*/
    ROM._mrel=true; }
  if(typeof TERMEND!=='undefined'&&!TERMEND._mrel){
    const w0=TERMEND.walkHome; TERMEND.walkHome=async function(GM,who,term){ try{ if(GM&&GM.G&&law(GM.G)&&S.knowWalkDue(GM.G,who,term)) return await S.knowWalk(GM,who,term); }catch(e){ console.warn('MREL knowWalk',e); throw e; } return w0.apply(this,arguments); };
    const h0=TERMEND.heartWhy; TERMEND.heartWhy=function(G,id,w){ if(G&&S.blocked(G,id)) return false; if(G&&S.rebuildBlock(G,id)) return false;   /* 以安、語彤分開以後：祐廷先開口那一場做完以前不發（AA_185 4-1）*/ if(G&&S.zzRefusing(G,id)) return false; if(G&&G.flags&&G.flags.RESTART_WITH&&(id===ZQ||id===ZR)&&G.flags.RESTART_WITH!==id) return false;
      const r=h0.apply(this,arguments); if(r===true&&G&&law(G)&&S.zzPair(G,id)) return {nope:'knows'}; return r; };   /* 子晴知道的是芷若（或反過來）＝知情條件不到（AA_474 1-4、1-5）*/
    TERMEND._mrel=true; }
  if(typeof DATE!=='undefined'&&!DATE._mrel){
    const a0=DATE.arriveLine; DATE.arriveLine=async function(GM,t,visits,o){ const r=await a0.apply(this,arguments); try{ if(!(o&&o.combo)&&GM&&law(GM.G)) await S.dateOpen(GM,t); }catch(e){ console.warn('MREL dateOpen',e); } return r; };
    const q0=DATE.quickPick; if(q0) DATE.quickPick=function(G,id){ if(G&&(S.askDue(G,id)||S.zrQ2Due(G,id))) return null; return q0.apply(this,arguments); };
    const sc0=DATE.scene; DATE.scene=async function(GM,q){ const G=GM&&GM.G, t=G&&q?DATE.trip(G,q.dateTrip):null;
      if(t&&law(G)){ const a=S.meetAction(G,t.who,'date'), was=dating(G,t.who); if(a){ await a.run(GM); if(a.disc||(was&&!dating(G,t.who))){ t.status='cancelled'; return {counted:false}; } } }   /* 發現、分手＝這一趟不去了；結果、談話＝講完照常約會 */
      return sc0.apply(this,arguments); };
    const c0=DATE.complete; DATE.complete=function(G,t){ const r=c0.apply(this,arguments); try{ if(r&&r.counted) S.onTripDone(G,Object.assign({},t,{counted:true})); }catch(e){ console.warn('MREL trip',e); } return r; };
    const m0=DATE.menu; DATE.menu=async function(GM,id,n){ const G=GM&&GM.G; if(G&&S.zzRefusing(G,id)){ await S.run(GM,id,L().ZZ_AFTER.refuseL3[id],{}); return null; }
      if(G&&G.flags&&G.flags.RESTART_WITH&&(id===ZQ||id===ZR)&&G.flags.RESTART_WITH!==id){ await S.run(GM,id,L().ZZ_AFTER.refuseL3[id],{}); return null; }   /* 另一位不接受 L3 */
      return m0.apply(this,arguments); };
    DATE._mrel=true; }
  /* 戀愛 CG 照她知道的事情放（AA_185 4-2，任務 AA185-V6；AA_123 第 1 節第 8 點改指向這裡）：她的 CG（assets/cg/<她>/）在和她交往中的時候——
     她知道祐廷還在和別人交往、而且沒有同意（OPEN_OK；acceptsOpen）＝不放；以前被發現過（退回朋友 friend_after_catch，或被發現、坦白以後分開）之後的這一段交往＝不放；她不知道＝照常放。
     不放＝ADV.cg 回 false、畫面照舊（已經看過的留在相簿，G.cg.unlocked 不動）。沒有在和她交往的時候（朋友的場景、告白以前）不管。 */
  S.cgOwner=id=>{ const r=typeof CG_REGISTRY!=='undefined'?CG_REGISTRY[id]:null, m=r&&/assets\/cg\/([a-z_0-9]+)\//.exec(r.file||''); return m&&S.IDS.includes(m[1])?m[1]:null; };
  S.caughtBefore=function(G,x){ if(typeof ROM==='undefined'||!ROM.get) return false; const R=ROM.get(G,x); if(R.status==='friend_after_catch') return true;
    return (R.history||[]).some(e=>e&&e.ev==='end'&&S.CAUGHT_HOW.includes(e.how)); };
  S.cgBlocked=function(G,id){ if(!G||!law(G)) return false; const x=S.cgOwner(id); if(!x||!dating(G,x)) return false; return S.knownOthers(G,x).length>0||S.caughtBefore(G,x); };
  if(typeof ADV!=='undefined'&&ADV.cg&&!ADV._mrelCg){ const cg0=ADV.cg; ADV.cg=function(id){ try{ const G=S._gm&&S._gm.G||(typeof GAME!=='undefined'&&GAME.G); if(G&&S.cgBlocked(G,id)) return false; }catch(e){ console.warn('MREL cg',e); } return cg0.apply(this,arguments); }; ADV._mrelCg=true; }
  if(typeof ZRUK!=='undefined'&&ZRUK.playW&&!ZRUK._mrel){ const pw=ZRUK.playW; S._pw=pw; ZRUK.playW=async function(G,GM){ try{ const a=G&&S.ukCallAction(G); if(a) return await a(GM,arguments); }catch(e){ console.warn('MREL zr uk',e); } return pw.apply(this,arguments); }; ZRUK._mrel=true; }   /* 每週的視訊那一通：發現、挽回、結果在這裡演（演了就不演那週的話題）*/
  if(typeof EVENTS!=='undefined'&&!EVENTS._mrel){ const e0=EVENTS.run; EVENTS.run=async function(ev){ const r=await e0.apply(this,arguments); try{ const GM=S._gm; if(GM&&ev) await S.afterEvent(GM,ev); }catch(e){ console.warn('MREL afterEvent',e); } return r; }; EVENTS._mrel=true; }
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(S.tick);
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(S.phone);
    /* 旁邊有她的人（COMPANY-PRIV-1028，清單 src/privtalk3d.js）：子晴爸爸那一句、沛珊「對一次」這一次不說，等她一個人（等了 7 天／到期那天照說，開頭一句旁白：privLead）*/
    if(Array.isArray(STORY.PRE_TALK)) STORY.PRE_TALK.push(async(GM,who,id)=>{ const G=GM.G; if(!law(G)) return; if(id===ZQ&&S.zqDadDue(G)&&privOk(G,ZQ,GM,'zq_dad_pre')){ await privLead(GM,'zq_dad_pre',ZQ); await S.zqDadSay(GM,who); }
      const st=S.st(G,id); if(st&&id===PS&&st.result==='B'&&st.bTerm&&typeof CALENDAR!=='undefined'){ const T0=CALENDAR.termOf(G.day); if(T0&&T0.week===1&&!st.bTerm[T0.id]&&privOk(G,PS,GM,'ps_bterm')){ st.bTerm[T0.id]=G.day; await privLead(GM,'ps_bterm',PS); await S.run(GM,PS,RL(PS).result.Bterm,{}); } }   /* 每學期第一週她提一次「對一次」*/ });
    if(Array.isArray(STORY.TALK_OPTS)) STORY.TALK_OPTS.push((G,id)=>{ const y=S.confLaterFor(G,id); if(!y) return []; return [{t:S.confLaterOpt(G,id,y),priv:true,run:async()=>S.confLater(G,id,y),privKey:'tell_later'}]; });   /* AA_429：系統選項，下次見面演 */
    if(Array.isArray(STORY.TALK_OPTS)) STORY.TALK_OPTS.push((G,id)=>{ const y=S.confessAny(G,id); if(!y) return []; const p=pres(G,id); if(!p.here) return []; return [{t:S.CONFESS_OPT[id],priv:true,run:async(GM)=>S.confess(GM,id,y),privKey:'tell_now'}]; });   /* priv：私密的話題——她旁邊有她的人時不出（女主角的圈子，AA_503 第 2 節；story3d.js offerInvite、src/hcircle3d.js）；privKey＝清單上那一筆（各自等 7 天）*/
    if(!STORY._mrelTalk&&STORY.talkCharacter){ const t0=STORY.talkCharacter; STORY.talkCharacter=async function(id,n){ const GM=S._gm, G=GM&&GM.G;
        if(G&&law(G)&&S.IDS.includes(id)){ try{
          const cafe=n&&n.staff==='cafe';
          if(cafe&&id===ZR){ const st=S.st(G,ZR); const a=st&&S.FLOW.heroine_02.meet(G,st,'cafe'); if(a){ let r; GM.sceneBegin({adv:id}); try{ r=await a.run(GM); } finally{ GM.sceneEnd(); } if(r!=='left') return; }
            const Z=S.rec(G).zz.o||{}; if(G.flags.ZQ_ZR_ENDED_DAY!=null&&!Z.first_heroine_02&&!dating(G,ZR)&&privOk(G,ZR,GM,'zz_after','first')){ (S.rec(G).zz.o||(S.rec(G).zz.o={})).first_heroine_02=G.day; GM.sceneBegin({adv:id}); try{ await privLead(GM,'zz_after',ZR,'first'); await S.run(GM,ZR,L().ZZ_AFTER.first[ZR],{}); } finally{ GM.sceneEnd(); } } }   /* 分開以後第一句（AA_503 第 14 節第 2 項：旁邊有她的人＝這一次不說，照常點餐）*/
          else if(!cafe&&!(typeof INV!=='undefined'&&INV.meetable&&INV.meetable(G,id))){ const kind=G.zone==='noodle'&&id===YT?'noodle':'talk'; let a=S.meetAction(G,id,kind); if(!a&&kind==='noodle') a=S.meetAction(G,id,'talk');
            if(!a&&(id===ZQ||id===ZR)&&G.flags.ZQ_ZR_ENDED_DAY!=null&&!dating(G,id)){ const o=(S.rec(G).zz.o||{}); if(!o['first_'+id]&&id===ZQ&&privOk(G,ZQ,GM,'zz_after','first')) a={abort:true,run:async GM2=>{ await S.zzPreTalk(GM2,S.who(G,id),id); }}; }   /* 旁邊有她的人＝這一次不演「嗨。」、照常說話（AA_503 第 14 節第 2 項）*/
            if(a){ GM.sceneBegin({adv:id}); try{ await a.run(GM); } finally{ GM.sceneEnd(); } if(a.abort) return; } } }catch(e){ console.warn('MREL talk',e); } }
        return t0.apply(this,arguments); }; STORY._mrelTalk=true; }
    if(Array.isArray(STORY.PRE_TALK)) STORY.PRE_TALK.push(async(GM,who,id)=>{ const G=GM.G; if(law(G)&&(id===ZQ||id===ZR)&&G.flags.ZQ_ZR_ENDED_DAY!=null) await S.zzPreTalk(GM,who,id); });
    if(!STORY._mrelHome){ const hd0=STORY.y4HomeDue, hf0=STORY.y4FromHome;
      STORY.y4HomeDue=function(G){ const r=hd0?hd0.apply(this,arguments):null; if(r) return r; try{ const a=S.dueAuto(G); return a&&!a.noScene?'mrel':null; }catch(e){ return null; } };
      STORY.y4FromHome=function(GM,k){ if(k==='mrel'){ const a=S.dueAuto(GM.G); return a?S.play(GM,a):null; } return hf0?hf0.apply(this,arguments):null; };
      STORY._mrelHome=true; } }
  if(typeof OUT!=='undefined'&&Array.isArray(OUT.BEFORE)) OUT.BEFORE.push(async(GM,q,ev)=>{ const G=GM.G; if(!law(G)||!q||q.dateTrip||q.mrel) return; const who=(q.te&&q.te.who)||(ev&&(ev.participants||[])[0]); if(!who) return;
    if(who===ZQ&&S.zqDadDue(G)) await S.zqDadSay(GM,null);
    if(who===KX){ const a=S.meetAction(G,KX,'out'); if(a) await a.run(GM); } });   /* 和可昕的出遊（我們的日子…）開頭：《我們以前不是這樣的》、結果 */
  return S;
})();
if(typeof window!=='undefined') window.MREL=MREL;

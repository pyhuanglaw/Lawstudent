/* ===== 多段感情的系統（v6；現行規則＝企劃線 AA_140 第 0 節、AA_126 第 9 節、AA_128 4-5）=====
   使用者 2026-10-14：「我希望大學四年不只跟一個女生交往是成立的」；2026-10-16 約 02:10：**可以同時和多位交往**，同時保留只和一人交往、分開以後再開始下一段的玩法。
   v6 交付清單 S1「dating_* 同一時間最多一個」已作廢（AA_140 0-2 X1）。
   - G.flags.romance[id]＝{status, since, knows:[], suspicion, history:[]}（AA_126 9-1）：
       status：none／dating（交往中）／ex（前任）／paused（對質後「等你說清楚」，V6-CATCH）／friend_after_catch（被發現後退回朋友，V6-CATCH）；
       knows：她知道的、祐廷「其他」伴侶（AA_128 4-5：她知道祐廷現在還在交往的人，才擋正式單獨約會；分開以後就不擋）；suspicion：0～100。
   - dating_<id>（舊的旗標，大量事件用它當條件）和 status 同步：dating ⇔ dating_<id> true。
   - 每一段關係各自計算：分開只有那一段變 ex、記 EX_<id>；其他交往中的不受影響。
   - CLEANUP_DONE（收拾的時刻）只擋「分開以後開始一段新的交往」；從沒分開過、同時交往中再告白，不需要（AA-B 2026-10-16 02:09）。
   - G.flags.ROMANCE_HISTORY：每一段一筆 {id, from, to, how}（S2，舊存檔也有）；<人物>_CRACK：每一段自己的裂縫計數。
   - 存檔（S7）：新欄位都有預設值；第一次讀檔時補（game3d.js migrate 呼叫 ROM.rec）；不在標題畫面改任何東西。
   測試：node tests/romance_unit.js */
'use strict';
const ROM=(function(){
  const S={};
  S.CRACK={heroine_01:'AN_CRACK',heroine_03:'YT_CRACK',classmate_peishan:'PS_CRACK',heroine_05:'SIS_CRACK',heroine_02:'ZR_CRACK',heroine_04:'ZQ_CRACK',kexin:'KX_CRACK'};
  /* 0-3 P1、P2：還沒經使用者確認的數字，照提案值做成可調參數（AA_126 9-2、9-3；BB_125 第 0 節；AA_127）*/
  S.PARAMS={ suspectAsk:40, caughtAt:80, weeklyDecay:5,
    acceptsOpen:{heroine_01:false,heroine_03:false,heroine_02:false,heroine_04:false,heroine_05:false,classmate_peishan:false,kexin:false},
    dropTo:{heroine_01:'FRIEND',heroine_03:'FRIEND',heroine_02:'FRIEND',heroine_04:'FRIEND',heroine_05:'FRIEND',classmate_peishan:'CLOSE_FRIEND',kexin:'FRIEND'},
    restartWeeks:{heroine_05:6}, restartWeeksDefault:4 };
  /* 法律系開場和可昕交往中：以安、語彤、沛珊知道（麵店團；AA_128 4-5、AA_140 0-4「麵店團 K3 起」＝中秋烤肉可昕來過 KX_MET_NOODLE_TEAM）；
     芷若、子晴、學姊不知道（照常約，懷疑照 9-2）。這條是規則，不存進 knows（舊存檔不用搬資料）*/
  S.KEXIN_KNOWN={who:['heroine_01','heroine_03','classmate_peishan'],flag:'KX_MET_NOODLE_TEAM'};
  /* 現在是哪個學期第幾週：'Y1S1W5'；不在學期裡（寒暑假）＝'D'＋第幾天 */
  S.when=function(G){ const T=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; return T?T.id+'W'+(T.week|0):'D'+G.day; };
  const blank=()=>({status:'none',since:null,knows:[],suspicion:0,history:[]});
  S.rec=function(G){ const F=G.flags||(G.flags={});
    if(!Array.isArray(F.ROMANCE_HISTORY)){ F.ROMANCE_HISTORY=[];
      for(const k in F) if(/^dating_/.test(k)&&F[k]===true) F.ROMANCE_HISTORY.push({id:k.slice(7),from:k==='dating_kexin'?'Y0':S.when(G),to:null,how:null}); }   /* 舊存檔：可昕從經濟系那一年就在交往（BB_104）*/
    if(F.CLEANUP_DONE===undefined) F.CLEANUP_DONE=true;
    if(!F.romance||typeof F.romance!=='object') F.romance={};
    for(const k in F) if(/^dating_/.test(k)){ const id=k.slice(7), R=F.romance[id]||(F.romance[id]=blank()); if(F[k]===true&&R.status!=='dating'){ R.status='dating'; R.since=R.since||(id==='kexin'?'Y0':S.when(G)); } }
    for(const k in F) if(/^EX_/.test(k)&&F[k]){ const id=k.slice(3), R=F.romance[id]||(F.romance[id]=blank()); if(R.status==='none') R.status='ex'; }
    return F.ROMANCE_HISTORY; };
  S.get=function(G,id){ S.rec(G); return G.flags.romance[id]||(G.flags.romance[id]=blank()); };
  S.partners=function(G){ const F=G.flags||{}; return Object.keys(F).filter(k=>/^dating_/.test(k)&&F[k]===true).map(k=>k.slice(7)); };
  S.current=G=>S.partners(G)[0]||null;   /* 舊的介面：只要一位的時候用 */
  S.isEx=(G,id)=>!!(G.flags&&G.flags['EX_'+id]);
  /* 她知道祐廷現在還在交往的哪些人（不含她自己；分開了的不算）*/
  S.knows=function(G,x){ const P=S.partners(G).filter(p=>p!==x); if(!P.length) return []; const F=G.flags||{}; const R=(F.romance&&F.romance[x])||null;
    const K=new Set(R&&Array.isArray(R.knows)?R.knows:[]); if(P.includes('kexin')&&S.KEXIN_KNOWN.who.includes(x)&&F[S.KEXIN_KNOWN.flag]) K.add('kexin');
    return P.filter(p=>K.has(p)); };
  /* 她知道了（AA_126 9-2a 第 4 級：祐廷親口說、被問時承認、對質、劇情事件裡看到明確的戀人舉動；一般社交不會到這裡）*/
  S.learn=function(G,x,p){ const R=S.get(G,x); if(!R.knows.includes(p)) R.knows.push(p); };
  /* 開始新的一段：她不是交往中／等你說清楚；被發現退回朋友的要過了重新開始的週數；最近一次分開以後收拾過了（CLEANUP_DONE）。
     已經有別的伴侶不擋（X1）；她答不答應（個性、她知道什麼、告白條件 AA_128 3-2）由告白事件判斷 */
  S.canStart=function(G,id){ const R=S.get(G,id); if(R.status==='dating'||R.status==='paused') return false;
    if(R.status==='friend_after_catch'&&R.restartDay!=null&&G.day<R.restartDay) return false;
    return G.flags.CLEANUP_DONE!==false; };
  S.start=function(G,id){ if(!S.canStart(G,id)) return false; const F=G.flags, R=S.get(G,id); F['dating_'+id]=true; R.status='dating'; R.since=S.when(G); R.suspicion=0; R.history.push({ev:'start',at:S.when(G)});
    S.rec(G).push({id,from:S.when(G),to:null,how:null}); if(S.CRACK[id]) F[S.CRACK[id]]=0; return true; };
  /* 修補：歷史不變、裂縫歸零 */
  S.mend=function(G,id){ if(S.CRACK[id]) G.flags[S.CRACK[id]]=0; };
  S.crack=function(G,id,n){ const k=S.CRACK[id]; if(!k) return 0; G.flags[k]=(+G.flags[k]||0)+(n==null?1:n); return G.flags[k]; };
  /* 分開（只有這一段）：dating false、EX true、歷史填上 to 和 how、CLEANUP_DONE false（一週內收拾）；別人知道的 knows 裡這一位自然不再算（knows 只看現在還在交往的人）*/
  S.end=function(G,id,how){ const F=G.flags; if(F['dating_'+id]!==true) return false; F['dating_'+id]=false; F['EX_'+id]=true; const R=S.get(G,id); R.status='ex'; R.history.push({ev:'end',at:S.when(G),day:G.day,how:how||'apart_talk'});   /* day：分手的那一天（以安的戀愛前置要算 28 天，AA_128）；舊紀錄沒有，STORY.breakupDaysAgo 用 at 估 */
    const H=S.rec(G); for(let i=H.length-1;i>=0;i--) if(H[i].id===id&&H[i].to==null){ H[i].to=S.when(G); H[i].how=how||'apart_talk'; break; }
    F.CLEANUP_DONE=false; F.cleanupDue=G.day+7; if(S.CRACK[id]) F[S.CRACK[id]]=0; return true; };
  S.cleanup=function(G){ G.flags.CLEANUP_DONE=true; G.flags.cleanupDue=null; };
  /* 懷疑（AA_126 9-2；只照實際發生的事累積，不用亂數）：已經 ≥ suspectAsk 又有新證據＝加倍；回傳新的值 */
  S.suspect=function(G,id,n){ const R=S.get(G,id); const add=(R.suspicion>=S.PARAMS.suspectAsk&&n>0)?n*2:n; R.suspicion=Math.max(0,Math.min(100,(R.suspicion|0)+add)); return R.suspicion; };
  S.weekly=function(G){ S.rec(G); for(const id in G.flags.romance){ const R=G.flags.romance[id]; if(R.suspicion>0) R.suspicion=Math.max(0,R.suspicion-S.PARAMS.weeklyDecay); } };
  /* 前任：她之後的事件用「前任版」（條件寫 flags:['EX_<id>']）；不在尾聲的長桌（v5 第 0b 節）*/
  S.exes=G=>Object.keys(G.flags||{}).filter(k=>/^EX_/.test(k)&&G.flags[k]).map(k=>k.slice(3));
  return S;
})();

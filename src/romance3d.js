/* ===== 多段感情的系統（v6；現行規則＝企劃線 AA_140 第 0 節、AA_126 第 9 節、AA_128 4-5）=====
   使用者 2026-10-14：「我希望大學四年不只跟一個女生交往是成立的」；2026-10-16 約 02:10：**可以同時和多位交往**，同時保留只和一人交往、分開以後再開始下一段的玩法。
   v6 交付清單 S1「dating_* 同一時間最多一個」已作廢（AA_140 0-2 X1）。
   - G.flags.romance[id]＝{status, since, knows:[], suspicion, history:[]}（AA_126 9-1）：
       status：none／dating（交往中）／ex（前任）／paused（對質後「等你說清楚」，V6-CATCH）／friend_after_catch（被發現後退回朋友，V6-CATCH）；
       knows：舊欄位（2026-10-17 起搬到 G.flags.knowsRel，見下面）；suspicion：舊欄位，不再讀寫。
       她知道祐廷現在還在交往的人，才擋正式單獨約會（AA_128 4-5；分開以後就不擋）：ROM.knows。
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
  S.PARAMS={
    acceptsOpen:{heroine_01:false,heroine_03:false,heroine_02:false,heroine_04:false,heroine_05:false,classmate_peishan:false,kexin:false},
    dropTo:{heroine_01:'FRIEND',heroine_03:'FRIEND',heroine_02:'FRIEND',heroine_04:'FRIEND',heroine_05:'FRIEND',classmate_peishan:'CLOSE_FRIEND',kexin:'FRIEND'},
    restartWeeks:{heroine_05:6}, restartWeeksDefault:4 };
  /* 誰知道祐廷在和誰交往（knowsRel；BB_191 第 1、9 節 @08429294、第 10 節 @f3ae0e82；AA_218 17-7／17-8／17-10／17-11；使用者 2026-10-17「大家一開始都不知道祐廷有女友」）：
     G.flags.knowsRel[X][P]＝{state:'confirmed', source, day}：X 知道祐廷在和 P 交往；沒有這一筆＝不知道。X 是任何人（阿哲、小語、柏翰這些不是戀愛對象的也算），所以不放在 romance[X] 裡。
     只寫 'confirmed'（使用者刪掉「自己看到」「第三人轉述」兩種來源，不再有 'suspects'；欄位保留）。**寫入一律走 ROM.learn。**
     來源：在場（K3 選①「這是可昕，我女朋友。」）、朋友聊天傳開 told_by:<Y>（一次一層；S.spreadTick）、祐廷自己說 yt_told（ROM.tellBy）、子晴問阿凱 told_by:kai（9-7；S.zqAskTick、ev_zq_ask_kai）。
     阿凱（室友）一定知道可昕。知道過就是知道過（分手不刪）。原本的固定名單 KEXIN_KNOWN（以安、語彤、沛珊在 KX_MET_NOODLE_TEAM 以後一律知道）拿掉（9-4 #1）。
     knowsGF(X)＝X 知道可昕（knowsRel[X].kexin）。舊欄位 romance[X].knows 第一次讀檔搬進來，之後不再讀寫。
     ytKnows[X][P]：祐廷知道 X 知道 P（旁白、選項讀這個；她自己的台詞讀 knowsRel）。預設沒有＝false。 */
  const sub=(F,k)=>{ if(!F[k]||typeof F[k]!=='object') F[k]={}; return F[k]; };
  S.relRec=G=>sub(G.flags||(G.flags={}),'knowsRel');
  S.ytRec=G=>sub(G.flags||(G.flags={}),'ytKnows');
  S.knowsOf=(G,x,p)=>(x==='kai'&&p==='kexin')||!!((S.relRec(G)[x]||{})[p]);
  S.learn=function(G,x,p,source,at){ const M=sub(S.relRec(G),x); if(M[p]) return false; M[p]={state:'confirmed',source:source||'',day:at?at.day:G.day,h:+(at?at.h:(G.hour||0)).toFixed(2)}; return true; };   /* at：傳開的時候記兩人見面的那一刻（不是玩家發現的這一刻）*/
  S.ytKnows=(G,x,p)=>!!((S.ytRec(G)[x]||{})[p]);
  S.tellYt=(G,x,p)=>{ sub(S.ytRec(G),x)[p]=true; };
  S.tellBy=(G,x,p)=>{ S.learn(G,x,p,'yt_told'); S.tellYt(G,x,p); };   /* 祐廷自己說：她知道，他也知道她知道 */
  S.knowsGF=(G,x)=>S.knowsOf(G,x,'kexin');
  S.gfNow=(G,x)=>!!(G.flags&&G.flags.dating_kexin)&&S.knowsGF(G,x);   /* 祐廷現在和可昕交往中，而且她知道：她的台詞、選項、條件讀這個（不讀 dating_kexin）*/
  S.K3_PRESENT=['yu','heroine_01','heroine_03','classmate_bohan','npc_fangyt'];   /* K3 中秋烤肉：阿哲一定在；這五位各自 STORY.knows 才在場（events.js ev_mid_autumn_bbq）*/
  S.k3Tell=function(G){ if(!G.flags||G.flags.KX_INTRO!=='gf') return; const at=['zhe'].concat(S.K3_PRESENT.filter(id=>typeof STORY!=='undefined'&&STORY.knows&&STORY.knows(id,G)));
    for(const id of at){ S.learn(G,id,'kexin','ev_mid_autumn_bbq'); S.tellYt(G,id,'kexin'); } };   /* 他當著大家的面介紹的：在場的人知道，他也知道他們知道 */
  /* 傳開（BB_191 9-3、9-7、9-8；AA_218 17-10、17-11）：只有 SPREAD 這幾組會傳，一次一層、不擲骰；記的 day／h＝兩人下一次一起出現的那一刻。
     以安→沛珊：大二上第 6 週以後、以安知道以後的下一次公法讀書會週四（散會 21:30 一起走回女舍）；子晴⇄芷若：知道以後的下一個週五 14～16，兩人的作息同時在校園（芷若在英國的學期不算）。
     小語→子晴：BB 寫「定以前不傳」；語彤、阿哲、小語、柏翰、方奕廷知道了也不傳給女主角；沛珊聽說以後不再往下傳（她的朋友圈沒有表上的人）。
     阿凱（室友）一定知道、不主動說：只有子晴問的時候（zqAsk：子晴第 5 階以上、沒和祐廷交往、還不知道、祐廷和可昕交往中 → 第一個上課日 17:00 資工系下課；那晚睡覺時演 ev_zq_ask_kai）。
     不是每一幀都從頭算：F.spreadScan 記每一組看到哪一天（存檔讀進來很久以後也會補到正確的那一天）*/
  S.CAMPUS_ZONES=['campus','linze','classroom','wancai','library','library_hall','lawlib','soclib','boya','putong','gym','gym_b1'];
  S.SPREAD=[{from:'heroine_01',to:'classmate_peishan',meet:'plg'},{from:'heroine_04',to:'heroine_02',meet:'fri'},{from:'heroine_02',to:'heroine_04',meet:'fri'}];
  const onCampus=(G,id,day,hh,wd)=>{ if(typeof STORY==='undefined'||!STORY.schedEnt||typeof CHARACTERS==='undefined'||!CHARACTERS[id]) return false; const Gx=Object.assign({},G,{day,hour:hh,weekday:wd});
    if(STORY.presence&&!STORY.presence(id,Gx).here) return false; const e=STORY.schedEnt(CHARACTERS[id],Gx); return !!(e&&e.zone&&S.CAMPUS_ZONES.includes(e.zone)); };
  S.meetOn=function(G,r,day){ if(typeof CALENDAR==='undefined') return null; const wd=CALENDAR.dateOf(day).wd%7;
    if(r.meet==='plg'){ if(wd!==4||typeof ACTIVITIES==='undefined'||!ACTIVITIES.list) return null; const d0=typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay('Y2S1',6,1):null; if(d0==null||day<d0) return null;
      const a=ACTIVITIES.list.find(x=>x.id==='public_law_group'); if(!a||!ACTIVITIES.on(a,day,G)) return null;
      const Gx=Object.assign({},G,{day,hour:a.t0,weekday:4}), at=id=>{ if(typeof STORY==='undefined'||!STORY.presence) return true; const p=STORY.presence(id,Gx); return p.here||p.kind==='taipei'; };
      return at(r.from)&&at(r.to)?{t0:a.t0,t1:a.t1}:null; }   /* 兩人都要出席（BB-C 16:42）：沛珊聯絡不到的那段（2026-12-18～2027-08-06）、以安在日本不算；沛珊回來以後在別的學校（taipei）照常來讀書會 */
    if(r.meet==='fri'){ if(wd!==5) return null; for(const hh of [14.25,14.75,15.25,15.75]) if(onCampus(G,r.from,day,hh,5)&&onCampus(G,r.to,day,hh,5)) return {t0:14,t1:16}; return null; }
    return null; };
  S.spreadTick=function(G){ if(!G||!G.flags) return 0; const F=G.flags, R=S.relRec(G), scan=F.spreadScan&&typeof F.spreadScan==='object'?F.spreadScan:(F.spreadScan={}), now=G.day*24+(G.hour||0); let n=0;
    for(const r of S.SPREAD){ const src=(R[r.from]||{}).kexin; if(!src||S.knowsOf(G,r.to,'kexin')) continue; const key=r.from+'>'+r.to, tk=src.day*24+(src.h!=null?src.h:24);   /* 舊存檔沒有 h：當成那天晚上才知道 */
      let d=Math.max(src.day,scan[key]!=null?scan[key]+1:src.day); const end=Math.min(G.day,d+800);
      for(;d<=end;d++){ if(d===G.day&&(G.hour||0)<(r.meet==='fri'?16:21.5)) break;   /* 今天的見面還沒結束：先不算（作息每一幀算一次太貴）*/ const m=S.meetOn(G,r,d); if(m&&d*24+m.t0>tk){ if(d*24+m.t1>now) break; S.learn(G,r.to,'kexin','told_by:'+r.from,{day:d,h:m.t1}); n++; break; } scan[key]=d; } }
    return n; };
  S.zqAskReady=function(G){ const F=G.flags||{}; if(!F.dating_kexin||F.dating_heroine_04||F.ZQ_ASK_KAI_D!=null||S.knowsGF(G,'heroine_04')) return false;
    return typeof DATE!=='undefined'&&DATE.stageNum&&DATE.stageNum('heroine_04')>=5; };
  S.zqAskTick=function(G){ const F=G.flags||{}; if(!S.zqAskReady(G)||(G.hour||0)<17||typeof CALENDAR==='undefined') return false; const wd=CALENDAR.dateOf(G.day).wd%7, T=CALENDAR.termOf(G.day);
    if(wd<1||wd>5||!T||CALENDAR.holiday(G.day)) return false; if(typeof STORY!=='undefined'&&STORY.presence&&(!STORY.presence('heroine_04',G).here||!STORY.presence('kai',G).here)) return false; if(!onCampus(G,'heroine_04',G.day,16.5,wd)) return false; F.ZQ_ASK_KAI_D=G.day;   /* 那天是子晴在校園的日子（BB-C 16:42：二、四、五 14～17，照她的作息）*/ S.learn(G,'heroine_04','kexin','told_by:kai',{day:G.day,h:17}); return true; };   /* 上課日（學期中、不是國定假日）的 17:00 以後第一次看到條件都成立＝那天 17:00 問的；ytKnows 不變（祐廷不知道）*/
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
    if(!F.knowsRel_V){ F.knowsRel_V=1; S.relRec(G); S.ytRec(G);
      for(const id in F.romance){ const K=F.romance[id].knows; if(Array.isArray(K)) for(const p of K) S.learn(G,id,p,'legacy'); }   /* 舊欄位 romance[X].knows（祐廷親口說的）搬過來 */
      S.k3Tell(G); }   /* 舊存檔：KX_MET_NOODLE_TEAM 不再當成以安、語彤、沛珊知道；K3 選了「女朋友」（KX_INTRO:'gf'）的，照存檔裡認識的人補（BB_191 9-4 舊存檔）*/
    return F.ROMANCE_HISTORY; };
  S.get=function(G,id){ S.rec(G); return G.flags.romance[id]||(G.flags.romance[id]=blank()); };
  S.partners=function(G){ const F=G.flags||{}; return Object.keys(F).filter(k=>/^dating_/.test(k)&&F[k]===true).map(k=>k.slice(7)); };
  S.current=G=>S.partners(G)[0]||null;   /* 舊的介面：只要一位的時候用 */
  S.isEx=(G,id)=>!!(G.flags&&G.flags['EX_'+id]);
  /* 她知道祐廷現在還在交往的哪些人（不含她自己；分開了的不算）*/
  S.knows=function(G,x){ S.rec(G); return S.partners(G).filter(p=>p!==x&&S.knowsOf(G,x,p)); };
  /* 開始新的一段：她不是交往中／等你說清楚；被發現退回朋友的要過了重新開始的週數；最近一次分開以後收拾過了（CLEANUP_DONE）。
     已經有別的伴侶不擋（X1）；她答不答應（個性、她知道什麼、告白條件 AA_128 3-2）由告白事件判斷 */
  S.canStart=function(G,id){ const R=S.get(G,id); if(R.status==='dating'||R.status==='paused') return false;
    if(R.status==='friend_after_catch'&&R.restartDay!=null&&G.day<R.restartDay) return false;
    return G.flags.CLEANUP_DONE!==false; };
  /* 改交往狀態之前先叫的（ROM.BEFORE.push(fn)；fn(G)）：story3d.js 的 STORY.routeWatch——交換路線照 2027-11-18 12:00 那一刻的交往狀態定，
     截止已經過了、還沒定的（玩家一直坐著、在劇情裡），先照改之前的狀態定（1A-02，BB-C 10-20）。丟例外不影響交往 */
  S.BEFORE=[];
  const before=G=>{ for(const f of S.BEFORE){ try{ f(G); }catch(e){ console.warn('ROM.BEFORE',e); } } };
  S.start=function(G,id){ if(!S.canStart(G,id)) return false; before(G); const F=G.flags, R=S.get(G,id); F['dating_'+id]=true; R.status='dating'; R.since=S.when(G); R.sinceDay=G.day; R.sinceH=+(+G.hour||0).toFixed(2); R.suspicion=0; R.history.push({ev:'start',at:S.when(G)});   /* sinceH：開始的時刻（G.hour；過了 24＝隔天凌晨），STORY.routeFor 判斷是不是截止以後才開始的 */
    S.rec(G).push({id,from:S.when(G),to:null,how:null}); if(S.CRACK[id]) F[S.CRACK[id]]=0; return true; };
  /* 修補：歷史不變、裂縫歸零 */
  S.mend=function(G,id){ if(S.CRACK[id]) G.flags[S.CRACK[id]]=0; };
  S.crack=function(G,id,n){ const k=S.CRACK[id]; if(!k) return 0; const d=n==null?1:n; G.flags[k]=(+G.flags[k]||0)+d; if(d>0) G.flags[k+'_DAY']=G.day; return G.flags[k]; };   /* <人物>_CRACK_DAY：最近一次裂縫增加的那一天（1A-04 第 4 節第 4 點：最近 14 天內有裂縫的交往對象不問「那一句」，story3d.js S.coldWeekCast）*/
  /* 分開（只有這一段）：dating false、EX true、歷史填上 to 和 how、CLEANUP_DONE false（一週內收拾）；別人知道的 knows 裡這一位自然不再算（knows 只看現在還在交往的人）*/
  S.end=function(G,id,how){ const F=G.flags; if(F['dating_'+id]!==true) return false; before(G); F['dating_'+id]=false; F['EX_'+id]=true; const R=S.get(G,id); R.status='ex'; R.history.push({ev:'end',at:S.when(G),day:G.day,how:how||'apart_talk'});   /* day：分手的那一天（以安的戀愛前置要算 28 天，AA_128）；舊紀錄沒有，STORY.breakupDaysAgo 用 at 估 */
    const H=S.rec(G); for(let i=H.length-1;i>=0;i--) if(H[i].id===id&&H[i].to==null){ H[i].to=S.when(G); H[i].how=how||'apart_talk'; break; }
    F.CLEANUP_DONE=false; F.cleanupDue=G.day+7; if(S.CRACK[id]) F[S.CRACK[id]]=0; return true; };
  S.cleanup=function(G){ G.flags.CLEANUP_DONE=true; G.flags.cleanupDue=null; };
  /* 懷疑值（suspicion）不再累積也不讀（BB_191 第 1 節：使用者刪掉「自己看到」「第三人轉述」；欄位留在存檔裡）。ROM.suspect、ROM.weekly 拿掉 */
  /* 前任：她之後的事件用「前任版」（條件寫 flags:['EX_<id>']）；不在尾聲的長桌（v5 第 0b 節）*/
  S.exes=G=>Object.keys(G.flags||{}).filter(k=>/^EX_/.test(k)&&G.flags[k]).map(k=>k.slice(3));
  return S;
})();

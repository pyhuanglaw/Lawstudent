/* ===== 多段感情的系統（交接包 v6 第 1 節 S1～S3、S7；AA_123 第 2 節）=====
   使用者 2026-10-14：「我希望大學四年不只跟一個女生交往是成立的」（v9.7 之後的版本；AA 看過、可以開發）。
   - dating_<id>（現有）：正在交往的人，同一時間最多一個是 true（S1）。開始新的一段前用 ROM.canStart 檢查。
   - G.flags.ROMANCE_HISTORY（S2）：每一段一筆 {id, from, to, how}；from／to＝學期加週（例 'Y2S1W6'），還在交往的 to 是 null；
     how：'apart_talk'（談話後分開）、'apart_drift'（不回答，慢慢淡）、'apart_life'（生活差異，雙方同意）。
   - EX_<id>（S3）：和這個人分開過。CLEANUP_DONE：最近一次分開以後收拾過了沒（每次分開重設成 false；沒分開過＝true）。
   - <人物>_CRACK：每一段關係自己的裂縫計數（玩家看不到；修補時歸零）。
   - 存檔（S7）：新欄位都有預設值；第一次讀檔時補 ROMANCE_HISTORY（有 dating_kexin 的補一筆：經濟系那一年就開始了）；不在標題畫面改任何東西。
   收拾的時刻（S4）、裂縫的談話事件（S5）、戀愛 CG 的開關（S6）跟著各人的分開路線一起做（要 AA_123 第 4、5 節、BB_119 的台詞）。
   測試：node tests/romance_unit.js */
'use strict';
const ROM=(function(){
  const S={};
  S.CRACK={heroine_01:'AN_CRACK',heroine_03:'YT_CRACK',classmate_peishan:'PS_CRACK',heroine_05:'SIS_CRACK',heroine_02:'ZR_CRACK',heroine_04:'ZQ_CRACK',kexin:'KX_CRACK'};
  /* 現在是哪個學期第幾週：'Y1S1W5'；不在學期裡（寒暑假）＝最近的學期加 W0 */
  S.when=function(G){ const T=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; return T?T.id+'W'+(T.week|0):'D'+G.day; };
  S.rec=function(G){ const F=G.flags||(G.flags={}); if(!Array.isArray(F.ROMANCE_HISTORY)){ F.ROMANCE_HISTORY=[];
      for(const k in F) if(/^dating_/.test(k)&&F[k]===true) F.ROMANCE_HISTORY.push({id:k.slice(7),from:k==='dating_kexin'?'Y0':S.when(G),to:null,how:null}); }   /* 舊存檔：可昕從經濟系那一年就在交往（BB_104）*/
    if(F.CLEANUP_DONE===undefined) F.CLEANUP_DONE=true; return F.ROMANCE_HISTORY; };
  S.current=function(G){ const F=G.flags||{}; for(const k in F) if(/^dating_/.test(k)&&F[k]===true) return k.slice(7); return null; };
  S.isEx=(G,id)=>!!(G.flags&&G.flags['EX_'+id]);
  /* 開始新的一段：所有 dating_* 都是 false、收拾過了（AA_123 2-2）；時間窗由各人的告白事件自己判斷 */
  S.canStart=function(G,id){ S.rec(G); const cur=S.current(G); if(cur&&cur!==id) return false; if(cur===id) return false; return G.flags.CLEANUP_DONE!==false; };
  S.start=function(G,id){ if(!S.canStart(G,id)) return false; const F=G.flags; F['dating_'+id]=true; S.rec(G).push({id,from:S.when(G),to:null,how:null}); if(S.CRACK[id]) F[S.CRACK[id]]=0; return true; };
  /* 修補：歷史不變、裂縫歸零（這學期不再觸發：由談話事件自己記）*/
  S.mend=function(G,id){ if(S.CRACK[id]) G.flags[S.CRACK[id]]=0; };
  S.crack=function(G,id,n){ const k=S.CRACK[id]; if(!k) return 0; G.flags[k]=(+G.flags[k]||0)+(n==null?1:n); return G.flags[k]; };
  /* 分開：dating false、EX true、歷史填上 to 和 how、CLEANUP_DONE false（一週內收拾；cleanupDue＝第幾天以前）*/
  S.end=function(G,id,how){ const F=G.flags; if(F['dating_'+id]!==true) return false; F['dating_'+id]=false; F['EX_'+id]=true; const H=S.rec(G); for(let i=H.length-1;i>=0;i--) if(H[i].id===id&&H[i].to==null){ H[i].to=S.when(G); H[i].how=how||'apart_talk'; break; }
    F.CLEANUP_DONE=false; F.cleanupDue=G.day+7; if(S.CRACK[id]) F[S.CRACK[id]]=0; return true; };
  S.cleanup=function(G){ G.flags.CLEANUP_DONE=true; G.flags.cleanupDue=null; };
  /* 前任：她之後的事件用「前任版」（條件寫 flags:['EX_<id>']）；不在尾聲的長桌（v5 第 0b 節）*/
  S.exes=G=>Object.keys(G.flags||{}).filter(k=>/^EX_/.test(k)&&G.flags[k]).map(k=>k.slice(3));
  return S;
})();

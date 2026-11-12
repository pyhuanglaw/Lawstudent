/* 社團布告欄「看看」（CLUB-BOARD-INFO-1105、X237；使用者 11-05：「我希望這種布告欄 真的能讓我知道一些社團的活動時間 如何加入」）
   字全部在 src/data/club_board.js（AA_701 匯入）。日常失速東牆「看社團佈告欄」用這一份；之後別的社團海報牆也呼叫 CLUBBOARD.look。
   - 照學期：那個社團這學期沒有活動（activities.js 的 term）就不列；五則都沒有只出最後一行。放假、開學前照接下來那個學期。
   - 新局社團博覽會（9/6）以前多一行博覽會的時間地點。
   - 玩法：先一句開頭，再選要看哪一張（每張兩句：時間地點／怎麼加入＋一句話），「不看了」收尾出最後一行。
   - 2026-11-12（AA_852＠f6aa917593 _meta.lawww_1112 第 3 點）：辯論社、登山社、系籃大一下起（CLUB_LATER_TERMS.board.from）用另一版字——「怎麼加入」＝稿的那一句（board.join；大一下以後沒有社團博覽會，
     第一次去社課就入社）；「活動時間」那一欄不寫「開學第五週起」（board.noWhen），括號裡換成那一學期實際有社課的週次（從 activities.js 的 weeks／termWeeks 排：S.weeksText，例「第 5～7、10～15 週」——
     稿只說「照實際有社課的週次寫」、沒有給字，這幾個字（第、～、、、週）是系統排的，已回報 AA）。資料沒有 board（舊稿）＝照舊。吉他社、法服的字稿沒有改，不動。 */
'use strict';
const CLUBBOARD=(function(){
  const S={};
  const D=()=>typeof CLUB_BOARD!=='undefined'?CLUB_BOARD:null;
  /* 現在的學期；不在學期裡（假期、開學前）往後找 120 天內的下一個學期 */
  S.termId=function(G){ if(!G||typeof CALENDAR==='undefined'||!CALENDAR.termOf) return null; for(let d=G.day;d<=G.day+120;d++){ const t=CALENDAR.termOf(d); if(t&&t.id) return t.id; } return null; };
  S.rows=function(G){ const B=D(); if(!B||typeof ACTIVITIES==='undefined'||!ACTIVITIES.list) return []; const T=S.termId(G); if(!T) return [];
    return B.rows.filter(r=>{ const a=ACTIVITIES.list.find(x=>x.id===r.act); return !!a&&Array.isArray(a.term)&&a.term.includes(T); }); };
  S.expoLine=function(G){ const B=D(); if(!B||!G||typeof STORY==='undefined'||!STORY.dayOfKey) return null; const d=STORY.dayOfKey(B.expoDate); return d!=null&&G.day<d?B.expo:null; };
  const LT=()=>typeof CLUB_LATER_TERMS!=='undefined'?CLUB_LATER_TERMS:null;
  /* 這一張這個學期是不是用大一下起的那一版（AA_852 的三個社團、board.from 起）*/
  S.laterBoard=function(G,r){ const X=LT(), B=X&&X.board, T=G?S.termId(G):null; if(!B||!r||!T||!X.clubs||!X.clubs[r.act]||!Array.isArray(X.terms)) return null; return X.terms.indexOf(T)>=X.terms.indexOf(B.from)&&X.terms.includes(T)?B:null; };
  /* 那一學期實際有社課的週次：連著的併成一段 */
  S.weeksText=function(act,T){ const a=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list?ACTIVITIES.list.find(x=>x.id===act):null, W=a?((a.termWeeks&&a.termWeeks[T])||a.weeks):null; if(!Array.isArray(W)||!W.length) return '';
    const w=W.slice().sort((x,y)=>x-y), seg=[]; for(let i=0;i<w.length;i++){ let j=i; while(j+1<w.length&&w[j+1]===w[j]+1) j++; seg.push(j>i?w[i]+'～'+w[j]:String(w[i])); i=j; } return '第 '+seg.join('、')+' 週'; };
  S.cardWhen=function(G,r){ const B=S.laterBoard(G,r); if(!B) return r.when; const tag='（'+B.noWhen+'）', wk=S.weeksText(r.act,S.termId(G)); return r.when.includes(tag)?r.when.replace(tag,wk?'（'+wk+'）':''):r.when; };
  S.cardLines=(r,G)=>{ const B=S.laterBoard(G,r); return [r.club+'｜'+S.cardWhen(G,r), '怎麼加入：'+(B?B.join:r.join)+'　「'+r.say+'」']; };
  S.look=async function(GM,opt){ const B=D(), G=GM&&GM.G; if(!B||!G) return false; const R=S.rows(G), ex=S.expoLine(G);
    if(GM.sceneBegin) GM.sceneBegin();
    try{ /* 開頭：這面牆原本的隨機一句（AA_648；AA_701 第 3 節第 2 點）；沒有那一組才用通用開頭 */
      const i0=opt&&typeof opt.intro==='function'?opt.intro(G):null; await GM.say(null,i0||B.intro); if(ex) await GM.say(null,ex);
      const seen=new Set();
      while(R.length){ const k=await GM.choose(R.map((r,i)=>({t:r.club,dim:seen.has(i)})).concat([{t:'不看了'}])); if(!(k>=0&&k<R.length)) break; seen.add(k); for(const t of S.cardLines(R[k],G)) await GM.say(null,t); if(seen.size>=R.length) break; }
      if(!R.length&&B.none) await GM.say(null,B.none);   /* 一張都沒有的學期（AA_701 第 3 節第 1 點）*/
      await GM.say(null,B.last);
    } finally { if(GM.sceneEnd) GM.sceneEnd(); }
    return true; };
  return S;
})();
if(typeof module!=='undefined') module.exports=CLUBBOARD;

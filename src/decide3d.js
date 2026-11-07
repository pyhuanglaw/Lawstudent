/* ===== 選項會改變故事（BB_305 第 10 節；STUDY-DATE-PROGRESS-1107、USER_WANTS X263）=====
   使用者 11-07 06:2x 對 BB-B：「我想要的是我的選項會改變故事」（她做的決定不一樣、會打開或錯過事件、影響感情和結局；UA-BB-1107-CHOICE-CHANGE）
   06:3x：「如果真的影響能不能交往的選項 應該要有 小心選擇的提示」（上方一行字＋選完確認；UA-BB-1107-CAREFUL-HINT）
   06:4x：「也不能我建議他做什麼他就都聽我的啊，有人要反而不想」（UA-BB-1107-HER-OWN-MIND）
   - 她的決定：選項的 decide:{key,value} 記在 G.flags.DECIDE[人][key]＝{v,day,stance}；一個決定只記一次，記了不再改。
     沒記過（舊存檔、還沒到那一拍）＝S.DEFAULT[人][key]（AA 給的預設那一邊）。
     她不會都聽你的（10-6）：結果照 AA 的表（S.RULES[人][key]：lean、style、你的 stance、信任）算——表還沒到，照選項的 value。
   - 條件：'dec:<人>.<key>=<value>'（或 !=）——故事線、輪換句、訊息、事件都可以用（ARCS.cond 轉到 S.cond）。
   - 打開／錯過（10-2）：opens／closes：beat:N（她的故事線第 N 拍；closes＝記 missed、不演，下一拍接著）、place:地點（STUDY_UNLOCK）、flag:旗標（打開＝記那天；關掉＝記 CLOSED_旗標）。
   - 小心選擇（10-5）：那一組有 key:true 的選項＝選單上方一行字（S.CAREFUL，AA 可以每一組換 note），選完問「確定嗎？」：「確定」才算、「再想想」回到同一組重選。一般選項不提示、不確認。
   存檔：G.flags.DECIDE＝{人:{key:{v,day,stance}}}。測試：node tests/decide_unit.js */
'use strict';
const DECIDE=(function(){
  const S={};
  const F=G=>G.flags||(G.flags={});
  S.DEFAULT={};   /* 人 → key → 預設那一邊（AA 的分岔稿到了照稿填）*/
  S.RULES={};     /* 人 → key → {lean, style, map}（10-6 的表，AA 給；還沒到＝照選項）*/
  S.CAREFUL='（這個選擇，可能會改變你們之後的關係。）';   /* 預設的那一行（字之後照 AA）*/
  S.CONFIRM={q:'確定嗎？',yes:'確定',no:'再想想'};
  S.rec=(G,id)=>{ const f=F(G); if(!f.DECIDE||typeof f.DECIDE!=='object') f.DECIDE={}; const r=f.DECIDE[id]; return r&&typeof r==='object'?r:(f.DECIDE[id]={}); };
  S.has=(G,id,key)=>{ const D=G&&G.flags&&G.flags.DECIDE; return !!(D&&D[id]&&D[id][key]!=null); };
  S.get=(G,id,key)=>{ const D=G&&G.flags&&G.flags.DECIDE, x=D&&D[id]&&D[id][key]; if(x!=null) return typeof x==='object'?x.v:x; const d=S.DEFAULT[id]; return d&&d[key]!=null?d[key]:null; };
  /* 結果怎麼算（10-6）：有表照表；沒表＝照選項的 value */
  S.resolve=function(G,id,key,o){ const R=S.RULES[id]&&S.RULES[id][key]; if(R&&typeof R.fn==='function'){ try{ const v=R.fn(G,o); if(v!=null) return v; }catch(e){ console.warn('DECIDE.resolve',e); } } return o&&o.decide?o.decide.value:null; };
  S.set=function(G,id,key,v,extra){ const r=S.rec(G,id); if(r[key]!=null) return false; r[key]=Object.assign({v,day:G.day},extra||{}); return true; };
  S.cond=function(G,c){ const m=/^dec:([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)(!=|=)(.+)$/.exec(String(c||'')); if(!m) return false; const v=S.get(G,m[1],m[2]); return m[3]==='='?v===m[4]:v!==m[4]; };
  /* 選完：記決定、打開／錯過 */
  S.apply=function(G,id,o){ if(!G||!o) return null; let v=null;
    if(o.decide&&!S.has(G,id,o.decide.key)){ v=S.resolve(G,id,o.decide.key,o); if(v!=null) S.set(G,id,o.decide.key,v,o.stance?{stance:o.stance}:null); }
    const f=F(G);
    for(const x of o.opens||[]){ const [k,a]=String(x).split(':'); if(k==='place'){ const U=f.STUDY_UNLOCK||(f.STUDY_UNLOCK={}); if(U[a]==null) U[a]=G.day; } else if(k==='flag'){ if(f[a]==null) f[a]=G.day; } else if(k==='beat'&&typeof ARCS!=='undefined'){ const r=ARCS.rec(G,id); r.missed=(r.missed||[]).filter(n=>n!==+a); } }
    for(const x of o.closes||[]){ const [k,a]=String(x).split(':'); if(k==='beat'&&typeof ARCS!=='undefined'){ const r=ARCS.rec(G,id); if(!r.missed.includes(+a)) r.missed.push(+a); } else if(k==='flag'){ if(f['CLOSED_'+a]==null) f['CLOSED_'+a]=G.day; } else if(k==='place'){ const C=f.PLACE_CLOSED||(f.PLACE_CLOSED={}); if(C[a]==null) C[a]=G.day; } }
    return v; };
  /* 選單：有 key 的那一組＝上方一行字＋選完確認（「再想想」回到同一組）*/
  S.careful=opts=>Array.isArray(opts)&&opts.some(o=>o&&o.key);
  S.choose=async function(GM,opts,o){ o=o||{}; const view=opts.map(q=>Object.assign({},q,{t:o.text?o.text(q.t):q.t}));
    if(!S.careful(opts)) return GM.choose(view);
    for(let guard=0;guard<20;guard++){ const k=await GM.choose(view,{note:o.note||S.CAREFUL}); const c=await GM.choose([{t:S.CONFIRM.yes},{t:S.CONFIRM.no}],{note:S.CONFIRM.q}); if(c!==1) return k; }
    return 0; };
  return S;
})();

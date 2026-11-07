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
  /* ===== AA_719 的決定拍（src/data/decide_rules.js）：她最後怎麼決定＝她本來的傾向 × 個性 × 你怎麼說（stance）× 信任 =====
     規則由上往下第一條符合（stance、trust hi／lo／any、有 opt 要是那個選項、有 if 要成立）；都不符合＝default。
     trust hi＝她對祐廷的 trust ≥ S.TRUST_HI 而且階段 ≥ 朋友（DATE.stageNum ≥ 3）。
     delay＞0＝那天以後下次見面先說 say（「我想了想，還是……」）；三天內沒見面＝她傳訊息（只傳對話、不傳旁白）；delay 0 有 say＝那一拍演完馬上說。
     before：那一拍要在那一天以前演到才算（語彤 YT-1：大一下第 9 週媽媽發現以前），過了＝default。
     存檔：DECIDE[人][key]＝{v,day,stance,rule}；G.flags.DECIDE_SAY＝[{who,key,due,say,played}] */
  S.TRUST_HI=30;
  const TB=()=>(typeof DECIDE_RULES!=='undefined'&&DECIDE_RULES.keys)||[];
  S.beatRule=(who,n)=>TB().find(e=>e.who===who&&e.beat===n)||null;
  S.byKey=(who,key)=>TB().find(e=>e.who===who&&e.key===key)||null;
  for(const e of TB()){ const d=S.DEFAULT[e.who]||(S.DEFAULT[e.who]={}); if(d[e.key]==null) d[e.key]=e.default; }
  S.trustHi=function(G,who){ if(typeof SOCIAL==='undefined'||!SOCIAL.rel) return false; const t=+SOCIAL.rel(who).trust||0; const st=typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(who):0; return t>=S.TRUST_HI&&st>=3; };
  const condOk=(G,c)=>!c||(typeof ARCS!=='undefined'&&ARCS.cond?ARCS.cond(G,c):S.cond(G,c));
  S.pickRule=function(G,e,k){ const so=e.opts.find(o=>o.i===k), stance=so&&so.stance, hi=S.trustHi(G,e.who);
    for(let j=0;j<e.rules.length;j++){ const r=e.rules[j]; if(r.stance!==stance) continue; if(r.trust==='hi'&&!hi) continue; if(r.trust==='lo'&&hi) continue; if(r.opt!=null&&r.opt!==k) continue; if(!condOk(G,r.if)) continue; return {r,j,stance}; }
    return {r:null,j:-1,stance}; };
  S.decideBeat=function(G,e,k){ if(!G||!e||S.has(G,e.who,e.key)) return null;
    if(e.before&&typeof ARCS!=='undefined'&&ARCS.dayOf){ const d=ARCS.dayOf(e.before); if(d!=null&&G.day>=d){ S.set(G,e.who,e.key,e.default,{late:true}); return {v:e.default}; } }
    const {r,j,stance}=S.pickRule(G,e,k); const v=r?r.result:e.default; S.set(G,e.who,e.key,v,{stance,rule:j});
    if(r&&r.rel&&Object.keys(r.rel).length&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ const d=Object.assign({},r.rel); if(typeof DATE!=='undefined'&&DATE.stageNum&&DATE.stageNum(e.who)<3) delete d.npcRom; SOCIAL.adjust(e.who,d); }
    if(r&&r.say&&r.say.length){ const L=S.says(G); L.push({who:e.who,key:e.key,due:G.day+(r.delay|0),say:r.say.slice(),played:false}); }
    return {v,rule:j}; };
  S.says=G=>{ const f=F(G); if(!Array.isArray(f.DECIDE_SAY)) f.DECIDE_SAY=[]; return f.DECIDE_SAY; };
  S.due=(G,who)=>G&&G.flags&&Array.isArray(G.flags.DECIDE_SAY)?G.flags.DECIDE_SAY.find(x=>x.who===who&&!x.played&&x.due<=G.day)||null:null;
  S.playDue=async function(GM,whoObj,id,x){ if(!x) return false; x.played=GM.G.day; for(const t of x.say){ if(/^（/.test(t)) await GM.say(null,t); else await GM.say(whoObj,t); } return true; };
  /* 她三天內沒見到你：傳訊息（PHONE；只傳她說的話）*/
  S.tick=function(G){ if(!G||!G.flags||!Array.isArray(G.flags.DECIDE_SAY)||typeof PHONE==='undefined'||!PHONE.at) return false; let did=false;
    for(const x of G.flags.DECIDE_SAY){ if(x.played||G.day<x.due+3) continue; const L=x.say.filter(t=>!/^（/.test(t)); x.played=G.day; x.byMsg=true; if(L.length){ PHONE.at(G,G.day,G.hour,L.map(t=>({th:'p:'+x.who,from:x.who,text:t})),'decide_say_'+x.who+'_'+x.key); did=true; } }
    return did; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY.PHONE_RULES.includes(S.tick)) STORY.PHONE_RULES.push(S.tick);
  /* 選單：有 key 的那一組＝上方一行字＋選完確認（「再想想」回到同一組）*/
  S.careful=opts=>Array.isArray(opts)&&opts.some(o=>o&&o.key);
  S.choose=async function(GM,opts,o){ o=o||{}; const view=opts.map(q=>Object.assign({},q,{t:o.text?o.text(q.t):q.t}));
    if(!S.careful(opts)) return GM.choose(view);
    for(let guard=0;guard<20;guard++){ const k=await GM.choose(view,{note:o.note||S.CAREFUL}); const c=await GM.choose([{t:S.CONFIRM.yes},{t:S.CONFIRM.no}],{note:S.CONFIRM.q}); if(c!==1) return k; }
    return 0; };
  return S;
})();

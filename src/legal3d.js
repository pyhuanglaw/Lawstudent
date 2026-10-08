/* ===== LEGAL KNOWLEDGE SYSTEM
   題庫：QBANK（data/legal_qbank.js，答案不可由程式改）。知識狀態：unseen → seen → confused → learned → understood → mastered。
   答錯記錄 misconception tag；同一題不無限重複（冷卻與 spaced recurrence）。
   包裝：class（教授提問）/ classmate（同學隨口問）/ study（讀書會）/ quiz（小考）/ exam（考試）——玩家看到的是對話，不是題號。
   存檔：G.legal = {q:{qid:{state,seen,ok,bad,last,ctx:[]}}, misc:{tag:count}, log:[]} ===== */
'use strict';
const LEGAL = (function(){
  const L={}; let G=null, GM=null;
  L.STATES=['unseen','seen','confused','learned','understood','mastered'];
  L.bind=function(g,gm){ G=g; GM=gm; if(!G.legal) G.legal={q:{},misc:{},log:[]}; return G.legal; };
  L.rec=function(qid){ const Q=G.legal.q; if(!Q[qid]) Q[qid]={state:'unseen',seen:0,ok:0,bad:0,last:-99,ctx:[]}; return Q[qid]; };
  L.stateOf=function(qid){ return L.rec(qid).state; };
  L.byId=function(qid){ return QBANK.find(q=>q.id===qid); };
  // ---- 抽題：confused（且已隔天）優先 → unseen → 需要複習的 learned/understood；同章節；排除近 2 天問過的 ----
  L.pick=function(opts){ opts=opts||{}; const day=G.day; const pool=QBANK.filter(q=>(!opts.section||q.section===opts.section)&&(!opts.exclude||!opts.exclude.includes(q.id))&&(!opts.type||q.type===opts.type)); const score=q=>{ const r=L.rec(q.id); const gap=day-r.last; if(gap<(opts.minGap||2)) return -1; switch(r.state){ case 'confused': return 100+gap; case 'unseen': return 60+Math.random()*10; case 'seen': return 55+gap; case 'learned': return gap>=2?40+gap:-1; case 'understood': return gap>=4?20+gap:-1; case 'mastered': return gap>=10?5:-1; } return 0; }; const ranked=pool.map(q=>({q,s:score(q)})).filter(x=>x.s>=0).sort((a,b)=>b.s-a.s); const n=opts.n||1; const out=[]; for(const x of ranked){ if(out.length>=n) break; if(opts.prefer&&L.rec(x.q.id).state!==opts.prefer&&ranked.some(y=>L.rec(y.q.id).state===opts.prefer&&!out.includes(y.q))) continue; out.push(x.q); } return n===1?out[0]:out; };
  // ---- 狀態轉移 ----
  L.mark=function(qid,correct,ctx){ const r=L.rec(qid); r.seen++; r.last=G.day; r.ctx.push(ctx||'?'); if(r.ctx.length>12) r.ctx.shift(); const q=L.byId(qid); if(correct){ r.ok++; const distinctCtx=new Set(r.ctx).size; if(r.state==='mastered') {} else if(r.state==='understood'&&r.ok>=3&&distinctCtx>=2) r.state='mastered'; else if((r.state==='learned'||r.state==='seen'||r.state==='unseen')&&r.ok>=2&&distinctCtx>=2) r.state='understood'; else if(r.state==='confused'||r.state==='unseen'||r.state==='seen') r.state='learned'; } else { r.bad++; r.state='confused'; if(q&&q.tag){ G.legal.misc[q.tag]=(G.legal.misc[q.tag]||0)+1; } } G.legal.log.push({day:G.day,qid,ok:!!correct,ctx}); if(G.legal.log.length>300) G.legal.log.shift(); };
  L.expose=function(qid,ctx){ const r=L.rec(qid); if(r.state==='unseen') r.state='seen'; r.seen++; r.last=G.day; r.ctx.push(ctx||'read'); };
  L.apply=function(spec){ if(!spec) return; if(spec.qid&&spec.state){ const r=L.rec(spec.qid); if(L.STATES.indexOf(spec.state)>L.STATES.indexOf(r.state)) r.state=spec.state; } if(spec.study){ L.study(spec.study); } };
  // 讀書：把 confused/seen 題目的核心考點讀過 → learned（每次最多 2 題），回傳讀到的重點文字
  L.study=function(section){ const cands=QBANK.filter(q=>(!section||q.section===section)&&['confused','seen'].includes(L.rec(q.id).state)).slice(0,2); const out=[]; for(const q of cands){ const r=L.rec(q.id); r.state='learned'; r.last=G.day; r.ctx.push('study'); out.push(q); } return out; };
  // ---- 自然語言包裝 ----
  function opts4(q){ return ['A','B','C','D'].map(k=>({k,t:q.options[k]})); }
  function stmt(q){ return q.q.replace(/。$/,''); }
  const CLASS_INTRO={prof_lin:['「我們看一個實務上常見的情況。」','「先不要翻條文，用你們現在的理解。」','「這題判決和學說有不同看法，先講你的。」'],prof_zhou:['「來，換個角度。」'],default:['「這個問題——」']};
  const CLASS_OK={prof_lin:['「對。這個你們之後會在判決裡一直看到。」','「可以。坐下。」','「嗯，重點抓到了。」'],default:['「很好。」']};
  const CLASS_BAD={prof_lin:['「不是。這是很多人第一年都會混淆的地方——{core}」','「差一點。想一下：{core}」','「……這個之後考試會出。{core}」'],default:['「再想一下。{core}」']};
  const CLASS_UNSURE={prof_lin:['「沒關係，不確定比亂答好。記住：{core}」'],default:['「先記住：{core}」']};
  const MATE_ASK=['「欸，我覺得{stmt}——對吧？」','「我剛剛跟柏翰吵這個：{stmt}。你覺得？」','「考古題有一題：{stmt}。這是對的嗎？」'];
  const MATE_MC=['「那個——{q} 你覺得是哪個？」','「老師講的那題我沒跟上：{q}」'];
  const MATE_OK=['「喔——所以是這樣。好我懂了。」','「……你怎麼記得住。」','「對吼。」'];
  const MATE_BAD=['「我也這樣想，可是筆記上寫的好像不是……{core}」','「嗯？我筆記上寫：{core}」','「等等，我查一下……{core}」'];
  const STUDY_ASK=['「這一題，{name}你來。{q}」','「下一個：{q}」'];
  const STUDY_OK=['「對。下一題。」','「好，這題可以。」'];
  const STUDY_BAD=['「錯。這裡的重點是——{core}。不要再混。」','「不對。{core}。這個上次讀書會就講過。」'];
  const STUDY_UNSURE=['「不確定就先記起來：{core}。」','「好，先記：{core}。下次我會再問。」'];
  const MATE_UNSURE=['「你也不知道喔……我筆記上寫：{core}。」','「那我們都不知道。等等問柏翰……啊他寫：{core}。」'];
  function pick(arr){ return arr[(Math.random()*arr.length)|0]; }
  function coreText(q){ if(q.core) return q.core.replace(/。$/,''); if(q.type==='tf') return (q.answer==='對'?'這句話本身是對的':'這句話本身不對'); return '答案是 '+q.answer+'、'+q.options[q.answer]; }
  function fill(t,q){ return t.replace('{core}',coreText(q)).replace('{stmt}',stmt(q)).replace('{q}',q.q).replace('{name}',G.name); }
  // 主要 API：在 ADV／對話中問一題。spec: {context, by(charId), qid|pick:{section,type,prefer}, chorus(charId 旁邊插話), quiet}
  L.ask=async function(spec,ev){ const ctx=spec.context||'classmate'; const by=spec.by; const q=spec.qid?L.byId(spec.qid):L.pick(Object.assign({n:1},spec.pick||{})); if(!q){ return null; } const byName=SOCIAL.displayName(by); const npc=EVENTS.npcOf(by); const who={name:byName,obj:npc&&npc.obj,charId:by,pose:npc&&npc.pose};
    const say=(t,expr)=>{ ADV.speaker(by,expr||'neutral'); ADV.log(byName,t); return GM.say(who,t,{keepPose:!!(npc&&npc.seat)}); };
    const table={class:[CLASS_INTRO,CLASS_OK,CLASS_BAD,CLASS_UNSURE],classmate:[null,MATE_OK,MATE_BAD,MATE_UNSURE],study:[null,STUDY_OK,STUDY_BAD,STUDY_UNSURE],quiz:[null,STUDY_OK,STUDY_BAD,STUDY_UNSURE]}[ctx]||[null,MATE_OK,MATE_BAD,MATE_UNSURE];
    const byTable=(T)=>Array.isArray(T)?T:(T[by]||T.default);
    if(ctx==='class'){ await say(pick(byTable(CLASS_INTRO)),'serious'); if(q.type==='tf') await say('「'+stmt(q)+'——這句話對不對？'+G.name+'，你說。」','serious'); else { await say('「'+q.q+'」','serious'); await say('「'+opts4(q).map(o=>o.k+'、'+o.t).join('；')+'。'+G.name+'，你選哪個？」','neutral'); } }
    else if(ctx==='study'){ await say(fill(pick(STUDY_ASK),q),'serious'); if(q.type==='mc') await say('「'+opts4(q).map(o=>o.k+'、'+o.t).join('；')+'」','neutral'); }
    else { if(q.type==='tf') await say(fill(pick(MATE_ASK),q),'thinking'); else { await say(fill(pick(MATE_MC),q),'thinking'); await say('「'+opts4(q).map(o=>o.k+'、'+o.t).join('；')+'」','neutral'); } }
    let options; if(q.type==='tf'){ options=[{t:'「對。」',v:'對'},{t:'「不對。」',v:'錯'},{t:'「……我不確定。」',v:null}]; if(Math.random()<0.5) [options[0],options[1]]=[options[1],options[0]]; } else { options=opts4(q).map(o=>({t:'「'+o.k+'，'+o.t+'。」',v:o.k})); options.push({t:'「……不確定。」',v:null}); }
    const k=await GM.choose(options.map(o=>({t:o.t}))); const v=options[k].v; ADV.log(G.name,'▶ '+options[k].t);
    let result; if(v===null){ L.expose(q.id,ctx); result='unsure'; await say(fill(pick(byTable(table[3])),q),'neutral'); }
    else { const ok=(v===q.answer); L.mark(q.id,ok,ctx); result=ok?'ok':'bad'; await say(fill(pick(byTable(table[ok?1:2])),q),ok?'smile':'thinking'); }
    if(spec.chorus&&EVENTS.npcOf(spec.chorus)){ const cn=SOCIAL.displayName(spec.chorus); const cw={name:cn,obj:EVENTS.npcOf(spec.chorus).obj,charId:spec.chorus}; ADV.speaker(spec.chorus,'neutral'); const t=result==='ok'?pick(['（小聲）「你剛剛怎麼知道的？」','（小聲）「……好喔。」']):pick(['（小聲）「我也選那個。」','（小聲）「這題我上週錯過。」']); ADV.log(cn,t); await GM.say(cw,t); }
    // 教授記錄
    if(ctx==='class'&&by&&by.startsWith('prof_')){ SOCIAL.profEvent(by,'part',1,null); if(result==='ok') SOCIAL.profEvent(by,'perf',3,'課堂答對：'+q.id); else if(result==='bad') SOCIAL.profEvent(by,'perf',-1,null); }
    if(!spec.quiet) GM.addNote('law_'+q.id,(q.section||'刑事訴訟法')+'：'+stmt(q).slice(0,18)+'…',(q.core?'核心：'+q.core:'答案：'+(q.type==='tf'?q.answer:q.answer+' '+q.options[q.answer]))+(result==='bad'?'（你答錯過，記得回頭看）':''));
    return {q,result}; };
  // ---- 筆記本摘要 ----
  L.summary=function(){ const bySec={}; for(const q of QBANK){ const s=q.section; bySec[s]=bySec[s]||{unseen:0,seen:0,confused:0,learned:0,understood:0,mastered:0,total:0}; bySec[s][L.rec(q.id).state]++; bySec[s].total++; } const misc=Object.entries(G.legal.misc).sort((a,b)=>b[1]-a[1]).map(([t,n])=>({tag:t,label:L.MISC_LABEL[t]||t,n})); return {bySec,misc,log:G.legal.log.slice(-10)}; };
  L.MISC_LABEL={PROCEDURE_ONLY_ABOUT_TRUTH:'以為刑訴只為發現真實',SILENCE_IMPLIES_GUILT:'以為緘默可推論有罪',LABEL_OVER_SUBSTANCE:'只看稱謂不看實質身分',RESULT_JUSTIFIES_MEANS:'以為結果可回推手段合法',ADMISSIBILITY_EQUALS_WEIGHT:'混淆證據能力與證明力',CONFESSION_EQUALS_CONVICTION:'以為自白就等於判決',CORROBORATION_MISUNDERSTOOD:'誤解補強法則',NO_LIMITS_ON_COERCIVE_MEASURES:'以為強制處分沒有界限',DETENTION_AS_PUNISHMENT:'把羈押當提前處罰',DUE_PROCESS_ONLY_AT_TRIAL:'以為正當程序只在審判',RIGHTS_CANNOT_BE_WAIVED:'以為權利不能自主行使',DEFENSE_COUNSEL_MISUNDERSTOOD:'誤解辯護人角色',RECUSAL_OPTIONAL:'以為迴避可自行決定',ARREST_EQUALS_DETENTION:'混淆拘提與羈押',BASIC_PRINCIPLES:'基本原則',CONFESSION_RULES:'自白法則',COERCIVE_MEASURES:'強制處分'};
  return L;
})();

// BUG-LEGAL-PROF-TONE-1108（AA-B 11-08 13:38，第八批後子代理列的兩件內容）：
//  (3) 出題的是教授（prof_…）：不用同學那一組 MATE_*（研究室、下課後、小考抽到「我剛剛跟柏翰吵這個：…」「等等問柏翰……」＝林教授在說「跟柏翰吵」），
//      改用教授那一組 CLASS_INTRO／OK／BAD／UNSURE（字都不改）；MATE_* 只給同學；讀書會（study）照舊 STUDY_*。學習紀錄（L.mark／L.expose 的 ctx）、教授紀錄（只有 class）照原本的 ctx。
//  (1) 鄭教授的 STYLE 開場（教授在場）拆三段，字不改：鄭教授「我先畫張圖。」→ 旁白「（黑板上多了一塊地、一棟房子。）」→ 鄭教授「今天講…。」；不在場照舊一字不差；
//      別的引用開頭的句子（syllabus「「有逃亡之虞」，五個字。…」）不拆。
// 不需要瀏覽器（D131）。修改前（13ff23045 的兩支 src）：第 1 項兩句、第 4 項兩句 FAIL。用法：node tests/legal_prof_tone_unit.js
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const J=JSON.stringify; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||info==null?'':'　'+String(info).slice(0,400))); if(!ok) fails++; };
const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
/* ---------- legal3d.js：在 vm 裡跑 LEGAL.ask ---------- */
const said=[], prof=[]; let picks=[];
const ctx={console,Math:Object.create(Math)};
ctx.ADV={active:true,speaker(){},log(){}};
ctx.SOCIAL={displayName:id=>({prof_lin:'林教授',classmate_bohan:'柏翰',heroine_05:'學姊'}[id]||id),profEvent:(...a)=>prof.push(a)};
ctx.EVENTS={npcOf:()=>null};
vm.createContext(ctx);
vm.runInContext(src('src/data/legal_qbank.js').replace(/^const QBANK\s*=/m,'globalThis.QBANK='),ctx);
vm.runInContext(src('src/legal3d.js').replace(/^const LEGAL\s*=/m,'globalThis.LEGAL='),ctx);
const LEGAL=ctx.LEGAL;
const G={day:10,name:'祐廷',legal:null,flags:{}};
const GM={say:async(w,t)=>{ said.push([w&&w.name||null,t]); },choose:async(o)=>Math.min(picks.shift()|0,o.length-1),addNote(){}};
LEGAL.bind(G,GM);
/* 表：從原始碼拿（字不改：比的是表上的字填完以後） */
const tbl=n=>{ const m=new RegExp('const '+n+'=(\\[[^\\n]*?\\]|\\{[^\\n]*?\\});').exec(src('src/legal3d.js')); if(!m) return []; const v=vm.runInNewContext('('+m[1]+')'); return Array.isArray(v)?v:[].concat(...Object.values(v)); };
const T={}; for(const n of ['CLASS_INTRO','CLASS_OK','CLASS_BAD','CLASS_UNSURE','MATE_ASK','MATE_MC','MATE_OK','MATE_BAD','MATE_UNSURE','STUDY_ASK','STUDY_OK','STUDY_BAD','STUDY_UNSURE']) T[n]=tbl(n);
const head=t=>t.split(/\{(core|stmt|q|name)\}/)[0];
const from=(line,names)=>names.some(n=>T[n].some(t=>{ const h=head(t); return h&&line.startsWith(h); }));
const MATE=['MATE_ASK','MATE_MC','MATE_OK','MATE_BAD','MATE_UNSURE'], CLASS=['CLASS_INTRO','CLASS_OK','CLASS_BAD','CLASS_UNSURE'], STUDY=['STUDY_ASK','STUDY_OK','STUDY_BAD','STUDY_UNSURE'];
const run=async(context,by,qid,pick)=>{ said.length=0; prof.length=0; picks=[pick]; let s=7; ctx.Math.random=()=>{ s=(Math.imul(s,1664525)+1013904223)>>>0; return s/4294967296; };
  const r=await LEGAL.ask({context,by,qid,quiet:true}); return {r,lines:said.slice(),prof:prof.slice()}; };
(async()=>{
  check('0. 載入（表都拿得到）',typeof LEGAL.ask==='function'&&Object.values(T).every(a=>a.length>0),J(Object.keys(T).filter(k=>!T[k].length)));
  /* 1 教授：classmate／office／quiz 都用 CLASS_*，沒有 MATE_* */
  const bad=[], noIntro=[];
  for(const c of ['classmate','office','quiz','class']) for(const q of ['Q001','Q002','Q004']) for(const p of [0,1,2,3]){
    const {lines}=await run(c,'prof_lin',q,p); const L=lines.filter(x=>x[0]==='林教授').map(x=>x[1]);
    if(L.some(t=>from(t,MATE))) bad.push(c+'/'+q+'/'+p+'：'+L.find(t=>from(t,MATE)));
    if(!from(L[0]||'',['CLASS_INTRO'])) noIntro.push(c+'/'+q+'/'+p+'：'+L[0]); }
  check('1. 林教授出題（同學、研究室、小考、課堂 × Q001／Q002／Q004 × 四種回答）：一句 MATE_* 都沒有',!bad.length,J(bad.slice(0,3)));
  check('1. 林教授出題第一句是 CLASS_INTRO（研究室、下課後也一樣）',!noIntro.length,J(noIntro.slice(0,3)));
  { const {lines}=await run('office','prof_lin','Q001',0); check('1. 研究室裡不會出現「跟柏翰吵」「問柏翰」',!lines.some(x=>/柏翰/.test(x[1])),J(lines)); }
  /* 2 同學、讀書會照舊 */
  { const M=[], S=[];
    for(const q of ['Q001','Q002']) for(const p of [0,1,2]){ const a=await run('classmate','classmate_bohan',q,p); if(!a.lines.some(x=>from(x[1],MATE))) M.push(q+'/'+p);
      const b=await run('study','heroine_05',q,p); if(!b.lines.some(x=>from(x[1],STUDY))||b.lines.some(x=>from(x[1],CLASS.concat(MATE)))) S.push(q+'/'+p+'：'+J(b.lines)); }
    check('2. 柏翰（同學）照舊 MATE_*',!M.length,J(M));
    check('2. 學姊（讀書會）照舊 STUDY_*、沒有 CLASS_／MATE_*',!S.length,J(S.slice(0,2))); }
  /* 3 紀錄照原本的 ctx：研究室不記教授紀錄、L.mark 的 ctx 是 office */
  { G.legal={q:{},misc:{},log:[]}; const a=await run('office','prof_lin','Q001',0); const r=G.legal.q.Q001;
    check('3. 研究室出題：教授紀錄沒有記（只有課堂才記）',a.prof.length===0,J(a.prof));
    check('3. 研究室出題：學習紀錄的 ctx 照舊是 office',!!r&&r.ctx[r.ctx.length-1]==='office',J(r));
    const b=await run('class','prof_lin','Q002',0); check('3. 課堂出題照舊記教授紀錄',b.prof.length>0,J(b.prof)); }
  /* ---------- classes3d.js：鄭教授拆三段 ---------- */
  const cs=src('src/classes3d.js');
  const m=/S\.SPLIT=[^\n]*\n\s*S\.profParts=[^\n]*\n\s*S\.unq=[^\n]*/.exec(cs);
  check('4. classes3d.js 有 S.SPLIT、S.profParts（在 S.unq 旁邊）',!!m);
  let PP=null; if(m){ const S={}; vm.runInNewContext(m[0].replace(/(^|\n)\s*S\./g,'$1S.'),{S}); PP=S.profParts; }
  if(PP){
    const z=PP('「我先畫張圖。」黑板上多了一塊地、一棟房子。今天講物權。');
    check('4. 鄭教授在場：拆三段（教授說／旁白／教授說），字不改',J(z)===J([['prof','我先畫張圖。'],['narr','（黑板上多了一塊地、一棟房子。）'],['prof','今天講物權。']]),J(z));
    check('4. 整句一對「」的開場（周教授）：拿掉外面的「」（第八批照舊）',J(PP('「今天講物權。先不要翻課本——你們覺得呢？」'))===J([['prof','今天講物權。先不要翻課本——你們覺得呢？']]));
    const keep=['「有逃亡之虞」，五個字。你們要怎麼判斷？','「被逼的道歉，算道歉嗎？」你們回答了四年。最後一次，用哪一年的答案？','「我不知道這是犯法的」，大部分時候不是理由。','老師今天上民法。'];
    check('4. 引用開頭的 syllabus 句子、沒有「」的：不拆、一字不改',keep.every(t=>J(PP(t))===J([['prof',t]])),J(keep.map(PP))); }
  const call=/else if\(prof\)\{ for\(const \[k,t\] of S\.profParts\(''\+ct\.line\)\) await GM\.say\(k==='narr'\?null:prof,t\); \} else await GM\.say\(null,\(ct\.prof\|\|S\.profName\(c\)\)\+'：'\+ct\.line\);/.test(cs);
  check('4. 教授在場才拆；不在場照舊「鄭老師：「…」」一字不差（S.attend 那一行）',call);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();

// CC N2（2026-11-02）：題庫答案沒被改過（CLAUDE.md：法律題庫不可改答案）——純 Node，不開瀏覽器。
// 用法：LW=<改版後工作樹> BASE=<改版前工作樹> [SRC=<企劃分支的 docs/story_planning>] node n2_qbank_diff.js
//   ①兩邊各自用 vm 載入 src/data/legal_qbank.js（QBANK）、src/data/exam_bank.js（EXAM_BANK），逐題比 id、題目 q、選項 options、答案 answer（另比 core、status、course、term、scopeWeek）。
//   ②有 SRC 時：LW 的 EXAM_BANK 每一題回頭對 EXAM_BANK.files 列的原始 json（SRC/<path>），比 q、options、answer（確認匯入一字不改）；
//     QBANK 沒有 json 來源（使用者提供、手寫進 legal_qbank.js），只做兩版比對＋答案格式檢查（tf＝對／錯、mc＝options 的鍵）。
const fs=require('fs'), vm=require('vm'), path=require('path');
const LW=path.resolve(process.env.LW||'.'), BASE=process.env.BASE&&path.resolve(process.env.BASE), SRC=process.env.SRC&&path.resolve(process.env.SRC);
const loadFrom=(root)=>{ const ctx={}; vm.createContext(ctx); for(const f of ['src/data/legal_qbank.js','src/data/exam_bank.js']){ const p=path.join(root,f); if(!fs.existsSync(p)){ console.log('缺檔',p); continue; } vm.runInContext(fs.readFileSync(p,'utf8').replace(/^const (QBANK|EXAM_BANK)\s*=/mg,'globalThis.$1='),ctx,{filename:f}); } return {QBANK:ctx.QBANK||[],EXAM:ctx.EXAM_BANK||{questions:[]}}; };
const J=x=>JSON.stringify(x==null?null:x);
const FIELDS=['q','options','answer','core','status','course','term','scopeWeek','type','complete'];
let probs=0; const P=(...a)=>{ probs++; console.log('PROBLEM',...a); };
const diff=(name,A,B)=>{ const ma=new Map(A.map(q=>[q.id,q])), mb=new Map(B.map(q=>[q.id,q])); const dup=(L)=>L.map(q=>q.id).filter((x,i,a)=>a.indexOf(x)!==i);
  console.log(`\n## ${name}：BASE ${A.length} 題、LW ${B.length} 題`); if(dup(A).length) P(name,'BASE 重複 id',dup(A)); if(dup(B).length) P(name,'LW 重複 id',dup(B));
  const removed=[...ma.keys()].filter(k=>!mb.has(k)), added=[...mb.keys()].filter(k=>!ma.has(k)); let changed=0;
  for(const [id,a] of ma){ const b=mb.get(id); if(!b) continue; for(const f of FIELDS){ if(J(a[f])!==J(b[f])){ changed++; const crit=['q','options','answer'].includes(f); (crit?P:console.log)(crit?'':'  (非關鍵欄位)',name,id,f,'舊',J(a[f]),'→ 新',J(b[f])); } } }
  console.log(`  刪除 ${removed.length}：${removed.join(',')||'無'}；新增 ${added.length}：${added.join(',')||'無'}；欄位變更 ${changed} 處`);
  for(const id of added){ const q=mb.get(id); console.log('  新增',id,q.course||'',q.term||'',q.status||'','source=',J(q.source)); if(!q.source) P(name,'新增題沒有 source',id); }
  if(removed.length) P(name,'有題目被刪',removed.join(',')); };
const ansCheck=(name,L)=>{ let bad=0; for(const q of L){ const opts=q.options&&typeof q.options==='object'?Object.keys(q.options):null;
  if(q.type==='tf'){ if(!['對','錯'].includes(q.answer)){ bad++; P(name,q.id,'tf 答案不是對／錯',J(q.answer)); } }
  else if(opts){ const ans=String(q.answer||'').split(/[,、]/).map(s=>s.trim()).filter(Boolean); if(!ans.length||ans.some(x=>!opts.includes(x))){ bad++; P(name,q.id,'答案不在選項裡',J(q.answer),opts.join('')); } }
  else if(q.complete!==false){ bad++; P(name,q.id,'沒有選項、也不是 tf',J(q.type)); } }
  console.log(`  ${name} 答案格式檢查：${L.length} 題，異常 ${bad}`); };
const L=loadFrom(LW); console.log('LW',LW,'QBANK',L.QBANK.length,'EXAM_BANK',L.EXAM.questions.length,'EXAM_BANK.source',J(L.EXAM.source));
if(BASE){ const B=loadFrom(BASE); console.log('BASE',BASE,'QBANK',B.QBANK.length,'EXAM_BANK',B.EXAM.questions.length,'EXAM_BANK.source',J(B.EXAM.source));
  diff('QBANK（legal_qbank.js）',B.QBANK,L.QBANK); diff('EXAM_BANK（exam_bank.js）',B.EXAM.questions,L.EXAM.questions);
  if(J(B.EXAM.courseMap)!==J(L.EXAM.courseMap)){ for(const k of new Set([...Object.keys(B.EXAM.courseMap||{}),...Object.keys(L.EXAM.courseMap||{})])) if(J((B.EXAM.courseMap||{})[k])!==J((L.EXAM.courseMap||{})[k])) console.log('  courseMap 變更',k,J((B.EXAM.courseMap||{})[k]),'→',J((L.EXAM.courseMap||{})[k])); } else console.log('\n  courseMap 兩版相同（'+Object.keys(L.EXAM.courseMap||{}).length+' 門）'); }
console.log('\n## 答案格式'); ansCheck('QBANK',L.QBANK); ansCheck('EXAM_BANK',L.EXAM.questions);
if(SRC){ console.log('\n## LW 的 EXAM_BANK 對原始 json（SRC='+SRC+'）'); const src=new Map(), taken={};
  for(const f of (L.EXAM.files||[])){ const p=path.join(SRC,f.path); if(!fs.existsSync(p)){ P('原始 json 不存在',f.path); continue; } const d=JSON.parse(fs.readFileSync(p,'utf8')); const qs=Array.isArray(d)?d:(d.questions||[]); for(const q of qs){ if(src.has(q.id)) console.log('  json 間重複 id',q.id,f.path); src.set(q.id,Object.assign({_f:f.path},q)); } taken[f.path]=qs.length; }
  let miss=0, mism=0; for(const q of L.EXAM.questions){ const s=src.get(q.id); if(!s){ miss++; console.log('  遊戲題在 json 找不到',q.id,q.course,q.term,q.status); continue; }
    for(const f of ['q','options','answer']) if(J(s[f])!==J(q[f])){ mism++; P('遊戲題和原始 json 不同',q.id,s._f,f,'json',J(s[f]),'遊戲',J(q[f])); } }
  console.log(`  EXAM_BANK ${L.EXAM.questions.length} 題；json 找不到 ${miss}；q／options／answer 不一致 ${mism}；json 題數 ${src.size}（未收進遊戲＝${[...src.keys()].filter(k=>!L.EXAM.questions.some(q=>q.id===k)).length}，多半是 status 不符或交叉審未過，匯入工具決定）`); }
console.log('\nPROBLEM',probs,'項'); process.exit(0);

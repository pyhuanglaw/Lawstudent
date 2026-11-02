/* N3 提示洩漏擴大掃描（CC，2026-11-02；D118-B4 考試提示 STUDY.cueFor／BUG-B4-CUE-LEAK-1102）
   用法：LW=<工作樹> node n3_cue_leak_scan.js [--json out.json] [--min 2]
   只讀工作樹的 src/data/study_units.js、src/data/exam_bank.js、src/data/legal_qbank.js、src/study3d.js（用遊戲本身的 STUDY.unitsOfQ／cueLeaks），不開瀏覽器、不改檔。
   方法：每張卡的提示字串＝u.cue（AA 稿；空的時候用卡片標題，和 STUDY.cueFor 相同；另外也把 title 一起掃，避免之後 AA 填了 cue 標題就不掃）
     → 只取中文／英數連續段，切 2 字以上的 n-gram（偵測等同 2～4 字：5 字以上命中時它的 4 字子串也一定命中；只是顯示合併成最長連續片段） → 去停用詞 → 對那張卡底下的每一題選擇題（tf 沒有選項，跳過）：
     某個詞出現在正確選項、且沒出現在任何錯誤選項＝命中。只列「極大」命中（被更長的命中詞包住的短詞不重複列）。
     題幹也出現的命中詞另列（inStem：玩家本來就看得到這個詞，提示的額外資訊較少，但仍是「只有正確選項有」）。whole＝命中的是整段提示（cueLeaks 會擋的那一種）。
     可疑分數：最長命中詞長度（主排序）→ 命中詞數 → 該詞在正確選項中的字數占比。另標 cueLeaks（整段字串比對）有沒有擋。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const LW=process.env.LW||process.cwd();
const args=process.argv.slice(2); const opt=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null;};
const MIN=+(opt('--min')||2);
const ctx={console}; vm.createContext(ctx);
const rd=f=>fs.readFileSync(path.join(LW,f),'utf8');
vm.runInContext(['src/data/study_units.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/study3d.js'].map(rd).join('\n;\n')+
  '\n;this.U=STUDY_UNITS;this.E=EXAM_BANK;this.Q=QBANK;this.S=STUDY;',ctx);
const {U,E,Q,S}=ctx;
/* 停用：單字虛詞（整個 n-gram 都由這些字組成就丟）＋常見泛用詞 */
const STOP_CH=new Set('的之與及法和或是在有不為而了誰何其於以由對者所也就都被把將從向這那各該此其等即並且但若如則可能會要什麼怎麼哪些個一二三四五六七八九十'.split(''));
const STOP_W=new Set(['什麼','可以','自己','怎麼','時候','問題','哪些','一個','是否','如何','為何','什麼時候','誰可以',
  '法律','規定','原則','民法','刑法','憲法','刑事','訴訟','刑事訴訟','事訴訟法','刑事訴訟法','訴訟法','事訴','訟法',
  '行為','權利','效力','效果','關係','概念','基本','一般','意義','條文','制度','以上','皆是','皆非','有效','無效','應該','須有',
  '（一）','（二）','（三）','（四）']);
const EDGE=new Set('的之與及和或是在而了其於以對者所也並且但若則'.split(''));   /* 頭尾是虛詞的詞不算（例：「的侵害」）*/
const segs=t=>(t.match(/[一-鿿A-Za-z0-9§\-]+/g)||[]);
function grams(t){ const out=new Set(); for(const s of segs(t)){ const a=[...s]; for(let n=MIN;n<=a.length;n++) for(let i=0;i+n<=a.length;i++){ const g=a.slice(i,i+n).join('');
  if(STOP_W.has(g)) continue; if([...g].every(ch=>STOP_CH.has(ch))) continue; if(/^[0-9\-]+$/.test(g)) continue; if(EDGE.has(a[i])||EDGE.has(a[i+n-1])) continue; out.add(g);} } return [...out]; }
const qById={}; for(const q of E.questions) qById[q.id]=q; for(const q of Q) qById[q.id]=qById[q.id]||q;
const rows=[], blocked=[], stats={units:U.units.length,qs:0,mc:0,tf:0,unmapped:0,withCue:U.units.filter(u=>(u.cue||'').trim()).length};
const allQ=Object.values(qById); stats.qs=allQ.length;
for(const q of allQ){ if(!S.unitsOfQ(q.id).length) stats.unmapped++; if(q.type==='tf'||!q.options) stats.tf++; else stats.mc++; }
for(const u of U.units){ const cueStr=(u.cue||'').trim()||u.title; const srcs=[...new Set([cueStr,u.title])];
  for(const qid of u.qids){ const q=qById[qid]; if(!q||q.type==='tf'||!q.options) continue;
    const keys=Object.keys(q.options), rk=keys.filter(k=>String(k)===String(q.answer)), wk=keys.filter(k=>String(k)!==String(q.answer));
    const R=rk.map(k=>String(q.options[k])).join(' '), W=wk.map(k=>String(q.options[k]));
    const lk=S.cueLeaks(q,cueStr);
    if(lk) blocked.push({qid,unit:u.id,cue:cueStr});
    let hits=[]; for(const s of srcs) for(const g of grams(s)) if(R.includes(g)&&!W.some(w=>w.includes(g))) hits.push(g);
    hits=[...new Set(hits)]; hits=hits.filter(g=>!hits.some(h=>h!==g&&h.includes(g)));   /* 極大命中 */
    /* 反向參考：詞出現在正確選項＋任一錯誤選項（不算洩漏，只統計）*/
    if(!hits.length&&!lk) continue;
    hits.sort((a,b)=>b.length-a.length);
    const maxL=hits.length?[...hits[0]].length:0;
    rows.push({qid,course:q.course||u.course,unit:u.id,title:u.title,cue:cueStr,cueIsTitle:!(u.cue||'').trim(),hits,maxL,
      cover:hits.length?Math.round(100*hits.reduce((a,g)=>a+[...g].length,0)/Math.max(1,[...R].length)):0,
      answer:q.answer,right:rk.map(k=>'('+k+')'+q.options[k]).join(' '),wrong:wk.map(k=>'('+k+')'+q.options[k]).join('　'),stem:q.q,cueLeaks:lk,inStem:hits.filter(g=>String(q.q).includes(g)),whole:hits.includes(cueStr)}); } }
for(const r of rows){ r.tier=!r.hits.length?'-':(r.maxL>=4||r.cover>=50)?'A':(r.maxL>=3||r.cover>=25)?'B':'C'; }
/* A＝命中詞 4 字以上、或占正確選項一半以上（選項幾乎就是提示詞）；B＝3 字、或占 1/4 以上；C＝2 字且只是長句裡的一小段 */
rows.sort((a,b)=>b.maxL-a.maxL||b.hits.length-a.hits.length||b.cover-a.cover||a.qid.localeCompare(b.qid));
const out={lw:LW,stats,blocked,rows};
if(opt('--json')) fs.writeFileSync(opt('--json'),JSON.stringify(out,null,1));
console.log(JSON.stringify(stats));
console.log('cueLeaks 已擋：'+blocked.length+'　關鍵詞命中（含已擋）：'+rows.length+'　其中 cueLeaks 沒擋：'+rows.filter(r=>!r.cueLeaks).length);
for(const t of ['A','B','C','-']) console.log('  等級 '+t+'：'+rows.filter(r=>r.tier===t).length+'（沒擋 '+rows.filter(r=>r.tier===t&&!r.cueLeaks).length+'）');
for(const L of [4,3,2]) console.log('  最長命中 '+L+(L===4?'+':'')+' 字：'+rows.filter(r=>(L===4?r.maxL>=4:r.maxL===L)).length+'（沒擋 '+rows.filter(r=>(L===4?r.maxL>=4:r.maxL===L)&&!r.cueLeaks).length+'）');
for(const r of rows.slice(0,+(opt('--top')||40))) console.log([r.qid,r.unit,r.hits.join('／'),r.tier,r.cover+'%',r.cueLeaks?'已擋':'沒擋','正:'+r.right].join('\t'));

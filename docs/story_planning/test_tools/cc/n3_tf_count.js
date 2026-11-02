// CC 11-02：N3 重跑用——數是非題被擋幾題、選擇題會出提示幾題（用遊戲的 STUDY.cueLeaks）。用法：LW=<工作樹或 git archive 的 src> node n3_tf_count.js
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
let tf=0, tfBlocked=0, mcShow=0, mc=0;
const allQ=Object.values(qById);
for(const q of allQ){ const us=S.unitsOfQ(q.id); if(!us.length) continue; const u=us[0]; const t=(u.cue||'').trim()||u.title;
  if(q.type==='tf'||!q.options){ tf++; if(S.cueLeaks(q,t,u.title)) tfBlocked++; } else { mc++; if(!S.cueLeaks(q,t,u.title)) mcShow++; } }
console.log(JSON.stringify({tf,tfBlocked,mc,mcShow,mcBlocked:mc-mcShow}));

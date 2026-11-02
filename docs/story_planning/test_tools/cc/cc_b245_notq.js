// CC（帳號 A）11-02 BB_245 第二批 #9：NOT-QUESTION-DEL-1102 全文掃描（Node，不開瀏覽器、不改 src/）。
// LAWWW 驗法（BB245_LAWWW_REPLY_1102.md 第一節）：建議加全文掃描探針（src 字串裡三種句型 0 筆）。
// 三種句型＝AA_573（ad64e1094）範圍那一句：「在自己的話後面標『這不是問句／這次是直述句／這次是問句』」；註解不算。
// 做法：掃 src/ 底下所有 .js（含 src/data/ 的產生檔），用簡單的 JS 斷詞把字串（'…'、"…"、`…`）和註解（// …、/* … */）分開，
//   只看字串裡有沒有「這不是問句」「這次是直述句」「這次是問句」。註解裡的只印 INFO（AA_573：註解不算）。
//   資料檔裡「註記」欄位的值（例：src/data/ladder.js 的 "note": "…這不是問句…"，是給企劃看的說明，不會出現在畫面上）和註解一樣只印 INFO。
//   另外 INFO：字串裡的「子晴：直述句」（AA_573 #5 舊標題，已改「子晴：錯過」）、「直述句」「不是問句」（不同寫法）——只記，不判。
// 修正 commit：d4398a91f（9 處）＋a1c1d9a59（#3 solo_before D06 重匯）。對照：d4398a91f^（預期 FAIL：10 處都在）、a1c1d9a59^（預期 FAIL：只剩 solo_before D06 那 1 處）。
// 用法：cd <受測工作樹> && node <本檔>
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=process.cwd();
let fails=0; const FL=[];
const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok){ fails++; FL.push(n); } };
const info=s=>console.log('INFO '+s);
let sha='?'; try{ sha=cp.execSync('git rev-parse --short HEAD',{cwd:ROOT}).toString().trim(); }catch(e){}
console.log('cc_b245_notq　受測 '+ROOT+'（'+sha+'）');
const PAT=['這不是問句','這次是直述句','這次是問句'];
const SOFT=[/子晴：直述句/,/直述句/,/不是問句/];
/* 斷詞：回傳 [{kind:'str'|'cmt', text, line}] */
function scan(src){ const out=[]; let i=0, line=1, prev='';   /* prev：上一個不是空白的字元（判斷 / 是除號還是正規式）*/
  const n=src.length; const push=(kind,s,l,at)=>out.push({kind,text:s,line:l,at});
  while(i<n){ const c=src[i], d=src[i+1];
    if(c==='\n'){ line++; i++; continue; }
    if(c==='/'&&d==='/'){ const j=src.indexOf('\n',i); const e=j<0?n:j; push('cmt',src.slice(i,e),line); i=e; continue; }
    if(c==='/'&&d==='*'){ const j=src.indexOf('*/',i+2); const e=j<0?n:j+2; const s=src.slice(i,e); push('cmt',s,line); line+=(s.match(/\n/g)||[]).length; i=e; continue; }
    if(c==='"'||c==="'"||c==='`'){ const q=c, l0=line; let j=i+1, s=''; let depth=0;
      while(j<n){ const ch=src[j]; if(ch==='\\'){ s+=src.slice(j,j+2); if(src[j+1]==='\n') line++; j+=2; continue; } if(ch==='\n'){ line++; if(q!=='`') break; }
        if(q==='`'&&ch==='$'&&src[j+1]==='{'){ depth++; s+='${'; j+=2; continue; } if(q==='`'&&depth&&ch==='}'){ depth--; s+='}'; j++; continue; }
        if(ch===q&&!depth){ j++; break; } s+=ch; j++; }
      push('str',s,l0,i); i=j; prev='a'; continue; }
    if(c==='/'&&(prev===''||/[(,=:[!&|?{};+\-*%<>~^]/.test(prev))){   /* 正規式：跳過到結尾的 /（含字元類）*/
      let j=i+1, cls=false; while(j<n&&src[j]!=='\n'){ const ch=src[j]; if(ch==='\\'){ j+=2; continue; } if(ch==='[') cls=true; else if(ch===']') cls=false; else if(ch==='/'&&!cls) break; j++; }
      push('re',src.slice(i,j+1),line); i=j+1; prev='a'; continue; }
    if(!/\s/.test(c)) prev=c; i++; }
  return out; }
const files=[]; (function walk(d){ for(const f of fs.readdirSync(d,{withFileTypes:true})){ const p=path.join(d,f.name); if(f.isDirectory()) walk(p); else if(/\.js$/.test(f.name)) files.push(p); } })(path.join(ROOT,'src'));
check('src/ 底下有 .js 可以掃',files.length>50,files.length+' 檔');
const hits=[], cmts=[], soft=[], notes=[]; let nStr=0;
/* 資料檔裡「註記」欄位的值（ladder.js 這類 JSON 的 "note": "…"）不是玩家看得到的字，和註解一樣只記（AA_573 範圍：玩家看得到的文字） */
const NOTE_KEY=/["']?\b(note|notes|noteSrc|src_note|why|reason|comment)["']?\s*:\s*$/;
for(const f of files){ const rel=path.relative(ROOT,f), SRC=fs.readFileSync(f,'utf8'); const T=scan(SRC);
  for(const t of T){ if(t.kind==='str'){ nStr++; const isNote=NOTE_KEY.test(SRC.slice(Math.max(0,t.at-40),t.at));
      for(const p of PAT) if(t.text.includes(p)) (isNote?notes:hits).push([rel,t.line,p,t.text.slice(0,80)]);
      if(!PAT.some(p=>t.text.includes(p))) for(const r of SOFT) if(r.test(t.text)){ soft.push([rel,t.line,t.text.slice(0,80)]); break; } }
    else if(t.kind==='cmt'){ for(const p of PAT) if(t.text.includes(p)) cmts.push([rel,t.line,p]); } } }
info('掃了 '+files.length+' 檔、字串 '+nStr+' 個');
/* 自我檢查：斷詞真的抓得到這種句子（不靠受測版本）*/
{ const T=scan("const a='欸不是。這不是問句。'; // 這次是問句\nconst b=`x${1}這次是直述句`; const r=/a\\/b'/; const c=\"這次是問句\";");
  const s=T.filter(t=>t.kind==='str').map(t=>t.text).join('|'), c=T.filter(t=>t.kind==='cmt').map(t=>t.text).join('|');
  check('（自我檢查）斷詞：字串 3 個都抓到、註解那一句算註解、正規式裡的引號不會吃掉後面的字串',PAT.every(p=>s.includes(p))&&c.includes('這次是問句')&&!s.includes('// 這次'),JSON.stringify({s,c})); }
for(const p of PAT){ const h=hits.filter(x=>x[2]===p); check('src 字串裡「'+p+'」0 筆',!h.length,h.map(x=>x[0]+':'+x[1]+' 「'+x[3]+'」').join('｜')); }
info('註解裡有這三種句型的（AA_573：註解不算，只記）：'+cmts.length+' 處 '+cmts.slice(0,12).map(x=>x[0]+':'+x[1]+' '+x[2]).join('｜'));
info('資料檔「註記」欄位（"note": …）裡的（不是玩家看得到的字，只記）：'+notes.length+' 處 '+notes.slice(0,12).map(x=>x[0]+':'+x[1]+' '+x[2]+' 「'+x[3].slice(0,40)+'…」').join('｜'));
info('字串裡的相近寫法（只記、不判）：'+soft.length+' 處 '+soft.slice(0,12).map(x=>x[0]+':'+x[1]+' 「'+x[2]+'」').join('｜'));
console.log(fails?('FAILED '+fails+'：'+FL.join('、')):'ALL PASS');
process.exit(fails?1:0);

// YT-REWRITE-1103（語彤新背景；AA 定稿 D109）：舊稿（AA_503～AA_511 動態、AA_440 寒暑假、AA_524…）裡語彤的句子，遊戲照 AA_630（企劃線 bb4401fd3）、
// AA_627 表 A（40374c664，【改句】【換字】）改了。對舊稿的測試用這支把「稿上語彤那一段」照同一張表換成新句，再比——
// 只換「位置是這個遊戲檔」的列（不會換到別的檔、別的人），只換呼叫的人指定的那幾行（例：稿的「### 3-」語彤那一節）。表上整段換、刪的列不在這裡。
'use strict';
const cp=require('child_process'), path=require('path');
const ROOT=path.join(__dirname,'..');
/* 讀表要用沒被 tests/alison.js 包過的 execFileSync（包過的會先把 AA_630 的原句照換字表換掉）*/
const show=(sha,p)=>{ try{ return (cp.__worldEf||cp.execFileSync).call(cp,'git',['-C',ROOT,'show',sha+':'+p],{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ return ''; } };
const cells=line=>{ const out=[]; let cur='', s=line.trim().slice(1,-1); for(let i=0;i<s.length;i++){ const ch=s[i]; if(ch==='\\'&&s[i+1]==='|'){ cur+='|'; i++; continue; } if(ch==='|'){ out.push(cur.trim()); cur=''; continue; } cur+=ch; } out.push(cur.trim()); return out; };
let BY=null;
const load=()=>{ if(BY) return BY; BY={}; const LIT=/'([^']*)'/g;
  const add=(file,o,n)=>{ if(!o||o===n||/<|見 H-|見表下|改成：|交往中：|沒交往|^（刪|^（不改|整段|^（照第|^（這一行/.test(n)) return; (BY[file]=BY[file]||[]);
    const lo=[...o.matchAll(LIT)].map(m=>m[1]), ln=[...n.matchAll(LIT)].map(m=>m[1]);
    if(lo.length&&lo.length===ln.length){ lo.forEach((x,i)=>{ if(!x||x===ln[i]) return; BY[file].push([x,ln[i]]);
        const w=/^W(\d+)([一二三四五六日]) (\d\d:\d\d)$/, a=w.exec(x), b=w.exec(ln[i]);   /* 動態的時間：遊戲寫 W5二 21:00，稿寫「第 5 週週二 21:00」*/
        if(a&&b) BY[file].push(['第 '+a[1]+' 週週'+a[2]+' '+a[3],'第 '+b[1]+' 週週'+b[2]+' '+b[3]]); }); return; }
    const st=s=>s.replace(/^(選項|語彤：)/,'').replace(/^「([^「」]*)」$/,'$1'); BY[file].push([st(o),st(n)]); };
  for(const l of show('bb4401fd3','docs/story_planning/AA_630_語彤台詞改寫.md').split('\n')){ if(!/^\|\s*[A-Z]-\d{3}/.test(l)) continue; const c=cells(l); if(c.length<4) continue; const f=c[1].replace(/`/g,'').split(':')[0]; add(f,c[2],c[3]); }
  for(const l of show('40374c664','docs/story_planning/AA_627_語彤舊設定清查.md').split('\n')){ if(!/^\|\s*A-\d{3}/.test(l)||/^\|\s*A-26[34]\s*\|/.test(l)) continue;   /* A-263 不換（燒臘店那一場）*/ const c=cells(l); if(c.length<6||!/^【(改句|換字)】/.test(c[5])) continue; const f=c[1].replace(/`/g,'').split(':')[0];
    if((BY[f]||[]).some(([x])=>x===c[3])) continue;   /* AA_630 有同一句＝照 AA_630 */ add(f,c[3],c[4]); }
  for(const f in BY) BY[f].sort((a,b)=>b[0].length-a[0].length);
  return BY; };
// 一個字串照「位置是 files 其中一個」的列換
const fix=(s,files)=>{ if(typeof s!=='string') return s; const B=load(); for(const f of [].concat(files)) for(const [x,y] of (B[f]||[])) if(s.indexOf(x)>=0) s=s.split(x).join(y); return s; };
// markdown 裡只換 test(行, 目前的標題) 為真的那幾行
const fixLines=(md,files,test)=>{ let head=''; return String(md).split('\n').map(l=>{ if(/^#{1,6}\s/.test(l)){ head=l; return l; } return test(l,head)?fix(l,files):l; }).join('\n'); };
module.exports={fix,fixLines,pairs:f=>load()[f]||[]};

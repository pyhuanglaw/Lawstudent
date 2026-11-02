// 以安改稿（AA_587 第三批、AA_589 第四批、AA_592 ①b、AA_594 ④b；企劃線白名單上的版本）的稿——給舊測試的「每一句都在稿裡」檢查用（同 tests/aa590_doc.js 學姊的做法）：
//   被這幾份改過的句子不在原來的源稿裡（AA 沒有回頭改源稿），改成「在原稿裡，或在這幾份表的『改成』欄」。逐列核對在各自的測試（aa587_b3、aa589_an_b4、aa592_an_1b、aa594_an_4b）。
//   has(t)：t 一字不差是某一列「改成」欄的整格（或那一格以「／」分開的一段，去掉「祐廷：」「（以安）」這類說話人標記），
//          或是 AA_589 第 7-5 節（S6）、第 10 節（想去的店，看過那一頁）稿裡用「」或（）引的整句。
const cp=require('child_process'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const DOCS=[['1cf992d66','docs/story_planning/AA_587_以安改稿_第三批_大一大二事件.md'],['2414f251c','docs/story_planning/AA_589_以安改稿_第四批_大三大四畢業後.md'],
  ['4162d22e1','docs/story_planning/AA_592_以安改稿_1b_手機訊息與一般閒聊.md'],['4162d22e1','docs/story_planning/AA_594_以安改稿_4b_不分年級系統事件.md']];
const show=(sha,p)=>{ try{ return cp.execFileSync('git',['-C',ROOT,'show',sha+':'+p],{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ return ''; } };
const HOLD589=[];   /* AA_589 第 56～58 列：第 13 節（2414f251c）解除保留，句子照第 13 節的稿（下面一起收）*/
const TXT={}, NEW=new Set(), MAP=new Map(), ROWS=[];   /* MAP：原句 → 改成（一句換一句的列；原句太短（4 個字以內，例「……好。」）、刪掉、拆句的不放——那幾句只換了某一處，要看情境）*/
const add=v=>{ v=v.trim().replace(/^`|`$/g,''); if(!v) return; NEW.add(v); const q=v.replace(/^「(.*)」$/,'$1'); NEW.add(q); };
for(const [sha,p] of DOCS){ const D=show(sha,p); TXT[p]=D;
  for(const line of D.split('\n')){
    const m=line.match(/^\|\s*([0-9]+|新[0-9]+|使[0-9]+)\s*\|(.*)$/); if(!m) continue;
    const c=m[2].split('|').map(s=>s.trim()); if(c.length<4) continue;
    if(/AA_589_/.test(p)&&HOLD589.includes(m[1])) continue;   /* AA_589 第 56～58 列（為什麼念法律）等使用者選，遊戲裡還是原句 */
    const v=c[3]; if(!v||v.startsWith('（刪')) continue;
    if(!v.includes('／')&&c[2]!==v&&!v.startsWith('（刪')) ROWS.push({doc:p,n:m[1],where:c[0],old:c[2].replace(/^`|`$/g,''),nw:v.replace(/^`|`$/g,'')});
    if(!v.includes('／')&&c[2].replace(/^`|`$/g,'').length>4&&!MAP.has(c[2])) MAP.set(c[2].replace(/^`|`$/g,''),v.replace(/^`|`$/g,''));
    add(v); for(let s of v.split('／')){ s=s.trim().replace(/^(祐廷|以安|阿哲)：/,'').replace(/^（(以安|阿哲在麵店團)）/,''); add(s); }
  } }
{ const D=TXT[DOCS[1][1]]; for(const l of ((D.split('## 13.')[1]||'').split('```')[1]||'').split('\n')){ const m=l.trim().match(/^(?:［[^］]*］)?(?:以安|祐廷)：(.+)$/); if(m) NEW.add(m[1]); }
  for(const sec of [D.slice(D.indexOf('### 7-5'),D.indexOf('### 7-6')),D.slice(D.indexOf('## 10.'),D.indexOf('## 11.'))]){
    for(const q of sec.match(/「[^」]+」/g)||[]) NEW.add(q.slice(1,-1));
    for(const q of sec.match(/（[^（）]*(?:「[^」]*」[^（）]*)*）/g)||[]) NEW.add(q);
    for(const l of sec.split('\n')){ const m=l.match(/^\s*-\s*(?:以安|旁白|祐廷[^：]*)：(.+?)\s*$/); if(m) for(const s of m[1].split('／')) NEW.add(s.trim()); } } }
/* overlay(text, re)：舊稿的文字裡，位置欄符合 re 的列（一句換一句）原句換成改成；回傳 [新文字, 換了哪幾列] */
const overlay=(text,re)=>{ const used=[]; for(const r of ROWS){ if(!re.test(r.where)||!text.includes(r.old)) continue; text=text.split(r.old).join(r.nw); used.push(r.doc.match(/AA_\d+/)[0]+' 第 '+r.n+' 列'); } return [text,used]; };
module.exports={DOCS,TXT,NEW,MAP,ROWS,overlay,has:t=>NEW.has(t),rev:t=>MAP.has(t)?MAP.get(t):t};

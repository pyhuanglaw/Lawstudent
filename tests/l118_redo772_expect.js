// 測試共用（不是測試本身）：118 巷九間店改版（L118-SHOPS-REDO-1111，使用者 2026-11-11 X338）以後，逐字比舊稿（AA_311、AA_397、AA_404、AA_410、AA_535…）的測試用這裡的對照——
// 「舊稿 × AA_772（白名單上的版本）的 fix／sideq_rename／regular_greets／slowread_to_mokuyobi／food_fav／eat_lines」＝現在遊戲的字。
// 不把新句子一句一句抄進各支測試：一律從白名單（docs/handoff/story_import_allow.json）上的 AA_772 讀（git show <sha>:<路徑>）。
//   R.d            AA_772 整份
//   R.fix(text)    把一段字（舊稿、舊期望的句子）照 fix 列 old→new 換（長的先換；new 包著 old 的不重複換）；也換 food_fav.fix
//   R.fixFile(f,t) 只套 fix 裡 file＝f 的列（和歷史 commit 整檔比字用）
//   R.doc(text)    舊稿整份 → 現在的字（fix 再把舊店名換成現在的店名）；R.names(text) 只換店名
//   R.line(s)      一句舊期望 → 現在的句子（＝fix(s)）
//   R.corpus()     AA_772 裡所有新的句子接成一大串（fix 的 new、regular_greets、H3 三句、eat_lines 的 first／staff、food_fav、invite_places、sideq_rename 的新店名、staff）：
//                  「遊戲裡每一句都在稿裡」這種檢查，稿＝舊稿＋這一串
//   R.rename       sideq_rename.map（舊店名 key → 現在的店名）；R.shopZone（SQ → 店 id）
//   R.name(old)    舊店名 → 現在的店名（沒有＝原字）
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), PATH='docs/story_planning/AA_772_l118_shops_redo_fix.json';
const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8'));
const ent=(allow.files||[]).filter(e=>e.path===PATH&&e.status==='approved').pop();
if(!ent) throw new Error('白名單沒有 '+PATH);
const d=JSON.parse(cp.execFileSync('git',['show',ent.sha+':'+PATH],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26}));
const rows=[].concat((d.fix||[]).map(r=>[r.old,r.new]),((d.food_fav||{}).fix||[]).map(r=>[r.old,r.new])).filter(([o,n])=>o&&n&&o!==n&&n!=='（拿掉）'&&!/第三句：/.test(o)).sort((a,b)=>b[0].length-a[0].length);
const PH='\u0000R772\u0000';
function fix(text,minLen){ let s=String(text); for(const [o,n] of rows){ if(o.length<(minLen||5)||!s.includes(o)) continue; s=n.includes(o)?s.split(n).join(PH).split(o).join(n).split(PH).join(n):s.split(o).join(n); } return s; }
/* 只套那個檔自己的列（和歷史版本整檔比字用：別的檔的短列，例如地點名，不會誤換到這個檔的註解）*/
function fixFile(file,text){ let s=String(text); const rs=(d.fix||[]).filter(r=>r.file===file&&r.old&&r.new&&r.old!==r.new&&r.new!=='（拿掉）'&&!/第三句：/.test(r.old)).sort((x,y)=>y.old.length-x.old.length);
  for(const r of rs){ const o=r.old, n=r.new; if(!s.includes(o)) continue; s=n.includes(o)?s.split(n).join(PH).split(o).join(n).split(PH).join(n):s.split(o).join(n); } return s; }
function strings(o,out){ if(typeof o==='string') out.push(o); else if(o&&typeof o==='object') for(const k of Object.keys(o)) strings(o[k],out); return out; }
let _corpus=null;
function corpus(){ if(_corpus!=null) return _corpus; const out=[]; for(const r of (d.fix||[])) out.push(r.new); strings(d.regular_greets,out); strings((d.slowread_to_mokuyobi||{}).H3,out); strings(d.eat_lines,out); strings(d.food_fav,out); strings(d.invite_places,out); strings(d.sideq_rename,out); strings(d.staff,out); return (_corpus=out.join('\n')); }
const rename=Object.assign({},(d.sideq_rename||{}).map||{}), shopZone={}; for(const k of Object.keys((d.sideq_rename||{}).shop_zone||{})) shopZone[k]=String(d.sideq_rename.shop_zone[k]).split(/[（(]/)[0].trim();
/* 舊稿整份換成現在的字：fix 列＋舊店名（整個店名）換成現在的店名（照 sideq_rename：故事搬到哪一間）*/
function names(text){ let s=String(text); for(const o of Object.keys(rename).sort((x,y)=>y.length-x.length)) s=s.split(o).join(rename[o]); return s; }
const doc=text=>names(fix(text));
module.exports={d,sha:ent.sha,rows,fix,fixFile,names,doc,line:s=>fix(s,1),corpus,rename,shopZone,name:o=>Object.prototype.hasOwnProperty.call(rename,o)?rename[o]:o};

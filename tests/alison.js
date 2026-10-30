// AA_380（企劃線 eb0ccfec；使用者 2026-10-21 23:2x「改成Alison」）：遊戲裡「小語」改名 Alison，企劃線的舊稿還寫「小語」。
// 讀稿對字的測試第一行先 require('./alison.js')：之後 child_process 讀 docs/story_planning/ 的 git show，文字照匯入工具同一套規則換
// （tools/story/import_guard.py 的 alison：Alison 和中文字之間空一個半形空格；挨著標點、行頭行尾、已經有空格的不空）。
// WORLD-RENAME-1030（D115，使用者 2026-10-30）：再照 docs/WORLD_NAMING.md 換虛構校名——和匯入工具讀稿同一支（import_guard.py 的 read_fix＝alison＋world，
// world 用 tools/rename/world_names.py：台詞口語「A館」、旁白字幕正式「法律系館A」、查證出處句不換），白名單上還沒換名的舊稿讀進來也是遊戲裡的新名字。
'use strict';
const cp=require('child_process'), path=require('path');
const CJK=/[㐀-䶿一-鿿぀-ヿ豈-﫿]/;
function alison(s){ if(typeof s!=='string'||s.indexOf('小語')<0) return s;
  return s.replace(/小語/g,(m,i)=>{ const pre=i>0?s[i-1]:'', nx=s[i+2]||''; return (pre&&CJK.test(pre)?' ':'')+'Alison'+(nx&&CJK.test(nx)?' ':''); }); }
const OLD=/[臺台]灣大學|[臺台]大|NTU|National Taiwan|政治大學|政大|NCCU|霖澤|萬才|博雅|傅鐘|椰林|醉月湖|洞洞館|小福|活大|自強十舍|國青中心|辜振甫/;
const GUARD=path.join(__dirname,'..','tools','story','import_guard.py');
const ef0=cp.__worldEf||cp.execFileSync;
function world(s){ if(typeof s!=='string'||!OLD.test(s)) return s;
  return ef0.call(cp,'python3',[GUARD,'world'],{input:s,encoding:'utf8',maxBuffer:256*1024*1024}); }
const fix=r=>typeof r==='string'?world(alison(r)):(Buffer.isBuffer(r)?Buffer.from(world(alison(r.toString('utf8'))),'utf8'):r);
const isDoc=s=>/\bshow\b/.test(s)&&/docs\/story_planning\//.test(s);
if(!cp.__alison){
  const ex=cp.execSync, ef=cp.execFileSync; cp.__worldEf=ef;
  cp.execSync=function(cmd){ const r=ex.apply(this,arguments); return typeof cmd==='string'&&isDoc(cmd)?fix(r):r; };
  cp.execFileSync=function(file,args){ const r=ef.apply(this,arguments); return Array.isArray(args)&&isDoc(args.join(' '))?fix(r):r; };
  cp.__alison=true; }
module.exports={alison,world};

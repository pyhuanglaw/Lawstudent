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
// NOODLE-TEAM-SHRINK-1030（AA_542 企劃線 6b33b4012，使用者 10-30 X144 麵店團縮小成背景）：遊戲照 AA_542 換了玩家看得到的字，舊稿讀進來照同一張表換（tools/story/ndl542_fix.json，長的先換）
let NDL=null; function ndl(s){ if(typeof s!=='string') return s; if(!NDL){ NDL=[]; for(const fn of ['ndl542_fix.json','nocmp_fix.json','d118_fix.json','aa595_fix.json','aa602_fix.json','aa600_fix.json','aa612_fix.json','aa630_fix.json']){ try{ NDL=NDL.concat(JSON.parse(require('fs').readFileSync(path.join(__dirname,'..','tools','story',fn),'utf8')).pairs); }catch(e){} } }   /* nocmp_fix.json：NO-COMPARE-1030（D116 不跟別人比，AA_546）同一個做法；d118_fix.json：D118 沒有期中考（AA_578 企劃線 b13db535f）*/
  for(const [a,b] of NDL) if(s.indexOf(a)>=0) s=s.split(a).join(b); return s; }
const fix=r=>typeof r==='string'?ndl(world(alison(r))):(Buffer.isBuffer(r)?Buffer.from(ndl(world(alison(r.toString('utf8')))),'utf8'):r);
// YT-REWRITE-1103（語彤新背景，AA 定稿 D109）：AA_630／AA_627／AA_625／AA_626 取代舊稿裡語彤的句子（一句一句的換字表在 aa630_fix.json；整段換、交往中／沒交往兩版、AA 決定的列沒辦法逐句換）——
// 讀 docs/story_planning/ 的 .md 稿（不是這四份本身）時，後面接上這四份（白名單上的版本），「每一句都在稿裡」的測試也認得新句（src 是 tools/story/apply_aa630_src.py 照這四份改的）。
const YT_DOCS=[['bb4401fd3','docs/story_planning/AA_630_語彤台詞改寫.md'],['40374c664','docs/story_planning/AA_627_語彤舊設定清查.md'],['9ba14498e','docs/story_planning/AA_625_語彤新版事件台詞.md'],['9ba14498e','docs/story_planning/AA_626_語彤D13淡水_新背景改寫.md']];
let YTX=null; const ytx=()=>{ if(YTX==null){ YTX='\n<!-- YT-REWRITE-1103 -->\n'; const seen=new Set();
    for(const [sha,p] of YT_DOCS){ let t=''; try{ t=ef0.call(cp,'git',['-C',path.join(__dirname,'..'),'show',sha+':'+p],{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ continue; }
      const add=x=>{ x=String(x).replace(/[「」]/g,' ').trim(); for(const y of x.split(/\s{2,}|／/)){ const z=y.trim(); if(z.length>=2&&!seen.has(z)){ seen.add(z); YTX+='〔YT〕'+z+'\n'; } } };
      for(const l of t.split('\n')){ for(const m of l.matchAll(/「([^「」]{2,})」/g)){ const z='「'+m[1]+'」'; if(!seen.has(z)){ seen.add(z); YTX+='〔YT〕'+z+'\n'; } add(m[1]); } if(/^\|\s*[A-Z]-\d{3}/.test(l)){ const c=l.split('|'); if(c.length>5){ const k=/AA_627/.test(p)?5:4; add(c[k]); const raw=(c[k]||'').trim(); if(raw&&!seen.has(raw)){ seen.add(raw); YTX+='〔YT〕'+raw+'\n'; } } }   /* 「改成」欄：AA_630 第 4 欄、AA_627（多一欄說話人）第 5 欄 */ else if(/^>\s/.test(l)) add(l.replace(/^>\s*/,'').replace(/^[^：]{1,12}：/,'')); else if(/^[^|#>-].*：/.test(l)&&/^(語彤|蘇姨|秀琴姨|祐廷|柏翰|指導律師|新屋主|語彤的媽媽|明軒)：/.test(l)) add(l.replace(/^[^：]+：/,'')); } } }
    return YTX; };   /* 只收這四份的「改成」欄、> 引文、台詞行（去掉「」，一行一句，前面加〔YT〕）：給「這一句在不在稿裡」用；解析稿的表格、引文、選項的測試讀不到 */
const fixDoc=(r,cmd)=>{ const out=fix(r); if(!/\.md/.test(cmd)||/AA_62[5-7]_|AA_630_/.test(cmd)) return out; const x=ytx(); return typeof out==='string'?out+x:(Buffer.isBuffer(out)?Buffer.concat([out,Buffer.from(x,'utf8')]):out); };
const isDoc=s=>/\bshow\b/.test(s)&&/docs\/story_planning\//.test(s);
if(!cp.__alison){
  const ex=cp.execSync, ef=cp.execFileSync; cp.__worldEf=ef;
  cp.execSync=function(cmd){ const r=ex.apply(this,arguments); return typeof cmd==='string'&&isDoc(cmd)?fixDoc(r,cmd):r; };
  cp.execFileSync=function(file,args){ const r=ef.apply(this,arguments); return Array.isArray(args)&&isDoc(args.join(' '))?fixDoc(r,args.join(' ')):r; };
  cp.__alison=true; }
module.exports={alison,world,ndl};

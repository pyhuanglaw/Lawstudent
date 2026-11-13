'use strict';
/* D158-KX-SAMESCHOOL（76f8 rc2；BB-C BB_467 最後一節的草稿，LAWWW-C 照用）：src/data 裡屬於 kexin 的字串不准有外校前提的說法。
   canon_scan 只抓校名；這支抓「你們學校／我們學校／你們的總圖／臨時證」這類。修改前（76f8b639f0）會列出 BB_467 的那些句子。 */
// 可昕＝首都帝大法律系同屆（D158、X364）：她說的話不准出現外校前提的字。canon_scan 抓校名，這支抓「你們學校」這類說法。
const fs=require('fs'), path=require('path');
const BAD=/(你們學校|妳們學校|我們學校|我學校|你們的總圖|妳們的圖書館|臨時證|你們這邊的|妳們老師|你們老師|我們老師)/;
const ALLOW=[ /* 例外：寫明為什麼（例如「我們學校」包含祐廷的句子，AA 判過）；2026-11-13 AA_987 _meta.part4（企劃線 16398fa636）判留、BB_467 同意 */
  '法律書區，我們老師寫的那本也在。',   /* date_lines D02.books：AA 判：同校說得通（16398fa636） */
  '烏來。我們學校很多人週末騎車來這裡。',   /* date_lines D20 arrive.first：AA 判：同校說得通（16398fa636） */
  '這本跟我們老師用的一樣。',   /* invite_place_lines xs_shanlan.firstAt：AA 判：同校說得通（16398fa636） */
  '我們老師說我的報告',   /* study_scenes kexin scenes.5.mid：AA 判：同校說得通（16398fa636） */
];
const dir=process.env.KX_SAMESCHOOL_DIR?path.resolve(process.env.KX_SAMESCHOOL_DIR):path.join(__dirname,'..','src','data');   /* KX_SAMESCHOOL_DIR＝改讀別的資料夾（例：76f8b639f0 的 src/data 放 scratchpad，確認抓得到 BB_467 那些舊句） */ let bad=[];
function walk(o,own,f,p){ if(typeof o==='string'){ if(own&&BAD.test(o)&&!ALLOW.some(a=>o.includes(a))) bad.push(f+' '+p+' '+o); return; }
  if(Array.isArray(o)) return o.forEach((x,i)=>walk(x,own,f,p+'['+i+']'));
  if(o&&typeof o==='object') for(const k in o) walk(o[k],own||k==='kexin',f,p+'.'+k); }
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.js'))){ const src=fs.readFileSync(path.join(dir,f),'utf8');
  const names=[...src.matchAll(/^(?:const|var|let)\s+([A-Z_][A-Z0-9_]*)\s*=/gm)].map(m=>m[1]); let ctx;
  try{ ctx=new Function('window',src+';return {'+names.map(n=>n+':typeof '+n+'!=="undefined"?'+n+':null').join(',')+'};')({}); }catch(e){ continue; }
  walk(ctx,false,f,''); }
if(bad.length){ console.error('FAIL 可昕外校前提：\n'+bad.join('\n')); process.exit(1); } console.log('ALL PASS kexin_sameschool');

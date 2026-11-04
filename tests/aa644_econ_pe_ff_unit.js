// AA_644 第 6 節（企劃線 27c0193e9）＋AA_643 第 11 節（6ab84d404）——不需要瀏覽器。
// ① 經濟系快轉第一次跨過體育課（pe_y0s1，週三 pm2）：attendBetween 自動算出席時記下，peAdd 在日期卡那一句後面加
//    「（體育課暖身跑了六圈。韋綸跑在最前面，回頭喊你們快一點。）」，只出一次；沒跨過體育課不加。
// ② 語彤交往中的畢業那天學期末的飯：18:30、地點「她家」（字幕「學期末的飯：陳語彤（她家）18:30」）。
// ③ 畢業後每月固定見面：語彤「一盞茶屋打烊以後」（key noodle 不改）。用法：node tests/aa644_econ_pe_ff_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.document={getElementById:()=>null,addEventListener(){}}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|COURSES|CLS|CHARACTERS|ECONFF|POSTGRAD_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/courses.js','src/classes3d.js','src/econff3d.js','src/data/postgrad_lines.js']) load(f);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const dayOf=k=>{ for(let d=-600; d<400; d++){ const t=CALENDAR.dateOf(d); if(t&&t.key===k) return d; } return null; };
global.STORY={dayOfKey:dayOf}; global.STORY_EVENTS=[]; global.EVENTS={running:null}; global.PHONE={pending:()=>[],tick(){},at:()=>true};
const mkG=(k,h)=>({stage:'econ',day:dayOf(k),hour:h,weekday:CALENDAR.dateOf(dayOf(k)).wd,flags:{E01_MORNING:true,ECONFF:{done:{},lines:[]}},events:{done:{}}});
const PE=ECONFF.PE_FF;
check('0. 句子照 AA_644 第 6 節',PE==='（體育課暖身跑了六圈。韋綸跑在最前面，回頭喊你們快一點。）');
const peDays=[]; { const G=mkG('2024-09-02',8); for(let d=dayOf('2024-09-02');d<=dayOf('2024-10-31');d++) if((CLS.dayItems(G,d)||[]).some(it=>it.c&&it.c.id==='pe_y0s1')) peDays.push(d); }
check('0. 經濟系那一年 9/2～10/31 有體育課（pe_y0s1）',peDays.length>=4,peDays.map(d=>CALENDAR.dateOf(d).key).join(','));
{ /* 跨過第一堂體育課的一跳：G 停在那天的晚上，d0＝前兩天 */ const d=peDays[0], G=mkG(CALENDAR.dateOf(d).key,22); G.day=d+1; G.hour=9; ECONFF._peSkip=false;
  ECONFF.attendBetween(G,G.day*24+G.hour,d-2); const a=ECONFF.peAdd(G,'（日期卡那一句）');
  check('① 第一次跨過體育課：日期卡那一句後面加體育課那句（<br> 接）',a==='（日期卡那一句）<br>'+PE,a);
  check('① 沒有日期卡那一句也出（只有體育課那句）',(()=>{ const G2=mkG(CALENDAR.dateOf(d).key,22); G2.day=d+1; ECONFF._peSkip=false; ECONFF.attendBetween(G2,G2.day*24+9,d-2); return ECONFF.peAdd(G2,null)===PE; })());
  /* 第二次跨過 */ const d2=peDays[1]; G.day=d2+1; G.hour=9; ECONFF._peSkip=false; ECONFF.attendBetween(G,G.day*24+G.hour,d2-2); const b=ECONFF.peAdd(G,'（另一句）');
  check('① 第二次跨過：不再出（只出一次，存在 ECONFF.pe）',b==='（另一句）'&&G.flags.ECONFF.pe===1,b); }
{ /* 沒跨過體育課的一跳 */ const d=peDays[0], G=mkG(CALENDAR.dateOf(d+1).key,8); ECONFF._peSkip=false; ECONFF.attendBetween(G,G.day*24+12,d+1); const a=ECONFF.peAdd(G,'（x）');
  check('① 沒跨過體育課：不加',a==='（x）'&&!G.flags.ECONFF.pe,a); }
{ const src=fs.readFileSync(path.join(ROOT,'src/econff3d.js'),'utf8');
  check('① S.advance 兩條路（停在訊息、一般）都在出日期卡（G.day!==d0）時加：r.lines 只記原本那一句',(src.match(/if\(G\.day!==d0\) (ln|line)=S\.peAdd\(G,\1\)/g)||[]).length===2&&/S\._peSkip=false; const res=S\.jumpTo/.test(src)); }
{ const g=POSTGRAD_LINES.TE.GF.heroine_03; check('② 語彤交往中畢業那天：18:30、她家（字幕「學期末的飯：陳語彤（她家）」）',g.h===18.5&&g.placeName==='她家'&&g.invite==='今天不排班。晚上來我家，我煮。',JSON.stringify(g));
  const h=POSTGRAD_LINES.TE.HEART.heroine_03; check('② 還沒交往（心意）那一格照舊一盞茶屋 17:30',h&&h.h===17.5&&h.placeName==='一盞茶屋',JSON.stringify(h)); }
{ const src=fs.readFileSync(path.join(ROOT,'src/pgdates3d.js'),'utf8'); check('③ 畢業後每月見面：語彤 noodle＝「一盞茶屋打烊以後」（key 不改）',/noodle:\{kind:'meet',place:'一盞茶屋打烊以後'/.test(src)&&!/麵店打烊以後'/.test(src)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

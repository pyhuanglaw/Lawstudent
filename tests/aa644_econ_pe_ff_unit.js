// AA_644 第 6 節（企劃線 27c0193e9）＋AA_643 第 11 節（6ab84d404）——不需要瀏覽器。
// ① 經濟系快轉第一次跨過體育課（pe_y0s1，週三 pm2）：attendBetween 自動算出席時記下，peAdd 在日期卡那一句後面加
//    「（體育課暖身跑了六圈。韋綸跑在最前面，回頭喊你們快一點。）」，只出一次；沒跨過體育課不加。
// ② 語彤交往中的畢業那天學期末的飯：18:30、地點「她家」（字幕「學期末的飯：陳語彤（她家）18:30」）。
// ③ 畢業後每月固定見面：語彤「一盞茶屋打烊以後」（key noodle 不改）。用法：node tests/aa644_econ_pe_ff_unit.js
// 2026-11-04 AA_688 第 2 節（企劃線 8dce2f94c，CANON-PURGE-SRC-1104）：方式改週六 17:30「一盞茶屋」（2029 年她下班以後、2030 年週末回去喝茶）＝③ 的地點字幕照新稿查（背景、key 不變）
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.document={getElementById:()=>null,addEventListener(){}}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|COURSES|CLS|CHARACTERS|ECONFF|POSTGRAD_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/courses.js','src/classes3d.js','src/data/postgrad_lines.js']) load(f);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const dayOf=k=>{ for(let d=-600; d<400; d++){ const t=CALENDAR.dateOf(d); if(t&&t.key===k) return d; } return null; };
global.STORY={dayOfKey:dayOf}; global.STORY_EVENTS=[]; global.EVENTS={running:null}; global.PHONE={pending:()=>[],tick(){},at:()=>true};
// CANON-NO-ECON-1112：經濟系那一年拿掉（① 經濟系快轉第一次跨過體育課（ECONFF.peAdd））
{ const g=POSTGRAD_LINES.TE.GF.heroine_03; check('② 語彤交往中畢業那天：18:30、她家（字幕「學期末的飯：陳語彤（她家）」）',g.h===18.5&&g.placeName==='她家'&&g.invite==='今天不排班。晚上來我家，我煮。',JSON.stringify(g));
  const h=POSTGRAD_LINES.TE.HEART.heroine_03; check('② 還沒交往（心意）那一格照舊一盞茶屋 17:30',h&&h.h===17.5&&h.placeName==='一盞茶屋',JSON.stringify(h)); }
{ const src=fs.readFileSync(path.join(ROOT,'src/pgdates3d.js'),'utf8'); check('③ 畢業後每月見面：語彤 noodle＝「一盞茶屋」（AA_688 第 2 節；原本 AA_643「一盞茶屋打烊以後」）、背景 wenzhou_teahouse（同 termend_lines tea_closed；key 不改）',/noodle:\{kind:'meet',place:'一盞茶屋',bg:'wenzhou_teahouse'/.test(src)&&!/麵店打烊以後'/.test(src)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

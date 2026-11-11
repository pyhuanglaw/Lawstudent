// 考試那天進教室、還沒坐下時的黑板（BUG-EXAM-BOARD-1021；BB 帳號 A 10-21 16:51，BB_218 最後一節：Y2S1、Y3S1 期末考那天進 201，黑板寫「憲法：基本權的限制」，坐下才換成考試）——不需要瀏覽器。
// 原因：story3d.js 進 classroom 時黑板照星期幾的固定表（週一＝憲法…），classes3d.js 開始上課才照當天那一堂寫。
// 檢查：1. 大二上期末考 2026-12-21（一）08:30 進 201：CLS.examBoard 給「行政法…：期末考／不可以翻書／鈴響請停筆」（和坐下開始考時 classes3d.js 寫的一樣）；
//       2. 考完（那一堂記 done）、或考試時間過了：沒有（照原本的表）；不是考試週：沒有；
//       3. 大三上期末考 2027-12-21（二）刑事訴訟法也一樣；4. story3d.js 進 classroom 的黑板先問 CLS.examBoard，沒有才用星期幾的表。
// 修改前：沒有 CLS.examBoard，第 1、3、4 項 FAIL。用法：node tests/exam_board_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/exam_bank.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const mk=(key,hour)=>{ const day=STORY.dayOfKey(key); return {v:3,day,hour,zone:'classroom',stage:'law',weekday:wdOf(day),flags:{LAW_START_DAY:STORY.LAW_D0,MAIN_D1:STORY.MAIN_D1_NEW},choices:{},events:{done:{},last:{},count:0},rel:{},stats:{classes:0},contacts:{}}; };
const has=typeof CLS.examBoard==='function', XB=(G,z)=>has?CLS.examBoard(G,z||'classroom'):undefined;
const nm=id=>(COURSES.list.find(c=>c.id===id)||{}).name;
{ const G=mk('2026-12-21',8.5), b=XB(G);
  check('1. 大二上期末考 2026-12-21（一）08:30 進 201：黑板「'+nm('admin_law')+'：期末考」「不可以翻書」「鈴響請停筆」（原本是星期一的「憲法：基本權的限制」）',JSON.stringify(b)===JSON.stringify([nm('admin_law')+'：期末考','不可以翻書','鈴響請停筆']),JSON.stringify(b));
  const it=has?CLS.dayItems(G).find(x=>x.exam&&x.room&&x.room.zone==='classroom'):null; if(it){ const R=CLS.rec(G); R.done[it.key]=1; }
  check('2. 考完了（那一堂記 done）：沒有考試的字（照原本的表）',has&&!!it&&XB(G)===null,JSON.stringify(XB(G)));
  check('2. 考試時間過了（13:00）：沒有',has&&XB(mk('2026-12-21',13))===null);
  check('2. 不是考試週（2026-12-07 週一）：沒有',has&&XB(mk('2026-12-07',8.5))===null);
  check('2. 別的教室（區域不是那一間）：沒有',has&&XB(mk('2026-12-21',8.5),'gongtong_101')===null); }
{ const b=XB(mk('2027-12-21',8.5));
  check('3. 大三上期末考 2027-12-21（二）：「'+nm('crimpro')+'：期末考」',JSON.stringify(b)===JSON.stringify([nm('crimpro')+'：期末考','不可以翻書','鈴響請停筆']),JSON.stringify(b)); }
{ const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), i=s.indexOf("if(zoneId==='classroom'&&E.zone.setBoard)"), j=s.indexOf('\n',i), line=s.slice(i,j);
  check('4. story3d.js 進 classroom 的黑板先問 CLS.examBoard，沒有才用星期幾的表',i>=0&&/CLS\.examBoard\(G,'classroom'\)/.test(line)&&/BOARD\[G\.weekday\]/.test(line)&&line.indexOf('CLS.examBoard')<line.indexOf('BOARD[G.weekday]')); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

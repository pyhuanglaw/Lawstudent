// 開學第一週的待辦（AA_110 第 6-4 節，AA 暫定）——不需要瀏覽器。
// 使用者 2026-10-13 試玩：「我第一週上課完完全沒事做一整週」——AA：真實的開學第一週很忙（買書、認識圖書館、找社團）；手機「今天」底下一張小清單，做完一項劃掉一項，
// 不做也不擋任何事，第 6 週自動收起來。檢查：第 3～5 週有、第 6 週和大一下沒有；教科書（舊路書房買或在法律學院圖書館看指定參考書）、總圖導覽、
// 法律資料怎麼查、服務學習報到各自做完就劃掉；「買六法」「逛社團博覽會」還沒列（等 AA：價錢、博覽會）。
// 用法：node tests/todo_opening_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const dayOfWeek=(term,w)=>{ for(let d=1;d<400;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===w) return d; } return null; };
const G={day:3,hour:10,flags:{},weekday:5};
check('有 CLS.todoItems／todoHTML',typeof CLS.todoItems==='function'&&typeof CLS.todoHTML==='function');
if(typeof CLS.todoItems!=='function'){ console.log('FAILED '+fails); process.exit(1); }
const its=CLS.todoItems(G);
check('第 3 週（遊戲第一天起）：四項待辦，都還沒做',its.length===4&&its.every(q=>!q.done),its.map(q=>q.key).join(','));
check('還沒列「買六法」「逛社團博覽會」（等 AA：價錢、博覽會）',!its.some(q=>/六法|博覽會/.test(q.text)));
let h=CLS.todayHTML(G);
check('手機「今天」有「開學待辦」、寫「不做也沒關係」',/開學待辦/.test(h)&&/不做也沒關係/.test(h));
G.flags.readReserve=true;
check('在法律學院圖書館看過指定參考書：教科書那一項劃掉',CLS.todoItems(G).find(q=>q.key==='textbook').done&&/line-through[^<]*>✓ 買民總/.test(CLS.todayHTML(G)));
ACTIVITIES.markAttended(G,ACTIVITIES.list.find(a=>a.id==='lib_tour_y1s1'));
check('去過總圖新生導覽：那一項劃掉',CLS.todoItems(G).find(q=>q.key==='libtour').done);
CLS.rec(G).attend.service_1=1;
check('服務學習報到過：那一項劃掉',CLS.todoItems(G).find(q=>q.key==='service').done);
G.day=dayOfWeek('Y1S1',5);
check('第 5 週還在（還有一項沒做）',CLS.todoItems(G).length===4&&/還有 1 項/.test(CLS.todayHTML(G)));
G.day=dayOfWeek('Y1S1',6);
check('第 6 週自動收起來',CLS.todoItems(G).length===0&&!/開學待辦/.test(CLS.todayHTML(G)));
G.day=dayOfWeek('Y1S2',3);
check('大一下沒有',CLS.todoItems(G).length===0);
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

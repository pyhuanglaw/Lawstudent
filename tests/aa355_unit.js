// AA_355（AA-C 2026-10-21）「程式裡等 AA 的五十二處」——不需要瀏覽器。
//   1. 1-4 校定假日其他學年：115～117 學年全校運動會停課（2026-11-20、2027-11-19、2028-11-17，週五）；校慶照常上課（2027-11-15 週一、2028-11-15 週三有課，不是假日）；114 學年照舊
//   2. 第 2、3 節：AA 看過照用的 8 處、過時的 36 處，註解不再寫「等 AA」（下一個接手的人不會以為還在等）；1-5 vac3d.js 的註解改成現況
//   （1-1 日本路線以安約的那一頓在 tests/jp_semester_unit.js 的 G7；1-3 三個物件的字在 tests/l118_shops_unit.js 第 9 項、tests/rooms_glb_unit.js 第 5 項、tests/linze_upper_unit.js）
// 修改前（開發分支 5c471a79）：5 項 FAIL 3——1 的三個運動會不是假日、2 的舊註解都還在（1 的校慶、114 學年兩項是保護舊行為，本來就過）。用法：node tests/aa355_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.document={getElementById:()=>null,addEventListener(){}}; global.location={search:''};
const NAMES=/^(CALENDAR|COURSES|CLS|PLACES|ACTIVITIES|SYLLABUS)$/;
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/data/syllabus.js','src/classes3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const D=k=>{ const [y,m,d]=k.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/86400000)+1; };
const items=k=>{ const day=D(k); const G={day,hour:8,weekday:CALENDAR.dateOf(day).wd%7,stage:'law',flags:{},clubs:{joined:[]},acts:{}}; return (CLS.dayItems(G,day)||[]).map(it=>it.c.id); };
// ===== 1. 1-4 校定假日 =====
{ const sp=['2026-11-20','2027-11-19','2028-11-17'].map(k=>[k,CALENDAR.dateOf(D(k)).wd,CALENDAR.holiday(D(k)),CALENDAR.kind(D(k)),items(k).length]);
  check('1. 115～117 學年全校運動會（週五）停課：2026-11-20、2027-11-19、2028-11-17 是「運動會（停課）」、沒有課', sp.every(([k,wd,h,kd,n])=>wd===5&&h==='運動會（停課）'&&kd==='holiday'&&n===0), JSON.stringify(sp));
  const an=['2027-11-15','2028-11-15'].map(k=>[k,CALENDAR.dateOf(D(k)).wd,CALENDAR.holiday(D(k)),items(k).length]);
  check('1. 校慶照常上課：2027-11-15（一）、2028-11-15（三）不是假日、照課表有課', an.every(([k,wd,h,n])=>h===null&&n>0)&&an[0][1]===1&&an[1][1]===3, JSON.stringify(an));
  check('1. 114 學年照舊：校慶 2025-11-15（六）、運動會 2025-11-21（五）停課', CALENDAR.holiday(D('2025-11-15'))==='校慶'&&CALENDAR.holiday(D('2025-11-21'))==='運動會（停課）'); }
// ===== 2. 註解 =====
{ const OLD=[['src/classes3d.js','「可跳過」的意思等 AA-B 確認'],['src/classes3d.js','「買六法」等 AA 定價錢'],['src/classes3d.js','等 AA_160 第 3 節的事件盤點表'],
    ['src/data/calendar.js','校定假日：等 AA 給清單'],['src/data/calendar.js','其他學年等 AA'],['src/data/characters.js','休學等 AA 確認'],['src/data/characters.js','其他個性等 AA、BB 寫'],
    ['src/data/events.js','LAWWW 加的場景說明（等 AA 看）'],['src/data/events.js','邀約的台詞等 AA（已問）'],['src/data/events.js','LAWWW 2026-10-14，等 AA 確認'],['src/data/events.js','跟媽媽說那段等 AA'],
    ['src/data/events.js','熟悉度上升沒有給數字（等 AA-B）'],['src/data/events.js','10/15 的聚會等 AA-B 給內容'],['src/data/events.js','邀約句等 AA-B'],['src/data/events.js','要不要提前到 10/17 以前等 AA'],
    ['src/data/events.js','「路過」版本等 AA-B 給字'],['src/data/events.js','照片說明等 AA-B'],['src/econff3d.js','另一張表（等 AA）'],['src/econff3d.js','等 AA 交 retake_home'],['src/game3d.js','內容等 AA、BB；目前是空的'],
    ['src/group3d.js','AA 沒有寫祐廷這時候回什麼'],['src/home3d.js','日期暫定（等 AA-B）'],['src/invites3d.js','每個人的個性等 AA、BB'],['src/invites3d.js','劇情內容等 AA、BB'],
    ['src/story3d.js','搬到大一下的版本等 AA_218'],['src/story3d.js','細節等 AA_195'],['src/story3d.js','旁白的新字等 AA_195'],['src/story3d.js','等 AA-B 定字'],['src/story3d.js','現任社長的歡迎一則等 AA'],
    ['src/story3d.js','要不要提前到 10/17 以前等 AA'],['src/story3d.js','是 LAWWW 寫的（等 AA）'],['src/story3d.js','之後每週的固定格等 AA-B'],['src/story3d.js','之後的學期等那一學年做'],['src/story3d.js','「被拱出來」的那一句等 AA'],
    ['src/story3d.js','ev_noodle_trip_spring_y1 等 AA 的旁白'],['src/story3d.js','那一段等 AA_182'],['src/story3d.js','新房號、窗外景等 AA-B'],['src/story3d.js','暫排 7/25，等 AA 給'],
    ['src/teach3d.js','內容等 AA、BB'],['src/termend3d.js','等 AA 給她約的那則'],['src/vac3d.js','這一版只開第一次'],['src/y34b3d.js','AA 沒有寫回覆的字'],['src/y34b3d.js','AA 沒有寫電話裡的話'],
    ['src/zones3d.js','貓的事件等 AA-B 的文字'],['src/zones3d.js','喝茶的文字等 AA-B']];
  const src={}; const left=OLD.filter(([f,t])=>(src[f]||(src[f]=fs.readFileSync(path.join(ROOT,f),'utf8'))).includes(t));
  check('2. AA_355 第 2、3 節、1-5：程式裡那幾處註解不再寫「等 AA」（照用的寫「AA_355 第 2 節」、過時的改成現況）', !left.length, left.map(x=>x.join(' ')).join('｜'));
  const all=Object.keys(src).concat(['src/y2b3d.js']).map(f=>[f,(fs.readFileSync(path.join(ROOT,f),'utf8').match(/等 ?AA|等那一學年做|AA 沒有寫/g)||[]).length]).filter(x=>x[1]);
  check('2. 這幾個檔裡已經沒有任何「等 AA」「等那一學年做」「AA 沒有寫」', !all.length, JSON.stringify(all)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

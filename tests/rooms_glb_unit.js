// 走得進去的教室（X78 的前置；LAWWW2-C 0a5cc70a：霖澤館 202、萬才館多功能教室、萬才館研討室 A）——不需要瀏覽器。
//   1. 三個區域都登記了（Z3.ZONES）、正式模型登記了（bldg.<id>）
//   2. 那棟樓的門接成出入口：霖澤館 202、萬才館 multi、seminarA 的門有 to、spawn，不再寫「整修中」（closed 拿掉）
//   3. 萬才館的門：有社課（吉他社在多功能教室、公法讀書會在研討室 A）或大四研討課的那幾間，按門的時候先看門口有沒有事——
//      社課可以參加的時間照舊在門口參加（classes3d.js roomDoor），沒事就走進去（不會因為門變成出入口就再也參加不了社課）
//   4. CLS.roomDoorBusy：吉他社週一 19:00 社課時間＝有事；同一天 15:00＝沒事
//   5. AA_355 1-3：白板點了有字（修改前 FAIL：沒有 Z3.roomGlbLook、只顯示「白板」）
//   5b. AA_355 5-1：書櫃、借用登記表、202 黑板、兩個公告欄點了有字（修改前 FAIL：只顯示名稱）
// 修改前：沒有這三個區域（第 1 項 FAIL）。用法：node tests/rooms_glb_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{},M:()=>({})}; global.THREE={Vector3:function(){}};
global.document={getElementById:()=>null,addEventListener(){}}; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
global.Z3={ZONES:{}}; global.ASSETS={manifest:{}};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|ACTIVITIES|LINZE_LAYOUT|WANCAI_LAYOUT|ROOM_GLB_LAYOUTS|CLS|COURSES|PLACES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/data/linze_layout.js','src/data/wancai_layout.js','src/data/room_glb_layouts.js','src/rooms_glb3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const IDS=['linze_202','wancai_multi','wancai_sema'];
check('1. 三個區域都登記了、正式模型登記了', IDS.every(id=>Z3.ZONES[id]&&ASSETS.manifest['bldg.'+id]&&/\.glb$/.test(ASSETS.manifest['bldg.'+id].url)), IDS.map(id=>id+':'+!!Z3.ZONES[id]).join(' '));
const door=(L,id)=>L.doors.find(d=>d.id===id);
const D202=door(LINZE_LAYOUT,'c202'), DM=door(WANCAI_LAYOUT,'multi'), DS=door(WANCAI_LAYOUT,'seminarA');
check('2. 霖澤館 202、萬才館多功能教室、研討室 A 的門接成出入口（to、spawn；不再寫整修中）', [[D202,'linze_202'],[DM,'wancai_multi'],[DS,'wancai_sema']].every(([d,id])=>d&&d.to===id&&d.spawn&&typeof d.spawn.x==='number'&&!d.closed), JSON.stringify([D202,DM,DS].map(d=>d&&{id:d.id,to:d.to,closed:d.closed||null})));
{ const src=fs.readFileSync(path.join(ROOT,'src/wancai3d.js'),'utf8');
  check('3. 萬才館的門有社課、研討課的：按門先問 CLS.roomDoorBusy（有事＝roomDoor 在門口參加，沒事＝走進去）', /if\(d\.to\)\{[^\n]*\n[^\n]*onInteract:\(\)=>\{ if\(CLS\.roomDoorBusy&&CLS\.roomDoorBusy\(GAME,'wancai',d\.id,o0\)\) void CLS\.roomDoor\(GAME,'wancai',d\.id,o0\); else void GAME\.enter\(d\.to/.test(src)); }
{ const guitar=ACTIVITIES.list.find(a=>a.id==='club_guitar'); let day=null; for(let d=1;d<200&&day==null;d++){ if(ACTIVITIES.on(guitar,d,{day:d,hour:19.2,flags:{},stage:'law'})) day=d; }
  const mk=h=>({G:{day,hour:h,weekday:CALENDAR.dateOf(day).wd%7,stage:'law',flags:{},clubs:{joined:['club_guitar']},acts:{}}});
  if(day==null) check('4. 找不到吉他社上課的日子（跳過）',true);
  else { const busy=CLS.roomDoorBusy(mk(19.1),'wancai','multi',{}), free=CLS.roomDoorBusy(mk(15),'wancai','multi',{});
    check('4. CLS.roomDoorBusy：吉他社社課時間（19:06）＝有事、同一天 15:00＝沒事', busy===true&&free===false, CALENDAR.dateOf(day).key+' '+busy+'/'+free); } }
{ const src=fs.readFileSync(path.join(ROOT,'src/building3d.js'),'utf8');
  check('2b. 霖澤館大廳的樓層簡介（看板、「看樓層簡介」）不再寫 202「整修中」（稽核 D X73：202 早就走得進去）',!/202 教室（整修中）/.test(src)&&/2F　201 階梯教室｜202 教室'/.test(src)); }
/* 5. AA_355 1-3（AA-C 2026-10-21）：白板（萬才館研討室 A、多功能教室）點了有字——沒有事件或課堂寫字的時候用這一句（現在沒有寫白板的事件，一律這一句）；202 的是黑板，用 5-1 那一句（5b）*/
{ const look=Z3.roomGlbLook, B='（白板上還留著上一堂課的字，擦了一半。）', it=(id,k)=>(ROOM_GLB_LAYOUTS[id].interact||[]).find(q=>q.id===k);
  check('5. AA_355 1-3 白板：「（白板上還留著上一堂課的字，擦了一半。）」（研討室 A、多功能教室）', typeof look==='function'&&look('wancai_sema',it('wancai_sema','board'))===B&&look('wancai_multi',it('wancai_multi','board'))===B, typeof look==='function'?[look('wancai_sema',it('wancai_sema','board')),look('wancai_multi',it('wancai_multi','board'))].join('／'):'沒有 Z3.roomGlbLook');
  /* 5b. AA_355 5-1（AA-C 2026-10-21 2f1aaa22）：還沒有字的物件——研討室 A 的書櫃、借用登記表；202 的黑板（沒有課堂寫字的時候用這一句，同 1-3 白板）、公告欄；多功能教室的公告欄（修改前 FAIL：只顯示名稱）*/
  const want=[['wancai_sema','books','（書櫃裡是歷屆的研究所論文，有些書背的字已經褪色了。）'],['wancai_sema','signup','（借用登記表夾在門邊。今天下午那一格，已經有人寫了名字。）'],
    ['linze_202','board','（黑板角落寫著「下週停課」，不知道是哪一堂的。）'],['linze_202','notice','（公告欄上貼著獎學金、徵才、讀書會的傳單，最上面那張一直被風吹起來。）'],['wancai_multi','notice','（公告欄上只剩一張場地借用規則，四個角都用膠帶補過。）']];
  const bad=typeof look==='function'?want.filter(([r,k,t])=>look(r,it(r,k))!==t):want;
  check('5b. AA_355 5-1：萬才館研討室 A 書櫃、借用登記表，霖澤館 202 黑板、公告欄，萬才館多功能教室公告欄點了有字', !bad.length, bad.map(([r,k])=>r+'/'+k+'='+(typeof look==='function'?look(r,it(r,k)):'')).join('｜')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

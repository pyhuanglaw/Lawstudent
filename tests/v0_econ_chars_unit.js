// V0-ECON-CHARS：經濟系三位的正式 3D 模型（LAWWW2-C 03179efb；BB-C 2026-10-17 驗收通過）接進遊戲——不需要瀏覽器。
//   1. 韋綸、家豪、唐睿（v20，60dc7908）、魏教授：ASSETS 有模型、檔案在、CHARACTERS 指到它；
//   2. 配件：魏教授戴自己的眼鏡（prop.glasses_wei）、韋綸後背包＋安全帽（prop.helmet_bike）；props3d 有 helmet；
//   3. 台詞的稱呼（'韋綸'、'家豪學長'、'唐睿'、'魏教授'）對到人物 id（立繪、人物）；立繪有 econ_weilun、econ_jiahao、econ_tangrui；
//   4. 經原的老師是 prof_wei：上課時在博雅 101（CLS.profWhere 帶 room）；下課後不去萬才館（office:false）；
//   6. 品妤（第六版 05c57da1）接進遊戲；配件：家豪左前臂的美食地圖筆記本（foodmap）、品妤右前臂的保溫瓶（thermos；計算機 calc 留給事件），掛前臂不是手（走路時手腕轉，東西不會變水平）；
//   5. 博雅 101 的講台位置：講桌靠黑板中間那一側、面向座位（teach3d.js 的 teacherSpots，用版面算一次）。
// 修改前：manifest 沒有 char.econ_weilun 等、CHARACTERS 沒有 econ_weilun、經原 prof:null（第 1、3、4 項失敗）。用法：node tests/v0_econ_chars_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|SYLLABUS|QBANK|QBANK_INCOMPLETE|EXAM_BANK|PORTRAIT_FILES|BOYA_LAYOUT)$/.test(n)?'global.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/legal_qbank.js','src/data/exam_bank.js','src/classes3d.js','src/data/portrait_manifest.js','src/data/boya_layout.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const asrc=fs.readFileSync(path.join(ROOT,'src/assets3d.js'),'utf8'), csrc=fs.readFileSync(path.join(ROOT,'src/character3d.js'),'utf8'), psrc=fs.readFileSync(path.join(ROOT,'src/props3d.js'),'utf8');
const urlOf=k=>{ const m=asrc.match(new RegExp("'"+k.replace('.','\\.')+"':\\s*\\{url:'([^']+)'")); return m&&m[1]; };
// 1
for(const [id,key] of [['econ_weilun','char.econ_weilun'],['econ_jiahao','char.econ_jiahao'],['econ_tangrui','char.econ_tangrui'],['prof_wei','char.prof_wei']]){ const u=urlOf(key), c=CHARACTERS[id];
  check('1. '+id+'：manifest '+key+'、檔案在、CHARACTERS.char3d.model',!!u&&fs.existsSync(path.join(ROOT,u))&&!!c&&c.char3d&&c.char3d.model===key,u); }
// 2
for(const k of ['prop.glasses_wei','prop.helmet_bike']){ const u=urlOf(k); check('2. '+k+' 的 GLB 在',!!u&&fs.existsSync(path.join(ROOT,u)),u); }
check('2. MODEL_PROPS：魏教授 glasses_wei、韋綸 backpack＋helmet',/'char\.prof_wei':\[\{name:'glasses',glb:'prop\.glasses_wei'\}\]/.test(csrc)&&/'char\.econ_weilun':\['backpack',\{name:'helmet'/.test(csrc));
check('2. props3d 有 helmet（upperChest）',/helmet:\{bone:'upperChest',make:helmet/.test(psrc));
// 6
{ const u=urlOf('char.econ_pinyu'), c=CHARACTERS.econ_pinyu; check('6. econ_pinyu：manifest char.econ_pinyu、檔案在、CHARACTERS.char3d.model',!!u&&fs.existsSync(path.join(ROOT,u))&&!!c&&c.char3d&&c.char3d.model==='char.econ_pinyu'&&c.char3d.height===1.58,u);
  for(const k of ['prop.notebook_foodmap','prop.thermos_black','prop.calc_engineering']){ const v=urlOf(k); check('6. '+k+' 的 GLB 在',!!v&&fs.existsSync(path.join(ROOT,v)),v); }
  check('6. MODEL_PROPS：家豪 foodmap、品妤平常只拿 thermos',/'char\.econ_jiahao':\['foodmap'\]/.test(csrc)&&/'char\.econ_pinyu':\['thermos'\]/.test(csrc));
  check('6. props3d：foodmap、calc 掛左前臂，thermos 掛右前臂（不是手）',/foodmap:\{bone:'leftLowerArm'/.test(psrc)&&/calc:\{bone:'leftLowerArm'/.test(psrc)&&/thermos:\{bone:'rightLowerArm'/.test(psrc));
  const lic=fs.readFileSync(path.join(ROOT,'LICENSES.md'),'utf8'); check('6. LICENSES 有品妤、筆記本、計算機和保溫瓶',['bl_econ_pinyu.vrm','notebook_foodmap.glb','thermos_black','calc_engineering'].every(x=>lic.includes(x))); }
// 3
const alias={}; for(const id in CHARACTERS) for(const a of (CHARACTERS[id].alias||[])) alias[a]=id;
check('3. 稱呼對到 id：韋綸、家豪學長、唐睿、魏教授',alias['韋綸']==='econ_weilun'&&alias['家豪學長']==='econ_jiahao'&&alias['唐睿']==='econ_tangrui'&&alias['魏教授']==='prof_wei',JSON.stringify([alias['韋綸'],alias['家豪學長'],alias['唐睿'],alias['魏教授']]));
check('3. 立繪：econ_weilun、econ_jiahao、econ_tangrui 的 campus/neutral',['econ_weilun','econ_jiahao','econ_tangrui'].every(id=>PORTRAIT_FILES[id]&&PORTRAIT_FILES[id].campus&&PORTRAIT_FILES[id].campus.includes('neutral')&&fs.existsSync(path.join(ROOT,'assets/portraits',id,'campus/neutral.webp'))));
check('3. 魏教授不用立繪（AA_145 §5）、講話的名字「魏老師」',CHARACTERS.prof_wei.portrait===null&&CLS.profName(COURSES.list.find(c=>c.id==='econ_principles_y0'))==='魏老師');
// 4
const mkG=(day,hour)=>({day,hour,stage:'econ',flags:{},weekday:CALENDAR.dateOf(day).wd%7,zone:'campus'});
let it=null; for(let d=-400;d<0&&!it;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y0S1'||t.week!==3) continue; it=CLS.dayItems(mkG(d,8),d).find(x=>x.c.id==='econ_principles_y0'&&!x.exam)||null; }
check('4. 經原（上）、（下）的老師是 prof_wei',COURSES.list.filter(c=>/^econ_principles_y0/.test(c.id)).every(c=>c.prof==='prof_wei'));
if(it){ const w=CLS.profWhere(mkG(it.day,it.t0+0.5),'prof_wei'); check('4. 第 3 週上課中：博雅 101',!!w&&w.zone==='boya'&&w.act==='class'&&w.room==='101',JSON.stringify(w));
  const w2=CLS.profWhere(mkG(it.day,it.t1+0.3),'prof_wei'); check('4. 下課後不去萬才館（office:false）',w2===null,JSON.stringify(w2));
  CHARACTERS.prof_wei.office=undefined; const w3=CLS.profWhere(mkG(it.day,it.t1+0.3),'prof_wei'); CHARACTERS.prof_wei.office=false; check('4. （對照：沒有 office:false 的教授照舊去萬才館）',!!w3&&w3.zone==='wancai',JSON.stringify(w3)); }
else check('4. 找到經原第 3 週',false);
// 5：照 teach3d.js 的算法
const tsrc=fs.readFileSync(path.join(ROOT,'src/teach3d.js'),'utf8');
check('5. teach3d.js 算 teacherSpots（講台在南邊的階梯教室）',/zone\.teacherSpots=\{\}/.test(tsrc)&&/r\.stage!=='S'/.test(tsrc));
const r=BOYA_LAYOUT.rooms.find(q=>q.id==='101'), lc=r.lectern, sx=r.board.x<lc.x?-1:1, sp={x:lc.x+sx*(lc.w/2+0.45),z:lc.z+0.2};
const seats=JSON.parse(typeof r.seats==='string'?r.seats:JSON.stringify(r.seats));
check('5. 博雅 101：講台在講桌靠黑板中間那一側、房間裡、在座位前面（z 比第一排大）',sp.x<lc.x&&sp.x>r.x0&&sp.x<r.x1&&sp.z<r.z1&&sp.z>Math.max(...seats.map(s=>s.z))&&Math.abs(sp.x-r.board.x)<Math.abs(lc.x-r.board.x),JSON.stringify(sp));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

// 2D 對話背景（src/outings3d.js S.BG）：寫了圖的檔案都在；BB-B 通過、放進 assets/bg 的四張（riverside、xiaofu、soc_hall、soc_classroom；企劃線 bg_approved/）有接上。
// 用法：node tests/bg_images_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8').replace(/^const OUT\s*=/m,'globalThis.OUT='),{filename:'outings3d.js'});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const B=OUT.BG||{}; const withImg=Object.entries(B).filter(([k,v])=>v.image);
check('1. 寫了圖的背景，檔案都在 repo 裡',withImg.length>0&&withImg.every(([k,v])=>fs.existsSync(path.join(ROOT,v.image))),withImg.filter(([k,v])=>!fs.existsSync(path.join(ROOT,v.image))).map(([k])=>k).join(' '));
check('2. riverside、xiaofu、soc_hall、soc_classroom、girls_dorm_gate、bowling 都有圖（BB-B 第 19、20、21 組）',['riverside','xiaofu','soc_hall','soc_classroom','girls_dorm_gate','bowling'].every(k=>B[k]&&B[k].image==='assets/bg/'+k+'.webp'),['riverside','xiaofu','soc_hall','soc_classroom','girls_dorm_gate','bowling'].map(k=>k+':'+(B[k]&&B[k].image)).join(' '));
{ const K=['econ_camp','econ_camp_room','gongguan_douhua','gongguan_hotpot','home_balcony','home_room','newyear_crowd','ferris_wheel'];
  check('2b. BB-B 第 22～27 組通過的背景都接上（宿營兩張、豆花、火鍋、陽台、房間、跨年、摩天輪；除夕客廳是 home_living_cny）',K.every(k=>B[k]&&B[k].image&&fs.existsSync(path.join(ROOT,B[k].image)))&&B.home_living_cny&&fs.existsSync(path.join(ROOT,B.home_living_cny.image)),K.filter(k=>!(B[k]&&B[k].image&&fs.existsSync(path.join(ROOT,B[k].image)))).join(' '));   /* 家裡的幾張 10-18 換成使用者生成的三房兩廳（BG-HOME-1018），檔名不同：只看檔案在 */
  check('2c. LAWWW2-B 的 BG-02 滷味攤（cee40151）、ART-11 政大校園夜晚（6e5a02b6）、ART-12 平常的客廳（1fc16c76）接上',B.gongguan_luwei.image==='assets/bg/gongguan_luwei.webp'&&B.nccu_campus.image==='assets/bg/nccu_campus.webp'&&fs.existsSync(path.join(ROOT,B.home_living.image))&&B.home_living.image!==B.home_living_cny.image);
  check('2e. LAWWW2-B ART-BG05 宿舍頂樓、ART-12 白天版客廳（2a0a7ff4）',B.dorm_roof.image==='assets/bg/dorm_roof.webp'&&fs.existsSync(path.join(ROOT,B.home_living_day.image)));
  check('2d. BB-B 第 31、32 組：soc_library、soc_office、classroom_small 接上',['soc_library','soc_office','classroom_small'].every(k=>B[k]&&B[k].image==='assets/bg/'+k+'.webp')); }
check('2f. 自由出行第一批四個景點的底圖（DL-06，LAWWW2-B）：d04_base_night、d06_base_day、d12_base_sunset、d13_base_sunset',['d04_base_night','d06_base_day','d12_base_sunset','d13_base_sunset'].every(k=>B[k]&&B[k].image==='assets/bg/'+k+'.webp'));
{ const noImg=Object.keys(B).find(k=>!B[k].image&&k!=='car')||'zzz_not_registered';   // nccu_dorm 10-17 有圖了（3d4d1969）：改挑一個登記了、還沒有圖的背景
  check('3. OUT.bg(id)：有圖＝{image:路徑}、沒有圖＝深色底（'+noImg+'）',OUT.bg('riverside').image==='assets/bg/riverside.webp'&&OUT.bg(noImg)==='dark'&&OUT.bg('nccu_dorm').image==='assets/bg/nccu_dorm.webp',JSON.stringify([OUT.bg('riverside'),OUT.bg(noImg),OUT.bg('nccu_dorm')])); }
{ const v=[]; for(const [h,w] of [[10,'clear'],[20,'clear'],[10,'rain']]){ global.GAME={G:{hour:h,weather:w}}; v.push(OUT.bg('car').image); } delete global.GAME;
  check('3. 車上（BG-08）：照天氣、時間挑——早上 car_morning、晚上 car_night、下雨 car_rain',v.join()==='assets/bg/car_morning.webp,assets/bg/car_night.webp,assets/bg/car_rain.webp',v.join()); }
// CG（adv3d.js 的 CG_REGISTRY）：每一張的檔案都在；BCG-04、BCG-11 接在 BB_117 寫的那一拍
{ const src=fs.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8'); const m=src.match(/const CG_REGISTRY=\{[\s\S]*?\};/); const reg=m?vm.runInThisContext('('+m[0].slice('const CG_REGISTRY='.length,-1)+')'):{};
  check('4. CG_REGISTRY 每一張的檔案都在',Object.keys(reg).length>0&&Object.values(reg).every(r=>fs.existsSync(path.join(ROOT,r.file))),Object.entries(reg).filter(([k,r])=>!fs.existsSync(path.join(ROOT,r.file))).map(([k])=>k).join(' '));
  const ev=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8');
  const z3=ev.indexOf("text:'熱可可。加一份濃縮。'"), c4=ev.indexOf("{cg:'cg_own_drink_heroine02'}"), q5=ev.indexOf("text:'（對著麥克風）這個 bug 我下次修。'"), c11=ev.indexOf("{cg:'cg_bug_fix_heroine04'}");
  { const e26=ev.slice(ev.indexOf("id:'ev_y0_e26'"),ev.indexOf("id:'ev_y0_e27'")); const a=e26.indexOf("text:'坐到最高的時候，台北看起來好小。'"), c=e26.indexOf("{cg:'cg_ferris_wheel_kexin'}"), b=e26.indexOf("text:'假設，我們從最高點開始交往。'");
    check('6. ART-BB-READY-1017：BCG-06 摩天輪在 E26「假設，我們從最高點開始交往」之前；BCG-16、CG-2 的位置（cg_peishan_decision、cg_plg_rules）有正式檔',!!reg.cg_ferris_wheel_kexin&&a>0&&c>a&&b>c&&!!reg.cg_peishan_decision&&!!reg.cg_plg_rules);
    check('6. 學姊 W7 研究室門口（prof_door）不再是黑底；BB 第 46～49 組六張背景都登記',B.prof_door&&B.prof_door.image==='assets/bg/linze_prof_hall.webp'&&['linze_prof_hall','graduation_avenue','linze_auditorium','cypress_trail','bus_night','country_road'].every(k=>B[k]&&B[k].image==='assets/bg/'+k+'.webp')); }
  check('5. BCG-04 在「熱可可。加一份濃縮。」之後、BCG-11 在「這個 bug 我下次修」之前（BB_117）',!!reg.cg_own_drink_heroine02&&!!reg.cg_bug_fix_heroine04&&z3>0&&c4>z3&&c4-z3<160&&c11>0&&q5>c11&&q5-c11<200); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

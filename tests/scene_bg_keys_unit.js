// 劇情台詞的 scene 行 bg:'…' 都要在 OUT.BG 有圖（src/outings3d.js）；查不到＝播的時候是深色底（events3d.js 的 OUT.bg 回 'dark'）。
//   LAWWW2-B 2026-10-24 路線巡查掃到 13 段黑底（docs/art-rebuild/second_ai/research/dark_bg_scenes_1024.md）；這支測試讓新加的 scene 鍵沒有圖時就失敗。
//   PENDING＝已知還沒有圖、在等美術的鍵（每個寫任務）；有圖或別名以後從這裡拿掉。dark／blur 等是特別值。不需要瀏覽器。用法：node tests/scene_bg_keys_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.document={getElementById:()=>null,addEventListener(){}}; global.location={search:''};
for(const f of ['src/data/calendar.js','src/outings3d.js']){ const s=fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|OUT)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const SPECIAL=new Set(['dark','blur','video','freeze']);
/* 不是 OUT.BG 的鍵（別的系統自己解讀）：jp3d 的房間；zq_testbuild3d 是測試建置 */
const OTHER_FILES=new Set(['jp3d.js','data/jp_blank_lines.js','zq_testbuild3d.js']);   /* vac_activities.js 也走 OUT.bg（vac3d.js 的 S.key），要查 */
const PENDING={   /* 鍵：任務（BG-DARK-SCENES-1024 第二批：LAWWW2 從 3D 拍；BB 向使用者要的另外寫）*/
  ntu_library_rain:'BG-DARK-SCENES-1024（BB 向使用者要）', community_room:'BG-DARK-SCENES-1024（BB 向使用者要）', us_club_lawn:'BG-DARK-SCENES-1024（BB 向使用者要）',
  botanical_lotus:'BB 要圖（AA_379）', vf_lantern:'BG-LANTERN-1024',
  court_hall:'BB 要圖（AA_498 4-3 曾靖雯的旁聽：臺北地方法院；稿寫「沒有＝深色底」，src/pool3d.js 執行時登記 OUT.BG.court_hall image:null）',
  /* AA_499～501 第 6／7／5 節「新的 2D 場景（沒有背景圖＝深色底）」：src/pool_more3d.js 執行時登記 image:null（NPC-STORY-1028）*/
  radio_room:'BB 要圖（AA_499 2-5 徐靜儀：廣播社的錄音間）', putong_empty:'BB 要圖（AA_499 3-3 詹立群：普通教學館的空教室）', welfare_room:'BB 要圖（AA_499 4-3 蘇承恩：社福中心的教室）',
  law_courtyard:'BB 要圖（AA_499 5-3 馬佳蓉：搬影印機，法學院前庭）', boya_201:'BB 要圖（AA_500 3-3 楊書豪：博雅 201 社內賽）', phil_cafe:'BB 要圖（AA_501 3-3 廖芸萱：文學院的教室，哲學咖啡館）',
  us_c_laundry:'BB 要圖（AA_512 13-6 美國 C 棟地下室的洗衣間；稿寫「沒有洗衣間場景就用 2D 背景」，src/sis_b13_3d.js 執行時登記 OUT.BG.us_c_laundry image:null）',
  /* AA_516 4-3、4-4（SIS-B14-1028）：稿寫 2D；沒有圖＝深色底＋地點字幕，src/sis_b14_3d.js 執行時登記 image:null */
  us_coat_shop:'BB 要圖（AA_516 4-3 美國：草原超市旁邊那家店，挑外套）', us_c_door:'BB 要圖（AA_516 4-4 美國：C 棟門口，下雨的晚上）',
  /* AA_520 4-2（NPC-STORY2-1028）：予樂那一場演講，霖澤館 201 的階梯教室（晚上，坐了一半）；src/yule3d.js 執行時登記 image:null */
  linze_201:'BB 要圖（AA_520 4-2 霖澤館 201：晚上的演講，階梯教室坐了一半）',
  /* AA_519 4-2（NPC-STORY2-1028）：稿寫 2D；沒有圖＝深色底＋地點字幕，src/sup519_3d.js 執行時登記 OUT.BG.psy_lab image:null */
  psy_lab:'BB 要圖（AA_519 4-2 黃筱涵：心理系的實驗室，一間很小的房間、一台螢幕、一個按鈕）',
  /* AA_523 1-4（SIS-B16-1028）：5/12 看她游泳，新體育館的游泳池（早上，看台只有你一個人）；src/sis_b16_3d.js 執行時登記 image:null */
  gym_pool:'BB 要圖（AA_523 1-4 新體育館的游泳池：早上七點，看台上只有你一個人，她在第四水道）' };
const keys=new Set(Object.keys(OUT.BG||{})), used={};
const walk=d=>fs.readdirSync(path.join(ROOT,d)).filter(x=>x.endsWith('.js')).map(x=>(d==='src'?'':'data/')+x);
for(const f of walk('src').concat(walk('src/data'))){ if(OTHER_FILES.has(f)) continue; const s=fs.readFileSync(path.join(ROOT,'src',f),'utf8'); for(const m of s.matchAll(/\bbg:'([a-z0-9_]+)'/g)) (used[m[1]]=used[m[1]]||new Set()).add(f); }
const miss=Object.keys(used).filter(k=>!keys.has(k)&&!SPECIAL.has(k));
const bad=miss.filter(k=>!PENDING[k]);
check('劇情 scene 的 bg 鍵都在 OUT.BG（等美術的寫在 PENDING）', !bad.length, bad.map(k=>k+'（'+[...used[k]].join('、')+'）').join('；'));
const done=Object.keys(PENDING).filter(k=>keys.has(k)||!used[k]);
check('PENDING 裡已經有圖（或沒有人用）的要拿掉', !done.length, done.join('、'));
check('ntu_library_night（sis_b10 總圖門口）＝library_gate_night 那張', !!OUT.BG.ntu_library_night&&OUT.BG.ntu_library_night.image===OUT.BG.library_gate_night.image);
for(const k of Object.keys(OUT.BG)){ const im=OUT.BG[k].image; if(im&&!fs.existsSync(path.join(ROOT,im))){ check('OUT.BG 的圖都在：'+k, false, im); } }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

// 劇情台詞的 scene 行 bg:'…' 都要在 OUT.BG 有圖（src/outings3d.js）；查不到＝播的時候是深色底（events3d.js 的 OUT.bg 回 'dark'）。
//   LAWWW2-B 2026-10-24 路線巡查掃到 13 段黑底（docs/art-rebuild/second_ai/research/dark_bg_scenes_1024.md）；這支測試讓新加的 scene 鍵沒有圖時就失敗。
//   PENDING＝已知還沒有圖、在等美術的鍵（每個寫任務）；有圖或別名以後從這裡拿掉。dark／blur 等是特別值。不需要瀏覽器。用法：node tests/scene_bg_keys_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.document={getElementById:()=>null,addEventListener(){}}; global.location={search:''};
for(const f of ['src/data/calendar.js','src/outings3d.js']){ const s=fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|OUT)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const SPECIAL=new Set(['dark','blur','video','freeze']);
/* 不是 OUT.BG 的鍵（別的系統自己解讀）：vac_activities.js 的 bg 是 3D 區域名；jp3d 的房間；zq_testbuild3d 是測試建置 */
const OTHER_FILES=new Set(['data/vac_activities.js','jp3d.js','data/jp_blank_lines.js','zq_testbuild3d.js']);
const PENDING={   /* 鍵：任務（BG-DARK-SCENES-1024：LAWWW2 從 3D 拍 2D 背景；BB 向使用者要的另外寫）*/
  cafe_window:'BG-DARK-SCENES-1024', cafe_closed:'BG-DARK-SCENES-1024', cafe_night:'BG-DARK-SCENES-1024', cafe:'BG-DARK-SCENES-1024',
  law_library:'BG-DARK-SCENES-1024', zuiyue_night:'BG-DARK-SCENES-1024', alley_conv_night:'BG-DARK-SCENES-1024', us_shared_kitchen:'BG-DARK-SCENES-1024',
  ntu_library_rain:'BG-DARK-SCENES-1024（BB 向使用者要）', community_room:'BG-DARK-SCENES-1024（BB 向使用者要）', us_club_lawn:'BG-DARK-SCENES-1024（BB 向使用者要）',
  botanical_lotus:'BB 要圖（AA_379）', vf_lantern:'BG-LANTERN-1024' };
const keys=new Set(Object.keys(OUT.BG||{})), used={};
const walk=d=>fs.readdirSync(path.join(ROOT,d)).filter(x=>x.endsWith('.js')).map(x=>(d==='src'?'':'data/')+x);
for(const f of walk('src').concat(walk('src/data'))){ if(OTHER_FILES.has(f)) continue; const s=fs.readFileSync(path.join(ROOT,'src',f),'utf8'); for(const m of s.matchAll(/\bbg:'([a-z0-9_]+)'/g)) (used[m[1]]=used[m[1]]||new Set()).add(f); }
const miss=Object.keys(used).filter(k=>!keys.has(k)&&!SPECIAL.has(k));
const bad=miss.filter(k=>!PENDING[k]);
check('劇情 scene 的 bg 鍵都在 OUT.BG（等美術的寫在 PENDING）', !bad.length, bad.map(k=>k+'（'+[...used[k]].join('、')+'）').join('；'));
const done=Object.keys(PENDING).filter(k=>keys.has(k)||!used[k]);
check('PENDING 裡已經有圖（或沒有人用）的要拿掉', !done.length, done.join('、'));
check('ntu_library_night（sis_b10 總圖門口）＝library_gate_night 那張', !!OUT.BG.ntu_library_night&&OUT.BG.ntu_library_night.image===OUT.BG.library_gate_night.image);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

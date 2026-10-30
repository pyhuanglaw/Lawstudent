// 深色底改用現成的圖（BG-DARK-70-1021；BB_220★ 的表，BB 帳號 A 10-21 18:3x 逐張看過）——不需要瀏覽器。
// 檢查：表上「①現成圖就能接」那幾列的事件，第一個場景（或指定的場景）用的是表上的背景代號，而且那個代號在 OUT.BG 有圖；
//       BB 說「維持深色」「等新圖」「不要接」的不動（颱風線上讀書會、峽谷、日本最後一晚的便利商店）；美國會所自習室、鳳凰城機場等 AA_370 合併後再接（這裡不檢查）。
// 修改前：除了已經有的（桌遊、8/13 在家看榜），其他每一項都 FAIL。用法：node tests/bg_dark70_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8').replace(/^const OUT\s*=/m,'globalThis.OUT='),{filename:'outings3d.js'});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const img=k=>!!(OUT.BG[k]&&OUT.BG[k].image&&fs.existsSync(path.join(ROOT,OUT.BG[k].image)));
/* 事件 id 之後 1500 字以內，dialogue 的第一個元素 */
const first=(f,id)=>{ const s=src(f), i=s.indexOf("id:'"+id+"'"); if(i<0) return null; const j=s.indexOf('dialogue:[',i); if(j<0||j-i>1500) return null; return s.slice(j+10,j+10+120).trim(); };
const ROWS=[
  ['經濟系 高雄・客運站附近的早餐店（ev_y0_kh_bus）','src/data/events.js',null,"{scene:'高雄・客運站附近的早餐店',bg:'soymilk_shop'}",'soymilk_shop'],
  ['經濟系 除夕的電話・在家（ev_y0_e21）＝年夜飯的客廳','src/data/events.js',null,"const lines=[ {scene:'臺北的家',bg:'home_living_cny'}",'home_living_cny'],
  ['經濟系 除夕的電話・在外面（ev_y0_e21o）＝「電話」場景（在外面＝phone_street_night）','src/data/events.js',null,"dialogue:[{scene:'電話'}].concat(lines.slice(1))",'phone_street_night'],
  ['寒暑假 高雄・左營站（ev_kexin_trip_winter_y4）','src/data/r2y4a_events.js','ev_kexin_trip_winter_y4',"{scene:'高雄・左營站',bg:'kh_station'}",'kh_station'],
  ['寒暑假 七夕・港邊的山上晚上那段（ev_kexin_qixi_y2，暫代）','src/data/r2y3a_events.js',null,"{scene:'高雄・港邊的山上',bg:'kh_river_night'}",'kh_river_night'],
  ...['ev_kx_nye_video_y2','ev_kx_nye_video_y3','ev_kx_nye_video_y4','ev_zr_nye_video_y3','ev_zr_nye_video_y4'].map(id=>['寒暑假 跨年的視訊（'+id+'）','src/data/events.js',id,"{scene:'視訊',bg:'video'}",'video']),
  ...['ev_yt_nye_call_y1','ev_yt_nye_call_y2','ev_yt_nye_call_y4'].map(id=>['寒暑假 跨年的電話（'+id+'）','src/data/events.js',id,"{scene:'電話'}",'phone_street_night']),
  ['其他 桃園機場入境大廳（ev_jp_return_hall）','src/data/jp_events.js',null,"const HALL=[ {scene:'桃園機場・入境大廳',bg:'airport_arrival'}",'airport_arrival'],
  ['其他 黃金週的河邊（ev_jp_goldenweek）','src/data/jp_events.js',null,"const RIVER=[ {scene:'河邊',bg:'jp_riverbank'}",'jp_riverbank'],
  ['其他 挽回第 4 步的河邊（ev_jp_repair_river）','src/data/jp_events.js',null,"const REPAIR4=[ {scene:'河邊',bg:'jp_riverbank'}",'jp_riverbank'],
  ['其他 七夕・宿舍門口（ev_jp_tanabata_repair）','src/data/jp_events.js',null,"const TANABATA_R=[ {scene:'宿舍門口',bg:'jp_dorm_gate'}",'jp_dorm_gate'],
  ['其他 行李箱的店（ev_jp_suitcase，公館街景暫代）','src/data/jp_events.js',null,"const SUITCASE=[ {scene:'公館',bg:'gongguan'}",'gongguan'],
  ['其他 推甄面試・萬才館二樓（ev_push_interview）','src/data/r2y4a_events.js',null,"{scene:'法律系館B二樓',bg:'wancai_seminar'}",'wancai_seminar'],
  ['其他 台南車站（ev_peishan_open_class）','src/data/r2y4b_events.js','ev_peishan_open_class',"{scene:'台南車站',bg:'tn_station'}",'tn_station'],
  ['其他 博思教學館（ev_kexin_lecture_ntu，大講堂暫代）','src/data/r2y3a_events.js','ev_kexin_lecture_ntu',"{scene:'博思教學館',bg:'linze_auditorium'}",'linze_auditorium'],
  ['其他 地方法院（ev_crimpro_court_visit，旁聽席暫代）','src/data/r2y3a_events.js','ev_crimpro_court_visit',"{scene:'地方法院',bg:'court_gallery'}",'court_gallery'],
  ['其他 學姊放榜的晚餐・沒有家庭晚餐那一版（ev_sis_results_dinner，公館街景暫代）','src/data/events.js',null,"SOCIAL.has('heroine_05','FAMILY_DINNER')},scene:'公館',bg:'gongguan'}",'gongguan']];
for(const [name,f,id,want,key] of ROWS){ const ok=id?(first(f,id)||'').startsWith(want):src(f).includes(want); check(name+'：'+key,ok&&img(key),id?first(f,id):''); }
check('已經有的：10/15 桌遊（ev_y0_gather）boardgame_gg、8/13 在家看榜（ev_y0_e36rh）home_room 放最前面',src('src/data/events.js').includes("{scene:'公館・桌遊店',bg:'boardgame_gg'}")&&src('src/data/events.js').includes("dialogue:[{scene:'臺北的家',bg:'home_room'}].concat(rlines)"));
check('BB 說維持深色／等新圖的不動：颱風天線上讀書會（ev_typhoon_y3_family）沒有加背景',!/id:'ev_typhoon_y3_family'[^\n]*dialogue:\[ \{scene:'[^']*',bg:'(?!dark)/.test(src('src/data/events.js')));
{ const A=src('src/adv3d.js'), cg=(k,f)=>A.includes(k+":{file:'"+f+"'")&&fs.existsSync(path.join(ROOT,f));
  check('CG-APPROVED-MISSING-1021（BB_220★）：尾聲「不選」的共通圖 cg_reunion_window_table、BCG-48 霧裡的大橋 cg_sf_bridge_fog_heroine05 都登記了、圖在（原本沒登記：不選的尾聲沒有圖、SF2 用 hasCG 包著一定跳過）',cg('cg_reunion_window_table','assets/cg/epilogue/cg_reunion_base.webp')&&cg('cg_sf_bridge_fog_heroine05','assets/cg/heroine_05/cg_sf_bridge_fog.webp')); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

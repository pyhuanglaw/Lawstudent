// 手機「地點」的全部地點分地區（QUICK-TRAVEL-AREAS-1105；使用者 2026-11-05 07:3x「手機可以快速前往的選項很亂 依照地區區分 點那個地區會出現那個地區的店面可以選 分類階層要整潔好區分」）——不需要瀏覽器。
//   1  每一個快速前往的地點（PLACES.quickList，載入各建築、新生南路的配置）都在剛好一個地區裡；地區照順序：首都帝大校園、公館、溫州街、新生南路、118 巷；地區名照 PLACES.names
//   2  第一層只有地區（每區一顆 data-parea 的按鈕，至少 44 px 高，寫「名字（幾個）」）；預設展開你所在的那一區、只開一區；收起來的區沒有任何地點列
//   3  展開的那一區：每個地點一列，和原本清單同一個樣子（data-place＝zone|名字、沒去過「還沒去過」沒有按鈕、關著「已閉館」、你在這裡沒有按鈕）
//   4  點地區：別的區＝換那一區、同一區再點＝全部收起來（''）；美國（不畫地圖的清單）＝不分區（回傳空字串，game3d.js 照舊平鋪）
//   5  game3d.js 有接：placesHTML 呼叫 PLACEMAP.listHTML、data-parea 點了用 PLACEMAP.toggleArea、打開手機重設成你所在的那一區、選圖釘也展開那一區
// 修改前（xsmap-1105 的上一個 commit）：沒有 PLACEMAP.listHTML（全部 FAIL）。用法：node tests/quick_travel_areas_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/linze_layout.js','src/data/library_layout.js','src/data/lawlib_layout.js','src/data/soclib_layout.js','src/data/gym_layout.js','src/data/aoki_layout.js','src/data/afar_layout.js','src/data/daybreak_layout.js','src/data/xinsheng_layout.js','src/data/places.js','src/placemap3d.js']) load(f);
const Q=PLACES.quickList(), J=JSON.stringify, PM=PLACEMAP;
const ok0=typeof PM.listHTML==='function'&&typeof PM.toggleArea==='function'&&typeof PM.areaOf==='function';
check('0. PLACEMAP 有 listHTML、toggleArea、areaOf',ok0);
if(ok0){
  // 1
  const noArea=Q.filter(pl=>!PM.GROUPS.includes(PM.areaOf(pl))).map(pl=>pl[1]);
  check('1. 每一個快速前往的地點都在某一個地區（'+Q.length+' 個）',!noArea.length,J(noArea));
  const st=pl=>({known:!/^xs_(dabu|haopai)$/.test(pl[0])&&pl[0]!=='cafe',open:pl[0]!=='xs_tongxian'&&pl[0]!=='lawlib',here:pl[0]==='xs_dakou',mins:20,bike:false});
  const html=(open,here)=>PM.listHTML(Q,st,open,here,z=>z==='xs_shanlan'?'今天 11:00–22:00':'');
  const all=html('',null), heads=[...all.matchAll(/data-parea="([a-z0-9_]+)"[^>]*><span>([^<]+)<\/span>/g)].map(m=>[m[1],m[2]]);
  check('1. 地區照順序：首都帝大校園、公館、溫州街、新生南路、118 巷（名字照 PLACES.names，後面是幾個地點）',J(heads.map(h=>h[0]))===J(['campus','gongguan','tingzhou','wenzhou','xinsheng','lane118'])   /* 汀州路：禮貌生財（區域 tz_limao）進了快速前往（SHOP-STANDARD-BACKFILL-1112）；這支測試沒載入汀州路配置，所以只有它一個 */&&heads.every(([id,t])=>t===PLACES.names[id]+'（'+Q.filter(pl=>PM.areaOf(pl)===id).length+'）'),J(heads));
  const cnt=heads.reduce((s,h)=>s+(+h[1].match(/（(\d+)）/)[1]),0); check('1. 各區的地點數加起來＝清單的地點數（每個地點只算一次）',cnt===Q.length,cnt+'/'+Q.length);
  check('1. 新生南路那一區：新生南路、山嵐書店、南洋戲院、大口漢堡、同弦樂器、大步球鞋、好拍運動、新生運動廣場；溫州街那一區沒有新生南路的店',J(Q.filter(pl=>PM.areaOf(pl)==='xinsheng').map(pl=>pl[0]).sort())===J(['xinsheng','xs_dabu','xs_dakou','xs_haopai','xs_nanyang','xs_shanlan','xs_tongxian','xs_xsports'])&&!Q.some(pl=>PM.areaOf(pl)==='wenzhou'&&/^xs_|xinsheng/.test(pl[0])));
  // 2
  check('2. 全部收起來（\'\'）：只有地區的按鈕、沒有任何地點列；每顆按鈕至少 44 px 高、寫 aria-expanded="false"',!/data-place=/.test(all)&&(all.match(/min-height:44px/g)||[]).length===6&&(all.match(/aria-expanded="false"/g)||[]).length===6);
  const hx=html(undefined,{zone:'xs_dakou',x:0,z:6.4});
  const opened=[...hx.matchAll(/data-parea="([a-z0-9_]+)" aria-expanded="true"/g)].map(m=>m[1]);
  check('2. 預設（undefined）：人在大口漢堡＝展開新生南路、只開這一區',J(opened)===J(['xinsheng']),J(opened));
  const hc=html(undefined,{zone:'campus',x:-38,z:6}), hl=html(undefined,{zone:'linze_3f'}), hn=html(undefined,{zone:'noodle'}), hw=html(undefined,{zone:'wz_mokuyobi'}), h1=html(undefined,{zone:'lane118'});
  const op=h=>(h.match(/data-parea="([a-z0-9_]+)" aria-expanded="true"/)||[])[1];
  check('2. 人在校園、法律系館A 3F、公館燒臘、木曜日、118 巷＝各自展開校園、校園、公館、溫州街、118 巷',J([hc,hl,hn,hw,h1].map(op))===J(['campus','campus','gongguan','wenzhou','lane118']),J([hc,hl,hn,hw,h1].map(op)));
  // 3
  const box=(h,id)=>{ const i=h.indexOf('data-parea-box="'+id+'"'); const j=h.indexOf('data-parea-box=',i+10); return h.slice(i,j<0?h.length:j); };
  const xs=box(hx,'xinsheng'), others=['campus','gongguan','wenzhou','lane118'].map(id=>box(hx,id));
  check('3. 展開的新生南路：新生南路、山嵐、南洋、大口、同弦、好拍…每個一列（item phrow）；收起來的四區沒有地點列',(xs.match(/class="item phrow"/g)||[]).length===8&&others.every(b=>!/phrow/.test(b)));
  check('3. data-place＝zone|名字（和原本清單同一個值）；營業時間跟著',xs.includes('data-place="xinsheng|新生南路"')&&xs.includes('data-place="xs_shanlan|山嵐書店"')&&xs.includes('今天 11:00–22:00'));
  check('3. 沒去過（大步球鞋、好拍運動）：寫「還沒去過」、沒有按鈕',/大步球鞋<div class="muted">還沒去過/.test(xs)&&!/data-place="xs_dabu/.test(xs)&&!/data-place="xs_haopai/.test(xs));
  check('3. 關著（同弦樂器）：按鈕寫「已閉館」；你在這裡（大口漢堡）：沒有按鈕',/data-place="xs_tongxian\|同弦樂器">已閉館</.test(xs)&&/大口漢堡<div class="muted">你在這裡/.test(xs)&&!/data-place="xs_dakou/.test(xs));
  const hw2=html('wenzhou',null); check('3. 溫州街展開：兩點半沒去過沒有按鈕、溫州街有「前往」',/data-place="wenzhou\|溫州街">前往</.test(hw2)&&!/data-place="cafe/.test(hw2));
  // 4
  const here={zone:'xs_dakou'};
  check('4. 點地區：預設（新生南路）點公館＝公館、點新生南路＝收起來；收起來以後點溫州街＝溫州街；開著溫州街再點＝收起來',PM.toggleArea(undefined,'gongguan',here)==='gongguan'&&PM.toggleArea(undefined,'xinsheng',here)===''&&PM.toggleArea('','wenzhou',here)==='wenzhou'&&PM.toggleArea('wenzhou','wenzhou',here)==='');
  check('4. 美國的地點清單：不分區（回傳空字串，照舊平鋪）',PM.listHTML([['us_apartment','公寓',null],['us_outside','社區',null]],st,undefined,{zone:'us_apartment'},()=>'')==='');
  // 5
  const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
  check('5. game3d.js：placesHTML 呼叫 PLACEMAP.listHTML（有分區就不再平鋪）、data-parea 用 PLACEMAP.toggleArea、打開手機重設 phoneArea、選圖釘展開那一區',/PLACEMAP\.listHTML\(PLACE_LIST\(\),placeState,phoneArea,/.test(g)&&/if\(lh\) return h\+lh;/.test(g)&&/\[data-parea\]'\)\.forEach\(b=>b\.onclick=\(\)=>\{[^\n]*phoneArea=PLACEMAP\.toggleArea\(phoneArea,b\.dataset\.parea/.test(g)&&/phonePerson=null; phoneArea=undefined;/.test(g)&&/if\(phonePin\) phoneArea=PLACEMAP\.areaOfPin\(/.test(g));
}
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);

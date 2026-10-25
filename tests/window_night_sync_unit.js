// 窗景和屋外同一刻天黑（LAWWW2-B 2026-10-24，路線巡查④：傍晚光線照季節以後的每天路線）——不需要瀏覽器。
//   引擎的夜晚係數 nk 在光線時刻 19.2 變成 1（星星出來、柏油調暗、屋外完全天黑）；但房間窗景、照片調色、118 巷店內窗景、總圖樓上的天光都寫死 19.4 才換夜景。
//   冬天傍晚光線拉長以後，這 0.2 小時變成將近 20 分鐘：12 月 17:35～17:58 屋外全黑，宿舍、教室、Café 的窗外還是調暗的白天照片。
//   1. 引擎的 nk：h≥T 時是 1（讀出 T）；
//   2. 這五個地方換夜景的時刻都 = T：world3d.js photoTint、zones3d.js room() 的 winC 和 nightView、l118_shops3d.js setPhotoView、library_upper3d.js skyTint；
//   3. 早上那一頭（< 5.5）不動。
//   v2（10-25，路線巡查⑤）：
//   4. 大樓大廳的窗景（B3.setOutView 等，h≥18.6 就換夜景：比日落還早，冬天比屋外天黑早約 40 分鐘）：霖澤館、宿舍大廳、法律學院圖書館、總圖大廳、教學館、萬才館、社科院 = T；
//   5. 美國公寓窗景、法圖天窗和彩色玻璃的色調表 VT（us3d.js）最後一列（完全夜晚）= T（原本 19.5，美國冬天晚了半小時）。
// 修改前 FAIL。用法：node tests/window_night_sync_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const eng=rd('src/engine3d.js'), m=eng.match(/const nk=h>=([0-9.]+)\|\|h<5\.6\?1:/);
check('1. 引擎的夜晚係數 nk 有「h ≥ T 就是 1」', !!m, m?'T='+m[1]:'');
const T=m?+m[1]:19.2;
const sites=[['src/world3d.js','photoTint',/function photoTint\(h,rain\)\{ h=\(\(h%24\)\+24\)%24; if\(h<5\.5\|\|h>=([0-9.]+)\) return 0xffffff;/],
  ['src/zones3d.js','room() 的 winC',/let winC, patchA=0, patchC=0xffd9a0; if\(h<5\.5\|\|h>=([0-9.]+)\)\{ winC=0x141c2c; \}/],
  ['src/zones3d.js','room() 的 nightView',/const nightView=\(h<5\.5\|\|h>=([0-9.]+)\);/],
  ['src/l118_shops3d.js','118 巷 setPhotoView',/function setPhotoView\(pv,h,weather\)\{ if\(!pv\) return; const night=\(h<5\.5\|\|h>=([0-9.]+)\),/],
  ['src/library_upper3d.js','總圖樓上 skyTint',/function skyTint\(h,rain\)\{ h=h%24; if\(h<5\.5\|\|h>=([0-9.]+)\) return/]];
for(const [f,nm,re] of sites){ const r=rd(f).match(re); check('2. '+nm+'（'+f+'）換夜景的時刻 = 屋外天黑（'+T+'）', !!r&&+r[1]===T, r?'h≥'+r[1]:'找不到'); }
check('3. 早上那一頭都還是 h<5.5', sites.every(([f,,re])=>{ const r=rd(f).match(re); return !!r&&r[0].includes('h<5.5'); }));
for(const f of ['building3d','dorm3d','lawlib3d','library3d','teach3d','wancai3d','soclib3d']){ const r=rd('src/'+f+'.js').match(/const night=\(h%24<6\|\|h%24>=([0-9.]+)\);/);
  check('4. '+f+'.js 大廳窗景換夜景的時刻 = 屋外天黑（'+T+'）', !!r&&+r[1]===T, r?'h≥'+r[1]:'找不到'); }
{ const r=rd('src/us3d.js').match(/const VT=\[(.*?)\];/), rows=r?[...r[1].matchAll(/\[([0-9.]+),\[/g)].map(q=>+q[1]):[];
  check('5. 美國窗景色調表 VT 最後一列（完全夜晚）= 屋外天黑（'+T+'）', rows.length>0&&rows[rows.length-1]===T, rows.join(' ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

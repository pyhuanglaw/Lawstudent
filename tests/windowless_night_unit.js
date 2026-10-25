// 沒有窗的室內晚上和白天一樣亮（LAWWW2-B 2026-10-25；LAWWW-B 10-25 00:10 同意做）——不需要瀏覽器。
//   原本 engine3d.js 的 applyTime 室內那一段照時刻切：18:00 以後 night（半球光 0.8～1.05、cool 的偏藍 0xe6ecfa、太陽光 0）、16:30～18:24 dusk（暖色）、
//   清晨 h<8 偏冷；室內的燈（onLamps、光暈）也照路燈的時刻開關。地下室、視聽室沒有窗、燈一直開著，晚上卻偏藍偏暗（B1 健身房 21:00）。
//   1. engine3d.js：區域 def.windowless 的室內，lamps 不切到夜間、night／dusk／清晨色調都不用（其他室內、戶外照舊）；
//   2. 標成 windowless 的區域：體育館 B1（gym_b1）、總圖 B1（library_b1）、GLB 房間裡窗數＝0 的（視聽室 library_media、美國法圖 2F us_lawlib_2f）；
//      有窗的房間（萬才研討室、霖澤 202、宿舍 205、臥室 C…）不是；
//   3. 室內那一段的行為：用 vm 執行抽出來的判斷——windowless 在 21:00、17:00、7:00 都和 14:00 一樣；一般室內 21:00 照舊是 night。
// 修改前 FAIL。用法：node tests/windowless_night_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const eng=rd('src/engine3d.js');
const nwLine=eng.match(/const nw=!!\(E\.indoor&&E\.zone&&E\.zone\.def&&E\.zone\.def\.windowless\);/);
check('1. engine3d.js 有 windowless 的判斷（E.indoor＋區域 def.windowless）', !!nwLine);
check('1. 燈：windowless 室內不切到夜間（lamps=!nw&&…）', /const lamps=!nw&&lerp\(A\[13\],B\[13\]\)>0\.5;/.test(eng));
const ind=eng.match(/if\(E\.indoor\)\{ const night=[^;]*; const dusk=[^;]*;[^\n]*?E\.hemi\.color\.set\([^;]*\);/);
check('1. 室內那一段：night、dusk 都看 nw', !!ind&&/night=!nw&&/.test(ind[0])&&/dusk=!nw&&/.test(ind[0]));
check('1. 室內那一段：清晨色調看 nw', !!ind&&/h<8&&!nw/.test(ind[0]));
// 2. 區域
check('2. 體育館 B1 是 windowless', /const gym_b1=\{ id:'gym_b1', name:'[^']*', indoor:true, windowless:true,/.test(rd('src/gym3d.js')));
check('2. 總圖 B1 是 windowless', /id:'library_b1', name:'[^']*', indoor:true, windowless:true,/.test(rd('src/library_b1_3d.js')));
const rg=rd('src/rooms_glb3d.js');
check('2. GLB 房間：窗數＝0 的是 windowless（windowless:!(WIN&&WIN.xs&&WIN.xs.length)）', /windowless:!\(WIN&&WIN\.xs&&WIN\.xs\.length\)/.test(rg));
{ const ctx={console}; vm.createContext(ctx); vm.runInContext(rd('src/data/room_glb_layouts.js')+';this.R=ROOM_GLB_LAYOUTS;',ctx);
  const nw=Object.entries(ctx.R).filter(([k,v])=>!(v.windows&&v.windows.xs&&v.windows.xs.length)).map(([k])=>k).sort();
  check('2. GLB 房間裡 windowless 的是視聽室、美國法圖 2F（其他房間都有窗）', JSON.stringify(nw)===JSON.stringify(['library_media','us_lawlib_2f']), nw.join('、')); }
// 3. 行為：把室內那一段的 night／dusk／清晨判斷抽出來跑
if(ind){ const nightE=ind[0].match(/const night=([^;]*);/)[1], duskE=ind[0].match(/const dusk=([^;]*);/)[1], colE=ind[0].match(/E\.hemi\.color\.set\(([^;]*)\);/)[1], intE=ind[0].match(/E\.hemi\.intensity=([^;]*);/)[1];
  const run=(h,nw,cool)=>vm.runInNewContext(`(()=>{ const night=${nightE}; const dusk=${duskE}; const warm=false; return {night,dusk,col:(${colE}),int:(${intE})}; })()`,{h,nw,cool,E:{zone:{warm:false,cool}}});
  const day=run(14,true,true);
  const same=[21,17,7,23.5,3].every(h=>JSON.stringify(run(h,true,true))===JSON.stringify(day));
  check('3. windowless 室內：21:00、17:00、7:00、23:30、3:00 和 14:00 一樣（半球光強度、顏色、不是 night／dusk）', same&&!day.night&&!day.dusk, 'int '+day.int+' col 0x'+day.col.toString(16));
  const n=run(21,false,true); check('3. 一般室內（有窗）21:00 照舊是 night', n.night===true&&n.int!==day.int, 'int '+n.int+' col 0x'+n.col.toString(16)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

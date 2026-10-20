// 霖澤館 3F 學生討論區、4F 自習討論區接進遊戲（LINZE-34F-TABLES-1020；LAWWW2-C 5566a0c5；使用者 2026-10-20
// 「霖澤3.4樓要有長條桌子附椅子像野餐椅子讓大家可以在那邊討論事情功課或者吃飯啊」「霖澤館3-8樓為什麼永遠都在蓋」）——不需要瀏覽器。
//   1. 2F 樓梯間的門打開、往 3F（linze_layout.js stairs3f：to、spawn）；不再寫「整修中」；
//   2. 霖澤館的電梯到 3F、4F＝換區域（zone、num、spawn，同總圖）；5F–8F 研究室按不亮、有說明；
//   3. 樓層簡介改字（building3d.js）；linze_upper3d.js 不再在執行時改 LINZE_LAYOUT（臨時接線拿掉）；
//   4. 3F、4F 的「搭電梯」：選 1F＝回霖澤館第 0 層電梯前；選研究室＝按不亮、再問一次；選現在這一層＝提示、再問一次；
//   5. 樓上的同學：上課日 3F 12:00 八位、15:00 四位、23:00 沒有人；4F 12:00 三位；週末減半；只坐長椅、窗邊（study）；同一天同一批、人數變了只多或少；
//   6. 進來時已經坐著；待在樓上時段變了：多的從樓梯間走進來坐下、少的 until＝現在（走到樓梯間才離開）；
//   7. story3d.js 進區域、待在區域裡都會叫 LZUP.populate；guide3d.js 的區域連結、電梯連結有 3F、4F；index.html 載入順序。
// 修改前（只有 LAWWW2 的臨時接線）1、2、3、4、5、6、7 FAIL。用法：node tests/linze_upper_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={M:()=>({})}; global.Z3={ZONES:{}}; global.ASSETS={manifest:{}};
global.CHAR={ build:()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0}}) };
global.STORY={ extraSpec:i=>({i}) };
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|LINZE_LAYOUT|LINZE_UPPER_LAYOUTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/linze_layout.js','src/data/linze_upper_layouts.js','src/linze_upper3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const L=LINZE_LAYOUT, src=n=>fs.readFileSync(path.join(ROOT,n),'utf8');
{ const d=L.doors.find(q=>q.id==='stairs3f');
  check('1. 2F 樓梯間的門往 3F（to＝linze_3f、spawn＝3F 樓梯間門口）、沒有 closed', !!d&&d.to==='linze_3f'&&!d.closed&&d.spawn&&d.spawn.x===LINZE_UPPER_LAYOUTS['3f'].stairs.spawn.x&&d.spawn.z===LINZE_UPPER_LAYOUTS['3f'].stairs.spawn.z, JSON.stringify(d)); }
{ const F=L.elevator.floors, f3=F.find(q=>q.zone==='linze_3f'), f4=F.find(q=>q.zone==='linze_4f'), r=F.find(q=>/5F/.test(q.label));
  check('2. 電梯 3F、4F 換區域（open、num 3／4、spawn 在電梯門口）', !!f3&&!!f4&&f3.open&&f4.open&&f3.num===3&&f4.num===4&&f3.spawn&&f4.spawn&&Math.abs(f3.spawn.x-4.6)<0.01, JSON.stringify([f3,f4]));
  check('2. 5F–8F 研究室按不亮、有說明；電梯沒有「整修中」', !!r&&!r.open&&/研究室/.test(r.toast||'')&&!F.some(q=>/整修/.test(q.label)), JSON.stringify(r)); }
{ const b=src('src/building3d.js'), u=src('src/linze_upper3d.js');
  check('3. 樓層簡介：3F 學生討論區、4F 自習討論區、5F–8F 研究室（互動的字、看板的字）', /樓層簡介：[^']*3F 學生討論區[^']*4F 自習討論區[^']*5F–8F 研究室/.test(b)&&/fillText\('3F 討論區｜4F 自習討論區｜5F–8F 研究室'/.test(b)&&!/3F–8F 研究室與教室（本學期整修中）/.test(b));
  check('3. linze_upper3d.js 不在執行時改 LINZE_LAYOUT（臨時接線拿掉）', !/LINZE_LAYOUT\.doors\.find|LINZE_LAYOUT\.elevator/.test(u)); }
const Z=k=>Z3.ZONES[k];
{ const qs=[].concat(LINZE_UPPER_LAYOUTS['3f'].interact.map(q=>[q,'3f']),LINZE_UPPER_LAYOUTS['4f'].interact.map(q=>[q,'4f'])).filter(([q])=>q.id!=='elevator'&&q.id!=='stairs'); const ts=typeof LZUP==='object'&&LZUP.lookText?qs.map(([q,f])=>LZUP.lookText(q,f)):[];
  check('3. 看東西的字照 AA_320 5-2（3F 微波爐「一次一個便當」、4F 白板「本題爭點在於」）', ts.some(t=>/一次一個便當，三分鐘以內/.test(t))&&ts.some(t=>/本題爭點在於/.test(t))&&ts.every(t=>/。/.test(t)), ts.join('／').slice(0,200));
  check('3. 微波爐、販賣機、公告欄、白板的字：沒有給開發組的話（「說明文字由 AA 寫」「LAWWW」）', ts.length===qs.length&&ts.every(t=>t&&!/AA 寫|LAWWW|LAWWW2/.test(t)), ts.join('／')); }
check('3. 區域 linze_3f、linze_4f 都有、LZUP 測試介面在', !!Z('linze_3f')&&!!Z('linze_4f')&&typeof LZUP==='object'&&typeof LZUP.ride==='function'&&typeof LZUP.populate==='function');
// 4. 3F、4F 的電梯
if(typeof LZUP==='object'&&LZUP.ride){ const run=async()=>{
    const mk=answers=>{ const log={enter:null,toasts:[],asked:0}; global.GAME={ sceneBegin(){}, sceneEnd(){}, caption(){}, toast(t){ log.toasts.push(t); }, choose:async()=>{ log.asked++; return answers.shift(); }, enter:async(z,sp)=>{ log.enter={z,sp}; } }; return log; };
    const fl=LINZE_UPPER_LAYOUTS['3f'].elevator.floors, i1=fl.findIndex(q=>q.zone==='linze'&&(q.lv|0)===0), iR=fl.findIndex(q=>!q.open), iH=fl.findIndex(q=>q.zone==='linze_3f'), i4=fl.findIndex(q=>q.zone==='linze_4f');
    let lg=mk([i1]); await LZUP.ride('3f',fl); check('4. 3F 搭電梯選 1F：回霖澤館第 0 層、站在電梯前', !!lg.enter&&lg.enter.z==='linze'&&lg.enter.sp.lv===0&&Math.abs(lg.enter.sp.x-4.6)<0.01&&Math.abs(lg.enter.sp.z+4.9)<0.01, JSON.stringify(lg.enter));
    lg=mk([iR,iH,i4]); await LZUP.ride('3f',fl); check('4. 選研究室＝按不亮的提示、選 3F＝「已經在這一層」，都再問一次；最後選 4F 換到 linze_4f', lg.asked===3&&lg.toasts.length===2&&/研究室/.test(lg.toasts[0])&&/這一層/.test(lg.toasts[1])&&lg.enter&&lg.enter.z==='linze_4f', JSON.stringify(lg));
    lg=mk([fl.length]); await LZUP.ride('3f',fl); check('4. 「不搭了」：不換區域', !lg.enter); };
  run().then(rest).catch(e=>{ console.log('FAIL 4. 例外 '+e.message); fails++; rest(); }); } else { check('4. LZUP.ride', false); rest(); }
function rest(){
  // 5. 人數
  const seats=LINZE_UPPER_LAYOUTS['3f'].seats.map(s=>Object.assign({x:s.x,z:s.z,yaw:s.yaw},s.kind==='study'?{study:true}:{})), seats4=LINZE_UPPER_LAYOUTS['4f'].seats.map(s=>Object.assign({x:s.x,z:s.z,yaw:s.yaw},s.kind==='study'?{study:true}:{}));
  let D=null; for(let d=10;d<60&&D==null;d++){ const wd=CALENDAR.dateOf(d).wd%7; if(CALENDAR.kind(d)==='term'&&wd>=1&&wd<=5) D=d; }
  let WE=null; for(let d=D;d<D+10&&WE==null;d++){ const wd=CALENDAR.dateOf(d).wd%7; if(wd===6) WE=d; }
  const W=(f,day,h,ss)=>LZUP.want?LZUP.want(f,{day,hour:h},ss):[];
  const a=W('3f',D,12,seats), b=W('3f',D,15,seats), c=W('3f',D,23,seats), e=W('4f',D,12,seats4), w=W('3f',WE,12,seats);
  check('5. 上課日 3F 12:00 八位、15:00 四位（是 12:00 的前四位）、23:00 沒有人；4F 12:00 三位；週末 3F 12:00 四位', a.length===8&&b.length===4&&b.every(i=>a.includes(i))&&c.length===0&&e.length===3&&w.length===4, JSON.stringify({a,b,c,e,w}));
  check('5. 只坐長椅、窗邊（study，不坐走廊的長椅）；同一天同一批', a.every(i=>seats[i].study)&&JSON.stringify(W('3f',D,12,seats))===JSON.stringify(a)&&JSON.stringify(W('3f',D+1,12,seats))!==JSON.stringify(a));
  // 6. 進來、待著
  let Gs={day:D,hour:12,zone:'linze_3f'}; const mkGM=()=>{ const E={zone:{seats},npcs:[],player:{seat:null,obj:{position:{x:0,z:0}}},addNPC(o){ const n=Object.assign({},o); E.npcs.push(n); return n; },moveTo(n,x,z,cb){ n.walkedFrom={x:n.obj.position.x,z:n.obj.position.z}; if(cb) cb(); return true; }};
    return {get G(){ return Gs; },E,sitAt(n,st){ n.seat=st; },seatApproach:st=>[st.x,st.z+0.6]}; };
  const GM=mkGM(); const k0=LZUP.populate(GM,true); const cur=()=>GM.E.npcs.filter(n=>n.lzSeat!=null&&!(n.until!=null&&n.until<=Gs.hour%24));
  check('6. 12:00 走進 3F：八位已經坐著（不從門口走）', k0===8&&cur().length===8&&GM.E.npcs.every(n=>!!n.seat&&!n.walkedFrom), 'k='+k0);
  Gs={day:D,hour:15,zone:'linze_3f'}; const k1=LZUP.populate(GM,false); const go=GM.E.npcs.filter(n=>n.until!=null);
  check('6. 待到 15:00：四位 until＝現在（要走），四位留著', k1===4&&go.length===4&&cur().length===4, 'k='+k1);
  const G2=mkGM(); Gs={day:D,hour:15,zone:'linze_3f'}; LZUP.populate(G2,true); Gs={day:D,hour:12,zone:'linze_3f'}; const k2=LZUP.populate(G2,false); const nw=G2.E.npcs.filter(n=>n.walkedFrom);
  const sp=LINZE_UPPER_LAYOUTS['3f'].stairs.spawn;
  check('6. 15:00 進來、待到 12:00（讀檔換時間的情境）：多的四位從樓梯間走進來坐下', k2===4&&nw.length===4&&nw.every(n=>n.walkedFrom.x===sp.x&&n.walkedFrom.z===sp.z&&!!n.seat), 'k='+k2);
  // 7. 接線
  const st=src('src/story3d.js'), gd=src('src/guide3d.js'), ix=src('index.html');
  check('7. story3d.js：進區域（populate）、待在區域裡（refreshSchedule）都叫 LZUP.populate', /linze_\[34\]f\$\/\.test\(zoneId\)&&typeof LZUP!=='undefined'\)\{ try\{ LZUP\.populate\(GM,true\)/.test(st)&&/LZUP\.populate\(GM,false\)/.test(st));
  check('7. guide3d.js：霖澤館 ⇄ 3F ⇄ 4F 的區域連結、電梯連結', /linze:\['campus','classroom','linze_3f'\]/.test(gd)&&/linze_3f:\['linze','linze_4f'\]/.test(gd)&&/ELEV=\{[^}]*linze:\['linze_3f','linze_4f'\]/.test(gd));
  const i1=ix.indexOf('src/building3d.js'), i2=ix.indexOf('src/data/linze_upper_layouts.js'), i3=ix.indexOf('src/linze_upper3d.js');
  check('7. index.html：layouts 在模組前面、都在 building3d.js 後面', i1>0&&i2>i1&&i3>i2);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); }

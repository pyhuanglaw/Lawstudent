// 人物開門（ANIM-DOOR-OPEN-1027／USER_WANTS A21；LAWWW2-C 2026-10-27）：src/door3d.js 判斷哪些出入口是門、推門的時間、手放下；game3d.js 接線；
// 第二階段（10-27）：門板真的轉開（找門板、往遠離玩家的方向、後面緊貼牆不轉、門上零件跟著轉、門後面空的放底卡、沒換成轉回來）、推門期間鎖住玩家（BB-C 10-27）。不需要瀏覽器（three.js 在 Node 跑）。
// 用法：node tests/door_open_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'lib/three.bundle.js'),'utf8'),{filename:'lib/three.bundle.js'});
const f=path.join(ROOT,'src/door3d.js'); if(fs.existsSync(f)) vm.runInThisContext(fs.readFileSync(f,'utf8').replace(/^const DOOR\s*=/m,'global.DOOR='),{filename:'src/door3d.js'});
check('① DOOR 存在（kind、open、close）',typeof DOOR!=='undefined'&&typeof DOOR.open==='function'&&typeof DOOR.kind==='function');
if(typeof DOOR==='undefined'){ console.log('FAILED '+fails); process.exit(1); }
/* 遊戲裡實際的出入口（grep 'label:…,exit:' 與幾個 getter 的字）：[標籤, 去哪, 從哪, 應該是] */
const CASES=[['進入阿鳳麵店','noodle','gongguan','none'],['進入舊路書房','bookstore','gongguan','push'],['進入兩點半 Café','cafe','wenzhou','push'],['進入萬才館（二樓）','wancai','campus','push'],
  ['離開咖啡廳','wenzhou','cafe','push'],['離開麵店','gongguan','noodle','none'],['離開教室','linze','classroom','push'],['離開總圖','campus','library_hall','auto'],['走出房間','dorm_hall','dorm','push'],
  ['走出霖澤館','campus','linze','push'],['離開宿舍','campus','dorm_hall','push'],['出門','us_outside','us_apartment','push'],['回公寓','us_apartment','us_outside','push'],['離開萬才館','campus','wancai','push'],
  ['進入便利商店','cvs','gongguan','auto'],['離開便利商店','gongguan','cvs','auto'],['過馬路（對面的亞洲超市）','us_asian_market','us_market','none'],
  ['往溫州街','wenzhou','gongguan','none'],['回到校園','campus','gongguan','none'],['回公館','gongguan','lane118','none'],['樓梯間：下樓（2F 自習區、1F 大廳）','library_hall','library','none'],
  ['上樓到 3F 主球場','gym_3f','gym','none'],['下樓到 B1（健身中心・游泳池）','gym_b1','gym','none'],['搭車離開（回台北）','campus','airport_arr','none'],['上 3F（考場）','x','y','none'],['走出去（大樓梯平台）','campus','wancai','push']];
/* BB-C 10-27（door_anim_probe 33 區出入口總表）＋LAWWW2-C 10-27 全部 67 區的總表：進出要一致；開放式、自動門照模型 */
const CASES2=[['進六張犁麵舖（麵店）','l118_noodle2','lane118','push'],['離開六張犁麵舖','lane118','l118_noodle2','push'],['進好家自助餐（自助餐）','l118_self','lane118','push'],['進巷口家常菜（家常菜）','l118_home','lane118','push'],
  ['進一一八茶飲（手搖飲）','l118_tea','lane118','push'],['進慢讀咖啡（咖啡）','l118_cafe2','lane118','push'],['進Pasta 118（義大利麵）','l118_pasta','lane118','push'],
  ['進去半熟','wz_brunch','wenzhou','push'],['進去巷子裡定食','wz_teishoku','wenzhou','push'],['進去林家乾麵','wz_lin','wenzhou','none'],['離開林家乾麵','wenzhou','wz_lin','none'],
  ['走出校門','gongguan','campus','none'],['進入總圖書館','library_hall','campus','auto'],['進入 多媒體中心','library_media','library_hall','push'],['研究小間','library_carrels','library_hall','push'],['回 2F 自習區','library_hall','library_carrels','push'],
  ['博雅教學館','boya','campus','push'],['體育館','gym','campus','push'],['法律學院圖書館','lawlib','wancai','push'],['進博雅教學館','boya','putong','none'],['走上空橋（往普通教學館）','putong','boya','none'],
  ['進入 洗衣間','dorm_laundry','dorm_hall','push'],['離開洗衣間','dorm_hall','dorm_laundry','push'],['敲門（205）','dorm_205','dorm_hall','none'],
  ['進圖書館','us_lawlib','us_campus','push'],['進草原超市','us_market','us_market_street','auto'],['出門（去超市）','us_market_street','us_outside','none']];
{ const bad=CASES.filter(([lb,to,from,want])=>(DOOR.kind({label:lb,exit:{to}},from)||'none')!==want).map(c=>c[0]+'→'+(DOOR.kind({label:c[0],exit:{to:c[1]}},c[2])||'none'));
  check('② 哪些出入口是門：進入／離開／走出／出門＝推門；便利商店＝自動門；開放式的麵店＝不是門；樓梯、電梯、往…的路、搭車、過馬路、回到校園＝不是門（'+CASES.length+' 個）',!bad.length,bad.join('、')); }
{ const bad=CASES2.filter(([lb,to,from,want])=>(DOOR.kind({label:lb,exit:{to}},from)||'none')!==want).map(c=>c[0]+'→'+(DOOR.kind({label:c[0],exit:{to:c[1]}},c[2])||'none'));
  check('② BB-C 10-27：118 巷「進〇〇」算門（九間店的模型都是鋁框玻璃門）、林家乾麵開放式、總圖正面自動門、走出校門不是門、字沒有動詞的建築入口照門、空橋不是門（'+CASES2.length+' 個）',!bad.length,bad.join('、')); }
check('② 校園建築入口本來就有的 door:true（布林）不當成門的種類：照字判斷（進入總圖書館＝自動門、進入霖澤館＝推門）',DOOR.kind({label:'進入總圖書館',exit:{to:'library_hall',door:true}},'campus')==='auto'&&DOOR.kind({label:'進入霖澤館',exit:{to:'linze',door:true}},'campus')==='push');
check('② exit.door 可以蓋過判斷（none／auto／push）',DOOR.kind({label:'進入舊路書房',exit:{to:'bookstore',door:'none'}},'gongguan')===null&&DOOR.kind({label:'往某處',exit:{to:'x',door:'push'}},'y')==='push'&&DOOR.kind({label:'進入阿鳳麵店',exit:{to:'noodle',door:'auto'}})==='auto');
check('② label 是 getter 也讀得到',DOOR.kind({get label(){ return '離開書店'; },exit:{to:'gongguan'}},'bookstore')==='push');
/* 推門：0.45 秒左右演完、手伸出去、轉向門；變黑以後手放下 */
(async()=>{
  const mk=(x,z,ry,riding)=>{ const o={position:{x,z},rotation:{y:ry},userData:{}}; return {G:{zone:'gongguan'},E:{player:{obj:o,riding:!!riding}}}; };
  { const GM=mk(0,0,Math.PI); const t0=Date.now(); const p=DOOR.open(GM,{x:0,z:2,label:'進入舊路書房',exit:{to:'bookstore'}}); const k=p&&await p; const dt=Date.now()-t0, u=GM.E.player.obj.userData;
    check('③ 推門：回傳 push、約 0.45 秒（0.35～0.8）演完才換區域',k==='push'&&dt>=350&&dt<=800,dt+' ms');
    check('③ 演完的時候手伸出去（疊加姿勢 k＝1、右上臂往前）',!!u.overlay&&u.overlay.door&&Math.abs(u.overlay.k-1)<1e-6&&u.overlay.bones.RightArm[1]>1);
    check('③ 轉向門（門在 +z：朝向 0）',Math.abs(Math.atan2(Math.sin(GM.E.player.obj.rotation.y),Math.cos(GM.E.player.obj.rotation.y)))<0.02,GM.E.player.obj.rotation.y.toFixed(3));
    await new Promise(r=>setTimeout(r,300)); const still=!!u.overlay; GM.E.zone={id:'noodle'}; await new Promise(r=>setTimeout(r,80));
    check('③ 還沒換區域的時候手還伸著；換到新區域（E.zone 換了）的下一格手放下（不用計時器：換區域會卡住主執行緒，計時器會晚）',still&&u.overlay===null); }
  { const GM=mk(0,0,0); GM.E.zone={id:'gongguan'}; const p=DOOR.open(GM,{x:0,z:2,label:'進入舊路書房',exit:{to:'bookstore'}}); await p; await new Promise(r=>setTimeout(r,4300));
    check('③ 沒有換成（出入口鎖著、讀取失敗）：4 秒後手也會放下',GM.E.player.obj.userData.overlay===null); }
  { const GM=mk(0,0,0); const p=DOOR.open(GM,{x:0,z:2,label:'進入便利商店',exit:{to:'cvs'}}); const k=p&&await p; check('④ 自動門：不伸手（沒有疊加姿勢）',k==='auto'&&!GM.E.player.obj.userData.overlay); }
  { const GM=mk(0,0,0); check('④ 不是門：馬上回傳 null（照舊換區域）',DOOR.open(GM,{x:0,z:2,label:'往溫州街',exit:{to:'wenzhou'}})===null); }
  { const GM=mk(0,0,0,true); check('④ 騎腳踏車：不演',DOOR.open(GM,{x:0,z:2,label:'進入舊路書房',exit:{to:'bookstore'}})===null); }
  { const GM=mk(0,0,0); GM.E.player.obj.userData.overlay={bones:{},k:1}; DOOR.close(GM); check('④ 手放下只清自己的（羽球短片的疊加姿勢不動）',!!GM.E.player.obj.userData.overlay); }
  /* ---- 第二階段：門板 ---- */
  const T=THREE, box=(name,w,h,d,x,y,z,par)=>{ const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial()); m.name=name; m.position.set(x,y,z); (par||root0).add(m); return m; };
  let root0=null;
  /* 一個房間：玩家在 (0,0,0)、門在 +z 2 m 的牆上（門板 0.9×2.1×0.05，牆在門洞兩邊）、門上有小窗和牌子、門旁邊牆上有門牌；behind＝門後面：'void' 空的、'wall' 8 cm 後面緊貼著牆、'far' 2 m 外有東西 */
  const room=(behind)=>{ root0=new T.Group(); const leaf=box('WALL_N_door',0.9,2.1,0.05,0,1.05,2); box('WALL_N_left',3,3,0.12,-2,1.5,2.04); box('WALL_N_right',3,3,0.12,2,1.5,2.04);
    const win=box('WALL_N_door_win',0.3,0.3,0.07,0.1,1.5,2), sign=box('door_sign_play',0.3,0.15,0.08,0,1.25,1.96), plate=box('room_plate',0.25,0.12,0.03,0.75,1.5,1.97), frame=box('WALL_N_doorframe',1.1,2.2,0.16,0,1.1,2);
    frame.visible=true; if(behind==='wall') box('WALL_behind',3,3,0.1,0,1.5,2.13); if(behind==='far') box('shelf',2,2,0.4,0,1,4);
    root0.updateMatrixWorld(true); return {root:root0,leaf,win,sign,plate}; };
  const mkP=(x,z)=>{ const o=new T.Object3D(); o.position.set(x,0,z); return {obj:o,busy:false,path:[1],target:{}}; };
  const wpos=m=>{ m.updateWorldMatrix(true,false); return new T.Vector3().setFromMatrixPosition(m.matrixWorld); };
  const IT={x:0,z:1.5,label:'離開教室',exit:{to:'linze'}};
  const P2=typeof DOOR.findLeaf==='function'&&typeof DOOR._swingSetup==='function'; check('⑥ 第二階段：DOOR.findLeaf、DOOR._swingSetup 存在',P2);
  if(P2){
  { const r=room('void'), E={zone:{group:r.root}}; const L=DOOR.findLeaf(E,IT);
    check('⑥ 找門板：出入口 2.6 m 內、名字有 door、大小像一片門板（門框、門上的小窗不算）',!!L&&L.o===r.leaf,L&&L.o.name);
    box('garage_door',3,2.5,0.05,0,1.25,1.8); root0.updateMatrixWorld(true); const L2=DOOR.findLeaf(E,IT); check('⑥ 太寬（3 m 的鐵捲門）不算門板',L2&&L2.o===r.leaf);
    check('⑥ 太遠（出入口 3 m 外）找不到',DOOR.findLeaf(E,{x:0,z:-1.5,exit:{to:'x'}})===null); }
  { const r=room('void'), E={zone:{group:r.root}}, P=mkP(0,0); const c0=wpos(r.leaf), w0=wpos(r.win), s0=wpos(r.sign), p0=wpos(r.plate);
    const sw=DOOR._swingSetup(E,IT,P); check('⑦ 門後面空的：門板會轉（有鉸鏈 pivot）',!!sw&&!!sw.piv&&r.leaf.parent===sw.piv);
    if(sw){ sw.piv.rotation.y=sw.ang; r.root.updateMatrixWorld(true); const c1=wpos(r.leaf), w1=wpos(r.win), s1=wpos(r.sign), p1=wpos(r.plate);
      check('⑦ 往遠離玩家的方向轉（推門：門板中心離玩家更遠）',c1.length()>c0.length()+0.2,c0.length().toFixed(2)+' → '+c1.length().toFixed(2));
      check('⑦ 轉 70°（1.22 rad）、鉸鏈在門板一邊（門板中心移動約 0.45 m×弦長）',Math.abs(Math.abs(sw.ang)-1.22)<1e-6&&Math.abs(c1.distanceTo(c0)-2*0.45*Math.sin(0.61))<0.03,c1.distanceTo(c0).toFixed(3));
      check('⑦ 門上的小窗、牌子跟著門板轉（10-27 截圖：浮在半空）',w1.distanceTo(w0)>0.2&&s1.distanceTo(s0)>0.2&&sw.riders.includes(r.win)&&sw.riders.includes(r.sign),'小窗 '+w1.distanceTo(w0).toFixed(2)+'、牌子 '+s1.distanceTo(s0).toFixed(2));
      check('⑦ 門旁邊牆上的門牌、門框、牆不動',p1.distanceTo(p0)<1e-6&&!sw.riders.some(m=>/frame|left|right/.test(m.name)));
      const card=r.root.getObjectByName('door_beyond_card'); check('⑦ 門後面空的：門洞後面放暗的底卡（正面朝玩家、在門板後面）',!!card&&card===sw.card&&wpos(card).z>2.2&&wpos(card).z<2.6,card&&wpos(card).z.toFixed(2)); } }
  /* 門上的零件併在別的網格裡（Blender 照材質合併）：一個網格裡有門上的小窗（在門板範圍裡）、門框的直條（比門板高）、遠處的椅子 */
  const merge=(...gs)=>{ const P=[], N=[], U=[], I=[]; let off=0; for(const q of gs){ const g=q.index?q:q; P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); U.push(...g.attributes.uv.array); for(let i=0;i<g.index.count;i++) I.push(g.index.getX(i)+off); off+=g.attributes.position.count; }
    const m=new T.BufferGeometry(); m.setAttribute('position',new T.Float32BufferAttribute(P,3)); m.setAttribute('normal',new T.Float32BufferAttribute(N,3)); m.setAttribute('uv',new T.Float32BufferAttribute(U,2)); m.setIndex(I); return m; };
  { const r=room('void'), E={zone:{group:r.root}}, P=mkP(0,0); const g0=merge(new T.BoxGeometry(0.25,0.25,0.06).translate(-0.15,1.55,2),new T.BoxGeometry(0.06,2.2,0.08).translate(0.47,1.1,2),new T.BoxGeometry(0.5,0.9,0.5).translate(2,0.45,0));
    const pm=new T.Mesh(g0,new T.MeshBasicMaterial()); pm.name='room_props'; r.root.add(pm); r.root.updateMatrixWorld(true); const tri0=g0.index.count/3;
    const sw=DOOR._swingSetup(E,IT,P); const part=sw&&sw.riders.find(m=>m.name==='room_props_doorpart');
    if(sw){ sw.piv.rotation.y=sw.ang; r.root.updateMatrixWorld(true); }
    const pb=part&&new T.Box3().setFromObject(part), keepTri=pm.geometry.index.count/3;
    check('⑦ 併在別的網格裡的門上小窗：切出來跟著門板轉（12 個三角形），門框直條、遠處的椅子留在原網格（24 個）',!!part&&part.geometry.index.count/3===12&&keepTri===24&&pb.min.z>2.05,part?('切出 '+part.geometry.index.count/3+'、留 '+keepTri+'、小窗 z '+pb.min.z.toFixed(2)):'沒切出來');
    check('⑦ 原本的幾何（可能是快取共用的）沒有被改：原網格換成新的幾何、頂點共用',g0.index.count/3===tri0&&pm.geometry!==g0&&pm.geometry.attributes.position===g0.attributes.position&&!!part&&part.material===pm.material); }
  { const r=room('wall'), E={zone:{group:r.root}}, P=mkP(0,0); const sw=DOOR._swingSetup(E,IT,P);
    check('⑧ 門板後面 8 cm 緊貼著牆（門貼在牆上、沒有門洞）：不轉、門上的零件不拆',sw===null&&r.leaf.parent===r.root&&r.win.parent===r.root); }
  { const r=room('far'), E={zone:{group:r.root}}, P=mkP(0,0); const sw=DOOR._swingSetup(E,IT,P);
    check('⑧ 門後面 2 m 外有東西（看得到隔壁）：轉、不放底卡',!!sw&&!sw.card&&!r.root.getObjectByName('door_beyond_card')); }
  { const r=room('void'), E={zone:{group:r.root}}, P=mkP(0,-0.1); P.obj.position.set(0,0,3.5); const sw=DOOR._swingSetup(E,{x:0,z:2.5,label:'進入',exit:{to:'x'}},P);
    if(sw){ sw.piv.rotation.y=sw.ang; r.root.updateMatrixWorld(true); }
    check('⑧ 從另一邊推：一樣往遠離玩家的方向轉',!!sw&&wpos(r.leaf).distanceTo(P.obj.position)>1.5+0.2,sw&&wpos(r.leaf).distanceTo(P.obj.position).toFixed(2)); }
  }
  /* 整個 open：推門期間鎖住玩家、連按兩下同一個 Promise、門板轉到底、沒換成 4 秒後轉回來拿掉底卡 */
  { const r=room('void'), P=mkP(0,0), GM={G:{zone:'linze_202'},E:{zone:{group:r.root,id:'a'},player:P}}; P.obj.rotation.y=0;
    const p1=DOOR.open(GM,IT); const busyIn=P.busy, pathIn=P.path; const p2=DOOR.open(GM,IT);
    check('⑨ 推門期間玩家鎖住（busy＝true：搖桿、點地走不動、互動鍵藏起來）、走到一半的路線清掉（BB-C 10-27）',busyIn===true&&pathIn===null);
    check('⑨ 連按兩下：第二次回傳同一個 Promise（不推兩次）',!!p1&&p1===p2);
    await p1; const busyAfter=P.busy; const pv=r.leaf.parent||new THREE.Group();
    check('⑨ 演完還原 busy（原本 false）',busyAfter===false);
    check('⑨ 演完門板轉到底（70°）',pv&&pv.name==='door_pivot'&&Math.abs(Math.abs(pv.rotation.y)-1.22)<0.02,pv&&pv.rotation.y.toFixed(3));
    const p3=DOOR.open(GM,IT); check('⑨ 演完以後再按：是新的一次（不是舊的 Promise）',!!p3&&p3!==p1); if(p3) await p3;
    check('⑨ 同一扇門再推一次（沒換成區域又按）：用同一個鉸鏈、不會一層套一層、門板還是開著',r.leaf.parent===pv&&pv.parent===r.root&&Math.abs(Math.abs(pv.rotation.y)-1.22)<0.02,pv.parent&&pv.parent.name);
    await new Promise(r=>setTimeout(r,4300));
    check('⑨ 沒換成（出入口鎖著、讀取失敗）：4 秒後門板轉回來、底卡拿掉',Math.abs(pv.rotation.y)<1e-6&&!r.root.getObjectByName('door_beyond_card'),pv.rotation.y.toFixed(3)); }
  { const P=mkP(0,0); P.busy=true; const GM={G:{zone:'gongguan'},E:{zone:{id:'g'},player:P}}; const p=DOOR.open(GM,{x:0,z:2,label:'進入舊路書房',exit:{to:'bookstore'}}); await p;
    check('⑨ 本來就 busy（劇情裡）：演完還是 busy（還原成原本的值）',P.busy===true); }
  { const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), ix=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), ch=fs.readFileSync(path.join(ROOT,'src/character3d.js'),'utf8');
    check('⑤ game3d.js：按出入口先 DOOR.open（演完）再 enter',/if\(it\.exit\)\{ if\(it\.exit\.locked\)\{[^}]*\} if\(typeof DOOR!=='undefined'\)\{ const dp=DOOR\.open\(GM,it\); if\(dp\) await dp; \} await enter\(it\.exit\.to,it\.exit\.spawn\);/.test(g));
    check('⑤ index.html 在 game3d.js 前面載入 src/door3d.js',ix.indexOf('src/door3d.js')>0&&ix.indexOf('src/door3d.js')<ix.indexOf('src/game3d.js'));
    check('⑤ character3d.js 有疊加姿勢的掛勾 u.overlay（羽球短片加的；開門靠它）',/if\(u\.overlay&&u\.overlay\.bones\)/.test(ch)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();

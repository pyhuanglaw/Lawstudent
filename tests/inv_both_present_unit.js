// 約好的事：兩個人都在場就直接開始（INV-BOTH-PRESENT-1021；使用者 10-21 23:2x：「有約好任何事情 改成只要兩個都在場 就不用一起走或說話才能開始」）——不需要瀏覽器。
// 起因（BUG-SIS-STUDY-COMPANION-1021，使用者 23:1x＋存檔 fatiao3d_save_day8_1.json）：和學姊在總圖讀完、當場再約「現在一起過去」總圖讀書＝變成她跟著走；
// 兩個人本來就在總圖，S.arrive 只在走進區域的時候看，讀書永遠開始不了；回宿舍她還跟著（存檔 iv6：now、兩小時後 cancelled）。另外第 6、7 天三個約記成沒赴約（要先找她說話才會開始）。
// 檢查：1. 約好的時間、你在約定的地方、她也在：INV.tick 就開始（不用說話）——有座位的地方兩個人一起坐下、演見面、state done；
//       2. 已經在那個地方、當面約「現在一起過去」：不變成跟著走，直接開始（兩個人坐下、演見面）；
//       3. 一起走過去的路上走進宿舍（dorm_hall、dorm）＝作罷、她不再跟著；回臺北的家也是；
//       4. 你不在約定的地方：不會開始；過了時間照舊記沒赴約；
//       5. 一起走到約定的地方（S.arrive）：直接開始、一起坐下（不再等你坐到她旁邊或跟她說話）；
//       6. 麵店（位子面對面、相距 1.6 m）：她坐著，你坐她對面（BB 10-22：原本只找 1.3 m 內，站在門口演完；修改前 FAIL）。
//       8. 在 3F 閱覽室（或大廳）當面約學姊「現在一起過去」總圖：直接開始，不念手機那句（BB 10-22 03:01；修改前 3F 那一項 FAIL）。
//       7. 一盞的緣側（並排、相距 1.8 m）：你坐她旁邊；2 m 外的隔壁桌、前後排、背對背不配對（BB 10-22 02:23；修改前第一項 FAIL）。
// 修改前：第 1、2、3、5 項 FAIL。用法：node tests/inv_both_present_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H;
const W=ms=>new Promise(r=>setTimeout(r,ms));
GM.sitAt=(ent,seat)=>{ ent.seat=seat; ent.pose='sit'; ent.idlePose='sit'; ent.frozen=true; if(ent.obj){ ent.obj.position.x=seat.x; ent.obj.position.z=seat.z; } };
GM.standUp=ent=>{ ent.seat=null; ent.pose='idle'; ent.idlePose='idle'; ent.frozen=false; };
GM.sleep=()=>Promise.resolve();
const fades=[]; GM.fade=v=>{ fades.push(v); return Promise.resolve(); };
const seats=()=>[{x:0,z:0,lv:0},{x:0.8,z:0,lv:0},{x:5,z:5,lv:0},{x:5.8,z:5,lv:0}];
const setup=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; E.zone={seats:seats(),roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.obj.position.x=1; E.player.obj.position.z=1; GM.npc={}; fades.length=0; return G; };
const npc=id=>{ const n={id,obj:{position:{x:3,z:3},rotation:{y:0}},beh:'idle',pose:'idle'}; GM.npc[id]=n; E.npcs.push(n); return n; };
(async()=>{
  /* 1 約好的時間、兩個人都在場 */
  { const G=setup('2025-09-12',18.9,'library_hall'); H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','library',G.day,19,{by:'player'}); const n=npc('heroine_05');
    INV.tick(GM); await W(30);
    check('1. 19:00 約在總圖、你在總圖大廳、她也在：不用說話就開始（state done）',iv.state==='done',JSON.stringify({st:iv.state}));
    check('1. 有座位的地方：兩個人一起坐下（她在相鄰的位子）、有淡出淡入；演完你站起來',!!n.seat&&fades.length>=2&&E.player.seat==null&&H.said.length>0,JSON.stringify({her:n.seat,fades,said:H.said.length})); }
  /* 2 已經在那個地方、當面約「現在一起過去」 */
  { const G=setup('2025-09-12',20.7,'library_hall'); H.FRIEND('heroine_05'); const n=npc('heroine_05'); n.seat={x:0,z:0,lv:0}; E.zone.seats[0]=n.seat;
    const d0=INV.decide; INV.decide=()=>({res:'accept'}); H.picks=['去總圖一起念書','現在一起過去'];
    let iv=null; try{ iv=await INV.flow(GM,'heroine_05',n,true); } finally { INV.decide=d0; }
    check('2. 已經在總圖、當場再約「現在一起過去」讀書：不變成跟著走，直接開始（state done、她坐著、你在她旁邊坐過）',!!iv&&iv.state==='done'&&n.beh!=='follow'&&!!n.seat&&!iv.now,JSON.stringify(iv&&{st:iv.state,now:iv.now,beh:n.beh})); }
  /* 3 一起走過去的路上回宿舍、回家 */
  { const G=setup('2025-09-12',15,'campus'); H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','cafe',G.day,15,{now:true,by:'player'}); const n=npc('heroine_05'); n.beh='follow';
    G.zone='dorm_hall'; await INV.arrive(GM,'dorm_hall');
    const e=INV.entryFor(G,'heroine_05');
    check('3. 一起走去 Café 的路上走進宿舍：作罷（cancelled）、她不再跟著（作息不再是 follow）',iv.state==='cancelled'&&n.beh!=='follow'&&!(e&&e.act==='follow'),JSON.stringify({st:iv.state,beh:n.beh,e})); }
  { const G=setup('2025-09-12',15,'campus'); H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','cafe',G.day,15,{now:true,by:'player'}); npc('heroine_05');
    const h0=typeof HOME!=='undefined'?HOME.at:null; if(typeof HOME!=='undefined') HOME.at=()=>true; try{ INV.tick(GM); } finally { if(typeof HOME!=='undefined') HOME.at=h0; }
    check('3. 一起走的時候回臺北的家：作罷',iv.state==='cancelled',iv.state); }
  /* 4 你不在約定的地方 */
  { const G=setup('2025-09-12',18.9,'campus'); H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','library',G.day,19,{by:'player'}); npc('heroine_05');
    INV.tick(GM); await W(30); const a=iv.state; H.at('2025-09-12',19.6); INV.tick(GM); await W(10);
    check('4. 你不在總圖：不會開始；過了時間照舊記沒赴約',a==='accepted'&&iv.state==='missed',JSON.stringify({a,b:iv.state})); }
  /* 5 一起走到約定的地方 */
  { const G=setup('2025-09-12',15,'campus'); H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','cafe',G.day,15,{now:true,by:'player'}); const n=npc('heroine_05'); n.beh='follow';
    G.zone='cafe'; H.at('2025-09-12',15.2); G.zone='cafe'; await INV.arrive(GM,'cafe');
    check('5. 一起走到 Café：直接開始、一起坐下（不再等你坐到她旁邊或跟她說話）',iv.state==='done'&&!!n.seat&&!iv.waitSeat,JSON.stringify({st:iv.state,seat:!!n.seat,ws:iv.waitSeat})); }
  /* 6 麵店（一張桌子兩個位子面對面、相距 1.6 m）：她坐著，你坐她對面（BB 10-22 01:3x：原本只找 1.3 m 內的空位，麵店永遠找不到，你站在門口演完）*/
  { const G=setup('2025-09-12',18.9,'noodle'); E.zone={seats:[{x:-3,z:-0.3,lv:0},{x:-3,z:1.3,lv:0},{x:0,z:-0.3,lv:0},{x:0,z:1.3,lv:0},{x:3,z:-0.3,lv:0},{x:3,z:1.3,lv:0}],roomAt:()=>null};
    H.FRIEND('zhe'); const iv=INV.accept(G,'zhe','noodle',G.day,19,{by:'player'}); const n=npc('zhe'); n.seat=E.zone.seats[5]; E.player.obj.position.x=0; E.player.obj.position.z=3.4;
    INV.tick(GM); await W(30);
    check('6. 麵店：阿哲坐在 (3,1.3)，你坐到他對面 (3,-0.3)、演見面、站起來',iv.state==='done'&&fades.length>=2&&Math.abs(E.player.obj.position.x-3)<0.01&&Math.abs(E.player.obj.position.z+0.3)<0.01&&E.player.seat==null,JSON.stringify({st:iv.state,p:[E.player.obj.position.x,E.player.obj.position.z],fades})); }
  /* 7 一盞的緣側（兩個坐墊並排、相距 1.8 m）：她坐著，你坐她旁邊（BB 10-22 02:23 座位量測：1.7 m 還是找不到）；隔壁桌、前後排、背對背的不算 */
  { const L=require('../src/data/wz_shops_layout.js').teahouse; const st=L.seats.filter(q=>!q.npcOnly&&!/打工/.test(q.label||'')).map(q=>Object.assign({x:q.x,z:q.z,yaw:q.yaw,lv:0,kind:'shop'},q.kind==='floor'?{floor:0.08}:{}));
    const G=setup('2025-09-12',14.9,'wz_teahouse'); E.zone={seats:st,roomAt:()=>null}; H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','teahouse',G.day,15,{by:'player'});
    const n=npc('heroine_05'); n.seat=st.find(q=>q.x===2.4&&q.z===5.55); for(const q of st) if(q!==n.seat&&!(q.x===0.6&&q.z===5.55)) q.taken=true;   /* 其他位子都有人：只剩緣側另一個坐墊 */
    E.player.obj.position.x=0; E.player.obj.position.z=-1; INV.tick(GM); await W(30);
    check('7. 一盞：學姊坐在緣側 (2.4,5.55)，你坐到旁邊那個坐墊 (0.6,5.55)、演見面',iv.state==='done'&&Math.abs(E.player.obj.position.x-0.6)<0.01&&Math.abs(E.player.obj.position.z-5.55)<0.01,JSON.stringify({st:iv.state,p:[E.player.obj.position.x,E.player.obj.position.z]})); }
  { const G=setup('2025-09-12',14.9,'cafe'); const n=npc('heroine_05'); const her={x:0,z:0,yaw:0,lv:0};
    for(const [lab,q] of [['隔壁桌（2 m、朝向垂直）',{x:2,z:0,yaw:Math.PI/2,lv:0}],['前後排（朝同一邊、在她後面 2 m）',{x:0,z:-2,yaw:0,lv:0}],['背對背（2 m）',{x:0,z:-2,yaw:Math.PI,lv:0}]]){
      E.zone={seats:[her,q],roomAt:()=>null}; n.seat=her; const pr=INV.pairSeats(GM,n,'cafe');
      check('7. 2 m 外的'+lab+'：不算她旁邊（不配對）',pr===null,JSON.stringify(pr)); }
    E.zone={seats:[her,{x:0,z:1.9,yaw:Math.PI,lv:0}],roomAt:()=>null}; n.seat=her; const pr=INV.pairSeats(GM,n,'cafe');
    check('7. 隔著桌子面對面（1.9 m）：配對',!!pr&&pr.me.z===1.9,JSON.stringify(pr)); }
  /* 8 在 3F 閱覽室當面約學姊「去總圖一起念書」「現在一起過去」（平日白天她本來就在總圖）：直接開始，不念手機那句（BB 10-22 03:01）*/
  for(const zone of ['library','library_hall']){ const G=setup('2025-09-24',10,zone); H.FRIEND('heroine_05'); const n=npc('heroine_05'); n.seat={x:0,z:0,lv:0}; E.zone.seats[0]=n.seat;
    H.picks=['去總圖一起念書','現在一起過去']; let iv=null; iv=await INV.flow(GM,'heroine_05',n,true);
    check('8. '+(zone==='library'?'3F 閱覽室':'總圖大廳')+'（9/24 週三 10:00）當面約學姊「去總圖一起念書」「現在一起過去」：直接開始（done、她不跟著走），沒有「我就在總圖。三樓。不要講話，傳訊息。」',!!iv&&iv.state==='done'&&n.beh!=='follow'&&!H.said.some(x=>/傳訊息/.test(x.t)),JSON.stringify({st:iv&&iv.state,beh:n.beh,said:H.said.map(x=>x.t).slice(0,4)})); }
  H.done(); })().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });

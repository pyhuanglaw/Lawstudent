// 點椅面坐得到（BB 11-11 CC TAPSEAT：五湖四海 #9 (0.5,−0.9)，俯角淺時點椅面，射線打到地板的那一點在椅子後面 1.3 m，按鈕變「點餐」；只有點椅腳落地那一點坐得到）。
// src/game3d.js tapToSeat：地板那一點沒對到椅子時，沿同一條射線看離地 0.3～0.75 m 那一段有沒有穿過哪張椅子（0.32 m 內）；src/engine3d.js 把射線傳進來、tapPref 用椅子的位置。
// 2026-11-11 TAP-RAY-SEAT-1111（LAWWW2）改成「畫面上那一點實際打到椅子」：射線第一個打到的東西（engine3d.js E.rayFirstHit）比地板那一點近、落在某張椅子的範圍裡才算——
//   這支的椅子沒有模型：E.rayFirstHit 用簡單的椅面＋椅背盒子代替（下面 chairHit）；真正的模型（總圖、宿舍、Café、118 巷）在 tests/tap_seat_ray_real_1111_unit.js。
//   1、6 的期望不變（點椅面導去那張、點後排椅背導去後排）；呼叫多傳 hit（地板那一點，engine3d.js 現在傳的）；5、7 跟著 engine3d.js 改（見各項）。
//  1 從斜上方（俯角約 25°）點椅面：地板落點在椅子後面 1 m 以上、站得住 → 還是導去那張椅子的走近點，回傳的椅子＝那一張
//  2 點走道的地板（射線在 0.3～0.75 m 那一段離每張椅子都遠）→ 照舊走過去（null）
//  3 地板那一點本來就在椅子上（站不住）→ 照舊導去那張椅子（舊行為不變）
//  4 射線往上（從下面看上去）、沒有傳射線 → 不判椅子高度（舊行為）
//  5 engine3d.js：tapRedirect 傳 {ray, fy}、tapPref 用 r[3]
// 修改前（開發分支 181b18879）：1 FAIL。用法：node tests/tap_seat_ray_1111_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; }; const J=JSON.stringify;
const G3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), m=/  function tapToSeat\(x,z,lv(?:,o)?\)\{[\s\S]*?\n  GM\.TAP_CHAIR=TAP_CHAIR; GM\.rayHitsBox=rayHitsBox;\n/.exec(G3);   /* TAP-RAY-SEAT-1111：連同 TAP_CHAIR、rayHitsBox 一起拿（原本只拿到 if(!best) return null 那一行）*/
check('0. game3d.js 有 tapToSeat',!!m); if(!m){ console.log('FAILED'); process.exit(1); }
const SEATS=[{x:0.5,z:-0.9,yaw:0,lv:0},{x:1.1,z:-0.9,yaw:0,lv:0},{x:0.5,z:0.4,yaw:Math.PI,lv:0}];
/* 椅子的模型（TAP-RAY-SEAT-1111）：椅面 0.4×0.4、離地 0.42～0.47；椅背在後面（yaw 0＝面向 +z，椅背在 −z 那一邊）0.03 厚、到 0.9 m。射線打盒子（slab 法），回傳最近的 {point,distance} */
const boxHit=(R,b)=>{ const o=R.origin, d=R.direction; let t0=0, t1=1e9; for(const [oa,da,lo,hi] of [[o.x,d.x,b[0],b[3]],[o.y,d.y,b[1],b[4]],[o.z,d.z,b[2],b[5]]]){ if(Math.abs(da)<1e-9){ if(oa<lo||oa>hi) return null; continue; } let ta=(lo-oa)/da, tb=(hi-oa)/da; if(ta>tb){ const t=ta; ta=tb; tb=t; } if(ta>t0) t0=ta; if(tb<t1) t1=tb; if(t0>t1) return null; } return t0; };
const chairBoxes=ss=>ss.flatMap(s=>{ const bz=Math.cos(s.yaw||0)>0?-1:1; return [[s.x-0.2,0.42,s.z-0.2,s.x+0.2,0.47,s.z+0.2],[s.x-0.2,0.47,Math.min(s.z+bz*0.2,s.z+bz*0.17),s.x+0.2,0.9,Math.max(s.z+bz*0.2,s.z+bz*0.17)]]; });
const chairHit=ss=>(R,far)=>{ let best=null; for(const b of chairBoxes(ss)){ const t=boxHit(R,b); if(t!=null&&t<far&&(!best||t<best.distance)) best={distance:t,point:{x:R.origin.x+R.direction.x*t,y:R.origin.y+R.direction.y*t,z:R.origin.z+R.direction.z*t}}; } return best; };
const E={interactables:SEATS.map(s=>({seat:s,x:s.x,z:s.z})).concat([{x:0.65,z:-1.65,label:'點餐'}]),canStand:(x,z)=>!SEATS.some(s=>Math.hypot(s.x-x,s.z-z)<0.25),rayFirstHit:chairHit(SEATS)};
const seatApproach=st=>[st.x,st.z-0.6];
const mk=(E_,sa)=>new Function('E','seatApproach','GM',m[0]+'\nreturn tapToSeat;')(E_,sa,{});
const tapToSeat=mk(E,seatApproach);
const V=(x,y,z)=>({x,y,z}); const norm=v=>{ const l=Math.hypot(v.x,v.y,v.z); return V(v.x/l,v.y/l,v.z/l); };
const rayTo=(cam,tgt)=>({origin:cam,direction:norm(V(tgt.x-cam.x,tgt.y-cam.y,tgt.z-cam.z))});
const floorOf=R=>{ const t=-R.origin.y/R.direction.y; return [R.origin.x+R.direction.x*t,R.origin.z+R.direction.z*t]; };
// 鏡頭在椅子南邊（+z）、高 1.9 m、水平距離 4 m（俯角約 25°），點椅面（離地 0.45 m）
const H=(x,z)=>({x,y:0,z});   /* 地板那一點（engine3d.js 傳的 hit）*/
{ const cam=V(0.5,1.9,3.1), R=rayTo(cam,V(0.5,0.45,-0.9)), [fx,fz]=floorOf(R), r=tapToSeat(fx,fz,0,{ray:R,fy:0,hit:H(fx,fz)});   /* 原本 {ray,fy,useRay:true}（射線高度判）；TAP-RAY-SEAT-1111：傳地板那一點，打椅子的模型 */
  check('1. 俯角淺、點椅面：地板落點在椅子後面 '+(-0.9-fz).toFixed(2)+' m（站得住）→ 導去那張椅子的走近點、回傳那張椅子',(-0.9-fz)>1&&E.canStand(fx,fz)&&!!r&&r[0]===0.5&&Math.abs(r[1]-(-1.5))<1e-9&&r[3]&&r[3].x===0.5&&r[3].z===-0.9,J({fz:+fz.toFixed(2),r}));
  const R2=rayTo(cam,V(1.1,0.6,-1.08)), [gx,gz]=floorOf(R2), r2=tapToSeat(gx,gz,0,{ray:R2,fy:0,hit:H(gx,gz)});   /* 椅背中段：原本瞄 (1.1,0.6,−0.9)＝椅子中心的半空（舊做法看射線經過的高度）；現在要打到東西，瞄椅背那一片 z −1.08 */
  check('1. 點隔壁那張（1.1,−0.9）的椅背中段：導去那一張，不是 0.5 那張',!!r2&&r2[3]&&r2[3].x===1.1,J(r2)); }
{ const cam=V(3,1.9,3.1), R=rayTo(cam,V(3,0,-1.5)), [fx,fz]=floorOf(R), r=tapToSeat(fx,fz,0,{ray:R,fy:0,hit:H(fx,fz)});
  check('2. 點走道的地板（x 3，離椅子都遠）：照舊走過去（null）',r===null,J(r)); }
{ const r=tapToSeat(0.5,-0.85,0,{ray:rayTo(V(0.5,1.9,-4.9),V(0.5,0,-0.85)),fy:0,hit:H(0.5,-0.85)});   /* 原本鏡頭在南邊 (0.5,1.9,3.1)：TAP-RAY-SEAT-1111 以後那條射線先打到 (0.5,0.4) 那張的椅背（畫面上點到的是那一張），改從北邊點 */ check('3. 地板那一點在椅子上（站不住）：照舊導去那張椅子',!!r&&r[3]&&r[3].x===0.5&&r[3].z===-0.9,J(r)); }
{ const cam=V(0.5,0.1,3.1), up=rayTo(cam,V(0.5,0.45,-0.9)), r=tapToSeat(0.5,-3,0,{ray:up,fy:0}), r0=tapToSeat(0.5,-2.3,0);   /* 原本 {ray:up,fy:0,useRay:true}（射線往上）；TAP-RAY-SEAT-1111：射線往上碰不到地板、engine3d.js 不會有 hit，照沒有傳 hit 的呼叫測 */
  check('4. 射線往上（沒有地板那一點）、或沒有傳射線：不判椅子（舊行為：地板那一點站得住＝null）',r===null&&r0===null,J([r,r0])); }
{ const eng=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
  /* 原本：傳 {ray:E.ray.ray,fy:hit.y}；TAP-RAY-SEAT-1111：多傳 hit（地板那一點：比它近才算打到椅子）*/
  check('5. engine3d.js：tapRedirect 傳 {ray:E.ray.ray,fy:hit.y,hit:{x,y,z}}；tapPref 用 r[3]（pref）；有 E.rayFirstHit',/E\.tapRedirect\(tx,tz,tlv==null\?\(P\.lv\|0\):tlv,\{ray:E\.ray\.ray,fy:hit\.y,hit:\{x:hit\.x,y:hit\.y,z:hit\.z\}\}\)/.test(eng)&&/E\.rayFirstHit=function\(ray,far\)/.test(eng)&&/if\(r\[3\]\) pref=r\[3\];/.test(eng)&&/P\.tapPref=\{x:pref\?pref\.x:hit\.x,z:pref\?pref\.z:hit\.z,/.test(eng)); }
// 6（BB 11-11 PC：118牛排座位密，點後排被導到前排）：兩張椅子前後排（鏡頭在南邊），點後排那張的椅背上緣——射線先穿過的是後排那張（高處），不能因為低處離前排中心比較近就挑前排
{ const S2=[{x:1.6,z:-0.26,yaw:0,lv:0},{x:1.6,z:1.06,yaw:Math.PI,lv:0}]; const E2={interactables:S2.map(s=>({seat:s,x:s.x,z:s.z})),canStand:()=>true};
  E2.rayFirstHit=chairHit(S2); const t2=mk(E2,st=>[st.x,st.z+0.6]);
  const cam=V(1.6,2.4,5.5), R=rayTo(cam,V(1.6,0.7,1.24)), [fx,fz]=floorOf(R), r=t2(fx,fz,0,{ray:R,fy:0,hit:H(fx,fz)});   /* 原本瞄 (1.6,0.7,1.06)＝後排椅子中心的半空；現在要打到東西：瞄後排的椅背（面向 −z，椅背在 z 1.23～1.26）*/
  check('6. 前後兩排、點後排椅背：導去後排那張（射線先穿過的），不是落點附近的前排',!!r&&r[3]&&r[3].z===1.06,J({r,fz:+fz.toFixed(2)})); }
// 7（2026-11-11 BB TSR 擋發布）：遊戲裡先關掉照椅子高度判——engine3d.js 不傳 useRay；沒有 useRay 時點走道（地板那一點站得住）一律照舊走過去，不被帶去椅子
//   TAP-RAY-SEAT-1111：射線高度判拿掉了（useRay 這個旗標也沒了）；同一條射線（擦過椅子中心的半空、地板那一點站得住）照舊 null——傳了 hit 也一樣（沒有打到椅子）；
//   BB 的四個走道點用真的模型測：tests/tap_seat_ray_real_1111_unit.js 第 1 項
{ const cam=V(1.38,1.9,3.1), R=rayTo(cam,V(1.38,0.45,-0.9)), [fx,fz]=floorOf(R), r=tapToSeat(fx,fz,0,{ray:R,fy:0}), rh=tapToSeat(fx,fz,0,{ray:R,fy:0,hit:H(fx,fz)}), eng=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
  /* 原本瞄 (0.5,0.45,−0.9)（地板那一點站得住、沒有 useRay＝null）。TAP-RAY-SEAT-1111：同一條射線現在打得到椅面（那就是點到椅子），改成「擦過」：從椅子旁邊過去（x 1.38，椅子在 0.9～1.3）、高 0.45 時離 (1.1,−0.9) 中心 0.28 m（舊做法會算進 0.32 m 內）、沒有碰到椅面椅背 */
  const passNear=(()=>{ const t=(0.45-R.origin.y)/R.direction.y; return Math.hypot(R.origin.x+R.direction.x*t-1.1,R.origin.z+R.direction.z*t+0.9); })();
  check('7. 射線擦過椅子（離中心 '+passNear.toFixed(2)+' m、沒有打到椅子）、地板那一點站得住：沒有 hit、有 hit 都照舊走過去（null）；engine3d.js 沒有 useRay',passNear<0.32&&r===null&&rh===null&&!/useRay/.test(eng),J([r,rh])); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

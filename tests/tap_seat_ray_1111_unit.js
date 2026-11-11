// 點椅面坐得到（BB 11-11 CC TAPSEAT：五湖四海 #9 (0.5,−0.9)，俯角淺時點椅面，射線打到地板的那一點在椅子後面 1.3 m，按鈕變「點餐」；只有點椅腳落地那一點坐得到）。
// src/game3d.js tapToSeat：地板那一點沒對到椅子時，沿同一條射線看離地 0.3～0.75 m 那一段有沒有穿過哪張椅子（0.32 m 內）；src/engine3d.js 把射線傳進來、tapPref 用椅子的位置。
//  1 從斜上方（俯角約 25°）點椅面：地板落點在椅子後面 1 m 以上、站得住 → 還是導去那張椅子的走近點，回傳的椅子＝那一張
//  2 點走道的地板（射線在 0.3～0.75 m 那一段離每張椅子都遠）→ 照舊走過去（null）
//  3 地板那一點本來就在椅子上（站不住）→ 照舊導去那張椅子（舊行為不變）
//  4 射線往上（從下面看上去）、沒有傳射線 → 不判椅子高度（舊行為）
//  5 engine3d.js：tapRedirect 傳 {ray, fy}、tapPref 用 r[3]
// 修改前（開發分支 181b18879）：1 FAIL。用法：node tests/tap_seat_ray_1111_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; }; const J=JSON.stringify;
const G3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), m=/  function tapToSeat\(x,z,lv(?:,o)?\)\{[\s\S]*?\n    if\(!best\) return null;[^\n]*\n/.exec(G3);
check('0. game3d.js 有 tapToSeat',!!m); if(!m){ console.log('FAILED'); process.exit(1); }
const SEATS=[{x:0.5,z:-0.9,yaw:0,lv:0},{x:1.1,z:-0.9,yaw:0,lv:0},{x:0.5,z:0.4,yaw:Math.PI,lv:0}];
const E={interactables:SEATS.map(s=>({seat:s,x:s.x,z:s.z})).concat([{x:0.65,z:-1.65,label:'點餐'}]),canStand:(x,z)=>!SEATS.some(s=>Math.hypot(s.x-x,s.z-z)<0.25)};
const seatApproach=st=>[st.x,st.z-0.6];
const tapToSeat=new Function('E','seatApproach','return '+m[0].trim().replace(/^function tapToSeat/,'function'))(E,seatApproach);
const V=(x,y,z)=>({x,y,z}); const norm=v=>{ const l=Math.hypot(v.x,v.y,v.z); return V(v.x/l,v.y/l,v.z/l); };
const rayTo=(cam,tgt)=>({origin:cam,direction:norm(V(tgt.x-cam.x,tgt.y-cam.y,tgt.z-cam.z))});
const floorOf=R=>{ const t=-R.origin.y/R.direction.y; return [R.origin.x+R.direction.x*t,R.origin.z+R.direction.z*t]; };
// 鏡頭在椅子南邊（+z）、高 1.9 m、水平距離 4 m（俯角約 25°），點椅面（離地 0.45 m）
{ const cam=V(0.5,1.9,3.1), R=rayTo(cam,V(0.5,0.45,-0.9)), [fx,fz]=floorOf(R), r=tapToSeat(fx,fz,0,{ray:R,fy:0,useRay:true});
  check('1. 俯角淺、點椅面：地板落點在椅子後面 '+(-0.9-fz).toFixed(2)+' m（站得住）→ 導去那張椅子的走近點、回傳那張椅子',(-0.9-fz)>1&&E.canStand(fx,fz)&&!!r&&r[0]===0.5&&Math.abs(r[1]-(-1.5))<1e-9&&r[3]&&r[3].x===0.5&&r[3].z===-0.9,J({fz:+fz.toFixed(2),r}));
  const R2=rayTo(cam,V(1.1,0.6,-0.9)), [gx,gz]=floorOf(R2), r2=tapToSeat(gx,gz,0,{ray:R2,fy:0,useRay:true});
  check('1. 點隔壁那張（1.1,−0.9）的椅背中段：導去那一張，不是 0.5 那張',!!r2&&r2[3]&&r2[3].x===1.1,J(r2)); }
{ const cam=V(3,1.9,3.1), R=rayTo(cam,V(3,0,-1.5)), [fx,fz]=floorOf(R), r=tapToSeat(fx,fz,0,{ray:R,fy:0,useRay:true});
  check('2. 點走道的地板（x 3，離椅子都遠）：照舊走過去（null）',r===null,J(r)); }
{ const r=tapToSeat(0.5,-0.85,0,{ray:rayTo(V(0.5,1.9,3.1),V(0.5,0,-0.85)),fy:0,useRay:true}); check('3. 地板那一點在椅子上（站不住）：照舊導去那張椅子',!!r&&r[3]&&r[3].x===0.5&&r[3].z===-0.9,J(r)); }
{ const cam=V(0.5,0.1,3.1), up=rayTo(cam,V(0.5,0.45,-0.9)), r=tapToSeat(0.5,-3,0,{ray:up,fy:0,useRay:true}), r0=tapToSeat(0.5,-2.3,0);
  check('4. 射線往上、或沒有傳射線：不判椅子高度（舊行為：地板那一點站得住＝null）',r===null&&r0===null,J([r,r0])); }
{ const eng=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
  check('5. engine3d.js：tapRedirect 傳 {ray:E.ray.ray,fy:hit.y}；tapPref 用 r[3]（pref）',/E\.tapRedirect\(tx,tz,tlv==null\?\(P\.lv\|0\):tlv,\{ray:E\.ray\.ray,fy:hit\.y\}\)/.test(eng)&&/if\(r\[3\]\) pref=r\[3\];/.test(eng)&&/P\.tapPref=\{x:pref\?pref\.x:hit\.x,z:pref\?pref\.z:hit\.z,/.test(eng)); }
// 6（BB 11-11 PC：118牛排座位密，點後排被導到前排）：兩張椅子前後排（鏡頭在南邊），點後排那張的椅背上緣——射線先穿過的是後排那張（高處），不能因為低處離前排中心比較近就挑前排
{ const S2=[{x:1.6,z:-0.26,yaw:0,lv:0},{x:1.6,z:1.06,yaw:Math.PI,lv:0}]; const E2={interactables:S2.map(s=>({seat:s,x:s.x,z:s.z})),canStand:()=>true};
  const t2=new Function('E','seatApproach','return '+m[0].trim().replace(/^function tapToSeat/,'function'))(E2,st=>[st.x,st.z+0.6]);
  const cam=V(1.6,2.4,5.5), R=rayTo(cam,V(1.6,0.7,1.06)), [fx,fz]=floorOf(R), r=t2(fx,fz,0,{ray:R,fy:0,useRay:true});
  check('6. 前後兩排、點後排椅背：導去後排那張（射線先穿過的），不是落點附近的前排',!!r&&r[3]&&r[3].z===1.06,J({r,fz:+fz.toFixed(2)})); }
// 7（2026-11-11 BB TSR 擋發布）：遊戲裡先關掉照椅子高度判——engine3d.js 不傳 useRay；沒有 useRay 時點走道（地板那一點站得住）一律照舊走過去，不被帶去椅子
{ const cam=V(0.5,1.9,3.1), R=rayTo(cam,V(0.5,0.45,-0.9)), [fx,fz]=floorOf(R), r=tapToSeat(fx,fz,0,{ray:R,fy:0}), eng=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
  check('7. 沒有 useRay（遊戲現在）：射線擦過椅子、地板那一點站得住＝照舊走過去（null）；engine3d.js 沒有傳 useRay',r===null&&!/useRay/.test(eng),J(r)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

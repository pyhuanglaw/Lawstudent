// L118-SEAT-FIX r3（LAWWW2-C 2026-11-12）：src/game3d.js tapToSeat——點椅子，射線先打到前面的桌子／展示櫃（椅子被擋住），地板那一點正好在椅子底下、而且站得住（椅子沒擋導航）
// CC L118_CAM36_a/b_r2（7d69704cdf）：辛亥韓食 #1／#5／#6／#11／#12、118牛排 #15、cafe2 #3／#5／#6、pasta #2／#6 點椅子走過去停在半路、按鈕是旁邊那一張（點擊打到 fallback／l118_tea_caseglass 等桌子、展示櫃）
//  1 地板那一點＝椅子中心、射線先打到桌子（不在椅子範圍）、那一點站得住 → 導去那張椅子的走近點，回傳的椅子＝那一張（修改前 null＝直接走向椅子底下）
//  2 點走道（離最近的椅子 0.5 m 以上）→ 照舊 null
//  3 點在兩張椅子中間（各 0.25 m 以上）→ 照舊 null
// 用法：node tests/l118_seat_tap_table_1112_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; }; const J=JSON.stringify;
const G3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), m=/  function tapToSeat\(x,z,lv(?:,o)?\)\{[\s\S]*?\n  GM\.TAP_CHAIR=TAP_CHAIR; GM\.rayHitsBox=rayHitsBox;\n/.exec(G3);
check('0. game3d.js 有 tapToSeat',!!m); if(!m){ console.log('FAILED'); process.exit(1); }
/* 辛亥韓食那一排（l118_tea）：兩欄椅子 x 0.55／1.05，走道 x −0.05；桌子在兩排椅子中間 */
const SEATS=[{x:0.55,z:1.5,yaw:0,lv:0},{x:1.05,z:1.5,yaw:0,lv:0},{x:0.55,z:0.98,yaw:Math.PI,lv:0},{x:0.55,z:-0.22,yaw:0,lv:0},{x:1.05,z:-0.22,yaw:0,lv:0},{x:0.55,z:-0.74,yaw:Math.PI,lv:0},{x:1.05,z:-0.74,yaw:Math.PI,lv:0}];
const TABLE_TOP=(R,far)=>{ const t=(0.71-R.origin.y)/R.direction.y; if(!(t>0&&t<far)) return null; return {distance:t,point:{x:R.origin.x+R.direction.x*t,y:0.71,z:R.origin.z+R.direction.z*t}}; };   /* 先打到桌面（高 0.71）*/
const E={interactables:SEATS.map(s=>({seat:s,x:s.x,z:s.z})),canStand:()=>true,rayFirstHit:TABLE_TOP};   /* 椅子不擋導航：每一點都站得住 */
const seatApproach=st=>[-0.05,st.z];
const tapToSeat=new Function('E','seatApproach','GM',m[0]+'\nreturn tapToSeat;')(E,seatApproach,{});
const V=(x,y,z)=>({x,y,z}); const norm=v=>{ const l=Math.hypot(v.x,v.y,v.z); return V(v.x/l,v.y/l,v.z/l); };
const rayTo=(cam,tgt)=>({origin:cam,direction:norm(V(tgt.x-cam.x,tgt.y-cam.y,tgt.z-cam.z))});
const H=(x,z)=>({x,y:0,z});
// 1 鏡頭在走道後方高處（CC：cam (0.13,2.99,−1.82) 看 #1），點 #1 的地板中心：射線先打到前面那張桌面
for(const st of [SEATS[0],SEATS[3],SEATS[4],SEATS[5],SEATS[6]]){ const cam=V(0.13,2.99,st.z-3.3), R=rayTo(cam,V(st.x,0,st.z)), r=tapToSeat(st.x,st.z,0,{ray:R,fy:0,hit:H(st.x,st.z)});
  check('1. 點 ('+st.x+','+st.z+') 的椅子（射線先打到桌子、地板那一點站得住）→ 導去那一張的走近點',!!r&&r[3]&&r[3].x===st.x&&r[3].z===st.z&&r[0]===-0.05&&r[1]===st.z,J(r)); }
// 2 點走道
{ const R=rayTo(V(0.13,2.99,-1.8),V(-0.05,0,0.4)), r=tapToSeat(-0.05,0.4,0,{ray:R,fy:0,hit:H(-0.05,0.4)}); check('2. 點走道 (−0.05,0.4) → 照舊 null（直接走過去）',r===null,J(r)); }
// 3 兩張椅子中間
{ const R=rayTo(V(0.13,2.99,-1.8),V(0.8,0,1.5)), r=tapToSeat(0.8,1.5,0,{ray:R,fy:0,hit:H(0.8,1.5)}); check('3. 點兩張椅子中間 (0.8,1.5)（各 0.25 m）→ 照舊 null',r===null,J(r)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

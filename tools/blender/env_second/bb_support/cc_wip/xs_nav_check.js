// 新生運動廣場兩層導航檢查：照 tests/nav_levels_unit.js 的做法（wt_l2 的 engine3d.js：NavGrid＋addSurf＋simWalk），讀 src/data/xinsheng_sports_layout.js。
// 用法：node xs_nav_check.js <engine3d 所在的 repo> <layout.js>
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=process.argv[2], LAY=require(path.resolve(process.argv[3]));
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null };
global.navigator={userAgent:'node'};
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'lib/three.bundle.js'),'utf8'),{filename:'three'});
const E=vm.runInThisContext('(function(){'+fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8')+'\nreturn E3;})()',{filename:'engine3d.js'});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'  '+info:'')); if(!ok) fails++; };
const W=LAY.w, D=LAY.d, cell=0.25, ox=-W/2-0.5, oz=-D/2-0.5, IN=0.12;
const L0=new E.NavGrid(W+1,D+1,cell,ox,oz), L1=new E.NavGrid(W+1,D+1,cell,ox,oz).setFloor(LAY.levels[1].y);
for(const n of [L0,L1]) n.blockOutside(-W/2+IN,-D/2+IN,W/2-IN,D/2-IN);
const st=LAY.stairs, surf={x0:st.x0,x1:st.x1,z0:st.z0,z1:st.z1,axis:st.axis,ya:st.ya,yb:st.yb};
const br=(g,b)=>g.blockRect(b[0],b[1],b[2],b[3],0,0.0);
L0.addSurf(Object.assign({},surf)); for(const b of LAY.levels[0].blocks) br(L0,b);
L1.fillBlocked(); for(const w of LAY.levels[1].walk) L1.freeRect(w[0],w[1],w[2],w[3]); L1.blockOutside(-W/2+IN,-D/2+IN,W/2-IN,D/2-IN);
L1.addSurf(Object.assign({},surf)); for(const b of LAY.levels[1].blocks) br(L1,b);
E.levels=[L0,L1]; E.nav=L0; E.player=null;
const sp=LAY.spawn, ord=LAY.interact.find(i=>i.kind==='order'), jw=LAY.interact.find(i=>i.kind==='jersey_wall'), cash=LAY.interact.find(i=>i.kind==='cashier'), look=LAY.interact.find(i=>i.kind==='look');
const sim=(a,b,dt)=>E.simWalk(a.x,a.z,b.x,b.z,{lv0:a.lv,lv1:b.lv,dt:dt||1/30});
for(const [n,a,b] of [['店門 → 一樓「看看」',sp,look],['店門 → 收銀台（買東西）',sp,cash],['店門 → 走樓梯 → 二樓訂做櫃台',sp,ord],['店門 → 二樓系隊球衣牆',sp,jw]]){
  for(const dt of [1/30,0.1]){ const r=sim(a,b,dt); const lvOK=r.lv===(b.lv|0), yOK=Math.abs(r.y-LAY.levels[b.lv|0].y)<0.05; check(`${n}（模擬走路 dt=${dt.toFixed(3)}）`,r.ok&&lvOK&&yOK,JSON.stringify({ok:r.ok,lv:r.lv,y:+(+r.y).toFixed(3),x:+(+r.x).toFixed(2),z:+(+r.z).toFixed(2)})); } }
const p=E.pathTo(sp.x,sp.z,0,ord.x,ord.z,1);
check('一樓 → 二樓的路經過樓梯',!!p&&p.some(q=>q[0]>st.x0&&q[0]<st.x1&&q[1]>st.z0+0.5&&q[1]<st.z1-0.5),JSON.stringify(p&&p.map(q=>q.map(v=>+(+v).toFixed(2)))));
{ const r=sim(ord,sp); check('二樓訂做櫃台 → 走樓梯下來 → 店門',r.ok&&r.lv===0&&Math.abs(r.y)<0.05,JSON.stringify(r)); }
{ let prev=null,mx=0; for(let z=st.z1+0.3;z>=st.z0;z-=0.05){ const h=L0.heightAt((st.x0+st.x1)/2,z); if(prev!==null) mx=Math.max(mx,Math.abs(h-prev)); prev=h; } check('樓梯高度連續（一樓地板 → 樓梯頂，每 5 cm ≤ 0.04 m）',mx<=0.04,'最大 '+mx.toFixed(3)); }
check('樓梯寬 ≥ 1.2 m、21 階、踏面 0.28',st.x1-st.x0>=1.2&&st.risers*st.tread===+(st.z1-st.z0).toFixed(2)||Math.abs(st.risers*st.tread-(st.z1-st.z0))<1e-6,`寬 ${(st.x1-st.x0).toFixed(2)}、長 ${(st.z1-st.z0).toFixed(2)}、一階 ${(3.6/st.risers).toFixed(4)}`);
check('二樓挑空處站不住（夾層前緣外 z=1）',!E.canStand(0,1.0,0.32,1));
check('一樓不能從側面踏上樓梯中段（x 2.7, z 2）→ 樓梯 (3.7,2)',!E.canStand(3.74,2.0,0.32,0)||Math.abs(L0.heightAt(3.74,2.0)-0)>0.5);
{ const q=E.pathTo(0,-6,0,0,-6,1); check('一樓夾層下 → 正上方二樓：一定繞樓梯',!!q&&q.some(t=>t[0]>st.x0&&t[1]>st.z0+1&&t[1]<st.z1-1),q?q.length+' 點':'沒有路'); }
{ const w=sim({x:0,z:-6,lv:0},{x:-1,z:-2,lv:0}); check('一樓夾層下走一圈不會被換到二樓',w.ok&&w.lv===0&&Math.abs(w.y)<0.01,JSON.stringify(w)); }
console.log(fails?`FAILED: ${fails}`:'ALL PASS'); process.exit(fails?1:0);

// WZ-SUNNY-TAPNAV-1112（LAWWW2-C 2026-11-12）：點地面找不到路時（E.moveTo 回 false），改走到點的位置和玩家之間、最近走得到的地方；都不行就提示（字等 AA 給；E.TAP_NOPATH_TEXT 空字串＝不提示）
// CC WZ_TAP_28：溫州街 (−35,−1.6) 點 (45,−1.6)，path 一直是 null、人 94 秒沒動也沒提示。Node 裡那兩點之間導航是通的（這支 2. 也確認），所以遊戲裡回 null 的原因還要 CC 記 E.pathTo 的回傳；這一包先處理「找不到路就不動」。
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const ok=(c,m,x)=>{ console.log((c?'PASS ':'FAIL ')+m+(x?'　'+x:'')); if(!c) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
const m=/if\(!E\.moveTo\(P,tx,tz,null,tlv\)\)\{([\s\S]*?)\n        \}/.exec(src);
ok(!!m,'1. engine3d.js 點地面：E.moveTo 回 false 時有後備');
if(m){ // 拿那一段跑：假的 moveTo——離玩家 ≤ 30 m 的點才走得到
  const run=(P,tx,tz,reach)=>{ const calls=[], toasts=[]; const E={TAP_NOPATH_TEXT:'（AA 的字）',moveTo:(p,x,z)=>{ calls.push([x,z]); const ok=Math.hypot(x-p.obj.position.x,z-p.obj.position.z)<=reach; if(ok) p.path=[[x,z]]; return ok; },toast:t=>toasts.push(t)};
    new Function('E','P','tx','tz','tlv',m[1])(E,P,tx,tz,0); return {calls,toasts,path:P.path}; };
  const P={obj:{position:{x:-35,z:-1.6}},path:null}; const r=run(P,45,-1.6,30);
  ok(r.path&&r.path.length&&Math.abs(r.path[0][0]-(-5))<0.6&&!r.toasts.length,'1a. 點 80 m 外、只有 30 m 內走得到：改走到這條線上最遠走得到的地方（約 x −5）、不提示',JSON.stringify(r.path));
  const P2={obj:{position:{x:0,z:0}},path:null}; const r2=run(P2,10,0,0);
  ok(!r2.path&&r2.toasts.length===1,'1b. 一點都走不到：提示「'+(r2.toasts[0]||'')+'」');
}
const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); ok(/E\.toast=\(t,ms\)=>toast\(t,ms\)/.test(g3),'2. game3d.js 把 toast 給 engine（E.toast）');
ok(/E\.TAP_NOPATH_TEXT=''/.test(fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'))&&!/那邊走不過去/.test(fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8')),'3. 提示字等 AA：engine 預設空字串、程式裡沒有自己編的字');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

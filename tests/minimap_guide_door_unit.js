// UX-MINIMAP-GUIDE-DOOR-1108（BB-B 11-08 05:44，PC R8B6_mini 截圖）：開著指路時，金色目的地點（半徑 4.5 px）蓋住目標門口的出入口方塊（#7fc4c9，4×4 px），
// 玩家看不到那裡是門。改法：drawMinimap 先畫指路的路線和目的地，再畫出入口方塊、自己的腳踏車。
// 這支量 src/game3d.js 的 drawMinimap 裡三樣東西的先後（畫在後面＝在上面）；改回原本的順序會失敗。
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','src','game3d.js'),'utf8');
let fail=0; const check=(n,ok,info)=>{ console.log((ok?'PASS':'FAIL')+' '+n+(info?'  '+info:'')); if(!ok) fail++; };
const a=src.indexOf('function drawMinimap('), b=src.indexOf('function mmArrowAngle(');
check('1 找得到 drawMinimap', a>0&&b>a);
const body=src.slice(a,b);
const iGuide=body.indexOf('GUIDE.drawMini('), iExit=body.indexOf("x.fillStyle='#7fc4c9'"), iBike=body.indexOf("x.fillStyle='#8fd18a'"), iRestore=body.indexOf('x.restore()');
check('2 指路只畫一次', iGuide>=0&&body.indexOf('GUIDE.drawMini(',iGuide+1)<0, 'at '+iGuide);
check('3 出入口方塊畫在指路後面（在上面）', iExit>iGuide&&iGuide>=0, `guide ${iGuide} exit ${iExit}`);
check('4 自己的腳踏車畫在指路後面', iBike>iGuide, `bike ${iBike}`);
check('5 指路還在旋轉的座標系裡（x.restore 之前）', iGuide<iRestore, `restore ${iRestore}`);
// 指路的 drawMini 自己沒有改：目的地點半徑 4.5 px（比方塊大），所以一定要方塊在上面
const g=fs.readFileSync(path.join(__dirname,'..','src','guide3d.js'),'utf8');
check('6 目的地點照舊（半徑 4.5 px）', /x\.arc\(u,v,4\.5,0,7\)/.test(g));
console.log(fail?`${fail} FAIL`:'ALL PASS'); process.exit(fail?1:0);

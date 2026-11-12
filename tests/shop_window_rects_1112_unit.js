// 每間店的櫥窗四角（PLACE-GATE-WINDOW-RECT-1112）：Z3.shopWindowRects(zone) 照 shopInsideReal 那張表算，給 CC 的地點關卡第二層裁框用——不需要瀏覽器。
// 只抽出那個函式跑（不載入整個 zones3d.js）；表用新生南路 XS3.SHOP_REAL 的算法和汀州路一間（東側）的數字。
const fs=require('fs'); let fail=0; const check=(n,ok,x)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'　'+JSON.stringify(x))); if(!ok) fail++; };
const src=fs.readFileSync(__dirname+'/../src/zones3d.js','utf8');
const m=/function shopWindowRects\(zone\)\{[\s\S]*?return out; \}/.exec(src);
check('0 zones3d.js 有 shopWindowRects，而且有匯出',!!m&&/shopInsideReal,shopWindowRects,/.test(src));
if(m){ const f=eval('('+m[0].replace(/\/\*[\s\S]*?\*\//g,'')+')');
  const GX=-16.5, mk=(id,place,cz,w,d,h)=>({id,place,w,d,h,x:GX-0.02-d/2,z:cz,ry:Math.PI/2,cx:GX,cz,ex:0,ez:w/2});
  const R=f({shopReal:{shops:[mk('dabu','xs_dabu',-16.7,7.4,12,3.4),mk('haopai','xs_haopai',-23.2,4.4,14,3.4),{id:'east',place:'tz_x',w:6,d:8,h:3,x:20+0.02+4,z:5,cx:20,cz:5,ex:0,ez:3}]}});
  check('1 三間各一筆，id、place 照表',R.length===3&&R[0].id==='dabu'&&R[0].place==='xs_dabu'&&R[2].place==='tz_x',R.map(r=>r.id));
  const d=R[0]; check('2 大步：玻璃在 x=−16.5、z −20.4～−13.0、高 0～3.4；寬 7.4',d.corners.every(c=>c[0]===-16.5)&&Math.min(...d.corners.map(c=>c[2]))===-20.4&&Math.max(...d.corners.map(c=>c[2]))===-13&&d.corners[2][1]===3.4&&d.w===7.4,d);
  check('2 朝街上的方向：西側的店（室內在 x 更小的那邊）normal 朝 +x；東側的店朝 −x',d.normal[0]===1&&d.normal[2]===0&&R[2].normal[0]===-1,[d.normal,R[2].normal]);
  check('3 大步、好拍兩間的框不重疊（隔壁店不會混進來）',Math.min(...R[0].corners.map(c=>c[2]))>=Math.max(...R[1].corners.map(c=>c[2])),[R[0].corners,R[1].corners]);
  { const c=d.corners, view=[-d.normal[0],0,-d.normal[2]], right=[-view[2],0,view[0]];   /* 從街上往店裡看（視線＝−normal）；右手邊＝視線 × 上 */
    const dir=[c[1][0]-c[0][0],0,c[1][2]-c[0][2]], dot=dir[0]*right[0]+dir[2]*right[2]; const e=R[2].corners, ve=[-R[2].normal[0],0,-R[2].normal[2]], re=[-ve[2],0,ve[0]], de=[e[1][0]-e[0][0],0,e[1][2]-e[0][2]];
    check('4 四角順序：左下、右下、右上、左上（從街上看；西側、東側的店都對）',dot>0&&de[0]*re[0]+de[2]*re[2]>0,[dot,de,re]); check('4 上面兩角在下面兩角正上方',c[2][0]===c[1][0]&&c[2][2]===c[1][2]&&c[3][0]===c[0][0]&&c[3][2]===c[0][2]&&c[0][1]===0&&c[1][1]===0); }
  check('5 沒有 shopReal 的區域＝空陣列',f({}).length===0&&f(null).length===0);
}
console.log(fail?'FAILED '+fail:'ALL PASS'); process.exit(fail?1:0);

// MOKU-STAIR-VOID-1112（LAWWW2-C 自查 11-12）：木曜日一樓樓梯間只有 1.2 m 寬，跟隨鏡頭一定在牆外——兩邊露出牆外米白的空底和天空。
// 兩層樓外面包一圈暗色的殼（Z3.roomBackdrop；和霖澤館 202、萬才館多功能教室一樣）。修改前 FAIL（沒有殼）。
const fs=require('fs'), path=require('path'); const R=path.join(__dirname,'..'); let fail=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fail++; };
const s=fs.readFileSync(path.join(R,'src/mokuyobi3d.js'),'utf8'), z=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8');
ok(/Z3\.roomBackdrop\(root,L\.w,L\.d,Y1\+L\.h,7,0,0\)/.test(s),'① 木曜日：整個區域（一樓樓梯間＋二樓店內，高 Y1＋h）外面 7 m 一圈暗色的殼');
ok(/function roomBackdrop\(g,W,D,H,m,cx,cz\)/.test(z)&&/side:THREE\.BackSide,fog:false/.test(z)&&/roomBackdrop[,}]/.test(z.slice(z.lastIndexOf('return {'))),'② Z3.roomBackdrop 有匯出：只從裡面看得到、不吃霧');
ok(/mok_window_view/.test(z),'③ 二樓臨街窗有窗景板（mok_window_view，在殼的裡面）——窗外不會變成暗色');
console.log(fail?'FAILED '+fail:'ALL PASS'); process.exit(fail?1:0);

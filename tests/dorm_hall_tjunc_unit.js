/* 男一舍門廳的牆接縫（DORM1-WALL-SEAM／LM-SEAM-GEO，LAWWW2-C 11-05）——不需要瀏覽器，讀 assets/models/env/dorm_hall.glb。
   牆段的 T 形接頭：一條三角形的邊中間夾著別段牆的頂點、自己卻沒有那個頂點，畫的時候兩邊的三角形邊對不齊，露出一點一點的縫，看到後面烘成黑的端面
   （走廊北牆、樓梯間的接頭；LM-SEAM-1028 只把端面改亮，放大還看得到）。修法：tools/blender/dorm_hall.py 匯出前 conform_tjunctions 把頂點插進邊裡，再重烘光照貼圖。
   ① 灰泥、腰牆（plaster|dado）的 T 形接頭 ≤ 3 個（剩下的是牆垂直相接、頂在另一面牆的對角線上：不是共平面的縫）
   ② 剩下的那幾個都不在同一個網格裡（同一個網格自己的 T 形接頭＝門洞上方那一塊、同一面牆分段，是最明顯的縫）
   修改前（開發分支 685337469 的 dorm_hall.glb）：176 個，同一個網格自己的 128 個 → ① ② FAIL。用法：node tests/dorm_hall_tjunc_unit.js */
const {execFileSync}=require('child_process'), path=require('path'), fs=require('fs'), os=require('os');
const ROOT=path.resolve(__dirname,'..'), out=path.join(os.tmpdir(),'dorm_hall_tj_'+process.pid+'.json');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const txt=execFileSync(process.execPath,[path.join(ROOT,'tools/blender/env_second/glb_tjunctions.js'),path.join(ROOT,'assets/models/env/dorm_hall.glb'),'plaster|dado',out]).toString();
const arr=JSON.parse(fs.readFileSync(out,'utf8')); fs.unlinkSync(out);
const same=arr.filter(t=>t.e===t.v);
check('① 灰泥、腰牆的 T 形接頭 ≤ 3 個',arr.length<=3,txt.split('\n')[0]);
check('② 沒有同一個網格自己的 T 形接頭（門洞上方、同一面牆分段的縫）',same.length===0,same.length?`${same.length} 個，例如 ${same.slice(0,3).map(t=>t.e+' '+t.p.join(',')).join('；')}`:'');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

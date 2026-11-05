// 大地圖：營業時間不蓋住店名（MAP-HOURS-OVERLAP-1105；使用者 2026-11-05 08:1x 截圖「公館店面名稱 有的被營業時間擋住」：慢輪單車的營業時間壓在 afar café 的店名上）。
//   做法：src/guide3d.js 畫入口時，營業時間先收進 pendH，所有店名畫完才畫；營業時間的框和已畫的字（free）重疊就不畫。
//   這支用假的 canvas 跑那一段的排版規則：公館那一排店（間隔 2 個字高）——修改前店名會被下一家上面那一行營業時間蓋住。用法：node tests/map_hours_overlap_unit.js
const fs=require('fs'), path=require('path'); const SRC=fs.readFileSync(path.join(__dirname,'..','src/guide3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
check('1. 店名畫完才畫營業時間：迴圈裡只收進 pendH，迴圈後才 strokeText／fillText',/if\(hl&&v\.k>1\.2\) pendH\.push\(\[hl,u,w\]\); \}/.test(SRC)&&/const pendH=\[\];/.test(SRC));
check('2. 營業時間要先過 free()（和店名、別的營業時間不重疊）才畫',/for\(const \[hl,u,w\] of pendH\)\{ if\(!free\(u,w\+15,x\.measureText\(hl\)\.width,13\)\) continue;/.test(SRC));
// 排版模擬：free() 照 guide3d.js 的算法；店一家一家往下排，相隔 52 px（截圖裡 慢輪→afar）
const boxes=[]; const free=(u,w,tw,th)=>{ const b=[u-tw/2-2,w-th/2-1,u+tw/2+2,w+th/2+1]; for(const q of boxes){ if(b[0]<q[2]&&b[2]>q[0]&&b[1]<q[3]&&b[3]>q[1]) return false; } boxes.push(b); return true; };
const shops=[['慢輪單車',350,558,'開放・今天 10:00–20:00'],['afar café',350,592,'開放・今天 11:00–21:00']], drawnNames=[], pend=[];
for(const [nm,u,w,hl] of shops){ if(free(u,w-14,nm.length*12,15)) drawnNames.push(nm); pend.push([hl,u,w]); }
const drawnH=pend.filter(([hl,u,w])=>free(u,w+15,hl.length*11,13)).map(q=>q[0]);
check('3. 兩家店的店名都畫出來；擠不下的營業時間不畫（不壓在 afar café 上）',drawnNames.length===2&&drawnH.length<2,JSON.stringify({drawnNames,drawnH}));
// BB-C BB_255（11-05 09:2x）：溫州街「13:00–22:00」碰到門口上面的「👤 不認識的女生」、「11:00–02:30」碰到「你在這裡」——這兩樣也要先佔位置
check('4. 門口上面的人名那一行（👤）佔位置（boxes.push），營業時間不壓上去',/const wt='👤 '[^\n]*?boxes\.push\(\[u-tw\/2-2,w-38,u\+tw\/2\+2,w-22\]\)/.test(SRC));
check('5. 玩家箭頭＋「你在這裡」在營業時間之前先佔位置',(()=>{ const i=SRC.indexOf("boxes.push([u-16,w-16,u+16,w+16]"), j=SRC.indexOf('for(const [hl,u,w] of pendH)'); return i>0&&j>i; })());
{ const bx=[]; const fr=(u,w,tw,th)=>{ const b=[u-tw/2-2,w-th/2-1,u+tw/2+2,w+th/2+1]; for(const q of bx){ if(b[0]<q[2]&&b[2]>q[0]&&b[1]<q[3]&&b[3]>q[1]) return false; } bx.push(b); return true; };
  const pu=300, pw=200; bx.push([pu-16,pw-16,pu+16,pw+16],[pu-26,pw+16,pu+26,pw+32]);   // 玩家
  const ok=!fr(pu+10,pw+20,11*11,13);   // 一家店的營業時間剛好落在「你在這裡」上
  check('6. 排版模擬：營業時間落在「你在這裡」上就不畫',ok); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

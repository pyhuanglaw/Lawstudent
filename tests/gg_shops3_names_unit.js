// GG-SHOPS3-SYS-1110（USER_WANTS X320）：公館六間店的正式名稱（使用者 11-10 18:5x 指定，docs/handoff/user_specs/GG_SHOPS3_1110.md 第二節）——套件（備用）招牌的字；棟號順序、寬度不動。不需要瀏覽器。
const fs=require('fs'), path=require('path'); const z=fs.readFileSync(path.join(__dirname,'..','src','zones3d.js'),'utf8');
let fail=0; const check=(n,ok,x)=>{ console.log((ok?'PASS ':'FAIL ')+n+(x&&!ok?'　'+x:'')); if(!ok) fail++; };
const m=z.match(/const shops=\[([\s\S]*?)\];\n/); check('0 找得到公館店面街 shops 陣列',!!m);
const names=[...(m?m[1]:'').matchAll(/\{n:'([^']*)',c:'[^']+'(?:,sc:'[^']+')?,w:(\d+)/g)].map(x=>[x[1],+x[2]]);
/* 2026-11-11 改期望：洗樂、印得好、泰米村食搬到汀州路（X321）——G09、G10 使用者選「先拉下鐵門」（X335：沒有店名、shut:true）、G11 是花序 Flower Notes（X325）*/
const want={4:['安泰藥局',8],8:['汀州鮮果',8],9:['',9],10:['',9],11:['花序 Flower Notes',10],13:['榮恩典文具社',9]};
for(const [i,[n,w]] of Object.entries(want)) check(`1 G${String(i).padStart(2,'0')}＝${n}（寬 ${w} m 不變）`,names[i]&&names[i][0]===n&&names[i][1]===w,JSON.stringify(names[i]));
check('1 店面街一共 15 間（G00～G14，順序不變；G15 是巷口轉角）',names.length===15,names.length);
check('2 舊名字不在店面街：公館藥局、水果行、自助洗衣、影印・輸出、日日定食、文具・畫材',!/n:'(公館藥局|水果行|自助洗衣|影印・輸出|日日定食|文具・畫材)'/.test(m?m[1]:''));
check('2 搬到汀州路的三間（洗樂洗衣坊、印得好、泰米村食）不再出現在公館店面街',!/n:'(洗樂洗衣坊|印得好|泰米村食)'/.test(m?m[1]:''));
/* 2026-11-11 改期望：使用者選「G10 改成真的巷口」——G09 照舊鐵捲門（shut:true）、G10 是巷口（lane:true） */
check('2 G09 是拉下鐵捲門的空店面（shut:true）、G10 是巷口（lane:true），都沒有店名和直招；套件認得 shop.shut、shop.lane',/\{n:'',c:'[^']+',w:9,type:'none',it:'laundry',shut:true\}/.test(m?m[1]:'')&&/\{n:'',c:'[^']+',w:9,type:'none',it:'print',lane:true\}/.test(m?m[1]:'')&&/shop:\{shut:s\.shut,lane:s\.lane,/.test(z)&&/if\(s\.lane\)\{/.test(fs.readFileSync(path.join(__dirname,'..','src','townkit3d.js'),'utf8'))&&/else if\(s\.shut\)\{/.test(fs.readFileSync(path.join(__dirname,'..','src','townkit3d.js'),'utf8')));
console.log(fail?`FAIL ${fail}`:'ALL PASS'); process.exit(fail?1:0);

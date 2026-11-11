// GG-SHOPS3-SYS-1110（USER_WANTS X320）：公館六間店的正式名稱（使用者 11-10 18:5x 指定，docs/handoff/user_specs/GG_SHOPS3_1110.md 第二節）——套件（備用）招牌的字；棟號順序、寬度不動。不需要瀏覽器。
const fs=require('fs'), path=require('path'); const z=fs.readFileSync(path.join(__dirname,'..','src','zones3d.js'),'utf8');
let fail=0; const check=(n,ok,x)=>{ console.log((ok?'PASS ':'FAIL ')+n+(x&&!ok?'　'+x:'')); if(!ok) fail++; };
const m=z.match(/const shops=\[([\s\S]*?)\];\n/); check('0 找得到公館店面街 shops 陣列',!!m);
const names=[...(m?m[1]:'').matchAll(/\{n:'([^']+)',c:'[^']+'(?:,sc:'[^']+')?,w:(\d+)/g)].map(x=>[x[1],+x[2]]);
const want={4:['安泰藥局',8],8:['汀州鮮果',8],9:['洗樂洗衣坊',9],10:['印得好',9],11:['泰米村食',10],13:['榮恩典文具社',9]};
for(const [i,[n,w]] of Object.entries(want)) check(`1 G${String(i).padStart(2,'0')}＝${n}（寬 ${w} m 不變）`,names[i]&&names[i][0]===n&&names[i][1]===w,JSON.stringify(names[i]));
check('1 店面街一共 15 間（G00～G14，順序不變；G15 是巷口轉角）',names.length===15,names.length);
check('2 舊名字不在店面街：公館藥局、水果行、自助洗衣、影印・輸出、日日定食、文具・畫材',!/n:'(公館藥局|水果行|自助洗衣|影印・輸出|日日定食|文具・畫材)'/.test(m?m[1]:''));
check('2 泰米村食不用日式定食的櫥窗（it 不是 teishoku）',/\{n:'泰米村食',[^}]*it:'noodle'/.test(z));
console.log(fail?`FAIL ${fail}`:'ALL PASS'); process.exit(fail?1:0);

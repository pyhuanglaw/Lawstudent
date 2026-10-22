// 宿營夜遊的步道背景（BG-CAMP-NIGHT-TRAIL-1021）＋筆記本開著時劇情的按鈕（BUG-NOTEBOOK-ADVBTN-1021）；BB 帳號 A 10-21 20:45 觀察（BB_218 d6df42c4 最後一節）——不需要瀏覽器。
// 檢查：1. 8/22 21:30 夜遊（ev_camp_d1_walk）第一個場景用 camp_trail_night：OUT.bg 給同一張步道圖＋night（還沒有夜晚版的圖，先調暗）；白天的 camp_trail 照舊不調暗；
//       2. ADV.setBg 遇到 night 會加 #adv.night、換場景會拿掉；CSS 有 #adv.night 的調暗；
//       3. 筆記本（#menu）開著時，劇情右上的「紀錄」「略過對話」（#advTop）不顯示（原本 z-index 7 浮在筆記本上面、按得到）。
// 修改前：第 1、2、3 項 FAIL。用法：node tests/ui_night_bg_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8').replace(/^const OUT\s*=/m,'globalThis.OUT='),{filename:'outings3d.js'});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
{ const n=OUT.bg('camp_trail_night'), d=OUT.bg('camp_trail'), camp=src('src/data/camp_y1.js'), i=camp.indexOf("id:'ev_camp_d1_walk'"), j=camp.indexOf('dialogue:[',i);
  check('1. 夜遊第一個場景用 camp_trail_night；OUT.bg 給步道那張圖＋night（圖在）；白天的 camp_trail 不調暗',i>=0&&camp.slice(j,j+80).includes("bg:'camp_trail_night'")&&n&&n.night===true&&n.image==='assets/bg/camp_trail.webp'&&fs.existsSync(path.join(ROOT,n.image))&&d&&d.image===n.image&&!d.night,JSON.stringify({n,d,first:camp.slice(j,j+80)})); }
{ const A=src('src/adv3d.js'), k=A.indexOf('A.setBg=function'), fn=A.slice(k,A.indexOf('\n',A.indexOf('\n',A.indexOf('\n',k)+1)+1));
  check('2. ADV.setBg：night 加 #adv.night、換場景先拿掉；CSS 有 #adv.night #advBg 的調暗',/\['blur','freeze','dark','image','cg','night'\]/.test(fn)&&/mode\.night\)\s*A\.root\.classList\.add\('night'\)/.test(fn)&&/#adv\.night #advBg\{filter:brightness\(/.test(A),fn.slice(0,300)); }
check('3. 筆記本（#menu）開著時 #advTop（紀錄、略過對話）不顯示',/body:has\(#menu:not\(\.hide\)\) #advTop\{display:none\}/.test(src('src/adv3d.js')));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

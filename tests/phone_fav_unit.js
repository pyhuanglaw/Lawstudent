// 手機：朋友設為最愛、聊天置頂（PHONE-FAV-1103，USER_WANTS X190）——不需要瀏覽器。
// 使用者 2026-11-03：「可以把某位朋友設為最愛」「他的聊天會放在最上面」。
// 檢查（src/phone3d.js；畫面在 src/game3d.js 的 msgHTML、threadHTML、friendsHTML、personHTML）：
//   1 舊存檔（沒有 G.phone、或 G.phone 沒有 fav）＝空的，不壞、不改其他欄位
//   2 設為最愛／取消最愛（一對一、群組都可以；通知 sys、亂寫的不行）；可以很多位
//   3 訊息列表（threads 的 fav）：最愛的在最上面；最愛之間、其他的各自照最新一則排；不帶 fav 的照舊（未讀總數、其他地方不受影響）
//   4 存檔、讀檔（JSON）以後還在
//   5 畫面：game3d.js 訊息列表用 {sys:true,fav:true}、對話表頭／朋友頁／人物頁有星號按鈕（data-fav）、按了存檔
// 修改前（33e25bdcb）：沒有 PHONE.toggleFav（第 2 項就失敗）。用法：node tests/phone_fav_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=process.env.SRC_ROOT?path.resolve(process.env.SRC_ROOT):path.resolve(__dirname,'..');
global.window=global; global.self=global;
global.CHARACTERS={kexin:{name:'林可昕',phoneName:'可昕'},heroine_01:{name:'沈以安',phoneName:'以安'},heroine_02:{name:'林芷若',phoneName:'芷若'}};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].phoneName)||id};
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/phone3d.js'),'utf8').replace(/^const PHONE=/m,'globalThis.PHONE='),{filename:'src/phone3d.js'});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const mkG=()=>{ const G={day:10,hour:20,flags:{},msgs:[]}; const at=(day,h,m)=>PHONE.postAt(G,m,day,h);
  at(8,9,{who:null,text:'明天停止上班上課。',name:'新聞'});
  at(9,21,{th:'p:heroine_01',from:'heroine_01',text:'筆記我放你桌上了。'});
  at(9,22,{th:'p:heroine_02',from:'heroine_02',text:'下週的書展你去嗎？'});
  PHONE.join(G,'class','法律系大一'); at(10,12,{th:'g:class',from:'heroine_01',text:'明天停課'});
  at(10,18,{th:'p:kexin',from:'kexin',text:'週末來政大？我當導遊。'});
  at(10,19.5,{who:null,text:'張教授（信）：明日停課。'}); return G; };
const order=L=>L.map(t=>t.th).join(',');
{ const G={day:3,hour:9,flags:{},msgs:[]}; let ok=true, e=null; try{ PHONE.rec(G); }catch(x){ ok=false; e=x; }
  check('1a 舊存檔沒有 G.phone：PHONE.rec 補上 fav＝[]',ok&&Array.isArray(G.phone&&G.phone.fav)&&G.phone.fav.length===0,e?String(e):JSON.stringify(G.phone&&G.phone.fav));
  const G2={day:3,hour:9,flags:{},msgs:[],phone:{groups:{a:{name:'A',day:1}},seen:{'p:kexin':5},q:[],n:3}}; PHONE.rec(G2);
  check('1b 舊存檔有 G.phone、沒有 fav：補 fav＝[]，其他欄位不動',Array.isArray(G2.phone.fav)&&!G2.phone.fav.length&&G2.phone.seen['p:kexin']===5&&G2.phone.n===3&&G2.phone.groups.a.name==='A'); }
const G=mkG();
const base=order(PHONE.threads(G,{sys:true}));
check('2a 有 PHONE.toggleFav／isFav／setFav',typeof PHONE.toggleFav==='function'&&typeof PHONE.isFav==='function'&&typeof PHONE.setFav==='function');
if(fails&&typeof PHONE.toggleFav!=='function'){ console.log('FAILED '+fails); process.exit(1); }
check('2b 沒設最愛：列表照舊照最新一則（通知 → 可昕 → 群組 → 芷若 → 以安）',base==='sys,p:kexin,g:class,p:heroine_02,p:heroine_01'&&order(PHONE.threads(G,{sys:true,fav:true}))===base,base);
const on1=PHONE.toggleFav(G,'p:heroine_01');
check('2c 以安設為最愛：toggleFav 回 true、isFav true、存在 G.phone.fav',on1===true&&PHONE.isFav(G,'p:heroine_01')&&G.phone.fav.join()==='p:heroine_01');
const L1=PHONE.threads(G,{sys:true,fav:true});
check('3a 最愛的聊天在最上面（以安 → 其他照最新）',order(L1)==='p:heroine_01,sys,p:kexin,g:class,p:heroine_02'&&L1[0].fav===true&&L1[1].fav===false,order(L1));
check('3b 不帶 fav 的 threads 照舊（其他地方、未讀數不受影響）',order(PHONE.threads(G,{sys:true}))===base&&PHONE.unread(G)===PHONE.threads(G).reduce((s,r)=>s+r.unread,0));
PHONE.toggleFav(G,'p:heroine_02'); PHONE.toggleFav(G,'g:class');
check('3c 多位最愛（以安、芷若、群組）：都在最上面，之間照最新一則（群組 10/10 → 芷若 9/9 22:00 → 以安 9/9 21:00）',order(PHONE.threads(G,{sys:true,fav:true}))==='g:class,p:heroine_02,p:heroine_01,sys,p:kexin',order(PHONE.threads(G,{sys:true,fav:true})));
PHONE.postAt(G,{th:'p:heroine_01',from:'heroine_01',text:'明天見'},10,20);
check('3d 最愛的人傳了新訊息：在最愛裡排第一',order(PHONE.threads(G,{sys:true,fav:true}))==='p:heroine_01,g:class,p:heroine_02,sys,p:kexin',order(PHONE.threads(G,{sys:true,fav:true})));
const off=PHONE.toggleFav(G,'p:heroine_02');
check('2d 取消最愛（芷若）：回 false、回到一般的位置',off===false&&!PHONE.isFav(G,'p:heroine_02')&&order(PHONE.threads(G,{sys:true,fav:true}))==='p:heroine_01,g:class,sys,p:kexin,p:heroine_02',order(PHONE.threads(G,{sys:true,fav:true})));
check('2e 通知（sys）、空的、亂寫的不能設最愛；同一個設兩次不重複',PHONE.setFav(G,'sys',true)===false&&PHONE.setFav(G,'',true)===false&&PHONE.setFav(G,'x',true)===false&&(PHONE.setFav(G,'p:heroine_01',true),G.phone.fav.filter(t=>t==='p:heroine_01').length===1),JSON.stringify(G.phone.fav));
check('2f 還沒有對話的朋友也可以先設（朋友頁）：之後一有訊息就在最上面',PHONE.setFav(G,'p:kexin',true)===true&&PHONE.threads(G,{sys:true,fav:true})[0].th==='p:heroine_01'&&PHONE.threads(G,{sys:true,fav:true}).slice(0,3).some(t=>t.th==='p:kexin'));
{ const G2=JSON.parse(JSON.stringify(G)); check('4 存檔、讀檔（JSON）以後最愛還在、順序一樣',JSON.stringify(G2.phone.fav)===JSON.stringify(G.phone.fav)&&order(PHONE.threads(G2,{sys:true,fav:true}))===order(PHONE.threads(G,{sys:true,fav:true}))); }
{ const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
  check('5a 訊息列表用 PHONE.threads(G,{sys:true,fav:true})，最愛的名字前面有 ★',/PHONE\.threads\(G,\{sys:true,fav:true\}\)/.test(src)&&/t\.fav\?'<span class="favStar"/.test(src));
  check('5b 對話表頭、朋友列表、人物頁都有星號按鈕（favBtn → data-fav），按了 toggleFav＋存檔＋重畫',/\+favBtn\(th\)\+msgBtn/.test(src)&&/<div class="favName">'\+esc\(nm\)\+favBtn\('p:'\+id\)/.test(src)&&/<b>'\+esc\(name\)\+'<\/b>'\+favBtn\('p:'\+id\)/.test(src)&&/\[data-fav\]'\)\.forEach\(b=>b\.onclick=ev=>\{[^}]*PHONE\.toggleFav\(G,b\.dataset\.fav\)[^}]*autosave\(\); renderPhone\(\);/.test(src)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

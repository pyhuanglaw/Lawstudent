// BUG-YIZHAN-1107（使用者 11-07 試玩「一盞不見了？」）：一盞（wz_teahouse）要在手機「地點」、大地圖的溫州街圖釘、導航裡
const fs=require('fs'),path=require('path'),vm=require('vm'); const ROOT=path.join(__dirname,'..');
let fail=0; const check=(n,ok,d)=>{ console.log((ok?'PASS ':'FAIL ')+n+(d!==undefined?'　'+d:'')); if(!ok) fail++; };
const ctx={console,Math,JSON,Object,Array,String,Number}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT,'src/data/places.js'),'utf8')+';this.PLACES=PLACES;',ctx);
const P=ctx.PLACES, q=P.quickList().filter(Boolean).find(p=>p[0]==='wz_teahouse');
check('1. 手機「地點」有一盞（名字照 PLACES.names、落點＝區域出生點）',!!q&&q[1]===P.names.wz_teahouse&&q[1]==='一盞'&&q[2]===null,JSON.stringify(q));
check('1. 不在一開始就知道的清單（要自己走去一次）',!(P.known0||{}).wz_teahouse);
const pm=fs.readFileSync(path.join(ROOT,'src/placemap3d.js'),'utf8'), gd=fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8');
check('2. 大地圖溫州街圖釘列一盞、人在一盞＝溫州街圖釘',pm.includes("['wz_teahouse','一盞']")&&/wz_teahouse:'wenzhou'/.test(pm));
check('3. 導航：溫州街 ⇄ 一盞',/wenzhou:\[[^\]]*'wz_teahouse'/.test(gd)&&/wz_teahouse:\['wenzhou'\]/.test(gd));
console.log(fail?'FAILED '+fail:'ALL PASS'); process.exit(fail?1:0);

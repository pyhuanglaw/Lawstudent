// WENTE-RACK-CLOSED-1113（BB_379 溫特寶邸 v4 P2；店面標準 §12 第 1 點「打烊看得出來關了」）：溫特寶邸門口的立式衣架只在營業中擺出來。
// LAWWW-C cabdf8ad9a 先做的專用版（S.OPEN_ONLY＋zoneTime）已換成通用的 Z3.openOnly（LAWWW2-C OPEN-ONLY-1113；機制本身在 tests/open_only_1113_unit.js）。
// 這支只驗溫特寶邸：街景節點叫 OPENONLY__tz_wente__…、tingzhou3d 接了 Z3.openOnly、舊的專用版拿掉了、真的 PLACES 營業時間對得上。
// 用法：node tests/wente_rack_closed_1113_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/tingzhou3d.js'),'utf8');
check('1. tingzhou3d.js 汀州路街景載入後呼叫 Z3.openOnly',/Z3\.openOnly\(tzR,zone\)/.test(src));
check('1. 舊的專用版（S.OPEN_ONLY、zone.tzOpenOnly）拿掉了，不兩套並存',!/S\.OPEN_ONLY|tzOpenOnly/.test(src));
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/tingzhou_street.glb')); const J=JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString('utf8'));
const names=J.nodes.map(n=>n.name||''); const hit=names.filter(n=>/^OPENONLY__tz_wente__/.test(n));
check('2. 街景模型有溫特寶邸門口衣架的節點 OPENONLY__tz_wente__…',hit.length>=1,hit.join(','));
check('2. 舊名字 skxglb_Twente_* 沒有了（不會被當成一直擺著的東西）',!names.some(n=>/^skxglb_Twente_/.test(n)));
global.window=global; eval(fs.readFileSync(path.join(ROOT,'src/data/places.js'),'utf8').replace(/^const (\w+)\s*=/m,'globalThis.$1=')); const P=globalThis.PLACES;
let wd=null, we=null; for(let d=0;d<14;d++){ try{ const w=P.windowsOf('tz_wente',d); if(w===null&&we==null) we=d; else if(w&&wd==null) wd=d; }catch(e){} }
check('3. 營業時間：15:00 開、23:00 關、公休日 15:00 關（Z3.openOnly 照這個切）',wd!=null&&P.isOpen('tz_wente',15,wd)&&!P.isOpen('tz_wente',23,wd)&&(we==null||!P.isOpen('tz_wente',15,we)),'營業日 '+wd+'、公休 '+we);
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

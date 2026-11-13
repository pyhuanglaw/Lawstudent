// WENTE-RACK-CLOSED-1113（BB_379 溫特寶邸 v4 P2；店面標準 §12 第 1 點「打烊看得出來關了」）：街景模型裡溫特寶邸門口的立式衣架（skxglb_Twente_*）只在營業中擺出來。
// 用法：node tests/wente_rack_closed_1113_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/tingzhou3d.js'),'utf8');
const m=/S\.OPEN_ONLY=(\{[^}]*\})/.exec(src); const OO=m?(new Function('return '+m[1]))():null;
check('1. S.OPEN_ONLY 有溫特寶邸 → tz_wente',!!OO&&OO.wente==='tz_wente');
const re=/^skxglb_T(\w+?)_\d+$/; const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/tingzhou_street.glb')); const J=JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString('utf8'));
const hit=J.nodes.map(n=>n.name||'').filter(n=>{ const q=re.exec(n); return q&&OO&&OO[q[1]]; });
check('2. 街景模型找得到溫特寶邸門口衣架的節點（同一個 regex）',hit.length>=1,hit.join(','));
check('3. zoneTime 照 PLACES.isOpen 切、載入時收集節點',/zone\.tzOpenOnly=\[\]; tzR\.traverse/.test(src)&&/q\.obj\.visible=open/.test(src)&&/PLACES\.isOpen\(q\.place/.test(src));
global.window=global; eval(fs.readFileSync(path.join(ROOT,'src/data/places.js'),'utf8').replace(/^const (\w+)\s*=/m,'globalThis.$1=')); const P=globalThis.PLACES;
let wd=null, we=null; for(let d=0;d<14;d++){ try{ const w=P.windowsOf('tz_wente',d); if(w===null&&we==null) we=d; else if(w&&wd==null) wd=d; }catch(e){} }
check('4. 營業時間：15:00 開、23:00 關、公休日 15:00 關',wd!=null&&P.isOpen('tz_wente',15,wd)&&!P.isOpen('tz_wente',23,wd)&&(we==null||!P.isOpen('tz_wente',15,we)),'營業日 '+wd+'、公休 '+we);
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

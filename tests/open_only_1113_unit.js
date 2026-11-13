// OPEN-ONLY-1113（LAWWW2-C 2026-11-13；BB_379 v4 P2：溫特寶邸打烊 23:00 門口立式衣架和衣服還擺在騎樓，像還開著）
// src/zones3d.js Z3.openOnly：街景模型裡 OPENONLY__<地點>__… 只在營業時顯示、CLOSEDONLY__<地點>__… 只在打烊時顯示（颱風停業算打烊）
//  1 營業時間（溫特寶邸週四 15:00）→ OPENONLY 顯示、CLOSEDONLY 藏起來
//  2 打烊（週四 23:00）、公休（週三）、颱風 → 反過來
//  3 掛在 zone.update：時間改了，30 幀內跟著切
//  4 汀州路街景模型有 OPENONLY__tz_wente__… 這個節點，tingzhou3d.js 有呼叫 Z3.openOnly
// 用法：node tests/open_only_1113_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const Z=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
const m=/\n  function openOnly\(root,zone\)\{[\s\S]*?\n  const ggLitWired=/.exec(Z);
check('0. zones3d.js 有 openOnly，也有匯出',!!m&&/return \{[^}]*\bopenOnly,/.test(Z));
if(!m){ console.log('FAILED'); process.exit(1); }
const src=m[0].replace(/\n  const ggLitWired=$/,'');
// 假的 PLACES：溫特寶邸 13:00–21:00、週三（day%7===3）公休；day 99＝颱風
const PLACES={ isOpen:(id,h,day)=>id==='tz_wente'&&day%7!==3&&h>=13&&h<21, typhoonClosed:(id,day)=>day===99 };
const GAME={G:{hour:15,day:4}};
const openOnly=new Function('PLACES','GAME',src+'\nreturn openOnly;')(PLACES,GAME);
const mk=name=>({name,visible:true});
const nodes=[mk('OPENONLY__tz_wente__wente_0'),mk('CLOSEDONLY__tz_wente__cover'),mk('skxglb_other_1'),mk('OPENONLY__tz_wente')];
const root={traverse(fn){ nodes.forEach(fn); }};
const zone={update:null};
const R=openOnly(root,zone);
check('1. 找到三個（OPENONLY 兩個、CLOSEDONLY 一個；地點不含後面的 __xxx）',R&&R.items.length===3&&R.items.every(it=>it.place==='tz_wente'),R&&JSON.stringify(R.items.map(it=>[it.o.name,it.place,it.open])));
check('1. 週四 15:00 營業：OPENONLY 顯示、CLOSEDONLY 藏',nodes[0].visible&&nodes[3].visible&&!nodes[1].visible&&nodes[2].visible);
const at=(day,h)=>{ GAME.G.day=day; GAME.G.hour=h; R.upd(); return [nodes[0].visible,nodes[1].visible]; };
let v=at(4,23); check('2. 週四 23:00 打烊：衣架收起來、蓋布出來',!v[0]&&v[1],JSON.stringify(v));
v=at(3,15); check('2. 週三公休 15:00：衣架收起來',!v[0]&&v[1],JSON.stringify(v));
v=at(99,15); check('2. 颱風停業：衣架收起來',!v[0]&&v[1],JSON.stringify(v));
GAME.G.day=4; GAME.G.hour=15; for(let i=0;i<31;i++) zone.update(0.016);
check('3. 改回營業時間，zone.update 30 幀內跟著切回來',nodes[0].visible&&!nodes[1].visible);
const T=fs.readFileSync(path.join(ROOT,'src/tingzhou3d.js'),'utf8');
check('4. tingzhou3d.js 汀州路街景載入後呼叫 Z3.openOnly',/Z3\.openOnly\(tzR,zone\)/.test(T));
const glb=path.join(ROOT,'assets/models/env/second_ai/tingzhou_street.glb');
let names=[]; try{ const f=fs.readFileSync(glb), n=f.readUInt32LE(12), j=JSON.parse(f.slice(20,20+n).toString('utf8')); names=(j.nodes||[]).map(x=>x.name||''); }catch(e){}
const hit=names.filter(s=>/^OPENONLY__tz_wente__/.test(s));
check('4. 汀州路街景模型有 OPENONLY__tz_wente__ 節點（門口立式衣架）',hit.length>=1,hit.join(','));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

// 快轉一次跨過好幾個月的生活費提示（BB 帳號 A 10-21 21:4x：經濟系 6/8 一次入帳 10,000（5、6 月），提示只寫 5,000）——不需要瀏覽器。
// 原因：快轉的迴圈（home3d.js 兩處、econff3d.js、jp3d.js、us_life3d.js）每個月照加錢，但提示的 mo 只留最後一個月。
// 檢查：1. STORY.fundsJoin：一個月＝原本那句；兩個月＝「家裡匯來 5、6 月的生活費：10,000 元」（總數）；
//       2. 照 monthlyFunds 真的跨 5/1、6/1（經濟系搬回家以後）：加起來 10,000、提示寫 10,000；
//       3. 五個快轉迴圈都用 fundsJoin（沒有只留最後一個月的 mo=f）。
// 修改前：沒有 fundsJoin，第 1～3 項 FAIL。用法：node tests/funds_join_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const J=typeof STORY.fundsJoin==='function'?STORY.fundsJoin:null;
{ const a={amount:5000,m:5,text:'家裡匯來這個月的生活費：5,000 元'}, b={amount:5000,m:6,text:'家裡匯來這個月的生活費：5,000 元'};
  const one=J?J(null,a):null, two=J?J(J(null,a),b):null;
  check('1. 一個月＝原本那句；兩個月合成一則寫總數「家裡匯來 5、6 月的生活費：10,000 元」',!!J&&one.text===a.text&&one.amount===5000&&two.amount===10000&&two.text==='家裡匯來 5、6 月的生活費：10,000 元',JSON.stringify({one,two})); }
{ const day=STORY.dayOfKey('2025-04-20'), G={day,hour:12,stage:'econ',flags:{fundsV2:1,allowanceMonth:4,Y0_MOVED_OUT:true}};
  let mo=null, sum=0; for(const k of ['2025-05-01','2025-06-01']){ G.day=STORY.dayOfKey(k); const f=STORY.monthlyFunds(G); if(f){ sum+=f.amount; mo=J?J(mo,f):f; } }
  check('2. 經濟系搬回家以後一次跨 5/1、6/1：錢加 10,000、提示也寫 10,000',sum===10000&&!!mo&&mo.amount===10000&&/10,000 元/.test(mo.text),JSON.stringify({sum,mo})); }
{ const bad=[], ok=[]; for(const f of ['src/home3d.js','src/econff3d.js','src/jp3d.js','src/us_life3d.js']){ const s=fs.readFileSync(path.join(ROOT,f),'utf8'); const n=(s.match(/STORY\.fundsJoin\(mo,f\)/g)||[]).length; if(/monthlyFunds\(G\);\s*if\(f\)\{[^}]*\bmo=f;/.test(s)) bad.push(f); else ok.push(f+':'+n); }
  check('3. 五個快轉迴圈（home3d.js 兩處、econff3d.js、jp3d.js、us_life3d.js）都用 fundsJoin',!bad.length&&ok.join(',')==='src/home3d.js:2,src/econff3d.js:1,src/jp3d.js:1,src/us_life3d.js:1',JSON.stringify({bad,ok})); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

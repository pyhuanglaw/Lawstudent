// 人物頁戀愛條的提示分三段、「出去玩」說清楚差什麼（ROM-STAGE-TEXT-1110，使用者 2026-11-10「都已經這個程度 她還沒有那樣看我? 要區分曖昧階段吧??」→ 選擇題「照程度寫三段」；「而且也不能約校外?」）——不需要瀏覽器（D131）。
// src/date3d.js DATE.progress／PROG_HINT、canAskCore；src/game3d.js progHTML（mood 那一行）。
//   1 戀愛條還沒一半：照舊「她還沒有那樣看你」
//   2 一半以上（她的戀愛 20／30）：「她好像開始在意你了」
//   3 第 5 階、差祐廷的戀愛一半以上：「你好像開始在意她了」
//   4 第 6 階：多一行「你們之間有點曖昧」（mood），game3d.js 印出來
//   5 「出去玩」：朋友以上、差她的戀愛＝「她還沒有那樣看你（人物頁的戀愛條滿了就可以約）」；還不是朋友＝照舊「還沒熟到可以兩個人出去」
// 修改前 2、3、4、5 FAIL。用法：node tests/rom_stage_text_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/events.js','src/social3d.js','src/data/date_locations.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const has=typeof DATE!=='undefined'&&typeof DATE.progress==='function';
let G=null; const fresh=()=>{ G={day:40,hour:12,flags:{},events:{done:{},last:{},count:0},rel:{},social:null,dateLog:{}}; SOCIAL.bind(G); };
const set=(id,o)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:0,trust:0,comf:0,rom:0,npcRom:0},o); };
const P=id=>has?DATE.progress(G,id):null;
const H='heroine_02';
fresh(); set(H,{fam:10}); let p=P(H);
fresh(); set(H,{fam:50,trust:30,npcRom:10}); p=P(H);
check('1. 朋友、她的戀愛 10（1/3）：照舊「她還沒有那樣看你」',!!p&&p.rom.hint==='她還沒有那樣看你',JSON.stringify(p));
set(H,{fam:50,trust:30,npcRom:20}); p=P(H);
check('2. 朋友、她的戀愛 20（2/3）：「她好像開始在意你了」',!!p&&p.rom.hint==='她好像開始在意你了',JSON.stringify(p));
set(H,{fam:70,trust:50,comf:45,npcRom:50,rom:20}); p=P(H);
check('3. 好朋友、第 5 階、祐廷的戀愛 20／30：「你好像開始在意她了」',!!p&&p.rom.hint==='你好像開始在意她了',JSON.stringify(p));
set(H,{fam:70,trust:50,comf:45,npcRom:60,rom:35}); G.dateLog[H]={count:2,wishKnown:false,wish:false}; p=P(H);
const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
check('4. 第 6 階：mood「你們之間有點曖昧」，hint 照舊；game3d.js 把 mood 印出來',!!p&&p.rom.mood==='你們之間有點曖昧'&&p.rom.hint==='再多一些兩個人出去的時間'&&/b\.mood\?'<div[^']*'\+esc\(b\.mood\)/.test(g),JSON.stringify(p));
set(H,{fam:50,trust:30,npcRom:10}); const a=DATE.canAskCore(G,H); set(H,{fam:25,npcRom:10}); const b=DATE.canAskCore(G,H);
check('5. 出去玩：朋友以上差她的戀愛＝說清楚；還不是朋友＝照舊',!a.ok&&a.why==='她還沒有那樣看你（人物頁的戀愛條滿了就可以約）'&&!b.ok&&b.why==='還沒熟到可以兩個人出去',JSON.stringify([a,b]));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

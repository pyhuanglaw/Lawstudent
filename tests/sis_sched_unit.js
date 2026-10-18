// 學姊照作息出現（AA_284 1-2）——不需要瀏覽器。用法：node tests/sis_sched_unit.js
//   總圖、Café 的舊固定生成改成照作息（schedFor）；萬才館大廳 15:12～17 的固定生成拿掉；2026-02-01～02-22 在家（不在學校）；週末不在總圖
// 修改前：總圖每天 9～17、Café 每天 19～23、萬才館每天 15:12～17 都會生出她（週三晚上同時在法圖和 Café、2/2 筆試當天坐在總圖）
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|SOCIAL|CALENDAR|STORY|STORY_EVENTS|SMALLTALK|EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{constructor(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0;}}}; global.document={getElementById:()=>null,addEventListener(){}}; global.P3={CAST:{}};
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const dayOf=k=>STORY.dayOfKey(k);
const at=(k,hr)=>{ const d=dayOf(k); const G={day:d,hour:hr,weekday:CALENDAR.dateOf(d).wd%7,stage:'law',flags:{afternoonDone:true},social:null,events:{done:{},last:{}}}; SOCIAL.bind(G); return STORY.schedEnt(CHARACTERS.heroine_05,G); };
const z=e=>e?(e.zone||('out:'+e.away)):null;
check('平日（週一）10:00 在總圖', z(at('2025-10-06',10))==='library', z(at('2025-10-06',10)));
check('週六 14:00 不在總圖', z(at('2025-10-11',14))!=='library', z(at('2025-10-11',14)));
check('週三 20:00 在法圖（不是 Café）', z(at('2025-10-08',20))==='lawlib', z(at('2025-10-08',20)));
check('週二 20:00 在 Café', z(at('2025-10-07',20))==='cafe', z(at('2025-10-07',20)));
check('2/2（一）筆試當天 10:00：在家', z(at('2026-02-02',10))==='out:在家', z(at('2026-02-02',10)));
check('2/22 還在家、2/23（開學）回總圖', z(at('2026-02-22',10))==='out:在家'&&z(at('2026-02-23',10))==='library', z(at('2026-02-22',10))+' / '+z(at('2026-02-23',10)));
const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
check('總圖、Café 的舊生成改讀作息（sisEnt）', /zoneId==='library'\)\{ const seats=E\.zone\.seats; const se=sisEnt\('library'\)/.test(src)&&/const se=sisEnt\('cafe'\)/.test(src));
check('萬才館大廳的固定生成拿掉', !/spawnNPC\('sis',C\.sis,4,-5/.test(src));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);

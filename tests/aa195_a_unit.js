// AA_195 4-7 的 A 類（大一上盤點，開學改 9/1 以後的時間依賴；AA-B 2026-10-16 6fd71f3b）——不需要瀏覽器。
// A1 閒聊階梯 dayMin 從主線第一天算；A2 termDay 找得到大一第 1、2 週；A3 法律系換日標題寫日期；A4 芷若 Z2 第 4 週週五起；A5 考前宵夜第 7～8 週；
// A6 campusMorning 主線第 2 天 12:30 以後；A7 小語溫州街作息要 afternoonDone；A8 隨機句「周老師點過的那個」要 afternoonDone；A9 芯慈借筆記第 7 週起。
// 用法：node tests/aa195_a_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.document={getElementById:()=>null,addEventListener(){}}; global.location={search:''}; global.navigator={userAgent:'node'};
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'global.$1='),{filename:f});
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }}; global.P3={CAST:{}};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, D=k=>{ const [y,m,d]=k.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
check('A1 閒聊階梯的 dayMin 用 S.mainDay',/if\(e\.dayMin&&S\.mainDay\(G\)<e\.dayMin\) return false;/.test(st));
check('A2 termDay 找得到大一上第 1 週週一（9/1）、第 2 週週四（9/11）',STORY.termDay('Y1S1',1,1)===D('2025-09-01')&&STORY.termDay('Y1S1',2,4)===D('2025-09-11'),STORY.termDay('Y1S1',1,1)+' '+STORY.termDay('Y1S1',2,4));
check('A2 經濟系那一年照舊找得到',STORY.termDay('Y0S1',1,1)===D('2024-09-02'));
check('A3 法律系換日標題寫日期：第 1 天＝9 月 17 日、9/4＝9 月 4 日',STORY.dayTitle({day:1})==='9 月 17 日'&&STORY.dayTitle({day:D('2025-09-04'),stage:'law'})==='9 月 4 日');
{ const e=ev('ev_zhiruo_ge_group'); check('A4 芷若 Z2：第 4 週起的週五（minWeek Y1S1 4），沒有 day_min',e&&!e.day_min&&e.minWeek&&e.minWeek.term==='Y1S1'&&e.minWeek.week===4&&JSON.stringify(e.weekday)==='[5]'); }
{ const e=ev('ev_midnight_snack'); check('A5 考前宵夜：第 7～8 週，沒有 day_min',e&&!e.day_min&&JSON.stringify(e.weeks)==='[7,8]'); }
check('A6 campusMorning：主線第 2 天 12:30 以後才演',/S\.mainDay\(G\)===2&&!F\.classDone&&!F\.campusIntro&&h\(G\)>=12\.5/.test(st));
check('A7 小語溫州街的作息要 afternoonDone',/hr>=19&&hr<21\.5&&F\.afternoonDone\)\{ GM\.spawnNPC\('yu'/.test(st));
check('A8 一般同學隨機句「周老師點過的那個」只在 afternoonDone 以後',/if\(F0\.afternoonDone\) L\.push\('「欸，你是周老師點過的那個。」'\)/.test(st)&&!/'「欸，你是周老師點過的那個。」'\]\[\(Math\.random\(\)\*3\)\|0\]/.test(st));
{ const e=ev('ev_xinci_notes'); check('A9 芯慈借筆記：第 7 週起',e&&e.minWeek&&e.minWeek.term==='Y1S1'&&e.minWeek.week===7); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

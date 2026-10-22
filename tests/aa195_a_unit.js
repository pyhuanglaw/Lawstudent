// AA_195 4-7 的 A 類（大一上盤點，開學改 9/1 以後的時間依賴；AA-B 2026-10-16 6fd71f3b）——不需要瀏覽器。
// A1 閒聊階梯 dayMin 從主線第一天算；A2 termDay 找得到大一第 1、2 週；A3 法律系換日標題寫日期；A4 芷若 Z2 第 4 週週五起；A5 考前宵夜第 7～8 週；
// A6 campusMorning 主線第 2 天 12:30 以後；A7 Alison 溫州街作息要 afternoonDone；A8 隨機句「周老師點過的那個」要 afternoonDone；A9 芯慈借筆記第 7 週起。
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
check('A7 Alison 溫州街的作息要 afternoonDone',/hr>=19&&hr<21\.5&&F\.afternoonDone\)\{ GM\.spawnNPC\('yu'/.test(st));
check('A8 一般同學隨機句「周老師點過的那個」只在 afternoonDone 以後',/if\(F0\.afternoonDone\) L\.push\('「欸，你是周老師點過的那個。」'\)/.test(st)&&!/'「欸，你是周老師點過的那個。」'\]\[\(Math\.random\(\)\*3\)\|0\]/.test(st));
{ const e=ev('ev_xinci_notes'); check('A9 芯慈借筆記：第 7 週起',e&&e.minWeek&&e.minWeek.term==='Y1S1'&&e.minWeek.week===7); }
check('A10 新局的錢 7,000（帳戶約 5,000＋錢包約 2,000）、allowanceMonth＝8（9/1 照常匯）；經濟系轉過來的不動',/F\.allowanceMonth=S\.dateOf\(d\)\.m; F\.LAW_RECAP_SEEN=true; if\(!o\.econ\) G\.money=7000;/.test(st)&&STORY.dateOf(D('2025-08-29')).m===8);
{ const civ=COURSES.list?COURSES.list.find(c=>c.id==='civ_general'):null; const all=(COURSES.list||COURSES.courses||[]); const c1=all.find(c=>c.id==='civ_general'), e1=all.find(c=>c.id==='econ_principles_1');
  check('A11 民總「網拍相機」、重修經原「第一次走進這門課」的 specials 搬到第 1 週',c1&&e1&&c1.specials.some(q=>q.w===1&&q.title==='網拍相機')&&!c1.specials.some(q=>q.w===3)&&e1.specials.some(q=>q.w===1&&q.title==='第一次走進這門課')); }
{ const a=ACTIVITIES.list.find(x=>x.id==='lib_tour_y1s1'); const Gw1={day:1,flags:{LAW_START_DAY:-18,MAIN_D1:-13}}, Gold={day:1,flags:{}};
  const on=(G,k)=>ACTIVITIES.on(a,D(k),G);
  check('A12 總圖新生導覽：開學改 9/1 的局在第 2 週（9/8、9/10、9/12、9/16），9/19 以後沒有',on(Gw1,'2025-09-08')&&on(Gw1,'2025-09-10')&&on(Gw1,'2025-09-12')&&on(Gw1,'2025-09-16')&&!on(Gw1,'2025-09-19'));
  check('A12 舊局照舊 9/19、9/23、9/25、9/26（舊存檔不會因為提早而錯過）',on(Gold,'2025-09-19')&&on(Gold,'2025-09-26')&&!on(Gold,'2025-09-08')); }
{ const e=ev('ev_zhe_long_table'); const W1={day:D('2025-09-11'),flags:{LAW_START_DAY:-18,MAIN_D1:-13}}, W1b={day:D('2025-09-09'),flags:{LAW_START_DAY:-18,MAIN_D1:-13}}, OLD={day:2,flags:{}}, OLD4={day:D('2025-09-25'),flags:{}};
  check('A13 阿哲長桌：新局第 2 週週四（9/11）起、9/9 還不行；舊局照舊第 4 週週四（9/25）起，主線第二天（9/18）不會撞',e.prereq.custom(W1)&&!e.prereq.custom(W1b)&&!e.prereq.custom(OLD)&&e.prereq.custom(OLD4)); }
{ const e=ev('ev_yu_breakfast'); check('A14 Alison 早餐：大一上第 2～5 週',JSON.stringify(e.weeks)==='[2,3,4,5]'&&JSON.stringify(e.term)==='["Y1S1"]'); }
check('A7 同理：新局 9/4 下午以前 Alison 不在傅鐘長椅（舊局照舊）',/G\.weekday>=1&&G\.weekday<=5&&\(F\.afternoonDone\|\|!S\.week1Start\(G\)\)\)\{ GM\.spawnNPC\('yu'/.test(st));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

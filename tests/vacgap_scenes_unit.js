// 假期空白（BB198-VACB22）第二批：AA_928 當面的幾場——阿凱 203 的寒假晚上（1-1）、帶回 203 修的筆電（1-2，LAWWW-C 11-13 選 B：沒有電腦行）、宜蘭的餅兩版（1-4）、明軒寒訓（2-1）。
// 用法：node tests/vacgap_scenes_unit.js
// 檢查：日子、時間、地點、誰在場對了才演，不對就不演；演出來的字＝AA 稿（vacgap_lines.js）；之後的招呼一天一句輪流；兩版只演一版；明軒寒訓的作息（SCHED_X）只在那幾天。
// 修改前（dd63a41a10）：沒有這幾場，全部 FAIL。
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
let loadErr=''; for(const f of ['src/data/vacgap_lines.js','src/vacgap3d.js']){ try{ loadG(f); }catch(e){ loadErr+=f+'：'+(e&&e.message||e)+'　'; } }
const L=VACGAP_LINES, D=H.D, ev=id=>STORY_EVENTS.find(e=>e.id===id);
check('0. 四場都在 STORY_EVENTS',!loadErr&&['ev_kai_winter_203','ev_kai_shop_visit_Y1W','ev_kai_shop_visit_Y1S','ev_kai_back_y1s2','ev_kai_back_y1s2_later'].every(id=>!!ev(id)),loadErr);
const wd=d=>CALENDAR.dateOf(d).wd%7;
const at=(key,h,zone)=>{ H.G.day=D(key); H.G.hour=h; H.G.weekday=wd(H.G.day); if(zone) H.G.zone=zone; };
const start=(key,h,zone,fl)=>{ H.fresh(key,h,zone||'dorm',Object.assign({DORM_FOUR:true,MET_KAI:true},fl||{})); H.FAMILIAR('kai'); };
const ok=id=>EVENTS.check(ev(id));
const said=()=>H.said.map(s=>s.t);
const lineTexts=arr=>arr.filter(x=>x.text).map(x=>x.text);
(async()=>{
  // ===== 1-1 寒假的 203 =====
  start('2026-01-12',21.5);
  check('1-1 1/12（一）21:30 在 203、阿凱在房間（dormWho）＝演',ok('ev_kai_winter_203'),J(STORY.dormWho(H.G)));
  at('2026-01-09',21.5); check('1-2 1/9（還沒到 1/10）＝不演',!ok('ev_kai_winter_203'));
  at('2026-01-12',20); check('1-3 20:00＝不演',!ok('ev_kai_winter_203'));
  at('2026-01-12',21.5,'campus'); check('1-4 人不在宿舍＝不演',!ok('ev_kai_winter_203'));
  at('2026-02-15',21.5,'dorm'); check('1-5 阿凱回宜蘭那幾天（2/13～2/20）＝不演（他不在房間）',!ok('ev_kai_winter_203'));
  start('2026-01-12',21.5,'dorm',{DORM_FOUR:false}); check('1-6 不是四人房（舊存檔）＝不演（台詞寫阿哲、柏翰的床）',!ok('ev_kai_winter_203'));
  start('2026-03-02',21.5); check('1-7 大一下（不是寒假）＝不演',!ok('ev_kai_winter_203'));
  start('2026-01-12',21.5); H.picks=['要。']; await EVENTS.run(ev('ev_kai_winter_203'));
  check('1-8 演出來的字＝AA_928 1-1（選「要。」那一支）',J(said())===J(['（阿哲跟柏翰的床都只剩床墊。房間一下子大了很多。）','（頭沒回）泡麵要不要。我煮兩包了。','（他把一碗推到你書桌上，筷子插在麵上。）','蛋只有一顆，給你。','（吃到一半，他看了一眼你桌上那盞檯燈。）','你那盞燈閃很久了。','（他拿了一支小螺絲起子，蹲在你桌子底下弄了兩分鐘。燈不閃了。）','接觸不良。……不算修，只是轉緊。','（他回到螢幕前面。房間只剩他打字的聲音。）']),J(said()));
  check('1-9 記 KAI_W203_DAY、只演一次',H.G.flags.KAI_W203_DAY===D('2026-01-12')&&!ok('ev_kai_winter_203'));

  // ===== 1-2 帶回 203 修的筆電 =====
  const tue=k=>{ let d=D(k); while(wd(d)!==2) d++; return CALENDAR.dateOf(d).key; };
  start(tue('2025-12-23'),19.5); check('1-2-1 大一寒假 1/10 以前的週二 19:30、203、阿凱在＝演',ok('ev_kai_shop_visit_Y1W'),CALENDAR.dateOf(H.G.day).key+' '+J(STORY.dormWho(H.G)));
  at(tue('2025-12-23'),18.5); check('1-2-2 19:00 以前＝不演',!ok('ev_kai_shop_visit_Y1W'));
  { let d=D(tue('2025-12-23'))-1; at(CALENDAR.dateOf(d).key,19.5); check('1-2-3 週一（他不打工）＝不演',!ok('ev_kai_shop_visit_Y1W')); }
  start(tue('2026-01-12'),19.5); check('1-2-4 1/10 以後、1-1 還沒演＝不演（1-1 先）',!ok('ev_kai_shop_visit_Y1W'));
  H.G.events.done.ev_kai_winter_203=true; H.G.flags.KAI_W203_DAY=H.G.day; check('1-2-5 1-1 同一晚演過＝不連演',!ok('ev_kai_shop_visit_Y1W'));
  H.G.flags.KAI_W203_DAY=H.G.day-1; check('1-2-6 1-1 前一晚演過＝演',ok('ev_kai_shop_visit_Y1W'));
  H.picks=['店裡不能修嗎？']; await EVENTS.run(ev('ev_kai_shop_visit_Y1W'));
  check('1-2-7 字＝AA_928 1-2（BB_452 改字：「可以啊。可是店裡很吵，這裡只有你。」）',J(said())===J([L.kaiRepair203[0].text,L.kaiRepair203[1].text,'可以啊。可是店裡很吵，這裡只有你。',L.kaiRepair203[L.kaiRepair203.length-1].text]),J(said()));
  check('1-2-8 一個假期一場',!ok('ev_kai_shop_visit_Y1W'));
  const g0=VACGAP.kaiRepairGreet(H.G); H.G.day++; const g1=VACGAP.kaiRepairGreet(H.G), g1b=VACGAP.kaiRepairGreet(H.G); H.G.day++; const g2=VACGAP.kaiRepairGreet(H.G);
  check('1-2-9 之後的招呼：當天沒有；隔天起一天一句、輪流',g0===null&&g1===L.kaiRepairAfter[0]&&g1b===null&&g2===L.kaiRepairAfter[1],J([g0,g1,g1b,g2]));
  { H.said=[]; let base=0; const k0=STORY.kaiDormTalk; H.G.day++; await STORY.kaiDormTalk(GM,{name:'阿凱'}); check('1-2-10 和阿凱說話（talkKai → kaiDormTalk）說那一句',H.has(L.kaiRepairAfter[2])); }
  start('2026-07-12',12); at(tue('2026-07-14'),20); check('1-2-11 大一暑假也有一場（_Y1S）',ok('ev_kai_shop_visit_Y1S')&&!ok('ev_kai_shop_visit_Y1W'),J(STORY.dormWho(H.G)));
  start('2027-01-05',12); at(tue('2027-01-05'),20); check('1-2-12 大二寒假（他住別棟）＝沒有',!ok('ev_kai_shop_visit_Y1W')&&!ok('ev_kai_shop_visit_Y1S'));

  // ===== 1-4 宜蘭的餅 =====
  start('2026-02-20',22.5); check('1-4-1 2/20 22:30 在 203＝他進門那一版',ok('ev_kai_back_y1s2')&&!ok('ev_kai_back_y1s2_later'));
  at('2026-02-20',21); check('1-4-2 22:00 以前＝不演',!ok('ev_kai_back_y1s2'));
  await (async()=>{ at('2026-02-20',22.5); await EVENTS.run(ev('ev_kai_back_y1s2')); })();
  check('1-4-3 字＝AA_928 1-4 第一版；之後不演第二版',J(said())===J(lineTexts(L.kaiBackIn))&&(at('2026-02-21',20),!ok('ev_kai_back_y1s2_later')),J(said()));
  start('2026-02-21',20); check('1-4-4 2/20 晚上不在房間：2/21 回 203（阿凱在）＝第二版',ok('ev_kai_back_y1s2_later')&&!ok('ev_kai_back_y1s2'),J(STORY.dormWho(H.G)));
  await EVENTS.run(ev('ev_kai_back_y1s2_later')); check('1-4-5 第二版的字',J(said())===J(lineTexts(L.kaiBackLater)));
  start('2026-03-05',20); check('1-4-6 大一下第 1 週以後＝不補',!ok('ev_kai_back_y1s2_later'));

  // ===== 2-1 明軒寒訓 =====
  start('2025-12-29',15,'gym'); H.FAMILIAR('classmate_mingxuan');
  const c=CHARACTERS.classmate_mingxuan, s1=VACGAP.sched(c,H.G); at('2025-12-30',15,'gym'); const s2=VACGAP.sched(c,H.G); at('2026-01-26',15,'gym'); const s3=VACGAP.sched(c,H.G); at('2025-12-29',17.5,'gym'); const s4=VACGAP.sched(c,H.G);
  check('2-1-1 作息：12/29（一）15:00 在新體育館；週二、1/26 以後、17:00 以後＝沒有',!!s1&&s1.zone==='gym'&&!s2&&!s3&&!s4&&STORY.SCHED_X.includes(VACGAP.sched));
  at('2025-12-29',15,'gym'); await VACGAP.preTalk(GM,{name:'明軒'},'classmate_mingxuan'); const a=said().slice(); H.said=[];
  await VACGAP.preTalk(GM,{name:'明軒'},'classmate_mingxuan'); const b=said().slice(); H.said=[];
  at('2025-12-31',15,'gym'); await VACGAP.preTalk(GM,{name:'明軒'},'classmate_mingxuan'); const cc=said().slice();
  check('2-1-2 第一次兩句；同一天不再說；下一次（12/31）一句旁白',J(a)===J(L.mxGym)&&!b.length&&J(cc)===J([L.mxGymAgain]),J([a,b,cc]));
  H.done();
})();

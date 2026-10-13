// 事件介面的五種狀況（使用者 2026-10-13 要 LAWWW 檢查；AA_107 第 10-1 節）——不需要瀏覽器。用的是測試事件，遊戲裡的事件資料不動。
//   1. 一次性與冷卻：once、cooldown_days、max_times；事件演到一半出錯，這次遊戲不再重試（不會每半秒重演同一個壞掉的事件）
//   2. 同一個地方、不同學期：term＋location＋room，同一間教室依學期觸發不同事件；寒暑假都不觸發
//   3. 關係與既有選擇：flags／notFlags、旗標的值 flagIs（BB_105 P4 的 ECON_PAST_SHARED：full／half／none）、關係數值 rel、記憶、choice、已發生的事件、上課出席 course
//   4. 跳過時間、快速前往：時間窗過了就是錯過（不補演）；到的時候已經過了時間窗也不演；同時符合好幾個事件時，靠 tier 不會一次全部演完
//      （短篇：同一棟一次進入最多一個、同一天全校最多兩個；重要：同一棟一學期最多一個——BB_105 第 1 節、AA_107 第 9 節第 5 項）
//   5. 演講到場：坐下來「聽演講」才記到場（G.acts.att）；沒去的人不會觸發「聽完以後」的事件，會觸發「沒去」的事件；舊存檔沒有到場紀錄也不會壞
// 用法：node tests/events_interface_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|ACTIVITIES|EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/classes3d.js','src/events3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const firstDayOf=(term,week)=>{ for(let d=1;d<2000;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&(!week||t.week===week)&&!CALENDAR.holiday(d)) return d; } return null; };
// ---- 測試用的遊戲狀態（GM 只放事件引擎用得到的東西）----
const G={day:1,hour:10,zone:'boya',weekday:3,flags:{},choices:{},events:{done:{},last:{},count:0},name:'祐廷'}; let room='101';
const rel={heroine_01:{fam:10,trust:5,comf:5}}, mem={};
global.SOCIAL={STAGES:['stranger','acquaint','friend','close'],GRAD:['none','curious','serious'],stage:()=> 'acquaint',rel:id=>rel[id]||{fam:0,trust:0,comf:0},has:(npc,tag)=>!!(mem[npc]&&mem[npc][tag]),meet(){},remember(npc,tag){ (mem[npc]=mem[npc]||{})[tag]=1; },adjust(){},displayName:id=>id,profEvent(){},gradSet(){},gradBump(){}};
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){}}; global.CHAR={setExpr(){}};
let said=[];
const GM={G,E:{player:{busy:false,obj:{position:{x:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>room,seats:[]},npcs:[]},D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},
  advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),
  say:async(who,t)=>{ if(t==='BOOM') throw new Error('測試用的錯誤'); said.push(t); },choose:async()=>0};
STORY_EVENTS=[]; global.STORY_EVENTS=STORY_EVENTS;
EVENTS.bind(GM);
const ev=(o)=>Object.assign({trigger:'auto',dialogue:[{speaker:'narrator',text:o.id}]},o);
const runEv=async(e)=>{ await EVENTS.run(e); };
const zc=z=>{ if(EVENTS.zoneChanged) EVENTS.zoneChanged(z); };   // 換區域（修改前的引擎沒有這個：測試照樣跑完，看哪幾項失敗）
const atSeat=(G,z,r)=>ACTIVITIES.atSeat?ACTIVITIES.atSeat(G,z,r):undefined;
const quiet=async fn=>{ const ce=console.error; console.error=()=>{}; try{ return await fn(); } finally { console.error=ce; } };   // 故意出錯的事件：不要把錯誤訊息印出來
(async()=>{
  // ---------- 1. 一次性與冷卻 ----------
  { G.day=10; G.hour=10; const once=ev({id:'t_once',once:true,location:'boya'}); STORY_EVENTS.push(once);
    check('1 一次性：還沒演之前符合條件',EVENTS.check(once));
    await runEv(once); check('1 一次性：演過一次（G.events.done 記一次、last 記第幾天）之後不再觸發',G.events.done.t_once===1&&G.events.last.t_once===10&&!EVENTS.check(once));
    const cd=ev({id:'t_cd',cooldown_days:3,location:'boya'}); await runEv(cd);
    const seen=[]; for(const d of [10,11,12,13]){ G.day=d; seen.push(EVENTS.check(cd)?1:0); } check('1 冷卻 3 天：第 10 天演過 → 第 11、12 天不行、第 13 天可以',seen.join('')==='0001',seen.join(''));
    G.day=20; const mx=ev({id:'t_max',max_times:2,location:'boya'}); await runEv(mx); await runEv(mx); check('1 最多 2 次：演兩次之後不再觸發',G.events.done.t_max===2&&!EVENTS.check(mx));
    const bad=ev({id:'t_bad',location:'boya',dialogue:[{speaker:'narrator',text:'BOOM'}]}); await quiet(()=>runEv(bad));
    check('1 事件演到一半出錯：不記成演過、這次遊戲不再重試（不會每半秒重演）',!G.events.done.t_bad&&(EVENTS.failed||{}).t_bad===true&&!EVENTS.check(bad));
    check('1 一次性的紀錄在 G.events 裡（跟著存檔）；出錯的紀錄不存檔（EVENTS.failed 不在 G 裡）',JSON.stringify(G).includes('"t_once":1')&&!JSON.stringify(G).includes('t_bad')); }
  // ---------- 2. 同一個地方、不同學期 ----------
  { const y1=firstDayOf('Y1S1',5), y2=firstDayOf('Y2S1',5), brk=dayOf('2026-02-10'); G.zone='putong'; room='101'; G.hour=11;
    const a=ev({id:'t_term_y1',location:'putong',room:'101',term:['Y1S1']}), b=ev({id:'t_term_y2',location:'putong',room:'101',term:['Y2S1']});
    const pick=d=>{ G.day=d; return [a,b].filter(e=>EVENTS.check(e)).map(e=>e.id).join(','); };
    check('2 同一間（普通 101）：大一上只有大一上的事件',pick(y1)==='t_term_y1',pick(y1)); check('2 同一間：大二上換成大二上的事件',pick(y2)==='t_term_y2',pick(y2));
    check('2 寒假（不在學期中）：兩個都不觸發',CALENDAR.termOf(brk)===null&&pick(brk)==='',String(CALENDAR.termOf(brk)));
    G.day=y1; room='102'; check('2 學期對、但人在隔壁 102：不觸發（room 條件）',!EVENTS.check(a)); room='101'; G.zone='boya'; check('2 學期對、但在別棟（博雅）：不觸發（location 條件）',!EVENTS.check(a)); }
  // ---------- 3. 關係與既有選擇 ----------
  { G.zone='putong'; G.day=firstDayOf('Y1S1',6); G.hour=10; const P3=(prereq)=>EVENTS.check(ev({id:'t_p3',location:'putong',prereq}));
    G.flags.ECON_PAST_SHARED='half';
    check('3 旗標有沒有設（flags）：ECON_PAST_SHARED 設過（不管值）就成立',P3({flags:['ECON_PAST_SHARED']})&&!P3({notFlags:['ECON_PAST_SHARED']}));
    check('3 旗標的值（flagIs）：half 時「說了一半以上」的事件成立、「完全沒說」的不成立',P3({flagIs:{ECON_PAST_SHARED:['full','half']}})&&!P3({flagIs:{ECON_PAST_SHARED:'none'}}));
    G.flags.ECON_PAST_SHARED='none'; check('3 旗標的值：none 時反過來',!P3({flagIs:{ECON_PAST_SHARED:['full','half']}})&&P3({flagIs:{ECON_PAST_SHARED:'none'}}));
    delete G.flags.ECON_PAST_SHARED; check('3 旗標的值：還沒選過（沒有這個旗標）時兩種都不成立',!P3({flagIs:{ECON_PAST_SHARED:['full','half']}})&&!P3({flagIs:{ECON_PAST_SHARED:'none'}}));
    check('3 關係數值（rel）：熟悉度 10 → 「至少 8」成立、「至少 12」不成立',P3({rel:{heroine_01:{fam:{min:8}}}})&&!P3({rel:{heroine_01:{fam:{min:12}}}}));
    SOCIAL.remember('heroine_01','LIBRARY_AFTERNOON'); check('3 記憶（memory／notMemory）',P3({memory:[{npc:'heroine_01',tag:'LIBRARY_AFTERNOON'}]})&&!P3({notMemory:[{npc:'heroine_01',tag:'LIBRARY_AFTERNOON'}]}));
    G.choices.whyLaw='family'; check('3 之前的選擇（choice）',P3({choice:{whyLaw:'family'}})&&!P3({choice:{whyLaw:'hero'}}));
    check('3 已經發生的事件（events／notEvents）：t_once 演過',P3({events:['t_once']})&&!P3({notEvents:['t_once']}));
    G.courses={done:{},attend:{econ_principles_1:1},prep:{},electives:{},grades:{},note:{}}; check('3 上課出席（course）：重修經濟學原理上過 1 次 → 「至少 1 次」成立、「至少 3 次」不成立',P3({course:{econ_principles_1:{min:1}}})&&!P3({course:{econ_principles_1:{min:3}}}));
    G.courses.attend={}; check('3 上課出席：一次都沒上過 → 「至少 1 次」不成立',!P3({course:{econ_principles_1:{min:1}}})); }
  // ---------- 4. 跳過時間、快速前往 ----------
  { const d=firstDayOf('Y1S1',7); G.day=d; G.zone='boya'; room='study'; G.hour=11;
    const win=ev({id:'t_win',location:'boya',time:[12,13],once:true}); STORY_EVENTS.length=0; STORY_EVENTS.push(win);
    check('4 時間窗 12:00–13:00：11:00 還不觸發',!EVENTS.check(win));
    G.hour=14; EVENTS.tick(1); await new Promise(r=>setTimeout(r,0)); check('4 從 11:00 跳到 14:00（跳過時間）：時間窗過了＝錯過，不補演',!G.events.done.t_win&&!EVENTS.check(win));
    G.day=d+7; G.hour=12.5; check('4 下一次符合時間窗（另一天 12:30）照樣可以演（只演一次的事件只是還沒演過）',EVENTS.check(win));
    // 快速前往：12:50 在校園、走 15 分鐘到博雅 → 13:05 才到
    G.day=d+8; G.zone='campus'; G.hour=12+50/60; const enter=ev({id:'t_enter',trigger:'enter',location:'boya',time:[12,13]}); STORY_EVENTS.length=0; STORY_EVENTS.push(enter);
    GM.advance(15/60); G.zone='boya'; zc('boya'); const r=EVENTS.onEnter('boya'); check('4 快速前往：12:50 出發、13:05 才到博雅——時間窗已經過了，到的時候不觸發',r===false&&!G.events.done.t_enter);
    G.day=d+9; G.zone='campus'; G.hour=12.2; GM.advance(10/60); G.zone='boya'; zc('boya'); const r2=EVENTS.onEnter('boya'); await new Promise(r=>setTimeout(r,0));
    check('4 快速前往：12:22 到博雅（時間窗內）→ 進門時觸發一次',r2===true&&G.events.done.t_enter===1);
    check('4 在錯的地方不觸發：同一個事件，人在校園',(()=>{ G.zone='campus'; const ok=!EVENTS.check(enter); G.zone='boya'; return ok; })());
    // 同時符合好幾個短篇事件：一次進入最多一個、同一天最多兩個
    const D0=firstDayOf('Y1S2',3); G.day=D0; G.hour=15; G.zone='boya'; zc('boya');
    const sh=[1,2,3].map(i=>ev({id:'t_short'+i,tier:'short',location:'boya',once:true})); const plain=ev({id:'t_plain',location:'boya',once:true}); STORY_EVENTS.length=0; STORY_EVENTS.push(...sh,plain);
    const tickAll=async()=>{ const out=[]; for(let k=0;k<6;k++){ const before=G.events.count; EVENTS.tick(1); await new Promise(r=>setTimeout(r,0)); if(G.events.count>before) out.push(Object.keys(G.events.done).filter(id=>id.startsWith('t_short')||id==='t_plain').length); } return out; };
    await tickAll(); const ran1=sh.filter(e=>G.events.done[e.id]).length;
    check('4 三個短篇事件同時符合：一次進入只演一個（另外兩個不會接著演）；沒有層次的事件不受限',ran1===1&&G.events.done.t_plain===1,`短篇演了 ${ran1} 個`);
    zc('campus'); G.zone='campus'; zc('boya'); G.zone='boya'; await tickAll(); const ran2=sh.filter(e=>G.events.done[e.id]).length;
    zc('campus'); zc('boya'); await tickAll(); const ran3=sh.filter(e=>G.events.done[e.id]).length;
    check('4 出去再進來：可以再演一個；同一天第三個不演（全校一天最多兩個）',ran2===2&&ran3===2,`${ran2}／${ran3}`);
    G.day=D0+1; zc('boya'); await tickAll(); check('4 隔天：第三個短篇照樣可以演（不會因為昨天的上限永遠演不到）',sh.every(e=>G.events.done[e.id]));
    // 重要事件：同一棟一學期最多一個
    const mj=[1,2].map(i=>ev({id:'t_major'+i,tier:'major',location:'boya',once:true})); STORY_EVENTS.length=0; STORY_EVENTS.push(...mj);
    await runEv(mj[0]); check('4 重要事件：同一棟（博雅）同一學期演過一個之後，另一個要等下學期',!EVENTS.check(mj[1]));
    const mo=ev({id:'t_major_other',tier:'major',location:'putong',once:true}); G.zone='putong'; check('4 重要事件：別棟（普通）不受博雅的限制',EVENTS.check(mo)); G.zone='boya';
    G.day=firstDayOf('Y2S1',2); check('4 重要事件：下一個學期就可以',EVENTS.check(mj[1]));
    const save=JSON.parse(JSON.stringify(G)); check('4 上限的紀錄在 G.events.cap（跟著存檔）',!!(save.events.cap&&save.events.cap.major&&Object.values(save.events.cap.major).includes('t_major1'))); }
  // ---------- 5. 演講到場 ----------
  { ACTIVITIES.list=[{id:'t_lec',title:'政府可以為了大家，限制一個人嗎？（測試）',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',dates:['2026-04-23'],t0:18.5,t1:20.5}];
    const L=dayOf('2026-04-23'); G.day=L; G.zone='boya'; room='101'; delete G.acts;
    const after=ev({id:'t_after',location:'boya',room:'study',prereq:{attended:['t_lec']}}), told=ev({id:'t_told',location:'any',prereq:{missed:['t_lec']}});
    G.hour=17; check('5 舊存檔（沒有到場紀錄）：條件照常判斷、不會壞；還沒聽過 → 「聽完以後」不成立',!EVENTS.check(after)&&!G.acts);
    G.hour=18.2; check('5 開始前 18 分鐘：坐下還不能聽（太早）',atSeat(G,'boya','101')===null);
    G.hour=18.3; const a=atSeat(G,'boya','101'); check('5 開始前 15 分鐘起：坐在博雅 101 可以「聽演講」',!!a&&a.id==='t_lec');
    check('5 坐在別間（102）不能聽這一場',atSeat(G,'boya','102')===null);
    G.hour=19.6; check('5 過了一半（19:30 以後）才進去：不算聽過（不出現「聽演講」）',atSeat(G,'boya','101')===null);
    G.hour=20.0; room='study'; check('5 沒去的人：演講還沒結束，「沒去」也還不成立',!EVENTS.check(after)&&!EVENTS.check(told));
    G.hour=20.6; check('5 沒去的人：演講結束後「聽完以後」不成立、「沒去（由群組一句轉述）」成立',!EVENTS.check(after)&&EVENTS.check(told));
    G.day=L+1; G.hour=10; check('5 沒去的人：隔天也一樣',!EVENTS.check(after)&&EVENTS.check(told));
    // 這次有去：坐下 → 聽演講（classes3d.js 的 attendActivity：記到場、快轉到結束）
    G.day=L; G.hour=18.4; room='101'; said=[]; const lec=atSeat(G,'boya','101'); const ok=CLS.attendActivity?await CLS.attendActivity(GM,lec,{inScene:true}):false;
    check('5 聽演講：記下到場（G.acts.att）、時間快轉到 20:30 結束',ok&&ACTIVITIES.attended&&ACTIVITIES.attended(G,'t_lec',L)&&Math.abs(G.hour-20.5)<1e-6,JSON.stringify(G.acts)+' '+G.hour);
    check('5 聽演講：一般的場面（坐下、台上的題目）不寫劇情',said.length===1&&said[0].includes('政府可以為了大家'),said.join('｜'));
    room='study'; G.hour=20.6; check('5 有去的人：「聽完以後」成立、「沒去」不成立',EVENTS.check(after)&&!EVENTS.check(told));
    G.hour=18.4; room='101'; check('5 同一場聽過了：不會再出現「聽演講」',atSeat(G,'boya','101')===null);
    check('5 到場紀錄跟著存檔（JSON 來回一次還在）',!!ACTIVITIES.attended&&ACTIVITIES.attended(JSON.parse(JSON.stringify(G)),'t_lec'));
    G.acts={att:{}}; G.day=L+7; G.hour=10; check('5 「最近結束的那一場」：一週後也還記得那一場沒去（往回找）',!!ACTIVITIES.missed&&ACTIVITIES.missed(G,'t_lec')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });

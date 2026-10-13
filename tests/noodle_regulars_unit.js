// 麵店的固定客人（AA_110 第 6-3 節，AA 暫定：「週二、週四 17:30–19:00，阿鳳麵店裡固定有兩到四個法律系的一般同學」）——不需要瀏覽器。
// 使用者 2026-10-13 試玩：「沒事做的時間太長了」——AA：空的是下課以後；麵店是日程（每週固定的傍晚），不是活動。
// 檢查：上課日的週二、週四 17:30–19:00 才有（週三、放假、寒假沒有）；2～4 人、坐在東西兩張桌子（中間那張留給玩家和阿哲）、進店時已經坐著；
//   同一天出去再進來是同一批人坐同樣的位子；玩家在店裡時 17:30 到了是從門口走進來；跳過時間時直接坐好；19:00 起身走到門口才離開。
// 用法：node tests/noodle_regulars_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let built=0; global.CHAR={build:spec=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{spec,id:++built}}),setExpr(){}};
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
let G, E, GM;
const reset=(day,hour)=>{ G={day,hour,zone:'noodle',flags:{},weekday:CALENDAR.dateOf(day).wd%7,social:null};
  E={npcs:[],player:{obj:{position:{x:0,z:3.5}},busy:false},moveTo(n,x,z,cb){ n.path=[[x,z]]; n.onArrive=cb; return true; },removeNPC(n){ E.npcs=E.npcs.filter(m=>m!==n); },
     addNPC(n){ n.lv=n.lv|0; E.npcs.push(n); return n; }};
  GM={G,E,D:{active:false},standUp(n){ n.pose='idle'; n.idlePose='idle'; n.frozen=false; n.seat=null; },sitAt(n,s){ n.pose='sit'; n.seat=s; n.obj.position.set(s.x,0,s.z); },seatApproach:s=>[s.x,s.z+0.6]}; };
const regs=()=>E.npcs.filter(n=>n.ndlRegular);
const tueOf=w=>{ for(let d=1;d<200;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===w&&CALENDAR.dateOf(d).wd===2&&!CALENDAR.holiday(d)) return d; } return null; };
const thuOf=w=>{ for(let d=1;d<200;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===w&&CALENDAR.dateOf(d).wd===4&&!CALENDAR.holiday(d)) return d; } return null; };
check('STORY 有 noodleRegulars／noodleOn',typeof STORY.noodleRegulars==='function'&&typeof STORY.noodleOn==='function');
if(typeof STORY.noodleRegulars!=='function'){ console.log('FAILED '+fails); process.exit(1); }
// 週二 18:00 進店
const d1=tueOf(5); reset(d1,18.0); STORY.noodleRegulars(GM,true); const r1=regs();
check('週二 18:00 進店：2～4 位固定客人、坐著（進店時已經在吃）',r1.length>=2&&r1.length<=4&&r1.every(n=>n.pose==='sit'&&n.seat),r1.length+' 人');
check('坐在東西兩張桌子，中間那張（x=0）空著——留給玩家和阿哲',r1.every(n=>Math.abs(n.seat.x)===3),r1.map(n=>n.seat.x+','+n.seat.z).join(' '));
const sig1=r1.map(n=>n.ndlIdx+':'+n.seat.x+','+n.seat.z+':'+n.obj.userData.spec.id).join('|');
reset(d1,18.5); STORY.noodleRegulars(GM,true); const sig2=regs().map(n=>n.ndlIdx+':'+n.seat.x+','+n.seat.z+':'+n.obj.userData.spec.id).join('|');
check('同一天出去再進來：同一批人、同樣的位子',sig1===sig2,sig1+' / '+sig2);
check('週四也有',(()=>{ reset(thuOf(6),17.8); STORY.noodleRegulars(GM,true); return regs().length>=2; })());
check('週三沒有、週二 17:20 還沒有、19:05 已經沒有',(()=>{ reset(tueOf(5)+1,18); STORY.noodleRegulars(GM,true); const a=regs().length; reset(d1,17.33); STORY.noodleRegulars(GM,true); const b=regs().length; reset(d1,19.08); STORY.noodleRegulars(GM,true); return a===0&&b===0&&regs().length===0; })());
check('寒假（不是上課期間）的週二沒有',(()=>{ let d=null; for(let k=110;k<200&&!d;k++){ if(!CALENDAR.termOf(k)&&CALENDAR.dateOf(k).wd===2) d=k; } reset(d,18); STORY.noodleRegulars(GM,true); return regs().length===0; })());
// 玩家在店裡，17:30 到了
reset(d1,17.45); STORY.noodleRegulars(GM,true); const before=regs().length; G.hour=17.52; STORY.noodleRegulars(GM,false); const walk=regs();
check('玩家在店裡、17:30 到了：從門口走進來（站著、有路線），走到了才坐下',before===0&&walk.length>=2&&walk.every(n=>n.pose!=='sit'&&n.path&&Math.abs(n.obj.position.z-3.6)<0.01),walk.map(n=>n.pose+(n.path?'→':'')).join(','));
for(const n of walk){ n.onArrive&&n.onArrive(n); }
check('走到位子：坐下',regs().every(n=>n.pose==='sit'&&n.seat));
// 跳過時間
reset(d1,16.0); STORY.noodleRegulars(GM,true); G.hour=18.2; STORY.noodleRegulars(GM,false);
check('跳過時間到 18:12：直接坐好（不從門口走進來）',regs().length>=2&&regs().every(n=>n.pose==='sit'));
// 19:00 離開
G.hour=19.02; STORY.noodleRegulars(GM,false); const lv=regs();
check('19:00：起身走到門口（還在店裡、正在走，不是直接不見）',lv.length>=2&&lv.every(n=>n.leaving&&n.pose!=='sit'&&n.path),lv.map(n=>n.pose).join(','));
for(const n of lv){ n.onArrive&&n.onArrive(n); }
check('走到門口才離開',regs().length===0);
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

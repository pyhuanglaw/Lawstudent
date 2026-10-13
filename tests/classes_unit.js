// 課表與每日上課（D52：AA_103、AA_104）——不需要瀏覽器。
// 資料：每一門課的學期、星期、時段、地點、教授都對得上（教授在 characters.js、地點在 rooms）；同一學期（選修照預設）沒有撞課；AA_103 第 4 節的課表抽查；
// 日曆：第 1 天（週三，大一上第 3 週）的課、第二天（週四）民法總則是劇情課、週末與國定假日沒有課、考試週；
// 狀態：開始前 30 分鐘可以進教室、開始後 30 分鐘還沒來＝沒來、上過的＝done；教授上課時在教室、下課後在萬才館；
// 成績單：學期結束的第一個早上發一次（文字，不是分數）；校園的門口上課點（共同課程教室、體育館）站得住、從校門走得到。
// 用法：node tests/classes_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mkG=(day,hour)=>({day,hour,flags:{},weekday:CALENDAR.dateOf(day).wd%7});
// ---------- 資料 ----------
{ const L=COURSES.list, terms=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const bad=[]; for(const c of L){ if(!terms.includes(c.term)) bad.push(c.id+' 學期'); if(!COURSES.rooms[c.room]) bad.push(c.id+' 地點 '+c.room); if(c.prof&&!CHARACTERS[c.prof]) bad.push(c.id+' 教授 '+c.prof); if(c.prof&&!COURSES.profs[c.prof]) bad.push(c.id+' 教授名字');
    for(const s of c.slots){ if(!(s.wd>=1&&s.wd<=5)) bad.push(c.id+' 星期'); if(!COURSES.blocks[s.block]) bad.push(c.id+' 時段'); } if(!c.topics||!c.topics.length) bad.push(c.id+' 進度'); }
  check('每一門課的學期、星期、時段、地點、教授、進度都對得上（教授在 characters.js）',!bad.length,bad.slice(0,5).join(', '));
  const ids=L.map(c=>c.id); check('課程代號不重複（'+ids.length+' 門）',new Set(ids).size===ids.length&&ids.length>=45,ids.length+' 門');
  const G=mkG(1,8); const clash=[]; for(const t of terms){ const cs=CLS.termCourses(G,t); const used={}; for(const c of cs) for(const s of c.slots){ const k=s.wd+s.block; if(used[k]) clash.push(t+' '+CLS.WD[s.wd]+s.block+'：'+used[k]+'／'+c.name); used[k]=c.name; } }
  check('同一學期（選修照預設）沒有撞課',!clash.length,clash.join(' | '));
  for(const t of terms){ const n=CLS.termCourses(G,t).filter(c=>c.kind==='required').length; if(n<1) bad.push(t); } check('八個學期都有必修',terms.every(t=>CLS.termCourses(G,t).some(c=>c.kind==='required')));
  const cell=(t,wd,b)=>{ const c=CLS.termCourses(G,t).find(q=>q.slots.some(s=>s.wd===wd&&s.block===b)); return c?c.name+'｜'+(CLS.roomName(c)):'—'; };
  const want=[['Y1S1',1,'am','憲法｜霖澤館 201'],['Y1S1',1,'pm2','體育｜體育館'],['Y1S1',2,'am','大一國文｜共同課程教室'],['Y1S1',3,'am','刑法總則（一）｜霖澤館 201'],['Y1S1',4,'pm1','民法總則｜霖澤館 201'],['Y1S1',5,'pm1','法律與社會｜霖澤館 201'],
    ['Y2S1',2,'pm1','民法物權｜霖澤館 201'],['Y3S1',1,'am','民事訴訟法甲上｜霖澤館 201'],['Y3S1',4,'am','民事訴訟法甲上｜霖澤館 201'],['Y3S1',2,'am','刑事訴訟法｜霖澤館 201'],['Y3S1',5,'am','刑事訴訟法｜霖澤館 201'],['Y4S1',2,'pm1','法律倫理｜萬才館研討室']];
  const wbad=want.filter(([t,wd,b,w])=>cell(t,wd,b)!==w).map(([t,wd,b,w])=>t+CLS.WD[wd]+b+'：'+cell(t,wd,b)+'≠'+w); check('AA_103 第 4 節的課表抽查（12 格）',!wbad.length,wbad.join(' | '));
  const ex=CLS.termCourses(G,'Y1S2').map(c=>c.name); check('選修二選一照預設（大一下：法律與社會，不是經濟學原理）',ex.includes('法律與社會')&&!ex.includes('經濟學原理'),ex.join('、'));
  G.courses={electives:{Y1S2_elec:'econ'}}; const ex2=CLS.termCourses(G,'Y1S2').map(c=>c.name); check('選了經濟學原理：法律與社會不在課表上',ex2.includes('經濟學原理')&&!ex2.includes('法律與社會'),ex2.join('、')); }
// ---------- 日曆上的課 ----------
{ const names=(day)=>CLS.dayItems(mkG(day,8)).map(it=>CLS.hhmm(it.t0)+' '+it.c.name).join('、');
  check('第 1 天（9/17 週三）：09:10 刑法總則（一）',names(1)==='09:10 刑法總則（一）',names(1));
  check('第 2 天（週四）：09:10 大一英文、13:20 民法總則',names(2)==='09:10 大一英文、13:20 民法總則',names(2));
  const G2=mkG(2,8); check('第二天的民法總則是劇情課（story3d.js 處理），下一堂不是它',CLS.storyClass(G2,CLS.dayItems(G2)[1])&&CLS.next(mkG(2,12.5))===null,JSON.stringify(CLS.next(mkG(2,12.5))));
  check('第 3 天（週五）：13:20 法律與社會',names(3)==='13:20 法律與社會',names(3));
  check('週末沒有課',!CLS.dayItems(mkG(4,8)).length&&!CLS.dayItems(mkG(5,8)).length);
  check('國慶日（10/10 週五）沒有課',!CLS.dayItems(mkG(dayOf('2025-10-10'),8)).length);
  check('寒假（2026-01-14）沒有課',!CLS.dayItems(mkG(dayOf('2026-01-14'),8)).length);
  const ex=CLS.dayItems(mkG(dayOf('2025-10-22'),8)); check('第 8 週（期中考週）的課是考試',ex.length&&ex.every(it=>it.exam==='mid'),JSON.stringify(ex.map(i=>i.exam)));
  const y3=CLS.dayItems(mkG(dayOf('2027-09-09'),8)).map(it=>it.c.name).join('、'); check('大三上的週四：民訴甲上（第二格）、證券交易法',y3==='民事訴訟法甲上、證券交易法',y3); }
// ---------- 狀態、教授的位置、目標 ----------
{ const D=dayOf('2025-09-26');   /* 週五：13:20 法律與社會 */ const st=h=>{ const G=mkG(D,h); const it=CLS.dayItems(G)[0]; return CLS.status(G,it); };
  check('開始前 30 分鐘以前＝還沒開始；12:50～13:50＝可以進教室；13:50 以後＝沒來',st(12.5)==='upcoming'&&st(12.84)==='open'&&st(13.8)==='open'&&st(13.85)==='missed'&&st(16)==='missed',[st(12.5),st(12.84),st(13.8),st(13.85)].join(','));
  const G=mkG(D,13); const it=CLS.dayItems(G)[0]; CLS.rec(G).done[it.key]=1; check('上過的＝done（之後一直是 done）',CLS.status(G,it)==='done'&&CLS.status(Object.assign({},G,{hour:16}),it)==='done');
  const T=dayOf('2025-10-02');   /* 週四第 5 週：民法總則 */ const pw=h=>JSON.stringify(CLS.profWhere(mkG(T,h),'prof_zhou'));
  check('周教授：上課時（13:00～15:10）在 201、下課後 1.5 小時在萬才館、其他時間不在這兩個地方',pw(13)==='{"zone":"classroom","act":"class"}'&&pw(15.5)==='{"zone":"wancai","act":"office"}'&&pw(17)==='null'&&pw(10)==='null',[pw(10),pw(13),pw(15.5),pw(17)].join(' '));
  check('林教授（刑訴在大三）大一不會出現在教室',JSON.stringify(CLS.profWhere(mkG(dayOf('2025-09-23'),10.5),'prof_lin'))==='null');
  const g=CLS.goalFor(mkG(T,8)); check('起床時的目標：今天的課＋往下一堂教室的導航（不是「自由的一天」）',/今天的課：09:10 大一英文、13:20 民法總則/.test(g.text)&&g.dest&&g.dest.label==='共同課程教室',JSON.stringify(g));
  const g2=CLS.goalFor(mkG(T,10)); check('英文開始超過 30 分鐘：目標導航改指 201（民法總則）',g2.dest&&g2.dest.zone==='classroom',JSON.stringify(g2.dest));
  const g3=CLS.goalFor(mkG(dayOf('2025-09-27'),8)); check('週六：今天沒有課、自由活動（不指路）',/今天沒有課/.test(g3.text)&&!g3.dest,JSON.stringify(g3)); }
// ---------- 快速前往的時間、時間跳轉（D54 ①③）----------
{ const G=mkG(3,10); const tm=(a,b,pos,to)=>CLS.travelMinutes(G,a,b,pos,to);
  check('快速前往的時間：同一個地方 0；宿舍→霖澤館 15、宿舍→總圖 10、霖澤館→萬才館 5、霖澤館→Café 20 分鐘（照真實步行，最少 5 分鐘）',
    tm('lawlib','lawlib')===0&&tm('dorm','linze')===15&&tm('dorm','library_hall')===10&&tm('linze','wancai')===5&&tm('linze','cafe')===20,
    [tm('lawlib','lawlib'),tm('dorm','linze'),tm('dorm','library_hall'),tm('linze','wancai'),tm('linze','cafe')].join(','));
  check('校園裡的兩個地點：在附近（12 m 內）＝0、校門口→霖澤館前 ≥10 分鐘',tm('campus','campus',{x:-37,z:5},{x:-38,z:6})===0&&tm('campus','campus',{x:-112,z:0},{x:34,z:-98})>=10,
    [tm('campus','campus',{x:-37,z:5},{x:-38,z:6}),tm('campus','campus',{x:-112,z:0},{x:34,z:-98})].join(',')); }
{ const T=dayOf('2025-10-07');   /* 週二（學期間）：09:10 大一國文、13:20 通識 */
  const said=[]; const mkGM=(G,pick)=>({G,D:{active:false},E:{player:{busy:false}},toast:t=>said.push('toast:'+t),sceneBegin(){},sceneEnd(){},choose:async o=>{ said.push('choose:'+o.map(q=>q.t).join('/')); return pick; },
    fade:async()=>{},advance(hh){ G.hour+=hh; },sleep:async()=>{},caption:(w,t)=>said.push('caption:'+t),autosave(){ said.push('autosave'); },setGoal(){} });
  check('第一、二天不能跳（跟著主線）；對話中、劇情中不能跳；第三天可以',!!CLS.canSkip(mkGM(mkG(2,10)))&&!!CLS.canSkip(Object.assign(mkGM(mkG(5,10)),{D:{active:true}}))&&!!CLS.canSkip(Object.assign(mkGM(mkG(5,10)),{E:{player:{busy:true}}}))&&CLS.canSkip(mkGM(mkG(5,10)))==='');
  const at=(G,h1)=>CLS.skipStops(mkGM(G),h1).map(q=>CLS.hhmm(q.h)+' '+q.why);
  const L=Object.assign(mkG(T,20),{zone:'lawlib'}); check('人在法圖（學期間平日 21:45 閉館）從 20:00 跳到 23:00：21:35 停',at(L,23)[0]==='21:35 法律學院圖書館快關門了',at(L,23).join(' | '));
  const B=Object.assign(mkG(T,20),{zone:'library_hall'}); check('人在總圖（22:00 閉館）：21:50 停；人在 Café（02:30 才關）不停',at(B,23)[0]==='21:50 總圖書館快關門了'&&!at(Object.assign(mkG(T,20),{zone:'cafe'}),23).length,at(B,23).join(' | ')+' / '+at(Object.assign(mkG(T,20),{zone:'cafe'}),23).join(' | '));
  const I=Object.assign(mkG(T,10.5),{zone:'dorm',invites:[{day:T,h:15,accepted:true,label:'和朋友在 Café'},{day:T,h:12,accepted:false,label:'沒答應的'}]}); check('已接受的邀約前 10 分鐘停（沒答應的不算）',at(I,17)[0]==='14:50 約好的時間：和朋友在 Café'&&at(I,17).length===1,at(I,17).join(' | '));
  const c=CLS.dayItems(mkG(T,8)).find(it=>it.t0>12); const sp={w:c.week,title:'測試',content:true}; c.c.specials=(c.c.specials||[]).concat([sp]);
  check('特殊課堂（有內容的那一週）開始前 10 分鐘停；普通課堂不停',at(Object.assign(mkG(T,10.5),{zone:'dorm'}),17)[0]==='13:10 特殊課堂：'+c.c.name,at(Object.assign(mkG(T,10.5),{zone:'dorm'}),17).join(' | '));
  c.c.specials=c.c.specials.filter(q=>q!==sp);
  global.STORY_EVENTS=[{id:'t',trigger:'auto',title:'測試事件'},{id:'r',trigger:'auto',random_weight:3,title:'隨機的'}]; let GG=null; global.EVENTS={check:e=>e.id==='t'&&GG.hour%24>=16};
  GG=Object.assign(mkG(T,10.5),{zone:'dorm'}); check('會自動發生的劇情事件條件成立就停（隨機的日常不停）；檢查完時間還原',at(GG,18).some(q=>q==='16:00 測試事件')&&GG.hour===10.5,at(GG,18).join(' | '));
  delete global.STORY_EVENTS; delete global.EVENTS;
  (async()=>{ const G1=Object.assign(mkG(T,10.5),{zone:'dorm'}); said.length=0; const r1=await CLS.skipTo(mkGM(G1,1),17.5);
    check('中間會經過普通課（13:20 通識）：先問一次；選「先不要」＝時間不動',r1===false&&G1.hour===10.5&&said.some(t=>/^choose:照樣跳過\/先不要/.test(t)),said.join(' | '));
    said.length=0; const r2=await CLS.skipTo(mkGM(G1,0),17.5);
    check('選「照樣跳過」：跳到 17:30、經過的課＝沒去、存檔',r2===true&&Math.abs(G1.hour-17.5)<1e-9&&CLS.status(G1,CLS.dayItems(G1).find(it=>it.t0>12))==='missed'&&said.includes('autosave'),CLS.hhmm(G1.hour)+' '+said.join(' | '));
    const G2=Object.assign(mkG(T,18),{zone:'dorm',invites:[{day:T,h:19.5,accepted:true,label:'讀書會'}]}); said.length=0; await CLS.skipTo(mkGM(G2,0),22);
    check('跳到一半遇到邀約：停在 19:20、字幕寫原因、沒有經過課就不問',Math.abs(G2.hour-(19.5-1/6))<1e-9&&said.some(t=>/約好的時間：讀書會/.test(t))&&!said.some(t=>/^choose/.test(t)),said.join(' | '));
    const G3=Object.assign(mkG(T,23.5),{zone:'dorm'}); await CLS.skipTo(mkGM(G3,0),26); check('不跳過午夜（隔天＝睡覺）',G3.hour<24,String(G3.hour));
    afterSkip(); })(); }
function afterSkip(){
// ---------- 成績單、自學 ----------
{ const R={prep:{con_law1:12,crim_gen1:6,civ_general:2}}; const G=Object.assign(mkG(dayOf('2026-01-05'),7.5),{courses:R}); const rep=CLS.reportFor(G,'Y1S1');
  check('成績（文字）：準備 ≥10 很好、≥5 不錯、其他 過了（沒有「沒過」）',rep.con_law1==='很好'&&rep.crim_gen1==='不錯'&&rep.civ_general==='過了'&&Object.values(rep).every(v=>['很好','不錯','過了'].includes(v)),JSON.stringify(rep));
  const said=[]; const GM={G,sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ said.push(t); },toast(t){ said.push('toast:'+t); }};
  (async()=>{ await CLS.morning(GM); const n1=said.length; await CLS.morning(GM); check('學期結束的第一個早上發成績單一次（第二次不再發）',n1>=2&&said.length===n1&&!!G.courses.grades.Y1S1,said.slice(0,2).join(' | '));
    finish(); })(); }
}
// ---------- 校園的門口上課點 ----------
function finish(){
  const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js'];
  for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
  const GM={E}; CLS.addDoors(GM,'campus'); const doors=E.interactables.filter(i=>i.door);
  check('校園有兩個門口上課點（共同課程教室、體育館）',doors.length===2,doors.map(d=>d.label).join('、'));
  for(const d of doors){ let st=null; for(let r=0;r<=1.2&&!st;r+=0.2) for(let a=0;a<12&&!st;a++){ const x=d.x+Math.cos(a/12*Math.PI*2)*r, zz=d.z+Math.sin(a/12*Math.PI*2)*r; if(E.canStand(x,zz,0.32,0)) st=[x,zz]; }
    check(d.label+'的門口（'+d.x+','+d.z+'）旁邊站得住',!!st,JSON.stringify(st)); if(!st) continue;
    const r=E.simWalk(-112,0,st[0],st[1],{lv0:0,lv1:0,dt:0.1,speed:4.8}); check(d.label+'從校門跑得到（模擬走路）',r.ok,JSON.stringify(r).slice(0,160)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); }

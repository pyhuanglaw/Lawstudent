// 床的選項與小睡（story3d.js 的 S.bedOptions、classes3d.js 的 CLS.skipTo(GM,h,{nap:true})）——不需要瀏覽器。
// 2026-10-13 使用者試玩：「睡覺只能隔天醒來？應該要有小睡一下的選項」「早上睡覺醒來變成下午、下午睡覺起來變成晚上」。
// 檢查：早上有「小睡到 13:00」「睡到傍晚 18:00」、下午有「小睡到 18:00」、晚上（17:30 以後、過午夜）才有「睡到明天早上」；第一、二天照劇情只有「睡覺」；
//       小睡：時間到 13:00／18:00、體力回一點、旁白寫醒來；中間有約好的時間會先叫醒（和手機跳過時間同一套）；會錯過的課先問一次。
// 2026-10-13 第二版（AA_110 第 6-5 節，AA 暫定）：白天小睡 30 分鐘／1 小時／2 小時（預設在下一堂課前 20 分鐘叫醒）＋「睡到傍晚（不設鬧鐘）」寫會錯過什麼；
//   晚上睡到明天：早上（有課＝第一堂前 1 小時，沒課 07:30）、中午、下午、晚上，每個選項寫會錯過什麼；考試（前 1 小時）、答應的約（前 30 分鐘）鬧鐘一定叫醒；
//   桌上趴著睡最多 1 小時（napOptions(G,1)）；醒來的時間真的照選的（sleepNow）。第一版的「小睡到 13:00／18:00」檢查照新規格改寫。
// 修改前：沒有 S.bedOptions（第 1 項就失敗）。用法：node tests/bed_nap_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true};
let GM=null; const ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'};
global.EVENTS={npcOf:id=>GM.npc[id]||GM.npc[ALIAS[id]]||null,onEnter(){},tick(){}};
for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/story3d.js','src/classes3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function newGM(zone,day,hour,flags,seats){
  const wd=(3+day-1)%7;   // 第 1 天週三＝3，週日＝0（和遊戲的 G.weekday 一樣）
  const E={npcs:[],interactables:[],q:{level:'high'},zone:{seats:seats||[]},levels:null,navOf:null,nav:null,indoor:zone!=='campus',camera:null,
    player:{obj:{position:{x:0,y:0,z:0},rotation:{y:0}},busy:false,lv:0},addNPC(n){this.npcs.push(n);return n;}};
  const G={day,weekday:wd,hour,flags:Object.assign({},flags),social:{},zone,goal:''};
  const gm={E,G,npc:{},extras:[],D:{active:false},hourRate:1/150};
  gm.spawnNPC=(id,spec,x,z,opts)=>{opts=opts||{};const o=mkObj();o.position.set(x,0,z);const n=E.addNPC({obj:o,id,charId:opts.charId||id,name:spec.name||id,beh:opts.beh||'idle',seat:opts.seat,waypoints:opts.waypoints});gm.npc[id]=n;return n;};
  gm.spawnCharacter=(id,x,z,opts)=>{const c=CHARACTERS[id];if(!c)return null;if(gm.npc[id])return gm.npc[id];const n=gm.spawnNPC(id,{name:c.name},x,z,Object.assign({charId:id},opts)); n.charId=id; return n;};
  gm.removeNPC=id=>{ const n=gm.npc[id]; if(n){ E.npcs=E.npcs.filter(m=>m!==n); delete gm.npc[id]; } };
  gm.spawnExtra=()=>{E.addNPC({obj:mkObj(),isExtra:true});}; gm.spawnRider=()=>{};
  gm.knownIds=()=>Object.keys(CHARACTERS).filter(id=>CHARACTERS[id].social_layer!=='B');
  return gm; }

check('有 STORY.bedOptions',typeof STORY.bedOptions==='function');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const F0={afternoonDone:true,classDone:true,metAn:true,zheInvite:true,zheNoodleDone:true};
const opts=G=>STORY.bedOptions(G);
const kinds=G=>opts(G).map(o=>o.kind+(o.to!=null?':'+(+o.to.toFixed(2)):'')+(o.wake!=null?'@'+(+o.wake.toFixed(2)):'')).join(',');
{ const g=d=>(h)=>newGM('dorm',d,h,F0).G;
  const mon=g(6);   /* 9/22 週一：09:10 憲法（上）、15:30 體育 */
  check('週一 09:30（下一堂 15:30 體育）：小睡 30 分鐘、1 小時、2 小時、睡到傍晚（不設鬧鐘）、再撐一下',kinds(mon(9.5))==='nap:10,nap:10.5,nap:11.5,nap:18,stay',kinds(mon(9.5)));
  check('「睡到傍晚（不設鬧鐘）」寫會錯過什麼：09:10 憲法（開始 30 分鐘內還能進教室）和 15:30 體育',/會錯過：09:10 憲法（上）、15:30 體育/.test((opts(mon(9.5)).find(o=>o.to===18)||{}).hint||''),(opts(mon(9.5)).find(o=>o.to===18)||{}).hint);
  const k1445=opts(mon(14.75));
  check('週一 14:45：鬧鐘在下一堂 15:30 體育前 20 分鐘（15:10）——三種小睡都在 15:10 叫醒，只列一次',k1445.filter(o=>o.kind==='nap'&&o.to<18).length===1&&Math.abs(k1445[0].to-(15+10/60))<0.01&&/前 20 分鐘叫醒你（15:10）/.test(k1445[0].hint),k1445.map(o=>o.t+'｜'+o.hint).join(' / '));
  { global.OUT={rec:G=>G.outings||[],trip:(G,q)=>({travelH:q.travelH||0})}; const g8=mon(8.0); g8.outings=[{id:'y0_e37',alarm:true,state:'planned',day:g8.day,h:14,travelH:2/3,title:'臺北的家樓下 14:00'}];
    const ev=opts(g8).find(o=>o.to===18), g12=mon(12.0); g12.outings=g8.outings.map(q=>Object.assign({},q,{day:g12.day})); const n2=opts(g12).filter(o=>o.kind==='nap'&&o.to<18);
    check('BUG-E37-DORM-SLEEP-1021（BB 10-21：8/30 宿舍床邊沒提醒 14:00 的約）：今天有標 alarm 的出遊（臺北的家樓下 14:00、開車 40 分）——「睡到傍晚」寫「但約好的時間…13:10 會叫醒你」；12:00 小睡 2 小時在 13:10 叫醒、寫出發前 10 分鐘（和跳過時間實際停的時間一樣）',!!ev&&/13:10 會叫醒你/.test(ev.hint)&&/約好的時間：臺北的家樓下 14:00/.test(ev.hint)&&n2.some(o=>Math.abs(o.to-(13+10/60))<0.01&&/出發前 10 分鐘叫醒你/.test(o.hint)),JSON.stringify([ev&&ev.hint,n2.map(o=>[o.t,o.hint])]));
    delete global.OUT; }
  const sun=g(5);   /* 9/21 週日晚上 → 明天週一 */
  const n22=opts(sun(22));
  check('週日 22:00：睡到明天早上（08:10＝第一堂 09:10 憲法前一小時）、中午、下午、晚上、再撐一下',kinds(sun(22))==='sleep@8.17,sleep@12,sleep@14,sleep@18,stay'&&/第一堂 09:10 憲法（上）前一小時/.test(n22[0].hint),kinds(sun(22))+' '+n22[0].hint);
  check('睡到明天中午：寫「會錯過：09:10 憲法（上）」；睡到明天晚上：還會錯過 15:30 體育',/會錯過：09:10 憲法（上）$/.test(n22[1].hint)&&/會錯過：09:10 憲法（上）、15:30 體育/.test(n22[3].hint),n22[1].hint+' / '+n22[3].hint);
  check('過午夜 25:00：一樣是睡到明天（早上 08:10…）',kinds(sun(25))===kinds(sun(22)),kinds(sun(25)));
  const sat=g(4);   /* 9/20 週六晚上 → 明天週日沒課 */
  check('週六晚上：明天沒課，早上是 07:30（「明天沒有課」）',(opts(sat(23))[0]||{}).wake===7.5&&/明天沒有課/.test(opts(sat(23))[0].hint),opts(sat(23))[0]&&opts(sat(23))[0].hint);
  const ex=g(33);   /* 10/19 週日 → 明天 10/20 週一期中考 */
  const e22=opts(ex(22));
  check('明天期中考（A 類）：鬧鐘一定叫醒——只剩「睡到明天早上（08:10）」，寫考試',e22.filter(o=>o.kind==='sleep').length===1&&Math.abs(e22[0].wake-(8+10/60))<0.01&&/考試 09:10/.test(e22[0].hint),e22.map(o=>o.t+'｜'+o.hint).join(' / '));
  const inv=sun(22); inv.invites=[{who:'zhe',day:6,h:13,accepted:true,done:false,label:'和阿哲吃午餐'}]; const i22=opts(inv);
  check('明天 13:00 答應了的約（A 類）：下午、晚上的選項改成鬧鐘 12:30 叫醒（只列一次）',i22.some(o=>o.kind==='sleep'&&Math.abs(o.wake-12.5)<0.01&&/約好的時間：和阿哲吃午餐，鬧鐘 12:30/.test(o.hint))&&!i22.some(o=>o.kind==='sleep'&&o.wake>12.5),i22.map(o=>o.t+'｜'+o.hint).join(' / '));
  check('桌上趴著睡最多 1 小時：napOptions(G,1) 只有 30 分鐘、1 小時',STORY.napOptions(mon(9.5),1).map(o=>o.t).join('、')==='小睡 30 分鐘、小睡 1 小時');
  check('第一、二天（劇情）：只有睡覺、再撐一下',kinds(g(1)(21.5))==='sleep,stay'&&kinds(g(2)(10))==='sleep,stay',kinds(g(2)(10))); }
// 小睡（用遊戲真正的 CLS.skipTo）
function napGM(day,hour){ const gm=newGM('dorm',day,hour,F0); const G=gm.G; G.energy=40; G.zone='dorm'; const log=[];
  Object.assign(gm,{fade:async()=>{},sleep:async()=>{},sceneBegin(){},sceneEnd(){},advance:hh=>{ G.hour+=hh; },energy:d=>{ G.energy=Math.max(0,Math.min(100,G.energy+d)); },caption:(a,t)=>log.push(t),toast:t=>log.push('toast:'+t),choose:async()=>0,autosave(){},setGoal(){}}); gm.log=log; return gm; }
(async()=>{
  { const gm=napGM(6,9.0); const ok=await CLS.skipTo(gm,13,{nap:true});
    check('09:00 小睡到下午：醒來 13:00、旁白寫醒來；不再補體力（DL-02，AA_160 2-8）',ok&&Math.abs(gm.G.hour-13)<0.01&&gm.G.energy===40&&gm.log.some(t=>/睡了一下，醒來是 13:00/.test(t)),`${gm.G.hour} 體力 ${gm.G.energy} ${gm.log.join(' / ')}`); }
  { const gm=napGM(6,14.0); gm.G.invites=[{who:'zhe',day:6,h:16,accepted:true,done:false,label:'和阿哲約在 Café'}]; const ok=await CLS.skipTo(gm,18,{nap:true});
    check('14:00 小睡、16:00 有約：15:50 先醒（和手機跳過時間一樣）',ok&&Math.abs(gm.G.hour-(16-1/6))<0.01&&gm.log.some(t=>/約好的時間/.test(t)),`${gm.G.hour.toFixed(3)} ${gm.log.join(' / ')}`); }
  { const gm=napGM(2,9.0); const ok=await CLS.skipTo(gm,13,{nap:true}); check('第二天不能小睡跳時間（劇情）',!ok&&gm.G.hour===9,gm.log.join(' / ')); }
  { const gm=napGM(5,22.0); const titles=[]; Object.assign(gm,{titleCard:async(a,b)=>titles.push(a+' '+b),enter:async()=>{},money(){},memo(){}}); gm.E.setWeather=()=>{}; gm.G.weather='clear';
    const o=STORY.bedOptions(gm.G).find(q=>q.wake===12); await STORY.sleepNow(gm,o.wake,o.alarm);
    check('選「睡到明天中午」：醒來是第 6 天 12:00（標題寫 12:00）',gm.G.day===6&&Math.abs(gm.G.hour-12)<0.01&&titles.some(t=>/12:00/.test(t)),titles.join(' / ')+' '+gm.G.day+' '+gm.G.hour); }
  { const g0=newGM('dorm',6,22,F0).G, orig=CLS.dayItems, os=CLS.storyClass; CLS.dayItems=()=>[{t0:15.5,c:{name:'測試課',id:'x'},key:'x',room:{}}]; CLS.storyClass=()=>false;
    const o=STORY.bedOptions(g0).find(q=>q.kind==='sleep'); CLS.dayItems=orig; CLS.storyClass=os;
    check('明天第一堂 15:30：叫醒 14:30 那一項寫「睡到明天下午（14:30）」，不寫「早上」（BB-C BB_218）',!!o&&o.t==='睡到明天下午（14:30）',JSON.stringify(o&&o.t)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();

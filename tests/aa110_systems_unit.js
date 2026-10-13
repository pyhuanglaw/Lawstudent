// AA_110 第 5 節的一般系統（2026-10-13）——不需要瀏覽器：
//   5-2 出席三態：聽完 full／中途離開 partial（left）／沒去 missed；座位上跳時間＝聽完；快速前往＝中途離開；存檔讀檔；散場前一分鐘、散場後一分鐘兩個邊界。
//   5-3 人物在場四級：npcZone（＝舊的 npcHere）／npcRoom／npcPresent／npcNear（2.5 m、同一層，或同一張桌子）。
//   5-4 習慣記憶：G.habits、一天最多算一次、條件 habit:{key,min,withinDays}；舊存檔沒有 G.habits。
// 出席的呼叫順序照 src/game3d.js 的 actTrack：自由行動時每 3 格 track(現在的狀態)；坐下時 track(坐著)；時間跳動（advance）前 track()、後 track(hPrev＝跳之前的時間)；
// 快速前往在時間跳動以前 leave()。修改前（只有「聽演講」才記、沒有中途離開）這裡的中途離開、座位跳時間、邊界、npcRoom／npcNear／habit 都會失敗。
// 用法：node tests/aa110_systems_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'); global.window=global;
for(const f of ['src/data/calendar.js','src/data/activities.js','src/events3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|ACTIVITIES|EVENTS)\s*=/m,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const L=dayOf('2025-10-21');   // 週二
ACTIVITIES.list=[{id:'t_lec',title:'測試演講',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',dates:['2025-10-21'],t0:18.5,t1:20.5}];
const M=1/60;
/* 修改前的版本沒有 stateOf／attendedAny／track／leave／lastAttendedDay／EVENTS.habit：用相容的寫法呼叫，讓每一項照樣報 FAIL（不是整個測試當掉）*/
const A=new Proxy(ACTIVITIES,{get:(t,k)=>k in t?t[k]:({stateOf:(G,id,d)=>t.attended(G,id,d)?'full':null,attendedAny:(G,id,d)=>t.attended(G,id,d),track:()=>{},leave:()=>{}})[k]});
if(!EVENTS.habit) EVENTS.habit=()=>{};
/* 照 game3d.js 的 actTrack：玩家的狀態 {zone, room, seated}；at(h)＝自由行動時時間走到 h（每 3 格呼叫一次，這裡直接在那個時間呼叫）；
   jump(dh)＝advance：跳之前 track()、跳之後 track(hPrev)；sit()＝坐下（seatMenu 的 sitAt 之後）；leave()＝快速前往 */
function player(G,st){ const P={st};
  P.track=hPrev=>A.track(G,P.st.zone,P.st.room,!!P.st.seated,hPrev);
  P.at=h=>{ G.hour=h; P.track(); };
  P.sit=()=>{ P.st.seated=true; P.track(); };
  P.stand=()=>{ P.st.seated=false; };
  P.go=(zone,room)=>{ P.st.zone=zone; P.st.room=room; P.track(); };
  P.jump=dh=>{ const h0=G.hour; P.track(); G.hour+=dh; P.track(h0); };
  P.quick=(zone,mins)=>{ A.leave(G); P.jump(mins/60); P.st={zone,room:null,seated:false}; P.track(); };
  return P; }
const newG=h=>({day:L,hour:h,zone:'boya',weekday:2,flags:{},events:{done:{},last:{}}});
const HB=(G,k)=>(G.habits||{})[k]||{};
const rec=G=>(G.acts&&G.acts.att&&G.acts.att['t_lec@'+L])||null;

// ---------- 5-2 出席 ----------
{ const G=newG(18.4); A.markAttended(G,A.list[0]); G.hour=20.5;
  check('5-2 選「聽演講」＝聽完（full）：attended、attendedAny 都成立，不算沒去',A.stateOf(G,'t_lec',L)==='full'&&A.attended(G,'t_lec')&&A.attendedAny(G,'t_lec')&&!A.missed(G,'t_lec')); }
{ const G=newG(18+20/60), P=player(G,{zone:'boya',room:'101'}); P.sit();
  check('5-2 開始前就坐下：還沒開始，不記',!rec(G));
  P.jump(1/3); const r1=JSON.stringify(rec(G));
  P.stand(); P.at(19.5); P.at(20.5-M); const r2=rec(G)&&(rec(G)||{}).end; P.at(20.5+M);
  check('5-2 座位上「坐一下」跳過開始時間＝開始記（從 18:30 算）；起身留在那一間到散場＝聽完',/"h":18.5,"end":"in"/.test(r1)&&r2==='in'&&A.stateOf(G,'t_lec',L)==='full',r1+' → '+JSON.stringify(rec(G))); }
{ const G=newG(18+20/60), P=player(G,{zone:'boya',room:'101'}); P.sit(); P.jump(2.5);
  check('5-2 座位上一路跳過整場（18:20 → 20:50）＝聽完',A.stateOf(G,'t_lec',L)==='full',JSON.stringify(rec(G))); }
{ const G=newG(19), P=player(G,{zone:'boya',room:'101'}); P.sit(); P.stand(); P.at(19.25); P.go('boya','corridor'); G.hour=19.5; P.track();
  check('5-2 坐下聽了、結束前走出那一間＝中途離開（end:left、lh 是離開的時間）',rec(G)&&(rec(G)||{}).end==='left'&&(rec(G)||{}).lh===19.25,JSON.stringify(rec(G)));
  G.hour=21;
  check('5-2 中途離開：attended（只算聽完）不成立、attendedAny 成立、不算沒去（missed）',A.stateOf(G,'t_lec',L)==='partial'&&!A.attended(G,'t_lec')&&A.attendedAny(G,'t_lec')&&!A.missed(G,'t_lec'));
  P.go('boya','101'); P.sit(); A.markAttended(G,A.list[0]);
  check('5-2 中途離開以後回來再選「聽演講」：照樣是中途離開（結束前走出那一間）',(rec(G)||{}).end==='left'); }
{ const G=newG(19), P=player(G,{zone:'boya',room:'101'}); P.sit(); P.stand(); P.at(19.4); P.quick('campus',10);
  check('5-2 活動中快速前往＝中途離開（離開的時間是出發的時候，不是到達）',rec(G)&&(rec(G)||{}).end==='left'&&Math.abs((rec(G)||{}).lh-19.4)<1e-6&&A.stateOf(G,'t_lec',L)==='partial',JSON.stringify(rec(G))); }
{ const G=newG(19), P=player(G,{zone:'boya',room:'101'}); P.sit(); P.stand(); P.at(20.5-M); P.go('boya','corridor'); P.at(20.5+M);
  check('5-2 邊界：散場前一分鐘（20:29）走出去＝中途離開',(rec(G)||{}).end==='left',JSON.stringify(rec(G))); }
{ const G=newG(19), P=player(G,{zone:'boya',room:'101'}); P.sit(); P.stand(); P.at(20.5+M); P.go('boya','corridor'); P.at(20.6);
  check('5-2 邊界：散場後一分鐘（20:31）才走出去＝聽完（之後離開不會變回中途離開）',(rec(G)||{}).end==='full'&&A.attended(G,'t_lec'),JSON.stringify(rec(G))); }
{ const G=newG(18), P=player(G,{zone:'dorm',room:null}); P.jump(3);
  check('5-2 從別處跳過活動時段（宿舍 18:00 → 21:00）＝沒去：沒有紀錄、missed 成立',!rec(G)&&A.missed(G,'t_lec')&&!A.attendedAny(G,'t_lec')); }
{ const G=newG(19+40/60), P=player(G,{zone:'boya',room:'101'}); P.sit(); P.stand(); P.at(20.6);
  check('5-2 過了一半（19:40）才坐下：不算（和「聽演講」同一個時窗）＝沒去',!rec(G)&&A.missed(G,'t_lec')); }
{ const G=newG(18.4), P=player(G,{zone:'boya',room:'101'}); P.at(19); P.at(20.6);
  check('5-2 只是站在那一間（沒有坐下過）：不記',!rec(G)); }
{ const G=newG(19), P=player(G,{zone:'boya',room:'101'}); P.sit(); P.stand(); P.at(19.5);
  const G2=JSON.parse(JSON.stringify(G)), P2=player(G2,{zone:'boya',room:'101'}); P2.at(19.6); P2.at(20.5+M);
  check('5-2 存檔讀檔：聽到一半存檔（in）、讀檔後留到散場＝聽完；紀錄跟著存檔',JSON.stringify(rec(G))==='{"h":19,"end":"in"}'&&(rec(G2)||{}).end==='full',JSON.stringify(rec(G))+' → '+JSON.stringify(rec(G2))); }
{ const G=newG(21); G.acts={att:{['t_lec@'+L]:{h:18.6}}};
  check('5-2 舊存檔的紀錄 {h}（以前只有「聽演講」才記）＝聽完',A.attended(G,'t_lec')&&A.stateOf(G,'t_lec',L)==='full'); }
{ const G=newG(19), P=player(G,{zone:'boya',room:'101'}); P.sit();
  const off=A.atSeat(G,'boya','101'); A.markAttended(G,A.list[0]); const off2=A.atSeat(G,'boya','101');
  check('5-2 坐下以後（in）照樣有「聽演講」可以選；選了就是聽完、不再列',!!off&&(rec(G)||{}).end==='full'&&!off2); }
{ const G=newG(10); G.acts={att:{['t_lec@'+L]:{h:18.6,end:'full'}}}; const GM={G,E:{zone:null,player:null}}; EVENTS.bind(GM);
  const c=q=>EVENTS.cond(q);
  G.day=L; G.hour=21; const a1=c({attendedWithin:{t_lec:1}}); G.day=L+1; const a2=c({attendedWithin:{t_lec:1}}); G.day=L+2; const a3=c({attendedWithin:{t_lec:1}});
  check('5-2 條件 attendedWithin:{t_lec:1}（「隔天的版本」）：當天、隔天成立，第三天不成立',a1&&a2&&!a3,[a1,a2,a3].join());
  G.acts.att['t_lec@'+L].end='left'; G.day=L+1;
  check('5-2 條件：中途離開時 attended 不成立、attendedAny 成立、missed 不成立、attendedWithin 不成立',!c({attended:['t_lec']})&&c({attendedAny:['t_lec']})&&!c({missed:['t_lec']})&&!c({attendedWithin:{t_lec:1}})); }

// ---------- 5-3 人物在場四級 ----------
{ const G=newG(15); G.zone='boya';
  const mkNPC=(x,z,lv,seat)=>({obj:{position:{x,z}},lv,seat:seat||null});
  const rooms=(x,z,lv)=>lv===1?'201':(x<0?'study':'101');   // 測試用的區域：x<0 是自習區、x≥0 是 101、二樓 201
  const P={obj:{position:{x:-3,z:0}},lv:0,seat:null};
  const yuNPC=mkNPC(-4,0,0); const E={zone:{roomAt:rooms},player:P,npcs:[yuNPC]}; const GM={G,E,npc:{yu:yuNPC}};
  let where={heroine_02:{zone:'boya',room:'study'},yu:{zone:'boya',room:'study'}};
  global.STORY={whereIs:(gm,id)=>where[id]||null}; EVENTS.bind(GM);
  const ok=extra=>EVENTS.check(Object.assign({id:'t_np_'+Math.random(),location:'boya'},extra));
  check('5-3 npcZone：照作息在同一個區域就成立（芷若不在場景裡也算）；舊的 npcHere 是同一件事',ok({npcZone:'heroine_02'})&&ok({npcHere:'heroine_02'}));
  where.heroine_02={zone:'campus'}; check('5-3 npcZone：照作息在別的區域＝不成立',!ok({npcZone:'heroine_02'})&&!ok({npcHere:'heroine_02'})); where.heroine_02={zone:'boya',room:'study'};
  check('5-3 npcRoom：不在場景裡的人看作息的 room（同一間＝成立）',ok({npcRoom:'heroine_02'}));
  where.heroine_02={zone:'boya',room:'101'}; check('5-3 npcRoom：作息在 101、玩家在自習區＝不成立',!ok({npcRoom:'heroine_02'})); where.heroine_02={zone:'boya',room:'study'};
  check('5-3 npcRoom：在場景裡的人看實際位置（小語在自習區 = 玩家這一間）',ok({npcRoom:'yu'}));
  yuNPC.obj.position.x=5; check('5-3 npcRoom：小語走到 101（作息雖然寫自習區）＝不成立',!ok({npcRoom:'yu'})); yuNPC.obj.position.x=-4;
  check('5-3 npcPresent：真的放在場景裡才成立（小語成立、只有作息的芷若不成立）',ok({npcPresent:'yu'})&&!ok({npcPresent:'heroine_02'}));
  check('5-3 npcNear：1 m 內成立；只在作息裡的人永遠不成立',ok({npcNear:'yu'})&&!ok({npcNear:'heroine_02'}));
  yuNPC.obj.position.x=-6.2; check('5-3 npcNear：3.2 m＝不成立（預設 2.5 m）；nearDist:4 成立',!ok({npcNear:'yu'})&&ok({npcNear:'yu',nearDist:4}));
  P.seat={x:-3,z:0,table:'T3'}; yuNPC.seat={x:-6.2,z:0,table:'T3'};
  check('5-3 npcNear：坐同一張桌子（3.2 m）＝成立',ok({npcNear:'yu'})); P.seat=null; yuNPC.seat=null;
  yuNPC.obj.position.x=-3.5; yuNPC.lv=1; check('5-3 npcNear：正上方的二樓（0.5 m、不同層）＝不成立',!ok({npcNear:'yu'})); yuNPC.lv=0;
  P.obj.position.x=-100; E.zone.roomAt=()=>null; check('5-3 npcRoom：玩家不在任何一間（走廊、戶外）＝不成立',!ok({npcRoom:'heroine_02'})); }

// ---------- 5-4 習慣記憶 ----------
{ const G=newG(15); G.day=1; const GM={G,E:{zone:null,player:null}}; EVENTS.bind(GM);
  check('5-4 舊存檔沒有 G.habits：條件不成立、不會出錯',!EVENTS.cond({habit:{key:'table:boya:t3',min:1}})&&G.habits===undefined);
  EVENTS.habit('table:boya:t3'); EVENTS.habit('table:boya:t3');
  check('5-4 同一天記兩次＝一天（n=1）',HB(G,'table:boya:t3').n===1&&HB(G,'table:boya:t3').first===1,JSON.stringify(G.habits));
  for(const d of [3,8,12,15]){ G.day=d; EVENTS.habit('table:boya:t3'); }
  G.day=16; const H=HB(G,'table:boya:t3');
  check('5-4 第 1、3、8、12、15 天：n=5、last=15、days 依序',H.n===5&&H.last===15&&JSON.stringify(H.days)==='[1,3,8,12,15]',JSON.stringify(H));
  check('5-4 條件 habit:{min:5} 成立、{min:6} 不成立',EVENTS.cond({habit:{key:'table:boya:t3',min:5}})&&!EVENTS.cond({habit:{key:'table:boya:t3',min:6}}));
  G.day=22;
  check('5-4 「三週內在同一張桌子坐四次」{min:4,withinDays:21}：第 22 天算第 2～22 天＝4 次（第 1 天不算）成立；{min:5,withinDays:21} 不成立',EVENTS.cond({habit:{key:'table:boya:t3',min:4,withinDays:21}})&&!EVENTS.cond({habit:{key:'table:boya:t3',min:5,withinDays:21}}));
  check('5-4 好幾個習慣都要成立（陣列）',EVENTS.cond({habit:[{key:'table:boya:t3',min:2}]})&&!EVENTS.cond({habit:[{key:'table:boya:t3',min:2},{key:'place:wenzhou:night',min:1}]}));
  const G2=JSON.parse(JSON.stringify(G)); check('5-4 跟著存檔（JSON 來回一次還在）',HB(G2,'table:boya:t3').n===5);
  for(let d=30; d<120; d++){ G.day=d; EVENTS.habit('place:wenzhou:night'); }
  const W=HB(G,'place:wenzhou:night'); check('5-4 days 只留最近 60 次（存檔不會一直變大），n 照樣是全部',W.n===90&&(W.days||[]).length===60&&(W.days||[])[0]===60,`n=${W.n} days=${(W.days||[]).length} 第一個=${(W.days||[])[0]}`); }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

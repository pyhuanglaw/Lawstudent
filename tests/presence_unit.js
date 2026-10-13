// 人物在不在學校（AA_110 第 3 節：跨學年的出場條件）——不需要瀏覽器。src/story3d.js 的 STORY.presence／present。
// 遊戲資料裡還沒有填任何人的 presence（內容要 AA 確認、使用者批准）；這裡用測試資料檢查機制：
//   absent（某一學期不在，例：在國外交換）、until（之後不在，例：休學、轉學）、寒暑假算前一個學期；
//   不在的時候：不會照行程生出來、人物線索寫 away 的文字（不是「現在沒有固定的行程」）、課堂沒有她的反應句；沒有 presence 的人物照舊。
// 修改前沒有這個機制，這個測試會失敗。
// 用法：node tests/presence_unit.js
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
const F0={afternoonDone:true,classDone:true,metAn:true,zheInvite:true,zheNoodleDone:true};
const fri=(term,week)=>{ for(let d=1;d<2000;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===week&&(3+d-1)%7===5&&!CALENDAR.holiday(d)) return d; } return null; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
/* 遊戲資料（AA_110 5-7 寫「可以」的那一列）：2025 年入學的這一屆 from:'Y1S1'——經濟系那一年（Y0S1、Y0S2）還不在。其他人（交換、休學）等 AA 確認、使用者批准 */
const COHORT=['heroine_01','heroine_03','zhe','yu','classmate_bohan','classmate_xinci','classmate_mingxuan','classmate_youchen','classmate_peishan','kai','npc_huangxh'];
{ const has=Object.keys(CHARACTERS).filter(id=>CHARACTERS[id].presence); const bad=has.filter(id=>!COHORT.includes(id)||JSON.stringify(CHARACTERS[id].presence)!=='{"from":"Y1S1"}');
  check('遊戲資料的 presence 只有 2025 年入學的這一屆（11 人，from Y1S1），沒有別人、沒有別的設定',has.length===COHORT.length&&!bad.length,bad.join(',')||has.length+' 人');
  const y0=dayOf('2024-10-18'), y0b=dayOf('2025-04-11'), d1={day:1};
  check('經濟系大一上、下（2024-10、2025-04）：這一屆的人都還不在；法律系第 1 天（2025-09-17）都在',COHORT.every(id=>!STORY.present(id,{day:y0})&&!STORY.present(id,{day:y0b})&&STORY.present(id,d1)));
  check('沒有 presence 的人（芷若、子晴、溫書瑀）在經濟系那一年照舊算在',['heroine_02','heroine_04','heroine_05'].every(id=>STORY.present(id,{day:y0}))); }
// 測試資料（只在這個測試裡）：林芷若某一學期不在（交換）；沛珊大二上之後不在（休學、轉學）
CHARACTERS.heroine_02.presence={absent:['Y3S2'],away:{Y3S2:'在國外交換（測試資料）'}};
CHARACTERS.classmate_peishan.presence={until:'Y2S1',away:{Y2S2:'休學中（測試資料）',after:'在別的學校（測試資料）'}};
const seats=Array.from({length:12},(_,i)=>({x:i,z:0,yaw:0,row:0,col:i}));
// 林芷若：週五 19:00 在 Café 打工（daily_schedule）
{ const dIn=fri('Y3S1',5), dOut=fri('Y3S2',5), dSummer=dayOf('2028-07-14'), dBack=fri('Y4S1',5);
  GM=newGM('cafe',dIn,19.5,F0,seats); STORY.populate('cafe',GM); const w1=STORY.whereIs(GM,'heroine_02');
  check('大三上（在學校）：週五 19:30 林芷若在 Café 打工，照常出現',!!GM.npc.heroine_02&&w1&&w1.zone==='cafe');
  GM=newGM('cafe',dOut,19.5,F0,seats); STORY.populate('cafe',GM); const w2=STORY.whereIs(GM,'heroine_02');
  check('大三下（absent）：同一個時間不會出現；人物線索寫「在國外交換」',!GM.npc.heroine_02&&w2&&w2.zone===null&&w2.away==='在國外交換（測試資料）',JSON.stringify(w2));
  GM=newGM('cafe',dSummer,19.5,F0,seats); STORY.populate('cafe',GM); check('大三下之後的暑假算前一個學期：還不在',!GM.npc.heroine_02&&!STORY.present('heroine_02',GM.G));
  GM=newGM('cafe',dBack,19.5,F0,seats); STORY.populate('cafe',GM); check('大四上回來：照常出現',!!GM.npc.heroine_02&&STORY.present('heroine_02',GM.G)); }
// 沛珊：until Y2S1
{ const g=d=>({day:d}); const a=STORY.presence('classmate_peishan',g(fri('Y2S1',5))), b=STORY.presence('classmate_peishan',g(fri('Y2S2',5))), c=STORY.presence('classmate_peishan',g(fri('Y3S1',5)));
  check('until Y2S1：大二上在、大二下寫「休學中」、大三以後寫「在別的學校」',a.here&&!b.here&&b.away==='休學中（測試資料）'&&!c.here&&c.away==='在別的學校（測試資料）',JSON.stringify([a,b,c])); }
// 沒有 presence 的人照舊
{ GM=newGM('cafe',fri('Y3S2',5),19.5,F0,seats); check('沒有 presence 的人物照舊（子晴、溫書瑀在任何學期都算在）；from Y1S1 的阿哲、小安大三下也在',STORY.present('heroine_04',GM.G)&&STORY.present('heroine_05',GM.G)&&STORY.present('zhe',GM.G)&&STORY.present('heroine_01',GM.G)); }
// 課堂的同學反應句：那學期不在的人沒有反應句
{ const c={id:'t_course',name:'測試課',prof:null,profName:'老師',topics:['測試'],syllabus:[{w:5,tpl:'A',board:['測試','',''],line:'老師說的話',react:[{who:'heroine_02',text:'林芷若的反應'}]}]};
  const inT=CLS.content({c,week:5,day:fri('Y3S1',5)}), outT=CLS.content({c,week:5,day:fri('Y3S2',5)});
  check('課堂反應句：大三上有林芷若的反應、大三下（不在）沒有',/林芷若的反應/.test(inT.react||'')&&!outT.react,JSON.stringify([inT.react,outT.react])); }
// 芷若大一上的週五（AA_110 5-7）：09:10–12:10 普通 101 上重修經原、12:10–13:00 在小福吃午餐（不在場景裡）、13:00–17:00 Café；其他學期、國定假日、寒假照原本的作息
{ delete CHARACTERS.heroine_02.presence;   // 上面的測試資料拿掉（遊戲資料裡芷若沒有 presence）
  const room=[...Array.from({length:6},(_,i)=>({x:i,z:0,yaw:0,room:'102'})),...Array.from({length:6},(_,i)=>({x:i,z:5,yaw:0,room:'101'}))];
  const at=(day,hour,zone,sts)=>{ GM=newGM(zone,day,hour,F0,sts||seats); STORY.populate(zone,GM); return {w:STORY.whereIs(GM,'heroine_02'),n:GM.npc.heroine_02}; };
  const f5=fri('Y1S1',5), hol=dayOf('2025-10-10'), win=dayOf('2026-01-30'), s2=fri('Y1S2',5), y2=fri('Y2S1',6);
  const a=at(f5,10,'putong',room);
  check('大一上週五 10:00：在普通 101 上課（人物線索寫普通、101；走進普通看得到她坐在 101）',a.w&&a.w.zone==='putong'&&a.w.room==='101'&&a.w.act==='上課'&&!!a.n&&a.n.seat&&a.n.seat.room==='101',JSON.stringify(a.w)+' seat='+JSON.stringify(a.n&&a.n.seat));
  const b=at(f5,12.5,'cafe'), b2=at(f5,12.5,'campus');
  check('大一上週五 12:30：在小福吃午餐（不在任何場景裡；人物線索寫「在小福吃午餐」）',b.w&&b.w.zone===null&&b.w.away==='在小福吃午餐'&&!b.n&&!b2.n,JSON.stringify(b.w));
  const c=at(f5,14.5,'cafe'), c2=at(f5,14.5,'campus');
  check('大一上週五 14:30：在 Café 打工（13:00–17:00）；校園那一筆（14–16 和子晴）這一天不算，不會同時出現在校園',c.w&&c.w.zone==='cafe'&&!!c.n&&!c2.n,JSON.stringify(c.w));
  const d=at(f5,16.5,'cafe'); check('大一上週五 16:30：還在 Café（原本 15 點下班）',!!d.n&&d.w.zone==='cafe');
  const e=at(hol,10,'putong',room), e2=at(hol,12.5,'cafe');
  check('國慶日（2025-10-10 週五）：停課，不在普通；12:30 不是在小福（沒課），照原本的作息在 Café',!e.n&&(!e.w||e.w.zone!=='putong')&&!!e2.n&&e2.w.zone==='cafe',JSON.stringify([e.w,e2.w]));
  const g=at(win,10,'putong',room); check('寒假的週五（2026-01-30）：不上課',!g.n&&(!g.w||g.w.zone!=='putong'),JSON.stringify(g.w));
  const h2=at(s2,10,'putong',room), h3=at(s2,14.5,'campus');
  check('大一下的週五：恢復原本的作息（10:00 不在普通；14:30 照舊）',!h2.n&&(!h2.w||h2.w.zone!=='putong')&&!!h3.w,JSON.stringify([h2.w,h3.w]));
  const i1=at(y2,14.5,'cafe'), i2=at(y2,14.5,'campus');
  check('一個人同一時間只在一個地方（大二上第 6 週週五 14:30：作息兩筆重疊——Café 11–15、校園 14–16——只算第一筆 Café；修改前兩邊都生出來）',!!i1.n&&!i2.n&&i1.w.zone==='cafe',JSON.stringify(i1.w)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

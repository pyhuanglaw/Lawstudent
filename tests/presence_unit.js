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
{ const has=Object.keys(CHARACTERS).filter(id=>CHARACTERS[id].presence); const POOLP={1:'{"from":"Y1S1"}',2:'{"from":"Y1S1","until":"Y3S2"}',3:'{"from":"Y1S1","until":"Y2S2"}'};   /* 不熟同學（AA_120 7-3）：三年級的到玩家大二結束、二年級的到大三結束 */
  /* SYS-21（BB_134 第 9 點，AA-B 確認）：芷若大三上、大四在英國；學姊 2028-08-02～12-23 在美國（BB_206、AA_260：原本大三下）；沛珊大二下休學、大三起別的學校；子晴大三下畢業以後在工作室 */
  const SYS21={heroine_02:'{"absent":["Y3S1","Y4S1","Y4S2"],"away":{"Y3S1":"英國","Y4S1":"英國","Y4S2":"英國"}}',heroine_05:'{"absentDates":[["2028-08-02","2028-12-23","美國","abroad"]]}',heroine_04:'{"until":"Y3S2","away":{"after":"在工作室上班"},"kinds":{"after":"taipei"}}',
    kexin:'{"home":"高雄"}',   /* AA_276 第 1 節：寒暑假回高雄 */
    classmate_mingxuan:'{"from":"Y1S1","absentDates":[["2026-02-13","2026-02-20","回彰化過年","home",{"home":"彰化"}],["2026-08-10","2026-08-17","回彰化","home",{"home":"彰化"}],["2027-08-10","2027-08-17","回彰化","home",{"home":"彰化"}],["2028-08-10","2028-08-17","回彰化","home",{"home":"彰化"}]]}',   /* BB_171 第 1 節 */
    npc_fangyt:'{"absentDates":[["2026-01-24","2026-02-19","回台中過年","home",{"home":"台中"}],["2026-07-06","2026-07-20","上山做調查（沒有訊號）","trip"],["2027-07-06","2027-07-20","上山做調查（沒有訊號）","trip"],["2028-07-06","2028-07-20","上山做調查（沒有訊號）","trip"]]}',   /* BB_171 第 1 節 */
    classmate_peishan:'{"home":"台中","homeAfter":["2026-07-05"],"from":"Y1S1","until":"Y2S1","away":{"Y2S2":"在台中","after":"在自己的學校"},"kinds":{"Y2S2":"taipei","after":"taipei"},"absentDates":[["2026-12-18","2027-08-06","聯絡不到","unreachable","keepDating"],["2029-07-23","2029-07-28","在山上帶營隊","trip"]]}'};   /* BB_205 第 3 節：12/18～2027-08-06 聯絡不到；AA_328 3-16：2029-07-23～07-27 在山上帶營隊 */   /* BB_163：沛珊、子晴沒出國，人在臺北（kind taipei）*/
  const bad=has.filter(id=>SYS21[id]?JSON.stringify(CHARACTERS[id].presence)!==SYS21[id]:(/^pool_/.test(id)?JSON.stringify(CHARACTERS[id].presence)!==POOLP[CHARACTERS[id].year]:(!COHORT.includes(id)||JSON.stringify(CHARACTERS[id].presence)!==(id==='heroine_01'?'{"from":"Y1S1","absentDates":[["2028-01-24","2028-01-29","回台中過年","home",{"home":"台中"}],["2028-03-25","2028-08-05","日本","abroad"]]}':'{"from":"Y1S1"}'))));
  check('遊戲資料的 presence：2025 年入學的這一屆（11 人，from Y1S1；沛珊另照 SYS-21）＋不熟同學 20 人（照年級畢業）＋芷若、學姊、子晴（SYS-21）＋可昕（AA_276 寒暑假回高雄）＋方奕廷（BB_171 寒暑假），沒有別人',has.length===COHORT.length+20+5&&!bad.length,bad.join(',')||has.length+' 人');
  const dOf=(term,w)=>{ for(let d=1;d<2000;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===w) return d; } return null; };
  const p3=Object.keys(CHARACTERS).filter(id=>/^pool_/.test(id)&&CHARACTERS[id].year===3), p2=Object.keys(CHARACTERS).filter(id=>/^pool_/.test(id)&&CHARACTERS[id].year===2), p1=Object.keys(CHARACTERS).filter(id=>/^pool_/.test(id)&&CHARACTERS[id].year===1);
  check('不熟同學：三年級的大二下還在、大三上不在；二年級的大三下還在、大四上不在；一年級的大四下還在',p3.every(id=>STORY.present(id,{day:dOf('Y2S2',5)})&&!STORY.present(id,{day:dOf('Y3S1',5)}))&&p2.every(id=>STORY.present(id,{day:dOf('Y3S2',5)})&&!STORY.present(id,{day:dOf('Y4S1',5)}))&&p1.every(id=>STORY.present(id,{day:dOf('Y4S2',5)})),[p3.length,p2.length,p1.length].join('/'));
  const y0=dayOf('2024-10-18'), y0b=dayOf('2025-04-11'), d1={day:1};
  check('經濟系大一上、下（2024-10、2025-04）：這一屆的人都還不在；法律系第 1 天（2025-09-17）都在',COHORT.every(id=>!STORY.present(id,{day:y0})&&!STORY.present(id,{day:y0b})&&STORY.present(id,d1)));
  check('沒有 presence 的人（芷若、子晴、溫書瑀）在經濟系那一年照舊算在',['heroine_02','heroine_04','heroine_05'].every(id=>STORY.present(id,{day:y0}))); }
const REAL_PRES={heroine_02:CHARACTERS.heroine_02.presence,classmate_peishan:CHARACTERS.classmate_peishan.presence};   /* SYS-21 的正式資料（下面換成測試資料以前先存起來）*/
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
{ GM=newGM('cafe',fri('Y3S2',8),19.5,F0,seats); check('大三下（第 8 週）：子晴還在（畢業以後才走）、學姊在臺灣（美國改到大四上，AA_260）；from Y1S1 的阿哲在；小安在日本交換（AA_260：2028-03-25～08-05 所有玩家都不在）',STORY.present('heroine_04',GM.G)&&STORY.present('heroine_05',GM.G)&&STORY.present('zhe',GM.G)&&!STORY.present('heroine_01',GM.G)); }
{ const g=d=>({day:d,flags:{}}); check('小安：大三上第 5 週在、2028-03-24 還在、3/25 出發、8/5 回來了（AA_260 的日期，不是整學期）',STORY.present('heroine_01',g(fri('Y3S1',5)))&&STORY.present('heroine_01',g(dayOf('2028-03-24')))&&!STORY.present('heroine_01',g(dayOf('2028-03-25')))&&STORY.present('heroine_01',g(dayOf('2028-08-05')))); }
{ const TEST_PRES={heroine_02:CHARACTERS.heroine_02.presence,classmate_peishan:CHARACTERS.classmate_peishan.presence}; CHARACTERS.heroine_02.presence=REAL_PRES.heroine_02; CHARACTERS.classmate_peishan.presence=REAL_PRES.classmate_peishan; const at=(term,w)=>({day:fri(term,w)||fri(term,w+2),flags:{}}); const P=(id,term)=>STORY.presence(id,at(term,5));
  check('SYS-21：芷若大三上、大四不在（國外）、大三下在；學姊大三上在、大三下不在；沛珊大二上在、12/18～2027-08-06 聯絡不到（BB_205）、之後「在臺北、不在台大」（BB_163）；子晴大四起同樣（工作室）',
    !P('heroine_02','Y3S1').here&&P('heroine_02','Y3S1').kind==='absent'&&P('heroine_02','Y3S2').here&&!P('heroine_02','Y4S2').here&&P('heroine_05','Y3S1').here&&P('classmate_peishan','Y2S1').here&&P('classmate_peishan','Y2S2').kind==='unreachable'&&STORY.presence('classmate_peishan',{day:dayOf('2027-08-07'),flags:{}}).kind==='taipei'&&P('classmate_peishan','Y3S1').kind==='taipei'&&P('heroine_04','Y4S1').kind==='taipei'&&P('heroine_04','Y4S1').away==='在工作室上班'); CHARACTERS.heroine_02.presence=TEST_PRES.heroine_02; CHARACTERS.classmate_peishan.presence=TEST_PRES.classmate_peishan; }
// 課堂的同學反應句：那學期不在的人沒有反應句
{ const c={id:'t_course',name:'測試課',prof:null,profName:'老師',topics:['測試'],syllabus:[{w:5,tpl:'A',board:['測試','',''],line:'老師說的話',react:[{who:'heroine_02',text:'林芷若的反應'}]}]};
  const sy0=global.SYLLABUS; global.SYLLABUS={courses:{},pools:{},skip:{},reviewed:['t_course|5']};   /* 審查過的週才用課堂內容（法律審查，AA_122 第 0a 節）：測試課當作審查過 */
  const inT=CLS.content({c,week:5,day:fri('Y3S1',5)}), outT=CLS.content({c,week:5,day:fri('Y3S2',5)}); global.SYLLABUS=sy0;
  check('課堂反應句：大三上有林芷若的反應、大三下（不在）沒有',/林芷若的反應/.test(inT.react||'')&&!outT.react,JSON.stringify([inT.react,outT.react])); }
// 芷若大一上的週五（AA_110 5-7；AA 2026-10-13 P1-3）：09:10–12:10 普通 101 上重修經原、12:10–12:40 在 101 門口的走廊（經原分組的時間）、12:40–13:00 在小福吃午餐（不在場景裡）、13:00–17:00 Café；其他學期、國定假日、寒假照原本的作息
{ delete CHARACTERS.heroine_02.presence;   // 上面的測試資料拿掉（遊戲資料裡芷若沒有 presence）
  const room=[...Array.from({length:6},(_,i)=>({x:i,z:0,yaw:0,room:'102'})),...Array.from({length:6},(_,i)=>({x:i,z:5,yaw:0,room:'101'}))];
  const at=(day,hour,zone,sts)=>{ GM=newGM(zone,day,hour,F0,sts||seats); STORY.populate(zone,GM); return {w:STORY.whereIs(GM,'heroine_02'),n:GM.npc.heroine_02}; };
  const f5=fri('Y1S1',5), hol=dayOf('2025-10-10'), win=dayOf('2026-01-30'), s2=fri('Y1S2',5), y2=fri('Y2S1',6);
  const a=at(f5,10,'putong',room);
  check('大一上週五 10:00：在普通 101 上課（人物線索寫普通、101；走進普通看得到她坐在 101）',a.w&&a.w.zone==='putong'&&a.w.room==='101'&&a.w.act==='上課'&&!!a.n&&a.n.seat&&a.n.seat.room==='101',JSON.stringify(a.w)+' seat='+JSON.stringify(a.n&&a.n.seat));
  const l=at(f5,12.25,'putong',room);
  check('大一上週五 12:15：在普通 101 門口的走廊（人物線索寫普通、「剛下課，在 101 門口」；走進普通看得到她站在門口，不是坐在教室裡）',l.w&&l.w.zone==='putong'&&l.w.act==='剛下課，在 101 門口'&&!!l.n&&!l.n.seat&&Math.hypot(l.n.obj.position.x+4.8,l.n.obj.position.z-0.9)<0.01,JSON.stringify(l.w)+' at='+(l.n&&[l.n.obj.position.x,l.n.obj.position.z]));
  { /* 和她一起上完經原（她坐在 101）：12:10 下課後起身走到門口（不瞬移），12:40 走到出口離開 */
    GM=newGM('putong',f5,12.0,F0,room); STORY.populate('putong',GM); const n=GM.npc.heroine_02, sat=!!(n&&n.seat); const moves=[];
    GM.E.moveTo=(m,x,z,cb,lv)=>{ moves.push([m.charId,+x.toFixed(2),+z.toFixed(2),lv|0]); m.obj.position.set(x,0,z); if(cb) cb(); return true; }; GM.standUp=m=>{ m.seat=null; m.pose='idle'; };
    GM.E.interactables=[{exit:true,x:0,z:7.2,lv:0,label:'走出普通教學館'}];
    GM.G.hour=12.2; STORY.refreshSchedule(GM); const at1=n&&[n.obj.position.x,n.obj.position.z], up=n&&!n.seat, still=GM.npc.heroine_02===n;
    check('一起上完經原：12:12 起身、走到 101 門口的走廊（同一個人，不是重新生出來）',sat&&up&&still&&moves.some(q=>q[0]==='heroine_02'&&q[1]===-4.8&&q[2]===0.9),JSON.stringify({sat,up,still,moves}));
    moves.length=0; GM.G.hour=12.7; STORY.refreshSchedule(GM);
    check('12:42：走到出口才離開（去吃午餐）',!!n.leaving&&moves.some(q=>q[0]==='heroine_02'&&q[1]===0&&q[2]===7.2),JSON.stringify(moves)); }
  const b=at(f5,12.75,'cafe'), b2=at(f5,12.75,'campus');
  check('大一上週五 12:45：在小福吃午餐（不在任何場景裡；人物線索寫「在小福吃午餐」）',b.w&&b.w.zone===null&&b.w.away==='在小福吃午餐'&&!b.n&&!b2.n,JSON.stringify(b.w));
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
// 明軒、方奕廷的寒暑假（BB_171 第 1 節，AA 分支 0e235ab8；AA-C 2026-10-17 定暑假每年同一段）
{ const P=(id,k)=>STORY.presence(id,{day:STORY.dayOfKey(k),flags:{},stage:'law'});
  const mx=['2026-02-12','2026-02-13','2026-02-19','2026-02-20','2026-08-09','2026-08-10','2026-08-16','2026-08-17','2027-08-12','2028-08-16'].map(k=>P('classmate_mingxuan',k).here);
  check('明軒：寒假 2/13～2/19 回彰化過年、暑假 8/10～8/16 回彰化（每年同一週）；其他日子在臺北',JSON.stringify(mx)==='[true,false,false,true,true,false,false,true,false,false]'&&P('classmate_mingxuan','2026-08-12').home==='彰化'&&P('classmate_mingxuan','2026-08-12').kind==='home',JSON.stringify(mx));
  const fy=['2026-01-23','2026-01-24','2026-02-18','2026-02-19','2026-07-05','2026-07-06','2026-07-19','2026-07-20','2027-07-10','2028-07-10'].map(k=>P('npc_fangyt',k).here);
  const an=['2028-01-23','2028-01-24','2028-01-28','2028-01-29'].map(k=>P('heroine_01',k).here);
  check('以安：大三寒假 1/24～1/28 回台中過年、1/29 回臺北（AA_275 第 12 節）',JSON.stringify(an)==='[true,false,false,true]',JSON.stringify(an));
  check('方奕廷：1/24 回台中、2/19 回宿舍；暑假 7/6～7/19 上山（每年同兩週）',JSON.stringify(fy)==='[true,false,false,true,true,false,false,true,false,false]'&&P('npc_fangyt','2026-07-10').kind==='trip'&&P('npc_fangyt','2026-02-01').home==='台中',JSON.stringify(fy)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

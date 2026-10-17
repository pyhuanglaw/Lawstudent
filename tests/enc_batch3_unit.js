// 自由出行第三批景點的 AA 六位偶遇（AA_271，AA-C 01e9d706／aa_walk_v1.json 0b478a53）：
//   1. 資料：六列、作息同一筆（dates、vacation、weeks 也一樣）、followUp＝之後在學校的一句、同行／離開／重訪的台詞都在、互動點都在景點上；
//   2. 新條件：dates（含頭尾；以安回台中、阿哲回高雄，除夕～初三不排）、vacation（語彤 D14 寒暑假）、weeks 陣列（柏翰第 6、7 週、小語第 3、6、11、14 週、芯慈第 4、12 週）；
//   3. 同行：小語 D01、阿哲 D29 不限關係；柏翰 D11 朋友以上；芯慈不一起走；
//   4. 修改前（9264002f）：沒有這六列、weeks 陣列被當成單雙週。
// 用法：node tests/enc_batch3_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}}; global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
global.CHAR={build:()=>({position:{x:0,y:0,z:0,set(){}},rotation:{y:0},userData:{}}),setExpr(){}};
let GG=null; const STAGE={};
global.SOCIAL={STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'],MEMORY_LABEL:{},
  stage:id=>GG.flags['dating_'+id]?'RELATIONSHIP':(STAGE[id]||'ACQUAINTANCE'),displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,
  has:(id,tag)=>!!(GG.social.mem[id]&&GG.social.mem[id].some(m=>m.tag===tag)),remember:(id,tag)=>{ (GG.social.mem[id]||(GG.social.mem[id]=[])).push({tag,day:GG.day}); },activity:()=>({})};
global.EVENTS={cond:c=>(c.flags||[]).every(f=>GG.flags[f]),npcOf:()=>null,onEnter(){},tick(){}};
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/places.js','src/story3d.js','src/home3d.js','src/outings3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/data/enc_walk.js','src/encounter3d.js'])
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|CHARACTERS|STORY|HOME|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|OUT|FREE_TRIPS|TRIP|ENCOUNTERS|ENC_WALK|ENC)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const B3={heroine_01:'D26',heroine_03:'D14',classmate_bohan:'D11',yu:'D01',classmate_xinci:'D02',zhe:'D29'};
const rowOf=(who,spot)=>ENCOUNTERS.rows.find(r=>r.who===who&&r.spot===spot);
const K=k=>STORY.dayOfKey(k);
const mk=(day,hour,o)=>{ const G=Object.assign({day,hour,weekday:CALENDAR.dateOf(day).wd%7,zone:'gongguan',flags:{},social:{mem:{}},courses:{},invites:[],money:5000,weather:'clear',stage:'law'},o||{}); GG=G; return G; };
const at=(G,spot)=>ENC.candidates(G,spot).map(c=>c.row.who).sort().join(',');
const why=(G,spot)=>{ const w=[]; ENC.candidates(G,spot,w); return w.join(' '); };
// 1. 資料
{ const bad=[], sch=[];
  for(const [who,spot] of Object.entries(B3)){ const r=rowOf(who,spot); if(!r){ bad.push(who+'@'+spot+':沒有這一列'); continue; }
    const e=(CHARACTERS[who].daily_schedule||[]).find(q=>q.enc===spot);
    if(!e||e.zone!==null||e.act!=='out'||e.away!==r.away||e.from!==r.from||e.to!==r.to||e.days.join()!==r.days.join()) { bad.push(who+'@'+spot+':作息'); continue; }
    for(const k of ['terms','weeks','dates','vacation']) if(JSON.stringify(e[k]||null)!==JSON.stringify(r[k]||null)) bad.push(who+'@'+spot+':'+k);
    const sp=TRIP.spot(spot); if(!sp) bad.push(spot+':沒有景點');
    const W=ENC_WALK.walk.filter(q=>q.who===who&&q.spot===spot); for(const q of W) if(q.act!=='walk'&&!(sp&&sp.points.some(p=>p.id===q.act))) bad.push(q.act+':互動點不在景點上');
    if(r.join!==false&&!W.length) bad.push(who+'@'+spot+':沒有同行台詞'); if(r.join!==false&&!ENC_WALK.leave.some(q=>q.who===who&&q.spot===spot)) bad.push(who+'@'+spot+':沒有離開');
    if(!ENC_WALK.revisit.some(q=>q.who===who&&q.spot===spot)) bad.push(who+'@'+spot+':沒有重訪');
    const s=ENCOUNTERS.school[r.memo]; if(!s||s.who!==who||!ENCOUNTERS.labels[r.memo]) sch.push(r.memo); }
  check('1. 六列都在、作息同一筆（時段、星期、terms、weeks、dates、vacation）、景點和互動點對得上、同行／離開／重訪都有',!bad.length,bad.join(' '));
  check('1. 每列的 memo 有人物頁的字和之後在學校的一句（aa_walk_v1 followUp）',!sch.length,sch.join(' '));
  const fu=JSON.parse(require('child_process').execSync('git show 0b478a53:docs/story_planning/free_trip/aa_walk_v1.json',{cwd:ROOT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']})||'{}').followUp||[];
  const diff=fu.filter(q=>Object.values(B3).some(sp=>q.mem==='ENC_'+sp+q.mem.slice(7))&&ENCOUNTERS.school[q.mem]&&ENCOUNTERS.school[q.mem].lines[0]!==q.line);
  check('1. 之後在學校的一句和 aa_walk_v1.json 的 followUp 一字不差',fu.length>0&&!diff.length,diff.map(q=>q.mem).join(' ')); }
// 2. 以安 D26：她回台中的日子的週六 14～17
{ STAGE.heroine_01='FRIEND';
  let G=mk(K('2026-01-24'),15); check('2. 以安 D26：2026-01-24（大一寒假）週六 15:00 在臺中',G.weekday===6&&at(G,'D26')==='heroine_01',at(G,'D26')+' '+why(G,'D26'));
  G=mk(K('2026-02-21'),15); check('2. 2026-02-21 週六：過了她回台中的日子（2/20 為止）',G.weekday===6&&at(G,'D26')==='');
  G=mk(K('2028-01-29'),15); check('2. 大三寒假 2028-01-29 週六：她留臺北，不在臺中',G.weekday===6&&at(G,'D26')==='');
  G=mk(K('2026-01-24'),17.5); check('2. 17:30：她回家了（14～17）',at(G,'D26')==='');
  check('2. dates 含頭尾：2026-01-20、2026-02-20 都算，2026-02-21 不算',STORY.inDates(mk(K('2026-01-20'),9),rowOf('heroine_01','D26').dates)&&STORY.inDates(mk(K('2026-02-20'),9),rowOf('heroine_01','D26').dates)&&!STORY.inDates(mk(K('2026-02-21'),9),rowOf('heroine_01','D26').dates));
  G=mk(K('2026-01-24'),15); const sv=STORY.schedEnt(CHARACTERS.heroine_01,G); check('2. 那個時段作息是「在台中」（朋友頁的位置照它；不會又在 Café）',!!sv&&sv.away==='在台中'&&sv.enc==='D26',JSON.stringify(sv&&{z:sv.zone,a:sv.away})); delete STAGE.heroine_01; }
// 3. 阿哲 D29：寒假 1/2～2/19、暑假 7/1～8/20，除夕～初三不排
{ let G=mk(K('2026-02-14'),15); check('3. 阿哲 D29：2026-02-14（除夕前兩天）週六 15:00 在高雄',G.weekday===6&&at(G,'D29')==='zhe',at(G,'D29')+' '+why(G,'D29'));
  G=mk(K('2027-02-06'),15); check('3. 2027-02-06 春節初一（週六）：在家，不排',G.weekday===6&&at(G,'D29')==='');
  G=mk(K('2028-07-08'),15); check('3. 大三暑假 2028-07-08 週六：在高雄',G.weekday===6&&at(G,'D29')==='zhe',why(G,'D29'));
  G=mk(K('2029-07-07'),15); check('3. 畢業以後的暑假 2029-07-07：沒有（大四寒假為止）',at(G,'D29')===''); }
// 4. 語彤 D14：心願以後、寒暑假的週日 15～19、雨天沒有
{ STAGE.heroine_03='FRIEND'; const sun=K('2026-07-05');
  let G=mk(sun,16,{flags:{WISH_DONE_heroine_03:true}}); check('4. 語彤 D14：大一暑假 2026-07-05 週日 16:00、心願完成、朋友',G.weekday===0&&at(G,'D14')==='heroine_03',at(G,'D14')+' '+why(G,'D14'));
  G=mk(sun,16); check('4. 心願還沒完成：不在',at(G,'D14')==='');
  G=mk(sun,16,{flags:{WISH_DONE_heroine_03:true},weather:'rain'}); check('4. 下雨：沒有偶遇',at(G,'D14')==='');
  G=mk(STORY.termDay('Y1S2',5,7),16,{flags:{WISH_DONE_heroine_03:true}}); check('4. 學期中的週日：不在（照 AA_162 在 D12／D13）',at(G,'D14')==='',why(G,'D14'));
  STAGE.heroine_03='FAMILIAR'; G=mk(sun,16,{flags:{WISH_DONE_heroine_03:true}}); check('4. 還沒到朋友：不在',at(G,'D14')===''); delete STAGE.heroine_03; }
// 5. weeks 陣列
{ STAGE.classmate_bohan='FAMILIAR';
  let G=mk(STORY.termDay('Y1S2',6,7),11); check('5. 柏翰 D11：大一下第 6 週週日 11:00',at(G,'D11')==='classmate_bohan',why(G,'D11'));
  G=mk(STORY.termDay('Y1S2',8,7),11); check('5. 第 8 週：不在（只有第 6、7 週）',at(G,'D11')==='');
  G=mk(STORY.termDay('Y1S1',6,7),11); check('5. 大一上第 6 週：不在（大一下～大二下）',at(G,'D11')==='');
  G=mk(STORY.termDay('Y3S1',3,7),14); check('5. 小語 D01：大三上第 3 週週日 14:00',at(G,'D01')==='yu',why(G,'D01'));
  G=mk(STORY.termDay('Y3S1',5,7),14); check('5. 第 5 週：不在（子晴那一週）',at(G,'D01')==='');
  G=mk(STORY.termDay('Y2S1',3,7),14); check('5. 大二：不在（大三起）',at(G,'D01')==='');
  G=mk(STORY.termDay('Y1S1',4,7),14); check('5. 芯慈 D02：第 4 週週日 14:00',at(G,'D02')==='classmate_xinci',why(G,'D02'));
  G=mk(STORY.termDay('Y1S1',5,7),14); check('5. 第 5 週：不在（第 4、12 週）',at(G,'D02')===''); delete STAGE.classmate_bohan; }
// 6. 同行
{ const tr=(who,st)=>{ STAGE[who]=st; return ENC.tier(GG,who); };
  let G=mk(STORY.termDay('Y3S1',3,7),14); G.trip={}; check('6. 小語 D01：認識就能一起走一段（不限關係）',ENC.canJoin(G,rowOf('yu','D01'),tr('yu','ACQUAINTANCE')));
  G=mk(STORY.termDay('Y1S2',6,7),11); G.trip={}; check('6. 柏翰 D11：有點熟不一起走、朋友才一起走',!ENC.canJoin(G,rowOf('classmate_bohan','D11'),tr('classmate_bohan','FAMILIAR'))&&ENC.canJoin(G,rowOf('classmate_bohan','D11'),tr('classmate_bohan','FRIEND')));
  G=mk(STORY.termDay('Y1S1',4,7),14); G.trip={}; check('6. 芯慈 D02：不一起走',!ENC.canJoin(G,rowOf('classmate_xinci','D02'),tr('classmate_xinci','FRIEND')));
  G=mk(K('2026-02-14'),15); G.trip={}; check('6. 阿哲 D29：認識就能一起走一段',ENC.canJoin(G,rowOf('zhe','D29'),tr('zhe','ACQUAINTANCE')));
  for(const k in STAGE) delete STAGE[k]; }
// 7. 修改前
{ let old=null; try{ old=require('child_process').execSync('git show 9264002f:src/data/encounters.js',{cwd:ROOT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!old) console.log('（略過第 7 項：沒有 9264002f 的歷史）'); else check('7. 修改前（9264002f）：沒有第三批景點的偶遇',!/spot:'D26'|spot:'D29'|spot:'D11'/.test(old)); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);

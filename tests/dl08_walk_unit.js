// DL-08 自由出行偶遇的第三批（AA_160 第 6 節定案；src/data/enc_walk.js＝aa_walk_v1＋bb_walk_v1）——不需要瀏覽器。
// 檢查：一起走一段（選單、她說她的一句、做完說離開的一句、熟悉照「一起去 Café 坐坐」、不是約會）、她沒有那件事的台詞就先走（以安不陪空畫框）、回去前道別、
//       前任不一起走、芯慈不一起走、芷若 19:30 以前不一起走；重訪旁白（這次沒遇到、上次打過招呼以後一次、分開以後用 afterBreakup）；芷若「同一排」小支線四步＋之後在 Café 那句；可昕同行時予樂的一句。
// 修改前：沒有 ENC.canJoin（第 1 項就失敗）。用法：node tests/dl08_walk_unit.js
//       之後在學校說一句、手機那兩則（隔天以後、一次）。
// 修改前：沒有 ENC（第 1 項就失敗）。用法：node tests/dl07_enc_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}}; global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
global.CHAR={build:()=>({position:{x:0,y:0,z:0,set(){}},rotation:{y:0},userData:{}}),setExpr(){}};
let GG=null; const STAGE={}, ACTS=[];
global.SOCIAL={STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'],MEMORY_LABEL:{},
  stage:id=>GG.flags['dating_'+id]?'RELATIONSHIP':(STAGE[id]||'ACQUAINTANCE'),displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,
  has:(id,tag)=>!!(GG.social.mem[id]&&GG.social.mem[id].some(m=>m.tag===tag)),remember:(id,tag)=>{ (GG.social.mem[id]||(GG.social.mem[id]=[])).push({tag,day:GG.day}); },activity:(id,k)=>{ ACTS.push(id+':'+k); return {}; }};
global.EVENTS={cond:c=>(c.flags||[]).every(f=>GG.flags[f]),npcOf:()=>null,onEnter(){},tick(){}};
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/places.js','src/story3d.js','src/outings3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/data/enc_walk.js','src/encounter3d.js'])
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|OUT|FREE_TRIPS|TRIP|ENCOUNTERS|ENC_WALK|ENC)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
// 1. 資料一致
{ const bad=[]; for(const r of ENCOUNTERS.rows){ if(r.kexin) continue; const e=(CHARACTERS[r.who].daily_schedule||[]).find(q=>q.enc===r.spot&&q.from===r.from&&q.to===r.to); if(!e||e.zone!==null||e.act!=='out'||e.away!==r.away||e.days.join()!==r.days.join()||(r.terms||null)&&JSON.stringify(e.terms)!==JSON.stringify(r.terms)&&!(e.terms&&r.terms==null)) bad.push(r.who+'@'+r.spot); }
  check('1. 每一列（可昕以外）在 characters.js 有同一個時段的 away（enc、星期、學期一樣）',!bad.length,bad.join(' '));
  const n={D04:0,D06:0,D12:0,D13:0}; for(const r of ENCOUNTERS.rows) n[r.spot]++; check('1. 四個景點：西門町 6、北美館 3（沛珊大三起那一列拿掉，AA_282）、大稻埕 3、淡水 2（AA_160 5-6）',n.D04===6&&n.D06===3&&n.D12===3&&n.D13===2,JSON.stringify(n));
  const memos=ENCOUNTERS.rows.map(r=>r.memo).filter(Boolean); check('1. 每個 memo 都有人物頁的字和之後的一句（沛珊 D20 那一列拿掉＝30 個，AA_282）',memos.length===30&&memos.every(m=>ENCOUNTERS.labels[m]&&ENCOUNTERS.school[m]&&ENCOUNTERS.school[m].who===ENCOUNTERS.rows.find(r=>r.memo===m).who),memos.join(' '));
  check('1. 記憶的字接進 SOCIAL.MEMORY_LABEL',SOCIAL.MEMORY_LABEL.ENC_D06_AN==='在美術館遇到她');
  const ev=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8'); const se=ev.slice(0,ev.indexOf('const SMALLTALK'));
  check('2. R7：劇情事件（STORY_EVENTS）不讀 ENC_',se.indexOf('ENC_')<0); }
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mk=(day,hour,o)=>{ const G=Object.assign({day,hour,weekday:CALENDAR.dateOf(day).wd%7,zone:'gongguan',flags:{dating_kexin:true},social:{mem:{}},courses:{},invites:[],money:5000,weather:'clear',stage:'law'},o||{}); GG=G; return G; };
const SAT=STORY.termDay('Y1S1',5,6), SUN=STORY.termDay('Y1S1',5,7), SUN6=STORY.termDay('Y1S1',6,7);
const mkGM=(G,ans)=>{ const q=(ans||[]).slice(); const L={says:[],menus:[]}; return {G,L,sceneBegin(){},sceneEnd(){},fade:async()=>{},titleCard:async()=>{},say:async(w,t)=>{ L.says.push((w?(w.name||w)+'：':'')+t); },toast(){},advance(h){ G.hour+=h; },money(d){ G.money+=d; },autosave(){},enter:async(z)=>{ G.zone=z; },
  choose:async o=>{ L.menus.push(o.map(x=>x.t)); if(!q.length) return o.length-1; const a=q.shift(); return typeof a==='string'?o.findIndex(x=>x.t===a):a; } }; };
const force=(G,spot,who,m)=>{ ENC.rec(G).enc[ENC.key(G,spot)]={who,m:m||0}; };
const RW=r=>ENCOUNTERS.rows.find(q=>q.who===r[0]&&q.spot===r[1]);
(async()=>{
  check('10. 第三批的資料：同行 94 句組（沛珊 D06.cafe 拿掉，AA_263 C22）、離開 31、重訪 36、小支線 3（第三批景點：AA_271 加 15、5、6，BB_213 加 15、5、5）',ENC_WALK.walk.length===94&&ENC_WALK.leave.length===31&&ENC_WALK.revisit.length===36&&ENC_WALK.side.length===3&&typeof ENC.canJoin==='function');
  // 一起走一段
  { const G=mk(SAT,19.5); G.trip={spot:'D04',p:[],done:[],walk:0}; const tr=ENC.tier(G,'zhe'); check('11. 阿哲（認識）在西門町：可以一起走（不限關係）',ENC.canJoin(G,RW(['zhe','D04']),tr));
    check('11. 芯慈不一起走（join:false）',!ENC.canJoin(mk(SAT,20.5,{trip:{}}),RW(['classmate_xinci','D04']),ENC.tier(G,'classmate_xinci')));
    STAGE.heroine_02='FRIEND'; const G2=mk(SAT,19); G2.trip={}; check('11. 芷若 19:00（電影快開演）不一起走；19:30 以後可以',!ENC.canJoin(G2,RW(['heroine_02','D04']),ENC.tier(G2,'heroine_02'))&&(G2.hour=19.6,ENC.canJoin(G2,RW(['heroine_02','D04']),ENC.tier(G2,'heroine_02')))); delete STAGE.heroine_02;
    const G3=mk(SUN,10.5); G3.trip={}; G3.flags.EX_heroine_01=true; G3.flags.ROMANCE_HISTORY=[{id:'heroine_01',to:'Y1S1W3',how:'apart_life'}]; check('11. 前任不一起走',!ENC.canJoin(G3,RW(['heroine_01','D06']),ENC.tier(G3,'heroine_01')));
    const G4=mk(SUN,10.5); G4.trip={}; check('11. 以安只是認識：不一起走（朋友以上）',!ENC.canJoin(G4,RW(['heroine_01','D06']),ENC.tier(G4,'heroine_01'))); }
  { const G=mk(SAT,19); force(G,'D04','zhe',0); G.hour=18.75; ACTS.length=0; const gm=mkGM(G,[0,'一起走一段','在徒步區走走','回去','回公館']); await TRIP.menu(gm);
    const L=gm.L.says; const Zg=t=>ENC.zheGe(G,'zhe',t);   /* AA_209 第 4 節第 6 點：沒有 ZHE_CALLS_GE 的玩家，阿哲的「哥」拿掉 */
    const walkLine=Zg(ENC_WALK.walk.find(w=>w.who==='zhe'&&w.spot==='D04'&&w.act==='walk').friend[0]), leave=Zg(ENC_WALK.leave.find(w=>w.who==='zhe'&&w.spot==='D04').friend);
    check('12. 偶遇的選單多「一起走一段」',gm.L.menus.some(m=>m.join()==='打招呼,不打擾,一起走一段'),JSON.stringify(gm.L.menus));
    const iw=L.findIndex(t=>t==='阿哲：'+walkLine), il=L.findIndex(t=>t==='阿哲：'+leave);
    check('12. 散步以後阿哲說他的一句、然後說離開的一句',iw>0&&il>iw,JSON.stringify(L.slice(-6)));
    check('12. 熟悉照「一起去 Café 坐坐」（SOCIAL.activity cafe）、今天第一次聊天；不加戀愛',ACTS.includes('zhe:cafe')&&ACTS.includes('zhe:chat'),ACTS.join());
    check('12. 走完她去忙她的事：G.trip.with 清掉（回去時沒有第二次道別）',L.filter(t=>t==='阿哲：'+leave).length===1); }
  { STAGE.heroine_01='FRIEND'; const G=mk(SUN,10.25); force(G,'D06','heroine_01',0); const gm=mkGM(G,[1,'一起走一段','那件只有空畫框的作品','回去','回公館']); await TRIP.menu(gm); const L=gm.L.says;
    const leave='沈以安：'+ENC_WALK.leave.find(w=>w.who==='heroine_01'&&w.spot==='D06').friend, frame=TRIP.spot('D06').points.find(p=>p.id==='D06.frame').lines[0];
    check('13. 以安不陪「空畫框」：選了那一件，她先說離開的一句，你一個人去看',L.indexOf(leave)>=0&&L.indexOf(frame)>L.indexOf(leave),JSON.stringify(L.slice(-5)));
    const G2=mk(SUN,10.25); force(G2,'D06','heroine_01',0); const gm2=mkGM(G2,[1,'一起走一段','回去','回公館']); await TRIP.menu(gm2); check('13. 一起走著直接回去：她先道別',gm2.L.says.includes(leave)); delete STAGE.heroine_01; }
  // 重訪
  { const G=mk(SAT,19); force(G,'D04','zhe',0); G.hour=18.75; await TRIP.menu(mkGM(G,[0,'打招呼','回去','回公館']));
    const S2=STORY.termDay('Y1S1',6,6); const G2=mk(S2,18.75); G2.daily=JSON.parse(JSON.stringify(G.daily)); G2.social=G.social; GG=G2; ENC.rec(G2).enc[ENC.key(G2,'D04')]={who:null,m:0}; const gm=mkGM(G2,[0,'回去','回公館']); await TRIP.menu(gm);
    const rv=ENC_WALK.revisit.find(r=>r.who==='zhe'&&r.spot==='D04').normal; check('14. 下一週再去西門町、沒遇到阿哲：重訪的旁白一次',gm.L.says.includes(rv),JSON.stringify(gm.L.says.slice(0,3)));
    const G3=mk(S2+1,18.75); G3.daily=G2.daily; G3.social=G2.social; GG=G3; ENC.rec(G3).enc[ENC.key(G3,'D04')]={who:null,m:0}; const gm3=mkGM(G3,[0,'回去','回公館']); await TRIP.menu(gm3);
    check('14. 再去一次：不再說（要再遇到、打過招呼才會再說）',!gm3.L.says.includes(rv));
    const G4=mk(S2+1,18.75); G4.daily={encLast:{'heroine_01@D06':SAT-7},encRev:{}}; G4.flags.EX_heroine_01=true; G4.flags.ROMANCE_HISTORY=[{id:'heroine_01',to:'Y1S1W4',how:'apart_drift'}]; GG=G4; ENC.rec(G4);
    const said=[]; await ENC.revisit({G:G4,say:async(w,t)=>said.push(t)},TRIP.spot('D06')); check('14. 分開以後：afterBreakup「你經過那張城市地圖。你沒有停下來。」',said[0]==='你經過那張城市地圖。你沒有停下來。',said.join()); }
  // 小支線：芷若「同一排」
  { STAGE.heroine_02='FRIEND'; const days=[1,2,3,4].map(w=>STORY.termDay('Y1S1',w+4,6)); let G=null, out=[]; const share={daily:{},social:{mem:{}}};
    for(let k=0;k<4;k++){ G=mk(days[k],19.6); G.daily=share.daily; G.social=share.social; GG=G; force(G,'D04','heroine_02',0); const gm=mkGM(G,[0,'打招呼','是故意的','回去','回公館']); await TRIP.menu(gm); out.push(gm.L.says.join('|')); }
    check('15. 芷若：第二週「又遇到了。……我們看電影的時間好像一樣。」',out[1].includes('又遇到了。……我們看電影的時間好像一樣。'),out[1].slice(0,200));
    check('15. 第三週：「第三次了。我開始覺得，你是故意的。」＋選項「是故意的。」→「嗯。」',out[2].includes('第三次了。我開始覺得，你是故意的。')&&out[2].includes('林芷若：嗯。'));
    check('15. 第四週：「下次直接約。不要靠運氣。」、記 ENC_D04_ZR3（不改任何約會條件）',out[3].includes('下次直接約。不要靠運氣。')&&SOCIAL.has('heroine_02','ENC_D04_ZR3'));
    const Gc=mk(days[3]+1,15,{zone:'cafe'}); Gc.daily=share.daily; Gc.social=share.social; GG=Gc; const q=ENC.schoolLine(Gc,'heroine_02'); check('15. 之後在 Café：西門町那句先說；說完再聊才是「那部老片下週重映。……我只是告訴你。」',!!q&&(q.tag==='ENC_D04_ZR'||q.tag==='ENC_D04_ZR3'),JSON.stringify(q));
    ENC.markSaid(Gc,q.tag); const q2=ENC.schoolLine(Gc,'heroine_02'); check('15. 第二次聊天：另一句',!!q2&&q2.tag!==q.tag&&(q2.lines[0]==='那部老片下週重映。……我只是告訴你。'||q.lines[0]==='那部老片下週重映。……我只是告訴你。'),JSON.stringify(q2)); delete STAGE.heroine_02; }
  // 可昕同行：予樂的一句
  { const G=mk(SAT,19); force(G,'D04','kexin',0); G.hour=18.75; const gm=mkGM(G,[0,'一起走一段','回去','回公館']); await TRIP.menu(gm);
    check('16. 可昕（交往中）在西門町一起走：予樂「我去買東西。……很久。」',gm.L.says.includes('予樂：我去買東西。……很久。'),JSON.stringify(gm.L.says.slice(0,6))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

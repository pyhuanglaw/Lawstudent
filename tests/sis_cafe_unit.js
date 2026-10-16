// Café 的學姊（BB_120 1-1；使用者 2026-10-14「在咖啡廳遇到溫學姊跟他講話好像也沒有增進什麼感情」）：晚上在 Café 每晚第一次和她說話是一個小場面。不需要瀏覽器：
//   1. 晚上 7 點以前不演（照舊）；2. 第一次：打招呼（照關係）→ 小交流 →（她推過來的便條，件數照關係），聊天算一次（熟悉 +2）；
//   3. 同一晚再找她：只有「我在念。十點再說。」；4. 小交流輪流：「今天念了什麼？」→ 她的小事（三則輪流）；
//   5. 今天有自學才有「（說今天念的那一科）」，選了她在便條上寫「可。」；6. W8（ev_sis_collapse）以前一律算「有點熟」（打招呼、便條三件）、之後照關係；
//   7. talkSis：門檻台詞之後、在 Café 才演。修正前（沒有 STORY.sisCafe）這個測試會失敗。用法：node tests/sis_cafe_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
global.CHAR={build:()=>({position:{set(){}},rotation:{y:0},userData:{}}),setExpr(){}}; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
let W8=false; global.EVENTS={cond:c=>!!(c&&c.events&&c.events[0]==='ev_sis_collapse'&&W8),habit(){},onInteract:()=>false,npcOf:()=>null,onEnter(){},tick(){}};
const load=(f,names)=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(new RegExp('^const ('+names+')\\s*=','mg'),'global.$1='),{filename:f});
load('src/data/characters.js','CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS'); load('src/social3d.js','SOCIAL');
for(const f of ['src/data/rel_lines.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f,'REL_LINES|PLACES|CALENDAR|COURSES|STORY|CLS');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
if(typeof STORY!=='undefined') STORY.sisW8=()=>W8;   /* W8 之後＝STORY.sisW8（AA_177 第 8 節①：演過或過了大二上第 12 週）；這個測試直接控制 W8，時間的部分在 tests/v3_sis_w8_unit.js */
check('STORY.sisCafe 存在',typeof STORY.sisCafe==='function'); if(typeof STORY.sisCafe!=='function'){ console.log('FAILED: '+fails); process.exit(1); }
const G={rel:{},flags:{met_sis:true},social:null,day:30,weekday:1,hour:20,name:'祐廷',zone:'cafe'}; SOCIAL.bind(G);
const R=(fam,trust,comf)=>{ const r=SOCIAL.rel('heroine_05'); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
function mk(picks){ const out=[]; return {G,out,say:async(w,t)=>{ out.push((w?'S:':'N:')+t); },choose:async(o)=>{ out.push('C:'+o.map(x=>x.t).join('/')); return picks&&picks.length?picks.shift():0; }}; }
const n={name:'溫學姊'};
(async()=>{
  R(8); G.hour=18.5; let gm=mk(); check('1. 晚上 7 點以前不演（照舊的閒聊）',(await STORY.sisCafe(gm,n))===false&&!gm.out.length);
  G.hour=20; const f0=SOCIAL.rel('heroine_05').fam; gm=mk([0]); const ok=await STORY.sisCafe(gm,n);
  check('2. 第一次（認識）：打招呼 →「今天念了什麼？」（今天沒自學：沒有「說今天念的那一科」）→ 選「今天沒念。」→ 便條三件（字太醜）',ok&&gm.out.join('｜')==='S:「學弟。……你的筆記帶了嗎？」｜S:「今天念了什麼？」｜C:今天沒念。/學姊呢？｜S:「好。今天沒念，明天念。」｜S:「……重點是你說實話。」｜N:（她推過來一張便條。三件事，寫得很滿。第三件常常是「字太醜」。）',gm.out.join('｜'));
  check('2. 聊天算一次（今天第一次聊天熟悉 +2，AA_124 1-2）',SOCIAL.rel('heroine_05').fam===f0+2,f0+' → '+SOCIAL.rel('heroine_05').fam);
  gm=mk(); await STORY.sisCafe(gm,n); check('3. 同一晚再找她：只有一句',gm.out.join('｜')==='S:「我在念。十點再說。」',gm.out.join('｜'));
  G.day=31; R(25); gm=mk([1]); await STORY.sisCafe(gm,n);
  check('4. 隔天（有點熟）：打招呼換成「三件事。一，坐。…」、小交流輪到她的小事（第二杯）、便條「下次帶筆記」',gm.out.join('｜')==='S:「三件事。一，坐。二，芷若說你還沒點。三，等我寫完這段。」｜S:「我在想要不要點第二杯。……你說。」｜C:點。/會睡不著。｜S:「……這是我會說的話。」｜N:（她推過來一張便條。還是三件事。第三件換成「下次帶筆記」。）',gm.out.join('｜'));
  G.day=32; CLS.rec(G).lastStudy={day:32,id:'civ_gen1',name:'民法總則'}; gm=mk([0]); await STORY.sisCafe(gm,n);
  check('5. 今天有自學：多一個「（說今天念的民法總則）」，選了她在便條上寫「可。」',gm.out[2]==='C:（說今天念的民法總則）/今天沒念。/學姊呢？'&&gm.out[3]==='S:「好。講給我聽。三句以內。」'&&gm.out[4]==='N:（你講了。她在便條上寫：「可。」）',gm.out.join('｜'));
  G.day=33; gm=mk([0]); await STORY.sisCafe(gm,n); check('4. 她的小事三則輪流：第二次是芷若的新蛋糕',gm.out[1]==='S:「芷若的新蛋糕。我不知道是什麼。」',gm.out.join('｜'));
  G.day=34; R(65,50,45); W8=false; gm=mk([0]); await STORY.sisCafe(gm,n);
  check('6. 關係是好朋友但 W8 還沒發生：打招呼、便條都還是「有點熟」（三件事）',gm.out[0]==='S:「三件事。一，坐。二，芷若說你還沒點。三，等我寫完這段。」'&&/還是三件事/.test(gm.out[gm.out.length-1]),gm.out.join('｜'));
  G.day=35; W8=true; gm=mk([0]); await STORY.sisCafe(gm,n);
  check('6. W8 之後（好朋友）：她把對面的椅子拉開、便條只有一件「回去小心」',gm.out[0]==='N:（她把對面的椅子拉開）'&&gm.out[1]==='S:「……一件事。坐。」'&&/只有一件：「回去小心。」/.test(gm.out[gm.out.length-1]),gm.out.join('｜'));
  const s3=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), ts=s3.slice(s3.indexOf('async function talkSis(GM,n)'),s3.indexOf('async function talkSis(GM,n)')+900);
  check('7. talkSis：門檻台詞之後、在 Café（見過面以後）才演小場面',ts.indexOf("relUp(GM,'heroine_05',n)")>=0&&ts.indexOf("relUp(GM,'heroine_05',n)")<ts.indexOf("F.met_sis&&G.zone==='cafe'&&await sisCafe(GM,n)"));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });

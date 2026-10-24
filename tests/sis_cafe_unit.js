// Café 的學姊（BB_120 1-1；使用者 2026-10-14「在咖啡廳遇到溫學姊跟他講話好像也沒有增進什麼感情」）：晚上在 Café 每晚第一次和她說話是一個小場面。不需要瀏覽器：
//   1. 晚上 7 點以前不演（照舊）；2. 第一次：打招呼（照關係）→ 小交流 →（她推過來的便條，件數照關係），聊天算一次（熟悉 +2）；
//   3. 同一晚再找她：只有「我在念。十點再說。」；4. 小交流輪流：「今天念了什麼？」→ 她的小事（三則輪流）；
//   5. 今天有自學才有「（說今天念的那一科）」，選了她在便條上寫「可。」；6. 照關係（AA_219 A-11：W8 以前一律算「有點熟」的上限拿掉）；
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
  check('2. 第一次（認識）：打招呼 →「今天念了什麼？」（今天沒自學：沒有「說今天念的那一科」）→ 選「今天沒念。」→ 便條一句（爭點抓錯了；AA_398 第 1 列）',ok&&gm.out.join('｜')==='S:「學弟。……你的筆記帶了嗎？」｜S:「今天念了什麼？」｜C:今天沒念。/學姊呢？｜S:「好。那明天念。」｜N:（她推過來一張便條。便條只有一行：「第二題的爭點抓錯了。」字很小。）',gm.out.join('｜'));
  check('2. 聊天算一次（今天第一次聊天熟悉 +2，AA_124 1-2）',SOCIAL.rel('heroine_05').fam===f0+2,f0+' → '+SOCIAL.rel('heroine_05').fam);
  gm=mk(); await STORY.sisCafe(gm,n); check('3. 同一晚再找她：只有一句',gm.out.join('｜')==='S:「我在念。十點再說。」',gm.out.join('｜'));
  G.day=31; R(25); gm=mk([1]); await STORY.sisCafe(gm,n);
  check('4. 隔天（有點熟）：打招呼換成「你來了喔。」（BB_169 W-8）、小交流輪到她的小事（再點一杯）、便條「下次帶筆記」',gm.out.join('｜')==='S:「你來了喔。」｜S:「我這段還沒寫完，你先點沒關係。」｜S:「我在想要不要再點一杯。你覺得呢？」｜C:點。/會睡不著。｜S:「……也是。那不點了。」｜N:（她推過來一張便條。便條上寫：「下次帶筆記來。」）',gm.out.join('｜'));
  G.day=50; CLS.rec(G).lastStudy={day:50,id:'civ_gen1',name:'民法總則'}; gm=mk([0]); await STORY.sisCafe(gm,n);
  check('5. 今天有自學：多一個「（說今天念的民法總則）」，選了她在便條上寫「可。」',gm.out[3]==='C:（說今天念的民法總則）/今天沒念。/學姊呢？'&&gm.out[4]==='S:「好，講給我聽。講重點就好。」'&&gm.out[5]==='N:（你講了。她在便條上寫：「可。」）',gm.out.join('｜'));
  G.day=51; gm=mk([0]); await STORY.sisCafe(gm,n); check('4. 她的小事三則輪流：第二次是芷若的新蛋糕',gm.out[2]==='S:「芷若的新蛋糕。我不知道是什麼。」',gm.out.join('｜'));
  G.day=52; R(65,50,45); W8=false; gm=mk([0]); await STORY.sisCafe(gm,n);
  check('6. 關係是好朋友、W8 還沒發生：照一般階段（AA_219 A-11 拿掉 W8 上限）＝她把對面的椅子拉開、便條只有一件「回去小心」',gm.out[0]==='N:（她把對面的椅子拉開）'&&/便條上只寫：「回去小心。」/.test(gm.out[gm.out.length-1]),gm.out.join('｜'));
  G.day=53; W8=true; gm=mk([0]); await STORY.sisCafe(gm,n);
  check('6. W8 之後（好朋友）：她把對面的椅子拉開、便條只有一件「回去小心」',gm.out[0]==='N:（她把對面的椅子拉開）'&&gm.out[1]==='S:「坐啊。」'&&/便條上只寫：「回去小心。」/.test(gm.out[gm.out.length-1]),gm.out.join('｜'));
  // 她累的晚上（BB_169 W-11）：單週週六法服值班（第 32 天＝2025-10-18 週六、第 7 週）、日曆標的考試週（第 34 天＝期中考週）：FAMILIAR 以上只點頭；認識照舊
  G.day=32; R(25); gm=mk([0]); await STORY.sisCafe(gm,n); check('8. 祐廷大一那年單週週六（法服值班日）不算累（她在準備法研所、不值法服；AA_284 1-6）：照一般招呼',STORY.fafuDuty(G)&&gm.out[0]!=='N:（她抬頭看了你一下，點點頭。）',gm.out.join('｜'));
  { const d14=STORY.termDay('Y1S1',14,3); G.day=d14; G.hour=20; delete G.flags.SIS_CAFE; R(25); gm=mk([0]); await STORY.sisCafe(gm,n); check('8b. 大一第 14 週（她準備筆試）有點熟：招呼只有「（她抬頭看了你一下，點點頭。）」',gm.out[0]==='N:（她抬頭看了你一下，點點頭。）',gm.out.join('｜')); }
  { let d=STORY.termDay('Y2S1',5,6); if(!STORY.fafuDuty({day:d,stage:'law',flags:{}})) d=STORY.termDay('Y2S1',7,6); G.day=d; G.hour=20; delete G.flags.SIS_CAFE; R(25); gm=mk([0]); await STORY.sisCafe(gm,n); check('8c. 大二起單週週六法服值班照舊算累',STORY.fafuDuty(G)&&gm.out[0]==='N:（她抬頭看了你一下，點點頭。）',gm.out.join('｜')); G.day=32; delete G.flags.SIS_CAFE; }
  G.day=34; R(65,50,45); gm=mk([0]); await STORY.sisCafe(gm,n); check('8. 期中考週（看日曆的 exam 標記）好朋友：一樣只點頭',CALENDAR.termOf(34).exam==='mid'&&gm.out[0]==='N:（她抬頭看了你一下，點點頭。）'&&gm.out[1]!=='S:「坐啊。」',gm.out.join('｜'));
  G.day=40; R(8); gm=mk([0]); await STORY.sisCafe(gm,n); check('8. 考試週但只是認識：照認識的招呼',gm.out[0]==='S:「學弟。……你的筆記帶了嗎？」',gm.out.join('｜'));
  const s3=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), ts=s3.slice(s3.indexOf('async function talkSis(GM,n)'),s3.indexOf('async function talkSis(GM,n)')+900);
  check('7. talkSis：門檻台詞之後、在 Café（見過面以後）才演小場面',ts.indexOf("relUp(GM,'heroine_05',n)")>=0&&ts.indexOf("relUp(GM,'heroine_05',n)")<ts.indexOf("F.met_sis&&G.zone==='cafe'&&await sisCafe(GM,n)"));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });

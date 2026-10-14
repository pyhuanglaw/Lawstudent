// 邀約的個性（INVITE_DATA.people；AA_70 第 2 節＋BB_121 的建議欄、BB_70 第 1～7 節，AA、BB 2026-10-14 互審同意，第②級）：
// 約人的時候，對方照自己的個性回答，不是每個人都「某某答應了。」（使用者 2026-10-14：「約了朋友在溫州街散步是不是沒有增加好感」「手機只能約阿哲小凱」）。不需要瀏覽器：
//   1. 答應的台詞照階段（以安吃飯「認識、有點熟」／「朋友以上」）；2. 照作息她本來就在那裡＝「就在那裡」（以安平日上午的總圖、芷若上班的 Café）：不算邀約、不問改天；
//   3. 以安大一的散步：「散步的目的是？」「沒有目的。」（祐廷說）→ 改天；大二以後「好。理由：今天想。」；
//   4. 語彤週二週四晚上在麵店幫忙：麵店＝「我就在店裡。你來。」、其他＝「麵店。」「你來店裡就好。」（婉拒，不問改天）；「認識」約 Café＝「……那裡很貴。」「總圖可以。」；第一次散步改到週六；
//   5. 柏翰：總圖照常、其他地方改到念完書（九點十分）；6. 芯慈：當天約吃飯改到隔天；7. 學姊：W8 以前不散步（不給改天）、平日 9–17 在總圖；
//   8. 明軒家教、阿凱的總圖、阿哲吃飯；9. 時間的中文（九點十分、十點半）；10. 手機上約：她的話寫「某某（手機）」；沒有個性資料的人照舊（旁白）；
//   11. 「第一次」散步的台詞只有第一次。修正前（INVITE_DATA.people 是空的、沒有 INV.personal）這個測試會失敗。用法：node tests/invite_people_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
global.CHAR={build:()=>({position:{set(){}},rotation:{y:0},userData:{}}),setExpr(){}}; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
let W8=false; global.EVENTS={cond:c=>!!(c&&c.events&&c.events[0]==='ev_sis_collapse'&&W8),habit(){},onInteract:()=>false,npcOf:()=>null,onEnter(){},tick(){}};
const load=(f,names)=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(new RegExp('^const ('+names+')\\s*=','mg'),'global.$1='),{filename:f});
load('src/data/calendar.js','CALENDAR'); load('src/data/places.js','PLACES'); load('src/data/characters.js','CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS'); load('src/social3d.js','SOCIAL');
for(const f of ['src/data/rel_lines.js','src/data/courses.js','src/data/invites.js','src/invites3d.js','src/story3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f,'REL_LINES|COURSES|INVITE_DATA|INV|STORY');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('INV.personal 存在、INVITE_DATA.people 有資料',typeof INV.personal==='function'&&Object.keys(INVITE_DATA.people||{}).length>=13,Object.keys(INVITE_DATA.people||{}).length);
if(typeof INV.personal!=='function'){ console.log('FAILED: '+fails); process.exit(1); }
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const dayW=(wd,wk)=>{ for(let d=1;d<400;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===(wk||5)&&wdOf(d)===wd) return d; } return null; };
let G=null;
const fresh=(day,hour)=>{ G={v:3,day,hour,weekday:wdOf(day),zone:'campus',weather:'clear',flags:{},rel:{},social:null,invites:[],msgs:[],contacts:{},name:'祐廷'}; SOCIAL.bind(G); };
const rel=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; SOCIAL.remember(id,'FIRST_MET','x'); };
const P=pid=>INV.place(pid);
const ask=(id,pid,day,h)=>INV.personal(G,id,P(pid),day,h,INV.decide(G,id,pid,day,h));
const L=r=>(r.lines||[]).map(x=>typeof x==='object'?'祐廷:'+x.me:x).join('｜');
const MON=dayW(1), TUE=dayW(2), THU=dayW(4), SAT=dayW(6);
// 1 以安吃飯
fresh(MON,9); rel('heroine_01',25,10,5);
let r=ask('heroine_01','noodle',MON,12+10/60); check('1. 以安「有點熟」約吃飯：「……好。但我只吃一碗。」（答應）',r.res==='accept'&&L(r)==='「……好。但我只吃一碗。」',r.res+' '+L(r));
rel('heroine_01',45,30,10); r=ask('heroine_01','noodle',MON,12+10/60); check('1. 以安「朋友」約吃飯：（她答應了，而且會先查好要點什麼。）',r.res==='accept'&&L(r)==='（她答應了，而且會先查好要點什麼。）',L(r));
// 2 就在那裡
r=ask('heroine_01','library',MON,10); check('2. 以安平日上午本來就在總圖：「我本來就在總圖。二樓靠窗。」（就在那裡，不問改天）',r.res==='here'&&L(r)==='「我本來就在總圖。二樓靠窗。」'&&!r.alt,r.res+' '+L(r));
r=ask('heroine_01','library',MON,19); check('2. 以安晚上（不在總圖）：照常答應、沒有那一句',r.res==='accept'&&!/本來就在總圖/.test(L(r)),r.res+' '+L(r));
fresh(MON,9); rel('heroine_02',12,4,2); r=ask('heroine_02','cafe',MON,12+10/60);
check('2. 芷若上班時約 Café：「我就在 Café 啊。你來，我做給你。」',r.res==='here'&&L(r)==='「我就在 Café 啊。你來，我做給你。」',r.res+' '+L(r));
// 3 以安散步
fresh(MON,9); rel('heroine_01',45,30,10); r=ask('heroine_01','wenzhou',MON,15.5);
check('3. 以安大一約散步：「散步的目的是？」祐廷「沒有目的。」「……好。我在手帳排一個『沒有目的』的時段。」→ 改天（明天以後）',r.res==='resched'&&L(r)==='「散步的目的是？」｜祐廷:「沒有目的。」｜「……好。我在手帳排一個『沒有目的』的時段。」'&&r.alt&&r.alt.day>MON,r.res+' '+L(r)+' '+JSON.stringify(r.alt));
const Y2=(()=>{ for(let d=200;d<900;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y2S1'&&wdOf(d)===1&&t.week===5) return d; } })();
fresh(Y2,9); rel('heroine_01',45,30,10); r=ask('heroine_01','wenzhou',Y2,15.5); check('3. 以安大二以後：「好。理由：今天想。」',r.res==='accept'&&L(r)==='「好。理由：今天想。」',r.res+' '+L(r));
// 4 語彤
fresh(TUE,9); rel('heroine_03',25,8,4); r=ask('heroine_03','noodle',TUE,18);
check('4. 語彤週二晚上約麵店：「我就在店裡。你來。」',r.res==='here'&&L(r)==='「我就在店裡。你來。」'&&!r.alt,r.res+' '+L(r));
r=ask('heroine_03','cafe',TUE,18); check('4. 語彤週二晚上約 Café：「麵店。」「你來店裡就好。」（婉拒，不問改天）',r.res==='decline'&&L(r)==='「麵店。」｜「你來店裡就好。」'&&!r.alt,r.res+' '+L(r));
r=ask('heroine_03','cafe',TUE,15.5); check('4. 語彤「有點熟」約 Café：「……那裡很貴。」「總圖可以。」（婉拒）',r.res==='decline'&&L(r)==='「……那裡很貴。」｜「總圖可以。」',r.res+' '+L(r));
r=ask('heroine_03','noodle',MON,12+10/60); check('4. 語彤「有點熟」約吃飯：「……我阿姨的店？」「好。阿姨會多給你一顆滷蛋。」',r.res==='accept'&&L(r)==='「……我阿姨的店？」｜「好。阿姨會多給你一顆滷蛋。」',L(r));
rel('heroine_03',45,30,10); r=ask('heroine_03','wenzhou',MON,15.5);
check('4. 語彤「朋友」第一次約散步（週一）：「週六。我本來就在。」→ 改到週六',r.res==='resched'&&L(r)==='「週六。我本來就在。」'&&r.alt&&wdOf(r.alt.day)===6,r.res+' '+L(r)+' '+JSON.stringify(r.alt));
fresh(SAT,9); rel('heroine_03',45,30,10); r=ask('heroine_03','wenzhou',SAT,15.5); check('4. 語彤第一次約散步就在週六：答應「週六。我本來就在。」',r.res==='accept'&&L(r)==='「週六。我本來就在。」',r.res+' '+L(r));
// 5 柏翰
fresh(MON,9); rel('classmate_bohan',25,8,4); r=ask('classmate_bohan','cafe',MON,15.5);
check('5. 柏翰約 Café：「我要念書。……九點十分可以。」→ 改到今天 21:10',r.res==='resched'&&L(r)==='「我要念書。……{zh}可以。」'&&r.alt&&r.alt.day===MON&&Math.abs(r.alt.h-(21+10/60))<0.01,r.res+' '+L(r)+' '+JSON.stringify(r.alt));
r=ask('classmate_bohan','library',MON,15.5); check('5. 柏翰約總圖：照常答應',r.res==='accept',r.res);
// 6 芯慈
fresh(MON,9); rel('classmate_xinci',25,8,4); r=ask('classmate_xinci','noodle',MON,12+10/60);
check('6. 芯慈當天約吃飯：「我要先算時間。……好，可以。」→ 改到明天',r.res==='resched'&&L(r)==='「我要先算時間。……好，可以。」'&&r.alt&&r.alt.day===MON+1,r.res+' '+JSON.stringify(r.alt));
r=ask('classmate_xinci','noodle',MON+1,18.5); check('6. 芯慈隔天的吃飯（週二 18:30）：答應（同一句）',r.res==='accept'&&L(r)==='「我要先算時間。……好，可以。」',r.res+' '+L(r));
// 7 學姊
const Y3=(wd)=>{ for(let d=600;d<1600;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y3S2'&&wdOf(d)===wd&&t.week===5) return d; } };
fresh(MON,9); rel('heroine_05',65,50,45); W8=true; r=ask('heroine_05','wenzhou',SAT,15.5);
check('7. 學姊大一（有男朋友，partner Y1S1～Y3S1）約散步：照「兩個人單獨」的規則婉拒（不是個性台詞）',r.res==='decline'&&r.why==='partner'&&!r.lines,r.res+' '+r.why);
const SAT3=Y3(6), MON3=Y3(1); fresh(SAT3,9); rel('heroine_05',65,50,45); W8=false; r=ask('heroine_05','wenzhou',SAT3,10);
check('7. 學姊 W8 以前約散步：「散步沒有目的。……我還不會。」「週三讀書會可以。」（婉拒，不給改天）',r.res==='decline'&&L(r)==='「散步沒有目的。……我還不會。」｜「週三讀書會可以。」'&&!r.alt,r.res+' '+L(r));
W8=true; r=ask('heroine_05','wenzhou',SAT3,15.5); check('7. 學姊 W8 以後（大三下的週六）：「散步。好。我第一次為了散步而散步。」',r.res==='accept'&&L(r)==='「散步。好。我第一次為了散步而散步。」',r.res+' '+L(r));
fresh(MON,9); rel('heroine_05',65,50,45); r=ask('heroine_05','cafe',MON,12+10/60); check('7. 學姊平日中午（在總圖）約 Café：「五點以後。重點是我要先把這段寫完。」→ 17:00 以後',r.res==='resched'&&L(r)==='「五點以後。重點是我要先把這段寫完。」'&&r.alt&&r.alt.h>=17,r.res+' '+JSON.stringify(r.alt));
r=ask('heroine_05','library',MON,12+10/60); check('7. 學姊平日約總圖：「我就在總圖。三樓。不要講話，傳訊息。」',r.res==='here'&&L(r)==='「我就在總圖。三樓。不要講話，傳訊息。」',r.res+' '+L(r));
r=ask('heroine_05','cafe',MON,19); check('7. 學姊 W8 以後、朋友以上約 Café（晚上）：「今天不看筆記。」',r.res==='accept'&&L(r)==='「今天不看筆記。」',r.res+' '+L(r));
W8=false;
// 8 明軒、阿凱、阿哲
fresh(TUE,9); rel('classmate_mingxuan',12,4,2); r=ask('classmate_mingxuan','cafe',TUE,19);
check('8. 明軒週二晚上（家教）約 Café：「九點以後」→ 21:00 以後',r.res==='resched'&&L(r)==='「九點以後」'&&r.alt&&r.alt.h>=21,r.res+' '+JSON.stringify(r.alt));
r=ask('classmate_mingxuan','cafe',TUE,15.5); check('8. 明軒有空約 Café（認識）：「好。但我只能待一小時。」',r.res==='accept'&&L(r)==='「好。但我只能待一小時。」',L(r));
rel('classmate_mingxuan',45,30,10); r=ask('classmate_mingxuan','cafe',TUE,15.5); check('8. 明軒「朋友」以後不說「只能待一小時」（BB_120 1-6）',r.res==='accept'&&!r.lines,L(r));
fresh(MON,9); rel('kai',30,10,5); r=ask('kai','library',MON,15.5); check('8. 阿凱約總圖：「總圖我會睡著」「考前一週我會去 真的」（婉拒）',r.res==='decline'&&L(r)==='「總圖我會睡著」｜「考前一週我會去 真的」',r.res+' '+L(r));
r=ask('kai','noodle',MON,12+10/60); check('8. 阿凱約吃飯：「好 我餓了」',r.res==='accept'&&L(r)==='「好 我餓了」',L(r));
rel('zhe',30,10,5); r=ask('zhe','noodle',MON,12+10/60); check('8. 阿哲約吃飯：「好啊！我餓了。」',r.res==='accept'&&L(r)==='「好啊！我餓了。」',L(r));
// 9 時間
check('9. 時間的中文：21:10＝九點十分、21:30＝九點半、22:30＝十點半、12:10＝十二點十分、9:00＝九點',INV.zhTime(21+10/60)==='九點十分'&&INV.zhTime(21.5)==='九點半'&&INV.zhTime(22.5)==='十點半'&&INV.zhTime(12+10/60)==='十二點十分'&&INV.zhTime(9)==='九點',[21+10/60,21.5,22.5,12+10/60,9].map(INV.zhTime).join('、'));
// 10 流程（手機）
const GMk=(picks)=>{ const out=[]; return {out,G,say:async(w,t)=>{ out.push((w?w.name+'：':'旁白：')+t); },choose:async o=>{ const want=picks.shift(); out.push('選：'+o.map(q=>q.t).join('/')); if(typeof want==='string'){ const k=o.findIndex(q=>q.t.includes(want)); return k<0?o.length-1:k; } return want|0; }}; };
fresh(MON,10); G.contacts.classmate_bohan=1; rel('classmate_bohan',25,8,4); let gm=GMk(['兩點半','15:30','好，就']); gm.G=G; await0();
async function await0(){}
(async()=>{
  await INV.flow(gm,'classmate_bohan',null,false); const o=gm.out.join('｜');
  check('10. 手機約柏翰去 Café：「許柏翰（手機）：「我要念書。……九點十分可以。」」→ 選改天 → 約好今天 21:10',/許柏翰（手機）：「我要念書。……九點十分可以。」/.test(o)&&G.invites.some(iv=>iv.who==='classmate_bohan'&&iv.state==='accepted'&&Math.abs(iv.h-(21+10/60))<0.01),o);
  fresh(MON,10); G.contacts.heroine_01=1; rel('heroine_01',45,30,10); gm=GMk(['溫州街','15:30','好，就']); gm.G=G; await INV.flow(gm,'heroine_01',null,false); const o2=gm.out.join('｜');
  check('10. 以安大一散步：祐廷說「沒有目的。」（玩家的話）、然後問改天',/祐廷：「沒有目的。」/.test(o2)&&/選：好，就 /.test(o2),o2);
  fresh(MON,10); G.contacts.classmate_youchen=1; rel('classmate_youchen',25,8,4); gm=GMk(['兩點半','15:30']); gm.G=G; const before=INVITE_DATA.people.classmate_youchen;
  if(!before&&CHARACTERS.classmate_youchen){ await INV.flow(gm,'classmate_youchen',null,false); check('10. 沒有個性資料的人照舊：「某某答應了。約好 …」（旁白）',gm.out.some(t=>/^旁白：.*答應了。約好/.test(t)),gm.out.join('｜')); }
  // 11 第一次散步
  fresh(MON,10); rel('heroine_04',45,30,10); r=ask('heroine_04','wenzhou',MON,15.5);
  check('11. 子晴第一次約散步：「散步？散步是什麼？」（你解釋了一下。）「……好啦。但要有目的地。」',r.res==='accept'&&L(r)==='「散步？散步是什麼？」｜（你解釋了一下。）｜「……好啦。但要有目的地。」',L(r));
  G.invites.push({id:'x',who:'heroine_04',place:'wenzhou',zone:'wenzhou',day:MON-3,h:15,state:'done'}); r=ask('heroine_04','wenzhou',MON,15.5);
  check('11. 散步過一次以後：沒有「第一次」的那幾句',r.res==='accept'&&!/散步是什麼/.test(L(r)),L(r));
  const s3=fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8'); check('INV.flow 用 INV.personal（decide 之後）',/S\.personal\(G,id,P,W\.day,W\.h,S\.decide\(/.test(s3));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });

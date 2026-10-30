// 邀約的個性（INVITE_DATA.people；AA_70 第 2 節＋BB_121 的建議欄、BB_70 第 1～7 節，AA、BB 2026-10-14 互審同意，第②級）：
// 約人的時候，對方照自己的個性回答，不是每個人都「某某答應了。」（使用者 2026-10-14：「約了朋友在溫州街散步是不是沒有增加好感」「手機只能約阿哲小凱」）。不需要瀏覽器：
//   1. 答應的台詞照階段（以安吃飯「認識、有點熟」／「朋友以上」）；2. 照作息她本來就在那裡＝「就在那裡」（以安平日上午的總圖、芷若上班的 Café）：不算邀約、不問改天；
//   3. 以安大一的散步：「散步的目的是？」「沒有目的。」（祐廷說）→ 改天；大二以後「好啊，剛好想走走。」；
//   4. 語彤週二週四晚上在麵店幫忙：麵店＝「我就在店裡。你來。」、其他＝「麵店。」「你來店裡就好。」（婉拒，不問改天）；「認識」約 Café＝「……那裡很貴。」「總圖可以。」；第一次散步改到週六；
//   5. 柏翰：總圖照常、其他地方改到念完書（九點十分）；6. 芯慈：當天約吃飯改到隔天；7. 學姊：W8 以前不散步（不給改天）、平日 9–17 在總圖；
//   8. 明軒家教、阿凱的總圖、阿哲吃飯；9. 時間的中文（九點十分、十點半）；10. 手機上約：她的話寫「某某（手機）」；沒有個性資料的人照舊（旁白）；
//   11. 「第一次」散步的台詞只有第一次；12. 一起走過去的路上聊一句（照目的地、輪流、下雨、6 秒以後、在旁邊才說、一趟一句）。修正前（INVITE_DATA.people 是空的、沒有 INV.personal）這個測試會失敗。用法：node tests/invite_people_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
global.CHAR={build:()=>({position:{set(){}},rotation:{y:0},userData:{}}),setExpr(){}}; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
let W8=false; global.EVENTS={cond:c=>!!(c&&c.events&&c.events[0]==='ev_sis_collapse'&&W8),habit(){},onInteract:()=>false,npcOf:()=>null,onEnter(){},tick(){}};
const load=(f,names)=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(new RegExp('^const ('+names+')\\s*=','mg'),'global.$1='),{filename:f});
load('src/data/calendar.js','CALENDAR'); load('src/data/places.js','PLACES'); load('src/data/characters.js','CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS'); load('src/social3d.js','SOCIAL');
for(const f of ['src/data/rel_lines.js','src/data/courses.js','src/data/invites.js','src/invites3d.js','src/story3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f,'REL_LINES|COURSES|INVITE_DATA|INV|STORY');
if(typeof STORY!=='undefined') STORY.sisW8=()=>W8;   /* W8 之後＝STORY.sisW8（AA_177 第 8 節①：演過或過了大二上第 12 週）；這個測試直接控制 W8，時間的部分在 tests/v3_sis_w8_unit.js */
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
rel('heroine_01',45,30,10); r=ask('heroine_01','noodle',MON,12+10/60); check('1. 以安「朋友」約吃飯：「好。我要乾麵。」（AA_255 第 4 節第 7 點）',r.res==='accept'&&L(r)==='「好。我要乾麵。」',L(r));
r=ask('heroine_01','cafe',MON,19); rel('heroine_01',25,10,5); r=ask('heroine_01','cafe',MON,19); check('1. 以安「有點熟」約 Café：「可以。條件：我會帶東西來寫。」',r.res==='accept'&&L(r)==='「可以。條件：我會帶東西來寫。」',L(r)); rel('heroine_01',45,30,10);
// 2 就在那裡
r=ask('heroine_01','library',MON,10); check('2. 以安平日上午本來就在總圖：「我本來就在總圖。二樓靠窗。」（就在那裡，不問改天）',r.res==='here'&&L(r)==='「我本來就在總圖。二樓靠窗。」'&&!r.alt,r.res+' '+L(r));
r=ask('heroine_01','library',MON,19); check('2. 以安晚上（不在總圖）：照常答應、沒有那一句',r.res==='accept'&&!/本來就在總圖/.test(L(r)),r.res+' '+L(r));
fresh(MON,9); rel('heroine_02',12,4,2); r=ask('heroine_02','cafe',MON,12+10/60);
check('2. 芷若上班時約 Café：「我會在 Café 啊，你直接過來，我幫你做一杯。」（BB_172 Z16）',r.res==='here'&&L(r)==='「我會在 Café 啊，你直接過來，我幫你做一杯。」',r.res+' '+L(r));
// 3 以安散步
fresh(MON,9); rel('heroine_01',45,30,10); r=ask('heroine_01','wenzhou',MON,15.5);
check('3. 以安大一約散步：「散步的目的是？」祐廷「沒有目的。」「……好。我在手帳排一個『沒有目的』的時段。」→ 改天（明天以後）',r.res==='resched'&&L(r)==='「散步的目的是？」｜祐廷:「沒有目的。」｜「……好。我在手帳排一個『沒有目的』的時段。」'&&r.alt&&r.alt.day>MON,r.res+' '+L(r)+' '+JSON.stringify(r.alt));
const Y2=(()=>{ for(let d=200;d<900;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y2S1'&&wdOf(d)===1&&t.week===5) return d; } })();
fresh(Y2,9); rel('heroine_01',45,30,10); r=ask('heroine_01','wenzhou',Y2,15.5); check('3. 以安大二以後：「好啊，剛好想走走。」（AA_255 第 4 節第 7 點）',r.res==='accept'&&L(r)==='「好啊，剛好想走走。」',r.res+' '+L(r));
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
check('5. 柏翰約 Café：「我要念書，九點十分可以。」→ 改到今天 21:10（AA_194 第 4 節拿掉「……」）',r.res==='resched'&&L(r)==='「我要念書，{zh}可以。」'&&r.alt&&r.alt.day===MON&&Math.abs(r.alt.h-(21+10/60))<0.01,r.res+' '+L(r)+' '+JSON.stringify(r.alt));
r=ask('classmate_bohan','library',MON,15.5); check('5. 柏翰約總圖：照常答應',r.res==='accept',r.res);
// 6 芯慈
fresh(MON,9); rel('classmate_xinci',25,8,4); r=ask('classmate_xinci','noodle',MON,12+10/60);
check('6. 芯慈當天約吃飯：「今天的我都排好了，{zh}可以嗎？」→ 改到明天（AA_194 第 4 節，只改字）',r.res==='resched'&&L(r)==='「今天的我都排好了，{zh}可以嗎？」'&&r.alt&&r.alt.day===MON+1,r.res+' '+JSON.stringify(r.alt));
r=ask('classmate_xinci','noodle',MON+1,18.5); check('6. 芯慈隔天的吃飯（週二 18:30）：答應「好，我記一下。」（AA_194 第 4 節）',r.res==='accept'&&L(r)==='「好，我記一下。」',r.res+' '+L(r));
// 7 學姊
const Y3=(wd)=>{ for(let d=600;d<1600;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y3S2'&&wdOf(d)===wd&&t.week===5) return d; } };   /* 大三下（學姊美國改到大四上 2028-08-02～12-23，AA_260／BB_206：大三下在臺灣）*/
fresh(MON,9); rel('heroine_05',65,50,45); W8=true; r=ask('heroine_05','wenzhou',SAT,15.5);
check('7. 學姊大一約散步：不會因為「有伴侶」婉拒（使用者 2026-10-17 P0：學姊一開始就沒有男朋友，AA_218 第 16 節、BB_122 ★ 節）',r.why!=='partner',r.res+' '+r.why);
const SAT3=Y3(6), MON3=Y3(1); W8=false; fresh(SAT,9); rel('heroine_05',65,50,45); r=ask('heroine_05','wenzhou',SAT,15.5);
check('7. 學姊筆試（2026-02-02）以前約散步：「散步的話，等我考完。」「週三晚上我在法圖。要讀書的話，可以一起。」（AA_284 1-3；婉拒，不給改天）',r.res==='decline'&&r.why==='exam'&&L(r)==='「散步的話，等我考完。」｜「週三晚上我在法圖。要讀書的話，可以一起。」'&&!r.alt,r.res+' '+L(r));
{ const EX=STORY.dayOfKey('2026-02-02'); let d=EX+1; while(wdOf(d)!==6) d++; fresh(d,9); rel('heroine_05',65,50,45); r=ask('heroine_05','wenzhou',d,15.5); check('7. 筆試以後的週六（不看 W8）：答應',r.res==='accept',r.res+' '+L(r)); }
r=ask('heroine_05','wenzhou',SAT3,15.5); check('7. 學姊大三下的週六（W8 旗標沒有也一樣）：「散步。好。……溫州街我只有路過，沒有真的走過。」',r.res==='accept'&&L(r)==='「散步。好。……溫州街我只有路過，沒有真的走過。」',r.res+' '+L(r));
fresh(MON,9); rel('heroine_05',65,50,45); r=ask('heroine_05','cafe',MON,12+10/60); check('7. 學姊平日中午（在總圖）約 Café：「五點以後好不好？我要先把這段寫完。」→ 17:00 以後',r.res==='resched'&&L(r)==='「五點以後好不好？我要先把這段寫完。」'&&r.alt&&r.alt.h>=17,r.res+' '+JSON.stringify(r.alt));
r=ask('heroine_05','library',MON,12+10/60); check('7. 學姊平日約總圖：「我就在總圖。三樓。不要講話，傳訊息。」',r.res==='here'&&L(r)==='「我就在總圖。三樓。不要講話，傳訊息。」',r.res+' '+L(r));
r=ask('heroine_05','cafe',MON,19); check('7. 學姊 W8 以後、朋友以上約 Café（晚上）：「今天不看筆記。」',r.res==='accept'&&L(r)==='「今天不看筆記。」',r.res+' '+L(r));
W8=false;
// 8 明軒、阿凱、阿哲
fresh(TUE,9); rel('classmate_mingxuan',12,4,2); r=ask('classmate_mingxuan','cafe',TUE,19);
check('8. 明軒週二晚上（家教）約 Café：「那時候我在家教 九點以後可以」（手機版，BB_172 M10）→ 21:00 以後',r.res==='resched'&&L(r)==='「那時候我在家教 九點以後可以」'&&r.alt&&r.alt.h>=21,r.res+' '+JSON.stringify(r.alt));
r=ask('classmate_mingxuan','cafe',TUE,15.5); check('8. 明軒有空約 Café（認識）：「好。但我只能待一小時。」',r.res==='accept'&&L(r)==='「好。但我只能待一小時。」',L(r));
rel('classmate_mingxuan',45,30,10); r=ask('classmate_mingxuan','cafe',TUE,15.5); check('8. 明軒「朋友」以後不說「只能待一小時」（BB_120 1-6）',r.res==='accept'&&!r.lines,L(r));
fresh(MON,9); rel('kai',30,10,5); r=ask('kai','library',MON,15.5); check('8. 阿凱約總圖：「總圖我會睡著」「考前一週我會去 真的」（婉拒）',r.res==='decline'&&L(r)==='「總圖我會睡著」｜「考前一週我會去 真的」',r.res+' '+L(r));
r=ask('kai','noodle',MON,12+10/60); check('8. 阿凱約吃飯：「走 我剛好還沒吃」（手機版，BB_172 K6）',r.res==='accept'&&L(r)==='「走 我剛好還沒吃」',L(r));
rel('zhe',30,10,5); r=ask('zhe','noodle',MON,12+10/60); check('8. 阿哲約吃飯：「好啊！那家的乾麵我可以吃兩碗。」（AA_194 第 4 節）',r.res==='accept'&&L(r)==='「好啊！那家的乾麵我可以吃兩碗。」',L(r));
// 9 時間
check('9. 時間的中文：21:10＝九點十分、21:30＝九點半、22:30＝十點半、12:10＝十二點十分、9:00＝九點',INV.zhTime(21+10/60)==='九點十分'&&INV.zhTime(21.5)==='九點半'&&INV.zhTime(22.5)==='十點半'&&INV.zhTime(12+10/60)==='十二點十分'&&INV.zhTime(9)==='九點',[21+10/60,21.5,22.5,12+10/60,9].map(INV.zhTime).join('、'));
// 10 流程（手機）
const GMk=(picks)=>{ const out=[]; return {out,G,say:async(w,t)=>{ out.push((w?w.name+'：':'旁白：')+t); },choose:async o=>{ const want=picks.shift(); out.push('選：'+o.map(q=>q.t).join('/')); if(typeof want==='string'){ let k=o.findIndex(q=>q.t.includes(want)); if(k<0){ k=o.findIndex(q=>(q.sub||[]).some(s=>s.includes(want))); if(k>=0) picks.unshift(want); } /* INVITE-MENU-1030 分層：要選的名稱在某一類裡（選項的 sub）＝先選那一類，這個 pick 留給下一層 */ return k<0?o.length-1:k; } return want|0; }}; };
fresh(MON,10); G.contacts.classmate_bohan=1; rel('classmate_bohan',25,8,4); let gm=GMk(['兩點半','15:30','好，就']); gm.G=G; await0();
async function await0(){}
(async()=>{
  await INV.flow(gm,'classmate_bohan',null,false); const o=gm.out.join('｜');
  check('10. 手機約柏翰去 Café：「許柏翰（手機）：「我要念書，九點十分可以。」」→ 選改天 → 約好今天 21:10（AA_194 第 4 節）',/許柏翰（手機）：「我要念書，九點十分可以。」/.test(o)&&G.invites.some(iv=>iv.who==='classmate_bohan'&&iv.state==='accepted'&&Math.abs(iv.h-(21+10/60))<0.01),o);
  fresh(MON,10); G.contacts.heroine_01=1; rel('heroine_01',45,30,10); gm=GMk(['溫州街','15:30','好，就']); gm.G=G; await INV.flow(gm,'heroine_01',null,false); const o2=gm.out.join('｜');
  check('10. 以安大一散步：祐廷說「沒有目的。」（玩家的話）、然後問改天',/祐廷：「沒有目的。」/.test(o2)&&/選：好，就 /.test(o2),o2);
  fresh(MON,10); G.contacts.classmate_youchen=1; rel('classmate_youchen',25,8,4); gm=GMk(['兩點半','15:30']); gm.G=G; const before=INVITE_DATA.people.classmate_youchen;
  if(!before&&CHARACTERS.classmate_youchen){ await INV.flow(gm,'classmate_youchen',null,false); check('10. 沒有個性資料的人照舊：「某某答應了。約好 …」（旁白）',gm.out.some(t=>/^旁白：.*答應了。約好/.test(t)),gm.out.join('｜')); }
  // 11 第一次散步
  fresh(MON,10); rel('heroine_04',45,30,10); r=ask('heroine_04','wenzhou',MON,15.5);
  check('11. 子晴第一次約散步：「散步？散步是什麼？」（你解釋了一下。）「……好啦。但要有目的地。」',r.res==='accept'&&L(r)==='「散步？散步是什麼？」｜（你解釋了一下。）｜「……好啦。但要有目的地。」',L(r));
  G.invites.push({id:'x',who:'heroine_04',place:'wenzhou',zone:'wenzhou',day:MON-3,h:15,state:'done'}); r=ask('heroine_04','wenzhou',MON,15.5);
  check('11. 散步過一次以後：沒有「第一次」的那幾句',r.res==='accept'&&!/散步是什麼/.test(L(r)),L(r));
  // 12 一起走過去的路上聊一句
  fresh(MON,10); rel('heroine_01',45,30,10);
  let pk=INV.walkPick(G,'heroine_01','cafe'); check('12. 以安去 Café 的路上：先說去 Café 的那句（寫題目先想要件還是結論；AA_194 第 4 節）',!!pk&&pk.lines[0]==='「你寫題目都先想要件，還是先想結論？我都先想結論，最近在改。」',pk&&pk.lines.join('｜'));
  pk.next(); pk=INV.walkPick(G,'heroine_01','cafe'); check('12. 下一次去 Café：輪到「任何目的地」那句（宿舍門禁）',!!pk&&/宿舍門禁是十二點/.test(pk.lines[0]),pk&&pk.lines.join('｜'));
  G.flags.walkChatN={}; pk=INV.walkPick(G,'heroine_01','wenzhou'); check('12. 以安大一去溫州街：「這條巷子我走過一百次」是大二以後的，這次說門禁那句',!!pk&&/宿舍門禁/.test(pk.lines[0]),pk&&pk.lines.join('｜'));
  G.weather='rain'; rel('heroine_03',45,30,10); pk=INV.walkPick(G,'heroine_03','noodle'); check('12. 語彤下雨天：她撐傘偏向你那一邊（旁白＋「沒事啦。」，AA_194 第 4 節）',!!pk&&pk.lines.length===2&&/傘偏向你那一邊/.test(pk.lines[0])&&pk.lines[1]==='「沒事啦。」',pk&&pk.lines.join('｜')); G.weather='clear';
  check('12. Alison 沒有「一起走路」的台詞：不說',INV.walkPick(G,'yu','cafe')===null);
  const caps=[]; INV._later=(f)=>f(); const npcObj={position:{x:1,z:0}};
  const gmW={G,npc:{heroine_02:{obj:npcObj}},E:{player:{obj:{position:{x:0,z:0}}}},caption:(w,t)=>caps.push((w||'旁白')+'：'+t)};
  fresh(MON,10); gmW.G=G; rel('heroine_02',45,30,10); G.invites.push({id:'w1',who:'heroine_02',place:'noodle',zone:'noodle',day:MON,h:10,state:'going'});
  INV.walkChat(gmW,5); check('12. 一起走 5 秒：還沒說',caps.length===0,caps.join('｜'));
  INV.walkChat(gmW,1.5); check('12. 一起走 6 秒以後：芷若說去公館的那句（影印店；BB_172 Z2：還沒聽過她家＝不提家裡的一句），寫在字幕、名字是她',caps.length===1&&caps[0]==='林芷若：「這家影印一張一塊半欸，好貴。」'&&G.invites[0].chat===true,caps.join('｜'));
  INV.walkChat(gmW,10); check('12. 一趟只說一句（一段）',caps.length===1,caps.join('｜'));
  G.invites.push({id:'w2',who:'heroine_02',place:'noodle',zone:'noodle',day:MON,h:12,state:'going'}); INV.walkChat(gmW,7);
  check('12. 下一趟：換下一句（她看到電影海報：旁白＋她的話兩句，三個字幕；BB_172 Z3）',caps.length===4&&caps[1]==='旁白：（她看到騎樓下的電影海報。）'&&caps[2]==='林芷若：「欸這部，你不要去看喔。」'&&caps[3]==='林芷若：「預告很好看，正片超無聊。我上禮拜去看，浪費兩百多。」',caps.join('｜'));
  npcObj.position.x=9; G.invites.push({id:'w3',who:'heroine_02',place:'noodle',zone:'noodle',day:MON,h:14,state:'going'}); INV.walkChat(gmW,8);
  check('12. 跟著的人不在旁邊（9 m）：先不說',caps.length===4&&!G.invites[2].chat,caps.join('｜'));
  const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('12. STORY.tick 每一幀叫 INV.walkChat(GM,dt)',/INV\.walkChat\(GM,dt\)/.test(st));
  // 13 選項句（BB_120 1-7c：走到目的地、見面開始前選，不在路上打斷）：芷若去溫州街猜電影、阿凱大一去吃飯「機車擋騎樓可以告嗎」
  fresh(SAT,15); gmW.G=G; caps.length=0; npcObj.position.x=1; rel('heroine_02',45,30,10); G.invites.push({id:'w4',who:'heroine_02',place:'wenzhou',zone:'wenzhou',day:SAT,h:15,state:'going'});
  INV.walkChat(gmW,7); check('13. 芷若去溫州街的路上：抽到猜電影（選項句）——路上不出字幕、記在邀約上（iv.ask）',caps.length===0&&G.invites[0].chat===true&&G.invites[0].ask==='ZR_FILM_ASK',JSON.stringify({caps,ask:G.invites[0].ask}));
  { const said=[], opts=[]; const gmM={G,E:{player:{obj:{position:{x:0,z:0}}}},npc:{},sceneBegin(){},sceneEnd(){},say:async(w,t)=>{ said.push((w?(w.name||w):'旁白')+'：'+t); },choose:async o=>{ opts.push(o.map(x=>x.t).join('/')); return 2; },fade:async()=>{},advance(){},caption(){},sleep:async()=>{},autosave(){},toast(){},updateHUD(){}};
    await INV.meet(gmM,G.invites[0],{obj:npcObj});
    check('13. 到了、見面開始前：她先問 → 三個選項 → 選「什麼都沒發生的片。」→「……你怎麼知道？」→ 她的答案，之後才是見面（BB_172 Z5）',said[0]==='林芷若：「欸，你不覺得這條巷子很適合拍電影嗎？你猜我會拍什麼。」'&&opts[0]==='愛情片。/恐怖片。/什麼都沒發生的片。'&&said[1]==='林芷若：「……你怎麼知道？」'&&said[2]==='林芷若：「我想拍一個人每天走這條巷子去上班，然後什麼事都沒發生。」'&&said[3]==='林芷若：「……應該很難看吧。」'&&said.length>4,said.join('｜'));
    check('13. 每句一次：問過以後不再抽到',G.flags.ZR_FILM_ASK===true&&!G.invites[0].ask&&(()=>{ const pk=INV.walkPick(G,'heroine_02','wenzhou'); return !!pk&&!pk.ask; })()); }
  fresh(TUE,18); rel('kai',25); G.flags.walkChatN={}; let pk2=INV.walkPick(G,'kai','noodle');
  check('13. 阿凱大一去吃飯的路上：「欸，你們法律系的，路邊機車停在騎樓擋路，可以告嗎？」（選項句；BB_172 K2）',!!pk2&&pk2.ask==='KAI_SCOOTER_ASK'&&pk2.lines[0]==='「欸，你們法律系的，路邊機車停在騎樓擋路，可以告嗎？」',pk2&&JSON.stringify(pk2));
  { const e=INV.walkEntry('kai','KAI_SCOOTER_ASK'); check('13. 阿凱的三個選項與回答（BB_70 4-5；第一個選項 BB-B 法律審查 c36de340 改字）',!!e&&e.ch.map(c=>c.t+'→'+c.r[0]).join('／')==='不一定是告，可以請警察來看→「喔，所以告跟叫警察不一樣。好，我學到了。」／你想告誰→「沒有啦，我只是想知道我能不能。」／先讓我吃完→「好，你吃。」'); }
  G.flags.walkChatN={}; pk2=INV.walkPick(G,'kai','cafe'); check('13. 阿凱去 Café：不是吃飯，不問機車那題',!!pk2&&!pk2.ask,pk2&&JSON.stringify(pk2));
  const y2d=(()=>{ for(let d=300;d<800;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y2S1') return d; } return null; })(); fresh(y2d,18); rel('kai',25); pk2=INV.walkPick(G,'kai','noodle'); check('13. 大二：不問（大一上的題目）',!pk2||!pk2.ask,pk2&&JSON.stringify(pk2));
  /* 子晴「你為什麼換」（BB_70 2-5、BB 2fdef19）：有點熟以上、還沒有 TOLD_HER_CHANGE；說了記憶 TOLD_HER_CHANGE，「下次再講」不記 */
  const meetAsk=async(who,pid,pick)=>{ const said=[], opts=[]; G.invites.push({id:'m'+who+pid,who,place:pid,zone:pid,day:G.day,h:G.hour,state:'going'}); const iv=G.invites[G.invites.length-1];
    const pk=INV.walkPick(G,who,pid); if(pk&&pk.ask){ pk.next(); iv.ask=pk.ask; }
    const gmM={G,E:{player:{obj:{position:{x:0,z:0}}}},npc:{},sceneBegin(){},sceneEnd(){},say:async(w,t)=>{ said.push((w?(w.name||w):'旁白')+'：'+t); },choose:async o=>{ opts.push(o.map(x=>x.t).join('/')); return pick; },fade:async()=>{},advance(){},caption(){},sleep:async()=>{},autosave(){},toast(){},updateHUD(){}};
    await INV.meet(gmM,iv,{obj:npcObj}); return {said,opts,ask:pk&&pk.ask}; };
  fresh(MON,10); rel('heroine_04',25); G.flags.walkChatN={walk:0}; G.flags.walkChatN.heroine_04=2;   /* 輪到 any 的第二個（前面：去公館的兩句、松鼠）*/
  { let pk=null; for(let n=0;n<6&&!(pk&&pk.ask);n++){ G.flags.walkChatN.heroine_04=n; pk=INV.walkPick(G,'heroine_04','cafe'); }
    check('13. 子晴有點熟、去 Café 的路上：輪得到「欸，阿凱說你之前念經濟？那你怎麼會換來法律？」（選項句；BB_172 Q7）',!!pk&&pk.ask==='ZQ_CHANGE_ASK',pk&&JSON.stringify(pk)); }
  { G.flags.walkChatN.heroine_04=0; let r=null; for(let n=0;n<6;n++){ G.flags.walkChatN.heroine_04=n; const pk=INV.walkPick(G,'heroine_04','cafe'); if(pk&&pk.ask){ r=await meetAsk('heroine_04','cafe',0); break; } }
    check('13. 子晴：「（說換方向的事）」→ 你說換方向、她問家裡、（她走了好幾步沒說話。）→「……好。知道了。」（AA_335 T6）→ 記憶 TOLD_HER_CHANGE',!!r&&r.opts[0]==='（說換方向的事）/下次再講。'&&r.said[0]==='高子晴：「欸，阿凱說你之前念經濟？那你怎麼會換來法律？」'&&r.said[1]==='祐廷：「念了一個多月經濟，後來重考到法律。考之前很怕，考完就不怕了。」'&&r.said.includes('旁白：（她走了好幾步沒說話。）')&&r.said.includes('高子晴：「……好。知道了。」')&&!r.said.some(t=>/我記住了/.test(t))&&SOCIAL.has('heroine_04','TOLD_HER_CHANGE'),r&&r.said.slice(0,8).join('｜'));
    let again=false; for(let n=0;n<6;n++){ G.flags.walkChatN.heroine_04=n; const pk=INV.walkPick(G,'heroine_04','cafe'); if(pk&&pk.ask) again=true; } check('13. 子晴：說過以後不再問',!again); }
  fresh(MON,10); rel('heroine_04',25); { let r=null; for(let n=0;n<6;n++){ G.flags.walkChatN={heroine_04:n}; const pk=INV.walkPick(G,'heroine_04','cafe'); if(pk&&pk.ask){ r=await meetAsk('heroine_04','cafe',1); break; } }
    check('13. 子晴：「下次再講。」→「好喔，那你欠我一次。」（BB_172 Q7）、不記 TOLD_HER_CHANGE、這句不再問（一次）',!!r&&r.said[1]==='高子晴：「好喔，那你欠我一次。」'&&!SOCIAL.has('heroine_04','TOLD_HER_CHANGE')&&G.flags.ZQ_CHANGE_ASK===true,r&&r.said.slice(0,3).join('｜')); }
  fresh(MON,10); rel('heroine_04',10); { let any=false; for(let n=0;n<6;n++){ G.flags.walkChatN={heroine_04:n}; const pk=INV.walkPick(G,'heroine_04','cafe'); if(pk&&pk.ask) any=true; } check('13. 子晴只是「認識」：不問',!any); }
  /* 沛珊「大家都不遵守的法律」（BB_70 6-5、BB 2fdef19）：三個選項都是學生的看法；最後一句大一上問讀書會、大一下起問課輔班 */
  fresh(MON,10); rel('classmate_peishan',25); { const r=await meetAsk('classmate_peishan','cafe',2);
    check('13. 沛珊：「剛剛路上那排機車……」「如果一條規定大家都不守，它還算數嗎？」三個選項 → 選「要看大家為什麼不守。」→「……也是。有的人是不想守，有的人是沒辦法守。」→ 大一上「…問讀書會的人…」（BB_172 P2）',r.ask==='PS_LAW_ASK'&&r.opts[0]==='還是法律，只是沒人守。/那它可能該改了。/要看大家為什麼不守。'&&r.said[0]==='郭沛珊：「剛剛路上那排機車，全都停在紅線上。」'&&r.said[1]==='郭沛珊：「如果一條規定大家都不守，它還算數嗎？」'&&r.said[2]==='郭沛珊：「……也是。有的人是不想守，有的人是沒辦法守。」'&&r.said[3]==='郭沛珊：「好。我要拿這題去問讀書會的人，看看他們怎麼說。」',r.said.slice(0,4).join('｜')); }
  { const y1s2=(()=>{ for(let d=100;d<500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S2') return d; } return null; })(); fresh(y1s2,10); rel('classmate_peishan',25); const r=await meetAsk('classmate_peishan','cafe',0);
    check('13. 沛珊大一下起：選「還是法律，只是沒人守。」→ 兩句 →「好。我要拿這題去問課輔班的小孩，看看他們怎麼說。」',r.said[2]==='郭沛珊：「所以寫下來就算數喔？」'&&r.said[3]==='郭沛珊：「那寫的人壓力好大。」'&&r.said[4]==='郭沛珊：「好。我要拿這題去問課輔班的小孩，看看他們怎麼說。」',r.said.slice(0,4).join('｜')); }
  { const iv={id:'z',who:'heroine_02',ask:'NOPE'}; const r=await INV.walkAsk({G,say:async()=>{},choose:async()=>0},iv,{name:'x'}); check('13. 找不到的選項句（資料改過）：不演、不出錯',r===false&&iv.ask===null); }
  /* AA_134 第 4 節（AA_140 G49）：當面約——第一句照可選的時間（AA-B 2026-10-16 21:53 定稿：今天還有時段「你等一下有空嗎？」、只剩明天「你明天有空嗎？」）、她看手機行事曆、答應時點頭；手機約沒有這些 */
  { fresh(MON,10); G.contacts.classmate_bohan=1; rel('classmate_bohan',25,8,4); const caps=[]; gm=GMk(['兩點半','15:30','好，就']); gm.G=G; gm.caption=(w,t)=>caps.push(t); gm.sleep=async()=>{};
    await INV.flow(gm,'classmate_bohan',{obj:{}},false); const o=gm.out.join('｜');
    check('G49 當面約（10:00，今天還有時段）：祐廷先說「你等一下有空嗎？」，她看手機行事曆（字幕）',gm.out[0]==='祐廷：你等一下有空嗎？'&&caps.some(t=>/看了一下手機的行事曆/.test(t)),JSON.stringify({o:gm.out.slice(0,2),caps}));
    { fresh(MON,22.5); G.contacts.classmate_bohan=1; rel('classmate_bohan',25,8,4); gm=GMk(['兩點半','明天','好，就']); gm.G=G; gm.caption=()=>{}; gm.sleep=async()=>{}; await INV.flow(gm,'classmate_bohan',{obj:{}},false);
      check('G49 當面約（22:30，只剩明天）：「你明天有空嗎？」，沒有「週末」',gm.out[0]==='祐廷：你明天有空嗎？'&&!gm.out.some(t=>/週末/.test(t)),JSON.stringify(gm.out.slice(0,2))); }
    const caps2=[]; fresh(MON,10); G.contacts.classmate_bohan=1; rel('classmate_bohan',25,8,4); gm=GMk(['兩點半','15:30','好，就']); gm.G=G; gm.caption=(w,t)=>caps2.push(t); await INV.flow(gm,'classmate_bohan',null,false);
    check('G49 手機約：沒有當面的第一句、沒有動作字幕',!gm.out.some(t=>/有空嗎/.test(t))&&caps2.length===0,JSON.stringify({o:gm.out.slice(0,2),caps2})); }
  const s3=fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8'); check('INV.flow 用 INV.personal（decide 之後）',/S\.personal\(G,id,P,W\.day,W\.h,(Object\.assign\()?S\.decide\(/.test(s3));   /* Object.assign：當面約加 face（BB_172 10-1 第 17 點，手機／當面兩版）*/
  { const se=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'); check('跟著走的人停下來是站姿，不退回作息的坐姿（使用者 2026-10-16：郭沛珊我停下來她就坐回去）',/n\.pose=n\.beh==='follow'\?'idle':\(n\.idlePose\|\|'idle'\)/.test(se)); }
  { const se=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'); check('一起走、坐後座的人不揮手，到了 90 秒內也不揮（使用者 2026-10-16）',/if\(n\.beh==='follow'\|\|n\.beh==='passenger'\) n\.greetCd=Math\.max\(n\.greetCd,90\)/.test(se)); }
  check('「現在一起過去」：坐著的人先起身再跟（使用者 2026-10-16：Café 約吃麵，以安坐姿跟著走）',/if\(W\.now&&n\)\{ if\(GM\.standUp\) GM\.standUp\(n\); n\.beh='follow'/.test(s3));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });

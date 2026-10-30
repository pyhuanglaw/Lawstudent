// AA_120 第 7 節（使用者 2026-10-13 批准，開發分支、不發布）：五處改字、20 位不熟同學的 60 句、資料一致性、初遇與舊存檔——不需要瀏覽器。
// 檢查：
//   7-1 柏翰的天數＝到這學期第一個期中考時段的天數（7～14 天才說、每學期一次）；芯慈三個版本照 ECON_PAST_SHARED；ev_xinci_double 只在大一下第 6～7 週、台詞改了；
//       黃教授那句只在上過她的課以後、是書不是電影；Alison 的引號、第 4～6 週。
//   7-2 20 人各三句、每句只說一次、第 3 句要 SHARED_SECRET；心事（facts[1]）說出來以前不出現在任何閒聊、旁白、手機的人物說明；心事在兩句說完以後、一天一句。
//   7-3 年級跟著遊戲走（大四封頂）、pool_3 的外觀、學長姊照年級畢業（presence）。
// 2026-10-28 改：AA_497 2-9 芯慈大三上的新閒聊「這學期雙主修的課沒有撞堂。……」也含「雙主修」，篩三個版本的時候排除（tests/aa497_supporting_unit.js 2-9 測那一句）。
//   7-4 舊存檔：一般自我介紹留下的女主角 FIRST_MET、相遇事件沒播過 → 標成一般招呼（GREETED），先備份；正常相遇過的、有別的紀錄的不動；只做一次。
//   7-5 雨天的總圖門口只在還沒見過語彤時；經原分組在大一上週五經原下課後的普通教學館、第 4 週起；傅鐘的改字（BB）與芷若作息的備註。
// 用法：node tests/aa120_s7_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const dOf=(term,w,wd)=>{ for(let d=1;d<2000;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===w&&(wd==null||CALENDAR.dateOf(d).wd===wd)) return d; } return null; };
let G;
const GMstub={get G(){ return G; },E:{player:{obj:{position:{x:0,z:0}},busy:false},zone:null,npcs:[]},D:{active:false},npc:{}};
const fresh=(day)=>{ G={day,hour:15,weekday:CALENDAR.dateOf(day).wd%7,zone:'campus',flags:{},energy:70,money:20000,events:{done:{},last:{},count:0},social:null,courses:{}}; SOCIAL.bind(G); EVENTS.bind(GMstub,G); return G; };
const ST=id=>SMALLTALK[id]||[];
const line=(id,re)=>ST(id).find(e=>(typeof e==='string'?e:e.t).match(re));
/* ---------- 7-1 五處改字 ---------- */
{ const e=line('classmate_bohan',/期中還有/);   /* AA_209 附錄A §2 改字 */
  check('柏翰：「期中還有{n}天，我排了一份進度表，要的話傳你。」（AA_209；midterm 7～14、每學期一次）；舊的「二十一天」拿掉了',!!e&&JSON.stringify(e.midterm)==='[7,14]'&&e.once==='term'&&!ST('classmate_bohan').some(q=>/二十一天/.test(typeof q==='string'?q:q.t)));
  const mid=dOf('Y1S1',8,1);   /* 第 8 週週一（期中考週的第一天）*/ fresh(mid-10); const n=STORY.daysToMidterm(G); const first=(()=>{ for(let d=mid-10;d<mid+14;d++){ if(CLS.dayItems(G,d).some(it=>it.exam==='mid')) return d; } return null; })();
  check('天數＝今天到這學期第一個期中考時段（照課表與日曆）',n===first-(mid-10),'n='+n+'，第一科在 '+(first&&CALENDAR.dateOf(first).key));
  const said=[]; for(let k=0;k<30;k++){ fresh(mid-20+k); G.social.small={classmate_bohan:{day:0,used:['「我在寫考古題，第二題卡住了。」'],last:null}}; const L=STORY.smallTalk(G,'classmate_bohan'); if(L.say&&/期中還有/.test(L.say)) said.push(STORY.daysToMidterm(G)+':'+L.say); }
  check('只在 7～14 天前說，句子裡的天數是那一天算出來的（中文數字）',said.length>0&&said.every(t=>{ const n=+t.split(':')[0]; return n>=7&&n<=14&&t.includes('還有'+STORY.zhNum(n)+'天'); }),said.slice(0,3).join(' / '));
  fresh(mid-10); G.social.small={classmate_bohan:{day:0,used:[],last:null,once:{[e.t]:'Y1S1'}}}; let again=false; for(let k=0;k<3;k++){ G.day=mid-10+k; G.social.small.classmate_bohan.day=0; const L=STORY.smallTalk(G,'classmate_bohan'); if(L.say&&/期中還有/.test(L.say)) again=true; }
  check('同一學期說過就不再說（once:term）',!again); }
{ const L=ST('classmate_xinci').filter(e=>typeof e==='object'&&/雙主修|自學過一點經濟|念過經濟系，我只問/.test(e.t)&&e.t!=='「這學期雙主修的課沒有撞堂。……我把那一格空下來了。」');   /* AA_497 2-9（2026-10-28）大三上新閒聊也有「雙主修」三個字，不是這三個版本 */
  check('芯慈：「經濟系那邊的課比較輕鬆」拿掉，換成三個版本（大一上、下；雙主修事件以後不說）',L.length===3&&L.every(e=>JSON.stringify(e.term)==='["Y1S1","Y1S2"]'&&e.if&&JSON.stringify(e.if.notEvents)==='["ev_xinci_double"]')&&!ST('classmate_xinci').some(q=>/比較輕鬆/.test(typeof q==='string'?q:q.t)));
  const pick=v=>{ fresh(dOf('Y1S1',6,3)); if(v) G.flags.ECON_PAST_SHARED=v; const out=[]; for(const e of L){ const ok=(!e.if||EVENTS.cond(e.if))&&(!e.unless||!EVENTS.cond(e.unless)); if(ok) out.push(e.t.slice(1,10)); } return out.join('|'); };
  check('不知道／none：只有排三個版本那句；half：自學過那句；full：念過經濟系那句（AA_224 第 2 組）',pick(null)==='雙主修要多修好多學'&&pick('none')==='雙主修要多修好多學'&&pick('half')==='你說你自學過一點經'&&pick('full')==='你念過經濟系，我只',[pick(null),pick('half'),pick('full')].join(' / ')); }
{ const ev=STORY_EVENTS.find(e=>e.id==='ev_xinci_double');
  check('ev_xinci_double：（AA_209：開頭一句旁白、（小聲）拿掉）「經濟的期中在債總的隔天。兩科我都還沒念完……我可能要放棄一科。」、大一下第 6～7 週＝2026-03-30～04-12（START-WEEK 選 1 起寫成週次，日期和原本的第 195～208 天一樣）',ev.dialogue[0].text==='（總圖裡，她壓低聲音。）'&&ev.dialogue[1].text==='經濟的期中在債總的隔天。兩科我都還沒念完……我可能要放棄一科。'&&JSON.stringify(ev.term)==='["Y1S2"]'&&JSON.stringify(ev.weeks)==='[6,7]'&&!ev.day_min&&!ev.day_max&&(()=>{ for(let d=180;d<=220;d++){ const t=CALENDAR.termOf(d), inW=!!t&&t.id==='Y1S2'&&(t.week===6||t.week===7); if(inW!==(d>=dayOf('2026-03-30')&&d<=dayOf('2026-04-12'))) return false; } return true; })());
  check('第 195、208 天是大一下第 6、7 週',CALENDAR.termOf(195).id==='Y1S2'&&CALENDAR.termOf(195).week===6&&CALENDAR.termOf(208).week===7,CALENDAR.termOf(195).week+'、'+CALENDAR.termOf(208).week); }
{ const e=ST('prof_huang')[0]; check('黃教授：「最近在重讀《正義：一場思辨之旅》。每讀一次，我就換一邊站。」，沒有課程條件（2026-10-14 課程調整：法律與社會刪了，AA_130 第 2 節第 3 列）',e==='「最近在重讀《正義：一場思辨之旅》。每讀一次，我就換一邊站。」'&&ST('prof_huang').length===1,JSON.stringify(ST('prof_huang'))); }
{ const e=line('yu',/辯論社下週/); check('Alison：「辯論社下週辯『網拍標錯價要不要出貨』。」、第 4～6 週、大一上、一次',!!e&&e.t==='「辯論社下週辯『網拍標錯價要不要出貨』。」'&&JSON.stringify(e.week)==='[4,6]'&&e.once===true); }
/* ---------- 7-2 不熟同學 ---------- */
const POOL=Object.keys(CHARACTERS).filter(id=>/^pool_/.test(id));
check('20 位不熟同學各三句，每句只說一次（once），第 3 句要說過心事（SHARED_SECRET）',POOL.length===20&&POOL.every(id=>ST(id).length===3&&ST(id).every(e=>e.once===true)&&!ST(id)[0].if&&!ST(id)[1].if&&JSON.stringify(ST(id)[2].if)===JSON.stringify({memory:[{npc:id,tag:'SHARED_SECRET'}]})));
check('改過的四個人：林采潔「我在寫一篇推理小說」、徐靜儀「我想當跑司法新聞的記者」、pool_19「想雙主修社工」（第 1 句是旁聽）、pool_3 的外觀描述（AA_498 第 1、3 節之後：名字改成蘇承恩、邱家齊；pool_3 的描述照地點換成「把冰箱塞滿的學長」）',CHARACTERS.pool_1.facts[1]==='我在寫一篇推理小說'&&CHARACTERS.pool_13.facts[1]==='我想當跑司法新聞的記者'&&CHARACTERS.pool_19.facts[0]==='想雙主修社工'&&/旁聽社工系/.test(ST('pool_19')[0].t)&&CHARACTERS.pool_3.descriptor==='把冰箱塞滿的學長'&&CHARACTERS.pool_19.name==='蘇承恩'&&CHARACTERS.pool_3.name==='邱家齊');
check('十男十女',POOL.filter(id=>CHARACTERS[id].gender==='m').length===10);
{ /* 一個人從認識到說完：心事不先洩漏 */
  const leaks=[]; for(const id of POOL){ fresh(dOf('Y1S1',5,3)); const sec=CHARACTERS[id].facts[1]; const seen=[];
    for(let k=0;k<6;k++){ G.day=dOf('Y1S1',5,3)+k; const L=STORY.smallTalk(G,id); seen.push(L.say||L.narr); }
    if(seen.some(t=>t&&t.includes(sec))) leaks.push(id); SOCIAL.reveal(id); }
  check('還沒說心事：六天的閒聊、旁白都沒有 facts[1]',!leaks.length,leaks.join(',')); }
{ const id='pool_9'; fresh(dOf('Y1S1',5,3)); G.social.reveal[id]='ACQUAINTANCE'; const day0=G.day;
  check('心事的時機：兩句還沒說完不說',!STORY.secretReady(G,id));
  STORY.smallTalk(G,id); G.day++; STORY.smallTalk(G,id); check('兩句說完的同一天也不說（一天一句）',!STORY.secretReady(G,id));
  G.day++; check('隔天：可以說了',STORY.secretReady(G,id)); }
/* ---------- 7-3 年級、在校時間 ---------- */
{ fresh(dOf('Y1S1',5,3)); const a=SOCIAL.yearOf('pool_3'), an=SOCIAL.displayName('pool_3'); fresh(dOf('Y2S1',5,3)); const b=SOCIAL.yearOf('pool_3'); const c=SOCIAL.yearOf('pool_1'); fresh(dOf('Y4S1',5,3)); const d=SOCIAL.yearOf('pool_2');
  /* AA_498 2-2 之後：認識前的稱呼是外觀描述（不在他的地點＝characters.js 的 descriptor），不再是「法律系三年級的男生」；年級照舊跟著遊戲走（SOCIAL.yearOf）*/
  check('年級跟著遊戲走：pool_3 大一時三年級、玩家大二時四年級；pool_1 玩家大二時是二年級；大四封頂；認識前叫外觀描述「把冰箱塞滿的學長」',a===3&&b===4&&c===2&&d===4&&an==='把冰箱塞滿的學長',[a,an,b,c,d].join(' / ')); }
{ fresh(dOf('Y3S1',3,3)); check('三年級的（pool_3）玩家大三不在學校；二年級的（pool_2）還在',!STORY.present('pool_3',G)&&STORY.present('pool_2',G)); }
/* ---------- 7-4 舊存檔 ---------- */
{ const mk=()=>({v:2,name:'測試',day:20,hour:10,zone:'campus',events:{done:{},last:{},count:0},social:{mem:{heroine_02:[{tag:'FIRST_MET',day:5,note:'campus'}],heroine_03:[{tag:'FIRST_MET',day:6,note:'library'},{tag:'SHARED_MEAL',day:7}],heroine_04:[{tag:'FIRST_MET',day:8,note:'wancai'}]},rel:{heroine_02:{fam:9}}}});
  /* game3d.js 的 relabelFirstMet（瀏覽器才載得進整個 game3d：這裡抽出那一段原始碼來跑）*/
  const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const i=src.indexOf('  const MEET_EVENTS='), j=src.indexOf('  GM.relabelFirstMet=relabelFirstMet;');
  const relabel=vm.runInThisContext('(function(){'+src.slice(i,j)+' return relabelFirstMet; })()');
  const s1=mk(); s1.events.done.ev_ziqing_club=1; const out=relabel(s1);
  check('(a) 芷若：一般自我介紹留下的 FIRST_MET、相遇事件沒播過 → 標成 GREETED（熟悉度不動）',out.includes('heroine_02')&&s1.social.mem.heroine_02[0].tag==='GREETED'&&s1.social.rel.heroine_02.fam===9,JSON.stringify(out));
  check('(b) 子晴：吉他社初遇播過 → 不動；語彤：已經有一起吃飯的記憶 → 不動',!out.includes('heroine_04')&&s1.social.mem.heroine_04[0].tag==='FIRST_MET'&&!out.includes('heroine_03')&&s1.social.mem.heroine_03[0].tag==='FIRST_MET');
  check('只做一次（fm120）',s1.social.fm120===true&&relabel(s1).length===0);
  const s2=mk(); s2.events.done.ev_noodle_yutong=1; s2.social.mem.heroine_03=[{tag:'FIRST_MET',day:6}]; const o2=relabel(s2); check('她的任何事件播過（麵店）→ 不動',!o2.includes('heroine_03'));
  check('applySave：先備份再改（firstMetMigrate；備份與失敗時不改的細節在 tests/save_firstmet_unit.js，D61）',/s=firstMetMigrate\(s,raw\)/.test(src)); }
{ fresh(dOf('Y1S1',4,5)); G.social.mem.heroine_02=[{tag:'GREETED',day:5}]; check('標成一般招呼以後：芷若算還沒見過（相遇事件會把她當第一次見面）',!SOCIAL.has('heroine_02','FIRST_MET')); }
/* ---------- 7-5 ---------- */
{ const ev=STORY_EVENTS.find(e=>e.id==='ev_rain_library_door'); fresh(10); check('雨天的總圖門口：還沒見過語彤才演（notMemory FIRST_MET），對話沒動',JSON.stringify(ev.prereq)==='{"notMemory":[{"npc":"heroine_03","tag":"FIRST_MET"}]}'&&EVENTS.cond(ev.prereq)&&(SOCIAL.meet('heroine_03','campus'),!EVENTS.cond(ev.prereq))&&ev.dialogue[1].text==='……'); }
{ const ev=STORY_EVENTS.find(e=>e.id==='ev_zhiruo_ge_group');
  check('經原分組：標題「經原分組」、大一上、週五、12:06–13:00、普通教學館、第 4 週週五起（2025-09-26；AA_195 4-7 A4 起改看週次 minWeek，不再用 day_min 10），沒有 FIRST_MET 前置',ev.title==='經原分組'&&JSON.stringify(ev.term)==='["Y1S1"]'&&JSON.stringify(ev.weekday)==='[5]'&&JSON.stringify(ev.time)==='[12.1,13]'&&ev.location==='putong'&&!ev.day_min&&ev.minWeek&&ev.minWeek.term==='Y1S1'&&ev.minWeek.week===4&&dayOf('2025-09-26')===10&&CALENDAR.termOf(10).week===4&&!(ev.prereq&&ev.prereq.memory)&&ev.dialogue[0].text==='欸，是你。你也修經原喔？'&&ev.dialogue[1].text==='不好意思，你是法律系的嗎？剛剛點名有聽到。'); }   /* AA_207 §2：開場兩版（原本「欸！法律系！你也修「經濟學原理」？」）*/
{ const ev=STORY_EVENTS.find(e=>e.id==='ev_zhiruo_bell'); const ch=ev.dialogue.find(d=>d.choice).choice;
  check('傅鐘：「剛下外文系的課。今天一句詩翻了一整堂。」、經原那個選項要 Z2 之後、「對啊。下一堂三點，懶得走。」（AA_207：原本「發呆是下課最重要的部分。」；經原選項另開一段）',ev.dialogue[0].text==='剛下外文系的課。今天一句詩翻了一整堂。'&&ch[0].text==='「週五的經原，妳聽得懂供給曲線嗎？」'&&JSON.stringify(ch[0].if)==='{"events":["ev_zhiruo_ge_group"]}'&&ev.dialogue.some(d=>d.text==='對啊。下一堂三點，懶得走。')&&ch[0].goto==='ge'&&ev.dialogue.some(d=>d.text==='上週那張圖我只抄到一半，下次借我看。'));
  fresh(10); const vis=()=>ch.filter(c=>(!c.if||EVENTS.cond(c.if))&&(!c.unless||!EVENTS.cond(c.unless))).map(c=>c.text.slice(1,6)).join('|');
  const a=vis(); G.events.done.ev_zhiruo_ge_group=1; const b=vis();
  check('還沒有 Z2：只有「發呆」那個選項；有 Z2：多了經原那個',a==='妳上完課都'&&b==='週五的經原|妳上完課都',a+' / '+b);
  check('芷若作息的備註：「外文系的課後在傅鐘附近」',CHARACTERS.heroine_02.daily_schedule.some(e=>typeof e.note==='string'&&e.note.startsWith('外文系的課後在傅鐘附近'))); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

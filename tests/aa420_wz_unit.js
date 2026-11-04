// 溫州街四條故事線＋單一事件（DL-11；USER_WANTS B05；AA_420 第 3～10 節、第 11 節第 3 點 BB 的測試清單）——不需要瀏覽器。src/data/wz_events.js、src/wzlines3d.js
//   0  載得到；index.html：jobs3d.js → data/wz_events.js → wzlines3d.js；舊存檔（沒有任何 WZ 旗標）什麼都不演
//   1  線一：1-2 只在大二上第 6～10 週；1-3 法服的週六（出門提醒「今天陪阿德」、早午餐自動請假、「這次不去」順延一次再停）；法服現場沒有學姊（柏翰那兩句／「你坐在阿德旁邊」）；
//      1-5 最早大二上第 13 週（留下來的四句 AA_420 3-3）；沒參與的玩家大二下第 1 週店搬走；語彤的租約多一句（WZ_COPY_LEASE≥2）；1-6、阿芃的年級；1-7 日本路線沒有
//   2  線二：沒有打工、週六下午第 2 次喝茶遇得到呂老師（2-1）；2-4 在萬才館研討室 A（讀書會那一晚；Alison 三句）；美國路線 2-6 在大四下、多兩句；日本路線照大四上
//   3  線三：週六班的玩家選「法服」小米姐多一句；3-5 小米姐那一句；沒幫忙的那一條第 10 班先生回來
//   4  線四：大三上第 10 週才有走失單（第 9 週沒有）；22:00 以後子晴陪找（週三不行）；以安的第一句；找到的那幾句（AA_420 6-3）；4-4（原句，演的時候 WZCAT.hold('lie')、演完 release）
//   5  學姊：不講數字、不數數；朋友以上叫名字；WZ-T4 祐廷大四上沒有；WZ-B4 只有大二；WZ-C5 只有大四下第 13～14 週
//   6  子晴：這裡沒有「欸不是」；WZ-C4 只在大一下第 12～13 週的週二、四
//   7  沛珊：WZ-P4 2026-12-17 以後不演；6/18 的私訊只給 6/18 以前演過的玩家；法律小教室
//   8  單一事件的定稿句：WZ-B3（阿哲「哥」、Alison 單週週日）、WZ-C3 柏翰最後一句、WZ-C6「……我的手很粗。」
//   9  課堂回想（智財第 4 週）、房間物件
// 修改前（開發分支 01ade8098）：沒有 src/wzlines3d.js——FAIL。用法：node tests/aa420_wz_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.SISY23={preTalk:async()=>false};
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(WZS|EAT|EAT_LINES|JOBS|WZ_JOBS_DATA|WZ_SHOPS_LAYOUT|WZ_PARK_LAYOUT|PARK|WZ_EVENTS|WZL|Y2B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ for(const f of ['src/data/wz_park_layout.js','src/wzpark3d.js','src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/y2b_events.js','src/data/wz_jobs.js','src/jobs3d.js','src/data/wz_events.js','src/wzlines3d.js']) load(f); }catch(e){ ok=false; err=String(e&&e.stack||e); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
GM.addNote=(id,title,body)=>{ const N=H.G.notes||(H.G.notes=[]); if(!N.some(n=>n.id===id)) N.push({id,title,body}); };
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(k,h,zone||'wenzhou',flags); toasts.length=0; return G; };
const DK=k=>STORY.dayOfKey(k), key=d=>CALENDAR.dateOf(d).key, TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const hire=(k,days,o)=>{ const J0=JOBS.rec(H.G); J0[k]=Object.assign({since:H.G.day-1,from:(H.G.day-1)*24,day:days,shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:H.G.day-1,wk:{},brk:{},ot:{}},o||{}); return J0[k]; };
const said=t=>H.said.some(s=>s.t===t);
const L=()=>H.lines();
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const done=id=>!!(H.G.events.done[id]);
const run=async id=>{ await EVENTS.run(ev(id)); };
const inPark=()=>{ const n=WZ_PARK_LAYOUT.interact.find(q=>q.kind==='notice'); H.E.player.obj.position.x=n.x; H.E.player.obj.position.z=n.z; H.G.zone='wenzhou'; };
const tickUntil=async()=>{ const r=WZL.tick(GM); for(let i=0;i<20&&WZL.playing;i++) await new Promise(r=>setTimeout(r,0)); return r; };
const lines=id=>(ev(id).dialogue||[]).filter(l=>l.text!=null);

(async()=>{
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
check('0. 新檔載得到；index.html：jobs3d.js → data/wz_events.js → wzlines3d.js',ok&&typeof WZL!=='undefined'&&!!ev('ev_wz_c2')&&/jobs3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/wz_events\.js\?v=[^"]+"><\/script>\n<script src="src\/wzlines3d\.js/.test(html),err);
await sec(0,async()=>{ const G=fresh('2027-09-20',15,'wz_print'); delete G.jobs; WZL.phone(G);
  check('0. 舊存檔：沒有 WZ 旗標＝線一、線二都沒有開始；店沒有搬（大三）……只有「沒參與＝搬走」那一條',WZL.lease4(G)===null&&WZL.line2Due(G,'visit')===null&&G.flags.WZ_COPY_SHOP==='moved'&&WZL.lineToday(G)===null);
  check('0. 拿掉 SIS_BF_MET、以安陪找貓的 UNPLANNED_DAY：程式裡沒有',!/SIS_BF_MET|UNPLANNED_DAY/.test(fs.readFileSync(path.join(H.ROOT,'src/wzlines3d.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'')+fs.readFileSync(path.join(H.ROOT,'src/data/wz_events.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,''))); });

await sec(1,async()=>{ const due=(t,w,wdd)=>{ fresh(key(TD(t,w,wdd)),18,'wz_print'); return WZL.SHIFT.copy.find(e=>e.id==='ev_wz_c_lease1').due(H.G,4); };
  check('1. 1-2 房東的信只在大二上第 6～10 週（第 5、11 週、大二下沒有）',!due('Y2S1',5,2)&&due('Y2S1',6,2)&&due('Y2S1',10,4)&&!due('Y2S1',11,2)&&!due('Y2S2',7,2));
  fresh(key(TD('Y2S1',6,2)),21,'wz_print'); H.picks=['我可以陪你去']; await run('ev_wz_c_lease1');
  check('1. 1-2：阿芃（在角落寫功課，沒有抬頭）、選法服＝WZ_COPY_LEASE 1',said('爸，你可以問他啊。他是法律系的。')&&H.G.flags.WZ_COPY_LEASE===1&&H.G.flags.WZ_C_L1===H.G.day,J(L()));
  hire('brunch',[6]); WZL.phone(H.G); const R=H.G.flags.WZ_LINE_L, w7=TD('Y2S1',7,6);
  check('1. 1-3 的週六＝之後第一個值班週六（最早第 7 週）',!!R&&R.day===w7&&R.k==='lease2',J(R)+' '+w7);
  at(w7,7,'dorm'); STORY.phoneRules(GM); const q=OUT.get(H.G,'fafu_'+w7);
  check('1. 出門提醒「法服值班（今天陪阿德）」、「這次不去」；早午餐自動請假（沒有排）',!!q&&q.title==='法服值班（今天陪阿德）'&&q.no==='這次不去'&&!JOBS.due(H.G,'brunch',w7)&&JOBS.scheduled(H.G,'brunch',w7),J(q));
  /* 沒去：順延到下一個值班週六一次 */
  at(w7,13,'dorm'); WZL.phone(H.G); const R2=H.G.flags.WZ_LINE_L; check('1. 「這次不去」：順延到下一個值班週六（第 11 週；第 9 週期中考停）',R2&&R2.day===TD('Y2S1',11,6)&&R2.tries===1,J(R2));
  at(R2.day,13,'dorm'); WZL.phone(H.G); check('1. 再沒去：線一停（WZ_LEASE_STOP）',!!H.G.flags.WZ_LEASE_STOP&&!H.G.flags.WZ_LINE_L);
  at(TD('Y2S1',12,2),19,'wz_print'); check('1. 停了：1-5 最早第 13 週（第 12 週還沒）',WZL.lease4(H.G)===null);
  at(TD('Y2S1',13,2),19,'wz_print'); check('1. 第 13 週：搬走',WZL.lease4(H.G)==='moved');
  /* 1-3（社員：柏翰兩句；學姊不在）*/
  const sat=TD('Y2S1',7,6); fresh(key(sat),9.2,'wancai',{lawclub:true,WZ_COPY_LEASE:1,WZ_C_L1:TD('Y2S1',6,2)}); WZL.phone(H.G); H.said=[];
  check('1. 社員、值班週六 9:00 在萬才館：開演 1-3',STORY.fafuMember(H.G)&&!!WZL.lineToday(H.G)); await tickUntil();
  check('1. 1-3：柏翰「你帶來的？……先寫日期，再寫他的名字。」；沒有學姊；WZ_COPY_LEASE 2；法服次數 +1',said('你帶來的？……先寫日期，再寫他的名字。')&&said('你坐在旁邊做紀錄。阿德每回答一題，就看你一眼，好像在確認你有寫。')&&!H.said.some(s=>/學姊/.test(s.who||''))&&H.G.flags.WZ_COPY_LEASE===2&&H.G.flags.LAWCLUB_SAT_VISITS===1,J(L()));
  fresh(key(sat),9.2,'wancai',{WZ_COPY_LEASE:1,WZ_C_L1:TD('Y2S1',6,2)}); WZL.phone(H.G); H.said=[]; await tickUntil();
  check('1. 沒加入法服：「你坐在阿德旁邊。」、柏翰那兩句不演',said('你坐在阿德旁邊。阿德每回答一題，就看你一眼，好像在確認你有寫。')&&!said('你帶來的？……先寫日期，再寫他的名字。'),J(L()));
  check('1. 法服的三件事裡沒有學姊（heroine_05 不說話）',['ev_wz_c_lease2','ev_wz_c_lease3','ev_wz_b_ins2'].every(id=>lines(id).every(l=>l.speaker!=='heroine_05')));
  /* 1-4、1-5 留下來 */
  fresh(key(TD('Y2S1',11,6)),9.2,'wancai',{WZ_COPY_LEASE:2,WZ_C_L1:1,WZ_C_L2:TD('Y2S1',7,6)}); WZL.phone(H.G); await tickUntil(); check('1. 1-4：WZ_COPY_LEASE 3、雅筑學姊「您整理得很好。」',H.G.flags.WZ_COPY_LEASE===3&&said('您整理得很好。'));
  const l3=H.G.day; at(TD('Y2S1',12,4),19,'wz_print'); check('1. 1-4 之後兩週以內／第 12 週：還沒有結果',WZL.lease4(H.G)===null);
  at(TD('Y2S1',14,2),19,'wz_print'); check('1. 1-4 之後兩週（第 14 週週二）：留下來',WZL.lease4(H.G)==='stay'&&H.G.day>=l3+14);
  H.said=[]; await JOBS.onEnter(GM,'copy');
  check('1. 1-5 留下來的四句（AA_420 3-3）',said('房東說漲一成就好。我照學長說的，一條一條談，談完寫下來。')&&said('我們法律系的，果然不只會印考古題。')&&said('爸，你剛剛說「我們法律系」。')&&said('……我說錯了。')&&H.G.flags.WZ_COPY_SHOP==='stay',J(L()));
  /* 語彤的租約多一句 */
  const lt=ev('ev_yt_lease_text'), i=lt.dialogue.findIndex(l=>l.text==='（你想起阿德那封信。學長第一個問的，是租約寫了幾年。）'), j=lt.dialogue.findIndex(l=>l.text==='（你傳了一張課本那一頁的照片。）'), k=lt.dialogue.findIndex(l=>l.text==='……房東想把整棟賣掉。還沒確定。');
  fresh('2027-03-30',12,'linze',{WZ_COPY_LEASE:2}); const c1=EVENTS.cond(lt.dialogue[i].if); H.G.flags.WZ_COPY_LEASE=1; const c0=EVENTS.cond(lt.dialogue[i].if);
  check('1. 語彤的租約訊息多一句（WZ_COPY_LEASE≥2；在「房東想把整棟賣掉」之後、照片之前）',i>k&&i<j&&c1&&!c0);
  /* 1-6、阿芃的年級 */
  fresh(key(TD('Y3S1',3,2)),19,'wz_print'); H.picks=[0]; await run('ev_wz_c7c'); check('1. 第 3 題：沒上過 ip_law 第 4 週＝「這題我要回去想。」；大三＝「我才高一。」',said('這題我要回去想。')&&said('那你想好了再跟我說。我不急。我才高一。'),J(L()));
  H.said=[]; H.picks=[0]; await run('ev_wz_c_apeng'); const o=H.opts.slice(-1)[0]||[];
  check('1. 1-6：沒上過 ip_law 第 4 週沒有「想好了。」；「我以後要念法律。我爸還不知道。」「我聽到了。」',J(o)===J(['「還沒。」'])&&said('沒關係。我自己去查。')&&said('我以後要念法律。我爸還不知道。')&&said('我聽到了。')&&H.G.flags.WZ_APENG_LAW===true,J(o));
  check('1. 1-6 的禁用句拿掉了',!lines('ev_wz_c_apeng').some(l=>/不是因為你/.test(l.text)));
  fresh('2028-06-01',12,'dorm',{WZ_APENG_LAW:true}); VAC.rec(H.G).reg['C02@Y3']='yes'; check('1. 1-7：大三升大四的暑假 C02、有 WZ_APENG_LAW',WZL.campOn(H.G));
  H.G.flags.EXCHANGE_ROUTE='JP'; check('1. 1-7：日本路線沒有',!WZL.campOn(H.G)); H.G.flags.EXCHANGE_ROUTE='US'; check('1. 1-7：美國路線照常（7/25 才走）',WZL.campOn(H.G));
  check('1. 1-7 拿掉國小組那一段',!lines('ev_wz_c_camp').some(l=>/國小組/.test(l.text))); });

await sec(2,async()=>{ const sat=TD('Y1S2',4,6); fresh(key(sat),14,'wz_teahouse'); JOBS.rec(H.G)._meta.n.teaSat=0; H.picks=[0,'「老師的家還在嗎？」'];
  const r1=await WZL.afterVisit(GM,'tea',{bought:true}); check('2. 週六下午第一次來喝茶：還沒有呂老師',!r1);
  JOBS.rec(H.G)._meta.n.teaSat=2; H.said=[]; await WZL.afterVisit(GM,'tea',{bought:true});
  check('2. 沒有打工、週六下午第 2 次喝茶：呂老師（2-1）、WZ_YE 1',said('年輕人，你知道這條街，以前是一整條嗎？')&&said('房子還在。地，就不知道算誰的了。')&&H.G.flags.WZ_YE===1,J(L()));
  H.G.hour=14; at(sat+1,14); check('2. 週日沒有（呂老師每週六下午）',WZL.line2Due(H.G,'visit')===null);
  at(TD('Y2S1',2,6),14); check('2. 2-3 要大二上物權第 3 週以後（第 2 週沒有）',WZL.line2Due(H.G,'visit')===null); at(TD('Y2S1',3,6),14); check('2. 第 3 週：2-3',WZL.line2Due(H.G,'visit')==='ev_wz_t2b');
  /* 2-4：公法讀書會那一晚 */
  const thu=TD('Y3S1',2,4); fresh(key(thu),20,'wancai',{WZ_YE:2,CLUB_public_law_group:true}); const a=ACTIVITIES.list.find(x=>x.id==='public_law_group'); const ce=CLS.clubEvent(H.G,a);
  check('2. 大三上第一次去公法讀書會：2-4',!!ce&&ce.id==='ev_wz_t_study',ce&&ce.id); H.said=[]; await EVENTS.run(ce);
  check('2. 2-4：萬才館研討室 A、Alison 那幾句、九點半、以安的最後一句（AA_420 4-2）',said('週四晚上，法律系館B 研討室 A。以安、Alison，還有兩個你不熟的同學。桌上是呂老師那個鐵盒子裡的東西：一疊發黃的紙。')&&said('可是這樣不公平吧！')&&said('三個人把每一張紙依日期排好，寫在白板的時間線上。九點半，管理員來敲門。')&&said('我們不幫他打官司。我們幫他整理到，他知道該問誰、怎麼問。')&&H.G.flags.AN_YE_STUDY===true,J(L()));
  fresh(key(TD('Y2S2',3,4)),20,'wancai',{WZ_YE:2}); check('2. 大二下沒有 2-4',!(CLS.clubEvent(H.G,a)||{id:''}).id.startsWith('ev_wz'));
  /* 2-6：美國路線大四下，多兩句；日本路線大四上 */
  fresh(key(TD('Y4S1',3,6)),14,'wz_teahouse',{WZ_YE:1,EXCHANGE_ROUTE:'US'}); check('2. 美國路線大四上：沒有 2-6',WZL.line2Due(H.G,'visit')!=='ev_wz_t2c');
  at(TD('Y4S2',1,6),14); check('2. 美國路線大四下開學：2-6',WZL.line2Due(H.G,'visit')==='ev_wz_t2c'); H.said=[]; await run('ev_wz_t2c');
  check('2. 美國路線：「回來了。我本來上個月就要搬。」「想說，等你回來喝一杯再走。」、沒有讀書會的版本',said('回來了。我本來上個月就要搬。')&&said('想說，等你回來喝一杯再走。')&&said('那塊地的事，我想就這樣吧。我女兒說，人比地重要。')&&!H.G.flags.WZ_YE_DONE,J(L()));
  fresh(key(TD('Y4S1',3,6)),14,'wz_teahouse',{WZ_YE:2,AN_YE_STUDY:true,EXCHANGE_ROUTE:'JP'}); check('2. 日本路線：大四上 2-6',WZL.line2Due(H.G,'visit')==='ev_wz_t2c'); H.said=[]; await run('ev_wz_t2c');
  check('2. 有讀書會的版本、沒有美國那兩句、WZ_YE_DONE＋白板照片',said('家裡照你們整理的那張時間表，請了律師幫忙，向國家請求把登記改回來。結果還沒出來。')&&!said('回來了。我本來上個月就要搬。')&&H.G.flags.WZ_YE_DONE===true&&STORY.roomItemList(H.G).some(r=>r[0]==='讀書會白板的照片'));
  fresh(key(DK('2029-06-16')),14,'wz_teahouse',{WZ_YE:1}); check('2. 大四下結束都沒遇到：蘇姨「呂老師搬走了。杯子留在這裡。」',WZL.luMissed(H.G)); H.said=[]; await JOBS.onEnter(GM,'tea'); check('2. （蘇姨那一句）',said('呂老師搬走了。杯子留在這裡。')&&!WZL.luMissed(H.G)); });

await sec(3,async()=>{ const sat=TD('Y2S1',4,6); fresh(key(sat),11,'wz_brunch',{WZ_BRUNCH_HELP:true,WZ_B2_DAY:sat-21}); hire('brunch',[6],{shifts:9}); H.picks=['B館週六上午有法服']; await run('ev_wz_b_ins');
  check('3. 週六班的玩家選「法服」：小米姐（在廚房，聽到了）「那天的班你不用來。蛋我煮。」',said('那天的班你不用來。蛋我煮。')&&H.G.flags.WZ_BRUNCH_INS===1,J(L()));
  fresh(key(sat),11,'wz_brunch',{WZ_BRUNCH_HELP:true,WZ_B2_DAY:sat-21}); hire('brunch',[7],{shifts:9}); H.picks=['B館週六上午有法服']; await run('ev_wz_b_ins'); check('3. 週日班的玩家沒有那一句',!said('那天的班你不用來。蛋我煮。'));
  fresh(key(sat),11,'wz_brunch',{WZ_BRUNCH_INS:2,WZ_B_HELP_DAY:sat-21}); hire('brunch',[6],{shifts:12,worked:[sat-14,sat-7]}); H.G.events.done.ev_wz_b2=1; H.said=[]; await WZL.shiftEv(GM,'brunch',13);
  check('3. 3-4 之後第三個週末班：3-5、小米姐（在廚房）「他們說下次要帶孫子來。……我去找一張兒童椅。」、手寫的卡片',said('他們說下次要帶孫子來。……我去找一張兒童椅。')&&!said('他們說要把你寫進遺囑。開玩笑的。……應該。')&&STORY.roomItemList(H.G).some(r=>r[0]==='手寫的卡片'),J(L()));
  /* 沒幫忙：第 10 班 */
  fresh(key(sat),11,'wz_brunch'); hire('brunch',[6],{shifts:9}); H.G.events.done.ev_wz_b2=1; H.said=[]; await WZL.shiftEv(GM,'brunch',9); check('3. 沒幫忙的那一條：第 9 班還沒有',!said('小老闆，全熟。'));
  H.said=[]; await WZL.shiftEv(GM,'brunch',10); check('3. 第 10 班：先生「我說了，我會回來吃。」「小老闆，全熟。」、沒有卡片',said('我說了，我會回來吃。')&&said('小老闆，全熟。')&&!H.G.flags.WZ_CARD,J(L()));
  check('3. 先生住院的那幾班沒有「兩份老樣子」；回來以後才有',(()=>{ H.G.flags.WZ_BRUNCH_BACK=null; const a=WZL.shiftLines(H.G,'brunch',8,'mid'); H.G.flags.WZ_BRUNCH_BACK='plain'; const b=WZL.shiftLines(H.G,'brunch',11,'mid'); return a===null&&!!b; })()); });

await sec(4,async()=>{ const w9=TD('Y3S1',9,2), w10=TD('Y3S1',10,2); fresh(key(w9),10); H.G.daily={park:{feedN:3,catName:'所長'}};
  check('4. 第 9 週（期中考）：沒有走失單、貓在',!PARK.catLost(H.G)&&!PARK.notices(H.G).some(q=>q[0]==='走失的貓')&&!WZL.lostDue(H.G));
  at(w10,10); check('4. 第 10 週：走失單、貓不在',PARK.catLost(H.G)&&PARK.notices(H.G).some(q=>q[0]==='走失的貓')&&WZL.lostDue(H.G));
  inPark(); H.said=[]; await tickUntil(); check('4. 走進公園：4-1（象棋阿伯「牠三天沒來巡公園了。」）',said('牠三天沒來巡公園了。')&&H.G.flags.WZ_CAT_LOST!=null,J(L()));
  /* 子晴：22:00 以後、不是週三 */
  SOCIAL.rel('heroine_04').fam=30; SOCIAL.remember('heroine_04','FIRST_MET',''); H.G.hour=22.5; check('4. 22:00 以後：子晴陪找',WZL.companion(H.G)==='heroine_04');
  at(TD('Y3S1',10,3),22.5); check('4. 週三：子晴不在',WZL.companion(H.G)!=='heroine_04');
  /* 以安：朋友以上、平日 17～19 */
  at(w10,17.5); SOCIAL.rel('heroine_01').fam=50; SOCIAL.rel('heroine_01').trust=35; SOCIAL.remember('heroine_01','FIRST_MET',''); check('4. 平日 17:30：以安',WZL.companion(H.G)==='heroine_01');
  H.said=[]; H.picks=['找茶屋的院子']; await WZL.search(GM);
  check('4. 以安的第一句「我知道牠。牠常在巷口曬太陽。」；茶屋院子＝找到；以安「……牠只是想休息。」',said('我知道牠。牠常在巷口曬太陽。')&&!said('我知道牠。上次那個下午，牠在巷口。')&&H.entered.includes('wz_teahouse')&&said('……牠只是想休息。')&&H.G.flags.CAT_SEARCH_WITH_heroine_01===true&&H.G.flags.WZ_CAT_FOUND===w10,J(L()));
  at(w10+1,10); check('4. 隔天：公布欄換成「已找到」',PARK.catFound(H.G)&&!PARK.notices(H.G).some(q=>q[0]==='走失的貓'));
  check('4. 找到的那幾句（AA_420 6-3）：Alison、子晴；沒有「欸不是」、沒有 NPC 那句',lines('ev_wz_p_found').some(l=>l.text==='欸牠好胖！所以牠是受傷，還是太胖跳不上牆？')&&lines('ev_wz_p_found').some(l=>l.text==='受傷。')&&lines('ev_wz_p_found').some(l=>l.text==='牠在這裡度假。比我們會過日子。')&&WZL.FU.heroine_04==='我昨天繞去公園。牠在巡邏，走路已經不跛了。');
  /* 4-4 */
  { const BACK='所長回來了，前腳纏著一圈繃帶，躺在樹下的圓椅上，和平常一樣不理人。', log=[]; global.WZCAT={hold:p=>log.push(['hold',p,WZL.playing]),release:()=>log.push(['release',WZL.playing])};
    fresh(key(TD('Y3S1',11,2)),10); H.G.daily={park:{feedN:4}}; inPark(); H.said=[]; await tickUntil();
    check('4. 沒找：第 11 週第一次進公園 4-4，白天 10:00 也照原句「躺在樹下的圓椅上」（AA_493 第 3 節：句子不改）',said(BACK)&&!H.said.some(s=>/坐在樹下的圓椅前面/.test(s.t)));
    check('4. 演這一場時貓固定趴著：開演前 WZCAT.hold(\'lie\')、演完 release（LAWWW2 ccc329672）',J(log)===J([['hold','lie',false],['release',false]])&&said(BACK),J(log));
    log.length=0; fresh(key(TD('Y3S1',11,2)),19); H.G.daily={park:{feedN:4}}; inPark(); H.said=[]; await tickUntil(); check('4. 沒找：晚上（17:30 以後）照原句、一樣 hold／release',said(BACK)&&J(log)===J([['hold','lie',false],['release',false]]),J(log));
    log.length=0; delete global.WZCAT; fresh(key(TD('Y3S1',11,2)),10); H.G.daily={park:{feedN:4}}; inPark(); H.said=[]; await tickUntil(); check('4. 沒有 3D 的貓（WZCAT 沒載入）：照樣演原句、不出錯',said(BACK)); }
  fresh(key(TD('Y3S1',11,2)),10); H.G.daily={park:{feedN:2}}; check('4. 餵不到三次：沒有這條線',!WZL.backDue(H.G)); });

await sec(5,async()=>{ const SIS=['ev_wz_b4','ev_wz_c5','ev_wz_t4'].flatMap(id=>lines(id).filter(l=>l.speaker==='heroine_05').map(l=>l.text)).concat([WZL.TEA_GIFT.heroine_05,'週六早上的蛋，今天也是半熟嗎？','茶屋那壺水，我後來查了。……原來不能用滾的。']);
  check('5. 學姊在溫州街的句子不講數字、不數數（AA_420 第 1 節）',SIS.every(t=>!/[0-9０-９]|一百|八十五|分四十|四年|兩年|一件事|數了/.test(t)),J(SIS.filter(t=>/[0-9０-９]|一百|八十五|分四十|四年|兩年/.test(t))));
  check('5. 拿掉的舊句（一百四十二、四年加兩年、八十五度、還是三分四十秒）',!SIS.some(t=>/一百四十二|四年，加兩年|八十五度|還是三分四十秒/.test(t)));
  const sat=TD('Y2S1',4,6); fresh(key(sat),9,'wz_brunch'); SOCIAL.rel('heroine_05').fam=50; SOCIAL.rel('heroine_05').trust=35; SOCIAL.remember('heroine_05','FIRST_MET',''); hire('brunch',[6],{shifts:3}); H.said=[]; H.picks=[0]; await run('ev_wz_b4');
  check('5. WZ-B4 朋友以上：「祐廷？你在這裡打工喔。」、結帳「蛋剛好。……替我跟你們老闆說。」',said('祐廷？你在這裡打工喔。')&&said('蛋剛好。……替我跟你們老闆說。')&&!said('週六早上起得來，讀書會就不准遲到喔。'),J(L()));
  const b4=WZL.SHIFT.brunch.find(e=>e.id==='ev_wz_b4'); at(TD('Y3S1',4,6),9); H.G.flags.WZ_B4=null; check('5. WZ-B4 只有大二（大三沒有）',!b4.due(H.G,5)); at(TD('Y2S2',4,6),9); check('5. 大二下（另一學期）：可以',b4.due(H.G,5));
  const t4=WZL.SHIFT.tea.find(e=>e.id==='ev_wz_t4'); fresh(key(TD('Y4S1',5,6)),14,'wz_teahouse'); SOCIAL.rel('heroine_05').fam=30; SOCIAL.remember('heroine_05','FIRST_MET',''); check('5. WZ-T4 祐廷大四上沒有（她在美國）',!t4.due(H.G));
  at(TD('Y4S2',5,6),14); check('5. 大四下有（「這一杯泡得比較久。……剛好。」）',t4.due(H.G)&&lines('ev_wz_t4').some(l=>l.text==='這一杯泡得比較久。……剛好。'));
  at(TD('Y3S2',5,6),14); H.said=[]; await run('ev_wz_t4'); check('5. 大三有點熟：「學弟。這壺水要多燙？……我在學，你不用緊張。」',said('學弟。這壺水要多燙？……我在學，你不用緊張。'),J(L()));
  const c5=WZL.SHIFT.copy.find(e=>e.id==='ev_wz_c5'); fresh(key(TD('Y4S2',13,2)),19,'wz_print'); SOCIAL.remember('heroine_05','FIRST_MET',''); check('5. WZ-C5 大四下第 13 週有、第 12 週沒有',c5.due(H.G)&&(at(TD('Y4S2',12,2),19),!c5.due(H.G)));
  SOCIAL.rel('heroine_05').fam=50; SOCIAL.rel('heroine_05').trust=35; H.said=[]; H.picks=[0]; await run('ev_wz_c5'); check('5. WZ-C5 朋友以上：「祐廷。麻煩你。」…「好。……原來拿在手上，是這個重量。」',said('祐廷。麻煩你。')&&said('好。……原來拿在手上，是這個重量。')&&H.G.flags.WZ_SIS_THESIS===true,J(L())); });

await sec(6,async()=>{ const ZQ=['ev_wz_c4','ev_wz_p5','ev_wz_p_found'].flatMap(id=>lines(id).filter(l=>l.speaker==='heroine_04').map(l=>l.text)).concat([WZL.FU.heroine_04]);
  check('6. 子晴：這裡沒有「欸不是」',ZQ.length>5&&ZQ.every(t=>!/欸不是/.test(t)),J(ZQ));
  check('6. 鞦韆：交往中、大三的句子（AA_420 8-6）',ZQ.includes('你來剛好。幫我看這一行。……眼睛看螢幕。')&&ZQ.includes('畢業專題還有 bug。我每天晚上來這裡，跟它們一個一個談。'));
  const c4=WZL.SHIFT.copy.find(e=>e.id==='ev_wz_c4'); fresh(key(TD('Y1S2',12,2)),19,'wz_print'); SOCIAL.remember('heroine_04','FIRST_MET','');
  check('6. WZ-C4：大一下第 12 週週二有、週三沒有、第 14 週沒有',c4.due(H.G)&&(at(TD('Y1S2',12,3),19),!c4.due(H.G))&&(at(TD('Y1S2',14,2),19),!c4.due(H.G)));
  at(TD('Y1S2',12,2),19); H.said=[]; H.picks=[0]; await run('ev_wz_c4'); check('6. 認識：「……你在這裡打工？」',said('……你在這裡打工？')&&H.G.flags.WZ_ZQ_POSTER===true&&!H.G.flags.WZ_POSTER_ITEM,J(L()));
  const zs=ev('ev_ziqing_show'); check('6. Q5 成發多兩句（WZ_ZQ_POSTER）',zs.dialogue[0].text==='法律系館B門口貼著那張藍色的海報。藍色是對的。'&&zs.dialogue.filter(l=>l.text==='海報的藍色，台下的人有看到。').length===2); });

await sec(7,async()=>{ fresh('2026-12-17',17.1); SOCIAL.rel('classmate_peishan').fam=30; SOCIAL.remember('classmate_peishan','FIRST_MET',''); check('7. WZ-P4：2026-12-17 以後不演',CALENDAR.dateOf(H.G.day).wd===4&&!WZL.p4Due(H.G));
  fresh('2026-12-15',17.1); SOCIAL.rel('classmate_peishan').fam=30; SOCIAL.remember('classmate_peishan','FIRST_MET',''); check('7. 2026-12-15（二）17:06 在公園：演',WZL.p4Due(H.G));
  fresh('2026-03-05',17.1); SOCIAL.rel('classmate_peishan').fam=30; SOCIAL.remember('classmate_peishan','FIRST_MET',''); check('7. 大一下第 2 週（3/5）還沒',!WZL.p4Due(H.G));
  fresh('2026-03-12',17.1); SOCIAL.rel('classmate_peishan').fam=30; SOCIAL.remember('classmate_peishan','FIRST_MET',''); inPark(); H.picks=[0]; await tickUntil();
  check('7. 大一下第 3 週：WZ-P4（小女生、沛珊）',said('我在溜滑梯下面撿到十塊錢。可以拿去買糖果嗎？')&&said('她上週問我，法律管不管溜滑梯。我說，要問你。')&&H.G.flags.WZ_P4_DAY===H.G.day,J(L()));
  at(DK('2026-06-18'),21.5); WZL.phone(H.G); PHONE.tick(H.G); const ms=H.msgs('p:classmate_peishan');
  check('7. 6/18 21:00 沛珊的私訊（6/18 以前演過）',ms.includes('課輔班 6/25 是暑假前最後一天。想請一個會講法律的人來講十分鐘。')&&ms.includes('……那個綁馬尾的小女生指定你。'),J(ms));
  const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='wz_p4_invite'); PHONE.answer(H.G,m.ask.id,0); check('7. 「好。」→「好！我跟她說。」、WZ_PS_KIDS',H.msgs('p:classmate_peishan').includes('好！我跟她說。')&&H.G.flags.WZ_PS_KIDS===true);
  WZL.phone(H.G); check('7. 6/25 17:00 的法律小教室排進行程',!!OUT.get(H.G,'wz_p4_class'));
  at(DK('2026-06-25'),17.2); inPark(); H.said=[]; await tickUntil(); check('7. 6/25：法律小教室（十塊錢我交給管理員了。）',said('你是法律系的那個！十塊錢我交給管理員了。')&&said('她們會記得的。……至少會記得你。'),J(L()));
  fresh('2026-09-15',12,'wenzhou',{WZ_P4_DAY:DK('2026-09-15')}); at(DK('2026-06-18'),22); WZL.phone(H.G); check('7. 6/18 以後才演的玩家：沒有私訊',!PHONE.sent(H.G,'wz_p4_invite'));
  fresh('2026-06-25',19,'dorm',{WZ_P4_DAY:DK('2026-04-01'),WZ_PS_KIDS:true}); WZL.phone(H.G); PHONE.tick(H.G); check('7. 答應了、那天沒去：18:30「她們有做卡片給你。我先收著。」',H.msgs('p:classmate_peishan').includes('她們有做卡片給你。我先收著。')); });

await sec(8,async()=>{ const sun=TD('Y1S2',5,7); fresh(key(sun),9,'wz_brunch',{ZHE_CALLS_GE:true}); H.said=[]; await run('ev_wz_b3');
  check('8. WZ-B3：「哥！你真的穿圍裙！」、單週週日 Alison 那句',said('哥！你真的穿圍裙！')&&said('欸他真的會端盤子！我以為他會把蛋打在地上。')&&said('對了，語彤說她今天要去拍照，叫我們拍你給她看。')&&said('五個人。四人桌加一張椅子就好。'),J(L()));
  fresh(key(TD('Y1S2',6,6)),9,'wz_brunch'); H.said=[]; await run('ev_wz_b3'); check('8. 沒有 ZHE_CALLS_GE：「祐廷！你真的穿圍裙！」；週六沒有 Alison 那句',said('祐廷！你真的穿圍裙！')&&!said('對了，語彤說她今天要去拍照，叫我們拍你給她看。'));
  check('8. WZ-C3 柏翰最後一句（AA_420 7-2）',lines('ev_wz_c3').some(l=>l.text==='下一次考試週，我們週二、週四晚上在社科圖。你要來就來。……我多印了一份，給你。')&&!lines('ev_wz_c3').some(l=>/三十一份/.test(l.text)));
  check('8. WZ-C6「很好看。」→「……我的手很粗。」（她把手收到背後。）',lines('ev_wz_c6_show').some(l=>l.text==='……我的手很粗。')&&lines('ev_wz_c6_show').some(l=>l.text==='（她把手收到背後。）')&&!lines('ev_wz_c6_show').some(l=>/不是好看/.test(l.text)));
  /* WZ-C6 → 那週五的走廊小展 */
  fresh(key(TD('Y3S1',3,2)),21,'wz_print',{WZ_YT_PHOTO_DAY:TD('Y3S1',3,2)}); WZL.phone(H.G); const q=OUT.get(H.G,'wz_yt_show'); check('8. 那週五 17:00 的走廊小展',!!q&&q.day===TD('Y3S1',3,5)&&q.h===17); });

await sec(9,async()=>{ fresh(key(TD('Y4S1',4,3)),10,'linze'); GM.addNote('NOTE_COPY_FAIR','整本書能不能印',''); const it={c:{id:'ip_law'},week:4,exam:null};
  const f=CLS.IN_CLASS.find(x=>x.due&&x.due(H.G,it)); check('9. 智財第 4 週：回想（有 NOTE_COPY_FAIR）',!!f); H.said=[]; if(f) await f(GM,it);
  check('9. 「你想起影印店牆上那張紙。」＋準備 +1',said('你想起影印店牆上那張紙。')&&CLS.rec(H.G).prep.ip_law===1);
  check('9. 同一堂不再回想',!CLS.IN_CLASS.some(x=>x.due&&x.due(H.G,it)));
  fresh('2026-05-01',12,'dorm',{WZ_ITEM_TIMER:1,WZ_ITEM_NOTEBOOK:1,WZ_ITEM_TEA:1,WZ_CARD:true,WZ_YE_DONE:true,WZ_POSTER_ITEM:true}); const R=STORY.roomItemList(H.G).map(r=>r[0]+'｜'+r[1]);
  check('9. 房間物件六件（AA_420 第 9 節的「看」）',['蛋的計時器｜小米姐的計時器。三分四十秒那一格，有一道舊刮痕。','膠裝的空白筆記本｜書背很直。你一直沒有寫第一頁。','一小罐茶｜蘇姨給的。你泡得最好的那一種。','手寫的卡片｜林太太的字很工整。最後一行寫著：下週見。','讀書會白板的照片｜白板上的時間線。以安的字在中間，Alison 的字在旁邊吵架。','子晴成發的藍色海報｜子晴多印的那一張。藍色很亮。'].every(x=>R.includes(x)),J(R));
  H.G.flags.WZ_TEA_GIVEN='heroine_01'; check('9. 茶送人以後就沒有了',!STORY.roomItemList(H.G).some(r=>r[0]==='一小罐茶')); });

H.done();
})();

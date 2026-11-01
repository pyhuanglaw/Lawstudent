// CLUBFAIR-REAL-1027＋CLUBFAIR-HINT-1027（AA_485 第 3 節，企劃線 5aaa71d6a；使用者 2026-10-27「社團博覽會攤會也太少 都沒人顧 可以參加的社團到底是什麼 學姊有劇情卻沒在攤位」
//   「社團博覽會要參考實際的吧 而且遊戲中也沒提示」）——不需要瀏覽器。
//   0  資料：十五攤（五攤能加入＋十攤看看）、喊話四句、舞台三句、提示五則、錯過社博一句，句子逐字照 AA 的稿；index.html 載入 club_fair.js、clubfair3d.js（classes3d.js 後面）
//   1  日子：新局 2025-09-06（六）10:00～16:00 一天（舊局照舊 9/30、10/1）；大二 2026-09-12（六）10～16（ev_y2_club_expo、zones3d FAIR_DAYS）
//   2  攤位的互動點：社博那天、位置表上有座標的攤位（帳篷前面）；10:00 以前、16:00 以後藏起來；平常沒有
//   3  能加入的攤位：顧攤的學長／學姊兩句 → 填表＝加入（CLUB_<id>）；再來＝填過了；先不要＝沒加入
//   4  法服：第一次＝學姊那一段（ev_sis_club_expo）；演過以後＝顧攤的學長「隔週週六九點，萬才館一樓。第一次站旁邊聽就好。」
//   5  看看的十攤：每一攤演一次，之後再點只出招牌名
//   6  服務台的選單：十五攤＋逛完了；加入過的寫（已加入）；選了＝那一攤
//   7  喊話（攤位附近，大約每 18 秒一句、四句輪流）、舞台（10:30～15:30，照時間輪、每種一次；11:30 是熱舞社）
//   8  提示：9/1 08:00 行事曆、9/1～9/5 傅鐘旁的公告欄、9/4 21:00 系學會群組、9/5 21:00 家族群組 Kevin、9/6 起床提示框；舊局（社博不在週六）沒有
//   9  錯過社博：第一次去吉他、辯論、登山、系籃的社課，旁白多一句「（你在門口填了表。）」；萬才館公告欄最後一句
//  10  顧攤的人、人流（社博那天、攤位開著的時候）：LAWWW2 36 頂（1c537e9c9）每一頂一個人、低畫質背景攤一半；大二的社博也有人顧攤
//  （LAWWW-C 2026-10-27 套 LAWWW2 36 頂：位置表、顧攤的人、人流照新的帳篷改；第 0、2、7、10 項照新位置）
// 修改前（開發分支 592de7e18）：社博 9/30、10/1、只有五個社團的選單——FAIL。用法：node tests/clubfair_1027_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
let ok=true, err=''; try{ for(const f of ['src/data/club_fair_expo_layout.js','src/data/club_fair.js','src/clubfair3d.js']){ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (CLUB_FAIR_EXPO|CLUB_FAIR|CLUBFAIR)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); } }catch(e){ ok=false; err=String(e); }
const D=k=>STORY.dayOfKey(k);
const NEW={LAW_START_DAY:D('2025-08-29'),MAIN_D1:D('2025-09-04')};   /* 開學改 9/1 的新局 */
const at=(key,hh,fl,zone)=>{ const G=H.fresh(key,hh,zone||'campus',Object.assign({},NEW,fl||{})); return G; };
const A=()=>ACTIVITIES.list.find(a=>a.id==='club_expo_y1s1');
const caps=[]; GM.caption=(w,t)=>{ caps.push(t); }; const toasts=[]; GM.toast=t=>{ toasts.push(t); };
const fakeE=()=>({interactables:[],npcs:[],q:{level:'high'},player:{obj:{position:{x:0,y:0,z:0}},lv:0},addNPC(n){ this.npcs.push(n); return n; }});
const said=()=>H.said.map(s=>(s.who?s.who+'：':'')+s.t);

(async()=>{
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
check('0. club_fair.js、clubfair3d.js 載得到、index.html 在 classes3d.js 後面（接在 semff3d.js 後面：semff 要緊接 classes3d.js）',ok&&typeof CLUBFAIR!=='undefined'&&/classes3d\.js\?v=[^"]+"><\/script>\n<script src="src\/semff3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/club_fair\.js\?v=[^"]+"><\/script>\n<script src="src\/clubfair3d\.js/.test(html),err);
if(!ok||typeof CLUBFAIR==='undefined'){ H.done(); return; }
/* 0. 逐字對稿 */
{ const B=CLUB_FAIR.BOOTHS, by=id=>B.find(b=>b.id===id);
  check('0. 十五攤：能加入的五攤（法服、吉他、辯論、登山、系籃）＋看看的十攤',B.length===15&&B.filter(b=>b.club).map(b=>b.sign).join('、')==='法律服務社、吉他社、辯論社、登山社、法律系系學會（系籃）'&&B.filter(b=>!b.club).map(b=>b.sign).join('、')==='熱舞社、合唱團、攝影社、桌遊社、羽球社、服務隊、嘉義校友會、咖啡研究社、電影研究社、魔術社',B.map(b=>b.sign).join('、'));
  const SAY={guitar:['會不會彈都沒關係，我們從 C 和弦教起。','社課週一、週三晚上，B館。第五週開始。'],debate:['題目我們出，立場用抽的。抽到哪邊就幫哪邊講。','社課週二晚上，博思。第五週開始。'],
    hiking:['第一次出隊走郊山，鞋子好走就好。','行前會週四晚上，普通教室。第五週開始。'],basketball:['法律系的？系籃缺人。會不會打不重要，有來比較重要。','練球在映月湖旁邊的球場。']};
  check('0. 能加入的四攤：顧攤的人兩句逐字',Object.keys(SAY).every(k=>J(by(k).say)===J(SAY[k])));
  check('0. 法服演過以後：學長「隔週週六九點，B館一樓。第一次站旁邊聽就好。」',J(by('lawclub').after)===J(['隔週週六九點，B館一樓。第一次站旁邊聽就好。'])&&by('lawclub').event==='ev_sis_club_expo');
  const LOOK={dance:['十一點半我們上台，大道中間那個舞台。'],choir:['不用唱，哼一句就好。','（你哼了一句。她說：「音很準。」）'],photo:['我們每個月辦一次外拍。手機也可以，不一定要相機。'],boardgame:['規則五分鐘就會。來，坐。','（你玩了一輪，輸了。）'],
    badminton:['社課在新體育館。拍子我們可以借。'],service:['寒暑假出隊，國內國外都有。說明會之後會貼公告。'],alumni:['你哪裡人？……臺北？那你不是我們的。','（他還是塞了一張傳單給你。）'],coffee:['今天手沖免費試喝，一人一杯。','（很苦。旁邊的學長說，苦就對了。）'],
    film:['每週放一部老片，放完一起聊。'],magic:['抽一張，不要給我看。','……梅花七。','（你手上的是紅心三。他把牌收回去，說再一次。）']};
  check('0. 看看的十攤逐字',Object.keys(LOOK).every(k=>J(by(k).look.map(x=>x[1]))===J(LOOK[k])),J(B.filter(b=>b.look).map(b=>b.look.map(x=>x[1]))));
  check('0. 顧攤的人沒有名字：學長或學姊；合唱團是學姊（「她說」）、校友會、魔術社是學長（「他」）、系籃學長（「找學長聊聊」）',B.every(b=>b.who==='學長'||b.who==='學姊')&&by('choir').who==='學姊'&&by('alumni').who==='學長'&&by('magic').who==='學長'&&by('basketball').who==='學長');
  check('0. 喊話四句',J(CLUB_FAIR.SHOUTS)===J(['「學弟妹看一下！」','「填表送糖果！」','「新生來拿傳單！」','「第一次社課不用錢！」']));
  check('0. 舞台三句',J(Object.values(CLUB_FAIR.STAGE_LINES).sort())===J(['（台上一個人彈吉他、一個人唱。唱到副歌，台下有人跟著哼。）','（台上是熱舞社。音樂很大聲，前排的新生拍手拍得很整齊。）','（台上是直笛團。十幾支直笛，吹的是一首卡通的主題曲。）'].sort()));
  check('0. 提示五則',J(CLUB_FAIR.HINTS)===J({cal:'9/6（六）10:00～16:00　社團博覽會（椰影大道）',board:'【社團博覽會】9/6（六）10:00～16:00，椰影大道。一百多個社團擺攤，中午有舞台表演。',dept:'禮拜六社博！系籃的攤位在晨思鐘旁邊，大一的來找學長聊聊～',kevin:'明天社博！書瑀學姊在法服顧攤，大一的去打個招呼～',wake:'今天椰影大道有社團博覽會（10:00～16:00）。'}));
  check('0. 錯過社博：「（你在門口填了表。）」',CLUB_FAIR.DOOR_LINE==='（你在門口填了表。）');
  const FR=id=>{ const t=CLUB_FAIR_EXPO.tents.find(q=>q.id===(id==='choir'?'chorus':id)); return t?[+(t.x+Math.sin(t.ry)*CLUB_FAIR_EXPO.tent.front).toFixed(2),+(t.z+Math.cos(t.ry)*CLUB_FAIR_EXPO.tent.front).toFixed(2)]:null; };   /* LAWWW2 36 頂的 front（zones3d.js fairExpoFront 同一個算法；choir＝表上的 chorus）*/
  const badP=B.filter(b=>{ const p=CLUB_FAIR.POS[b.id], f=FR(b.id); return !p||!f||Math.abs(p.x-f[0])>0.01||Math.abs(p.z-f[1])>0.01; }).map(b=>b.id);
  check('0. 位置表：十五攤都有座標＝LAWWW2 36 頂那一攤的 front（帳篷前面；CLUBFAIR-REAL-1027 1c537e9c9）',!badP.length,J(badP)); }

/* 1. 日子 */
{ const G=at('2025-09-06',12); check('1. 新局：9/6（六）有社博、10:00～16:00',ACTIVITIES.on(A(),G.day,G)&&A().t0===10&&A().t1===16&&CALENDAR.dateOf(G.day).wd===6);
  check('1. 新局：9/30、10/1 沒有',!ACTIVITIES.on(A(),D('2025-09-30'),G)&&!ACTIVITIES.on(A(),D('2025-10-01'),G));
  const O=H.fresh('2025-09-30',12,'campus',{}); check('1. 舊局（9/17 開始）：照舊 9/30、10/1',ACTIVITIES.on(A(),D('2025-09-30'),O)&&ACTIVITIES.on(A(),D('2025-10-01'),O)&&!ACTIVITIES.on(A(),D('2025-09-06'),O));
  const e2=STORY_EVENTS.find(e=>e.id==='ev_y2_club_expo'); check('1. 大二：ev_y2_club_expo 2026-09-12（六）10～16',J(e2.time)===J([10,16])&&e2.prereq.custom({day:D('2026-09-12')})&&!e2.prereq.custom({day:D('2026-09-16')})&&CALENDAR.dateOf(D('2026-09-12')).wd===6&&CALENDAR.termOf(D('2026-09-12')).id==='Y2S1');
  const zs=fs.readFileSync(path.join(H.ROOT,'src/zones3d.js'),'utf8'); check('1. 校園的帳篷：大二 9/12（不是 9/16、9/17）；大一照 ACTIVITIES.on',/FAIR_DAYS=\[[^\]]*'2026-09-12'/.test(zs)&&!/FAIR_DAYS=\[[^\]]*'2026-09-16'/.test(zs)&&/ACTIVITIES\.on\(A,G\.day,G\)/.test(zs)); }

/* 2. 互動點 */
{ const G=at('2025-09-06',9.5), E=fakeE(); GM.E0=GM.E; const P={E,G}; CLUBFAIR.populate('campus',P);
  const its=E.interactables.filter(i=>i.fairBooth); check('2. 社博那天：十五攤各一個互動點（招牌名）',J(its.map(i=>i.label))===J(CLUB_FAIR.BOOTHS.map(b=>b.sign)),J(its.map(i=>i.label)));
  check('2. 09:30：藏起來（10:00 開始）',its.every(i=>i.hidden)); G.hour=12; check('2. 12:00：看得到',its.every(i=>!i.hidden)); G.hour=16; check('2. 16:00：收了',its.every(i=>i.hidden));
  const L=CLUB_FAIR.POS.lawclub; check('2. 法服的互動點在法服帳篷前面（晨思鐘西邊 (-47.5, 11.5)）',Math.abs(L.x+47.5)<0.01&&Math.abs(L.z-11.5)<0.01);
  const G2=at('2025-09-08',12), E2=fakeE(); CLUBFAIR.populate('campus',{E:E2,G:G2}); check('2. 平常（9/8）：沒有攤位',!E2.interactables.some(i=>i.fairBooth));
  const s3=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'); check('2. story3d.js 不再自己放「法服的攤位」（一起由 clubfair3d.js 放）',!/label:'法服的攤位'/.test(s3)); }

/* 3. 能加入的攤位 */
{ at('2025-09-06',11); H.picks=['填表']; const n=await CLUBFAIR.booth(GM,'guitar'); const L=said();
  check('3. 吉他社：顧攤的學長兩句 → 填表 → 加入（CLUB_club_guitar）',n===1&&H.G.flags.CLUB_club_guitar===true&&J(L)===J(['顧攤的學長：會不會彈都沒關係，我們從 C 和弦教起。','顧攤的學長：社課週一、週三晚上，B館。第五週開始。','你在「吉他社」的攤位填了表。']),J(L));
  check('3. 選項：填表／先不要',J(H.opts[0])===J(['填表','先不要']),J(H.opts));
  check('3. 在攤位填表＝記 FAIR_JOIN（大二社博的開場句照原本那句；AA_491 B）',H.G.flags.FAIR_JOIN===true);
  check('3. 社博說明沒有「＝」（AA_491 第 2 點）',A().desc==='一百多個社團擺攤，中午有舞台表演。能加入的有五個：法服、吉他社、辯論社、登山社、系籃。走到攤位前面就能填表。',A().desc);
  check('3. 走到攤位＝去過博覽會（出席紀錄）',ACTIVITIES.attendedAny(H.G,'club_expo_y1s1',H.G.day));
  H.said=[]; const n2=await CLUBFAIR.booth(GM,'guitar'); check('3. 再來：「「吉他社」的表你已經填過了。」',n2===0&&J(said())===J(['「吉他社」的表你已經填過了。']),J(said()));
  H.said=[]; H.picks=['先不要']; await CLUBFAIR.booth(GM,'debate'); check('3. 辯論社（顧攤的學姊）選先不要：沒加入',!H.G.flags.CLUB_club_debate&&said()[0]==='顧攤的學姊：題目我們出，立場用抽的。抽到哪邊就幫哪邊講。',J(said()));
  H.said=[]; H.picks=['填表']; await CLUBFAIR.booth(GM,'basketball'); check('3. 系籃：加入（CLUB_dept_basketball）',H.G.flags.CLUB_dept_basketball===true&&said()[0]==='顧攤的學長：法律系的？系籃缺人。會不會打不重要，有來比較重要。',J(said()));
  at('2025-09-06',16.5); caps.length=0; const n3=await CLUBFAIR.booth(GM,'hiking'); check('3. 16:30 收攤：只出招牌名、不能填表',n3===0&&!H.said.length&&caps[0]==='登山社'&&!H.G.flags.CLUB_club_hiking,J(caps)); }

/* 4. 法服 */
{ at('2025-09-06',11,{SIS_W1:true,met_sis:true}); const n=await CLUBFAIR.booth(GM,'lawclub');
  check('4. 第一次：學姊那一段（照現在：記 SIS_CLUB_EXPO、lawclub、CLUB_lawclub_study）',n===1&&H.G.flags.SIS_CLUB_EXPO===true&&H.G.flags.lawclub===true&&H.has('（椰影大道上一整排帳篷。你走到法服的攤位前。）'),J(said()));
  H.said=[]; await CLUBFAIR.booth(GM,'lawclub'); check('4. 演過以後：顧攤的學長「隔週週六九點，B館一樓。第一次站旁邊聽就好。」',J(said())===J(['顧攤的學長：隔週週六九點，B館一樓。第一次站旁邊聽就好。']),J(said())); }

/* 5. 看看的攤位 */
{ at('2025-09-06',11); await CLUBFAIR.booth(GM,'magic'); check('5. 魔術社第一次：三句（兩句學長、一句旁白）',J(said())===J(['顧攤的學長：抽一張，不要給我看。','顧攤的學長：……梅花七。','（你手上的是紅心三。他把牌收回去，說再一次。）']),J(said()));
  H.said=[]; caps.length=0; await CLUBFAIR.booth(GM,'magic'); check('5. 第二次：只出招牌名',!H.said.length&&caps[0]==='魔術社',J(caps));
  H.said=[]; await CLUBFAIR.booth(GM,'choir'); check('5. 合唱團（顧攤的學姊）',J(said())===J(['顧攤的學姊：不用唱，哼一句就好。','（你哼了一句。她說：「音很準。」）']),J(said()));
  check('5. 看過的記在 FAIR_LOOK（存檔）',H.G.flags.FAIR_LOOK.magic===H.G.day&&H.G.flags.FAIR_LOOK.choir===H.G.day); }

/* 6. 服務台的選單 */
{ at('2025-09-06',11,{CLUB_club_hiking:true}); H.picks=['熱舞社']; await CLS.fairMenu(GM,A()); const o=H.opts[0]||[];
  check('6. 服務台：十五攤＋逛完了；登山社寫（已加入）',o.length===16&&o[15]==='逛完了'&&o.includes('登山社（已加入）')&&o.includes('魔術社')&&o[0]==='法律服務社',J(o));
  check('6. 選熱舞社＝那一攤（顧攤的學姊）',said().includes('顧攤的學姊：十一點半我們上台，大道中間那個舞台。'),J(said()));
  at('2025-09-06',9.5); caps.length=0; await CLS.fairMenu(GM,A()); check('6. 09:30：「今天 10:00 開始。」',/今天 10:00 開始/.test(caps[0]||''),J(caps));
  at('2025-09-06',16.2); caps.length=0; await CLS.fairMenu(GM,A()); check('6. 16:12：「今天的攤位收了。」',/攤位收了/.test(caps[0]||''),J(caps)); }

/* 7. 喊話、舞台 */
{ const G=at('2025-09-06',11.2), E=fakeE(); const gm={G,E,caption:(w,t)=>caps.push(t)}; caps.length=0; E.player.obj.position.x=-84.4; E.player.obj.position.z=-1.6;   /* 吉他社帳篷前面 */
  for(let i=0;i<36*4;i++) CLUBFAIR.tick(gm); check('7. 攤位附近：大約每 18 秒（36 次）一句，四句輪流',J(caps)===J(CLUB_FAIR.SHOUTS),J(caps));
  caps.length=0; E.player.obj.position.x=60; for(let i=0;i<80;i++) CLUBFAIR.tick(gm); check('7. 離開攤位：不喊',!caps.length);
  const st=CLUB_FAIR.STAGE; E.player.obj.position.x=st.x; E.player.obj.position.z=st.z; G.hour=11.6; CLUBFAIR.tick(gm); check('7. 11:36 走到舞台前面：熱舞社那一句',caps[0]===CLUB_FAIR.STAGE_LINES.dance,J(caps));
  CLUBFAIR.tick(gm); check('7. 同一種表演只一次',caps.length===1); G.hour=12.1; CLUBFAIR.tick(gm); check('7. 12:06：吉他',caps[1]===CLUB_FAIR.STAGE_LINES.guitar,J(caps));
  G.hour=10.6; CLUBFAIR.tick(gm); check('7. 10:36：吉他已經看過＝不再出',caps.length===2); G.hour=11.1; CLUBFAIR.tick(gm); check('7. 11:06：直笛團',caps[2]===CLUB_FAIR.STAGE_LINES.recorder,J(caps));
  G.hour=15.6; G.flags.FAIR_STAGE=[]; CLUBFAIR.tick(gm); check('7. 15:36（15:30 以後）：台上沒有表演',caps.length===3); }

/* 8. 提示 */
{ const G=at('2025-09-01',7); PHONE.join(G,'law_class','法律系（全班）'); PHONE.join(G,'family_law','直屬家族'); G.flags.FAM_GROUP_SENT=true;
  const run=(day,hh)=>{ G.day=day; G.hour=hh; CLUBFAIR.phone(G); PHONE.tick(G); };
  run(D('2025-09-01'),7.9); check('8. 9/1 07:54：還沒有',!H.G.msgs.some(m=>m.tag==='fair_y1_cal'));
  run(D('2025-09-01'),8.05); const c=H.G.msgs.find(m=>m.tag==='fair_y1_cal'); check('8. 9/1 08:00 手機（行事曆）：「9/6（六）10:00～16:00　社團博覽會（椰影大道）」',!!c&&c.th==='sys'&&c.name==='行事曆'&&c.text==='9/6（六）10:00～16:00　社團博覽會（椰影大道）',J(c));
  run(D('2025-09-04'),21.05); const g=H.G.msgs.find(m=>m.tag==='fair_y1_dept'); check('8. 9/4 21:00 系學會群組',!!g&&g.th==='g:law_class'&&g.name==='系學會'&&g.text==='禮拜六社博！系籃的攤位在晨思鐘旁邊，大一的來找學長聊聊～',J(g));
  run(D('2025-09-05'),21.05); const k=H.G.msgs.find(m=>m.tag==='fair_y1_kevin'); check('8. 9/5 21:00 家族群組 Kevin',!!k&&k.th==='g:family_law'&&k.from==='kevin'&&k.text==='明天社博！書瑀學姊在法服顧攤，大一的去打個招呼～',J(k));
  const G2=at('2025-09-03',22); PHONE.join(G2,'law_class','法律系（全班）'); CLUBFAIR.phone(G2); G2.day=D('2025-09-05'); G2.hour=22; PHONE.tick(G2); check('8. 沒有家族群組的局：沒有 Kevin 那則；系學會照樣',!G2.msgs.some(m=>m.tag==='fair_y1_kevin')&&G2.msgs.some(m=>m.tag==='fair_y1_dept'));
  const O=H.fresh('2025-09-22',10,'campus',{}); PHONE.join(O,'law_class','法律系（全班）'); CLUBFAIR.phone(O); O.day=D('2025-09-29'); O.hour=22; PHONE.tick(O); check('8. 舊局（社博 9/30 週二）：沒有提示',!O.msgs.some(m=>/^fair_y1_/.test(m.tag||'')));
  for(const [key,want] of [['2025-08-31',false],['2025-09-01',true],['2025-09-05',true],['2025-09-06',false],['2025-09-08',false]]){ const g3=at(key,12), E=fakeE(); CLUBFAIR.populate('campus',{E,G:g3}); const b=E.interactables.find(i=>i.fairBoard);
    check('8. 晨思鐘旁的公告欄 '+key+'：'+(want?'有「【社團博覽會】……」':'沒有'),want?(!!b&&b.label==='公告欄'&&b.look===CLUB_FAIR.HINTS.board):!b); }
  at('2025-09-06',7.5); toasts.length=0; check('8. 9/6 起床：提示框',CLUBFAIR.wake(GM)&&toasts[0]==='今天椰影大道有社團博覽會（10:00～16:00）。',J(toasts)); check('8. 同一天不再提示',!CLUBFAIR.wake(GM));
  at('2025-09-07',7.5); check('8. 9/7：沒有',!CLUBFAIR.wake(GM)); check('8. 包住 CLS.morning',!!CLS.morning._fair); }

/* 9. 錯過社博 */
{ const G=at('2025-10-06',18.9,{},'wancai'); const g=ACTIVITIES.list.find(a=>a.id==='club_guitar'); SOCIAL.remember('heroine_04','FIRST_MET',''); G.events.done.ev_ziqing_club=1;
  check('9. 錯過社博、第一次去吉他社：要說',CLUBFAIR.doorLine(G,g));
  await CLS.attendActivity(GM,g,{door:true}); check('9. 旁白多一句「（你在門口填了表。）」（第一句）、記 CLUB_club_guitar',H.said[0]&&H.said[0].t==='（你在門口填了表。）'&&G.flags.CLUB_club_guitar===true,J(H.said.slice(0,2)));
  check('9. 加入過的：不說',!CLUBFAIR.doorLine(G,g));
  check('9. 在社課門口填表＝記 CLUB_DOOR（大二社博的開場句用；AA_491 B）',G.flags.CLUB_DOOR===true&&!G.flags.FAIR_JOIN);
  const bk=ACTIVITIES.list.find(a=>a.id==='dept_basketball'); check('9. 系籃練球在室外球場：旁白是「（你在場邊填了表。）」（AA_491 C）',!!bk&&(CLUB_FAIR.DOOR_LINE_BY||{}).dept_basketball==='（你在場邊填了表。）'&&/\(D\(\)\.DOOR_LINE_BY\|\|\{\}\)\[a\.id\]\|\|D\(\)\.DOOR_LINE/.test(fs.readFileSync(path.join(H.ROOT,'src/clubfair3d.js'),'utf8')));
  { const ev=fs.readFileSync(path.join(H.ROOT,'src/data/events.js'),'utf8'); check('9. 大二社博開場：在社課門口填表、沒在社博填表的玩家換「去年，你是在社課的門口填的表。」（AA_491 B）',/unless:\{custom:G=>!!G\.flags\.CLUB_DOOR&&!G\.flags\.FAIR_JOIN\},speaker:null,text:'去年，你站在這一排攤位前面填表。'\}/.test(ev)&&/if:\{custom:G=>!!G\.flags\.CLUB_DOOR&&!G\.flags\.FAIR_JOIN\},speaker:null,text:'去年，你是在社課的門口填的表。'\}/.test(ev)); }
  const pl=ACTIVITIES.list.find(a=>a.id==='public_law_group'); check('9. 公法讀書會（不是社博的社團）：不說',!CLUBFAIR.doorLine(G,pl));
  const s3=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'); check('9. 萬才館公告欄（notice lawclub）最後一句：「報名請到社團博覽會的攤位，或週六上午到萬才館一樓找值班的學長姊。」',s3.includes('新社員先跟著旁聽、做紀錄。報名請到社團博覽會的攤位，或週六上午到法律系館B一樓找值班的學長姊。\'')); }

/* 10. 顧攤的人、人流 */
{ const built=[]; const C0=global.CHAR; global.CHAR={setExpr(){},build:spec=>{ built.push(spec); return {position:{x:NaN,y:NaN,z:NaN,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0}}; }};   /* 位置要記下來（第 10 項看顧攤的人站在哪）*/ const spawned=[];
  const G=at('2025-09-06',11), E=fakeE(); const gm={E,G,spawnExtra:(spec,route)=>{ spawned.push(route); return {}; }}; CLUBFAIR.populate('campus',gm);
  const st=E.npcs.filter(n=>n.fairStaff), T=CLUB_FAIR_EXPO.tents;
  check('10. 顧攤的人：36 頂每一頂一個（高畫質）＋停在攤位前的人三個',st.length===36&&E.npcs.filter(n=>n.fairCrowd).length===3,J([st.length,E.npcs.filter(n=>n.fairCrowd).length]));
  const off=st.filter(n=>{ const t=T.find(q=>q.id===n.fairStaff), p=n.obj.position; return !t||!(Math.abs(p.x-t.x)<=1.4&&Math.abs(p.z-t.z)<=1.4&&Math.abs(n.obj.rotation.y-t.ry)<1e-6); }).map(n=>n.fairStaff);
  check('10. 顧攤的人在自己的帳篷裡（3×3 m）、面向帳篷正面',!off.length,J(off));
  const fill=E.npcs.filter(n=>n.fairCrowd&&n.frozen); check('10. 停在攤位前的人：離互動點至少 0.9 m（不擋）、面向帳篷（北側轉 π、南側 0）',fill.length===3&&fill.every(n=>{ const p=n.obj.position; return Object.values(CLUB_FAIR.POS).every(q=>Math.hypot(q.x-p.x,q.z-p.z)>=0.9)&&Math.abs(n.obj.rotation.y-(p.z<0?Math.PI:0))<1e-6; }));
  check('10. 拿傳單的新生走大道中間（帳篷前緣 z ±3.4 以內）',spawned.length>=2&&spawned.every(r=>r.every(p=>Math.abs(p[1])<3.0)),J(spawned.slice(0,2)));
  { const E3=fakeE(); E3.q={level:'low'}; CLUBFAIR.populate('campus',{E:E3,G,spawnExtra:()=>({})}); const s3=E3.npcs.filter(n=>n.fairStaff); check('10. 低畫質：互動的十五攤＋服務台一定有人、背景攤一半',s3.length===26&&T.filter(t=>t.kind!=='bg').every(t=>s3.some(n=>n.fairStaff===t.id)),J(s3.length)); }
  { const z0=globalThis.Z3; globalThis.Z3={isExpoDay:()=>true}; const G4=at('2026-09-12',11), E4=fakeE(); CLUBFAIR.populate('campus',{E:E4,G:G4,spawnExtra:()=>({})}); globalThis.Z3=z0;
    check('10. 大二的社博（2026-09-12）：一樣有人顧攤，攤位不能互動',E4.npcs.filter(n=>n.fairStaff).length===36&&!E4.interactables.some(i=>i.fairBooth)); }
  check('10. 走路的新生八個（畫質高）',spawned.length===8);
  const G2=at('2025-09-06',17), E2=fakeE(); CLUBFAIR.populate('campus',{E:E2,G:G2,spawnExtra:()=>({})}); check('10. 收攤以後進校園：沒有顧攤的人',!E2.npcs.length);
  global.CHAR=C0; }
H.done();
})();

// AA-B 2026-10-30 04:55 回覆的四個小修改（任務 AA-FOLLOWUP-1030；D109）——不需要瀏覽器。
//   A  AA_529 第⑤點：10/15 聚會（ev_y0_gather）的結尾——地點字幕「在公館的路口散了。」先，旁白「（回家的路上，手機震了一下。）」後（先散了，才在回家的路上）；
//      旁白只在這一次建了「走啦」才出（已經在群組裡＝不出、字幕照出）；群組四則的時間照舊 22:20
//   B  AA_529 第⑦點：經濟系社團群組三則（S.Y0_CLUB_MSG，9/27、10/18、12/6 21:00，不用回）＝quiet：收進手機、有紅點，30 分鐘版的快轉不停在這裡
//      （ECONFF.jumpTo、HOME.y0Jump、HOME.recvN）；別的訊息（要回的、可昕的）照停
//   C  AA_527 第 2 點：麵店長桌阿哲「阿姨的手包起來了。……」（h504_zhe_hand）——語彤在 4 m 內＝順延到下一個麵店日，大一下學期內有效，過了學期不再演；只演一次、pri
//   D  AA_528 第 9 點：佳蓉在萬才館（法律系館B）法服值班認識＝專用版本 meetB（五行照 AA 回覆一字不差；社博那個入口照舊 meet）；
//      在萬才館認識的，畢業私訊第一則換「（照片：值班桌旁邊那根柱子，底下一個插座）」，第二則照舊；talk「法服的攤位每年都擺在同一個位置。……」照留
//   D0 佳蓉 meetB 五行、畢業照片句、SK02 系辦兩句都在 AA_538（企劃線 04ebaa37e；AA-B 05:26 把實作問答的句子寫進稿）
// 修改前（基準 postrel-1030＝3679551fc；archive 出 src、lib、index.html、tests，把這支測試放進去跑）：FAILED 15（A 2、B 7、C 2、D 4；其餘 11 項是對照組，本來就 PASS）。修改後 ALL PASS（26 項）。
// 全部 Node 單元測試（tests/*_unit.js，2026-10-30）：743 支、結束碼不是 0 的 0 支。改了期待值的舊測試：aa499_501_pool_unit（第 0 節例外 AA528_9、第 6 節 meetB）、
//   aa527_528_unit（528-1-2 meetB）、aa503_others_unit（第 3 節第 10 週：演過＝不演、沒演到＝順延）、v0_gather_unit、aa529_econ_unit（第 2 節加查字幕先後）
// 用法：node tests/aa_followup_1030_unit.js
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa527_528_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,120)); } } }
GM.toast=()=>{}; GM.studySession=async()=>{}; GM.spawnCharacter=()=>null; GM.quickGo=async()=>{};
let badge=0; GM.phoneBadge=()=>{ badge++; };
const caps=[]; GM.caption=(a,b)=>{ caps.push([b,H.said.length]); };   /* [地點字幕, 出字幕那時候已經說了幾句] */
const phoneOpened=[]; GM.phoneThread=async(th)=>{ phoneOpened.push(th); };
const D=k=>typeof k==='number'?k:STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>((CALENDAR.dateOf(d).wd%7)+7)%7, TD=(t,w,wd)=>STORY.termDay(t,w,wd), T=(d,h)=>d*24+h;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const setAt=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); E.hour=h; };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const thr=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const npcAt=(id,x,z,o)=>{ const n=Object.assign({obj:{position:{x,y:0,z},rotation:{y:0}},lv:0,name:id},o||{}); GM.npc[id]=n; return n; };
const fam=id=>H.rel(id,25,0,0), contact=id=>INV.addContact(H.G,id);
/* 法律系（同 tests/aa527_528_unit.js）*/
const BASE={introDone:true,afternoonDone:true,classDone:true,metAn:true,met_an:true,MET_ZHE:true,ROOM_Y2:true,ROOM_Y3:true};
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign({},BASE,flags||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G);
  E.player.busy=false; E.player.lv=0; E.player.seat=null; E.player.obj.position.x=0; E.player.obj.position.z=0; E.npcs.length=0; GM.npc={}; GM.spawnNPC=()=>null; ADV.active=false; caps.length=0;
  if(typeof SUP497!=='undefined'&&SUP497.bind) SUP497.bind(GM); if(STORY._bindGM) STORY._bindGM(GM); if(typeof HEARD!=='undefined'&&HEARD.bind) HEARD.bind(GM); if(typeof HCIRCLE!=='undefined'&&HCIRCLE.bind) HCIRCLE.bind(GM); if(typeof POOL!=='undefined'&&POOL.bind) POOL.bind(GM); return G; };
/* 經濟系那一年（30 分鐘版：ECONFF.short；同 tests/aa529_econ_unit.js）*/
const econ=(key,h,flags,o)=>{ o=o||{}; const G=H.fresh(key,h,o.zone||'dorm',Object.assign({E01_MORNING:true,LEAVE_WEEK:6,dating_kexin:true,KX_FIRST_MSG:false,PLAYED_Y0:true},flags||{}));
  G.stage='econ'; G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G); G.events.done.ev_y0_e02=1;
  E.player.busy=false; E.paused=false; E.player.lv=0; E.player.seat=null; E.player.path=null; E.npcs.length=0; GM.npc={}; ADV.active=false; STORY._bindGM(GM); setAt(G.day,h); phoneOpened.length=0; caps.length=0; badge=0; return G; };
const home=G=>{ G.flags.Y0_MOVED_OUT=true; const R=HOME.rec(G); R.at=true; R.base=true; R.day=G.day; G.zone='home'; return G; };
const NARR='（回家的路上，手機震了一下。）', SAN='在公館的路口散了。';

(async()=>{
  check('0. src/ 都載得到',!loadErr.length,J(loadErr));

  /* ---------- A：AA_529 第⑤點 ---------- */
  await sec('A',async()=>{ const d15=D('2024-10-15'), ev=STORY_EVENTS.find(e=>e.id==='ev_y0_gather');
    check('A. 事件裡不再有那句旁白（改到回程字幕之後：afterBack）',!!ev&&!ev.dialogue.some(l=>l&&l.text===NARR)&&typeof ev.afterBack==='function');
    const G=econ('2024-10-15',17,{},{zone:'campus'}); setAt(d15,17.6); ph(); const q=OUT.get(G,'y0_gather');
    H.said=[]; caps.length=0; H.picks=['假裝沒看到']; setAt(d15,18.75); await OUT.go(GM,q); const L=H.said.map(s=>s.t);
    const ci=caps.findIndex(c=>c[0]===SAN), ni=L.indexOf(NARR);
    check('A. 地點字幕「在公館的路口散了。」先、「（回家的路上，手機震了一下。）」後（字幕出來的時候旁白還沒說；旁白緊接在字幕後面、是最後一句）',ci>=0&&ni>=0&&caps[ci][1]===ni&&ni===L.length-1&&L.filter(t=>t===NARR).length===1&&L[ni-1]==='（她走進女舍以前，回頭揮了一下手。）',J({caps,tail:L.slice(-3)}));
    PHONE.tick(G); const M=thr('g:econ_friends');
    check('A. 「走啦」系統一則＋三則的時間照舊（10/15 22:20）',M.length===4&&M.every(m=>m.day===d15&&Math.abs(m.h-(22+1/3))<0.02)&&Math.abs(G.hour-(22+1/3))<0.02,J(M.map(m=>[m.day===d15,m.h])));
    /* 已經在群組裡（長版 P2 去成）：不出旁白、字幕照出 */
    const G3=econ('2024-10-15',17,{P2_PICK:'river'},{zone:'campus'}); ph(); setAt(d15,17.6); ph(); const q3=OUT.get(G3,'y0_gather'); H.said=[]; caps.length=0; H.picks=['假裝沒看到']; setAt(d15,18.75); await OUT.go(GM,q3);
    check('A. 已經在「走啦」裡（長版）：不出「回家的路上」，字幕「在公館的路口散了。」照出',PHONE.inGroup(G3,'econ_friends')&&!H.said.some(s=>s.t===NARR)&&caps.some(c=>c[0]===SAN),J(caps)); });

  /* ---------- B：AA_529 第⑦點 ---------- */
  await sec('B',async()=>{ const d927=D('2024-09-27'), d1018=D('2024-10-18'), d1206=D('2024-12-06');
    check('B. HOME.recvN／PHONE.loud：quiet 的不算會停的；別人傳的照算',HOME.recvN([{from:'x',quiet:true}])===0&&HOME.recvN([{from:'x'}])===1&&!!PHONE.loud&&PHONE.loud([{quiet:true},{}]).length===1);
    /* 9/27（宿舍、30 分鐘版的跳）*/
    const G=econ('2024-09-27',18,{Y0_CLUB:'guitar'}); ph(); badge=0;
    const qd=PHONE.rec(G).q.filter(x=>/^y0_guitar_[123]$/.test(x.tag||''));
    check('B. 三則排進手機都標 quiet（不用回）',qd.length===3&&qd.every(x=>x.items.every(it=>it.quiet===true&&!it.ask)),J(qd.map(x=>[x.tag,x.items.map(it=>it.quiet)])));
    const r=ECONFF.jumpTo(GM,d927+1,9); const m=thr('g:y0_guitar');
    check('B. ECONFF.jumpTo 跨過 9/27 21:00 那一則：不停（跳到 9/28 09:00），訊息收進手機（quiet、有紅點：PHONE.unread＞0、跳完 GM.phoneBadge）',r==='ok'&&G.day===d927+1&&Math.abs(G.hour-9)<0.01&&m.length===1&&m[0].quiet===true&&PHONE.unread(G)>0&&badge>0,J({r,day:keyOf(G.day),h:G.hour,m:m.map(x=>[x.text,x.quiet]),unread:PHONE.unread(G),badge}));
    /* 對照：別的訊息照停（可昕的私訊） */
    const G2=econ('2024-09-27',18,{Y0_CLUB:'guitar'}); ph(); PHONE.at(G2,d927,22,[{th:'p:kexin',from:'kexin',text:'測試：你睡了嗎'}],'t_kx_loud');
    const r2=ECONFF.jumpTo(GM,d927+1,9);
    check('B. 對照：同一段時間裡可昕的私訊照停（停在 22:00，打開的是可昕那一段）',r2==='msg'&&G2.day===d927&&Math.abs(G2.hour-22)<0.01&&ECONFF.newestTh(G2)==='p:kexin',J({r2,day:keyOf(G2.day),h:G2.hour,th:ECONFF.newestTh(G2)}));
    /* 10/18、12/6（休學在家：HOME.y0Jump）*/
    const yj=async(d,h0,h1)=>{ const G4=econ(keyOf(d),h0,{Y0_CLUB:'hiking',Y0_LEAVE:true}); home(G4); ph(); badge=0; const why=await HOME.y0Jump(GM,T(d,h1)); return {G4,why}; };
    const a=await yj(d1018,20.5,21.75), ma=thr('g:y0_hiking');
    check('B. 休學在家的快轉（HOME.y0Jump）跨過 10/18 21:00 登山社那則：不停（跑到 21:45），收進手機、有紅點',a.why!=='msg'&&Math.abs(a.G4.hour-21.75)<0.01&&ma.length===2&&ma.every(x=>x.quiet===true)&&badge>0,J({why:a.why,h:a.G4.hour,m:ma.map(x=>x.text),badge}));
    const b=await yj(d1206,20.5,21.75), mb=thr('g:y0_hiking');
    check('B. 12/6 21:00 那則也一樣不停',b.why!=='msg'&&Math.abs(b.G4.hour-21.75)<0.01&&mb.length===1&&mb[0].quiet===true,J({why:b.why,h:b.G4.hour,m:mb.map(x=>x.text)}));
    /* 舊存檔：已經排進佇列、沒有 quiet 的，規則跑一次就補上 */
    const G5=econ('2024-09-27',18,{Y0_CLUB:'badminton'}); PHONE.join(G5,'y0_badminton','羽球社'); PHONE.rec(G5).q.push({day:d927,h:21,items:[{th:'g:y0_badminton',from:'npc_y0_badminton_pres',name:'羽球社社長',text:'週二、週四晚上七點，新體育館'}],tag:'y0_badminton_1'}); ph();
    check('B. 舊存檔：已經排進佇列、沒有 quiet 的那一則，規則跑一次補成 quiet',PHONE.rec(G5).q.find(x=>x.tag==='y0_badminton_1').items.every(it=>it.quiet===true)); });

  /* ---------- C：AA_527 第 2 點 ---------- */
  await sec('C',async()=>{ const HAND='阿姨的手包起來了。語彤一個人顧店。我去幫忙收碗，她說你坐著。';
    const setup=(d)=>{ fresh(d,18,'noodle'); fam('zhe'); fam('heroine_03'); fam('yu'); fam('classmate_bohan'); fam('classmate_xinci'); PHONE.join(H.G,'noodle_team','麵店團'); H.G.flags.ndlTalkN={Y1:3}; return H.G; };
    const pick=()=>{ const p=STORY.ndlTalkPick(H.G); return p&&p.e.once||(p?'#'+p.i:null); };
    const w9t=TD('Y1S2',9,2), w9r=TD('Y1S2',9,4);
    setup(w9t); npcAt('heroine_03',1,1); const p1=pick();
    check('C. 第 9 週的麵店日（週二），語彤在 4 m 內：不演那一則（換別則）',p1!=='h504_zhe_hand',J(p1));
    H.said=[]; await STORY.ndlTalk(GM); const O1=H.G.flags.ndlTalkOnce||{};
    const keep=JSON.parse(JSON.stringify(H.G.flags.ndlTalkOnce||{}));
    setup(w9r); H.G.flags.ndlTalkOnce=JSON.parse(JSON.stringify(keep)); const p2=pick(); H.said=[]; await STORY.ndlTalk(GM);
    check('C. 下一個麵店日（第 9 週週四）她不在 4 m 內：演「阿姨的手包起來了。……」、只演一次（記 ndlTalkOnce）',O1.h504_zhe_hand==null&&p2==='h504_zhe_hand'&&H.said.some(s=>s.t===HAND)&&H.G.flags.ndlTalkOnce.h504_zhe_hand===w9r,J({p2,said:H.said.map(s=>s.t),once:H.G.flags.ndlTalkOnce}));
    const done=JSON.parse(JSON.stringify(H.G.flags.ndlTalkOnce)); setup(TD('Y1S2',10,2)); H.G.flags.ndlTalkOnce=done; const p3=pick();
    check('C. 演過了：之後不再演',p3!=='h504_zhe_hand',J(p3));
    /* 第 9 週她一直在旁邊 → 第 12 週她不在 */
    setup(TD('Y1S2',12,2)); const p4=pick();
    check('C. 第 9～11 週都沒演到（她在旁邊、沒去）：第 12 週的麵店日照樣先挑它（大一下學期內有效）',p4==='h504_zhe_hand',J(p4));
    setup(TD('Y1S2',12,2)); npcAt('heroine_03',2,2); const p5=pick();
    check('C. 第 12 週她在 4 m 內：照樣不說（等下一個麵店日）',p5!=='h504_zhe_hand',J(p5));
    /* 學期邊界 */
    const e=NOODLE_TABLE.Y1.find(x=>x.once==='h504_zhe_hand');
    const at=d=>{ fresh(d,18,'noodle'); return STORY.ndlTalkIf(H.G,e.if); };
    const r={w8:at(TD('Y1S2',8,2)),w9:at(TD('Y1S2',9,2)),w16:at(TD('Y1S2',16,2)),y1s1:at(TD('Y1S1',12,2)),y2s1:at(TD('Y2S1',1,2)),y2s2:at(TD('Y2S2',9,2))};
    check('C. 條件：大一下第 9 週起到學期結束成立；第 8 週、大一上、大二（過了學期）都不成立',e.pri===true&&J(r)===J({w8:false,w9:true,w16:true,y1s1:false,y2s1:false,y2s2:false}),J(r));
    setup(TD('Y2S1',3,2)); const p6=pick(); check('C. 過了大一下（大二上第 3 週的麵店日）：沒演到的也不再演',p6!=='h504_zhe_hand',J(p6)); });

  /* ---------- D0：句子都在 AA_538 稿裡（04ebaa37e） ---------- */
  await sec('D0',async()=>{ let doc=''; try{ doc=require('child_process').execSync('git -c core.quotepath=false show b9d816288:"docs/story_planning/AA_538_實作問答定稿句_佳蓉B館版_SK02系辦三句.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}
    const M='pool_20', L=POOL.LINES[M], ev=(STORY_EVENTS||[]).find(e=>e.id==='ev_sk02_jacket');
    const want=(L.meetB||[]).filter(l=>!l.meet).map(l=>l.text).concat([(L.gradB||[])[0]]), sk=ev?ev.dialogue.filter(d=>d.text==='我重考了。現在念法律系。'||d.text==='……喔，重考的那個。外套在這裡，等你快一年了。').map(d=>d.text):[];
    const strip=t=>String(t||'').replace(/^「(.*)」$/,'$1'), miss=want.concat(sk).filter(t=>!doc.includes(strip(t)));
    check('D0. AA_538（b9d816288）讀得到；佳蓉 meetB 五行＋畢業照片句、SK02 系辦兩句都在稿裡（一字不差）',doc.length>500&&want.length===6&&sk.length===2&&!miss.length,doc?J(miss):'git fetch origin claude/cool-heisenberg-o8kuqx'); });

  /* ---------- D：AA_528 第 9 點 ---------- */
  await sec('D',async()=>{ const M='pool_20', L=POOL.LINES[M];
    const WANT=[[null,'（法服值班桌底下，一個女生蹲著，拉著一條很長的延長線。延長線的另一頭繞到柱子後面。）'],[M,'同學，可以幫我拉一下嗎？插座在那根柱子後面，我一個人拉不到。'],
      [null,'（你幫她拉過去，插好。桌上的檯燈亮了一下。）'],[M,'……亮了。好。'],['MEET',M],[M,'馬佳蓉，法服管器材的。這條延長線比我資深。']];
    const got=(L.meetB||[]).map(l=>l.meet?['MEET',l.meet]:[l.speaker,l.text]);
    check('D. meetB 五行照 AA 回覆一字不差（MEET 在第五行前面）',J(got)===J(WANT),J(got));
    let sat=null; for(let k=0;k<12;k++){ const d=TD('Y2S1',1,6)+k*7; fresh(d,10,'wancai'); if(STORY.fafuDuty(H.G)){ sat=d; break; } }
    check('D. 萬才館法服值班的週六：認識的版本是 meetB（不是借社博的 meetDuty）',sat!=null&&POOL.meetVersion(H.G,M)==='meetB',J({sat:sat&&keyOf(sat),v:sat&&POOL.meetVersion(H.G,M)}));
    H.said=[]; const ok=await POOL.meet(GM,{name:'法服攤位那個人'},M,null);
    check('D. 演 meetB：照五行說、記住在萬才館認識的（POOL.rec mv＝meetB）、認識了',ok===true&&J(H.said.map(s=>s.t))===J(WANT.filter(w=>w[0]!=='MEET').map(w=>w[1]))&&POOL.rec(H.G).mv[M]==='meetB'&&SOCIAL.has(M,'FIRST_MET'),J({said:H.said.map(s=>s.t),mv:POOL.rec(H.G).mv[M]}));
    check('D. 社博那個入口照舊用 meet（帳篷、樹）；talk「法服的攤位每年都擺在同一個位置。因為那裡有插座。」照留',L.meet[0].text==='（帳篷後面，一個女生拉著一條很長的延長線，延長線的另一頭消失在樹後面。）'&&L.talk.some(x=>x.t==='「法服的攤位每年都擺在同一個位置。因為那裡有插座。」'));
    /* 畢業那則 */
    const gd=TD('Y3S2',16,6);
    const grad=mv=>{ fresh(gd-1,12,'dorm'); contact(M); fam(M); if(mv) POOL.rec(H.G).mv[M]=mv; const ab=STORY.abroad; STORY.abroad=()=>false; try{ setAt(gd,12); ph(); setAt(gd,23); ph(); } finally { STORY.abroad=ab; } return (H.G.msgs||[]).filter(m=>m.tag==='pool_jr_grad').map(m=>m.text); };
    const gB=grad('meetB'), gA=grad('meet'), gN=grad(null), gD=grad('meetDuty');
    check('D. 在萬才館值班認識的：畢業私訊第一則「（照片：值班桌旁邊那根柱子，底下一個插座）」、第二則照舊「那個插座我拍起來了。」',J(gB)===J(['（照片：值班桌旁邊那根柱子，底下一個插座）','那個插座我拍起來了。']),J(gB));
    check('D. 社博認識的（meet）、舊存檔沒記版本的：照原本「（照片：法服的攤位，帳篷後面那棵樹）」；改版以前在萬才館認識的開發存檔（meetDuty）算萬才館',J(gA)===J(['（照片：法服的攤位，帳篷後面那棵樹）','那個插座我拍起來了。'])&&J(gN)===J(gA)&&J(gD)===J(gB),J({gA,gN,gD})); });

  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

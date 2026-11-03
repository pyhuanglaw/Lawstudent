// AA_623 麵店團改成桌遊團（＋AA_618 2-4 第 1、3 點）、AA_612 麵店改燒臘店（A、C 表，語彤以外）——不需要瀏覽器。
//   1  燒臘店的名字：招牌、區域名、地點、互動按鈕、點餐（叉燒飯 100／燒鴨飯 110）、吃過的店名；比對新舊都認（舊存檔的「阿鳳麵店」）
//   2  桌遊夜的日子：大一上第 5、7、10、12、14 週週五（其他學期第 2 週起隔週），考試週、國定假日、大五停；作息 20:00～23:30 明軒、阿哲、芯慈、柏翰在日常失速（麵店日長桌的作息拿掉）
//   3  明軒的約：當天 12:00；不在群組＝私訊兩句（第一次）、「好。」才排 20:00 出遊、「這次不行。」明軒回一句；在群組＝群組一句＋大家的回覆（Alison、阿哲、柏翰第一次、芯慈、沛珊那一晚有來）
//   4  群組：名字一直是「桌遊團」（不再每年改名）；舊存檔的「麵店團」「法X吃飯」改「桌遊團」、規矩兩句改「隔週五 桌遊」「沒空不用講」、「最後一學期」照舊
//   5  加進群組：第一次桌遊夜結束明軒「我開個群組，之後在這裡約。」（明軒建立）；第 13 週「考完吃哪家」一直沒去的明軒「你也進來吧。」（明軒把你加進）；
//      第一次併桌（ev_zhe_long_table）不再加群組；補救入口說話的人改明軒
//   6  中秋烤肉（大一）：照原本在河濱、明軒揪「中秋烤肉，河濱，七點。飲料自己帶。」（ace533a43）；A15 考完的聚餐＝AA_618 2-4 第 1 點（日常失速、阿哲在群組「考完了！日常失速，八人桌我先佔。」）
//   7  人物頁：去過三次以上，明軒多一行「隔週五在日常失速辦桌遊。」
// 修改前（開發分支 b744b3237）：第 1～7 項 FAIL。用法：node tests/aa623_boardgame_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, MX='classmate_mingxuan', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){} }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1');
const B=typeof BGN!=='undefined'?BGN:null;
const night=(t,w)=>TD(t,w,5);
const msgs=th=>(H.G.msgs||[]).filter(m=>!th||m.th===th);
const answer=(tag,i)=>{ const m=(H.G.msgs||[]).find(x=>x.tag===tag&&x.ask); if(!m) return false; return PHONE.answer(H.G,m.ask.id,i)!=null; };
const tick=()=>{ for(let i=0;i<3;i++){ STORY.phoneRules(GM); PHONE.tick(H.G); } };

(async()=>{
await sec(0,()=>{ check('0. src/bgnight3d.js 在 index.html、載得到（BGN）',ORDER.includes('src/bgnight3d.js')&&!!B&&!!ev('ev_bgnight')); });

/* ---------- 1 燒臘店 ---------- */
await sec(1,()=>{ const Z=strip(src('src/zones3d.js'));
  check('1. 公館的招牌「公館燒臘」、副標「叉燒・燒鴨・油雞」；互動「進入公館燒臘」「離開公館燒臘」「坐下吃飯」',/n:'公館燒臘',c:'#c9463d',w:10,type:'noodle',it:'noodle',sub:'叉燒・燒鴨・油雞',v:'公館燒臘'/.test(Z)&&Z.includes('進入公館燒臘')&&Z.includes('離開公館燒臘')&&Z.includes('坐下吃飯')&&!Z.includes("'阿鳳麵店'"));
  check('1. 店裡的價目板：叉燒飯 100 ・ 燒鴨飯 110 ・ 三寶飯 130 ・ 滷蛋 15',Z.includes('叉燒飯 100 ・ 燒鴨飯 110 ・ 三寶飯 130 ・ 滷蛋 15'));
  const S=strip(src('src/story3d.js'));
  check('1. 點餐：「叉燒飯　100 元」「燒鴨飯　110 元」，扣 100／110',S.includes("{t:'叉燒飯　100 元',dim:G.money<100},{t:'燒鴨飯　110 元',dim:G.money<110}")&&S.includes('const cost=i===0?100:110;'));
  check('1. 吃過的店名（EAT.FIRST_KEY）＝公館燒臘；店名鍵照舊',typeof EAT!=='undefined'&&EAT.FIRST_KEY['阿鳳麵店']==='公館燒臘');
  check('1. 邀約地點 noodle 的名字＝公館燒臘',INVITE_DATA.places.find(p=>p.id==='noodle').name==='公館燒臘');
  check('1. 導航：句子提到「燒臘」也帶去 noodle',/\[\/麵店\|燒臘\/, \{zone:'noodle',name:'公館燒臘'\}\]/.test(src('src/guide3d.js')));
  H.fresh('2026-02-15',9,'dorm'); const d=H.G.day;
  OUT.plan(H.G,{id:'t_new',ev:'ev_x',day:d,h:18,place:'公館燒臘',title:'公館燒臘'}); OUT.plan(H.G,{id:'t_old',ev:'ev_y',day:d+1,h:18,place:'阿鳳麵店',title:'阿鳳麵店・長桌'});
  check('1. 店休那天有約：新的「公館燒臘」、舊存檔的「阿鳳麵店」都認（NOODLE_CLOSED.storyDue）',typeof NOODLE_CLOSED!=='undefined'&&NOODLE_CLOSED.storyDue(H.G)===true&&(at(d+1,9),NOODLE_CLOSED.storyDue(H.G)===true));
  check('1. 阿鳳照留（阿姨的名字、熟客口語）：「晚上吃燒臘？公館那家，阿鳳。」',ev('ev_zhe_noodle_invite').dialogue.some(l=>l.text==='晚上吃燒臘？公館那家，阿鳳。'));
});

/* ---------- 2 日子、作息 ---------- */
await sec(2,()=>{
  const Y1=[]; for(let w=1;w<=18;w++){ const d=night('Y1S1',w); if(d!=null&&B.isNight(d)) Y1.push(w); }
  check('2. 大一上：第 5、7、10、12、14 週（AA_618 2-4 第 3 點，ace533a43：第 5 週起隔週；第 6 週國慶照隔週跳過；期中第 8、9 週停）',!!B&&J(Y1)===J([5,7,10,12,14])&&J(B.weeks('Y1S1'))===J([5,7,10,12,14]),J(Y1));
  check('2. 大一上第 4、6、8、9、11 週週五不是',[4,6,8,9,11].every(w=>!B.isNight(night('Y1S1',w))));
  check('2. 第 10 週的週四、週六不是',!B.isNight(TD('Y1S1',10,4))&&!B.isNight(TD('Y1S1',10,6)));
  const ex=[]; for(const t of B.TERMS) for(let w=1;w<=18;w++){ const d=night(t,w); if(d==null) continue; const T=CALENDAR.termOf(d); if(T&&T.exam&&B.isNight(d)) ex.push(t+':'+w); }
  check('2. 考試週沒有',!ex.length,ex.join(','));
  const hol=[]; for(const t of B.TERMS) for(let w=1;w<=18;w++){ const d=night(t,w); if(d!=null&&B.natHoliday(d)&&B.isNight(d)) hol.push(CALENDAR.dateOf(d).key); }
  check('2. 國定假日沒有（校定停課日照辦：例如運動會）',!hol.length,hol.join(','));
  check('2. 一直辦到大四下（Y4S2 有）、大五沒有',[2,4,6,8].some(w=>B.isNight(night('Y4S2',w)))&&![2,4,6,8,10].some(w=>{ const d=TD('Y5S1',w,5); return d!=null&&B.isNight(d); }));
  H.fresh('2025-11-07',20.5,'dorm',{YT_MET_JOB:true}); const d6=night('Y1S1',10); at(d6,20.5);
  const here=id=>{ const e=STORY.schedEnt(CHARACTERS[id],H.G); return e&&e.zone===null&&e.act==='out'&&e.away==='在日常失速玩桌遊'; };
  check('2. 桌遊夜 20:30：明軒、阿哲、芯慈、柏翰在日常失速；Alison 不在（戲院）',['classmate_mingxuan','zhe','classmate_xinci','classmate_bohan'].every(here)&&!here('yu'),J(['classmate_mingxuan','zhe','classmate_xinci','classmate_bohan','yu'].map(id=>STORY.schedEnt(CHARACTERS[id],H.G))));
  at(d6,19.5); check('2. 19:30 還沒開始',!here(MX));
  check('2. 麵店日長桌的作息（NDL-PRESENT：Alison、柏翰、芯慈）拿掉',!['yu','classmate_bohan','classmate_xinci'].some(id=>(CHARACTERS[id].daily_schedule||[]).some(e=>e.ndlDay)));
});

/* ---------- 3 明軒的約 ---------- */
await sec(3,()=>{ const d6=night('Y1S1',10);
  H.fresh('2025-11-07',11.9,'dorm'); H.FAMILIAR(MX); at(d6,11.9); tick();
  check('3. 12:00 以前沒有',!(H.G.msgs||[]).some(m=>/^bgn_inv_/.test(m.tag||'')));
  at(d6,12.1); tick(); const P=msgs('p:'+MX).map(m=>m.text);
  check('3. 不在群組：明軒私訊兩句（第一次）',J(P)===J(['今天晚上八點，日常失速。我帶了一款新的桌遊。','四個人以上才好玩。你來的話剛好。']),J(P));
  const A=(H.G.msgs||[]).find(m=>m.th==='p:'+MX&&m.ask);
  check('3. 選項「好。」／「這次不行。」',!!A&&J(A.ask.opts.map(o=>o.t))===J(['好。','這次不行。']));
  answer(A.tag,0); tick();
  const q=OUT.get(H.G,'bgn_'+d6);
  check('3. 回「好。」＝排 20:00 日常失速的出遊（ev_bgnight）',!!q&&q.h===20&&q.place==='日常失速'&&q.ev==='ev_bgnight',J(q));
  H.fresh('2025-11-07',11.9,'dorm'); H.FAMILIAR(MX); at(d6,12.1); tick(); const A2=(H.G.msgs||[]).find(m=>m.th==='p:'+MX&&m.ask); answer(A2.tag,1); tick();
  check('3. 回「這次不行。」＝明軒「好，兩個禮拜後還有。」、不排',msgs('p:'+MX).some(m=>m.text==='好，兩個禮拜後還有。'&&m.from===MX)&&!OUT.get(H.G,'bgn_'+d6));
  H.fresh('2025-11-07',12.1,'dorm'); at(d6,12.1); tick();
  check('3. 不認識明軒＝不約',!(H.G.msgs||[]).some(m=>/^bgn_inv_/.test(m.tag||'')));
  /* 在群組 */
  const d8=night('Y1S1',12); H.fresh('2025-11-21',12.1,'dorm',{noodleTableDay:night('Y1S1',10),BGN_JOIN:'night',BGN_INV_N:1}); for(const id of [MX,'zhe','yu','classmate_bohan','classmate_xinci']) H.FAMILIAR(id); PHONE.join(H.G,'noodle_team','桌遊團'); at(d8,12.1); tick();
  const Gm=msgs('g:noodle_team').filter(m=>/^bgn_inv_/.test(m.tag||'')).map(m=>(m.from||'')+':'+m.text);
  check('3. 在群組：明軒群組一句（輪流）＋Alison、阿哲、柏翰（第一次）、芯慈的回覆',Gm[0]===MX+':'+BGN.LINES.group[1]&&Gm.includes('yu:我在戲院啦……幫我留一局。')&&Gm.includes('zhe:我練完就過去。幫我點厚片。')&&Gm.includes('classmate_bohan:我不太會玩。')&&Gm.includes(MX+':我教你，五分鐘。')&&Gm.some(t=>t.startsWith('classmate_xinci:')),J(Gm));
  check('3. 沒有私訊（改在群組）',!msgs('p:'+MX).some(m=>/^bgn_inv_/.test(m.tag||'')));
  let ps=null; for(const t of ['Y1S1','Y1S2','Y2S1']) for(let w=2;w<=16&&ps==null;w+=2){ const d=night(t,w); if(d!=null&&B.isNight(d)&&B.psOn(d)) ps=d; }
  H.fresh('2025-10-31',12.1,'dorm',{noodleTableDay:1,BGN_INV_N:2}); for(const id of [MX,'classmate_peishan']) H.FAMILIAR(id); PHONE.join(H.G,'noodle_team','桌遊團'); at(ps,12.1); tick();
  check('3. 沛珊有來的那一晚：「我九點才到可以嗎？」明軒「可以，第二局算你。」',msgs('g:noodle_team').some(m=>m.from==='classmate_peishan'&&m.text==='我九點才到可以嗎？')&&msgs('g:noodle_team').some(m=>m.from===MX&&m.text==='可以，第二局算你。'),CALENDAR.dateOf(ps).key);
  let cnt=0,tot=0; for(const t of ['Y1S1','Y1S2','Y2S1','Y2S2']) for(let w=2;w<=16;w+=2){ const d=night(t,w); if(d!=null&&B.isNight(d)){ tot++; if(B.psOn(d)) cnt++; } }
  check('3. 沛珊大約三次來一次（大一、大二）',tot>0&&cnt/tot>0.15&&cnt/tot<0.5,cnt+'/'+tot);
});

/* ---------- 4 群組名 ---------- */
await sec(4,()=>{
  check('4. STORY.ndlGroupName＝桌遊團（大一到大四都一樣）',['2025-10-01','2026-09-20','2027-09-20','2028-10-01'].every(k=>{ H.fresh(k,13,'dorm'); return STORY.ndlGroupName(H.G)==='桌遊團'; }));
  H.fresh('2026-09-14',13,'dorm',{noodleTableDay:5}); PHONE.join(H.G,'noodle_team','法二吃飯');
  H.G.msgs.push({th:'g:noodle_team',text:'阿哲建立了群組「法一吃飯」，把你加了進來。',tag:'noodle_team_new',day:5},{th:'g:noodle_team',from:'zhe',text:'吃飯用',tag:'noodle_team_rule',day:5},{th:'g:noodle_team',from:'zhe',text:'誰要吃什麼就喊',tag:'noodle_team_rule',day:5},{th:'g:noodle_team',text:'（阿哲把群組名稱改成「法二吃飯」。）',tag:'ndl_rename_Y2S1',day:6});
  STORY.ndlGroupFix(H.G); const g=PHONE.rec(H.G).groups.noodle_team, T=msgs('g:noodle_team').map(m=>m.text);
  check('4. 舊存檔「法二吃飯」→「桌遊團」',g.name==='桌遊團');
  check('4. 規矩兩句換成「隔週五 桌遊」「沒空不用講」；建立那則的名字換「桌遊團」；改名訊息照留',T.includes('隔週五 桌遊')&&T.includes('沒空不用講')&&T.includes('阿哲建立了群組「桌遊團」，把你加了進來。')&&T.includes('（阿哲把群組名稱改成「法二吃飯」。）'),J(T));
  H.fresh('2026-09-14',13,'dorm',{noodleTableDay:5}); PHONE.join(H.G,'noodle_team','麵店團'); STORY.ndlGroupFix(H.G);
  check('4. 舊存檔「麵店團」→「桌遊團」',PHONE.rec(H.G).groups.noodle_team.name==='桌遊團');
  H.fresh('2026-09-14',13,'dorm',{noodleTableDay:5}); PHONE.join(H.G,'noodle_team','最後一學期'); STORY.ndlGroupFix(H.G);
  check('4. 「最後一學期」照舊',PHONE.rec(H.G).groups.noodle_team.name==='最後一學期');
  H.fresh('2027-09-13',11,'dorm',{noodleTableDay:5}); PHONE.join(H.G,'noodle_team','桌遊團'); at(H.G.day+3,13); tick();
  check('4. 大三開學不再改名、沒有「法三吃飯」',PHONE.rec(H.G).groups.noodle_team.name==='桌遊團'&&!msgs('g:noodle_team').some(m=>/法三吃飯/.test(m.text||'')));
  check('4. 最後一學期以後改回「桌遊團」（group3d.js）',/rename\(G,'桌遊團'\)/.test(src('src/group3d.js'))&&src('src/group3d.js').includes('（阿哲把群組名稱改回「桌遊團」。）'));
});

/* ---------- 5 加進群組 ---------- */
await sec(5,async()=>{ const d6=night('Y1S1',10);
  H.fresh('2025-11-07',20,'dorm'); for(const id of [MX,'classmate_xinci']) H.FAMILIAR(id); at(d6,20,'any');
  await EVENTS.run(ev('ev_bgnight')); const L=H.lines();
  check('5. 第一次桌遊夜：開場、明軒、芯慈第一次的句子',L.includes('（長桌上已經擺好了。明軒在發牌，旁邊放著規則書。）')&&L.some(l=>l.endsWith('：這款是交換資源蓋房子的。……先玩一輪，邊玩邊懂。'))&&L.some(l=>l.endsWith('：規則書給我。……好，我懂了，你們先玩。'))&&L.includes('（她看完規則，第二輪就贏了。）'),J(L));
  check('5. 結束：明軒「我開個群組，之後在這裡約。」、記 noodleTableDay＋BGN_JOIN night、BGN_N 1',L.some(l=>l.endsWith('：我開個群組，之後在這裡約。'))&&H.G.flags.noodleTableDay===d6&&H.G.flags.BGN_JOIN==='night'&&H.G.flags.BGN_N===1);
  tick(); const T=msgs('g:noodle_team');
  check('5. 群組「桌遊團」：「明軒建立了群組「桌遊團」，把你加了進來。」、明軒兩句規矩',PHONE.inGroup(H.G,'noodle_team')&&PHONE.rec(H.G).groups.noodle_team.name==='桌遊團'&&T.some(m=>m.text==='明軒建立了群組「桌遊團」，把你加了進來。')&&T.filter(m=>m.tag==='noodle_team_rule'&&m.from===MX).map(m=>m.text).join('|')==='隔週五 桌遊|沒空不用講',J(T.map(m=>m.text)));
  H.said=[]; at(night('Y1S1',12),20); await EVENTS.run(ev('ev_bgnight')); const L2=H.lines();
  check('5. 第二次：不再說第一次的句子、不再開群組',!L2.some(l=>l.endsWith('：這款是交換資源蓋房子的。……先玩一輪，邊玩邊懂。'))&&!L2.some(l=>l.endsWith('：我開個群組，之後在這裡約。'))&&H.G.flags.BGN_N===2);
  /* 第 13 週 */
  const E13=ev('ev_friends_exam_meal'); H.fresh('2025-11-25',12,'linze'); H.FRIEND('zhe'); H.said=[]; await EVENTS.run(E13); const L3=H.lines();
  check('5. 第 13 週「考完吃哪家」：還不在群組＝明軒「你也進來吧。」、記 BGN_JOIN w13',L3.some(l=>l.endsWith('：你也進來吧。'))&&H.G.flags.BGN_JOIN==='w13'&&H.G.flags.noodleTableDay!=null,J(L3.slice(-3)));
  tick(); check('5. 「明軒把你加進了群組「桌遊團」。」',msgs('g:noodle_team').some(m=>m.text==='明軒把你加進了群組「桌遊團」。'));
  H.fresh('2025-11-25',12,'linze',{noodleTableDay:3}); H.FRIEND('zhe'); H.said=[]; await EVENTS.run(E13);
  check('5. 已經在群組的不說',!H.lines().some(l=>l.endsWith('：你也進來吧。')));
  const LT=ev('ev_zhe_long_table'), LO=ev('ev_zhe_long_table_out');
  check('5. 第一次併桌（ev_zhe_long_table）不再加群組（沒有 after 記 noodleTableDay）',!!LT&&!LT.after&&!LT.retired&&!!LO);
  const S=strip(src('src/story3d.js'));
  check('5. 阿哲約的那天 21:00 不再建群組',!/if\(G\.day\*24\+G\.hour>=d\*24\+21\) F\.noodleTableDay=d;/.test(S));
  for(const id of ['ev_zhe_group_late','ev_zhe_group_late_talk']){ const e=ev(id); check('5. 補救 '+id+'：照留、說話的人改明軒',!!e&&!e.retired&&e.dialogue[0].speaker===MX&&J(e.participants)===J([MX])); }
});

/* ---------- 6 中秋烤肉、A15 ---------- */
await sec(6,()=>{ const E=ev('ev_mid_autumn_bbq');
  check('6. 中秋烤肉（大一）：照原本在河濱（AA_623 第 3 節，ace533a43 改回）、CG-14 照播、兩句河濱的旁白照舊',E.dialogue[0].scene==='河濱'&&E.dialogue.some(l=>l.cg==='cg_midautumn_riverside')&&E.dialogue.some(l=>l.text==='中秋節前的河濱。阿哲借了一個烤肉架。')&&E.dialogue.some(l=>l.text==='中秋節前的河濱。大家借了一個烤肉架。')&&E.dialogue.some(l=>l.text==='隔壁房的方奕廷也來了，一直在講河邊的植物。'));
  const wed=TD('Y1S1',5,3), sat=TD('Y1S1',5,6);
  H.fresh('2025-10-01',20.9,'dorm'); H.FAMILIAR(MX); at(wed,21.1); tick();
  const m=(H.G.msgs||[]).find(x=>x.tag==='bbq_ask');
  check('6. 明軒揪：「中秋烤肉，河濱，七點。飲料自己帶。」（還不在桌遊團＝明軒私訊）',!!m&&m.from===MX&&m.th==='p:'+MX&&m.text==='中秋烤肉，河濱，七點。飲料自己帶。',J(m));
  answer('bbq_ask',0); tick(); const q=OUT.get(H.G,'bbq');
  check('6. 去＝週六 19:00（七點）河濱的出遊',!!q&&q.day===sat&&q.h===19&&q.place==='河濱',J(q));
  H.fresh('2025-10-01',20.9,'dorm',{noodleTableDay:3,BGN_JOIN:'night'}); H.FAMILIAR(MX); PHONE.join(H.G,'noodle_team','桌遊團'); at(wed,21.1); tick();
  const g=(H.G.msgs||[]).find(x=>x.tag==='bbq_ask');
  check('6. 在桌遊團：明軒在群組揪',!!g&&g.th==='g:noodle_team'&&g.from===MX&&g.text==='中秋烤肉，河濱，七點。飲料自己帶。',J(g));
  const Y=E.dialogue.filter(l=>/heroine_03/.test(String(l.if&&l.if.custom))&&l.text);
  check('6. 語彤那兩句照舊（P0：語彤的句子等新稿）',Y.some(l=>l.text==='語彤也來了，提著一盒阿姨醃的肉。阿哲在麵店揪人那天，阿姨在旁邊聽到了。')&&Y.some(l=>l.text==='阿姨叫我拿來的。她說常來吃麵的，都算自己人。'));
  const A=ev('ev_midterm_supper'), T=A.dialogue.map(l=>l.text).filter(Boolean);
  check('6. A15：日常失速長桌，AA_618 2-4 第 1 點的句子；「明軒說他沒念」照留；沒有滷味攤',A.dialogue[0].scene==='溫州街・日常失速・長桌'&&['我民總最後一題寫了一整面。……寫什麼我已經忘了。','我寫完那題就沒時間了。','那你還好，你至少寫完了。','我們不要對答案好不好。','第二題是不是選 C？','（十一點，店員來收第三輪的杯子。店長從頭到尾都在旁邊那張椅子上睡覺。）','明軒說他沒念。……我不信，他筆記比我多。'].every(t=>T.includes(t))&&!T.some(t=>/滷味攤/.test(t)),J(T));
  check('6. A15 群組：「考完了！日常失速，八人桌我先佔。」，選項「好。」／「今天先不去。」、20:00',strip(src('src/story3d.js')).includes("text:'考完了！日常失速，八人桌我先佔。',ask:{until:s1.day*24+20,opts:[{t:'好。',set:{SUPPER_MID1:'yes'}},{t:'今天先不去。',set:{SUPPER_MID1:'no'}}]}"));
});

/* ---------- 7 人物頁 ---------- */
await sec(7,()=>{ H.fresh('2026-03-02',12,'dorm'); H.FRIEND(MX);
  const lines=()=>(typeof WHOIS!=='undefined'&&WHOIS.lines?WHOIS.lines(H.G,MX):[]).map(x=>typeof x==='string'?x:(x&&x.t)||'');
  H.G.flags.BGN_N=2; const a=lines(); H.G.flags.BGN_N=3; const b=lines();
  check('7. 去過三次以上：明軒多一行「隔週五在日常失速辦桌遊。」（兩次沒有）',!a.includes('隔週五在日常失速辦桌遊。')&&b.includes('隔週五在日常失速辦桌遊。'),J(b));
});

H.done(); })();

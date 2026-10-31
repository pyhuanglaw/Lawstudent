// AA_549 寒暑假空白缺口表＋第一批稿（企劃線 claude/cool-heisenberg-o8kuqx；VAC-GAP-1031；D99 第二優先）——不需要瀏覽器。用法：node tests/aa549_vacgap_unit.js
//   2-1 芯慈大二暑假：作息平日 9～17「在證券公司實習」、VA-09 第二則換證券公司版（c14 版也換）
//   2-2 阿凱 2027-08-01～08-20 回宜蘭　2-3 Alison 2027-07-12～07-21 營隊（7/17 探班照舊）　2-7 語彤 2027-07-19～07-30 台東田野＋兩則私訊
//   2-4／3-2 2028 除夕的年夜飯　2-5／3-3 語彤 2/7 麵店、子晴 8/1 Café 的場景　2-6 C13 帶朋友出國：那幾天不在臺北、有活動卡的朋友婉拒
//   3-1 大三暑假三選一的九個小場景　3-4 回家住「出門」、晚餐多十二題　3-5 C04W、C18W 大一寒假開　3-6 女主角假期版邀約（她傳、見面第一句）
// 台詞一字不差照 AA_549（企劃線）；每一項在修改前（caabccf30）都會 FAIL（第 0 節「稿讀得到」除外）。
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const loadG=(f)=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
let loadErr='';
for(const f of ['src/holff3d.js','src/data/y1fill_events.js','src/y1fill3d.js','src/data/vacfill_events.js','src/vacfill3d.js','src/r2y3b3d.js','src/data/heroine_asks.js','src/heroine_asks3d.js']){ try{ loadG(f); }catch(e){ loadErr+=f+'：'+String(e&&e.message||e)+'　'; } }
const git=(ref,p)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+ref+':"'+p+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const A549='docs/story_planning/AA_549_寒暑假空白缺口表_第一批稿.md';
const doc=git('origin/claude/cool-heisenberg-o8kuqx',A549);
check('0. AA_549（企劃線）讀得到；模組都載得到',doc.length>3000&&!loadErr,loadErr||'git fetch origin claude/cool-heisenberg-o8kuqx');
const inDoc=t=>!doc||doc.includes(String(t).replace(/^「(.*)」$/,'$1'));
const notIn=L=>L.filter(t=>!inDoc(t));
const D=H.D, T=(d,h)=>d*24+h, wd=d=>CALENDAR.dateOf(d).wd%7;
const at=(k,h)=>{ const d=typeof k==='number'?k:D(k); H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); };
const pres=(id,k)=>STORY.presence(id,Object.assign({},H.G,{day:D(k)}));
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(k,h,zone||'dorm',flags); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.trips)) G.trips=[]; return G; };
const txt=th=>(H.G.msgs||[]).filter(m=>PHONE.th(m)===th).map(m=>m.text);

/* ================= 2-1 芯慈：證券公司實習 ================= */
{ const xc=CHARACTERS.classmate_xinci;
  fresh('2027-07-06',16); const e1=STORY.schedEnt(xc,H.G);
  at('2027-07-06',17.5); const e2=STORY.schedEnt(xc,H.G);
  at('2027-07-10',10); const e3=STORY.schedEnt(xc,H.G);
  at('2027-08-30',16); const e4=STORY.schedEnt(xc,H.G);
  check('2-1. 芯慈 2027-07-06（二）16:00「在證券公司實習」（不在總圖）；17:30 以後照原本的作息；週六、8/27 以後照舊',!!e1&&e1.zone==null&&e1.away==='在證券公司實習'&&!!e2&&e2.zone==='library'&&!(e3&&e3.away==='在證券公司實習')&&!!e4&&e4.zone==='library',J([e1&&(e1.away||e1.zone),e2&&e2.zone,e3&&(e3.away||e3.zone),e4&&e4.zone]));
  const M=VAC_DATA.VA09.msgs, m2=M.find(m=>m.tag==='va09_2');
  check('2-1. VA-09 第二則：「今天幫忙整理一份併購的時程表。很長。」「主管說排得很清楚。我很高興。」；c14 版「跟你上次在我家事務所看到的白板很像。現在換我排。」',
    J(m2.ms)===J(['今天幫忙整理一份併購的時程表。很長。','主管說排得很清楚。我很高興。'])&&J(m2.c14)===J(['今天幫忙整理一份併購的時程表。很長。','跟你上次在我家事務所看到的白板很像。現在換我排。']),J(m2));
  check('2-1. VA-09 第一則照舊；四則都沒有「我爸」',J(M[0].ms)===J(['第一天。我負責影印。','影印機會卡紙，卡在第三格。我已經會修了。'])&&!M.some(m=>m.ms.concat(m.c14||[]).some(t=>/我爸/.test(t))),J(M.map(m=>m.ms))); }

/* ================= 2-2 阿凱、2-3 Alison、2-7 語彤 的不在日期 ================= */
{ fresh('2027-07-01',10);
  const k=['2027-07-31','2027-08-01','2027-08-20','2027-08-21'].map(d=>{ const p=pres('kai',d); return p.here?'here':p.away+'/'+p.kind; });
  check('2-2. 阿凱 2027-08-01～08-20「回宜蘭」（home）、7/31 和 8/21 在臺北',J(k)===J(['here','回宜蘭/home','回宜蘭/home','here']),J(k));
  const y=['2027-07-11','2027-07-12','2027-07-17','2027-07-21','2027-07-22'].map(d=>{ const p=pres('yu',d); return p.here?'here':p.away+'/'+p.kind+(p.signal?'+signal':''); });
  check('2-3. Alison 2027-07-12～07-21「在營隊當小隊長」（trip，有訊號）；7/11、7/22 在臺北',J(y)===J(['here','在營隊當小隊長/trip+signal','在營隊當小隊長/trip+signal','在營隊當小隊長/trip+signal','here']),J(y));
  const c=TERMEND_LINES.C15.yu_camp2; at('2027-06-20',12); TERMEND.c15Plan(H.G,'yu_camp2'); const q=OUT.get(H.G,'c15_yu_camp2');
  check('2-3. 7/17 探班（C15 yu_camp2）照舊排得進行事曆',!!c&&!!q&&q.day===D('2027-07-17')&&q.state==='planned',J(q));
  const t=['2027-07-18','2027-07-19','2027-07-30','2027-07-31'].map(d=>{ const p=pres('heroine_03',d); return p.here?'here':p.away+'/'+p.kind+(p.signal?'+signal':''); });
  check('2-7. 語彤 2027-07-19～07-30「田野調查（台東）」（trip，有訊號）；7/18、7/31 在臺北',J(t)===J(['here','田野調查（台東）/trip+signal','田野調查（台東）/trip+signal','here']),J(t));
  check('2-7. 不在日期的字照稿（「回宜蘭」「在營隊當小隊長」「田野調查（台東）」）',!notIn(['回宜蘭','在營隊當小隊長','田野調查（台東）']).length); }
{ const yt='heroine_03', run=(k,h)=>{ at(k,h); STORY.phoneRules(GM); PHONE.tick(H.G); };
  fresh('2027-07-20',20); H.FRIEND(yt); H.G.contacts[yt]=H.G.day-200; run('2027-07-21',21.1); const a=txt('p:'+yt); run('2027-07-28',21.1); const b=txt('p:'+yt);
  const L1='這裡的阿嬤說話很快。我錄音錄了兩小時，聽懂一半。', L2='明天最後一天。阿嬤問我要不要留下來嫁給她孫子。我說要回去顧店。';
  check('2-7. 和語彤朋友以上：7/21 21:00、7/28 21:00 她傳兩則私訊（台詞照稿）',a.includes(L1)&&!a.includes(L2)&&b.includes(L2)&&!notIn([L1,L2]).length,J(b));
  fresh('2027-07-20',20); H.FAMILIAR(yt); H.G.contacts[yt]=H.G.day-200; run('2027-07-21',21.1); run('2027-07-28',21.1);
  check('2-7. 只有有點熟（FAMILIAR）：收不到',!txt('p:'+yt).length,J(txt('p:'+yt))); }

const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const playEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return H.lines(); };
const atHome=()=>{ const Hm=HOME.rec(H.G); Hm.at=true; Hm.day=H.G.day; const B=HOME.lawBreak(H.G); Hm.lbreak=B.key; Hm.brk=B.key; Hm.bskip={key:B.key,n:0,last:-1}; };
(async()=>{
  /* ================= 2-4／3-2 2028 除夕的年夜飯 ================= */
  { const k='2028-01-25'; fresh(k,18,{},'dorm'); atHome(); const e18=HOME.breakEvent(H.G); at(k,18.5); const e=HOME.breakEvent(H.G);
    const stops=typeof HOLFF!=='undefined'?HOLFF.stops(Object.assign({},H.G,{hour:12}),T(D(k),12)):[];
    check('3-2. 2028-01-25 除夕：18:00 還沒、18:30 在家＝ev_aa549_eve_y3；快轉／睡覺的停點有 18:30',!(e18&&e18.id==='ev_aa549_eve_y3')&&!!e&&e.id==='ev_aa549_eve_y3'&&(stops||[]).includes(T(D(k),18.5)),J([e18&&e18.id,e&&e.id]));
    const head=['（除夕。爸爸今年早一天從上海回來，在廚房幫媽媽切菜，切得很慢。）','媽媽：你爸切的，每一塊大小都不一樣。','爸爸：法律系第三年。……明年要考了吧？'], tail=['姊姊：（塞給你一個紅包）這是我第一次包給你。不准拆給媽看。','（十點，爸爸在沙發上睡著了。電視在重播去年的跨年。）'];
    const La=e?await playEv(e.id,['明年考']):[];
    check('3-2. 選「明年考。」：開頭三句→爸爸「考試的事我不懂。你需要什麼，跟你媽說。」→姊姊的紅包、十點的旁白；演一次',J(La)===J(head.concat(['爸爸：考試的事我不懂。你需要什麼，跟你媽說。'],tail))&&J(H.opts[0])===J(['「明年考。」','「還沒決定考什麼。」'])&&!!H.G.events.done.ev_aa549_eve_y3&&!(HOME.breakEvent(H.G)&&HOME.breakEvent(H.G).id==='ev_aa549_eve_y3'),J(La));
    fresh(k,18.5,{EXCHANGE_ROUTE:'JP'},'dorm'); atHome(); const ej=HOME.breakEvent(H.G); const Lb=ej?await playEv(ej.id,['還沒決定']):[];
    check('3-2. 日本路線（2/20 才出發）照演；選「還沒決定考什麼。」：爸爸「不急。你姊也是大四才決定的。」、姊姊「我是大四下。」',!!ej&&ej.id==='ev_aa549_eve_y3'&&J(Lb)===J(head.concat(['爸爸：不急。你姊也是大四才決定的。','姊姊：我是大四下。'],tail)),J(Lb));
    const all=head.concat(tail,['考試的事我不懂。你需要什麼，跟你媽說。','不急。你姊也是大四才決定的。','我是大四下。','明年考。','還沒決定考什麼。']).map(t=>t.replace(/^[^：（]{1,3}：/,''));
    check('3-2. 台詞都在 AA_549 稿裡',!notIn(all).length,J(notIn(all)));
    fresh(k,19,{},'dorm'); const ed=HOME.breakEvent(H.G);
    check('3-2. 人不在家（宿舍）不演',!(ed&&ed.id==='ev_aa549_eve_y3'),J(ed&&ed.id)); }

  /* ================= 2-5／3-3 只有一句旁白的兩次「約」 ================= */
  { fresh('2026-02-07',18);
    const head=['（寒假的麵店，客人只有兩桌。語彤在櫃台後面包餛飩。）','陳語彤：你來了。','陳語彤：今天的餛飩是我包的。形狀不一樣，味道一樣。','阿姨：她包的比我包的好看。不要跟她說。'];
    const nm=SOCIAL.npcName('heroine_03'), fix=L=>L.map(t=>t.replace(nm+'：','陳語彤：'));
    const a=fix(await playEv('ev_y1w_noodle_last',['點一碗'])), o=H.opts[0], b=fix(await playEv('ev_y1w_noodle_last',['寒假都在']));
    check('3-3. 2026-02-07 語彤的麵店：場景＋「（點一碗餛飩湯）」→（她端過來。）「最醜的那顆是第一顆。你吃到了。」',J(a)===J(head.concat(['（她端過來。）','陳語彤：最醜的那顆是第一顆。你吃到了。']))&&J(o)===J(['「（點一碗餛飩湯）」','「妳寒假都在店裡？」']),J([a,o]));
    check('3-3. 「妳寒假都在店裡？」→「嗯。過年那一個禮拜休息。」；Y1W_NOODLE_LAST 記 went',J(b)===J(head.concat(['陳語彤：嗯。過年那一個禮拜休息。']))&&H.G.flags.Y1W_NOODLE_LAST==='went',J(b));
    fresh('2027-08-01',15); const zn=SOCIAL.npcName('heroine_04'), fz=L=>L.map(t=>t.replace(zn+'：','高子晴：'));
    const zh=['（下午的兩點半 Café。子晴坐在最裡面，筆電貼滿貼紙，桌上兩杯冰美式。）','高子晴：一杯是你的。我猜你會遲到，所以先點了。冰塊都化了。','高子晴：我在做一個小遊戲。你幫我玩一關。'];
    const c=fz(await playEv('ev_vf_y2_0801',['好'])), o2=H.opts[0], d=fz(await playEv('ev_vf_y2_0801',['實習']));
    check('3-3. 2027-08-01 子晴的 Café：場景＋「好。」→（你玩了三分鐘，死了四次。）「很好。這就是我要的難度。」',J(c)===J(zh.concat(['（你玩了三分鐘，死了四次。）','高子晴：很好。這就是我要的難度。']))&&J(o2)===J(['「好。」','「妳在實習耶，週末還做？」']),J([c,o2]));
    check('3-3. 「妳在實習耶，週末還做？」→「實習是別人的遊戲。這個是我的。」',J(d)===J(zh.concat(['高子晴：實習是別人的遊戲。這個是我的。'])),J(d));
    const all=a.concat(b,c,d,o,o2).map(t=>t.replace(/^[^：（「]{1,4}：/,''));
    check('3-3. 台詞都在 AA_549 稿裡',!notIn(all).length,J(notIn(all))); }

  /* ================= 3-1 大三暑假三選一：九個小場景 ================= */
  { const arrive=async(k,flags,picks,prep)=>{ fresh(k,18.5,'dorm',flags); if(prep) prep(); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await HOME.breakArrive(GM); return H.lines(); };
    const after=(L,first)=>{ const i=L.indexOf(first); return i<0?null:L.slice(i); };
    const I={SUMMER_Y3:'intern'}, W={SUMMER_Y3:'work'}, S={SUMMER_Y3:'study'};
    let L=after(await arrive('2028-06-26',I,['一半']),'實習第一天，你負責影印。影印機比你還資深。'); const o1=H.opts[0];
    check('3-1. 實習 6/26：原本那一句→指導律師「影印完，順便看一下你印的是什麼。」「……看懂了嗎？」→「一半。」「一半很好。我第一年只看懂三分之一。」',J(L)===J(['實習第一天，你負責影印。影印機比你還資深。','指導律師：影印完，順便看一下你印的是什麼。','指導律師：……看懂了嗎？','指導律師：一半很好。我第一年只看懂三分之一。'])&&J(o1)===J(['「一半。」','「看懂了。」']),J([L,o1]));
    L=after(await arrive('2028-06-26',I,['看懂了']),'實習第一天，你負責影印。影印機比你還資深。');
    check('3-1. 實習 6/26「看懂了。」→「那明天你來寫摘要。」',!!L&&L[L.length-1]==='指導律師：那明天你來寫摘要。',J(L));
    L=after(await arrive('2028-07-24',I),'你第一次自己寫完一份初談紀錄。律師只改了兩個字。');
    check('3-1. 實習 7/24：原本那一句→指導律師「這兩個字很重要。「可能」跟「應該」，不一樣。」',J(L)===J(['你第一次自己寫完一份初談紀錄。律師只改了兩個字。','指導律師：這兩個字很重要。「可能」跟「應該」，不一樣。']),J(L));
    L=after(await arrive('2028-08-21',I),'最後一天，主任說：『明年考完，再來。』');
    check('3-1. 實習 8/21：原本那一句（主任說「明年考完，再來。」）→卡片那一句旁白',J(L)===J(['最後一天，主任說：『明年考完，再來。』','（你的桌上多了一張卡片，事務所五個人的字。最下面那個字最醜，是主任寫的。）']),J(L));
    L=await arrive('2028-06-26',W,['吃冰']); const o2=H.opts[0];
    check('3-1. 家教 6/26（宿舍）：原本那一句→學生「老師，暑假也要上喔？」→「上完帶你去吃冰。」「說好的喔。」',J(after(L,'暑假學生的課排得比學期中多。宿舍沒什麼人，你每次都是第一個出門。'))===J(['暑假學生的課排得比學期中多。宿舍沒什麼人，你每次都是第一個出門。','學生：老師，暑假也要上喔？','學生：說好的喔。'])&&J(o2)===J(['「暑假才要上。」','「上完帶你去吃冰。」']),J([L,o2]));
    L=await arrive('2028-06-26',W,['暑假才要上'],()=>{ HOME.rec(H.G).at=true; });
    check('3-1. 家教 6/26（住家裡）：在家那一句→學生→「暑假才要上。」「……好啦。」',J(after(L,'暑假學生的課排得比學期中多。你從家裡搭捷運去。'))===J(['暑假學生的課排得比學期中多。你從家裡搭捷運去。','學生：老師，暑假也要上喔？','學生：……好啦。']),J(L));
    L=after(await arrive('2028-07-24',W),'學生問你，法律系是不是都在背。你說：『背完以後才開始。』');
    check('3-1. 家教 7/24：原本那一句→學生「那我不要念法律。……我要念背完就結束的。」',J(L)===J(['學生問你，法律系是不是都在背。你說：『背完以後才開始。』','學生：那我不要念法律。……我要念背完就結束的。']),J(L));
    L=after(await arrive('2028-08-21',W),'最後一堂課，學生的媽媽塞了一盒水果給你。');
    check('3-1. 家教 8/21：原本那一句→學生的媽媽「這一盒是我們家自己種的芒果。拿回去。」→（學生在門口揮手…）',J(L)===J(['最後一堂課，學生的媽媽塞了一盒水果給你。','學生的媽媽：這一盒是我們家自己種的芒果。拿回去。','（學生在門口揮手，揮到電梯門關起來。）']),J(L));
    { const J0=global.JOBS; global.JOBS={any:()=>'noodle'}; try{
      const a=await arrive('2028-06-26',W), b=after(await arrive('2028-07-24',W),'七月最熱的那個禮拜，店裡的冷氣壞了三天。你學會一邊流汗，一邊說『歡迎光臨』。'), c=after(await arrive('2028-08-21',W),'最後一班，老闆多給了一個便當。');
      check('3-1. 其他打工：6/26 只有原本那一句；7/24 老闆「冷氣修好了。這三天辛苦你了。」；8/21 老闆「便當帶走。明年暑假還要來喔。」',a.length===1&&J(b)===J(['七月最熱的那個禮拜，店裡的冷氣壞了三天。你學會一邊流汗，一邊說『歡迎光臨』。','老闆：冷氣修好了。這三天辛苦你了。'])&&J(c)===J(['最後一班，老闆多給了一個便當。','老闆：便當帶走。明年暑假還要來喔。']),J([a,b,c])); } finally { global.JOBS=J0; } }
    L=after(await arrive('2028-06-26',S,['對']),'你把大一的《民法》從紙箱裡拿出來。書角都翻捲了。'); const o3=H.opts[0];
    check('3-1. 讀書 6/26：原本那一句→（總圖 B1 的位子…）隔壁的考生「同學，你也是明年考？」→「對。」「加油。我第三年了。……今年會上。」',J(L)===J(['你把大一的《民法》從紙箱裡拿出來。書角都翻捲了。','（總圖 B1 的位子，八點以前就被書包佔滿。你搶到靠插座的那一個。）','隔壁的考生：同學，你也是明年考？','隔壁的考生：加油。我第三年了。……今年會上。'])&&J(o3)===J(['「對。」','「還沒決定。」']),J([L,o3]));
    L=after(await arrive('2028-06-26',S,['還沒決定']),'你把大一的《民法》從紙箱裡拿出來。書角都翻捲了。');
    check('3-1. 讀書 6/26「還沒決定。」→「那很好。慢慢想。」',!!L&&L[L.length-1]==='隔壁的考生：那很好。慢慢想。',J(L));
    L=after(await arrive('2028-07-24',S),'七月。冷氣開著，你讀完第一本。');
    check('3-1. 讀書 7/24：原本那一句→兩句旁白→隔壁的考生「多買的。」',J(L)===J(['七月。冷氣開著，你讀完第一本。','（七月最熱的那個禮拜，B1 的冷氣開到最強。你帶了一件外套。）','（隔壁的考生把一包餅乾推過來。）','隔壁的考生：多買的。']),J(L));
    const first8='姊姊回家，看到你的筆記：『這是你寫的？字變小了。』', an=SOCIAL.npcName?null:null;
    L=after(await arrive('2028-08-21',S,[],()=>{ H.FAMILIAR('heroine_01'); }),first8);
    check('3-1. 讀書 8/21、認識以安（8/5 從日本回來）：原本那一句→以安三句',!!L&&L.length===4&&J(L.slice(1).map(t=>t.replace(/^[^：]*：/,'')))===J(['你暑假都在這裡？','……我在京都的圖書館，也是坐最角落。','明天開始，我也來。'])&&H.said[H.said.length-1].who===SOCIAL.displayName('heroine_01'),J(L));
    L=after(await arrive('2028-08-21',S),first8);
    check('3-1. 讀書 8/21、不認識以安：原本那一句→（隔壁的考生今天沒有來。…「我上了。這個位子給你。」）',J(L)===J([first8,'（隔壁的考生今天沒有來。他的位子上放了一張紙條：「我上了。這個位子給你。」）']),J(L));
    L=after(await arrive('2028-07-31',Object.assign({EXCHANGE_ROUTE:'US'},S),[],()=>{ H.FAMILIAR('heroine_01'); }),first8);
    check('3-1. 美國路線第三場在 7/31：以安還在日本＝紙條那一版',J(L)===J([first8,'（隔壁的考生今天沒有來。他的位子上放了一張紙條：「我上了。這個位子給你。」）']),J(L));
    const all=[]; for(const k in R2Y3B.SUMMER_SCENES) for(const x0 of R2Y3B.SUMMER_SCENES[k]){ const xs=typeof x0==='function'?[x0({flags:{},day:D('2028-08-21')})]:[x0]; for(const x of xs){ if(!x) continue; for(const l of x.lines) all.push(l.narr||l.text); for(const c of (x.choice||[])){ all.push(c.t); for(const l of c.say) all.push(l.text); } } }
    check('3-1. 小場景的台詞都在 AA_549 稿裡（'+all.length+' 句）',all.length>=20&&!notIn(all).length,J(notIn(all))); }

  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

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

  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

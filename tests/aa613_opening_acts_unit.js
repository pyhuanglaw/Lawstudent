// AA_613 開學活動有同學約一起去、系籃怎麼加入（企劃線 claude/cool-heisenberg-o8kuqx 52e3d83a8；任務 AA613-OPENING-ACTS-1103；src/aa613_3d.js）——不需要瀏覽器（D131）。
//   0 讀稿、模組、index.html 的順序、每一句都在稿裡（一字不差）、舊的「（你在場邊填了表。）」不在遊戲裡、開學典禮的掛勾
//   1-1 社博前一天 21:00 阿哲私訊（認識阿哲才有）、「好。」／「我晚點自己去。」　1-2 21:10 第七小隊群組兩則（在群組才有）、11:00～12:00 合唱團攤位前面、說話那一段（填過的社團名字／「還沒。」）
//   2-1 說了「好。」：阿哲在晨思鐘 → 走到他旁邊＝那一段（「我也寫。」加入、「我先看看。」沒加入）→ 之後在系籃攤位旁邊、12:00 離開；沒說「好。」的沒有
//   1 說了「好。」、12:00 都沒到晨思鐘＝16:00「你沒來喔？系籃我幫你填了。」（送到＝填了；「不要啦。」取消）；到了、選「我晚點自己去。」、自己填了的都沒有
//   1-3 法律資料怎麼查：前一天 21:00 芯慈（兩場都還沒去才傳）、「好。」＝15:20 法圖門口「這邊。」→ 討論室 A、坐到你旁邊
//   1-4 社博填過表的吉他、辯論、登山：第一次社課前一天 21:00 社團群組（學長）　2-2 系籃攤位多兩句
//   2-3 第一次練球前一天 21:00：沒加入＝阿哲私訊（「好，我去看看。」／「這學期先不要。」→「OK。」）、加入了＝系籃群組學長一則
//   2-4 第一次到球場（沒填過表）：學長兩句 → 記 CLUB_dept_basketball；2-3 選「好，我去看看。」、阿哲在場＝「我就說吧。」
//   典禮：8/31 自動流程開頭「（你和柏翰一起走過去。）」（認識柏翰才有）
// 修改前（開發分支 db7966bf6）：模組不存在——FAIL。用法：node tests/aa613_opening_acts_unit.js（先 git fetch origin claude/cool-heisenberg-o8kuqx）
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const loadErr=[];
const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
for(const f of ['src/data/club_fair_expo_layout.js','src/data/club_fair.js','src/clubfair3d.js','src/aa613_3d.js']){ if(!fs.existsSync(path.join(H.ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ loadG(f); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,160)); } }
const git=(ref,p)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+ref+':"'+p+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const SHA='232fe4149', DOC='docs/story_planning/AA_613_開學活動同學約_系籃怎麼加入_兩層書店.md';
const doc=git(SHA,DOC);
const A=()=>typeof AA613!=='undefined'&&AA613&&AA613.L?AA613:null;
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, wd=d=>CALENDAR.dateOf(d).wd%7, key=d=>CALENDAR.dateOf(d).key;
const ZHE='zhe', XC='classmate_xinci', PS='classmate_peishan', BH='classmate_bohan';
const NEW={LAW_START_DAY:D('2025-08-29'),MAIN_D1:D('2025-09-04'),MET_ZHE:true};   /* 開學改 9/1 的新局（社博 9/6 週六）；宿營認識阿哲 */
const at=(k,h)=>{ const d=typeof k==='number'?k:D(k); H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); E.hour=h; };
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const runAt=(k,h)=>{ at(k,h); phone(); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const tx=L=>L.map(m=>m.text);
const knowAll=()=>{ for(const id of [XC,PS,BH]) SOCIAL.remember(id,'FIRST_MET',''); };
const fresh=(k,h,fl,o)=>{ o=o||{}; const G=H.fresh(typeof k==='number'?key(k):k,h,o.zone||'dorm',Object.assign({},NEW,fl||{})); if(!G.contacts) G.contacts={}; if(!G.acts) G.acts={att:{}}; G.visited=G.visited||{};
  if(o.know!==false) knowAll(); if(o.squad!==false) PHONE.join(G,'camp_squad_y1','第七小隊'); return G; };
const said=()=>H.said.map(s=>(s.who?s.who+'：':'')+s.t);
const place=(x,z,lv)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; E.player.lv=lv|0; };
const sched=id=>STORY.schedEnt(CHARACTERS[id],H.G);
const caps=[]; GM.caption=(w,t)=>{ caps.push(t); };
(async()=>{
  /* ================= 0 ================= */
  check('0. AA_613（企劃線 52e3d83a8）讀得到；第 1、2 節都在',doc.length>2000&&doc.includes('## 1. 開學活動誰約')&&doc.includes('## 2. 系籃怎麼加入')&&doc.includes('### 2-4'),doc?'':'git fetch origin claude/cool-heisenberg-o8kuqx');
  check('0. 模組都載得到（CLUBFAIR、AA613）',!loadErr.length&&!!A()&&typeof CLUBFAIR!=='undefined',J(loadErr));
  if(!A()){ H.done(); return; }
  const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), sc=[...html.matchAll(/<script src="([^"?]+)\?v=([^"]+)"/g)].map(m=>m[1]), ia=sc.indexOf('src/aa613_3d.js');
  check('0. index.html：aa613_3d.js（?v=9.10.22）在 phone3d、story3d、classes3d、clubfair3d、aa667_3d 之後',ia>0&&html.includes('<script src="src/aa613_3d.js?v=9.10.22"></script>')&&['src/phone3d.js','src/story3d.js','src/classes3d.js','src/clubfair3d.js','src/aa667_3d.js'].every(f=>sc.indexOf(f)>=0&&sc.indexOf(f)<ia),J(ia));
  { let W=null; try{ W=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')); }catch(e){}
    const e=W&&W.files&&W.files.find(x=>x.path===DOC);
    check('0. 劇情匯入白名單：AA_613＝232fe4149、approved、approvedBy「AA（D109）」、任務 AA613-OPENING-ACTS-1103',!!e&&e.sha===SHA&&e.status==='approved'&&e.approvedBy==='AA（D109）'&&e.task==='AA613-OPENING-ACTS-1103',J(e&&{sha:e.sha,st:e.status})); }
  /* 每一句都在稿裡 */
  { const L=A().L, all=[];
    const add=(x,sp)=>{ if(x==null) return; if(typeof x==='string'){ all.push(x); return; } if(Array.isArray(x)){ if(x.length===2&&(x[0]===null||typeof x[0]==='string')&&typeof x[1]==='string'&&(x[0]===null||/^[a-z_]+$/.test(x[0])||x[0]==='顧攤的學長')){ all.push(x[1]); return; } for(const y of x) add(y); return; }
      if(typeof x==='object'){ for(const k of Object.keys(x)){ if(k==='join') continue; add(x[k]); } } };
    add(L); const bad=all.filter(t=>!doc.includes(t));
    check('0. AA613.L 每一句（'+all.length+' 句）都在稿裡、一字不差',all.length>=40&&!bad.length,J(bad));
    const who=(arr,i)=>arr[i][0]; check('0. 說的人照稿：晨思鐘那一段（旁白、阿哲、顧攤的學長）、群組（芯慈、沛珊）',J(L.bell.map(x=>x[0]))===J([null,ZHE,ZHE,null,'顧攤的學長',ZHE,'顧攤的學長','顧攤的學長'])&&who(L.squad,0)===XC&&who(L.squad,1)===PS&&L.bellEnd[0]===ZHE);
    const bk=CLUB_FAIR.BOOTHS.find(b=>b.id==='basketball'), ds=(CLUB_FAIR.DOOR_SAY_BY||{}).dept_basketball||[];
    check('0. 2-2：系籃攤位學長兩句後面多兩句（照稿）',J(bk.say)===J(['法律系的？系籃缺人。會不會打不重要，有來比較重要。','練球在映月湖旁邊的球場。','系籃是系學會的，法律系大一到大四都可以，不用甄試。名字寫這裡就好。','第五週開始，每週五。練球前一天群組會講。'])&&bk.say.slice(2).every(t=>doc.includes('「'+t+'」')),J(bk.say));
    check('0. 2-4：學長兩句（DOOR_SAY_BY，說的人「學長」、句子照稿）',J(ds)===J([['學長','新來的？大一？'],['學長','名字寫這裡。之後每週五，有空就來。']])&&ds.every(([w,t])=>doc.includes(w+'：'+t)));
    const cf=fs.readFileSync(path.join(H.ROOT,'src/data/club_fair.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
    check('0. 舊的「（你在場邊填了表。）」不在遊戲裡（只剩註解）',!cf.includes('（你在場邊填了表。）')&&!(CLUB_FAIR.DOOR_LINE_BY||{}).dept_basketball);
    const s3=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'); check('0. 開學典禮（story3d.js S.ceremonyY1）開頭叫 AA613.ceremonyWalk',/ADV\.begin\(\{background:bg&&bg\.image\?\{image:bg\.image\}:'blur'\}\);\s*\n\s*if\(typeof AA613!=='undefined'&&AA613\.ceremonyWalk\) await AA613\.ceremonyWalk\(GM\);/.test(s3));
    check('0. 稿上「開學典禮」：自動流程的那一句＝「（你和柏翰一起走過去。）」',doc.includes('是自動流程的話，就是去的路上那一句旁白：「'+L.ceremony+'」')); }

  const d6=D('2025-09-06');
  /* ================= 1-1 阿哲私訊 ================= */
  { fresh('2025-09-05',20.5); runAt('2025-09-05',20.98); const pre=byTag('aa613_zhe_fair').length; runAt('2025-09-05',21); const M=byTag('aa613_zhe_fair');
    check('1-1. 前置：CLUBFAIR.hintOn（社博 9/6 週六）、fairDay＝9/6',CLUBFAIR.hintOn(H.G)&&AA613.fairDay(H.G)===d6&&wd(d6)===6);
    check('1-1. 9/5（五）21:00 阿哲私訊兩則（20:59 還沒有）',pre===0&&M.length===2&&J(tx(M))===J(AA613.L.zheFair.dm)&&M.every(m=>m.th==='p:zhe'&&m.from==='zhe')&&M[0].h===21&&wd(M[0].day)===5,J(M.map(m=>[m.day,m.h,m.text])));
    check('1-1. 最後一則可以回「好。」／「我晚點自己去。」',!!M[1].ask&&J(M[1].ask.opts.map(o=>o.t))===J(['好。','我晚點自己去。']));
    const r=PHONE.answer(H.G,'aa613_zhe_fair',0); check('1-1. 回「好。」＝AA613_ZHE_FAIR＝9/6',!!r&&H.G.flags.AA613_ZHE_FAIR===d6);
    fresh('2025-09-05',20.5,{MET_ZHE:false}); runAt('2025-09-05',21.2); check('1-1. 還沒認識阿哲（沒有 MET_ZHE）：沒有',byTag('aa613_zhe_fair').length===0);
    H.fresh('2025-09-05',20.5,'dorm',{MET_ZHE:true}); runAt('2025-09-05',21.2); check('1-1. 舊局（社博不在 9/6 週六）：沒有',!CLUBFAIR.hintOn(H.G)&&byTag('aa613_zhe_fair').length===0); }
  /* ================= 1-2 第七小隊群組 ================= */
  { fresh('2025-09-05',20.5); runAt('2025-09-05',21+9/60); const pre=byTag('aa613_squad').length; runAt('2025-09-05',21+10/60); const M=byTag('aa613_squad');
    check('1-2. 9/5 21:10 第七小隊群組：芯慈、沛珊各一則（21:09 還沒有）、不用回',pre===0&&M.length===2&&J(tx(M))===J(AA613.L.squad.map(x=>x[1]))&&J(M.map(m=>m.from))===J([XC,PS])&&M.every(m=>m.th==='g:camp_squad_y1'&&!m.ask),J(M.map(m=>[m.from,m.text,m.h])));
    fresh('2025-09-05',20.5,{},{squad:false}); runAt('2025-09-05',21.5); check('1-2. 不在第七小隊群組：沒有',byTag('aa613_squad').length===0); }
  /* ================= 1-2 合唱團的攤位前面 ================= */
  { fresh('2025-09-05',20.5); runAt('2025-09-05',21.5); at(d6,10.9); const e0=[sched(PS),sched(XC)]; at(d6,11.2); const e1=[sched(PS),sched(XC)]; at(d6,12); const e2=[sched(PS),sched(XC)];
    check('1-2. 9/6 11:00～12:00 沛珊、芯慈在合唱團攤位前面（校園；說話＝ev_aa613_choir）',e1[0]===AA613.SCHED.psChoir&&e1[1]===AA613.SCHED.xcChoir&&e1.every(e=>e.zone==='campus'&&e.talkEvent==='ev_aa613_choir')&&e0.every(e=>!e||e.talkEvent!=='ev_aa613_choir')&&e2.every(e=>!e||e.talkEvent!=='ev_aa613_choir'),J([e0,e1,e2].map(x=>x.map(e=>e&&e.label))));
    const ev=STORY_EVENTS.find(e=>e.id==='ev_aa613_choir'); at(d6,11.2); H.G.zone='campus';
    check('1-2. 沛珊那天本來回台中（AA_372 單數週的週末）：11:00～12:00 在臺北（社博），12:00 以後照舊不在',STORY.presence(PS,H.G).here===true&&(at(d6,12.1),STORY.presence(PS,H.G).here===false)&&(at(d6,10.9),STORY.presence(PS,H.G).here===false)); at(d6,11.2);
    check('1-2. 事件登記了、11:10 條件成立',!!ev&&EVENTS.check(ev));
    H.G.flags.CLUB_club_guitar=true; H.G.flags.CLUB_dept_basketball=true; H.said=[]; await EVENTS.run(ev);
    check('1-2. 說話：沛珊「你填了什麼？」→ 你「吉他社、系籃。」（填過的社團）→ 沛珊「我想去看熱舞。十一點半。」',J(said())===J(['沛珊：你填了什麼？','祐廷：吉他社、系籃。','沛珊：我想去看熱舞。十一點半。'])&&H.G.flags.AA613_FILLED_T===undefined,J(said()));
    check('1-2. 演一次（之後照一般說話）',!EVENTS.check(ev));
    fresh('2025-09-05',20.5); runAt('2025-09-05',21.5); at(d6,11.5); H.said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_aa613_choir'));
    check('1-2. 一個都沒填：你「還沒。」',said()[1]==='祐廷：還沒。',J(said()));
    fresh('2025-09-05',20.5,{},{squad:false}); runAt('2025-09-05',21.5); at(d6,11.2); check('1-2. 沒有群組那兩則（不在群組）：她們不在攤位前面',!sched(PS)||sched(PS)!==AA613.SCHED.psChoir); }

  /* ================= 2-1 晨思鐘 ================= */
  const goFair=(fl)=>{ fresh('2025-09-05',20.5,fl); runAt('2025-09-05',21.2); PHONE.answer(H.G,'aa613_zhe_fair',0); };
  { goFair(); at(d6,9.5); const e0=sched(ZHE); at(d6,10); const e1=sched(ZHE); H.G.zone='campus';
    check('2-1. 說了「好。」：9:45～12:00 阿哲在晨思鐘（校園）',e1===AA613.SCHED.zheBell&&e1.zone==='campus'&&e0!==AA613.SCHED.zheBell,J([e0&&e0.label,e1&&e1.label]));
    place(-20,0); check('2-1. 還沒走到他旁邊：不演',!AA613.bellDue(GM));
    place(-36,12.5); at(d6,9.9); check('2-1. 09:54 社博還沒開始：不演',!AA613.bellDue(GM));
    at(d6,10.1); check('2-1. 10:06 走到阿哲旁邊：演',AA613.bellDue(GM));
    H.said=[]; H.picks=['我也寫。']; await AA613.bellScene(GM); const L=said();
    check('2-1. 那一段照稿（旁白、阿哲、顧攤的學長…）',J(L.slice(0,8))===J(['（10:00，晨思鐘。阿哲已經在了，手上拿著三張傳單。）','阿哲：你來了。我先拿了一些。','阿哲：系籃在那邊。走。','（系學會的攤位，招牌寫「法律系系學會（系籃）」。）','顧攤的學長：法律系的？系籃缺人。','阿哲：學長，我高中有打。','顧攤的學長：好，名字寫這裡。（他看你）你呢？','顧攤的學長：系籃是系學會的，法律系都可以來。不用會打，練球週五五點半，第五週開始。']),J(L));
    check('2-1. 選項「我也寫。」／「我先看看。」',J(H.opts[0])===J(['我也寫。','我先看看。']),J(H.opts));
    check('2-1.「我也寫。」＝加入（CLUB_dept_basketball、FAIR_JOIN）→ 阿哲「好欸。」→ 填表那一句（照現在；放在「好欸。」後面，232fe4149 第 6 點）→「我去看別的。你逛你的，中午舞台有表演。」',H.G.flags.CLUB_dept_basketball===true&&H.G.flags.FAIR_JOIN===true&&J(L.slice(8))===J(['阿哲：好欸。','你在「系籃（系學會）」的攤位填了表。','阿哲：我去看別的。你逛你的，中午舞台有表演。']),J(L.slice(8)));
    check('2-1. 去過博覽會（出席紀錄）、只演一次',ACTIVITIES.attendedAny(H.G,'club_expo_y1s1',d6)&&H.G.flags.AA613_BELL_MET===d6&&!AA613.bellDue(GM));
    at(d6,11.5); const e2=sched(ZHE); at(d6,12); const e3=sched(ZHE);
    check('2-1. 之後阿哲 12:00 前在系籃攤位旁邊（作息），12:00 離開',e2===AA613.SCHED.zheBooth&&e3!==AA613.SCHED.zheBooth&&e3!==AA613.SCHED.zheBell,J([e2&&e2.label,e3&&e3.label]));
    H.said=[]; await CLUBFAIR.booth(GM,'basketball'); check('2-1. 之後再去系籃的攤位：「表你已經填過了」',/表你已經填過了/.test(said().join('|')),J(said()));
    goFair(); at(d6,11); H.G.zone='campus'; place(-36,12.5); H.said=[]; H.picks=['我先看看。']; await AA613.bellScene(GM);
    check('2-1. 10:30 以後才到：開頭旁白換晚到版（232fe4149 第 4 點），後面照原本',said()[0]===AA613.L.bellLate[1]&&AA613.L.bellLate[1]==='（晨思鐘。社團博覽會已經開始一陣子了，攤位前面都是人。阿哲站在系籃的攤位旁邊，手上拿著三張傳單。）'&&said()[1]==='阿哲：你來了。我先拿了一些。'&&!said().includes('（10:00，晨思鐘。阿哲已經在了，手上拿著三張傳單。）'),J(said().slice(0,2)));
    check('2-1.「我先看看。」＝沒加入、阿哲「好啦，想來再跟我說。」',!H.G.flags.CLUB_dept_basketball&&J(said().slice(8))===J(['阿哲：好啦，想來再跟我說。','阿哲：我去看別的。你逛你的，中午舞台有表演。']),J(said().slice(8)));
    fresh('2025-09-05',20.5); runAt('2025-09-05',21.2); PHONE.answer(H.G,'aa613_zhe_fair',1); at(d6,10.5); H.G.zone='campus'; place(-36,12.5);
    check('2-1. 回「我晚點自己去。」：阿哲不在晨思鐘、不演',sched(ZHE)!==AA613.SCHED.zheBell&&!AA613.bellDue(GM)); }

  /* ================= 1 沒來 ================= */
  { goFair(); runAt(d6,11.9); runAt(d6,15.9); const pre=byTag('aa613_zhe_noshow').length; runAt(d6,16); phone(); const M=byTag('aa613_zhe_noshow');
    check('1. 說了「好。」、12:00 都沒到晨思鐘：16:00 阿哲「你沒來喔？系籃我幫你填了。」（15:54 還沒有）',pre===0&&M.length===1&&M[0].text===AA613.L.noShow.dm&&M[0].h===16&&M[0].from===ZHE,J(M.map(m=>[m.h,m.text])));
    check('1. 回法「不要啦。」／「好。」；送到＝填了（CLUB_dept_basketball）',!!M[0].ask&&J(M[0].ask.opts.map(o=>o.t))===J(['不要啦。','好。'])&&H.G.flags.CLUB_dept_basketball===true);
    PHONE.answer(H.G,'aa613_zhe_noshow',0); phone(); check('1.「不要啦。」＝取消（沒加入）',!H.G.flags.CLUB_dept_basketball);
    goFair(); runAt(d6,13); runAt(d6,16.2); phone(); PHONE.answer(H.G,'aa613_zhe_noshow',1); phone(); check('1.「好。」＝照填',H.G.flags.CLUB_dept_basketball===true&&byTag('aa613_zhe_noshow').length===1);
    goFair(); H.G.flags.AA613_BELL_MET=d6; H.G.flags.CLUB_dept_basketball=undefined; runAt(d6,13); runAt(d6,16.5); check('1. 到過晨思鐘：沒有',byTag('aa613_zhe_noshow').length===0);
    goFair(); at(d6,11); H.picks=['填表']; await CLUBFAIR.booth(GM,'basketball'); runAt(d6,13); runAt(d6,16.5); check('1. 沒到晨思鐘、可是自己在攤位填了系籃：沒有',H.G.flags.CLUB_dept_basketball===true&&byTag('aa613_zhe_noshow').length===0);
    fresh('2025-09-05',20.5); runAt('2025-09-05',21.2); PHONE.answer(H.G,'aa613_zhe_fair',1); runAt(d6,13); runAt(d6,16.5); check('1. 回「我晚點自己去。」：沒有',byTag('aa613_zhe_noshow').length===0); }

  /* ================= 2-2 系籃攤位 ================= */
  { fresh(d6,10.5); H.G.zone='campus'; H.said=[]; H.picks=['先不要']; await CLUBFAIR.booth(GM,'basketball');
    check('2-2. 自己去系籃攤位：學長兩句後面多兩句，再填表',J(said())===J(['顧攤的學長：法律系的？系籃缺人。會不會打不重要，有來比較重要。','顧攤的學長：練球在映月湖旁邊的球場。','顧攤的學長：系籃是系學會的，法律系大一到大四都可以，不用甄試。名字寫這裡就好。','顧攤的學長：第五週開始，每週五。練球前一天群組會講。'])&&J(H.opts[0])===J(['填表','先不要']),J(said())); }

  /* ================= 1-3 法律資料怎麼查 ================= */
  { const L1=D('2025-09-24'), L2=D('2025-10-01'), a=ACTIVITIES.list.find(x=>x.id==='lawlib_intro_y1s1');
    check('1-3. 講座 9/24、10/1 都是週三 15:30（activities.js lawlib_intro_y1s1）',J(AA613.lecDays())===J([L1,L2])&&wd(L1)===3&&wd(L2)===3&&a.t0===15.5);
    fresh('2025-09-22',12); runAt('2025-09-22',22); runAt('2025-09-23',20.9); const pre=byTag('aa613_xc_lib_'+L1).length; runAt('2025-09-23',21); const M=byTag('aa613_xc_lib_'+L1);
    check('1-3. 9/23 21:00 芯慈私訊兩則（9/22、20:54 還沒有）',pre===0&&M.length===2&&J(tx(M))===J(AA613.L.xcLib.dm)&&M.every(m=>m.th==='p:'+XC&&m.from===XC&&m.h===21),J(M.map(m=>[m.day,m.h,m.text])));
    check('1-3. 回法「好。」／「這次先不用。」',!!M[1].ask&&J(M[1].ask.opts.map(o=>o.t))===J(['好。','這次先不用。']));
    PHONE.answer(H.G,'aa613_xc_lib_'+L1,0); check('1-3.「好。」＝AA613_XC_LIB＝9/24',H.G.flags.AA613_XC_LIB===L1);
    at(L1,15.2); const s0=sched(XC); at(L1,15+25/60); const s1=sched(XC); H.G.zone='wancai';
    check('1-3. 15:20～15:30 芯慈在法圖門口（萬才館一樓大廳）',s1===AA613.SCHED.xcDoor&&s1.zone==='wancai'&&s0!==AA613.SCHED.xcDoor,J([s0&&s0.label,s1&&s1.label]));
    place(0,5); check('1-3. 還沒走到門口：不說',!AA613.doorDue(GM)); place(-6.8,5.9); check('1-3. 走到她旁邊：說',AA613.doorDue(GM));
    H.said=[]; await AA613.doorScene(GM); check('1-3. 芯慈「這邊。」（一次）→ 之後她在討論室 A',J(said())===J(['芯慈：這邊。'])&&!AA613.doorDue(GM)&&sched(XC)===AA613.SCHED.xcLec&&sched(XC).zone==='lawlib'&&sched(XC).room==='discA',J(said()));
    at(L1,16.4); check('1-3. 16:24 還在討論室 A；16:30 以後照平常',sched(XC)===AA613.SCHED.xcLec&&(at(L1,16.5),sched(XC)!==AA613.SCHED.xcLec));
    /* 坐旁邊 */
    { at(L1,15.55); H.G.zone='lawlib'; const seats=[{x:-6.2,z:-6.8,room:'discA',lv:0},{x:-6.2,z:-6.0,room:'discA',lv:0},{x:-4.6,z:-6.8,room:'discA',lv:0},{x:-4.6,z:-6.0,room:'discA',lv:0}];
      const n={obj:{position:{x:-4.6,z:-6.8}},seat:seats[2],charId:XC}; const z0=E.zone, sit0=GM.sitAt, np0=E.npcs; let sat=null;
      E.zone={seats,roomAt:()=>null}; E.npcs=[n]; GM.npc[XC]=n; GM.sitAt=(m,st)=>{ sat=[m,st]; m.seat=st; }; E.player.seat=seats[1];
      const ok=AA613.sitBeside(GM,a); check('1-3. 坐下聽講座：她坐到你旁邊（同一邊的空位）',ok&&sat&&sat[0]===n&&sat[1]===seats[0],J(sat&&sat[1]));
      E.zone=z0; GM.sitAt=sit0; E.npcs=np0; delete GM.npc[XC]; E.player.seat=null; }
    check('1-3. 在門口碰到她了：聽講座時不出晚到的旁白',!AA613.lateDue(GM,a));
    /* 15:30 以後才到（232fe4149 第 9 點）*/
    { fresh('2025-09-23',12); runAt('2025-09-23',21.5); PHONE.answer(H.G,'aa613_xc_lib_'+L1,0); at(L1,15.6); H.G.zone='lawlib';
      const due=AA613.lateDue(GM,a); H.said=[]; await CLS.attendActivity(GM,a); const s1=said(); const due2=AA613.lateDue(GM,a);
      check('1-3. 15:30 以後才到（沒在門口碰到）：聽講座時旁白「（她看到你，指了指旁邊的空位。）」，一次',due&&s1[0]==='（她看到你，指了指旁邊的空位。）'&&AA613.L.xcLib.late==='（她看到你，指了指旁邊的空位。）'&&!s1.includes('芯慈：這邊。')&&!due2,J({due,s1:s1.slice(0,2),due2})); check('1-3. 小房間的講座（討論室 A、沒有台）：晚到「你輕輕坐下。白板前的學長已經開始講「法律資料怎麼查」了。」，不是「台上」（AA-B 11-08 01:20）',s1.includes('你輕輕坐下。白板前的學長已經開始講「法律資料怎麼查」了。')&&!s1.some(t=>/台上/.test(t)),J(s1)); }
    /* 第二場 */
    fresh('2025-09-23',12); runAt('2025-09-23',21.5); PHONE.answer(H.G,'aa613_xc_lib_'+L1,1); runAt('2025-09-30',21.1); const M2=byTag('aa613_xc_lib_'+L2);
    check('1-3. 9/24 沒去：9/30 21:00 再傳一次（同兩則）',M2.length===2&&J(tx(M2))===J(AA613.L.xcLib.dm)&&M2[0].day===L2-1,J(M2.map(m=>[m.day,m.text])));
    fresh('2025-09-23',12); runAt('2025-09-23',21.5); ACTIVITIES.markAttended((at(L1,15.6),H.G),a); runAt('2025-09-30',21.5); check('1-3. 9/24 去過了：9/30 不傳',byTag('aa613_xc_lib_'+L2).length===0);
    fresh('2025-09-23',12,{},{know:false}); runAt('2025-09-23',21.5); check('1-3. 還沒認識芯慈：不傳',byTag('aa613_xc_lib_'+L1).length===0); }

  /* ================= 1-4 社團群組、2-3 系籃 ================= */
  { const fs1={club_guitar:'2025-10-01',club_debate:'2025-09-30',club_hiking:'2025-10-02',dept_basketball:'2025-10-03'};
    check('1-4. 第一次社課：吉他 10/1（三；9/29 週一教師節補假停）、辯論 9/30（二）、登山 10/2（四）、系籃練球 10/3（五）＝第 5 週',Object.keys(fs1).every(k=>{ const d=AA613.firstSession(H.G,k); return d!=null&&key(d)===fs1[k]&&CALENDAR.termOf(d).week===5; }),J(Object.keys(fs1).map(k=>key(AA613.firstSession(H.G,k)))));
    const names={};
    for(const [k,ds] of [['club_guitar','2025-09-30'],['club_debate','2025-09-29'],['club_hiking','2025-10-01']]){ fresh('2025-09-06',13,{['CLUB_'+k]:true}); runAt(D(ds)-1,22); const pre=byTag('aa613_grp_'+k).length; runAt(ds,20.9); const pre2=byTag('aa613_grp_'+k).length; runAt(ds,21); const M=byTag('aa613_grp_'+k), g=AA613.GROUP_ID[k];
      names[g]=(PHONE.rec(H.G).groups[g]||{}).name;
      check('1-4. '+k+'：'+ds+' 21:00 社團群組（'+names[g]+'）學長一則（20:54 還沒有）',pre===0&&pre2===0&&M.length===1&&M[0].text===AA613.L.clubGrp[k]&&M[0].th==='g:'+g&&M[0].name==='學長'&&M[0].h===21,J(M.map(m=>[m.th,m.name,m.text,m.h]))); }
    check('1-4. 群組名：吉他社（照舊 guitar）、辯論社、登山社',J(['guitar','club_debate','club_hiking'].map(g=>names[g]))===J(['吉他社','辯論社','登山社']));
    fresh('2025-09-06',13); runAt('2025-09-29',21.5); runAt('2025-09-30',21.5); runAt('2025-10-01',21.5); check('1-4. 沒填過表：沒有',['club_guitar','club_debate','club_hiking'].every(k=>byTag('aa613_grp_'+k).length===0)&&!PHONE.inGroup(H.G,'club_debate'));
    /* 2-3 */
    const b=D('2025-10-03'); fresh('2025-09-06',13); runAt(b-1,20.9); const pre=byTag('aa613_ball_zhe').length; runAt(b-1,21); const M=byTag('aa613_ball_zhe');
    check('2-3. 沒加入：第一次練球前一天（10/2 週四）21:00 阿哲私訊兩則',pre===0&&M.length===2&&J(tx(M))===J(AA613.L.ball.dm)&&M.every(m=>m.th==='p:zhe'&&m.h===21)&&wd(b-1)===4,J(M.map(m=>[key(m.day),m.h,m.text])));
    check('2-3. 回法「好，我去看看。」／「這學期先不要。」',!!M[1].ask&&J(M[1].ask.opts.map(o=>o.t))===J(['好，我去看看。','這學期先不要。']));
    PHONE.answer(H.G,'aa613_ball_zhe',1); check('2-3.「這學期先不要。」→ 阿哲「OK。」',J(tx(H.G.msgs.filter(m=>m.th==='p:zhe')).slice(-2))===J(['這學期先不要。','OK。'])&&H.G.flags.AA613_BALL_GO==null);
    fresh('2025-09-06',13); runAt(b-1,21.2); PHONE.answer(H.G,'aa613_ball_zhe',0); check('2-3.「好，我去看看。」＝AA613_BALL_GO',H.G.flags.AA613_BALL_GO===b);
    fresh('2025-09-06',13,{CLUB_dept_basketball:true}); runAt(b-1,20); runAt(b-1,21); const G2=byTag('aa613_ball_grp');
    check('2-3. 已加入：同一天 21:00 系籃群組學長一則（沒有阿哲私訊）',G2.length===1&&G2[0].text===AA613.L.ball.grp&&G2[0].th==='g:dept_basketball'&&G2[0].name==='學長'&&G2[0].h===21&&(PHONE.rec(H.G).groups.dept_basketball||{}).name==='系籃'&&byTag('aa613_ball_zhe').length===0,J(G2.map(m=>[m.th,m.text])));
    fresh('2025-09-06',13,{MET_ZHE:false}); runAt(b-1,21.2); check('2-3. 不認識阿哲：沒有私訊',byTag('aa613_ball_zhe').length===0); }

  /* ================= 2-4 第一次到球場 ================= */
  { const b=D('2025-10-03'), a=ACTIVITIES.list.find(x=>x.id==='dept_basketball');
    let pre=null; const go=async(fl)=>{ fresh('2025-09-06',13,fl); at(b,17.6); H.G.zone='campus'; H.said=[]; pre=sched(ZHE); await CLS.attendActivity(GM,a); return said(); };
    let L=await go({AA613_BALL_GO:b});
    check('2-4. 2-3 選「好，我去看看。」、阿哲在場：學長兩句 → 阿哲「我就說吧。」→ 記 CLUB_dept_basketball',J(L.slice(0,3))===J(['學長：新來的？大一？','學長：名字寫這裡。之後每週五，有空就來。','阿哲：我就說吧。'])&&H.G.flags.CLUB_dept_basketball===true&&!L.includes('（你在場邊填了表。）'),J(L));
    check('2-4. 前置：阿哲那時候的作息在球場（同一區）',!!pre&&pre.zone==='campus'&&pre.activity==='dept_basketball');
    L=await go({}); check('2-4. 沒說「好，我去看看。」：學長兩句、沒有阿哲那句',J(L.slice(0,2))===J(['學長：新來的？大一？','學長：名字寫這裡。之後每週五，有空就來。'])&&!L.includes('阿哲：我就說吧。')&&H.G.flags.CLUB_dept_basketball===true,J(L));
    L=await go({CLUB_dept_basketball:true,AA613_BALL_GO:b}); check('2-4. 填過表的：沒有這幾句',!L.some(t=>/新來的|我就說吧/.test(t)),J(L)); }

  /* ================= 開學典禮 ================= */
  { const run=async(know)=>{ fresh('2025-08-31',13.9,{KAI_MOVEIN:true},{know:false}); if(know) SOCIAL.remember(BH,'FIRST_MET',''); at('2025-08-31',14); H.said=[]; await STORY.ceremonyY1(GM); return said(); };
    let L=await run(true); const i=L.indexOf('（你和柏翰一起走過去。）'), j=L.indexOf('四千多個新生，每個人都穿著同一件新生上衣。');
    check('典禮. 8/31 14:00 自動流程：開頭「（你和柏翰一起走過去。）」（在「四千多個新生…」前面）',i===0&&j===1,J(L));
    L=await run(false); check('典禮. 還沒認識柏翰：沒有這一句',!L.includes('（你和柏翰一起走過去。）')&&L[0]==='四千多個新生，每個人都穿著同一件新生上衣。',J(L)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

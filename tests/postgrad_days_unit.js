// 畢業以後的每一天都不會壞（AA_319；src/postgrad3d.js）——不需要瀏覽器。
//   A. 2029-06-01 到 2034-06-04 每一天、一天八個時間：STORY.tick、手機規則、PG.rules、作息、課表、床的選項——不丟例外、不印警告
//      （課表 Y4S2 只到 6/10、學期表只到大四：之後 termOf＝null；STORY.dayOfKey 只到第 2200 天，PG 自己算日子）。
//   B. 從 6/1 晚上睡覺一路「跳到下一件事」到尾聲：四種玩法（交往中 2029 沒過、單身 2029 考上、日本交換延畢、沒報名），
//      次數有上限、時間只往前、每一段照順序演、演完回標題（EPILOGUE_DONE）。用法：node tests/postgrad_days_unit.js
const H=require('./pg_harness.js'); const {check}=H;
const warns=[]; const ow=console.warn; console.warn=(...a)=>{ warns.push(a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,3).join(' / '):String(x)).join(' ')); };
const rej=[]; process.on('unhandledRejection',e=>rej.push(String(e&&e.stack||e)));
const GM=H.GM; GM.spawnCharacter=()=>null;   /* 作息的人物生出來（假的 GM 不需要 3D 人物）*/
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });
const FRIENDS=['zhe','yu','classmate_bohan','classmate_xinci','classmate_mingxuan','classmate_peishan','npc_fangyt','heroine_01','heroine_02','heroine_03','heroine_04','heroine_05'];
(async()=>{
  // ---- A. 每一天 ----
  { const G=H.fresh('2029-06-01',0.5,'dorm',{BAR_REG:true,LAWCLUB_SAT_VISITS:10}); FRIENDS.forEach(H.FRIEND); H.FRIEND('kexin'); H.date('kexin');
    PHONE.join(G,'noodle_team','麵店團'); PHONE.join(G,'home','家人');
    const d0=PG.DK('2029-06-01'), d1=PG.DK('2034-06-04'), HOURS=[0.5,7,9.5,12,15,18,20.5,23.5], ZONES=['dorm','campus','cafe','gongguan','noodle','library_hall'];
    let errs=[], calls=0, pgOff=[], termAfter=0; warns.length=0;
    for(let d=d0; d<=d1; d++){
      if(d===PG.gradDay()+1&&!G.flags.GRADUATED){ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; }   /* 拍照那一段在 graduation_unit 測 */
      for(const h of HOURS){ PG.setT(G,H.E,d,h); G.zone=ZONES[(d+HOURS.indexOf(h))%ZONES.length]; H.E.player.busy=false; GM.D.active=false;
        try{ STORY.tick(GM,0.5); STORY.phoneRules(GM); PHONE.tick(G); PG.rules(GM); PG.nextStop(G); PG.due(G); STORY.bedOptions(G); CLS.dayItems(G); CLS.next(G); CLS.todayLine(G); CALENDAR.termOf(d); CALENDAR.kind(d); CALENDAR.holiday(d); calls++; }
        catch(e){ errs.push(PG.dateLabel(d,h)+' '+(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); }
        if(G.flags.GRADUATED&&d<PG.DK('2034-06-03')&&!PG.on(G)) pgOff.push(PG.dateLabel(d,h)); }
      if(d>PG.DK('2029-06-10')&&CALENDAR.termOf(d)) termAfter++;
      if(d%7===0||d===d1){ PG.setT(G,H.E,d,12); for(const id in CHARACTERS){ try{ STORY.schedEnt(CHARACTERS[id],G); STORY.whereIs(GM,id); if(STORY.presence) STORY.presence(id,G); }catch(e){ errs.push(PG.dateLabel(d,12)+' '+id+' '+(e&&e.stack||e).split('\n')[0]); } } } }
    await new Promise(r=>setTimeout(r,50));
    check('A. 2029-06-01～2034-06-04 每天八個時間：STORY.tick、手機規則、PG、課表、床、作息都不丟例外',!errs.length,errs.length+' 個　'+errs.slice(0,3).join('｜'));
    check('A. 沒有印出警告（被吞掉的錯誤）、沒有未處理的 Promise',!warns.length&&!rej.length,warns.slice(0,3).join('｜')+rej.slice(0,2).join('｜'));
    check('A. 跑了 '+calls+' 次（每天 8 次）',calls===(d1-d0+1)*8);
    check('A. 6/10 以後沒有學期（termOf null）＝不會再有課',termAfter===0);
    check('A. 畢業以後一直到尾聲那天都是畢業後篇（PG.on）',!pgOff.length,pgOff.slice(0,3).join('、'));
    check('A. 2034 年的日子 PG.DK 自己算（STORY.dayOfKey 到不了）',PG.DK('2034-06-03')===3182&&CALENDAR.dateOf(3182).wd===6); }
  // ---- B. 一路跳到尾聲 ----
  const sim=async(name,flags,setup,o)=>{ o=o||{}; const G=H.fresh('2029-06-01',22,'dorm',flags); FRIENDS.forEach(H.FRIEND); if(setup) setup(G);
    PHONE.join(G,'noodle_team','麵店團'); PHONE.join(G,'home','家人');
    warns.length=0; rej.length=0; const order=[], stops=[]; let mono=true, it=0, err=null, sleeps=0;
    const ran=new Set(); const orun=PG.runStep; PG.runStep=async function(GM,s){ const r=await orun.call(PG,GM,s); if(r){ order.push(s.id); ran.add(s.id); } return r; };
    try{
      const sj=await PG.sleepJump(GM); stops.push('sleep→'+PG.dateLabel(G.day,G.hour));
      if(!PG.familyModule()) check(name+'：6/1 晚上睡覺＝睡到 6/2 早上 08:00（不會睡過典禮）',sj===true&&G.day===PG.gradDay()&&G.hour===8);
      for(it=0; it<120&&!G.flags.EPILOGUE_DONE; it++){ const before=G.day*24+G.hour;
        const ns=PG.nextStop(G), ex=PG.byId('exam_2029'); if(o.score!=null&&!PG.done(G,'exam_2029')&&ex.cond(G)&&(PG.due(G)===ex||(ns!=null&&Math.abs(ns-ex.at(G))<1e-6))) H.picks=answerK(PG.draw(G,2029),o.score);
        if(OUT.due(G)){ H.picks=[0]; await OUT.tick(GM); }
        else { const s=PG.due(G); if(s) await PG.runStep(GM,s);
          else if(o.sleep&&it%2){ sleeps++; if(!await PG.sleepJump(GM)){ stops.push('sleep none'); break; } }
          else if(!await PG.advance(GM)){ stops.push('none'); break; } }
        if(G.day*24+G.hour<before-1e-6) mono=false; }
    }catch(e){ err=e; } finally { PG.runStep=orun; }
    await new Promise(r=>setTimeout(r,50));
    check(name+'：不丟例外、沒有警告、沒有未處理的 Promise',!err&&!warns.length&&!rej.length,(err&&err.stack||'')+warns.slice(0,3).join('｜')+rej.slice(0,2).join('｜'));
    check(name+'：'+it+' 次就到尾聲（上限 80）、時間只往前、演完回標題',G.flags.EPILOGUE_DONE===true&&it<=80&&mono&&!PG.on(G),it+' 次　'+stops.join(' '));
    return {G,order,ran,sleeps}; };
  { const {G,order}=await sim('B1 和可昕交往、2029 一試沒過（全部選第一個）',{BAR_REG:true,LAWCLUB_SAT_VISITS:10},()=>{ H.FRIEND('kexin'); H.date('kexin'); });
    const want=['grad','cafe','b1','exam_2029','r1_2029','an1','an2','exam_2030','r1_2030','first','e2a_2030','e2b_2030','r2_2030','epi'];
    check('B1. 順序：典禮 → Café → B1 → 2029 一試 → 放榜 → 以安的電話 → 2030 再考 → 第一份工作（還在準備二試）→ 二試 → 放榜 → 尾聲',want.every((id,i)=>order.indexOf(id)>=0&&(i===0||order.indexOf(id)>order.indexOf(want[i-1]))),order.join(' → '));
    check('B1. 2029 沒有二試；2030 考上（BAR_YEAR 2030）；第一份工作是補習班的自習室',!order.includes('e2a_2029')&&G.flags.BAR_YEAR===2030&&H.msgs('g:noodle_team').includes('📷（照片：補習班的自習室。）'));
    check('B1. 可昕的畢業典禮（6/9）去了',OUT.get(G,'pg_kx_grad')&&OUT.get(G,'pg_kx_grad').state==='done'); }
  { const {G,order}=await sim('B2 單身、2029 考上（答對 17）',{BAR_REG:true,LAWCLUB_SAT_VISITS:10},null,{score:17,sleep:true});
    const want=['grad','b1','exam_2029','r1_2029','e2a_2029','e2b_2029','r2_2029','an1','an2','first','epi'];
    check('B2. 順序：典禮 → B1 → 一試 → 放榜 → 二試兩天 → 12/14 放榜 → 以安的電話 → 第一份工作 → 尾聲（睡覺、站著不動交替）',want.every((id,i)=>order.indexOf(id)>=0&&(i===0||order.indexOf(id)>order.indexOf(want[i-1])))&&!order.some(id=>/2030/.test(id)),order.join(' → '));
    check('B2. BAR_YEAR 2029、司法官一試也過（17 題）、第一份工作是法扶',G.flags.BAR_YEAR===2029&&G.flags.BAR_STAGE_2029==='both'&&H.msgs('g:noodle_team').includes('📷（照片：法律扶助基金會的櫃台。名牌上的字還是新的。）'));
    check('B2. 12/14 的麵店（出遊）去了；尾聲祐廷「我在法扶。這禮拜開了三個庭。」',OUT.get(G,'pg_bar_noodle_2029')&&OUT.get(G,'pg_bar_noodle_2029').state==='done'&&H.has('我在法扶。這禮拜開了三個庭。')); }
  { const {G,order}=await sim('B3 日本交換延畢',{EXCHANGE_ROUTE:'JP',LAWCLUB_SAT_VISITS:10},()=>{ H.FRIEND('kexin'); H.date('kexin'); });
    check('B3. 2029 沒有考試（只有群組＋「（明年八月，換你。）」），2030 一試 → 第一份工作（補習班）→ 二試 → 放榜 → 尾聲',!order.includes('exam_2029')&&order.includes('late_2029')&&order.indexOf('exam_2030')<order.indexOf('first')&&order.indexOf('first')<order.indexOf('e2a_2030')&&order.indexOf('r2_2030')<order.indexOf('epi')&&G.flags.BAR_YEAR===2030,order.join(' → ')); }
  { const {G,order}=await sim('B4 沒報名國考',{BAR_REG:false,LAWCLUB_SAT_VISITS:10});
    check('B4. 沒有任何考試；第一份工作（NGO 的白板）→ 尾聲',!order.some(id=>/^(exam|r1|e2|r2|b1)/.test(id))&&order.includes('first')&&order.includes('epi')&&G.flags.BAR_YEAR==null&&H.msgs('g:noodle_team').includes('📷（照片：NGO 辦公室的白板。上面是你寫的第一個個案。）'),order.join(' → ')); }
  // ---- 尾聲以後 ----
  { const G=H.fresh('2034-06-03',22,'cafe',{EPILOGUE_DONE:true,FIRST_DAY_SEEN:true}); G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; PG.rec(G).done.first=1; PG.rec(G).done.epi=1;
    check('C. 尾聲以後：不是畢業後篇、床照舊、沒有下一件事會演',!PG.on(G)&&!PG.bedOptions(G)&&!PG.due(G));
    warns.length=0; let e=null; try{ PG.tick(GM); STORY.tick(GM,0.5); }catch(x){ e=x; } check('C. 尾聲以後的 tick 不壞',!e&&!warns.length,(e&&e.stack)||warns.join('｜')); }
  { const G=H.fresh('2029-05-20',22,'dorm',{}); check('C. 畢業以前（還沒拍照）：睡覺照舊（不攔）',!PG.on(G)&&!PG.bedOptions(G)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

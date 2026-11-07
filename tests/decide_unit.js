// 選項會改變故事（BB_305 第 10 節 10-1、10-2、10-5；STUDY-DATE-PROGRESS-1107、USER_WANTS X263）——引擎部分，不需要瀏覽器（D131）。
// 使用者 11-07 06:2x～06:4x 對 BB-B：「我想要的是我的選項會改變故事」「如果真的影響能不能交往的選項 應該要有 小心選擇的提示」
// 檢查（AA 的分岔稿還沒到：用測試自己做的一拍）：
//   1 決定拍：選 A／選 B 記不同的 DECIDE；記了不再改；dec: 條件（故事線的 after、alt）跟著換
//   2 closes：被錯過的那一拍不演、下一拍接著；opens：地點打開（STUDY_UNLOCK）、旗標
//   3 key:true 那一組：選單上方一行字、選完問「確定嗎？」；「再想想」回到同一組、不記；「確定」才記
//   4 一般選項：沒有提示、沒有確認
//   5 舊存檔沒有 DECIDE：照 DEFAULT
//   6 她不會都聽你的（10-6）：有表（RULES）就照表算，不是照你選的
//   7 AA_719 的 14 個決定拍（3788d00c1）：子晴 ZQ-1（contrary）tease＋信任低＝intern、四天後她說「我想了想，還是去了我爸說的那間。」（見面先說；三天沒見＝傳訊息）；
//     space＝照她自己的（game）；push:game＋信任低＝game 但「我自己決定的。」；語彤 YT-1 過了大一下第 9 週＝found；關鍵的那一組上方一行字照 AA 的 keyNote
// 修改前全部 FAIL（沒有 DECIDE）。用法：node tests/decide_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
loadG('src/data/heroine_arcs.js',['HEROINE_ARCS']); loadG('src/data/arc_rot.js',['ARC_ROT']); const okR=loadG('src/data/decide_rules.js',['DECIDE_RULES']); const ok=loadG('src/decide3d.js',['DECIDE']); loadG('src/arcs3d.js',['ARCS']);
const ZQ='heroine_04', who={name:'高子晴',charId:ZQ};
const optsSeen=[], notes=[]; const C0=GM.choose; GM.choose=async(o,opt)=>{ optsSeen.push(o.map(q=>q.t)); notes.push(opt&&opt.note||null); return C0(o,opt); };
const fresh=()=>{ const G=H.fresh('2026-04-13',15,'cafe'); optsSeen.length=0; notes.length=0; return G; };
/* 測試用的一拍（照 BB_305 10-1 的例子：子晴的暑假）*/
const BEAT={n:1,need:1,lines:['暑假的實習，我拿到了。'],ask:['……你覺得我要去嗎？'],keyNote:'（她在等你說什麼。）',opts:[
  {t:'去吧，履歷會好看。',rel:{},reply:['……喔。'],decide:{key:'summer',value:'intern'},stance:'push:intern',key:true,closes:['beat:3']},
  {t:'妳想做遊戲，就做遊戲。',rel:{},reply:['嗯。'],decide:{key:'summer',value:'game'},stance:'support',key:true,opens:['place:wz_offbeat','flag:ZQ_SUMMER_GAME']}]};
const PLAIN={n:2,need:1,lines:['今天好熱。'],ask:['你喜歡夏天嗎？'],opts:[{t:'喜歡。',rel:{},reply:['我也是。']},{t:'不喜歡。',rel:{},reply:['……我也是。']}]};
(async()=>{
  check('0. DECIDE 存在',ok&&typeof DECIDE!=='undefined'&&!!DECIDE.choose);
  if(!ok){ H.done(); return; }
  /* 3 確認 + 1 記決定 */
  { const G=fresh(); H.picks=[0,1,1,0]; const k=await ARCS.run(GM,who,ZQ,BEAT);
    check('3. key 那一組：選單上方一行字（keyNote）、選完問「確定嗎？」；按「再想想」回到同一組重選',notes[0]==='（她在等你說什麼。）'&&J(optsSeen[1])===J(['確定','再想想'])&&notes[1]==='確定嗎？'&&J(optsSeen[2])===J(optsSeen[0])&&optsSeen.length===4,J({optsSeen,notes}));
    check('1. 第一次選「去吧」、再想想；第二次選「做遊戲」、確定＝記 summer＝game（不是 intern）',k===1&&DECIDE.get(G,ZQ,'summer')==='game'&&G.flags.DECIDE[ZQ].summer.stance==='support',J(G.flags.DECIDE));
    check('2. opens：地點 wz_offbeat 打開（STUDY_UNLOCK）、旗標 ZQ_SUMMER_GAME',G.flags.STUDY_UNLOCK&&G.flags.STUDY_UNLOCK.wz_offbeat===G.day&&G.flags.ZQ_SUMMER_GAME===G.day,J(G.flags.STUDY_UNLOCK));
    check('1. dec: 條件：dec:heroine_04.summer=game 成立、=intern 不成立、!=intern 成立',ARCS.cond(G,'dec:heroine_04.summer=game')&&!ARCS.cond(G,'dec:heroine_04.summer=intern')&&ARCS.cond(G,'dec:heroine_04.summer!=intern'));
    const before=J(G.flags.DECIDE); DECIDE.apply(G,ZQ,BEAT.opts[0]); check('1. 記了不再改：之後再選 intern，還是 game',J(G.flags.DECIDE)===before); }
  /* 2 closes */
  { const G=fresh(); H.picks=[0,0]; await ARCS.run(GM,who,ZQ,BEAT); const r=ARCS.rec(G,ZQ); r.k=3; r.last=null;
    const B4=HEROINE_ARCS.people[ZQ].beats[3]; const DS=DATE.stageNum; DATE.stageNum=()=>9; G.day=Math.max(G.day,B4.from?ARCS.dayOf(B4.from):0); G.flags[(B4.after||'').replace(/^flag:/,'')||'_none']=G.day; const p=ARCS.pick(G,ZQ,{kind:'cafe'}); DATE.stageNum=DS;   /* 第 4 拍自己的階段、日期、after 先滿足 */
    check('2. closes beat:3：第 3 拍不演、記 missed，接著第 4 拍',DECIDE.get(G,ZQ,'summer')==='intern'&&r.missed.includes(3)&&p&&p.n===4,J({missed:r.missed,p:p&&p.n})); }
  /* 4 一般選項 */
  { const G=fresh(); H.picks=[1]; await ARCS.run(GM,who,ZQ,PLAIN);
    check('4. 一般選項：沒有上方那一行、沒有確認（只出一次選單）',optsSeen.length===1&&notes[0]===null,J({optsSeen,notes})); }
  /* 5 舊存檔 */
  { const G=fresh(); delete G.flags.DECIDE; const D0=DECIDE.DEFAULT[ZQ]; DECIDE.DEFAULT[ZQ]=Object.assign({},D0,{summer:'game'}); let err=null, v=null; try{ v=DECIDE.get(G,ZQ,'summer'); }catch(e){ err=e; }
    check('5. 舊存檔沒有 DECIDE：照 DEFAULT（game），條件照算',!err&&v==='game'&&ARCS.cond(G,'dec:heroine_04.summer=game'),String(err)); DECIDE.DEFAULT[ZQ]=D0; }
  /* 6 表 */
  { const G=fresh(); DECIDE.RULES[ZQ]={summer:{fn:(G,o)=>o.stance&&o.stance.indexOf('push:')===0?'game':null}}; H.picks=[0,0]; await ARCS.run(GM,who,ZQ,BEAT);
    check('6. 有表（contrary）：你 push:intern，她決定 game（不是照你選的）',DECIDE.get(G,ZQ,'summer')==='game',J(G.flags.DECIDE)); delete DECIDE.RULES[ZQ]; }
  /* 7 AA_719 */
  { const cp=require('child_process'); let out='', okI=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_decide_rules.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); okI=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('7. src/data/decide_rules.js 和 AA_719@3788d00c1 一致；14 個決定拍、七位各 2、預設值登記好',okR&&okI&&DECIDE_RULES.keys.length===14&&DECIDE.get(H.fresh('2026-04-13',15,'cafe'),'heroine_04','summer')==='game',out.trim().slice(0,160));
    const E1=DECIDE.byKey(ZQ,'summer'), B8=HEROINE_ARCS.people[ZQ].beats[E1.beat-1], it=i=>E1.opts.findIndex(o=>o.i===i);
    const run=async(stance,trust)=>{ const G=fresh(); const R=SOCIAL.rel(ZQ); R.trust=trust; R.fam=50; const DS=DATE.stageNum; DATE.stageNum=()=>3; const k=E1.opts.find(o=>o.stance===stance).i; H.picks=[k,0]; H.said=[]; const b=ARCS.resolve(G,ZQ,B8); await ARCS.run(GM,who,ZQ,b); DATE.stageNum=DS; return {G,b}; };
    { const {G,b}=await run('tease',5); const x=DECIDE.due(G,ZQ); 
      check('7. 子晴 summer（contrary）：tease＋信任低＝她最後去實習（intern）；當天不說',DECIDE.get(G,ZQ,'summer')==='intern'&&!x&&G.flags.DECIDE_SAY.length===1&&G.flags.DECIDE_SAY[0].due===G.day+4,J({v:DECIDE.get(G,ZQ,'summer'),say:G.flags.DECIDE_SAY}));
      check('7. 關鍵的那一組：上方那一行是 AA 的 keyNote、選完有確認',b.keyNote===E1.keyNote&&notes[0]===E1.keyNote&&J(optsSeen[1])===J(['確定','再想想']),J({kn:b.keyNote,notes}));
      G.day+=4; const y=DECIDE.due(G,ZQ); H.said=[]; await DECIDE.playDue(GM,who,ZQ,y);
      check('7. 四天後下次見面：她先說「我想了想，還是去了我爸說的那間。」，只說一次',y&&H.said.some(s=>s.t==='我想了想，還是去了我爸說的那間。')&&!DECIDE.due(G,ZQ),J(H.said)); }
    { const {G}=await run('tease',5); G.day+=7; const n0=(G.msgs||[]).length; STORY.phoneRules(GM); PHONE.tick(G);
      check('7. 四天後三天都沒見面：她傳訊息（只傳她說的）',(G.msgs||[]).slice(n0).some(m=>m.text==='我想了想，還是去了我爸說的那間。')&&!DECIDE.due(G,ZQ),J((G.msgs||[]).slice(-2))); }
    { const {G}=await run('space',5); check('7. space＝照她自己的（game）、自在和信任加',DECIDE.get(G,ZQ,'summer')==='game'&&G.flags.DECIDE[ZQ].summer.stance==='space'); }
    { const {G}=await run('push:game',5); const x=G.flags.DECIDE_SAY[0];
      check('7. push:game＋信任低：還是 game，但兩天後「我自己決定的。」「不是因為你說。」',DECIDE.get(G,ZQ,'summer')==='game'&&x&&x.say[0]==='我自己決定的。'&&x.due===G.day+2,J(x)); }
    { const YT='heroine_03', E2=DECIDE.byKey(YT,'mom'), B4=HEROINE_ARCS.people[YT].beats[E2.beat-1]; const G=fresh(); G.day=ARCS.dayOf('Y1S2W9')+1; H.picks=[0,0]; await ARCS.run(GM,{name:'陳語彤',charId:YT},YT,ARCS.resolve(G,YT,B4));
      check('7. 語彤 YT-1：過了大一下第 9 週才演到那一拍＝found（媽媽自己發現），不照規則',DECIDE.get(G,YT,'mom')==='found'&&G.flags.DECIDE[YT].mom.late===true,J(G.flags.DECIDE)); } }
  /* 8 信任門檻（BB-B 06:50：need 4 的拍原本幾乎都是 hi）*/
  { const G=fresh(); const R=SOCIAL.rel(ZQ); const DS=DATE.stageNum; const at=(st,t)=>{ DATE.stageNum=()=>st; R.trust=t; return DECIDE.trustHi(G,ZQ); };
    const r=[at(4,45),at(4,59),at(4,60),at(3,39),at(3,40),at(2,90)]; DATE.stageNum=DS;
    check('8. 信任門檻照階段：好朋友 trust 45／59＝低、60＝高；朋友 39＝低、40＝高；朋友以前＝低（need 4 的拍兩邊都碰得到）',J(r)===J([false,false,true,false,true,false]),J(r)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });

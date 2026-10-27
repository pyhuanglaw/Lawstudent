// AA_472 畢業以後讀一遍（臺灣路線八種存檔；企劃線 1ebcf530e；任務 PG-FIX-471-473-1027）——不需要瀏覽器。
//   1 學姊 9/7 15:20「明年。……讀書計畫你先排，我幫你看。」（原本「我幫你排」，和 2030 字卡「你自己排」打架；字卡不動）
//   2 2030 第二次考的便條一張只寫一句「（便條：「你比去年多念了一年。」）」
//   3 可昕交往第六年（2030-10-17）：地點照第五年（沒有邀約那一則）、地點之後一句（第五年選了「寫什麼？」的換一句）、禮物照第二～五年、卡片在祐廷手上那一段、沒去＝22:00 私訊
//   4 芷若 6/2 視訊兩句（時差更正）
//   5 學姊交往中、2030 第二次考的考場那一句換成「同一家便利商店。……我坐去年那個位子。」（2029 照舊；去年她沒在便利商店等的照原句）
//   6 沛珊 2030-06「說好的，運河一圈。……」（AA_367 白名單改 1ebcf530、重新匯入 pg_dates.js）
// 每一節都逐字對稿（git 讀企劃線 1ebcf530e 的 AA_472、AA_367）。修改前（243db0938）的結果見檔尾。用法：node tests/aa472_pg_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.CG_REGISTRY=global.CG_REGISTRY||{};
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|FD|PG_DATES|PGDATE|ROM1016)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/data/pg_dates.js','src/pgdates3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const git=(sha,f)=>{ try{ return cp.execFileSync('git',['-C',H.ROOT,'-c','core.quotepath=false','show',sha+':'+f],{encoding:'utf8'}); }catch(e){ return ''; } };
const DOC=git('1ebcf530e','docs/story_planning/AA_472_畢業以後讀一遍_臺灣路線八種存檔_讀書計畫誰排_可昕第六年.md');
const D367=git('1ebcf530e','docs/story_planning/AA_367_畢業以後的交往節奏_六位.md');
const sec=n=>{ const a=DOC.indexOf('\n## '+n+'.'), b=DOC.indexOf('\n## ',a+4); return a<0?'':DOC.slice(a,b<0?undefined:b); };
const D=H.D;
const tsec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const grad=(key,h,flags)=>{ const G=H.fresh(key,h==null?10:h,'dorm',Object.assign({GRADUATED:D('2029-06-02'),GRAD_DONE:true,MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:D('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true},flags||{}));
  G.acts={att:{}}; G.outings=[]; PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1; return G; };

(async()=>{
check('0. 讀得到企劃線 1ebcf530e 的 AA_472、AA_367',DOC.length>1000&&DOC.includes('## 3. 可昕的第六年')&&D367.includes('說好的，運河一圈。'));

/* ======================= 1. 學姊 9/7「讀書計畫你先排，我幫你看。」======================= */
await tsec(1,async()=>{ const NEW='明年。……讀書計畫你先排，我幫你看。';
  check('1. 稿：「學姊：'+NEW+'」；字卡「你自己排」不動',sec(1).includes('> 學姊：'+NEW)&&PG.CARDS_2030.some(r=>r[3]==='（考前三個禮拜。這次的讀書計畫表，你自己排。）'));
  const G=grad('2029-09-07',15.1,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5,BAR_STAGE_2029:'none'}); H.FRIEND('heroine_05'); H.tick(); H.at('2029-09-07',15.4); H.tick();
  check('1. 2029 一試不到 12 題、學姊 FRIEND 以上：15:20 私訊「'+NEW+'」（不再是「我幫你排」）',J(H.msgs('p:heroine_05'))===J([NEW]),J(H.msgs('p:heroine_05'))); });

/* ======================= 2. 2030 第二次考的便條：一張一句 ======================= */
await tsec(2,async()=>{ const NOTE='（便條：「你比去年多念了一年。」）';
  check('2. 稿：「'+NOTE+'」',sec(2).includes('> '+NOTE));
  const G=grad('2030-08-02',20.6,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5,BAR_STAGE_2029:'none'}); H.FRIEND('heroine_05'); H.tick(); H.at('2030-08-02',21.1); H.tick();
  check('2. 重考、學姊 FRIEND 以上（單身）：8/2 21:00 照片＋「'+NOTE+'」（沒有「早點睡。」）',J(H.msgs('p:heroine_05'))===J(['（照片：一張手寫的便條）',NOTE]),J(H.msgs('p:heroine_05')));
  const G2=grad('2030-08-03',8,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5,BAR_STAGE_2029:'none',SIS_STORE_2029:true}); H.FRIEND('heroine_05'); H.date('heroine_05'); H.picks=new Array(20).fill(0); await H.run('exam_2030');
  check('2. 重考、和學姊交往中＝考場門口當面：旁白一句「'+NOTE+'」',H.has(NOTE)&&!H.said.some(x=>/早點睡。」「你比去年/.test(x.t)),J(H.lines().slice(0,3))); });

/* ======================= 4. 芷若 6/2 視訊兩句（時差）======================= */
await tsec(4,async()=>{ const V=['這裡早上五點。……學士服是不是借太大件？','天已經亮了。你們拍完我再睡。'], OLD=['這裡凌晨三點。……學士服是不是借太大件？','再一個多小時這裡就天亮了。你們拍完我再睡。'];
  check('4. 稿：兩句（林芷若）',V.every(t=>sec(4).includes('> 林芷若：'+t)));
  const G=H.fresh('2029-06-01',22.4,'dorm'); H.FRIEND('heroine_02'); H.date('heroine_02'); H.at('2029-06-02',8); await STORY.gradFamily(GM);
  const said=H.said.filter(x=>x.who===SOCIAL.datingName('heroine_02')||x.who===SOCIAL.displayName('heroine_02')).map(x=>x.t);
  check('4. 交往中、她在英國：典禮的視訊兩句照稿；原本那兩句不再出現',V.every(t=>said.includes(t))&&!OLD.some(t=>H.has(t))&&said.indexOf(V[0])<said.indexOf(V[1]),J(said));
  H.said=[]; await H.run('grad'); check('4. 拍照那一段不再視訊一次（「我設了鬧鐘。」那一晚照舊）',!V.some(t=>H.has(t))&&POSTGRAD_LINES.PARTNER.heroine_02.eve==='我設了鬧鐘。'); });

/* ======================= 5. 學姊交往中，2030 第二次考的考場那一句 ======================= */
await tsec(5,async()=>{ const L29='我在對面的便利商店等。考完先傳訊息。', L30='同一家便利商店。……我坐去年那個位子。';
  check('5. 稿：2030「書瑀：'+L30+'」、2029 照舊',sec(5).includes('> 書瑀：'+L30)&&sec(5).includes('> 書瑀：'+L29));
  /* 2029 和學姊交往中、一試考了、沒過；2030 再考 */
  const G=grad('2029-08-04',8,{BAR_REG:true}); H.FRIEND('heroine_05'); H.date('heroine_05'); H.picks=new Array(20).fill(0); await H.run('exam_2029');
  check('5. 2029-08-04：「'+L29+'」照舊、記 SIS_STORE_2029',H.has(L29)&&!H.has(L30)&&G.flags.SIS_STORE_2029===true);
  G.flags.BAR_SCORE_2029=3; G.flags.BAR_STAGE_2029='none'; H.at('2030-08-03',8); H.said=[]; H.picks=new Array(20).fill(0); await H.run('exam_2030');
  check('5. 2030-08-03（第二次考）：「'+L30+'」（說話的人是書瑀）',H.said.some(x=>x.t===L30&&x.who===SOCIAL.datingName('heroine_05'))&&!H.has(L29),J(H.lines().slice(0,4)));
  /* 舊存檔：2029 考過、沒有 SIS_STORE_2029，這一段交往從 2029-08-04 以前就開始 */
  const G2=grad('2030-08-03',8,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:3,BAR_STAGE_2029:'none'}); H.FRIEND('heroine_05'); H.date('heroine_05'); G2.flags.romance.heroine_05.sinceDay=D('2028-12-01'); H.picks=new Array(20).fill(0); await H.run('exam_2030');
  check('5. 舊存檔（沒有 SIS_STORE_2029、2028 就在交往）：2030 也換句',H.has(L30)&&!H.has(L29));
  /* 2029 一試以後才交往的（去年她沒在便利商店等）：照原句 */
  const G3=grad('2030-08-03',8,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:3,BAR_STAGE_2029:'none'}); H.FRIEND('heroine_05'); H.date('heroine_05'); G3.flags.romance.heroine_05.sinceDay=D('2029-11-01'); H.picks=new Array(20).fill(0); await H.run('exam_2030');
  check('5. 2029 一試以後才交往：2030 照原句「'+L29+'」',H.has(L29)&&!H.has(L30));
  const G4=grad('2030-08-03',8,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:3,BAR_STAGE_2029:'none',SIS_STORE_2029:false}); H.FRIEND('heroine_05'); H.date('heroine_05'); H.picks=new Array(20).fill(0); await H.run('exam_2030');
  check('5. 2029 那天沒有說（SIS_STORE_2029 false）：照原句',H.has(L29)&&!H.has(L30));
  /* 交換延畢（2030 第一次考）：照原句 */
  const G5=grad('2030-08-03',8,{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true}); H.FRIEND('heroine_05'); H.date('heroine_05'); H.picks=new Array(20).fill(0); await H.run('exam_2030');
  check('5. 交換延畢（第一次考）：照原句',H.has(L29)&&!H.has(L30)&&!G5.flags.SIS_STORE_2029); });

/* ======================= 6. 沛珊 2030-06：運河一圈 ======================= */
await tsec(6,async()=>{ const NEW='說好的，運河一圈。……下學期就大四了，我開始寫教檢的考古題。你以前也是這樣嗎？';
  check('6. 稿：AA_472「郭沛珊：'+NEW+'」、AA_367（1ebcf530e）2030-06 那一格（台南）',sec(6).includes('> 郭沛珊：'+NEW)&&D367.includes('| 2030-06 | 「'+NEW+'」（台南） |'));
  const row=(PG_DATES.six.classmate_peishan||[]).find(x=>x.ym==='2030-06'), ev=STORY_EVENTS.find(e=>e.id==='ev_pg_date_classmate_peishan_2030-06'), ln=ev&&ev.dialogue.find(l=>l.speaker==='classmate_peishan');
  check('6. pg_dates.js（重新匯入）與那一格的事件：2030-06 那一句、台南',!!row&&row.line===NEW&&row.note==='台南'&&!!ln&&ln.text===NEW,J([row,ln&&ln.text]));
  check('6. 2030-04 視訊那一句照舊（「下次你來，我們走一圈好不好？」）',((PG_DATES.six.classmate_peishan||[]).find(x=>x.ym==='2030-04')||{}).line==='運河那邊晚上很漂亮！下次你來，我們走一圈好不好？');
  check('6. 匯入來源：AA_367@1ebcf530（白名單同一版）',/AA_367.*@1ebcf530/.test(PG_DATES.source.AA_367)&&JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.some(e=>e.path==='docs/story_planning/AA_367_畢業以後的交往節奏_六位.md'&&e.sha==='1ebcf530'&&e.status==='approved')); });

H.done();
})();

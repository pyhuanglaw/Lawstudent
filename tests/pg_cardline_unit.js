// 畢業以後跳日期時，日期卡下面那一句（AA_353，AA-C 2026-10-21；src/postgrad3d.js 的 PG.cardLine，照經濟系 econff3d.js 的 cardLine）——不需要瀏覽器。
//   A. 典型玩家（臺灣路線、有報名、2029 一試二試都過）：從 6/2 早上一路「跳到下一件事」到 12/14 二試放榜——每一段各出一句、照順序、不重複；沒有「沒報名」那幾句
//   B. 沒報名的玩家：不出「總圖 B1」那幾句（有報名、考試的句子都不出）；出「畢業以後的第一個禮拜……」
//   C. 2029 一試沒過（明年再考）：9/8～10/19 出「……明年你還會坐在這裡。」；2030 出 2030 那一表（「又是一個要讀書的夏天」……）
//   D. 交換延畢（日本路線）：2029 不出（2029 那一表只給臺灣路線）；2030 出 2029 那一表的句子（日子換成 2030 的），不出 2030 那一表（「這一次」「比去年快」「還是同一張」）
//   E. PG.cardLine 本身：同一天、隔一天的跳不出；一句只出一次（記在 G.flags.PG.lines）；舊存檔沒有 lines 照樣能用
//      AA_355 第 5 節第 2 題（2026-10-21）：一跳只出「最後一句」（落地前最近的那一段）——沒報名 9/7→12/14 出十一月那句（原本出九月那句，修改前 FAIL）；
//      交換延畢 6/3～6/27 出 AA_353 第 3 節延畢那一句（修改前 null，FAIL）。C 節第一項改成這個規則下的結果（這個模擬沒有 r2y4b3d.js 的 9/8、10/20 停點）
// 修改前（開發分支 5c471a79）：日期卡下面那一行一律空白、沒有 PG.cardLine——跑得到的 10 項 FAIL 9（只有「不丟例外」過；E 節後三項因為沒有 PG.cardLine 沒跑）。用法：node tests/pg_cardline_unit.js
const H=require('./pg_harness.js'); const {check}=H;
const GM=H.GM; GM.spawnCharacter=()=>null; GM.titleCard=async(a,b,ms)=>{ H.cards.push([a,b,H.G?H.G.day:null,ms]); };   /* 日期卡多記那一天、停幾毫秒 */
const warns=[]; console.warn=(...a)=>{ warns.push(a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,3).join(' / '):String(x)).join(' ')); };
const rej=[]; process.on('unhandledRejection',e=>rej.push(String(e&&e.stack||e)));
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });
const FRIENDS=['zhe','yu','classmate_bohan','classmate_xinci','classmate_mingxuan','classmate_peishan','npc_fangyt','heroine_01','heroine_02','heroine_03','heroine_04','heroine_05'];
// AA_353 第 1 節的句子（照抄）
const L29={reg1:'（畢業以後，你還是每天八點起床。不用上課，就去總圖。）',noreg1:'（畢業以後的第一個禮拜，你每天睡到自然醒。……然後就睡不著了。）',b1:'（七月。總圖 B1 的長桌，每天早上都是同一群人。）',
  pre:'（考前三個禮拜。讀書計畫表的格子一格一格劃掉，剩下的比劃掉的少了。）',e1:'（一試考完，離放榜還有一個月。你把法典放在書架最上面。）',pass:'（二試的書比一試厚。早上讀實體法，下午寫考古題，晚上把寫錯的再寫一次。）',
  fail:'（九月。學弟妹開學了，總圖又開始搶位子。明年你還會坐在這裡。）',noreg9:'（九月。學弟妹開學了，總圖又開始搶位子。）',e2:'（二試考完以後等放榜的七個禮拜，比讀書的時候還長。）',other:'（十一月。公館的騎樓下，開始有人在賣烤地瓜。）'};
const L30={sum:'（又是一個要讀書的夏天。總圖 B1 的位子，你坐的還是同一張。）',pre:'（考前三個禮拜。這次的讀書計畫表，你自己排。）',e1:'（一試考完。這一次，你沒有把法典放到書架最上面。）',pass:'（二試的書還是很厚。你讀得比去年快一點。）',e2:'（等放榜的七個禮拜。你去打工，晚上照樣翻一下考古題。）'};
const ALL=new Set(Object.values(L29).concat(Object.values(L30)));
const y4=async GM=>{ const G=GM.G; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return null;   /* 照 story3d.js S.y4Tick（同 tests/postgrad_days_unit.js）*/
  if(STORY.packDue(G)){ await STORY.packY4(GM); return 'pack'; } if(STORY.gradMorningDue(G)){ await STORY.gradFamily(GM); return 'family'; } if(STORY.gradLunchDue(G)){ await STORY.gradLunch(GM); return 'lunch'; }
  if(G.zone==='dorm'&&STORY.gradEnvelopeDue(G)){ await STORY.gradEnvelope(GM); return 'envelope'; } if(STORY.moveOutDue(G)){ await STORY.moveOutY4(GM); return 'moveout'; } return null; };
/* 6/2 早上起床開始一路跳（同 tests/postgrad_days_unit.js 的 sim）；到 until 那天為止。回傳日期卡（[日期, 那一句]，只留 AA_353 的句子）*/
const sim=async(flags,setup,o)=>{ o=o||{}; const G=H.fresh('2029-06-02',8,'dorm',Object.assign({PACKED_Y4:PG.gradDay()-1},flags)); FRIENDS.forEach(H.FRIEND); if(setup) setup(G);
  PHONE.join(G,'noodle_team','麵店團'); PHONE.join(G,'home','家人'); warns.length=0; rej.length=0;
  const until=PG.DK(o.until||'2029-12-15'); let it=0, err=null;
  try{
    for(it=0; it<150&&!G.flags.EPILOGUE_DONE&&G.day<until; it++){
      const ns=PG.nextStop(G); for(const y of [2029,2030]){ const ex=PG.byId('exam_'+y); if(o.score!=null&&!PG.done(G,'exam_'+y)&&ex.cond(G)&&(PG.due(G)===ex||(ns!=null&&Math.abs(ns-ex.at(G))<1e-6))) H.picks=answerK(PG.draw(G,y),o.score); }
      if(await y4(GM)) continue;
      if(OUT.due(G)){ H.picks=[0]; await OUT.tick(GM); }
      else { const s=PG.due(G); if(s) await PG.runStep(GM,s);
        else if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)){ if(!await PG.sleepJump(GM)){ const t0=G.day*24+G.hour; await HOME.sleep(GM); if(G.day*24+G.hour<=t0) break; } }
        else if(!await PG.advance(GM)) break; } }
  }catch(e){ err=e; }
  await new Promise(r=>setTimeout(r,30));
  const cards=H.cards.filter(c=>ALL.has(c[1]));
  return {G,cards,lines:cards.map(c=>c[1]),err,it}; };
const md=c=>{ const x=CALENDAR.dateOf(c[2]); return x.m*100+x.d; }, yr=c=>CALENDAR.dateOf(c[2]).y;
(async()=>{
  // ===== E. PG.cardLine 本身 =====
  { const ok=typeof PG.cardLine==='function'; check('E. 有 PG.cardLine（照 econff3d.js 的 cardLine）',ok);
    if(ok){ const G=H.fresh('2029-06-28',10,'dorm',{BAR_REG:true}); delete PG.rec(G).lines;   /* 舊存檔：PG 沒有 lines */
      const d=PG.DK('2029-06-03'), d2=PG.DK('2029-06-28');
      const same=PG.cardLine(G,d2,d2), next=PG.cardLine(G,d2-1,d2), a=PG.cardLine(G,d,d2), b=PG.cardLine(G,d,d2);
      check('E. 同一天、隔一天的跳不出；6/3→6/28（有報名）出「畢業以後，你還是每天八點起床……」；同一段再跳一次不再出（一句只出一次）；記在 G.flags.PG.lines',
        same===null&&next===null&&a===L29.reg1&&b===null&&JSON.stringify(G.flags.PG.lines)===JSON.stringify([L29.reg1]),JSON.stringify([same,next,a,b,G.flags.PG.lines]));
      const G2=H.fresh('2029-06-28',10,'dorm',{BAR_REG:false}); const c=PG.cardLine(G2,d,d2);
      check('E. 沒報名：同一段出「畢業以後的第一個禮拜，你每天睡到自然醒。……然後就睡不著了。」',c===L29.noreg1,String(c));
      const G3=H.fresh('2029-06-28',10,'dorm',{EXCHANGE_ROUTE:'JP'}); const e=PG.cardLine(G3,d,d2);
      check('E. 交換延畢：2029 那一表不出；6/3～6/27 出 AA_353 第 3 節延畢的那一句（「同屆的人都畢業了……」）',e==='（同屆的人都畢業了。你還差一門實習，九月再回學校。）',String(e));
      /* AA_355 第 5 節第 2 題（AA-C 2026-10-21）：一跳只出一句＝落地前最近的那一段、條件成立、沒用過的那一句；前面的段落沒出的就不出 */
      const G4=H.fresh('2029-12-14',15,'dorm',{BAR_REG:false}); const f=PG.cardLine(G4,PG.DK('2029-09-07'),PG.DK('2029-12-14'));
      const G5=H.fresh('2029-12-14',15,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:10,BAR_STAGE_2029:'none'}); const g=PG.cardLine(G5,PG.DK('2029-09-07'),PG.DK('2029-10-20')), g2=PG.cardLine(G5,PG.DK('2029-10-20'),PG.DK('2029-12-14'));
      check('E. 一跳只出最後一句：沒報名的玩家 9/7→12/14 一跳出「（十一月。公館的騎樓下，開始有人在賣烤地瓜。）」，不是「（九月。……）」；一試沒過 9/7→10/20 出「明年你還會坐在這裡」、10/20→12/14 出十一月那句',
        f===L29.other&&g===L29.fail&&g2===L29.other,JSON.stringify([f,g,g2])); } }
  // ===== A. 典型玩家 =====
  { const r=await sim({BAR_REG:true,LAWCLUB_SAT_VISITS:10},null,{score:17});
    const want=[L29.reg1,L29.b1,L29.pre,L29.e1,L29.pass,L29.e2];
    check('A. 不丟例外、沒有警告、沒有未處理的 Promise',!r.err&&!warns.length&&!rej.length,(r.err&&r.err.stack||'')+warns.slice(0,3).join('｜')+rej.slice(0,2).join('｜'));
    check('A. 典型玩家 6/3 跳到 12/14：每一段各出一句、照順序（畢業以後八點起床 → 七月 B1 → 考前三個禮拜 → 一試考完 → 二試的書 → 等放榜七個禮拜）、不重複',JSON.stringify(r.lines)===JSON.stringify(want)&&r.G.flags.BAR_STAGE_2029==='both'&&PG.done(r.G,'r2_2029'),JSON.stringify(r.cards));
    const D=r.cards.map(md), inR=(x,a,b)=>x>=a&&x<=b;
    check('A. 句子出在跳完的那張日期卡（6/28、7/12、8/3～8/4、9/1～9/7、9/22 中秋或 10/20、12/14）',D.length===6&&inR(D[0],628,628)&&inR(D[1],712,712)&&inR(D[2],803,804)&&inR(D[3],901,907)&&(inR(D[4],922,922)||inR(D[4],1020,1020))&&inR(D[5],1214,1214),JSON.stringify(r.cards.map(c=>c[0])));   /* AA_471 第 4 節：畢業以後的中秋 20:00 家人群組多一個停點（2029-09-22），「二試的書」那一句落在那一跳 */
    check('A. 有句子的日期卡停 3.2 秒（同經濟系）、沒有句子的照舊 1.8 秒',r.cards.length>0&&r.cards.every(c=>c[3]===3200)&&H.cards.filter(c=>c[1]===''&&c[3]!=null).every(c=>c[3]!==3200),JSON.stringify(r.cards.map(c=>c[3]))); }
  // ===== B. 沒報名 =====
  { const r=await sim({BAR_REG:false,LAWCLUB_SAT_VISITS:10});
    const bad=r.lines.filter(t=>[L29.reg1,L29.b1,L29.pre,L29.e1,L29.pass,L29.fail,L29.e2].includes(t));
    check('B. 沒報名：不出「總圖 B1」那幾句（有報名、考試的句子都不出）；出「畢業以後的第一個禮拜……」',!r.err&&!bad.length&&r.lines[0]===L29.noreg1&&new Set(r.lines).size===r.lines.length,JSON.stringify(r.cards)+(r.err?r.err.stack:'')); }
  // ===== C. 2029 一試沒過 =====
  { const r=await sim({BAR_REG:true,LAWCLUB_SAT_VISITS:10},null,{score:5,until:'2030-12-14'});
    const i=r.lines.indexOf(L29.other), c=r.cards[i];   /* 這個模擬沒有載入 r2y4b3d.js（9/8 重考的選擇、10/20 的摘要日），9/7 放榜以後一跳就到 12/14：照「最後一句」出十一月那句（九月那句見 E 節的 9/7→10/20）*/
    check('C. 一試沒過：9/7→12/14 一跳出最後一段（十一月）那一句；不出一試過了、考了二試、沒報名的句子',!r.err&&i>=0&&c&&md(c)===1214&&!r.lines.includes(L29.pass)&&!r.lines.includes(L29.e2)&&!r.lines.includes(L29.noreg9)&&r.G.flags.BAR_STAGE_2029==='none',JSON.stringify(r.cards)+(r.err?r.err.stack:''));
    const L2=r.lines.filter(t=>Object.values(L30).includes(t));
    check('C. 2030 再考：出 2030 那一表，照順序（又是一個要讀書的夏天 → 這次的讀書計畫表 → 這一次 → 比去年快 → 去打工）',JSON.stringify(L2)===JSON.stringify([L30.sum,L30.pre,L30.e1,L30.pass,L30.e2])&&PG.done(r.G,'r2_2030'),JSON.stringify(r.cards)); }
  // ===== D. 交換延畢 =====
  { const r=await sim({EXCHANGE_ROUTE:'JP',LAWCLUB_SAT_VISITS:10},null,{score:17,until:'2030-12-14'});
    const y29=r.cards.filter(c=>yr(c)===2029), in30=r.cards.filter(c=>yr(c)===2030).map(c=>c[1]).filter(t=>Object.values(L29).includes(t)), x30=r.lines.filter(t=>Object.values(L30).includes(t));
    check('D. 交換延畢：2029 不出（2029 那一表只給臺灣路線；2030 有）',!r.err&&!y29.length&&r.cards.length>0,JSON.stringify(r.cards)+(r.err?r.err.stack:''));
    check('D. 交換延畢 2030：出 2029 那一表的句子（考前三個禮拜、一試考完、二試的書比一試厚、等放榜七個禮拜），不出 2030 那一表',[L29.pre,L29.e1,L29.pass,L29.e2].every(t=>in30.includes(t))&&!x30.length&&PG.done(r.G,'r2_2030'),JSON.stringify(r.cards)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

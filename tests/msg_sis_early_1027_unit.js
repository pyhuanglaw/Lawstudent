// MSG-SIS-EARLY-1027（AA_485 第 4 節，企劃線 5aaa71d6a；使用者 2026-10-27「為什麼不能傳訊息給學姊」）——不需要瀏覽器。
//   1  加了好友（9/3 她接受交友邀請＝SIS_CONTACTED）起就能傳：事務版（不用等第 2 階、還沒在現實見過也一樣）；閒聊照舊（第 3 階、雙方單身）
//   2  限時話題「問社博」：加了好友～9/6 社博結束；祐廷那句、學姊兩則照稿；回覆照她的作息（12:10、17:05、22:30）；只一次
//   3  「問法服」：社博以後；加入了法服＝第一版、沒加入＝第二版；只一次（兩版共用一次）
//   4  問過「問社博」的玩家：社博那天 ev_sis_club_expo 照「見過」那一條（「學弟？」），不另外加句子；也算 W1
//   5  社博不在週六的舊局（9/30、10/1）沒有「問社博」（句子寫「禮拜六的社博」）
// 修改前（開發分支 592de7e18）：9/3～社博前學姊的「傳訊息」不開（第 2 階才開），沒有這兩個話題——FAIL。用法：node tests/msg_sis_early_1027_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js']){ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (MSG|MSG_POOL|MSG2_POOL)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const S5='heroine_05', D=k=>STORY.dayOfKey(k);
const NEW={LAW_START_DAY:D('2025-08-29'),MAIN_D1:D('2025-09-04')};   /* 開學改 9/1 的新局（STORY.week1Start）*/
const fresh=(key,hh,fl)=>{ const G=H.fresh(key,hh,'campus',Object.assign({},NEW,fl||{})); G.contacts=G.contacts||{}; return G; };
const keys=()=>MSG.topics(H.G,S5).map(q=>q.k);
const thread=()=>PHONE.thread?PHONE.thread(H.G,'p:'+S5).map(m=>(m.from==='player'?'我：':'')+m.text):H.G.msgs.filter(m=>m.th==='p:'+S5).map(m=>(m.from==='player'?'我：':'')+m.text);
const tickTo=(day,hh)=>{ H.G.day=day; H.G.hour=hh; PHONE.tick(H.G); };

(async()=>{
check('0. STORY.week1Start（新局）',STORY.week1Start(fresh('2025-09-03',10)));
/* 1 */
{ fresh('2025-09-02',20); check('1. 9/2（還沒加好友）：不開',!MSG.open(H.G,S5).ok,MSG.open(H.G,S5).why);
  fresh('2025-09-03',10,{SIS_CONTACTED:true}); const o=MSG.open(H.G,S5); check('1. 9/3 加了好友、還沒在現實見過（陌生）：開，事務版',o.ok&&o.mode==='business',J(o));
  check('1. 事務版的話題：在幹嘛、分享照用（問課要她在學校）＋問社博',['chat','share','sis_expo'].every(k=>keys().includes(k))&&!keys().includes('night'),J(keys()));
  SOCIAL.rel(S5).fam=50; SOCIAL.rel(S5).trust=30; SOCIAL.remember(S5,'FIRST_MET',''); const o2=MSG.open(H.G,S5); check('1. 朋友（第 3 階）、雙方單身：閒聊（照舊）',o2.ok&&!o2.mode,J(o2)+' '+SOCIAL.stage(S5)); }
/* 2 */
{ fresh('2025-09-04',10,{SIS_CONTACTED:true}); const r=MSG.send(H.G,S5,'sis_expo'); check('2. 傳「問社博」',r.ok,J(r));
  check('2. 祐廷那句：「學姊，禮拜六的社博，法律系的大多參加什麼？」',thread().slice(-1)[0]==='我：學姊，禮拜六的社博，法律系的大多參加什麼？',J(thread()));
  check('2. 她 12:10 才回（照作息）',!!r.at&&r.at.day===H.G.day&&Math.abs(r.at.h-(12+10/60))<1e-6,J(r.at));
  tickTo(H.G.day,12.2); check('2. 學姊兩則照稿',J(thread().slice(-2))===J(['看你想做什麼。想練法律的，法服。想動的，系籃。','我那天在法服顧攤。十點到四點。']),J(thread()));
  check('2. 同一天不能再傳；之後不再出「問社博」',!MSG.canSend(H.G,S5)&&(H.G.day+=1,H.G.hour=10,!keys().includes('sis_expo')),J(keys()));
  fresh('2025-09-06',15.9,{SIS_CONTACTED:true}); check('2. 9/6 15:54（社博還沒收）：還有「問社博」',keys().includes('sis_expo'));
  H.G.hour=16; check('2. 9/6 16:00 社博收了：沒有「問社博」，換「問法服」',!keys().includes('sis_expo')&&keys().includes('sis_fafu_out'),J(keys()));
  fresh('2025-09-04',23,{SIS_CONTACTED:true}); const r2=MSG.send(H.G,S5,'sis_expo'); tickTo(H.G.day+1,12.3);
  check('2. 23:00 傳：隔天 12:10 先「抱歉，昨天十點半就睡了。」再回兩則',!!r2.at&&r2.at.day===H.G.day&&J(thread().slice(-3))===J(['抱歉，昨天十點半就睡了。','看你想做什麼。想練法律的，法服。想動的，系籃。','我那天在法服顧攤。十點到四點。']),J(thread())); }
/* 3 */
{ fresh('2025-09-08',10,{SIS_CONTACTED:true,SIS_CLUB_EXPO:true,lawclub:true,CLUB_lawclub_study:true}); check('3. 社博以後、加入了法服：「問法服」（第一版）',keys().includes('sis_fafu_in')&&!keys().includes('sis_fafu_out'),J(keys()));
  MSG.send(H.G,S5,'sis_fafu_in'); tickTo(H.G.day,12.2);
  check('3. 「法服第一次去要準備什麼？」→「不用準備。站旁邊聽，做紀錄。」「隔週週六九點，B館一樓。不要遲到。」',J(thread().slice(-3))===J(['我：法服第一次去要準備什麼？','不用準備。站旁邊聽，做紀錄。','隔週週六九點，B館一樓。不要遲到。']),J(thread()));
  H.G.day+=1; H.G.hour=10; check('3. 只一次',!keys().some(k=>/^sis_fafu/.test(k)),J(keys()));
  fresh('2025-09-08',10,{SIS_CONTACTED:true}); MSG.send(H.G,S5,'sis_fafu_out'); tickTo(H.G.day,12.2);
  check('3. 沒加入法服：「法服現在還能報名嗎？」→「可以。週六上午去B館一樓，找值班的學長姊。」',J(thread().slice(-2))===J(['我：法服現在還能報名嗎？','可以。週六上午去B館一樓，找值班的學長姊。']),J(thread()));
  H.G.flags.lawclub=true; H.G.day+=1; check('3. 問過沒加入版以後加入了：不再出第一版（兩版共用一次）',!keys().includes('sis_fafu_in'),J(keys()));
  fresh('2026-03-03',10,{SIS_CONTACTED:true}); check('3. 大一下：沒有「問法服」（稿上沒寫到什麼時候，先放到大一上結束）',!keys().some(k=>/^sis_/.test(k)),J(keys())); }
/* 4 */
{ fresh('2025-09-06',11,{SIS_CONTACTED:true,SIS_MSG_EXPO:true}); const e=STORY_EVENTS.find(q=>q.id==='ev_sis_club_expo'); const rels=[]; const r0=GM.rel; GM.rel=(id,v)=>rels.push([id,v]); await EVENTS.run(e); GM.rel=r0; const L=H.lines();
  check('4. 問過「問社博」、還沒見過面：社博那天照「見過」那一條（「學弟？」），沒有「學姊好，我是……」',L.some(t=>/學弟？$/.test(t))&&!L.some(t=>/學姊好，我是/.test(t))&&!L.some(t=>/家族群組大頭貼/.test(t)),J(L));
  check('4. 也算 W1（SIS_W1、met_sis、+3），報名照舊（SIS_CLUB_EXPO）',H.G.flags.SIS_W1===true&&H.G.flags.met_sis===true&&J(rels)===J([['sis',3]])&&H.G.flags.SIS_CLUB_EXPO===true,J([H.G.flags.SIS_W1,rels])); }
{ fresh('2025-09-06',11,{SIS_CONTACTED:true}); const e=STORY_EVENTS.find(q=>q.id==='ev_sis_club_expo'); await EVENTS.run(e); const L=H.lines(); check('4. 沒問過、還沒見過：照舊合併版（家族群組大頭貼）',L.some(t=>/家族群組大頭貼/.test(t)),J(L)); }
/* 5 */
{ const G=H.fresh('2025-09-22',10,'campus',{SIS_CONTACTED:true}); check('5. 舊局（9/17 開始；社博 9/30、10/1 不在週六）：沒有「問社博」',!STORY.week1Start(G)&&!MSG.topics(G,S5).some(q=>q.k==='sis_expo'),J(MSG.topics(G,S5).map(q=>q.k))); }
H.done();
})();

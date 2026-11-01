// AA_393 學姊第七批：日本路線（企劃線 e81a1afe1；任務 SIS-B7-L-1023；D111）——不需要瀏覽器。
//   1  第 1 節：3/22 21:00 提示；3/23（四）19:30～21:30 在 Café 找她說話＝便條那一場（朋友版／交往版），記 SIS_JP_NOTE、熟悉 +2 自在 +2；沒去＝3/24 09:00 照片
//   2  第 2 節：4/3～7/24 臺灣週一 20:00（日本 21:00）八則照順序各一次；那天 20:00 前後有出遊＝順延到週二
//   3  第 3 節：7/31 約、8/1 臺灣 21:00（日本 22:00）視訊；交往中多兩句和「我知道。」；可能在外面＝文字版；沒接＝21:20 那一則
//   4  第 4 節：回覆池「祐廷在日本」：朋友、交往中各自那一句，每一句只出一次，之後回到一般句；在臺灣不用
//   5  第 5 節：交往中四組視訊（4/9、5/7、6/18、7/16 臺灣 21:00）照順序；J3 外套那句看第 1 節交往版；沒接「你在忙。下次。」
//   6  逐字對稿；誰沒有（臺灣、美國路線、前任、只是認識）
// 修改前（開發分支 7b29d13dd）：沒有 src/sis_jp3d.js（全部 FAIL）。用法：node tests/aa393_sis_jp_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, ID='heroine_05', J=JSON.stringify;
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js']) L3(f);
const ok1=L3('src/data/sis_jp_events.js'), ok2=L3('src/sis_jp3d.js');
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t);
const th=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+ID);
const fresh=(key,h,route,lv,flags)=>{ const G=H.fresh(key,h,'dorm',Object.assign({EXCHANGE_ROUTE:route||'JP',EXCH_RULE:1,met_sis:true,SIS_W1:true},flags||{})); (H[lv||'FRIEND'])(ID); G.contacts={[ID]:G.day-60}; G.outings=[]; G.acts={att:{}}; H.at(key,h); return G; };
const X=()=>typeof SISJP!=='undefined'?SISJP:null;
const ph=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const walk=(d0,d1,miss)=>{ for(let d=d0;d<=d1;d++) for(const h of [8,12,19,20.5,21.5,22.5,23.5]){ H.at(keyOf(d),h); ph();
  for(const q of OUT.rec(H.G)) if(/^sisjp_/.test(q.id)&&q.state==='planned'&&T(q.day,q.h)<=T(d,h)){ if(miss&&miss(q)){ q.state='missed'; OUT.onMissed(GM,q); } else q.state='done'; } } };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=picks||[]; if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };

(async()=>{
let doc=''; try{ doc=cp.execSync('git show e81a1afe1:"docs/story_planning/AA_393_學姊第七批_日本路線.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
try{ doc+='\n'+cp.execSync('git show d94d259ec:"docs/story_planning/AA_442_國外學期盤點_日本出發前五週_住家裡的家人群組.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}   /* AA_442 第 3 節改了提示那一句（「你禮拜六走，對吧。」）*/
try{ doc+='\n'+cp.execSync('git show 5f54b6545:"docs/story_planning/AA_470_學姊第十二批_三種玩家總檢查_大一暑假到大四寒假補七場.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}   /* AA_470 4-5 加了 7/10 那一則 */
try{ doc+='\n'+cp.execSync('git show a4f530c11:"docs/story_planning/AA_490_回LAWWW_學姊第十二批三件_法圖午休改週五_書推過去_讀書會撞期.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}   /* AA_490 4-2 換了 5/29 的第二句（SIS-B12-FIX-1027）*/
try{ doc+='\n'+cp.execSync('git show 31a4c4002:"docs/story_planning/AA_508_女主角自己的生活_大三下與暑假.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}
try{ doc+='\n'+cp.execSync('git show c9f6dd6cb:"docs/story_planning/AA_539_學姊重讀_AA470之後_空白與重複.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}   /* AA_539 1-5（SIS-LEAD-1021，2026-10-30）再換 5/29 的第二句「讀書會還在。Kevin 說要讀到考前一個月。」*/
try{ doc+='\n'+cp.execSync('git show 691a26400:"docs/story_planning/AA_509_女主角自己的生活_大四上與寒假.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}   /* AA_509 0-2 第 1 點：道別「我四月中寫到第三章」、j2「第三章被教授退回來一半」*/   /* AA_508 0-2 第 3 點：4/17 改第三章第一頁、7/10 改第三章寫到一半 */
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. 新檔載得到、index.html 接在 sis_qixi3d.js 後面',ok1&&ok2&&!!X()&&/sis_qixi3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/sis_jp_events\.js\?v=[^"]+"><\/script>\n<script src="src\/sis_jp3d\.js\?v=[^"]+"><\/script>/.test(html));
  const all=J(SISJP_EVENTS)+J(SISJP_LINES), q=[...all.matchAll(/text":"([^"]+)"/g)].map(m=>m[1]).concat(Object.values(SISJP_LINES).flat().flatMap(x=>typeof x==='string'?[x]:(x&&x.L)||[]));
  const OK=['📷（一張手寫的便條：那邊三月還冷。外套不要收進行李箱最下面。）','📷（行李箱，上面放著那件外套）','（便條只有一句：「那邊三月還冷。外套我放了一件在你背包裡，不要問。」）',...(doc.includes('7/10「第五章寫到一半。」改「第三章寫到一半。」')&&doc.includes('七月每天三點下雨。第五章寫到一半。')?['七月每天三點下雨。第三章寫到一半。']:[])];   /* 7/10：AA_470 4-5 原句＋AA_508 0-2 第 3 點只換後半句（兩份稿都要讀得到）；照片：稿只寫「她傳便條的照片」「文字版」——程式寫的照片說明；交往版的便條＝稿「便條換成『…』」套朋友版那一行的寫法 */
  const notIn=[...new Set(q)].filter(t=>doc.indexOf(t)<0&&!OK.includes(t));
  check('0. 每一句台詞、選項都在稿裡（一字不差；照片說明兩則除外）',!!doc&&!notIn.length,J(notIn));
  check('0. SISY23.preTalk 包了這一層（_sisjp），sis_b4 那一層還在（_sisb4）',!!SISY23.preTalk._sisjp&&!!SISY23.preTalk._sisb4); });
/* ---- 1 ---- */
await sec(1,async()=>{ fresh('2028-03-22',20); H.at('2028-03-22',21); ph();
  check('1. 3/22 21:00 她私訊「明天晚上我在 Café。你禮拜六走，對吧。」',J(th().map(m=>m.text))===J(['明天晚上我在 Café。你禮拜六走，對吧。']));
  H.at('2028-03-23',19.4); H.G.zone='cafe'; const a=X().preTalkDue(H.G); H.at('2028-03-23',19.5); const b=X().preTalkDue(H.G); H.G.zone='lawlib'; const c=X().preTalkDue(H.G); H.G.zone='cafe';
  const sch=CHARACTERS.heroine_05.daily_schedule.find(r=>J(r.days)===J([1,2,4])&&r.zone==='cafe');
  check('1. 3/23（四）19:30～21:30 在 Café 才演（19:24 不演、不在 Café 不演）；她週四晚上本來就在 Café（作息）',!a&&b&&!c&&!!sch&&sch.from<=19.5&&sch.to>=21.5,J([a,b,c]));
  const r0=Object.assign({},SOCIAL.rel(ID)); H.said=[]; H.picks=[0]; const ran=await SISY23.preTalk(GM); const r1=SOCIAL.rel(ID);
  const F1=['（她坐在窗邊的老位子。桌上除了筆電，還有一張已經寫好的便條。）','明天是以安的餞行，我知道。所以今天。','（她把便條推過來。）','（便條只有一句：「那邊三月還冷。外套不要收進行李箱最下面。」）','到了在群組說一聲。','……我四月中寫到第三章，拍給你看。這是我自己要做到的。','寫不完你會知道，因為我不會拍。','（九點半，她把筆電闔上。）','走吧。我也要回去了。'];
  check('1. 說話前接演（SISY23.preTalk）：朋友版照稿；「寫不完呢？」→「寫不完你會知道，因為我不會拍。」',ran===true&&F1.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(F1[i-1])))&&!has('（走到路口，她把你的圍巾拉好，才轉身走。）'),J(H.said.map(x=>x.t)));
  check('1. 記 SIS_JP_NOTE true；熟悉 +2、自在 +2；3/24 不再傳照片',H.G.flags.SIS_JP_NOTE===true&&r1.fam-r0.fam===2&&r1.comf-r0.comf===2&&(H.at('2028-03-24',9.5),ph(),!th().some(m=>/便條/.test(m.text))),J([r1.fam-r0.fam,r1.comf-r0.comf]));
  fresh('2028-03-23',19.5); H.date(ID); H.G.zone='cafe'; H.said=[]; H.picks=[1]; await SISY23.preTalk(GM);
  check('1. 交往中：便條「那邊三月還冷。外套我放了一件在你背包裡，不要問。」；「妳也要照顧自己。」→「我在臺灣。……要照顧自己的是你。」；路口圍巾那一行',has('（便條只有一句：「那邊三月還冷。外套我放了一件在你背包裡，不要問。」）')&&has('我在臺灣。……要照顧自己的是你。')&&idx('（走到路口，她把你的圍巾拉好，才轉身走。）')>idx('我在臺灣。……要照顧自己的是你。')&&H.G.flags.SIS_JP_NOTE_GF===true,J(H.said.map(x=>x.t)));
  fresh('2028-03-22',20); walk(D('2028-03-22'),D('2028-03-24'));
  check('1. 沒去：3/24 09:00 便條的照片＋「昨天沒遇到。照片也算。」；SIS_JP_NOTE photo',th().some(m=>m.text==='昨天沒遇到。照片也算。'&&keyOf(m.day)==='2028-03-24'&&Math.floor(m.h)===9)&&H.G.flags.SIS_JP_NOTE==='photo',J(th().map(m=>keyOf(m.day)+' '+m.h+' '+m.text))); });
/* ---- 2 ---- */
await sec(2,()=>{ fresh('2028-03-24',10); walk(D('2028-03-24'),D('2028-08-04')); const M=th().filter(m=>/^sisjp_m_/.test(m.tag||'')&&/^（照片/.test(m.text));
  check('2. 九則照順序、各一次：4/3、4/17、5/1、5/15、5/29、6/12、6/26、7/10（AA_470 4-5 加的）、7/24',J(M.map(m=>keyOf(m.day)))===J(['2028-04-03','2028-04-17','2028-05-01','2028-05-15','2028-05-29','2028-06-12','2028-06-26','2028-07-10','2028-07-24'])&&H.G.flags.SIS_JP_MSG===9,J(M.map(m=>keyOf(m.day))));
  check('2. 臺灣週一 20:00＝遊戲時鐘（人在日本）21:00；照片＋那一句',M.every(m=>m.h===21&&CALENDAR.dateOf(m.day).wd===1)&&th().some(m=>m.text==='第三章。……說好拍給你看。'),J(M.map(m=>m.h)));
  fresh('2028-04-01',10); OUT.plan(H.G,{id:'t_busy',ev:'ev_x',day:D('2028-04-03'),h:21,place:'x',title:'x',travel:'',travelH:0}); walk(D('2028-04-01'),D('2028-04-05'));
  const m0=th().find(m=>m.tag==='sisjp_m_0'); check('2. 4/3 21:00 已經有出遊：順延到週二 4/4 同一時間',!!m0&&keyOf(m0.day)==='2028-04-04'&&m0.h===21,J(m0)); });
/* ---- 3 ---- */
await sec(3,async()=>{ fresh('2028-07-30',10); walk(D('2028-07-30'),D('2028-07-31')); const a=th().find(m=>m.ask&&m.ask.id==='sisjp_eve_ask');
  check('3. 7/31 臺灣 21:00（日本 22:00）「明天晚上九點，視訊。你那邊十點。」「好。」／「我那天可能在外面。」',!!a&&a.text==='明天晚上九點，視訊。你那邊十點。'&&a.h===22&&J(a.ask.opts.map(o=>o.t))===J(['好。','我那天可能在外面。']),J(a));
  PHONE.answer(H.G,'sisjp_eve_ask',0); H.at('2028-08-01',8); ph(); const q=OUT.get(H.G,'sisjp_eve');
  check('3. 「好。」→ 8/1 遊戲時鐘 22:00（臺灣 21:00）視訊',!!q&&keyOf(q.day)==='2028-08-01'&&q.h===22&&q.verb==='接起來',J(q));
  const r0=Object.assign({},SOCIAL.rel(ID)); H.at('2028-08-01',22); await goOut('sisjp_eve',[2]); const r1=SOCIAL.rel(ID);
  const E=['（她背後是打包到一半的房間，床上攤著兩個行李箱。）','明天早上的飛機。','你五號回來，我二號走。錯開三天。','收了兩箱。第三箱是書，我還在想要帶哪幾本。','好。我要去把第三箱收完。','（她關掉視訊以前，又把鏡頭轉到行李箱上，讓你看了一眼。上面放著那件外套。）'];
  check('3. 視訊照稿（朋友版三個選項）；記 SIS_JP_EVE video；熟悉 +1、自在 +2',E.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(E[i-1])))&&H.opts[0]&&H.opts[0].length===3&&H.G.flags.SIS_JP_EVE==='video'&&r1.fam-r0.fam===1&&r1.comf-r0.comf===2,J({s:H.said.map(x=>x.t),o:H.opts}));
  fresh('2028-07-31',22.5); H.date(ID); ph(); PHONE.answer(H.G,'sisjp_eve_ask',0); H.at('2028-08-01',8); ph(); const n0=SOCIAL.rel(ID).npcRom; H.at('2028-08-01',22); await goOut('sisjp_eve',[3]);
  check('3. 交往中：「錯開三天」後面「……我算過了。晚一個禮拜走，就碰得到。」「可是論文的時間是排好的。我不想改。」；第四個選項「我知道。」→「嗯。……謝謝你知道。」；她的戀愛 +2',idx('……我算過了。晚一個禮拜走，就碰得到。')===idx('你五號回來，我二號走。錯開三天。')+1&&has('可是論文的時間是排好的。我不想改。')&&H.opts[0].length===4&&has('嗯。……謝謝你知道。')&&SOCIAL.rel(ID).npcRom-n0===2,J(H.opts));
  fresh('2028-07-31',22.5); ph(); PHONE.answer(H.G,'sisjp_eve_ask',1); H.at('2028-08-01',22); ph();
  check('3. 「我那天可能在外面。」→「好。那我傳訊息。」；8/1 臺灣 21:00 文字版（「好。我要去把第三箱收完。」＋行李箱的照片），沒有視訊',th().some(m=>m.text==='好。那我傳訊息。')&&th().some(m=>m.text==='好。我要去把第三箱收完。'&&keyOf(m.day)==='2028-08-01')&&!OUT.get(H.G,'sisjp_eve'),J(th().map(m=>m.text)));
  fresh('2028-07-31',22.5); ph(); H.at('2028-08-01',8); ph(); walk(D('2028-08-01'),D('2028-08-01'),q=>q.id==='sisjp_eve'); const m=th().find(x=>x.text==='明天早上的飛機。十二月見。');
  check('3. 沒回也照打；沒接＝臺灣 21:20（遊戲時鐘 22:20）「明天早上的飛機。十二月見。」；SIS_JP_EVE missed',!!m&&Math.abs(m.h-(22+20/60))<0.01&&H.G.flags.SIS_JP_EVE==='missed',J(m)); });
/* ---- 4 ---- */
await sec(4,()=>{ const snd=(tp,sub,h)=>{ H.at(keyOf(H.G.day+1),h||13); const r=MSG.send(H.G,ID,tp,sub); return r&&r.entry?r.entry.msgs.join('/'):'×'+((r&&r.why)||''); };
  fresh('2028-04-10',13,'JP','CLOSE'); INV.addContact(H.G,ID); const c1=snd('chat'), c2=snd('chat'), c3=snd('chat'), n1=snd('night',null,22), n2=snd('night',null,22), s1=snd('share','food');
  check('4. 好朋友（閒聊版；晚安在事務版本來就不開）、人在日本：「在幹嘛」先兩句日本版（各一次；比考試週那幾句優先），之後一般句',c1==='總圖。你那邊比我晚一個小時睡，記得。'&&c2==='研究室。今天寫了三頁，刪了一頁。'&&!/你那邊比我晚|三頁/.test(c3)&&!/^×/.test(c3),J([c1,c2,c3]));
  check('4. 朋友：「晚安。你那邊已經過十二點了，快睡。」一次；分享吃的「日本的便利商店比較好吃嗎。不用回答，我會想去。」',n1==='晚安。你那邊已經過十二點了，快睡。'&&n2!==n1&&!/^×/.test(n2)&&s1==='日本的便利商店比較好吃嗎。不用回答，我會想去。',J([n1,n2,s1]));
  fresh('2028-04-10',13); H.date(ID); const d1=snd('chat'), d2=snd('night',null,22), d3=snd('share','cat'), d4=snd('share','notes');
  check('4. 交往中：「研究室。……你那邊吃晚餐了嗎。」「晚安。你那邊比較早天亮，窗簾記得拉。」；「拍得不錯。下次拍你自己。」只出一次',d1==='研究室。……你那邊吃晚餐了嗎。'&&d2==='晚安。你那邊比較早天亮，窗簾記得拉。'&&d3==='拍得不錯。下次拍你自己。'&&d4!==d3&&!/^×/.test(d4),J([d1,d2,d3,d4]));
  fresh('2028-08-10',13); INV.addContact(H.G,ID); const t1=snd('chat'); check('4. 回臺灣以後（8/5 起）：不用日本版',!/你那邊比我晚|三頁/.test(t1)&&!/^×/.test(t1),t1); });
/* ---- 5 ---- */
await sec(5,async()=>{ fresh('2028-03-26',10,'JP','FRIEND',{SIS_JP_NOTE_GF:true,SIS_JP_NOTE:true}); H.date(ID); walk(D('2028-03-26'),D('2028-07-20'));
  const V=OUT.rec(H.G).filter(q=>/^sisjp_v_/.test(q.id)).sort((a,b)=>a.day-b.day);
  check('5. 交往中四組：4/9、5/7、6/18、7/16 的週日，遊戲時鐘 22:00（臺灣 21:00），照順序',J(V.map(q=>keyOf(q.day)+'@'+q.h+':'+q.sa.set))===J(['2028-04-09@22:0','2028-05-07@22:1','2028-06-18@22:2','2028-07-16@22:3']),J(V.map(q=>keyOf(q.day)+'@'+q.h+':'+q.sa.set)));
  H.at('2028-06-18',22); await goOut('sisjp_v_2',[0]);
  check('5. J3（外套放進背包的交往版演過）：「咬了一口外套。」→「……那件外套？」「那件。」「回來我看一下。」',has('鹿有沒有咬你。')&&has('……那件外套？')&&has('那件。')&&has('回來我看一下。'),J(H.said.map(x=>x.t)));
  delete H.G.flags.SIS_JP_NOTE_GF; await goOut('sisjp_v_2',[0]); check('5. J3 沒演過交往版：「外套還好嗎。」',has('外套還好嗎。')&&!has('……那件外套？'),J(H.said.map(x=>x.t)));
  H.at('2028-04-09',22); const r0=Object.assign({},SOCIAL.rel(ID)); await goOut('sisjp_v_0',[1]); const r1=SOCIAL.rel(ID);
  check('5. J1「你房間給我看。」→「日本的房間都這樣。」→「那我也想住日本的房間。」；自在 +2、她的戀愛 +1',has('你房間給我看。')&&has('那我也想住日本的房間。')&&r1.comf-r0.comf===2&&r1.npcRom-r0.npcRom===1);
  fresh('2028-04-08',10,'JP','FRIEND'); H.date(ID); walk(D('2028-04-08'),D('2028-04-09'),q=>q.id==='sisjp_v_0');
  check('5. 沒接：「你在忙。下次。」；下一組 5/7 照常是 J2',th().some(m=>m.text==='你在忙。下次。')&&(walk(D('2028-04-10'),D('2028-05-01')),(OUT.get(H.G,'sisjp_v_1')||{sa:{}}).sa.set===1));
  fresh('2028-03-26',10,'JP','FRIEND'); walk(D('2028-03-26'),D('2028-04-10')); check('5. 沒交往：沒有這四組',!OUT.rec(H.G).some(q=>/^sisjp_v_/.test(q.id))); });
/* ---- 6 ---- */
await sec(6,()=>{ for(const [r,lv,ex] of [['TW','FRIEND'],['US','FRIEND'],['JP','FRIEND',true],['JP','FAMILIAR']]){ fresh('2028-03-22',20,r,lv,ex?{EX_heroine_05:true}:{}); walk(D('2028-03-22'),D('2028-04-04'));
    check('6. '+r+(ex?' 前任':'')+' '+lv+'：沒有（提示、照片、兩週一則都沒有）',!th().some(m=>/^sisjp_/.test(m.tag||'')),J(th().map(m=>m.tag))); } });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

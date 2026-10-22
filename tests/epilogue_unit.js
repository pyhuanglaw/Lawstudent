// 1A-19 第一份工作（2030-10-01 21:00 群組）＋1A-20 尾聲（2034-06-03 19:00 兩點半 Café，CG-10）（AA_319；src/postgrad3d.js）——不需要瀏覽器。
//   第一份工作：六種落點的照片（AA_319 1A-19）、只有認識的人傳照片、交換延畢＝補習班的自習室＋「（你的第一天，還在後面。）」（b6757852）；
//   尾聲：字卡、只有認識的人在那一桌、每人一句（條件由低到高取最後一列，AA_327 2-Y4-53）、前任在店的另一頭、CG-10 的八張（右手邊＝畢業時的伴侶，單身＝阿凱）、
//   「你一直都是……」、祐廷最後一句、桌上的東西、星期六沒有人講上班的事（AA_319 1A-20 第 5 節、BB 驗收 P1～P5）、方奕廷那句（AA_327 f252a7b5）、回標題。用法：node tests/epilogue_unit.js
const H=require('./pg_harness.js'); const {check}=H;
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
const LAWYER={BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer',BAR_YEAR:2029};
const leanA={LAWCLUB_SAT_VISITS:10};   /* careerLean：A＝法服週六 */
let cgAt=[]; { const oc=ADV.cg; ADV.cg=function(id){ cgAt.push(H.said.length); return oc.call(this,id); }; }
const epi=async(flags,setup)=>{ const G=H.fresh('2034-06-03',18,'dorm',Object.assign({},flags)); graduated(G); G.flags.FIRST_DAY_SEEN=true; PG.rec(G).done.first=1; if(setup) setup(G);
  H.said=[]; H.cards=[]; H.cgs=[]; H.entered=[]; H.bgs=[]; cgAt=[]; H.GM.running=true; await H.run('epi'); return G; };
const said=(who,t)=>H.said.some(s=>s.who===who&&s.t===t);
const idx=t=>H.said.findIndex(s=>s.t===t);
const first=async(flags,setup)=>{ const G=H.fresh('2030-10-01',21,'dorm',Object.assign({},flags)); graduated(G); if(setup) setup(G); H.said=[]; await H.run('first'); return G; };
(async()=>{
  // ---- 1A-19 第一份工作 ----
  { const G=await first(Object.assign({},leanA,LAWYER),()=>{ ['zhe','yu','classmate_bohan','heroine_01','heroine_03'].forEach(H.FAMILIAR); });
    const M=H.msgs('g:noodle_team');
    check('J1. 傾向 A、律師：祐廷的照片「法律扶助基金會的櫃台」（第一張，自己傳的）',M[0]==='📷（照片：法律扶助基金會的櫃台。名牌上的字還是新的。）'&&G.msgs.find(m=>m.text===M[0]).from==='player',JSON.stringify(M.slice(0,2)));
    check('J1. 阿哲、Alison、柏翰、以安、語彤：照片＋一句',M.includes('📷（照片：事務所門口）')&&M.includes('第一天。領帶打了三次。')&&M.includes('明年再考司法官。今天先上班。')&&M.includes('論文第一頁。……還是空白的。')&&M.includes('LL.M. 開學了。')&&M.includes('二試還沒考。在店裡讀。'));
    check('J2. 芯慈不認識＝沒有她的照片',!M.includes('📷（照片：會計師事務所的電腦螢幕，一排 Excel）')&&!M.includes('法遵。四色筆還是要帶。'));
    check('J1. 旁白「（那一年，群組的照片一張一張傳上來。每一張都寫著：我的第一天。）」；FIRST_DAY_SEEN；沒有延畢那一句',H.has('（那一年，群組的照片一張一張傳上來。每一張都寫著：我的第一天。）')&&G.flags.FIRST_DAY_SEEN===true&&!H.has('（你的第一天，還在後面。）')); }
  { const G=await first({EXCHANGE_ROUTE:'JP',BAR_REG_2030:true});   /* AA_357 1-6：延畢的 2030 報名看 BAR_REG_2030 */
    check('J3. 交換延畢（還在準備 2030 年的律師二試，b6757852）：「（照片：補習班的自習室。）」＋「（你的第一天，還在後面。）」',H.msgs('g:noodle_team')[0]==='📷（照片：補習班的自習室。）'&&H.has('（你的第一天，還在後面。）')&&!H.msgs('g:noodle_team').some(t=>/職前訓練/.test(t))); }
  { const G=await first({EXCHANGE_ROUTE:'JP',BAR_YEAR:2030});
    check('J3. 交換延畢、已經放榜（BAR_YEAR 有值）＝照落點，不是自習室',H.msgs('g:noodle_team')[0]!=='📷（照片：補習班的自習室。）'&&!H.has('（你的第一天，還在後面。）')); }
  { await first({},G=>{ G.stats.study=100; G.flags.GRAD_ADMIT='ntu'; });
    check('J4. 傾向 B、研究所上了：「（照片：研究室的桌子。書比椅子高。）」',H.msgs('g:noodle_team')[0]==='📷（照片：研究室的桌子。書比椅子高。）'); }
  { await first({},G=>{ G.stats.study=100; });
    check('J4. 傾向 B、四年沒報考研究所＝改用 A（A、C 平手）：沒考上律師＝NGO 的白板',H.msgs('g:noodle_team')[0]==='📷（照片：NGO 辦公室的白板。上面是你寫的第一個個案。）'); }
  { await first({ZQ_CONTRACT:'lawyer'},G=>{ SOCIAL.remember('heroine_04','PLAYTESTED',''); H.FRIEND('heroine_04'); });
    check('J4. 傾向 C、子晴線：「（照片：工作室的門。門上貼著一隻插座貓。）」',H.msgs('g:noodle_team')[0]==='📷（照片：工作室的門。門上貼著一隻插座貓。）'); }
  { await first({},G=>{ SOCIAL.remember('heroine_04','PLAYTESTED',''); });
    check('J4. 傾向 C：「（照片：出版社的辦公桌。姊姊在照片的角落比讚。）」',H.msgs('g:noodle_team')[0]==='📷（照片：出版社的辦公桌。姊姊在照片的角落比讚。）'); }
  // ---- 1A-20 尾聲 ----
  // P1：單身、傾向 A、律師
  { const G=await epi(Object.assign({},leanA,LAWYER),()=>{ H.FRIEND('zhe'); });
    check('P1. 字卡「五年後」→「2034 年 6 月 3 日」「兩點半 Café」→ 演完「法條之外」',JSON.stringify(H.cards)===JSON.stringify([['五年後',''],['2034 年 6 月 3 日','兩點半 Café'],['法條之外','']]),JSON.stringify(H.cards));
    check('P1. 兩點半 Café（3D 區域＋模糊背景），19:00',H.entered.includes('cafe')&&H.bgs.includes('blur')&&G.hour===19&&G.day===PG.DK('2034-06-03'));
    check('P1. 開場旁白：窗邊那張雙人桌、阿哲的習慣',H.said[0].t==='（兩點半 Café。窗邊那張雙人桌坐滿了人，旁邊的桌子都被併過來了。）'&&H.said[1].t==='（阿哲的習慣。五年了，還是一樣。）');
    check('P1. CG-10 阿凱在旁邊（單身）',JSON.stringify(H.cgs)===JSON.stringify(['cg_reunion_window_table_kai']));
    check('P1. 阿凱（律師）「……喔對，你現在是律師。」；阿哲「我在事務所，每天寫狀子。」',said('阿凱','……喔對，你現在是律師。')&&said('阿哲','我在事務所，每天寫狀子。'));
    check('P1. ④ 阿哲「你一直都是這樣。誰有事，你就先去查。」（CG 以後）',said('阿哲','你一直都是這樣。誰有事，你就先去查。')&&idx('你一直都是這樣。誰有事，你就先去查。')>=cgAt[0]);
    check('P1. ⑤ 祐廷「我在法扶。這禮拜開了三個庭。」',said('祐廷','我在法扶。這禮拜開了三個庭。'));
    check('P1. ⑥ 桌上的東西：法服週六最多＝值班證（伴侶沒有）',H.has('（桌上，你面前放著值班證。你不記得是誰把它拿出來的。）')&&JSON.stringify(G.flags.EPI_ITEMS)==='["值班證"]');
    check('P1. ⑦ 最後一句「（有人在講大一的事，大家笑得很大聲。窗外的溫州街，路燈亮了。）」',H.said[H.said.length-1].t==='（有人在講大一的事，大家笑得很大聲。窗外的溫州街，路燈亮了。）');
    check('P1. 不認識的人不在（Alison、以安、學姊…）',!H.said.some(s=>['Alison','柏翰'].includes(s.who))&&!H.has('我在事務所做公司跟證券的案子。合約一份兩百頁，我每一頁都看。'));
    check('P1. EPILOGUE_DONE；沒有開始畫面的按鈕＝停下主迴圈；畢業後篇結束（PG.on false）',G.flags.EPILOGUE_DONE===true&&H.GM.running===false&&!PG.on(G)&&!PG.due(G)); }
  // 回標題（btnTitle）
  { const od=global.document; let clicked=0; global.document={ getElementById:id=>id==='btnTitle'?{onclick(){ clicked++; }}:null, addEventListener(){} };
    const G=await epi(Object.assign({},leanA,LAWYER)); global.document=od;
    check('P1. 演完按「回標題」（btnTitle 的 onclick，和選單的回標題同一個）',clicked===1&&G.flags.EPILOGUE_DONE===true); }
  // P2：和以安交往
  { const G=await epi(Object.assign({},leanA,LAWYER),()=>{ H.FRIEND('heroine_01'); H.date('heroine_01'); H.FRIEND('zhe'); });
    const an=SOCIAL.datingName&&SOCIAL.datingName('heroine_01')||SOCIAL.displayName('heroine_01');
    check('P2. 以安（交往）「今天我沒帶電腦出門。事務所的人都嚇一跳。」「你比我晚到。理由？」',said(an,'今天我沒帶電腦出門。事務所的人都嚇一跳。')&&said(an,'你比我晚到。理由？')&&!H.has('我在事務所做公司跟證券的案子。合約一份兩百頁，我每一頁都看。'),an);
    check('P2. CG-10 以安在旁邊',JSON.stringify(H.cgs)===JSON.stringify(['cg_reunion_window_table_heroine01']));
    check('P2. 桌上那張紙（讀書會只剩一條規則的那張紙）記在 EPI_ITEMS（自己的東西在前：法服週六＝值班證）',JSON.stringify(G.flags.EPI_ITEMS)==='["值班證","讀書會只剩一條規則的那張紙"]'); }
  // P3：和可昕交往（A：沒有分開過）
  { const G=await epi(Object.assign({},leanA,LAWYER),()=>{ H.FRIEND('kexin'); H.date('kexin'); H.FRIEND('zhe'); });
    const i=H.said.findIndex(s=>s.t==='書狀寫到一半。……先吃。');
    check('P3. 可昕最晚到「書狀寫到一半。……先吃。」（同一桌的最後一個）',i>idx('……喔對，你現在是律師。')&&i<cgAt[0]);
    check('P3. 沒有假設題、沒有「你不要讓我」（AA_327 BB_120 3-3 不用）',!H.said.some(s=>/假設題|你不要讓我/.test(s.t)));
    check('P3. 沒有分開過＝沒有「我們兩個是不是很笨？」',!H.has('我們兩個是不是很笨？……好，這題不算。'));
    check('P3. CG-10 可昕在旁邊；摩天輪票根',JSON.stringify(H.cgs)===JSON.stringify(['cg_reunion_window_table_kexin'])&&G.flags.EPI_ITEMS.includes('摩天輪票根')); }
  { await epi(Object.assign({},leanA,LAWYER),G=>{ H.FRIEND('kexin'); H.date('kexin'); ROM.get(G,'kexin').history.push({ev:'end',at:'',day:G.day-400}); });
    check('P3. B（分開又回來）：多「我們兩個是不是很笨？……好，這題不算。」',H.has('書狀寫到一半。……先吃。')&&H.has('我們兩個是不是很笨？……好，這題不算。')); }
  // P4：和語彤分手過
  { const G=await epi(Object.assign({},leanA,LAWYER),()=>{ H.FRIEND('zhe'); H.FRIEND('heroine_03'); H.date('heroine_03'); ROM.end(H.G,'heroine_03','apart_talk'); });
    const y=SOCIAL.displayName('heroine_03'), a=H.said.findIndex(s=>s.t==='麵店還在。你們有空來吃。');
    check('P4. 語彤在店的另一頭：起身經過時「麵店還在。你們有空來吃。」＋她自己的那一句「我在事務所，租賃的案子比較多。」',said(y,'麵店還在。你們有空來吃。')&&H.said[a+1].t==='我在事務所，租賃的案子比較多。');
    check('P4. 不在那一桌：沒有「阿姨說你很久沒來了。下禮拜二來吃。」，在同一桌的人說完以後',!H.has('阿姨說你很久沒來了。下禮拜二來吃。')&&a>idx('……喔對，你現在是律師。')&&a<cgAt[0]);
    check('P4. 不在旁邊、不在對面：CG-10 是阿凱那張；沒有「麵店還開著」的旁白',JSON.stringify(H.cgs)===JSON.stringify(['cg_reunion_window_table_kai'])&&!H.has('（麵店還開著。牆上的紅紙又多了好幾張。）')); }
  // 阿勳「好久不見」＋前任以安「你們都在啊。」
  { await epi(Object.assign({PLAYED_Y0:true},leanA,LAWYER),()=>{ H.FRIEND('heroine_01'); H.date('heroine_01'); ROM.end(H.G,'heroine_01','apart_talk'); });
    check('E1. 經濟系那桌阿勳「好久不見」→ 前任以安第一句改「你們都在啊。」「我先走了，合約週一要交。」',H.has('好久不見')&&H.has('你們都在啊。')&&H.has('我先走了，合約週一要交。')&&!H.has('好久不見。')&&idx('你們都在啊。')>idx('好久不見')); }
  { await epi(Object.assign({PLAYED_Y0:true,ECON_PAST_SHARED:'full'},leanA,LAWYER),()=>{ H.FRIEND('heroine_01'); H.date('heroine_01'); ROM.end(H.G,'heroine_01','apart_talk'); });
    check('E1. 講過經濟系的事（沒有販賣機那幾晚）：「你們法律系，期末考還是燈亮到天亮嗎？」；以安照原本「好久不見。」',H.has('你們法律系，期末考還是燈亮到天亮嗎？')&&H.has('好久不見。')&&!H.has('你們都在啊。')); }
  { await epi(Object.assign({},leanA,LAWYER));
    check('E1. 沒有經濟系那一年（沒玩過、沒見過阿勳）＝沒有阿勳',!H.has('好久不見')&&!H.has('廣場那台販賣機還在嗎？')); }
  // J：明軒（2029 律師錄取＝在德國）；方奕廷（AA_327 f252a7b5）
  { await epi(Object.assign({},leanA,LAWYER),()=>{ H.FAMILIAR('classmate_mingxuan'); H.FAMILIAR('npc_fangyt'); });
    check('J5. 明軒（祐廷 2029 律師錄取）「你放榜那天，我在德國。早上八點，在去上課的電車上看到的。」',H.has('你放榜那天，我在德國。早上八點，在去上課的電車上看到的。'));
    check('J5. 方奕廷：2029 就考上＝「山上沒有訊號。…」',H.has('山上沒有訊號。所以我每次下山，都會一次收到很多訊息。')&&!H.has('那一年你在考試。……我知道。')); }
  { await epi({LAWCLUB_SAT_VISITS:10,BAR_YEAR:2030},()=>{ H.FAMILIAR('classmate_mingxuan'); H.FAMILIAR('npc_fangyt'); });
    check('J5. 台灣路線 2030 才考上（多考的那一年）：方奕廷「那一年你在考試。……我知道。」；明軒「我剛好下班。在公車上看完的。」',H.has('那一年你在考試。……我知道。')&&H.has('你放榜那天，我剛好下班。在公車上看完的。')); }
  { await epi({EXCHANGE_ROUTE:'JP',BAR_YEAR:2030},()=>{ H.FAMILIAR('npc_fangyt'); });
    check('J5. 交換路線 2030 考上（正常的那一年）＝不是「那一年你在考試」（交換路線多考的是 2031，AA_327 f252a7b5）',!H.has('那一年你在考試。……我知道。')&&H.has('山上沒有訊號。所以我每次下山，都會一次收到很多訊息。')); }
  { await epi({EXCHANGE_ROUTE:'JP',BAR_YEAR:2031},()=>{ H.FAMILIAR('npc_fangyt'); });
    check('J5. 交換路線 BAR_YEAR 2031：沒有「那一年你在考試」（AA_331 1b：交換路線 2031 拿掉、沒有 2031 國考；原本 f252a7b5 有）',!H.has('那一年你在考試。……我知道。')); }
  // P5：大家都在（每人一句、星期六沒有人講上班）
  const ALL=['zhe','yu','classmate_bohan','classmate_xinci','heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_mingxuan','classmate_peishan','npc_fangyt'];
  { const G=await epi(Object.assign({PLAYED_Y0:true},leanA,LAWYER),()=>{ ALL.forEach(H.FRIEND); });
    const tab=H.said.slice(2,cgAt[0]), seen=new Map(); let prev=null, bad=[];
    tab.forEach((s,i)=>{ if(!s.who) { prev=null; return; } if(s.who!==prev){ seen.set(s.who,(seen.get(s.who)||0)+1); } prev=s.who; });
    for(const [w,n] of seen) if(n!==1) bad.push(w+'×'+n);
    const len=new Map(); tab.forEach(s=>{ if(s.who) len.set(s.who,(len.get(s.who)||0)+1); }); for(const [w,n] of len) if(n>2) bad.push(w+' '+n+' 句');
    check('P5. 那一桌每個人只出現一次（一列；最多兩個對話框）',!bad.length&&seen.size>=13,bad.join('、')+'　'+[...seen.keys()].join('、'));
    check('P5. 星期六：沒有人說「開會」「開庭」「上班」的當天（2034-06-03 是星期六）',CALENDAR.dateOf(G.day).wd===6&&!H.said.some(s=>/開會|開庭|開完庭|今天上班/.test(s.t)),H.said.filter(s=>/開會|開庭|上班/.test(s.t)).map(s=>s.t).join('｜'));
    check('P5. 阿哲、Alison 同一桌＝兩人那一組（Alison「他現在每次都說『有事』。很煩。」阿哲「有事啊。我餓了。」）',said('Alison','他現在每次都說『有事』。很煩。')&&said('阿哲','有事啊。我餓了。')&&!H.has('我在事務所，每天寫狀子。'));
    check('P5. 經濟系那桌（沒講過）阿勳「好久不見」在同一桌的人之後',H.has('好久不見')&&idx('好久不見')>idx('……喔對，你現在是律師。'));
    check('P5. 學姊（不是戀人、傾向 A、律師）「我的研究，用的是你們法扶的申請統計。」',H.has('我的研究，用的是你們法扶的申請統計。'));
    check('P5. 語彤 FRIEND（結局 4）「我在事務所，租賃的案子比較多。」「阿姨說你很久沒來了。下禮拜二來吃。」',H.has('我在事務所，租賃的案子比較多。')&&H.has('阿姨說你很久沒來了。下禮拜二來吃。')); }
  // 尾聲等第一份工作、等 2030 那一輪
  { const G=H.fresh('2034-06-03',19,'dorm',{}); graduated(G);
    check('W1. 第一份工作還沒演（FIRST_DAY_SEEN 沒有）：先演 2030-10-01 那一段，不是尾聲',PG.due(G)&&PG.due(G).id==='first');
    await H.run('first'); check('W1. 演完第一份工作就是尾聲',PG.due(G)&&PG.due(G).id==='epi'); }
  { const G=H.fresh('2030-12-13',10,'dorm',{EXCHANGE_ROUTE:'US',BAR_REG_2030:true,BAR_SIT_2030:true,BAR_SCORE_2030:8,BAR_STAGE_2030:'lawyer'}); graduated(G); G.flags.FIRST_DAY_SEEN=true;
    check('W2. 交換延畢、2030 那一輪還沒演完：尾聲的條件不成立',PG.pendingExam(G)&&!PG.byId('epi').cond(G));
    PG.rec(G).done.r2_2030=1; G.flags.BAR_YEAR=2030; check('W2. 2030 放榜以後成立',!PG.pendingExam(G)&&PG.byId('epi').cond(G)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

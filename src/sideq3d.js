/* ===== 順手的事（店員的支線；AA_397 定稿，企劃線 8f1701b23；任務 SIDEQ-AA397-1023）=====
   台詞、旁白照稿一字不改（D100、D109）；稿裡沒有的句子不自己寫：那一步先不演（資料裡留 null），缺的字列給 AA。
   第 1 節 系統：
   - 店員「認得你」（src/eat3d.js：同一間店點第 5 次起）以後，在那間店點完餐，店員偶爾（S.ROLL）多一句自己的困擾 → 「要我幫忙嗎？」＝掛進「順手的事」；
     「……加油。」＝不掛，這一則這學期不再出現（下學期還可能再出）。一則一學期只出一次；一家店同時只掛一則；同時最多兩則（S.MAX）；一天最多問一次。
   - 手機「今天」那一頁多一格「順手的事」（classes3d.js todayHTML 叫 S.todayHTML）：標題（稿的小標）、下一步、期限。
   - 期限：只有要玩家去做事的那一步有期限（r.by）；過了＝lapsed（不扣任何數值；店員交代後來怎樣的那一句稿裡沒有，q.lapse＝null 先不演）。
     等結果的那一步（下次去那間店就看得到）沒有期限。
   - 做完：店員之後多一句、店裡的變化（「看」或點餐時一次的旁白）、相簿一頁（STORY.albumMemory）；
     有女主角幫忙的那一則照稿加熟悉；其他則做完時，當下在同一區、認識的女主角（最熟的那一位）熟悉 +1（AA_166 4-2：不特別安排人出現）。
   - 存檔 G.side[id]＝{state:'open'|'done'|'lapsed'|'declined', step, day, …}（declined＝「……加油。」，term 記哪一學期；其他欄位是各則自己的進度）。舊存檔沒有＝空物件。
     一天問過一次記在 G.flags.SIDEQ_DAY。
   第 2 節 SQ01～SQ08：各則的 accept（掛進去當下）、visit（之後在那間店）、trace（做完以後的痕跡）；接線：
     lane118.js L118.order／L118.isOpen（慢讀咖啡、六張犁麵舖、好家自助餐、蛋包飯研究所）、wzshops3d.js order364／interact（林家乾麵、巷口茶飲、夏日冰菓室；一盞茶屋的蘇姨）、
     story3d.js counter（公館的便利商店）、wzpark3d.js（公布欄、象棋阿伯）。法服、派出所、社課用出遊（OUT.plan，2D）。
     SQ02、SQ04 有法律的句子：LEGAL_REVIEW_REQUIRED（照 BB_115 送審）。
   第 3 節 公園的貓（SQ09）：PARK.catCold／catGone（wzpark3d.js）；2028-12-14（四）22:10～23:00 在公園、認識子晴、熟悉以上＝那一場（S.CAT_EV）；
     12/15 12:00 她傳照片；12/17 起公布欄換成領養告示（PARK.notices）；不在場＝象棋阿伯一句（wzpark3d.js）；
     2029-01～06 每月第一個週六的照片（有她的聯絡方式）；交往中：那則照片可以回「（去看貓）」＝隔天 14:00 去她家（2D 出遊，不另外寫台詞）。
   測試：node tests/aa397_sideq_unit.js */
'use strict';
const SIDEQ=(function(){
  const S={}, ZQ='heroine_04', SIS='heroine_05', AN='heroine_01', MX='classmate_mingxuan';
  const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const HEROINES=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05'];
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const T_=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
  const dateOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d):{y:2027,m:6,d:1,wd:1};
  const month=G=>dateOf(G.day).m;
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  const now=G=>G.day*24+(+G.hour||0);
  const md=d=>{ const q=dateOf(d); return q.m+'/'+q.d; };
  const wdTxt=d=>'日一二三四五六日'[dateOf(d).wd%7];
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const met=id=>has(id,'FIRST_MET');
  const stageAt=(id,st)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&!!SOCIAL.stage&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st);
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const npcOf=(GM,id)=>(GM.npc&&GM.npc[id])||null;
  const here=(GM,id)=>{ const n=npcOf(GM,id); return !!n&&!n.leaving&&!(GM.E&&Array.isArray(GM.E.npcs)&&!GM.E.npcs.includes(n)); };   /* 在這一區（真的建出來了、沒有要走）*/
  const who=(GM,id)=>npcOf(GM,id)||{name:nm(id),charId:id};
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dm=(id,t)=>({th:'p:'+id,from:id,text:t});
  const fam=(id,n)=>{ if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(id,{fam:n}); };
  S.dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };

  /* 現在在第幾學期（寒暑假＝前一個學期之後，brk）*/
  S.termPos=function(G){ if(typeof CALENDAR==='undefined'||!CALENDAR.termDays) return {i:-1,brk:true,id:null};
    for(let i=TERMS.length-1;i>=0;i--){ const r=CALENDAR.termDays(TERMS[i]); if(r&&G.day>=r.from) return {i,brk:G.day>r.to,id:TERMS[i]}; } return {i:-1,brk:true,id:null}; };
  S.termKey=G=>{ const p=S.termPos(G); return p.id?(p.brk?'B'+p.id:p.id):'B0'; };   /* 「一學期只出一次」的學期（寒暑假算一段）*/
  const ti=G=>{ const p=S.termPos(G); return p.i; };
  const inTerm=(G,id)=>{ const T=T_(G); return !!T&&T.id===id; };
  const lastDay=()=>{ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y4S2'):null; return r?r.to:Infinity; };   /* 畢業（大四下最後一天）以後不再出 */

  /* ---------- 稿（AA_397 第 2 節）：照抄；null＝稿裡沒有，先不演 ---------- */
  const SHOP_NAME={'林家乾麵':'林家乾麵','巷口茶飲':'巷口茶飲','夏日冰菓室':'夏日冰菓室','慢讀咖啡':'慢讀咖啡（118 巷）','六張犁麵舖':'六張犁麵舖（118 巷）','好家自助餐':'好家自助餐（118 巷）','蛋包飯研究所':'蛋包飯研究所（118 巷）','公館的便利商店':'公館的便利商店'};
  const STAFF={'林家乾麵':'老闆','巷口茶飲':'店員','夏日冰菓室':'老闆娘','慢讀咖啡':'店長','六張犁麵舖':'老闆','好家自助餐':'阿姨','蛋包飯研究所':'店員','公館的便利商店':'店員'};
  S.STAFF=STAFF; S.SHOP_NAME=SHOP_NAME;
  S.YES='要我幫忙嗎？'; S.NO='……加油。';
  const L={
    SQ01:{open:['有人給我一顆星。說湯是冷的。','……我們乾麵沒有湯。'],
      reply:[{k:'polite',t:'謝謝指教，乾麵本來就沒有湯，下次可以點餛飩湯。'},{k:'curt',t:'您點的是乾麵。'},{k:'none',t:'不回。'}],
      result:{polite:['（★★★★☆）「原來乾麵沒有湯，是我點錯，老闆回得好有禮貌」'],curt:['（★★☆☆☆）「好吧」'],none:['（★☆☆☆☆）','「沒有湯」']},   /* 評價的畫面：星等是 UI；「是一個大一新生」「老闆自己回了」稿裡沒有旁白 */
      wall:'「乾麵沒有湯」',greet:'小的，不加辣。……字是我寫的，醜。'},
    SQ02:{open:[[null,'（她把一張紙壓在收銀機下面。）'],['店員','老闆說上禮拜打破的杯子，要從我薪水扣。三個，四百五。']],
      ask:['要不要帶去法服問？','妳自己覺得呢？'],askReply:[null,null],   /* 「妳自己覺得呢？」她怎麼回：稿裡沒有 */
      fafu:'可以先跟老闆好好談；需要的話，勞工局有免費的諮詢。',   /* LEGAL_REVIEW_REQUIRED（BB_115）*/
      back:'（她回去跟老闆說了。老闆說：「我只是嚇嚇妳，誰叫妳一直講手機。」最後沒扣。）',treat:'半糖少冰，對吧。……今天不算錢。',
      trace:'（櫃台貼了一張「工作中手機請放後面」——她自己貼的。）'},
    SQ03:{open:['價目板曬到看不到了。你們讀書人字好看，幫我寫一下。'],mid:'今年芒果貴。……可是寫上去不好看，你寫原來的價錢。',end:'（價目板是新的，芒果冰的價錢是舊的。）',echo:'……字還在。'},
    SQ04:{open:[[null,'（店長把一台筆電放在吧檯上。）'],['店長','這台放在插座那一桌三個禮拜了。'],['店長','……要怎麼辦。']],ask:['交給派出所。','再等一下？'],askReply:[null,null],
      police:'（警察登記，說會找失主。）',   /* LEGAL_REVIEW_REQUIRED（BB_115）：只有「交給派出所」，拾得物的規定不展開 */
      thanks:'（兩個禮拜後，一個很瘦的男生來店裡道謝。他是國考生，那天胃出血被送急診，住院兩週。筆電裡是他三年的筆記。）',after:'（他每天來同一個插座位子讀書，店長幫他留。）',
      card:'（那個插座位子的桌上，多了一張手寫的小卡「謝謝」。）',pass:'（牆上多了一張剪報大小的紙：「榜單影本」。）'},
    SQ05:{open:['膝蓋要開刀。要休兩個禮拜。','……公休的紙，你幫我寫，寫得好看一點。'],notes:['老闆去修膝蓋，兩週後見。','本店公休至○月○日。','休息一下，大碗加蛋等你。'],
      zheCard:null,   /* 阿哲在麵店團群組揪大家簽卡片的那幾則：稿裡沒有 */
      photo:['（照片：卡片放在病床的桌上，旁邊是一碗醫院的稀飯）','這個沒有我煮的好吃。'],reopen:'大碗加蛋。……今天不收錢。',card:'（卡片貼在煮麵台旁邊的牆上。）'},
    SQ06:{open:['我孫子國二，數學不及格。','你們有沒有同學在當家教？'],askTutor:null,   /* 去問明軒／以安的那一段：稿裡沒有 */
      report:'他上課一直在桌子底下彈手指。',selfReport:null,   /* 自己去當家教的那一版：稿裡沒有 */
      twist:'（孫子想學的是吉他，不是數學。他在網路上看了吉他社成發的影片。）',zq:'……國二？我國二的時候也只會 C。',noZq:'（家教跟阿姨說了，阿姨買了一把二手吉他。）',
      trace:'我孫子數學及格了。……吉他也是。'},
    SQ07:{open:['跟你說，我要考研究所。真的那種。','讀書計畫寫好了，你幫我看。你們法律系的會挑毛病。'],ask:['第二段太長。','我看不懂第三段。','我認識一個人，很會看這個。'],askReply:[null,null,null],
      sis:'她第三段想說的，第一句就要說。',pass:'（她考上了，可是要搬去台中。）',last:'（最後一天她煎了一個寫著你名字的蛋包飯（番茄醬寫的字）。）',bye:'本所所長要畢業了。',
      board:'（店門口的小黑板：「本所所長赴台中深造。新所長培訓中。」）',newbie:'我是新所長。……還在培訓。'},
    SQ08:{open:['你也是買給公園那隻的？','今天你是第四個。'],none:'（沒有任何餵貓的說明。）',ask:{abo:null,su:null},   /* 象棋阿伯、蘇姨各說的那一句：稿裡沒有 */
      all:'（大家都在餵。）',table:'我做一張表，你拿去貼。',post:null,   /* 貼上去的那一句：稿裡沒有 */
      sheet:'（一格一天，誰餵誰簽名。）',chief:'（有人在表的最下面加了一行：「星期日我來。——里長」）',cold:'（那一週的格子都寫著「沒吃」。）'},
    CAT:{vet:['（照片：獸醫院的診療台，牠縮在毛巾裡）','感冒，老了。醫生說冬天不要待在外面。'],
      photos:[['牠霸佔了我的鍵盤。'],['牠睡在電暖器前面一整天。我也是。'],['醫生說牠胖回來了一點。'],['我遊戲裡的貓，換了一個新的動作：睡覺。'],['牠學會開衣櫃了。我不知道是誰教的。'],['（照片：貓和畢業證書）','牠比我早一步拿到證書。……是我放上去的。']]}
  };
  S.LINES=L;

  /* ---------- 存檔 ---------- */
  S.rec=function(G){ if(!G.side||typeof G.side!=='object'||Array.isArray(G.side)) G.side={}; return G.side; };
  S.get=(G,id)=>{ const r=S.rec(G)[id]; return r&&typeof r==='object'?r:null; };
  S.isOpen=(G,id)=>{ const r=S.get(G,id); return !!r&&r.state==='open'; };
  S.openIds=G=>Object.keys(S.rec(G)).filter(id=>Q[id]&&S.isOpen(G,id));
  S.MAX=2; S.ROLL=0.35; S.roll=()=>Math.random();   /* 「偶爾」：點完餐 35%（測試換掉 S.roll）*/
  S.known=(G,key)=>typeof EAT!=='undefined'&&!!EAT.count&&(EAT.count(G,key)>=5||!!(EAT.rec&&EAT.rec(G).l5[key]!=null));   /* 店員認得你（eat3d.js：第 5 次起、或店員已經說過認得你的那一句；在點完那一刻判斷，這一次也算）*/

  /* ---------- 各則 ---------- */
  const say=async(GM,w,t)=>{ if(t==null) return; await GM.say(w?{name:w}:null,t); };
  const sayAll=async(GM,w,a)=>{ for(const t of a) await say(GM,w,t); };
  const q2=t=>'「'+t+'」';
  const setWait=(r,step,day)=>{ r.step=step; r.wait=day; r.by=null; };
  const setAct=(r,step,by)=>{ r.step=step; r.by=by; };
  const refund=(GM,o)=>{ if(o&&o.price>0&&GM.money) GM.money(+o.price); };
  const Q={
    SQ01:{shop:'林家乾麵',title:'林家乾麵：一星評價',avail:G=>ti(G)>=1,
      accept:async(GM,r)=>{ const R=L.SQ01.reply, k=await GM.choose(R.map(o=>({t:o.k==='none'?o.t:q2(o.t)}))); r.reply=(R[k]||R[2]).k; setWait(r,'wait',GM.G.day+1); },
      visit:async(GM,r)=>{ if(r.step!=='wait'||GM.G.day<r.wait) return false; await sayAll(GM,null,L.SQ01.result[r.reply]||L.SQ01.result.none); S.finish(GM,'SQ01',r); return true; }},
    SQ02:{shop:'巷口茶飲',title:'巷口茶飲：打破的杯子',avail:G=>ti(G)>=2,
      accept:async(GM,r)=>{ const k=await GM.choose(L.SQ02.ask.map(t=>({t:q2(t)}))); r.ask=k; await say(GM,'店員',L.SQ02.askReply[k]); S.planFafu(GM.G,r); },
      visit:async(GM,r,o)=>{ if(r.step!=='wait'||GM.G.day<r.wait) return false; await say(GM,null,L.SQ02.back); await say(GM,'店員',L.SQ02.treat); refund(GM,o); r.free=o&&o.price||0; S.finish(GM,'SQ02',r); return true; },
      trace:async(GM,r)=>{ if(r.state!=='done'||r.t1||GM.G.day<=r.doneDay) return false; r.t1=GM.G.day; await say(GM,null,L.SQ02.trace); return true; }},
    SQ03:{shop:'夏日冰菓室',title:'夏日冰菓室：褪色的價目板',avail:G=>{ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y2S2'):null, m=month(G); return !!r&&G.day>r.to&&m>=5&&m<=8; },
      accept:async(GM,r)=>{ setAct(r,'board',GM.G.day+7); },
      trace:async(GM,r)=>{ const G=GM.G, y=dateOf(G.day).y, m=month(G); if(r.state!=='done'||r.writer!==AN||m<5||m>8||y<=dateOf(r.doneDay).y||r.echoY===y||G.zone!=='wenzhou'||!here(GM,AN)) return false;
        r.echoY=y; await GM.say(who(GM,AN),L.SQ03.echo); return true; }},   /* 以安寫的那一版：之後每年夏天，她在溫州街（一年一次）*/
    SQ04:{shop:'慢讀咖啡',title:'慢讀咖啡：一台沒人拿的筆電',avail:G=>ti(G)>=3,
      accept:async(GM,r)=>S.ask04(GM,r),
      visit:async(GM,r)=>{ const G=GM.G; if(r.step==='ask'){ await say(GM,'店長',L.SQ04.open[2][1]); await S.ask04(GM,r); return true; }
        if(r.step!=='wait'||G.day<r.wait) return false; await say(GM,null,L.SQ04.thanks); await say(GM,null,L.SQ04.after); S.finish(GM,'SQ04',r); return true; },
      trace:async(GM,r)=>{ const G=GM.G; if(r.state!=='done'||G.day<=r.doneDay) return false; if(!r.t1){ r.t1=G.day; await say(GM,null,L.SQ04.card); return true; }
        if(!r.t2&&G.day>=r.doneDay+300){ r.t2=G.day; await say(GM,null,L.SQ04.pass); return true; } return false; }},   /* 十個月以後：榜單影本 */
    SQ05:{shop:'六張犁麵舖',title:'六張犁麵舖：要公休兩個禮拜',avail:G=>inTerm(G,'Y3S1'),
      accept:async(GM,r)=>{ const G=GM.G; r.closeFrom=G.day+1; r.closeTo=G.day+14; r.reopen=G.day+15; const c=dateOf(r.closeTo);
        const N=L.SQ05.notes.map(t=>t.replace('○月○日',c.m+'月'+c.d+'日')); const k=await GM.choose(N.map(t=>({t:q2(t)}))); r.note=N[k]||N[0];
        r.zhe=!!(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')&&met('zhe')); setWait(r,'closed',r.reopen); },
      visit:async(GM,r,o)=>{ if(r.step!=='closed'||GM.G.day<r.reopen) return false; await say(GM,'老闆',L.SQ05.reopen); refund(GM,o); r.free=o&&o.price||0; S.finish(GM,'SQ05',r); return true; },
      trace:async(GM,r)=>{ if(r.state!=='done'||!r.zhe||r.t1||GM.G.day<=r.doneDay) return false; r.t1=GM.G.day; await say(GM,null,L.SQ05.card); return true; }},
    SQ06:{shop:'好家自助餐',title:'好家自助餐：阿姨的孫子',avail:G=>ti(G)>=2,
      accept:async(GM,r)=>{ r.tutor=met(MX)?MX:(met(AN)?AN:'me'); setWait(r,'lesson',GM.G.day+3); },
      visit:async(GM,r)=>{ const G=GM.G; if(r.step!=='twist') return false; await say(GM,null,L.SQ06.twist);
        const c=S.clubNext(G); if(c&&met(ZQ)){ const k=await GM.choose([{t:'帶孫子去吉他社社課看一次',hint:md(c.day)+'（'+wdTxt(c.day)+'）'+c.t0+':00　'+c.room},{t:'不用了'}]);
          if(k===0){ if(typeof OUT!=='undefined') OUT.plan(G,{id:'sq06_club',ev:'ev_sq06_club',day:c.day,h:c.t0,late:1,place:c.room,title:'吉他社社課：阿姨的孫子',travel:'走路 約 10 分鐘',travelH:1/6}); setAct(r,'club',c.day); return true; } }
        await say(GM,null,L.SQ06.noZq); S.finish(GM,'SQ06',r); return true; },
      trace:async(GM,r)=>{ if(r.state!=='done'||r.t1||S.termKey(GM.G)===r.doneTerm) return false; r.t1=GM.G.day; await say(GM,'阿姨',L.SQ06.trace); return true; }},   /* 及格那學期以後（做完的下一個學期起，一次）*/
    SQ07:{shop:'蛋包飯研究所',title:'蛋包飯研究所：真的研究所',avail:G=>inTerm(G,'Y3S2'),
      accept:async(GM,r)=>{ const G=GM.G, A=L.SQ07.ask, sis=met(SIS)&&stageAt(SIS,'FRIEND'); const O=[{t:q2(A[0])},{t:q2(A[1])}].concat(sis?[{t:q2(A[2])}]:[]); const k=await GM.choose(O); r.ask=k;
        await say(GM,'店員',L.SQ07.askReply[k]); if(k===2) setAct(r,'sis',G.day+14); else setWait(r,'wait',G.day+21); },
      visit:async(GM,r)=>{ const G=GM.G; if(r.step==='wait'&&G.day>=r.wait){ await say(GM,null,L.SQ07.pass); setWait(r,'last',G.day+7); return true; }
        if(r.step==='last'&&G.day>=r.wait){ await say(GM,null,L.SQ07.last); await say(GM,'店員',L.SQ07.bye); S.finish(GM,'SQ07',r); return true; } return false; },
      trace:async(GM,r)=>{ const G=GM.G; if(r.state!=='done'||G.day<=r.doneDay) return false; if(!r.t1){ r.t1=G.day; await say(GM,null,L.SQ07.board); return true; }
        if(!r.t2&&G.day>r.t1){ r.t2=G.day; await say(GM,'店員',L.SQ07.newbie); return true; } return false; },
      onBy:(G,r)=>{ setWait(r,'wait',G.day+21); return true; }},   /* 兩個禮拜都沒在 Café 遇到學姊：不算過期，照「自己看」往下 */
    SQ08:{shop:'公館的便利商店',title:'便利商店：誰在餵公園的貓',avail:G=>{ const h=hr(G); return ti(G)>=2&&(h>=20||h<6)&&((G.daily&&G.daily.catCansN)|0)>=3&&typeof PARK!=='undefined'&&!!PARK.catName(G)&&!(PARK.catGone&&PARK.catGone(G)); },   /* 夜班（20:00～06:00）；第三次買貓罐頭以後 */
      accept:async(GM,r)=>{ setAct(r,'board',GM.G.day+14); },
      visit:async(GM,r)=>{ if(r.step!=='back') return false; await say(GM,'店員',L.SQ08.table); setAct(r,'post',GM.G.day+14); return true; }}
  };
  S.Q=Q;
  const HINT={SQ01:{wait:'下次去林家乾麵'},SQ02:{fafu:r=>'帶去法服問（'+(r.fafuDay!=null?md(r.fafuDay)+' 週六上午，':'')+'萬才館）',wait:'下次去巷口茶飲'},SQ03:{board:'在夏日冰菓室的窗口「看價目板」'},
    SQ04:{ask:'下次去慢讀咖啡（118 巷）',police:'送筆電去派出所',wait:'下次去慢讀咖啡（118 巷）'},SQ05:{closed:r=>'六張犁麵舖公休到 '+md(r.closeTo)+'；之後再去'},
    SQ06:{lesson:'等家教第一次上課',twist:'下次去好家自助餐（118 巷）',club:r=>'帶孫子去吉他社社課（'+md(r.by)+'）'},SQ07:{sis:'找學姊看讀書計畫（兩點半 Café）',wait:'下次去蛋包飯研究所（118 巷）',last:'下次去蛋包飯研究所（118 巷）'},
    SQ08:{board:'去溫州街的公園看公布欄',ask:r=>'問象棋阿伯（早上）'+(r.abo?'✓':'')+'、一盞茶屋的蘇姨（下午）'+(r.su?'✓':''),back:'回公館的便利商店說',post:'把餵貓表貼到公園的公布欄'}};
  S.hint=(id,r)=>{ const h=HINT[id]&&HINT[id][r.step]; return typeof h==='function'?h(r):(h||''); };

  /* ---------- 系統 ---------- */
  S.canOffer=function(G,id){ const q=Q[id], r=S.get(G,id); if(!law(G)||!q||G.day>lastDay()) return false;
    if(r&&r.state!=='declined') return false; if(r&&r.term===S.termKey(G)) return false;   /* 做完、過期＝結束；「……加油。」＝這學期不再出 */
    const open=S.openIds(G); if(open.length>=S.MAX||open.some(x=>Q[x].shop===q.shop)) return false;
    return S.known(G,q.shop)&&!!q.avail(G); };
  S.offer=async function(GM,id){ const G=GM.G, q=Q[id], R=S.rec(G), st=STAFF[q.shop];
    const O=L[id].open; for(const x of O){ if(Array.isArray(x)) await say(GM,x[0],x[1]); else await say(GM,st,x); }
    const k=await GM.choose([{t:q2(S.YES)},{t:q2(S.NO)}]); if(k!==0){ R[id]={state:'declined',term:S.termKey(G),day:G.day}; return 'no'; }
    const r=R[id]={state:'open',step:'start',day:G.day,term:S.termKey(G)}; if(GM.toast) GM.toast('📝 順手的事：'+q.title,2600);
    await q.accept(GM,r); return 'yes'; };
  /* 做完：痕跡的起點、相簿、旁邊的女主角 */
  S.finish=function(GM,id,r,o){ const G=GM.G; r.state='done'; r.step='done'; r.doneDay=G.day; r.doneTerm=S.termKey(G); r.by=null;
    if(typeof STORY!=='undefined'&&STORY.albumMemory) STORY.albumMemory(G,'side_'+id,Q[id].title,'');
    if(!(o&&o.helped)&&!r.helped) S.nearby(GM,r); if(GM.toast) GM.toast('📝 順手的事：'+Q[id].title+'（做完了）',2600); return true; };
  S.nearby=function(GM,r){ const C=HEROINES.filter(id=>met(id)&&here(GM,id)); if(!C.length) return null; const st=id=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES?SOCIAL.STAGES.indexOf(SOCIAL.stage(id)):0;
    C.sort((a,b)=>st(b)-st(a)); fam(C[0],1); if(r) r.with=C[0]; return C[0]; };
  /* 點完餐（各店的點餐流程最後叫）：這間店的進度 → 做完的痕跡 → 偶爾一則新的；一次只演一件 */
  S.atShop=async function(GM,key,o){ const G=GM&&GM.G; if(!law(G)) return false; o=o||{}; S.lapse(G);
    if(key==='公館的便利商店'&&o.item==='小罐貓罐頭'){ G.daily=G.daily||{}; G.daily.catCansN=(G.daily.catCansN|0)+1; }   /* 買過幾罐（SQ08「第三次買貓罐頭以後」；舊存檔從 0 算）*/
    for(const id in Q){ const q=Q[id], r=S.get(G,id); if(q.shop!==key||!r) continue; if(r.state==='open'&&q.visit&&await q.visit(GM,r,o)) return true; }
    for(const id in Q){ const q=Q[id], r=S.get(G,id); if(q.shop!==key||!r) continue;
      if(r.state==='lapsed'&&!r.told&&q.lapse){ r.told=G.day; await say(GM,null,q.lapse); return true; }   /* 過期以後：店員交代後來怎樣（稿裡沒有，q.lapse 沒寫＝不演）*/
      if(q.trace&&await q.trace(GM,r,o)) return true; }
    if(G.flags.SIDEQ_DAY===G.day) return false;
    for(const id in Q){ if(Q[id].shop!==key||!S.canOffer(G,id)) continue; if(S.roll()>=S.ROLL) return false; G.flags.SIDEQ_DAY=G.day; return !!(await S.offer(GM,id)); }
    return false; };
  /* 期限：要玩家去做的那一步過了期限＝lapsed（不扣數值）；SQ07 找學姊那一步改成照「自己看」往下 */
  S.lapse=function(G){ if(!G||!G.side) return 0; let n=0; for(const id of S.openIds(G)){ const r=S.get(G,id); if(r.by==null||G.day<=r.by) continue; if(Q[id].onBy&&Q[id].onBy(G,r)) continue; r.state='lapsed'; r.lapseDay=G.day; n++; } return n; };

  /* ---------- 手機「今天」：順手的事 ---------- */
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  S.limitText=(G,r)=>{ if(r.by==null) return ''; const d=r.by-G.day; return (d<=0?'今天以內':(d<=7?'這個禮拜內':(d<=14?'兩個禮拜內':'這個月內')))+'（到 '+md(r.by)+'）'; };
  S.todayHTML=function(G){ if(!G||!G.side) return ''; S.lapse(G); const ids=S.openIds(G); if(!ids.length) return '';
    return '<div class="item"><b>順手的事</b><span class="muted">（最多兩件，不做也沒關係）</span>'+ids.map(id=>{ const r=S.get(G,id), lt=S.limitText(G,r);
      return '<div style="margin-top:4px">☐ '+esc(Q[id].title)+'<div class="muted">'+esc(S.hint(id,r))+(lt?'・'+esc(lt):'')+'</div></div>'; }).join('')+'</div>'; };

  /* ---------- SQ01：林家的招呼、菜單牆 ---------- */
  /* wzshops3d.js order364：做完以後，下一次熟客的招呼換成這句（一次）*/
  S.greet=function(G,key){ if(key!=='林家乾麵') return null; const r=S.get(G,'SQ01'); if(!r||r.state!=='done'||r.greeted||G.day<=r.doneDay) return null; if(typeof EAT!=='undefined'&&EAT.count&&EAT.count(G,key)<4) return null; r.greeted=G.day; return L.SQ01.greet; };
  S.wallExtra=(G,key)=>{ if(key!=='林家乾麵') return null; const r=S.get(G,'SQ01'); return r&&r.state==='done'?L.SQ01.wall:null; };

  /* ---------- SQ02：法服（單週六上午的初談；2D 出遊）---------- */
  S.planFafu=function(G,r){ const s=typeof STORY!=='undefined'&&STORY.fafuSat?STORY.fafuSat(G.day):null; if(!s||typeof OUT==='undefined'){ setAct(r,'fafu',G.day+14); return false; }
    r.fafuDay=s.day; setAct(r,'fafu',s.day); return OUT.plan(G,{id:'sq02_fafu_'+r.day,ev:'ev_sq02_fafu',day:s.day,h:9.5,late:2,place:'萬才館',title:'法服初談：巷口茶飲的店員',travel:'走路 約 10 分鐘',travelH:1/6}); };
  S.FAFU_EV={ id:'ev_sq02_fafu', title:'法服初談', participants:[], location:'any', trigger:'outing', background:'dark', hours:0.75,
    dialogue:[{scene:'萬才館・研討室',bg:'wancai_seminar'},{speaker:'值班的學長',text:L.SQ02.fafu}],   /* LEGAL_REVIEW_REQUIRED */
    after:(G)=>{ const r=S.get(G,'SQ02'); if(r&&r.state==='open'&&r.step==='fafu') setWait(r,'wait',G.day+1); },
    outingMissed:(G)=>{ const r=S.get(G,'SQ02'); if(r&&r.state==='open'&&r.step==='fafu'){ r.state='lapsed'; r.lapseDay=G.day; } } };

  /* ---------- SQ03：冰菓室窗口「看價目板」（wzshops3d.js windowItems／interact）---------- */
  S.boardOpen=G=>{ const r=G&&S.get(G,'SQ03'); return !!r&&r.state==='open'&&r.step==='board'; };
  S.iceBoard=async function(GM){ const G=GM.G, r=S.get(G,'SQ03'); if(!S.boardOpen(G)) return false; S.lapse(G); if(r.state!=='open') return false;
    const an=G.zone==='wenzhou'&&met(AN)&&here(GM,AN);   /* 當下在溫州街、認識的女主角：以安（她的字最工整）；不在就自己寫 */
    const k=an?await GM.choose([{t:'自己寫'},{t:'讓以安寫'}]):0; r.writer=k===1?AN:'me'; if(GM.advance) GM.advance(1/3);
    await say(GM,'老闆娘',L.SQ03.mid); await say(GM,null,L.SQ03.end);
    if(r.writer===AN){ fam(AN,2); r.helped=true; } S.finish(GM,'SQ03',r); return true; };

  /* ---------- SQ04：派出所（2D）---------- */
  S.ask04=async function(GM,r){ const G=GM.G, k=await GM.choose(L.SQ04.ask.map(t=>({t:q2(t)}))); r.ask=k; await say(GM,'店長',L.SQ04.askReply[k]);
    if(k!==0){ setAct(r,'ask',r.by!=null?r.by:G.day+7); return false; }
    setAct(r,'police',G.day+1); if(typeof OUT!=='undefined') OUT.plan(G,{id:'sq04_police',ev:'ev_sq04_police',day:G.day,h:+G.hour+0.25,late:1,place:'派出所',title:'送筆電去派出所',travel:'走路 約 10 分鐘',travelH:1/6}); return true; };
  S.POLICE_EV={ id:'ev_sq04_police', title:'派出所', participants:[], location:'any', trigger:'outing', background:'dark', hours:0.5,
    dialogue:[{scene:'派出所'},{speaker:null,text:L.SQ04.police}],   /* 派出所只用 2D 背景＋旁白（還沒有圖＝深色底）；LEGAL_REVIEW_REQUIRED */
    after:(G)=>{ const r=S.get(G,'SQ04'); if(r&&r.state==='open'&&r.step==='police') setWait(r,'wait',G.day+14); },
    outingMissed:(G)=>{ const r=S.get(G,'SQ04'); if(r&&r.state==='open'&&r.step==='police'){ r.state='lapsed'; r.lapseDay=G.day; } } };

  /* ---------- SQ05：公休（lane118.js 的 isOpen、order 照這裡）---------- */
  S.closedNote=function(G,shopId){ if(shopId!=='noodle2'||!G) return null; const r=S.get(G,'SQ05'); if(!r||r.closeFrom==null||(r.state!=='open'&&r.state!=='done')) return null; return G.day>=r.closeFrom&&G.day<=r.closeTo?q2(r.note):null; };

  /* ---------- SQ06：吉他社社課（下一次社課，ACTIVITIES club_guitar）---------- */
  S.clubNext=function(G){ if(typeof ACTIVITIES==='undefined'||!ACTIVITIES.list||!ACTIVITIES.on) return null; const a=ACTIVITIES.list.find(x=>x.id==='club_guitar'); if(!a) return null;
    for(let d=G.day+1;d<=G.day+21;d++) if(ACTIVITIES.on(a,d)) return {day:d,t0:a.t0,room:a.roomName||'萬才館'}; return null; };
  S.CLUB_EV={ id:'ev_sq06_club', title:'吉他社社課', participants:[ZQ], location:'any', trigger:'outing', background:'dark', hours:1,
    dialogue:[{scene:'萬才館 多功能教室'},{speaker:ZQ,text:L.SQ06.zq},{consequences:{rel:{[ZQ]:{fam:2}}}}],
    after:(G,GM)=>{ const r=S.get(G,'SQ06'); if(r&&r.state==='open'&&r.step==='club'){ r.helped=true; S.finish(GM||{G},'SQ06',r); } },
    outingMissed:(G)=>{ const r=S.get(G,'SQ06'); if(r&&r.state==='open'&&r.step==='club'){ r.state='lapsed'; r.lapseDay=G.day; } } };

  /* ---------- SQ07：學姊在 Café 看讀書計畫（S.tick）---------- */
  S.SIS_EV={ id:'ev_sq07_sis', title:'讀書計畫', participants:[SIS], location:'cafe', trigger:'manual', background:'blur',
    dialogue:[{speaker:SIS,text:L.SQ07.sis},{consequences:{rel:{[SIS]:{fam:2}}}}],
    after:(G)=>{ const r=S.get(G,'SQ07'); if(r&&r.state==='open'&&r.step==='sis'){ r.helped=true; setWait(r,'wait',G.day+21); } } };
  S.sisDue=(GM)=>{ const G=GM&&GM.G, r=G&&S.get(G,'SQ07'); return !!r&&r.state==='open'&&r.step==='sis'&&G.zone==='cafe'&&here(GM,SIS)&&!(GM.E&&GM.E.player&&GM.E.player.busy); };

  /* ---------- SQ08：公園的公布欄、象棋阿伯、蘇姨（wzpark3d.js、wzshops3d.js 叫）---------- */
  /* 看完公布欄：board＝沒有餵貓的說明；post＝把表貼上去（貼的那一句稿裡沒有）*/
  S.onNotice=async function(GM){ const G=GM.G, r=S.get(G,'SQ08'); if(!r||r.state!=='open') return false; S.lapse(G); if(r.state!=='open') return false;
    if(r.step==='board'){ await say(GM,null,L.SQ08.none); setAct(r,'ask',G.day+14); return true; }
    if(r.step==='post'){ await say(GM,null,L.SQ08.post); r.posted=G.day; S.finish(GM,'SQ08',r); return true; } return false; };
  /* 象棋阿伯（早上 08:00～11:00，下象棋）、一盞茶屋的蘇姨（下午 12:00～18:00）各說一次：那一句稿裡沒有，先用手機的提示 */
  S.ask8=async function(GM,k){ const G=GM.G, r=S.get(G,'SQ08'); if(!r||r.state!=='open'||r.step!=='ask'||r[k]) return false; const h=hr(G);
    if(k==='abo'&&(h<8||h>=11)) return false; if(k==='su'&&(h<12||h>=18)) return false; r[k]=G.day; await say(GM,k==='abo'?'阿伯':'蘇姨',L.SQ08.ask[k]);
    if(GM.toast) GM.toast('📝 順手的事：'+(k==='abo'?'問過象棋阿伯':'問過蘇姨'),2400);
    if(r.abo&&r.su){ await say(GM,null,L.SQ08.all); setAct(r,'back',G.day+14); } return true; };
  /* 公布欄上的餵貓表（PARK.notices）：貼上去以後一直在；第二天起多里長那一行；寒流那一週「沒吃」；12/17 起換成領養告示（PARK）*/
  S.parkNotices=function(G){ const r=G&&S.get(G,'SQ08'); if(!r||r.state!=='done'||r.posted==null) return []; if(typeof PARK!=='undefined'&&PARK.adoptNotice&&PARK.adoptNotice(G)) return [];
    const nmC=typeof PARK!=='undefined'&&PARK.catName?PARK.catName(G):null, L8=L.SQ08, lines=[L8.sheet]; if(G.day>=r.posted+1) lines.push(L8.chief); if(typeof PARK!=='undefined'&&PARK.coldWeek&&PARK.coldWeek(G)) lines.push(L8.cold);
    return [['餵貓表'+(nmC?'（'+nmC+'）':''),lines]]; };

  /* ---------- 第 3 節：公園的貓 ---------- */
  const CAT_D=()=>({night:DK('2028-12-14'),vet:DK('2028-12-15')});
  S.CAT_EV={ id:'ev_sq_cat_night', title:'寒流', participants:[ZQ], location:'wenzhou', trigger:'manual', once:true, background:'blur', spawn:{npc:ZQ,dist:2.2,pose:'idle'}, despawn:20,
    dialogue:[ {speaker:null,text:'（鞦韆旁邊，子晴蹲在石桌前面，手機的手電筒照著桌子底下。）'},
      {speaker:ZQ,text:'牠三天沒吃了。我每天都有看那張表。'},{speaker:ZQ,text:'……我家有電暖器。'},
      {choice:[{text:'「妳要帶牠回去？」',goto:'a'},{text:'「我幫妳抱。」',goto:'b'}]},
      {label:'a'},{speaker:ZQ,text:'先帶去看醫生。……之後再說。'},{goto:'c'},
      {label:'b'},{speaker:null,text:'（牠很輕。比你記得的輕很多。）'},
      {label:'c'},{speaker:null,text:'（她把外套脫下來，把牠包起來。牠沒有掙扎。）'},
      {unless:{flags:['ZQ_CAT_SAID']},speaker:ZQ,text:'我做的那隻貓，是照牠畫的。你知道嗎。'},
      {if:{flags:['ZQ_CAT_SAID']},speaker:ZQ,text:'我做的那隻貓，你說過是牠。……你是對的。'},   /* AA_400 第 3 節：測試版那天說過「這隻貓是公園那隻？」的（ZQ_CAT_SAID）換這句 */
      {speaker:null,text:'（她沒有等你回答。）'},
      {set:{ZQ_CAT_NIGHT:true}} ] };
  S.catNightDue=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!law(G)||G.flags.ZQ_CAT_NIGHT) return false; const D=CAT_D(); if(D.night==null||G.day!==D.night) return false; const h=hr(G); if(h<22+10/60||h>=23) return false;
    if(G.zone!=='wenzhou'||!E||!E.player||!E.player.obj||E.player.busy) return false; const p=E.player.obj.position; if(typeof PARK!=='undefined'&&PARK.inPark&&!PARK.inPark(p.x,p.z)) return false;
    return met(ZQ)&&stageAt(ZQ,'FAMILIAR')&&!(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G)); };
  /* 收養以後每月第一個週六的照片（2029-01～06，照順序各一次）*/
  S.PHOTO_MONTHS=['2029-01','2029-02','2029-03','2029-04','2029-05','2029-06'];
  S.firstSat=function(ym){ const d0=DK(ym+'-01'); if(d0==null) return null; for(let d=d0;d<d0+7;d++) if(dateOf(d).wd%7===6) return d; return null; };
  S.catPhone=function(G){ if(!G||!G.flags||typeof PHONE==='undefined') return; const F=G.flags, D=CAT_D();
    if(F.ZQ_CAT_NIGHT&&D.vet!=null&&G.day<=D.vet&&!sent(G,'sqcat_vet')) PHONE.at(G,D.vet,12,L.CAT.vet.map(t=>dm(ZQ,t)),'sqcat_vet');
    const know=met(ZQ)&&(typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,ZQ));
    if(know) S.PHOTO_MONTHS.forEach((ym,n)=>{ const d=S.firstSat(ym); if(d==null||G.day<d||G.day>d+1||sent(G,'sqcat_ph'+n)) return;
      const M=L.CAT.photos[n].map(t=>dm(ZQ,t)); if(S.dating(G,ZQ)) M[M.length-1].ask={id:'sqcat_visit'+n,until:(d+6)*24+22,opts:[{t:'（去看貓）',post:false,set:{SQ_CAT_VISIT:n+1}}]};
      PHONE.at(G,d,12,M,'sqcat_ph'+n); });
    if(F.SQ_CAT_VISIT){ const n=F.SQ_CAT_VISIT; delete F.SQ_CAT_VISIT; if(typeof OUT!=='undefined') OUT.plan(G,{id:'sq_cat_visit'+n,ev:'ev_sq_cat_visit',day:G.day+1,h:14,late:1,place:'子晴的家',title:'去看貓',travel:'捷運 約 30 分鐘',travelH:0.5}); } };
  S.VISIT_EV={ id:'ev_sq_cat_visit', title:'去看貓', participants:[ZQ], location:'any', trigger:'outing', background:'dark', hours:2,
    dialogue:[{scene:'子晴的家'},{consequences:{rel:{[ZQ]:{fam:1}}}}] };   /* 2D 出遊，每月一次（照片那一則的回覆）；她媽媽在家，不另外寫台詞（AA_397 3-3）*/

  /* ---------- 手機（STORY.PHONE_RULES）：期限、SQ05 病床的照片、SQ06 家教回報、貓 ---------- */
  S.phone=function(G){ if(!G||!G.flags||!G.side&&!G.flags.ZQ_CAT_NIGHT&&!met(ZQ)) return; S.lapse(G);
    if(typeof PHONE!=='undefined'){
      const r5=S.get(G,'SQ05'); if(r5&&r5.zhe&&r5.closeFrom!=null&&G.day>=r5.closeFrom&&G.day<=r5.closeFrom+1&&!sent(G,'sq05_photo')) PHONE.at(G,r5.closeFrom,20,L.SQ05.photo.map(t=>({th:'g:noodle_team',name:'六張犁麵舖老闆',text:t})),'sq05_photo');   /* 開刀那天 20:00（阿哲把卡片拿去醫院）*/
      const r6=S.get(G,'SQ06'); if(r6&&r6.state==='open'&&r6.step==='lesson'&&G.day>=r6.wait){
        if(r6.tutor!=='me'&&!sent(G,'sq06_report')){ if(G.day>r6.wait||hr(G)>=21) PHONE.at(G,r6.wait,21,[dm(r6.tutor,L.SQ06.report)],'sq06_report'); }
        if(r6.tutor==='me'||sent(G,'sq06_report')&&now(G)>=r6.wait*24+21){ if(r6.tutor===AN){ fam(AN,1); r6.helped=true; } r6.step='twist'; } } }   /* 以安當家教：幫忙的女主角熟悉 +1（做完時不再加旁邊的人）*/
    S.catPhone(G); };
  let busy=false;
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!law(G)||typeof EVENTS==='undefined'||!EVENTS.run) return false;
    let ev=null; if(S.catNightDue(GM)){ ev=S.CAT_EV; const L0=typeof WZ_PARK_LAYOUT!=='undefined'?WZ_PARK_LAYOUT:null, pav=L0&&L0.items&&L0.items.find(i=>i.kind==='pavilion'); if(pav) ev.spawn.at={x:pav.x+1.1,z:pav.z+0.6}; }   /* 她蹲在涼亭的石桌前面 */
    else if(S.sisDue(GM)) ev=S.SIS_EV;
    if(!ev) return false; busy=true; Promise.resolve().then(()=>EVENTS.run(ev)).catch(e=>console.warn('SIDEQ',e)).finally(()=>{ busy=false; }); return true; };
  if(typeof STORY_EVENTS!=='undefined') for(const e of [S.FAFU_EV,S.POLICE_EV,S.CLUB_EV,S.SIS_EV,S.CAT_EV,S.VISIT_EV]) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tick(GM)); }
  return S;
})();

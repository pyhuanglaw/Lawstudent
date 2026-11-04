/* ===== AA_660 交換路線在臺灣的空白日：第一批（企劃線 claude/magical-albattani-bk7b4n 0777c92ac，AA-C 2026-11-04；
   版本：d88f39e3f 第一版 → 090981ebe G1-1 起飛時間更正（AA_667 第 4 節）→ 0777c92ac 回 LAWWW-C 的五件（G2-1 改成媽媽接到以後在群組報、G3-2 改寒假、
   G1-3 Alison 不在＝芯慈拿清單、G1-1 第二個回法媽媽堅持要送、AA_494 子晴、可昕兩句店名改 2:30 AM〔src/data/heroine_asks.js〕）；
   任務 VAC-GAP-ROUTES → AA660-VAC-GAP-1104；第①級，AA 定稿 D109；D99 第二、三項）=====
   台詞照稿第 2 節一字不改（S.L）；接線照第 3 節：條件一律看 STORY.routeAbroadRoute（臺灣路線、還沒定都不出現）。
   G1 美國路線出發前一週（7/25 退宿以後住家裡，8/2 出發）：
     G1-1 7/27（四）21:00 家人群組：媽媽問幾點的飛機（兩個回法，媽媽各回：「早上九點半。」〔090981ebe〕／「不用載，我自己去。」〔0777c92ac：8/2 媽媽在機場塞鳳梨酥，AA_253 9-1〕）→ 姊姊兩則、爸爸「？」接在回覆後面；
          兩個小時沒回（過了 23:00）照樣傳那三則、quiet（同 home3d.js 寒暑假週四那一則「兩小時沒回，爸爸傳「？」」）。
     G1-2 7/29（六）摘要日：holff3d.js 的 HOLFF.SUMS（route:'US'；快轉、睡覺停在 18:30，日期卡下面那一行）。
     G1-3 7/30（日）21:00 桌遊團群組（noodle_team）＋7/31（一）19:00 出遊「餞行」（公館燒臘，ev_aa660_us_farewell）：
          到場的人＝那天在臺北（STORY.presence）而且認識的（STORY.knows）：Alison、明軒、芯慈；不在的不出現（她的台詞、提到她的旁白都不演）。
          揪的人：Alison 在＝Alison；不在＝明軒（第一句換明軒，第二句跟著他說，他自己那句「會到。」不說）；兩個都不在＝不揪、不排。阿哲那句只在他人在高雄的時候。
          燒臘那一場：Alison 在＝Alison 拿清單（S.L.g13）；Alison 不在（S.att 不成立：沒認識、那天不在臺北）、芯慈在＝芯慈拿清單（S.L.g13xc，0777c92ac）；
          明軒那句（「最後那個是我寫的。」）只在有人拿清單、他也在的時候；芯慈時差那段兩版都一樣。
          稿上芯慈那一版清單旁白後面的「（芯慈的顏色筆，這學期用這一次）」是給審稿看的口頭禪額度註記（00_台詞寫作規則.md 第 6 節：芯慈「計畫表、顏色筆、做表」每學期 1），不演。
          拍照清單：演完那一場＝G.flags.US_PHOTO_LIST＝true；芯慈給的另外記 US_PHOTO_LIST_XC＝true（舊存檔都沒有＝沒有清單／Alison 給的）。
          Alison、芯慈都不在（只有明軒）：照舊排出遊、那一場沒有台詞（稿沒有這一版）。
          出發的提示最早 18:30（OUT 的 ask）：r2y3b3d.js 同一天 18:30 的摘要日（大三暑假三選一第三句，美國路線 7/31）先演，再問出發。
     G1-4 8/1（二）22:00 家人群組三則。
     G1-5 美國第一週的週末：8/5（六）臺灣 21:00（當地 09:00，STORY.tzOffset）桌遊團群組——你（自動）松鼠的照片、Alison 兩則（要有 US_PHOTO_LIST；US_PHOTO_LIST_XC＝芯慈那兩則，稿上的換句表）。
          其他三樣（洋芋片、教室、房間）：AA_340 G1、G2 在遊戲裡只有摘要日（us_life_events.js summary）、沒有玩家傳照片的動態，照第 3 節「沒有就不發；不另外做照片系統」——不發。
   G2 美國路線回國當天（12/23）：
     G2-1 家人群組（S.G21_ON＝true，0777c92ac）：12/23 媽媽到入境大廳接（r2y4a_events.js ev_us_return）、九點回到家（ev_us_home）以後，S.G21_H＝10:30 媽媽在群組跟爸爸、姊姊報——
          沒有你（自動）那一則；回到家以後睡到下午、傍晚去 409（exchange3d.js EXCH.returnHome、story3d.js STORY.roomY4FromAirport），那幾則照 10:30 補進去。
     G2-2 21:00 桌遊團群組：有 US_PHOTO_LIST＝清單最後一項（選項：傳自己的照片／見面再給你們看）；US_PHOTO_LIST_XC＝芯慈、明軒的版本（第一句明軒「回來了？」）；
          沒有清單＝「桌遊夜幫你留位子」（下一次桌遊夜照 bgnight3d.js 原本的群組通知）；沒有清單、也沒認識 Alison＝只有明軒「回來了？」（稿沒寫，LAWWW-C 定）。
     G2-3 12/24 Kevin 那一則：heard_lines.js h509_kevin 的 alt（cond usRoute：第一句換「學姊跟學弟都回來了」，後面照舊；heard3d.js S.altItems）。
   G3 美國路線回國後：12/25（一）、2029-01-13（六）摘要日（HOLFF.SUMS route:'US'；1/13 是寒假那一句，0777c92ac）。
   G4 日本路線 3/23 阿哲那則：y34b3d.js S.anPhone（y3_an_farewell_ask），日本路線第一句換「明天 幫以安跟祐廷餞行」；3/24 那一場的台詞照舊。
   G5 日本路線回國當天：G5-1 家人群組（落地那個時間：jp3d.js 回程記 G.flags.JP_RETURN_H；舊存檔沒有＝13:00）；
     G5-2 21:00 桌遊團群組：和以安交往中、而且熟過 ACQUAINTANCE＝Alison「你們兩個回來了？？」＋以安三則（最後一則兩個回法）；不是＝只有 Alison「回來了？？」。
   G6 日本路線回國後的摘要日：8/12（六）、8/22（二）、8/29（二）18:30（JP.SCH w:'home'，jp3d.js 住家裡那一段的快轉照停）。
        8/12 jp3d.js 原本就有 s_0812（HOLFF.y3sPath 那一句）：這一句排在它後面（同一個停點，接著演）。
   舊存檔：訊息只補到那個時間的隔天（G.day ≦ 那天＋1），再晚不補；出遊只在 7/31 19:45 以前排；摘要日只停在還沒到的時間；回國的那幾則看回程的旗標（JP_RETURN_LATE＝早就過了回程的舊存檔，不補）。
   存檔：旗標 US_PHOTO_LIST（true）、US_PHOTO_LIST_XC（true＝清單是芯慈給的）、JP_RETURN_H（jp3d.js）；訊息照 PHONE 的 tag（aa660_*）；出遊 G.outings 的 aa660_us_farewell。
   測試：node tests/aa660_vac_gap_unit.js */
'use strict';
const AA660=(function(){
  const S={};
  if(typeof STORY==='undefined') return S;
  const DK=k=>STORY.dayOfKey?STORY.dayOfKey(k):null, T=(d,h)=>d*24+h, NOW=G=>T(G.day,+G.hour||0);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const R=G=>STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):null;
  const P_=()=>typeof PHONE!=='undefined'?PHONE:null;
  const inGrp=(G,g)=>{ const P=P_(); return !!(P&&P.inGroup&&P.inGroup(G,g)); };
  const sent=(G,tag)=>{ const P=P_(); return !!(P&&P.sent(G,tag)); };
  const knows=(id,G)=>!!STORY.knows&&!!STORY.knows(id,G);
  const pres=(id,G,d)=>STORY.presence?STORY.presence(id,Object.assign({},G,{day:d})):{here:true};
  const here=(id,G,d)=>{ const p=pres(id,G,d); return !p||p.here!==false; };
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, Rm=F.romance||{}; return F['dating_'+id]===true||!!(Rm[id]&&Rm[id].status==='dating'); };
  const stageAbove=(id,lv)=>{ const So=typeof SOCIAL!=='undefined'?SOCIAL:null; if(!So||!So.STAGES||!So.stage||!(So.has&&So.has(id,'FIRST_MET'))) return false; return So.STAGES.indexOf(So.stage(id))>So.STAGES.indexOf(lv); };
  const tz=(G,d)=>STORY.tzOffset?(+STORY.tzOffset(G,d)||0):0;
  S.loc=(G,d,h)=>{ const t=T(d,h)+tz(G,d), dd=Math.floor(t/24+1e-9); return {day:dd,h:+(t-dd*24).toFixed(4)}; };   /* 臺灣時間 → 遊戲時鐘（人在國外＝當地時間；同 heard3d.js 的 S.loc）*/
  const YU='yu', MX='classmate_mingxuan', XC='classmate_xinci', ZHE='zhe', AN='heroine_01';
  const NT='g:noodle_team', HM='g:home';
  const FAMN={mom:'媽媽',dad:'爸爸',sister:'姊姊'};
  const fam=([w,t])=>({th:HM,from:w,name:FAMN[w],text:t});   /* 家人群組的寫法（同 holff3d.js 的 famMsg）*/
  const grp=([w,t])=>({th:NT,from:w,text:t});
  const joinHome=G=>{ const P=P_(); if(P&&P.join) P.join(G,'home','家人'); };

  /* ---------------- 台詞（AA_660 第 2 節，一字不改；[說的人, 句子]）---------------- */
  S.L={
    g11:{ask:[['mom','八月二號幾點的飛機']],   /* G1-1 */
      opts:[{t:'早上九點半。',say:[['mom','那六點要出門'],['mom','我載你']]},{t:'不用載，我自己去。',say:[['mom','我要去。我要看你進去。']]}],   /* 第一個回法：090981ebe 更正（AA_667 第 4 節：09:30 起飛）；第二個回法：0777c92ac（原本自己搭機捷那一句，和 8/2 媽媽在機場塞鳳梨酥接不上）*/
      after:[['sister','記得帶轉接頭'],['sister','……不用 美國插座跟我們一樣 我剛查了'],['dad','？']]},
    g12:'（宿舍搬空了。家裡你的房間多了幾個紙箱，最上面那個用奇異筆寫著「美國」。）',   /* G1-2 7/29 */
    g13grp:{yu:[[YU,'禮拜一幫祐廷餞行'],[YU,'七點 燒臘店']],mx0:'禮拜一幫祐廷餞行',zhe:[ZHE,'我在高雄 幫我多吃一盤'],mx:[MX,'會到。']},   /* G1-3 群組；mx0＝Alison 不在、明軒揪的第一句 */
    g13:{open:'（燒臘店最裡面那張長桌。Alison 把一張折成四折的紙推到你面前。）',yu:'這是我們列的。你到了以後要拍給我們看的東西。',
      list:'（紙上寫著：校園的松鼠、超市最大包的洋芋片、教室、你的房間。最後一行是明軒的字：「你自己」。）',mx:'最後那個是我寫的。……拍你自己，不要只拍風景。',
      xc:'時差幾個小時？',opts:['「夏天差十二個小時。」','「我也還沒查。」'],xcA:'那你睡覺的時候我們剛起床。……訊息不用馬上回。',xcB:'十二個小時。我剛剛查了。',
      close:'（吃完，Alison 把那張紙折好，塞進你的護照套裡。）'},   /* G1-3 7/31 公館燒臘 */
    g13xc:{open:'（燒臘店最裡面那張長桌。芯慈把一張折成四折的紙推到你面前。）',xc:'這是我們列的。你到了以後要拍給我們看的東西。',
      list:'（紙上用三種顏色的筆寫著：校園的松鼠、超市最大包的洋芋片、教室、你的房間。最後一行是明軒的字：「你自己」。）',
      close:'（吃完，芯慈把那張紙折好，塞進你的護照套裡。）'},   /* G1-3 Alison 不在、芯慈拿清單（0777c92ac）；明軒那句、芯慈時差那段照 g13；稿上 list 後面的額度註記不演（見檔頭）*/
    g14:[['mom','明天五點我叫你'],['dad','到了在群組說一聲'],['sister','一路平安']],   /* G1-4 8/1 */
    g15:{me:'📷（校園的松鼠，站在垃圾桶的蓋子上）',yu:[[YU,'打勾！！'],[YU,'剩下三個']],xc:[[XC,'打勾。'],[XC,'剩下三個']]},   /* G1-5；xc＝清單是芯慈給的（稿 G1-3 下面的換句表：「打勾！！」→「打勾。」、「剩下三個」照用）*/
    g21:[['mom','接到了'],['mom','📷（餐桌上一鍋蘿蔔排骨湯，旁邊一碗已經盛好了）'],['dad','平安就好'],['sister','先讓他睡']],   /* G2-1（S.G21_ON、S.G21_H；0777c92ac）*/
    g22:{back:[YU,'回來了？？'],list:[[YU,'清單最後一項 你一直沒拍'],[MX,'現在拍也可以。']],
      opts:[{t:'（傳一張自己的照片：背景是機場的行李轉盤，你看起來很睏。）',say:[[MX,'好。這張可以。'],[YU,'打勾！！清單完成']]},{t:'見面再給你們看。',say:[[YU,'好啦 那也算']]}],
      noList:[YU,'桌遊夜幫你留位子'],
      xc:{back:[MX,'回來了？'],list:[[XC,'清單最後一項，你一直沒拍。'],[MX,'現在拍也可以。']],
        opts:[{t:'（傳一張自己的照片：背景是機場的行李轉盤，你看起來很睏。）',say:[[MX,'好。這張可以。'],[XC,'清單完成。']]},{t:'見面再給你們看。',say:[[XC,'好。那也算。']]}]}},   /* G2-2；xc＝清單是芯慈給的（換句表；第一句「回來了？？」→ 明軒「回來了？」）；沒有清單、也沒認識 Alison＝只發 xc.back */
    g23:'學姊跟學弟都回來了',   /* G2-3（heard_lines.js h509_kevin 的 alt）*/
    g31:'（凌晨四點就醒了。外面還是黑的，你躺著聽樓下的機車一台一台騎過去。）',   /* G3-1 12/25 */
    g32:'（寒假的總圖人很少。你把美國的筆記重新整理一遍，有些字你一時想不起中文怎麼說。）',   /* G3-2 1/13（0777c92ac：大四上期末週是 12/18～12/24，1/13 已經是寒假）*/
    g4:'明天 幫以安跟祐廷餞行',   /* G4（y34b3d.js）*/
    g51:{me:'到了',fam:[['mom','好'],['mom','冰箱有切好的芒果'],['dad','平安就好']]},   /* G5-1 */
    g52:{both:[YU,'你們兩個回來了？？'],an:[[AN,'回來了。'],[AN,'排隊入境的時候，祐廷站著睡著了。']],
      opts:[{t:'那叫閉眼睛。',say:[[AN,'閉到輪到我們。']]},{t:'……妳也有。',say:[[AN,'我是在想事情。']]}],only:[YU,'回來了？？']},   /* G5-2 */
    g6:{'2028-08-12':'（你在超商結帳的時候，差一點用日文說了謝謝。店員看了你一眼。）','2028-08-22':'（你把日本帶回來的筆記一本一本貼上標籤：比較行政法、日文、研討課。）',
      '2028-08-29':'（晚上的溫州街有一點涼了。你走到巷口買了一杯冰的，站在路燈下面喝完。）'} };   /* G6 */

  /* ---------------- 日子 ---------------- */
  S.K={flight:'2028-07-27',grp:'2028-07-30',farewell:'2028-07-31',eve:'2028-08-01',photo:'2028-08-05',usRet:'2028-12-23',jpRet:'2028-08-05'};   /* 摘要日的日子在下面 S.SUMS、S.SCH */
  const D=k=>DK(S.K[k]);
  S.G21_ON=true;   /* G2-1：AA 0777c92ac 改好了，照稿發（false＝不發；開關留著）*/
  S.G21_H=10.5;   /* G2-1 的時間：12/23 媽媽接到人、九點回到家（r2y4a_events.js ev_us_home）以後，約 10:30（稿 G2-1）*/
  S.LAND_JP=13;   /* 日本路線舊存檔沒有 JP_RETURN_H：jp3d.js 回程的最早落地時間 */
  S.FAREWELL={id:'aa660_us_farewell',ev:'ev_aa660_us_farewell',h:19,ask:18.5,late:0.75};
  const US=G=>law(G)&&R(G)==='US', JPR=G=>law(G)&&R(G)==='JP';

  /* ---------------- G1-3 到場的人 ---------------- */
  S.att=(G,id)=>{ const d=D('farewell'); return d!=null&&knows(id,G)&&here(id,G,d); };   /* 那天在臺北、而且認識 */
  S.organizer=G=>S.att(G,YU)?YU:(S.att(G,MX)?MX:null);
  S.zheAway=G=>{ const d=D('farewell'); if(d==null) return false; const p=pres(ZHE,G,d); return !!p&&p.here===false&&(p.home==='高雄'||/高雄/.test(String(p.away||''))); };   /* 「我在高雄」只在他人在高雄的時候 */
  S.farewellGrp=function(G){ const L=S.L.g13grp, org=S.organizer(G); if(!org) return null;
    const M=org===YU?L.yu.slice():[[MX,L.mx0],[MX,L.yu[1][1]]]; if(S.zheAway(G)) M.push(L.zhe); if(org===YU&&S.att(G,MX)) M.push(L.mx); return M.map(grp); };

  /* ---------------- 手機（STORY.PHONE_RULES）---------------- */
  S.phone=function(G){ const P=P_(); if(!P||!law(G)) return; const F=G.flags||(G.flags={}), now=NOW(G);
    if(US(G)){
      /* G1-1 7/27 21:00 */
      { const d=D('flight'), tag='aa660_us_flight', X=S.L.g11;
        if(d!=null&&!F.US_DEPARTED&&now>=T(d,21)&&G.day<=d+1&&!sent(G,tag)){ joinHome(G); const M=X.ask.map(fam);
          M[M.length-1].ask={id:tag,until:T(d,23),opts:X.opts.map(o=>({t:o.t,say:o.say.concat(X.after).map(fam)}))}; P.at(G,d,21,M,tag); }
        const m=P.byAsk?P.byAsk(G,tag):null, t2=tag+'_sis';   /* 兩個小時沒回（過了 23:00、回不了了）：照樣傳姊姊、爸爸那三則，時間寫 23:00；quiet＝收進手機、快轉不停（同 home3d.js 寒暑假週四那一則爸爸的「？」）*/
        if(d!=null&&m&&m.ans==null&&now>T(d,23)+1e-6&&G.day<=d+1&&!sent(G,t2)) P.at(G,d,23,X.after.map(x=>Object.assign(fam(x),{quiet:true})),t2); }
      /* G1-3 7/30 21:00 群組 → 7/31 19:00 出遊（群組那幾則也只在餞行還來得及的時候傳：舊存檔過了 7/31 19:45 才讀進來＝不補）*/
      { const d=D('grp'), d31=D('farewell'), tag='aa660_us_farewell_grp', Q=S.FAREWELL, open=d31!=null&&now<T(d31,Q.h)+Q.late;
        if(d!=null&&open&&!F.US_DEPARTED&&now>=T(d,21)&&inGrp(G,'noodle_team')&&!sent(G,tag)){ const M=S.farewellGrp(G); if(M) P.at(G,d,21,M,tag); }
        if(open&&sent(G,tag)&&typeof OUT!=='undefined'&&OUT.plan&&!OUT.get(G,Q.id))
          OUT.plan(G,{id:Q.id,ev:Q.ev,day:d31,h:Q.h,ask:T(d31,Q.ask),late:Q.late,place:'公館燒臘',title:'餞行',travel:'走過去約 10 分鐘',travelH:1/6}); }
      /* G1-4 8/1 22:00 */
      { const d=D('eve'), tag='aa660_us_eve_fam'; if(d!=null&&!F.US_DEPARTED&&now>=T(d,22)&&G.day<=d+1&&!sent(G,tag)){ joinHome(G); P.at(G,d,22,S.L.g14.map(fam),tag); } }
      /* G1-5 8/5 臺灣 21:00（當地 09:00）*/
      { const d=D('photo'), tag='aa660_us_photo1'; if(d!=null&&F.US_PHOTO_LIST&&F.US_ARRIVED&&F.US_RETURNED==null&&inGrp(G,'noodle_team')&&!sent(G,tag)){ const w=S.loc(G,d,21);
          if(now>=T(w.day,w.h)&&G.day<=w.day+1){ if(!sent(G,tag+'_me')) P.postAt(G,{th:NT,from:'player',who:null,text:S.L.g15.me,tag:tag+'_me'},w.day,w.h); P.at(G,w.day,w.h,(F.US_PHOTO_LIST_XC?S.L.g15.xc:S.L.g15.yu).map(grp),tag); } } }   /* 清單是芯慈給的＝芯慈回 */
      /* G2-1 12/23 10:30（S.G21_ON、S.G21_H：媽媽接到人、回到家以後）、G2-2 12/23 21:00 */
      { const d=D('usRet'); if(d!=null&&F.US_RETURNED!=null&&G.day<=d+1){
          if(S.G21_ON&&now>=T(d,S.G21_H)&&!sent(G,'aa660_us_back_fam')){ joinHome(G); P.at(G,d,S.G21_H,S.L.g21.map(fam),'aa660_us_back_fam'); }   /* 睡到下午才讀到的：照 10:30 補（PHONE.tick）*/
          const tag='aa660_us_back_grp', X=F.US_PHOTO_LIST_XC?S.L.g22.xc:S.L.g22; if(now>=T(d,21)&&inGrp(G,'noodle_team')&&!sent(G,tag)){
            if(F.US_PHOTO_LIST){ const M=[X.back].concat(X.list).map(grp); M[M.length-1].ask={id:'aa660_us_back_photo',until:T(d+1,18),opts:X.opts.map(o=>({t:o.t,say:o.say.map(grp)}))}; P.at(G,d,21,M,tag); }
            else P.at(G,d,21,(knows(YU,G)?[S.L.g22.back,S.L.g22.noList]:[S.L.g22.xc.back]).map(grp),tag); } } } }   /* 沒有清單、也沒認識 Alison：只有明軒「回來了？」、不發「桌遊夜幫你留位子」（LAWWW-C 定）*/
    if(JPR(G)){
      /* G5-1 落地、G5-2 21:00 */
      const r=D('jpRet'), d=F.JP_RETURNED; if(r!=null&&typeof d==='number'&&!F.JP_RETURN_LATE&&d>=r&&d<=r+1&&G.day<=d+1){
        const h=typeof F.JP_RETURN_H==='number'?F.JP_RETURN_H:S.LAND_JP;
        if(now>=T(d,h)&&!sent(G,'aa660_jp_back_fam')){ joinHome(G); if(!sent(G,'aa660_jp_back_me')) P.postAt(G,{th:HM,from:'player',who:null,text:S.L.g51.me,tag:'aa660_jp_back_me'},d,h); P.at(G,d,h,S.L.g51.fam.map(fam),'aa660_jp_back_fam'); }
        const tag='aa660_jp_back_grp', X=S.L.g52; if(now>=T(d,21)&&inGrp(G,'noodle_team')&&!sent(G,tag)){
          if(dating(G,AN)&&stageAbove(AN,'ACQUAINTANCE')){ const M=[X.both].concat(X.an).map(grp); M[M.length-1].ask={id:'aa660_jp_back_an',until:T(d+1,18),opts:X.opts.map(o=>({t:o.t,say:o.say.map(grp)}))}; P.at(G,d,21,M,tag); }
          else P.at(G,d,21,[X.only].map(grp),tag); } } } };

  /* ---------------- G1-3 的出遊（2D；台詞照稿）---------------- */
  const C=f=>({custom:f}), aYU=G=>S.att(G,YU), aXC=G=>!aYU(G)&&S.att(G,XC);   /* aXC：Alison 不在、芯慈在＝芯慈拿清單（0777c92ac）*/
  S.listBy=G=>aYU(G)?YU:(aXC(G)?XC:null);   /* 7/31 誰拿清單出來（沒有人＝沒有清單）*/
  S.EVENTS=[
    { id:'ev_aa660_us_farewell', title:'餞行', participants:[], location:'any', trigger:'outing', once:true, background:'dark',
      dialogue:[ {scene:'公館燒臘・長桌',bg:'noodle_table'},
        {if:C(aYU),speaker:null,text:S.L.g13.open},
        {if:C(aYU),speaker:YU,text:S.L.g13.yu},
        {if:C(aYU),speaker:null,text:S.L.g13.list},
        {if:C(aXC),speaker:null,text:S.L.g13xc.open},
        {if:C(aXC),speaker:XC,text:S.L.g13xc.xc},
        {if:C(aXC),speaker:null,text:S.L.g13xc.list},
        {if:C(G=>!!S.listBy(G)&&S.att(G,MX)),speaker:MX,text:S.L.g13.mx},
        {unless:C(G=>S.att(G,XC)),goto:'end'},
        {speaker:XC,text:S.L.g13.xc},
        {choice:[{text:S.L.g13.opts[0],goto:'a'},{text:S.L.g13.opts[1],goto:'b'}]},
        {label:'a'},{speaker:XC,text:S.L.g13.xcA},{goto:'end'},
        {label:'b'},{speaker:XC,text:S.L.g13.xcB},
        {label:'end'},
        {if:C(aYU),speaker:null,text:S.L.g13.close},
        {if:C(aXC),speaker:null,text:S.L.g13xc.close},
        {if:C(aYU),set:{US_PHOTO_LIST:true}},
        {if:C(aXC),set:{US_PHOTO_LIST:true,US_PHOTO_LIST_XC:true}} ] } ];

  /* ---------------- 摘要日（G1-2、G3：holff3d.js；G6：jp3d.js）---------------- */
  S.SUMS=[{date:'2028-07-29',route:'US',line:S.L.g12,aa660:'G1-2'},{date:'2028-12-25',route:'US',line:S.L.g31,aa660:'G3-1'},{date:'2029-01-13',route:'US',line:S.L.g32,aa660:'G3-2'}];
  S.SCH=Object.keys(S.L.g6).map(k=>({k:'aa660_g6_'+k.slice(5).replace('-',''),d:k,h:18.5,w:'home',sum:S.L.g6[k]}));   /* 8/12 排在 jp3d.js s_0812 後面（JP.SCH 照順序演）*/

  /* ---------------- 登記 ---------------- */
  if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  if(typeof HOLFF!=='undefined'&&Array.isArray(HOLFF.SUMS)) for(const s of S.SUMS) if(!HOLFF.SUMS.some(x=>x.aa660===s.aa660)) HOLFF.SUMS.push(s);
  if(typeof JP!=='undefined'&&Array.isArray(JP.SCH)) for(const s of S.SCH) if(!JP.SCH.some(q=>q.k===s.k)) JP.SCH.push(s);
  return S;
})();

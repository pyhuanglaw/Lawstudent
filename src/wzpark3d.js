/* ===== 溫州街小公園的互動（DL-09／DL-13；文字＝AA-B 的 AA_171 定稿，企劃線 3d5feef2；規則 AA_164 5-4、5-5）=====
   都不扣時段次數，只花時間：坐在樹下 20 分、看公布欄 0 分、下象棋 30 分（08:00～11:00）、盪鞦韆 10 分（20:00 以後）、拜土地公 5 分（一天一次）、直飲台 0 分、摸貓 5 分、餵貓 5 分（各一天一次）。
   存檔（一般狀態，不是劇情旗標）：G.daily.park＝{treeDay, treeUsed:[], chessN, chessOpen, swingN, shrineDay, fountainDay, catName, petDay, feedDay, feedN, sawTutorAd}；
   G.daily.catCans：小罐貓罐頭的數量（便利商店 35 元，AA_164 5-4）。舊存檔沒有＝從頭開始。
   位置（zones3d.js buildWzPark 加的互動點，park 欄位）：老樹下的圓椅（tree）、鞦韆（swing）、公布欄（notice）、涼亭的象棋（chess）、土地公（shrine）、直飲台（fountain）、貓（cat，圓椅北邊；下雨在涼亭的石桌底下）。
   公園裡照時段出現的路人、走進公園的一句、點路人的一句：AA_283（企劃線 8b312c12），在這個檔案最後一段；3D 的人由 crowd3d.js 的 CROWD.parkSpots 照 S.groups 放。
   公園的貓被子晴收養（AA_397 第 3 節，企劃線 8f1701b23；劇情在 src/sideq3d.js）：寒流那一週（2028-12-11～12-14 23:00）貓縮在涼亭的石桌下面（S.catCold；catUnder 照它放）、
     「看」＝一句旁白、沒有摸／餵；12/14 23:00 以後（或那一場演完）貓不在了（S.catGone／S.catAdopted：3D 的貓 LAWWW2 照它不顯示）——摸、餵的選單拿掉，「看圓椅」那一句一次（S.catHidden 之後藏起來）；
     12/17 起公布欄換成領養告示（S.adoptNotice）；不在場的玩家：象棋阿伯一句（一次）。提到貓在圓椅上的句子，貓不在以後不播（和大三上第 10 週貓不見一樣）。
   順手的事第二、三批（src/sideq3d.js）：SQ14 回診（AA_404）＝「看」貓先問 SIDEQ.cage14、演過的告示多「（豆花）」（SIDEQ.adoptExtra）；SQ18 里長（AA_405）做完＝「——里長」的字條、名牌多一行（SIDEQ.knowsChief）。
   測試：node tests/wz_park_talk_unit.js、node tests/wz_park_people_unit.js、node tests/aa397_sideq_unit.js */
'use strict';
const PARK=(function(){
  const S={};
  const TREE={ spring:['杜鵑花籬開了一半。阿伯的象棋聲，啪、啪。','溜滑梯上排了一串小孩。阿嬤們在聊誰家的孫子考幾分。','路燈還沒亮，天先變成藍色。{cat}從樹上下來了。','杜鵑的味道很淡。只剩下你和{cat}。'],
    summer:['還沒九點，蟬已經開始叫了。樹下比宿舍涼。','太熱了，公園裡只有你，和躲在樹蔭裡的{cat}。','有人在直飲台裝水。鞦韆在風裡自己晃。','蚊子比人多。{cat}看你一眼，好像在問你為什麼還不回宿舍。'],
    autumn:['楓香開始變紅了。阿伯說，今年紅得比較早。','隔壁的上班族在樹下閉眼睛五分鐘。鬧鐘響，他回去上班。','落葉掃成一堆。小孩跳進去，阿嬤在後面喊。','風有點涼了。你把外套拉起來，{cat}靠過來一點。'],
    winter:['象棋的阿伯戴了毛帽。輸的那一個，還是不肯走。','太陽很短。三點多，影子已經很長了。','土地公廟的紅燈籠亮著。公園裡只有那一點紅。','很冷。{cat}不在。你猜牠在茶屋的緣側。'] };
  const NEIGHBOR={9:'中秋聯歡晚會，里民活動中心，請自備碗筷',12:'里民大會，有摸彩',2:'春節揮毫，寫春聯，免費',5:'端午包粽子教學，限二十名'}, NEIGHBOR_ELSE='社區清掃日，週日早上八點，請帶手套';
  const CHESS_OPEN=[['阿伯','年輕人，紅的給你。'],['阿伯','今天讓你先。'],[null,'旁邊兩個阿伯已經開始教你下哪一步了。']];
  const CHESS={ lose:[['年輕人，車不要亂走。','你在想別的事。下棋要想棋。'],['律師，車不要亂走。','律師，你在想考試。下棋要想棋。']], draw:[['和就是兩個人都有道理。你們法律系最喜歡。'],['和。律師最喜歡和解。']], win:[['……再一盤。'],['律師，再一盤。']] };
  const SWING=['你盪得不高。鐵鍊吱吱響，像在跟你說話。','盪到最高的時候，看得到溫州街的屋頂。','你停下來，腳拖在沙地上。今天的事情，好像也停了一下。'];
  const SHRINE={normal:'你雙手合十，不知道要說什麼。就說了一聲謝謝。',exam:'你不知道土地公管不管期末考。你還是拜了。',last:'你想不到要求什麼。你只說：這四年，謝謝。',done:'你已經拜過了。'};
  const FOUNTAIN={normal:'水很冰。你多喝了兩口。',summer:'你把水潑在臉上。好一點了。',night:'直飲台的燈還亮著，整個公園只有這裡在發光。'};
  const CAT_NAME_INTRO=['一隻橘白色的胖貓，在圓椅上曬太陽。牠沒有逃走。','你要叫牠什麼？'];
  const CAT_NAMES=[['所長','牠的耳朵動了一下。好像在說：本所長知道了。'],['麻糬','牠翻了一個身，肚子是白的。確實像麻糬。'],['常客','牠看了你一眼，好像在說：你也是嗎？']];
  const CAT={ y1:['{cat}跟著你走了一段，走到巷口又回去。','你才打開罐頭，{cat}已經坐好了。'], y2a:['{cat}胖了。你摸摸看，都是肉。','吃完，{cat}躺下來，肚子朝天。'], y2b:['{cat}瘦了一點。……一點點。','吃得比上學期慢。你猜有人在幫牠控制。'],
    y3:['脖子上的名牌寫著：請不要再餵我，我很胖。——里長','你看了名牌一眼。……還是餵了。'], y4:['{cat}在你的背包上睡著了。你等牠醒。','吃了幾口，又回到你的背包上。'] };
  /* AA_397 第 3 節（照抄）：寒流那一週「看」、收養以後「看」圓椅（一次）、象棋阿伯（不在場的玩家）、12/17 的公布欄（{cat}＝玩家取的名字；沒取過＝走失告示的三個名字）*/
  const CAT_COLD='（牠縮在石桌下面，沒有出來。罐頭放在牠面前，牠只聞了一下。）', CAT_FUR='（圓椅上有一點橘白色的毛，被風吹掉了一半。）';
  const ADOPT_CHESS='被一個常來盪鞦韆的女生帶走了。', ADOPT_NOTICE='「{cat}已經被領養了。謝謝大家這幾年的照顧。牠現在在一個有電暖器的家。——里長」';
  S.LINES={TREE,NEIGHBOR,NEIGHBOR_ELSE,CHESS_OPEN,CHESS,SWING,SHRINE,FOUNTAIN,CAT_NAME_INTRO,CAT_NAMES,CAT,CAT_COLD,CAT_FUR,ADOPT_CHESS,ADOPT_NOTICE};
  const T_=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
  const month=G=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).m:6;
  const hr=G=>G.hour%24;
  S.rec=function(G){ const d=G.daily||(G.daily={}); if(!d.park||typeof d.park!=='object') d.park={}; const P=d.park; if(!Array.isArray(P.treeUsed)) P.treeUsed=[]; return P; };
  S.season=G=>{ const m=month(G); return m>=3&&m<=5?'spring':(m>=6&&m<=8?'summer':(m>=9&&m<=11?'autumn':'winter')); };
  S.slot=G=>{ const h=G.hour; if(h>=23||h<5) return 3; if(h<12) return 0; if(h<18) return 1; return 2; };
  S.catName=G=>S.rec(G).catName||null;
  const cat=(G,t)=>t.replace(/\{cat\}/g,S.catName(G)||'那隻貓');
  /* 現在是哪個年級的哪一段（貓的四年）：照學期；寒暑假照前一個學期 */
  S.period=function(G){ let T=T_(G); if(!T&&typeof CALENDAR!=='undefined'){ for(let d=G.day-1;d>G.day-120&&!T;d--) T=CALENDAR.termOf(d); } const id=T?T.id:'Y1S1';
    if(/^Y1/.test(id)||/^Y0/.test(id)) return 'y1'; if(id==='Y2S1') return 'y2a'; if(id==='Y2S2') return 'y2b'; if(/^Y3/.test(id)) return 'y3'; return 'y4'; };
  S.year=G=>{ const p=S.period(G); return p==='y1'?1:(p==='y2a'||p==='y2b'?2:(p==='y3'?3:4)); };
  S.examWeek=G=>{ const T=T_(G); return !!(T&&T.exam); };   /* 期中第 8～9 週、期末第 16 週（16 週制）*/
  /* 大三上第 10 週（AA_166 線四；AA_420 6-1：第 9 週是期中考週，改第 10 週）：貓不見了；找到的隔天（或第 11 週）公布欄換成「已找到」（src/wzlines3d.js 記 WZ_CAT_FOUND）*/
  S.catLost=G=>{ const T=T_(G); return !!(T&&T.id==='Y3S1'&&T.week===10); };
  S.catFound=G=>{ const T=T_(G); if(!(T&&T.id==='Y3S1')) return false; if(T.week===11) return true; const f=G.flags&&G.flags.WZ_CAT_FOUND; return T.week===10&&f!=null&&G.day>f; };
  /* 大四上第 15 週寒流（AA_397 3-2）：12/11～12/14 貓縮在涼亭的石桌下面；12/14 22:10～23:00 子晴帶走（src/sideq3d.js 那一場），23:00 以後所有玩家的公園都沒有貓 */
  const DK_=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  S.ADOPT={cold:'2028-12-11',night:'2028-12-14',week:'2028-12-17',notice:'2028-12-17'};
  S.catGone=G=>{ if(!G) return false; if(G.flags&&G.flags.ZQ_CAT_NIGHT) return true; const d=DK_(S.ADOPT.night); return d!=null&&G.day*24+(+G.hour||0)>=d*24+23; };
  S.catAdopted=S.catGone;   /* 給 3D（LAWWW2）：true＝公園不顯示貓 */
  S.catCold=G=>{ if(!G||S.catGone(G)) return false; const a=DK_(S.ADOPT.cold), b=DK_(S.ADOPT.night); return a!=null&&b!=null&&G.day>=a&&G.day<=b; };   /* 給 3D：縮在石桌下（CAT_curl）*/
  S.coldWeek=G=>{ const a=DK_(S.ADOPT.cold), b=DK_(S.ADOPT.week); return !!G&&a!=null&&b!=null&&G.day>=a&&G.day<=b; };   /* 餵貓表那一週的格子「沒吃」*/
  S.adoptNotice=G=>{ const d=DK_(S.ADOPT.notice); return !!G&&d!=null&&G.day>=d; };
  /* 貓的互動點（zones3d.js buildWzPark）：名字、藏起來（收養以後「看圓椅」說過一次就藏）*/
  S.catLabel=G=>{ const nm=G?S.catName(G):null; if(G&&S.catGone(G)) return '看圓椅'; if(G&&S.catCold(G)) return nm||'那隻貓'; if(G&&typeof SIDEQ!=='undefined'&&SIDEQ.cageOpen&&SIDEQ.cageOpen(G)) return '看'+(nm||'那隻貓');   /* SQ14 外出籠那一步（AA_404「看」）*/ return nm?'摸摸'+nm:'那隻貓'; };
  S.catHidden=G=>{ if(!G||!S.catGone(G)) return false; const f17=DK_('2028-12-17'); return S.rec(G).furSeen!=null||(f17!=null&&G.day<f17); };   /* 12/15～12/16 空的圓椅沒有按鈕；12/17 起「看圓椅」一次（AA_408 第 4 節）*/
  /* 公布欄現在貼著的紙：[標題, 一句(, 旁白)] */
  S.firstSat=function(G){ if(typeof CALENDAR==='undefined') return null; const d0=CALENDAR.dateOf(G.day); let d=G.day-(d0.d-1); for(let k=0;k<7;k++,d++){ const q=CALENDAR.dateOf(d); if(q.wd===6) return q; } return null; };
  S.notices=function(G){ const F=G.flags||{}, m=month(G), T=T_(G), out=[];
    out.push(['里民活動','「'+(NEIGHBOR[m]||NEIGHBOR_ELSE)+'」']);
    { const fs=S.firstSat(G); out.push(['二手市集','「溫州街二手市集：每月第一個週六 09:00～13:00。」下面手寫：「這個月是 '+(fs?fs.m+'/'+fs.d:'第一個週六')+'。」']); }
    if(S.catLost(G)&&!S.catFound(G)) out.push(['走失的貓','「走失：所長／麻糬／常客（都是牠）。橘白色，很胖。見到請告訴里長。」']);
    if(S.catFound(G)) out.push(['已找到','「已找到，謝謝大家。——里長」']);
    if(typeof SIDEQ!=='undefined'&&SIDEQ.parkNotices) for(const q of SIDEQ.parkNotices(G)) out.push(q);   /* 餵貓表（AA_397 SQ08）*/
    if(S.adoptNotice(G)){ const t=ADOPT_NOTICE.replace('{cat}',S.catName(G)||'所長／麻糬／常客'), ex=typeof SIDEQ!=='undefined'&&SIDEQ.adoptExtra?SIDEQ.adoptExtra(G):null; out.push(['領養',ex?[t].concat(ex):t]); }   /* 演過 SQ14（AA_404）：後面多一行「（豆花）」*/
    if(T&&/^Y[34]/.test(T.id)) out.push(['課輔班招生','「國小課後輔導班招生，週二、週四下午。大學生志工也歡迎。」']);
    if(F.JOB_TUTOR) out.push(['家教廣告','「這張廣告的電話號碼，全被撕掉了。」','其中一條，在你的手機裡。']);
    else out.push(['家教廣告','「徵國中家教（數學、英文），週二或週四晚上，溫州街。意者請洽。」下面撕過兩條電話。',null,true]);
    if(typeof SIDEQ!=='undefined'&&SIDEQ.knowsChief&&SIDEQ.knowsChief(G)) for(const q of out) if(!q[2]&&/——里長/.test([].concat(q[1]).join(''))) q[2]=SIDEQ.LINES.SQ18.knows;   /* AA_405 SQ18 做完：「——里長」的字條多一行（你認得這個字。）*/
    return out; };
  const sitHere=async(GM,it)=>{ const P=GM.E.player; const ap=GM.seatApproach?GM.seatApproach(it.seat):[it.seat.x,it.seat.z]; await GM.walkTo(P,ap[0],ap[1]); GM.sitAt(P,it.seat); await GM.sleep(300); };
  const stand=GM=>{ try{ GM.standUp(GM.E.player); }catch(e){} };
  S.interact=async function(GM,it){ const G=GM.G, P=S.rec(G), k=it.park; GM.sceneBegin();
    try{
      if(k==='tree'){ await sitHere(GM,it); const se=S.season(G); let sl=S.slot(G); if(P.treeDay!==G.day){ P.treeDay=G.day; P.treeUsed=[]; }
        if(P.treeUsed.includes(sl)){ const alt=[0,1,2].find(q=>!P.treeUsed.includes(q)); if(alt!=null) sl=alt; }   /* 同一天第二次：換同一季的另一句（深夜那一欄以外），不重複 */
        if((S.catGone(G)||S.catCold(G))&&/\{cat\}/.test(TREE[se][sl])){ const alt=[0,1,2,3].find(q=>!/\{cat\}/.test(TREE[se][q])&&!P.treeUsed.includes(q)); if(alt!=null) sl=alt; }   /* 貓不在圓椅上（寒流、收養以後）：換一句沒有貓的 */
        P.treeUsed.push(sl); GM.advance(1/3); await GM.say(null,cat(G,TREE[se][sl])); stand(GM); return 'tree'; }
      if(k==='notice'){ const L=S.notices(G); for(let n=0;n<10;n++){ const i=await GM.choose(L.map(q=>({t:q[0]})).concat([{t:'不看了'}])); const q=L[i]; if(!q) break; for(const t of [].concat(q[1])) await GM.say(null,t); if(q[2]) await GM.say(null,q[2]); if(q[3]) P.sawTutorAd=true; }
        if(typeof SIDEQ!=='undefined'&&SIDEQ.onNotice) await SIDEQ.onNotice(GM);   /* 順手的事 SQ08：看過公布欄／把餵貓表貼上去 */
        return 'notice'; }
      if(k==='chess'){ if(S.rainy(G)) return 'closed';   /* 下雨公園一個人都沒有（AA_283 第 1 節）：象棋的互動點也藏起來（zones3d.js）*/ const h=hr(G); if(h<8||h>=11){ GM.toast('下象棋：08:00～11:00',2600); return 'closed'; }
        if(S.adoptNotice(G)&&!(G.flags&&G.flags.ZQ_CAT_NIGHT)&&P.adoptSaid==null){ P.adoptSaid=G.day; await GM.say({name:'阿伯'},ADOPT_CHESS); }   /* 不認識子晴、那天不在公園的玩家（AA_397 3-2）：一次 */
        if(typeof SIDEQ!=='undefined'&&SIDEQ.ask8) await SIDEQ.ask8(GM,'abo');   /* 順手的事 SQ08：問象棋阿伯 */
        const o=CHESS_OPEN[(P.chessOpen|0)%3]; P.chessOpen=(P.chessOpen|0)+1; await GM.say(o[0]?{name:o[0]}:null,o[1]);
        const n=P.chessN|0; let r; if(n<4) r=['lose','lose','draw','win'][n]; else { const x=Math.random(), w=Math.min(0.5,n*0.05); r=x<w?'win':(x<w+0.15?'draw':'lose'); } P.chessN=n+1;
        GM.advance(0.5); const sr=S.year(G)>=4?1:0; const pool=CHESS[r][sr]; const t=r==='lose'?pool[(P.loseN|0)%pool.length]:pool[0]; if(r==='lose') P.loseN=(P.loseN|0)+1;
        await GM.say({name:'阿伯'},t); P.lastChess=r; return r; }
      if(k==='swing'){ const h=hr(G); if(!(h>=20||h<5)){ GM.toast('盪鞦韆：20:00 以後',2600); return 'closed'; } await sitHere(GM,it); GM.advance(1/6); await GM.say(null,SWING[(P.swingN|0)%3]); P.swingN=(P.swingN|0)+1; stand(GM); return 'swing'; }
      if(k==='shrine'){ if(P.shrineDay===G.day){ await GM.say(null,SHRINE.done); return 'done'; } P.shrineDay=G.day; GM.advance(1/12); const T=T_(G); const t=T&&T.id==='Y4S2'?SHRINE.last:(S.examWeek(G)?SHRINE.exam:SHRINE.normal); await GM.say(null,t); return 'shrine'; }
      if(k==='fountain'){ if(P.fountainDay===G.day) return 'again'; P.fountainDay=G.day; const h=hr(G), m=month(G); await GM.say(null,h>=22||h<5?FOUNTAIN.night:(m>=6&&m<=8?FOUNTAIN.summer:FOUNTAIN.normal)); return 'fountain'; }
      if(k==='cat'){ if(S.catLost(G)) return 'lost';
        if(S.catGone(G)){ const f17=DK_('2028-12-17'); if(P.furSeen!=null||(f17!=null&&G.day<f17)) return 'gone'; P.furSeen=G.day; await GM.say(null,CAT_FUR); return 'fur'; }   /* 收養以後：沒有摸、餵；「看」圓椅那一句 12/17 起一次（AA_408 第 4 節、AA_397 3-3 改）*/
        if(S.catCold(G)){ await GM.say(null,CAT_COLD); return 'cold'; }   /* 寒流那一週：縮在石桌下面，罐頭只聞了一下 */
        if(typeof SIDEQ!=='undefined'&&SIDEQ.cage14&&await SIDEQ.cage14(GM)) return 'cage';   /* 順手的事 SQ14（AA_404）：把牠放進外出籠，帶去回診 */
        if(!P.catName){ for(const t of CAT_NAME_INTRO) await GM.say(null,t); const i=await GM.choose(CAT_NAMES.map(q=>({t:'「'+q[0]+'。」'}))); const q=CAT_NAMES[i]||CAT_NAMES[0]; P.catName=q[0]; await GM.say(null,q[1]); GM.advance(1/12); P.petDay=G.day; return 'named'; }
        const cans=(G.daily.catCans|0), per=CAT[S.period(G)]; const opts=[{t:cat(G,'摸摸{cat}'),dim:P.petDay===G.day,hint:P.petDay===G.day?'今天摸過了':'5 分鐘',k:'pet'}]; if(cans>0) opts.push({t:cat(G,'餵{cat}（小罐罐頭）'),dim:P.feedDay===G.day,hint:P.feedDay===G.day?'今天餵過了':'還有 '+cans+' 罐',k:'feed'}); opts.push({t:'算了',k:'no'});
        const o=opts[await GM.choose(opts)]||{k:'no'}; if(o.k==='no') return 'no'; if(o.dim){ GM.toast(o.hint,2400); return 'dim'; }
        if(o.k==='pet'){ P.petDay=G.day; GM.advance(1/12); await GM.say(null,cat(G,per[0])); if(/——里長/.test(per[0])&&typeof SIDEQ!=='undefined'&&SIDEQ.knowsChief&&SIDEQ.knowsChief(G)) await GM.say(null,SIDEQ.LINES.SQ18.tag); return 'pet'; }   /* 大三起的名牌：AA_405 SQ18 做完多一行（阿伯的字。）*/
        P.feedDay=G.day; P.feedN=(P.feedN|0)+1; G.daily.catCans=cans-1;   /* feedN：餵過幾次（線四 4-1 要三次以上，src/wzlines3d.js）*/ GM.advance(1/12); await GM.say(null,cat(G,per[1])); return 'feed'; }
    } finally { GM.sceneEnd(); }
    return null; };
  /* 明軒介紹家教時（AA_163）：看過公布欄那張廣告的，多一句旁白（AA_171 第 2 節；明軒的事件不讀它，只有這句旁白讀）*/
  S.tutorAdEcho=G=>!!(G&&G.daily&&G.daily.park&&G.daily.park.sawTutorAd);
  S.TUTOR_AD_ECHO='你想起公園公布欄的那張紙。';
  /* ===== 公園裡的人（AA_283，企劃線 8b312c12，AA-C 2026-10-18 定稿；DL-13／AA283-PARK-1021）=====
     第 1 節 誰幾點在：S.groups(G)＝今天的表（平日；週末換成中午一家人野餐、孩子提早到 10:00；寒暑假孩子 09:00～11:00、15:00～17:00、沒有課輔班；
       下雨一個人都沒有、貓在涼亭的石桌底下；大三上第 10 週路人照常、只有貓不在）。國定假日（平日放的假）照週末；校定的停課日（運動會）國小和上班的人照常＝平日。
       課輔班的老師不取名（不是沛珊：她大三起在台南，AA_282）。3D 的人：crowd3d.js 的 CROWD.parkSpots。
     第 2 節 走進公園的一句：S.entryTick（story3d.js 的 S.tick 每一格叫）——一天第一次走進公園、照當時的時段；時段重疊照表上面那一列（課輔班那二十分鐘照課輔班）；
       那個時段沒有人（例：平日 13:00～15:30）這次不播、下次走進來再看；和 AA_171 7b 那句（story3d.js AMBIENT 的 park）不同一天播兩句。
       提到貓的三句（遛狗、22:00 以後、下雨）大三上第 10 週不播（貓不見了；08:00～09:00 改成下一列象棋那句）。
     第 3 節 點路人：S.bindTap／S.tap——一個人一天一次、同一種人輪流說、不連續重複；學生、情侶只有旁白；下象棋的阿伯＝AA_171 第 3 節的下一盤（這裡不另寫）。
       路人都不取名、不記關係（不碰 SOCIAL）。
     存檔（一般狀態，G.daily.park）：entryDay（今天播過那一句）、pplDay＋pplDone（今天點過的人）、pplLast（每一種人上一次說第幾句）；舊存檔沒有＝今天還沒播、還沒點過 */
  S.rainy=G=>!!G&&(G.weather==='rain'||G.weather==='typhoon');
  S.catUnder=G=>(S.rainy(G)||S.catCold(G))&&!S.catLost(G)&&!S.catGone(G);   /* 寒流那一週也在石桌底下（AA_397 3-2）；收養以後沒有貓 */   /* 下雨：貓在涼亭的石桌底下（AA_164 5-2；zones3d.js buildWzPark 照這個放）*/
  /* 放假的日子（週末、國定假日）照週末的表；校定的停課日（運動會）不算——國小、上班的人照常 */
  S.dayOff=function(G){ if(typeof CALENDAR==='undefined') return G.weekday===0||G.weekday===6; const d=CALENDAR.dateOf(G.day); if(d.wd>=6) return true; const hol=CALENDAR.holiday(G.day); return !!hol&&!(CALENDAR.SCHOOL&&CALENDAR.SCHOOL[d.key]); };
  /* 寒暑假＝兩個學期中間（CALENDAR.termOf 是 null）；畢業那年的九月以後沒有學期表，照平常上學 */
  S.onBreak=function(G){ if(typeof CALENDAR==='undefined'||CALENDAR.termOf(G.day)) return false; const r=CALENDAR.termDays&&CALENDAR.termDays('Y4S2'); return !(r&&G.day>r.to+90); };
  S.schoolDay=G=>!S.dayOff(G)&&!S.onBreak(G);
  /* 第 1 節的表（照表的順序）：spot＝crowd3d.js 的哪一群人、id＝第 2 節的哪一列、key＝這一天的哪一個時段、n＝人數（照表；上班族照第 2 節那句「兩個上班族」）*/
  S.groups=function(G){ if(!G||S.rainy(G)) return []; const off=S.dayOff(G), brk=!off&&S.onBreak(G), wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:G.weekday;
    const out=[{spot:'am',id:'am',key:'am',t0:6,t1:8,n:[4,6]},{spot:'dog',id:'dog',key:'dog',t0:7,t1:9,n:[1,2]},{spot:'chess',id:'chess',key:'chess',t0:8,t1:11,n:[3,4]}];   /* 象棋：下棋 2＋圍觀 1～2 */
    out.push(off?{spot:'noon',id:'picnic',key:'picnic',t0:12,t1:13,n:[3,4]}:{spot:'noon',id:'office',key:'office',t0:12,t1:13,n:[2,2]});   /* 週末中午：一家人（大人兩個、孩子一兩個）*/
    if(off) out.push({spot:'kids',id:'kids',key:'kids',t0:10,t1:17.5,n:[3,5]});
    else if(brk) out.push({spot:'kids',id:'kids',key:'kidsAM',t0:9,t1:11,n:[3,5]},{spot:'kids',id:'kids',key:'kidsPM',t0:15,t1:17,n:[3,5]});
    else out.push({spot:'kids',id:'kids',key:'kids',t0:15.5,t1:17.5,n:[3,5]});   /* 孩子＋帶孫子的阿嬤 */
    if(!off&&!brk&&(wd===2||wd===4)) out.push({spot:'tutor',id:'tutor',key:'tutor',t0:17,t1:17+1/3,n:[6,8],pass:true});   /* 週二、週四 17:00～17:20：從入口 B 走到入口 A */
    out.push({spot:'walk',id:'walk',key:'walk',t0:18,t1:20,n:[2,4]},{spot:'night',id:'night',key:'night',t0:20,t1:22,n:[2,4]});
    return out; };
  S.groupsAt=(G,h)=>{ h=h==null?hr(G):h; return S.groups(G).filter(g=>h>=g.t0&&h<g.t1); };
  /* 第 2 節：走進公園的一句 */
  const ENTRY={am:'阿嬤們在甩手，數到一百就換一隻。',dog:'一隻柴犬拉著主人往貓的方向走，被拉了回去。',chess:'涼亭裡有人說「將軍」。旁邊看的人比下的人還急。',office:'樹下兩個上班族在吃便當，識別證翻到背面。',
    picnic:'一家人在樹下鋪了野餐墊，小孩在追鴿子。',kids:'溜滑梯那邊很吵。阿嬤坐在旁邊一直喊「慢一點」。',tutor:'一排小孩背著書包走過去，老師走在最後面點人數。',walk:'散步的人繞著老樹走，一圈、兩圈。',
    night:'鞦韆有人在盪，盪得不高。',late:'公園沒有人。圓椅上只剩{cat}。',rain:'公園沒有人。涼亭的石桌底下，有一團橘白色的。'};
  S.entryLine=function(G,h){ h=h==null?hr(G):h; const lost=S.catLost(G)||S.catGone(G);   /* 收養以後和貓不見那一週一樣：提到貓的句子不播 */
    if(S.catCold(G)&&!S.rainy(G)&&(h>=22||h<6)) return ENTRY.rain;   /* 寒流那一週的深夜：貓在石桌底下 */
    if(S.rainy(G)) return lost?null:ENTRY.rain;
    if(h>=22||h<6) return lost?null:cat(G,ENTRY.late);
    const on=S.groupsAt(G,h).filter(g=>!(lost&&g.id==='dog'));
    const g=on.find(q=>q.id==='tutor')||on[0]; return g?ENTRY[g.id]:null; };
  /* 在公園裡嗎（WZ_PARK_LAYOUT 的入口段＋主園區，扣掉西北角）：從主巷進入口 A 要往裡走 0.3 m 才算 */
  S.inPark=function(x,z){ if(typeof WZ_PARK_LAYOUT==='undefined') return false; const A=WZ_PARK_LAYOUT.area, f=A.front, b=A.back;
    if(x>f.x0&&x<f.x1&&z>f.z0+0.3&&z<=f.z1) return true;
    return x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1&&!(b.cut&&x<b.cut.x1&&z>b.cut.z0); };
  S.entrySaid=G=>S.rec(G).entryDay===G.day;   /* 今天走進公園的那一句播過了（AA_171 7b 那句今天就不播）*/
  S.ambSaid=G=>!!(G&&G.flags&&G.flags.amb&&G.flags.amb['park'+G.day]);   /* story3d.js AMBIENT 的 7b（key 'park'）今天播過了 */
  S._wasIn=null;
  S.entryTick=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.player||!E.player.obj) return null; const p=E.player.obj.position, inside=G.zone==='wenzhou'&&S.inPark(p.x,p.z), was=S._wasIn; S._wasIn=inside;
    if(!inside||was) return null;   /* 走進來的那一刻（讀檔、進區域時就在公園裡也算）*/
    if(S.entrySaid(G)||S.ambSaid(G)) return null; const line=S.entryLine(G); if(!line) return null;
    S.rec(G).entryDay=G.day; if(GM.caption) GM.caption('',line,3200); return line; };
  /* 第 3 節：點路人 */
  const Q=t=>({t}), N=t=>({nar:true,t});   /* Q＝他說的（對話框寫是誰，引號拿掉）；N＝旁白（括號照原文）*/
  const TAP={ am_f:{who:'晨運的阿嬤',lines:[[Q('少年仔，這麼早？')],[Q('你們讀書的，要多動。')],[Q('今天冷，手要甩久一點。')]],only:{2:G=>{ const m=month(G); return m===12||m<=2; }}},   /* 第三句只在 12～2 月 */
    am_m:{who:'晨運的阿伯',lines:[[N('（他甩著手，對你點了一下頭。）')],[Q('早。')]]},
    dog:{who:'遛狗的人',lines:[[Q('牠不咬人啦，牠只是想看貓。')],[Q('早！')]]},
    chess_watch:{who:'圍觀象棋的',lines:[[Q('看就好，不要講話。')]]},
    office:{who:'上班族',lines:[[N('（他對你點了一下頭，繼續吃便當。）')]]},
    kid:{who:'放學的孩子',lines:[[Q('哥哥，你要盪鞦韆要排隊喔。')],[Q('你知道那隻貓叫什麼嗎？……我們都叫牠麻糬。')]]},
    grandma:{who:'帶孫子的阿嬤',lines:[[Q('孫子啦。他媽媽六點才下班。')]]},
    tutor:{who:'課輔班的老師',lines:[[Q('不好意思，借過一下。'),N('（孩子在後面跟著說「借過——」）')]]},
    walker:{who:'散步的人',lines:[[N('（她點點頭，繼續走她的第三圈。）')]]},
    night:{who:null,lines:[[N('你決定不要打擾他們。')]]} };   /* 學生、情侶：不能點，只有一句旁白 */
  const KID_MOCHI='我們都叫牠麻糬。……你也是？';   /* 玩家取的名字也是麻糬：孩子那句換成這句 */
  S.TAP=TAP; S.ENTRY=ENTRY; S.KID_MOCHI=KID_MOCHI;
  S.whoOf=(G,role)=>role==='kid'&&!S.schoolDay(G)?'孩子':(TAP[role]&&TAP[role].who);   /* 週末、放假的孩子不是「放學的」（對話框的名字）*/
  /* 這一種人這次說哪一句：上一次的下一句（輪流；不連續重複），這個月份沒有的句子跳過 */
  S.tapPick=function(G,role){ const T=TAP[role]; if(!T) return null; const P=S.rec(G), last=P.pplLast&&typeof P.pplLast[role]==='number'?P.pplLast[role]:null, n=T.lines.length;
    const gone=S.catGone(G), ok=j=>(!(T.only&&T.only[j])||T.only[j](G))&&!(gone&&T.lines[j].some(x=>/貓/.test(x.t))); let i=null;   /* 收養以後：提到貓的那一句跳過 */ for(let s=0;s<n;s++){ const j=((last==null?0:last+1)+s)%n; if(ok(j)){ i=j; break; } } if(i==null) return null;
    const who=S.whoOf(G,role); return {i,script:T.lines[i].map(x=>x.nar?{t:x.t}:{who,t:role==='kid'&&i===1&&S.catName(G)==='麻糬'?KID_MOCHI:x.t})}; };
  S.tapped=(G,key)=>{ const P=S.rec(G); return P.pplDay===G.day&&Array.isArray(P.pplDone)&&P.pplDone.includes(key); };
  S.tap=async function(GM,n,key,role){ const G=GM.G, P=S.rec(G); if(S.tapped(G,key)) return null; const pk=S.tapPick(G,role); if(!pk) return null;
    if(P.pplDay!==G.day||!Array.isArray(P.pplDone)){ P.pplDay=G.day; P.pplDone=[]; } P.pplDone.push(key); P.pplLast=Object.assign({},P.pplLast,{[role]:pk.i});
    if(n){ n.talk=null; n.talkLabel=null; }   /* 一個人一天一次：說完就不能再點 */
    if(typeof CROWD!=='undefined'&&CROWD.overhear) await CROWD.overhear(GM,n,pk.script);
    else { GM.sceneBegin(); try{ for(const x of pk.script) await GM.say(x.who?{name:x.who,obj:n&&n.obj}:null,x.t); } finally { GM.sceneEnd(); } }
    return pk; };
  /* 3D 的路人建好時（crowd3d.js）：這個人點了會怎樣。p.key＝這一天、這個時段的第幾個人；p.role 見 TAP（chess_play＝下棋的阿伯；family、tutor_kid 不能點）*/
  S.bindTap=function(GM,n,p){ if(!n||!p) return n; n.parkRole=p.role; n.parkKey=p.key;
    if(p.role==='chess_play'){ n.talkLabel='下象棋'; n.talk=()=>S.interact(GM,{park:'chess'}); return n; }
    if(!TAP[p.role]||S.tapped(GM.G,p.key)){ n.talk=null; n.talkLabel=null; return n; }
    n.talkLabel='打招呼'; n.talk=()=>S.tap(GM,n,p.key,p.role); return n; };
  return S;
})();

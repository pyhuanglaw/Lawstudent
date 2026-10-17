/* ===== 溫州街小公園的互動（DL-09／DL-13；文字＝AA-B 的 AA_171 定稿，企劃線 3d5feef2；規則 AA_164 5-4、5-5）=====
   都不扣時段次數，只花時間：坐在樹下 20 分、看公布欄 0 分、下象棋 30 分（08:00～11:00）、盪鞦韆 10 分（20:00 以後）、拜土地公 5 分（一天一次）、直飲台 0 分、摸貓 5 分、餵貓 5 分（各一天一次）。
   存檔（一般狀態，不是劇情旗標）：G.daily.park＝{treeDay, treeUsed:[], chessN, chessOpen, swingN, shrineDay, fountainDay, catName, petDay, feedDay, sawTutorAd}；
   G.daily.catCans：小罐貓罐頭的數量（便利商店 35 元，AA_164 5-4）。舊存檔沒有＝從頭開始。
   位置（zones3d.js buildWzPark 加的互動點，park 欄位）：老樹下的圓椅（tree）、鞦韆（swing）、公布欄（notice）、涼亭的象棋（chess）、土地公（shrine）、直飲台（fountain）、貓（cat，圓椅北邊）。
   測試：node tests/wz_park_talk_unit.js */
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
  const CAT={ y1:['{cat}跟著你走了一段，走到巷口又回去。','你才打開罐頭，{cat}已經坐好了。'], y2a:['{cat}胖了。你摸到的不是骨頭，是肉。','吃完，{cat}躺下來，肚子朝天。'], y2b:['{cat}瘦了一點。……一點點。','吃得比上學期慢。你猜有人在幫牠控制。'],
    y3:['脖子上的名牌寫著：請不要再餵我，我很胖。——里長','你看了名牌一眼。……還是餵了。'], y4:['{cat}在你的背包上睡著了。你等牠醒。','吃了幾口，又回到你的背包上。'] };
  S.LINES={TREE,NEIGHBOR,NEIGHBOR_ELSE,CHESS_OPEN,CHESS,SWING,SHRINE,FOUNTAIN,CAT_NAME_INTRO,CAT_NAMES,CAT};
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
  /* 大三上第 9 週（AA_166 線四）：貓不見了 */
  S.catLost=G=>{ const T=T_(G); return !!(T&&T.id==='Y3S1'&&T.week===9); };
  S.catFound=G=>{ const T=T_(G); return !!(T&&T.id==='Y3S1'&&T.week===10); };
  /* 公布欄現在貼著的紙：[標題, 一句(, 旁白)] */
  S.firstSat=function(G){ if(typeof CALENDAR==='undefined') return null; const d0=CALENDAR.dateOf(G.day); let d=G.day-(d0.d-1); for(let k=0;k<7;k++,d++){ const q=CALENDAR.dateOf(d); if(q.wd===6) return q; } return null; };
  S.notices=function(G){ const F=G.flags||{}, m=month(G), T=T_(G), out=[];
    out.push(['里民活動','「'+(NEIGHBOR[m]||NEIGHBOR_ELSE)+'」']);
    { const fs=S.firstSat(G); out.push(['二手市集','「溫州街二手市集：每月第一個週六 09:00～13:00。」下面手寫：「這個月是 '+(fs?fs.m+'/'+fs.d:'第一個週六')+'。」']); }
    if(S.catLost(G)) out.push(['走失的貓','「走失：所長／麻糬／常客（都是牠）。橘白色，很胖。見到請告訴里長。」']);
    if(S.catFound(G)) out.push(['已找到','「已找到，謝謝大家。——里長」']);
    if(T&&/^Y[34]/.test(T.id)) out.push(['課輔班招生','「國小課後輔導班招生，週二、週四下午。大學生志工也歡迎。」']);
    if(F.JOB_TUTOR) out.push(['家教廣告','「這張廣告的電話號碼，全被撕掉了。」','其中一條，在你的手機裡。']);
    else out.push(['家教廣告','「徵國中家教（數學、英文），週二或週四晚上，溫州街。意者請洽。」下面撕過兩條電話。',null,true]);
    return out; };
  const sitHere=async(GM,it)=>{ const P=GM.E.player; const ap=GM.seatApproach?GM.seatApproach(it.seat):[it.seat.x,it.seat.z]; await GM.walkTo(P,ap[0],ap[1]); GM.sitAt(P,it.seat); await GM.sleep(300); };
  const stand=GM=>{ try{ GM.standUp(GM.E.player); }catch(e){} };
  S.interact=async function(GM,it){ const G=GM.G, P=S.rec(G), k=it.park; GM.sceneBegin();
    try{
      if(k==='tree'){ await sitHere(GM,it); const se=S.season(G); let sl=S.slot(G); if(P.treeDay!==G.day){ P.treeDay=G.day; P.treeUsed=[]; }
        if(P.treeUsed.includes(sl)){ const alt=[0,1,2].find(q=>!P.treeUsed.includes(q)); if(alt!=null) sl=alt; }   /* 同一天第二次：換同一季的另一句（深夜那一欄以外），不重複 */
        P.treeUsed.push(sl); GM.advance(1/3); await GM.say(null,cat(G,TREE[se][sl])); stand(GM); return 'tree'; }
      if(k==='notice'){ const L=S.notices(G); for(let n=0;n<10;n++){ const i=await GM.choose(L.map(q=>({t:q[0]})).concat([{t:'不看了'}])); const q=L[i]; if(!q) break; await GM.say(null,q[1]); if(q[2]) await GM.say(null,q[2]); if(q[3]) P.sawTutorAd=true; } return 'notice'; }
      if(k==='chess'){ const h=hr(G); if(h<8||h>=11){ GM.toast('下象棋：08:00～11:00',2600); return 'closed'; }
        const o=CHESS_OPEN[(P.chessOpen|0)%3]; P.chessOpen=(P.chessOpen|0)+1; await GM.say(o[0]?{name:o[0]}:null,o[1]);
        const n=P.chessN|0; let r; if(n<4) r=['lose','lose','draw','win'][n]; else { const x=Math.random(), w=Math.min(0.5,n*0.05); r=x<w?'win':(x<w+0.15?'draw':'lose'); } P.chessN=n+1;
        GM.advance(0.5); const sr=S.year(G)>=4?1:0; const pool=CHESS[r][sr]; const t=r==='lose'?pool[(P.loseN|0)%pool.length]:pool[0]; if(r==='lose') P.loseN=(P.loseN|0)+1;
        await GM.say({name:'阿伯'},t); P.lastChess=r; return r; }
      if(k==='swing'){ const h=hr(G); if(!(h>=20||h<5)){ GM.toast('盪鞦韆：20:00 以後',2600); return 'closed'; } await sitHere(GM,it); GM.advance(1/6); await GM.say(null,SWING[(P.swingN|0)%3]); P.swingN=(P.swingN|0)+1; stand(GM); return 'swing'; }
      if(k==='shrine'){ if(P.shrineDay===G.day){ await GM.say(null,SHRINE.done); return 'done'; } P.shrineDay=G.day; GM.advance(1/12); const T=T_(G); const t=T&&T.id==='Y4S2'?SHRINE.last:(S.examWeek(G)?SHRINE.exam:SHRINE.normal); await GM.say(null,t); return 'shrine'; }
      if(k==='fountain'){ if(P.fountainDay===G.day) return 'again'; P.fountainDay=G.day; const h=hr(G), m=month(G); await GM.say(null,h>=22||h<5?FOUNTAIN.night:(m>=6&&m<=8?FOUNTAIN.summer:FOUNTAIN.normal)); return 'fountain'; }
      if(k==='cat'){ if(S.catLost(G)) return 'lost';
        if(!P.catName){ for(const t of CAT_NAME_INTRO) await GM.say(null,t); const i=await GM.choose(CAT_NAMES.map(q=>({t:'「'+q[0]+'。」'}))); const q=CAT_NAMES[i]||CAT_NAMES[0]; P.catName=q[0]; await GM.say(null,q[1]); GM.advance(1/12); P.petDay=G.day; return 'named'; }
        const cans=(G.daily.catCans|0), per=CAT[S.period(G)]; const opts=[{t:cat(G,'摸摸{cat}'),dim:P.petDay===G.day,hint:P.petDay===G.day?'今天摸過了':'5 分鐘',k:'pet'}]; if(cans>0) opts.push({t:cat(G,'餵{cat}（小罐罐頭）'),dim:P.feedDay===G.day,hint:P.feedDay===G.day?'今天餵過了':'還有 '+cans+' 罐',k:'feed'}); opts.push({t:'算了',k:'no'});
        const o=opts[await GM.choose(opts)]||{k:'no'}; if(o.k==='no') return 'no'; if(o.dim){ GM.toast(o.hint,2400); return 'dim'; }
        if(o.k==='pet'){ P.petDay=G.day; GM.advance(1/12); await GM.say(null,cat(G,per[0])); return 'pet'; }
        P.feedDay=G.day; G.daily.catCans=cans-1; GM.advance(1/12); await GM.say(null,cat(G,per[1])); return 'feed'; }
    } finally { GM.sceneEnd(); }
    return null; };
  /* 明軒介紹家教時（AA_163）：看過公布欄那張廣告的，多一句旁白（AA_171 第 2 節；明軒的事件不讀它，只有這句旁白讀）*/
  S.tutorAdEcho=G=>!!(G&&G.daily&&G.daily.park&&G.daily.park.sawTutorAd);
  S.TUTOR_AD_ECHO='你想起公園公布欄的那張紙。';
  return S;
})();

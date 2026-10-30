/* ===== 事件包第 2 輪之一：大二（AA_325，AA-C 404ae976 定稿；EVPKG-R2Y2-1020）=====
   台詞一字不改（D100：AA 寫的才演；AA 沒寫的地方不補字）。可昕各場是 AA_314 第 0 節第 2 點的改寫稿（不出假設題、不比較、寒暑假在高雄、大二沒有「我們的日子」）。
   24 件：新做 20、部分 2（中秋的可昕那段在 events.js 的 ev_y2_midautumn、阿哲押金的麵店那一件）、跳過 2（以安新 9、明軒大二系籃早就在）。
   掛勾（story3d.js 10-20 的事件包掛勾）：STORY.PHONE_RULES（訊息、邀約、排出遊）、STORY.TICKS（AA_342 第 2-2 節大二下的兩個摘要日旁白，AA_375 第 4 節）、STORY.WAKE_AT（6/2 21:00 可昕打來）、
     STORY.TALK_OPTS（語彤、以安的一次性選項）、STORY.ROOM_EXTRA（她的聖誕卡片、高雄夜市的照片）、OUT.AFTER（期末成績打賭的宵夜那句：那一趟出遊的結尾，AA_338 第 3 題）、
     MSG.askOpts（包一層：大二 4/24 MSG-2 生日的「妳來公館」回「好 九點」，AA_338 第 2 節；不改 msg3d.js）。
   出遊（OUT.plan）：可昕的見面、視訊、電話（call:true＝在家也不用出門）、高雄（高鐵 2980 元照扣）、系籃、三對三、經濟系之夜。
   依賴第 1 輪（別的子代理在做）：2-Y2-16 讀 1B-07 的 KX_CIRCLES_MET 和「麵店分店」群組（noodle_branch）；2-Y2-22 讀 1B-03 語彤身上的記憶 RENT_CONSULTATION；
     2-Y2-15 讀 1B-07 的 ev_kexin_two_circles（見過予樂）。那兩件還沒進遊戲以前，這兩件不會發生。
   測試：node tests/y2_round2_unit.js */
'use strict';
const Y2R2=(function(){
  const S={};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const abs=(d,hh)=>d*24+hh;
  const now=G=>abs(G.day,G.hour);
  const past=(G,d,hh)=>d!=null&&now(G)>=abs(d,hh);
  const win=(G,d,hh,days)=>past(G,d,hh)&&G.day<=d+(days==null?1:days);   /* 時間到了、還在幾天以內（太久以前的舊存檔不補）*/
  const law=G=>(G.stage||'law')==='law';
  const dating=(G,id)=>!!(G.flags&&G.flags['dating_'+id]===true);
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const STG=['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'];
  const atLeast=(id,min)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.stage) return false; const L=SOCIAL.STAGES||STG; return L.indexOf(SOCIAL.stage(id))>=L.indexOf(min); };
  const mem=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const remember=(id,tag,note)=>{ if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(id,tag,note); };
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const markDone=(G,id)=>{ G.events=G.events||{done:{},last:{},count:0}; G.events.done=G.events.done||{}; G.events.last=G.events.last||{}; G.events.done[id]=(G.events.done[id]||0)+1; G.events.last[id]=G.day; };
  const hasP=()=>typeof PHONE!=='undefined';
  const sent=(G,tag)=>hasP()&&PHONE.sent(G,tag);
  const at=(G,d,hh,items,tag)=>hasP()&&PHONE.at(G,d,hh,items,tag);
  const inGroup=(G,g)=>hasP()&&PHONE.inGroup(G,g);
  const OUTX=()=>typeof OUT!=='undefined'?OUT:null;
  const outGet=(G,id)=>OUTX()?OUT.get(G,id):null;
  const plan=(G,o)=>OUTX()?OUT.plan(G,o):false;
  const K=t=>({th:'p:kexin',from:'kexin',text:t});
  const KASK=(t,ask)=>Object.assign(K(t),{ask});
  const ROM_=()=>typeof ROM!=='undefined'?ROM:null;
  const knowsOf=(G,x,p)=>!!ROM_()&&!!ROM.knowsOf&&ROM.knowsOf(G,x,p);   /* x 知道祐廷和 p 在交往 */
  const KN=id=>({custom:G=>knows(id,G)});
  const kx=G=>law(G)&&dating(G,'kexin');
  const merge=(G,k,v)=>{ G.flags[k]=Object.assign({},(G.flags[k]&&typeof G.flags[k]==='object')?G.flags[k]:{},v); };

  /* ---------- 日子（照 AA_325 的日曆；Python datetime 核過）---------- */
  S.D={k9a:'2026-09-17',k9:'2026-09-18',ma0:'2026-09-24',ma:'2026-09-25',q0:'2026-10-09',qr:'2026-10-21',q:'2026-10-23',qf:'2026-12-20',
    f0:'2026-12-04',fr:'2026-12-09',f:'2026-12-11',x0:'2026-12-18',xr:'2026-12-22',xg:'2026-12-24',x:'2026-12-25',
    g1:'2027-01-11',kh0:'2026-12-28',khr:'2026-12-30',kh:'2027-01-14',kn:'2027-02-05',vd:'2027-02-14',
    dep1:'2027-03-23',dep2:'2027-03-30',b0:'2027-04-17',b:'2027-04-24',u0:'2027-04-28',u:'2027-05-08',
    zrc:'2027-05-11',z8a:'2027-05-12',z8b:'2027-05-19',ps0:'2027-05-31',show0:'2027-05-24',show:'2027-05-28',ball:'2027-05-29',
    egg1:'2027-05-25',egg2:'2027-05-27',zm:'2027-05-26',walk1:'2027-05-31',walk2:'2027-06-02',an_end:'2027-09-05',
    k14a:'2027-06-01',k14:'2027-06-02',yt11:'2027-06-03',yt11b:'2027-06-17',en:'2027-06-04',g2:'2027-06-28',m3:'2027-06-12',
    z9:'2027-06-03',zq8a:'2027-05-17',   /* AA_375 第 2 項：錄取那一場的期限＝6/3 那個班（Z9）以前；第 13 項：子晴說演唱會改 5/17（一）以後（演唱會 5/15（六）晚上）*/
    f225:'2027-02-25',f306:'2027-03-06',f312:'2027-03-12',f408:'2027-04-08',f421:'2027-04-21',f520:'2027-05-20',f521:'2027-05-21'};   /* AA_342 第 2-2 節：大二下的空白（AA_375 第 4 節提醒）*/
  const d=k=>DK(S.D[k]);
  const lastExam=(G,term,fb)=>{ try{ const e=typeof CLS!=='undefined'&&CLS.lastExamEnd?CLS.lastExamEnd(G,term,'final'):null; if(e&&e.day!=null) return e.day; }catch(e){} return DK(fb); };   /* 期末最後一科（照 S.examList 的課表）*/

  /* ==================== 事件（STORY_EVENTS）==================== */
  const EV=[];
  /* ---------- 2-Y2-03 可昕 K9「一門讓她不想滑手機的課」：9/18（五）17:30 公館河濱 ---------- */
  EV.push({ id:'ev_kexin_good_class', title:'一門讓她不想滑手機的課', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    outingMissed:(G)=>{ G.flags.KX_K9='missed'; },
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {speaker:null,text:'（她坐在河堤的階梯上，手機蓋在包包上面。）'},
      {speaker:'kexin',expression:'smile',text:'我找到一門會讓我上課不想滑手機的課。'},
      {speaker:'kexin',expression:'neutral',text:'老師講規則怎麼改變人的行為。罰款高一點，大家就真的慢下來嗎？'},
      {speaker:'kexin',expression:'smile',text:'經濟系那半年沒有白念。我現在看得懂規則為什麼這樣訂。'},
      {choice:[{text:'「我那一個多月也沒白念。」',goto:'a'},{text:'「罰款高一點，大家會慢下來嗎？」',goto:'b'},{text:'「妳講到眼睛會亮。」',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'neutral',text:'一個多月。'},{speaker:null,text:'（她看了你一眼。）'},{speaker:'kexin',expression:'teasing',text:'……你那一個多月，學會的是怎麼辦休學。'},{goto:'end'},
      {label:'b'},{speaker:null,text:'（她歪頭想了一下。）'},{speaker:'kexin',expression:'thinking',text:'有些人會。有些人只會換一條路。……這就是那門課在吵的。'},{goto:'end'},
      {label:'c'},{speaker:'kexin',expression:'surprised',text:'……真的？'},{speaker:null,text:'（她把手機收進包包。）'},{speaker:'kexin',expression:'smile',text:'那我今天不滑了。'},
      {label:'end'},{speaker:null,text:'（六點半，她說要回山上。你陪她走到公車站。）'} ],
    after:G=>{ G.flags.KX_K9='met'; merge(G,'KX_DIR',{Y2:'rules'}); } });
  /* ---------- 2-Y2-05 可昕 K10「互相出題」：10/23（五）18:30 山下或視訊（沒有輸贏、不記勝負）。
     原本 10/25（日）12:00；AA_343 E4：BCG-30 是「十月的星期五晚上」的圖，改事件時間對齊圖（出發選單 17:50，開車約 40 分鐘）---------- */
  const K6=G=>!!G.flags.KX_K6_EXAM||!!(G.flags.KX_QUIZ&&((G.flags.KX_QUIZ.win|0)+(G.flags.KX_QUIZ.lose|0)+(G.flags.KX_QUIZ.draw|0))>0);   /* 做過大一 K6（舊存檔有 KX_QUIZ 也算，同 events.js）*/
  const quizEv=(id,video)=>({ id, title:'互相出題', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:video?1:1.5,
    outingMissed:()=>{},
    dialogue:[ video?{scene:'視訊',bg:'video'}:{scene:'木柵大學・山下的小吃街',bg:'nccu_food'},
      {if:{custom:K6},speaker:'kexin',expression:'smile',text:'上次你出的那題，我回去查了兩天。'},
      {unless:{custom:K6},speaker:'kexin',expression:'neutral',text:'先說好，題目只能出上課講過的。'},
      {speaker:null,text:'（三題對三題。你出哪一種？）'},
      {choice:[{text:'「簡單的（上課講過的定義）」',set:{KX_QUIZ_Y2S1:'easy'},goto:'e'},{text:'「中等的（課本後面的例題）」',set:{KX_QUIZ_Y2S1:'mid'},goto:'m'},{text:'「冷門的（某一說的少數見解）」',set:{KX_QUIZ_Y2S1:'hard'},goto:'h'}]},
      {label:'e'},{speaker:'kexin',expression:'teasing',text:'定義？……你在暖身。'},{speaker:null,text:'（她直接寫完，把筆推給你。）'},{goto:'end'},
      {label:'m'},{speaker:null,text:'（她想了很久，在紙上畫了一間房子和一塊地。）'},{speaker:'kexin',expression:'thinking',text:'……這題好。我回去再想一次。'},{goto:'end'},
      {label:'h'},{speaker:'kexin',expression:'neutral',text:'冷門學說不算。'},{speaker:null,text:'（她把題目紙翻過去。）'},{speaker:'kexin',expression:'neutral',text:'……出一題人真的會遇到的。'},
      {label:'end'},
      {if:{custom:()=>!video},cg:'cg_quiz_kexin'},   /* BCG-30 兩校互考，正式開打（企劃線 cg_approved/ README：山下小吃互考的玩家、她舉起第一張題目卡；視訊的不放）*/
      {speaker:null,text:'（換她出題。三題都是物權：誰的房子、誰的地、誰先登記。）'},
      video?{speaker:'kexin',expression:'smile',text:'……好，吃飯。你那邊吃什麼？'}:{speaker:'kexin',expression:'smile',text:'……好，吃飯。湯餃我已經點了。'} ] });
  EV.push(quizEv('ev_kexin_quiz_y2',false), quizEv('ev_kexin_quiz_y2_video',true));
  /* ---------- 2-Y2-06 可昕 K10b「系上的電影夜」：12/11（五）19:00 政大的小教室 ---------- */
  const YL=v=>({custom:G=>G.flags.YL_IMPRESSION===v});
  const NCCU_MET=G=>mem('kexin','ENC_D13_KX')||mem('kexin','ENC_D09_KX');   /* 見過邵鈞（淡水 D13、貓空 D09 的偶遇）*/
  EV.push({ id:'ev_kexin_film_night', title:'系上的電影夜', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    outingMissed:(G,GM,q)=>{ G.flags.KX_FILM_NIGHT='missed'; },
    dialogue:[ {scene:'木柵大學・系上的小教室',bg:'classroom_small'},
      {speaker:null,text:'（教室的燈關了一半，投影幕在跑片頭。二十幾個人，有一半是外系的。）'},
      {if:YL('funny'),speaker:'予樂',text:'這是很好笑的司機。'},{if:YL('honest'),speaker:'予樂',text:'這是很老實的司機。'},{if:YL('polite'),speaker:'予樂',text:'這是很客氣的司機。'},
      {unless:{custom:G=>['funny','honest','polite'].includes(G.flags.YL_IMPRESSION)},speaker:'kexin',expression:'smile',text:'這是我的外系。'},
      {if:{custom:NCCU_MET},speaker:'kexin',expression:'neutral',text:'邵鈞你見過了。這是詹靖，什麼都拍。'},
      {unless:{custom:NCCU_MET},speaker:'kexin',expression:'neutral',text:'這是邵鈞，考古題有目錄的那個。這是詹靖，什麼都拍。'},
      {speaker:'予樂',text:'破冰。每個人講一樣，你包包裡最沒用的東西。'},
      {choice:[{text:'「一把傘。今天沒下雨。」',goto:'u'},{text:'「去年的考古題。」',goto:'k'},{text:'「可昕上次借我的筆。」',goto:'p'}]},
      {label:'u'},{speaker:'予樂',text:'誠實。司機加一分。'},{goto:'end'},
      {label:'k'},{speaker:'邵鈞',text:'……這個我有興趣。'},{goto:'end'},
      {label:'p'},{speaker:'kexin',expression:'teasing',text:'那不是沒用的。還我。'},{speaker:'予樂',text:'司機扣一分。'},
      {label:'end'},{speaker:null,text:'（電影放到一半，詹靖在後排拍了一張大家的後腦勺。）'},{speaker:null,text:'（散場的時候，予樂站在門口數人頭。）'},
      {speaker:'予樂',text:'外系的，一個都沒少。'},{speaker:'kexin',expression:'smile',text:'……回去開車小心。到了跟我說。'} ],
    after:G=>{ G.flags.KX_FILM_NIGHT='went'; G.flags.KX_NCCU_FRIENDS=true; } });
  /* ---------- 2-Y2-07 可昕「聖誕：她排的行程」：12/25（五）18:30 公館 → 公館河濱 ---------- */
  EV.push({ id:'ev_kexin_xmas_y2', title:'聖誕：她排的行程', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    outingMissed:(G)=>{ merge(G,'KX_XMAS',{2:'missed'}); },
    beforeOuting:(G)=>{ if(!G.flags.KX_XMAS_GIFT_Y2) G.flags.KX_XMAS_GIFT_Y2='scarf'; },   /* 沒選禮物＝出發時自動選「一條圍巾」*/
    dialogue:[ {scene:'公館・騎樓',bg:'gongguan_luwei'},
      {speaker:null,text:'（公館的騎樓。她把一張摺成四折的紙攤開。）'},
      {speaker:'kexin',expression:'smile',text:'第一頁。今天要吃的。'},
      {speaker:'kexin',expression:'neutral',text:'滷味、豆花、紅豆餅。紅豆餅要排隊，所以先排。'},
      {choice:[{text:'「三樣吃得完嗎？」',goto:'a'},{text:'「紅豆餅我去排。」',goto:'b'},{text:'「第二頁寫什麼？」',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'teasing',text:'吃得完。我中午沒吃。'},{goto:'river'},
      {label:'b'},{speaker:'kexin',expression:'smile',text:'好。我去買滷味。……十分鐘後這裡見。'},{goto:'river'},
      {label:'c'},{speaker:'kexin',expression:'teasing',text:'吃完才能看。'},{speaker:null,text:'（她把紙摺回去。）'},
      {label:'river'},{scene:'公館河濱',bg:'riverside'},
      {speaker:null,text:'（八點，你們走到河濱。對岸的橋上一排燈。）'},
      {speaker:'kexin',expression:'smile',text:'第二頁。看燈。……就這樣。'},
      {speaker:null,text:'（她從包包拿出一個小盒子。裡面是一支筆，附一張卡片。）'},
      {speaker:null,text:'（卡片上只有一行：明年的第二頁，你排。）'},
      {speaker:'kexin',expression:'smile',text:'……我回去再拆。'},
      {speaker:null,text:'（你送她到公車站。上車以前，她把行程表摺好，塞進你外套的口袋。）'} ],
    after:G=>{ merge(G,'KX_XMAS',{2:'went'}); } });
  /* ---------- 2-Y2-10 可昕 KH「寒假去高雄：她排的那一天」：1/14（四）左營 → 夜市 → 19:30 送上車 ---------- */
  const HL=()=>typeof HOMETOWN_LINES!=='undefined'?HOMETOWN_LINES.kexin:null;
  const sub=(G,t)=>String(t).replace(/\{name\}/g,G.name||'祐廷');
  async function playHL(GM,arr){ const G=GM.G, me={name:typeof SOCIAL!=='undefined'?SOCIAL.displayName('kexin'):'可昕',charId:'kexin'}; for(const x of arr||[]){ if(typeof x==='string') await GM.say(me,sub(G,x)); else if(x.narr) await GM.say(null,x.narr); } }
  S.khTrip=async function(GM,q){ const G=GM.G, F=G.flags, C=HL(), bg=k=>typeof OUT!=='undefined'&&OUT.bg?OUT.bg(k):'dark', kx={name:typeof SOCIAL!=='undefined'?SOCIAL.displayName('kexin'):'可昕',charId:'kexin'};
    if(C&&C.fare&&GM.money) GM.money(-C.fare,'交通');   /* 高鐵來回（AA_325 2-Y2-10 第 6 節第 2 點：fare 2980 照扣）*/
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:bg('kh_station')});
    const again=((F.HV_N||{}).kexin|0)>0; if(C) await playHL(GM,(again&&C.pickAgain?C.pickAgain:C.pick).lines);   /* 接人：第一次去高雄 pick、去過 pickAgain（這一趟也算進 HV 的 first／again 輪流，AA_338 第 4 題：結尾記 HV_N）*/
    if(typeof ADV!=='undefined'&&ADV.setBg) ADV.setBg(bg('kh_night_market')); if(GM.caption) GM.caption('','高雄・她家附近的夜市',2400); if(GM.sleep) await GM.sleep(700);
    await GM.say(null,'（一月的高雄，傍晚還有二十度。夜市的燈從巷口一路亮到底。）');
    await GM.say(null,'（她把手機遞給你。行程表第一頁列了六攤。）');
    await GM.say(kx,'一攤只能買一樣。吃不完的你吃。');
    const bet=F.KX_GRADES_Y2S1; if(bet==='asked'||bet==='waited'){ F.KX_BET_Y2S1_PAID=true;   /* 打賭的宵夜（2-Y2-09）：就在這一天付 */
      if(bet==='asked'){ await GM.say(kx,'成績那一攤，你請。說好的。'); await GM.say(null,'（這次是你請。）'); } else { await GM.say(kx,'……成績那一攤，我請。'); await GM.say(null,'（這次是她請。）'); } }
    const k=await GM.choose([{t:'「妳從小吃到大的是哪一攤？」'},{t:'「六攤吃得完嗎？」'},{t:'（跟在她後面走）'}]);
    if(k===0){ await GM.say(kx,'這攤。……老闆以前都多給我一顆。現在不給了。'); } else if(k===1){ await GM.say(kx,'吃不完才要你來。'); } else await GM.say(null,'（她每走一攤，就回頭看一次你有沒有跟上。）');
    if(G.hour<19.5) GM.advance(19.5-G.hour);   /* 19:30 送上車，21:00 回到臺北（事件的 hours 1.5）*/
    if(C&&C.send){ if(C.send.narr) await GM.say(null,C.send.narr); await playHL(GM,C.send.dating); }
    merge(G,'KX_TRIP',{Y2W:'kaohsiung'}); (F.HV_LAST||(F.HV_LAST={})).kexin=G.day;
    const N=F.HV_N||(F.HV_N={}); (F.HV_PRE||(F.HV_PRE={})).kexin={v:'night',at:N.kexin|0}; N.kexin=(N.kexin|0)+1; };   /* AA_338 第 4 題：1/14 這一趟算進「第一次／再來」的輪替，之後去高雄找她（hometown3d.js）接人用「再來」那一版（pickAgain）；
     AA_343 A4：這一趟是夜市（HV_PRE）——還沒演過港邊（first）的下一次先演港邊，again 第一輪跳過夜市、從下雨開始。1/14 沒去（missed）的不算、照原本的 first／again */
  EV.push({ id:'ev_kexin_trip_winter_y2', title:'寒假去高雄', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5, kxAway:true,
    beforeOuting:async(G,GM,q)=>{ await S.khTrip(GM,q); },
    outingMissed:(G,GM,q)=>{ merge(G,'KX_TRIP',{Y2W:'missed'}); at(G,q.day,G.day===q.day?Math.max(12,G.hour):12,[K('你沒上車。'),K('……夜市我自己去了。行程表還在。')],'y2r2_kh_missed'); },   /* 1/14 12:00（出發選單選「不去了」是 12:15 以後＝當下）*/
    dialogue:[] });
  /* ---------- 2-Y2-12 可昕「情人節」：2/14（日）20:00 視訊 ---------- */
  const VW=v=>({custom:G=>(G.flags.KX_VDAY_WX||{})[1]===v&&(G.flags.KX_VDAY||{})[1]!=='missed'});
  EV.push({ id:'ev_kexin_valentine_y2', title:'情人節', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    outingMissed:(G,GM,q)=>{ merge(G,'KX_VDAY',{2:'missed'}); at(G,q.day,20.5,[K('打了兩次。你應該在忙。'),K('你那邊的天氣，我自己查了。情人節快樂。開學那個週末見。')],'y2r2_vday_missed'); },
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'kexin',expression:'smile',text:'你那邊的天氣？'},
      {if:VW('sunny'),speaker:'kexin',expression:'smile',text:'去年你說晴天，很冷。'},
      {if:VW('rain'),speaker:'kexin',expression:'smile',text:'去年你說下雨。'},
      {if:VW('window'),speaker:'kexin',expression:'smile',text:'去年你給我看你的窗。'},
      {if:{custom:G=>(G.flags.KX_VDAY||{})[1]==='missed'},speaker:'kexin',expression:'teasing',text:'去年你沒接。今年接了。很好。'},
      {choice:[{text:'「晴天。很冷。」',set:{_y2Vwx:'sunny'},goto:'w1'},{text:'「下雨。」',set:{_y2Vwx:'rain'},goto:'w2'},{text:'（把鏡頭轉向窗外）',set:{_y2Vwx:'window'},goto:'w3'}]},
      {label:'w1'},{speaker:'kexin',expression:'smile',text:'臺北的冬天很少晴天。……你今年運氣很好。'},{goto:'same'},
      {label:'w2'},{speaker:'kexin',expression:'teasing',text:'我這邊沒下，二十度。……我不是在炫耀。'},{goto:'same'},
      {label:'w3'},{speaker:null,text:'（她也把手機轉向她的窗戶。）'},{speaker:'kexin',expression:'smile',text:'……好，看到了。換你看我的。'},
      {label:'same'},{if:{custom:G=>!!G.flags._y2Vwx&&(G.flags.KX_VDAY_WX||{})[1]===G.flags._y2Vwx&&(G.flags.KX_VDAY||{})[1]!=='missed'},speaker:'kexin',expression:'smile',text:'跟去年一樣。'},
      {speaker:'kexin',expression:'smile',text:'情人節快樂。開學那個週末見。'} ],
    after:G=>{ const F=G.flags; merge(G,'KX_VDAY',{2:'video'}); if(F._y2Vwx){ merge(G,'KX_VDAY_WX',{2:F._y2Vwx}); delete F._y2Vwx; } } });
  /* ---------- 電話（演出來的；call:true 在家也不用出門）：除夕「打給妳。」、生日的電話版、K14 沒見面、芷若錄取那晚 ---------- */
  EV.push({ id:'ev_kexin_lunar_eve_y2_call', title:'除夕的電話', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25, kxAway:true,
    dialogue:[ {scene:'電話',bg:'home_living'},   /* 祐廷在臺北的家（AA_325 2-Y2-11 第 1 節）*/
      {speaker:null,text:'（你打過去。她那邊的鞭炮聲還沒停。）'},
      {speaker:'kexin',expression:'neutral',text:'……你那邊好安靜。'},
      {speaker:null,text:'（她後面有人在喊她。）'},
      {speaker:'kexin',expression:'neutral',text:'我表弟又要開一局。……你媽媽是不是也在叫你？'},
      {speaker:null,text:'（客廳裡，你媽媽在叫你。）'},
      {speaker:'kexin',expression:'smile',text:'去吧。早點睡。'} ] });
  /* ---------- 2-Y2-15 可昕「她的生日（大二）」：4/24（六）19:00；予樂 4/17 21:00 私訊 ---------- */
  const BV=v=>({custom:G=>G.flags._y2BdV===v});
  EV.push({ id:'ev_kexin_birthday_y2', title:'她的生日', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    beforeOuting:(G,GM,q)=>{ G.flags._y2BdV=(q&&q.bdV)||'class'; },
    outingMissed:(G,GM,q)=>{ const v=q&&q.bdV; if(v==='drive'||v==='gg') return;   /* 沒回予樂、自己開車去的那一趟沒去＝照「都沒做」；「妳來公館」那一趟沒去＝21:30、22:00 她的兩則、記 'none'（S.bdayRules，AA_343 A1）*/
      G.flags.Y2R2_BD_NOSHOW=true; at(G,q.day,21,[K('你沒來。'),K('……予樂她們陪我過了。')],'y2r2_bd_noshow'); },
    dialogue:[
      {if:BV('class'),scene:'木柵大學・系上的小教室',bg:'classroom_small'},{if:BV('shop'),scene:'木柵大學・山下的小吃街',bg:'nccu_food'},
      {if:{custom:G=>G.flags._y2BdV==='two'||G.flags._y2BdV==='drive'},scene:'木柵大學・校門口',bg:'nccu_gate'},
      {if:BV('gg'),scene:'公館',bg:'gongguan'},   /* 沒回予樂、MSG-2 選「妳來公館」：21:00 公館（AA_338 第 2 節）*/
      {if:{custom:G=>G.flags._y2BdV!=='gg'&&!!G.flags.KX_TASSEL_PROMISE},speaker:null,text:'（木柵大學門口的流蘇開了。白白的一整片。）'},   /* AA_525 3-7（K-9）：大一下 K2-L6 選「明年我們一起看。」（KX_TASSEL_PROMISE）＝到政大的版本開頭一句 */
      {if:BV('class'),speaker:null,text:'（系上小教室的燈關著。予樂、邵鈞、詹靖躲在桌子後面。可昕推門進來，燈亮。）'},
      {if:BV('class'),speaker:'kexin',expression:'surprised',text:'……你們。'},
      {if:BV('class'),speaker:'kexin',expression:'teasing',text:'你也是。你什麼時候跟予樂變成同一國的？'},
      {if:{custom:G=>G.flags._y2BdV==='class'&&!G.flags.KX_NCCU_FRIENDS},speaker:'kexin',expression:'smile',text:'都躲在一起了，我還是正式介紹一次。這是邵鈞，考古題有目錄的那個。'},
      {if:{custom:G=>G.flags._y2BdV==='class'&&!G.flags.KX_NCCU_FRIENDS},speaker:'kexin',expression:'smile',text:'這是詹靖，什麼都拍。……她現在也在拍。'},
      {if:{custom:G=>G.flags._y2BdV==='class'&&!!G.flags.KX_NCCU_FRIENDS},speaker:'kexin',expression:'smile',text:'邵鈞、詹靖你都見過了。今天他們是共犯。'},
      {if:BV('shop'),speaker:null,text:'（老闆端出一碗沒點的酸辣湯餃，上面插了一根蠟燭。）'},
      {if:{custom:G=>G.flags._y2BdV==='shop'&&G.flags.K1_ORDER==='let_her'&&(G.flags.NCCU_FOOD_N|0)>=3},speaker:'老闆',text:'她的那一碗，跟你的點法一樣。'},
      {if:BV('two'),speaker:'kexin',expression:'smile',text:'予樂說你要搶晚上。……好，晚上是你的。'},
      {if:BV('drive'),speaker:'kexin',expression:'surprised',text:'予樂說你沒回她。……結果你自己來了。'},
      {if:BV('gg'),speaker:null,text:'（九點，她從公車上下來，手上還拿著半塊蛋糕。）'},
      {if:BV('gg'),speaker:'kexin',expression:'smile',text:'予樂她們先幫我過了一次。……這是第二次。'},
      {speaker:'kexin',expression:'smile',text:'明年也這樣。你跟予樂先講好，我假裝不知道。'} ],
    after:G=>{ const F=G.flags, v=F._y2BdV; delete F._y2BdV; const rec={class:'class',shop:'shop',two:'two',drive:'two',gg:'two'}[v]||'class'; merge(G,'KX_BDAY',{2:rec});
      if(v==='class'){ remember('kexin','KX_BDAY2_CAKE','大二的生日：系上小教室的蛋糕'); F.KX_NCCU_FRIENDS=true; } } });   /* 小教室生日在場＝可昕正式介紹過邵鈞、詹靖，之後只讀 KX_NCCU_FRIENDS（AA_343 C7）*/
  EV.push({ id:'ev_kexin_birthday_y2_call', title:'她的生日（電話）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25, kxAway:true,   /* 電話版：她不在面前，後面不接見面的閒聊階梯 */
    outingMissed:(G,GM,q)=>{ G.flags.Y2R2_BD_CALL_MISSED=true;
      if(q&&q.id==='y2r2_bd_call') at(G,q.day,G.day===q.day?Math.max(22.5,G.hour):22.5,[K('電話呢。……好啦，訊息也算。')],'y2r2_bd_call_skip'); },   /* 沒回予樂、傳了生日快樂、電話跳過：22:30 她私訊（AA_338 第 2 節；22:30 以後才跳過的＝當下）*/
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（電話那頭很吵。予樂在後面喊：「司機！」）'},
      {speaker:'kexin',expression:'smile',text:'予樂說你只能打電話。……電話也算。'},
      {speaker:'kexin',expression:'smile',text:'明年也這樣。你跟予樂先講好，我假裝不知道。'} ],
    after:G=>{ merge(G,'KX_BDAY',{2:'message'}); } });
  /* ---------- 2-Y2-16 可昕 K12b「回程的公車」：5/8（六）13:00 老街 ---------- */
  const UGO=id=>({custom:G=>!!(G.flags.Y2R2_U_WHO||[]).includes(id)});
  const inBranch=(G,id)=>Array.isArray(G.flags.NOODLE_BRANCH_MEMBERS)?G.flags.NOODLE_BRANCH_MEMBERS.includes(id):knows(id,G);   /* 「麵店分店」的成員（1B-07 記在 NOODLE_BRANCH_MEMBERS；沒有的舊存檔＝K12 那天認識才在，同 1B-07 的規則）*/
  EV.push({ id:'ev_kexin_bus_home', title:'回程的公車', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    beforeOuting:(G)=>{ const W=['kexin','yule','zhe']; if(inGroup(G,'noodle_branch')&&inBranch(G,'yu')) W.push('yu'); if(G.flags.KX_NCCU_FRIENDS) W.push('nccu'); G.flags.Y2R2_U_WHO=W; },
    outingMissed:(G)=>{ G.flags.KX_BUS_HOME='no'; },
    dialogue:[ {scene:'老街',bg:'trip_oldtown'},
      {speaker:null,text:'（山邊的老街。一條上坡的窄路，兩邊都是賣吃的。）'},
      {speaker:'kexin',expression:'neutral',text:'（在第一家店門口）這家寫百年老店。'},
      {speaker:'kexin',expression:'teasing',text:'……隔壁那家也寫。'},
      {speaker:'予樂',text:'今天每個人都要有一個老街限定的名字。'},
      {speaker:'予樂',text:'{name}，你是「放假的司機」。'},
      {speaker:'予樂',text:'可昕是「老街考古學家」。阿哲是「試吃大使」。'},
      {if:UGO('yu'),speaker:'予樂',text:'Alison 是『書記』。'},
      {if:UGO('nccu'),speaker:'予樂',text:'邵鈞是『拍照的那個』，詹靖是『找廁所的那個』。'},{if:UGO('nccu'),speaker:'詹靖',text:'……這個不能改嗎？'},
      {speaker:'kexin',expression:'neutral',text:'那妳呢？'},
      {speaker:'予樂',text:'我是「命名官」。這個不能投票。'},
      {advance:G=>G.hour<17?17-G.hour:0},
      {speaker:'予樂',text:'要先回去的舉手。剩下的吃完晚餐，搭晚上的公車。'},
      {choice:[{text:'「留下來吃晚餐。」',set:{KX_BUS_HOME:'kissed'},goto:'bus'},{text:'「我先回去。」',set:{KX_BUS_HOME:'left'},goto:'left'}]},
      {label:'left'},{speaker:'kexin',expression:'smile',text:'好。到家傳一隻長頸鹿貼圖給我。'},{end:true},
      {label:'bus'},{advance:G=>G.hour<21.5?21.5-G.hour:0},{scene:'公車上',bg:'dark'},   /* 吃完晚餐、晚上的公車（21:30 上車，回到臺北 22:30；23:00 她傳）*/
      {speaker:null,text:'車開過一個彎。你不記得自己什麼時候睡著的。'} ],
    after:G=>{ const F=G.flags; delete F.Y2R2_U_WHO; if(!F.KX_BUS_HOME) F.KX_BUS_HOME='left'; } });
  /* ---------- 2-Y2-21 可昕 K14「她決定自己的暑假」：6/2（三）17:30 政大校園的路 ---------- */
  EV.push({ id:'ev_kexin_summer_plan', title:'她決定自己的暑假', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    outingMissed:(G)=>{ G.flags.Y2R2_K14_NOSHOW=true; },
    dialogue:[ {scene:'木柵大學・校園裡的路',bg:'nccu_campus'},
      {speaker:'kexin',expression:'smile',text:'我決定了。暑假我要去事務所實習。'},
      {speaker:'kexin',expression:'smile',text:'自己找的，自己面試的。錄取通知昨天來的。'},
      {speaker:'kexin',expression:'neutral',text:'高雄的事務所。暑假我本來就在家。'},
      {choice:[{text:'「妳想做哪一種案子？」',set:{KX_SUMMER:'kind'},goto:'a'},{text:'「會不會很累？」',set:{KX_SUMMER:'tired'},goto:'b'},{text:'「第一天下班，我打給妳。」',set:{KX_SUMMER:'call'},goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'thinking',text:'我還不知道。所以才要去。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'teasing',text:'會。所以你要負責宵夜。'},{goto:'end'},
      {label:'c'},{speaker:'kexin',expression:'smile',text:'好。……上班的時候不要打。'},
      {label:'end'},{speaker:null,text:'（她陪你走回停車場，一路在講事務所的地址怎麼走。）'} ] });
  EV.push({ id:'ev_kexin_summer_plan_call', title:'她決定自己的暑假', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25, kxAway:true,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（電話。）'},
      {if:{flags:['Y2R2_K14_NOSHOW']},speaker:'kexin',expression:'neutral',text:'你今天沒來。'},
      {speaker:'kexin',expression:'neutral',text:'……暑假的事，我決定了。去高雄的事務所實習。'},
      {speaker:'kexin',expression:'smile',text:'自己找的，昨天錄取。'},
      {speaker:'kexin',expression:'teasing',text:'本來想當面說。……那你下次要當面恭喜我。'},
      {choice:[{text:'「恭喜。」',goto:'a'},{text:'（沒說話）',goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'當面再說一次。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'neutral',text:'……好。我掛了。'},
      {label:'end'} ],
    after:G=>{ G.flags.KX_SUMMER='message'; } });
  /* ---------- 2-Y2-23 可昕 K13＋經濟系之夜（SK11）：6/4（五）19:00 社科院一樓 ---------- */
  const EKX=G=>!!G.flags.Y2R2_EN_KX;
  EV.push({ id:'ev_econ_night_y2', title:'經濟系之夜', participants:['econ_pinyu'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    beforeOuting:(G)=>{ G.flags.Y2R2_EN_KX=kx(G); },
    outingMissed:(G)=>{ G.flags.Y2R2_EN_MISSED=true; },
    dialogue:[ {scene:'社科院・一樓',bg:'soc_hall'},
      {speaker:null,text:'（社科院一樓。台上掛著「經濟系之夜」的布條，字是手寫的。）'},
      {speaker:'econ_pinyu',text:'前系友席。你坐這裡。我們這屆的。'},
      {if:{custom:EKX},speaker:'econ_tangrui',text:'前系友席，今年兩位！而且是一對！'},
      {if:{custom:EKX},speaker:null,text:'（全場起鬨。可昕把臉埋進節目單。）'},
      {speaker:null,text:'（唐睿拿新生喊的詞「邊際效用！」即興了一段，全場笑倒。）'},
      {speaker:'econ_tangrui',text:'最後一個獎。……前系友席！'},
      {choice:[{text:'「上台說一句謝謝。」',goto:'a'},{text:'「把餐券給台下的新生。」',goto:'b'},{text:'「只揮手。」',goto:'c'}]},
      {label:'a'},{speaker:'player',text:'謝謝經濟系。我學到的第一課是機會成本，我覺得很值得。'},{goto:'end'},
      {label:'b'},{speaker:null,text:'（你把學活自助餐的餐券，遞給台下看起來最餓的那個新生。他站起來鞠躬。）'},{goto:'end'},
      {label:'c'},{speaker:'econ_tangrui',text:'前系友行使緘默權！'},
      {label:'end'},
      {unless:{custom:EKX},speaker:null,text:'（品妤一個人在收椅子。你過去幫忙。）'},{unless:{custom:EKX},speaker:'econ_pinyu',text:'謝謝你來。我們這屆的人，少一個就看得出來。'},
      {if:{custom:EKX},speaker:null,text:'（品妤一個人在收椅子。你和可昕過去幫忙。）'},{if:{custom:EKX},speaker:'econ_pinyu',text:'前系友席兩張椅子，我只要搬一次。'} ],
    after:G=>{ const F=G.flags; remember('econ_pinyu','ECON_NIGHT','經濟系之夜：前系友席'); if(F.Y2R2_EN_KX) F.KX_ECON_NIGHT='together'; delete F.Y2R2_EN_KX; } });
  /* ---------- 2-Y2-20 系籃（大二下）：5/29（六）14:00 新體育館 ---------- */
  EV.push({ id:'ev_zhe_game_y2s2', title:'系籃比賽（大二下）', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'新體育館'},
      {speaker:null,text:'（系籃比賽。這學期最後一場。阿哲、明軒上場。）'},
      {if:{custom:G=>knows('yu',G)&&!!G.flags.Y2_BALL_SEEN},speaker:null,text:'（Alison 的加油板換了一面：「17 號，可以犯規一次。」）'},
      {if:{custom:G=>knows('yu',G)&&!G.flags.Y2_BALL_SEEN},speaker:null,text:'（Alison 坐在你旁邊，舉著一塊加油板。）'},
      {if:KN('heroine_01'),speaker:null,text:'（以安坐在最後一排，膝蓋上攤著讀書會的講義。）'},
      {choice:[{text:'（拍手）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME_Y2B',note:'你拍手'}]},goto:'clap'},{text:'（記分）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME_Y2B',note:'你記分'}]},goto:'score'},{text:'（送水）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME_Y2B',note:'你送水'}]},goto:'water'}]},
      {label:'clap'},{if:KN('heroine_01'),speaker:null,text:'（你拍手。旁邊的以安看了你一眼，也跟著拍了兩下，拍得很整齊。）'},{unless:KN('heroine_01'),speaker:null,text:'（你拍到手掌發紅。）'},{goto:'end'},
      {label:'score'},{speaker:null,text:'（你坐到記分台。最後一節，只差一分。）'},{speaker:'classmate_mingxuan',text:'（跑過記分台）「你翻慢一點，我緊張。」'},{goto:'end'},
      {label:'water'},{speaker:null,text:'（中場你把水搬到場邊。阿哲拿了一瓶，自己先喝。）'},{speaker:'classmate_mingxuan',text:'「……我的呢？」'},
      {label:'end'},
      {if:KN('yu'),speaker:null,text:'（比賽結束。阿哲走到觀眾席，先去拿 Alison 的加油板。）'},
      {if:KN('yu'),speaker:'zhe',text:'妳的板子寫錯字了。'},
      {if:KN('yu'),speaker:'yu',text:'那是故意的。'},
      {set:{Y2B_BALL_SEEN:true}} ] });
  /* ---------- 2-Y2-18 明軒 M2：6/12（六）09:00 三對三（和以安交往中、明軒知道的那一版）---------- */
  EV.push({ id:'ev_mx_3on3', title:'三對三', participants:['classmate_mingxuan'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    outingMissed:(G,GM,q)=>{ G.flags.MX_3ON3='missed'; at(G,q.day,12,[{th:'p:zhe',from:'zhe',text:'三對三我們兩個打對面三個'},{th:'p:zhe',from:'zhe',text:'輸了'},{th:'p:zhe',from:'zhe',text:'你欠我們一次'}],'y2r2_3on3_missed'); },
    dialogue:[ {scene:'新體育館・1F 球場'},
      {speaker:null,text:'（早上九點。三對三：阿哲、明軒、你一隊。）'},
      {speaker:'classmate_mingxuan',expression:'smile',text:'你真的起來了。'},
      {speaker:null,text:'（打完，三個人坐在場邊。明軒把水丟給你。）'},
      {speaker:'classmate_mingxuan',expression:'neutral',text:'八月我回彰化一週。其他時間都在家教。有球就叫我。'} ],
    after:G=>{ G.flags.MX_3ON3='went'; } });
  /* ---------- 2-Y2-17 芷若錄取那晚的電話（和芷若交往中，5/11 22:40 她傳、你打過去）---------- */
  EV.push({ id:'ev_zhiruo_admit_call', title:'信來了', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（她接起來，好一陣子沒說話。）'},
      {speaker:'heroine_02',expression:'smile',text:'我在哭。開心的啦。'},
      {speaker:null,text:'（你們沒有再說什麼。電話一直沒掛。）'} ],
    after:G=>{ G.flags.ZR_ADMIT_CALL='stayed'; } });

  /* ---------- 3D 的事件：2-Y2-13 押金（麵店）、2-Y2-14 G1、2-Y2-17 Z8＋錄取、2-Y2-18 推滷蛋＋回宿舍的路上、2-Y2-19 成發、2-Y2-22 語彤事件 11 ---------- */
  const GE=G=>!!G.flags.ZHE_CALLS_GE;
  const depAns=G=>!!(G.needed&&Array.isArray(G.needed.batches)&&G.needed.batches.some(b=>(b.ans||[]).includes('zhe_deposit')));   /* 回過週訊息 zhe_deposit */
  S.depDay=G=>{ const a=d('dep1'), b=d('dep2'); return G.day===a||G.day===b; };
  EV.push({ id:'ev_zhe_deposit', title:'學長的押金', participants:['zhe'], location:'noodle', trigger:'enter', term:['Y2S2'], weeks:[5,6], weekday:[2], time:[17.5,20.5], once:true, background:'blur',
    prereq:{custom:G=>law(G)&&S.depDay(G)},
    dialogue:[
      {if:{custom:G=>depAns(G)&&GE(G)},speaker:'zhe',expression:'neutral',text:'哥，照片我問了。他說搬進去那天，只拍了他的球衣。'},
      {if:{custom:G=>depAns(G)&&!GE(G)},speaker:'zhe',expression:'neutral',text:'照片我問了。他說搬進去那天，只拍了他的球衣。'},
      {if:{custom:depAns},speaker:'zhe',expression:'neutral',text:'房東現在改口，說牆上有釘子洞，押金全部不退。'},
      {if:{custom:G=>!depAns(G)&&GE(G)},speaker:'zhe',expression:'neutral',text:'哥，我學長退租，房東本來說押金扣一半。'},
      {if:{custom:G=>!depAns(G)&&!GE(G)},speaker:'zhe',expression:'neutral',text:'我學長退租，房東本來說押金扣一半。'},
      {unless:{custom:depAns},speaker:'zhe',expression:'neutral',text:'他自己去問，房東改口說牆上有釘子洞，全部不退。'},
      {speaker:'zhe',expression:'annoyed',text:'兩個月的押金耶。他本來要拿去買系籃鞋。'},
      {speaker:null,text:'（你打開手機的筆記，先寫了兩行：誰——阿哲的學長；向誰——房東。）'},
      {choice:[{text:'「先把租約和搬進來的照片給我看。」',set:{_depB:'photos'},goto:'b1'},{text:'「押金是擔保，扣要說得出理由。」',if:{flags:['U_LEASE']},set:{_depB:'lease'},goto:'b2'},{text:'「我不確定。週六去法服問。」',set:{_depB:'fafu'},goto:'b3'}]},
      {label:'b1'},{speaker:'zhe',expression:'surprised',text:'……搬進來時要拍照？'},{goto:'ask'},
      {label:'b2'},{speaker:'player',text:'押金是擔保。房東要扣，要說得出弄壞了什麼、修要多少。正常住的痕跡不一樣。'},{speaker:'zhe',expression:'thinking',text:'……所以釘子洞要看算不算『弄壞』。'},{goto:'ask'},
      {label:'b3'},{speaker:'zhe',expression:'neutral',text:'好。法服我知道在哪。'},
      {label:'ask'},
      {choice:[{text:'「全部退。」',set:{_depA:'all'},goto:'a1'},{text:'「退押金，牆要補就扣合理的錢。」',set:{_depA:'fair'},goto:'a2'}]},
      {label:'a1'},{speaker:'zhe',expression:'laugh',text:'全部退。好，聽起來很有氣勢。'},{goto:'next'},
      {label:'a2'},{speaker:'zhe',expression:'neutral',text:'……好啦，那個洞是他掛球衣的。'},
      {label:'next'},{speaker:'player',text:'先帶租約去跟房東談。談不攏，可以申請調解。要確認的話，週六上午去法服。'},
      {speaker:'zhe',expression:'smile',text:'好。你寫的那幾行傳給我，我轉給他。'} ],   /* 法律只講方向（擔保、正常耗損、調解），不寫條號；AA 已核方向（AA_338 第 9 題）*/
    after:G=>{ const F=G.flags; F.ZHE_DEPOSIT={basis:F._depB||'photos',ask:F._depA||'fair',day:G.day}; delete F._depB; delete F._depA; remember('zhe','ZHE_PHOTOS','學長的押金，搬進來要拍照'); } });
  /* AA_375 第 8 項：移到最後一科考完——大二下的期中考 4/12 債各、4/13 身分法、4/14 行政救濟、4/15（四）法學英文（法學英文沒有選擇，每個人都修：classes3d.js S.enrolled），
     最後一科是 4/15 法學英文（AA 寫的「4/14」是沒算法學英文；給 AA 的問題）。原本在 4/12 債各考完 */
  EV.push({ id:'ev_midterm_walkout_y2s2', title:'考完試走出教室', participants:[], location:'any', trigger:'class', afterClass:'legal_english', afterExam:'mid', term:['Y2S2'], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'（法律系館A二樓的走廊。債各考完，大家還站在教室門口。）'},
      {if:KN('yu'),speaker:'yu',expression:'neutral',text:'債各的第二題，我寫了『買賣不破租賃』。……題目問的是租賃。'},   /* AA_375 第 8 項：贈與第 14 週才教；租賃第 4～6 週 */
      {if:{custom:G=>knows('yu',G)&&knows('zhe',G)},speaker:'zhe',expression:'laugh',text:'贈與那題我也寫錯了。我們一起錯。'},
      {if:KN('heroine_03'),speaker:'heroine_03',expression:'neutral',text:'……第二題寫完，我才發現背面還有一題。'},
      {if:KN('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'我寫了三頁。第二題值得。'},
      {if:KN('classmate_xinci'),speaker:'classmate_xinci',expression:'neutral',text:'期中考完了。今天之後，我不跟你們對答案。'} ],
    after:G=>{ for(const id of ['yu','zhe','heroine_03','heroine_01','classmate_xinci']) if(knows(id,G)) remember(id,'SHARED_CLASS','債各期中考'); } });
  /* Z8：吉他社社課（萬才館）走到子晴旁邊——AA_375 第 13 項：演唱會是 5/15（六）晚上，改 5/17（一）以後（5/17 週一；沒遇到 5/19 週三）；句子不改。原本 5/12、5/19 */
  const zrDate=G=>dating(G,'heroine_02')&&knowsOf(G,'heroine_04','heroine_02');   /* 交往版：子晴知道祐廷和芷若在交往 */
  const zrApplied=G=>done(G,'ev_zhiruo_applied')||!!G.flags.ZR_NOMINATED;
  EV.push({ id:'ev_zhiruo_concert', title:'演唱會那天', participants:['heroine_04'], location:'wancai', trigger:'interact', term:['Y2S2'], weeks:[13], weekday:[1,3], time:[19,21], once:true, priority:5, background:'blur',
    prereq:{custom:G=>law(G)&&(G.day===d('zq8a')||G.day===d('z8b'))&&atLeast('heroine_04','FAMILIAR')&&atLeast('heroine_02','FAMILIAR')},
    dialogue:[ {speaker:'heroine_04',expression:'surprised',text:'欸，你知道芷若在演唱會哭嗎？'},
      {unless:{custom:zrDate},speaker:'heroine_04',expression:'neutral',text:'安可那首。哭到隔壁的人遞面紙給她。'},
      {if:{custom:G=>!zrDate(G)&&zrApplied(G)},speaker:'heroine_04',expression:'neutral',text:'她說是因為英國那邊的錄取信來了。她等了五個月。'},
      {if:{custom:G=>!zrDate(G)&&!zrApplied(G)},speaker:'heroine_04',expression:'neutral',text:'她說是因為英國那邊的錄取信來了。她申請交換，等了五個月。'},
      {unless:{custom:zrDate},speaker:'heroine_04',expression:'teasing',text:'……她還沒跟你說吧。她要自己說。你裝不知道。'},
      {if:{custom:zrDate},speaker:'heroine_04',expression:'thinking',text:'……她是不是已經跟你說了。'},
      {if:{custom:G=>zrDate(G)&&G.day===d('z8a')},speaker:'player',text:'昨天晚上。'},
      {if:{custom:G=>zrDate(G)&&G.day!==d('z8a')},speaker:'player',text:'上禮拜。'},
      {if:{custom:zrDate},speaker:'heroine_04',expression:'annoyed',text:'可惡。我以為我是第一個。……好啦，你是男朋友，你先。'} ],
    after:G=>{ if(!zrDate(G)) remember('heroine_02','HEARD_FROM_ZIQING','子晴說了演唱會和錄取信'); } });
  const ZRD=G=>dating(G,'heroine_02');
  const ZR1=G=>G.day===d('z8a');   /* 5/12 到 Café＝「昨天那通電話」，晚幾天才到＝「那天」*/
  EV.push({ id:'ev_zhiruo_admitted', title:'錄取', participants:['heroine_02'], location:'cafe', trigger:'enter', once:true, npcZone:['heroine_02'], background:'blur',
    prereq:{custom:G=>{ const a=d('z8a'), z=d('z9'); return law(G)&&a!=null&&z!=null&&G.day>=a&&now(G)<abs(z,21)&&!done(G,'ev_zhiruo_last_shift')&&atLeast('heroine_02','FAMILIAR'); }},   /* AA_375 第 2 項：期限改到 6/3 那個班（Z9，21:00）以前（原本 5/12 起 120 天）；6/3 以前沒聽她說的，Z9 那一場照現有的版本交代 */
    dialogue:[
      /* 一般版 */
      {if:{custom:G=>!ZRD(G)&&zrApplied(G)},speaker:'heroine_02',expression:'smile',text:'我錄取了。英國那邊的信來了。'},
      {if:{custom:G=>!ZRD(G)&&!zrApplied(G)},speaker:'heroine_02',expression:'smile',text:'下學期我要去英國交換。那邊的信，前幾天來了。'},
      {if:{custom:G=>!ZRD(G)&&!!G.flags.ZR_NOMINATED},speaker:'heroine_02',expression:'smile',text:'一月那則的下文。……你等到了。'},
      {if:{custom:G=>!ZRD(G)&&!mem('heroine_02','HEARD_FROM_ZIQING')},speaker:'heroine_02',expression:'laugh',text:'這幾天一直想跟每個客人說。……結果都沒說。'},
      {if:{custom:G=>!ZRD(G)&&mem('heroine_02','HEARD_FROM_ZIQING')},choice:[{text:'（裝不知道）「恭喜！」',goto:'h1'},{text:'「我聽說了。」',goto:'h2'}]},
      {if:{custom:G=>!ZRD(G)&&!mem('heroine_02','HEARD_FROM_ZIQING')},choice:[{text:'「恭喜。」',goto:'n1'},{text:'「九月走？」',goto:'n2'}]},
      {if:{custom:G=>!ZRD(G)},goto:'end'},
      /* 交往版 */
      {if:{custom:G=>G.flags.ZR_ADMIT_CALL==='stayed'&&ZR1(G)},speaker:'heroine_02',expression:'smile',text:'昨天那通電話，我後來睡著了。你掛了嗎？'},
      {if:{custom:G=>G.flags.ZR_ADMIT_CALL==='stayed'&&!ZR1(G)},speaker:'heroine_02',expression:'smile',text:'那天那通電話，我後來睡著了。你掛了嗎？'},
      {if:{custom:G=>G.flags.ZR_ADMIT_CALL!=='stayed'},speaker:'heroine_02',expression:'neutral',text:'錄取了。……那天你沒打來。'},
      {if:{flags:['ZR_NOMINATED']},speaker:'heroine_02',expression:'smile',text:'一月那則的下文。……你等到了。'},
      {if:{custom:G=>G.flags.ZR_ADMIT_CALL==='stayed'},speaker:'player',text:'……沒有。'},
      {if:{custom:G=>G.flags.ZR_ADMIT_CALL==='stayed'},speaker:'heroine_02',expression:'laugh',text:'……你好笨。電話費。'},
      {if:{custom:G=>G.flags.ZR_ADMIT_CALL!=='stayed'},speaker:null,text:'（她把吧檯擦了一遍，沒有看你。）'},
      {speaker:'heroine_02',expression:'neutral',text:'九月我就走了。五個多月。'},   /* AA_375 第 2 項：「四個月」→「五個多月」（她 9/2～2/12 不在台灣）*/
      {choice:[{text:'「五個多月很快。」',goto:'d1'},{text:'「我去看妳。」',set:{ZR_VISIT_PROMISE:true},goto:'d2'},{text:'「妳的點法，我會記得。」',if:{memory:[{npc:'heroine_02',tag:'ASKED_HER_DRINK'}]},goto:'d3'}]},
      {label:'d1'},{speaker:'heroine_02',expression:'smile',text:'五個多月欸。……好啦，你這樣講我比較安心。'},{goto:'end'},
      {label:'d2'},{speaker:'heroine_02',expression:'neutral',text:'機票很貴。'},{speaker:'player',text:'我存。'},{speaker:'heroine_02',expression:'smile',text:'……好。那我排一部電影，等你來一起看。'},{goto:'end'},
      {label:'d3'},{speaker:'heroine_02',expression:'smile',text:'……我回來再做給你喝。不要讓新店員做。'},{goto:'end'},
      {label:'h1'},{speaker:null,text:'（她笑。）'},{speaker:'heroine_02',expression:'laugh',text:'子晴跟你說了吧。你裝得很爛。'},{goto:'end'},
      {label:'h2'},{speaker:'heroine_02',expression:'neutral',text:'……子晴。'},{speaker:null,text:'（她嘆氣。）'},{speaker:'heroine_02',expression:'smile',text:'好吧。那我不用再說一次了。'},{goto:'end'},
      {label:'n1'},{speaker:'heroine_02',expression:'smile',text:'……謝謝。'},{speaker:null,text:'（她在你的杯子上多加了一點奶泡。）'},{goto:'end'},
      {label:'n2'},{speaker:'heroine_02',expression:'neutral',text:'嗯。九月初。……還有三個多月。'},
      {label:'end'} ],
    after:G=>{ G.flags.ZR_ADMITTED=true; } });
  /* 2-Y2-18 明軒 M2 */
  const mxKnows=G=>dating(G,'heroine_01')&&knowsOf(G,'classmate_mingxuan','heroine_01');   /* 和以安交往中、明軒知道＝他不說出口 */
  const mxFriend=G=>['FRIEND','CLOSE_FRIEND'].includes(typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel('classmate_mingxuan'):'');
  EV.push({ id:'ev_mx_m2_egg', title:'請你的', participants:['classmate_mingxuan'], location:'noodle', trigger:'enter', term:['Y2S2'], weeks:[14], weekday:[2,4], time:[17.5,18+40/60], once:true, background:'blur',
    prereq:{custom:G=>law(G)&&(G.day===d('egg1')||G.day===d('egg2'))&&mxFriend(G)},
    dialogue:[ {if:{custom:mxKnows},speaker:null,text:'（以安說要回去改讀書會的題目，先走了。）'},
      {speaker:null,text:'（明軒把自己碗裡的滷蛋，推到你碗裡。）'},
      {speaker:'classmate_mingxuan',expression:'neutral',text:'請你的。不要問。'} ],
    after:G=>{ G.flags.MX_EGG=true; } });
  EV.push({ id:'ev_mx_m2_walk', title:'回宿舍的路上', participants:['classmate_mingxuan'], location:'dorm_hall', trigger:'enter', term:['Y2S2'], weeks:[15], weekday:[1,3], time:[21,23], once:true, background:'blur',
    prereq:{custom:G=>law(G)&&(G.day===d('walk1')||G.day===d('walk2'))&&mxFriend(G)},
    dialogue:[
      {if:{custom:mxKnows},goto:'k'},
      {speaker:'classmate_mingxuan',expression:'neutral',text:'我跟以安說了。'},
      {speaker:'classmate_mingxuan',expression:'neutral',text:'她說她想了三天。答案是沒有，理由是她對我沒有那種感覺。'},
      {speaker:'classmate_mingxuan',expression:'neutral',text:'……她講得很清楚。我只回了一句「好」。'},
      /* AA_497 4-2 (a)：大一下下雨天的傘（MX_UMB；src/sup497_3d.js），他說完以後多一句；沒看到傘那一場＝照舊 */
      {if:{flagIs:{MX_UMB:'TOLD'}},speaker:'classmate_mingxuan',expression:'neutral',text:'她說，那把傘，她一直知道是我的。'},
      {if:{flagIs:{MX_UMB:'SILENT'}},speaker:'classmate_mingxuan',expression:'neutral',text:'她說，那把傘，她後來才知道是我的。'},
      {choice:[{text:'「你還好嗎？」',goto:'g1'},{text:'「她很像會這樣回答。」',goto:'g2'},{text:'（陪他走，不說話）',goto:'quiet'}]},
      {label:'g1'},{speaker:'classmate_mingxuan',expression:'smile',text:'還好。你看，我還吃得下滷蛋。'},{if:{flags:['MX_EGG']},speaker:null,text:'（他上週才把滷蛋給你。）'},{speaker:'classmate_mingxuan',expression:'smile',text:'……好啦，我明天再吃。'},{goto:'end'},
      {label:'g2'},{speaker:'classmate_mingxuan',expression:'laugh',text:'對吧。她連拒絕都講得很有條理。'},{speaker:null,text:'（他笑了。）'},{goto:'end'},
      {label:'k'},{speaker:'classmate_mingxuan',expression:'smile',text:'期末考完，系籃要打一場三對三。你來。'},
      {speaker:'classmate_mingxuan',expression:'neutral',text:'……你們兩個，最近都很累的樣子。期末嘛。'},
      {choice:[{text:'「你也是啊。」',goto:'k1'},{text:'「三對三幾點？」',goto:'k2'},{text:'（陪他走，不說話）',goto:'quiet'}]},
      {label:'k1'},{speaker:'classmate_mingxuan',expression:'neutral',text:'家教多接了一個。……還好。'},{speaker:null,text:'（他笑了。）'},{speaker:'classmate_mingxuan',expression:'smile',text:'你們都很會擔心別人，這點很像。'},{goto:'end'},
      {label:'k2'},{speaker:'classmate_mingxuan',expression:'smile',text:'週六早上九點。……我知道你起不來，所以約九點。'},{goto:'end'},
      {label:'quiet'},{speaker:null,text:'（走到宿舍門口，他把耳機戴上，又拿下來。）'},{speaker:'classmate_mingxuan',expression:'neutral',text:'明天麵店，你幫我留個位子。'},{speaker:null,text:'（以前都是他幫別人留。）'},
      {label:'end'} ],
    after:G=>{ if(mxKnows(G)){ G.flags.MX_3ON3_ASKED=true; return; } remember('classmate_mingxuan','MX_TOLD','他跟以安說了'); G.flags.MX_HEARD=true; } });
  /* 2-Y2-19 子晴 Q9 第二次成發（activities.js guitar_show_y2s2）*/
  const q5Went=G=>['clap','came','half'].includes(G.flags.ZQ_SHOW);
  const zqSingleFriend=G=>!dating(G,'heroine_04')&&!(typeof ROM!=='undefined'&&ROM.partners&&ROM.partners(G).length)&&['FRIEND','CLOSE_FRIEND'].includes(typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel('heroine_04'):'');   /* 雙方都單身：子晴沒有交往的對象（遊戲裡她只和祐廷交往）、祐廷沒有和任何人交往 */
  const zqSong=G=>!!(G.needed&&Array.isArray(G.needed.batches)&&G.needed.batches.some(b=>(b.ans||[]).includes('zq_song')));
  EV.push({ id:'ev_ziqing_show2', title:'第二次成發', participants:['heroine_04'], location:'wancai', trigger:'activity', term:['Y2S2'], once:true, background:'blur',
    prereq:{custom:G=>knows('heroine_04',G)&&mem('heroine_04','INVITED_CLUB')},
    dialogue:[ {speaker:null,text:'（法律系館B大廳，第二次的成發。前兩排坐滿了系籃的人，阿哲坐在最旁邊。）'},
      {if:{custom:q5Went},goto:'went'},
      /* Q5 沒去、這次有去 */
      {speaker:null,text:'（你坐在第一排。她上台看到你，愣了一下。這次沒有按錯和弦。）'},
      {if:{custom:zqSong},speaker:null,text:'（第四句唱到「重來」兩個字的時候，她看了觀眾席一眼。）'},
      {unless:{custom:G=>dating(G,'heroine_04')},speaker:null,text:'（下台後，她走到第一排，來的人一人一張插座貓貼紙。）'},
      {unless:{custom:G=>dating(G,'heroine_04')},speaker:'heroine_04',expression:'neutral',text:'（發到你的時候）去年的份。'},
      /* 和子晴交往中（AA_338 第 3 節「沒看過 Q5」；大二下可以已經交往）：她不發，直接走過來貼——取代上面兩句（不然「下台後」說兩次）；BB_189 1-3 的「去年的份。」留著（AA_343 A3）*/
      {if:{custom:G=>dating(G,'heroine_04')},speaker:null,text:'（下台後，她走過來，把一張插座貓貼紙直接貼在你的手機殼上。）'},
      {if:{custom:G=>dating(G,'heroine_04')},speaker:'heroine_04',expression:'neutral',text:'去年的份。'},
      {if:{custom:G=>dating(G,'heroine_04')},speaker:'heroine_04',expression:'embarrassed',text:'……今年你有來。我看到了。不要換位子。'},
      {if:{custom:G=>!dating(G,'heroine_04')&&zqSingleFriend(G)},speaker:null,text:'（她不是遞給你，是直接貼在你的手機殼上，什麼都沒說。）'},
      {if:{custom:G=>!dating(G,'heroine_04')&&!zqSingleFriend(G)},speaker:null,text:'（她把貼紙遞給你。）'},
      {mem:[{npc:'heroine_04',tag:'CLAPPED',note:'大二下的吉他社成發：第一排'}]},{goto:'end'},
      /* Q5 去過、這次去 */
      {label:'went'},
      {if:{custom:zqSong},speaker:null,text:'（第四句唱到「重來」兩個字的時候，她看了觀眾席一眼。）'},
      {speaker:null,text:'（第二首唱完。她對著麥克風。）'},
      {speaker:'heroine_04',expression:'laugh',text:'去年那個 bug 修好了。'},
      {speaker:null,text:'（她看向觀眾席，找到你，比了一個拍手的手勢。）'},
      {if:{custom:G=>dating(G,'heroine_04')},speaker:null,text:'（下台後，她沒有發貼紙給你。她走過來，把一張插座貓貼紙直接貼在你的手機殼上。）'},   /* AA_338 第 3 節「看過 Q5」*/
      {if:{custom:G=>dating(G,'heroine_04')},speaker:'heroine_04',expression:'smile',text:'第二張。明年還有第三張。'},
      {if:{custom:G=>dating(G,'heroine_04')},set:{ZQ_STICKER3:true}},   /* AA_526 第 2 節 1-1（企劃線 4ada43291）：聽過「明年還有第三張」＝2028 Q12 的第三張（y34b3d.js S.zq3rd）*/
      {label:'end'} ],
    after:G=>{ G.flags.ZQ_SHOW2='came'; if(G.flags.ZQ_STICKER3==null) G.flags.ZQ_STICKER3=false; } });   /* AA_526：演過、沒聽過那一句（「去年的份。」那一支、went 但沒交往）＝false；舊存檔沒有這個旗標＝y34b3d.js 照「演過、大一 Q5 去過、現在交往中」算 */
  /* 2-Y2-22 語彤事件 11：6/3（四）17:30～19:30 走進麵店（沒去＝6/17）*/
  const ytBf=G=>dating(G,'heroine_03');
  /* AA_375 第 21 項：補演（6/17 17:30）和語彤的學期末的飯（週四 19:00 麵店，termend 的出遊 te_Y2S2／te_gf_Y2S2_heroine_03）互斥——排了期末飯的那天，補演改隔天 */
  S.yt11bDay=G=>{ const b=d('yt11b'); if(b==null) return null; const q=[outGet(G,'te_Y2S2'),outGet(G,'te_gf_Y2S2_heroine_03')].find(x=>x&&x.te&&x.te.who==='heroine_03'&&x.day===b&&x.state!=='cancelled'); return q?b+1:b; };
  const yt11Day=G=>G.day===d('yt11')||G.day===S.yt11bDay(G);
  EV.push({ id:'ev_yt_help_dishes', title:'想幫她', participants:['heroine_03'], location:'noodle', trigger:'enter', time:[17.5,19.5], background:'blur',   /* 不用 once：先走的 6/17 再一次（YT_EV11、YT_EV11_SEEN 管次數）*/
    prereq:{custom:G=>law(G)&&yt11Day(G)&&!!G.flags.YT_HELP_OFFERED&&atLeast('heroine_03','FAMILIAR')&&G.flags.YT_EV11!=='dishes'&&!(G.flags.YT_EV11==='left'&&G.day!==S.yt11bDay(G))&&!(G.flags.YT_EV11_SEEN===G.day)},
    dialogue:[
      {if:{flagIs:{YT_EV11:'left'}},goto:'again'},
      {speaker:null,text:'（她把你叫到門口。）'},
      {speaker:'heroine_03',expression:'serious',text:'你不用這樣。'},
      {unless:{custom:ytBf},speaker:'heroine_03',expression:'serious',text:'我不想當你的個案。'},
      {if:{custom:ytBf},speaker:'heroine_03',expression:'serious',text:'你是我男朋友。不用每件事都幫我想辦法。'},
      {choice:[{text:'（什麼都不說，捲起袖子去後面洗碗）',goto:'dish'},{text:'「……好。我先走。」',goto:'left'}]},
      {label:'left'},{speaker:null,text:'（她點頭，回去顧店。）'},{set:{YT_EV11:'left'}},{end:true},
      {label:'again'},
      {choice:[{text:'（捲起袖子，去後面洗碗）',goto:'dish'},{text:'（坐下來吃麵）',goto:'eat'}]},
      {label:'eat'},{end:true},
      {label:'dish'},{speaker:null,text:'（時間快轉到打烊。你洗了兩個小時的碗。）'},
      {advance:G=>G.hour<21?21-G.hour:0},{consequences:{energy:-10}},
      {speaker:null,text:'（打烊後，她遞給你一碗麵。）'},
      {speaker:'heroine_03',expression:'neutral',text:'……你洗得很爛。'},
      {speaker:'heroine_03',expression:'smile',text:'下次不用幫我。陪我吃麵就好。'},
      {set:{YT_EV11:'dishes'}},{mem:[{npc:'heroine_03',tag:'APOLOGIZED',note:'洗了兩個小時的碗'}]} ],
    after:G=>{ G.flags.YT_EV11_SEEN=G.day; } });

  /* ==================== AA_342 第 2-2 節：大二下的空白（第①級；AA-C 定稿，句子照抄；AA_375 第 4 節提醒還沒進遊戲）====================
     「典型玩家」（AA_342 檔首）：在麵店團群組；不設 FRIEND 門檻。週四的麵店＝麵店團的時段（17:30～21:00），只演一次 */
  const ndl=G=>law(G)&&inGroup(G,'noodle_team');
  EV.push({ id:'ev_y2s2_thu_noodle_first', title:'', participants:[], location:'noodle', trigger:'enter', term:['Y2S2'], weeks:[1,2,3], weekday:[4], time:[17.5,21], once:true, background:'blur',   /* 第 1 週 2/25：這學期第一次週四進麵店（第 3 週以前）*/
    prereq:{custom:ndl},
    dialogue:[ {speaker:null,text:'（大二下第一次的週四麵店。阿姨說，過年胖了的人自己知道。）'} ] });
  EV.push({ id:'ev_y2s2_thu_noodle_spring', title:'', participants:[], location:'noodle', trigger:'enter', term:['Y2S2'], weeks:[7], weekday:[4], time:[17.5,21], once:true, background:'blur',   /* 第 7 週 4/8：春假回來第一次週四進麵店 */
    prereq:{custom:ndl},
    dialogue:[ {speaker:null,text:'（春假回來的第一個週四。長桌的人，每個人都在講自己這幾天去了哪裡。）'} ] });
  S.fillRules=function(G,GM){ if(!law(G)||!hasP()||!G.flags) return;
    /* 3/12（五）21:00 柏翰私訊（和柏翰 FAMILIAR 以上）*/
    { const m=d('f312'); if(m!=null&&knows('classmate_bohan',G)&&atLeast('classmate_bohan','FAMILIAR')&&win(G,m,21,1)&&!sent(G,'y2s2_bh_table')){ const B=t=>({th:'p:classmate_bohan',from:'classmate_bohan',text:t});
        if(typeof INV!=='undefined'&&INV.rec){ INV.rec(G); if(G.contacts&&G.contacts.classmate_bohan==null) G.contacts.classmate_bohan=G.day; }   /* 他傳訊息給你＝有你的聯絡方式（同「這週的訊息」）*/
        at(G,m,21,[B('債各第一章的筆記，我做了表格。'),Object.assign(B('要的話傳給你。'),{ask:{id:'y2s2_bh_table',until:abs(m+2,21),opts:[{t:'要。',say:[{from:'classmate_bohan',text:'（照片：一張表格，欄位比內容多）'}]},{t:'我自己整理。',say:[{from:'classmate_bohan',text:'好。'}]}]}})],'y2s2_bh_table'); } }
    /* 4/21（三）22:00 麵店團群組 */
    { const m=d('f421'); if(m!=null&&inGroup(G,'noodle_team')&&knows('yu',G)&&win(G,m,22,1)&&!sent(G,'y2s2_grp_mid')){ const N=(f,t)=>({th:'g:noodle_team',from:f,text:t});
        at(G,m,22,[N('yu','期中考完了'),N('yu','我要吃三碗麵'),N('zhe','我請一碗')],'y2s2_grp_mid'); } }
    /* 5/21（五）22:00 阿凱私訊（不影響 6/11 暑住的選擇）*/
    { const m=d('f521'); if(m!=null&&knows('kai',G)&&win(G,m,22,1)&&!sent(G,'y2s2_kai_summer')){ const A=t=>({th:'p:kai',from:'kai',text:t});
        at(G,m,22,[Object.assign(A('暑假你回家還是留宿舍'),{ask:{id:'y2s2_kai_summer',until:abs(m+2,22),opts:[{t:'還沒想。',say:[{from:'kai',text:'我也是。'}]},{t:'回家吧。',say:[{from:'kai',text:'那我一個人吃宵夜'}]}]}})],'y2s2_kai_summer'); } } };
  /* 摘要日的旁白（3/6（六）、5/20（四））：學期中沒有摘要日的停點——那一天（08:00 起）第一次空下來的時候說一句；在臺北的家不說，隔天還沒說到照說（STORY.TICKS）*/
  S.SUM_LINES=[['f306','（大二下的第二週。你終於記住了這學期的課表：週二要跑法律系館B。）'],['f520','（五月。宿舍走廊開始有人在討論暑假要去哪裡。）']];
  let sumBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['y2r2_3d:sumBusy']=()=>{ sumBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.fillTick=function(GM){ const G=GM&&GM.G; if(!G||!G.flags||!law(G)||sumBusy) return false; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return false; const hh=((G.hour%24)+24)%24;
    for(const [k,t] of S.SUM_LINES){ const m=d(k), fk='Y2S2_SUM_'+k; if(m==null||G.flags[fk]!=null) continue; if(G.day<m||G.day>m+1||(G.day===m&&hh<8)) continue;
      G.flags[fk]=G.day; sumBusy=true; Promise.resolve(GM.say(null,t)).catch(e=>console.warn('Y2R2 摘要日',e)).finally(()=>{ sumBusy=false; }); return true; }
    return false; };

  /* ==================== 手機規則（STORY.PHONE_RULES）==================== */
  S.rules=function(G,GM){ if(!law(G)||!hasP()||!G.flags) return; const F=G.flags;
    /* --- 2-Y2-03 K9 --- */
    { const a=d('k9a'), m=d('k9'); if(kx(G)&&a!=null){
        if(win(G,a,21,1)&&!sent(G,'y2r2_k9_ask')) at(G,a,21,[KASK('明天五點半，河堤。不用帶東西，帶耳朵就好。',{id:'y2r2_k9_ask',until:abs(m,17.25),opts:[{t:'好。',set:{KX_K9:'yes'},say:[{from:'kexin',text:'嗯。'}]},{t:'明天不行。',set:{KX_K9:'no'},say:[{from:'kexin',text:'好。那我用打的。'}]}]})],'y2r2_k9_ask');
        if(F.KX_K9==='yes'&&!outGet(G,'y2r2_k9')&&now(G)<abs(m,17.75)) plan(G,{id:'y2r2_k9',ev:'ev_kexin_good_class',day:m,h:17.5,late:0.25,place:'公館河濱',title:'公館河濱（可昕）',travel:'走過去約 15 分鐘',travelH:0.25,back:'回到首都帝大。'});
        const q=outGet(G,'y2r2_k9'), met=done(G,'ev_kexin_good_class');
        if(!met&&win(G,m,21,2)&&sent(G,'y2r2_k9_ask')&&!sent(G,'y2r2_k9_msg')){ const L=[]; if(q&&q.state==='missed') L.push(K('我等了二十分鐘。'));
          L.push(K('我找到一門上課不想滑手機的課。'),K('老師講規則怎麼改變人的行為。罰款高一點，大家就真的慢下來嗎？'),KASK('📷（她的筆記，畫了一條路和一張罰單）',{id:'y2r2_k9_msg',opts:[{t:'會嗎？',say:[{from:'kexin',text:'有些人會。有些人換一條路。'}]},{t:'妳很喜歡這門課。',say:[{from:'kexin',text:'嗯。……講不清楚。'}]}]}));
          at(G,m,21,L,'y2r2_k9_msg'); if(!F.KX_K9||F.KX_K9==='yes') F.KX_K9=F.KX_K9==='yes'?'missed':'none'; merge(G,'KX_DIR',{Y2:'rules'}); } } }
    /* --- 2-Y2-04 中秋：她的那一段 --- */
    { const a=d('ma0'), m=d('ma'); if(kx(G)&&a!=null&&m!=null){ const met=!!F.KX_MET_NOODLE_TEAM, q=outGet(G,'y2_midautumn'), went=done(G,'ev_y2_midautumn');
        if(met&&win(G,a,21.5,1)&&!sent(G,'y2r2_ma_pre')) at(G,a,21.5,[K('今年予樂是活動長，我先去幫她顧火。'),K('烤完我帶玉米過去。')],'y2r2_ma_pre');
        const missedIt=!went&&(q?q.state==='missed':past(G,m,18.25));
        if(win(G,m,21,2)&&(!met||missedIt)&&!(met&&went)&&!sent(G,'y2r2_ma_photo')){ const L=[]; if(met&&missedIt&&sent(G,'y2r2_ma_pre')) L.push(K('你不在，我就沒過去了。'));
          L.push(K('📷（木柵大學的烤肉，炭火旁邊一排玉米）'),K('予樂今年是活動長。我被派去顧火。'),K('……玉米還是我們的好。')); at(G,m,21,L,'y2r2_ma_photo'); } } }
    /* --- 2-Y2-05 K10 互相出題 --- */
    { const a=d('q0'), r=d('qr'), m=d('q'), f=d('qf'); if(kx(G)&&a!=null){
        if(win(G,a,21,3)&&!sent(G,'y2r2_q_ask')) at(G,a,21,[K('這學期起，期中、期末前都互相出題。'),K(K6(G)?'規則照舊，只能出老師上課講過的。':'只能出老師上課講過的。冷門學說算犯規。'),
          KASK('第一次：期中前那個週五，晚上六點半，山下那一攤。不能來就視訊，題目照出。',{id:'y2r2_q_ask',until:abs(m,17.5),opts:[{t:'好。',set:{KX_QUIZ_MODE_Y2:'meet'},say:[{from:'kexin',text:'好。題目不要先給我看。'}]},{t:'視訊可以嗎？',set:{KX_QUIZ_MODE_Y2:'video'},say:[{from:'kexin',text:'可以。你自己準備晚餐。'}]}]})],'y2r2_q_ask');
        /* 不回的提醒：10/21（三）21:00（AA_343 E4；原本 10/23 21:00「週日中午。」）*/
        if(!F.KX_QUIZ_MODE_Y2&&win(G,r,21,1)&&sent(G,'y2r2_q_ask')&&!sent(G,'y2r2_q_remind')) at(G,r,21,[K('週五晚上。你還沒回。')],'y2r2_q_remind');
        if(F.KX_QUIZ_MODE_Y2==='meet'&&!outGet(G,'y2r2_q')&&now(G)<abs(m,18.75)) plan(G,{id:'y2r2_q',ev:'ev_kexin_quiz_y2',day:m,h:18.5,late:0.25,place:'木柵大學・山下的小吃街',title:'互相出題（木柵大學山下）',travel:'開車約 40 分鐘',travelH:2/3});
        if(F.KX_QUIZ_MODE_Y2==='video'&&!outGet(G,'y2r2_q')&&now(G)<abs(m,18.75)) plan(G,{id:'y2r2_q',ev:'ev_kexin_quiz_y2_video',day:m,h:18.5,late:0.25,place:'視訊',title:'可昕的視訊：互相出題',verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊結束。'});
        const q=outGet(G,'y2r2_q'), quizDone=done(G,'ev_kexin_quiz_y2')||done(G,'ev_kexin_quiz_y2_video');
        /* 沒去：10/23 19:30（AA_325 2-Y2-05 已照 AA_343 E4 改）*/
        if(!quizDone&&win(G,m,19.5,2)&&sent(G,'y2r2_q_ask')&&(!q||q.state==='missed')&&!sent(G,'y2r2_q_missed')){ F.KX_QUIZ_Y2S1='missed'; at(G,m,19.5,[K('📷（一張題目紙，三題）'),K('這三題留到期末。')],'y2r2_q_missed'); }
        if(f!=null&&win(G,f,21,2)&&!sent(G,'y2r2_q_final')) at(G,f,21,[K('期末的題目。'),K('📷（她手寫的三題）'),KASK('寫完拍照傳我。我的也傳給你了。',{id:'y2r2_q_final',opts:[{t:'好。我寫完傳妳。',say:[{from:'kexin',text:'嗯。不用急。'}]}]})],'y2r2_q_final'); } }
    /* --- AA_343 E2：CG-2b 的群組。以安新 8 的後半（大二上第 7 週週六 14:00 萬才館研討室的補讀，ev_plg_rules_after，story3d.js）那天沒去、在公法讀書會群組的玩家：
       Alison 傳照片（CG-2b cg_study_group_rules_photo，群組照片版、沒有祐廷；AA_121「那天沒去讀書會、但在群組裡的玩家」）＋三則（AA_343 第 6 節，Alison 不打句號、以安標點完整）。
       14:30＝出發的期限（14:15）過了以後：去的人 14:25 以前就到、事件已經演了，不會兩張都看到。幾點傳 AA 沒寫（暫定，交接要問 AA）。
       照片：手機訊息帶 cg（phone3d.js 送出時收進相簿、game3d.js 在訊息下面顯示那張圖）*/
    { const m=typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay('Y2S1',7,6):null;
      if(m!=null&&inGroup(G,'public_law')&&knows('yu',G)&&!done(G,'ev_plg_rules_after')&&win(G,m,14.5,1)&&!sent(G,'y2r2_plg_photo')){ const Y=(f,t)=>({th:'g:public_law',from:f,text:t});
        at(G,m,14.5,[Object.assign(Y('yu','📷'),{cg:'cg_study_group_rules_photo'}),Y('yu','規則剩三條 另外一半是我撕的'),Y('heroine_01','Alison，刪掉。'),Y('yu','不要 這是歷史')],'y2r2_plg_photo'); } }
    /* --- 2-Y2-06 K10b 電影夜 --- */
    { const a=d('f0'), r=d('fr'), m=d('f'); if(kx(G)&&a!=null){
        if(win(G,a,21,3)&&!sent(G,'y2r2_f_ask')) at(G,a,21,[K('下週五系上電影夜。予樂說每個人要帶一個外系的朋友。'),KASK('你是我的外系。',{id:'y2r2_f_ask',until:abs(m,18.25),opts:[{t:'好。幾點？',set:{KX_FILM:'yes'},say:[{from:'kexin',text:'七點。不要遲到，予樂會點名。'}]},{t:'那天不行。',set:{KX_FILM:'no'},say:[{from:'kexin',text:'……好。我跟予樂說你在忙。'}]}]})],'y2r2_f_ask');
        if(!F.KX_FILM&&win(G,r,21,1)&&sent(G,'y2r2_f_ask')&&!sent(G,'y2r2_f_remind')) at(G,r,21,[K('週五。你還沒回。')],'y2r2_f_remind');
        if(F.KX_FILM==='yes'&&!outGet(G,'y2r2_film')&&now(G)<abs(m,19.25)) plan(G,{id:'y2r2_film',ev:'ev_kexin_film_night',day:m,h:19,late:0.25,place:'木柵大學',title:'系上的電影夜（木柵大學）',travel:'開車約 40 分鐘',travelH:2/3});
        if(!done(G,'ev_kexin_film_night')&&win(G,m,21.5,2)&&sent(G,'y2r2_f_ask')&&!sent(G,'y2r2_f_photo')){ if(F.KX_FILM_NIGHT!=='went') F.KX_FILM_NIGHT='missed'; at(G,m,21.5,[K('📷（電影夜的教室，一排椅子，她旁邊那張空著）'),K('下次。')],'y2r2_f_photo'); } } }
    /* --- 2-Y2-07 聖誕 --- */
    { const a=d('x0'), r=d('xr'), g=d('xg'), m=d('x'); if(kx(G)&&a!=null){
        if(win(G,a,21,3)&&!sent(G,'y2r2_x_ask')) at(G,a,21,[K('聖誕晚上，我排了行程。第一頁是吃的，第二頁才是地點。'),KASK('六點半，公館。我下山。',{id:'y2r2_x_ask',until:abs(m,18),opts:[{t:'好。',set:{KX_XMAS_Y2:'yes'},say:[{from:'kexin',text:'嗯。禮物先準備好，不要當天才買。'}]},{t:'那天不行。',set:{KX_XMAS_Y2:'no'},say:[{from:'kexin',text:'……好。行程表我先留著。'}]}]})],'y2r2_x_ask');
        if(!F.KX_XMAS_Y2&&win(G,r,21,1)&&sent(G,'y2r2_x_ask')&&!sent(G,'y2r2_x_remind')) at(G,r,21,[K('二十五號。六點半。')],'y2r2_x_remind');
        if(F.KX_XMAS_Y2==='yes'&&!outGet(G,'y2r2_xmas')&&now(G)<abs(m,18.75)) plan(G,{id:'y2r2_xmas',ev:'ev_kexin_xmas_y2',day:m,h:18.5,late:0.25,place:'公館',title:'聖誕晚上（可昕排的行程）',travel:'走過去約 10 分鐘',travelH:1/6});
        if(F.KX_XMAS_Y2==='yes'&&g!=null&&G.day>=g&&G.day<=m&&!F.KX_XMAS_GIFT_Y2&&!sent(G,'y2r2_x_gift')) at(G,g,Math.max(9,G.day===g?G.hour:9),[{th:'sys',text:'準備可昕的聖誕禮物',ask:{id:'y2r2_x_gift',until:abs(m,18.5),opts:[{t:'一條圍巾',post:false,set:{KX_XMAS_GIFT_Y2:'scarf'}},{t:'她說想看的那本書',post:false,set:{KX_XMAS_GIFT_Y2:'book'}},{t:'一副手套',post:false,set:{KX_XMAS_GIFT_Y2:'gloves'}}]}}],'y2r2_x_gift');
        if(!done(G,'ev_kexin_xmas_y2')&&win(G,m,21,2)&&sent(G,'y2r2_x_ask')&&!sent(G,'y2r2_x_photo')){ merge(G,'KX_XMAS',{2:'missed'}); at(G,m,21,[K('📷（行程表的第一頁）'),K('第二頁，明年。')],'y2r2_x_photo'); } } }
    /* --- 2-Y2-09 期末成績的打賭 --- */
    S.betRules(G,GM);
    /* --- 2-Y2-10 寒假去高雄 --- */
    { const a=d('kh0'), r=d('khr'), m=d('kh'); if(kx(G)&&a!=null){ const fare=(HL()&&HL().fare)||2980;
        if(win(G,a,21,3)&&!sent(G,'y2r2_kh_ask')){ const L=[K('寒假的行程表做好了。這次在高雄。'),K('一月十四號。第一頁是夜市，你還沒去過的那個。')];
          const ask={id:'y2r2_kh_ask',until:abs(m,10),opts:[{t:'可以。',need:{money:fare,why:'高鐵票錢不夠'},set:{KX_KH_Y2:'yes'},say:[{from:'kexin',text:'好。幾點的車，我去接你。'}]},{t:'那天不行。',set:{KX_KH_Y2:'no',KX_TRIP_DEFERRED:'spring'},say:[{from:'kexin',text:'好。那春假。……行程表我會再多做一頁。'}]}]};
          if(!(F.KX_TRIP&&F.KX_TRIP.Y1S2)){ L.push(K('你可以下來嗎？')); L.push(KASK('一天也算。',ask)); } else L.push(KASK('你可以下來嗎？',ask));
          at(G,a,21,L,'y2r2_kh_ask'); }
        if(!F.KX_KH_Y2&&win(G,r,21,1)&&sent(G,'y2r2_kh_ask')&&!sent(G,'y2r2_kh_remind')) at(G,r,21,[K('十四號。你還沒回。')],'y2r2_kh_remind');
        if(F.KX_KH_Y2==='yes'&&!outGet(G,'y2r2_kh')&&now(G)<abs(m,14.75)) plan(G,{id:'y2r2_kh',ev:'ev_kexin_trip_winter_y2',day:m,h:14,late:1,place:'高雄',title:'去高雄找可昕（她排的那一天）',travel:'高鐵約一個半小時',travelH:1.5,back:'回到臺北。'}); } }
    /* --- 2-Y2-11 除夕 --- */
    { const m=d('kn'); if(kx(G)&&m!=null){
        if(win(G,m,22,1)&&!sent(G,'y2r2_kn')) at(G,m,22,[K('新年快樂。'),K('我們家在玩撲克牌。我表弟輸到哭。'),KASK('你們家在幹嘛？',{id:'y2r2_kn',until:abs(m+1,9.75),opts:[{t:'在看電視。沒人在看。',set:{KX_KN_Y2:'tv'},say:[{from:'kexin',text:'我們家的電視也開著。……過年的電視都是這樣。'}]},{t:'我爸從上海帶了一箱點心。',set:{KX_KN_Y2:'dad'},say:[{from:'kexin',text:'你爸回來了？那你今天不要一直滑手機。'}]},{t:'打給妳。',post:false,set:{KX_KN_Y2:'call'}}]})],'y2r2_kn');
        if(F.KX_KN_Y2==='call'&&!outGet(G,'y2r2_kn_call')) plan(G,{id:'y2r2_kn_call',ev:'ev_kexin_lunar_eve_y2_call',day:G.day,h:G.hour,late:1,place:'電話',title:'打給可昕（除夕）',verb:'打給她',must:true,call:true,travel:'',travelH:0,back:'電話結束。'});
        if(!F.KX_KN_Y2&&win(G,m+1,10,2)&&sent(G,'y2r2_kn')&&!sent(G,'y2r2_kn_none')){ F.KX_KN_Y2='none'; at(G,m+1,10,[K('初一了。'),K('……你昨天一定被抓去打牌了。')],'y2r2_kn_none'); } } }
    /* --- 2-Y2-12 情人節 --- */
    { const m=d('vd'); if(kx(G)&&m!=null&&G.day>=m-7&&G.day<=m&&!outGet(G,'y2r2_vday')) plan(G,{id:'y2r2_vday',ev:'ev_kexin_valentine_y2',day:m,h:20,late:0.5,place:'視訊',title:'可昕的視訊：情人節',verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊結束。'}); }
    /* --- 2-Y2-13 阿哲押金的結果：那天之後第 7 天 22:00 --- */
    { const Z=F.ZHE_DEPOSIT; if(Z&&Z.day!=null&&win(G,Z.day+7,22,3)&&!sent(G,'y2r2_dep_result')) at(G,Z.day+7,22,[{th:'p:zhe',from:'zhe',text:'學長的押金拿回來了'},{th:'p:zhe',from:'zhe',text:'扣了一個洞的油漆錢'},{th:'p:zhe',from:'zhe',text:'他說要請你一杯飲料 我先幫你喝了'}],'y2r2_dep_result'); }
    /* --- 2-Y2-15 生日 --- */
    S.bdayRules(G,GM);
    /* --- 2-Y2-16 回程的公車 --- */
    { const a=d('u0'), m=d('u'); if(kx(G)&&a!=null&&!!F.KX_CIRCLES_MET&&inGroup(G,'noodle_branch')){ const N=(from,text,name)=>Object.assign({th:'g:noodle_branch',from,text},name?{name}:{});
        if(win(G,a,21,3)&&!sent(G,'y2r2_u_ask')){ const L=[]; const ask={id:'y2r2_u_ask',until:abs(m,12.5),opts:[{t:'去。',set:{KX_U:'yes'}},{t:'那天不行。',set:{KX_U:'no'}}]};
          L.push(N('yule','下週六下午一點，老街。搭公車去。司機這次放假。','予樂')); if(inBranch(G,'zhe')) L.push(N('zhe','+1')); if(inBranch(G,'yu')) L.push(N('yu','我也要！！')); if(inBranch(G,'classmate_bohan')) L.push(N('classmate_bohan','那天我在總圖。'));
          L[L.length-1]=Object.assign(L[L.length-1],{ask}); at(G,a,21,L,'y2r2_u_ask'); }
        if(F.KX_U==='yes'&&!outGet(G,'y2r2_u')&&now(G)<abs(m,13.25)) plan(G,{id:'y2r2_u',ev:'ev_kexin_bus_home',day:m,h:13,late:0.25,place:'老街',title:'老街（麵店分店）',travel:'搭公車約 50 分鐘',travelH:5/6});
        if(G.day===m&&G.hour>=13&&inGroup(G,'noodle_branch')&&!F.Y2R2_U_RENAMED){ F.Y2R2_U_RENAMED=1; const g=PHONE.rec(G).groups.noodle_branch; if(g){ F.Y2R2_U_OLDNAME=g.name; g.name='老街限定'; } }   /* 群組名稱當天改成「老街限定」，隔天改回「麵店分店」*/
        if(G.day>m&&F.Y2R2_U_RENAMED===1){ F.Y2R2_U_RENAMED=2; const g=PHONE.rec(G).groups.noodle_branch; if(g) g.name=F.Y2R2_U_OLDNAME||'麵店分店'; }
        if(F.KX_BUS_HOME==='kissed'&&win(G,m,23,2)&&!sent(G,'y2r2_u_kiss')) at(G,m,23,[Object.assign(K('你剛剛在公車上睡著了。靠在我肩上。'),{pin:true}),Object.assign(K('我親了你一下。你沒醒。'),{pin:true}),Object.assign(K('先跟你說一聲。'),{pin:true,ask:{id:'y2r2_u_kiss',opts:[{t:'我醒著。',say:[{from:'kexin',text:'騙人。你在打呼。'}]},{t:'那我要補一個。',say:[{from:'kexin',text:'……下次你醒著的時候。'}]},{t:'（傳一個長頸鹿貼圖）',post:'（貼圖：長頸鹿）',say:[{from:'kexin',text:'（她回一隻長頸鹿）'},{from:'kexin',text:'你就是這隻。睡著的那隻。'}]}]}})],'y2r2_u_kiss');
        const q=outGet(G,'y2r2_u'); if(F.KX_BUS_HOME!=='kissed'&&win(G,m,21.5,2)&&sent(G,'y2r2_u_ask')&&!done(G,'ev_kexin_bus_home')&&!sent(G,'y2r2_u_photo')){ if(!F.KX_BUS_HOME) F.KX_BUS_HOME='no'; at(G,m,21.5,[N('yule','📷（老街的階梯，一排人的背影）','予樂'),N('zhe','📷（一桌試吃的小碟子）')],'y2r2_u_photo'); }
        if(F.KX_BUS_HOME==='left'&&win(G,m,21.5,2)&&!sent(G,'y2r2_u_photo')) at(G,m,21.5,[N('yule','📷（老街的階梯，一排人的背影）','予樂'),N('zhe','📷（一桌試吃的小碟子）')],'y2r2_u_photo'); } }
    /* --- 2-Y2-17 芷若：交往中 5/11 22:40 --- */
    { const m=d('zrc'); if(m!=null&&law(G)&&dating(G,'heroine_02')){ const Z=t=>({th:'p:heroine_02',from:'heroine_02',text:t});
        if(win(G,m,22+40/60,1)&&!sent(G,'y2r2_zr_admit')) at(G,m,22+40/60,[Z('信來了。'),Z('……錄取了。'),Object.assign(Z('我現在不想打字。你可以打給我嗎。'),{ask:{id:'y2r2_zr_admit',until:abs(m,23.5),opts:[{t:'（打給她）',post:false,set:{ZR_ADMIT_CALL_GO:true}}]}})],'y2r2_zr_admit');
        if(F.ZR_ADMIT_CALL_GO&&!outGet(G,'y2r2_zr_call')) plan(G,{id:'y2r2_zr_call',ev:'ev_zhiruo_admit_call',day:G.day,h:G.hour,late:1,place:'電話',title:'打給芷若',verb:'打給她',must:true,call:true,travel:'',travelH:0,back:'電話結束。'});
        if(!F.ZR_ADMIT_CALL_GO&&!F.ZR_ADMIT_CALL&&win(G,m,23.5,2)&&sent(G,'y2r2_zr_admit')&&!sent(G,'y2r2_zr_none')){ F.ZR_ADMIT_CALL='none'; at(G,m,23.5,[Z('……沒事。明天再說。')],'y2r2_zr_none'); } } }
    /* --- 2-Y2-18 明軒：阿哲那則（和明軒不熟、和阿哲朋友以上）；三對三 --- */
    { const m=d('zm'); if(m!=null&&law(G)&&win(G,m,22,2)&&!sent(G,'y2r2_mx_zhe')&&!(dating(G,'heroine_01')&&knowsOf(G,'classmate_mingxuan','heroine_01'))&&!mxFriend(G)&&['FRIEND','CLOSE_FRIEND'].includes(typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel('zhe'):'')){
        F.MX_HEARD=true; at(G,m,22,[{th:'p:zhe',from:'zhe',text:'明軒最近怪怪的 你不要問，問了他會請你吃東西'}],'y2r2_mx_zhe'); }
      const e=d('m3'); if(e!=null&&F.MX_3ON3_ASKED){
        if(win(G,e-1,21,1)&&!sent(G,'y2r2_3on3_ask')) at(G,e-1,21,[{th:'p:zhe',from:'zhe',text:'明天九點 三對三 起得來嗎',ask:{id:'y2r2_3on3_ask',until:abs(e,8.5),opts:[{t:'起得來。',say:[{from:'zhe',text:'最好是'}]},{t:'不一定。',say:[{from:'zhe',text:'那我八點半打給你'}]}]}}],'y2r2_3on3_ask');
        if(sent(G,'y2r2_3on3_ask')&&!outGet(G,'y2r2_3on3')&&now(G)<abs(e,9.25)) plan(G,{id:'y2r2_3on3',ev:'ev_mx_3on3',day:e,h:9,late:0.25,place:'新體育館 1F 球場',title:'三對三（新體育館）',travel:'走過去約 10 分鐘',travelH:1/6,alarm:true}); } }
    /* --- 2-Y2-19 子晴 Q9 --- */
    { const a=d('show0'), m=d('show'); if(a!=null&&law(G)&&mem('heroine_04','INVITED_CLUB')&&knows('heroine_04',G)){ const Q=t=>({th:'p:heroine_04',from:'heroine_04',text:t});
        if(win(G,a,21,3)&&!sent(G,'y2r2_q9_inv')) at(G,a,21,[Q('我自己寫的歌要在成發彈'),Q('四句歌詞'),Object.assign(Q('……你要來'),{ask:{id:'y2r2_q9_inv',until:abs(m,19),opts:[{t:'好。',say:[{from:'heroine_04',text:'嗯'},{from:'heroine_04',text:'禮拜五七點 B館'}]},{t:'那天不行。',say:[{from:'heroine_04',text:'好喔'}]}]}})],'y2r2_q9_inv');
        if(win(G,m,21.5,2)&&!done(G,'ev_ziqing_show2')&&!(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attended&&ACTIVITIES.attended(G,'guitar_show_y2s2',m))&&!sent(G,'y2r2_q9_photo')){ F.ZQ_SHOW2='absent'; const th=inGroup(G,'guitar')?'g:guitar':'p:heroine_04', Z=t=>({th,from:'heroine_04',text:t});
          at(G,m,21.5,q5Went(G)?[Z('📷（謝幕，台上六個人鞠躬）'),Z('今年沒有人拍太大聲'),Z('……拍給你看')]:[Z('📷（謝幕）'),Z('第二次也沒來'),Z('……好啦 第三次再說')],'y2r2_q9_photo'); } } }
    /* --- 2-Y2-20 系籃（大二下）--- */
    { const a=d('show'), m=d('ball'); if(a!=null&&m!=null&&law(G)&&knows('zhe',G)){ const th=inGroup(G,'noodle_team')?'g:noodle_team':'p:zhe', Z=t=>({th,from:'zhe',text:t});
        if(win(G,a,21,1)&&!sent(G,'y2r2_ball_inv')){ at(G,a,21,[Z('明天下午兩點，系籃，新體育館 這學期最後一場')],'y2r2_ball_inv'); }
        if(sent(G,'y2r2_ball_inv')&&!outGet(G,'y2r2_ball')&&now(G)<abs(m,14.25)) plan(G,{id:'y2r2_ball',ev:'ev_zhe_game_y2s2',day:m,h:14,late:0.25,place:'新體育館',title:'系籃比賽（大二下）',travel:'走過去約 10 分鐘',travelH:1/6});
        const q=outGet(G,'y2r2_ball'); if(q&&q.state==='missed'&&!done(G,'ev_zhe_game_y2s2')&&win(G,m,21.5,2)&&!sent(G,'y2r2_ball_photo')) at(G,m,21.5,[Z('📷（記分板前面，阿哲和明軒蹲著比 YA。分數被阿哲的頭擋住了。）'),Z('贏了 分數不重要')],'y2r2_ball_photo'); } }
    /* --- 2-Y2-21 K14 --- */
    { const a=d('k14a'), m=d('k14'); if(kx(G)&&a!=null){
        if(win(G,a,21,1)&&!sent(G,'y2r2_k14_ask')) at(G,a,21,[KASK('明天傍晚，你來木柵大學。暑假的事，我想先跟你說。',{id:'y2r2_k14_ask',until:abs(m,16.5),opts:[{t:'好。',set:{KX_K14:'yes'},say:[{from:'kexin',text:'五點半，校門口。'}]},{t:'明天不行。',set:{KX_K14:'no'},say:[{from:'kexin',text:'……好。那我明天打給你。'}]}]})],'y2r2_k14_ask');
        if(F.KX_K14==='yes'&&!outGet(G,'y2r2_k14')&&now(G)<abs(m,17.75)) plan(G,{id:'y2r2_k14',ev:'ev_kexin_summer_plan',day:m,h:17.5,late:0.25,place:'木柵大學',title:'木柵大學（可昕：暑假的事）',travel:'開車約 40 分鐘',travelH:2/3});
        if(sent(G,'y2r2_k14_ask')&&!done(G,'ev_kexin_summer_plan')&&!outGet(G,'y2r2_k14_call')&&past(G,m,21)&&G.day<=m+1){ const q=outGet(G,'y2r2_k14'); if(!q||q.state==='missed'){ if(q&&q.state==='missed') F.Y2R2_K14_NOSHOW=true;
          plan(G,{id:'y2r2_k14_call',ev:'ev_kexin_summer_plan_call',day:m,h:21,late:3,place:'電話',title:'可昕打來',verb:'接起來',must:true,call:true,travel:'',travelH:0,back:'電話結束。'}); } } } }
    /* --- 2-Y2-23 經濟系之夜 --- */
    { const a=d('ps0'), m=d('en'); if(a!=null&&m!=null&&law(G)&&F.MET_PINYU){ const PY=t=>({th:'p:econ_pinyu',from:'econ_pinyu',text:t});
        if(win(G,a,21,3)&&!sent(G,'y2r2_en_ask')) at(G,a,21,[PY(kx(G)?'經濟系之夜。你們兩個都可以來。你們又不是叛徒。':'經濟系之夜。你可以來。你又不是叛徒。'),Object.assign(PY('禮拜五七點，社科院一樓。'),{ask:{id:'y2r2_en_ask',until:abs(m,18.75),opts:[{t:'好。',set:{ECON_NIGHT_Y2:'yes'},say:[{from:'econ_pinyu',text:'好。椅子算你一張。'}]},{t:'那天不行。',set:{ECON_NIGHT_Y2:'no'},say:[{from:'econ_pinyu',text:'好。少搬一張。'}]}]}})],'y2r2_en_ask');
        if(F.ECON_NIGHT_Y2==='yes'&&!outGet(G,'y2r2_en')&&now(G)<abs(m,19.25)) plan(G,{id:'y2r2_en',ev:'ev_econ_night_y2',day:m,h:19,late:0.25,place:'社科院一樓',title:'經濟系之夜（社科院）',travel:'走過去約 10 分鐘',travelH:1/6});
        if(sent(G,'y2r2_en_ask')&&!done(G,'ev_econ_night_y2')&&win(G,m,21.5,2)&&!sent(G,'y2r2_en_photo')){ const th=inGroup(G,'econ_friends')?'g:econ_friends':(inGroup(G,'econ_class')?'g:econ_class':null);
          if(th) at(G,m,21.5,[{th,from:'econ_tangrui',name:'唐睿',text:'📷（前系友席，一排椅子，中間空著一張，上面貼了一張紙，寫著「法律系」）'}],'y2r2_en_photo'); else (PHONE.rec(G).cut||(PHONE.rec(G).cut=[])).push('y2r2_en_photo');
          remember('econ_pinyu','HEARD_ECON_NIGHT','經濟系之夜：他沒去，聽說的');
          if(kx(G)){ F.KX_ECON_NIGHT='alone'; at(G,m+1,12,[K(F.MET_XUN?'經濟系之夜，阿勳問你怎麼沒來。':'經濟系之夜，你以前的室友問你怎麼沒來。')],'y2r2_en_kx'); } } } }
    /* --- 2-Y2-24 以安新 13：6/4 21:00 群組 --- */
    { const m=d('en'); if(m!=null&&law(G)&&knows('heroine_01',G)&&win(G,m,21,2)&&!sent(G,'y2r2_an13')){ const g=inGroup(G,'public_law')?'public_law':(inGroup(G,'noodle_team')?'noodle_team':null);
        if(g){ const A=t=>({th:'g:'+g,from:'heroine_01',text:t}), L=[];
          if(F.AN_TUTOR_FAMILY!==1) L.push(A('之前在幫家教學生的家裡看一份駁回的公文。'));
          L.push(A('那個家的訴願，原本的決定被撤銷了，要重新審。'),A('不是全贏。可是有人要重新看他們的資料了。'),A('📷（一張手寫的卡片，字看不清楚，只看得到最後一行：老師，謝謝妳畫的那張圖。）'));   /* 法律：撤銷原處分、由原機關另為處分這一類（不誇大）；AA 已核方向（AA_338 第 9 題）*/
          if(g==='public_law'&&knows('yu',G)) L.push({th:'g:public_law',from:'yu',text:'！！'},{th:'g:public_law',from:'yu',text:'恭喜那個家！！'});
          if(g==='noodle_team'&&knows('zhe',G)) L.push({th:'g:noodle_team',from:'zhe',text:'讚'});
          at(G,m,21,L,'y2r2_an13'); F.AN_TUTOR_FAMILY=2;
          if(dating(G,'heroine_01')) at(G,m,21.1,[{th:'p:heroine_01',from:'heroine_01',text:'卡片上的字，是那個學生自己寫的。'}],'y2r2_an13_dm'); } } }
  };
  /* ---------- 2-Y2-09 期末成績的打賭（大二上、大二下）---------- */
  S.betRules=function(G,GM){ const F=G.flags; if(!kx(G)) return;
    const e1=lastExam(G,'Y2S1','2026-12-24'), g1=d('g1');
    if(e1!=null&&win(G,e1,21,3)&&!sent(G,'y2r2_bet1')) at(G,e1,21,[K('今年換一種。打賭。'),KASK('成績出來，誰先問對方考得怎樣，誰請宵夜。',{id:'y2r2_bet1',opts:[{t:'好。',say:[{from:'kexin',text:'嗯。說好了。'}]},{t:'這個賭局對我不利。',say:[{from:'kexin',text:'所以才叫打賭。'}]}]})],'y2r2_bet1');
    S.betDay(G,'Y2S1',g1,23+50/60,'y2r2_bet1',[K('……我輸了。我撐到現在。你呢？')]);
    const e2=lastExam(G,'Y2S2','2027-06-11'), g2=d('g2');
    if(e2!=null&&win(G,e2,21,3)&&!sent(G,'y2r2_bet2')){ const L=[]; const r1=F.KX_GRADES_Y2S1; if(r1==='waited') L.push(K('上次我輸了。這次我練過了。')); else if(r1==='asked') L.push(K('上次你請。這次你也會請。'));
      L.unshift(K('再賭一次。')); L[L.length-1]=Object.assign(L[L.length-1],{ask:{id:'y2r2_bet2',opts:[{t:'好。',say:[{from:'kexin',text:'嗯。'}]}]}}); at(G,e2,21,L,'y2r2_bet2'); }
    S.betDay(G,'Y2S2',g2,24+10/60,'y2r2_bet2',[K('……我撐過午夜了。可是還是我先問。我輸了。')]); };
  /* 成績那天 10:00 系統字＋兩選一；「問。」＝馬上傳、她回「你輸了。」；「等她先問。」（或沒選）＝她 23:50（大二下 00:10）先問 */
  S.betDay=function(G,term,gd,waitH,askTag,waitMsgs){ const F=G.flags, fk='KX_GRADES_'+term, tg='y2r2_bet_'+term; if(gd==null||!sent(G,askTag)) return;
    if(win(G,gd,10,2)&&!sent(G,tg)) at(G,gd,10,[{th:'sys',text:'成績出來了。要先傳訊息問她嗎？',ask:{id:tg,until:abs(gd,waitH-0.05),opts:[{t:'問。',post:false,set:{[fk+'_PICK']:'asked'}},{t:'等她先問。',post:false,set:{[fk+'_PICK']:'waited'}}]}}],tg);
    if(F[fk+'_PICK']==='asked'&&!F[fk]){ F[fk]='asked'; at(G,G.day,G.hour,[{th:'p:kexin',from:'player',who:null,text:'成績出來了。妳考得怎樣？'},K('你輸了。'),KASK('……都過了吧？那你請得很開心。',{id:tg+'_a',opts:[{t:'都過了。',say:[{from:'kexin',text:'很好。'}]}]})],tg+'_asked'); }
    if(!F[fk]&&sent(G,tg)&&past(G,gd,waitH)&&G.day<=gd+3){ F[fk]='waited'; at(G,gd,waitH,waitMsgs.slice(0,-1).concat([Object.assign({},waitMsgs[waitMsgs.length-1],{ask:{id:tg+'_w',opts:[{t:'都過了。',say:[{from:'kexin',text:'我也是。宵夜我請。'}]},{t:'妳先說。',say:[{from:'kexin',text:'都過了。……宵夜我請。'}]}]}})]),tg+'_waited'); } };
  /* 打賭的宵夜：下一次見到可昕的那一趟出遊，結尾、分開以前旁白一句（OUT.AFTER；AA_338 第 3 題：每一種出遊都一樣——出遊的事件、校外約會、去高雄找她）；
     1/14 去高雄的玩家在夜市那天付（S.khTrip）；電話、視訊不算見面；結尾她不在場的（ev.kxAway）留到下一次 */
  S.betPending=function(G){ const F=G.flags||{}; for(const t of ['Y2S1','Y2S2']){ const v=F['KX_GRADES_'+t]; if((v==='asked'||v==='waited')&&!F['KX_BET_'+t+'_PAID']) return t; } return null; };
  S.afterOuting=async function(GM,q,ev){ const G=GM.G, F=G.flags; if(!q||q.id==='y2r2_kh'||q.call||q.verb==='接起來'||q.place==='視訊'||(ev&&ev.kxAway)) return; const withKx=(ev&&(ev.participants||[]).includes('kexin'))||(q.hv&&q.hv.id==='kexin')||(!!q.dateTrip&&typeof DATE!=='undefined'&&!!DATE.trip&&(DATE.trip(G,q.dateTrip)||{}).who==='kexin');   /* 出遊的事件、去高雄找她（hometown3d）、校外約會（date3d）*/ if(!withKx||!kx(G)) return;
    const t=S.betPending(G); if(!t) return; const gd=d(t==='Y2S1'?'g1':'g2'); if(gd==null||G.day<gd) return; F['KX_BET_'+t+'_PAID']=true; await GM.say(null,F['KX_GRADES_'+t]==='asked'?'（這次是你請。）':'（這次是她請。）'); };
  /* ---------- 2-Y2-15 生日：予樂 4/17 21:00；4/24 ---------- */
  /* MSG-2 生日按鈕（msg2_pool.js 可昕 bday 的回問「你晚上要上山來，還是我下山」）：大二 4/24、沒回予樂（KX_BD2_PICK 沒有）、還沒見到她——
     「妳來公館」她回「好 九點」（這一年七點予樂她們先在系上幫她過）、記 KX_BD2_GG（AA_338 第 2 節）。MSG.askOpts 包一層呼叫（檔尾）*/
  S.bdAskFix=function(G,id,e,opts){ if(id!=='kexin'||!e||e.topic!=='bday'||!G||!G.flags||!kx(G)) return; const m=d('b'); if(m==null||G.day!==m||G.flags.KX_BD2_PICK||done(G,'ev_kexin_birthday_y2')) return;
    const o=(opts||[]).find(x=>x&&x.t==='妳來公館'); if(!o) return; o.say=[{from:'kexin',text:'好 九點'}]; o.set=Object.assign({},o.set||{},{KX_BD2_GG:true}); };
  /* 回過予樂的玩家（KX_BD2_PICK 四選一）4/24 又傳生日快樂（AA_343 A2）：那天已經有安排，不問「你晚上要上山來，還是我下山」，整個回覆換成一句——
     教室、山下、兩個人版 19:00 以前傳「謝謝。……晚上見。」；電話版 22:00 以前傳「謝謝。……晚上等你電話。」；那一場已經演過（或已經錯過）之後才傳「謝謝。」。
     2-Y2-15 那一天蓋過 MSG-2 的回覆（msg2_pool 不動）；MSG.pick2 包一層呼叫（檔尾）*/
  S.bdReply=function(G,id,topic,e){ if(id!=='kexin'||topic!=='bday'||!e||!G||!G.flags||!kx(G)) return null; const F=G.flags, m=d('b'), pk=F.KX_BD2_PICK; if(m==null||G.day!==m||!pk) return null;
    const q=outGet(G,'y2r2_bd'), over=done(G,'ev_kexin_birthday_y2')||done(G,'ev_kexin_birthday_y2_call')||(!!q&&q.state!=='planned');
    const t=over?'謝謝。':(pk==='message'?(G.hour<22?'謝謝。……晚上等你電話。':'謝謝。'):(G.hour<19?'謝謝。……晚上見。':'謝謝。'));
    return Object.assign({},e,{msgs:[t],ask:null,addIf:null}); };
  S.bdayRules=function(G,GM){ const F=G.flags, a=d('b0'), m=d('b'); if(!kx(G)||a==null||m==null) return; const YLM=t=>({th:'p:yule',from:'yule',name:'予樂',text:t});
    const metYL=!!F.YL_IMPRESSION||done(G,'ev_kexin_two_circles');
    if(win(G,a,21,3)&&!sent(G,'y2r2_bd_ask')) at(G,a,21,[Object.assign(YLM(metYL?'司機，可昕生日。我有一個計畫，缺一個司機。':'你就是那個開車的？我是予樂。可昕生日，我們合作。'),{ask:{id:'y2r2_bd_ask',until:abs(m,18),opts:[
      {t:'我載蛋糕。',set:{KX_BD2_PICK:'class'},say:[{from:'yule',name:'予樂',text:'好。蛋糕歸你，教室歸我。'}]},
      {t:'我有一個想法：山下那家。',set:{KX_BD2_PICK:'shop'},say:[{from:'yule',name:'予樂',text:'……你比我想的懂她。好，改在山下。'}]},
      {t:'我想跟她兩個人過。',set:{KX_BD2_PICK:'two'},say:[{from:'yule',name:'予樂',text:'好。那我們白天先過一次，晚上還你。'}]},
      {t:'那天我只能打電話。',set:{KX_BD2_PICK:'message'},say:[{from:'yule',name:'予樂',text:'好。電話歸你，蛋糕歸我們。'}]}]}})],'y2r2_bd_ask');
    const pk=F.KX_BD2_PICK, til=now(G)<abs(m,19.25);
    if(pk==='class'&&!outGet(G,'y2r2_bd')&&til) plan(G,{id:'y2r2_bd',ev:'ev_kexin_birthday_y2',day:m,h:19,late:0.25,place:'木柵大學・系上的小教室',title:'可昕的生日（木柵大學）',travel:'開車約 40 分鐘',travelH:2/3,bdV:'class'});
    if(pk==='shop'&&!outGet(G,'y2r2_bd')&&til) plan(G,{id:'y2r2_bd',ev:'ev_kexin_birthday_y2',day:m,h:19,late:0.25,place:'木柵大學・山下的小吃街',title:'可昕的生日（木柵大學山下）',travel:'開車約 40 分鐘',travelH:2/3,bdV:'shop'});
    if(pk==='two'&&!outGet(G,'y2r2_bd')&&til) plan(G,{id:'y2r2_bd',ev:'ev_kexin_birthday_y2',day:m,h:19,late:0.25,place:'木柵大學・校門口',title:'可昕的生日（木柵大學）',travel:'開車約 40 分鐘',travelH:2/3,bdV:'two'});
    if(pk==='two'&&win(G,m,14,1)&&!sent(G,'y2r2_bd_two')) at(G,m,14,[K('📷（切了一半的蛋糕，予樂比 YA）'),K('予樂說晚上要還你。')],'y2r2_bd_two');
    if(pk==='message'&&!outGet(G,'y2r2_bd')&&now(G)<abs(m,22.75)) plan(G,{id:'y2r2_bd',ev:'ev_kexin_birthday_y2_call',day:m,h:22,late:0.75,place:'電話',title:'打給可昕（生日）',verb:'打給她',no:'今天先不要',call:true,travel:'',travelH:0,back:'電話結束。',bdV:'call'});
    /* 沒回予樂：當天開車去政大（出遊提示，或 MSG-2 生日按鈕選「我去政大」）＝兩個人版的另一句；傳了生日快樂＝電話版；都沒做＝隔天 10:00 */
    if(!pk&&G.day===m){ if(!outGet(G,'y2r2_bd')&&G.hour<19.25&&!F.KX_BD2_GG) plan(G,{id:'y2r2_bd',ev:'ev_kexin_birthday_y2',day:m,h:19,late:0.25,place:'木柵大學',title:'可昕的生日：開車去木柵大學',travel:'開車約 40 分鐘',travelH:2/3,bdV:'drive'});
      /* MSG-2 生日按鈕選「妳來公館」（S.bdAskFix：她回「好 九點」、記 KX_BD2_GG；AA_338 第 2 節）：21:00 公館，開車去政大、電話那兩趟取消。
         傳過生日快樂＝KX_BD2_MSG（不說「我等了一天」）；答應了沒到＝21:30、22:00 她的兩則、記 'none'（下面，AA_343 A1）*/
      if(F.KX_BD2_GG&&!done(G,'ev_kexin_birthday_y2')){ F.KX_BD2_MSG=true; for(const k of ['y2r2_bd','y2r2_bd_call']){ const x=outGet(G,k); if(x&&x.state==='planned') x.state='cancelled'; }
        if(!outGet(G,'y2r2_bd_gg')&&now(G)<abs(m,21.75)) plan(G,{id:'y2r2_bd_gg',ev:'ev_kexin_birthday_y2',day:m,h:21,late:0.75,place:'公館',title:'可昕的生日（公館）',travel:'走過去約 15 分鐘',travelH:0.25,bdV:'gg'}); }
      const sentBd=!!(G.msgChat&&G.msgChat.bday&&G.msgChat.bday['kexin:'+(typeof CALENDAR!=='undefined'?CALENDAR.dateOf(m).y:2027)]===m), dq=outGet(G,'y2r2_bd');
      if(sentBd&&!F.KX_BD2_MSG&&!done(G,'ev_kexin_birthday_y2')&&(!dq||dq.state==='missed')){ F.KX_BD2_MSG=true;   /* 開車去了就不再打電話；沒去（或過了出發時間）才是電話版 */ if(!outGet(G,'y2r2_bd_call')&&now(G)<abs(m,22.75)) plan(G,{id:'y2r2_bd_call',ev:'ev_kexin_birthday_y2_call',day:m,h:Math.max(22,G.hour),late:0.75,place:'電話',title:'打給可昕（生日）',verb:'打給她',no:'今天先不要',call:true,travel:'',travelH:0,back:'電話結束。',bdV:'call'}); } }
    /* 「妳來公館」答應了沒到（AA_343 A1）：她 21:00 下山到公館。21:30 還沒到＝「我到了。公館。」；22:00 還沒到＝「……我回去了。蛋糕我帶回去。」、記 'none'（不是 'message'）。
       22:00 以前到了＝照演（AA_338 第 2 節）、記 'two'。沒有 22:00 電話版；隔天也沒有「我等了一天」 */
    { const gq=outGet(G,'y2r2_bd_gg'); if(gq&&gq.state!=='done'&&!gq.arrived&&!done(G,'ev_kexin_birthday_y2')){
        if(win(G,m,21.5,1)&&!sent(G,'y2r2_bd_gg_here')) at(G,m,21.5,[K('我到了。公館。')],'y2r2_bd_gg_here');
        if(win(G,m,22,1)&&!sent(G,'y2r2_bd_gg_back')){ at(G,m,22,[K('……我回去了。蛋糕我帶回去。')],'y2r2_bd_gg_back'); merge(G,'KX_BDAY',{2:'none'}); } } }
    if(G.day>m&&G.day<=m+3&&!(F.KX_BDAY&&F.KX_BDAY[2])){ merge(G,'KX_BDAY',{2:F.KX_BD2_MSG&&!F.KX_BD2_GG?'message':'none'}); if(!F.Y2R2_BD_NOSHOW&&!F.KX_BD2_MSG) at(G,m+1,10,[K('昨天是我生日。……我等了一天。')],'y2r2_bd_none'); } };   /* 傳了生日快樂（MSG-2）＝不是「都沒做」*/   /* 答應了沒到＝當晚 21:00 那兩則（outingMissed），不再加這一句 */

  /* ==================== 對話選單的一次性選項（STORY.TALK_OPTS）==================== */
  const ytShop=G=>G.zone==='noodle';
  S.talkOpts=function(G,id,GM){ const F=G.flags||{}, out=[]; if(!law(G)) return out;
    /* 2-Y2-01 語彤事件 7 新版：大二第一次法服值班之後 14 天內，在麵店 */
    if(id==='heroine_03'&&ytShop(G)&&F.FAFU_FIRST_SHIFT_Y2!=null&&!F.YT_DUTY_HEARD&&typeof STORY!=='undefined'&&STORY.fafuMember&&STORY.fafuMember(G)&&atLeast('heroine_03','FAMILIAR')){ const k=G.day-F.FAFU_FIRST_SHIFT_Y2;
      if(k>=1&&k<=14) out.push({t:k<=7?'禮拜六法服第一次值班。':'前兩個禮拜，法服第一次值班。',run:S.ytDutyChat}); }
    /* 2-Y2-22 「幫她」三個選項：有 RENT_CONSULTATION、到 6/2 為止、麵店或總圖 */
    if(id==='heroine_03'&&(ytShop(G)||/^library/.test(G.zone||''))&&mem('heroine_03','RENT_CONSULTATION')&&G.day<=d('k14')){ const H=F.YT_HELP_PICKED||{};
      [['job','要不要我問問看有沒有打工？'],['lend','需要的話，我可以先借妳。'],['info','我找了一些資料。']].forEach(([k,t])=>{ if(!H[k]) out.push({t,run:async(GM,who)=>S.ytHelp(GM,who,k,t)}); }); }
    /* 2-Y2-18 以安「明軒的事……」：聽說以後到 9/5、一次；和以安交往中而且明軒知道的不會有這件事。
       priv（AA_503 第 14 節第 5 項，企劃線 6bc3cd784：擋）：她旁邊有她的人時不出，清單 src/privtalk3d.js 的 an_mx（期限 9/5：那天照出，選了先一句旁白）*/
    if(id==='heroine_01'&&F.MX_HEARD&&!F.AN_MX_ASKED&&G.day<=d('an_end')&&!mxKnows(G)) out.push({t:'明軒的事……',priv:true,privKey:'an_mx',run:async(GM,who)=>{ G.flags.AN_MX_ASKED=true; GM.sceneBegin(); try{ await GM.say(who,'他問了，我答了。我們還是朋友。'); } finally { GM.sceneEnd(); } }});
    return out; };
  S.ytDutyChat=async function(GM,who){ const G=GM.G, F=G.flags, me={name:G.name||'祐廷'}; GM.sceneBegin();
    try{ await GM.say(who,'來的人多嗎？'); await GM.say(me,'一個阿伯講了十分鐘，大家都在翻六法。'); await GM.say(who,'他是不是一直講他兒子？'); await GM.say(me,'妳怎麼知道？');
      await GM.say(who,'來店裡的阿伯都這樣。重點通常在最後一句。'); await GM.say(null,'（她把你的碗收走，又走回來。）'); await GM.say(who,'最後一句是什麼？');
      const k=await GM.choose([{t:'「……我沒聽到。大家都在翻書。」'},{t:'「他說，他兒子不回家。」'}]);
      if(k===0) await GM.say(who,'下次聽完再翻。'); else { await GM.say(who,'那就是那個了。'); await GM.say(null,'（她沒有再說。）'); } }
    finally{ GM.sceneEnd(); }
    F.YT_DUTY_HEARD=true; markDone(G,'ev_yt_shift_chat'); if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust('heroine_03',{fam:1}); };
  S.ytHelp=async function(GM,who,k,t){ const G=GM.G, F=G.flags; (F.YT_HELP_PICKED||(F.YT_HELP_PICKED={}))[k]=G.day; F.YT_HELP_OFFERED=true; remember('heroine_03','HELP_OFFERED',t);
    GM.sceneBegin(); try{ await GM.say(who,'……嗯。我想一下。'); } finally { GM.sceneEnd(); } markDone(G,'ev_yt_help_offer'); };

  /* ==================== 房間物件（STORY.ROOM_EXTRA）==================== */
  S.roomExtra=function(G,L){ const F=G.flags||{};
    if(F.KX_XMAS&&F.KX_XMAS[2]==='went') L.push(['她的聖誕卡片','明年的第二頁，你排。']);
    if(F.KX_TRIP&&F.KX_TRIP.Y2W==='kaohsiung') L.push(['旅行照片：高雄的夜市','她拿著第一攤的東西，後面的燈全糊了。你拍的。']); };

  /* ==================== 睡著也會醒來（STORY.WAKE_AT）：6/2 21:00 可昕打來 ==================== */
  S.wakeAt=function(G){ const F=G.flags||{}, m=d('k14'); if(!kx(G)||m==null||G.day!==m||G.hour>=21) return null; if(done(G,'ev_kexin_summer_plan')||!sent(G,'y2r2_k14_ask')) return null; if(F.KX_K14==='yes'&&G.hour<17.75) return null; return 21; };

  /* ==================== 登記 ==================== */
  if(typeof STORY_EVENTS!=='undefined') Array.prototype.push.apply(STORY_EVENTS,EV);
  if(typeof STORY!=='undefined'){ if(STORY.PHONE_RULES){ STORY.PHONE_RULES.push(S.rules); STORY.PHONE_RULES.push(S.fillRules); } if(STORY.TALK_OPTS) STORY.TALK_OPTS.push(S.talkOpts); if(STORY.ROOM_EXTRA) STORY.ROOM_EXTRA.push(S.roomExtra); if(STORY.WAKE_AT) STORY.WAKE_AT.push(S.wakeAt); if(STORY.TICKS) STORY.TICKS.push(GM=>S.fillTick(GM)); }   /* fillRules、fillTick：AA_342 第 2-2 節 */
  if(typeof OUT!=='undefined'&&OUT.AFTER) OUT.AFTER.push(S.afterOuting);
  if(typeof MSG!=='undefined'&&MSG.askOpts&&!MSG._y2r2){ MSG._y2r2=true; const orig=MSG.askOpts; MSG.askOpts=function(G,id,e,nm,ctx){ const r=orig.apply(this,arguments); if(r&&r.opts){ try{ S.bdAskFix(G,id,e,r.opts); }catch(err){ console.warn('Y2R2.bdAskFix',err); } } return r; }; }   /* MSG.send 用 S.askOpts（同一個物件），包這一層就換得到 */
  if(typeof MSG!=='undefined'&&MSG.pick2&&!MSG._y2r2b){ MSG._y2r2b=true; const orig2=MSG.pick2; MSG.pick2=function(G,id,topic,peek){ const r=orig2.apply(this,arguments); if(r&&r.e&&!peek){ try{ const e=S.bdReply(G,id,topic,r.e); if(e) return Object.assign({},r,{e}); }catch(err){ console.warn('Y2R2.bdReply',err); } } return r; }; }   /* 同上：MSG.send 用 S.pick2（AA_343 A2）*/
  S.EVENTS=EV;
  return S;
})();

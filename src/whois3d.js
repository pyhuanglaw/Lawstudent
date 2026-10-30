/* CHAR-WHOIS-1030（AA_543 企劃線 d483ecbbf；使用者 2026-10-30 X145「我甚至玩這麼久搞不清楚阿哲是誰」）：手機人物頁的「你們」那一段——他是誰、怎麼認識、之後發生的事。
   畫面在 game3d.js 的 personHTML（「現在大概在」和個性中間），一行一句、前面加「· 」。
   - 每一行有條件：條件成立才顯示，沒發生的不先寫（第 0 節）。
   - 順序：①他是誰 ②怎麼認識 ③之後發生的事（照時間排）。同一件事有新的說法就換掉舊的（rep：這一行顯示時，拿掉 rep 列的那幾行）。
   - 一個人最多 8 行（第 5 節 5-1，企劃線 f726507f7；原本 6 行）：①②、叫你「哥」、任何「在一起了／在一起過」那一行（keep）永遠不擠掉，其他超過的從最舊的拿掉（ord：預設＝表上的順序）。
   - 合併（5-1）：宿營＋遊覽車一行（阿哲、明軒）、阿哲室友＋大三搬走一行、阿哲系籃＋17 號＋隊長一行。
   - 字一字照稿；群組名照 AA_542（STORY.ndlGroupName，法一吃飯……）。
   名單：法律系 阿哲、Alison、柏翰、芯慈、明軒、宥辰、阿凱；經濟系那年 阿勳、品妤、韋綸、唐睿；其他 方奕廷、黃筱涵（七位女主角、宋家豪、Kevin 不做，第 0 節）。
   個性那一行（characters.js personality）8 人改字在 characters.js；Alison 照進度換段在 S.desc（1-2）。 */
'use strict';
const WHOIS=(()=>{
  const S={};
  const F=G=>(G&&G.flags)||{};
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]!=null);
  const mem=(G,npc,tag)=>!!(G&&G.social&&G.social.mem&&(G.social.mem[npc]||[]).some(m=>m.tag===tag));
  const got=(G,tag)=>!!G&&((G.msgs||[]).some(m=>m&&m.tag===tag)||(typeof PHONE!=='undefined'&&PHONE.rec?(PHONE.rec(G).cut||[]).includes(tag):false));   /* 收過（已經送到手機；刪掉的舊訊息記在 cut）——排在之後還沒送到的不算 */
  const heard=(G,npc,t)=>{ const r=G&&G.social&&G.social.small&&G.social.small[npc]; return !!(r&&r.once&&r.once[t]!=null); };   /* 閒聊 once 那一句說過了（story3d.js 閒聊：r.once[key]） */
  const camp=(G,id)=>typeof STORY!=='undefined'&&!!STORY.metAtCamp&&STORY.metAtCamp(G,id);
  const since=(G,v)=>v!=null&&v!==false&&(typeof v!=='number'||G.day>=v);   /* 旗標記的是那一天（ROOM_Y2 搬進 312 那天…）：到了那天才算 */
  const fromKey=(G,k)=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null; return d!=null&&G.day>=d; };
  const year=G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; const m=t&&/^Y(\d)/.exec(t.id); return m?+m[1]:null; };
  S.helpers={done,mem,got,heard,camp,since,fromKey,year};

  /* 一列：{c:1|2|3, id, if:G=>bool, t:字串或 G=>字串, rep:[被換掉的 id]}
     c：1＝他是誰（全名那一行，和緊接在後面的同一類：家鄉、社團）、2＝怎麼認識（含室友那一行：他跟你是什麼關係）、3＝之後發生的事；
     keep：第 ③ 類裡永遠不擠掉的（「哥」、在一起）；ord：擠的順序（數字或 G=>數字，小的先擠；沒寫＝表上的順序）*/
  const R={};
  S.R=R; S.DESC={};
  const f=k=>G=>{ const v=F(G)[k]; return v!=null&&v!==false; };   /* 旗標有值（字串、數字、true）*/
  const ev=id=>G=>done(G,id);
  const grp=G=>typeof STORY!=='undefined'&&STORY.ndlGroupName?STORY.ndlGroupName(G):'法一吃飯';
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const y=(G,n)=>{ const v=year(G); return v!=null&&v>=n; };
  /* 室友（依序換）：搬進那一間那天起（ROOM_Y2 312、ROOM_Y3 507、ROOM_Y4 409；DORM_FOUR＝大一 203 四人房）*/
  const rm=G=>{ const o=F(G); return {four:!!o.DORM_FOUR,y2:since(G,o.ROOM_Y2),y3:since(G,o.ROOM_Y3),y4:since(G,o.ROOM_Y4)}; };

  /* ---------------- 1-1 阿哲 ---------------- */
  const zheMet=G=>camp(G,'zhe')||done(G,'ev_zhe_w1_meet');
  R.zhe=[
    {c:1,id:'name',if:zheMet,t:'張哲維，大家叫他阿哲。法律系，跟你同班。高雄人。'},
    {c:1,id:'name0',if:G=>!zheMet(G),t:'阿哲。法律系，跟你同班。'},   /* 舊開局，從來沒講過全名 */
    {c:2,id:'camp',if:G=>camp(G,'zhe'),t:G=>'宿營同一小隊，第一天就認識了。'+(F(G).CAMP_BUS==='zhe'?'去程的遊覽車上，他坐你旁邊。':'')},   /* 5-1：宿營＋遊覽車一行 */
    {c:2,id:'bus',if:G=>F(G).CAMP_BUS==='zhe'&&!camp(G,'zhe'),t:'去程的遊覽車上，他坐你旁邊。'},
    {c:2,id:'w1',if:G=>done(G,'ev_zhe_w1_meet')&&!camp(G,'zhe'),t:'開學第一堂課，他從後面戳你肩膀，問附近中午吃什麼。'},
    {c:2,id:'room',if:G=>{ const r=rm(G); return r.four||r.y2; },t:G=>{ const r=rm(G); return (r.y2?(r.four?'室友：大一 203、大二 312。':'大二同住 312。'):'大一同住 203。')+((r.y3||r.y4)&&y(G,3)?'大三起他搬去別間。':''); }},   /* 5-1：室友＋大三搬走一行 */
    {c:3,id:'ge',keep:true,if:f('ZHE_CALLS_GE'),t:'知道你比大家大一歲以後，他都叫你「哥」。'},
    {c:3,id:'grp',if:G=>{ const d=F(G).noodleTableDay; return d!=null&&(G.day>d||inGrp(G,'noodle_team')); },t:G=>'常揪大家吃飯。群組「'+grp(G)+'」是他建的。'},   /* 群組那天 21:00 才建好 */
    {c:3,id:'ball',t:G=>(done(G,'ev_zhe_game_y2')?'打系籃，17 號。':'打系籃。')+(F(G).ZHE3?'大三當上隊長。':''),ord:G=>F(G).ZHE3?R.zhe.findIndex(r=>r.id==='fin')-0.5:(done(G,'ev_zhe_game_y2')?R.zhe.findIndex(r=>r.id==='yu')-0.5:R.zhe.findIndex(r=>r.id==='ball'))},   /* 5-1：系籃一行（演過 ev_zhe_game_y2＝17 號、ZHE3＝隊長）；擠的順序照最後一次換說法的時候 */
    {c:3,id:'ballyou',if:G=>!!(F(G).CLUB_dept_basketball||F(G).ball_invite),t:'你也在系籃，幫忙記分。'},
    {c:3,id:'z2s',if:G=>F(G).ZHE2==='study',t:'大二上他民法差點被當，你陪他念了四個禮拜。'},
    {c:3,id:'z2n',if:G=>F(G).ZHE2==='notes',t:'大二上他民法差點被當，你借了他筆記。'},
    {c:3,id:'yu',keep:true,if:f('YU_ZHE_TOLD'),t:'大二上學期末，他和 Alison 在一起了。'},
    {c:3,id:'fin',if:G=>F(G).FINAL_GAME_Y3==='went',t:'大三下的冠軍賽贏了。你在場邊。'},
    {c:3,id:'fins',if:G=>F(G).FINAL_GAME_Y3==='stream',t:'大三下的冠軍賽贏了。你看的是直播。'} ];

  /* ---------------- 1-2 Alison（全名遊戲裡沒有人說過，這一段也不寫）---------------- */
  const yuQuit=G=>got(G,'yu_quit')||!!(G.needed&&G.needed.shown&&G.needed.shown.yu_clubs!=null);   /* 大二下第 3 週退辯論社（sup497_3d.js 那則；舊存檔的 yu_clubs）*/
  R.yu=[
    {c:1,id:'name',if:f('met_yu'),t:'Alison。法律系，跟你同班，坐你前面右邊。'},
    {c:1,id:'home',if:ev('ev_yu_breakfast'),t:'從板橋通勤。'},
    {c:2,id:'camp',if:G=>Array.isArray(F(G).CAMP_SEEN)&&F(G).CAMP_SEEN.includes('yu'),t:'宿營時隔壁小隊帶隊呼的那個女生，開學以後才說上話。'},
    {c:3,id:'bkf1',if:ev('ev_yu_breakfast'),t:'大一上，在晨思鐘旁邊一起吃過早餐。'},
    {c:3,id:'zh',keep:true,if:G=>F(G).YU_ZHE_TOLD==='here',t:'大二上學期末，她和阿哲在一起了。是她在麵店親口跟你說的。'},
    {c:3,id:'zc',keep:true,if:G=>F(G).YU_ZHE_TOLD==='call',t:'大二上學期末，她和阿哲在一起了。她打電話跟你說的。'},
    {c:3,id:'zp',keep:true,if:G=>F(G).YU_ZHE_TOLD==='photo',t:'大二上學期末，她和阿哲在一起了。你是看到群組的照片才知道的。'},
    {c:3,id:'bkf',if:f('YU_BKF'),t:'大二下有一陣子，她一個人吃早餐。'},
    {c:3,id:'lib',if:f('YU_Y4_LIB'),t:'大四上，她說她在練習一個人念書。'} ];
  S.DESC.yu=(G,base)=>(yuQuit(G)?'精力旺盛；吉他社、系學會都有她':'精力旺盛；吉他社、辯論社、系學會都有她')+(f('YU_BKF')(G)?'；其實很怕一個人':'');   /* 1-2：大二下第 3 週以後退了辯論社；一個人的早餐（YU_BKF）以後才寫「其實很怕一個人」*/

  /* ---------------- 1-3 許柏翰 ---------------- */
  const BH='classmate_bohan', PS='classmate_peishan';
  const psBh=G=>{ const d=G&&G.events&&G.events.last&&G.events.last.ev_midterm_supper_y1s2; if(d==null) return mem(G,PS,'HEARD_ABOUT');   /* 大一下刑總二期中考完的晚餐（沛珊：「對，我們在一起了。」）；沒去的聽說（HEARD_ABOUT）*/
    const m=G.social&&G.social.mem&&(G.social.mem[PS]||[]).find(x=>x.tag==='FIRST_MET'); return !!m&&(m.day==null||m.day<=d)&&(!F(G).dating_classmate_peishan||!!F(G).PEISHAN_BOHAN_SPLIT); };   /* 那一句只在認識沛珊、沒和她交往時說（events.js PS_BH）*/
  R[BH]=[
    {c:1,id:'name',if:G=>camp(G,BH),t:'許柏翰。法律系，跟你同班，坐第一排正中間。'},
    {c:1,id:'name0',if:G=>!camp(G,BH),t:'許柏翰。法律系，跟你同班，第一排那個。'},
    {c:1,id:'home',if:G=>got(G,'bh_home_y1')||got(G,'hol_y2w_bh_home'),t:'新竹人。'},   /* 「我今天回新竹。2/19 回來。」（大二寒假同一句多「債總帶回去了」）*/
    {c:2,id:'camp',if:G=>camp(G,BH),t:'宿營同一小隊。'},
    {c:2,id:'room',if:G=>{ const r=rm(G); return r.four||r.y2||r.y3||r.y4; },t:G=>{ const r=rm(G);   /* 沒有 DORM_FOUR 的，從有的那一年寫起 */
      if(r.y4) return r.four?'四年都是室友：203、312、507、409。':'室友：大二 312、大三 507、大四 409。';
      if(r.y3) return r.four?'室友：大一 203、大二 312、大三 507。':'室友：大二 312、大三 507。';
      if(r.y2) return r.four?'室友：大一 203、大二 312。':'室友：大二 312。';
      return '大一同住 203，他比你先搬進去。'; }},
    {c:3,id:'score',if:f('BOHAN_SCORE'),t:'大一上期中考完，他問過你第三題怎麼寫。'},   /* AA_546 1-6（D116）*/
    {c:3,id:'ps',keep:true,if:psBh,t:'大一下，他和沛珊在一起了。'},
    {c:3,id:'split',keep:true,if:f('PEISHAN_BOHAN_SPLIT'),t:'大一下他和沛珊在一起過，大二上分開了。',rep:['ps']},
    {c:3,id:'club',if:G=>y(G,2)&&heard(G,BH,'「法服的值班表，我排到十二月了。」'),t:'大二當法服社長。'},
    {c:3,id:'grp',if:f('BOHAN_GROUP'),t:'大二上，他找你進他的考古題小組。'},
    {c:3,id:'honest',if:G=>mem(G,BH,'BOHAN_HONEST'),t:'大三上，他在四樓樓梯間跟你說了，為什麼每天要念六小時。'},
    {c:3,id:'dinner',if:G=>F(G).BH_DINNER==='went',t:'推甄上了以後，他請你吃了一頓。'} ];

  /* ---------------- 1-4 吳芯慈（可攻略路線 AA_537 實作以後，交往那幾行另外補）---------------- */
  const XC='classmate_xinci';
  const xcOld=G=>!camp(G,XC)&&done(G,'ev_xinci_notes');
  const xcFirst=G=>done(G,'ev_xinci_first_place')||done(G,'ev_xinci_first_place_video');   /* 大三下第一次考第一那一場（改輔系那一句在這裡）*/
  R[XC]=[
    {c:1,id:'name',if:G=>!xcOld(G),t:'吳芯慈。法律系，跟你同班。'},
    {c:1,id:'name0',if:xcOld,t:'吳芯慈。法律系，跟你同班。大一上借筆記那次說上話。'},   /* 舊開局（演過 ev_xinci_notes）*/
    {c:1,id:'home',if:G=>['ev_xinci_second','ev_xinci_second_b1','ev_xinci_second_day'].some(id=>done(G,id))||!!(G.needed&&G.needed.shown&&G.needed.shown.xc_drama!=null),t:'住永和，通勤。'},   /* 慈 3（「她在台中，我在永和」）或收過「永和的公車今天提早到了」*/
    {c:2,id:'camp',if:G=>camp(G,XC),t:'宿營同一小隊。'},
    {c:3,id:'notes',if:G=>mem(G,XC,'LENT_NOTES')&&!xcOld(G),t:'她的筆記借過你。'},   /* 舊開局的第一行已經寫了借筆記，不重複 */
    {c:3,id:'double',if:ev('ev_xinci_double'),t:'雙主修經濟。她說是家裡要的。'},
    {c:3,id:'minor',if:xcFirst,t:'原本雙主修經濟，大三下改成輔系。',rep:['double']},
   ];   /* 「高中補習班，她三年都是第二名。」「大三下，她第一次考了第一。」拿掉（D116 不跟別人比；AA_543 1-4 改稿，企劃線 0342b98ec）*/

  /* ---------------- 1-5 江明軒 ---------------- */
  const MX='classmate_mingxuan';
  const mxOld=G=>!camp(G,MX)&&done(G,'ev_mingxuan_ball');
  R[MX]=[
    {c:1,id:'name',if:G=>!mxOld(G),t:'江明軒。法律系，跟你同班。'},
    {c:1,id:'name0',if:mxOld,t:'江明軒。法律系，跟你同班。阿哲的系籃隊友。'},   /* 舊開局（演過 ev_mingxuan_ball）*/
    {c:1,id:'dorm',if:f('DORM_FOUR'),t:'也住宿舍，在別棟。'},
    {c:1,id:'home',if:G=>F(G).MX_3ON3==='went'||done(G,'ev_mx_3on3'),t:'彰化人。'},
    {c:2,id:'camp',if:G=>camp(G,MX),t:G=>'宿營同一小隊。'+(F(G).CAMP_BUS==='mx'?'去程的遊覽車上，他坐你旁邊。':'')},   /* 5-1：宿營＋遊覽車一行（宿營的旗標寫 'mx'，camp_y1.js）*/
    {c:2,id:'bus',if:G=>F(G).CAMP_BUS==='mx'&&!camp(G,MX),t:'去程的遊覽車上，他坐你旁邊。'},
    {c:2,id:'why',if:f('WHY_RETAKE_ASKED'),t:'宿營夜談，是他問你為什麼重考。'},
    {c:3,id:'ball',if:G=>!mxOld(G),t:'打系籃，是阿哲的隊友。'},   /* 舊開局的第一行已經寫了，不重複 */
    {c:3,id:'study',if:G=>mem(G,MX,'SAW_HIM_STUDY'),t:'他看起來都沒念書。你撞見過他偷偷念。'},
    {c:3,id:'tutor',if:f('JOB_TUTOR'),t:'你的家教是他介紹的。'},
    {c:3,id:'told',if:G=>mem(G,MX,'MX_TOLD'),t:'大二下，他跟以安告白，被拒絕了。是他自己跟你說的。'},
    {c:3,id:'try',if:G=>mem(G,MX,'SAW_HIM_TRY'),t:'大三下冠軍賽那天，他說交換那個他放棄了。'},
    {c:3,id:'de',if:G=>F(G).MX_SAVED==='there'||F(G).MX_SAVED==='heard',t:'大四下，他存夠了錢，要去德國一年。'} ];

  /* ---------------- 1-6 賴宥辰 ---------------- */
  const YC='classmate_youchen';
  const ycSong=G=>!!G&&((G.msgs||[]).some(m=>m&&/^yc_song_\d+$/.test(m.tag||'')&&m.th==='p:'+YC)||(typeof PHONE!=='undefined'&&PHONE.rec?(PHONE.rec(G).cut||[]).some(t=>/^yc_song_\d+$/.test(t)):false));   /* 週五的歌：私訊才是「傳給你」（沒有聯絡方式的只在班群那幾則）*/
  R[YC]=[
    {c:1,id:'name',t:'賴宥辰。法律系，跟你同班。晚上在公館的店放歌。'},
    {c:2,id:'meet',if:f('YC_MEET'),t:'大一上，他民總遲到十分鐘，坐到你旁邊。'},
    {c:2,id:'dj',if:G=>done(G,'ev_youchen_dj')&&!F(G).YC_MEET,t:'大一上一個週五晚上，在公館的店裡遇到他。'},
    {c:3,id:'song',if:ycSong,t:'每個月傳一首歌給你。'},
    {c:3,id:'gig',if:f('YC_GIG'),t:'大二上，你去看了他在地下室的第一場。'},
    {c:3,id:'fail',if:f('YC_FAIL'),t:'大二上開學，他說債總被當了。'},
    {c:3,id:'deal',if:G=>!!F(G).YC_CONTRACT||done(G,'ev_yc_deal'),t:'大三上，他幫一個樂團看合約。'} ];

  /* ---------------- 1-7 阿凱 ---------------- */
  R.kai=[
    {c:1,id:'name',t:'阿凱。資工系。'},
    {c:1,id:'full',if:ev('ev_ziqing_q12'),t:'全名王凱翔，子晴發表會的製作名單上有他。'},
    {c:1,id:'home',if:G=>{ const T=G.termend&&G.termend.Y2S2; return !!(T&&T.done&&T.done.who==='kai'); },t:'宜蘭人。'},   /* 大二下期末飯（termend_lines.js POOL.Y2S2.kai「八月想回宜蘭」）*/
    {c:2,id:'room',if:G=>typeof STORY==='undefined'||!STORY.kaiRoommate||STORY.kaiRoommate(G),t:'大一的室友，搬宿舍那天認識的。'},
    {c:2,id:'room2',if:G=>typeof STORY!=='undefined'&&!!STORY.kaiRoommate&&!STORY.kaiRoommate(G),t:'大一的室友。大二他搬去別棟。',rep:['room']},   /* 搬進第二個房間（9/6）以後 */
    {c:3,id:'zq',if:ev('ev_kai_mentions_ziqing'),t:'子晴是他系上的學姊。'},
    {c:3,id:'fight',if:G=>mem(G,'kai','KAI_ROOM_RULES'),t:'為了鍵盤吵過一次，後來和好了。'},   /* KAI_FIGHT 只在吵架那四天；和好時記 KAI_ROOM_RULES */
    {c:3,id:'supper',if:G=>mem(G,'kai','SUNDAY_SUPPER'),t:'搬走以後，週日還是會一起吃宵夜。'} ];

  /* ---------------- 2 經濟系那年（玩過 PLAYED_Y0／從法律系開始：那一年發生在遊戲開始以前，人照樣記得你）、其他 ---------------- */
  /* 經濟系那一年本身（stage econ，從開局到轉法律系）：下面「那年的室友、住了兩個月」「回到法律系以後」都是回頭看的寫法，那一年還沒過完就先不顯示（AA_543 第 0 節「沒發生的不先寫」；
     BB-B 10-30 BUG-WHOIS-ECONYEAR-1030：PLAYED_Y0 到 Y1 宿營才記，經濟系那年原本走 noY0 那幾列）。經濟系當下的寫法等 AA 給；宿營同一小隊等宿營過了才寫 */
  const econNow=G=>!!G&&G.stage==='econ';
  const y0=G=>!econNow(G)&&f('PLAYED_Y0')(G), noY0=G=>!econNow(G)&&!f('PLAYED_Y0')(G);
  R.econ_zhengxun=[
    {c:1,id:'name',t:'盧正勳，大家叫他阿勳。經濟系。'},
    {c:2,id:'room',if:y0,t:'你經濟系那年的室友，男宿 412，住了兩個月。'},
    {c:2,id:'camp',if:G=>(y0(G)||econNow(G))&&!!F(G).ECON_CAMP_DONE,t:'經濟系宿營同一小隊。'},
    {c:2,id:'room0',if:noY0,t:'你經濟系那年的室友。回到法律系以後，他傳訊息來：「是我，阿勳。」'},
    {c:3,id:'treat',if:G=>F(G).A3_TREAT===true,t:'你退宿那天，他幫你封箱。'},
    {c:3,id:'why',if:f('E24C_REASON'),t:'他問過你，為什麼要重考。'},
    {c:3,id:'day',if:f('XUN_DAY'),t:'法律系大一下，在共同教學館聊到很晚。'} ];
  R.econ_pinyu=[
    {c:1,id:'name',t:'曾品妤。經濟系，可昕大一的室友。'},
    {c:2,id:'cls',if:y0,t:'經濟系同班，「走啦」群組裡也有她。'},
    {c:2,id:'cls0',if:noY0,t:'回到法律系以後才說上話。'},
    {c:3,id:'worry',if:f('PINYU_WORRY'),t:'想當精算師。精算要一科一科考。'},
    {c:3,id:'act',if:G=>got(G,'r3_py_actuary'),t:'大四上，精算第一科過了。'},
    {c:3,id:'tr',keep:true,if:G=>got(G,'b106_42_photo'),t:'她和唐睿在一起了。'} ];
  R.econ_weilun=[
    {c:1,id:'name',t:'邱韋綸。經濟系，口頭禪「走啦！」'},
    {c:2,id:'room',if:y0,t:'你經濟系那年的室友（412），宿營同一小隊。「走啦」群組是他建的。'},
    {c:2,id:'room0',if:noY0,t:'你經濟系那年的室友。回到法律系以後，在法學院廣場遇到他。'},
    {c:3,id:'game',if:f('WL_GAME'),t:'大四下，跟他去看了一場球賽。'} ];
  R.econ_tangrui=[
    {c:1,id:'name',t:'唐睿。經濟系。'},
    {c:1,id:'improv',if:G=>done(G,'ev_sk07_improv')||f('IMPROV_WORD')(G),t:'在即興劇社。'},
    {c:2,id:'room',if:y0,t:'你經濟系那年的室友（412）。'},
    {c:2,id:'sticky',if:G=>noY0(G)&&!!F(G).STICKY_NOTES,t:'大一上，你桌上一直出現便利貼，後來才知道是他。'},
    {c:3,id:'night',if:G=>done(G,'ev_econ_night_y2')||mem(G,'econ_tangrui','ECON_NIGHT')||mem(G,'econ_pinyu','ECON_NIGHT'),t:'經濟系之夜是他主持的。'},   /* 記憶 ECON_NIGHT 記在品妤（ev_econ_night_y2）*/
    {c:3,id:'py',keep:true,if:G=>got(G,'b106_42_photo'),t:'他和品妤在一起了。'} ];
  R.npc_fangyt=[
    {c:1,id:'name',t:'方奕廷。森林系。'},
    {c:1,id:'zr',if:G=>mem(G,'npc_fangyt','FANG_HINT'),t:'跟芷若高中同校。'},
    {c:2,id:'room',t:'大一住你隔壁房。'},
    {c:2,id:'pothos',if:f('POTHOS'),t:'你們是從一盆黃金葛開始說話的。'},
    {c:3,id:'out',if:G=>y(G,2),t:'大二他搬出宿舍了。'},
    {c:3,id:'f2',if:G=>F(G).FANG_F2==='went',t:'大二暑假，跟他上山做了調查。'},
    {c:3,id:'f4',if:G=>F(G).FANG_F4==='went',t:'大四寒假，去嘉義找他看紅檜。他在那裡工作。'} ];
  R.npc_huangxh=[
    {c:1,id:'name',t:'黃筱涵。心理系。'},
    {c:2,id:'ge',t:'大一上通識「電影與敘事」同一班。'},
    {c:3,id:'yt',if:G=>{ const T=F(G).AA519&&F(G).AA519.talk&&F(G).AA519.talk.npc_huangxh; return !!(T&&T.said&&T.said.y1_1!=null); },t:'跟語彤高中同班。'},   /* 「我跟語彤高中同班。她那時候就坐第一排。」（aa519_lines.js hxh 大一第 2 句，sup519_3d.js 記在 AA519.talk.npc_huangxh.said）*/
    {c:3,id:'subj',if:G=>!!F(G).HXH_SUBJECT||mem(G,'npc_huangxh','HXH_SUBJECT'),t:'大二上，你當過她實驗的受試者。'} ];

  /* 第 0 節：條件成立的列 → 拿掉被換掉的 → 超過 8 行從能擠的（第 ③ 類、不是 keep）最舊的拿掉；都不能擠就全部顯示 */
  S.MAX=8;
  S.lines=function(G,id){ const rows=R[id]; if(!G||!rows) return [];
    let on=rows.filter(r=>{ try{ return !r.if||!!r.if(G); }catch(e){ return false; } });
    const gone=new Set(); for(const r of on) for(const x of (r.rep||[])) gone.add(x);
    on=on.filter(r=>!gone.has(r.id));
    const ord=r=>{ try{ return typeof r.ord==='function'?r.ord(G):(r.ord!=null?r.ord:rows.indexOf(r)); }catch(e){ return rows.indexOf(r); } };
    while(on.length>S.MAX){ let k=-1; for(let i=0;i<on.length;i++){ const r=on[i]; if(r.c!==3||r.keep) continue; if(k<0||ord(r)<ord(on[k])) k=i; } if(k<0) break; on.splice(k,1); }
    return on.map(r=>{ try{ return typeof r.t==='function'?r.t(G):r.t; }catch(e){ return ''; } }).filter(Boolean); };

  /* 個性那一行照進度換（1-2 Alison 在上面 S.DESC.yu）；其他人照 characters.js */
  S.desc=function(G,id,base){ const f=S.DESC[id]; if(!f||!G) return base; try{ const v=f(G,base); return v==null?base:v; }catch(e){ return base; } };
  return S;
})();

/* ===== 劇情與世界內容：人物、日程、路人、事件、法律系內容 ===== */
'use strict';
const STORY = (function(){
  const S={};
  const C=P3.CAST; const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  /* 宿舍四人房的座位（DORM-LOFT-L；DORM_ROOM＝src/data/dorm_room_layout.js）：R2＝阿凱（203）／阿勳（412）、R1＝柏翰／唐睿、L1＝阿哲／韋綸、L2＝玩家 */
  const dormSeat=id=>{ const u=typeof DORM_ROOM!=='undefined'&&DORM_ROOM.units.find(q=>q.id===id); return u?{x:u.seat.x,z:u.seat.z,yaw:u.seat.yaw}:{x:1.8,z:2.2,yaw:Math.PI}; }; S.dormSeat=dormSeat;
  // 人物卡（虛構）
  S.people={
    an:{name:'小安',tag:'法律系一年級・同班',desc:'講話直接，筆記整齊到像印的。喜歡溫州街那間開到凌晨的咖啡廳。',memory:G=>G.flags.cafeView?('記得你在咖啡廳說：'+({A:'法律該保護粗心的人',B:'錯誤是自己的責任',C:'重大過失就不該保護'}[G.flags.cafeView])):'還沒真正聊過'},
    zhe:{name:'阿哲',tag:'法律系一年級・同班',desc:'系籃。總是笑著，租屋在公館，什麼店好吃都知道。',known:true,memory:G=>G.flags.classAnswer==='good'?'覺得你上課回答得很帥':'覺得你人不錯'},
    sis:{name:'溫學姊',tag:'法律系四年級・法律服務社前社長',desc:'總圖常客。說話很快，講到法服眼睛會亮。',memory:G=>G.flags.lawclub?'知道你看過法服的招募公告':''},
    kai:{name:'阿凱',tag:'資工系一年級・室友',desc:'晚上不是在打遊戲就是在寫程式。對法律的理解停留在「所以可以告嗎」。',known:true,memory:G=>G.flags.readCase==='full'?'看過你熬夜讀案例':''},
    yu:{name:'Alison',tag:'法律系一年級・同班',desc:'參加了三個社團。常在傅鐘旁邊的長椅吃早餐。',memory:G=>''},
    prof:{name:'周教授',tag:'民法總則',desc:'上課喜歡點人。被點到的人下週會被記得。',known:true,memory:G=>G.flags.classAnswer==='good'?'記得你答對了要約之引誘':(G.flags.classAnswer==='none'?'記得你沒看案例':'')},
  };
  // 額外人物規格（教授、路人）
  // 教授外觀（資料驅動人物用）：以 PROF 為基底，依 id 變化髮色／髮型／眼鏡／上衣，避免八位教授長得一樣
  function profSpec(c){ const seed=Array.from(c.id).reduce((a,ch)=>a+ch.charCodeAt(0),0); const f=c.gender==='f'; const hairC=['#6d6a66','#2a2420','#4a4a4a','#3b2a1e','#8a8580'][seed%5]; const hairS=f?['chicBob','ponyLow','softMid'][seed%3]:['shortClean','softMid','shortTextured'][seed%3]; const tops=[['shirt','#dfe3ea','#dfe3ea'],['shirt','#c9d3dd','#c9d3dd'],['knit','#6b5a4a','#ffffff'],['cardiganOpen','#3a3f4a','#ffffff'],['shirt','#ede7dc','#ede7dc'],['knit','#5a6b7a','#ffffff']][seed%6]; const bots=f?[['slacks','#3a3a3a'],['skirtLong','#3b3340'],['slacks','#5b4a3a']][seed%3]:[['slacks','#3a3a3a'],['slacks','#4a4238'],['slacks','#2b2b3a']][seed%3]; return {id:c.id,name:c.name,height:f?1.60+(seed%4)*0.02:1.70+(seed%4)*0.02,build:'slim',sex:f?'f':'m',skin:['#efd0b3','#f3d9c4','#e6c3a4'][seed%3],hair:{color:hairC,style:hairS},face:{iris:'#2e211c',brow:f?'soft':'thick',lash:f,glasses:seed%3!==1},outfit:{top:{type:tops[0],color:tops[1],inner:tops[2]},bottom:{type:bots[0],color:bots[1]},shoes:{type:'loafer',color:'#2b2118',sole:'#2b2118'},bag:seed%2?'shoulder':null,bagColor:'#3b2a1e'},posture:{sway:0.01}}; }
  S.profSpec=profSpec;
  const PROF={id:'prof',name:'周教授',height:1.74,build:'slim',sex:'m',skin:'#efd0b3',hair:{color:'#6d6a66',style:'shortClean'},face:{iris:'#2e211c',brow:'thick',lash:false,glasses:true},outfit:{top:{type:'shirt',color:'#dfe3ea',inner:'#dfe3ea'},bottom:{type:'slacks',color:'#3a3a3a'},shoes:{type:'loafer',color:'#2b2118',sole:'#2b2118'},bag:null},posture:{sway:0.01}};
  S.PROF=PROF;
  const AN=Object.assign({},C.hero_f,{id:'an',name:'小安',model:'char.heroine_01',height:1.66});
  /* AA_372 第 4 項（企劃線 da456892，AA 定稿）：她自我介紹以前不叫「小安」。主線 9/4 以安沒報過名字（上課、追出來、一起走、Café／總圖）：劇情的以安（AN）字幕、對話框「前排的女生」，按鈕「和她說話」；
     翹課的局（classAnswer absent）他沒在教室看過她＝「不認識的女生」（給 AA 的問題）。她說了「你好，我是沈以安。大家都叫我小安。」（talkAn、talkCharacter）記 AN_NAME_TOLD；主線第 3 天起照舊「小安」 */
  S.anNameTold=G=>{ const F=(G&&G.flags)||{}; return !!F.AN_NAME_TOLD||S.mainDay(G)>2; };
  S.anLabel=G=>S.anNameTold(G)?'小安':(((G&&G.flags)||{}).classAnswer==='absent'?'不認識的女生':'前排的女生');
  const anTag=(G,n)=>{ if(n){ n.name=S.anLabel(G); n.talkLabel=S.anNameTold(G)?'和小安說話':'和她說話'; } return n; };
  let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };
  /* 女路人第 5 套原本是鮮紅 T（#8c3b47），使用者 2026-10-17：「臺大不要再有這麼鮮豔紅色上衣的女生」→ 灰綠（LAWWW2-C 查到的那一格）*/
  function extraSpec(i){ const f=(i%2===0); const tops=f?[['tee','#f7f4ee'],['knit','#c9a24f'],['cardiganOpen','#4a6c8c'],['shirt','#ffffff'],['tee','#9aa392']]:[['tee','#2b2b3a'],['shirtOpen','#eef0f2'],['hoodie','#3a3f4a'],['tee','#2f5d50'],['shirt','#dfe3ea']]; const bots=f?[['skirtMid','#2e3340'],['wideLeg','#3b2a1e'],['jeans','#4a5a78'],['skirtLong','#5c3a21']]:[['jeans','#2b2b3a'],['slacks','#3a3f4a'],['jeans','#4a5a78'],['slacks','#7b6a5a']]; const hairs=f?['softMid','longStraight','ponyLow','chicBob','wavyMid']:['shortTextured','shortClean','softMid']; const t=tops[i%tops.length], b=bots[(i*3)%bots.length]; return {id:'x'+i,name:'',height:f?1.58+(i%4)*0.03:1.70+(i%4)*0.03,build:(i%5===0)?'athletic':'slim',sex:f?'f':'m',skin:['#f3d9c4','#efd0b3','#e6c3a4','#f6dcc9'][i%4],hair:{color:['#2a1d16','#1f1613','#3b2a1e','#4b2e1e'][(i*7)%4],style:hairs[(i*5)%hairs.length]},face:{iris:'#3a2a22',brow:f?'soft':'thick',lash:f,glasses:i%4===1},outfit:{top:{type:t[0],color:t[1],inner:'#ffffff'},bottom:{type:b[0],color:b[1]},shoes:{type:['sneaker','canvas','loafer'][i%3],color:['#f4f1ea','#2b2118','#3a6fb0'][i%3],sole:'#ffffff'},bag:[null,'backpack','tote','shoulder'][i%4],bagColor:['#3b3f4a','#d9d3c6','#3b2a1e','#4a4238'][i%4]},posture:{sway:0.02}}; }
  S.extraSpec=extraSpec;
  /* 美國的路人（US-MARKET-CROWD-1021）：同一套衣服、髮型，膚色、髮色多一點（深淺、金、棕、紅棕） */
  function extraSpecUS(i){ const s=extraSpec(i+100); s.id='u'+i; s.skin=['#f3d9c4','#e8bfa0','#c68e65','#8d5a3b','#5c3a28','#f6dcc9','#d9a77f'][i%7]; s.hair=Object.assign({},s.hair,{color:['#2a1d16','#6b4a2b','#b88a4a','#1f1613','#8a3b22','#d8b67a','#3b2a1e'][(i*3)%7]}); if(s.face) s.face=Object.assign({},s.face,{iris:['#3a2a22','#4a6b8a','#5a6b3a','#3a2a22'][i%4]}); return s; }
  S.extraSpecUS=extraSpecUS;
  /* 超市街（美國）走路的路線（照 US_MARKET_STREET_LAYOUT）：北側人行道、超市門口（消防車道正中，避開門口的護柱；IN 門進、OUT 門出）、南側人行道（樹、號誌桿外側）、亞洲超市門口。不過馬路（車只讓玩家）*/
  S.usStreetRoutes=function(L){ if(!L||!L.walk_n||!L.walk_s||!L.market) return []; const zn=(L.walk_n.z0+L.walk_n.z1)/2, zs=33.7, zf=L.fire_lane?(L.fire_lane.z0+L.fire_lane.z1)/2:-14.4, d=L.market.doors||[], din=(d.find(q=>q.id==='in')||{x:13.5}).x, dout=(d.find(q=>q.id==='out')||{x:-13.5}).x, fz=L.market.front_z+3.1;
    const am=(L.interact||[]).find(q=>q.id==='am_in'); const sx0=L.stripmall?L.stripmall.x0+1:-33, sx1=L.stripmall?L.stripmall.x1-1:13;
    return [[[-38,zn,0],[38,zn,0]],[[30,zn,0],[-30,zn,0]],[[din,fz,0],[din,zf,0],[dout,zf,0],[dout,fz,0],[dout,zf,0],[din,zf,0]],[[sx0,zs,0],[sx1,zs,0]]].concat(am?[[[am.x-6,zs,0],[am.x,zs,0],[am.x,am.z-0.8,0],[am.x,zs,0],[am.x+6,zs,0]]]:[]); };
  // ---------- 法律內容 ----------
  const CASE={id:'case_camera',title:'指定案例：網拍相機 1,000 元',body:'賣家在拍賣網站把一台市價約一萬元的相機標成 1,000 元（少打一個零）。買家下標付款，賣家拒絕出貨。爭點：網頁標價是「要約」還是「要約之引誘」？賣家能否主張錯誤撤銷？'};
  S.studyTopics=G=>[{id:'law_154',title:'民法 §154：要約與要約之引誘',body:'貨物標定賣價陳列者，視為要約；但價目表之寄送，不視為要約。網拍頁面是哪一種，實務與學說有爭論。',read:'你讀了民法第 154 條和幾則判決。網拍標價到底算不算要約，原來連法院都吵過。'},{id:'law_88',title:'民法 §88：意思表示錯誤',body:'表意人若無過失，得撤銷錯誤之意思表示；但撤銷後對信賴者要負賠償責任（§91）。',read:'你讀了錯誤與撤銷的部分。重點在「無過失」和「信賴利益賠償」。'},{id:'law_153',title:'民法 §153：契約成立',body:'當事人互相表示意思一致者，契約即為成立。必要之點須一致，非必要之點推定成立。',read:'你把契約成立的要件整理成一張圖。'},{id:'law_71',title:'民法 §71：強行規定',body:'法律行為違反強制或禁止規定者無效，但其規定不以之為無效者，不在此限。',read:'你讀了強行規定與無效。'}];
  // ---------- 開新遊戲 ----------
  S.resumeWalk=function(GM){ if(!GM.G.flags.walkCk) GM.G.flags.walkCk={}; startWalkTalk(GM); };
  /* 經濟系／法律系兩種開局（交接包 v0 A3、AA_106 第 3 節）：G.stage＝'econ'（經濟系那一年）或 'law'（法律系；舊存檔沒有這個欄位＝法律系，migrate 補預設值）。
     開場劇情的日子：法律系第 1、2 天（第一天宿舍、第二天民總），經濟系 2024-09-01（E01 宿舍第一晚，AA_154 A24）——一鍵上課、跳過時間、時段次數、小睡在這幾天不開（原本寫死 G.day<3，經濟系的天數是負的）*/
  S.isEcon=G=>!!G&&G.stage==='econ';
  S.dayTitle=G=>{ if(typeof CALENDAR!=='undefined'&&G&&typeof G.day==='number'){ const d=CALENDAR.dateOf(G.day); return d.m+' 月 '+d.d+' 日'; } return '第 '+G.day+' 天'; };   /* A3（AA_195 4-7）：法律系也寫日期（原本只有經濟系那一年）*/   /* 換日的標題：經濟系那一年的日子是負的（2024-09-01＝第 −380 天），寫日期 */
  S.Y0_DAY1=null; S.y0Day1=()=>S.Y0_DAY1!=null?S.Y0_DAY1:(S.Y0_DAY1=S.dayOfKey?S.dayOfKey('2024-09-01'):null);
  S.opening=G=>!!G&&(S.isEcon(G)?G.day===S.y0Day1():(S.mainDay(G)===1||S.mainDay(G)===2));   /* 開局 B（D91）：新遊戲從第 −16 天（8/31）開始以後，第 1 天以前是一般的日子，不是開場劇情 */
  /* 法律系這一局從哪一天開始（D91）：舊存檔、現在的開局＝第 1 天（9/17 晚上）；開局 B＝第 −16 天（2025-08-31 傍晚）。在那之前的課不排、不算沒去 */
  S.lawStart=G=>{ const v=G&&G.flags&&G.flags.LAW_START_DAY; return typeof v==='number'?v:1; };
  /* START-WEEK 選 1（使用者 2026-10-16 20:39 對 AA-B；規格 AA_195）：法律系主線的「第一天」（宿舍那一晚）、「第二天」（民總、以安）不再寫死 9/17、9/18，
     看存檔的 MAIN_D1：舊存檔沒有＝1（9/17，照舊、不重播）；選 1 的新局＝−13（2025-09-03 週三，主線第二天 9/4 週四）。
     S.mainDay(G)＝從主線第一天算起的第幾天（舊存檔＝G.day）。所有「第 1、2 天」「第 3 天以後」的判斷都用它 */
  S.mainD1=G=>{ const v=G&&G.flags&&G.flags.MAIN_D1; return typeof v==='number'?v:1; };
  S.mainDay=(G,day)=>(day==null?G.day:day)-S.mainD1(G)+1;
  S.week1Start=G=>S.lawStart(G)<S.mainD1(G);   /* 選 1 的局：主線第一天以前已經住進宿舍、上了幾天課（AA_195）*/
  /* 法律系開局的開頭（AA_106 3b④＋③；AA 2026-10-14）：新遊戲在現有第一天之前放 */
  S.LAW_START_RECAP=['你從小就想念台大法律。','第一次考試，社會考壞了，總分差了四分。','你去念了台大經濟。那時候你是高興的。','你認識了一群朋友，也認識了她。她叫杜可昕，高雄人。第一次班聚，你們一起去打保齡球。','十月，你辦了休學。那天她叫你回學校。','在車上，你說你喜歡過她。她說你很笨，她喜歡的是你。','那天晚上，在摩天輪上，你們說好要在一起。','二月，她也休學了。是你先說的：一起重考吧。','你考上台大法律，她考上政大法律。','九月，你回到同一個校園，換了一個系。'];   /* AA_224 第 2 組（e6c064a3；AA_218 15-2 使用者批准方向）；第 4 句 2026-10-18 改（AA_295：可昕不出假設題、「很會問奇怪的問題」拿掉；保齡球 AA_293 4-1）*/
  S.LAW_START_RECAP_W1=S.LAW_START_RECAP.slice(0,-1).concat(['八月底，你回到同一個校園，換了一個系。']);   /* 選 1（AA-B 21:09）*/
  S.LAW_WEEK12=['開學第一週，你走進霖澤館。沒有人知道你來過這個校園。','選課、新生活動、第一次點名。你又排了一次新生的隊。','這次你知道，這種隊要排多久。','重修的經濟學原理排在週五早上，普通教學館。你閉著眼睛也找得到。'];
  S.recap=async function(GM,lines,o){ o=o||{}; if(!lines||!lines.length) return; GM.sceneBegin(); try{ if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'dark'}); for(const t of lines) await GM.say(null,t); } finally { if(!o.keep&&typeof ADV!=='undefined'&&ADV.end) ADV.end(); GM.sceneEnd(); } };   /* keep：播完先不收黑底（接著轉場，不讓 3D 畫面閃一下）*/
  /* 坐下就開始的事件（trigger:'seat'、seatRoom＝座位所在的區（layout 的 groups id，例：博雅的 'study'）；game3d.js 的座位選單在坐下以後、選單出來以前呼叫）*/
  S.onSeat=async function(GM,seat){ if(typeof EVENTS==='undefined'||typeof STORY_EVENTS==='undefined'||!seat) return false; const G=GM.G;
    const ev=STORY_EVENTS.find(e=>e.trigger==='seat'&&(!e.seatRoom||e.seatRoom===seat.room)&&(!e.location||e.location==='any'||e.location===G.zone)&&EVENTS.check(e,{chain:true})&&(e.random_weight===undefined||Math.random()<=e.random_weight));   /* random_weight 和走進區域的事件一樣（ev_library_outlet 改成坐下才演）*/ if(!ev) return false; await EVENTS.run(ev); return true; };
  /* AA_529 6-4：9/21 選的社團（E07、Y0_CLUB），群組一整年是空的——每個社團三則，不用回（社課的事寫在群組，沒有人私訊祐廷；10/17 休學以後照樣在群組裡，看得到，不用退）。
     9/27（五）、10/18（五）、12/6（五）21:00；說話的人標籤寫全名（AA_496 第 9-6 點）；登山社 10 月中是照片＋一句。之前就過了那天的不補 */
  S.Y0_CLUB_MSG={y0_guitar:{who:'吉他社社長',from:'npc_y0_guitar_pres',m:[['2024-09-27',['這週社課練 C 和弦，沒有吉他的可以借社辦的']],['2024-10-18',['期中考週停社課，下下週見']],['2024-12-06',['12/18 期末成發，社辦，歡迎帶朋友']]]},
    y0_hiking:{who:'登山社社長',from:'npc_y0_hiking_pres',m:[['2024-09-27',['10/5 七星山，捷運北投站 7:30 集合，帶水']],['2024-10-18',['📷（七星山頂，一排人比 YA，霧很大）','下次天氣好再去一次']],['2024-12-06',['寒假合歡山，報名到 12/20']]]},
    y0_badminton:{who:'羽球社社長',from:'npc_y0_badminton_pres',m:[['2024-09-27',['週二、週四晚上七點，新體育館']],['2024-10-18',['有人要打雙打嗎 缺一個']],['2024-12-06',['期末盃 12/14，報名表在記事本']]]}};
  /* 經濟系 → 法律系（AA_154 2-4b 第 4、5 點）：8/31（日）早上醒來 → 3b② 暑假的摘要日（AA_106）→ 先備份存檔（「經濟系那一年的最後一天」，fatiao3d_backup_y0end）→ 黑幕字卡 → 3b③ 法律系第 1～2 週 →
     stage 'law'、day 1（9/17）21:12、宿舍 203，接法律系第一天的開場。帶過去的：旗標、記憶、好感、手機、錢；可昕 dating_kexin＝true、KX_FIRST_MSG＝false（法律系第一天照常播她的第一則＋經濟系版的第一句）；
     MET_XUN、MET_PINYU、KNOWS_TANG（認識的人不重新自我介紹，BB_96 10-1 P4d）；PLAYED_Y0（AA 建議）。觸發：在家＝home3d 選單那一輪（醒來以後）；不在家＝S.tick */
  /* AA_529 6-3：第 2 句原本「整個暑假你都住在家裡。」（舊時間線：他 10/31 起就住在家裡了）*/
  S.Y0_SUMMER=['暑假剩下的日子，過得很快。','這個暑假，你還是住在家裡。媽媽每天問你，新宿舍還缺什麼。','八月底，你搬進法律系的宿舍。同一個校園，換了一棟樓。','書桌上，經濟學原理還沒收起來。'];
  S.toLawDue=G=>{ if(!S.isEcon(G)) return false; const d=S.dayOfKey(S.START1()?'2025-08-29':'2025-08-31');   /* 選 1：8/29 下午搬宿舍，和新局同一場（AA-B 21:09，AA_197 第 0 節）*/ return d!=null&&(G.day>d||(G.day===d&&G.hour>=5)); };   /* 05:00＝休學在家的快轉終點（HOME.y0FfEnd）：到了就轉，不會被「睡覺」睡過 8/29（BB-C 10-18 BUG-E37-LATE-0830）*/
  let toLawBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:toLawBusy']=()=>{ toLawBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.toLaw=async function(GM){ if(toLawBusy) return false; toLawBusy=true; const G=GM.G, E=GM.E, F=G.flags;
    try{ if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
      await S.recap(GM,S.START1()?S.Y0_SUMMER.slice(0,2):S.Y0_SUMMER);   /* 選 1：只留前兩句，接著就實際搬進去（AA-B 21:09）*/
      if(GM.backupNow) GM.backupNow('經濟系那一年的最後一天','y0end');
      await GM.fade(true); if(GM.titleCard&&!S.START1()) await GM.titleCard('2025 年 9 月　臺大法律系　大一','',2400);   /* 選 1：只留 8/29 的日期卡 */
      if(typeof HOME!=='undefined'){ const H=HOME.rec(G); H.at=false; H.base=false; H.winter=false; H.wakeAsk=null; }
      /* 2026-10-16 瀏覽器流程測試抓到：原本黑幕（#fade，z-index 9、會攔點擊）還開著就播③，對話框在黑幕下面——玩家只看到一片黑、點不下去。先開黑底的對話畫面，再拿掉黑幕 */
      if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'dark'}); await GM.fade(false);
      if(!S.START1()) await S.recap(GM,S.LAW_WEEK12,{keep:true});   /* 選 1：第一、二週要真的玩，不用摘要 */
      await GM.fade(true); if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
      Object.assign(F,{dating_kexin:true,KX_FIRST_MSG:false,MET_XUN:true,MET_PINYU:true,KNOWS_TANG:true,PLAYED_Y0:true,LAW_RECAP_SEEN:true});
      if(Array.isArray(G.outings)) G.outings=G.outings.filter(q=>q.state!=='planned'||q.id==='y0_e37');   /* E37（8/30 政大校門）在法律系階段照常（BB-C 10-18 BUG-E37-TOLAW：8/29 轉法律系時被清掉，8/30 不演、電話也不打）*/
      if(S.START1()){ await S.startLawWeek1(GM,null,{day:G.day,hour:Math.max(h(G),15),econ:true}); await GM.fade(false); if(GM.autosave) GM.autosave(); return true; }   /* 經濟系 8/29 早上轉過來＝8/29 15:00 搬宿舍（不倒退）*/
      G.stage='law'; G.day=1; G.weekday=3; G.hour=21.2; if(E) E.hour=G.hour; G.zone='dorm'; G.weather='clear'; if(E&&E.setWeather) E.setWeather('clear');
      if(GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI},{}); await GM.fade(false); if(GM.autosave) GM.autosave(); return true; }
    finally{ toLawBusy=false; } };
  /* START-WEEK 選 1 的開局（9/1 開學、8/31 搬進宿舍、主線第一天 9/3）：AA_195 的文字（8/31 搬進來、第一週）還沒交，先藏在網址 ?start1 後面（開發測試用）；
     交了以後改成預設。舊存檔不受影響（沒有 MAIN_D1＝主線第一天是 9/17） */
  /* 芷若知不知道祐廷有伴侶（BB_191 9-4 #6；AA_112 8-1）：她的私訊時間（雙方都單身 22:07、她知道 15:10）、宵夜「多帶幾個人」照這個；Z5 三人版看她知不知道可昕（zrGF）*/
  const zrKnows=G=>typeof ROM!=='undefined'&&ROM.knows?ROM.knows(G,'heroine_02').length>0:!!(G.flags&&G.flags.dating_kexin);
  const zrGF=G=>typeof ROM!=='undefined'&&ROM.gfNow?ROM.gfNow(G,'heroine_02'):!!(G.flags&&G.flags.dating_kexin);
  S.START1=()=>!(typeof location!=='undefined'&&/[?&]start0\b/.test(location.search||''));   /* 新遊戲預設＝8/22 宿營（CAMP-L1，使用者 2026-10-16 強制參加、AA_205；經濟系路線的宿營 dc478cb6 做完以後改預設）；?start0＝舊的 9/17 開局（測舊存檔那條路用）*/
  S.LAW_D0=-18; S.MAIN_D1_NEW=-13;   /* 2025-08-29（五）下午搬進宿舍＝新遊戲第一天（使用者 2026-10-16 對 AA-B，AA_195 第 2-0 節 a353a009）；主線第一天 2025-09-03（三）*/
  S.startLawWeek1=async function(GM,recap,o){ o=o||{}; const E=GM.E, G=GM.G, F=G.flags; const d0=S.dayOfKey('2025-08-29'), d=o.day!=null&&o.day>d0?o.day:d0;   /* 新遊戲＝8/29（S.LAW_D0＝−18）；經濟系轉過來的照當天（不倒退）——經濟系玩家哪一天轉、要不要也 8/29 搬，問 AA */
    F.LAW_START_DAY=d0; F.MAIN_D1=S.MAIN_D1_NEW; G.stage='law'; G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=o.hour!=null?o.hour:15; if(E) E.hour=G.hour; G.zone='dorm'; G.weather='clear'; if(E&&E.setWeather) E.setWeather('clear');
    F.fundsV2=1; F.allowanceMonth=S.dateOf(d).m; F.LAW_RECAP_SEEN=true; if(!o.econ) G.money=7000;   /* A10（AA_195 4-7）：新局只放八月剩下的（帳戶約 5,000＋錢包約 2,000）；9/1 照常匯 30,000（allowanceMonth＝8）。經濟系轉過來的錢照舊 */
    if(o.econ&&F.dating_kexin) F.KX_FIRST_MSG=true;   /* 經濟系玩過來的：可昕這一年都在身邊，不補舊存檔用的「休學到重考的那幾個月……」＋「早安。今天讀到哪了？」（使用者存檔 day-15：8/30 18:02 收到「早安」，BUG-DATE-0831-1018）*/
    if(recap&&recap.length) await S.recap(GM,recap);
    G.hour=Math.max(G.hour,16+5/60); if(E) E.hour=G.hour; F.LAW_MOVEIN_DAY=d;   /* AA_195 4-2：8/29（五）16:05 搬進來（新生入住 13:30～17:00）；經濟系轉過來的照當天、不倒退 */
    if(GM.titleCard){ const dt=S.dateOf(d); await GM.titleCard(dt.m+' 月 '+dt.d+' 日（'+'日一二三四五六'[G.weekday%7]+'）',hm(G.hour)+' · 男生宿舍',2000); }   /* 日期卡「8 月 29 日（五）16:05 · 男生宿舍」（AA_195 4-2）*/
    if(GM.say){ const dk=!!o.econ&&typeof ADV!=='undefined'&&!!ADV.begin;   /* 經濟系轉過來的：呼叫的地方黑幕（#fade，z-index 9、會攔點擊）還開著——先開黑底的對話畫面再拿掉黑幕（flow_v0_tolaw 抓到：對話在黑幕下面、點不下去，2026-10-17）*/
      if(dk){ ADV.begin({background:'dark'}); if(GM.fade) await GM.fade(false); }
      if(GM.sceneBegin) GM.sceneBegin(); try{ if(o.econ) await GM.say(null,'你去年也搬過一次宿舍，這次只有一個行李箱。'); await GM.say(null,'行李箱的輪子在宿舍走廊上一直卡到地磚的縫。'); } finally { if(GM.sceneEnd) GM.sceneEnd(); if(dk){ if(GM.fade) await GM.fade(true); if(ADV.active) ADV.end(); } } }   /* 進房間前（AA_195 4-2 第 1 點；經濟系版前面多一句，AA-B 21:09）*/
    if(GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI},{});
    if(GM.say) await kaiMoveIn(GM);
    if(G.day<=S.dayOfKey('2025-08-30')) S.familyW0(G);
    if(G.day<=S.dayOfKey('2025-08-31')) S.kexinEve(G);   /* 8/31 22:10 可昕開學前一晚（BB_168 6-2）*/   /* 8/30 晚上的家族群組（BB_168 6-3）；8/30 以後才轉過來的，9/3 introDorm 補 */ };
  /* 開學前迎新宿營 8/22～24（CAMP-L1；AA_205 第 2～4 節、BB_177 第五版；台詞在 src/data/camp_y1.js）：新遊戲第一段，三天兩夜全部在 2D 畫面演（人不在臺北）。
     一段一個事件，依 CAMP_SEQ 的日子（8/22 起第幾天）與時間跑；每段演完記 F.campStep 並自動存檔——中途被踢回標題或關掉，讀檔回來從下一段接著演（game3d.js applySave 呼叫 S.campY1 resume）。
     開頭：加入「法律系 114 新生（系學會）」群組（8/15 公告、8/21 小隊名單，AA_205 2-2）；演完：回家旁白（2-2）、小隊群組 camp_squad_y1（8/24 21:00 合照、BB_177 13-3、阿哲「29 號見」；8/29 18:00 阿哲，AA_205 6-4）。 */
  S.CAMP_SEQ=[['ev_camp_d1_bus',0,8.5],['ev_camp_d1_ice',0,10.5],['ev_camp_d1_field',0,13.5],['ev_camp_d1_party',0,18],['ev_camp_d1_walk',0,21.5],
    ['ev_camp_d2_quiz',1,7],['ev_camp_d2_water',1,14],['ev_camp_d2_bbq',1,17.5],['ev_camp_d2_fire',1,20],['ev_camp_d2_talk',1,22.5],['ev_camp_d3_quiz',2,7.5],['ev_camp_d3_end',2,10.5]];
  S.metAtCamp=(G,id)=>{ const m=G&&G.social&&G.social.mem&&(G.social.mem[id]||[]).find(x=>x.tag==='FIRST_MET'); return !!(m&&m.note==='camp'); };   /* 在宿營認識的（FIRST_MET 的 note＝camp）：之後第一次見面用宿營版（AA_205 第 4 節）*/
  S.campGroups=function(G,d0){ if(typeof PHONE==='undefined') return; const NEW='g:law_new', SQ='g:camp_squad_y1';
    if(!PHONE.inGroup(G,'law_new')){ PHONE.join(G,'law_new','法律系 114 新生（系學會）');
      PHONE.postAt(G,{th:NEW,from:'law_assoc',name:'系學會',text:'迎新宿營 8/22～8/24，三天兩夜，山上的青年活動中心。新生都要參加，車子、住宿、吃的系學會處理。8/22 早上八點半校門集合。'},d0-7,20);
      PHONE.postAt(G,{th:NEW,from:'law_assoc',name:'系學會',text:'小隊名單｜第七小隊：'+(G.name||'祐廷')+'、張哲維、吳芯慈、郭沛珊、江明軒、許柏翰、凱文'},d0-1,21); }
    if(!PHONE.sent(G,'camp_squad_photo')) PHONE.at(G,d0+2,21,[{th:SQ,text:'（小隊輔傳了一張照片：營地門口，七個人，Kevin 拿著翻到背面的名牌。）'},{th:SQ,from:'camp_leader',name:'小隊輔',text:'照片都在相簿了 自己存'},{th:SQ,text:'（群組裡「凱文」變成「Kevin 大二」）'},
      {th:SQ,from:'kevin',name:'Kevin 大二',text:'改名了 以後叫學長'},{th:SQ,from:'kevin',name:'Kevin 大二',text:'民總考古題我有 開學再說'},{th:SQ,from:'classmate_mingxuan',name:'明軒',text:'（一張他睡在車上的照片，不知道誰拍的）'},{th:SQ,from:'classmate_mingxuan',name:'明軒',text:'這張誰拍的 哈哈'},{th:SQ,from:'zhe',name:'阿哲',text:'29 號見'}],'camp_squad_photo');
    if(!PHONE.sent(G,'camp_squad_829')) PHONE.at(G,d0+7,17.5,[{th:SQ,from:'zhe',name:'阿哲',text:'我在高鐵上了'},{th:SQ,from:'zhe',name:'阿哲',text:'七點到宿舍'}],'camp_squad_829');   /* AA_205 6-4／6-14①：阿哲 19:00 才拖行李進門（AA_208 2-1）；不用回 */ };
  S.CAMP_DAY='2025-08-22';
  S.campCallDue=G=>{ if(!S.isEcon(G)||typeof OUT==='undefined'||(G.flags||{}).CAMP_Y1) return false; const q=OUT.get(G,'y1_camp'), d0=S.dayOfKey(S.CAMP_DAY); return !!q&&q.state!=='done'&&G.day===d0&&G.hour>=8; };   /* 經濟系路線：8/22 08:00 還在家＝直接出發（AA_205 2-3）*/
  S.campY1=async function(GM,o){ o=o||{}; const E=GM.E, G=GM.G, F=G.flags, d0=S.dayOfKey(S.CAMP_DAY); if(d0==null||F.CAMP_Y1) return false;
    const econ=S.isEcon(G); if(econ) F.PLAYED_Y0=true;   /* 經濟系路線（AA_205 2-3）：營地旁白「這個營地你去年來過」看 PLAYED_Y0（轉進法律系時本來也會記）*/
    F.CAMP_Y1_ON=true; const from=F.campStep|0; S.campGroups(G,d0); if(typeof PHONE!=='undefined'&&!PHONE.inGroup(G,'camp_squad_y1')) PHONE.join(G,'camp_squad_y1','第七小隊');
    if(GM.sceneBegin) GM.sceneBegin(); try{
      if(typeof ADV!=='undefined'&&!ADV.active) ADV.begin({background:'dark'});   /* X09（BUG-CAMP-CUT-1018）：字卡疊在黑底上，不露出出發前的 3D（椰林大道、家裡）*/
      if(from===0&&GM.titleCard){ G.day=d0; G.weekday=CALENDAR.dateOf(d0).wd%7; G.hour=8.5; if(E) E.hour=G.hour; await GM.titleCard('2025 年 8 月 22 日（五）','迎新宿營',2200); }
      for(let i=from;i<S.CAMP_SEQ.length;i++){ const [id,off,hr]=S.CAMP_SEQ[i], ev=STORY_EVENTS.find(e=>e.id===id); if(!ev) continue;
        const day=d0+off; if(day!==G.day){ G.day=day; G.weekday=CALENDAR.dateOf(day).wd%7; if(GM.titleCard){ const dt=S.dateOf(day); await GM.titleCard('8 月 '+dt.d+' 日（'+'日一二三四五六'[G.weekday]+'）','迎新宿營 第 '+(off+1)+' 天',1600); } }
        G.hour=hr; if(E) E.hour=hr; if(GM.updateHUD) GM.updateHUD();
        if(typeof ev.before==='function') ev.before(G);
        if(typeof ADV!=='undefined') ADV.begin({background:ev.background||'dark'});
        await EVENTS.run(ev); if(typeof ADV!=='undefined'){ if(ADV.active) ADV.end(); ADV.begin({background:'dark'}); }   /* X09：兩段之間（隔天的字卡）留在黑底，不露出 3D */
        if(econ&&F.dating_kexin&&id==='ev_camp_d2_talk'&&typeof PHONE!=='undefined'&&!PHONE.sent(G,'camp_kx_823')){ G.hour=23+40/60; if(E) E.hour=G.hour;   /* BB_177 第 14 節：8/23 22:00 可昕傳、營地訊號差，熄燈前（23:40）才收到；不用回 */
          PHONE.postAt(G,{th:'p:kexin',from:'kexin',text:'山上冷嗎',tag:'camp_kx_823'},G.day,22); PHONE.postAt(G,{th:'p:kexin',from:'kexin',text:'訊號不好就不用回'},G.day,22); PHONE.postAt(G,{th:'p:kexin',from:'kexin',text:'明天十二點半到校門對吧，到了跟我說一聲'},G.day,22);
          if(typeof ADV!=='undefined') ADV.begin({background:'dark'}); await GM.say(null,'（手機到熄燈前才收到訊息。）'); if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); }
        F.campStep=i+1; if(GM.autosave) GM.autosave(true); }
      if(econ&&F.dating_kexin&&typeof PHONE!=='undefined'&&!PHONE.sent(G,'camp_kx_824')){ G.hour=12.5; if(E) E.hour=G.hour; PHONE.postAt(G,{th:'p:kexin',from:'player',who:null,text:'到了',tag:'camp_kx_824'},G.day,12.5);   /* 8/24 12:30 回到校門（BB_177 第 14 節；照手機現有的自動回覆做法，不讓玩家另外按）*/
        if(typeof ADV!=='undefined') ADV.begin({background:'dark'}); await GM.say(null,'（你傳了一句『到了』給可昕。）'); if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); }
      /* 回家（AA_205 2-2）：8/24 下午；8/25～28 不演 */
      G.day=d0+2; G.weekday=CALENDAR.dateOf(G.day).wd%7; G.hour=15; if(E) E.hour=G.hour;
      if(typeof ADV!=='undefined') ADV.begin({background:'dark'}); if(GM.say) await GM.say(null,'（回到家，你把營地帶回來的衣服丟進洗衣機。）'); if(typeof ADV!=='undefined'&&ADV.active) ADV.end();
      F.CAMP_Y1=true; F.CAMP_Y1_ON=false; delete F.campStep;
    } finally { if(GM.sceneEnd) GM.sceneEnd(); }
    if(o.next!==false) await S.startLawWeek1(GM,null);   /* 接著 8/29 搬宿舍（新遊戲、讀檔接著演都一樣）*/
    return true; };
  /* LIFE-LINE 第 7 組（使用者 2026-10-17 10:4x「經濟系是先發生的，所以就是直接進經濟系啦，沒有選擇的問題」；AA_224 第 7 組 @4e3a7c2b）：
     標題的「新遊戲」直接走經濟系開局（2024-08-23 宿營）。法律系開局只留給網址 ?start1（8/22 法律系宿營）、?start0（舊的 9/17）測試 */
  S.LAW_START_TEST=()=>typeof location!=='undefined'&&/[?&](start0|start1)\b/.test(location.search||'');
  S.newGame=async function(GM,o){ o=o||{}; const E=GM.E, G=GM.G; E.player.busy=false; E.endCinematic(); GM.titleIdle=false; GM.D.busyDepth=0; if(GM.chooseReset) GM.chooseReset(); GM.hideHUD(false);
    if(!o.law&&!S.LAW_START_TEST()&&S.y0Day1()!=null) return S.newGameEcon(GM,{camp:true});   /* o.law：標題「直接從法律系大一開始」（2026-10-18 使用者）*/
    if(S.START1()){ await S.recap(GM,S.LAW_START_RECAP_W1,{keep:true}); await S.campY1(GM); return; }   /* recap keep：回顧完不關 2D，直接接宿營的字卡（X09）*/   /* 新遊戲＝回顧 → 8/22～24 宿營（CAMP-L1）→ 8/29 搬宿舍（預設；?start0 走下面舊的 9/17 開局）*/
    G.day=1; G.weekday=3; G.hour=21.2; G.flags.fundsV2=1; G.flags.allowanceMonth=S.dateOf(1).m; G.zone='dorm'; G.stage='law'; E.hour=G.hour; G.weather='clear'; E.setWeather('clear'); G.flags.LAW_RECAP_SEEN=true; await S.recap(GM,S.LAW_START_RECAP.concat(S.LAW_WEEK12)); await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI},{}); };   /* 法律系開局：④＋③ → 現有的第一天（AA_106 3b）*/
  /* 經濟系開局（交接包 v0；v0 做好以前藏在網址 ?y0 後面，標題畫面照舊只有法律系開局——D81）：2024-09-01（日）晚上，男宿；E01 宿舍第一晚已接（AA_154 A24）*/
  S.newGameEcon=async function(GM,o){ o=o||{}; const E=GM.E, G=GM.G; E.player.busy=false; E.endCinematic(); GM.titleIdle=false; GM.D.busyDepth=0; if(GM.chooseReset) GM.chooseReset(); GM.hideHUD(false); const d=S.y0Day1(); if(d==null) return null;
    G.stage='econ'; G.day=d; G.flags.LIFELINE_V=1; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=21; G.flags.fundsV2=1; G.flags.allowanceMonth=S.dateOf(d).m; G.flags.dating_kexin=false; G.flags.KX_FIRST_MSG=true; G.zone='dorm'; E.hour=G.hour; G.weather='clear'; E.setWeather('clear');
    if(o.camp!==false&&!(typeof location!=='undefined'&&/[?&]y0nocamp\b/.test(location.search||''))){ G.flags.ECON_CAMP_OPEN=true; await S.econCampPrologue(GM); G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=21; E.hour=G.hour; G.flags.allowanceMonth=S.dateOf(d).m; }   /* 第 7 組：新局一律先演 8/23～25 宿營（?y0 的開發按鈕也一樣；?y0nocamp＝舊的 9/1 起點，測試用）*/
    await GM.fade(true); if(GM.titleCard) await GM.titleCard('2024 年 9 月 1 日（日）','開學前一天',2000);   /* AA_168 第 1 節：黑底白字 2 秒 */
    await GM.enter('dorm',{x:-0.5,z:0.5,yaw:Math.PI},{}); await y0FirstNight(GM); };
  /* 第 7 組 7-2：經濟系迎新宿營 2024-08-23～25（AA_224 第 7 組 @4e3a7c2b，AA 定稿）。回顧前三句 → 字卡 → 遊覽車上第一次見到可昕（二選一，E15_BUS）→ CG＋E15 的三句旁白 → 8/25 回家 → 21:00 小隊群組三則 → 開學前那一週一句旁白（接 9/1 E01）*/
  S.econCampPrologue=async function(GM){ const G=GM.G, F=G.flags, E=GM.E; const d0=S.dayOfKey('2024-08-23'); if(d0==null) return false;
    await S.recap(GM,S.LAW_START_RECAP.slice(0,3),{keep:true});   /* X09（BUG-CAMP-CUT-1018，使用者 10-18「去宿營前一秒還在椰林大道」）：回顧完不關 2D，字卡疊在黑底上，不露出 3D */
    G.day=d0; G.weekday=CALENDAR.dateOf(d0).wd%7; G.hour=9; if(E) E.hour=G.hour;
    if(GM.titleCard) await GM.titleCard('2024 年 8 月 23 日（五）','經濟系迎新宿營',2000);
    GM.sceneBegin(); try{
      if(typeof ADV!=='undefined') ADV.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg('tour_bus'):'dark'});   /* X09：遊覽車上（tour_bus，和法律系宿營同一張）*/
      const K={name:'可昕',charId:'kexin'};
      await GM.say(null,'（遊覽車上，你從上車就開始睡。）'); await GM.say(null,'（醒來的時候，旁邊的位子坐著一個女生，手上拿著小隊名單。）');
      await GM.say(K,'你醒了？你是第三小隊的吧。我也是。'); await GM.say(K,'我叫杜可昕。……你睡了一個小時，車子轉彎你都沒醒。');
      const k=await GM.choose([{t:'「……我昨天沒睡。」'},{t:'「妳一直在看我睡覺喔？」'}]); F.E15_BUS=k===0?'nosleep':'watching';
      await GM.say(K,k===0?'看得出來。':'我在看名單。你剛好在名單旁邊。');
      if(typeof SOCIAL!=='undefined'&&SOCIAL.meet){ SOCIAL.meet('kexin','camp'); SOCIAL.meet(XUN,'camp'); }
      if(GM.titleCard) await GM.titleCard('8 月 23 日～25 日','經濟系宿營',1600);
      if(typeof ADV!=='undefined'&&ADV.cg) ADV.cg('cg_econ_camp');
      { const WL={name:'韋綸',charId:'econ_weilun'}, XN={name:'阿勳',charId:XUN};   /* AA_305 第 1 節：三句旁白換成夜遊那段（「晚會上唐睿演了一條需求曲線」拿掉）*/
        for(const [w,t] of [[null,'（經濟系的宿營，山邊的青年活動中心。第三小隊：你、可昕、阿勳、韋綸，小隊輔是家豪學長。）'],[null,'（第二天晚上，夜遊。第三小隊只有一支手電筒，在阿勳手上。）'],
          [WL,'我不怕黑喔。我只是……走中間比較安全。'],[null,'（他一路拉著阿勳的衣服。）'],[XN,'你拉到我的領子了。'],[null,'（樹林裡有東西動了一下。韋綸叫得比扮鬼的學長還大聲。）'],
          [null,'（可昕一直走在你後面。下坡的時候，她說：「你走慢一點。」）'],[null,'（三天裡，大地遊戲你們拿了倒數第二。週日早上，你們七個在活動中心門口自己拍了一張合照。）']]) await GM.say(w,t); }
      if(typeof ADV!=='undefined'&&ADV.cg) ADV.cg(null);
      G.day=d0+2; G.weekday=CALENDAR.dateOf(G.day).wd%7; G.hour=16; if(E) E.hour=G.hour;
      await GM.say(null,'（回到家，你倒在床上，一覺睡到晚上。）');
      if(typeof PHONE!=='undefined'){ const th='g:econ_squad3'; PHONE.join(G,'econ_squad3','經濟系第三小隊'); G.hour=21; if(E) E.hour=G.hour;
        await phoneScene(GM,th,[{from:XUN,name:'阿勳',text:'📷（活動中心門口，七個人的合照）'},{from:'econ_weilun',name:'韋綸',text:'我還在累'},{from:'kexin',name:'可昕',text:'睡飽了嗎第三小隊'}]); }   /* 7-2 第 6 點：玩家不用回。
        在劇情裡演（手機畫面）：原本用 PHONE.at 排 21:00，但宿營接著一路演到 9/1 宿舍第一晚、9/2 起床，中間沒有空檔讓手機送，三則拖到 9/2 早上才出現（flow_v0_start 第 7 組 2026-10-17）*/
      await GM.say(null,'開學前那一週，你在家把要帶去宿舍的東西裝進三個紙箱。');
      F.E15_WENT=true; F.ECON_CAMP_DONE=true;
    } finally { if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); GM.sceneEnd(); }
    return true; };
  /* ---------- v0 E01「宿舍第一晚」（AA_168，含 cdaf8a9f BB-B 改的兩處；ev_y0_dorm_first_night）----------
     9/1（日）21:00 男生宿舍四樓 412：媽媽的訊息 → 阿勳進門、「被子在最下面那一箱」（兩個選項，熟悉 +2；AA_305 第 2 節拿掉冷笑話）→ 22:00 先睡／拆完（E01_NIGHT；拆完自在 +1、02:00 睡＝01:00 以後才睡）
     → 隔天起床（先睡 07:00、拆完 07:40）阿勳說一句（E01_MORNING）；先睡的玩家 9/2 晚上回房間「箱子拆完」那一句（E01_BOXES）。
     演到一半關掉遊戲：E01_DONE 還沒記，下次在房間裡從頭演（y0Tick）。房間的紙箱、阿勳的筆電、保齡球袋等 LAWWW2-B 的模型（V0-ART-DORM）。測試：node tests/v0_e01_unit.js */
  const XUN='econ_zhengxun';
  const xunWho=GM=>{ const n=GM.npc[XUN]; return n?{name:'阿勳',obj:n.obj,charId:XUN}:{name:'阿勳',charId:XUN}; };
  const v0Box=(GM,st)=>{ const z=GM.E&&GM.E.zone; if(z&&z.setV0Box) z.setV0Box(st); };   /* 412 的紙箱（zones3d.js dorm 的 V0-ART-DORM）*/
  async function y0FirstNight(GM){ const G=GM.G, F=G.flags, E=GM.E; if(!S.isEcon(G)||F.E01_DONE||y0Busy) return false; y0Busy=true; let night=null;
    GM.sceneBegin(); GM.letterbox(true);
    try{ G.hour=21; E.hour=G.hour; if(GM.updateHUD) GM.updateHUD();
      v0Box(GM,'onbed'); for(const t of ['開學前一天，晚上九點。男生宿舍四樓，四一二。','媽媽傍晚才走。她把三個紙箱疊在你的書桌上。','她說：「先拆被子。」被子在最下面那一箱。','（另外兩組床桌還是空的，上舖的床架上貼著名字：韋綸、唐睿。）']) await GM.say(null,t);   /* 四人房（AA_208 第 3、6 節）：床在上舖，紙箱疊在書桌上；韋綸、唐睿 9/2 迎新以後才搬進來 */
      GM.advance(2/60); if(typeof PHONE!=='undefined') await phoneScene(GM,'p:mom',[{from:'mom',name:'媽媽',text:'到了要記得吃晚餐。'}]); else await GM.say({name:'媽媽（手機）'},'到了要記得吃晚餐。');
      await GM.say(null,'你已經吃過了。媽媽也知道。');
      const camp=!!F.ECON_CAMP_OPEN;   /* 第 7 組 7-3：宿營就認識阿勳了 */
      await GM.say(null,camp?'門開了。宿營第三小隊的阿勳拿著臉盆走進來，看了你的紙箱一眼。':'門開了。一個很高的男生拿著臉盆走進來，看了你的紙箱一眼。');
      const n=GM.npc[XUN]||GM.spawnCharacter(XUN,0.2,2.6,{yaw:Math.PI,pose:'idle'}); if(n){ GM.face(n,E.player.obj.position.x,E.player.obj.position.z); if(GM.cine){ const P=E.player.obj.position, Q=n.obj.position, mx=(P.x+Q.x)/2, mz=(P.z+Q.z)/2; GM.cine('two',E.player.obj,n.obj,{pos:V(mx-1.0,1.55,mz-1.9),look:V(mx,1.4,mz)}); } }   /* 兩個人都在門口：鏡頭從房間裡面（左邊走道）往門口拍，不從側面推進上舖床或洗手間的隔間（BB_218）*/
      if(!camp&&typeof SOCIAL!=='undefined'&&SOCIAL.meet) SOCIAL.meet(XUN,'dorm');
      const who=xunWho(GM);
      if(camp){ await GM.say(who,'欸，第三小隊的。我們同一間？'); await GM.say(ME(G),'好像是。'); await GM.say(who,'門口的名單，我們兩個排在一起。學號也只差一號。'); }   /* 7-3 */
      else { await GM.say(who,'你好。盧正勳，經濟系。'); await GM.say(who,'叫我阿勳就好。');
        await GM.say(ME(G),'我叫{name}。也是經濟系。');
        await GM.say(who,'我知道。門口的名單，我們兩個排在一起。'); await GM.say(who,'學號也只差一號。'); }
      await GM.say(null,'他把臉盆放好，看了你的紙箱第二眼。');
      await GM.say(who,'被子在最下面那一箱，對不對。');   /* AA_305 第 2 節：三個箱子的冷笑話拿掉（阿勳整個不講冷笑話），換成「被子」兩選一 */
      const i=await GM.choose([{t:'「你怎麼知道？」'},{t:'「……對。」'}]);
      if(i===0) await GM.say(who,'每個人都這樣裝。'); else await GM.say(who,'（點頭）每個人都這樣。');
      if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(XUN,{fam:2});   /* 兩個選項一樣（不記旗標）*/
      await GM.say(null,'他幫你把上面兩箱搬到地上，然後回去自己的桌子，戴上耳機。');
      await GM.fade(true); GM.advance(Math.max(0,22-G.hour)); { const m=GM.npc[XUN]; if(m){ const st=dormSeat('R2'); GM.sitAt(m,st); m.seat=st; m.pose=m.idlePose='sit'; m.frozen=true; } } await GM.fade(false);   /* 時間跳到 22:00（不用旁白說）*/
      v0Box(GM,'bed'); await GM.say(null,'十點了。被子鋪好了，地上還有兩個箱子沒拆。');
      const j=await GM.choose([{t:'先睡。明天再拆。'},{t:'今天拆完。'}]);
      if(j===0){ F.E01_NIGHT='sleep'; v0Box(GM,'foot'); await GM.say(null,'你把兩個箱子推到書桌旁邊的地上。燈還沒關，你就睡著了。');   /* AA_208 第 6 節：床在上舖（原「推到床尾」）*/ night='sleep'; }
      else { F.E01_NIGHT='unpack'; v0Box(GM,'none'); if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(XUN,{comf:1});
        for(const t of ['你拆到第三箱的時候，阿勳已經躺下了。','他的桌燈沒有關。他把燈轉過來，照著你那一邊。','最後一本書放上書架，是兩點。']) await GM.say(null,t);
        GM.advance(Math.max(0,26-G.hour)); night='unpack'; }   /* 02:00 睡：G.hour 26＝01:00 以後才睡（sleepNow 記 lateNight）*/
      F.E01_DONE=true; }
    finally { GM.letterbox(false); GM.sceneEnd(); y0Busy=false; }
    if(night){ await sleepNow(GM,night==='sleep'?7:7+40/60); await y0Morning(GM); }   /* E02 開學典禮假設 09:00：典禮前 2 小時／1 小時 20 分 */
    return true; }
  let y0Busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:y0Busy']=()=>{ y0Busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  async function y0Morning(GM){ const G=GM.G, F=G.flags; if(!S.isEcon(G)||!F.E01_NIGHT||F.E01_MORNING||y0Busy) return false; y0Busy=true; F.E01_MORNING=true;
    GM.sceneBegin(); try{ const n=GM.npc[XUN]||(()=>{ const st=dormSeat('R2'); return GM.spawnCharacter(XUN,st.x,st.z,{seat:st,pose:'sit'}); })(); const E=GM.E; if(n&&GM.cine) GM.cine('two',E.player.obj,n.obj); const who=xunWho(GM);
      const L=F.E01_NIGHT==='unpack'?['你拆到兩點。','你的鬧鐘響了兩次。它快七分鐘，我剛剛對過。']:['你昨天十點就睡了。','經原九點十分，在博雅。'];
      for(const t of L) await GM.say(who,t); }
    finally { GM.sceneEnd(); y0Busy=false; } if(GM.autosave) GM.autosave(); return true; }
  /* 待在房間裡（S.tick）：E01 演到一半關掉遊戲 → 從頭演；起床那一句沒聽到（讀檔）→ 補；先睡的玩家 9/2 晚上回房間 → 箱子拆完那一句 */
  S.y0Tick=function(GM){ const G=GM.G, F=G.flags, d1=S.y0Day1(); if(!S.isEcon(G)||G.zone!=='dorm'||y0Busy||GM.E.player.busy||(GM.D&&GM.D.active)) return false;
    if(G.day===d1&&!F.E01_DONE){ y0FirstNight(GM); return true; }
    if(G.day===d1+1&&F.E01_NIGHT&&!F.E01_MORNING&&h(G)<12){ y0Morning(GM); return true; }
    if(F.E01_NIGHT&&!F.E01_BOXES&&!F.E412_MOVEIN&&(G.day>d1+1||(G.day===d1+1&&h(G)>=17))){ const box=F.E01_NIGHT==='sleep'; F.E01_BOXES=true; F.E412_MOVEIN=true; if(box) v0Box(GM,'none'); y0Busy=true; GM.sceneBegin();   /* 先睡的玩家：箱子拆完那一句；所有人：韋綸、唐睿 9/2 迎新以後搬進來（AA_208 第 3 節）*/
      (async()=>{ if(box) await GM.say(null,'你終於把箱子拆完了。阿勳幫你把空箱子壓扁，拿去樓下回收。'); await GM.say(null,'（韋綸和唐睿搬進來了。韋綸的東西比三個人加起來還多。）'); })().finally(()=>{ GM.sceneEnd(); y0Busy=false; }); return true; }
    return false; };
  S.y0FirstNight=y0FirstNight; S.y0Morning=y0Morning;
  // ---------- 日程與路人 ----------
  /* 路線點可以是 [x,z,層]（v9.4 多樓層）。校園第 6 條（萬才館第二階段）：法學院廣場 → 萬才館大樓梯 → 樓梯頂端平台、弧形陽台（第 1 層）→ 走下來 → 往 z=−60 那條路（原本是新社科院的中庭；X75 社科院搬到霖澤館西南以後是一棟沒有名字的系館）。第 3 條：法學院廣場 → 小椰林道 → 社科院的中庭（X75；原本走到 (8,−40)，現在那裡是社科院圖書館）*/
  /* 公館南側（GG-WALKERS-1023，LAWWW2-B 10-23，騎樓外加了一排機車以後）：路點會隨機偏 ±1 m（extras），原本 z 16.5 那一條偏到 17.5 會擦過機車的車尾、x −30 那一點會進捷運旁的花台 → 改 z 16、那一點移到 x −22；
     多一條廣場上的（繞過圓環北側、停車架和行道樹之間）。每個路點 ±1 m 都站得住（人物半徑 0.33）。騎樓只有 2.4 m 深，±1 m 的偏移放不下，沒有加騎樓裡的路線 */
  const walkRoutes={campus:[[[-112,-7],[-60,-7],[-30,-7],[0,-7],[30,-7],[30,-40],[30,-70],[30,-40],[30,-7],[60,-7]],[[60,7],[20,7],[-20,7],[-70,7],[-110,7],[-70,7],[-20,7]],[[34,-92],[50,-80],[30,-68],[10,-71],[30,-68],[50,-80]],[[-38,9],[-50,14],[-44,19.4],[-32,19.4],[-26,14]],[[92,-62],[80,-62],[60,-62],[36,-62],[60,-62],[80,-62]],[[64,-86,0],[87,-85,0],[87,-99.2,1],[92.5,-100.6,1],[95.5,-100.9,1],[87,-99.2,1],[87,-85,0],[93,-66,0]]],lane118:[[[0,30],[0.8,14],[-0.6,0],[0.6,-16],[0,-36],[0.6,-16],[-0.6,0],[0.8,14]],[[-1.6,-36],[-1.4,-18],[1.4,2],[1.6,20],[0.5,31],[1.6,20],[1.4,2],[-1.4,-18]]],gongguan:[[[-70,-38],[-20,-38],[30,-38],[70,-38],[30,-38],[-20,-38]],[[-70,16],[-22,16],[10,16],[60,16],[10,16],[-22,16]],[[-40,14.5],[0,10],[40,14],[0,10]],[[-72,12],[-60,10],[-48,14.5],[-60,10]],[[-20,12.5],[12,13.6],[22,16],[34,13.6],[52,12],[70,12.5],[52,12],[34,13.6],[22,16],[12,13.6]]],wenzhou:[[[44,-2.4],[20,-2.2],[-6,-2.6],[-30,-2.4],[-6,-2.6],[20,-2.2]],[[-28,2.6],[-4,2.2],[18,2.6],[42,2.4],[18,2.6],[-4,2.2]],[[26,11],[26,4.5],[6,2],[5.8,16],[6,2],[26,4.5]],[[-33.5,10],[-33.5,-1.5],[-12,-1],[-12.2,-14],[-12,-1],[-33.5,-1.5]]]};
  const bikeRoutes={campus:[[[-112,-3],[30,-3],[30,-72],[92,-60],[30,-72],[30,-3]],[[60,3],[-110,3],[60,3]]],gongguan:[[[-70,-12],[70,-12],[70,-2],[-70,-2]]],wenzhou:[[[-29,1.2],[50,1.2],[-29,1.2]],[[50,-1.4],[-29,-1.4],[50,-1.4]]]};
  function h(G){ return G.hour%24; }
  function isThu(G){ return G.weekday===4; }
  function classTime(G){ return isThu(G)&&h(G)>=13.1&&h(G)<15.2; }
  /* 路人的數量（使用者 2026-10-17 P0：「路人數量要再加倍」）：走路的路人、騎車的人、公共建築門口的人流都乘這個；畫質 low／medium 照舊再打折（qf）*/
  S.CROWD_X=2;
  S.populate=function(zoneId,GM){ if(S._bed||darkSave) S.bedClear(GM,'state');   /* 換區域（包括睡醒換房間那一次：onLoaded 再躺回去）：床的狀態、熄燈清掉（DORM-SLEEP-1030）*/ if(typeof CHAR!=='undefined'&&CHAR.anonPool) CHAR.anonPool.refresh(zoneId,GM.E&&GM.E.q&&GM.E.q.level);   /* 換區域：路人底模的池子輪一次（畫質低＝少載一點）*/ const E=GM.E, G=GM.G; const hr=h(G); const day=hr>=6.5&&hr<23; const F=G.flags; const tm=(key,to)=>{ const n=GM.npc[key]; if(n&&(F.afternoonDone||(key==='sis'&&S.sisEarly(G)))) n.until=to; };
    /* 週末回家的第二個入口：校門口（AA_134 第 3 節「宿舍或校門口的『回家』選項」；AA-B 2026-10-16 確認，時段同宿舍：週五 17:00～週日 21:30）。
       位置在校門內側、從公館進校園的出生點 (-119,0) 旁邊（站得住、走得到、不和「走出校門」(-126,0) 半徑 3 重疊；scratchpad gate_check 用 Node 的校園導航格量過）*/
    if(zoneId==='campus'&&typeof HOME!=='undefined') E.interactables.push({x:-120.5,z:2.4,radius:1.0,lv:0,label:'回臺北的家',home:true,get hidden(){ return !HOME.canGo(GM.G); }});
    /* 社團博覽會（activities.js club_expo_y1s1）：椰林大道法服的帳篷前＝學姊那一段（events.js ev_sis_club_expo；AA_218 17-3）——CLUBFAIR-REAL-1027 起和其他十四攤一起放（src/clubfair3d.js，位置表 src/data/club_fair.js）*/
    /* 經濟系大一下搬出宿舍以後（A3 3/29；AA_154 1-3b）：男宿的入口進不去，旁白一句（412 是阿勳一個人的）*/
    if(zoneId==='dorm'&&typeof HOME!=='undefined'&&HOME.breakMode&&HOME.breakMode(G)&&!HOME.at(G)){ const H=HOME.rec(G); H.lbreak=null; H.bskip=null; }   /* 16 週制寒暑假（AA_197 1-3）：住家裡的時候走回宿舍房間＝回宿舍住（原本 AA_183 放假模式藏起宿舍入口，作廢）*/
    if(zoneId==='campus'&&((typeof HOME!=='undefined'&&HOME.baseMode&&HOME.baseMode(G))||(typeof JP!=='undefined'&&JP.movedOut&&JP.movedOut(G)))) for(const it of E.interactables){ if(it.exit&&(it.exit.to==='dorm_hall'||it.exit.to==='dorm')){ delete it.exit; it.onInteract=async()=>{ GM.sceneBegin(); try{ await GM.say(null,'這裡已經不是你的房間了。'); } finally { GM.sceneEnd(); } }; } }   /* 日本路線 2/20 退宿以後（JP.movedOut，AA_341 J-S11）也一樣 */   /* 舊的固定時段（第三天以後）：時段結束時 refreshSchedule 讓他離開（不在玩家眼前）；第一、二天的劇情人物不標 */ let xi=0;
    const qf=E.q.level==='low'?0.5:(E.q.level==='medium'?0.75:1); const extras=(n,pockets)=>{ n=Math.max(2,Math.round(n*S.CROWD_X*qf)); const rs=walkRoutes[zoneId]||[]; for(let i=0;i<n&&rs.length;i++){ const r=rs[i%rs.length]; GM.spawnExtra(extraSpec(xi++),r.map(p=>[p[0]+(rnd()-0.5)*2,p[1]+(rnd()-0.5)*2,p[2]]),{pockets:pockets&&i%3===0}); } };   /* 牽腳踏車的路人拿掉（2026-10-14 使用者試玩 v9.6：「邊走路邊牽腳踏車的人還是很奇怪跟腳踏車重疊」——車掛在走路的人旁邊，手沒有握把手）；路上的腳踏車改成真的在騎的人（riders） */
    const riders=(n)=>{ if(/[?&]noriders\b/.test(location.search)) return;   /* 2026-10-11 使用者回報：騎腳踏車的人其實是「坐姿的人＋腳踏車」一起平移，腳沒踩踏板、看起來像人和車重疊——之後一直關著。
       2026-10-14：騎士換成 BIKE.rider（88c9cdc：和玩家騎車同一套，腳踝在踏板上、手腕在把手上、曲柄照走的距離轉）→ 預設打開，網址加 ?noriders 可以關掉。v9.7 回歸 flow_bike 量過玩家的騎姿（≤5 cm）；路人騎士的瀏覽器畫面還沒看 */ const rs=bikeRoutes[zoneId]||[]; n=Math.round(n*S.CROWD_X); for(let i=0;i<n&&rs.length;i++){ GM.spawnRider(extraSpec(xi+++20),rs[i%rs.length],['#3a6fb0','#8c3b47','#2f5d50','#e0b95b'][i%4]); } };
    if(zoneId==='campus'){ if(day){ extras(hr<19?10:5,true); riders(hr<20?3:1);   /* v9.3 第十八批：校園人太少（原本 7 人走路、2 人騎車）*/
        // 坐在長椅上讀書的人、站著聊天的兩人
        const seats=E.zone.seats||[]; for(const si of [1,4,7,10]){ const st=seats[si]; if(!st) continue; const o=CHAR.build(extraSpec(xi++)); o.position.set(st.x,0,st.z); o.rotation.y=st.yaw||0; E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,seat:st}); }   /* seat：玩家坐長椅時知道這個位子有人（2026-10-18 使用者：椰林大道的長椅還是會坐到有人的位子、直接壓在上面）*/
        if(hr>=10&&hr<17.5){ const o=CHAR.build(extraSpec(xi++)); o.position.set(-18,0,15.4); o.rotation.y=Math.PI; E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true}); }
        const pairs=hr<18?[[-47,13.5],[58,-90]]:[[-47,13.5]]; for(const [px,pz] of pairs){ const a=CHAR.build(extraSpec(xi++)), b=CHAR.build(extraSpec(xi++)); a.position.set(px-0.5,0,pz); b.position.set(px+0.5,0,pz); a.rotation.y=Math.PI/2; b.rotation.y=-Math.PI/2; E.addNPC({obj:a,name:'',beh:'idle',pose:'talk',idlePose:'talk',frozen:true,isExtra:true}); E.addNPC({obj:b,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,pockets:true}); } }
      // 週四上課前：阿哲在霖澤館前等
      if(!S.isEcon(G)&&isThu(G)&&!F.classDone&&hr>=12.5&&hr<13.4){ GM.spawnNPC('zhe',C.zhe,30,-93,{yaw:Math.PI,pockets:true,talk:n=>talkZhe(GM,n)}); }
      // 下課後小安（劇情：由 tick 觸發）；之後在椰林大道散步
      if(F.afternoonDone&&hr>=18&&hr<20.5&&F.companion!=='an'&&!S.awayOnDate('heroine_01',G)){ anTag(G,GM.spawnNPC('an',AN,-20,6,{beh:'wander',waypoints:[[-20,6],[-60,6],[-90,-6],[-40,-6]],talk:n=>talkAn(GM,n)})); tm('an',20.5); }   /* anTag：9/4 她還沒報名字＝「前排的女生」（AA_372 第 4 項）*/
      if(!S.isEcon(G)&&hr>=8+20/60&&hr<9+5/60&&G.weekday>=1&&G.weekday<=5&&(F.afternoonDone||!S.week1Start(G))){ GM.spawnNPC('yu',C.yu,-46,20.94,{seat:{x:-46,z:20.94,yaw:Math.PI},talk:n=>talkYu(GM,n)}); tm('yu',9+5/60); }   /* 傅鐘旁的長椅：平日上課前 08:20～09:05（AA_156 第 4 節，AA-B 15b50992：原本 9:30～12:00 等於每天翹課）；09:10 去上課、週末不在。大二以後「那天早上有課才在」還沒做 */ else if(hr>=15.2&&hr<17.5){ GM.spawnNPC('yu',C.yu,20,-80,{beh:'wander',waypoints:[[20,-80],[40,-78],[10,-60],[48,-70]],talk:n=>talkYu(GM,n)}); tm('yu',17.5); }
      if(F.afternoonDone&&hr>=15.5&&hr<17.5&&F.companion!=='an'&&!F.zheAtNoodle&&!S.awayOnDate('zhe',G)){ GM.spawnNPC('zhe',C.zhe,-60,3,{beh:'wander',waypoints:[[-60,3],[-30,-6],[-90,3],[-20,3]],talk:n=>talkZhe(GM,n)}); tm('zhe',17.5); }   /* 以安、阿哲回老家（absentDates）的日子不出現（HOLIDAY-PRESENCE-1021）*/
      if(F.companion==='an'){ spawnCompanion(GM); } }
    if(zoneId==='lane118'){ const meal=(hr>=11.5&&hr<13.5)||(hr>=17.5&&hr<20); if(hr>=7&&hr<23) extras(meal?5:2,true); }   /* X68（使用者 10-20：118 巷也要遇得到人）：巷子裡的路人，吃飯時間多一點（走巷子中間，walkRoutes.lane118）*/
    if(zoneId==='gongguan'){ extras(hr<22?8:4,true); if(hr>=10&&hr<23) riders(1); if(F.companion==='an') spawnCompanion(GM); }
    if(zoneId==='wenzhou'){ extras(3,true); if(hr>=10&&hr<23) riders(1); if(F.companion==='an') spawnCompanion(GM); if(!S.isEcon(G)&&hr>=19&&hr<21.5&&F.afternoonDone){ GM.spawnNPC('yu',C.yu,23.6,7.94,{seat:{x:23.6,z:7.94,yaw:Math.PI},talk:n=>talkYu(GM,n)}); tm('yu',21.5); } }
    if(zoneId==='classroom'&&E.zone.setBoard){ const BOARD={1:['憲法：基本權的限制','案例：集會遊行的事前許可','比例原則？審查密度？'],2:['刑事訴訟法：證據能力與證明力','案例：夜間詢問取得的自白','§156？§158-2？毒樹果實？'],3:['刑法總則：故意與過失','案例：把行李箱誤認為自己的帶走','§13？§14？構成要件錯誤？'],4:['民法總則：法律行為的成立與生效','案例：網拍標價 1,000 元的相機','要約？要約之引誘？承諾？錯誤？'],5:['法學緒論：法源與法律解釋','案例：「車輛」包不包括電動滑板車？','文義？體系？目的？'],6:['（週末）','教室借給法服社辦活動','—'],0:['（週日）','','']}; const b=(typeof CLS!=='undefined'&&CLS.examBoard?CLS.examBoard(G,'classroom'):null)||BOARD[G.weekday]||BOARD[4]; E.zone.setBoard(b[0],b[1],b[2]);   /* 考試那天進門就是考試的字（BUG-EXAM-BOARD-1021）*/ if(E.zone.clockHand){ const ang=-(hr%12)/12*Math.PI*2; E.zone.clockHand.rotation.z=ang; E.zone.clockHand.position.x=6.2+Math.sin(ang)*0.08; E.zone.clockHand.position.y=3.0+Math.cos(ang)*0.08; } }
    if(zoneId==='classroom'){ const z=E.zone; const inClass=!S.isEcon(G)&&((isThu(G)&&!F.classDone&&hr>=12.5&&hr<15.2)||F.classNow); if(inClass){ GM.spawnNPC('prof',PROF,z.teacherSpot.x,z.teacherSpot.z,{yaw:0,pose:'idle'}); const seats=z.seats; const pick=(r,c)=>seats.find(s=>s.row===r&&s.col===c); anTag(G,GM.spawnNPC('an',AN,0,0,{seat:pick(0,3),talk:n=>talkAn(GM,n)})); GM.spawnNPC('zhe',C.zhe,0,0,{seat:pick(1,4),talk:n=>talkZhe(GM,n)}); GM.spawnNPC('yu',C.yu,0,0,{seat:pick(0,6),talk:n=>talkYu(GM,n)}); const cells=[[0,1],[1,1],[1,6],[2,0],[2,2],[2,5],[2,7],[0,0]]; for(const [r,c] of cells){ const s=pick(r,c); const o=CHAR.build(extraSpec(xi++)); o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,seat:s}); } } else { for(const [r,c] of [[2,1],[1,6]]){ const s=E.zone.seats.find(s=>s.row===r&&s.col===c); const o=CHAR.build(extraSpec(xi++)); o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,seat:s}); } } }
    if(zoneId==='linze'){ const L=LINZE_LAYOUT; const mk=(x,z,lv,yaw,pose,seat)=>{ const o=CHAR.build(extraSpec(xi++)); o.position.set(x,0,z); o.rotation.y=yaw||0; return E.addNPC({obj:o,name:'',beh:'idle',pose:pose||'idle',idlePose:pose||'idle',frozen:true,isExtra:true,lv:lv|0,seat}); };
      if(hr>=8&&hr<21.5){ const ct=L.furniture.find(f=>f.type==='counter'); if(ct&&hr<17) mk(ct.x,ct.z-0.75,0,Math.PI,'idle');   /* 服務台的工讀生 */
        const so=L.furniture.filter(f=>f.type==='sofa'); if(so[0]) mk(so[0].x-0.5,so[0].z-0.05,0,Math.PI,'read',{x:so[0].x-0.5,z:so[0].z-0.05,yaw:Math.PI,y:0}); if(so[1]&&hr>=10) mk(so[1].x+0.4,so[1].z-0.05,0,Math.PI,'read',{x:so[1].x+0.4,z:so[1].z-0.05,yaw:Math.PI,y:0});
        mk(1.2,-3.95,1,0,'idle');   /* 二樓迴廊靠著欄杆往下看的人 */
        /* 上下樓的人（v9.4 多樓層：NPC 照路線走樓梯上二樓、到教室門口、再走下來）*/ const up=[[2,1.5,0],[-6.4,6.0,0],[-6.4,-4.6,1],[-2,-5.6,1],[5.6,-4.6,1],[-6.4,-4.8,1],[-6.6,5.8,0],[4,5.6,0]];
        for(let k=0;k<(hr<18?2:1);k++){ const rt=k?up.slice(3).concat(up.slice(0,3)):up; GM.spawnExtra(extraSpec(xi++),rt,{}); } }
      if(F.companion==='an') spawnCompanion(GM); }
    /* 學姊在總圖、Café 照她的作息出現（AA_284 1-2：原本總圖每天 9～17、Café 每天 19～23、萬才館大廳 15:12～17 固定生成，會同時在兩個地方、週末和 2/2 筆試當天也坐在總圖）；用舊的 sis 生成是為了照舊用 talkSis */
    const sisEnt=z=>schedFor('heroine_05',z,G);
    if(zoneId==='library'){ const seats=E.zone.seats; const se=sisEnt('library'); if(se){ GM.spawnNPC('sis',C.sis,0,0,{seat:seats[2],pose:'read',talk:n=>talkSis(GM,n)}); GM.npc.sis.idlePose='read'; tm('sis',se.to); } if(S.mainDay(G)>=3&&hr>=8&&hr<12&&F.companion!=='an'){ GM.spawnNPC('an',AN,0,0,{seat:seats[8],pose:'read',talk:n=>talkAn(GM,n)}); GM.npc.an.idlePose='read';  tm('an',12); } for(const i of [5,11,14]){ const o=CHAR.build(extraSpec(xi++)); const s=seats[i]; o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true}); } if(F.companion==='an') spawnCompanion(GM); }
    /* 總圖大廳（總圖第一階段，D43）的背景人物：服務台的館員、二樓自習區讀書的人、走大樓梯上下樓的人、一樓走動的人。不是劇情人物、沒有對話 */
    if(zoneId==='library_hall'&&typeof LIBRARY_LAYOUT!=='undefined'){ const L=LIBRARY_LAYOUT; const mk=(x,z,lv,yaw,pose,seat)=>{ const o=CHAR.build(extraSpec(xi++)); o.position.set(x,0,z); o.rotation.y=yaw||0; return E.addNPC({obj:o,name:'',beh:'idle',pose:pose||'idle',idlePose:pose||'idle',frozen:true,isExtra:true,lv:lv|0,seat}); };
      if(hr>=8&&hr<22){ const dk=L.furniture.find(f=>f.type==='desk'); if(dk) mk(dk.x-0.6,dk.z+0.75,0,Math.PI,'idle');
        const sts=E.zone.seats.slice(2); for(const k of (hr<18?[3,8,13]:[8,13])){ const st=sts[k]; if(st) mk(st.x,st.z,1,st.yaw,'read',{x:st.x,z:st.z,yaw:st.yaw,lv:1}); }
        GM.spawnExtra(extraSpec(xi++),[[0,2.0,0],[-2.6,0.2,1],[-8.0,-2.0,1],[-2.6,0.2,1],[0,2.0,0],[2.6,0.2,1],[8.0,-5.0,1],[2.6,0.2,1]],{});   /* 走大樓梯上下樓的人：大廳 ⇄ 二樓（西翼、東翼輪流）*/
        if(hr<18) GM.spawnExtra(extraSpec(xi++),[[6.5,-6.5,0],[2.5,2.0,0],[-3.5,3.0,0],[-7.0,-6.5,0]],{}); }
      if(F.companion==='an') spawnCompanion(GM); }
    /* 法律學院圖書館（D46，2026-10-13）的背景人物：櫃台的館員、一樓自習區和二樓讀書的人、走樓梯上下樓的人。不是劇情人物、沒有對話 */
    if(zoneId==='lawlib'&&typeof LAWLIB_LAYOUT!=='undefined'){ const L=LAWLIB_LAYOUT; const mk=(x,z,lv,yaw,pose,seat)=>{ const o=CHAR.build(extraSpec(xi++)); o.position.set(x,0,z); o.rotation.y=yaw||0; return E.addNPC({obj:o,name:'',beh:'idle',pose:pose||'idle',idlePose:pose||'idle',frozen:true,isExtra:true,lv:lv|0,seat}); };
      if(PLACES.isOpen('lawlib',hr,G.day)){ const C=L.counter; mk(C.staff.x,C.staff.z,0,C.staff.yaw,'idle');
        const ss=E.zone.seats||[]; const pick=(tb,k)=>ss.filter(q=>q.table===tb)[k]; const busy=hr<18?[['T1',1],['T1',6],['T2',3],['carrel',2],['T6',1],['T3',0]]:[['T1',2],['carrel',0],['T5',3]];
        for(const [tb,k] of busy){ const st=pick(tb,k); if(st) mk(st.x,st.z,st.lv,st.yaw,'read',{x:st.x,z:st.z,yaw:st.yaw,lv:st.lv}); }
        GM.spawnExtra(extraSpec(xi++),[[2.0,4.6,0],[-6.2,1.6,0],[-4.2,1.6,1],[1.6,-1.8,1],[-4.2,1.6,1],[-6.2,1.6,0],[3.0,5.6,0]],{}); }   /* 一樓 → A 跑 → 平台 → B 跑 → 二樓書庫 → 走回一樓 */
      if(F.companion==='an') spawnCompanion(GM); }
    /* 社科院圖書館（D56 社科院第①步，2026-10-13）的背景人物：服務台的館員、閱覽長桌和窗邊讀書的人、在書架之間走的人。不是劇情人物、沒有對話。
       開館時才有人（開放時間：src/data/places.js，D62 使用者 2026-10-14 查證館方網頁）*/
    if(zoneId==='soclib'&&typeof SOCLIB_LAYOUT!=='undefined'){ const L=SOCLIB_LAYOUT; const mk=(x,z,yaw,pose,seat)=>{ const o=CHAR.build(extraSpec(xi++)); o.position.set(x,0,z); o.rotation.y=yaw||0; return E.addNPC({obj:o,name:'',beh:'idle',pose:pose||'idle',idlePose:pose||'idle',frozen:true,isExtra:true,lv:0,seat}); };
      if(PLACES.isOpen('soclib',hr,G.day)){ const dk=L.desk; mk((dk.x0+dk.x1)/2-0.8,(dk.z1+dk.staff.z1)/2-0.6,Math.PI,'idle');
        const ss=E.zone.seats||[]; const pick=(kind,k)=>ss.filter(q=>q.kind===kind)[k]; const busy=hr<18?[['table',1],['table',8],['table',14],['table',21],['window',4],['window',12],['window',27],['lounge',2]]:[['table',6],['window',9],['window',20]];
        for(const [kind,k] of busy){ const st=pick(kind,k); if(st) mk(st.x,st.z,st.yaw,'read',{x:st.x,z:st.z,yaw:st.yaw,lv:0}); }
        GM.spawnExtra(extraSpec(xi++),[[-9,6.6,0],[-6,3.6,0],[0.5,1.0,0],[9,-2.5,0],[7,-9,0],[-6,-9,0],[-12.5,-3,0],[-11.5,3.5,0]],{}); }   /* 閘門內 → 長桌南邊 → 林間書房之間 → 北邊窗前的走道 → 西邊窗前 → 回到入口（tests/nav_soclib_unit.js 檢查每一段走得到）*/
      if(F.companion==='an') spawnCompanion(GM); }
    if(zoneId==='dorm_hall'&&typeof DORM_LAYOUT!=='undefined'){ const L=DORM_LAYOUT; const boy=()=>{ if(xi%2===0) xi++; return extraSpec(xi++); };   /* 男生宿舍：路人都是男生（extraSpec 奇數＝男）*/
      const mk=(x,z,lv,yaw,pose,seat)=>{ const o=CHAR.build(boy()); o.position.set(x,0,z); o.rotation.y=yaw||0; return E.addNPC({obj:o,name:'',beh:'idle',pose:pose||'idle',idlePose:pose||'idle',frozen:true,isExtra:true,lv:lv|0,seat}); };
      if(hr>=7&&hr<23){ const ww=L.furniture.find(f=>f.type==='wardenWindow'); if(ww) mk(ww.x-1.25,ww.z,0,Math.PI/2,'read',{x:ww.x-1.25,z:ww.z,yaw:Math.PI/2,lv:0}); }   /* 舍監室窗口裡值班的工讀生（隔著玻璃看得到）*/
      if(hr>=7&&hr<24){ GM.spawnExtra(boy(),[[0,4.6,0],[-0.8,0,0],[0,-5.2,0],[1.4,0.2,1],[-9.5,0.2,1],[9.5,-0.2,1],[1.4,0.2,1],[0,-5.2,0],[-0.8,0,0]],{});   /* 走樓梯上下樓的人：門廳 ⇄ 二樓走廊 */
        const brk=typeof HOME!=='undefined'&&HOME.lawBreak&&!!HOME.lawBreak(G);   /* 寒暑假（AA_197 1-3）：大廳、走廊的路人少一半 */
        if(!brk) GM.spawnExtra(boy(),[[-12.4,0,0],[12.4,0,0]],{});   /* 一樓走廊來回 */
        if(hr>=12&&!brk){ const st=E.zone.seats[1]; if(st) mk(st.x,st.z,0,st.yaw,'read',{x:st.x,z:st.z,yaw:st.yaw,lv:0}); }
        if(hr>=19){ const sf=L.furniture.find(f=>f.type==='sofa'); if(sf) mk(sf.x,sf.z,0,sf.ry,'sit',{x:sf.x,z:sf.z,yaw:sf.ry,lv:0}); } } }
    if(zoneId==='cafe'){ const seats=E.zone.seats; const z3=S.z3Pending(G), shut=S.Z3_SHUT, quiet=z3&&hr>=shut&&hr<22;   /* 芷若 Z3（BB_96 3-1）還沒發生的平日：21:40 起店裡只剩祐廷——之前進來的客人 21:40 起身走出去（until）、21:40～22:00 不生成（S.z3Pending）*/
      { const se=sisEnt('cafe'); if(se&&!quiet){ GM.spawnNPC('sis',C.sis,0,0,{seat:seats[5],pose:'read',talk:n=>talkSis(GM,n)}); GM.npc.sis.idlePose='read'; tm('sis',z3&&hr<shut?Math.min(shut,se.to):se.to); } } for(const i of S.cafeCustomers(G,seats)){ if(S.cafeQuiet(G)) continue; const o=CHAR.build(extraSpec(xi++)); const s=seats[i]; o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; const x=E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,cafeCust:i,seat:{x:s.x,z:s.z,yaw:s.yaw,lv:0}}); if(x&&z3&&hr<shut) x.until=shut; }   /* 客人坐的位子算有人坐（seat），玩家不會坐到同一張椅子；cafeCust＝坐哪一號（待在店裡時 S.cafeRefresh 照時段補人、讓人走）*/ if(F.companion==='an') spawnCompanion(GM); }
    /* 店員（2026-10-11 使用者回報：便利商店、麵店、書店都沒有人顧店）：站在櫃台後面、工作台前；只是讓店有人在顧，不加對話和劇情（結帳還是櫃台的互動點）。
       外觀用路人模型（extraSpec：偶數＝女性、奇數＝男性）；年紀比較大的老闆娘、老闆要等有中年人物模型（MISSING_EXTERNAL_ART）*/
    { const clerk=(x,z,yaw,i,kind)=>{ const sp=kind&&typeof SUP519!=='undefined'&&SUP519.clerkSpec?SUP519.clerkSpec(kind,G):null; const o=CHAR.build(sp||extraSpec(i)); o.position.set(x,0,z); o.rotation.y=yaw; const n=E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,clerk:true}); if(sp&&n&&SUP519.clerkWire) SUP519.clerkWire(GM,n,kind,sp.aa519Who); };   /* kind：麵店、Café 的店員換成阿姨、老闆的外觀，能說話（AA_519 1-1、3-1，src/sup519_3d.js）；第 9 節第 3 點：2027-06-04 起 Café 照班表，芷若原本的班是小婷 */
      if(zoneId==='cvs') clerk(4.0,-2.35,0,41);              // 櫃台（(4,-1.5)、寬 3 m）後面，面向結帳的客人
      if(zoneId==='noodle') clerk(-2.0,-2.75,Math.PI,40,'noodle');    // 廚房工作台前，面向湯鍋（AA_519 1-1：阿姨）
      if(zoneId==='bookstore') clerk(0.55,1.95,0,43);       // 門口那張桌子（像櫃台）後面，面向門口
      /* 2026-10-14 使用者試玩 v9.6：「有一些店面還是沒有店員」——兩點半在芷若沒班的時段吧檯沒人、總圖服務台沒有館員 */
      if(zoneId==='cafe') clerk(-0.6,-5.25,0,44,'cafe');           // 吧檯後面靠東邊（芷若上班時站中間 (-2.5,-5.15)，兩個人不重疊；咖啡機在西邊 (-4.5,-4.8)）。AA_519 3-1：老闆（男、中年、馬克杯）
      if(zoneId==='library_hall'&&typeof LIBRARY_LAYOUT!=='undefined'){ const d=(LIBRARY_LAYOUT.furniture||[]).find(f=>f.type==='desk'); if(d) clerk(d.x,d.z+d.d/2+0.45,Math.PI,45); }   // 服務台後面（兩片隔板中間），面向借書的人
      /* 2026-10-18 使用者：「一盞也沒有店員？任何一個店都要有店員」（BUG-NO-CLERK-1018）：溫州街三家照 WZ_SHOPS_LAYOUT 的打工位置 */
      if(zoneId==='wz_brunch') clerk(2.6,-2.05,-0.6,46);   // 結帳櫃台（(2.6,-1.1)，客人站西邊 (1.95,-1.1)）北端、廚房門口，面向結帳的客人
      if(zoneId==='wz_print') clerk(-0.9,0.4,0,47);        // 櫃台後面（打工時坐的位置），面向印東西的客人
      if(zoneId==='wz_teahouse') clerk(2.95,1.3,-Math.PI/2,48);   // 水屋（泡茶的地方），面向茶室
      /* 林家乾麵、巷子裡定食（AA_364）：店員站在室內配置的 clerk（林家：攤車後面、面向街上；定食店：吧台後面的廚房、面向客人；LAWWW2 WZ-SHOP-AA364-ART）。林家是老闆（男，奇數）*/
      if((zoneId==='wz_lin'||zoneId==='wz_teishoku')&&typeof WZ_SHOPS_LAYOUT!=='undefined'){ const LL=WZ_SHOPS_LAYOUT[zoneId.slice(3)]; if(LL&&LL.clerk) clerk(LL.clerk.x,LL.clerk.z,LL.clerk.yaw,zoneId==='wz_lin'?49:64); }
      /* 巷口茶飲、夏日冰菓室的外帶窗口（AA_364）：開門的時候店員在窗口裡面（WZS.WINDOW；冰菓室 10～4 月鐵捲門拉著＝沒有人）；冰菓室是老闆娘（女，偶數）；茶飲窗口是 SQ02 那位女店員（88，closed2_3d.js 研討室 B 同一個外觀；AA 10-24 9a033f397）*/
      if(zoneId==='wenzhou'&&typeof WZS!=='undefined'&&WZS.WINDOW&&WZS.windowClerk){ for(const [k,i] of [['tea',88],['ice',66]]){ const w=WZS.WINDOW[k]; if(w&&w.clerk&&WZS.windowClerk(k,G)) clerk(w.clerk.x,w.clerk.z,w.clerk.yaw,i); } }
      if(/^l118_/.test(zoneId)&&typeof L118_SHOP_LAYOUTS!=='undefined'){ const ids=Object.keys(L118_SHOP_LAYOUTS), LL=L118_SHOP_LAYOUTS[zoneId.slice(5)]; if(LL&&LL.clerk) clerk(LL.clerk.x,LL.clerk.z,LL.clerk.yaw,70+ids.indexOf(zoneId.slice(5))); }   /* 118 巷九間店：店員在店裡、站在室內配置的 clerk（LAWWW2-C，LANE118-SHOPS-1020）；每間店換一個路人底模（AA_311 的店員外觀之後接）*/
      if(zoneId==='lane118'&&typeof L118_SHOP_LAYOUTS==='undefined'&&typeof L118!=='undefined'&&typeof LANE118_LAYOUT!=='undefined'){ let k=0; for(const sh of LANE118_LAYOUT.shops){ k++; let open=false; try{ open=L118.isOpen(sh.id,G); }catch(e){} if(!open) continue; const W=sh.side==='W', fx=W?LANE118_LAYOUT.facade.west+0.35:LANE118_LAYOUT.facade.east-0.35;
        clerk(fx,(sh.z0+sh.z1)/2+1.1,W?Math.PI/2:-Math.PI/2,50+k); } }
      if(zoneId==='us_market'){ clerk(-7.45,10.8,-Math.PI/2,61); clerk(-1.45,10.8,-Math.PI/2,62); }   // 美國草原超市：1、3 號收銀台（收銀機旁邊），面向輸送帶
      if(zoneId==='us_asian_market') clerk(-4.5,2.7,0,63); }   // 竹葉亞洲超市：櫃台後面，面向門口。118 巷九間：有室內配置以後店員在店裡（上面 l118_<id>）；沒有室內配置才站在店門口旁邊
    if(zoneId==='us_market_street'&&typeof US_MARKET_STREET_LAYOUT!=='undefined'){ const rs=S.usStreetRoutes(US_MARKET_STREET_LAYOUT), n=Math.max(1,Math.round((hr>=8&&hr<20?7:(hr>=6.5&&hr<22?4:1))*S.CROWD_X*qf));   /* 超市街的路人（US-MARKET-CROWD-1021）：白天 7、早晚 4、深夜 1（照畫質）*/
      for(let i=0;i<n&&rs.length;i++){ const r=rs[i%rs.length]; GM.spawnExtra(extraSpecUS(xi++),r.map(p=>[p[0]+(rnd()-0.5)*0.4,p[1]+(rnd()-0.5)*0.3,p[2]]),{pockets:i%3===0}); }
      if(typeof US_TRAFFIC!=='undefined'&&US_TRAFFIC.start) US_TRAFFIC.start(GM); }   /* 馬路上的車（src/us_traffic3d.js）：紅綠燈、讓人、跟車 */
    if(zoneId==='noodle') noodleRegulars(GM,true);   /* 週二、週四傍晚的固定客人（AA_110 6-3）：進店時已經坐著 */
    if(/^linze_[34]f$/.test(zoneId)&&typeof LZUP!=='undefined'){ try{ LZUP.populate(GM,true); }catch(e){ console.warn('LZUP.populate',e); } }   /* 霖澤館 3F、4F：在討論、吃東西、自習的同學（src/linze_upper3d.js）*/
    if(zoneId==='library_b1'&&typeof LB1!=='undefined'){ try{ LB1.populate(GM,true); }catch(e){ console.warn('LB1.populate',e); } }
    if(zoneId==='library_stacks'&&typeof LUP!=='undefined'){ try{ LUP.populate(GM,true); }catch(e){ console.warn('LUP.populate',e); } }   /* 總圖 5F 書庫：窗下閱覽桌的讀者（src/library_upper3d.js）*/   /* 總圖 B1：24 小時自習室在讀書的同學（src/library_b1_3d.js）*/
    if(zoneId==='noodle'){ if(F.afternoonDone&&hr>=17.5&&hr<20.5&&!F.zheNoodleDone){ GM.spawnNPC('zhe',C.zhe,0,0,{seat:{x:0,z:-0.3,yaw:0},talk:n=>talkZhe(GM,n)}); F.zheAtNoodle=true; } }
    if(zoneId==='dorm'){ for(const [id,u] of S.dormWho(G)) S.dormSpawn(GM,id,u,false);   /* 進房間：現在在書桌前的室友坐好（誰、幾點照 S.dormWho；待在房間裡時間到了自己進門、上床：S.dormLive，DORM203-MATES-1028）*/   /* 經濟系那一年的室友是阿勳（AA_168 第 5 節；阿凱這一年不出現）；E01 還沒演完時由 E01 自己帶他進門 */   /* 阿凱回宜蘭過年（absentDates，BB_171）的晚上不在房間（HOLIDAY-PRESENCE-1021）；AA_374 第 1 項：只有大一同房（9/6 搬進 312 以後他住別棟）*/   /* AA208-L（AA_208 2-4）：四人房的室友晚上在房間；23:30 以後都在上舖（看不到）。誰、幾點照 S.dormMates */
      if(!S.isEcon(G)){
      if(typeof HOME!=='undefined'){ const hs=(E.zone&&E.zone.spots&&E.zone.spots.home)||[2.35,-0.9]; E.interactables.push({x:hs[0],z:hs[1],radius:0.6,prio:0.3,lv:0,label:'收拾背包回臺北的家',home:true,get hidden(){ return !HOME.canGo(GM.G); }}); } } }   /* 週末回家（AA_137 第 6 節）：週五 17:00 以後到週日 21:30 才出現（四人房：門口鞋櫃旁）*/
    if(zoneId==='wancai'){ if(isThu(G)&&hr>=15.2&&hr<16.2){ GM.spawnNPC('prof',PROF,-5,1.2,{yaw:0,talk:n=>talkProf(GM,n)}); }   /* 週三晚上 18:48 學姊在萬才館（法服讀書會）拿掉：讀書會停用（AA_236 A1），她週三晚上在法圖（作息）*/
      /* 萬才館室內兩層樓（第三階段，D42）的背景路人：一個照路線上下樓（一樓大廳 → 樓梯 → 二樓門廳 → 走廊的研討室門口 → 走回一樓），一個在二樓走廊靠著欄杆往下看。不是劇情人物、沒有對話 */
      /* 法服週六值班（V1-F：AA_163 第 1 節、BB_145）：單週週六 9～12、第 3 週起、考試週停（S.fafuDuty）。社長（大二起學長）在圓桌、研究所學長和學姊、民眾一到兩位（路人底模、名字照 AA_163）；
         大一可以在旁邊看（「在旁邊看法服值班」，S.fafuWatch）。門口的告示照有沒有值班寫下一次的日期 */
      if(S.fafuDuty(G)&&hr>=9&&hr<12){ const ex=(nm,x,z,ry)=>{ const o=CHAR.build(extraSpec(xi++)); o.position.set(x,0,z); o.rotation.y=ry; E.addNPC({obj:o,name:nm,beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,lv:0}); };
        ex(S.fafuLead(G),0.95,1.25,-0.6); ex('研究所學長',-0.95,1.25,0.6); ex('雅筑學姊',-1.2,2.6,1.9); ex('民眾',0,2.85,Math.PI); if(G.day%2===0) ex('民眾',0.95,2.75,-2.2);   /* 圓桌帶的人＝S.fafuLead（社長／學長；學姊四年都不在，AA_238 第 2 節）*/
        if(S.fafuWatchable(G)) E.interactables.push({x:2.3,z:3.1,radius:1.3,lv:0,label:'在旁邊看法服值班',fafuWatch:true,get hidden(){ return !S.fafuWatchable(GM.G)||GM.G.hour>=12; }});
        if(S.fafuMember(G)) E.interactables.push({x:-1.6,z:3.4,radius:1.3,lv:0,label:'坐到圓桌（做初談紀錄）',fafuShift:true,get hidden(){ return !S.fafuShiftable(GM.G); }}); }
      if((G.stage||'law')==='law') E.interactables.push({x:-2.2,z:5.8,radius:0.7,lv:0,label:'看門口的告示',get look(){ return S.fafuNotice(GM.G); }});
      if(E.levels&&hr>=8&&hr<21.5){ GM.spawnExtra(extraSpec(xi++),[[3,4.6,0],[-6.2,5.4,1],[1.5,-6.0,1],[-6.2,5.4,1],[2.5,5.0,0]],{});
        const o=CHAR.build(extraSpec(xi++)); o.position.set(2.6,0,-2.35); o.rotation.y=0; E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,lv:1}); } }
    if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'){ try{ if(zoneId==='campus') CLS.addDoors(GM,'campus'); if(CLS.addActSpots) CLS.addActSpots(GM,zoneId);   /* 活動的集合點（AA_110 6-3）*/ if(CLS.addActHints) CLS.addActHints(GM,zoneId);   /* 今天沒有的社課（系籃練球）：集合點寫星期幾幾點（BBALL-PRESENT-1030）*/ if(zoneId==='classroom'&&!F.classNow&&!(isThu(G)&&!F.classDone)) CLS.syncRoom(GM,{instant:true}); if(E.zone&&(E.zone.layout||E.zone.glbRoom)) CLS.syncRoom(GM,{instant:true});   /* 剛走進來（換區域）：照現在的時間直接坐好、老師站好（CLASS-TEACHER-1027：原本 36 分鐘內再走進同一間＝當成一直待著，晚到的人看到老師從門口走進來）*/   /* 建築裡的教室（共同教學館…，D55）；GLB 教室（萬才館多功能教室、霖澤館 202：rooms_glb3d.js 的 glbRoom）也是進來就坐好（原本要等 CLS.tick 第一次同步）*/ }catch(e){ console.warn('CLS populate',e); } }   /* 課表（D52）：共同教學館、體育館的門口；201 上課時的同學 */
    if(typeof CROWD!=='undefined'){ try{ CROWD.enter(GM,zoneId); }catch(e){ console.warn('CROWD.enter',e); } }   /* 公共場景的人流（D55）：照現在的時間直接排好；同一天同一時段進出看到同一批人 */
    GM_ref=GM; if(G.social){ try{ populateSchedule(zoneId,GM); }catch(e){ console.warn('schedule populate failed',e); } }
    if(zoneId==='lane118'&&typeof L118!=='undefined'){ try{ L118.populate(GM); }catch(e){ console.warn('L118.populate',e); } }   /* 118 巷：常客、約好的午餐站到店門口（AA_280 第 3、4 節）*/
    if(/^l118_/.test(zoneId)&&typeof L118!=='undefined'&&L118.populateShop){ try{ L118.populateShop(GM,zoneId.slice(5)); }catch(e){ console.warn('L118.populateShop',e); } }   /* 走進店裡：在門口等的常客、約好的午餐坐在店裡（LANE118-SHOPS-1020）*/
  };
  // ---------- 資料驅動的 NPC 日程（CHARACTERS[*].daily_schedule）與不熟同學 pool ----------
  const LEGACY_IDS=['heroine_01','heroine_05','zhe','yu','kai','prof_zhou'];
  const CLUB_SPOTS=[[-3,3.6],[3,3.6],[0,4.6],[-6,0.5],[6,0.5],[-1.5,-2.5]]; const TA_SPOT=[2.6,-4.5];
  const LEGACY_ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'};
  /* 這個人現在該不該在這個區域：回傳日程那一筆（或教授的 {prof}），不該在就 null。進入區域（populateSchedule）和待在區域裡補人（refreshSchedule）共用同一套規則 */
  /* 這個人現在照作息在哪一筆——一個人同一時間只有一筆（2026-10-13：原本進區域時是「這個區域的第一筆」、人物線索是「全部的第一筆」，兩筆時間重疊時
     同一個人會在兩個地方都生出來，例如芷若週五 14–15 點 Café 和校園）：
     ・寫了 terms 的只在那幾個學期的上課期間（寒暑假不算），而且比沒寫的優先（AA_110 5-7 芷若大一上的週五）；
     ・上課（act:'class'）和 noHoliday 的只在上課期間、國定假日不算（和課表一樣停課）；
     ・zone:null＝不在遊戲的場景裡（away 是人物線索的文字，例如「在小福吃午餐」）*/
  function schedEnt(c,G){ if(typeof INV!=='undefined'&&INV.entryFor&&c&&c.id){ const iv=INV.entryFor(G,c.id); if(iv) return iv; }   /* 約好的時間人在那裡、一起走過去的人跟著你（src/invites3d.js）*/
    if(typeof GROUP!=='undefined'&&GROUP.tripAway&&c&&c.id){ const ta=GROUP.tripAway(G,c.id); if(ta) return ta; }   /* 麵店團出遊那天（大二春假 4/4），去的人作息停掉（AA_375 第 14 項；src/group3d.js）*/
    const tp=!!(c&&c.presence&&S.presence(c.id,G).kind==='taipei');   /* 在臺北、不在台大（BB_163）：只用標了 taipei 的那幾筆作息（taipei:'both'＝兩種時候都用）、不跟課表 */
    if(!tp){ const cc=S.classmateClass(c,G); if(cc) return cc; }   /* 同班同學：必修課的時間在那間教室（使用者 2026-10-15：以安也是大一，課要跟我一樣） */
    const hr=h(G), wd=G.weekday; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, hol=!!(typeof CALENDAR!=='undefined'&&CALENDAR.holiday(G.day));
    const hit=ent=>{ if(!((ent.termDays&&T&&ent.termDays[T.id])||ent.days).includes(wd)) return false; if(ent.holOff&&hol) return false;   /* termDays：某一學期換星期（以安 D09 大四上 11/12 週日，AA_509 0-2 第 9 點）；holOff：國定假日、春節不在（寒暑假照常，子晴的工作室）*/ let A=null; if(ent.activity&&typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list){ const a=ACTIVITIES.list.find(x=>x.id===ent.activity); if(!a||!ACTIVITIES.on(a,G.day,G)) return false; A=a; } else if(ent.actHours) return false;   /* actHours：時間照那個活動的 t0～t1（學姊在社團博覽會：日期、時間都讀 activities.js，SIS-EXPO-PRESENCE-1027）*/   /* activity：那個活動當天有開才在（學姊的法服讀書會：第 5 週起；使用者 2026-10-15 第 3 週去，學姊站在那裡、沒有活動）*/ if((ent.act==='class'||ent.noHoliday)&&(!T||hol)) return false; { const wk=(ent.termWeeks&&T&&ent.termWeeks[T.id])||ent.weeks; if(wk&&(!T||!wk.includes(T.week))) return false; }   /* termWeeks＝某一學期改用別的週次（AA_373 #5：Alison 烏來大一下改第 8 週 4/18）*/ if(ent.dates&&!S.inDates(G,ent.dates)) return false; if(ent.notDates&&S.inDates(G,ent.notDates)) return false;   /* notDates：這幾段日子不在（含頭尾；芷若 2027-06-04～09-02 不上班，AA_375 第 1 項）*/ if(ent.vacation&&!(typeof HOME!=='undefined'&&HOME.breakOf&&HOME.breakOf(G.day))) return false;   /* dates：日期區間（含頭尾）；vacation：只在寒暑假（AA_271 自由出行第三批的偶遇）*/ if(ent.if&&!(typeof EVENTS!=='undefined'&&EVENTS.cond&&EVENTS.cond(ent.if))) return false; const to=ent.actHours&&A?A.t1:ent.to, from=ent.actHours&&A?A.t0:ent.from;   /* if：條件成立才在（AA_155：阿勳、品妤 P4d 之後才在走廊；寫法和閒聊階梯的 if 一樣）*/   /* weeks：學期的第幾週才有（子晴的吉他社：第 5～7、10～16 週）*/ return to<=24?(hr>=from&&hr<to):(hr>=from||hr<to-24); };
    const L=(c.daily_schedule||[]).filter(ent=>tp?!!ent.taipei:ent.taipei!==true); for(const ent of L) if(ent.pri&&hit(ent)) return actEnt(ent);   /* pri：比有 terms 的作息還優先（學姊在社團博覽會）*/
    if(S.SCHED_WITH&&c&&c.id){ const w=S.SCHED_WITH(c,G,hit,L,T); if(w) return w; }   /* 女主角的圈子（src/hcircle3d.js，HEROINE-CIRCLE3D-1028）：她的作息那一筆帶 with、那一列成立的時候，同伴自己的作息不在那一區＝跟著她（上課、約好的時間、出遊、pri 照舊優先）*/
    for(const ent of L) if(ent.terms&&T&&ent.terms.includes(T.id)&&hit(ent)) return ent; for(const ent of L) if(!ent.terms&&hit(ent)) return ent; return null; }
  S.schedEnt=schedEnt; S.SCHED_WITH=null;
  /* actHours 的那一筆：from／to 換成活動的時間（手機的地點寫「到 幾點」、時段快結束不補人都照活動）；同一個活動時間回傳同一個物件（作息比對用 ===）*/
  const ACT_ENT=new WeakMap();
  function actEnt(ent){ if(!ent.actHours||typeof ACTIVITIES==='undefined'||!ACTIVITIES.list) return ent; const a=ACTIVITIES.list.find(x=>x.id===ent.activity); if(!a) return ent;
    let c=ACT_ENT.get(ent); if(!c||c.from!==a.t0||c.to!==a.t1){ c=Object.assign({},ent,{from:a.t0,to:a.t1}); ACT_ENT.set(ent,c); } return c; }
  /* 兩點半的客人（X71，使用者 2026-10-20：「咖啡店以前很常有NPC現在都沒有」——學姊改照作息以後，店裡常常只剩一位客人）：
     照時段 1～3 位、坐一般桌（不坐吧檯高腳椅、沙發，不坐學姊的位子 5）；同一天同一時段進出是同一批（D55，照日期輪），沒有座位資料照舊只有 6 號 */
  S.cafeCustomers=function(G,seats){ const hr=h(G); if(!Array.isArray(seats)||!seats.length) return [6];
    const ok=seats.map((q,i)=>i).filter(i=>i!==5&&seats[i]&&!seats[i].bar&&!seats[i].sofa); if(!ok.length) return [];
    const n=hr>=11&&hr<14?3:(hr>=14&&hr<18?2:(hr>=18&&hr<22?3:1)); const off=(((G.day|0)*5)%ok.length+ok.length)%ok.length, out=[];
    for(let k=0;k<ok.length*3&&out.length<n;k++){ const i=ok[(off+k*3+Math.floor(k/ok.length))%ok.length]; if(!out.includes(i)) out.push(i); } return out; };
  /* Café 不進客人的時候：芷若 Z3（BB_96 3-1）還沒發生的平日 21:40～22:00（店裡只剩祐廷）；兩段感情攤牌那晚（1A-02，ev_two_hearts_cafe「打烊後」）*/
  S.cafeQuiet=function(G){ const hr=h(G); return (S.z3Pending(G)&&hr>=S.Z3_SHUT&&hr<22)||!!(S.twoHeartsCafeDue&&S.twoHeartsCafeDue(G)); };
  S.inDates=(G,R)=>{ if(!Array.isArray(R)||!S.dayOfKey) return false; for(const [a,b] of R){ const d0=S.dayOfKey(a), d1=S.dayOfKey(b); if(d0!=null&&d1!=null&&G.day>=d0&&G.day<=d1) return true; } return false; };   /* [['2026-01-20','2026-02-20'],…]，含頭尾（AA_271 的 dates）*/
  S.sisC2Day=function(G){ const F=G.flags||{}; if(!F.dating_heroine_05||!F.SIS_FESTIVAL_MET) return null; const m=S.dayOfKey('2026-07-11'); if(m==null) return null; const since=F.SIS_DATING_D!=null?F.SIS_DATING_D:G.day; if(since<=m) return m; for(let d=since+3;d<since+12;d++) if(CALENDAR.dateOf(d).wd%7===6) return d; return null; };   /* C2：7/11 已交往＝當天；之後才交往＝隔 3 天以上的第一個週六（AA_218 17-13 第 4 點）；C1 沒演過（SIS_FESTIVAL_MET）不演 */
  S.albumMemory=function(G,id,title,bg){ const A=Array.isArray(G.album)?G.album:(G.album=[]); if(A.some(x=>x.kind==='memory'&&x.id===id)) return false; A.push({kind:'memory',id,title,bg:bg||'',day:G.day,h:+((G.hour||0)%24).toFixed(2)}); return true; };   /* 相簿的一頁（game3d.js albumHTML 的 memory）：同一個 id 只收一次 */
  S.afterPhoneClose=async function(GM){ const G=GM.G, F=G.flags; if(!G||F.SIS_B_FRIEND||typeof PHONE==='undefined'||!PHONE.sent(G,'sis_b_comment')) return false; const m=(G.msgs||[]).find(x=>x.tag==='sis_b_comment'), sn=G.phone&&G.phone.seen&&G.phone.seen['g:law_board']; if(!m||m.day>G.day||(m.day===G.day&&m.h>G.hour)||sn==null||sn<m.day*24+m.h) return false;   /* 玩家打開自介版、看到她的留言以後，關手機時演（AA_218 17-13 第 1 點：「第一次打開手機看到留言時」；手機開著不能演旁白，所以在關手機那一刻）*/
    F.SIS_B_FRIEND=true; if(!GM.say) return true; GM.sceneBegin(); try{ await GM.say(null,'（你按了讚，點進她的名字，送出交友邀請。）'); await GM.say(null,'（她的大頭貼是在總圖前面拍的，綁著馬尾，看著鏡頭外面的某個地方。）'); await GM.say(null,'（你多看了兩秒。）'); } finally { GM.sceneEnd(); } return true; };
  S.bohanSummer=G=>{ if(!G||(G.stage||'law')!=='law'||typeof HOME==='undefined'||!HOME.breakOf) return false; const B=HOME.breakOf(G.day), d=S.dayOfKey('2026-06-27'); return !!B&&B.key==='Y1S'&&d!=null&&G.day>=d; };   /* 柏翰大一暑假回新竹（AA_241 第 6 節 6/27）；週四來總圖（第 5 節）*/
  /* 法律系同屆（department 法律系、year 1、不是外校、不是路人 B 層）：祐廷那一堂「必修」正在上（CLS.live）＝人在那間教室坐著——作息表（daily_schedule）原本是手寫的、和課表對不上，
     使用者試玩：「常常我去上課遇不到她，或她在圖書館」「以安不在教室卻會回答老師」（9/22 憲法）。選修、通識、體育照各自的作息；劇情課（第一、二天）照劇情 */
  /* 法律系同學二十位（pool，AA_498 第 3 節）：表上寫了「必修課」的同屆（poolClass：靖雯第一排正中間、采潔第三排、郁婷上課前 10 分鐘在教室門口）一樣照課表；
     座位、門口的站位由 POOL.classEnt 決定（src/pool3d.js）。其他 pool 同學（沒有 poolClass）照舊不在教室 */
  S.classmateClass=function(c,G){ const pc=!!(c&&c.social_layer==='B'&&c.poolClass&&typeof POOL!=='undefined'&&POOL.classEnt); if(!c||c.department!=='法律系'||c.year!==1||c.school||(c.social_layer==='B'&&!pc)||typeof CLS==='undefined'||!CLS.dayItems) return null;
    for(const it of CLS.dayItems(G)){ if(it.c.kind!=='required'||!CLS.live(G,it)||(CLS.storyClass&&CLS.storyClass(G,it))) continue; if(c.id===S.YOUCHEN&&S.youchenAway(it)) continue; if(c.id==='heroine_01'&&it.c.redo) continue;   /* 日本路線大四下補修（courses.js redo）：以安不補修（jp3d.js、AA_510 0-2 第 6 點）*/ const base={zone:it.room.zone||'classroom',room:it.room.room,act:'class',days:[G.weekday],from:it.t0-0.25,to:it.t1,cls:it.key};
      if(c.id===S.YOUCHEN&&typeof SUP497!=='undefined'&&SUP497.ycLate&&SUP497.ycLate(G,it)){ if(h(G)<it.t0+10/60) continue; base.from=it.t0+10/60; }   /* AA_497 1-3：認識他的那一堂，上課十分鐘他才從後門進來（之前座位空著）*/
      return pc?POOL.classEnt(c,G,it,base):base; }
    return null; };
  /* 宥辰的出席（AA_497 第 1-2 節；AA_496 第 6 節「設定考前才出現、白天起不來，程式讓他每一堂必修都坐在教室」）：12:00 以前的必修只在第 1 週、期中考前一週與考試週（第 7～9 週）、
     期末考前兩週與考試週（最後三週；大四下 15 週＝第 13～15 週），其他週座位空著（不來教室：作息也沒有那個時段＝人不在場景裡）；12:00 以後的必修照常在（「常常趴著」沒有趴桌的動作，照坐著）。
     it＝課表的一堂（CLS.dayItems）。考試週照 calendar.js（期中第 8～9 週、期末最後一週）。他不在的那一堂，課堂上他那一句的說話人改「同學」（classes3d.js CLS.reactAs）*/
  S.YOUCHEN='classmate_youchen';
  S.youchenAway=function(it){ if(!it||!it.c||it.c.kind!=='required'||!(it.t0<12)||typeof CALENDAR==='undefined') return false;
    const t=CALENDAR.termOf(it.day); if(!t||t.week===1||t.exam) return false;
    const n1=CALENDAR.termOf(it.day+7), n2=CALENDAR.termOf(it.day+14);
    if(n1&&n1.id===t.id&&n1.exam) return false;   /* 期中考、期末考的前一週 */
    if(n2&&n2.id===t.id&&n2.exam==='final') return false;   /* 期末考的前兩週 */
    return true; };
  /* 沒有開課的教授（2026-10-14 課程調整：黃教授、陳教授的課都刪了，AA_130 第 2 節第 4 列）：上課期間照人物資料的星期、時間，在霖澤館一樓大廳（lobby）。
     國定假日、寒暑假不在；這個時段剛好有自己的課（之後若再開課）就照課表 */
  S.profLobby=function(c,G){ if(!c||!c.lobby||!c.time||!(c.time[1]>c.time[0])||c.weekday!==G.weekday) return false; const hr=h(G); if(hr<c.time[0]||hr>=c.time[1]) return false;
    if(typeof CALENDAR==='undefined') return false; const T=CALENDAR.termOf(G.day); return !!T&&!CALENDAR.holiday(G.day); };
  /* 教授的研究室時間（AA_522 3-2）：不在上課、也不是下課後那 1.5 小時的時候，照這張表在萬才館（和下課後同一個位子）；國定假日、寒暑假不在。
     林教授：大三上週二下午（3-1 她說「來研究室也可以。週二下午。」；研究室事件 ev_prof_lin_office 是 14:00～16:30）——從刑訴下課（12:10，下課後本來就在萬才館）一直到 16:30，
     中間 13:40～14:00 不先走開再出現。
     許教授（AA_522 第 8 節第 1 點，f36dfe3cf）：每週一 14:00～16:00，四個年級都在（ev_prof_xu_office 照年級，大一、大三也碰得到）；上他課的那幾天下課後照現有（課表優先）。
     大二上週一上午是他的行政法（12:10 下課，下課後本來就在萬才館）：同林教授，一直待到 16:00，13:40～14:00 不先走開再出現。一位教授可以有幾筆（陣列）*/
  S.PROF_OFFICE={prof_lin:{terms:['Y3S1'],weekday:2,time:[12,16.5]},
    prof_xu:[{terms:['Y2S1'],weekday:1,time:[12,16]},{terms:['Y1S1','Y1S2','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'],weekday:1,time:[14,16]}]};
  S.profOffice=function(id,G){ if(!G||typeof CALENDAR==='undefined') return false; const hr=h(G), T=CALENDAR.termOf(G.day); if(!T||CALENDAR.holiday(G.day)) return false;
    return [].concat(S.PROF_OFFICE[id]||[]).some(o=>!!o&&G.weekday===o.weekday&&hr>=o.time[0]&&hr<o.time[1]&&o.terms.includes(T.id)); };
  /* AA_195 4-8：阿哲在 8/29～9/3 照常上課（9/1 憲法、9/3 刑總）；LEGACY_IDS 的「afternoonDone 以後才照作息出現」只對新局、只對上課時間放寬（已經認識他以後） */
  const zheClassOk=(id,c,G)=>{ if(id!=='zhe'||!S.week1Start(G)||!G.flags.MET_ZHE) return false; const e=schedEnt(c,G); return !!(e&&e.act==='class'); };
  /* AA_379 1-4（企劃線 19a4414e；BUG-SIS-PRE94-PRESENCE-1022）：學姊開學（新局 9/1）起照作息出現，不等第二天下午的劇情（afternoonDone）——她的第一次見面是玩家自己去找；9/4 以前找她只有 SIS_PRE_W1 那一句。以安、阿哲、Alison、阿凱、周教授照舊（第一次見面在主線裡）*/
  S.sisEarly=G=>!!G&&(G.stage||'law')==='law'&&!!G.flags&&!G.flags.afternoonDone&&G.day>=S.dayOfKey('2025-09-01');
  const legacyOk=(id,c,G)=>G.flags.afternoonDone||zheClassOk(id,c,G)||(id==='heroine_05'&&S.sisEarly(G));
  function schedFor(id,zoneId,G){ const c=CHARACTERS[id], F=G.flags, hr=h(G), wd=G.weekday; if(!c) return null; if(c.presence&&!S.reachable(id,G)) return null;   /* 這學期不在學校（presence，AA_110 第 3 節）；「在臺北、不在台大」（kind taipei，BB_163）照她自己那份作息 */
    if(LEGACY_IDS.includes(id)){ if(!legacyOk(id,c,G)||F.classNow) return null; const al=LEGACY_ALIAS[id]||id; if(F.companion===al) return null; }
    if(c.social_layer==='E'&&typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'){ const w=CLS.profWhere(G,id); if(!w) return S.profLobby(c,G)&&zoneId===c.lobby?{prof:'lobby'}:(S.profOffice(id,G)&&zoneId==='wancai'?{prof:'wancai'}:null); if(w.zone==='classroom'&&zoneId==='classroom') return {prof:'class',until:null}; if(w.act==='class'&&w.room&&w.zone===zoneId) return {prof:'class',until:null,room:w.room}; if(w.zone==='wancai'&&zoneId==='wancai') return {prof:'wancai'}; return null; }   /* 課表（D52）：上課時在教室、下課後 1.5 小時在萬才館 */
    if(c.social_layer==='E'){ if(zoneId==='classroom'&&c.weekday===wd&&hr>=c.time[0]-0.3&&hr<c.time[1]) return {prof:'class'}; if(zoneId==='wancai'&&c.weekday===wd&&hr>=c.time[1]&&hr<c.time[1]+1.5) return {prof:'wancai'}; return null; }
    if(c.social_layer==='B'&&!(c.daily_schedule||c.poolClass)) return null; const ent=schedEnt(c,G); return ent&&ent.zone===zoneId?ent:null; }   /* 不熟的同學（B 層）：有作息的（法律系同學二十位，AA_498 第 3 節；src/pool3d.js 接上 daily_schedule、poolClass）照作息出現 */
  function populateSchedule(zoneId,GM,refresh){ const E=GM.E, G=GM.G; const hr=h(G); const wd=G.weekday; const used=new Set(); for(const n of E.npcs){ const st=n.seat||n.seatTarget; if(st) used.add(st.x.toFixed(1)+','+st.z.toFixed(1)); } let clubI=0, routeI=0;   /* seatTarget：正從門口走過去要坐的位子（還沒坐下）*/
    const seatFree=(pref,room)=>{ const all=(E.zone.seats||[]).slice(); const seats=room&&all.some(s=>s.room===room)?all.filter(s=>s.room===room):all;   /* 作息寫了 room（建築裡的教室，例：芷若在普通 101）就坐那一間 */ if(pref&&Array.isArray(pref)){ const sp=seats.find(s=>s.row===pref[0]&&s.col===pref[1]); if(sp&&!sp.taken&&!used.has(sp.x.toFixed(1)+','+sp.z.toFixed(1))) return sp; } for(let i=seats.length-1;i>=0;i--){ const st=seats[i]; const k=st.x.toFixed(1)+','+st.z.toFixed(1); if(!used.has(k)&&!st.taken) return st; } return null; };   /* taken：替身坐的位子（classes3d.js）*/
    // 朋友坐一起：若圖上的朋友已在這區坐著，挑離他最近的空位
    const friendSeat=(id)=>{ for(const e of SOCIAL_GRAPH){ if(e.a!==id&&e.b!==id) continue; const other=EVENTS.npcOf(e.a===id?e.b:e.a); if(other&&other.seat) return other.seat; } return null; };
    const seatNear=(fs)=>{ let best=null, bd=1e9; for(const st of (E.zone.seats||[])){ const k=st.x.toFixed(1)+','+st.z.toFixed(1); if(used.has(k)) continue; const d=Math.hypot(st.x-fs.x,st.z-fs.z); if(d<bd){ bd=d; best=st; } } return bd<3.5?best:null; };
    const spawnAt=(id,ent)=>{ const act=ent.act; let n=null;
      if(ent.spot){ const sp=(E.zone.spots||{})[ent.spot]; if(sp){ const pz=act==='class'?'sit':'read'; n=GM.spawnCharacter(id,sp.x,sp.z,{seat:{x:sp.x,z:sp.z,yaw:sp.yaw||0,lv:sp.lv|0},pose:pz}); if(n) n.idlePose=pz; return n; } }   /* spot：區域配置裡寫好的固定位子（學姊在霖澤館 5F 研究室靠窗的桌子，AA_399 1-3；不在 seats 裡＝玩家不能坐）*/
      if(act==='read'||act==='class'||act==='eat'||(act==='sit'&&E.zone.seats&&!ent.seat)){ const fs=!ent.seat&&!ent.seatAt&&friendSeat(id); const st=(fs&&!ent.room&&seatNear(fs))||(ent.seatAt&&seatNear({x:ent.seatAt[0],z:ent.seatAt[1]}))||seatFree(ent.seat,ent.room); if(!st) return;   /* seatAt：離這一點最近的空位（閱覽室窗邊、文學院前的長椅；AA_498 第 3 節）*/ used.add(st.x.toFixed(1)+','+st.z.toFixed(1)); const pz=act==='class'?'sit':'read', door=refresh&&(E.indoor||E.zone.indoor)&&E.zone.spawn;
        if(door&&E.moveTo&&GM.sitAt){   /* 待在區域裡補人（室內）：從門口走進來、走到位子才坐下——不在座位上憑空出現（v9.6 回歸 flow_class_real：劇情課結束後同學在座位上冒出來）*/
          n=GM.spawnCharacter(id,door.x,door.z,{lv:door.lv|0,pose:'idle'});
          if(n){ n.seatTarget=st; n.idlePose='idle'; const sit=()=>{ n.seatTarget=null; const P=E.player; if(P&&P.seat&&Math.hypot(P.seat.x-st.x,P.seat.z-st.z)<0.35){ n.pose=n.idlePose='idle'; return; } GM.sitAt(n,st); n.pose=n.idlePose=pz; };   /* 位子被玩家坐走了：站在旁邊 */
            const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; if(!E.moveTo(n,ap[0],ap[1],sit,st.lv|0)) sit(); } }
        else { n=GM.spawnCharacter(id,st.x,st.z,{seat:st,pose:pz}); if(n) n.idlePose=pz; } }
      else if(act==='sit'&&ent.seat==='bell'){ n=GM.spawnCharacter(id,-30,20.94,{seat:{x:-30,z:20.94,yaw:Math.PI},pose:'sit'}); }
      else if(act==='sit'&&zoneId==='wenzhou'){ const B=typeof WZ_PARK_LAYOUT!=='undefined'?WZ_PARK_LAYOUT.seats.filter(q=>q.label==='坐在小公園的長椅').map(q=>({x:q.x,z:q.z,yaw:q.yaw})):[{x:23.6,z:7.94,yaw:Math.PI},{x:28.4,z:7.94,yaw:Math.PI}];   /* 小公園入口段的兩張長椅（擴大版照配置檔）*/ const st=GM.npc.yu&&GM.npc.yu.seat&&GM.npc.yu.seat.x===B[0].x?B[1]:B[0]; n=GM.spawnCharacter(id,st.x,st.z,{seat:st,pose:'sit'}); }
      else if(act==='linger'&&ent.at){ n=GM.spawnCharacter(id,ent.at[0],ent.at[1],{yaw:ent.at[2]||0,pose:'idle',lv:ent.at[3]|0}); if(n&&ent.noPair) n.noPair=true; }   /* 在日程寫的位置站一下（芷若經原下課後在 101 門口）；noPair：站在那裡、不被 pairUp 帶去和朋友站一起（系籃練球：阿哲在場邊、明軒在場上，BBALL-PRESENT-1030）*/
      else if(act==='barista'){ n=GM.spawnCharacter(id,-2.5,-5.15,{yaw:0,pose:'idle'}); if(n){ n.frozen=true; n.talkLabel='和店員說話'; n.staff='cafe'; } }   /* staff：比吧檯的點餐點優先（engine3d.js nearestInteractable）；沒有事件時和她說話就是點餐（talkCharacter）*/
      else if(act==='help'){ n=GM.spawnCharacter(id,2.6,-3.6,{yaw:-Math.PI/2,pose:'idle'}); if(n) n.frozen=true; }
      else if(act==='ta'){ n=GM.spawnCharacter(id,TA_SPOT[0],TA_SPOT[1],{yaw:0,pose:'idle'}); if(n) n.frozen=true; }
      else if(act==='club'){ const sp=CLUB_SPOTS[clubI++%CLUB_SPOTS.length]; n=GM.spawnCharacter(id,sp[0],sp[1],{yaw:Math.atan2(-sp[0],-sp[1]),pose:'idle',pockets:true}); if(n) n.frozen=true; }
      else if(act==='desk'){ /* legacy kai */ }
      else if(act==='follow'){ const P=E.player.obj; n=GM.spawnCharacter(id,P.position.x-Math.sin(P.rotation.y)*1.2+0.5,P.position.z-Math.cos(P.rotation.y)*1.2,{beh:'follow',lv:E.player.lv|0}); if(n) n.followOff=1.1; }   /* 和你一起走過去的人（邀約「現在一起過去」）*/
      else if(act==='wait'&&ent.invite){ const sp=E.zone.spawn||{x:0,z:0}; let x=sp.x+1.6, z=sp.z+1.2; if(E.canStand&&!E.canStand(x,z,0.32,0)){ x=sp.x; z=sp.z+1.6; } n=GM.spawnCharacter(id,x,z,{pose:'idle'}); if(n){ n.frozen=true; if(GM.face) GM.face(n,sp.x,sp.z); } }   /* 約在路上碰面（溫州街）：在入口附近等 */
      else { const rs=walkRoutes[zoneId]||[]; if(!rs.length){ n=GM.spawnCharacter(id,0,0,{}); return n; } const nr=ent.near, dq=q=>Math.hypot(q[0]-nr[0],q[1]-nr[1]), dr=r=>Math.min(...r.map(dq));
        const r=nr?rs.slice().sort((a,b)=>dr(a)-dr(b))[0]:rs[(routeI++)%rs.length]; let wp=nr?r.slice().sort((a,b)=>dq(a)-dq(b))[0]:r[(Math.random()*r.length)|0];   /* 作息寫了 near（例：芷若「外文系的課後在傅鐘附近」）：走離那一點最近的路線、從最近的點出現——原本路線輪流分配，v9.8 多了幾個人以後她被分到校園另一頭（v9.8 回歸 flow_first_meet A）*/
        if(refresh){ const P=E.player.obj.position; for(const q of r) if(Math.hypot(q[0]-P.x,q[1]-P.z)>Math.hypot(wp[0]-P.x,wp[1]-P.z)) wp=q; }   /* 待在區域裡補人：從路線上離玩家最遠的點走出來，不在眼前憑空出現 */
        n=GM.spawnCharacter(id,wp[0],wp[1],{beh:'wander',waypoints:r}); } return n; };
    // 教授：依課表
    const F=G.flags;
    const z3c=zoneId==='cafe'&&S.z3Pending(G);   /* 芷若 Z3 那天：Café 的客人 21:40 起身離開、21:40～22:00 不補（店員不算）*/
    for(const id in CHARACTERS){ if(EVENTS.npcOf(id)) continue; const ent=schedFor(id,zoneId,G); if(!ent) continue; let n=null; const z3cust=z3c&&ent.act!=='barista'; if(z3cust&&hr>=S.Z3_SHUT&&hr<22) continue;
      if(refresh&&typeof ent.to==='number'&&typeof ent.from==='number'&&(ent.to<=24?ent.to-hr:(hr>=ent.from?ent.to-hr:ent.to-24-hr))<0.25) continue;   /* 待在區域裡補人：時段剩不到 15 分鐘的不補（劇情場景擋住補人時，結束後同學在座位上憑空出現、一分鐘後又起身離開——v9.6 回歸 flow_class_real）*/
      if(ent.prof==='class'){ const ts=(typeof CLS!=='undefined'&&CLS.teacherSpot?CLS.teacherSpot(E,ent.room):null)||(ent.room?(E.zone.teacherSpots||{})[ent.room]:E.zone.teacherSpot)||(ent.room?null:{x:-1.5,z:-4.4}); if(!ts) continue;   /* CLASS-TEACHER-1027：講台的位置一律問 CLS.teacherSpot（原本只查 teacherSpots[房號]：萬才館多功能教室、霖澤館 202、共同 102 找不到，教授不出現）*/
        const from=refresh&&typeof CLS!=='undefined'&&CLS.entryPoint?CLS.entryPoint(E):null;   /* 待在教室裡、上課時間到了：從門口走上講台，不在講台上憑空出現 */
        if(from&&E.moveTo){ n=GM.spawnCharacter(id,from.x,from.z,{lv:from.lv|0,pose:'idle'}); if(n){ const stand=()=>{ n.path=null; if(E.placeAt) E.placeAt(n,ts.x,ts.z,ts.lv|0); n.obj.rotation.y=ts.yaw||0; n.faceYaw=null; n.pose=n.idlePose='idle'; n.frozen=true; };
            n.frozen=false; n.tSpot=ts; if(!E.moveTo(n,ts.x,ts.z,stand,ts.lv|0)) stand(); } }
        else { n=GM.spawnCharacter(id,ts.x,ts.z,{yaw:ts.yaw||0,lv:ts.lv|0,pose:'idle'}); if(n){ n.frozen=true; n.tSpot=ts; } } }   /* tSpot：測試、快轉前到位（CLS.settleRoom）用 */
      else if(ent.prof==='wancai'){ const sp=[[-5,1.2],[-3.6,1.2]].find(([x,z])=>!E.npcs.some(m=>m&&m.obj&&(m.lv|0)===0&&Math.hypot(m.obj.position.x-x,m.obj.position.z-z)<0.5)&&(!E.canStand||E.canStand(x,z,0.32,0)))||[-5,1.2];
        n=GM.spawnCharacter(id,sp[0],sp[1],{yaw:0,pose:'idle'}); if(n) n.frozen=true; }   /* 兩位教授同時在萬才館（例：大四下週一許教授的研究室時間＋周教授的專題，AA_522 第 8 節）：第二位站在同一張沙發前、往東 1.4 m，不疊在同一個位子 */
      else if(ent.prof==='lobby'){ const cand=[].concat(E.zone.profSpot?[E.zone.profSpot]:[],[{x:-0.6,z:-5.4,yaw:0},{x:2.6,z:2.2,yaw:Math.PI},{x:-2.4,z:1.6,yaw:Math.PI/2}]);   /* 霖澤館一樓大廳：樓層簡介前、沙發旁 */
        const sp=cand.find(q=>!E.canStand||E.canStand(q.x,q.z,0.32,0))||(E.zone.spawn||{x:0,z:0}); n=GM.spawnCharacter(id,sp.x,sp.z,{yaw:sp.yaw||0,pose:'idle',lv:0}); if(n) n.frozen=true; }
      else n=spawnAt(id,ent);
      if(n) n.sched=true; if(n&&z3cust&&hr<S.Z3_SHUT) n.until=S.Z3_SHUT; }   /* sched：照行程出現的人（時段結束時 refreshSchedule 會讓他離開；劇情裡生出來的人不算） */
    if(refresh) return;   /* 待在區域裡補人：不重排不熟同學、不把已經在的人搬到朋友旁邊（pairUp 會瞬移） */
    /* 不熟同學 pool（法律系同學二十位）：原本這裡「五組（i%5）、每組取前幾位」分到教室、圖書館、校園、Café、公館、溫州街（長相每次不一樣、地點和外觀描述對不上、三位永遠不出現，AA_496）。
       AA_498 2-1（2026-10-28）起每人照第 3 節的表在自己的地點、時段出現：作息接在 CHARACTERS[pool_*].daily_schedule／poolClass（src/pool3d.js），走上面同一套 schedFor（進區域、待在區域裡補人、時段結束離開、人物線索都一樣）*/
    for(const f of S.PRE_PAIR){ try{ f(zoneId,GM); }catch(e){ console.warn('STORY.PRE_PAIR',e); } }   /* pairUp 之前：女主角和她的人先站在一起（src/hcircle3d.js；配好的有 paired，pairUp 不再拆）*/
    pairUp(zoneId,GM); }
  S.PRE_PAIR=[];   /* fn(zoneId,GM)：進區域生完照作息的人、pairUp 之前 */
  // NPC 與 NPC：依 SOCIAL_GRAPH，同一區域、同時段、都有空的兩個人會一起走或站著聊天（玩家不是世界的中心）
  function pairUp(zoneId,GM){ const E=GM.E; const free=n=>n&&!n.seat&&!n.frozen&&!n.paired&&!n.noPair&&(n.beh==='wander'||n.beh==='idle');   /* noPair：女主角圈子表上「一個人」的那一段（src/hcircle3d.js）*/ const nv=E.navOf?E.navOf(0):E.nav; const standable=(x,z)=>!nv||(nv.free(x,z)&&nv.free(x+0.3,z)&&nv.free(x-0.3,z)&&nv.free(x,z+0.3)&&nv.free(x,z-0.3));   /* 路人在地面那一層（玩家在萬才館陽台上讀檔時 E.nav 是第 1 層）*/
    const edges=SOCIAL_GRAPH.slice();   /* 原本另外把兩個有空的不熟同學隨便配成一對（i%5 那一套的）：AA_498 2-1 每人固定在自己的地方，拿掉（他們彼此的關係照 SOCIAL_GRAPH）*/
    for(const e of edges){ const a=EVENTS.npcOf(e.a), b=EVENTS.npcOf(e.b); if(!free(a)||!free(b)) continue; if(Math.random()<0.3) continue; a.paired=b; b.paired=a; const ax=a.obj.position.x, az=a.obj.position.z;
      if(a.beh==='wander'&&Math.random()<0.5){ b.beh='buddy'; b.buddy=a; b.side=Math.random()<0.5?1:-1; b.followOff=0.9; b.waypoints=null; b.path=null; const bx=ax+b.side*0.9, bz=az; if(standable(bx,bz)) b.obj.position.set(bx,0,bz); else b.obj.position.set(ax,0,az+0.9); b.obj.rotation.y=a.obj.rotation.y; a.timer=0.5; }
      else { const yaw=Math.random()*Math.PI*2; const bx=ax+Math.sin(yaw)*1.15, bz=az+Math.cos(yaw)*1.15; if(!standable(bx,bz)){ a.paired=null; b.paired=null; continue; } b.obj.position.set(bx,0,bz); b.path=null; a.path=null; a.obj.rotation.y=yaw; b.obj.rotation.y=yaw+Math.PI; a.beh='chat'; b.beh='chat'; a.chatWith=b; b.chatWith=a; a.chatLead=true; a.pose='talk'; a.idlePose='talk'; b.pose='idle'; b.idlePose='idle'; b.pockets=Math.random()<0.6; a.timer=1+Math.random()*2; a.frozen=true; b.frozen=true; a.lookAt=b.obj.position; b.lookAt=a.obj.position; } } }
  S.pairUp=pairUp;
  /* 閒聊（2026-10-13 使用者試玩：洪珮瑜一直說「喜歡聽 podcast」、高子晴第一次聊天就說「期末成發你要來」）：
     ① SMALLTALK 的一句可以帶條件 {t,if}（EVENTS.cond；例如吉他社那幾句要在 ev_ziqing_club 之後）；
     ② 輪流說、說完一輪才重來（不會連續兩次同一句）；③ 一天只聊一句新的（熟悉度 +1 也只有這一次），同一天再找他就是打個招呼（旁白）；
     ④ 不太熟的同學（社會圖 B 層）沒有閒聊台詞：用旁白記一件聊到的事（facts），不把「喜歡聽 podcast」當成台詞一直講。
     記在 G.social.small[id]＝{day, used:[已經說過的句子], last}（新欄位，舊存檔沒有就從頭開始）*/
  /* 2026-10-13 AA_120：⑤ 條件鍵和事件一致——if／unless、term、week:[a,b]、location、time:[a,b]、weekday、once（true 一次；'term' 每學期一次，記在 r.once）；
     ⑥ 不熟的同學（B 層）說完自己的句子就只點頭或短招呼（AA_120 7-2：三句整個存檔各說一次，換學期不重播；見下面的 greetB）；他們的旁白只用 facts[0]（facts[1] 是心事，要等他自己說「其實……」）*/
  /* 閒聊階梯（AA_135、AA_136、BB_130；src/data/ladder.js；使用者 2026-10-15「要一層一層聊天認識彼此……可以限制每天只能多認識多少，但不要一直講一樣的話」，全案通過直接實作）：
     每人每天最多推進一層（G.social.ladder[id]＝已經聊過幾層、ladderDay[id]＝哪一天推進的；舊存檔從第 1 層開始）。條件不到、今天推進過＝短招呼（情境句優先、一天同一句只說一次；
     基本句輪替、不連續重複）。芷若在吧檯上班不推進；可昕（dateOnly）只在見面／視訊推進，路上不推進；學姊只有朋友的話（資料已經這樣寫） */
  S.LADDER_ON=G=>typeof LADDER!=='undefined';
  /* 一學期一個檔（企劃線 ladder/README，2026-10-16）：這學期有她的檔才推進；換學期從新檔第 1 層開始，上學期沒走完的層不帶過去。
     進度的 key：大一上照舊用人物 id（舊存檔）；其他學期用「id@學期」（例 heroine_01@Y1S2）。「一天最多推進一層」不分學期，照舊記在 ladderDay[id]。寒暑假沒有學期＝不推進、不招呼（照舊閒聊） */
  S.ladData=function(G,id){ if(!S.LADDER_ON(G)) return null; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null;
    const B=LADDER.byTerm||{Y1S1:LADDER.characters}, t=T&&T.id; if(t&&B[t]&&B[t][id]) return {L:B[t][id],term:t,key:t==='Y1S1'?id:id+'@'+t};
    if(!LADDER.byTerm&&LADDER.characters[id]&&!(LADDER.terms&&LADDER.terms[id])) return {L:LADDER.characters[id],term:t,key:id};   /* 舊格式、沒有學期的資料（測試用）*/
    if(B.Y1S1&&B.Y1S1[id]&&!(LADDER.terms&&LADDER.terms[id])) return {L:B.Y1S1[id],term:t,key:id};   /* 沒有寫學期的測試資料 */
    return null; };
  const ladRec=G=>{ const so=G.social||(G.social={}); if(!so.ladder||typeof so.ladder!=='object') so.ladder={}; if(!so.ladderDay||typeof so.ladderDay!=='object') so.ladderDay={}; if(!so.greetUsed||typeof so.greetUsed!=='object') so.greetUsed={}; return so; };
  const ladCtxOk=(G,e,id)=>{ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, hh=G.hour%24, ec=typeof EVENTS!=='undefined'&&EVENTS.cond;
    if(e.if&&!(ec&&EVENTS.cond(e.if))) return false; if(e.unless&&ec&&EVENTS.cond(e.unless)) return false; if(e.any&&!(ec&&e.any.some(c=>EVENTS.cond(c)))) return false;
    if(e.term&&!(T&&[].concat(e.term).includes(T.id))) return false; if(e.week&&!(T&&T.week>=e.week[0]&&T.week<=e.week[1])) return false;
    if(e.location&&!(Array.isArray(e.location)?e.location:[e.location]).includes(G.zone)) return false; if(e.time&&!(hh>=e.time[0]&&hh<e.time[1])) return false;
    if(e.weekday&&!e.weekday.includes(G.weekday)) return false; if(e.weather&&![].concat(e.weather).includes(G.weather)) return false; if(e.dayMin&&S.mainDay(G)<e.dayMin) return false;   /* A1（AA_195 4-7）：閒聊階梯的 dayMin 和事件的 day_min 一樣，從法律系主線第一天算 */
    if(e.weekParity&&T){ if(e.weekParity==='odd'){ if(!S.fafuDuty(G)) return false; } else { const odd=T.week%2===1; if(odd) return false; } }   /* BB_170 第 16 列：'odd' 是法服值班的短招呼，照真的值班表（S.fafuDuty：第 3 週起的單週週六，考試週、假日不值班）*/   /* weekParity（BB，ladder README）：'odd'＝單週、'even'＝雙週（法服值班的短招呼；2026-10-16 AA-B 驗收：原本沒有處理）*/
    if(e.locTime&&e.locTime[G.zone]){ const lt=e.locTime[G.zone]; if(lt.weekday&&!lt.weekday.includes(G.weekday)) return false; if(lt.time&&!(hh>=lt.time[0]&&hh<lt.time[1])) return false; }
    if(e.unlessWeekdayTime){ const u=e.unlessWeekdayTime; if((!u.weekday||u.weekday.includes(G.weekday))&&(!u.time||(hh>=u.time[0]&&hh<u.time[1]))) return false; }
    if(e.unlessWorking&&S.ladWorking(G,id)) return false; return true; };
  const ladIf=c=>{ const ec=typeof EVENTS!=='undefined'&&EVENTS.cond; if(!c) return true; if(c.if||c.unless) return (!c.if||(ec&&EVENTS.cond(c.if)))&&!(c.unless&&ec&&EVENTS.cond(c.unless)); return !!(ec&&EVENTS.cond(c)); };   /* {if?,unless?} 或直接一個條件 */
  /* 要回覆的訊息到了自動打開手機（D103，2026-10-18 使用者：「我根本不會看手機，不能都用手機說」）：有新的「要回覆」（有選項）的訊息、玩家空下來（沒有對話、選單、劇情、
     不在家裡的 2D 畫面）就打開那個對話；同一則只自動開一次（G.flags._autoAsk 記 id），玩家關掉就不再跳 */
  S.PHONE_AUTO_STILL=1.5;
  S.phoneAuto=function(GM){ const G=GM.G, E=GM.E, P=E&&E.player; if(typeof PHONE==='undefined'||!PHONE.pending||!GM.openPhone||GM.titleIdle) return; if(GM.phoneIsOpen&&GM.phoneIsOpen()) return;
    const free=!!P&&!E.paused&&!P.busy&&!(GM.isEntering&&GM.isEntering())&&!(GM.D&&GM.D.active)&&!(typeof EVENTS!=='undefined'&&EVENTS.running)&&!(typeof HOME!=='undefined'&&HOME.at(G)); if(!free) return;   /* 換區域途中（變黑、載入新區域；推門演完到換好那幾秒）不開：BB-C relsuite_562 touch_flow_wenzhou 進 Café 時手機蓋上來（PHONE-AUTO-ENTER-1028）*/
    if((P.path&&P.path.length)||(E.input&&E.input.joy&&E.input.joy.active)||(typeof E.time==='number'&&P.lastMoveT!=null&&E.time-P.lastMoveT<S.PHONE_AUTO_STILL)) return;   /* 走路中（推搖桿、點地面）不跳出來，停下來 1.5 秒再開（UX-PHONE-AUTO-WALK-1021：原本推搖桿走到一半手機跳出來、遊戲暫停）*/
    const F=G.flags, seen=F._autoAsk||(F._autoAsk=[]); const PL=PHONE.pending(G), m=PL.find(x=>!seen.includes(x.id||x.key||x.text)); if(!m) return; for(const x of PL){ const k=x.id||x.key||x.text; if(!seen.includes(k)) seen.push(k); } if(seen.length>200) seen.splice(0,seen.length-200);   /* 當下所有待回的一起記成開過（列表上都看得到；同 home3d.js 的 S.askSeen）：原本一次只記一則，同時有三則就收起來又自己打開三次（2026-10-21 v9.10.3 發布前 smoke_release 查到）*/
    GM.openPhone('msg'); };   /* 使用者 22:4x 選 B：先停在對話列表（那一列看得到她最新的一句、標「待回覆」），點進去從最新的一句開始 */
  S.ladMark=function(G,ids){ const so=ladRec(G); so.ladSeen=so.ladSeen||{}; for(const id of [].concat(ids)) so.ladSeen[id]=G.day; };   /* AA_293 第 2 節：過場演完把那一層記成推進過 */
  S.ladWorking=(G,id)=>{ try{ const en=schedEnt(CHARACTERS[id],G); return !!(en&&en.act==='barista'); }catch(e){ return false; } };
  /* 芷若 2027-06-04～09-02 不上班（6/3 Z9 是她最後一個班、9/2 出發去英國；AA_369 第 8 節第 8 題、AA_375 第 1 項；作息 characters.js 的 barista 用 notDates 2027-06-04～09-02 停掉，6/4～8/20 週一、三下午當客人）。day 不給＝今天 */
  S.ZR_NOSHIFT=['2027-06-04','2027-09-03']; S.ZR_NOSHIFT2=['2028-08-01','2028-09-02'];   /* 第二段：AA_508 0-2 第 9 點，2028-08-01～09-01 也不上班（週一、三晚上當客人；9/2 去英國）*/
  S.zrNoShift=(G,day)=>{ const d=day!=null?day:(G&&G.day); if(d==null) return false; return [S.ZR_NOSHIFT,S.ZR_NOSHIFT2].some(R=>{ const a=S.dayOfKey(R[0]), b=S.dayOfKey(R[1]); return a!=null&&b!=null&&d>=a&&d<b; }); };
  /* 使用者拿掉的階梯層（直接算過、不播；企劃檔下一班 AA 刪，刪了以後這裡也可以拿掉）：K0-Lx2「搬回家以後，來學校要多久？」（2026-10-18 14:3x 使用者：「沒有必要」→ 選「整段拿掉」）*/
  S.LAD_CUT=new Set(['K0-Lx2']);
  /* 程式這邊的「條件不成立就跳過」（匯入的 ladder.js 不手改）：子晴 Q2-L4 講她的遊戲，沒看過 Q6（PLAYTESTED）的玩家跳過這一層（AA_313 6-5 第 1 點）*/
  S.LADDER_SKIP={'Q2-L4':G=>!(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has('heroine_04','PLAYTESTED'))};
  /* AA_374 第 11 項：柏翰×沛珊那一段只在玩家沒有和沛珊交往時——講那一段的兩層（大一下 P2-L4、大二上 P3-L5），交往中的玩家跳過 */
  S.LADDER_SKIP['P2-L4']=G=>!!(G.flags&&G.flags.dating_classmate_peishan); S.LADDER_SKIP['P3-L5']=S.LADDER_SKIP['P2-L4'];
  /* AA_377 第 7 項：和以安挽回中、冷靜中、分手了（REL_STATE strained／ended＝romance 的 ex、paused、friend_after_catch，而且沒在交往）：大三下 A6 整層略過——
     3/25「到了再說。」是她出發前對他說的唯一一句（AA_260 第 2 節第 3 點；同 jp3d.js 的 strained）*/
  { const anStrained=G=>{ const F=(G&&G.flags)||{}, R=(F.romance||{}).heroine_01; return !(F.dating_heroine_01===true||(R&&R.status==='dating'))&&!!R&&['ex','paused','friend_after_catch'].includes(R.status); };
    for(const id of ['A6-L1','A6-L2','A6-L3','A6-L4']){ const f0=S.LADDER_SKIP[id]; S.LADDER_SKIP[id]=G=>anStrained(G)||(!!f0&&f0(G)); } }
  S.ladNext=function(G,id,mode){ const D=S.ladData(G,id); if(!D) return null; const L=D.L, K=D.key;
    const so=ladRec(G); if(so.ladderDay[id]===G.day) return null; let st=L.steps[so.ladder[K]|0];
    const wkNow=(()=>{ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return T?T.week|0:0; })();
    while(st&&(S.LAD_CUT.has(st.id)||(S.LADDER_SKIP[st.id]&&S.LADDER_SKIP[st.id](G))||(st.skipIf&&ladIf(st.skipIf))||(st.skipAfterWeek!=null&&wkNow>st.skipAfterWeek)||(so.ladSeen&&so.ladSeen[st.id]))){ so.ladder[K]=(so.ladder[K]|0)+1; st=L.steps[so.ladder[K]]; }   /* ladSeen：事件接事件的過場已經演過這一層（AA_293 第 2 節：可昕交往前 T1～T6），3D 搭話時不重播 */   /* skipAfterWeek（ladder README，BB-C 2026-10-17）：過了第 N 週還沒推進的那一層直接算過 */   /* skipIf（AA 2026-10-16）：條件成立＝這一層直接算過（記層數、不播、不算今天推進）——if 用 notMemory 會讓階梯永遠卡住 */
    if(!st) return null;
    if(L.context==='date'||st.dateOnly){ if(!mode||(st.dateOnly&&st.dateOnly!==mode)) return null; if(!(G.flags&&G.flags.dating_kexin)&&id==='kexin') return null; }
    const W=S.LADDER_WEEK_IF[st.id]; const stc=W&&ladIf({if:W.if})?Object.assign({},st,{week:W.week}):st;
    if(!ladCtxOk(G,stc,id)) return null;   /* 情境（週次、地點、時間…）先看：LADDER_HOLD 只在這一層真的要播的時候問（PRIVTALK 擋下來的那一天才記，AA_503 第 14 節共同的保底）*/
    if(S.LADDER_HOLD[st.id]&&!S.LADDER_HOLD[st.id](G)) return null;   /* 企劃說「那件事件做好以前不要開這一層」的（AA_186：語彤 Y5-L6 等續約事件 14）*/
    return st; };
  S.LADDER_HOLD={'Y5-L6':G=>!!(G.flags&&G.flags.RENT_RENEWED),
    /* Alison「在一起」以後才說的兩層（AA_211 第 1 節第 3 點：ev_yu_together 演過，或 12/19 以後）：資料的週次 16 週制改成 [14,18]，日期條件放程式 */
    'A3-L6':G=>!!(G.events&&G.events.done&&G.events.done.ev_yu_together)||G.day>=S.dayOfKey('2026-12-19'),
    'Y3-L5':G=>!!(G.events&&G.events.done&&G.events.done.ev_yu_together)||G.day>=S.dayOfKey('2026-12-19'),
    /* 語彤大三下（AA_260 第 4 節第 5 點）：Y6-L1、L7 假設事件 13（12/16 週四空出來）演過、Y6-L5 假設事件 14（請了工讀生、續約 RENT_RENEWED）演過；兩件做好以前不開 */
    'Y6-L1':G=>S.ytEv13(G),'Y6-L7':G=>S.ytEv13(G),'Y6-L5':G=>!!(G.flags&&G.flags.RENT_RENEWED)};
  /* AA_375 第 11 項：可昕 K4-L2（兩邊的朋友見面）第 5 週起（週次在 tools/ladder/import_ladder.py 疊；3/21 邀約之後），只給 3/25 那場去了的玩家——
     答應了（KX_CIRCLES_GO）才說（見面以前是 lines、見過是 linesIf）；回了「那天不行」、3/25 過了沒去（沒有 ev_kexin_two_circles）、沒收到邀約＝這一層直接算過 */
  /* AA_378 #1（企劃線 5cd35678）：以安 A7-L2「今年生日不是中秋。」只在她生日 2028-09-15（五）當天聊；那天沒聊到就不出（之後直接算過）*/
  S.LADDER_HOLD['A7-L2']=G=>G.day===S.dayOfKey('2028-09-15');
  S.LADDER_SKIP['A7-L2']=G=>G.day>S.dayOfKey('2028-09-15');
  /* AA_529 6-1：可昕 K0b-L1「你房間那張書桌，你坐左邊，我坐右邊……國界」是她住進來第一天的話——只在 2/15～3/15 出，過了就算過（後面的層照順序）。
     30 分鐘版原本第一次輪到它是 4/24 生日那天（ladder.js 照匯入的不手改，日期條件放程式，同 A7-L2）*/
  S.K0B_L1=['2025-02-15','2025-03-15'];
  S.LADDER_HOLD['K0b-L1']=G=>{ const a=S.dayOfKey(S.K0B_L1[0]), b=S.dayOfKey(S.K0B_L1[1]); return a!=null&&b!=null&&G.day>=a&&G.day<=b; };
  S.LADDER_SKIP['K0b-L1']=G=>{ const b=S.dayOfKey(S.K0B_L1[1]); return b!=null&&G.day>b; };
  S.LADDER_HOLD['K4-L2']=G=>!!(G.flags&&G.flags.KX_CIRCLES_GO===true)||!!(G.events&&G.events.done&&G.events.done.ev_kexin_two_circles);
  S.LADDER_SKIP['K4-L2']=G=>{ if(G.events&&G.events.done&&G.events.done.ev_kexin_two_circles) return false; if(G.flags&&G.flags.KX_CIRCLES_GO===false) return true; const d=S.dayOfKey('2027-03-25'); return d!=null&&G.day>d; };
  /* 語彤事件 13（AA_259：2027-12-16 第 15 週）：事件做好時設 YT_EV13（暫名）。她的作息照日期換（事件演不演，週四都不再顧店）*/
  S.ytEv13=G=>!!(G&&G.flags&&G.flags.YT_EV13);
  S.ytThuFree=G=>!!(G&&G.flags&&G.flags.YT_EV13)||(G&&G.day>=S.dayOfKey('2027-12-16'));
  /* AA_186 第 6 節 C（條件類，AA-B 19:1x 照做）：「妳們和好了？」只給看過吵架那一場的玩家（以安 A2-L6：ev_an_yu_argument；A5-L6 芯慈：慈 3）；linesIf 指到不存在的 ev_an_study_group 改讀公法讀書會 */
  /* 學姊 M2 換題目、M3 放榜、上榜聚餐：照新年級是 2026 年＝祐廷大一下的事，大二不播（BB_205 第 4 節、BB_97 第 2 節 2026-10-17）；大一下的版本在 src/sis_grad3d.js（AA_218 17-12 第 4 點；AA_355 第 3 節）*/
  S.SIS_Y2_EXAM=false;
  S.LADDER_CHOICE_IF={'Y6-L3':{'「妳也有拍嗎？」':{custom:G=>!(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has('heroine_01','AN3_AZALEA'))},'（給她看手機裡的另一張）':{memory:[{npc:'heroine_01',tag:'AN3_AZALEA'}]}},   /* AA_377 6-3：杜鵑花那張是祐廷拍的（AN3_AZALEA），「妳也有拍嗎？」換成給她看另一張（字在 ladder.js，tools/ladder/import_ladder.py）*/
    'A2-L6':{'「妳們和好了？」':{events:['ev_an_yu_argument']}},'A-L11':{'「我可以去嗎？」':{notEvents:['ev_public_law_group']}},
    'A3-L3':{'「三條是哪三條？」':{notFlags:['PLG_RULES_SEEN']}},'A5-L5':{'「妳那天講的，我聽過了。」':{flags:['AN15_SEEN']}}};   /* A5-L5 選項②：11/17 在 Café 演過 1A-05 才有（AA_315 1A-02 第 6 節第 5 點）*/   /* AA_238 5-5（25e89f6e）：讀書會改到大一上，「我可以去嗎？」改掛以安 A-L11（去過公法讀書會的不出現），A2-L6 只留「妳們和好了？」（看過吵架的才有）；AA_259：A5-L6 改稿後沒有「妳們和好了？」；AA_211（0ba8d336）：A3-L3「三條是哪三條？」看過規則（PLG_RULES_SEEN）的不出現 */
  /* 選項的回覆依條件換（AA_211 第 4 節，0ba8d336）：可昕 K3-L7 選項①——沒去系上的電影夜（ev_kexin_film_night，BB_97 9-6，大二還沒做）＝「真的嗎？那下次我坐你旁邊看。」*/
  S.LADDER_REPLY_IF={'K3-L7':{'「我看電影很認真。」':[{unless:{events:['ev_kexin_film_night']},reply:'真的嗎？那下次我坐你旁邊看。'}]},
    'A4-L5':{'「妳跟我講話好像也是。」':[{if:{flags:['dating_heroine_01']},reply:'真的？……跟你講話本來就不用敬語啊。'}]},
    'A4-L7':{'「讀書會可以先交給 Alison。」':[{if:{flags:['dating_heroine_01']},reply:'嗯。……還有你，半年見不到。'}]}};   /* ROM-1017（AA-C b39f0bb9）＋AA_255 改稿（ladder_aa_y2s2 的 note，25e89f6e）：和以安交往中的回覆；key 換成新的選項 */
  /* 旁邊有她的人時，交往中的那一版改說一般版（AA_503 第 14 節第 7 項，企劃線 6bc3cd784；src/privtalk3d.js 登記）：fn(G,x,id,ctx,kind)→true＝這一套這一次不用（說一般版）。
     kind：'linesIf'、'extraIf'（閒聊階梯那一層，ctx＝那一層）、'greet'（招呼的 when，ctx＝招呼的資料）、'reply'（選項的回覆，ctx＝那個選項）、'miss'（沒回訊息那一句，ctx＝那一則；只在有一般版的時候問）*/
  S.DATING_QUIET=[];
  const datingQuiet=(G,x,id,ctx,kind)=>!!G&&S.DATING_QUIET.some(f=>{ try{ return !!f(G,x,id,ctx,kind); }catch(e){ console.warn('STORY.DATING_QUIET',e); return false; } });
  S.ladReply=function(st,ch,G,id){ const R=(S.LADDER_REPLY_IF[st.id]||{})[ch.t]; if(R) for(const r of R) if(!(G&&datingQuiet(G,r,id,ch,'reply'))&&ladIf(r)) return r.reply; return ch.reply; };
  /* 招呼（greet.when）的額外條件（AA_211 附錄 B G1，0ba8d336）：學姊「值班表你看了嗎？」只說一次、只給法服成員（S.fafuMember）*/
  S.LADDER_GREET_IF={'值班表你看了嗎？':{once:true,test:G=>S.fafuMember(G)},'週四店裡現在是工讀生':{test:G=>S.ytEv13(G)&&!!(G.flags&&G.flags.RENT_RENEWED)},
    '我要去搭客運回台中了':{test:G=>{ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return !!T&&T.week%2===1; }}};   /* 沛珊隔週回台中（AA_372 第 8 項）：週五那句只在單數週說（週末的 presence 在 characters.js）*/   /* 語彤大三下招呼③：事件 13、14 演過才說（AA_260 第 4 節第 5 點）*/
  /* AA_375 第 1 項：芷若 6/4 起不上班——大二下的招呼只用不上班的版本（working 那幾句跟著作息自然不出）；這三句說的是她在吧檯、打烊、店裡盤點，不上班的那段也不說 */
  for(const k of ['（她在吧檯後面抬頭）……嗨。','要打烊了。……你可以坐到我擦完這張桌子。','期末了。我還有一份報告沒寫，店裡也要盤點。']) S.LADDER_GREET_IF[k]={test:G=>!S.zrNoShift(G)};
  /* AA_255 第 2 節第 5 點：以安讀書會的招呼避開大二下第 8、9、16 週（when 那兩句資料已經分週次；base 這一句也照做）*/
  S.LADDER_GREET_IF['這週讀書會在萬才館，有空可以來。']={test:G=>{ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return !(T&&T.id==='Y2S2'&&[8,9,16].includes(T.week)); }};
  /* AA_378 #11（企劃線 5cd35678；源檔 6e0d1313）：以安大四上期末那句只在 12/18～12/21；讀書會那句跳過第 8～9 週（期中考週）*/
  for(const k of ['學弟。……論文寫到第四章了。','{name}。……論文寫到第四章了。']) S.LADDER_GREET_IF[k]={test:G=>{ const d=S.dayOfKey('2029-05-29'); return d==null||G.day<d||(G.day===d&&(G.hour||0)<16); }};   /* AA_510 0-2 第 5 點：學姊 5/29 16:00 口試以後不說「論文寫到第四章了」*/
  S.LADDER_GREET_IF['期末考週。書還有一半沒背完。']={test:G=>G.day>=S.dayOfKey('2028-12-18')&&G.day<=S.dayOfKey('2028-12-21')};
  S.LADDER_GREET_IF['讀書會八點開始，我先來擦白板。']={test:G=>{ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return !(T&&T.id==='Y4S1'&&[8,9].includes(T.week)); }};
  const ladGreetOk=(G,t)=>{ for(const k in S.LADDER_GREET_IF){ if(!t.startsWith(k)) continue; const R=S.LADDER_GREET_IF[k], so=ladRec(G); so.greetOnce=so.greetOnce||{}; if(R.once&&so.greetOnce[k]) return false; if(R.test&&!R.test(G)) return false; } return true; };
  const ladGreetUsed=(G,t)=>{ for(const k in S.LADDER_GREET_IF) if(t.startsWith(k)&&S.LADDER_GREET_IF[k].once){ const so=ladRec(G); so.greetOnce=so.greetOnce||{}; so.greetOnce[k]=G.day; } };
  /* 週次依條件放寬（AA_211 第 1 節第 3 點，0ba8d336）：A3-L6、Y3-L5 資料是 [16,18]（一定在 12/19 以後）；演過 ev_yu_together（12/19）的玩家從第 15 週就可以播 */
  S.LADDER_WEEK_IF={'A3-L6':{if:{events:['ev_yu_together']},week:[14,18]},'Y3-L5':{if:{events:['ev_yu_together']},week:[14,18]}};   /* AA_243 #59：16 週制起始改第 14 週 */
  S.LADDER_EVENT_ALIAS={ev_an_study_group:'ev_public_law_group'};
  /* AA_378 #9（源檔 6e0d1313 的 choiceVariants）：以安 A7-L5 選項②兩種說法一次只出一個——演過新 18 當面那一場（AN_CHOICE here：萬才館走廊）＝「妳媽媽後來呢？」，沒演過（群組、美國的私訊、還沒到）＝「妳媽媽知道嗎？」*/
  S.LADDER_CHOICE_IF['A7-L5']={'「妳媽媽後來呢？」':{flagIs:{AN_CHOICE:['here','video']}},'「妳媽媽知道嗎？」':{custom:G=>!(G&&G.flags&&['here','video'].includes(G.flags.AN_CHOICE))}};   /* AA_296 2-3-1 ①：美國路線她打來的視訊（AN_CHOICE video）也是聽她當面說完，當成 here 那一類 */
  S.ladChoices=function(st){ const R=S.LADDER_CHOICE_IF[st.id]; if(!R||!st.choices) return st.choices||[]; const ec=typeof EVENTS!=='undefined'&&EVENTS.cond; return st.choices.filter(c=>!R[c.t]||(ec&&EVENTS.cond(R[c.t]))); };
  S.ladGreet=function(G,id){ const D=S.ladData(G,id), L=D&&D.L; if(!L||!L.greet) return null; const so=ladRec(G), u=so.greetUsed[id]&&so.greetUsed[id].day===G.day?so.greetUsed[id]:(so.greetUsed[id]={day:G.day,list:[],last:(so.greetUsed[id]||{}).last}); const g=L.greet;
    const work=S.ladWorking(G,id); for(const w of (g.when||[])){ if(w.working&&!work) continue; if(!w.working&&work) continue; if(u.list.includes(w.t)) continue; if(!ladGreetOk(G,w.t)) continue; if(datingQuiet(G,w,id,g,'greet')) continue; if(ladCtxOk(G,Object.assign({},w,{t:undefined}),id)){ u.list.push(w.t); u.last=w.t; ladGreetUsed(G,w.t); return w.t; } }
    const B=(g.base||[]).filter(t=>ladGreetOk(G,t)); if(!B.length) return null;   /* base 也看 LADDER_GREET_IF（條件不到的那一句跳過）*/ const n=(((G.day*7+(so.ladder[D.key]|0)+u.list.length)%B.length)+B.length)%B.length; let t=B[n]; if(t===u.last&&B.length>1) t=B[(n+1)%B.length]; u.list.push(t); u.last=t; return t; };
  /* 播一層：她說的話 → 玩家的回答（最多 2）→ 她的收尾；rel、mem 照資料；推進一層（今天不再推進）*/
  /* linesIf／extraIf 的一套：情境 key（week、term、weekday、time、location、weather、weekParity、dayMin、locTime）照 ladCtxOk 檢查，其他（if、unless、或直接寫的條件）交給 EVENTS.cond。
     2026-10-16 AA-B 驗收：原本整套丟給 EVENTS.cond，它不認得 week 就忽略＝永遠成立（以安大一下第 3 週就說「杜鵑花謝了」）*/
  const LAD_CTX=['week','term','weekday','time','location','weather','weekParity','dayMin','locTime'];
  const ladAlt=(G,x,id,st,kind)=>{ if(!G) return ladIf(x); if(kind&&datingQuiet(G,x,id,st,kind)) return false;   /* 交往中的那一套、旁邊有她的人＝這次說一般版（S.DATING_QUIET）*/ const ctx={}, rest={}; for(const k in x){ if(k==='lines') continue; if(LAD_CTX.includes(k)) ctx[k]=x[k]; else rest[k]=x[k]; } if(Object.keys(ctx).length&&!ladCtxOk(G,ctx,id)) return false; if(rest.if&&rest.if.events) rest.if=Object.assign({},rest.if,{events:rest.if.events.map(e=>S.LADDER_EVENT_ALIAS[e]||e)}); return Object.keys(rest).length?ladIf(rest):true; };
  /* 法服的民眾服務（AA_132 F2、AA_140 G03／G47）：單週週六 9～12、第 3 週起、考試週停。day 那一週（還沒過的週六）起第一個值班的週六：{day, thisWeek}；十六週內沒有＝null（例：大一上第 16 週以後＝考試週＋七週寒假，下一次是大一下第 3 週）*/
  /* 日期字串 → 第幾天（'2026-02-14'）；找不到＝null。結果快取 */
  const dayKeyCache={}; S.dayOfKey=function(k){ if(k in dayKeyCache) return dayKeyCache[k]; let r=null; if(typeof CALENDAR!=='undefined') for(let d=-420;d<2200;d++){ if(CALENDAR.dateOf(d).key===k){ r=d; break; } }   /* 從 2024 年 8 月起（經濟系大一 Y0 是負的天數，v0）*/ dayKeyCache[k]=r; return r; };
  S.fafuSat=function(day){ if(typeof CALENDAR==='undefined'||day==null) return null; const sat0=day+(6-CALENDAR.dateOf(day).wd);
    for(let k=0;k<16;k++){ const s=sat0+7*k; if(s<=day) continue; const t=CALENDAR.termOf(s); if(t&&t.week>=3&&t.week%2===1&&!t.exam&&!CALENDAR.holiday(s)) return {day:s,thisWeek:k===0,wk:k}; } return null; };   /* wk：0＝這週六、1＝下週六…（週一開始算一週；當天是週六＝已經過了 9 點的值班，從下週算）*/
  /* 法服週六值班（V1-F，AA_163 第 1 節、BB_145）：今天是不是值班的週六；大一（Y1S1、Y1S2）可以在旁邊看（志工從大二開始，AA_132）；告示 */
  S.fafuDuty=function(G){ if(typeof CALENDAR==='undefined'||!G||(G.stage||'law')!=='law') return false; const d=CALENDAR.dateOf(G.day), t=CALENDAR.termOf(G.day); return d.wd===6&&!!t&&t.week>=3&&t.week%2===1&&!t.exam&&!CALENDAR.holiday(G.day); };   /* 國定假日、颱風假不值班（AA_184 的測試：大二上第 5 週六是 10/10 國慶日，第一次一般值班是 10/24）*/
  /* 語彤在法服值班（AA_11 事件 7、AA_177 4-6）：大二上第 3 週週六 9/26 第一次，之後每個值班的週六（characters.js heroine_03 的作息）*/
  /* 政大山下那一家吃過幾次（BB_161 ⑯）：舊存檔沒有 NCCU_FOOD_N 的，照已經完成、一定會到那一家的事件補算（K1 導遊只算點過餐的 K1_ORDER、予樂那次、12/3 的生日；「我們的日子」政大、K6 互考見面、K7 選山下的次數舊存檔分不出來，不算）*/
  S.nccuFoodLegacy=G=>{ const D=(G.events&&G.events.done)||{}, F=G.flags||{}; return (D.ev_kexin_tour_nccu&&F.K1_ORDER?1:0)+(D.ev_kexin_yule_pass?1:0)+(D.ev_kexin_birthday_y1?1:0); };
  S.YT_FAFU='no';   /* 語彤進不進法服（AA_255 第 4 節第 2 點：固定 'no'；舊存檔 flags.YT_FAFU 也照這個）*/
  S.ytFafu=G=>S.YT_FAFU==='yes';
  S.ytDutyDay=G=>{ const d0=S.dayOfKey('2026-09-26'); return d0!=null&&G.day>=d0&&S.ytFafu(G)&&S.fafuDuty(G); };
  S.fafuWatchable=G=>{ if(!S.fafuDuty(G)) return false; const t=CALENDAR.termOf(G.day); return !!t&&(/^Y1S[12]$/.test(t.id)||(/^Y[2-4]S[12]$/.test(t.id)&&!S.fafuMember(G))); };   /* 沒加入法服的玩家四年都可以在旁邊看（AA_184 第 1 節）；大二起的社員改做紀錄（S.fafuShift）*/
  /* ===== 法服週六值班：大二起的社員做初談紀錄（AA_184 定稿 ab663b90、BB_160 51a5d106；任務 V3-D25）=====
     誰：大二起、加入法服（lawclub）的玩家。哪幾天：S.fafuDuty（單週週六 9～12、第 3 週起、考試週停）；語彤事件 7（9/26）那天演事件、不抽池（事件 9 做好再加）。
     怎麼到：08:30 出發選單「法服值班（萬才館一樓 9:00）」（出發／這週請假；在臺北的家從家裡出發）＝OUT 的 goto，到萬才館一樓走到圓桌（互動「坐到圓桌（做初談紀錄）」）。
     流程：開場一句（輪流）→ 學姊排最前面的那幾句 → 民眾一位（八件依序）→「你先問什麼？」三選一 → 民眾最後一句＋學長姐的結尾 → 語彤、柏翰、學姊各一句 →
       結尾旁白（大三上她那一桌＝學姊簽名）→ 時間推進 60 分鐘 →「再待到十二點」／「先走」。不扣時段次數、不加關係數字；記 LAWCLUB_SAT_VISITS（同一個週六一次）。
     連續三次沒去：柏翰私訊「這學期的班表要排了。你還來嗎？」（來。／先不排我。＝這學期不再提醒，下學期第一週再問）。
     學姊的句子（BB_160）：每一句只說一次；在不在照年級（大二到大二下第 15 週、大三上都在；大三下在美國；大四上隔一次、大四下第 9 週以前三次一次）。
     交換路線大三下不值班：交換路線做好再接 */
  S.fafuMember=G=>{ if(!G||(G.stage||'law')!=='law'||typeof CALENDAR==='undefined') return false; const F=G.flags||{}; if(!(F.lawclub||F.CLUB_lawclub_study)) return false; const t=CALENDAR.termOf(G.day); return !!t&&/^Y[2-4]S[12]$/.test(t.id); };
  S.fafuSpecial=G=>S.ytFafu(G)&&G.day===S.dayOfKey('2026-09-26');   /* 舊的語彤事件 7（ev_y2_yt_duty，語彤在法服才有；AA_325 2-Y2-01 已退休）那天不抽池；語彤不在法服（AA_255）＝9/26 照常值班（大二最早的一次）*/
  const FAFU_WEEKS=[3,5,7,11,13,15];   /* 一學期的值班週（單週、第 3 週起、考試週停）*/
  S.fafuK=G=>{ const t=CALENDAR.termOf(G.day); return t?FAFU_WEEKS.indexOf(t.week)+1:0; };   /* 這學期第幾次值班 */
  /* 學姊不在法律服務現場（2026-10-17 AA_218 17-7、AA_238 第 2 節：大四不參加週六服務、讀碩士以後也不回法服，四年都沒有她）。
     現場帶的人：大一＝社長（現任，法三，不取名）；大二＝去年的社長（法四，顯示名「學長」，記得你）；大三、大四＝值班的學長。每次都在（原本的 S.fafuSisHere 條件改成「每次都在」）*/
  S.fafuSisHere=G=>false;
  S.fafuLead=G=>{ const t=(CALENDAR.termOf(G.day)||{}).id||''; return /^Y1/.test(t)?'法服的社長':(/^Y2/.test(t)?'學長':'值班的學長'); };   /* 說話人標籤：「社長」法服、吉他社、即興劇社共用＝寫全名「法服的社長」（AA_496 第 9 節第 6 點、AA_497 第 6 節）；旁白裡的「社長」照舊 */
  S.fafuShiftable=G=>S.fafuDuty(G)&&S.fafuMember(G)&&!S.fafuSpecial(G)&&G.hour<12&&(G.flags||{}).LAWCLUB_SAT_LAST!==G.day;
  S.FAFU_OPEN=[['雅筑學姊','今天兩桌。你跟我。'],['研究所學長','紀錄表在左邊。先寫日期。'],['研究所學長','今天人可能比較多。慢慢來。'],
    ['雅筑學姊','今天先跟我。紀錄你寫。'],['研究所學長','今天下雨，人應該不多。'],['雅筑學姊','（遞給你一枝筆）上次那枝你帶走了。']];   /* AA_469 2-2（企劃線 9f465dcef）：原本三句加三句，照順序各一次（FAFU_ROT.open＝用到第幾句；舊存檔照原本的次數接著算），用完不說開場、直接接民眾 */
  S.FAFU_CASES=[['一位大學生，機車停在騎樓被拖吊了','我只停了五分鐘。','研究所學長','那天的時間、地點先寫清楚。單子還在嗎？'],
    ['一位阿姨，樓上漏水，天花板發霉，樓上的人不開門','我不想吵架。我只想要它不要再滴。','雅筑學姊','每一次滴水都拍照、記日期。下次我們一起看。'],
    ['一位先生，網購的冰箱用三個月就壞了，店家說要自費','它才用三個月。','研究所學長','發票和對話紀錄都帶來，我們幫您整理成一頁。'],
    ['一個年輕人，借給朋友三萬元，沒有寫借據','我們很好，所以沒有寫。','雅筑學姊','有提到錢的訊息，先截圖存起來。匯款的紀錄也是。'],
    ['一位阿嬤，公寓要收一筆修繕費，她覺得不公平','我住一樓，電梯我又不用。','研究所學長','社區的規約在您手上嗎？還有開會的紀錄。先看上面寫什麼。'],
    ['一位女兒替媽媽來，媽媽在路上被推銷，買了一整套保健食品','我媽說她不好意思拒絕。','雅筑學姊','買的日期、收據、對方留的電話，今天就先找出來。'],
    ['一個高中生，打工的地方要他簽一張單子，上面寫「自願不投保」','不簽的話，他說我就不能來。','研究所學長','這張單子我們幫你問清楚，這幾天回你。'],
    ['一位太太，父親過世，兄弟姊妹對房子意見不一樣','我只是不想大家以後都不見面。','雅筑學姊','這件要請律師一起看。我們幫您排有律師的那一週。']];   /* AA_184 第 3 節（BB-B 法律查核通過，BB_160 第 2 節）*/
  /* AA_469 2-1（企劃線 9f465dcef）：第一輪八件照上面（BB 查過的法律句子不動）；第二輪（第 9～16 次）同樣八個人照順序回來講後續（[旁白, 民眾, 誰回, 回的話]；不給結論、不問「你先問什麼？」）；
     第三輪起不寫民眾，只寫一句旁白（FAFU_LOG 三句輪）。第一輪照 FAFU_ROT.cs（第幾次）。
     AA_469 第 6 節（企劃線 9a3de960f）：回訪另開計數 FAFU_ROT.bk（回訪演到第幾位）——舊存檔 cs 已經 8 以上的從回訪第 1 位開始，八位回訪演完才進旁白；旁白照 FAFU_ROT.lg 輪（從第 1 句）*/
  S.FAFU_BACK=[['（上次機車被拖吊的大學生又來了。）','單子找到了。時間我照你們說的寫下來了。','研究所學長','好。下一步我們一起看。'],
    ['（樓上漏水的阿姨又來了，手上拿著一疊照片。）','樓上終於開門了。……他也不知道在漏。','雅筑學姊','照片還是留著。'],
    ['（冰箱那位先生又來了。）','那一頁我帶去了。店家說可以換。','研究所學長','換好以前，紀錄先不要丟。'],
    ['（借錢給朋友的那位年輕人又來了。）','我截圖了。……他昨天先還了一萬。','雅筑學姊','剩下的，也照這樣記。'],
    ['（一樓的阿嬤又來了。）','規約我找到了。字好小，我孫子念給我聽。','研究所學長','下次開會的紀錄，也請他幫您拍。'],
    ['（替媽媽來的那位女兒又來了。）','我媽說，下次她會先打給我。','雅筑學姊','這樣最好。'],
    ['（那個高中生又來了，制服還沒換。）','我沒有簽。……老闆說再想想。','研究所學長','有什麼變化，再來跟我們說。'],
    ['（那位太太又來了。）','律師那一週我們去了。……大家有坐下來講。','雅筑學姊','坐下來就好。']];
  S.FAFU_LOG=['（今天來的都是第一次來的人，學長一個一個接。你把紀錄抄完。）','（上午很安靜。帶橘子的阿伯又來了，坐了一下就走。）','（今天人多，你只負責寫日期和原話。）'];
  S.FAFU_STAY=['（後來又來了一位，學長自己接了。）','（你把上週的紀錄重新抄了一次。）'];
  S.FAFU_YT=['……阿伯又來了。他每次都帶橘子。','紀錄我幫你對過了。少寫一個日期。','今天沒有麵店的人來。還好。',
    '今天阿姨問我，法服的人是不是都很會講話。我說不是。','這個月第三個漏水的。……台北的房子都在漏嗎。','我今天一個人接了一位。學長說可以。'];   /* AA_469 2-3：原本三句加三句，照順序各一次（FAFU_ROT.yt），用完以後她在、不說話（語彤不在法服：S.YT_FAFU 固定 no，現在用不到）*/
  S.FAFU_BH=['班表排好了。你下次跟雅筑學姊同一桌。'/* AA_428 §2 第 7 點：雅筑學姊＝AA_184 第 3 節繼承案那位（S.FAFU_OPEN 有她）；不用 AA_211 那一版的碩班學姊稱呼（玩家會以為是溫學姊）*/,'垃圾袋用完了，下次值班誰順便買？'];   /* 只在大二（他當社長那一年，AA_313 5-1 第 13 點）*/
  S.FAFU_BH_Y3=['我交接了。現在只排我自己的班。','學弟排錯一格。我沒說。'];   /* 大三起他是前社長（AA_313 5-1 第 13 點、5-5）*/
  S.FAFU_BH_HELLO='這學期起我排班。有事找我。';   /* 大二第一次值班（他當社長以後）的開場一句（AA_313 5-5：接社長原本只在手機）*/
  /* 學姊的句子（BB_160 第 1 節）：front＝排在最前面（開場之後）；back＝民眾之後；sign＝結尾旁白改成學姊簽名；noon＝結尾之後「（她坐到十二點。）」。每一句只說一次 */
  S.fafuSisLines=function(G,phase,o){ const F=G.flags, R=F.FAFU_SIS||(F.FAFU_SIS={}), t=CALENDAR.termOf(G.day), out={lines:[],sign:false,noon:false}; if(!t||!S.fafuSisHere(G)) return out;
    const once=(k,L)=>{ if(R[k]) return false; R[k]=G.day; out.lines.push(...L); return true; };
    const frontKey=/^Y2/.test(t.id)?'s1':(t.id==='Y3S1'?'s6':(/^Y4/.test(t.id)?'s9':null));
    if(t.id==='Y3S1') out.sign=S.fafuK(G)%2===1;   /* 隔一次和祐廷同一桌（第 1、3、5 次）＝她簽名 */
    if(phase==='front'){ if(frontKey==='s1') once('s1',['學弟，今年換你寫紀錄。','日期，還有他的原話。……還有一個，你寫完再告訴我。']);
      else if(frontKey==='s6') once('s6',['今天你跟我一桌。','先寫下來。不要急著判斷。']);
      else if(frontKey==='s9'&&once('s9',['我只是路過。'])) out.noon=true;
      return out; }
    if(frontKey&&R[frontKey]===G.day) return out;   /* 排在最前面的那一句說了的那天，民眾之後不再說 */
    if(/^Y2/.test(t.id)){ if(once('s2',['上次說的那一個。','……他最後說的那一句，要寫下來。通常最重要。'])) return out;
      if(once('s3',[{n:'（她把你的紀錄拿過去，看了一遍，還給你。）'},'原話寫得很好。……不要替他整理成好聽的話。'])) return out;
      if(o&&o.retell&&once('s4',['你讓他講完才開口。','重點是，你沒有看錶。'])) return out;
      const m3=S.dayOfKey('2027-03-19'); if(m3!=null&&G.day>=m3) once('s5',['九月我還在這裡。……換一個身分。']); return out; }
    if(t.id==='Y3S1'){ if(out.sign&&once('s7',['以前都是學長簽。……我還不太習慣。'])) return out; once('s8',['帶橘子的阿伯問我是不是升官了。','……我說，是升學。']); return out; }
    if(/^Y4/.test(t.id)){ if(once('s10',['你的紀錄，學弟拿去當範本了。','……原話都還在。'])) return out; once('s11',['我論文的第三章，是在這張圓桌旁邊想出來的。']); }
    return out; };
  S.fafuShift=async function(GM){ const G=GM.G, F=G.flags; if(!S.fafuShiftable(G)) return false; F.LAWCLUB_SAT_LAST=G.day; F.LAWCLUB_SAT_VISITS=(F.LAWCLUB_SAT_VISITS|0)+1; F.FAFU_SHIFT_N=(F.FAFU_SHIFT_N|0)+1;
    const R=F.FAFU_ROT||(F.FAFU_ROT={open:0,cs:0,stay:0,yt:0,bh:0,bk:0,lg:0}), nm=n=>({name:n}), sisWho={name:typeof SOCIAL!=='undefined'?SOCIAL.npcName('heroine_05'):'溫學姊',charId:'heroine_05'};
    const sayL=async(who,L)=>{ for(const l of L){ if(l&&l.n) await GM.say(null,l.n); else await GM.say(who,l); } };
    GM.sceneBegin(); let retell=false, sis;
    let bhHello=false;
    try{ if((R.open|0)<S.FAFU_OPEN.length){ const op=S.FAFU_OPEN[R.open|0]; R.open=(R.open|0)+1; await GM.say(nm(op[0]),op[1]); }   /* AA_469 2-2：六句只用一輪 */
      { const t=CALENDAR.termOf(G.day); if(t&&/^Y2/.test(t.id)&&!(t.id==='Y2S1'&&t.week<6)&&!F.FAFU_BH_HELLO&&S.knows('classmate_bohan',G)){ F.FAFU_BH_HELLO=G.day; bhHello=true; await GM.say({name:SOCIAL.displayName('classmate_bohan'),charId:'classmate_bohan'},S.FAFU_BH_HELLO); } }
      sis=S.fafuSisLines(G,'front'); if(sis.lines.length) await sayL(sisWho,sis.lines);
      const ci=R.cs|0, nC=S.FAFU_CASES.length, bi=R.bk|0; R.cs=ci+1;   /* AA_469 2-1：第一輪八件、第二輪回訪、第三輪起旁白；回訪另開計數（第 6 節）*/
      if(ci<nC){ const c=S.FAFU_CASES[ci]; await GM.say(null,'（'+c[0]+'。）');
        await GM.say(null,'你先問什麼？'); const k=await GM.choose([{t:'「先請他從頭講一次。」'},{t:'「先問什麼時候發生的。」'},{t:'「先問手上有什麼資料。」'}]);
        if(k===0){ retell=true; await GM.say(nm('雅筑學姊'),'好。先聽完。'); await GM.say(null,'（他講了十五分鐘。最重要的那一句，在最後。）'); }
        else if(k===1) await GM.say(nm('研究所學長'),'時間寫在最上面。對。'); else await GM.say(nm('研究所學長'),'有的話，下次帶來，會快很多。');
        await GM.say(nm('民眾'),c[1]); await GM.say(nm(c[2]),c[3]); }
      else if(bi<S.FAFU_BACK.length){ const b=S.FAFU_BACK[bi]; R.bk=bi+1; await GM.say(null,b[0]); await GM.say(nm('民眾'),b[1]); await GM.say(nm(b[2]),b[3]); }   /* 回來講後續：不問「你先問什麼？」*/
      else { const li=R.lg|0; R.lg=li+1; await GM.say(null,S.FAFU_LOG[li%S.FAFU_LOG.length]); }
      if(F.YT_LEGALAID_Y2&&S.ytFafu(G)&&S.knows('heroine_03',G)&&(R.yt|0)<S.FAFU_YT.length){ await GM.say({name:SOCIAL.displayName('heroine_03'),charId:'heroine_03'},S.FAFU_YT[R.yt|0]); R.yt=(R.yt|0)+1; }   /* AA_469 2-3：六句只用一輪 */
      { const t=CALENDAR.termOf(G.day); if(t&&!bhHello&&!(t.id==='Y2S1'&&t.week<6)&&S.knows('classmate_bohan',G)){ const L=/^Y2/.test(t.id)?S.FAFU_BH:S.FAFU_BH_Y3; await GM.say({name:SOCIAL.displayName('classmate_bohan'),charId:'classmate_bohan'},L[R.bh%2]); R.bh++; } }
      { const more=S.fafuSisLines(G,'back',{retell}); if(more.lines.length) await sayL(sisWho,more.lines); }
      { const t=CALENDAR.termOf(G.day); if(F.FAFU_SHIFT_N===1&&t&&/^Y2S[12]$/.test(t.id)){ F.FAFU_FIRST_SHIFT_Y2=G.day; await GM.say(null,'（隔壁桌，一個阿伯講了十分鐘，一直在講他兒子。大家都在翻六法。）'); } }   /* AA_325 2-Y2-01：大二第一次值班的前提畫面（語彤事件 7 新版的麵店閒聊讀 FAFU_FIRST_SHIFT_Y2，src/y2r2_3d.js）*/
      await GM.say(null,sis.sign?'（初談紀錄，一頁。學姊在最下面簽名。）':'（初談紀錄，一頁。學長在最下面簽名。）');
      GM.advance(1);
      const s=await GM.choose([{t:'再待到十二點。'},{t:'先走。'}]);
      if(s===0){ await GM.say(null,S.FAFU_STAY[R.stay%2]); R.stay++; if(G.hour<12) GM.advance(12-G.hour); }
      if(sis.noon) await GM.say(null,'（她坐到十二點。）'); }   /* BB_160 ⑨：玩家先走也照樣出現（是她坐到十二點）*/
    finally{ GM.sceneEnd(); }
    if(GM.memo) GM.memo('法服值班：做了一份初談紀錄'); if(GM.autosave) GM.autosave(); return true; };
  S.fafuNotice=function(G){ const base='法律服務　隔週週六 9:00～12:00　萬才館一樓'; if(S.fafuDuty(G)&&G.hour<12) return base; const n=S.fafuSat(G.day); if(!n) return base; const d=CALENDAR.dateOf(n.day); return base+'　下一次：'+d.m+'/'+d.d+'（六）'; };
  const FAFU_POOL=[{t:'今天來的是一位媽媽，問孩子打工被扣薪水的事。學長說：「我們先把時間和金額寫下來。」'},{lead:'又來了？站那邊，看得比較清楚。'},
    {t:'一位阿嬤來問家裡的事，說到一半開始講她先生年輕的時候。社長沒有打斷她。'},{lead:'今天那位，你回去想想看，第一個問題應該問什麼。'},
    {t:'上午很安靜，只來了一位。學長趁空檔教新的志工怎麼寫初談紀錄。'},{lead:'（在初談紀錄上劃了一條線）字要寫得讓下一個人看得懂。'},
    {t:'有人拿著一張和解書來，問能不能簽。社長說：「我們先一起看一下，上面寫了什麼。」'}];   /* AA_163 的旁白池四句、BB_145 的三句（2026-10-17 AA_238 2-3：說話的人改社長，旁白的「學姊」改「社長」），輪流、不重複到用完 */
  /* 沒加入法服、大二起還在旁邊看的玩家：學姊的句子（BB_160 第 5 節，BB-B 00fdb990；第②級）。原則和 BB_145 一樣：不講法律結論、不勸他加入。
     她在場那天（S.fafuSisHere）最多一句，和 AA_163 的旁白池一起輪、不重複到用完；每個年級第一次她在場排最前面、只一次（大二 ⓐ1／ⓐ2／ⓐ3、大三上 ⓒ、大四 ⓓ）。
     ⓐ 照大一的紀錄分：聽過「明年記得報名」（LAWCLUB_SAT_FIVE）＝ⓐ1；大一來過＝ⓐ2；大一沒來過＝ⓐ3（BB_145 第 1 節那兩句，在第一次來的那一場說）。⑦ 簽名、⑨ ⑩ 只有志工有 */
  S.fafuWYear=G=>{ const t=(CALENDAR.termOf(G.day)||{}).id||''; return /^Y2/.test(t)?'y2':(t==='Y3S1'?'y3':(/^Y4/.test(t)?'y4':null)); };
  const FAFU_FIRST2=['第一次來？站這邊聽就好。','不要插話，也先不要給意見。看我們怎麼問。……問題問對了，事情就清楚一半。'];   /* AA_238 2-1 */
  const FAFU_W1={a1:['我說過，明年可以報名。……你沒報。也好，站那邊，看得最清楚。'],a2:['沒報名，也還是來。站那邊，回去記得寫下來。'],
    a3:FAFU_FIRST2,c:['還是站旁邊？看我們怎麼問，看他在哪裡停下來。'],d:['下次換你告訴我，今天哪一句最重要。']};   /* AA_238 2-4：大二＝學長（去年的社長）、大三大四＝值班的學長 */
  S.FAFU_W1=FAFU_W1;
  S.fafuWatchLine=function(G){ const F=G.flags, W=F.FAFU_W||(F.FAFU_W={}), yr=S.fafuWYear(G), here=true;   /* 帶的人每次都在（AA_238 2-4）*/
    if(here&&yr&&!W[yr]){ W[yr]=G.day; if(yr==='y2'){ const y1seen=!!F.FAFU_Y1_SEEN||(!!F.LAWCLUB_SAT_FIRST&&!F.FAFU_FIRST_Y2PLUS); return {lead:F.LAWCLUB_SAT_FIVE?FAFU_W1.a1:(y1seen?FAFU_W1.a2:FAFU_W1.a3)}; } return {lead:yr==='y3'?FAFU_W1.c:FAFU_W1.d}; }
    const extra=[];
    if(here&&yr==='y2') extra.push({id:'wb',lead:['哪天想坐下來，跟我說。……不說也沒關係。']});   /* w5、w8、w11 是學姊自己的事，刪（AA_238 2-4）*/
    const pool=FAFU_POOL.map((q,i)=>q.lead?null:{id:'n'+i,t:q.t}).filter(Boolean).concat(extra);
    const used=Array.isArray(F.fafuWUsed)?F.fafuWUsed:(F.fafuWUsed=[]); let cand=pool.filter(q=>!used.includes(q.id)); if(!cand.length){ used.length=0; cand=pool; }
    const it=cand[0]; used.push(it.id); return it; };
  S.fafuWatch=async function(GM){ const G=GM.G, F=G.flags; if(!S.fafuWatchable(G)||G.hour>=12) return false; const lead={name:S.fafuLead(G)}, y1=/^Y1/.test((CALENDAR.termOf(G.day)||{}).id||'');
    if(y1) F.FAFU_Y1_SEEN=true;   /* 大一來看過（BB_160 第 5 節 ⓐ2 用）*/
    if(F.LAWCLUB_SAT_LAST!==G.day){ F.LAWCLUB_SAT_LAST=G.day; F.LAWCLUB_SAT_VISITS=(F.LAWCLUB_SAT_VISITS|0)+1; }   /* 同一個週六只算一次（AA_132 落點 A 讀它；大二起的值班也算）*/
    GM.sceneBegin(); try{
      if(!F.LAWCLUB_SAT_FIRST){ F.LAWCLUB_SAT_FIRST=true;   /* 第一次（AA_163 的旁白＋研究所學長；BB_145 第 1 節）*/
        await GM.say(null,'圓桌旁坐著一位阿伯，手上一疊影印的紙。他說房東不還押金。');
        await GM.say(null,'社長沒有馬上回答。他先問：「租約還在嗎？什麼時候搬走的？當初押金付了多少？」研究所的學長在旁邊一項一項寫下來。');   /* AA_238 2-1 */
        await GM.say(null,'阿伯講到一半，忽然說：「我是不是很麻煩？」'); await GM.say({name:'研究所學長'},'不會。您慢慢說，我們先把事情弄清楚。');
        if(!y1) F.FAFU_FIRST_Y2PLUS=true;
        { const who=y1?lead:{name:'值班的學長'}; await GM.say(null,y1?'（阿伯被學長帶去填表。社長走到大廳角落，在你旁邊停下來，聲音壓得很低。）':'（阿伯被學長帶去填表。值班的學長走到大廳角落，在你旁邊停下來，聲音壓得很低。）');
          for(const l of FAFU_FIRST2) await GM.say(who,l);
          if(!y1){ const W=F.FAFU_W||(F.FAFU_W={}); W[S.fafuWYear(G)]=G.day; } } }   /* AA_238 2-1：大一＝社長；大二起才第一次來的（沒加入法服）＝值班的學長，台詞同上兩句 */
      else { let it=null; if(y1&&(F.LAWCLUB_SAT_VISITS|0)>=5&&!F.LAWCLUB_SAT_FIVE){ F.LAWCLUB_SAT_FIVE=true; it={lead:'你來五次了。明年可以報名當志工，來坐圓桌。'}; }   /* BB_145 第 4 句（AA_238 2-2 改社長）：只一次、排最前 */
        else if(y1){ const used=Array.isArray(F.fafuPoolUsed)?F.fafuPoolUsed:[]; let cand=FAFU_POOL.map((q,i)=>i).filter(i=>!used.includes(i)); if(!cand.length){ used.length=0; cand=FAFU_POOL.map((q,i)=>i); } const k=cand[0]; used.push(k); F.fafuPoolUsed=used; it=FAFU_POOL[k]; }
        else it=S.fafuWatchLine(G);   /* 大二起（沒加入法服、四年都可以來看，AA_184）：學姊對旁觀的人說的話（BB_160 第 5 節）和旁白池一起輪 */
        const sayIt=async x=>{ for(const l of [].concat(x)) await GM.say(lead,l); };
        if(it.lead) await sayIt(it.lead); else await GM.say(null,it.t); if(y1||it.lead) await GM.say(null,y1?'（社長點頭，回到圓桌。）':'（學長點頭，回到圓桌。）'); }
    } finally { GM.sceneEnd(); }
    await GM.fade(true); GM.advance(Math.min(0.5,Math.max(0,12-G.hour))); await GM.fade(false); return true; };   /* 時間推進 30 分鐘，可以待到 12:00；不扣時段次數（AA_160 第 2 節）*/
  S.ladLines=function(st,g,id){ const G=g||(typeof GAME!=='undefined'&&GAME.G)||null; const alt=(st.linesIf||[]).find(x=>ladAlt(G,x,id,st,'linesIf')); const L=(alt?alt.lines:st.lines||[]).slice(); for(const x of (st.extraIf||[])) if(ladAlt(G,x,id,st,'extraIf')) L.push(...(x.lines||[])); return L; };   /* linesIf：第一個成立的那一套取代 lines；extraIf：成立就在後面多說（AA 2026-10-16）*/
  S.ladPlay=async function(GM,who,id,st){ const G=GM.G, so=ladRec(G), D=S.ladData(G,id), K=D?D.key:id; const preMem=[]; { const alt=(st.linesIf||[]).find(x=>ladAlt(G,x,id,st,'linesIf')); if(alt&&alt.mem) preMem.push(alt.mem); for(const x of (st.extraIf||[])) if(x.mem&&ladAlt(G,x,id,st,'extraIf')) preMem.push(x.mem); }   /* 播之前先決定（extraIf 的 notMemory 就是自己的記憶）*/
    for(const l of S.ladLines(st,G,id)) await GM.say(who,typeof l==='string'?l:l.t,{expression:typeof l==='object'&&l?l.e:undefined});
    let ch=null; const CH=S.ladChoices(st); if(CH.length){ const k=await GM.choose(CH.map(c=>({t:c.t}))); ch=CH[k]||CH[0]; const rp=S.ladReply(st,ch,G,id); for(const t of [].concat(rp||[])) await GM.say(who,t); }   /* reply 可以是好幾句（AA_377 6-3：語彤「……這張她眨眼了。」「你沒傳這張，是對的。」）*/
    /* 沛珊的聯絡方式（AA_310 第 7 節，AA-C 10-20 14:40）：沒有宿營、也沒去 8/31 迎新的局（9/17 開局的舊存檔）拿不到——第一次聊到她（P-L1）還沒有聯絡方式就加 */
    if(id==='classmate_peishan'&&st.id==='P-L1'&&typeof INV!=='undefined'&&INV.hasContact&&INV.addContact&&!INV.hasContact(G,'classmate_peishan')){ await GM.say(who,'……我加你好不好？上課的筆記可以互傳。'); INV.addContact(G,'classmate_peishan'); if(SOCIAL.has&&SOCIAL.meet&&!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,G.zone); }
    const rel=Object.assign({},st.rel||{}); if(ch&&ch.rel) for(const k in ch.rel) rel[k]=(rel[k]||0)+ch.rel[k]; if(Object.keys(rel).length&&SOCIAL.adjust) SOCIAL.adjust(id,rel);
    for(const m of [st.mem,ch&&ch.mem]) if(m&&SOCIAL.remember) SOCIAL.remember(id,m,st.id);
    for(const m of preMem) if(SOCIAL.remember) SOCIAL.remember(id,m,st.id);   /* linesIf／extraIf 那一套自己的記憶（BB 的芷若、子晴 ZR_ZQ_SETUP_*：只說一次，之後的線讀它）*/
    so.ladder[K]=(so.ladder[K]|0)+1; so.ladderDay[id]=G.day; if(SOCIAL.activity){ SOCIAL.activity(id,'chat'); SOCIAL.activity(id,'chatNew'); } return true; };
  /* 和她說話時：有下一層就播；沒有就短招呼。回傳 true＝處理了（呼叫的人不要再接舊的閒聊）*/
  /* AA_489 第 5 節（企劃線 c4bcf86f6）：以安在麵店的那一句「你點好了嗎？我還在看菜單。」——這一趟已經和她在麵店吃過（約她的那一筆 done、同一天、開始後兩小時內）＝換句（使用者 10-27 回報吃完追上她說話對不上；AN-MEAL-STUCK-1027 子代理）。
     一個人在麵店吃（EAT 只記日子不記時間）不算 */
  S.AN_MENU='你點好了嗎？我還在看菜單。'; S.AN_MENU_AFTER='你吃完了？我才剛到。……還在看菜單。';
  S.anAteNoodle=G=>(G.invites||[]).some(v=>v&&v.who==='heroine_01'&&v.place==='noodle'&&v.state==='done'&&v.day===G.day&&G.hour>=v.h&&G.hour<=v.h+2);
  S.ladderTalk=async function(GM,who,id,mode){ const G=GM.G; if(!S.ladData(G,id)) return false;
    const st=S.ladNext(G,id,mode); if(st) return S.ladPlay(GM,who,id,st);
    let g=S.ladGreet(G,id); if(!g) return false; if(id==='heroine_01'&&g===S.AN_MENU&&S.anAteNoodle(G)) g=S.AN_MENU_AFTER; await GM.say(who,g); if(SOCIAL.activity) SOCIAL.activity(id,'chat'); return true; };
  /* 載妹墊（AA_137 第 5 節；使用者 2026-10-15「腳踏車要可以載人」；使用者 2026-10-16 更正：「一開始腳踏車就有載妹墊不用加裝 學姊也要給我載」——取代 AA_137 的公館車行加裝、學姊走在旁邊）：
     開局就有載妹墊。誰願意坐（約好同行的人）：可昕（交往中）、以安／語彤／芷若／子晴／沛珊／學姊（熟悉以上；女生側坐）、阿凱／阿哲（跨坐）。
     台詞：AA_137 的表（SEAT_AA）、BB-B 的 LADDER.bikeSeat（芷若、子晴、沛珊）——沒有寫的就不說話（學姊坐後座的台詞等 BB-B）。
     rideMode：'ride' 坐後座、'refuse' 還不願意（一起走路） */
  const SEAT_AA={ kexin:{need:'dating',on:'出發。……不要騎太快，我在後面看不到前面。'}, heroine_01:{min:'FAMILIAR',on:'好。不准突然煞車。',decline:'我走路。……你的煞車我還不熟。'},
    heroine_03:{min:'FAMILIAR',on:'……嗯。我很輕。'}, kai:{astride:true,any:true,on:'所以 這個墊子是給我的嗎'}, zhe:{astride:true,any:true} };
  S.rideInfo=function(G,id){ let bs=(typeof LADDER!=='undefined'&&LADDER.bikeSeat&&LADDER.bikeSeat[id])||null, a=SEAT_AA[id]||null;
    if(bs&&bs.whilePartner) bs=null;   /* 學姊：BB 原本寫「有伴侶時不坐、走在旁邊」——使用者 10-16 要她也坐後座；走路的兩句不用，坐後座的台詞還沒有 */
    if(a&&a.need==='dating') return G.flags&&G.flags.dating_kexin?{mode:'ride',on:a.on}:{mode:'refuse'};
    const d=Object.assign({},a||{},bs||{}); if(!(a&&a.any)&&typeof EVENTS!=='undefined'&&!EVENTS.cond({stage:{npc:id,min:d.min||'FAMILIAR'}})) return {mode:'refuse',decline:d.decline||null};
    return {mode:'ride',on:d.on||null,off:d.off||null,astride:!!(a&&a.astride)}; };
  S.rideMode=function(n){ const G=GM_ref&&GM_ref.G; if(!G||!n) return 'ride'; return S.rideInfo(G,n.charId||n.id).mode; };
  /* 上車、下車的一句話（字幕，不停下遊戲）；一趟只說一次 */
  S.onRide=function(GM,n,on){ const G=GM.G, id=n.charId||n.id, r=S.rideInfo(G,id), nm=SOCIAL.displayName(id); if(on){ n.astride=!!r.astride; if(r.on&&GM.caption) GM.caption(nm,'「'+r.on+'」',2800); } else if(r.off&&GM.caption) GM.caption(nm,'「'+r.off+'」',2600); };
  /* 不坐後座的理由（上車前）：回傳字幕的文字；null＝可以上車 */
  S.rideBlock=function(GM,n){ const G=GM.G, id=n.charId||n.id; if(S.rideMode(n)==='ride') return null; const r=S.rideInfo(G,id), nm=SOCIAL.displayName(id); return r.decline?nm+'：「'+r.decline+'」':'（'+nm+'說她走路就好。）'; };
  S.SMALL_AFTER={};   /* 人物 id → 句子用完以後的那一句旁白（AA_497）*/
  S.SMALL_DAILY={};   /* 人物 id → fn(G,id,r,nm)：自己的一天一句（AA_519：陳助教、筱涵照學年、阿凱週五資工系館前；src/sup519_3d.js 登記）；回傳 null＝照下面的規則 */
  S.smallTalk=function(G,id){ const c=CHARACTERS[id]||{}, nm=SOCIAL.displayName(id); const R=G.social.small||(G.social.small={}), r=R[id]||(R[id]={day:0,used:[],last:null});
    if(S.SMALL_DAILY[id]){ const o=S.SMALL_DAILY[id](G,id,r,nm); if(o) return o; }
    if(r.day===G.day) return {narr:'（'+nm+'跟你打了個招呼，又忙自己的事。）',fresh:false};
    const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, tid=T?T.id:'none', hh=G.hour%24;
    const ok=e=>{ if(typeof e==='string') return true; const ec=typeof EVENTS!=='undefined'&&EVENTS.cond;
      if(e.if&&!(ec&&EVENTS.cond(e.if))) return false; if(e.unless&&ec&&EVENTS.cond(e.unless)) return false;
      if(e.term&&!e.term.includes(tid)) return false; if(e.week&&!(T&&T.week>=e.week[0]&&T.week<=e.week[1])) return false;
      if(e.location&&!(Array.isArray(e.location)?e.location:[e.location]).includes(G.zone)) return false;
      if(e.time&&!(hh>=e.time[0]&&hh<e.time[1])) return false; if(e.weekday&&!e.weekday.includes(G.weekday)) return false;
      if(e.midterm){ const n=S.daysToMidterm(G); if(n==null||n<e.midterm[0]||n>e.midterm[1]) return false; }   /* 柏翰的倒數（AA_120 7-1 第 1 項）：到第一科期中考的天數在範圍裡才說 */
      if(e.once&&r.once&&r.once[e.t]&&(e.once==='week'?r.once[e.t]===tid+':'+(T?T.week:0):(e.once!=='term'||r.once[e.t]===tid))) return false; return true; };
    const B=c.social_layer==='B';
    /* 不熟的同學（AA_120 7-2）：三句各只說一次（整個存檔，once），換學期不從頭重播；說完以後只點頭或短招呼（greetB） */
    const fill=t=>t.indexOf('{n}')<0?t:t.replace('{n}',zhNum(S.daysToMidterm(G)));
    let cands=(SMALLTALK[id]||[]).filter(ok).map(e=>({key:typeof e==='string'?e:e.t,say:fill(typeof e==='string'?e:e.t),once:typeof e==='string'?null:e.once,prio:typeof e==='string'?0:(e.prio|0)})); cands.sort((a,b)=>b.prio-a.prio);   /* prio：條件成立時先說（明軒「你看起來很累」：當天第一次見到他）*/
    if(!cands.length&&B) return greetB(G,id,r,nm,T,tid);
    if(!cands.length&&S.SMALL_AFTER[id]){ r.day=G.day; r.last='__after'; return {narr:S.SMALL_AFTER[id],fresh:false}; }   /* 句子用完以後（AA_497 1-10、2-9、4-5「之後」：宥辰、芯慈、明軒各一句旁白，取代「聊兩句天氣」；src/sup497_3d.js 登記）*/
    if(!cands.length&&c.facts&&c.facts.length) cands=c.facts.slice(0,1).map(f=>({key:'fact:'+f,narr:'（你們聊了幾句。'+nm+'：'+f+'。）'}));   /* 只用公開的 facts[0]（facts[1] 是心事）*/
    if(!cands.length){ r.day=G.day; r.last='__greet'; return {narr:'（'+nm+'跟你打了個招呼，聊了兩句天氣。）',fresh:true}; }
    let pick=cands.find(q=>!r.used.includes(q.key));
    if(!pick){ if(B){ r.day=G.day; return {narr:'（'+nm+'對你點點頭。）',fresh:false}; } r.used=[]; pick=cands.find(q=>q.key!==r.last);
      if(!pick){ r.day=G.day; r.last='__greet'; return {narr:'（'+nm+'跟你打了個招呼，聊了兩句天氣。）',fresh:true}; } }   /* 只剩一句能說：不連續兩天說同一句，中間隔一次打招呼 */
    r.used.push(pick.key); r.last=pick.key; r.day=G.day; if(pick.once){ (r.once||(r.once={}))[pick.key]=pick.once==='term'?tid:(pick.once==='week'?tid+':'+(T?T.week:0):true); }   /* once:'week'：同一週最多一次 */
    const out={fresh:true}; if(pick.say) out.say=pick.say; else out.narr=pick.narr; return out; };
  /* 不熟同學說完三句以後（AA_120 7-2 第 3 點）：開學（第 1～3 週）、期中（第 7～9 週）、期末（第 14～16 週；AA_243 #61）偶爾一句短招呼——每人每天最多一句、
     同一個人同一學期同一句只說一次；其他日子只有旁白（點頭、揮手、笑一下）。記在 r.greet＝{term, used} */
  const B_GREET=[{w:[1,3],L:['「開學了。」','「這學期修了什麼？」']},{w:[7,9],L:['「期中加油。」','「你也在趕報告嗎？」']},{w:[14,16],L:['「期末了，撐住。」','「考完了嗎？我還有一科。」']}];
  const B_NOD=['（{n}對你點點頭。）','（{n}揮了一下手。）','（{n}抬頭看了你一眼，笑了一下。）'];
  function greetB(G,id,r,nm,T,tid){ r.day=G.day; const per=T&&B_GREET.find(p=>T.week>=p.w[0]&&T.week<=p.w[1]); let hsh=0; for(const ch of id) hsh=(hsh*31+ch.charCodeAt(0))>>>0;
    if(per&&(G.day+hsh)%3===0){ const g=r.greet||(r.greet={}); if(g.term!==tid){ g.term=tid; g.used=[]; } const line=per.L.find(t=>!g.used.includes(t)); if(line){ g.used.push(line); return {say:line,fresh:false}; } }
    return {narr:B_NOD[(((G.day+hsh)%B_NOD.length)+B_NOD.length)%B_NOD.length].replace('{n}',nm),fresh:false}; }   /* 經濟系那一年 G.day 是負的：取正的餘數 */
  S.greetB=greetB;
  /* 柏翰的期中倒數：今天到這學期第一個期中考時段（照玩家的課表與日曆；放假的日子沒有課，自然跳過）的天數；這學期沒有期中考＝null */
  S.daysToMidterm=function(G){ if(typeof CLS==='undefined'||typeof CALENDAR==='undefined') return null; const t=CALENDAR.termOf(G.day); if(!t) return null;
    for(let d=G.day;d<G.day+140;d++){ const tt=CALENDAR.termOf(d); if(!tt||tt.id!==t.id) return null; if(tt.exam==='mid'&&CLS.dayItems(G,d).some(it=>it.exam==='mid')) return d-G.day; } return null; };
  const zhNum=n=>{ if(n==null) return ''; const D='零一二三四五六七八九'; if(n<10) return D[n]; if(n<20) return '十'+(n%10?D[n%10]:''); return D[Math.floor(n/10)]+'十'+(n%10?D[n%10]:''); };
  S.zhNum=zhNum;
  /* 不熟同學說心事（「其實……」）的時機（AA_120 7-2）：三句裡不需要心事的那兩句都說過了，而且今天還沒聊過新的（一天一句）；沒有台詞的人照舊聊過三次 */
  S.secretReady=function(G,id){ const L=(SMALLTALK[id]||[]).filter(e=>typeof e==='object'&&e.once&&!(e.if&&e.if.memory)); const r=(G.social.small||{})[id]; if(r&&r.day===G.day) return false;
    if(!L.length) return SOCIAL.rel(id).talked>=3; return !!(r&&r.once)&&L.every(e=>r.once[e.t]); };
  /* 當面約、交換聯絡方式（talkCharacter 和舊的 talkAn／talkZhe／talkSis／talkKai／talkYu 共用；使用者 2026-10-15：「有手機可以約人，見到本人反而不能約？」——以安、阿哲等走舊的對話，原本沒有這個選單）*/
  S.offerInvite=async function(GM,id,n,who){ const G=GM.G, c=CHARACTERS[id]; if(!c||typeof INV==='undefined') return; who=who||{name:SOCIAL.npcName(id),obj:n&&n.obj,charId:id}; { const her=c.gender==='f'?'她':'他', O=[];   /* 當面約（使用者第 3 點；src/invites3d.js）：「認識」就可以，不用聯絡方式（AA_124 1-7）*/
      /* 旁邊有她的人（女主角的圈子，AA_503 第 2 節「旁邊有人的時候：她的邀約、私密的話題不出」；src/hcircle3d.js）：不出「約她去…」、priv 的一次性選項（告白）；交換聯絡方式照常。
         每一個選項問清單上自己那一筆（S.privOk＝PRIVTALK.ok：等了 7 天、到期那天照出，AA_503 第 14 節共同的保底）；選了＝S.privLead（旁邊還有人＝先一句旁白）*/
      const pk=o=>o&&o.priv?(typeof o.privKey==='string'?o.privKey:'opt_priv'):null;
      if(INV.canInvite(G,id)&&!(G.invites||[]).some(v=>v.who===id&&v.state==='going')&&S.privOk(G,id,'invite',GM,n)) O.push({t:'約'+her+'去…',hint:'念書、吃飯、喝咖啡、散步、運動'+(typeof DATE!=='undefined'&&DATE.HEROINES&&DATE.HEROINES.includes(id)?'、出去玩':''),k:'inv'});   /* INVITE-MENU-1030：當面也能約校外（AA_535 第 2 節的分類名稱；可昕交往中也照這一份）*/
      /* 保底的「交換聯絡方式」（AA_124 1-7 第 2 點）：到「有點熟」以後還沒有聯絡方式的人；對方的一句照 INVITE_DATA.exchange（還沒寫的人用旁白）*/
      if(INV.canInvite(G,id)&&!INV.hasContact(G,id)&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf('FAMILIAR')) O.push({t:'交換聯絡方式',k:'ex'});
      for(const f of S.TALK_OPTS){ try{ for(const o of (f(G,id,GM)||[])) if(o&&o.run&&!(pk(o)&&!S.privOk(G,id,pk(o),GM,n))) O.unshift(Object.assign({k:'talk',pk:pk(o)},o)); }catch(e){ console.warn('STORY.TALK_OPTS',e); } }   /* 一次性的對話選項（STORY.TALK_OPTS.push(fn)：fn(G,id,GM) 回傳 [{t,hint,run:async(GM,who,n)}]；priv（＋privKey＝清單的 key）＝私密；例：AA_325 語彤「禮拜六法服第一次值班。」、以安「明軒的事……」）*/
      if(O.length){ O.push({t:'就這樣'}); const k=await GM.choose(O); const o=O[k]||{};
        if(o.k==='talk'&&o.run){ if(o.pk) await S.privLead(GM,o.pk,id); await o.run(GM,who,n); }
        else if(o.k==='inv'){ await S.privLead(GM,'invite',id); await INV.flow(GM,id,n,true); }
        else if(o.k==='ex'){ const L=((typeof INVITE_DATA!=='undefined'&&INVITE_DATA.exchange)||{})[id]||[{narr:'（你們交換了聯絡方式。）'}]; for(const l of L){ if(l.say) await GM.say(who,l.say); else await GM.say(null,l.narr); } INV.addContact(G,id); GM.toast&&GM.toast('加了'+SOCIAL.displayName(id)+'的聯絡方式'); } } } };
  /* 子晴 Q4 錯過的玩家（AA_360 第 4 節，第②級；使用者 10-17 回 BB-LOGIC-16）：Q4 只剩比賽那個週六（第 8 週，events.js）——她不會為了祐廷再坐一次。
     大一下第 9～11 週第一次和她說話（問過比賽 ARGUED_ABOUT_CAREER、沒有 CONTEST_DAY），開頭多她一句；記 G.flags.CONTEST_HEARD（那一天），只一次。
     不會卡 Q6：Q6 本來就可以由 Q5 的 CLAPPED 開（BB_96 625 行）。CONTEST_HEARD 記成旗標（那一天，只說一次）；AA_363 R5 起也記成她的回憶（social3d.js 的 MEMORY_LABEL，回憶面板看得到）。
     AA_363 R4：第 9～11 週照留，句子改成不管隔幾週都對（原本「上禮拜六那個比賽……」）*/
  S.CONTEST_HEARD_LINE='那個比賽，我沒去。……那天我在公館喝咖啡。';
  S.contestHeardDue=function(G,id){ if(id!=='heroine_04'||!G||!G.flags||G.flags.CONTEST_HEARD!=null||typeof SOCIAL==='undefined'||typeof CALENDAR==='undefined') return false;
    if(!SOCIAL.has('heroine_04','ARGUED_ABOUT_CAREER')||SOCIAL.has('heroine_04','CONTEST_DAY')) return false; const t=CALENDAR.termOf(G.day); return !!t&&t.id==='Y1S2'&&t.week>=9&&t.week<=11; };
  S.contestHeard=async function(GM,who,id){ const G=GM.G; if(!S.contestHeardDue(G,id)) return false; G.flags.CONTEST_HEARD=G.day; if(SOCIAL.remember) SOCIAL.remember('heroine_04','CONTEST_HEARD','');   /* AA_363 R5：回憶「聽她說那場比賽她沒去，在公館喝咖啡」*/ await GM.say(who,S.CONTEST_HEARD_LINE); return true; };
  // 與資料驅動人物對話：先看事件，再閒聊；名字依揭露階段
  S.talkCharacter=async function(id,n){ const G=GM_ref.G; if(n&&SOCIAL.npcName) n.name=SOCIAL.npcName(id);   /* 開始說話先照現在的叫法（交往中＝書瑀；生成之後才開始交往的也對，BUG-SIS-DATING-NAME-1023）*/
    { const c0=CHARACTERS[id], te=c0&&schedEnt(c0,G); if(te&&te.talkEvent&&typeof STORY_EVENTS!=='undefined'&&typeof EVENTS!=='undefined'){ const ev=STORY_EVENTS.find(q=>q.id===te.talkEvent); if(ev&&EVENTS.check(ev)){ await EVENTS.run(ev); return; } } }   /* 作息那一筆寫了 talkEvent：那一段還沒演過，找她說話就是那一段（學姊在社團博覽會的法服帳篷＝ev_sis_club_expo，和點攤位一樣；SIS-EXPO-PRESENCE-1027）*/ const first=!SOCIAL.has(id,'FIRST_MET'), unmetH=first&&/^heroine_0[1-5]$/.test(id), poolMeet=first&&typeof POOL!=='undefined'&&!!POOL.owns&&POOL.owns(id); if(!unmetH&&!poolMeet) SOCIAL.talkedTo(id);   /* poolMeet：法律系同學第一批（AA_498 2-3）的認識那一場——說出名字的那一句才算認識（按鈕、對話框在那之前是外觀描述）*/   /* 還沒見過的女主角：搭話不算認識——不加熟悉度、不揭露名字（AA 2026-10-13 P1-1：原本搭話一次名字就出現在按鈕上）；她的相遇事件自己會記（SOCIAL.meet）*/ if(EVENTS.onInteract(id)){ const lab=()=>{ n.name=SOCIAL.npcName(id); n.talkLabel=(n.staff&&!SOCIAL.has(id,'FIRST_MET'))?'和店員說話':'和'+n.name+'說話'; }; lab(); const w=setInterval(()=>{ if(!(GM_ref.D&&GM_ref.D.busyDepth>0)){ clearInterval(w); lab(); } },400); return; }   /* 事件是非同步的：演完（例：兩點半的第一次見面記下 FIRST_MET）再更新按鈕上的名字——原本在事件開始前就定了，見過以後還是「和不認識的女生說話」（v9.7 回歸 flow_first_meet C）*/
    if(typeof INV!=='undefined'){ const iv=INV.meetable(G,id); if(iv){ await INV.meet(GM_ref,iv,n); n.name=SOCIAL.npcName(id); n.talkLabel='和'+n.name+'說話'; return; } }   /* 約好的時間在約好的地方：見面 */
    if(n&&n.staff==='cafe'&&typeof ZRZQ!=='undefined'&&ZRZQ.preTalk) await ZRZQ.preTalk(GM_ref,id,{scene:true});   /* AA_385 第 4 節：芷若在吧檯上班時也一樣（她們交往中、祐廷還不知道＝她先說），演完照常點餐（src/zrzq3d.js）*/
    if(n&&n.staff==='cafe'){ await counter(GM_ref,'兩點半 Café',CAFE_MENU); n.name=SOCIAL.npcName(id); n.talkLabel=SOCIAL.has(id,'FIRST_MET')?'和'+n.name+'說話':'和店員說話'; return; }   /* 吧檯後面的店員：今天沒有她的事件（兩點半的店員一天一次）就是點餐——店員擋住了吧檯的點餐點（engine3d.js），不能讓玩家在她上班時買不到東西 */
    const GM=GM_ref; GM.sceneBegin({adv:id}); const E=GM.E; if(!n.seat) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); GM.cine('talk',E.player.obj,n.obj); const c=CHARACTERS[id]; const who={name:SOCIAL.displayName(id),obj:n.obj,charId:id,pose:n.pose}; if((id==='heroine_05'||id==='heroine_01')&&await S.twoHeartsEcho(GM,id,who)){ GM.sceneEnd(); return; }   /* 1A-02 攤牌以後第一次說話（照作息出現的她）*/ if(id==='heroine_05'&&typeof SISY23!=='undefined'&&SISY23.preTalk) await SISY23.preTalk(GM);   /* AA_379 2-3、2-6：照作息在法圖的她（talkSis 那一邊同一段）*/
    if((id==='heroine_02'||id==='heroine_04')&&typeof ZRZQ!=='undefined'&&ZRZQ.preTalk) await ZRZQ.preTalk(GM,id);   /* AA_385 第 4 節：芷若×子晴交往中、祐廷還不知道——其中一人自己告訴他，接在說話前面演，演完照常閒聊（src/zrzq3d.js；同 AA_379 2-3）*/
    /* 五位女主角的第一次見面是專屬的事件（AA_120 3-1，AA、BB 2026-10-13：只算五位女主角）：還沒見過時被搭話不走一般自我介紹、不記 FIRST_MET，只有一句旁白；舊存檔已經記下的不追溯 */
    /* 第二天錯過以安（S.tick 的 anMissed，X70）：照作息出現的以安（heroine_01，不是劇情的 an）第一次被搭話就自我介紹、記 FIRST_MET——原本走下面的「只有一句旁白」，
       錯過第二天的玩家永遠認識不了她（BB-C 10-20 用使用者 9/25 存檔重現：9/26 普通 101 門口「和沈以安說話」只有「她低頭在忙自己的事」）*/
    if(unmetH&&id==='heroine_01'&&G.flags.anMissed&&!G.flags.met_an){ await GM.say(who,'你好，我是沈以安。大家都叫我小安。',{expr:'normal'}); await GM.say(who,'……同班的，你不記得？',{expr:'normal'});
      G.flags.met_an=true; G.flags.AN_NAME_TOLD=true; SOCIAL.meet('heroine_01',G.zone); SOCIAL.talkedTo('heroine_01'); n.name=SOCIAL.npcName(id); n.talkLabel='和'+n.name+'說話'; GM.sceneEnd(); return; }
    if(unmetH){ const busy=n.seat||n.pose==='read'||n.pose==='sit'||n.idlePose==='read'; await GM.say(null,S.sisPreW1(G,id)?S.SIS_PRE_W1:busy?'（她低頭在忙自己的事，沒有注意到你。）':'（她看了你一眼，對你點了一下頭，又轉回去忙自己的事。）'); n.name=SOCIAL.npcName(id); n.talkLabel='和'+n.name+'說話'; GM.sceneEnd(); return; }
    if(first&&poolMeet&&await POOL.meet(GM,who,id,n)){}   /* 法律系同學第一批：認識的那一場（AA_498 2-3；場景裡自己記 SOCIAL.meet、熟悉＋3 信任＋3）*/
    else if(first&&typeof ECONSL!=='undefined'&&ECONSL.talk&&await ECONSL.talk(GM,who,id,n,true)){}   /* 經濟系的同學在社科圖第一次說話（AA_536，src/econsl3d.js）：不走下面「你好，我是○○。經濟系的。」那一套——旁白、現有的自我介紹、met 那一句；記 FIRST_MET、熟悉＋3 */
    else if(first){ SOCIAL.meet(id,G.zone); if(c.social_layer==='B'){ const py=SOCIAL.playerYear?SOCIAL.playerYear():1, cy=SOCIAL.yearOf?SOCIAL.yearOf(id):(c.year||1); await GM.say(who,cy>py?'「你是大'+['','一','二','三','四'][py]+'的吧？」':(py===1?(F0=>{ const L=['「……嗯？喔，你是我們班的吧。」','「你好。……我們是不是修同一堂民總？」']; if(F0.afternoonDone) L.push('「欸，你是周老師點過的那個。」'); return L[(Math.random()*L.length)|0]; })(G.flags||{}):'「……嗯？喔，你是我們班的吧。」'));   /* 年級跟著遊戲走（AA_120 7-3）*/   /* 學長姊不會說「同一堂民總」（AA_120 3-4）*/ await GM.say(who,'「我是'+c.name+'。」'); if(c.facts&&c.facts[0]) await GM.say(who,'「'+c.facts[0]+'。」'); }   /* AA_498 2-3：沒有回答選項的「……你呢？」不再出現（其他十五位的認識那一場還沒寫，先照舊自我介紹）*/ else { await GM.say(who,'「你好，我是'+c.name+'。'+(c.department||'')+'的。」',{expr:'smile'}); if(c.personality) await GM.say(null,c.personality.split('；')[0]+'。'); } SOCIAL.adjust(id,{fam:3}); }
    else { await S.contestHeard(GM,who,id);   /* 子晴 Q4 錯過的玩家：開頭多她一句（AA_360 第 4 節）*/ await S.neededMiss(GM,who,id);   /* 主線 4：上週的訊息沒回，這次見面帶過一句（AA_179 第 4 節）*/ for(const f of S.PRE_TALK){ try{ await f(GM,who,id); }catch(e){ console.warn('STORY.PRE_TALK',e); } } await S.bhSplitHeard(GM,who,id); if(typeof VAC!=='undefined'&&VAC.backGreet) await VAC.backGreet(GM,who,id); if(typeof TERMEND!=='undefined'&&TERMEND.meetLine) await TERMEND.meetLine(GM,who,id);   /* 沒去芯慈的事務所參觀：下次見面一句（AA_251 第 1 節）*/   /* 出國回來第一次遇到：閒聊前多一句（AA_242 8-7）*/ const rv=SOCIAL.reveal(id); if(SOCIAL.playUp&&await SOCIAL.playUp(GM,who,id)){ if(SOCIAL.activity) SOCIAL.activity(id,'chat'); }
      else if(typeof POOL!=='undefined'&&POOL.talk&&await POOL.talk(GM,who,id,n)){}   /* 法律系同學第一批（AA_498 第 4～8 節）：秘密、順手的事、他的線、閒聊與之後的招呼都在 src/pool3d.js */   /* 升到有點熟／朋友／好朋友以後的下一次見面：先說門檻台詞（AA_124 1-6、BB_120 第 1 節），這次就不閒聊 */
      else if(typeof ECONSL!=='undefined'&&ECONSL.talk&&await ECONSL.talk(GM,who,id,n,false)){}   /* 經濟系的同學在社科圖（AA_536，src/econsl3d.js）：每學期的閒聊、打招呼輪流；阿勳大三下 3/22 以後那一句在別處也說 */
      else if(c.social_layer==='B'&&rv==='ACQUAINTANCE'&&c.facts&&c.facts[1]&&S.secretReady(G,id)&&!SOCIAL.has(id,'SHARED_SECRET')){ await GM.say(who,'「其實……'+String(c.facts[1]).replace(/^其實/,'')+'。沒跟很多人講過。」'); SOCIAL.remember(id,'SHARED_SECRET',c.facts[1]); SOCIAL.adjust(id,{fam:4,trust:4}); const SM=G.social.small||(G.social.small={}); (SM[id]||(SM[id]={day:0,used:[],last:null})).day=G.day; }
      else if(typeof ENC!=='undefined'&&ENC.schoolTalk&&await ENC.schoolTalk(GM,who,id)){}   /* 自由出行遇到以後，下一次聊天說一句（DL-07；AA_162、BB_144 第 4 節）*/ else if(typeof DORM203!=='undefined'&&DORM203.roomTalk&&await DORM203.roomTalk(GM,who,id)){}   /* 在 203 房間跟阿哲、柏翰講話（AA_502 第 2 節；房間外照原本的閒聊）*/ else if(typeof DORMY24!=='undefined'&&DORMY24.roomTalk&&await DORMY24.roomTalk(GM,who,id)){}   /* 在 312、507、409 房間跟阿哲、柏翰講話（AA_517 第 2 節，src/dorm_y24_3d.js；房間外照原本的閒聊）*/
      else if(await S.ladderTalk(GM,who,id)){}   /* 閒聊階梯（大一上的七位＋之後的）：有資料的人走階梯，沒有的照舊閒聊 */
      else { const L=S.smallTalk(G,id); if(L.say) await GM.say(who,L.say,{expr:'smile'}); else await GM.say(null,L.narr); if(SOCIAL.activity){ SOCIAL.activity(id,'chat'); if(L.fresh) SOCIAL.activity(id,'chatNew'); } else if(L.fresh) SOCIAL.adjust(id,{fam:1}); } }   /* AA_124 1-2：今天第一次聊天熟悉 +2、聽到新的一句自在 +1（一天一次、有上限）*/
    if(!first) await S.offerInvite(GM,id,n,who);
    n.name=SOCIAL.npcName(id); n.talkLabel='和'+n.name+'說話'; GM.sceneEnd(); };
  let GM_ref=null; let libSceneOn=false; S._bindGM=GM=>{ GM_ref=GM; };   /* 單元測試用：talkCharacter 讀 GM_ref（平常由 S.populate 設）*/
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:libSceneOn']=()=>{ libSceneOn=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  function spawnCompanion(GM){ const E=GM.E; const P=E.player.obj; const lv=E.player.lv|0; const n=GM.spawnNPC('an',AN,P.position.x-Math.sin(P.rotation.y)*1.2+0.6,P.position.z-Math.cos(P.rotation.y)*1.2,{lv,beh:'follow',greet:false,talk:n=>talkAn(GM,n),talkLabel:'和小安說話'}); anTag(GM.G,n); n.followOff=1.1;
    if(E.unstick) E.unstick(n,6); return n; }   /* 和玩家同一層、站得住的地方（v9.5 審查：從萬才館二樓的門出來是校園第 1 層的平台，原本放在第 0 層，生在平台的石頭裡）。一起走的人不會每隔一段時間對你揮手 */  // 一起走的人不會每隔一段時間對你揮手
  // ---------- 進入區域時 ----------
  S.onEnter=async function(zoneId,GM,opts){ opts=opts||{}; const G=GM.G, F=G.flags, E=GM.E; if(zoneId==='dorm'&&typeof DORMY24!=='undefined'&&DORMY24.entered){ try{ DORMY24.entered(GM,opts); }catch(e){ console.warn('DORMY24.entered',e); } }   /* 312、507、409 從門口走進房間：背景室友一句旁白（AA_517 第 1 節；睡覺醒來、讀檔、劇情帶進來的不算，src/dorm_y24_3d.js）*/ if((zoneId==='library'||zoneId==='library_hall')&&!F.Y1_MID_LIB){ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day); if(t&&t.id==='Y1S2'&&(t.week===8||t.week===9)) F.Y1_MID_LIB=G.day; }   /* 大一下期中那兩週去過總圖（語彤事件 10 的選項，AA_11）*/ if(S.mainDay(G)===1&&zoneId==='dorm'&&!F.introDone&&(S.lawStart(G)===S.mainD1(G)||h(G)>=20)){ await introDorm(GM); return; }   /* 主線第一天的宿舍（選 1 的新局：已經住了幾天，晚上 8 點以後回宿舍才演；細節照 AA_195 宿舍第一晚）*/
    if(typeof INV!=='undefined'&&!opts.fromLoad&&await INV.arrive(GM,zoneId)) return;   /* 一起走過去的人到了約好的地方：見面 */
    if(zoneId==='campus'&&S.mainDay(G)===2&&!F.classDone&&!F.campusIntro&&h(G)>=12.5){   /* A6（AA_195 4-7）：選 1 的局 9/4 早上有英文，12:30 以後才演（舊局本來就是 13:05 才到）*/ F.campusIntro=true; await campusMorning(GM); return; }
    if(!S.isEcon(G)&&zoneId==='classroom'&&isThu(G)&&!F.classDone&&h(G)>=12.5&&h(G)<15.2){ await classScene(GM); return; }   /* 法律系第二天的民總；經濟系那年不演（AA-C 10-18 讀程式抓到）*/
    if(zoneId==='linze'&&isThu(G)&&!F.classDone&&h(G)>=12.5&&h(G)<15.2&&!opts.fromLoad){ await GM.sleep(700); GM.caption('','民法總則在二樓的 201 階梯教室。樓梯在大廳西側，電梯在中庭。',4200); GM.setGoal('上二樓，到 201 教室上課'); }   /* v9.4：霖澤館改成真的大樓（大廳、樓梯、二樓），教室在二樓 */
    if(zoneId==='cafe'&&F.companion==='an'&&F.plan==='cafe'){ await cafeScene(GM); return; }
    if(zoneId==='library'&&F.companion==='an'&&F.plan==='library'){ await libraryScene(GM); return; }
    if(zoneId==='dorm_hall'&&!opts.fromLoad&&(E.player.lv|0)===0){ const HM=typeof DM3!=='undefined'&&DM3.homeOf?DM3.homeOf(G):{key:'y1',plate:'203',lv:1}; const want=HM.key==='y1'?true:HM.plate;   /* 宿舍走廊（D44）：第一次從大門進來時說一次房間在哪（不是劇情，只是指路）；換了房間（AA_183 第 5 節）再說一次新的 */
      if(HM.key==='y1'?!F.dormHallHint:F.dormHallHint!==want){ F.dormHallHint=want; await GM.sleep(900); GM.caption('',HM.key==='y1'?'你和阿凱的房間在二樓，203。樓梯在走廊北邊。':'你的房間在'+(HM.floorZh||(HM.lv?'二樓':'一樓'))+'，'+HM.plate+'。'+(HM.lv?'樓梯在走廊北邊。':''),3600); } }   /* 樓層照房號（DM3.homeOf 的 floorZh：312 三樓、507 五樓、409 四樓；原本一律寫「二樓」，和字卡「五樓 507 號房」對不上）*/
    if(zoneId==='library_hall'&&F.companion==='an'&&F.plan==='library'&&!opts.fromLoad){ await GM.sleep(900); GM.caption('','自習區在二樓：從中間的大樓梯上去。',3600); GM.setGoal('上二樓的自習區（跟小安一起）'); }   /* 總圖（D43）：走到二樓就開始「總圖的下午」（S.tick）*/
    if(zoneId==='gongguan'&&F.companion==='an'&&!F.gongguanLine){ F.gongguanLine=true; await GM.sleep(1200); GM.caption(S.anLabel(G),'公館這邊人真的很多。溫州街在那邊，過馬路再往裡面走。',3600); GM.setGoal('往溫州街（跟小安一起）'); }
    if(zoneId==='wenzhou'&&F.companion==='an'&&!F.wenzhouLine){ F.wenzhouLine=true; await GM.sleep(1000); GM.caption(S.anLabel(G),'就是那間，招牌是深色的。他們開到凌晨兩點半，所以叫兩點半。',3800); GM.setGoal('進入 兩點半 Café'); }
    if(zoneId==='dorm'&&F.afternoonDone&&!F.nightKai&&GM.npc.kai){ F.nightKai=true; await GM.sleep(800); GM.caption('阿凱','喔，回來了。',2600); }
    if(G.social&&!E.player.busy&&!GM.D.active&&!opts.fromLoad){ await GM.sleep(600); if(!E.player.busy&&!GM.D.active) EVENTS.onEnter(zoneId); } };
  // ---------- 每 0.5 秒左右呼叫 ----------
  const AMBIENT=[{zone:'campus',x:-47,z:13.5,r:7,key:'bellArgue',from:8,to:18,lines:['「……所以網頁標價到底算不算要約？」','「你煩不煩，都下課了。」']},{zone:'campus',x:-18,z:13,r:5,key:'clubTable',from:10,to:17.5,lines:['「同學！法律服務社了解一下？一年級也可以喔。」']},{zone:'campus',x:34,z:-90,r:8,key:'lawPlaza',from:15.2,to:17,lines:['有人在霖澤館前的長椅上翻著判決，旁邊放著一杯沒喝完的飲料。']},{zone:'gongguan',x:-40,z:12,r:7,key:'mrt',from:17,to:22,lines:['捷運站出口湧出一波人，又很快散進巷子裡。']},{zone:'campus',x:-13.5,z:13.6,r:4,key:'festEve',from:7,to:23,lines:G=>{ const fs=termDay('Y1S1',11,6); if(!fs||G.day!==fs-1||(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'lawclub_study'))) return null; return ['公告欄：明天校慶，各社團擺攤。']; }},   /* BB_95 3-7：沒加入法服的玩家，校慶前一天走過大道的公告欄 */
    {zone:'wenzhou',x:26,z:21,r:6,key:'park',from:16,to:21,lines:G=>{ const P=typeof PARK!=='undefined'?PARK:null; if(P&&(P.catLost(G)||(P.catGone&&P.catGone(G))||(P.catCold&&P.catCold(G))||(P.entrySaid&&P.entrySaid(G))||(P.rainy&&P.rainy(G)))) return null; const n=P&&P.catName(G), awake=((+G.hour||0)%24)<(typeof WZCAT!=='undefined'&&WZCAT.AWAKE?WZCAT.AWAKE[1]:17.5); return [awake?(n||'有隻貓')+'在老樹下面走來走去。有人蹲在旁邊拍照。':'老樹下的圓椅上'+(n||'有隻貓')+'在睡覺。有人蹲在旁邊拍照。']; }}];   /* AA_493 第 1 節：貓白天會走動（J13，src/wzcat3d.js 07:00～17:30）——17:30 以前白天版、17:30 以後照原句（下雨、寒流照舊不播）*/   /* AA 定稿（第①級）：Y3S1 第 9 週貓走失時不出現；取名以後用名字。AA_283 第 2 節：今天走進公園的那一句播過了就不播（反過來 PARK.entryTick 也看這一句的 F.amb）；下雨貓在涼亭的石桌底下、公園沒有人（AA_283 第 1 節）也不播 */
  /* 待在同一個區域時，照行程該出現的人要出現、時段結束的人要離開（2026-10-11 v9.5 審查：populateSchedule 原本只在進入區域時跑，
     人物線索（S.whereIs、大地圖 👥）照時間說「阿哲在校園」，但要出去再進來他才會出現）。每 3 秒看一次（遊戲裡約 1.2 分鐘）：
     該來的人照進入區域時同一套規則補上；時段結束的人（sched，劇情生出來的不算）離玩家 12 m 以上、或不在畫面裡才離開，不在玩家眼前消失 */
  let schedT=3;
  function inView(E,o){ const cam=E.camera; if(!cam||typeof THREE==='undefined'||!THREE.Vector3.prototype.project) return true; const v=new THREE.Vector3(o.x,o.y+1.0,o.z).project(cam); return v.z<1&&Math.abs(v.x)<1.05&&Math.abs(v.y)<1.05; }
  /* 學姊在 Café／總圖（S.populate 照 sisEnt 生，原本只有走進來那一刻才看）：待在店裡、她的時段到了，也從門口走進來坐到她的位子（BB-C 10-20 X71：待在 Café 跳到 20:01 學姊沒來）。
     位子：Café 5 號、總圖 2 號（和 S.populate 同一張）；有人坐了就不來；時段剩不到 15 分鐘不來；芷若 Z3 那天 21:40～22:00 不來 */
  function sisWalkIn(GM,zoneId){ const E=GM.E, G=GM.G, F=G.flags; if((zoneId!=='cafe'&&zoneId!=='library')||GM.npc.sis||GM.npc.heroine_05||!E.zone||!E.zone.seats||!E.zone.spawn||!GM.spawnNPC) return false;
    const se=schedFor('heroine_05',zoneId,G); if(!se) return false; const hr0=h(G); if(typeof se.to==='number'&&se.to-hr0<0.25) return false;
    const z3=zoneId==='cafe'&&S.z3Pending(G); if(z3&&hr0>=S.Z3_SHUT&&hr0<22) return false;
    const st=E.zone.seats[zoneId==='cafe'?5:2]; if(!st) return false; const near=q=>q&&Math.hypot(q.x-st.x,q.z-st.z)<0.35;
    if((E.player&&near(E.player.seat))||(E.npcs||[]).some(q=>q&&(near(q.seat)||near(q.seatTarget)))) return false;
    const dr=E.zone.spawn, n=GM.spawnNPC('sis',C.sis,dr.x,dr.z,{lv:dr.lv|0,talk:x=>talkSis(GM,x)}); if(!n) return false;
    n.seatTarget=st; n.idlePose='read'; if((F.afternoonDone||S.sisEarly(G))&&typeof se.to==='number') n.until=z3&&hr0<S.Z3_SHUT?Math.min(S.Z3_SHUT,se.to):se.to;
    const sit=()=>{ n.seatTarget=null; if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose='read'; };
    const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; if(!(E.moveTo&&E.moveTo(n,ap[0],ap[1],sit,st.lv|0))) sit(); return true; }
  S.sisWalkIn=sisWalkIn;
  /* Café 的客人待在店裡也會進出（X71 後續；BB-C 10-20：「待在店裡路人一直 2 位，走出再進來是 3 位（晚上的路人數不會補）」——S.populate 只在進門那一刻照時段生）：
     每 3 秒（refreshSchedule）照 S.cafeCustomers 對一次。該走的（時段人數變少、換了一天）起身走到門口才離開（until＝現在，下面路人離開的同一套）；
     該來的（人數變多、那個位子空著）從門口走進來坐下，不在眼前憑空出現。同一天的位子是同一串的前 n 個：人數變了只會多一個或少一個。
     Z3 那天 21:25 以後不進新客人（坐不到幾分鐘又要走）；S.cafeQuiet 的時候不進、在的也走 */
  function cafeRefresh(GM){ const E=GM.E, G=GM.G; if(G.zone!=='cafe'||!E.zone||!E.zone.seats||!E.zone.spawn||!E.player) return 0;
    const hr=h(G), seats=E.zone.seats, mine=(E.npcs||[]).filter(n=>n&&n.cafeCust!=null&&!n.leaving), quiet=S.cafeQuiet(G), want=quiet?[]:S.cafeCustomers(G,seats); let k=0;
    for(const n of mine) if(!want.includes(n.cafeCust)&&(n.until==null||n.until>hr)){ n.until=hr; n.seatTarget=null; k++; }
    const z3=S.z3Pending(G); if(quiet||(z3&&hr>=S.Z3_SHUT-0.25)) return k;
    const near=(q,st)=>!!q&&Math.hypot(q.x-st.x,q.z-st.z)<0.35, busy=st=>!!st.taken||(E.player&&near(E.player.seat,st))||E.npcs.some(m=>m&&(near(m.seat,st)||near(m.seatTarget,st)));
    const dr=E.zone.spawn;
    for(const i of want){ if(mine.some(n=>n.cafeCust===i)) continue; const st=seats[i]; if(!st||busy(st)) continue;
      const o=CHAR.build(extraSpec(500+(((G.day|0)*7+i)%60))); o.position.set(dr.x,0,dr.z); o.rotation.y=dr.yaw||0;
      const n=E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',isExtra:true,cafeCust:i,lv:dr.lv|0}); if(!n) continue; n.seatTarget=st; if(z3&&hr<S.Z3_SHUT) n.until=S.Z3_SHUT; k++;
      const sit=()=>{ n.seatTarget=null; if(n.leaving) return; if(busy(st)){ n.pose=n.idlePose='idle'; n.until=h(G); return; } if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose='read'; };   /* 走到了位子被坐走（玩家先坐了）：站一下就走 */
      const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; if(!(E.moveTo&&E.moveTo(n,ap[0],ap[1],sit,st.lv|0))) sit(); }
    return k; }
  S.cafeRefresh=cafeRefresh;
  function refreshSchedule(GM){ const E=GM.E, G=GM.G; if(!G.social||!E.zone||!E.player) return; const zoneId=G.zone;
    try{ sisWalkIn(GM,zoneId); }catch(e){ console.warn('sisWalkIn',e); }   /* 學姊先（劇情的 sis，說話走 talkSis）：populateSchedule 看到她（EVENTS.npcOf 的別名）就不會再生一個 heroine_05 */
    try{ populateSchedule(zoneId,GM,true); }catch(e){ console.warn('schedule refresh failed',e); }
    if(zoneId==='lane118'&&typeof L118!=='undefined'){ try{ L118.populate(GM); }catch(e){ console.warn('L118.populate',e); } }   /* 118 巷：待在巷子裡時段到了的常客也會來（進來的時候還沒到 12:10 的話，原本整段都不會出現）*/
    if(/^l118_/.test(zoneId)&&typeof L118!=='undefined'&&L118.populateShop){ try{ L118.populateShop(GM,zoneId.slice(5)); }catch(e){ console.warn('L118.populateShop',e); } }   /* 待在店裡時段到了的常客也會來 */
    if(/^linze_[34]f$/.test(zoneId)&&typeof LZUP!=='undefined'){ try{ LZUP.populate(GM,false); }catch(e){ console.warn('LZUP.populate',e); } }   /* 待在霖澤館樓上：時段到了有人從樓梯間走進來、有人離開 */
    if(zoneId==='library_b1'&&typeof LB1!=='undefined'){ try{ LB1.populate(GM,false); }catch(e){ console.warn('LB1.populate',e); } }
    if(zoneId==='library_stacks'&&typeof LUP!=='undefined'){ try{ LUP.populate(GM,false); }catch(e){ console.warn('LUP.populate',e); } }   /* 待在書庫：時段到了有人從電梯走過來坐下、有人離開 */   /* 待在總圖 B1：時段到了有人從樓梯間走進來坐下、有人離開 */
    if(zoneId==='cafe'){ try{ cafeRefresh(GM); }catch(e){ console.warn('cafeRefresh',e); } }   /* 待在 Café：客人照時段進出 */
    if(zoneId==='dorm'){ try{ S.dormLive(GM); }catch(e){ console.warn('STORY.dormLive',e); } }   /* 待在宿舍房間：時間到了室友自己進門、上床、出門（DORM203-MATES-1028）*/
    lingerMove(GM,zoneId); roomMove(GM,zoneId);
    const P=E.player.obj.position, hr=h(G); for(const id of Object.keys(GM.npc)){ const n=GM.npc[id]; if(!n) continue; const gone=(n.sched&&n.charId===id&&!schedFor(id,zoneId,G))||(n.until!=null&&hr>=n.until); if(!gone) continue;
      if(G.flags.companion&&id===G.flags.companion) continue; const o=n.obj.position, d=Math.hypot(o.x-P.x,o.z-P.z), vis=inView(E,o);
      /* 2026-10-13 使用者試玩：「林芷若第一次講完話直接消失在校園，本來在我前面」——時段結束時只要鏡頭沒對著她就拿掉（玩家一轉頭人就不見了）。
         改成：還在附近的人先走到最近的門口／出口，走到了才離開（進了那棟樓、走出這一區）；已經在遠處又看不到的照舊直接離開 */
      if(n.leaving){ if(n.arrived||(d>=30&&!vis)||(n.stalled&&!vis)||leaveStuck(n,P)) GM.removeNPC(id); continue; }   /* n.stalled：遠處卡住站好的（engine npcStall），看不到就移除 */
      if(d>=12&&!vis){ GM.removeNPC(id); continue; }
      if(walkAway(GM,n)) continue;
      if(d<12&&vis) continue; GM.removeNPC(id); }
    for(const n of (E.npcs||[]).slice()){ if(!n||!n.isExtra||n.clerk||n.until==null||hr<n.until) continue;   /* 路人（不在 GM.npc）有 until 的：同一套，走到門口才離開（芷若 Z3 那天 Café 座位 6 的客人）*/
      const o=n.obj.position, d=Math.hypot(o.x-P.x,o.z-P.z), vis=inView(E,o);
      if(n.leaving){ if(n.arrived||(d>=30&&!vis)||(n.stalled&&!vis)||leaveStuck(n,P)) E.removeNPC(n); continue; }
      if(d>=12&&!vis){ E.removeNPC(n); continue; }
      n.pose=n.idlePose='idle'; if(walkAway(GM,n)) continue;
      if(d<12&&vis) continue; E.removeNPC(n); } }
  /* 同一區、下一個時段是「在某個位置站一下」（linger，例：芷若經原 12:10 下課後走到 101 門口的走廊，12:40 才去吃飯）：已經在場的人（坐在教室裡）起身走過去，不瞬移；
     走不到就留在原地（下一個時段照常離開）。進區域時才生出來的人直接站在那裡（spawnAt）*/
  function lingerMove(GM,zoneId){ const E=GM.E, G=GM.G; for(const id of Object.keys(GM.npc)){ const n=GM.npc[id]; if(!n||!n.sched||n.leaving||n.lingerGo||n.charId!==id) continue; const ent=schedFor(id,zoneId,G); if(!ent||ent.act!=='linger'||!ent.at) continue;
      const [x,z,yaw,lv]=ent.at; if(Math.hypot(n.obj.position.x-x,n.obj.position.z-z)<0.6&&(n.lv|0)===(lv|0)) continue; if(n.lingerFail===ent) continue;
      if(n.seat&&GM.standUp) GM.standUp(n); n.beh='idle'; n.frozen=false; n.waypoints=null; n.lingerGo=true;
      if(!E.moveTo(n,x,z,()=>{ n.lingerGo=false; n.obj.rotation.y=yaw||0; n.pose=n.idlePose='idle'; },lv|0)){ n.lingerGo=false; n.lingerFail=ent; } } }
  /* 同一區、下一個時段換到另一間（作息寫了不同的 room，坐著的動作：read、class、eat、sit）：已經在場的人起身、走過去坐到那一間的空位，不瞬移、不留在原地
     （2026-10-14 flow_b4_lecture：演講完以安、Alison 的作息換成博雅的圓桌，原本只處理「走到某一點站著」（linger）和「離開」，兩個人一直坐在 101）。
     同一間有朋友已經坐著（或正走過去）＝優先坐同一張桌子；沒有空位、走不到＝留在原地（下一個時段照常）*/
  const ROOM_ACTS=['read','class','eat','sit'];
  function roomMove(GM,zoneId){ const E=GM.E, G=GM.G; if(!E.zone||!E.zone.seats) return; for(const id of Object.keys(GM.npc)){ const n=GM.npc[id]; if(!n||!n.sched||n.leaving||n.lingerGo||n.roomGo||n.charId!==id||n.paired||n.beh==='follow') continue;
      if(G.flags&&G.flags.companion===id) continue; const ent=schedFor(id,zoneId,G); if(!ent||!ent.room||!ROOM_ACTS.includes(ent.act)||ent.seat) continue;
      const cur=(n.seat&&n.seat.room)||(n.seatTarget&&n.seatTarget.room)||null; if(cur===ent.room||n.roomFail===ent) continue;
      if(!cur&&E.zone.roomAt&&E.zone.roomAt(n.obj.position.x,n.obj.position.z,n.lv|0)===ent.room) continue;   /* 站在那一間裡（還沒坐下）：照原本的規則 */
      const busy=st=>st.taken||E.npcs.some(m=>m!==n&&(m.seat||m.seatTarget)&&Math.hypot((m.seat||m.seatTarget).x-st.x,(m.seat||m.seatTarget).z-st.z)<0.35)||(E.player&&E.player.seat&&Math.hypot(E.player.seat.x-st.x,E.player.seat.z-st.z)<0.35);
      const free=E.zone.seats.filter(st=>st.room===ent.room&&!busy(st)); if(!free.length){ n.roomFail=ent; continue; }
      const tables=new Set(E.npcs.filter(m=>m!==n&&m.charId&&(m.seat||m.seatTarget)&&(m.seat||m.seatTarget).room===ent.room).map(m=>(m.seat||m.seatTarget).table).filter(Boolean));
      const st=free.find(q=>q.table&&tables.has(q.table))||free[free.length-1]; const pz=ent.act==='class'?'sit':'read';
      const old=n.seat, oldPose=n.pose; if(n.seat&&GM.standUp) GM.standUp(n); n.beh='idle'; n.frozen=false; n.waypoints=null; n.seatTarget=st; n.roomGo=true;   /* 先站起來（座位的格子是擋住的，從座位旁邊才找得到路）*/
      const sit=()=>{ n.roomGo=false; n.seatTarget=null; if(busy(st)){ n.pose=n.idlePose='idle'; return; } if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose=pz; };
      const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; if(!E.moveTo(n,ap[0],ap[1],sit,st.lv|0)){ n.roomGo=false; n.seatTarget=null; n.roomFail=ent; if(old&&GM.sitAt){ GM.sitAt(n,old); n.pose=n.idlePose=oldPose||'sit'; } } } }   /* 走不到：坐回原來的位子 */
  /* 時段結束：走到最近的出口（區域的出口、建築入口）——走得到才走；坐著的先起身；聊天的對象回到原本的樣子 */
  /* 走向出口卡住了（BB-C 79f2cd22：23:00 要走的 Café 客人卡在門口、和站在門口的玩家疊在一起，一直沒離開）：
     兩次檢查（refreshSchedule 每 3 秒）之間幾乎沒動、而且離出口 3.5 m 以內＝當作走出去了（在門口，看起來就是出了門）*/
  function leaveStuck(n,P){ const o=n.obj.position, ex=n.leaveTo, last=n.leaveLast; n.leaveLast={x:o.x,z:o.z};
    if(ex&&P&&Math.hypot(o.x-P.x,o.z-P.z)<0.6&&Math.hypot(o.x-ex.x,o.z-ex.z)<3.5) return true;   /* 到了門口附近、碰到玩家（玩家站在入口那圈）＝當作出了門，不和玩家疊在一起（BB-C 2026-10-20 CAFE 23:00 重驗：疊了 8 遊戲分鐘）*/
    if(!ex||!last) return false; return Math.hypot(o.x-last.x,o.z-last.z)<0.2&&Math.hypot(o.x-ex.x,o.z-ex.z)<3.5; }
  S.leaveStuck=leaveStuck;
  /* 每一幀（S.tick）：要走的人走到門口附近、碰到玩家（0.6 m 內、離出口 3.5 m 內）＝當下就出門——refreshSchedule 每 3 秒（遊戲時間）才檢查一次，
     手機低幀率時一輪要十幾秒，客人疊在站在門口的玩家身上 19 秒（BB-C 7f61112f CAFE 23:00 第三次重驗：0.6 m 內要 2 秒以內）*/
  S.leaveTouch=function(GM){ const E=GM.E, P=E&&E.player&&E.player.obj&&E.player.obj.position; if(!P) return 0; let k=0;
    const near=n=>{ const o=n&&n.obj&&n.obj.position, ex=n&&n.leaveTo; return !!(o&&ex&&(n.lv|0)===(E.player.lv|0)&&Math.hypot(o.x-P.x,o.z-P.z)<0.6&&Math.hypot(o.x-ex.x,o.z-ex.z)<3.5); };
    /* 走到了出口（arrived；含 engine 判定卡在門口＝當作到了，NPC-STALL-1030）＝當下出門，不站在門口等下一輪 refreshSchedule（手機一輪十幾秒）*/
    for(const id of Object.keys(GM.npc||{})){ const n=GM.npc[id]; if(n&&n.leaving&&(n.arrived||near(n))){ GM.removeNPC(id); k++; } }
    for(const n of (E.npcs||[]).slice()){ if(n&&n.isExtra&&n.leaving&&(n.arrived||near(n))){ E.removeNPC(n); k++; } }
    return k; };
  function walkAway(GM,n){ const E=GM.E; const o=n.obj.position, lv=n.lv|0; let best=null, bd=1e9;
    for(const it of (E.interactables||[])){ if(!it.exit&&!it.enter) continue; if((it.lv|0)!==lv) continue; const dd=Math.hypot(it.x-o.x,it.z-o.z); if(dd<bd){ bd=dd; best=it; } }
    if(!best) return false;
    if(n.seat&&GM.standUp) GM.standUp(n); if(n.paired){ const b=n.paired; b.paired=null; if(b.beh==='chat'){ b.beh='idle'; b.chatWith=null; b.pose=b.idlePose='idle'; } n.paired=null; } n.chatWith=null;
    n.beh='leave'; n.frozen=false; n.waypoints=null; n.leaving=true; n.arrived=false; n.leaveTo={x:best.x,z:best.z}; n.leaveLast=null;
    if(!E.moveTo(n,best.x,best.z,()=>{ n.arrived=true; },lv)){ n.leaving=false; return false; }
    return true; }
  S.walkAway=walkAway;
  S._day2={walkChecks:p=>walkChecks(p),startWalkTalk:GM=>startWalkTalk(GM),meetAn:GM=>meetAn(GM),cafeScene:GM=>cafeScene(GM),libraryScene:GM=>libraryScene(GM),talkAn:(GM,n)=>talkAn(GM,n),classScene:GM=>classScene(GM),playLines:(GM,l)=>playLines(GM,l),spawnCompanion:GM=>spawnCompanion(GM)};   /* 測試用（tests/day2_whylaw_unit.js）：第二天下課後的邀約、走路對話、Café、總圖、之後找以安 */
  /* 麵店的固定客人（AA_110 第 6-3 節，AA 暫定：「週二、週四 17:30–19:00，阿鳳麵店裡固定有兩到四個法律系的一般同學」——是日程，不是活動）：
     上課日（不是放假）才有；同一天同一批人（日期當種子：出去再進來看到同樣的人坐同樣的位子）；坐在東西兩張桌子北側先坐（中間那張留給玩家和阿哲，
     玩家的「坐下吃麵」坐南側）；進店時已經在吃（先套好坐姿）；19:00 起身走到門口才離開；路人沒有名字（有名字的人照各自的日程）。 */
  const NDL_SEATS=[[-3,-0.3,0],[3,-0.3,0],[-3,1.3,Math.PI],[3,1.3,Math.PI]];
  /* 麵店日：上課週（不是考試週、不是國定假日）的週二、週四 */
  S.noodleDay=function(day){ if(typeof CALENDAR==='undefined') return false; const wd=CALENDAR.dateOf(day).wd, t=CALENDAR.termOf(day); return (wd===2||wd===4)&&CALENDAR.kind(day)==='term'&&!!t&&!t.exam; };
  const NDL_PINGS=['麵店 我揪了','麵店 我先到','今天阿姨有滷蛋','麵店 不用回','長桌還有位子','阿姨問你今天會不會來','七點 老位子','今天下雨 麵店比較近'];   /* AA_313 5-3：阿哲的訊息不加句號（口氣表 2-1）；AA_469 第 1 節（企劃線 9f465dcef）加到八句，照順序輪（F.ndlPingN，舊存檔照原本的次數接著）*/
  const NDL_OK='你最近都沒來 還好嗎';   /* AA_469 第 1 節：連續揪三次你都沒來＝下一個麵店日改傳這一句（一學期最多一次），之後不揪，直到你又去了一次麵店才從頭算 */
  S.NDL_PINGS=NDL_PINGS; S.NDL_OK=NDL_OK;
  /* 舊存檔沒有 F.ndlMiss（連續揪了幾次都沒來）：照手機裡傳過的算——從上一個麵店日往回數，連續幾個麵店日有阿哲的揪（rt_zhe_ndl_<日>，最多 3）*/
  S.ndlMissLegacy=function(G,p){ const F=G.flags||{}; let n=0; if(typeof PHONE==='undefined'||p==null) return 0; for(let d=p;d>=(F.noodleTableDay|0)&&n<3;d--){ if(!S.noodleDay(d)) continue; if(PHONE.sent(G,'rt_zhe_ndl_'+d)) n++; else break; } return n; };
  /* 長桌閒聊（NOODLE-TEAM-WHY-1027；AA_486 第 1-4 節〔企劃線 cd824bf41〕、AA_487〔b830dd5eb〕；句子在 src/data/noodle_table.js）：使用者 10-27「麵店團存在的必要到底是?」——
     平常的麵店日去了沒有東西演，只剩群組在揪。麵店日 17:00～21:00 人在阿鳳麵店、這一天沒有別的麵店事件要演（有的話讓給它：S.ndlOtherDue）、在麵店團群組＝一則；
     一天一則（F.ndlTalkDay），每一年一組照順序輪（F.ndlTalkN[組]＝下一則；那一則有不認識的人、條件不符合就跳下一則，下一輪再從頭看）；在場的人熟悉 +1（SOCIAL 的 classmate，一天一次）。
     走進來以後等兩秒（S.ndlTalkTick）：進門的事件（EVENTS.onEnter）、出遊、事件包先判斷 */
  const NDL_REGULARS=['zhe','yu','classmate_bohan','classmate_xinci'];
  S.ndlTalkGroup=function(G){ const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!t) return null; if(t.id==='Y1S1') return t.week>=3?'Y1':null;   /* 大一：Y1S1 第 3 週起、Y1S2 */
    return {Y1S2:'Y1',Y2S1:'Y2',Y2S2:'Y2',Y3S1:'Y3',Y3S2:'Y3',Y4S1:'Y4',Y4S2:'Y4'}[t.id]||null; };   /* 交換延畢的大五上沒有麵店日（AA_487 第 4 節）*/
  S.zheYu=function(G){ const D=(G.events&&G.events.done)||{}; return !!(D.ev_yu_together||D.ev_yu_together_call||(G.flags&&G.flags.YU_ZHE_TOLD)); };   /* 阿哲和 Alison 交往以後（現有的判斷：events.js「Alison 和阿哲坐在一起」那一句、needed_msgs yu_gift）*/
  S.ndlTalkIf=function(G,c){ if(!c) return true;
    if(c.zheYu!=null&&S.zheYu(G)!==c.zheYu) return false;
    if(c.ytShift&&!(typeof MREL!=='undefined'&&MREL.ytShift&&MREL.ytShift(G))) return false;   /* 語彤在顧店（multirel3d.js：她的作息在麵店）*/
    if(c.term){ const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!t||!c.term.includes(t.id)) return false; }
    if(c.from){ const d=S.dayOfKey(c.from); if(d==null||G.day<d) return false; }
    if(c.weeks){ const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!t||!c.weeks.includes(t.week)) return false; }   /* 第幾週（AA_491 第 7 點：考試前那兩週）*/
    if(c.weekFrom!=null){ const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!t||!(t.week>=c.weekFrom)) return false; }   /* 第幾週起（到 term 那一學期結束；AA_527 第 2 點：h504_zhe_hand 第 9 週起順延）*/
    if(c.anJapan){ const p=S.presence('heroine_01',G); if(!(p&&p.here===false&&p.kind==='abroad'&&p.away==='日本')) return false; }   /* 以安在日本（characters.js absentDates 2028-03-25～08-05）*/
    return true; };
  /* 說話的人要真的在店裡（NDL-PRESENT-1030，使用者 2026-10-30「去阿鳳麵店 出現麵店團的人 對話 但根本沒有在遊戲內出現」）：
     以前只看認不認識，Alison、柏翰、芯慈沒有麵店作息也照樣在長桌講話（閒聊 17:00～21:00，阿哲 20:30 就走了）。
     在店裡＝3D 裡有這個人（EVENTS.npcOf），或他這一刻的作息在麵店（schedFor，進門時照這個生出來）；旁白沒有點名的那幾則＝至少一位認識的麵店團在 */
  S.ndlHere=(G,id)=>!!((typeof EVENTS!=='undefined'&&EVENTS.npcOf&&EVENTS.npcOf(id))||schedFor(id,'noodle',G));
  S.ndlHereAll=(G,e)=>{ const w=(e&&e.who)||[]; return w.length?w.every(id=>S.ndlHere(G,id)):NDL_REGULARS.some(id=>S.knows(id,G)&&S.ndlHere(G,id)); };
  /* once（那一則只演一次，記在 G.flags.ndlTalkOnce）、pri（條件成立的那幾天先挑，不動輪到第幾則）：「別人說起她」加進長桌的那幾則用（AA_503～505，src/heard3d.js 加進 NOODLE_TABLE）*/
  S.ndlTalkPick=function(G){ const T=typeof NOODLE_TABLE!=='undefined'?NOODLE_TABLE:null, k=S.ndlTalkGroup(G), L=T&&k&&T[k]; if(!L||!L.length) return null;
    const N=(G.flags&&G.flags.ndlTalkN)||{}, i0=(N[k]|0)%L.length, O=(G.flags&&G.flags.ndlTalkOnce)||{};
    const ok=e=>!(e.once&&O[e.once]!=null)&&(e.who||[]).concat(e.know||[]).every(id=>S.knows(id,G))&&S.ndlTalkIf(G,e.if)&&S.ndlHereAll(G,e)&&!(e.about&&typeof HEARD!=='undefined'&&HEARD&&HEARD.herNear&&HEARD.herNear(G,e.about,(e.who||[])[0]));   /* about（別人說起她，src/heard3d.js 加進來的那幾則）：她本人在旁邊就不說（AA_527 2-1）*/
    for(let i=0;i<L.length;i++){ const e=L[i]; if(e.pri&&ok(e)) return {k,i,e}; }
    for(let n=0;n<L.length;n++){ const i=(i0+n)%L.length, e=L[i]; if(e.pri||!ok(e)) continue; return {k,i,e}; }
    return null; };
  /* 這一天有別的麵店事件要演：今天在麵店有約（出遊、邀約）、今天已經演過一件麵店事件、現在就有一件麵店事件成立（進門的、走近的、找人說話的——人要在店裡）*/
  S.ndlOtherDue=function(G){
    if(typeof OUT!=='undefined'&&OUT.rec&&OUT.rec(G).some(q=>q.day===G.day&&(q.state==='planned'||q.state==='done')&&/麵店/.test(q.place||'')&&!/麵舖/.test(q.place||''))) return true;   /* 今天在麵店有出遊（還沒去、去過都算：開學第一頓、考完的晚餐…；照 noodle_closed3d.js storyDue 的認法）*/
    if((G.invites||[]).some(iv=>iv&&iv.day===G.day&&/noodle/.test(iv.place||'')&&['accepted','going','done'].includes(iv.state))) return true;   /* 今天約了人在麵店（見過面、還沒見面都算；取消、沒赴約的不算）*/
    if(typeof STORY_EVENTS==='undefined'||typeof EVENTS==='undefined') return false; const last=(G.events&&G.events.last)||{};
    for(const ev of STORY_EVENTS){ if(!ev||ev.retired||ev.off) continue; const L=ev.location; if(!(L==='noodle'||(Array.isArray(L)&&L.includes('noodle')))) continue;
      if(last[ev.id]===G.day) return true;
      if(ev.trigger!=='enter'&&ev.trigger!=='auto'&&ev.trigger!=='interact') continue;
      const need=ev.trigger==='interact'?(ev.participants||[])[0]:(ev.near&&ev.near.npc); if(need&&!(EVENTS.npcOf&&EVENTS.npcOf(need))) continue;   /* 要走近、要找他說話的人不在店裡＝現在演不了 */
      let ok=false; try{ ok=!!EVENTS.check(ev); }catch(e){ ok=false; } if(ok) return true; }
    return false; };
  S.ndlTalkDue=function(G,other){ const F=G.flags||{}; if((G.stage||'law')!=='law'||G.zone!=='noodle'||!S.noodleDay(G.day)||F.abroad) return false; const hh=h(G); if(hh<17||hh>=21) return false;
    if(F.ndlTalkDay===G.day||typeof PHONE==='undefined'||!PHONE.inGroup(G,'noodle_team')||!S.ndlTalkPick(G)) return false;
    return other===false?true:!S.ndlOtherDue(G); };
  S.ndlTalk=async function(GM){ const G=GM.G, F=G.flags, p=S.ndlTalkPick(G); if(!p) return false; F.ndlTalkDay=G.day;
    const N=F.ndlTalkN&&typeof F.ndlTalkN==='object'?F.ndlTalkN:(F.ndlTalkN={}); if(!p.e.pri) N[p.k]=p.i+1; if(p.e.once){ const O=F.ndlTalkOnce&&typeof F.ndlTalkOnce==='object'?F.ndlTalkOnce:(F.ndlTalkOnce={}); O[p.e.once]=G.day; }
    const here=(p.e.who&&p.e.who.length)?p.e.who:NDL_REGULARS.filter(id=>S.knows(id,G)&&S.ndlHere(G,id));   /* 旁白沒有點名的那幾則：長桌上認識、而且在店裡的麵店團 */
    GM.sceneBegin(); try{ if(typeof ADV!=='undefined'){ if(ADV.preload) ADV.preload(p.e.who||[]); if(ADV.begin) ADV.begin({background:'blur'}); } await EVENTS.runLines(p.e.dialogue||[],{id:'ndl_table_'+p.k+'_'+(p.i+1)}); }
    finally { if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); }
    if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) for(const id of here) SOCIAL.activity(id,'classmate');
    return true; };
  let ndlTalkBusy=false, ndlTalkSeen=null;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:ndlTalkBusy']=()=>{ ndlTalkBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.ndlTalkTick=function(GM){ const G=GM.G; if(G.zone!=='noodle'){ ndlTalkSeen=null; return false; } if(ndlTalkBusy) return false;
    const n=GM.enterN|0; if(!ndlTalkSeen||ndlTalkSeen.n!==n) ndlTalkSeen={n,k:0}; if(++ndlTalkSeen.k<4) return false;   /* 走進來以後等兩秒（S.tick 每 0.5 秒一次）*/
    if((typeof EVENTS!=='undefined'&&EVENTS.running)||(typeof ADV!=='undefined'&&ADV.active)||!S.ndlTalkDue(G)) return false;
    ndlTalkBusy=true; S.ndlTalk(GM).catch(e=>console.warn('NDL_TALK',e)).finally(()=>{ ndlTalkBusy=false; }); return true; };
  S.noodleOn=function(G){ if(typeof CALENDAR==='undefined') return false; const h=G.hour%24, wd=CALENDAR.dateOf(G.day).wd; return (wd===2||wd===4)&&CALENDAR.kind(G.day)==='term'&&h>=17.5&&h<19; };
  S.noodleCount=G=>{ let sd=(G.day*7919+13)%2147483646+1; sd=(sd*16807)%2147483647; return 2+Math.floor(((sd-1)/2147483646)*3); };
  let ndlLastH=null;
  let springBusy=false;   /* 春假三選一的選單正在問（S.tick）*/
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:springBusy']=()=>{ springBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  function noodleRegulars(GM,entering){ const E=GM.E, G=GM.G; if(G.zone!=='noodle'||!E.player) return; const mine=E.npcs.filter(n=>n.ndlRegular);
    const hh=G.day*24+G.hour; if(ndlLastH==null||Math.abs(hh-ndlLastH)>0.2) entering=true; ndlLastH=hh;   /* 時間跳過（跳過時間、讀檔）：照新的時間直接坐好，不從門口走進來 */
    if(!S.noodleOn(G)){ for(const n of mine){ if(n.leaving) continue; if(GM.standUp) GM.standUp(n); n.leaving=true; n.beh='leave'; if(!E.moveTo(n,0,3.6,()=>E.removeNPC(n))) E.removeNPC(n); } return; }
    const P=E.player.obj.position, cnt=S.noodleCount(G);
    for(let i=0;i<cnt;i++){ if(mine.some(n=>n.ndlIdx===i)) continue; const [x,z,yaw]=NDL_SEATS[i];
      if(E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-x,n.seat.z-z)<0.3)||Math.hypot(P.x-x,P.z-z)<0.6) continue;   /* 位子有人（阿哲、玩家）就不坐 */
      const o=CHAR.build(extraSpec(300+((G.day*3+i)%60))), seat={x,z,yaw};
      if(entering){ o.position.set(x,0,z); o.rotation.y=yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'sit',idlePose:'sit',frozen:true,isExtra:true,seat,ndlRegular:true,ndlIdx:i}); continue; }
      /* 玩家在店裡時 17:30 到了：從門口走進來、走到位子坐下（不在玩家眼前憑空出現）*/
      o.position.set(0,0,3.6); o.rotation.y=Math.PI; const n=E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',isExtra:true,ndlRegular:true,ndlIdx:i});
      const ap=(GM.seatApproach&&GM.seatApproach(seat))||[x,z+(yaw?0.6:-0.6)]; if(!E.moveTo(n,ap[0],ap[1],()=>{ if(GM.sitAt) GM.sitAt(n,seat); })&&GM.sitAt) GM.sitAt(n,seat); } }
  S.noodleRegulars=noodleRegulars;
  S.refreshSchedule=refreshSchedule;
  let roomY2Busy=false, eveBusy=false, teBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:tick']=()=>{ roomY2Busy=false; eveBusy=false; teBusy=false; S._jumping=false; S._llOut=false; S._slOut=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  /* 事件包的掛勾（10-20 起，1B／1C／第 2、3 輪各自一個檔案，不必每一批都改 story3d.js）：TICKS＝每 0.5 秒（S.tick，在 1A-05 之後、在家判斷之前）、PHONE_RULES＝手機規則、
     WAKE_AT＝睡著也會醒來的時間（S.lawWakeAt）、ALARMS＝鬧鐘（S.wakeAlarms）。載入順序在 story3d.js 之後，用 STORY.TICKS.push(fn) 登記 */
  S.COMPANY=[];   /* fn(G,id,n,GM)→true＝她旁邊有她的人；也可以回傳旁邊那幾個人的 id（陣列，空的＝沒有；src/hcircle3d.js 回傳陣列，例外的那幾組才認得出是誰）*/
  /* 私密的東西現在可以出嗎（COMPANY-PRIV-1028；AA 2026-10-28 06:14 定案，AA_503 第 13 節第 3 點）：她旁邊有她的人（S.COMPANY 任一個說是）＝false，這一次不出、不演、不前進，等她一個人。
     各入口都問這一個（清單：src/privtalk3d.js 的 PRIVTALK.LIST；等了 7 天、到期那天照演也在那裡）；GM 不給＝現在綁的那一個。
     except＝不算「旁邊有人」的人（AA_503 第 14 節第 12 項、第 1 項：本來就知道的那幾組；回傳 true〔不知道是誰〕的不能例外）*/
  S.companyOf=function(G,id,n,GM){ GM=GM||GM_ref; const out=[]; for(const f of S.COMPANY){ try{ const r=f(G,id,n,GM); if(Array.isArray(r)){ for(const x of r) out.push(x); } else if(r) out.push('*'); }catch(e){ console.warn('STORY.COMPANY',e); } } return out; };
  S.crowdNow=function(G,id,n,GM,except){ return S.companyOf(G,id,n,GM).some(x=>!(except&&except.includes(x))); };
  S.privNow=(G,id,n,GM,except)=>!S.crowdNow(G,id,n,GM,except);
  /* 各入口問清單上那一筆（PRIVTALK.ok：等了 7 天、到期那天照出）；沒有 PRIVTALK（只載 story3d.js 的測試）＝只看旁邊有沒有人。privLead＝那一段開始演：旁邊還有人＝先一句旁白，清掉等待 */
  S.privOk=(G,id,key,GM,n)=>typeof PRIVTALK!=='undefined'&&PRIVTALK.ok?PRIVTALK.ok(G,id,key,GM):S.privNow(G,id,n,GM);
  S.privLead=async(GM,key,id)=>{ if(typeof PRIVTALK!=='undefined'&&PRIVTALK.lead) await PRIVTALK.lead(GM,key,id); };
  S.schedInZone=schedFor; S.walkRoutesOf=z=>walkRoutes[z]||[];   /* src/hcircle3d.js：她現在該不該在這一區（schedFor(id,區域,G)，同進區域生成那一套）、同伴配對結束以後回去走的路線（不叫 schedFor：tests/v3_p4_han3_unit.js 用 STORY.schedFor&&… 判斷沒有這個函式）*/
  S.TICKS=[]; S.PHONE_RULES=[]; S.WAKE_AT=[]; S.ALARMS=[]; S.PRE_TALK=[];   /* PRE_TALK：認識的人說話前先說一句（fn(GM,who,id)，例：書卷獎公告以後以安「名單上有你。理由？」，src/honor3d.js）*/
  S.TALK_OPTS=[]; S.ROOM_EXTRA=[];   /* TALK_OPTS＝和人說話最後的選單多一個一次性的選項（S.offerInvite）；ROOM_EXTRA＝宿舍房間物件多一件（S.roomItemList；fn(G,L) 往 L 加 [標籤, 旁白]）*/
  /* 收拾的時刻（AA_123 2-3）：分開以後一週內都沒做的玩家，一週後補一句旁白，也設 CLEANUP_DONE=true，不卡劇情（ROM.cleanupLate）。
     一週內的三選一（紙箱、阿哲的頂樓、手機筆記、BB 五位各自的物件）還沒做：任務 V6-S4 */
  let cleanupBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:cleanupBusy']=()=>{ cleanupBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.CLEANUP_LINE='（你把那件事放好了。）';
  S.cleanupTick=function(GM){ const G=GM.G; if(cleanupBusy||typeof ROM==='undefined'||!ROM.cleanupLate||!ROM.cleanupLate(G)) return false;
    cleanupBusy=true; ROM.cleanup(G); Promise.resolve(GM.say(null,S.CLEANUP_LINE)).catch(e=>console.warn('STORY.cleanupTick',e)).finally(()=>{ cleanupBusy=false; }); return true; };
  S.tick=function(GM,dt){ const G=GM.G, F=G.flags, E=GM.E; if(E.player.busy||GM.D.active||S._sleeping) return; S.leaveTouch(GM); if(S._bed&&!S._bedBusy&&!(GM.isEntering&&GM.isEntering())) S.bedClear(GM);   /* 保底（DORM-SLEEP-1030）：人還在床上、沒有在演、玩家空下來＝放回梯子前、開燈 */   /* S._sleeping：睡覺的整段（sleepNow）不開新的事件——醒來字卡那 2 秒不是劇情鎖，事件會在換房間的時候插進來（BB-C 10-20）*/ if(S._resume&&(G.zone!==S._resume.zone||G.day!==S._resume.day)) S._resume=null;   /* 被叫醒以後走出房間：回來也不再自動問床（S.resumeSleepTick）*/ const P=E.player.obj.position;
    if(!F.CEREMONY_Y1&&(G.stage||'law')==='law'&&S.week1Start(G)&&G.day===S.dayOfKey('2025-08-31')&&h(G)>=14&&F.KAI_MOVEIN){ void S.ceremonyY1(GM); return; }   /* 開學典禮（AA_195 4-4）*/
    if(S.tut830On(G)&&G.day<=S.dayOfKey('2025-09-07')&&S.tut830Tick(GM)) return;
    if(S.teaTick(GM)) return;   /* 9/2 新生茶會（AA_195 4-5）*/
    if(F.FAM_GROUP_SENT&&S.week1Start(G)&&typeof SOCIAL!=='undefined'&&!SOCIAL.has('kevin','FIRST_MET')&&(G.day>S.dayOfKey('2025-08-30')||(G.day===S.dayOfKey('2025-08-30')&&h(G)>=21))) SOCIAL.meet('kevin','family_group');   /* 8/30 家族群組＝認識 Kevin（BB_168 第 7 節，AA_200 2-12a）*/   /* 8/30 新手教學的三個目標（AA_195 4-3）*/
    S.careerTick(G);   /* 1A-01：職涯傾向的兩個起點（STUDY_AT_LAW、CAREER_Y4_BASE）*/
    if(S.cleanupTick(GM)) return;   /* V6-S4：分開以後一週都沒收拾＝補一句旁白（AA_123 2-3）*/
    S.roomY3Late(G);   /* 1A-03：大三下以後才讀檔、還沒搬到 507 的舊存檔直接記（不演）*/
    S.routeWatch(G);   /* 交換路線（1A-02，AA_315）：截止 11/18 12:00 照交往狀態定；舊選單選過、還沒截止的清掉（主迴圈每一格、跳時間、讀檔、ROM 改狀態之前也都叫，不靠這裡）*/
    schedT-=dt; if(schedT<=0){ schedT=3; refreshSchedule(GM); }
    if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'){ try{ CLS.tick(GM); }catch(e){ console.warn('CLS.tick',e); } }   /* 課表（D52）*/
    if(typeof ECONFF!=='undefined'){ try{ ECONFF.tick(GM); }catch(e){ console.warn('ECONFF.tick',e); } }   /* 經濟系在學期間事件接事件（D102，src/econff3d.js）*/
    if(typeof PHONE!=='undefined'){ try{ S.phoneRules(GM); PHONE.tick(G,out=>{ if(out.length) GM.toast('手機｜'+PHONE.notice(G,out[0]),3800); if(GM.phoneBadge) GM.phoneBadge(); }); }catch(e){ console.warn('PHONE',e); } }
    S.phoneAuto(GM);   /* 要回覆的訊息自動打開手機（D103）*/   /* 手機：排定時間的訊息（交接包 v1）*/
    if(typeof PG!=='undefined'){ try{ PG.tick(GM); }catch(e){ console.warn('PG.tick',e); } }   /* 畢業以後（AA_319，src/postgrad3d.js）：國考、第一份工作、尾聲；畢業後篇跳到下一件事 */
    if(G.zone==='noodle') noodleRegulars(GM);   /* 麵店的固定客人：時間到了進來、離開 */
    if(typeof TRIP!=='undefined'&&TRIP.at(G)){ TRIP.tick(GM); return; }
    if(typeof EXCH!=='undefined'&&EXCH.tick&&EXCH.tick(GM)) return;   /* 交換的最小流程（src/exchange3d.js）：出發日、宿舍的志願表 */   /* 自由出行途中（DL-06）：在外面的時候校園的事件不發生 */
    if(typeof HOME!=='undefined'&&HOME.winterStartDue&&HOME.winterStartDue(G)){ HOME.winterStart(GM).catch(e=>console.warn('HOME.winterStart',e)); return; }   /* 經濟系大一的寒假：回臺北的家（AA_154 A16）*/
    if(S.toLawDue(G)&&!(typeof HOME!=='undefined'&&HOME.at(G))){ S.toLaw(GM).catch(e=>console.warn('STORY.toLaw',e)); return; }   /* 經濟系 → 法律系（8/31；在家的在 home3d.js）*/
    if(S.y4Tick(GM)) return;   /* 1A-06～1A-15（AA_317、AA_318）：大四要怎麼過、第四個房間、R1 時差、收拾、畢業典禮、搬走（人在家的在 home3d.js 的 loop）*/
    if(S.coldWeekTick(GM)) return;   /* 1A-04 感冒的那一週（AA_315）：10/23 打噴嚏、10/24 晚上、10/25、10/26 可昕、期中考完的麵店 */
    if(S.exchFormTick(GM)) return;   /* 1A-05 交換志願表（AA_315）：11/17 以安在 Café、學姊在法圖、可昕的電話；11/18 截止旁白 */
    for(const f of S.TICKS){ let r=false; try{ r=f(GM,dt); }catch(e){ console.warn('STORY.TICKS',e); } if(r) return; }   /* 事件包各自的檔案（STORY.TICKS.push(fn)）：fn(GM,dt) 回傳 true＝開演了，這一輪不再往下判斷 */
    if(typeof JP!=='undefined'&&JP.tick&&JP.tick(GM)) return;   /* 日本那一學期（AA_341，src/jp3d.js）：人在日本＝2D 的據點選單；臺灣的區域、邀約、偶遇、打工都不往下跑（放在事件包之後：日本路線的事件先演）*/
    if(typeof HOME!=='undefined'&&HOME.at(G)){ HOME.tick(GM); return; }   /* 讀檔時人在臺北的家：回到家的選單（在家的時候宿舍、校園的事件不發生）*/
    if(typeof HOME!=='undefined'&&HOME.eveDue&&HOME.eveDue(G)&&!eveBusy){ eveBusy=true; HOME.eveGo(GM).catch(e=>console.warn('HOME.eveGo',e)).finally(()=>{ eveBusy=false; }); return; }   /* 除夕 17:00 以後還在宿舍：媽媽「飯快好了。」→ 回家（AA_197 1-2）*/
    if(G.zone==='dorm'&&typeof TERMEND!=='undefined'&&TERMEND.kaiDue&&TERMEND.kaiDue(G)&&!teBusy){ teBusy=true; TERMEND.kaiAsk(GM).catch(e=>console.warn('TERMEND.kaiAsk',e)).finally(()=>{ teBusy=false; }); return; }   /* 學期末沒人約：阿凱「宵夜？」（BB_203 保底）*/
    if(G.zone==='dorm'){ if(S.isEcon(G)&&S.y0Tick(GM)) return; if(S.roomY2Due(G)&&!roomY2Busy){ roomY2Busy=true; S.roomY2InDorm(GM).catch(e=>console.warn('ROOM_Y2',e)).finally(()=>{ roomY2Busy=false; }); return; }   /* ★主線 3 第二個房間 */ if(!S.roomY2Due(G)&&S.roomY3Due(G)&&!roomY2Busy){ roomY2Busy=true; S.roomY3InDorm(GM).catch(e=>console.warn('ROOM_Y3',e)).finally(()=>{ roomY2Busy=false; }); return; }   /* ★主線 5 第三個房間（1A-03）*/ S.dormItems(GM); if(fyPotsTick(GM,dt)) return; if(S.resumeSleepTick(GM,dt)) return; }
    if(S.sk02W8Due(G)){ S.sk02W8(GM).catch(e=>console.warn('SK02 W8',e)); return; }   /* SK02 沒去系辦的玩家（BB_106）*/
    S.kaiDormTick(GM);   /* 室友阿凱的宿舍事件（K-D3 鍵盤聲、K-D5 和解；吵架第 4 天自己和好）*/   /* 房間裡跟著劇情出現的東西（黃金葛、阿凱的鍵盤盒子、方奕廷的三盆植物）*/
    if(typeof CROWD!=='undefined'){ try{ CROWD.tick(GM,dt); }catch(e){ console.warn('CROWD.tick',e); } }   /* 公共場景的人流（D55）*/
    if(typeof CLS!=='undefined'&&CLS._jump&&!S._jumping&&!(GM.E.player&&GM.E.player.busy)&&!(GM.D&&GM.D.active)&&!(typeof ADV!=='undefined'&&ADV.active)){ S._jumping=true; CLS.afterSlot(GM).catch(e=>console.warn('afterSlot',e)).finally(()=>{ S._jumping=false; }); }   /* 時段次數用完 → 到下一個時段（classes3d.js S.queueJump）*/
    if(typeof INV!=='undefined'){ try{ INV.tick(GM); if(INV.walkChat) INV.walkChat(GM,dt); }catch(e){ console.warn('INV.tick',e); } }   /* 邀約：過了時間沒見到＝沒赴約；一起走過去的路上聊一句 */
    let outP=null; if(typeof OUT!=='undefined'){ try{ const p=OUT.tick(GM); outP=p; if(p&&p.catch) p.catch(e=>console.warn('OUT.tick',e)); }catch(e){ console.warn('OUT.tick',e); } }   /* 出遊（離開 3D 地圖的約）：時間到了問「出發」*/
    if(!outP&&!springBusy&&typeof PHONE!=='undefined'&&S.springPending(G)){ springBusy=true; S.springPrompt(GM).catch(e=>console.warn('spring',e)).finally(()=>{ springBusy=false; }); }   /* 春假三選一（交接包 v2 C9）*/
    if(!outP&&S.ndlTalkTick(GM)) return;   /* 麵店的長桌閒聊（NOODLE-TEAM-WHY-1027，AA_486 1-4）*/
    /* 法律學院圖書館閉館（D53，使用者 2026-10-13）：閉館前 10 分鐘廣播；過了閉館時間人還在館裡，館員請你離館（回到萬才館大廳的門口），
       並告訴你下次幾點開、可以改去總圖或回宿舍。不讓法圖變成 24 小時開放（讀檔回到閉館後的館裡也一樣）*/
    if(G.zone==='lawlib'&&typeof PLACES!=='undefined'&&PLACES.hours.lawlib&&typeof LL3!=='undefined'){ const hr=h(G), w=PLACES.windowOf('lawlib',G.day);
      if(w&&hr>=w[1]-1/6&&hr<w[1]&&F.lawlibWarn!==G.day){ F.lawlibWarn=G.day; GM.toast('廣播：「本館將於 '+PLACES.hhmm(w[1])+' 閉館，請準備離館。」',5000); }
      if(!PLACES.isOpen('lawlib',hr,G.day)&&!S._llOut){ S._llOut=true; (async()=>{ try{ GM.sceneBegin(); await GM.say(null,'館員：「同學，我們閉館了喔。」你收好東西，走出圖書館。'); GM.sceneEnd(); await GM.enter('wancai',Object.assign({},LL3.HALL)); GM.toast(PLACES.closedText('lawlib',h(G),G.day),6000); } finally { S._llOut=false; } })(); return; } }
    /* 社科院圖書館閉館（D62，使用者 2026-10-14 查證館方網頁）：和法圖一樣——閉館前 10 分鐘廣播；過了閉館時間人還在館裡，館員請你離館（回到社科院正門前）*/
    if(G.zone==='soclib'&&typeof PLACES!=='undefined'&&PLACES.hours.soclib&&typeof SL3!=='undefined'){ const hr=h(G), w=PLACES.windowOf('soclib',G.day);
      if(w&&hr>=w[1]-1/6&&hr<w[1]&&F.soclibWarn!==G.day){ F.soclibWarn=G.day; GM.toast('廣播：「本館將於 '+PLACES.hhmm(w[1])+' 閉館，請準備離館。」',5000); }
      if(!PLACES.isOpen('soclib',hr,G.day)&&!S._slOut){ S._slOut=true; (async()=>{ try{ GM.sceneBegin(); await GM.say(null,'館員：「同學，我們閉館了喔。」你收好東西，走出圖書館。'); GM.sceneEnd(); await GM.enter('campus',Object.assign({},SL3.CAMPUS)); GM.toast(PLACES.closedText('soclib',h(G),G.day),6000); } finally { S._slOut=false; } })(); return; } }
    /* 之後的週四：13:20 民法總則的目標，下課以後換成自由活動（v9.5 審查：F.classDone 第二天之後一直是 true，不會再有上課劇情來換目標，導航整晚指著空的 201）*/
    if(G.weekday===4&&F.classDone&&h(G)>=15.2&&G.goal==='13:20 民法總則（霖澤館）') GM.setGoal('下課後自由活動。去圖書館、公館，或找人聊天');
    /* 阿哲約的麵：過了 18:30 還沒到，目標的字不要停在「18:30」（使用者 2026-10-16 21:5x：19:42 還顯示 18:30，看起來像沒更新）——阿哲在店裡待到 20:30（populate），改成還在等、幾點前要到（BUG-GOALSTALE）*/
    if(F.zheInvite&&!F.zheNoodleDone&&h(G)>=18.5&&h(G)<20.5&&G.goal==='18:30 公館 阿鳳麵店（阿哲）') GM.setGoal('公館 阿鳳麵店（阿哲）：他還在等，20:30 前到',G.goalDest);
    /* 阿哲約的麵：20:30 以後阿哲就不在麵店了（populate 只在 17:30–20:30 放他），目標不能一直停在「阿鳳麵店」（2026-10-11 使用者：吃完麵目標沒更新、不知道接下來要幹嘛）*/
    if(F.zheInvite&&!F.zheNoodleDone&&h(G)>=20.5&&G.goal&&G.goal.indexOf('阿鳳麵店（阿哲）')>=0&&!(G.zone==='noodle'&&GM.npc.zhe)) GM.setGoal('今晚沒去吃麵。回宿舍休息（睡覺就到明天）');   /* 阿哲還在店裡（20:30 前進來的）就先不換 */
    if(typeof PARK!=='undefined'&&PARK.entryTick){ try{ PARK.entryTick(GM); }catch(e){ console.warn('PARK.entryTick',e); } }   /* 溫州街小公園：一天第一次走進公園的一句（AA_283 第 2 節，src/wzpark3d.js）；放在環境事件前面（同一天和公園那句 7b 只播一句）*/
    // 環境事件（每天一次）
    F.amb=F.amb||{}; for(const a of AMBIENT){ if(a.zone!==G.zone) continue; const k=a.key+G.day; if(F.amb[k]) continue; const hh=h(G); if(hh<a.from||hh>=a.to) continue; if(Math.hypot(P.x-a.x,P.z-a.z)<a.r){ const L=typeof a.lines==='function'?a.lines(G):a.lines; if(!L) continue; F.amb[k]=true; playLines(GM,L.map(l=>['',l,2800])); } }
    // 總圖（D43）：和小安約好去總圖——走上二樓自習區就開始「總圖的下午」（劇情寫的是「二樓靠牆的長桌」）
    if(G.zone==='library_hall'&&F.companion==='an'&&F.plan==='library'&&(E.player.lv|0)===1&&P.y>4.9&&GM.npc.an&&!libSceneOn){ libSceneOn=true; libraryScene(GM).finally(()=>{ libSceneOn=false; }); return; }
    /* 第二天下課以安追上來那段錯過了（那天沒在校園走出霖澤館：用手機去別的地方、睡過頭……）：第 3 天起照常開放——以安、Alison、阿哲、學姊照作息出現
       （等同她邀你、你沒跟去那條路）；以安第一次說話時自我介紹（talkAn 的 anMissed）、不說咖啡廳那段的回聲（anAfter）。
       原本 afternoonDone 永遠不會成立，LEGACY_IDS 的人一直不出現（2026-10-20 使用者存檔：9/18 那段沒觸發，到 9/25 一個女主角都沒遇到；X70、BUG-MEET-HEROINES-1020）*/
    if(!S.isEcon(G)&&S.mainDay(G)>=3&&!F.metAn&&!F.anSkipped&&!F.afternoonDone){ F.afternoonDone=true; F.anMissed=true; F.anAfter=true; }
    // 下課後：小安追上來
    if(G.zone==='campus'&&S.mainDay(G)===2&&!F.metAn&&!F.anSkipped&&(F.classDone||h(G)>=15.3)){ const DR=(typeof B3!=='undefined'&&B3.CAMPUS_DOOR)||{x:34,z:-100}; const d=Math.hypot(P.x-DR.x,P.z-DR.z);   /* 走出霖澤館大廳之後再走 6 m，小安追上來 */ if(d>6||!F.classDone){ if(!F.classDone){ F.classDone=true; F.classAnswer='absent'; GM.memo('翹掉了民法總則'); } F.metAn=true; meetAn(GM); } }
    // 太晚了
  };
  // 電梯：和小安約好在總圖二樓自習區時，3F 閱覽區先不去（game3d.js 的 elevatorRide 問這裡）
  S.elevatorLock=function(f,GM){ const F=GM.G.flags; if(f.zone==='library'&&F.companion==='an'&&F.plan==='library') return {hint:'和小安約好在二樓自習區',toast:'和小安約好在二樓的自習區讀書，先到二樓。'}; return null; };
  /* 凌晨 2:30 還沒睡：在外面就走回宿舍睡；已經在宿舍（房間、走廊）就直接睡著（2026-10-13 審查：原本在宿舍可以一直不睡，G.day 不換、隔天的課變成「還沒開始」）*/
  S.forceHome=async function(GM){ const G=GM.G; if(G.flags._forcing) return; G.flags._forcing=true; try{ if(typeof HOME!=='undefined'&&((HOME.breakMode&&HOME.breakMode(G))||(HOME.baseMode&&HOME.baseMode(G))||(HOME.pgHome&&HOME.pgHome(G)))&&!HOME.at(G)){   /* pgHome：畢業後退宿、住臺北的家（AA_357 1-5）：凌晨回家，不回宿舍 */ GM.sceneBegin(); await GM.say(null,'已經凌晨了。'); GM.sceneEnd(); G.flags.companion=null; HOME.rec(G).at=false; G.flags._forcing=false; await HOME.go(GM); return; }   /* 放假模式出門赴約（AA_183）、經濟系休學住家裡（BB_214 第 5 點：原本送回 412）：凌晨了＝回家（不回宿舍）*/
    if(typeof EXCH!=='undefined'&&EXCH.inUS&&EXCH.inUS(G)){ const inApt=G.zone==='us_apartment'; GM.sceneBegin(); await GM.say(null,inApt?'已經凌晨了。你撐不住，躺上床就睡著了。':'已經凌晨了。'); GM.sceneEnd(); G.flags.companion=null; if(!inApt) await GM.enter('us_apartment',EXCH.SPAWN.us_apartment); await sleepNow(GM); return; }   /* 在美國：回公寓睡（不走回台灣的宿舍）*/
    if(typeof HOME!=='undefined'&&HOME.suite&&HOME.suite(G)){ GM.sceneBegin(); await GM.say(null,'已經凌晨了。'); GM.sceneEnd(); G.flags.companion=null; await GM.fade(true); if(GM.titleCard) await GM.titleCard('公館的套房','',1800); await GM.enter('gongguan',Object.assign({},Y4_GG)); await GM.fade(false); await sleepNow(GM); return; }   /* AA_363 T7-2：住公館套房的（已經退宿）凌晨回套房睡，不走回宿舍（套房沒有 3D：字卡＋公館，同 1A-15 搬過去那一場）*/
    const home=G.zone==='dorm'; GM.sceneBegin(); await GM.say(null,home?'已經凌晨了。你撐不住，躺上床就睡著了。':'已經凌晨了。你的腳自己往宿舍走。'); GM.sceneEnd(); G.flags.companion=null; if(!home) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await sleepNow(GM); } finally { G.flags._forcing=false; } };
  // ---------- 互動 ----------
  S.interact=async function(it,GM){ const G=GM.G, F=G.flags, E=GM.E; S._resume=null;   /* 玩家自己去做別的事：睡著被叫醒以後不再自動問床的選單（S.resumeSleepTick）*/
    if(it.exchFly&&typeof EXCH!=='undefined'){ await EXCH.interact(GM,it); return true; }   /* 登機（src/exchange3d.js）；宿舍的交換申請選單拿掉了（1A-02） */
    if(it.airportBoard&&typeof EXCH!=='undefined'&&EXCH.interact&&await EXCH.interact(GM,it)) return true;   /* 出境大廳安檢入口「登機」：寒暑假出國、日本路線等登機的時候（E08，exchange3d.js S.airBoard）；沒有要搭的飛機＝照舊看告示「今天沒有要搭的飛機。」*/
    if(it.teaTable){ if(GM.G.flags.TEA_STEP>=3) await S.teaKevin(GM); else await S.teaTable(GM); return true; }   /* 9/2 新生茶會：窗邊家族那一桌（學姊那段以後：Kevin 一句）*/
    if(it.park&&typeof PARK!=='undefined'){ await PARK.interact(GM,it); return true; } if(it.wzShop&&typeof WZS!=='undefined'){ await WZS.interact(GM,it); return true; }   /* 溫州街三家店的選單（AA_172）*/   /* 溫州街小公園（AA_171）*/
    if(it.home){ if(typeof HOME!=='undefined') await HOME.go(GM); return true; }   /* 回臺北的家（src/home3d.js）*/
    if(it.deskStudy){ await deskScene(GM,it); return true; }
    if(it.roomItems){ await roomItems(GM); return true; }
    if(it.pothos){ await pothosScene(GM); return true; }
    if(it.kaiBox){ await kaiBoxScene(GM,it); return true; }
    if(it.fafuWatch){ await S.fafuWatch(GM); return true; }   /* 法服週六值班（V1-F）*/
    if(it.fafuShift){ await S.fafuShift(GM); return true; }   /* 法服週六值班：大二起的社員（V3-D25）*/
    if(it.fyPots){ await fyPotsScene(GM); return true; }
    if(it.sleep){ await bedScene(GM); return true; }
    if(it.cafeRota){ GM.sceneBegin(); try{ for(const l of S.cafeRota(G)) await GM.say(null,l); } finally { GM.sceneEnd(); } return true; }   /* 兩點半 Café 牆上的班表（BB_159）*/
    if(it.counter==='cafe'){ await counter(GM,'兩點半 Café',CAFE_MENU); return true; }
    if(it.shop==='cvs'){ await counter(GM,'便利商店',[['飯糰',35,12],['美式咖啡',45,8],['運動飲料',30,6],['微波義大利麵',75,22]].concat(S.tut830Items(G)).concat(typeof PARK!=='undefined'&&PARK.catName(G)?[['小罐貓罐頭',35,0,G=>{ G.daily=G.daily||{}; G.daily.catCans=(G.daily.catCans|0)+1; }]]:[])); return true; }   /* 貓罐頭（AA_164 5-4、AA_171 第 7 節）：取了名字以後才會想到要買；買過幾罐（G.daily.catCansN）由 SIDEQ.atShop 記（AA_397 SQ08）*/
    if(it.shop==='tea'){ await counter(GM,'清葉茶行',[['珍珠奶茶',60,10],['青茶 微糖',40,6]]); return true; }
    if(it.shop==='book'){ await bookshop(GM); return true; }
    if(it.shop==='bike'){ if(typeof SIDEQ!=='undefined'&&SIDEQ.bikeShop) await SIDEQ.bikeShop(GM); return true; }   /* 公館輪轉單車「找車行老闆」（LAWWW2 10-23；SQ16 AA_405）：SIDEQ.bikeShop 有了才顯示（zones3d.js 的 hidden）*/
    if(it.eat==='noodle'){ await noodleScene(GM,it); return true; }
    if(it.shop118&&typeof L118!=='undefined'){ await L118.order(GM,it.shop118); return true; }   /* 118 巷店門口點餐（src/lane118.js，AA_280）*/
    if(it.notice==='lawclub'){ GM.sceneBegin(); /* 最後一句（AA_485 3-4，CLUBFAIR-REAL-1027）：錯過社博的也知道週六上午可以去萬才館一樓 */ await GM.say(null,'【法律服務社 招募新社員】隔週週六上午，萬才館一樓，民眾法律諮詢（學長姊帶著做）。新社員先跟著旁聽、做紀錄。報名請到社團博覽會的攤位，或週六上午到萬才館一樓找值班的學長姊。'); if(!F.lawclub&&!S.isEcon(G)){ F.lawclub=true; GM.memo('看了法律服務社的招募公告'); GM.addNote('club_law','法律服務社','隔週週六上午 萬才館一樓（民眾法律諮詢）。新社員先旁聽、做紀錄。');   /* AA-C 2026-10-18 01:2x（比對工具）：週三讀書會、模擬法庭、聯絡人溫學姊都是作廢的設定（法服沒有讀書會 BB_191 §7、學姊不在法服）*/   /* 地點、週次照 AA_110 6-8（原本寫萬才館 201：遊戲裡沒有這間）；BUG-10：照 AA_132 F7 的新字（麵店那一版 F7 原文多「阿哲說一年級去會被操」，看公告的玩家沒聽阿哲說過，不放）*/ } GM.sceneEnd(); return true; }
    if(it.mrt){ if(typeof TRIP!=='undefined'){ await TRIP.menu(GM); return true; } GM.sceneBegin(); await GM.say(null,'捷運公館站。今天的生活範圍還在走路可以到的地方。'); GM.sceneEnd(); return true; }   /* 自由出行（DL-06，AA_160 第 5 節）*/
    /* 201 的課照課表（src/classes3d.js，D52）；沒有課的時候照常走得進去（D54）。v9.5 以前：週四、週二以外會先跳一句「今天沒有民法總則」 */
    if(it.exit&&it.exit.to==='classroom'&&S.mainDay(G)===2&&isThu(G)&&h(G)>=15.2&&!F.classDone){ F.classDone=true; GM.toast('你錯過了今天的民法總則'); G.flags.classAnswer='absent'; return false; }
    if(it.exit&&PLACES.typhoonClosed&&PLACES.typhoonClosed(it.exit.to,G.day)){ GM.toast(PLACES.closedText(it.exit.to,h(G),G.day),4500); return true; }   /* 颱風假店家不開（AA_160 3-4 D）*/
    if(it.exit&&it.exit.to==='noodle'&&typeof NOODLE_CLOSED!=='undefined'&&await NOODLE_CLOSED.door(GM)) return true;   /* 阿鳳麵店過年店休（AA_333；src/noodle_closed3d.js）：鐵門、語彤刷椅子腳；那天在麵店有約照常進去 */
    if(it.exit&&/^wz_(brunch|print|teahouse|lin|teishoku)$/.test(it.exit.to)&&!PLACES.isOpen(it.exit.to,h(G),G.day)){ GM.toast(PLACES.closedText(it.exit.to,h(G),G.day),4500); return true; }   /* 溫州街新店的營業時間（AA_164 1-2；林家乾麵、巷子裡定食 AA_364 第 2 節：一天兩段、週一／週二公休）*/
    if(it.exit&&it.exit.to==='cafe'&&!PLACES.isOpen('cafe',h(G))){ GM.toast(PLACES.closedText('cafe',h(G)),4500); return true; }   /* 開放時間在 src/data/places.js（入口標記、大地圖讀同一份）*/
    if(it.exit&&it.exit.to==='lawlib'&&G.zone==='wancai'&&!PLACES.isOpen('lawlib',h(G),G.day)){ GM.toast(PLACES.closedText('lawlib',h(G),G.day),5500); return true; }
    if(it.exit&&it.exit.to==='soclib'&&G.zone==='campus'&&!PLACES.isOpen('soclib',h(G),G.day)){ GM.toast(PLACES.closedText('soclib',h(G),G.day),5500); return true; }   /* 社科院圖書館（D62）：只擋從校園進去 */   /* 法律學院圖書館（D46）：只擋從大廳進去；人在館裡照樣走得出來 */
    if(it.exit&&(it.exit.to==='library'||it.exit.to==='library_hall')&&G.zone==='campus'&&!PLACES.isOpen('library_hall',h(G))){ GM.toast(PLACES.closedText('library_hall',h(G)),4500); return true; }   /* 2026-10-11 使用者回報：只寫「閉館了」不知道幾點開 */   /* 只擋從校園進去；人在館裡（大廳、閱覽室）之間照樣走得通，不會被關在裡面 */
    return false; };
  /* 兩點半 Café 牆上的班表（BB_159，BB-B 2026-10-16 0b917af4；ART-WZ4 的班表模型、互動點在吧檯前 (0.7,-3.7)）：只是物件說明，可以看很多次，不給數值、不記記憶。
     四版照芷若的時間線：A 預設（經濟系那一年～大二下 Z9 那晚）／B Z9（ev_zhiruo_last_shift）之後到大三上（英國一學期）／C 大三下（回來了）／D 大四以後。A 版的時段照 characters.js heroine_02 的作息 */
  S.CAFE_ROTA={A:['（牆上的班表。夾板上一張紙，鉛筆寫的。）','（週一到週五晚上，每一格都是同一個名字：芷若。週一、三、五的中午也是。）','（週末那幾格是阿文、小婷。最下面一行：老闆——隨時。）'],
    B:['（牆上的班表。晚上那幾格，換成了小婷的名字。）','（最上面那一行還是「芷若」，格子是空的。旁邊多了一行小字：英國，一學期。）'],
    C:['（牆上的班表。芷若的名字回到晚上的格子裡，只是比以前少。）','（空出來的那幾格，是小婷。）'],
    D:['（牆上的班表。最上面那一行還是「芷若」，後面的格子都是空的。）','（鉛筆寫的。沒有人擦。）']};
  S.cafeRotaKey=function(G){ if(typeof CALENDAR==='undefined') return 'A'; let t=null; for(let d=G.day; d>G.day-200&&!t; d--) t=CALENDAR.termOf(d);   /* 放假中＝前一個學期 */
    const m=t&&/^Y(\d)S(\d)$/.exec(t.id), n=m?(+m[1])*2+(+m[2]):0; if(n>=9) return 'D'; if(t&&t.id==='Y3S2') return 'C';
    const z9=termDay('Y2S2',15,4), afterZ9=!!(G.events&&G.events.done&&G.events.done.ev_zhiruo_last_shift)||(z9!=null&&(G.day>z9||(G.day===z9&&h(G)>=22)));
    return afterZ9&&n>=6&&n<=7?'B':'A'; };
  S.cafeRota=G=>S.CAFE_ROTA[S.cafeRotaKey(G)];
  const CAFE_MENU=[['拿鐵',120,10],['手沖咖啡',150,12],['檸檬塔',110,14]];
  async function counter(GM,shop,items){ const G=GM.G; GM.sceneBegin(); const opts=items.map(([n,p])=>({t:n+'　'+p+' 元',dim:G.money<p}));   /* 只寫價錢（DL-02：體力拿掉了）*/ opts.push({t:'不用了'}); const ek=typeof EAT!=='undefined'?({'兩點半 Café':'兩點半 Café','便利商店':'公館的便利商店','清葉茶行':'清葉茶行'})[shop]:null, food=items.filter(x=>typeof x[3]!=='function');   /* 吃東西（src/eat3d.js，AA_329）：貓罐頭、開學用品不算 */ const i=ek?await EAT.choose(GM,ek,opts,food.map(x=>x[0]),food.map(x=>x[1])):await GM.choose(opts); if(i<items.length){ const [n,p]=items[i]; if(G.money<p){ GM.toast('錢不夠'); } else { GM.money(-p); GM.advance(0.15); if(typeof items[i][3]==='function') items[i][3](G); await GM.say(null,'你買了'+n+'。'+(shop==='兩點半 Café'?'店員把杯子放在你面前的時候，杯底和木桌碰出一聲很小的響。':'')); if(shop==='兩點半 Café'&&typeof FAV!=='undefined'&&FAV.cafe) await FAV.cafe(GM);   /* 子晴在店裡：12～2 月看到她的杯子、也幫她點（src/foodfav3d.js，AA_410）*/ if(ek&&typeof items[i][3]!=='function') await EAT.after(GM,ek,n); if((ek==='公館的便利商店'||ek==='清葉茶行')&&typeof SIDEQ!=='undefined'&&SIDEQ.atShop){ try{ await SIDEQ.atShop(GM,ek,{item:n,price:p}); }catch(e){ console.warn('SIDEQ',e); } } } } GM.sceneEnd(); }   /* 順手的事（src/sideq3d.js，AA_397）：買完（貓罐頭也算）店員偶爾多一句；清葉茶行（AA_405 SQ18）：不是吃的（EAT 沒有吃過的），點過幾次照樣記（店員認得你）*/
  /* 書店（SYS-BOOKS-1018；使用者 10-18 選擇題 D102、USER_WANTS X15）：這學期（放假＝下一學期）每一門課的教科書（CLS.bookList：經濟系那一年賣經濟系的書，不再只賣《民法總則》）、螢光筆、只是看看。
     買了只影響讀那一科（自學多一分準備、期末多一次想起答案；不做書架、同學注意）；《民法總則》照舊那一句旁白，其他書只出提示 */
  const BOOK_BUY=['（書比想像中重。你把它塞進背包，拉鍊差一點拉不起來。）','（新書的味道。你翻了兩頁，又闔上，留到上課再看。）'];   /* 買教科書的旁白，兩句輪流（AA 2026-10-21 20:23）；民法總則照舊那一句 */
  async function bookshop(GM){ const G=GM.G, F=G.flags; GM.sceneBegin(); const BK=typeof CLS!=='undefined'&&CLS.bookList?CLS.bookList(G):[];
    const opts=BK.map(b=>{ const own=CLS.hasBook(G,b.c); return {t:'《'+b.title+'》教科書　'+b.price+' 元',hint:own?'已經有了':'讀這一科時準備多一些；期末多一次想起答案',dim:own||G.money<b.price}; });
    opts.push({t:'螢光筆一組　80 元',hint:'讓筆記好看一點',dim:G.money<80},{t:'只是看看'}); const i=await GM.choose(opts);
    if(i<BK.length){ const b=BK[i]; if(!CLS.hasBook(G,b.c)&&G.money>=b.price){ GM.money(-b.price); (F.books||(F.books={}))[b.title]=true; if(b.title==='民法總則') F.textbook=true; GM.memo('買了'+b.title+'教科書');
        if(b.title==='民法總則') await GM.say(null,'很厚。老闆說一年級都會買，然後大部分人到期末都只翻到第三章。'); else { GM.toast('買了《'+b.title+'》教科書',2600); const n=F.bookBuyN=(F.bookBuyN||0)+1; await GM.say(null,BOOK_BUY[(n-1)%BOOK_BUY.length]); } } }
    else if(i===BK.length&&G.money>=80){ GM.money(-80); GM.toast('買了螢光筆'); } else if(i===BK.length+1){ await GM.say(null,'架上有一整排判決彙編。有人在角落翻著《法律人的第一堂課》。'); }
    { const it=i<BK.length?'《'+BK[i].title+'》':(i===BK.length?'螢光筆':'只是看看');   /* 順手的事（src/sideq3d.js，AA_404 SQ15）：來過幾次照樣記（EAT 只記次數，不是吃的），之後書店老闆偶爾多一句 */
      if(typeof EAT!=='undefined'&&EAT.ordered) await EAT.ordered(GM,'舊路書房',it); if(typeof SIDEQ!=='undefined'&&SIDEQ.atShop){ try{ await SIDEQ.atShop(GM,'舊路書房',{item:it,price:0}); }catch(e){ console.warn('SIDEQ',e); } } }
    GM.sceneEnd(); }
  S.bookshop=bookshop;   /* 測試用（tests/books_unit.js）*/
  // ---------- 第一天：宿舍 ----------
  async function introDorm(GM){ const G=GM.G, F=G.flags, E=GM.E; GM.sceneBegin(); GM.letterbox(true); if(S.week1Start(G)){ const dt=S.dateOf(G.day), hh=h(G); await GM.titleCard(dt.m+' 月 '+dt.d+' 日（'+'日一二三四五六'[G.weekday%7]+'）',String(Math.floor(hh)).padStart(2,'0')+':'+String(Math.floor((hh%1)*60)).padStart(2,'0')+' · 男生宿舍',2600); } else await GM.titleCard('第一天','週三 21:12 · 男生宿舍',2600);   /* 選 1：日期卡（AA-B 20:50 第 3 題；旁白照 AA_195 第 4 節：DAY1_NARR_W1）*/ if(S.week1Start(G)){ for(const t of (G.hour>=23.5?DAY1_NARR_W1_LATE:DAY1_NARR_W1)) await GM.say(null,t); }   /* 23:30 以後才回宿舍＝短版（AA_195 4-1）*/ else { await GM.say(null,'你是{name}，台大法律系一年級。開學第三週。'); await GM.say(null,'書桌上放著明天民法總則要討論的案例——網拍上標價 1,000 元的相機。老師上週說：「會點人。」'); /* 交接包 v1 第 1 節（AA_12 0-3 第 1 點、0-2）＋可昕的第一則訊息（BB_95 9-0）*/ for(const t of DAY1_NARR) await GM.say(null,t); }   /* 選 1 的局：DAY1_NARR 移到 8/29（AA_195 4-1；4-2 還沒寫）*/ await kexinFirstMsg(GM,'night'); const kai=GM.npc.kai; if(kai){ GM.cine('two',E.player.obj,kai.obj); ADV.begin({background:'blur',right:'kai'}); await GM.say(kai,'（拿下一邊耳機，看了一眼你桌上的講義）你們才開學三天就要讀這麼多喔？',{expr:'smile'}); const i=await GM.choose([{t:'明天民總有個案例，還沒看。'},{t:'還好，看心情。'}]); if(i===0){ await GM.say(kai,'喔，那你看。我戴耳機。'); await GM.say(null,'（他把耳機戴回去。）'); } else { await GM.say(kai,'我也是。',{expr:'laugh'}); await GM.say(kai,'我們這週都在講課程大綱。'); } GM.rel('kai',2);   /* BB_168 第 4 節、6-1：阿凱是資工一，沒有「上學期的室友」；新舊局都用這版 */ } GM.letterbox(false); familyGroupD1(GM); F.introDone=true; GM.setGoal('讀（或不讀）明天的案例，然後睡覺'); GM.sceneEnd(); GM.autosave(); }
  /* ---------- 交接包 v1：第一天的旁白、可昕的第一則訊息、家族群組、房間物件、手機的規則 ---------- */
  const DAY1_NARR_W1=['明天下午是民法總則的第一堂。','周老師開學前就把案例放上課程網站了：網拍上標價 1,000 元的相機。課綱第一週那一格寫著：「請先讀案例，上課會點人。」','你下午把它印出來，到現在還放在桌上，一個字都沒畫。'];   /* 選 1 的局（AA_195 4-1，AA-B 2026-10-16）*/
  const DAY1_NARR_W1_LATE=['你回到宿舍的時候已經很晚了。','明天下午是民法總則的第一堂。印好的案例還在桌上，課綱寫上課會點人。'];   /* AA_195 4-1 短版（AA-B 7b2d057f）*/
  const DAY1_NARR=['以前遇到事情，你會去翻民法。翻得到條文，卻不知道條文和條文怎麼接起來，也不知道怎麼用在一件真的事情上。','這次不一樣。這次有人要教你怎麼讀。','休學到重考的那幾個月，你不是一個人過的。'];   /* AA_224 第 2 組：第三句 */   /* AA_12 0-3 第 1 點、0-2 */
  /* 手機上的一段對話，在劇情裡演（開場是過場，不打開手機面板）：對話框的名字寫「可昕（手機）」，回覆用一般的選項；演完的內容同時寫進手機的對話串（之後打開手機看得到）*/
  async function phoneScene(GM,th,lines,ask){ const G=GM.G; let last=null;
    for(const l of lines){ last=PHONE.post(G,Object.assign({th},l)); await GM.say({name:PHONE.who(l)+'（手機）'},l.text); }
    if(!ask) return -1; last.ask=Object.assign({id:'scene_'+th+'_'+G.day+'_'+Math.round(G.hour*100)},ask); const k=await GM.choose(ask.opts.map(o=>({t:o.t})));
    const r=PHONE.answer(G,last.ask.id,k); if(r) for(const m of r.out.slice(1)) await GM.say({name:PHONE.who(m)+'（手機）'},m.text); if(GM.phoneBadge) GM.phoneBadge(); return k; }
  /* 8/29 搬進宿舍那晚（AA_195 4-2 的旁白＋BB_168 第 1 節 ev_kai_movein）：阿凱初遇 → 整理到快十點 → 第一次坐到書桌前播 DAY1_NARR → 22:40 阿凱的冷氣訊息 → 目標。
     台詞全部照企劃原文（D79）；室友在不在房間看 G.zone（區域物件 E.zone 沒有 id：原本寫 E.zone.id，三個室友一直沒生出來，QA-HANDOFF-B1 flow_camp_y1）；記 MET_KAI（阿凱的宿舍階梯 K-D1～ 要它）、阿凱 ACQUAINTANCE、手機聯絡人。中途關掉：讀檔回到那天的宿舍再演一次（game3d.js applySave）*/
  async function kaiMoveIn(GM){ const G=GM.G, F=G.flags, E=GM.E, P=E&&E.player; if(F.KAI_MOVEIN) return false; GM.sceneBegin(); GM.letterbox(true);
    try{ const kai=GM.npc.kai, who=kaiWho(GM), npcWho=id=>GM.npc[id]||{name:typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id,charId:id}, bo=npcWho('classmate_bohan'), zhe=npcWho('zhe');
      if(typeof ADV!=='undefined') ADV.begin({background:'blur',right:'classmate_bohan'});   /* 四人房（AA_208 2-1，使用者 00:5x）：柏翰早上就搬好了 */
      await GM.say(null,'（靠窗那張書桌已經有人用了。書排得很整齊，旁邊一盞檯燈、一疊資料夾。）');
      await GM.say(bo,'（從書裡抬頭）喔，是你。'); await GM.say(bo,'門口那張床是你的。我早上就來了。');
      if(kai&&P) GM.cine('two',P.obj,kai.obj); if(typeof ADV!=='undefined'&&ADV.show) ADV.show('right','kai');
      await GM.say(null,'（另一張書桌前也有人。他背對著門，正在把一台很大的主機塞進書桌底下。地上一堆紙箱。）');   /* 四人房：柏翰已經在了（BB-B 01:12 建議；AA_355 第 2 節：AA 看過、照用）*/
      await GM.say(who,'（回頭）喔，嗨。'); await GM.say(who,'你那組在門口那邊喔？我東西先放了一點過去，等一下拿走。');   /* AA_208 第 6 節：四人房每人一組床桌（原「你睡那邊喔？…等一下移。」；BB 確認口氣中）*/
      const i=await GM.choose([{t:'沒關係，你先放。'},{t:'我是'+G.name+'，法律系。'},{t:'（點頭，先搬自己的東西）'}]);   /* 不加數值（BB_168 第 1 節）*/
      if(i===0){ await GM.say(who,'好，謝謝。'); await GM.say(null,'（他又轉回去接線。）'); }
      else if(i===1){ await GM.say(who,'阿凱。資工。'); await GM.say(who,'法律系喔，那你書應該很多。衣櫃大的那格給你。'); }   /* 「櫃子」→「衣櫃」（AA_208 第 6 節）*/
      else await GM.say(null,'（他也點了一下頭，兩個人各忙各的。）');
      if(typeof SOCIAL!=='undefined') SOCIAL.meet('kai','dorm'); F.MET_KAI=true; if(typeof INV!=='undefined'){ INV.rec(G); if(G.contacts.kai==null) G.contacts.kai=G.day; }   /* 影響：MET_KAI、阿凱 ACQUAINTANCE、聯絡人多一個阿凱 */
      if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); await GM.fade(true); if(G.hour<19) GM.advance(19-G.hour); if(E&&E.zone&&E.zone.dormSet) E.zone.dormSet('203'); await GM.fade(false);   /* 黑畫面時阿哲的床桌東西出現（8/29 下午是 '203_movein'）；阿哲約 19:00 從高雄上來（AA_208 2-1；AA_205 6-4「29 號再上來搬宿舍」）*/
      if(typeof ADV!=='undefined') ADV.begin({background:'blur',right:'zhe'});
      await GM.say(null,'（門被撞開。阿哲拖著一個超大的行李箱，背上還有一顆籃球。）');
      await GM.say(zhe,F.ZHE_CALLS_GE?'哥！你也這間喔！':'欸！你也這間喔！'); await GM.say(zhe,'（看到柏翰）柏翰也在？那宿營那間只差一個明軒。'); await GM.say(bo,'明軒住別棟。'); await GM.say(who,'（戴著耳機，頭沒有回，舉了一下手）'); await GM.say(who,'門關一下，冷氣會跑掉。');   /* BB-B 01:12（BB_168 第 1 節，BB 分支 030bbce4）：還是不轉身、不自我介紹；冷氣接 22:40 的遙控器訊息 */
      F.DORM_FOUR=true;   /* 四人房：阿哲、柏翰也住 203 */
      await GM.say(null,'（你們各自整理到快十點。他的電腦開機的聲音很大。）'); if(typeof ADV!=='undefined'&&ADV.active) ADV.end();
      await GM.fade(true); if(G.hour<21+55/60) GM.advance(21+55/60-G.hour); if(E) E.endCinematic();
      const desk=(E.interactables||[]).find(x=>x.deskStudy), seat=desk&&desk.seat;   /* 整理到晚上，第一次坐到書桌前（AA_195 4-2 第 3 點）*/
      if(seat&&P){ GM.sitAt(P,seat); E.cam.distTarget=3.2; }   /* 畫面是暗的時候直接坐好（sitAt 會放到座位上）*/
      if(E&&E.zone&&G.zone==='dorm'){ try{ if(!GM.npc.kai&&GM.spawnNPC) GM.spawnNPC('kai',C.kai,0,0,{seat:dormSeat('R2'),talk:n=>talkKai(GM,n)}); for(const [id,u] of [['classmate_bohan','R1'],['zhe','L1']]) if(!GM.npc[id]&&CHARACTERS[id]&&GM.spawnCharacter){ const st=dormSeat(u); GM.spawnCharacter(id,st.x,st.z,{seat:st,pose:'sit'}); } }catch(e){ console.warn('8/29 室友',e); } }   /* 搬進來那晚三個室友坐在自己的書桌前（進房間時還沒搬，populate 生不出來；DORM-LOFT-L）*/
      await GM.fade(false); for(const t of DAY1_NARR) await GM.say(null,t); F.DAY1_NARR_SEEN=true;   /* 原文不改（從 9/3 搬過來）*/
      if(G.hour<22+40/60) GM.advance(22+40/60-G.hour);   /* 22:40 阿凱的冷氣訊息：人就坐在你後面兩公尺（BB_168 第 1 節；BB_70 4-1「他的第一則訊息是在同一個房間裡傳的」）*/
      await GM.say(null,'（十點四十，手機響了一聲。是阿凱傳的。他人就坐在你後面兩公尺。）');   /* AA-B 00:46（AA_195 4-11）：通知前一句旁白 */
      if(typeof PHONE!=='undefined'){ const K=t=>({from:'kai',text:t}); if(GM.toast) GM.toast('手機｜阿凱：你的冷氣遙控器在我這',2600);
        await phoneScene(GM,'p:kai',[K('你的冷氣遙控器在我這')],{opts:[{t:'你可以直接講啊',say:[K('我耳機戴著 懶得拿下來'),K('幾度')]},{t:'好 開幾度',say:[K('27 可以嗎 我怕冷')]}]}); }
      F.DORM_AC=27; await GM.say(null,'（阿哲說他都可以，柏翰已經戴上耳塞了。）'); await GM.say(null,'（遙控器最後放在你和阿凱的書桌中間。）');   /* 四人房（BB-B 01:12 建議；AA_355 第 2 節：AA 看過、照用）*/   /* AA_208 第 6 節 */   /* 兩個回覆後面冷氣都開到 27 度 */
      if(seat&&P) GM.standUp(P); F.KAI_MOVEIN=true;
    } finally { GM.letterbox(false); GM.sceneEnd(); }
    GM.setGoal('整理行李。缺的東西明天去公館買。'); if(GM.autosave) GM.autosave(); return true; }
  S.lawMoveIn=(GM,o)=>kaiMoveIn(GM,o);
  /* 可昕的第一則訊息（BB_95 9-0；旗標 KX_FIRST_MSG）：night＝第一天晚上；morning＝舊存檔下一個早上補的（第一句、最後一句換）。三個回覆不影響關係、之後也不讀 */
  async function kexinFirstMsg(GM,variant){ const G=GM.G, F=G.flags; if(F.KX_FIRST_MSG||typeof PHONE==='undefined') return false; F.KX_FIRST_MSG=true; if(F.dating_kexin===undefined) F.dating_kexin=true;
    if(typeof INV!=='undefined'){ INV.rec(G); if(G.contacts.kexin==null) G.contacts.kexin=0; }
    const am=variant==='morning', end=am?'去上課吧。下課再跟我說你讀到哪了。':'晚安。不要讀到太晚。', K=t=>({from:'kexin',text:t});
    if(GM.toast) GM.toast('手機｜可昕：'+(am?'早安。今天讀到哪了？':'今天讀到哪了？'),2600);
    await phoneScene(GM,'p:kexin',[...(F.PLAYED_Y0&&!S.week1Start(G)?[K('第二次的大一。我們都是重考上來的。')]:[]),K(am?'早安。今天讀到哪了？':'今天讀到哪了？'),K('我們老師今天講的案例，好像跟你們的是同一個。'),K('兩個老師講的不一樣。……我好奇你們的怎麼講。'),K('……不用回答。我只是想知道你讀到哪了。')],
      {opts:[{t:'讀到一半。案例比想像的長。',say:[K('我也是。讀到一半去泡麵，回來就忘了誰告誰。'),K(end)]},{t:'我們老師講了兩個小時。',say:[K('……我們也是。我只記得他的領帶。'),K(end)]},{t:'讀到一半，在想妳。',say:[K('那就是沒在讀。回去讀，讀完再想。'),K(end)]}]});
    return true; }
  /* 家族群組（BB_95 4-1；ev_family_group_pin）：第一天晚上回宿舍後手機亮起。群組名「法律系直屬家族」（家族制度的叫法需查證）；置頂是 Kevin 開學前發的（2026-10-17 改，原本學姊）；
     回「（舉手）」或「活著。」設 FAM_GROUP_REPLIED（學姊第一次見面 talkSis 會讀），Kevin：「很好，有一個活的。」；不回就是不回。舊存檔已經過了第一天的不補 */
  function familyGroupD1(GM){ const G=GM.G, F=G.flags; if(F.FAM_GROUP_SENT||typeof PHONE==='undefined') return; if(S.week1Start(G)){ S.familyW0(G,{now:true}); if(GM.toast) GM.toast('手機｜法律系直屬家族｜Kevin：新的家族學弟妹都進群了嗎？',4200); if(GM.phoneBadge) GM.phoneBadge(); return; }   /* 開學改 9/1 的局：開學前那一版（8/30 沒排到的舊存檔，到 9/3 立刻補）*/ F.FAM_GROUP_SENT=true; const th='g:family_law'; PHONE.join(G,'family_law','法律系直屬家族');
    const sis=t=>({th,from:'heroine_05',name:'溫學姊',text:t}), kv=t=>({th,from:'kevin',name:'Kevin',text:t});
    PHONE.postAt(G,Object.assign(kv('學弟妹好～我是 Kevin，大二。先講幾件事：開學前先不要買二手書，等學長姐的；民總很重要；有問題就問，先自己查一下也可以。'),{pin:true}),-16,21);   /* 開學前發的置頂：2026-10-17 改 Kevin 發（AA_218 L512 家族群組 (A)、17-12：學姊不在家族群組主動發言）*/
    PHONE.post(G,Object.assign(kv('第三週了，家族的學弟妹還活著嗎？要考古題的舉手'),{ask:{opts:[{t:'（舉手）',set:{FAM_GROUP_REPLIED:true},say:[kv('很好，有一個活的。')]},{t:'活著。',set:{FAM_GROUP_REPLIED:true},say:[kv('很好，有一個活的。')]}]}}));
    /* 學姊「先看置頂。」刪（AA_218 L512、17-12）；Kevin 不是直屬，「直屬學弟妹」→「家族的學弟妹」（BB_95 e627d747，使用者 23:3x）*/ if(GM.toast) GM.toast('手機｜法律系直屬家族｜Kevin：第三週了，家族的學弟妹還活著嗎？',4200); if(GM.phoneBadge) GM.phoneBadge(); }
  /* 家族群組 W0（BB_168 6-3、BB_177 11-1；AA_195 4-3）：開學改 9/1 的局提早到 8/30（六）晚上（21:00）。置頂是 Kevin 8/30 發的（2026-10-17 AA_218 L512；原本學姊 8/25 那則刪）；
     Kevin 是同家族的大二學長（不是直屬，直屬只有學姊）。去過宿營（CAMP_Y1）的玩家：Kevin 認出臥底那一隊的學弟（BB_177 11-1）；沒去的照 BB_168 6-3。回了設 FAM_GROUP_REPLIED（9/2 茶會、學姊第一次見面會讀）；不回就是不回 */
  S.familyW0=function(G,o){ o=o||{}; const F=G.flags; if(F.FAM_GROUP_SENT||typeof PHONE==='undefined') return false; F.FAM_GROUP_SENT=true; const th='g:family_law'; PHONE.join(G,'family_law','法律系直屬家族');
    const sis=t=>({th,from:'heroine_05',name:'溫學姊',text:t}), kv=t=>({th,from:'kevin',name:'Kevin',text:t}), nm=G.name||'祐廷';
    const camp=!!F.CAMP_Y1, L=camp?['新的家族學弟妹都進群了嗎？','欸 '+nm+'？我當臥底那一隊的？原來你是我們家族的','所以我宿營騙了自己家的學弟三天 好啦對不起','考古題茶會那天給你們。']:['新的家族學弟妹都進群了嗎？','有進來的舉個手，考古題茶會那天給你們。'];
    const opts=(camp?['是我。','（貼圖）']:['（舉手）','我在。']).map(t=>({t,set:{FAM_GROUP_REPLIED:true},say:[kv('好，收到一個。')]}));
    const items=[Object.assign(kv('學弟妹好～我是 Kevin，大二。先講幾件事：開學前先不要買二手書，等學長姐的；民總很重要；有問題就問，先自己查一下也可以。'),{pin:true})].concat(L.map((t,k)=>k===L.length-1?Object.assign(kv(t),{ask:{opts}}):kv(t)));   /* 置頂：Kevin 8/30 21:00 發、排在宿營那幾句前面（AA_218 L512 家族群組 (A)：家族開學前就分好，9/4 分的是家族裡的直屬；學姊 8/25 那則刪，17-12）*/
    if(o.now) for(const it of items) PHONE.post(G,it); else PHONE.at(G,S.dayOfKey('2025-08-30'),21,items,'fam_w0');
    PHONE.at(G,S.dayOfKey('2025-09-05'),20,[kv('周老師說的那本，我有舊的。'),kv('📷（一本書的封面，邊角捲起來）'),Object.assign(kv('要的說，先說先拿。'),{ask:{opts:[{t:'我要。',set:{KEVIN_OLD_BOOK:true},say:[kv('好，下禮拜一放系學會辦公室，寫你名字。')]}]}})],'kevin_old_book');   /* 9/5（五）20:00 Kevin 的舊書（BB_168 第 7 節「影響」、AA_200 2-11a）：群組裡所有人都看得到；不回就沒有後續 */
    return true; };
  /* 開學典禮那天被加進班群（AA_195 4-4；群組用四年同一個的 law_class「法律系（全班）」，AA_177 第 9 節）：系學會貼茶會公告、不具名的同學問系服（不算認識任何人）。
     典禮演到「你被加進一個群組」那一句時加入；典禮被跳過、或 14:40 才補的，照舊在那個時間加入。8/31 以後才補的不排貼文（茶會的公告過期了也沒意義） */
  S.lawClassJoinY1=function(G){ if(typeof PHONE==='undefined'||PHONE.inGroup(G,'law_class')) return false; const d0=S.dayOfKey('2025-08-31'), g=PHONE.join(G,'law_class','法律系（全班）'); if(!PHONE.inGroup(G,'law_board')){ const gb=PHONE.join(G,'law_board','法律系新生（自介版）'); if(gb&&G.day!==d0) gb.day=d0; }   /* 系上的網路社群（AA_218 17-13：貼文＋留言，不是班群；和班群一起加入）*/
    { const d2=S.dayOfKey('2025-09-09'), M=(id,nm,t)=>({th:'g:law_class',from:id,name:nm,text:t}); if(G.day<=d2&&!PHONE.sent(G,'ps_w2_msg')) PHONE.at(G,d2,22,[M('classmate_peishan','沛珊','請問有人知道民總的指定教科書要買哪一本嗎'),M('classmate_peishan','沛珊','老師說了兩本 我只抄到一本'),M('zhe','阿哲','我有學長的舊版 你要的話我拍給你'),M('classmate_peishan','沛珊','好 謝謝！')],'ps_w2_msg'); }   /* 第 2 週平日 22:00 班群（BB_168 2-2；9/4 民總第一堂之後）：玩家不用回 */
    if(G.day!==d0){ g.day=d0; return true; }
    const t=Math.max(h(G),14), C=x=>({th:'g:law_class',from:'law_assoc',name:'系學會',text:x}), Q=x=>({th:'g:law_class',name:'同學',text:x});
    PHONE.at(G,d0,t,[{th:'g:law_class',text:'你被加進「法律系（全班）」。'},C('新生茶會：9/2（二）18:30，萬才館一樓大廳。會說家族怎麼分，有點心。'),C('不用報名，來就好。')],'law_class_join');
    PHONE.at(G,d0,t+0.25,[Q('請問要穿系服嗎'),Q('我們還沒有系服吧')],'law_class_q');   /* 不具名（AA_195 4-4）*/ return true; };
  /* 開學典禮 8/31（日）14:00（AA_195 4-4）：綜合體育館，不做 3D 場景——日期卡＋ADV 背景＋旁白；不和有名字的人說話、不出現以安。新局一定會演（不是可以不去的活動）。
     背景：ART-GYM-BG1（ntu_gym_ceremony，LAWWW2-B 正式版交了才登記）；還沒有就用 ntu_avenue。演完時間到 15:30（典禮的長度，AA 沒寫，LAWWW-B 定，已問 AA-B）*/
  S.ceremonyY1=async function(GM){ const G=GM.G, F=G.flags, E=GM.E; if(F.CEREMONY_Y1) return false; F.CEREMONY_Y1=true; GM.sceneBegin();
    try{ if(G.hour<14){ G.hour=14; if(E) E.hour=14; } await GM.titleCard('8 月 31 日（日）','14:00 · 綜合體育館',2200);
      const B=typeof OUT!=='undefined'&&OUT.BG?OUT.BG:{}, bg=(B.ntu_gym_ceremony&&B.ntu_gym_ceremony.image)?B.ntu_gym_ceremony:B.ntu_avenue;
      if(typeof ADV!=='undefined') ADV.begin({background:bg&&bg.image?{image:bg.image}:'blur'});
      await GM.say(null,'四千多個新生，每個人都穿著同一件新生上衣。');
      await GM.say(null,'法律系的位置在二樓看台的右邊。旁邊的人在對手冊上的流程，前面的人在傳訊息問晚上要不要一起吃飯。');
      await GM.say(null,'校長致詞講到一半，手機震了一下。你被加進一個群組。'); S.lawClassJoinY1(G);
      if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); if(G.hour<15.5) GM.advance(15.5-G.hour);
    } finally { GM.sceneEnd(); }
    if(GM.phoneBadge) GM.phoneBadge(); if(GM.autosave) GM.autosave(); return true; };
  /* 可昕開學前一晚 8/31（日）22:10（BB_168 6-2；旗標 KX_EVE_MSG；所有玩家）：「第二次的大一」從 9/3 搬過來。已經有 KX_FIRST_MSG 的舊存檔不補 */
  S.kexinEve=function(G){ const F=G.flags; if(F.KX_EVE_MSG||F.KX_FIRST_MSG||typeof PHONE==='undefined') return false; F.KX_EVE_MSG=true; if(F.dating_kexin===undefined) F.dating_kexin=true;
    if(typeof INV!=='undefined'){ INV.rec(G); if(G.contacts.kexin==null) G.contacts.kexin=G.day; }
    const K=t=>({th:'p:kexin',from:'kexin',text:t}), y0=!!F.PLAYED_Y0;
    const ask={opts:[{t:'排好了，週四有民總。',say:[K('好。我週四也是滿堂。'),K('早點睡，明天不要遲到。')]},{t:'還在等加選。',say:[K('我也是，有一堂候補排第十二個。'),K('應該沒救了。早點睡。')]},{t:'有點緊張。',say:[K(y0?'我也是。明明是第二次了。':'我也是。'),K('早點睡。')]}]};
    PHONE.at(G,S.dayOfKey('2025-08-31'),22+10/60,[K('明天開學了。'),...(y0?[K('第二次的大一欸。')]:[]),Object.assign(K('你課表都排好了嗎？'),{ask})],'kx_eve'); return true; };
  /* 8/30（六）新手教學（AA_195 4-3；AA-B 00:46 回覆 AA_195 4-11）：三個選做目標，各自算完成，任務欄顯示還沒做的第一項；都可以不做、不擋劇情。
     ① 公館便利商店買三孔延長線 299、衣架一包 49、拖鞋 99（開學第一週以前都買得到；三樣都買了才算完成）② 走一次椰林大道到總圖（進總圖大廳）③ 找到霖澤館 201（二樓 201 門口或進教室）。②③ 只在 8/30 算。完成句照 AA 原文 */
  const T830=[{k:'T830_BUY',goal:'去公館買缺的東西：延長線、衣架、拖鞋',line:'（延長線買了三孔的。阿凱的主機插頭是三孔的。）'},{k:'T830_LIB',goal:'走一次椰林大道到總圖',line:'（椰林大道還是那麼長。總圖門口有新生在拍照。）'},{k:'T830_201',goal:'找到霖澤館 201：星期一第一堂憲法在那裡',line:'（霖澤館 201 在二樓。去年一整年，你從來沒有走進這棟。）'}];
  const T830_ITEMS=[['三孔延長線',299,'T830_EXT'],['衣架一包',49,'T830_HANGER'],['拖鞋',99,'T830_SLIPPER']];
  S.tut830On=G=>!!(G&&G.flags&&G.flags.KAI_MOVEIN&&(G.stage||'law')==='law'&&S.week1Start(G));
  S.tut830Items=G=>{ const F=G.flags; if(!S.tut830On(G)||F.T830_BUY||G.day>S.dayOfKey('2025-09-07')) return []; return T830_ITEMS.filter(([,,f])=>!F[f]).map(([n,p,f])=>[n,p,0,G=>{ G.flags[f]=true; if(T830_ITEMS.every(([,,k])=>G.flags[k])) G.flags.T830_BUY=true; }]); };
  S.tut830Tick=function(GM){ const G=GM.G, F=G.flags, E=GM.E; if(!S.tut830On(G)||F.T830_RUN) return false; const d=S.dayOfKey('2025-08-30'), today=G.day===d;
    if(today&&!F.T830_LIB&&G.zone==='library_hall') F.T830_LIB=true;
    if(today&&!F.T830_201&&(G.zone==='classroom'||(G.zone==='linze'&&(E.player.lv|0)===1&&Math.abs(E.player.obj.position.x+2)<1.6&&E.player.obj.position.z<-5))) F.T830_201=true;
    const due=T830.find(t=>F[t.k]&&!F[t.k+'_SAID']);
    if(due){ F[due.k+'_SAID']=true; F.T830_RUN=true; (async()=>{ GM.sceneBegin(); try{ await GM.say(null,due.line); } finally { GM.sceneEnd(); F.T830_RUN=false; } if(today) S.tut830Goal(GM); })(); return true; }
    if(today) S.tut830Goal(GM); return false; };
  S.tut830Goal=function(GM){ const G=GM.G, F=G.flags, nx=T830.find(t=>!F[t.k]); if(nx){ if(G.goal!==nx.goal) GM.setGoal(nx.goal); } else if(T830.some(t=>G.goal===t.goal)){ if(typeof CLS!=='undefined'&&CLS.setGoal) CLS.setGoal(GM); else GM.setGoal('自由的一天。去圖書館、公館，或找人聊天'); } };
  /* 9/2（二）18:30～20:30 新生茶會（AA_195 4-5；BB_168 第 7 節 23:3x 重寫、BB_177 11-2）：萬才館一樓大廳，大二辦的；可以不去、隨時可以走。
     ① 進萬才館＝簽到桌 Kevin（宿營認得你；開發起點沒宿營的用防呆版）→ ② 走到窗邊家族那一桌（互動點）＝Kevin 過來問考古題。17:30 手機提醒（任務欄）；選①考古題＝21:00 家族群組 Kevin 丟檔案。
     學姊不在茶會（使用者 08:2x「開學後第一次見面＝W1」；BB-C 798e9b14、AA_218 補定）：原本的 ③ 19:10 學姊來看直屬、④「學姊說她會來，你要不要等一下？」、19:10 Kevin 招手、
     簽到時 Kevin 說直屬是誰（9/4 才分直屬）都拿掉；第一次見面在 W1（events.js ev_sis_w1）*/
  const TEA_TABLE={x:3,z:3.6};   /* 窗邊家族那一桌（萬才館大廳的圓桌之一）*/
  S.teaOn=G=>{ const F=G.flags; return !!F.KAI_MOVEIN&&(G.stage||'law')==='law'&&S.week1Start(G)&&G.day===S.dayOfKey('2025-09-02'); };
  const KV=t=>['Kevin',t];
  async function teaLines(GM,L){ for(const l of L){ if(typeof l==='string') await GM.say(null,l); else await GM.say({name:l[0],charId:l[2]||null},l[1]); } }
  S.teaSignIn=async function(GM){ const G=GM.G, F=G.flags; if(F.TEA_STEP) return false; F.TEA_STEP=1; GM.sceneBegin();
    try{ if(typeof ADV!=='undefined') ADV.begin({background:'blur'});
      await teaLines(GM,['（萬才館一樓大廳。簽到桌後面坐著三個大二，中間那個是 Kevin，一手拿名牌貼紙，一手滑名單。）']);
      await teaLines(GM,F.CAMP_Y1?[KV('{name}。這次是真的學長了。')]:[KV('{name}？喔，我們家族的。我 Kevin，大二。')]);   /* 防呆：開發用起點沒有宿營的 */
      await teaLines(GM,[KV('家族那一桌在窗邊，我等一下過去。')]);   /* 直屬是誰、學姊會來的兩句拿掉（9/4 才分直屬、學姊不在茶會）*/
      if(typeof SOCIAL!=='undefined'&&!SOCIAL.has('kevin','FIRST_MET')) SOCIAL.meet('kevin','wancai');
    } finally { if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); GM.sceneEnd(); }
    S.teaSpot(GM); GM.setGoal('走到窗邊家族那一桌'); return true; };
  S.teaSpot=function(GM){ const E=GM.E, G=GM.G; if(G.zone!=='wancai'||!E||!E.interactables||E.interactables.some(i=>i.teaTable)) return; E.interactables.push({x:TEA_TABLE.x,z:TEA_TABLE.z,radius:1.4,lv:0,label:'家族那一桌（新生茶會）',teaTable:true}); };
  S.teaTable=async function(GM){ const G=GM.G, F=G.flags; if(F.TEA_STEP!==1) return false; F.TEA_STEP=2; GM.sceneBegin();
    try{ if(typeof ADV!=='undefined') ADV.begin({background:'blur'});
      await teaLines(GM,['（窗邊那桌放著餅乾、一大瓶紅茶和紙杯。另外兩個大一在聊選課，一個大三的學長在滑手機。）']); await GM.fade(true); GM.advance(0.25); await GM.fade(false);
      await teaLines(GM,['（過了一陣子，簽到桌沒人了，Kevin 坐過來。）',KV('簽到終於沒人了。'),KV('群組說的考古題，民總跟憲法的，去年的。你要先看嗎？')]);
      const i=await GM.choose([{t:'「要，謝謝學長。」'},{t:'「現在就要看考古題了嗎？」'}]); F.TEA_EXAM=i+1;
      await teaLines(GM,[i===0?KV('好，晚上丟群組。'):KV('不用啦，期中前再看就好。要的時候跟我說。')]);
      if(i===0&&typeof PHONE!=='undefined'){ const th='g:family_law', kv=t=>({th,from:'kevin',name:'Kevin',text:t}); PHONE.at(G,G.day,21,[kv('📎 民總、憲法考古題（去年）'),kv('茶會說的。')],'kevin_exam'); }   /* 9/2 21:00 家族群組（AA_200 2-11b）：只有選①的 */
    } finally { if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); GM.sceneEnd(); }
    F.TEA_STEP=3; if(typeof CLS!=='undefined'&&CLS.setGoal) CLS.setGoal(GM); if(GM.autosave) GM.autosave(); return true; };
  S.teaTick=function(GM){ const G=GM.G, F=G.flags; if(!S.teaOn(G)) return false; const hr=h(G);
    if(!F.TEA_REMIND&&hr>=17.5&&hr<18.5){ F.TEA_REMIND=true; if(GM.toast) GM.toast('手機｜提醒：18:30 新生茶會（萬才館一樓大廳）',4200); GM.setGoal('18:30 新生茶會（萬才館一樓大廳）'); }   /* AA_195 4-5：9/2 下午 17:30 手機提醒 */
    if(G.zone==='wancai'&&!F.TEA_STEP&&hr>=18.5&&hr<20.5){ void S.teaSignIn(GM); return true; }
    if(G.zone==='wancai'&&(F.TEA_STEP===1||(F.TEA_STEP>=3&&hr<20.5))) S.teaSpot(GM); return false; };
  /* 茶會以後（BB_168 第 7 節「之後」）：Kevin 還在，找他說話只有一句（選①考古題的「晚上丟」；其他人「有問題都可以問我」）*/
  S.teaKevin=async function(GM){ const F=GM.G.flags; GM.sceneBegin(); try{ await teaLines(GM,[KV(F.TEA_EXAM===1?'考古題晚上丟喔，記得看群組。':'有問題都可以問我，學姊比較忙。')]); } finally { GM.sceneEnd(); } return true; };
  /* BCG-46 期末合照（BB_132 第 69 組、CG 清單）：照片裡另外八個人（明軒、宥辰、柏翰、阿哲、沛珊、Alison、以安、芯慈）至少五位 FRIEND 以上 */
  S.CLASS_PHOTO_IDS=['classmate_mingxuan','classmate_youchen','classmate_bohan','zhe','classmate_peishan','yu','heroine_01','classmate_xinci'];
  S.classPhotoOk=G=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.stage) return false; const OK=['FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP']; return S.CLASS_PHOTO_IDS.filter(id=>OK.includes(SOCIAL.stage(id))).length>=5; };
  /* 手機上照旗標排時間的訊息（內容照企劃組原文）。每 0.5 秒（S.tick）；同一則用 tag 只排一次 */
  /* 某學期第幾週星期幾是第幾天（wd：1＝週一…7＝週日）；沒有＝null */
  /* 第 N 週星期 wd 是哪一天。16 週制（2026-10-17）以後第 17、18 週已經是寒暑假：照日期往後推（日子和 18 週制時完全一樣），不回傳 null——
     舊的寫法 termDay(…,17 或 18,…) 先維持原本的日子（多數事件 AA 決定日期不動、改成放假版，AA_198 第 2 節）；逐一改掉的清單在 docs/handoff/WEEK16_REFS_2026-10-17.md、AA_243 第 4 節 */
  const termDayCache={}; function termDay(term,week,wd){ const k=term+'|'+week+'|'+wd; if(k in termDayCache) return termDayCache[k]; let r=null; if(typeof CALENDAR!=='undefined'){ for(let d=(/^Y0/.test(term)?-420:-30);d<1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===week&&CALENDAR.dateOf(d).wd===wd){ r=d; break; } }
      if(r==null&&CALENDAR.termDays&&week>0&&wd>=1&&wd<=7){ const R=CALENDAR.termDays(term); if(R&&week>(R.to-R.from+1)/7) r=R.from+(week-1)*7+(wd-1); } }
    return termDayCache[k]=r; }
  /* 明軒的「公館一百元以內」清單（BB_70 5-6 F-M1；店名照遊戲裡的店，D77）*/
  S.MX_FM1={head:'公館一百元以內（明軒版）。按 CP 值排。不接受申訴。',title:'公館一百元以內（明軒版）',
    rows:[['林家乾麵（溫州街）','小碗乾麵＋貢丸湯','70','飽足感除以價錢，第一名。沒有之一。'],['阿鳳麵店','乾麵','60','湯另外點就超過了。阿姨有時候多給一塊豆干，這個不能算進排名。'],   /* AA_519 1-5：原本「乾麵＋餛飩湯 85」（菜單乾麵 60、餛飩湯 70）*/
          ['日日定食','今日定食（只有午餐）','95','剛好卡在一百以內。晚餐一百二，不算。'],['滷味・鹹酥雞','自己夾','80 以內','技巧：豆干多夾，肉少夾。'],
          ['早午餐','蛋餅＋奶茶','65','十點半以前。過了十點半，一樣的東西貴二十。'],['豆花・甜湯（溫州街）','豆花','40','這是甜點，不是正餐。可是讀到十一點，它就是正餐。'],
          ['日日便利','飯糰＋豆漿','55','最後一名。可是它二十四小時開。最後一名是留給半夜的。']],
    tail:'價錢是十月的。漲價我會改。……大概。'};
  S.MX_FM1.body='按 CP 值排。不接受申訴。<br>'+S.MX_FM1.rows.map((r,i)=>(i+1)+'. '+r[0]+'｜'+r[1]+'　'+r[2]+'<br>　'+r[3]).join('<br>')+'<br>'+S.MX_FM1.tail;
  /* SK01 對面的舊系館（events.js ev_sk01_soc）：第二天的劇情結束（afternoonDone、沒有同行的人）以後；社科圖開著（再一小時也還開著）、接下來 75 分鐘沒有課（選「去社科圖」要坐一小時）*/
  S.sk01Ready=function(G){ const F=G.flags; if(S.mainDay(G)<2||!F.afternoonDone||F.companion||(typeof TRIP!=='undefined'&&TRIP.at&&TRIP.at(G))) return false; const hh=h(G);
    if(typeof PLACES!=='undefined'&&PLACES.isOpen&&!(PLACES.isOpen('soclib',hh,G.day)&&PLACES.isOpen('soclib',hh+1,G.day))) return false;
    if(typeof CLS!=='undefined'&&CLS.next){ const n=CLS.next(G); if(n&&n.day===G.day&&n.t0-hh<1.25) return false; } return true; };
  /* SK02：阿勳的私訊排在哪一天——第 4 週週一起、SK01 隔天以後第一個平日（不是假日），到第 7 週週五為止；還沒到 15:00 的今天也可以 */
  S.sk02DmDay=function(G){ const F=G.flags, a=termDay('Y1S1',4,1), b=termDay('Y1S1',7,5); if(a==null||b==null||F.SK01_DAY==null) return null;
    for(let d=Math.max(a,F.SK01_DAY+1); d<=b; d++){ const wd=CALENDAR.dateOf(d).wd; if(wd<1||wd>5||(CALENDAR.holiday&&CALENDAR.holiday(d))) continue; if(d<G.day||(d===G.day&&h(G)>=15)) continue; return d; } return null; };
  /* SK02 的系辦開著：私訊到了（那天 15:00 以後）、還沒領、不是假日（時段 13:00～17:00、第 4～7 週平日寫在事件上）*/
  S.sk02Open=function(G){ const F=G.flags; if(F.SK02_DM_DAY==null||F.ECON_JACKET) return false; if(G.day<F.SK02_DM_DAY||(G.day===F.SK02_DM_DAY&&h(G)<15)) return false; return !(typeof CALENDAR!=='undefined'&&CALENDAR.holiday&&CALENDAR.holiday(G.day)); };
  /* 阿勳在旁邊（BB_106 的 npcNear：同一層、4 m 內）；大一上他還沒有作息，實際上不會出現 */
  S.xunNear=function(){ const GM=typeof GAME!=='undefined'?GAME:null, n=GM&&GM.npc&&GM.npc.econ_zhengxun; if(!n||!GM.E||!GM.E.npcs||!GM.E.npcs.includes(n)) return false; const P=GM.E.player; return (n.lv|0)===(P.lv|0)&&Math.hypot(n.obj.position.x-P.obj.position.x,n.obj.position.z-P.obj.position.z)<=4; };
  /* ---- BB_106、BB_105 法律系大一那幾件（企劃線 BB_106@71b3e6c3、BB_105@68a8479e，AA-C 2026-10-18 審過＝可以實作；白名單 LAWWW-C 10-21 已登記）----
     經濟系的朋友在法律系時期第一次出現的那一場，先加一句重新介紹（BB_105 2-1 通則）：沒玩經濟系那一年（PLAYED_Y0 沒有）、法律系時期也還沒見過的才加。
     阿勳、品妤用遊戲裡已經在用的那兩句（BB_96 10-1：MET_XUN、MET_PINYU）；唐睿看 STICKY_NOTES／KNOWS_TANG（SK04 揭曉）／MET_TANG；韋綸看 WL_SAID_LAW／MET_WEILUN */
  S.tangIntro=G=>{ const F=G.flags||{}; return !F.PLAYED_Y0&&!F.KNOWS_TANG&&!F.STICKY_NOTES&&!F.MET_TANG; };
  S.wlIntro=G=>{ const F=G.flags||{}; return !F.PLAYED_Y0&&!F.WL_SAID_LAW&&!F.MET_WEILUN; };
  /* BB_106 日常 D2 社科院—霖澤館—博雅的偶遇表（V1-B106-D1D2）：法律系大一上第 8 週起～大三下（SK01、SK02 的窗口過了才開始；經濟系那群 2028-06 畢業），上課週的平日。
     12:10 前後韋綸經過法學院廣場；15:30 前後阿勳或唐睿（一天一個）在社科院門口；週一、五 17:20 社會系下課，語彤在社科院門口（社會系館旁；週三 17:40 她在 118 巷吃晚餐，AA_320）。
     「可能遇到」＝那一天擲一次（日期＋人，35%），擲到的人照作息站在那裡（characters.js 寫 b106d2 的那幾筆），走到旁邊（npcNear）才說一句（events.js ev_b106d2_*）。
     每個人每天最多一句；同一句不重複出現兩次（AA_108）：韋綸「欸！……喔你現在是法律系的。那也走啦！」（第一次；和 BB_105 P5 共用 WL_SAID_LAW）→「走啦！」→ 有 WL_BIKE 才有「走啦！……這台是我自己的。有發票。」；
     唐睿 SOC_ROAD_PERSON「路人！」、SOC_WRONG_BUILDING「走錯棟的！」、都沒有「法律系的！」（照那時候的旗標，各一次）；阿勳「你們法律系的課表，是不是也很不合理？」一次；語彤一次（事件 once）。
     沒有台詞可以說的人就不站在那裡。說過的記在 B106D2_SAID（句子→第幾天）、B106D2_LAST（人→最後一次是第幾天）*/
  /* AA_521（0f4b48f20）：大一下起照學期取鍵（每人每學期 a、b 兩句、品妤一學期一句）——src/econfr3d.js 包住下面的 S.b106d2Key（這裡留大一上的句子）*/
  S.B106D2_P=0.35;
  const d2rand=s=>{ let x=2166136261; for(let i=0;i<s.length;i++){ x^=s.charCodeAt(i); x=Math.imul(x,16777619); } x^=x>>>13; x=Math.imul(x,1274126177); x^=x>>>16; return (x>>>0)/4294967296; };
  S.b106d2Term=G=>{ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!T||!/^Y[123]S[12]$/.test(T.id)||T.exam) return null; if(T.id==='Y1S1'&&T.week<8) return null; if(CALENDAR.kind&&CALENDAR.kind(G.day)!=='term') return null; return T; };
  S.b106d2Key=function(G,id){ const F=G.flags||{}, said=(F.B106D2_SAID&&typeof F.B106D2_SAID==='object')?F.B106D2_SAID:{}, no=k=>said[k]==null;
    if(id==='econ_weilun'){ if(!F.WL_SAID_LAW) return 'wl_first'; if(no('wl_go')) return 'wl_go'; if(F.WL_BIKE&&no('wl_bike')) return 'wl_bike'; return null; }
    if(id==='econ_tangrui'){ const k=F.SOC_ROAD_PERSON?'tr_road':(F.SOC_WRONG_BUILDING?'tr_wrong':'tr_law'); return no(k)?k:null; }
    if(id==='econ_zhengxun') return no('xun_sched')?'xun_sched':null;
    return null; };
  S.b106d2Due=function(G,id){ const T=S.b106d2Term(G); if(!T||G.weekday<1||G.weekday>5||(CALENDAR.holiday&&CALENDAR.holiday(G.day))) return false;
    const F=G.flags||{}, last=F.B106D2_LAST&&typeof F.B106D2_LAST==='object'?F.B106D2_LAST:{}; if(last[id]===G.day) return false;   /* 每個人每天最多一句 */
    if(id==='heroine_03') return !(G.events&&G.events.done&&G.events.done.ev_b106d2_yutong)&&d2rand(G.day+':yt')<S.B106D2_P;
    if(!S.b106d2Key(G,id)) return false;
    if(id==='econ_tangrui'||id==='econ_zhengxun'){ const other=id==='econ_tangrui'?'econ_zhengxun':'econ_tangrui', pick=d2rand(G.day+':who')<0.5?'econ_tangrui':'econ_zhengxun';   /* 15:30：阿勳或唐睿其中一個（擲到的那個沒有話說了，就換另一個）*/
      if(id!==pick&&S.b106d2Key(G,other)) return false; return d2rand(G.day+':soc')<S.B106D2_P; }
    return d2rand(G.day+':'+id)<S.B106D2_P; };
  S.b106d2Done=function(G,id,k){ const F=G.flags; if(k){ if(!F.B106D2_SAID||typeof F.B106D2_SAID!=='object') F.B106D2_SAID={}; F.B106D2_SAID[k]=G.day; } if(!F.B106D2_LAST||typeof F.B106D2_LAST!=='object') F.B106D2_LAST={}; F.B106D2_LAST[id]=G.day; };
  /* BB_105 D4b、BB_106 日常 D1（女舍門口）：麵店團在大一女舍門口集合——以安住在大一女舍（BB_105 5-3a）。遊戲裡沒有這個集合，這裡定成：上課週的週二麵店日（S.noodleDay）19:00
     （D4b 以安「七點。你們遲到兩分鐘。」；給 AA 的問題），以安在臺北、你在麵店團群組、她已經報過名字 */
  S.fdormGather=function(G){ if(G.weekday!==2||!S.noodleDay(G.day)) return false; const T=CALENDAR.termOf(G.day); if(!T||(T.id!=='Y1S1'&&T.id!=='Y1S2')) return false;
    if(!(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team'))||!S.anNameTold(G)) return false; const pr=S.presence('heroine_01',G); return !(pr&&pr.here===false); };
  /* 這個人現在照作息不在學校（例：品妤大一下週二、四 18:00～22:00 在補習班櫃台）*/
  S.awayNow=function(id,G){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c) return false; const pr=S.presence(id,G); if(pr&&pr.here===false) return true; const e=schedEnt(c,G); return !!(e&&e.zone===null); };
  /* 這個人現在照作息沒有別的事（沒有那一筆作息、或只是在校園）：例 BB_105 D4 沛珊在女舍下樓——她上課、在總圖、在 118 巷的時候不會下樓 */
  S.freeNow=function(id,G){ if(S.awayNow(id,G)) return false; const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; const e=c?schedEnt(c,G):null; return !e||e.zone==='campus'; };
  /* SK06 特別感謝：法律系的路人（BB_106 SK06；V2-SK06）：大一下第 10 週週一 16:00 品妤私訊；第 10～14 週週一、三、五 17:00～20:00（她週二、四在補習班）走到社科院大樓的門口＝2D 三樓討論室。
     沒去：第 15 週週一 21:00「走啦」群組一則。去不去都記 SOC_ROAD_PERSON（群組已經這樣叫他）*/
  S.sk06Open=function(G){ const F=G.flags; if(F.SK06_DM_DAY==null||F.SOC_ROAD_PERSON) return false; return G.day>F.SK06_DM_DAY||(G.day===F.SK06_DM_DAY&&h(G)>=16); };
  /* SK02 沒去系辦：第 8 週以後第一次回到男生宿舍門廳，櫃台叫住你、阿勳替你領了，附一張紙條（BB_106 SK02「沒去時」，旁白 BB-B 66cf3ed4）。外套當作收進衣櫃；沒有「走錯棟」（不記 SOC_WRONG_BUILDING）*/
  S.sk02W8Due=function(G){ const F=G.flags; if(G.zone!=='dorm_hall'||F.SK02_DM_DAY==null||F.ECON_JACKET||typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day); return !!t&&t.id==='Y1S1'&&t.week>=8; };
  S.sk02W8=async function(GM){ const G=GM.G, F=G.flags; F.ECON_JACKET='closet'; F.SK02_W8=G.day; GM.sceneBegin(); try{ await GM.say(null,'宿舍櫃台叫住你：『有你的東西。一個經濟系的學生放的。』'); await GM.say({name:'阿勳的紙條'},'你的過去，我幫你領了。'); } finally { GM.sceneEnd(); } GM.memo('阿勳替你去系辦領了經濟系的系外套'); };
  S.termDay=termDay;
  /* AA_373 #1（企劃線 a48fe1b7）：學期裡的第 N 週星期 wd——超過學期（16 週制的第 17、18 週＝已經放假）不回傳日子（null）。
     每週固定格（可昕「我們的日子」、明軒的家教）用這個；termDay 本身照舊往後推（上面那段：舊的寫法、舊存檔只有週次的紀錄還在用）。termWeeks＝這學期有幾週 */
  S.termDayIn=function(term,week,wd){ const d=termDay(term,week,wd); if(d==null||typeof CALENDAR==='undefined') return d; const t=CALENDAR.termOf(d); return t&&t.id===term?d:null; };
  S.termWeeks=function(term){ const R=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays(term):null; return R?Math.round((R.to-R.from+1)/7):16; };
  /* AA_373 #17：5/7（大一下第 11 週週四，V2-C13 kx_b4_ask）手機上回過可昕「講者最後問：『…』」那一句（聽完 B4 才有這個選項）。
     看回覆的紀錄（ans），舊存檔回過的也算；期末河堤「那場演講。」只給這些玩家（events.js REVISIT_Y1_OPTS）*/
  S.kxB4Told=function(G){ return ((G&&G.msgs)||[]).some(m=>m&&m.tag==='kx_b4_ask'&&m.ask&&m.ans!=null&&Array.isArray(m.ask.opts)&&!!m.ask.opts[m.ans]&&/^講者最後問/.test(m.ask.opts[m.ans].t||'')); };
  /* 芷若 Z3「妳自己都喝什麼」（BB_96 3-1）：還沒發生、大一下第 3 週起的平日（她 19–22 晚班）、和她有點熟以上——這一天 21:40～22:00「店裡只剩祐廷」：
     之前進來的客人 21:40 起身走出去（until：refreshSchedule 讓他們走到門口才離開，不在眼前消失）、21:40～22:00 不生成客人（populate）；
     事件本身要等店裡沒有別的客人（S.cafeOthers：還沒在離開的人、跟著你的人）。吧檯的店員（clerk、芷若自己）是員工，不算客人 */
  S.Z3_SHUT=21+40/60;
  S.z3Pending=function(G){ if(!G||((G.events&&G.events.done)||{}).ev_zhiruo_own_drink) return false; if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false;
    const wd=G.weekday; if(!(wd>=1&&wd<=5)) return false; const d0=termDay('Y1S2',3,1); if(d0==null||G.day<d0) return false;
    return SOCIAL.STAGES.indexOf(SOCIAL.stage('heroine_02'))>=SOCIAL.STAGES.indexOf('FAMILIAR'); };
  S.cafeOthers=function(GM){ GM=GM||GM_ref; const out=[]; if(!GM) return out;
    for(const k of Object.keys(GM.npc||{})){ const n=GM.npc[k]; if(!n||k==='heroine_02'||n.charId==='heroine_02'||n.staff||n.leaving) continue; out.push(k); }
    for(const n of ((GM.E&&GM.E.npcs)||[])){ if(n&&n.isExtra&&!n.clerk&&!n.leaving) out.push('extra'); }
    return out; };
  S.zhNum=n=>{ const d='零一二三四五六七八九'; n=n|0; if(n<=0) return '零'; if(n<10) return d[n]; if(n<20) return '十'+(n%10?d[n%10]:''); return d[Math.floor(n/10)]+'十'+(n%10?d[n%10]:''); };   /* 3→三、12→十二、20→二十 */
  /* 玩家認識這個人了嗎（群戲只放認識的人：交接包 v1 交付清單第 0 節第 1 點、AA_120 初遇規則）：FIRST_MET；Alison 的第一次說話是 talkYu（met_yu）；阿哲開場就熟 */
  S.knows=function(id,G){ G=G||(GM_ref&&GM_ref.G); if(id==='zhe') return !(G&&S.week1Start&&S.week1Start(G))||!!(G.flags&&G.flags.MET_ZHE);   /* A15（AA_195 4-8）：開學改 9/1 的局要初遇（ev_zhe_w1_meet）；舊局、舊存檔照舊一開始就認識 */ if(id==='yu'&&G&&G.flags&&G.flags.met_yu) return true; return typeof SOCIAL!=='undefined'&&SOCIAL.has(id,'FIRST_MET'); };
  let e37LawBusy=false;   /* X81 法律系開局 8/29 21:30：旁白演完才送兩則（一次只演一個）*/
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:e37LawBusy']=()=>{ e37LawBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  let y0CallBusy=false;   /* 經濟系那一年固定核心的「韋綸打電話」（AA_154 A33）：一次只演一通 */
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:y0CallBusy']=()=>{ y0CallBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  /* ---------- 主線 4「被需要的一年」：大二每週日 21:00「這週的訊息」（AA_179 第 1 節；訊息池 src/data/needed_msgs.js：AA_179 第 2、4 節、BB_97 第 11 節）----------
     大二上第 1 週到大二下第 16 週的每個週日 21:00（第一個 9/13、最後一個 6/13；AA_243 G5 16 週制），手機跳出最多四則，回得了兩則（PHONE 的 ask.grp／max）；回了的信任 +1。
     挑的順序：綁事件的先挑 → 上週沒出現的人先挑 → 同一層裡，快過期的先挑；只挑認識的人（沒寫條件的＝FAMILIAR 以上；anyone＝只看條件）；一個人一週一則；
     同一則只出現一次（every：隔幾週可以再出現，語彤「阿姨問你週四來不來」每四週）。週末回家的週日照樣跳（在家的迴圈也跑 phoneRules，AA_176 R11）。
     沒回的：那一組關掉以後（回滿兩則，或下一個週日 21:00）兩週內第一次和他說話，他說第 4 節那一句；同一個人兩週最多一次。不扣分、不改數值。
     記在 G.needed＝{asked, answered, byWho:{id:[被問幾次, 回幾次]}}（大三主線 6 讀 asked）；挑選用的 shown、prev、batches、missLast 也放這裡。背景節拍：不給 CG、不進重要回憶。
     測試：node tests/v3_needed_unit.js */
  const NEED_TERMS=['Y2S1','Y2S2'];
  S.neededRec=function(G){ let N=G.needed; if(!N||typeof N!=='object') N=G.needed={}; if(typeof N.asked!=='number') N.asked=0; if(typeof N.answered!=='number') N.answered=0; if(!N.byWho||typeof N.byWho!=='object') N.byWho={};
    if(!N.shown||typeof N.shown!=='object') N.shown={}; if(!Array.isArray(N.prev)) N.prev=[]; if(!Array.isArray(N.batches)) N.batches=[]; if(!N.missLast||typeof N.missLast!=='object') N.missLast={}; return N; };
  const needAbs=(d,h)=>d*24+h;
  /* 最近一個已經過了 21:00 的週日（在大二上下第 1～16 週裡）；不在期間＝null */
  S.neededSunday=function(G){ const wd=G.weekday!=null?G.weekday:((CALENDAR.dateOf(G.day).wd)%7); let d=G.day-wd; if(wd===0&&G.hour<21) d-=7;
    const t=CALENDAR.termOf(d); if(!t||!NEED_TERMS.includes(t.id)||!(t.week>=1&&t.week<=16)) return null; return d; };
  S.neededPick=function(G,d){ if(typeof NEEDED_MSGS==='undefined') return []; const N=S.neededRec(G), t=CALENDAR.termOf(d); if(!t) return []; const w=t.week;
    const lv=id=>typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel(id):'STRANGER', known=id=>['FAMILIAR','FRIEND','CLOSE_FRIEND'].includes(lv(id))&&(typeof SOCIAL==='undefined'||!SOCIAL.has||SOCIAL.has(id,'FIRST_MET')||id==='zhe'||id==='kai');
    const ok=e=>{ if(e.at) return false; if(e.term!==t.id||w<e.w[0]||w>e.w[1]) return false;   /* at：指定時間的那幾則不進週日那一組（S.neededAt）*/ const sh=N.shown[e.id]; if(sh!=null&&!(e.every&&d-sh>=e.every*7)) return false;
      try{ if(e.cond&&!e.cond(G)) return false; }catch(err){ return false; } return e.anyone?true:known(e.who); };
    const C=NEEDED_MSGS.list.map((e,i)=>({e,i})).filter(x=>ok(x.e));
    const tier=x=>x.e.tie?0:(N.prev.includes(x.e.who)?2:1); C.sort((a,b)=>tier(a)-tier(b)||a.e.w[1]-b.e.w[1]||a.i-b.i);
    const out=[], who=new Set(); for(const x of C){ if(who.has(x.e.who)) continue; who.add(x.e.who); out.push(x.e); if(out.length>=4) break; } return out; };
  /* phoneRules 每次都問：該跳的那個週日還沒跳過＝挑、排進手機（時間是那個週日 21:00，晚了照原本的時間補）*/
  /* 指定時間的那幾則（at：{day:'YYYY-MM-DD', h}；AA_375 第 10 項：明軒的說明會那則 3/15（一）21:00——學校信 3/15 09:00 才公告、以安 09:20 才說坐第一排）：
     不進週日那一組，自己一組（回得了這一則）；認識的人、條件、依條件換的版本、記 shown／asked／byWho、沒回的那一句都照週日的。晚了照原本的時間補（6 天內）*/
  S.neededAt=function(GM){ const G=GM.G; if(typeof NEEDED_MSGS==='undefined'||typeof PHONE==='undefined'||S.isEcon&&S.isEcon(G)) return; const N=S.neededRec(G), now=needAbs(G.day,G.hour);
    for(const e of NEEDED_MSGS.list){ if(!e.at||N.shown[e.id]!=null) continue; const d=S.dayOfKey(e.at.day); if(d==null) continue; const t0=needAbs(d,e.at.h); if(now<t0||now-t0>=6*24) continue;
      const lv=typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel(e.who):'STRANGER', kn=['FAMILIAR','FRIEND','CLOSE_FRIEND'].includes(lv)&&(typeof SOCIAL==='undefined'||!SOCIAL.has||SOCIAL.has(e.who,'FIRST_MET')||e.who==='zhe'||e.who==='kai');
      let ok=!!(e.anyone||kn); try{ if(ok&&e.cond&&!e.cond(G)) ok=false; }catch(err){ ok=false; } if(!ok) continue;
      if(typeof V6EX!=='undefined'&&V6EX.cool&&V6EX.coolSkip&&V6EX.cool(Object.assign({},G,{day:d}),e.who)&&V6EX.coolSkip(G,e.who,'need',e.id+'@'+d)){ N.shown[e.id]=d; continue; }   /* 分開以後一個學期，她先傳的每兩則送一則（AA_434 4-3；和每週 neededPick 共用 need 的計數）*/
      const grp='need_'+d; N.shown[e.id]=d; N.asked++; const bw=N.byWho[e.who]||(N.byWho[e.who]=[0,0]); bw[0]++;
      if(typeof INV!=='undefined'){ INV.rec(G); if(G.contacts[e.who]==null) G.contacts[e.who]=G.day; }
      const v=S.neededVar(G,e), msg=v.msg||e.msg, resp=v.resp||e.resp||[];
      const items=msg.map((text,k)=>{ const it={th:'p:'+e.who,from:e.who,text}; if(k===msg.length-1) it.ask={id:grp+'_'+e.id,grp,max:1,until:needAbs(d+7,21),opts:[{t:e.reply,say:resp.map(r=>({from:e.who,text:r})),need:e.id}]}; return it; });
      N.batches.push({d,ids:[[e.id,e.who]],ans:[],closedAt:null,said:{}}); if(N.batches.length>4) N.batches.splice(0,N.batches.length-4);
      PHONE.at(G,d,e.at.h,items,grp); } };
  S.neededRules=function(GM){ const G=GM.G; if(typeof NEEDED_MSGS==='undefined'||typeof PHONE==='undefined'||S.isEcon&&S.isEcon(G)) return; S.neededAt(GM); const d=S.neededSunday(G); if(d==null) return; const N=S.neededRec(G); if(N.last===d) return;
    if(needAbs(G.day,G.hour)-needAbs(d,21)>=6*24){ N.last=d; return; }   /* 跳過太久（同一週快結束了）就不補 */
    const L=S.neededPick(G,d); N.last=d; N.prev=L.map(e=>e.who); if(!L.length) return; const grp='need_'+d;
    const items=[{th:'sys',text:'這週的訊息（'+L.length+' 則）。這週你回得了兩個人。'}];
    for(const e of L){ N.shown[e.id]=d; N.asked++; const bw=N.byWho[e.who]||(N.byWho[e.who]=[0,0]); bw[0]++;
      if(typeof INV!=='undefined'){ INV.rec(G); if(G.contacts[e.who]==null) G.contacts[e.who]=G.day; }   /* 他傳訊息給你＝有你的聯絡方式 */
      const v=S.neededVar(G,e), msg=v.msg||e.msg, resp=v.resp||e.resp||[];   /* 依條件換的版本（BB_97 11-1：明軒說明會、阿凱鍵盤、子晴爸爸）*/
      msg.forEach((text,k)=>{ const it={th:'p:'+e.who,from:e.who,text}; if(k===msg.length-1) it.ask={id:grp+'_'+e.id,grp,max:2,until:needAbs(d+7,21),opts:[{t:e.reply,say:resp.map(r=>({from:e.who,text:r})),need:e.id}]}; items.push(it); }); }
    N.batches.push({d,ids:L.map(e=>[e.id,e.who]),ans:[],closedAt:null,said:{}}); if(N.batches.length>4) N.batches.splice(0,N.batches.length-4);
    PHONE.at(G,d,21,items,grp); };
  S.neededAnswered=function(G,m,o){ const N=S.neededRec(G), grp=m.ask&&m.ask.grp; const b=N.batches.find(x=>'need_'+x.d===grp); const e=typeof NEEDED_MSGS!=='undefined'&&NEEDED_MSGS.list.find(x=>x.id===o.need); if(!e) return;
    N.answered++; const bw=N.byWho[e.who]||(N.byWho[e.who]=[0,0]); bw[1]++; if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(e.who,{trust:1});
    if(b&&!b.ans.includes(e.id)){ b.ans.push(e.id); if(b.ans.length>=2&&b.closedAt==null) b.closedAt=needAbs(G.day,G.hour); } };
  /* 沒回的那一句：這次見面該說的（沒有＝null）；說了就記下來 */
  S.neededVar=function(G,e){ for(const v of e.vars||[]){ try{ if(v.cond(G)) return v; }catch(err){} } return {}; };
  /* 那一則沒回的那一句（AA_179 第 4 節、BB_97 11-2：每一則各一句；交往中換 missDating；miss:null＝不提；missUnless＝那件事已經發生就不說）*/
  S.neededMissFor=function(G,e,who){ if(!e) return (NEEDED_MSGS.miss||{})[who]||null; if(e.miss===null) return null; try{ if(e.missUnless&&e.missUnless(G)) return null; }catch(err){}
    const v=S.neededVar(G,e);   /* 依條件換的版本也可以有自己的 miss（AA_428 §2 第 6 點：zq_game 沒試玩過的那一版）*/
    const gen=v.miss||e.miss||(NEEDED_MSGS.miss||{})[who]||null;
    if(e.missDating&&G.flags&&G.flags['dating_'+who]) return gen&&datingQuiet(G,e,who,e,'miss')?gen:e.missDating;   /* 見面時旁邊有她的人＝說一般版；沒有一般版的照說（AA_503 第 14 節第 7 項）*/
    return gen; };
  S.neededMissLine=function(G,id){ if(typeof NEEDED_MSGS==='undefined'||!G.needed) return null; const N=S.neededRec(G); const now=needAbs(G.day,G.hour);
    if(N.missLast[id]!=null&&now-N.missLast[id]<14*24) return null;
    for(let i=N.batches.length-1;i>=0;i--){ const b=N.batches[i]; const it=b.ids.find(x=>x[1]===id); if(!it||b.ans.includes(it[0])||b.said[id]) continue;
      const close=b.closedAt!=null?b.closedAt:needAbs(b.d+7,21); if(now<close||now>=close+14*24) continue;
      const lines=S.neededMissFor(G,NEEDED_MSGS.list.find(x=>x.id===it[0]),id); if(!lines) continue; b.said[id]=true; N.missLast[id]=now; return lines; }
    return null; };
  /* 沛珊和柏翰分開，玩家只在群組看到（ps_split_group、沒演 ev_peishan_split／ev_peishan_bohan_split）：同一學期下一次和柏翰說話，他先說兩句（AA_313 5-5；AA_389 第 6 點照逐場表）*/
  S.bhSplitHeard=async function(GM,who,id){ const G=GM.G, F=G.flags, D0=(G.events&&G.events.done)||{}; if(id!=='classmate_bohan'||F.BH_SPLIT_TALKED||typeof PHONE==='undefined'||!PHONE.sent(G,'ps_split_group')||D0.ev_peishan_split||D0.ev_peishan_bohan_split) return false;
    const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; F.BH_SPLIT_TALKED=G.day; if(!t||t.id!=='Y2S1') return false;
    await GM.say(who,'「沛珊在群組說了。」'); await GM.say(who,'「……嗯。這週我想多念一點。」'); return true; };
  S.neededMiss=async function(GM,who,id){ const L=S.neededMissLine(GM.G,id); if(!L) return false; for(const t of L) await GM.say(who,'「'+t+'」'); return true; };
  S.phoneRules=function(GM){ const G=GM.G, F=G.flags; if(typeof PHONE==='undefined') return; for(const f of S.PHONE_RULES){ try{ f(G,GM); }catch(e){ console.warn('STORY.PHONE_RULES',e); } }   /* 事件包各自的手機規則（STORY.PHONE_RULES.push(fn)）*/ if(typeof L118!=='undefined'){ try{ L118.phone(G); L118.tick(G); }catch(e){ console.warn('L118.phone',e); } }   /* 阿哲週一揪 118 巷午餐（AA_280 第 4 節）*/ if(typeof MSG!=='undefined'&&MSG.ukDaily){ try{ MSG.ukDaily(G); }catch(e){ console.warn('MSG.ukDaily',e); } }   /* 芷若在英國、交往中：每週一則（AA_457 第 1 節，原本 BB_178 1-E 每天一則；src/msg3d.js）*/ if(typeof HOME!=='undefined'){ try{ HOME.phoneRules(GM); if(HOME.breakPhone) HOME.breakPhone(GM); }catch(e){ console.warn('HOME.phoneRules',e); } } if(typeof TERMEND!=='undefined'){ try{ TERMEND.phone(GM); }catch(e){ console.warn('TERMEND.phone',e); } }   /* 學期末的飯（BB_203）*/ if(typeof VAC!=='undefined'){ try{ VAC.phone(GM); }catch(e){ console.warn('VAC.phone',e); } }   /* 假期活動（AA_199）*/ try{ S.neededRules(GM); }catch(e){ console.warn('NEEDED',e); }   /* 主線 4：每週日 21:00「這週的訊息」*/   /* 家人群組（週四 20:00）；放假的手機（AA_183：7/9 語彤生日、7/15 宿舍抽籤）*/ const silentContact=id=>{ if(typeof INV==='undefined') return; INV.rec(G); if(G.contacts[id]==null) G.contacts[id]=G.day; };
    /* AA_383 第 4-2 節（企劃線 98516b51）：沛珊還筆記（D4，ev_b105_d4_notes）怎麼約的——大一上第 4 週週一 12:00 她私訊兩句（有她的聯絡方式才傳）；之後走到女舍門口照現在演（第一句「我下樓了！」就是回你傳的訊息）。
       第 8 週結束還沒演（一直沒走到女舍門口）＝第 9 週週一 12:00 她傳一句（收過 9/22 那兩句的才傳）；D4 只在第 4～8 週，之後不演 */
    { const d4=termDay('Y1S1',4,1), d9=termDay('Y1S1',9,1), ps=t=>({th:'p:classmate_peishan',from:'classmate_peishan',text:t});
      if(d4!=null&&G.day===d4&&h(G)>=12&&!PHONE.sent(G,'b105_d4_dm')&&typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,'classmate_peishan')) PHONE.at(G,d4,12,[ps('你借我的筆記，我抄完了！'),ps('你哪天經過女舍門口跟我說，我拿下去給你！')],'b105_d4_dm');
      if(d9!=null&&G.day>=d9&&G.day<d9+7&&!(G.day===d9&&h(G)<12)&&PHONE.sent(G,'b105_d4_dm')&&!(G.events&&G.events.done&&G.events.done.ev_b105_d4_notes)&&!PHONE.sent(G,'b105_d4_desk')) PHONE.at(G,G.day,G.day===d9?12:h(G),[ps('筆記我上課的時候放你桌上了！謝謝你借我！')],'b105_d4_desk'); }
    if(S.psKeep(G)&&!PHONE.sent(G,'ps_keep_'+G.day)){ const n=+F.PS_KEEP_N||0; F.PS_KEEP_N=n+1; F.PS_KEPT=true; PHONE.at(G,G.day,23+(G.day%6)/10,[{th:'p:classmate_peishan',from:'classmate_peishan',text:S.psKeepLine(G.day)}],'ps_keep_'+G.day); }   /* 沛珊重考消失期、交往中（AA_276 第 4 節）：每晚 23:00 以後一則；挑哪一句照日子排（AA_460 第 2 節，S.psKeepPlan；原本六句照順序輪）。PS_KEEP_N 照舊記（不再用來挑句子）*/
    /* 芷若的第一則私訊（BB_95 4-2）：Café 第五次加了店裡的帳號（zhiruoShopContactDay）→ 那天 22:07；交往中改在隔天 15:10＋友情版的第三句（AA_112 8-1：交往中的玩家不收晚上只傳給他的訊息）*/
    /* 第三句（BB_95 4-2，BB 2026-10-14 654f5dd）：照第一次點的東西——有奶的（拿鐵、卡布奇諾、熱可可）「奶泡我多打了三秒」、手沖「悶蒸我多等了十秒」、
       美式「水我少加了一點」、茶「我多泡了十秒」、點心「挑」；交往中隔天 15:10 才傳：飲料都是「你昨天的那杯，是我做的。好喝的話，跟老闆說。」*/
    const ZR_DESSERT={'檸檬塔':['你今天的檸檬塔，我挑了邊邊最脆的那一塊。','你昨天的檸檬塔，是我挑的。好吃的話，跟老闆說。']};
    const zrThird=(order,dating)=>{ const d=ZR_DESSERT[order]; if(d) return d[dating?1:0]; if(dating) return '你昨天的那杯，是我做的。好喝的話，跟老闆說。';
      if(order==='手沖') return '你今天的手沖，悶蒸我多等了十秒。不知道你喝不喝得出來。'; if(order==='美式') return '你今天的美式，水我少加了一點。不知道你喝不喝得出來。'; if(/茶/.test(order)) return '你今天的茶，我多泡了十秒。不知道你喝不喝得出來。';
      return '今天那杯'+order+'，奶泡我多打了一點，不知道你喝不喝得出來。'; };   /* BB_167 SC3 第 27 列（AA_207 §5）：「你沒發現。」換成「不知道你喝不喝得出來」、點心的直接刪掉；交往中隔天那一版照留 */
    if(F.zhiruoShopContactDay!=null&&!PHONE.sent(G,'zr_dm1')){ const d=F.zhiruoShopContactDay, dating=zrKnows(G), Z=t=>({th:'p:heroine_02',from:'heroine_02',text:t});
      PHONE.at(G,dating?d+1:d,dating?15+10/60:22+7/60,[Z('我是兩點半的芷若。店裡的帳號是我在回。'),Z('要外帶可以先傳，我先做。'),Z(zrThird(F.zhiruoFirstOrder||'拿鐵',dating))],'zr_dm1'); }
    if(G.msgs&&G.msgs.some(m=>m.tag==='zr_dm1')) silentContact('heroine_02');   /* 收到了＝有她的聯絡方式（之後她改用自己的帳號）*/
    /* 語彤事件 3（AA_11 事件 3、BB_95 4-3）：選「我知道誰會知道」→ 祐廷第一次私訊學姊；學姊當晚 22:30 回；祐廷把截圖傳給語彤：「……法服是什麼？」
       （沒有語彤的聯絡方式：下次在麵店當面給她看，ev_yutong_fwd）*/
    if(F.yutongAskSisDay!=null&&!PHONE.sent(G,'sis_yutong_q')){ silentContact('heroine_05'); for(const t of ['學姊，想請問一件事。麵店的阿姨被客人說吃壞肚子，要賠三萬。','客人還錄了跟阿姨吵架的聲音，說要告。這種事可以去法服問嗎？']) PHONE.post(G,{th:'p:heroine_05',from:'player',who:null,text:t,tag:'sis_yutong_q'});   /* 祐廷傳給學姊的兩則（AA 2026-10-14：不用括號說明）*/
      const W=t=>({th:'p:heroine_05',from:'heroine_05',text:t}), fs=S.fafuSat(F.yutongAskSisDay);   /* AA_140 G47、BB_95 4-3 兩版：那一週的週六就是法服值班＝「這週六」，不是＝「下週六」*/
      PHONE.at(G,F.yutongAskSisDay,22.5,[W(!(fs&&fs.thisWeek)?'叫阿姨下週六早上九點來萬才館，法服有值班。':'叫阿姨這週六早上九點來萬才館，法服有值班。'),W('發票、那天的進貨單、監視器的時間，全部留著。'),W('然後叫阿姨先睡覺。')]   /* AA_398 第 6 列：不數件數（法律內容一字不改）*/,'sis_yutong'); }
    /* 芷若 Z2（BB_95 2-4）：經原分組之後加入小組群組，她的第一則；祐廷可以回（BB_95 4-2，BB 2026-10-14 654f5dd）：三個回覆都算「回過她一次」，她不在群組回；也可以不回 */
    if(F.geGroupDay!=null&&!PHONE.sent(G,'ge_grp1')){ PHONE.join(G,'ge_econ','經原分組報告'); PHONE.at(G,G.day,G.hour+0.2,[{th:'g:ge_econ',from:'heroine_02',text:'我負責剪片。不要叫我上台。',
      ask:{opts:[{t:'好。我上台，妳剪片。',set:{ZR_GRP_REPLY:1}},{t:'收到。報告的稿我先寫。',set:{ZR_GRP_REPLY:2}},{t:'（貼一張「OK」的貼圖）',post:'（貼圖：OK）',set:{ZR_GRP_REPLY:3}}]}}],'ge_grp1'); }
    /* 芷若的第一則私訊——通識群組的替代觸發（BB_95 4-2）：回過她以後的那晚 22:07（交往中隔天 15:10）；回的時候已經過了 22:07＝隔天 22:07，第三句用「昨天」。
       和 Café 第五次的版本共用 tag zr_dm1：哪一個先到就傳哪一個，只傳一次 */
    if(F.ZR_GRP_REPLY&&!PHONE.sent(G,'zr_dm1')){ const r=(G.msgs||[]).find(m=>m.th==='g:ge_econ'&&m.from==='player'), d=r?r.day:G.day, h=r?r.h:G.hour, dating=zrKnows(G), Z=t=>({th:'p:heroine_02',from:'heroine_02',text:t});
      const late=!dating&&h>=22+7/60-0.02, yday=dating||late;
      PHONE.at(G,dating||late?d+1:d,dating?15+10/60:22+7/60,[Z('我是經原那組的芷若。'),Z((+F.CAFE_VISITS||0)>0?'也是兩點半那個店員。':'我在溫州街的兩點半打工，要喝什麼可以先傳。'),Z(yday?'你昨天在群組回得很快。我以為法律系的人都很慢。':'你剛剛在群組回得很快。我以為法律系的人都很慢。')],'zr_dm1'); }
    /* 學姊 A5-1 新版（BB_188 @05571a45，使用者 10:3x 對 LAWWW-C「通過」；實作照 AA_218 17-13）：
       B 9/1 21:00 系上社群（law_board）的自我介紹（前後幾則不具名同學的自介）→ 9/2 12:30 她的留言 → 第一次關手機時旁白（按讚、加好友，afterPhoneClose）→ 9/3 08:00 她接受（聯絡人）→ 9/3 21:00 祐廷先私訊（強制）；
       9/4 21:00 家族群組 Kevin 點到她、她兩句；C1 在 events.js（ev_sis_c1_festival）；C2 她家搬家（ev_sis_c2_room＋這裡的私訊）。只在 9/1 以前開始法律系的新局 */
    if((G.stage||'law')==='law'&&PHONE.inGroup(G,'law_board')){ const d1=S.dayOfKey('2025-09-01'), past=(d,hh)=>G.day>d||(G.day===d&&G.hour>=hh), T='g:law_board', Q=(nm,t)=>({th:T,name:nm,text:t}), nm=G.name||'祐廷';
      const start=F.LAW_START_DAY==null||F.LAW_START_DAY<=d1;
      if(start&&past(d1,21)&&G.day<=d1+2&&!PHONE.sent(G,'sis_b_intro')) PHONE.at(G,d1,21,[Q('怡君','大家好，我是怡君，台中人，喜歡貓。請多指教。'),Q('家瑋','我是家瑋，高雄來的，興趣是看電影。'),{th:T,from:'player',text:'大家好，我是'+nm+'，財經法學組，澄嶼高中畢業。興趣是數學跟睡覺。請多指教。'},Q('品萱','我是品萱，宜蘭人。第一次住宿舍，有點緊張。')],'sis_b_intro');   /* ○○高中＝澄嶼高中（虛構，LAWWW 定；AA_218 17-13 第 1 點）；AA_372 第 10 項：祐廷的自介拿掉「重考一年」（之後同學才問）；前後的自介是一般同學（沒有 from、不算認識誰；名字只顯示在貼文上），LAWWW 寫一般的 */
      if(PHONE.sent(G,'sis_b_intro')&&past(d1+1,12.5)&&G.day<=d1+3&&!PHONE.sent(G,'sis_b_comment')) PHONE.at(G,d1+1,12.5,[{th:T,from:'heroine_05',name:'溫書瑀',text:'歡迎學弟～選課或宿舍有問題可以私訊問我。'}],'sis_b_comment');
      if(PHONE.sent(G,'sis_b_comment')&&past(d1+2,8)&&!F.SIS_CONTACTED){ F.SIS_CONTACTED=true; if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(G,'heroine_05'); }   /* 她 9/3 早上接受交友邀請＝加進聯絡人 */
      if(F.SIS_CONTACTED&&past(d1+2,21)&&G.day<=d1+4&&!PHONE.sent(G,'sis_b_dm')){ const P=t=>({th:'p:heroine_05',from:'player',text:t}), H=t=>({th:'p:heroine_05',from:'heroine_05',text:t});
        PHONE.at(G,d1+2,21,[P('學姊好，謝謝妳的留言。想問一下，民總要先買哪一本嗎？'),H('先不要買。第一堂課老師會說用哪一本。'),H('真的想先看的話，系圖有，二樓。'),P('好，謝謝學姊。'),H('不會。')],'sis_b_dm'); }
      if(F.FAM_GROUP_SENT&&PHONE.inGroup(G,'family_law')&&PHONE.sent(G,'sis_b_comment')&&past(d1+3,21)&&G.day<=d1+5&&!PHONE.sent(G,'sis_b_fam')){ const FT='g:family_law';
        const KV=t=>({th:FT,from:'kevin',name:'Kevin',text:t});   /* AA_372 第 2 項：宿營他當了三天臥底、8/30 群組、9/2 茶會都講過了，不再自我介紹；沒有宿營的局（開發用起點的防呆）只留第二句 */
        PHONE.at(G,d1+3,21,(F.CAMP_Y1?[KV('家族群組開好了。學弟，這次不用臥底了。'),KV('上面那位是你的直屬學姊。')]:[KV('上面那位是你的直屬學姊。')]).concat([{th:FT,from:'heroine_05',name:'溫學姊',text:'學弟好。我們留言區見過了。'},{th:FT,from:'kevin',name:'Kevin',text:'你們認識？'},{th:FT,from:'heroine_05',name:'溫學姊',text:'他自介我有留言。'}]),'sis_b_fam'); } }
    { const r=S.dayOfKey('2026-03-23'); if(r!=null&&G.day>=r&&!F.SIS_RESULT_OUT) F.SIS_RESULT_OUT=true; }
    if(typeof ROM!=='undefined'&&ROM.spreadTick){ ROM.spreadTick(G); ROM.zqAskTick(G); }   /* 誰知道祐廷和可昕在交往：朋友聊天傳開、子晴問阿凱（BB_191 9-7、9-8；src/romance3d.js）*/   /* 她研究所放榜（AA_218 第 1 節；C1 的前置）*/
    /* C2 她家搬家（AA_218 15-7、17-13 第 4 點）：7/11（六）已經交往＝當天 15:00 房間（ev_sis_c2_room）、16:00 私訊；之後才交往＝交往成立隔 3 天以上的第一個週六。一直沒交往不演 */
    if(F.dating_heroine_05&&F.SIS_DATING_D==null) F.SIS_DATING_D=(typeof ROM!=='undefined'&&ROM.get&&ROM.get(G,'heroine_05').sinceDay!=null)?ROM.get(G,'heroine_05').sinceDay:G.day;
    if(F.SIS_C2_ROOM!=null&&!PHONE.sent(G,'sis_c2_msg')){ const ch=F.SIS_C2_H||16; if(G.day>F.SIS_C2_ROOM||(G.day===F.SIS_C2_ROOM&&G.hour>=ch)){ const H=t=>({th:'p:heroine_05',from:'heroine_05',text:t});   /* 房間那場演完以後（ev_sis_c2_room 的 after 記 SIS_C2_H：16:00，晚演的就演完 15 分鐘後）*/
      PHONE.at(G,F.SIS_C2_ROOM,ch,[H('📷（一張照片：筆記本的一頁，手寫的好幾個電話號碼，有的有名字，中間一行沒有。）'),H('剛剛整理東西看到的。'),{th:'p:heroine_05',from:'player',text:'哈哈，真的是我的號碼。妳還留著喔。'},Object.assign(H('我自己都忘了。'),{ask:{id:'sis_c2',opts:[{t:'那本不要丟。',say:[H('不會丟啦。')]},{t:'我現在過去幫妳整理。',say:[H('好啊。來了先幫我搬書。')]},{t:'早知道那天就抬頭看一下。',say:[H('你在吃冰耶。')]}]}})],'sis_c2_msg'); F.SIS_FESTIVAL_NOTEBOOK=true; } }   /* 照片上的號碼畫面不可辨識（只寫「中間一行沒有」名字）*/
    /* 學姊 W1 到社博之間的接觸（AA_218 17-6，使用者 10:2x 批准；AA-C e4a8ba67 選 (a)）：
       ① 9/8（一）21:00 家族群組 Kevin 揪家聚 → 排出遊 9/12（五）19:00 家聚（回不回都可以去）；② 走廊在 events.js（ev_sis_fam_hall*，要 W1）；
       ③ 家聚 ev_sis_fam_dinner；沒去＝當晚 21:00 Kevin 群組照片、9/15（一）21:00 Kevin「憲法有問題可以問書瑀學姊」（17-8）；
       ④ 9/16（二）21:00 私訊（強制；③去了或 9/15 那則之後）。只在 8/30 起加入家族群組的新局（舊的第三週開局 9/8 以前還沒開始）*/
    if((G.stage||'law')==='law'&&F.FAM_GROUP_SENT&&PHONE.inGroup(G,'family_law')){ const d8=S.dayOfKey('2025-09-08'), d12=d8+4, d15=d8+7, d16=d8+8, T='g:family_law', KV=t=>({th:T,from:'kevin',name:'Kevin',text:t}), past=(d,hh)=>G.day>d||(G.day===d&&G.hour>=hh);
      const start=S.LAW_D0!=null&&(F.LAW_START_DAY==null||F.LAW_START_DAY<=d8);
      if(start&&past(d8,21)&&G.day<=d12&&!PHONE.sent(G,'sis_fam_inv')){ PHONE.at(G,d8,21,[KV('各位～這週五晚上家聚，大一到大四都來，地點晚點貼。')],'sis_fam_inv');
        if(typeof OUT!=='undefined'&&!OUT.get(G,'y1_fam_dinner')) OUT.plan(G,{id:'y1_fam_dinner',ev:'ev_sis_fam_dinner',day:d12,h:19,late:0.25,place:'公館巷子裡的簡餐店',title:'家聚 19:00（公館巷子裡的簡餐店）',travel:'走過去約 15 分鐘',travelH:0.25}); }
      const went=!!(G.events&&G.events.done&&G.events.done.ev_sis_fam_dinner);
      if(PHONE.sent(G,'sis_fam_inv')&&!went&&past(d12,21)&&G.day<=d12+2&&!PHONE.sent(G,'sis_fam_photo')) PHONE.at(G,d12,21,[KV('📷（照片：長桌，大家舉杯）今天大一只來一半，下次都要來喔！')],'sis_fam_photo');
      if(PHONE.sent(G,'sis_fam_inv')&&!went&&past(d15,21)&&G.day<=d15+1&&!PHONE.sent(G,'sis_fam_95')) PHONE.at(G,d15,21,[KV('對了大一的，憲法有問題可以問書瑀學姊，她是張老師 95 分的傳奇。')],'sis_fam_95');
      if((went||PHONE.sent(G,'sis_fam_95'))&&past(d16,21)&&G.day<=d16+2&&!PHONE.sent(G,'sis_fam_msg')){ const P=t=>({th:'p:heroine_05',from:'player',text:t}), H=t=>({th:'p:heroine_05',from:'heroine_05',text:t});
        PHONE.at(G,d16,21,[P('學姊，想問一下，妳憲法那時候怎麼準備的？'),H('上課講的先弄懂，考前多寫題目。'),H('解題書我推補習班那本，題目多，解得也清楚。'),P('好，我去買。謝謝學姊。'),H('加油。')],'sis_fam_msg'); F.SIS_FAM_MSG=true; } }
    /* 學姊 W2（BB_95 2-5）：第一次參加讀書會那晚 22:30（她的睡前時間），發在法服讀書會的群組（給所有新來的人，不是私訊）*/
    /* 法服群組（BB_191 §7-0）：社博報名（SIS_CLUB_EXPO／lawclub）那一刻加入，顯示名「法服」（群組 id 照舊 lawclub_study，舊存檔原本叫「法服讀書會」的一起改名）。
       學姊在讀書會群組的「三件事」刪（法服沒有讀書會）；現任社長的歡迎一則照 AA_238 第 1 節（下面兩行）*/
    if((F.SIS_CLUB_EXPO||F.lawclub||F.CLUB_lawclub_study)&&PHONE.rec){ const had=PHONE.inGroup(G,'lawclub_study'), g=PHONE.join(G,'lawclub_study','法服'); if(g&&g.name==='法服讀書會') g.name='法服';
      /* 社博報名當晚 21:00 社長的歡迎（AA_238 第 1 節）：只在這一刻剛加入的（舊存檔早就在群組裡的不補）*/
      if(!had&&F.SIS_CLUB_EXPO&&!PHONE.sent(G,'fafu_welcome')) PHONE.at(G,G.day,Math.max(21,G.hour),[{th:'g:lawclub_study',from:'npc_lawclub_pres',name:'法服的社長',text:'歡迎新社員！法律服務是隔週六早上九點到十二點，萬才館一樓。第一次來站旁邊聽就好，不用準備。有問題直接在群組問。'}],'fafu_welcome'); }
    /* 公法讀書會群組（BB_191 §8-7）：第一次去公法讀書會就加入；沛珊的題目、講義、交接的訊息在這裡 */
    if(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,'public_law_group')) PHONE.join(G,'public_law','公法讀書會');
    /* 子晴 Q2（BB_95 2-6）：第一次去吉他社的晚上被拉進群組 */
    /* 校慶（BB_95 3-7）：子晴——在吉他社群組、INVITED_CLUB——攤位照片 */
    if(F.festivalBoothDay!=null&&PHONE.inGroup(G,'guitar')&&typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_04','INVITED_CLUB')&&!PHONE.sent(G,'fest_guitar')) PHONE.at(G,F.festivalBoothDay,Math.max(12,h(G)),[{th:'g:guitar',from:'heroine_04',text:'📷 吉他撥片賣了三個。三個都是阿凱買的。'}],'fest_guitar');
    /* ★E06／D2（BB_104 第 8-3 節、BB_105 D2；AA_154 第 103 行、A4）：E05 那一晚。E05 結束到 23:00 之間經過大一女舍門口 30 m 內＝D2（她在三樓看到你）；
       沒有就 22:30 E06（她先傳；第一句照 E05 的開口）。只會有一個版本 */
    if(S.isEcon(G)&&F.E05_OPEN&&!F.E06_DONE&&F.E05_DAY!=null&&(G.day===F.E05_DAY||G.day===F.E05_DAY+1)){   /* 22:30 以前睡著：隔天醒來收到 E05 那晚 22:30 的 E06（BB_214 第 2 節）*/ const K=(t,o)=>Object.assign({th:'p:kexin',from:'kexin',text:t},o||{}), P=GM.E&&GM.E.player&&GM.E.player.obj&&GM.E.player.obj.position, hh=h(G);
      if(G.day===F.E05_DAY&&G.zone==='campus'&&P&&hh<23&&hh>=(F.E05_END||0)&&Math.hypot(P.x+93,P.z-56)<30){ F.E06_DONE='d2';
        PHONE.at(G,G.day,G.hour,[K('我剛剛在三樓，看到一個很像你的人經過我們宿舍。'),K('是你嗎？',{ask:{opts:[{t:'是我。',say:[K('我就知道。我還在想要不要從窗戶叫你。')]},{t:'不是。',say:[K('好喔，那是我看錯了。')]},{t:'妳在監視我？',say:[K('我在吹頭髮。窗戶剛好在那邊。')]}]}})],'y0_d2'); }
      else if(hh>=22.5||G.day>F.E05_DAY){ F.E06_DONE='e06'; 
        PHONE.at(G,F.E05_DAY,22.5,[K('今天謝謝你。'),K('我洗了三次手，還是有鏈條油的味道。……你的呢？',{ask:{opts:[{t:'我的也是。',say:[K('那我們扯平。晚安。')]},{t:'下次掉了再叫我。',say:[K('好。那下次我的車鏈掉，你要負責。')]},{t:'飲料很好喝。',say:[K('……你很會。晚安。')]}]}})],'y0_e06'); } }   /* AA_307 第 9 列（E05 他真的修好了；原本的「廉價訊號」拿掉）*/
    /* 經濟系那一年的兩個群組（AA_157）：全班群組 econ_class「經濟系 大一（全班）」在 E02 迎新那天加入（寫法照法律系的全班群組：不發訊息）；
       「走啦」econ_friends 在 P2 第一次去成的那晚由韋綸建立（第一則是系統訊息，照麵店團）。今天先回去的玩家等下一次（P2b，ev_y0_p2b）。
       AA_529 第 2 節：P2、P2b 在 30 分鐘版都剪了＝一般玩家建不起來——10/15 聚會（ev_y0_gather）演完、回家的路上建（S.zoulaGather）；P2、P2b 有演的照原本 */
    if(S.isEcon(G)){ const e02=termDay('Y0S1',1,1), mon3=termDay('Y0S1',3,1), sat3=termDay('Y0S1',3,6);
      if(e02!=null&&!PHONE.inGroup(G,'econ_class')&&(G.day>e02||(G.events&&G.events.done&&G.events.done.ev_y0_e02))) PHONE.join(G,'econ_class','經濟系 大一（全班）');
      if(((F.P2_PICK&&F.P2_PICK!=='home')||(+F.P2B_COUNT||0)>0)&&!PHONE.inGroup(G,'econ_friends')){   /* P2 都選「今天先回去」、P2b 跟去了＝照第一次聚會進「走啦」（AA_272 第 13 節）*/ PHONE.join(G,'econ_friends','走啦'); PHONE.post(G,{th:'g:econ_friends',text:'韋綸建立了群組「走啦」，把你加了進來。',tag:'econ_friends_new'}); }
      /* ★E08 中秋系烤（BB_153；AA_154 第 88 行）：9/16（一）21:00 全班群組揪；9/21（六）16:00～17:00 韋綸私訊，回「好」＝出遊 17:00 河濱（ev_y0_e08）；
         「今天不行」、沒回、出發選單選不去＝沒去：21:30 群組一張照片＋可昕私訊（BB_104 AB-09，不用回、不扣分）*/
      if(mon3!=null&&sat3!=null&&PHONE.inGroup(G,'econ_class')&&G.day<=sat3) PHONE.at(G,mon3,21,[{th:'g:econ_class',text:'中秋系烤：9/21（六）17:00，河濱。自備餐具。'},{th:'g:econ_class',from:'econ_weilun',name:'韋綸',text:'我要去！有人要一起走過去嗎？'}],'y0_e08_grp');   /* BB_179 段A #56 */
      if(sat3!=null&&G.day===sat3&&G.hour>=16&&G.hour<17&&!PHONE.sent(G,'y0_e08_dm')) PHONE.at(G,sat3,Math.max(16,G.hour),[{th:'p:econ_weilun',from:'econ_weilun',name:'韋綸',text:'烤肉你要去嗎？我在舟山路門口，可以一起走過去。',ask:{until:sat3*24+17,opts:[{t:'好',set:{E08_GO:'yes'}},{t:'今天不行',set:{E08_GO:'no'}}]}}],'y0_e08_dm');
      if(F.E08_GO==='yes'&&typeof OUT!=='undefined'&&sat3!=null&&G.day===sat3&&!OUT.get(G,'y0_e08')) OUT.plan(G,{id:'y0_e08',ev:'ev_y0_e08',day:sat3,h:17,place:'河濱',title:'中秋系烤',travel:'和韋綸走過去',travelH:0.25});
      const q8=typeof OUT!=='undefined'?OUT.get(G,'y0_e08'):null;
      if(sat3!=null&&!(q8&&q8.state==='done')&&(G.day>sat3||(G.day===sat3&&G.hour>=18))&&G.day<=sat3+2&&!PHONE.sent(G,'y0_e08_missed'))
        PHONE.at(G,sat3,21.5,[{th:'g:econ_class',text:'📷（河濱的烤肉架、一圈人、一盤烤焦的玉米）'},{th:'p:kexin',from:'kexin',text:'你沒來。火很小，月亮很晚才出來。'}],'y0_e08_missed'); }
    /* E07 沒去（BB_104 8b-2）：博覽會結束後可昕私訊「我加了即興劇社。你呢？」，玩家在手機上選社團（Y0_CLUB），她照 E07 的表回。
       時間：9/21（六）12:30（E06 她的第一則私訊在 9/19 或 9/20，這一則排在那之後；AA-B 確認中）*/
    if(S.isEcon(G)&&!F.Y0_CLUB&&!(G.events&&G.events.done&&G.events.done.ev_y0_e07)){ const sat3=termDay('Y0S1',3,6);
      if(sat3!=null&&G.day>=sat3&&G.day<=sat3+6&&!(G.day===sat3&&G.hour<12.5)&&!PHONE.sent(G,'y0_e07_missed')){ const K=t=>({th:'p:kexin',from:'kexin',text:t});
        PHONE.at(G,G.day===sat3?sat3:G.day,G.day===sat3?12.5:G.hour,[Object.assign(K('博覽會我每一攤都看了，一攤都沒加。你呢？'),{ask:{opts:[{t:'吉他社',set:{Y0_CLUB:'guitar'},say:[K('好。那你以後彈一首給我聽。')]},{t:'登山社',set:{Y0_CLUB:'hiking'},say:[K('你要去爬山？……記得帶伴手禮回來。')]},
          {t:'羽球社',set:{Y0_CLUB:'badminton'},say:[K('羽球社好像都早上練。你要早起了。')]},{t:'不參加',set:{Y0_CLUB:'none'},say:[K('也好。那我們兩個下課都很閒。')]}]}})],'y0_e07_missed'); } }
    /* T0b 照常上課的喜劇（BB_110 第 2 節；AA_154 第 92 行、A2）：颱風假（9/30）前一晚 9/29（日）21:58 經原老師的信、22:00 新聞、22:01 第二封信（通知），
       之後品妤、唐睿、可昕在群組（「走啦」，還沒有就在全班群組）；可昕那一則可以回三種（玩笑，不推進感情）。睡著、跳過時間的玩家照原本的時間補收 */
    if(S.isEcon(G)&&typeof CALENDAR!=='undefined'){ const ty=termDay('Y0S1',5,1); if(ty!=null&&CALENDAR.typhoon(ty)&&G.day>=ty-1&&G.day<=ty&&!PHONE.sent(G,'ty0_k')){ const eve=ty-1;
        PHONE.at(G,eve,21+58/60,[{th:'sys',name:'經原老師（信）',text:'若明日停課，作業照常繳交。'}],'ty0_mail1');
        PHONE.at(G,eve,22,[{th:'sys',name:'新聞',text:'明天停止上班上課。'}],'ty0_news');
        PHONE.at(G,eve,22+1/60,[{th:'sys',name:'經原老師（信）',text:'若明日未停課，作業也照常繳交。'}],'ty0_mail2');
        const gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':(PHONE.inGroup(G,'econ_class')?'econ_class':null);
        if(gid){ const T='g:'+gid, K=t=>({th:T,from:'kexin',text:t});
          PHONE.at(G,eve,22+3/60,[{th:T,from:'econ_pinyu',text:'所以作業還是要交。'}],'ty0_g1');   /* BB_179 段 E 3-2（AA_200 7-2 選項；AA_269 段 E）*/
          PHONE.at(G,eve,22+5/60,[{th:T,from:'econ_tangrui',name:'唐睿',text:'（貼圖：一個人在風雨裡撐傘）'}],'ty0_g2');
          PHONE.at(G,eve,22+8/60,[Object.assign(K('明天放假，你們要幹嘛？'),{ask:{until:ty*24+24,opts:[
            {t:'「睡到中午。」',post:'睡到中午。',say:[K('我也是。')]},{t:'「寫經原作業。」',post:'寫經原作業。',say:[K('你被老師洗腦了。')]},{t:'「出去看颱風。」',post:'出去看颱風。',say:[K('不要啦，很危險。')]}]}})],'ty0_k'); } } }
    /* C1 即興劇社的熱身（BB_110 第 3 節；AA_154 第 113 行）：第 6 週（10/7～10/13，10/10 國慶除外）第一個在 17:30 以前醒著的平日，可昕 17:30 私訊；回「好。」＝出遊 19:00 博雅。
       「今天不行。」、沒回、出發選單選不去＝沒去：當晚 22:00 可昕「今天唐睿演了一隻企鵝。大家笑到練不下去。」（BB_179 段 E M4）*/
    if(S.isEcon(G)&&typeof CALENDAR!=='undefined'){ const T=CALENDAR.termOf(G.day), wd=CALENDAR.dateOf(G.day).wd, K=t=>({th:'p:kexin',from:'kexin',text:t});
      if(false&&T&&T.id==='Y0S1'&&T.week===6&&wd>=1&&wd<=5&&!CALENDAR.holiday(G.day)&&G.hour<17.5&&!PHONE.sent(G,'y0_c1_ask')){   /* AA_293 第 1 節：劇社的戲拿掉（C1 的邀約、企鵝那句都不再發）*/ F.C1_DAY=G.day;
        PHONE.at(G,G.day,17.5,[Object.assign(K('劇社今天練習，可以帶一個人。你當那個人。'),{ask:{until:G.day*24+19,opts:[{t:'好。',set:{C1_GO:'yes'}},{t:'今天不行。',set:{C1_GO:'no'}}]}})],'y0_c1_ask'); }
      if(F.C1_GO==='yes'&&F.C1_DAY!=null&&G.day===F.C1_DAY&&typeof OUT!=='undefined'&&!OUT.get(G,'y0_c1')) OUT.plan(G,{id:'y0_c1',ev:'ev_y0_c1',day:F.C1_DAY,h:19,place:'博雅教學館',title:'即興劇社的熱身',travel:'走過去約 10 分鐘',travelH:0.2});
      const q1=typeof OUT!=='undefined'?OUT.get(G,'y0_c1'):null;
      if(F.C1_DAY!=null&&!(q1&&q1.state==='done')&&(G.day>F.C1_DAY||G.hour>=20)&&G.day<=F.C1_DAY+1&&!PHONE.sent(G,'y0_c1_missed')) PHONE.at(G,F.C1_DAY,22,[K('今天唐睿演了一隻企鵝。大家笑到練不下去。')],'y0_c1_missed'); }
    /* 10/15 的群組聚會（AA_154 2-1b）：17:30 經濟系群組兩則（每個玩家都收到）；出發選單 17:30～19:15「公館 19:00：經濟系的聚會」（OUT late 15 分鐘）；沒去的玩家 21:40 群組多一則（選用的那一則）*/
    if(S.isEcon(G)){ const tue7=termDay('Y0S1',7,2);
      if(tue7!=null&&G.day===tue7&&G.hour>=17.5&&!PHONE.sent(G,'y0_gather_grp')){ const gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class'; if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）'); const T='g:'+gid;
        PHONE.at(G,tue7,17.5,[{th:T,from:'econ_weilun',name:'韋綸',text:'今晚七點，公館！期中考前最後一次放風。'},{th:T,from:'econ_pinyu',text:'我跟同事換了班，可以去。'}],'y0_gather_grp'); F.Y0_GATHER_TH=T;
        if(typeof OUT!=='undefined'&&!OUT.get(G,'y0_gather')&&G.hour<19.25) OUT.plan(G,{id:'y0_gather',ev:'ev_y0_gather',day:tue7,h:19,late:0.25,place:'公館',title:'公館 19:00：經濟系的聚會',travel:'走過去約 15 分鐘',travelH:0.25,back:'在公館的路口散了。'}); }
      const qg=typeof OUT!=='undefined'?OUT.get(G,'y0_gather'):null;
      if(tue7!=null&&F.Y0_GATHER_TH&&F.E10_EVE!=='went'&&!(qg&&qg.state==='done')&&(G.day>tue7||G.hour>=21+40/60)&&G.day<=tue7+1&&!PHONE.sent(G,'y0_gather_miss')) PHONE.at(G,tue7,21+40/60,[{th:F.Y0_GATHER_TH,from:'econ_weilun',name:'韋綸',text:'唐睿聊到期中了。今天他請。'}],'y0_gather_miss'); }
    /* ★E10 的邀約（BB_104 8b-4；AA_154 第 116、117 行）：10/15（二）22:30 可昕私訊「玩了一整晚。明天去總圖念書吧。期中考快到了。」（回到 10/16 19:00）；
       回「好。」＝10/16 18:00 提醒，晚上走進總圖三樓就開始（events.js ev_y0_e10）；不答應、沒回、20:30 還沒到＝在小福遇到她（ev_y0_e10b）*/
    if(S.isEcon(G)){ const tue7=termDay('Y0S1',7,2);
      if(tue7!=null&&G.day>=tue7&&G.day<=tue7+1&&!(G.day===tue7&&G.hour<(F.E10_EVE==='went'?23.75:22.5))&&!PHONE.sent(G,'y0_e10_ask')){   /* AA_293 第 4 節：去了聚會的 23:45（她回到宿舍才傳）*/ F.E10_ASKED=true;
        if(typeof ECONFF!=='undefined'&&ECONFF.short&&ECONFF.short(G)){ F.E10_GO='yes'; F.E10_TOAST=1; PHONE.at(G,tue7,F.E10_EVE==='went'?23.75:22.5,F.E10_EVE==='went'?[{th:'p:kexin',from:'kexin',text:'玩了一整晚。明天去總圖念書吧。期中考快到了。'}]:[{th:'p:kexin',from:'kexin',text:'你今天沒來。我們玩了一整晚。'},{th:'p:kexin',from:'kexin',text:'明天去總圖念書吧。期中考快到了。'}],'y0_e10_ask'); }   /* AA_300 第 7 節：補充，不出選項、記 E10_GO yes、不提示（總圖那場不演，日期卡一句帶過）*/
        else { const askO={until:(tue7+1)*24+19,opts:[{t:'好。',set:{E10_GO:'yes'}},{t:'明天不行。',set:{E10_GO:'no'}}]}, KX=t=>({th:'p:kexin',from:'kexin',text:t});
        PHONE.at(G,tue7,F.E10_EVE==='went'?23.75:22.5,F.E10_EVE==='went'?[Object.assign(KX('玩了一整晚。明天去總圖念書吧。期中考快到了。'),{ask:askO})]:[KX('你今天沒來。我們玩了一整晚。'),Object.assign(KX('明天去總圖念書吧。期中考快到了。'),{ask:askO})],'y0_e10_ask'); } }   /* 沒去聚會的玩家換兩則（BB-B 573f8d2c，AA_154 2-1b 第 3 點）*/
      if(tue7!=null&&F.E10_GO==='yes'&&!F.E10_STUDY&&G.day===tue7+1&&G.hour>=18&&G.hour<20.5&&!F.E10_TOAST){ F.E10_TOAST=1; if(GM.toast) GM.toast('19:00 總圖三樓：和可昕念書',4200); } }
    /* ★E12 長頸鹿的尾巴（AA_154 A32）：①11/6（三）17:30 可昕私訊兩則（BB-B 定稿 a38a22c5）＋出發選單「醉月湖 20:00」（OUT goto：帶到湖的南岸步道，19:55 到）；
       AA_304 第 3 列：她週三體育課 17:20 下課，邀約 17:20、醉月湖 17:45（她 17:30～18:00 在南岸步道）、18:00 還沒到＝18:15 手機版（下面的 20:00／20:30 都照這個往前）；
       ②19:45～20:15 她站在南岸步道（campus），走到她旁邊就演（events.js ev_y0_e12）；③20:15 還沒到＝20:30 手機版：自動打開和她的對話，四句變四則訊息、三個接法一定要選才關得掉（ask.must）；
       ④20:30 在別的事件裡＝事件結束後；睡著＝醒來第一次能操作時（訊息時間照 20:30）*/
    if(S.isEcon(G)){ const wed10=termDay('Y0S1',10,3), K=t=>({th:'p:kexin',from:'kexin',text:t});
      if(wed10!=null&&G.day===wed10&&G.hour>=17+20/60&&!PHONE.sent(G,'y0_e12_ask')){ F.E12_ASKED=true;
        PHONE.at(G,wed10,17+20/60,[K('今天下課以後，去湖邊坐一下？')],'y0_e12_ask');   /* AA_303 第 2 節 12（取代 BB_104 8-4 的兩則）*/
        /* BUG-E12-ARRIVE-LATE（BB-C 11:1x）：休學在家（ECONFF 第二階段）不排出遊——出遊從家出發要 30 分鐘、到湖邊 18:15 已經過了她在的時間；改由 econff3d.js STEPS2 h3 17:45 直接帶到湖邊 */
        if(typeof OUT!=='undefined'&&!OUT.get(G,'y0_e12')&&G.hour<18&&!(typeof ECONFF!=='undefined'&&ECONFF.on2&&ECONFF.on2(G))) OUT.plan(G,{id:'y0_e12',goto:{zone:'campus',x:-34.5,z:-97.2,yaw:Math.PI},early:1/12,day:wed10,h:17.75,late:0.25,place:'醉月湖',title:'醉月湖 17:45',travel:'走過去',travelH:1/6}); }
      if(wed10!=null&&G.day===wed10&&F.E12_ASKED&&!F.E12_ANSWER&&G.zone==='campus'&&G.hour>=17.5&&G.hour<18&&GM.spawnCharacter&&!(GM.npc&&GM.npc.kexin)){ try{ GM.spawnCharacter('kexin',-36,-98.5,{yaw:Math.PI}); }catch(e){ console.warn('E12 kexin',e); } }
      if(wed10!=null&&F.E12_ASKED&&!F.E12_ANSWER&&(G.day>wed10||G.hour>=18.5)&&!PHONE.sent(G,'y0_e12_phone')){ F.E12_PHONE=1;   /* AA_307 第 10 列：18:30 送、四則＋三選一（原本長頸鹿尾巴、椅子那三則）*/
        const opts=[{t:'「對不起，我睡著了。」',post:'對不起，我睡著了。',set:{E12_ANSWER:'sleep'},say:[K('……休學的人好羨慕。')]},
          {t:'「長頸鹿怎麼了？」',post:'長頸鹿怎麼了？',set:{E12_ANSWER:'ask'},say:[K('……牠脖子很短。就這樣。')]},
          {t:'「明天補妳一次。」',post:'明天補妳一次。',set:{E12_ANSWER:'tomorrow'},say:[K('……不用補。睡飽一點。')]}];
        PHONE.at(G,wed10,18.5,[K('你沒來喔。'),K('湖邊有一隻鷺鷥，腳好長，站著不動。'),K('……我想到長頸鹿。'),Object.assign(K('好冷。我先回去了。'),{ask:{must:true,opts}})],'y0_e12_phone'); }
      if(F.E12_PHONE===1&&!F.E12_ANSWER&&GM.openPhone&&!(GM.D&&GM.D.active)&&!(GM.E&&GM.E.player&&GM.E.player.busy)&&(G.msgs||[]).some(m=>m.text==='好冷。我先回去了。')){ F.E12_PHONE=2; GM.openPhone('msg','p:kexin'); } }
    /* E25 我想重考法律（3/19 醉月湖）拿掉：告白併進 10/17 車上（AA_224 1-3，ev_y0_e26）*/
    /* ★LIFE-LINE 第 5 組（AA_224 5-0～5-4 @31708531；機制 BB_188 A9-1）：2/13（四）可昕辦休學 → 19:00 公館的水餃店（E27，固定出遊、只有「出發」；過了時間＝那件結束後直接出發；睡著 coreCallAt）
       → 22:30 經濟系群組 E28（朋友早就知道他們在交往，只宣布重考；AA_305 第 8 節：品妤「可昕跟我說了。」、韋綸不再提腳踏車（不讀 BIKE_LOOKED_UP）；品妤、阿勳自在 +1）→ 23:00 阿勳私訊 E24c（同一個過去、三種說法，記 E24C_REASON；阿勳信任 +2）
       → 2/21（五）21:00 群組 T3＋22:00 唐睿私訊（下面）。舊 E27（3/26 總圖門口）、E28（3/26 宵夜攤）、E24c（3/13 頂樓）作廢。E28、E24c 在這裡標演過（之後的手機小事、閒聊階梯讀它們）*/
    if(S.isEcon(G)&&typeof OUT!=='undefined'){ const d=S.dayOfKey('2025-02-13'), ED=id=>!!(G.events&&G.events.done&&G.events.done[id]);
      if(d!=null&&G.day>=d-1&&G.day<=d&&F.dating_kexin&&!OUT.get(G,'y0_e27')&&!ED('ev_y0_e27')) OUT.plan(G,{id:'y0_e27',ev:'ev_y0_e27',day:d,h:14,must:true,late:0.25,place:'行政大樓',title:'14:00 行政大樓：陪可昕辦休學',travel:'捷運＋公車 約 30 分鐘',travelH:0.5});   /* AA_303 第 17 場：陪她辦完休學，再去水餃店 */
      { const d14=S.dayOfKey('2025-02-14'); if(d14!=null&&F.E27B_PLAN&&ED('ev_y0_e27')&&!ED('ev_y0_e27b')&&!OUT.get(G,'y0_e27b')&&(G.day<d14||(G.day===d14&&G.hour<15.25))) OUT.plan(G,{id:'y0_e27b',ev:'ev_y0_e27b',day:d14,h:15,must:true,late:0.25,place:'以前的補習班',title:'以前的補習班 15:00',travel:'捷運＋公車 約 30 分鐘',travelH:0.5}); }   /* AA_272 8-2：2/14 一起去問補習班 */
      const q27=OUT.get(G,'y0_e27');
      if(q27&&q27.state!=='done'&&d!=null&&(G.day>d||(G.day===d&&G.hour>=q27.h+0.25))&&G.day<=d+1&&!(GM.D&&GM.D.active)&&!(GM.E&&GM.E.player&&GM.E.player.busy)&&!y0CallBusy){ y0CallBusy=true;
        (async()=>{ try{ q27.state='planned'; await OUT.go(GM,q27); } catch(e){ console.warn('E27 dumplings',e); } finally { y0CallBusy=false; } })(); }
      { const qb=OUT.get(G,'y0_e27b'), d14=S.dayOfKey('2025-02-14'); if(qb&&qb.state!=='done'&&d14!=null&&(G.day>d14||(G.day===d14&&G.hour>=qb.h+0.25))&&G.day<=d14+1&&!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))&&!(GM.D&&GM.D.active)&&!(GM.E&&GM.E.player&&GM.E.player.busy)&&!y0CallBusy){ y0CallBusy=true;
        (async()=>{ try{ qb.state='planned'; await OUT.go(GM,qb); } catch(e){ console.warn('E27b cram',e); } finally { y0CallBusy=false; } })(); } }   /* 在外面（3D）過了 15:15：直接出發（在家的是 homeCall 電話）*/
      const gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class', T='g:'+gid, M=(from,name,text)=>({th:T,from,name,text});
      if(d!=null&&F.RETAKE_TOGETHER&&(G.day>d||(G.day===d&&G.hour>=22.5))&&G.day<=d+2&&!PHONE.sent(G,'y0_e28_grp')){ if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）');
        const dd=G.day===d?d:G.day, h=G.day===d?22.5:Math.max(9,G.hour);
        PHONE.at(G,dd,h,[{th:T,from:'player',who:null,text:'我跟可昕要重考。'},M('econ_zhengxun','阿勳','喔。'),M('econ_zhengxun','阿勳','……那保齡球還打嗎。你欠我一場。'),M('econ_tangrui','唐睿','（貼圖：加油）'),
          M('econ_pinyu','品妤','可昕跟我說了。……那下學期分組誰要跟我。'),{th:T,from:'kexin',text:'妳可以跟唐睿。'},M('econ_tangrui','唐睿','（貼圖：沉默）'),M('econ_weilun','韋綸','考完要說。我請你們吃飯。')],'y0_e28_grp');   /* AA_305 第 8 節：品妤是可昕的室友；「腳踏車那次欠的」拿掉 */
        if(typeof SOCIAL!=='undefined'){ SOCIAL.adjust('econ_pinyu',{comf:1}); SOCIAL.adjust('econ_zhengxun',{comf:1}); } if(G.events&&G.events.done&&!G.events.done.ev_y0_e28) G.events.done.ev_y0_e28=dd; }
      if(d!=null&&PHONE.sent(G,'y0_e28_grp')&&(G.day>d||(G.day===d&&G.hour>=23))&&G.day<=d+2&&!PHONE.sent(G,'y0_e24c_why')){ const XU=t=>({th:'p:econ_zhengxun',from:'econ_zhengxun',name:'阿勳',text:t}), dd=G.day===d?d:G.day, h=G.day===d?23:Math.max(9,G.hour);
        PHONE.at(G,dd,h,[XU('欸。群組不好問。'),Object.assign(XU('你為什麼要重考？我是認真問。'),{ask:{id:'y0_e24c_why',until:(dd+1)*24+18,opts:[
          {t:'社會考壞了，差四分。……還是想念法律。',set:{E24C_REASON:'honest'},say:[XU('……差四分喔。那很煩。'),XU('考上要請保齡球。')]},
          {t:'本來就想念法律。第一次沒考上。',set:{E24C_REASON:'short'},say:[XU('好。懂了。')]},
          {t:'說來話長。考完跟你說。',set:{E24C_REASON:'later'},say:[XU('好。考完。我記著。')]}]}})],'y0_e24c_why');
        if(typeof SOCIAL!=='undefined') SOCIAL.adjust('econ_zhengxun',{trust:2}); if(G.events&&G.events.done&&!G.events.done.ev_y0_e24c) G.events.done.ev_y0_e24c=dd; } }
    /* E18b 可昕的生日（BB_104 8b-11；AA_154 第 240 行）：4/23（三）21:00 群組品妤約（時間暫定，照 E14）＋出發選單 4/24（四）19:00 公館豆花店（2D 出遊，晚 15 分鐘＝沒去）；
       沒去＝4/24 21:00 群組品妤貼蛋糕照片＋可昕私訊、E18B_GIFT＝none */
    if(S.isEcon(G)&&typeof OUT!=='undefined'){ const d18=S.dayOfKey('2025-04-24'); if(d18!=null){ const gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class', T='g:'+gid, done18=!!(G.events&&G.events.done&&G.events.done.ev_y0_e18b);
      if((G.day>d18-1||(G.day===d18-1&&G.hour>=21))&&G.day<=d18&&!PHONE.sent(G,'y0_e18b_ask')){ if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）');
        PHONE.at(G,d18-1,21,[{th:T,from:'econ_pinyu',name:'品妤',text:'4/24 可昕生日。公館豆花店，七點。我那天請假了。重考生也要來，一碗豆花的時間而已。'}],'y0_e18b_ask');
        if(!OUT.get(G,'y0_e18b')&&(G.day<d18||G.hour<19.25)) OUT.plan(G,{id:'y0_e18b',ev:'ev_y0_e18b',day:d18,h:19,late:0.25,place:'公館豆花店',title:'公館豆花店 19:00：可昕的生日',travel:'走過去約 15 分鐘',travelH:0.25}); }
      if(!done18&&PHONE.sent(G,'y0_e18b_ask')&&(G.day>d18||(G.day===d18&&G.hour>=21))&&G.day<=d18+2&&!PHONE.sent(G,'y0_e18b_miss')){ if(!F.E18B_GIFT) F.E18B_GIFT='none';
        PHONE.at(G,d18,21,[{th:T,from:'econ_pinyu',name:'品妤',text:'📷（生日蛋糕）'},{th:'p:kexin',from:'kexin',text:'蛋糕有你的份。我先吃了。'}],'y0_e18b_miss'); } } }
    /* E34 經原最後一堂：拿掉（AA_298 第 3 節「一個休學的人根本不會想再踏入台大」）；ev_y0_e34 留給舊存檔，阿勳的兩則私訊不再傳 */
    /* ★E35 考試的前一晚（AA_224 6-5；AA_272 第 10 節 7975ffdf：住在一起）：7/10（四）18:00 只記 E35_ASKED（不傳邀約）；21:00 在家＝home3d 選單那一輪演（ev_y0_e35h）；
       21:00 不在家＝她傳「你在哪。明天要早起，早點回來。」（AA_307 第 11 列），24:00 以前回到家就演；睡著＝21:00 醒來（coreCallAt）。電話版（E35_PHONE）拿掉 */
    if(S.isEcon(G)){ const d35=S.dayOfKey('2025-07-10'), K=t=>({th:'p:kexin',from:'kexin',text:t});
      if(d35!=null&&G.day===d35&&G.hour>=18&&!F.E35_ASKED&&!F.E35_DONE) F.E35_ASKED=true;
      if(d35!=null&&G.day===d35&&G.hour>=21&&F.E35_ASKED&&!F.E35_DONE&&!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))&&!PHONE.sent(G,'y0_e35_where')) PHONE.at(G,d35,21,[K('你在哪。明天要早起，早點回來。')],'y0_e35_where'); }
    /* 衝刺班（AA_298 第 1 節，取代 AA_224 6-4 的一三五晚上）：另一間補習班，6/8 RH-C0 當面報名（私訊 y0_crm_ask 拿掉），6/9～7/9 每天 09:00～21:00；
       只停 retake_home.js 的長場景（RH-C0～C5），中間跳過出 cram_cards（econff3d.js、home3d.js 的 y0Jump）。舊存檔已經排好的一三五出遊（y0_crm_*）：標成 done、不出發 */
    if(S.isEcon(G)&&Array.isArray(G.outings)&&!F.Y0_CRM_RETIRED){ F.Y0_CRM_RETIRED=true; for(const q of G.outings) if(/^y0_crm_/.test(q.id)&&q.state==='planned') q.state='done'; }
    /* E35 考完以後的約定（AA_154 A47；私訊 BB-B BB_104 8b-18「考完以後」）：E35_PLAN 有值＝7/14（一）20:00 可昕私訊兩則（不用回）；7/19（六）摘要日在 events.js（ev_y0_e35s）*/
    if(S.isEcon(G)&&F.E35_PLAN){ const d=S.dayOfKey('2025-07-14'), K=t=>({th:'p:kexin',from:'kexin',text:t}), M={sea:['你說考完要去海邊。我查好了。','星期六，客運早上八點。西瓜我負責。'],
        sleep:['你說考完要睡一整天。我查好了。','星期六整天下雨。很適合。……我說過，我也要睡。'],shop:['巷子那家我問過了。','星期六中午有開。我訂位了，兩個人。']}[F.E35_PLAN];   /* AA_368 H4：shop 第一則原本「巷子那家我查好了。」（店在她家巷子裡，events.js E35 選項 c）*/
      if(M&&d!=null&&(G.day>d||(G.day===d&&G.hour>=20))&&G.day<=d+2&&!PHONE.sent(G,'y0_e35_after')) PHONE.at(G,d,20,M.map(K),'y0_e35_after'); }
    /* ★成績公布（AA_272 第 4 節 4-1，c8baae2b）：7/24（四）21:00 可昕從高雄傳（有選項，記 KH_GO：bus＝7/25 搭客運去高雄（AA_368 M7：凌晨 02:30 的夜班客運，events.js ev_y0_kh_bus*）；home＝在家查（ev_y0_kh_home*））。
       7/25 02:30（夜班客運出發；AA_368 M7，原本 07:00）還沒回＝在家版（KH_GO 不記）。快轉停在 21:15（home3d.js Y0_FIXED）*/
    if(S.isEcon(G)&&F.dating_kexin){ const d=S.dayOfKey('2025-07-24'), K=t=>({th:'p:kexin',from:'kexin',text:t});
      if(d!=null&&(G.day>d||(G.day===d&&G.hour>=21))&&G.day<=d+1&&!PHONE.sent(G,'y0_kh_ask')) PHONE.at(G,d,21,[K('明天公布成績。'),Object.assign(K('你要不要來高雄？我不想一個人查。'),{ask:{id:'y0_kh_ask',until:(d+1)*24+2.5,opts:[
        {t:'好。我搭半夜的客運下去。',set:{KH_GO:'bus'}},{t:'我在家查就好。',set:{KH_GO:'home'},say:[K('好。')]}]}})],'y0_kh_ask'); }   /* AA_371 第 4 題（企劃線 7eb45d69）：夜班客運以後選項改字（原本「好。我搭早上的客運。」）；回覆期限 7/25 02:30 AA 確認 */
    /* 在家版的晚上（AA_272 第 12 節 c0ee2822）：21:00 電話（events.js ev_y0_kh_call*）以後，22:30 她的私訊（沒有選項），記 KH_MADEUP。
       AA_304 第 15 列：改成她打回來的電話（events.js ev_y0_kh_madeup*），這段私訊不再發 */
    /* ★E36 放榜（分發結果）8/13（三）：手機＋電話（AA_272 4-4，c8baae2b）。10:00 兩句系統旁白（events.js ev_y0_e36r）以後，10:05 可昕私訊「政大法律。跟表上一樣。」「你的也是吧。」→「嗯。」；
       20:00 電話（events.js ev_y0_e36／ev_y0_e36h；睡著＝20:00 叫醒 coreCallAt）；22:00 經濟系群組四則（E36n 宵夜改群組）。椰林大道的出發選單、可昕站位、帶到場、23:30 宵夜照片拿掉 */
    if(S.isEcon(G)){ const d36=S.dayOfKey('2025-08-13'), K=t=>({th:'p:kexin',from:'kexin',text:t}), Y=t=>({th:'p:kexin',from:'player',who:null,text:t}), done36=!!(G.events&&G.events.done&&(G.events.done.ev_y0_e36||G.events.done.ev_y0_e36h));
      if(d36!=null&&G.day===d36&&G.hour>=10&&F.E36_RESULT&&!PHONE.sent(G,'y0_e36_ask')&&!done36){ F.E36_ASKED=true; PHONE.at(G,d36,Math.max(10+5/60,G.hour),[K('政大法律。跟表上一樣。'),K('你的也是吧。'),Y('嗯。')],'y0_e36_ask'); }
      if(d36!=null&&F.E36_RESULT&&(G.day>d36||G.hour>=22)&&G.day<=d36+2&&!PHONE.sent(G,'y0_e36_grp')){ const gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class', T='g:'+gid; if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）');
        PHONE.at(G,d36,22,[{th:T,from:'econ_zhengxun',name:'阿勳',text:(G.name||'祐廷')+'！！看到了！！'},{th:T,from:'econ_pinyu',name:'品妤',text:'恭喜。'},{th:T,from:'econ_weilun',name:'韋綸',text:'走啦！！回來請吃宵夜！！'},{th:T,from:'econ_pinyu',name:'品妤',text:'可昕也恭喜。'}],'y0_e36_grp'); } }   /* AA_368 M2：品妤原本「0.1 也是分數。恭喜。」（只高 0.1 只有 20:00 電話裡跟可昕講過）；L5：「{name}！！看到了！！」——手機訊息不換 {name}（phone3d.js 照原字顯示），送出時就換成玩家的名字（同 story3d.js 小隊名單、@名字的做法）*/
    /* ★E37 第一次一起去政大（BB_104 8b-20；AA_154 A40）：8/28（四）21:00 可昕私訊兩則＋出發選單 8/30（六）「政大校門 14:00」（從臺北的家捷運＋公車約 40 分鐘）；
       14:15 還沒出發＝可昕打電話 → 直接進出遊（在家＝home3d 選單那一輪，STORY.homeCall；在外面＝這裡；睡著＝CORE_OUT 叫醒）*/
    /* 法律系迎新宿營（CAMP-L1；AA_205 2-3、BB_177 第 14 節）：經濟系路線的玩家也參加（強制，沒有「不去」）——8/15 20:00 進系學會群組（公告）、8/21 21:00 小隊名單（S.campGroups）；
       8/22 08:30 校門集合，從臺北的家出發（OUT y1_camp：camp＝整段交給 S.campY1、must＝出發選單只有「出發」）；08:00 還在家＝叫醒、直接出發（coreCallAt、homeCall）。三天演完回到 8/24 下午的家 */
    if(S.isEcon(G)&&typeof OUT!=='undefined'&&!F.CAMP_Y1){ const d0=S.dayOfKey(S.CAMP_DAY); if(d0!=null&&(G.day>d0-7||(G.day===d0-7&&G.hour>=20))&&G.day<=d0){ S.campGroups(G,d0);
      if(!OUT.get(G,'y1_camp')) OUT.plan(G,{id:'y1_camp',camp:true,must:true,ev:null,day:d0,h:8.5,late:0.5,place:'校門',title:'校門 08:30：迎新宿營（三天兩夜）',travel:'捷運＋公車 約 30 分鐘',travelH:0.5}); } }
    if((S.isEcon(G)||(G.flags.PLAYED_Y0&&G.day<=S.dayOfKey('2025-08-31')))&&typeof OUT!=='undefined'){ const d37=S.dayOfKey('2025-08-30'), K=t=>({th:'p:kexin',from:'kexin',text:t});   /* 選 1：8/29 就轉進法律系，E37（8/30 政大校門）在法律系階段也照常（AA-B 21:09）*/
      if(d37!=null&&(G.day>d37-2||(G.day===d37-2&&G.hour>=21))&&G.day<=d37&&!PHONE.sent(G,'y0_e37_ask')&&!(G.events&&G.events.done&&G.events.done.ev_y0_e37)){ PHONE.at(G,d37-2,21,[K('我明天坐高鐵上去。後天你載我搬宿舍。')],'y0_e37_ask');   /* AA_303 第 2 節「法律系 8/30」*/
        if(!OUT.get(G,'y0_e37')) OUT.plan(G,{id:'y0_e37',ev:'ev_y0_e37',day:d37,h:14,late:0.25,place:'臺北的家樓下',title:'臺北的家樓下 14:00',travel:'開車',travelH:2/3,alarm:true}); }
      else if(d37!=null&&PHONE.sent(G,'y0_e37_ask')&&G.day<=d37&&!OUT.get(G,'y0_e37')&&!(G.events&&G.events.done&&G.events.done.ev_y0_e37)) OUT.plan(G,{id:'y0_e37',ev:'ev_y0_e37',day:d37,h:14,late:0.25,place:'臺北的家樓下',title:'臺北的家樓下 14:00',travel:'開車',travelH:2/3,alarm:true});   /* 私訊已經發了、約卻不見了（舊存檔在 8/29 轉法律系時被清掉）：補排 */
    }
    /* X81（AA_303「法律系開局的 8/30」，AA-C bcb678e0；使用者 10-20「幫可昕搬進宿舍的功能也沒有」＝那一局從法律系開始）：沒有 PLAYED_Y0、和可昕交往——
       8/29（五）21:30 可昕私訊（她坐高鐵到臺北、住你家一晚；那晚在演別的就演完再傳）；回不回都排 8/30「臺北的家（載可昕上山）14:00」從宿舍出發（捷運約 30 分鐘），到家直接演 ev_y0_e37；
       14:15 還沒到＝S.E37_CALL；演完旁白「（你把車開回家，再搭捷運回宿舍。）」、回到宿舍 19:00 左右（ev_y0_e37 的 afterOuting）*/
    if(S.e37LawOn(G)&&typeof OUT!=='undefined'&&typeof PHONE!=='undefined'){ const d29=S.dayOfKey('2025-08-29'), K=t=>({th:'p:kexin',from:'kexin',text:t});
      if(d29!=null&&(G.day>d29||(G.day===d29&&G.hour>=21.5))&&G.day<=d29+1&&!(G.events&&G.events.done&&G.events.done.ev_y0_e37)&&!e37LawBusy){
        const send=()=>{ if(!PHONE.sent(G,'y0_e37_law_ask')) PHONE.at(G,d29,21.5,[K('我到你家了。阿姨留我住一晚，還煮了麵。'),Object.assign(K('明天下午兩點，你回家開車，載我上山。行李兩箱。'),{ask:{opts:[{t:'好。兩點。',say:[K('嗯。不要遲到。')]}]}})],'y0_e37_law_ask');
          if(!OUT.get(G,'y0_e37')){ OUT.plan(G,{id:'y0_e37',ev:'ev_y0_e37',day:d29+1,h:14,late:0.25,place:'臺北的家',title:'臺北的家（載可昕上山）14:00',travel:'捷運 約 30 分鐘',travelH:0.5,alarm:true}); F.E37_LAW=true; } };   /* E37_LAW：演完那一句旁白、多 1 小時（events.js ev_y0_e37）*/
        /* AA-C 17:53 選 ①：收到這兩則就算「第一則訊息」（KX_FIRST_MSG，不再演 sleepNow 的 kexinFirstMsg）；旁白「休學到重考的那幾個月，你不是一個人過的。」搬到兩則前面（法律系開局的人第一次知道可昕是誰）*/
        if(!PHONE.sent(G,'y0_e37_law_ask')&&!F.KX_FIRST_MSG&&GM.say){ e37LawBusy=true; F.KX_FIRST_MSG=true; (async()=>{ try{ GM.sceneBegin(); try{ await GM.say(null,'休學到重考的那幾個月，你不是一個人過的。'); } finally { GM.sceneEnd(); } send(); if(GM.phoneBadge) GM.phoneBadge(); } catch(e){ console.warn('E37 law ask',e); send(); } finally { e37LawBusy=false; } })(); }
        else { F.KX_FIRST_MSG=true; send(); } } }
    if(typeof OUT!=='undefined'&&(S.isEcon(G)||G.flags.PLAYED_Y0||S.e37LawOn(G))&&G.day<=S.dayOfKey('2025-08-31')){ const q37=OUT.get(G,'y0_e37'), home=typeof HOME!=='undefined'&&HOME.at&&HOME.at(G);
      if(!home&&S.e37CallDue(G)&&!(GM.D&&GM.D.active)&&!(GM.E&&GM.E.player&&GM.E.player.busy)&&!y0CallBusy){ y0CallBusy=true;
        (async()=>{ try{ GM.sceneBegin(); try{ await GM.say({name:'可昕（電話）'},S.E37_CALL); } finally { GM.sceneEnd(); } q37.state='planned'; await OUT.go(GM,q37); } catch(e){ console.warn('E37 call',e); } finally { y0CallBusy=false; } })(); } }
    /* R 系列沒遇到的照片、私訊（BB_112 第 4 節「沒去時」；時間 LAWWW 定：當天 21:00）＋R4 可昕在總圖外台階、R7 前一晚的群組（S.kxFreeAt 那一段）*/
    if(S.isEcon(G)&&S.dayOfKey('2025-03-28')!=null){ const K=t=>({th:'p:kexin',from:'kexin',text:t}), ED=id=>!!(G.events&&G.events.done&&G.events.done[id]), past=(k,h)=>{ const d=S.dayOfKey(k); return G.day>d||(G.day===d&&G.hour>=h); }, before=(k,n)=>G.day<=S.dayOfKey(k)+(n||2);
      if(!ED('ev_y0_r5')&&past('2025-04-02',21)&&before('2025-04-02')&&!PHONE.sent(G,'y0_r5_miss')) PHONE.at(G,S.dayOfKey('2025-04-02'),21,[K('📷（牆上的倒數：100）'),K('倒數一百天。')],'y0_r5_miss');
      if(!ED('ev_y0_r3')&&past('2025-04-01',21)&&before('2025-04-01')&&!PHONE.sent(G,'y0_r3_miss')) PHONE.at(G,S.dayOfKey('2025-04-01'),21,[K('📷（杜鵑花）'),K('大安森林公園的杜鵑。今天自己去走了一圈。')],'y0_r3_miss');
      if(!ED('ev_y0_r2')&&past('2025-04-13',21)&&before('2025-04-13')&&!PHONE.sent(G,'y0_r2_miss')) PHONE.at(G,S.dayOfKey('2025-04-13'),21,[K('📷（四碗豆花）'),K('以後互相出題，錯一題請一碗豆花。帳先記著。')],'y0_r2_miss');
      { const d6=S.dayOfKey('2025-05-10'); if(!ED('ev_y0_r6')&&!F.R6_MISSED&&past('2025-05-10',21)&&before('2025-05-10')){ F.R6_MISSED=true; PHONE.at(G,d6,21,[K('📷（河濱的夕陽）'),K('讀不下去，自己騎來河濱了。')],'y0_r6_miss'); } }   /* 第 12 週到 5/10 都沒和她去成玩樂日＝她自己去 */
      /* R4 模擬考：拿掉（AA_298 第 2 節「根本沒有模擬考」）；ev_y0_r4 留給舊存檔 */
      { const d7=S.dayOfKey('2025-05-24'), gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class', T='g:'+gid, XU=t=>({th:T,from:'econ_zhengxun',name:'阿勳',text:t});
        if((G.day>d7-1||(G.day===d7-1&&G.hour>=21))&&G.day<=d7&&!PHONE.sent(G,'y0_r7_ask')){ if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）');
          PHONE.at(G,d7-1,21,[XU('那張便利貼，你還留著嗎？'),{th:T,from:'player',who:null,text:'📷（臺北的家，檯燈上的便利貼）'},XU('還在喔。'),XU('明天兩點，保齡球館。欠我的那場。')],'y0_r7_ask');
          if(typeof OUT!=='undefined'&&!OUT.get(G,'y0_r7')&&(G.day<d7||G.hour<14.75)) OUT.plan(G,{id:'y0_r7',ev:'ev_y0_r7',day:d7,h:14,late:0.75,place:'保齡球館',title:'保齡球館 14:00',travel:'捷運＋公車 約 30 分鐘',travelH:0.5}); }
        if(!ED('ev_y0_r7')&&PHONE.sent(G,'y0_r7_ask')&&past('2025-05-24',17)&&before('2025-05-24')&&!PHONE.sent(G,'y0_r7_miss')) PHONE.at(G,d7,17,[XU('📷（阿勳舉著球）'),XU('全倒。這次有證人。')],'y0_r7_miss'); } }
    /* E30 辦休學（AA_169；日期 AA_218 第 11 節、AA_154 0b-1：2024-10-17（四））：那天起休學（Y0_LEFT：經濟系的課都不排，那天的課不扣出席也不記缺席）；14:40 自動（事件 ev_y0_e30）。
       「先走。」＝15:12 群組阿勳「我在裡面舉筆了。你有看到嗎？」＋回覆「有。」→「好。那就算數。」。當晚 22:00 以後第一次回房間＝檯燈上的便利貼（ev_y0_e30_note）*/
    if(S.isEcon(G)){ const d30=S.dayOfKey(S.Y0_LEAVE_DAY); if(d30!=null&&G.day>=d30&&!F.Y0_LEFT) F.Y0_LEFT=true;
      if(F.E30_WAITED===false&&!PHONE.sent(G,'y0_e30_grp')){ const gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class', XU=t=>({th:'g:'+gid,from:'econ_zhengxun',name:'阿勳',text:t}); const h=Math.max(15.2,G.day===d30?G.hour:15.2);
        PHONE.at(G,G.day,h,[Object.assign(XU('我在裡面舉筆了。你有看到嗎？'),{ask:{id:'y0_e30',opts:[{t:'有。',say:[XU('好。那就算數。')]}]}})],'y0_e30_grp'); } }
    /* ★LIFE-LINE 第 1 組（AA_224 1-2～1-4 @e6c064a3；機制 BB_188 A9）：休學那天（10/17）E30 演完以後，15:30 祐廷私訊可昕說他休學了（她背對窗戶沒看到；不在群組、沒有選項）
       → 17:40 社科院門口車上＋20:30 摩天輪（ev_y0_e26，同一趟固定出遊：出發選單只有「出發」）→ 回到宿舍快十一點、接檯燈上的便利貼。
       過了時間還沒出發（例：在別的事件裡）＝那件結束後直接出發（沒有電話台詞）；睡著＝coreCallAt 叫醒（CORE_OUT）。舊的 3/20 邀約、3/22 捷運站、17:45 電話拿掉 */
    if(S.isEcon(G)&&typeof OUT!=='undefined'){ const d30=S.dayOfKey(S.Y0_LEAVE_DAY), K=t=>({th:'p:kexin',from:'kexin',text:t}), Y=t=>({th:'p:kexin',from:'player',who:null,text:t});
      if(d30!=null&&G.day===d30&&G.events&&G.events.done&&G.events.done.ev_y0_e30){   /* 15:30 告訴可昕：ev_y0_e30 最後演出來的電話（AA_296；原本的 y0_kx_leave 十則私訊拿掉，舊存檔已經收到的照留）*/
        if(!OUT.get(G,'y0_e26')) OUT.plan(G,{id:'y0_e26',ev:'ev_y0_e26',day:d30,h:17+40/60,must:true,late:0.25,place:'社科院門口',title:'社科院門口 17:40',travel:'回家拿車鑰匙，再開回學校',travelH:1.5,back:'回到宿舍。'}); }
      const q26=OUT.get(G,'y0_e26');
      if(q26&&q26.state!=='done'&&G.events&&G.events.done&&G.events.done.ev_y0_e26) q26.state='done';
      /* AA_304 第 1 列：台詞都是傍晚的事（「你晚上有事嗎？」「去坐摩天輪」）。過了 19:00 還沒出發＝不演，照 KX_CAR 預設帶過（同 lifeLineMigrate）*/
      if(q26&&q26.state!=='done'&&q26.day===d30&&(G.day>d30||G.hour>=19)&&!(GM.D&&GM.D.active)&&!y0CallBusy){ const F=G.flags; if(!F.KX_CAR) F.KX_CAR='only_me'; G.events.done.ev_y0_e26=G.events.done.ev_y0_e26||G.day;
        Object.assign(F,{Y0_DATING:true,KX_DATING_SINCE:'2024-10-17'}); if(!F.EX_kexin) F.dating_kexin=true; q26.state='done'; }
      if(q26&&q26.state!=='done'&&q26.day===d30&&(G.day>d30||(G.day===d30&&G.hour>=q26.h+0.25))&&G.day<=d30+1&&!(GM.D&&GM.D.active)&&!(GM.E&&GM.E.player&&GM.E.player.busy)&&!y0CallBusy){ y0CallBusy=true;
        (async()=>{ try{ q26.state='planned'; await OUT.go(GM,q26); } catch(e){ console.warn('E26 car',e); } finally { y0CallBusy=false; } })(); } }
    /* ★E14 保齡球館（AA_154 A33）：11/14（四）21:00 經濟系群組，品妤（BB-B 審定）＋出發選單 11/15（五）19:00；19:15 還沒出發＝韋綸打電話（BB-B 審定）→ 直接進出遊（2D，不用走路）；
       在別的事件裡＝結束後馬上 */
    /* 2026-10-18 搬到 9/12（四）21:00 全班群組→ 9/13（五）19:00 第一次班聚（AA_293 4-1，使用者：「保齡球館制服事件是在開學沒多久，在一起之前，還不熟的時候」）*/
    if(S.isEcon(G)&&typeof OUT!=='undefined'){ const thu11=S.dayOfKey('2024-09-12'), fri11=thu11!=null?thu11+1:null;
      if(thu11!=null&&(G.day>thu11||(G.day===thu11&&G.hour>=21))&&G.day<=fri11&&!PHONE.sent(G,'y0_e14_ask')){ const gid='econ_class'; if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）');
        PHONE.at(G,thu11,21,[{th:'g:'+gid,from:'econ_pinyu',text:'明天晚上七點，保齡球。第一次班聚。高中制服記得帶，要抽籤交換。'}],'y0_e14_ask');
        if(!OUT.get(G,'y0_e14')) OUT.plan(G,{id:'y0_e14',ev:'ev_y0_e14',day:fri11,h:19,late:0.25,place:'保齡球館',title:'保齡球館 19:00',travel:'搭公車約 20 分鐘',travelH:1/3}); }
      const q14=OUT.get(G,'y0_e14');
      if(q14&&q14.state!=='done'&&fri11!=null&&(G.day>fri11||(G.day===fri11&&G.hour>=19.25))&&G.day<=fri11+1&&!(GM.D&&GM.D.active)&&!(GM.E&&GM.E.player&&GM.E.player.busy)&&!y0CallBusy){ y0CallBusy=true;
        (async()=>{ try{ GM.sceneBegin(); try{ await GM.say({name:'韋綸（電話）'},'你在哪？球道開好了，就差你！'); } finally { GM.sceneEnd(); } q14.state='planned'; await OUT.go(GM,q14); } catch(e){ console.warn('E14 call',e); } finally { y0CallBusy=false; } })(); } }
    /* E17 經濟系的拍賣攤（備料 E17a、校慶攤位、沒去的群組照片）：刪除（AA_218 第 11 節、AA_154 0b-2，2026-10-17：祐廷 10/17 休學）。事件定義留著（retired） */
    /* E15 經濟系宿營（BB_104 8b-7）：11/22（五）出發選單「社科院門口 12:00：經濟系宿營（三天兩夜）」（15 分鐘沒出發＝沒去）；去了＝11/24 09:00 群組大合照；
       沒去＝11/24 18:00 群組大合照（第二排空一個位子，韋綸在旁邊比手勢）＋阿勳私訊「合照有你的位子。我叫他們留的。」（AA_305 第 9 節）*/
    if(S.isEcon(G)&&typeof OUT!=='undefined'&&!F.ECON_CAMP_OPEN){ const fri12=termDay('Y0S1',12,5), gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class';   /* 第 7 組 7-3：宿營已經在 8 月的局不排 11 月這場（定義留給舊存檔）*/
      /* 邀約（BB_104 8b-7，BB-B e0e7a359；AA_154 A37）：11/20（三）21:00 全班群組家豪學長兩則；11/21（四）22:00「走啦」韋綸、品妤（有這個群組的玩家）*/
      if(fri12!=null&&(G.day>fri12-2||(G.day===fri12-2&&G.hour>=21))&&G.day<=fri12&&!PHONE.sent(G,'y0_e15_ask')){ if(!PHONE.inGroup(G,'econ_class')) PHONE.join(G,'econ_class','經濟系 大一（全班）');
        PHONE.at(G,fri12-2,21,[{th:'g:econ_class',from:'econ_jiahao',name:'家豪學長',text:'宿營這週五！中午十二點社科院門口集合，三天兩夜，遊覽車不等人。'},{th:'g:econ_class',from:'econ_jiahao',name:'家豪學長',text:'第三小隊：'+(G.name||'祐廷')+'、可昕、阿勳、韋綸，小隊輔是我。帶拖鞋，外套帶厚一點，山上晚上很冷。'}],'y0_e15_ask'); }
      if(fri12!=null&&PHONE.inGroup(G,'econ_friends')&&(G.day>fri12-1||(G.day===fri12-1&&G.hour>=22))&&G.day<=fri12&&!PHONE.sent(G,'y0_e15_grp')) PHONE.at(G,fri12-1,22,[{th:'g:econ_friends',from:'econ_weilun',name:'韋綸',text:'第三小隊！明天誰遲到，大地遊戲就當鬼！'},{th:'g:econ_friends',from:'econ_pinyu',text:'你上次遲到七分鐘。'}],'y0_e15_grp');
      if(fri12!=null&&G.day===fri12&&G.hour<12.25&&!OUT.get(G,'y0_e15')) OUT.plan(G,{id:'y0_e15',ev:'ev_y0_e15',day:fri12,h:12,late:0.25,place:'社科院門口',title:'社科院門口 12:00：經濟系宿營（三天兩夜）',travel:'坐遊覽車到山邊的青年活動中心',travelH:1/6,back:'回到學校。'});
      if(fri12!=null&&F.E15_WENT&&!PHONE.sent(G,'y0_e15_photo')){ if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）'); PHONE.at(G,fri12+2,9,[{th:'g:'+gid,from:'econ_weilun',name:'韋綸',text:'📷（活動中心門口，七個人的合照）'}],'y0_e15_photo');   /* AA_154 A54 */ }
      const q15=OUT.get(G,'y0_e15');
      if(fri12!=null&&!F.E15_WENT&&(G.day>fri12+2||(G.day===fri12+2&&G.hour>=18))&&G.day<=fri12+4&&!PHONE.sent(G,'y0_e15_missed')&&!(q15&&q15.state==='done')){ if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）');
        PHONE.at(G,fri12+2,18,[{th:'g:'+gid,from:'econ_weilun',name:'韋綸',text:'📷（大合照。第二排有一個空位，韋綸在旁邊比了一個手勢。）'},{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'合照有你的位子。我叫他們留的。'}],'y0_e15_missed'); } }   /* AA_305 第 9 節：阿勳不講冷笑話 */
    /* E18 即興劇小公演（BB_104 8b-10；AA_154 A36）：11/28（四）21:00 可昕私訊兩則（有 Y0_EXTRA＝唐睿私訊一則）＋出發選單 11/29 19:00（有 Y0_EXTRA＝18:30）；15 分鐘沒出發＝沒去；
       沒去＝11/30 12:00 唐睿傳一段影片「可昕昨天公演，接了一句很像你會說的話。」（BB_179 段 C #3）*/
    if(false&&S.isEcon(G)&&typeof OUT!=='undefined'){ const thu13=termDay('Y0S1',13,4), fri13=thu13!=null?thu13+1:null, X=!!F.Y0_EXTRA;   /* AA_293 第 1 節：小公演拿掉（邀約、出遊、沒去的影片都不再發）*/
      if(thu13!=null&&(G.day>thu13||(G.day===thu13&&G.hour>=21))&&G.day<=fri13&&!PHONE.sent(G,'y0_e18_ask')){
        PHONE.at(G,thu13,21,X?[{th:'p:econ_tangrui',from:'econ_tangrui',name:'唐睿',text:'臨時演員六點半到。你的角色是一棵樹，台詞零句，責任重大。'}]:[{th:'p:kexin',from:'kexin',text:'明天晚上七點，博雅。我們有小公演。'},{th:'p:kexin',from:'kexin',text:'你來的話，我幫你留前面的位子。'}],'y0_e18_ask');
        if(!OUT.get(G,'y0_e18')) OUT.plan(G,{id:'y0_e18',ev:'ev_y0_e18',day:fri13,h:X?18.5:19,late:0.25,place:'博雅教學館',title:X?'博雅 18:30：即興劇小公演（臨時演員）':'博雅 19:00：即興劇小公演',travel:'走過去約 10 分鐘',travelH:1/6}); }
      const q18=OUT.get(G,'y0_e18');
      if(fri13!=null&&q18&&q18.state!=='done'&&G.day>=fri13+1&&!(G.day===fri13+1&&G.hour<12)&&G.day<=fri13+3&&!PHONE.sent(G,'y0_e18_missed')) PHONE.at(G,fri13+1,12,[{th:'p:econ_tangrui',from:'econ_tangrui',name:'唐睿',text:'🎬（一段影片）'},{th:'p:econ_tangrui',from:'econ_tangrui',name:'唐睿',text:'可昕昨天公演，接了一句很像你會說的話。'}],'y0_e18_missed'); }
    /* E16 分組報告（E16a、E16b、報告前一晚的私訊、翹課的群組訊息）：刪除（AA_218 第 11 節、AA_154 0b-2）；E16_ROLE 不再寫入 */
    /* E18a 豆花（AA_224 3-4）：12/3（二）21:30 可昕私訊兩則＋出發選單「總圖門口 22:00」（他不能進總圖，在門口演；可以錯過，沒去不記）。
       E22b 法律入門書（AA_224 3-7）：12/20（五）17:00「公館 17:00：等可昕下課」（12/13 補習班以後；可以錯過，沒去不記 E22B_TOLD）*/
    if(S.isEcon(G)&&typeof OUT!=='undefined'){ const d3=S.dayOfKey('2024-12-03'), d20=S.dayOfKey('2024-12-20'), K=t=>({th:'p:kexin',from:'kexin',text:t});
      if(d3!=null&&G.day===d3&&G.hour>=21.5&&F.dating_kexin&&!PHONE.sent(G,'y0_e18a_ask')&&!(G.events&&G.events.done&&G.events.done.ev_y0_e18a)){ PHONE.at(G,d3,Math.max(21.5,Math.min(G.hour,22)),[K('我在總圖讀到十點。'),K('豆花店還開著。……我只是餓了。')],'y0_e18a_ask');
        if(!OUT.get(G,'y0_e18a')&&G.hour<22.25) OUT.plan(G,{id:'y0_e18a',ev:'ev_y0_e18a',day:d3,h:22,late:0.25,place:'總圖門口',title:'總圖門口 22:00',travel:'捷運＋公車 約 30 分鐘',travelH:0.5}); }
      if(d20!=null&&G.day===d20&&G.hour<17.25&&F.dating_kexin&&F.CRAM_FREE_KNOWN&&!OUT.get(G,'y0_e22b')&&!(G.events&&G.events.done&&G.events.done.ev_y0_e22b))
        OUT.plan(G,{id:'y0_e22b',ev:'ev_y0_e22b',day:d20,h:17,late:0.25,place:'公館的咖啡店',title:'公館 17:00：等可昕下課',travel:'捷運＋公車 約 30 分鐘',travelH:0.5}); }
    /* LIFE-LINE 第 4 組（AA_224 4-2、4-3 @31708531＝BB_188 A2-3、A2-4）：
       ① 12/13 補習班當晚 21:00（演完以後）祐廷傳給可昕；前一晚的小吵架就這樣過去，不另寫和好。
       ② 可昕記錯大一國文作業：1/3（五）21:00 截圖＋三個選項；1/6（一）21:00 葉老師回信；1/11（六）22:00「我在想要不要休學。」＋三個選項，記 KX_THINK_LEAVE（除夕電話第三個選項讀它）。
       葉老師不醜化；「被當」只寫「可能」*/
    if(S.isEcon(G)&&F.dating_kexin){ const K=t=>({th:'p:kexin',from:'kexin',text:t}), Y=t=>({th:'p:kexin',from:'player',who:null,text:t}), D=k=>S.dayOfKey(k), past=(d,h)=>d!=null&&(G.day>d||(G.day===d&&G.hour>=h))&&G.day<=d+2;
      { const d=D('2024-12-13'); if(F.CRAM_FREE_KNOWN&&past(d,21)&&!PHONE.sent(G,'y0_cram_msg')&&G.day<=d+1) PHONE.at(G,G.day===d?d:G.day,G.day===d?21:Math.max(9,G.hour),[Y('我今天去以前的補習班。等主任走了才進去。'),Y('然後櫃台說，主任交代過我會來。'),K('哈哈哈哈哈哈'),K('……那你要去嗎？'),Y('還不知道。'),K('好。')],'y0_cram_msg'); }
      /* 可昕休學的理由（使用者 22:0x 定案：期末占 100% 的作業記錯時間、寫信求補救、老師拒絕；AA_272 第 9 節 ae4806a9：一百分、沒交零分、一定被當）*/ { const d=D('2025-01-03'); if(past(d,21)&&!PHONE.sent(G,'y0_kx_essay1')) PHONE.at(G,d,21,[K('📷（課程網站的截圖。大一國文的期末作業那一格是紅字。）'),K('國文的期末報告。整科就這一份，一百分。'),K('我以為是下週五。'),Object.assign(K('是上週五。'),{ask:{id:'y0_kx_essay1',until:(d+1)*24+18,opts:[
          {t:'寄信問葉老師？',say:[K('正在寫。……寫第三版了。第一版太像在哭，第二版太像律師函。')]},
          {t:'妳先不要慌。',say:[K('我沒有慌。我在把截圖放大，看紅字是不是會變黑。'),K('……好啦。我寫信問葉老師。')]},
          {t:'要不要我現在過去？',say:[K('你又沒事。……好啦，來。我在社科院一樓。'),{who:null,text:'（你過去了。她把信給你看，你改了一個錯字。）'}]}]}})],'y0_kx_essay1'); }   /* AA_368 L8（企劃線 e55fda50）：選項 3 原本「你又沒課。……好啦，來。」*/
      { const d=D('2025-01-06'); if(past(d,21)&&!PHONE.sent(G,'y0_kx_essay2')) PHONE.at(G,d,21,[K('葉老師回了。'),K('很客氣。說不能補交，對每個人都一樣。'),K('……他說得沒錯。第一頁我有看。我只是記錯日子。')],'y0_kx_essay2'); }
      { const d=D('2025-01-11'); if(past(d,22)&&!PHONE.sent(G,'y0_kx_essay3')){ F.KX_THINK_LEAVE=F.KX_THINK_LEAVE||true; PHONE.at(G,d,22,[K('沒交就是零分。整科零分。'),K('這科一定會被當。'),K('我不想要成績單上有一個不及格。'),Object.assign(K('我在想要不要休學。'),{ask:{id:'y0_kx_essay3',until:(d+1)*24+18,opts:[
          {t:'妳想好了再跟我說。',set:{KX_THINK_LEAVE:'wait'},say:[K('嗯。我會。')]},
          {t:'休學的生活還可以。我可以教妳怎麼睡到十點。',set:{KX_THINK_LEAVE:'sleep'},say:[K('……你是在安慰我還是在炫耀。'),Y('都有。')]},
          {t:'先吃飯。',set:{KX_THINK_LEAVE:'eat'},say:[K('……好。鹽酥雞。')]}]}})],'y0_kx_essay3'); } } }
    /* E20 聖誕交換禮物（BB_153；AA_154 A36）：12/23（一）21:00 品妤群組；12/25（三）17:00 韋綸＋品妤；出發選單 12/25 19:00；沒去＝12/26～12/28 第一次走進公館（events.js ev_y0_e20b，她在捷運出口等），
       12/28 20:00 以前沒去＝可昕私訊「你的份，我放在你家信箱了。」→ 隔天早上拿到 GIRAFFE_KEYCHAIN（AA_224 3-5）*/
    if(S.isEcon(G)&&typeof OUT!=='undefined'){ const wed17=S.dayOfKey('2024-12-25'), gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class', T='g:'+gid, D=id=>!!(G.events&&G.events.done&&G.events.done[id]);
      if(wed17!=null&&(G.day>wed17-2||(G.day===wed17-2&&G.hour>=21))&&G.day<=wed17&&!PHONE.sent(G,'y0_e20_ask')){ if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）');
        PHONE.at(G,wed17-2,21,[{th:T,from:'econ_pinyu',text:'12/25 晚上七點，公館火鍋。禮物兩百以內。地址等一下傳。'}],'y0_e20_ask');
        if(!OUT.get(G,'y0_e20')) OUT.plan(G,{id:'y0_e20',ev:'ev_y0_e20',day:wed17,h:19,late:0.25,place:'公館',title:'公館 19:00：聖誕交換禮物（火鍋）',travel:'走過去約 15 分鐘',travelH:0.25}); }
      if(wed17!=null&&G.day===wed17&&G.hour>=17&&!PHONE.sent(G,'y0_e20_day')) PHONE.at(G,wed17,17,[{th:T,from:'econ_weilun',name:'韋綸',text:'今晚火鍋！我中午沒吃，留肚子。'},{th:T,from:'econ_pinyu',text:'我六點下班直接過去。遲到的自己付湯底。'}],'y0_e20_day');
      if(wed17!=null&&!F.GIRAFFE_KEYCHAIN&&!D('ev_y0_e20')&&!D('ev_y0_e20b')&&(G.day>wed17+3||(G.day===wed17+3&&G.hour>=20))&&G.day<=wed17+6&&!PHONE.sent(G,'y0_e20_mail')){   /* AA_224 3-5：12/26～12/28 沒去公館＝12/28 20:00 放家裡信箱、隔天早上拿到（只在那幾天補）*/ F.E20_MAILBOX=wed17+4; PHONE.at(G,wed17+3,20,[{th:'p:kexin',from:'kexin',text:'你的份，我放在你家信箱了。'}],'y0_e20_mail'); }
      if(F.E20_MAILBOX!=null&&!F.GIRAFFE_KEYCHAIN&&G.day>=F.E20_MAILBOX) F.GIRAFFE_KEYCHAIN=true;
      /* AA_529 第 5 節：30 分鐘版 E20、E20b、信箱那則（y0_e20_mail，CUT_MSG）都剪了，旗標照樣在 12/29 記——玩家沒看到，畢業以後卻提兩次（postgrad_lines.js）。
         記成 due＝之後第一張日期卡下面加兩句（econff3d.js S.cardLine）；沒有日期卡就掛在那天的起床（home3d.js S.sleep → ECONFF.keyWake）。E20、E20b、信箱有演的照原本、不加 */
      if(F.Y0_KEY_CARD==null&&F.GIRAFFE_KEYCHAIN&&F.E20_MAILBOX!=null&&!D('ev_y0_e20')&&!D('ev_y0_e20b')&&typeof ECONFF!=='undefined'&&ECONFF.short&&ECONFF.short(G)&&(PHONE.rec(G).cut||[]).includes('y0_e20_mail')) F.Y0_KEY_CARD='due'; }   /* 30 分鐘版信箱那則一定是剪的（長版會送到）；舊存檔過了 12/29 的照樣補（旁白是過去式「十二月底」）*/
    /* C2 自己的社團（AA_154 A37）：社課邀約、出發選單、唐睿的劇社私訊（Y0_EXTRA）刪除（AA_218 第 11 節、AA_154 0b-2；不提前到 10/17 以前，AA_355 第 3 節）。E07 選了社團（Y0_CLUB）照舊加進那個社團的群組 */
    if(S.isEcon(G)&&F.Y0_CLUB){ const C2={guitar:{g:'y0_guitar',n:'吉他社'},hiking:{g:'y0_hiking',n:'登山社'},badminton:{g:'y0_badminton',n:'羽球社'}}[F.Y0_CLUB]; if(C2&&!PHONE.inGroup(G,C2.g)) PHONE.join(G,C2.g,C2.n);
      const X=C2&&S.Y0_CLUB_MSG[C2.g]; if(X&&PHONE.inGroup(G,C2.g)) X.m.forEach(([k,L],i)=>{ const d=S.dayOfKey(k), tag=C2.g+'_'+(i+1); if(d!=null&&G.day<=d) PHONE.at(G,d,21,L.map(t=>({th:'g:'+C2.g,from:X.from,name:X.who,text:t,quiet:true})),tag);
        const q=PHONE.rec(G).q.find(x=>x.tag===tag); if(q) for(const it of q.items) it.quiet=true; }); }   /* AA_529 第⑦點（AA-B 10-30 04:55）：不用回＝quiet，30 分鐘版的快轉不停在這裡（收進手機、有紅點）；已經排進佇列的舊存檔也補上 */
    /* E22 期末通宵：刪除（AA_218 第 11 節、AA_154 0b-2）。
       E21a 跨年（A36、A38；AA_224 3-6）：12/31（二）19:00 群組四則＋出發選單「總圖門口 23:00：跨年」；沒去＝00:05 群組人潮照片＋可昕私訊 */
    if(S.isEcon(G)&&typeof OUT!=='undefined'){ const tue31=S.dayOfKey('2024-12-31'), gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class', T='g:'+gid, D=id=>!!(G.events&&G.events.done&&G.events.done[id]);
      if(tue31!=null&&G.day===tue31&&G.hour>=19&&!PHONE.sent(G,'y0_e21a_ask')){ if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）');
        PHONE.at(G,tue31,19,[{th:T,from:'econ_weilun',name:'韋綸',text:'放假一個多禮拜了！今晚跨年，走啦！'},{th:T,from:'econ_pinyu',text:'幾點、哪裡？'},{th:T,from:'econ_weilun',name:'韋綸',text:'十一點，市府站二號出口。'}],'y0_e21a_ask');   /* AA_224 3-6：他不能進總圖；16 週制已經放假，不講期末（AA-C 2026-10-17 定稿，AA_269 第 9 節）*/
        if(!OUT.get(G,'y0_e21a')&&G.hour<23.25) OUT.plan(G,{id:'y0_e21a',ev:'ev_y0_e21a',day:tue31,h:23,late:0.25,place:'市府站',title:'市府站 23:00：跨年',travel:'捷運 約 30 分鐘',travelH:0.5}); }
      if(tue31!=null&&!D('ev_y0_e21a')&&!F.E21A_WENT&&(G.day>tue31||G.hour>=24+5/60)&&G.day<=tue31+2&&!PHONE.sent(G,'y0_e21a_missed')) PHONE.at(G,tue31,24+5/60,[{th:T,from:'econ_weilun',name:'韋綸',text:'📷（信義區的人潮）'},{th:'p:kexin',from:'kexin',text:'新年快樂。你錯過了一場人潮。……下次你要來。'}],'y0_e21a_missed'); }
    /* E19 誤會（期末考完的公館聚餐、19:15 韋綸的電話、1/4「你最近很有禮貌」）拿掉：併進 10/17 車上（AA_224 1-3；AA_219 A-21）*/
    /* L5a 長頸鹿拉花（BB_110 L5a；AA_154 A42）：10/11（五）21:00 經濟系群組可昕＋出發選單 10/12「兩點半 Café 14:00」（只帶到 Café，走進去就演 ev_y0_l5a；14:15 還沒到＝沒去）；
       沒去＝10/12 16:00 群組品妤照片「驗證結果：是馬。」＋可昕「是很努力的長頸鹿。」；不再邀第二次 */
    if(S.isEcon(G)&&typeof OUT!=='undefined'){ const ld=S.dayOfKey('2024-10-12'); if(ld!=null){ const gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class', T='g:'+gid, done=!!(G.events&&G.events.done&&G.events.done.ev_y0_l5a);
      if((G.day>ld-1||(G.day===ld-1&&G.hour>=21))&&G.day<=ld&&!PHONE.sent(G,'y0_l5a_ask')){ if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）');
        PHONE.at(G,ld-1,21,[{th:T,from:'kexin',text:'溫州街有一間 Café，聽說拉花會畫長頸鹿。……我沒看過。我們去驗證。'}],'y0_l5a_ask');
        if(!OUT.get(G,'y0_l5a')&&(G.day<ld||G.hour<14.25)) OUT.plan(G,{id:'y0_l5a',day:ld,h:14,late:0.25,place:'兩點半 Café',title:'兩點半 Café 14:00：長頸鹿拉花',travel:'走過去約 15 分鐘',travelH:0.25,goto:{zone:'cafe',x:0,z:5,yaw:Math.PI},early:1/12}); }
      if(!done&&(G.day>ld||(G.day===ld&&G.hour>=16))&&G.day<=ld+2&&PHONE.sent(G,'y0_l5a_ask')&&!PHONE.sent(G,'y0_l5a_miss')) PHONE.at(G,ld,16,[{th:T,from:'econ_pinyu',name:'品妤',text:'📷（短脖子的長頸鹿）'},{th:T,from:'econ_pinyu',name:'品妤',text:'驗證結果：是馬。'},{th:T,from:'kexin',text:'是很努力的長頸鹿。'}],'y0_l5a_miss'); } }
    /* 韋綸的腳踏車・沒去版（AA_154 2-5b；BB_112 第 3 節）：11/7 17:30 還沒演腳踏車（沒上會計、或選了「今天先回去」）＝群組韋綸求救，回覆到 18:00：
       「（查完再回）」（AA_224 3-9：他在家查）＝時間前進一小時，祐廷傳查到的（LEGAL_REVIEW_REQUIRED：BB-B 審過 7cf231c3，改字要再審）＋韋綸回、記 BIKE_LOOKED_UP、WL_BIKE；「（不回）」不記。
       18:00 還沒回或選了不回＝阿勳一句（選了去查的不出現）。兩週後 11/21 21:00 群組韋綸、可昕（去了、沒去都收到）*/
    if(S.isEcon(G)){ const bd=S.bikeDay(); if(bd!=null){ const gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class', T='g:'+gid, WL=t=>({th:T,from:'econ_weilun',name:'韋綸',text:t});
      if(G.day===bd&&G.hour>=17.5&&!F.WL_BIKE_SEEN&&!PHONE.sent(G,'y0_bike_ask')){ if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）');
        PHONE.at(G,bd,17.5,[Object.assign(WL('我的車被認走了。有沒有人懂法律？'),{ask:{id:'y0_bike',until:bd*24+18,opts:[{t:'（查完再回）',post:false,set:{WL_BIKE_ASK:'look'}},{t:'（不回）',post:false,set:{WL_BIKE_ASK:'none'}}]}})],'y0_bike_ask'); }
      if(F.WL_BIKE_ASK==='look'&&!PHONE.sent(G,'y0_bike_look')&&!(GM.D&&GM.D.active)){ F.WL_BIKE_ASK='looked'; F.BIKE_LOOKED_UP=true; F.WL_BIKE=true; if(GM.advance) GM.advance(1);
        PHONE.at(G,G.day,G.hour,[{th:T,from:'player',who:null,text:'被偷的東西，原主兩年內可以要回去。車要還，可是你可以去找賣你的人。紀錄都留著。'},WL('……好。我去派出所。')],'y0_bike_look'); }
      if(G.day>=bd&&(G.day>bd||G.hour>=18)&&G.day<=bd+2&&PHONE.sent(G,'y0_bike_ask')&&!/^look/.test(F.WL_BIKE_ASK||'')&&!PHONE.sent(G,'y0_bike_xun')) PHONE.at(G,bd,18,[{th:T,from:'econ_zhengxun',name:'阿勳',text:'去派出所。留著對話紀錄。'}],'y0_bike_xun');
      if((G.day>bd+14||(G.day===bd+14&&G.hour>=21))&&G.day<=bd+18&&!PHONE.sent(G,'y0_bike_after')) PHONE.at(G,bd+14,21,[WL('賣車的人找到了。錢拿回一半。另一半當學費。'),{th:T,from:'kexin',text:'拿回一半很好了啦。'}],'y0_bike_after');   /* 可昕那句照 BB_179 段 B #71（AA_269 C8）*/ } }
    /* F1 經濟系群組的小年夜（BB_110 F1；AA_154 A17、A18；台詞照 BB_179 段 E 3-3 M20～M26、選項照 AA_200 7-4，AA_269 C7）：2025-01-27（一）21:00「走啦」（沒有就全班群組）八則＋可昕問年夜飯幾個人；回覆三選一：
       「加阿勳的表叔，十三個。」＝阿勳一句、Y0_UNCLE；「四個。」＝品妤一句；「（已讀，不回）」＝可昕一句、Y0_F1_SEEN。完全沒打開手機＝什麼都沒有（群組照樣留著）。回覆開到 1/28 18:00（除夕晚上是 E21 的電話；AA_154 A43），過了只能看、什麼都不記 */
    if(S.isEcon(G)){ const fd=S.dayOfKey('2025-01-27'); if(fd!=null&&(G.day>fd||(G.day===fd&&G.hour>=21))&&G.day<=fd+3&&!PHONE.sent(G,'y0_f1')){ const gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class'; if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）');
      const T='g:'+gid, M=(from,name,text)=>({th:T,from,name,text}), PY=t=>M('econ_pinyu','品妤',t), TR=t=>M('econ_tangrui','唐睿',t), XU=t=>M('econ_zhengxun','阿勳',t), WL=t=>M('econ_weilun','韋綸',t);
      PHONE.at(G,fd,21,[PY('📷（一張表格）各縣市年菜價格比較。台北最貴。'),TR('妳為什麼要做這個？'),PY('我媽叫我去買。'),XU('我家今年三個阿姨、兩個舅舅，還有一個不知道為什麼會來的表叔。'),
        WL('📷（一張照片：海邊、一台腳踏車）我騎到墾丁了！'),TR('從哪裡騎？'),WL('枋寮。……好啦，坐火車到枋寮。'),TR('（貼圖：拍手）'),
        Object.assign({th:T,from:'kexin',text:'明天年夜飯你們家幾個人？我家十二個'},{ask:{id:'y0_f1',until:(fd+1)*24+18,opts:[{t:'加阿勳的表叔，十三個。',set:{Y0_UNCLE:true},say:[XU('……他應該會很困惑。')]},{t:'四個。',say:[PY('跟我家一樣。')]},{t:'（已讀，不回）',post:false,set:{Y0_F1_SEEN:true},say:[{th:T,from:'kexin',text:(G.name||'祐廷')+'已讀不回喔。'}]}]}})],'y0_f1'); } }
    /* T3 沒去（BB_112 T3）：第 1 週沒演到＝2/21（五）21:00 群組品妤「今天收到一台計算機。很實用。」韋綸「……全系都在笑。」（時間暫定）*/
    if(S.isEcon(G)){ const d=S.dayOfKey('2025-02-21'); if(d!=null&&(G.day>d||(G.day===d&&G.hour>=21))&&G.day<=d+3&&!(G.events&&G.events.done&&G.events.done.ev_y0_t3)&&!PHONE.sent(G,'y0_t3_miss')){ const gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':'econ_class', T='g:'+gid;
      if(!PHONE.inGroup(G,gid)) PHONE.join(G,'econ_class','經濟系 大一（全班）'); PHONE.at(G,d,21,[{th:T,from:'econ_pinyu',name:'品妤',text:'今天收到一台計算機。很實用。'},{th:T,from:'econ_weilun',name:'韋綸',text:'……全系都在笑。'}],'y0_t3_miss'); }
      if(d!=null&&PHONE.sent(G,'y0_t3_miss')&&(G.day>d||(G.day===d&&G.hour>=22))&&G.day<=d+3&&!PHONE.sent(G,'y0_t3_tr')){ const TR=t=>({th:'p:econ_tangrui',from:'econ_tangrui',name:'唐睿',text:t});   /* AA_224 5-4：唐睿私訊祐廷 */
        PHONE.at(G,G.day===d?d:G.day,G.day===d?22:Math.max(9,G.hour),[TR('她說很實用。'),Object.assign(TR('……這樣算成功嗎。'),{ask:{id:'y0_t3_tr',until:(d+1)*24+18,opts:[{t:'算。',say:[TR('好。')]},{t:'下次送花。',say:[TR('花不能按。')]}]}})],'y0_t3_tr'); } }
    /* E24 每晚的訊息（BB_104 8b-16；AA_154 A44）：寒假可昕私訊，順序固定：1/10 22:30「跳過哪一天」（選項有除夕，排在除夕前）、1/18 22:30「今天好冷。你那邊幾度？」（AA_368 L9a，原本「什麼湯」）、
       2/2 22:30「寒假胖了是存糧」（過年吃完以後）；那一晚 2/8（六）23:00「我把高三的講義翻出來了。」兩句、沒有選項（AA_368 H3；原本「如果可以重來一次選科系」三選一＋y0_e24n_late，AA_224 3-8）。
       回覆開到隔天 18:00。寒假模式跳過的日子：照時間戳記收在手機裡 */
    if(S.isEcon(G)){ const K=t=>({th:'p:kexin',from:'kexin',text:t}), D=k=>S.dayOfKey(k), end=S.dayOfKey('2025-02-17'), past=(d,h)=>d!=null&&(G.day>d||(G.day===d&&G.hour>=h))&&(end==null||G.day<=end), until=d=>(d+1)*24+18;   /* 寒假結束（2/17 開學）以後不補發 */
      { const d=D('2025-01-10'); if(past(d,22.5)&&!PHONE.sent(G,'y0_e24a')) PHONE.at(G,d,22.5,[K('放假第三週，我已經不知道今天星期幾了')],'y0_e24a');   /* BB_179 段 C #64（AA_200 7-3：不用回）*/ }
      { const d=D('2025-01-18'); if(past(d,22.5)&&!PHONE.sent(G,'y0_e24c')) PHONE.at(G,d,22.5,[Object.assign(K('今天好冷。你那邊幾度？'),{ask:{id:'y0_e24c',until:until(d),opts:[{t:'十四度。',say:[K('高雄二十二度。……我不是在炫耀。')]},{t:'不知道，我在被窩裡。',say:[K('好好喔。我也是。')]},{t:'冷到不想講話。',say:[K('那你不要講。聽我講就好。')]}]}})],'y0_e24c'); }   /* 回覆按鈕：BB-B c65b84f0 */   /* AA_368 L9a（企劃線 e55fda50）：原本「如果你是一碗湯，你會是什麼湯？」是假設題（使用者 10-18：可昕不出假設題）；舊存檔已經收到的照留 */
      { const d=D('2025-02-02'); if(past(d,22.5)&&!PHONE.sent(G,'y0_e24b')) PHONE.at(G,d,22.5,G.flags.KH_TRIP_DONE?[K('到家了沒。'),K('我媽說我這三天胖了。……都是夜市害的。')]:[K('我媽說我寒假胖了。')],'y0_e24b'); }   /* AA_449 1-5：去過高雄（1/31～2/2）的接那三天 */
      { const d=D('2025-02-08'); if(past(d,23)&&!PHONE.sent(G,'y0_e24n')) PHONE.at(G,d,23,[K('我把高三的講義翻出來了。'),K('數學那本，每一頁都畫滿了。……我那時候到底在想什麼。')],'y0_e24n'); } }   /* AA_368 H3（企劃線 e55fda50）：原本「如果可以重來一次選科系，你會選什麼？」＋三選一＋「法律。」那個選項的 y0_e24n_late——2/2 蓮池潭兩個人已經說好一起考法律（ev_y0_kh3），又是假設題；整則換成這兩句、不用選項，y0_e24n_late 拿掉（舊存檔已經收到的照留，標籤不變＝不會再收一次）*/
    /* 校慶問答攤（BB_95 3-7，DL-04B）：前一天（週五）21:00 法服群組，學姊提醒；沒加入法服的玩家改成校園公告欄的旁白（AMBIENT 的 festEve）*/
    if(PHONE.inGroup(G,'lawclub_study')){ const fs=termDay('Y1S1',11,6); if(fs&&G.day===fs-1) PHONE.at(G,fs-1,21,[{th:'g:lawclub_study',from:'npc_lawclub_pres',name:'法服的社長',text:'明天校慶，問答攤十點開。輪班表在記事本。'}],'fest_eve_lawclub'); }
    /* 家族聚餐（BB_95 3-8）：前一週 Kevin 在家族群組約；前一天 Kevin 提醒；沒去的玩家 22:00 Kevin 貼資料夾。學姊自己起頭的群組訊息都刪（使用者 08:1x「她根本就不是主動在群組會說話的人」，AA_218 17-12、17-12a）*/
    if(PHONE.inGroup(G,'family_law')){ const fri=termDay('Y1S1',14,5); if(fri){ const th='g:family_law', sis=t=>({th,from:'heroine_05',name:'溫學姊',text:t}), kv=t=>({th,from:'kevin',name:'Kevin',text:t});
      if(G.day>=fri-7&&G.day<=fri) PHONE.at(G,fri-7,20.5,[kv('家族聚餐！下週五 18:30，阿鳳麵店。學姊說她會來（截圖為證）'),sis('收到。')],'fam_dinner_invite');   /* 前一週的週五晚上傳：「週五」→「下週五」（AA_458 3-1）*/
      if(G.day===fri-1) PHONE.at(G,fri-1,21,[kv('明天六點半，公館。記得來。')],'fam_dinner_eve');   /* 前一天 21:00 提醒一次（BB_95 3-8，DL-04B）；學姊不在群組主動發言＝改 Kevin（AA_218 17-12a）*/
      if(G.day===fri&&h(G)>=17.5&&h(G)<18.5&&!F.famDinnerToast&&!(G.events&&G.events.done&&G.events.done.ev_sis_family_dinner)){ F.famDinnerToast=true; GM.toast('今天 18:30 家族聚餐（公館）',4200); }   /* 當天 17:30 */
      if(G.day===fri&&h(G)>=19&&!(G.events&&G.events.done&&G.events.done.ev_sis_family_dinner)) PHONE.at(G,fri,22,[kv('📷（一疊資料夾，最上面那份寫著「周老師　歷年考古題」）'),kv('學姊整理的。沒來的人，跟我拿。')],'fam_dinner_noshow');   /* 學姊那句刪（AA_218 17-12a）*/   /* 照片寫拍了什麼（聚餐裡學姊拿出來的周老師考古題，ev_sis_family_dinner）、「自己拿」改「跟我拿」，一則改兩則（AA_458 3-2；tag 照舊）*/
      /* 跨年夜學姊第一次貼貼圖（sis_first_sticker）刪：她不在群組主動發言（AA_218 17-12a）*/ } }
    if(F.guitarFirstDay!=null&&!PHONE.sent(G,'guitar_grp1')){ PHONE.join(G,'guitar','吉他社'); PHONE.at(G,F.guitarFirstDay,21.5,[{th:'g:guitar',from:'heroine_04',text:'新人自己報名字，不要讓我問。這不是問句。'}],'guitar_grp1'); }
    if(G.msgs&&G.msgs.some(m=>m.tag==='sis_yutong')&&!F.yutongFwd){ F.yutongFwd=true;
      if(typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')){ PHONE.post(G,{th:'p:heroine_03',from:'player',who:null,text:'（把學姊的回覆截圖傳給語彤）',tag:'yutong_fwd_q'}); PHONE.at(G,G.day,G.hour+0.1,[{th:'p:heroine_03',from:'heroine_03',text:'……法服是什麼？'}],'yutong_fwd'); }
      else F.yutongFwdInPerson=true; }
    /* 考完的宵夜（A15，AA 2026-10-14）：民總期中考那天，考完（考試結束後 6 分鐘）阿哲在麵店團群組「考完了 滷味」＝排 20:30 公館滷味攤（出遊，到時候問要不要去）；
       沒有群組的玩家：G1 結束時阿哲當面問，回「去。」（SUPPER_MID1）才排 */
    if(typeof CLS!=='undefined'&&typeof OUT!=='undefined'){ const it=CLS.dayItems(G,G.day).find(x=>x.c.id==='civ_general'&&x.exam==='mid'), t=CALENDAR.termOf(G.day);
      if(it&&t&&t.id==='Y1S1'){ const plan=()=>{ if(G.hour<20.5+0.75) OUT.plan(G,{id:'supper_mid1',ev:'ev_midterm_supper',day:G.day,h:20.5,place:'公館滷味攤',title:'考完的宵夜',travel:'走過去約 10 分鐘',travelH:1/6}); };
        if(PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'zhe_supper_mid1')&&G.hour<20.5){ PHONE.at(G,G.day,Math.max(G.hour,it.t1+0.1),[{th:'g:noodle_team',from:'zhe',text:'考完了 滷味'}],'zhe_supper_mid1'); plan(); }
        else if(F.SUPPER_MID1==='yes'&&!OUT.get(G,'supper_mid1')) plan(); }
      /* 期中考完的晚餐（大一下，交接包 v2 C11、C21；AA 64ceb70）：刑總二期中考那天，考完阿哲在麵店團群組「刑總考完了 今天麵店，七點，長桌」＝排 19:00 阿鳳麵店長桌；
         沒有群組的玩家：G1 大一下版最後阿哲當面問，回「去。」（SUPPER_MID2）才排 */
      const it2=CLS.dayItems(G,G.day).find(x=>x.c.id==='crim_gen2'&&x.exam==='mid');
      if(it2&&t&&t.id==='Y1S2'){ const plan2=()=>{ if(G.hour<19+0.75) OUT.plan(G,{id:'supper_mid2',ev:'ev_midterm_supper_y1s2',day:G.day,h:19,place:'阿鳳麵店',title:'考完的晚餐',travel:'走過去約 10 分鐘',travelH:1/6}); };
        if(PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'zhe_supper_mid2')&&G.hour<19){ PHONE.at(G,G.day,Math.max(G.hour,it2.t1+0.1),[{th:'g:noodle_team',from:'zhe',text:'刑總考完了 今天麵店，七點，長桌'}],'zhe_supper_mid2'); plan2(); }
        else if(F.SUPPER_MID2==='yes'&&!OUT.get(G,'supper_mid2')) plan2(); } }
    /* 麵店團（AA_70 2-3、AA_40 哲 1）：哲 1 那天阿哲建的群組。麵店日＝上課週的週二、週四（考試週、國定假日、出國期間沒有）。
       阿哲 17:30 在群組裡揪，只在你上一個麵店日沒來的時候（AA 2026-10-14：一直有來的玩家，群組是安靜的）；四句輪流。tag rt_＝例行訊息（每天的手機小事不把它當成劇情訊息）。
       有沒有來：麵店日 17:00–21:00 在麵店（ndlDays，最近 12 個）；開始記以前（ndlTrack0：舊存檔）的麵店日當作有來 */
    if(F.noodleTableDay!=null&&typeof CALENDAR!=='undefined'){ if(!PHONE.inGroup(G,'noodle_team')){ PHONE.join(G,'noodle_team','麵店團'); PHONE.post(G,{th:'g:noodle_team',text:F.NDL_LATE_ADD?'阿哲把你加進了群組「麵店團」。':'阿哲建立了群組「麵店團」，把你加了進來。',tag:'noodle_team_new'});   /* NDL_LATE_ADD：錯過哲 1、大一下以後才被阿哲拉進來的（events.js ev_zhe_group_late，AA_496 第 9 節第 3 點）：群組早就有了，不寫「建立了」*/
        for(const t of ['以後週二週四 麵店長桌','有空就來 沒空不用講']) PHONE.post(G,{th:'g:noodle_team',from:'zhe',text:t,tag:'noodle_team_rule'}); }   /* NOODLE-TEAM-WHY-1027（AA_486 1-3）：群組建好的下一則，阿哲講清楚「長桌」是什麼（手機訊息，不加句號）；舊存檔已經在群組裡的不補 */
      if(F.ndlTrack0==null) F.ndlTrack0=G.day;
      if(G.zone==='noodle'&&S.noodleDay(G.day)&&G.hour>=17&&G.hour<21){ const L=F.ndlDays||(F.ndlDays=[]); if(L[L.length-1]!==G.day){ L.push(G.day); if(L.length>12) L.shift(); } }
      if(G.day>F.noodleTableDay&&S.noodleDay(G.day)&&!F.abroad&&!PHONE.sent(G,'rt_zhe_ndl_'+G.day)){ let p=null; for(let d=G.day-1;d>=F.noodleTableDay;d--) if(S.noodleDay(d)){ p=d; break; }   /* abroad：之後的交換系統設 */
        const came=p==null||p<F.ndlTrack0||(F.ndlDays||[]).includes(p);
        if(F.ndlChk!==G.day){ if(F.ndlMiss==null) F.ndlMiss=S.ndlMissLegacy(G,p); F.ndlChk=G.day;   /* AA_469 第 1 節：一個麵店日只判斷一次（ndlChk）；ndlMiss＝連續揪了幾次你都沒來（4＝停了）*/
          if(came) F.ndlMiss=0;   /* 去了一次麵店：從頭算 */
          else if(F.ndlMiss<3){ const k=(F.ndlPingN|0)%NDL_PINGS.length; if(PHONE.at(G,G.day,17.5,[{th:'g:noodle_team',from:'zhe',text:NDL_PINGS[k]}],'rt_zhe_ndl_'+G.day)){ F.ndlPingN=(F.ndlPingN|0)+1; F.ndlMiss++; } }
          else if(F.ndlMiss===3){ const t=(CALENDAR.termOf(G.day)||{}).id||null; F.ndlMiss=4; if(F.ndlOkT!==t&&PHONE.at(G,G.day,17.5,[{th:'g:noodle_team',from:'zhe',text:NDL_OK}],'rt_zhe_ndl_'+G.day)) F.ndlOkT=t; } } } }   /* 第三次揪了也沒來＝這一次問「還好嗎」（這學期問過就不再問），之後不揪 */
    /* 可昕 K1 導遊（BB_95 9-1）：第 3 週週五 19:30 她傳「週末來政大？我當導遊。」——答應就排週六下午 14:00 去政大（出遊，src/outings3d.js）；
       答應得晚（過了那個週六下午）就排下一個週六。回覆的兩句與她的回應照 BB 2026-10-14（494e510）。這週不行的玩家：下一週週五 19:30 她再約一次
      （「這週末呢？導遊還在。」，兩個回覆同上；回覆比那天晚才回的，從回覆的下一個週五起）；兩次都不行＝之後第一次「開車去政大」才有導遊（那個功能還沒做：K1 先不發生，K2 照「K1 還沒發生」的結尾）*/
    const KX_TOUR_OPTS=(no)=>[{t:'好，週六下午過去。',set:{KX_TOUR_YES:true},say:[{from:'kexin',text:'好。導遊在校門口等。'}]},{t:'這週末不行。',set:{[no]:true},say:[{from:'kexin',text:'好。導遊的位子幫你留著。'}]}];
    if(F.dating_kexin&&!PHONE.sent(G,'kx_tour_ask')){ const fri=termDay('Y1S1',S.week1Start(G)?2:3,5);   /* BB_170 第 27 列：開學改 9/1 的局提早到第 2 週週五 9/12 19:30 */ if(fri) PHONE.at(G,fri,19.5,[{th:'p:kexin',from:'kexin',text:'週末來政大？我當導遊。',ask:{opts:KX_TOUR_OPTS('KX_TOUR_NO')}}],'kx_tour_ask'); }
    if(F.dating_kexin&&F.KX_TOUR_NO&&!F.KX_TOUR_YES&&!PHONE.sent(G,'kx_tour_ask2')&&typeof CALENDAR!=='undefined'){ let d=termDay('Y1S1',S.week1Start(G)?3:4,5); if(d&&(G.day>d||(G.day===d&&h(G)>19.5))){ d=G.day+1; while(CALENDAR.dateOf(d).wd!==5) d++; }
      if(d) PHONE.at(G,d,19.5,[{th:'p:kexin',from:'kexin',text:'這週末呢？導遊還在。',ask:{opts:KX_TOUR_OPTS('KX_TOUR_NO2')}}],'kx_tour_ask2'); }
    if(F.KX_TOUR_YES&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_tour')&&!(G.events&&G.events.done&&G.events.done.ev_kexin_tour_nccu)&&typeof CALENDAR!=='undefined'){ let d=G.day; while(CALENDAR.dateOf(d).wd!==6||(d===G.day&&G.hour>13.5)) d++;
      OUT.plan(G,{id:'kx_tour',ev:'ev_kexin_tour_nccu',day:d,h:14,place:'政大',title:'去政大找可昕',travel:'開車約 30 分鐘',travelH:0.5});
      const tw=CALENDAR.termOf(d); F.kxTourWeeks=tw&&tw.week===2?'兩':S.zhNum(tw?tw.week:3); }   /* 「念了兩個禮拜」不是「二個」（BB_170 第 27 列）*/   /* 她在政大念了幾個禮拜（照那天的週次；政大和台大同一天開學） */
    /* 可昕 K1b（BB_95 9-2）：K1 之後（NCCU_VISITED），第 6～8 週第一個平日下午 15:30 她傳；三個回覆照原文 */
    if(F.NCCU_VISITED&&!PHONE.sent(G,'kx_yule_ask')&&typeof CALENDAR!=='undefined'){ const tm=CALENDAR.termOf(G.day), wd=CALENDAR.dateOf(G.day).wd;
      if(tm&&tm.id==='Y1S1'&&tm.week>=6&&tm.week<=8&&wd>=1&&wd<=5&&!CALENDAR.holiday(G.day)&&G.hour<15.5){ const K=t=>({from:'kexin',text:t});
        PHONE.at(G,G.day,15.5,[{th:'p:kexin',from:'kexin',text:'明天晚上有空嗎？我們系上有人揪宵夜，予樂一直說要看你本人。',ask:{opts:[
          {t:'好，我開車過去。',set:{KX_YULE:'yes'}},{t:PHONE.inGroup(G,'noodle_team')&&S.noodleDay(G.day+1)?'我七點跟麵店團吃飯，晚一點可以嗎？':'我明天七點有事，晚一點可以嗎？',set:{KX_YULE:'late'},say:[K('那九點？你來吃第二輪。')]},{t:'這週不行，下週換我請。',set:{KX_YULE:'no'},say:[K('好。')]}]}}],'kx_yule_ask'); F.kxYuleAskDay=G.day; } }
    if((F.KX_YULE==='yes'||F.KX_YULE==='late')&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_yule')&&F.kxYuleAskDay!=null)
      OUT.plan(G,{id:'kx_yule',ev:'ev_kexin_yule_pass',day:Math.max(F.kxYuleAskDay+1,G.day),h:F.KX_YULE==='late'?21:19.5,place:'政大',title:'去政大見予樂',travel:'開車約 30 分鐘',travelH:0.5});
    if(F.yulePassDay!=null) PHONE.at(G,F.yulePassDay+1,12.5,[{th:'p:kexin',from:'kexin',text:'📷（予樂寫的紙條：「及格。」）'}],'kx_yule_pass');
    /* 予樂戴紙巾皇冠的照片：原本「這週不行」才私訊（kx_yule_crown）；AA_503 9-2、9-3 改成可昕的動態第 3 則，不管去沒去都出（src/data/feed_y1s1.js kx3）*/
    /* 中秋烤肉（A13）：第 5 週週三 21:00 阿哲揪（有麵店團群組在群組，沒有的私訊）；去＝週六 15:00 河濱（出遊，走過去約 15 分鐘）。揪的那一句和兩個回覆是 LAWWW 寫的（AA_355 第 2 節：AA 看過、照用）*/
    { const wed=termDay('Y1S1',5,3), sat=termDay('Y1S1',5,6);
      if(sat&&!F._bbqUntilFix){ F._bbqUntilFix=1; const fix=it=>{ if(it&&it.ask&&it.ask.until==null) it.ask.until=sat*24+15; };   /* 舊存檔：5c471a79（10-21）以前排進去的 bbq_ask、kx_bbq_ask 沒有 until，到隔年還是「待回覆」、每個假期一開始手機自己打開（BB-C 10-21 P3；10-22 子代理用 9/25 底檔查到）→ 補上和新局同一個期限（一次）*/
        for(const m of (G.msgs||[])) if(m.tag==='bbq_ask'||m.tag==='kx_bbq_ask') fix(m);
        for(const q of (PHONE.rec(G).q||[])) if(q.tag==='bbq_ask'||q.tag==='kx_bbq_ask') (q.items||[]).forEach(fix); }
      if(wed&&sat&&!PHONE.sent(G,'bbq_ask')&&G.day<=sat){ const th=PHONE.inGroup(G,'noodle_team')?'g:noodle_team':'p:zhe'; PHONE.at(G,wed,21,[{th,from:'zhe',text:'週六中秋烤肉 河濱 下午三點',ask:{until:sat*24+15,opts:[{t:'去。',set:{BBQ_YES:true}},{t:'這次不行。',set:{BBQ_NO:true}}]}}],'bbq_ask'); }   /* until：週六 15:00 開始以後不能再回（BB-C 10-21 P3：原本到隔年一月還是「待回覆」）*/
      if(F.BBQ_YES&&typeof OUT!=='undefined'&&!OUT.get(G,'bbq')&&sat&&G.day<=sat) OUT.plan(G,{id:'bbq',ev:'ev_mid_autumn_bbq',day:sat,h:15,place:'河濱',title:'中秋烤肉',travel:'走過去約 15 分鐘',travelH:0.25});
      /* 可昕 K3（BB_95 9-4）：前一天（週五）20:00 她問；回「來我們這邊」她就來；「妳去妳們系的」她去她們系的（烤玉米的照片 AA_503 改成動態第 2 則，去沒去都出）*/
      if(sat&&F.dating_kexin&&(F.BBQ_YES||!F.BBQ_NO)&&!PHONE.sent(G,'kx_bbq_ask')&&G.day>=sat-1&&G.day<=sat){ const K=t=>({from:'kexin',text:t});
        PHONE.at(G,sat-1,20,[{th:'p:kexin',from:'kexin',text:'我們系也有烤肉。……你們的比較好玩嗎？',ask:{until:sat*24+15,opts:[{t:'來我們這邊。',set:{KX_BBQ_COME:true}},{t:'妳去妳們系的。',set:{KX_BBQ_NO:true}}]}}],'kx_bbq_ask'); }
      /* 烤玉米的照片「我們的玉米比較好。」：原本「妳去妳們系的。」才私訊（kx_bbq_corn）；AA_503 9-2、9-3 改成可昕的動態第 2 則，一定出（她來了＝照片裡有你的手，src/data/feed_y1s1.js kx2）*/ }
    /* 以安新 3 宿舍的規則（A14，交接包_v1 第 3 節）：第 7 週週二晚上麵店團群組，Alison 轉述（她是聽說的）、阿哲、以安隔一陣子才回；只給在群組裡的玩家（其他人由沛珊當面說：ev_an_dorm_rules_peishan）*/
    if(PHONE.inGroup(G,'noodle_team')&&!F.AN_DORM_RULES){ const d=termDay('Y1S1',7,2), gj=PHONE.rec(G).groups.noodle_team; if(d&&G.day>=d-1&&gj.day<=d){ const th='g:noodle_team';   /* 那天以前就在群組裡（之後才加入的，看不到加入以前的訊息：由沛珊當面說）*/
      PHONE.at(G,d,21.7,[{th,from:'yu',text:'報告！聽說以安為了樓層會議，把整本宿舍規則讀完了，還寫了三頁意見。'},{th,from:'yu',text:'大家笑她，她說：「規則是我們要住的，總要有人讀完。」'},{th,from:'zhe',text:'……她說得對耶'}],'an_rules_grp');
      PHONE.at(G,d,22.4,[{th,from:'heroine_01',text:'三頁是因為字很大。'}],'an_rules_an'); } }
    if(G.msgs&&!F.AN_DORM_RULES&&G.msgs.some(m=>m.tag==='an_rules_grp')) F.AN_DORM_RULES='group';
    /* 以安的聯絡方式（AA 2026-10-14：第二天 Café、總圖兩條路線的結尾她要了聯絡方式＝anContactDay2）：沒和她走的玩家、舊存檔在下午結束時默默加上（不補訊息）*/
    if(F.afternoonDone) silentContact('heroine_01');
    /* 她的第一則訊息（AA 2026-10-14）：當晚 21:30 一張筆記的照片；報告「一起寫」的玩家（A12 REPORT_PARTNER）那天晚上再傳一張分工表 */
    if(F.AN_CONTACT_DAY2&&!PHONE.sent(G,'an_first_note')&&G.day<=F.AN_CONTACT_DAY2+1) PHONE.at(G,F.AN_CONTACT_DAY2,21.5,[{th:'p:heroine_01',from:'heroine_01',text:'📷（筆記的照片，字很整齊）'}],'an_first_note');
    { const d=G.events&&G.events.last&&G.events.last.ev_an_report_split; if(d!=null&&G.day<=d+1&&!PHONE.sent(G,'an_split_table')&&typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_01','REPORT_PARTNER')&&typeof INV!=='undefined'&&INV.hasContact(G,'heroine_01'))
        PHONE.at(G,d,G.day===d?Math.max(21.5,h(G)+0.25):21.5,[{th:'p:heroine_01',from:'heroine_01',text:'📷（報告的分工表）'}],'an_split_table'); }
    /* 以安的邀約（交付清單 A19：AA_70 2-1「認識以上」那一列；交接包_v1 第 16 週「期末前的總圖」）：16 週制改第 15 週（期末考週的前一週，AA_243 #68）週一～四 19:00 以後約隔天 8:00 總圖——
       邀約系統（invites3d.js 的 offer：手機上回答應／改天／不了；見面照邀約系統）；只約一次 */
    { const d=termDay('Y1S1',15,1); if(d&&G.day>=d&&G.day<=d+3&&h(G)>=19&&!F.anFinalInvite&&typeof INV!=='undefined'&&INV.hasContact(G,'heroine_01')&&typeof SOCIAL!=='undefined'&&SOCIAL.stage('heroine_01')!=='STRANGER'){
        F.anFinalInvite=G.day; INV.offer(G,'heroine_01','library',G.day+1,8,'明天 8:00 總圖。周老師那題，我寫了反方的理由。你來反駁。'); } }
    /* 可昕 K2 她第一次來台大（BB_95 9-3）：第 6 週週五 20:00 她傳（避開第 5 週六的中秋）；週六 16:00 社科院門口（出遊：走過去約 10 分鐘）*/
    { const fri=termDay('Y1S1',6,5);
      if(fri&&F.dating_kexin&&G.day<=fri&&G.day>=fri-7&&!PHONE.sent(G,'kx_ntu_ask')) PHONE.at(G,fri,20,[{th:'p:kexin',from:'kexin',text:'這次換我去台大。我先去找品妤，你四點來社科院門口。'}],'kx_ntu_ask');   /* AA_313 第 2 節第 8 列：實際是祐廷走去社科院門口找她們（原本「……再去霖澤館抓你。」）*/
      if(fri&&F.dating_kexin&&G.day>=fri&&G.day<=fri+1&&PHONE.sent(G,'kx_ntu_ask')&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_ntu'))
        OUT.plan(G,{id:'kx_ntu',ev:'ev_kexin_visits_ntu',day:fri+1,h:16,place:'社科院門口',title:'可昕來台大：去社科院門口',travel:'走過去約 10 分鐘',travelH:1/6,back:'回到台大。'}); }
    /* 可昕 K4 第一次視訊一起讀書（BB_95 9-5）：第 16 週週二 20:00 她問（期末前；回覆到 21:45 為止）。「好，九點開。」＝當天 21:00 視訊（ev_kexin_video_study，出遊）；
       「今天不行。」或沒回＝23:00 她傳書桌的照片（沒接也是，ev_kexin_video_study 的 outingMissed）*/
    /* K5「我們的日子」（BB_96 9-3）：大一下第 2 週週一 21:00 她傳；玩家選哪一天（回她的那一句裡接著選方式）。兩樣都選了＝KX_OUR_DAY {day, mode}，排同一週那一天的「第一次」（出遊）；
       那一週那天已經過了＝下週同一天。時間、地點是 AA-B 確認前的提案值（週五 19:00、週六 14:00、週日 14:00；政大小吃街／社科院門口／公館／視訊）。大二以後的固定格：src/kxod3d.js（AA_354）*/
    { const m2=termDay('Y1S2',2,1); if(m2&&F.dating_kexin&&G.day>=m2-1&&G.day<=m2+13){ const th='p:kexin', K=t=>({th,from:'kexin',text:t});
        const MODE=[{t:'我開車去政大。',set:{_kxOM:'nccu'},say:[K('好。我負責選宵夜。')]},{t:'妳來台大。',set:{_kxOM:'ntu'},say:[K('好。我順便看品妤。')]},{t:'約在外面。',set:{_kxOM:'mid'},say:[K('公館、溫州街、河濱，輪流。我坐公車下山。')]},{t:'視訊也算。',set:{_kxOM:'video'},say:[K('算。可是一個月至少見一次面。')]}];
        const DAYS=[['週五晚上。','fri','好，週五。我那天下午沒課。']/* AA_209 附錄B §2 */,['週六。','sat','整天？……好，我不會整天都要。'],['週日下午。','sun','週日下午很好。隔天要上課，我們不會玩太晚。']].map(([t,k,r])=>({t,set:{_kxOD:k},say:[Object.assign(K(r),{ask:{opts:MODE}})]}));
        const L=[K('我們選一天。不是約會日，是「我們的日子」。')];   /* AA_389 第 4 點（企劃線 345234b3）：這一句保留（AA_362 §1）、「名字很重要。」刪、「約在中間。」照 AA_313 第 20 列改「約在外面。」＋「我坐公車下山。」*/ if(F.KX_VDAY_SEE) L.push(K('你情人節說想見我。這個週末我已經空下來了。'));/* AA_209 附錄B §2；AA_373 #10（3/2 傳：第一個週末已經過了） */ Object.assign(L[L.length-1],{ask:{opts:DAYS}});   /* BB_161 ⑰：「我想見妳」多的那一句接在後面（選項掛在最後一則）*/
        if(!PHONE.sent(G,'kx_our_day')) PHONE.at(G,m2,21,L,'kx_our_day');
        if(F._kxOD&&F._kxOM&&!F.KX_OUR_DAY){ F.KX_OUR_DAY={day:F._kxOD,mode:F._kxOM}; delete F._kxOD; delete F._kxOM; }
        const OD=F.KX_OUR_DAY; if(OD&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_our_day1')){ const wd={fri:5,sat:6,sun:7}[OD.day], hh={fri:19,sat:14,sun:14}[OD.day]; let d=termDay('Y1S2',2,wd); if(d!=null&&(G.day>d||(G.day===d&&G.hour>hh))) d=termDay('Y1S2',3,wd);
          const P={nccu:['政大・山下的小吃街','我們的日子：開車去政大','開車約 30 分鐘',0.5],ntu:['社科院門口','我們的日子：她來台大','走過去約 10 分鐘',1/6],mid:['公館','我們的日子：約在公館','騎車約 10 分鐘',1/6],video:['視訊','我們的日子：視訊','',0]}[OD.mode];
          if(d!=null&&P) OUT.plan(G,Object.assign({id:'kx_our_day1',ev:'ev_kexin_our_day',day:d,h:hh,place:P[0],title:P[1],travel:P[2],travelH:P[3]},OD.mode==='video'?{verb:'接起來',no:'今天先不要',back:'視訊結束。'}:{})); } } }
    /* K5 之後每週的「我們的日子」（AA-B 2026-10-16 裁定）：第一次之後，每週那一天排一個可以接受或略過的出遊；見面時一句地點字幕，接著推進她的閒聊階梯（OUT.go），沒有新台詞。
       約在中間＝第一次在公館，之後照她說的「公館、溫州街、河濱」輪流；視訊＝每個月第一個「我們的日子」改成見面（地點照約在中間那一輪）；（K7 週年改到 10/17，AA_224 第 2 組）；
       撞到別的出遊、選了別的＝她說「好，這週換一天。」（ev_kexin_our_day_wk 的 outingMissed）；單純略過沒有台詞、不扣分。只排大一下（大二到大四：src/kxod3d.js，AA_354）*/
    { const OD=F.KX_OUR_DAY, q1=typeof OUT!=='undefined'&&OUT.get(G,'kx_our_day1');
      if(OD&&q1&&q1.state!=='planned'&&F.dating_kexin&&!(typeof MREL!=='undefined'&&MREL.kxOdPaused&&MREL.kxOdPaused(G))){ const wd={fri:5,sat:6,sun:7}[OD.day], hh={fri:19,sat:14,sun:14}[OD.day], T1=CALENDAR.termOf(q1.day);   /* 可昕收回以後回 B＝我們的日子暫停（AA_474 第 3 節）*/
        /* BB_161 ⑭：那一週有她自己的事件就不排固定格、也不傳「換一天」——K8 春假旅行（第 6 週，選了和她開車旅行）、K6 互考（第 8 週）、生日（第 9 週 4/24）。
           已經排好的那一格（例：第 6 週的固定格排好以後才選了春假旅行）改成 skipped，不會過期、不會傳訊息 */
        const herWeek=w=>w===8||w===9||(w===6&&!!OUT.get(G,'kx_trip_y1s2'));   /* K7 週年改到 10/17（大一上），第 4 週不再是她的那一週 */
        const y2=S.termDayIn('Y2S1',1,1); for(const q of OUT.rec(G)) if(/^kx_od_/.test(q.id)&&q.state==='planned'&&(y2==null||q.day<y2)){ const t=CALENDAR.termOf(q.day); if(!t||t.id!=='Y1S2'||herWeek(t.week)) q.state='skipped'; }   /* AA_373 #1：舊存檔已經排在學期以後（6/15 起她在高雄）的那一格也拿掉；只管大二上開學以前的格子（大二以後 src/kxod3d.js、畢業以後 pgdates3d.js 的 kx_od_ 不動：原本全部改成 skipped）*/
        /* AA_373 #1（企劃線 a48fe1b7）：只排到學期的最後一週（第 16 週）；超過學期的日子不排（原本 w<=18，6/15～6/28 還有兩格，可昕那時候在高雄）*/
        for(let w=(T1?T1.week:2)+1,LW=S.termWeeks('Y1S2');w<=LW;w++){ if(herWeek(w)) continue; const d=S.termDayIn('Y1S2',w,wd); if(d==null||d*24+hh<G.day*24+G.hour) continue; const id='kx_od_'+d; if(OUT.get(G,id)) break;
          const mon=CALENDAR.dateOf(d).m, firstOfMonth=!OUT.rec(G).some(q=>/^kx_od_/.test(q.id)&&CALENDAR.dateOf(q.day).m===mon);
          let mode=OD.mode; if(mode==='video'&&firstOfMonth) mode='mid';
          let P; if(mode==='mid'){ const n=F.KX_OD_MID_N==null?(OD.mode==='mid'?1:0):F.KX_OD_MID_N; P=[['gongguan','公館','我們的日子：約在公館','騎車約 10 分鐘',1/6],['wenzhou','溫州街','我們的日子：溫州街','走過去約 10 分鐘',1/6],['river','河濱','我們的日子：河濱','騎車約 15 分鐘',0.25]][n%3]; F.KX_OD_MID_N=n+1; }
          else P={nccu:['nccu','政大・山下的小吃街','我們的日子：開車去政大','開車約 30 分鐘',0.5],ntu:['ntu','社科院門口','我們的日子：她來台大','走過去約 10 分鐘',1/6],video:['video','視訊','我們的日子：視訊','',0]}[mode];
          if(P) OUT.plan(G,Object.assign({id,ev:'ev_kexin_our_day_wk',day:d,h:hh,place:P[1],title:P[2],travel:P[3],travelH:P[4],odPlace:P[0]},P[0]==='video'?{verb:'接起來',no:'今天先不要',back:'視訊結束。'}:{}));
          break; } } }
    /* K6 她第一次因為自己的事改期（BB_96 9-6）：第 7 週週三 21:00 她提兩校互考（回「好」或「視訊可以嗎」，KX_QUIZ_MODE）；第 8 週週四 21:00 改期（三種回應記 K6_RESPONSE）；
       週日 14:00 互考（出遊；時間是 AA-B 確認前的提案值）。沒去：考古題的照片「下次你逃不掉。」（ev_kexin_reschedule 的 outingMissed）。之後改「我們的日子」的回聲等每週固定格（AA-B）*/
    { const w7=termDay('Y1S2',7,3), w8=termDay('Y1S2',8,4), sun=termDay('Y1S2',8,7); if(w7&&w8&&sun&&F.dating_kexin&&G.day>=w7-1&&G.day<=sun+1){ const th='p:kexin', K=t=>({th,from:'kexin',text:t});
        if(!PHONE.sent(G,'kx_quiz_ask')) PHONE.at(G,w7,21,[K('期中前，兩校互考。'),K('只能出老師上課講過的。冷門學說算犯規。'),Object.assign(K('考完去吃山下那攤，我請。下週六下午可以嗎？'),/* AA_209 附錄B §2；AA_373 #25、#26（使用者 10-18：她沒有在跟祐廷比，不寫輸贏；4/8 傳＝下週六 4/18）*/{ask:{opts:[{t:'好。',set:{KX_QUIZ_MODE:'meet'}},{t:'視訊可以嗎？',set:{KX_QUIZ_MODE:'video'}}]}})],'kx_quiz_ask');
        if(!PHONE.sent(G,'kx_k6')) PHONE.at(G,w8,21,[K('對不起，週六可以改週日嗎？'),Object.assign(K('我們讀書會的報告被退回來，週六要重做。'),{ask:{opts:[
          {t:'好，週日。報告加油。',set:{K6_RESPONSE:'understand'},say:[K('好。週日我請一攤，當改期費。')]},{t:'為什麼被退？',set:{K6_RESPONSE:'ask'},say:[K('老師說我們的理由跳太快。……我也覺得。週日跟你說。')]},
          {t:'我週六都空下來了。',set:{K6_RESPONSE:'sulk'},say:[K('……我知道。對不起。週日你多出一題。')]}]}})],'kx_k6');
        if(PHONE.sent(G,'kx_k6')&&G.day*24+G.hour>=w8*24+21&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_quiz1')){ const v=F.KX_QUIZ_MODE==='video';   /* 改期那則傳出以後才排（那時候已經知道見面還是視訊）*/
          OUT.plan(G,Object.assign({id:'kx_quiz1',ev:'ev_kexin_reschedule',day:sun,h:14,place:v?'視訊':'政大・山下的小吃街',title:v?'可昕的視訊：兩校互考':'兩校互考：開車去政大',travel:v?'':'開車約 30 分鐘',travelH:v?0:0.5},v?{verb:'接起來',no:'今天先不要',back:'視訊結束。'}:{})); } } }
    /* K6b 第一次寫申論題（BB_96 9-7）：第 9 週週三 21:00 她考完民總期中（時間是提案值）；只一次；記 KX_DIR {Y1:'reasons'}（第 10 週以後手機小事「答案被拿去當範例」）*/
    { const w9=termDay('Y1S2',9,3); if(w9&&F.dating_kexin&&G.day>=w9&&G.day<=w9+6&&!PHONE.sent(G,'kx_essay')&&G.day*24+G.hour>=w9*24+21){ const th='p:kexin', K=t=>({th,from:'kexin',text:t});
        PHONE.at(G,w9,21,[K('剛考完。四頁。手好痛。'),Object.assign(K('申論題，就是把理由說給一個不認識你的人聽。'),{ask:{opts:[
          {t:'那妳說給誰聽？',say:[K('改考卷的老師。他不認識我。……寫完的時候，我覺得他懂了。')]},{t:'我也是這學期才發現。',say:[K('那我們發現得一樣晚。')]},{t:'四頁？',say:[K('老師說兩頁就夠。我停不下來。')]}]}})],'kx_essay');
        F.KX_DIR=Object.assign({},F.KX_DIR||{},{Y1:'reasons'}); } }
    /* K7 交往週年（BB_96 9-4；日子 AA_224 第 2 組＋AA-C 2026-10-17 Q1）：每年 10/17，第一年 2025-10-17（五）。前一週同一天 10/10 21:00 她傳「下禮拜五是我們的週年。」、玩家選地點（KX_ANNIV_PLACE）；
       當天 18:30 出遊（她政大下課過來），前一晚 21:00 起選準備的東西（K7_GIFT）。第二～四年在下面（AA_224 2-c）。
       沒選地點、沒去、婉拒＝當晚卡片的照片「週年快樂。下次你準備。」，記 KX_ANNIV {1:'missed'}（ev_kexin_anniversary_y1 的 outingMissed）*/
    { const a1=S.dayOfKey(S.KX_ANNIV_DAY), a0=a1!=null?a1-7:null; if(a0!=null&&F.dating_kexin&&G.day>=a0-1&&G.day<=a1+1){ const th='p:kexin', K=t=>({th,from:'kexin',text:t});
        if(!PHONE.sent(G,'kx_anniv_ask')) PHONE.at(G,a0,21,[K('下禮拜五是我們的週年。'),Object.assign(K('地點你選。我準備一樣東西，你也準備一樣。'),{ask:{until:a1*24+18.5,opts:kxAnnivPlaceOpts(F,K,'KX_ANNIV_PLACE')}})],'kx_anniv_ask');
        const AP=F.KX_ANNIV_PLACE; if(AP&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_anniv1')){ const P=KX_ANNIV_PLACE[AP];
          OUT.plan(G,{id:'kx_anniv1',ev:'ev_kexin_anniversary_y1',day:a1,h:18.5,place:P[0],title:P[1],travel:P[2],travelH:P[3]}); }
        if(!AP&&G.day*24+G.hour>=a1*24+19.5&&!(F.KX_ANNIV&&F.KX_ANNIV[1])){ F.KX_ANNIV=Object.assign({},F.KX_ANNIV||{},{1:'missed'}); S.kxAnnivMissed(G,1,a1); } } }   /* AA_313 第 2 節第 10 列：沒選地點＝當晚 21:00 她打來、照片隔天中午 */
    /* K7 第二～四年（AA_224 2-c，AA-C ff3f2a4b）：每年 10/17、還在交往中才有；結構同第一年（前一週同一天 21:00 邀約、前一晚 21:00 起選準備的東西、當天 18:30；禮物四選一照第一年；卡片換句，ev_kexin_anniversary_yn）。
       旗標一年一組：地點 KX_ANNIV_PLACE_n、準備的東西 K7_GIFT_n、結果 KX_ANNIV[n]（地點／'missed'／'video'）。
       第二年 2026-10-17（六）她選地方＝政大山下（訊息送出就定）；第三年 2027-10-17（日）、第四年 2028-10-17（二）三個地點照第一年（選項與她的回覆同第一年）、沒選＝和第一年一樣卡片的照片。
       第四年祐廷在美國（交換路線 US、那天在國外）＝她晚上九點打視訊（ev_kexin_anniversary_video）、不選地點與禮物：台灣 21:00＝當地早上 09:00（AA_340 S8，S.tzOffset）*/
    for(const n of [2,3,4,5,6]){ const an=S.dayOfKey(S.KX_ANNIV_DAYS[n]); if(an==null||!F.dating_kexin||G.day<an-8||G.day>an+1||(F.KX_ANNIV&&F.KX_ANNIV[n])) continue;   /* 第五年 2029-10-17（三）（AA_357 3-2）：前一週 10/10 21:00 她問，其他照第 2～4 年 */
      if(n===6&&!S.kxAnniv6On(G)) continue;   /* 第六年 2030-10-17（四）（AA_472 第 3 節）：第五年有演到的才有 */
      const th='p:kexin', K=t=>({th,from:'kexin',text:t}), key='KX_ANNIV_PLACE_'+n;
      if(S.kxAnnivVideo(G,n)){ if(typeof OUT!=='undefined'){ const q=OUT.get(G,'kx_anniv4v'); if(!q) OUT.plan(G,{id:'kx_anniv4v',ev:'ev_kexin_anniversary_video',day:an,h:21+(S.tzOffset(G,an)||0),year:n,place:'視訊',title:'可昕的視訊：週年',verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊結束。',alarm:true}); else if(q.state==='planned'&&!q.alarm) q.alarm=true; } continue; }   /* alarm：當地早上 09:00，睡覺會停在 08:30（BB 14:45：沒有 alarm＝照常睡到中午就錯過；舊存檔已經排好的補上）*/
      if(n===2){ if(!PHONE.sent(G,'kx_anniv_ask2')) PHONE.at(G,an-7,21,[K('下禮拜六週年。這次我選地方。')],'kx_anniv_ask2'); if(!F[key]&&G.day*24+G.hour>=(an-7)*24+21) F[key]='shop'; }
      else if(n===5){ if(!PHONE.sent(G,'kx_anniv_ask5')) PHONE.at(G,an-7,21,[K('下禮拜三。第五年。'),Object.assign(K('……地點你選。我那天下午有空。'),{ask:{until:an*24+18.5,opts:kxAnnivPlaceOpts(F,K,key)}})],'kx_anniv_ask5'); }   /* AA_357 3-2 */
      else if(n===6){ if(!PHONE.sent(G,'kx_anniv_ask6')) PHONE.at(G,an-7,21,[K('十七號晚上，老時間。'),K('……卡片記得帶。')],'kx_anniv_ask6');   /* AA_476 A-3（企劃線 6ad997806）：前一週 10/10（四）21:00 她私訊兩則，不用回、不寫地點 */
        if(!F[key]&&G.day*24+G.hour>=(an-7)*24+21) F[key]=S.kxAnniv6Place(G); }   /* AA_472 第 3 節：地點照 KX_ANNIV_PLACE_6，沒有就照第五年的地點；10/10 21:00 起排（排進行程照現在）*/
      else if(!PHONE.sent(G,'kx_anniv_ask'+n)) PHONE.at(G,an-7,21,[Object.assign(K(n===3?'下禮拜天。第三年。地點你選。':'下禮拜二。第四年。……平日也要過。'),{ask:{until:an*24+18.5,opts:kxAnnivPlaceOpts(F,K,key)}})],'kx_anniv_ask'+n);
      const AP=F[key]; if(AP&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_anniv'+n)){ const P=KX_ANNIV_PLACE[AP]; OUT.plan(G,{id:'kx_anniv'+n,ev:'ev_kexin_anniversary_yn',day:an,h:18.5,year:n,ap:AP,place:P[0],title:P[1],travel:P[2],travelH:P[3]}); }
      if(!AP&&G.day*24+G.hour>=an*24+19.5){ F.KX_ANNIV=Object.assign({},F.KX_ANNIV||{},{[n]:'missed'}); S.kxAnnivMissed(G,n,an); } }   /* AA_313 第 2 節第 36 列：同第一年 */
    /* 情人節（BB_96 9-1，寒假，各自在家）：2/14 20:00 她打視訊來（出遊系統「接起來」；在臺北的家也會問，home3d.js）；沒接＝窗戶的照片（outingMissed）*/
    { const vd=S.dayOfKey('2026-02-14'); if(vd&&F.dating_kexin&&G.day>=vd-7&&G.day<=vd&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_vday1')) OUT.plan(G,{id:'kx_vday1',ev:'ev_kexin_valentine_y1',day:vd,h:20,place:'視訊',title:'可昕的視訊：情人節',verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊結束。'}); }
    { const d=termDay('Y1S1',16,2);   /* 可昕的視訊一起讀書：期末考週（第 16 週週二 12/16），期末相關照留（AA_243 #69）*/
      if(d&&F.dating_kexin&&G.day<=d&&G.day>=d-7&&!PHONE.sent(G,'kx_video_ask')) PHONE.at(G,d,20,[{th:'p:kexin',from:'kexin',text:'要不要視訊一起讀書？各讀各的。我每半小時會吵你一次，你可以不理我。',
        ask:{until:d*24+21.75,opts:[{t:'好，九點開。',set:{KX_VIDEO:'yes'},say:[{from:'kexin',text:'好。我先把書排好。'}]},{t:'今天不行。',set:{KX_VIDEO:'no'},say:[{from:'kexin',text:'好。我自己讀，讀完傳照片給你。'}]}]}}],'kx_video_ask');
      if(d&&F.KX_VIDEO==='yes'&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_video')) OUT.plan(G,{id:'kx_video',ev:'ev_kexin_video_study',day:d,h:21,place:'視訊',title:'可昕的視訊：一起讀書',verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊結束。'});
      if(d&&PHONE.sent(G,'kx_video_ask')&&!F.KX_VIDEO&&G.day*24+h(G)>=d*24+21.75) F.KX_VIDEO='none';
      if(d&&(F.KX_VIDEO==='no'||F.KX_VIDEO==='none')) PHONE.at(G,d,23,KX_DESK_PHOTO,'kx_video_photo'); }
    /* 第一份報告交出去的晚上（BB_95 9-6 改版，2026-10-15 BB-B；AA_140 G01：生日改 4/24）：12/3（第 14 週週三）。不再跳「今天是可昕的生日」。
       前一晚 21:00 她傳「明天交第一份期末報告。交完我要去山下那一家。一個人吃好像有點悲壯。」；當天她的對話串多一則「祐廷的草稿」（「交出去了嗎？」23:59 前可以傳，
       她回「交了。……今天可以早點睡了。」）；18:00 出遊提示「開車去政大」（ev_kexin_birthday_y1，id 不改）。都沒做：那晚 22:30 她傳
       「一個人吃了。很好吃。下次你要來。」，不扣分、不記仇（酸辣湯餃的照片在 23:30 她貼的動態裡，FEED kx6）。過了那一天記 KX_DEC3:{1:'visit'|'message'|'none'}（不再寫 KX_BDAY；舊存檔讀檔時搬，game3d.js migrate）*/
    { const bd=termDay('Y1S1',14,3);
      if(bd&&F.dating_kexin&&G.day>=bd-1&&G.day<=bd&&!(G.day===bd-1&&h(G)<21)&&!PHONE.sent(G,'kx_dec3_eve')) PHONE.at(G,bd-1,21,[{th:'p:kexin',from:'kexin',text:'明天交第一份期末報告。交完我要去山下那一家。一個人吃好像有點悲壯。'}],'kx_dec3_eve');
      if(bd&&F.dating_kexin&&G.day===bd){
        if(!PHONE.sent(G,'kx_dec3_draft')) PHONE.at(G,bd,Math.max(6,h(G)),[{th:'p:kexin',from:'player',who:null,text:'（草稿）',
          ask:{until:bd*24+24,opts:[{t:'交出去了嗎？',set:{KX_DEC3_MSG:true},say:[{from:'kexin',text:'交了。……今天可以早點睡了。'}]}]}}],'kx_dec3_draft');
        if(typeof OUT!=='undefined'&&!OUT.get(G,'kx_bday')) OUT.plan(G,{id:'kx_bday',ev:'ev_kexin_birthday_y1',day:bd,h:18.75,place:'政大',title:'開車去政大',travel:'開車約 30 分鐘',travelH:0.5});
        if(h(G)>=22.5&&!F.KX_DEC3_VISIT&&!F.KX_DEC3_MSG&&!PHONE.sent(G,'kx_dec3_none')) PHONE.at(G,bd,22.5,[{th:'p:kexin',from:'kexin',text:'一個人吃了。很好吃。下次你要來。'}],'kx_dec3_none'); }   /* 酸辣湯餃的照片（原本這一則的第一張）：AA_503 9-3 改成可昕的動態第 6 則，一定出（12/3 23:30 交完報告那晚，分沒去／去了兩個版本，src/data/feed_y1s1.js kx6；d13ab3ab7 第 12 節第 2、3 點）；私訊這一句照舊 */
      if(bd&&F.dating_kexin&&G.day>bd&&G.day<=bd+7&&!(F.KX_DEC3&&F.KX_DEC3[1])){ const v=F.KX_DEC3_VISIT?'visit':(F.KX_DEC3_MSG?'message':'none'); F.KX_DEC3=Object.assign({},F.KX_DEC3||{},{1:v}); } }
    /* 可昕的生日（BB_96 9-7b；4/24 大一下第 9 週週五；AA_140 G01）：早上行事曆「可昕生日」（祐廷自己記的）；草稿「生日快樂。」（23:59 前，她回「謝謝。今天換你說一件好笑的事給我聽。」；AA_459 第 5 節原本是「收到。」）；
       18:00 出遊提示（ev_kexin_birthday_y1s2）。過了那一天：去過＝visit、只傳訊息＝message、都沒做＝none＋隔天早上她只傳「我等了一天。」（一次，之後照常）。KX_BDAY:{1:…}（BB_107：每年一筆；大一的記在這一天）。
       之後幾年的 4/24：大二下第 9 週、大三下第 11 週、大四下第 10 週（AA_140 G01），跟著 v3～v5 做 */
    { const bd=termDay('Y1S2',9,5);
      if(bd&&F.dating_kexin&&G.day===bd){
        if(h(G)>=6&&!F.kxBdayCal){ F.kxBdayCal=1; if(GM.toast) GM.toast('行事曆：可昕生日',5200); }
        if(!PHONE.sent(G,'kx_bday_draft')) PHONE.at(G,bd,Math.max(6,h(G)),[{th:'p:kexin',from:'player',who:null,text:'（草稿）',
          ask:{until:bd*24+24,opts:[{t:'生日快樂。',set:{KX_BDAY_MSG:true},say:[{from:'kexin',text:'謝謝。今天換你說一件好笑的事給我聽。'}]/* AA_459 第 5 節：「收到。」是學姊在家族群組的招牌，可昕不用 */}]}}],'kx_bday_draft');
        if(typeof OUT!=='undefined'&&!OUT.get(G,'kx_bday_y1s2')) OUT.plan(G,{id:'kx_bday_y1s2',ev:'ev_kexin_birthday_y1s2',day:bd,h:18.75,place:'政大',title:'可昕的生日：開車去政大',travel:'開車約 30 分鐘',travelH:0.5}); }
      if(bd&&F.dating_kexin&&G.day>bd&&G.day<=bd+7&&!(F.KX_BDAY&&F.KX_BDAY[1])){ const v=F.KX_BDAY_VISIT?'visit':(F.KX_BDAY_MSG?'message':'none'); F.KX_BDAY=Object.assign({},F.KX_BDAY||{},{1:v});
        if(v==='none') PHONE.at(G,bd+1,8,[{th:'p:kexin',from:'kexin',text:'我等了一天。'}],'kx_bday_none'); } }
    /* 颱風假 T1b「照常上課的喜劇」（BB_110 第 2 節、交付清單 B3）：颱風假（calendar.js 的 TYPHOON：第 7 週週一，憲法（上）那天）前一晚 20:30 新聞通知「明天停止上班上課。」、21:00 張教授的信（通知），
       21:20 起麵店團群組（那天以前就在群組裡的玩家）：阿哲、Alison、柏翰、阿哲；最後一則可以回三種（到颱風假當天 24:00）。睡著、跳過時間的玩家照原本的時間補收（PHONE.at）。
       AA 角色的台詞（阿哲、Alison、柏翰）照 BB_110，AA 可以改 */
    { const ty=termDay('Y1S1',7,1); if(ty&&typeof CALENDAR!=='undefined'&&CALENDAR.typhoon(ty)&&G.day>=ty-1&&G.day<=ty){ const eve=ty-1;
        if(!PHONE.sent(G,'ty1_news')) PHONE.at(G,eve,20.5,[{th:'sys',name:'新聞',text:'明天停止上班上課。'}],'ty1_news');   /* 前一晚市政府宣布（BB 2026-10-14 照 AA 建議加）：沒有群組的玩家也收得到 */
        if(!PHONE.sent(G,'ty1_mail')) PHONE.at(G,eve,21,[{th:'sys',from:'prof_zhang',name:'張教授（信）',text:'明日停課。附件為明日進度的講義，共四十二頁，請自行閱讀。'}],'ty1_mail');
        const gj=PHONE.inGroup(G,'noodle_team')&&PHONE.rec(G).groups.noodle_team; if(gj&&gj.day<=eve&&!PHONE.sent(G,'ty1_g4')){ const T='g:noodle_team';
          PHONE.at(G,eve,21+20/60,[{th:T,from:'zhe',text:'四十二頁 颱風比較仁慈'}],'ty1_g1');
          PHONE.at(G,eve,21+24/60,[{th:T,from:'yu',text:'我讀完第一頁了。第一頁是目錄。'}],'ty1_g2');
          PHONE.at(G,eve,21+31/60,[{th:T,from:'classmate_bohan',text:'我讀到第十二頁。'}],'ty1_g3');
          PHONE.at(G,eve,21+32/60,[{th:T,from:'zhe',text:'……你是颱風嗎？',ask:{until:ty*24+24,opts:[
            {t:'「我讀到第三頁。」',post:'我讀到第三頁。',set:{TY1_REPLY:'page3'},say:[{from:'classmate_bohan',text:'很好。'}]},
            {t:'「我在吃泡麵。」',post:'我在吃泡麵。',set:{TY1_REPLY:'noodle'},say:[{from:'zhe',text:'這才是正確的颱風假'}]},
            {t:'（貼一張颱風的貼圖）',post:'🌀（颱風的貼圖）',set:{TY1_REPLY:'sticker'},say:[{from:'yu',text:'這張貼圖比講義有用。'}]}]}}],'ty1_g4'); } } }
    /* 聖誕交換禮物（A20、AA_71 2-6）：阿哲在麵店團群組揪（12/22（一）21:00；之後才加入群組的，加入時看到）。活動本身是 ev_xmas_exchange（12/24（三）18:30 麵店，AA_204 第 1 節）*/
    { const mon=S.dayOfKey('2025-12-22'); if(mon&&PHONE.inGroup(G,'noodle_team')&&G.day>=mon&&(G.day<mon+2||(G.day===mon+2&&h(G)<12+10/60))&&!PHONE.sent(G,'xmas_ask')){ const late=G.day>mon||h(G)>=21;
        PHONE.at(G,late?G.day:mon,late?h(G):21,[{th:'g:noodle_team',from:'zhe',text:'聖誕交換禮物，週三晚上六點半，麵店 一百五以內'}],'xmas_ask'); } }   /* AA_204 1-2（16 週制：12/22 是寒假第一天，聖誕改 12/24 18:30 麵店）*/
    { const xd=S.dayOfKey('2025-12-24'); if(xd!=null&&PHONE.inGroup(G,'noodle_team')&&PHONE.sent(G,'xmas_ask')&&typeof OUT!=='undefined'&&!OUT.get(G,'xmas_y1')&&!(G.events&&G.events.done&&G.events.done.ev_xmas_exchange)&&(G.day<xd||(G.day===xd&&h(G)<18.75))) OUT.plan(G,{id:'xmas_y1',ev:'ev_xmas_exchange',day:xd,h:18.5,late:0.25,place:'阿鳳麵店',title:'聖誕交換禮物',travel:'走過去約 10 分鐘',travelH:1/6}); }   /* AA_204 1-1：照出遊，15 分鐘沒到＝沒去 */
    /* 週二晚上的第二則提醒（AA-B 10-16，AA_160 3-4 B）：22:00 Alison、22:02 阿哲、22:03 Alison；條件和 xmas_ask 一樣（在群組、還沒演）；之後才加入的在加入時看到。書店真的開到 22:30 */
    { const mon=S.dayOfKey('2025-12-22'), tue=mon!=null?mon+1:null; if(tue!=null&&PHONE.inGroup(G,'noodle_team')&&!(G.events&&G.events.done&&G.events.done.ev_xmas_exchange)&&(G.day>tue||(G.day===tue&&h(G)>=22))&&(G.day<tue+1||(G.day===tue+1&&h(G)<18.5))&&!PHONE.sent(G,'xmas_eve1')){ const late=G.day>tue||h(G)>=22.1;
        const d0=late?G.day:tue, t0=late?h(G):22; PHONE.at(G,d0,t0,[{th:'g:noodle_team',from:'yu',text:'明天晚上六點半麵店！禮物記得包起來。'}],'xmas_eve1');   /* AA_204 1-2 */ PHONE.at(G,d0,t0+2/60,[{th:'g:noodle_team',from:'zhe',text:'我還沒買'}],'xmas_eve2'); PHONE.at(G,d0,t0+3/60,[{th:'g:noodle_team',from:'yu',text:'……書店開到十點半。'}],'xmas_eve3'); } }
    { const wed=S.dayOfKey('2025-12-24'); if(wed&&G.day===wed&&h(G)>=12&&h(G)<18.5&&PHONE.inGroup(G,'noodle_team')&&!(G.events&&G.events.done&&G.events.done.ev_xmas_exchange)){ const D=G.daily||(G.daily={}); if(D.xmasToast!==wed){ D.xmasToast=wed; GM.toast('今天 18:30：聖誕交換禮物（麵店）',4800); } } }   /* AA_204 1-2 */   /* 當天 12:00 一則提醒（AA_160 3-4 B）*/
    /* 跨年（A21、BB_95 9-7）：一週前（12/24（三）21:00）可昕問；KX_NYE_PICK 換成 KX_NYE:{1:…}（每年一筆）；12/31 排出遊：河堤 23:30（開車）、頂樓 23:45（走上去）；
       沒有回她、在麵店團群組的玩家：頂樓（AA 的群戲，沒有視訊）。河堤回來的路上（00:12）麵店團群組：頂樓的照片＋阿哲「我們就說有看到」*/
    { const nye=S.dayOfKey('2025-12-31');   /* AA_243 G3：節日用日期 */
      if(nye&&F.dating_kexin&&!PHONE.sent(G,'kx_nye_ask')&&G.day<=nye&&G.day>=nye-7) PHONE.at(G,nye-7,21,[{th:'p:kexin',from:'kexin',text:'跨年要不要來高雄？這邊河邊人比較少。',ask:{opts:[{t:'好。',set:{KX_NYE_PICK:'river'}},{t:'我想在臺北跟麵店團跨年。',set:{KX_NYE_PICK:'roof'},say:[{from:'kexin',text:'好。那你幫我跟阿哲說新年快樂。'}]}]}}],'kx_nye_ask');
      if(F.KX_NYE_PICK){ F.KX_NYE=Object.assign({},F.KX_NYE||{},{1:F.KX_NYE_PICK}); delete F.KX_NYE_PICK; }
      const pick=F.KX_NYE&&F.KX_NYE[1];
      /* AA_204 第 2 節（27711a39）、AA_197 1-5：12/26（五）21:00 阿哲揪（麵店團群組；不在群組、和阿哲 FAMILIAR 以上＝私訊）；我去＝19:00 麵店，直接到頂樓／再看看＝23:40 頂樓 */
      { const d26=S.dayOfKey('2025-12-26'), inG=PHONE.inGroup(G,'noodle_team'), win=d26!=null&&nye&&G.day>=d26&&G.day<=nye, zf=win&&!inG&&typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&S.knows('zhe',G)&&SOCIAL.STAGES.indexOf(SOCIAL.stage('zhe'))>=SOCIAL.STAGES.indexOf('FAMILIAR'), th=inG?'g:noodle_team':'p:zhe';   /* 只在 12/26～12/31 才看熟悉度（SOCIAL.stage 會建立關係紀錄）*/
        if(win&&(inG||zf)&&G.day>=d26&&G.day<=nye&&(G.day>d26||h(G)>=21)&&!PHONE.sent(G,'nye_y1_ask')) PHONE.at(G,d26,21,[{th,from:'zhe',text:'跨年有人要一起嗎'},{th,from:'zhe',text:'宿委會說頂樓會開 訪客一樓登記，十二點半前要走'},{th,from:'zhe',text:'先吃飯，再去看煙火',ask:{id:'nye_y1_ask',until:nye*24+19,opts:[{t:'我去',set:{NYE_ASK:'go'}},{t:'我直接到頂樓',set:{NYE_ASK:'roof'}},{t:'再看看',set:{NYE_ASK:'maybe'}}]}}],'nye_y1_ask'); }   /* 宿委會那一句照年份：大一「宿委會說頂樓會開。」（AA_456 1-1，企劃線 71f260ecc；大二照 AA_210 原句，大三、大四在 S.nyeY3、S.nyeY4）*/
      if(nye&&typeof OUT!=='undefined'&&!OUT.get(G,'nye')&&G.day===nye){
        const asked=PHONE.sent(G,'nye_y1_ask');
        if(pick==='river') OUT.plan(G,{id:'nye',ev:'ev_nye_river',day:nye,h:23.5,place:'高雄・愛河邊',title:'去高雄跨年（高鐵約一個半小時）',travel:'高鐵約一個半小時',travelH:1.5,back:'回到臺北。'});   /* AA_276 第 3 節第 1 點：寒假她在高雄，改成祐廷去高雄跨年 */
        else if(F.NYE_ASK==='go'&&h(G)<19.25) OUT.plan(G,{id:'nye',ev:'ev_nye_dinner',day:nye,h:19,late:0.25,place:'阿鳳麵店',title:'跨年：先吃飯（麵店）',travel:'走過去約 15 分鐘',travelH:0.25,back:'回到房間。'});
        else if(pick==='roof'||asked) OUT.plan(G,{id:'nye',ev:'ev_nye_roof',day:nye,h:23+40/60,place:'宿舍頂樓',title:'跨年：宿舍頂樓',travel:'',travelH:0,back:'回到房間。'}); }
      /* 2-4、1-5：00:12 群組；00:0x 芯慈、以安、語彤；1/1 Alison、阿哲 */
      if(nye&&G.day>=nye&&G.day<=nye+2&&PHONE.inGroup(G,'noodle_team')){ const T='g:noodle_team', after=G.day>nye||G.hour>=24;   /* 過了午夜：G.hour 是 24 以上（h() 會取餘數）*/
        if(F.NYE_Y1==='roof') PHONE.at(G,nye,24.2,[{th:T,from:'yu',text:'📷（頂樓的合照）'},{th:T,from:'yu',text:'上半截的煙火🎆'}].concat(F.NYE_Y1_PHOTO?[{th:T,from:'player',who:null,text:'📷（一片黑，和一點點亮的地方）'},{th:T,from:'zhe',text:'這張好黑'}]:[]),'nye_roof_photo');
        else if(after) PHONE.at(G,nye,24.2,[{th:T,from:'zhe',text:'📷（宿舍頂樓，遠遠的煙火）'},{th:T,from:'zhe',text:'我們就說有看到'}],'nye_roof_photo');
        if(after&&typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has('classmate_xinci','FIRST_MET')) PHONE.at(G,nye,24+5/60,[{th:T,from:'classmate_xinci',text:'新年快樂。我在家看電視倒數。'}],'nye_xc_y1');
        if(G.day>nye&&h(G)>=9) PHONE.at(G,nye+1,9,[{th:T,from:'yu',text:'📷（頂樓的照片）'},{th:T,from:'yu',text:'昨天的。好冷。'}],'nye_yu_y1');
        if(G.day>nye&&h(G)>=20) PHONE.at(G,nye+1,20,[{th:T,from:'zhe',text:'我明天回高雄，寒假一樣揪喔'}],'nye_zhe_y1'); }
      if(nye&&(G.day>nye||(G.day===nye&&G.hour>=24))&&G.day<=nye+2&&typeof SOCIAL!=='undefined'&&SOCIAL.STAGES){ const fam=id=>SOCIAL.has&&SOCIAL.has(id,'FIRST_MET')&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf('FAMILIAR');
        const anRoof=!!F.dating_heroine_01||(SOCIAL.has&&SOCIAL.has('heroine_01','FIRST_MET')&&SOCIAL.STAGES.indexOf(SOCIAL.stage('heroine_01'))>=SOCIAL.STAGES.indexOf('FRIEND'));   /* 以安 FRIEND 以上才上頂樓（events.js NYE_AN）*/
        if(!anRoof&&fam('heroine_01')) PHONE.at(G,nye,24+6/60,[{th:'p:heroine_01',from:'heroine_01',text:'新年快樂。'}],'nye_an_y1');   /* 她沒上頂樓的話（1-5）*/
        if(fam('heroine_03')&&!F.dating_heroine_03) PHONE.at(G,nye,24+7/60,[{th:'p:heroine_03',from:'heroine_03',text:'新年快樂。'},{th:'p:heroine_03',from:'heroine_03',text:'📷（家裡的電視在播倒數）'}],'nye_yt_y1'); }
      /* 和語彤交往中、不在頂樓（2-5）：00:01 她打電話來（出遊系統的「接起來」）*/
      if(nye&&F.dating_heroine_03&&typeof OUT!=='undefined'&&G.day===nye&&h(G)>=23.5&&!OUT.get(G,'yt_nye_call_y1')&&F.NYE_Y1!=='roof'&&!(OUT.get(G,'nye')&&OUT.get(G,'nye').state==='planned'&&OUT.get(G,'nye').ev!=='ev_nye_river'))
        OUT.plan(G,{id:'yt_nye_call_y1',ev:'ev_yt_nye_call_y1',day:nye+1,h:1/60,place:'電話',title:'語彤打電話來',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'電話掛了。'}); }
    /* 12/29 海邊一日遊（AA_204 第 3 節、AA_199 VA-03）：12/26 21:05 起麵店團群組；以安和她 FAMILIAR 以上才回、才去；我去＝12/29 08:50 臺北車站（出遊）；當晚群組 */
    { const d26=S.dayOfKey('2025-12-26'), d29=S.dayOfKey('2025-12-29'); if(d26!=null&&d29!=null&&G.day>=d26&&G.day<=d29+1&&PHONE.inGroup(G,'noodle_team')){ const T='g:noodle_team', anF=typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&SOCIAL.has&&SOCIAL.has('heroine_01','FIRST_MET')&&SOCIAL.STAGES.indexOf(SOCIAL.stage('heroine_01'))>=SOCIAL.STAGES.indexOf('FAMILIAR');
        if(G.day>=d26&&G.day<d29&&(G.day>d26||h(G)>=21+5/60)&&!PHONE.sent(G,'va03_ask')){ const ask={id:'va03_ask',until:d29*24+8.5,opts:[{t:'我去',set:{VA03_GO:true}},{t:'我那天不行',set:{VA03_GO:false}}]};
          const L=[{th:T,from:'zhe',text:'29 號去海邊？我 2 號就回高雄了',h:21+5/60},{th:T,from:'yu',text:'冬天去海邊？？',h:21.1},{th:T,from:'yu',text:'好啊',h:21.1},{th:T,from:'classmate_bohan',text:'火車九點十分有一班。',h:21+10/60},{th:T,from:'classmate_xinci',text:'我怕冷，我不去了。你們拍照。',h:21.5}];
          if(anF) L.push({th:T,from:'heroine_01',text:'我可以。幾點集合？',h:21+40/60}); Object.assign(L[L.length-1],{ask}); if(anF) G.flags.VA03_AN=true;
          for(const m of L){ const hh=m.h; delete m.h; PHONE.at(G,d26,hh,[m],m===L[L.length-1]?'va03_ask':'va03_'+L.indexOf(m)); } }
        if(G.flags.VA03_GO===true&&typeof OUT!=='undefined'&&!OUT.get(G,'va03')&&G.day<=d29) OUT.plan(G,{id:'va03',ev:'ev_va03_beach',day:d29,h:8+50/60,late:0.25,place:'臺北車站',title:'海邊一日遊（臺北車站集合）',travel:'捷運約 20 分鐘',travelH:1/3,back:'回到臺北。'});
        if(G.day===d29&&h(G)>=18&&G.flags.VA03_BEACH!=='went'&&!PHONE.sent(G,'va03_none')) PHONE.at(G,d29,18,[{th:T,from:'yu',text:'📷（灰色的海）'},{th:T,from:'yu',text:'好冷但好好玩'},{th:T,from:'classmate_xinci',text:'看起來好冷。'}],'va03_none');
        if(G.flags.VA03_BEACH==='went'&&!PHONE.sent(G,'va03_photo')){ const at=Math.max(G.day*24+h(G),d29*24+20); PHONE.at(G,Math.floor(at/24),at%24,[{th:T,from:'yu',text:'📷（海邊的合照）'},{th:T,from:'yu',text:'五張裡最好的一張'}].concat(G.flags.VA03_SHOE?[{th:T,from:'zhe',text:'📷（曬在宿舍欄杆上的鞋子）'},{th:T,from:'zhe',text:'鞋子回來了'}]:[]),'va03_photo'); } } }
    /* 返鄉、回臺北（AA_204 第 4 節、AA_199 VA-02）：麵店團群組；以安和她 FAMILIAR 以上＝私訊（不到＝群組只有一句）*/
    { const d0=S.dayOfKey('2026-01-09'), d1=S.dayOfKey('2026-02-24'); if(d0!=null&&d1!=null&&G.day>=d0&&G.day<=d1){ const inG=PHONE.inGroup(G,'noodle_team'), T='g:noodle_team', anF=typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&SOCIAL.has&&SOCIAL.has('heroine_01','FIRST_MET')&&SOCIAL.STAGES.indexOf(SOCIAL.stage('heroine_01'))>=SOCIAL.STAGES.indexOf('FAMILIAR');
      const R=[['2026-01-09',17,'bh_home_y1',[{from:'classmate_bohan',text:'我今天回新竹。2/19 回來。'}]],['2026-02-19',20,'bh_back_y1',[{from:'classmate_bohan',text:'回來了。'}]],['2026-02-20',19,'zhe_back_y1',[{from:'zhe',text:'我回來了！高雄帶了吃的，開學那天拿去給你們'}]]];
      for(const [k,hh,tag,ms] of R){ const d=S.dayOfKey(k); if(inG&&d!=null&&(G.day>d||(G.day===d&&h(G)>=hh))&&G.day<=d+3&&!PHONE.sent(G,tag)) PHONE.at(G,d,hh,ms.map(m=>Object.assign({th:T},m)),tag); }
      for(const [k,hh,tag,ms] of [['2026-01-20',15,'an_home_y1',['回台中了。','📷（車窗外的田）']],['2026-02-21',18,'an_back_y1',['回臺北了。']]]){ const d=S.dayOfKey(k); if(d==null||!(G.day>d||(G.day===d&&h(G)>=hh))||G.day>d+3||PHONE.sent(G,tag)) continue;
        if(anF) PHONE.at(G,d,hh,ms.map(t=>({th:'p:heroine_01',from:'heroine_01',text:t})),tag); else if(inG&&typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has('heroine_01','FIRST_MET')) PHONE.at(G,d,hh,[{th:T,from:'heroine_01',text:ms[0]}],tag); }  } }
    /* 期末成績的約定（BB_95 9-8、BB_107 第 13 節）：期末考週最後一個上課日（1/2 週五）21:00 她傳；兩個回覆都算約好（KX_GRADES_PACT_SET）。
       成績出來那天（寒假第一天的早上，classes3d.js 的 morning）先問「要不要先看自己的成績？」（S.holdGrades）；那天 21:00 視訊一起打開（出遊系統，「接起來」）；
       先看的玩家那天晚上她先傳「你偷看了吧。……」，視訊照樣一起打開。記 KX_GRADES_PACT:'kept'|'peeked'。遊戲不顯示分數（成績單是文字）*/
    { const last=termDay('Y1S1',16,5);   /* 16 週制：期末最後一天 12/19（五）21:00 約、成績公布 1/5 一起看（AA_198 第 2 節第 3 點）；台詞照 AA-C 11:23 改（「一月五號那天一起打開」「等五號一起看」「這次才是真的放假」）*/
      if(last&&F.dating_kexin&&!PHONE.sent(G,'kx_grades_ask')&&G.day<=last+2&&G.day>=last-1) PHONE.at(G,last,21,[{th:'p:kexin',from:'kexin',text:'成績出來先不要給對方看。一月五號那天一起打開。',ask:{opts:[{t:'好。',set:{KX_GRADES_PACT_SET:true}},{t:'我會忍不住。',set:{KX_GRADES_PACT_SET:true},say:[{from:'kexin',text:'那你偷看的時候，表情不要寫在訊息裡。'}]}]}}],'kx_grades_ask');
      if(F.KX_GRADES_PACT==='peeked'&&F.kxGradesDay!=null) PHONE.at(G,F.kxGradesDay,21,[{th:'p:kexin',from:'kexin',text:'你偷看了吧。你今天訊息都只回一個字。'}],'kx_grades_peek'); }
    /* 9-9 期末：成績的約定（大一下版；BB_96 9-9、AA_157 第 2 節、BB_139 第 2 節）＋P4e（BB_105／BB_135 第 3 節）。順序（AA-B 2026-10-16）：
       ① 6/12（五，期末最後一天）21:00 可昕傳約定：大一上 'kept' 或舊存檔沒有旗標＝「這次也一起打開。成績出來那天。」（together；AA_313 第 2 節第 29 列：問句沒有回覆選項，改句號）；'peeked'＝「這次換個方式：各自先看，然後各說一科最滿意的。」（best_one）。記 KX_GRADES_Y1S2。
       ② 6/29（一）10:00 經原（下）成績先公布（P4e；AA-B 02:28：和一起看同一天）：看得到的 11 堂去了 6 堂以上＝旁白「一年前沒拿到的，這次拿到了。」；5 堂以下＝芯慈三句＋「……靠一本借來的筆記拿到了。」。
          交往中才有「傳給可昕」：傳＝長頸鹿貼圖＋together「這一科可以先說。其他的，等全部出來再一起開。」／best_one「這科就是你最滿意的那一科吧。」；不傳、單身＝「你把成績單收進抽屜。」。
       ③ 6/29（一）成績公布那天：together＝早上先問「先看／等到晚上」、21:00 視訊（S.holdGrades、ev_kexin_grades_open_y1s2）；best_one＝21:00 她先說「憲法」再問你一科（P4e 已經傳給她的不問）。
       冷戰（AA_112 第 6 節）還沒有系統：交往中都照上面 */
    { const last=S.dayOfKey('2026-06-12'), K=t=>({th:'p:kexin',from:'kexin',text:t});   /* AA_209 第 4 節／AA_198 第 5 節（AA-B 02:28 確認）：約定 6/12（五，期末最後一天）21:00；P4e、一起看在 6/29 成績公布那天 */
      if(last&&F.dating_kexin&&!PHONE.sent(G,'kx_grades2_ask')&&G.day<=last+2&&G.day>=last-1){ F.KX_GRADES_Y1S2=F.KX_GRADES_PACT==='peeked'?'best_one':'together';
        PHONE.at(G,last,21,[K(F.KX_GRADES_Y1S2==='best_one'?'這次換個方式：各自先看，然後各說一科最滿意的。':'這次也一起打開。成績出來那天。')],'kx_grades2_ask'); }
      const p4d=S.dayOfKey('2026-06-29');   /* P4e 在成績公布那天 10:00（AA-B 02:28：和一起看同一天，晚上 21:00 才一起開其他科）*/
      const took=typeof CLS!=='undefined'&&CLS.termCourses&&CLS.termCourses(G,'Y1S2').some(c=>c.id==='econ_principles_2');
      if(last&&took&&!PHONE.sent(G,'p4e')&&G.day>=p4d&&G.day<=p4d+2){
        const att=(CLS.rec(G).attend||{}).econ_principles_2||0, items=[{th:'sys',text:'經濟學原理（下）的成績公布了。'}], N=t=>({th:'sys',who:null,text:t}), drawer=N('你把成績單收進抽屜。');
        if(att>=6) items.push(N('一年前沒拿到的，這次拿到了。'));
        else { silentContact('classmate_xinci'); const X=t=>({th:'p:classmate_xinci',from:'classmate_xinci',text:t}); items.push(X('過了吧？……我的筆記功不可沒。'),{th:'p:classmate_xinci',from:'player',who:null,text:'請妳吃飯。'},X('兩次。'),N('一年前沒拿到的，這次靠一本借來的筆記拿到了。')); }
        if(F.dating_kexin){ const mode=F.KX_GRADES_Y1S2||'together'; Object.assign(items[items.length-1],{ask:{until:(p4d+2)*24+24,opts:[
            {t:'傳給可昕',post:'（傳給可昕）',set:{KX_P4E:'sent'},say:[{th:'p:kexin',from:'player',who:null,text:'📷（經濟學原理（下）的成績）'},K('（貼圖：長頸鹿）'),K(mode==='best_one'?'這科就是你最滿意的那一科吧。':'這一科可以先說。其他的，等全部出來再一起開。')]},
            {t:'不傳',post:'（不傳）',set:{KX_P4E:'kept'},say:[drawer]}]}}); }
        else items.push(drawer);
        PHONE.at(G,p4d,Math.max(10,G.day===p4d?h(G):10),items,'p4e'); }
      const sum1=CALENDAR.gradeDay('Y1S2');   /* 6/29（一）成績公布那天（AA-B 02:28 確認：一起看、best_one 都在 6/29）*/
      if(sum1&&F.dating_kexin&&F.KX_GRADES_Y1S2==='best_one'&&F.KX_P4E!=='sent'&&G.day>=sum1&&G.day<=sum1+1&&!PHONE.sent(G,'kx_best_one')){
        const cs=CLS.termCourses(G,'Y1S2').filter(c=>c.kind!=='service'), short=c=>c.name.replace(/（.*?）/g,'');
        PHONE.at(G,sum1,21,[K('說好的，各說一科。我先：憲法。老師說我的答案像在寫信。'),Object.assign(K('換你。'),{ask:{until:(sum1+1)*24+24,opts:cs.map(c=>({t:short(c),set:{KX_BEST_ONE_Y1S2:c.id},say:[K(c.id==='econ_principles_2'?'經原？……那一科，我們以前坐在同一間教室。……恭喜。':'「'+short(c)+'」。好，我記下來了。……明年再各說一科。')]}))}})],'kx_best_one'); } }   /* AA_373 第 6-1 節（企劃線 bdab2f42）：「……明年再比一次。」改「……明年再各說一科。」（她沒有在跟你比）；AA_313 第 2 節第 31 列：經原那句「它也替你高興。」（物件擬人化）改「……恭喜。」*/
    /* 方奕廷「學弟好。明天寒流。」（BB_120 1-7c、BB 2026-10-14）：第一波寒流（S.firstColdDay，AA_71 十二月第一波；遊戲還沒有寒流的天氣，先放大一上第 15 週週一）的前一晚 20:30；
       「有點熟」以前、有黃金葛、有他的聯絡方式（前一天以前拿到）*/
    { const cold=S.firstColdDay(); if(cold&&G.day>=cold-2&&G.day<=cold-1&&!PHONE.sent(G,'fy_cold')&&fyEarly(G)&&F.POTHOS) PHONE.at(G,cold-1,20.5,[P1('npc_fangyt','學弟好。明天寒流。黃金葛不要放窗邊。'),P1('npc_fangyt','它怕冷。我也是。',1/60)].map(x=>{ const y=Object.assign({},x); delete y.dt; return y; }),'fy_cold'); }
    /* 以安新 5 的結果（交接包 v2 C8）：第 7 週週五 21:00 還沒在總圖當面聽到＝私訊同樣的話（有她的聯絡方式）；沒遇到的玩家第 7 週週三 21:30 麵店團群組以安一句（聽說；AA_209 附錄A §2 改字）*/
    { const fri=termDay('Y1S2',7,5), wed=termDay('Y1S2',7,3), done=id=>!!(G.events&&G.events.done&&G.events.done[id]);
      if(fri&&G.day===fri&&h(G)<21&&done('ev_an_dorm_appeal')&&!F.AN_APPEAL_RESULT&&!PHONE.sent(G,'an_appeal_result')&&typeof INV!=='undefined'&&INV.hasContact(G,'heroine_01')){ F.AN_APPEAL_RESULT='phone';
        PHONE.at(G,fri,21,[P1('heroine_01','點數減了一點。宿舍說，以後記點以前會先問。'),P1('heroine_01','最後用的是第二份，寫規定沒考慮到急診這種情況。')].concat(F.AN_APPEAL==='ask'?[P1('heroine_01','你說要先問清楚的那句，我放在第一段了。')]:[]).map(x=>{ const y=Object.assign({},x); delete y.dt; return y; }),'an_appeal_result'); }   /* AA_209 附錄A §2（和 ev_an_dorm_appeal_result 一起換）*/
      if(wed&&G.day>=wed-1&&G.day<=wed&&!done('ev_an_dorm_appeal')&&!PHONE.sent(G,'an_appeal_heard')&&PHONE.inGroup(G,'noodle_team')&&S.knows('heroine_01',G)){
        PHONE.at(G,wed,21.5,[{th:'g:noodle_team',from:'heroine_01',text:'我室友晚歸被記點那個申訴，結果出來了，點數減一點。'}],'an_appeal_heard');/* AA_209 附錄A §2 */ if(typeof SOCIAL!=='undefined'&&SOCIAL.remember&&!SOCIAL.has('heroine_01','HEARD_ABOUT')) SOCIAL.remember('heroine_01','HEARD_ABOUT','室友的申訴結果出來了，點數減一點')/* AA_209 第 8 節第 8 點 */; } }
    /* 寒假拜年（交接包 v2 C3；AA_71 2-8「大一的台詞」，芷若、方奕廷兩則 BB 7451e42 改字）：大一上和大一下之間的春節（S.lunarNewYear＝初一）。只有認識的人：
       麵店團群組初一 11:00 阿哲、以安各一張照片＋拜年，可以回姊姊帶你去吃的牛肉麵（2026-10-14 祐廷改成臺北人，原本是火雞肉飯）或「新年快樂」的貼圖（不回就只是沒回，AA_70 1-9）；
       芷若有點熟以上、有聯絡方式：初一 15:30 私訊（朋友以上多「……我家的。」）；方奕廷有點熟以上、有聯絡方式：初三 15:00 才到（山上沒有訊號），朋友以上隔天公布答案 */
    { const ny=S.lunarNewYear(); if(ny!=null&&G.day>=ny-1&&G.day<=ny+4){ const LV=['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND'], atL=(id,lv)=>LV.indexOf(fl(id))>=LV.indexOf(lv);
      if(PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'cny_noodle')){ const th='g:noodle_team';
        PHONE.at(G,ny,11,[{th,from:'zhe',text:'📷（高雄的夜市，人擠人）'},{th,from:'zhe',text:'新年快樂！高雄沒有冬天'},{th,from:'zhe',text:'你們那邊冷嗎'},{th,from:'heroine_01',text:'📷（台中的老街，一整排紅燈籠）'},
          {th,from:'heroine_01',text:'新年快樂。人太多，只走到第三個路口就回家了。',ask:{id:'cny_noodle_reply',opts:[{t:'（傳姊姊帶你去吃的牛肉麵）',post:'📷（姊姊帶你去吃的牛肉麵）',say:[{from:'zhe',text:'牛肉麵！！看起來好好吃'},{from:'heroine_01',text:'哪一家？……看起來比麵店的辣。'}]},
            {t:'（傳一張「新年快樂」的貼圖）',post:'（貼圖：新年快樂）',say:[{from:'zhe',text:'（貼圖：新年快樂）'}]}]}}],'cny_noodle'); }
      if(atL('heroine_02','FAMILIAR')&&gotBefore(G,'heroine_02')&&!PHONE.sent(G,'cny_zhiruo')){ const th='p:heroine_02';
        PHONE.at(G,ny,15.5,[{th,from:'heroine_02',text:'📷（台中，高中旁邊的影印店，鐵門拉下來，貼著紅紙「初一至初三休息」）'},{th,from:'heroine_02',text:'新年快樂。'},{th,from:'heroine_02',text:atL('heroine_02','FRIEND')?'店休三天。……我家的。':'店休三天。'}],'cny_zhiruo'); }
      if(atL('npc_fangyt','FAMILIAR')&&gotBefore(G,'npc_fangyt')&&!PHONE.sent(G,'cny_fangyt')){ const th='p:npc_fangyt', fr=atL('npc_fangyt','FRIEND'), Y=t=>({th,from:'npc_fangyt',text:t});
        PHONE.at(G,ny+2,15,[Y('📷（山上的雲海和一棵松樹）'),Y('新年快樂。初一拍的，山上沒有訊號。')].concat(fr?[Y('這棵你猜。')]:[Y('台灣二葉松，Pinus taiwanensis。針葉兩根一束。'),Y('山上聽不到鞭炮。很好。')]),'cny_fangyt');
        if(fr) PHONE.at(G,ny+3,10,[Y('答案：台灣二葉松。針葉兩根一束，名字就是提示。')],'cny_fangyt_answer'); } } }
    /* 以安新 7（交接包 v2 C14）：①第 11 週週二晚上沒在麵店看到吵架（ev_an_yu_argument 沒演）＝21:30 Alison 在麵店團群組連發三則（AA_209 附錄A §2），記「聽說」；
       ②公法讀書會的邀請（2026-10-17 改到大一上第 10 週，見下面）*/
    { const thu=termDay('Y1S2',12,4), done=id=>!!(G.events&&G.events.done&&G.events.done[id]), went=thu!=null&&!!(G.acts&&G.acts.att&&G.acts.att['public_law_group@'+thu]);
      if(thu&&G.day>=thu&&G.day<=thu+1&&!(G.day===thu&&h(G)<22)&&!done('ev_an_yu_argument')&&!went&&PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'an_yu_heard')){ const th='g:noodle_team';
        PHONE.at(G,thu,22,[{th,from:'yu',text:'我跟以安吵架了'},{th,from:'yu',text:'不是真的吵啦 是在講上街要不要申請'},{th,from:'yu',text:'柏翰還幫我們計時'}],'an_yu_heard');   /* AA_238 5-4：吵架改到第 12 週週四公法讀書會，那晚 22:00；收到的人＝在麵店團、那晚沒去讀書會（原本第 11 週週二 21:30「講到麵都坨了」）*/
        if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember('heroine_01','HEARD_ABOUT','聽說她和 Alison 吵架了'); }
      /* 邀請改到大一上第 10 週週一 21:00、法律系全班群組（AA_218 17-4；BB_191 §8-1、8-6 第 4 點：她是被全班拱出來的，所有法律系同學都收到）。
         以安那一句照用；Alison「我也是發起人喔。」拿掉（新設定：Alison 是第一個來的，不是發起人）；「被拱出來」照 AA_238 5-1、5-2（下面 20:30 那一串，plg_pushed）。不在全班群組、有以安聯絡方式的＝她私訊同一句 */
      const mon1=termDay('Y1S1',10,1);
      if(mon1&&G.day>=mon1-1&&G.day<=mon1+3&&PHONE.inGroup(G,'law_class')&&!PHONE.sent(G,'plg_invite')){ const th='g:law_class', cls={th,name:'同學'};   /* AA_238 5-1、5-2：那天早上憲法發回期中考；20:30 被全班拱出來、21:00 邀請（沒加班群的玩家開學典禮就會加，原本的私訊備案拿掉）*/
        PHONE.at(G,mon1,20.5,[Object.assign({text:'憲法期中有人知道第三題到底在問什麼嗎'},cls),Object.assign({text:'我到現在還是不知道憲法在幹嘛'},cls),{th,from:'zhe',text:'問沈以安啊 她考超高'},Object.assign({text:'真的假的 以安開課'},cls),{th,from:'heroine_01',text:'……我不是老師。'},{th,from:'heroine_01',text:'可是可以一起讀。'}],'plg_pushed');
        PHONE.at(G,mon1,21,[{th,from:'heroine_01',text:'公法讀書會。週四晚上八點，萬才館研討室。想來的就來，不用報名。'},{th,from:'yu',text:'+1 可以帶宵夜嗎'},{th,from:'heroine_01',text:'……可以。'}],'plg_invite'); } }
    /* B4 博雅午後講座（交接包 v2 C13；BB_105 4-5、AA_115 第 1 節）：①第 11 週週二 12:30 麵店團群組以安揪人（和以安新 7 前半同一天；時間是 LAWWW 排的），Alison、阿哲回；
       玩家回「我去。」／「我看看。」／不回都一樣（只記 B4_REPLY），去不去看週四有沒有走進博雅 101。②沒去（missed:B4）：週四 21:30 Alison 在群組轉述（AA_209 附錄A §2：三則） */
    { const tue=termDay('Y1S2',11,2), thu=termDay('Y1S2',11,4);
      if(tue&&thu&&G.day>=tue-1&&G.day<=thu&&PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'b4_invite')){ const th='g:noodle_team';
        PHONE.at(G,tue,12.5,[{th,from:'heroine_01',text:'週四晚上七點，博雅 101 有演講。'},{th,from:'heroine_01',text:'「政府可以為了大家，限制一個人嗎？」誰要去？'},{th,from:'yu',text:'我！我是憲法迷。'},
          {th,from:'zhe',text:'……我跟 散場有宵夜嗎？',ask:{until:thu*24+19,opts:[{t:'我去。',set:{B4_REPLY:'go'}},{t:'我看看。',set:{B4_REPLY:'maybe'}}]}}],'b4_invite'); }
      if(thu&&G.day>=thu&&G.day<=thu+1&&!(G.day===thu&&h(G)<21.5)&&PHONE.inGroup(G,'noodle_team')&&typeof ACTIVITIES!=='undefined'&&ACTIVITIES.missed(G,'B4')&&!PHONE.sent(G,'b4_missed')){
        PHONE.at(G,thu,21.5,[{th:'g:noodle_team',from:'yu',text:'講者最後問了一題超難的'},{th:'g:noodle_team',from:'yu',text:'被限制的人可以去哪裡'},{th:'g:noodle_team',from:'yu',text:'我們回來的路上一直在吵這個'}],'b4_missed'); } }   /* AA_209 附錄A §2 */
    /* 可玩切片的選擇③——沛珊的那張表（BB_96 3-7；AA_115 第 1 節）：有沛珊聯絡方式的玩家。①第 11 週週二 12:00 她私訊兩句（「好。」＝比 OK 的貼圖；「我不一定會去演講。」＝「那你經過女舍的時候說一聲。」）；
       ②週四 20:40 改約的兩句（所有人都收到；人在女舍門口長椅旁＝events.js 的 ev_peishan_table_bench 三選一）；③等了十分鐘的玩家，隔天 12:00 一則（AA_209 附錄B §2 改字）*/
    { const tue=termDay('Y1S2',11,2), thu=termDay('Y1S2',11,4), th='p:classmate_peishan', ps=t=>({th,from:'classmate_peishan',text:t});
      if(tue&&thu&&typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,'classmate_peishan')){
        if(G.day>=tue-1&&G.day<=thu&&!PHONE.sent(G,'ps_table_ask')) PHONE.at(G,tue,12,[ps('刑總二未遂那一章，我做了一張表，印給大家。'),Object.assign(ps('你的那份，週四演講完，來女舍門口拿？'),{ask:{until:thu*24+20+40/60,opts:[
            {t:'好。',set:{PS_TABLE_REPLY:'ok'},say:[ps('（貼圖：比 OK）')]},{t:'我不一定會去演講。',set:{PS_TABLE_REPLY:'maybe'},say:[ps('那你經過女舍的時候說一聲。')]}]}})],'ps_table_ask');
        if(G.day>=thu&&G.day<=thu+1&&!(G.day===thu&&h(G)<20+40/60)&&!PHONE.sent(G,'ps_table_cancel')) PHONE.at(G,thu,20+40/60,[ps('對不起。課輔班的作業還沒改完，明天要發回去。'),ps('今天下不去了。')],'ps_table_cancel');
        if(F.PS_CANCEL==='waited'&&G.day>=thu+1&&G.day<=thu+3&&!PHONE.sent(G,'ps_table_waited')) PHONE.at(G,Math.max(thu+1,G.day),G.day>thu+1?G.hour+0.05:12,[ps('上次謝謝你等。下次我會早點講。')]/* AA_209 第 8 節第 5 點（可能晚兩、三天才補發，「昨天」改「上次」）*/,'ps_table_waited'); } }
    /* 法律系的班級群組 law_class（AA_140 第 4 節 B10；台詞歸 BB-B）：會說話的只有同班（阿哲、Alison、柏翰、明軒、芯慈、宥辰、沛珊、以安）；只在事件或手機小事指定時出現、不隨機洗版；玩家不能自由發言，只在選項裡回。
       加入的時間、名稱照 AA_177 第 9 節（下面「法律系（全班）」那一段；原本照年級改名「法律系 大一（全班）」→ 大二…，2026-10-16 改成四年同一個名字）*/
    /* 經濟系那群的群組「走啦」econ_friends（AA_157 第 1 節，AA-B 2026-10-16）：韋綸建的；從法律系開始的玩家、舊存檔第一天就在手機裡，裡面只有 2025-08-13 放榜那晚的一張照片（只有照片說明、沒有台詞）。
       之後的訊息照各事件（AA_115 xun_met、BB_96 10-4 沒去午餐）。經濟系開局的玩家：P2 那晚建立（上面 econ_class 那一段）；8/13 的照片等經濟系那一年接到法律系時再補（還沒做）*/
    if(!S.isEcon(G)&&!PHONE.inGroup(G,'econ_friends')){ const g=PHONE.join(G,'econ_friends','走啦'); g.day=Math.min(g.day,-34); if(!PHONE.sent(G,'econ_photo_0813')) PHONE.postAt(G,{th:'g:econ_friends',from:'econ_weilun',name:'韋綸',text:'📷（公館的宵夜攤，四個人和準備收攤的老闆。桌上多擺了兩副碗筷。）',tag:'econ_photo_0813'},-34,23.5); if(PHONE.markSeen) PHONE.markSeen(G,'g:econ_friends'); }   /* 一年多前的舊照片：不算未讀 */   /* AA_368 M1（企劃線 e55fda50）：8/13 那晚可昕在高雄（20:00 電話），原本「六個人」不可能——韋綸、阿勳、品妤、唐睿先吃了（接 22:00 韋綸「回來請吃宵夜」）*/
    /* 10-3 之後（AA_115 第 2 節、BB_96 10-3／10-4、AA_157）：「聊兩句就走」（xun_met）＝阿勳在「走啦」說一句；「期末考一起讀？」（pact）＝他私訊期末的行程表；
       「一起讀到閉館」（night）的玩家第 11 週週五沒有去小福午餐（SK03_LAST 不是那天）＝12:40 群組一張便當照片「欠你的，下週。」，下一個去的週五照樣推過來（ev_sk03_lunch 的 repay）。
       只在共同見過阿勳的玩家也開 SK03（AA-B 2026-10-16），所以便當照片照發、下一個有去的週五推便當 */
    if(F.XUN_DAY!=null){ const xd=F.XUN_DAY, fri=xd+1;
      if(F.XUN_MET_Y1S2&&!PHONE.sent(G,'xun_met_grp')) PHONE.at(G,xd,21.2,[{th:'g:econ_friends',from:'econ_zhengxun',text:'我在共同遇到他。法律系果然比較累。'}],'xun_met_grp');
      if(F.XUN_PACT&&!PHONE.sent(G,'xun_pact_plan')){ silentContact('econ_zhengxun'); PHONE.at(G,xd,21.2,[{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'📄（期末考那兩週的行程表）'}],'xun_pact_plan'); }
      if(F.XUN_NIGHT&&!F.XUN_REPAID&&F.SK03_LAST!==fri&&(G.day>fri||(G.day===fri&&h(G)>=12+40/60))&&!PHONE.sent(G,'xun_repay_photo'))
        PHONE.at(G,fri,12+40/60,[{th:'g:econ_friends',from:'econ_zhengxun',text:'📷（一個便當）'},{th:'g:econ_friends',from:'econ_zhengxun',text:'欠你的，下週。'}],'xun_repay_photo'); }
    /* 家教（BB_96 3-2；SYS-13 最小版）：「我先想想。」＝名額留到月底——月底前一週 21:00 明軒私訊再問；過了月底「名額給別人了。」。
       接了（JOB_TUTOR）＝大一下每週一次，週二或週四（TUTOR_WD）19:00～21:00；可以接受或略過，略過不扣分。做了麵店工讀（大三週二）自動改週四：麵店工讀做好再接 */
    /* BB_161 ⑩：名額保留到「月底」或「答覆後 7 天」取比較晚的；答覆後第 3 天 21:00 問一次「想好了嗎？」（月底前幾天才說「我先想想」的玩家也問得到）。
       ⑪：答應的時候選週二或週四（AA_163 第 2 節①；TUTOR_WD） */
    if(F.tutorThinkDay!=null&&!F.JOB_TUTOR){ const d0=CALENDAR.dateOf(F.tutorThinkDay), mdays=[31,28,31,30,31,30,31,31,30,31,30,31][d0.m-1]+((d0.m===2&&d0.y%4===0)?1:0), mEnd=Math.max(F.tutorThinkDay+(mdays-d0.d),F.tutorThinkDay+7), ask=F.tutorThinkDay+3, M=t=>({th:'p:classmate_mingxuan',from:'classmate_mingxuan',text:t});
      const yes=wd=>({t:wd===2?'週二。':'週四。',set:{TUTOR_WD:wd},say:[M('很好。第一堂我陪你去認門。')]});
      if(!PHONE.sent(G,'mx_tutor_ask2')) PHONE.at(G,ask,21,[Object.assign(M('家教的事，想好了嗎？'),{ask:{until:(mEnd+1)*24,opts:[{t:'好。',set:{JOB_TUTOR:true,tutorFromDay:ask},say:[Object.assign(M('你哪天方便？'),{ask:{opts:[yes(2),yes(4)]}})]}]}})],'mx_tutor_ask2');
      if(G.day>mEnd&&!PHONE.sent(G,'mx_tutor_gone')){ F.TUTOR_GONE=true; PHONE.at(G,mEnd+1,12,[M('名額給別人了。下次有，我再跟你說。')],'mx_tutor_gone'); } }
    /* AA_373 #1（企劃線 a48fe1b7）：家教同樣只排到學期的最後一週（第 16 週），超過學期的日子不排（暑假家教另外排）；舊存檔已經排在學期以後的那一次拿掉。
       有 JOBS（src/jobs3d.js，AA_163 第 2 節：大一下～大二下、考試週停、會考結束）就照那邊排，這裡不排 */
    if(F.JOB_TUTOR&&typeof OUT!=='undefined'&&!(typeof JOBS!=='undefined'&&JOBS.TUTOR_PLAN)){ for(const q of OUT.rec(G)) if(/^tutor_/.test(q.id)&&q.state==='planned'){ const t=CALENDAR.termOf(q.day); if(!t||t.id!=='Y1S2') q.state='skipped'; }
      const T=CALENDAR.termOf(G.day); if(T&&T.id==='Y1S2'){ for(let w=T.week,LW=S.termWeeks('Y1S2');w<=LW;w++){ const d=S.termDayIn('Y1S2',w,F.TUTOR_WD===4?4:2); if(d==null||d<=(F.tutorFromDay|0)||d*24+19<G.day*24+G.hour) continue; if(CALENDAR.holiday(d)||(CALENDAR.typhoon&&CALENDAR.typhoon(d))) continue;   /* 颱風假不能打工（AA_160 3-4 D）*/ const id='tutor_'+d; if(OUT.get(G,id)) break;
          OUT.plan(G,{id,ev:'ev_tutor_lesson',day:d,h:19,place:'學生家（公館附近）',title:'家教',travel:'騎車約 10 分鐘',travelH:1/6,no:'這週不去',back:'家教結束。'}); break; } } }
    /* 颱風假 T2（2026-10-19）：前一晚 20:30 新聞（照大一 T1b 的做法：真的停課是前一晚市政府宣布，沒有群組的玩家也收得到）*/
    { const ty=S.dayOfKey('2026-10-19'); if(ty!=null&&typeof CALENDAR!=='undefined'&&CALENDAR.typhoon(ty)&&G.day>=ty-1&&G.day<=ty&&!PHONE.sent(G,'ty2_news')&&(G.day>ty-1||h(G)>=20.5)) PHONE.at(G,ty-1,20.5,[{th:'sys',name:'新聞',text:'明天停止上班上課。'}],'ty2_news'); }
    /* 柏翰的考古題小組（AA_40 翰 2、AA_177）：選「好。」以後每週六 16:00～18:00 總圖 B1 討論室（出發選單），到大二上第 16 週；沒去不扣分 */
    if(F.BOHAN_GROUP==='yes'&&F.BOHAN_GROUP_DAY!=null&&typeof OUT!=='undefined'&&typeof CALENDAR!=='undefined'){ const t=CALENDAR.termOf(G.day), x=CALENDAR.dateOf(G.day);
      if(t&&t.id==='Y2S1'&&t.week<=15&&x.wd===6&&G.day>F.BOHAN_GROUP_DAY&&!OUT.get(G,'bohan_group_'+G.day)&&h(G)<16.25) OUT.plan(G,{id:'bohan_group_'+G.day,ev:'ev_bohan_group_session',day:G.day,h:16,late:0.25,place:'總圖 B1 討論室',title:'考古題小組',travel:'走過去約 10 分鐘',travelH:1/6}); }
    /* 以安新 8 的後半（AA_140 G13）：第 7 週週四讀書會演過以後，同一週週六 14:00 補讀；以安在麵店團群組約（週四 22:00）＋出發選單。沒加入讀書會的、在麵店團：週四 22:00 Alison 傳撕掉一半的規則＋以安一句（聽說）*/
    { const thu=termDay('Y2S1',7,4), sat=termDay('Y2S1',7,6); if(thu&&sat&&PHONE.inGroup(G,'noodle_team')&&G.day>=thu&&G.day<=sat+1){ const N=(f,t)=>({th:'g:noodle_team',from:f,text:t});
      if(G.events.done.ev_plg_rules&&!PHONE.sent(G,'plg_sat_ask')&&(G.day>thu||h(G)>=22)){ PHONE.at(G,thu,G.day===thu?Math.max(22,h(G)):22,[N('heroine_01','週六下午補讀一次。規則三條。')],'plg_sat_ask');
        if(typeof OUT!=='undefined'&&!OUT.get(G,'plg_sat')&&(G.day<sat||h(G)<14.25)) OUT.plan(G,{id:'plg_sat',ev:'ev_plg_rules_after',day:sat,h:14,late:0.25,place:'萬才館研討室',title:'公法讀書會的補讀',travel:'走過去約 10 分鐘',travelH:1/6}); }
      if(!(F.PUBLIC_LAW_GROUP||F.CLUB_public_law_group)&&!G.events.done.ev_plg_rules&&!PHONE.sent(G,'plg_torn')&&(G.day>thu||h(G)>=22)&&G.day<=thu+2){ PHONE.at(G,thu,G.day===thu?Math.max(22,h(G)):22,[N('yu','我把以安的規則撕掉一半了。'),N('heroine_01','週六下午補讀，規則剩三條。')],'plg_torn'); if(typeof SOCIAL!=='undefined') SOCIAL.remember('heroine_01','HEARD_ABOUT','讀書會的規則被 Alison 撕掉一半（聽說）'); } } }
    /* 學姊 W6 交接（BB_97 2-1；BB-B 75c1b2b1 改第 6 週）的家族群組那句：沒加入法服＝大二上第 6 週週三 21:30；社員第 6、7 週都沒去讀書會＝第 7 週週三 21:30（照 AA_176 R7 的時段）*/
    /* 「學姊卸任了！」（sis_handover_group）刪：W6 交接刪了，她在祐廷大一時已經是前任社長（BB_191 §7-3）*/
    /* 阿凱 K3 宿舍分開了，宵夜沒有（BB_97 4-1，BB-B 定稿）：大二搬完房間（ROOM_Y2）以後，大二上每個週日 23:00、大二下每個月第一個週日 23:00 阿凱私訊；
       第一次多一句「宿舍旁邊那攤滷味比較好吃……」（AA_519 5-4：原本「我這棟樓下的」；底圖照用公館滷味攤）。去＝出發選單（宿舍旁的滷味攤，2D，ev_kai_sunday_supper）；「這週不行」＝「好。下週日。」；不回＝下週日照樣問，
       連續三週沒回，第三週的回覆期限過了多一句「你還活著吧？……活著就好。下週日。」（只說一次）。去了 3 次以上（habit kai_supper、365 天內）＝阿凱 SUNDAY_SUPPER */
    if(F.ROOM_Y2&&typeof CALENDAR!=='undefined'){ const T=CALENDAR.termOf(G.day), A=t=>({th:'p:kai',from:'kai',text:t});
      const sunOK=d=>{ const t=CALENDAR.termOf(d), x=CALENDAR.dateOf(d); if(!t||x.wd!==7||d<F.ROOM_Y2) return false; if(t.id==='Y2S1') return true; if(t.id==='Y2S2') return x.d<=7; return false; };   /* 大二下：每個月第一個週日 */
      if(sunOK(G.day)&&G.hour>=23&&!PHONE.sent(G,'kai_sup_'+G.day)){ const first=!F.KAI_SUP_ASKED; F.KAI_SUP_ASKED=(F.KAI_SUP_ASKED|0)+1; const d=G.day;
        const ask={id:'kai_sup_'+d,until:(d+1)*24+18,opts:[{t:'去。',set:{KAI_SUP_GO:d}},{t:'這週不行。',set:{KAI_SUP_LAST:d},say:[A('好。下週日。')]}]};
        PHONE.at(G,d,Math.max(23,h(G)),first?[A('宵夜'),Object.assign(A('宿舍旁邊那攤滷味比較好吃 老闆會多給豆干'),{ask})]:[Object.assign(A('宵夜'),{ask})],'kai_sup_'+d); }   /* AA_428 §2 第 8 點：照 BB_167 SC4 #13，阿凱的訊息不打標點（口氣表 2-5）；第一則兩句、之後每週「宵夜」 */
      if(F.KAI_SUP_GO===G.day&&typeof OUT!=='undefined'&&!OUT.get(G,'kai_sup_'+G.day)&&G.hour>=23) OUT.plan(G,{id:'kai_sup_'+G.day,ev:'ev_kai_sunday_supper',day:G.day,h:Math.max(23,h(G)),late:0.5,place:'宿舍旁的滷味攤',title:'週日宵夜（阿凱）',travel:'走過去約 5 分鐘',travelH:1/12});
      /* 連續沒回：每一次問的回覆期限（隔天 18:00）過了才算一週沒回 */
      if(!F.KAI_SUP_ALIVE){ const asks=(G.msgs||[]).filter(m=>m.th==='p:kai'&&m.ask&&/^kai_sup_/.test(m.ask.id||'')), now=G.day*24+G.hour; let run=0;
        for(const m of asks){ if(m.ans!=null){ run=0; continue; } if(m.ask.until!=null&&now>m.ask.until) run++; }
        if(run>=3&&!PHONE.sent(G,'kai_sup_alive')){ F.KAI_SUP_ALIVE=G.day; PHONE.at(G,G.day,h(G),[A('你還活著吧？……活著就好。下週日。')],'kai_sup_alive'); } } }
    /* 語彤事件 7（AA_177 4-6）：9/26 語彤加入法服、第一次值班＝YT_LEGALAID_Y2。語彤不在法服（AA_255 第 4 節第 2 點、AA_259 第 4 節第 3 點）：改讀 YT_FAFU（固定 'no'，S.YT_FAFU），'yes' 才設 */
    { const d0=S.dayOfKey('2026-09-26'); if(d0!=null&&S.ytFafu(G)&&!F.YT_LEGALAID_Y2&&(G.day>d0||(G.day===d0&&h(G)>=9))) F.YT_LEGALAID_Y2=true; }
    /* 法服值班（V3-D25，AA_184 第 1 節）：社員每個值班的週六 08:30 出發選單（OUT goto 萬才館一樓；在臺北的家＝從家裡出發）；「這週請假」不扣分。
       連續三次沒去（請假、沒出發、出發了沒坐到圓桌都算；語彤事件 7 那天不算）：柏翰私訊；「先不排我。」＝這學期不提醒（FAFU_OFF＝學期 id），下學期第一週再問 */
    if(typeof OUT!=='undefined'&&typeof CALENDAR!=='undefined'&&S.fafuMember(G)){ const t=CALENDAR.termOf(G.day), off=F.FAFU_OFF===t.id, B=t2=>({th:'p:classmate_bohan',from:'classmate_bohan',text:t2});
      if(!off&&S.fafuDuty(G)&&!S.fafuSpecial(G)&&!OUT.get(G,'fafu_'+G.day)&&h(G)<9.5&&F.LAWCLUB_SAT_LAST!==G.day) OUT.plan(G,{id:'fafu_'+G.day,day:G.day,h:9,place:'萬才館一樓',title:'法服值班（萬才館一樓 9:00）',travel:'走過去約 10 分鐘',travelH:0.25,no:'這週請假',goto:{zone:'wancai',x:0,z:5,yaw:Math.PI}});
      const TR=F.FAFU_TRK||(F.FAFU_TRK={last:G.day-1,miss:0}); for(let d=TR.last+1;d<G.day||(d===G.day&&h(G)>=12);d++){ TR.last=d; const g2={day:d,flags:F,stage:G.stage}; if(!S.fafuDuty(g2)||d===S.dayOfKey('2026-09-26')) continue; const t3=CALENDAR.termOf(d); if(!t3||F.FAFU_OFF===t3.id) continue; TR.miss=F.LAWCLUB_SAT_LAST===d?0:TR.miss+1; if(d===G.day) break; }
      const ask=[B('這學期的班表要排了。你還來嗎？')]; Object.assign(ask[0],{ask:{opts:[{t:'來。',say:[],set:{FAFU_OFF:null}},{t:'先不排我。',set:{FAFU_OFF:t.id}}]}});
      if(TR.miss>=3&&!off&&!PHONE.sent(G,'fafu_bohan_'+t.id)&&!(t.id==='Y2S1'&&t.week<6)){ silentContact('classmate_bohan'); TR.miss=0; PHONE.at(G,G.day,Math.max(h(G),12),ask,'fafu_bohan_'+t.id); }
      if(F.FAFU_OFF&&F.FAFU_OFF!==t.id&&t.week===1&&!PHONE.sent(G,'fafu_bohan_'+t.id)){ silentContact('classmate_bohan'); F.FAFU_OFF=null; PHONE.at(G,G.day,Math.max(h(G),12),ask,'fafu_bohan_'+t.id); } }
    /* 「法律系（全班）」群組 law_class（AA_177 第 9 節，和經濟系的 econ_class 對稱，四年同一個）：新遊戲第 1 天 21:00 加入＋系統字；舊存檔讀檔時補加入（day 記第 1 天）、不跳系統字。
       用在系學會的公告：大二迎新 9/4（下面；AA_310）、大三迎新 9/2、大四直屬名單 9/1、大四迎新 8/31（AA_310 第 3 節，還沒做進遊戲）*/
    if((G.stage||'law')==='law'&&!PHONE.inGroup(G,'law_class')&&S.week1Start(G)){ const d0=S.dayOfKey('2025-08-31'), t0=14+40/60; if(d0!=null&&(G.day>d0||(G.day===d0&&h(G)>=t0))) S.lawClassJoinY1(G); }   /* 選 1：開學典禮中約 14:40（AA_195 4-4「校長致詞講到一半，手機震了一下」；AA-B 7b2d057f）*/
    else if((G.stage||'law')==='law'&&!PHONE.inGroup(G,'law_class')&&(S.mainDay(G)>1||h(G)>=21)){ const g=PHONE.join(G,'law_class','法律系（全班）'); if(S.mainDay(G)===1) PHONE.at(G,G.day,21,[{th:'g:law_class',text:'你被加進「法律系（全班）」。'}],'law_class_join'); else g.day=S.mainD1(G); }
    else if(PHONE.inGroup(G,'law_class')&&G.phone.groups.law_class.name!=='法律系（全班）') G.phone.groups.law_class.name='法律系（全班）';   /* 舊存檔照年級的名字「法律系 大一（全班）」改成四年同一個 */
    /* 1A-02 第 3-2 節（AA_315）攤牌：11/11 22:00 學姊、以安兩則私訊同時進來，22:30 兩點半 Café——一定要去（出遊 must：只有「出發」）。
       11/10 那晚沒睡著過（法圖那段沒演）也一樣：她們在法圖遇到了（TWO_HEARTS_MET 補上）*/
    { const d11=S.dayOfKey('2027-11-11'); if(d11!=null&&G.day===d11&&!F.TWO_HEARTS_PICK&&S.twoHeartsMet&&(()=>{ const ok=F.dating_heroine_01===true&&F.dating_heroine_05===true&&(G.stage||'law')==='law'; if(ok&&F.TWO_HEARTS_MET==null&&typeof ROM!=='undefined'&&!ROM.knowsOf(G,'heroine_01','heroine_05')&&!ROM.knowsOf(G,'heroine_05','heroine_01')) S.twoHeartsMet(G); return ok; })()&&F.TWO_HEARTS_MET!=null&&!PHONE.sent(G,'two_hearts_msg')){
        PHONE.at(G,d11,22,[{th:'p:heroine_05',from:'heroine_05',text:'今天十點半，兩點半 Café。'},{th:'p:heroine_01',from:'heroine_01',text:'十點半，兩點半。我也會去。'}],'two_hearts_msg');
        if(typeof OUT!=='undefined'&&!OUT.get(G,'y3_two_hearts')) OUT.plan(G,{id:'y3_two_hearts',must:true,goto:{zone:'cafe',x:0,z:5,yaw:Math.PI},day:d11,h:22.5,late:1,place:'兩點半 Café',title:'兩點半 Café　打烊後',travel:'（你還是去了。）',travelH:1/3}); } }
    S.an15Phone(G);   /* 1A-05（AA_315）：11/15 學校信箱、11/16 以安私訊、11/17 16:00／18:00、學姊 20:00 與 22:30 */
    S.y4Phone(GM);   /* 1A-06～1A-15（AA_317、AA_318）：姊姊的火鍋、大年初一可昕、大四要怎麼過的隔天、R1 時差 */
    /* D3 迎新（大二，小隊輔；AA_177 第 6、9 節；AA_310 第 2 節改到開學前）：9/4（五）21:00 系學會在 law_class「禮拜天迎新，小隊輔兩點在社科院旁的草地集合。」→ 9/6（日）14:00 出發選單（晚 15 分鐘＝沒去；那天早上 08:30 搬進 312）；沒去＝21:30 同一個群組的照片 */
    if(typeof OUT!=='undefined'&&PHONE.inGroup(G,'law_class')){ const d=S.dayOfKey('2026-09-06'), di=S.dayOfKey('2026-09-04'), C=t=>({th:'g:law_class',from:'law_assoc',name:'系學會',text:t});
      if(d!=null&&di!=null&&(G.day>di||(G.day===di&&h(G)>=21))&&G.day<=d&&!PHONE.sent(G,'y2_welcome_ask')){ PHONE.at(G,di,G.day===di?Math.max(21,h(G)):21,[C('禮拜天迎新，小隊輔兩點在社科院旁的草地集合。')],'y2_welcome_ask');
        if(!OUT.get(G,'y2_welcome')&&(G.day<d||h(G)<14.25)) OUT.plan(G,{id:'y2_welcome',ev:'ev_y2_welcome',day:d,h:14,late:0.25,place:'社科院旁的草地',title:'迎新（小隊輔）',travel:'走過去約 10 分鐘',travelH:1/6}); }
      const o=d!=null?OUT.get(G,'y2_welcome'):null; if(o&&o.state==='missed'&&!G.events.done.ev_y2_welcome&&(G.day>d||h(G)>=21.5)&&G.day<=d+2&&!PHONE.sent(G,'y2_welcome_photo')) PHONE.at(G,d,21.5,[C('📷（一群新生圍成一圈，手上拿著名牌。）')],'y2_welcome_photo'); }
    /* ===== v3 D8（AA_177 第 5、6 節）=====
       校慶（法服問答攤）：法服成員 11/13（五）21:00 語彤在法服讀書會群組「明天九點半，攤位集合。」（攤位的事件 ev_fair_booth_y2）。
       哲 2：第 10 週週四 11/12，和阿哲「朋友」以上：20:15 祐廷的訊息自動送出「今天週四，你沒去麵店？」，20:30 他回「沒事啦，在練球」（AA-B 682d911f）；回「我去找你。」＝出發選單「籃球場 21:00」→ 2D ev_zhe_court_y2。
         不回、不去：下週二起第一次在麵店遇到他，只說「上次沒事啦。」（ev_zhe_court_skip），沒有三種幫法、LENT_NOTES_Y2 沒有值 */
    /* D11 系籃（AA_177 4-4）：12/18（五）21:00 麵店團群組（不在群組＝阿哲私訊）揪 → 出發選單「新體育館 12/19 14:00」；系籃和賽後麵店（語 3）都沒去：12/19 22:00 認識 Alison＝她打電話來（ev_yu_together_call，AA_313 5-1 第 4 點；沒接＝麵店團群組阿哲的照片）、不認識＝麵店團群組阿哲的照片 */
    if(typeof OUT!=='undefined'){ const d18=S.dayOfKey('2026-12-18'), d19=S.dayOfKey('2026-12-19');
      if(d18!=null&&d19!=null&&(G.day>d18||(G.day===d18&&h(G)>=21))&&G.day<=d19&&!PHONE.sent(G,'y2_ball_inv')){ const th=PHONE.inGroup(G,'noodle_team')?'g:noodle_team':'p:zhe'; PHONE.at(G,d18,21,[{th,from:'zhe',text:'明天下午兩點，系籃，新體育館 來喊'}],'y2_ball_inv');
        if(!OUT.get(G,'y2_ball')) OUT.plan(G,{id:'y2_ball',ev:'ev_zhe_game_y2',day:d19,h:14,late:0.25,place:'新體育館',title:'系籃比賽（大二）',travel:'走過去約 10 分鐘',travelH:1/6}); }
      if(d19!=null&&G.day===d19&&h(G)>=21.5&&!G.events.done.ev_zhe_game_y2&&!G.events.done.ev_yu_together&&!PHONE.sent(G,'y2_yu_told')&&!OUT.get(G,'y2_yu_call')&&(S.knows('yu',G)||h(G)>=22)){
        if(S.knows('yu',G)){ if(!OUT.get(G,'y2_yu_call')) OUT.plan(G,{id:'y2_yu_call',ev:'ev_yu_together_call',day:d19,h:22,place:'電話',title:'Alison 打電話來',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'電話掛了。'}); }   /* AA_313 5-1 第 4 點：認識 Alison＝22:00 她打電話來（原本三則私訊；關係變化只在手機）*/
        else if(PHONE.inGroup(G,'noodle_team')){ F.YU_ZHE_TOLD='photo'; PHONE.at(G,d19,22,[{th:'g:noodle_team',from:'zhe',text:'📷（麵店的長桌。Alison 比了一個 YA。）'}],'y2_yu_told'); } }
      { const q=d19!=null?OUT.get(G,'y2_yu_call'):null; if(q&&q.state==='planned'&&(G.events.done.ev_zhe_game_y2||G.events.done.ev_yu_together)) q.state='cancelled'; } }   /* 排了電話以後又去了麵店、聽她當面講了：不打來 */
    /* 大二下第 5 週 3/23（二）21:00 起，麵店團群組排春假（AA_185 3-3；P5 的鋪陳：沒有人 @ 沛珊，她有讀、沒有回）*/
    { const d=S.dayOfKey('2027-03-23'); if(d!=null&&G.day===d&&PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'y2_spring_plan')){ const g=(from,text)=>({th:'g:noodle_team',from,text});
        PHONE.at(G,d,21,[g('zhe','春假四天！要不要去哪裡？'),g('yu','我要去海邊！'),g('classmate_bohan','要先訂車。誰會開車？'),g('zhe','@'+(G.name||'祐廷')),g('classmate_xinci','住哪裡要先決定。'),g('yu','@語彤 妳可以嗎？'),g('heroine_03','……阿姨說可以。'),g('zhe','那下週再排')],'y2_spring_plan'); } }
    /* 沛珊說分開，沒在霖澤館遇到的（AA_185 3-2）：第 6 週週五 21:00 麵店團群組她自己說（直接說、對全桌說），阿哲回；記 HEARD_PS_SPLIT。
       AA_374 第 18 項：句子換 BB_97 版（AA_211 第 5 節：大一下公開交往時已經說過「你們吃你們的」）；演過那一件的（含合併前的 ev_peishan_bohan_split）不發。第 11 項：和她交往中的沒有這一段 */
    { const f6=termDay('Y2S1',6,5), D0=(G.events&&G.events.done)||{}; if(f6!=null&&G.day===f6&&!D0.ev_peishan_split&&!D0.ev_peishan_bohan_split&&!F.dating_classmate_peishan&&PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'ps_split_group')){ F.HEARD_PS_SPLIT=true;
        const g=t=>({th:'g:noodle_team',from:'classmate_peishan',text:t});
        PHONE.at(G,f6,21,[g('說一件事，說完就好。'),g('我和柏翰分開了。是我說的。我們都好。'),g('……大家照常吃飯，不用特別安慰我。'),{th:'g:noodle_team',from:'zhe',text:'……收到'}],'ps_split_group'); } }
    /* 學姊 M2 換題目（BB_97 2-5；AA_177 第 8 節②：大二寒假 1/20（三）21:00 家族群組，所有家族成員都看得到，不以 W9 為前置）：讀書計畫的照片＋計畫本最後一格空著（AA_398 第 12～14 列：學姊不數件數）；
       祐廷可以寫一格（咖哩那句要有 FAMILY_DINNER）；到隔天 9:00 還沒回＝Kevin「那我寫：考完請吃飯！」她「……好。」 */
    { const d=S.dayOfKey('2027-01-20'); if(S.SIS_Y2_EXAM&&d!=null&&PHONE.inGroup(G,'family_law')){ const W=(t,o)=>Object.assign({th:'g:family_law',from:'heroine_05',name:'溫學姊',text:t},o||{});
        if((G.day>d||(G.day===d&&G.hour>=21))&&G.day<=d+3&&!PHONE.sent(G,'sis_m2')){ const opts=[];
          if(typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','FAMILY_DINNER')) opts.push({t:'考完全家族去吃永康街那家咖哩。',say:[W('……好。考完那天我請。你們不要跟我搶。')],set:{SIS_M2:'curry'}});
          opts.push({t:'考前一天不要熬夜。',say:[W('……你在管我。'),W('……好。收到。')],set:{SIS_M2:'sleep'}});
          opts.push({t:'不管考得怎樣，都要跟我說。',say:[W('好。放榜那天就說。')],set:{SIS_M2:'tell'},mem:[{npc:'heroine_05',tag:'ASKED_TELL_ME',note:''}]});
          PHONE.at(G,d,21,[W('📷（一張讀書計畫）'),W('這次的題目是我自己選的。法律扶助制度。'),W('Kevin 幫我看第一段，學弟看第二段。'),W('計畫本最後一格還空著。你們想寫什麼，就寫。',{ask:{id:'sis_m2',until:(d+1)*24+9,opts}})],'sis_m2'); }
        if(PHONE.sent(G,'sis_m2')&&!F.SIS_M2&&G.day*24+G.hour>=(d+1)*24+9&&!PHONE.sent(G,'sis_m2_kevin')){ F.SIS_M2='none'; PHONE.at(G,d+1,9,[{th:'g:family_law',from:'kevin',name:'Kevin',text:'那我寫：考完請吃飯！'},W('……好。')],'sis_m2_kevin'); } } }
    /* 沛珊 P4 沒去（BB_97 4-3）：大二下第 1 週週四那晚 21:30，公法讀書會群組她的最後一則（題目整理交給柏翰）（BB_191 §8-7：原本週三法服讀書會群組）。
       翰 3 祐廷接的版本（AA_40）：第 2 週週四 21:00 柏翰在全班群組貼一張全班小考的分數分布圖，自己那一格用紅框圈起來，沒有字（AA_118）*/
    /* 交接筆記（BB_205 第 2 節：12/17 22:00；原本在 needed_msgs 的 ps_notes）*/
    { const w1=termDay('Y2S1',15,4), ps='classmate_peishan'; if(w1!=null&&F.STUDYGROUP_LEADER&&G.events&&G.events.done&&G.events.done.ev_peishan_handover&&(G.day>w1||(G.day===w1&&G.hour>=22))&&G.day<=w1+3&&!PHONE.sent(G,'ps_notes')){ const P=t=>({th:'p:'+ps,from:ps,text:t});
        PHONE.at(G,w1,22,[Object.assign(P('這學期的題目和筆記，我放在萬才館櫃子的第二格。'),{ask:Object.assign({id:'ps_notes',opts:[{t:'收到。',say:[P('……謝謝你接住。')]}]},F.dating_classmate_peishan?{}:{until:w1*24+24})})],'ps_notes'); } }   /* AA_374 第 17 項：回覆期限到那天 23:59（12/18 起她不回）；和她交往中的照例外規則，不設期限 */
    { const w1=termDay('Y2S1',15,4); if(w1!=null&&G.day>=w1&&G.day<=w1+3&&(G.day>w1||G.hour>=21.5)&&!(G.events&&G.events.done&&G.events.done.ev_peishan_handover)&&PHONE.inGroup(G,'public_law')&&!PHONE.sent(G,'ps_p4_missed'))
        PHONE.at(G,w1,21.5,[{th:'g:public_law',from:'classmate_peishan',text:'題目整理交給柏翰了。不要變成比分數的地方。'}],'ps_p4_missed');
      const w2=termDay('Y2S2',2,4); if(w2!=null&&F.STUDYGROUP_LEADER&&G.day>=w2&&G.day<=w2+3&&(G.day>w2||G.hour>=21)&&PHONE.inGroup(G,'law_class')&&!PHONE.sent(G,'han3_chart'))
        PHONE.at(G,w2,21,[{th:'g:law_class',from:'classmate_bohan',text:'（照片：白板上每個人上週讀的頁數）'}],'han3_chart'); }   /* AA_375 第 23 項：第 1 週沒有小考，表是讀了幾頁 */
    /* 沛珊 P4b 換你陪我念（BB_97 4-4；大二下第 2 週起，前置 MIRROR_PEISHAN 或和她朋友以上）：第 2 週週五 21:00 她私訊（時間 LAWWW-B 排，已告訴 AA-B）。
       她知道祐廷重考過（ECON_PAST_SHARED full 或 MIRROR_PEISHAN）＝「重考的人才能回答的問題」＋第四個選項；不知道＝「有沒有很想放棄、可是撐過來的事？」。
       祐廷在和別人交往、而且她知道：之後她開小群組「陪重考生念書」（祐廷、阿哲；阿哲「我來補債各」），便條寫「你們呢？」（invites.js 的 afterMeet）。
       第 8 週週六 4/17 12:30「總圖滿了。兩點半，靠窗。」（AA_177 第 8 節②；只有兩個人的版本）→ Café 13～15 點到就演 ev_peishan_cafe_42（CG BCG-35）
       2026-10-21（PS-TAINAN-AA282）：放榜（2027-08-06）以後不傳——原本消失期一結束，暑假還算 Y2S2、psGone 不成立，8/6 起朋友以上的玩家會收到這一則重考的問題；AA_282 第 2 節：放榜後她不先找人 */
    { const d=termDay('Y2S2',2,5), ps='classmate_peishan', rd=S.dayOfKey('2027-08-06'); if(d!=null&&!S.psGone(G)&&rd!=null&&G.day<rd&&typeof SOCIAL!=='undefined'&&SOCIAL.has(ps,'FIRST_MET')&&(G.day>d||(G.day===d&&G.hour>=21))&&S.termAt(G.day)==='Y2S2'&&!PHONE.sent(G,'ps_p4b')&&(SOCIAL.has(ps,'MIRROR_PEISHAN')||['FRIEND','CLOSE_FRIEND'].includes(fl(ps)))){
        const know=F.ECON_PAST_SHARED==='full'||SOCIAL.has(ps,'MIRROR_PEISHAN'), P=t=>({th:'p:'+ps,from:ps,text:t}), other=typeof ROM!=='undefined'&&ROM.knows(G,ps).length>0;   /* 她知道祐廷在和別人交往（BB_191 9-4 #4：不是祐廷有沒有伴侶）*/
        const opts=[{t:'每天去同一個位子。',say:[P('……好。我先試這個。')],set:{PS_P4B:'seat'}},{t:'知道自己要去哪裡，就不難撐。',say:[P('我知道要去哪裡。那我應該撐得住。')],set:{PS_P4B:'where'}},{t:'我也不知道，就撐過來了。',say:[P('……這個答案好誠實。我收下了。')],set:{PS_P4B:'dunno'}}];
        if(know) opts.push({t:'那時候有人陪我一起準備。',say:[P('……好。那我也找一個人。')],set:{PS_P4B:'someone'}});
        const L=know?[P('欸，問你一個重考的人才能回答的問題。'),P('你重考那一年，怎麼撐過來的？')]:[P('欸，問你一個問題。'),P('你有沒有很想放棄、可是撐過來的事？')];
        L[1]=Object.assign(L[1],{ask:{id:'ps_p4b',opts}}); const dd=G.day===d?d:G.day, hh=G.day===d?21:Math.max(G.hour%24,9); PHONE.at(G,dd,hh,L,'ps_p4b');
        if(other){ F.PS_P4B_GROUP=true; PHONE.join(G,'ps_study','陪重考生念書'); PHONE.at(G,dd,hh+0.3,[{th:'g:ps_study',from:'zhe',text:'我來補債各'}],'ps_p4b_group'); } }
      if(F.PS_P4B_GROUP&&PHONE.inGroup(G,'ps_study')&&S.termAt(G.day)==='Y2S2'){ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null;   /* 小組每週五 21:00 揪（BB-B 20c81473）：大二下第 2 週起，三句輪流 */
        if(T&&T.week>=2&&G.weekday===5&&G.hour>=21&&!PHONE.sent(G,'ps_study_w'+T.week)){ const SL=['明天總圖，老位子旁邊的長桌。想來的就來，不用回。','這週末我在總圖。進度：債總第三章。……你們不用回，來就好。','週末總圖。阿哲說要補債各，我先幫他占位。'];
          PHONE.at(G,G.day,21,[{th:'g:ps_study',from:'classmate_peishan',text:SL[(T.week-2)%3]}],'ps_study_w'+T.week); } }
      const c=S.dayOfKey('2027-04-17'); if(c!=null&&PHONE.sent(G,'ps_p4b')&&!F.PS_P4B_GROUP&&G.day===c&&G.hour>=12.5&&!PHONE.sent(G,'ps_p4b_cafe'))
        PHONE.at(G,c,12.5,[{th:'p:'+ps,from:ps,text:'總圖滿了。兩點半，靠窗。'}],'ps_p4b_cafe'); }
    /* 杜鵑花第二張（AA_177 第 6 節、AA_143 2-2）：大二下第 3 週週四 3/11 12:40 以安在麵店團群組傳照片（照片本身就是事件）*/
    { const d=S.dayOfKey('2027-03-11'); if(d!=null&&PHONE.inGroup(G,'noodle_team')&&(G.day>d||(G.day===d&&G.hour>=12+40/60))&&G.day<=d+7&&!PHONE.sent(G,'y2_azalea'))
        PHONE.at(G,d,12+40/60,[{th:'g:noodle_team',from:'heroine_01',text:'📷（杜鵑花。和去年同一個位置。）'}],'y2_azalea'); }
    /* 交換說明會（AA_177 4-2）：3/15（一）09:00 學校信箱；以安在麵店團群組「我會去。坐第一排。」；沒去（沒有聽說明會）＝3/18 20:00 她傳簡報的照片「重點在第七頁。」*/
    { const d=S.dayOfKey('2027-03-18'), m=S.dayOfKey('2027-03-15'); if(d!=null&&m!=null){
        if((G.day>m||(G.day===m&&G.hour>=9))&&G.day<=d&&!PHONE.sent(G,'y2_expo_mail')){ const it=[{th:'sys',name:'學校信箱',text:'國際事務處：交換學生甄選說明會，3/18 中午，博雅教學館大教室。'}];
          PHONE.at(G,m,9,it,'y2_expo_mail'); if(PHONE.inGroup(G,'noodle_team')) PHONE.at(G,m,9+20/60,[{th:'g:noodle_team',from:'heroine_01',text:'我會去。坐第一排。'}],'y2_expo_an'); }
        const went=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,'EXPO_Y2',d);   /* 中途離開也算去了 */
        if(!went&&PHONE.inGroup(G,'noodle_team')&&(G.day>d||(G.day===d&&G.hour>=20))&&G.day<=d+3&&!PHONE.sent(G,'y2_expo_missed'))
          PHONE.at(G,d,20,[{th:'g:noodle_team',from:'heroine_01',text:'📷（說明會的簡報）'},{th:'g:noodle_team',from:'heroine_01',text:'重點在第七頁。'}],'y2_expo_missed'); } }
    /* 模擬法庭（V3-D16；AA_177 4-7、AA_143 3-3）：2/23（二）09:00 系上公告；模 1 沒到＝2/25 13:30 以安私訊兩則；小組群組「模擬法庭・賣家組」（模 1 演完或 13:30）；
       模 2～5 的邀約前一晚 21:00 以安在小組群組；模 5 散場（演完）阿哲當面約＝排 19:00 麵店出遊（模 6）；沒去＝21:30 麵店團群組一張照片 */
    /* 2026-10-17 使用者刪除模擬法庭（AA_252）：整段停用（S.MOOT_OFF），舊存檔的旗標留著、不再讀 */
    { const dA=S.dayOfKey('2027-02-23'), d1=S.dayOfKey('2027-02-25'), d5=S.dayOfKey('2027-05-01'), ED=id=>!!(G.events&&G.events.done&&G.events.done[id]); if(!S.MOOT_OFF&&dA!=null&&d1!=null&&d5!=null&&G.day>=dA&&G.day<=d5+1){
        const MG='g:moot_seller', A=t=>({th:MG,from:'heroine_01',text:t}), H=t=>({th:MG,from:'classmate_bohan',text:t});
        if((G.day>dA||G.hour>=9)&&G.day<=d1&&!PHONE.sent(G,'moot_notice')) PHONE.at(G,dA,9,[{th:'sys',name:'系上公告',text:'法律系：大二模擬法庭抽籤，2/25（四）12:20，霖澤館 201。全體大二同學參加。'}],'moot_notice');
        if(ED('ev_moot_1')||G.day>d1||(G.day===d1&&G.hour>=13.5)){ if(!PHONE.inGroup(G,'moot_seller')) PHONE.join(G,'moot_seller','模擬法庭・賣家組');
          if(!ED('ev_moot_1')&&!PHONE.sent(G,'moot_1_missed')) PHONE.at(G,d1,13.5,[{th:'p:heroine_01',from:'heroine_01',text:'抽籤結果出來了。我、你、柏翰。我們是賣家。'},{th:'p:heroine_01',from:'heroine_01',text:'分工表明天給你。'}],'moot_1_missed'); }
        if(PHONE.inGroup(G,'moot_seller')) for(const [k,inv] of [['2027-03-10',[A('明天晚上七點，萬才館研討室。'),A('題目是二手機車的買賣。每個人帶一個做法來。'),H('做法是指……要背的範圍嗎。'),A('不是。')]],
            ['2027-03-31',[A('明天七點，研討室。書狀要寫到第三段。'),A('再不寫，四月就沒了。'),H('我寫了一版。照考古題的格式。'),A('……明天再說。')]],
            ['2027-04-14',[A('明天七點，研討室。學姊答應來當法官。'),A('她說會手下留情。'),H('她上次也這樣說。')]],['2027-04-30',[A('明天九點半，201。穿正式一點。')]]]){
          const di=S.dayOfKey(k); if(di!=null&&(G.day>di||(G.day===di&&G.hour>=21))&&G.day<=di+1&&!PHONE.sent(G,'moot_inv_'+k)) PHONE.at(G,di,21,inv,'moot_inv_'+k); }
        if(ED('ev_moot_5')&&typeof OUT!=='undefined'&&!OUT.get(G,'moot_6')&&G.day===d5&&G.hour<19.25) OUT.plan(G,{id:'moot_6',ev:'ev_moot_6',day:d5,h:19,late:0.25,place:'阿鳳麵店',title:'模擬法庭之後的麵店',travel:'走過去約 15 分鐘',travelH:0.25});
        const o=typeof OUT!=='undefined'?OUT.get(G,'moot_6'):null; if(ED('ev_moot_5')&&!ED('ev_moot_6')&&(G.day>d5||G.hour>=21.5)&&!PHONE.sent(G,'moot_6_photo')){ const th=PHONE.inGroup(G,'noodle_team')?'g:noodle_team':MG;
          PHONE.at(G,d5,21.5,[{th,from:'zhe',text:'📷（阿哲分的滷味）'}],'moot_6_photo'); }
        /* 可昕的部分（BB_97 9-19）：交往中＝第 9 週週五 4/23 21:00 她問（大二沒有每週的「我們的日子」，照「沒有固定日子的玩家」那一種）；開到模 5 那天 09:00。
           模 5 演完記 KX_MOOT（events.js）：came＝散場、麵店各一句；call＝說了但她有課（平日白天的比賽；現在的模 5 是週六，不會發生）→ 散場後一則；photo＝沒說或沒回 → 22:00 粉專的照片＋一則 */
        const dq=S.dayOfKey('2027-04-23'); if(dq!=null&&F.dating_kexin){ const K=t=>({th:'p:kexin',from:'kexin',text:t});
          if((G.day>dq||(G.day===dq&&G.hour>=21))&&G.day<d5&&!PHONE.sent(G,'kx_moot_ask')) PHONE.at(G,dq,21,[Object.assign(K('你最近的訊息都很短。在忙什麼？'),{ask:{id:'kx_moot_ask',until:d5*24+9,opts:[{t:'模擬法庭。第 10 週比賽，妳要來嗎？',set:{KX_MOOT_TOLD:true},say:[K('要。我坐最後一排，你不要看我。')]},{t:'一個比賽。比完再跟妳說。',set:{KX_MOOT_TOLD:false},say:[K('好。比完要說。')]}]}})],'kx_moot_ask');
          if(ED('ev_moot_5')&&F.KX_MOOT==='call'&&!PHONE.sent(G,'kx_moot_call')) PHONE.at(G,G.day,G.hour,[K('你們學校的評審是不是比較兇？')],'kx_moot_call');
          if(ED('ev_moot_5')&&F.KX_MOOT==='photo'&&(G.day>d5||G.hour>=22)&&!PHONE.sent(G,'kx_moot_photo')) PHONE.at(G,d5,22,[K('📷（法律系學會粉專貼的模擬法庭照片）'),K('下次要說。我想看你發抖。')],'kx_moot_photo'); } } }
    /* 大二過年（V3-D13；AA_143 2-1 新的字，AA-B 9035ede0：不重用大一的原句）：初一 2027-02-06 11:00 麵店團群組——阿哲、以安、Alison 的照片（Alison 那三則所有成員都看得到，
       他們交往在麵店團是公開的事）；祐廷三選一：年夜飯照片／「醜的水餃比較好吃」／貼圖（不回就只是沒回）*/
    { const ny=S.dayOfKey('2027-02-06'); if(ny!=null&&PHONE.inGroup(G,'noodle_team')&&(G.day>ny||(G.day===ny&&G.hour>=11))&&G.day<=ny+4&&!PHONE.sent(G,'cny_noodle_y2')){ const th='g:noodle_team', M=(f,t,o)=>Object.assign({th,from:f,text:t},o||{});
        PHONE.at(G,ny,11,[M('zhe','📷（高雄老家的廚房，媽媽在包水餃）'),M('zhe','我媽說今年要包一百個'),M('zhe','我包到第四十個就被趕出廚房……你們在幹嘛？'),
          M('heroine_01','📷（台中阿嬤家門口的春聯，字有一點歪）'),M('heroine_01','新年快樂。今年的春聯是我寫的。'),M('heroine_01','阿嬤說我的字最工整。……歪是照片的角度。'),
          M('yu','📷（和阿哲視訊的截圖，兩個人各舉著一顆水餃）'),M('yu','我們隔著三百公里吃年夜飯。'),M('zhe','她包的比較醜'),
          M('yu','你閉嘴。',{ask:{id:'cny_noodle_y2_reply',opts:[{t:'（傳家裡的年夜飯照片）',post:'📷（家裡的年夜飯，滿桌的菜）',say:[{from:'zhe',text:F.ZHE_CALLS_GE?'哥，你家也太多菜！':'你家也太多菜！'},{from:'heroine_01',text:'左下角那盤是什麼？'}]},
            {t:'新年快樂。Alison，醜的水餃比較好吃。',say:[{from:'yu',text:'連你也！'},{from:'zhe',text:F.ZHE_CALLS_GE?'哥懂我':'懂我'}]},   /* 阿哲叫「哥」照 ZHE_CALLS_GE（AA_313 5-1 第 2 點、5-3）*/
            {t:'（傳一張貼圖）',post:'（貼圖：新年快樂）',say:[{from:'zhe',text:'（貼圖：新年快樂）'}]}]}})],'cny_noodle_y2'); } }
    /* 芷若 Z7（BB_97 3-4 最終版、AA-B b95cea49）：交換申請截止 12/10（四）那晚 23:59 私訊三則——要演過 Z4、有她的聯絡方式；祐廷有伴侶而且她知道＝沒有（AA_112 8-1，Café 才說）。
       Café 裡選「妳跟妳媽說了嗎？」＝那晚 22:15 再一則。大二上結束都沒去 Café（收到深夜訊息的）＝寒假第一天 21:00 一則。
       Z7b 學校這一關（BB_97 3-4b）：寒假 1/28（四）21:00（摘要日，AA-B 定）；Z7 演過或收到寒假那則；記 ZR_NOMINATED（Z8、ev_zhiruo_admitted 讀）*/
    { const d=S.dayOfKey('2026-12-10'), Zp=t=>({th:'p:heroine_02',from:'heroine_02',text:t}), ED=id=>!!(G.events&&G.events.done&&G.events.done[id]), knowsP=typeof ROM!=='undefined'&&ROM.knows(G,'heroine_02').length>0; if(d!=null){
        let bk=null; for(let x=d+1;x<d+80;x++){ if(typeof CALENDAR!=='undefined'&&!CALENDAR.termOf(x)){ bk=x; break; } }   /* 大二上結束後的第一天（寒假第一天）*/
        if((G.day>d||(G.day===d&&G.hour>=23+59/60))&&(bk==null||G.day<bk)&&ED('ev_zhiruo_secret')&&!ED('ev_zhiruo_applied')&&G.contacts&&G.contacts.heroine_02!=null&&!knowsP&&!PHONE.sent(G,'zr_z7_msg'))
          PHONE.at(G,d,23+59/60,[Zp('交換申請，剛剛按了送出。英國那一間。'),Zp('截止是十二點。我在十一點五十九分按的。'),Zp('……手還在抖。下次你來店裡，再跟你說。')],'zr_z7_msg');
        if(F.ZR_Z7_MOM&&F.zrAppliedDay!=null&&!PHONE.sent(G,'zr_z7_mom')&&(G.day>F.zrAppliedDay||G.hour>=22.25)) PHONE.at(G,F.zrAppliedDay,22.25,[Zp('我說了。她說『那妳要穿暖一點』。')],'zr_z7_mom');
        if(bk!=null&&(G.day>bk||(G.day===bk&&G.hour>=21))&&G.day<=bk+20&&PHONE.sent(G,'zr_z7_msg')&&!ED('ev_zhiruo_applied')&&!PHONE.sent(G,'zr_z7_break'))
          PHONE.at(G,bk,21,[Zp('交換的事，還沒跟你說完。……一月底學校會公布。')],'zr_z7_break');
        const nb=S.dayOfKey('2027-01-28'); if(nb!=null&&(G.day>nb||(G.day===nb&&G.hour>=21))&&G.day<=nb+20&&(ED('ev_zhiruo_applied')||PHONE.sent(G,'zr_z7_break'))&&!PHONE.sent(G,'zr_z7b')){
          const opts=[knowsP?{t:'恭喜。五月見分曉。',say:[Zp('嗯。五月。')],set:{ZR_Z7B:'congrats'}}:{t:'恭喜。五月我陪妳一起等。',say:[Zp('你又不能幫我等。……好。謝謝。')],set:{ZR_Z7B:'wait'}}];
          if(F.ZR_Z7_MOM) opts.push({t:'妳媽有說『穿暖一點』嗎？',say:[Zp('有。她說了兩次。')],set:{ZR_Z7B:'mom'}});
          opts.push({t:'（貼圖：一隻舉著咖啡杯的貓）',post:'（貼圖：一隻舉著咖啡杯的貓）',say:[Zp('……這隻貓的杯子拿反了。')],set:{ZR_Z7B:'sticker'}});
          const L=[Zp('學校那一關過了。'),Zp('還要等英國那邊。他們說五月。')]; if(!knowsP) L.push(Zp('……所以先不哭。五月再說。'));
          L[L.length-1]=Object.assign(L[L.length-1],{ask:{id:'zr_z7b',opts}}); PHONE.at(G,nb,21,L,'zr_z7b'); F.ZR_NOMINATED=true; } } }
    /* 學姊 M3 放榜（BB_97 2-7；大二下第 4 週週五 3/19 20:00，AA-B 定第 4 週）：所有玩家看到的都是家族群組（她先告訴家人和伴侶，畫面外）。
       ASKED_TELL_ME（M2 選了「不管考得怎樣都要說」）＝她 @祐廷 多一則；玩家可以回三個（咖哩那個要有 FAMILY_DINNER 記憶）；回了或到 22:00 沒回，她最後對全家族一句 */
    { const d=S.dayOfKey('2027-03-19'); if(S.SIS_Y2_EXAM&&d!=null&&PHONE.inGroup(G,'family_law')){ const W=t=>({th:'g:family_law',from:'heroine_05',name:'溫學姊',text:t}), K=t=>({th:'g:family_law',from:'kevin',name:'Kevin',text:t}), LAST='計畫本最後那一格，我寫好了。聚餐那天說。';
        if((G.day>d||(G.day===d&&G.hour>=20))&&G.day<=d+3&&!PHONE.sent(G,'sis_m3')){ const tell=typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','ASKED_TELL_ME'), curry=typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','FAMILY_DINNER');
          const opts=[{t:'恭喜學姊！',say:[W('謝謝。'),W(LAST)],set:{SIS_M3_REPLY:'congrats'}},{t:'我就知道。',say:[W('你不知道。你只是希望。……謝謝。'),W(LAST)],set:{SIS_M3_REPLY:'knew'}}];
          if(curry) opts.push({t:'（貼一張咖哩的照片）',post:'📷（咖哩）',say:[W('……好。考完說好的那家。'),W(LAST)],set:{SIS_M3_REPLY:'curry'}});
          const L=[W('上了。'),W('換了題目的那個。'),K('學姊上榜了！！！'),W('收到。'),K('學姊妳可以多講兩個字'),W('謝謝。')]; if(tell) L.push(W('@'+(G.name||'祐廷')+' 你說不管考得怎樣都要說。我說了。'));
          L[L.length-1]=Object.assign(L[L.length-1],{ask:{id:'sis_m3',until:d*24+22,opts}}); PHONE.at(G,d,20,L,'sis_m3'); }
        if(PHONE.sent(G,'sis_m3')&&!F.SIS_M3_REPLY&&G.day*24+G.hour>=d*24+22&&!PHONE.sent(G,'sis_m3_last')){ F.SIS_M3_REPLY='none'; PHONE.at(G,d,22,[W(LAST)],'sis_m3_last'); } } }
    /* 上榜的家族聚餐（BB_97 2-7b；大二下第 5 週週五 3/26 19:00）：M3 那晚 21:00 Kevin 在家族群組揪（「去。」才排出遊，照大一家聚的做法）；
       有 FAMILY_DINNER 記憶＝永康街那家咖哩，沒有＝公館。沒去（沒答應或沒到）＝21:30 群組合照＋Kevin 一句 */
    { const d=S.dayOfKey('2027-03-26'), m3=S.dayOfKey('2027-03-19'); if(S.SIS_Y2_EXAM&&d!=null&&m3!=null&&PHONE.inGroup(G,'family_law')&&G.day>=m3&&G.day<=d+1){ const K=t=>({th:'g:family_law',from:'kevin',name:'Kevin',text:t}), curry=typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','FAMILY_DINNER');
        if(!PHONE.sent(G,'sis_m3_dinner_inv')&&(G.day>m3||G.hour>=21)) PHONE.at(G,m3,21,[Object.assign(K(curry?'學姊上榜聚餐！下週五七點，永康街那家咖哩。全家族。':'學姊上榜聚餐！下週五七點，公館的日日定食。全家族。'),{ask:{id:'sis_m3_dinner',until:d*24+18,opts:[{t:'去。',set:{SIS_M3_DINNER_GO:true}},{t:'這次不行。',set:{SIS_M3_DINNER_GO:false}}]}})],'sis_m3_dinner_inv');
        if(F.SIS_M3_DINNER_GO===true&&typeof OUT!=='undefined'&&!OUT.get(G,'sis_m3_dinner')) OUT.plan(G,{id:'sis_m3_dinner',ev:'ev_sis_results_dinner',day:d,h:19,late:0.25,place:curry?'永康街的咖哩店':'公館的日日定食',title:'學姊上榜聚餐',travel:curry?'約 20 分鐘':'走過去約 10 分鐘',travelH:curry?1/3:1/6});
        if(!(G.events&&G.events.done&&G.events.done.ev_sis_results_dinner)&&(G.day>d||G.hour>=21.5)&&!PHONE.sent(G,'sis_m3_dinner_photo'))
          PHONE.at(G,d,21.5,[K('📷（合照。學姊坐中間，難得笑得很開。）'),K('沒來的人錯過學姊請客。千載難逢。')],'sis_m3_dinner_photo'); } }
    /* 學姊 W8 沒演到的玩家的兩則（讀書會群組她請假、家族群組 Kevin「學姊請假了？？」）都刪：法服沒有讀書會（BB_191 §7-3）；Kevin 那句單獨留著會讓人以為學姊還在法服（AA-C 2af03a63）*/
    { const d13=S.dayOfKey('2026-11-13'); if(d13!=null&&G.day===d13&&S.fafuMember(G)&&PHONE.inGroup(G,'lawclub_study')&&!PHONE.sent(G,'fair_y2_call')) PHONE.at(G,d13,21,[{th:'g:lawclub_study',from:'classmate_bohan',text:'明天九點半，攤位集合。'}],'fair_y2_call');   /* AA_369 第 4 節：語彤不在法服（口氣表 0-3），句子不改；第 7 節第 10 題（AA 19:5x）：說話的人是柏翰（大二排法服班、大三發市集通知的都是他，r2y3a3d.js 2-Y3-15 同一個群組） */
      const d12=S.dayOfKey('2026-11-12'), fr=()=>['FRIEND','CLOSE_FRIEND'].includes(typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel('zhe'):'');   /* 只在那一天問（friendLevel 會替沒有紀錄的人建一筆空的關係）*/
      if(d12!=null&&G.day===d12&&!F.ZHE2_ASKED&&!PHONE.sent(G,'zhe2_msg')&&fr()){ F.ZHE2_ASKED=d12; PHONE.at(G,d12,20.25,[{th:'p:zhe',from:'player',who:null,text:'今天週四，你沒去麵店？'}],'zhe2_ask'); PHONE.at(G,d12,20.5,[{th:'p:zhe',from:'zhe',text:'沒事啦，在練球',ask:{id:'zhe2_go',until:d12*24+21.5,opts:[{t:'我去找你。',set:{ZHE2_GO:d12}}]}}],'zhe2_msg'); }
      if(typeof OUT!=='undefined'&&F.ZHE2_GO===G.day&&!OUT.get(G,'zhe2_court')&&!F.ZHE2) OUT.plan(G,{id:'zhe2_court',ev:'ev_zhe_court_y2',day:G.day,h:21,late:0.5,place:'新體育館旁的籃球場',title:'籃球場（阿哲）',travel:'走過去約 10 分鐘',travelH:1/6}); }
    /* ===== 大二（交接包 v3）的群戲：邀約＋出發選單＋沒去的群組照片（AA_143、AA_177 第 6 節、AA_176 R5）=====
       不在麵店團群組的玩家：阿哲私訊（R5「沒有那個群組就用私訊」）。19:15／18:15 還沒出發＝沒去（OUT 的 late 15 分鐘），21:30 照片 */
    if(typeof OUT!=='undefined'){ const gth=PHONE.inGroup(G,'noodle_team')?'g:noodle_team':'p:zhe', Z=t=>({th:gth,from:'zhe',text:t}), dk=k=>S.dayOfKey(k);
      const v3=[{id:'y2_first_meal',ev:'ev_y2_first_meal',key:'2026-09-17',inv:[0,17,'開學第一頓 七點，長桌'],h:19,place:'阿鳳麵店',title:'開學第一頓',travel:'走過去約 15 分鐘',photo:'📷（長桌上六碗麵，一碗是大碗。）'},
                {id:'y2_midautumn',ev:'ev_y2_midautumn',key:'2026-09-25',inv:[-1,21,'明天中秋，河濱，晚上六點 烤肉架今年你負責'],h:18,place:'公館的河濱',title:'中秋烤肉',travel:'走過去約 15 分鐘',photo:'📷（兩個烤肉架，少一支夾子。）'},
                {id:'y2_xmas',ev:'ev_y2_xmas',key:'2026-12-17',inv:[-1,21,'聖誕交換禮物，明天中午，霖澤館一樓 兩百以內'],h:12+20/60,place:'霖澤館一樓',title:'聖誕交換禮物',travel:'走過去約 10 分鐘',photo:'📷（一堆拆開的包裝紙。）'}
               ];   /* 跨年大二搬到 S.nyeY2（AA_210 第 1 節：16 週制 12/31 在寒假，邀約五句、23:30、沒去的照片換掉）。聖誕交換 12/24 是第 16 週期末考週，改 12/17（四）12:20（AA_313 第 4-1 節第 8 點）*/
      for(const q of v3){ const d=dk(q.key); if(d==null) continue; const di=d+q.inv[0];
        if((G.day>di||(G.day===di&&G.hour>=q.inv[1]))&&G.day<=d&&!PHONE.sent(G,q.id+'_ask')){ PHONE.at(G,di,G.day===di?Math.max(q.inv[1],h(G)):q.inv[1],[Z(q.inv[2])],q.id+'_ask');
          if(!OUT.get(G,q.id)&&(G.day<d||h(G)<q.h+0.25)) OUT.plan(G,{id:q.id,ev:q.ev,day:d,h:q.h,late:0.25,place:q.place,title:q.title,travel:q.travel,travelH:0.25}); }
        const pH=q.photoH||21.5, o=OUT.get(G,q.id); if(o&&o.state==='missed'&&!(G.events.done[q.ev])&&(G.day>d||G.hour>=pH)&&G.day<=d+2&&!PHONE.sent(G,q.id+'_photo')) PHONE.at(G,d,pH,[].concat(q.photo).map(Z),q.id+'_photo'); }   /* photo 可以是好幾則（跨年：照片＋阿哲一句）；photoH：照片的時間（跨年 00:05）*/
      S.nyeY2(GM); S.nyeY3(GM); S.nyeY4(GM); S.kxNye(GM); S.zrNye(GM);
      /* 期末最後一頓（大二上；AA_177 第 6 節）：最後一科考完那天 17:00 阿哲「考完了 七點，麵店」；那晚 21:30 還沒吃到＝群組照片。事件是走進麵店（ev_term_last_meal_y2s1）*/
      { const e=typeof CLS!=='undefined'&&CLS.lastExamEnd?CLS.lastExamEnd(G,'Y2S1','final'):null; if(e&&G.day===e.day&&G.flags.noodleTableDay!=null){ if(G.hour>=17&&!PHONE.sent(G,'y2_final_ask')) PHONE.at(G,e.day,Math.max(17,h(G)),[Z('考完了 七點，麵店')],'y2_final_ask');
          if(G.hour>=21.5&&!G.events.done.ev_term_last_meal_y2s1&&!PHONE.sent(G,'y2_final_photo')) PHONE.at(G,e.day,21.5,[Z('📷（空碗疊成一座塔。）')],'y2_final_photo'); } } }
    /* 明軒 F-M1 最便宜的地圖（BB_70 5-6，BB-B 2026-10-16 補，BB_134 第 3 節）：M1 公車站的筆記（SAW_HIM_STUDY）那晚 23:00，他私訊傳「公館一百元以內」的手機筆記；
       訊息到了就進筆記本（S.MX_FM1）。地圖上七家店的「100」小標先不做（BB_70：做不到就只放在手機筆記）。舊存檔已經有 SAW_HIM_STUDY 的：今晚 23:00 */
    if(typeof SOCIAL!=='undefined'&&SOCIAL.has('classmate_mingxuan','SAW_HIM_STUDY')){
      if(!PHONE.sent(G,'mx_fm1')){ const d=F.MX_M1_DAY!=null?F.MX_M1_DAY:G.day, M=t=>({th:'p:classmate_mingxuan',from:'classmate_mingxuan',text:t}); PHONE.at(G,d,d===G.day?Math.min(23.9,Math.max(23,h(G)+0.05)):23,[M('給你 公館一百塊以內的'),M('不要外流 哈哈'),M('📝 '+S.MX_FM1.head)],'mx_fm1'); }
      else if(GM.addNote&&GM.hasNote&&!GM.hasNote('mx_fm1')&&(G.msgs||[]).some(m=>m.tag==='mx_fm1')) GM.addNote('mx_fm1',S.MX_FM1.title,S.MX_FM1.body); }
    /* SK02 你的系外套還在這裡（BB_106 SK02；AA_154 A52 ②）：SK01 之後，阿勳第 4 週週一 15:00 的私訊（SK01 比那天晚：SK01 隔天以後第一個平日；第 7 週以後就不發）；
       ②送給阿勳、他不在旁邊＝當晚 21:00 兩則私訊（BB-B d5224961）。SK01 傳過訊息就把阿勳加進聯絡人（不跳通知）*/
    if(F.SK01_DAY!=null){ silentContact('econ_zhengxun');
      if(F.SK02_DM_DAY==null&&!F.ECON_JACKET){ const d=S.sk02DmDay(G); if(d!=null){ F.SK02_DM_DAY=d; PHONE.at(G,d,15,[{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'系辦說你去年開學訂的系外套到了。你休學以後才到的。'}],'sk02_dm'); } }
      if(F.SK02_GIFT_DM&&F.SK02_DAY!=null&&!PHONE.sent(G,'sk02_gift')) PHONE.at(G,F.SK02_DAY,21,[{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'系辦說你把外套給我了。'},{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'我現在有兩件，輪流穿。'}],'sk02_gift'); }
    /* SK05 三閃，販賣機見（大一版；BB_135 第 2 節；AA-B 2026-10-16：期末考週（16 週制＝第 16 週）第一個晚上玩家在霖澤館（22:55～23:30；23:00 以後才走進去＝一進去就亮））：
       23:00 阿勳傳訊息說暗號（一年一次）。法律系時期一直沒見過他的玩家（MET_XUN 沒有）先多一則「盧正勳。你經濟系那年的室友。……你該不會連我都忘了。」。pact 多兩句、night 多一句（都有＝先 pact 再 night）。
       三個回覆：閃三下＝SK05_GO（今晚 23:00～23:45 他在法學院廣場的販賣機前，events.js ev_sk05_vending_y1）；閃一下、只回訊息＝這一年沒有這五分鐘 */
    { const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, hh=h(G);
      if(T&&T.id==='Y1S2'&&T.week===16&&(G.zone==='linze'||G.zone==='classroom')&&hh>=22+55/60&&hh<23.5&&!PHONE.sent(G,'sk05_y1')){
        silentContact('econ_zhengxun'); const th='p:econ_zhengxun', X=t=>({th,from:'econ_zhengxun',text:t}), N=t=>({th,who:null,text:t}), d=G.day;
        const items=[]; if(!F.MET_XUN) items.push(X('盧正勳。你經濟系那年的室友。……你該不會連我都忘了。'));   /* BB-B 2026-10-16 第①級：照 BB_96 10-1 原文（少後半句會變成熟人正經地重新自我介紹）*/
        items.push(X('你們那邊燈還亮著。'),X('我在社科院四樓，窗邊。看對面。'),N('（對面的窗，燈閃了一下。）'),X('一閃是還活著。兩閃是救我。'));
        const last=X('三閃是販賣機見。'); const opts=[{t:'（閃三下）',set:{SK05_GO:d},say:[X('……真的？好，五分鐘。')]},{t:'（閃一下）',set:{SK05_Y1_REPLY:'one'},say:[X('好。活著就好。')]},{t:'還活著。',set:{SK05_Y1_REPLY:'text'},say:[X('用閃的比較快。……好啦，加油。')]}];
        const tail=[]; if(F.XUN_PACT) tail.push(N('（對面的窗又閃了三下。）'),X('我先閃了。')); if(F.XUN_NIGHT) tail.push(X('這次不用等你了。'));
        if(tail.length){ items.push(last,...tail.slice(0,-1),Object.assign(tail[tail.length-1],{ask:{until:d*24+23.75,opts}})); } else items.push(Object.assign(last,{ask:{until:d*24+23.75,opts}}));
        PHONE.at(G,d,Math.max(23,hh+0.02),items,'sk05_y1'); }
      if(F.SK05_GO!=null&&!F.SK05_Y1&&(G.day>F.SK05_GO||hh>=23.75)&&!PHONE.sent(G,'sk05_noshow_y1')) PHONE.at(G,F.SK05_GO,23.75,[{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'……你閃了三下又不來。'},{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'明年再說。'}],'sk05_noshow_y1'); }
    /* ---- BB_106 SK06、SK07、4-2（企劃線 71b3e6c3，AA-C 10-18 審過；V2-SK06、V2-SK07、V1-B106-42）：經濟系那群的群組＝「走啦」econ_friends（經濟系開局沒進的＝經濟系全班群組）。
       可昕的那幾句只在交往中（分開了：她在群組照常說話，但不接祐廷的話、不提他——那幾句都不出現，BB_104 6-4）----*/
    if(!S.isEcon(G)){ const EG=PHONE.inGroup(G,'econ_friends')?'econ_friends':(PHONE.inGroup(G,'econ_class')?'econ_class':null), TG='g:'+EG, hh=h(G), kx=F.dating_kexin===true;
      const EM=(from,name)=>t=>({th:TG,from,name,text:t}), PYm=EM('econ_pinyu','品妤'), TRm=EM('econ_tangrui','唐睿'), WLm=EM('econ_weilun','韋綸'), XUm=EM('econ_zhengxun','阿勳'), KXm=EM('kexin',undefined);
      const atH=(d,hr)=>G.day===d?Math.max(hr,hh+0.02):hh+0.02;   /* 那一天：照時間；晚到（讀檔、跳過時間）＝現在 */
      /* SK06：大一下第 10 週週一 16:00 品妤私訊（晚於那天才走到這裡＝今天或明天）；第 15 週週一 21:00 還沒去＝群組一則（照樣記 SOC_ROAD_PERSON）*/
      { const d0=termDay('Y1S2',10,1), d1=termDay('Y1S2',14,5), d15=termDay('Y1S2',15,1);
        if(d0!=null&&d1!=null&&F.SK06_DM_DAY==null&&!F.SOC_ROAD_PERSON&&G.day>=d0&&G.day<=d1){ const d=G.day+(hh>=19?1:0);
          if(d<=d1){ silentContact('econ_pinyu'); F.SK06_DM_DAY=d; PHONE.at(G,d,d===G.day?Math.max(16,hh+0.02):16,[{th:'p:econ_pinyu',from:'econ_pinyu',text:'我們的報告卡在一個法律問題。社科院三樓討論室。一杯紅茶。'}],'sk06_dm'); } }
        if(d15!=null&&EG&&F.SK06_DM_DAY!=null&&!F.SOC_ROAD_PERSON&&(G.day>d15||(G.day===d15&&hh>=21))&&!PHONE.sent(G,'sk06_missed')){ F.SOC_ROAD_PERSON=true; F.SK06_CHOICE='missed'; PHONE.at(G,d15,21,[PYm('報告拿 A-。最後一頁謝了一個沒來的法律系路人。')],'sk06_missed'); } }
      /* SK07：大一下第 14 週週一 21:00 唐睿在群組「給我一個觀眾。一個就好。」＋排進行程：第 14 週週三 19:00 博雅的教室（出發選單；不去＝品妤傳影片，ev_sk07_improv 的 outingMissed）*/
      /* AA_459 第 4 節：那天晚上 19:00 已經排了法律生活營的籌備會（vac3d.js 的 vac_<C02>_prep，報了隊輔的第 14 週週三 19:00）＝唐睿那則多一句、要回，不直接排：
         「我去。」＝排出遊（SK07_GO）；「那天晚上有籌備會。」＝唐睿「好。品妤會錄。」、不排，那天晚上品妤照 ev_sk07_improv 沒到的那一版傳影片（沒回也一樣）。沒有撞期的照舊直接排。只修這一則（其他直接排的出遊不查撞期）；SK07_ASKED：問過的那個週三（舊存檔沒有＝沒問過）*/
      { const mon=termDay('Y1S2',14,1), wed=termDay('Y1S2',14,3), plan=()=>{ if(typeof OUT!=='undefined'&&!OUT.get(G,'sk07_improv')) OUT.plan(G,{id:'sk07_improv',ev:'ev_sk07_improv',day:wed,h:19,late:0.25,place:'博雅教學館',title:'唐睿的即興劇',travel:'走過去約 10 分鐘',travelH:1/6}); };
        if(EG&&mon!=null&&wed!=null&&!PHONE.sent(G,'sk07_call')&&(G.day>mon||(G.day===mon&&hh>=21))&&(G.day<wed||(G.day===wed&&hh<19))){
          const clash=typeof OUT!=='undefined'&&OUT.rec(G).some(q=>q.day===wed&&q.state==='planned'&&q.vac&&q.vac.k==='prep'&&Math.abs(q.h-19)<1.5);
          PHONE.at(G,G.day,G.day===mon?Math.max(21,hh+0.02):hh+0.02,[TRm('給我一個觀眾。一個就好。')].concat(clash?[Object.assign(TRm('禮拜三晚上七點，博雅。'),{ask:{id:'sk07_ask',until:wed*24+19,opts:[{t:'我去。',set:{SK07_GO:true}},{t:'那天晚上有籌備會。',set:{SK07_GO:false},say:[TRm('好。品妤會錄。')]}]}})]:[]),'sk07_call');
          if(clash) F.SK07_ASKED=wed; else plan(); }
        if(F.SK07_ASKED===wed&&wed!=null){ if(F.SK07_GO===true&&(G.day<wed||(G.day===wed&&hh<19.25))) plan();
          else if(F.SK07_GO!==true&&(G.day>wed||(G.day===wed&&hh>=21.5))&&!PHONE.sent(G,'sk07_video')){ const ev=typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.find(e=>e.id==='ev_sk07_improv'); if(ev&&ev.outingMissed) ev.outingMissed(G,GM,{day:wed}); } } }
      /* 4-2 經濟系群組的三則（＋畢業前一句）：①大三下第 12 週週四（5/11）21:00 韋綸貼畢業照（經濟系大四下拍畢業照那一週）②大四上第 4 週週二 21:00 唐睿徵受試者（他們畢業後第一個秋天）
         ③大四下第 6 週週三 21:00 韋綸四張門票（「走。」＝那個週六 18:30 出遊、摘要帶過，那晚不能另排別的事：must）④大四下第 15 週週五 21:00 下一季（畢業前）。日子是 LAWWW 定的（給 AA 的問題）*/
      if(EG){
        { const d=termDay('Y3S2',12,4); if(d!=null&&G.day===d&&!PHONE.sent(G,'b106_42_photo')){
            const all=[PYm('全系？'),WLm('全系。'),XUm('全系。'),TRm('我以為我藏得很好。')].concat(F.TANG_REHEARSAL?[TRm('我練了四年。最後是她先說的。')]:[]);   /* TANG_REHEARSAL：經濟系 T2（AA_218 刪了；只剩已經演過的舊存檔）*/
            const opts=[{t:'「恭喜。」',post:'恭喜。'},{t:'（貼一張鼓掌的貼圖）',post:'（貼圖：鼓掌）'}]; if(F.KNOWS_TANG) opts.push({t:'「我們全系都知道。」',post:'我們全系都知道。',say:all});   /* ③只有 KNOWS_TANG 的玩家（BB_112 T1／T2；經濟系那年轉過來的、SK04 揭曉的都有）*/
            const items=[WLm('📷（畢業照。照片的角落，唐睿和品妤撐同一把傘。）'),WLm('等一下。放大第三排右邊。'),PYm('不要問。'),TRm('是她先的。'),PYm('唐睿。'),TRm('……是我先的。')]; if(kx) items.push(KXm('我大一就看出來了。只是那時候沒有人問我。'));
            Object.assign(items[items.length-1],{ask:{id:'b106_42_photo',until:(d+3)*24+23.9,opts}}); PHONE.at(G,G.day,atH(d,21),items,'b106_42_photo'); } }
        { const d=termDay('Y4S1',4,2); if(d!=null){ const nobody=[PYm('「在一間做消費者研究的公司帶焦點座談。我還是在聽人講話，只是現在有人付錢。」'),PYm('他每天都這樣介紹自己。')];   /* ③不回：品妤替他回答②那一句，後面加一句 */
            if(G.day===d&&!PHONE.sent(G,'b106_42_survey')){ const opts=[{t:'「法律系的可以嗎？」',post:'法律系的可以嗎？',say:[TRm('不行。你們會反問主持人。')].concat(kx?[KXm('那政大法律的呢？'),TRm('更不行。')]:[])},
                {t:'「你現在在做什麼？」',post:'你現在在做什麼？',say:[TRm('在一間做消費者研究的公司帶焦點座談。我還是在聽人講話，只是現在有人付錢。')]},{t:'（不回）',post:false,say:nobody}];
              PHONE.at(G,G.day,atH(d,21),[Object.assign(TRm('徵求座談的受試者：二十到三十歲、每週喝三杯以上手搖飲。車馬費五百。'),{ask:{id:'b106_42_survey',until:(d+1)*24+21,opts}})],'b106_42_survey'); }
            const m=PHONE.byAsk?PHONE.byAsk(G,'b106_42_survey'):null; if(m&&m.ans==null&&G.day*24+hh>(d+1)*24+21&&!PHONE.sent(G,'b106_42_survey_none')) PHONE.at(G,G.day,hh+0.02,nobody,'b106_42_survey_none'); } }   /* 一直沒打開手機也算不回 */
        { const d=termDay('Y4S2',6,3), sat=d!=null?d+3:null;
          if(d!=null&&G.day===d&&!PHONE.sent(G,'b106_42_ticket')){ const opts=[{t:'「走。」',post:'走。',set:Object.assign({WL_GAME_GO:sat},kx?{WL_GAME_KX:true}:{}),say:kx?[KXm('我自己買票，坐你們旁邊。')]:[]},   /* WL_GAME_KX：可昕說了要來（AA_383 第 4-1 節，球場最後那一句）*/{t:'「這週要讀書。」',post:'這週要讀書。',set:{WL_GAME_GO:false},say:[WLm('那下一場。勝率比較高。')]}];
            const items=[WLm('📷（四張球賽門票）'),WLm('走啦！公司給的。')]; if(kx) items.push(KXm('四張。……韋綸，你數過人數嗎？'));
            Object.assign(items[items.length-1],{ask:{id:'b106_42_ticket',until:sat*24+17,opts}}); PHONE.at(G,G.day,atH(d,21),items,'b106_42_ticket'); }
          if(sat!=null&&F.WL_GAME_GO===sat&&typeof OUT!=='undefined'&&!OUT.get(G,'b106_wl_game')&&(G.day<sat||(G.day===sat&&hh<18.5))) OUT.plan(G,{id:'b106_wl_game',ev:'ev_b106_42_game',day:sat,h:18.5,late:0.5,must:true,place:'球場',title:'球賽（韋綸的門票）',travel:'捷運 約 30 分鐘',travelH:0.5});
          const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'b106_wl_game'):null; if(q&&q.state==='done'&&!F.WL_GAME&&!PHONE.sent(G,'b106_42_game_photo')){ F.WL_GAME=true; PHONE.at(G,G.day,G.day===sat?Math.max(22,hh+0.02):hh+0.02,[WLm('📷（看台上的合照）'),WLm('我們隊輸了。可是我算過，下一場的勝率是百分之五十四。')],'b106_42_game_photo'); } }
        { const d=termDay('Y4S2',15,5); if(d!=null&&G.day===d&&!PHONE.sent(G,'b106_42_next')) PHONE.at(G,G.day,atH(d,21),[WLm(F.WL_GAME?'下一季的門票，還是四張。':'下一季的球賽。你欠我一場。')],'b106_42_next'); } } }
    /* V2-C13 交往中的可昕：大一下第 11 週週四（B4 演講那天）22:00「演講怎樣？」（AA_172 第 5 節；她兩則照 AA_115 L95；回應 BB-B 4087b3b7，BB_107 5-1，法律審查過）。
       三個回覆，第一個的字照 B4：聽完／只聽前半／沒去；回覆開到隔天 18:00，不回不扣分、不記旗標 */
    { const thu=termDay('Y1S2',11,4);
      if(thu&&F.dating_kexin&&G.day>=thu&&G.day<=thu+1&&!(G.day===thu&&h(G)<22)&&!PHONE.sent(G,'kx_b4_ask')){ const K=t=>({th:'p:kexin',from:'kexin',text:t}), st=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.stateOf?ACTIVITIES.stateOf(G,'B4'):null;
        const called=['答出來一半。民總老師問：一個十七歲的人自己去買機車，契約算不算數？','我說要看爸媽同不同意。老師說對，又問：那如果他騙店員說自己成年了呢？','……我就卡住了。全班都在看我。下次我要先查好再去上課。'];
        const o1=st==='full'?{t:'講者最後問：『被限制的那個人，最後可以去哪裡？』',say:[K('這題我要偷走。')]}/* AA_313 第 2 節第 27 列：互考的比賽拿掉（原本「下次互考，我出給你。」）*/:(st?{t:'我只聽了前半。',say:[K('前半也算。後半我幫你編一個結局。')]}:{t:'我沒去。',say:[K('沒關係。我今天也很想沒去——我被點名了。')]});
        PHONE.at(G,thu,22,[K('演講怎樣？'),Object.assign(K('我今天在系上被教授點名了，好丟臉。'),{ask:{until:(thu+1)*24+18,opts:[o1,{t:'被點名？妳答出來了嗎？',say:called.map(K)},{t:'先說妳的。演講的事等一下說。',say:[K('你先問我的喔。……好，那我先說。')].concat(called.map(K))}]}})],'kx_b4_ask'); } }
    /* 沛珊「欠的，還了。」（BB_96 3-7；BB-B 2026-10-16 02:00）：大一下第 16 週週日 21:00 在班級群組，只有沛珊說話、沒有別人接話。第 11 週選「沒關係」（PS_CANCEL:'ok'）的玩家看到「欠的，還了。」，
       其他玩家（另外兩個選項、沒去女舍、不回）看到「期末加油。」——同一則公開訊息，只有後半句不同。沒有沛珊聯絡方式的玩家，整條線不發生。玩家三選一（貼圖／「謝謝！」／不回），沒有後續、不記數值 */
    { const sun=S.dayOfKey('2026-06-07');   /* AA_198 第 5 節：原本第 16 週週日＝6/14 已經考完，「期末加油」不成立 → 6/7（日）*/
      if(sun&&G.day>=sun&&G.day<=sun+1&&!(G.day===sun&&h(G)<21)&&!PHONE.sent(G,'ps_owed')&&typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,'classmate_peishan')&&PHONE.inGroup(G,'law_class'))
        PHONE.at(G,sun,21,[{th:'g:law_class',from:'classmate_peishan',text:'📄 刑總二重點。'+(F.PS_CANCEL==='ok'?'欠的，還了。':'期末加油。'),ask:{opts:[{t:'（貼一個貼圖）',post:'（貼圖）'},{t:'謝謝！'}]}}],'ps_owed'); }
    /* W3b 不讓步的晚上（BB_96 2-4；文章 BB 137bf31，不是法律、不需法律審查）：ev_grad_debate 之後每兩週一次，20:30，大一下到大二上（學期中；BB_205 第 4 節：大二下不發）。
       AA_284 1-5：私訊（不在讀書會群組發），只給演過 ev_grad_debate 的；上一篇沒回就不發下一篇（舊存檔沒有編號的當作回過）。三篇輪流；第一次的開頭依 W3_STANCE 換一句（BB_96 2-3 回聲）；
       玩家的三個反例都打畫線那一句（AA_398 第 16 列），她的回應依反例、長回覆折起來（fold：手機上點開看全文）；記 ARGUED_GOOD（累計）。三篇都輪過以後：「這篇你讀過了。」玩家選哪一點有問題（第二點＝「對。」，其他＝「再讀一次。」，不扣分）。
       摘要日／精華日還沒做，時間先定 20:30（「晚上 21:00 前」）*/
    { const dd=G.events&&G.events.last?G.events.last.ev_grad_debate:null;
      if(dd!=null&&G.day>dd){ const k=Math.floor((G.day-dd)/14)-1, d=dd+14*(k+1), tg='w3b_'+k, tm=typeof CALENDAR!=='undefined'?CALENDAR.termOf(d):null;
        const n0=F.W3B_N|0, prev=n0>0?PHONE.byAsk(G,'w3b_q_'+(n0-1)):null;   /* 上一篇沒回（還開著或過期沒回）就不發下一篇 */
        if(k>=0&&tm&&['Y1S2','Y2S1'].includes(tm.id)&&G.day<=d+1&&!(G.day===d&&h(G)<20.5)&&!PHONE.sent(G,tg)&&!(prev&&prev.ans==null)){
          silentContact('heroine_05');
          const n=n0, A=W3B_ART[n%3], th='p:heroine_05', W=(t,o)=>Object.assign({th,from:'heroine_05',text:t},o||{}), ME=t=>({th,from:'player',text:t}); let items;
          if(n<3){ const open=n===0&&W3B_OPEN[F.W3_STANCE]?[W(W3B_OPEN[F.W3_STANCE])]:[W('這篇。我畫線的是這一句。')];   /* BB_161 ⑧：第一次依立場的那一句「取代」開頭（沒有立場＝照舊）；AA_398 第 16 列：不列三個論點，只傳畫線那一句 */
            items=open.concat([W('📄 校刊投書〈'+A.title+'〉'),
              W('『'+A.pts[1]+'』',{ask:{id:'w3b_q_'+n,opts:A.cx.map((c,i)=>({t:c[0],post:c[0],say:[W(W3B_RESP[i]),ME('哪裡。'),W(A.long[0],{fold:A.long}),ME('那我換一個反例。'),W('……你的論點比上週好。')],
                mem:[{npc:'heroine_05',tag:'ARGUED_GOOD',note:'〈'+A.title+'〉'}]}))}})]); }
          else items=[W('📄 校刊投書〈'+A.title+'〉'),W('這篇你讀過了。這次你先說，哪一段有問題。',{ask:{id:'w3b_q_'+n,opts:['開頭那段','中間那段','最後那段'].map((t,i)=>({t:t+'有問題。',say:[W(i===1?'對。':'再讀一次。')]}))}})];
          /* 原本第 3、6、9…篇後面讀書會成員的回話（柏翰、沛珊）：改私訊以後拿掉（AA_284 1-5）*/
          items.forEach((m,i)=>{ m.dt=i/60; }); PHONE.at(G,d,20.5,items,tg); F.W3B_N=n+1; } } }
    /* 法四學長姊畢業的群組（交接包 v2 C17；AA_71 2-12）：大一下第 15 週週六。法服群組（加入法服的玩家）12:30 有人傳合照＋「恭喜學長姊！法服永遠歡迎回來值班！」（傳的人：法服社長——法三的學長姊、不具名，社團公告的口氣；AA 2026-10-14）；
       家族群組 13:00 Kevin 傳畢業照＋「學姊畢業快樂！！」、學姊「謝謝。」（祐廷大一那年她自己是法四、也畢業：AA_284 1-4；原本 BB_96 第 5 節的「恭喜。」）*/
    { const gd=termDay('Y1S2',15,6); if(gd&&G.day>=gd-1&&G.day<=gd+1){
      if(PHONE.inGroup(G,'lawclub_study')&&!PHONE.sent(G,'grad_lawclub')){ const th='g:lawclub_study'; PHONE.at(G,gd,12.5,[{th,from:'npc_lawclub_pres',name:'法服的社長',text:'📷（學長姊穿學士服、抱著花的合照）'},{th,from:'npc_lawclub_pres',name:'法服的社長',text:'恭喜學長姊！法服永遠歡迎回來值班！'}],'grad_lawclub'); }
      if(PHONE.inGroup(G,'family_law')&&!PHONE.sent(G,'grad_family')){ const th='g:family_law'; PHONE.at(G,gd,13,[{th,from:'kevin',name:'Kevin',text:'📷（書瑀學姊和法四學長姊的畢業照）'},{th,from:'kevin',name:'Kevin',text:'學姊畢業快樂！！'},{th,from:'heroine_05',name:'溫學姊',text:'謝謝。'}],'grad_family'); } } }
    /* 芷若 Z5（BB_96 3-5；交接包 v2）：週五答應（zhiruoFilmDay）＝隔天週六 10:00 的早場（出遊 ev_zhiruo_early_show）；「下次妳挑」的回聲：兩天後 21:00 她傳一張很長的片單
       （單身＝私訊；交往中＝三個人的群組，方奕廷回「這張表要看到明年」）*/
    /* 芷若的午場（BB_96 3-5b）：Z5 拒絕早場（zrDeclineDay，週五）之後第 3 週的週六 09:30 兩則（交往中、她也知道＝多一句「方奕廷也去。」）；回覆到 11:25。「起得來。」＝11:40 出遊（ev_zhiruo_matinee）；「今天不行。」這學期不再約 */
    if(F.zrDeclineDay!=null&&!F.zhiruo_film_date&&typeof OUT!=='undefined'){ const cap=S.dayOfKey('2026-06-06');   /* AA_198 第 5 節：芷若午場上限第 15 週六 6/6 */  let ms=F.zrDeclineDay+22; if(cap!=null&&ms>cap) ms=cap;   /* BB_161 ②：拒絕之後第 3 週的週六，超過第 17 週就排第 17 週週六（Z5 現在可以到第 15 週）*/
      const T3=typeof CALENDAR!=='undefined'?CALENDAR.termOf(ms):null;
      if(T3&&T3.id==='Y1S2'&&T3.week<=17&&ms>F.zrDeclineDay){ const th='p:heroine_02', Z=t=>({th,from:'heroine_02',text:t});
        if((G.day>ms||(G.day===ms&&G.hour>=9.5))&&G.day<=ms&&!PHONE.sent(G,'zr_matinee_ask')){ const L=[Z('今天有午場。你上次說早場起不來。'),Z('十一點四十。這個時間，你總起得來了吧。')]; if(zrGF(G)) L.push(Z('方奕廷也去。'));
          Object.assign(L[L.length-1],{ask:{id:'zr_matinee',until:ms*24+11.25,opts:[{t:'起得來。',set:{ZR_MATINEE:'yes'},say:[Z('好。戲院門口見。午場也是會開演的。')]},{t:'今天不行。',set:{ZR_MATINEE:'no'},say:[Z('好。……那我自己去。我本來就是自己去的。')]}]}});
          PHONE.at(G,ms,9.5,L,'zr_matinee_ask'); }
        if(F.ZR_MATINEE==='yes'&&G.day===ms&&!OUT.get(G,'zr_matinee')) OUT.plan(G,{id:'zr_matinee',ev:'ev_zhiruo_matinee',day:ms,h:11+40/60,late:0.25,place:'公館的二輪戲院門口',title:'公館 11:40：二輪戲院的午場',travel:'走過去約 15 分鐘',travelH:0.25}); } }
    if(F.zhiruo_film_date&&F.zhiruoFilmDay!=null&&typeof OUT!=='undefined'&&!OUT.get(G,'zr_early_show')&&G.day<=F.zhiruoFilmDay+1) OUT.plan(G,{id:'zr_early_show',ev:'ev_zhiruo_early_show',day:F.zhiruoFilmDay+1,h:9+40/60,place:'公館的二輪戲院門口',title:'《進城的那一週》的早場（10:00 開演）',travel:'走過去約 15 分鐘',travelH:0.25});   /* AA_147 第 1 節 #3：09:40 在戲院門口碰面、10:00 開演、約 12:00 去豆漿店 */
    if(F.Z5_NEXT==='hers'&&F.zhiruoFilmSeenDay!=null&&!PHONE.sent(G,'zr_film_list')){ const d=F.zhiruoFilmSeenDay+2;
      if(zrGF(G)){ if(!PHONE.inGroup(G,'zr_film')) PHONE.join(G,'zr_film','進城的那一週'); PHONE.at(G,d,21,[{th:'g:zr_film',from:'heroine_02',text:'📄（一張很長的片單）'},{th:'g:zr_film',from:'npc_fangyt',text:'這張表要看到明年'}],'zr_film_list'); }
      else PHONE.at(G,d,21,[{th:'p:heroine_02',from:'heroine_02',text:'📄（一張很長的片單）'}],'zr_film_list'); }
    /* 子晴 Q5 成發（BB_96 4-4；交接包 v2）：第 13 週週三 21:30 吉他社群組「期末成發你要來。這不是問句。」（伏筆）；成發隔天 10:00：先走的「你看到一半。後半比較好。」、
       收到邀請或是吉他社的人卻沒去＝「你沒來」（ZQ_SHOW absent；之後一週她不約他：zqColdUntil）*/
    { const dInv=termDay('Y1S2',13,3), dShow=termDay('Y1S2',14,3);
      if(dInv&&dShow&&G.day>=dShow-15&&G.day<=dShow+2){ const th='p:heroine_04', Z=t=>({th,from:'heroine_04',text:t});
        if(PHONE.inGroup(G,'guitar')&&!PHONE.sent(G,'zq_show_inv')) PHONE.at(G,dInv,21.5,[{th:'g:guitar',from:'heroine_04',text:'期末成發你要來。這不是問句。'}],'zq_show_inv');
        if(PHONE.inGroup(G,'guitar')&&!PHONE.sent(G,'zq_show_cd')&&G.day<=dShow-14) PHONE.at(G,dShow-14,21,['成發','倒數','十四天','不能請假','都要來'].map((t,k)=>({th:'g:guitar',from:'heroine_04',text:t})),'zq_show_cd');   /* 成發倒數（BB_96 第 5 節）：十四天前 */
        if(G.day>dShow||(G.day===dShow&&G.hour>=21.2)){
          if(F.ZQ_SHOW==='half'&&!PHONE.sent(G,'zq_show_half')) PHONE.at(G,dShow+1,10,[Z('你看到一半。後半比較好。')],'zq_show_half');
          const invited=PHONE.sent(G,'zq_show_inv')||!!F.CLUB_club_guitar, went=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attended(G,'guitar_show_y1s2',dShow);
          if(F.ZQ_SHOW==null&&invited&&!went&&typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_04','FIRST_MET')){ F.ZQ_SHOW='absent'; F.zqColdUntil=dShow+8; PHONE.at(G,dShow+1,10,[Z('你沒來')],'zq_show_absent'); } } } }
    /* 學姊 W2b／W2c、「誰有車？」（BB_96 2-1、2-2、BB_97 2-9；交接包 v2）：大一下的家族群組（法律系直屬家族，給所有人；學姊有伴侶，沒有兩個人的時間）。
       第 3 週週二 21:00 Kevin 開玩笑（說要請全家族飲料＝SAID_TREAT_SIS／貼圖／不回）；週五 21:00 Kevin 揪第 4 週週五 18:30 永康街的咖哩（「去。」＝排出遊 ev_family_dinner；有 SAID_TREAT_SIS 學姊多三句）；
       接著 Kevin「家聚要搬兩箱飲料，誰有車？」（「我有。」＝SAID_HAS_CAR）。聚餐當晚 21:30 學姊「三件事」（W2c，給所有人，沒去也看得到；TREATED_FAMILY 換第三件）。
       沒去聚餐、有 SAID_TREAT_SIS 的期末那三句：要先有 Kevin 揪期末聚餐的那一則（台詞已問 BB）*/
    if(PHONE.inGroup(G,'family_law')&&typeof CALENDAR!=='undefined'){ const th='g:family_law', kv=t=>({th,from:'kevin',name:'Kevin',text:t}), sis=t=>({th,from:'heroine_05',name:'溫學姊',text:t});
      const dJ=termDay('Y1S2',3,2), dI=termDay('Y1S2',3,5), dD=termDay('Y1S2',4,5);
      /* W2b 期末（BB_96 2-1，BB 14265eb）：6/12（五）21:00（AA_198 第 5 節）Kevin 在家族群組揪期末聚餐（只有群組訊息，不另做聚餐事件）；學姊照玩家回：
         去了而且請了（TREATED_FAMILY）＝「收到。這次飲料我請。」；沒去家聚、說過要請（SAID_TREAT_SIS）＝學姊、Kevin、學姊三句；其他＝「收到。」*/
      { const dF=S.dayOfKey('2026-06-12');   /* AA_198 第 5 節：W2b 家族期末聚餐的訊息 6/12 21:00 */ if(dF&&G.day>=dF&&G.day<=dF+1&&!PHONE.sent(G,'fam_final_y1s2')){ const went=typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','FAMILY_DINNER');
          const L=[kv('期末考完，家族聚餐。這次地方我選：公館的火鍋吃到飽。全家族。')];
          if(F.TREATED_FAMILY) L.push(sis('收到。這次飲料我請。'));
          else if(!went&&F.SAID_TREAT_SIS) L.push(sis('你上次說要請全家族飲料。'),kv('結果那天學弟沒來。'),sis('……這次記你的。'));   /* AA_459 2-2：三月她已經知道你是認真的、準時去了——不再說「以為是客套」（tag 照舊）*/
          else L.push(sis('收到。'));
          PHONE.at(G,dF,21,L,'fam_final_y1s2'); } }
      if(dJ&&dI&&dD&&G.day>=dJ-1&&G.day<=dD+1){
        if(!PHONE.sent(G,'fam_joke_y1s2')) PHONE.at(G,dJ,21,[kv('學姊上學期聚餐遲到一分鐘。'),Object.assign(kv('這學期罰她出來吃飯。全家族。'),{ask:{until:dI*24+21,opts:[
            {t:'那學姊來，我請全家族一輪飲料。謝謝她的書。',set:{SAID_TREAT_SIS:true},say:[kv('學弟好勇。'),sis('好啊。')]},{t:'（貼圖）',say:[kv('至少有人回。')]}]}})],'fam_joke_y1s2');
        if(!PHONE.sent(G,'fam_dinner_inv')&&(G.day>dI||(G.day===dI&&G.hour>=21))){ const L=   /* BB_161 ①：學姊那三句是回他那一句的——週五 21:00 送出的當下才看 SAID_TREAT_SIS（玩笑那則可以回到同一天 21:00）*/[Object.assign(kv('下週五六點半，永康街那家咖哩。全家族。'),{ask:{until:dD*24+18,opts:[{t:'去。',set:{FAM_DINNER_GO:true}},{t:'這次不行。',set:{FAM_DINNER_GO:false}}]}})];
          if(F.SAID_TREAT_SIS) L.push(sis('……學弟，你是認真的？'),sis('我以為那是客套話。'),sis('好，六點半。我會準時，你們也不要遲到。'));
          PHONE.at(G,dI,21,L,'fam_dinner_inv');   /* AA_459 2-1：第 3 週週五 21:00 傳、約第 4 週週五＝「下週五」*/ PHONE.at(G,dI,21.3,[Object.assign(kv('家聚要搬兩箱飲料，誰有車？'),{ask:{until:dD*24+18,opts:[{t:'我有。',set:{SAID_HAS_CAR:true},say:[kv('學弟有車！'),sis('……好。之後有用。')]}]}})],'fam_car'); }
        if(F.FAM_DINNER_GO===true&&typeof OUT!=='undefined'&&!OUT.get(G,'fam_dinner_y1s2')) OUT.plan(G,{id:'fam_dinner_y1s2',ev:'ev_family_dinner',day:dD,h:18.5,place:'永康街的咖哩店',title:'家族聚餐',travel:'約 20 分鐘',travelH:1/3});
        /* W2c 聚餐當晚學姊的「三件事。一，今天謝謝大家……」刪，不改成私訊（AA_218 17-12）；舊存檔記過的 FAMILY_THREE_THINGS 照留 */ } }
    /* 除夕：可昕 KN 的訊息（BB_96 9-2；AA_295 不出假設題；接主線 2＝交接包 v2 C2）：交往中，除夕晚上主線 2 演完以後 22:00 她傳（22:00 還沒演＝照樣 22:00 傳，沒有「家裡在講一件事」）。
       「今天家裡在講一件事。」只在有 FAMILY_LAND_Y1；之後再選「妳聽就好。」／「一起看。」（記 KX_FAMILY_LAND）；「一起看」而且主線 2 選了「先問哪幾件事」多一句。
       不回：隔天 9:00「新年快樂。……昨天講到一半，我先睡著了。」（回覆在那之前可以回）。打給妳：電話（她那邊的鞭炮聲、新年快樂、早點睡）寫在對話串裡 */
    { const ny=S.lunarNewYear(); if(ny!=null&&F.dating_kexin&&G.day>=ny-1&&G.day<=ny){ const eve=ny-1, th='p:kexin', K=t=>({th,from:'kexin',text:t});
        if(!PHONE.sent(G,'kx_kn_y1')&&(F.FAMILY_LAND_Y1||G.day>eve||G.hour>=22)){ const land=!!F.FAMILY_LAND_Y1;
          const look=[K('我們還沒教到物權。所以先查清楚，不要猜。')].concat(F.FAMILY_LAND_Y1==='ask'?[K('……可是你先問了大家想要什麼。這很好。')]:[]);
          const opts=[{t:'再吃一輪。',say:[K('……我們家也還在吃。我阿嬤一直夾。')]},
            {t:'打給妳。',say:[K('……好。我去陽台。'),{who:null,text:'（你打過去。她那邊的鞭炮聲還沒停。）'},K('早點睡。')]}];   /* AA_313 第 2 節第 19 列：同一晚已經接過她的電話，這次是你打過去、不再說一次「新年快樂。」*/
          if(land) opts.push({t:'今天家裡在講一件事。',say:[Object.assign(K('我可以只聽，也可以一起看。你選。'),{ask:{until:ny*24+9,opts:[
            {t:'妳聽就好。',set:{KX_FAMILY_LAND:'listen'},say:[{who:null,text:'（她聽你講完大伯、十四個名字、姊姊在旁邊憋笑。）'},K('……你還好嗎？'),{from:'player',who:null,text:'還好。有點好笑。'},K('那就好。')]},
            {t:'一起看。',set:{KX_FAMILY_LAND:'look'},say:[{from:'player',who:null,text:'📷（土地謄本，地號遮住）'}].concat(look)}]}})]});
          const knT=Math.max(22,G.day>eve?22:G.hour+0.05);
          if(!PHONE.sent(G,'kx_kn_call')) PHONE.at(G,eve,knT-0.1,[{th,who:null,text:'（電話響了。她那邊的鞭炮聲。）'},K('新年快樂。')],'kx_kn_call');   /* AA_224 1-6（e6c064a3）：交往中三個 KX_CAR 都先接到電話，只說「新年快樂。」（不分版本、不回收「過」；原本只給 E25 選③）*/
          PHONE.at(G,eve,knT,[Object.assign(K('你們家年夜飯吃完了嗎？'),{ask:{until:ny*24+9,opts}})],'kx_kn_y1'); }   /* AA_313 第 2 節第 19 列：開頭的「新年快樂。」拿掉（電話裡剛說過）*/
        if(G.day===ny&&G.hour>=9&&!PHONE.sent(G,'kx_kn_noreply')){ const m=(G.msgs||[]).find(q=>q.tag==='kx_kn_y1'&&q.ask); if(m&&m.ans==null) PHONE.at(G,ny,9,[K('新年快樂。……昨天講到一半，我先睡著了。')],'kx_kn_noreply'); } } }
    /* 春假三選一的邀約（交接包 v2 C9；草稿第 3 節、BB_96 9-5）：第 5 週週二 21:00 以安在麵店團群組、週三 21:30 可昕（交往中）。收到以後的選擇在 S.springPrompt（S.tick）。
       4/2 過了還沒選＝留在宿舍（不傳可昕的回覆：玩家沒有回她）*/
    { const D=S.springDays(); if(D.inv1&&G.day>=D.inv1-1&&G.day<=D.d0+3){
        if(PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'an_spring_y1')&&G.day<=D.dl) PHONE.at(G,D.inv1,21,[{th:'g:noodle_team',from:'heroine_01',text:'春假要不要一起出去？我做行程表。'}],'an_spring_y1');
        if(F.dating_kexin&&!PHONE.sent(G,'kx_spring_y1')&&G.day<=D.dl) PHONE.at(G,D.inv2,21.5,[{th:'p:kexin',from:'kexin',text:'春假我們開車去哪裡？'},{th:'p:kexin',from:'kexin',text:'我做了行程表。第二頁是我想吃的，第三頁才是行程。'}],'kx_spring_y1');
        if(G.day>D.dl&&F.SPRING_Y1==null&&(PHONE.sent(G,'an_spring_y1')||PHONE.sent(G,'kx_spring_y1'))) S.springChoose(GM,'dorm',{silent:true}); } }
    /* 重訪日 1（交接包 v2 C20；BB_96 9-10）：大一最後一天中午，交往中的玩家可昕傳「最後一天。你說的那張桌子，我六點到。」；收到以後目標改成 18:00 兩點半 Café */
    /* 2026-10-17 使用者取消重訪日（AA_249）：下面整段停用（S.REVISIT_OFF），學期末聚餐的新系統跟 HOLIDAY-SYS 一起做 */
    { const rd=S.REVISIT_OFF?null:S.revisitDay(); if(rd&&G.day===rd&&F.dating_kexin&&!F.REVISIT_Y1){
        if(!PHONE.sent(G,'kx_revisit1')&&G.hour<18) PHONE.at(G,rd,Math.max(12,G.hour),[{th:'p:kexin',from:'kexin',text:'考完了！六點在兩點半，我坐窗邊。'}],'kx_revisit1');   /* AA_209 第 3 節（附錄 B L1985：沒有「那張桌子」的前情）*/
        if(!F.revisitGoalY1&&G.hour>=12&&G.hour<22&&(G.msgs||[]).some(m=>m.tag==='kx_revisit1')){ F.revisitGoalY1=true; GM.setGoal('18:00 兩點半 Café（可昕）'); } }
      /* 沒有和可昕交往（AA 50da3a9）：在麵店團＝17:00 阿哲在群組揪併桌；不在麵店團＝最親近的人（STORY.revisitClosest）。女生 18:00 傳訊息（BB_96 第 11 節）。
         目標的字是 LAWWW 加的（不在麵店團的玩家沒有人揪，用目標提醒傍晚去兩點半）*/
      if(rd&&G.day===rd&&!F.dating_kexin&&!F.REVISIT_Y1){ const grp=PHONE.inGroup(G,'noodle_team');
        if(grp&&!PHONE.sent(G,'zhe_revisit1')&&G.hour<18) PHONE.at(G,rd,Math.max(17,G.hour),[{th:'g:noodle_team',from:'zhe',text:'考完了'},{th:'g:noodle_team',from:'zhe',text:'六點麵店 併桌'}],'zhe_revisit1');   /* AA_209 第 3 節（AA-B 02:23）*/
        if(!F.revisitGoalY1&&G.hour>=12&&G.hour<22){ F.revisitGoalY1=true; GM.setGoal(grp?'18:00 阿鳳麵店（麵店團併桌）':'18:00 兩點半 Café（學期最後一天）'); }
        if(!grp&&!PHONE.sent(G,'revisit1_msg')&&G.hour>=17.5){ const c=S.revisitClosest(G), L=c.kind==='female'?REVISIT_MSG[c.id](G):null; if(L) PHONE.at(G,rd,Math.max(18,G.hour),L.map((t,k)=>({th:'p:'+c.id,from:c.id,text:t})),'revisit1_msg'); } } }
    dailyPhone(GM); };
    S.REVISIT_OFF=true;   /* 使用者 2026-10-17 取消重訪日（AA_249）*/
    S.revisitDay=function(){ return S.dayOfKey('2026-06-12'); };   /* AA_209 第 4 節第 1 點、AA_197 1-6：期末最後一天 6/12（五）（16 週制做好以後改成讀最後一場期末考）*/
  /* 重訪日 1：單身、不在麵店團的玩家，這一年最親近的人（AA 50da3a9、d1fa44f；BB_96 第 11 節）：先看階段、再看熟悉；至少「有點熟」。
     學姊、沛珊這時有伴侶，不算（不傳只給一個人的閒聊私訊）；可昕另外處理。以安、語彤、Alison、芯慈、阿哲（AA 的人物）還沒有台詞，暫時不列（已問 AA）。
     回傳 {id, kind:'male'|'female'|'none'} */
  const REVISIT_MALE=['classmate_bohan','kai','classmate_mingxuan','npc_fangyt','zhe'],   /* 柏翰、阿哲暑假版：AA-B 02:23（AA_209 第 3 節）*/ REVISIT_FEMALE=['heroine_02','heroine_04','heroine_01','heroine_03','yu','classmate_xinci'];   /* 阿哲、以安、語彤、Alison、芯慈：AA 2100018（交接包 v2 草稿第 3 節）*/
  S.revisitClosest=function(G){ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES) return {id:null,kind:'none'}; const st=id=>SOCIAL.STAGES.indexOf(SOCIAL.stage(id)), min=SOCIAL.STAGES.indexOf('FAMILIAR');
    let best=null; for(const id of REVISIT_MALE.concat(REVISIT_FEMALE)){ if(!S.knows(id,G)) continue; if(REVISIT_FEMALE.includes(id)&&typeof INV!=='undefined'&&INV.hasContact&&!INV.hasContact(G,id)) continue;   /* 女生是傳訊息：要有她的聯絡方式 */ const s=st(id); if(s<min) continue; const f=(SOCIAL.rel(id)||{}).fam||0;
      if(!best||s>best.s||(s===best.s&&f>best.f)) best={id,s,f}; }
    return best?{id:best.id,kind:REVISIT_MALE.includes(best.id)?'male':'female'}:{id:null,kind:'none'}; };
  /* 女生的訊息（BB_96 11-2；芷若「我媽」那則不提她喝什麼，也不提交換）*/
  /* W3b 的三篇文章（BB_96 2-4，BB 137bf31；作者寫「校刊投書」、沒有真名）。cx＝玩家的三個反例（極端／實務／換角度），都打第二點；long＝她的長回覆（折起來）*/
  const W3B_OPEN={no:'這篇作者沒跳步。你找找看他哪裡偷懶。',diff:'這篇的結論你大概會同意。我想聽你的理由。',unsure:'這篇比上次短。第二節我先畫了線。'};
  const W3B_RESP=['太極端了，制度不是為極端設計的。','實務上是這樣，但這篇問的是應不應該。','……這個角度我沒想過。但你漏了一步。'];
  const W3B_ART=[
    {title:'總圖應該全面禁止占位',pts:['座位是公共的，占著不用，別人就用不到。','規定要簡單：離開超過三十分鐘就清位，沒有例外。','禁止占位，考試週更多人用得到總圖。'],
     cx:[['有人突然不舒服去保健中心，回來位子就沒了？'],['館員沒有人力每三十分鐘巡一次。'],['三十分鐘，對吃飯的人太短，對午睡的人太長。']],
     long:['畫線那一句的問題不在三十分鐘，在「沒有例外」。','好的規定要先問：它要保護誰。','這篇要保護的是想用位子的人。','可是離開的那個人，也是想用位子的人，只是剛好不在。','所以要分兩種離開：一下子，和不回來。','分不出來的時候，留一個說明的機會，不要讓巡的人自己猜。','你要反駁，就打「沒有例外」這四個字。']},
    {title:'期中考應該全部改成開書考',pts:['背得起來不等於會用。','以後工作都能查資料，開書考比較接近真的工作。','開書考不用作弊，也就沒人作弊。'],
     cx:[['急救的時候，沒有時間查。'],['開書考的題目比較難出，老師改得更久。'],['工作也有不能查的時候，像當面跟人談。']],
     long:['畫線那一句把「真的工作」當成只有一種。','有的時候可以查，有的時候不能查，而且常常是同一份工作。','所以問題不是開書或閉書，是這一科要練哪一種時候。','這篇跳過了一步：先說這一科要練什麼，再選考法。','你的反例，打中的是它跳過的那一步。']},
    {title:'通識課應該取消點名',pts:['大學生是成年人，來不來自己決定。','點名不能證明有學到，所以沒有意義。','老師應該用課吸引人，不是用點名。'],
     cx:[['如果全班都不來呢？'],['分組討論的課，人不在就做不了。'],['點名證明的不是學到，是來了。']],
     long:['畫線那一句偷換了一個詞。','點名本來就不是在證明「學到」，是在證明「來了」。','所以要問的是：這一門課，「來了」本身有沒有意義？','有討論、有分組的課，來了就有意義；只聽講的課，比較沒有。','這篇可以改成：哪些課該點名，哪些不用。這樣其他兩段也站得住。']} ];
  const REVISIT_MSG={
    /* AA 的人物（AA 2026-10-14 2100018）。Alison 和阿哲大二上才在一起，這時候還單身，算數 */
    heroine_01:G=>['考完了。民總我暑假想再讀一次。'],   /* AA_209 第 3 節（AA 四位）*/
    heroine_03:G=>['考完了喔。阿姨說今天滷了一大鍋。'],
    yu:G=>['考完了！！！','暑假要約喔'],
    classmate_xinci:G=>['成績要二十九號才出來，好久。'],
    heroine_02:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_02','SHARED_SECRET')?['期末辛苦了。','跟你說，交換的申請表我印出來了。還沒交。']:['期末辛苦了。','我媽學會用貼圖了。她傳的第一張是一隻戴眼鏡的貓。'],   /* BB_167 4-3 */
    heroine_04:G=>{ const has=t=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_04',t); return has('PLAYTESTED')?['暑假我要把貓做完。開學你幫我測第二關。']:(has('CONTEST_DAY')?['第四罐的錢我不還喔。','暑假快樂。']:['期末考完了嗎','法律系考到幾號']); } };   /* BB_167 4-3 */
  /* 春假三選一（交接包 v2 C9）的日子：inv1＝第 5 週週二（以安揪）、inv2＝週三（可昕問）、dl＝4/2（最後可以選的一天）、d0＝4/3（春假第一天，出發）*/
  S.springDays=function(){ return {inv1:termDay('Y1S2',5,2), inv2:termDay('Y1S2',5,3), dl:termDay('Y1S2',6,4), d0:termDay('Y1S2',6,5)}; };
  const msgIn=(G,tag)=>(G.msgs||[]).some(m=>m.tag===tag);
  /* 該問了：收到的邀約都到了（麵店團的、交往中可昕的）、還沒選、沒過 4/2、「晚一點再決定」的時間到了 */
  S.springPending=function(G){ const F=G.flags, D=S.springDays(); if(F.SPRING_Y1!=null||!D.inv1||G.day<D.inv1||G.day>D.dl) return false;
    const grp=PHONE.inGroup(G,'noodle_team'), kx=!!F.dating_kexin; if(!grp&&!kx) return false;
    if(grp&&!msgIn(G,'an_spring_y1')) return false; if(kx&&!msgIn(G,'kx_spring_y1')) return false;
    return F.springAskAt==null||G.day*24+G.hour>=F.springAskAt; };
  /* 選擇（介面文字，不是祐廷說的話；AA 確認中）：跟麵店團出去（麵店團才有）／和可昕開車旅行（交往中才有）／留在宿舍／晚一點再決定（隔天同一時間再問）*/
  S.springPrompt=async function(GM){ const G=GM.G, F=G.flags, O=[];
    if(PHONE.inGroup(G,'noodle_team')) O.push({t:'春假：跟麵店團出去',hint:'以安做行程表（4/3～4/4）',k:'noodle'});
    if(F.dating_kexin) O.push({t:'春假：和可昕開車旅行',hint:'4/3，一天來回',k:'kexin'});
    O.push({t:'春假：留在宿舍',k:'dorm'},{t:'晚一點再決定',hint:'明天再問',k:'later'});
    let i=O.length-1; GM.sceneBegin(); try{ i=await GM.choose(O.map(o=>({t:o.t,hint:o.hint}))); } finally { GM.sceneEnd(); }
    const k=(O[i]||O[O.length-1]).k; if(k==='later'){ F.springAskAt=(G.day+1)*24+G.hour; return k; } S.springChoose(GM,k); return k; };
  /* 選了以後：可昕的回覆與照片（BB_96 9-5）、可昕那一趟的出遊、麵店團的照片（沒去的玩家；草稿：以安的行程表第二版、阿哲「下次你要來。」）。
     麵店團那一趟（4/3～4/4）的事件 ev_noodle_trip_spring_y1 在 events.js（AA_355 第 3 節：已經有了；找不到事件才不排）。silent：沒選就過了 4/2（可昕不回） */
  S.springChoose=function(GM,k,o){ o=o||{}; const G=GM.G, F=G.flags, D=S.springDays(), kx=!!F.dating_kexin, grp=PHONE.inGroup(G,'noodle_team'); F.SPRING_Y1=k;
    const KX=(day,h,L,tag)=>PHONE.at(G,day,h,L.map(t=>({th:'p:kexin',from:'kexin',text:t})),tag);
    if(k==='kexin'&&typeof OUT!=='undefined') OUT.plan(G,{id:'kx_trip_y1s2',ev:'ev_kexin_trip_spring_y1',day:D.d0,h:7+40/60,place:'政大校門口（先回家取車）',title:'春假：開車旅行',travel:'回家取車約 30 分鐘，再開到政大接她',travelH:40/60,back:'送她回政大，再把車開回家。'});   /* AA_147 第 1 節 #1：祐廷開車、可昕坐副駕駛——07:00 從宿舍回家取車（+30 分）→ 07:40 政大校門接她 → 08:00 出發；回程送她回政大、車開回家（+30 分）*/
    if(k==='noodle'){ if(kx){ if(!o.silent) KX(G.day,G.hour+0.1,['好。那我們暑假再去，我先選地方。','你們去哪裡，照片要傳給我。'],'kx_spring_reply'); KX(D.d0,21.5,['📷（她和予樂的宵夜）','予樂說她今天代替你。她吃得比你多。'],'kx_spring_photo'); F.KX_TRIP_DEFERRED='summer'; }
      if(typeof OUT!=='undefined'&&typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.some(e=>e.id==='ev_noodle_trip_spring_y1')) OUT.plan(G,{id:'ndl_trip_y1s2',ev:'ev_noodle_trip_spring_y1',day:D.d0,h:8,place:'台北車站',title:'春假・小旅行',travel:'',travelH:0.5,back:'回到台北。'}); }
    if(k==='dorm'&&kx){ if(!o.silent) KX(G.day,G.hour+0.1,['留在宿舍？……好。那暑假我們去遠一點。'],'kx_spring_reply'); KX(D.d0+1,16,['📷（政大山上的階梯）','山上都沒人，我自己爬上去了。'],'kx_spring_photo');/* AA_209 附錄B §2 */ F.KX_TRIP_DEFERRED='summer'; }
    if(!o.silent){ const me=(th,t)=>({th,from:'player',who:null,text:t}), ng='g:noodle_team';   /* 選完以後祐廷自動傳一句（AA 71186c7）*/
      if(k==='noodle'&&grp) PHONE.at(G,G.day,G.hour+0.05,[me(ng,'我去。'),{th:ng,from:'heroine_01',text:'收到。行程表多一個人。'}],'spring_pick_msg');
      if(k==='kexin'){ PHONE.at(G,G.day,G.hour+0.05,[me('p:kexin','好。我們去。')].concat(grp?[me(ng,'我這次有約了。'),{th:ng,from:'zhe',text:'……喔～'}]:[]),'spring_pick_msg'); }
      if(k==='dorm'&&grp) PHONE.at(G,G.day,G.hour+0.05,[me(ng,'我這次留在宿舍。'),{th:ng,from:'zhe',text:'好啦，照片會傳給你'}],'spring_pick_msg'); }
    if(F.dating_heroine_03&&(k==='noodle'||k==='dorm')){ const YT=t=>({th:'p:heroine_03',from:'heroine_03',text:t}); PHONE.at(G,D.d0,18,k==='noodle'?[YT('看到群組了。你們那邊也在下雨喔。'),YT('店裡今天很空。')]:[YT('春假店裡很空。你要來吃嗎？')],'yt_spring_msg'); }   /* 和語彤交往中：她春假照樣顧店；第一天傍晚私訊（AA_71 2-10，AA-C e2bdcece；AA_216 大一下 #7）*/
    if(k!=='noodle'&&grp){ const th='g:noodle_team'; PHONE.at(G,D.d0,20.5,[{th,from:'heroine_01',text:'📷（行程表第二版）'},{th,from:'heroine_01',text:'好，明天下午改去室內的地方，我再排一下。'}/* AA_209 第 8 節第 8 點；AA_459 第 5 節：晚上八點半傳的、說的是第二天＝「明天下午」（旅行事件 ev_noodle_trip_spring_y1 裡的同一句不動）*/,{th,from:'zhe',text:'下次你要來'}],'ndl_spring_photos'); } };
  /* 模擬法庭的準備分（AA_143 3-2；0～4，不顯示數字）：模 2 去了機車行、模 3 提第三種寫法、模 4 有去、第 8～10 週和以安或柏翰一起準備（MOOT_TOGETHER） */
  S.MOOT_OFF=true;   /* 使用者 2026-10-17：模擬法庭整段刪除（AA_252）*/
  S.mootScore=function(G){ const F=G.flags||{}; return (F.MOOT_BIKE_SHOP?1:0)+(F.MOOT_THIRD?1:0)+(F.MOOT_DRILL?1:0)+(F.MOOT_TOGETHER?1:0); };
  /* MOOT_TOGETHER（AA_143 3-3 第 8 項：照 LAWWW-B 的讀法）：大二下第 8～10 週去了公法讀書會，或在總圖、法圖自習時以安或柏翰在場 */
  S.mootTogetherCheck=function(G,kind){ if(S.MOOT_OFF||!G||!G.flags||G.flags.MOOT_TOGETHER) return; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!T||T.id!=='Y2S2'||T.week<8||T.week>10) return;
    if(kind==='plg'||((kind==='study')&&['library','library_hall','lawlib'].includes(G.zone)&&['heroine_01','classmate_bohan'].some(id=>S.present(id,G)&&(()=>{ const e=schedEnt(CHARACTERS[id],G); return !!e&&e.zone===G.zone; })()))) G.flags.MOOT_TOGETHER=true; };
  /* 大一去過幾次法服讀書會（BB_97 4-3 P4「我接。」要 5 次以上）：G.acts.att 的 lawclub_study@<天>，那一天在大一（Y1S1、Y1S2）；中途離開也算去過 */
  /* 大一去過幾次公法讀書會（沛珊 P4「我接。」要 5 次以上；BB_191 §8-7：法服讀書會停用以後改算公法讀書會，中途離開也算）*/
  S.plgY1Count=function(G){ const A=(G.acts&&G.acts.att)||{}; let n=0; for(const k in A){ const m=/^public_law_group@(-?\d+)$/.exec(k); if(!m) continue; const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(+m[1]):null; if(t&&/^Y1S[12]$/.test(t.id)) n++; } return n+S.lawclubY1Count(G); };   /* 舊存檔去過的法服讀書會也算 */
  S.lawclubY1Count=function(G){ const A=(G.acts&&G.acts.att)||{}; let n=0; for(const k in A){ const m=/^lawclub_study@(-?\d+)$/.exec(k); if(!m) continue; const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(+m[1]):null; if(t&&/^Y1S[12]$/.test(t.id)) n++; } return n; };
  /* 大一的春節初一（遊戲第一個「春節」、前一天是「除夕」：2026-02-17）；寒假拜年（C3）用 */
  let lunarNY; S.lunarNewYear=function(){ if(lunarNY!==undefined) return lunarNY; lunarNY=null; if(typeof CALENDAR==='undefined'||!CALENDAR.holiday) return null; for(let d=2;d<500;d++){ if(CALENDAR.holiday(d)==='春節'&&CALENDAR.holiday(d-1)==='除夕'){ lunarNY=d; break; } } return lunarNY; };
  /* 出遊住外面一晚（春假麵店團的兩天一夜，交接包 v2 C9）：日期、星期往後；天氣晴；不演宿舍的夜晚事件（人不在宿舍）；
     春假沒有課（第 6 週週五～週一），所以不跑早上的課表通知 */
  S.travelOvernight=function(GM,day,hour){ const G=GM.G, F=G.flags, E=GM.E; while(G.day<day){ G.day++; G.weekday=(G.weekday+1)%7; }
    G.hour=hour; if(E) E.hour=hour; G.weather='clear'; if(E&&E.setWeather) E.setWeather('clear'); F.companion=null; F.nightKai=false; if(GM.updateHUD) GM.updateHUD(); };
  S.firstColdDay=()=>termDay('Y1S1',15,1);   /* 第一波寒流（AA_71 十二月；阿哲的薑母鴨、AA_12 紙箱旁白也用這一天：「冬天的衣服」紙箱的兩版在 src/y1fill3d.js，AA_347 5-1）*/
  /* 成績單先等一下（classes3d.js 的 morning 呼叫；回傳 true＝先不發，晚上視訊一起打開）：只有大一上、和可昕約好的玩家問一次 */
  S.holdGrades=async function(GM,termId){ const G=GM.G, F=G.flags;
    if(termId==='Y1S2'){ if(!F.dating_kexin||F.KX_GRADES_Y1S2!=='together'||F.KX_GRADES2_DAY!=null||typeof OUT==='undefined') return false;   /* 大一下 together（AA_157 第 2 節）：暑假第一天早上先問、21:00 視訊；best_one 照常發（晚上的一問一答在 phoneRules）*/
      F.KX_GRADES2_DAY=G.day; GM.sceneBegin(); let k=0; try{ await GM.say(null,'大一下的成績出來了。'); k=await GM.choose([{t:'先看。'},{t:'等到晚上。'}]); } finally { GM.sceneEnd(); }
      if(k===0) F.KX_GRADES2_PEEK=true;
      OUT.plan(G,{id:'kx_grades2',ev:'ev_kexin_grades_open_y1s2',day:G.day,h:21,place:'視訊',title:'可昕的視訊：一起打開成績',verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊掛掉了。'});
      return k!==0; }
    if(termId!=='Y1S1'||!F.KX_GRADES_PACT_SET||F.KX_GRADES_PACT||typeof OUT==='undefined') return false;
    F.kxGradesDay=G.day; GM.sceneBegin(); let k=0; try{ await GM.say(null,'大一上的成績出來了。'); k=await GM.choose([{t:'先看。'},{t:'等五號一起看。'}]); } finally { GM.sceneEnd(); }
    F.KX_GRADES_PACT=k===0?'peeked':'kept';
    OUT.plan(G,{id:'kx_grades',ev:'ev_kexin_grades_open',day:G.day,h:21,place:'視訊',title:'可昕的視訊：一起打開成績',verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊掛掉了。'});
    if(k===0) return false;   /* 先看：照常發成績單 */
    return true; };
  /* 每天的手機小事（BB_95 4-4）：摘要日（AA_90 第 10 節「週曆＋精華日」）還沒做，照 BB「沒有摘要日的話放進每天的手機小事」——大一上第 4 週起，一天最多一則；
     那天已經有排好時間的劇情訊息就不加。每天第一次（或讀檔後第一次）決定今天是哪一則：照順序輪流，挑條件成立、時間還沒到的；時間到了再確認一次
     （阿凱：你醒著待在宿舍或便利商店時，不會收到「我已經在便利商店了」——那天就不傳，改天）；睡覺、跳過時間跨過去的照原本的時間補進去。
     每則一次；Kevin 的影片最多四次、照順序、每次更無關，第四次 Kevin 多問一句（BB 2026-10-14）。學姊：讀書會的前一天（週二）17:05 發在讀書會群組（BB 2026-10-14：地點不變，只是提醒）。
     沛珊不用招牌句（「我可以問一個奇怪的問題嗎」留給大二 P5）。方奕廷那則：F1 他說「死掉的話傳照片給我。」——你傳的是新葉的照片（BB 2026-10-14 確認：他說「死掉的話」才傳，結果傳的是活的）*/
  const KAI_SHEET_MSG=[['表更新了','📷（泡麵評鑑表）'],['第一名換了','📷（泡麵評鑑表，第一名那一格塗掉重寫）'],['所以我加了一欄 凌晨三點吃的另外算','📷（泡麵評鑑表，最右邊多了一欄）'],['這款我給負分 你不要買','📷（泡麵評鑑表，最下面一格畫了一個叉）']];   /* 阿凱的泡麵評鑑表（kai_sheet）第 1～4 次（AA_460 第 3 節；第 1 次原句；口味不寫牌子 D77）*/
  /* AA_497 5-4（企劃線 7a38216ca）：Kevin 的動物影片 6 則保留前 2 則，後 4 則照原本的日期依序換成他自己的事——這裡的第 3、4 則＝換成的第 1、2 則
     （第 5 則 y1fill_events.js kevin_parrot、第 6 則 sis_b12_events.js 2026-10-26）。學姊的「收到。」照留；第 4 則原本跟著影片的「學姊妳到底有沒有看」「有。三分十二秒。」拿掉（講的是影片）*/
  const DAILY_KEVIN=['📹（一隻貓把桌上的筆一支一支推下去）','📹（一隻柯基在海邊追浪，又被浪追回來）','補習班的學生問我律師是不是很賺 我說等我考上再告訴你','今天在法圖趴著睡 醒來臉上印著考古題 民法第一百八十四條'];   /* 民法第 184 條＝侵權行為（條號照實）*/
  const actOn=(id,day)=>{ if(typeof ACTIVITIES==='undefined'||!ACTIVITIES.list) return false; const a=ACTIVITIES.list.find(x=>x.id===id); return !!a&&ACTIVITIES.on(a,day); };
  const gotBefore=(G,id)=>!!(G.contacts&&G.contacts[id]!=null&&G.contacts[id]<G.day);   /* 前一天以前就有聯絡方式（不和第一則訊息同一天）*/
  const fl=id=>typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel(id):'STRANGER';
  const dpSent=(G,id)=>!!(G.flags.dpN&&G.flags.dpN[id]);
  const fyEarly=G=>gotBefore(G,'npc_fangyt')&&['STRANGER','ACQUAINTANCE'].includes(fl('npc_fangyt'));   /* 方奕廷「有點熟」以前還說「學弟好」（BB_120 1-7）*/
  const P1=(id,t,dt)=>({th:'p:'+id,from:id,text:t,dt:dt||0}), seq=(id,L,th)=>L.map((t,k)=>Object.assign(P1(id,t,k/60),th?{th}:{}));
  const DAILY=[
    {id:'kevin_video',max:()=>DAILY_KEVIN.length,h:()=>21.3,ok:G=>PHONE.inGroup(G,'family_law'),
      items:(G,n)=>{ const K=t=>({th:'g:family_law',from:'kevin',name:'Kevin',text:t}), W=(t,dt)=>({th:'g:family_law',from:'heroine_05',name:'溫學姊',text:t,dt:dt||0});
        return [K(DAILY_KEVIN[n]),W('收到。')]; }},
    /* sis_study_eve（週二晚上「明天讀書會。三件事……」）刪：法服沒有讀書會（BB_191 §7-3）*/
    {id:'ziqing_five',h:()=>17.5,ok:(G,day)=>PHONE.inGroup(G,'guitar')&&actOn('club_guitar',day),
      items:()=>['今天社課','練 C 和弦','不會的不准走喔'].map(t=>({th:'g:guitar',from:'heroine_04',text:t}))}   /* BB_175 D3（AA-B 互審 AA_200 第 1 節）：拿掉「這不是問句」（留給大三下 Q11）*/,
    {id:'ziqing_black',h:()=>15.6,ok:G=>PHONE.inGroup(G,'guitar')&&!!G.flags.ZIQING_MAKING_SOMETHING,
      items:()=>[{th:'g:guitar',from:'heroine_04',text:'📷（截圖：畫面全黑，角落只有一個小小的插座）'},{th:'g:guitar',from:'heroine_04',text:'不要問。'}]},
    {id:'zhiruo_latte',h:G=>zrKnows(G)?15+10/60:22+7/60,ok:G=>gotBefore(G,'heroine_02'),
      items:()=>seq('heroine_02',['欸今天超好笑','有個客人一進來就說『跟昨天一樣』','我根本不知道他昨天是誰','我就隨便做了拿鐵','他說對'])}   /* BB_175 D5 */,
    {id:'kai_snack',h:()=>22.7,ok:()=>typeof SOCIAL==='undefined'||!SOCIAL.friendLevel||['FAMILIAR','FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('kai')),live:G=>G.zone!=='dorm'&&G.zone!=='cvs',   /* BB_120 1-5「固定的改變」：有點熟以後，半夜的「宵夜？」才有你的份 */
      items:()=>['宵夜？','我餓了','我已經在便利商店了','你要什麼'].map((t,k)=>({th:'p:kai',from:'kai',text:t,dt:k/60}))},
    {id:'fangyt_leaf',h:()=>20,ok:(G,day)=>!!G.flags.POTHOS&&G.flags.pothosWaterWk===weekNo(day)&&gotBefore(G,'npc_fangyt'),
      items:()=>[{th:'p:npc_fangyt',from:'player',who:null,text:'📷（黃金葛長出一片新葉）'},{th:'p:npc_fangyt',from:'npc_fangyt',text:'新葉耶。',dt:1/60},{th:'p:npc_fangyt',from:'npc_fangyt',text:'你養得不錯。',dt:2/60}]}   /* BB_175 D7 */,
    {id:'mingxuan_bento',h:()=>12.1,ok:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('classmate_mingxuan','SAW_HIM_STUDY')&&gotBefore(G,'classmate_mingxuan'),
      items:()=>seq('classmate_mingxuan',['公館新開一家便當 八十塊','我加進清單了','念書念到餓的時候可以去 哈哈'])}   /* BB_175 D8（AA-B 互審：拿掉「不要跟別人講」）*/,
    {id:'peishan_handout',h:()=>21.6,ok:G=>PHONE.inGroup(G,'public_law')&&!S.psGone(G),   /* BB_191 §8-7：公法讀書會群組 */
      items:()=>[{th:'g:public_law',from:'classmate_peishan',text:'📷（講義的照片，邊角畫了一個問號）'}]},
    /* BB_120 1-7c「固定的改變」（BB 2026-10-14，第②級）：照熟度傳的訊息，只在那個階段（過了就不補）。子晴「認識」只有事情、發在吉他社群組（還沒有私訊）；
       「有點熟」一句拆五則；「朋友」測試版先私訊給你（22:10），同一晚 22:40 群組才出現；「好朋友」真的問問題（第二組在期末考那兩週）*/
    {id:'zq_a1',h:()=>21,ok:(G,day)=>fl('heroine_04')==='ACQUAINTANCE'&&PHONE.inGroup(G,'guitar')&&actOn('club_guitar',day+1),
      items:()=>[{th:'g:guitar',from:'heroine_04',text:'明天社課 19:00。萬才館一樓。帶琴。'}]},
    {id:'zq_a2',h:()=>22+10/60,ok:G=>fl('heroine_04')==='ACQUAINTANCE'&&PHONE.inGroup(G,'guitar'),
      items:()=>seq('heroine_04',['📎 練習曲_v2.pdf','新的譜。'],'g:guitar')}   /* BB_175 D11：檔名是貓的遊戲＝Q6 以前說破，換成吉他社真的會傳的 */,
    {id:'zq_f1',h:()=>21.5,ok:G=>fl('heroine_04')==='FAMILIAR'&&gotBefore(G,'heroine_04'),
      items:()=>['滷味','十點後半價','你要來嗎'].map(t=>P1('heroine_04',t))}   /* BB_175 D12：拿掉「欸不是」*/,
    {id:'zq_f2',h:()=>23,ok:G=>fl('heroine_04')==='FAMILIAR'&&gotBefore(G,'heroine_04'),
      items:()=>['我的貓','卡在牆裡','出不來','……不用回'].map(t=>P1('heroine_04',t))}   /* BB_175 D13：拿掉「欸不是」；玩家以為是真的貓，Q6 才知道是遊戲裡的（伏筆）*/,
    {id:'zq_r1',h:()=>22+10/60,ok:G=>fl('heroine_04')==='FRIEND'&&gotBefore(G,'heroine_04'),
      items:G=>(G.events&&G.events.done&&G.events.done.ev_ziqing_secret_game)?seq('heroine_04',['📎 cat_v0.9','這版貓會爬樓梯。']).concat(PHONE.inGroup(G,'guitar')?[{th:'g:guitar',from:'heroine_04',text:'新版本 要測的人報名',dt:0.5}]:[]):seq('heroine_04',['你聽過這首嗎','📎（一段吉他錄音）','我自己錄的 很爛不要笑'])}   /* BB_175 D14：看過 Q6 照留（群組那則改字）；還沒看過＝吉他錄音、群組不發 */,
    {id:'zq_c1',h:()=>19+40/60,ok:G=>fl('heroine_04')==='CLOSE_FRIEND'&&gotBefore(G,'heroine_04'),
      items:()=>seq('heroine_04',['你今天有吃飯嗎'])}   /* BB_175 D15：「這是問句」是 Q11 的那一刻 */,
    {id:'zq_c2',h:()=>22.5,ok:(G,day)=>fl('heroine_04')==='CLOSE_FRIEND'&&gotBefore(G,'heroine_04')&&(CALENDAR.termOf(day)||{}).exam==='final',
      items:()=>seq('heroine_04',['期末考還好嗎','不用回很長'])}   /* BB_175 D16 */,
    /* 沛珊：問題換人問——「認識」在讀書會群組問所有人（23:10）、「有點熟」私訊書頁照片（23:20、23:21）、「朋友」長訊息最後問你（上課日）、「好朋友」不問、等你問（23:05、23:06）*/
    {id:'ps_a',h:()=>23+10/60,ok:G=>fl('classmate_peishan')==='ACQUAINTANCE'&&PHONE.inGroup(G,'public_law'),   /* BB_191 §8-7：公法讀書會群組 */
      items:()=>seq('classmate_peishan',['睡前突然想到','如果有人把東西忘在教室，隔天被別人拿走，這樣算偷嗎？','大家明天再回就好'],'g:public_law')}   /* BB_175 D17（AA_200 第 1 節：沒有人回，停在問題）*/,
    {id:'ps_f',h:()=>23+20/60,ok:G=>fl('classmate_peishan')==='FAMILIAR'&&gotBefore(G,'classmate_peishan'),
      items:()=>seq('classmate_peishan',['📷（一頁書，劃了一行線）','這行讓我想到讀書會那題','你不用回喔'])}   /* BB_175 D18 */,
    /* ps_r（大一上朋友 23:00「法律是最低限度的道德……你覺得呢？」）、ps_c（好朋友 23:05「今天我沒有要問的／你有想講的就傳 我還沒睡」）刪掉（AA_281 第 8 節 M5、M6：她主動傳的太多；使用者 10-18「不一定會很頻繁的聯繫你，但是你約他其實他又都可以」）*/
    /* 方奕廷「有點熟」以前（「學弟好」開頭、學名、一段說明、最後一句很短的真話）：九、十月台灣欒樹；十月以後黃金葛的葉子（欒樹那則先）；寒流前那則是定時的（phoneRules：第一波寒流前一晚）*/
    {id:'fy_tree',h:()=>20.5,ok:(G,day)=>fyEarly(G)&&[9,10].includes(CALENDAR.dateOf(day).m),
      items:()=>seq('npc_fangyt',['學弟好。舟山路的台灣欒樹開花了。','📷 Koelreuteria elegans。秋天先開黃花，再結粉紅色的果。','很漂亮。'])},
    {id:'fy_pothos',h:()=>20.5,ok:(G,day)=>{ const m=CALENDAR.dateOf(day).m; return fyEarly(G)&&!!G.flags.POTHOS&&m!==9&&(m!==10||dpSent(G,'fy_tree')); },
      items:()=>seq('npc_fangyt',['學弟好。你的黃金葛葉子，最近有沒有變黃？','變黃通常是水澆太多，它比較挑，不一定是你的問題。','拍給我看。'])}   /* BB_175 D22 */,
    /* 大一下的手機小事（BB_96 第 5 節；交接包 v2）：只在大一下（term）。學姊的畢業照那則在 C17（固定日子）；子晴成發倒數那則在 Q5（固定日子）。典型玩家的八則（AA_347 3-2）在 src/y1fill3d.js（加進 S.DAILY_PHONE）。
       芷若「熱可可加濃縮」要 Z3（ASKED_HER_DRINK）、明軒那則要家教打工（JOB_TUTOR）——兩個都已接，條件成立以後自然會出現 */
    /* sis_case_y1s2（學姊在家族群組分享判決）刪：她不在群組主動發言（AA_218 17-12）*/
    {id:'zr_cocoa_y1s2',term:t=>t.id==='Y1S2',h:G=>zrKnows(G)?15+10/60:22+7/60,ok:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_02','ASKED_HER_DRINK')&&gotBefore(G,'heroine_02'),
      items:G=>zrKnows(G)?[P1('heroine_02','今天有人點熱可可加濃縮。我以為只有我會喝這個。')]:seq('heroine_02',['今天有客人點熱可可加濃縮欸','我還以為只有我會這樣喝'])},   /* 單身版：AA_209 附錄B §2 */
    {id:'zr_art_y1s2',term:t=>t.id==='Y1S2',h:G=>zrKnows(G)?15+10/60:22+7/60,ok:G=>gotBefore(G,'heroine_02'),
      items:G=>zrKnows(G)?seq('heroine_02',['📷（拉花）','今天的拉花。老闆說及格。']):[P1('heroine_02','📷（拉花）')]},
    {id:'zq_cat03_y1s2',term:t=>t.id==='Y1S2',h:()=>22+10/60,ok:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_04','PLAYTESTED')&&gotBefore(G,'heroine_04'),
      items:G=>[P1('heroine_04','📎 cat_v0.3'),P1('heroine_04',G.flags.FIRST_BUG?'插座修好了':'這版比較不會當機',3/60)]},
    {id:'kai_pothos_y1s2',term:t=>t.id==='Y1S2',h:()=>16.5,ok:G=>!!G.flags.POTHOS,live:G=>G.zone!=='dorm',
      items:()=>seq('kai',['你的黃金葛長新葉了','我幫你澆了','不用謝','我只是順手'])},
    {id:'mx_tutor_y1s2',term:t=>t.id==='Y1S2',h:()=>21.5,ok:G=>!!G.flags.JOB_TUTOR&&gotBefore(G,'classmate_mingxuan'),
      items:()=>seq('classmate_mingxuan',['今天家教的學生段考考完了 終於可以喘一下 哈哈','你們考試也快了吧 加油'])},   /* AA_209 附錄B §2（第二則照 AA_209 2-1 第 2 列）；AA_373 #13：沒限週次，期中、期末都通 */
    {id:'ps_teacher_y1s2',term:t=>t.id==='Y1S2',h:()=>19,ok:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('classmate_peishan','SAW_HER_TEACH')&&gotBefore(G,'classmate_peishan'),
      items:()=>seq('classmate_peishan',['📷（課輔班白板上歪歪的「謝謝沛珊老師」）','他們叫我老師。好奇怪。'])},
    {id:'fy_water_y1s2',term:t=>t.id==='Y1S2',h:()=>20.5,ok:G=>!!G.flags.POTHOS&&gotBefore(G,'npc_fangyt'),
      items:()=>seq('npc_fangyt',['黃金葛可以剪一段下來水耕','週末我拿瓶子過去 隔壁而已'])},   /* AA_209 附錄B §2（原本的訊息＋旁白「（實際講了二十分鐘。）」一起換掉）*/
    /* 阿凱的泡麵評鑑表：大一同房時是房間物件（S.roomItemList）；大二起分開住，偶爾傳照片（四次、至少隔四週）*/
    {id:'kai_sheet',term:t=>!/^Y1/.test(t.id),max:()=>4,gap:28,h:()=>21.8,ok:()=>fl('kai')!=='STRANGER',
      items:(G,n)=>seq('kai',KAI_SHEET_MSG[Math.min(n|0,KAI_SHEET_MSG.length-1)])},   /* 照第幾次換四種（AA_460 第 3 節；n＝收過幾次，舊存檔照 dpN 接）*/
    /* 可昕大一下的手機小事（BB_96 9-8；交往中；每則一次、照週次）。時間 21:10（她傳訊息的時段，技術預設）。
       kx2_late（第 1～2 週）、kx2_azalea（第 3 週）：手機小事第 4 週才開始，這兩則永遠不出——AA_504 第 0 節第 1 點改成可昕的動態第 1、2 則（原句照用、一定出；src/data/feed_y1s2.js kx1b、kx2b），這裡拿掉 */
    ...[['kx2_steps',3,5,'我數過了，從宿舍到法學院一百二十七階。今天爬了三次。'],
        ['kx2_yule_hand',4,7,'予樂今天在課堂上舉手，問老師能不能下課。老師說可以。'],['kx2_apology',10,14,['今天老師講強制道歉，講了兩節','你們應該也會上到']]/* AA_209 附錄B §2 */,['kx2_dumpling',12,18,'今天的酸辣湯餃，老闆多給一顆。他一定覺得我很可憐。']]
      .map(([id,w0,w1,t])=>({id,term:T=>T.id==='Y1S2'&&T.week>=w0&&T.week<=w1,h:()=>21+10/60,ok:G=>!!G.flags.dating_kexin,items:()=>Array.isArray(t)?seq('kexin',t):[P1('kexin',t)]})),   /* 陣列＝連發幾則（kx2_apology，AA_209）*/
    {id:'kx2_example',term:T=>T.id==='Y1S2'&&T.week>=10,h:()=>21+10/60,ok:G=>!!G.flags.dating_kexin&&!!(G.flags.KX_DIR&&G.flags.KX_DIR.Y1),   /* K6b 之後 */
      items:()=>[P1('kexin','民總期中考，我的答案被老師拿去當範例。匿名的，可是我認得自己的字。')]},
    {id:'kx2_coffee',term:T=>T.id==='Y1S2'&&T.week>=15&&T.week<=16,h:()=>21+10/60,ok:G=>!!G.flags.dating_kexin,items:()=>seq('kexin',['📷（書桌，旁邊一杯咖啡）','期末的第一杯。'])},
    /* 經濟系那一年的手機小事（BB_113 第 2 節「經濟系大一上」「經濟系那一年的可昕」「經濟系大一下」；AA-B 10-16 確認定稿）：每則一次；時間是技術預設（可昕 21:10、其他 20:40～21:40）。
       可昕大一上＝E06 以後、10/17 車上（KX_CAR）以前（一則只在下雨的日子）；可昕大一下＝交往中（Y0_DATING）、2/15 一起在家讀書以後、7/10 以前；寒假沒有學期週次本來就不放；Y0S2 第 1～5 週可昕不放。
       重考期的暑假（6/23～7/10）照 AA-B：接著第 18 週往下算（S.dpTerm）*/
    ...(()=>{ const Y0=(t0,w0,w1)=>T=>!!T&&T.id===t0&&T.week>=(w0||1)&&T.week<=(w1||99), done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]), DK=k=>S.dayOfKey(k);
      const grp=G=>PHONE.inGroup(G,'econ_friends')?'g:econ_friends':'g:econ_class', X=(who,name)=>(t,th)=>({th:th||('p:'+who),from:who,name,text:t,dt:0});
      const TR=X('econ_tangrui','唐睿'), PY=X('econ_pinyu','品妤'), XU=X('econ_zhengxun','阿勳'), WL=X('econ_weilun','韋綸');
      const kx1=G=>!!G.flags.E06_DONE&&!G.flags.KX_CAR, kx2=(G,day)=>!!(G.flags.Y0_DATING||G.flags.dating_kexin)&&day>=DK('2025-02-15')&&day<=DK('2025-07-10');   /* AA_219 A-21：kx1 到 10/17 車上為止（KX_CAR 有值就換 kx2 的時期）；kx2 從 2/15 一起在家讀書開始（AA_224 6-1）*/
      const L=[
        ['y0_tr_meeting',Y0('Y0S1',4),20+40/60,G=>PHONE.inGroup(G,'econ_class'),G=>[TR('明天系學會開會，來的人有便當。……我說的便當是『可能有』。','g:econ_class')]],
        ['y0_tr_office',Y0('Y0S1',4),21.5,()=>true,()=>[TR('今天在系辦幫忙，學姊說我講話像在主持節目。我說謝謝。她說那不是稱讚。')]],
        ['y0_py_app',Y0('Y0S1',4),21+10/60,()=>true,()=>[PY('📷（記帳 App 截圖）'),Object.assign(PY('這週支出，飲料佔百分之三十一。我需要一個人管我。'),{dt:1/60})]],
        ['y0_py_rain',Y0('Y0S1',4),21+40/60,()=>true,()=>[PY('今天在社科院門口等公車，等了半小時。……最後是用走的。')]],   /* AA_368 L9b（企劃線 e55fda50）：品妤的室友是可昕——原本「我室友今天問我：如果雨可以退貨……」等於可昕出假設題，換成品妤自己的事 */   /* AA_371 第 5 題（企劃線 7eb45d69）：改字、不限天氣（AA_368 的「今天下大雨。……」30 分鐘版幾乎都是晴天）*/
        ['y0_xu_alarm',Y0('Y0S1',4),21.5,G=>!G.flags.Y0_MOVED_OUT,()=>[XU('你的鬧鐘第二次響的時候，我已經在刷牙了。我們的作息差八分鐘。這很好。')]],
        /* 2026-10-17 AA_269 第 8 節（1fb2e4cf）照新時間線重排：微積分作業第 6 週、搬走的隔天 10/20、休學後第一堂微積分第 8 週、韋綸和品妤第 9 週（品妤的筆記改讀 LEAVE_WEEK；原本讀已停用的 E28）*/
        ['y0_xu_calc',Y0('Y0S1',6,6),22,()=>true,()=>[XU('微積分第五題，我用三種方法算出三個答案。我要去睡了，明天再選一個。')]],
        ['y0_wl_go',Y0('Y0S1',4),21,G=>PHONE.inGroup(G,'econ_friends')||PHONE.inGroup(G,'econ_class'),G=>{ const th=grp(G); return ['走啦！','宵夜！','十點公館！','……有人嗎'].map((t,k)=>Object.assign(WL(t,th),{dt:k/60})); }],
        ['y0_wl_chain',Y0('Y0S1',4),20+40/60,G=>!G.flags.WL_BIKE,()=>[WL('我的腳踏車鏈子今天掉了第七次。我覺得它想要自由。')]],
        ['y0_kx_luroufan',Y0('Y0S1',4),21+10/60,kx1,()=>[P1('kexin','品妤說小福的滷肉飯是全校效用最高的。她算的時候沒有算排隊。')]],
        ['y0_kx_obvious',Y0('Y0S1',4),21+10/60,kx1,()=>[P1('kexin','微積分老師今天說了九次『顯然』。我一次都沒有顯然。')]],
        ['y0_kx_laugh',Y0('Y0S1',4),21+10/60,kx1,()=>[P1('kexin','上課老師講了一個冷笑話。全班只有我笑。……笑了很久。')]],
        ['y0_kx_rain',Y0('Y0S1',4),21+10/60,G=>kx1(G)&&G.weather==='rain',()=>[P1('kexin','下雨了。你今天走去總圖還是騎車？……沒事，我在決定要不要帶傘。')]],
        ['y0_tr_group',Y0('Y0S2',4),20+40/60,G=>PHONE.inGroup(G,'econ_class')||PHONE.inGroup(G,'econ_friends'),G=>[TR('這學期的分組報告，題目我想好了。組員還沒想好。',grp(G))]],
        ['y0_tr_voice',Y0('Y0S2',4),21.5,()=>true,()=>[TR('（語音）我在練長劇的台詞，對著鏡子。室友問我在跟誰講話。')]],
        ['y0_py_notes',Y0('Y0S1',9,9),21+10/60,G=>!!G.flags.LEAVE_WEEK,()=>[PY('經原的筆記，可昕跟我要了一份。……你的那份我就不印了。')]],   /* AA_529 6-2：原本「經原的筆記我掃描放雲端了。可昕跟我要的。你要的話也自己拿。放著也是放著。」——兩天前才說「我不借你了。你用不到。」、3/10 y0_py_notes2 又一次「放著也是放著」*/
        ['y0_py_notes2',Y0('Y0S2',4,4),21+10/60,()=>true,()=>[PY('我高中的筆記還在，掃描放雲端了。你要的話自己拿。放著也是放著。')]],   /* AA_348 B5：原本 y0_py_notes 的句子（AA_305 衝突改掉了），搬到大一下（2/13 決定重考以後）。AA_368 附（企劃線 e55fda50）：第 2 週永遠不會出現（手機小事除了法律系大一上，都要第 4 週起，dailyPhone）——改第 4 週，句子不改 */
        ['y0_py_beef',Y0('Y0S2',4),21+40/60,()=>true,()=>[PY('今天唐睿請我吃飯，說是謝謝筆記。我說折現。……我們吃了牛肉麵。')]],
        /* AA_348 B6：可昕大一下的四則（y0_kx_table、y0_kx_eight、y0_kx_prof、y0_kx_drink，3/24～27）拿掉——她 2/15 起住在你家（AA_301「她就在家裡，直接去講」、AA_300 第 7 節），「博雅門口」又和 AA_298「休學以後不回臺大」衝突 */
        ['y0_xu_lamp',Y0('Y0S1',11,11),22,G=>!!G.flags.Y0_MOVED_OUT,()=>[XU('你搬走以後，宿舍變暗了。因為你把檯燈帶走了。我只是陳述事實。')]],   /* AA_348 B4：原本大一上第 7～8 週＋10/20 以後，退宿改 10/31（第 9 週）以後永遠不成立；改第 11 週（11/11～17）＋Y0_MOVED_OUT */
        ['y0_xu_seat',Y0('Y0S1',8,8),21.5,(G,day)=>!!G.flags.LEAVE_WEEK&&day>=DK('2024-10-23'),()=>[XU('星期三的微積分，老師看了一眼我旁邊的空位，又看了一眼可昕旁邊。什麼都沒問。我覺得他懂了。')]],   /* AA_368 M6（企劃線 e55fda50）：第 8 週推算會在 10/21（一）發，微積分是星期三——句子改「星期三的微積分」、10/23（三）起才發 */   /* AA_348（AA-C 10-21）：休學的事 10/29 以前室友都不知道（AA_305），原本「他去念更難的東西了」改成這句；y0_py_notes 的「高中的筆記」＝重考，2/13 才決定，改成經原的筆記 */
        ['y0_wl_wait',Y0('Y0S1',9,9),21,G=>!!G.flags.LEAVE_WEEK&&(PHONE.inGroup(G,'econ_friends')||PHONE.inGroup(G,'econ_class')),G=>[WL('走啦！……喔你在念書。那念完再走！我等！',grp(G))]],
        ['y0_wl_newbike',Y0('Y0S2',4),20+40/60,G=>!!G.flags.WL_BIKE,()=>[WL('新車騎了三個月，鏈子一次都沒掉。以前那台一個禮拜掉兩次。……我有點想念它。')]] ];
      return L.map(([id,term,hh,ok,items])=>({id,term,h:G=>(/^y0_kx_/.test(id)&&hh>=9&&hh<22.1&&G&&S.cramNight(G))?22+10/60:hh,ok:(G,day)=>S.isEcon(G)&&ok(G,day==null?G.day:day),items})); })(),   /* 衝刺班的晚上，可昕的手機小事改到 22:10（BB_188 A9-3）*/
    /* 大二的手機小事（BB_97 第 5 節＋9-16；任務 V3-B22；2026-10-17 照 BB_205 第 4、7 節：學姊熱水改 Kevin 起頭、M2 那則刪、可昕三則改句）：BB 寫的是「摘要日的手機小事」，大二還沒有摘要日（SYS-08），照大一的做法放進每天的手機小事。每則一次；時間沒寫的是技術預設。
       接的事件還沒做的那幾則先不放（學姊 M2 之後、上榜、畢業；沛珊 P4b；方奕廷的暑假；可昕 K10c 之後；長頸鹿貼圖）——那些事件做好時在這裡加 */
    ...(()=>{ const Y2=T=>!!T&&/^Y2S[12]$/.test(T.id), Y2a=(w0)=>T=>!!T&&T.id==='Y2S1'&&T.week>=(w0||1), Y2b=T=>!!T&&T.id==='Y2S2', done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
      const kx=G=>!!G.flags.dating_kexin;
      const L=[
        /* y2_sis_shift（W6 交接後「今天的值班表，柏翰排錯了。」）刪：W6 刪了（BB_191 §7-3）*/
        /* y2_kevin_retire（Kevin「學姊卸任了！」）刪：她在祐廷大一時已經是前任社長，沒有卸任這件事（BB_191 §7-3）；舊存檔演過 W6 的也不再送 */
        ['y2_sis_hotwater',Y2,17+5/60,G=>!!G.flags.HOT_WATER&&PHONE.inGroup(G,'family_law'),()=>[{th:'g:family_law',from:'kevin',name:'Kevin',text:'📷（學姊桌上的保溫瓶）'},{th:'g:family_law',from:'kevin',name:'Kevin',text:'學姊今天裝熱水欸',dt:1/60},{th:'g:family_law',from:'heroine_05',name:'溫學姊',text:'偶爾。',dt:3/60}]],   /* BB_97 第 5 節（BB_205 第 4 節，2026-10-17）：她不主動在家族群組發言（AA_218 17-12），改 Kevin 起頭 */
        /* y2_sis_m2read 刪（BB_205 第 4 節：M2 是祐廷大一下的事，大二不發）*/
        ['y2_zq_lab',Y2,22+10/60,(G,day)=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_04','LAB_LETTER')&&gotBefore(G,'heroine_04')&&(SOCIAL.has('heroine_04','ZQ3_FIFTY_ONE')||(T=>!!T&&(T.id!=='Y2S1'||T.week>=12))(CALENDAR.termOf(day))),()=>seq('heroine_04',['實驗室那封信 我回了','說不要','教授說好','就這樣','好簡單喔'])],   /* AA_374 第 8 項（AA_211 附錄 B 3-2）：先回了、閒聊 Q3-L3 又說還沒回——聊過 Q3-L3 或第 12 週以後才傳 */
        ['y2_zr_order',Y2,null,G=>done(G,'ev_zhiruo_applied')&&!done(G,'ev_zhiruo_last_shift')&&gotBefore(G,'heroine_02'),()=>seq('heroine_02',['今天有個常客點了熱美式。','他上禮拜都點拿鐵。我差點問他怎麼了。'])],
        ['y2_kx_usual',Y2a(),21+10/60,kx,()=>[P1('kexin','午餐老樣子，山下那攤的酸辣湯餃。')]],
        ['y2_kx_superficies',Y2a(),21+10/60,kx,()=>[P1('kexin','物權的老師講了一個小時的地上權。我現在看到房子都想問地是誰的。')]],
        ['y2_kx_index',Y2a(),21+10/60,kx,G=>[P1('kexin',typeof SOCIAL!=='undefined'&&SOCIAL.has('kexin','ENC_D13_KX')?'邵鈞的考古題有目錄。目錄有索引。':'我們系有一個人，考古題有目錄。目錄有索引。')]],   /* 還沒見過邵鈞（淡水的偶遇 D13）的玩家：「我們系有一個人」*/
        ['y2_kx_hand',Y2a(6),21+10/60,G=>kx(G)&&!!G.flags.PLAYED_Y0&&G.flags.E12_ANSWER==='hand',()=>[Object.assign(P1('kexin','我還在等你的第三隻手。'),{ask:{id:'dp_y2_kx_hand',opts:[{t:'……長頸鹿的尾巴？',say:[{from:'kexin',text:'你記得喔。尾巴我還留著。'}]},{t:'我在練。',say:[{from:'kexin',text:'練到哪了？……先幫我拿書包就好。'}]}]}})]],   /* BB_104 8-4「她會記得」：三個條件都成立才有 */
        ['y2_kx_landlord',Y2b,21+10/60,kx,()=>[P1('kexin','我們債各老師講了一個房東的例子，講了一整節。你們講過了嗎？')]],   /* AA_375 第 18 項 */
        ['y2_kx_river',Y2b,21+10/60,G=>kx(G)&&G.weather==='rain',()=>[P1('kexin','今天下雨，山變成一條河。')]],
        ['y2_kx_funny',Y2b,21+10/60,kx,()=>[P1('kexin','上學期的物權報告發回來了。被說舉例太好笑，分數很高。我不知道該不該高興。')]] ];
      return L.map(([id,term,hh,ok,items])=>({id,term,h:G=>hh!=null?hh:(zrKnows(G)?15+10/60:22+7/60),ok:(G,day)=>!S.isEcon(G)&&ok(G,day==null?G.day:day),items})); })(),   /* 芷若：雙方都單身 22:07、祐廷交往中 15:10（AA_112 8-1）*/
    /* 自由出行的偶遇以後（DL-07；AA_162、BB_144 第 4 節）：語彤傳那天的照片、可昕說淡水那件事——遇到的隔天以後，一次 */
    ...[['enc_yt_photo','ENC_D12_YT','heroine_03',21+20/60],['enc_kx_d13','ENC_D13_KX','kexin',21+10/60]].map(([id,tag,who,hh])=>({id,term:T=>!!T,h:()=>hh,ok:G=>typeof ENC!=='undefined'&&ENC.phoneReady(G,tag),items:G=>{ ENC.markSaid(G,tag); return seq(who,ENC.phoneLines(tag)); }})) ];
  S.DAILY_PHONE=DAILY;
  /* 每天的手機小事用的學期週次：照日曆；經濟系重考期的暑假（6/23～7/10）沒有學期週次，AA-B 10-16：接著第 18 週往下算 */
  S.dpTerm=function(G){ const t=CALENDAR.termOf(G.day); if(t||!S.isEcon(G)) return t; const a=S.dayOfKey('2025-06-23'), b=S.dayOfKey('2025-07-10'); if(a==null||b==null||G.day<a||G.day>b) return null; return {id:'Y0S2',week:18+Math.floor((G.day-a)/7)+1,exam:null}; };
  /* ok(G, day)：那一天條件成立嗎（決定時是今天、補送時是原本那天）。存檔：dpDay（決定過的那天）、dpPick（{id, day}：今天那一則）、dpN（每則出現過幾次）、dpLast（上一次輪到哪一則，輪流用）、dpDayOf（每則上一次是哪一天）；舊存檔沒有＝從頭開始 */
  /* AA_348 B8（BB218-P3-1021 ③）：經濟系 30 分鐘版跳日期時，任何新訊息都會停下來、打開手機（econff3d.js jumpTo）——所以手機小事不只要和上一則小事隔 3 天，
     也要和別的訊息（颱風假、錯過的邀約、群組）隔 3 天；當天或兩天內已經排好別的訊息也先不排。原本只看小事自己：9/29 颱風假群組、9/30 小事，10/11 約、10/12 小事，玩家連兩天被打斷。
     決定那天（G.day）、送出那一刻（原本決定的那天）都看；rt_ 例行訊息、dp_ 小事自己不算「別的」。法律系、經濟系完整版不受影響 */
  S.dpTooSoon=function(G,day){ if(!(typeof ECONFF!=='undefined'&&ECONFF.short&&ECONFF.short(G))) return false; const F=G.flags||{}, other=t=>!(t&&/^(rt_|dp_)/.test(t)); let last=-1e9;
    for(const x of Object.values(F.dpDayOf||{})) if(typeof x==='number'&&x<=day) last=Math.max(last,x);
    for(const m of (G.msgs||[])) if(m&&m.from!=='player'&&typeof m.day==='number'&&m.day<=day&&other(m.tag)) last=Math.max(last,m.day);
    if(day-last<3) return true;
    return typeof PHONE!=='undefined'&&PHONE.rec(G).q.some(q=>q.day>=day&&q.day-day<3&&other(q.tag)); };
  function dailyPhone(GM){ const G=GM.G, F=G.flags; if(typeof CALENDAR==='undefined') return; const N=()=>F.dpN||(F.dpN={});
    const p=F.dpPick; if(p){ const d=DAILY.find(x=>x.id===p.id); if(!d) F.dpPick=null; else { const h0=d.h(G), t=p.day*24+h0, now=G.day*24+G.hour;
        if(now>=t){ F.dpPick=null; const late=now-t>0.25; if(d.ok(G,p.day)&&(late||!d.live||d.live(G))&&!S.dpTooSoon(G,p.day)){ const n=N()[d.id]|0; N()[d.id]=n+1; F.dpLast=d.id; (F.dpDayOf||(F.dpDayOf={}))[d.id]=p.day; const h1=late?h0:G.hour;
            d.items(G,n).forEach((it,k)=>{ const x=Object.assign({},it), dt=x.dt||0; delete x.dt; PHONE.at(G,late?p.day:G.day,h1+dt,[x],'dp_'+d.id+'_'+n+'_'+k); }); }
          else F.dpLast=d.id; } } }   /* 那天不傳（例：阿凱那則你醒著待在宿舍）：輪到下一則，改天再輪回來——不然每天都挑到它，別人的小事永遠輪不到 */
    if(F.dpDay===G.day) return; F.dpDay=G.day; const t=S.dpTerm(G); if(!t||t.week<(t.id==='Y1S1'?2:4)||F.dpPick) return;   /* BB_170 第 26 列：大一上第 2 週起（第 1 週事情已經很多），其他學期照舊第 4 週起 */   /* 每學期第 4 週起；條目沒寫 term 的只在大一上（BB_95 4-4），寫了的照它自己的（阿凱大二起的評鑑表照片）*/
    if(PHONE.rec(G).q.some(q=>q.day===G.day&&!(q.tag&&q.tag.startsWith('rt_')))) return;   /* 今天已經有排好的劇情訊息（rt_ 例行訊息不算）*/
    if(S.dpTooSoon(G,G.day)) return;   /* AA_348 B8：經濟系 30 分鐘版的手機小事至少隔 3 天一則（9/23～10/3 原本每天停一次，使用者 10-18 嫌「每天一直按快轉」）；法律系不受影響 */
    const i0=DAILY.findIndex(d=>d.id===F.dpLast)+1;
    const last=F.dpDayOf||{};
    const short=typeof ECONFF!=='undefined'&&ECONFF.short&&ECONFF.short(G), cand=[];
    for(let k=0;k<DAILY.length;k++){ const d=DAILY[(i0+k)%DAILY.length]; if(!(d.term?d.term(t):t.id==='Y1S1')||(N()[d.id]|0)>=(d.max?d.max():1)||(last[d.id]!=null&&G.day-last[d.id]<(d.gap||7))||d.h(G)<=G.hour+0.1||!d.ok(G,G.day)) continue; cand.push(d); if(!short) break; }
    if(!cand.length) return; let pick=cand[0];
    /* 經濟系 30 分鐘版小事至少隔 3 天，位置很少：快過期的先排（之後還能排的天數最少的）——原本照順序輪，阿勳「星期三的微積分」（第 8 週、10/23 起）兩輪都被第 4 週起都能排的那則拿走、玩家看不到（BB 10-21，AA_368 M6）。法律系照舊輪 */
    if(short&&cand.length>1){ const left=d=>{ let n=0; for(let x=1;x<=21;x++){ const day=G.day+x, T=S.dpTerm(Object.assign({},G,{day})); if(T&&(d.term?d.term(T):T.id==='Y1S1')&&d.ok(G,day)) n++; } return n; }; let best=1e9; for(const d of cand){ const l=left(d); if(l<best){ best=l; pick=d; } } }
    F.dpPick={id:pick.id,day:G.day}; }   /* 會出現好幾次的（Kevin 的影片）：同一則至少隔 7 天（gap：阿凱的照片隔 28 天）*/   /* 會出現好幾次的（Kevin 的影片）：同一則至少隔 7 天（gap：阿凱的照片隔 28 天）*/
  /* 宿舍房間的物件（交接包 v1 第 1 節「房間物件」，AA_12 0-2、0-3）：點了看一句旁白。可昕的物件分開以後的旁白（AA_185 3-4）在 S.roomItemList */
  const ROOM_ITEMS=[['書架上的舊《民法》','以前翻過。看得到字，看不懂意思。'],['經濟學原理','念了一個多月的課本。前六章有畫線，後面是新的。'],['寫滿的筆記本','重考那段時間的筆記。一半是你的字，一半是她的。'],['摩天輪的票根（夾在桌墊下）','摩天輪的票根。兩個人開始交往的那一天。'],['手機相簿的一張照片','河堤邊停著幾台腳踏車。那一群人。你休學以後，他們還是會叫你。']];   /* AA_224 第 2 組：課本、照片（筆記本、票根不改）*/
  S.ROOM_ITEMS=ROOM_ITEMS;
  /* 跟著劇情多出來的東西（放在固定的那幾樣後面）：明軒送的三色螢光筆（聖誕交換禮物 XMAS_HL3；BB_95 3-6b，BB 2026-10-14 寫的旁白）*/
  /* 阿凱的泡麵評鑑表（BB_120 1-7c）：大一同房時，他書桌上方牆上貼的一張紙；口味用通稱。朋友的門檻台詞（F-K2「泡麵第一名是這個 你可以知道了」）那天起第一名填上了，
     多一欄你的名字（他替你填的分數，BB 沒有寫分數：只描述、不編數字）*/
  const KAI_SHEET='「紅燒牛肉 8.5」「蔥燒排骨 8」「麻辣 7.5（太辣扣分）」「海鮮 6（有一隻蝦）」';
  /* 宿舍房間晚上在的室友（AA_208 2-4、第 7、8 節；AA_374 第 1 項）：[人物, 座位, 幾點以後]；只在上課的學期（寒暑假各自回家，照 presence）、23:30 以後都在上舖（看不到）。
     大一 203（四人房 DORM_FOUR）：阿哲 L1 22:00 以後（練球、麵店之後）、柏翰 R1 22:30 以後（總圖閉館）——阿凱另外放（S.kaiRoommate）。
       2026-10-28 起 203 四人房的時期改照 AA_502 的作息（S.dormWho 先問 S.r203On／S.r203Who，下面 S.r203Plan）；這一列只是備用（S.dormWho 不會走到）。
     大二 312（ROOM_Y2）：阿哲 L1、柏翰 R1 照大一的時段；阿哲 12/19 以後比較晚回來（送 Alison 去捷運站）＝23:00；R2 是大一學弟（背景、沒有名字，不放人）。
     大三 507、大四 409（ROOM_Y3、ROOM_Y4）：柏翰 R1（阿哲住別間，AA_208 第 8 節）。經濟系那一年照阿勳（S.populate）*/
  S.dormMates=function(G){ const F=(G&&G.flags)||{}; if(!G||S.isEcon(G)||typeof CALENDAR==='undefined') return []; const t=(CALENDAR.termOf(G.day)||{}).id||'';
    if(F.ROOM_Y3||F.ROOM_Y4) return /^Y[34]/.test(t)||(typeof DORMY24!=='undefined'&&DORMY24.lastNight&&DORMY24.lastNight(G))?[['classmate_bohan','R1',22.5]]:[];   /* 409 最後一晚（宿舍退宿日 6/28 的前一晚，已經放暑假）柏翰在：AA_517 3-3「條件：柏翰在」（src/dorm_y24_3d.js；只有這一晚）*/
    if(F.ROOM_Y2) return /^Y2/.test(t)?[['zhe','L1',G.day>=S.dayOfKey('2026-12-19')?23:22],['classmate_bohan','R1',22.5]]:[];
    return F.DORM_FOUR&&/^Y1/.test(t)?[['zhe','L1',22],['classmate_bohan','R1',22.5]]:[]; };
  /* 現在坐在房間書桌前的室友：[[人物, 座位, 從幾點開始, 怎麼來（203 四人房才有：'bed' 起床／'door' 開門進來）]]（DORM203-MATES-1028；使用者 2026-10-28 01:3x「203 四人宿舍，認識阿凱、阿哲、柏翰 但我室友根本只有阿凱 第一天之後」）——
     進房間（populate）和待在房間裡（S.dormLive，refreshSchedule 每 3 秒）都照這一份。經濟系那一年＝阿勳 18:00～08:00（颱風天整天；E01 演完以後，AA_168 第 5 節）；
     法律系大一＝阿凱 18:00～08:00（大一同房 S.kaiRoommate；回宜蘭過年的晚上不在）＋S.dormMates（阿哲、柏翰晚上回來，23:30 以後在上舖）*/
  S.dormWho=function(G){ const F=(G&&G.flags)||{}, hr=h(G), L=[];
    if(S.isEcon(G)){ if(F.E01_DONE&&(hr>=18||hr<8||(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon(G.day)))) L.push([XUN,'R2',18]); return L; }
    if(S.r203On(G)) return S.r203Who(G);   /* 大一 203 四人房：照 AA_502 第 1 節的作息（下面 S.r203Plan）*/
    if((hr>=18||hr<8)&&S.kaiRoommate(G)&&!S.awayOnDate('kai',G)) L.push(['kai','R2',18]);
    if(hr<23.5) for(const [id,u,from] of S.dormMates(G)) if(hr>=from&&CHARACTERS[id]&&!S.awayOnDate(id,G)) L.push([id,u,from]);
    return L; };
  /* ===== 203 四人房的作息（AA_502 第 1 節，AA-C 2026-10-28；DORM203-MATES-1028 第二部分）=====
     只在法律系、四人房（DORM_FOUR）、還沒搬去 312（ROOM_Y2）、8/29 搬進 203 到大二上開學以前；阿哲、柏翰到大一下最後一天（6/14，期末以後那晚是 AA_502 3-6 的最後一晚，6/15 搬出 203）。
     大二以後、兩人房（沒有 DORM_FOUR 的舊存檔）照上面原本的做法。
     S.r203Plan(G,id,d)＝第 d 天的區段 [從, 到, 怎麼來, 怎麼走]（小時；24 以上＝隔天凌晨）：怎麼來 'bed' 從上舖下來、'door' 開門進來；怎麼走 'bed' 爬上舖、'door' 出門。在上舖睡覺＝看不到（不生人物）。
       柏翰：平日 06:40 起、07:20 出門；週六日 08:00 出門（週日的早上稿沒寫，照週六）；週日 13:00～17:00 書桌；晚上 22:30 回來、23:30 上床。
       阿哲：平日 08:30 起、08:40 出門；晚上 22:00 回來（週五 23:00）、23:30 上床；週六 11:00 起、12:00 去球場、17:00 回來（晚上在房間）；週日 11:00 起、下午在房間、17:30 去麵店、22:00 回來。
       阿凱：上課的平日第一節有課＝07:00～08:00 在書桌前（AA_502 第 6 節第 2 點：週二、週四第一節有課 R203_KAI_FIRST）、沒有＝睡到 10:00、10:30 出門；晚上 18:00～02:00；
             週六 10:00～13:00、晚上 18:00～02:00；週日 10:00～02:00；寒暑假照原本（18:00～08:00，稿「照現有」）。
       考試週（日曆的考試週、後面還有必修的考試）：柏翰 06:00 起、00:30 才回來、01:00 上床——隔天就要考的那一晚照平常 22:30 回來（AA_502 3-2：期中考前一晚 23:30 他在房間「我要睡了。明天考試。」）；
             阿哲 21:00 就回來、00:00 上床；阿凱照常（國界膠帶是現有的事件）。颱風天（停課）大家整天在房間。
       大一上第 5 週 10/1（三）阿哲忘記帶鑰匙（AA_502 第 4 節的群組）：22:11 阿凱開門才進來（S.R203_KEY_DAY）。
     寒暑假：照週間、週末的作息，回老家的日子（presence 的 absentDates；柏翰寒假週四搭客運上來總圖也不算住宿舍）不在。
     照作息該在房間、作息表（daily_schedule、邀約、上課）寫他在別的地方（例：阿凱週日 21～22 在洗衣間、阿哲週日中午 118 巷）＝那段時間不在房間。
     AA_502 第 6 節（AA-C 2026-10-28 回 LAWWW-C 的 8 點）：上面阿凱的課表、柏翰週日早上、阿哲週末、考試週、2/22 群組都照這一份；暑假 203 只剩祐廷和阿凱（6/15 阿哲、柏翰搬出），阿凱 9/6 才搬去別棟。
       兩個例外在 DORM203.planFix（src/dorm203_3d.js）：ev_kai_late_screen 演的那一晚阿凱到 03:30；3-5 借襯衫演完阿哲就出門、22:00 回來 */
  const R203_KAI_FIRST=[2,4];
  S.R203_KEY_DAY='2025-10-01';
  S.R203_SEAT={kai:'R2',zhe:'L1',classmate_bohan:'R1'};
  S.r203On=function(G){ const F=(G&&G.flags)||{}; if(!G||S.isEcon(G)||!F.DORM_FOUR||F.ROOM_Y2||typeof CALENDAR==='undefined') return false; const a=S.dayOfKey('2025-08-29'); return a!=null&&G.day>=a&&S.kaiRoommate(G); };
  const r203Exams=(G,t)=>{ if(!t||!t.exam||typeof CLS==='undefined'||!CLS.examList) return []; try{ return CLS.examList(G,t.id).filter(e=>e&&e.c&&e.c.kind==='required'&&e.kind===t.exam).map(e=>e.day); }catch(e){ return []; } };   /* 這一次考試週（期中或期末）的必修考試日 */
  S.r203Plan=function(G,id,d){ const L=r203Base(G,id,d); if(typeof DORM203!=='undefined'&&DORM203.planFix){ try{ return DORM203.planFix(G,id,d,L)||L; }catch(e){ console.warn('DORM203.planFix',e); } } return L; };
  const r203Base=function(G,id,d){ if(typeof CALENDAR==='undefined') return []; const wd=CALENDAR.dateOf(d).wd, t=CALENDAR.termOf(d), hol=!!CALENDAR.holiday(d), ty=!!(CALENDAR.typhoon&&CALENDAR.typhoon(d));
    const ex=r203Exams(G,t), exAM=ex.some(e=>e>=d), exPM=ex.some(e=>e>d), pre=ex.includes(d+1);
    if(id==='kai'){ if(!t) return [[18,32,'door','door']]; if(ty||wd===7) return [[10,26,'bed','bed']]; const eve=[18,26,'door','bed'];
      if(wd===6) return [[10,13,'bed','door'],eve]; return [!hol&&R203_KAI_FIRST.includes(wd)?[7,8,'bed','door']:[10,10.5,'bed','door'],eve]; }
    if(id==='classmate_bohan'){ const wake=exAM?6:6+40/60; if(ty) return [[wake,23.5,'bed','bed']];
      const L=[[wake,wd>=6?8:7+20/60,'bed','door']]; if(wd===7) L.push([13,17,'door','door']); L.push(exPM&&!pre?[24.5,25,'door','bed']:[22.5,23.5,'door','bed']); return L; }
    if(id==='zhe'){ if(ty) return [[11,23.5,'bed','bed']]; const key=d===S.dayOfKey(S.R203_KEY_DAY), eve=exPM?[21,24,'door','bed']:[key?22+11/60:(wd===5?23:22),23.5,'door','bed'];
      if(wd===6) return [[11,12,'bed','door'],[17,exPM?24:23.5,'door','bed']]; if(wd===7) return [[11,17.5,'bed','door'],eve]; return [[8.5,8+40/60,'bed','door'],eve]; }
    return []; };
  /* 第 d 天他住不住 203：阿哲、柏翰 8/29～6/14（6/15 搬出 203）、阿凱到大二上開學以前；回老家、出門的日子（absentDates，含柏翰寒假的週四）不在 */
  const r203Lives=(G,id,d)=>{ const a=S.dayOfKey('2025-08-29'), b=S.dayOfKey('2026-06-15'); if(a==null||d<a||(id!=='kai'&&b!=null&&d>=b)||!CHARACTERS[id]) return false;
    const G2=d===G.day?G:Object.assign({},G,{day:d}); if(S.awayOnDate(id,G2)) return false; const P=CHARACTERS[id].presence;
    for(const x of (P&&P.absentDates)||[]){ const d0=S.dayOfKey(x[0]), d1=S.dayOfKey(x[1]); if(d0!=null&&d1!=null&&d>=d0&&d<d1) return false; } return true; };
  /* 現在照作息表（daily_schedule、邀約、上課）在別的地方 */
  const r203Away=(G,id,hour)=>{ const c=CHARACTERS[id]; if(!c) return true; const G2=hour==null||hour===G.hour?G:Object.assign({},G,{hour}); const e=schedEnt(c,G2); return !!e&&e.zone!=='dorm'; };
  const r203Iv=(G,id,t)=>{ const d0=Math.floor(t/24); for(const d of [d0,d0-1]){ if(!r203Lives(G,id,d)) continue; for(const p of S.r203Plan(G,id,d)){ const a=d*24+p[0], b=d*24+p[1]; if(t>=a-1e-9&&t<b-1e-9) return {d,a,b,p,ty:!!(CALENDAR.typhoon&&CALENDAR.typhoon(d))}; } } return null; };
  S.r203Who=function(G){ const t=G.day*24+(+G.hour||0), L=[];
    for(const id of ['kai','zhe','classmate_bohan']){ const iv=r203Iv(G,id,t); if(!iv||(!iv.ty&&r203Away(G,id))) continue; let t0=iv.a, how=iv.p[2];   /* 颱風天大家整天在房間（作息表的公館、總圖不算）*/
      if(!iv.ty) for(const s of [0.05,0.1,0.15,0.2,0.25]){ if(t-s<iv.a-1e-9||(+G.hour||0)-s<0) break; if(r203Away(G,id,(+G.hour||0)-s)){ t0=t-s+0.05; how='door'; break; } }   /* 剛從別的地方回來（洗衣間、118 巷）：開門進來 */
      L.push([id,S.R203_SEAT[id],((t0%24)+24)%24,how]); }
    return L; };
  /* 不在房間的室友怎麼走的：照作息剛結束的那一段（12 小時內）＝{bed, at}；作息上還該在（臨時出門、約好的、回家）＝現在出門 */
  S.r203Gone=function(G,id){ const t=G.day*24+(+G.hour||0), hr=h(G); if(r203Iv(G,id,t)) return {bed:false,at:hr}; let best=null;
    for(const d of [Math.floor(t/24),Math.floor(t/24)-1]){ if(!r203Lives(G,id,d)) continue; for(const p of S.r203Plan(G,id,d)){ const b=d*24+p[1]; if(b<=t+1e-9&&t-b<12&&(!best||b>best.b)) best={b,bed:p[3]==='bed'}; } }
    return best?{bed:best.bed,at:((best.b%24)+24)%24}:{bed:false,at:hr}; };
  /* 現在在上舖睡覺：不在作息的那一段裡、上一段（12 小時內）是爬上舖結束的（回老家、出門的不算）*/
  S.r203InBed=function(G,id){ if(!S.r203On(G)) return false; const t=G.day*24+(+G.hour||0); return !r203Iv(G,id,t)&&S.r203Gone(G,id).bed; };
  /* ev_dorm_late_kai 四人房那一行（AA_502 第 6 節第 8 點）：'both' 阿哲、柏翰都上床了／'zhe' 只有阿哲（考試週柏翰還沒回來）／'bohan' 只有柏翰／'none' 都不在；不是 203 四人房的時期＝null */
  S.r203Beds=function(G){ if(!S.r203On(G)) return null; const z=S.r203InBed(G,'zhe'), b=S.r203InBed(G,'classmate_bohan'); return z&&b?'both':z?'zhe':b?'bohan':'none'; };
  /* 手機「朋友」、大地圖的人物線索（S.whereIs）：203 四人房的時期，室友在房間（書桌前、或在上舖睡覺）照上面的作息——AA_502 第 6 節第 8 點「手機朋友頁的阿凱：照新作息（週二、四到 08:00，其他天到 10:30）」。
     「到」＝他走出宿舍的時間（往後找第一段「出門」結束的）；在上舖睡覺寫「睡覺」（原本整晚寫「在書桌前，到 08:00」）。不在房間＝null（照原本的作息表）*/
  S.r203Where=function(G,id){ if(!S.r203On(G)||!S.R203_SEAT[id]) return null; const t=G.day*24+(+G.hour||0), iv=r203Iv(G,id,t); let act=null;
    if(iv){ if(iv.ty||!r203Away(G,id)) act=ACT.desk; } else if(S.r203Gone(G,id).bed) act='睡覺';
    if(!act) return null; let end=null;
    for(let d=Math.floor(t/24)-1;d<=Math.floor(t/24)+3&&end==null;d++){ if(!r203Lives(G,id,d)) continue; for(const p of S.r203Plan(G,id,d)){ const b=d*24+p[1]; if(p[3]==='door'&&b>t+1e-9){ end=b; break; } } }
    if(end==null) return null; const e=((end%24)+24)%24, eh=Math.floor(e+1e-9), em=Math.round((e-eh)*60);
    return {zone:'dorm',room:null,act,until:String(eh).padStart(2,'0')+':'+String(em).padStart(2,'0')}; };
  /* 生一個室友（n.dorm＝他的座位，S.dormLive 才會管他）：walk＝走到自己的書桌前坐下（from 'bed'＝從自己的梯子下來，否則從門口進來）；不 walk＝直接坐好。
     從門口進來的那一刻，203 四人房多一句旁白（AA_502 第 1 節，DORM203.walkIn）*/
  S.dormSpawn=function(GM,id,u,walk,from){ const E=GM.E; if(GM.npc[id]) return GM.npc[id]; const st=dormSeat(u), U=typeof DORM_ROOM!=='undefined'&&DORM_ROOM.units.find(q=>q.id===u);
    const bed=from==='bed'&&!!(U&&U.sleep); let at=null; if(walk&&E.canStand) for(const p of bed?[U.sleep]:[[0,3.0],[0,2.7],[0,2.4]]) if(E.canStand(p[0],p[1],0.3,0)){ at=p; break; }
    let n=null; if(id==='kai') n=GM.spawnNPC('kai',C.kai,at?at[0]:0,at?at[1]:0,Object.assign({talk:nn=>talkKai(GM,nn),yaw:Math.PI},at?{}:{seat:st}));
    else if(CHARACTERS[id]) n=GM.spawnCharacter(id,at?at[0]:st.x,at?at[1]:st.z,Object.assign({yaw:Math.PI},at?{}:{seat:st,pose:'sit'}));
    if(!n) return null; n.dorm=u; if(!at) return n;
    const sit=()=>{ n.dormGo=null; if(GM.npc[id]!==n) return; if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose='sit'; };
    const ap=(U&&U.seat_approach)||(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; n.dormGo=h(GM.G);
    if(!bed&&typeof DORM203!=='undefined'&&DORM203.walkIn){ try{ DORM203.walkIn(GM,id,n); }catch(e){ console.warn('DORM203.walkIn',e); } }
    if(!(E.moveTo&&E.moveTo(n,ap[0],ap[1],sit,0))) sit(); return n; };
  /* 待在房間裡：時間到了室友開門走進來坐下；阿哲、柏翰 23:30 走到自己的梯子爬上舖；阿凱（經濟系那一年阿勳）早上 8:00 出門；臨時不在的（約會、回家）也出門。
     時間已經過了 15 分鐘以上（坐在書桌前讀書、跳時間）＝已經進來／已經睡了／已經出門：直接坐好、直接拿掉，不演走路。走路卡住 6 分鐘（遊戲時間）＝直接到 */
  S.dormLive=function(GM){ const E=GM.E, G=GM.G; if(G.zone!=='dorm'||!E.zone||!E.player||typeof DORM_ROOM==='undefined') return 0; const hr=h(G); let k=0;
    const since=t0=>{ let d=hr-t0; if(d<0) d+=24; return d; };
    const want=S.dormWho(G), ids=new Set(want.map(w=>w[0])), r203=S.r203On(G);
    for(const [id,u,t0,how] of want){ const n=GM.npc[id]; if(n){ if(n.dormGo!=null&&since(n.dormGo)>0.1){ n.dormGo=null; if(GM.sitAt) GM.sitAt(n,dormSeat(u)); n.pose=n.idlePose='sit'; } continue; }
      if(S.dormSpawn(GM,id,u,since(t0)<=0.25,how)) k++; }   /* how：'bed' 起床（從自己的梯子下來）、其他＝開門進來（203 四人房，S.r203Who）*/
    for(const id of Object.keys(GM.npc)){ const n=GM.npc[id]; if(!n||!n.dorm||ids.has(id)) continue;
      if(n.dormBye!=null){ if(since(n.dormBye)>0.1){ GM.removeNPC(id); k++; } continue; }
      const g=r203?S.r203Gone(G,id):null, U=DORM_ROOM.units.find(q=>q.id===n.dorm), bed=g?g.bed:(hr>=23.5||hr<6), t1=g?g.at:(bed?23.5:8);   /* 23:30 以後＝上床；其他（早上 8:00、臨時不在）＝出門。203 四人房照 AA_502 的作息：哪一段結束、幾點（S.r203Gone）*/
      if(since(t1)>0.25&&since(t1)<12||!U){ GM.removeNPC(id); k++; continue; }
      const bye=()=>{ if(GM.npc[id]===n) GM.removeNPC(id); };
      n.dormBye=hr; n.dormGo=null; if(n.seat&&GM.standUp) GM.standUp(n); n.beh='idle'; n.frozen=false; n.waypoints=null; k++;
      const to=bed?U.sleep:[DORM_ROOM.room.exit[0],DORM_ROOM.room.exit[1]-0.4]; if(!(E.moveTo&&E.moveTo(n,to[0],to[1],bye,0))) bye(); }
    return k; };
  S.kaiRoommate=function(G){ if(G&&G.flags&&G.flags.ROOM_Y2) return false; if(typeof CALENDAR==='undefined'||!CALENDAR.TERMS) return true;   /* 主線 3 搬進第二個房間以後（9/6）阿凱就在別棟 */ const T=CALENDAR.TERMS.find(t=>t.id==='Y2S1'); return !T||CALENDAR.tOf(G.day)<T.t0; };   /* 大一同房（大二上開學以前）*/
  S.kaiSheet=function(G){ const up=((G&&G.social&&G.social.relUp)||{}).kai|0;
    return up>=3?['「第一名：沙茶 9.5」'+KAI_SHEET,'（多了一欄「{name}」，裡面是他替你填的分數。最下面一行：「不準的話自己改」）']:['「第一名：不能說（怕被搶）」'+KAI_SHEET]; };
  S.roomItemList=function(G){ const F=(G&&G.flags)||{}, L=ROOM_ITEMS.slice(); if(F.ROOM_Y2) L[0]=['書架上的舊《民法》','現在知道，要先問是誰、向誰、依據什麼、要什麼。'];   /* AA_12 0-3 第 2 點：每一年拿起來的旁白不同（大二）*/
    if(F.EX_kexin&&!F.dating_kexin){ L[2]=['寫滿的筆記本','她在第一頁寫的那一句，你沒有擦掉。']; L[3]=['摩天輪的票根（夾在桌墊下）','票根的日期，還是那一天。']; L[4]=['手機相簿的一張照片',['你翻到一半，又闔上了。','……照片裡的河，還是一樣寬。']]; }   /* 和可昕分開以後（AA_185 3-4：不寫責怪、不寫後悔）；「收拾」收進紙箱的那一段：AA_182 第 2 節已交，跟收拾的時刻三選一一起接（任務 V6-S4，還沒做）*/
    if(F.XMAS_HL3) L.push(['桌上的三色螢光筆',F.GREEN_HIGHLIGHTER?'明軒送的三色螢光筆，和上次那支綠的放在一起。他說他用不到。':'明軒送的三色螢光筆。他說他用不到。']);
    if(G&&S.kaiRoommate(G)) L.push(['阿凱的泡麵評鑑表',S.kaiSheet(G)]);
    if(typeof SOCIAL!=='undefined'){ if(SOCIAL.has('heroine_02','WATCHED_FILM_GROUP')) L.push(['三張連號的票根',['三張連號的票根，你留著中間那張。','另外兩張在他們那裡。……應該吧。']]);   /* 電影票根（BB_96 3-5c）：同一個存檔只會有一種 */
      else if(SOCIAL.has('heroine_02','WATCHED_FILM')) L.push(['電影票根',F.ZR_MATINEE_SEEN?['二輪戲院的票根。《父親的午後》，午場 11:40。','票根的角折了一下。是散場時太陽太大，你拿它擋了一下。']:['二輪戲院的票根。《進城的那一週》，早場。','你把它夾在民總課本裡。課本換了，票根留著。']]); }
    { const A=F.KX_ANNIV&&F.KX_ANNIV[1]; if(A&&A!=='missed') L.push(['她的週年卡片','那天在最高的地方，你說在一起吧。我說好。']);   /* AA_303 第 2 節 9 */ }
    { const J=F.ECON_JACKET; if(J==='wear') L.push(['經濟系的系外套',['經濟系的系外套。你穿去霖澤館一次，阿哲說你是臥底。','……之後就掛在椅背上了。']]);
      else if(J==='closet') L.push(['經濟系的系外套',F.SK02_W8!=null?['經濟系的系外套。口袋裡還夾著阿勳那張紙條。']:['經濟系的系外套。摺好的，還沒穿過。','領的時候，系辦助理說它等你快一年了。']]); }   /* SK02 系外套（BB_106 66cf3ed4）：①穿去上課／③收進衣櫃／第 8 週阿勳代領；②送給阿勳＝沒有 */   /* K7 週年去了的玩家（AA-B 2026-10-16：標籤「她的週年卡片」、說明用她卡片第一頁那句，不另寫）*/
    { const T=F.KX_TRIP&&F.KX_TRIP.Y1S2, txt={sea:'海邊。她拎著鞋子站在浪裡，褲管濕到膝蓋。',oldtown:'老街。牆上貼滿發黃的老照片，她站在中間，手上拿著第三家的點心。',stars:'山上。照片幾乎全黑，右上角有一個小白點。她說那是星星。你覺得是路燈。'}[T]; if(txt) L.push(['旅行的照片',txt]); }   /* 可昕 K8 春假旅行（BB_96 9-5，BB 14265eb）*/
    for(const f of S.ROOM_EXTRA){ try{ f(G,L); }catch(e){ console.warn('STORY.ROOM_EXTRA',e); } }   /* 事件包各自的房間物件（例：AA_325 她的聖誕卡片、高雄夜市的照片）*/
    return L; };
  /* ★主線 3 第二個房間（AA_12 主線 3；AA_177 第 7 節；劇情事實 AA_176 R8）：大二上開學前一天 9/6（日）以後、還沒搬（ROOM_Y2）。
     在臺北的家（週末回家）＝下一輪選單之前：旁白「明天開學。今天搬進新的房間。」→ 字卡「回宿舍」「捷運＋公車 約 40 分鐘」→ 新房間（home3d.js 的 loop）；
     人在宿舍房間＝直接拆箱。四個紙箱，物件一件一件拿出來（只有大一經歷過的才有，AA_12 的表；驗收要點：不能出現玩家沒經歷過的東西），
     全部放好以後「一年。房間比去年滿一點。」。記 ROOM_Y2（第幾天），沒有數值。新房號：三樓 312 號房（AA_208 7-1，下面 S.roomY2；AA_355 第 3 節）；同一個宿舍模型 */
  S.roomY2Due=G=>{ if(!G||(G.stage||'law')!=='law'||(G.flags&&G.flags.ROOM_Y2)) return false; const d=S.dayOfKey('2026-09-06'); return d!=null&&G.day>=d; };
  S.ROOM_Y2_TEXT={film:['一張《進城的那一週》的電影票根','票根上的日期，是星期六早上十點。'],pick:['一片吉他彈片','C 和弦。手指上的繭已經沒了。'],civ:['一本只讀了三分之一的民總課本','這本還有三分之二，跟去年九月一樣新。'],
    report:['一張周老師寫評語的報告影本',null],noodle:['阿凱留下的一包泡麵','紙箱裡夾著一張便條：「宵夜基金。過期前吃完。——凱」'],duty:['法服的值班表','單週週六，早上九點。'],
    pothos:['一盆黃金葛',null],green:['一支綠色螢光筆','你的螢光筆本來只有一種顏色。'],sticky:['一張便利貼：「第 12 頁，要件少一個。」','她改了你的筆記。']};
  S.roomY2Items=function(G){ const F=G.flags||{}, T=S.ROOM_Y2_TEXT, has=(id,tag)=>typeof SOCIAL!=='undefined'&&SOCIAL.has(id,tag), att=id=>typeof ACTIVITIES!=='undefined'&&!!ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,id), L=[];
    if((has('heroine_02','WATCHED_FILM')||has('heroine_02','WATCHED_FILM_GROUP'))&&!F.ZR_MATINEE_SEEN) L.push(['film',T.film[0],[T.film[1]]]);   /* 和芷若看過早場（兩個人或和方奕廷三個人都算，AA_177 第 10 節）；午場《父親的午後》的沒有 */
    if(att('club_guitar')) L.push(['pick',T.pick[0],[T.pick[1]]]);   /* 去過吉他社 */
    L.push(['civ',T.civ[0],[T.civ[1]]]);
    if(G.events&&G.events.done&&G.events.done.ev_an_report_feedback){ const c={A:'『兩邊的利益都有看到。』',B:'『反方意見比正方精彩。』',C:'『無過失的判斷標準寫得好。』'}[F.cafeView]; if(c) L.push(['report',T.report[0],[c,'不是寫給你的，可是你留著。']]); }   /* 看過以安的「報告發回來」；照 cafeView */
    L.push(['noodle',T.noodle[0],[T.noodle[1]]]);
    if((F.LAWCLUB_SAT_VISITS|0)>0) L.push(['duty',T.duty[0],[T.duty[1]]]);   /* 參加過法服（讀書會或週六值班）*/
    if(F.POTHOS) L.push(['pothos',T.pothos[0],[(F.pothosWaterN|0)>0?'比去年長了一點。':'他說忘記澆也不會死。他說對了。']]);   /* 大一和方奕廷說過話（黃金葛）；有沒有澆過水 */
    if(F.GREEN_HIGHLIGHTER) L.push(['green',T.green[0],[T.green[1]]]);   /* 公車站坐到明軒旁邊 */
    if(has('classmate_xinci','LENT_NOTES')) L.push(['sticky',T.sticky[0],[T.sticky[1]]]);   /* 借筆記給芯慈（慈 1）*/
    const R=S.roomItemList(Object.assign({},G,{flags:Object.assign({},F,{ROOM_Y2:true})})).slice(0,ROOM_ITEMS.length);   /* 大一房間的五件（交接包 v1 第 1 節）：舊《民法》用大二那句，其他四件沿用大一的旁白 */
    R.forEach((r,i)=>L.push(['y1_'+i,r[0],[].concat(r[1])]));
    return L; };
  /* 9/6 人在宿舍（暑假留在宿舍的舊存檔；在家模式 AA_183 做好以後很少走到）：旁白＋字卡 → 換到新的房間 112 → 拆箱（AA_177 第 10 節）。
     字卡兩行：「搬到新的房間」＋「三樓 312 號房」（AA_208 7-1，AA-C e36f0d20；原「一樓 112 號房」隨 312 房間作廢）；大三 507、大四 409 的字卡跟主線 5、10 一起做。*/
  S.roomY2InDorm=async function(GM){ const G=GM.G; if(!S.roomY2Due(G)) return false; GM.sceneBegin();
    try{ await GM.say(null,'明天開學。今天搬進新的房間。'); await GM.fade(true); if(GM.titleCard) await GM.titleCard('搬到新的房間','三樓 312 號房',2400); GM.advance(0.5);
      G.flags.ROOM_Y2_MOVING=true; if(GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await GM.fade(false); }   /* ROOM_Y2_MOVING：房間直接蓋成 312（封好的紙箱），拆完 unboxY2 清掉 */
    finally{ GM.sceneEnd(); }
    return S.unboxY2(GM); };
  S.unboxY2=async function(GM){ const G=GM.G, F=G.flags; if(!S.roomY2Due(G)) return false; F.ROOM_Y2=G.day; if(typeof DM3!=='undefined'&&DM3.fixRoomExit&&G.zone==='dorm') DM3.fixRoomExit(GM.E,G); const L=S.roomY2Items(G); GM.sceneBegin();
    const Z=GM.E&&GM.E.zone, shown=[]; F.ROOM_Y2_ITEMS=shown; const vis=st=>{ if(Z&&Z.setY2Items) Z.setY2Items(st); };   /* 3D：拿出來的東西一件一件出現在桌上、軟木板上（dorm_y2_items.glb，zones3d.js）*/
    vis({shown:[],boxes:'closed'});
    try{ for(let guard=0;guard<40&&L.length;guard++){ const i=await GM.choose(L.map(r=>({t:'（拿出'+r[1]+'）'}))); const r=L.splice(i>=0&&i<L.length?i:0,1)[0]; shown.push(r[0]); vis({shown:shown.slice()}); if(r[0]==='sticky') F.XC1_STICKY=true; for(const t of r[2]) await GM.say(null,t); }   /* XC1_STICKY＝拿出芯慈的便利貼（慈 1 收著，AA_496 第 9 節第 1 點）：尾聲「第 12 頁」那一句讀它（postgrad3d.js）*/
      delete F.ROOM_Y2_MOVING; vis({boxes:'open'}); await GM.say(null,'一年。房間比去年滿一點。'); }
    finally{ delete F.ROOM_Y2_MOVING; GM.sceneEnd(); }
    GM.memo('搬進第二個房間'); if(GM.autosave) GM.autosave(); return true; };
  /* ★主線 5 第三個房間（1A-03，AA_315；AA_12 主線 5、AA_180 2-11）：大三上開學前一天 2027-09-05（日）以後、還沒搬（ROOM_Y3）。做法和主線 3 一樣：
     在臺北的家＝旁白 → 字卡「回宿舍」→ 507（home3d.js 的 loop）；人在宿舍＝直接換房間。拆箱三步：去年的東西一次拿出來 → 大二這一年的新東西一件一件
     （只有經歷過的才有）→ 可以丟一件（黃金葛和大一的五件不列）或都留著。記 ROOM_Y3（第幾天）、ROOM_Y3_ITEMS（新拿出來的）、ROOM_Y3_DISCARD（id 或 null）。
     新東西拿一件、房間多一件（dorm_y3_items.glb，2026-10-20）；去年的東西照舊是 dorm_y2_items.glb（312、507 同一組家具）。舊存檔：9/5 以後還沒有 ROOM_Y3＝下一次進宿舍補演；
     大三下（2028-02-21）以後才讀檔＝直接記 ROOM_Y3、不演（roomY3Late，S.tick）*/
  S.roomY3Due=G=>{ if(!G||(G.stage||'law')!=='law'||!G.flags||G.flags.ROOM_Y3) return false; const d=S.dayOfKey('2027-09-05'), late=S.dayOfKey('2028-02-21'); return d!=null&&G.day>=d&&!(late!=null&&G.day>=late); };
  S.roomY3Late=G=>{ const F=G&&G.flags; if(!F||F.ROOM_Y3||(G.stage||'law')!=='law') return false; const late=S.dayOfKey('2028-02-21'); if(late==null||G.day<late) return false; F.ROOM_Y3=G.day; F.ROOM_Y3_ITEMS=[]; F.ROOM_Y3_DISCARD=null; return true; };
  S.ROOM_Y3_TEXT={notes_y2:['一疊大二的筆記','比大一的薄。字比大一的小。'],fafu_form:['一張空白的筆錄紙','值班那天多帶回來的。上面只寫了日期。'],
    sis_plan:['學姊研究計畫的第二段，印出來的','『學弟看第二段。』你真的看了。邊邊都是你的鉛筆字。'],article:['學姊給的那篇文章','讀了三次。第三次讀完，你開始想『如果是我會怎麼寫』。'],
    zq_usb:['一支隨身碟，標籤「測試版　不准外流」','子晴說測完要還。她沒來要，你也忘了還。'],zhe_notes:['阿哲還回來的民法筆記','借出去的時候是一本。還回來的時候，多了兩張他的便利貼。'],
    game_y2:['系籃比賽的節目單','背面是你記的分數。最後一節沒記完。'],expo:['交換說明會的手冊','那天你坐在{EXPO_COUNTRY}那一區。手冊在那一頁折了一個角。'],
    welcome_badge:['小隊輔的名牌','『小隊輔』三個字下面，是你自己寫的名字。'],
    vac_C02:['營隊的隊輔名牌','營隊最後一天，小朋友在背面畫了一個你。不太像。'],vac_C03:['日語課的單字卡','最後一張寫的是『大丈夫』。旁邊有你的註解：不一定是沒事。'],
    vac_C08:['首爾地鐵的交通卡','裡面還有一點錢。你算過，不夠回去。'],vac_C09:['服務隊的隊服','洗了很多次。袖口的字快看不見了。'],
    vac_C10:['加州的結業證書','英文的名字，拼法和你護照上的一樣。你檢查過兩次。'],vac_C11:['東京的課程講義','有一頁你畫了重點。那一頁在講地方自治。'],
    vac_C12:['京都茶室的明信片','沒有寄出去。寫給誰，你還沒想好。']};
  S.roomY3Items=function(G){ const F=G.flags||{}, T=S.ROOM_Y3_TEXT, has=(id,tag)=>typeof SOCIAL!=='undefined'&&SOCIAL.has(id,tag), V=(G.vac&&G.vac.reg)||{}, L=[], it=(id,t)=>L.push([id,t[0],[t[1]]]);
    it('notes_y2',T.notes_y2);
    if((F.FAFU_SHIFT_N|0)>0) it('fafu_form',T.fafu_form);   /* 大二起在法服值過班 */
    if(['curry','sleep','tell'].includes(F.SIS_M2)) it('sis_plan',T.sis_plan);   /* 大二寒假在家族群組，在她的計畫本寫了一格（AA_398 第 15 列）*/
    if(F.grad_read_done) it('article',T.article);
    if(has('heroine_04','PLAYTESTED')) it('zq_usb',T.zq_usb);
    if(has('zhe','LENT_NOTES_Y2')) it('zhe_notes',T.zhe_notes);
    if(has('zhe','WATCHED_GAME_Y2')) it('game_y2',T.game_y2);
    if(F.EXPO_COUNTRY) L.push(['expo',T.expo[0],[T.expo[1].replace('{EXPO_COUNTRY}',F.EXPO_COUNTRY)]]);   /* 去過交換說明會 */
    if(G.events&&G.events.done&&G.events.done.ev_y2_welcome) it('welcome_badge',T.welcome_badge);   /* 大二的迎新（小隊輔）*/
    for(const id of ['C02','C03','C08','C09','C10','C11','C12']) if(V[id+'@Y2']==='done') it('vac_'+id,T['vac_'+id]);   /* 大二寒暑假做完的活動 */
    return L; };
  S.roomY3InDorm=async function(GM){ const G=GM.G; if(!S.roomY3Due(G)) return false; GM.sceneBegin();
    try{ await GM.say(null,'（明天開學。今天搬進第三個房間。）'); await GM.fade(true); if(GM.titleCard) await GM.titleCard('搬到新的房間','五樓 507 號房',2400); GM.advance(0.5);
      G.flags.ROOM_Y3_MOVING=true; if(GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await GM.fade(false); }   /* ROOM_Y3_MOVING：房間直接蓋成 507、紙箱封好，拆完 unboxY3 清掉 */
    finally{ GM.sceneEnd(); }
    return S.unboxY3(GM); };
  S.unboxY3=async function(GM){ const G=GM.G, F=G.flags; if(!S.roomY3Due(G)) return false; F.ROOM_Y3=G.day; if(typeof DM3!=='undefined'&&DM3.fixRoomExit&&G.zone==='dorm') DM3.fixRoomExit(GM.E,G);
    const old=Array.isArray(F.ROOM_Y2_ITEMS)?F.ROOM_Y2_ITEMS.slice():S.roomY2Items(G).map(r=>r[0]), L=S.roomY3Items(G), shown=[]; F.ROOM_Y3_ITEMS=shown; F.ROOM_Y3_DISCARD=null;
    const Z=GM.E&&GM.E.zone, vis=st=>{ if(Z&&Z.setY2Items) Z.setY2Items(st); }; GM.sceneBegin(); vis({shown:[],boxes:'closed'});
    try{ await GM.say(null,'（三個紙箱。比去年少一個。）');
      await GM.choose([{t:'（把去年的東西拿出來）'}]); vis({shown:old.slice()}); await GM.say(null,'（去年拆過的東西，今年一次拿出來就好。每一件都知道自己要放哪裡。）');
      for(let guard=0;guard<40&&L.length;guard++){ const i=await GM.choose(L.map(r=>({t:'（拿出'+r[1]+'）'}))); const r=L.splice(i>=0&&i<L.length?i:0,1)[0]; shown.push(r[0]); vis({shown:old.concat(shown)}); for(const t of r[2]) await GM.say(null,t); }
      if(F.POTHOS) await GM.say(null,(F.pothosWaterN|0)>0?'黃金葛。第三個房間，第三個窗台。它又長了一點。':'黃金葛。第三個房間。它還是沒死。');   /* 已經在房間裡的照舊跟著搬過來，不用拿 */
      delete F.ROOM_Y3_MOVING; vis({boxes:'open'}); await GM.say(null,'（房間滿了。開始有東西要丟掉。）');
      const T2=S.ROOM_Y2_TEXT, T3=S.ROOM_Y3_TEXT, name=id=>(T3[id]||T2[id]||[])[0];
      const can=old.filter(id=>id!=='pothos'&&!/^y1_/.test(id)&&name(id)).concat(shown.filter(id=>name(id)));   /* 黃金葛和大一的五件不列（主線 11 要用）*/
      const opts=can.map(id=>({t:'（丟掉'+name(id)+'）',id})).concat([{t:'（都留著。擠一點就好。）',id:null}]); const k=await GM.choose(opts.map(o=>({t:o.t}))); const o=opts[k>=0&&k<opts.length?k:opts.length-1];
      if(o.id){ F.ROOM_Y3_DISCARD=o.id; vis({shown:old.concat(shown).filter(id=>id!==o.id)}); await GM.say(null,'（你把它放進回收的袋子。房間多了一點空。）'); }
      else await GM.say(null,'（你把書桌上的東西往裡面推了一點。）');
      await GM.say(null,'（兩年。房間比去年滿，你也比去年知道哪些要留。）');
      GM.memo('搬進第三個房間'); if(GM.autosave) GM.autosave(); }
    finally{ delete F.ROOM_Y3_MOVING; GM.sceneEnd(); }
    return true; };
  async function roomItems(GM){ GM.sceneBegin(); try{ const L=S.roomItemList(GM.G); for(let n=0;n<12;n++){ const i=await GM.choose([...L.map(r=>({t:r[0]})),{t:'不看了'}]); if(i<0||i>=L.length) break; if(typeof L[i][2]==='function'){ await L[i][2](GM); break; } for(const t of [].concat(L[i][1])) await GM.say(null,t); } } finally { GM.sceneEnd(); } }   /* 第三欄＝動作（例：玩子晴的測試版，src/zq_testbuild3d.js）：做完就離開選單 */
  /* 宿舍房間裡跟著劇情出現的東西（交接包 v1 第 4 批，BB_95 3-1、3-2）：黃金葛（POTHOS，方奕廷送的，書桌旁）、阿凱書桌下的鍵盤盒子（KAI_SILENT_KB；看過就收起來）。
     進宿舍、待在宿舍時（S.tick）補上，同一個東西不重複加。3D 模型：黃金葛 prop_pothos.glb（ART-04，LAWWW2-C 639f0188）由 zones3d.js 的 z.setPothos 放、照澆水次數換大小 */
  S.dormItems=function(GM){ const G=GM.G, F=G.flags, E=GM.E; if(G.zone!=='dorm'||!E||!E.interactables) return; const has=k=>E.interactables.some(it=>it[k]);
    const SP=(E.zone&&E.zone.spots)||{pothos:[0.7,-2.3],kaiBox:[0.6,1.5],fyPots:[1.0,-1.6]};   /* 四人房（DORM-LOFT-L）：黃金葛在玩家書桌、盒子在阿凱書桌下、三盆植物在後牆窗台（zones3d.js 的 z.spots）*/
    if(F.POTHOS&&!has('pothos')) E.interactables.push({x:SP.pothos[0],z:SP.pothos[1],radius:0.6,label:'黃金葛',pothos:true});
    if(E.zone&&E.zone.setPothos) E.zone.setPothos(!!F.POTHOS,F.pothosWaterN|0);   /* ART-04：盆栽模型、大小跟著澆水次數（zones3d.js）*/
    if(F.KAI_SILENT_KB&&!F.KAI_BOX_SEEN&&!has('kaiBox')) E.interactables.push({x:SP.kaiBox[0],z:SP.kaiBox[1],radius:0.7,label:'書桌下的盒子',kaiBox:true});
    const FP=F.fyPots; if(FP&&FP.hand!=null&&!FP.done&&!has('fyPots')) E.interactables.push({x:SP.fyPots[0],z:SP.fyPots[1],radius:0.55,label:'方奕廷的三盆植物',fyPots:true}); };
  /* 黃金葛：每週（週一開始）澆一次就夠；沒澆也不會枯，只是不長大（BB_95 3-1；v1 只有一個大小，澆了幾次記在 pothosWaterN，之後長大用）*/
  const weekNo=day=>Math.floor((day+1)/7);   /* 第 6 天＝9/22 週一 */
  S.pothosWeek=weekNo;
  async function pothosScene(GM){ const G=GM.G, F=G.flags; GM.sceneBegin(); try{ const wk=weekNo(G.day);
      if(F.pothosWaterWk===wk){ await GM.say(null,'土還是濕的。這週澆過了。'); return; }
      const i=await GM.choose([{t:'澆水'},{t:'不用了'}]); if(i!==0) return; F.pothosWaterWk=wk; F.pothosWaterN=(F.pothosWaterN|0)+1; await GM.say(null,'你幫黃金葛澆了水。'); } finally { GM.sceneEnd(); } }
  /* 阿凱的鍵盤盒子（BB_95 3-2）：「靜音軸。這個很貴喔。」——阿凱：「……我本來就想換。」記憶 HELPED（為你換鍵盤）。阿凱不在房間時只有前一句，等他在再說 */
  async function kaiBoxScene(GM,it){ const G=GM.G, F=G.flags, E=GM.E; const kai=GM.npc.kai; GM.sceneBegin(); try{ await GM.say(ME(G),'靜音軸。這個很貴喔。'); if(!kai) return;
      await GM.say(kai,'……我本來就想換。'); F.KAI_BOX_SEEN=true; SOCIAL.remember('kai','HELPED','為你換鍵盤'); const k=E.interactables.indexOf(it); if(k>=0) E.interactables.splice(k,1); } finally { GM.sceneEnd(); } }
  /* 方奕廷上山的一週（BB_120 1-7、1-7c，BB 2026-10-14）：好朋友的門檻台詞「我下週上山。我的植物，可以拜託你澆嗎？」之後的下週一起，第一次待在房間（7:00～23:00）時
     他把三盆搬到窗台：「三盆。兩天一次。早上澆，不要澆到葉子。」（房間物件「方奕廷的三盆植物」，可以點「澆水」）；七天裡檢查三次（第 2、4、6 天結束時：
     那兩天裡沒有澆就算忘了一次）；第 8 天（之後第一次待在房間時）他回來：都有澆「三盆都很好。土的濕度剛好。」「……謝謝。下次上山還找你。」，
     忘了一次以上「它們很堅強。」；三盆搬回他的房間、物件拿掉。存檔 F.fyPots＝{ask（門檻台詞那天）, hand（交給你那天）, w:[澆水的日子], done, forgot}；
     門檻台詞那天沒有記錄（SOCIAL relUpDay 以前的存檔）就不演，不知道他是哪一天說的 */
  const monAfter=day=>{ let d=day+1; while(CALENDAR.dateOf(d).wd!==1&&d<day+8) d++; return d; };
  const fyWho=()=>({name:SOCIAL.displayName?SOCIAL.displayName('npc_fangyt'):'方奕廷',charId:'npc_fangyt'});
  S.fyForgot=P=>{ let n=0; for(let k=0;k<3;k++){ const a=P.hand+2*k; if(!(P.w||[]).some(d=>d===a||d===a+1)) n++; } return n; };
  let fyT=0;
  function fyPotsTick(GM,dt){ const G=GM.G, F=G.flags; if(typeof SOCIAL==='undefined'||!G.social||typeof CALENDAR==='undefined') return false; let P=F.fyPots;
    if(!P){ if((((G.social.relUp||{}).npc_fangyt)|0)<4) return false; const d=(G.social.relUpDay||{}).npc_fangyt; P=F.fyPots=d==null?{done:true,old:true}:{ask:d,hand:null,w:[]}; }
    if(P.done) return false; const hr=h(G); if(hr<7||hr>=23){ fyT=0; return false; }
    if(!(P.hand==null?G.day>=monAfter(P.ask):G.day>=P.hand+7)){ fyT=0; return false; }
    fyT+=dt||0; if(fyT<2.5) return false; fyT=0;   /* 進房間 2.5 秒以後（不和進門的事件搶）*/
    (async()=>{ try{ if(P.hand==null) await fyHand(GM); else await fyBack(GM); }catch(e){ console.warn('fyPots',e); } })(); return true; }
  async function fyHand(GM){ const G=GM.G, P=G.flags.fyPots; P.hand=G.day; GM.sceneBegin(); try{ await SOCIAL.playSteps(GM,fyWho(),'npc_fangyt',['（方奕廷把三盆植物搬到你的房間窗台。）','「三盆。兩天一次。早上澆，不要澆到葉子。」']); } finally { GM.sceneEnd(); } S.dormItems(GM); }
  async function fyBack(GM){ const G=GM.G, E=GM.E, P=G.flags.fyPots, n=S.fyForgot(P); P.done=true; P.forgot=n; GM.sceneBegin();
    try{ await SOCIAL.playSteps(GM,fyWho(),'npc_fangyt',(n===0?['「三盆都很好。土的濕度剛好。」','「……謝謝。下次上山還找你。」']:['「它們很堅強。」']).concat(['（三盆搬回他的房間了。）'])); } finally { GM.sceneEnd(); }
    const k=E&&E.interactables?E.interactables.findIndex(it=>it.fyPots):-1; if(k>=0) E.interactables.splice(k,1); }
  async function fyPotsScene(GM){ const G=GM.G, P=G.flags.fyPots; if(!P||P.done||P.hand==null) return; GM.sceneBegin(); try{
      if((P.w||[]).includes(G.day)){ await GM.say(null,'土還是濕的。今天澆過了。'); return; }
      const i=await GM.choose([{t:'澆水'},{t:'不用了'}]); if(i!==0) return; (P.w||(P.w=[])).push(G.day); await GM.say(null,'你幫三盆植物澆了水。'); } finally { GM.sceneEnd(); } }
  S._fy={tick:(GM,dt)=>fyPotsTick(GM,dt),hand:GM=>fyHand(GM),back:GM=>fyBack(GM),scene:GM=>fyPotsScene(GM),monAfter,reset(){ fyT=0; }};   /* 測試用 */
  /* 睡著被叫醒以後（S.lawWakeAt：11/17 22:00 可昕的電話、10/24 感冒那一晚、10/26 可昕、6/1 20:00 收拾）：醒來那一段（和接著到的事件）演完、人還在同一個房間、同一個晚上（03:00 以前）
     ＝床的選單自動再出來一次（BB-C 10-20：選了「睡到明天早上」，電話講完人醒著站在房間，要自己再走去床）。選「再撐一下」、先去做別的事（S.interact）、走出房間＝不再出 */
  let resumeT=0;
  S.resumeSleepTick=function(GM,dt){ const R=S._resume, G=GM.G; if(!R) return false; if(G.zone!==R.zone||G.day!==R.day||G.hour>=27){ S._resume=null; return false; }
    resumeT+=dt||0; if(resumeT<1) return false; resumeT=0; S._resume=null; bedScene(GM).catch(e=>console.warn('resumeSleep',e)); return true; };
  /* 睡著之後、天亮之前的事件（EVENTS.sleepEvent：trigger 'sleep'，例：阿凱凌晨三點的螢幕）：畫面換成凌晨三點的房間演，演完再暗下來繼續睡 */
  async function nightEvent(GM){ const G=GM.G, E=GM.E; if(typeof EVENTS==='undefined'||!EVENTS.sleepEvent) return false; const ev=EVENTS.sleepEvent(); if(!ev) return false;
    if(ev.sleepCard){ await GM.titleCard(ev.sleepCard[0],ev.sleepCard[1]||'',1400); } else { G.hour=Math.max(G.hour,27); E.hour=G.hour; if(GM.updateHUD) GM.updateHUD(); await GM.titleCard('03:00','',1400); } await GM.fade(false);   /* sleepCard：別的時間、別的地方的一小段（子晴問阿凱：17:00 資工系館），不把時間改成凌晨三點 */
    try{ await EVENTS.run(ev); } finally { await GM.fade(true); } return true; }
  S.nightEvent=GM=>nightEvent(GM);   /* 睡著以後才演的事件（學期中的快轉跳過夜裡時也演，src/semff3d.js）*/
  S._v1={kexinFirstMsg:(GM,v)=>kexinFirstMsg(GM,v),familyGroupD1:GM=>familyGroupD1(GM),roomItems:GM=>roomItems(GM),phoneScene:(GM,th,l,a)=>phoneScene(GM,th,l,a),talkSis:(GM,n)=>talkSis(GM,n),pothosScene:GM=>pothosScene(GM),kaiBoxScene:(GM,it)=>kaiBoxScene(GM,it),nightEvent:GM=>nightEvent(GM),talkYu:(GM,n)=>talkYu(GM,n)};   /* 測試用 */
  async function deskScene(GM,it){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; GM.sceneBegin(); const ap=GM.seatApproach?GM.seatApproach(it.seat):[it.seat.x,it.seat.z+0.5]; await GM.walkTo(P,ap[0],ap[1]); GM.sitAt(P,it.seat); E.cam.distTarget=3.2;   /* 四人房的書桌從側面走近（seat.ap；原本固定往 +z 0.5 m，那裡是書桌和床架，QA-HANDOFF-B1 reachability_all）*/ await GM.sleep(300);
    if(S.mainDay(G)===1&&!F.readCase){ await GM.say(null,'從課程網站印下來的案例放在桌上。「'+CASE.title.replace('指定案例：','')+'」。底下是兩頁的案例事實，最後列了三個問題。');   /* AA_195 4-1：相機案是教學用的假設案例，不寫「判決節錄」（不杜撰判決）；新局、舊局都用 */ const i=await GM.choose([{t:'認真讀完（約 1 小時）',hint:'明天上課可能用得到'},{t:'讀一半就好'},{t:'不讀了，明天再說'}]); if(i===0){ P.pose='read'; P.idlePose='read'; await GM.fade(true); GM.advance(1.1); await GM.fade(false); F.readCase='full'; GM.addNote(CASE.id,CASE.title,CASE.body); GM.addNote('law_154','民法 §154：要約與要約之引誘','貨物標定賣價陳列者，視為要約；但價目表之寄送，不視為要約。網拍頁面算哪一種，有爭論。'); GM.addNote('law_88','民法 §88：意思表示錯誤','表意人若無過失，得撤銷；撤銷後對信賴者負賠償責任（§91）。'); await GM.say(null,'你讀到最後一頁的時候，阿凱的遊戲已經打到第三場。你在頁邊寫下：「標價陳列 vs 價目表寄送——網頁到底像哪一個？」'); GM.memo('熬夜讀完了網拍相機的案例'); }
      else if(i===1){ P.pose='read'; P.idlePose='read'; await GM.fade(true); GM.advance(0.5); await GM.fade(false); F.readCase='half'; GM.addNote(CASE.id,CASE.title,CASE.body); await GM.say(null,'你看完事實部分就停了。賣家說自己少打一個零，想撤銷。至於法院怎麼判——明天再說。'); GM.memo('案例只讀了一半'); }
      else { F.readCase='none'; await GM.say(null,'你把影本推到桌角。反正一班六十幾個人，不會那麼剛好。'); GM.memo('沒有讀案例'); }
      GM.setGoal('睡覺（明天 13:20 民法總則）'); }
    else { const C=typeof CLS!=='undefined'&&CLS.slotPlan?CLS:null, s1=C?C.slotPlan(G,1,'study'):{ok:true,hint:''}, s2=C?C.slotPlan(G,0.5,'study'):{ok:true,hint:''};   /* 書桌讀書、整理筆記都算一次自習（DL-03 2-3）*/
      const opts=[{t:'讀書',hint:s1.ok?'選讀多久（1～3 小時只算一次）。'+s1.hint:s1.why,dim:!s1.ok},{t:'整理今天的筆記（30 分鐘）',hint:s2.ok?s2.hint:s2.why,dim:!s2.ok},{t:'起身'}]; const i=await GM.choose(opts);
      if(i<2&&opts[i].dim) GM.toast(opts[i].hint,3000);
      else if(i===0){ const L=C&&C.chooseStudy?await C.chooseStudy(GM):{hours:1,uses:[]}; if(L){ P.pose='read'; P.idlePose='read'; await GM.studySession(false,L.hours); if(C){ C.slotUse(G,L.uses); if(C.queueJump) C.queueJump(G); } } }
      else if(i===1){ P.pose='read'; await GM.fade(true); GM.advance(0.5); await GM.fade(false); await GM.say(null,'你把筆記重看一遍。有些地方當時覺得懂，現在看又不太確定。'); if(C) C.slotUse(G,s2.uses); } }
    GM.standUp(P); GM.sceneEnd(); }
  /* ===== 宿舍睡覺的畫面（DORM-SLEEP-1030；使用者 10-30 04:2x 對 LAWWW2：「宿舍玩加上去睡覺要真的有畫面 不然從頭到尾都是站在門口說睡完覺 很沒有真實感」）=====
     資料：DORM_ROOM（src/data/dorm_room_layout.js）玩家那一組床桌（player_unit，L2）的 sleep_scene（LAWWW2-B 98f8a41f7）：approach 梯子前、steps 踏點 (x,y,z)、bed_entry 上床點、
       lie（feet／head 位置、head_dir_yaw 頭朝哪、mattress_top_y 床墊頂）、cam（eye、look：睡覺鏡頭）。
     上床（床的選單選了睡覺、小睡）：走到梯子前 → 換鏡頭（梯子側面）→ 一階一階爬上去（pose climb：走路片段＋手往前抓，character3d.js）→ 上床點 → 短淡出 → 躺下（pose lie）、睡覺鏡頭 →
       熄燈（S.roomDark）→ 閉眼 → 照原本的睡覺（sleepNow／CLS.skipTo；劇情、睡前訊息、半夜的事件、醒來字卡的順序和條件都不動）。
     醒來：一般的睡覺（sleepNow 換房間的那一次）人在床上醒來 → 短淡出 → 從梯子一階一階下來、站在梯子前；睡著被叫醒（電話 S.coreCallAt／S.lawWakeAt）：開燈、爬下來；
       小睡、經濟系／畢業後「睡覺＝到下一件事」：黑幕裡放回梯子前（GM.onBlack）。保底：人在床上、沒有在演、玩家空下來（S.tick）＝直接放回梯子前；換到別的區域＝清掉。
     沒有 sleep_scene 的房間、不在宿舍房間（美國公寓、家裡）：照原本（梯子前淡出就睡、醒來在門口）。
     熄燈：區域有 z.lightsOff(k)（LAWWW2 的第三張光照貼圖 roomDarkMap，k 0～1）就用它；沒有就把曝光壓暗（E.toneK × (1−0.82k)，室內 applyTime 每 5 格套一次）。換成光照貼圖只要區域提供 lightsOff。
     讀檔中途：LOADLOCKS 放開（S._bed、S._bedBusy、GM.onBlack、曝光）；存檔時人在床上＝存梯子前（STORY.bedSavePos，game3d.js snapshot）。測試：node tests/dorm_sleep_scene_unit.js */
  S.SLEEP_T={step:0.38,entry:0.5,hold:0.7,dim:0.9,wake:1.0};   /* 秒：一階、上床點、躺下以後、熄燈、醒來躺著 */
  S.DARK_MAX=0.82;   /* 沒有熄燈光照貼圖時曝光最多壓掉多少（0.7 在 SwiftShader 截圖還像傍晚，2026-10-30）*/
  S.sleepSceneOf=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||G.zone!=='dorm'||!E||!E.zone||!E.player||typeof DORM_ROOM==='undefined'||!DORM_ROOM||!DORM_ROOM.units) return null;
    const u=DORM_ROOM.units.find(q=>q.id===(DORM_ROOM.player_unit||'L2')), sc=u&&u.sleep_scene; if(!sc||!sc.approach||!Array.isArray(sc.steps)||!sc.steps.length||!sc.lie||!sc.lie.feet||!sc.cam||!sc.cam.eye||!sc.cam.look) return null; return sc; };
  S.sleepJumpMode=G=>!!((typeof ECONFF!=='undefined'&&ECONFF.on&&ECONFF.on(G)&&ECONFF.next&&ECONFF.next(G))||(typeof PG!=='undefined'&&PG.bedOptions&&PG.bedOptions(G)));   /* 「睡覺＝到下一件事」（S.bedOptions 同一個判斷）*/
  /* 熄燈的程度 k（0＝照原本、1＝熄燈）：z.lightsOff 優先；沒有就壓曝光。k 回到 0＝曝光還原成原本的值 */
  let darkSave=null;
  S.DARK_LIGHTS=0.85;   /* 熄燈時半球光、方向光降掉的比例（剩一成五）*/
  S.roomDark=function(GM,k){ const E=GM&&GM.E, z=E&&E.zone, lm=!!z&&typeof z.lightsOff==='function'; k=Math.max(0,Math.min(1,+k||0)); S._dark=k;
    if(lm){ try{ z.lightsOff(k); }catch(e){ console.warn('lightsOff',e); }
      if(!z._darkLit&&E){ z._darkLit=true; const at0=z.applyTime; z.applyTime=function(h,w){ if(at0) at0.call(this,h,w); const q=+z.lightsOffK||0; if(q>0){ const f=1-S.DARK_LIGHTS*q; if(E.hemi) E.hemi.intensity*=f; if(E.sun) E.sun.intensity*=f; if(E.fill) E.fill.intensity*=f; } }; }   /* 熄燈：沒烘焙的小東西（紙、塑膠椅、螢幕）靠半球光、方向光，跟著降到一成五（LAWWW2-B 05:36 DORM203-LM-1030）；engine 每 5 格 applyTime 重設，所以包在區域的 applyTime 後面 */
      if(E&&E.applyTime) try{ E.applyTime(E.hour); }catch(e){} }
    if(k>0&&!lm&&E){ if(!darkSave) darkSave={E,k0:E.toneK}; E.toneK=(darkSave.k0||1)*(1-S.DARK_MAX*k); }
    else if(darkSave){ darkSave.E.toneK=darkSave.k0; darkSave=null; }   /* 開燈、或熄燈途中正式模型（有光照貼圖）才載好：曝光還原 */
    if(E&&!lm&&E.applyTime) try{ E.applyTime(E.hour); }catch(e){} return k; };
  async function darkTo(GM,k1,sec){ const k0=S._dark||0, n=GM.turbo?1:Math.max(2,Math.round(sec*12)); for(let i=1;i<=n;i++){ S.roomDark(GM,k0+(k1-k0)*i/n); await GM.sleep(sec*1000/n); } }
  /* 沿直線移到 to=(x,y,z)（踏點、上床點）：緩進緩出，一階一個節奏；GM.sleep 照讀檔世代（讀檔＝停住不往下）*/
  async function bedTween(GM,o,to,sec){ const p=o.position, x0=p.x, y0=p.y, z0=p.z, n=GM.turbo?1:Math.max(2,Math.round(sec*25));
    for(let i=1;i<=n;i++){ const t=i/n, e=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; p.x=x0+(to[0]-x0)*e; p.y=y0+(to[1]-y0)*e; p.z=z0+(to[2]-z0)*e; await GM.sleep(sec*1000/n); } }
  const faceTo=(o,x,z)=>{ const dx=x-o.position.x, dz=z-o.position.z; if(Math.hypot(dx,dz)>0.03) o.rotation.y=Math.atan2(dx,dz); };
  /* 爬梯子的鏡頭：踏點中間往床的反方向退 1.8 m、往梯子底下（房間中間）退 1.6 m、高 1.75（L2：(−0.83, 1.75, 2.99) 看梯子；第一版退 1 m、高 1.55 太近，人爬到一半頭出畫面）*/
  S.climbCam=function(sc){ const st=sc.steps, n=st.length, a=sc.approach, L=sc.lie; const mx=(st[0][0]+st[n-1][0])/2, mz=(st[0][2]+st[n-1][2])/2;
    let ux=st[n-1][0]-a[0], uz=st[n-1][2]-a[1]; const ul=Math.hypot(ux,uz)||1; ux/=ul; uz/=ul; const hd=L.head||L.feet; let bx=hd[0]-L.feet[0], bz=hd[2]-L.feet[2]; const bl=Math.hypot(bx,bz)||1; bx/=bl; bz/=bl;
    return {pos:[mx-bx*1.8-ux*1.6,1.75,mz-bz*1.8-uz*1.6],look:[mx,0.95,mz]}; };
  function camOn(GM,c,snap){ if(GM.cine) GM.cine('close',GM.E.player.obj,null,{pos:V(c.pos[0],c.pos[1],c.pos[2]),look:V(c.look[0],c.look[1],c.look[2]),snap:!!snap}); }
  const bedCam=sc=>({pos:sc.cam.eye,look:sc.cam.look});
  /* 躺下：root 放在腳的位置、床墊頂的高度，朝向＝頭的方向＋π（character3d.js 的 lie 把整個人往 root 的 −z 放倒）*/
  S.lieDown=function(GM,sc){ const E=GM.E, P=E.player, L=sc.lie, o=P.obj; o.position.x=L.feet[0]; o.position.z=L.feet[2]; o.position.y=L.mattress_top_y!=null?L.mattress_top_y:L.feet[1]-0.05;
    const hd=L.head||L.feet, hy=L.head_dir_yaw!=null?L.head_dir_yaw:Math.atan2(hd[0]-L.feet[0],hd[2]-L.feet[2]); o.rotation.y=hy+Math.PI;
    if(P.seat) P.seat=null; P.pose='lie'; P.idlePose='lie'; P.path=null; P.target=null; P.frozen=true; if(o.userData) o.userData.eyesShut=false; if(E.prePose) try{ E.prePose(P); }catch(e){}
    S._bed=Object.assign(S._bed||{},{sc,zone:E.zone,day:GM.G.day}); return true; };
  /* 站回梯子前（面向房間）*/
  S.bedStand=function(GM,sc){ const E=GM.E, P=E.player, o=P.obj, a=sc.approach, s0=sc.steps[0]; if(o.userData) o.userData.eyesShut=false; P.pose='idle'; P.idlePose='idle'; P.frozen=false; P.path=null;
    if(E.placeAt) E.placeAt(P,a[0],a[1],0); else { o.position.x=a[0]; o.position.z=a[1]; o.position.y=0; } o.rotation.y=Math.atan2(a[0]-s0[0],a[1]-s0[2]); };
  /* 清掉床的狀態、開燈；how：'state'＝只清狀態（換了區域）、'cam'＝站回梯子前並結束運鏡（黑幕裡）、其他＝站回梯子前 */
  S.bedClear=function(GM,how){ const B=S._bed; S._bed=null; S._bedBusy=false; if(GM&&GM.onBlack===bedOnBlack) GM.onBlack=null; if(!GM||!GM.E) return false; S.roomDark(GM,0); if(!B) return false;
    const E=GM.E, P=E.player, same=E.zone===B.zone&&GM.G.zone==='dorm'; if(same&&how!=='state'&&P&&(P.pose==='lie'||P.pose==='climb'||P.pose==='climbdown')) S.bedStand(GM,B.sc); else if(P&&P.obj&&P.obj.userData) P.obj.userData.eyesShut=false;
    if(same&&how==='cam'&&E.endCinematic) E.endCinematic(); return true; };
  function bedOnBlack(){ if(typeof GAME!=='undefined') S.bedClear(GAME,'cam'); }
  function disarmBlack(GM){ if(GM&&GM.onBlack===bedOnBlack) GM.onBlack=null; }   /* 沒有用到的黑幕接口收掉（小睡沒跳成）*/
  S.bedOnBlack=bedOnBlack;
  S.bedSavePos=function(GM){ const B=S._bed; if(!B||!GM||!GM.G||GM.G.zone!=='dorm') return null; const a=B.sc.approach, s0=B.sc.steps[0]; return {x:+a[0].toFixed(2),z:+a[1].toFixed(2),yaw:+Math.atan2(a[0]-s0[0],a[1]-s0[2]).toFixed(3),lv:0,y:0}; };
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:bed']=()=>{ S._bed=null; S._bedBusy=false; S._dark=0; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的爬梯子、醒來走不到 finally。曝光：讀檔一定換區域，S.populate 第一行還原（darkSave）；GM.onBlack：game3d.js 的 loadRelease 清掉 */
  /* 上床：走到梯子前 → 爬 → 躺下 → 熄燈。回傳 true＝人已經躺在床上（S._bed），之後照原本的睡覺 */
  async function goToBed(GM,sc){ const E=GM.E, P=E.player, T=S.SLEEP_T, st=sc.steps, L=sc.lie; let ok=false; S._bedBusy=true; GM.sceneBegin();
    try{ if(P.seat&&GM.standUp) GM.standUp(P); await GM.walkTo(P,sc.approach[0],sc.approach[1]); const c=S.climbCam(sc); camOn(GM,c); faceTo(P.obj,st[0][0],st[0][2]); P.pose='idle'; await GM.sleep(300);
      P.pose='climb'; S._bed={sc,zone:E.zone,day:GM.G.day};
      for(const s of st){ faceTo(P.obj,s[0],s[2]); await bedTween(GM,P.obj,s,T.step); camOn(GM,{pos:c.pos,look:[P.obj.position.x,P.obj.position.y+1.0,P.obj.position.z]}); }
      const be=sc.bed_entry||[L.feet[0],L.mattress_top_y||L.feet[1],L.feet[2]]; faceTo(P.obj,be[0],be[2]); await bedTween(GM,P.obj,be,T.entry);
      await GM.fade(true); S.lieDown(GM,sc); camOn(GM,bedCam(sc),true); await GM.fade(false);
      await GM.sleep(T.hold*1000); await darkTo(GM,1,T.dim); if(P.obj.userData) P.obj.userData.eyesShut=true; await GM.sleep(450); ok=true; }
    finally { S._bedBusy=false; GM.sceneEnd(); if(ok&&S._bed) camOn(GM,bedCam(sc),true); }   /* sceneEnd 會把鏡頭放回跟隨：接著睡覺的黑幕要停在睡覺鏡頭 */
    return ok; }
  /* 起床：開燈 → 短淡出 → 最上面一階 → 一階一階下來 → 梯子前。在 sceneBegin 裡面叫（外面的 sceneEnd 放回跟隨鏡頭）*/
  async function getUp(GM,sc){ const E=GM.E, P=E.player, T=S.SLEEP_T, st=sc.steps; S._bedBusy=true;
    try{ if(P.obj.userData) P.obj.userData.eyesShut=false; if((S._dark||0)>0) await darkTo(GM,0,0.4); await GM.sleep(300);
      await GM.fade(true); const top=st[st.length-1]; P.obj.position.x=top[0]; P.obj.position.y=top[1]; P.obj.position.z=top[2]; P.pose='climbdown'; P.idlePose='idle'; P.frozen=false;   /* 下來：走路的樣子（不舉手）*/
      const nx=st.length>1?st[st.length-2]:[sc.approach[0],0,sc.approach[1]]; faceTo(P.obj,nx[0],nx[2]); const c=S.climbCam(sc); camOn(GM,{pos:c.pos,look:[top[0],top[1]+1.0,top[2]]},true); await GM.fade(false);
      for(let i=st.length-2;i>=0;i--){ const s=st[i]; faceTo(P.obj,s[0],s[2]); await bedTween(GM,P.obj,s,T.step); camOn(GM,{pos:c.pos,look:[P.obj.position.x,P.obj.position.y+1.0,P.obj.position.z]}); }
      const a=sc.approach; faceTo(P.obj,a[0],a[1]); await bedTween(GM,P.obj,[a[0],0,a[1]],T.step); }
    finally { S._bedBusy=false; S.bedClear(GM); } }
  /* 醒來（sleepNow 換房間那一次）：進房間時（GM.enter 的 onLoaded，淡入以前）就躺在床上、睡覺鏡頭；淡入以後躺一下、睜眼、爬下來 */
  S.wakeSpawn=sc=>{ const a=sc.approach, s0=sc.steps[0]; return {x:a[0],z:a[1],yaw:Math.atan2(a[0]-s0[0],a[1]-s0[2])}; };
  function wakePlace(GM,sc){ S.roomDark(GM,0); S.lieDown(GM,sc); if(GM.E.player.obj.userData) GM.E.player.obj.userData.eyesShut=true; S._bed.waking=true; camOn(GM,bedCam(sc),true); }
  async function wakeUp(GM,sc){ GM.sceneBegin(); S._bedBusy=true; try{ await GM.sleep(S.SLEEP_T.wake*500); if(GM.E.player.obj.userData) GM.E.player.obj.userData.eyesShut=false; await GM.sleep(S.SLEEP_T.wake*500); await getUp(GM,sc); } finally { S._bedBusy=false; GM.sceneEnd(); } }
  S._bedFx={goToBed:(GM,sc)=>goToBed(GM,sc),getUp:(GM,sc)=>getUp(GM,sc),wakeUp:(GM,sc)=>wakeUp(GM,sc),wakePlace:(GM,sc)=>wakePlace(GM,sc)};   /* 測試用 */
  async function bedScene(GM){ const G=GM.G, F=G.flags; S._resume=null; if(typeof HOME!=='undefined'&&HOME.eveDue&&HOME.eveDue(G)&&HOME.eveGo){ await HOME.eveGo(GM); return; }   /* BB 退件 HOLFF-EVE-SKIP：除夕 17:00 停站以後，S.tick 每 30 格才帶回家（實機約 0.5 秒、模擬器三十幾秒），這段時間點床的快轉或睡覺會直接跳到初一、年夜飯整段不演——點床就先回家 */ GM.sceneBegin(); if(S.mainDay(G)===1&&!F.readCase){ const i=await GM.choose([{t:'還沒讀案例，先睡了'},{t:'等等，先去看一下'}]); if(i===1){ GM.sceneEnd(); return; } F.readCase='none'; GM.memo('沒有讀案例就睡了'); } const opts=S.bedOptions(G); const i=await GM.choose(opts.map(o=>({t:o.t,hint:o.hint}))); GM.sceneEnd(); const o=opts[i]; if(!o||o.kind==='stay') return; if(o.kind==='ff'){ if(typeof HOME!=='undefined'&&HOME.ffMenu) await HOME.ffMenu(GM,'dorm'); return; } if(o.kind==='semff'){ if(typeof SEMFF!=='undefined') await SEMFF.menu(GM); return; }   /* 學期中的快轉（FF-SEMESTER-1023，src/semff3d.js）*/ const sc=S.sleepSceneOf(GM), inBed=sc&&(o.kind==='sleep'||o.kind==='nap')?await goToBed(GM,sc):false;   /* 宿舍房間：爬上床、躺下、熄燈（DORM-SLEEP-1030）*/ if(inBed&&(o.kind!=='sleep'||S.sleepJumpMode(G))) GM.onBlack=bedOnBlack;   /* 小睡、到下一件事：下一次黑幕裡放回梯子前（醒來站在梯子前）*/ try{ if(o.kind==='sleep') await sleepNow(GM,o.wake,o.alarm); else if(typeof CLS!=='undefined'&&CLS.skipTo) await CLS.skipTo(GM,o.to,{nap:true}); } finally { disarmBlack(GM); } if(inBed&&S._bed&&!S._bedBusy){ const B=S._bed; if(G.zone==='dorm'&&GM.E.zone===B.zone&&GM.E.player.pose==='lie'){ GM.sceneBegin(); try{ await getUp(GM,B.sc); } finally { GM.sceneEnd(); } } else S.bedClear(GM,'state'); } }   /* 還躺在床上（小睡沒跳成、沒有黑幕）：開燈、爬下來 */
  /* 床的選項（2026-10-13 使用者試玩：「睡覺只能隔天醒來？應該要有小睡一下的選項」「早上睡覺醒來變成下午、下午睡覺起來變成晚上」；AA_110 第 6-5 節，AA 暫定）：
     白天（05:00–17:30）小睡 30 分鐘／1 小時／2 小時——預設在下一堂課前 20 分鐘叫醒（鬧鐘）；「睡到傍晚」不設鬧鐘（照手機跳過時間：會錯過課先問一次）。
     晚上（17:30 以後、過午夜）睡到明天：早上（有課就在第一堂前 1 小時，沒課 07:30）、中午、下午、晚上——每個選項寫會錯過什麼（只提醒不阻止，翹課照現有規則）；
     考試、答應了的約（A 類）鬧鐘一定叫醒：考試前 1 小時、約前 30 分鐘。第一、二天照劇情只有「睡覺」。小睡、跳過的時間不產生偶遇、不補觸發事件、不算出席（AA_109 7-1）。 */
  const hm=x=>{ const m=Math.round(x*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  S.wakeAlarms=function(G,day){ const out=[]; if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined') for(const it of CLS.dayItems(G,day)) if(it.exam) out.push({h:it.t0-1,why:it.c.name+'考試'});
    for(const iv of (G.invites||[])) if(iv.day===day&&iv.accepted&&!iv.done&&iv.h!=null) out.push({h:iv.h-0.5,why:'約好的時間'+(iv.label?'：'+iv.label:'')});
    if(typeof DATE!=='undefined'&&DATE.alarmsFor) for(const a of DATE.alarmsFor(G,day)) out.push({h:a.h,why:a.why});   /* 校外約會：出發前 30 分鐘（DATE-S4）*/
    if(typeof OUT!=='undefined'&&OUT.rec) for(const q of OUT.rec(G)) if(q.alarm&&q.state==='planned'&&q.day===day) out.push({h:q.h-(OUT.trip?OUT.trip(G,q).travelH:(q.travelH||0))-0.5,why:'約好的時間：'+q.title});   /* 出遊標 alarm 的（X81：8/30 載可昕上山）：出發前 30 分鐘叫醒 */
    if(S.y4Alarms) for(const a of S.y4Alarms(G,day)) out.push(a);   /* 1A-12 畢業典禮 08:00、1A-15 宿舍期滿 10:00（AA_318）*/
    for(const f of S.ALARMS){ try{ for(const a of (f(G,day)||[])) out.push(a); }catch(e){ console.warn('STORY.ALARMS',e); } }   /* 事件包各自的鬧鐘（STORY.ALARMS.push(fn)：fn(G,day) 回傳 [{h,why}]）*/
    return out.sort((a,b)=>a.h-b.h); };
  /* 今天標 alarm 的出遊（X81：8/30 載可昕上山）在白天的床邊選項也要寫：跳過時間會停在出發前 10 分鐘（CLS.skipStops 同一個時間），原本只有晚上的選項有寫（BUG-E37-DORM-SLEEP-1021，BB 10-21）*/
  S.outStopsToday=function(G,h0){ const out=[]; if(typeof OUT==='undefined'||!OUT.rec) return out; for(const q of OUT.rec(G)){ if(!q.alarm||q.state!=='planned'||q.day!==G.day) continue; const dep=q.h-(OUT.trip?OUT.trip(G,q).travelH:(q.travelH||0)); if(dep-1/6>h0+0.05) out.push({h:dep-1/6,why:'約好的時間：'+q.title}); } return out.sort((x,y)=>x.h-y.h); };
  /* 今天晚上（h0 以後、午夜以前）第一個鬧鐘：S.wakeAlarms 的今天（出發前 30 分鐘）；那個已經過了、出遊還沒出發的，出發前 10 分鐘（S.outStopsToday，和跳過時間同一個停點）*/
  S.tonightAlarm=function(G,h0){ const A=S.wakeAlarms(G,G.day).filter(a=>a.h>h0+0.05&&a.h<24).concat(S.outStopsToday(G,h0).filter(a=>a.h<24)); A.sort((a,b)=>a.h-b.h); return A[0]||null; };
  S.missText=function(G,day,h0,h1){ if(typeof CLS==='undefined'||typeof CALENDAR==='undefined') return ''; const its=CLS.dayItems(G,day).filter(it=>!it.exam&&!CLS.storyClass(Object.assign({},G,{day}),it)&&it.t0+0.5>h0&&it.t0+0.5<=h1&&!(CLS.rec(G).done[it.key]));
    return its.length?'會錯過：'+its.map(it=>hm(it.t0)+' '+it.c.name).join('、'):''; };
  /* 小睡的長度（30 分鐘、1 小時、2 小時；maxH 以內——圖書館、自習區的桌上趴著睡最多 1 小時）：預設在下一堂課前 20 分鐘叫醒 */
  S.napOptions=function(G,maxH){ const out=[], hh=h(G); if(S.opening(G)||G.hour>=24) return out; const nx=typeof CLS!=='undefined'&&CLS.next?CLS.next(G):null, alarm=nx&&nx.t0-1/3>hh+0.05?nx.t0-1/3:null;
    const da=typeof DATE!=='undefined'&&DATE.alarmsFor?DATE.alarmsFor(G,G.day).find(q=>q.h>hh+0.05):null;   /* 今天的校外約會：出發前 30 分鐘叫醒（DATE-S4）*/
    for(const [d,lab] of [[0.5,'小睡 30 分鐘'],[1,'小睡 1 小時'],[2,'小睡 2 小時']]){ if(d>maxH+1e-6) continue; let to=hh+d, hint='睡到 '+hm(to); if(alarm!=null&&alarm<to){ to=alarm; hint='下一堂 '+hm(nx.t0)+' '+nx.c.name+'前 20 分鐘叫醒你（'+hm(to)+'）'; }
      if(da&&da.h<to){ to=da.h; hint=da.why+'，出發前 30 分鐘叫醒你（'+hm(to)+'）'; }
      { const oa=S.outStopsToday(G,hh)[0]; if(oa&&oa.h<to){ to=oa.h; hint=oa.why+'，出發前 10 分鐘叫醒你（'+hm(to)+'）'; } }
      if(to>hh+0.05&&to<24&&!out.some(o=>Math.abs(o.to-to)<0.02)) out.push({kind:'nap',to,t:lab,hint}); } return out; };
  S.bedOptions=function(G){ if(typeof ECONFF!=='undefined'&&ECONFF.on&&ECONFF.on(G)&&ECONFF.next&&ECONFF.next(G)) return [{t:'睡覺',hint:'到下一件事',kind:'sleep'},{t:'先不睡',kind:'stay'}];   /* 經濟系事件模式：睡覺＝到下一件事（ECONFF.sleepJump），不寫「睡到幾點」「會錯過」（BB-C 10-18 建議；UX-ECON-BED-1018）*/
    if(typeof PG!=='undefined'&&PG.bedOptions){ const pg=PG.bedOptions(G); if(pg) return pg; }   /* 畢業後篇：睡覺＝到下一件事（src/postgrad3d.js）*/
    const out=[]; const hh=h(G), late=G.hour>=24, night=late||hh>=17.5||hh<5;
    if(S.opening(G)){ out.push({kind:'sleep',t:'睡覺',hint:'明天早上醒來'}); out.push({kind:'stay',t:'再撐一下'}); return out; }
    if(!night){ out.push(...S.napOptions(G,2));
      if(hh<17.5){ const ms=S.missText(G,G.day,hh,18), dm=typeof DATE!=='undefined'&&DATE.alarmsFor?DATE.alarmsFor(G,G.day).filter(q=>q.dep>hh&&q.dep<18).map(q=>hm(q.dep)+' '+q.label):[]; const miss=[ms,dm.length?'會錯過：'+dm.join('、'):''].filter(Boolean).join('。'); const oa=S.outStopsToday(G,hh).find(q=>q.h<18), ms2=oa?S.missText(G,G.day,hh,oa.h):''; out.push({kind:'nap',to:18,t:'睡到傍晚（不設鬧鐘）',hint:oa?'18:00——但'+oa.why+'，'+hm(oa.h)+' 會叫醒你'+(ms2?'。'+ms2:''):'睡到 18:00'+(miss?'。'+miss:'')}); } }
    else if(!late&&hh>=17.5&&S.tonightAlarm(G,hh)){ const ta=S.tonightAlarm(G,hh); out.push({kind:'nap',to:ta.h,t:'睡一下（'+hm(ta.h)+' 叫醒你）',hint:ta.why+'，鬧鐘 '+hm(ta.h)+' 會叫醒你'}); }   /* 今天晚上還沒到的約（標 alarm 的出遊、電話、答應了的約）：鬧鐘一定叫醒，不給睡到明天（BUG-BED-TONIGHT-ALARM-1022：3/15 21:00 上床只算明天的鬧鐘，21:30 學姊的電話睡過去就記 missed）*/
    else { const day=G.day+1, its=typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'?CLS.dayItems(G,day).filter(it=>!CLS.storyClass(Object.assign({},G,{day}),it)):[], first=its.length?its[0]:null, A=S.wakeAlarms(G,day);
      const morning=first?Math.max(6.5,first.t0-1):7.5;
      for(const [k,lab,w0,why] of [['morning',morning>=17?'睡到明天晚上':morning>=13?'睡到明天下午':morning>=11?'睡到明天中午':'睡到明天早上',morning,first?(first.exam?'考試 ':'第一堂 ')+hm(first.t0)+' '+first.c.name+'前一小時':'明天沒有課'],['noon','睡到明天中午',12,''],['afternoon','睡到明天下午',14,''],['evening','睡到明天晚上',18,'']]){
        if(k!=='morning'&&w0<=morning+0.05) continue; let w=w0, hint=hm(w)+(why?'（'+why+'）':''); const a=A.find(q=>q.h<w);
        if(a){ w=Math.max(6.5,a.h); hint=hm(w0)+'——但'+a.why+'，鬧鐘 '+hm(w)+' 會叫醒你'; } else { const ms=S.missText(G,day,0,w); if(ms) hint+='。'+ms; }
        if(!out.some(o=>Math.abs(o.wake-w)<0.02)) out.push({kind:'sleep',wake:w,alarm:a?a.why:null,t:lab+(k==='morning'?'（'+hm(w)+'）':''),hint}); } }
    if(typeof HOME!=='undefined'&&HOME.ffOpts&&HOME.ffOpts(G)) out.push({kind:'ff',t:'快轉',hint:'到下一個有事的日子、過三天、過一週'}); else if(typeof SEMFF!=='undefined'&&SEMFF.on(G)) out.push({kind:'semff',t:'快轉',hint:'到下一個有事的時候、過一週；沒有劇情的課自動去上'});   /* 學期中（FF-SEMESTER-1023，使用者 10-23）*/   /* 寒暑假（AA_197 1-2）：快轉是玩家自己選的 */
    out.push({kind:'stay',t:'再撐一下'}); return out; };
  /* 生活費（D48；企劃 AA_72 5b-1：每月 30,000 元，只用在生活——宿舍、學費、手機家裡另外付；每月 1 日匯進帳戶；額外收入只有過年紅包和可選的打工）。
     遊戲畫面沒有日期：第一天是「開學第三週的週三」＝9/17（9/1 週一開學；AA 2026-10-11 09:28Z 確認），只用來算「每月 1 日」；企劃的週曆改了就改 CAL0。
     開局：帳戶約 20,000＋錢包約 2,000（game3d.js defaults 的 money 22000；S.newGame 設 fundsV2）。舊存檔（沒有 fundsV2）：下一個早上補帳戶裡的 20,000 元一次——
     讀檔本身不改錢（tests/save_compat_v7.py 檢查讀檔前後金錢一樣）。睡覺一次只過一天，所以「換月份的第一個早上」就是 1 日。測試：node tests/allowance_unit.js */
  const CAL0={m:9,d:17}, MDAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
  S.dateOf=function(day){ if(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf){ const x=CALENDAR.dateOf(day); return {m:x.m,d:x.d}; } let m=CAL0.m, d=CAL0.d+(day-1); while(d>MDAYS[m-1]){ d-=MDAYS[m-1]; m=m%12+1; } return {m,d}; };   /* 有日曆就照日曆（經濟系大一的負天數也對）*/
  S.monthlyFunds=function(G){ const F=G.flags, mo=S.dateOf(G.day).m; if(F.fundsV2!==1){ F.fundsV2=1; F.allowanceMonth=mo; return {amount:20000,m:mo,text:'帳戶裡還有這個月的生活費：20,000 元'}; }
    if(F.allowanceMonth!==mo){ F.allowanceMonth=mo; if(S.isEcon(G)&&F.Y0_MOVED_OUT) return {amount:5000,m:mo,text:'家裡匯來這個月的生活費：5,000 元'}; return {amount:30000,m:mo,text:'家裡匯來這個月的生活費：30,000 元'}; } return null; };   /* AA_363 S2：經濟系休學搬回家（Y0_MOVED_OUT）以後每月 5,000，從搬回家的下一個月起（匯款在每月 1 日，10/31 搬＝11/1 起）；8/29 搬進法律系宿舍（stage 變 law）以後照舊 30,000；舊存檔不扣回已經匯的錢；重考班、衝刺班的學費本來就沒有從帳戶扣（tests/aa363_s2_unit.js）*/
  /* 快轉一次跨過好幾個月（例：經濟系 6/8 一次跨過 5/1、6/1）：入帳照月加，提示合成一則寫總數（BB 10-21：一次進 10,000、提示只寫 5,000——原本 mo 只留最後一個月）*/
  S.fundsJoin=function(a,f){ if(!f) return a; if(!a) return Object.assign({ms:[f.m]},f); const ms=a.ms.concat([f.m]), amount=a.amount+f.amount; return {amount,m:f.m,ms,text:'家裡匯來 '+ms.join('、')+' 月的生活費：'+amount.toLocaleString('en-US')+' 元'}; };
  S.sleepNow=(GM,wake,alarm)=>sleepNow(GM,wake,alarm);   /* 測試用（tests/bed_nap_unit.js）*/
  /* 經濟系那一年的固定核心出遊（AA_154 A33③：E14，之後 E19）：當天出發前就去睡覺＝電話把你吵醒——睡到「開始後 15 分鐘」那一刻，不跳到隔天（AA-B 2026-10-16 抽查）*/
  const CORE_OUT=['y0_e14','y0_e26','y0_e27','y0_e27b','y0_e37'];   /* y0_e26＝10/17 車上＋摩天輪（AA_224 1-3）；E19 拿掉 */
  S.E37_CALL='你在哪？行李我都搬到樓下了。';   /* AA_307 第 4 列（8/30 你開車載她搬宿舍）*/   /* AA_206 2-4（M19；和 E26 電話同一個模板）*/
  S.e37LawPending=G=>{ const d29=S.dayOfKey('2025-08-29'); return S.e37LawOn(G)&&d29!=null&&G.day<=d29+1&&!(typeof PHONE!=='undefined'&&PHONE.sent(G,'y0_e37_law_ask'))&&!(G.events&&G.events.done&&G.events.done.ev_y0_e37); };   /* 8/29 21:30 那兩則還沒來（sleepNow 先不演舊的「第一則訊息」：AA-C 17:53 選 ①）*/
  S.e37LawOn=G=>{ const F=(G&&G.flags)||{}; return !F.PLAYED_Y0&&!!F.dating_kexin&&(G.stage||'law')==='law'&&S.week1Start(G); };   /* X81：從法律系開局、和可昕交往（AA_303「法律系開局的 8/30」）*/
  S.e37Dorm=G=>{ const F=(G&&G.flags)||{}; return !!F.E37_LAW||(!!G&&(G.stage||'law')==='law'&&!(typeof HOME!=='undefined'&&HOME.livesHome&&HOME.livesHome(G))); };   /* AA_368 M8（企劃線 e55fda50）：8/30 住在宿舍的人（法律系開局 E37_LAW；經濟系路線 8/29 已經轉法律系、搬進宿舍）——E37 結尾「（你把車開回家，再搭捷運回宿舍。）」＋多 1 小時；原本只給法律系開局。?start0 的經濟系 8/31 才轉＝8/30 還住家裡，不算 */
  S.e37CallDue=function(G){ if(!(S.isEcon(G)||(G.flags&&G.flags.PLAYED_Y0)||S.e37LawOn(G))||typeof OUT==='undefined'||(G.events&&G.events.done&&G.events.done.ev_y0_e37)) return false; const q=OUT.get(G,'y0_e37'), d=S.dayOfKey('2025-08-30'); return !!q&&q.state!=='done'&&d!=null&&(G.day>d||(G.day===d&&G.hour>=14.25))&&G.day<=d+1; };
  /* 在臺北的家（休學後）時的固定核心電話：home3d.js 的選單每一輪先問這裡；有＝電話一句 → 直接進出遊（從家裡出發）*/
  /* 沒出發的保底電話（AA_272 第 6 節，BB_214 第 1、2 點：在家吃晚餐、讀書會錯過 E27、E14）：開始 15 分鐘後還沒出發＝電話兩句 → 直接出遊 */
  S.CORE_CALLS=[{id:'y0_e27b',ev:'ev_y0_e27b',who:'可昕（電話）',lines:['我在補習班樓下了。你呢？']},{id:'y0_e27',ev:'ev_y0_e27',who:'可昕（電話）',lines:['人呢？','我在行政大樓門口了。……你說要陪我的。']},{id:'y0_e14',ev:'ev_y0_e14',who:'韋綸（電話）',lines:['人咧！！保齡球館！！','第一局要開了啦，走啦！']}];
  S.coreCallDue=function(G){ if(typeof OUT==='undefined') return null; for(const c of S.CORE_CALLS){ const q=OUT.get(G,c.id); if(!q||q.state!=='planned'||(G.events&&G.events.done&&G.events.done[c.ev])) continue; const t=q.day*24+q.h+0.25, now=G.day*24+G.hour; if(now>=t&&now<t+1) return Object.assign({q},c); } return null; };
  S.homeCall=function(G){ if(S.campCallDue(G)) return {q:OUT.get(G,'y1_camp')}; if(S.e37CallDue(G)) return {q:OUT.get(G,'y0_e37'),who:'可昕（電話）',line:S.E37_CALL}; const c=S.coreCallDue(G); if(c) return {q:c.q,who:c.who,line:c.lines[0],line2:c.lines[1]}; return null; };   /* 宿營：沒有人打電話，直接出發（line 空）*/
  /* T2 唐睿的練習（AA_154 第 127 行）：每次經原下課擲一次 50%（同一天只擲一次，記在 T2_DAY／T2_HIT）；E18 演過就不再觸發 */
  S.T2_P=0.5;
  S.t2Due=function(G){ if(!S.isEcon(G)) return false; const F=G.flags; if(G.events&&G.events.done&&G.events.done.ev_y0_e18) return false; if(F.T2_DAY!==G.day){ F.T2_DAY=G.day; F.T2_HIT=Math.random()<S.T2_P; } return !!F.T2_HIT; };
  /* 重考期的起床選單（AA_154 A39）：3/28（休學後第一天）～7/10（考試前一天）每天醒來：「去博雅，和可昕讀書」＝讀書日／「今天出去走走」＝玩樂日／「先起床再說」＝自由。
     3/28（R1）、4/2（R5）是讀書日的事件，那天只有前後兩項。從臺北的家出發（3/29 以後）前兩項含捷運＋公車約 30 分鐘。G.flags.RT_DAY＝{day,type}。
     讀書日：到博雅（自習區的小桌子，E29「同一張桌子」），在博雅讀滿兩小時才算（STORY.onStudy：habit retake:study，一天一次）；在家讀書兩小時也算（home3d.js）。
     玩樂日：和可昕出門（R3、R6 的出遊；沒有 R 的日子是 P1～P6 旁白輪流），habit retake:play。R 系列已接（AA-B 4380b0eb＋AA_154 A39／A45，tests/v0_retake_r_unit.js）*/
  S.RT_FIXED=['2025-02-15','2025-04-02'];   /* AA_224 6-1：R1 從 3/28 提前到 2/15（她 2/13 休學、「後天」開始同一張桌子）*/
  S.retakeOn=G=>{ if(!S.isEcon(G)) return false; const a=S.dayOfKey('2025-02-15'), b=S.dayOfKey('2025-07-10'); return a!=null&&b!=null&&G.day>=a&&G.day<=b; };
  S.retakeType=G=>{ const r=G.flags&&G.flags.RT_DAY; return r&&r.day===G.day?r.type:null; };
  S.retakeWake=async function(GM){ const G=GM.G, F=G.flags; if(!S.retakeOn(G)||S.retakeType(G)) return false; const home=typeof HOME!=='undefined'&&HOME.at&&HOME.at(G);
    const fixed=S.RT_FIXED.map(k=>S.dayOfKey(k)).includes(G.day), via=home?'捷運＋公車 約 30 分鐘':'走路';
    const O=[{t:home?'在家讀書（可昕會來）':'回家讀書（可昕會來）',hint:home?'餐桌':via,k:'study'}]; if(!fixed) O.push({t:'今天出去走走',hint:'和可昕出門',k:'play'}); O.push({t:'先起床再說',k:'free'});   /* AA_224 6-2：讀書的地方＝祐廷家的餐桌 */
    let k='free'; GM.sceneBegin(); try{ const i=await GM.choose(O); k=(O[i]||O[O.length-1]).k; } finally { GM.sceneEnd(); }
    F.RT_DAY={day:G.day,type:k}; if(k==='play') S.rtPlanPlay(G);
    if(k==='study'&&!home&&typeof HOME!=='undefined'&&HOME.go){ await HOME.go(GM); return 'left'; }   /* 不在家（舊流程）＝先回家 */
    return k; };
  /* R 系列（BB_112 第 4 節＋4-1 AB-38 台詞，BB-B 4380b0eb；AA_154 A39／A45）
     兩個人都休學、沒有課（AA_224 第 6 組）：讀書日她 10:00 到祐廷家的餐桌；不去重考班，考前一個月他報另一間的衝刺班。
     讀書日：她第一次到博雅小桌＝R1（3/28）／R5（4/2）／R2（第 8 週第一個讀書日）／其他日子一句輪流（S1～S5）。R1 沒演到＝「我發現我喜歡吵贏……」移到下一次。
     玩樂日：她下課以後一起出門（2D 出遊）＝R3（3/30～4/1）／R6（第 12 週）／其他日子旁白一句輪流（P1～P6）；habit retake:play。
     R4（4/19 16:00 總圖外台階，3D）、R7（5/24 14:00 保齡球館，前一晚阿勳在群組問）照日期。沒遇到的照片、私訊在 phoneRules */
  /* S.kxFreeAt（照可昕的經濟系課表算她幾點到）拿掉：她 2025-02 休學、沒有課了（AA_224 6-1）；讀書日她 10:00 到祐廷家 */
  S.KX_ARRIVE=10;
  S.cramNight=function(G,day){ day=day==null?G.day:day; if(!S.isEcon(G)||typeof CALENDAR==='undefined') return false; const a=S.dayOfKey('2025-06-09'), b=S.dayOfKey('2025-07-09'); if(a==null||b==null||day<a||day>b) return false; return true; };   /* 衝刺班的日子（AA_298 第 1 節：6/9～7/9 每天 09:00～21:00；取代 AA_224 6-4 的一三五晚上）*/
  const DD=k=>S.dayOfKey(k), inR=(G,a,b)=>{ const x=DD(a), y=DD(b); return x!=null&&y!=null&&G.day>=x&&G.day<=y; }, rdone=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  S.rStudyKind=function(G){ if(G.day===DD('2025-02-15')) return 'r1'; if(G.day===DD('2025-04-02')) return 'r5'; if(inR(G,'2025-04-07','2025-04-13')&&!rdone(G,'ev_y0_r2')) return 'r2'; return 's'; };
  S.rArrived=G=>S.retakeOn(G)&&S.retakeType(G)==='study'&&typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G)&&G.hour>=S.KX_ARRIVE&&!(G.flags.RT_KX===G.day);   /* 讀書日：她到他家的餐桌（在家的選單那一輪演）*/
  S.RS=[{t:['「你又比我早起。……今天早餐我請。」']},{t:['（她放下包包）','「你讀到哪了？……三章？我才讀到第二章。」']},   /* AA_224 6-2：S1、S2 改（她不去上課了）*/
        {t:['「你的螢光筆快沒水了。你今天到底畫了多少？」']},{t:['「我帶了兩杯飲料。你那杯是賄賂：等一下讓我先問問題。」']},{t:['「你一直坐在這裡，會不會忘記外面有太陽？……好啦，我坐下了。」']}];
  S.RP=[['2025-02-15','2025-07-10','（你們在公館的二輪戲院看了一部老電影。片尾字幕跑完以前，她不准你站起來。）'],['2025-03-28','2025-05-15','（你們在溫州街的巷子裡亂走。她每經過一隻貓，就停下來打一次招呼。）'],
        ['2025-04-01','2025-05-31','（你們坐在醉月湖邊吃雞蛋糕。她說湖裡的魚看起來也在準備考試。）'],['2025-04-01','2025-06-30','（你們搭捷運到淡水看海。回程的車上她睡著了，頭一直往你這邊倒。）'],
        ['2025-05-15','2025-06-30','（下了一整天的雨。你們躲在公館的咖啡店，她用吸管的紙套折了一隻青蛙給你。）'],['2025-06-01','2025-07-10','（熱到柏油路都在發亮。你們分一碗芒果冰，最大塊的芒果她推到你那邊。）']];
  /* 輪流：取第一句「還沒用過、今天可以用」的；都用過就從頭（只算今天可以用的）*/
  const rot=(used,n,ok)=>{ used=Array.isArray(used)?used:[]; for(let i=0;i<n;i++) if(ok(i)&&!used.includes(i)) return i; for(let i=0;i<n;i++) if(ok(i)) return i; return -1; };
  S.rsPick=G=>rot(G.flags.RS_USED,S.RS.length,i=>!S.RS[i].ok||S.RS[i].ok(G));
  S.rpPick=G=>rot(G.flags.RP_USED,S.RP.length,i=>inR(G,S.RP[i][0],S.RP[i][1]));
  S.rUse=(G,key,i)=>{ let u=Array.isArray(G.flags[key])?G.flags[key]:[]; const n=key==='RS_USED'?S.RS.length:S.RP.length; if(u.includes(i)) u=[]; u.push(i); if(u.length>=n) u=[]; G.flags[key]=u; };
  S.rPlayEv=function(G){ if(inR(G,'2025-03-30','2025-04-01')&&!rdone(G,'ev_y0_r3')) return ['ev_y0_r3','大安森林公園']; if(inR(G,'2025-05-05','2025-05-10')&&!rdone(G,'ev_y0_r6')&&!G.flags.R6_MISSED) return ['ev_y0_r6','河濱'];   /* 第 12 週的第一個玩樂日，最晚 5/10（六）*/ return ['ev_y0_rp','和可昕出門']; };
  S.rtPlanPlay=function(G){ if(typeof OUT==='undefined') return; const id='rt_play_'+G.day; if(OUT.get(G,id)) return; const [ev,place]=S.rPlayEv(G), h=Math.max(S.KX_ARRIVE,Math.ceil(G.hour*4)/4);
    OUT.plan(G,{id,ev,day:G.day,h,late:0.75,place,title:'和可昕出門 '+hm(h),travel:'走過去',travelH:1/6}); };
  S.onStudy=function(GM,hrs){ const G=GM.G; S.mootTogetherCheck(G,'study'); if(!S.retakeOn(G)||G.zone!=='boya'||hrs<2) return; if(typeof EVENTS!=='undefined'&&EVENTS.habit) EVENTS.habit('retake:study'); };
  /* P2b 門口有人在揪（AA_154 2-5a；事件 ev_y0_p2b）：P2 演過（P2_PICK）以後；AA_272 第 13 節改成第 6～7 週的週一經濟學原理下課（10/7、10/14），兩次都揪（原本第 6～16 週週四會計下課、擲 40%：10/10 國慶、10/17 休學，一次都不會觸發）；
     同一週最多一次（P2B_SEEN）；那天已經約了別的出遊（OUT 排定、邀約答應）不揪。
     P2B_END：跟去的結束時間（food 19:30、river 17:00、night 21:00／21:30）。 */
  S.P2B_P=0.4; S.P2B_END=[19.5,17,21,21.5,21.5];
  S.bikeDay=()=>termDay('Y0S1',10,4);   /* 韋綸的腳踏車（AA_154 2-5b）：固定在 11/7（四，W10）17:30 群組版（P2b 只到 10/17 以前，現場版不會再演；p2bBikeNow 留給舊存檔）*/
  S.p2bBikeNow=G=>G.day===S.bikeDay()&&!(G.flags||{}).WL_BIKE_SEEN;
  S.Y0_LEAVE_DAY='2024-10-17';   /* 祐廷辦休學那天（AA_218 第 9～11 節【裁定】：休學＝交往＝摩天輪，同一天）*/
  S.Y0_MOVE_DAY='2024-10-31';   /* A3 退宿（四；AA_305 第 7 節：宿舍住到月底，原本 10/19）*/
  S.KX_ANNIV_DAY='2025-10-17';   /* K7 第一年的交往週年（AA_224 第 2 組：每年 10/17）*/
  S.KX_ANNIV_DAYS=[null,'2025-10-17','2026-10-17','2027-10-17','2028-10-17','2029-10-17','2030-10-17'];   /* 第 n 年（AA_224 2-c）；第五年（AA_357 3-2，畢業後篇，不分延畢）；第六年（AA_472 第 3 節，交換延畢也一樣）*/
  /* 第六年（AA_472 第 3 節，企劃線 1ebcf530e）：交往中、第五年有演到的（KX_ANNIV[5] 是地點，不是 missed／video）；地點照第五年；卡片在祐廷手上（ev_kexin_anniversary_yn 的 y6）*/
  S.kxAnniv6On=G=>{ const F=(G&&G.flags)||{}, A=F.KX_ANNIV&&F.KX_ANNIV[5]; return !!F.dating_kexin&&!!A&&A!=='missed'&&A!=='video'; };
  S.kxAnniv6Place=G=>{ const F=G.flags||{}; for(const p of [F.KX_ANNIV_PLACE_6,F.KX_ANNIV_PLACE_5,F.KX_ANNIV&&F.KX_ANNIV[5]]) if(p&&KX_ANNIV_PLACE[p]) return p; return 'shop'; };
  /* 畢業後篇跳到下一件事的停點（postgrad3d.js S.stops）：第六年還沒排的時候——10/10 21:00 她的私訊還沒傳＝停在 21:00（長跳每 6 小時看一次會晚到 23:00）；
     私訊傳了、出遊還沒排（例：那一則被別的方式略過）＝停在那天該問「出發」的時間（長跳會跳過 18:30）*/
  S.kxAnniv6Stop=function(G){ const F=(G&&G.flags)||{}, an=S.dayOfKey(S.KX_ANNIV_DAYS[6]), now=G.day*24+(+G.hour||0); if(an==null||!S.kxAnniv6On(G)||(F.KX_ANNIV&&F.KX_ANNIV[6])) return null;
    if(typeof PHONE!=='undefined'&&!PHONE.sent(G,'kx_anniv_ask6')){ const t=(an-7)*24+21; if(t>now) return t; }
    if(typeof OUT!=='undefined'&&OUT.get(G,'kx_anniv6')) return null;
    const P=KX_ANNIV_PLACE[S.kxAnniv6Place(G)]||KX_ANNIV_PLACE.shop, tr=typeof OUT!=='undefined'&&OUT.trip?OUT.trip(G,{travelH:P[3],travel:P[2]}):{travelH:P[3]}, t=an*24+18.5-(+tr.travelH||0)-0.25;   /* 同 OUT.due（人在家＝至少 30 分鐘）*/
    return t>now?t:null; };
  /* 週年的地點（第一年的三個選項與她的回覆；第三、四年照用，AA_224 2-c）：key＝記在哪個旗標 */
  /* 週年沒去（沒選地點、沒出發；AA_313 第 2 節第 10、36 列＋2-3 A）：當天 21:00 她打來（ev_kexin_anniv_missed_call；21:45 以後才發現的就不打）；
     原本當晚的照片「週年快樂。下次你準備。」改到隔天中午（AA：當作她自己消了一點）。tag 照舊（第一年 kx_anniv_photo、第 n 年 kx_anniv_photo＋n）*/
  S.kxAnnivMissed=function(G,n,day){ const tag=n===1?'kx_anniv_photo':'kx_anniv_photo'+n, K=t=>({th:'p:kexin',from:'kexin',text:t});
    if(n===6){ if(typeof PHONE!=='undefined') PHONE.at(G,day,22,[K('卡片你留著。……明年一起給我。')],'kx_anniv_miss6'); return; }   /* AA_472 第 3 節：第六年卡片在祐廷手上——沒有 21:00 的電話（電話裡「卡片我寫好了。我自己帶回去。」對不上）、沒有隔天卡片的照片，改成她 22:00 私訊一句 */
    if(typeof OUT!=='undefined'&&!OUT.get(G,'kx_anniv_call'+n)&&G.day*24+G.hour<day*24+21.75) OUT.plan(G,{id:'kx_anniv_call'+n,ev:'ev_kexin_anniv_missed_call',day,h:21,place:'電話',title:'可昕打電話來',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'電話掛了。'});
    if(typeof PHONE!=='undefined') PHONE.at(G,day+1,12,[K('📷（一張卡片）'),K('週年快樂。下次你準備。')],tag); };
  /* 答應去高雄跨年卻沒出發（AA_313 第 2 節第 15、37 列，2-3 B）：00:05 她打來（ev_kexin_nye_missed_call）；y＝第幾年、nye＝12/31 那一天 */
  S.kxNyeMissedCall=function(G,y,nye){ if(typeof OUT==='undefined'||OUT.get(G,'kx_nye_call_y'+y)||G.day*24+G.hour>=(nye+1)*24+5/60+0.75) return;
    OUT.plan(G,{id:'kx_nye_call_y'+y,ev:'ev_kexin_nye_missed_call',day:nye+1,h:5/60,place:'電話',title:'可昕打電話來',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'電話掛了。'}); };
  const KX_ANNIV_PLACE={wheel:['摩天輪','週年：摩天輪','開車約 40 分鐘',2/3],shop:['政大・山下的小吃街','週年：政大山下，我們的店','開車約 30 分鐘',0.5],river:['河堤','週年：河堤','騎車約 15 分鐘',0.25]};
  function kxAnnivPlaceOpts(F,K,key){ return [{t:'摩天輪。',set:{[key]:'wheel'},say:[K('……回到最高點。好。')]},{t:'政大山下，我們的店。',set:{[key]:'shop'},say:[K('老闆會以為今天很普通。我們不要告訴他。')]},
    {t:'河堤。',set:{[key]:'river'},say:[K(F.KX_NYE&&F.KX_NYE[1]==='river'?'好。這次不看煙火，看河。':'好。河堤晚上風大，穿外套。')]}/* AA_209 附錄B §2：跨年去河堤的（KX_NYE[1]==='river'）照舊，其他玩家換這句 */]; }
  /* 第四年他在美國（那一天在國外）＝視訊 */
  S.kxAnnivVideo=function(G,n){ const an=S.dayOfKey(S.KX_ANNIV_DAYS[n]); return n===4&&an!=null&&S.routeAbroadRoute(G)==='US'&&S.abroad(Object.assign({},G,{day:an})); };
  /* 第二～四年選準備的東西的時候（前一晚 21:00 起、當天 18:30 前；地點定了、還沒選、不是視訊）：回傳第幾年（沒有＝0）；eve＝true 時只在前一晚成立（「明天是週年」那一句）*/
  S.kxAnnivGiftYear=function(G,eve){ const F=G.flags||{}; if(!F.dating_kexin) return 0; for(const n of [2,3,4,5,6]){ const an=S.dayOfKey(S.KX_ANNIV_DAYS[n]); if(an==null||!F['KX_ANNIV_PLACE_'+n]||F['K7_GIFT_'+n]!=null||S.kxAnnivVideo(G,n)) continue;
      const night=G.day===an-1&&G.hour>=21, day=G.day===an&&G.hour<18.5; if(eve?night:(night||day)) return n; } return 0; };
  /* LIFE-LINE 的舊存檔（BB_188 A9-2 @d171faef；讀檔時 game3d migrate 呼叫，一次）：
     ① KX_CAR：舊的 E25_ANSWER（only_me→only_me、first_day→camp、new_year→take_back）；沒有 E25 看 E21_ANSWER（yes／serious→only_me、joke→take_back）；
        再沒有看 E19_ASK（direct→camp、joke→take_back、none→only_me）；都沒有＝only_me。舊旗標只在這裡讀一次。
     ② 存檔的日子已經過了 10/17 的車上（17:40）但新的那一段沒演：當作演過（dating_kexin、Y0_DATING、KX_DATING_SINCE；不補演，避免十二月突然看到十月的事）。
     ③ 一定會發生的那幾件（12/13 以前的補習班、2/13 水餃店）存檔已經過了那天還沒演：當作演過、記它們的旗標（CRAM_FREE_KNOWN、RETAKE_TOGETHER）。
     存檔在 10/17 以前的照新流程走。只看經濟系那一年（stage econ）或玩過那一年的法律系存檔（PLAYED_Y0）*/
  S.LIFE_FIXED=[{ev:'ev_y0_cram',key:'2024-12-13',h:24,set:{CRAM_FREE_KNOWN:true}},{ev:'ev_y0_e27',key:'2025-02-13',h:24,set:{RETAKE_TOGETHER:true}}];   /* h:24＝那一天整天過完才算錯過 */
  S.lifeLineMigrate=function(s){ const F=s&&s.flags; if(!F||typeof F!=='object'||F.LIFELINE_V) return false; F.LIFELINE_V=1; if(s.stage!=='econ'&&!F.PLAYED_Y0) return false;
    const past=(k,h)=>{ const d=S.dayOfKey(k); return d!=null&&(s.day>d||(s.day===d&&(s.hour||0)>=h)); }, ev=s.events||(s.events={done:{},last:{},count:0}), done=ev.done||(ev.done={});
    const E25={only_me:'only_me',first_day:'camp',new_year:'take_back'}, E21={yes:'only_me',serious:'only_me',joke:'take_back'}, E19={direct:'camp',joke:'take_back',none:'only_me'};
    const car=E25[F.E25_ANSWER]||E21[F.E21_ANSWER]||E19[F.E19_ASK]||null;
    if(past(S.Y0_LEAVE_DAY,17+40/60)&&!(done.ev_y0_e26&&F.KX_CAR)){ if(!F.KX_CAR) F.KX_CAR=car||'only_me'; done.ev_y0_e26=done.ev_y0_e26||s.day; Object.assign(F,{Y0_DATING:true,KX_DATING_SINCE:'2024-10-17'}); if(s.stage==='econ'||F.PLAYED_Y0) F.dating_kexin=F.EX_kexin?F.dating_kexin:true;
      if(Array.isArray(s.outings)) for(const q of s.outings) if(q.id==='y0_e26'&&q.state!=='done') q.state='done'; }
    else if(car&&!F.KX_CAR) F.KX_CAR=car;
    for(const x of S.LIFE_FIXED) if(past(x.key,x.h)&&!done[x.ev]&&!Object.keys(x.set).every(k=>F[k])){ done[x.ev]=s.day; Object.assign(F,x.set); }   /* 旗標已經有（例：在家演的 ev_y0_cram_h）＝演過 */
    return true; };
  /* AA_529 第 2 節（第①級）：「走啦」群組在 30 分鐘版建不起來（只有 P2、P2b 會建，兩件都剪了）＝AA_440 經濟系暑假的群組訊息和 7/19、8/18 兩頓飯、AA_521 法律系那三年的五則一般玩家都收不到。
     ① 10/15 聚會（ev_y0_gather，KEEP）演完、回家的路上（events.js 那一場最後的 call）：韋綸建立群組、系統一則（照原本 P2 的字）＋三則，時間＝聚會演完那一刻（h）；
        已經在群組裡的（長版 P2、P2b 演過）照原本：不重複建、不出那句旁白（回 false）。
     ② 舊存檔（讀檔時，game3d.js migrate）：玩過經濟系（PLAYED_Y0）、已經在法律系、沒有這個群組的＝加進群組，只有一則系統訊息（不補以前的訊息）；
        還在經濟系那一年、10/15 聚會演過、沒有群組的也一樣（Y0_ZOULA 記 'load'）*/
  S.ZOULA_SYS='韋綸建立了群組「走啦」，把你加了進來。';
  S.zoulaGather=function(G,h){ if(typeof PHONE==='undefined'||!G||PHONE.inGroup(G,'econ_friends')) return false; PHONE.join(G,'econ_friends','走啦'); const T='g:econ_friends';
    PHONE.at(G,G.day,h!=null?h:G.hour,[{th:T,text:S.ZOULA_SYS},{th:T,from:'econ_weilun',name:'韋綸',text:'以後吃飯在這裡揪！'},{th:T,from:'econ_pinyu',name:'品妤',text:'名字誰取的。'},{th:T,from:'econ_weilun',name:'韋綸',text:'我！……還沒想好，先這樣。'}],'econ_friends_new');
    (G.flags=G.flags||{}).Y0_ZOULA='gather'; return true; };
  S.zoulaMigrate=function(s){ const F=s&&s.flags; if(!F||typeof F!=='object'||typeof PHONE==='undefined') return false; const done=(s.events&&s.events.done)||{};
    const law=(s.stage||'law')!=='econ'&&!!F.PLAYED_Y0, econ=s.stage==='econ'&&!!done.ev_y0_gather; if(!law&&!econ) return false; if(PHONE.inGroup(s,'econ_friends')) return false;
    PHONE.join(s,'econ_friends','走啦'); if(!PHONE.sent(s,'econ_friends_new')) PHONE.post(s,{th:'g:econ_friends',text:S.ZOULA_SYS,tag:'econ_friends_new'}); F.Y0_ZOULA='load'; return true; };
  S.P2B_CUT=S.Y0_LEAVE_DAY;   /* P2b 只到休學那天以前（AA_218 第 11 節、AA_154 0b-2：10/17 以後的 P2b 和所有「會計下課」觸發刪除）：11/7 的腳踏車只剩群組版 */
  S.p2bDue=function(G){ if(!S.isEcon(G)||typeof CALENDAR==='undefined') return false; const F=G.flags||{}; if(!F.P2_PICK) return false; const t=CALENDAR.termOf(G.day); if(!t||t.exam) return false;
    const cut=S.dayOfKey(S.P2B_CUT); if(cut!=null&&G.day>=cut) return false;
    if(!(t.id==='Y0S1'&&t.week>=6&&t.week<=7)) return false;   /* AA_272 第 13 節：經濟學原理下課，第 6～7 週（10/7、10/14），兩次都揪 */
    if(typeof OUT!=='undefined'&&OUT.rec(G).some(q=>q.day===G.day&&q.state==='planned')) return false;
    if(Array.isArray(G.invites)&&G.invites.some(v=>v.day===G.day&&(v.state==='accepted'||v.state==='going'))) return false;
    const wk=t.id+':'+t.week; if(F.P2B_WK!==wk){ F.P2B_WK=wk; F.P2B_HIT=true; F.P2B_SEEN=false; } return !!F.P2B_HIT&&!F.P2B_SEEN; };
  S.p2bSeen=G=>{ const F=G.flags, t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(t) F.P2B_WK=t.id+':'+t.week; F.P2B_SEEN=true; };   /* 這一週揪過了（不管跟不跟）*/
  const postMid=G=>{ const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return !!t&&((t.id==='Y0S1'&&t.week>=10)||t.id==='Y0S2'); };
  /* river 的順序：11/7 固定是韋綸的腳踏車（事件先接 bike）；Y0S1 其他的 river 第一次＝L5b（11/7 之前沒演到就留到下一次）；腳踏車演過以後的 river 散場接 E13③ */
  S.p2bL5b=G=>{ const F=G.flags, t=CALENDAR.termOf(G.day); return F.P2B_K===1&&!F.L5B_DONE&&!!t&&t.id==='Y0S1'; };
  S.p2bE13=G=>{ return false;   /* E13「大家走了以後」retired（AA-C 2026-10-17 07:28 Q1：10/17 就交往了，這個功能由交往後的日常承擔、不另找觸發；讀 E13 旗標的照沒發生處理）。下面是舊的判斷，留著對照 */ const F=G.flags, k=F.P2B_K; if(!postMid(G)) return false; if(k===0) return !F.E13_FOOD; if(k===1) return !!F.WL_BIKE_SEEN&&!F.E13_RIVER; return k>=2&&!F.E13_NIGHT; };
  /* 經濟系大一上最後一場期末考（AA_154 A34：E22b 在那一場考完的下午、E19 同一天 19:00）：照遊戲實際的課表（CLS.lastExamEnd），課表改了就跟著變。
     算一次要掃整學期，結果依「同一個 G、同一組修的課」記住。e22bFrom：考完 20 分鐘（上午考完＝13:30）*/
  const FE_CACHE=new WeakMap();
  S.y0FinalEnd=function(G){ if(typeof CLS==='undefined'||!CLS.lastExamEnd||!CLS.termCourses) return null; const key=CLS.termCourses(G,'Y0S1').map(c=>c.id).join(','); const c=FE_CACHE.get(G);
    if(c&&c.key===key) return c.v; let v=null; try{ v=CLS.lastExamEnd(G,'Y0S1','final'); }catch(e){ v=null; } FE_CACHE.set(G,{key,v}); return v; };
  S.e22bFrom=fe=>fe.h<12?13.5:fe.h+20/60;
  /* E05「要我載妳嗎？」那天（9/20 週五，17:00～19:30 自動演）：演完以前不能回家（BB_214 第 2 節：週五 17:00 就回家的玩家永遠沒有 E05、E06、D2）。home3d.js canGo 讀 */
  S.homeHold=function(G){ if(!S.isEcon(G)||!G.flags||G.flags.E05_DAY!=null) return null; const e=STORY_EVENTS.find(x=>x.id==='ev_y0_e05'); if(!e||(G.events&&G.events.done&&G.events.done.ev_y0_e05)) return null;
    const d=S.termDay('Y0S1',3,5); return d!=null&&G.day===d&&G.hour<19.5?'e05':null; };
  S.coreCallAt=function(G){ if(!S.isEcon(G)||typeof OUT==='undefined') return null; { const q=OUT.get(G,'y1_camp'); if(q&&q.state!=='done'&&q.day===G.day&&G.hour<8&&!(G.flags||{}).CAMP_Y1) return 8; }   /* 宿營那天睡著：08:00 醒來直接出發（AA_205 2-3）*/ for(const id of CORE_OUT){ const q=OUT.get(G,id); if(q&&q.state!=='done'&&q.day===G.day){ const t=q.h+(q.late!=null?q.late:0.75); if(G.hour<t) return t; } }
    { const d=S.dayOfKey('2024-12-12'); if(d!=null&&G.day===d&&G.hour<22&&G.flags.dating_kexin&&!G.flags.KX_FIGHT_1212) return 22; }   /* AA_224 4-1：12/12 22:00 的電話，睡著也會接到 */
    { const d=S.dayOfKey('2025-01-28'); if(d!=null&&G.day===d&&G.hour<22&&!G.flags.E21_CALLED) return 22; }   /* E21 除夕 22:00 的電話 */
    const d35=S.dayOfKey('2025-07-10'); if(d35!=null&&G.day===d35&&!G.flags.E35_DONE&&G.hour<21) return 21;   /* E35（AA_224 6-5、AA_272 第 10 節）：睡著＝21:00 醒來，她在樓下 */
    { const d=S.dayOfKey('2025-07-25'); if(d!=null&&G.day===d&&G.flags.KH_DAY==='home'&&!G.flags.KH_CALL_DONE&&G.hour<21) return 21; }   /* 7/25 在家版的電話（AA_272 第 12 節）：睡著＝21:00 手機響 */
    const d36=S.dayOfKey('2025-08-13'); if(d36!=null&&G.day===d36&&!G.flags.E36_RESULT&&G.hour<10) return 10;   /* E36 放榜：睡著也在 10:00 醒來看榜單 */
    if(d36!=null&&G.day===d36&&G.flags.E36_ASKED&&!(G.events&&G.events.done&&(G.events.done.ev_y0_e36||G.events.done.ev_y0_e36h))&&G.hour<20) return 20;   /* E36 電話（AA_272 4-4）：睡著＝20:00 手機響 */
    return null; };
  S.E35_AT={x:-91,z:55.6};
  S.E36_AT={x:-23.6,z:-12};   /* E36 可昕在椰林大道的長椅（-25,-13）旁邊（BB_104 8-11「她坐在路邊的椅子上」）*/   /* E35 可昕站的地方：大一女舍門口長椅（-93,54.2）的東邊（AA_154 A41 ①：D1、D2、E13 用的同一個地方）*/
  /* 睡覺的整段：S._sleeping＝S.tick 不開新的事件（醒來的字卡、換房間之間沒有劇情鎖）；結束（包括中途 return）才放開 */
  async function sleepNow(GM,wake,alarm){
    if(typeof ECONFF!=='undefined'&&ECONFF.sleepJump&&await ECONFF.sleepJump(GM)) return;   /* 經濟系事件接事件：睡覺＝到下一個事件（不能睡過去）*/
    if(typeof PG!=='undefined'&&PG.sleepJump&&await PG.sleepJump(GM)) return;   /* 畢業後篇：睡覺＝到下一件事；6/1 晚上不會睡過 6/2 的典禮（src/postgrad3d.js）*/
    S._sleeping=true; try{ return await sleepBody(GM,wake,alarm); } finally { S._sleeping=false; } }   /* 兩種「睡覺＝到下一件事」自己管劇情鎖，照舊；一般的睡覺才鎖 */
  async function sleepBody(GM,wake,alarm){ const G=GM.G, F=G.flags, E=GM.E; const bedSc=S.sleepSceneOf(GM);   /* 在宿舍房間睡著（有 sleep_scene）＝在床上醒來、爬下來（DORM-SLEEP-1030）*/
    /* E24c 的睡前邊界（3/13 頂樓）拿掉：E24c 改成 2/13 23:00 阿勳的私訊（AA_224 5-2）*/
    { const cw=S.coreCallAt(G), lw=cw==null?S.lawWakeAt(G):null; if(cw!=null||lw!=null){ GM.sceneBegin(); try{ await GM.fade(true); await GM.sleep(300); GM.advance((cw!=null?cw:lw)-G.hour); await GM.fade(false); if(S._bed&&!S._bedBusy&&E.player&&E.player.pose==='lie'&&E.zone===S._bed.zone) await getUp(GM,S._bed.sc); } finally { GM.sceneEnd(); }   /* 躺在床上被叫醒：開燈、爬下來（DORM-SLEEP-1030）*/ if(cw!=null&&GM.toast) GM.toast('手機響了。',2400); if(cw==null) S._resume={day:G.day,zone:G.zone}; resumeT=0; return; } }   /* lw：法律系那幾年睡著也會醒來的時間（1A-04 10/24 21:00、21:30；1A-05 11/17 22:00）*/
    GM.sceneBegin(); await GM.fade(true); await GM.sleep(400); if(!S.opening(G)){ try{ await nightEvent(GM); }catch(e){ console.warn('nightEvent',e); } }   /* 睡著之後、天亮之前（trigger 'sleep'）*/ if(G.hour>=25) (G.daily||(G.daily={})).lateNight=G.day+1;   /* 01:00 以後才睡：隔天是「累」的一天（明軒那句；AA-B 10-16）*/ G.day++; G.weekday=(G.weekday+1)%7;   /* DL-02：睡覺不再補體力（前一晚打電動的「隔天精力 −10」也不用了）*/ G.weather=(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(G.day))?'rain':(Math.random()<0.7?'clear':(Math.random()<0.7?'cloudy':'rain'));   /* 颱風假整天下雨（calendar.js 的 TYPHOON）*/ E.setWeather(G.weather); F.companion=null; F.nightKai=false;
    if(S.mainDay(G)===2&&!S.week1Start(G)){ G.hour=13.05; E.hour=G.hour; GM.sceneEnd(); await GM.titleCard('第二天','週四 13:05 · 霖澤館前',2400); await GM.enter('campus',{x:26,z:-90,yaw:Math.PI}); return; }
    G.hour=wake!=null&&!S.opening(G)?wake:7.5; E.hour=G.hour; F.morningLine=false;   /* 醒來的時間（AA_110 6-5）：沒給＝07:30（舊行為）*/ if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined') CLS.setGoal(GM); else GM.setGoal(isThu(G)?'13:20 民法總則（霖澤館）':'自由的一天。去圖書館、公館，或找人聊天'); GM.sceneEnd(); await GM.titleCard(S.dayTitle(G),['週日','週一','週二','週三','週四','週五','週六'][G.weekday]+' '+hm(G.hour)+(alarm?'・鬧鐘：'+alarm:''),2200); if(typeof EXCH!=='undefined'&&EXCH.inUS&&EXCH.inUS(G)) await GM.enter('us_apartment',EXCH.SPAWN.us_apartment); else if(typeof HOME!=='undefined'&&HOME.suite&&HOME.suite(G)) await GM.enter('gongguan',Object.assign({},Y4_GG)); else if(bedSc){ let loaded=false; await GM.enter('dorm',S.wakeSpawn(bedSc),{deferStory:true,onLoaded:()=>{ loaded=true; const sc=S.sleepSceneOf(GM); if(sc) wakePlace(GM,sc); }}); if(loaded){ if(S._bed&&S._bed.waking) await wakeUp(GM,S._bed.sc); try{ Promise.resolve(S.onEnter('dorm',GM,{})).catch(e=>console.warn('STORY.onEnter',e)); }catch(e){ console.warn('STORY.onEnter',e); } } }   /* 宿舍房間（DORM-SLEEP-1030）：淡入以前就躺在床上（onLoaded）→ 躺一下、睜眼、爬下來 → 才演進房間的劇情（deferStory：原本 enter 淡入以後就叫 onEnter，這裡等人站好再叫；GM.enter 沒有真的換區域＝不叫）*/ else await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI});   /* 在美國：在公寓醒來（src/exchange3d.js）；住公館套房的在套房醒來＝公館（AA_363 T7-2）*/ { const f=S.monthlyFunds(G); if(f){ GM.money(f.amount); GM.toast(f.text,3800); } }   /* 生活費（D48）：S.monthlyFunds */ if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'){ try{ await CLS.morning(GM); }catch(e){ console.warn('CLS.morning',e); } } if(!F.KX_FIRST_MSG&&F.dating_kexin&&!S.e37LawPending(G)){ GM.sceneBegin(); try{ await GM.say(null,'休學到重考的那幾個月，你不是一個人過的。'); await kexinFirstMsg(GM,'morning'); } finally { GM.sceneEnd(); } }   /* 舊存檔（BB_95 9-0）：已經過了第一天、沒看過可昕的訊息的，下一個早上補一次；只補一次 */ if(typeof HOME!=='undefined'&&HOME.breakStartDue&&HOME.breakStartDue(G)){ GM.autosave(); HOME.breakStart(GM).catch(e=>console.warn('HOME.breakStart',e)); return; }   /* 法律系的暑假選了「暑假回家住」（AA_197 1-3；原 AA_183 第 2 節）：起床、成績那一件演完 → 回臺北的家（之後 HOME.tick 接家裡的選單）*/ if(typeof HOME!=='undefined'&&HOME.breakNote) HOME.breakNote(GM);   /* 寒假第一天早上：「寒假宿舍照常開放。……」（AA_197 1-3）*/ if(typeof CLS!=='undefined'&&CLS.queueWake) CLS.queueWake(GM);   /* 起床選單（DL-01 1-2）：宿舍的晨間事件演完、玩家空下來才出（CLS.oneTick）*/ GM.autosave(); }
  // ---------- 第二天：校園早上（其實是中午）----------
  /* 9/4 campusMorning 的阿哲初遇版（AA_195 4-8；台詞是 AA 的）：9/1 憲法、9/3 刑總都沒遇到阿哲的新局 */
  async function zheW1Morning(GM,zhe){ const G=GM.G, F=G.flags;
    await GM.say(zhe,'欸，你是法律系一年級的吧？開學典禮的時候坐我前面兩排。',{expr:'smile'});
    await GM.say(zhe,'我阿哲。周老師那堂我不想坐最前面，一起進去？');
    const i=await GM.choose([{t:'好啊。我是{name}。'},{t:'昨天的案例你看了嗎？'}]);
    if(i===0){ await GM.say(zhe,'好。'); await GM.say(null,'（他走在你旁邊。）'); }
    else { await GM.say(zhe,F.readCase==='full'?'看了一半。你看完了？那等一下被點到你幫我。':'沒有。我們兩個今天要低調一點。'); await GM.say(zhe,'啊我還沒問，你叫什麼？'); if(typeof ADV!=='undefined'&&ADV.speaker) ADV.speaker(null); await GM.say({name:G.name},'{name}。'); }
    F.MET_ZHE=true; if(typeof SOCIAL!=='undefined'&&SOCIAL.meet&&SOCIAL.has&&!SOCIAL.has('zhe','FIRST_MET')) SOCIAL.meet('zhe','campus');
    if(GM.rel) GM.rel('zhe',1); }
  async function campusMorning(GM){ const G=GM.G, F=G.flags, E=GM.E; const zhe=GM.npc.zhe; GM.sceneBegin(); GM.letterbox(true); await GM.sleep(300); if(zhe&&S.week1Start(G)&&!F.MET_ZHE){ GM.face(zhe,E.player.obj.position.x,E.player.obj.position.z); GM.cine('two',E.player.obj,zhe.obj); ADV.begin({background:'blur',right:'zhe'}); await zheW1Morning(GM,zhe); }   /* 9/1、9/3 都沒遇到阿哲的新局：初遇版（AA_195 4-8）*/
    else if(zhe){ GM.face(zhe,E.player.obj.position.x,E.player.obj.position.z); GM.cine('two',E.player.obj,zhe.obj); ADV.begin({background:'blur',right:'zhe'}); await GM.say(zhe,'{name}！你走路超慢。周老師那堂我不想坐最前面。',{expr:'smile'}); const i=await GM.choose([{t:'你先進去佔位子啊。'},{t:'昨天的案例你看了嗎？'}]); if(i===1){ if(F.readCase==='full') await GM.say(zhe,'看了一半。你看完了？那等一下被點到你幫我。',{expr:'laugh'}); else await GM.say(zhe,'沒有。我們兩個今天要低調一點。',{expr:'laugh'}); } else { await GM.say(zhe,'好啦好啦。'); } zhe.beh='follow'; zhe.followOff=1.4; GM.rel('zhe',1); } GM.letterbox(false); GM.sceneEnd(); GM.setGoal('進入霖澤館上課（13:20）'); }
  // ---------- 課堂 ----------
  async function classScene(GM){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; const z=E.zone; F.classNow=true; GM.sceneBegin(); GM.letterbox(true); const seat=z.seats.find(s=>s.row===1&&s.col===3); await GM.walkTo(P,seat.x,seat.z+0.6); GM.sitAt(P,seat); const prof=GM.npc.prof, an=GM.npc.an, zhe=GM.npc.zhe; if(zhe){ zhe.beh='idle'; } G.hour=Math.max(G.hour,13.35); E.hour=G.hour; GM.updateHUD(); await GM.sleep(500);
    GM.cine('front',prof.obj,null,{pos:V(0.6,1.5,-1.2),look:V(prof.obj.position.x,1.5,prof.obj.position.z)}); ADV.begin({background:'freeze',right:'prof_zhou'}); await GM.say(prof,'今天不上進度，先問你們的直覺。'); await GM.say(prof,'課程網站上的案例，應該都看過了。網拍上標價一千元的相機，市價一萬。買家下標付款，賣家說少打一個零，不出貨。'); await GM.say(prof,'買家告他。第一個問題：契約成立了嗎？'); GM.cine('ots',P.obj,prof.obj); await GM.say(prof,'我們先看民法一五四條。標定賣價陳列，視為要約；價目表之寄送，不視為要約。網頁上的商品頁，比較像哪一個？'); await GM.say(null,'教室安靜了兩秒。'+(S.anNameTold(G)?'前排的小安低頭寫字。':'前排那個女生低頭寫字。'));   /* AA_372 第 4 項：她自我介紹以前＝「前排那個女生」（上課前她先自我介紹過的照舊）*/ GM.cine('close',prof.obj,P.obj); prof.lookAt=P.obj.position; await GM.say(prof,'……這位同學。'+G.name+'，對吧。你說。'); G.stats.classes++;
    const full=F.readCase==='full', half=F.readCase==='half'; const opts=[]; opts.push({t:'「網頁標價比較像要約之引誘，下標才是要約。賣家沒有承諾，契約還沒成立。」',hint:full?'你昨晚讀到的':'需要讀過案例',dim:!full,key:'good'}); if(half) opts.push({t:'「賣家想主張錯誤撤銷……但這算要約還是引誘，我不太確定。」',hint:'你只讀了一半',key:'half'}); opts.push({t:'「標價就是要約，下標就是承諾，契約成立。」',hint:'直覺回答',key:'bold'}); opts.push({t:'「老師……我還沒看完案例。」',key:'none'}); const i=await GM.choose(opts); const key=opts[i].key;
    if(key==='good'&&!full){ await GM.say(null,'你想這樣說，但腦中一片空白。案例你根本沒讀完。'); F.classAnswer='none'; await GM.say(prof,'沒讀對吧。下次先讀。'); }
    else if(key==='good'){ F.classAnswer='good'; GM.cine('close',P.obj,prof.obj); await GM.say(prof,'嗯。那賣家那邊——他能不能主張錯誤，把這個「要約」撤銷？'); const j=await GM.choose([{t:'「八十八條。表意人無過失才能撤銷，少打一個零算不算過失，是爭點。」'},{t:'「……可以撤銷？」'}]); if(j===0){ await GM.say(prof,'對。而且撤銷之後還有九十一條的信賴利益賠償。很好，坐下。'); GM.addNote('law_91','民法 §91：撤銷後的賠償','表意人撤銷錯誤的意思表示後，對信賴其有效的相對人要負損害賠償。'); F.classAnswerPlus=true; } else { await GM.say(prof,'條文號碼？……八十八。回去把但書看清楚。'); } if(an){ CHAR.setExpr(an.obj,'smile'); an.lookAt=P.obj.position; } await GM.say(null,S.anNameTold(G)?'前排的小安回頭看了你一眼，很快又轉回去。':'前排那個女生回頭看了你一眼，很快又轉回去。'); GM.rel('an',3); GM.rel('zhe',2); SOCIAL.remember('heroine_01','CLASS_ANSWER_GOOD','民總：要約之引誘'); SOCIAL.remember('zhe','CLASS_ANSWER_GOOD'); SOCIAL.profEvent('prof_zhou','perf',6,'民總課堂答對'); SOCIAL.profEvent('prof_zhou','part',2); }
    else if(key==='half'){ F.classAnswer='half'; await GM.say(prof,'你抓到爭點了，但停在一半。一五四條後段——「價目表之寄送」。網頁比較像價目表還是陳列？'); await GM.say(null,'你沒有答案。周教授點了另一個人。'); GM.addNote('law_154','民法 §154：要約與要約之引誘','貨物標定賣價陳列者，視為要約；但價目表之寄送，不視為要約。'); }
    else if(key==='bold'){ F.classAnswer='bold'; await GM.say(prof,'成立。那你怎麼處理一五四條第一項但書？如果每個標錯價的網頁都成立契約，賣家一夜之間要賠多少？'); await GM.say(null,'你說不出來。有人在後面小聲笑。'); await GM.say(prof,'不是錯，是不完整。坐下。'); GM.addNote('law_154','民法 §154：要約與要約之引誘','貨物標定賣價陳列者，視為要約；但價目表之寄送，不視為要約。'); }
    else { F.classAnswer='none'; SOCIAL.remember('heroine_01','CLASS_ANSWER_BAD','民總沒讀案例'); SOCIAL.profEvent('prof_zhou','part',1,'沒讀案例'); await GM.say(prof,'沒讀。……好，下週我還會點你。'); await GM.say(null,'阿哲在旁邊用手肘頂了你一下。'); GM.addNote('law_154','民法 §154：要約與要約之引誘','貨物標定賣價陳列者，視為要約；但價目表之寄送，不視為要約。（上課聽到的）'); }
    prof.lookAt=null; GM.cine('wide',prof.obj,P.obj); ADV.end(); await GM.say(prof,'實務上，法院看的是網頁有沒有「明確、可以直接成立契約」的表示。這個案子的判決在講義第三頁。契約怎麼成立，下學期債總會正式上。錯誤和撤銷，這學期後面會講。下週先從第一條開始。'); await GM.fade(true); GM.advance(15.17-G.hour); F.classDone=true; F.classNow=false; GM.memo('上了民法總則：要約之引誘'); // 下課
    GM.removeNPC('prof'); for(const n of E.npcs.slice()){ if(n.isExtra){ E.removeNPC(n); } } await GM.fade(false); GM.standUp(P); if(an){ GM.standUp(an); an.beh='idle'; an.frozen=true; } if(zhe){ GM.standUp(zhe); GM.cine('two',P.obj,zhe.obj); await GM.say(zhe,'我要去打球。晚一點吃麵？阿鳳麵店，六點半。',{expr:'smile'}); await GM.say(zhe,'還有——你剛剛那個，'+(F.classAnswer==='good'?'很帥。':'很慘。')); GM.rel('zhe',1); zhe.beh='idle'; F.zheInvite=true; } GM.letterbox(false); GM.sceneEnd(); GM.setGoal('走出霖澤館'); if(an){ an.talk=n=>talkAn(GM,n); } GM.autosave(); }
  // ---------- 下課後：小安追上來 ----------
  async function meetAn(GM){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; GM.sceneBegin(); GM.letterbox(true); E.player.path=null; const px=P.obj.position.x, pz=P.obj.position.z, py=P.obj.position.y; const DR=(typeof B3!=='undefined'&&B3.CAMPUS_DOOR)||{x:34,z:-100}; // 從霖澤館門口跑來（v9.4：霖澤館的大廳入口在穿堂西側）
    const an=anTag(G,GM.spawnNPC('an',AN,DR.x,DR.z,{yaw:0,talk:n=>talkAn(GM,n),talkLabel:'和小安說話'})); an.run=true; GM.caption(S.anLabel(G),F.classAnswer==='absent'?'請問——你是{name}嗎？':'{name}！等一下！',2200);   /* AA_372 第 4、5 項：她報名字以前的字幕、按鈕；翹課版她沒見過他，先問是不是他 */ GM.cine('sky',P.obj); await GM.sleep(600); GM.face(P,DR.x,DR.z); P.pose='idle'; // 玩家回頭
    const dir=V(px-DR.x,0,pz-DR.z); const len=Math.max(0.01,dir.length()); dir.normalize(); const tx=px-dir.x*1.3, tz=pz-dir.z*1.3; GM.cine('front',P.obj,null,{pos:V(px+dir.x*0.5-dir.z*1.6,py+1.6,pz+dir.z*0.5+dir.x*1.6),look:V((px+DR.x)/2,py+1.4,(pz+DR.z)/2)}); await GM.walkTo(an,tx,tz,{run:true}); an.run=false; an.pose='idle'; GM.face(an,px,pz); await GM.sleep(300); GM.cine('two',P.obj,an.obj); CHAR.setExpr(an.obj,'smile'); ADV.begin({background:'blur',right:'heroine_01'}); SOCIAL.meet('heroine_01','campus');
    /* AA_372 第 6 節第 3、5 題（企劃線 7fca0df5）：她追出來這場補報名字「我是沈以安。……大家都叫我小安。」（之前在教室已經自我介紹過的不再說）——出席版接在「呼——你走好快。」後面；
       翹課版「呼——你走好快。」→「阿哲說你應該在這附近。」→ 報名字 →「你今天沒來？…」。報了才記 AN_NAME_TOLD（之後的對話框、按鈕、目標列、電梯、日誌寫「小安」）*/
    const tellName=async()=>{ if(S.anNameTold(G)) return; await GM.say(an,'我是沈以安。……大家都叫我小安。'); F.AN_NAME_TOLD=true; anTag(G,an); };
    await GM.say(an,'呼——你走好快。'); if(F.classAnswer==='absent'){ await GM.say(an,'阿哲說你應該在這附近。',{expr:'worried'}); await tellName(); await GM.say(an,'你今天沒來？周老師點了你的名字，全班都在找你。……我有抄筆記，等一下給你看。',{expr:'worried'}); }   /* AA_372 第 5 項 */ else { await tellName(); }
    if(F.classAnswer==='absent'){ /* 上一行說完了 */ } else if(F.classAnswer==='good') await GM.say(an,'剛剛周老師點你的時候我還以為你會慘掉，結果你連八十八條都講出來。你昨天讀到幾點？',{expr:'smile'}); else if(F.classAnswer==='bold') await GM.say(an,'剛剛那個「標價就是要約」——很敢耶。周老師好像有點開心，他喜歡有人跟他吵。',{expr:'laugh'}); else if(F.classAnswer==='half') await GM.say(an,'剛剛你講到錯誤撤銷就停了。其實你講的那一半是對的，我有寫在筆記上。'); else await GM.say(an,'剛剛周老師說下週還要點你。……我有把他講的重點抄下來，你要不要看？'); F.flags_met_an=true; G.flags.met_an=true;
    GM.cine('ots',P.obj,an.obj); await GM.say(an,'我等一下要去溫州街那間咖啡廳整理今天的筆記，就是開到凌晨兩點半那間。'); await GM.say(an,'你要不要一起？……還是你比較想去總圖？那邊安靜。'); const anR=S.anNameTold(G)?'小安':'她'; const i=await GM.choose([{t:'好啊，去咖啡廳。',hint:'跟'+anR+'一起走去溫州街'},{t:'總圖比較安靜，去總圖吧。',hint:'跟'+anR+'一起走去總圖'},{t:'今天有點累，改天。'}]);   /* 選項的小字也照她報名字了沒（AA_372 第 4 項的按鈕「和她說話」）*/
    if(i===2){ CHAR.setExpr(an.obj,'normal'); await GM.say(an,'喔，好。那……明天見。'); await GM.say(null,'她轉身往校門走。走了幾步又回頭揮了一下手。'); F.anSkipped=true; F.afternoonDone=true; GM.rel('an',-1); GM.memo('拒絕了小安的邀請'); SOCIAL.remember('heroine_01','DECLINED_INVITE','下課後她約你去咖啡廳'); GM.letterbox(false); GM.sceneEnd(); an.beh='route'; an.waypoints=[[30,-60],[30,-6],[-110,-6]]; an.pauseAt=false; an.talk=null; setTimeout(()=>{ if(GM.npc.an===an) GM.removeNPC('an'); },40000); GM.setGoal(F.zheInvite?'18:30 公館 阿鳳麵店（阿哲）':'自由行動'); return; }
    F.plan=i===0?'cafe':'library'; F.companion='an'; an.beh='follow'; an.followOff=1.1; CHAR.setExpr(an.obj,'smile'); await GM.say(an,i===0?'走吧。從校門出去，過馬路就是。':'走吧。總圖在那邊——經過社科院。'); GM.rel('an',2); GM.memo(i===0?'和小安一起去溫州街的咖啡廳':'和小安一起去總圖'); GM.letterbox(false); GM.sceneEnd(); GM.setGoal(i===0?'和小安一起走到校門，往公館・溫州街':'和小安一起走到總圖書館'); F.walkCk={}; startWalkTalk(GM); }
  // 一起走的路上：依位置觸發的對話
  /* 第二天走路時的對話（Café 或總圖兩條路線）。「為什麼是法律系」（D60，使用者 2026-10-14；AA_12 0-4、AA_120 7-5 第 5 項）：
     祐廷回「說來話長」，理由留到坐下來再說（AA_12 0-4）；以安講自己的理由，剛認識不提媽媽的工作（AA_113 第 0 節）*/
  const WHY_LAW_WALK=[['小安','你有沒有想過，為什麼是法律系？'],['我','……說來話長。你呢？'],['小安','我家吃飯的時候，一件小事也要講理由講半天。我想知道，理由要怎麼講才算數。']];
  function walkChecks(plan){ return plan==='cafe'?[{k:'road',x:30,z:-40,r:9,lines:WHY_LAW_WALK},{k:'bell',x:-38,z:6,r:12,lines:[['小安','傅鐘二十一響。上課十分鐘的那個故事。'],['我','我每次經過都在想，那剩下的三小時要幹嘛。'],['小安','……你這個人講話很煩耶。',3200]]},{k:'gate',x:-100,z:0,r:12,lines:[['小安','校門口那家豆花，週末排隊要二十分鐘。'],['小安','報告寫完我請你——如果你等一下有幫到忙的話。']]}]:[{k:'soc',x:40,z:-70,r:16,lines:WHY_LAW_WALK},{k:'lib',x:78,z:0,r:9,lines:[['小安','總圖三樓靠窗那排，下午光線很好，但四點以後會被曬到。'],['小安','我們坐二樓好了。']]}]; }
  function startWalkTalk(GM){ const G=GM.G, F=G.flags, E=GM.E; const cks=walkChecks(F.plan); const iv=setInterval(()=>{ if(F.companion!=='an'||F.afternoonDone){ clearInterval(iv); return; } if(E.player.busy||GM.D.active||G.zone!=='campus') return; const P=E.player.obj.position; for(const c of cks){ if(F.walkCk[c.k]) continue; if(Math.hypot(P.x-c.x,P.z-c.z)<c.r){ F.walkCk[c.k]=true; if(c.lines===WHY_LAW_WALK) F.whyWalkNew=true; playLines(GM,c.lines); break; } } },700); }   /* whyWalkNew：這次存檔裡真的播過新版的「說來話長」（AA 2026-10-14）*/
  async function playLines(GM,lines){ for(const l of lines){ GM.caption(l[0]==='我'?GM.G.name:(l[0]==='小安'?S.anLabel(GM.G):l[0]),l[1],l[2]||3000); await GM.sleep((l[2]||3000)+300); } }   /* 字幕的「小安」照她報名字了沒（AA_372 第 4 項）*/
  /* 為什麼念法律（D60）：Café、總圖兩個版本共用。只有 econ（說出念過一年經濟系）以安才記得（KNOWS_ECON_YEAR）；不設全域旗標——其他同學知不知道另外管。
     舊存檔的 whyLaw（ok／hero／family／unknown）保留原值不遷移 */
  const WHY_LAW_KEYS=['curious','econ','help','own'], ME=G=>({name:G.name});   /* ME：祐廷自己說的話（對話框寫名字；不改他坐著的姿勢）*/
  function whyLawChosen(G,F,k){ F.whyLaw=WHY_LAW_KEYS[k]; G.choices.whyLaw=F.whyLaw; if(F.whyLaw==='econ'&&typeof SOCIAL!=='undefined') SOCIAL.remember('heroine_01','KNOWS_ECON_YEAR','他說他念過經濟系'); }
  S.whyLawKey=F=>{ const v=F&&F.whyLaw; return v==null?null:({hero:'help',ok:'own',family:'own',unknown:'own'})[v]||v; };   /* 以後要讀 whyLaw 用這個（AA_120 7-5）：舊存檔的 hero 當 help，ok／family／unknown 當 own；沒聊過是 null */
  // ---------- 咖啡廳 ----------
  async function cafeScene(GM){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; const an=GM.npc.an; if(!an) return; GM.sceneBegin(); GM.letterbox(true); an.beh='idle'; const table={x:4.5,z:-2.5}; await Promise.all([GM.walkTo(P,table.x-0.6,table.z+1.6),GM.walkTo(an,table.x-0.6,table.z-1.6)]); GM.sitAt(P,{x:table.x,z:table.z+0.8,yaw:Math.PI}); GM.sitAt(an,{x:table.x,z:table.z-0.8,yaw:0}); G.money-=120; GM.updateHUD(); await GM.sleep(400); GM.advance(0.3);
    GM.cine('two',P.obj,an.obj,{flip:true}); ADV.begin({background:'blur',right:'heroine_01'}); await GM.say(null,'窗邊的雙人桌。她把筆電打開，又把它闔上。'); await GM.say(an,'先不寫。我想先問你一件事。',{expr:'normal'}); GM.cine('ots',P.obj,an.obj); await GM.say(an,'那個賣家——少打一個零的那個。你覺得法律應該保護他嗎？他自己粗心欸。'); const hasNote=GM.hasNote('law_88'); const i=await GM.choose([{t:'應該。交易要有誠信，但也不能讓人因為一個手誤就賠十倍。',key:'A'},{t:'不應該。錯誤是自己造成的，後果就自己承擔。',key:'B'},{t:'看情況。八十八條說「無過失」才能撤銷——少打一個零可能就是有過失。',key:'C',hint:hasNote?'你的筆記裡有':'需要讀過 §88',dim:!hasNote}]); let key=['A','B','C'][i]; if(key==='C'&&!hasNote){ await GM.say(null,'你想引條文，但想不起來是哪一條。'); key='A'; }
    F.cafeView=key; G.choices.cafeView=key; GM.cine('close',P.obj,an.obj);
    if(key==='A'){ CHAR.setExpr(an.obj,'smile'); await GM.say(an,'我也這樣想。可是我寫報告的時候一直被自己反駁——那買家呢？他真的以為撿到便宜，也沒做錯事。'); }
    else if(key==='B'){ CHAR.setExpr(an.obj,'surprise'); await GM.say(an,'好狠。'); CHAR.setExpr(an.obj,'normal'); await GM.say(an,'……但我懂。「我不是故意的」，現實裡每天都有人說。可是法律不是用來原諒粗心的。'); }   /* D60：剛認識的人，她不提媽媽在法院工作（AA_113 第 0 節）*/
    else { CHAR.setExpr(an.obj,'smile'); await GM.say(an,'對，就是「無過失」那三個字。我報告的結論想寫這個——可是要怎麼判斷「少打一個零」有沒有過失？你覺得呢？'); const j=await GM.choose([{t:'看賣家有沒有機會發現。網頁掛了三天都沒改，就有過失。'},{t:'看數字差多少。一千和一萬，正常人會發現。'}]); await GM.say(an,j===0?'時間。好，這個我沒想到。':'金額落差。嗯，這個判決好像有提到。'); GM.rel('an',2); F.cafeHelp=true; }
    await GM.say(null,'她打開筆電，打了幾行字，又停下來。'); GM.cine('two',P.obj,an.obj); await GM.say(an,F.whyWalkNew?'欸，剛剛路上你說「說來話長」。我們有一整個下午。':'欸，剛剛路上那個問題——為什麼是法律系？我們有一整個下午。');   /* 沒聽過新版走路台詞（舊版走到一半存的檔、沒經過觸發點就到店裡）：不提「說來話長」（AA 2026-10-14）*/
    /* 為什麼念法律（D60）：四個回答都是祐廷自己選的；只有說出念過經濟系（econ）以安才記得——其他同學知不知道另外管（ECON_PAST_SHARED），這裡不設全域旗標 */
    const k=await GM.choose([{t:'我小時候遇到事情就會去翻民法。翻得到，看不懂。我想知道怎麼看懂。',key:'curious'},{t:'我念過一個多月經濟。還是想念這個。',key:'econ'},{t:'我想幫身邊的人把事情弄清楚。',key:'help'},{t:'還在找怎麼說。但這是我自己選的。',key:'own'}]); whyLawChosen(G,F,k);
    if(F.whyLaw==='curious'){ await GM.say(an,'……小時候？'); await GM.say(null,'她停了一下。'); await GM.say(an,'那你很誠實。大部分人會說自己從小就懂。',{expr:'smile'}); }
    else if(F.whyLaw==='econ'){ CHAR.setExpr(an.obj,'surprise'); await GM.say(an,'所以你比我大？'); await GM.say(ME(G),'一歲。'); await GM.say(an,'……學長。',{expr:'smile'}); await GM.say(ME(G),'不要。'); }
    else if(F.whyLaw==='help') await GM.say(an,'這個理由我喜歡。很多人不是輸在法律，是輸在沒人幫他把事情弄清楚。',{expr:'smile'});
    else { await GM.say(an,'「自己選的」。'); await GM.say(null,'她重複一次，好像要記住。'); } GM.rel('an',3);
    await GM.fade(true); GM.advance(17.7-G.hour); await GM.fade(false); GM.cine('wide',P.obj,an.obj); await GM.say(null,'窗外的光慢慢變成橘色。巷子裡有機車經過，吧檯的磨豆機響了一聲。'); await GM.say(an,'我再待一下，你先走吧。'+(F.zheInvite?'阿哲不是約你吃麵？':'')+'',{expr:'smile'}); await GM.say(an,'今天……謝謝。'); await GM.say(an,'你的聯絡方式給我。筆記我拍給你。'); anContactDay2(G); F.afternoonDone=true; F.companion=null; GM.memo('和小安在兩點半 Café 待到黃昏'); SOCIAL.remember('heroine_01','CAFE_AFTERNOON','聊了報告和為什麼念法律'); SOCIAL.remember('heroine_01','WALKED_TOGETHER','從法學院走到溫州街'); SOCIAL.adjust('heroine_01',{fam:8,trust:5,comf:6}); GM.standUp(P); an.talk=n=>talkAn(GM,n); an.frozen=true; GM.letterbox(false); GM.sceneEnd(); GM.setGoal(F.zheInvite?'18:30 公館 阿鳳麵店（阿哲）':'今晚去公館吃點東西，或回宿舍'); GM.autosave(); }
  /* 以安的聯絡方式（交付清單 A19 的前提，AA 2026-10-14）：第二天 Café、總圖兩條路線的結尾她說「你的聯絡方式給我。筆記我拍給你。」——加聯絡方式、記那一天；
     當晚 21:30 她的第一則訊息是一張筆記的照片（phoneRules）。沒和她走的玩家、舊存檔：下午結束時默默加聯絡方式（phoneRules 的 silentContact），不補訊息 */
  function anContactDay2(G){ if(typeof INV!=='undefined'){ INV.rec(G); if(G.contacts.heroine_01==null) G.contacts.heroine_01=G.day; } G.flags.AN_CONTACT_DAY2=G.day; }
  async function libraryScene(GM){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; const an=GM.npc.an; if(!an) return; GM.sceneBegin(); GM.letterbox(true); an.beh='idle'; const seats=E.zone.seats; const sA=seats[0], sB=seats[1]; await Promise.all([GM.walkTo(P,sA.x,sA.z-0.7,{lv:sA.lv}),GM.walkTo(an,sB.x,sB.z+0.7,{lv:sB.lv})]); GM.sitAt(P,sA); GM.sitAt(an,sB); await GM.sleep(400); GM.advance(0.3);
    GM.cine('two',P.obj,an.obj); ADV.begin({background:'blur',right:'heroine_01'}); await GM.say(null,'二樓靠牆的長桌。翻書的聲音、有人把水壺放下的聲音。她把聲音壓得很低。'); GM.cine('ots',P.obj,an.obj); await GM.say(an,'（小聲）那個賣家——少打一個零的那個。你覺得法律應該保護他嗎？'); const hasNote=GM.hasNote('law_88'); const i=await GM.choose([{t:'應該。交易要有誠信，但不能讓人因為一個手誤就賠十倍。',key:'A'},{t:'不應該。錯誤是自己造成的。',key:'B'},{t:'看情況。八十八條「無過失」才能撤銷。',key:'C',hint:hasNote?'你的筆記裡有':'需要讀過 §88',dim:!hasNote}]); let key=['A','B','C'][i]; if(key==='C'&&!hasNote){ await GM.say(null,'你想引條文，但想不起來是哪一條。'); key='A'; } F.cafeView=key; G.choices.cafeView=key; GM.cine('close',P.obj,an.obj); if(key==='A') await GM.say(an,'（小聲）我也這樣想。可是那買家沒做錯事啊。'); else if(key==='B'){ CHAR.setExpr(an.obj,'surprise'); await GM.say(an,'（小聲）好狠。……但我懂。'); } else { CHAR.setExpr(an.obj,'smile'); await GM.say(an,'（小聲）對，「無過失」。我的結論就想寫這個。'); GM.rel('an',2); F.cafeHelp=true; }
    GM.cine('two',P.obj,an.obj); await GM.say(an,F.whyWalkNew?'（小聲）剛剛路上你說「說來話長」。……小聲講，可以講短一點。':'（小聲）剛剛路上那個問題……小聲講，可以講短一點。');
    const k=await GM.choose([{t:'小時候遇到事情就去翻民法。翻得到，看不懂。',key:'curious'},{t:'我念過一個多月經濟。還是想念這個。',key:'econ'},{t:'想幫身邊的人把事情弄清楚。',key:'help'},{t:'還在找怎麼說。但是我自己選的。',key:'own'}]); whyLawChosen(G,F,k);   /* 總圖的小聲版（D60）*/
    if(F.whyLaw==='curious') await GM.say(an,'（小聲）……小時候？那你很誠實。',{expr:'smile'});
    else if(F.whyLaw==='econ'){ await GM.say(an,'（小聲）所以你比我大？'); await GM.say(ME(G),'一歲。'); await GM.say(an,'（小聲）……學長。',{expr:'smile'}); await GM.say(ME(G),'不要。'); }
    else if(F.whyLaw==='help') await GM.say(an,'（小聲）這個理由我喜歡。',{expr:'smile'});
    else await GM.say(an,'（小聲）「自己選的」。……好。',{expr:'smile'}); GM.rel('an',3);
    await GM.fade(true); GM.advance(17.7-G.hour); await GM.fade(false); await GM.say(null,'窗外的光變成橘色，照在書架上。'); await GM.say(an,'（小聲）我再待一下。今天……謝謝。',{expr:'smile'}); await GM.say(an,'（小聲）你的聯絡方式給我。筆記我拍給你。'); anContactDay2(G); F.afternoonDone=true; F.companion=null; GM.memo('和小安在總圖待到黃昏'); SOCIAL.remember('heroine_01','LIBRARY_AFTERNOON','聊了報告和為什麼念法律'); SOCIAL.remember('heroine_01','WALKED_TOGETHER','從法學院走到總圖'); SOCIAL.adjust('heroine_01',{fam:8,trust:5,comf:5}); GM.standUp(P); an.talk=n=>talkAn(GM,n); an.frozen=true; GM.letterbox(false); GM.sceneEnd(); GM.setGoal(F.zheInvite?'18:30 公館 阿鳳麵店（阿哲）':'今晚去公館吃點東西，或回宿舍'); GM.autosave(); }
  // ---------- 麵店 ----------
  async function noodleScene(GM,it){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; const zhe=GM.npc.zhe; GM.sceneBegin(); const opts=[{t:'乾麵　60 元',dim:G.money<60},{t:'餛飩湯　70 元',dim:G.money<70},{t:'先不吃'}]; const i=typeof EAT!=='undefined'?await EAT.choose(GM,'阿鳳麵店',opts,['乾麵','餛飩湯'],[60,70]):await GM.choose(opts);   /* 店員認得你、老樣子（src/eat3d.js）*/ if(i===2){ GM.sceneEnd(); return; } const cost=i===0?60:70;
    const treat=typeof FEED!=='undefined'&&!!FEED.ytTreatDue&&FEED.ytTreatDue(G)&&!(typeof EAT!=='undefined'&&EAT.staffAway&&EAT.staffAway(GM,'阿鳳麵店'));   /* 語彤雙主修上了（AA_504 3-2，7/3 她私訊「阿姨說要請你吃麵。」）以後第一次在麵店點餐：阿姨一句、那一碗不用錢（src/feed3d.js）；
      阿姨不在店裡（語彤在顧店、阿姨去買東西：廚房那位就是阿姨，AA_503 第 14 節後補第 8 點）＝這一次照常付錢，等阿姨在店裡的那一次（EAT.staffAway）*/
    if(treat){ const T=FEED.ytTreatOf(); FEED.ytTreatDone(G); await GM.say({name:'阿姨'},T.line); } else { if(G.money<cost){ GM.toast('錢不夠'); GM.sceneEnd(); return; } GM.money(-cost); }
    if(typeof AA524!=='undefined'&&AA524.ytEgg) await AA524.ytEgg(GM);   /* AA_524 Y8：語彤生日那天「阿姨說要請你吃滷蛋。下次來。」（YT_BDAY_Y1）以後第一次點餐，同一個位置（src/aa524_3d.js）*/
    await GM.walkTo(P,it.seat.x,it.seat.z+0.5); GM.sitAt(P,it.seat); await GM.sleep(300); GM.advance(0.5); if(typeof EAT!=='undefined') await EAT.ordered(GM,'阿鳳麵店',i===0?'乾麵':'餛飩湯');   /* 吃過的、第一次的旁白（AA_329）*/
    if(zhe&&zhe.seat&&Math.hypot(zhe.obj.position.x-it.seat.x,zhe.obj.position.z-it.seat.z)<2.5&&!F.zheNoodleDone){ F.zheNoodleDone=true; GM.letterbox(true); GM.cine('two',P.obj,zhe.obj); ADV.begin({background:'blur',right:'zhe'}); SOCIAL.remember('zhe','SHARED_MEAL','阿鳳麵店'); await GM.say(zhe,'來了。我點了滷蛋，你要不要？',{expr:'smile'}); if(F.plan){ await GM.say(zhe,'所以下午你跟小安去哪了？我在球場看到你們兩個一起走。'); const j=await GM.choose([{t:F.plan==='library'?'總圖。她在整理今天的筆記。':'溫州街的咖啡廳。她在整理今天的筆記。'},{t:'沒有啊，剛好同路。'}]); if(j===0){ await GM.say(zhe,'整理筆記。嗯哼。',{expr:'laugh'}); await GM.say(zhe,F.plan==='library'?'她說開學這幾天，每天都坐總圖同一個位子。':'她說開學這幾天，每天都在那間店寫東西，寫到店員都認識她。'); GM.rel('an',1); }   /* B7b（AA_195 4-7，AA-B 21:26）：「整理筆記」接 B5；總圖版不再說「那間店」*/ else { await GM.say(zhe,'同路。從霖澤館走到校門要「剛好同路」二十分鐘喔。',{expr:'laugh'}); } }
      else await GM.say(zhe,'下午沒看到你，我還以為你先回宿舍了。');   /* AA_358 2-1（AA-C 2026-10-21 659d9d81）：只有真的跟小安走了（F.plan）才問那句和那組選項；拒絕她（anSkipped）、沒等到她（anMissed）的換這一句 */
      await GM.say(zhe,'對了，法服在招人。學長說一年級去會被操，但真的學得到東西。'); if(!F.lawclub) GM.addNote('club_law','法律服務社','隔週週六上午 萬才館一樓（民眾法律諮詢）。新社員先旁聽、做紀錄。阿哲說一年級去會被操。');   /* 備忘照 AA-C 2026-10-18 01:2x 的新字（週三讀書會、社長溫學姊作廢）＋原本阿哲那句（AA_132 F7）*/ GM.memo('和阿哲在阿鳳麵店吃麵'); GM.rel('zhe',3); GM.letterbox(false); GM.setGoal('吃飽了。晚上自由活動，回宿舍睡覺就到明天'); }   /* 2026-10-11 使用者回報：吃完麵目標還停在「阿鳳麵店（阿哲）」，不知道接下來要幹嘛 */
    else if(!(typeof EAT!=='undefined'&&await EAT.together(GM,'阿鳳麵店'))){ await GM.say(null,i===0?(typeof EAT!=='undefined'&&EAT.staffAway&&EAT.staffAway(GM,'阿鳳麵店')?'乾麵很燙。':'乾麵很燙。阿姨多給了一匙肉燥。'):'餛飩湯上面漂著一點油蔥。'); }   /* 有認識的人在吃：坐過去一起吃（AA_329 第 1 節）。AA_519 第 8 節第 2 點：阿姨在＝多給一匙肉燥、不在（EAT.staffAway）＝「乾麵很燙。」；不再寫「老闆娘」*/
    GM.standUp(P); GM.sceneEnd(); }
  // ---------- 對話（自由互動）----------
  /* 舊的對話函式（以安、阿哲、學姊、阿凱、Alison 固定時段的人）也先說門檻台詞（好感看得見：AA_124 1-6、BB_120）；第一二天、一起走的時候不插 */
  async function relUp(GM,id,n){ const G=GM.G; if(S.opening(G)||G.flags.companion||typeof SOCIAL==='undefined'||!SOCIAL.playUp) return false; if(!(await SOCIAL.playUp(GM,n,id))) return false; if(SOCIAL.activity) SOCIAL.activity(id,'chat'); return true; }
  /* Café 的學姊（BB_120 1-1，使用者 2026-10-14「在咖啡廳遇到溫學姊跟他講話好像也沒有增進什麼感情」）：晚上（19 點以後）每晚第一次＝打招呼（照關係）→ 小交流（「今天念了什麼？」和她的小事輪流）
     → 她推過來的便條（便條的句子照關係；W8 以前一律 ACQUAINTANCE 那句：SOCIAL.friendLevel 的 cap；AA_398 第 3 列）；同一晚再找她只有一句。存檔：flags.SIS_CAFE＝{night, k, s}。台詞在 data/rel_lines.js */
  async function sisCafe(GM,n){ const G=GM.G, F=G.flags, id='heroine_05', D=typeof REL_LINES!=='undefined'&&REL_LINES[id]&&REL_LINES[id].cafe; if(!D||typeof SOCIAL==='undefined'||!SOCIAL.playSteps||G.hour%24<19) return false;
    const CS=F.SIS_CAFE||(F.SIS_CAFE={}), P=st=>SOCIAL.playSteps(GM,n,id,st);
    if(CS.night===G.day){ await P(D.again); return true; }
    CS.night=G.day; let lv=SOCIAL.friendLevel(id); if(lv==='STRANGER') lv='ACQUAINTANCE';
    const T0=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, y2=S.dayOfKey('2026-08-01'), y1=y2!=null&&G.day<y2;
    const busy=y1?(!!(T0&&(T0.exam||T0.week===14||T0.week===15))||CALENDAR.dateOf(G.day).m===1):(S.fafuDuty(G)||!!(T0&&T0.exam));
    const tired=lv!=='ACQUAINTANCE'&&!!D.tired&&busy;   /* BB_169 W-11：她累的晚上＝單週週六法服值班、日曆標成考試週（看日曆的標記，不寫死週次）；祐廷大一那年她在準備法研所、不值法服（AA_284 1-6）：期中、期末考週、第 14～15 週、1 月 */
    await P(tired?D.tired:(D.hello[lv]||D.hello.ACQUAINTANCE));
    if(((CS.k|0)%2)===0){ await P(D.today.ask); const R=typeof CLS!=='undefined'&&CLS.rec?CLS.rec(G):null, st=R&&R.lastStudy&&R.lastStudy.day===G.day?R.lastStudy:null;
      const O=D.today.opts.filter(o=>o.need!=='studied'||st); const k=await GM.choose(O.map(o=>({t:o.need==='studied'?'（說今天念的'+st.name+'）':(o.tDating&&F.dating_heroine_05===true?o.tDating:o.t)})));   /* tDating：交往中不叫學姊（AA_313 6-4）*/ if(O[k]) await P(O[k].r); }
    else { const it=D.small[(CS.s|0)%D.small.length]; CS.s=(CS.s|0)+1; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; await P(it.lGrad&&T&&!/^Y1/.test(T.id)?it.lGrad:it.l);   /* lGrad：大二起她在念碩士（AA_313 6-5 第 8 點）*/ const k=await GM.choose(it.ch.map(c=>({t:c.t}))); if(it.ch[k]) await P(it.ch[k].r); }
    CS.k=(CS.k|0)+1;
    await GM.say(null,'（她推過來一張便條。'+(D.note[lv]||D.note.ACQUAINTANCE)+'）');
    if(SOCIAL.activity) SOCIAL.activity(id,'chat'); return true; }
  S.sisCafe=sisCafe;   /* 測試用（tests/sis_cafe_unit.js） */
  S._talkOld={zhe:(GM,n)=>talkZhe(GM,n),yu:(GM,n)=>talkYu(GM,n)};   /* 測試用（tests/aa313_s4s5_unit.js：阿哲、Alison 舊的閒聊三句照學期換）*/
  /* Alison 第一次說話的自我介紹（talkYu；AA_497 3-1 第 3 週保證認識的那一場也接這兩句原文，src/sup497_3d.js）*/
  S.YU_INTRO={camp:'（宿營時隔壁隊帶隊呼的那個女生。）',lines:['你是周老師點的那個！我是 Alison，坐你前面右邊。','我參加了三個社團，吉他社、辯論社，還有系學會。你要不要來吉他社？不用會彈。']};
  async function talkAn(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('heroine_01')) return; GM.sceneBegin({adv:'heroine_01'}); if(await S.twoHeartsEcho(GM,'heroine_01',n)){ GM.sceneEnd(); return; }   /* 1A-02 攤牌以後第一次說話 */ SOCIAL.talkedTo('heroine_01'); if(!n.seat) if(!n.seat) if(!n.seat) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); GM.cine('talk',E.player.obj,n.obj); const isCompanion=F.companion==='an'; if(!isCompanion&&F.met_an&&await relUp(GM,'heroine_01',n)){ GM.sceneEnd(); return; } if(isCompanion){ const l=[['走吧，還沒到。'],['你走路真的很快。'],['在想今天那題，還有沒有別的講法。']]; await GM.say(n,l[(Math.random()*l.length)|0][0]); }
    else if(!F.afternoonDone&&F.classDone){ await GM.say(n,'嗯？我等一下要去總圖。'); }
    else if(F.anMissed&&!F.met_an){ await GM.say(n,'你好，我是沈以安。大家都叫我小安。',{expr:'normal'}); F.AN_NAME_TOLD=true; anTag(G,n); await GM.say(n,'……同班的，你不記得？',{expr:'normal'});   /* AN_NAME_TOLD：她報了名字（AA_372 第 4 項）*/   /* AA_313 第 4 節第 10 點：第一次自我介紹用全名 */ F.met_an=true; if(typeof SOCIAL!=='undefined'&&SOCIAL.meet&&SOCIAL.has&&!SOCIAL.has('heroine_01','FIRST_MET')) SOCIAL.meet('heroine_01',G.zone); }   /* 第二天那段錯過了（S.tick 的 anMissed）：第一次說話她自我介紹（同下面沒認識的那句）*/
    else if(F.afternoonDone){ if(!F.anAfter){ F.anAfter=true; const w1=S.week1Start(G);   /* 開學改 9/1 的局第一週沒有報告：留 Café 那段的回聲（AA_195 4-11）；舊局照舊 */ if(F.cafeView==='C'){ await GM.say(n,w1?'你說的那個『無過失』，我回去查了一下。課本後面才會講。':'報告我用了你說的那個——「無過失」。老師如果打槍我，就說是你的主意。',{expr:'smile'}); } else if(F.cafeView==='B'){ await GM.say(n,w1?'你說的『後果自己承擔』，我後來想了一下。……還是覺得不太公平。':'我後來想了一下你說的「後果自己承擔」。……我把它寫進反方意見了。'); } else if(F.cafeView==='A'){ await GM.say(n,w1?'你那個『不能賠十倍』的講法，我記在筆記旁邊了。':'報告寫到一半。你那個「不能賠十倍」的講法，我放在結論。'); }
      else { await GM.say(n,w1?'民總的筆記我整理好了。你要借再跟我說。':'報告我先寫了一半。民總那題你有想法再跟我說。'); }   /* AA_358 2-2（AA-C 2026-10-21 659d9d81）：「不能賠十倍」只給 cafeView A；沒有 cafeView（拒絕咖啡廳）的沒說過那句 */ /* 舊版「家裡希望我念」的追問拿掉（D60：舊的四個回答連同反應整組拿掉；舊存檔的 family 照 AA_120 7-5 當 own 讀，沒有追問）*/GM.rel('an',1); } else if(!(await S.ladderTalk(GM,n,'heroine_01'))){ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, l=T&&T.id==='Y1S1'?['明天要不要一起去總圖？早上人少。','周老師說錯誤和撤銷要到這學期後面才講，你先看八十八條。','那間咖啡廳的檸檬塔你還沒吃過吧。']:T?['明天要不要一起去總圖？早上人少。','那間咖啡廳的檸檬塔你還沒吃過吧。']:['明天要不要一起去總圖？早上人少。','放假總圖人少。我都坐二樓靠窗。']; await GM.say(n,l[(Math.random()*l.length)|0],{expr:'smile'}); } }   /* AA_313 4-3：「周老師說錯誤和撤銷…」只在大一上；寒暑假（沒有學期＝階梯一律沒有資料）換「放假總圖人少。我都坐二樓靠窗。」*/   /* 閒聊階梯（AA_135）優先；沒有階梯資料（之後的學期）才用舊的三句 */
    else { await GM.say(n,'你好，我是沈以安。大家都叫我小安。',{expr:'normal'}); F.AN_NAME_TOLD=true; anTag(G,n); await GM.say(n,'……同班的，你不記得？',{expr:'normal'});   /* 9/4 上課前在教室找她說話＝她先報了名字：之後的字幕、按鈕叫「小安」（AA_372 第 4 項）*/   /* AA_313 第 4 節第 10 點：第一次自我介紹用全名 */ G.flags.met_an=true; }
    if(G.flags.afternoonDone&&G.flags.companion==null) await S.offerInvite(GM,'heroine_01',n); GM.sceneEnd(); }
  async function talkZhe(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('zhe')) return; GM.sceneBegin({adv:'zhe'}); SOCIAL.talkedTo('zhe'); if(!n.seat) if(!n.seat) if(!n.seat) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); GM.cine('talk',E.player.obj,n.obj); if(!(F.zheInvite&&!F.zheNoodleDone)&&await relUp(GM,'zhe',n)){ GM.sceneEnd(); return; } if(n.seat&&G.zone==='noodle'){ await GM.say(n,'坐啊，麵要涼了。',{expr:'smile'}); } else if(!F.classDone&&isThu(G)){ await GM.say(n,'快進去啦，周老師要來了。'); } else if(F.zheInvite&&!F.zheNoodleDone){ await GM.say(n,'六點半，阿鳳麵店，公館那條街上。別忘了。',{expr:'smile'}); } else { const l=[(d=>d!=null&&G.day>=d)(termDay('Y3S1',1,1))?'這季我是隊長。週五你來記分。':'系籃週五練球，要來就來，不會打也可以來坐。','公館那家滷味晚上十點後半價。','我球鞋又開口笑了，這禮拜要去買新的。'];   /* AA_313 5-3：系籃那句到大二下為止，大三起他是隊長 *//* AA_209 附錄A §2 */ await GM.say(n,l[(Math.random()*l.length)|0],{expr:'laugh'}); } if(G.flags.afternoonDone&&G.flags.companion==null) await S.offerInvite(GM,'zhe',n); GM.sceneEnd(); }
  /* 還沒有 W1（events.js ev_sis_w1：總圖門口的台階、Café，AA_218 17-3；BB-C 798e9b14）：9/4 分直屬以前她是陌生人——一行旁白、不加數值、不記認識；
     9/4 以後 W1 在台階、Café、閱覽室、大廳自習區都演（AA_379：使用者 10-21 23:2x「就直接可以說話就好」）；其他地方照陌生人那一行。FIRST_MET／met_sis 只有 W1 會記 */
  /* 9/4 分直屬以前找學姊說話（AA-C 2026-10-18 01:4x，SIS-W1 第 ① 點）：只有一句旁白，不算對話、不記關係；9/4 以後才開 W1（總圖台階、Café）*/
  S.SIS_PRE_W1='（她在看手機，沒有抬頭。）';
  S.sisPreW1=(G,id)=>id==='heroine_05'&&!!G&&(G.stage||'law')==='law'&&!(G.flags&&G.flags.met_sis)&&G.day<S.dayOfKey('2025-09-04');
  /* 直屬公布了沒（AA_372 第 12 項）：9/4（四）21:00 Kevin 在家族群組說「上面那位是你的直屬學姊」以後才算知道——聯絡人的「（直屬）」、W1 祐廷的那一句照這個 */
  /* 日誌裡名字晚一點才寫的那一句（AA_372 第 4 項）：語彤雨天「便利商店應該有賣。」那一版她沒報名字＝「遇到一個借傘的女生」；之後拿到她的聯絡方式（報了名字）才顯示 named */
  S.memoText=(G,m)=>!m?'':(m.named&&m.who&&typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,m.who)?m.named:m.t);
  S.memoShown=G=>((G&&G.memo)||[]).filter(m=>{ const t=S.memoText(G,m); return typeof t==='string'&&!!t&&!/^ev_[A-Za-z0-9_]+$/.test(t); });   /* MEMO-NO-EVID-1028：日誌顯示的那幾筆——舊存檔裡已經寫進去的事件代號（ev_xxx）不顯示 */
  S.sisZhishuOut=(G,day,hour)=>{ const d=S.dayOfKey('2025-09-04'), dd=day==null?G.day:day, hh=hour==null?G.hour:hour; return d==null||dd>d||(dd===d&&hh>=21); };
  async function talkSis(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('heroine_05')) return; GM.sceneBegin({adv:'heroine_05'}); if(await S.twoHeartsEcho(GM,'heroine_05',n)){ GM.sceneEnd(); return; }   /* 1A-02 攤牌以後第一次說話 */
    if(!F.met_sis){ await GM.say(null,S.sisPreW1(G,'heroine_05')?S.SIS_PRE_W1:'（她抬頭看了你一眼，點了一下頭，又低頭看手上的書。）'); GM.sceneEnd(); return; }   /* AA_379：閱覽室、大廳自習區 9/4 以後找她說話＝ev_sis_w1（上面 EVENTS.onInteract），原本那一行旁白（說這裡不能講話）拿掉 */
    SOCIAL.talkedTo('heroine_05'); if(!n.seat) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); GM.cine('talk',E.player.obj,n.obj);
    if(typeof SISY23!=='undefined'&&SISY23.preTalk) await SISY23.preTalk(GM);   /* AA_379 2-3、2-6：大二下第 5～10 週、大三上 11/1～11/9 第一次找她說話，接在前面演，演完照常閒聊（src/sis_y2y3_3d.js）*/
    if(await relUp(GM,'heroine_05',n)){ GM.sceneEnd(); return; } if(F.met_sis&&G.zone==='cafe'&&await sisCafe(GM,n)){ if(G.flags.afternoonDone&&G.flags.companion==null) await S.offerInvite(GM,'heroine_05',n); GM.sceneEnd(); return; }   /* Café 晚上那一段（sisCafe）照舊，演完多「約她去…」（INVITE-MENU-1030 C，使用者 10-30「學姊也不能約她」：19:00 以後原本直接結束，走不到 offerInvite）*/
    if(!(await S.ladderTalk(GM,n,'heroine_05'))){ const w=typeof SISB16!=='undefined'&&SISB16.winterLine?SISB16.winterLine(G):null; if(w){ await GM.say(n,w); } else { const l=['判決要看事實，不要只背結論。','法圖九點四十五關門。我都待到最後。','總圖三樓的判例彙編，去年被人翻到脫頁。……不是我。'].filter((t,i)=>i>0||!(typeof SOCIAL!=='undefined'&&SOCIAL.playerYear&&SOCIAL.playerYear()>=2)); await GM.say(n,l[(Math.random()*l.length)|0]); } }   /* AA_523 6-15：大四寒假（2028-12-25～2029-02-18）換六句輪流（src/sis_b16_3d.js S.winterLine）*/   /* 閒聊階梯（BB_130）優先；AA_263 (b) 第 4 點：「判決要看事實」是學姊對大一學弟講的，大二起不用 */ if(G.flags.afternoonDone&&G.flags.companion==null) await S.offerInvite(GM,'heroine_05',n); GM.sceneEnd(); }
  /* 室友阿凱的宿舍事件（BB_130 第 6 節；LADDER.kaiDorm K-D1～6；使用者 2026-10-15 試玩回報：室友要有故事——打電動、吵架、和好）：
     K-D1 晚上找他說話（週日～四 21～24、一週一次）＝一起打一場；K-D2 第二次以上、打完已經 23 點以後＝一場變三場（時間到 02:00；選「八點。」隔天早上精力 −10）；
     K-D3 有早八的早上（7:00～8:30）、昨晚沒一起打，在宿舍 30%＝鍵盤聲；不說話累積 KAI_FRICTION，到 3 或選「你到底要不要睡？」＝K-D4 吵架（之後兩天他只說「嗯」）；
     K-D5 吵架後第 1～3 天在宿舍＝和解的飲料；沒回宿舍的話第 4 天自己和好、下次見面他先說（不鎖線）；K-D6 和好以後的週日晚上＝室友模式。台詞照資料，一字不改 */
  const KD=id=>((typeof LADDER!=='undefined'&&LADDER.kaiDorm)||[]).find(e=>e.id===id)||null;
  const kdRec=G=>{ const F=G.flags; if(!F.kaiDorm||typeof F.kaiDorm!=='object') F.kaiDorm={}; return F.kaiDorm; };
  const kdWeek=G=>{ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return T?T.id+':'+T.week:'d'+Math.floor(G.day/7); };
  const kdIn=(G,e)=>{ const hh=G.hour; if(e.time&&!(hh>=e.time[0]&&hh<e.time[1])) return false; if(e.weekday&&!e.weekday.includes(G.weekday)) return false; return true; };
  async function kdChoice(GM,n,ev){ const G=GM.G, F=G.flags; const k=await GM.choose(ev.choices.map(c=>({t:c.t}))); const ch=ev.choices[k]||ev.choices[0];
    if(ch.advance) GM.advance(ch.advance); if(ch.energy) GM.energy(ch.energy); if(ch.rel) for(const id in ch.rel) SOCIAL.adjust(id,ch.rel[id]);
    if(ch.random) await GM.say(n,ch.random[(Math.random()*ch.random.length)|0]); if(ch.count) F[ch.count]=(+F[ch.count]||0)+1; if(ch.inc) F[ch.inc]=(+F[ch.inc]||0)+1;
    if(ch.reply) await GM.say(n,ch.reply); if(ch.narr) await GM.say(null,ch.narr); if(ch.mem) SOCIAL.remember('kai',ch.mem,ev.id);
    if(ch.clear) F[ch.clear]=false; return {k,ch}; }
  async function kdFight(GM,n){ const G=GM.G, F=G.flags, ev=KD('K-D4'); if(!ev) return; for(const l of (ev.lines||[])){ if(l.who==='player') await GM.say(ME(G),l.t); else await GM.say(n,l.t); }
    if(ev.narr) await GM.say(null,ev.narr); F.KAI_FIGHT=true; F.KAI_FRICTION=0; kdRec(G).fightDay=G.day; }
  const kaiWho=GM=>GM.npc.kai||{name:SOCIAL.displayName?SOCIAL.displayName('kai'):'阿凱',charId:'kai'};
  /* 和阿凱說話時（talkKai）：吵架中只說「嗯」；第 4 天自己和好的那一句；K-D6；K-D1（一起打電動，接 K-D2）。回傳 true＝處理了 */
  /* K-D2 選項①照隔天課表換字（BB-B note，baa5c577）：第一堂在上午＝說時間（「九點十分」）、在下午＝ifAfternoon 那一組；隔天沒課＝不出現這個選項 */
  const CN=['零','一','二','三','四','五','六','七','八','九','十'], cnNum=k=>k<=10?CN[k]:(k<20?'十'+CN[k-10]:CN[Math.floor(k/10)]+'十'+(k%10?CN[k%10]:''));
  S.cnClock=h=>{ const m=Math.round(h*60), hh=Math.floor(m/60)%12||12, mm=m%60; return cnNum(hh)+'點'+(mm?cnNum(mm)+'分':''); };
  const kdFirstClass=(G,st)=>{ if(!st||!Array.isArray(st.choices)||!st.choices.some(c=>/\{明天第一堂\}/.test(c.t||''))) return st; const C=typeof CLS!=='undefined'&&CLS.dayItems?CLS:null;
    const its=C?(C.dayItems(G,G.day+(G.hour>=24?1:1))||[]).filter(it=>!(C.storyClass&&C.storyClass(G,it))).sort((a,b)=>a.t0-b.t0):[], first=its[0];
    const ch=[]; for(const c of st.choices){ if(!/\{明天第一堂\}/.test(c.t||'')){ ch.push(c); continue; } if(!first) continue;
      if(first.t0>=12&&c.ifAfternoon) ch.push(Object.assign({},c,{t:c.ifAfternoon.t,reply:c.ifAfternoon.reply})); else { const w=S.cnClock(first.t0); ch.push(Object.assign({},c,{t:c.t.replace(/\{明天第一堂\}/g,w),reply:String(c.reply||'').replace(/\{明天第一堂\}/g,w)})); } }
    return Object.assign({},st,{choices:ch}); };
  S.kaiDormTalk=async function(GM,n){ const G=GM.G, F=G.flags, R=kdRec(G); if(typeof LADDER==='undefined'||!LADDER.kaiDorm||G.zone!=='dorm') return false;
    if(!F.introDone||(S.week1Start(G)&&!F.MET_KAI)) return false;   /* BB_170 第 3 列：認識阿凱（ev_kai_movein，BB_168 §1）而且 9/3 宿舍那晚以後 */
    if(R.sorryPending){ R.sorryPending=false; const fb=(KD('K-D5')||{}).fallback||'', m=fb.match(/「([^」]+)」/); if(m){ await GM.say(n,m[1]); return true; } }
    if(F.KAI_FIGHT&&G.day-(R.fightDay|0)<=2){ await GM.say(n,'嗯'); return true; }   /* K-D4：之後兩天他只說「嗯」*/
    const d6=KD('K-D6'); if(d6&&!R.d6&&SOCIAL.has('kai','KAI_ROOM_RULES')&&kdIn(G,d6)){ R.d6=G.day; for(const l of d6.lines) await GM.say(n,l); await kdChoice(GM,n,d6); return true; }
    const d1=KD('K-D1'); if(d1&&!F.KAI_FIGHT&&R.d1Week!==kdWeek(G)&&kdIn(G,d1)){ R.d1Week=kdWeek(G); for(const l of d1.lines) await GM.say(n,l); const r=await kdChoice(GM,n,d1);
      if(r.k===0){ R.lastGameDay=G.day; const d2=KD('K-D2'); if(d2&&!R.d2&&(+F.KAI_GAMES||0)>=2&&G.hour>=d2.time[0]){ R.d2=G.day; if(d2.narr) await GM.say(null,d2.narr); if(G.hour<26) GM.advance(26-G.hour); for(const l of d2.lines) await GM.say(n,l); await kdChoice(GM,n,kdFirstClass(G,d2)); } }   /* K-D2：一場變三場，抬頭已經兩點 */
      return true; }
    return false; };
  /* 在宿舍時（S.tick）：K-D3 早上的鍵盤聲、K-D5 和解的飲料；吵架第 4 天自己和好（不在宿舍也算）*/
  let kdBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:kdBusy']=()=>{ kdBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.kaiDormTick=function(GM){ const G=GM.G, F=G.flags, R=kdRec(G); if(kdBusy||typeof LADDER==='undefined'||!LADDER.kaiDorm) return;
    if(F.KAI_FIGHT&&G.day-(R.fightDay|0)>=4){ F.KAI_FIGHT=false; SOCIAL.remember('kai','KAI_ROOM_RULES',''); R.sorryPending=true; return; }   /* 沒回宿舍：第 4 天自己和好（BB_130 fallback）*/
    if(G.zone!=='dorm') return; const run=f=>{ kdBusy=true; (async()=>{ GM.sceneBegin({adv:'kai'}); try{ await f(); } finally { GM.sceneEnd(); kdBusy=false; } })().catch(e=>{ console.warn('kaiDorm',e); kdBusy=false; }); };
    const d5=KD('K-D5'), dd=G.day-(R.fightDay|0); if(d5&&F.KAI_FIGHT&&dd>=d5.daysAfter[0]&&dd<=d5.daysAfter[1]&&R.d5!==R.fightDay){ R.d5=R.fightDay; run(async()=>{ const n=kaiWho(GM); if(d5.narr) await GM.say(null,d5.narr); await kdChoice(GM,n,d5); }); return; }
    const d3=KD('K-D3'), t3=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(d3&&kdIn(G,d3)&&!(t3&&t3.id==='Y1S1'&&t3.week<2)&&R.d3Roll!==G.day&&GM.npc.kai&&!F.KAI_FIGHT&&!SOCIAL.has('kai','KAI_QUIET_KEYBOARD')&&!SOCIAL.has('kai','KAI_ROOM_RULES')&&R.lastGameDay!==G.day-1){
      const early=typeof CLS!=='undefined'&&CLS.dayItems&&CLS.dayItems(G).some(it=>it.t0<=9.25); R.d3Roll=G.day; if(!early||Math.random()>=0.3) return;   /* 今天有早上的第一堂課、昨晚沒一起打：30%。BB 寫「早八」；遊戲的大一必修最早是 09:10（第 2 節），只算 08:10 的話這個事件永遠不會發生——早上 9:10 以前的課都算 */
      run(async()=>{ const n=kaiWho(GM); if(d3.narr) await GM.say(null,d3.narr); const r=await kdChoice(GM,n,d3); if(r.ch.goto==='K-D4'||(+F.KAI_FRICTION||0)>=3) await kdFight(GM,n); }); } };
  async function talkKai(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('kai')) return; GM.sceneBegin({adv:'kai'}); SOCIAL.talkedTo('kai'); GM.cine('talk',E.player.obj,n.obj); if(await relUp(GM,'kai',n)){ GM.sceneEnd(); return; } if(await S.kaiDormTalk(GM,n)){ GM.sceneEnd(); return; } if(S.mainDay(G)===1){ await GM.say(n,'案例讀了沒？我戴耳機了，你讀你的。',{expr:'smile'}); } else if(F.afternoonDone&&!F.kaiAsked){ F.kaiAsked=true; await GM.say(n,'下午去哪了？'); const w1=S.week1Start(G), i=await GM.choose([{t:w1?'同學。去咖啡廳念書。':'同學。寫報告。'},{t:'沒有啊。'}]); await GM.say(n,i===0?(w1?'（笑）念書喔。好喔。':'「寫報告」。好，你們法律系的都很會用這個詞。'):'喔。',{expr:'laugh'});   /* 開學改 9/1 的局沒有報告（AA_195 4-11）*/ } else if(typeof DORM203!=='undefined'&&DORM203.kaiTalk&&await DORM203.kaiTalk(GM,n)){   /* 203 房間補的三句（AA_502 2-3；說過了照原本的房間句）*/ } else { const l=['我明天早八，你走的時候小聲一點。','宿舍網路又斷了，我要去投訴。你們有教這個嗎？']; if(F.introDone) l.unshift('所以那個賣家可以告嗎？……不能？那法律系在幹嘛。');   /* BB_170 第 4 列：相機案例 9/3 晚上才有 */ await GM.say(n,l[(Math.random()*l.length)|0],{expr:'smile'}); } if(G.flags.afternoonDone&&G.flags.companion==null) await S.offerInvite(GM,'kai',n); GM.sceneEnd(); }
  async function talkYu(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('yu')) return; GM.sceneBegin({adv:'yu'}); SOCIAL.talkedTo('yu'); GM.cine('talk',E.player.obj,n.obj); if(F.met_yu&&await relUp(GM,'yu',n)){ GM.sceneEnd(); return; } if(!F.met_yu){ F.met_yu=true; F.metYuDay=G.day; if(Array.isArray(F.CAMP_SEEN)&&F.CAMP_SEEN.includes('yu')) await GM.say(null,S.YU_INTRO.camp);   /* 宿營見過（CAMP_SEEN，AA_205 第 4 節）：第一次正式見面多一句旁白，初遇照舊 */ await GM.say(n,S.YU_INTRO.lines[0],{expr:'smile'}); await GM.say(n,S.YU_INTRO.lines[1]);   /* AA_156 1-3：AA_40 的設定（法服是學姊的讀書會，Alison 不在裡面）*/ GM.rel('yu',2); } else { const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, hh=((G.hour%24)+24)%24; if(hh>=8+20/60&&hh<9+5/60&&SOCIAL.has('yu','BREAKFAST_YU')&&F.yuBellDay!==G.day&&T&&(T.id==='Y1S1'||T.id==='Y1S2')){ F.yuBellDay=G.day; await GM.say(n,'欸，今天也經過！',{expr:'smile'}); }   /* AA_156 第 2、4 節：BREAKFAST_YU、大一、早上 08:20～09:05（原 9:30～12:00、當天第一次（AA_118 2-2）*/
      const l=[G.zone==='campus'&&hh<12?'傅鐘旁邊這張椅子早上曬不到太陽，是全校最好的位子。':'我今天早上吃了兩份早餐，好撐。',(d=>d!=null&&G.day>=d)(termDay('Y2S2',1,1))?'我這禮拜兩個社團都要開會，快死了。':'我這禮拜辯論社都要開會，快死了。','溫州街的貓你有看到嗎？咖啡廳門口那隻。'];   /* AA_209 附錄A §2：傅鐘那句只在校園早上（12 點以前）說，其他時候換早餐那句；「辯論社下週」那句換掉。AA_313 5-4：大二下她退了辯論社（AA_497 3-4 的私訊）以後是「兩個社團」。
     AA_497 3-8：「三個社團」只留人物頁、第一次自我介紹、迎新旁白、語 1「她講了十五分鐘」、聖誕禮物那一句；這一句拿掉「三個社團」四個字換成辯論社（列給 AA 看）*/ await GM.say(n,l[(Math.random()*l.length)|0],{expr:'smile'}); } if(G.flags.afternoonDone&&G.flags.companion==null) await S.offerInvite(GM,'yu',n); GM.sceneEnd(); }
  async function talkProf(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('prof_zhou')) return; GM.sceneBegin({adv:'prof_zhou'}); SOCIAL.talkedTo('prof_zhou'); GM.cine('talk',E.player.obj,n.obj); if(F.classAnswer==='good'&&S.civ1Week(G)) await GM.say(n,G.name+(S.week1Start(G)?'。今天回答得不錯。下週從第一條開始，先把總則的目錄看過。':'。今天回答得不錯。下週的錯誤與撤銷，先看八十八和九十一。')); else if(F.classAnswer==='none'&&S.civ1Week(G)) await GM.say(n,G.name+'。案例要讀。下週我還會點人。'); else if(S.zhouTalkTerm(G)) await GM.say(n,CALENDAR.termOf(G.day).id==='Y4S2'?'大四了。你們這一屆，我從民總教到專題。':'有問題可以來研究室。週四下課以後我都在。'); else await GM.say(null,'（'+SOCIAL.displayName('prof_zhou')+'跟你打了個招呼，聊了兩句天氣。）');   /* AA_195 4-11：新局的民總第一堂之後下週從第一條開始；另外兩句去掉「不是 X，是 Y」和格言收尾（新舊局都改）。AA_522 1-1：「週四下課以後」只在他有課的學期說，其他學期聊兩句天氣（同 events.js SMALLTALK.prof_zhou）；第 9 節第 2 點（a3ea3918e）：大四下他的課在週一、週四沒有研究室，換「大四了……」、不邀研究室（研究室只有 1-3 那一次，下課時會提示）*/ GM.sceneEnd(); }
  S.ZHOU_TALK_TERMS=['Y1S1','Y1S2','Y2S1','Y4S2'];   /* AA_522 1-1：周教授有課的學期（民總、債總一、債總二、專題）；events.js SMALLTALK.prof_zhou 兩筆的 term 合起來同一份（大四下那一筆換句，第 9 節第 2 點）*/
  S.zhouTalkTerm=G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; return !!t&&S.ZHOU_TALK_TERMS.includes(t.id); };
  /* AA_522 第 8 節第 3 點（f36dfe3cf）：talkProf 答得好、沒讀那兩句（「下週……」）只在民總第一堂課（主線第二天的劇情課，CLS.storyClass）那一週（週一～週日）說；
     之後照 1-1（有課的學期「週四下課以後我都在」，其他學期聊天氣）。第 9 節第 1 點（a3ea3918e）：這一週研究室（events.js ev_prof_zhou_office）不演，先說這兩句，下一個週四開始 */
  S.civ1Week=G=>{ const d0=S.mainD1(G)+1, wd=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d0).wd:0; if(!wd) return G.day===d0; const mon=d0-(wd-1); return G.day>=mon&&G.day<mon+7; };
  // ---------- 認識的人現在大概在哪（2026-10-11 使用者：「自由那天根本不知道其他 NPC 在哪，至少給我線索吧」）----------
  // 用角色資料的 daily_schedule——和 populateSchedule 生人物用的是同一份，地圖上寫的和走過去看到的一致。
  // 第一二天主線還在安排的人（LEGACY_IDS，下午的劇情結束前、上課中）不猜：那時候劇情會帶玩家去找他們。
  const ACT={read:'看書',class:'上課',barista:'打工',wander:'走走',help:'幫忙',sit:'坐著',club:'社團',eat:'吃飯',wait:'等人',desk:'在書桌前',ta:'助教課',follow:'和你在一起',linger:'待一下'};
  /* 人物在不在學校（AA_110 第 3 節：跨學年的出場條件）：CHARACTERS[id].presence＝{from:'Y1S1', until:'Y2S1', absent:['Y3S2'], away:{Y3S2:'在日本交換', after:'在別的學校念書'}}。
     學期照日曆（寒暑假算前一個學期）；不在的時候不生人物、人物線索寫 away 的文字、課堂沒有她的反應句、事件的 npcHere 不成立。
     沒有 presence 的人物照舊（現在的資料都還沒填：內容要 AA 確認、使用者批准，見 docs/STORY_EVENT_SCHEMA.md）。 */
  const TERM_ORDER=['Y0S1','Y0S2','Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  /* 這一天算哪一學期（寒暑假算前一個學期）：找開學日在這一天以前的最後一個學期。AA_357 1-4（AA-C 2026-10-21）：原本只往回找 200 天，大四下（2029-06-03 結束）以後 200 天（2029-12-20 起）
     找不到＝null，資料頁、年級全部退回大一、人物的 presence 全部變成「在」——畢業後篇所有玩家都會遇到。現在畢業以後一直算大四下；第一個學期以前照舊 null。
     CALENDAR 沒有 TERMS（測試的假日曆）照舊往回找 200 天 */
  S.termAt=function(day){ if(typeof CALENDAR==='undefined') return null; { const t=CALENDAR.termOf(day); if(t) return t.id; }
    if(Array.isArray(CALENDAR.TERMS)&&CALENDAR.tOf){ const x=CALENDAR.tOf(day); let best=null; for(const T of CALENDAR.TERMS) if(typeof T.t0==='number'&&T.t0<=x&&(!best||T.t0>best.t0)) best=T; return best?best.id:null; }
    for(let d=day; d>day-200; d--){ const t=CALENDAR.termOf(d); if(t) return t.id; } return null; };
  S.presence=function(id,G){ const c=(typeof CHARACTERS!=='undefined')&&CHARACTERS[id]; const P=c&&c.presence; if(!P) return {here:true}; const r=presCore(id,P,G);
    if(P.lost&&!r.here&&S.dayOfKey){ const d=S.dayOfKey(P.lost.from), F=(G&&G.flags)||{}; if(d!=null&&G.day>=d&&!(P.lost.known||[]).some(k=>F[k]!=null&&F[k]!==false)) return Object.assign({},r,{away:P.lost.away||r.away,lost:true}); }   /* lost（AA_282 第 1、2 節，沛珊）：那天以後、玩家還沒重新聯絡上（known 的旗標一個都沒有）＝手機寫「很久沒聯絡」、不能去找她（hometown3d.js 看 lost）；kind、city 照舊 */
    return r; };
  /* 用日期算的不在（absentDates：回老家、交換、出國，結果有 back）：劇情寫死的生人物（校園傍晚的以安、下午的阿哲、宿舍晚上的阿凱——LEGACY_IDS，不走作息）也看這個（HOLIDAY-PRESENCE-1021）。
     只看 absentDates、不看 from／until（宿營、搬宿舍那幾天還沒開學，照舊）*/
  S.awayOnDate=function(id,G){ const p=S.presence(id,G); return p.here===false&&p.back!=null; };
  const presCore=function(id,P,G){
    if(P.absentDates&&S.dayOfKey) for(const [a,b,away,kind,ex] of P.absentDates){ const d0=S.dayOfKey(a), d1=S.dayOfKey(b); if(d0!=null&&d1!=null&&G.day>=d0&&G.day<d1){ if(ex==='keepDating'&&P.home&&S.keepDating(id,G,d0)) return {here:false,away:'在'+P.home+'老家念書',kind:'home',home:P.home,keep:true};
      const xo=ex&&typeof ex==='object'?Object.assign({},ex):{}; if(Array.isArray(xo.exceptWd)){ const wd=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).wd%7:G.weekday, skip=xo.exceptWd.includes(wd); delete xo.exceptWd; if(skip) continue; }   /* exceptWd：這幾個星期幾人在臺北（柏翰寒暑假每週四搭客運上來總圖，AA_197 1-4；HOLIDAY-PRESENCE-1021）。星期照 G.day 算、不看 G.weekday（邀約只給 {day}）；結果不帶 exceptWd */
      if(typeof xo.when==='function'){ const w=xo.when; delete xo.when; let ok=false; try{ ok=!!w(G,id); }catch(e){ console.warn('presence when',id,e); } if(!ok) continue; }   /* when：這一筆有條件（芷若曼谷那幾天＝7/3 她和子晴交往中，BB 10-22 09:27）；不成立就看下一筆。結果不帶 when */
      return Object.assign({here:false,away:away||'',kind:kind||'abroad',back:d1},xo); } }   /* keepDating：AA_276 第 4 節，消失期開始時和玩家交往中＝只有玩家聯絡得到（在老家）*/   /* 用日期算的不在（交換：以安 2028-01-08～07-15 在日本、學姊 2028-01-05 起在美國，AA_158 第 4 節；學期中間出發、放假也算）*/
    if(P.afterFrom&&S.dayOfKey){ const d=S.dayOfKey(P.afterFrom); if(d!=null&&G.day>=d){ const A=P.away||{}, K=P.kinds||{}; return {here:false,away:A.after||'',kind:K.after||'after'}; } }   /* afterFrom：until 那一學期的暑假裡，從這一天起就算「之後」（子晴 2028-07-10 起在工作室上班，AA_508 0-2 第 4 點）；absentDates 先看 */
    if(P.home&&(G.stage||'law')==='law'&&S.homeAway(G)&&!S.homeStay(P,G)){ const ht=P.homeText, hd=ht&&S.dayOfKey?S.dayOfKey(ht[0]):null; return {here:false,away:hd!=null&&G.day>=hd?ht[1]:'寒暑假在'+P.home+'的家',kind:'home',home:P.home}; }   /* AA_276 第 1 節：可昕高雄、沛珊台中；手機照常，偶遇、校園、當面約都不在臺北。homeText＝[從哪一天起, 手機寫的字]（沛珊放榜後「在台中」，AA_282 第 1 節）*/
    const t=S.termAt(G.day); if(!t) return {here:true}; const i=TERM_ORDER.indexOf(t);
    const A=P.away||{}, K=P.kinds||{}, CI=P.cities||{}; if(P.from&&i<TERM_ORDER.indexOf(P.from)) return {here:false,away:A.before||'',kind:'before'}; if(P.until&&i>TERM_ORDER.indexOf(P.until)){ const ct=CI[t]||CI.after; return Object.assign({here:false,away:A[t]||A.after||'',kind:K[t]||K.after||'after'},ct?{city:ct}:{}); }   /* cities：kind 'city'＝在臺灣的別的城市念書（沛珊大三起在台南，AA_282）：約不到臺北的地點，可以去那個城市找她（hometown3d.js 的 S.key 用 city）*/
    if(P.absent&&P.absent.includes(t)) return {here:false,away:A[t]||'',kind:K[t]||'absent'}; return {here:true}; };   /* kinds：覆寫原因的種類（taipei＝在臺北、不在台大：沛珊大二下起、子晴大四，BB_163——校園作息換成她那份、邀約照她的規則，不先擋）*/   /* kind：手機「約不了的原因」（AA_125 第 1 節：交換＝國外、until 過了＝畢業）*/
  /* 交換路線（SYS-10；AA_158，AA-B 2026-10-16）：G.flags.EXCHANGE_ROUTE＝'TW'／'JP'／'US'（大三上第 11 週志願表，AA_30 場景 0；AA_90 的值）。
     準備出發、在國外、回來了都用日期算，不另存。台灣路線的事件寫「不是 JP、也不是 US」（未決定也算在台灣）。
     日期（AA_260 第 4 節第 1 點 9d00435c、AA_201、AA_213、BB_204 4c：使用者 2026-10-17 改期）：JP 2/20 退宿、3/25 出發（和以安同一班）、8/5 返台；US 大四上 8/2 出發、12/23 回來（學姊同一班），
     X1 退宿「2028-07 下旬」（AA_144 第 12 行；7/25（二），LAWWW 排的日子，AA_355 第 2 節照用）。舊日期（JP 1/7～7/15、US 1/18～6/24，AA_158 第 3 節）作廢。
     時差：日本 +1；美國（印第安納，東部時間）夏令 −12，2028-11-05 起冬令 −13 */
  const ROUTE_DATES={ JP:{out:'2028-02-20',dep:'2028-03-25',arrive:'2028-03-25',ret:'2028-08-05',place:'日本關西的大學城'}, US:{out:'2028-07-25',dep:'2028-08-02',arrive:'2028-08-02',ret:'2028-12-23',place:'美國印第安納'} };
  S.ROUTE_DATES=ROUTE_DATES;
  /* 以安的戀愛前置（AA-B 2026-10-16 20:33；交換志願表 V4-E10，AA_30 場景 0、AA_113 第 6 節）：判斷的那一刻四項都成立才算，不成立一律演友情版、不給暗示。
     a 公法讀書會：加入（PUBLIC_LAW_GROUP／CLUB_public_law_group）而且聽完至少 3 次（活動出席紀錄 G.acts.att 的 public_law_group@日）；
     b 認真和她辯過至少 2 次：AN_APPEAL 是 rule／case／ask（listen 不算）、AN9_ARGUED、AN11_ARGUED（新 9、新 11 還沒有事件，旗標等那兩件做了才會有）；
     c 以安的階段 FRIEND 以上；d 兩人都單身：祐廷沒有任何 dating_*（可昕也算），而且距離上一段分手至少 28 天（AA_128「收拾過」）；以安在遊戲裡沒有伴侶。
     why＝true 回傳每一項（測試、除錯用）*/
  S.breakupDaysAgo=function(G){ const R=(G.flags&&G.flags.romance)||{}; let last=null;
    for(const id in R) for(const h of ((R[id]&&R[id].history)||[])){ if(!h||h.ev!=='end') continue; let d=typeof h.day==='number'?h.day:null;
      if(d==null&&typeof h.at==='string'){ const m=/^(Y\dS\d)W(\d+)$/.exec(h.at), m2=/^D(-?\d+)$/.exec(h.at); if(m){ const t=termDay(m[1],+m[2],7); d=t!=null?t:(termDay(m[1],+m[2],1)!=null?termDay(m[1],+m[2],1)+6:null); } else if(m2) d=+m2[1]; }   /* 舊紀錄只有學期週次：當作那一週的最後一天（保守）*/
      if(d!=null&&(last==null||d>last)) last=d; }
    return last==null?Infinity:G.day-last; };
  S.anRomancePre=function(G,why){ const F=(G&&G.flags)||{}; const A=(G.acts&&G.acts.att)||{}; let attend=0;
    for(const k in A) if(k.indexOf('public_law_group@')===0&&(A[k]&&(A[k].end||'full')==='full')) attend++;
    const group=!!(F.PUBLIC_LAW_GROUP||F.CLUB_public_law_group)&&attend>=3;
    const argued=(['rule','case','ask'].includes(F.AN_APPEAL)?1:0)+(F.AN9_ARGUED?1:0)+(F.AN11_ARGUED?1:0);
    const ST=typeof SOCIAL!=='undefined'&&SOCIAL.STAGES?SOCIAL.STAGES:[], st=typeof SOCIAL!=='undefined'&&SOCIAL.stage?SOCIAL.stage('heroine_01'):'STRANGER';
    const friend=ST.indexOf(st)>=ST.indexOf('FRIEND')&&ST.indexOf('FRIEND')>=0;
    const dating=Object.keys(F).filter(k=>/^dating_/.test(k)&&F[k]===true), since=S.breakupDaysAgo(G), single=!dating.length&&since>=28;
    const ok=argued>=2&&friend&&single;   /* a 項（公法讀書會＋聽完 3 次）拿掉：讀書會不是門檻，是她心動的地方（AA_113 L123–124、AA_215；AA-C 2026-10-17 07:50，BB_191 §8-6 第 1 點）；group、attend 只留給除錯 */
    return why?{ok,group,attend,argued,friend,stage:st,single,dating,since}:ok; };
  S.route=G=>{ const r=G&&G.flags&&G.flags.EXCHANGE_ROUTE; return r==='JP'||r==='US'||r==='TW'?r:null; };
  S.routeAbroadRoute=G=>{ const r=S.route(G); return r==='JP'||r==='US'?r:null; };   /* 國外路線（JP／US）；台灣、未決定＝null */
  S.abroad=function(G){ const R=ROUTE_DATES[S.routeAbroadRoute(G)]; if(!R) return false; const d0=S.dayOfKey(R.dep), d1=S.dayOfKey(R.ret); return d0!=null&&d1!=null&&G.day>=d0&&G.day<d1; };   /* 出發日 ≦ 今天 ＜ 返台日 */
  S.movedOut=function(G){ const R=ROUTE_DATES[S.routeAbroadRoute(G)]; if(!R) return false; const d0=S.dayOfKey(R.out), d1=S.dayOfKey(R.ret); return d0!=null&&d1!=null&&G.day>=d0&&G.day<d1; };   /* X1 退宿以後到返台：台灣沒有宿舍 */
  S.routeWeek=function(G){ const R=ROUTE_DATES[S.routeAbroadRoute(G)]; if(!R||!S.abroad(G)) return null; const a=S.dayOfKey(R.arrive); return Math.floor((G.day-a)/7)+1; };   /* 國外事件的週次：(今天 − 抵達日) ÷ 7 ＋ 1 */
  S.tzOffset=function(G,day){ if(day==null) day=G.day; { const v=typeof VAC!=='undefined'&&VAC.tzAt?VAC.tzAt(G,day):null; if(v!=null) return v; }   /* 寒暑假出國途中：遊戲時鐘是當地時間（AA_478 第 7 節，src/vac3d.js）*/ const r=S.routeAbroadRoute(G); if(!r||!S.abroad(Object.assign({},G,{day}))) return 0; if(r==='JP') return 1; const std=S.dayOfKey('2028-11-05'); return std!=null&&day>=std?-13:-12; };   /* 手機、視訊的當地時間＝台灣時間＋這個數（小時）*/
  /* 1A-02（AA_315；BB_204 第 1、5 節、AA_253 第 2 節；使用者 2026-10-17 經 BB-C）：交換路線不讓玩家選——志願表截止 2027-11-18（四）12:00 那一刻照「交往中」定（S.routeWatch，見下面「截止那一刻」）：
     和學姊（heroine_05）＝US、和以安（heroine_01）＝JP、都沒有（只和可昕、芷若、子晴、語彤、沛珊交往也算）＝TW。好感、曖昧不算；定了以後任何事（分手、復合、新的交往）都不改。
     兩段都在交往的，第 10 週的攤牌（ev_two_hearts_cafe）已經選了一個；萬一還是兩段（測試存檔）照學姊那一列。
     舊存檔：截止以後還沒有路線的照同一個規則補，但 2028-02-20（日本路線退宿日）以後一律 TW（來不及準備）；
     用宿舍舊選單選過、還沒到截止的清掉重來（routeMigrate：那是系統選單，不是劇情選擇）；截止以後已經有路線的照原本的。
     截止那一刻（BB-C 10-20 回報兩個 bug）：原本「12:00 以後第一次 S.tick」才定——上課坐著（E.player.busy）、劇情裡（GM.D.active）、睡覺（S._sleeping）S.tick 第一行就 return，
     空下來以前交往狀態變了就定錯（11/18 11:54 上課坐到 13:13、13:15 和以安開始交往 → 定成 JP，應該 TW）；舊選單的 US 也要等 S.tick 才清（讀檔後坐著＝沒清，過了截止就永遠留著）。
     改成 S.routeWatch（routeMigrate＋routeDecide）在每一個會讓時間跨過截止、或會改交往狀態的地方先跑：主迴圈每一格（不管忙不忙，game3d.js frame）、GM.advance、
     讀檔（game3d.js migrate）、ROM.start／ROM.end 改狀態之前（ROM.BEFORE）、S.tick。時間跳動本身不改交往狀態，所以跨過截止以後第一次 routeWatch 看到的就是 12:00 那一刻的狀態。
     另外 routeFor 不算 ROM 記得是截止以後才開始的那一段（sinceDay＋sinceH；舊紀錄只有 sinceDay：那一天以後才算），補舊存檔時也照截止那一刻。*/
  const ROUTE_DL='2027-11-18';
  const routeDlAt=()=>{ const d=S.dayOfKey(ROUTE_DL); return d==null?null:d*24+12; };   /* 截止的絕對時間（day*24+hour）*/
  S.routeFor=function(G){ const F=(G&&G.flags)||{}, R=F.romance||{}, dl=routeDlAt();
    const late=id=>{ const r=R[id]; if(!r||r.sinceDay==null||dl==null) return false; return r.sinceH!=null?r.sinceDay*24+r.sinceH>=dl:r.sinceDay*24>dl; };   /* 截止以後才開始的這一段不算（12:00 整開始的也不算）*/
    const on=id=>(F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'))&&!late(id); return on('heroine_05')?'US':on('heroine_01')?'JP':'TW'; };
  S.routeDue=function(G){ const dl=routeDlAt(); return dl!=null&&G.day*24+(+G.hour||0)>=dl; };   /* 用絕對時間：同一個 G.day 的 G.hour 過了 24（凌晨）也算 */
  S.routeMigrate=function(G){ const F=G&&G.flags; if(!F||!F.EXCHANGE_ROUTE||F.EXCH_RULE||F.EXCH_APPLIED_DAY==null||S.routeDue(G)) return false; delete F.EXCHANGE_ROUTE; delete F.EXCH_APPLIED_DAY; return true; };
  S.routeDecide=function(G){ const F=G&&G.flags; if(!F||F.EXCHANGE_ROUTE||(G.stage||'law')!=='law'||!S.routeDue(G)) return null; const late=S.dayOfKey('2028-02-20'); const r=late!=null&&G.day>=late?'TW':S.routeFor(G);
    F.EXCHANGE_ROUTE=r; F.EXCH_APPLIED_DAY=G.day; F.EXCH_RULE=1; return r; };
  S.routeBackfill=G=>!!S.routeDecide(G);   /* 舊名字（AA_158 的補 TW）：現在照 routeDecide 的規則補 */
  /* 每一格、跳時間、讀檔、交往狀態改變之前都叫（見上面「截止那一刻」）：舊選單選過、還沒截止的清掉；截止了、還沒有路線就定。很便宜（定了以後兩個判斷就回）*/
  S.routeWatch=function(G){ const F=G&&G.flags; if(!F) return null; S.routeMigrate(G); return !F.EXCHANGE_ROUTE&&G.day>=0?S.routeDecide(G):null; };
  if(typeof ROM!=='undefined'&&Array.isArray(ROM.BEFORE)&&!ROM.BEFORE.includes(S.routeWatch)) ROM.BEFORE.push(S.routeWatch);   /* ROM.start／ROM.end 改狀態之前：截止已經過了、還沒定的，先照改之前的狀態定 */
  /* 1A-01（AA_315；BB_202 4-1、4-2）：四年累積的職涯傾向——只讀遊戲已經記下來的東西；不上畫面、不鎖任何事件、不擋選項、不改關係
     （使用者 10-20：「只定義劇情選項與結局如何讀取，不要擅自增加新的數值玩法」）。只有四處讀：主線 7 選項②（只有 C 的玩家才有）、尾聲祐廷的最後一句、
     尾聲朋友那句、?dev。每次叫都重算，不存結果。
     A 幫人：法服週六 LAWCLUB_SAT_VISITS ×1、寒暑假 C16 法扶實習 ×5、C09 海外志工 ×5、C02 隊輔 ×3、YT_LEASE_HELP（語彤家的租約）+3；
     B 研究：讀書會出席（public_law_group@、舊存檔的 lawclub_study@；中途離開不算）×1、法律系起自習每滿 10 小時 ×1、
       GRAD_SCHOOL_DISCUSSION（每人一件）、grad_read_done（學姊給的文章）各 +2、C10 海外暑期課 ×4；
     C 跨領域：子晴的 PLAYTESTED、CONTEST_DAY 各 +2、C08／C11／C12 ×3、交換（JP／US）回到臺灣以後 +6、法律系那幾年及格的通識（kind general）×1。
     決定：最高的；平手比大四那一年（總分 − CAREER_Y4_BASE，沒有就跳過）；再平手 B → A → C；三項都是 0＝B。
     起點：STUDY_AT_LAW＝第一次在法律系那一刻的自習時數（經濟系那一年讀的不算；舊存檔從第一次讀檔起算）；CAREER_Y4_BASE＝大四上第 1 週第一次 tick 的三個總分（S.tick）*/
  S.careerLean=function(G){ const F=(G&&G.flags)||{}, V=(G&&G.vac&&G.vac.reg)||{}, att=(G&&G.acts&&G.acts.att)||{};
    const vac=id=>{ let n=0; for(const k in V) if(k.split('@')[0]===id&&V[k]==='done') n++; return n; };
    let grp=0; for(const k in att){ if(!/^(public_law_group|lawclub_study)@-?\d+$/.test(k)) continue; const a=att[k]; if(a&&(a.end||'full')==='full') grp++; }
    const study=Math.max(0,((G&&G.stats&&G.stats.study)||0)-(+F.STUDY_AT_LAW||0));
    const has=(id,t)=>typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(id,t);
    let gradTalk=0; for(const id in (typeof CHARACTERS!=='undefined'?CHARACTERS:{})) if(has(id,'GRAD_SCHOOL_DISCUSSION')) gradTalk++;
    const zq=['PLAYTESTED','CONTEST_DAY'].filter(t=>has('heroine_04',t)).length;
    const R=S.routeAbroadRoute(G), RD=R?ROUTE_DATES[R]:null, rd=RD?S.dayOfKey(RD.ret):null, back=rd!=null&&G.day>=rd;
    let ge=0; const GR=(G&&G.courses&&G.courses.grades)||{}; if(typeof COURSES!=='undefined'&&COURSES.list) for(const t in GR){ if(/^Y0/.test(t)) continue; const g=GR[t]||{}; for(const cid in g){ const c=COURSES.list.find(x=>x.id===cid); if(c&&c.kind==='general'&&g[cid]) ge++; } }
    const A=(+F.LAWCLUB_SAT_VISITS||0)+5*vac('C16')+5*vac('C09')+3*vac('C02')+(F.YT_LEASE_HELP?3:0);
    const B=grp+Math.floor(study/10)+2*gradTalk+(F.grad_read_done?2:0)+4*vac('C10');
    const C=2*zq+3*(vac('C08')+vac('C11')+vac('C12'))+(back?6:0)+ge;
    const sc={A,B,C}, mx=Math.max(A,B,C); let cand=['B','A','C'].filter(k=>sc[k]===mx);
    if(cand.length>1&&F.CAREER_Y4_BASE&&typeof F.CAREER_Y4_BASE==='object'){ const y4=k=>sc[k]-(+F.CAREER_Y4_BASE[k]||0); const m4=Math.max(...cand.map(y4)); cand=cand.filter(k=>y4(k)===m4); }
    return {A,B,C,top:cand[0]}; };
  /* 大三的劇情事實，到了時間一律記（AA_326；不論玩家在不在場、事件有沒有演——後面的閒聊階梯、事件在等這兩個旗標）：
     2-Y3-17 語彤續約：2027-11-24 15:30 RENT_RENEWED；2-Y3-20 語彤事件 13（週四空出來）：2027-12-16 20:00 YT_EV13（演過的另外記 YT_EV13_SEEN，事件包做）。
     2-Y3-09 颱風假 2027-10-13 在 calendar.js 的 TYPHOON；前一晚 20:00 的停課新聞照大一、大二的做法 */
  S.y3Facts=function(G){ const F=G.flags; if(!F||(G.stage||'law')!=='law') return; const at=(k,hh)=>{ const d=S.dayOfKey(k); return d!=null&&(G.day>d||(G.day===d&&h(G)>=hh)); };
    if(!F.RENT_RENEWED&&at('2027-11-24',15.5)) F.RENT_RENEWED=true; if(!F.YT_EV13&&at('2027-12-16',20)) F.YT_EV13=true;
    if(typeof PHONE!=='undefined'&&PHONE.at&&!PHONE.sent(G,'ty3_news')){ const ty=S.dayOfKey('2027-10-13'); if(ty!=null&&typeof CALENDAR!=='undefined'&&CALENDAR.typhoon(ty)&&G.day>=ty-1&&G.day<=ty) PHONE.at(G,ty-1,20,[{th:'sys',name:'新聞',text:'明天停止上班上課。'}],'ty3_news'); } };
  S.careerTick=function(G){ const F=G.flags; if((G.stage||'law')!=='law') return; S.y3Facts(G); if(F.STUDY_AT_LAW==null) F.STUDY_AT_LAW=(G.stats&&G.stats.study)||0;
    if(F.CAREER_Y4_BASE==null&&typeof CALENDAR!=='undefined'){ const t=CALENDAR.termOf(G.day); if(t&&t.id==='Y4S1'&&t.week===1){ const c=S.careerLean(G); F.CAREER_Y4_BASE={A:c.A,B:c.B,C:c.C}; } } };   /* 大四上第 1 週以後才讀檔、又沒有這個值的舊存檔：不補（平手跳過「比大四」）*/
  /* 1A-02 第 3 節（AA_315；台詞照 AA_253 第 3、4 節）：大三上第 10 週同時和以安、學姊交往，兩人都還不知道（ROM.knowsOf 兩邊都沒有）——
     11/10 那晚睡著以後演法圖相遇（events.js ev_an_sis_meet_lawlib，祐廷不在場）→ 11/11 22:00 兩則私訊、22:30 兩點半 Café 攤牌（ev_two_hearts_cafe，出遊 must）；
     只有「學姊。」／「以安。」，沒被選的那位分手（by her），被選的那位之後第一次說話時記得一次。已經被一般來源發現過的不演（照當時的結果）。*/
  const TH_D10='2027-11-10', TH_D11='2027-11-11';
  const bothHearts=G=>{ const F=(G&&G.flags)||{}; return F.dating_heroine_01===true&&F.dating_heroine_05===true&&(G.stage||'law')==='law'; };
  const heartsUnknown=G=>typeof ROM==='undefined'||(!ROM.knowsOf(G,'heroine_01','heroine_05')&&!ROM.knowsOf(G,'heroine_05','heroine_01'));
  S.twoHeartsDue=function(G){ const d=S.dayOfKey(TH_D10); return d!=null&&G.day===d&&G.hour>=17&&G.flags.TWO_HEARTS_MET==null&&bothHearts(G)&&heartsUnknown(G); };   /* 睡著那一刻（過午夜也還是 11/10 那天：hour 24 以上）*/
  S.twoHeartsMet=function(G){ const F=G.flags; if(F.TWO_HEARTS_MET!=null) return; if(typeof ROM!=='undefined'){ ROM.learn(G,'heroine_01','heroine_05','lawlib_meet'); ROM.learn(G,'heroine_05','heroine_01','lawlib_meet'); } F.TWO_HEARTS_MET=G.day; };
  S.twoHeartsCafeDue=function(G){ const d=S.dayOfKey(TH_D11), F=G.flags; return d!=null&&G.zone==='cafe'&&G.day===d&&G.hour>=22&&F.TWO_HEARTS_MET!=null&&!F.TWO_HEARTS_PICK&&bothHearts(G); };
  S.twoHeartsPick=function(G){ const F=G.flags, pick=F.TWO_HEARTS_PICK; if(!pick) return; const other=pick==='heroine_05'?'heroine_01':'heroine_05'; F.TWO_HEARTS_DAY=G.day;
    if(typeof ROM!=='undefined'&&ROM.end(G,other,'two_hearts')){ const R=ROM.get(G,other); R.by='her'; R.endedDay=G.day; R.discovered=G.day; } };   /* BB_204 第 3 節：ended、by her、DISCOVERED、ENDED_DAY */
  S.TWO_HEARTS_ECHO={heroine_05:'那天的事，我不會再提。可是我記得。',heroine_01:'那天的事，我不會再問了。'};
  S.twoHeartsEchoDue=(G,id)=>{ const F=(G&&G.flags)||{}; return F.TWO_HEARTS_PICK===id&&!F.TWO_HEARTS_ECHO&&F.TWO_HEARTS_DAY!=null&&G.day>F.TWO_HEARTS_DAY&&F['dating_'+id]===true; };   /* 這一次說話要說那一句嗎（只讀；src/privtalk3d.js 只在要說的時候問旁邊有沒有人）。S.twoHeartsDue 是 11/10 法圖相遇那一場，不一樣 */
  S.twoHeartsEcho=async function(GM,id,who){ const G=GM.G, F=G.flags; if(!S.twoHeartsEchoDue(G,id)) return false;
    F.TWO_HEARTS_ECHO=true; await GM.say(who,S.TWO_HEARTS_ECHO[id],{expr:'neutral'}); return true; };   /* 之後第一次說話（攤牌那天以後），只一次；後來分手了就不說 */
  /* ---------- 1A-04 主線 6　感冒的那一週（AA_315；AA_12 主線 6、AA_180 2-5、BB_98 2-4／9-4、AA_121 CG-5；台詞照 AA_315 第 3 節，不改字）----------
     第 2 節：10/23 起床那一刻判斷——交往中（可昕也算）、語彤／阿哲／以安／子晴／學姊／（有 SUNDAY_SUPPER 的）阿凱好朋友以上、在麵店團而且阿哲／Alison／柏翰好朋友以上，任一項＝一般版：
     起床（起床選單之前）打噴嚏、選要不要說（3-1，回覆當下進來）；10/24（日）21:00 只打電話的人、21:30 宿舍：有人要來＝下樓到交誼廳（3D 交誼廳＋立繪），照 3-2 的表出場，
     最熟的人問「那一句」（CG 照 3-3 的四個條件）；沒有人＝3-5（睡到隔天中午）；10/25 燒退（3-7）；10/26 18:30 可昕（3-4）。
     都不成立＝很少交會版：沒有感冒，期中最後一科考完那天 19:00 麵店、沒去 22:00 私訊（3-6）。名單 S.coldWeekCast(G)（第 4 節）。不扣分、不扣體力、不鎖任何事件（第 7 節第 5 點）。
     人在臺北的家：10/23 在家醒來照樣打噴嚏、10/24 18:00 提早回宿舍（home3d.js）；睡著的：10/24 21:00（要打電話的人）、21:30 醒來（sleepNow 的 S.lawWakeAt）。 */
  const CW_D23='2027-10-23', CW_D24='2027-10-24', CW_D25='2027-10-25', CW_D26='2027-10-26';
  const CW_NM={heroine_01:'以安',heroine_02:'芷若',heroine_03:'語彤',heroine_04:'子晴',heroine_05:'學姊',classmate_peishan:'沛珊',kexin:'可昕'};   /* 3-1「跟{她}說」代進去的名字、電話的對話框 */
  const CW_LOVE=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  const CW_AWAY=['heroine_02','classmate_peishan'];   /* 第 0 節：人不在臺北——芷若大三上在英國、沛珊大三起在台南 */
  const CW_ORDER=['heroine_03','heroine_05','zhe','yu','classmate_bohan','heroine_01','kai','heroine_04'];   /* 3-2 表上（交往中那一列以外）的出場順序：平手時用 */
  const CW_LOUNGE={x:7.6,z:4.6,yaw:Math.PI/2,lv:0}, CW_ROOM={x:0,z:2.4,yaw:Math.PI};   /* 宿舍一樓交誼廳（長桌和沙發之間，dorm_layout.js）；房間 */
  const cwSt=id=>typeof SOCIAL!=='undefined'&&SOCIAL.stage&&SOCIAL.STAGES?SOCIAL.STAGES.indexOf(SOCIAL.stage(id)):-1;
  const cwAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&cwSt(id)>=SOCIAL.STAGES.indexOf(lv);   /* 第 0 節：好朋友以上＝SOCIAL.stage 在 CLOSE_FRIEND 以上 */
  const cwSum=id=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.rel) return 0; const r=SOCIAL.rel(id); return ['fam','trust','aff','resp','comf','rom'].reduce((a,k)=>a+(+r[k]||0),0); };   /* 關係數值總和（第 4 節第 3、4 點）*/
  const cwDating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const cwPartners=G=>{ const s=new Set(typeof ROM!=='undefined'&&ROM.partners?ROM.partners(G):[]); for(const id of CW_LOVE) if(cwDating(G,id)) s.add(id); return [...s]; };
  const cwHasMate=(G,id)=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; return !!(c&&c.partner&&S.partnerOn(G,c.partner)); };   /* 她自己有伴侶（characters.js 的 partner，例：Alison 大二下起）*/
  const cwCrack=(G,id)=>{ const k=typeof ROM!=='undefined'&&ROM.CRACK?ROM.CRACK[id]:null, d=k&&G.flags?G.flags[k+'_DAY']:null; return d!=null&&G.day-d<=14; };   /* 最近 14 天內裂縫增加過（romance3d.js 的 crack 記 <人物>_CRACK_DAY）*/
  const cwDone=(G,id)=>{ const E=G.events||(G.events={done:{},last:{},count:0}); E.done=E.done||{}; E.last=E.last||{}; E.done[id]=(E.done[id]||0)+1; E.last[id]=G.day; };   /* 事件 id 記成演過（別的事件可以用 events 條件讀）*/
  const cwWho=id=>({name:typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id,charId:id});
  S.coldWeekGeneral=function(G){ if(cwPartners(G).length) return true; const cf=id=>cwAt(id,'CLOSE_FRIEND');
    if(['heroine_03','zhe','heroine_01','heroine_04','heroine_05'].some(cf)) return true; if(cf('kai')&&SOCIAL.has('kai','SUNDAY_SUPPER')) return true;
    return !!(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')&&['zhe','yu','classmate_bohan'].some(cf)); };
  /* 3-2 每個人那一句（被告知／沒被告知照 COLD_WEEK_TOLD）。[說話的人（null＝旁白）, 台詞] */
  const CW_PARTNER={heroine_01:t=>[...(t?[]:[['heroine_01','……你為什麼不說？']]),['heroine_01','我幫你排好了。'],[null,'（她把一張讀書計畫表放在矮桌上。這週那一格只寫了兩個字：「睡覺」。）']],
    heroine_03:t=>[['heroine_03',t?'嗯。阿姨煮的粥。我跟她說是你，她多放了薑。':'嗯。阿姨煮的粥。……你為什麼不說？']],
    heroine_05:(t,C)=>[...(t?[]:[['heroine_05',C&&(C.visitors||[]).includes('heroine_03')?'語彤說你兩天沒出門。':'你兩天沒出門了吧。……我猜的。']]),   /* AA_376 #17：語彤知道（她有來＝送湯那一條的條件）才說「語彤說」；不然她是猜的 */
     ['heroine_05','粥。還是熱的。你先吃，我坐一下就走。'],[null,'（你吃粥的時候，她把你帶下來的講義疊好，沒有翻開。）'],['heroine_05','明天早上我傳訊息給你。有回就好。']],
    heroine_04:t=>[['heroine_04',t?'你說你感冒。我帶了兩樣東西。':'你兩天沒回我訊息。我還以為你被當了。']]};
  const CW_GROUP={zhe:'滷味。我跟老闆說是病人吃的，他多給一顆蛋。',yu:'面紙。你鼻子好紅。',classmate_bohan:'刑訴的筆記。我多印了一份。',heroine_01:'……喉糖。一天不要吃超過五顆。'};
  const CW_SNEEZE={kexin:['幾度？','量了再跟我說。','……我下週也期中，二十六號考第一科。'],   /* AA_376 #14：10/23 是週六，10/26 在下週 */
   heroine_01:['量體溫了嗎？','明天晚上我過去。'],heroine_03:['嗯。','明天帶粥過去。'],heroine_05:['……知道了。今天先睡。'],
    heroine_04:['感冒？','你等一下。我明天過去。'],heroine_02:['我這邊是半夜。','你吃藥了嗎？……明天醒來，跟我說一聲。'],classmate_peishan:['……我在台南。','你多喝水。睡前也喝。']};
  /* 第 4 節：誰知道、誰能來、誰問。回傳 {visitors（照 3-2 的出場順序）, rows（每個人是哪一列）, asker（問「那一句」的人，沒有＝null）, partner（親自來的交往對象）,
     calls（當晚只打電話的交往對象）, kexin（'told'／'found_out'／null）, soup（2b 學姊的湯）, drop（第 5 點：只有她一位、她不坐下）, cg（3-3）, told} */
  S.coldWeekCast=function(G){ const F=(G&&G.flags)||{}, told=F.COLD_WEEK_TOLD||'none', cf=id=>cwAt(id,'CLOSE_FRIEND'), P=cwPartners(G), has=(id,t)=>typeof SOCIAL!=='undefined'&&SOCIAL.has(id,t);
    const out={visitors:[],rows:{},asker:null,partner:null,calls:[],kexin:null,soup:false,drop:null,cg:false,told};
    if(P.includes('kexin')) out.kexin=told==='kexin'?'told':'found_out';   /* 可昕 10/24 不能來，10/26 來（3-4）*/
    const can=P.filter(id=>!CW_AWAY.includes(id)&&CW_PARTNER[id]);   /* 能親自來的交往對象：在臺北（芷若、沛珊只有 3-1 那則回覆）*/
    let pt=can.includes(told)?told:null; if(!pt&&can.length) pt=can.slice().sort((a,b)=>cwSum(b)-cwSum(a))[0];   /* 第 3 點：被告知的那位；沒被告知、好幾位＝關係數值總和最高 */
    if(pt){ out.partner=pt; out.rows[pt]='partner'; out.visitors.push(pt); } out.calls=can.filter(id=>id!==pt);
    if(!P.includes('heroine_03')&&cf('heroine_03')){ out.rows.heroine_03='yt'; out.visitors.push('heroine_03'); }   /* 語彤：好朋友以上，不管有沒有說都會知道 */
    out.soup=out.visitors.includes('heroine_03')&&!P.includes('heroine_05')&&cwAt('heroine_05','FRIEND');   /* 2b：學姊從語彤那裡知道（語彤有來才有）*/
    if(told==='group'&&typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')) for(const id of ['zhe','yu','classmate_bohan','heroine_01']) if(!P.includes(id)&&cf(id)){ out.rows[id]='group'; out.visitors.push(id); }   /* 群組說了：群組裡好朋友以上 */
    if(!out.rows.zhe&&cf('zhe')){ out.rows.zhe='zhe'; out.visitors.push('zhe'); }   /* 3b 阿哲：住宿舍，自己發現 */
    if(has('kai','SUNDAY_SUPPER')){ out.rows.kai='kai'; out.visitors.push('kai'); }   /* 阿凱：室友會傳訊息給他 */
    if(!P.includes('heroine_04')&&cf('heroine_04')){ out.rows.heroine_04='zq'; out.visitors.push('heroine_04'); }   /* 子晴：兩天沒回訊息 */
    if(out.visitors.length===1){ const v=out.visitors[0], c=typeof CHARACTERS!=='undefined'&&CHARACTERS[v]; if(v!==pt&&c&&c.gender==='f'&&(P.length||cwHasMate(G,v))){ out.drop=v; out.visitors=[]; } }   /* 第 5 點：有伴侶的人不單獨來（不包括祐廷的交往對象本人）*/
    const V=out.visitors, best=L=>L.slice().sort((a,b)=>(cwSt(b)-cwSt(a))||(cwSum(b)-cwSum(a))||(V.indexOf(a)-V.indexOf(b)))[0]||null;
    if(pt) out.asker=cwCrack(G,pt)?best(V.filter(id=>id!==pt)):pt; else out.asker=best(V);   /* 第 4 點：在場的交往對象；最近 14 天有裂縫＝在場最熟的朋友（沒有朋友在＝沒有人問，照 3-5）*/
    out.cg=!pt&&['zhe','yu','classmate_bohan'].every(id=>out.rows[id]==='group')&&V.length>=3;   /* 3-3：一般版、三位群組來的都在、交往對象不在、不是只有一兩位 */
    return out; };
  S.coldWeekLines=function(G,id,C){ C=C||S.coldWeekCast(G); const row=C.rows[id];
    if(row==='partner') return CW_PARTNER[id](C.told===id,C); if(row==='yt') return [['heroine_03','嗯。阿姨煮的粥。不要問我怎麼知道的。']]; if(row==='group') return [[id,CW_GROUP[id]]];
    if(row==='zhe') return [['zhe',S.knows('heroine_01',G)?'你的筆記我幫你借了。小安的，她叫我跟你說不准還。':'刑訴的筆記我幫你印了。後天才考，不要慌。']];   /* 第 4 節第 7 點：「小安的筆記」只給認識以安的 */
    if(row==='kai') return [['kai','你室友傳訊息給我說你要死了。我帶泡麵。']];
    if(row==='zq'){ const q=!!(G.events&&G.events.done&&G.events.done.ev_ziqing_secret_game)||(typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_04','PLAYTESTED')); return [['heroine_04','你兩天沒回我訊息。我還以為你被當了。'],[null,'（她打開筆電）'],['heroine_04',q?'先看這個。測試版。':'先看這個。期末的作業。']]; }   /* Q6＝ev_ziqing_secret_game（PLAYTESTED）；Q8b 還沒有事件 */
    return []; };
  /* 「那一句」（3-2）：選項都是好答案，不加分、不記傾向；第 4 個＝吃完再問一次（這次沒有第 4 個）。學姊分兩句（BB_98 2-4）、可昕 3-4 的兩句、麵店版（3-6）用通用的 */
  const CW_Q='你每次都在幫別人查。你自己呢？你想用法律做什麼？';
  const cwQLines=(id,how)=>how==='kexin'?['你每次都在幫別人查。','你自己呢？你想用法律做什麼？']:(how!=='noodle'&&id==='heroine_05')?['你每次都在幫別人查。你自己呢？','你想用法律做什麼？']:[CW_Q];
  const cwRent=G=>(typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_03','RENT_RUMOR'))||!!(G.events&&G.events.done&&G.events.done.ev_yt_lease_class);   /* 看過語彤家房東的事（RENT_RUMOR）或 1B-02 演過 */
  S.coldWeekOpts=function(G,again){ const L=[{t:cwRent(G)?'「我想讓麵店那種事，每次都有人幫得上忙。」':'「我想讓遇到事情的人，旁邊有一個看得懂的人。」',k:'help'},{t:'「我想知道條文為什麼是這樣寫的。小時候看不懂，現在想看得更深。」',k:'why'},{t:'「我想知道法律以外，大家是怎麼過日子的。」',k:'life'}];
    if(!again) L.push({t:'「……我想先吃東西。」',k:'food'}); return L; };
  const CW_AFTER={kexin:'好。那你先把粥吃完。',heroine_01:'好。這句我會記得。',heroine_03:'嗯。……那你要先好起來。',zhe:'好。考完再跟我講一次。',heroine_04:'好。那你先把這瓶喝完。',kai:'……你發燒講話比較像人。',yu:'好啦。那你先吃。',classmate_bohan:'……我會記得你今天說的。'};
  S.coldWeekAfter=(G,id)=>id==='heroine_05'?(cwDating(G,'heroine_05')?'……好。先吃，要冷了。':'……好。先喝湯，要冷了。'):(CW_AFTER[id]||null);
  const cwUnq=t=>String(t).replace(/^「|」$/g,'');
  async function cwAsk(GM,id,how){ const G=GM.G, F=G.flags, who=cwWho(id);
    for(const l of cwQLines(id,how)) await GM.say(who,l);
    let O=S.coldWeekOpts(G,false), k=await GM.choose(O.map(o=>({t:o.t}))), o=O[k]||O[0];
    if(o.k==='food'){ await GM.say(who,'好，那吃完再說。'); await GM.say(null,'（你吃完了。）'); await GM.say(who,CW_Q); O=S.coldWeekOpts(G,true); k=await GM.choose(O.map(q=>({t:q.t}))); o=O[k]||O[0]; }
    F.COLD_WEEK_ANSWER=o.k; F.COLD_WEEK_ASKER=id; if(typeof SOCIAL!=='undefined') SOCIAL.remember(id,'BEING_HEARD',cwUnq(o.t));
    const a=S.coldWeekAfter(G,id); if(a) await GM.say(who,a); return o.k; }
  S._cwAsk=(GM,id,how)=>cwAsk(GM,id,how);   /* 測試用 */
  /* 3-1：10/23 起床（起床選單之前）。在家醒來的由 home3d.js 的選單呼叫（atHome）*/
  S.coldSneezeDue=function(G,atHome){ const F=(G&&G.flags)||{}, d=S.dayOfKey(CW_D23); if((G.stage||'law')!=='law'||d==null||G.day!==d||h(G)>=12||F.COLD_WEEK!=null) return false;
    const home=typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G); return atHome?home:(G.zone==='dorm'&&!home); };
  S.coldWeekSneeze=async function(GM){ const G=GM.G, F=G.flags; if(F.COLD_WEEK!=null) return false; const gen=S.coldWeekGeneral(G); F.COLD_WEEK=gen?'night':'noodle'; if(!gen){ F.COLD_WEEK_TOLD='none'; return false; }
    cwDone(G,'ev_cold_week_sneeze'); GM.sceneBegin(); try{ await GM.say(null,'（起床的時候，你打了三個噴嚏。）'); await GM.say(null,'（頭有點重。）');
      const O=cwPartners(G).filter(id=>CW_NM[id]).map(id=>({t:'（傳訊息跟'+CW_NM[id]+'說：我好像感冒了。）',id})); if(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')) O.push({t:'（在麵店團群組說一聲。）',id:'group'}); O.push({t:'（誰都不說。睡一下就好了。）',id:'none'});
      const k=await GM.choose(O.map(o=>({t:o.t}))), o=O[k]||O[O.length-1]; F.COLD_WEEK_TOLD=o.id; if(o.id==='kexin') F.KX_COLD_WEEK='told';
      if(typeof PHONE!=='undefined'&&o.id!=='none'){ const th=o.id==='group'?'g:noodle_team':'p:'+o.id; PHONE.post(G,{th,from:'player',who:null,text:'我好像感冒了。'});   /* 回覆是手機、當下進來 */
        await phoneScene(GM,th,o.id==='group'?[['zhe','收到'],['yu','多喝水。'],['classmate_bohan','刑訴筆記我有。']].map(([f,t])=>({from:f,text:t})):(CW_SNEEZE[o.id]||[]).map(t=>({from:o.id,text:t}))); if(GM.phoneBadge) GM.phoneBadge(); }
    } finally { GM.sceneEnd(); } if(GM.autosave) GM.autosave(); return true; };
  /* 錯過起床那一刻（讀檔、出遊、10/23 中午以後才進宿舍）：照第 2 節判斷，不演打噴嚏、誰都沒說 */
  S.coldWeekLate=function(G){ const F=G.flags, d=S.dayOfKey(CW_D23); if(F.COLD_WEEK!=null||(G.stage||'law')!=='law'||d==null||G.day<d||(G.day===d&&h(G)<12)) return false; F.COLD_WEEK=S.coldWeekGeneral(G)?'night':'noodle'; F.COLD_WEEK_TOLD='none'; return true; };
  /* 10/24 21:00：只打電話的人（可昕沒被告知＝3-4 那一通；其他在臺北、沒有親自來的交往對象＝「……你聲音怎麼了？」「好好睡。」）*/
  S.coldCallList=function(G){ const C=S.coldWeekCast(G), L=C.calls.slice(); if(C.kexin==='found_out') L.unshift('kexin'); return L; };
  S.coldCallDue=function(G){ const F=(G&&G.flags)||{}, d=S.dayOfKey(CW_D24); return (G.stage||'law')==='law'&&d!=null&&G.day===d&&G.hour>=21&&F.COLD_WEEK==='night'&&F.COLD_WEEK_CALLS==null&&F.COLD_WEEK_NIGHT==null; };
  S.coldWeekCalls=async function(GM){ const G=GM.G, F=G.flags; if(F.COLD_WEEK_CALLS!=null) return false; const L=S.coldCallList(G); F.COLD_WEEK_CALLS=L.slice(); if(!L.length) return false;
    GM.sceneBegin(); try{ for(const id of L){ const w={name:(CW_NM[id]||cwWho(id).name)+'（電話）'}; for(const t of (id==='kexin'?['……你聲音怎麼了？','你為什麼不說？','……我後天考完過去。']:['……你聲音怎麼了？','好好睡。'])) await GM.say(w,t); if(id==='kexin') F.KX_COLD_WEEK='found_out'; } }
    finally { GM.sceneEnd(); } return true; };
  /* 10/24 21:30（3-2）。人不在宿舍＝字卡「回宿舍」帶回房間（AA_176 R8 的字卡；人在家的 18:00 先回來，home3d.js）*/
  S.coldNightDue=function(G){ const F=(G&&G.flags)||{}, d=S.dayOfKey(CW_D24); return (G.stage||'law')==='law'&&d!=null&&G.day===d&&G.hour>=21.5&&F.COLD_WEEK==='night'&&F.COLD_WEEK_NIGHT==null; };
  S.coldHomeBackDue=function(G){ const F=(G&&G.flags)||{}, d=S.dayOfKey(CW_D24); if(!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))) return false; S.coldWeekLate(G); return (G.stage||'law')==='law'&&d!=null&&G.day===d&&G.hour>=18&&F.COLD_WEEK==='night'&&F.COLD_WEEK_NIGHT==null; };   /* home3d.js 的選單問（在家的時候也照第 2 節補判斷）*/
  S.coldWeekNight=async function(GM){ const G=GM.G, F=G.flags; if(!S.coldNightDue(G)) return false; if(F.COLD_WEEK_CALLS==null) await S.coldWeekCalls(GM);   /* 21:00 的電話還沒打（睡到 21:30、21:30 以後才回來）：先打 */
    F.COLD_WEEK_NIGHT=G.day; cwDone(G,'ev_cold_week_night'); const C=S.coldWeekCast(G); let sleep=false; F.COLD_WEEK_PRESENT=[];
    GM.sceneBegin(); try{
      if(G.zone!=='dorm'){ await GM.fade(true); if(G.zone!=='dorm_hall'&&GM.titleCard) await GM.titleCard('回宿舍','',2000); if(GM.enter) await GM.enter('dorm',Object.assign({},CW_ROOM)); await GM.fade(false); }
      if(typeof ADV!=='undefined') ADV.begin({background:'blur'});
      await GM.say(null,'（晚上九點半。你躺在床上，額頭燙得不像自己的。）');
      if(C.kexin==='told'){ await GM.say(null,'（外送的粥送到宿舍門口。）'); await phoneScene(GM,'p:kexin',[{from:'kexin',text:'我考完就過去。你先活著。'}]); F.KX_COLD_WEEK='told'; }   /* 3-4 被告知：外送的粥＋她的訊息 */
      if(C.drop){ const id=C.drop, L=S.coldWeekLines(G,id,C).filter(l=>l[0]).map(l=>({from:id,text:l[1]})); await phoneScene(GM,'p:'+id,[{from:id,text:'東西在舍監那裡。我先走了。'}].concat(L)); if(typeof SOCIAL!=='undefined') SOCIAL.remember(id,'HELPED','感冒那晚'); }   /* 第 4 節第 5 點：東西放在舍監室窗口、傳一則訊息就走，再接她那句的手機版 */
      if(!C.visitors.length){ await GM.say(null,'（沒有人敲門。你吃了一顆退燒藥，睡到隔天中午。）'); sleep=true; }   /* 3-5 */
      else { await GM.say(null,'（手機響了。你披了一件外套，下樓到交誼廳。）'); if(typeof ADV!=='undefined') ADV.end(); await GM.fade(true); if(GM.enter) await GM.enter('dorm_hall',Object.assign({},CW_LOUNGE)); await GM.fade(false);
        const V=C.visitors; F.COLD_WEEK_PRESENT=V.slice(); if(typeof ADV!=='undefined'){ ADV.preload(V); ADV.begin({background:'blur',right:{charId:V[0],expression:'neutral'}}); }
        for(const id of V){ for(const [sp,t] of S.coldWeekLines(G,id,C)) await GM.say(sp?cwWho(sp):null,t);
          if(id==='heroine_03'&&C.soup){ await GM.say(cwWho('heroine_03'),'學姊叫我拿來的。她說她不上來。'); await phoneScene(GM,'p:heroine_05',[{from:'heroine_05',text:'語彤說你病了。'},{from:'heroine_05',text:'湯喝完。然後睡覺。'}]); }   /* 2b：同時，學姊的手機 */
          if(typeof SOCIAL!=='undefined') SOCIAL.remember(id,'HELPED','感冒那晚'); }
        if(C.cg&&typeof ADV!=='undefined'&&ADV.cg) ADV.cg('cg_cold_week_friends');   /* 3-3：三位都說完、「那一句」之前 */
        if(C.asker) await cwAsk(GM,C.asker,'night');
        await GM.say(null,'（十點半。交誼廳的燈關了一半。你上樓的時候，手上還提著一個塑膠袋。）');
        if(typeof ADV!=='undefined') ADV.end(); await GM.fade(true); G.hour=Math.max(G.hour,22.5); if(GM.E) GM.E.hour=G.hour; if(GM.updateHUD) GM.updateHUD(); if(GM.enter) await GM.enter('dorm',Object.assign({},CW_ROOM)); await GM.fade(false); }
    } finally { if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); GM.sceneEnd(); }
    if(GM.memo) GM.memo('感冒的那一週'); if(GM.autosave) GM.autosave(); if(sleep) await sleepNow(GM,12); return true; };
  /* 3-7：10/25（一）第一次在房間醒來 */
  S.coldMorningDue=G=>{ const F=(G&&G.flags)||{}, d=S.dayOfKey(CW_D25); return d!=null&&G.day===d&&G.zone==='dorm'&&F.COLD_WEEK==='night'&&F.COLD_WEEK_D25==null; };
  S.coldWeekMorning=async function(GM){ const G=GM.G; G.flags.COLD_WEEK_D25=G.day; GM.sceneBegin(); try{ await GM.say(null,'（燒退了。喉嚨還有一點痛。）'); } finally { GM.sceneEnd(); } return true; };
  /* 3-4：10/26（二）18:30 可昕考完過來（被告知、或 10/24 自己發現的）。人在宿舍＝直接演；在外面＝出遊 must 帶到交誼廳 */
  S.coldKexinDue=G=>{ const F=(G&&G.flags)||{}, d=S.dayOfKey(CW_D26); return (G.stage||'law')==='law'&&d!=null&&G.day===d&&G.hour>=18.5&&(F.KX_COLD_WEEK==='told'||F.KX_COLD_WEEK==='found_out')&&F.KX_COLD_WEEK_SEEN==null&&cwDating(G,'kexin'); };
  S.coldWeekKexin=async function(GM){ const G=GM.G, F=G.flags; if(!S.coldKexinDue(G)) return false; F.KX_COLD_WEEK_SEEN=G.day; cwDone(G,'ev_cold_week_kexin'); const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'y3_cold_kexin'):null; if(q&&q.state==='planned') q.state='done';
    GM.sceneBegin(); try{ if(G.zone!=='dorm_hall'){ await GM.fade(true); if(GM.enter) await GM.enter('dorm_hall',Object.assign({},CW_LOUNGE)); await GM.fade(false); }
      const kx=cwWho('kexin'); if(typeof ADV!=='undefined'){ ADV.preload(['kexin']); ADV.begin({background:'blur',right:{charId:'kexin',expression:'neutral'}}); }
      if(F.KX_COLD_WEEK==='told'){ await GM.say(kx,'我考完了。你還活著，很好。'); await GM.say(kx,'（把一袋橘子放在交誼廳的矮桌上）予樂說感冒要吃橘子。我不知道有沒有根據。'); if(!F.COLD_WEEK_ASKER) await cwAsk(GM,'kexin','kexin'); }   /* 10/24 那晚沒有人問：由她問 */
      else { await GM.say(kx,'（把一袋橘子放在交誼廳的矮桌上）'); await GM.say(kx,'下次要說。我想在。'); }   /* 沒被告知：不問「那一句」 */
      if(typeof SOCIAL!=='undefined') SOCIAL.remember('kexin','HELPED','感冒那晚');
    } finally { if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); GM.sceneEnd(); } if(GM.autosave) GM.autosave(); return true; };
  /* 3-6 很少交會的版本（也接 3-5：一般版但那晚沒有人問、可昕也不問）：期中最後一科考完那天 19:00 阿鳳麵店（出遊，可以不去）；沒去＝22:00 同一個人私訊。
     問的人：FAMILIAR 以上、那天在臺北的人裡最熟的一位（第 4 節第 4 點的算法）；沒有＝不演、BEING_HEARD 不記 */
  S.coldNoodleDay=function(G){ let d=null; try{ const e=typeof CLS!=='undefined'&&CLS.lastExamEnd?CLS.lastExamEnd(G,'Y3S1','mid'):null; if(e) d=e.day; }catch(e){ d=null; } return d!=null?d:S.dayOfKey('2027-10-29'); };   /* 照遊戲實際的課表；算不出來＝期中週的週五 */
  S.coldNoodleOn=function(G){ const F=(G&&G.flags)||{}, d26=S.dayOfKey(CW_D26); if((G.stage||'law')!=='law'||F.COLD_WEEK_NOODLE!=null) return false; if(F.COLD_WEEK==='noodle') return true;
    return F.COLD_WEEK==='night'&&F.COLD_WEEK_NIGHT!=null&&!F.COLD_WEEK_ASKER&&!(F.KX_COLD_WEEK==='told'&&F.KX_COLD_WEEK_SEEN==null&&d26!=null&&G.day<=d26); };   /* 被告知的可昕 10/26 問 */
  S.coldNoodleAsker=function(G){ const L=CW_ORDER.filter(id=>!CW_AWAY.includes(id)&&cwAt(id,'FAMILIAR')&&S.present(id,G));
    return L.sort((a,b)=>(cwSt(b)-cwSt(a))||(cwSum(b)-cwSum(a))||(CW_ORDER.indexOf(a)-CW_ORDER.indexOf(b)))[0]||null; };
  S.coldWeekNoodle=async function(GM,who){ const G=GM.G, F=G.flags; F.COLD_WEEK_NOODLE='face'; cwDone(G,'ev_cold_week_noodle'); const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'y3_cold_noodle'):null; if(q&&q.state==='planned') q.state='done';
    GM.sceneBegin(); try{ if(typeof ADV!=='undefined'){ ADV.preload([who]); ADV.begin({background:'blur',right:{charId:who,expression:'neutral'}}); }
      if(F.COLD_WEEK==='night') await GM.say(null,'（感冒好了以後，第一次來麵店。）');   /* 3-5：一般版、那晚沒有人問 */
      const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[who]; await GM.say(null,'（期中考完的晚上，麵店的長桌只剩你們兩個。'+(c&&c.gender==='m'?'他':'她')+'把筷子放下。）');
      await cwAsk(GM,who,'noodle');
    } finally { if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); GM.sceneEnd(); } if(GM.autosave) GM.autosave(); return true; };
  /* 私訊版的選項（PHONE 的 ask）：回答後那一句照表；第 4 個＝「好，那你吃完飯再回我。」，30 分鐘後再問一次（phoneRules，沒有第 4 個）*/
  S.coldDmOpts=function(G,who,again){ const a=S.coldWeekAfter(G,who); return S.coldWeekOpts(G,again).map(o=>o.k==='food'?{t:cwUnq(o.t),set:{COLD_WEEK_DM_LATER:1},say:[{th:'p:'+who,from:who,text:'好，那你吃完飯再回我。'}]}
    :{t:cwUnq(o.t),set:{COLD_WEEK_ANSWER:o.k,COLD_WEEK_ASKER:who},mem:[{npc:who,tag:'BEING_HEARD',note:cwUnq(o.t)}],say:a?[{th:'p:'+who,from:who,text:a}]:[]}); };
  S.coldDmItems=(G,who,again)=>[{th:'p:'+who,from:who,text:'你每次都在幫別人查。'},{th:'p:'+who,from:who,text:'你自己呢？你想用法律做什麼？',ask:{opts:S.coldDmOpts(G,who,again)}}];
  /* 每 0.5 秒（S.tick；人在家的時候 home3d.js 的選單管）*/
  let cwBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:cwBusy']=()=>{ cwBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.coldWeekTick=function(GM){ const G=GM.G, F=G.flags; if(cwBusy||(G.stage||'law')!=='law') return false; const d23=S.dayOfKey(CW_D23); if(d23==null||G.day<d23||G.day>d23+21) return false;
    if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return false;
    const go=f=>{ cwBusy=true; Promise.resolve().then(f).catch(e=>console.warn('COLD_WEEK',e)).finally(()=>{ cwBusy=false; }); return true; };
    if(S.coldSneezeDue(G)) return go(()=>S.coldWeekSneeze(GM));
    S.coldWeekLate(G);
    const d24=S.dayOfKey(CW_D24), d25=S.dayOfKey(CW_D25), d26=S.dayOfKey(CW_D26);
    if(F.COLD_WEEK==='night'&&F.COLD_WEEK_NIGHT==null&&G.day>d24){ F.COLD_WEEK_NIGHT='missed'; F.COLD_WEEK_PRESENT=[]; if(F.COLD_WEEK_CALLS==null) F.COLD_WEEK_CALLS=[]; }   /* 那一晚整晚不在（出遊過夜、讀檔）：不補演，照 3-5 */
    if(F.COLD_WEEK==='night'&&F.COLD_WEEK_D25==null&&G.day>d25) F.COLD_WEEK_D25='missed';
    if(S.coldCallDue(G)) return go(()=>S.coldWeekCalls(GM));
    if(S.coldNightDue(G)) return go(()=>S.coldWeekNight(GM));
    if(S.coldMorningDue(G)) return go(()=>S.coldWeekMorning(GM));
    if(S.coldKexinDue(G)&&(G.zone==='dorm'||G.zone==='dorm_hall')) return go(()=>S.coldWeekKexin(GM));
    if((F.KX_COLD_WEEK==='told'||F.KX_COLD_WEEK==='found_out')&&F.KX_COLD_WEEK_SEEN==null&&cwDating(G,'kexin')&&G.day===d26&&G.hour>=17.9&&G.zone!=='dorm'&&G.zone!=='dorm_hall'&&typeof OUT!=='undefined'&&OUT.plan&&!OUT.get(G,'y3_cold_kexin'))
      OUT.plan(G,{id:'y3_cold_kexin',must:true,goto:Object.assign({zone:'dorm_hall'},CW_LOUNGE),day:d26,h:18.5,late:2,place:'宿舍',title:'宿舍門口',travelH:1/3});   /* 她考完從政大過來：在外面的帶回宿舍 */
    if(S.coldNoodleOn(G)){ const dN=F.COLD_NOODLE_DAY!=null?F.COLD_NOODLE_DAY:(F.COLD_NOODLE_DAY=S.coldNoodleDay(G)); if(G.day>=dN){ const who=S.coldNoodleAsker(G);
        if(!who){ F.COLD_WEEK_NOODLE='none'; if(F.COLD_WEEK==='noodle') F.COLD_WEEK='none'; return false; }
        if(G.day===dN&&G.zone==='noodle'&&G.hour>=19&&G.hour<22) return go(()=>S.coldWeekNoodle(GM,who));
        if(G.day===dN&&G.hour>=18&&G.hour<19.75&&G.zone!=='noodle'&&typeof OUT!=='undefined'&&OUT.plan&&!OUT.get(G,'y3_cold_noodle')) OUT.plan(G,{id:'y3_cold_noodle',goto:{zone:'noodle',x:0,z:3.4,yaw:Math.PI},day:dN,h:19,late:0.75,place:'公館',title:'阿鳳麵店',travelH:1/6});
        if(G.day>dN||G.hour>=22){ F.COLD_WEEK_NOODLE='dm'; F.COLD_NOODLE_WHO=who; if(typeof PHONE!=='undefined'&&G.day<=dN+1) PHONE.at(G,dN,22,S.coldDmItems(G,who,false),'cold_week_dm'); } } }   /* 22:00 同一個人私訊 */
    if(F.COLD_WEEK_DM_LATER===1&&F.COLD_NOODLE_WHO&&typeof PHONE!=='undefined'){ F.COLD_WEEK_DM_LATER=2; PHONE.at(G,G.day,G.hour+0.5,S.coldDmItems(G,F.COLD_NOODLE_WHO,true),'cold_week_dm2'); }   /* 第 4 個選項：30 分鐘後再問一次 */
    return false; };
  /* 睡著也會醒來的時間（sleepNow）：10/24 21:00（要打電話的人）、21:30；10/26 18:30 可昕；11/17 22:00 可昕的電話（1A-05）*/
  S.lawWakeAt=function(G){ const F=(G&&G.flags)||{}; if((G.stage||'law')!=='law') return null; const d24=S.dayOfKey(CW_D24);
    if(d24!=null&&G.day===d24&&F.COLD_WEEK==='night'&&F.COLD_WEEK_NIGHT==null){ if(F.COLD_WEEK_CALLS==null&&G.hour<21&&S.coldCallList(G).length) return 21; if(G.hour<21.5) return 21.5; }
    const d26=S.dayOfKey(CW_D26); if(d26!=null&&G.day===d26&&G.hour<18.5&&(F.KX_COLD_WEEK==='told'||F.KX_COLD_WEEK==='found_out')&&F.KX_COLD_WEEK_SEEN==null&&cwDating(G,'kexin')) return 18.5;   /* 10/26 可昕考完過來（3-4）*/
    const d17=S.dayOfKey('2027-11-17'); if(d17!=null&&G.day===d17&&G.hour<22&&S.kxExchTalkDue&&S.kxExchTalkDue(G)) return 22;
    { const w=S.y4WakeAt?S.y4WakeAt(G):null; if(w!=null) return w; }   /* 1A-11：6/1 20:00 收拾（AA_318）*/
    for(const f of S.WAKE_AT){ try{ const w=f(G); if(w!=null) return w; }catch(e){ console.warn('STORY.WAKE_AT',e); } }   /* 事件包各自的「睡著也會醒來」（STORY.WAKE_AT.push(fn)：fn(G) 回傳時間或 null）*/ return null; };
  /* ---------- 1A-05　大三交換志願表＝以安新 15「為什麼是日本」（AA_315；AA_30 場景 0、AA_253 第 2 節、BB_98 2-3／9-5、AA_180 2-1；台詞照 AA_315 第 2 節，不改字）----------
     11/15 09:00 學校信箱（所有人）；11/16 21:00 以安私訊（認識、FAMILIAR 以上、沒有和她分手；分手了＝麵店團群組＋11/17 18:30 麵店長桌，AA_437 第 4 節 S.an15Noodle）；11/17 15:15 起兩點半 Café（16:00 還沒到＝「我在窗邊。」延到 17:00；18:00 沒到＝「我先交了」，沒有 AN15_SEEN）。
     這一場不決定路線：版本照 S.routeFor（routeDecide 的預覽，不寫入）；11/18 第一次起床（起床選單之前；已經過了 12:00＝下一個能播的時候）播截止旁白（2-4）。
     學姊（交往中或 FRIEND 以上）：20:00「我在法圖。九點四十五關門。」，21:00～21:45 在法圖（或門口）＝當面，沒去＝22:30 手機版（2-5）。
     可昕（交往中）：11/15～11/17 下一次見面的最後（outings3d.js 的出遊、約會），沒見面＝11/17 22:00 電話（2-6）。*/
  const AN15_K={d15:'2027-11-15',d16:'2027-11-16',d17:'2027-11-17',d18:'2027-11-18'};
  const an15D=()=>({d15:S.dayOfKey(AN15_K.d15),d16:S.dayOfKey(AN15_K.d16),d17:S.dayOfKey(AN15_K.d17),d18:S.dayOfKey(AN15_K.d18)});
  S.an15On=function(G){ const F=(G&&G.flags)||{}, R=(F.romance||{}).heroine_01; return (G.stage||'law')==='law'&&S.knows('heroine_01',G)&&cwAt('heroine_01','FAMILIAR')&&!(R&&R.status==='ex'); };   /* 第 1 節：認識、FAMILIAR 以上、沒有和她分手（包括 11/11 攤牌選了學姊）*/
  S.an15Due=function(G){ const D=an15D(), F=(G&&G.flags)||{}; return D.d17!=null&&G.day===D.d17&&G.zone==='cafe'&&h(G)>=15.25&&h(G)<17&&F.AN15_SEEN==null&&S.an15On(G)&&typeof PHONE!=='undefined'&&PHONE.sent(G,'y3_an15_invite'); };   /* 窗口 15:15～16:00，16:00 那則訊息延到 17:00 */
  /* 2-2 祐廷寫了什麼的旁白（A／B／C 第一句）：Café 和前任的麵店長桌版（AA_437 第 4 節）共用 */
  S.AN15_FORM={JP:'（志願表第一欄，你寫了日本那所大學的名字。和她填的是同一所。附件欄夾了一張語言成績單。）',US:'（志願表第一欄，你寫了美國那所大學的名字。大四上，和她同一個學期。附件欄夾了一張語言成績單。）',TW:'（志願表你拿了一張。到現在還是空白的。）'};
  S.an15Cafe=async function(GM){ const G=GM.G, F=G.flags; if(!S.an15Due(G)) return false; F.AN15_SEEN=G.day; cwDone(G,'ev_an_why_japan'); const an=cwWho('heroine_01'), dating=cwDating(G,'heroine_01'), r=S.routeFor(G);
    GM.sceneBegin(); try{ if(typeof ADV!=='undefined'){ ADV.preload(['heroine_01']); ADV.begin({background:'blur',right:{charId:'heroine_01',expression:'neutral'}}); }
      if(F.EXPO_COUNTRY) await GM.say(null,'（說明會那天，你坐在'+F.EXPO_COUNTRY+'那一區。）');   /* 2-0：去過交換說明會才有 */
      await GM.say(an,'（把自己的志願表推過來。第一志願「日本」，字很工整。申請理由那一欄寫得很滿。）'); await GM.say(an,'我的。');
      await GM.say(null,'（申請理由第一行寫著：「行政指導：沒有命令，對方照做。是信任，還是壓力？」）');
      await GM.say(an,'台灣也有這一條。可是條文只寫了怎麼規定，我想看的是那邊的人為什麼照做。'); await GM.say(an,'那個要去那裡看。');
      await GM.say(an,dating?'你的呢？':'你的呢？……你還沒填。很少見。你平常都很快。');
      const P=Array.isArray(F.COLD_WEEK_PRESENT)?F.COLD_WEEK_PRESENT:[]; if(P.includes('heroine_01')) await GM.say(an,'你上個月感冒的時候說，你想用法律做什麼。'); else if(P.includes('zhe')) await GM.say(an,'阿哲說你那週講了一句很帥的話。他不告訴我是什麼。');   /* 1A-04 第 5 節的回聲 */
      if(typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_01','KNOWS_ECON_YEAR')) await GM.say(an,'你換過一次方向。這次也是你自己選。');
      if(r==='JP'){ await GM.say(null,S.AN15_FORM.JP); await GM.say(an,'寫好了？'); await GM.say(an,'我們同一所。我查過了，宿舍在同一區。'); await GM.say(an,'下禮拜要補語言成績，你的考了嗎？');
        const k=await GM.choose([{t:'「考了。」'},{t:'「還沒。」'}]); F.AN15_ANSWER=k===1?'not_yet':'tested'; await GM.say(an,k===1?'……下禮拜。不准賴。':'好。那我們明天早上一起交。'); }   /* A 版：和以安交往中 */
      else if(r==='US'){ await GM.say(null,S.AN15_FORM.US);
        await GM.say(an,typeof ROM!=='undefined'&&ROM.knowsOf&&ROM.knowsOf(G,'heroine_01','heroine_05')?'美國。……學姊也去那裡吧。':'美國。好遠。'); await GM.say(an,'那理由欄寫你自己的就好。'); }   /* B 版：和學姊交往中（以安知不知道分兩句；不給選項）*/
      else { await GM.say(null,S.AN15_FORM.TW); await GM.say(an,'你不填？');
        const k=await GM.choose([{t:'「嗯。大四還沒開始，我想在這裡過。」'},{t:'「還在想。」'}]);   /* AA_376 #20：他才大三 */ F.AN15_ANSWER=k===1?'thinking':'stay'; await GM.say(an,k===1?'明天中午截止喔。……想好了就好。':'好。那麵店那邊，你幫我多吃幾碗。'); }   /* C 版：留在臺灣 */
      await GM.say(null,'（窗外的溫州街開始暗了。以安把她那一張收進資料夾，對齊了兩次。）');
      if(typeof SOCIAL!=='undefined') SOCIAL.remember('heroine_01','IMPORTANT_CONVERSATION','為什麼是日本');
    } finally { if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); GM.sceneEnd(); }
    if(GM.advance) GM.advance(0.75); if(GM.memo) GM.memo('為什麼是日本'); if(GM.autosave) GM.autosave(); return true; };
  /* 前任版＝麵店長桌（AA_437 第 4 節＝AA_123 4-3b 新 15；企劃線 fc6f20bc0，台詞照抄）：和以安分手了（status ex＝S.an15On 不成立的那些人）、在麵店團。
     11/16（二）21:00 麵店團群組她兩則（不是私訊；不在麵店團＝沒有）；11/17（三）18:30 阿鳳麵店長桌（18:15～19:30 人在麵店就演；出遊「阿鳳麵店」帶過去；沒到＝不補、沒有「我先交了」）。
     她對整桌講。阿哲、Alison 照 STORY.knows：不認識就不說；兩個都不認識＝從阿哲那句到「可以。……先等我上。」整段拿掉。
     祐廷寫了什麼＝AA_315 2-2 的 B（美國）／C（臺灣）第一句旁白（S.AN15_FORM；以安的回答、選項不用：她最後只說「你不用為了這個說什麼。」），放在她把志願表收回去之前。前任不會是日本路線（routeFor 只看交往中）。
     記 AN15_SEEN（11/18 的截止旁白照「有演」：不重複那一句）、AN15_MODE 'noodle'；不記 IMPORTANT_CONVERSATION（她對整桌講，不是兩個人的談話）*/
  S.AN15_EX={
    invite:['交換的志願表後天截止。','明天晚上六點半長桌，要一起填的帶表來。'],
    open:[[null,'（長桌。以安把自己的志願表放在桌子中間。第一志願「日本」，字很工整。申請理由那一欄寫得很滿。）'],['heroine_01','我的。'],[null,'（申請理由第一行寫著：「行政指導：沒有命令，對方照做。是信任，還是壓力？」）'],
      ['heroine_01','台灣也有這一條。可是條文只寫了怎麼規定，我想看的是那邊的人為什麼照做。'],['heroine_01','那個要去那裡看。']],
    zhe:'……妳連申請理由都寫好了。我還在想要不要申請。', yu:'日本！！我可以去找妳玩嗎', reply:'可以。……先等我上。', replyZhe:'申請不用想太久。明天中午截止。',   /* replyZhe：只認識阿哲、不認識 Alison（AA_437 第 10 節第 2 點）*/
    close:[[null,'（她把志願表收回去，看了你一眼。）'],['heroine_01','你不用為了這個說什麼。']] };
  S.an15ExOn=function(G){ const F=(G&&G.flags)||{}, R=(F.romance||{}).heroine_01; return (G.stage||'law')==='law'&&S.knows('heroine_01',G)&&!cwDating(G,'heroine_01')&&!!(R&&R.status==='ex')&&typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team'); };
  S.an15ExDue=function(G){ const D=an15D(), F=(G&&G.flags)||{}; return D.d17!=null&&G.day===D.d17&&G.zone==='noodle'&&h(G)>=18.25&&h(G)<19.5&&F.AN15_SEEN==null&&S.an15ExOn(G)&&PHONE.sent(G,'y3_an15_ex_invite'); };
  S.an15Noodle=async function(GM){ const G=GM.G, F=G.flags; if(!S.an15ExDue(G)) return false; F.AN15_SEEN=G.day; F.AN15_MODE='noodle'; cwDone(G,'ev_an_why_japan');
    if(typeof OUT!=='undefined'&&OUT.get){ const q=OUT.get(G,'y3_an15_ex'); if(q&&q.state==='planned') q.state='done'; }   /* 自己走進來的：排好的出遊不再問 */
    const X=S.AN15_EX, an=cwWho('heroine_01'), who=id=>id?cwWho(id):null, r=S.routeFor(G), zhe=S.knows('zhe',G), yu=S.knows('yu',G);
    GM.sceneBegin(); try{ if(typeof ADV!=='undefined'){ ADV.preload(['heroine_01']); ADV.begin({background:'blur',right:{charId:'heroine_01',expression:'neutral'}}); }
      for(const [id,t] of X.open) await GM.say(who(id),t);
      if(zhe) await GM.say(cwWho('zhe'),X.zhe); if(yu) await GM.say(cwWho('yu'),X.yu); if(yu) await GM.say(an,X.reply); else if(zhe) await GM.say(an,X.replyZhe);   /* 兩個都不認識＝整段拿掉；只認識阿哲＝以安回阿哲（AA_437 第 10 節）*/
      await GM.say(null,S.AN15_FORM[r]||S.AN15_FORM.TW);   /* 2-2 的 B／C 第一句 */
      for(const [id,t] of X.close) await GM.say(who(id),t);
    } finally { if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); GM.sceneEnd(); }
    if(GM.advance) GM.advance(0.75); if(GM.memo) GM.memo('為什麼是日本'); if(GM.autosave) GM.autosave(); return true; };
  /* 2-4：截止那一刻的旁白（AA_253 第 2 節原文）。路線已經定了（12:00 以後）照定的，還沒（11/18 早上）照預覽 */
  S.routeNarrDue=function(G){ const D=an15D(), F=(G&&G.flags)||{}; return (G.stage||'law')==='law'&&D.d18!=null&&G.day>=D.d18&&G.day<=D.d18+2&&F.ROUTE_NARR==null&&(!F.EXCHANGE_ROUTE||!!F.EXCH_RULE); };   /* 舊選單選過、已經過了截止日的舊存檔（沒有 EXCH_RULE）不播 */
  S.routeNarrLines=function(G){ const F=(G&&G.flags)||{}, r=S.route(G)||S.routeFor(G), seen=F.AN15_SEEN!=null;
    if(r==='JP') return [...(seen?[]:['（志願表第一欄，你寫了日本那所大學的名字。和她填的是同一所。附件欄夾了一張語言成績單。）']),'（你把表交到系辦。助理蓋了章，說：『今天第二張寫這間的。』）'];
    if(r==='US') return [...(seen?[]:['（志願表第一欄，你寫了美國那所大學的名字。大四上，和她同一個學期。附件欄夾了一張語言成績單。）']),'（你把表交到系辦。助理蓋了章，沒有抬頭。）'];
    return ['（志願表你拿了一張，放在書包裡一個禮拜。最後沒有交。）','（你想，大四還沒開始。你想在這裡過。）']; };   /* AA_376 #20 */
  S.routeNarr=async function(GM){ const G=GM.G; if(!S.routeNarrDue(G)) return false; G.flags.ROUTE_NARR=G.day; GM.sceneBegin(); try{ for(const t of S.routeNarrLines(G)) await GM.say(null,t); } finally { GM.sceneEnd(); } return true; };
  /* 2-5 學姊：交往中，或 FRIEND 以上（不是的沒有這一段）*/
  S.sisFormOn=G=>(G.stage||'law')==='law'&&(cwDating(G,'heroine_05')||cwAt('heroine_05','FRIEND'));
  S.sisFormLines=function(G){ const r=S.routeFor(G);
    if(cwDating(G,'heroine_05')) return {pre:[['sis','志願表交了？'],['me','交了。美國。'],['sis','……我知道你會填那裡。'],['sis','可是你要自己也想去。不是只因為我在那邊。']],opts:[['我自己也想去。','好。那我相信你。'],['一半一半。','……誠實。好。']],route:r};
    const single=!cwPartners(G).length&&!cwHasMate(G,'heroine_05'), last=r!=='JP'&&single?'好。那我明年在美國，每天傳一張照片給你。':'好。那我明年在美國，每天在家族群組放一張照片。……你們要回。';   /* 雙方都單身：最後一句改 */
    return {pre:[['sis','志願表填了？'],['me',r==='JP'?'日本。':'沒填。留在臺灣。'],['sis',last]],opts:null,route:r,last,toYou:r!=='JP'&&single}; };   /* toYou：說了「每天傳一張照片給你」＝記 SIS_PHOTO_TO_YOU（AA_470 4-1：大四上平日的照片改傳私訊，y34b3d.js S.m6）*/
  S.sisFormFaceDue=function(G,E){ const D=an15D(), F=(G&&G.flags)||{}; if(D.d17==null||G.day!==D.d17||h(G)<21||h(G)>=21.75||F.SIS_FORM_REACT!=null||!S.sisFormOn(G)) return false; if(G.zone==='lawlib') return true;
    const LD=typeof WANCAI_LAYOUT!=='undefined'&&WANCAI_LAYOUT.lawlibDoor&&WANCAI_LAYOUT.lawlibDoor.it, P=E&&E.player&&E.player.obj.position; return G.zone==='wancai'&&!!LD&&!!P&&Math.hypot(P.x-LD.x,P.z-LD.z)<4; };   /* 法圖或門口（萬才館大廳的法圖門）*/
  S.sisFormFace=async function(GM){ const G=GM.G, F=G.flags; if(!S.sisFormFaceDue(G,GM.E)) return false; F.SIS_FORM_REACT='face'; cwDone(G,'ev_sis_form_react'); const sis=cwWho('heroine_05'), me={name:G.name}, L=S.sisFormLines(G);
    GM.sceneBegin(); try{ if(typeof ADV!=='undefined'){ ADV.preload(['heroine_05']); ADV.begin({background:'blur',right:{charId:'heroine_05',expression:'neutral'}}); }
      for(const [sp,t] of L.pre) await GM.say(sp==='me'?me:sis,t);
      if(L.toYou) F.SIS_PHOTO_TO_YOU=true;   /* AA_470 4-1：那一句說出口了（當面）*/
      if(L.opts){ const k=await GM.choose(L.opts.map(o=>({t:'「'+o[0]+'」'}))); await GM.say(sis,(L.opts[k]||L.opts[0])[1]); }
    } finally { if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); GM.sceneEnd(); } if(GM.autosave) GM.autosave(); return true; };
  S.sisFormPhone=function(G){ const L=S.sisFormLines(G), S5=t=>({th:'p:heroine_05',from:'heroine_05',text:t});   /* 22:30 手機版：交往中＝當面的四句變訊息、選項一樣；不是交往中＝「Kevin 說……」 */
    if(L.opts) return [Object.assign(S5('志願表交了？'),{ask:{opts:[{t:'交了。美國。',say:[S5('……我知道你會填那裡。'),Object.assign(S5('可是你要自己也想去。不是只因為我在那邊。'),{ask:{opts:L.opts.map(o=>({t:o[0],say:[S5(o[1])]}))}})]}]}})];
    return [Object.assign(S5('Kevin 說交換志願明天截止。你填了嗎？'),{ask:{opts:[Object.assign({t:L.route==='JP'?'日本。':'沒填，留在臺灣。',say:[S5(L.last)]},L.toYou?{set:{SIS_PHOTO_TO_YOU:true}}:{})]}})]; };   /* 22:30 手機版：回了才說出那一句＝記 SIS_PHOTO_TO_YOU（AA_470 4-1）*/
  /* 2-6 可昕（交往中）：11/15～11/17 下一次見面的最後（outings3d.js 呼叫 how 'face'）；沒見面＝11/17 22:00 電話（'call'）。不出假設題、不拿祐廷比較 */
  S.kxExchTalkDue=function(G){ const D=an15D(), F=(G&&G.flags)||{}; return (G.stage||'law')==='law'&&D.d15!=null&&G.day>=D.d15&&G.day<=D.d17&&F.KX_EXCH_TALK==null&&cwDating(G,'kexin'); };
  S.kxExchCallDue=G=>{ const D=an15D(); return S.kxExchTalkDue(G)&&G.day===D.d17&&h(G)>=22; };
  S.kxExchTalk=async function(GM,how){ const G=GM.G, F=G.flags; if(!S.kxExchTalkDue(G)) return false; F.KX_EXCH_TALK=how||'face'; cwDone(G,'ev_kexin_exchange_talk');
    const kx=how==='call'?{name:'可昕（電話）'}:cwWho('kexin'), me={name:G.name}, r=S.routeFor(G), place=r==='JP'?'日本':'美國';
    GM.sceneBegin(); try{ const res=async()=>{ if(r==='TW') await GM.say(kx,'留下來？……好。那我們的日子不用排時差。'); else { await GM.say(me,place+'。'); await GM.say(kx,'好。那我們來排時差。'); } };
      const k=await GM.choose([{t:'「我在想要不要交換。」'},{t:'「交換的表，我已經想好了。」'}]);
      if(k===0){ await GM.say(kx,'你問我意見，還是告訴我結果？'); await GM.say(kx,'……兩種都可以，我只是想知道是哪一種。'); const j=await GM.choose([{t:'「問妳。」'},{t:'「告訴妳結果。」'}]);
        if(j===0){ await GM.say(kx,'那我的意見是：想去就去。……不用替我想。'); F.KX_EXCHANGE_ASKED=true; await GM.say(null,r==='TW'?'（你最後沒有交。）':'（你還是寫了'+place+'。）'); } else await res(); }
      else await res();
    } finally { GM.sceneEnd(); } return true; };
  let efBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:efBusy']=()=>{ efBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.exchFormTick=function(GM){ const G=GM.G; if(efBusy||(G.stage||'law')!=='law') return false; const D=an15D(); if(D.d15==null||G.day<D.d15||G.day>D.d18+2) return false; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return false;
    const go=f=>{ efBusy=true; Promise.resolve().then(f).catch(e=>console.warn('AN15',e)).finally(()=>{ efBusy=false; }); return true; };
    if(S.routeNarrDue(G)) return go(()=>S.routeNarr(GM));
    if(S.an15Due(G)) return go(()=>S.an15Cafe(GM));
    if(S.an15ExDue(G)) return go(()=>S.an15Noodle(GM));   /* 前任版：麵店長桌（AA_437 第 4 節）*/
    if(S.sisFormFaceDue(G,GM.E)) return go(()=>S.sisFormFace(GM));
    if(S.kxExchCallDue(G)) return go(async()=>{ if(GM.toast) GM.toast('手機響了。',2400); await S.kxExchTalk(GM,'call'); });
    return false; };
  /* 手機（S.phoneRules）*/
  S.an15Phone=function(G){ const D=an15D(), F=G.flags; if(typeof PHONE==='undefined'||D.d15==null||(G.stage||'law')!=='law'||G.day<D.d15||G.day>D.d18) return; const hh=G.hour, after=(d,x)=>G.day>d||(G.day===d&&hh>=x), dt=cwDating(G,'heroine_01');
    if(after(D.d15,9)&&!PHONE.sent(G,'y3_exch_mail')) PHONE.at(G,D.d15,9,[{th:'sys',name:'學校信箱',text:'交換學生申請：11/18（四）中午截止。'}],'y3_exch_mail');   /* 所有玩家（系統字）*/
    if(after(D.d16,21)&&G.day<=D.d17&&S.an15On(G)&&!PHONE.sent(G,'y3_an15_invite')&&!PHONE.sent(G,'y3_an15_ex_invite')) PHONE.at(G,D.d16,21,[{th:'p:heroine_01',from:'heroine_01',text:dt?'明天下午三點半，兩點半 Café。我們一起填。':'明天下午三點半，兩點半 Café。交換的志願表，後天截止。'}],'y3_an15_invite');
    if(after(D.d16,21)&&(G.day<D.d17||hh<19.5)&&S.an15ExOn(G)&&!PHONE.sent(G,'y3_an15_invite')&&!PHONE.sent(G,'y3_an15_ex_invite')) PHONE.at(G,D.d16,21,S.AN15_EX.invite.map(t=>({th:'g:noodle_team',from:'heroine_01',text:t})),'y3_an15_ex_invite');   /* 前任：麵店團群組（AA_437 第 4 節；收過私訊的不再收）*/
    if(PHONE.sent(G,'y3_an15_ex_invite')&&F.AN15_SEEN==null&&S.an15ExOn(G)&&typeof OUT!=='undefined'&&OUT.plan&&!OUT.get(G,'y3_an15_ex')&&G.day===D.d17&&hh<19.5&&G.zone!=='noodle')
      OUT.plan(G,{id:'y3_an15_ex',goto:{zone:'noodle',x:0,z:3.4,yaw:Math.PI},day:D.d17,h:18.5,late:1,place:'公館',title:'阿鳳麵店',travelH:1/6});   /* 18:15～19:30 */
    if(G.day===D.d17&&hh>=16&&hh<17&&F.AN15_SEEN==null&&PHONE.sent(G,'y3_an15_invite')&&!PHONE.sent(G,'y3_an15_window')) PHONE.at(G,D.d17,16,[{th:'p:heroine_01',from:'heroine_01',text:'我在窗邊。'}],'y3_an15_window');   /* 16:00 還沒到：延到 17:00 */
    if(after(D.d17,18)&&F.AN15_SEEN==null&&PHONE.sent(G,'y3_an15_invite')&&!PHONE.sent(G,'y3_an15_missed')) PHONE.at(G,D.d17,18,[{th:'p:heroine_01',from:'heroine_01',text:dt?'我先交了。你的，明天中午以前。……同一所，不要寫錯。':'我先交了。你的，明天中午以前要交。'}],'y3_an15_missed');   /* 2-3 沒到：不帶到場 */
    if(G.day===D.d17&&hh>=20&&hh<21.75&&S.sisFormOn(G)&&!PHONE.sent(G,'y3_sis_lawlib')) PHONE.at(G,D.d17,20,[{th:'p:heroine_05',from:'heroine_05',text:'我在法圖。九點四十五關門。'}],'y3_sis_lawlib');
    if(after(D.d17,22.5)&&S.sisFormOn(G)&&F.SIS_FORM_REACT==null){ F.SIS_FORM_REACT='phone'; cwDone(G,'ev_sis_form_react'); PHONE.at(G,D.d17,22.5,S.sisFormPhone(G),'y3_sis_form_phone'); } };   /* 沒去法圖：22:30 手機版 */
  /* ---------- 1A-06～1A-15（AA_317、AA_318；AA-C 2026-10-20 定稿，第②級，台詞不改字；e75ebc69 兩處更正）：大三寒假 → 大四 → 畢業、搬走 ----------
     台詞在 events.js 的 Y4_EVENTS（ev_sister_hotpot、ev_family_land_y3、ev_y4_path、ev_r1_jetlag、ev_grad_envelope）和下面（拆箱、收拾、畢業典禮、搬走）。
     1A-06 主線 7 姊姊：1/10 21:00 私訊（p:sister）；答應＝1/12 19:00 公館火鍋店（出遊）；1/11 21:00 還沒回＝再一則；答應了沒到＝19:45「好。那過年見。」（events.js）
     1A-07 主線 9：2028-01-26 白天在家（寒假的選單）；白天都不在家＝睡著時；可昕交往中 22:00 一則（KX_FAMILY_LAND）
     1A-08 大四要怎麼過：台灣、美國路線＝大三下最後一科期末考考完那天 21:00 以後，人在宿舍房間（坐到書桌前）；那時人在家＝只問那一句；
       日本路線＝8/5 20:00 以後（日本返台的流程還沒有：人在哪裡都演，2D 家裡的房間）。隔天 09:00 姊姊一則（SISTER_TALK）；選④＝10/16 21:00 再問（美國＝公寓，當地時間）
     1A-09 主線 10：台灣、日本 2028-09-03 起（在家＝旁白＋字卡 → 409；在宿舍＝直接換）；美國＝12/23 返台（exchange3d.js）直接 409；unboxY4 三步（收過前任的紙箱 CLEANUP_BOX＝第二、三步之間多一步，AA_437 第 6 節）；大四下以後才讀檔＝直接記
     1A-10 R1：9/6 21:00 阿哲（麵店團群組；不在群組、和阿哲 FAMILIAR 以上＝私訊）＋出遊「阿鳳麵店」；9/7 18:45～19:15 人在麵店就演；19:30 沒到＝手機版（一定要回）；美國＝當地 07:30 手機版
     1A-11 主線 11：2029-06-01 20:00（不在宿舍＝旁白 → 回宿舍；睡著＝20:00 醒來）：BOX_KEPT_Y4 先 → 一件一件或「剩下的一起裝」→ 最後「冬天的衣服」；PACKED_Y4
     1A-12 主線 12：6/2 起床（鬧鐘 08:00）→ 體育館 → 撥穗（GRADUATED）→ 11:55 霖澤館大廳（GRAD_ENVELOPE）；13:30～17:00 公館午餐；22:00 以後第一次在宿舍房間＝大伯的信封
       （12:00 拍照 1A-13、17:30 1A-14 在 AA_319）
     1A-15：6/28 10:00（鬧鐘）宿舍一樓收鑰匙（在家、在外面＝先回宿舍）；麵店工讀（JOB_NOODLE）那一段刪掉（AA_519 1-5：遊戲沒有麵店打工）；Y4_PATH 'bar' 而且不是交換延畢＝公館的套房，其他＝臺北的家；兵役一句。
       HOME_AFTER、MOVED_OUT。畢業後篇的住處（睡覺、讀書的地方照 HOME_AFTER）還沒做。
     接線：S.tick（S.y4Tick）、S.phoneRules（S.y4Phone）、S.lawWakeAt（6/1 20:00）、S.wakeAlarms（6/2 08:00、6/28 10:00）、home3d.js 的 loop（S.y4HomeDue）、exchange3d.js（美國返台）、zones3d.js（409）。
     測試：tests/sister_hotpot_unit.js、land_data2_unit.js、room_y4_unit.js、jetlag_unit.js、grad_family_unit.js、move_out_y4_unit.js */
  const Y4K={sis:'2028-01-10',cny:'2028-01-26',room:'2028-09-03',r1:'2028-09-07',again:'2028-10-16',y4s2:'2029-02-19',pack:'2029-06-01',grad:'2029-06-02',out:'2029-06-28'};
  S.Y4K=Y4K;   /* 給別的模組讀（只讀）：src/dorm_y24_3d.js 的 409 最後一晚＝out（宿舍期滿）的前一晚（AA_517 3-3）*/
  const y4D=k=>S.dayOfKey(Y4K[k]), y4Law=G=>!!G&&(G.stage||'law')==='law', y4Past=(G,d,x)=>d!=null&&(G.day>d||(G.day===d&&G.hour>=x));
  const y4AtHome=G=>typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G), y4Done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const y4Ev=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  const SIS_TH='p:sister', SIS=t=>({th:SIS_TH,from:'sister',name:'姊姊',text:t}), SIS_W={name:'姊姊'}, MOM_W={name:'媽媽'};   /* 家人不在 CHARACTERS 裡：手機的名字在 phone3d.js；對話框照主線 2 寫「姊姊」「媽媽」（沒有立繪＝compact）*/
  const Y4_DORM={x:0,z:2.4,yaw:Math.PI}, Y4_DOOR={x:0,z:5.6,yaw:Math.PI,lv:0}, Y4_LOBBY={x:6.6,z:4.0,yaw:-Math.PI/2,lv:0}, Y4_GG={x:-35.6,z:13.2,yaw:0};   /* 宿舍房間、宿舍一樓門口（dorm_layout.js entrance）、霖澤館一樓大廳（linze_layout.js entrance）、公館（freetrip3d.js 回公館的位置）*/
  S.y4Fam=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET')&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf('FAMILIAR');   /* 認識、FAMILIAR 以上（AA_30 3-4）*/
  const y4LeaveHome=G=>{ if(typeof HOME==='undefined'||!HOME.rec) return; const H=HOME.rec(G); H.at=false; H.wakeAsk=null; H.lbreak=null; H.bskip=null; H.stayMon=null; };
  /* ---- 手機（S.phoneRules 每次呼叫）---- */
  S.y4Phone=function(GM){ const G=GM.G, F=G.flags; if(typeof PHONE==='undefined'||!y4Law(G)) return;
    { const d10=y4D('sis'); if(d10!=null&&G.day>=d10&&G.day<=d10+3){ const d11=d10+1, d12=d10+2;   /* 1A-06：1/10 21:00 姊姊；1/11 21:00 還沒回＝「禮拜三。七點。」；答應＝排出遊 */
        if(y4Past(G,d10,21)&&(G.day<d12||G.hour<18.5)&&!PHONE.sent(G,'y3_sis_hotpot')){ const L=[SIS('禮拜三我來臺北出差。'),SIS('晚上七點，公館。請你吃火鍋。'),SIS('……就我們兩個。')];
          L[2].ask={id:'y3_sis_hotpot',until:d12*24+18.5,opts:[{t:'好。',set:{SIS_HOTPOT:'yes'},say:[{from:'sister',name:'姊姊',text:'好。不要遲到。'}]},{t:'那天不行。',set:{SIS_HOTPOT:'no'},say:[{from:'sister',name:'姊姊',text:'好。那過年見。'}]}]};
          PHONE.at(G,d10,G.day===d10?Math.max(21,G.hour):21,L,'y3_sis_hotpot'); }
        const m=PHONE.byAsk(G,'y3_sis_hotpot'); if(m&&m.ans==null&&y4Past(G,d11,21)&&!PHONE.sent(G,'y3_sis_hotpot2')) PHONE.at(G,d11,21,[SIS('禮拜三。七點。')],'y3_sis_hotpot2');
        if(F.SIS_HOTPOT==='yes'&&typeof OUT!=='undefined'&&!OUT.get(G,'y3_sis_hotpot')) OUT.plan(G,{id:'y3_sis_hotpot',ev:'ev_sister_hotpot',day:d12,h:19,late:0.25,place:'公館的火鍋店',title:'公館的火鍋店',travel:'捷運＋公車 約 30 分鐘',travelH:0.5}); } }   /* 寒假住臺北的家，約 30 分鐘 */
    { const d=y4D('cny'); if(d!=null&&((G.day===d&&G.hour>=22)||G.day===d+1)&&F.FAMILY_LAND_Y3&&cwDating(G,'kexin')&&!PHONE.sent(G,'y3_kx_land')){ const K=t=>({th:'p:kexin',from:'kexin',text:t});   /* 1A-07：大年初一 22:00 可昕（BB_98 9-10，讀除夕那段的 KX_FAMILY_LAND）*/
        if(F.KX_FAMILY_LAND==='look') PHONE.at(G,d,22,[K('大伯那塊地，今天有進度嗎？'),{th:'p:kexin',who:null,text:'（你跟她說了十六個人十年沒坐在同一張桌子。）'},K('……那要先讓他們坐下來。這不是法律先做的事。')],'y3_kx_land');
        else if(F.KX_FAMILY_LAND==='listen') PHONE.at(G,d,22,[K('今天家裡還好嗎？')],'y3_kx_land'); } }
    if(F.Y4_PATH&&F.Y4_PATH_DAY!=null&&F.SISTER_TALK&&G.day<=F.Y4_PATH_DAY+2&&y4Past(G,F.Y4_PATH_DAY+1,9)&&!PHONE.sent(G,'y4_path_sis'))   /* 1A-08：選完隔天 09:00 姊姊一則（有 SISTER_TALK）*/
      PHONE.at(G,F.Y4_PATH_DAY+1,9,[{th:SIS_TH,who:null,text:'（昨晚你在家人群組打了一行字，又刪掉。最後只傳給姊姊。）'},SIS(S.y4PathSisLine(G))],'y4_path_sis');
    { const d7=y4D('r1'), inG=PHONE.inGroup(G,'noodle_team'); if(d7!=null&&G.day>=d7-1&&G.day<=d7+1&&(inG||S.y4Fam('zhe'))){ const di=d7-1, th=inG?'g:noodle_team':'p:zhe', Z=t=>({th,from:'zhe',text:t});   /* 1A-10 R1：群組（不在群組＝阿哲私訊）*/
        if(S.route(G)!=='US'){
          if(y4Past(G,di,21)&&(G.day<d7||G.hour<19.25)&&!PHONE.sent(G,'y4_r1_ask')) PHONE.at(G,di,G.day===di?Math.max(21,G.hour):21,[Z('明天七點 麵店'),Z('暑假都沒見到人 全部給我來')],'y4_r1_ask');
          if(PHONE.sent(G,'y4_r1_ask')&&!F.R1_SEEN&&typeof OUT!=='undefined'&&!OUT.get(G,'y4_r1')&&G.day===d7&&G.hour<19.25&&G.zone!=='noodle') OUT.plan(G,{id:'y4_r1',goto:{zone:'noodle',x:0,z:3.4,yaw:Math.PI},day:d7,h:19,late:0.25,place:'公館',title:'阿鳳麵店',travelH:1/6});
          if(PHONE.sent(G,'y4_r1_ask')&&!F.R1_SEEN&&y4Past(G,d7,19.5)){ F.R1_SEEN='phone'; const L=[Z('（照片：長桌，少一個人）'),Z('人呢'),Z('你錯過 Alison 一個人看電影的故事')].concat(inG?[{th,from:'yu',text:'不要講！'}]:[]);   /* 19:30 沒到；私訊版沒有 Alison 那句 */
            L[L.length-1].ask={id:'y4_r1_phone',must:true,opts:[{t:'下禮拜一定到。',say:[{from:'zhe',text:'下禮拜四'}]},{t:'（傳一張道歉的貼圖）',say:[{from:'zhe',text:'收到'}]}]}; PHONE.at(G,d7,19.5,L,'y4_r1_phone'); } }
        else if(S.abroad(G)&&!F.R1_SEEN&&y4Past(G,d7,7.5)){ F.R1_SEEN='us'; const L=[Z('（照片：長桌）'),Z('你們在美國吃什麼')];   /* 美國路線：台灣 19:30＝印第安納 07:30（在美國的時候 G.day、G.hour 是當地時間）；私訊版的第二個回覆沒有 Alison 那句 */
          L[1].ask={id:'y4_r1_us',must:true,opts:[{t:'超市的冷凍水餃。',say:[{from:'zhe',text:'……回來請你吃麵'}]},{t:'（傳一張照片：公寓廚房的一鍋泡麵）',say:inG?[{from:'yu',text:'好可憐'}]:[]}]}; PHONE.at(G,d7,7.5,L,'y4_r1_us'); } } } };
  S.y4PathSisLine=function(G){ const F=(G&&G.flags)||{}; return {bar:'好。你自己選的，你就念得下去。',grad:'好。要念，就念你想問的那一題。',other:'好。換方向不會怎樣。你知道的。'}[F.Y4_PATH]||(F.SISTER_TALK==='search'?'上次說了，我二十六歲也還在找。你急什麼。':'慢慢來。我到現在也還在找。'); };   /* 「上次說了」只給主線 7 選了③的人 */
  /* ---- 1A-08 大四要怎麼過？ ---- */
  const Y3S2_FE=new WeakMap();
  S.y3s2FinalEnd=function(G){ const key=typeof CLS!=='undefined'&&CLS.termCourses?CLS.termCourses(G,'Y3S2').map(c=>c.id).join(','):''; const c=Y3S2_FE.get(G); if(c&&c.key===key) return c.v;   /* 算一次要掃整學期：依同一個 G、同一組修的課記住（同 y0FinalEnd）*/
    let v=null; try{ v=typeof CLS!=='undefined'&&CLS.lastExamEnd?CLS.lastExamEnd(G,'Y3S2','final'):null; }catch(e){ v=null; } if(!v){ const d=termDay('Y3S2',16,5); v=d!=null?{day:d,h:17}:null; }   /* 沒有考試的課表：第 16 週週五（2028-06-02）*/
    Y3S2_FE.set(G,{key,v}); return v; };
  S.y4PathAt=function(G){ if(S.route(G)==='JP'){ const d=S.dayOfKey(ROUTE_DATES.JP.ret); return d!=null?{day:d,h:20}:null; } const e=S.y3s2FinalEnd(G); return e?{day:e.day,h:21}:null; };   /* 日本：8/5 返台那晚；台灣、美國：最後一科考完那天 21:00 */
  S.y4PathDue=function(G){ const F=(G&&G.flags)||{}; if(!y4Law(G)||F.Y4_PATH||y4Done(G,'ev_y4_path')) return false; const w16=S.dayOfKey('2028-06-05'); if(w16!=null&&G.day<w16) return false;   /* 大三下第 16 週以前不用算（每 0.5 秒叫一次）*/ const a=S.y4PathAt(G); return !!a&&y4Past(G,a.day,a.h)&&!S.abroad(G); };
  S.y4Path2Due=function(G){ const F=(G&&G.flags)||{}, d=y4D('again'); return y4Law(G)&&d!=null&&F.Y4_PATH==='undecided'&&F.Y4_PATH_ASK2==null&&(F.Y4_PATH_DAY==null||F.Y4_PATH_DAY<d)&&y4Past(G,d,21); };   /* 選④：大四上 10/16 21:00 再問一次（AA_181 2-4）*/
  S.y4Path=async function(GM){ const G=GM.G, F=G.flags, again=!S.y4PathDue(G)&&S.y4Path2Due(G); if(!again&&!S.y4PathDue(G)) return false; const ev=y4Ev(again?'ev_y4_path_again':'ev_y4_path'); if(!ev||typeof EVENTS==='undefined') return false;
    const E=GM.E, P=E&&E.player, desk=G.zone==='dorm'&&!y4AtHome(G)&&E&&(E.interactables||[]).find(x=>x.deskStudy), seat=desk&&desk.seat; if(seat&&P&&GM.sitAt) GM.sitAt(P,seat);   /* 宿舍書桌前（AA_317 第 6 節第 1 點）*/
    try{ await EVENTS.run(ev); } finally{ if(seat&&P&&GM.standUp) GM.standUp(P); }
    if(again&&y4Done(G,'ev_y4_path_again')) F.Y4_PATH_ASK2=G.day; return true; };
  /* ---- 1A-09 主線 10 第四個房間（AA_318 第 2 節；照 unboxY3）---- */
  S.ROOM_Y4_TEXT={form:['志願表',null],cold:['一個便利商店的塑膠袋','交誼廳那晚提上樓的。你後來一直拿它裝別的東西。'],land:['大伯那塊地的謄本影本','十六個名字。這次你每一個都看得懂。'],
    jp_key:['日本宿舍的鑰匙圈','鑰匙還回去了。圈圈留著。'],postcards:['一疊明信片','英國的郵戳。每一張都只寫了一兩行。'],credits:['發表會的製作名單','測試那一行，有你的名字。'],field:['一本田野筆記的影本','語彤的字。有幾頁是你幫她抄的。']};
  S.roomY4Items=function(G){ const F=(G&&G.flags)||{}, T=S.ROOM_Y4_TEXT, r=S.route(G), tw=r!=='JP'&&r!=='US', L=[], it=(id,t)=>L.push([id,T[id][0],[t||T[id][1]]]);   /* 大三這一年的東西：只有經歷過的才有 */
    it('form',tw?'那張沒交的志願表。空白的，你一直沒丟。':'志願表的影本。系辦蓋的章，有一點歪。');   /* 一定有 */
    if(F.COLD_WEEK==='night'&&Array.isArray(F.COLD_WEEK_PRESENT)&&F.COLD_WEEK_PRESENT.length) it('cold');   /* 1A-04 感冒週那晚有人來（交誼廳那晚提上樓的塑膠袋）*/
    if(F.FAMILY_LAND_Y3) it('land');   /* 1A-07 */
    if(r==='JP') it('jp_key');
    if(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has('heroine_02','POSTCARDS')) it('postcards');   /* 芷若 Z10 回寄過（1B-10，AA_321 記憶 POSTCARDS）*/
    if(F.ATTENDED_SHOW&&F.PLAYTESTED) it('credits');   /* 子晴 Q12 去了，而且 PLAYTESTED（1B-15；AA-C bf349b96 統一成 AA_322 製作名單「測試：{name}」的條件）*/
    if(tw&&F.YT_T1) it('field');   /* 台灣路線、語彤週四的田野（1B-13，AA_322 YT_T1）*/
    return L; };
  S.roomItemName=function(G,id){ const m=/^y1_(\d+)$/.exec(id||''); if(m) return (ROOM_ITEMS[+m[1]]||[])[0]||null; return ((S.ROOM_Y4_TEXT[id]||S.ROOM_Y3_TEXT[id]||S.ROOM_Y2_TEXT[id])||[])[0]||null; };   /* 大一的五件（y1_0＝書架上的舊《民法》）、大二、大三、大四拆出來的東西的名字 */
  S.roomY4Due=G=>{ if(!y4Law(G)||!G.flags||G.flags.ROOM_Y4) return false; const d=y4D('room'), late=y4D('y4s2'); if(d==null||G.day<d||(late!=null&&G.day>=late)) return false;
    if(S.route(G)==='US'){ const r=S.dayOfKey(ROUTE_DATES.US.ret); return r!=null&&G.day>=r; } return true; };   /* 美國路線：12/23 返台才搬（exchange3d.js 的返台直接接）*/
  S.roomY4Late=G=>{ const F=G&&G.flags; if(!F||F.ROOM_Y4||!y4Law(G)) return false; const late=y4D('y4s2'); if(late==null||G.day<late) return false; F.ROOM_Y4=G.day; F.ROOM_Y4_ITEMS=[]; F.BOX_KEPT_Y4=null; return true; };   /* 大四下以後才讀檔、還沒搬：直接記、不演 */
  S.roomY4Lines=G=>['（明天開學。最後一次搬進宿舍。）'].concat(S.route(G)==='JP'?['（抽籤是姊姊幫你填的表。）']:[]);
  S.ROOM_Y4_US=['（傍晚，你從家裡出發，回宿舍。）','（409 的床位七月就抽好了。鑰匙在舍監那裡等你。）'];   /* AA-C bf349b96：清晨 05:40 落地、上午回家，第一句改（原本「機場出來，你沒有回家，直接去宿舍。」對不上）*/   /* e75ebc69（AA_326 裁定 #39）：美國路線 7/15 在臺灣，自己抽 */
  S.roomY4InDorm=async function(GM){ const G=GM.G; if(!S.roomY4Due(G)) return false; const us=S.route(G)==='US'; GM.sceneBegin();
    try{ if(!us) for(const t of S.roomY4Lines(G)) await GM.say(null,t); await GM.fade(true); if(GM.titleCard) await GM.titleCard(us?'四樓 409 號房':'搬到新的房間',us?'':'四樓 409 號房',2400); GM.advance(0.5);
      G.flags.ROOM_Y4_MOVING=true; if(GM.enter) await GM.enter('dorm',Object.assign({},Y4_DORM)); await GM.fade(false); }   /* ROOM_Y4_MOVING：房間直接蓋成 409、紙箱封好（zones3d.js），拆完 unboxY4 清掉 */
    finally{ GM.sceneEnd(); }
    return S.unboxY4(GM); };
  S.roomY4FromHome=async function(GM){ const G=GM.G; GM.sceneBegin();   /* 在臺北的家（home3d.js 的 loop；照主線 3、5 那一段）*/
    try{ if(typeof ADV!=='undefined'&&typeof HOME!=='undefined'&&HOME.bgNow) ADV.begin({background:HOME.bgNow()}); for(const t of S.roomY4Lines(G)) await GM.say(null,t);
      await GM.fade(true); if(GM.titleCard){ await GM.titleCard('回宿舍','捷運＋公車 約 40 分鐘',2400); await GM.titleCard('搬到新的房間','四樓 409 號房',2000); } GM.advance(0.7); y4LeaveHome(G); if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
      G.flags.ROOM_Y4_MOVING=true; if(GM.enter) await GM.enter('dorm',Object.assign({},Y4_DORM)); await GM.fade(false); }
    finally{ GM.sceneEnd(); }
    return S.unboxY4(GM); };
  S.roomY4FromAirport=async function(GM){ const G=GM.G; GM.sceneBegin();   /* 美國路線 12/23 晚上（exchange3d.js 的返台接這裡；AA_144 X3、AA_291 第 5 節）*/
    try{ if(typeof ADV!=='undefined') ADV.begin({background:'dark'}); await GM.fade(false); for(const t of S.ROOM_Y4_US) await GM.say(null,t); if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
      await GM.fade(true); if(GM.titleCard) await GM.titleCard('四樓 409 號房','',2400); GM.advance(1.5); G.flags.ROOM_Y4_MOVING=true; if(GM.enter) await GM.enter('dorm',Object.assign({},Y4_DORM)); await GM.fade(false); }
    finally{ GM.sceneEnd(); }
    return S.unboxY4(GM); };
  /* 前任的紙箱（AA_437 第 6 節；企劃線 fc6f20bc0，台詞照抄）：收拾的時刻選了「還東西、收紙箱」（v6ex3d.js 記 CLEANUP_BOX：[{id, day}]）＝拆箱第二步之後、第三步之前多一步（美國路線 12/23 晚上的拆箱一樣）。
     收過的每一位各一句：照分開的先後（CLEANUP_BOX 的順序；同一位收過兩次照最後那一次），三位以上只出最近的兩位；已經重新交往的那一位不算（現在在交往）。表上七位以外的不算；一位都沒有＝沒有這一步。
     「（打開）」＝每一位一句＋「（你把箱子蓋起來。這次沒有貼膠帶。）」，記 EXBOX_Y4 'open'；「（不打開，放到床底下）」＝「（你把它推到床底下最裡面。）」，記 BOX_KEPT_Y4='exbox'、EXBOX_Y4 'kept'。
     子晴：D03 和她轉過扭蛋（date3d.js 的 dateMemory.heroine_04.D03.picks 有 D03.gacha，或做完的那一趟 spots 有）＝扭蛋；沒有＝測試帳號卡。
     第三步「留一件在紙箱裡」的選單不列這個紙箱；第三步又留了一件東西＝BOX_KEPT_Y4 記那一件（那一件不拿出來、主線 11 先拿它；EXBOX_Y4 還是 'kept'）。
     主線 11（S.packY4）：EXBOX_Y4 'kept'＝第一個拿起來的是它，兩句旁白（AA_437 第 10 節第 3 點）；「你從紙箱裡拿出{東西}」那一段照舊只給房間的東西 */
  S.EXBOX_Y4={heroine_01:'（一頁影印紙。她手帳那一頁的影本，最上面那一行被劃掉了。）',heroine_03:'（麵店的筷套，背面寫著一個週四的日期。是她的字。）',heroine_02:'（兩張票根，用迴紋針夾在一起。）',
    heroine_04:'（一隻扭蛋，拿著搖桿的貓。）',heroine_05:'（一張便條。「回到家傳訊息給我。」她的字。）',kexin:'（摩天輪的票根、寫滿的筆記本、河堤的相簿。三樣疊在一起。）',classmate_peishan:'（她借你的漫畫，第三集。你一直沒有還。）'};
  S.EXBOX_ZQ_NO='（一張她做的遊戲的測試帳號卡。）';   /* 子晴：沒有在 D03 轉過扭蛋 */
  S.EXBOX_LINES={top:'（最下面那個紙箱，膠帶是你自己貼的。）',opts:['（打開）','（不打開，放到床底下）'],close:'（你把箱子蓋起來。這次沒有貼膠帶。）',kept:'（你把它推到床底下最裡面。）'};
  S.zqGacha=G=>{ const M=G&&G.dateMemory&&G.dateMemory.heroine_04, m=M&&M.D03; if(m&&Array.isArray(m.picks)&&m.picks.includes('D03.gacha')) return true;
    return Array.isArray(G&&G.trips)&&G.trips.some(t=>t&&t.who==='heroine_04'&&t.status==='done'&&Array.isArray(t.spots)&&t.spots.includes('D03.gacha')); };
  S.exBoxWho=function(G){ const F=(G&&G.flags)||{}, B=Array.isArray(F.CLEANUP_BOX)?F.CLEANUP_BOX:[], out=[];
    for(const b of B){ const id=b&&b.id; if(!id||!Object.prototype.hasOwnProperty.call(S.EXBOX_Y4,id)) continue; const i=out.indexOf(id); if(i>=0) out.splice(i,1); out.push(id); }
    return out.filter(id=>!cwDating(G,id)).slice(-2); };
  S.exBoxLine=(G,id)=>id==='heroine_04'&&!S.zqGacha(G)?S.EXBOX_ZQ_NO:S.EXBOX_Y4[id];
  S.unboxY4=async function(GM){ const G=GM.G, F=G.flags; if(!S.roomY4Due(G)) return false; F.ROOM_Y4=G.day; if(typeof DM3!=='undefined'&&DM3.fixRoomExit&&G.zone==='dorm') DM3.fixRoomExit(GM.E,G);
    const y2=Array.isArray(F.ROOM_Y2_ITEMS)?F.ROOM_Y2_ITEMS.slice():S.roomY2Items(G).map(r=>r[0]), y3=Array.isArray(F.ROOM_Y3_ITEMS)?F.ROOM_Y3_ITEMS.slice():[];
    const old=y2.concat(y3).filter(id=>id!==F.ROOM_Y3_DISCARD), L=S.roomY4Items(G), shown=[]; F.ROOM_Y4_ITEMS=shown; F.BOX_KEPT_Y4=null;
    const Z=GM.E&&GM.E.zone, vis=st=>{ if(Z&&Z.setY2Items) Z.setY2Items(st); }, has=keep=>old.concat(shown).filter(id=>id!==keep);   /* 3D：大二那組（dorm_y2_items.glb）＋大三、大四的（dorm_y3_items.glb）*/
    GM.sceneBegin(); vis({shown:[],boxes:'closed'});
    try{ await GM.say(null,'（這是最後一次拆箱。）');
      vis({shown:has(null)}); await GM.say(null,'（這些東西，閉著眼睛也知道要放哪裡。）');   /* 第一步：前兩年的東西一次拿出來（扣掉大三丟掉的）*/
      for(let guard=0;guard<40&&L.length;guard++){ const i=await GM.choose(L.map(r=>({t:'（拿出'+r[1]+'）'}))); const r=L.splice(i>=0&&i<L.length?i:0,1)[0]; shown.push(r[0]); vis({shown:has(null)}); for(const t of r[2]) await GM.say(null,t); }   /* 第二步：大三這一年的東西，一件一件 */
      if(F.POTHOS) await GM.say(null,(F.pothosWaterN|0)>0?'黃金葛。第四個窗台。它已經垂到書桌了。':'黃金葛。第四個房間。它還是沒死。');   /* 照舊跟著搬，第二步最後一句 */
      let exKept=false; const exW=S.exBoxWho(G);   /* 前任的紙箱（AA_437 第 6 節）：第二步之後、第三步之前 */
      if(exW.length){ const XL=S.EXBOX_LINES; await GM.say(null,XL.top); const k=await GM.choose(XL.opts.map(t=>({t})));
        if(k===1){ await GM.say(null,XL.kept); exKept=true; F.EXBOX_Y4='kept'; F.BOX_KEPT_Y4='exbox'; }
        else { for(const id of exW) await GM.say(null,S.exBoxLine(G,id)); await GM.say(null,XL.close); F.EXBOX_Y4='open'; } }
      delete F.ROOM_Y4_MOVING; vis({boxes:'open'});
      const can=old.concat(shown).filter(id=>id!=='pothos'&&id!=='exbox'&&S.roomItemName(G,id));   /* 第三步：選一件留在紙箱裡（黃金葛、前任的紙箱不列）*/
      const opts=can.map(id=>({t:'（把'+S.roomItemName(G,id)+'留在紙箱裡）',id})).concat([{t:'（全部拿出來。）',id:null}]); const k=await GM.choose(opts.map(o=>({t:o.t}))); const o=opts[k>=0&&k<opts.length?k:opts.length-1];
      F.BOX_KEPT_Y4=o.id||(exKept?'exbox':null); if(o.id) vis({shown:has(o.id)});   /* 「全部拿出來」：床底下的紙箱照舊 'exbox' */
      await GM.say(null,S.route(G)==='US'?'（三年。這個房間，你只會住半年。）':'（三年。這個房間，你只會住一年。）');   /* AA_370 L10：美國路線 12/23 才搬進來（大四下就畢業）＝半年 */
      GM.memo('搬進第四個房間'); if(GM.autosave) GM.autosave(); }
    finally{ delete F.ROOM_Y4_MOVING; GM.sceneEnd(); }
    return true; };
  /* ---- 1A-10 R1 時差：9/7 18:45～19:15 人在麵店就演（events.js ev_r1_jetlag；比一般的 auto 事件先）---- */
  S.r1Due=function(G){ const d=y4D('r1'); return y4Law(G)&&d!=null&&G.day===d&&G.zone==='noodle'&&G.hour>=18.75&&G.hour<19.25&&!(G.flags&&G.flags.R1_SEEN)&&S.route(G)!=='US'&&typeof PHONE!=='undefined'&&PHONE.sent(G,'y4_r1_ask'); };
  S.r1Table=async function(GM){ if(!S.r1Due(GM.G)) return false; const ev=y4Ev('ev_r1_jetlag'); if(!ev||typeof EVENTS==='undefined') return false; await EVENTS.run(ev); return true; };
  /* ---- 1A-11 主線 11 搬出宿舍前的收拾（反向的拆箱；AA_318 第 2 節）---- */
  S.packItems=function(G){ const F=(G&&G.flags)||{}, y2=Array.isArray(F.ROOM_Y2_ITEMS)?F.ROOM_Y2_ITEMS:(F.ROOM_Y2?S.roomY2Items(G).map(r=>r[0]):[]), y3=Array.isArray(F.ROOM_Y3_ITEMS)?F.ROOM_Y3_ITEMS:[], y4=Array.isArray(F.ROOM_Y4_ITEMS)?F.ROOM_Y4_ITEMS:[];
    const out=[]; for(const id of y2.concat(y3,y4)) if(id!==F.ROOM_Y3_DISCARD&&!out.includes(id)&&S.roomItemName(G,id)) out.push(id); return out; };   /* 房間裡的東西：大一的五件、大二、大三、大四拆出來的（扣掉大三丟掉的）*/
  S.packLines=function(G,id){ if(id==='pothos') return ['黃金葛不能裝箱。你把它抱在手上。'];   /* 黃金葛只說這一句（「你把它放進紙箱」和「不能裝箱」會打架；請 AA 確認）*/
    const r=S.route(G), L=['（'+S.roomItemName(G,id)+'。你把它放進紙箱。）'], x={y1_0:'四年前看不懂的那幾頁，現在你知道它們在講什麼。',civ:'你後來把它讀完了。',noodle:'過期了。你還是沒吃。',form:r==='JP'||r==='US'?'蓋了章的那一張。':'空白的那一張。'}[id];
    if(x) L.push(x); return L; };
  S.EXBOX_PACK=['（床底下最裡面那個紙箱。膠帶還貼著。）','（你沒有打開，把它放進要帶回家的那一堆。）'];   /* AA_437 第 10 節第 3 點（企劃線 0c97c3c05）*/
  S.packDue=function(G){ const F=(G&&G.flags)||{}, d=y4D('pack'); return y4Law(G)&&d!=null&&G.day===d&&G.hour>=20&&!F.PACKED_Y4; };
  S.packY4=async function(GM,o){ o=o||{}; const G=GM.G, F=G.flags; if(!S.packDue(G)) return false; F.PACKED_Y4=G.day; cwDone(G,'ev_pack_y4');
    const kept=F.BOX_KEPT_Y4&&F.BOX_KEPT_Y4!=='exbox'&&S.roomItemName(G,F.BOX_KEPT_Y4)?F.BOX_KEPT_Y4:null, L=S.packItems(G).filter(id=>id!==F.BOX_KEPT_Y4);   /* 'exbox'（前任的紙箱，AA_437 第 6 節）：AA_318 第 4 節沒有寫它那一句，跳過第一件 */
    GM.sceneBegin(); try{
      if(o.fromHome||G.zone!=='dorm'){ await GM.say(null,'（明天畢業典禮。你回宿舍收東西。）'); await GM.fade(true);   /* 在家的時候 G.zone 還是離開前的 3D 區域（可能就是 dorm）：照 fromHome */ if(GM.titleCard) await GM.titleCard('回宿舍',o.fromHome?'捷運＋公車 約 40 分鐘':'',2000);   /* 人在別的地方（B3：不會錯過）*/
        if(o.fromHome){ GM.advance(0.7); y4LeaveHome(G); if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); } if(GM.enter) await GM.enter('dorm',Object.assign({},Y4_DORM)); await GM.fade(false); }
      const Z=GM.E&&GM.E.zone, vis=st=>{ if(Z&&Z.setY2Items) Z.setY2Items(st); }, left=()=>L.slice();   /* 3D：一件一件拿掉（setY2Items；大二、大三、大四的都有模型）*/ vis({shown:left(),boxes:'open'});   /* 從別的地方回來：房間蓋好時已經是 PACKED_Y4（收起來），先擺回還沒裝的 */
      await GM.say(null,'（明天畢業典禮。房間裡的東西，要一件一件裝回紙箱。）');
      if(F.EXBOX_Y4==='kept') for(const t of S.EXBOX_PACK) await GM.say(null,t);   /* 前任的紙箱（主線 10 沒打開、放床底下）：第一個拿起來的就是它（AA_437 第 10 節第 3 點，不加選項）*/
      if(kept){ await GM.say(null,'（你從紙箱裡拿出'+S.roomItemName(G,kept)+'。）'); await GM.say(null,'（這一件，你一年都沒有拿出來。）'); await GM.say(null,'（你把它放回去。這次，連箱子一起帶走。）'); }   /* 第一件：BOX_KEPT_Y4 */
      for(let guard=0;guard<80&&L.length;guard++){ const k=await GM.choose(L.map(id=>({t:'（拿起'+S.roomItemName(G,id)+'）'})).concat([{t:'（剩下的一起裝）'}]));
        if(!(k>=0&&k<L.length)){ L.length=0; vis({shown:[]}); await GM.say(null,'（剩下的東西，你一起放進最後兩個箱子。）'); break; }
        const id=L.splice(k,1)[0]; vis({shown:left()}); for(const t of S.packLines(G,id)) await GM.say(null,t); }
      vis({shown:[],boxes:'closed'});
      await GM.say(null,'（床底下最後一個紙箱。上面是媽媽的字：「冬天的衣服」。）');   /* 最後一件一定是「冬天的衣服」（AA_12）：大一 8/29 起床底下那一箱，拆不拆都摺好留著（AA_347 5-1，src/y1fill3d.js 的 BOX_WINTER_OPEN）*/
      await GM.say(null,'（大一搬進來那天，媽媽寫的。四年了，你一直沒把那幾個字撕掉。）');
      await GM.say(null,'（四年。房間又空了。可是這次空，是因為要走了。）'); }
    finally{ GM.sceneEnd(); }
    if(GM.memo) GM.memo('搬出宿舍前的收拾'); if(GM.autosave) GM.autosave(); return true; };
  /* ---- 1A-12 主線 12 畢業典禮的家人（AA_318 第 2 節；交接包_v5 第 3 節第 15 週的順序）---- */
  S.gradMorningDue=function(G){ const d=y4D('grad'); return y4Law(G)&&d!=null&&G.day===d&&G.hour>=7.5&&!y4Done(G,'ev_grad_family'); };
  S.gradFamily=async function(GM){ const G=GM.G, F=G.flags; if(!S.gradMorningDue(G)) return false; cwDone(G,'ev_grad_family'); const at=x=>{ if(G.hour<x) GM.advance(x-G.hour); }, bgOf=k=>typeof OUT!=='undefined'?OUT.bg(k):'dark';
    GM.sceneBegin(); try{
      at(8); await GM.say(null,'（學士服掛在門後面，已經燙過了。）');   /* 08:00 宿舍 */
      await GM.fade(true); if(GM.titleCard) await GM.titleCard('2029 年 6 月 2 日','畢業典禮｜新體育館',2600); at(9);
      const g3=typeof GYMCER!=='undefined'&&GYMCER.gradStage?await GYMCER.gradStage(GM):false;   /* 體育館 3F 的 3D（AA_399 第 4 節，src/gymcer3d.js）：坐法律學院那一區、家人在南看台；沒有布置＝照原本 2D */
      if(typeof ADV!=='undefined') ADV.begin({background:g3?'blur':bgOf('ntu_gym_ceremony')}); await GM.fade(false);
      await GM.say(null,'（看台上，媽媽一直在揮手。爸爸舉著手機，沒有放下來過。）');   /* 09:00～10:30 校級典禮，家人坐看台 */
      if(typeof PG!=='undefined'&&PG.beforeLawCeremony) await PG.beforeLawCeremony(GM,bgOf('ntu_gym_ceremony'));   /* 和芷若交往：典禮開始前的視訊（AA_319 1A-13，src/postgrad3d.js）*/
      await GM.fade(true); at(11); if(typeof ADV!=='undefined'&&ADV.setBg) ADV.setBg(bgOf('linze_auditorium')); await GM.fade(false);
      await GM.say(null,'（撥穗。帽子上的穗從右邊換到左邊，只有一秒。）'); F.GRADUATED=G.day; F.GRAD_DONE=true;   /* GRAD_DONE：閒聊階梯的 skipIf（ladder.js A8-L6、A8-L7、Y8-L1、Y8-L4、S7-L8、招呼的 unless：典禮演完，6/2 晚上、6/3 不播「典禮那天……」的未來式；BB210-Y4S2，原本沒有人設）*/   /* 11:00～12:00 法律學院典禮（霖澤館一樓大禮堂）*/
      if(S.routeAbroadRoute(G)) await GM.say(null,S.routeAbroadRoute(G)==='US'?'（還差一門實習和兩門課，證書下學期才拿得到。）':'（還差一門實習，證書下學期才拿得到。）');   /* 交換延畢（AA_144 X5）；美國路線還要補修兩門課（AA_382 第 1 節）*/
      if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); await GM.fade(true); at(11+55/60); if(g3&&GYMCER.gradEnd) GYMCER.gradEnd(GM); if(GM.enter) await GM.enter('linze',Object.assign({},Y4_LOBBY)); await GM.fade(false);
      if(typeof ADV!=='undefined') ADV.begin({background:'blur'});   /* 11:55 大禮堂外的大廳（3D linze）*/
      await GM.say(MOM_W,'我們家第一個台大畢業的。'); await GM.say(null,'（媽媽哭了。）'); await GM.say(null,'（爸爸沒有說話，拍照拍了五十張。）');
      await GM.say(SIS_W,'媽，不要哭了，妝。'); await GM.say(MOM_W,'（從包包裡拿出一個信封）對了，大伯叫我拿給你——'); await GM.say(SIS_W,'媽！今天！今天不要！');
      const k=await GM.choose([{t:'「好。我回去看。」'},{t:'「媽，今天先拍照。」'}]);   /* 兩個都一定出現、不讀傾向（AA_318 附 #3）*/
      if(k===1){ F.GRAD_ENVELOPE='later'; await GM.say(null,'（姊姊比了一個讚。）'); await GM.say(null,'媽媽把信封收回包包：「那晚上給你。」'); }
      else { F.GRAD_ENVELOPE='took'; await GM.say(null,(G.name||'祐廷')+'接過信封，放進學士服的口袋。'); await GM.say(null,'（媽媽擦了一下眼睛。）'); }
      at(12); }   /* 12:00 起椰林大道、傅鐘前拍照＝1A-13（AA_319）*/
    finally{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); }
    if(GM.memo) GM.memo('畢業典禮'); if(GM.autosave) GM.autosave(); return true; };
  S.gradLunchDue=function(G){ const d=y4D('grad'); return y4Law(G)&&d!=null&&G.day===d&&G.hour>=13.5&&G.hour<17&&y4Done(G,'ev_grad_family')&&!y4Done(G,'ev_grad_lunch'); };
  S.gradLunch=async function(GM){ const G=GM.G; if(!S.gradLunchDue(G)) return false; cwDone(G,'ev_grad_lunch'); GM.sceneBegin();   /* 13:30 和家人吃午餐 */
    try{ await GM.fade(true); if(G.zone!=='gongguan'&&GM.enter) await GM.enter('gongguan',Object.assign({},Y4_GG)); if(GM.titleCard) await GM.titleCard('公館的餐廳','',2200); await GM.fade(false);   /* 3D 公館＋字卡（「公館的餐廳」的 2D 背景還沒有）*/
      if(typeof ADV!=='undefined') ADV.begin({background:'blur'});
      await GM.say(null,'（公館的餐廳。爸爸點了一桌，說是慶祝。）'); await GM.say(null,'（媽媽把每一道菜都拍了一張。）'); await GM.say(SIS_W,'媽，妳拍菜比拍他多。'); }
    finally{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); }
    GM.advance(1.5); if(GM.autosave) GM.autosave(); return true; };
  S.gradEnvelopeDue=function(G){ const d=y4D('grad'); return y4Law(G)&&d!=null&&G.day>=d&&G.day<=d+2&&(G.day>d||G.hour>=22)&&y4Done(G,'ev_grad_family')&&!y4Done(G,'ev_grad_envelope')&&!y4Done(G,'ev_grad_envelope_bed'); };   /* 22:00 宿舍房間，第一次在房間的時候 */
  S.gradEnvelope=async function(GM){ if(!S.gradEnvelopeDue(GM.G)) return false; const ev=y4Ev('ev_grad_envelope'); if(!ev||typeof EVENTS==='undefined') return false; await EVENTS.run(ev); return true; };
  /* ---- 1A-15 宿舍期滿搬走＋麵店工讀二選一（AA_318 第 2 節）---- */
  S.moveOutDue=function(G){ const F=(G&&G.flags)||{}, d=y4D('out'); return y4Law(G)&&d!=null&&y4Past(G,d,10)&&!F.MOVED_OUT; };
  S.moveOutY4=async function(GM,o){ o=o||{}; const G=GM.G, F=G.flags; if(!S.moveOutDue(G)) return false; F.MOVED_OUT=G.day; cwDone(G,'ev_move_out_y4');
    const bar=F.Y4_PATH==='bar'&&!S.routeAbroadRoute(G), bgOf=k=>typeof OUT!=='undefined'?OUT.bg(k):'dark'; F.HOME_AFTER=bar?'gongguan':'home';   /* 交換延畢的玩家一律回家 */
    GM.sceneBegin(); try{
      if(o.fromHome||G.zone!=='dorm_hall'){ await GM.fade(true); if((o.fromHome||G.zone!=='dorm')&&GM.titleCard) await GM.titleCard('回宿舍',o.fromHome?'捷運＋公車 約 40 分鐘':'',2000);
        if(o.fromHome){ GM.advance(0.7); y4LeaveHome(G); if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); } if(GM.enter) await GM.enter('dorm_hall',Object.assign({},Y4_DOOR)); await GM.fade(false); }   /* 宿舍一樓門口 */
      if(typeof ADV!=='undefined') ADV.begin({background:'blur'});
      if(!F.PACKED_Y4) await GM.say(null,'（你連夜把東西裝好。）');   /* 沒收拾的舊存檔 */
      await GM.say(null,'（宿舍期滿。舍監在門口收鑰匙。）'); await GM.say(null,'（409 的鑰匙交出去的時候，舍監看了一下名單：「四年，四個房間。」）');
      await GM.say(null,'「冬天的衣服」那一箱，最後一個搬上車。');
      await GM.fade(true); GM.advance(0.7); if(typeof ADV!=='undefined'&&ADV.setBg) ADV.setBg(bgOf(bar?'home_room_night':'home_room_day')); await GM.fade(false);
      if(bar){ await GM.say(null,'（你租的套房在公館，走路到總圖十分鐘。）'); if(GM.titleCard) await GM.titleCard('公館的套房','',2200); }   /* SCN-V5-01（AA_175）3D 還沒有：2D home_room_night＋字卡 */
      else await GM.say(null,'（車開回臺北的家。你的房間，媽媽又打掃過了。）');
      await GM.say(null,F.Y4_PATH==='bar'||F.Y4_PATH==='grad'?'（兵役的時間，你排在考試之後。）':'（兵役的時間，你排好了。）'); }   /* AA_99 10-2：一句旁白，不做事件 */
    finally{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); }
    if(bar){ if(GM.enter) await GM.enter('gongguan',Object.assign({},Y4_GG)); } else if(typeof HOME!=='undefined'&&HOME.rec){ const H=HOME.rec(G); H.at=true; H.day=G.day; }   /* 之後：公館（套房在附近）／臺北的家（home3d.js 的選單）*/
    if(GM.memo) GM.memo('搬出宿舍'); if(GM.autosave) GM.autosave(); return true; };
  /* ---- 睡著也會醒來（S.lawWakeAt）、鬧鐘（S.wakeAlarms）---- */
  S.y4WakeAt=function(G){ const F=(G&&G.flags)||{}, d=y4D('pack'); if(!y4Law(G)) return null; return d!=null&&G.day===d&&G.hour<20&&!F.PACKED_Y4?20:null; };   /* 6/1 20:00 收拾 */
  S.y4Alarms=function(G,day){ const out=[]; if(!y4Law(G)) return out; const dg=y4D('grad'), dm=y4D('out');
    if(dg!=null&&day===dg&&!y4Done(G,'ev_grad_family')) out.push({h:8,why:'畢業典禮'}); if(dm!=null&&day===dm&&!(G.flags&&G.flags.MOVED_OUT)) out.push({h:10,why:'宿舍期滿'}); return out; };
  /* ---- 每 0.5 秒（S.tick；人在家的時候 home3d.js 的選單管：S.y4HomeDue）---- */
  let y4Busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['story3d:y4Busy']=()=>{ y4Busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.y4Tick=function(GM){ const G=GM.G; if(y4Busy||!y4Law(G)||!G.flags||y4AtHome(G)) return false; if(typeof TRIP!=='undefined'&&TRIP.at&&TRIP.at(G)) return false;
    const go=f=>{ y4Busy=true; Promise.resolve().then(f).catch(e=>console.warn('Y4',e)).finally(()=>{ y4Busy=false; }); return true; };
    S.roomY4Late(G);
    if(G.zone==='noodle'&&typeof OUT!=='undefined'&&G.day===y4D('r1')&&G.hour>=18){ const q=OUT.get(G,'y4_r1'); if(q&&q.state==='planned') q.state='done'; }   /* 9/7 傍晚自己走到麵店了：不用再問「出發」*/
    if(S.r1Due(G)) return go(()=>S.r1Table(GM));
    if((S.y4PathDue(G)&&(S.route(G)==='JP'||G.zone==='dorm'))||(!S.y4PathDue(G)&&S.y4Path2Due(G)&&(G.zone==='dorm'||G.zone==='us_apartment'))) return go(()=>S.y4Path(GM));
    if(G.zone==='dorm'&&S.roomY4Due(G)) return go(()=>S.roomY4InDorm(GM));
    if(S.packDue(G)) return go(()=>S.packY4(GM));
    if(S.gradMorningDue(G)) return go(()=>S.gradFamily(GM));
    if(S.gradLunchDue(G)) return go(()=>S.gradLunch(GM));
    if(G.zone==='dorm'&&S.gradEnvelopeDue(G)) return go(()=>S.gradEnvelope(GM));
    if(S.moveOutDue(G)) return go(()=>S.moveOutY4(GM));
    return false; };
  /* ---- 在臺北的家（home3d.js 的 loop 每一輪問）：'stay'＝在家演（1A-08）；其他＝先離開家再演 ---- */
  S.y4HomeDue=function(G){ if(!y4Law(G)) return null; S.roomY4Late(G); if(S.y4PathDue(G)||S.y4Path2Due(G)) return 'stay'; if(S.roomY4Due(G)) return 'room'; if(S.packDue(G)) return 'pack'; if(S.gradMorningDue(G)) return 'grad'; if(S.gradLunchDue(G)) return 'lunch'; if(S.moveOutDue(G)) return 'out'; return null; };
  S.y4HomeScene=GM=>S.y4Path(GM);
  S.y4FromHome=async function(GM,k){ const G=GM.G;
    if(k==='room') return S.roomY4FromHome(GM); if(k==='pack') return S.packY4(GM,{fromHome:true}); if(k==='out') return S.moveOutY4(GM,{fromHome:true});
    GM.sceneBegin(); try{ if(k==='grad'){ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回宿舍','捷運＋公車 約 40 分鐘',2000); GM.advance(0.7); }   /* 畢業典禮那天在家醒來：先回宿舍（學士服在宿舍）*/
      y4LeaveHome(G); if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); if(k==='grad'&&GM.enter){ await GM.enter('dorm',Object.assign({},Y4_DORM)); await GM.fade(false); } }
    finally{ GM.sceneEnd(); }
    return k==='grad'?S.gradFamily(GM):k==='lunch'?S.gradLunch(GM):false; };
  /* 現在的學期在不在 {from, until} 裡（例：人物有伴侶的那幾個學期，invites3d.js 的 partnerBlock）*/
  /* 伴侶期間（AA 2026-10-14：照劇情事件，不照整學期；事件還沒發生、或玩家沒看到時，照日期當保底）：
     {from, until}＝學期（舊格式照舊）；fromWeek／untilWeek＝{term, week}（untilWeek 那一週結束算分開）；startEvent／endEvent＝事件 id（演過就開始／結束；那些事件做好時填）*/
  /* from 可以是學期（'Y1S2'）或日期（'YYYY-MM-DD'，那一天起；AA_373 #3：沛珊 2026-04-06＝大一下第 7 週週一，4/15 期中晚餐柏翰「上禮拜的事。」）*/
  const isDayKey=s=>typeof s==='string'&&/^\d{4}-\d\d-\d\d$/.test(s);
  const fromOk=(G,from,ti0)=>{ if(isDayKey(from)){ const d=S.dayOfKey(from); return d!=null&&G.day>=d; } return ti0>=TERM_ORDER.indexOf(from); };
  S.partnerOn=function(G,p){ if(!p) return false; if(p.unlessFlag&&G&&G.flags&&G.flags[p.unlessFlag]) return false;   /* unlessFlag：和她交往中＝沒有這一段（沛珊×柏翰，AA_374 第 11 項）*/ const T=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; if(!T) return false;
    const done=id=>!!(id&&G.events&&G.events.done&&G.events.done[id]); const ti=id=>TERM_ORDER.indexOf(id), cur=[ti(T.id),T.week|0];
    const ge=(a,b)=>a[0]>b[0]||(a[0]===b[0]&&a[1]>=b[1]), gt=(a,b)=>a[0]>b[0]||(a[0]===b[0]&&a[1]>b[1]);
    const started=done(p.startEvent)||(p.fromWeek?ge(cur,[ti(p.fromWeek.term),p.fromWeek.week]):(p.startEvent&&!p.from?false:(!p.from||fromOk(G,p.from,cur[0]))));
    const ended=done(p.endEvent)||(p.untilWeek?gt(cur,[ti(p.untilWeek.term),p.untilWeek.week]):(!!p.until&&cur[0]>ti(p.until)));
    return started&&!ended; };
  S.inTerms=function(G,r){ if(!r) return false; const t=S.termAt(G.day); if(!t) return false; const i=TERM_ORDER.indexOf(t); return i>=0&&(!r.from||fromOk(G,r.from,i))&&(!r.until||i<=TERM_ORDER.indexOf(r.until)); };
  /* 寒暑假回老家的期間（AA_276 第 1 節）：期末考最後一天（第 16 週週五）的第 3 天＝放假第一天起，到下學期開學前 2 天（不含）。法律系大一起；經濟系那年照 AA_272 */
  S.homeAway=function(G){ if(typeof HOME==='undefined'||!HOME.breakOf) return false; const d0=S.dayOfKey('2025-08-29'); if(d0!=null&&G.day<d0) return false; const B=HOME.breakOf(G.day);   /* 經濟系那一年的寒暑假不算（呼叫端有時只帶 {day}）*/ return !!B&&G.day>=B.from&&G.day<=B.to-2; };
  /* AA_276 第 1 節例外：已經排在臺北的活動照常，活動結束的隔天才回老家（presence.homeAfter＝那個寒暑假留在臺北到哪一天；例：沛珊大一暑假 C02 營隊隊輔 7/1～7/5，7/6 才回台中）*/
  S.homeStay=function(P,G){ const L=P&&P.homeAfter; if(!L||typeof HOME==='undefined'||!HOME.breakOf) return false; const B=HOME.breakOf(G.day); if(!B) return false;
    return L.some(k=>{ const d=S.dayOfKey(k); return d!=null&&d>=B.from&&d<=B.to&&G.day<=d; }); };
  S.present=(id,G)=>S.presence(id,G).here;
  /* 沛珊的重考消失期（BB_205 第 3 節、BB_194 §19）：2026-12-18（P4 交接隔天）～2027-08-06 放榜，聯絡不到（presence absentDates 的 unreachable）*/
  /* 跨年大三（AA_210 第 2 節＋5-1、5-5）：12/31 21:00 群組三句（不在群組、和阿哲 FAMILIAR 以上＝阿哲私訊一句）→ 23:30 頂樓；沒去＝00:05 Alison 的合照「今年人到得最齊」；
     語彤 FAMILIAR 以上 00:0x「新年快樂。」。可昕交往中選了高雄（KX_NYE[3]＝'river'）就不排頂樓 */
  const xcMet=()=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('classmate_xinci','FIRST_MET');   /* 認識芯慈（events.js NYE_XC 同一個條件）*/
  S.nyeY3=function(GM){ const G=GM.G, F=G.flags, nye=S.dayOfKey('2027-12-31'); if(nye==null||G.day<nye||G.day>nye+1||typeof PHONE==='undefined'||typeof OUT==='undefined') return;
    const T='g:noodle_team', inG=PHONE.inGroup(G,'noodle_team'), hh=G.hour, after=G.day>nye||hh>=24, M=(w,t)=>({th:T,from:w,text:t}), kxR=(F.KX_NYE&&F.KX_NYE[3]==='river')||!!(S.sisNyeDate&&S.sisNyeDate(G,3));
    const fam=(id,st)=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&SOCIAL.has&&SOCIAL.has(id,'FIRST_MET')&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st||'FAMILIAR');
    if(G.day===nye&&hh>=21&&hh<23.5&&!PHONE.sent(G,'nye_y3_ask')){
      if(inG){ const kA=S.knows('heroine_01',G), kX=xcMet(); PHONE.at(G,nye,Math.max(21,hh),[M('zhe',kA?'十一點半，頂樓 以安說她要來':'十一點半，頂樓'),M('zhe','頂樓照開 登記一樣在一樓')].concat(kA?[M('heroine_01','我會到。')]:[],kX?[M('classmate_xinci','我家吃完飯就過去，可能晚一點。')]:[]),'nye_y3_ask'); }   /* AA_313 5-6 第 672 行：群組裡以安、芯慈那幾則也要認識才有（和私訊、頂樓那一場同一個條件）*/
      else if(fam('zhe')) PHONE.at(G,nye,Math.max(21,hh),[{th:'p:zhe',from:'zhe',text:S.knows('heroine_01',G)?'十一點半，頂樓 以安說她要來':'十一點半，頂樓'},{th:'p:zhe',from:'zhe',text:'頂樓照開 登記一樣在一樓'}],'nye_y3_ask'); }   /* 宿委會那一句大三「頂樓照開 登記一樣在一樓」（AA_456 1-1；群組、私訊都換）*/
    if(PHONE.sent(G,'nye_y3_ask')&&!kxR&&!OUT.get(G,'nye_y3')&&G.day===nye&&hh<23.75) OUT.plan(G,{id:'nye_y3',ev:'ev_y3_newyear',day:nye,h:23.5,late:0.25,place:'宿舍頂樓',title:'跨年：宿舍頂樓',travel:'走上去約 2 分鐘',travelH:1/30,back:'回到房間。'});
    if(F.dating_heroine_03&&!OUT.get(G,'yt_nye_call_y3')&&G.day===nye&&hh>=23) OUT.plan(G,{id:'yt_nye_call_y3',ev:'ev_yt_nye_call_y3',day:nye+1,h:1/60,place:'電話',title:'語彤打電話來',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'電話掛了。'});   /* 交往中 00:01 她打來（AA_313 第 4-1 節第 13 點：原本大一、大二、大四都有，只有大三什麼都沒有）*/
    if(!after) return;
    if(!F.NYE_Y3) F.NYE_Y3='none';
    if(inG&&F.NYE_Y3!=='roof'&&PHONE.sent(G,'nye_y3_ask')&&xcMet()) PHONE.at(G,nye,24+5/60,[M('yu','📷（頂樓的合照，五個人，芯慈站在最旁邊）'),M('yu','今年人到得最齊')],'nye_y3_photo');   /* 2-6＋5-6（d5cf5589）；照片的字寫芯慈＝認識她才有（AA_313 第 672 行）*/
    if(!F.dating_heroine_03&&fam('heroine_03')) PHONE.at(G,nye,24+7/60,[{th:'p:heroine_03',from:'heroine_03',text:'新年快樂。'}],'nye_y3_yt'); };
  /* 跨年大四（AA_210 第 3 節＋5-5）：12/31 21:00 群組三句（不在群組＝阿哲私訊「十一點半，頂樓」）→ 23:30 頂樓；和語彤交往中 00:01 電話。可昕交往中選了高雄就不排頂樓 */
  S.nyeY4=function(GM){ const G=GM.G, F=G.flags, nye=S.dayOfKey('2028-12-31'); if(nye==null||typeof PHONE==='undefined'||typeof OUT==='undefined') return;
    if(G.day===nye+1&&G.day<=nye+1){ if(!F.NYE_Y4) F.NYE_Y4='none'; if(F.NYE_Y4!=='roof'&&PHONE.inGroup(G,'noodle_team')&&PHONE.sent(G,'nye_y4_ask')&&xcMet()) PHONE.at(G,nye,24+5/60,[{th:'g:noodle_team',from:'yu',text:'📷（野餐墊上的五個人，芯慈坐在正中間）'},{th:'g:noodle_team',from:'classmate_xinci',text:'今年我最早到。'}],'nye_y4_photo');   /* 沒去（5-7 第 1 點）*/ const fam1=id=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&SOCIAL.has&&SOCIAL.has(id,'FIRST_MET')&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf('FAMILIAR');
      if(!F.dating_heroine_03&&fam1('heroine_03')) PHONE.at(G,nye,24+7/60,[{th:'p:heroine_03',from:'heroine_03',text:'新年快樂。'}],'nye_y4_yt'); return; }   /* 語彤三年的 00:0x 私訊（第 4 節第 6 點）*/
    if(G.day!==nye) return;
    const T='g:noodle_team', inG=PHONE.inGroup(G,'noodle_team'), hh=G.hour, M=(w,t)=>({th:T,from:w,text:t}), kxR=(F.KX_NYE&&F.KX_NYE[4]==='river')||!!(S.sisNyeDate&&S.sisNyeDate(G,4));
    const fam=id=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&SOCIAL.has&&SOCIAL.has(id,'FIRST_MET')&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf('FAMILIAR');
    if(hh>=21&&hh<23.5&&!PHONE.sent(G,'nye_y4_ask')){ if(inG) PHONE.at(G,nye,Math.max(21,hh),[M('zhe','十一點半，頂樓'),M('zhe','頂樓照開 舍監說十二點半，一分鐘都不能多'),M('yu','最後一年了耶'),M('zhe','所以要來')],'nye_y4_ask'); else if(fam('zhe')) PHONE.at(G,nye,Math.max(21,hh),[{th:'p:zhe',from:'zhe',text:'十一點半，頂樓'},{th:'p:zhe',from:'zhe',text:'頂樓照開 舍監說十二點半，一分鐘都不能多'}],'nye_y4_ask'); }   /* 宿委會那一句大四「頂樓照開 舍監說十二點半，一分鐘都不能多」（AA_456 1-1；群組、私訊都換）*/
    if(PHONE.sent(G,'nye_y4_ask')&&!kxR&&!OUT.get(G,'nye_y4')&&hh<23.75) OUT.plan(G,{id:'nye_y4',ev:'ev_y4_newyear',day:nye,h:23.5,late:0.25,place:'宿舍頂樓',title:'跨年：宿舍頂樓',travel:'走上去約 2 分鐘',travelH:1/30,back:'回到房間。'});
    if(F.dating_heroine_03&&!OUT.get(G,'yt_nye_call_y4')&&hh>=23) OUT.plan(G,{id:'yt_nye_call_y4',ev:'ev_yt_nye_call_y4',day:nye+1,h:1/60,place:'電話',title:'語彤打電話來',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'電話掛了。'}); };
  /* 芷若在英國的跨年（AA_210 5-3＋5-7）：大三 2027-12-31、大四 2028-12-31 */
  S.ZR_NYE={3:{nye:'2027-12-31',eve:['你那邊快零點了吧。','我這邊還是下午。等一下打給你。']},4:{nye:'2028-12-31',eve:['臺灣要跨年了。','我這邊還有八小時。你先跨，我晚一點。']}};
  S.zrNye=function(GM){ const G=GM.G, F=G.flags, id='heroine_02'; if(typeof PHONE==='undefined'||typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.has||!SOCIAL.has(id,'FIRST_MET')) return; const hh=G.hour, th='p:'+id;
    for(const y of [3,4]){ const C=S.ZR_NYE[y], nye=S.dayOfKey(C.nye); if(nye==null||G.day<nye||G.day>nye+1) continue;
      if(F['dating_'+id]){ if(G.day===nye&&hh>=23.9&&!PHONE.sent(G,'zr_nye_eve_y'+y)) PHONE.at(G,nye,23+59/60,C.eve.map(t=>({th,from:id,text:t})),'zr_nye_eve_y'+y);
        if(typeof OUT!=='undefined'&&!OUT.get(G,'zr_nye_video_y'+y)&&(G.day===nye&&hh>=21||G.day===nye+1&&hh<7.9)) OUT.plan(G,{id:'zr_nye_video_y'+y,ev:'ev_zr_nye_video_y'+y,day:nye+1,h:8,late:0.25,place:'視訊',title:'芷若打視訊來',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'視訊掛了。'});
        continue; }
      const st=SOCIAL.STAGES.indexOf(SOCIAL.stage(id)); if(st<SOCIAL.STAGES.indexOf('FRIEND')) continue;   /* 認識、有點熟：不收（5-7 第 2 點）*/
      if(G.day===nye+1&&hh>=8&&!PHONE.sent(G,'zr_nye_y'+y)) PHONE.at(G,nye+1,8,[{th,from:id,text:y===4?'新年快樂。今年我在這邊跨第二次了。':'新年快樂。這邊剛剛才倒數完。'}].concat(st>=SOCIAL.STAGES.indexOf('CLOSE_FRIEND')?[{th,from:id,text:y===4?'去年說臺灣的煙火比較大。……今年還是。':'臺灣的煙火我在網路上看了。比這邊大。'}]:[]),'zr_nye_y'+y); } };
  /* 可昕（交往中）大二～大四的跨年（AA_210 5-2）：12/24 21:00 她私訊問 → 高雄（高鐵來回 2980，錢不夠變灰）／頂樓・視訊；12/31 21:00 前沒回＝視訊；
     高雄＝23:30 出遊（ev_kx_nye_river_y?）；視訊＝23:59「接起來」（大二在頂樓的接在 ev_y2_newyear 裡）；答應高雄沒去＝00:05 她打來、兩句改到隔天 09:00（AA_313 2-3 B）。KX_NYE[年]＝river／video／missed */
  S.KX_NYE_Y={2:{nye:'2026-12-31',ask:G=>['今年跨年，高雄還是頂樓？'],opts:[{t:'高雄。',k:'river',r:'好。我去車站接你。幾點的車先跟我說。'},{t:'頂樓。',k:'video',r:'好。零點我打視訊。'}]},
    3:{nye:'2027-12-31',ask:G=>['跨年。我列了選項。','一、你來高雄。二、零點視訊。沒有三。'].concat((G.flags.KX_NYE||{})[2]==='video'?['去年是二。今年我比較想要一。']:[]),opts:[{t:'一。',k:'river',r:'好。車站見。'},{t:'二。',k:'video',r:'好。零點。'}]},
    4:{nye:'2028-12-31',ask:G=>(G.flags.EXCHANGE_ROUTE==='US'?['你的時差調回來了嗎？']:[]).concat(['跨年。高雄或視訊，你選。我兩個都可以。']),opts:[{t:'高雄。',k:'river',r:'好。我去車站接你。'},{t:'視訊。',k:'video',r:'好。那我零點準時打。'}]}};
  S.kxNye=function(GM){ const G=GM.G, F=G.flags; if(!F.dating_kexin||typeof PHONE==='undefined'||typeof OUT==='undefined') return; const hh=G.hour;
    for(const y of [2,3,4]){ const C=S.KX_NYE_Y[y], nye=S.dayOfKey(C.nye); if(nye==null||G.day<nye-7||G.day>nye+1) continue; const K=F.KX_NYE||(F.KX_NYE={}), tag='kx_nye_y'+y, th='p:kexin';
      if(!PHONE.sent(G,tag)&&(G.day>nye-7||hh>=21)&&(G.day<nye||hh<21)){ const L=C.ask(G).map(t=>({th,from:'kexin',text:t})); L[L.length-1].ask={id:tag,until:nye*24+21,opts:C.opts.map(o=>Object.assign({t:o.t,set:{['KX_NYE_PICK'+y]:o.k},say:[{from:'kexin',text:o.r}]},o.k==='river'?{need:{money:2980,why:'高鐵票錢不夠。'}}:{}))}; PHONE.at(G,G.day===nye-7?Math.max(nye-7,G.day):G.day,G.day===nye-7?Math.max(21,hh):hh,L,tag); }
      if(F['KX_NYE_PICK'+y]){ K[y]=F['KX_NYE_PICK'+y]; delete F['KX_NYE_PICK'+y]; }
      if(G.day===nye&&hh>=21&&!K[y]) K[y]='video';   /* 12/31 21:00 以前沒回她：當作選視訊 */
      if(G.day!==nye&&!(G.day===nye+1&&hh<1)) continue;
      if(K[y]==='river'&&!OUT.get(G,'kx_nye_y'+y)&&G.day===nye&&hh<23.75) OUT.plan(G,{id:'kx_nye_y'+y,ev:'ev_kx_nye_river_y'+y,day:nye,h:23.5,late:0.25,place:'高雄・愛河邊',title:'去高雄跨年（高鐵約一個半小時）',travel:'高鐵約一個半小時',travelH:1.5,back:'回到臺北。'});
      const kq=OUT.get(G,'kx_nye_y'+y); if(K[y]==='river'&&kq&&kq.state==='missed'){ K[y]='missed'; S.kxNyeMissedCall(G,y,nye); PHONE.at(G,nye+1,9,[{th,from:'kexin',text:'愛河的煙火，我一個人看了。'},{th,from:'kexin',text:'……新年快樂。'}],'kx_nye_miss_y'+y); }   /* AA_313 第 2 節第 37 列（2-3 B）：00:05 她打來；這兩句改到隔天早上（原本 00:00）*/
      const roofV=(OUT.get(G,'nye_y'+y)||{}).state==='planned'&&hh<23.75;   /* 要上頂樓的：視訊接在頂樓那一場裡（大二～大四）*/
      if(K[y]==='video'&&!roofV&&F['NYE_Y'+y]!=='roof'&&!OUT.get(G,'kx_nye_video_y'+y)&&G.day===nye&&hh>=23) OUT.plan(G,{id:'kx_nye_video_y'+y,ev:'ev_kx_nye_video_y'+y,day:nye,h:23+59/60,late:0.2,place:'視訊',title:'可昕打視訊來',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'視訊掛了。'}); } };
  /* 跨年大二（AA_210 第 1 節＋第 5 節，881ed505）：12/31 21:00 麵店團群組五句（以安不認識＝柏翰那句開頭）→ 23:30 頂樓（出遊選單）；00:05 群組（阿哲的照片、Alison；拍了照的多一張）；
     芯慈群組、以安沒上頂樓的私訊、語彤的私訊（交往中改 00:01 電話）；1/2 阿哲回高雄。可昕交往中選了去高雄（KX_NYE[2]＝'river'）就不排頂樓 */
  S.nyeY2=function(GM){ const G=GM.G, F=G.flags, nye=S.dayOfKey('2026-12-31'); if(nye==null||G.day<nye||G.day>nye+2||typeof PHONE==='undefined'||typeof OUT==='undefined') return;
    const T='g:noodle_team', inG=PHONE.inGroup(G,'noodle_team'), hh=G.hour, after=G.day>nye||hh>=24, M=(w,t)=>({th:T,from:w,text:t}), kxR=(F.KX_NYE&&F.KX_NYE[2]==='river')||!!(S.sisNyeDate&&S.sisNyeDate(G,2));
    const fam=(id,st)=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&SOCIAL.has&&SOCIAL.has(id,'FIRST_MET')&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st||'FAMILIAR');
    const zf=!inG&&G.day===nye&&hh>=21&&fam('zhe');   /* 不在群組、和阿哲 FAMILIAR 以上：阿哲私訊兩則（AA_210 5-5 第 3 點）*/
    if(zf&&hh<23.5&&!PHONE.sent(G,'nye_y2_ask')){ const Z=t=>({th:'p:zhe',from:'zhe',text:t}), L=[Z('跨年頂樓十一點半 柏翰他們會去'),Z('宿委會今年也開頂樓 訪客一樓登記，十二點半前要走'),Z('我跟 Alison 去信義區 你去頂樓就好')];   /* 宿委會那一句：AA_210 第 0 節（d82f1374）*/
      L[2].ask={id:'nye_y2_ask',until:nye*24+23.5,opts:[{t:'我去頂樓。',set:{NYE_Y2_ASK:'go'}},{t:'再看看。',set:{NYE_Y2_ASK:'maybe'}}]}; PHONE.at(G,nye,Math.max(21,hh),L,'nye_y2_ask'); }
    if(inG&&G.day===nye&&hh>=21&&hh<23.5&&!PHONE.sent(G,'nye_y2_ask')){ const L=(S.knows('heroine_01',G)?[M('heroine_01','今年頂樓幾點？')]:[M('classmate_bohan','今年頂樓有人要去嗎？十一點半。')]).concat([M('classmate_bohan','十一點半。我先上去。'),M('zhe','宿委會今年也開頂樓 訪客一樓登記，十二點半前要走'),M('zhe','我們今年不上去'),M('yu','我們去信義區！！'),M('zhe','去年沒看到，今年要看到')]);
      L[L.length-1].ask={id:'nye_y2_ask',until:nye*24+23.5,opts:[{t:'我去頂樓。',set:{NYE_Y2_ASK:'go'}},{t:'再看看。',set:{NYE_Y2_ASK:'maybe'}}]}; PHONE.at(G,nye,Math.max(21,hh),L,'nye_y2_ask'); }
    if(PHONE.sent(G,'nye_y2_ask')&&!kxR&&!OUT.get(G,'nye_y2')&&G.day===nye&&hh<23.75) OUT.plan(G,{id:'nye_y2',ev:'ev_y2_newyear',day:nye,h:23.5,late:0.25,place:'宿舍頂樓',title:'跨年：宿舍頂樓',travel:'走上去約 2 分鐘',travelH:1/30,back:'回到房間。'});
    if(F.dating_heroine_03&&!OUT.get(G,'yt_nye_call_y2')&&G.day===nye&&hh>=23) OUT.plan(G,{id:'yt_nye_call_y2',ev:'ev_yt_nye_call_y2',day:nye+1,h:1/60,place:'電話',title:'語彤打電話來',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'電話掛了。'});
    if(!after) return;
    if(F.NYE_Y2!=='roof'&&!F.NYE_Y2) F.NYE_Y2='none';
    if(inG){ const P=[M('zhe','（照片：人擠人，前面一個人的手機舉得很高，煙火被一棟大樓擋掉一半）'),M('yu','人超多')]; if(F.NYE_Y2==='roof'&&F.NYE_Y2_PHOTO) P.push({th:T,from:'player',who:null,text:'（照片：頂樓的欄杆後面，煙火的上半截，很清楚）'},M('zhe','你們那邊比較清楚耶'));   /* AA_210 5-5（28ac4ea3）*/
      PHONE.at(G,nye,24+5/60,P,'nye_y2_photo'); if(S.knows('classmate_xinci',G)) PHONE.at(G,nye,24+6/60,[M('classmate_xinci','新年快樂。')],'nye_y2_xc'); }
    if(!F.dating_heroine_01&&fam('heroine_01')&&!fam('heroine_01','FRIEND')) PHONE.at(G,nye,24+7/60,[{th:'p:heroine_01',from:'heroine_01',text:'新年快樂。'}],'nye_y2_an');
    if(fam('kai')) PHONE.at(G,nye,24+9/60,[{th:'p:kai',from:'kai',text:'新年快樂。我們這棟頂樓也有人，但沒有你們那邊吵。'}],'nye_y2_kai');   /* 阿凱大二起住別棟、不上這棟頂樓（AA_210 1-5，9c641efa）*/
    if(!F.dating_heroine_03&&fam('heroine_03')) PHONE.at(G,nye,24+8/60,[{th:'p:heroine_03',from:'heroine_03',text:'新年快樂。'},{th:'p:heroine_03',from:'heroine_03',text:'（照片：店門口拉下一半的鐵門）'}],'nye_y2_yt');
    /* 阿哲的「我明天回高雄」改在海邊那天 21:00（AA_264 第 5 節第 1 點），在 vac3d.js 的 c01Phone */ };
  S.psGone=(G,day)=>{ const p=S.presence('classmate_peishan',day==null?G:Object.assign({},G,{day})); return p.kind==='unreachable'||!!p.keep; };   /* 交往中的例外（keep）也算：群組、其他人照樣聯絡不到她 */
  /* AA_276 第 4 節（使用者 23:5x「除非玩家有跟他交往」）：消失期開始那天（d0）玩家和她交往中、到現在還在交往＝例外。交往是 d0 以前開始的（ROM 的 sinceDay；舊存檔、測試沒有紀錄的算以前）*/
  S.keepDating=function(id,G,d0){ const F=G&&G.flags; if(!F||F['dating_'+id]!==true) return false; const R=F.romance&&F.romance[id]; return !(R&&R.sinceDay!=null&&R.sinceDay>=d0); };
  S.psKeep=G=>!!S.presence('classmate_peishan',G).keep;
  /* 每晚 23:00 以後她傳一則（AA_276 第 4 節，輪流）；放榜回來那段的替換句（放榜那天的事件做好時用：F.PS_KEPT＝整段都聯絡著）*/
  /* AA_460 第 2 節（企劃線 b9362f474，AA-B 2026-10-25）：原本六句照順序輪，2026-12-18～2027-08-06 大約 230 晚、每句將近四十次。改成每晚照日子挑（承諾不變：每晚 23:00 以後一則）：
       ① 那天有日子的句子（PS_KEEP_ROWS 第三格）→ ② 週六：那個月還沒用過的下一句（照表的順序；用完了＝③）→ ③ 其他晚上：短句四句輪（不跟前一晚同一句）→ ④ 每個月第一個週日：「有想到你」那句（一個月一次）。
       她的考試定在 2027-07-10、11（S.PS_EXAM；之後她的考試要排日子照這個）。整段只看日曆、不記存檔（舊存檔從讀檔那天照新的排）。
       子代理判斷（照稿的排法會碰到、稿沒寫的三處）：7/10（週六）是考試第一天，不用週六那一句（不然會是「考完以後，我睡了十四個小時。」）；7 月考完的兩句 7/12 起才用（第四格）；
       「你們開學了吧」大二下開學（2027-02-22，calendar.js）以後才用（不然 2/13 寒假就說）；8 月的「還有幾天就放榜」8/6 放榜以前沒有週六＝放在前一個月最後一個空著的週六（7/31）*/
  S.PS_KEEP_ROWS=[[12,'今天寫完兩回考古題。地理還是最爛。'],[12,'我媽煮了一大鍋湯，說喝完才可以去念書。'],[12,'樓下有人在放煙火。我在寫數學。……新年快樂。','2026-12-31'],
    [1,'模擬考的分數出來了。先不要問。'],[1,'窗外下雨了。台中很少下這麼大。'],[1,'我把書桌搬到窗戶旁邊了。比較不會想睡。'],[1,'我媽問我要不要去廟裡拜拜。我說等模擬考好一點再去。'],
    [2,'年夜飯吃完了。親戚問我在幹嘛，我說在念書，他們就不問了。','2027-02-05'],[2,'今天放自己半天假。下午就回去念了。','2027-02-06'],[2,'你們開學了吧。……我這邊沒有開學。',null,'2027-02-22'],[2,'我媽還是去拜拜了。她幫我求了一個，我放在鉛筆盒裡。'],
    [3,'今天我生日。我媽買了蛋糕，我吃一塊就回房間了。','2027-03-15'],[3,'今天的模擬考比上次好一點。一點點。'],[3,'樓下那棵樹開花了。我不知道它叫什麼。'],[3,'錯的題目，我抄在一本新的筆記本。已經抄了半本。'],
    [4,'連假。家裡來了很多人。我躲在房間。'],[4,'今天念到一半睡著了。醒來的時候臉上有字。'],[4,'那本筆記本抄完了。我又買了一本。'],
    [5,'母親節。我說要洗碗，我媽把我趕回房間念書。','2027-05-09'],[5,'天氣好熱。我把頭髮綁起來了。'],[5,'今天寫作文，題目是「一扇窗」。我寫了麵店那扇。'],[5,'今天的模擬考，地理第一次沒有拖後腿。'],
    [6,'端午。我媽包了粽子。我吃了兩顆，然後很後悔。','2027-06-09'],[6,'剩一個月。日曆上的日子，我一格一格劃掉。'],[6,'今天沒有下雨。我出門走了一圈，十分鐘就回來了。'],
    [7,'剩一個禮拜。今天只複習，不寫新的。'],[7,'明天考試。……今天不用回我。晚安。','2027-07-09'],[7,'考完了。……先不要問。','2027-07-11'],[7,'考完以後，我睡了十四個小時。',null,'2027-07-12'],[7,'考古題疊起來，比我的膝蓋還高。今天全部收進箱子了。',null,'2027-07-12'],
    [8,'還有幾天就放榜。我每天都在想，又每天都假裝沒在想。'],[8,'明天放榜。……晚安。','2027-08-05']];   /* [月, 句子, 那一天（有日子的）, 最早哪一天可以用] */
  S.PS_KEEP_SHORT=['晚安。','今天念完了。晚安。','今天沒有念完。明天補。晚安。','眼睛好痠。晚安。']; S.PS_KEEP_SUN='晚安。今天念書念到一半，有想到你。'; S.PS_EXAM=['2027-07-10','2027-07-11'];
  S.PS_KEEP_NIGHT=S.PS_KEEP_ROWS.map(r=>r[1]).concat(S.PS_KEEP_SHORT,[S.PS_KEEP_SUN]);   /* 她那半年每晚會傳的句子（原本六句都在裡面）*/
  S.psKeepPlan=function(){ if(S._psKP) return S._psKP; const P={}, d0=S.dayOfKey('2026-12-18'), d1=S.dayOfKey('2027-08-06'); if(d0==null||d1==null||typeof CALENDAR==='undefined') return P;   /* {第幾天: 句子}；消失期＝characters.js 沛珊 absentDates 那一段（8/6 放榜那天白天講）*/
    const R=S.PS_KEEP_ROWS, DT={}, used=new Set(), free=[], X=d=>CALENDAR.dateOf(d); for(const r of R) if(r[2]) DT[r[2]]=r[1];
    for(let d=d0;d<d1;d++){ const x=X(d); if(DT[x.key]){ P[d]=DT[x.key]; continue; } if(x.wd%7!==6||S.PS_EXAM.includes(x.key)) continue;
      const r=R.find(r=>!r[2]&&r[0]===x.m&&!used.has(r)&&!(r[3]&&x.key<r[3])); if(r){ used.add(r); P[d]=r[1]; } else free.push(d); }
    for(const r of R) if(!r[2]&&!used.has(r)){ const i=free.map(d=>X(d).m).lastIndexOf(r[0]===1?12:r[0]-1); if(i>=0){ P[free[i]]=r[1]; used.add(r); free.splice(i,1); } }   /* 那個月沒有週六可以用（8 月）＝前一個月最後一個空著的週六 */
    let si=0; for(let d=d0;d<d1;d++){ if(P[d]) continue; const x=X(d); P[d]=x.wd%7===0&&x.d<=7?S.PS_KEEP_SUN:S.PS_KEEP_SHORT[si++%S.PS_KEEP_SHORT.length]; }
    return (S._psKP=P); };
  S.psKeepLine=d=>S.psKeepPlan()[d]||S.PS_KEEP_SHORT[0];
  S.PS_KEEP_BACK='那半年，每天晚上十一點，我都傳一則給你。……現在可以白天講了。';   /* 取代「我那時候誰都沒回。你也是。」（BB_194 第 19 節）*/
  /* 大一下期中那兩週（第 8～9 週，語彤顧店的那一週，AA_11 事件 4）有沒有去過總圖：Y1_MID_LIB；舊存檔沒有這個旗標就看習慣記錄（place:library…）*/
  S.y1MidLib=function(G){ const F=G.flags||{}; if(F.Y1_MID_LIB) return true; const a=termDay('Y1S2',8,1), b=termDay('Y1S2',9,7); if(a==null||b==null) return false;
    const H=G.habits||{}; return Object.keys(H).some(k=>/^place:library(_hall)?:/.test(k)&&(H[k].days||[]).some(d=>d>=a&&d<=b)); };
  /* 學姊 W8「今天先不改了」之後（AA_177 第 8 節①：後面讀 W8 的條件改讀「第 12 週以後」，不讀 W8 有沒有發生）：演過，或已經過了大二上第 12 週 */
  S.sisW8=function(G,day){ const d=day!=null?day:G.day; if(G.events&&G.events.done&&G.events.done.ev_sis_collapse) return true; const w13=termDay('Y2S1',13,1); return w13!=null&&d>=w13; };
  S.reachable=(id,G)=>{ const p=S.presence(id,G); return p.here||p.kind==='taipei'; };   /* 約得到、在這個世界上（在臺北、不在台大也算：沛珊重考那一學期起、子晴畢業以後，BB_163）；present 是「在台大」*/
  S.whereIs=function(GM,id){ const G=GM.G, F=G.flags, hr=h(G), wd=G.weekday; const c=(typeof CHARACTERS!=='undefined')&&CHARACTERS[id]; if(!c) return null;
    const pr0=S.presence(id,G); if(!pr0.here&&pr0.kind!=='taipei') return pr0.away?{zone:null,act:'',away:pr0.away}:null;
    if(LEGACY_IDS.includes(id)&&(!legacyOk(id,c,G)||F.classNow)) return null;
    const ent=schedEnt(c,G); const school=(id==='kexin'&&S.isEcon(G))?(G.day<S.dayOfKey('2025-02-01')?'台大':'家裡'):c.school;   /* 經濟系那一年可昕是台大經濟系（2025-02 起休學在家），不是政大（2026-10-18 使用者：「杜可昕顯示在政大」）*/
    if(id==='kai'&&(!ent||ent.zone==='dorm')){ const w=S.r203Where(G,id); if(w) return w; }   /* 大一 203 四人房：阿凱照 AA_502 的作息（週二、四到 08:00，其他天到 10:30；上舖睡覺寫「睡覺」）；作息表寫他在別的地方（洗衣間、約好的）照作息表 */
    if(!ent) return pr0.kind==='taipei'?(pr0.away?{zone:null,act:'',away:pr0.away}:null):(school?{zone:null,act:'',away:'在'+school}:null); const end=ent.to%24, hh=Math.floor(end), mm=Math.round((end-hh)*60), until=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
    if(ent.zone==null) return ent.away?{zone:null,act:ACT[ent.act]||'',away:ent.away,until}:null;   /* 不在遊戲的場景裡（例：在小福吃午餐）*/
    return {zone:ent.zone, room:ent.room||null, act:ent.label||ACT[ent.act]||'', until}; };   /* label：這一筆自己的說法（芷若：「剛下課，在 101 門口」）*/
  return S;
})();

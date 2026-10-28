/* ===== 女主角的圈子在 3D：資料（HEROINE-CIRCLE3D-1028；USER_WANTS X122★，使用者 2026-10-28 01:2x「可攻略女主角 感覺都沒有自己的生活」）=====
   來源（企劃線 claude/magical-albattani-bk7b4n；這次照的版本＝SRC）：
     AA_503 @ d13ab3ab7（大一上）、AA_504 @ 62849944b（大一下＋暑假）、AA_505 @ 795fbecfd（大二上＋寒假）、AA_506／AA_507／AA_508 @ 31a4c4002——各位那一節的「x-1 圈子」表。
     tests/heroine_circle3d_unit.js 照劇情匯入白名單 docs/handoff/story_import_allow.json 上「現在」的那一版對稿：白名單換到 AA 更正以後的 commit、圈子表有改＝測試失敗（照新版改這裡）。
     （2026-10-28 開發分支 946fb1787 的白名單：AA_506 691a26400、AA_507 3120ac77a、AA_508 28f981438，三份的圈子表和 31a4c4002 一字不差）
     大四（CIRCLE3D-Y4-1028）：AA_509 @ 28f981438（大四上＋寒假）、AA_510 @ 28f981438（大四下＋畢業那年夏天；6/4 起是畢業以後篇，3D 的圈子照現有做法：站著兩秒就跳過的不演，AA_510 第 8 節第 4 點）。
     ref 多兩種寫法：「照 1-1 第二列」「照 1-1」（同一段同框，句子＝heardFrom 那一列）；spot＝只有旁白、在地點聽到（AA_509 3-1 第二列：總圖門口的媽媽）。
     第三輪（PRIV-AAFIX-1028；AA_509 最後一節「實作時定的：大四的圈子」，企劃線 6bc3cd784，AA-C 定 6 項）：1 一定同框照現在；2 學姊和陳助教 c509_5_1 從 2029-01-12（12/29、1/5 不排：SCHED c509_5_1off）；
       3 語彤媽媽在總圖門口照現在（17:50～18:10、第 10～16 週、不綁 Y7-L5；門廳裡、校園門口兩個站位都留）；4 子晴騎樓 c509_4_1 延到大四下 6/27（6/28 起 c510_4_1）；
       5 語彤暑假在麵店 c510_3_2：seatAt＝坐長桌最裡面、靠廚房的位子，standAt＝客人進來站在長桌那一頭、門口那一側（hcircle3d.js S.shopSeat）；6 「後面那張桌子」照現在（最近的那一張）。
   ROWS 一列＝表上的一列（id：c＋稿號＋節＋第幾列；n1＝表下面的說明句、b＝說明裡「換成」的那幾句）：
     heard＝「走近時聽到」那一格，照稿一字不差原樣存（「A：…／B：…」載入時拆開，NAMES 對到說話的人；整格是（…）＝旁白）。tests/heroine_circle3d_unit.js 用 git show 雙向對稿。
     ref＝那一格是「照現有」「照現有讀書會」「照 2-1」「照 AA_506 4-1」：沒有新句子（有 with 的照樣同框；heardFrom＝那一列的句子）。
     who＝她、with＝和誰（人物 id；hc_ 開頭＝PEOPLE 的標籤同伴）、alone＝一個人（那一列只有旁白、她不和別人配對）。
     什麼時候：days（0＝週日）、from／to（時）、terms（只在那幾個學期的上課期間）、wk（第幾週到第幾週，含頭尾）、weeks（週次清單）、dates（日期區間，含頭尾）、cond（hcircle3d.js 的 S.COND）。
       cls＝必修課上課前（她照課表在教室的那一堂，同 story3d.js classmateClass：上課前 10 分鐘到下課；聽到的句子只在上課以前）、pm＝只算下午的課、wkFrom＝第幾週起。
     zone、act＝她照作息在哪一區、在做什麼（對不上＝這一列不成立）。always＝表上寫「一定同框」（不用 pairUp 的 70%）；once＝整個存檔聽一次。
     comp＝同伴怎麼站：clerk＝站在那一間店店員的位置（原本那位無名店員先藏起來）、at＝[x,z]、stand＝站在她的座位旁邊（她坐著、同伴不坐）、behind（anchor 'with'）＝她坐到同伴背後那一桌。
     spot＝[[區域,x,z,層],…]：只有旁白、玩家走到那個地點 5 m 內聽到（她照作息在 zone；不在她旁邊聽、不配對）。
     place＝對不到遊戲現有地點時放哪裡（給 AA、LAWWW2 看）。
   SCHED＝她要「補一筆」的作息（hcircle3d.js 載入時放進 CHARACTERS[她].daily_schedule 最前面＝越前面越優先，帶 with、hc）。
   PEOPLE＝「和誰」不是現有人物的：標籤＋固定的路人底模（LAWWW2 正式人物做好以後只改 model；HEROINE-LIFE-NPC3D-1028）。底模挑二十位同學（pool_story.js）沒用的。 */
'use strict';
const HCIRCLE_DATA={
  SRC:{AA_503:['docs/story_planning/AA_503_女主角自己的生活_大一上_動態頁_圈子_她的事.md','d13ab3ab7'],AA_504:['docs/story_planning/AA_504_女主角自己的生活_大一下與暑假.md','62849944b'],
    AA_505:['docs/story_planning/AA_505_女主角自己的生活_大二上與寒假.md','795fbecfd'],AA_506:['docs/story_planning/AA_506_女主角自己的生活_大二下與暑假.md','31a4c4002'],
    AA_507:['docs/story_planning/AA_507_女主角自己的生活_大三上與寒假.md','31a4c4002'],AA_508:['docs/story_planning/AA_508_女主角自己的生活_大三下與暑假.md','31a4c4002'],
    AA_509:['docs/story_planning/AA_509_女主角自己的生活_大四上與寒假.md','28f981438'],AA_510:['docs/story_planning/AA_510_女主角自己的生活_大四下與畢業那年夏天.md','28f981438']},
  /* 表上說話的人 → 人物 id（多人的標籤＝第一個人說）*/
  NAMES:{'以安':'heroine_01','芷若':'heroine_02','語彤':'heroine_03','子晴':'heroine_04','學姊':'heroine_05','沛珊':'classmate_peishan','Alison':'yu','柏翰':'classmate_bohan',
    '阿凱':'kai','陳助教':'npc_ta_chen','筱涵':'npc_huangxh','方奕廷':'npc_fangyt','曾靖雯':'pool_7','晏如':'pool_5','晨希':'pool_11','芸萱':'pool_15',
    '小婷':'hc_xt','老闆':'hc_boss','阿姨':'hc_ayi','學姊的同學':'hc_sf1','新來的工讀生':'hc_np','小禾':'hc_np','大一的學妹':'hc_fr1','日文課的同學':'hc_jp','以安的室友':'hc_room',
    '點乾麵的阿伯':'hc_uncle','讀書會的學妹':'hc_plg','社會系的學弟妹':'hc_soc1','吉他社的學弟':'hc_gtr','小朋友':'hc_kid'},
  /* 標籤同伴：label＝說話人、頭上的名字；sex；model＝固定的路人底模；height＝小朋友縮小（crowd3d.js 公園的孩子同一個做法）；
     props＝看得出身分的配件（props3d.js；HEROINE-LIFE-NPC3D-1028，LAWWW2-C：D99 不換底模只加配件。托特包、後背包換顏色，不和以安的米白托特包、祐廷的深灰後背包撞；點乾麵的阿伯沒有配件）*/
  PEOPLE:{
    hc_xt:{label:'小婷',sex:'f',model:'char.npc_nf6',props:[{name:'apron',show:true},'name_pin'],note:'Café 同事，外文系大一的學妹（AA_503 5-1）'},
    hc_boss:{label:'老闆',sex:'m',model:'char.npc_nm6',props:[{name:'apron',show:true,color:'#2f3338'},'mug'],note:'Café 老闆（AA_503 5-1）'},
    hc_ayi:{label:'阿姨',sex:'f',model:'char.npc_nf3',props:[{name:'apron',show:true,color:'#8a3a32'},'ladle','bandage'],note:'麵店的阿姨（AA_503 6-1：LAWWW2 做中年女性、圍裙、湯杓；先用固定的路人底模）'},
    hc_sf1:{label:'學姊的同學',sex:'m',model:'char.npc_nm16',props:[{name:'backpack',color:'#3a3a3a'},'lawbook'],note:'學姊備考的同學（AA_503 8-1，兩個之一）'},
    hc_sf2:{label:'學姊的同學',sex:'m',model:'char.npc_nm2',props:[{name:'backpack',color:'#59463a'},'folder'],note:'學姊備考的同學（AA_503 8-1，兩個之一）'},
    hc_np:{label:'新來的工讀生',sex:'f',model:'char.npc_nf11',props:[{name:'apron',show:true},'name_pin'],note:'Café 新來的工讀生（AA_505 2-1）'},
    hc_fr1:{label:'大一的學妹',sex:'f',model:'char.npc_nf13',props:[{name:'tote',color:'#4a5a78'}],note:'民總的大一學妹（AA_505 3-1，兩個之一）'},
    hc_fr2:{label:'大一的學妹',sex:'f',model:'char.npc_nf14',props:[{name:'backpack',color:'#7a6a58'}],note:'民總的大一學妹（AA_505 3-1，兩個之一）'},
    hc_nm:{label:'新社員',sex:'f',model:'char.npc_nf20',props:['guitar'],note:'吉他社的新社員（AA_505 4-1）'},
    hc_jp:{label:'日文課的同學',sex:'f',model:'char.npc_nf1',props:[{name:'backpack',color:'#3d4a3f'}],note:'以安日文課的同學（AA_506 1-1）'},
    hc_room:{label:'以安的室友',sex:'f',model:'char.npc_nf4',props:[{name:'tote',color:'#b0745a'}],note:'以安的室友（AA_506 1-1）'},
    hc_uncle:{label:'點乾麵的阿伯',sex:'m',model:'char.npc_nm3',note:'麵店的客人（AA_506 3-1）'},
    hc_plg:{label:'讀書會的學妹',sex:'f',model:'char.npc_nf12',props:[{name:'backpack',color:'#5b4b6b'},'folder'],note:'公法讀書會的學妹（AA_507 1-1）'},
    hc_soc1:{label:'社會系的學弟妹',sex:'f',model:'char.npc_nf19',props:[{name:'tote',color:'#6f7d5c'}],note:'語彤當助教那門課的學弟妹（AA_507 3-1，兩個之一）'},
    hc_soc2:{label:'社會系的學弟妹',sex:'m',model:'char.npc_nm15',props:[{name:'backpack',color:'#2f3a4a'}],note:'語彤當助教那門課的學弟妹（AA_507 3-1，兩個之一）'},
    hc_gtr:{label:'吉他社的學弟',sex:'m',model:'char.npc_nm12',props:['guitar'],note:'吉他社新的器材長（AA_507 4-1）'},
    hc_kid:{label:'課輔班的小朋友',sex:'m',model:'char.npc_nm20',height:1.25,props:[{name:'backpack',color:'#d9534f'}],note:'沛珊課輔班的小朋友（AA_504 6-1）'}},
  /* 她要補的作息（放在她 daily_schedule 最前面；with、hc 由載入時從那一列帶進去）*/
  SCHED:[
    {hc:'c503_4_3',who:'heroine_01',e:{days:[4],from:19+40/60,to:20,zone:'campus',act:'linger',at:[93.8,-97.6,Math.PI/2,0],terms:['Y1S1'],weeks:[10,11,12,13,14,15],label:'萬才館門口（讀書會前）'}},
    {hc:'c503_10_1',who:'classmate_peishan',e:{days:[2,4],from:13+20/60,to:15+10/60,zone:'campus',act:'linger',at:[-23.95,-12.6,-Math.PI/2,0],terms:['Y1S1'],noHoliday:true,label:'文學院前的長椅（哲學概論旁聽）'}},
    {hc:'c503_10_3',who:'classmate_peishan',e:{days:[4],from:20,to:21.5,zone:'wancai',act:'club',terms:['Y1S1'],weeks:[10,11,12,13,14,15],note:'AA_503 10-1：公法讀書會（作息補這一筆；週次同以安那一筆）'}},
    {hc:'c504_4_3',who:'heroine_04',e:{days:[2,4],from:13,to:18,zone:'gongguan',act:'linger',at:[12,20.6,Math.PI,0],dates:[['2026-07-01','2026-08-31']],label:'公館騎樓的咖啡店'}},
    {hc:'c504_5_2',who:'heroine_05',e:{days:[1,2,3,4,5],from:12,to:13,zone:'campus',act:'linger',at:[36.6,-97.4,Math.PI/2,0],terms:['Y1S2'],weeks:[13,14],noHoliday:true,label:'霖澤館前'}},
    {hc:'c504_5_3',who:'heroine_05',e:{days:[1,2,3,4,5],from:7,to:8,zone:'gym_b1',act:'linger',at:[8,-2.8,Math.PI,0],dates:[['2026-06-15','2026-07-05']],label:'新體育館 B1 游泳池（池邊）'}},
    {hc:'c505_3_1',who:'heroine_03',e:{days:[4],from:15+10/60,to:15.5,zone:'campus',act:'linger',at:[36.6,-97.4,Math.PI/2,0],terms:['Y2S1'],weeks:[2,3,4,5,6,7,10,11,12,13,14,15],noHoliday:true,label:'霖澤館門口（民總下課）'}},
    {hc:'c505_4_1',who:'heroine_04',e:{days:[1,3],from:19,to:21,zone:'wancai',act:'club',terms:['Y2S1'],weeks:[3,4],noHoliday:true,note:'AA_505 4-1：吉他社社課從第 3 週起（activities.js club_guitar 大二上 termWeeks 3～7、10～15；原本那一筆第 5 週起）'}},
    {hc:'c505_4_3',who:'heroine_04',e:{days:[5],from:17,to:17+20/60,zone:'campus',act:'wander',terms:['Y2S1'],weeks:[3,4,5,6,7,8,9,10,11,12,13,14,15],noHoliday:true,label:'資工系館前（下課）'}},
    {hc:'c505_5_2',who:'heroine_05',e:{days:[1,2,3,4],from:7,to:8,zone:'gym_b1',act:'linger',at:[8,-2.8,Math.PI,0],terms:['Y2S1'],dates:[['2026-09-09','2026-12-27']],noHoliday:true,label:'新體育館 B1 游泳池（池邊）'}},
    {hc:'c506_1_2',who:'heroine_01',e:{days:[1,2,3,4,5],from:21+50/60,to:22+10/60,zone:'campus',act:'linger',at:[-92.6,56.4,-Math.PI/2,0],terms:['Y2S2'],weeks:[10,11,12,13],label:'女生宿舍門口'}},
    {hc:'c506_3_1',who:'heroine_03',e:{days:[1],from:12.2,to:12.5,zone:'campus',act:'linger',at:[36.6,-97.4,Math.PI/2,0],terms:['Y2S2'],weeks:[2,3,4,5,6,7,10,11,12,13,14,15],noHoliday:true,label:'霖澤館門口（債各下課）'}},
    {hc:'c506_3_3',who:'heroine_03',e:{days:[2,4],from:14.5,to:15.5,zone:'noodle',act:'read',dates:[['2027-07-09','2027-09-05']],label:'麵店（午休）'}},
    {hc:'c506_4_2',who:'heroine_04',e:{days:[1,2,3,4,5],from:10,to:18,zone:null,act:'out',away:'在實習',dates:[['2027-07-06','2027-09-03']],note:'AA_506 4-1：暑假平日 10:00～18:00 實習（7/6 第一天、9/3 最後一天，AA_506 4-2 第 5 點），不在 3D'}},
    {hc:'c506_4_2',who:'heroine_04',e:{days:[2,4],from:21,to:23.5,zone:'gongguan',act:'linger',at:[16,20.6,Math.PI,0],terms:['Y2S2'],weeks:[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],label:'公館騎樓（插座旁邊）'}},
    {hc:'c506_4_2',who:'heroine_04',e:{days:[2,4],from:21,to:23.5,zone:'gongguan',act:'linger',at:[16,20.6,Math.PI,0],dates:[['2027-06-14','2027-09-05']],label:'公館騎樓（插座旁邊）'}},
    {hc:'c507_3_1',who:'heroine_03',e:{days:[1,5],from:17+20/60,to:17+50/60,zone:'campus',act:'linger',at:[19.5,-86.8,Math.PI/2,0],terms:['Y3S1','Y3S2'],noHoliday:true,label:'社科院門口（社會系館旁）'}},
    {hc:'c507_4_2',who:'heroine_04',e:{days:[1,2,3,4,5],from:22,to:24,zone:'gongguan',act:'linger',at:[16,20.6,Math.PI,0],terms:['Y3S1'],label:'公館騎樓（插座旁邊）'}},
    {hc:'c509_4_1',who:'heroine_04',e:{days:[1,2,3,4,5],from:22,to:24,zone:'gongguan',act:'linger',at:[16,20.6,Math.PI,0],dates:[['2028-09-04','2029-06-27']],taipei:'both',label:'公館騎樓（插座旁邊）',note:'她 2028-06 畢業、在工作室上班（presence 是 taipei）：作息只看標 taipei 的那幾筆，所以這一筆也標（同她現有那一筆 taipei both）。AA_509 實作時定的第 4 點（6bc3cd784）：延到大四下 6/27（下班照樣在騎樓寫自己的；6/28 起換 c510_4_1 週五和阿凱）'}},
    /* AA_509 實作時定的第 2 點（6bc3cd784）：學姊 12/23 回來以後的兩個週五不排——12/29 接著 12/28 家聚、1/5 時差還沒好；和陳助教的週五 1/12 才恢復（c509_5_1）。她原本的週五 18:30～20:30 公館（和陳助教吃飯）這兩晚不在 3D */
    {hc:'c509_5_1off',who:'heroine_05',e:{days:[5],from:18.5,to:20.5,zone:null,act:'out',away:'在家',dates:[['2028-12-29','2028-12-29'],['2029-01-05','2029-01-05']],note:'AA_509 實作時定的第 2 點：12/29、1/5 的週五不排（1/12 對齊 feed_y4s1「恢復了。」）'}}],
  ROWS:[
    /* ===================== AA_503 大一上 ===================== */
    {id:'c503_4_1',doc:'AA_503',sec:'4-1',k:1,who:'heroine_01',with:['pool_7'],cls:true,pm:true,wkFrom:2,terms:['Y1S1'],cond:'metZjw',anchor:'with',heard:'曾靖雯：早安。／以安：……現在下午兩點。／曾靖雯：我知道。',
      place:'必修課的教室：以安坐到曾靖雯旁邊（第一排）。「現在下午兩點」＝只算下午的課（大一上是週四的民總）'},
    {id:'c503_4_2',doc:'AA_503',sec:'4-1',k:2,who:'heroine_01',with:['yu'],always:true,days:[1,3],from:18,to:18+50/60,terms:['Y1S1'],zone:'campus',heard:'Alison：欸妳今天手帳寫了幾頁？／以安：兩頁。其中一頁是妳上課講的話。'},
    {id:'c503_4_3',doc:'AA_503',sec:'4-1',k:3,who:'heroine_01',with:['classmate_peishan'],days:[4],from:19+40/60,to:20,terms:['Y1S1'],wk:[10,15],zone:'campus',heard:'沛珊：講義我多印了一份。／以安：給誰？／沛珊：給會遲到的人。'},
    {id:'c503_4_n1',doc:'AA_503',sec:'4-1',k:'n1',who:'heroine_01',alone:true,days:[0,1,2,3,4,5,6],from:14,to:18,terms:['Y1S1'],zone:'cafe',heard:'（她在手帳上畫線。看到你，先把那一頁蓋起來。）',
      place:'表下面的說明「Café 那幾段照舊一個人。旁白補一句」'},
    {id:'c503_5_1',doc:'AA_503',sec:'5-1',k:1,who:'heroine_02',with:['hc_xt'],days:[5],from:19,to:22,terms:['Y1S1'],zone:'cafe',act:'barista',comp:{hc_xt:{clerk:'cafe'}},heard:'小婷：學姊，那個客人又點熱拿鐵。／芷若：他每天都點。你先打奶。'},
    {id:'c503_5_2',doc:'AA_503',sec:'5-1',k:2,who:'heroine_02',with:['hc_boss'],days:[1,3,5],from:11,to:15,terms:['Y1S1'],zone:'cafe',act:'barista',comp:{hc_boss:{clerk:'cafe'}},heard:'老闆：豆子快沒了。／芷若：我昨天寫在白板上了。／老闆：……我沒看白板。'},
    {id:'c503_5_3',doc:'AA_503',sec:'5-1',k:3,who:'heroine_02',alone:true,days:[0],from:12,to:13,terms:['Y1S1'],zone:'l118_omu',heard:'（她一邊吃一邊看一本很舊的劇本，筆夾在耳朵上。）'},
    {id:'c503_6_1',doc:'AA_503',sec:'6-1',k:1,who:'heroine_03',with:['npc_huangxh'],always:true,days:[2,4],from:12,to:13,terms:['Y1S1'],zone:'campus',heard:'筱涵：妳又沒睡？／語彤：睡了。四個小時。／筱涵：那叫沒睡。'},
    {id:'c503_6_2',doc:'AA_503',sec:'6-1',k:2,who:'heroine_03',with:['hc_ayi'],days:[2,4],from:17.5,to:20.5,terms:['Y1S1'],zone:'noodle',act:'help',comp:{hc_ayi:{at:[1.8,-2.75],clerk:'noodle'}},heard:'阿姨：語彤，那桌的乾麵不要蔥。／語彤：我知道。他每次都不要。'},
    {id:'c503_6_3',doc:'AA_503',sec:'6-1',k:3,who:'heroine_03',alone:true,days:[3],from:17+40/60,to:18+40/60,terms:['Y1S1'],zone:'l118_home',heard:'（她在看一本社會學的書，書頁上用鉛筆畫了很多問號。）'},
    {id:'c503_7_1',doc:'AA_503',sec:'7-1',k:1,who:'heroine_04',with:['pool_5','pool_11'],days:[1,3],from:19,to:21,terms:['Y1S1'],zone:'wancai',act:'club',heard:'晏如：子晴，餅乾。／子晴：不要，我在調音。／晏如：調音也可以吃。'},
    {id:'c503_7_2',doc:'AA_503',sec:'7-1',k:2,who:'heroine_04',with:['kai'],days:[5],from:14+10/60,to:14.5,terms:['Y1S1'],zone:'campus',heard:'子晴：你那題用遞迴？／阿凱：所以不行嗎。／子晴：可以啊，只是很慢。',
      place:'資工系館前＝校園（子晴照作息在校園走，阿凱跟著一起走；遊戲沒有資工系館）'},
    {id:'c503_7_3',doc:'AA_503',sec:'7-1',k:3,who:'heroine_04',with:['yu'],always:true,days:[2],from:15,to:17,terms:['Y1S1'],zone:'campus',heard:'Alison：欸成發妳要唱哪一首！／子晴：還沒決定。不要問。',
      place:'「一定同框，週二那一天」＝週二；週四照舊（pairUp 的 70%）'},
    {id:'c503_8_1',doc:'AA_503',sec:'8-1',k:1,who:'heroine_05',with:['npc_ta_chen'],always:true,days:[5],from:18.5,to:20.5,terms:['Y1S1'],zone:'gongguan',heard:'陳助教：今天到第幾章？／學姊：第三章。第三次。／陳助教：……先吃飯。',
      place:'表寫 18:00～19:00；現有作息「和陳助教吃飯」兩個人都是 18:30～20:30（AA_505 起表也寫 18:30～20:30），照作息'},
    {id:'c503_8_2',doc:'AA_503',sec:'8-1',k:2,who:'heroine_05',with:['hc_sf1','hc_sf2'],days:[1,2,3,4,5],from:13,to:17,dates:[['2025-12-01','2025-12-21'],['2026-01-01','2026-01-31']],zone:'library',
      heard:'學姊的同學：書瑀，妳的進度表借我看一下。／學姊：（沒抬頭，把一張紙推過去）',place:'總圖二樓長桌→她的作息平日 9～17 在總圖三樓閱覽區（library），放那裡；第 14 週起＝12/1～12/21、寒假 1 月'},
    {id:'c503_8_3',doc:'AA_503',sec:'8-1',k:3,who:'heroine_05',ref:true,heard:'照現有'},
    {id:'c503_10_1',doc:'AA_503',sec:'10-1',k:1,who:'classmate_peishan',with:['pool_15'],days:[2,4],from:13+20/60,to:15+10/60,terms:['Y1S1'],zone:'campus',heard:'芸萱：那如果……／沛珊：那如果……我們兩個今天都先不要問？／芸萱：好。（停了三秒）那如果——',
      place:'文學院前的長椅：芸萱坐著（她自己的作息），沛珊站在長椅旁邊；週四 13:20 是必修課（民總），上課優先＝實際只有週二'},
    {id:'c503_10_2',doc:'AA_503',sec:'10-1',k:2,who:'classmate_peishan',ref:true,heard:'照現有'},
    {id:'c503_10_3',doc:'AA_503',sec:'10-1',k:3,who:'classmate_peishan',ref:true,heard:'照現有讀書會',place:'作息補：週四 20:00 萬才館（SCHED）；讀書會是事件，柏翰、Alison 不另外搬'},
    /* ===================== AA_504 大一下＋暑假 ===================== */
    {id:'c504_1_1',doc:'AA_504',sec:'1-1',k:1,who:'heroine_01',with:['yu'],always:true,days:[1,3],from:18,to:18+50/60,terms:['Y1S2'],wk:[1,11],zone:'campus',heard:'Alison：欸妳日文課幾點？／以安：七點。／Alison：早上？……妳瘋了。'},
    {id:'c504_1_2',doc:'AA_504',sec:'1-1',k:2,who:'heroine_01',alone:true,days:[1,3],from:18,to:18+50/60,terms:['Y1S2'],wk:[12,13],dates:[['2026-05-14','2026-05-24']],zone:'campus',heard:'（她一個人走，手帳拿在手上，沒有打開。）',
      place:'第 12～13 週、5/14 吵架以後＝5/18、5/20；第 12 週 5/11、5/13 還沒吵架，兩列都不算（照舊）'},
    {id:'c504_1_3',doc:'AA_504',sec:'1-1',k:3,who:'heroine_01',with:['yu'],always:true,days:[1,3],from:18,to:18+50/60,terms:['Y1S2'],wk:[14,16],zone:'campus',heard:'Alison：欸，上次那個，我還是覺得要申請很怪。／以安：我知道。妳說過了。／Alison：……那我們今天走哪邊？'},
    {id:'c504_1_4',doc:'AA_504',sec:'1-1',k:4,who:'heroine_01',with:['pool_7'],cls:true,terms:['Y1S2'],cond:'metZjw',anchor:'with',heard:'曾靖雯：早安。妳日文課是不是也很早？／以安：七點。……妳的早安我現在聽得習慣了。',place:'「照舊」＝同 AA_503（認識曾靖雯以後）'},
    {id:'c504_2_1',doc:'AA_504',sec:'2-1',k:1,who:'heroine_02',with:['hc_xt'],days:[5],from:19,to:22,terms:['Y1S2'],zone:'cafe',act:'barista',comp:{hc_xt:{clerk:'cafe'}},heard:'小婷：學姊，這杯櫻花的妳試一下。／芷若：甜。少一半糖漿。'},
    {id:'c504_2_2',doc:'AA_504',sec:'2-1',k:2,who:'heroine_02',with:['heroine_04'],always:true,days:[5],from:14,to:16,terms:['Y1S2'],zone:'campus',heard:'子晴：妳又在背單字。／芷若：翻譯課。這一句我翻了一個晚上。／子晴：給我看。……我也看不懂。',
      place:'週五 14～15 她照作息在 Café（週一三五 11～15 的班在前面），實際是 15～16'},
    {id:'c504_2_3',doc:'AA_504',sec:'2-1',k:3,who:'heroine_02',with:['npc_fangyt'],days:[5],from:15,to:16,terms:['Y1S2'],wk:[13,15],zone:'campus',heard:'方奕廷：這棵是苦楝。開花的時候是紫色的。／芷若：你每年都講一次。',
      place:'表沒寫時間：放在她週五在校園的那一段（15～16，子晴也在）；總圖門口→她照作息在校園走'},
    {id:'c504_3_1',doc:'AA_504',sec:'3-1',k:1,who:'heroine_03',with:['npc_huangxh'],always:true,days:[2,4],from:12,to:13,terms:['Y1S2'],zone:'campus',heard:'筱涵：妳的訪問寫了嗎？／語彤：寫了。寫不完。／筱涵：寫不完是好事。'},
    {id:'c504_3_2',doc:'AA_504',sec:'3-1',k:2,who:'heroine_03',with:['hc_ayi'],days:[2,4],from:17.5,to:20.5,terms:['Y1S2'],weeks:[1,2,3,4,5,6,7,10,11,12,13,14,15,16],zone:'noodle',act:'help',comp:{hc_ayi:{at:[1.8,-2.75],clerk:'noodle'}},heard:'阿姨：語彤，妳問我的那些，不要寫我年輕的時候。／語彤：……好。',place:'第 8～9 週換下一列'},
    {id:'c504_3_3',doc:'AA_504',sec:'3-1',k:3,who:'heroine_03',with:['hc_ayi'],days:[2,4],from:17.5,to:20.5,terms:['Y1S2'],wk:[8,9],zone:'noodle',act:'help',comp:{hc_ayi:{at:[1.8,-2.75],clerk:'noodle'}},heard:'阿姨：我可以煮。／語彤：妳坐著。',
      place:'「手上包著繃帶，坐在櫃台」：沒有繃帶、櫃台沒有座位，站在語彤旁邊（同上一列；給 LAWWW2）'},
    {id:'c504_4_1',doc:'AA_504',sec:'4-1',k:1,who:'heroine_04',with:['pool_5','pool_11'],days:[1,3],from:19,to:21,terms:['Y1S2'],zone:'wancai',act:'club',heard:'晨希：成發那首，我可以彈最旁邊那一把嗎？／子晴：可以啊。妳就站我旁邊。'},
    {id:'c504_4_2',doc:'AA_504',sec:'4-1',k:2,who:'heroine_04',ref:true,heard:'照 2-1',place:'＝c504_2_2'},
    {id:'c504_4_3',doc:'AA_504',sec:'4-1',k:3,who:'heroine_04',alone:true,days:[2,4],from:13,to:18,dates:[['2026-07-01','2026-08-31']],zone:'gongguan',heard:'（她戴著耳機，筆電上是一隻像素的貓。旁邊一杯冰美式，冰塊都化了。）',
      place:'公館騎樓的咖啡店：公館沒有那一間的室內，站在南側騎樓下（作息補，SCHED）'},
    {id:'c504_5_1',doc:'AA_504',sec:'5-1',k:1,who:'heroine_05',with:['npc_ta_chen'],always:true,days:[5],from:18.5,to:20.5,terms:['Y1S2'],zone:'gongguan',heard:'陳助教：上榜了，還在念？／學姊：在看小說。／陳助教：……那也算。',place:'表寫 18:00～19:00；照作息 18:30～20:30（同 c503_8_1）'},
    {id:'c504_5_2',doc:'AA_504',sec:'5-1',k:2,who:'heroine_05',with:['hc_sf1','hc_sf2'],days:[1,2,3,4,5],from:12,to:13,terms:['Y1S2'],wk:[13,14],zone:'campus',heard:'學姊的同學：書瑀，畢業照那天妳要站中間。／學姊：邊邊。',place:'霖澤館前（作息補，SCHED）'},
    {id:'c504_5_3',doc:'AA_504',sec:'5-1',k:3,who:'heroine_05',alone:true,days:[1,2,3,4,5],from:7,to:8,dates:[['2026-06-15','2026-07-05']],zone:'gym_b1',heard:'（她在最旁邊的水道，游一段，扶著池邊休息一下，再游一段。）',
      place:'沒有游泳的動作：站在池邊（作息補，SCHED）'},
    {id:'c504_6_1',doc:'AA_504',sec:'6-1',k:1,who:'classmate_peishan',with:['classmate_bohan'],days:[1,2,4,5],from:16,to:19,terms:['Y1S2'],dates:[['2026-04-06','2026-06-14']],zone:'library',cond:'psBohan',heard:'柏翰：五十分鐘到了。休息十分鐘。／沛珊：我這頁還沒看完……好啦。',
      place:'總圖二樓→兩個人的作息都在總圖三樓閱覽區（library）；週二、四 16～18 第 5～15 週她在溫州街課輔班（作息在前面）'},
    {id:'c504_6_2',doc:'AA_504',sec:'6-1',k:2,who:'classmate_peishan',ref:true,heard:'照現有'},
    {id:'c504_6_3',doc:'AA_504',sec:'6-1',k:3,who:'classmate_peishan',with:['hc_kid'],days:[2,4],from:16,to:18,terms:['Y1S2'],wk:[5,15],zone:'wenzhou',heard:'小朋友：老師！這題我會了！／沛珊：好棒！……那下一題呢？'},
    /* ===================== AA_505 大二上＋寒假 ===================== */
    {id:'c505_1_1',doc:'AA_505',sec:'1-1',k:1,who:'heroine_01',with:['yu'],always:true,days:[1,3],from:18,to:18+50/60,terms:['Y2S1'],wk:[1,7],zone:'campus',cond:'beforePlgRules',heard:'Alison：欸讀書會的規則妳又寫了幾條？／以安：十二條。／Alison：……我等一下撕一半。',
      place:'「只在第 7 週以前說」＝第 1～7 週、ev_plg_rules（Alison 撕掉一半）還沒演'},
    {id:'c505_1_2',doc:'AA_505',sec:'1-1',k:2,who:'heroine_01',ref:true,heard:'照現有讀書會'},
    {id:'c505_1_3',doc:'AA_505',sec:'1-1',k:3,who:'heroine_01',with:['pool_7'],cls:true,terms:['Y2S1'],anchor:'with',heard:'曾靖雯：早安。學弟妹都坐後面。／以安：我們大一也坐後面。／曾靖雯：我沒有。'},
    {id:'c505_2_1',doc:'AA_505',sec:'2-1',k:1,who:'heroine_02',with:['hc_np'],days:[1,3],from:19,to:22,terms:['Y2S1'],wk:[2,16],zone:'cafe',act:'barista',comp:{hc_np:{clerk:'cafe'}},heard:'新來的工讀生：學姊，熱拿鐵的奶要打到幾度？／芷若：手摸起來燙一下就好。……不要真的摸。'},
    {id:'c505_2_2',doc:'AA_505',sec:'2-1',k:2,who:'heroine_02',with:['hc_xt'],days:[5],from:19,to:22,terms:['Y2S1'],zone:'cafe',act:'barista',comp:{hc_xt:{clerk:'cafe'}},heard:'小婷：學姊，新來的那個很怕客人。／芷若：妳以前也是。'},
    {id:'c505_2_3',doc:'AA_505',sec:'2-1',k:3,who:'heroine_02',with:['heroine_04'],always:true,ref:true,days:[5],from:14,to:16,terms:['Y2S1'],zone:'campus',heard:'照現有',place:'同框照 c504_2_2（沒有新句子）'},
    {id:'c505_3_1',doc:'AA_505',sec:'3-1',k:1,who:'heroine_03',with:['hc_fr1','hc_fr2'],days:[4],from:15+10/60,to:15.5,terms:['Y2S1'],weeks:[2,3,4,5,6,7,10,11,12,13,14,15],zone:'campus',
      heard:'大一的學妹：學姊，妳是社會系的？／語彤：嗯。雙主修。／大一的學妹：那妳為什麼坐最後一排？／語彤：……習慣。',place:'霖澤館門口（作息補，SCHED）；「第 2 週起」到第 15 週、期中週不上課'},
    {id:'c505_3_2',doc:'AA_505',sec:'3-1',k:2,who:'heroine_03',with:['npc_huangxh'],always:true,days:[2,4],from:12,to:13,terms:['Y2S1'],zone:'campus',heard:'筱涵：法律系的課怎樣？／語彤：大家講話都很快。／筱涵：妳也可以很快。／語彤：我不要。'},
    {id:'c505_3_3',doc:'AA_505',sec:'3-1',k:3,who:'heroine_03',with:['hc_ayi'],days:[2,4],from:17.5,to:20.5,terms:['Y2S1'],zone:'noodle',act:'help',comp:{hc_ayi:{at:[1.8,-2.75],clerk:'noodle'}},heard:'阿姨：法律系的課，聽得懂嗎？／語彤：一半。／阿姨：一半很多了。'},
    {id:'c505_3_4',doc:'AA_505',sec:'3-1',k:4,who:'heroine_03',with:['hc_ayi'],days:[6],from:9,to:12,terms:['Y2S1'],zone:'noodle',act:'help',comp:{hc_ayi:{at:[1.8,-2.75],clerk:'noodle'}},heard:'阿姨：蒜頭剝好了嗎？／語彤：還有一盆。'},
    /* ===================== AA_503 第 14 節後補第 8、9 點（企劃線 f6069e42d；PRIV-AUNT-1028 第二輪）：大二下以後每學期阿姨那一列 =====================
       第 8 點「大二下以後也要有阿姨那一列：週二、四 17:30～20:30 在麵店，同 c503_6_2 的做法，每學期都有（到 2029-09 畢業以後篇以前）」；走近時聽到＝第 9 點的表（一學期一組，照抄）。
       同 c503_6_2：terms＝那一學期上課期間（寒暑假、大五上不排）、她照作息在麵店顧店（noodle／help）才成立、沒寫一定同框＝那一天擲 70%（S.P）。
       她照作息週二、四晚上在不在麵店（src/data/characters.js heroine_03，2026-10-28 逐週查）：大二下 週二、四（第 8～9 週期中在總圖，AA_375 第 16 項）；
       大三上 週二（第 2 週 9/14 18:30 起）、週四到事件 13（12/16）以前；大三下 只有週二（週四做田野 T1）；大四上、大四下 只有週二（週四總圖三樓）。週四不在的學期 days 照樣寫 [2,4]（同 c503_6_2，週四照作息不成立）。 */
    {id:'c503_14_1',doc:'AA_503',sec:'14-後補9',k:1,who:'heroine_03',with:['hc_ayi'],days:[2,4],from:17.5,to:20.5,terms:['Y2S2'],zone:'noodle',act:'help',comp:{hc_ayi:{at:[1.8,-2.75],clerk:'noodle'}},heard:'阿姨：語彤，報告寫完了沒？／語彤：……寫完一半。／阿姨：一半就是還沒。',
      place:'大二下：週二、四都在店裡（第 8～9 週她在總圖＝不成立）'},
    {id:'c503_14_2',doc:'AA_503',sec:'14-後補9',k:2,who:'heroine_03',with:['hc_ayi'],days:[2,4],from:17.5,to:20.5,terms:['Y3S1'],zone:'noodle',act:'help',comp:{hc_ayi:{at:[1.8,-2.75],clerk:'noodle'}},heard:'阿姨：妳在訪問別人喔？／語彤：嗯。／阿姨：我就不用了。我沒有故事。',
      place:'大三上：週二（第 2 週 9/14 她 17:30～18:30 在總圖門口，18:30 起）；週四到事件 13（12/16，STORY.ytThuFree）以前。這一句接 AA_508 Y6-L8「她上次說，她沒有故事。」和 8/22 第二十三個訪談（阿姨）'},
    {id:'c503_14_3',doc:'AA_503',sec:'14-後補9',k:3,who:'heroine_03',with:['hc_ayi'],days:[2,4],from:17.5,to:20.5,terms:['Y3S2'],zone:'noodle',act:'help',comp:{hc_ayi:{at:[1.8,-2.75],clerk:'noodle'}},heard:'阿姨：桌子擦兩次。／語彤：擦過了。／阿姨：那再一次。',
      place:'大三下：只有週二（週四 17:00～20:00 她在做田野訪談，AA_260、AA_376 #1）'},
    {id:'c503_14_4',doc:'AA_503',sec:'14-後補9',k:4,who:'heroine_03',with:['hc_ayi'],days:[2,4],from:17.5,to:20.5,terms:['Y4S1'],zone:'noodle',act:'help',comp:{hc_ayi:{at:[1.8,-2.75],clerk:'noodle'}},heard:'阿姨：（看著牆上的照片）妳的學士照，以後要掛哪裡？／語彤：……還沒畢業。',
      place:'大四上：只有週二（週四 17:00 起她在總圖三樓，AA_381 第 2 項）'},
    {id:'c503_14_5',doc:'AA_503',sec:'14-後補9',k:5,who:'heroine_03',with:['hc_ayi'],days:[2,4],from:17.5,to:20.5,terms:['Y4S2'],dates:[['2029-02-19','2029-04-18'],['2029-04-26','2029-06-03']],zone:'noodle',act:'help',comp:{hc_ayi:{at:[1.8,-2.75],clerk:'noodle'}},heard:'阿姨：明年才畢業喔？／語彤：雙主修，多一年。／阿姨：多一年好。多一年在這裡。',
      place:'大四下：只有週二（週四總圖三樓）；4/19～4/25 阿姨第一次出國、店休一週（AA_510 第 3 節、動態第 2 則 4/25「阿姨去哪？」「日本。第一次出國。」）＝那一週不排（dates 跳過）。這一句接 AA_510 第 3 節（延畢一年）'},
    {id:'c505_4_1',doc:'AA_505',sec:'4-1',k:1,who:'heroine_04',with:['pool_11','hc_nm'],days:[1,3],from:19,to:21,terms:['Y2S1'],weeks:[3,4,5,6,7,10,11,12,13,14,15],zone:'wancai',act:'club',heard:'晨希：她按不出 C。／子晴：我來。……手指不要躺下去。',place:'作息從第 5 週改成第 3 週（SCHED 補第 3、4 週）'},
    {id:'c505_4_2',doc:'AA_505',sec:'4-1',k:2,who:'heroine_04',ref:true,heard:'照現有',place:'＝c505_2_3'},
    {id:'c505_4_3',doc:'AA_505',sec:'4-1',k:3,who:'heroine_04',with:['kai'],days:[5],from:17,to:17+20/60,terms:['Y2S1'],wk:[3,12],zone:'campus',heard:'阿凱：所以實驗室妳要去嗎。／子晴：不要問。／阿凱：好。',
      place:'資工系館前→校園（作息補 17:00～17:20，SCHED）；實驗室的信第 3 週才來（ev_ziqing_lab_letter），所以第 3～12 週'},
    {id:'c505_4_3b',doc:'AA_505',sec:'4-1',k:'3b',who:'heroine_04',with:['kai'],once:true,days:[5],from:17,to:17+20/60,terms:['Y2S1'],wk:[13,15],zone:'campus',heard:'阿凱：所以妳回絕了。／子晴：……你怎麼知道。／阿凱：妳的臉。',
      place:'表下面的說明：第 12 週她回絕以後換成這三句，一次（回絕的信在第 12 週週日，所以第 13 週起的第一個週五）'},
    {id:'c505_5_1',doc:'AA_505',sec:'5-1',k:1,who:'heroine_05',with:['npc_ta_chen'],always:true,days:[5],from:18.5,to:20.5,terms:['Y2S1'],zone:'gongguan',heard:'陳助教：演習課怎樣？／學姊：學生問我有沒有考古題。／陳助教：……妳怎麼說？／學姊：我說有。我寫的。'},
    {id:'c505_5_2',doc:'AA_505',sec:'5-1',k:2,who:'heroine_05',alone:true,days:[1,2,3,4],from:7,to:8,terms:['Y2S1'],dates:[['2026-09-09','2026-12-27']],zone:'gym_b1',heard:'（她在最旁邊的水道，游完一趟，看了一下牆上的鐘。）',
      place:'池邊（作息補，SCHED）；表寫「平日」、第 8 節寫「週一～四」＝週一～四；9/8 08:30 新學生證「可以刷了」（第 5-2 節）以後＝9/9 起'},
    {id:'c505_5_3',doc:'AA_505',sec:'5-1',k:3,who:'heroine_05',ref:true,heard:'照現有'},
    {id:'c505_6_1',doc:'AA_505',sec:'6-1',k:1,who:'classmate_peishan',with:['classmate_bohan'],days:[1,2,4,5],from:16,to:19,terms:['Y2S1'],wk:[1,6],zone:'library',cond:'psBohan',heard:'柏翰：今天念幾頁？／沛珊：……還好啦。你呢？',place:'總圖二樓→總圖三樓閱覽區（兩個人的作息）'},
    {id:'c505_6_2',doc:'AA_505',sec:'6-1',k:2,who:'classmate_peishan',alone:true,days:[1,2,4,5],from:16,to:19,terms:['Y2S1'],wk:[7,16],zone:'library',cond:'psAfterBohan',heard:'（她坐在原本的位子，旁邊的椅子是空的。她在看手機，沒有在看書。）',
      place:'「和柏翰分開以後」＝玩家沒和她交往、柏翰那一段已經結束（STORY.partnerOn）'},
    {id:'c505_6_3',doc:'AA_505',sec:'6-1',k:3,who:'classmate_peishan',ref:true,heard:'照現有'},
    /* ===================== AA_506 大二下＋暑假 ===================== */
    {id:'c506_1_1',doc:'AA_506',sec:'1-1',k:1,who:'heroine_01',with:['hc_jp'],days:[1,3,5],from:7+50/60,to:8,terms:['Y2S2'],wk:[6,16],zone:'campus',heard:'日文課的同學：沈同學，妳今天一個敬語都沒用。／以安：……我在練習。／日文課的同學：聽起來好兇。',place:'總圖門口（她現有的「日文課剛下課」那一筆）'},
    {id:'c506_1_2',doc:'AA_506',sec:'1-1',k:2,who:'heroine_01',with:['hc_room'],days:[1,2,3,4,5],from:21+50/60,to:22+10/60,terms:['Y2S2'],wk:[10,13],zone:'campus',
      heard:'以安的室友：政見第三條是什麼？／以安：「記點以前先問」。／以安的室友：……妳寫的？／以安：妳說的。我只是寫下來。',place:'女生宿舍門口＝大一女舍門口（3D 唯一的女生宿舍；作息補 21:50～22:10，SCHED）'},
    {id:'c506_1_3',doc:'AA_506',sec:'1-1',k:3,who:'heroine_01',ref:true,heard:'照現有讀書會'},
    {id:'c506_2_1',doc:'AA_506',sec:'2-1',k:1,who:'heroine_02',with:['hc_np'],days:[1,3],from:19,to:22,dates:[['2027-02-22','2027-06-02']],zone:'cafe',act:'barista',comp:{hc_np:{clerk:'cafe'}},heard:'新來的工讀生：學姊，三號桌那位是不是都點熱美式？／芷若：……妳比我早記住。'},
    {id:'c506_2_2',doc:'AA_506',sec:'2-1',k:2,who:'heroine_02',with:['hc_np'],days:[1,3],from:14,to:17,dates:[['2027-06-04','2027-08-20']],zone:'cafe',act:'read',comp:{hc_np:{stand:true}},
      heard:'新來的工讀生：學姊，一樣嗎？／芷若：……被問「一樣嗎」好奇怪。／新來的工讀生：那，一樣嗎？／芷若：一樣。',place:'窗邊的位子＝她當客人坐的位子（作息 14～17），工讀生站在桌邊'},
    {id:'c506_2_3',doc:'AA_506',sec:'2-1',k:3,who:'heroine_02',with:['heroine_04'],always:true,days:[5],from:14,to:16,terms:['Y2S2'],dates:[['2027-02-22','2027-05-10']],zone:'campus',heard:'芷若：今天幾號？／子晴：妳手機上有。／芷若：我知道。'},
    {id:'c506_2_4',doc:'AA_506',sec:'2-1',k:4,who:'heroine_02',with:['heroine_04'],always:true,once:true,days:[5],from:14,to:16,terms:['Y2S2'],dates:[['2027-05-14','2027-06-13']],zone:'campus',heard:'子晴：信收到了。所以妳可以不要再問我幾號了。／芷若：……今天幾號？'},
    {id:'c506_3_1',doc:'AA_506',sec:'3-1',k:1,who:'heroine_03',with:['pool_7'],days:[1],from:12.2,to:12.5,terms:['Y2S2'],weeks:[2,3,4,5,6,7,10,11,12,13,14,15],zone:'campus',
      heard:'曾靖雯：妳往前坐了。／語彤：……嗯。／曾靖雯：第一排還有位子。／語彤：第二排就好。',place:'霖澤館門口（債各週一上午在霖澤館 201，12:12 下課；作息補 12:12～12:30，SCHED）'},
    {id:'c506_3_2',doc:'AA_506',sec:'3-1',k:2,who:'heroine_03',with:['npc_huangxh'],always:true,days:[2,4],from:12,to:13,terms:['Y2S2'],zone:'campus',heard:'筱涵：妳最近坐前面了？／語彤：第二排。／筱涵：那很前面了。'},
    {id:'c506_3_3',doc:'AA_506',sec:'3-1',k:3,who:'heroine_03',with:['hc_uncle'],days:[2,4],from:14.5,to:15.5,dates:[['2027-07-09','2027-09-05']],zone:'noodle',act:'read',
      heard:'點乾麵的阿伯：妳錄這個要幹嘛？／語彤：做報告。／點乾麵的阿伯：報告寫我？……那要寫我年輕的時候很帥。／語彤：……我記下來了。',place:'麵店的桌子（午休，作息補，SCHED）；阿伯坐她對面'},
    {id:'c506_4_1',doc:'AA_506',sec:'4-1',k:1,who:'heroine_04',with:['pool_11'],days:[1,3],from:19,to:21,terms:['Y2S2'],zone:'wancai',act:'club',heard:'晨希：導線又少一條。／子晴：……我數過了。妳借走的。／晨希：啊。'},
    {id:'c506_4_2',doc:'AA_506',sec:'4-1',k:2,who:'heroine_04',alone:true,days:[2,4],from:21,to:23.5,terms:['Y2S2'],wk:[2,16],zone:'gongguan',heard:'（她坐在騎樓下的插座旁邊，筆電開著。路過的人很多，她沒有抬頭。）',
      place:'公館騎樓：沒有可以坐的地方，站在插座旁邊（作息補，SCHED）；「暑假照舊」見下一列'},
    {id:'c506_4_2s',doc:'AA_506',sec:'4-1',k:'2s',who:'heroine_04',alone:true,derived:true,heardFrom:'c506_4_2',days:[2,4],from:21,to:23.5,dates:[['2027-06-14','2027-09-05']],zone:'gongguan',heard:'',place:'上一列的「暑假照舊」（句子同上一列）'},
    {id:'c506_4_3',doc:'AA_506',sec:'4-1',k:3,who:'heroine_04',ref:true,heard:'照 2-1',place:'＝c506_2_3、c506_2_4'},
    {id:'c506_5_1',doc:'AA_506',sec:'5-1',k:1,who:'heroine_05',with:['npc_ta_chen'],always:true,days:[5],from:18.5,to:20.5,terms:['Y2S2'],wk:[1,11],zone:'gongguan',heard:'陳助教：題目定了沒？／學姊：還沒。／陳助教：上週也說還沒。／學姊：上週是真的還沒。'},
    {id:'c506_5_2',doc:'AA_506',sec:'5-1',k:2,who:'heroine_05',with:['npc_ta_chen'],always:true,days:[5],from:18.5,to:20.5,terms:['Y2S2'],wk:[12,16],zone:'gongguan',heard:'陳助教：定了以後，妳講話變慢了。／學姊：定了，就不用趕了。'},
    /* ===================== AA_507 大三上＋寒假 ===================== */
    {id:'c507_1_1',doc:'AA_507',sec:'1-1',k:1,who:'heroine_01',with:['hc_jp'],days:[1,3,5],from:7+50/60,to:8,terms:['Y3S1'],zone:'campus',heard:'日文課的同學：沈同學，妳三月就走了喔？／以安：嗯。／日文課的同學：那妳幫我們聽聽看，日本人是不是真的講那麼快。'},
    {id:'c507_1_2',doc:'AA_507',sec:'1-1',k:2,who:'heroine_01',with:['hc_plg'],days:[4],from:20,to:21.5,terms:['Y3S1'],zone:'wancai',act:'club',heard:'讀書會的學妹：學姊，第三條規則是什麼？／以安：準時開始。／讀書會的學妹：學姊上週遲到。／以安：……所以我在想要不要改。'},
    {id:'c507_3_1',doc:'AA_507',sec:'3-1',k:1,who:'heroine_03',with:['hc_soc1','hc_soc2'],days:[1,5],from:17+20/60,to:17+50/60,terms:['Y3S1'],zone:'campus',heard:'社會系的學弟妹：助教，逐字稿一定要逐字嗎？／語彤：要。／社會系的學弟妹：連「嗯」都要？／語彤：「嗯」最重要。',
      place:'「質性研究方法下課（照課表）」：遊戲沒有她社會系的課表，照 AA_508 同一批人的時間：週一、五 17:20 社科院門口（作息補，SCHED）'},
    {id:'c507_3_2',doc:'AA_507',sec:'3-1',k:2,who:'heroine_03',alone:true,days:[3],from:8.9,to:12.2,terms:['Y3S1'],zone:'classroom',act:'class',heard:'（她坐第二排。前面的大一新生回頭借立可帶，她借了，沒有說話。）',place:'教室第二排（大一的學生＝那一堂課的同學，不另外生）'},
    {id:'c507_3_3',doc:'AA_507',sec:'3-1',k:3,who:'heroine_03',with:['npc_huangxh'],always:true,days:[2,4],from:12,to:13,terms:['Y3S1'],zone:'campus',heard:'筱涵：妳當助教以後，學生怕妳嗎？／語彤：不怕。他們會問我晚餐吃什麼。'},
    {id:'c507_4_1',doc:'AA_507',sec:'4-1',k:1,who:'heroine_04',with:['hc_gtr'],days:[1,3],from:19,to:21,terms:['Y3S1'],zone:'wancai',act:'club',heard:'吉他社的學弟：學姊，導線我都貼名字了。／子晴：……那條沒有。／吉他社的學弟：那條是學姊的。／子晴：……喔。'},
    {id:'c507_4_2',doc:'AA_507',sec:'4-1',k:2,who:'heroine_04',alone:true,ref:true,heardFrom:'c506_4_2',days:[1,2,3,4,5],from:22,to:24,terms:['Y3S1'],zone:'gongguan',heard:'照 `AA_506` 4-1',place:'公館騎樓（作息補，SCHED）；句子＝AA_506 4-1 那一句'},
    {id:'c507_5_1',doc:'AA_507',sec:'5-1',k:1,who:'heroine_05',with:['npc_ta_chen'],always:true,days:[5],from:18.5,to:20.5,terms:['Y3S1'],wk:[1,10],dates:[['2027-09-06','2027-11-11']],zone:'gongguan',heard:'陳助教：美國那邊寫了嗎？／學姊：寫了。「為什麼想去」那一欄還空著。／陳助教：寫「因為想去」就好。／學姊：……那樣會被退件。'},
    {id:'c507_5_1b',doc:'AA_507',sec:'5-1',k:'1b',who:'heroine_05',with:['npc_ta_chen'],always:true,once:true,days:[5],from:18.5,to:20.5,terms:['Y3S1'],dates:[['2027-11-12','2027-12-26']],zone:'gongguan',heard:'陳助教：送出去了？／學姊：送出去了。／陳助教：那今天可以講別的。／學姊：……講什麼？',
      place:'表下面的說明：11/12 申請送出以後換成這四句，一次'},
    /* ===================== AA_508 大三下＋暑假 ===================== */
    {id:'c508_1_1',doc:'AA_508',sec:'1-1',k:1,who:'heroine_01',with:['yu'],always:true,days:[1,3],from:18,to:18+50/60,terms:['Y3S2'],wk:[1,5],zone:'campus',heard:'Alison：妳走了以後，讀書會誰叫大家安靜？／以安：妳。／Alison：……我？／以安：妳最大聲。'},
    {id:'c508_1_2',doc:'AA_508',sec:'1-1',k:2,who:'heroine_01',with:['hc_plg'],days:[4],from:20,to:21.5,terms:['Y3S2'],wk:[1,5],zone:'wancai',act:'club',heard:'讀書會的學妹：學姊，那條「遲到的人請喝飲料」，Alison 學姊已經請三次了。／以安：……她自己訂的時候就知道了。'},
    {id:'c508_2_1',doc:'AA_508',sec:'2-1',k:1,who:'heroine_02',with:['hc_np'],days:[3,4],from:19,to:22,dates:[['2028-02-21','2028-06-30']],zone:'cafe',act:'barista',comp:{hc_np:{clerk:'cafe'}},heard:'小禾：學姊，三號桌說要「跟上次一樣」。／芷若：……上次是誰點的？／小禾：我。／芷若：那妳去。'},   /* AA_519 3-4：2027-06-04 起新來的工讀生叫小禾（說話人改小禾；3D 名牌、字幕 src/sup519_3d.js）*/
    {id:'c508_2_2',doc:'AA_508',sec:'2-1',k:2,who:'heroine_02',with:['hc_np'],days:[1,3],from:19,to:21.5,dates:[['2028-08-01','2028-09-01']],zone:'cafe',act:'read',comp:{hc_np:{stand:true}},heard:'小禾：學姊，一樣嗎？／芷若：一樣。……妳不用每次都問。／小禾：要問。學姊教的。',place:'窗邊的位子＝她當客人坐的位子（作息 19:00～21:30），工讀生站在桌邊（AA_519 3-4：說話人改小禾）'},
    {id:'c508_2_3',doc:'AA_508',sec:'2-1',k:3,who:'heroine_02',with:['heroine_04'],always:true,days:[5],from:14,to:16,terms:['Y3S2'],wk:[12,16],zone:'campus',heard:'芷若：妳畢業以後，週五下午要去哪？／子晴：上班。／芷若：……那我週五下午去哪？／子晴：妳也要出國了。'},
    {id:'c508_3_1',doc:'AA_508',sec:'3-1',k:1,who:'heroine_03',with:['hc_soc1','hc_soc2'],days:[1,5],from:17+20/60,to:17+50/60,terms:['Y3S2'],zone:'campus',heard:'社會系的學弟妹：學姊，田野要怎麼開始？／語彤：先去。坐著就好。／社會系的學弟妹：坐多久？／語彤：坐到他們先開口。',
      place:'社科院門口：現有那一筆（BB_106 D2）是擲到才在、說過就不排，所以大三另外補一筆（SCHED）'},
    {id:'c508_3_2',doc:'AA_508',sec:'3-1',k:2,who:'heroine_03',alone:true,days:[3],from:8.9,to:12.2,terms:['Y3S2'],zone:'classroom',act:'class',heard:'（她坐第二排，把筆記本攤開，前面的大一新生在傳紙條。她看了一眼，繼續寫。）',place:'教室第二排（大一的學生＝那一堂課的同學）'},
    {id:'c508_4_1',doc:'AA_508',sec:'4-1',k:1,who:'heroine_04',ref:true,heard:'照 2-1',place:'＝c508_2_3'},
    {id:'c508_4_2',doc:'AA_508',sec:'4-1',k:2,who:'heroine_04',with:['hc_gtr'],days:[1,3],from:19,to:21,terms:['Y3S2'],zone:'wancai',act:'club',heard:'吉他社的學弟：學姊，畢業以後還會回來聽嗎？／子晴：……下班以後。／吉他社的學弟：那都九點以後了。／子晴：對。'},
    {id:'c508_5_1',doc:'AA_508',sec:'5-1',k:1,who:'heroine_05',with:['npc_ta_chen'],always:true,days:[5],from:18.5,to:20.5,terms:['Y3S2'],wk:[1,3],zone:'gongguan',heard:'陳助教：結果出來了沒？／學姊：還沒。／陳助教：……妳今天一直看手機。／學姊：沒有一直。'},
    {id:'c508_5_2',doc:'AA_508',sec:'5-1',k:2,who:'heroine_05',with:['npc_ta_chen'],always:true,days:[5],from:18.5,to:20.5,terms:['Y3S2'],wk:[4,16],zone:'gongguan',heard:'陳助教：美國的宿舍排到了沒？／學姊：還沒。每天看信箱。／陳助教：妳以前等成績也這樣。／學姊：……我現在比較會等了。'},
    /* ===================== AA_509 大四上＋寒假（CIRCLE3D-Y4-1028）===================== */
    {id:'c509_1_1',doc:'AA_509',sec:'1-1',k:1,who:'heroine_01',alone:true,days:[4],from:18.5,to:19.5,terms:['Y4S1'],wk:[2,13],zone:'noodle',heard:'（阿姨在廚房喊：「日本有沒有好吃的麵？」以安：「沒有這種的。」阿姨：「那就好。」）',
      place:'麵店長桌＝她的作息（characters.js 週四 18:30～19:30 麵店，AA_509 0-2 第 3 點，現有）；阿姨在廚房＝旁白，不生阿姨'},
    {id:'c509_1_2',doc:'AA_509',sec:'1-1',k:2,who:'heroine_01',with:['heroine_03'],always:true,anchor:'with',comp:{heroine_03:{behind:true}},days:[4],from:20,to:21.5,dates:[['2028-11-30','2029-02-18']],zone:'library',
      heard:'（以安坐在語彤後面那桌。九點半語彤先走，經過她旁邊，敲了一下桌子。）',
      place:'總圖三樓＝閱覽區（library）；兩個人的作息都在（characters.js 12/7～1/20 週四 20:00～21:30，AA_509 0-2 第 3 點、語彤延到 21:30）＝照作息一定同框（同學姊和陳助教）；以安坐到語彤背後那一桌（comp behind）'},
    {id:'c509_3_1',doc:'AA_509',sec:'3-1',k:1,who:'heroine_03',ref:true,heardFrom:'c509_1_2',heard:'照 1-1 第二列',
      place:'語彤週四 17:00～20:00 總圖三樓一個人＝現有作息；11/30 以後以安坐她後面＝c509_1_2 那一段（同一段同框，句子同那一列，不另外排）'},
    {id:'c509_3_2',doc:'AA_509',sec:'3-1',k:2,who:'heroine_03',spot:[['library_hall',0,7.6,0],['campus',86.4,0,0]],days:[4],from:17+50/60,to:18+10/60,terms:['Y4S1'],wk:[10,16],zone:'library',
      heard:'（總圖門口站著一個中年女人，往裡面看了一會兒，就走了。）',
      place:'總圖門口＝總圖大廳的門廳（library_hall）和校園的總圖門口：走到那裡 5 m 內出旁白（spot）；語彤照作息在總圖三樓讀書；媽媽只有旁白、不生 3D 人物（表下面的說明）；「18:00 前後」＝17:50～18:10'},
    {id:'c509_3_3',doc:'AA_509',sec:'3-1',k:3,who:'heroine_03',alone:true,days:[1,4],from:8.9,to:15.2,terms:['Y4S1'],zone:'classroom',act:'class',heard:'（她坐第二排，前面的人回頭問她考古題。她說：「我也是第一次修。」）',
      place:'法律課＝她的作息（characters.js 週一上午憲法（上）、週四下午民法總則，霖澤館 201 第二排，AA_509 0-2 第 5 點）；前面的人＝那一堂課的同學（不另外生）'},
    {id:'c509_4_1',doc:'AA_509',sec:'4-1',k:1,who:'heroine_04',alone:true,days:[1,2,3,4,5],from:22,to:24,dates:[['2028-09-04','2029-06-27']],zone:'gongguan',heard:'（她坐在騎樓下的插座旁邊，筆電開著。螢幕上的貓走路會跳一下。）',
      place:'公館騎樓（插座旁邊；作息補，SCHED，同 c507_4_2）；AA_509 實作時定的第 4 點（6bc3cd784）：大四上開學起延到大四下 6/27（她在工作室上班，下班照樣在騎樓寫自己的），6/28 起換 c510_4_1（週五，阿凱）'},
    {id:'c509_5_1',doc:'AA_509',sec:'5-1',k:1,who:'heroine_05',with:['npc_ta_chen'],always:true,days:[5],from:18.5,to:20.5,dates:[['2029-01-12','2029-02-18']],zone:'gongguan',
      heard:'陳助教：美國怎麼樣？／學姊：游泳池很長。／陳助教：……我問的是論文。／學姊：論文也很長。',place:'照作息 18:30～20:30（同 c503_8_1）；AA_509 實作時定的第 2 點（6bc3cd784）：從 2029-01-12 開始（對齊 feed_y4s1 1/12「恢復了。」），12/23 回來以後的 12/29、1/5 不排（SCHED c509_5_1off：那兩晚她不在 3D）'},
    /* ===================== AA_510 大四下＋畢業那年夏天（CIRCLE3D-Y4-1028；6/4 起畢業以後篇照現有做法）===================== */
    {id:'c510_1_1',doc:'AA_510',sec:'1-1',k:1,who:'heroine_01',with:['heroine_03'],always:true,anchor:'with',comp:{heroine_03:{behind:true}},days:[4],from:20,to:21.5,terms:['Y4S2'],wk:[1,15],zone:'library',
      heard:'（語彤抬頭看你一眼，指了指以安，比了一個「噓」。以安沒有抬頭。）',
      place:'總圖三樓（library）；兩個人的作息都在（characters.js 大四下第 1～15 週週四 20:00～21:30，AA_510 0-2 第 1 點）＝照作息一定同框；以安坐語彤背後那一桌（同 c509_1_2）'},
    {id:'c510_3_1',doc:'AA_510',sec:'3-1',k:1,who:'heroine_03',ref:true,heardFrom:'c510_1_1',heard:'照 1-1',place:'＝c510_1_1（同一段同框，句子同那一列，不另外排）'},
    {id:'c510_3_2',doc:'AA_510',sec:'3-1',k:2,who:'heroine_03',alone:true,days:[4],from:17.5,to:20.5,dates:[['2029-06-04','2029-09-02']],zone:'noodle',heard:'（她坐在長桌最裡面，課本攤開。客人進來，她把書闔上，站起來。）',
      seatAt:[3,-0.3],standAt:[4.15,1.1],
      place:'麵店長桌＝她的作息（characters.js 暑假週四 17:30～20:30 麵店顧店，AA_510 0-2 第 2 點，現有，act help）；6/4 起畢業以後篇，照現有做法。'
        +'AA_509 實作時定的第 5 點（6bc3cd784）：坐長桌最裡面、靠廚房的那個位子＝seatAt（套件的三張桌子連成長桌，最東邊那張 x=3、靠廚房那一側 z=-0.3，廚房那一頭、她顧店的位置 (2.6,-3.6) 旁邊）；'
        +'客人進來她站起來，站在長桌那一頭、門口那一側＝standAt（那張桌子東端 x=4.15、往門口那一側 z=1.1，面向門口；hcircle3d.js S.shopSeat）'},
    {id:'c510_4_1',doc:'AA_510',sec:'4-1',k:1,who:'heroine_04',with:['kai'],always:true,days:[5],from:22,to:24,dates:[['2029-06-28','2029-09-02']],zone:'gongguan',
      heard:'阿凱：所以妳的遊戲什麼時候給我玩。／子晴：你在名單上。／阿凱：……第幾個？／子晴：不要問。',
      place:'公館（她平日 22～24 點、阿凱 6/28 起週五 22～24 點都在公館，characters.js 現有）＝照作息一定同框、一起走；畢業以後篇照現有做法'},
    {id:'c510_5_1',doc:'AA_510',sec:'5-1',k:1,who:'heroine_05',with:['npc_ta_chen'],always:true,days:[5],from:18.5,to:20.5,dates:[['2029-05-29','2029-09-02']],zone:'gongguan',
      heard:'陳助教：口試委員記得妳嗎？／學姊：他叫我「第一排那個」。／陳助教：……那是記得。／學姊：嗯。',place:'5/29 口試以後的週五（6/1 起）；照作息 18:30～20:30（同 c503_8_1）；6/4 起畢業以後篇，照現有做法'}]
};
if(typeof window!=='undefined') window.HCIRCLE_DATA=HCIRCLE_DATA;

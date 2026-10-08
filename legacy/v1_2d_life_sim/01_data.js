/* ===== 01 基礎資料：學校、課程、老師、活動、小事件、考題 ===== */
'use strict';
const SCHOOL = '北辰大學法律學系';

// 國考科目群
const SUBJ = {
  const_:{ id:'const_', name:'憲法與行政法', short:'憲行' },
  civ:{ id:'civ', name:'民法', short:'民法' },
  civpro:{ id:'civpro', name:'民事訴訟法', short:'民訴' },
  crim:{ id:'crim', name:'刑法', short:'刑法' },
  crimpro:{ id:'crimpro', name:'刑事訴訟法', short:'刑訴' },
  com:{ id:'com', name:'商事法', short:'商法' },
};
const SUBJ_IDS = ['const_','civ','civpro','crim','crimpro','com'];

// 老師風格：sys 體系、case 案例、disc 討論、report 報告、prac 實務
const TEACHERS = {
  chen:{ id:'chen', name:'陳教授', style:'sys', gender:'f', color:'#4A6C8C',
    styleName:'體系派', hint:'聽學長姐說：很重視定義與體系位置，考題常從「這個概念放在哪裡」出發。',
    quirk:'講到重點時會說「這個很基本」，然後全班默默畫星號。' },
  lin:{ id:'lin', name:'林教授', style:'case', gender:'m', color:'#6B4E2E',
    styleName:'案例派', hint:'上課幾乎都在講案例，聽說考試就是丟一個案子給你，看你找不找得到爭點。',
    quirk:'常在下課前五分鐘丟一句「所以，這個案子你們覺得呢？」然後就下課。' },
  huang:{ id:'huang', name:'黃教授', style:'disc', gender:'m', color:'#3E5A48',
    styleName:'討論派', hint:'喜歡點人回答，據說平時發言會影響分數，不過怎麼算沒人知道。',
    quirk:'會突然問「你同意嗎？」不管你有沒有舉手。' },
  wu:{ id:'wu', name:'吳老師', style:'report', gender:'f', color:'#7A2E3B',
    styleName:'報告派', hint:'分組報告佔很重，聽說最在意「有沒有自己找資料」。',
    quirk:'每次都說「這學期報告不會很重」，然後大家在期末都熬夜。' },
  chang:{ id:'chang', name:'張教授', style:'sys', gender:'m', color:'#4A6C8C', styleName:'體系派', hint:'債編講得很細，體系圖畫得很漂亮。', quirk:'黑板上的體系圖從來沒有一次擦完。' },
  tsai:{ id:'tsai', name:'蔡教授', style:'case', gender:'f', color:'#6B4E2E', styleName:'案例派', hint:'行政法會拿真實的行政處分來討論。', quirk:'很愛問「那救濟途徑呢？」' },
  hsu:{ id:'hsu', name:'許教授', style:'prac', gender:'m', color:'#3E5A48', styleName:'實務派', hint:'當過律師，講程序法會講很多實務上的細節。', quirk:'口頭禪是「實務上不是這樣」。' },
  liu:{ id:'liu', name:'劉教授', style:'disc', gender:'f', color:'#3E5A48', styleName:'討論派', hint:'公司法課會要求分組扮演董事會。', quirk:'講到經營判斷法則時會很興奮。' },
  kuo:{ id:'kuo', name:'郭老師', style:'report', gender:'m', color:'#7A2E3B', styleName:'報告派', hint:'選修課很輕鬆，但報告要有自己的看法。', quirk:'會在報告後追問「所以你的意見是什麼？」' },
  sato:{ id:'sato', name:'佐藤老師', style:'disc', gender:'f', color:'#7A5C3A', styleName:'語言課', hint:'日文課，每週小考。', quirk:'很溫柔，但小考很準時。' },
  eng:{ id:'eng', name:'Ms. Carter', style:'disc', gender:'f', color:'#4A6C8C', styleName:'語言課', hint:'法學英文，全英文上課，讀判決摘要。', quirk:'會要求你用英文解釋 consideration。' },
};

// 課程資料：subj 對應國考科目；type: req 必修 / elec 選修 / gen 通識
const COURSES = {
  civ1:{ id:'civ1', name:'民法總則', teacher:'chen', subj:'civ', type:'req', credits:3, exam:true, y:1,s:1, slots:['一 08:10','三 10:20'] },
  crim1:{ id:'crim1', name:'刑法總則', teacher:'lin', subj:'crim', type:'req', credits:3, exam:true, y:1,s:1, slots:['二 10:20','四 13:20'] },
  cons1:{ id:'cons1', name:'憲法', teacher:'huang', subj:'const_', type:'req', credits:2, exam:true, y:1,s:1, slots:['三 13:20'] },
  intro:{ id:'intro', name:'法學緒論', teacher:'wu', subj:null, type:'req', credits:2, exam:false, report:true, y:1,s:1, slots:['五 10:20'] },
  legalEn1:{ id:'legalEn1', name:'法學英文（一）', teacher:'eng', subj:null, type:'elec', credits:2, exam:false, lang:'en', y:1,s:1, slots:['二 15:30'] },
  polsci:{ id:'polsci', name:'政治學', teacher:'kuo', subj:'const_', type:'elec', credits:2, exam:false, report:true, y:1,s:1, slots:['四 15:30'] },
  econ:{ id:'econ', name:'經濟學原理', teacher:'kuo', subj:'com', type:'elec', credits:2, exam:false, report:true, y:1,s:1, slots:['一 15:30'] },
  film:{ id:'film', name:'通識：電影與社會', teacher:'kuo', subj:null, type:'gen', credits:2, exam:false, report:true, light:true, y:1,s:1, slots:['五 15:30'] },

  civ2:{ id:'civ2', name:'民法債編總論', teacher:'chang', subj:'civ', type:'req', credits:3, exam:true, y:1,s:2, slots:['一 08:10','三 10:20'] },
  crim2:{ id:'crim2', name:'刑法分則', teacher:'lin', subj:'crim', type:'req', credits:3, exam:true, y:1,s:2, slots:['二 10:20','四 13:20'] },
  admin1:{ id:'admin1', name:'行政法總論', teacher:'tsai', subj:'const_', type:'req', credits:3, exam:true, y:1,s:2, slots:['三 13:20','五 08:10'] },
  legalEn2:{ id:'legalEn2', name:'法學英文（二）', teacher:'eng', subj:null, type:'elec', credits:2, exam:false, lang:'en', y:1,s:2, slots:['二 15:30'] },
  jp1:{ id:'jp1', name:'日文（一）', teacher:'sato', subj:null, type:'elec', credits:2, exam:false, lang:'ja', y:1,s:2, slots:['四 15:30'] },
  soc:{ id:'soc', name:'法律與社會', teacher:'kuo', subj:null, type:'gen', credits:2, exam:false, report:true, light:true, y:1,s:2, slots:['五 15:30'] },

  civ3:{ id:'civ3', name:'民法物權', teacher:'chang', subj:'civ', type:'req', credits:3, exam:true, y:2,s:1, slots:['一 10:20','三 08:10'] },
  civpro1:{ id:'civpro1', name:'民事訴訟法（一）', teacher:'hsu', subj:'civpro', type:'req', credits:3, exam:true, y:2,s:1, slots:['二 13:20','四 10:20'] },
  crimpro1:{ id:'crimpro1', name:'刑事訴訟法（一）', teacher:'hsu', subj:'crimpro', type:'req', credits:3, exam:true, y:2,s:1, slots:['三 13:20','五 10:20'] },
  corp:{ id:'corp', name:'公司法', teacher:'liu', subj:'com', type:'req', credits:3, exam:false, report:true, y:2,s:1, slots:['一 13:20'] },
  jp2:{ id:'jp2', name:'日文（二）', teacher:'sato', subj:null, type:'elec', credits:2, exam:false, lang:'ja', y:2,s:1, slots:['四 15:30'] },
  anglo:{ id:'anglo', name:'英美法導論', teacher:'eng', subj:null, type:'elec', credits:2, exam:false, lang:'en', report:true, y:2,s:1, slots:['二 15:30'] },
  de1:{ id:'de1', name:'法學德文', teacher:'kuo', subj:null, type:'elec', credits:2, exam:false, lang:'de', y:2,s:1, slots:['五 15:30'] },

  fam:{ id:'fam', name:'民法親屬繼承', teacher:'chen', subj:'civ', type:'req', credits:3, exam:true, y:2,s:2, slots:['一 10:20','三 08:10'] },
  civpro2:{ id:'civpro2', name:'民事訴訟法（二）', teacher:'hsu', subj:'civpro', type:'req', credits:3, exam:true, y:2,s:2, slots:['二 13:20','四 10:20'] },
  crimpro2:{ id:'crimpro2', name:'刑事訴訟法（二）', teacher:'hsu', subj:'crimpro', type:'req', credits:3, exam:true, y:2,s:2, slots:['三 13:20','五 10:20'] },
  nego:{ id:'nego', name:'票據法與保險法', teacher:'liu', subj:'com', type:'req', credits:3, exam:false, report:true, y:2,s:2, slots:['一 13:20'] },
  pil:{ id:'pil', name:'國際私法', teacher:'kuo', subj:null, type:'elec', credits:2, exam:false, report:true, y:2,s:2, slots:['二 15:30'] },
  legalWr:{ id:'legalWr', name:'法律英文寫作', teacher:'eng', subj:null, type:'elec', credits:2, exam:false, lang:'en', y:2,s:2, slots:['五 15:30'] },
  jp3:{ id:'jp3', name:'日文（三）', teacher:'sato', subj:null, type:'elec', credits:2, exam:false, lang:'ja', y:2,s:2, slots:['四 15:30'] },

  admin2:{ id:'admin2', name:'行政訴訟法', teacher:'tsai', subj:'const_', type:'req', credits:3, exam:true, y:3,s:1, slots:['一 10:20','三 08:10'] },
  sec:{ id:'sec', name:'證券交易法', teacher:'liu', subj:'com', type:'req', credits:3, exam:true, y:3,s:1, slots:['二 13:20'] },
  enforce:{ id:'enforce', name:'強制執行法', teacher:'hsu', subj:'civpro', type:'req', credits:2, exam:true, y:3,s:1, slots:['四 10:20'] },
  juris:{ id:'juris', name:'法理學', teacher:'huang', subj:'const_', type:'req', credits:2, exam:false, report:true, y:3,s:1, slots:['五 10:20'] },
  ip:{ id:'ip', name:'智慧財產權法', teacher:'kuo', subj:'com', type:'elec', credits:2, exam:false, report:true, y:3,s:1, slots:['二 15:30'] },
  labor:{ id:'labor', name:'勞動法', teacher:'tsai', subj:'const_', type:'elec', credits:2, exam:false, report:true, y:3,s:1, slots:['五 15:30'] },

  civ4:{ id:'civ4', name:'民法債編各論', teacher:'chang', subj:'civ', type:'req', credits:3, exam:true, y:3,s:2, slots:['一 10:20','三 08:10'] },
  crimSem:{ id:'crimSem', name:'刑法案例研習', teacher:'lin', subj:'crim', type:'req', credits:2, exam:true, y:3,s:2, slots:['二 13:20'] },
  civproSem:{ id:'civproSem', name:'民事訴訟法專題', teacher:'hsu', subj:'civpro', type:'req', credits:2, exam:true, y:3,s:2, slots:['四 10:20'] },
  comSem:{ id:'comSem', name:'商事法專題', teacher:'liu', subj:'com', type:'req', credits:2, exam:false, report:true, y:3,s:2, slots:['五 10:20'] },
  tax:{ id:'tax', name:'稅法', teacher:'tsai', subj:'const_', type:'elec', credits:2, exam:false, report:true, y:3,s:2, slots:['二 15:30'] },
  intl:{ id:'intl', name:'國際法', teacher:'kuo', subj:null, type:'elec', credits:2, exam:false, report:true, y:3,s:2, slots:['五 15:30'] },

  moot:{ id:'moot', name:'法律實務（模擬法庭）', teacher:'hsu', subj:'civpro', type:'req', credits:3, exam:false, report:true, y:4,s:1, slots:['二 13:20','四 13:20'] },
  crimproSem:{ id:'crimproSem', name:'刑事訴訟法專題', teacher:'hsu', subj:'crimpro', type:'req', credits:2, exam:true, y:4,s:1, slots:['三 10:20'] },
  adminSem:{ id:'adminSem', name:'行政法專題', teacher:'tsai', subj:'const_', type:'req', credits:2, exam:true, y:4,s:1, slots:['一 10:20'] },
  famLaw:{ id:'famLaw', name:'家事法', teacher:'chen', subj:'civ', type:'elec', credits:2, exam:false, report:true, y:4,s:1, slots:['五 10:20'] },
  comp:{ id:'comp', name:'公平交易法', teacher:'liu', subj:'com', type:'elec', credits:2, exam:false, report:true, y:4,s:1, slots:['二 15:30'] },

  thesis:{ id:'thesis', name:'畢業專題', teacher:'huang', subj:null, type:'req', credits:2, exam:false, report:true, y:4,s:2, slots:['三 13:20'] },
  civSem2:{ id:'civSem2', name:'民法案例研習', teacher:'chang', subj:'civ', type:'req', credits:2, exam:true, y:4,s:2, slots:['一 10:20'] },
  crimSem2:{ id:'crimSem2', name:'刑事法綜合', teacher:'lin', subj:'crim', type:'req', credits:2, exam:true, y:4,s:2, slots:['二 13:20'] },
  conSem2:{ id:'conSem2', name:'憲法與行政法綜合', teacher:'huang', subj:'const_', type:'req', credits:2, exam:true, y:4,s:2, slots:['四 10:20'] },
  medi:{ id:'medi', name:'調解與談判', teacher:'kuo', subj:null, type:'elec', credits:2, exam:false, report:true, y:4,s:2, slots:['五 15:30'] },
};
function coursesFor(y,s){ return Object.values(COURSES).filter(c=>c.y===y&&c.s===s); }

// 學習活動（大學）
const ACTS = {
  preview:{ id:'preview', name:'預習', cat:'學習', course:true, scene:'dorm', pose:'read', desc:'先看過下週進度，上課吸收更多', energy:-5, stress:1 },
  read:{ id:'read', name:'讀教科書', cat:'學習', course:true, scene:'library', pose:'read', desc:'建立概念理解與體系', energy:-7, stress:3 },
  notes:{ id:'notes', name:'整理筆記', cat:'學習', course:true, scene:'dorm', pose:'type', desc:'建立結構與記憶；要先讀得懂', energy:-7, stress:2 },
  cases:{ id:'cases', name:'練習案例', cat:'學習', course:true, scene:'library', pose:'read', desc:'訓練爭點辨識與涵攝', energy:-7, stress:4 },
  timed:{ id:'timed', name:'限時練題', cat:'學習', course:true, scene:'dorm', pose:'type', desc:'改善答案結構與寫作速度', energy:-8, stress:5 },
  review:{ id:'review', name:'複習與回想', cat:'學習', course:true, scene:'library', pose:'read', desc:'把「看過」變成「提取得出來」', energy:-6, stress:1 },
  research:{ id:'research', name:'查判決與文章', cat:'學習', course:true, scene:'library', pose:'type', desc:'研究能力上升，但很花時間', energy:-7, stress:2 },
  speak:{ id:'speak', name:'課堂發言', cat:'學習', course:true, scene:'classroom', pose:'stand', desc:'讓老師知道你在，也練表達', energy:-3, stress:4 },
  borrow:{ id:'borrow', name:'借筆記', cat:'學習', course:true, scene:'campus', pose:'stand', desc:'省時間，但還是得自己讀懂', energy:-3, stress:0, need:'rel' },
  group:{ id:'group', name:'讀書會', cat:'學習', course:false, scene:'library', pose:'read', desc:'交換見解，也可能聊兩小時', energy:-6, stress:1 },
  rest:{ id:'rest', name:'什麼都不做', cat:'生活', course:false, scene:'dorm', pose:'sleep', desc:'恢復精力與後續效率', energy:18, stress:-10 },
  sport:{ id:'sport', name:'運動', cat:'生活', course:false, scene:'park', pose:'walk', desc:'精力與心情', energy:6, stress:-7 },
  game:{ id:'game', name:'打電動、追劇', cat:'生活', course:false, scene:'dorm', pose:'sit', desc:'放空', energy:4, stress:-8 },
  home:{ id:'home', name:'回家一趟', cat:'生活', course:false, scene:'home', pose:'sit', desc:'家人、家常菜，還有親戚', energy:8, stress:-6, money:1500 },
  eat:{ id:'eat', name:'和朋友吃飯', cat:'人際', course:false, scene:'street', pose:'stand', desc:'維持關係，聽別人的人生', energy:-2, stress:-5, money:-350 },
  supper:{ id:'supper', name:'宵夜', cat:'人際', course:false, scene:'street', pose:'stand', desc:'讀完（或沒讀完）一起去吃', energy:-2, stress:-4, money:-150 },
  club:{ id:'club', name:'社團', cat:'人際', course:false, scene:'campus', pose:'stand', desc:'認識法律系以外的人', energy:-5, stress:-3 },
  date:{ id:'date', name:'約會', cat:'人際', course:false, scene:'street', pose:'stand', desc:'兩個人的時間', energy:-2, stress:-8, money:-600, need:'partner' },
  work:{ id:'work', name:'打工（便利商店）', cat:'金錢', course:false, scene:'store', pose:'stand', desc:'穩定但站很久', energy:-12, stress:3, money:3600 },
  tutor:{ id:'tutor', name:'家教', cat:'金錢', course:false, scene:'home', pose:'sit', desc:'時薪高，教高中生公民', energy:-7, stress:2, money:3200, need:'year2' },
  lang:{ id:'lang', name:'自學外語', cat:'學習', course:false, scene:'dorm', pose:'read', desc:'準備語言檢定或交換', energy:-6, stress:2 },
  apply:{ id:'apply', name:'準備交換申請', cat:'學習', course:false, scene:'dorm', pose:'type', desc:'讀書計畫、推薦信、志願排序', energy:-6, stress:3, need:'applyWindow' },
  intern:{ id:'intern', name:'事務所實習', cat:'金錢', course:false, scene:'firm', pose:'type', desc:'影印、查資料、看律師怎麼工作', energy:-10, stress:4, money:2400, need:'year3' },
  courtIntern:{ id:'courtIntern', name:'法院見習', cat:'學習', course:false, scene:'court', pose:'stand', desc:'坐在旁聽席看程序怎麼跑', energy:-8, stress:2, need:'year3' },
  barprep:{ id:'barprep', name:'國考總複習', cat:'學習', course:false, scene:'library', pose:'read', desc:'把大學四年的東西重新串起來', energy:-9, stress:4, need:'year4' },
};
const ACT_ORDER = ['read','notes','cases','timed','review','preview','research','speak','borrow','group','lang','apply','barprep','courtIntern','rest','sport','game','home','eat','supper','club','date','work','tutor','intern'];

// 活動中的小事件（純生活感，有些有小效果）
const FLAVOR = {
  read:[
    {t:'原定今天讀一百頁，最後花兩小時研究第七頁的註腳。', fx:{u:-2,research:1}, p:.14},
    {t:'到圖書館才發現常坐的位置被占走了，換到靠窗那排，其實也不錯。', p:.15},
    {t:'隔壁桌的人翻書速度快到你懷疑他其實在找東西。', p:.1},
    {t:'讀到一半，同學傳訊息：「你看到哪了？」你回：「第三章。」他回：「喔，我才第二章。」大家都安心了一點。', p:.15, rel:{an:1}},
    {t:'教科書買回來三個月，書籤還停在三分之一的地方。今天終於往後翻了一點。', p:.08},
    {t:'空調太冷，你用外套把自己包起來繼續讀。', p:.1},
  ],
  notes:[
    {t:'整理筆記時發現上禮拜寫的字自己看不懂。', p:.15},
    {t:'你在老師說「這個很基本」的那段旁邊畫了一顆星星。', p:.15, fx:{s:1}},
    {t:'筆記整理到一半，開始排版比整理內容還花時間。', p:.12},
    {t:'系上群組突然出現一份不知道流傳幾屆的筆記，字很小，但架構意外清楚。', p:.1, fx:{s:2}},
  ],
  cases:[
    {t:'讀完案例，覺得每一句話都有問題，又覺得每一句話都沒有問題。', p:.15},
    {t:'練了一題，翻答案：「這個我明明看過。」', p:.18, flagHint:'retrieval'},
    {t:'案例裡的人名是甲乙丙丁，你花了三分鐘搞清楚誰是誰。', p:.12},
  ],
  timed:[
    {t:'計時器響的時候，你正在寫第二個爭點的第一句。', p:.15},
    {t:'寫完才發現前面兩段在講同一件事。', p:.12},
    {t:'這次比上次多寫了半頁。你把答案卷拍照傳給同學，沒人回。', p:.1},
  ],
  review:[
    {t:'複習時發現，上週覺得很難的地方，這週看起來只是有點難。', p:.15},
    {t:'蓋住答案回想，第一次沒想起來，第二次想起來一半。', p:.15},
  ],
  research:[
    {t:'查到一篇很有趣的文章，跟考試完全無關，你還是讀完了。', p:.2, fx:{research:1}},
    {t:'判決系統跳出「查無資料」，你換了三個關鍵字。', p:.15},
  ],
  group:[
    {t:'讀書會開場：「你讀完了嗎？」「沒有。」「我也是。」「那要不要先吃飯？」「好。」', p:.35, half:true},
    {t:'讀書會今天很有效率，大家把爭點列出來對了一輪，發現每個人抓的重點都不一樣。', p:.3},
    {t:'討論到一半，話題變成哪家宵夜比較好吃，一小時後才拉回來。', p:.2, half:true},
  ],
  work:[
    {t:'凌晨兩點的便利商店，你替一個穿西裝的人結帳，他買了一罐啤酒和一個御飯糰。', p:.2},
    {t:'排班表出來，你的班和明天的早八只隔六小時。', p:.15, fx:{energy:-4}},
    {t:'店長說你補貨很快，問你要不要多排一天。你說再看看。', p:.12},
  ],
  rest:[
    {t:'你回到宿舍，把包放下，泡了一碗麵，坐在床邊看了一集劇。什麼事都沒發生。', p:.35},
    {t:'睡到自然醒，發現已經下午一點。你決定不要有罪惡感。', p:.3},
    {t:'你躺在床上滑手機，看到有人 PO 圖書館的座位照片。你把手機放下，繼續躺。', p:.2},
  ],
  sport:[
    {t:'操場跑了三圈，第四圈用走的。回宿舍路上買了一杯無糖綠。', p:.3},
    {t:'河濱的風很大，你跑得比平常慢，但心情比平常好。', p:.3},
  ],
  game:[
    {t:'本來說只打一場，最後打了四場。', p:.35},
    {t:'追劇追到主角開始講法律，你忍不住開始挑錯。', p:.25},
  ],
  eat:[
    {t:'午餐時大家開始討論完全不是法律的事情，你發現這樣的午餐比較好吃。', p:.3},
    {t:'吃飯時有人問「你們期中怎麼準備」，桌上突然安靜了三秒。', p:.25},
  ],
  supper:[
    {t:'鹹酥雞排隊二十分鐘。等的時候你們把民總的爭點講了一遍，講完發現忘記點九層塔。', p:.3},
    {t:'凌晨的宵夜攤，每個人都說「這是最後一次熬夜」。', p:.3},
  ],
  club:[
    {t:'社課結束後留下來聊天，發現外系的人聽到「法律系」會先問「那你以後是律師嗎？」', p:.3},
    {t:'社團要辦活動，你負責寫場地借用申請。你發現自己開始在意用語精確。', p:.2},
  ],
  home:[
    {t:'媽媽問你「法律系是不是很多東西要背」，你說「還好」，然後吃了三碗飯。', p:.3},
    {t:'親戚聽說你讀法律，立刻拿出一份土地資料。你說你才大一，他說「沒關係你先看一下」。', p:.25, flag:'uncle_land'},
    {t:'回家的火車上你睡著了，醒來已經到站。這是這幾週睡得最好的一次。', p:.2, fx:{energy:3}},
  ],
  campus:[
    {t:'早八上課前，你在便利商店買了一杯咖啡，跟三個同樣在排隊的同學點了頭。', p:1},
    {t:'教室裡冷氣很強，前排的人都穿外套，後排的人都在睡。', p:1},
    {t:'老師講了一句「這個很基本」，全班同時在筆記旁邊畫星號。', p:1},
    {t:'下課時有人問老師問題，你在旁邊偷聽，聽到一半就走了。', p:1},
    {t:'上課覺得都懂，回家打開題目，突然不知道從哪裡開始。', p:1},
  ],
};

// 考試用案例庫：每題 core 最核心；sec 次要；tan 相關但不是重點；irr 無關
const CASES = {
  civ1_mid:{ title:'網拍標價', text:'小美在網拍平台看到一台標價 1,000 元的相機，立刻下單並付款。賣家隔天表示標價打錯，原價應為 10,000 元，拒絕出貨。小美主張契約已成立，要求賣家依 1,000 元交付相機。',
    opts:[
      {k:'core', t:'網頁標價是要約還是要約之引誘，買賣契約是否已經成立', why:'先確定契約有沒有成立，後面的撤銷才有討論的對象。這是這題的起點。'},
      {k:'sec', t:'賣家得否主張意思表示錯誤而撤銷', why:'很重要，但它是第二步：契約成立後，賣家才需要用撤銷來擺脫拘束。'},
      {k:'tan', t:'相機是否有物之瑕疵', why:'題目完全沒有提到相機本身有問題。'},
      {k:'irr', t:'小美有無消費者保護法上的解除權', why:'這題問的是契約成立與錯誤，不是解除。'},
    ]},
  civ1_fin:{ title:'十七歲買機車', text:'阿明十七歲，用打工存的錢向車行購買一台三萬元的中古機車，並已交付價金、取得機車。阿明的父母一週後得知此事，表示反對。車行主張契約有效，阿明父母主張契約無效。',
    opts:[
      {k:'core', t:'限制行為能力人未得法定代理人允許所為的契約，其效力如何', why:'整題的核心就是「效力未定」的結構：需要法定代理人承認，父母可以拒絕承認。'},
      {k:'sec', t:'車行可否催告法定代理人確答，或撤回其意思表示', why:'這是效力未定狀態下相對人的保護手段，是接著要處理的問題。'},
      {k:'tan', t:'父母主張「無效」在用語上是否精確', why:'可以在結論帶到，但不是分析的主軸。'},
      {k:'irr', t:'機車作為動產，所有權何時移轉', why:'題目沒有問物權變動。'},
    ]},
  crim1_mid:{ title:'反彈的子彈', text:'甲為了嚇唬乙，朝乙腳邊的地面開了一槍，子彈擊中地面後反彈，打中乙的小腿，乙受傷。甲事後表示他只是想嚇乙，沒有想傷害乙。',
    opts:[
      {k:'core', t:'甲對於傷害結果的主觀認知：故意（含未必故意）或過失，以及行為與結果的因果關係', why:'案例派老師最想看的就是這一組：客觀上有因果關係與客觀歸責，主觀上是故意還是過失。'},
      {k:'sec', t:'甲以開槍方式嚇唬乙，是否另成立恐嚇危害安全罪', why:'會成立，也應該寫，但這題的重心在傷害結果的歸責。'},
      {k:'tan', t:'甲是否可主張正當防衛', why:'題目沒有任何乙先攻擊的事實，這是想太多。'},
      {k:'irr', t:'乙可否請求民事損害賠償', why:'這是刑法期中考。'},
    ]},
  crim1_fin:{ title:'夜歸的反擊', text:'甲深夜返家途中，遭乙持刀搶劫。甲奪下乙的刀後，乙轉身逃跑，甲追上前從背後刺了乙一刀，乙受重傷。',
    opts:[
      {k:'core', t:'乙已轉身逃跑，侵害是否仍在進行中，甲的行為能否成立正當防衛或屬於防衛過當', why:'關鍵在「現在」：侵害結束後的反擊不是防衛，最多討論誤想防衛或量刑。'},
      {k:'sec', t:'甲從背後刺乙，是否具有傷害或殺人故意', why:'需要討論，但要先確定違法性層次的問題怎麼處理。'},
      {k:'tan', t:'乙的強盜行為是既遂還是未遂', why:'乙的罪責可以帶到，但題目問的是甲。'},
      {k:'irr', t:'甲對乙的民事侵權責任', why:'不是這科的問題。'},
    ]},
  cons1_mid:{ title:'公園的擴音器', text:'某市政府訂定自治規則，規定夜間十點後禁止在公園內使用擴音設備，違者處罰鍰。街頭藝人小華主張此規定侵害其表現自由。',
    opts:[
      {k:'core', t:'該規定限制表現自由，能否通過比例原則的審查（目的、適當、必要、衡平）', why:'基本權案例的主軸：先確認保障範圍與限制，再做比例原則審查。'},
      {k:'sec', t:'以自治規則對人民科處罰鍰，是否符合法律保留原則', why:'這是很好的第二個爭點，處罰需要法律或明確授權的依據。'},
      {k:'tan', t:'街頭藝人的表演是否受職業自由保障', why:'可以提，但題目已經把問題定在表現自由。'},
      {k:'irr', t:'公園是否屬於公物', why:'跟這題要問的權利限制無關。'},
    ]},
  cons1_fin:{ title:'沒有上限的罰鍰', text:'立法院通過某法律，規定「違反本法者，處罰鍰，其額度由主管機關定之」，未設任何上限或標準。主管機關據此訂定辦法，對違規者處以高額罰鍰。',
    opts:[
      {k:'core', t:'法律授權行政機關訂定處罰內容，是否符合授權明確性原則與法律保留', why:'處罰的要件與法律效果應由法律或依法律明確授權的命令定之，這題就是在考這件事。'},
      {k:'sec', t:'高額罰鍰是否違反比例原則', why:'次要爭點，可以在確認授權有問題後接著討論。'},
      {k:'tan', t:'罰鍰是否侵害財產權', why:'當然侵害財產權，但問題不在「有沒有侵害」，而在「依據夠不夠」。'},
      {k:'irr', t:'該法律的立法程序是否有瑕疵', why:'題目沒有給任何程序事實。'},
    ]},
  // 通用題庫（後續學期依科目群使用）
  civ_a:{ title:'借名登記的房子', text:'甲出資購屋，登記在乙名下。多年後乙將房屋出售給不知情的丙並完成移轉登記。甲主張房屋是他的，要求丙返還。',
    opts:[
      {k:'core', t:'借名登記契約的效力，以及乙處分房屋對丙是否有效', why:'先定性借名登記，再處理無權處分與善意第三人保護。'},
      {k:'sec', t:'甲對乙可主張的債務不履行或不當得利', why:'甲對乙的內部關係是第二層問題。'},
      {k:'tan', t:'丙是否應查證房屋的真正所有人', why:'登記制度下丙原則上可信賴登記。'},
      {k:'irr', t:'房屋稅由誰負擔', why:'題目沒問。'},
    ]},
  civ_b:{ title:'送錯的包裹', text:'甲向網路商店購買一台筆電，商店誤寄了兩台。甲將多出的那台轉賣給乙。商店發現後向甲請求返還。',
    opts:[
      {k:'core', t:'甲受領多出的筆電，是否成立不當得利，以及已經轉賣時的返還範圍', why:'核心在不當得利的成立與返還客體轉為價額。'},
      {k:'sec', t:'甲轉賣給乙是否構成無權處分，乙能否取得所有權', why:'接續問題：善意受讓。'},
      {k:'tan', t:'商店是否有過失', why:'不影響不當得利的成立。'},
      {k:'irr', t:'運送人的責任', why:'題目不問運送契約。'},
    ]},
  crim_a:{ title:'偷拿又放回', text:'甲在超商拿了一包菸放進口袋，走到門口時覺得不對，又走回去把菸放回架上。店員全程從監視器看到。',
    opts:[
      {k:'core', t:'甲將菸放入口袋時竊盜是否已既遂，放回是否影響犯罪成立', why:'既遂時點的判斷是本題核心，放回只是犯後態度。'},
      {k:'sec', t:'是否可討論中止犯', why:'若認為已既遂則無中止犯適用；這是隨核心答案而定的次要問題。'},
      {k:'tan', t:'店員未當場制止是否影響', why:'不影響。'},
      {k:'irr', t:'超商可否請求民事賠償', why:'不是刑法問題。'},
    ]},
  crim_b:{ title:'幫忙開車', text:'甲請乙開車載他去「拿東西」，乙不知甲其實是去偷竊，在車上等甲。甲得手後上車，乙才知道。乙仍開車離開。',
    opts:[
      {k:'core', t:'乙開車載甲時是否具有幫助故意，事後知情仍載離是否成立幫助犯或其他罪', why:'關鍵在故意的時點：事前不知，事後知情的行為如何評價。'},
      {k:'sec', t:'乙載離甲是否可能成立藏匿人犯或贓物相關罪名', why:'可接著討論的方向。'},
      {k:'tan', t:'甲的竊盜是否既遂', why:'題目問的是乙。'},
      {k:'irr', t:'乙的駕照是否有效', why:'無關。'},
    ]},
  const_a:{ title:'市場攤位的許可', text:'市場管理機關以「攤位不足」為由，拒絕發給申請人攤位使用許可，卻未說明審查標準。申請人不服。',
    opts:[
      {k:'core', t:'該拒絕決定是否為行政處分，其理由是否充分，申請人可循何種救濟途徑', why:'行政法題型的骨架：處分性質、程序要求、救濟途徑。'},
      {k:'sec', t:'機關對攤位分配是否享有裁量，以及裁量是否濫用', why:'裁量問題是接著要處理的核心之一。'},
      {k:'tan', t:'申請人是否有營業自由', why:'可帶到，但這題重點在行政程序與救濟。'},
      {k:'irr', t:'市場是否應民營化', why:'政策問題。'},
    ]},
  const_b:{ title:'畢業典禮的口罩', text:'某公立學校規定學生於典禮期間不得佩戴表達政治立場的口罩。學生小林佩戴印有標語的口罩，遭校方要求離場。',
    opts:[
      {k:'core', t:'校方規定限制學生的表現自由，是否有法律依據並符合比例原則', why:'基本權限制的標準流程。'},
      {k:'sec', t:'學生與學校的關係，學生對校方措施可否尋求救濟', why:'涉及特別權力關係的演變，是次要但重要的爭點。'},
      {k:'tan', t:'典禮秩序是否屬於公益', why:'目的正當性的一環，不必獨立成節。'},
      {k:'irr', t:'口罩是否符合防疫規定', why:'無關。'},
    ]},
  civpro_a:{ title:'不出庭的被告', text:'原告起訴請求返還借款，被告經合法送達卻未於言詞辯論期日到場，也未提出書狀。',
    opts:[
      {k:'core', t:'法院得否依原告聲請為一造辯論判決，其要件為何', why:'這題就是在考一造辯論判決的要件。'},
      {k:'sec', t:'被告未爭執的事實是否視同自認', why:'與一造辯論的效果有關，是次要爭點。'},
      {k:'tan', t:'送達是否合法', why:'題目已說合法送達。'},
      {k:'irr', t:'借款契約是否成立', why:'這是實體問題，不是本題重點。'},
    ]},
  civpro_b:{ title:'兩件差不多的案子', text:'甲對乙起訴請求給付貨款。訴訟中甲又以同一筆貨款對乙提起另一訴訟，請求損害賠償。',
    opts:[
      {k:'core', t:'兩訴是否為同一事件，後訴是否違反重複起訴禁止', why:'訴訟標的與當事人是否同一是核心判斷。'},
      {k:'sec', t:'若非同一事件，法院可否合併審理', why:'次要。'},
      {k:'tan', t:'貨款請求權與損害賠償請求權的實體關係', why:'實體問題。'},
      {k:'irr', t:'訴訟費用如何計算', why:'不是本題重點。'},
    ]},
  crimpro_a:{ title:'半夜的搜索', text:'警察接獲線報，未持搜索票即進入甲的住處搜索，查獲毒品。甲主張證據不得使用。',
    opts:[
      {k:'core', t:'無令狀搜索是否合法，違法取得的證據有無證據能力', why:'令狀原則的例外與證據排除的權衡是本題核心。'},
      {k:'sec', t:'甲是否可以聲請調查或請求排除', why:'程序上的主張方式。'},
      {k:'tan', t:'線報是否可靠', why:'與緊急搜索要件有關但非主軸。'},
      {k:'irr', t:'毒品的種類', why:'實體問題。'},
    ]},
  crimpro_b:{ title:'翻供的證人', text:'證人在警詢時指認甲，於審判中卻改稱記不清楚。檢察官主張以警詢筆錄為證據。',
    opts:[
      {k:'core', t:'審判外陳述的證據能力：傳聞法則與其例外的適用', why:'先前陳述與審判中陳述不符時的處理，是刑訴的經典爭點。'},
      {k:'sec', t:'警詢筆錄是否具有可信之特別情況', why:'例外要件之一。'},
      {k:'tan', t:'證人是否構成偽證', why:'非本題重點。'},
      {k:'irr', t:'甲的量刑', why:'無關。'},
    ]},
  com_a:{ title:'董事的好朋友', text:'A 公司董事甲，以公司名義向其好友經營的 B 公司採購設備，價格明顯高於市價。',
    opts:[
      {k:'core', t:'甲是否違反忠實義務，該交易是否構成自我交易或利益衝突', why:'董事的忠實義務與利益衝突處理是核心。'},
      {k:'sec', t:'公司可否對甲請求損害賠償，由誰決定', why:'責任追究的程序問題。'},
      {k:'tan', t:'設備品質是否合格', why:'非重點。'},
      {k:'irr', t:'B 公司是否應繳稅', why:'無關。'},
    ]},
  com_b:{ title:'沒開股東會', text:'某公司連續兩年未召開股東常會，董事會仍決議分派盈餘。股東乙提出異議。',
    opts:[
      {k:'core', t:'盈餘分派的決定權限歸屬與未經股東會之決議效力', why:'公司機關權限劃分是本題核心。'},
      {k:'sec', t:'股東乙可主張的救濟', why:'程序上的問題。'},
      {k:'tan', t:'公司是否有盈餘可分派', why:'題目未爭執。'},
      {k:'irr', t:'董事的薪酬', why:'無關。'},
    ]},
};
const SUBJ_CASE = { civ:['civ_a','civ_b'], crim:['crim_a','crim_b'], const_:['const_a','const_b'], civpro:['civpro_a','civpro_b'], crimpro:['crimpro_a','crimpro_b'], com:['com_a','com_b'] };

// 民總小考（大一上第一次小考）
const QUIZ_CIV1 = [
  { q:'六歲的小朋友拿零用錢在便利商店買了一支冰。這個孩子在民法上屬於？', opts:['無行為能力人','限制行為能力人','完全行為能力人'], a:0, why:'未滿七歲為無行為能力人；買冰在生活上當然沒問題，但法律上是由法定代理人代為意思表示的結構（這也是教科書上常拿來討論的例子）。' },
  { q:'甲在賣場拿起商品走到櫃檯，店員刷條碼。在這個過程中，「要約」比較接近哪一個動作？', opts:['商品陳列標價','甲拿商品到櫃檯','店員刷條碼'], a:1, why:'通說認為陳列標價是要約引誘，顧客拿到櫃檯是要約，店員刷條碼是承諾。' },
  { q:'「意思表示錯誤」得撤銷的前提之一，是表意人對於錯誤的發生？', opts:['有故意','無過失','有重大過失'], a:1, why:'表意人須無過失才能撤銷，這是民法總則第一次考試最常出現的條件之一。' },
];

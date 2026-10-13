/* ===== 八學期課程與課表（D52，2026-10-13）=====
   來源：劇情企劃 AA 的 AA_103「四年八學期課程與課表」、AA_104「課表與日曆系統：實作規格」（劇情企劃分支 claude/bb-story-planning，commit 42d1337）。
   使用者 2026-10-13：課表直接交給 LAWWW 實作，不用再等使用者批准；AA 負責把課表想完整，LAWWW 負責做進遊戲（AA 與 LAWWW 自行協調修正）。
   這份是 LAWWW 照 AA_103 第 4 節（八份每週課表）、第 5 節（進度架構、特殊事件的週次）、第 2 節（教授）轉成的遊戲資料；改課表照 AA 的文件改這裡。
   - 時段（AA_103 第 1 節）：上午 09:10–12:10、下午一 13:20–15:10、下午二 15:30–17:20；晚上沒有法律系的課。
   - 星期：wd 1＝週一 … 5＝週五（同 src/data/calendar.js）。
   - 地點：room 對到下面的 rooms。AA_103 只寫「霖澤館」（沒有教室號碼）的課先在 201（AA_103 第 1 節：其他教室沿用同一個教室、換黑板與座位，開發組評估）；
     萬才館研討室、共同課程教室、體育館、校外是「門口上課」（走到那棟建築的門口，課堂用 2D 畫面；之後有 3D 教室再換）。
   - 進度（topics）：AA_103 第 5 節「普通課堂內容（進度架構）」；每一週講哪一個由程式照順序分配（第 8～9、17～18 週考試）。法律內容全部需要法律審查（AA_103）；
     黑板與台詞不寫案號（AA_103 第 5 節「遊戲對話不講案號」）。每週的黑板三行、教授一句、同學反應由 BB 依本表寫（AA_104 的 syllabus），還沒寫的週用程式的一般句子。
   - 特殊課堂（specials）：AA_103 第 5 節的週次；story:true＝牽涉主要人物劇情（大一上「系統優先、劇情暫緩」，等使用者批准劇情再做）；內容還沒做的週照普通課堂上。
   - 選修（choice）：同一組二選一（AA_104 第 1 節）；沒選照 default。 */
const COURSES={
  version:1,
  blocks:{ am:{t0:9+10/60,t1:12+10/60,label:'上午'}, pm1:{t0:13+20/60,t1:15+10/60,label:'下午一'}, pm2:{t0:15.5,t1:17+20/60,label:'下午二'} },
  rooms:{
    L201:{name:'霖澤館 201',zone:'classroom'},
    LINZE:{name:'霖澤館 201',zone:'classroom'},
    WSEM:{name:'萬才館研討室',door:'wancai_seminar'},
    COMMON:{name:'共同課程教室',door:'common'},
    GYM:{name:'體育館',door:'gym'},
    OFF:{name:'校外（事務所或法扶）',offsite:true}
  },
  profs:{ prof_zhou:'周啟明', prof_zhang:'張維德', prof_wu:'吳承翰', prof_huang:'黃素芬', prof_xu:'許志遠', prof_tsai:'蔡佩君', prof_lin:'林昭儀', prof_chen:'陳律言',
          prof_zheng:'鄭婉如', prof_ye:'葉明哲', prof_he:'何安平', prof_jian:'簡如萍' },
  list:[
    // ---- 大一上（2025 秋）----
    {id:'con_law1',name:'憲法',kind:'required',term:'Y1S1',prof:'prof_zhang',room:'L201',slots:[{wd:1,block:'am'}],
     topics:['憲法的基本概念','基本權','比例原則','權力分立'],specials:[{w:4,title:'點名的小插曲'},{w:11,title:'法院能不能命令道歉'}]},
    {id:'pe1',name:'體育',kind:'general',term:'Y1S1',prof:null,room:'GYM',slots:[{wd:1,block:'pm2'}],topics:['體適能','球類','游泳']},
    {id:'chinese1',name:'大一國文',kind:'general',term:'Y1S1',prof:null,room:'COMMON',slots:[{wd:2,block:'am'}],topics:['現代散文','古典詩文','寫作練習']},
    {id:'gened1',name:'通識',kind:'general',term:'Y1S1',prof:null,room:'COMMON',slots:[{wd:2,block:'pm1'}],topics:['課程導論','分組討論','期末報告準備'],specials:[{w:6,title:'分組報告（芷若同組）',story:true}]},
    {id:'crim_gen1',name:'刑法總則（一）',kind:'required',term:'Y1S1',prof:'prof_wu',room:'L201',slots:[{wd:3,block:'am'}],
     topics:['刑法的基本原則：罪刑法定','構成要件','故意與過失'],specials:[{w:5,title:'吳教授「一個概念講兩週」'}]},
    {id:'english1',name:'大一英文',kind:'general',term:'Y1S1',prof:null,room:'COMMON',slots:[{wd:4,block:'am'}],topics:['閱讀','聽力','口頭報告']},
    {id:'civ_general',name:'民法總則',kind:'required',term:'Y1S1',prof:'prof_zhou',room:'L201',slots:[{wd:4,block:'pm1'}],
     topics:['民法的結構','權利主體：權利能力','權利主體：行為能力','物','法律行為','意思表示','代理','時效'],
     specials:[{w:3,title:'網拍相機',story:true,storyDay2:true},{w:11,title:'公序良俗'},{w:14,title:'周教授的正反辯論',story:true}]},
    {id:'law_society',name:'法律與社會',kind:'elective',term:'Y1S1',prof:'prof_huang',room:'LINZE',slots:[{wd:5,block:'pm1'}],topics:['法律與電影','法律與新聞','法律與社會'],
     choice:{group:'Y1S1_ls',default:'law_society',none:true}},
    // ---- 大一下（2026 春）----
    {id:'con_law2',name:'憲法（續）',kind:'required',term:'Y1S2',prof:'prof_zhang',room:'L201',slots:[{wd:1,block:'am'}],topics:['基本權（續）','權力分立（續）','憲法訴訟入門']},
    {id:'gened2',name:'通識',kind:'general',term:'Y1S2',prof:null,room:'COMMON',slots:[{wd:1,block:'pm1'}],topics:['課程導論','分組討論','期末報告準備']},
    {id:'pe2',name:'體育',kind:'general',term:'Y1S2',prof:null,room:'GYM',slots:[{wd:1,block:'pm2'}],topics:['羽球','排球','體適能檢測']},
    {id:'chinese2',name:'大一國文',kind:'general',term:'Y1S2',prof:null,room:'COMMON',slots:[{wd:2,block:'am'}],topics:['小說選讀','論說文','期末作品']},
    {id:'law_society2',name:'法律與社會',kind:'elective',term:'Y1S2',prof:'prof_huang',room:'LINZE',slots:[{wd:2,block:'pm1'}],topics:['法律與電影','法律與新聞','法律與社會'],choice:{group:'Y1S2_elec',default:'law_society2'}},
    {id:'econ',name:'經濟學原理',kind:'elective',term:'Y1S2',prof:null,room:'COMMON',slots:[{wd:2,block:'pm1'}],topics:['供給與需求','市場與價格','外部性'],choice:{group:'Y1S2_elec',default:'law_society2'}},
    {id:'crim_gen2',name:'刑法總則（二）',kind:'required',term:'Y1S2',prof:'prof_wu',room:'L201',slots:[{wd:3,block:'am'}],topics:['違法性：正當防衛','罪責','未遂','共犯'],specials:[{w:7,title:'為了保護朋友而動手'}]},
    {id:'english2',name:'大一英文',kind:'general',term:'Y1S2',prof:null,room:'COMMON',slots:[{wd:4,block:'am'}],topics:['閱讀','寫作','口頭報告']},
    {id:'civ_obl1',name:'民法債編總論（一）',kind:'required',term:'Y1S2',prof:'prof_zhou',room:'L201',slots:[{wd:4,block:'pm1'}],topics:['債的發生：契約成立（要約與承諾）','無因管理','不當得利概論'],specials:[{w:4,title:'網拍相機的回聲'}]},
    // ---- 大二上（2026 秋）----
    {id:'admin_law',name:'行政法',kind:'required',term:'Y2S1',prof:'prof_xu',room:'L201',slots:[{wd:1,block:'am'}],topics:['行政行為','行政處分','行政契約','依法行政'],specials:[{w:11,title:'國家賠償'}]},
    {id:'pe3',name:'體育',kind:'general',term:'Y2S1',prof:null,room:'GYM',slots:[{wd:1,block:'pm2'}],topics:['桌球','籃球','體適能']},
    {id:'crim_spec',name:'刑法分則',kind:'required',term:'Y2S1',prof:'prof_wu',room:'L201',slots:[{wd:2,block:'am'}],topics:['生命法益','身體法益','自由法益','財產法益','侵占與背信的差別'],specials:[{w:12,title:'幫社團管錢，侵占還是背信'}]},
    {id:'civ_property',name:'民法物權',kind:'required',term:'Y2S1',prof:'prof_zheng',room:'L201',slots:[{wd:2,block:'pm1'}],topics:['物權概念','所有權','占有','登記','共有','用益物權'],specials:[{w:12,title:'買了房子，卻沒有房子下面那塊地'}]},
    {id:'jurisprudence',name:'法理學',kind:'required',term:'Y2S1',prof:'prof_huang',room:'LINZE',slots:[{wd:3,block:'pm1'}],topics:['法律是什麼','法律與道德','法律解釋'],specials:[{w:6,title:'課堂討論'}]},
    {id:'civ_obl2',name:'民法債編總論（二）',kind:'required',term:'Y2S1',prof:'prof_zhou',room:'L201',slots:[{wd:4,block:'am'}],topics:['債務不履行','債的效力','多數債務人','時效']},
    {id:'gened3',name:'通識',kind:'general',term:'Y2S1',prof:null,room:'COMMON',slots:[{wd:5,block:'am'}],topics:['課程導論','分組討論','期末報告準備']},
    // ---- 大二下（2027 春）----
    {id:'civ_obl_spec',name:'民法債編各論',kind:'required',term:'Y2S2',prof:'prof_ye',room:'L201',slots:[{wd:1,block:'am'}],topics:['買賣','租賃：買賣不破租賃','承攬','委任','消費者保護入門'],specials:[{w:6,title:'直播點數能不能退'},{w:12,title:'租到會被拆的房子'}]},
    {id:'family_law',name:'民法身分法',kind:'required',term:'Y2S2',prof:'prof_zheng',room:'L201',slots:[{wd:2,block:'am'}],topics:['婚姻','親子','繼承','遺囑','特留分'],specials:[{w:13,title:'遺囑能不能排除一個繼承人'}]},
    {id:'gened4',name:'通識',kind:'general',term:'Y2S2',prof:null,room:'COMMON',slots:[{wd:2,block:'pm1'}],topics:['課程導論','分組討論','期末報告準備']},
    {id:'admin_remedy',name:'行政救濟法',kind:'required',term:'Y2S2',prof:'prof_xu',room:'L201',slots:[{wd:3,block:'am'}],topics:['訴願','行政訴訟','國家賠償程序'],specials:[{w:11,title:'申請被政府拒絕，去哪個法院'}]},
    {id:'intl_public',name:'國際公法',kind:'required',term:'Y2S2',prof:'prof_chen',room:'LINZE',slots:[{wd:4,block:'pm1'}],topics:['國際法的法源','國家','條約','國際組織'],specials:[{w:10,title:'課堂報告'}]},
    {id:'legal_history',name:'法律史',kind:'required',term:'Y2S2',prof:'prof_huang',room:'LINZE',slots:[{wd:5,block:'am'}],topics:['傳統中國法','日治時期的法制','台灣法的變遷']},
    // ---- 大三上（2027 秋）----
    {id:'civ_proc1',name:'民事訴訟法甲上',kind:'required',term:'Y3S1',prof:'prof_tsai',room:'L201',slots:[{wd:1,block:'am'},{wd:4,block:'am'}],topics:['訴訟標的','當事人','管轄','審判權','起訴'],specials:[{w:11,title:'告政府一定去行政法院嗎'}]},
    {id:'crim_proc',name:'刑事訴訟法',kind:'required',term:'Y3S1',prof:'prof_lin',room:'L201',slots:[{wd:2,block:'am'},{wd:5,block:'am'}],topics:['證據法：證據能力','證據法：傳聞','強制處分','被告與證人的權利'],
     specials:[{w:7,title:'法院旁聽'},{w:11,title:'私人偷錄的證據'},{w:14,title:'被告沒有律師'}]},
    {id:'company_law',name:'商事法總論及公司法',kind:'required',term:'Y3S1',prof:'prof_he',room:'L201',slots:[{wd:3,block:'am'}],topics:['商業組織','公司種類','股東會','董事會','董事的責任'],specials:[{w:12,title:'董事和股東的利益衝突'}]},
    {id:'securities',name:'證券交易法',kind:'elective',term:'Y3S1',prof:'prof_he',room:'LINZE',slots:[{wd:4,block:'pm1'}],topics:['證券市場','資訊公開','內線交易的概念']},
    // ---- 大三下（2028 春；台灣路線）----
    {id:'civ_proc2',name:'民事訴訟法甲下',kind:'required',term:'Y3S2',prof:'prof_tsai',room:'L201',slots:[{wd:1,block:'am'}],topics:['證據調查','舉證責任','判決','上訴'],specials:[{w:11,title:'重寫起訴聲明'}]},
    {id:'insurance',name:'保險法',kind:'required',term:'Y3S2',prof:'prof_jian',room:'L201',slots:[{wd:2,block:'am'}],topics:['保險契約','告知義務','理賠爭議'],specials:[{w:12,title:'理賠被拒'}]},
    {id:'negotiable',name:'票據及支付工具法',kind:'elective',term:'Y3S2',prof:'prof_jian',room:'LINZE',slots:[{wd:3,block:'pm1'}],topics:['支票','本票','電子支付']},
    {id:'labor_law',name:'勞動法',kind:'elective',term:'Y3S2',prof:null,profName:'兼任老師',room:'LINZE',slots:[{wd:4,block:'am'}],topics:['勞動契約','工時','颱風假'],specials:[{w:6,title:'颱風天要不要上班'}],choice:{group:'Y3S2_elec',default:'labor_law'}},
    {id:'fair_trade',name:'公平交易法',kind:'elective',term:'Y3S2',prof:null,profName:'兼任老師',room:'LINZE',slots:[{wd:4,block:'am'}],topics:['公平競爭','聯合行為','不公平競爭'],choice:{group:'Y3S2_elec',default:'labor_law'}},
    {id:'pil',name:'國際私法',kind:'elective',term:'Y3S2',prof:'prof_chen',room:'LINZE',slots:[{wd:5,block:'am'}],topics:['涉外民事','準據法']},
    // ---- 大四上（2028 秋）----
    {id:'enforcement',name:'強制執行法',kind:'required',term:'Y4S1',prof:'prof_tsai',room:'L201',slots:[{wd:1,block:'am'}],topics:['判決之後','查封','拍賣','執行'],specials:[{w:12,title:'判決贏了，錢拿不回來怎麼辦'}]},
    {id:'ethics',name:'法律倫理',kind:'required',term:'Y4S1',prof:null,profName:'兼任律師',room:'WSEM',slots:[{wd:2,block:'pm1'}],topics:['律師的保密','利益衝突','為被告辯護'],specials:[{w:11,title:'律師能不能替明知有罪的人辯護'}]},
    {id:'ip_law',name:'智慧財產權法',kind:'elective',term:'Y4S1',prof:null,profName:'兼任老師',room:'LINZE',slots:[{wd:3,block:'am'}],topics:['著作權','專利','商標'],specials:[{w:10,title:'子晴的遊戲配樂',story:true}]},
    {id:'labor_social',name:'勞動社會法',kind:'elective',term:'Y4S1',prof:null,profName:'兼任老師',room:'LINZE',slots:[{wd:4,block:'pm1'}],topics:['社會保險','職業災害'],choice:{group:'Y4S1_elec',default:'labor_social'}},
    {id:'tax_law',name:'財稅法',kind:'elective',term:'Y4S1',prof:null,profName:'兼任老師',room:'LINZE',slots:[{wd:4,block:'pm1'}],topics:['租稅基本概念','所得稅','稅捐稽徵'],choice:{group:'Y4S1_elec',default:'labor_social'}},
    {id:'case_seminar',name:'判決研討',kind:'elective',term:'Y4S1',prof:'prof_lin',room:'WSEM',slots:[{wd:5,block:'am'}],topics:['判決怎麼讀','不同意見書'],specials:[{w:11,title:'有不同意見書的大法庭'}]},
    // ---- 大四下（2029 春）----
    {id:'legal_research',name:'法律專題研究',kind:'required',term:'Y4S2',prof:'prof_zhou',room:'WSEM',slots:[{wd:1,block:'pm1'}],topics:['自選題目','報告'],specials:[{w:14,title:'回顧大一的案例'}]},
    {id:'practicum',name:'法律實習或法律扶助實務',kind:'required',term:'Y4S2',prof:null,profName:'實習指導',room:'OFF',slots:[{wd:2,block:'am'},{wd:2,block:'pm1'}],topics:['事務所或法扶的實務']},
    {id:'maritime',name:'海商法與海洋法',kind:'elective',term:'Y4S2',prof:null,profName:'兼任老師',room:'LINZE',slots:[{wd:3,block:'am'}],topics:['海上運送','海洋法']},
    {id:'legal_english',name:'法學英文',kind:'elective',term:'Y4S2',prof:null,profName:'兼任老師',room:'LINZE',slots:[{wd:4,block:'am'}],topics:['英美判例','法律英文'],choice:{group:'Y4S2_elec',default:'legal_english'}},
    {id:'anglo_law',name:'英美法',kind:'elective',term:'Y4S2',prof:null,profName:'兼任老師',room:'LINZE',slots:[{wd:4,block:'am'}],topics:['英美法的體系','判例法'],choice:{group:'Y4S2_elec',default:'legal_english'}}
  ]
};

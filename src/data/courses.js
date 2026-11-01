/* ===== 八學期課程與課表（D52，2026-10-13）=====
   來源：劇情企劃 AA 的 AA_103「四年八學期課程與課表」、AA_104「課表與日曆系統：實作規格」（劇情企劃分支 claude/story-planning 的 docs/story_planning/；舊的企劃分支已移除，D66）。
   使用者 2026-10-13：課表直接交給 LAWWW 實作，不用再等使用者批准；AA 負責把課表想完整，LAWWW 負責做進遊戲（AA 與 LAWWW 自行協調修正）。
   這份是 LAWWW 照 AA_103 第 4 節（八份每週課表）、第 5 節（進度架構、特殊事件的週次）、第 2 節（教授）轉成的遊戲資料；改課表照 AA 的文件改這裡。
   - 時段（AA_103 第 1 節）：上午 09:10–12:10、下午一 13:20–15:10、下午二 15:30–17:20；晚上沒有法律系的課。
   - 星期：wd 1＝週一 … 5＝週五（同 src/data/calendar.js）。
   - 地點：room 對到下面的 rooms。AA_103 只寫「霖澤館」（沒有教室號碼）的課先在 201（AA_103 第 1 節：其他教室沿用同一個教室、換黑板與座位，開發組評估）；
     萬才館研討室、共同教學館（AA_103 的共同課程教室）、體育館、校外是「門口上課」（走到那棟建築的門口，課堂用 2D 畫面；之後有 3D 教室再換）。
   - 進度（topics）：AA_103 第 5 節「普通課堂內容（進度架構）」；每一週講哪一個由程式照順序分配（第 8～9、16 週考試；16 週制）。法律內容全部需要法律審查（AA_103）；
     黑板與台詞不寫案號（AA_103 第 5 節「遊戲對話不講案號」）。每週的黑板三行、教授一句、同學反應由 BB 依本表寫（AA_104 的 syllabus），還沒寫的週用程式的一般句子。
   - 特殊課堂（specials）：AA_103 第 5 節的週次；story:true＝牽涉主要人物劇情（大一上「系統優先、劇情暫緩」，等使用者批准劇情再做）；內容還沒做的週照普通課堂上。
   - 選修（choice）：同一組二選一（AA_104 第 1 節）；沒選照 default。 */
const COURSES={
  version:2,   /* 2：課程代號照 AA_103 第 8 節（2026-10-13）；1：舊代號（classes3d.js 的 OLD_IDS 轉換）*/
  blocks:{ am:{t0:9+10/60,t1:12+10/60,label:'上午'}, pm1:{t0:13+20/60,t1:15+10/60,label:'下午一'}, pm2:{t0:15.5,t1:17+20/60,label:'下午二'} },
  rooms:{
    L201:{name:'法律系館A 201',zone:'classroom'},                                  /* AA_103 第 8 節 linze_201 */
    LINZE:{name:'法律系館A 201',zone:'classroom'},                                 /* linze_class（霖澤館其他教室）：遊戲裡還是 201（AA_103 第 1 節）*/
    WMULTI:{name:'法律系館B 多功能教室',zone:'wancai_multi',room:'multi',via:'wancai',whole:true},   /* X78（使用者 10-20「法律系的課不要都在霖澤館，萬才也要有」；AA_330 48845c36）：走得進去的教室（rooms_glb3d.js，LAWWW2-C 0a5cc70a）；whole＝整個區域就是這間教室 */
    L202:{name:'法律系館A 202',zone:'linze_202',room:'c202',via:'linze',whole:true},   /* X78：原本 LINZE 門口上課的八門選修搬進來（AA_330）*/
    WSEM:{name:'法律系館B 研討室',door:'wancai_seminar',zone:'wancai',label:'研討室 A',lv:1},   /* 萬才館二樓的研討室 A：門口上課（classes3d.js 的 DOORS.wancai_seminar，門在 wancai3d.js）；2026-10-13 審查：原本沒有這個門，大四的研討課上不了 */                           /* wancai_sem：門口上課（2D）*/
    GONGTONG:{name:'共同教學館 102',zone:'gongtong',room:'102',door:'common'},  /* gongtong_hall：英文、日文（AA_107：共同教學館是小班的語言教室）*/
    PUTONG:{name:'普通教學館 101',zone:'putong',room:'101',door:'putong'},   /* putong_hall（方案 A，D55）：文學院正後方；重修經濟學原理（AA 2026-10-13）*/
    BOYA:{name:'博思教學館 101',zone:'boya',room:'101',door:'boya'},           /* boya_hall（方案 A）：普通北邊；經濟系大一的經濟學原理（D56，劇情做好之前不會排到）*/
    LAWLIB_DESK:{name:'法律學院圖書館 櫃台',door:'lawlib_desk',zone:'lawlib'},     /* 服務學習（一）：在櫃台報到，和門口上課一樣用 2D 帶過（AA_110 6-1）*/
    CAMPUS_SVC:{name:'晨思鐘旁的服務學習集合點',door:'campus_service'},                /* 服務學習（二）：椰林大道、醉月湖的校園環境（大二上；內容 AA 大二前再補）*/
    GYM:{name:'體育館',door:'gym'},                                             /* field：企劃寫操場、程式寫體育館，兩個都可以（AA_110）*/
    OFF:{name:'法扶・臺北的辦公室',offsite:true,bg:'legal_aid_office'}   /* AA_441 第 0 節：大四下法律實習在法扶（韓律師）；黑底 legal_aid_office 同 C16、大五上的實習 */                               /* offsite */
  },
  profs:{ prof_zhou:'周啟明', prof_zhang:'張維德', prof_wu:'吳承翰', prof_huang:'黃素芬', prof_wei:'魏宏仁', prof_xu:'許志遠', prof_tsai:'蔡佩君', prof_lin:'林昭儀', prof_chen:'陳律言',
          prof_zheng:'鄭婉如', prof_ye:'葉明哲', prof_he:'何安平', prof_jian:'簡如萍' },
  list:[
    /* 課程代號、教授、時段、地點、選修群組：AA_103 第 8 節（企劃分支 claude/story-planning；2026-10-13 照 AA_110 差異表同步，舊代號在 classes3d.js 的 OLD_IDS 轉換舊存檔）。
       特殊週：BB 的 syllabus（docs/story_planning/syllabus/*.json）標的週次；標題照 AA_103 第 5 節（遊戲對話不講案號）。 */
    // ---- 經濟系大一（2024 學年，v0；AA_106 2-2：經濟學原理在博雅、初等會計學在普通【已定案】，其他是遊戲安排【虛構】；AA_154 1-1 的停課照 calendar.js）----
    /* 課堂內容：BB 的 syllabus（Y0S1、Y0S2；經原、通識、會計有每週內容，其他是台詞池）。休學（E30，2024-10-17，Y0_LEFT；AA_218 第 11 節）以後經濟系的課都不排（y0leave；classes3d.js 的 enrolled）：大一上第 7 週以後的課、期中、期末都沒有，大一下的課和法學緒論也不上。
       老師：經原＝魏宏仁（AA_159，prof_wei；上課時站在博雅 101 的講台）；其他不具名。法學緒論＝黃素芬（現有教授）*/
    {id:'econ_principles_y0',name:'經濟學原理（上）',kind:'required',term:'Y0S1',y0leave:true,prof:'prof_wei',profName:'魏宏仁',room:'BOYA',slots:[{wd:1,block:'am'}],topics:['供給與需求','市場與價格','彈性','消費者','生產與成本','市場結構'],specials:[{w:2,title:'你放棄了什麼（機會成本）',story:true},{w:14,title:'囚犯困境',story:true},{w:15,title:'市場失靈',story:true}]},
    {id:'acct_y0',name:'初等會計學（上）',kind:'required',term:'Y0S1',y0leave:true,prof:null,profName:'會計老師',room:'PUTONG',slots:[{wd:4,block:'pm1'}],topics:['會計恆等式','分錄','試算表','財務報表'],specials:[{w:1,title:'宿舍是資產還是負債',story:true}]},
    {id:'calc_y0s1',name:'微積分',kind:'required',term:'Y0S1',y0leave:true,prof:null,profName:'數學系老師',room:'GONGTONG',slots:[{wd:3,block:'am'}],topics:['極限','導數','積分']},
    {id:'chinese_y0',name:'大一國文',kind:'general',term:'Y0S1',y0leave:true,prof:null,profName:'國文老師',room:'BOYA',slots:[{wd:2,block:'am'}],topics:['現代散文','古典詩文','寫作練習']},
    {id:'english_y0',name:'大一英文',kind:'general',term:'Y0S1',y0leave:true,prof:null,profName:'英文老師',room:'GONGTONG',slots:[{wd:4,block:'am'}],topics:['閱讀','寫作','口說']},
    {id:'ge_y0s1',name:'通識：思考實驗',kind:'general',term:'Y0S1',y0leave:true,prof:null,profName:'通識老師',room:'BOYA',slots:[{wd:2,block:'pm1'}],topics:['思考實驗']},
    {id:'pe_y0s1',name:'體育',kind:'general',term:'Y0S1',y0leave:true,prof:null,room:'GYM',slots:[{wd:3,block:'pm2'}],topics:['體適能','球類']},
    {id:'econ_principles_y0_2',name:'經濟學原理（下）',kind:'required',term:'Y0S2',prof:'prof_wei',profName:'魏宏仁',room:'BOYA',slots:[{wd:1,block:'am'}],y0leave:true,topics:['國民所得','物價與失業','貨幣與央行'],specials:[{w:15,title:'選了要付什麼',story:true}]},   /* 16 週制：第 16 週併進第 15 週（AA 7abe189a syllabus）*/
    {id:'acct_y0_2',name:'初等會計學（下）',kind:'required',term:'Y0S2',prof:null,profName:'會計老師',room:'PUTONG',slots:[{wd:4,block:'pm1'}],y0leave:true,topics:['存貨','固定資產','負債']},
    {id:'calc_y0s2',name:'微積分（下）',kind:'required',term:'Y0S2',prof:null,profName:'數學系老師',room:'GONGTONG',slots:[{wd:3,block:'am'}],y0leave:true,topics:['多變數','最適化','經濟上的應用']},
    {id:'chinese_y0_2',name:'大一國文（下）',kind:'general',term:'Y0S2',prof:null,profName:'國文老師',room:'BOYA',slots:[{wd:2,block:'am'}],y0leave:true,topics:['小說選讀','論說文']},
    {id:'english_y0_2',name:'大一英文（下）',kind:'general',term:'Y0S2',prof:null,profName:'英文老師',room:'GONGTONG',slots:[{wd:4,block:'am'}],y0leave:true,topics:['閱讀','寫作']},
    {id:'pe_y0s2',name:'體育',kind:'general',term:'Y0S2',prof:null,room:'GYM',slots:[{wd:3,block:'pm2'}],y0leave:true,topics:['體適能','球類']},
    {id:'law_intro',name:'法學緒論',kind:'general',term:'Y0S2',prof:'prof_huang',room:'GONGTONG',slots:[{wd:2,block:'pm1'}],y0leave:true,topics:['法律是什麼','法源','權利與義務'],specials:[{w:1,title:'法律在哪裡',story:true}]},   /* 給非法律系的選修；選課結果一定有這門（AA_154 E24b）*/
    // ---- 大一上（2025 秋）----
    {id:'const_1',name:'憲法（上）',kind:'required',term:'Y1S1',prof:'prof_zhang',room:'L201',slots:[{wd:1,block:'am'}],
     topics:['憲法的基本概念','基本權','比例原則','權力分立'],specials:[{w:4,title:'點名的小插曲'},{w:11,title:'法院能不能命令道歉'}]},
    {id:'pe_y1s1',name:'體育',kind:'general',term:'Y1S1',prof:null,room:'GYM',slots:[{wd:1,block:'pm2'}],topics:['體適能','球類','游泳']},
    {id:'chinese_y1',name:'大一國文（上）',kind:'general',term:'Y1S1',prof:null,profName:'國文老師',room:'BOYA',slots:[{wd:2,block:'am'}],topics:['現代散文','古典詩文','寫作練習']},
    {id:'ge_film_y1s1',name:'通識：電影與敘事',kind:'general',term:'Y1S1',prof:null,profName:'通識老師',room:'PUTONG',slots:[{wd:2,block:'pm1'}],topics:['課程導論','分組討論','期末報告準備']},
    {id:'crim_gen1',name:'刑法總則（一）',kind:'required',term:'Y1S1',prof:'prof_wu',room:'L201',slots:[{wd:3,block:'am'}],
     topics:['刑法的基本原則：罪刑法定','構成要件','故意與過失'],specials:[{w:5,title:'吳教授「一個概念講兩週」'}]},
    /* 服務學習（一）（AA_110 第 6-1 節，AA 暫定；AA_103 第 4、8 節已同步）：0 學分、不進成績單、只記次數；第 4～7、10～14 週共 9 次（18 小時），缺的可以在第 15、16 週同一時段補。
       2D 每次一句（不帶人物）：第 n 次報到用第 n 句（classes3d.js 的 attend）。 */
    {id:'service_1',name:'服務學習（一）',kind:'service',term:'Y1S1',prof:null,profName:'館員',room:'LAWLIB_DESK',slots:[{wd:3,block:'pm1'}],weeks:[4,5,6,7,10,11,12,13,14],makeupWeeks:[15,16],
     serviceLines:['第一次報到。館員給你一張分類號的表：「先記前面三碼就好。」','還書車推到第三排。同一本教科書有四個版本，最新的那本被借走了。','新書到了。拆箱、貼條碼、蓋館藏章。蓋歪了一個，館員說：「沒關係，書不會介意。」',
       '下雨。你在門口放傘架，進來的人都在甩傘。這兩個小時很像一份真正的工作。','有人問你影印室在哪裡。你指給他，才想到自己也是前幾週才知道的。','最上層的書要踩小凳子。站上去，整個閱覽室的人都低著頭，像一片很安靜的田。',
       '館員請你把「請勿飲食」的牌子擦乾淨。牌子很乾淨。你還是擦了。','整理期刊。你順手翻了一本，看不懂，放回去，排得比原來還整齊。','最後一次。館員在服務紀錄上簽名：「十八小時。辛苦了。」順手給你一張圖書館的書籤。']},
    {id:'english_y1',name:'大一英文（上）',kind:'general',term:'Y1S1',prof:null,profName:'英文老師',room:'GONGTONG',slots:[{wd:4,block:'am'}],topics:['閱讀','聽力','口頭報告']},
    {id:'civ_general',name:'民法總則',kind:'required',term:'Y1S1',prof:'prof_zhou',room:'L201',slots:[{wd:4,block:'pm1'}],
     topics:['民法的結構','權利主體：權利能力','權利主體：行為能力','物','法律行為','意思表示','代理','時效'],
     specials:[{w:1,title:'網拍相機',story:true,storyDay2:true},{w:12,title:'兩個人都簽了，為什麼還可能無效'},{w:14,title:'周教授的正反辯論',story:true}]},
    {id:'econ_principles_1',name:'經濟學原理（上）',kind:'required',retake:true,term:'Y1S1',prof:null,profName:'經濟系老師',room:'PUTONG',slots:[{wd:5,block:'am'}],topics:['供給與需求','市場與價格','彈性'],specials:[{w:1,title:'第一次走進這門課',story:true},{w:4,title:'價格管制（分組）'}]},   /* 重修（使用者 2026-10-13：經濟系休學沒拿到學分）；上下兩學期（使用者定案，AA_107 1-2a）。
       第 3 週＝BB_105 P4「第二次大一」的那一堂（BB 的 syllabus 標 special）：事件要使用者批准才做，現在照 BB 的備用內容上普通的課 */
    // ---- 大一下（2026 春）----
    {id:'const_2',name:'憲法（下）',kind:'required',term:'Y1S2',prof:'prof_zhang',room:'L201',slots:[{wd:1,block:'am'}],topics:['基本權（續）','權力分立（續）','憲法訴訟入門']},
    {id:'ge_y1s2',name:'通識：天文與我們',kind:'general',term:'Y1S2',prof:null,profName:'通識老師',room:'PUTONG',slots:[{wd:1,block:'pm1'}],topics:['課程導論','分組討論','期末報告準備']},
    {id:'pe_y1s2',name:'體育',kind:'general',term:'Y1S2',prof:null,room:'GYM',slots:[{wd:1,block:'pm2'}],topics:['羽球','排球','體適能檢測']},
    {id:'chinese_y1_2',name:'大一國文（下）',kind:'general',term:'Y1S2',prof:null,profName:'國文老師',room:'BOYA',slots:[{wd:2,block:'am'}],topics:['小說選讀','論說文','期末作品']},
    {id:'crim_gen2',name:'刑法總則（二）',kind:'required',term:'Y1S2',prof:'prof_wu',room:'L201',slots:[{wd:3,block:'am'}],topics:['違法性：正當防衛','罪責','未遂','共犯'],specials:[{w:5,title:'為了保護朋友而動手'}]},
    {id:'english_y1_2',name:'大一英文（下）',kind:'general',term:'Y1S2',prof:null,profName:'英文老師',room:'GONGTONG',slots:[{wd:4,block:'am'}],topics:['閱讀','寫作','口頭報告']},
    {id:'oblig_gen1',name:'民法債編總論（一）',kind:'required',term:'Y1S2',prof:'prof_zhou',room:'L201',slots:[{wd:4,block:'pm1'}],topics:['債的發生：契約成立（要約與承諾）','無因管理','不當得利概論'],specials:[{w:3,title:'網拍相機的回聲'}]},
    {id:'econ_principles_2',name:'經濟學原理（下）',kind:'required',retake:true,term:'Y1S2',prof:null,profName:'經濟系老師',room:'PUTONG',slots:[{wd:5,block:'am'}],topics:['國民所得','物價與失業','成長與利率','貨幣與央行','開放經濟','景氣與政策']},   /* 下學期是總體經濟（AA 2026-10-13：原本的個體經濟題目和 BB 的大一下課堂內容對不上）；上下兩學期是使用者定案 */
    // ---- 大二上（2026 秋）----
    {id:'admin_law',name:'行政法',kind:'required',term:'Y2S1',prof:'prof_xu',room:'L201',slots:[{wd:1,block:'am'}],topics:['行政行為','行政處分','行政契約','依法行政'],specials:[{w:11,title:'國家賠償'},{w:12,title:'撤銷與信賴保護（以安站機關那邊）',story:true}]},
    {id:'japanese_1',name:'日文（上）',kind:'elective',term:'Y2S1',prof:null,profName:'日文老師',room:'GONGTONG',slots:[{wd:1,block:'pm1'}],topics:['五十音','打招呼','自我介紹']},   /* 遊戲安排（使用者 2026-10-13：大二上下是遊戲安排的候選，不是真實修課年份）*/
    {id:'pe_y2s1',name:'體育',kind:'general',term:'Y2S1',prof:null,room:'GYM',slots:[{wd:1,block:'pm2'}],topics:['桌球','籃球','體適能']},
    /* 服務學習（二）（AA_110 6-1，AA 暫定）：週三下午二（下午一原本是法理學，2026-10-14 刪除），椰林大道、醉月湖的校園環境；每次的一句 AA 大二前再補（現在用一般句子）*/
    {id:'service_2',name:'服務學習（二）',kind:'service',term:'Y2S1',prof:null,profName:'服務學習老師',room:'CAMPUS_SVC',slots:[{wd:3,block:'pm2'}],weeks:[4,5,6,7,10,11,12,13,14],makeupWeeks:[15,16]},
    {id:'crim_spec',name:'刑法分則',kind:'required',term:'Y2S1',prof:'prof_wu',room:'L201',slots:[{wd:2,block:'am'}],topics:['生命法益','身體法益','自由法益','財產法益','侵占與背信的差別'],specials:[{w:12,title:'幫社團管錢，侵占還是背信'}]},
    {id:'property',name:'民法物權',kind:'required',term:'Y2S1',prof:'prof_zheng',room:'WMULTI',slots:[{wd:2,block:'pm1'}],topics:['物權概念','所有權','占有','登記','共有','用益物權'],specials:[{w:10,title:'買了房子，卻沒有房子下面那塊地'}]},
    {id:'oblig_gen2',name:'民法債編總論（二）',kind:'required',term:'Y2S1',prof:'prof_zhou',room:'L201',slots:[{wd:4,block:'am'}],topics:['債務不履行','債的效力','多數債務人','時效']},
    {id:'ge_y2s1',name:'通識',kind:'general',term:'Y2S1',prof:null,profName:'通識老師',room:'BOYA',slots:[{wd:5,block:'am'}],topics:['課程導論','分組討論','期末報告準備']},
    // ---- 大二下（2027 春）----
    {id:'oblig_spec',name:'民法債編各論',kind:'required',term:'Y2S2',prof:'prof_ye',room:'L201',slots:[{wd:1,block:'am'}],topics:['買賣','租賃：買賣不破租賃','承攬','委任','消費者保護入門'],specials:[{w:5,title:'租到會被拆的房子'},{w:6,title:'買賣不破租賃',story:true},{w:11,title:'直播點數能不能退'}]},   /* 第 6 週：語彤事件 8（AA 2026-10-13 排在大二下第 6 週；人物劇情，story） */
    {id:'japanese_2',name:'日文（下）',kind:'elective',term:'Y2S2',prof:null,profName:'日文老師',room:'GONGTONG',slots:[{wd:1,block:'pm1'}],topics:['敬語入門','短文閱讀','會話練習'],specials:[{w:10,title:'「大丈夫」不一定是沒事'}]},
    {id:'family_law',name:'民法身分法',kind:'required',term:'Y2S2',prof:'prof_zheng',room:'WMULTI',slots:[{wd:2,block:'am'}],topics:['婚姻','親子','繼承','遺囑','特留分'],specials:[{w:14,title:'遺囑能不能排除一個繼承人'}]},
    {id:'ge_y2s2',name:'通識',kind:'general',term:'Y2S2',prof:null,profName:'通識老師',room:'PUTONG',slots:[{wd:2,block:'pm1'}],topics:['課程導論','分組討論','期末報告準備']},
    {id:'admin_remedy',name:'行政救濟法',kind:'required',term:'Y2S2',prof:'prof_xu',room:'L201',slots:[{wd:3,block:'am'}],topics:['訴願','行政訴訟','國家賠償程序'],specials:[{w:7,title:'申請被政府拒絕，去哪個法院'}]},
    {id:'legal_english',name:'法學英文／英美法',kind:'elective',term:'Y2S2',prof:null,profName:'兼任老師',room:'L202',slots:[{wd:4,block:'am'}],topics:['英美判例','法律英文','判例法']},   /* 2026-10-14 課程調整（使用者 16:15，AA_130）：大四下 → 大二下，同一個時段（週四上午，大二下原本空著） */
    // ---- 大三上（2027 秋）----
    {id:'civpro_1',name:'民事訴訟法甲上',kind:'required',term:'Y3S1',prof:'prof_tsai',room:'L201',slots:[{wd:1,block:'am'},{wd:4,block:'am'}],topics:['訴訟標的','當事人','管轄','審判權','起訴'],specials:[{w:4,title:'告政府一定去行政法院嗎'},{w:11,title:'法院的闡明'}]},
    {id:'crimpro',name:'刑事訴訟法',kind:'required',term:'Y3S1',prof:'prof_lin',room:'L201',slots:[{wd:2,block:'am'},{wd:5,block:'am'}],topics:['證據法：證據能力','證據法：傳聞','強制處分','被告與證人的權利'],
     specials:[{w:7,title:'旁聽作業'},{w:11,title:'私人偷錄的證據'},{w:15,title:'被告沒有律師'}]},   /* 第 7 週：AA_252 5-1 改成自己去地院旁聽的作業（AA_326 2-Y3-11）*/
    {id:'company_law',name:'商事法總論及公司法',kind:'required',term:'Y3S1',prof:'prof_he',room:'WMULTI',slots:[{wd:3,block:'am'}],topics:['商業組織','公司種類','股東會','董事會','董事的責任'],specials:[{w:11,title:'董事和股東的利益衝突'}]},
    {id:'securities',name:'證券交易法',kind:'elective',term:'Y3S1',prof:'prof_he',room:'L202',slots:[{wd:4,block:'pm1'}],topics:['證券市場','資訊公開','內線交易的概念']},
    // ---- 大三下（2028 春；台灣路線）----
    {id:'civpro_2',name:'民事訴訟法甲下',kind:'required',term:'Y3S2',prof:'prof_tsai',room:'L201',slots:[{wd:1,block:'am'}],topics:['證據調查','舉證責任','判決','上訴'],specials:[{w:5,title:'重寫起訴聲明'}]},
    {id:'insurance',name:'保險法',kind:'required',term:'Y3S2',prof:'prof_jian',room:'WMULTI',slots:[{wd:2,block:'am'}],topics:['保險契約','告知義務','理賠爭議'],specials:[{w:6,title:'理賠被拒'}]},
    {id:'negotiable',name:'票據及支付工具法',kind:'elective',term:'Y3S2',prof:'prof_jian',room:'L202',slots:[{wd:3,block:'pm1'}],topics:['支票','本票','電子支付']},
    {id:'labor_law',name:'勞動法',kind:'elective',term:'Y3S2',prof:null,profName:'兼任老師',room:'L202',slots:[{wd:4,block:'am'}],topics:['勞動契約','工時','颱風假'],specials:[{w:7,title:'颱風天要不要上班'}]},   /* 2026-10-14 課程調整（使用者 16:15，AA_130）：公平交易法刪除，勞動法固定安排、不再有選課 */
    // ---- 大四上（2028 秋）----
    {id:'enforcement',name:'強制執行法',kind:'required',term:'Y4S1',prof:'prof_tsai',room:'WMULTI',slots:[{wd:1,block:'am'}],topics:['判決之後','查封','拍賣','執行'],specials:[{w:7,title:'判決贏了，錢拿不回來怎麼辦'}]},
    {id:'legal_ethics',name:'法律倫理',kind:'required',term:'Y4S1',prof:null,profName:'兼任律師',room:'WSEM',slots:[{wd:2,block:'pm1'}],topics:['律師的保密','利益衝突','為被告辯護'],specials:[{w:4,title:'律師能不能替明知有罪的人辯護'}]},
    {id:'ip_law',name:'智慧財產權法',kind:'elective',term:'Y4S1',prof:null,profName:'兼任老師',room:'L202',slots:[{wd:3,block:'am'}],topics:['著作權','專利','商標'],specials:[{w:5,title:'子晴的遊戲配樂',story:true}]},   /* AA_110 第 1 節第 3 點：syllabus 沒標，週次先用程式原本的 */
    {id:'labor_social',name:'勞動社會法',kind:'elective',term:'Y4S1',prof:null,profName:'兼任老師',room:'L202',slots:[{wd:4,block:'pm1'}],topics:['社會保險','職業災害'],choice:{group:'Y4S1_elec',default:'labor_social'}},
    {id:'tax_law',name:'財稅法',kind:'elective',term:'Y4S1',prof:null,profName:'兼任老師',room:'L202',slots:[{wd:4,block:'pm1'}],topics:['租稅基本概念','所得稅','稅捐稽徵'],choice:{group:'Y4S1_elec',default:'labor_social'}},
    {id:'crim_judgment_sem',name:'刑事判決研討',kind:'elective',term:'Y4S1',prof:'prof_lin',room:'WSEM',slots:[{wd:5,block:'am'}],topics:['判決怎麼讀','不同意見書'],specials:[{w:3,title:'為了保護朋友而動手的回聲'}],choice:{group:'Y4S1_sem',default:'crim_judgment_sem'}},
    {id:'public_judgment_sem',name:'公法判決研討',kind:'elective',term:'Y4S1',prof:'prof_xu',room:'WSEM',slots:[{wd:5,block:'am'}],topics:['判決怎麼讀','憲法判決','行政法院判決'],choice:{group:'Y4S1_sem',default:'crim_judgment_sem'}},
    // ---- 大四下（2029 春）----
    {id:'legal_research',name:'法律專題研究',kind:'required',term:'Y4S2',prof:'prof_zhou',room:'WSEM',slots:[{wd:1,block:'pm1'}],topics:['自選題目','報告'],specials:[{w:10,title:'回顧大一的案例'}]},   /* AA_263（syllabus 7abe189a）：第 10 週回顧大一。第 6 週法院旁聽、第 7 週旁聽之後都拿掉、改成一般的週（AA_252 2-4、AA_327 2-Y4-41：使用者 10-18 拿掉大四下的法院旁聽，課照上；AA_342 C1：兩週都改一般週——syllabus.js 也不放那兩週，tools/syllabus/import_syllabus.py 的 DROPPED_WEEKS）*/
    {id:'legal_practice',name:'法律實習或法律扶助實務',kind:'required',term:'Y4S2',prof:null,profName:'實習指導',room:'OFF',slots:[{wd:2,block:'am'},{wd:2,block:'pm1'}],topics:['事務所或法扶的實務']},
    {id:'maritime',name:'海商法與海洋法',kind:'elective',term:'Y4S2',prof:null,profName:'兼任老師',room:'L202',slots:[{wd:3,block:'am'}],topics:['海上運送','海洋法']},
    /* 日本路線的補修（AA_144 X4；AA_341 J-S6）：大三下在日本，兩門必修大四下和學弟妹同堂；課堂內容重播大三下那一門的 syllabus（redo）。
       保險法原本週三上午會撞海商法，照 AA_144「換到沒撞課的上午」＝週四上午。以安不補修（AA_341 裁定 7）。學弟妹的反應句 BB 還沒補 */
    {id:'civpro_2_re',name:'民事訴訟法甲下',kind:'required',term:'Y4S2',prof:'prof_tsai',room:'L201',slots:[{wd:1,block:'am'}],topics:['證據調查','舉證責任','判決','上訴'],route:['JP'],redo:'civpro_2'},
    {id:'insurance_re',name:'保險法',kind:'required',term:'Y4S2',prof:'prof_jian',room:'WMULTI',slots:[{wd:4,block:'am'}],topics:['保險契約','告知義務','理賠爭議'],route:['JP'],redo:'insurance'},
  ]
};

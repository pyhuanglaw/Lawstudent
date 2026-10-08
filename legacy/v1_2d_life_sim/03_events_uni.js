/* ===== 03 大學事件（大一上深化 + 各學期通用） ===== */
// 事件格式：{id,title,scene,once,weight,when(G),lines|linesFn,options:[{label,hint,when,do(G)->lines|string}]}
// 輔助：Y(y,s) 學年學期；B(id) 目前區塊；F(flag)；R(npc,min) 關係門檻
const Y=(y,s)=>G.time.year===y&&(s==null||G.time.sem===s);
const B=(...ids)=>ids.includes(curBlockId());
const F=k=>!!G.flags[k];
const R=(id,min)=>(G.npcs[id]&&G.npcs[id].rel>=min);
const L=(who,t)=>({who,t});

const UNI_EVENTS = [
  // ---------- 大一上：開學 ----------
  { id:'y1_open', title:'第一堂法學緒論', scene:'classroom', once:true, weight:1000,
    when:()=>Y(1,1)&&B('w1'),
    lines:[
      L('n','法學緒論的教室很大，冷氣很強。你挑了中間偏後的位子坐下。'),
      L('wu','這學期報告不會很重，大家放心。'),
      L('n','旁邊的女生已經把課本翻到第一章，用三種顏色的筆畫線。她發現你在看。'),
      L('an','你也是法律系的？我是安佳蓉，叫我小安就好。'),
      L('n','後排傳來一個聲音。'),
      L('zhe','欸，你們有人知道系烤是哪天嗎？我是阿哲。'),
    ],
    options:[
      { label:'「我是{name}。你們高中就想念法律嗎？」', hint:'打開話題', do:()=>{ addRel('an',6); addRel('zhe',6); G.npcs.an.met=G.npcs.zhe.met=true;
          return [L('an','嗯，我高中就決定要考司法官。'),L('zhe','我是分數剛好到。'),L('n','小安看了阿哲一眼。阿哲聳肩。你覺得這兩個人大概會常出現在你人生裡。')]; } },
      { label:'點頭微笑，先觀察', hint:'不急著認識人', do:()=>{ addRel('an',2); addRel('zhe',2); G.npcs.an.met=G.npcs.zhe.met=true;
          return [L('n','你點了點頭。小安繼續畫線，阿哲開始問前排的人系烤的事。'),L('n','下課時阿哲還是加了你的 LINE：「以後借筆記用。」')]; } },
      { label:'「系烤我也想知道。」', hint:'先跟阿哲熟', do:()=>{ addRel('zhe',9); addRel('an',2); G.npcs.an.met=G.npcs.zhe.met=true;
          return [L('zhe','太好了，終於有人在意重要的事。'),L('an','……你們兩個要不要先看一下課綱？'),L('n','你們三個人的關係就這樣開始了。')]; } },
    ]},
  { id:'y1_kai', title:'室友', scene:'dorm', once:true, weight:90,
    when:()=>Y(1,1)&&B('w2','w4')&&G.housing==='dorm',
    lines:[
      L('n','宿舍。你的室友阿凱是資工系，桌上有兩台螢幕，凌晨一點還亮著。'),
      L('kai','法律系的書都長這樣喔？每本都一樣厚。'),
      L('kai','你們是不是要背整本？'),
    ],
    options:[
      { label:'「不是背，是要理解結構。」', hint:'認真解釋', do:()=>{ addRel('kai',7); G.npcs.kai.met=true; return [L('kai','喔，跟寫程式一樣，要先知道架構。'),L('n','你覺得這個比喻不完全對，但沒有糾正他。')]; } },
      { label:'「對，要背整本。」', hint:'開玩笑', do:()=>{ addRel('kai',5); G.npcs.kai.met=true; return [L('kai','那你們畢業會不會變成一本書。'),L('n','他笑了。你也笑了。你們的關係從一個爛笑話開始。')]; } },
    ]},
  { id:'y1_commute', title:'早班的火車', scene:'campus', once:true, weight:90,
    when:()=>Y(1,1)&&B('w2','w4')&&G.housing==='commute',
    lines:[
      L('n','通勤的第一週。早八的課要搭六點五十的車。'),
      L('n','車上有個人在看《民法總則》，翻頁很快。你認出她是系上大三的溫學姊。'),
      L('sis','你也早八？陳教授的民總？'),
    ],
    options:[
      { label:'「對，我大一。」然後問她怎麼讀民總', hint:'向前輩請益', do:()=>{ addRel('sis',8); G.npcs.sis.met=true; return [L('sis','先把體系圖畫出來，再讀細節。她考試很愛問「這個放在哪裡」。'),L('n','你把這句記在手機備忘錄。'),L('sis','有問題可以問我，但不要期中考前一天問。')]; } },
      { label:'點個頭，繼續看窗外', hint:'早上還沒醒', do:()=>{ addRel('sis',2); G.npcs.sis.met=true; return [L('n','她也點了點頭，繼續翻書。你在系上再遇到她時，她記得你是「火車上的那個」。')]; } },
    ]},
  { id:'y1_an_group', title:'讀書會', scene:'library', once:true, weight:70,
    when:()=>Y(1,1)&&B('w2','w4')&&G.npcs.an.met,
    lines:[
      L('an','我想組一個讀書會，每週一次，先從民總開始。'),
      L('an','不是聊天的那種。'),
      L('zhe','那我先聲明我是聊天的那種。'),
    ],
    options:[
      { label:'「好，我加入。」', hint:'之後「讀書會」的效果會更穩定', do:()=>{ addRel('an',8); setFlag('study_with_an'); G.groupBonus=true; return [L('an','那週三晚上，圖書館三樓。'),L('zhe','……我也去啦。'),L('n','你們三個人的讀書會成立了。第一次聚會，前二十分鐘在討論要不要買飲料。')]; } },
      { label:'「我先自己讀看看，之後再說。」', hint:'保留自由', do:()=>{ addRel('an',-1); return [L('an','好，隨時可以來。'),L('n','她沒有不高興，只是把「你」從她的行事曆上暫時拿掉了。')]; } },
      { label:'「聊天的那種我也可以。」', hint:'跟阿哲站同一邊', do:()=>{ addRel('zhe',6); addRel('an',2); G.groupBonus=false; return [L('an','……你們兩個。'),L('n','讀書會還是成立了，只是小安每次都會準備一份「今天要討論的爭點」，你和阿哲每次都會準備一份宵夜。')]; } },
    ]},
  { id:'y1_zhe_club', title:'社團迎新', scene:'campus', once:true, weight:70,
    when:()=>Y(1,1)&&B('w2','w4','w6')&&G.npcs.zhe.met,
    lines:[
      L('zhe','週五晚上吉他社迎新，要不要來？外文系的人很多。'),
      L('zhe','你不用會彈，我也不會。'),
    ],
    options:[
      { label:'去看看', hint:'認識法律系以外的人', do:()=>{ addRel('zhe',6); G.npcs.yu.met=true; addRel('yu',8); setFlag('yu_met'); G.player.stress=Math.max(0,G.player.stress-5);
          return [L('n','迎新在活動中心。你被拉去玩一個要自我介紹的遊戲。'),L('yu','法律系？所以你以後會幫人打官司？'),L('you','……不一定。'),L('yu','那你現在能幫我看一下這份打工合約嗎？'),L('n','她叫小語，外文系。你們交換了 LINE。合約你看了三遍，其實看不太懂。')]; } },
      { label:'「這週要讀書，下次。」', hint:'之後還會有邀約', do:()=>{ G.refuseZhe=(G.refuseZhe||0)+1; if(G.refuseZhe>=2) setFlag('refuse_zhe'); addRel('zhe',-2); return [L('zhe','好啦，用功的人。'),L('n','週五晚上你在圖書館，讀了三十頁，然後滑了一小時手機。')]; } },
    ]},
  { id:'y1_sis_notes', title:'學姊的筆記', scene:'campus', once:true, weight:60,
    when:()=>Y(1,1)&&B('w4','w6')&&(G.npcs.an.met||G.npcs.sis.met),
    linesFn:()=>[
      L('n', G.npcs.sis.met?'系辦門口遇到溫學姊。':'小安介紹你認識溫學姊，大三，系上有名的筆記女王。'),
      L('sis','陳教授的民總我有筆記，體系圖是我自己畫的。要借你可以，但兩個條件。'),
      L('sis','一，還我的時候要完整。二，不要只抄，你要自己讀得懂。'),
    ],
    options:[
      { label:'借，並且答應條件', hint:'解鎖「借筆記」；之後要記得還', do:()=>{ G.npcs.sis.met=true; addRel('sis',5); setFlag('borrow_sis'); G.sisNotes='have'; return [L('n','筆記很整齊，第一頁是一張手繪的民總體系圖，右下角寫著「這個很基本」。'),L('n','你看了兩頁，發現有些地方要先讀過課本才看得懂。她說的是真的。')]; } },
      { label:'「謝謝，我想先自己整理看看。」', hint:'走自己的路', do:()=>{ G.npcs.sis.met=true; addRel('sis',3); return [L('sis','也好。自己整理過的東西才真的是自己的。'),L('n','她看起來反而有點欣賞這個回答。')]; } },
    ]},
  { id:'y1_basic', title:'這個很基本', scene:'classroom', once:true, weight:50,
    when:()=>Y(1,1)&&B('w4','w6','w10'),
    lines:[
      L('chen','所以，法律行為的成立要件和生效要件要分開看。這個很基本。'),
      L('n','全班的筆在同一秒動了起來。'),
      L('n','你發現前排有人在旁邊畫星號，後排有人在旁邊畫問號。'),
    ],
    options:[
      { label:'畫星號，回去把「成立」與「生效」的關係重新整理一次', hint:'體系', do:()=>{ courseFx('civ1',{s:4,u:2}); return [L('n','你回宿舍把這兩個概念畫成一張表。畫完發現，很多之前覺得零散的東西可以掛在上面。')]; } },
      { label:'下課去問：「老師，為什麼要分開看？」', hint:'表達', do:()=>{ courseFx('civ1',{u:4,part:8}); G.player.skills.express+=1; return [L('chen','問得好。因為不成立的東西不用談生不生效，而成立的東西可能無效、得撤銷、效力未定。'),L('n','她講得很快，但你聽懂了。她好像記住了你的臉。')]; } },
      { label:'畫問號，之後再說', hint:'先跟上進度', do:()=>{ courseFx('civ1',{m:2}); return [L('n','問號一直留在筆記上。期中考前你看到它的時候，才去查是什麼意思。')]; } },
    ]},
  { id:'y1_mom', title:'媽媽的電話', scene:'dorm', once:true, weight:45,
    when:()=>Y(1,1)&&B('w6','w10','w12'),
    lines:[
      L('mom','有沒有好好吃飯？'),
      L('mom','你二舅問你以後是要當律師還是法官。'),
      L('mom','他說法官比較穩定。'),
    ],
    options:[
      { label:'「我才大一，還不知道。」', hint:'誠實', do:()=>{ addRel('mom',3); return [L('mom','好啦，不急。你先把書讀好。'),L('n','掛掉電話後，你發現自己真的不知道。這件事會跟著你很久。')]; } },
      { label:'「先當律師吧，比較快。」', hint:'先給一個答案', do:()=>{ addRel('mom',4); setFlag('told_mom_lawyer'); return [L('mom','那要考試嗎？'),L('you','要。'),L('mom','那你要好好讀喔。'),L('n','你想，很多事情講出來以後就變得比較真了。')]; } },
      { label:'「媽，法官也要考試，而且更難考。」', hint:'解釋', do:()=>{ addRel('mom',2); G.player.skills.express+=1; return [L('mom','喔，那就律師好了。'),L('n','你發現解釋法律職涯給家人聽，可能比考試還難。')]; } },
    ]},
  { id:'y1_cat', title:'阿判', scene:'cafe', once:true, weight:40,
    when:()=>Y(1,1)&&B('w4','w6','w10','w12'),
    lines:[
      L('n','圖書館旁邊的早餐店有一隻貓，店員叫牠阿判。'),
      L('n','你把刑總課本放在桌上，牠直接坐上去。'),
    ],
    options:[
      { label:'讓牠坐，改看手機上的判決', hint:'牠比較重要', do:()=>{ G.npcs.cat.met=true; addRel('cat',10); G.player.stress=Math.max(0,G.player.stress-6); G.player.skills.research+=0.5; return [L('n','牠在課本上睡著了。你用手機讀了一則判決，讀得比平常認真。'),L('n','店員說：「牠平常不太理人。」你有點得意。')]; } },
      { label:'把牠抱到椅子上，繼續讀書', hint:'進度', do:()=>{ G.npcs.cat.met=true; addRel('cat',3); courseFx('crim1',{u:2}); return [L('n','牠在椅子上瞪了你十分鐘，然後去找別桌的人。你讀完了一節。')]; } },
    ]},
  { id:'y1_midnight', title:'凌晨兩點', scene:'dorm', once:true, weight:100,
    when:()=>Y(1,1)&&B('w8')&&(G.npcs.an.met||G.npcs.zhe.met),
    lines:[
      L('n','期中考前一週的凌晨兩點，群組突然跳出來。'),
      L('zhe','欸 有人有那份民總的體系筆記嗎 我電腦裡的不見了'),
      L('an','哪一份？'),
      L('zhe','就是那份 很多屆傳的那份'),
      L('an','我找找'),
      L('n','你看著螢幕，也不知道自己為什麼還醒著。'),
    ],
    options:[
      { label:'一起找，找到凌晨三點', hint:'精力下降，但你們會記得這個晚上', do:()=>{ setFlag('midnight_notes'); addRel('zhe',6); addRel('an',6); G.player.energy=Math.max(0,G.player.energy-10); courseFx('civ1',{s:3});
          return [L('n','三點十二分，小安在雲端硬碟的第六層資料夾找到了。'),L('zhe','我愛你們'),L('an','去睡覺'),L('n','你多看了一遍那份筆記的體系圖，然後睡了四個小時。')]; } },
      { label:'把自己整理的筆記直接傳上去', hint:'需要你這學期有整理過民總筆記', when:()=>G.courses.civ1&&G.courses.civ1.s>=25, do:()=>{ setFlag('midnight_notes'); setFlag('helped_friend'); addRel('zhe',10); addRel('an',5);
          return [L('zhe','靠 你這份比那份還清楚'),L('an','……可以借我看一下嗎'),L('n','你的筆記從這一晚開始在系上有了名字。')]; } },
      { label:'「先睡，明天再找。」然後真的去睡', hint:'休息', do:()=>{ G.player.energy=Math.min(100,G.player.energy+6); addRel('zhe',1); return [L('an','+1'),L('n','隔天早上群組裡已經有那份筆記了。你不知道是誰找到的，也沒有人再提。')]; } },
    ]},
  { id:'y1_after_mid', title:'考完試走出教室', scene:'campus', once:true, weight:100,
    when:()=>Y(1,1)&&B('w10')&&G.lastExam==='mid',
    lines:[
      L('n','刑總考完，大家在走廊上停下來。'),
      L('zhe','第二題你們寫故意還是過失？'),
      L('an','我寫未必故意，然後討論客觀歸責。'),
      L('zhe','……我寫過失。'),
      L('n','所有人的答案好像都不一樣。'),
    ],
    options:[
      { label:'加入對答案', hint:'會知道自己哪裡沒寫到', do:()=>{ courseFx('crim1',{i:3}); G.player.stress+=4; return [L('n','對了十分鐘，你發現有一個爭點你完全沒想到。'),L('you','我先去吃飯。'),L('n','你們去吃了鹹酥雞。沒有人再提第二題。')]; } },
      { label:'「考完就不要對了。」', hint:'保護心情', do:()=>{ G.player.stress=Math.max(0,G.player.stress-6); addRel('zhe',3); return [L('zhe','對，走，吃飯。'),L('n','小安一路上還在想第二題，但也沒有再說出來。')]; } },
    ]},
  { id:'y1_zhe_credits', title:'阿哲的期中', scene:'street', once:true, weight:80,
    when:()=>Y(1,1)&&B('w10','w12')&&G.npcs.zhe.met&&G.lastExam==='mid',
    lines:[
      L('n','宵夜攤。阿哲比平常安靜。'),
      L('zhe','民總我大概四十幾分。'),
      L('zhe','我媽那邊……家裡最近有點事，我這學期沒什麼在讀。'),
      L('zhe','沒事，我期末拚一下。'),
    ],
    options:[
      { label:'把自己的民總筆記給他，約他每週一起讀一次', hint:'你的時間會被分掉一點', do:()=>{ setFlag('help_zhe'); setFlag('helped_friend'); addRel('zhe',14); G.zheStudy=true; G.player.energy-=4;
          return [L('zhe','……你不用啦。'),L('you','週三晚上。你不來我就去你宿舍。'),L('zhe','好啦。'),L('n','他把宵夜的錢付了。你們都沒再提家裡的事。')]; } },
      { label:'「期末我可以幫你畫重點。」', hint:'幫，但不投入太多', do:()=>{ addRel('zhe',6); return [L('zhe','謝啦。'),L('n','期末前你真的把重點傳給他。他回了一個貼圖。')]; } },
      { label:'「你要不要先跟老師談一下？」', hint:'建議找老師', do:()=>{ addRel('zhe',2); G.player.skills.judgment+=1; return [L('zhe','……我想想。'),L('n','他後來有沒有去找老師，你不知道。宵夜吃完，你們各自回去。')]; } },
    ]},
  { id:'y1_sis_return', title:'還筆記', scene:'campus', once:true, weight:80,
    when:()=>Y(1,1)&&B('w10','w12','w14')&&G.sisNotes==='have',
    lines:[
      L('sis','筆記讀完了嗎？'),
      L('n','她的語氣不像在催，比較像在確認你有沒有做功課。'),
    ],
    options:[
      { label:'還她，附上自己補充的一頁整理', hint:'需要你有讀過民總', when:()=>G.courses.civ1&&G.courses.civ1.u>=30, do:()=>{ G.sisNotes='returned'; setFlag('sis_trust'); addRel('sis',14); courseFx('civ1',{s:3});
          return [L('sis','……你這頁整理得不錯。'),L('sis','之後有實習機會我會跟你說。'),L('n','她把那一頁夾進她的筆記裡。你知道這代表什麼。')]; } },
      { label:'還她，說聲謝謝', hint:'乾淨俐落', do:()=>{ G.sisNotes='returned'; addRel('sis',5); return [L('sis','嗯。有幫到就好。'),L('n','她翻了一下，確認每一頁都在。')]; } },
      { label:'「可以期末再還嗎？」', hint:'多用一陣子', do:()=>{ G.sisNotes='late'; addRel('sis',-6); return [L('sis','可以。但下次不會再借了。'),L('n','她說得很平靜，你反而更不舒服。')]; } },
    ]},
  { id:'y1_yu_contract', title:'那份打工合約', scene:'street', once:true, weight:50,
    when:()=>Y(1,1)&&B('w10','w12','w14')&&F('yu_met'),
    lines:[
      L('yu','上次那份合約，我後來去問系辦，他們說「應該沒問題」。'),
      L('yu','所以到底有沒有問題？'),
      L('n','你想起合約裡有一條寫「乙方不得於任何情況下請求加班費」。'),
    ],
    options:[
      { label:'「那一條可能有問題，勞動法我還沒學，但我幫你查。」', hint:'誠實，然後真的去查', do:()=>{ addRel('yu',10); G.player.skills.research+=1.5; G.player.skills.judgment+=1; return [L('n','你花了一個晚上查資料，把你找到的東西整理成三行傳給她。'),L('yu','你好認真喔。'),L('n','她加了一個笑臉。你把手機翻過來，繼續查。')]; } },
      { label:'「我才大一，你去問勞工局比較準。」', hint:'不要越界', do:()=>{ addRel('yu',3); G.player.skills.judgment+=1.5; return [L('yu','也對。'),L('n','她後來真的去問了。你發現「知道自己不知道」也是一種能力。')]; } },
    ]},
  { id:'y1_work_clash', title:'排班', scene:'store', once:true, weight:60,
    when:()=>Y(1,1)&&B('w10','w12')&&G.stats.work>=2,
    lines:[
      L('n','店長把下個月的班表貼出來。你的晚班排到期末考前一天。'),
      L('n','店長：「那天沒人可以換。」'),
    ],
    options:[
      { label:'硬撐，上完班直接去考試', hint:'錢照拿，狀態會差', do:()=>{ G.examPenalty=(G.examPenalty||0)+6; G.player.money+=3600; return [L('n','那天你在店裡站了八小時。回宿舍睡了三小時，然後去考試。')]; } },
      { label:'跟店長談：這個月少排一天，下個月補', hint:'表達與協商', do:()=>{ G.player.skills.express+=2; G.player.money-=1500; return [L('n','店長皺了一下眉，然後說「好啦」。你這個月少了一天的錢，多了一個晚上。')]; } },
    ]},
  { id:'y1_pastpapers', title:'歷屆考題', scene:'library', once:true, weight:70,
    when:()=>Y(1,1)&&B('w14','w16'),
    lines:[
      L('n','考前兩週，有人開始整理歷屆考題。'),
      L('an','我把陳教授近五年的題目排了一下，她每年都會考「效力未定」。'),
      L('zhe','所以我們只要讀效力未定？'),
      L('an','不是。'),
    ],
    options:[
      { label:'跟著把五年的題目寫一遍', hint:'爭點辨識、答案結構', do:()=>{ courseFx('civ1',{i:5,r:4}); G.courses.civ1.knowStyle=true; G.player.skills.structure+=1.5; G.player.energy-=6; return [L('n','寫完才發現，老師真正重視的地方跟課本的章節順序不一樣。'),L('n','你在筆記上把幾個常考的地方標起來。')]; } },
      { label:'只看題目，不寫', hint:'省時間', do:()=>{ courseFx('civ1',{i:2}); return [L('n','你看了題目，覺得都會。真的動筆的時候，才會知道會不會。')]; } },
    ]},
  { id:'y1_wu_report', title:'吳老師說報告不重', scene:'dorm', once:true, weight:90,
    when:()=>Y(1,1)&&B('w14'),
    lines:[
      L('n','法學緒論的期末報告要交了。吳老師開學說「不會很重」。'),
      L('zhe','為什麼大家都在熬夜'),
      L('an','因為她說的「不重」是指頁數，不是指她會不會認真看。'),
    ],
    options:[
      { label:'自己找三篇文章，重寫報告的論證', hint:'研究能力；很累', do:()=>{ G.player.skills.research+=2; G.reportBonus=(G.reportBonus||0)+12; G.player.energy-=8; G.player.stress+=5; return [L('n','你在圖書館待到閉館。報告的每一段都有出處。'),L('n','吳老師後來在課堂上說「有一組同學有自己找資料」，沒有說是誰。你知道是誰。')]; } },
      { label:'按照分工把自己的部分寫好就好', hint:'穩穩交出去', do:()=>{ G.reportBonus=(G.reportBonus||0)+4; return [L('n','你的部分寫得整齊。整份報告交出去的時候，你們三個都鬆了一口氣。')]; } },
    ]},
  { id:'y1_burnout', title:'書讀不進去', scene:'library', once:true, weight:90,
    when:()=>Y(1,1)&&B('w14','w16')&&G.streak>=2,
    lines:[
      L('n','你發現同一頁已經看了四次。'),
      L('n','旁邊小安也停下來，看著天花板。'),
      L('an','你讀完了嗎？'),
      L('you','沒有。'),
      L('an','我也是。'),
    ],
    options:[
      { label:'「那要不要先吃飯？」', hint:'休息不是偷懶', do:()=>{ G.streak=0; G.player.energy=Math.min(100,G.player.energy+10); G.player.stress=Math.max(0,G.player.stress-10); addRel('an',4); setFlag('rest_lots');
          return [L('an','好。'),L('n','你們去吃了一頓很慢的晚餐。回來以後那一頁只看了一次就過了。')]; } },
      { label:'再撐一下', hint:'效率會繼續下降', do:()=>{ setFlag('overwork'); G.player.stress+=6; return [L('n','你又看了那一頁兩次。這次你記住的是那頁的排版。')]; } },
    ]},
  { id:'y1_grades_react', title:'成績公布', scene:'campus', once:true, weight:100,
    when:()=>Y(1,1)&&B('grades'),
    linesFn:()=>{ const a=G.semAvg||0; return [
      L('n','成績陸續公布。系上群組安靜了一個下午，然後慢慢出現各種貼圖。'),
      L('zhe', G.flags.help_zhe?'民總過了！！！':'算了，下學期再說。'),
      L('an', a>=80?'你這學期很穩欸。':'我覺得我刑總寫太多了，沒寫到重點。'),
      L('n','有人非常開心，有人沉默，有人已經在問下學期的課。'),
    ]; },
    options:[
      { label:'找大家去吃一頓', hint:'不管成績', do:()=>{ addRel('an',3); addRel('zhe',3); G.player.money-=400; G.player.stress=Math.max(0,G.player.stress-8); return [L('n','火鍋店。沒有人提成績。有人提了寒假要幹嘛，然後大家發現都沒有計畫。')]; } },
      { label:'一個人去操場走一走', hint:'消化一下', do:()=>{ G.player.stress=Math.max(0,G.player.stress-8); G.player.energy+=4; return [L('n','操場很安靜。你走了三圈，想清楚了一件事：這學期的讀書方法哪裡要改。')]; } },
    ]},

  // ---------- 通用（所有學期）----------
  { id:'g_seat', title:'位子', scene:'library', weight:20,
    when:()=>G.phase==='uni'&&!B('w1','grades','break')&&!(Y(1,1)&&B('w2')),
    lines:[L('n','期中前的圖書館，你八點到的時候，常坐的那排已經全滿了。'),L('n','有一個位子上放著一本書和一杯水，人不在。')],
    options:[
      { label:'去別層找位子', do:()=>[L('n','五樓靠窗有一個位子，冷氣直吹。你戴上外套的帽子，坐了一整天。')] },
      { label:'坐在旁邊的沙發等', do:()=>{ G.player.energy+=2; return [L('n','等了二十分鐘，書和水的主人回來了，是溫學姊。她看了你一眼，把旁邊的包拿開：「坐。」'),]; } },
    ]},
  { id:'g_lunch', title:'午餐', scene:'street', weight:18, when:()=>G.phase==='uni'&&!B('w1','grades','break'),
    lines:[L('n','午餐。桌上五個人，話題從民法的爭點開始，三分鐘後變成哪一家便當的雞腿比較大。'),L('n','沒有人想把話題拉回去。')],
    options:[
      { label:'加入雞腿的討論', do:()=>{ G.player.stress=Math.max(0,G.player.stress-4); return [L('n','你們最後決定去吃第三家。雞腿普通，但大家吃得很開心。')]; } },
      { label:'趁機問大家期中怎麼準備', do:()=>{ G.player.stress+=2; courseFx(pick(examCoursesNow()),{i:1}); return [L('n','桌上安靜了三秒。然後每個人都說「還沒開始」。你知道至少有一個人在說謊。')]; } },
    ]},
  { id:'g_thickbook', title:'一本很厚的書', scene:'campus', weight:12, once:true, when:()=>G.phase==='uni'&&B('w2','w4'),
    lines:[L('n','書局。你拿起一本九百頁的教科書，封面很好看。'),L('n','學長說「這本一定要買」，學姊說「那本沒有人看完過」。')],
    options:[
      { label:'買', hint:'錢 −1,200', do:()=>{ G.player.money-=1200; G.bigBook=true; return [L('n','你把它放在書桌最顯眼的位置。學期結束時，書籤停在三分之一的地方。')]; } },
      { label:'先去圖書館借', do:()=>[L('n','圖書館有兩本，都被借走了。你預約了，排在第十一位。')] },
    ]},
  { id:'g_kai_night', title:'凌晨三點', scene:'dorm', weight:14, when:()=>G.phase==='uni'&&G.housing==='dorm'&&G.npcs.kai.met,
    lines:[L('kai','你還沒睡？'),L('you','你也還沒睡。'),L('kai','我在寫程式。你在幹嘛？'),L('you','在想一個問題。'),L('kai','什麼問題？'),L('you','一個大概不會考的問題。'),L('kai','喔，跟我一樣。')],
    options:[
      { label:'跟他聊到四點', do:()=>{ addRel('kai',5); G.player.energy-=5; G.player.stress=Math.max(0,G.player.stress-5); return [L('n','你們聊了法律跟程式哪一個比較像數學。沒有結論。但很好聊。')]; } },
      { label:'去睡', do:()=>{ G.player.energy+=3; return [L('n','你把燈關了。他的螢幕還亮著，像一個小小的月亮。')]; } },
    ]},
  { id:'g_money_low', title:'月底', scene:'store', weight:60, when:()=>G.phase==='uni'&&G.player.money<6000&&!B('grades','break'),
    linesFn:()=>[L('n','帳戶餘額：'+Math.max(0,Math.round(G.player.money))+' 元。'),L('n','這個月還有兩週。')],
    options:[
      { label:'跟家裡開口', hint:'一次性', when:()=>!G.askedMoney, do:()=>{ G.askedMoney=true; G.player.money+=8000; addRel('mom',2); G.player.stress+=3; return [L('mom','你要早講啊。'),L('n','匯款進來了，附帶一句「不要餓到」。你把這句話記了很久。')]; } },
      { label:'多排一些班', hint:'接下來的打工收入 +20%', do:()=>{ G.workBoost=true; G.player.stress+=4; return [L('n','店長很高興。你的行事曆上多了幾格「便利商店」。')]; } },
      { label:'這兩週吃便宜一點', hint:'精力略降', do:()=>{ G.player.energy-=6; G.player.money+=1200; return [L('n','你研究出一種泡麵加蛋加青菜的吃法。可以撐。')]; } },
    ]},
  { id:'g_pointed', title:'被點到', scene:'classroom', weight:22, when:()=>G.phase==='uni'&&examCoursesNow().some(c=>TEACHERS[COURSES[c].teacher].style==='disc'),
    linesFn:()=>{ const c=examCoursesNow().find(c=>TEACHERS[COURSES[c].teacher].style==='disc'); G._evCourse=c; return [L(COURSES[c].teacher,'那……這位同學，你同意這個看法嗎？'),L('n','全班轉頭。你沒有舉手。')]; },
    options:[
      { label:'說出自己的看法，即使不完整', do:()=>{ const c=G._evCourse; const ok=G.courses[c].u>=30; courseFx(c,{part:ok?12:6}); G.player.skills.express+=ok?2:1; G.player.stress+=3; return [L('n', ok?'你講了三句。老師點頭：「可以，繼續。」':'你講了一句半，老師說：「方向對，回去再想想。」'),L('n','下課後你發現自己手心是濕的。')]; } },
      { label:'「老師，我還沒想清楚。」', do:()=>{ courseFx(G._evCourse,{part:2}); return [L('n','老師轉向別人。你鬆了一口氣，然後有一點點後悔。')]; } },
    ]},
  { id:'g_office', title:'辦公室時間', scene:'classroom', weight:16, when:()=>G.phase==='uni'&&B('w6','w12'),
    linesFn:()=>{ const c=G._evCourse||pick(examCoursesNow()); G._evCourse=c; return [L('n','你抱著一個問題站在'+TEACHERS[COURSES[c].teacher].name+'的辦公室門口。'),L('n','門開著。老師在改東西。')]; },
    options:[
      { label:'敲門進去', do:()=>{ const c=G._evCourse; courseFx(c,{u:4,i:2}); G.courses[c].knowStyle=true; return [L(COURSES[c].teacher,'進來。什麼問題？'),L('n','你問了。老師回答的時候，你發現他在意的東西跟你以為的不一樣。你把「老師的期待」寫進筆記第一頁。')]; } },
      { label:'算了，回圖書館', do:()=>[L('n','你在門口站了三十秒，然後走了。那個問題你後來自己查到了，花了兩個小時。')] },
    ]},
  { id:'g_sys_event', title:'系上活動', scene:'campus', weight:14, when:()=>G.phase==='uni'&&B('w6','w12')&&G.npcs.zhe.met,
    lines:[L('zhe','系烤，週六，河濱。'),L('zhe','你不來我就把你的名字寫在報名表上。')],
    options:[
      { label:'去', do:()=>{ addRel('zhe',4); addRel('an',2); G.player.stress=Math.max(0,G.player.stress-6); G.player.money-=300; return [L('n','烤肉烤到一半下雨。大家躲在橋下，把剩下的肉烤完。這是這學期你笑最多的一天。')]; } },
      { label:'不去', do:()=>{ G.refuseZhe=(G.refuseZhe||0)+1; if(G.refuseZhe>=2) setFlag('refuse_zhe'); return [L('n','週六下午你在圖書館，聽到外面在下雨，想到他們大概在淋雨。')]; } },
    ]},
  { id:'g_break_plan', title:'放假前', scene:'campus', weight:10, when:()=>G.phase==='uni'&&B('w16'),
    lines:[L('n','考前最後一週，大家已經在討論放假要幹嘛。'),L('an','我要先睡三天。'),L('zhe','然後呢？'),L('an','然後看下學期的課。'),L('zhe','……')],
    options:[ { label:'「先考完再說。」', do:()=>[L('n','大家點頭，然後繼續翻書。')] } ]},
  { id:'y_yu_confess', title:'那天晚上', scene:'street', once:true, weight:90, when:()=>G.phase==='uni'&&F('yu_met')&&!F('yu_partner')&&!F('yu_break')&&G.npcs.yu.rel>=35&&!B('w1','grades','break'),
    lines:[L('n','社團結束後，你們走到校門口。她停下來。'),L('yu','我覺得我們好像不只是朋友。'),L('yu','你覺得呢？')],
    options:[ {label:'「我也是。」', do:()=>{ setFlag('yu_partner'); addRel('yu',15); G.player.stress=Math.max(0,G.player.stress-8); return [L('n','你們在校門口站了很久，久到警衛出來看了兩次。'),L('n','從此行程表上多了「約會」。')]; }},
      {label:'「我現在沒辦法想這個。」', do:()=>{ addRel('yu',-10); return [L('yu','好。'),L('n','她笑了一下，但你知道那個笑是什麼意思。你們之後還是朋友，只是有一段時間不太聊天。')]; }} ]},
  { id:'y_yu_break', title:'我們', scene:'street', once:true, weight:100, when:()=>F('yu_partner')&&!F('yu_break')&&G.npcs.yu.rel<8,
    lines:[L('yu','你最近都在讀書。'),L('you','嗯。'),L('yu','我不是在怪你。我只是覺得我一個人也可以。'),L('n','你沒有話可以接。')],
    options:[ {label:'「對不起。」', do:()=>{ setFlag('yu_break'); G.flags.yu_partner=null; delete G.flags.yu_partner; addRel('yu',5); G.player.stress+=10; return [L('n','你們在便利商店前面分開。她說有空再聊。你們後來真的有再聊，只是不一樣了。')]; }},
      {label:'「我會改。」然後真的排時間', do:()=>{ addRel('yu',18); G.player.energy-=4; return [L('yu','……好。那這週五。'),L('n','你把週五空出來。那一週你少讀了一格書，多了一個人。')]; }} ]},
  // ---------- 大二以後 ----------
  { id:'y2_exch_info', title:'交換說明會', scene:'classroom', once:true, weight:80, when:()=>Y(2,1)&&B('w4','w6'),
    lines:[L('n','國際處辦了一場交換說明會。投影片上有二十幾間學校的名字。'),L('n','小語坐在你旁邊：「我大三一定要出去。」'),L('n','阿哲在後面：「出去要多少錢？」')],
    options:[
      { label:'認真聽完，回去查各校的條件', hint:'解鎖「準備交換申請」的方向', do:()=>{ G.exch.interested=true; setFlag('exch_interest'); G.player.skills.research+=1; return [L('n','你回宿舍把三間學校的申請條件抄下來：成績、語言、讀書計畫。每一項都要提早準備。')]; } },
      { label:'聽一半就走', do:()=>{ G.exch.interested=false; return [L('n','你想，先把眼前的課讀好再說。這個想法沒有錯，但你之後偶爾會想起那張投影片。')]; } },
    ]},
  { id:'y2_an_decide', title:'小安的決定', scene:'library', once:true, weight:60, when:()=>Y(2)&&B('w10','w12')&&G.npcs.an.met,
    lines:[L('an','我決定了，大三開始去補習班。'),L('an','司法官的一試我想大四直接考一次，先看看考場長什麼樣子。'),L('n','她說得很平靜，像在講明天的天氣。')],
    options:[
      { label:'「我陪你去補習班看看。」', do:()=>{ addRel('an',6); G.player.money-=200; return [L('n','補習班的走廊貼滿榜單。你看了一下價目表，決定先不看。')]; } },
      { label:'「你確定嗎？」', do:()=>{ addRel('an',1); return [L('an','不確定。但我知道我想做這個。'),L('n','你想，能這樣講的人不多。')]; } },
    ]},
  { id:'y3_intern_offer', title:'學姊的訊息', scene:'campus', once:true, weight:90, when:()=>Y(3)&&B('w2','w4')&&F('sis_trust'),
    lines:[L('sis','我們所這學期要找一個工讀生，主要是查資料跟整理卷。'),L('sis','薪水不高，但你可以看到案子怎麼做。有興趣嗎？')],
    options:[
      { label:'去', hint:'「事務所實習」的效果更好', do:()=>{ G.internBoost=true; setFlag('intern_firm'); addRel('sis',6); return [L('n','第一天你影印了三百頁，然後看了一份起訴狀，看了三遍。')]; } },
      { label:'「這學期想專心讀書，謝謝學姊。」', do:()=>{ setFlag('refuse_job'); addRel('sis',-2); return [L('sis','好，之後有機會再說。'),L('n','你不確定「之後」是什麼時候。')]; } },
    ]},
  { id:'y3_zhe_intern', title:'阿哲的事務所', scene:'street', once:true, weight:60, when:()=>Y(3)&&B('w6','w10')&&G.npcs.zhe.met,
    lines:[L('zhe','我在一間小事務所打工，律師人很好，但東西很多。'),L('zhe','昨天他叫我把一個案子的卷整理出時間軸，我整理到半夜。'),L('zhe','然後我發現我好像喜歡這個。')],
    options:[ { label:'「那你要考國考嗎？」', do:()=>{ addRel('zhe',4); return [L('zhe','……不知道。大家都在考。'),L('n','他的表情跟大一講「分數剛好到」的時候不一樣了。')]; } },
      { label:'「喜歡就好。」', do:()=>{ addRel('zhe',6); return [L('n','他笑了一下。你們沒有再談國考。')]; } } ]},
  { id:'y3_court', title:'旁聽', scene:'court', once:true, weight:50, when:()=>Y(3)&&B('w8','w12','w14'),
    lines:[L('n','刑訴老師說「有空去法院坐一坐」。你去了。'),L('n','法庭比電視上小很多。被告站起來的時候，你發現他跟你差不多年紀。')],
    options:[ { label:'坐一整個下午', do:()=>{ setFlag('court_visit'); G.player.skills.judgment+=2; courseFx(pick(examCoursesNow()),{i:2}); return [L('n','你看到一個律師問證人問題，問法跟課本完全不一樣。回去的路上你一直在想那個問法。')]; } },
      { label:'看一件就走', do:()=>{ G.player.skills.judgment+=1; return [L('n','一件案子的準備程序，二十分鐘。你發現「程序」是一件很具體的事。')]; } } ]},
  { id:'y4_bar_anx', title:'大家都在考', scene:'library', once:true, weight:70, when:()=>Y(4)&&B('w4','w6','w10'),
    lines:[L('n','圖書館四樓，整層都是大四。每個人的桌上都是同一套書。'),L('zhe','我有時候會想，我到底是想考，還是不敢不考。'),L('an','都一樣。先讀。')],
    options:[ { label:'「先讀。」', do:()=>{ G.player.stress+=2; return [L('n','你們三個人低頭。翻頁聲很整齊。')]; } },
      { label:'「阿哲，你不考也可以。」', do:()=>{ addRel('zhe',6); G.player.skills.judgment+=1; return [L('zhe','……你是第一個這樣說的。'),L('n','小安沒有抬頭，但你看到她點了一下頭。')]; } } ]},
  { id:'y4_grad', title:'畢業前', scene:'campus', once:true, weight:100, when:()=>Y(4,2)&&B('w16'),
    lines:[L('n','畢業前最後一週。學士服的租借表貼在系辦門口。'),L('kai','你們法律系畢業以後真的都要考試喔？'),L('you','不一定。'),L('kai','那你呢？'),L('n','你想了一下。')],
    options:[ { label:'「我還在想。」', do:()=>[L('n','阿凱說：「想好了跟我說，我公司搞不好需要法務。」他是認真的。')] },
      { label:'「先考考看。」', do:()=>[L('n','阿凱點頭：「那考完跟我說。」你們把學士服的表填了。')] } ]},
];
function examCoursesNow(){ return (G.enrolled||[]).filter(c=>COURSES[c].exam); }

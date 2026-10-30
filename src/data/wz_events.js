/* ===== 溫州街四條故事線＋單一事件（DL-11；USER_WANTS B05）=====
   台詞：AA_420（企劃線 7a646909，AA-B 2026-10-23，D109：AA 定稿）第 3～8 節；沒寫到的照 AA_167（腳本）、BB_148（學姊、子晴、芷若、沛珊；第 1～6 節、8b、8c-2 照 AA_420 第 8 節）、
   AA_164（WZ-T3）。法律內容照 BB_148 第 8、8d 節（本檔不新增法律判斷）。台詞一字不改；「X：「……」」的那種一句拆成說話的人＋字，動作和引號混在一起的照原文當旁白。
   什麼時候演、演完觸發什麼（關係、旗標、筆記、房間物件、手機）在 src/wzlines3d.js（WZL）；這裡只有事件本身（trigger:'manual'／'outing'／clubEvent，由 WZL 叫）。
   事件 id：線一 ev_wz_c2、ev_wz_c_lease1～4（4m＝搬走）、ev_wz_c7a～c、ev_wz_c_apeng、ev_wz_c_camp；線二 ev_wz_t2a、ev_wz_t_map、ev_wz_t2b、ev_wz_t_study、ev_wz_t2c；
   線三 ev_wz_b2、ev_wz_b_ins、ev_wz_b_ins2、ev_wz_b_ins_self、ev_wz_b_back、ev_wz_b_home（沒幫忙的那一條）；線四 ev_wz_p_lost、ev_wz_p_found、ev_wz_p_back（4-4）；
   單一事件 ev_wz_b3、ev_wz_b4、ev_wz_c3、ev_wz_c4、ev_wz_c5、ev_wz_c6、ev_wz_c6_show、ev_wz_t3、ev_wz_t4、ev_wz_t5、ev_wz_p1、ev_wz_p3、ev_wz_p4、ev_wz_p4_class、ev_wz_p5、ev_wz_bh_group。
   背景：店裡、公園、萬才館一樓＝3D（'blur'）；營隊＝camp_school；萬才館研討室 A＝wancai_seminar；社科院的走廊（還沒有圖）＝先用社科院門口 ntu_soc；考古題讀書會＝soc_library。 */
'use strict';
const WZ_EVENTS=(function(){
  const W=()=>typeof WZL!=='undefined'?WZL:null;
  const C=f=>({custom:G=>{ const w=W(); return !!w&&!!f(w,G); }});
  const N=t=>({speaker:null,text:t});
  const ZHE='zhe', YU='yu', AN='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', BH='classmate_bohan', XC='classmate_xinci', PS='classmate_peishan';
  const ev=(id,title,o)=>Object.assign({id,title,participants:[],location:'any',trigger:'manual',once:true,background:'blur'},o);
  const L=[];

  /* ========== 線一：店要搬了（阿德影印）========== */
  /* 1-1 整本教科書（AA_167；打工第 3 班以後）*/
  L.push(ev('ev_wz_c2','整本教科書',{ dialogue:[ N('櫃台上放著一本很厚的書，還沒拆封。'),
    {speaker:'別系的學生',text:'這本，三十份。我們班要用。可以快一點嗎？'},
    {choice:[{text:'「好，我開機器。」',goto:'a'},{text:'「整本的好像不行。」',goto:'b'},{text:'「我問一下老闆。」',goto:'c'}]},
    {label:'a'},N('阿德從後面走出來，把書推回去：「整本的不印。」他指了指牆上那張紙：「本店不影印整本書」。學生「喔」了一聲，把書收走。阿德對你說：「你明天自己想一下，為什麼。」'),{goto:'end'},
    {label:'b'},{speaker:'別系的學生',text:'那我印兩章？'},N('你看了阿德一眼。'),{speaker:'阿德',text:'兩章，合不合理，要看他拿去做什麼、印多少。他要想，我們印的人也要想。'},{goto:'end'},
    {label:'c'},{speaker:'阿德',text:'你自己說，為什麼不行？'},
    {unless:C((w,G)=>w.ipW4(G)),speaker:'player',text:'……我說不太出來。'},{unless:C((w,G)=>w.ipW4(G)),speaker:'阿德',text:'那你回去查。查到了告訴我。'},
    {if:C((w,G)=>w.ipW4(G)),speaker:'player',text:'書是別人寫的。整本印給三十個人，就是替他把書賣了，可是錢沒有給他。'},{if:C((w,G)=>w.ipW4(G)),speaker:null,text:'阿德點頭：「這句我抄下來。」'},
    {label:'end'},{note:{id:'NOTE_COPY_FAIR',title:'整本書能不能印',body:''}} ] }));
  /* 1-2 房東的信（AA_420 3-1：大二上第 6～10 週，影印店的班）*/
  L.push(ev('ev_wz_c_lease1','房東的信',{ dialogue:[ N('十點前，客人都走了。阿德坐在櫃台後面，手上一封信，看了很久。'),
    {speaker:'阿德',text:'房東說，明年租約到了，要漲三成。不然就不續了。'},
    {speaker:'阿德',text:'我在這裡十四年了。我只會影印，不會看這種東西。'},
    {speaker:'阿芃',name:'阿芃（在角落寫功課，沒有抬頭）',text:'爸，你可以問他啊。他是法律系的。'},
    {speaker:'阿德',text:'他才大二。'},
    {choice:[{text:'「我還看不懂。可是B館週六有法服，學長姐會幫人看。我可以陪你去。」',set:{WZ_COPY_LEASE:1},goto:'y'},{text:'「我也不太懂。」',goto:'n'}]},
    {label:'y'},{speaker:'阿德',text:'……要錢嗎？'},{speaker:'player',text:'不用。'},{speaker:'阿德',text:'那我去。'},{goto:'end'},
    {label:'n'},{speaker:'阿德',text:'沒關係。我自己再想想。'},
    {label:'end'},{stamp:['WZ_C_L1']} ] }));
  /* 1-3 第一次初談（AA_420 3-2：學姊不在法服；加入法服的玩家＝柏翰那兩句；沒加入的＝「你坐在阿德旁邊」）*/
  L.push(ev('ev_wz_c_lease2','第一次初談',{ location:'wancai', dialogue:[ N('法律系館B一樓。阿德穿了一件燙過的襯衫，手上那個信封被他捏得有點皺。'),
    {speaker:'研究所學長',text:'您好，請坐。今天想問什麼？'},
    {speaker:'阿德',text:'我的店……房東說要漲租。'},
    N('學長沒有馬上說要怎麼辦。他先問：租約什麼時候簽的？寫了幾年？有沒有寫續約和漲租的方式？房東是用什麼方式通知的？'),
    {if:C((w,G)=>w.fafuMember(G)),speaker:null,text:'你坐在旁邊做紀錄。阿德每回答一題，就看你一眼，好像在確認你有寫。'},
    {unless:C((w,G)=>w.fafuMember(G)),speaker:null,text:'你坐在阿德旁邊。阿德每回答一題，就看你一眼，好像在確認你有寫。'},
    {if:C((w,G)=>w.fafuMember(G)),speaker:null,text:'柏翰在隔壁桌整理紀錄表。他看到阿德手上的信封，起來拿了一張空白的給你。'},
    {if:C((w,G)=>w.fafuMember(G)),speaker:BH,text:'你帶來的？……先寫日期，再寫他的名字。'},{if:C((w,G)=>w.fafuMember(G)),rel:{[BH]:{fam:1}}},
    {speaker:'研究所學長',text:'下次請您把租約正本、這封信、這幾年付租金的紀錄都帶來。我們再一起看。'},
    {speaker:'阿德',text:'……好。我以為今天就會知道答案。'},
    {speaker:'研究所學長',text:'先把事情弄清楚，答案才會準。'},
    N('走出法律系館B，阿德說：「你們的學長，講話跟我們印論文一樣。先對齊，再裝訂。」'),
    {set:{WZ_COPY_LEASE:2},stamp:['WZ_C_L2']} ] }));
  /* 1-4 第二次初談（AA_167；說話的研究所學姊照 AA_420 3-2 現場的人＝雅筑學姊）*/
  L.push(ev('ev_wz_c_lease3','第二次初談',{ location:'wancai', dialogue:[ N('阿德帶了一個資料夾，每一張都用迴紋針夾好，按日期排。'),
    {speaker:'雅筑學姊',text:'您整理得很好。'},
    {speaker:'阿德',text:'我們做影印的，就是會整理。'},
    N('學長姐和阿德一頁一頁看租約。他們告訴他可以怎麼和房東談，哪些地方要先寫下來、留紀錄，談不攏的時候還可以去哪裡。'),
    N('你把學長姐說的重點寫在一張便條紙上。阿德看了一眼，你又重寫一次，字寫得更大。'),
    {speaker:'阿德',text:'這張我貼在機器旁邊。'},
    {set:{WZ_COPY_LEASE:3},stamp:['WZ_C_L3']} ] }));
  /* 1-5 結果：留下來（AA_420 3-3）／搬走（AA_167）*/
  L.push(ev('ev_wz_c_lease4','本店續約三年',{ dialogue:[ N('玻璃門上的價目表旁邊，多了一張手寫的紙：「本店續約三年。感謝大家。」'),
    {speaker:'阿德',text:'房東說漲一成就好。我照學長說的，一條一條談，談完寫下來。'},
    {speaker:'阿德',text:'我們法律系的，果然不只會印考古題。'},
    {speaker:'阿芃',text:'爸，你剛剛說「我們法律系」。'},
    {speaker:'阿德',text:'……我說錯了。'},
    {set:{WZ_COPY_SHOP:'stay'}} ] }));
  /* 搬走的版本（AA_167；開場旁白照 AA_420 12-1：不露出店位編號）*/
  L.push(ev('ev_wz_c_lease4m','本店已遷至轉角',{ dialogue:[ N('（影印店原本那一間的鐵捲門拉下來了，上面貼著「本店已遷至轉角」。轉角那間店面比原來小一半，玻璃門上的價目表一樣貼得滿滿的。）'),
    {speaker:'阿德',text:'小一點，也是一間店。機器還是那幾台。'},
    {set:{WZ_COPY_SHOP:'moved'}} ] }));
  /* 1-6 之前：阿芃的三個問題（WZ-C7；第 2、5、9 班；AA_165 2-7，第 3 題照 AA_420 2-4）*/
  const APENG=(id,i)=>{ const D=()=>typeof WZ_JOBS_DATA!=='undefined'?WZ_JOBS_DATA.copy.apeng[i]:{}; const q=D();
    const out=[{speaker:'阿芃',text:q.q}];
    if(i<2) out.push({unless:C((w,G)=>w.year(G)>=2),speaker:'player',text:q.y1},{if:C((w,G)=>w.year(G)>=2),speaker:'player',text:q.y2},{speaker:'阿芃',text:q.next});
    else { out.push({if:C((w,G)=>w.ipW4(G)),speaker:'player',text:q.ip},{unless:C((w,G)=>w.ipW4(G)),speaker:'player',text:q.no});
      for(const k of ['Y1','Y2','Y3','Y4','Y5']) out.push({if:C((w,G)=>w.grade(G)===k),speaker:'阿芃',text:q.next.replace('{年級}',WZ_JOBS_DATA.copy.grade[k])}); }
    return ev(id,'阿芃的問題',{dialogue:out}); };
  if(typeof WZ_JOBS_DATA!=='undefined'){ L.push(APENG('ev_wz_c7a',0),APENG('ev_wz_c7b',1),APENG('ev_wz_c7c',2)); }
  /* 1-6 阿芃的第三個問題之後（AA_420 3-3）*/
  L.push(ev('ev_wz_c_apeng','絕版的書那題',{ dialogue:[ {speaker:'阿芃',text:'你想好了嗎？絕版的書那題。'},
    {choice:[{text:'「還沒。」',goto:'n'},{text:'「想好了。」',if:C((w,G)=>w.ipW4(G)),goto:'y'}]},
    {label:'n'},{speaker:'阿芃',text:'沒關係。我自己去查。'},{goto:'end'},
    {label:'y'},{speaker:'player',text:'絕版不代表可以整本印。只是對市場影響比較小，其他的還是要一起看。'},{speaker:'阿芃',text:'……所以還是要看情形。'},
    {label:'end'},{speaker:'阿芃',text:'我以後要念法律。我爸還不知道。'},
    {speaker:'阿德',name:'阿德（在櫃台後面）',text:'我聽到了。'},
    {set:{WZ_APENG_LAW:true}} ] }));
  /* 1-7 營隊裡的阿芃（AA_420 3-3：C02 法律生活營，大三升大四的暑假 7/2 下午；國小組那一段拿掉）*/
  L.push(ev('ev_wz_c_camp','營隊裡的高一生',{ background:'dark', dialogue:[ {scene:'營隊・案例討論',bg:'camp_school'},
    N('營隊第二天下午，高中組的案例討論分組。坐在最後一排、名牌上只寫一個「芃」字的女生舉手。'),
    {speaker:'阿芃',text:'如果法律沒有寫，法官要怎麼判？'},
    N('你認出她的聲音。她也認出你，對你眨了一下眼睛，假裝不認識。'),
    {choice:[{text:'「民法第一條。」',goto:'a'},{text:'「妳覺得呢？」',goto:'b'}]},
    {label:'a'},{speaker:'阿芃',text:'……我知道。我是在考你。'},{goto:'end'},
    {label:'b'},{speaker:'阿芃',text:'我覺得要看習慣。……可是習慣是誰的習慣？'},N('全組安靜了五秒。'),
    {label:'end'},{stamp:['WZ_CAMP_APENG']} ] }));

  /* ========== 線二：呂老師的房子（一盞茶屋）========== */
  L.push(ev('ev_wz_t2a','那條大路',{ dialogue:[ N('呂老師每週六下午坐在緣側最邊邊的位子。今天他叫住你。'),
    {speaker:'呂老師',text:'年輕人，你知道這條街，以前是一整條嗎？'},
    {speaker:'呂老師',text:'我小時候住在這一排。從這裡走到街尾，一路都是同一條街。'},
    {speaker:'呂老師',text:'那年開了一條大路。我家門口突然變成另一條街的尾巴。'},
    {choice:[{text:'「老師的家還在嗎？」',goto:'a'},{text:'「那條路是什麼時候開的？」',goto:'b'}]},
    {label:'a'},{speaker:'呂老師',text:'房子還在。地，就不知道算誰的了。'},N('他笑了一下，不再說。'),{goto:'end'},
    {label:'b'},{speaker:'呂老師',text:'我念高中的時候。挖土機開進來那天，我媽在門口站了一整個下午。'},
    {label:'end'},{set:{WZ_YE:1}} ] }));
  L.push(ev('ev_wz_t_map','舊地圖',{ dialogue:[ N('週六下午，你把那本舊地圖集帶到茶屋。紙很脆，翻的時候要很小心。'),
    N('呂老師戴上老花眼鏡，手指沿著一條線慢慢走。'),
    {speaker:'呂老師',text:'這裡。……這一間。'},
    {speaker:'呂老師',text:'那時候門牌是這條街的。現在，是另一條街的了。'},
    N('他看了很久，沒有說話。蘇姨端了一壺新的茶過來，也沒有說話。'),
    {speaker:'呂老師',text:'這本地圖，你在哪裡買的？'},
    {speaker:'player',text:'公園的二手市集。'},
    {speaker:'呂老師',text:'……原來它一直在附近。'},
    {set:{WZ_YE_MAP:true},inc:{WZ_LU_FAM:3}} ] }));
  L.push(ev('ev_wz_t2b','登記過三次',{ dialogue:[ {speaker:'呂老師',text:'你們現在念到哪裡了？'},
    {speaker:'player',text:'物權。買賣不動產，要登記才算數。'},
    {speaker:'呂老師',text:'登記。'},N('他把茶杯放下。'),
    {speaker:'呂老師',text:'這房子底下的地，登記過三次。三次都不是我們家去登記的。'},
    {speaker:'呂老師',text:'我爸那一輩，說那是我們家的地。後來有一次總登記，我們家沒趕上。從那以後，簿子上寫的就是國家。'},
    N('你想起物權課那句「買房子要登記才算你的」。老師在黑板上寫得很理所當然。'),
    {choice:[{text:'「老師，我可以幫你看看資料嗎？我一個人看不懂，可是我認識會看的人。」',set:{WZ_YE:2},goto:'y'},{text:'「這我還不懂。」',goto:'n'}]},
    {label:'y'},{speaker:'呂老師',text:'……好。我家裡有一個鐵盒子，我都沒打開過。'},{goto:'end'},
    {label:'n'},{speaker:'呂老師',text:'沒關係。這種事，懂的人也很少。'},
    {label:'end'},{stamp:['WZ_T2B_DAY']} ] }));
  /* 2-4 公法讀書會的真案子（AA_420 4-2：萬才館研討室 A、Alison、九點半）：公法讀書會那一晚的事件（classes3d.js clubEvent）*/
  L.push(ev('ev_wz_t_study','讀書會的真案子',{ participants:[AN,YU], clubEvent:'public_law_group', background:{image:'assets/bg/wancai_seminar.webp'},
    term:['Y3S1','Y3S2','Y4S1','Y4S2'], prereq:{custom:G=>(+((G.flags||{}).WZ_YE)||0)===2},
    dialogue:[ N('週四晚上，法律系館B 研討室 A。以安、Alison，還有兩個你不熟的同學。桌上是呂老師那個鐵盒子裡的東西：一疊發黃的紙。'),
    {speaker:AN,text:'好。那你先說，這件事的時間線。'},
    N('你照呂老師說的講了一遍。以安在白板上畫了一條線。'),
    {speaker:YU,text:'欸等一下，日治的時候有登記，戰後又要重新登記一次？那沒趕上的人怎麼辦？'},
    {speaker:AN,text:'這就是問題。'},
    {speaker:YU,text:'可是這樣不公平吧！'},
    {speaker:AN,text:'不公平要說得出理由。理由在這疊紙裡。'},
    N('三個人把每一張紙依日期排好，寫在白板的時間線上。九點半，管理員來敲門。'),
    {if:{flags:['WZ_YE_MAP']},speaker:null,text:'以安指著那本地圖：「這張地圖很有用。哪裡來的？」'},{if:{flags:['WZ_YE_MAP']},speaker:'player',text:'公園的二手市集。'},{if:{flags:['WZ_YE_MAP']},speaker:AN,text:'……你很會逛。'},
    N('以安收白板的時候，把時間線拍了三張照片。'),
    {speaker:AN,text:'我們不幫他打官司。我們幫他整理到，他知道該問誰、怎麼問。'},
    {set:{AN_YE_STUDY:true},stamp:['WZ_YE_STUDY_DAY'],rel:{[AN]:{trust:3,comf:1},[YU]:{fam:2}}} ] }));
  /* 2-6 呂老師要搬走（AA_167；美國路線大四下多兩句 AA_420 4-3）*/
  L.push(ev('ev_wz_t2c','呂老師要搬走',{ dialogue:[ N('呂老師的位子上，多了一個紙箱。'),
    {if:C((w,G)=>w.usLate(G)),speaker:'呂老師',text:'回來了。我本來上個月就要搬。'},{if:C((w,G)=>w.usLate(G)),speaker:'呂老師',text:'想說，等你回來喝一杯再走。'},
    {speaker:'呂老師',text:'我要搬去女兒家了。她說我一個人住，她不放心。'},
    {if:{flags:['AN_YE_STUDY']},speaker:'呂老師',text:'家裡照你們整理的那張時間表，請了律師幫忙，向國家請求把登記改回來。結果還沒出來。'},
    {if:{flags:['AN_YE_STUDY','WZ_YE_HINT']},speaker:'呂老師',text:'律師看了說，整理得很清楚，從最早的那一份開始。'},
    {if:{flags:['AN_YE_STUDY']},speaker:'呂老師',text:'不管結果怎樣，至少現在我知道，該問誰、怎麼問。以前我連要問什麼都不知道。'},
    {if:{flags:['AN_YE_STUDY']},set:{WZ_YE_DONE:true}},
    {unless:{flags:['AN_YE_STUDY']},speaker:'呂老師',text:'那塊地的事，我想就這樣吧。我女兒說，人比地重要。'},
    N('呂老師把他常用的那個茶杯交給蘇姨：「放這裡，它比較習慣。」'),
    {speaker:'呂老師',name:'呂老師（對你）',text:'以後換你坐這個位子。泡得不好喝也沒關係。'},
    {set:{WZ_LU_GONE:true}} ] }));

  /* ========== 線三：熟客太太（半熟早午餐）========== */
  L.push(ev('ev_wz_b2','只有太太',{ dialogue:[ N('騎樓第二桌，只有一個人。'),
    {speaker:'林太太',text:'今天只要一份。另一份外帶。'},
    {speaker:'林太太',text:'他住院了。醫生說，吃得下就好。'},
    {choice:[{text:'「有需要幫忙的地方嗎？」',set:{WZ_BRUNCH_HELP:true},goto:'y'},{text:'「祝他早日康復。」',goto:'n'}]},
    {label:'y'},{speaker:'林太太',text:'……現在還不知道。謝謝你。'},{goto:'end'},
    {label:'n'},{speaker:'林太太',text:'我會跟他說。他會說『小老闆很會講話』。'},
    {label:'end'},{stamp:['WZ_B2_DAY']} ] }));
  L.push(ev('ev_wz_b_ins','保險公司的信',{ dialogue:[ N('收尾的時候，林太太還沒走。她從包包裡拿出一疊信，用橡皮筋綁著。'),
    {speaker:'林太太',text:'這些字，我看不懂。保險公司說，有一項不能賠。'},
    {speaker:'林太太',text:'我不想吵架。我只是想知道，為什麼。'},
    {choice:[{text:'「B館週六上午有法服，學長姐會幫人看。我可以陪妳去。」',set:{WZ_BRUNCH_INS:1},goto:'y'},{text:'「我回去幫妳查查看。」',set:{WZ_BRUNCH_SELF:true},goto:'end'}]},
    {label:'y'},{speaker:'林太太',text:'你們學校的學生，週六早上還要做這個？'},{speaker:'player',text:'有人要做。'},
    {if:C((w,G)=>w.brunchSat(G)),speaker:'小米姐',name:'小米姐（在廚房，聽到了）',text:'那天的班你不用來。蛋我煮。'},
    {label:'end'},{stamp:['WZ_B_INS_DAY']} ] }));
  L.push(ev('ev_wz_b_ins2','法服的那個上午',{ location:'wancai', dialogue:[ N('法律系館B一樓。林太太把信一封一封攤開，排得很整齊。'),
    {speaker:'雅筑學姊',text:'您先說說，先生住院前後，保險是什麼時候買的？當初填資料的時候，有沒有被問到什麼？'},
    N('林太太講到一半，停下來，看著桌面。'),
    N('你坐到她旁邊，把一杯溫水推過去，什麼都沒說。'),
    {speaker:'林太太',text:'……謝謝。'},
    N('雅筑學姊請她回去找出當初的要保書和健康告知的那一頁，下次再來。'),
    {set:{WZ_BRUNCH_INS:2},stamp:['WZ_B_HELP_DAY']} ] }));
  L.push(ev('ev_wz_b_ins_self','自己查',{ dialogue:[ N('那天晚上你查到兩點。條文看得懂，可是那封信上的每一句，對不上你查到的任何一條。'),
    N('下一個週末班，你把查到的寫在一張紙上給她。說到一半，你自己也不確定了。'),
    {speaker:'林太太',text:'你查了一整晚吧。……謝謝你。我拿去給我女兒看。'},
    {note:{id:'NOTE_INS_CLAUSE',title:'林太太的保險',body:''},stamp:['WZ_B_HELP_DAY']} ] }));
  L.push(ev('ev_wz_b_back','回來吃早午餐',{ dialogue:[ N('騎樓第二桌，兩個人。'),
    {speaker:'先生',text:'我說了，我會回來吃。'},
    {speaker:'先生',text:'小老闆，全熟。'},
    N('林太太把一張手寫的卡片放在桌上，推到你面前：「給你的。」'),
    {speaker:'小米姐',name:'小米姐（在廚房）',text:'他們說下次要帶孫子來。……我去找一張兒童椅。'},
    {set:{WZ_CARD:true,WZ_BRUNCH_BACK:'card'}} ] }));
  /* 沒幫忙的那一條（AA_420 第 5 節：第 10 班，先生回來吃；沒有卡片）*/
  L.push(ev('ev_wz_b_home','先生回來吃',{ dialogue:[ {speaker:'先生',text:'我說了，我會回來吃。'},{speaker:'先生',text:'小老闆，全熟。'},{set:{WZ_BRUNCH_BACK:'plain'}} ] }));

  /* ========== 線四：貓不見的那一週（小公園；AA_420 第 6 節：大三上第 10 週）========== */
  L.push(ev('ev_wz_p_lost','走失單',{ dialogue:[ N('公布欄上多了一張紙，三個名字都寫了：「走失：所長／麻糬／常客。橘白色，很胖。」'),
    {speaker:'象棋阿伯',text:'牠三天沒來巡公園了。'},
    {speaker:'阿伯',text:'所長不在，我們下棋都不專心。'},
    {stamp:['WZ_CAT_LOST']} ] }));
  L.push(ev('ev_wz_p_found','在茶屋的院子',{ dialogue:[ N('緣側下面，一團橘白色的東西在動。'),
    N('蘇姨拿著一個小碗走出來：「牠前幾天腳受傷，我讓牠在這裡養。忘了跟公園說。」'),
    {speaker:'蘇姨',text:'你們找了很久吧。'},
    {if:{flagIs:{WZ_CAT_WITH:AN}},speaker:AN,text:'……牠只是想休息。'},{if:{flagIs:{WZ_CAT_WITH:AN}},speaker:null,text:'她蹲下來看了很久，「這次的結論，我接受。」'},
    {if:{flagIs:{WZ_CAT_WITH:YT}},speaker:null,text:'語彤拍了一張，沒有給你看。'},{if:{flagIs:{WZ_CAT_WITH:YT}},speaker:YT,text:'……這張，留著。'},
    {if:{flagIs:{WZ_CAT_WITH:YU}},speaker:YU,text:'欸牠好胖！所以牠是受傷，還是太胖跳不上牆？'},{if:{flagIs:{WZ_CAT_WITH:YU}},speaker:'蘇姨',text:'受傷。'},
    {if:{flagIs:{WZ_CAT_WITH:ZQ}},speaker:ZQ,text:'牠在這裡度假。比我們會過日子。'},
    N('第二天，公布欄的走失單換成一張新的紙：「已找到，謝謝大家。——里長」'),
    /* 芷若在倫敦（BB_148 8c-2）：拍一張照片傳給她 */
    {if:C((w,G)=>w.zrPhoto(G)),choice:[{text:'（拍一張照片傳給芷若）',goto:'zr'},{text:'（不傳）',goto:'end'}]},{goto:'end'},
    {label:'zr'},{phoneMe:ZR,text:'📷（緣側下面，一團橘白色）'},{phone:ZR,text:'常客瘦了。……幫我跟牠說，我下學期回去。'},{set:{CAT_SEARCH_WITH_heroine_02:true},rel:{[ZR]:{fam:1,comf:1}}},
    {label:'end'},{stamp:['WZ_CAT_FOUND']} ] }));
  L.push(ev('ev_wz_p_back','所長回來了',{ dialogue:[ N('所長回來了，前腳纏著一圈繃帶，躺在樹下的圓椅上，和平常一樣不理人。'),{stamp:['WZ_CAT_BACK']} ] }));   /* AA_493 第 3 節：句子不改，演這一場時貓固定趴在圓椅上（wzlines3d.js 呼叫 WZCAT.hold('lie')，不管幾點）*/

  /* ========== 第 5 節的單一事件 ========== */
  /* WZ-B3 麵店團來看他穿圍裙（AA_420 7-1）*/
  L.push(ev('ev_wz_b3','麵店團',{ participants:[ZHE], dialogue:[ N('門口的鈴響了五次。阿哲、Alison、以安、柏翰、芯慈，一個接一個走進來。'),
    {if:{flags:['ZHE_CALLS_GE']},speaker:ZHE,text:'哥！你真的穿圍裙！'},{unless:{flags:['ZHE_CALLS_GE']},speaker:ZHE,text:'{name}！你真的穿圍裙！'},
    {speaker:ZHE,text:'我以為你騙我們。……拍照拍照。'},
    {speaker:YU,text:'欸他真的會端盤子！我以為他會把蛋打在地上。'},
    {speaker:BH,text:'五個人。四人桌加一張椅子就好。'},
    {speaker:XC,text:'謝謝你。不用急。'},
    N('以安點了一份，看了你端盤子一會兒。'),
    {speaker:AN,text:'你端得很穩。'},
    {if:C((w,G)=>w.oddSunday(G)),speaker:YU,text:'對了，語彤說她今天要去拍照，叫我們拍你給她看。'},
    {set:{NOODLE_SAW_APRON:true},rel:{[ZHE]:{fam:2},[YU]:{fam:2},[AN]:{fam:2},[BH]:{fam:2},[XC]:{fam:2}}} ] }));
  /* WZ-B4 早午餐：學姊和研究所同學（BB_148 第 1 節＋AA_420 8-1）*/
  L.push(ev('ev_wz_b4','學姊和研究所同學',{ participants:[SIS], once:false, dialogue:[ N('九點，門上的鈴響了。學姊和一個女生走進來，坐靠窗的兩人桌。兩個人的包包裡都是書。'),
    {if:C((w,G)=>w.rel(G,SIS)==='a'),speaker:SIS,text:'學弟。'},{if:C((w,G)=>w.rel(G,SIS)==='a'),speaker:null,text:'（她點了兩份今日推薦。）'},
    {if:C((w,G)=>w.rel(G,SIS)==='f'),speaker:SIS,text:'學弟？你在這裡打工喔。'},
    {if:C((w,G)=>w.rel(G,SIS)==='F'),speaker:SIS,text:'{name}？你在這裡打工喔。'},
    {unless:C((w,G)=>w.rel(G,SIS)==='a'),speaker:'同學',text:'你直屬？'},{unless:C((w,G)=>w.rel(G,SIS)==='a'),speaker:SIS,text:'嗯。'},
    {speaker:SIS,text:'蛋要半熟。你們老闆說要幾分鐘？'},
    {choice:[{text:'「三分四十秒。」',if:C((w,G)=>w.b1Done(G)),goto:'a'},{text:'「我還不知道。」',unless:C((w,G)=>w.b1Done(G)),goto:'c'},{text:'「我去問。」',goto:'b'}]},
    {label:'a'},{speaker:SIS,text:'好。跟我想的一樣。'},{goto:'end'},
    {label:'c'},{speaker:SIS,text:'那你等一下就知道了。'},{goto:'end'},
    {label:'b'},{speaker:SIS,text:'好，麻煩你。'},
    {label:'end'},{speaker:SIS,text:'蛋剛好。……替我跟你們老闆說。'},
    {mem:[{npc:SIS,tag:'SIS_SAW_BRUNCH',note:'早午餐店：學弟在送餐'}],rel:{[SIS]:{fam:1}},set:{WZ_SIS_BRUNCH_FU:true}} ] }));
  /* WZ-C3 考古題小組（AA_167；柏翰最後一句照 AA_420 7-2）*/
  L.push(ev('ev_wz_c3','考古題小組',{ participants:[BH], dialogue:[ N('十點半，柏翰帶了四個人進來，每個人手上一個隨身碟。'),
    {speaker:BH,text:'三十份。雙面。膠裝。'},
    {speaker:BH,text:'這是我們自己寫的整理，不是別人的書。你可以放心印。'},
    N('你想起那本沒拆封的教科書。柏翰好像也記得：他把隨身碟交給你的時候，看了牆上那張紙一眼。'),
    {speaker:BH,text:'你考試週還在這裡？'},
    {speaker:BH,text:'下一次考試週，我們週二、週四晚上在社科圖。你要來就來。……我多印了一份，給你。'},
    {set:{BH_STUDY_GROUP:true},rel:{[BH]:{trust:3}}} ] }));
  /* WZ-C4 子晴的成發海報（BB_148 第 2 節；「認識」那一句照 AA_420 8-2）*/
  L.push(ev('ev_wz_c4','成發的海報',{ participants:[ZQ], dialogue:[ N('晚上八點，子晴抱著筆電推門進來。'),
    {if:C((w,G)=>w.rel(G,ZQ)==='a'),speaker:ZQ,text:'……你在這裡打工？'},{if:C((w,G)=>w.rel(G,ZQ)==='a'),speaker:ZQ,text:'A2 海報，十張。藍色要亮。'},
    {unless:C((w,G)=>w.rel(G,ZQ)==='a'),speaker:ZQ,text:'你在這裡打工？好，那你負責。'},{unless:C((w,G)=>w.rel(G,ZQ)==='a'),speaker:ZQ,text:'A2，十張。藍色要亮。'},
    N('（第一張印出來。）'),
    {speaker:ZQ,text:'這不是我的藍。我的藍比較亮。'},
    {choice:[{text:'「螢幕的藍和紙的藍不一樣。」',goto:'a'},{text:'「我覺得這張比較好看。」',goto:'b'}]},
    {label:'a'},{speaker:ZQ,text:'……我知道。我只是想聽有人說出來。那調亮一點。'},{goto:'end'},
    {label:'b'},{speaker:ZQ,text:'……好啦，有一點好看。只有一點。'},
    {label:'end'},
    {if:C((w,G)=>w.rel(G,ZQ)==='a'),speaker:ZQ,text:'謝了。'},
    {unless:C((w,G)=>w.rel(G,ZQ)==='a'),speaker:null,text:'她抽了一張放在櫃檯：「這張多印的，給你。……不是特別印給你的。」'},{unless:C((w,G)=>w.rel(G,ZQ)==='a'),set:{WZ_POSTER_ITEM:true}},
    {set:{WZ_ZQ_POSTER:true},rel:{[ZQ]:{fam:2}}} ] }));
  /* WZ-C5 學姊的論文（AA_420 8-3 整段換）*/
  L.push(ev('ev_wz_c5','學姊的論文',{ participants:[SIS], dialogue:[ N('晚上九點，學姊抱著一疊紙進來，放在工作檯上，先用手把紙邊敲齊。'),
    N('最上面貼了一張便利貼：「膠裝・五本」。'),
    {unless:C((w,G)=>w.rel(G,SIS)==='F'),speaker:SIS,text:'學弟。麻煩你。'},
    {if:C((w,G)=>w.rel(G,SIS)==='F'),speaker:SIS,text:'{name}。麻煩你。'},{if:C((w,G)=>w.rel(G,SIS)==='F'),speaker:SIS,text:'我剛剛在外面又翻了一遍。……其實已經改不了了。'},
    {if:C((w,G)=>w.rel(G,SIS)==='F'),choice:[{text:'「書背要寫什麼？」',goto:'a'},{text:'「口試加油。」',goto:'b'}]},{goto:'end'},
    {label:'a'},{speaker:SIS,text:'名字就好。題目太長，書背放不下。'},{goto:'end'},
    {label:'b'},{speaker:SIS,text:'謝謝。……這句我收下了。'},
    {label:'end'},N('二十分鐘後，五本論文排在工作檯上。她翻開第一本，看了很久。'),
    {if:C((w,G)=>w.rel(G,SIS)==='F'),speaker:SIS,text:'好。……原來拿在手上，是這個重量。'},
    {if:C((w,G)=>w.dating(G,SIS)),speaker:SIS,text:'你幾點下班？我在外面等。'},
    {set:{WZ_SIS_THESIS:true},rel:{[SIS]:{trust:2}}} ] }));
  /* WZ-C6 田野的照片（AA_167）＋走廊小展（選「很好看。」照 AA_420 7-3）*/
  L.push(ev('ev_wz_c6','田野的照片',{ participants:[YT], dialogue:[ N('語彤把一個信封放在櫃台上，裡面是二十張照片。'),
    {speaker:YT,text:'放大。再放大。'},
    {speaker:YT,text:'……手要看得到紋路。'},
    N('照片裡都是手：包麵的手、算錢的手、寫字的手。你看出其中一張，是阿鳳阿姨的手。'),
    {speaker:YT,text:'週五，社科院走廊。……你要來的話，五點以後。'},
    {stamp:['WZ_YT_PHOTO_DAY']} ] }));
  L.push(ev('ev_wz_c6_show','走廊小展',{ participants:[YT], trigger:'outing', background:'dark', hours:1, dialogue:[ {scene:'社科院・一樓的走廊',bg:'ntu_soc'},
    N('社科院一樓的走廊，二十張照片貼成一排。來的人不多。'),
    N('語彤站在最後一張前面。那一張是一雙年輕的手，在麵店的櫃台上寫菜單。'),
    {speaker:'player',text:'這是妳的手？'},
    {speaker:YT,text:'……嗯。'},
    {speaker:YT,text:'每個人都拍了別人。……最後一張，是我請阿姨幫我拍的。'},
    {choice:[{text:'「很好看。」',goto:'a'},{text:'（什麼都不說，站在旁邊看完）',goto:'b'}]},
    {label:'a'},{speaker:YT,text:'……我的手很粗。'},N('（她把手收到背後。）'),{goto:'end'},
    {label:'b'},{speaker:YT,text:'……你看得很慢。'},
    {label:'end'},{set:{YT_PHOTO_SHOW:true},rel:{[YT]:{trust:2,comf:2}}} ] }));
  /* WZ-T3 颱風後的院子（AA_164，照舊）*/
  L.push(ev('ev_wz_t3','颱風後的院子',{ once:false, dialogue:[ N('樟樹斷了一根枝，蘇姨和{name}一起清。'),{speaker:'蘇姨',text:'樹會自己長回來。人要幫它把斷的地方修乾淨。'},{set:{WZ_TEA_SEAT:true}} ] }));
  /* WZ-T4 學姊一個人來（BB_148 第 4 節＋AA_420 8-4）*/
  L.push(ev('ev_wz_t4','學姊一個人來',{ participants:[SIS], once:false, dialogue:[ N('學姊一個人進來，坐在緣側，把計畫本攤在膝上。你端茶過去的時候，她抬頭。'),
    {if:C((w,G)=>w.year(G)===2),speaker:SIS,text:'泡茶的時候不要看我。看水。'},
    {if:C((w,G)=>w.year(G)===3&&w.rel(G,SIS)!=='F'),speaker:SIS,text:'學弟。這壺水要多燙？……我在學，你不用緊張。'},
    {if:C((w,G)=>w.year(G)===3&&w.rel(G,SIS)==='F'),speaker:SIS,text:'{name}。這壺水要多燙？……我在學，你不用緊張。'},
    {if:C((w,G)=>w.year(G)===4),speaker:SIS,text:'這一杯泡得比較久。……剛好。'},
    {if:C((w,G)=>w.dating(G,SIS)),speaker:SIS,text:'你下班的時候，我還在。'},
    N('她在計畫本上寫了一行字，闔上，看院子看了很久。'),
    {set:{SIS_TEAHOUSE:true,WZ_SIS_TEA_FU:true},rel:{[SIS]:{comf:2}}} ] }));
  /* WZ-T5 以安和媽媽（AA_167）*/
  L.push(ev('ev_wz_t5','以安和媽媽',{ participants:[AN], dialogue:[ N('週六下午，門口的竹簾被掀開。以安走進來，後面跟著一位穿深色外套的女士。'),
    N('以安看到你在泡茶，停了一下。'),
    {speaker:AN,text:'媽，這是我同學。{name}。'},
    {speaker:'以安的媽媽',text:'你好。'},N('她坐下，看了看院子，「這裡很安靜。」'),
    N('你泡了一壺烏龍。以安一直看著你的手，好像在監考。'),
    N('以安的媽媽喝了一口：「水溫剛好。」'),
    N('她們聊了一個小時，沒有談工作，談的是以安小時候在台中的一棵樹。走的時候，以安的媽媽對你點了點頭。'),
    {set:{AN_MOM_TEA:true},stamp:['WZ_AN_MOM_DAY'],rel:{[AN]:{trust:3}}} ] }));
  /* WZ-P4 課輔班的孩子（BB_148 第 5 節，台詞不變；時間照 AA_420 8-5）＋6/25 的法律小教室 */
  L.push(ev('ev_wz_p4','課輔班的孩子',{ participants:[PS], dialogue:[ N('五點，沛珊帶著五、六個小孩走進公園。一個綁馬尾的小女生跑過來，盯著你看。'),
    {speaker:'小女生',text:'你就是沛珊姐姐說的那個法律系的？'},
    {speaker:'小女生',text:'我在溜滑梯下面撿到十塊錢。可以拿去買糖果嗎？'},
    {choice:[{text:'「要先找找看是誰掉的。」',goto:'a'},{text:'「十塊錢的話……還是要問問看。」',goto:'b'}]},
    {label:'a'},{speaker:'小女生',text:'找不到呢？'},{speaker:'player',text:'交給警察，或請管理的人幫忙找。'},{goto:'c'},
    {label:'b'},{speaker:'小女生',text:'問誰？'},{speaker:'player',text:'問大家，看是誰掉的。'},
    {label:'c'},{speaker:'小女生',text:'……那如果是我自己掉的呢？'},
    {speaker:PS,text:'那就是妳的。……妳剛剛是不是摸了口袋？'},
    N('（小女生跑回溜滑梯。）'),
    {speaker:PS,text:'她上週問我，法律管不管溜滑梯。我說，要問你。'},
    {stamp:['WZ_P4_DAY'],rel:{[PS]:{fam:2}}} ] }));
  L.push(ev('ev_wz_p4_class','法律小教室',{ participants:[PS], dialogue:[ N('（樹下排了一排小椅子。沛珊把一塊小白板靠在樹幹上。）'),
    {speaker:'小女生',text:'你是法律系的那個！十塊錢我交給管理員了。'},
    N('（你講了十分鐘：撿到東西要怎麼辦。講到一半，一個小男生舉手問，撿到的卡片算不算。）'),
    {speaker:PS,text:'她們會記得的。……至少會記得你。'},
    {stamp:['WZ_PS_CLASS'],rel:{[PS]:{comf:2}}} ] }));
  /* WZ-P5 夜裡的鞦韆（BB_148 第 6 節；交往中、大三兩句照 AA_420 8-6）*/
  L.push(ev('ev_wz_p5','夜裡的鞦韆',{ participants:[ZQ], once:false, dialogue:[ N('公園很暗，只有鞦韆旁那盞燈亮著。子晴坐在鞦韆上，膝上開著筆電，腳邊一袋宵夜。'),
    {speaker:ZQ,text:'這是我的辦公室。'},
    {if:C((w,G)=>w.p5First(G)&&w.rel(G,ZQ)==='f'&&!w.dating(G,ZQ)),speaker:ZQ,text:'鞦韆盪一下，bug 就會掉出來。……這是科學。'},
    {if:C((w,G)=>w.p5First(G)&&w.rel(G,ZQ)==='F'&&!w.dating(G,ZQ)),speaker:ZQ,text:'旁邊那個是會議室。你可以坐。不要盪太高，我會分心。'},
    {if:C((w,G)=>w.p5First(G)&&w.dating(G,ZQ)),speaker:ZQ,text:'你來剛好。幫我看這一行。……眼睛看螢幕。'},
    {if:C((w,G)=>w.p5First(G)&&w.year(G)===3),speaker:ZQ,text:'畢業專題還有 bug。我每天晚上來這裡，跟它們一個一個談。'},
    {speaker:ZQ,text:'我回去了。這個 bug，明天早上它自己會懂。'} ] }));
  /* WZ-P3 颱風後的早上（AA_427 第 2 節，企劃線 4d66231ab）：颱風假的隔天 08:00～11:00 進公園（WZL.p3Due）。幫忙的兩個選項＝1 小時、記 WZ_P3_HELPED（之後象棋有「讓你一隻馬」，src/wzpark3d.js）；
     「我還有事」＝不記。最後那句貓（{cat}）：貓不在的時候不播（WZL.p3Cat）*/
  L.push(ev('ev_wz_p3','颱風後的早上',{ once:false, dialogue:[ N('（颱風過了。公園的地上都是斷掉的樹枝，鞦韆的鐵鍊上掛著一大片葉子。涼亭的石桌倒了一張石凳。）'),
    N('（下象棋的三個阿伯今天沒有下棋。一個拿竹掃把，一個拿鋸子，一個在講電話叫里長。）'),
    {speaker:'阿伯',text:'年輕人，有空嗎？那根太重，我們三個抬不動。'},
    {choice:[{text:'「好，我來。」',goto:'a'},{text:'「我去借推車。」',goto:'b'},{text:'「我還有事。」',goto:'c'}]},
    {label:'a'},N('（你和阿伯一人一頭，把那根樹枝抬到路邊。比你想的重。）'),{speaker:'阿伯',text:'腰不要彎。用腳。'},{goto:'done'},
    {label:'b'},N('（你去里辦公處借了一台推車，來回四趟。）'),{speaker:'阿伯',text:'你從哪裡借到的？……好，下次也找你。'},{goto:'done'},
    {label:'c'},{speaker:'阿伯',text:'好，去忙。'},N('（他自己又試了一次，沒有抬起來。旁邊的阿伯過去幫他。）'),{goto:'end'},
    {label:'done'},N('（十點多，地上清得差不多了。石凳扶回去，棋盤擦乾，擺回石桌上。）'),
    {speaker:'阿伯',text:'你下棋很爛。搬樹枝很好。'},{speaker:'阿伯',text:'下次讓你一隻馬。'},
    {call:async(G,GM)=>{ const w=W(); if(w&&w.p3Cat) await w.p3Cat(G,GM); }},
    {stamp:['WZ_P3_HELPED']},{call:async(G,GM)=>{ if(GM&&GM.advance) GM.advance(1); }},
    {label:'end'} ] }));
  /* WZ-P1 第一次走進公園（AA_164 5-6；第一次在 08:00～11:00 進公園，WZL.parkTick）*/
  L.push(ev('ev_wz_p1','第一次走進公園',{ dialogue:[ {speaker:'下象棋的阿伯',text:'那隻貓有三個名字。阿伯叫牠所長，小孩叫麻糬，Café 那個女孩子叫牠常客。你想叫牠什麼都可以，牠都不會理你。'} ] }));
  /* 柏翰的考古題讀書會（AA_166 第 5 節：BH_STUDY_GROUP 以後每個考試週一次，一科準備 +2，AA_124 2-3）*/
  L.push(ev('ev_wz_bh_group','考古題讀書會',{ trigger:'outing', once:false, background:'dark', hours:2, dialogue:[ {scene:'社科院圖書館',bg:'soc_library'},
    {call:async(G,GM)=>{ const w=W(); if(w&&w.bhGroupPick) await w.bhGroupPick(GM); }} ] }));
  return L;
})();
Array.prototype.push.apply(STORY_EVENTS,WZ_EVENTS);

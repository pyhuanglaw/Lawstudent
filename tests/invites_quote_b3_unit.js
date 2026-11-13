// 有名字說的台詞拿掉外面的「」第三批（TEXT-QUOTE-UNIFY-1108，AA-B 2026-11-08 00:21／01:09）——不需要瀏覽器（D131）。第一、二批在 tests/invites_quote_unit.js。
// 規則：在對話框「有名字」說出來的（GM.say(who,…) who 不是 null、GM.caption(名字,…)）拿掉外面整句的一對「」，別的字一個都不改；
//   沒有名字的（toast、沒有名字的字幕、旁白（…）、「A」「B」好幾段、選項字、手機訊息、系統字）照留。
// 這一批的分類（誰讀 → 有沒有名字）：
//   src/data/termend_lines.js：說的話（字串＝那個人說，termend3d.js 的 run → GM.say(me,…)）本來就沒有「」；整句「」的 56 個字串全是選項字
//     （OPTS、ANSWER、answer、choice／KX_ASK／C14 opts／C15 opts 的 t、HOOK 的 ok → GM.choose）＝照留，這個檔不改
//   src/lane118.js：整句「」的 10 個字串全是 opts 的 t（GM.choose；選了以後店員、老闆娘說的 say 本來就沒有「」）＝照留，不改
//   src/sis_grad3d.js：S.DECLINE（4）、S.DECLINE_OFF（2）＝S.inviteCap 回的 lines → INV.flow 的 S.playLines(GM,who,…)；S.STUDY_YES（1）＝S.studyOffer 的 GM.say(who,…)、
//     invites.js 學姊 slowread 的 lines → S.playLines＝有名字，7 句拿掉；11 個 choice 的 text（GM.choose）照留
//   ACC0（一般那句答應）：src/offbeat_sys3d.js、src/mokuyobi_sys3d.js、src/gg2shops3d.js（afar、daybreak、yangyang、corner_records）＝包 INV.personal 的 lines → S.playLines＝有名字，6 句拿掉
//   程式自己在有名字的台詞外面包「」：story3d.js 腳踏車上下車字幕 GM.caption(nm,…)、第一次見面的自我介紹、「其實……」秘密、沒回訊息那一句（S.neededMiss）；
//     termend3d.js 沒去事務所那一句（S.meetLine）；cracktalk3d.js 小卡（{name:'小卡'}）；r2y4a3d.js、y2b3d.js 明信片（{name:'明信片'}）；
//     pool_more3d.js 一般的「其實……」（S.genericLine，照 story3d.js 原本那一句）＝都拿掉
//   照留：story3d.js 的 S.rideBlock（名字寫在字裡的「某某：「……」」，bike3d.js 用 GM.caption('',…) 或 toast＝沒有名字）、選項（'「'+o[0]+'」'、回寄明信片的選項）、手機訊息
// 檢查（BASE＝838db8710，拿掉「」以前）：
//   11. termend_lines.js、lane118.js 一字不差；整句「」的字串都是選項（說的話沒有一句外面有「」）
//   12. sis_grad3d.js、三個 ACC0：有名字的沒有外面的「」；和 BASE 逐句比只差外面的「」；S.narrLine（說的人）一樣；選項照留
//   13. 原始碼逐行比（第三批那一個 commit 0e08b4d4a 本身）：改到的行（註解以外）把前一版那一行外面的「」拿掉＝現在這一行（說話的人那個參數沒動）；每個檔改了幾行；名字寫在字裡的 rideBlock、選項照留
//   14. 演出來（另開 node，一次用 BASE 的檔、一次用現在的檔，pg_harness 載入遊戲）：腳踏車上下車字幕、第一次見面、秘密、一般的「其實……」、
//       沒回訊息那一句（needed_msgs 每一則）、沒去事務所、小卡、兩輪明信片、學姊婉拒／念書、ACC0——每一句說的人和 BASE 一樣、字只差外面的「」、現在沒有一句外面還有「」
// 修改前（BASE 的十個 src 檔換回來跑）：36 項 FAIL——12 的 3 項（還有「」、逐句比、sis_grad3d.js 剩 18 個）、13 的 3 項（改的行數、現在的寫法、還有 GM.say(who,'「'+…)）、
//   14 的 30 項（12 組每組兩項＋指定的 6 句）；11 的 6 項（這兩個檔本來就不改）和「說的人一樣」「讀的程式沒動」「跑得起來」照樣 PASS。用法：node tests/invites_quote_b3_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..'), BASE='838db8710';
const CHANGED=['src/sis_grad3d.js','src/offbeat_sys3d.js','src/mokuyobi_sys3d.js','src/gg2shops3d.js','src/story3d.js','src/termend3d.js','src/cracktalk3d.js','src/r2y4a3d.js','src/y2b3d.js','src/pool_more3d.js'];
/* 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版，故事照 AA_772 搬）：
   - src/lane118.js 整個檔照 AA_772 改寫了（H1～H9 搬店、熟客改讀資料、輪替、遷移），不能再和 838db8710 整檔比（舊期望：SAME 有 'src/lane118.js'、整檔一字不差）；
     改成直接驗這一項原本要守的事：這個檔沒有「有名字、又整句包在「」裡」的台詞（下面 11b）。
   - src/data/termend_lines.js：只多了 AA_772 的幾列（第 108、109 列＋note 帶的地點名）——比之前先把基準照白名單上的 AA_772 換過（tests/l118_redo772_expect.js，不手抄）。*/
const R772=require('./l118_redo772_expect.js');
const SAME=['src/data/termend_lines.js'];
const gitShow=f=>cp.execFileSync('git',['-C',ROOT,'show',BASE+':'+f],{encoding:'utf8',maxBuffer:1<<28});
const cur=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
/* 外面整句一對「」（「A」「B」這種好幾段的不算）——和 src/invites3d.js 的 S.unq 同一把尺 */
const wrapped=t=>{ if(typeof t!=='string'||t.length<2||t[0]!=='「'||t[t.length-1]!=='」') return false; let d=0; for(let i=0;i<t.length;i++){ const c=t[i]; if(c==='「') d++; else if(c==='」'){ d--; if(d===0&&i!==t.length-1) return false; } } return d===0; };
const unq=t=>wrapped(t)?t.slice(1,-1):t;
const narrLine=t=>/^（/.test(t)&&!/^（[^）]*小聲[^）]*）./.test(t)&&!/^（走出[^）]*）「/.test(t);   /* src/invites3d.js S.narrLine（第 14 項另外用遊戲裡那一支比）*/
const noComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');
const LIT=/'((?:[^'\\\n]|\\.)*)'/g;
/* 這一批以後劇情另外改的字（不是拿掉「」）：AA_593（學姊改稿①b，企劃線 6cbb0b4ab）第 8 列（學姊婉拒第四句）、第 64 列（心意版期末飯大四上那一句）——BASE 先照它換再比（第 11、12、14 項）*/
const LATER=[ /* （CANON-NO-ECON-1112 第四批：照 AA_897 第 2 節換字；舊字用 \u 寫，D158）*/
  ['src/data/termend_lines.js','之後\u653f\u5927、河堤輪流','之後外校、河堤輪流'],['src/data/termend_lines.js','\u653f\u5927正門 18:00','外校正門 18:00'],   /* CANON-NO-ECON-1112 ③：src 註解換成代號 */
  ['src/data/termend_lines.js',"table:'店長最近都讓我早一點下班。她什麼都沒問。'","table:'老闆最近都讓我早一點下班。他什麼都沒問。'"],   /* AA_947（企劃線 5d48cae98f）：芷若講 2:30 AM 的人「店長」統一成「老闆」、用「他」 */
  ['src/data/termend_lines.js',"'回來以後，店長把週五晚上的班排回給我。','……我沒說要。她就排了。'","'回來以後，老闆把週五晚上的班排回給我。','……我沒說要。他就排了。'"],   /* AA_947（源稿 AA_749_termend_gf_v2 同一句也是「他就排了」） */
  ['src/data/termend_lines.js','那天店長請她回來代一天班','那天老闆請她回來代一天班'],   /* AA_947：註解跟著改 */
  ['src/data/termend_lines.js',"'……你不准趁我不在，去別家喝咖啡。'","'你不准趁我不在，去別家喝咖啡。'"],   /* （CANON 第五批：AA_906／AA_910 直接換字） */
  ['src/data/termend_lines.js',"'……六月的週五，你先全部給我。'","'六月的週五，你先全部給我。'"],   /* （CANON 第五批：AA_906／AA_910 直接換字） */
  ['src/data/termend_lines.js',"'……第一杯，我還是做給你。坐。'","'第一杯，我還是做給你。坐。'"],   /* （CANON 第五批：AA_906／AA_910 直接換字） */
  ['src/data/termend_lines.js',"'……今天的咖啡不是我做的，學妹做的。你喝喝看。比我好喝的話，我會生氣。'","'今天的咖啡不是我做的，學妹做的。你喝喝看。她拉花比我第一年好多了。'"],   /* （CANON 第五批：AA_906／AA_910 直接換字） */
  ['src/data/termend_lines.js',"'……好啦。那你想。想太久我會跑掉喔。'","'好啦。那你想。想太久我會跑掉喔。'"],   /* （CANON 第五批：AA_906／AA_910 直接換字） */
  ['src/data/termend_lines.js',"'……真的假的。我加進去。'","'真的假的。我加進去。'"],   /* （CANON 第五批：AA_906／AA_910 直接換字） */
  ['src/data/termend_lines.js',"'……他會得意。我已經看到他得意的臉了。'","'他會得意。我已經看到他得意的臉了。'"],   /* （CANON 第五批：AA_906／AA_910 直接換字） */
  ['src/data/termend_lines.js','nccu:{name:\'\u6728\u67f5\u5927\u5b78\u6b63\u9580\',h:18,bg:\'nccu_food\',open:\'\uff08\u5c71\u4e0b\u90a3\u5bb6\u5e97\uff0c\u5979\u9ede\u4e86\u5169\u4eba\u4efd\uff0c\u6c92\u6709\u554f\u4f60\u3002\uff09\',close:\'\uff08\u5979\u9001\u4f60\u5230\u505c\u8eca\u5834\uff0c\u7ad9\u8457\u7b49\u4f60\u5012\u8eca\u51fa\u53bb\u3002\uff09\',miss:[\'\u6211\u5728\u6b63\u9580\u7b49\u4e86\u4e00\u4e0b\',\'\u4f60\u9084\u597d\u55ce\']} };','nccu:{name:\'\u5b78\u6821\u5f8c\u9580\u30fb\u6e6f\u9903\u5e97\',h:18,bg:\'dark\',open:\'\uff08\u5f8c\u9580\u90a3\u5bb6\u5e97\uff0c\u5979\u9ede\u4e86\u5169\u4eba\u4efd\uff0c\u6c92\u6709\u554f\u4f60\u3002\uff09\',close:\'\uff08\u5979\u966a\u4f60\u8d70\u56de\u5bbf\u820d\u5340\uff0c\u5728\u8def\u53e3\u505c\u4e0b\u4f86\u3002\uff09\',miss:[\'\u6211\u5728\u6b63\u9580\u7b49\u4e86\u4e00\u4e0b\',\'\u4f60\u9084\u597d\u55ce\']} };   /* CANON-NO-ECON-1112 \u7b2c\u56db\u6279\uff1a\u7167 AA_897 \u7b2c 2 \u7bc0\u63db\u5b57\uff08key \u7167\u820a nccu\uff0c\u820a\u5b58\u6a94\u8b80\u5b83\uff09\uff1bmiss \u90a3\u5169\u53e5\u7a3f\u6c92\u5217\u3001\u7167\u7559 */'],
  ['src/data/termend_lines.js','\'\u9019\u6b21\u63db\u5c71\u4e0a {\u54ea\u5929} \u6728\u67f5\u5927\u5b78\u6b63\u9580\u516d\u9ede\'','\'{\u54ea\u5929} \u5f8c\u9580\u90a3\u5bb6 \u516d\u9ede\''],
  ['src/data/termend_lines.js','\'{\u54ea\u5929} \u6728\u67f5\u5927\u5b78 \u516d\u9ede\'','\'{\u54ea\u5929} \u5f8c\u9580\u90a3\u5bb6 \u516d\u9ede\''],
  ['src/sis_grad3d.js','這週的時間用完了。下週再問我。','這週沒有時間了。下週好不好？'],['src/data/termend_lines.js',"table:'這學期的計畫本寫完了。……下學期那本，第一頁還是空的。'","table:'這學期過完了。……下學期的事，我還沒想。'"],
  /* 2026-11-10 TERMEND-OPTS-1110：termend_lines.js 只動程式的寫法（字沒有改）——學姊大四上 XM3 兩句抽成 SIS_XM3（有選項的那一版接在選項後面）、多匯出 GF_MORE／COND */
  ['src/data/termend_lines.js',"G=>XM3(G)?'去年在研究室說的。剛回來一天。':null,G=>XM3(G)?(XM3US(G)?'……我們做到了。':'……我做到了。'):null,G=>SNOWQ","...SIS_XM3,G=>SNOWQ"],
  ['src/data/termend_lines.js',"  const GF={\n","  /* TERMEND-OPTS-1110：學姊大四上 XM3 那兩句（AA_386 3-3）抽出來——有選項的那一版（TERMEND_OPTS，AA_749）接在選項後面（termend3d.js 讀 GF_MORE）；沒有 TERMEND_OPTS 的照舊在 tableByTerm 裡，字沒有動 */\n  const SIS_XM3=[G=>XM3(G)?'去年在研究室說的。剛回來一天。':null,G=>XM3(G)?(XM3US(G)?'……我們做到了。':'……我做到了。'):null];\n  const GF={\n"],
  /* 2026-11-11（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫；AA_751@33a1769f8）：沛珊的六處——朋友邀約大一上那一句、手機三句（她有交往對象、她知道、玩家婉拒的回覆）、關係結束的婉拒、女朋友版各學期的飯桌句 tableByTerm（搬到 TERMEND_OPTS.GF；通用那一句 table 留著給大四下）*/
  ['src/data/termend_lines.js',"y1s1:'期末考完了！吃飯好不好？我有一堆問題想問你。'","y1s1:'期末考完了！吃飯好不好？我發現一家，我覺得你會喜歡。'/* PEISHAN-VOICE-1110（AA_751@33a1769f8）：只換這一句；和 TERMEND_OPTS.LINES 同字（tests/peishan_termend_1110_unit.js 逐句比）*/"],
  ['src/data/termend_lines.js',"classmate_peishan:'期末考完了！這次我有約了，下次再問你問題喔。'","classmate_peishan:'期末考完了！這次我有約了，下次換你請喔。'/* PEISHAN-VOICE-1110（AA_751 phone）*/"],
  ['src/data/termend_lines.js',"classmate_peishan:'考完了！……我有問題想問你，可是不是現在。'","classmate_peishan:'考完了！這次先不約。你知道為什麼啦。'/* PEISHAN-VOICE-1110（AA_751 phone）*/"],
  ['src/data/termend_lines.js',"classmate_peishan:'好喔！那我下次再問。'","classmate_peishan:'好喔！那你欠我一頓。'/* PEISHAN-VOICE-1110（AA_751 phone「REPLY（玩家婉拒）」）*/"],
  ['src/data/termend_lines.js',"classmate_peishan:'謝謝你問。……這次我先不去。'","classmate_peishan:'謝謝你約我。這次我先不去。'/* PEISHAN-VOICE-1110（AA_751 phone）*/"],
  ['src/data/termend_lines.js',"      tableByTerm:{Y3S1:['台南我還沒找到喜歡的早餐店。','……我家的比較好吃。不是我偏心。'],Y3S2:['你每次下來，都搭最後一班高鐵。','……下次早一點來，我帶你去運河邊。'],Y4S1:['下學期去國小實習，要穿得像老師。','……你幫我挑。我挑的都太像學生。'],Y5S1:['台南的冬天不太冷。','……你下來的時候，不用帶外套。']},\n","      /* PEISHAN-VOICE-1110：飯桌的話（通用一頓＋大三上、大三下、大四上、大五上，都有選項）在 TERMEND_OPTS.GF.classmate_peishan（AA_751@33a1769f8），這裡原本的 tableByTerm 拿掉了。\n         table 那一句留著：只剩沒有 TERMEND_OPTS 的舊資料會用到。大四下 6/8 台南那一頓（r2y4b3d.js psDinner）2026-11-11 起演 TERMEND_OPTS.GF.classmate_peishan.tableByTerm.Y4S2（AA_751@768b9a131），稿沒載到才讀這一格 */\n"],
  ['src/data/termend_lines.js',"  return {KX_ASK,","  const GF_MORE={heroine_05:{Y4S1:SIS_XM3}}, COND={Q6,SNOWQ,YOUPAY,C10,US:US3,SIS_FU};   /* TERMEND-OPTS-1110：termend_opts.js 的 if 用的條件 */\n  return {GF_MORE,COND,KX_ASK,"],
  ['src/data/termend_lines.js',"    eatery_lib:{name:'法圖旁邊的簡餐',open:'（下午的人散了，店裡只剩你們這一桌。）',close:'（她看了一下錶，把計畫本收進包包。）',closeGf:'（她看了一下錶，沒有要起身的意思。）',bg:'xiaofu'} };   /* closeGf：女朋友的學期末約會的收尾（AA_250 10-1，S14）*/","    eatery_lib:{name:'法圖旁邊的簡餐',open:'（下午的人散了，店裡只剩你們這一桌。）',close:'（她看了一下錶，把計畫本收進包包。）',closeGf:'（她看了一下錶，沒有要起身的意思。）',bg:'xiaofu'},   /* closeGf：女朋友的學期末約會的收尾（AA_250 10-1，S14）*/\n    dumpling_gate:{name:'學校後門・湯餃店',bg:null,caption:'學校後門・湯餃店'} };   /* CANON-NO-ECON-1112 第四批（AA_895 第 2 節，企劃線 a425c0dcb）：可昕的心意邀約、朋友的期末飯在學校後門的湯餃店；稿上沒有開場、收尾旁白＝照一盞茶屋的寫法（系統只念地點）；沒有 2D 底圖＝深色底＋地點字幕 */"],
  ['src/data/termend_lines.js',"      over:[{terms:['Y3S1','Y3S2','Y4S1'],...PS_TN,walkPlace:'台南・往她租的地方',walkCaption:'台南・往她租的地方'}] } };   /* 大四上「先不說」＝BB_119 3-1 兩句（這學期唯一一次奇怪的問題）*/","      over:[{terms:['Y3S1','Y3S2','Y4S1'],...PS_TN,walkPlace:'台南・往她租的地方',walkCaption:'台南・往她租的地方'}] },\n    /* CANON-NO-ECON-1112 第四批（AA_895 第 2 節，企劃線 a425c0dcb，定稿 BB_430）：可昕沒交往時的心意邀約（格式照語彤、學姊）；夏天的學期末（下學期）沒有圍巾＝yes 第二列換句（over）。\n       「不准」全線只留告白這一次（BB_415）。交往中的學期末約會照舊走 KX（AA_897：女朋友版已經有，不另外加）*/\n    kexin:{ src:'AA_895 第 2 節（a425c0dcb）', place:'dumpling_gate', placeName:'學校後門・湯餃店', h:19, walkBg:'ntu_avenue', walkPlace:'椰影大道・往女生宿舍',\n      invite:'考完了。後門那家，晚上七點。……只有我們兩個。', decline:'好。那開學見。',\n      table:'你的那碗我叫老闆不要放香菜。……你每次都挑很久。',\n      walk:['走到這裡就好。……你要講什麼，現在講。'],\n      yes:['……你講了。',{narr:'（她把圍巾拉高，遮住半張臉。）'},'好。我答應你。','不准笑。'],\n      she:['你每次都等我先講。','這次我也先講。……我喜歡你。','你現在回答。不要讓我等。'],\n      think:'……好。你想。不要想太久，我會不爽。',\n      invite2:'考完了。後門那家。……上次的事，你想好了嗎。',\n      she2:['我上次講過了。我不想講第二次。','……你回答就好。'],\n      yes2:['……嗯。','好。'],\n      over:[{terms:['Y1S2','Y2S2','Y3S2','Y4S2'],yes:['……你講了。',{narr:'（她把頭轉開，看路燈。耳朵是紅的。）'},'好。我答應你。','不准笑。']}] } };   /* 大四上「先不說」＝BB_119 3-1 兩句（這學期唯一一次奇怪的問題）*/"],
  ['src/data/termend_lines.js',"    heroine_05:{y1s1:null,gen:'期末考完了嗎？法圖旁邊那家，我請你。',genByTerm:{Y2S1:G=>YOUPAY(G)?'期末考完了嗎？我研究室今天沒人。法圖旁邊那家。':'期末考完了嗎？我研究室今天沒人。法圖旁邊那家，我請你。',Y2S2:G=>YOUPAY(G)?'期末考完了嗎？法圖旁邊那家，這次我請。':'期末考完了嗎？法圖旁邊那家，這次你請。',Y3S1:'期末考完了嗎？明年夏天，我申請了美國的交換。下個月面試。法圖旁邊那家？',Y3S2:'期末考完了嗎？八月我就出發了。法圖旁邊那家？',Y4S1:'期末考完了嗎？我昨天回來的。法圖旁邊那家，還在。'},no:'好。開學見。',noByTerm:{Y3S2:'好。我出發前再找你。'}/* AA_260 (b-1) 第 14 項：8/2 她出發去美國 */,place:'eatery_lib',h:18.5},   /* 筆試前不約；Y4S1：AA_363 S1。AA_518 4-10：Y3S1「我在等美國那邊的結果。」那一句換成「明年夏天，我申請了美國的交換。下個月面試。」（12 月還沒面試）*/","    heroine_05:{y1s1:null,gen:'期末考完了嗎？法圖旁邊那家，我請你。',genByTerm:{Y2S1:G=>YOUPAY(G)?'期末考完了嗎？我研究室今天沒人。法圖旁邊那家。':'期末考完了嗎？我研究室今天沒人。法圖旁邊那家，我請你。',Y2S2:G=>YOUPAY(G)?'期末考完了嗎？法圖旁邊那家，這次我請。':'期末考完了嗎？法圖旁邊那家，這次你請。',Y3S1:'期末考完了嗎？明年夏天，我申請了美國的交換。下個月面試。法圖旁邊那家？',Y3S2:'期末考完了嗎？八月我就出發了。法圖旁邊那家？',Y4S1:'期末考完了嗎？我昨天回來的。法圖旁邊那家，還在。'},no:'好。開學見。',noByTerm:{Y3S2:'好。我出發前再找你。'}/* AA_260 (b-1) 第 14 項：8/2 她出發去美國 */,place:'eatery_lib',h:18.5},   /* 筆試前不約；Y4S1：AA_363 S1。AA_518 4-10：Y3S1「我在等美國那邊的結果。」那一句換成「明年夏天，我申請了美國的交換。下個月面試。」（12 月還沒面試）*/\n    kexin:{y1s1:'考完了。要不要吃個飯？後門那家。',gen:'考完了。吃飯嗎？',no:'好。那下次。',place:'dumpling_gate',h:18.5},   /* CANON-NO-ECON-1112 第四批（AA_895 第 2 節）：朋友的期末邀約；婉拒以後她回的照 AUTO_NO.kexin（稿上沒有另外一句）*/"],
  ['src/data/termend_lines.js',"    knows:{   /* 芯慈的 knows 拿掉（AA_548 第 7 節：她知道、你說過＝照發；你沒說過＝交往中才有，結果是分手）*/heroine_01:'考完了。這次我不約你了。……你知道為什麼。',heroine_03:'這禮拜我上班。',heroine_05:'期末快樂。……這次我就不約了。',heroine_02:{gen:'期末我排了很多班。開學見。',byTerm:{Y3S2:'期末我排了很多班。出國以前再說。'}},heroine_04:{gen:'考完了 我回家了',byTerm:{Y3S2:'畢業了 我先回家住一陣子',Y4S1:'這陣子工作室在趕 下次'}},classmate_peishan:'考完了！這次先不約。你知道為什麼啦。'/* PEISHAN-VOICE-1110（AA_751 phone）*/},","    knows:{   /* 芯慈的 knows 拿掉（AA_548 第 7 節：她知道、你說過＝照發；你沒說過＝交往中才有，結果是分手）*/heroine_01:'考完了。這次我不約你了。……你知道為什麼。',heroine_03:'這禮拜我上班。',heroine_05:'期末快樂。……這次我就不約了。',heroine_02:{gen:'期末我排了很多班。開學見。',byTerm:{Y3S2:'期末我排了很多班。出國以前再說。'}},heroine_04:{gen:'考完了 我回家了',byTerm:{Y3S2:'畢業了 我先回家住一陣子',Y4S1:'這陣子工作室在趕 下次'}},classmate_peishan:'考完了！這次先不約。你知道為什麼啦。'/* PEISHAN-VOICE-1110（AA_751 phone）*/,kexin:'考完了。這次我不約你。……你應該知道為什麼。'/* AA_895 第 2 節 */},"]];   /* （CANON-NO-ECON-1112 第四批：照 AA_895 換字）可昕的心意邀約、朋友期末飯、知情那一句、湯餃店地點 */   /* 2026-11-10 再加：COND 多 SIS_FU（朋友版學姊大三上 thenIf，企劃線 1cf434dee；字沒有改）*/
const LATER_TXT={'這週的時間用完了。下週再問我。':'這週沒有時間了。下週好不好？'}, lt=t=>LATER_TXT[t]||t;
const later=(f,s)=>{ let t=LATER.filter(x=>x[0]===f).reduce((a,x)=>a.split(x[1]).join(x[2]),s); if(f==='src/data/termend_lines.js') t=R772.fixFile(f,t).split("'巷口家常菜'").join("'"+R772.name('巷口家常菜')+"'"); return t; };
/* 2026-11-11（SHE-FIRST-1110／PEISHAN-VOICE-1110；使用者 11-10 芷若告白「寫在杯子上」、X327 沛珊重寫）：termend_lines.js 的 HEART 裡芷若、沛珊那兩段台詞整段搬到 src/data/termend_opts.js（TERMEND_OPTS.HEART，
   匯入工具照企劃稿 AA_748／AA_751@33a1769f8，逐字比對在 tests/te_shefirst_1110_unit.js）——這一項比「其他地方一字不差」，所以兩邊都先把那兩段拿掉再比：[檔, BASE 那一段的開頭, 現在那一段的開頭, 兩邊共同的結尾（不含）] */
const MOVED=[['src/data/termend_lines.js',"    heroine_02:{ src:'AA_254 第 4 節'","    /* SHE-FIRST-1110（使用者 2026-11-10 選「寫在杯子上」","    heroine_04:{ src:'AA_254 第 5 節'"],
  ['src/data/termend_lines.js',"    classmate_peishan:{ src:'AA_254 第 6 節'","    /* PEISHAN-VOICE-1110（使用者 X327：沛珊重寫成有趣、聰明、會接梗）＋SHE-FIRST-1110","  /* 說出來的通用三句＋先不說"]];
const cutMoved=(f,s,k)=>MOVED.filter(x=>x[0]===f).reduce((a,x)=>{ const i=a.indexOf(x[k]), j=i<0?-1:a.indexOf(x[3],i); if(i<0||j<0||a.indexOf(x[k],i+1)>=0) throw new Error('MOVED 找不到或不只一段：'+x[k]); return a.slice(0,i)+a.slice(j); },s);

if(process.env.QUOTE_B3_PROBE) (async()=>{
  /* ===================== 演出來（子程序）：QUOTE_B3_PROBE=old 讀 BASE 的 CHANGED，=new 讀現在的 ===================== */
  const mode=process.env.QUOTE_B3_PROBE;
  if(mode==='old'){ const OLD={}; for(const f of CHANGED) OLD[path.join(ROOT,f)]=gitShow(f); const real=fs.readFileSync;
    fs.readFileSync=function(p){ if(typeof p==='string'){ const k=path.resolve(p); if(OLD[k]!=null) return OLD[k]; } return real.apply(fs,arguments); }; }
  const out={errs:[]};
  const H=require('./pg_harness.js'); const {GM,E}=H;
  const RE=/^(MSG|MSG_POOL|MSG2_POOL|ZRUK|EXCH|R2Y4A|R2Y4A_EVENTS|CRACKTALK|CRACKTALK_LINES|Y2B|Y2B_EVENTS|SISG|NEEDED_MSGS|POOL|POOL_STORY|POOL_STORY_B2|POOL_STORY_B3|POOL_STORY_B4|POOL_MORE|HCIRCLE|HCIRCLE_DATA|SIDEQ|EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|L118_REDO|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SISY23|SISY23_LINES|SISY23_EVENTS|PRACTICE|R2Y4B_EVENTS|R2Y3A_EVENTS|GROUP|GROUP_EVENTS|Y2R2)$/;
  const load=f=>{ if(!fs.existsSync(path.join(ROOT,f))){ out.errs.push('沒有 '+f); return; } try{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const (\w+)\s*=/mg,(m,n)=>RE.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(s,{filename:f}); }catch(e){ out.errs.push(f+'：'+String(e&&e.message||e).slice(0,200)); } };
  global.Z3=global.Z3||{ZONES:{}};
  for(const f of ['src/data/needed_msgs.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js','src/exchange3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js',
    'src/data/y2b_events.js','src/y2b3d.js','src/sis_grad3d.js']) load(f);
  const keyOf=d=>CALENDAR.dateOf(d).key;
  const P=(k,a)=>{ out[k]=(out[k]||[]).concat(a); };
  const rec=()=>H.said.map(s=>[s.who,s.t]);
  const sec=async(k,f)=>{ try{ await f(); }catch(e){ out.errs.push(k+'：'+String(e&&e.stack||e).split('\n').slice(0,3).join(' / ').slice(0,400)); } };
  STORY.offerInvite=async()=>{};   /* 說完話以後的「約她」選單不演（這裡只看說的話）*/
  const spawn=id=>{ const n={name:SOCIAL.npcName(id),charId:id,obj:{position:{x:0,y:0,z:0}},pose:'idle'}; GM.npc[id]=n; E.npcs.push(n); return n; };
  /* 腳踏車上下車字幕（story3d.js S.onRide → GM.caption(nm,…)）*/
  await sec('ride',async()=>{ for(const id of ['kexin','heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kai','zhe']){ H.fresh('2026-10-05',15,'campus'); H.FAMILIAR(id); if(id==='kexin') H.G.flags.dating_kexin=true;
      const caps=[]; GM.caption=(w,t)=>{ caps.push([w||null,t]); }; STORY.onRide(GM,{charId:id},true); STORY.onRide(GM,{charId:id},false); GM.caption=()=>{}; P('ride',caps.map(c=>[id].concat(c))); } });
  /* 第一次見面（story3d.js talkCharacter：B 層同學的自我介紹、其他人的「你好，我是……」）；秘密「其實……」 */
  await sec('first',async()=>{ STORY._bindGM(GM); const R0=Math.random;
    /* 大一上（2025-10-06）：同年級＝三句隨機（周老師那句要 afternoonDone）、學長姊＝「你是大一的吧？」；大二上（2026-10-05）：同屆以下＝「……嗯？喔，你是我們班的吧。」 */
    try{ for(const [k,id,r] of [['2025-10-06','pool_1',0],['2025-10-06','pool_1',0.5],['2025-10-06','pool_1',0.9],['2025-10-06','pool_4',0.5],['2025-10-06','pool_2',0],['2025-10-06','pool_3',0],['2026-10-05','pool_1',0],['2026-10-05','pool_3',0],['2025-10-06','npc_huangxh',0],['2025-10-06','jp_yuheng',0]]){
        H.fresh(k,12.5,'campus',{afternoonDone:true}); GM.npc={}; E.npcs=[]; const n=spawn(id); H.said=[]; Math.random=()=>r;
        await STORY.talkCharacter(id,n); P('first',rec().map(x=>[k+' '+id+'@'+r].concat(x))); } } finally{ Math.random=R0; } });
  /* 秘密「其實……」（story3d.js：B 層、有點熟、閒聊的 once 句都說過）*/
  await sec('secret',async()=>{ STORY._bindGM(GM); for(const id of ['pool_1','pool_2','pool_6','pool_13','pool_20']){ H.fresh('2026-11-16',12.5,'campus',{afternoonDone:true}); GM.npc={}; E.npcs=[]; H.rel(id,20,0,0); SOCIAL.rel(id).talked=5; H.G.social.reveal[id]='ACQUAINTANCE';
      const L=(SMALLTALK[id]||[]).filter(e=>typeof e==='object'&&e.once&&!(e.if&&e.if.memory)), SM=H.G.social.small||(H.G.social.small={}); SM[id]={day:0,used:[],last:null,once:Object.fromEntries(L.map(e=>[e.t,true]))};
      const n=spawn(id); H.said=[]; await STORY.talkCharacter(id,n); P('secret',rec().map(x=>[id].concat(x))); } });
  /* 沒回訊息那一句（story3d.js S.neededMiss）：needed_msgs.js 每一則有 miss 的，一般版和交往中的版本 */
  await sec('needed',async()=>{ for(const e of NEEDED_MSGS.list){ if(!e.miss&&!e.missDating) continue; for(const dt of [false,true]){ if(dt&&!e.missDating) continue;
      const day=STORY.dayOfKey('2027-10-11'); H.fresh(keyOf(day),15,'campus'); if(dt) H.G.flags['dating_'+e.who]=true; const N=STORY.neededRec(H.G); N.batches.push({d:day-8,ids:[[e.id,e.who]],ans:[],said:{},closedAt:(day-1)*24+21});
      H.said=[]; const r=await STORY.neededMiss(GM,{name:'她'+e.who},e.who); P('needed',rec().map(x=>[e.id+(dt?'@dating':''),String(r)].concat(x))); } } });
  /* 沒去事務所參觀（termend3d.js S.meetLine）*/
  await sec('c14',async()=>{ H.fresh('2027-02-20',15,'campus'); H.G.flags.C14_MISSED=H.G.day-3; H.said=[]; await TERMEND.meetLine(GM,{name:'芯慈'},'classmate_xinci'); P('c14',rec()); });
  /* 小卡（cracktalk3d.js S.letter）*/
  await sec('card',async()=>{ H.fresh('2028-03-01',15,'dorm'); H.said=[]; await CRACKTALK.letter(GM); P('card',rec()); });
  /* 明信片第一輪（y2b3d.js S.pcScene）：寄到宿舍的一般版（9/24 沒去最後一班＝多兩行）、交往中的版本、可昕交往中＝Café 牆上的大明信片 */
  await sec('pc1',async()=>{ for(const [v,fl] of [['dorm',{ZR_LAST_SHIFT:'missed'}],['gf',{ZR_LAST_SHIFT:'seen'}],['cafe',{ZR_LAST_SHIFT:'seen'}]]){ H.fresh('2027-12-20',13,v==='cafe'?'cafe':'dorm',fl); H.FAMILIAR('heroine_02'); SOCIAL.remember('heroine_02','TICKET_STUB','');
      if(v==='gf'){ H.date('heroine_02'); H.G.flags.dating_heroine_02=true; } if(v==='cafe'){ H.date('kexin'); H.G.flags.dating_kexin=true; }
      for(let i=0;i<4;i++){ H.said=[]; H.picks=['先不回']; await Y2B.pcScene(GM); P('pc1',rec().map(x=>[v+'#'+i].concat(x))); } } });
  /* 明信片第二輪（r2y4a3d.js S.pc2Scene）：十張，交往中（gf 那一行）、方奕廷那條路（另一種筆跡＝旁白）*/
  await sec('pc2',async()=>{ for(const [v,fl] of [['fam',{}],['gf',{ZR_FY:true}]]){ H.fresh('2029-06-20',13,'dorm',Object.assign({EXCHANGE_ROUTE:'TW'},fl)); H.FAMILIAR('heroine_02'); SOCIAL.remember('heroine_02','POSTCARDS',''); if(v==='gf') H.date('heroine_02');
      for(let i=0;i<10;i++){ H.said=[]; H.picks=[i===2?'台北也下雨':'（先不回）']; await R2Y4A.pc2Scene(GM); P('pc2',rec().map(x=>[v+'#'+i].concat(x))); } } });
  /* 學姊研究所筆試以前（sis_grad3d.js）：婉拒四句輪流、第 14 週起兩句輪流、念書那一句——INV.playLines 照遊戲演（who＝她的名字）；S.studyOffer 選「那一起念書。」 */
  await sec('sisg',async()=>{ H.fresh('2026-12-01',15,'campus'); const who={name:'溫書瑀',charId:'heroine_05'}; const L=[]; for(let i=0;i<5;i++) L.push(SISG.declineLine(H.G)); for(let i=0;i<3;i++) L.push(SISG.offLine(H.G)); L.push(SISG.STUDY_YES);
      for(const t of L){ H.said=[]; await INV.playLines(GM,who,[t]); P('sisg',rec()); }
      H.FRIEND('heroine_05'); H.said=[]; H.picks=[0]; await SISG.studyOffer(GM,{day:H.G.day+1,h:19},who,null); P('sisgOffer',rec()); });
  /* ACC0（一般那句答應）：程式讀到的那一句照 INV.playLines 演（三個檔的 S.ACC0）*/
  await sec('acc0',async()=>{ const who={name:'阿哲',charId:'zhe'};
    for(const f of ['src/offbeat_sys3d.js','src/mokuyobi_sys3d.js','src/gg2shops3d.js']){ const s=fs.readFileSync(path.join(ROOT,f),'utf8'), m=/S\.ACC0=(\{[^}]*\}|'[^']*')/.exec(s); if(!m){ out.errs.push(f+'：找不到 S.ACC0'); continue; }
      const v=vm.runInNewContext('('+m[1]+')'); for(const [k,t] of typeof v==='string'?[['',v]]:Object.entries(v)){ H.said=[]; await INV.playLines(GM,who,[t]); P('acc0',rec().map(x=>[f+(k?':'+k:'')].concat(x))); } } });
  /* 一般的「其實……」（pool_more3d.js S.genericLine）：二十位法律系同學 */
  const RE2=RE; for(const f of ['src/data/msg_pool.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/lane118.js','src/data/wz_park_layout.js','src/wzpark3d.js','src/wzshops3d.js','src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/sideq3d.js',
    'src/data/group_events.js','src/group3d.js','src/y2r2_3d.js','src/data/r2y3a_events.js','src/data/r2y4b_events.js','src/practice3d.js','src/data/pool_story.js','src/pool3d.js','src/data/pool_story_b2.js','src/data/pool_story_b3.js','src/data/pool_story_b4.js','src/pool_more3d.js','src/data/heroine_circle.js','src/hcircle3d.js']) if(!/msg_pool/.test(f)) load(f);
  await sec('generic',async()=>{ const PMx=typeof POOL_MORE!=='undefined'?POOL_MORE:null; if(!PMx||!PMx.genericLine) throw new Error('沒有 POOL_MORE.genericLine'); for(let i=1;i<=20;i++){ const id='pool_'+i; H.fresh('2027-03-01',12.5,'campus'); H.said=[]; await PMx.genericSecret(GM,{name:SOCIAL.npcName(id)},id); P('generic',rec().map(x=>[id].concat(x))); } });
  console.log('@@B3@@'+JSON.stringify(out)); process.exit(0);
})().catch(e=>{ console.log('@@B3@@'+JSON.stringify({errs:['例外：'+String(e&&e.stack||e).slice(0,600)]})); process.exit(0); });
else main();

/* ===================== 主程式 ===================== */
function main(){
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, sample=L=>L.slice(0,6).join('／')+(L.length>6?'…（共 '+L.length+'）':'');
/* 一個檔裡所有整句「」的字串常值（註解以外），連同前面一小段（看是不是選項）*/
const wrappedLits=s=>{ const t=noComments(s), out=[]; let m; LIT.lastIndex=0; while((m=LIT.exec(t))){ if(wrapped(m[1])) out.push({t:m[1],pre:t.slice(Math.max(0,m.index-40),m.index)}); } return out; };

/* 11. termend_lines.js、lane118.js：不改；整句「」的都是選項字 */
{ const l118=fs.readFileSync(path.join(ROOT,'src/lane118.js'),'utf8'), named=l118.match(/\[\s*(?:'[^']*'|[A-Z]{2}|null)\s*,\s*'「[^'\n]*」'\s*\]/g)||[];
  check('11b. src/lane118.js 沒有「有名字、又整句包在「」裡」的台詞（選項字照慣例留「」）',named.length===0,JSON.stringify(named.slice(0,5))); }
{ for(const f of SAME) check('11. '+f+' 和 '+BASE+' 一字不差（這個檔沒有有名字又整句「」的台詞；之後劇情另外改的字照 LATER；搬到 TERMEND_OPTS.HEART 的那兩段照 MOVED 不比）',cutMoved(f,cur(f),2)===cutMoved(f,later(f,gitShow(f)),1));
  /* TERMEND_LINES 載進來逐格走：選項的格子（t、ok、answer、OPTS、ANSWER、NOT_YET_OPT；函式裡寫在 t:／ok: 後面的字）＝GM.choose 的選項字；其他字串＝說的話、旁白、系統字 */
  const c=vm.createContext({console}); vm.runInContext(cur('src/data/termend_lines.js').replace(/^const TERMEND_LINES\s*=/m,'globalThis.TERMEND_LINES='),c); const TL=c.TERMEND_LINES;
  const OPTK=new Set(['t','ok','answer','OPTS','ANSWER','NOT_YET_OPT']); const spoken=[], opts=new Set(), seen=new Set();
  (function w(v,k,p){ if(v==null||k==='src') return; const isOpt=OPTK.has(k);
    if(typeof v==='string'){ if(isOpt) opts.add(v); else spoken.push([p,v]); return; }
    if(typeof v==='function'){ const s=noComments(String(v)); let m; LIT.lastIndex=0; while((m=LIT.exec(s))){ if(isOpt||/(\bt|\bok):\s*$/.test(s.slice(Math.max(0,m.index-6),m.index))) opts.add(m[1]); else spoken.push([p+'()',m[1]]); } return; }
    if(typeof v==='object'){ if(seen.has(v)) return; seen.add(v); for(const kk of Object.keys(v)) w(v[kk],Array.isArray(v)?k:kk,p+'.'+kk); } })(TL,'','');
  const T=wrappedLits(cur('src/data/termend_lines.js')), Tbad=T.filter(x=>!opts.has(x.t));
  check('11. termend_lines.js：原始碼整句「」的 '+T.length+' 個字串都是選項字（OPTS、ANSWER、answer、choice／KX_ASK／C14／C15 opts 的 t、邀約鉤子的 ok）',T.length===54&&Tbad.length===0   /* 2026-11-11：56 → 54（沛珊大四上的兩個選項「從今天開始認識。」「……讓我想一下。」跟著她那一段搬到 TERMEND_OPTS.HEART，字也換了：AA_751 over_Y4S1）*/,sample(Tbad.map(x=>x.t)));
  const sw=spoken.filter(([p,t])=>wrapped(t));
  check('11. TERMEND_LINES 選項以外的字串（'+spoken.length+' 個，含函式裡的）沒有一句外面有「」（說的話本來就不加）',spoken.length>500&&sw.length===0,sample(sw.map(x=>x.join('：'))));
  check('11. 選項照留「」（說出來的三選一、「好。」／「讓我想想。」、邀約鉤子「我也想報。」）',TL.OPTS()[0]==='「我喜歡妳。」'&&J(TL.ANSWER)===J(['「好。」','「讓我想想。」'])&&TL.HOOK.Y1S2.heroine_01.ok==='「我也想報。」');
  const L=wrappedLits(cur('src/lane118.js')), Lbad=L.filter(x=>!/\{t:\s*$/.test(x.pre));
  check('11. lane118.js：整句「」的 '+L.length+' 個字串都是選項字（opts 的 t）',L.length===10&&Lbad.length===0,sample(Lbad.map(x=>x.t))); }

/* 12. 資料：sis_grad3d.js 的三組、三個檔的 ACC0 */
const grab=(src,re)=>{ const m=re.exec(src); return m?vm.runInNewContext('('+m[1]+')'):null; };
const DATA=[['src/sis_grad3d.js','S.DECLINE',/S\.DECLINE=(\[[^\]]*\])/],['src/sis_grad3d.js','S.DECLINE_OFF',/S\.DECLINE_OFF=(\[[^\]]*\])/],['src/sis_grad3d.js','S.STUDY_YES',/S\.STUDY_YES=('[^']*')/],
  ['src/offbeat_sys3d.js','S.ACC0',/S\.ACC0=('[^']*')/],['src/mokuyobi_sys3d.js','S.ACC0',/S\.ACC0=('[^']*')/],['src/gg2shops3d.js','S.ACC0',/S\.ACC0=(\{[^}]*\})/]];
{ let n=0; const bad=[], who=[], nw=[];
  for(const [f,k,re] of DATA){ const o=grab(gitShow(f),re), c=grab(cur(f),re); if(o==null||c==null){ bad.push(f+' '+k+'：讀不到'); continue; }
    const os=typeof o==='string'?[o]:Object.values(o), cs=typeof c==='string'?[c]:Object.values(c), ok=typeof o==='string'?['']:Object.keys(o), ck=typeof c==='string'?['']:Object.keys(c);
    if(J(ok)!==J(ck)||os.length!==cs.length){ bad.push(f+' '+k+'：結構不同'); continue; }
    os.forEach((t,i)=>{ n++; if(!(wrapped(t)&&lt(unq(t))===cs[i])) bad.push(f+' '+k+'['+i+']：'+t+' → '+cs[i]); if(wrapped(cs[i])) nw.push(f+' '+k+'：'+cs[i]); if(narrLine(t)!==narrLine(cs[i])||narrLine(cs[i])) who.push(f+' '+k+'：'+cs[i]); }); }
  check('12. 有名字的 '+n+' 句（學姊婉拒 4＋2、念書 1、ACC0 6）沒有一句外面還有「」',n===13&&nw.length===0,sample(nw));
  check('12. 和 '+BASE+' 逐句比：每一句原本整句「」、現在只差外面的「」（其他字一字不差、輪流的順序一樣）',n===13&&bad.length===0,sample(bad));
  check('12. 誰說的（S.narrLine）和 '+BASE+' 一樣：都是她／他說的（拿掉以後沒有一句變成（ 開頭）',n===13&&who.length===0,sample(who));
  const sg=noComments(cur('src/sis_grad3d.js')), ch=wrappedLits(cur('src/sis_grad3d.js'));
  check('12. sis_grad3d.js：剩下整句「」的 '+ch.length+' 個字串都是選項（choice 的 text、GM.choose 的 t）',ch.length===11&&ch.every(x=>/(text|\bt):\s*$/.test(x.pre)),sample(ch.map(x=>x.pre.slice(-12)+'|'+x.t)));
  check('12. 讀這幾句的程式沒動：S.inviteCap 回 lines:[S.offLine(G)]／[S.declineLine(G)]、studyOffer GM.say(who,S.STUDY_YES)、三個 ACC0 包 INV.personal 的 lines',
    /lines:\[S\.offLine\(G\)\]/.test(sg)&&/lines:\[S\.declineLine\(G\)\]/.test(sg)&&/await GM\.say\(who,S\.STUDY_YES\)/.test(sg)&&/lines:\[S\.ACC0\]/.test(noComments(cur('src/offbeat_sys3d.js')))&&/lines:\[S\.ACC0\]/.test(noComments(cur('src/mokuyobi_sys3d.js')))&&/lines:\[S\.ACC0\[P\.id\]\]/.test(noComments(cur('src/gg2shops3d.js')))); }

/* 13. 原始碼逐行比：改到的行＝BASE 那一行拿掉外面的「」（說話的人沒動） */
const strip=line=>{ let s=line.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+$/,'');
  s=s.replace(/'「'\+/g,'').replace(/\+'」'/g,'');   /* 程式自己包的 '「'+…+'」' */
  return s.replace(LIT,(m,t)=>{ if(wrapped(t)) return "'"+unq(t)+"'"; const o=(t.match(/「/g)||[]).length, c=(t.match(/」/g)||[]).length; if(t[0]==='「'&&o>c) t=t.slice(1); else if(t[t.length-1]==='」'&&c>o) t=t.slice(0,-1); return "'"+t+"'"; }); };
{ const WANT={'src/sis_grad3d.js':3,'src/offbeat_sys3d.js':1,'src/mokuyobi_sys3d.js':1,'src/gg2shops3d.js':1,'src/story3d.js':4,'src/termend3d.js':1,'src/cracktalk3d.js':1,'src/r2y4a3d.js':1,'src/y2b3d.js':1,'src/pool_more3d.js':1};
  const per={}, bad=[];
  /* 比第三批那一個 commit 本身（C3^ → C3），不是 BASE → 現在：之後別的修改（例：5292ead4d story3d.js 開場 y0Gate）改到同一個檔不會讓這一項失敗 */
  const C3='0e08b4d4a', showAt=(r,f)=>cp.execFileSync('git',['-C',ROOT,'show',r+':'+f],{encoding:'utf8',maxBuffer:1<<28});
  for(const f of CHANGED){ const A=showAt(C3+'^',f).split('\n'), B=showAt(C3,f).split('\n'); if(A.length!==B.length){ bad.push(f+'：行數不同 '+A.length+' → '+B.length); continue; }
    let k=0; A.forEach((a,i)=>{ const b=B[i]; if(a===b) return; k++; const sa=strip(a), sb=b.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+$/,''); if(sa!==sb) bad.push(f+':'+(i+1)+'：拿掉外面的「」以後和前一版不一樣'); if(sa===noComments(a).replace(/\s+$/,'')) bad.push(f+':'+(i+1)+'：沒有拿掉「」（只改了註解？）'); });
    per[f]=k; }
  check('13. 每個檔改了幾行：'+J(per),J(per)===J(WANT),J(per));
  check('13. 第三批 commit 改到的每一行：把前一版那一行外面的「」拿掉（字串常值、程式包的 \'「\'+…+\'」\'）＝現在這一行（註解以外一字不差，GM.say／GM.caption 說話的人那個參數沒動）',bad.length===0,sample(bad));
  const st=noComments(cur('src/story3d.js')), te=noComments(cur('src/termend3d.js'));
  check('13. 有名字的那幾處現在是這樣：GM.caption(nm,r.on)、GM.caption(nm,r.off)、neededMiss GM.say(who,t)、事務所 GM.say(who,t)、小卡、兩輪明信片 GM.say(card,…)',
    /GM\.caption\(nm,r\.on,2800\)/.test(st)&&/GM\.caption\(nm,r\.off,2600\)/.test(st)&&/S\.neededMiss=async function\(GM,who,id\)\{[^\n]*for\(const t of L\) await GM\.say\(who,t\);/.test(st)
    &&/Lx\.C14\.miss\) await GM\.say\(who,t\)/.test(te)&&/GM\.say\(\{name:'小卡'\},X\.card\)/.test(noComments(cur('src/cracktalk3d.js')))&&/else await GM\.say\(card,l\.q\)/.test(noComments(cur('src/r2y4a3d.js')))&&/S\.pcLines\(G,c\)\) await GM\.say\(card,t\)/.test(noComments(cur('src/y2b3d.js'))));
  check('13. 程式自己包「」的只剩沒名字的、選項：rideBlock 名字寫在字裡（GM.caption(\'\',…)／toast）、選項 \'「\'+o[0]+\'」\'、回寄明信片的選項',
    /return nm\+'：「'\+r\.decline\+'」'/.test(st)&&/GM\.choose\(L\.opts\.map\(o=>\(\{t:'「'\+o\[0\]\+'」'\}\)\)\)/.test(st)&&/GM\.choose\(O\.map\(o=>\(\{t:'「'\+o\.t\+'」'\}\)\)/.test(noComments(cur('src/r2y4a3d.js')))&&/GM\.choose\(O\.map\(o=>\(\{t:'「'\+o\.t\+'」'\}\)\)/.test(noComments(cur('src/y2b3d.js')))
    &&/GM\.caption\('',why,3200\)/.test(cur('src/bike3d.js')));
  const wrapSay=[]; for(const f of ['src/story3d.js','src/termend3d.js','src/cracktalk3d.js','src/r2y4a3d.js','src/y2b3d.js']){ const m=noComments(cur(f)).match(/GM\.(say|caption)\(\s*(?!null\b|'')[^,()]*(\([^()]*\))?[^,()]*,\s*'「'\s*\+[^;]*/g)||[]; for(const x of m) wrapSay.push(f+'：'+x.slice(0,80)); }
  check('13. 這五個檔沒有 GM.say(有名字,\'「\'+…)／GM.caption(名字,\'「\'+…) 了',wrapSay.length===0,sample(wrapSay)); }

/* 14. 演出來：BASE 和現在各跑一次 */
const runProbe=m=>{ let o=''; try{ o=cp.execFileSync(process.execPath,[__filename],{env:Object.assign({},process.env,{QUOTE_B3_PROBE:m}),encoding:'utf8',maxBuffer:1<<28,stdio:['ignore','pipe','pipe']}); }catch(e){ o=String(e.stdout||''); }
  const line=o.split('\n').find(l=>l.startsWith('@@B3@@')); return line?JSON.parse(line.slice(6)):{errs:['子程序沒有結果：'+o.slice(-300)]}; };
{ const O=runProbe('old'), N=runProbe('new');
  check('14. 兩次都跑得起來（'+BASE+' 的檔、現在的檔；沒有例外）',!O.errs.length&&!N.errs.length,sample(O.errs.concat(N.errs)));
  const KEYS={ride:'腳踏車上下車字幕',first:'第一次見面',secret:'秘密「其實……」',generic:'一般的「其實……」（pool_more3d）',needed:'沒回訊息那一句',c14:'沒去事務所',card:'小卡',pc1:'明信片第一輪',pc2:'明信片第二輪',sisg:'學姊婉拒、念書',sisgOffer:'「那一起念書。」',acc0:'ACC0'};
  const MIN={ride:10,first:10,secret:5,generic:20,needed:60,c14:1,card:1,pc1:10,pc2:15,sisg:9,sisgOffer:1,acc0:6};
  for(const k of Object.keys(KEYS)){ const A=O[k]||[], B=N[k]||[], bad=[], nw=[]; let ch=0, named=0;
    if(A.length!==B.length) bad.push('句數 '+A.length+' → '+B.length);
    else A.forEach((a,i)=>{ const b=B[i], ta=a[a.length-1], tb=b[b.length-1], wa=a[a.length-2], wb=b[b.length-2];
      if(J(a.slice(0,-1))!==J(b.slice(0,-1))) bad.push('說的人不一樣：'+J(a)+' → '+J(b));
      else if(ta!==tb){ if(wrapped(ta)&&lt(unq(ta))===tb&&wb!=null) ch++; else bad.push(J(a)+' → '+J(b)); }
      if(wb!=null){ named++; if(wrapped(tb)) nw.push(J(b)); } });
    check('14. '+KEYS[k]+'：'+B.length+' 句，說的人和 '+BASE+' 一樣、字只差外面的「」（拿掉 '+ch+' 句）',!!B.length&&bad.length===0&&ch>=MIN[k],sample(bad));
    check('14. '+KEYS[k]+'：有名字說的 '+named+' 句沒有一句外面還有「」',named>=MIN[k]&&nw.length===0,sample(nw)); }
  /* 幾個指定的句子（說的人、字）*/
  const has=(k,pred)=>(N[k]||[]).some(pred);
  check('14. 芷若下車字幕：名字＋（她跳下來，推了一下眼鏡）好，到了，謝啦！（說的人是字幕的名字，不是看開頭的（；拿掉「」只少外面那一對）',has('ride',r=>r[0]==='heroine_02'&&r[1]&&r[2]==='（她跳下來，推了一下眼鏡）好，到了，謝啦！'));
  check('14. 沒回訊息：子晴「我爸要來那則，你沒回。」「……算了，沒差。」有名字、外面沒有「」',has('needed',r=>r[0]==='zq_dad'&&r[2]==='她heroine_04'&&r[3]==='我爸要來那則，你沒回。')&&has('needed',r=>r[0]==='zq_dad'&&r[3]==='……算了，沒差。'));
  check('14. 小卡：小卡說「我們先當朋友。片單我還是會寄。」（外面沒有「」）；前面的旁白沒名字',J(N.card)===J([[null,'（英國寄來一個信封。裡面一張明信片、一張只寫給你的小卡。）'],['小卡','我們先當朋友。片單我還是會寄。']]),J(N.card));
  check('14. 事務所：芯慈「我自己去了。我爸問你怎麼沒來。」',J(N.c14)===J([['芯慈','我自己去了。我爸問你怎麼沒來。']]),J(N.c14));
  check('14. 明信片：旁白（明信片又開始寄來了……）、方奕廷那一行另一種筆跡照舊沒名字、裡面的「這棵樹叫英國櫟……」照留',has('pc2',r=>r[1]===null&&r[2]==='（明信片又開始寄來了。這次的字比較小，寫得比較多。）')&&has('pc2',r=>r[1]===null&&/^（四月那張的最後一行，是另一種筆跡：「這棵樹叫英國櫟。……他說的。」）$/.test(r[2]))&&has('pc2',r=>r[1]==='明信片'&&r[2]==='到英國了。宿舍窗戶看出去，是一棵很大的樹。'));
  check('14. 學姊「好。我帶刑訴。」（念書）、一般的「其實……」：有名字、外面沒有「」',has('sisgOffer',r=>r[0]&&r[1]==='好。我帶刑訴。')&&(N.generic||[]).every(r=>r[1]&&/^其實…….*。沒跟很多人講過。$/.test(r[2])));
}
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}

// AA_598 學姊改稿①c：約會地點台詞（date_lines.js；企劃線 c389462be，AA 定稿＝第 8 節 AA 審查決定；任務 AA598-SIS-1C-1102）——不需要瀏覽器。
// 企劃線源稿（Dxx.py → Dxx.json、BB_128 → D13.json）還沒改，tools/date/import_date_lines.py 照稿的逐句表疊上去（白名單 AA_598@c389462be）。
//   0  白名單、date_lines.js 的來源字串有 AA_598@c389462be；讀得到稿
//   1  第 1～92 列：同一個地點、同一個位置（學姊 heroine_05 的 lines／dislikeLine）現在是「改成」那一句；原句在那個地點學姊的台詞裡一句都不剩
//   2  對稿：每一列的原句、改成都和稿上第 n 列一樣；第 16、85 列照第 8 節第 4、9 點（表上沒跟著改）；第 8 節第 6 點九份（保753）
//   3  新句每句 ≤40 字、最多一個「……」；不說「研究室」（決1 採甲）；D11 北投圖書館的九句都是小聲講；D15 草地那一句是新句（稿 7-6）
//   4  AA_591 整合決定第 9 點：D12 老茶行「這種茶我媽每天喝。我小時候覺得好苦。」（白名單 D12.json＝43d27cd80）；學姊約會台詞不提爸爸
// 修改前（int/m590 d7a468868）：第 0～4 項 FAIL（D15 那一項除外）。用法：node tests/aa598_sis_date_unit.js（在沒有 .git 的目錄跑：設環境變數 AA598_DOCREPO＝有企劃線 commit 的 repo）
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process');
const E694=require('./ellipsis694.js');   /* AA_694（DATE-ELLIPSIS-1105）：約會台詞拿掉句首、。！？後、）後的「……」——表上的句子照同一條規則換了再和 date_lines.js 比 */
const ROOT=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'src/data/date_lines.js'),'utf8'), t=src.split('\n')[2], DL=require('./aa959_map.js').unmapDeep(JSON.parse(t.slice(t.indexOf('=')+1,t.lastIndexOf(';'))),'date_lines.js');   /* AA_959（DLG-FULL-REVIEW-1110）：匯入最後一步照覆寫表換的字先換回來再比 */
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
const SHA='c389462be', DOCF='docs/story_planning/AA_598_學姊改稿_1c_約會地點台詞.md';
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:process.env.AA598_DOCREPO||ROOT,encoding:'utf8',maxBuffer:1<<24,stdio:['ignore','pipe','ignore']}); }catch(e){ DOC=''; }
/* [列, 地點, 位置（lines／dislikeLine＋學姊底下的路徑，用「/」分開；匯入前 date_lines.js 裡原句所在的地方）, 原句, 改成]；最後一列是第 8 節第 6 點九份（表上保753） */
const ROWS=[
  [1, "D02", "lines/hotspots/D02.pond/normal/0/lines/0", "池子的水是循環的。很像讀書，一直繞回來。", "池子的水是循環的。一直繞回來。"],
  [2, "D03", "lines/hotspots/D03.demo/normal/1/lines/0", "我玩到第二關了。比你快。", "我玩到第二關了。你呢？"],
  [3, "D03", "lines/hotspots/D03.demo/normal/2/lines/0", "這關我再試一次。你不要幫我。", "這關我想自己再試一次。"],
  [4, "D03", "lines/hotspots/D03.arcade/first/lines/1", "左手、右手。……很像整理判決的時候。", "左手、右手。……看起來好難。"],
  [5, "D03", "lines/hotspots/D03.gacha/normal/2/lines/0", "我轉了一次。……期望值是負的，我知道。", "我轉了一次。……就一次。"],
  [6, "D03", "lines/hotspots/D03.window/normal/0/lines/0", "我喜歡在高的地方看路口。很像看判決的結構。", "我喜歡在高的地方看路口。"],
  [7, "D05", "lines/arrive/first/lines/0", "我上次進電影院，是大一的時候。", "這間電影院我沒來過。"],
  [8, "D07", "lines/hotspots/D07.wall/normal/2/lines/0", "我想做的研究，跟這面牆有關。……我還沒想清楚。", "那時候沒有人能幫他們。……我想做的事，跟這個有關。"],
  [9, "D08", "lines/hotspots/D08.panda/remember/lines/0", "那隻熊貓今天還是在睡。……我很羨慕。", "那隻貓熊今天還是在睡。……我很羨慕。"],
  [10, "D09", "lines/hotspots/D09.tea/first/choice/1/reply/0", "不會。……教我。", "會一點。……你泡給我看？"],
  [11, "D09", "lines/hotspots/D09.tea/remember/lines/0", "上次你教我泡茶。我回去買了一個小茶壺。", "上次在這裡喝的茶，我回去買了一個小茶壺。"],
  [12, "D09", "lines/hotspots/D09.view/normal/1/lines/0", "風大。你外套的拉鍊拉起來。", "風大。你外套拉鍊要不要拉起來？"],
  [13, "D10", "lines/hotspots/D10.bridge/first/lines/1", "我不喜歡沒辦法控制的東西。", "我不太敢走會晃的橋。"],
  [14, "D10", "lines/hotspots/D10.boat/remember/lines/0", "上次你教我踩。今天我會了。我踩得比較快。", "上次踩得好累。今天我會了。"],
  [15, "D10", "lines/hotspots/D10.snack/remember/lines/0", "今天我請。上次是你。", "今天我請。"],
  [16, "D11", "lines/hotspots/D11.library/first/lines/0", "（木造的圖書館）……我想在這裡寫論文。", "（木造的圖書館。她小聲說）我想在這裡寫論文。"],
  [17, "D11", "lines/hotspots/D11.library/first/lines/1", "我知道不行。太遠了。", "（小聲）我知道不行。太遠了。"],
  [18, "D11", "lines/hotspots/D11.library/first/choice/0/reply/0", "……好。你陪我。", "（小聲）好。你陪我。"],
  [19, "D11", "lines/hotspots/D11.library/first/choice/1/reply/0", "……好。我有帶一篇。", "（小聲）好。我有帶一篇。"],
  [20, "D11", "lines/hotspots/D11.library/normal/0/lines/0", "這裡的椅子很好坐。研究室的可以丟了。", "（小聲）這裡的椅子很好坐。"],
  [21, "D11", "lines/hotspots/D11.library/normal/1/lines/0", "窗外的樹在動。……我看了五分鐘。", "（小聲）窗外的樹在動。我看了五分鐘。"],
  [22, "D11", "lines/hotspots/D11.library/normal/2/lines/0", "你在讀什麼？借我看一下。", "（小聲）你在讀什麼？"],
  [23, "D11", "lines/hotspots/D11.library/remember/lines/0", "上次帶來的那篇，我讀完了。在這裡讀完的。", "（小聲）又來了。這次我有帶書。"],
  [24, "D11", "lines/hotspots/D11.library/dating/0/lines/0", "（她在你旁邊讀書）……不要看我。讀你的。", "（她在你旁邊讀書）（小聲）不要看我。讀你的。"],
  [25, "D13", "lines/hotspots/D13.bench/remember/lines/0", "上次你叫我靠著椅背，我回去試了，沒用。", "上次坐這裡，背挺得好直。……今天靠著椅背。"],
  [26, "D16", "lines/hotspots/D16.rest/first/lines/1", "休息十五分鐘。你眼睛很紅。", "休息一下吧。你眼睛很紅。"],
  [27, "D16", "lines/hotspots/D16.rest/first/choice/0/reply/0", "……你等一下還要開回去。休息。", "……你等一下還要開回去。"],
  [28, "D17", "lines/hotspots/D17.mushroom/remember/lines/0", "上次你叫我慢一點。……今天我走在你後面。", "上次走得太快。今天我走在你後面。"],
  [29, "D17", "lines/hotspots/D17.platform/first/choice/1/reply/0", "……不要提論文。……好，是有點像。", "不要提論文。……好，是有點像。"],
  [30, "D18", "lines/arrive/normal/2/lines/0", "我今天沒有帶計畫本。……我忘了。故意的。", "我今天沒有帶計畫本。"],
  [31, "D18", "lines/hotspots/D18.teahouse/first/lines/1", "茶我來泡。你不要碰。", "茶我來泡。"],
  [32, "D18", "lines/hotspots/D18.shop/remember/lines/0", "上次的陶杯，我放在研究室。每天都用。", "這家還在。……上次那個陶杯，我很喜歡。"],
  [33, "D19", "lines/hotspots/D19.houses/first/choice/1/reply/0", "……好。……木頭又響了。", "好。……木頭又響了。"],
  [34, "D21", "lines/hotspots/D21.temple/first/choice/0/reply/0", "……不要提。……好，有一點像。", "不要提。……好，有一點像。"],
  [35, "D21", "dislikeLine/D21.dye", "手會染藍……下週要見教授。我在旁邊看你染。……好吧，我戴手套。", "手會染藍。下週要見教授。我在旁邊看你染。……好吧，我戴手套。"],
  [36, "D22", "lines/hotspots/D22.dam/normal/0/lines/0", "你外套拉起來。上面比下面冷很多。", "上面比下面冷很多。你外套要不要拉起來？"],
  [37, "D22", "lines/hotspots/D22.dam/remember/lines/0", "上次說用了多少人。我回去查了，蓋了好幾年。", "這道壩，我回去查了。蓋了好幾年。"],
  [38, "D22", "lines/hotspots/D22.lake/first/choice/1/reply/0", "……在想晚餐。……真的。", "在想晚餐。……真的。"],
  [39, "D22", "lines/hotspots/D22.lake/remember/lines/0", "上次坐在這裡，你都沒說話。……我很喜歡。", "又坐在這裡了。……這裡很安靜。"],
  [40, "D22", "lines/hotspots/D22.fish/remember/lines/0", "上次飲料是你請的。今天飯也讓你請？……不行。", "今天這家，還是我請。"],
  [41, "D23", "lines/arrive/normal/2/lines/0", "今天的行事曆，只寫了一個字：海。", "今天什麼都沒排。來看海。"],
  [42, "D23", "lines/hotspots/D23.boats/normal/2/lines/0", "你去買兩杯熱的。我在這裡等你。", "要不要買兩杯熱的？我在這裡等你。"],
  [43, "D23", "lines/hotspots/D23.boats/remember/lines/0", "上次問船上的人有沒有休假。……我查了。很少。", "上次看到的那幾艘船，今天出海了。"],
  [44, "D24", "lines/hotspots/D24.footbath/first/choice/0/reply/0", "……好。（她把腳放進去）……原來這麼舒服。", "好。（她把腳放進去）……原來這麼舒服。"],
  [45, "D24", "lines/hotspots/D24.park/remember/lines/0", "上次說只坐一下，結果坐到天黑。", "上次在這裡待到天黑。"],
  [46, "D24", "lines/hotspots/D24.station/first/choice/0/reply/0", "……好。這句話我需要時間消化。", "……好。那就搭下一班。"],
  [47, "D26", "lines/hotspots/D26.village/first/choice/0/reply/0", "……研究室到宿舍。對。今天換一條。", "……學校到家。對。今天換一條。"],
  [48, "D26", "lines/hotspots/D26.plaza/remember/lines/0", "上次你放的風箏，飛很高。……我拍了。", "又有人在放風箏。……今天風比上次好。"],
  [49, "D27", "lines/hotspots/D27.shop/remember/lines/0", "上次你挑的筆筒，在我的研究室裡。……大家都問。", "上次買的筆筒，我每天都在用。"],
  [50, "D27", "lines/hotspots/D27.rail/remember/lines/0", "上次說排進寒假。……我真的排了。", "這種火車，我後來查了。上山要坐很久。"],
  [51, "D28", "lines/hotspots/D28.museum/normal/2/lines/0", "這份的字好小。……你幫我念。", "這份的字好小。……你可以念給我聽嗎？"],
  [52, "D28", "lines/hotspots/D28.alley/remember/lines/0", "上次在這裡迷路。……今天也想迷路一次。", "今天想在這裡迷路一次。"],
  [53, "D28", "lines/hotspots/D28.sunset/normal/2/lines/0", "風變冷了。你外套拉起來。", "風變冷了。你外套要不要拉起來？"],
  [54, "D29", "lines/hotspots/D29.sculpture/remember/lines/0", "上次坐在影子裡，喝了半瓶冰茶。今天裝滿了。", "上次的冰茶，一下就喝完了。今天裝滿了。"],
  [55, "D29", "lines/hotspots/D29.rail/first/choice/0/reply/0", "……好。（她走得很穩）……我平衡感很好。", "好。（她走得很穩）……我平衡感很好。"],
  [56, "D29", "lines/hotspots/D29.rail/remember/lines/0", "上次走軌道，我沒有掉下來。今天也不會。", "今天也走在軌道上。……我不會掉下來。"],
  [57, "D30", "lines/hotspots/D30.pebble/remember/lines/0", "上次那顆，我拍的照片還在手機裡。", "上次那顆很圓的石頭，今天找不到了。"],
  [58, "D30", "lines/hotspots/D30.bike/remember/lines/0", "上次騎到一半我停下來。今天也要停。", "今天騎到一半，也要停下來喝水。"],
  [59, "D31", "lines/hotspots/D31.trail/remember/lines/0", "上次在這裡坐太久，後面全部延後。", "又走到這裡了。今天也慢慢走。"],
  [60, "D31", "lines/hotspots/D31.pier/remember/lines/0", "上次我坐中間，沒有暈船。今天也不會。", "今天坐船。我坐中間，比較不晃。"],
  [61, "D31", "lines/hotspots/D31.ropeway/normal/0/lines/0", "從上面看，湖的形狀很清楚。像一份整理好的筆記。", "從上面看，湖的形狀很清楚。"],
  [62, "D31", "lines/hotspots/D31.ropeway/remember/lines/0", "上次我說一點點怕。今天不怕了。", "今天不怕了。……還是不往下看。"],
  [63, "D31", "lines/hotspots/D31.egg/normal/2/lines/0", "蛋殼不要丟地上。那邊有垃圾桶。", "蛋殼我拿去丟。那邊有垃圾桶。"],
  [64, "D31", "lines/hotspots/D31.egg/remember/lines/0", "上次是我排的。今天也我排。你去找位子。", "今天我排。你去找位子？"],
  [65, "D32", "lines/hotspots/D32.cloud/remember/lines/0", "上次說像棉被。今天更像了。", "雲海今天也很厚。……像棉被。"],
  [66, "D02", "lines/closing/normal/0/lines/0", "回去吧。明天還要去研究室。……我不是想走。", "回去吧。明天還要去法圖。……我不是想走。"],
  [67, "D02", "lines/hotspots/D02.books/dating/0/lines/0", "這本，你幫我選的。我會放在研究室的桌上。", "這本，你幫我選的。我會放在書桌上。"],
  [68, "D03", "lines/hotspots/D03.arcade/normal/1/lines/0", "這首我聽過。……研究室隔壁有人一直放。", "這首我聽過。……隔壁鄰居一直放。"],
  [69, "D03", "lines/hotspots/D03.gacha/normal/1/lines/0", "那隻狐狸，很像研究室的學弟。", "那隻狐狸，很像法服的學弟。"],
  [70, "D03", "lines/hotspots/D03.window/normal/2/lines/0", "週末的研究室沒有人。……我今天也不想去。", "週末的法圖人很少。……我今天也不想去。"],
  [71, "D05", "lines/closing/normal/0/lines/0", "回去吧。明天要去研究室。……不是想走。", "回去吧。明天要去法圖。……不是想走。"],
  [72, "D07", "lines/closing/normal/0/lines/0", "回去吧。明天要去研究室。", "回去吧。明天要去法圖。"],
  [73, "D08", "lines/arrive/normal/2/lines/0", "我把筆電留在研究室了。今天帶不走工作。", "我把筆電留在家裡了。今天帶不走工作。"],
  [74, "D09", "lines/closing/normal/0/lines/0", "回去吧。明天八點，我要去研究室。", "回去吧。明天八點，我要去法圖。"],
  [75, "D09", "lines/hotspots/D09.tea/normal/2/lines/0", "這個茶葉，我想買一包放研究室。", "這個茶葉，我想買一包回家。"],
  [76, "D09", "lines/hotspots/D09.view/first/choice/0/reply/0", "嗯。研究室那棟應該在那邊。……看不到。", "嗯。法學院應該在那邊。……看不到。"],
  [77, "D09", "lines/hotspots/D09.path/normal/2/lines/0", "這裡的空氣，比研究室好太多了。", "這裡的空氣，比法圖好太多了。"],
  [78, "D10", "lines/hotspots/D10.snack/first/choice/0/reply/0", "……好吃。比研究室的便當好吃。", "……好吃。比學校的便當好吃。"],
  [79, "D11", "lines/arrive/normal/2/lines/0", "今天手機放包包裡了。研究室的人找不到我。", "今天手機放包包裡了。誰都找不到我。"],
  [80, "D14", "lines/closing/normal/0/lines/0", "回去吧。我明天八點要到研究室。", "回去吧。我明天八點要到法圖。"],
  [81, "D14", "lines/hotspots/D14.sunset/first/lines/0", "（夕陽）……研究室的窗戶看不到這個。", "（夕陽）……法圖的窗戶看不到這個。"],
  [82, "D14", "lines/hotspots/D14.sunset/first/choice/1/reply/0", "……明天我在研究室。所以今天要看完。", "……明天我在法圖。所以今天要看完。"],
  [83, "D17", "lines/closing/first/lines/1", "……我回去要直接睡。研究室明天再去。", "……我回去要直接睡。法圖明天再去。"],
  [84, "D17", "lines/closing/normal/0/lines/0", "回去吧。明天要去研究室。……我不是想走。", "回去吧。明天要去法圖。……我不是想走。"],
  [85, "D18", "lines/hotspots/D18.teahouse/first/choice/0/reply/0", "研究室的茶都是我泡的。", "家裡的茶都是我泡的。"],
  [86, "D19", "lines/arrive/dating/0/lines/0", "今天我只帶了保溫瓶。其他都放研究室了。", "今天我只帶了保溫瓶。其他都放家裡了。"],
  [87, "D23", "lines/arrive/normal/1/lines/0", "今天的筆電留在研究室。", "今天的筆電留在家裡。"],
  [88, "D23", "lines/hotspots/D23.cook/remember/lines/0", "上次說下次換你。……今天你請了。謝謝。", "上次這家的魚湯，我一直記得。今天也點。"],
  [89, "D28", "lines/hotspots/D28.circle/normal/2/lines/0", "樹下的風，比研究室的冷氣好。", "樹下的風，比法圖的冷氣好。"],
  [90, "D29", "lines/arrive/normal/2/lines/0", "研究室的訊息我晚上再一起回。現在不看。", "訊息我晚上再一起回。現在不看。"],
  [91, "D30", "lines/arrive/normal/2/lines/0", "研究室的人問我去哪，我說海邊。他們不信。", "同學問我去哪，我說海邊。他們不信。"],
  [92, "D30", "lines/closing/normal/0/lines/0", "回去吧。後天要去研究室。……不是想走。", "回去吧。後天要去法圖。……不是想走。"],
  ["九份", "D18", "lines/hotspots/D18.steps/first/choice/0/reply/0", "老街是慢慢蓋出來的。……每一家砌自己門口那一段。", "老街是慢慢蓋出來的。"],
];
const at=(loc,p)=>{ const [sec,...rest]=p.split('/'); let o=((DL.loc[loc]||{})[sec]||{}).heroine_05;
  for(const k of rest){ if(o==null) break; o=o[/^\d+$/.test(k)?+k:k]; }
  return (o&&typeof o==='object')?o.text:o; };
const allHers=loc=>{ const out=[]; const w=x=>{ if(Array.isArray(x)) x.forEach(w); else if(x&&typeof x==='object'){ if(typeof x.text==='string') out.push(x.text); Object.values(x).forEach(w); } };
  w(((DL.loc[loc]||{}).lines||{}).heroine_05); out.push(...Object.values(((DL.loc[loc]||{}).dislikeLine||{}).heroine_05||{})); return out; };

/* 0 */
const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8'));
const ent=allow.files.filter(e=>e.path===DOCF);
check('0. 白名單：AA_598@c389462be approved、task AA598-SIS-1C-1102（只有一筆）',ent.length===1&&ent[0].sha===SHA&&ent[0].status==='approved'&&!!ent[0].approvedBy&&ent[0].task==='AA598-SIS-1C-1102',J(ent));
check('0. date_lines.js 的來源（開頭註解＋source）有 AA_598@c389462be',src.split('\n')[0].includes('AA_598_學姊改稿_1c_約會地點台詞.md@'+SHA)&&String(DL.source).includes('＋AA_598_學姊改稿_1c_約會地點台詞.md@'+SHA)   /* 合併 anb 以後 AA_594 也疊在後面：只看有沒有，不看是不是最後一個 */,String(DL.source).slice(-120));
check('0. 讀得到稿（企劃線 '+SHA+'）',DOC.includes('## 8. AA 審查決定'),'讀不到；在沒有企劃線 commit 的地方跑要設 AA598_DOCREPO');

/* 1 */
check('1. 表上 92 列＋九份一句（列號 1～92 各一次）',ROWS.length===93&&J(ROWS.filter(r=>typeof r[0]==='number').map(r=>r[0]).sort((a,b)=>a-b))===J(Array.from({length:92},(_,i)=>i+1)));
/* 2026-11-11（X324 學姊約會台詞重寫，AA 82c946ad7）：學姊 33 個地點的約會台詞重寫（源稿 date_system/lines@82c946ad7）——AA_598 這 93 列裡，新稿重寫了的格（那一格的源稿和上一版 2883197b6 不一樣）＝現在是新稿的字，AA_598 的原句對不到、跳過（55 列）；
   新稿沒動的格照舊是 AA_598 的「改成」（38 列）。新稿的逐字比對在 tests/sis_dates_1111_unit.js */
const SRCG=(sha,loc)=>{ try{ return JSON.parse(cp.execFileSync('git',['show',sha+':docs/story_planning/date_system/lines/'+loc+'.json'],{cwd:process.env.AA598_DOCREPO||ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<26})); }catch(e){ return null; } };
const srcAt=(S,p)=>{ if(!S) return undefined; const [sec,...rest]=p.split('/'); let o=(S[sec]||{}).heroine_05; for(const k of rest){ if(o==null) break; o=o[/^\d+$/.test(k)?+k:k]; } return (o&&typeof o==='object')?o.text:o; };
const SC={}; const rewritten=(loc,p)=>{ if(!SC[loc]) SC[loc]=[SRCG('82c946ad7',loc),SRCG('2883197b6',loc)]; const [a,b]=SC[loc]; if(!a||!b) return null; const x=srcAt(a,p), y=srcAt(b,p); return x!==y?x:false; };
const notNew=ROWS.filter(([n,loc,p,o,nw])=>at(loc,p)!==E694.strip(nw)), noSrc=notNew.some(r=>rewritten(r[1],r[2])===null);
/* 2026-11-12（X324 學姊續改 AA_837＋AA_838@a573a50dca）：之後 AA 又改學姊的格子（82c946ad7 以後的版本）——那一格現在的源稿（tests/date_src_sha.js 的 ALLOW_SHA）和 2883197b6 不一樣、遊戲＝現在的源稿，也算「重寫了、是新稿的字」。
   舊寫法只認 82c946ad7 那一版：return x===false||at(loc,p)!==x */
const SN={}; const rewrittenNow=(loc,p)=>{ if(!SN[loc]) SN[loc]=[SRCG(require('./date_src_sha.js').ALLOW_SHA,loc),SRCG('2883197b6',loc)]; const [a,b]=SN[loc]; if(!a||!b) return null; const x=srcAt(a,p), y=srcAt(b,p); return x!==y?x:false; };
const badPos=noSrc?[]:notNew.filter(([n,loc,p])=>{ const x=rewritten(loc,p); if(x!==false&&at(loc,p)===x) return false; const z=rewrittenNow(loc,p); return z===null||z===false||at(loc,p)!==z; });
check('1. 每一列：同一個地點、同一個位置現在是 AA_598 的新句（'+(ROWS.length-notNew.length)+'／'+ROWS.length+'），或那一格 X324 重寫了、是新稿的字（'+notNew.length+' 列'+(noSrc?'；這份 checkout 讀不到源稿，只對列數':'')+'）',!badPos.length&&ROWS.length-notNew.length===28&&notNew.length===65,J(badPos.map(r=>[r[0],r[1],r[2],at(r[1],r[2])])));   /* 2026-11-12（X324 學姊續改 AA_837＋AA_838@a573a50dca）：第 11、30、41、45、57 列那五格（D09 茶 remember、D18／D23 到達、D24 公園 remember、D30 石頭 remember）這一版重寫了，現在是新稿的字。舊期望：38 列是 AA_598 的新句、55 列重寫了 */   /* 2026-11-12（X324「好」開頭回話 AA_842@41f77eab53）：學姊跳過的列 86→95——AA_598 逐句表第 19、33、44、46、55 列（D11 圖書館、D19 木屋、D24 泡腳／車站、D29 鐵道第一次選項的回話，原句都是「好。…」開頭）那五格這一版重寫了（換 4→1、已經是新句 29→27、跳過 60→65），AA_694 第 3 節第 162、195、196、238 列跟著跳過（22→26）。舊期望：33 列是 AA_598 的新句、60 列重寫了 */
const oldLeft=ROWS.filter(([n,loc,p,o,nw])=>allHers(loc).includes(o)||(E694.strip(o)!==E694.strip(nw)&&allHers(loc).includes(E694.strip(o))));
check('1. 原句在那個地點學姊的台詞裡一句都不剩',!oldLeft.length,J(oldLeft.map(r=>[r[0],r[1],r[3]])));
const oldAnywhere=ROWS.filter(([n,loc,p,o,nw])=>src.includes(J(o))||(E694.strip(o)!==E694.strip(nw)&&src.includes(J(E694.strip(o)))));
check('1. 原句在 date_lines.js 整個檔都不在（稿第 4 節：92 句原本都只出現一次）',!oldAnywhere.length,J(oldAnywhere.map(r=>[r[0],r[3]])));

/* 2 */
const tbl={}; for(const ln of DOC.split('\n')){ const m=ln.match(/^\|\s*(\d+)\s*\|\s*`(D\d\d)`[^|]*\|\s*學姊\s*\|([^|]*)\|([^|]*)\|/); if(m) tbl[+m[1]]={loc:m[2],old:m[3].trim(),nw:m[4].trim()}; }
const OVER={16:'「（木造的圖書館。她小聲說）……」',85:'換「家裡的茶都是我泡的。」'};
const badDoc=ROWS.filter(([n,loc,p,o,nw])=>{ if(n==='九份') return false; const r=tbl[n]; if(!r||r.loc!==loc||r.old!==o) return true; return OVER[n]?false:r.nw!==nw; });
check('2. 每一列的地點、原句、改成和稿上第 n 列一樣（第 16、85 列另外看）',!!DOC&&Object.keys(tbl).length===92&&!badDoc.length,J(badDoc.map(r=>[r[0],tbl[r[0]]])));
const s8=DOC.slice(Math.max(0,DOC.indexOf('## 8. AA 審查決定')));
const r16=ROWS.find(r=>r[0]===16), r85=ROWS.find(r=>r[0]===85), r9=ROWS.find(r=>r[0]==='九份');
check('2. 第 16 列照第 8 節第 4 點合成一個括號「（木造的圖書館。她小聲說）」',s8.includes(OVER[16])&&r16[4]==='（木造的圖書館。她小聲說）我想在這裡寫論文。',r16[4]);
check('2. 第 85 列照第 8 節第 9 點「家裡的茶都是我泡的。」',s8.includes(OVER[85])&&r85[4]==='家裡的茶都是我泡的。',r85[4]);
check('2. 九份（保753）照第 8 節第 6 點「老街是慢慢蓋出來的。」',s8.includes('改成「老街是慢慢蓋出來的。」')&&DOC.includes('| 保753 | `D18`')&&DOC.includes(r9[3])&&r9[4]==='老街是慢慢蓋出來的。',J(r9));

/* 3 */
const NEWS=ROWS.map(r=>r[4]);
const long=NEWS.filter(s=>[...s].length>40), dots=NEWS.filter(s=>(s.match(/……/g)||[]).length>1);
check('3. 新句每句 ≤40 字、最多一個「……」',!long.length&&!dots.length,J({long,dots}));
const lab=[]; for(const loc of Object.keys(DL.loc)) for(const s of allHers(loc)) if(s.includes('研究室')) lab.push(loc+' '+s);
check('3. 學姊的約會地點台詞不說「研究室」（決1 採甲：法圖／家裡／學校）',!lab.length,J(lab));
const lib=ROWS.filter(r=>r[2].startsWith('lines/hotspots/D11.library/'));
check('3. D11 北投圖書館九句（第 16～24 列）都是小聲講、沒有「……」',lib.length===9&&lib.every(r=>/（小聲）|她小聲說）/.test(r[4])&&!r[4].includes('……')),J(lib.map(r=>r[4])));
const D15=at('D15','lines/hotspots/D15.sky/normal/0/lines/0');
check('3. D15 停車場邊的草地平常第 1 套是 AA_436 的新句（稿 7-6；企劃線 D15.py:23 還是舊句，D15.json 和遊戲是新句）',D15===E694.strip('上次那顆是飛機。……今天雲比較多，連飛機都沒有。'),D15);

/* 4 AA_591「整合時的 AA 決定」第 9 點（企劃線 43d27cd80，D12.py、D12.json 已改；白名單 D12.json 換到 43d27cd80 重匯）：她爸爸在遊戲開始前過世、不提 */
const TEA_OLD='這種茶我爸以前每天喝。我那時候覺得好苦。', TEA_NEW='這種茶我奶奶每天喝。我小時候覺得好苦。';   /* AA_609 第 6 點（使用者 11-03 爸爸改奶奶）：白名單 D12.json 前進到 2b4969352 */
const d12=allow.files.filter(e=>e.path==='docs/story_planning/date_system/lines/D12.json');
/* 2026-11-11（X327 沛珊重寫）：白名單 D12.json 前進到 2883197b6（AA_756，只動沛珊的格子；1b095a239 留在 history）；同一天（X324 學姊重寫）再前進到 82c946ad7 */
/* 2026-11-11（X324 語彤約會台詞重寫，AA 0a2136911）：白名單改認 0a2136911（語彤 33 個地點重寫、學姊 34 格修正寫回源稿），82c946ad7 留 history */
/* 2026-11-11（X324 可昕約會台詞重寫，AA f9c1a2b80）：白名單再改認 f9c1a2b80（只動可昕的格子），0a2136911 留 history */
/* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：白名單再改認 a29a8aba0（芷若的格子重寫），f9c1a2b80 留 history；現在的版本讀 tests/date_src_sha.js（以後換版只改那一處） */
const SHA_NOW=require('./date_src_sha.js').ALLOW_SHA;
check('4. 白名單 D12.json＝'+SHA_NOW+'（tests/date_src_sha.js；approved；舊的 f9c1a2b80（可昕重寫）、0a2136911（語彤重寫）、82c946ad7（學姊重寫）、2883197b6（AA_756）、1b095a239（AA_694）、2b4969352（AA_609）、a5b936a69、43d27cd80 留在 history）',d12.length===1&&d12[0].sha===SHA_NOW&&d12[0].status==='approved'&&['f9c1a2b80','0a2136911','82c946ad7','2883197b6','1b095a239','2b4969352','a5b936a69','43d27cd80'].every(x=>(d12[0].history||[]).some(h=>h.sha===x))&&String(DL.source).includes('D12.json@'+SHA_NOW),J(d12.map(e=>e.sha)));
check('4. D12 老茶行第一次：學姊說「'+TEA_NEW+'」（同一個位置），「我爸」那句整個檔都不在',at('D12','lines/hotspots/D12.tea/first/lines/1')===TEA_NEW&&!src.includes(TEA_OLD),at('D12','lines/hotspots/D12.tea/first/lines/1'));
const dad=[]; for(const loc of Object.keys(DL.loc)) for(const s of allHers(loc)) if(/我爸|爸爸/.test(s)) dad.push(loc+' '+s);
check('4. 學姊的約會地點台詞不提爸爸',!dad.length,J(dad));

console.log(fails?('FAIL '+fails+' 項'):'全部通過');
process.exit(fails?1:0);

// AA_308 第 3、7、9 節（經濟系；使用者 10-20 選「駁二＋大港橋、西子灣看夕陽、旗津」；X52、X60、X62）——不需要瀏覽器。
//   1. 高雄三天兩夜（ev_y0_kh3）分場：新崛江 → 駁二、大港橋（二選一）→ 瑞豐夜市 → 旗津 → 西子灣 → 美麗島站 → 蓮池潭，每個地點一張場景字卡＋背景；
//      拿掉一句帶過的旁白「（三天兩夜。新崛江、美麗島站……）」；蓮池潭的國文報告兩句拿掉（1/8 公館說過了），換「國文那科，一定會被當。」；表情照第 9 節。
//   2. 新背景：新崛江、駁二、西子灣還沒有圖＝深色底＋地點字幕；瑞豐夜市暫用「她家附近的夜市」、旗津暫用「港邊」（檔案都在）。
//   3. 7/25 落點表（KH-SCORE-TIMING）：收到成績簡訊的時候補習班的落點還沒出來——
//      客運版：車上沒有落點表，「我的還好。」的回覆是「……好。等你到了再說。」；08:00 到站 → 早餐店 → 10:00 落點表 →「……恭喜你。」…「你從看到表到現在，都沒有看我。」；
//      在家版：07:30 沒有落點表，10:00 才有三句（落點、她的截圖、考上的話）。表情照第 9 節。
// 修改前 1～3 都 FAIL。用法：node tests/aa308_batch3_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/outings3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const ev=id=>STORY_EVENTS.find(e=>e.id===id), J=JSON.stringify;
const texts=d=>d.filter(l=>l&&l.text&&!l.phone).map(l=>l.text);
// 1
{ const e=ev('ev_y0_kh3'), D=e.dialogue, T=texts(D), S=D.filter(l=>l.scene).map(l=>l.scene+'|'+l.bg);
  check('1. 七個地點依序分場、每場有背景', J(S)===J(['高雄・新崛江|kh_xinjuejiang','高雄・駁二、大港橋|kh_pier2','高雄・瑞豐夜市|kh_ruifeng','高雄・旗津|kh_cijin','高雄・西子灣|kh_sizihwan','高雄・美麗島站|kh_dome','高雄・蓮池潭|kh_lotus_bench']), J(S));
  check('1. 第一句「（大年初三。你開了四個多小時的車到高雄。……先去吃早午餐。」）」；沒有一句帶過三天的旁白', T[0]==='（大年初三。你開了四個多小時的車到高雄。她在家樓下等你，一上車就說：「先去吃早午餐。」）'&&!T.some(t=>/^（三天兩夜。/.test(t)), T[0]);
  const ch=D.find(l=>l.choice&&l.choice.length===2); check('1. 大港橋二選一「轉得好慢。」→「慢才好看。」、（拍她的照片）→「……拍好看一點。」', !!ch&&J(ch.choice.map(c=>c.text))===J(['「轉得好慢。」','（拍她的照片）'])&&T.includes('慢才好看。')&&T.includes('……拍好看一點。'));
  check('1. 西子灣「……以前不開心的時候，我會一個人來這裡。」、太陽掉進海裡', T.includes('……以前不開心的時候，我會一個人來這裡。')&&T.includes('（太陽掉進海裡。她沒有再說話。）'));
  const i=T.indexOf('成績下禮拜出來。'); check('1. 蓮池潭：「成績下禮拜出來。」「國文那科，一定會被當。」「我在想要不要休學。」；國文報告兩句拿掉（1/8 公館說過了）', i>0&&T[i+1]==='國文那科，一定會被當。'&&T[i+2]==='我在想要不要休學。'&&!T.some(t=>/國文那份報告|不能補交|整科就那一份/.test(t)), J(T.slice(i,i+3)));
  const ex=t=>(D.find(l=>l.text===t)||{}).expression, E={'這家一定要喝。我高中每天下課都來。':'smile','它下午會轉。我高一那年，第一次跟同學來看。':'smile','慢才好看。':'smile','……拍好看一點。':'embarrassed','這個你一定要吃。……那個也是。':'laugh','我在看風景。':'teasing','……以前不開心的時候，我會一個人來這裡。':'sad','成績下禮拜出來。':'serious','國文那科，一定會被當。':'sad','我在想要不要休學。':'thinking','……你是說真的？':'surprised','你十二月去補習班那天就想考了吧。':'teasing','好。一起。':'smile','你是說我會盯你。':'teasing','……好。我盯你。':'smile','先說好。我考法律，不是因為你。':'serious','我寒假就在查了。你只是剛好先說。':'teasing','我呢？':'surprised','那回台北，一起去問。':'smile'};
  check('1. AA_368 L6：大港橋「它下午會轉。我高一那年，第一次跟同學來看。」（她 2021 年上高中，橋已經在了；原本「一天只轉一次。我高中的時候，還沒有這座橋。」）', T.includes('它下午會轉。我高一那年，第一次跟同學來看。')&&!T.some(t=>/一天只轉一次|還沒有這座橋/.test(t)));
  const bad=Object.keys(E).filter(t=>ex(t)!==E[t]); check('1. 可昕的表情照 AA_308 第 9 節', bad.length===0, J(bad));
  check('1. 結尾照舊記 RETAKE_TOGETHER、E27B_PLAN、KH_TRIP_DONE', D.some(l=>l.set&&l.set.RETAKE_TOGETHER&&l.set.E27B_PLAN&&l.set.KH_TRIP_DONE)); }
// 2
{ const B=OUT.BG||{};
  check('2. 新崛江、駁二、西子灣登記了；2026-10-21 BB 第 95 組（4d98fad2）有圖了（原本深色底）', ['kh_xinjuejiang','kh_pier2','kh_sizihwan'].every(k=>B[k]&&OUT.bg(k).image==='assets/bg/'+k+'.webp'&&fs.existsSync(path.join(ROOT,B[k].image))));
  check('2. 瑞豐夜市、旗津：2026-10-21 BB 第 95 組換成自己的圖（原本暫用夜市、港邊；檔案都在）', B.kh_ruifeng&&B.kh_ruifeng.image==='assets/bg/kh_ruifeng.webp'&&B.kh_cijin&&B.kh_cijin.image==='assets/bg/kh_cijin.webp'&&fs.existsSync(path.join(ROOT,B.kh_ruifeng.image))&&fs.existsSync(path.join(ROOT,B.kh_cijin.image))); }
// 3
{ const D=ev('ev_y0_kh_bus').dialogue, iA=D.findIndex(l=>l.scene==='高雄・客運站出口'), pre=D.slice(0,iA), T=texts(D), P=D.filter(l=>l&&l.phone).map(l=>l.text);
  check('3. 客運版：到站以前沒有落點表（「落點」「差了一大截」「考上的話」）', iA>0&&!texts(pre).some(t=>/落點|差了一大截|考上的話/.test(t)), J(texts(pre)));
  check('3. 客運版「我的還好。」的回覆是「……好。等你到了再說。」（不是「你騙人。我看得到表。」）', P.includes('……好。等你到了再說。')&&!P.includes('你騙人。我看得到表。'), J(P));
  check('3. 客運版吵架在早餐店：「（她走了。你在早餐店外面站了很久。）」（AA-C 10-20 14:0x）', T.includes('（她走了。你在早餐店外面站了很久。）')&&!T.includes('（她走了。你在客運站外面站了很久。）'));
  const iB=T.indexOf('（早餐店。她點了兩份蛋餅，說今天要慶祝，先吃再說。）'), iT=T.indexOf('（十點，手機震了一下。補習班傳來今年的落點預估表。）');
  check('3. 客運版：早餐店 → 10:00 落點表 →「……恭喜你。」…「你從看到表到現在，都沒有看我。」', iB>0&&iT>iB&&T[iT+1]==='（你那個分數，在首都帝大法律那一格。她那個分數，在木柵大學法律那一格。）'&&T[iT+2]==='（她也在看同一張表。兩個人都沒有說話。）'&&T[iT+3]==='……恭喜你。'&&T.includes('你從看到表到現在，都沒有看我。')&&!T.includes('你從下車到現在，都沒有看我。'), J(T.slice(iB,iT+4)));
  const k=D.findIndex(l=>l.text==='（十點，手機震了一下。補習班傳來今年的落點預估表。）'), adv=D.slice(iA,k).filter(l=>l.advance).map(l=>l.advance({hour:8}));
  check('3. 客運版：落點表那句以前把時間推到 10:00', adv.length>0&&adv[adv.length-1]===2, J(adv));
  const ex=t=>(D.find(l=>l.text===t)||{}).expression, E={'……恭喜你。':'sad','你可以高興一點。我又不會怎樣。':'annoyed','你從看到表到現在，都沒有看我。':'annoyed','……我知道我考不好。我不用你幫我難過。':'annoyed','我先回家。你自己逛一下。':'annoyed','早上那樣，對不起。':'sad','車上吃。不要在車上難過。':'smile'};
  const bad=Object.keys(E).filter(t=>ex(t)!==E[t]); check('3. 客運版可昕的表情照 AA_308 第 9 節', bad.length===0, J(bad)); }
{ const D=ev('ev_y0_kh_home').dialogue, T=texts(D), i=T.indexOf('（十點，補習班傳來今年的落點預估表。你那個分數，在首都帝大法律那一格。）');
  check('3. 在家版：07:30 沒有落點表；10:00 才有三句（落點、她的截圖、考上的話）', i>0&&!T.slice(0,i).some(t=>/落點|差了一大截|考上的話/.test(t))&&J(T.slice(i))===J(['（十點，補習班傳來今年的落點預估表。你那個分數，在首都帝大法律那一格。）','（她傳來一張截圖：同一張表，她把自己那一格圈起來。木柵大學法律。）','（考上的話，你在首都帝大，她在木柵大學。以後不會每天坐在同一張桌子了。）']), J(T));
  { const P=D.filter(l=>l&&l.phone).map(l=>l.text); check('3. 在家版「我的還好。」的回覆是「……『還好』是幾分。傳給我。」（07:30 還沒有落點表；AA-C 10-20 14:0x）', P.includes('……『還好』是幾分。傳給我。')&&!P.includes('你騙人。我看得到表。'), JSON.stringify(P)); }
  const k=D.findIndex(l=>l.text&&l.text.startsWith('（十點，補習班')), adv=D.slice(0,k).filter(l=>l.advance).map(l=>l.advance({hour:7.5}));
  check('3. 在家版：落點那句以前把時間推到 10:00', adv[adv.length-1]===2.5, J(adv));
  const C=ev('ev_y0_kh_call').dialogue, ex=t=>(C.find(l=>l.text===t)||{}).expression;
  check('3. 在家版 21:00 電話可昕的表情（恭喜你 sad、你從接起來到現在 annoyed、我先掛了 annoyed）', ex('……恭喜你。')==='sad'&&ex('你從接起來到現在，都只說「嗯」。')==='annoyed'&&ex('我先掛了。')==='annoyed');
  const M=ev('ev_y0_kh_madeup').dialogue, em=t=>(M.find(l=>l.text===t)||{}).expression;
  check('3. 在家版 22:30 和好（剛剛那樣，對不起 sad、早點睡 smile）', em('剛剛那樣，對不起。')==='sad'&&em('……早點睡。不要躺在床上難過。')==='smile'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

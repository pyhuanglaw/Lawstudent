// AA593-SIS-1B-1102：學姊（溫書瑀）改稿①b「手機與其他系統」——手抄檔、程式碼直接改的那一半（企劃線 6cbb0b4ab AA_593；AA 第 9 節審查、使用者 2026-11-02 19:xx 第 10 節選擇題）。不需要瀏覽器。
//   A. 逐列：每一列換了的句子，新的在那個檔裡（有名字說的、手機訊息都不加外面的「」）、舊的（有沒有「」都算）不在了；原句到處都有的短句（再讀一次。、到了、考完了、好。我自己去、知道了。、……好。、好。）照那一處的程式寫法比。
//   B. 第 10 節使用者的選擇：生病「燒退了嗎？」、情人節第二則只有「你睡了嗎？」、約法圖第二則、約總圖兩則同一句、約半熟（店名照 AA_655 是 SUNNY SIDE）、約一盞的問句、放榜只回「謝啦。」、一試沒過拿掉祐廷那句。
//   C. 決5 乙：約會結尾告白她第一次答應＝「（她笑了。）你確定？」「我很難相處喔。」「（她把手伸給你。）走吧。」，婉拒過的也一樣。
//   D. 演出來（tests/pg_harness.js）：2029 一試都沒過、學姊 FRIEND 以上＝15:10 祐廷「沒上。」→ 15:20 她「很厲害了啊。」「考完就先放鬆一下。」（沒有回覆按鈕）；律師一試過了、不到 FRIEND 都沒有。
//      3/23 放榜查了榜（src/sis_grad3d.js）：12:10 只有一則「謝啦。」。
// 這一次沒換的列（報告裡逐列寫了原因）：產生檔 pg_dates.js（第 37～44、113 列）、date_wish.js（82）、solo_before.js（83～87）、date_lines.js（65、66、88～98）＝等源稿重匯；
//   第 28 列＝AA_709 的回覆選項（src/data/msg_replies.js，11-07）照原句逐字掛、而且選項在講『走』，不換；第 67～73、80、81 列＝礁溪那一場 11-03 起是「學姊一家」（AA 11-03 10:05、AA_675 2-4、AA_684），
//   第 78 列同一場的同行台詞（前提「只有媽媽」已經不在）；第 106 列＝AA_681（11-04）已經換成別句；第 116 列＝AA 2026-11-02 20:26 已拿掉；
//   第 110、111 列（修正本）、第 45～49 列（動態）＝已經照表改過。第 9 節最後「這次，我選你。」「我還是喜歡你。」＝AA_591 整合九件第 4、5 件（AA 11-02 21:25）放回，不動。
// 修改前（8df5f06ed 的 src，這支測試照樣跑）：24 項裡 22 項 FAIL——A、B、C 全部、D 的一試沒過兩項與 3/23 放榜；D 的「律師一試過了」「不到 FRIEND」兩項（本來就沒有）照樣 PASS。用法：node tests/aa593_sis_1b_unit.js
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
const noC=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');   /* 註解裡的舊句不算（說明原本是什麼）*/
const lit=t=>["'"+t+"'",'"'+t+'"'];   /* 一整個字串（JS 的 '…' 或 JSON 的 "…"）＝外面沒有「」 */
const hasLit=(s,t)=>lit(t).some(x=>s.includes(x));
const gone=(s,t)=>!s.includes(t)&&!s.includes('「'+t+'」');

/* ========== A. 逐列（[列, 檔, 原句, 改成]；原句是整句的：那個檔的程式（註解以外）裡不能再有；改成要是一整個字串）========== */
const ROWS=[
  ['1','src/story3d.js','歡迎學弟～選課或宿舍有問題可以私訊問我。','歡迎學弟。選課或宿舍有問題，可以私訊問我。'],
  ['2','src/story3d.js','這篇你讀過了。這次你先說，哪一段有問題。','這篇你讀過了。這次你覺得哪一段有問題？'],
  ['4','src/story3d.js','好，六點半。我會準時，你們也不要遲到。','好，六點半。我會準時。'],
  ['5','src/story3d.js','湯喝完。然後睡覺。','燒退了嗎？'],
  ['6','src/story3d.js','這篇作者沒跳步。你找找看他哪裡偷懶。','這篇作者沒跳步。可是有一個地方偷懶了。'],
  ['7','src/story3d.js','你要反駁，就打「沒有例外」這四個字。','要反駁的話，我會打「沒有例外」這四個字。'],
  ['8','src/sis_grad3d.js','這週的時間用完了。下週再問我。','這週沒有時間了。下週好不好？'],
  ['10','src/sis_grad3d.js','不要講話就好。閉館的時候，可以一起去買飲料。','閉館的時候，可以一起去買飲料。'],
  ['12','src/sis_grad3d.js','我想吃一碗很燙的東西，然後睡十二個小時','我想吃一碗很燙的東西，然後睡十二個小時。'],
  ['13','src/sis_grad3d.js','不要問我考得怎麼樣。我也不知道','不要問我考得怎麼樣。我也不知道。'],
  ['14','src/sis_grad3d.js','我想去買一本新的計畫本','我想去買一本新的計畫本。'],
  ['15','src/sis_grad3d.js','你要一起來嗎？不來也沒關係','你要一起來嗎？不來也沒關係。'],
  ['107','src/sis_grad3d.js','……我還沒去看。你比我快','謝啦。'],
  ['17','src/data/sis_b4_events.js','好。那一格先空著。','好。我一個人去也可以。'],
  ['18','src/data/sis_b4_events.js','我在陽台吹風。……你早點睡。','你睡了嗎？'],
  ['19','src/data/sis_b8_events.js','週五下午三點，Café。課表帶來，我幫你看。','週五下午三點，Café。我幫你看課表。'],
  ['20','src/data/sis_b8_events.js','那帶來給我看。排好的最需要看。','那我看一下。排好的最需要看。'],
  ['21','src/data/sis_b8_events.js','好。截圖傳給我。','好。有截圖的話，傳給我看看。'],
  ['22','src/data/sis_b8_events.js','週四下午三點，研究室。幫我讀。你不是做這個題目的，剛好。','週四下午三點，研究室。可以幫我讀嗎？你不是做這個題目的，剛好。'],
  ['23','src/data/sis_b8_events.js','好。我寄給你，看不懂的劃起來。','好。我寄給你。看不懂的地方，幫我劃起來。'],
  ['24','src/data/sis_b11_events.js','十二點半。帶筆。','十二點半。我帶兩支筆。'],
  ['25','src/data/sis_b13_events.js','好。……帶傘，外面在下雨。','好。外面在下雨，你有帶傘嗎？'],
  ['26','src/data/sis_b13_events.js','好。Café，下午三點。帶筆。','好。Café，下午三點。'],
  ['27','src/data/sis_b16_events.js','研究單位那邊回信了。七月二號報到。','學校的研究中心回信了。七月二號報到，當助理。'],
  ['29','src/r3_3d.js','你的讀書計畫，帶去會所給我看。八點。','你的讀書計畫，我想看。八點，會所。'],
  ['30','src/r3_3d.js','你的讀書計畫，拿來研究室給我看。明天晚上七點。','你的讀書計畫，我想看。明天晚上七點，研究室。'],
  ['31','src/r3_3d.js','……下次帶來。','……下次再給我看。'],
  ['32','src/r3_3d.js','我自己看了你傳在群組的那張。……週六十二個小時，改成八個。','我自己看了你傳在群組的那張。……週六十二個小時，太多了。'],
  ['33','src/r3_3d.js','……下次拿來。','……下次再給我看。'],
  ['34','src/r3_3d.js','……你排。去哪裡都可以。','……去哪裡都可以。你想去哪？'],
  ['35','src/r2y4a3d.js','下週末去芝加哥。巴士早上七點出發，帶厚外套。','下週末去芝加哥。巴士早上七點出發。那邊很冷。'],
  ['36','src/data/postgrad_lines.js','生日那一格，計畫本上是空的。……我故意的。','生日那天，我什麼都沒排。……我故意的。'],
  ['112','src/data/postgrad_lines.js','明年。……讀書計畫你先排，我幫你看。','很厲害了啊。'],
  ['50','src/data/heroine_asks.js','明天五點以後，總圖三樓。你帶要問的題目。','明天五點以後，我在總圖三樓。'],
  ['51','src/data/heroine_asks.js','明天下午，總圖三樓。放假了，題目照帶。','明天下午，總圖三樓。放假了，人比較少。'],
  ['52','src/data/heroine_asks.js','我明天下午都在總圖。你要來就來，五點以後我有空。','我明天下午都在總圖。五點以後我有空。'],
  ['53','src/data/heroine_asks.js','明天五點。總圖。這次換你先講你卡在哪。','明天五點以後，我在總圖三樓。'],
  ['54','src/data/heroine_asks.js','明天下午三點，慢讀。你帶要問的題目。','明天下午三點，木曜日。要一起嗎？'],
  ['55','src/data/heroine_asks.js','明天五點，總圖三樓。今天不問題目。','明天五點，總圖三樓。這次不問題目。'],
  ['56','src/data/heroine_asks.js','明天下午三點，慢讀。今天不問題目。','明天下午三點，木曜日。這次不問題目。'],
  ['57','src/data/heroine_asks.js','週日九點，SUNNY SIDE。不要遲到。','週日早上要不要去 SUNNY SIDE？九點。'],   /* 稿寫「半熟」：店名 AA_655 第 1 節改 SUNNY SIDE，英文店名前面空半形（places.js PLACES.at）*/
  ['58','src/data/heroine_asks.js','週六下午，Café。帶你的筆記。','週六下午，Café。我會待到五點。'],
  ['59','src/data/heroine_asks.js','週六下午，一盞。這次你點。','週六下午有空嗎？想去一盞。'],
  ['60','src/data/heroine_asks.js','明天早上跑步。……我會準時，你也要。','明天早上跑步。六點半，我在椰影大道。'],
  ['61','src/data/heroine_asks.js','明天下午有空嗎。總圖冷氣很強，帶外套。','明天下午有空嗎。總圖。冷氣很強。'],
  ['62','src/data/heroine_asks.js','先讀。吃飯的時候再講話。','先讀。中午再聊。'],
  ['64','src/data/termend_lines.js','這學期的計畫本寫完了。……下學期那本，第一頁還是空的。','這學期過完了。……下學期的事，我還沒想。'],
  ['74','src/data/enc_walk.js','今天的計畫只有一行：來美術館。剩下的，跟你走。','今天只排了美術館。剩下的，跟你走。'],
  ['75','src/data/enc_walk.js','站進去。……不，我不拍。我只是想看看。','你站進去看看。……我不拍。只是想看看。'],
  ['76','src/data/enc_walk.js','換我站。……你看到什麼？不用說，我知道。','換我站。……你看到什麼？'],
  ['77','src/data/enc_walk.js','這杯算我的。不在計畫裡。是我想。','這杯我請。我想請。'],
  ['79','src/data/enc_walk.js','我要回去了。計畫本上，今天那一格還沒劃掉。','我要回去了。今天的進度還沒做完。'],
  ['99','src/data/fest_events.js','……我把計畫本那一天塗掉了。','那天我什麼都沒排。'],
  ['100','src/data/multirel_lines.js','那你講啊。','嗯。你說。'],
  ['101','src/data/multirel_lines.js','……她怎麼說？','她怎麼說？'],
  ['103','src/data/multirel_lines.js','……好。我們試試看。','好。我們試試看。'],
  ['104','src/data/multirel_lines.js','……你跟那個女生在一起喔？','你跟那個女生在一起喔？'],
  ['105','src/data/multirel_lines.js','我要想一段時間。……會很久。','我要想一段時間。會很久。'],
  ['115','src/data/confess_lines.js','其實我也是。考試那時候就有一點了，只是那時候不想想這個。','我很難相處喔。'],
];
const SRC={}; const code=f=>SRC[f]||(SRC[f]=noC(rd(f)));
{ const bad=[];
  for(const [n,f,o,v] of ROWS){ const s=code(f); if(!hasLit(s,v)&&!hasLit(s,require('./aa959_map.js').map(v,f.split('/').pop()))/* RC2-PORT-DEV-1114：AA_959 783 列又換過的（第 540 列），稿上的新句照表換完再找 */) bad.push('#'+n+' 沒有新句「'+v+'」（'+f+'）');
    const old=v.includes(o)?!(hasLit(s,o)||hasLit(s,'「'+o+'」')):gone(s,o);   /* 只補句號的（新句包著舊句）：舊句不能再是一整個字串 */
    if(!old) bad.push('#'+n+' 舊句還在「'+o+'」（'+f+'）'); }
  check('A. 逐列 '+ROWS.length+' 列：新的句子是一整個字串（外面沒有「」）、舊的句子（有沒有「」都算）不在那個檔的程式裡',!bad.length,J(bad)); }
/* 原句到處都有的短句：照那一處的寫法 */
{ const st=code('src/story3d.js'), sg=code('src/sis_grad3d.js'), ha=code('src/data/heroine_asks.js'), mr=code('src/data/multirel_lines.js');
  check("A. #3 W3B 第四篇以後選錯段：「不是那段。我第一次也看錯。」（不是「再讀一次。」；選中間那段照舊「對。」）",/W\(i===1\?'對。':'不是那段。我第一次也看錯。'\)/.test(st)&&!/W\(i===1\?'對。':'再讀一次。'\)/.test(st));
  check("A. #9 一個人走回去 22:10「到了。」",sg.includes("[P5('到了。')],'sisg_walk_home'")&&!sg.includes("P5('到了')"));
  check("A. #11 2/2 17:30「考完了。」",sg.includes("[P5('考完了。'),Object.assign(P5('我想吃一碗很燙的東西，然後睡十二個小時。')")&&!sg.includes("P5('考完了')"));
  check("A. #16 2/3「這次不行。」→「好。我自己去。」",sg.includes("{t:'這次不行。',say:[P5('好。我自己去。')]}")&&!sg.includes("P5('好。我自己去')"));
  check("A. #108、#109 放榜 12:13 那一則（「真的有」「謝謝。我先去跟我媽說」）拿掉；sisg_rank_r2 不送了",!sg.includes("P5('真的有')")&&gone(sg,'謝謝。我先去跟我媽說')&&!sg.includes("'sisg_rank_r2'"));
  const h5=ha.slice(ha.indexOf('heroine_05:{ send:'),ha.indexOf('classmate_peishan:{'));
  check("A. #63 她主動約、祐廷回「不了」：「好。下次。」（不是「知道了。」；別人的「知道了。」不動）",/later:'好。哪天可以，告訴我。', no:'好。下次。', yes:'好。' \}/.test(h5)&&!/no:'知道了。'/.test(h5));
  check("A. #53 第四句換成「五點以後」：時間照句子 17:30（AA_539：「五點以後」17:30）",h5.includes("{h:[17.5],line:'明天五點以後，我在總圖三樓。'}")&&!h5.includes("{h:[17],line:'明天五點以後"));
  check("A. #102 「她說可以。」第一次以後 yes 的第一句「好。」（不是「……好。」）",mr.includes("accept:{yes:['好。','我們試試看。'],no:['我還沒準備好。']}")&&!mr.includes("accept:{yes:['……好。','我們試試看。']")); }

/* ========== B、C：載入資料檔看結構 ========== */
const ctx=vm.createContext({console,STORY_EVENTS:[]}); const ld=(f,names)=>{ let s=rd(f); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInContext(s,ctx,{filename:f}); };
ld('src/data/sis_b4_events.js',['SISB4_LINES','SISB4_EVENTS']); ld('src/data/heroine_asks.js',['HASK_DATA']); ld('src/data/postgrad_lines.js',['POSTGRAD_LINES']);
const L4=ctx.SISB4_LINES||{}, HA5=(ctx.HASK_DATA&&ctx.HASK_DATA.people&&ctx.HASK_DATA.people.heroine_05)||{daily:[]}, PGL=ctx.POSTGRAD_LINES||{};
const ent=p=>HA5.daily.find(e=>e.place===p)||{};
check('B. 第 10 節 6：大四情人節沒接電話＝「情人節快樂。」「你睡了嗎？」（不說在陽台吹風）',J(L4.v4Missed)===J(['情人節快樂。','你睡了嗎？']),J(L4.v4Missed));
check('B. 第 10 節 7：生病那晚學姊手機兩則＝「語彤說你病了。」「燒退了嗎？」',code('src/story3d.js').includes("[{from:'heroine_05',text:'語彤說你病了。'},{from:'heroine_05',text:'燒退了嗎？'}]"));
check('B. 第 10 節 4：約法圖第二則＝「閉館的時候，可以一起去買飲料。」（「不要講話就好。」拿掉）',code('src/sis_grad3d.js').includes("Object.assign(P5('閉館的時候，可以一起去買飲料。'),{ask:{id:'sisg_study_invite'"));
{ const pre=ent('library').pre||{}, alt=(pre.alt||[]).map(a=>a.line);
  check('B. 第 10 節 2：約總圖（第 50、53 列）兩則都用「明天五點以後，我在總圖三樓。」（原句＝第一句、輪流的第三句）',pre.line==='明天五點以後，我在總圖三樓。'&&alt[2]==='明天五點以後，我在總圖三樓。'&&alt.length===4,J([pre.line,alt])); }
check('B. 第 10 節 3：約半熟（店名 SUNNY SIDE）＝問句「週日早上要不要去 SUNNY SIDE？九點。」；時間照舊週日 9:00',(ent('brunch').pre||{}).line==='週日早上要不要去 SUNNY SIDE？九點。'&&J((ent('brunch').pre||{}).h)==='[9]'&&(ent('brunch').pre||{}).d==='sun',J(ent('brunch').pre));
check('B. 第 10 節 1：約一盞（交往中）＝問句「週六下午有空嗎？想去一盞。」',(ent('teahouse').dat||{}).line==='週六下午有空嗎？想去一盞。',J(ent('teahouse').dat));
check('B. 第 10 節 11：3/23 放榜只回「謝啦。」（12:10 一則；12:13 那一則拿掉）',/PHONE\.at\(G,G\.day,r1,\[P5\('謝啦。'\)\],'sisg_rank_r1'\); \} \}/.test(code('src/sis_grad3d.js')));
check('B. 第 10 節 12：一試沒過＝祐廷先傳「沒上。」（新1）、她「很厲害了啊。」接「考完就先放鬆一下。」（新3；新2 祐廷那句拿掉＝沒有回覆按鈕）',PGL.R1&&PGL.R1.sisLowMe==='沒上。'&&J(PGL.R1.sisLow)===J(['很厲害了啊。','考完就先放鬆一下。'])&&!rd('src/data/postgrad_lines.js').includes('可是我想跟妳一樣厲害')&&!rd('src/postgrad3d.js').includes('可是我想跟妳一樣厲害'),J(PGL.R1&&[PGL.R1.sisLowMe,PGL.R1.sisLow]));
{ ld('src/data/confess_lines.js',['CONFESS_LINES']); const C=ctx.CONFESS_LINES&&ctx.CONFESS_LINES.heroine_05; ctx.SISB4={restartYes:()=>false}; vm.runInContext('globalThis.SISB4=SISB4',ctx);
  const a=C?C.yes({flags:{}}):null, b=C?C.yes({flags:{SIS_DECLINED_PREEXAM:1,SIS_DECLINED_PRERANK:2}}):null; ctx.SISB4.restartYes=()=>true; const r=C?C.yes({flags:{}}):null;
  check('C. 決5 乙：約會結尾告白她第一次答應＝「（她笑了。）你確定？」「我很難相處喔。」「（她把手伸給你。）走吧。」；婉拒過的也一樣（「你上次說的，我有記得。」AA 11-02 20:26 已拿掉）',J(a)===J(['（她笑了。）你確定？','我很難相處喔。','（她把手伸給你。）走吧。'])&&J(b)===J(a),J([a,b]));
  check('C. 舊的那一套（「……我知道。」「其實我也是。……」「好。」）不在了；重新開始那一版（restartYes）照舊（AA_591 整合九件第 4 件）',!!r&&r[r.length-1]==='這次，我選你。'&&!(a||[]).includes('……我知道。')&&!(a||[]).includes('好。'),J(r)); }

/* ========== D. 演出來 ========== */
(async()=>{
  const H=require('./pg_harness.js'), GM=H.GM;
  const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
  const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });
  const sis=()=>(H.G.msgs||[]).filter(m=>m.th==='p:heroine_05');
  const run=async(k,rel)=>{ const G=H.fresh('2029-08-04',8,'dorm',{BAR_REG:true}); graduated(G); rel(); const q=PG.draw(G,2029); H.picks=answerK(q,k); await H.run('exam_2029');
    H.at('2029-09-07',14.6); PG.rules(GM); H.at('2029-09-07',15.05); await H.run('r1_2029'); return G; };
  try{
    const walk=(h0,h1)=>{ for(let h=h0;h<=h1+1e-9;h+=0.02){ H.at('2029-09-07',+h.toFixed(3)); H.tick(); } };   /* 一點一點走（照時間收訊息）*/
    { const G=await run(10,()=>H.FRIEND('heroine_05')); walk(15.06,15.3); const m0=sis().map(m=>[m.from,m.text]);
      walk(15.32,15.5); const m=sis();
      check('D. 2029 一試都沒過（答對 10）、學姊 FRIEND：15:10 祐廷先傳「沒上。」（她還沒回）',G.flags.BAR_STAGE_2029==='none'&&J(m0)===J([['player','沒上。']]),J(m0));
      check('D. 15:20 她「很厲害了啊。」「考完就先放鬆一下。」，順序在祐廷那一則後面、沒有回覆按鈕（新2 拿掉）；沒有「明年。……讀書計畫你先排」',J(m.map(x=>[x.from,x.text]))===J([['player','沒上。'],['heroine_05','很厲害了啊。'],['heroine_05','考完就先放鬆一下。']])&&m[1].h>m[0].h&&Math.abs(m[1].h-(15+20/60))<0.05&&!m.some(x=>x.ask)&&!m.some(x=>/讀書計畫你先排/.test(x.text)),J(m.map(x=>[x.h,x.from,x.text,!!x.ask]))); }
    { await run(14,()=>H.FRIEND('heroine_05')); H.at('2029-09-07',15.4); H.tick();
      check('D. 律師一試過了（答對 14）：沒有「沒上。」、也沒有那兩則',!sis().some(x=>x.text==='沒上。'||x.text==='很厲害了啊。'),J(sis().map(x=>x.text))); }
    { await run(10,()=>H.FAMILIAR('heroine_05')); H.at('2029-09-07',15.4); H.tick();
      check('D. 學姊不到 FRIEND：沒有「沒上。」、也沒有她的兩則',!sis().length,J(sis().map(x=>x.text))); }
  }catch(e){ check('D. 一試放榜（執行出錯）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ')); }
  /* 3/23 放榜（sis_grad3d.js 載進 pg_harness 的同一個環境）*/
  try{
    const f='src/sis_grad3d.js'; vm.runInThisContext(rd(f),{filename:f}); const SISG=vm.runInThisContext('SISG');
    const G=H.fresh('2026-03-23',7.5,'dorm',{SIS_W1:true,SIS_STUDY:true}); H.FRIEND('heroine_05'); H.picks=['上網查榜']; const t=SISG.tick(GM); if(t&&SISG._p) await SISG._p;
    for(let h=8;h<=12.5+1e-9;h+=0.05){ G.hour=+h.toFixed(3); PHONE.tick(G); }
    const her=(G.msgs||[]).filter(m=>m.th==='p:heroine_05'&&m.from==='heroine_05'), me=(G.msgs||[]).filter(m=>m.th==='p:heroine_05'&&m.from==='player');
    check('D. 3/23 查了榜：祐廷傳「學姊，榜單上有妳。恭喜。」→ 12:10 她只回一則「謝啦。」',t===true&&me.some(m=>m.text==='學姊，榜單上有妳。恭喜。')&&J(her.map(m=>m.text))===J(['謝啦。'])&&Math.abs(her[0].h-(12+10/60))<0.06,J(her.map(m=>[m.h,m.text])));
  }catch(e){ check('D. 3/23 放榜（執行出錯）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();

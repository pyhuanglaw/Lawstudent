// NOODLE-TEAM-WHY-1027（AA_486 第 1-3、1-4 節〔企劃線 cd824bf41〕、AA_487〔b830dd5eb〕；使用者 2026-10-27「麵店團存在的必要到底是?」）——不需要瀏覽器。
// AA_675 1-2（AA_661 第 42 列，企劃線 920791094，AA-C 定 D109）：阿哲的麵店日拿掉，長桌閒聊搬到隔週五的桌遊夜（src/bgnight3d.js BGN.talkPick／BGN.talk，散場以前一則）。
//   這支照舊測長桌閒聊的輪法（順序、跳過、熟悉、條件），演的地方換成桌遊夜；燒臘店裡那一套關掉（第 2、8 項）。原本「讓給別的麵店事件」（第 6 項）跟著燒臘店一起不用了。
//   0  資料：src/data/noodle_table.js 大一八則、大二五則（第 6 則語彤那一則 AA_679 第 7 列拿掉）、大三大四各六則，句子和 AA 的稿逐字一樣；index.html 在 story3d.js 前面載入
//   1  建群組的下一則：「隔週五 桌遊」「沒空不用講」（AA_623 第 2 節）
//   2  什麼時候演：桌遊夜（玩家有去的那一晚）、在桌遊團群組；燒臘店的麵店日不再演
//   3  照順序輪：第 1 則 → 第 2 則…；有不認識的人、不在場的人（Alison 週五在戲院）、換不了的（bgn:false）就跳下一則；用完從頭輪
//   4  在場的人熟悉 +1（一天一次）
//   5  第 8 則（吃到一半停電）換不了＝不演
//   6  燒臘店的長桌一則都不演（STORY.ndlTalkPick：麵店日的作息裡沒有人了）
//   7  大二～大四：條件（交往以後、雙主修、Y3S2、以安在日本、2029-03-01、Y4S1／Y4S2）
//   8  燒臘店走進來兩秒以後也不演（S.ndlTalkTick）
// 修改前（開發分支 9f70c066f）：長桌閒聊還在燒臘店、桌遊夜沒有 BGN.talk——第 0 項 FAIL 就停（FAILED 1）。用法：node tests/noodle_table_1027_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=(f,re)=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(re,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ load('src/data/noodle_table.js',/^const (NOODLE_TABLE)\s*=/m); load('src/bgnight3d.js',/^const (BGN)\s*=/m); }catch(e){ ok=false; err=String(e); }
let ytOn=true; global.MREL={ytShift:()=>ytOn};
const meet=(...ids)=>{ for(const id of ids){ SOCIAL.remember(id,'FIRST_MET',''); if(id==='yu') H.G.flags.met_yu=true; } };
const ALL=['zhe','yu','classmate_bohan','classmate_xinci','classmate_mingxuan','heroine_03','heroine_01'];
const NIGHTS=term=>(typeof BGN!=='undefined'?BGN.weeks(term):[]).map(w=>STORY.termDayIn(term,w,5)).filter(d=>d!=null&&BGN.isNight(d));   /* 那一學期的桌遊夜（隔週五；國定假日停）*/
const N1=term=>NIGHTS(term)[0];
const at=(day,hh,o)=>{ o=o||{}; H.fresh(typeof day==='number'?CALENDAR.dateOf(day).key:day,hh,o.zone||'dorm',Object.assign({afternoonDone:true},o.flags)); if(o.group!==false) PHONE.join(H.G,'noodle_team','桌遊團'); meet(...(o.know||ALL)); return H.G; };
const text=e=>(e.dialogue||[]).map(l=>l.text);
const play=async()=>{ H.said=[]; const r=await BGN.talk(GM); return {r,L:H.said.map(s=>s.t)}; };
const D=k=>STORY.dayOfKey(k);

(async()=>{
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
check('0. noodle_table.js、bgnight3d.js 載得到、noodle_table.js 在 story3d.js 前面',ok&&typeof NOODLE_TABLE!=='undefined'&&typeof BGN!=='undefined'&&/noodle_table\.js\?v=[^"]+"><\/script>\n<script src="src\/story3d\.js/.test(html),err);
if(!ok||typeof BGN==='undefined'||typeof BGN.talk!=='function'){ check('0. BGN.talk 存在',false); H.done(); return; }
/* 0. 逐字對稿 */
const SPEC={
  Y1:[['長桌已經坐了一半。阿哲把菜單推給你，雖然大家都只點那幾樣。','民總的作業誰寫完了？','寫完了。……不給抄。'],['Alison 把滷蛋切成四份，分給整桌。','阿姨今天心情很好！！滷蛋多一顆！','那是因為我昨天幫她搬瓦斯。'],
    ['期末考範圍我整理成一張表了。','他把表放在桌子中間。三個人同時拿出手機拍。'],['芯慈一坐下就趴在桌上。','昨天讀書讀到兩點。……飯來了再叫我。'],   /* 2026-10-28 改：AA_497 第 8 節第 3 點（企劃線 60fc3b9a3）芯慈追劇減量——「昨天追劇追到兩點。」換成「昨天讀書讀到兩點。」（tests/aa497_supp 對稿）*/
    ['哥，下禮拜系籃練球，你來不來？','欸，下禮拜系籃練球，你來不來？','你還沒回答，他已經在記事本上寫了你的名字。'],['語彤從櫃台後面走過來，放下一盤燙青菜。','阿姨說你們都不吃菜。這盤不用錢。','阿姨萬歲。'],
    ['憲法課老師今天點了阿哲兩次。整桌都在學那個語氣。','「這位同學，你的看法呢？」','我的看法是我想吃叉燒。'],['吃到一半停電了三秒。燈亮的時候，阿哲的筷子停在 Alison 的碗上面。','……你在幹嘛。','我在保護它。']],
  Y2:[['阿哲和 Alison 坐在同一邊。阿哲的滷蛋少了半顆。','我幫你吃一半，比較健康。','……謝謝喔。'],['法服這禮拜三個個案，兩個是房東不還押金。','那你可以開一門課了。'],
    ['經濟系的同學問我，法律系是不是每天都在背。……我說也有不背的時候。','公車今天塞了二十分鐘。我以為趕不上了。'],['考試前的燒臘店，長桌比平常安靜。每個人的盤子旁邊都有一本書。','吃飯的時候不准讀。……好啦，讀到飯來。'],
    ['欸，下禮拜的報告分組，你們不要又全部丟給柏翰。','我已經習慣了。','就是因為你習慣了。']],   /* 第 6 則「語彤在櫃台後面寫作業…」AA_679 第 7 列拿掉 */
  Y3:[['他暑假要去事務所實習。他自己不講，我先講。','……沒事啦。吃飯。'],['阿姨把電視轉到新聞。整桌在吵剛剛那則報導，吵到飯都涼了。','好了，下課了。'],['對了，司法官的補習班，我上禮拜去聽了試聽課。……我還在想。'],
    ['推甄要兩封推薦信。我想好要找誰了，還沒想好怎麼開口。'],['以安不在，作業的問題都跑來問我。……我答得出來。'],['長桌少了一個人。阿姨還是多拿了一副筷子。']],
  Y4:[['最後一年了。……不要那個表情，還有一整年。'],['我在想畢業以後要不要搬出來住。……我還沒跟我媽說。'],['國考讀書會的表，我貼在群組了。不想讀的，也可以只來吃飯。'],
    ['欸，畢業以後還是要來吃燒臘。誰先不來，誰請客。'],['牆上的紅紙又多了兩張，寫的是新菜。阿姨說價錢沒變。'],['阿哲把大家的碗疊起來，拿去櫃台。四年了，他每次都這樣，沒有人叫過他。']] };
for(const k of ['Y1','Y2','Y3','Y4']){ const got=(NOODLE_TABLE[k]||[]).map(text); check('0. '+k+'：'+SPEC[k].length+' 則、句子逐字照 AA 的稿',J(got)===J(SPEC[k]),J(got)); }
check('0. 旁白不加括號',!Object.values(NOODLE_TABLE).some(L=>L.some(e=>e.dialogue.some(l=>l.speaker==null&&/^（/.test(l.text)))));
const SKIP={Y1:[1,5,7],Y2:[0,3],Y3:[1,5],Y4:[3,4,5]};   /* AA_675 1-2：句子裡有燒臘店的東西、換不了的（bgn:false）*/
check('0. 換不了的（bgn:false）：大一第 2、6、8 則，大二第 1、4 則，大三第 2、6 則，大四第 4、5、6 則（給 AA 下一批補）',Object.keys(SKIP).every(k=>J(NOODLE_TABLE[k].map((e,i)=>e.bgn===false?i:-1).filter(i=>i>=0))===J(SKIP[k])));

/* 1. 建群組 */
{ H.fresh('2025-09-11',18,'noodle',{}); H.G.flags.noodleTableDay=H.G.day; STORY.phoneRules(GM); const gm=H.G.msgs.filter(m=>m.th==='g:noodle_team');
  check('1. 建群組（舊存檔：阿哲建的）：系統訊息「桌遊團」，接著「隔週五 桌遊」「沒空不用講」（AA_623 第 2 節）',J(gm.map(m=>[m.from||null,m.text]))===J([[null,'阿哲建立了群組「桌遊團」，把你加了進來。'],['zhe','隔週五 桌遊'],['zhe','沒空不用講']]),J(gm.map(m=>[m.from,m.text])));
  STORY.phoneRules(GM); check('1. 只在建群組那一刻（再跑一次不重複）',H.G.msgs.filter(m=>m.th==='g:noodle_team').length===3); }

/* 2. 什麼時候演 */
{ const n=N1('Y1S1'); at(n,22); check('2. 大一上第一個桌遊夜（第 5 週週五）、在桌遊團群組：有一則可以演',!!BGN.talkPick(H.G)&&CALENDAR.termOf(n).week===5);
  at(n+1,22); check('2. 隔天（不是桌遊夜）：沒有（那一晚在場的人都不在）',!BGN.talkPick(H.G));
  at(n,22,{group:false}); check('2. 不在桌遊團群組：沒有',!BGN.talkPick(H.G));
  let nd=null; for(let d=D('2025-09-15');d<D('2025-10-31');d++) if(STORY.noodleDay(d)){ nd=d; break; }
  at(nd,18,{zone:'noodle'}); check('2. 燒臘店的麵店日 18:00、在群組：不再演（STORY.ndlTalkDue＝false）',STORY.NDL_TALK_BGN===true&&!STORY.ndlTalkDue(H.G)&&!STORY.ndlTalkDue(H.G,false)); }

/* 3. 照順序輪 */
{ const nights=NIGHTS('Y1S1'), seq=[]; let flags=null, soc=null;
  for(const d of nights){ H.fresh(CALENDAR.dateOf(d).key,22,'dorm',Object.assign({afternoonDone:true},flags||{})); if(soc){ H.G.social=soc; SOCIAL.bind(H.G); } PHONE.join(H.G,'noodle_team','桌遊團'); meet(...ALL); const {L}=await play(); seq.push(L[0]); flags=H.G.flags; soc=H.G.social; }
  const first=SPEC.Y1.map(x=>x[0]);
  /* 第 2、6、8 則換不了（bgn:false）、第 7 則要 Alison（週五晚上在戲院，不在桌遊夜）：1 → 3 → 4 → 5 → 從頭 1 */
  const want=[first[0],first[2],first[3],'欸，下禮拜系籃練球，你來不來？',first[0]];
  check('3. 大一上五個桌遊夜各一則，照順序 1 → 3 → 4 → 5，用完從頭輪（第 2、6、8 則換不了、第 7 則 Alison 不在＝跳過）',J(seq)===J(want),J(seq)); }
{ at(N1('Y1S1'),22,{know:['zhe','yu','classmate_bohan','classmate_mingxuan','heroine_03']}); H.G.flags.ndlTalkN={Y1:3}; const {L}=await play();
  check('3. 不認識芯慈：第 4 則跳過，演第 5 則（沒有「哥」＝「欸，」那一句）',J(L)===J(['欸，下禮拜系籃練球，你來不來？','你還沒回答，他已經在記事本上寫了你的名字。']),J(L));
  check('3. 跳過的那一則下一輪再看：下一則從第 6 則開始',H.G.flags.ndlTalkN.Y1===5); }
{ at(N1('Y1S1'),22,{flags:{ZHE_CALLS_GE:true}}); H.G.flags.ndlTalkN={Y1:4}; const {L}=await play(); check('3. 有「哥」：「哥，下禮拜系籃練球，你來不來？」',L[0]==='哥，下禮拜系籃練球，你來不來？'&&L.length===2,J(L)); }
{ ytOn=true; at(N1('Y1S1'),22); H.G.flags.ndlTalkN={Y1:5}; const r=await play();
  check('3. 輪到第 6 則（語彤顧店，MREL.ytShift 強制 true 也一樣）：換不了＋她不在＝跳過；第 7 則 Alison 不在、第 8 則換不了＝從頭第 1 則',r.L[0]===SPEC.Y1[0][0]&&!r.L.includes('阿姨說你們都不吃菜。這盤不用錢。'),J(r.L)); }
{ at(N1('Y1S1'),22,{know:['heroine_01']}); const {L}=await play(); check('3. 只認識以安（舊局一開始就認識阿哲）：只有阿哲的第 5 則演得了',J(L)===J(['欸，下禮拜系籃練球，你來不來？','你還沒回答，他已經在記事本上寫了你的名字。']),J(L));
  at(N1('Y1S1'),22,{know:['heroine_01'],flags:{LAW_START_DAY:D('2025-09-01'),MAIN_D1:D('2025-09-04')}}); check('3. 新局（開學改 9/1）、桌遊團一個都不認識（還沒遇到阿哲）：每一則都跳過＝不演',!BGN.talkPick(H.G)); }
{ const n14=STORY.termDayIn('Y1S2',14,5); at(n14,23.2); H.G.flags.ndlTalkN={Y1:6}; const {L}=await play();
  check('3. Alison 23:00 從戲院趕到的那一晚（大一下第 14 週，BGN.yuLate）：第 7 則（有 Alison）照演',BGN.yuLate(n14)&&J(L)===J(SPEC.Y1[6]),J(L)); }

/* 4. 熟悉 +1 */
{ at(N1('Y1S1'),22); const ids=['zhe','classmate_bohan','yu','classmate_xinci'], f0=ids.map(id=>SOCIAL.rel(id).fam|0); await play(); const d=ids.map((id,i)=>(SOCIAL.rel(id).fam|0)-f0[i]);
  check('4. 第 1 則（阿哲、柏翰）：他們熟悉 +1，其他人不加',J(d)===J([1,1,0,0]),J(d));
  H.G.flags.ndlTalkN={Y1:0}; await play(); const d2=ids.map((id,i)=>(SOCIAL.rel(id).fam|0)-f0[i]); check('4. 同一天再演一次（測試強制）：classmate 一天一次，阿哲不再加',d2[0]===1,J(d2)); }

/* 5. 第 8 則 */
{ at(N1('Y1S2'),22); H.G.flags.ndlTalkN={Y1:7}; const {L}=await play(); check('5. 第 8 則（吃到一半停電、阿哲的筷子停在 Alison 的碗上面）換不了：不演（回到第 1 則）',L[0]===SPEC.Y1[0][0],J(L)); }
{ at(N1('Y1S2'),22); H.G.flags.ndlTalkN={Y1:7}; H.G.events.done.ev_yu_together=1; const {L}=await play(); check('5. 阿哲和 Alison 交往以後也一樣（回到第 1 則）',L[0]===SPEC.Y1[0][0],J(L)); }

/* 6. 燒臘店的長桌：一則都不演 */
{ let nd=null; for(let d=D('2025-10-01');d<D('2025-10-31');d++) if(STORY.noodleDay(d)){ nd=d; break; }
  at(nd,18,{zone:'noodle'}); const here=['zhe','yu','classmate_bohan','classmate_xinci'].map(id=>STORY.ndlHere(H.G,id)), p=STORY.ndlTalkPick(H.G);
  check('6. 麵店日的燒臘店：阿哲、Alison、柏翰、芯慈都不在長桌（阿哲的麵店日拿掉，AA_675 1-2）；燒臘店的挑法挑不到任何一則',here.every(x=>!x)&&p===null,J({here,p:p&&p.e.who})); }

/* 7. 大二～大四 */
{ at(N1('Y2S1'),22); const {L}=await play(); check('7. 大二第一個桌遊夜：第 1 則（滷蛋）換不了＝跳過，演第 2 則（柏翰、阿哲）',J(L)===J(SPEC.Y2[1]),J(L));
  at(N1('Y2S1'),22); H.G.events.done.ev_yu_together=1; let r=await play(); check('7. 大二交往以後：第 1 則照樣換不了，也是第 2 則',J(r.L)===J(SPEC.Y2[1]),J(r.L));
  at(N1('Y2S1'),22); H.G.flags.ndlTalkN={Y2:2}; let q=await play(); check('7. 大二第 3 則：沒有雙主修＝3b「公車今天塞了二十分鐘。我以為趕不上了。」',J(q.L)===J(['公車今天塞了二十分鐘。我以為趕不上了。']),J(q.L));
  at(N1('Y2S1'),22); H.G.flags.ndlTalkN={Y2:2}; H.G.events.done.ev_xinci_double=1; q=await play(); check('7. 大二第 3 則：演過雙主修＝3',J(q.L)===J([SPEC.Y2[2][0]]),J(q.L));
  at(N1('Y2S1'),22); H.G.flags.ndlTalkN={Y2:4}; q=await play(); check('7. 大二第 5 則（Alison）：她不在＝跳過，回到第 1 則→第 2 則',J(q.L)===J(SPEC.Y2[1]),J(q.L)); }
{ at(N1('Y3S1'),22); H.G.flags.ndlTalkN={Y3:3}; check('7. 大三上：第 4 則（Y3S2）、第 5 則（以安在日本）不成立，第 6、2 則換不了，第 1、3 則要 Alison＝這一晚沒有',!BGN.talkPick(H.G));
  const nj=NIGHTS('Y3S2').find(d=>d>=D('2028-03-25')); at(nj,22); H.G.flags.ndlTalkN={Y3:3}; let q=await play(); check('7. 大三下、以安在日本的桌遊夜：第 4 則',J(q.L)===J(SPEC.Y3[3]),J(q.L));
  H.G.flags.ndlTalkDay=null; q=await play(); check('7. 接著第 5 則（芯慈：以安不在）',J(q.L)===J(SPEC.Y3[4]),J(q.L));
  H.G.flags.ndlTalkDay=null; q=await play(); check('7. 接著第 6 則換不了＝從頭，第 1、3 則要 Alison、第 2 則換不了＝回到第 4 則',J(q.L)===J(SPEC.Y3[3]),J(q.L));
  const nb=NIGHTS('Y3S2').find(d=>d<D('2028-03-25')); at(nb,22); H.G.flags.ndlTalkN={Y3:4}; q=await play(); check('7. 大三下、以安還沒去日本：第 5、6 則跳過',![SPEC.Y3[4][0],SPEC.Y3[5][0]].includes(q.L[0]),J(q.L)); }
{ at(N1('Y4S1'),22); let q=await play(); check('7. 大四上第 1 則（Y4S1）',J(q.L)===J(SPEC.Y4[0]),J(q.L));
  at(N1('Y4S1'),22); H.G.flags.ndlTalkN={Y4:2}; q=await play(); check('7. 大四上：第 3 則（2029-03-01 起）、第 4～6 則（Y4S2；換不了）跳過＝從頭第 1 則',J(q.L)===J(SPEC.Y4[0]),J(q.L));
  const n3=NIGHTS('Y4S2').find(d=>d>=D('2029-03-01')); at(n3,22); H.G.flags.ndlTalkN={Y4:2}; q=await play(); check('7. 2029-03-01 以後的桌遊夜：第 3 則',J(q.L)===J(SPEC.Y4[2]),J(q.L));
  at(n3,22); H.G.flags.ndlTalkN={Y4:0}; q=await play(); check('7. 大四下：第 1 則（Y4S1）跳過＝第 2 則',J(q.L)===J(SPEC.Y4[1]),J(q.L)); }
{ at(N1('Y4S1'),22); NOODLE_TABLE.Y4.push({who:[],dialogue:[{speaker:null,text:'（測試：沒有點名的旁白）'}]}); const ids=['zhe','yu','classmate_bohan','classmate_xinci'], f0=ids.map(id=>SOCIAL.rel(id).fam|0); H.G.flags.ndlTalkN={Y4:6}; await play(); const d=ids.map((id,i)=>(SOCIAL.rel(id).fam|0)-f0[i]); NOODLE_TABLE.Y4.pop();
  check('7. 旁白沒有點名的那一則（測試用的一則；紅紙那一則換不了）：那一晚在場、認識的長桌常客各 +1（Alison 不在不加）',J(d)===J([1,0,1,1]),J(d)); }

/* 8. 燒臘店走進來兩秒以後 */
{ let nd=null; for(let d=D('2025-09-15');d<D('2025-10-31');d++) if(STORY.noodleDay(d)){ nd=d; break; }
  at(nd,18,{zone:'noodle'}); GM.enterN=7; let started=0; for(let i=0;i<6;i++) if(STORY.ndlTalkTick(GM)) started++; await new Promise(res=>setTimeout(res,20));
  check('8. 燒臘店走進來兩秒以後也不演（S.ndlTalkTick 看 ndlTalkDue＝false）',!started&&H.G.flags.ndlTalkDay==null&&!H.said.length); }
{ const e=NOODLE_TABLE.Y2.find(x=>x.dialogue[0]&&x.dialogue[0].text==='考試前的燒臘店，長桌比平常安靜。每個人的盤子旁邊都有一本書。');
  const wk=w=>{ for(let d=1;d<1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y2S1'&&t.week===w) return d; } return null; };
  check('9. AA_491 第 7 點：大二「考試前的燒臘店」的條件只在第 14～15 週（D118 沒有期中考，AA_581 第 7 節 C、第 11 節第 3 點：拿掉期中第 6～7 週；AA_675 這一則換不了、桌遊夜不演）',!!e&&e.bgn===false&&J(e.if&&e.if.weeks)===J([14,15])&&!STORY.ndlTalkIf({day:wk(6),flags:{}},e.if)&&!STORY.ndlTalkIf({day:wk(7),flags:{}},e.if)&&STORY.ndlTalkIf({day:wk(14),flags:{}},e.if)&&STORY.ndlTalkIf({day:wk(15),flags:{}},e.if)&&!STORY.ndlTalkIf({day:wk(3),flags:{}},e.if)&&!STORY.ndlTalkIf({day:wk(10),flags:{}},e.if)); }
H.done();
})();

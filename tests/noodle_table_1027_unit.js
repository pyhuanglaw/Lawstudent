// NOODLE-TEAM-WHY-1027（AA_486 第 1-3、1-4 節〔企劃線 cd824bf41〕、AA_487〔b830dd5eb〕；使用者 2026-10-27「麵店團存在的必要到底是?」）——不需要瀏覽器。
//   0  資料：src/data/noodle_table.js 大一八則、大二到大四各六則，句子和 AA 的稿逐字一樣；index.html 在 story3d.js 前面載入
//   1  建群組的下一則：阿哲「吃飯用」「誰要吃什麼就喊」（不加句號）
//   2  什麼時候演：麵店日 17:00～21:00 在麵店、在麵店團群組、一天一則；大一從 Y1S1 第 3 週起；不是麵店日、時間外、不在群組＝沒有
//   3  照順序輪：第 1 則 → 第 2 則…；有不認識的人就跳下一則；語彤那一則要她在顧店；用完從頭輪
//   4  在場的人熟悉 +1（一天一次）
//   5  第 8 則：阿哲和 Alison 交往以後不演
//   6  這一天有別的麵店事件要演＝讓給它（今天演過麵店事件、今天在麵店有出遊、現在有一件麵店事件成立）
//   7  大二～大四：條件（交往以後、雙主修、Y3S2、以安在日本、2029-03-01、Y4S1／Y4S2）
//   8  走進麵店兩秒以後才開始（S.ndlTalkTick）
// 修改前（開發分支 592de7e18）：沒有 noodle_table.js、沒有 STORY.ndlTalk——FAIL。用法：node tests/noodle_table_1027_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
let ok=true, err=''; try{ let src=fs.readFileSync(path.join(H.ROOT,'src/data/noodle_table.js'),'utf8'); src=src.replace(/^const (NOODLE_TABLE)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:'noodle_table.js'}); }catch(e){ ok=false; err=String(e); }
let ytOn=true; global.MREL={ytShift:()=>ytOn};
const meet=(...ids)=>{ for(const id of ids){ SOCIAL.remember(id,'FIRST_MET',''); if(id==='yu') H.G.flags.met_yu=true; } };
const ALL=['zhe','yu','classmate_bohan','classmate_xinci','heroine_03','heroine_01'];
const at=(key,hh,o)=>{ o=o||{}; H.fresh(key,hh,'noodle',Object.assign({afternoonDone:true},o.flags)); if(o.group!==false) PHONE.join(H.G,'noodle_team','麵店團'); meet(...(o.know||ALL)); return H.G; };   /* afternoonDone：第二天下午以後（阿哲、Alison 才有作息；NDL-PRESENT-1030 閒聊要人在店裡）*/
const text=e=>(e.dialogue||[]).map(l=>l.text);
const play=async()=>{ H.said=[]; const r=await STORY.ndlTalk(GM); return {r,L:H.said.map(s=>s.t)}; };
const D=k=>STORY.dayOfKey(k);

(async()=>{
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
check('0. noodle_table.js 載得到、index.html 在 story3d.js 前面',ok&&typeof NOODLE_TABLE!=='undefined'&&/noodle_table\.js\?v=[^"]+"><\/script>\n<script src="src\/story3d\.js/.test(html),err);
if(!ok||typeof STORY.ndlTalk!=='function'){ check('0. STORY.ndlTalk 存在',false); H.done(); return; }
/* 0. 逐字對稿 */
const SPEC={
  Y1:[['長桌已經坐了一半。阿哲把菜單推給你，雖然大家都只點那幾樣。','民總的作業誰寫完了？','寫完了。……不給抄。'],['Alison 把滷蛋切成四份，分給整桌。','阿姨今天心情很好！！滷蛋多一顆！','那是因為我昨天幫她搬瓦斯。'],
    ['期中考範圍我整理成一張表了。','他把表放在桌子中間。三個人同時拿出手機拍。'],['芯慈一坐下就趴在桌上。','昨天讀書讀到兩點。……麵來了再叫我。'],   /* 2026-10-28 改：AA_497 第 8 節第 3 點（企劃線 60fc3b9a3）芯慈追劇減量——「昨天追劇追到兩點。」換成「昨天讀書讀到兩點。」（tests/aa497_supporting_unit.js 第 8 節）*/
    ['哥，下禮拜系籃練球，你來不來？','欸，下禮拜系籃練球，你來不來？','你還沒回答，他已經在記事本上寫了你的名字。'],['語彤從櫃台後面走過來，放下一盤燙青菜。','阿姨說你們都不吃菜。這盤不用錢。','阿姨萬歲。'],
    ['憲法課老師今天點了阿哲兩次。整桌都在學那個語氣。','「這位同學，你的看法呢？」','我的看法是我想吃麵。'],['吃到一半停電了三秒。燈亮的時候，阿哲的筷子停在 Alison 的碗上面。','……你在幹嘛。','我在保護它。']],
  Y2:[['阿哲和 Alison 坐在同一邊。阿哲的滷蛋少了半顆。','我幫你吃一半，比較健康。','……謝謝喔。'],['法服這禮拜三個個案，兩個是房東不還押金。','那你可以開一門課了。'],
    ['經濟系的同學問我，法律系是不是每天都在背。……我說也有不背的時候。','公車今天塞了二十分鐘。我以為趕不上了。'],['考試前的麵店，長桌比平常安靜。每個人的碗旁邊都有一本書。','吃飯的時候不准讀。……好啦，讀到麵來。'],
    ['欸，下禮拜的報告分組，你們不要又全部丟給柏翰。','我已經習慣了。','就是因為你習慣了。'],['語彤在櫃台後面寫作業，社會系的書攤了一桌。阿姨叫她，她頭也沒抬就站起來。']],
  Y3:[['他暑假要去事務所實習。他自己不講，我先講。','……沒事啦。吃麵。'],['阿姨把電視轉到新聞。整桌在吵剛剛那則報導，吵到麵都涼了。','好了，下課了。'],['對了，司法官的補習班，我上禮拜去聽了試聽課。……我還在想。'],
    ['推甄要兩封推薦信。我想好要找誰了，還沒想好怎麼開口。'],['以安不在，作業的問題都跑來問我。……我答得出來。'],['長桌少了一個人。阿姨還是多拿了一副筷子。']],
  Y4:[['最後一年了。……不要那個表情，還有一整年。'],['我在想畢業以後要不要搬出來住。……我還沒跟我媽說。'],['國考讀書會的表，我貼在群組了。不想讀的，也可以只來吃麵。'],
    ['欸，畢業以後還是要來吃麵。誰先不來，誰請客。'],['牆上的紅紙又多了兩張，寫的是新菜。阿姨說價錢沒變。'],['阿哲把大家的碗疊起來，拿去櫃台。四年了，他每次都這樣，沒有人叫過他。']] };
for(const k of ['Y1','Y2','Y3','Y4']){ const got=(NOODLE_TABLE[k]||[]).map(text); check('0. '+k+'：'+SPEC[k].length+' 則、句子逐字照 AA 的稿',J(got)===J(SPEC[k]),J(got)); }
check('0. 旁白不加括號',!Object.values(NOODLE_TABLE).some(L=>L.some(e=>e.dialogue.some(l=>l.speaker==null&&/^（/.test(l.text)))));

/* 1. 建群組 */
{ H.fresh('2025-09-11',18,'noodle',{}); H.G.flags.noodleTableDay=H.G.day; STORY.phoneRules(GM); const gm=H.G.msgs.filter(m=>m.th==='g:noodle_team');
  check('1. 建群組：系統訊息，接著阿哲「吃飯用」「誰要吃什麼就喊」',J(gm.map(m=>[m.from||null,m.text]))===J([[null,'阿哲建立了群組「法一吃飯」，把你加了進來。'],['zhe','吃飯用'],['zhe','誰要吃什麼就喊']]),J(gm.map(m=>[m.from,m.text])));
  STORY.phoneRules(GM); check('1. 只在建群組那一刻（再跑一次不重複）',H.G.msgs.filter(m=>m.th==='g:noodle_team').length===3); }

/* 2. 什麼時候演 */
{ const G=at('2025-09-16',17.5); check('2. 9/16（二，Y1S1 第 3 週）17:30 在麵店、在群組：要演',STORY.ndlTalkDue(G));
  G.hour=16.9; check('2. 16:54：還不演',!STORY.ndlTalkDue(G)); G.hour=21; check('2. 21:00：不演',!STORY.ndlTalkDue(G)); G.hour=20.9; check('2. 20:54：麵店團 20:30 都走了＝不演（NDL-PRESENT-1030：人不在不講話）',!STORY.ndlTalkDue(G)); G.hour=20.4; check('2. 20:24：人還在＝演',STORY.ndlTalkDue(G));
  G.zone='campus'; check('2. 不在麵店：不演',!STORY.ndlTalkDue(G)); G.zone='noodle';
  at('2025-09-17',18); check('2. 9/17（三）不是麵店日：不演',!STORY.ndlTalkDue(H.G));
  at('2025-09-16',18,{group:false}); check('2. 不在麵店團群組：不演',!STORY.ndlTalkDue(H.G));
  at('2025-09-09',18); check('2. 9/9（Y1S1 第 2 週）：大一從第 3 週起，不演',!STORY.ndlTalkDue(H.G));
  at('2025-09-16',18); await play(); check('2. 演過以後同一天不再演',!STORY.ndlTalkDue(H.G)&&H.G.flags.ndlTalkDay===H.G.day); }

/* 3. 照順序輪 */
{ const days=['2025-09-16','2025-09-18','2025-09-23','2025-09-25','2025-09-30','2025-10-02','2025-10-07','2025-10-09','2025-10-14'], seq=[]; let flags=null, soc=null;
  for(const k of days){ H.fresh(k,18,'noodle',Object.assign({afternoonDone:true},flags||{})); if(soc){ H.G.social=soc; SOCIAL.bind(H.G); } PHONE.join(H.G,'noodle_team','麵店團'); meet(...ALL); const {L}=await play(); seq.push(L[0]); flags=H.G.flags; soc=H.G.social; }
  const first=SPEC.Y1.map(x=>x[0]);
  check('3. 每個麵店日一則，照順序 1→8，用完從頭輪（第 9 個麵店日又是第 1 則）',J(seq)===J(first.slice(0,4).concat(['欸，下禮拜系籃練球，你來不來？'],first.slice(5),[first[0]])),J(seq)); }
{ at('2025-09-16',18,{know:['zhe','yu','classmate_bohan','heroine_03']}); H.G.flags.ndlTalkN={Y1:3}; const {L}=await play();
  check('3. 不認識芯慈：第 4 則跳過，演第 5 則（沒有「哥」＝「欸，」那一句）',J(L)===J(['欸，下禮拜系籃練球，你來不來？','你還沒回答，他已經在記事本上寫了你的名字。']),J(L));
  check('3. 跳過的那一則下一輪再看：下一則從第 6 則開始',H.G.flags.ndlTalkN.Y1===5); }
{ at('2025-09-16',18,{flags:{ZHE_CALLS_GE:true}}); H.G.flags.ndlTalkN={Y1:4}; const {L}=await play(); check('3. 有「哥」：「哥，下禮拜系籃練球，你來不來？」',L[0]==='哥，下禮拜系籃練球，你來不來？'&&L.length===2,J(L)); }
{ ytOn=false; at('2025-09-16',18); H.G.flags.ndlTalkN={Y1:5}; const {L}=await play(); ytOn=true;
  check('3. 語彤不在顧店：第 6 則跳過，演第 7 則',L[0]==='憲法課老師今天點了阿哲兩次。整桌都在學那個語氣。',J(L));
  at('2025-09-16',18); H.G.flags.ndlTalkN={Y1:5}; const r=await play(); check('3. 語彤在顧店：第 6 則（說話人是語彤）',r.L[1]==='阿姨說你們都不吃菜。這盤不用錢。'&&/語彤/.test(H.said[1].who||''),J(H.said[1])); }
{ at('2025-09-16',18,{know:['heroine_01']}); const {L}=await play(); check('3. 只認識以安（舊局一開始就認識阿哲）：只有阿哲的第 5 則演得了',J(L)===J(['欸，下禮拜系籃練球，你來不來？','你還沒回答，他已經在記事本上寫了你的名字。']),J(L));
  at('2025-09-16',18,{know:['heroine_01'],flags:{LAW_START_DAY:D('2025-09-01'),MAIN_D1:D('2025-09-04')}}); check('3. 新局（開學改 9/1）、麵店團一個都不認識（還沒遇到阿哲）：每一則都跳過＝不演',!STORY.ndlTalkDue(H.G)); }

/* 4. 熟悉 +1 */
{ at('2025-09-16',18); const ids=['zhe','classmate_bohan','yu','classmate_xinci'], f0=ids.map(id=>SOCIAL.rel(id).fam|0); await play(); const d=ids.map((id,i)=>(SOCIAL.rel(id).fam|0)-f0[i]);
  check('4. 第 1 則（阿哲、柏翰）：他們熟悉 +1，其他人不加',J(d)===J([1,1,0,0]),J(d));
  H.G.flags.ndlTalkDay=null; await play(); const d2=ids.map((id,i)=>(SOCIAL.rel(id).fam|0)-f0[i]); check('4. 同一天再演一次（測試強制）：classmate 一天一次，阿哲不再加',d2[0]===1,J(d2)); }

/* 5. 第 8 則 */
{ at('2026-03-03',18); H.G.flags.ndlTalkN={Y1:7}; H.G.events.done.ev_yu_together=1; const {L}=await play(); check('5. 阿哲和 Alison 交往以後：第 8 則跳過（回到第 1 則）',L[0]===SPEC.Y1[0][0],J(L)); }
{ at('2026-03-03',18); H.G.flags.ndlTalkN={Y1:7}; const {L}=await play(); check('5. Y1S2 還沒交往：第 8 則照演',J(L)===J(SPEC.Y1[7]),J(L)); }

/* 6. 讓給別的麵店事件 */
{ at('2025-09-16',18); const e=STORY_EVENTS.find(q=>q.location==='noodle'&&q.trigger==='enter'); H.G.events.last[e.id]=H.G.day; check('6. 今天已經演過一件麵店事件（'+e.id+'）：不演',!STORY.ndlTalkDue(H.G));
  delete H.G.events.last[e.id]; H.G.events.last[e.id]=H.G.day-3; check('6. 那件是三天前演的：照演',STORY.ndlTalkDue(H.G)); }
{ at('2025-09-16',17); OUT.plan(H.G,{id:'t_ndl',ev:'ev_y2_first_meal',day:H.G.day,h:19,place:'阿鳳麵店',title:'考完的晚餐'}); check('6. 今天 19:00 有出遊在阿鳳麵店：不演',!STORY.ndlTalkDue(H.G)); }
{ at('2025-09-16',18); const fake={id:'ev_test_ndl_enter',title:'',participants:[],location:'noodle',trigger:'enter',weekday:[2],time:[17,21],once:true,dialogue:[]}; STORY_EVENTS.push(fake);
  check('6. 現在有一件麵店事件成立（進門的）：不演',!STORY.ndlTalkDue(H.G)); H.G.events.done.ev_test_ndl_enter=1; check('6. 那件演過了（once）：照演',STORY.ndlTalkDue(H.G)); STORY_EVENTS.pop();
  const fake2={id:'ev_test_ndl_talk',title:'',participants:['heroine_03'],location:'noodle',trigger:'interact',weekday:[2],once:true,dialogue:[]}; STORY_EVENTS.push(fake2);
  check('6. 找語彤說話的事件：她不在店裡＝不算',STORY.ndlTalkDue(H.G)); GM.npc.heroine_03={id:'heroine_03',charId:'heroine_03',obj:{position:{x:0,y:0,z:0}}}; check('6. 她在店裡：讓給它',!STORY.ndlTalkDue(H.G)); GM.npc={}; STORY_EVENTS.pop(); }

/* 7. 大二～大四 */
{ at('2026-09-15',18); const {L}=await play(); check('7. 大二（9/15 二）第 1 則：還沒交往＝跳過，演第 2 則（柏翰、阿哲）',J(L)===J(SPEC.Y2[1]),J(L));
  at('2026-12-15',18); H.G.events.done.ev_yu_together=1; const r=await play();   /* 12/22 是期末週（麵店團考試週不去麵店，AA-B 10-30 14:30）：改第 15 週 12/15 */ check('7. 大二交往以後：第 1 則',J(r.L)===J(SPEC.Y2[0]),J(r.L));
  at('2026-09-15',18); H.G.flags.ndlTalkN={Y2:2}; let q=await play(); check('7. 大二第 3 則：沒有雙主修＝3b「公車今天塞了二十分鐘。我以為趕不上了。」',J(q.L)===J(['公車今天塞了二十分鐘。我以為趕不上了。']),J(q.L));
  at('2026-09-15',18); H.G.flags.ndlTalkN={Y2:2}; H.G.events.done.ev_xinci_double=1; q=await play(); check('7. 大二第 3 則：演過雙主修＝3',J(q.L)===J([SPEC.Y2[2][0]]),J(q.L));
  at('2026-09-15',18,{know:['zhe','yu','classmate_bohan','classmate_xinci']}); H.G.flags.ndlTalkN={Y2:5}; q=await play(); check('7. 大二第 6 則：不認識語彤＝跳過（回到第 1 則→第 2 則）',J(q.L)===J(SPEC.Y2[1]),J(q.L)); }
{ at('2027-09-14',18); H.G.flags.ndlTalkN={Y3:3}; let q=await play(); check('7. 大三上：第 4 則（Y3S2）跳過，第 5、6 則（以安在日本）跳過＝回到第 1 則（還沒交往再跳）→ 第 2 則',J(q.L)===J(SPEC.Y3[1]),J(q.L));
  at('2028-04-04',18); H.G.flags.ndlTalkN={Y3:3}; q=await play(); check('7. 2028-04-04（Y3S2，以安在日本）：第 4 則',J(q.L)===J(SPEC.Y3[3]),J(q.L));
  q=await (async()=>{ H.G.flags.ndlTalkDay=null; return play(); })(); check('7. 接著第 5 則（芯慈：以安不在）',J(q.L)===J(SPEC.Y3[4]),J(q.L));
  H.G.flags.ndlTalkDay=null; q=await play(); check('7. 接著第 6 則（旁白）',J(q.L)===J(SPEC.Y3[5]),J(q.L));
  at('2028-03-14',18); H.G.flags.ndlTalkN={Y3:4}; q=await play(); check('7. 2028-03-14（Y3S2、以安還沒去日本）：第 5、6 則跳過',![SPEC.Y3[4][0],SPEC.Y3[5][0]].includes(q.L[0]),J(q.L)); }
{ at('2028-09-12',18); let q=await play(); check('7. 大四上第 1 則（Y4S1）',J(q.L)===J(SPEC.Y4[0]),J(q.L));
  at('2028-09-12',18); H.G.flags.ndlTalkN={Y4:2}; q=await play(); check('7. 大四上：第 3 則（2029-03-01 起）、第 4 則（Y4S2）跳過＝第 5 則',J(q.L)===J(SPEC.Y4[4]),J(q.L));
  at('2029-03-06',18); H.G.flags.ndlTalkN={Y4:2}; q=await play(); check('7. 2029-03-06：第 3 則',J(q.L)===J(SPEC.Y4[2]),J(q.L));
  at('2029-03-06',18); H.G.flags.ndlTalkN={Y4:0}; q=await play(); check('7. 大四下：第 1 則（Y4S1）跳過＝第 2 則',J(q.L)===J(SPEC.Y4[1]),J(q.L)); }
{ at('2028-09-12',18); const ids=['zhe','yu','classmate_bohan','classmate_xinci'], f0=ids.map(id=>SOCIAL.rel(id).fam|0); H.G.flags.ndlTalkN={Y4:4}; await play(); const d=ids.map((id,i)=>(SOCIAL.rel(id).fam|0)-f0[i]);
  check('7. 旁白沒有點名的那一則（紅紙）：長桌上認識的麵店團各 +1',J(d)===J([1,1,1,1]),J(d)); }

/* 8. 走進來兩秒以後 */
{ at('2025-09-16',18); GM.enterN=7; let started=0; for(let i=0;i<3;i++) if(STORY.ndlTalkTick(GM)) started++; check('8. 走進來前三次（1.5 秒）不演',!started);
  const r=STORY.ndlTalkTick(GM); await new Promise(res=>setTimeout(res,20)); check('8. 第四次（2 秒）開始演',r&&H.G.flags.ndlTalkDay===H.G.day&&H.said.length>0);
  check('8. S.tick 有接（出遊以外、在 OUT.tick 後面）',/if\(!outP&&S\.ndlTalkTick\(GM\)\) return;/.test(fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'))); }
{ const e=NOODLE_TABLE.Y2.find(x=>x.dialogue[0]&&x.dialogue[0].text==='考試前的麵店，長桌比平常安靜。每個人的碗旁邊都有一本書。');
  const wk=w=>{ for(let d=1;d<1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y2S1'&&t.week===w) return d; } return null; };
  check('9. AA_491 第 7 點：大二「考試前的麵店」只在第 6～7、14～15 週輪到',!!e&&J(e.if&&e.if.weeks)===J([6,7,14,15])&&STORY.ndlTalkIf({day:wk(6),flags:{}},e.if)&&STORY.ndlTalkIf({day:wk(15),flags:{}},e.if)&&!STORY.ndlTalkIf({day:wk(3),flags:{}},e.if)&&!STORY.ndlTalkIf({day:wk(10),flags:{}},e.if)); }
H.done();
})();

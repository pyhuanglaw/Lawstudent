// AB65-2-L：大一上 BB 人物事件的逐句改稿（AA_207，AA-B 2026-10-17；附錄、BB_167 SC3／SC4；§6 是 AA-B 2026-10-23 的更正）——不需要瀏覽器。
//   1  AA_207 第 2 節七列（AA 定的版本）：傅鐘選項①、經原分組 #price、讀書會學姊開場（事件退休＝不做）、導遊③、來台大③（後來的改稿已經換掉＝不做）、
//      家裡的事（§6：結尾「嗯，謝了。」）、經原分組開場兩版
//   2  第 3 節第 4 點：四個事件只在大一（term）
//   3  第 3 節第 3 點：芷若紙杯上的電影場景只在第一次一定出、之後十分之一
//   4  第 4 節：品妤（第 6 點）、kx_nye_ask（第 7 點，後來的改稿已換）、ev_kexin_grades_open（第 8 點，已換）、Kevin（第 9 點，已換）
//   5  第 6 節（AA-B 10-23）四列：家裡的事結尾、M1 #nothing、子晴公館的晚上開場、讀書會（退休，不做）
//   6  其他抽樣：攤位 met_sis、阿凱 weekday、半夜兩句輪流、多包一層「」拿掉、zr_dm1、kx_yule_ask 的麵店團條件、方奕廷自我介紹
//   7  §7（AA-B 10-23 19:3x）：可昕生日 #c、學姊 sis_yutong、K2 舊系館、沛珊 doubt #should 與開頭、Kevin 學弟的車、Z1 rec 照舊
// 修改前（開發分支 873ea4b9f 之後的工作樹）：舊句都還在——FAIL。用法：node tests/ab65_2_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const texts=e=>(e&&e.dialogue||[]).filter(l=>l&&l.text!==undefined).map(l=>l.text);
const SRC=fs.readFileSync(path.join(H.ROOT,'src/data/events.js'),'utf8'), ST=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return H.said.map(s=>s.t); };

(async()=>{
await sec(1,async()=>{
  /* ① 傅鐘 */
  H.fresh('2025-09-30',15,'campus'); meet('heroine_02'); H.G.events.done.ev_zhiruo_ge_group=1;
  let L=await run('ev_zhiruo_bell',['週五的經原']);
  check('1. 傅鐘選項①「週五的經原……」另開一段：「圖我看得懂啦，是老師講太快。」「上週那張圖我只抄到一半，下次借我看。」（不再接「發呆」那句）',L.includes('圖我看得懂啦，是老師講太快。')&&L.includes('上週那張圖我只抄到一半，下次借我看。')&&!L.includes('對啊。下一堂三點，懶得走。'),J(L));
  H.fresh('2025-09-30',15,'campus'); meet('heroine_02'); L=await run('ev_zhiruo_bell',['發呆']);
  check('1. 傅鐘選項②「妳上完課都在這裡發呆？」→「對啊。下一堂三點，懶得走。」（BB_167 SC3 第 35 列；原本「發呆是下課最重要的部分。」）',L.includes('對啊。下一堂三點，懶得走。')&&!L.includes('圖我看得懂啦，是老師講太快。')&&!SRC.includes('發呆是下課最重要的部分。'),J(L));
  /* ② 經原分組 #price、⑦ 開場兩版 */
  H.fresh('2025-09-26',12.3,'putong'); L=await run('ev_zhiruo_ge_group',['網拍']);
  check('1. 經原分組（沒見過）：「不好意思，你是法律系的嗎？剛剛點名有聽到。」→「林芷若，外文二。」',L[0]==='不好意思，你是法律系的嗎？剛剛點名有聽到。'&&L[1]==='林芷若，外文二。'&&!L.includes('欸，是你。你也修經原喔？'),J(L.slice(0,3)));
  check('1. 經原分組 #price：「標錯價喔？我看過那種新聞。原來你們上課會講這個。」；收尾「好，那我把你拉進群組，報告的事群組講。」',L.includes('標錯價喔？我看過那種新聞。原來你們上課會講這個。')&&L[L.length-1]==='好，那我把你拉進群組，報告的事群組講。'&&!SRC.includes('一千元的相機那種')&&!SRC.includes('組員裡有一個法律系的'),J(L));
  H.fresh('2025-09-26',12.3,'putong'); meet('heroine_02'); L=await run('ev_zhiruo_ge_group',['報告很爛']);
  check('1. 經原分組（在 Café 認識過）：「欸，是你。你也修經原喔？」、不重新自我介紹（BB-B 00:19）',L[0]==='欸，是你。你也修經原喔？'&&!L.includes('林芷若，外文二。')&&!L.includes('不好意思，你是法律系的嗎？剛剛點名有聽到。'),J(L.slice(0,3)));
  /* ③ 讀書會學姊開場：事件退休（AA_207 §6）*/
  const sw=ev('ev_studygroup_wed');
  check('1. 讀書會學姊開場：事件已退休（AA_218 17-4）＝不做（AA_207 §6）；AA 的句子不在程式裡',!!sw&&!!sw.retired&&!SRC.includes('來了喔，隨便坐。今天讀刑訴，聽不懂沒關係。'));
  /* ④⑤ 可昕導遊③、來台大③：後來的改稿（AA_313／AA_372／AA_295）已經換掉整段，假設題不在了＝不做 */
  const tour=texts(ev('ev_kexin_tour_nccu')), ntu=texts(ev('ev_kexin_visits_ntu'));
  check('1. 導遊③：已經被後來的改稿取代（現在「……你答得太快了。我會點很多喔。」）；沒有「假設」、AA 的「沒有，我也剛到。」不加',tour.includes('……你答得太快了。我會點很多喔。')&&!tour.some(t=>/假設/.test(t))&&!tour.includes('沒有，我也剛到。'),J(tour.slice(-6)));
  check('1. 來台大③：已經被後來的改稿取代（現在「我沒有每天遲到。」→「證據呢？」）；AA 的「好啦，你沒有。」不加',ntu.includes('證據呢？')&&!ntu.some(t=>/假設/.test(t))&&!ntu.includes('好啦，你沒有。'),J(ntu));
  /* ⑥ 家裡的事（§6 更正結尾）*/
  const mm=texts(ev('ev_mingxuan_money'));
  check('1. 家裡的事：「我下學期家教可能要再多接。家裡……嗯。」「只是球可能要少打一點。」結尾「嗯，謝了。」（AA_207 §2、§6）',J(mm)===J(['我下學期家教可能要再多接。家裡……嗯。','只是球可能要少打一點。','嗯，謝了。'])&&!SRC.includes('他會請我吃一個月的麵'),J(mm)); });

await sec(2,()=>{ const T=id=>J((ev(id)||{}).term);
  check('2. 四個事件只在大一（term Y1S1、Y1S2）：公館的晚上、半夜的阿凱、家裡的事、妳自己喝什麼',['ev_ziqing_gongguan_night','ev_dorm_late_kai','ev_mingxuan_money','ev_zhiruo_own_drink'].every(id=>T(id)===J(['Y1S1','Y1S2'])),J(['ev_ziqing_gongguan_night','ev_dorm_late_kai','ev_mingxuan_money','ev_zhiruo_own_drink'].map(T))); });

await sec(3,async()=>{ const CUP='（紙杯上多了一行字，寫的是一部電影裡的一個場景。）', rnd=Math.random;
  const visit=async(r,note)=>{ H.fresh('2025-10-20',15,'cafe'); meet('heroine_02'); const x=SOCIAL.rel('heroine_02'); x.fam=70; x.trust=50; x.comf=45; H.G.flags.CAFE_VISITS=2; if(note) H.G.flags.zhiruoCupNote=true;
    Math.random=()=>r; try{ return await run('ev_cafe_barista_zhiruo',['拿鐵']); } finally { Math.random=rnd; } };
  let L=await visit(0.99,false); check('3. 好朋友、第一次（還沒有 zhiruoCupNote）：一定有紙杯那一句、記 zhiruoCupNote',L.includes(CUP)&&H.G.flags.zhiruoCupNote===true,J(L));
  L=await visit(0.5,true); check('3. 之後（已經有 zhiruoCupNote）：機率沒中＝沒有',!L.includes(CUP),J(L));
  L=await visit(0.05,true); check('3. 之後：偶爾一次（十分之一，ZR_CUP_NOTE_P）',L.includes(CUP)&&typeof ZR_CUP_NOTE_P==='number'&&ZR_CUP_NOTE_P===0.1,J(L)); });

await sec(4,async()=>{
  const ntu=texts(ev('ev_kexin_visits_ntu'));
  check('4-6. 品妤：「好久不見。你現在每天都在對面那棟喔？」（不報全名）',ntu.includes('好久不見。你現在每天都在對面那棟喔？')&&!ntu.some(t=>/曾品妤/.test(t)),J(ntu.slice(0,4)));
  check('4-6. 可昕：「我們的舊系館。……裡面的販賣機還是壞的。」（附錄 §2 的「……你現在每天經過，都不會進去了吧？」緊接品妤的問句，AA_207 §7 第 3 列再改）',ntu.includes('我們的舊系館。……裡面的販賣機還是壞的。')&&!ntu.includes('我們的舊系館。……你現在每天經過，都不會進去了吧？'));
  check('4-7. kx_nye_ask：已經被後來的改稿取代（現在「我想在臺北跟阿哲他們跨年。」）；舊的「我答應麵店團要去頂樓了。」沒有',ST.includes("{t:'我想在臺北跟阿哲他們跨年。'")&&!ST.includes('我答應麵店團要去頂樓了。')&&!ST.includes('麵店團好像要一起跨年，我想跟他們去。'));
  const go=texts(ev('ev_kexin_grades_open'));
  check('4-8. ev_kexin_grades_open：已經被後來的改稿取代（AA-C 11:23「……都過了。好，這次才是真的放假。」）；舊的「好，寒假開始。」沒有',go.includes('……都過了。好，這次才是真的放假。')&&!go.some(t=>/寒假開始/.test(t)),J(go));
  check('4-9. Kevin：「學弟有車！」（已經是；沒有「直屬學弟有車！」）',ST.includes("kv('學弟有車！')")&&!ST.includes('直屬學弟有車！')); });

await sec(5,async()=>{
  check('5. §6 家裡的事結尾「嗯，謝了。」（沒有「先不要跟阿哲講」）',texts(ev('ev_mingxuan_money')).slice(-1)[0]==='嗯，謝了。'&&!SRC.includes('先不要跟阿哲講'));
  H.fresh(STORY.termDay('Y1S1',7,2)?CALENDAR.dateOf(STORY.termDay('Y1S1',7,2)).key:'2025-10-14',21.5,'gongguan'); meet('classmate_mingxuan'); let L=await run('ev_mingxuan_notes',['什麼都沒看到']);
  check('5. §6 M1 #nothing：「我先回宿舍了。」；開頭「（笑）我在看漫畫啦。」（BB_167 SC4 第 29 列）',L.includes('我先回宿舍了。')&&L.includes('（笑）我在看漫畫啦。')&&!L.some(t=>/不要跟阿哲講|明天見/.test(t)),J(L));
  H.fresh('2025-10-15',21.5,'gongguan'); meet('heroine_04'); L=await run('ev_ziqing_gongguan_night',['活著']);
  check('5. §6 子晴公館的晚上：開場「你怎麼這麼晚還在公館？」（沒有「欸不是」）；第 2 句「我剛從網咖出來，打了三小時。……」',L[0]==='你怎麼這麼晚還在公館？'&&L[1]==='我剛從網咖出來，打了三小時。你室友還活著嗎？他三天沒回訊息。',J(L.slice(0,2)));
  check('5. §6 讀書會學姊開場：不做（事件退休）',!!ev('ev_studygroup_wed').retired&&texts(ev('ev_studygroup_wed'))[0]==='來了？坐。今天讀刑訴——一年級聽不懂沒關係，先聽爭點怎麼吵。'); });

await sec(6,async()=>{
  const booth=ev('ev_sis_festival_booth');
  check('6. 學姊攤位：加 met_sis（陌生學姊不會叫人顧攤）；刪感悟旁白「原來法律是分科的。」',J(booth.prereq)===J({flags:['met_sis']})&&!texts(booth).includes('原來法律是分科的。'));
  check('6. 阿凱螢幕：weekday [0,1,2,3,4]（週日晚上也說「你明天第一堂就有課」、週五不說）',J(ev('ev_kai_late_screen').weekday)===J([0,1,2,3,4]));
  { const late=ev('ev_dorm_late_kai'), B='（頭沒回）欸，你回來了。我這個 bug 追到第三小時。', C='在等編譯，你先洗澡。';
    const open=(told,n)=>{ H.fresh('2025-10-20',23.5,'dorm',{introDone:true}); if(told) H.G.flags.KAI_BUG_TOLD=true; H.G.events.done.ev_dorm_late_kai=n; return late.dialogue.filter(l=>l.text!==undefined&&l.speaker==='kai'&&(!l.if||EVENTS.cond(l.if))&&(!l.unless||!EVENTS.cond(l.unless))).map(l=>l.text)[0]; };
    check('6. 半夜的阿凱：還沒講過 bug＝「bug 追到第三小時」；講過以後兩句輪流（「在等編譯，你先洗澡。」）；結尾「（他笑了一聲，轉回去打字）好啦，你贏。」',open(false,1)===B&&open(true,1)===C&&open(true,2)===B&&texts(late).includes('（他笑了一聲，轉回去打字）好啦，你贏。')&&!SRC.includes('幹，好爛。'),J([open(false,1),open(true,1),open(true,2)])); }
  { const all=texts(ev('ev_grad_info_session')).concat(texts(ev('ev_sis_office_together')));
    check('6. 法研所說明會、許教授研究室：台詞外面多包的一層「」拿掉（第 3 節第 5 點）',!all.some(t=>/^「.*」$/.test(t))&&all.includes('我是碩二的陳冠廷，刑事法組。先講結論：研究所不是延長大學，是換一種讀法。')&&all.includes('那就先上課。有了再來。'),J(all.filter(t=>/^「/.test(t)))); }
  { const pot=texts(ev('ev_fangyt_pothos'));
    check('6. 方奕廷：「你是住我隔壁那間的吧？我方奕廷，森林系二年級。」接原句；「不用啦。我種太多了，房間放不下。」（BB_167 SC4 第 39 列）',pot[0]==='你是住我隔壁那間的吧？我方奕廷，森林系二年級。'&&pot[1]==='我經過的時候看到，你們房間沒有綠色的東西。'&&pot.includes('不用啦。我種太多了，房間放不下。'),J(pot.slice(0,2))); }
  { H.fresh('2025-10-20',8,'campus',{zhiruoShopContactDay:H.D('2025-10-20'),zhiruoFirstOrder:'拿鐵'}); H.G.hour=22.2; STORY.phoneRules(GM); PHONE.tick(H.G); const m=H.msgs('p:heroine_02');
    check('6. zr_dm1 Café 版：「我是兩點半的芷若。店裡的帳號是我在回。」「要外帶可以先傳，我先做。」「今天那杯拿鐵，奶泡我多打了一點，不知道你喝不喝得出來。」（BB_167 SC3 第 27 列）',J(m)===J(['我是兩點半的芷若。店裡的帳號是我在回。','要外帶可以先傳，我先做。','今天那杯拿鐵，奶泡我多打了一點，不知道你喝不喝得出來。']),J(m)); }
  check('6. kx_yule_ask 選項②：一律「我明天七點有事，晚一點可以嗎？」（AA_542 第 3 節：沒有固定的麵店日，拿掉「我七點跟麵店團吃飯」那個版本）',ST.includes("{t:'我明天七點有事，晚一點可以嗎？',set:{KX_YULE:'late'}")&&!ST.includes('我七點跟麵店團吃飯'));
  check('6. 可昕大一上的事件、story3d.js 的訊息裡沒有「假設」題（AA_207 §1 第 3 點；kexinFirstMsg、視訊第一題也已經沒有）',!STORY_EVENTS.filter(e=>(e.participants||[]).includes('kexin')).some(e=>texts(e).some(t=>/假設/.test(t)))); });

await sec(7,()=>{
  /* AA_207 §7（AA-B 10-23 19:3x，回 LAWWW-B 19:22 施工時發現的六處）*/
  const bd=texts(ev('ev_kexin_birthday_y1'));
  check('7-1. 可昕生日 #c：「……很會講欸。」（原本「……好，算你過。」替玩家打分）；導遊 s3「……你答得太快了。我會點很多喔。」照舊',bd.includes('……很會講欸。')&&!bd.includes('……好，算你過。')&&texts(ev('ev_kexin_tour_nccu')).includes('……你答得太快了。我會點很多喔。'),J(bd));
  check('7-2. 學姊 sis_yutong 第三則：「然後叫阿姨先睡覺。」（「這種事，準備好就不可怕。」標語句拿掉）',ST.includes("W('然後叫阿姨先睡覺。')]")&&!ST.includes('準備好就不可怕'));
  const ntu=texts(ev('ev_kexin_visits_ntu'));
  check('7-3. K2 可昕：「我們的舊系館。……裡面的販賣機還是壞的。」',ntu.includes('我們的舊系館。……裡面的販賣機還是壞的。')&&!ntu.some(t=>/都不會進去了吧/.test(t)),J(ntu));
  const pd=ev('ev_peishan_doubt').dialogue, i=pd.findIndex(l=>l.label==='should');
  check('7-4. 沛珊 doubt #should：只留「應該喔。……那是誰決定什麼叫應該？老師嗎？」（「應該。」和旁白「她重複一次。」刪掉）',pd[i+1]&&pd[i+1].text==='應該喔。……那是誰決定什麼叫應該？老師嗎？'&&!texts(ev('ev_peishan_doubt')).some(t=>t==='應該。'||t==='她重複一次。'),J(pd.slice(i,i+3)));
  check('7-4. 沛珊 doubt 開頭：「欸，你為什麼會來念法律？……除了考上以外。」（「我是說」全體禁用）',texts(ev('ev_peishan_doubt')).includes('欸，你為什麼會來念法律？……除了考上以外。')&&!SRC.includes('我是說，除了考上以外'));
  const Y34=fs.readFileSync(path.join(H.ROOT,'src/y34b3d.js'),'utf8');
  check('7-5. y34b3d.js Kevin：「學弟的車！家聚那台！」（Kevin 不是直屬）',Y34.includes("'學弟的車！家聚那台！'")&&!Y34.includes('直屬學弟的車'));
  check('7-6. Z1 rec 第二句照現在「抱歉，職業病。外文系的，看太多電影。林芷若。」',SRC.includes("'抱歉，職業病。外文系的，看太多電影。林芷若。'")); });

H.done();
})();

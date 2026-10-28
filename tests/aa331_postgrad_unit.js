// AA_331（AA-C a642f518）：2030 那一輪的總圖 B1、12/13 麵店，2030-10-01 照片照 RETAKE_STYLE，尾聲伴侶桌上的東西，方奕廷 2031 拿掉——不需要瀏覽器。
//   R1 日本路線 2030 第一次考：7/11 B1「……這句我去年說過。今年說給你聽。」；12/13 麵店兩張紅紙
//   R2 台灣、2029 一試沒過、讀書小組有語彤：7/11「……去年也是這句。今年要算數。」＋保鮮盒；12/13 三張紅紙、「她寫到手痠。」
//   R3 台灣、2029 一試沒過、RETAKE_STYLE='home'：2030-10-01 照片「家裡的書桌」
//   R4 畢業時和學姊交往、有 SIS_THERMOS：尾聲「桌上有兩個保溫瓶。」；沒有＝「蓋子換過」
//   R5 交換路線、和方奕廷熟（BAR_YEAR 2031 的舊存檔也一樣）：尾聲他沒有「那一年你在考試」
//   另外：17:00 阿哲私訊（不發群組）、和可昕交往中麵店最後她到、沒去＝一句旁白、2029 已經考上的沒有這兩段
// AA_357 1-6（2026-10-21）：交換延畢 2030 有沒有報名改看 BAR_REG_2030（2030-05-10 問；原本 BAR_REG!==false＝沒問就算），延畢的前置條件從 BAR_REG:true 改成 BAR_REG_2030:true。
// 修改前：沒有 B1_2030（第 1 項 FAIL）。用法：node tests/aa331_postgrad_unit.js
const H=require('./pg_harness.js'); const {check}=H;
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
(async()=>{
  check('0. 台詞資料 AA_331 都在（B1_2030、R2_2030、FIRST_RETAKE、EPI_PARTNER）',!!(POSTGRAD_LINES.B1_2030&&POSTGRAD_LINES.R2_2030&&POSTGRAD_LINES.FIRST_RETAKE&&POSTGRAD_LINES.EPI_PARTNER));
  // R1
  { const G=H.fresh('2030-07-11',19,'dorm',{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true}); graduated(G);
    check('R1. 交換延畢 2030 要考（sits 2030）',PG.sits(G,2030)===true);
    const L=PG.b1Lines2030(G).map(x=>x[1]); check('R1. 7/11 B1：阿哲第二句「……這句我去年說過。今年說給你聽。」，沒有保鮮盒',L.includes('……這句我去年說過。今年說給你聽。')&&!L.some(t=>/保鮮盒/.test(t))&&L[0]==='（總圖 B1。長桌只坐了一半，考古題疊得一樣高。）',JSON.stringify(L));
    const N=PG.noodle2030Lines(G).map(x=>x[1]); check('R1. 12/13 麵店：兩張紅紙＋阿哲「去年沒吃到的，今年一起吃。」',N[0]==='（麵店的長桌。門口貼了兩張紅紙，一張是你，一張是阿哲。）'&&N.includes('（舉起碗）去年沒吃到的，今年一起吃。')&&N.length===2,JSON.stringify(N)); }
  // R2
  { const G=H.fresh('2030-07-11',19,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:10,BAR_STAGE_2029:'none',BAR_STUDY_GROUP:['yutong']}); graduated(G);
    const L=PG.b1Lines2030(G).map(x=>x[1]); check('R2. 2029 也報了名：「……去年也是這句。今年要算數。」＋語彤的保鮮盒',L.includes('……去年也是這句。今年要算數。')&&L.includes('（把一個保鮮盒放在滷味旁邊）阿姨說，今年換她出菜。'),JSON.stringify(L));
    const N=PG.noodle2030Lines(G).map(x=>x[1]); check('R2. 麵店：三張紅紙（第一行換掉）、「她寫到手痠。」、阿哲那句還在',N[0]==='（門口的紅紙貼了三張。第三張的墨還沒乾，寫的是語彤。）'&&N.some(t=>/她寫到手痠/.test(t))&&N.includes('（舉起碗）去年沒吃到的，今年一起吃。'),JSON.stringify(N)); }
  // 可昕交往中
  { const G=H.fresh('2030-12-13',17,'dorm',{EXCHANGE_ROUTE:'US',BAR_REG_2030:true}); graduated(G); H.date('kexin');
    const N=PG.noodle2030Lines(G).map(x=>x[1]); check('麵店：和可昕交往中，最後多「（可昕最後到，外套還沒脫。）」「我在事務所就查了。……這次也先查了你的。」',N[N.length-2]==='（可昕最後到，外套還沒脫。）'&&N[N.length-1]==='我在事務所就查了。……這次也先查了你的。',JSON.stringify(N)); }
  // 17:00 私訊、2029 已考上的沒有
  { const G=H.fresh('2030-07-11',17.1,'dorm',{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true}); graduated(G); H.tick();
    check('7/11 17:00 阿哲私訊「今天滷味我帶」（私訊，不是群組）',H.msgs('p:zhe').includes('今天滷味我帶')&&!H.msgs('g:noodle_team').includes('今天滷味我帶'),JSON.stringify(H.msgs('p:zhe')));
    const G2=H.fresh('2030-07-11',17.1,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:15,BAR_STAGE_2029:'lawyer',BAR_YEAR:2029}); graduated(G2); H.tick();
    check('2029 已經考上：沒有 2030 的 B1、沒有阿哲私訊',PG.sits(G2,2030)===false&&!H.msgs('p:zhe').includes('今天滷味我帶')); }
  // B1 2030 step runs
  { const G=H.fresh('2030-07-11',20,'dorm',{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true}); graduated(G); H.said=[]; await H.run('b1_2030');
    check('7/11 20:00 B1 那一段真的演（字卡「總圖 B1」、背景 ntu_lib_b1）',H.has('（總圖 B1。長桌只坐了一半，考古題疊得一樣高。）')&&H.cards.some(c=>c[1]==='總圖 B1')); }
  // 沒去
  { const G=H.fresh('2030-12-13',20,'dorm',{EXCHANGE_ROUTE:'JP'}); H.said=[]; await PG.noodleMissed2030(H.GM);
    check('12/13 麵店沒去：一句旁白「（麵店門口的紅紙，多了你的名字。）」',H.has('（麵店門口的紅紙，多了你的名字。）')); }
  // R3
  { const G=H.fresh('2030-10-01',21,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:10,BAR_STAGE_2029:'none',RETAKE_STYLE:'home'}); graduated(G); H.said=[]; await H.run('first');
    check('R3. RETAKE_STYLE home：照片「家裡的書桌。檯燈下面壓著一張讀書計畫。」＋「（你的第一天，還在後面。）」',H.msgs('g:noodle_team')[0]==='📷（照片：家裡的書桌。檯燈下面壓著一張讀書計畫。）'&&H.has('（你的第一天，還在後面。）'),H.msgs('g:noodle_team')[0]); }
  { const G=H.fresh('2030-10-01',21,'dorm',{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true}); graduated(G); H.said=[]; await H.run('first');
    check('交換延畢（沒有 RETAKE_STYLE）：照舊補習班的自習室',H.msgs('g:noodle_team')[0]==='📷（照片：補習班的自習室。）'); }
  // R4 尾聲
  const epiItems=(flags,setup)=>{ const G=H.fresh('2034-06-03',18,'dorm',Object.assign({},flags)); graduated(G); if(setup) setup(G); return PG.epiItems(G); };
  { const A=epiItems({SIS_THERMOS:true},()=>H.date('heroine_05')), B=epiItems({},()=>H.date('heroine_05'));
    check('R4. 和學姊交往、有 SIS_THERMOS：「（桌上有兩個保溫瓶。…）」接在祐廷那一樣後面；沒有＝「蓋子換過」',A.length===2&&/桌上有兩個保溫瓶/.test(A[1])&&B.length===2&&/蓋子換過/.test(B[1]),JSON.stringify([A,B])); }
  { const A=epiItems({},()=>H.date('heroine_01')), S0=epiItems({});
    check('以安是伴侶：「說理由。」那張紙一定在；單身＝只有祐廷那一樣',A.length===2&&/說理由/.test(A[1])&&S0.length===1,JSON.stringify([A,S0])); }
  // R5
  { const s=require('fs').readFileSync(require('path').join(H.ROOT,'src/postgrad3d.js'),'utf8');
    check('R5. 方奕廷「那一年你在考試」只看台灣路線 BAR_YEAR===2030（交換路線 2031 拿掉）',/if\(!S\.delayed\(G\)&&F\.BAR_YEAR===2030\) t=Fy\.y2030;/.test(s)&&!/BAR_YEAR===2031\)\) t=Fy\.y2030/.test(s)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });

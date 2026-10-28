// AA_467 事件台詞全文掃描（企劃線 5bbd16ab1，AA-B 2026-10-25 15:3x；第①級）——不需要瀏覽器。台詞逐字對稿（git show 讀稿、解析表格），實際跑事件看演出來的字。
//   0 讀稿：第 1 節大一上原本三句、大一下／大二上的表；第 2 節三年的零點、結尾
//   1 期末最後一頓（src/data/events.js）：大一上 ev_term_last_meal 照舊；大一下 ev_term_last_meal_y1s2、大二上 ev_term_last_meal_y2s1 前三句換字；
//     大二上後面三句照舊（Alison 和阿哲、以安的手帳、語彤）；三個學期演出來的開場沒有一句一樣
//   2 可昕的高雄跨年 ev_kx_nye_river_y2～y4：大二照舊；大三、大四零點那句、結尾那句換成那一年的；開頭、選項、她的回覆、KX_NYE_DONE 照舊；三年的零點、結尾都不一樣
// 修改前（開發分支 661423a71）：1、2 FAIL。用法：node tests/aa467_evdup_unit.js
// （2026-10-28 AA_519 1-3（企劃線 d75cd0228，NPC-STORY2-1028）：大一下、大二上的第二、三句再換——送小菜的旁白照順序（第三處餛飩、第四處小黃瓜）、
//   「吃好一點」只留大一上（大一下「一年了。……今天的湯，算我的。」、大二上不下雨「吃完再走。」）。第 1 段照 AA_467 的表再套 AA_519 那幾句比（新句要在 AA_519 裡）；第一句照 AA_467）
require('./alison.js');
const H=require('./pg_harness.js');
const cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
GM.caption=()=>{}; GM.toast=()=>{};
const SHA='5bbd16ab1', P467='docs/story_planning/AA_467_事件台詞全文掃描_期末最後一頓_可昕的高雄跨年.md';
const DOC=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show '+SHA+':"'+P467+'"',{cwd:process.env.SPEC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } })();
const part=(a,b)=>{ const i=DOC.indexOf(a); if(i<0) return ''; const j=b?DOC.indexOf(b,i+a.length):-1; return DOC.slice(i,j<0?DOC.length:j); };
const rows=s=>s.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|[-| :]+\|\s*$/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const quotes=s=>s.split('\n').map(l=>/^\s*>\s*(.+?)\s*$/.exec(l)).filter(Boolean).map(m=>m[1]);
const strip=t=>{ const k=t.indexOf('：'); return k>0&&k<6?t.slice(k+1):t; };   /* 「旁白：」「阿姨：」拿掉 */
const S1=part('## 1.','## 2.'), S2=part('## 2.','## 3.');
const ORIG=quotes(S1).map(strip);   /* 大一上原本那三句 */
const T1={}; for(const r of rows(S1)){ const m=/`(ev_term_last_meal_\w+)`/.exec(r[0]); if(m) T1[m[1]]=r[1].split('／').map(strip); }
const T2={}; for(const r of rows(S2)){ const y={大二:2,大三:3,大四:4}[r[0]]; if(y) T2[y]={zero:r[1].replace(/（原句）$/,''),end:r[2].replace(/（原句）$/,'')}; }
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
/* AA_519 1-3：AA_467 那兩列的第二、三句換成 AA_519 的（第一句照舊）*/
const P519='docs/story_planning/AA_519_配角第二批_麵店阿姨_陳助教_Café_黃筱涵_阿凱.md';
const DOC519=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show d75cd0228:"'+P519+'"',{cwd:process.env.SPEC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } })();
const FIX519={ev_term_last_meal_y1s2:[null,'（每個人的湯碗裡，都多了兩顆餛飩。）','一年了。……今天的湯，算我的。'],ev_term_last_meal_y2s1:[null,'（桌上多了一碟小黃瓜。沒有人點。）','吃完再走。']};
const W1=id=>(T1[id]||[]).map((t,i)=>FIX519[id][i]||t);
const in519=()=>DOC519.indexOf('「一年了。吃好一點。」→「一年了。……今天的湯，算我的。」')>=0&&DOC519.indexOf('（不下雨的那一版：「吃完再走。」）')>=0&&DOC519.indexOf('2. （每個人的湯碗裡，都多了兩顆餛飩。）')>=0&&DOC519.indexOf('3. （桌上多了一碟小黃瓜。沒有人點。）')>=0;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const play=async(id,picks,flags)=>{ H.fresh('2027-01-20',19,'noodle',Object.assign({noodleTableDay:3},flags||{})); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return H.said.map(s=>s.t); };

(async()=>{
  check('0. 讀稿（企劃線 AA_467 @'+SHA+'）：大一上原本三句、大一下／大二上的表、三年的零點和結尾',DOC.indexOf('# AA_467')>=0&&ORIG.length===3&&ORIG[0]==='期末最後一科考完。麵店團一定吃一頓。'&&(T1.ev_term_last_meal_y1s2||[]).length===3&&(T1.ev_term_last_meal_y2s1||[]).length===3&&!!T2[2]&&!!T2[3]&&!!T2[4],J({ORIG,T1,T2}));
  if(!DOC){ H.done(); return; }
  /* ======================= 1 期末最後一頓 ======================= */
  await sec(1,async()=>{
    const y11=await play('ev_term_last_meal');
    check('1. 大一上 ev_term_last_meal 照舊（原本三句）',J(y11.slice(-3))===J(ORIG),J(y11));
    const y12=await play('ev_term_last_meal_y1s2');
    check('1. 大一下 ev_term_last_meal_y1s2：「（大一最後一科考完。長桌又併起來了。）」（AA_467）＋AA_519 1-3「（每個人的湯碗裡，都多了兩顆餛飩。）」阿姨「一年了。……今天的湯，算我的。」',in519()&&J(y12)===J(W1('ev_term_last_meal_y1s2'))&&(T1.ev_term_last_meal_y1s2||[])[2]==='一年了。吃好一點。',J(y12));
    check('1. 大一下第三句是阿姨說的',H.said[2]&&H.said[2].who==='阿姨'&&H.said[0].who===null&&H.said[1].who===null);
    const k0=STORY.knows; STORY.knows=id=>['zhe','yu','heroine_01','heroine_03'].includes(id);
    let y21; try{ y21=await play('ev_term_last_meal_y2s1',[],{YU_ZHE_TOLD:'msg'}); } finally{ STORY.knows=k0; }
    check('1. 大二上 ev_term_last_meal_y2s1 前三句：「（大二上最後一科考完。長桌的位子，…）」（AA_467）＋AA_519 1-3「（桌上多了一碟小黃瓜。沒有人點。）」阿姨「吃完再走。」（不下雨的那一版）',in519()&&J(y21.slice(0,3))===J(W1('ev_term_last_meal_y2s1'))&&H.said[2].who==='阿姨'&&(T1.ev_term_last_meal_y2s1||[])[2]==='吃好一點。',J(y21));
    check('1. 大二上後面三句照舊：（Alison 和阿哲坐在一起。）、（以安在手帳上寫：「大二上：完成」。）、語彤「今天阿姨叫我坐下來吃。」',J(y21.slice(3))===J(['（Alison 和阿哲坐在一起。）','（以安在手帳上寫：「大二上：完成」。）','今天阿姨叫我坐下來吃。']),J(y21.slice(3)));
    const all=[...y11.slice(-3),...y12,...y21.slice(0,3)];
    check('1. 三個學期的開場九句沒有一句一樣（原本前三句一字不差三次）',new Set(all).size===9,J(all));
  });
  /* ======================= 2 可昕的高雄跨年 ======================= */
  await sec(2,async()=>{
    const OPEN={2:'（愛河邊。她站在橋下等你，手插在外套口袋裡。）',3:'（愛河邊。她帶了兩個暖暖包，一個塞進你的外套口袋。）',4:'（愛河邊。她已經占好了位置，就在橋旁邊。）'};   /* 開頭（照舊，開發分支 661423a71）*/
    const OPTS={2:['「新年快樂。」','（牽她的手）'],3:['「新年快樂。」','「暖暖包還妳。」'],4:['「新年快樂。」','「明年也來。」']};
    const REP={2:['……嗯。新年快樂。','（她沒有看你，但手沒有抽回去。）'],3:['嗯。','不用。那個本來就是你的。'],4:['新年快樂。','……你先考完再說。']};
    const zeros=[], ends=[];
    for(const y of [2,3,4]) for(const k of [0,1]){
      const L=await play('ev_kx_nye_river_y'+y,[k],{KX_NYE:{1:'river'}}); const zi=L.indexOf(T2[y].zero);
      check('2. 大'+['','','二','三','四'][y]+'（選第 '+(k+1)+' 個）：零點「'+T2[y].zero+'」、結尾「'+T2[y].end+'」',zi>=0&&L[L.length-1]===T2[y].end&&L.includes(OPEN[y]),J(L));
      check('2. 大'+['','','二','三','四'][y]+'（選第 '+(k+1)+' 個）：選項、她的回覆、KX_NYE_DONE='+y+' 照舊',J(H.opts[0])===J(OPTS[y])&&L.includes(REP[y][k])&&H.G.flags.KX_NYE_DONE===y&&L[zi+1]==='新年快樂。',J([H.opts[0],L]));
      if(k===0){ zeros.push(L[zi]); ends.push(L[L.length-1]); } }
    check('2. 大二照舊（原句）：「（零點。煙火在河的另一邊。）」「（凌晨一點，加開的那班高鐵。）」',T2[2].zero==='（零點。煙火在河的另一邊。）'&&T2[2].end==='（凌晨一點，加開的那班高鐵。）'&&zeros[0]===T2[2].zero&&ends[0]===T2[2].end);
    check('2. 三年的零點、結尾都不一樣',new Set(zeros).size===3&&new Set(ends).size===3,J([zeros,ends]));
  });
  H.done();
})();

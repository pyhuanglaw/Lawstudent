// AA_379 第 4 節（企劃線 992b58da；任務 AA379-SIS-LATE-W1-1022）：大一沒認識學姊的玩家，大一以後第一次找她說話＝W1 的晚到版——不需要瀏覽器。
//   0 每一句都在稿裡　1 大二上 9/14 晚上 Café：演晚到版（開頭照地點、兩個選項）、記 met_sis、SIS_W1、SIS_W1_LATE、FIRST_MET、關係 +3
//   2 四個地點各自的開頭；校園不演　3 日子：大一（上、下、寒假）不演、大一暑假起演、2029-06-01 演、06-02 不演；已經認識的不演
//   4 原本的 W1 照舊限大一
// 修改前：沒有 ev_sis_w1_late（全部 FAIL）。用法：node tests/aa379_late_w1_unit.js
// 2026-10-28 AA_523 第 6-6 點改的（企劃線 0d7b5388b，SIS-B16-1028）：大三「之前一直沒遇到。」→「嗯。……現在遇到了。」、大四「四年都沒遇到。」→「……那還來得及。我六月才畢業。」——
//   遊戲裡帶 aa523 的那兩句改對 AA_523 第 6 節 6-6 那一列（一字不差），其他每一句照舊對 AA_379；檢查沒有拿掉
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const H=require('./pg_harness.js'); const cp=require('child_process'); const {check,GM}=H;
let doc=''; try{ doc=cp.execSync('git show 992b58da:"docs/story_planning/AA_379_學姊當主要女主角_補強_第一批.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
let doc523=''; try{ doc523=cp.execSync('git show 0d7b5388b:"docs/story_planning/AA_523_學姊第十六批_回臺灣以後的最後半年.md"',{cwd:process.env.AA523_DOCREPO||H.ROOT,encoding:'utf8'}); }catch(e){ doc523=''; }
const row66=(doc523.split('\n').find(l=>l.startsWith('| 6-6 |'))||'');   /* AA_523 第 6 節 6-6 那一列 */
const ev=id=>STORY_EVENTS.find(e=>e.id===id), E=ev('ev_sis_w1_late'), J=JSON.stringify;
const setup=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone,Object.assign({},flags||{})); return G; };
const play=async(picks)=>{ H.said=[]; H.picks=(picks||[]).slice(); await EVENTS.run(E); return H.said.map(s=>s.t); };
(async()=>{
  check('0. 讀得到稿（企劃線 992b58da 的 AA_379 第 4 節）、有 ev_sis_w1_late',/## 4\. 大一沒認識她的玩家/.test(doc)&&!!E);
  if(!E){ H.done(); return; }
  const txt=E.dialogue.filter(n=>n.text&&!n.aa523).map(n=>n.text.replace(/\{name\}/g,'{name}'));
  check('0. 每一句台詞都在稿裡（一字不差）',txt.every(t=>doc.includes(t)),J(txt.filter(t=>!doc.includes(t))));
  { const t523=E.dialogue.filter(n=>n.text&&n.aa523).map(n=>n.text);   /* AA_523 6-6 */
    check('0. AA_523 6-6 加的兩句（大三、大四她的回答）都在 AA_523 第 6 節 6-6 那一列（企劃線 0d7b5388b，一字不差）',!!row66&&t523.length===2&&t523.every(t=>row66.includes('「'+t+'」')),JSON.stringify(t523)); }
  /* 1 */
  { const G=setup('2026-09-14',20,'cafe'); const ok=EVENTS.check(E); const r0=SOCIAL.rel('heroine_05').fam||0; const L=await play([1]);
    check('1. 大二上 9/14 20:00 Café、沒認識：演晚到版',ok&&L[0]==='（她坐在靠窗的位子，計畫本攤開，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'&&L[1]==='學姊好，我是祐廷，妳的直屬學弟。'&&L.includes('家族群組裡的那個名字。家聚你一次都沒來。')&&L.includes('我還以為，你是不需要學姊的那種人。'),J(L));
    check('1. 選「我不知道去哪裡找學姊。」→「晚上我大多在 Café 或法圖。……不難找。」；最後「以後有問題，私訊我。……這次記得問。」',L.includes('晚上我大多在 Café 或法圖。……不難找。')&&!L.includes('嗯。大一都很忙。……我也是。')&&L[L.length-1]==='以後有問題，私訊我。……這次記得問。'&&L[L.length-2]==='溫書瑀。現在在念研究所。',J(L));
    check('1. 記 met_sis、SIS_W1、SIS_W1_LATE、FIRST_MET',G.flags.met_sis===true&&G.flags.SIS_W1===true&&G.flags.SIS_W1_LATE===true&&SOCIAL.has('heroine_05','FIRST_MET'),J({f:[G.flags.met_sis,G.flags.SIS_W1,G.flags.SIS_W1_LATE]})); }
  { setup('2026-09-14',20,'cafe'); const L=await play([0]); check('1. 選「大一太忙了。」→「嗯。大一都很忙。……我也是。」',L.includes('嗯。大一都很忙。……我也是。')&&!L.includes('晚上我大多在 Café 或法圖。……不難找。'),J(L)); }
  /* 2 */
  { const first={}; for(const z of ['lawlib','library','library_hall']){ setup('2027-03-10',19.5,z); const ok=EVENTS.check(E); const L=await play([0]); first[z]=ok?L[0]:null; }
    setup('2027-03-10',19.5,'campus'); const camp=EVENTS.check(E);
    check('2. 法圖、閱覽室、自習區各自的開頭；校園不演',first.lawlib==='（她坐在法圖最裡面那張桌子，計畫本攤開，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'&&first.library==='（她坐在靠窗的位子讀書，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'&&first.library_hall==='（她坐在長桌的一角讀書，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'&&!camp,J({first,camp})); }
  /* 3 */
  { const at=(k,f)=>{ setup(k,20,'cafe',f); return EVENTS.check(E); };
    const R=CALENDAR.termDays('Y1S2'), lastY1=CALENDAR.dateOf(R.to).key, sum=CALENDAR.dateOf(R.to+1).key;
    const res={y1s1:at('2025-10-15'),winter:at('2026-02-10'),y1s2:at('2026-04-15'),lastY1:at(lastY1),summer:at(sum),last:at('2029-06-01'),after:at('2029-06-02'),met:at('2026-09-14',{met_sis:true})};
    check('3. 大一（上 10/15、寒假 2/10、下 4/15、大一下最後一天 '+lastY1+'）不演；大一暑假第一天 '+sum+' 起演；2029-06-01 演、06-02 不演；已經認識的不演',!res.y1s1&&!res.winter&&!res.y1s2&&!res.lastY1&&res.summer&&res.last&&!res.after&&!res.met,J(res)); }
  /* 4 */
  { const W=ev('ev_sis_w1'); check('4. 原本的 W1 照舊限大一（term Y1S1、Y1S2）',!!W&&J(W.term)===J(['Y1S1','Y1S2'])); }
  H.done(); })().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });

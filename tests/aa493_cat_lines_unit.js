// AA_493 溫州街的貓會走動以後的四句（WZ-CAT-LIFE-1023／J13；AA 分支 868726e5c，AA-C 2026-10-27 22:50）——不需要瀏覽器。
//   畫面：白天 07:00～17:30、沒下雨，貓在小公園走動、大多坐在老樹圓椅前面（src/wzcat3d.js）；17:30 以後、下雨、寒流趴在圓椅上／石桌底下。
//   0  讀稿 AA_493：取名兩版第一句、環境句白天版、所長回來白天版都在稿裡，遊戲裡的字和稿一樣
//   1  取名（wzpark3d.js）：白天、沒下雨＝「坐在圓椅前面看你。你蹲下來，牠沒有逃走。」；17:30 以後、下雨＝「趴在圓椅上。牠沒有逃走。」；第二句「你要叫牠什麼？」、三個名字照舊
//   2  有 3D 的貓（WZCAT 載入）照它的 awake 判斷（同一個時段、天氣規則，3D 和句子不會對不上）
//   3  環境句（story3d.js，16:00～21:00）：17:30 以前白天版「…在老樹下面走來走去。」、以後原句（tests/wz_park_talk_unit.js 第 8 項也查）
//   4  所長回來（wz_events.js ev_wz_p_back）：白天「坐在樹下的圓椅前面」、晚上原句（tests/aa420_wz_unit.js 第 4 項演一次）
// 修改前（開發分支 62d05a94c）：0、1、3、4 FAIL。用法：node tests/aa493_cat_lines_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''};
for(const f of ['src/data/calendar.js','src/wzpark3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|PARK)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mk=(day,hour,o)=>Object.assign({day,hour,weekday:CALENDAR.dateOf(day).wd%7,flags:{},daily:{},zone:'wenzhou',weather:'clear'},o||{});
const mkGM=(G,ans)=>{ const q=(ans||[]).slice(); const L={says:[],menus:[]}; return {G,L,E:{player:{obj:{position:{x:0,z:0}}}},sceneBegin(){},sceneEnd(){},sleep:async()=>{},walkTo:async()=>true,sitAt(){},standUp(){},seatApproach:s=>[s.x,s.z],
  advance(h){ G.hour+=h; },toast(){},say:async(w,t)=>{ L.says.push(t); },choose:async o=>{ L.menus.push(o.map(x=>x.t)); const a=q.shift(); return a==null?0:a; }}; };
const CAT={park:'cat'};
const DAYL='一隻橘白色的胖貓，坐在圓椅前面看你。你蹲下來，牠沒有逃走。', LIE='一隻橘白色的胖貓，趴在圓椅上。牠沒有逃走。';
const AMB_DAY='有隻貓在老樹下面走來走去。有人蹲在旁邊拍照。', BACK_DAY='所長回來了，前腳纏著一圈繃帶，坐在樹下的圓椅前面，和平常一樣不理人。';
(async()=>{
  let doc=''; try{ doc=cp.execSync('git show 868726e5c:"docs/story_planning/AA_493_回LAWWW_溫州街的貓會走動以後的四句.md"',{cwd:ROOT,encoding:'utf8'}); }catch(e){}
  check('0. 讀得到 AA_493（AA 分支 868726e5c）',doc.length>300,'git fetch origin claude/magical-albattani-bk7b4n');
  const L=PARK.LINES||{};
  check('0. 取名兩版第一句照稿（白天＝CAT_NAME_INTRO[0]、晚上／下雨＝CAT_NAME_LIE）、第二句照舊',L.CAT_NAME_INTRO&&L.CAT_NAME_INTRO[0]===DAYL&&L.CAT_NAME_LIE===LIE&&L.CAT_NAME_INTRO[1]==='你要叫牠什麼？'&&doc.includes('> '+DAYL)&&doc.includes('> '+LIE),J([L.CAT_NAME_INTRO,L.CAT_NAME_LIE]));
  check('0. 環境句白天版、所長回來白天版照稿',doc.includes('{貓}在老樹下面走來走去。有人蹲在旁邊拍照。')&&doc.includes('> '+BACK_DAY));
  // 1 取名
  const name=async(day,h,o)=>{ const G=mk(dayOf(day),h,o); const gm=mkGM(G,[0]); await PARK.interact(gm,CAT); return gm.L.says; };
  const a=await name('2025-10-08',10), b=await name('2025-10-08',18), c=await name('2025-10-08',10,{weather:'rain'}), d=await name('2025-10-08',17.49), e=await name('2025-10-08',17.5);
  check('1. 白天 10:00 沒下雨：「坐在圓椅前面看你。你蹲下來，牠沒有逃走。」→「你要叫牠什麼？」',a[0]===DAYL&&a[1]==='你要叫牠什麼？',J(a));
  check('1. 18:00：「趴在圓椅上。牠沒有逃走。」',b[0]===LIE&&b[1]==='你要叫牠什麼？',J(b));
  check('1. 白天下雨：「趴在圓椅上。牠沒有逃走。」（AA_493 第 2 節）',c[0]===LIE,J(c));
  check('1. 17:29 白天版、17:30 晚上版（和 3D 的貓同一個時間）',d[0]===DAYL&&e[0]===LIE,J([d[0],e[0]]));
  check('1. 原句「在圓椅上曬太陽」不在遊戲裡',!/曬太陽。牠沒有逃走/.test(fs.readFileSync(path.join(ROOT,'src/wzpark3d.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'')));
  // 2 有 3D 的貓
  global.WZCAT={awake:()=>false}; const f=await name('2025-10-08',10); global.WZCAT={awake:()=>true}; const g=await name('2025-10-08',19); delete global.WZCAT;
  check('2. 有 3D 的貓：照 WZCAT.awake（白天 awake false＝趴著那一版；晚上 awake true＝白天版）',f[0]===LIE&&g[0]===DAYL,J([f[0],g[0]]));
  // 3 環境句
  { const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); const m=st.match(/key:'park',from:16,to:21,lines:(G=>\{.*?\})\}\];/); let fn=null; try{ fn=m&&eval('(PARK=>'+m[1]+')')(PARK); }catch(x){}
    const r=h=>fn&&fn(mk(dayOf('2025-10-08'),h)); check('3. 環境句：16:30 白天版、17:30 以後原句、下雨不播',!!fn&&r(16.5)[0]===AMB_DAY&&/^老樹下的圓椅上有隻貓在睡覺/.test(r(17.5)[0])&&fn(mk(dayOf('2025-10-08'),16.5,{weather:'rain'}))===null,m?J([r(16.5),r(17.5)]):'找不到'); }
  // 4 所長回來
  { const s=fs.readFileSync(path.join(ROOT,'src/data/wz_events.js'),'utf8'); const i=s.indexOf("ev('ev_wz_p_back'"), ln=i>=0?s.slice(i,s.indexOf('\n',i)):'';
    check('4. 所長回來：白天版（if 貓醒著）、晚上原句（unless）兩行都在、看 PARK.catAwake',ln.includes(BACK_DAY)&&ln.includes('躺在樹下的圓椅上')&&/catDay/.test(ln)&&/PARK\.catAwake/.test(s),ln.slice(0,120)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

// 社團布告欄「看看」（CLUB-BOARD-INFO-1105、X237；AA_701@4f5f78fd23；src/clubboard3d.js、src/data/club_board.js）。不需要瀏覽器。
// 用法：node tests/club_board_1112_unit.js。這是 Node 模擬（真正的 CALENDAR、ACTIVITIES、CLUB_BOARD、CLUBBOARD；GM 是假的），不是玩家在瀏覽器裡的流程。
//   0 資料和白名單上的稿一致（匯入工具 --check）；1 照學期列哪幾張；2 社博以前多一行；3 看的流程（開頭 → 選一張兩句 → 最後一行）；4 日常失速東牆接的是這一份；5 法服兩句不再寫隔週
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+String(info).slice(0,500):'')); if(!ok) fails++; };
for(const f of ['src/data/calendar.js','src/data/activities.js','src/data/club_board.js','src/clubboard3d.js']) load(f);
const dayOf=k=>{ for(let d=-420;d<2200;d++) if(CALENDAR.dateOf(d).key===k) return d; return null; };
global.STORY={dayOfKey:dayOf};
(async()=>{
  let ok=true, out=''; try{ out=cp.execFileSync('python3',['tools/story/import_club_board.py','--check'],{cwd:ROOT,encoding:'utf8'}); }catch(e){ ok=false; out=String(e.stdout||e.message); }
  check('0. club_board.js 和白名單上的 AA_701 一致（import_club_board.py --check）',ok,out.trim().slice(0,160));
  check('0. 五張（吉他社、辯論社、登山社、系籃、法服）每張有時間地點、怎麼加入、一句話；開頭、最後一行、社博那一行都有字',CLUB_BOARD.rows.length===5&&CLUB_BOARD.rows.every(r=>r.club&&r.when&&r.join&&r.say&&ACTIVITIES.list.some(a=>a.id===r.act))&&!!CLUB_BOARD.intro&&!!CLUB_BOARD.last&&!!CLUB_BOARD.expo);
  const expo=dayOf('2025-09-06'), mk=day=>({day,flags:{}});
  const clubsAt=day=>CLUBBOARD.rows(mk(day)).map(r=>r.club);
  const want=T=>CLUB_BOARD.rows.filter(r=>ACTIVITIES.list.find(a=>a.id===r.act).term.includes(T)).map(r=>r.club);
  const dY1S1=expo+20, tY1S1=CALENDAR.termOf(dY1S1);
  check('1. 大一上學期中：列的就是 activities.js 這學期有的那幾張（五張都在）',tY1S1&&tY1S1.id==='Y1S1'&&J(clubsAt(dY1S1))===J(want('Y1S1'))&&clubsAt(dY1S1).length===5,J(clubsAt(dY1S1)));
  let dY3=null; for(let d=expo;d<expo+1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y3S1'&&t.week===3){ dY3=d; break; } }
  check('1. 大三上：只列這學期還有活動的（辯論社、登山社只有大一上＝不列）',dY3!=null&&J(clubsAt(dY3))===J(want('Y3S1'))&&!clubsAt(dY3).includes('辯論社')&&!clubsAt(dY3).includes('登山社'),J(clubsAt(dY3)));
  let dBreak=null; for(let d=dY1S1;d<dY1S1+300;d++){ if(!CALENDAR.termOf(d)){ dBreak=d; break; } }
  check('1. 寒假裡看：照接下來那個學期（大一下）',dBreak!=null&&CLUBBOARD.termId(mk(dBreak))==='Y1S2'&&J(clubsAt(dBreak))===J(want('Y1S2')),J([dBreak,clubsAt(dBreak)]));
  check('2. 社博（2025-09-06）以前多一行社博的時間地點；當天起沒有',CLUBBOARD.expoLine(mk(expo-1))===CLUB_BOARD.expo&&CLUBBOARD.expoLine(mk(expo))===null&&CLUBBOARD.expoLine(mk(expo+30))===null&&/9\/6/.test(CLUB_BOARD.expo));
  const run=async(day,picks)=>{ const said=[], menus=[]; let n=0, depth=0; const GM={G:mk(day),say:async(w,t)=>{ said.push(t); },choose:async o=>{ menus.push(o.map(x=>x.t)); return picks[n++]; },sceneBegin(){ depth++; },sceneEnd(){ depth--; }}; const r=await CLUBBOARD.look(GM); return {said,menus,r,depth}; };
  { const a=await run(expo-1,[0,5]), g=CLUB_BOARD.rows[0];
    check('3. 社博前一天、看吉他社再「不看了」：開頭 → 社博那一行 → 吉他社兩句（時間地點／怎麼加入＋一句話）→ 最後一行',a.r===true&&a.depth===0&&J(a.said)===J([CLUB_BOARD.intro,CLUB_BOARD.expo,g.club+'｜'+g.when,'怎麼加入：'+g.join+'　「'+g.say+'」',CLUB_BOARD.last]),J(a.said));
    check('3. 選單＝這學期的每一張＋「不看了」',J(a.menus[0])===J(want('Y1S1').concat(['不看了'])),J(a.menus[0])); }
  { const a=await run(dY1S1,[0,1,2,3,4]); check('3. 五張都看完自動收尾（不用再按「不看了」）、最後一行只出一次',a.menus.length===5&&a.said.filter(t=>t===CLUB_BOARD.last).length===1&&a.said.length===1+10+1,J([a.menus.length,a.said.length])); }
  { const G0=mk(dY1S1); const A0=ACTIVITIES.list; const save=A0.map(a=>a.term); for(const r of CLUB_BOARD.rows) ACTIVITIES.list.find(a=>a.id===r.act).term=['X']; const a=await run(dY1S1,[]); A0.forEach((x,i)=>x.term=save[i]);
    check('3. 五張這學期都沒有活動：開頭 → 「公告大多是給新生看的…」→ 最後一行、沒有選單（AA_701 第 3 節第 1 點）',J(a.said)===J([CLUB_BOARD.intro,CLUB_BOARD.none,CLUB_BOARD.last])&&a.menus.length===0&&/新生/.test(CLUB_BOARD.none),J(a.said)); }
  { const said=[]; const GM={G:mk(dY1S1),say:async(w,t)=>{ said.push(t); },choose:async()=>5,sceneBegin(){},sceneEnd(){}}; await CLUBBOARD.look(GM,{intro:()=>'（牆上原本的一句）'}); check('3. 呼叫的人給 intro（日常失速＝AA_648 隨機一句）就用它當開頭，不用通用開頭',said[0]==='（牆上原本的一句）'&&!said.includes(CLUB_BOARD.intro)); }
  const off=fs.readFileSync(path.join(ROOT,'src/offbeat_sys3d.js'),'utf8'), idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  check('4. 日常失速東牆「看社團佈告欄」（offLook clubs）接 CLUBBOARD.look；index.html 在 offbeat_sys3d.js 以前載入 club_board.js、clubboard3d.js',/it\.offLook==='clubs'[^\n]*CLUBBOARD\.look\(GM,\{intro:g=>S\.look\(g,'clubs'\)\}\)/.test(off)&&idx.indexOf('src/data/club_board.js')>0&&idx.indexOf('src/clubboard3d.js')>idx.indexOf('src/data/club_board.js')&&idx.indexOf('src/clubboard3d.js')<idx.indexOf('src/offbeat_sys3d.js'));
  const cf=fs.readFileSync(path.join(ROOT,'src/data/club_fair.js'),'utf8'), ac=fs.readFileSync(path.join(ROOT,'src/data/activities.js'),'utf8');
  check('5. AA_701 第 2 節：法服攤 after、lawclub_study.whenText 換成新句（不再寫隔週週六）',cf.includes("'有民眾預約才開，前一天晚上群組會講。第一次站旁邊聽就好。'")&&!cf.includes('隔週週六九點')&&ac.includes("whenText:'有預約的週六上午，法律系館B一樓（前一天晚上群組通知）'"));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();

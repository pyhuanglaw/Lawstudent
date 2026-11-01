// 麵店團縮小成背景（AA_542，NOODLE-TEAM-SHRINK-1030；使用者 2026-10-30 X144「我認真覺得麵店團很突兀 沒有前因後果 甚至沒有必要」→ 選「縮小成背景」）——不需要瀏覽器。
//   1 麵店日（S.noodleDay）：每個上課週兩天、至少一天週二或週四；考試週、國定假日、寒暑假沒有；同一天問兩次一樣（學期＋週次當種子）
//   2 群組名「法一吃飯」：建立的系統字、阿哲兩則「吃飯用」「誰要吃什麼就喊」；大二～大四上課第一天 12:00 改名（法二、法三、法四），系統一行
//   3 舊存檔：群組叫「麵店團」＝換成當學年的名字、過了的改名不補發；舊的兩則規矩顯示新句子
//   4 長桌閒聊一週最多一則；5 玩家看得到的字（遊戲資料）沒有「麵店團」
// 修改前：298d5fd37（第一、二段）第 1 項 FAIL（每週都是週二、週四）、ndlPair 沒有就中斷；AA_542 以前（b98cfd02b）2、3、5 也不成立（群組叫麵店團）。用法：node tests/ndl_group_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
try{ let src=fs.readFileSync(path.join(H.ROOT,'src/data/noodle_table.js'),'utf8'); src=src.replace(/^const (NOODLE_TABLE)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:'noodle_table.js'}); }catch(e){}
const D=k=>STORY.dayOfKey(k);
// 1 麵店日
{ const bad=[], weeks={}; for(const T of CALENDAR.TERMS){ if(!/^Y[1-4]/.test(T.id)) continue; const d0=D(T.start); for(let d=d0;d<d0+T.weeks*7;d++){ const t=CALENDAR.termOf(d); if(!t) continue; const k=t.id+':'+t.week; (weeks[k]=weeks[k]||{t,days:[],hol:0}); if(STORY.noodleDay(d)) weeks[k].days.push(CALENDAR.dateOf(d).wd); if(CALENDAR.kind(d)!=='term'&&CALENDAR.dateOf(d).wd>=1&&CALENDAR.dateOf(d).wd<=5) weeks[k].hol++; } }
  for(const k in weeks){ const w=weeks[k]; if(w.t.exam){ if(w.days.length) bad.push(k+' 考試週有'); continue; } if(w.days.length>2) bad.push(k+' 超過兩天'); if(!w.hol&&w.days.length!==2) bad.push(k+' 沒有假日卻不是兩天'); if(!w.hol&&!w.days.some(x=>x===2||x===4)) bad.push(k+' 沒有週二四'); if(w.days.some(x=>x<1||x>5)) bad.push(k+' 週末'); }
  check('1. 每個上課週兩天（有假日的週可能少）、至少一天週二或週四、考試週沒有、不在週末',!bad.length&&Object.keys(weeks).length>100,bad.slice(0,5).join('｜'));
  const pattern=Object.values(weeks).filter(w=>!w.t.exam&&!w.hol).map(w=>w.days.join('')); check('1. 不是每週都同一組（不固定哪幾天）',new Set(pattern).size>=4,J([...new Set(pattern)]));
  let hd=null; for(let d=D('2025-09-01');d<D('2029-06-30')&&hd==null;d++){ const t=CALENDAR.termOf(d); if(t&&!t.exam&&CALENDAR.holiday(d)&&STORY.ndlPair(t).includes(CALENDAR.dateOf(d).wd)) hd=d; }
  check('1. 挑到國定假日那天就不算（不補）；寒假不是',hd!=null&&!STORY.noodleDay(hd)&&!STORY.noodleDay(D('2026-01-20')),J(hd!=null&&CALENDAR.dateOf(hd).key));
  const a=[...Array(200)].map((_,i)=>STORY.noodleDay(D('2025-09-01')+i)), b=[...Array(200)].map((_,i)=>STORY.noodleDay(D('2025-09-01')+i)); check('1. 同一天問兩次一樣',J(a)===J(b)); }
// 2 群組名、建立、改名
const grp=(key,h,flags)=>{ H.fresh(key,h,'campus',Object.assign({noodleTableDay:D('2025-09-11')},flags||{})); STORY.phoneRules(GM); PHONE.tick(H.G); return H.G; };
const gmsg=G=>(G.msgs||[]).filter(m=>m.th==='g:noodle_team').map(m=>[m.from||'',m.text]);
{ const G=grp('2025-09-11',21); const m=gmsg(G);
  check('2. 建立：群組「法一吃飯」；系統字「阿哲建立了群組「法一吃飯」，把你加了進來。」；阿哲「吃飯用」「誰要吃什麼就喊」',PHONE.rec(G).groups.noodle_team.name==='法一吃飯'&&J(m.slice(0,3))===J([['','阿哲建立了群組「法一吃飯」，把你加了進來。'],['zhe','吃飯用'],['zhe','誰要吃什麼就喊']]),J(m));
  const y2=D('2026-09-07'); H.at('2026-09-07',11.9); STORY.phoneRules(GM); PHONE.tick(G); const before=PHONE.rec(G).groups.noodle_team.name;
  H.at('2026-09-07',12.2); STORY.phoneRules(GM); PHONE.tick(G); const after=PHONE.rec(G).groups.noodle_team.name, ren=(G.msgs||[]).find(x=>x.tag==='ndl_rename_Y2S1');
  check('2. 大二上課第一天 12:00 改名「法二吃飯」，系統一行（12:00 以前還是法一）',before==='法一吃飯'&&after==='法二吃飯'&&!!ren&&ren.text==='（阿哲把群組名稱改成「法二吃飯」。）'&&ren.day===y2&&ren.h>=12&&ren.h<12.3,J({before,after,ren:ren&&[ren.day,ren.h,ren.text]}));
  H.at('2028-09-04',12.5); STORY.phoneRules(GM); PHONE.tick(G); check('2. 一路到大四「法四吃飯」（法三那一行也有）',PHONE.rec(G).groups.noodle_team.name==='法四吃飯'&&(G.msgs||[]).some(x=>x.tag==='ndl_rename_Y3S1')&&(G.msgs||[]).some(x=>x.tag==='ndl_rename_Y4S1'),PHONE.rec(G).groups.noodle_team.name); }
{ H.fresh('2027-10-05',20,'campus',{noodleTableDay:D('2025-09-11'),NDL_LATE_ADD:true}); STORY.phoneRules(GM); PHONE.tick(H.G); const m=gmsg(H.G);
  check('2. 大三才被拉進來（NDL_LATE_ADD，2027-10-05）：「阿哲把你加進了群組「法三吃飯」。」照當學年的名字、不補發改名',m.length>=1&&m[0][1]==='阿哲把你加進了群組「'+STORY.ndlGroupName(H.G)+'」。'&&!(H.G.msgs||[]).some(x=>/^ndl_rename_/.test(x.tag||'')),J(m)); }
// 3 舊存檔
{ H.fresh('2027-03-10',20,'campus',{noodleTableDay:D('2025-09-11')}); PHONE.join(H.G,'noodle_team','麵店團'); const G=H.G; PHONE.rec(G).groups.noodle_team.day=D('2025-09-11');
  G.msgs=(G.msgs||[]).concat([{th:'g:noodle_team',text:'阿哲建立了群組「麵店團」，把你加了進來。',tag:'noodle_team_new',day:D('2025-09-11'),h:21},{th:'g:noodle_team',from:'zhe',text:'以後週二週四 麵店長桌',tag:'noodle_team_rule',day:D('2025-09-11'),h:21},{th:'g:noodle_team',from:'zhe',text:'有空就來 沒空不用講',tag:'noodle_team_rule',day:D('2025-09-11'),h:21}]);
  STORY.phoneRules(GM); PHONE.tick(G); const m=gmsg(G);
  check('3. 舊存檔（大二下）：群組名換成「法二吃飯」；舊的兩則顯示「吃飯用」「誰要吃什麼就喊」、系統字「法一吃飯」；過了的大二改名不補發',PHONE.rec(G).groups.noodle_team.name==='法二吃飯'&&m.some(x=>x[1]==='吃飯用')&&m.some(x=>x[1]==='誰要吃什麼就喊')&&!m.some(x=>/麵店團|週二週四/.test(x[1]))&&!(G.msgs||[]).some(x=>x.tag==='ndl_rename_Y2S1'),J(m)); }
// 4 長桌閒聊一週最多一則
{ let k=null; for(let d=D('2025-10-06');d<D('2025-11-30')&&!k;d++){ const t=CALENDAR.termOf(d); if(!t||t.exam) continue; const L=[]; for(let e=d;e<d+7;e++){ const u=CALENDAR.termOf(e); if(u&&u.week===t.week&&STORY.noodleDay(e)) L.push(e); } if(L.length===2) k=L; }
  const F0=f=>{ H.fresh(CALENDAR.dateOf(k[0]).key,18,'noodle',{afternoonDone:true}); PHONE.join(H.G,'noodle_team','法一吃飯'); for(const id of ['zhe','yu','classmate_bohan','classmate_xinci','heroine_03']) SOCIAL.remember(id,'FIRST_MET',''); };
  F0(); const d1=STORY.ndlTalkDue(H.G); H.G.flags.ndlTalkDay=k[0]; const t=CALENDAR.termOf(k[0]); H.G.flags.ndlTalkWk=t.id+':'+t.week; H.at(CALENDAR.dateOf(k[1]).key,18); H.G.zone='noodle'; const d2=STORY.ndlTalkDue(H.G);
  check('4. 同一週第一個麵店日可以演；演過以後同一週第二個麵店日不演（一週最多一則）',d1===true&&d2===false,J({days:k&&k.map(d=>CALENDAR.dateOf(d).key),d1,d2})); }
// 5 遊戲資料裡玩家看得到的字沒有「麵店團」（註解不算）
{ const hits=[]; for(const dir of ['src','src/data']) for(const f of fs.readdirSync(path.join(H.ROOT,dir))){ if(!/\.js$/.test(f)) continue; const src=fs.readFileSync(path.join(H.ROOT,dir,f),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1').replace(/["']?(note|doc|src)["']?\s*:\s*("([^"\\\n]|\\.)*"|'([^'\\\n]|\\.)*')/g,'');   /* note／doc／src＝開發說明，玩家看不到 */ const re=/'([^'\\\n]|\\.)*'|"([^"\\\n]|\\.)*"|`([^`\\]|\\.)*`/g; let m; while((m=re.exec(src))){ if(m[0].indexOf('麵店團')>=0&&!/^'(「)?麵店團(」)?'$/.test(m[0])&&!(f==='v6ex3d.js'&&/^'A3 以安：/.test(m[0]))) hits.push(dir+'/'+f+': '+m[0].slice(0,40));   /* 除外：舊存檔改名比對用的「麵店團」、v6ex3d.js 的 S.NOT_DONE（給 LAWWW／AA 看的沒做清單）*/ } }
  check('5. src 的字串（不含註解、note 開發說明）沒有「麵店團」（舊存檔改名比對用的、S.NOT_DONE 除外）',!hits.length,hits.slice(0,6).join('｜')); }
// 6 第一次併桌（AA_542 1-1、1-2）：民總下課阿哲約；答應＝18:30 阿鳳麵店（出遊）；不管答應不答應，當天 21:00 建群組
{ const inv=(STORY_EVENTS||[]).find(e=>e.id==='ev_zhe_noodle_invite'), out=(STORY_EVENTS||[]).find(e=>e.id==='ev_zhe_long_table_out'), auto=(STORY_EVENTS||[]).find(e=>e.id==='ev_zhe_long_table');
  const T=e=>(e&&e.dialogue||[]).filter(x=>x.text).map(x=>x.text);
  check('6. 約：民總下課（afterClass civ_general、classAlso）阿哲「晚上吃麵？公館那家，阿鳳。」、選項「好。」「今天不行。」',!!inv&&inv.afterClass==='civ_general'&&inv.classAlso===true&&T(inv)[0]==='晚上吃麵？公館那家，阿鳳。'&&J((inv.dialogue.find(x=>x.choice)||{choice:[]}).choice.map(c=>c.text))===J(['「好。」','「今天不行。」'])&&T(inv).includes('六點半，店門口。')&&T(inv).includes('好啊，下次。'));
  const L=['（阿哲把兩張桌子併起來。）','你們？法律系的？','一年級。阿姨，我們之後會常來。','常來是多常？','（想了一下）想吃麵的時候。','那就是常來。','（對你）這家便宜，又近。之後想吃麵就來，遇到就一起坐。'];
  check('6. 第一次併桌：出遊版、在麵店遇到版台詞一樣（七句）；title「第一次併桌」；在麵店遇到版只在麵店日',!!out&&!!auto&&J(T(out))===J(L)&&J(T(auto))===J(L)&&out.title==='第一次併桌'&&auto.title==='第一次併桌'&&auto.ndlDay===true&&out.trigger==='outing');
  const d=STORY.termDay('Y1S1',2,4);
  H.fresh(CALENDAR.dateOf(d).key,15.5,'campus',{zheNoodleInvDay:d,ZHE_NOODLE_INV:'yes'}); STORY.phoneRules(GM); PHONE.tick(H.G); const q=OUT.get(H.G,'zhe_first_table'); const g0=PHONE.inGroup(H.G,'noodle_team');
  H.at(CALENDAR.dateOf(d).key,21.1); STORY.phoneRules(GM); PHONE.tick(H.G); const g1=PHONE.inGroup(H.G,'noodle_team'), nt=H.G.flags.noodleTableDay;
  check('6. 答應：排 18:30 阿鳳麵店「第一次併桌」（出遊 ev_zhe_long_table_out）；21:00 以前沒有群組、21:00 建「法一吃飯」',!!q&&q.ev==='ev_zhe_long_table_out'&&q.day===d&&q.h===18.5&&!g0&&g1&&nt===d&&PHONE.rec(H.G).groups.noodle_team.name==='法一吃飯',J({q:q&&[q.ev,q.day,q.h],g0,g1,nt}));
  H.fresh(CALENDAR.dateOf(d).key,15.5,'campus',{zheNoodleInvDay:d,ZHE_NOODLE_INV:'no'}); STORY.phoneRules(GM); const q2=OUT.get(H.G,'zhe_first_table'); H.at(CALENDAR.dateOf(d).key,21.1); STORY.phoneRules(GM); PHONE.tick(H.G);
  check('6. 不答應：不排出遊；21:00 照樣建群組',!q2&&PHONE.inGroup(H.G,'noodle_team')&&H.G.flags.noodleTableDay===d,J({q2:!!q2,nt:H.G.flags.noodleTableDay})); }
H.done();

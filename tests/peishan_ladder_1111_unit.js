// 沛珊大一下～大四下的閒聊階梯重寫（PEISHAN-VOICE-1110；使用者 X327「有趣、聰明、會接梗」；AA_753 第二～四份，2026-11-11）——不需要瀏覽器（D131）。
// tools/ladder/import_ladder.py 的 PS753_MORE 把三份稿疊在 ladder_bb_y*.json 的 classmate_peishan 上 → src/data/ladder.js（大一上在 tests/peishan_ladder_1110_unit.js）。
//   1. 白名單一份一筆、工具各自只認一個 SHA；ladder.js 的來源有寫
//   2. 每學期八層：lines、choices（{t, re, fx}）一字照稿；其他欄位（id、if、week、skipIf、skipAfterWeek、rel、mem、extraIf、friendOnly、context、順序）和重寫以前（BASE）一樣
//   3. 招呼：base 照稿；when 的條件不動、只少稿上說要拿掉的那幾則
//   4. linesIf（P2-L3、P3-L3／L4／L6／L8，稿沒有寫）：那一套的兩句和原本的選項一起留著——成立的時候演舊的兩句＋舊選項，不成立演新的
//   5. 演一次：回答裡的旁白（整句括號）當旁白演、fx 有加、記憶有記
//   6. 關係面板的字照新句
//   7. 這幾個學期她的階梯、招呼裡沒有重寫前的句子；舊存檔（聊到第 N 層）照接
//   8. 連著條件的地方跟著新句子走：溫州街帶小孩過馬路那一則（aa614：週三 20:50～21:10）、只在上課日說的招呼（greet_classday.js）
// 稿讀 git show；這份 checkout 沒有企劃線那個 commit（淺層複本）＝不比稿，只驗結構和演出。用法：node tests/peishan_ladder_1111_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const PS='classmate_peishan', BASE='a724370bc';   /* BASE＝重寫以前的開發分支（比「其他欄位不動」用）*/
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
/* 一份稿：檔名、只認的 SHA、學期 → [招呼模式, 要拿掉的 when] */
const FILES=[
  {f:'AA_753_peishan_ladder_Y1S2_Y2S1.json',sha:'c5094495d',terms:{Y1S2:['full',['我在客運上背了一路，才背到第三章。']],Y2S1:['full',['我背到第三章，還有四章。']]}},
];
const LINESIF=['P2-L3','P3-L3','P3-L4','P3-L6','P3-L8'];
const str=x=>typeof x==='string'?x:(x&&x.narr)||null;
const cond=q=>{ const o={}; for(const k in q) if(k!=='t'&&k!=='note') o[k]=q[k]; return o; };
for(const F of FILES){ const raw=show(F.sha,'docs/story_planning/'+F.f); F.A=raw?JSON.parse(raw):null; }
const OLD=(()=>{ const s=show(BASE,'src/data/ladder.js'); if(!s) return null; try{ return new Function(s+';return LADDER;')(); }catch(e){ return null; } })();
let WANT=[], CH=[];
GM.choose=async o=>{ const T=o.map(q=>q.t||q.text); CH.push(T); const w=WANT.shift(); const k=typeof w==='number'?w:T.indexOf(w); return k>=0?k:0; };
const who={name:'沛珊',charId:PS};
const stepOf=id=>{ for(const t in LADDER.byTerm){ const p=LADDER.byTerm[t][PS]; const s=p&&p.steps.find(x=>x.id===id); if(s) return s; } return null; };
const play=async(sid,pick,setup)=>{ const G=H.fresh('2026-10-20',14,'campus',null); H.rel(PS,65,50,45); INV.addContact&&INV.addContact(G,PS); if(setup) setup(G); H.said=[]; CH=[]; WANT=[pick]; const r0=Object.assign({},SOCIAL.rel(PS)); await STORY.ladPlay(GM,who,PS,stepOf(sid)); return {G,r0,r1:SOCIAL.rel(PS)}; };

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files, tool=fs.readFileSync(path.join(H.ROOT,'tools/ladder/import_ladder.py'),'utf8');
    for(const F of FILES){ const e=allow.filter(x=>x.path==='docs/story_planning/'+F.f);
      check('1. 白名單一筆 '+F.f+'、sha '+F.sha+'、approved；工具寫死只認這一版',e.length===1&&e[0].sha===F.sha&&e[0].status==='approved'&&tool.includes("('"+F.f+"', '"+F.sha+"'"));
      check('1. ladder.js 的來源有 '+F.f.replace('.json','')+'@'+F.sha,String(LADDER.source).includes(F.f.replace('.json','')+'@'+F.sha)); }
    console.log(FILES.every(F=>F.A)&&OLD?'（稿和 BASE 都讀得到：逐字比對）':'（這份 checkout 讀不到企劃線的稿或 BASE：不比稿，只驗結構和演出）'); });

  await sec(2,async()=>{ for(const F of FILES) for(const term of Object.keys(F.terms)){ const P=LADDER.byTerm[term][PS], ST=P.steps, A=F.A&&F.A[term], O=OLD&&OLD.byTerm[term][PS];
      check('2. '+term+'：八層；選項都是新格式 {t, re, fx}（沒有 reply、沒有選項自己的 rel）、每層至少兩個；沒有留舊的 note',ST.length===8&&ST.every(s=>s.choices.length>=2&&s.choices.every(c=>c.reply===undefined&&c.rel===undefined&&Array.isArray(c.re)&&c.re.length&&c.re.every(x=>typeof x==='string'&&x.trim())&&c.fx&&Object.keys(c.fx).every(k=>k==='fr'||k==='love'))&&s.note===undefined));
      if(A){ const bad=[]; A.steps.forEach((a,i)=>{ const s=ST[i]; if(s.id!==a.id||J(s.lines)!==J(a.lines)||s.choices.length!==a.choices.length||!a.choices.every((c,k)=>s.choices[k].t===c.t&&J(s.choices[k].re)===J(c.re.map(str))&&J(s.choices[k].fx||null)===J(c.fx||null)&&(s.choices[k].mem||null)===(c.mem||null))||(s.mem||null)!==(a.mem||null)) bad.push(a.id); });
        check('2. '+term+'：八層的 lines、每個選項的字／回答／fx 一字照稿（回答裡的 {narr} 寫成整句括號的字串）；整層的 mem 和稿一樣',bad.length===0&&A.steps.length===8,J(bad)); }
      if(O){ const strip=s=>{ const o={}; for(const k in s) if(!['lines','choices','note','linesIf'].includes(k)) o[k]=s[k]; return o; }, add=F.skipIf||{};
        const bad=[]; O.steps.forEach((o,i)=>{ const s=ST[i], want=strip(o); if(add[o.id]) want.skipIf=add[o.id]; const ks=k=>J(Object.keys(k).sort().map(x=>[x,k[x]])); if(ks(strip(s))!==ks(want)) bad.push(o.id+' '+J(strip(s))+' ≠ '+J(want)); });
        check('2. '+term+'：id、順序、if、week、skipIf、skipAfterWeek、rel、整層的 mem、extraIf 和重寫以前一樣'+(Object.keys(add).length?'（只多 '+Object.keys(add).join('、')+' 的 skipIf）':''),bad.length===0&&ST.length===O.steps.length,J(bad));
        const rest=p=>{ const o={}; for(const k in p) if(k!=='steps'&&k!=='greet') o[k]=p[k]; return J(o); };
        check('2. '+term+'：friendOnly、context 不動',rest(P)===rest(O),rest(P)); } } });

  await sec(3,async()=>{ for(const F of FILES) for(const term of Object.keys(F.terms)){ const [mode,drop]=F.terms[term], P=LADDER.byTerm[term][PS], A=F.A&&F.A[term], O=OLD&&OLD.byTerm[term][PS];
      check('3. '+term+' 招呼：拿掉的那幾則（'+(drop.join('／')||'無')+'）不在了',drop.every(t=>!P.greet.when.some(w=>w.t===t)&&!P.greet.base.includes(t)));
      if(A) check('3. '+term+' 招呼 base 一字照稿'+(mode==='full'?'、when 的句子一字照稿':''),J(P.greet.base)===J(A.greet.base)&&(mode!=='full'||J(P.greet.when.map(w=>w.t))===J(A.greet.when.map(w=>w.t))),J(P.greet.base));
      if(O){ const keep=O.greet.when.filter(w=>!drop.includes(w.t));
        check('3. '+term+' 招呼 when：條件（時間、地點、星期、週次、天氣）和重寫以前一樣，只少拿掉的那 '+drop.length+' 則'+(mode==='base'?'；句子不動':''),J(P.greet.when.map(cond))===J(keep.map(cond))&&O.greet.when.length-keep.length===drop.length&&(mode!=='base'||J(P.greet.when.map(w=>w.t))===J(keep.map(w=>w.t))),J(P.greet.when.map(cond))); } } });

  await sec(4,async()=>{ const have=LINESIF.filter(id=>stepOf(id));
    for(const id of have){ const s=stepOf(id), O=OLD&&(()=>{ for(const t in OLD.byTerm){ const p=OLD.byTerm[t][PS]; const x=p&&p.steps.find(q=>q.id===id); if(x) return x; } return null; })();
      check('4. '+id+'：linesIf 那一套留著、自己帶選項（舊格式 reply）',Array.isArray(s.linesIf)&&s.linesIf.length===1&&Array.isArray(s.linesIf[0].choices)&&s.linesIf[0].choices.length>=2&&s.linesIf[0].choices.every(c=>typeof c.reply==='string'));
      if(O) check('4. '+id+'：linesIf 的條件、兩句和重寫以前一樣；帶的選項＝重寫以前那一層的選項',J(cond(Object.assign({},s.linesIf[0],{choices:undefined,lines:undefined})))===J(cond(Object.assign({},O.linesIf[0],{lines:undefined})))&&J(s.linesIf[0].lines)===J(O.linesIf[0].lines)&&J(s.linesIf[0].choices)===J(O.choices)); }
    if(stepOf('P3-L3')){ const s=stepOf('P3-L3');
      await play('P3-L3',0); const n1=H.said.map(x=>x.t), c1=CH[0];
      check('4. P3-L3 沒聽過「我要重考」：演新的兩句、新的兩個選項',J(n1.slice(0,2))===J(s.lines)&&J(c1)===J(s.choices.map(c=>c.t)),J([n1,c1]));
      await play('P3-L3',1,G=>{ G.events=G.events||{}; G.events.done=G.events.done||{}; G.events.done.ev_peishan_decision=true; }); const n2=H.said.map(x=>x.t), c2=CH[0];
      check('4. P3-L3 聽過「我要重考」（ev_peishan_decision）：演 linesIf 那兩句＋它自己帶的選項和回覆（不會接到新的選項）',J(n2.slice(0,2))===J(s.linesIf[0].lines)&&J(c2)===J(s.linesIf[0].choices.map(c=>c.t))&&n2[n2.length-1]===s.linesIf[0].choices[1].reply,J([n2,c2])); }
    if(stepOf('P2-L3')){ const s=stepOf('P2-L3');
      await play('P2-L3',0,G=>SOCIAL.remember(PS,'SAW_HER_TEACH','x')); const n=H.said.map(x=>x.t);
      check('4. P2-L3 看過她上課（SAW_HER_TEACH）：演 linesIf 那兩句＋它自己帶的選項；整層的記憶 PS2_TUTOR_HEARD 照記',J(n.slice(0,2))===J(s.linesIf[0].lines)&&J(CH[0])===J(s.linesIf[0].choices.map(c=>c.t))&&SOCIAL.has(PS,'PS2_TUTOR_HEARD'),J([n,CH])); } });

  await sec(5,async()=>{
    if(stepOf('P2-L7')){ const s=stepOf('P2-L7'); const r=await play('P2-L7',0); const n=H.said.find(x=>x.t==='（你搖頭。）');
      check('5. P2-L7 選項一：回答中間的「（你搖頭。）」當旁白演（沒有說話的人），前後兩句是她說的；記 PS2_WHY_LAW',!!n&&n.who===null&&H.said[H.said.length-1].who==='沛珊'&&H.said[H.said.length-1].t===s.choices[0].re[2]&&SOCIAL.has(PS,'PS2_WHY_LAW'),J(H.said.slice(-3)));
      check('5. P2-L7：整層的 rel 照舊加（fam、trust）',r.r1.fam>r.r0.fam&&r.r1.trust>r.r0.trust,J([r.r0,r.r1])); }
    if(stepOf('P2-L8')){ await play('P2-L8',0); const k=H.said.findIndex(x=>x.t==='（她清了清喉嚨。）');
      check('5. P2-L8 選項一：回答第一行「（她清了清喉嚨。）」當旁白演，接著「「同學！看這邊！」」是她說的',k>=0&&H.said[k].who===null&&H.said[k+1].t==='「同學！看這邊！」'&&H.said[k+1].who==='沛珊',J(H.said.slice(-3))); }
    if(stepOf('P2-L1')){ await play('P2-L1',1); check('5. P2-L1 聊完記 PS2_SIX_PLATES（名字照舊）；兩句 → 兩個選項 → 回答',SOCIAL.has(PS,'PS2_SIX_PLATES')&&CH.length===1&&CH[0].length===2&&H.said[0].t===stepOf('P2-L1').lines[0]&&H.said.length===4,J(H.said.map(x=>x.t))); } });

  await sec(6,async()=>{ const src=fs.readFileSync(path.join(H.ROOT,'src/social3d.js'),'utf8'); const lab=k=>{ const m=src.match(new RegExp('\\b'+k+":'([^']*)'")); return m?m[1]:(LADDER.labels||{})[k]; };
    const WANT_LAB={PS2_SIX_PLATES:'寒假看了三部動畫，邊看邊做筆記'};
    const bad=Object.keys(WANT_LAB).filter(k=>lab(k)!==WANT_LAB[k]);
    check('6. 關係面板的字照新句：'+Object.keys(WANT_LAB).map(k=>k+'「'+WANT_LAB[k]+'」').join('、'),bad.length===0,J(bad.map(k=>[k,lab(k)])));
    const all=[]; for(const F of FILES) for(const term of Object.keys(F.terms)) for(const s of LADDER.byTerm[term][PS].steps){ if(s.mem) all.push(s.mem); for(const c of s.choices) if(c.mem) all.push(c.mem); }
    check('6. 這幾個學期每個記憶都有面板字（不會露出英文代號）、面板字沒有「早餐店」「端六盤」',all.every(k=>typeof lab(k)==='string'&&lab(k).trim())&&!all.some(k=>/早餐店|端六盤|煎蛋|包書套最快/.test(lab(k)||'')),J(all.filter(k=>!lab(k)||/早餐店|端六盤|煎蛋|包書套最快/.test(lab(k))).map(k=>[k,lab(k)]))); });

  await sec(7,async()=>{ for(const F of FILES) for(const term of Object.keys(F.terms)){ const P=LADDER.byTerm[term][PS];
      const cur=J({s:P.steps.map(s=>[s.lines,s.choices]),b:P.greet.base});   /* linesIf（等 AA 補）和沒動的 when 不算 */
      const old=['早餐店','端六盤','一次端','客運','煎蛋','蛋餅','想太多','奇怪的問題','顧店','家傳'].filter(t=>cur.includes(t));
      check('7. '+term+'：她的八層、招呼 base 裡沒有重寫前的字（早餐店、端盤子、客運、煎蛋、「想太多」、顧店）',old.length===0,J(old)); }
    if(stepOf('P2-L4')){ const G=H.fresh('2026-04-20',14,'campus',null); H.rel(PS,30,10,5); (G.social.ladder||(G.social.ladder={}))[PS+':Y1S2']=3; const D=STORY.ladData(G,PS);
      const k=D&&D.key, n=k?(G.social.ladder[k]|0):null; if(k&&k!==PS+':Y1S2'){ G.social.ladder[k]=3; }
      const nx=STORY.ladNext?STORY.ladNext(G,PS):null;
      check('7. 舊存檔（大一下聊到第 3 層）：下一層照接 P2-L4（層數的存法沒有動；key '+k+'）',!!D&&(!STORY.ladNext||(!!nx&&nx.id==='P2-L4')),J([k,n,nx&&nx.id])); } });

  await sec(8,async()=>{ const X='（她帶著一排小孩過馬路，對你點頭）等一下！我在上班！';
    /* aa614_3d.js 不在 pg_harness 的載入清單：照 tests/aa614_jobs_unit.js 的方式載入（它載入時改 LADDER） */
    { const vm=require('vm'); for(const f of ['src/data/shop_npc.js','src/data/heroine_circle.js','src/whois3d.js','src/aa614_3d.js']){ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); } }
    for(const term of ['Y1S2','Y2S1']){ const w=LADDER.byTerm[term][PS].greet.when.find(q=>q.t===X);
      check('8. '+term+' 溫州街帶小孩過馬路那一則（新句）：aa614 載入時照舊改到週三 20:50～21:10（課輔班搬到週三晚上，條件跟著新句子走）',!!w&&J(w.weekday)===J([3])&&Math.abs(w.time[0]-(20+50/60))<1e-9&&Math.abs(w.time[1]-(21+10/60))<1e-9&&J(w.location)===J(['wenzhou']),J(w)); }
    if(typeof GREET_CLASSDAY!=='undefined'){ const have=new Set(); for(const t in LADDER.byTerm){ const p=LADDER.byTerm[t][PS]; if(!p||!p.greet) continue; p.greet.base.forEach(x=>have.add(x)); p.greet.when.forEach(w=>have.add(w.t)); }
      const lost=(GREET_CLASSDAY.classDay[PS]||[]).filter(t=>!have.has(t));
      check('8. 只在上課日說的招呼（greet_classday.js classDay）：她的每一句都還對得到 ladder.js 的招呼（重寫的句子有跟著換，不會假日也說「今天上…」）',lost.length===0,J(lost)); } });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

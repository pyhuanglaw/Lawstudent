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
  {f:'AA_753_peishan_ladder_Y1S2_Y2S1.json',sha:'b59a8f9de',terms:{Y1S2:['full',['我在客運上背了一路，才背到第三章。']],Y2S1:['full',['我背到第三章，還有四章。']]}},
  {f:'AA_753_peishan_ladder_Y3.json',sha:'3f6c7d3bb9'/* （CANON-NO-ECON-1112 第四批：照 AA_899 換字）*/,terms:{Y3S1:['base',['你吃早餐了嗎？……我家開早餐店，習慣問。']],Y3S2:['base',['期中。我的考卷上，畫了一個笑臉。……我自己畫的。','你吃早餐了嗎？']]}},
  {f:'AA_753_peishan_ladder_Y4.json',sha:'8d3bec48be'/* 2026-11-13（AA_944 第 3 節，BB_456 照用）：大四上招呼「今天上特教…」換字。舊：3f6c7d3bb9 */,terms:{Y4S1:['base',[]],Y4S2:['base',[]]},skipIf:{'P8-L2':{events:['ev_peishan_open_class']}}},
];
const LINESIF=['P2-L3','P3-L3','P3-L4','P3-L6','P3-L8'];
const X_CROSS='（她帶著一排小孩過馬路，對你點頭）等一下！我在上班！', X_BACK='我剛從課輔班回來。你看我的手，都是紅筆。';
const BB326={Y1S2:{[X_CROSS]:{location:['wenzhou'],weekday:[3],time:[18,21]}},Y2S1:{[X_CROSS]:{location:['wenzhou'],weekday:[3],time:[18,21]},[X_BACK]:{weekday:[3],time:[21,22.5]}}};
const AA763={Y3S1:{'期中。我們系要考試。……我現在知道出題的人在想什麼了。':'期中。我們系要考試，我現在知道出題的人在想什麼了。'},Y3S2:{'早。……老師要比學生早到，我在練習。':'早。老師要比學生早到，我在練習，目前成功率一半。'},
  Y4S1:{'期末。寒假我要回家裡的早餐店煎蛋。':'期末了。寒假我要回台中，我爸已經排好要我去店裡站櫃檯。','早。我八點的課，七點就到了。':'早。我八點的課，今天居然趕上了。','嗨！……我剛從課輔班回來。':'嗨！我剛從課輔班回來。'},
  Y4S2:{'嗨！……我剛從課輔班回來。手上還有粉筆灰。':'嗨！我剛從課輔班回來，手上還有粉筆灰。','我的公開課快到了。……晚上都在對著鏡子講。':'我的公開課快到了，我晚上都在對著鏡子講，鏡子都聽膩了。',
    '早。我八點的課，七點就到了。':'早。八點的課我還是修了，不要問我為什麼。'}};   /* 2026-11-11（X327 沛珊重寫；AA 回覆 LAWWW）：大四下那一則同字的早上招呼也換字（AA_763 只列了大四上那一則；字是 AA 給的，tools/ladder/import_ladder.py 的 PS_Y4S2_GREET）——只換字、條件不動 */
/* 2026-11-11（X327 沛珊重寫，AA 補稿 b59a8f9de）：AA_753_peishan_ladder_Y1S2_Y2S1.json 改認 b59a8f9de（和 c5094495d 只差 P2-L3 主句第一句「一個禮拜兩天。」→「每個禮拜三。」）；
   五套 linesIf 照 AA_753_peishan_ladder_linesIf.json@b59a8f9de（原本第 4 節驗的是「舊的兩句照舊留著、帶重寫以前的選項」，AA 補稿以後改成逐字對稿）*/
const LI_F='AA_753_peishan_ladder_linesIf.json', LI_SHA='3f6c7d3bb9'/* （CANON-NO-ECON-1112 第四批：照 AA_899 換字）*/, LI=(()=>{ const raw=show(LI_SHA,'docs/story_planning/'+LI_F); return raw?JSON.parse(raw):null; })();
const str=x=>typeof x==='string'?x:(x&&x.narr)||null;
const cond=q=>{ const o={}; for(const k in q) if(k!=='t'&&k!=='note') o[k]=q[k]; return o; };
for(const F of FILES){ const raw=show(F.sha,'docs/story_planning/'+F.f); F.A=raw?JSON.parse(raw):null; }
const LADDER=require('./aa959_map.js').unmapDeep(require('vm').runInThisContext('LADDER'),'ladder.js');   /* AA_959（DLG-FULL-REVIEW-1110）：匯入最後一步照覆寫表換的字先換回來（分人），再逐字對沛珊的稿 */
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
        /* 2026-11-11（BB_326 第 4 節，企劃線 8abb761bd；BB 定、LAWWW 同意）：課輔班兩句招呼的出現條件改了（BB326）；2026-11-11（X327 沛珊重寫，AA_763_peishan_misc3.json@62460ea75）：大三上～大四下 when 七句只換字（AA763，條件不動）——其他照舊和重寫以前一樣 */
        const wantC=keep.map((w,i)=>(BB326[term]||{})[P.greet.when[i]&&P.greet.when[i].t]||cond(w)), wantT=keep.map(w=>(AA763[term]||{})[w.t]||w.t);
        check('3. '+term+' 招呼 when：條件（時間、地點、星期、週次、天氣）和重寫以前一樣，只少拿掉的那 '+drop.length+' 則'+(BB326[term]?'、課輔班那 '+Object.keys(BB326[term]).length+' 則照 BB_326 第 4 節':'')+(mode==='base'?'；句子不動'+(AA763[term]?'（只有 AA_763'+(term==='Y4S2'?'＋AA 回覆的一句':'')+'共 '+Object.keys(AA763[term]).length+' 句換字）':''):''),J(P.greet.when.map(cond))===J(wantC)&&O.greet.when.length-keep.length===drop.length&&(mode!=='base'||J(P.greet.when.map(w=>w.t))===J(wantT)),J(P.greet.when.map(cond))); } } });

  await sec(4,async()=>{ const have=LINESIF.filter(id=>stepOf(id));
    for(const id of have){ const s=stepOf(id), O=OLD&&(()=>{ for(const t in OLD.byTerm){ const p=OLD.byTerm[t][PS]; const x=p&&p.steps.find(q=>q.id===id); if(x) return x; } return null; })();
      check('4. '+id+'：linesIf 剛好一套、自己帶選項，新格式 {t, re, fx}（沒有 reply、沒有選項自己的 rel）、兩句',Array.isArray(s.linesIf)&&s.linesIf.length===1&&Array.isArray(s.linesIf[0].choices)&&s.linesIf[0].choices.length>=2&&s.linesIf[0].lines.length===2&&s.linesIf[0].choices.every(c=>c.reply===undefined&&c.rel===undefined&&Array.isArray(c.re)&&c.re.length&&c.re.every(x=>typeof x==='string'&&x.trim())&&c.fx&&Object.keys(c.fx).every(k=>k==='fr'||k==='love')));
      if(O) check('4. '+id+'：linesIf 的條件（和其他欄位）和重寫以前一樣，只換兩句和選項',J(cond(Object.assign({},s.linesIf[0],{choices:undefined,lines:undefined})))===J(cond(Object.assign({},O.linesIf[0],{lines:undefined})))&&J(s.linesIf[0].lines)!==J(O.linesIf[0].lines));
      const a=LI&&LI[id]; if(a) check('4. '+id+'：linesIf 那一套的條件、兩句、每個選項的字／回答／fx 一字照稿（'+LI_F+'@'+LI_SHA+'）',J(s.linesIf[0].if)===J(a.if)&&J(s.linesIf[0].lines)===J(a.lines)&&s.linesIf[0].choices.length===a.choices.length&&a.choices.every((c,k)=>s.linesIf[0].choices[k].t===c.t&&J(s.linesIf[0].choices[k].re)===J(c.re.map(str))&&J(s.linesIf[0].choices[k].fx||null)===J(c.fx||null)),J(s.linesIf[0])); }
    { const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(x=>x.path==='docs/story_planning/'+LI_F), tool=fs.readFileSync(path.join(H.ROOT,'tools/ladder/import_ladder.py'),'utf8');
      check('4. 白名單一筆 '+LI_F+'、sha '+LI_SHA+'、approved；工具寫死只認這一版；ladder.js 的來源有它',allow.length===1&&allow[0].sha===LI_SHA&&allow[0].status==='approved'&&tool.includes("PS753_LINESIF_FILE = ('"+LI_F+"', '"+LI_SHA+"')")&&String(LADDER.source).includes(LI_F.replace('.json','')+'@'+LI_SHA));
      if(LI){ check('4. 稿剛好這五層（P2-L3、P3-L3、P3-L4、P3-L6、P3-L8）',J(Object.keys(LI).filter(k=>k[0]!=='_').sort())===J(LINESIF.slice().sort()));
        const fx=LI['P2-L3'].mainLineFix, s=stepOf('P2-L3'); check('4. P2-L3 主句第一句更正：「'+fx.new+'」（不是「'+fx.old+'」）；第二句不動',s.lines[0]===fx.new&&s.lines[0]==='我在溫州街的課輔班帶小朋友，每個禮拜三。'&&!J(s.lines).includes('一個禮拜兩天'),J(s.lines)); }
      const old=['上次你在溫州街看到的那班，有一個小孩問我你是誰。','教授問問題的時候，我舉手了。……手在抖。','……跟我想的一模一樣。說完我回房間睡了一整個下午。','……我在拼另一份。重考的。','……期末前最後一次讀書會，你可以來嗎？那是我最後一次。','「妳舉手了嗎？」','……還沒！不要一直問！'];
      const all=J(LINESIF.map(id=>stepOf(id))); check('4. 五套 linesIf 重寫以前的句子、舊選項都不在了',old.every(t=>!all.includes(J(t).slice(1,-1))),J(old.filter(t=>all.includes(J(t).slice(1,-1))))); }
    if(stepOf('P3-L3')){ const s=stepOf('P3-L3');
      await play('P3-L3',0); const n1=H.said.map(x=>x.t), c1=CH[0];
      check('4. P3-L3 沒聽過「我要重考」：演新的兩句、新的兩個選項',J(n1.slice(0,2))===J(s.lines)&&J(c1)===J(s.choices.map(c=>c.t)),J([n1,c1]));
      await play('P3-L3',1,G=>{ G.events=G.events||{}; G.events.done=G.events.done||{}; G.events.done.ev_peishan_decision=true; }); const n2=H.said.map(x=>x.t), c2=CH[0];
      check('4. P3-L3 聽過「我要重考」（ev_peishan_decision）：演 linesIf 那兩句＋它自己帶的選項和回覆（選②「答對了嗎？」→「答錯了！」「可是教授說錯得很有意思，我當作是稱讚。」；不會接到一般版的選項）',J(n2.slice(0,2))===J(s.linesIf[0].lines)&&J(c2)===J(s.linesIf[0].choices.map(c=>c.t))&&J(n2.slice(-2))===J(s.linesIf[0].choices[1].re)&&J(c2)===J(['「那堂課妳是認真的。」','「答對了嗎？」'])&&J(n2.slice(-2))===J(['答錯了！','可是教授說錯得很有意思，我當作是稱讚。']),J([n2,c2])); }
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
    const WANT_LAB={PS2_SIX_PLATES:'寒假看了三部動畫，邊看邊做筆記',PS5_BOOK_COVER:'她說課輔班做過了，想試試看站櫃台',PS5_EARLY_RISER:'老師要比學生早到，她在練習早起',PS6_WALL:'她爸把她新的學生證影本貼在辦公室',PS6_NO_WEIRD:'第一次被叫上台示範，她讓全班都安靜了',PS7_MOM_WAITS:'她媽說公開課那天要把事情都排開',PS7_MY_EGGS:'寒假她去國小代課兩個禮拜，第一次自己帶一整天'};
    const bad=Object.keys(WANT_LAB).filter(k=>lab(k)!==WANT_LAB[k]);
    check('6. 關係面板的字照新句：'+Object.keys(WANT_LAB).map(k=>k+'「'+WANT_LAB[k]+'」').join('、'),bad.length===0,J(bad.map(k=>[k,lab(k)])));
    const all=[]; for(const F of FILES) for(const term of Object.keys(F.terms)) for(const s of LADDER.byTerm[term][PS].steps){ if(s.mem) all.push(s.mem); for(const c of s.choices) if(c.mem) all.push(c.mem); }
    check('6. 這幾個學期每個記憶都有面板字（不會露出英文代號）、面板字沒有「早餐店」「端六盤」',all.every(k=>typeof lab(k)==='string'&&lab(k).trim())&&!all.some(k=>/早餐店|端六盤|煎蛋|包書套最快/.test(lab(k)||'')),J(all.filter(k=>!lab(k)||/早餐店|端六盤|煎蛋|包書套最快/.test(lab(k))).map(k=>[k,lab(k)]))); });

  await sec(7,async()=>{ for(const F of FILES) for(const term of Object.keys(F.terms)){ const P=LADDER.byTerm[term][PS];
      const cur=J({s:P.steps.map(s=>[s.lines,s.choices]),b:P.greet.base});   /* linesIf（等 AA 補）和沒動的 when 不算 */
      const old=['早餐店','端六盤','一次端','客運','煎蛋','蛋餅','想太多','奇怪的問題','顧店','家傳'].filter(t=>cur.includes(t));
      check('7. '+term+'：她的八層、招呼 base 裡沒有重寫前的字（早餐店、端盤子、客運、煎蛋、「想太多」、顧店）',old.length===0,J(old)); }
    if(stepOf('P2-L4')){ const G=H.fresh('2026-04-20',14,'campus',null); H.rel(PS,30,10,5); G.social.ladder=G.social.ladder||{}; const D=STORY.ladData(G,PS);
      const k=D&&D.key, n=k?(G.social.ladder[k]|0):null; if(k&&k!==PS+':Y1S2'){ G.social.ladder[k]=3; }
      const nx=STORY.ladNext?STORY.ladNext(G,PS):null;
      check('7. 舊存檔（大一下聊到第 3 層）：下一層照接 P2-L4（層數的存法沒有動；key '+k+'）',!!D&&(!STORY.ladNext||(!!nx&&nx.id==='P2-L4')),J([k,n,nx&&nx.id])); } });

  await sec(8,async()=>{ const X='（她帶著一排小孩過馬路，對你點頭）等一下！我在上班！';
    /* aa614_3d.js 不在 pg_harness 的載入清單：照 tests/aa614_jobs_unit.js 的方式載入（它載入時改 LADDER） */
    { const vm=require('vm'); for(const f of ['src/data/shop_npc.js','src/data/heroine_circle.js','src/whois3d.js','src/aa614_3d.js']){ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); } }
    for(const term of ['Y1S2','Y2S1']){ const w=LADDER.byTerm[term][PS].greet.when.find(q=>q.t===X);
      /* 2026-11-11（BB_326 第 4 節，企劃線 8abb761bd；BB 定、LAWWW 同意）：出現條件＝溫州街、週三 18:00～21:00（ladder.js 的資料）；aa614_3d.js 載入以後也還是這一組（不再搬到 20:50～21:10）。實際在那個時間出不出得來在 tests/peishan_misc3_1111_unit.js */
      check('8. '+term+' 溫州街帶小孩過馬路那一則（新句）：溫州街、週三 18:00～21:00（BB_326 第 4 節）；載入 aa614_3d.js 以後條件沒有被改掉',!!w&&J(w.weekday)===J([3])&&J(w.time)===J([18,21])&&J(w.location)===J(['wenzhou']),J(w)); }
    if(typeof GREET_CLASSDAY!=='undefined'){ const have=new Set(); for(const t in LADDER.byTerm){ const p=LADDER.byTerm[t][PS]; if(!p||!p.greet) continue; p.greet.base.forEach(x=>have.add(x)); p.greet.when.forEach(w=>have.add(w.t)); }
      const lost=(GREET_CLASSDAY.classDay[PS]||[]).filter(t=>!have.has(t));
      check('8. 只在上課日說的招呼（greet_classday.js classDay）：她的每一句都還對得到 ladder.js 的招呼（重寫的句子有跟著換，不會假日也說「今天上…」）',lost.length===0,J(lost)); } });
  /* 9 大四下 4/14 公開課那一場（AA_753_peishan_ladder_Y4 的 event_open_class）：媽媽的旁白＋四句照稿；BCG-05 先不放；P8-L2 演過那一場就跳過 */
  await sec(9,async()=>{ const A=FILES[2].A, src=fs.readFileSync(path.join(H.ROOT,'src/data/r2y4b_events.js'),'utf8'), adv=fs.readFileSync(path.join(H.ROOT,'src/adv3d.js'),'utf8');
    const i0=src.indexOf("id:'ev_peishan_open_class'"), ev=src.slice(i0,src.indexOf("consequences:",i0));
    if(A){ const R=A.event_open_class.replace, miss=R.filter(r=>ev.split("text:'"+r.new+"'").length!==2), left=R.filter(r=>r.old!==r.new&&ev.includes(r.old));
      /* 2026-11-11（AA_810@333cd2863，公開課媽媽定在門外）：選項、沛珊回的那句、沒去那晚的私訊換新句。舊期望：「妳媽媽坐最後一排。」「……我知道。我一進教室就看到了。」「媽媽來了。她坐最後一排。……就是我叫你坐的那個位子。」 */
    check('9. ev_peishan_open_class：稿上五列的 new 各剛好一句（媽媽出場的旁白＋她的四句），old 都不在了',R.length===5&&miss.length===0&&left.length===0,J([miss.map(r=>r.new),left.map(r=>r.old)])); }
    check('9. ev_peishan_open_class：沒有「早餐店」「榜單」；沛珊的句子和選項照舊（「你真的來了！！」、兩個選項、送到高鐵站）',i0>0&&!/早餐店|榜單/.test(ev.replace(/\/\*[\s\S]*?\*\//g,''))&&ev.includes("text:'你真的來了！！'")&&ev.includes("{text:'「沒有。」',goto:'a'},{text:'「妳媽媽在門外面。」',goto:'b'}")&&ev.includes('謝謝你來看我上課！到臺北傳給我喔。'));
    const m=/^const CG_REGISTRY=(\{.*\});$/m.exec(adv), REG=m?eval('('+m[1]+')'):null, h=/^const CG_HELD=(\{.*\});$/m.exec(adv), HELD=h?eval('('+h[1]+')'):null;
    check('9. BCG-05（cg_whiteboard_why_peishan）：新圖到以前不放——不在 CG_REGISTRY（事件那一行 hasCG 守門照留＝不顯示）、資料留在 CG_HELD、圖檔沒有刪',!!REG&&!REG.cg_whiteboard_why_peishan&&!!HELD&&!!HELD.cg_whiteboard_why_peishan&&fs.existsSync(path.join(H.ROOT,HELD.cg_whiteboard_why_peishan.file))&&ev.includes("{if:{custom:()=>hasCG('cg_whiteboard_why_peishan')},cg:'cg_whiteboard_why_peishan'}"));
    const s=stepOf('P8-L2'); const next=(done)=>{ const G=H.fresh('2029-03-05',14,'campus',null); H.rel(PS,65,50,45); if(done){ G.events=G.events||{}; G.events.done=G.events.done||{}; G.events.done.ev_peishan_open_class=true; } const D=STORY.ladData(G,PS); if(D) (G.social.ladder||(G.social.ladder={}))[D.key]=1; const nx=STORY.ladNext?STORY.ladNext(G,PS,'date'):null; return [D&&D.key,nx&&nx.id]; };   /* 大四她在台南：context date＝私下約的那天才推進（mode 'date'）*/
    const a=next(false), b=next(true);
    check('9. P8-L2（要排公開課，我舉手了）：skipIf ev_peishan_open_class、skipAfterWeek 8 照留；那一場演過＝這一層跳過（下一層 P8-L3 以後），沒演過照出 P8-L2',J(s.skipIf)===J({events:['ev_peishan_open_class']})&&s.skipAfterWeek===8&&(!STORY.ladNext||(a[1]==='P8-L2'&&b[1]!=='P8-L2')),J([a,b])); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

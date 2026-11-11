// 沛珊大一上的閒聊階梯重寫（PEISHAN-VOICE-1110；使用者 X327「有趣、聰明、會接梗」；AA_753@33a1769f8）——不需要瀏覽器（D131）。
// tools/ladder/import_ladder.py 把 AA_753_peishan_ladder_Y1S1.json 疊在 ladder_bb.json 的 classmate_peishan 上 → src/data/ladder.js。
//   1. 白名單只認 33a1769f8；ladder.js 的來源有寫
//   2. P-L1～P-L8：id、if／skipIf／week、順序、rel、整層的 mem 不動；lines、choices（{t, re, fx, mem?}）一字照稿；mem：P-L2 整層 PS_FAMILY_SHOP、P-L3 選項一 PS_NOTES_SHARED、P-L7 選項一 PS_REASSURED
//   3. 招呼（base、when）照稿，條件不動
//   4. 演一次：回答的旁白（整句括號）當旁白演、{name}同學 換成玩家的名字、選項的 fx 有加、記憶有記
//   5. 關係面板的字：PS_FAMILY_SHOP「家裡在台中開餐廳」、PS_REASSURED「你說：三行課本有，那兩頁只有妳有」（AA 2026-11-11）
//   6. 大一上她的階梯、招呼裡沒有重寫前的句子；舊存檔（已經聊到第 N 層、記過 PS_FAMILY_SHOP）照接
// 修改前（任務 B 的 commit）：第 1～5 節 FAIL。用法：node tests/peishan_ladder_1110_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const SHA='33a1769f8', PS='classmate_peishan';
let A=null; try{ A=JSON.parse(cp.execFileSync('git',['show',SHA+':docs/story_planning/AA_753_peishan_ladder_Y1S1.json'],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<26})); }catch(e){ A=null; }
const P=LADDER.characters[PS], ST=P.steps;
const str=x=>typeof x==='string'?x:(x&&x.narr)||null;
let WANT=[], CH=[];
GM.choose=async o=>{ const T=o.map(q=>q.t||q.text); CH.push(T); const w=WANT.shift(); const k=typeof w==='number'?w:T.indexOf(w); return k>=0?k:0; };
const who={name:'沛珊',charId:PS};
const play=async(sid,pick)=>{ const G=H.fresh('2025-10-20',14,'campus',null); H.rel(PS,65,50,45); INV.addContact&&INV.addContact(G,PS); H.said=[]; CH=[]; WANT=[pick]; const r0=Object.assign({},SOCIAL.rel(PS)); await STORY.ladPlay(GM,who,PS,ST.find(s=>s.id===sid)); return {G,r0,r1:SOCIAL.rel(PS)}; };

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_753_peishan_ladder_Y1S1/.test(e.path));   /* 2026-11-11：AA_753 其他學期的三份另外各一筆（tests/peishan_ladder_1111_unit.js），這裡只數大一上那一筆 */
    check('1. 白名單一筆 AA_753、sha '+SHA+'、approved；工具寫死只認這一版',allow.length===1&&allow[0].sha===SHA&&allow[0].status==='approved'&&fs.readFileSync(path.join(H.ROOT,'tools/ladder/import_ladder.py'),'utf8').includes("PS753_SHA = '"+SHA+"'"));
    check('1. ladder.js 的來源有 AA_753@'+SHA,String(LADDER.source).includes('AA_753@'+SHA),String(LADDER.source).slice(-90));
    check('1. 讀得到企劃線 '+SHA+' 的 AA_753（讀不到＝後面的逐字比對做不了）',!!A); });

  await sec(2,async()=>{ const ids=ST.map(s=>s.id);
    check('2. 八層、順序 P-L1～P-L8',J(ids)===J([1,2,3,4,5,6,7,8].map(i=>'P-L'+i)));
    check('2. 條件不動：階段（ACQUAINTANCE×3、FAMILIAR×4、FRIEND）、P-L3 的讀書會條件和 skipIf、P-L6 第 4 週起',J(ST.map(s=>s.if.stage.min))===J(['ACQUAINTANCE','ACQUAINTANCE','ACQUAINTANCE','FAMILIAR','FAMILIAR','FAMILIAR','FAMILIAR','FRIEND'])&&ST.every(s=>s.if.stage.npc===PS)
      &&J(ST[2].if.events)===J(['ev_public_law_group'])&&J(ST[2].if.memory)===J([{npc:PS,tag:'FIRST_MET'}])&&J(ST[2].skipIf)===J({stage:{npc:PS,min:'FAMILIAR'},notEvents:['ev_public_law_group']})&&J(ST[5].week)===J([4,18])&&ST.every((s,i)=>i===5||s.week===undefined));
    check('2. rel 不動',J(ST.map(s=>s.rel))===J([{fam:2},{fam:2},{fam:3},{fam:2,trust:2},{fam:2,comf:2},{fam:2},{fam:2,trust:2},{fam:2,comf:3}]),J(ST.map(s=>s.rel)));
    check('2. 記憶：P-L2 整層 PS_FAMILY_SHOP（照舊）、P-L3 選項一 PS_NOTES_SHARED、P-L7 選項一 PS_REASSURED；其他沒有',J(ST.map(s=>s.mem||null))===J([null,'PS_FAMILY_SHOP',null,null,null,null,null,null])&&J(ST.map(s=>s.choices.map(c=>c.mem||null)))===J([[null,null],[null,null],['PS_NOTES_SHARED',null],[null,null],[null,null],[null,null],['PS_REASSURED',null],[null,null]]));
    if(!A){ check('2. lines、choices 照稿',false,'讀不到稿'); return; }
    const bad=[]; A.steps.forEach((a,i)=>{ const s=ST[i]; if(J(s.lines)!==J(a.lines)||s.choices.length!==a.choices.length||!a.choices.every((c,k)=>s.choices[k].t===c.t&&J(s.choices[k].re)===J(c.re.map(str))&&J(s.choices[k].fx||null)===J(c.fx||null)&&(s.choices[k].mem||null)===(c.mem||null))) bad.push(a.id); });
    check('2. 八層的 lines、每個選項的字／回答／fx／mem 一字照稿（回答裡的 {narr} 寫成整句括號的字串）',bad.length===0,J(bad));
    check('2. 選項用新格式 {t, re, fx}：沒有舊的 reply；每層兩個選項；沒有留舊的 note、linesIf、extraIf',ST.every(s=>s.choices.length===2&&s.choices.every(c=>c.reply===undefined&&Array.isArray(c.re)&&c.re.every(x=>typeof x==='string'))&&s.note===undefined&&!s.linesIf&&!s.extraIf)); });

  await sec(3,async()=>{ if(!A){ check('3. 招呼照稿',false,'讀不到稿'); return; }
    check('3. 招呼 base 五句、when 三句照稿；when 的條件（06～09、圖書館、週五 17～24）不動',J(P.greet.base)===J(A.greet.base)&&J(P.greet.when)===J(A.greet.when)&&J(P.greet.when.map(w=>[w.time||null,w.location||null,w.weekday||null]))===J([[[6,9],null,null],[null,['library'],null],[[17,24],null,[5]]]),J(P.greet)); });

  await sec(4,async()=>{ const s3=ST[2].choices[1], s8=ST[7].choices[0];
    await play('P-L3',1); const n=H.said.find(x=>x.t==='（她湊過來看。）');
    check('4. P-L3 選項二：回答中間的「（她湊過來看。）」當旁白演（沒有說話的人），前後兩句是她說的',!!n&&n.who===null&&H.said.filter(x=>x.who==='沛珊').map(x=>x.t).includes('你怎麼抄得到！')&&H.said[H.said.length-1].t===s3.re[2]&&H.said[H.said.length-1].who==='沛珊',J(H.said.slice(-3)));
    const r=await play('P-L8',0);
    check('4. P-L8 選項一「{name}同學，你很敢問。」＝玩家的名字（遊戲裡 GM.say 換；這裡「祐廷同學，你很敢問。」）',s8.re[0]==='{name}同學，你很敢問。'&&H.said.some(x=>x.t==='祐廷同學，你很敢問。')&&!H.said.some(x=>/\{name\}/.test(x.t)),J(H.said.slice(-2)));
    check('4. P-L8 選項一的 fx（fr 2、love 1）有加；整層的 rel 照舊加',(r.r1.npcRom||0)-(r.r0.npcRom||0)===1&&r.r1.fam>=r.r0.fam&&r.r1.comf>=r.r0.comf,J([r.r0,r.r1]));
    await play('P-L7',0); const m7=SOCIAL.has(PS,'PS_REASSURED'); await play('P-L7',1); const m7b=SOCIAL.has(PS,'PS_REASSURED');
    check('4. P-L7 選項一「三行課本有。那兩頁只有妳有。」記 PS_REASSURED；選項二不記',m7===true&&m7b===false);
    await play('P-L2',0); const m2=SOCIAL.has(PS,'PS_FAMILY_SHOP'); await play('P-L3',0); const m3=SOCIAL.has(PS,'PS_NOTES_SHARED');
    check('4. P-L2 聊完記 PS_FAMILY_SHOP（照舊）；P-L3 選項一記 PS_NOTES_SHARED',m2===true&&m3===true);
    check('4. 每層演出來：她的兩句 → 兩個選項 → 回答',CH.length===1&&CH[0].length===2&&H.said[0].t===ST[2].lines[0]); });

  await sec(5,async()=>{ const src=fs.readFileSync(path.join(H.ROOT,'src/social3d.js'),'utf8');
    check('5. 關係面板：PS_FAMILY_SHOP「家裡在台中開餐廳」、PS_REASSURED「你說：三行課本有，那兩頁只有妳有」（AA 2026-11-11 給的句子）；PS_NOTES_SHARED 照舊「和她把筆記拼成一整份」',src.includes("PS_FAMILY_SHOP:'家裡在台中開餐廳'")&&src.includes("PS_REASSURED:'你說：三行課本有，那兩頁只有妳有'")&&src.includes("PS_NOTES_SHARED:'和她把筆記拼成一整份'"));
    check('5. 面板字沒有留「早餐店」「條文課本都有，故事沒有」（註解以外）',!/早餐店|條文課本都有/.test(src.replace(/\/\*[\s\S]*?\*\//g,'').split('\n').filter(l=>/PS_FAMILY_SHOP|PS_REASSURED/.test(l)).join('\n'))); });

  await sec(3,async()=>{ const D=k=>STORY.dayOfKey(k), greet=k=>{ const G=H.fresh(k,18,'library',{introDone:true,classDone:true,afternoonDone:true}); H.rel(PS,30,10,5); const out=[]; for(let i=0;i<5;i++){ const t=STORY.ladGreet(G,PS); if(t) out.push(t); } return out; };
    const g1=greet('2025-09-19'), g2=greet('2025-09-26');
    check('3. 週五傍晚「我要回台中了，下禮拜見！」只在單數週說的條件照舊（AA_372 第 8 項：9/19 第 3 週說、9/26 第 4 週不說）',g1.includes('我要回台中了，下禮拜見！')&&!g2.includes('我要回台中了，下禮拜見！'),J([g1,g2])); });

  await sec(6,async()=>{ const all=J(P);
    const old=['可以問你一件事嗎','問你一件事喔','問題很多','奇怪的問題','早餐店','搭客運','四點半起來幫忙','想太多'].filter(t=>all.includes(t));
    check('6. 大一上她的階梯、招呼裡沒有重寫前的句子（「可以問你一件事嗎」「問你一件事喔」「我問題很多」、早餐店、搭客運）',old.length===0,J(old));
    /* 舊存檔：已經聊到第 3 層、記過 PS_FAMILY_SHOP（舊版 P-L2）——下一層照接 P-L4，記憶照留 */
    const G=H.fresh('2025-11-10',14,'campus',null); H.rel(PS,30,10,5); SOCIAL.remember(PS,'PS_FAMILY_SHOP','P-L2'); (G.social.ladder||(G.social.ladder={}))[PS]=3;
    const nx=STORY.ladNext?STORY.ladNext(G,PS):null;
    check('6. 舊存檔（聊到第 3 層、記過 PS_FAMILY_SHOP）：層數、記憶照留，下一層是 P-L4（存檔格式沒有動）',SOCIAL.has(PS,'PS_FAMILY_SHOP')&&G.social.ladder[PS]===3&&(!STORY.ladNext||(!!nx&&nx.id==='P-L4')),J(nx&&nx.id)); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

// 閒聊（story3d.js 的 S.smallTalk）——不需要瀏覽器。2026-10-13 使用者試玩回報：
//   洪珮瑜（不太熟的同學）一直重複「喜歡聽 podcast」；高子晴第一次在校園聊天就說「期末成發你要來。」（那時候還不熟，也還沒去吉他社）。
// 檢查（第一版）：一天只聊一句新的、同一天再找是打招呼；熟的人輪流不重複（說完一輪才重來、不會連續兩次同一句）。
// 檢查（AA_120，2026-10-13 晚）：
//   - 不熟的同學（B 層，AA_120 7-2 定稿）：三句各只說一次、第 3 句要說過心事；說完只點頭或短招呼（開學、期中、期末，同學期同一句一次）；換學期不從頭重播。
//   - 每一句的條件：子晴三句（學過和弦／去過吉他社／熟了＋大一下、大二下第 10～13 週）、地點（豆子在 Café、宿舍網路在宿舍）、
//     時間（宥辰早上）、週次（芷若期中前後）、一次（芯慈的筆記）、每學期一次（方奕廷溪頭）、unless。
//   - 舊存檔沒有 G.social.small 照常。
// 修改前：沒有 S.smallTalk（第 1 項就失敗）；第二版之前，B 層的心事會被當閒聊講、洪珮瑜兩件事一直輪流。
// 用法：node tests/smalltalk_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
for(const f of ['src/data/characters.js','src/data/events.js','src/data/calendar.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|CALENDAR)\s*=/mg,'global.$1='),{filename:f});
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8').replace(/^const STORY\s*=/m,'global.STORY='),{filename:'src/story3d.js'});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
// 條件：照 EVENTS.cond 的寫法做一個小的（events、notEvents、memory、stage、flags、notFlags、energy）
const DONE={}, MEM={}, STAGE={}, ORDER=['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE'];
global.EVENTS={cond:c=>{ if(!c) return true; const G=GG;
  if(c.events&&!c.events.every(e=>DONE[e])) return false; if(c.notEvents&&c.notEvents.some(e=>DONE[e])) return false;
  if(c.memory&&!c.memory.every(m=>MEM[m.npc+':'+m.tag])) return false;
  if(c.stage&&ORDER.indexOf(STAGE[c.stage.npc]||'STRANGER')<ORDER.indexOf(c.stage.min)) return false;
  if(c.flags&&!c.flags.every(f=>G.flags[f])) return false; if(c.notFlags&&c.notFlags.some(f=>G.flags[f])) return false;
  if(c.energy&&(G.energy<(c.energy.min||0)||G.energy>(c.energy.max===undefined?100:c.energy.max))) return false;
  if(c.lateNight!==undefined&&!!(G.daily&&G.daily.lateNight===G.day)!==!!c.lateNight) return false; return true; }};   /* 和 events3d.js 的 cond 一樣（AA-B 10-16：「累」改看前一晚幾點睡）*/
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&(CHARACTERS[id].nickname||CHARACTERS[id].name))||id};
check('有 STORY.smallTalk',typeof STORY.smallTalk==='function');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const W=dayOf('2025-10-01');   // 大一上第 5 週週三
let GG={day:W,hour:15,zone:'campus',weekday:3,energy:70,social:{rel:{},mem:{}},flags:{}}; const G=GG;
const talk=id=>STORY.smallTalk(G,id), txt=L=>L.say||L.narr;
// ---------- 不熟的同學（洪珮瑜，pool_9；AA_120 7-2 定稿：三句各只說一次、第 3 句要說過心事、說完只點頭或短招呼、換學期不從頭重播）----------
{ const id=Object.keys(CHARACTERS).find(k=>CHARACTERS[k].name==='洪珮瑜'); const L9=SMALLTALK[id].map(e=>e.t); const out=[]; for(let d=0;d<4;d++){ G.day=W+d; out.push(talk(id)); out.push(talk(id)); }
  check('洪珮瑜：一天只聊一句新的，同一天再找他是打招呼（旁白）',out.every((L,i)=>i%2===0||(!L.fresh&&/打了個招呼/.test(L.narr))),out.map(txt).slice(0,2).join(' / '));
  check('洪珮瑜：第一天、第二天各說一句她自己的（7-2 的第 1、2 句），不是一直講「喜歡聽 podcast」',out[0].say===L9[0]&&out[2].say===L9[1]&&out[0].fresh&&out[2].fresh,txt(out[0])+' / '+txt(out[2]));
  check('洪珮瑜：還沒說過心事，第 3 句不出現；兩句說完就只點頭（不會把心事「想出國」當閒聊）',[4,6].every(i=>!out[i].fresh&&!out[i].say)&&!out.some(L=>/出國|研究所/.test(txt(L))),[4,6].map(i=>txt(out[i])).join(' / '));
  MEM[id+':SHARED_SECRET']=1; G.day=W+5; const L3=talk(id); check('說過心事以後：第 3 句（只說一次）',L3.say===L9[2]&&L3.fresh,txt(L3));
  G.day=W+6; const L4=talk(id); G.day=W+7; const L5=talk(id); check('三句都說完：只點頭（第 5 週不是開學、期中、期末，沒有短招呼）',!L4.fresh&&!L5.fresh&&!L4.say&&!L5.say,txt(L4)+' / '+txt(L5));
  G.day=dayOf('2026-02-25'); const L=talk(id);
  check('新的學期（大一下）不從頭重播三句：只點頭，或開學的短招呼',!L.fresh&&!L9.includes(L.say||'')&&(/^（.*）$/.test(L.narr||'')||['「開學了。」','「這學期修了什麼？」'].includes(L.say)),txt(L));
  const G2=[]; delete MEM[id+':SHARED_SECRET']; for(let d=0;d<21;d++){ G.day=dayOf('2026-02-23')+d; G2.push(talk(id)); }
  const says=G2.filter(q=>q.say).map(q=>q.say); check('開學三週每天找她：短招呼最多兩句、同一句只說一次，其他天只有旁白',says.length<=2&&new Set(says).size===says.length&&G2.filter(q=>q.narr).length>=19,says.join(' / ')); }
// ---------- 高子晴 ----------
{ const id='heroine_04'; delete G.social.small; const say=[]; for(let d=0;d<3;d++){ G.day=W+10+d; say.push(txt(talk(id))); }
  check('高子晴：還沒去吉他社，不會說「期末成發你要來」「手指好了沒」「阿凱說他昨天又寫到四點」',!say.some(t=>/成發|手指|寫到四點/.test(t)),say.join(' / '));
  DONE.ev_ziqing_club=1; delete G.social.small; const s2=[]; for(let d=0;d<4;d++){ G.day=W+20+d; s2.push(txt(talk(id))); }
  check('去過吉他社、但沒學和弦：只有「阿凱說他昨天又寫到四點。你們那間到底幾點關燈？」（大一版，BB_166 1-3；手指痛要學過和弦，AA_120）',s2.some(t=>/你們那間到底幾點關燈/.test(t))&&!s2.some(t=>/手指|成發/.test(t)),s2.join(' / '));
  MEM['heroine_04:INVITED_CLUB']=1; delete G.social.small; const s3=[]; for(let d=0;d<4;d++){ G.day=W+30+d; s3.push(txt(talk(id))); }
  check('學過和弦、還在大一上：「手指好了沒」只在大一下說（BB_205 第 5 節 term Y1S2）；大一上也不說「期末成發」（成發在大一下、大二下）',!s3.some(t=>/手指/.test(t))&&!s3.some(t=>/成發/.test(t)),s3.join(' / '));
  STAGE.heroine_04='FAMILIAR'; delete G.social.small; const wk11=dayOf('2026-05-06'); const s4=[]; for(let d=0;d<3;d++){ G.day=wk11+d; s4.push(txt(talk(id))); }
  check('熟了＋大一下第 11 週：三句都會輪到（含「期末成發你要來」）',s4.some(t=>/成發/.test(t))&&s4.some(t=>/手指/.test(t))&&s4.some(t=>/寫到四點/.test(t)),s4.join(' / '));
  delete G.social.small; const wk3=dayOf('2026-03-11'); const s5=[]; for(let d=0;d<3;d++){ G.day=wk3+d; s5.push(txt(talk(id))); }
  check('大一下第 3 週：還不到成發前，不說「期末成發」',!s5.some(t=>/成發/.test(t)),s5.join(' / ')); }
{ const id='heroine_04'; let d2=null; for(let d=dayOf('2027-02-01');d<dayOf('2027-07-01');d++){ const T=CALENDAR.termOf(d); if(T&&T.id==='Y2S2'&&T.week===11){ d2=d; break; } }
  delete G.social.small; const s6=[]; for(let k=0;k<3;k++){ G.day=d2+k; s6.push(txt(talk(id))); }
  check('熟了＋大二下第 11 週：大二下的成發（Q9）做了（AA_325 2-Y2-19），「期末成發」加回來；「手指」只在大一下，大二換「你看到他，叫他去睡」（BB_166 1-3）',d2!=null&&s6.some(t=>/成發/.test(t))&&!s6.some(t=>/手指/.test(t))&&s6.some(t=>/叫他去睡/.test(t)),s6.join(' / ')); }
// ---------- 地點、時間、週次 ----------
{ const id='heroine_02'; delete G.social.small; G.zone='campus'; G.day=W; const a=txt(talk(id)); G.day=W+1; const b=txt(talk(id)); G.day=W+2; const c=txt(talk(id));
  check('芷若在校園（第 5 週）：不說「今天的豆子很酸」（在店裡才說）、也不說期中（第 6～9 週）',![a,b,c].some(t=>/豆子|期中/.test(t)),[a,b,c].join(' / '));
  delete G.social.small; G.zone='cafe'; const w7=dayOf('2025-10-22'); const seen=[]; for(let d=0;d<6;d++){ G.day=w7+d; seen.push(txt(talk(id))); }
  check('芷若在 Café、第 7～8 週：三句輪流，不會連續兩天同一句',seen.every((t,i)=>i===0||t!==seen[i-1])&&new Set(seen).size===3,seen.join(' / ')); }
{ const id='classmate_youchen'; delete G.social.small; G.zone='campus'; G.hour=16; const seen=[]; for(let d=0;d<3;d++){ G.day=W+40+d; seen.push(txt(talk(id))); }
  check('宥辰下午：不說「現在幾點？我昨天四點才睡」（早上 8～13 點才說）',!seen.some(t=>/四點才睡/.test(t)),seen.join(' / '));
  delete G.social.small; G.hour=10; G.day=W+50; const m=txt(talk(id)); check('宥辰早上：會說',/四點才睡|放歌/.test(m),m); G.hour=15; }
{ const id='kai'; delete G.social.small; G.zone='campus'; G.flags.classDone=true; const a=[]; for(let d=0;d<3;d++){ G.day=W+60+d; a.push(txt(talk(id))); }
  check('阿凱在校園：不說「宿舍網路又斷了」',!a.some(t=>/宿舍網路/.test(t)),a.join(' / '));
  G.zone='dorm'; delete G.social.small; const b=[]; for(let d=0;d<2;d++){ G.day=W+70+d; b.push(txt(talk(id))); }
  check('阿凱在宿舍：兩句都會說',b.some(t=>/宿舍網路/.test(t))&&b.some(t=>/賣家/.test(t)),b.join(' / ')); G.zone='campus'; }
// ---------- 只剩一句能說：不連續兩天說同一句 ----------
{ const id='kai'; delete G.social.small; G.zone='campus'; const seen=[]; for(let d=0;d<4;d++){ G.day=W+200+d; seen.push(txt(talk(id))); }
  check('阿凱在校園只剩一句能說：不連續兩天說同一句（中間隔一次打招呼）',seen.every((t,i)=>i===0||t!==seen[i-1])&&seen.filter(t=>/賣家/.test(t)).length===2,seen.join(' / ')); }
// ---------- 一次、每學期一次 ----------
{ const id='classmate_xinci'; MEM['classmate_xinci:LENT_NOTES']=1; delete G.social.small; const seen=[]; for(let d=0;d<6;d++){ G.day=W+80+d; seen.push(txt(talk(id))); }
  check('芯慈「筆記我還你了」：借過筆記才說、一輩子只說一次',seen.filter(t=>/筆記我還你了/.test(t)).length===1,seen.join(' / ')); }
{ const id='npc_fangyt'; delete G.social.small; const seen=[]; for(let d=0;d<4;d++){ G.day=W+90+d; seen.push(txt(talk(id))); }
  G.day=dayOf('2026-03-04'); const nx=txt(talk(id));
  check('方奕廷「下週去溪頭」：一學期只說一次；新的學期又可以說；「芷若跟你講過我嗎」在 Z6 之前不說',seen.filter(t=>/溪頭/.test(t)).length===1&&/溪頭/.test(nx)&&!seen.concat([nx]).some(t=>/芷若跟你講過/.test(t)),seen.join(' / ')+' ‖ '+nx); }
// ---------- unless（測試用的人物）----------
{ CHARACTERS.t_unless={id:'t_unless',name:'測試',social_layer:'A'}; SMALLTALK.t_unless=[{t:'A',unless:{flags:['x']}},'B']; delete G.social.small; G.flags.x=true; const seen=[]; for(let d=0;d<3;d++){ G.day=W+100+d; seen.push(txt(talk('t_unless'))); }
  check('unless：條件成立時不說',!seen.includes('A')&&seen.includes('B'),seen.join(' / ')); }
// ---------- 明軒「你看起來很累」：前一晚 01:00 以後才睡（AA-B 10-16，取代體力 ≤40；DL-02）----------
{ const mk=(day,late)=>({day,hour:10,zone:'campus',weekday:CALENDAR.dateOf(day).wd%7,energy:100,social:{rel:{},mem:{}},flags:{},daily:late?{lateNight:day}:{}});
  const TIRED='「你看起來很累。睡飽比較重要。」'; const say=G2=>{ const keep=GG; GG=G2; try{ return txt(STORY.smallTalk(G2,'classmate_mingxuan')); } finally { GG=keep; } };   /* 替身 EVENTS.cond 讀 GG */
  const a=mk(W,false); check('明軒：前一晚正常睡，不說「你看起來很累」',say(a)!==TIRED,say(mk(W,false)));
  const G3=mk(W,true); { const r=say(G3); check('明軒：前一晚 01:00 以後才睡，當天第一次見到他就說「你看起來很累」',r===TIRED,r); }
  G3.day=W+1; G3.weekday=CALENDAR.dateOf(W+1).wd%7; G3.daily.lateNight=W+1; { const r=say(G3); check('明軒：同一週第二次熬夜不再說',r!==TIRED,r); }
  /* 2026-10-28 改：AA_497 4-5（企劃線 7a38216ca）明軒的閒聊「取代兩句撐四年；每句一次」——「你看起來很累。」也只說一次（原本 once:week）；tests/aa497_supporting_unit.js 4-5 */
  G3.day=W+7; G3.daily.lateNight=W+7; G3.weekday=CALENDAR.dateOf(W+7).wd%7; { const r=say(G3); check('明軒：說過以後，下一週熬夜也不再說（AA_497 4-5：每句一次）',r!==TIRED,r); } }
// ---------- 舊存檔 ----------
{ const G2={day:W,hour:15,zone:'campus',weekday:3,energy:70,social:{rel:{},mem:{}},flags:{}}; const L=STORY.smallTalk(G2,'zhe');
  check('舊存檔沒有 G.social.small：照常，記下今天聊過',L.fresh&&G2.social.small&&G2.social.small.zhe&&G2.social.small.zhe.day===W,txt(L)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

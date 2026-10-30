// 麵店長桌閒聊：說話的人要真的在店裡（NDL-PRESENT-1030，使用者 2026-10-30 04:3x：「去阿鳳麵店 出現麵店團的人 對話 但根本沒有在遊戲內出現」，
//   附存檔 day 28 21:30 在麵店）——不需要瀏覽器。
//   以前：只有阿哲有麵店作息（週二、四 17:30～20:30），Alison、柏翰、芯慈從來不在麵店；長桌閒聊 17:00～21:00 只看認不認識，人不在也照樣講。
//   現在：①三位補麵店日長桌作息（和阿哲同一段，寫 terms＝比一般作息優先）；②STORY.ndlHere／ndlHereAll：說話的人（who）都在店裡才演
//         （3D 裡有這個人，或這一刻的作息在麵店）；旁白沒點名的那幾則＝至少一位認識的麵店團在。
//   0 抽得到；1 四位麵店日 18:00 都在；2 20:45 都走了＝不演；3 有人不在＝他說話的那幾則跳過；4 旁白那幾則要至少一位在
// 修改前（postrel-1030 5b48dc350）：第 0 項 FAIL（沒有 ndlHere）。用法：node tests/ndl_present_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
try{ let src=fs.readFileSync(path.join(H.ROOT,'src/data/noodle_table.js'),'utf8'); src=src.replace(/^const (NOODLE_TABLE)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:'noodle_table.js'}); }catch(e){}
global.MREL=global.MREL||{ytShift:()=>true};
const TEAM=['zhe','yu','classmate_bohan','classmate_xinci'];
const meet=(...ids)=>{ for(const id of ids){ SOCIAL.remember(id,'FIRST_MET',''); if(id==='yu') H.G.flags.met_yu=true; } };
const at=(key,hh)=>{ H.fresh(key,hh,'noodle',{afternoonDone:true}); PHONE.join(H.G,'noodle_team','麵店團'); meet(...TEAM,'heroine_03','heroine_01'); return H.G; };
check('0. STORY.ndlHere、STORY.ndlHereAll 存在',typeof STORY.ndlHere==='function'&&typeof STORY.ndlHereAll==='function');
if(typeof STORY.ndlHere!=='function') H.done();
// 作息
{ const bad=[]; for(const id of ['yu','classmate_bohan','classmate_xinci']){ const L=(CHARACTERS[id].daily_schedule||[]).filter(e=>e.zone==='noodle'&&e.ndlDay===true&&e.noExam===true&&e.from===17.5&&e.to===20.5&&Array.isArray(e.terms)&&e.terms.length===8); if(L.length!==1) bad.push(id); }
  check('1. Alison、柏翰、芯慈各有一筆麵店日長桌作息（麵店日 17:30～20:30、八個學期；AA_542 第 5 節：麵店日＝每週不固定兩天，ndlDay；考試週不去 noExam）',!bad.length,J(bad)); }
// 1.
{ const G=at('2025-09-16',18); const here=TEAM.map(id=>[id,STORY.ndlHere(G,id)]);
  check('1. 9/16（二）18:00：麵店團四位都在店裡',here.every(x=>x[1]),J(here)); check('1. 閒聊照演',STORY.ndlTalkDue(G)); }
// 2.
{ const G=at('2025-09-16',20.75); const here=TEAM.map(id=>[id,STORY.ndlHere(G,id)]);
  check('2. 20:45：四位都走了（20:30）、閒聊不演',here.every(x=>!x[1])&&!STORY.ndlTalkDue(G),J(here)); }
// 3.
{ const G=at('2025-09-16',18); const orig=STORY.ndlHere; STORY.ndlHere=(g,id)=>id==='classmate_xinci'?false:orig(g,id);
  const L=NOODLE_TABLE.Y1, pick=[]; for(let i=0;i<L.length;i++){ G.flags.ndlTalkN={Y1:i}; const p=STORY.ndlTalkPick(G); pick.push(p&&p.e); }
  STORY.ndlHere=orig;
  const withX=pick.filter(e=>e&&(e.who||[]).includes('classmate_xinci'));
  check('3. 芯慈不在：輪到哪一則都不會挑到有她說話的那一則',withX.length===0&&pick.some(Boolean),J(withX.map(e=>e.who))); }
// 4.
{ const G=at('2025-09-16',18); const orig=STORY.ndlHere; STORY.ndlHere=()=>false;
  const e={dialogue:[{text:'（旁白）'}]}; const a=STORY.ndlHereAll(G,e); STORY.ndlHere=orig; const b=STORY.ndlHereAll(G,e);
  check('4. 旁白沒點名的那一則：一個麵店團都不在＝不演；有人在＝演',a===false&&b===true,J({a,b})); }
// 5. 麵店這一區已經生過人（S._popZone）：只認 3D 真的有的人（BB-B 10-30 n15：9/30、10/2 柏翰、芯慈作息在麵店但店裡坐滿沒生出來，ndlHere 照樣算在）
{ const G=at('2025-09-30',18); const sched=STORY.ndlHere(G,'classmate_bohan'); const o=EVENTS.npcOf, z0=STORY._popZone;
  EVENTS.npcOf=id=>id==='zhe'?{id:'zhe'}:null; STORY._popZone='noodle';
  const zhe=STORY.ndlHere(G,'zhe'), bo=STORY.ndlHere(G,'classmate_bohan'), pair=STORY.ndlHereAll(G,{who:['zhe','classmate_bohan']});
  G.zone='campus'; const away=STORY.ndlHere(G,'classmate_bohan'); G.zone='noodle';
  EVENTS.npcOf=o; STORY._popZone=z0;
  check('5. 麵店生過人以後：阿哲在 3D＝在；柏翰作息在麵店但 3D 沒有＝不在（阿哲＋柏翰那一則不演）；不在麵店照舊看作息',sched===true&&zhe===true&&bo===false&&pair===false&&away===true,J({sched,zhe,bo,pair,away})); }
// 6. 麵店團先拿位子（BB-B 10-30 n15_ndlread：客人 ×4 先坐滿，柏翰、芯慈沒位子沒生出來）：作息在麵店、還沒在店裡的幾位就留幾個空位
{ const days=[]; for(const k of ['2025-09-30','2025-10-02','2025-10-14','2025-10-16','2025-10-07','2025-10-21']){ const G=at(k,18); if(STORY.noodleCount(G)>=4) days.push(k); }
  const k=days[0]||'2025-10-14'; const G=at(k,18), E=GM.E, seats=[]; for(let i=0;i<3;i++){ const x=-3+i*3; for(const sg of [-1,1]) seats.push({x,z:0.5+sg*0.8,yaw:sg>0?Math.PI:0}); }
  const z0=E.zone, c0=global.CHAR, o0=EVENTS.npcOf, n0=E.npcs; E.zone=Object.assign({},z0,{seats}); E.npcs=[]; E.addNPC=E.addNPC||(n=>{ E.npcs.push(n); return n; }); const addOrig=E.addNPC; E.addNPC=n=>{ E.npcs.push(n); return n; };
  global.CHAR=Object.assign({},c0||{},{build:()=>({position:{set(){}},rotation:{}})});
  const zhe={id:'zhe',seat:{x:0,z:-0.3}}, yu={id:'yu',seat:{x:0,z:1.3}}; E.npcs.push(zhe,yu); EVENTS.npcOf=id=>id==='zhe'?zhe:id==='yu'?yu:null; E.player.obj.position={x:0,y:0,z:3};
  STORY.noodleRegulars(GM,true); const cust=E.npcs.filter(n=>n.ndlRegular).length, freeLeft=seats.filter(st=>!E.npcs.some(n=>{ const q=n.seat||n.seatTarget; return q&&Math.hypot(q.x-st.x,q.z-st.z)<0.3; })).length;
  E.zone=z0; E.npcs=n0; E.addNPC=addOrig; global.CHAR=c0; EVENTS.npcOf=o0;
  check('6. 客人 4 位的麵店日（'+k+'，阿哲、Alison 已坐中間）：客人只坐 2 個、留 2 個空位給柏翰、芯慈',STORY.noodleCount(G)>=4&&cust===2&&freeLeft===2,J({day:k,count:STORY.noodleCount(G),cust,freeLeft})); }
// 7. 考試週（AA-B 10-30 14:25 回 A）：麵店團不去麵店（落回各自的作息）；玩家在群組、考試週週二四 17～21 進麵店，每個考試週第一次阿姨一句
{ const notNoodle=k=>{ const G=at(k,18); return TEAM.filter(id=>{ const e=STORY.schedEnt(CHARACTERS[id],G); return e&&e.zone==='noodle'; }); };
  const ex=notNoodle('2025-10-21'), nm=notNoodle('2025-10-14');
  check('7. 期中週 10/21 18:00 四人都不在麵店（作息）；平常 10/14 四人都在',ex.length===0&&nm.length===4,J({exam:ex,normal:nm}));
  const G=at('2025-10-21',18); const talk=STORY.ndlTalkDue(G);
  check('7. 10/21（期中週）進麵店：不演長桌閒聊；阿姨那句「這禮拜考試齁？……」AA_542 第 7 節拿掉（沒有 ndlExamDue）',talk===false&&typeof STORY.ndlExamDue==='undefined'&&typeof STORY.ndlExamAyi==='undefined',J({talk})); }
H.done();

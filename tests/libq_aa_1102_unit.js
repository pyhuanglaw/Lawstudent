// 圖書館小聲講（LIBQ）的五件事（AA 2026-11-02 20:54 定稿；D127、AA_595；任務 AA595-LIB-NOD-THERMOS-1102）——不需要瀏覽器。
//   1  點頭範圍照舊（同一天、同一個人一次）：tests/aa595_rules_unit.js 第 1 節
//   2  約好在圖書館見面（invites3d.js 的約：時間到了、人在約好的地方＝按說話就是見面）：免點頭，對話照加（小聲）；今天在這裡見過面以後也不再點頭；沒有約的照舊點頭
//   3  事件演到一半搬到館外：那一步寫 {libOut:true}（events3d.js runLines）——那一步以前照加、以後不加；LIBQ.loudBegin／loudEnd 一定配對（choice next 提早 return、例外、巢狀 loud:true 都一樣）；
//      AA_595 表裡寫了「走出總圖」「走到 B1 門口」「櫃台以後」、而且遊戲裡已經有那句旁白的幾場都插了標記
//   4  前綴的位置：開頭已經有動作括號的合成一個（「（抬頭）喔，hi。」→「（抬頭，小聲）喔，hi。」；好幾個括號合進第一個）；沒有括號的才在最前面加「（小聲）」；玩家選項不加
//   5  舊存檔「空的保溫瓶」那一筆（ev_sis_empty_flask 選「買一杯黑咖啡」記的 HELPED）：人物面板顯示「那杯黑咖啡」，SOCIAL.noteShown 不會因為那一場 retired 把它藏掉
// 修改前（int/m590 d7a468868）：第 2～5 項 FAIL。用法：node tests/libq_aa_1102_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa595_rules_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ /* 和這一批無關的檔載不進來就跳過 */ } }
GM.toast=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
check('0. LIBQ 載得進來',typeof LIBQ!=='undefined'&&typeof LIBQ.gate==='function');
/* game3d.js 的 say：說出口以前先過 LIBQ.whisper（同一行程式碼，這裡照抄到假的 GM 上）*/
const say0=GM.say; GM.say=async(who,t,o)=>say0(who,LIBQ.whisper(GM,who,t),o);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const P=H.E.player; const at=(zone,lv,x,z)=>{ H.G.zone=zone; P.lv=lv|0; P.obj.position.x=x||0; P.obj.position.z=z||0; };
const npc=id=>({id,charId:id,name:SOCIAL.displayName(id),obj:{position:{x:1,y:0,z:1},rotation:{y:0}},pose:'read',idlePose:'read'});
const PRE='（小聲）';
const quiet=t=>t.startsWith(PRE)||/^（[^（）]*小聲）/.test(t);
const spokenT=()=>H.said.filter(s=>s.who).map(s=>s.t);
/* LIBQ 現在是不是在「不加」的狀態（loudBegin 沒配對＝之後所有讀書區的台詞都不加了）*/
const balanced=()=>{ at('library',0,0,0); return LIBQ.quietNow(GM)===true; };

(async()=>{
await sec('2',async()=>{
  const AN='heroine_01';
  H.fresh('2025-10-07',15,'library_hall'); H.FRIEND(AN); at('library_hall',1,0,0); LIBQ.reset();
  const iv=INV.accept(H.G,AN,'library',H.G.day,15);
  check('2. 前置：和以安約 15:00 總圖（library_hall），現在 15:00、人在二樓自習區＝按說話就是見面（INV.meetable）',!!iv&&!!INV.meetable(H.G,AN)&&LIBQ.quietNow(GM),J(iv));
  H.said=[]; const g=await LIBQ.gate(GM,npc(AN));
  check('2. 約好在圖書館見面：免點頭（gate 回傳 false、沒有點頭那一句）',g===false&&!H.said.some(s=>s.t===LIBQ.NOD.f),J(H.said));
  H.said=[]; await GM.say({name:'以安',charId:AN},'你來了。');
  check('2. 見面的對話照加（小聲）',H.said[0]&&H.said[0].t===PRE+'你來了。',J(H.said));
  iv.state='done'; H.G.hour=16.5;
  H.said=[]; const g2=await LIBQ.gate(GM,npc(AN));
  check('2. 今天在這裡見過面（約的狀態 done）以後再按說話：也不點頭',g2===false&&!H.said.length,J(H.said));
  /* 沒有約的人照舊點頭；約在別的地方、別天的不算 */
  H.FRIEND('heroine_03'); INV.accept(H.G,'heroine_03','library',H.G.day+1,15);
  H.said=[]; const g3=await LIBQ.gate(GM,npc('heroine_03'));
  check('2. 約的是明天：今天照舊點頭',g3===true&&H.said.length===1&&H.said[0].t===LIBQ.NOD.f,J(H.said));
  H.FRIEND('heroine_02'); H.said=[]; const g4=await LIBQ.gate(GM,npc('heroine_02'));
  check('2. 沒有約：照舊點頭',g4===true&&H.said[0]&&H.said[0].t===LIBQ.NOD.f,J(H.said));
  /* 走 story3d.js 的 talkCharacter（INV.meetable → INV.meet）：見面的台詞都小聲 */
  H.fresh('2025-10-07',15,'library_hall'); H.FRIEND(AN); at('library_hall',1,0,0); LIBQ.reset(); STORY._bindGM(GM);
  INV.accept(H.G,AN,'library',H.G.day,15); const n=npc(AN);
  H.said=[]; const g5=await LIBQ.gate(GM,n); let threw=null; try{ await STORY.talkCharacter(AN,n); }catch(e){ threw=String(e&&e.stack||e).split('\n').slice(0,2).join(' / '); }
  /* AA 11-02 22:30 定稿 Q16：朋友以上的見面旁白「閉館音樂響了，她才抬頭問你晚餐吃什麼。」之後（道別）不加——只看那句以前（tests/libq_out_1102_unit.js 第 3 節）*/
  const kML=H.said.findIndex(s=>!s.who&&LIBQ.isOut&&LIBQ.isOut(s.t)), sp=H.said.slice(0,kML<0?H.said.length:kML).filter(s=>s.who).map(s=>s.t);
  check('2. doInteract 的順序（gate → talkCharacter → INV.meet）：不點頭、見面照演，說話的句子都小聲（Q16 閉館音樂那句以前）',g5===false&&threw===null&&!H.said.some(s=>s.t===LIBQ.NOD.f)&&sp.length>0&&sp.every(t=>quiet(t)||!LIBQ.needsPrefix(t)),threw||J(H.lines()));
});

await sec('3',async()=>{
  H.fresh('2025-10-07',15,'library'); H.FAMILIAR('heroine_01'); at('library',0,0,0); LIBQ.reset();
  const T={id:'t_libout',title:'測試',participants:['heroine_01'],location:'library',trigger:'auto',dialogue:[
    {speaker:'heroine_01',text:'報告寫完了。'},{speaker:null,text:'（她指了指外面。你們走到樓梯間。）',libOut:true},{speaker:'heroine_01',text:'結論用了你說的那個。'},{speaker:'player',text:'真的？'}]};
  H.said=[]; await EVENTS.run(T); const a=H.lines();
  check('3. libOut 那一步以前照加、以後不加（說話的人含祐廷）',a.some(t=>t.endsWith(PRE+'報告寫完了。'))&&a.some(t=>t.endsWith('：結論用了你說的那個。'))&&a.some(t=>t.endsWith('：真的？'))&&!a.slice(2).some(t=>t.includes('小聲')),J(a));
  check('3. 事件結束 loudEnd 配對：之後讀書區的台詞又會加',balanced());
  /* 沒走到的分支、if 不成立的那一步：不算 */
  const T2={id:'t_libout2',title:'測試',participants:['heroine_01'],location:'library',trigger:'auto',dialogue:[
    {choice:[{text:'A',goto:'a'},{text:'B',goto:'b'}]},{label:'a'},{speaker:null,text:'（走出總圖。）',libOut:true},{speaker:'heroine_01',text:'外面好熱。'},{goto:'e'},
    {label:'b'},{speaker:null,text:'（走出總圖。）',libOut:true,if:{custom:()=>false}},{speaker:'heroine_01',text:'還在裡面。'},{label:'e'}]};
  H.said=[]; H.picks=[1]; await EVENTS.run(T2); const b=H.lines();
  check('3. 沒走到的那一支、if 不成立的那一步的 libOut 不算',b.some(t=>t.endsWith(PRE+'還在裡面。')),J(b));
  H.said=[]; H.picks=[0]; await EVENTS.run(Object.assign({},T2,{id:'t_libout2b'})); const b2=H.lines();
  check('3. 走到的那一支：libOut 以後不加',b2.some(t=>t.endsWith('：外面好熱。'))&&!b2.some(t=>t.includes('小聲')),J(b2));
  check('3. 兩場都配對',balanced());
  /* 選項的 next 提早 return、巢狀 loud:true、例外 */
  const N1={id:'t_libout_next',title:'下一場',participants:['heroine_01'],location:'library',trigger:'auto',dialogue:[{speaker:'heroine_01',text:'這一場在外面。'}]};
  STORY_EVENTS.push(N1);
  const T3={id:'t_libout3',title:'測試',participants:['heroine_01'],location:'library',trigger:'auto',dialogue:[{speaker:null,text:'（走出總圖。）',libOut:true},{choice:[{text:'走',next:'t_libout_next'}]},{speaker:'heroine_01',text:'不會演到。'}]};
  H.said=[]; H.picks=[0]; await EVENTS.run(T3); const c=H.lines();
  check('3. 選項 next 接下一場（runLines 中途 return）：下一場是在館外接著演、不加；結束以後配對',c.some(t=>t.endsWith('：這一場在外面。'))&&!c.some(t=>t.includes('小聲'))&&balanced(),J(c));
  H.said=[]; await EVENTS.run(Object.assign({},T,{id:'t_libout_loud',loud:true}));
  check('3. loud:true 的事件裡也寫了 libOut：兩個各自配對',!H.lines().some(t=>t.includes('小聲'))&&balanced(),J(H.lines()));
  const say1=GM.say; let threw=null; GM.say=async(w,t,o)=>{ if(String(t).includes('結論')) throw new Error('boom'); return say1(w,t,o); };
  try{ await EVENTS.runLines(T.dialogue,T); }catch(e){ threw=String(e.message); } GM.say=say1;
  check('3. libOut 以後丟例外：finally 照樣配對',threw==='boom'&&balanced(),String(threw));
  /* 直接用 EVENTS.runLines 演的（invites3d、sis_*3d 的 preTalk）也一樣 */
  H.said=[]; await EVENTS.runLines(T.dialogue,{id:'t_rl'}); const d=H.lines();
  check('3. EVENTS.runLines 直接演：一樣只加前面',d.some(t=>t.endsWith(PRE+'報告寫完了。'))&&d.some(t=>t.endsWith('：結論用了你說的那個。'))&&balanced(),J(d));
  /* 遊戲裡插了標記的幾場（AA_595 1-B34 後半、1-B51、1-B54、1-B55；學姊家族讀書會最後一次的「走出法圖」）*/
  const mark=(id,txt)=>{ const e=ev(id); const l=e&&(e.dialogue||[]).find(x=>x&&typeof x.text==='string'&&x.text.includes(txt)); return !!(l&&l.libOut); };
  const marks={card:mark('ev_sis_borrowed_card','櫃台蓋完章'),famLast:mark('ev_sis_fam_study_last','走出法圖，Kevin'),thu:mark('ev_yt_thursday_free','指了指外面')   /* AA_625 第 13 節整場換了：libOut 在開頭那一句 */,mx:mark('ev_mingxuan_notes_b1','走出總圖'),xc:mark('ev_xinci_second_b1','走到 B1 門口'),ps:mark('ev_peishan_syllogism','老師說法律的推理是三段論')};
  check('3. 插了 libOut 的幾場：學生證（櫃台以後）、家族讀書會最後一次（走出法圖）、空出來的週四（走出總圖時她說）、B1 的筆記（走出總圖）、慈 3 B1 版（走到 B1 門口）、沛珊三段論（「去外面講」的下一句）',Object.values(marks).every(Boolean),J(marks));
  check('3. 明軒 M1 原本那一場（校門口）不受影響',!(ev('ev_mingxuan_notes').dialogue||[]).some(l=>l&&l.libOut));
  /* 實際演：空出來的週四選「那就坐著。我陪妳。」——走出總圖以前沒有她開口的句子，之後的不加 */
  H.fresh('2025-10-07',19,'library'); H.FRIEND('heroine_03'); at('library',0,0,0); LIBQ.reset();
  H.said=[]; H.picks=[0]; await EVENTS.run(ev('ev_yt_thursday_free')); const e1=H.lines(), k=e1.findIndex(t=>t.includes('秀琴姨的事解決了'));
  /* AA 11-02 22:30 定稿（AA_595 1-B51）：開頭加「（她看到你，闔上書，指了指外面。）」libOut——整場都在館外，都不加（tests/libq_out_1102_unit.js）*/
  check('3. 自己選的週四（AA_625 第 13 節）：開頭「指了指外面」以後整場不加（小聲）',k>0&&e1[0]==='（她看到你，闔上書，指了指外面。）'&&!e1.some(t=>t.includes('小聲'))&&e1.includes(SOCIAL.displayName('heroine_03')+'：……嗯。秀琴姨的事解決了。')&&balanced(),J(e1));
  H.said=[]; H.picks=[0]; await EVENTS.run(ev('ev_sis_borrowed_card')); const e2=H.lines(), k2=e2.findIndex(t=>t.includes('櫃台蓋完章'));
  check('3. 學生證：櫃台以前小聲、「許老師開的書單。開學以前要讀完。」以後不加',k2>0&&e2.slice(0,k2).some(t=>t.includes(PRE))&&e2.slice(k2).some(t=>t.endsWith('：許老師開的書單。開學以前要讀完。'))&&!e2.slice(k2).some(t=>t.includes('小聲'))&&balanced(),J(e2));
});

await sec('4',async()=>{
  H.fresh('2025-10-07',15,'library'); at('library',0,0,0); LIBQ.reset();
  const w=t=>LIBQ.whisper(GM,{name:'學姊'},t);
  const r={paren:w('（抬頭）喔，hi。'),two:w('（抬頭）（笑了一下）對。'),none:w('早。'),nested:w('（看了一眼（那張紙））好。'),dot:w('（停了一下。）好。'),already:w('（她小聲）外面說。'),pre:w(PRE+'好。'),act:w('（他翻了一頁。）')};
  check('4. 開頭有動作括號：合成一個「（抬頭，小聲）喔，hi。」',r.paren==='（抬頭，小聲）喔，hi。',J(r));
  check('4. 好幾個括號：合進第一個「（抬頭，小聲）（笑了一下）對。」',r.two==='（抬頭，小聲）（笑了一下）對。',J(r));
  check('4. 沒有括號：最前面加「（小聲）」',r.none===PRE+'早。',J(r));
  check('4. 括號裡還有括號、括號裡以句號結尾：「（看了一眼（那張紙），小聲）好。」「（停了一下，小聲。）好。」',r.nested==='（看了一眼（那張紙），小聲）好。'&&r.dot==='（停了一下，小聲。）好。',J(r));
  check('4. 已經小聲的、已經有前綴的、整句動作的：照舊不動',r.already==='（她小聲）外面說。'&&r.pre===PRE+'好。'&&r.act==='（他翻了一頁。）',J(r));
  check('4. 合成以後 needsPrefix 認得（不會再加第二次）',LIBQ.needsPrefix(r.paren)===false&&LIBQ.whisper(GM,{name:'學姊'},r.paren)===r.paren);
  /* 事件：選項不加 */
  const T={id:'t_libq_opts',title:'測試',participants:['heroine_05'],location:'library',trigger:'auto',dialogue:[{speaker:'heroine_05',text:'（抬頭）喔，hi。'},{choice:[{text:'「學姊好。」'},{text:'（點頭）'}]}]};
  H.said=[]; H.opts=[]; H.picks=[0]; await EVENTS.run(T);
  check('4. 事件裡：她的「（抬頭，小聲）喔，hi。」；玩家選項維持原樣（不加）',H.lines().some(t=>t.endsWith('：（抬頭，小聲）喔，hi。'))&&J(H.opts[0].slice())===J(['「學姊好。」','（點頭）']),J([H.lines(),H.opts]));
});

await sec('5',async()=>{
  H.fresh('2025-10-21',15,'lawlib'); H.FAMILIAR('heroine_05');
  check('5. 前置：ev_sis_empty_flask 已經 retired（AA_590 第 16 列）',!!ev('ev_sis_empty_flask')&&!!ev('ev_sis_empty_flask').retired);
  const ch=(ev('ev_sis_empty_flask').dialogue.find(l=>l&&l.choice)||{}).choice||[]; const tags=ch.map(c=>((c.consequences&&c.consequences.mem)||[]).map(m=>m.tag+'|'+m.note).join(','));
  check('5. 前置：那一場「買黑咖啡」記 HELPED「空的保溫瓶，買了黑咖啡」，另外兩個記 NOTICED_HER「空的保溫瓶」',J(tags)===J(['NOTICED_HER|空的保溫瓶','HELPED|空的保溫瓶，買了黑咖啡','NOTICED_HER|空的保溫瓶']),J(tags));
  SOCIAL.remember('heroine_05','HELPED','空的保溫瓶，買了黑咖啡');
  const m=SOCIAL.memories('heroine_05').find(x=>x.tag==='HELPED');
  check('5. 人物面板：HELPED「空的保溫瓶，買了黑咖啡」顯示「那杯黑咖啡」（noteShown 不藏）',SOCIAL.noteShown('heroine_05',m)==='那杯黑咖啡',J(SOCIAL.noteShown('heroine_05',m)));
  const P2=(SOCIAL.panelMemories||SOCIAL.memories)('heroine_05').some(x=>x.tag==='HELPED');
  check('5. 面板的記憶清單看得到這一筆、名稱「幫過忙（那杯黑咖啡）」',P2&&SOCIAL.describe('heroine_05').includes(SOCIAL.MEMORY_LABEL.HELPED+'（那杯黑咖啡）'),SOCIAL.describe('heroine_05'));
  check('5. 「空的保溫瓶」四個字不出現在面板上',!SOCIAL.describe('heroine_05').includes('空的保溫瓶'));
  SOCIAL.remember('heroine_05','NOTICED_HER','空的保溫瓶');
  check('5. 同一場另外兩個選項的 NOTICED_HER「空的保溫瓶」：照舊不帶備註（沒有買咖啡）',SOCIAL.noteShown('heroine_05',{tag:'NOTICED_HER',note:'空的保溫瓶'})==='');
  check('5. 其他改名照舊：沛珊「她在考慮轉系」→「她在想別的路」',SOCIAL.noteShown('classmate_peishan',{tag:'IMPORTANT_CONVERSATION',note:'她在考慮轉系'})==='她在想別的路');
  const rt=JSON.parse(JSON.stringify(H.G)); check('5. 存檔裡的原字不改（只改顯示）',J(rt).includes('空的保溫瓶，買了黑咖啡'));
});

H.done();
})();

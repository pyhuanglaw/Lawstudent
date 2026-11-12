// CANON-1112 第二批（使用者 2026-11-12：祐廷應屆考進首都帝大法律系、遊戲從迎新宿營開始；舊序章拿掉；可昕＝同班同學、開局不認識）——不需要瀏覽器（D131）。
//   稿（企劃線，AA-C 2026-11-12 定稿）：AA_858 開局回顧字卡、AA_856 第三版 可昕怎麼認識與大一上四拍、AA_859 宿營第一天打牌那一段。字一律從稿讀（git show <sha>:<稿>），這裡不另外手打一份。
//   1  回顧字卡：S.LAW_START_RECAP／_W1 逐字等於 AA_858（五句＋最後一句兩版）
//   2  新遊戲的預設值：沒有交往旗標（dating_kexin:false、KX_MET:false）；讀檔不再把「沒有旗標」補成交往中
//   3  開局到開學第一週以前：手機聯絡人、朋友清單、動態牆、場景裡都沒有她；每天跑手機規則，沒有她的訊息、沒有她的出遊（8/22～9/28，一直沒認識的局）
//   4  宿營第一天打牌那一段逐字等於 AA_859；兩個選項都記 ZHE_CALLS_GE；一起拿掉的三樣不在了
//   5  第一次見面：這學期第一堂必修開頭＝老師開場那一版（逐字、兩個選項）；那一堂沒去＝順延版；主線第二天的劇情課不算；見面以後才進聯絡人、朋友清單，必修課時間在教室
//   6  保底：第 5 週起還沒認識，第一次走進法律系館A 一樓（逐字）；第 4 週不演、認識了不演
//   7  大一上四拍：條件（第 3、6、10 週、期末最後一科考完那天）、旗標；每一句都在稿裡
//   8  新加的九個事件每一句、每個選項都在 AA_856 裡（拿掉「」以後逐字比；稿寫「祐廷」的地方遊戲用 {name}）
//   9  人物資料：法律系、同屆、不在外校；年級標籤等於設定總表那一列
//  10  舊的法律系存檔（dating_kexin true）讀進來照舊：算認識、算交往中、不會再演第一次見面、手機規則照跑不報錯；新規則只給新設定的局（存檔有 KX_MET 這個欄位）
// 修改前（claude/adoring-meitner-mqzst8 @6c2ecfc0af，git archive 那一版放進這支測試真的跑過）與修改後的數字見這個 commit 的訊息。
// 用法：node tests/canon_opening_1112_unit.js（稿用 git show 讀；在沒有 .git 的目錄跑時設環境變數 CANON_DOCREPO＝這個 repo 的目錄；讀不到稿＝逐字對稿那幾項標「沒比」，其餘照測）
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/data/she_pays.js','src/date3d.js',
  'src/data/termend_lines.js','src/data/termend_opts.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/yejian_shaola_buy.js','src/shaola_order3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,100)); } } }
if(typeof XCROM!=='undefined') XCROM.OLD=true; else globalThis.XCROM={OLD:true};
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.skipScope=()=>{};
const DOCREPO=process.env.CANON_DOCREPO||H.ROOT, SP='docs/story_planning/', SHA='077a6e501d', TABLE_SHA='f6aa917593';
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:DOCREPO,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
const A858=show(SHA,SP+'AA_858_法律系開局回顧字卡.md'), A856=show(SHA,SP+'AA_856_可昕在法律系_認識與大一上.md'), A859=show(SHA,SP+'AA_859_宿營打牌_學測那段.md'), TABLE=show(TABLE_SHA,SP+'00_現行設定總表.md');
const docs=!!(A858&&A856&&A859);
if(!docs) console.log('（讀不到企劃線 '+SHA+' 的稿：逐字對稿那幾項不比，只驗結構）');
const sec=async(n,f)=>{ const t0=Date.now(); try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } if(process.env.CANON_TIME) console.log('（第 '+n+' 節 '+((Date.now()-t0)/1000).toFixed(1)+' 秒）'); };
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7, TD=(t,w,wd)=>STORY.termDay(t,w,wd);
const KX='kexin', ev=id=>STORY_EVENTS.find(e=>e.id===id);
const gsrc=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
/* game3d.js 要 DOM、載不進 Node：把 defaults()、knownIds() 的原文切出來單獨執行（和遊戲同一段程式）*/
const cutFn=(head,tail)=>{ const a=gsrc.indexOf(head); if(a<0) return null; const b=gsrc.indexOf(tail,a); return b<0?null:gsrc.slice(a,b+tail.length); };
const defaultsSrc=cutFn('function defaults(name){','savedAt:0}; }'), knownSrc=cutFn('function knownIds(){','}); }');
const newFlags=()=>{ const f=new Function('SAVE_VER',defaultsSrc+'; return defaults();'); return f(3).flags; };
const knownIds=G=>new Function('CHARACTERS','SOCIAL','G',knownSrc+'; return knownIds();')(CHARACTERS,SOCIAL,G);
/* 新遊戲的局：旗標＝defaults() 的旗標＋選 1 的開局（8/29 搬進宿舍、主線第一天 9/3）；宿營認識的人照宿營記 */
const NEWGAME=()=>Object.assign({},newFlags(),{LAW_START_DAY:STORY.LAW_D0,MAIN_D1:STORY.MAIN_D1_NEW,LAW_RECAP_SEEN:true,CAMP_Y1:true,KAI_MOVEIN:true,MET_KAI:true,MET_ZHE:true,DORM_FOUR:true,KX_FIRST_MSG:undefined,YT_MET_JOB:false});
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign(NEWGAME(),flags||{})); delete G.flags.KX_FIRST_MSG; G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G);
  E.player.busy=false; E.player.lv=0; E.player.seat=null; E.npcs.length=0; GM.npc={}; ADV.active=false; STORY._bindGM(GM); return G; };
const at=(d,h)=>{ const G=H.G; G.day=typeof d==='number'?d:D(d); G.hour=h; G.weekday=wdOf(G.day); };
const play=async(id,pk)=>{ H.said=[]; H.opts=[]; H.picks=(pk||[]).slice(); const e=ev(id); if(!e) throw new Error('沒有事件 '+id); await EVENTS.run(e); };
const saidT=()=>H.said.map(s=>s.t), who=()=>H.said.map(s=>s.who);
const reqOn=(G,day,id)=>CLS.dayItems(G,day).find(it=>it.c.id===id);
/* 上一堂課：課堂裡還有別的選單（課堂提問…），要選的字在哪個選單出現就選它，其他選單選第一個 */
const attend=async(it,pk)=>{ H.said=[]; H.opts=[]; H.picks=[]; at(it.day,it.t0+0.01); H.G.zone='classroom'; const c0=GM.choose;
  GM.choose=async o=>{ const L=o.map(q=>q.t||q.text); H.opts.push(L); for(const w of (pk||[])){ const k=L.findIndex(t=>t.includes(w)); if(k>=0) return k; } return 0; };
  try{ return await CLS.attend(GM,it,{inScene:true}); } finally { GM.choose=c0; } };
const norm=s=>String(s).replace(/[「」]/g,'');
/* 稿裡「> 說話的人：字」「> （旁白）」那幾行（一段一段，以空行或非引用行分開）*/
const quoteBlocks=md=>{ const out=[]; let cur=null; for(const l of md.split('\n')){ const m=/^>\s?(.*)$/.exec(l); if(m){ (cur||(cur=[],out.push(cur),cur)).push(m[1].trim()); } else cur=null; } return out; };
const sayOf=l=>{ const m=/^(可昕|阿哲|祐廷|芯慈)：(.*)$/.exec(l); return m?m[2]:l; };

(async()=>{
  check('0. 其餘的檔照 index.html 的順序載入，沒有載入失敗',loadErr.length===0,loadErr.slice(0,3).join('｜'));
  check('0. 有 STORY.kxKnown／kxMeetDue／kxClassMeet／kxHandDue 和九個新事件',!!(STORY.kxKnown&&STORY.kxMeetDue&&STORY.kxClassMeet&&STORY.kxHandDue)&&['ev_kx_meet_class','ev_kx_meet_hall','ev_kx_first_out','ev_kx_dress','ev_kx_hand_in','ev_kx_hand','ev_kx_angry','ev_kx_y1s1_end'].every(ev));

  await sec('1',async()=>{
    const R=STORY.LAW_START_RECAP, W=STORY.LAW_START_RECAP_W1;
    check('1. 回顧字卡兩版都是六句、前五句相同、最後一句不同',Array.isArray(R)&&Array.isArray(W)&&R.length===6&&W.length===6&&J(R.slice(0,5))===J(W.slice(0,5))&&R[5]!==W[5],J([R&&R.length,W&&W.length]));
    if(docs){ const five=[...A858.matchAll(/^(\d)\. (.+)$/mg)].filter(m=>+m[1]>=1&&+m[1]<=5).slice(0,5).map(m=>m[2].trim());
      const w1=(/最後一句（從宿營開始的新局，`LAW_START_RECAP_W1`）：\*\*(.+?)\*\*/.exec(A858)||[])[1], d1=(/最後一句（不演宿營、直接開學的那一版，`LAW_START_RECAP`）：\*\*(.+?)\*\*/.exec(A858)||[])[1];
      check('1. 稿讀得到五句＋最後一句兩版',five.length===5&&!!w1&&!!d1,J([five.length,w1,d1]));
      check('1. S.LAW_START_RECAP_W1（從宿營開始）逐字等於 AA_858',J(W)===J(five.concat([w1])),J(W));
      check('1. S.LAW_START_RECAP（直接開學）逐字等於 AA_858',J(R)===J(five.concat([d1])),J(R)); }
    check('1. S.LAW_WEEK12 原本四句在講舊序章、稿沒有新字＝不演（空的）',Array.isArray(STORY.LAW_WEEK12)&&STORY.LAW_WEEK12.length===0);
    H.fresh('2025-08-22',8,'dorm',{}); H.said=[]; await STORY.recap(GM,W); check('1. 播出來的六句就是那六句',J(saidT())===J(W)); });

  await sec('2',async()=>{
    check('2. game3d.js 切得到 defaults()、knownIds()',!!defaultsSrc&&!!knownSrc);
    const F=newFlags();
    check('2. 新遊戲的預設旗標：dating_kexin 是 false（不是交往中）、KX_MET 是 false（還沒認識）',F.dating_kexin===false&&F.KX_MET===false,J([F.dating_kexin,F.KX_MET]));
    check('2. 讀檔（migrate）不再把「沒有 dating_kexin」補成 true',!/dating_kexin===undefined\)\s*s\.flags\.dating_kexin=true/.test(gsrc));
    check('2. 讀檔：舊存檔已經是交往中的，聯絡人照舊補',/if\(s\.flags&&s\.flags\.dating_kexin\)\{ if\(!s\.contacts\|\|typeof s\.contacts!=='object'\) s\.contacts=\{\}; if\(s\.contacts\.kexin==null\) s\.contacts\.kexin=0; \}/.test(gsrc));
    const G=fresh('2025-08-29',16,'dorm'); ROM.rec(G);
    check('2. 新遊戲的局：ROM 沒有她的交往紀錄、不是交往中',!ROM.partners(G).includes(KX)&&!(G.flags.ROMANCE_HISTORY||[]).some(r=>r.id===KX)&&ROM.get(G,KX).status==='none',J(ROM.partners(G))); });

  await sec('3',async()=>{
    const G=fresh('2025-08-29',16,'dorm');
    check('3. 開局：STORY.kxKnown 是 false、沒有她的聯絡方式、沒有 FIRST_MET',!STORY.kxKnown(G)&&!INV.hasContact(G,KX)&&!SOCIAL.has(KX,'FIRST_MET'));
    check('3. 開局：朋友清單（game3d.js knownIds）沒有她',!knownIds(G).includes(KX),J(knownIds(G)));
    check('3. 開局：手機聯絡人（MSG.contactRows）沒有她',typeof MSG!=='undefined'&&!MSG.contactRows(G,knownIds(G)).some(r=>r.id===KX));
    if(typeof FEED!=='undefined'&&FEED.blocked) check('3. 開局：動態牆她的貼文不出（沒有聯絡方式）',FEED.blocked(G,{who:KX},{day:G.day})==='contact');
    at('2025-09-01',9.5); const it=reqOn(G,G.day,'const_1');
    check('3. 9/1 憲法（這學期第一堂必修）排得到',!!it&&it.c.kind==='required',it?it.c.name:'');
    check('3. 還沒認識：必修課的時間她不在教室、哪裡都不在（STORY.schedEnt／whereIs 都是 null）',STORY.schedEnt(CHARACTERS[KX],G)===null&&STORY.whereIs(GM,KX)===null);
    check('3. 同班的以安那個時間在教室（對照：同一套機制）',(STORY.schedEnt(CHARACTERS.heroine_01,G)||{}).act==='class');
    /* 一直沒認識的局：8/22～9/28 每天四個時間跑手機規則 */
    const G2=fresh('2025-08-22',8,'dorm',{CAMP_Y1:true}); let err=null, n=0;
    for(let d=D('2025-08-22');d<=D('2025-09-28')&&!err;d++) for(const h of [8,12.5,19,22.5]){ at(d,h); try{ STORY.phoneRules(GM); PHONE.tick(G2); if(typeof FEED!=='undefined'&&FEED.tick) FEED.tick(G2); n++; }catch(e){ err=String(e&&e.stack||e).split('\n').slice(0,3).join(' / '); break; } }
    check('3. 8/22～9/28 每天跑手機規則沒有報錯（'+n+' 次）',!err,err||'');
    const kxMsgs=(G2.msgs||[]).filter(m=>m.th==='p:'+KX||m.from===KX);
    check('3. 一直沒認識：沒有任何一則她的訊息（原本開局前後她傳的幾則、8/29 那兩則都不在了）',kxMsgs.length===0,J(kxMsgs.slice(0,3).map(m=>[m.tag,m.text])));
    check('3. 一直沒認識：沒有排她的出遊（原本 8/30 那一場不在了）、沒有那一場的事件定義',!(G2.outings||[]).some(q=>/kexin|e37/.test(String(q.ev)+String(q.id)))&&!STORY_EVENTS.some(e=>e.id==='ev_y0_e37'),J((G2.outings||[]).map(q=>q.id)));
    check('3. 一直沒認識：動態牆看得到的貼文沒有她的',typeof FEED==='undefined'||!FEED.visible||!FEED.visible(G2).some(p=>(p.who||(p.p&&p.p.who))===KX));
    check('3. story3d.js 沒有那三個函式了（開局兩則、開學前一晚）',!/kexinFirstMsg|kexinEve/.test(fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'))); });

  await sec('4',async()=>{
    const e=ev('ev_camp_d1_free'); check('4. 有宿營第一天自由時間那一段',!!e);
    const head='（打牌，第三局。阿哲又拿到一手爛牌。）';
    const run=async pk=>{ fresh('2025-08-22',19.5,'dorm',{CAMP_Y1:false,MET_ZHE:true}); await play('ev_camp_d1_free',['好啊',pk]); const L=saidT(), k=L.indexOf(head); return {L:k<0?[]:L.slice(k+1),F:H.G.flags,opts:H.opts.slice(-1)[0]}; };
    const a=await run('你可以問我別的'), b=await run('那你白問了');
    check('4. 兩個選項都記 ZHE_CALLS_GE',a.F.ZHE_CALLS_GE===true&&b.F.ZHE_CALLS_GE===true);
    check('4. 舊分支的旗標這裡不再寫',[a.F,b.F].every(F=>!('ECON_PAST_SHARED' in F)&&!('WHY_RETAKE_ASKED' in F)));
    check('4. 那個選單剛好兩個選項',a.opts&&a.opts.length===2,J(a.opts));
    if(docs){ const B=quoteBlocks(A859).map(b=>b.map(sayOf));   /* 0＝開頭四句、1＝選項一、2＝選項二、3＝結尾兩句 */
      const o=[...A859.matchAll(/^選項[一二]：(「.+?」)$/mg)].map(m=>m[1]);
      check('4. 稿讀得到四段引用＋兩個選項',B.length===4&&o.length===2,J([B.length,o]));
      check('4. 選項的字逐字等於 AA_859',J(a.opts)===J(o),J(a.opts));
      check('4. 選項一那一條：打牌那一句以後逐字等於 AA_859（開頭四句＋選項一＋結尾兩句）',J(a.L)===J(B[0].concat(B[1],B[3])),J(a.L));
      check('4. 選項二那一條：逐字等於 AA_859（開頭四句＋選項二＋結尾兩句）',J(b.L)===J(B[0].concat(B[2],B[3])),J(b.L)); }
    check('4. 一起拿掉的：夜談的定義不在了',!ev('ev_camp_d2_talk'));
    check('4. 一起拿掉的：遊覽車那一段最後沒有「去年來過」那一句（條件 PLAYED_Y0 的列不在了）',!(ev('ev_camp_d1_bus').dialogue||[]).some(l=>l.if&&(l.if.flags||[]).includes('PLAYED_Y0')));
    const w=ev('ev_welcome_y1s1'), ch=(w.dialogue.find(l=>l.choice)||{}).choice||[];
    check('4. 一起拿掉的：迎新自我介紹剩兩個選項、沒有 econ 那一支',ch.length===2&&!w.dialogue.some(l=>l.label==='econ'||l.label==='why_h')&&!ch.some(c=>c.goto==='econ'),J(ch.map(c=>c.text))); });

  await sec('5',async()=>{
    const B=docs?quoteBlocks(A856).map(b=>b.map(sayOf)):null;   /* 0＝開頭三句、1＝選項一、2＝選項二、3＝保底、4＝教室外面那一句 */
    /* 這學期第一堂必修（9/1 憲法）：老師開場那一版 */
    let G=fresh('2025-09-01',9,'classroom'); let it=reqOn(G,G.day,'const_1');
    check('5. 9/1 憲法：第一次見面會演（kxMeetDue）、而且是這學期第一堂必修（kxMeetFirst）',STORY.kxMeetDue(G,it)&&STORY.kxMeetFirst(G,it));
    check('5. 學期中的快轉會停在那一堂前面（semff3d.js 讀 STORY.kxMeetDue）',/STORY\.kxMeetDue&&STORY\.kxMeetDue\(G,it\)\) return 'inclass'/.test(fs.readFileSync(path.join(H.ROOT,'src/semff3d.js'),'utf8')));
    await attend(it,['會。']);
    let L=saidT(); const k0=L.indexOf('（老師說：先跟前後左右的同學認識一下，兩分鐘。教室一下子吵起來。）');
    check('5. 上 9/1 的憲法：開頭演第一次見面（老師那一句在教授講課以前）',k0>=0&&k0<=1,J(L.slice(0,4)));   /* 最前面最多只有「你在座位上等」那一句 */
    if(docs) check('5. 選「會。」：逐字等於 AA_856 第 2 節（開頭三句＋選項一那五句）',J(L.slice(k0,k0+8))===J(B[0].concat(B[1])),J(L.slice(k0,k0+8)));
    check('5. 見面以後：KX_MET、KX_MET_DAY、FIRST_MET、有聯絡方式（G.contacts 記今天）',G.flags.KX_MET===true&&G.flags.KX_MET_DAY===G.day&&G.flags.KX_MET_HOW==='class'&&SOCIAL.has(KX,'FIRST_MET')&&INV.hasContact(G,KX)&&G.contacts[KX]===G.day,J([(G.contacts||{})[KX]]));
    check('5. 見面以後才進朋友清單、手機聯絡人',knownIds(G).includes(KX)&&MSG.contactRows(G,knownIds(G)).some(r=>r.id===KX));
    check('5. 還沒交往：互加手機以後就有可以傳的話題（A／R 層）、動態牆她的貼文照樣不出（CANON-NO-ECON-1112 第四批：照 AA_892 第 3 節）',MSG.topics(G,KX).length>0&&(typeof FEED==='undefined'||FEED.blocked(G,{who:KX},{day:G.day})==='contact'));
    check('5. 見面以後還是沒有交往',G.flags.dating_kexin===false&&!ROM.partners(G).includes(KX));
    at('2025-09-03',9.5); check('5. 見面以後：下一堂必修（9/3 刑總）的時間她在教室',(STORY.schedEnt(CHARACTERS[KX],G)||{}).act==='class');
    { const it2=reqOn(G,G.day,'crim_gen1'); check('5. 認識了：之後的必修不再演',!STORY.kxMeetDue(G,it2)); }
    /* 選項二 */
    G=fresh('2025-09-01',9,'classroom'); it=reqOn(G,G.day,'const_1'); await attend(it,['看跟誰。']); L=saidT();
    { const k=L.indexOf('（老師說：先跟前後左右的同學認識一下，兩分鐘。教室一下子吵起來。）'); if(docs) check('5. 選「看跟誰。」：逐字等於 AA_856（開頭三句＋選項二那四句）',J(L.slice(k,k+7))===J(B[0].concat(B[2])),J(L.slice(k,k+7)));
      if(docs){ const o=[...A856.matchAll(/^選項[一二]：(「.+?」)$/mg)].map(m=>m[1]); check('5. 兩個選項的字逐字等於 AA_856',J((H.opts.find(x=>x.length===2&&x[0]==='「會。」')||[]))===J(o),J(H.opts[0])); } }
    /* 那一堂沒去：順延到下一次有去上的必修（老師還沒來那一版）*/
    G=fresh('2025-09-03',9,'classroom'); it=reqOn(G,G.day,'crim_gen1');
    check('5. 9/1 沒去，9/3 刑總：會演、不是第一堂（順延版）',STORY.kxMeetDue(G,it)&&!STORY.kxMeetFirst(G,it));
    await attend(it,['會。']); L=saidT();
    check('5. 順延版：開頭是「（老師還沒來。坐你前面的女生轉過來。）」，沒有老師開場那一句，後面照舊，最後一樣互加手機',L.includes('（老師還沒來。坐你前面的女生轉過來。）')&&!L.some(t=>/老師說：先跟前後左右/.test(t))&&L[L.indexOf('（老師還沒來。坐你前面的女生轉過來。）')+1]==='我先講，我很不會這種。你會講話吧？'&&G.flags.KX_MET===true&&INV.hasContact(G,KX),J(L.slice(0,3)));
    if(docs) check('5. 順延版那一句旁白在 AA_856 裡',A856.includes('老師還沒來。坐你前面的女生轉過來。'));
    /* 主線第二天（9/4）的民總是劇情課：不算 */
    G=fresh('2025-09-04',13,'classroom'); it=reqOn(G,G.day,'civ_general');
    check('5. 9/4 的民總是劇情課（以安、周教授那一堂）：第一次見面不排在這一堂',!!it&&CLS.storyClass(G,it)&&!STORY.kxMeetDue(G,it));
    /* 遲到、考試那一堂不演 */
    G=fresh('2025-09-01',9.6,'classroom'); it=reqOn(G,G.day,'const_1'); H.said=[]; H.picks=[0,'會。']; G.zone='classroom'; await CLS.attend(GM,it,{inScene:true,lateOk:true});
    check('5. 遲到進教室的那一堂不演（順延）',!saidT().some(t=>/坐你前面的女生/.test(t))&&!G.flags.KX_MET,J(saidT().slice(0,2))); });

  await sec('6',async()=>{
    const e=ev('ev_kx_meet_hall'); const w5=TD('Y1S1',5,1), w4=TD('Y1S1',4,5);
    let G=fresh(w4,10,'linze'); check('6. 第 4 週還沒認識、走進法律系館A 一樓：保底不演',!EVENTS.check(e));
    G=fresh(w5,10,'linze'); check('6. 第 5 週第一天還沒認識、走進法律系館A 一樓：保底會演',EVENTS.check(e)&&e.trigger==='enter'&&e.location==='linze');
    G.zone='campus'; check('6. 不在法律系館A 不演',!EVENTS.check(e)); G.zone='linze';
    await play('ev_kx_meet_hall'); const L=saidT();
    if(docs){ const B=quoteBlocks(A856).map(b=>b.map(sayOf)); check('6. 保底版逐字等於 AA_856（三句）',J(L)===J(B[3]),J(L)); }
    check('6. 保底版最後一樣：KX_MET、聯絡方式（G.contacts 記今天）、進朋友清單',G.flags.KX_MET===true&&G.flags.KX_MET_HOW==='hall'&&INV.hasContact(G,KX)&&G.contacts[KX]===G.day&&knownIds(G).includes(KX));
    check('6. 認識了：保底不再演、課堂版也不演',!EVENTS.check(e)&&!STORY.kxMeetDue(G,reqOn(G,TD('Y1S1',5,3),'crim_gen1')));
    /* 教室外面那一句：課堂版認識的、另一天早上 */
    const o=ev('ev_kx_first_out'); G=fresh(TD('Y1S1',2,2),8.5,'linze',{KX_MET:true,KX_MET_HOW:'class',KX_MET_DAY:TD('Y1S1',1,1)}); INV.addContact(G,KX);
    check('6. 「教室外面那一句」：課堂版認識以後的另一天早上走進法律系館A 會演',EVENTS.check(o));
    G.flags.KX_MET_HOW='hall'; check('6. 保底版認識的不演那一句（那一句接的是課堂版的「會講話」）',!EVENTS.check(o)); G.flags.KX_MET_HOW='class';
    at(TD('Y1S1',1,1),8.5); check('6. 認識的當天不演',!EVENTS.check(o)); at(TD('Y1S1',2,2),15); check('6. 下午不演（她問的是早餐）',!EVENTS.check(o)); });

  await sec('7',async()=>{
    const MET={KX_MET:true,KX_MET_HOW:'class',KX_MET_DAY:TD('Y1S1',1,1)};
    /* ① 第 3 週早上的必修課前 */
    let G=fresh(TD('Y1S1',3,1),9,'classroom',MET); INV.addContact(G,KX); let it=reqOn(G,G.day,'const_1');
    check('7①. 第 3 週週一憲法（早上的必修）課前挑到 ev_kx_dress',(CLS.beforeClassPick(it)||{}).id==='ev_kx_dress');
    await attend(it,[]); check('7①. 上那一堂：課前演了、記 KX_DRESS',saidT().includes('我穿給我自己看的。你也可以試試看。')&&G.flags.KX_DRESS===true,J(saidT().slice(0,3)));
    G=fresh(TD('Y1S1',4,1),9,'classroom',MET); it=reqOn(G,G.day,'const_1'); check('7①. 第 4 週不演',(CLS.beforeClassPick(it)||{}).id!=='ev_kx_dress');
    G=fresh(TD('Y1S1',3,1),9,'classroom',{}); it=reqOn(G,G.day,'const_1'); check('7①. 還沒認識不演（那一堂演的是第一次見面）',(CLS.beforeClassPick(it)||{}).id!=='ev_kx_dress'&&STORY.kxMeetDue(G,it));
    G=fresh(TD('Y1S1',3,4),13.2,'classroom',Object.assign({afternoonDone:true,classDone:true},MET)); it=reqOn(G,G.day,'civ_general'); check('7①. 下午的必修不演（稿：早上第一堂課前）',!!it&&(CLS.beforeClassPick(it)||{}).id!=='ev_kx_dress');
    /* ② 第 6 週必修：課堂中＋下課 */
    G=fresh(TD('Y1S1',6,3),9,'classroom',MET); INV.addContact(G,KX); it=reqOn(G,G.day,'crim_gen1');   /* 第 6 週週一 10/6 是中秋節（放假），用週三的刑總 */
    check('7②. 第 6 週的必修：課堂中那一半會演（kxHandDue；CLS.IN_CLASS 有掛、快轉會停）',STORY.kxHandDue(G,it)&&CLS.IN_CLASS.some(f=>f.kx&&f.due(G,it)));
    await attend(it,['不會。']); let L=saidT();
    { const a=L.indexOf('老師問了一個問題，全班沒有人出聲。'), b=L.indexOf('這個我不確定。我回去查。'), c=L.indexOf('我剛剛是不是很丟臉？'), d=L.indexOf('那下次你也舉手。不要每次都我。');
      check('7②. 上那一堂：課堂中三句 → 下課她問 → 選「不會。…」她回，順序對，記 KX_HAND',a>=0&&b>a&&c>b&&d>c&&G.flags.KX_HAND===true&&G.flags.KX_HAND_DAY===G.day,J([a,b,c,d])); }
    { const it2=reqOn(G,TD('Y1S1',6,4),'civ_general'); at(TD('Y1S1',6,4),13.2); check('7②. 演過了：同一週下一堂必修不再演',!STORY.kxHandDue(G,it2)); }
    G=fresh(TD('Y1S1',6,3),9,'classroom',MET); INV.addContact(G,KX); it=reqOn(G,G.day,'crim_gen1'); await attend(it,['有一點。']); check('7②. 選「有一點。」：她的回話',saidT().includes('（她瞪你）你可以不要這麼誠實。……好啦，謝謝。'));
    G=fresh(TD('Y1S1',7,1),9,'classroom',MET); it=reqOn(G,G.day,'const_1'); check('7②. 第 7 週不演、還沒認識不演',!STORY.kxHandDue(G,it)&&!STORY.kxHandDue(fresh(TD('Y1S1',6,3),9,'classroom',{}),reqOn(H.G,H.G.day,'crim_gen1')));
    /* ③ 第 10 週法律系館A */
    const an=ev('ev_kx_angry'); G=fresh(TD('Y1S1',10,2),11,'linze',MET); INV.addContact(G,KX);
    check('7③. 第 10 週走進法律系館A 一樓會演',EVENTS.check(an)); await play('ev_kx_angry',['陪她整理到閉館']);
    check('7③. 選陪她：她最後那一句、記 KX_ANGRY_SEEN＋KX_STAYED',saidT().slice(-1)[0]==='我剛剛很兇。我知道。……可是我沒有講錯。'&&G.flags.KX_ANGRY_SEEN===true&&G.flags.KX_STAYED===true&&J(H.opts[0])===J(['陪她整理到閉館','去買飲料給她','不插手']),J(H.opts[0]));
    G=fresh(TD('Y1S1',10,2),11,'linze',MET); await play('ev_kx_angry',['不插手']); check('7③. 選不插手：只記 KX_ANGRY_SEEN、沒有她那一句',G.flags.KX_ANGRY_SEEN===true&&!G.flags.KX_STAYED&&!saidT().includes('我剛剛很兇。我知道。……可是我沒有講錯。'));
    G=fresh(TD('Y1S1',9,2),11,'linze',MET); check('7③. 第 9 週不演',!EVENTS.check(an));
    /* ④ 期末最後一科考完那天 */
    const en=ev('ev_kx_y1s1_end'); G=fresh(TD('Y1S1',16,1),9,'campus',MET); INV.addContact(G,KX); const last=CLS.lastExamEnd(G,'Y1S1','final');
    check('7④. 算得到大一上期末最後一科考完的時間',!!last&&typeof last.day==='number',J(last));
    at(last.day,last.h+0.2); G.zone='campus'; check('7④. 考完那天、考完以後在校園：條件成立（在男生宿舍門口那一帶才演：near）',EVENTS.check(en)&&en.trigger==='auto'&&!!en.near);
    at(last.day,last.h-1); check('7④. 還沒考完不演',!EVENTS.check(en)); at(last.day-1,20); check('7④. 前一天不演',!EVENTS.check(en));
    at(last.day,last.h+0.2); await play('ev_kx_y1s1_end',['臺北。']); check('7④. 選「臺北。」：她的回話、記 KX_Y1S1_END',saidT().slice(-1)[0]==='那我帶東西上來。你吃不吃辣？高雄的東西都有一點甜，先跟你講。'&&G.flags.KX_Y1S1_END==='taipei');
    G=fresh(keyOf(last.day),last.h+0.2,'campus',MET); await play('ev_kx_y1s1_end',['還沒想。']); check('7④. 選「還沒想。」：她的回話',saidT().slice(-1)[0]==='想去哪就去。不要到開學才後悔。'&&G.flags.KX_Y1S1_END==='unsure'); });

  await sec('8',async()=>{
    const ids=['ev_kx_meet_class','ev_kx_meet_hall','ev_kx_first_out','ev_kx_dress','ev_kx_hand_in','ev_kx_hand','ev_kx_angry','ev_kx_y1s1_end'];
    const texts=[]; for(const id of ids){ const e=ev(id); for(const l of e.dialogue){ if(l.text!==undefined) texts.push([id,l.text]); for(const c of (l.choice||[])) texts.push([id,c.text]); } check('8. '+id+' 沒有標題（不自己取名字）、說話的人只有她和旁白',e.title===''&&e.dialogue.every(l=>l.text===undefined||l.speaker===null||l.speaker===KX)); }
    check('8. 八個事件一共 '+texts.length+' 句（含選項）',texts.length>=45,String(texts.length));
    if(docs){ const N=norm(A856), inDoc=t=>{ const x=norm(String(t).replace(/\{name\}/g,'祐廷')); return N.includes(x)||N.includes(x.replace(/^（([\s\S]*)）$/,'$1')); };
      const bad=texts.filter(([id,t])=>!inDoc(t)); check('8. 每一句、每個選項都在 AA_856@'+SHA+' 裡（拿掉「」以後逐字；{name}＝祐廷）',bad.length===0,J(bad.slice(0,5))); } });

  await sec('9',async()=>{
    const c=CHARACTERS[KX];
    check('9. 人物資料：法律系、一年級（同屆）、沒有 school（不在外校）、老家高雄',c.department==='法律系'&&c.year===1&&!('school' in c)&&c.presence&&c.presence.home==='高雄'&&c.presence.from==='Y1S1',J([c.department,c.year,c.school]));
    check('9. 年級標籤：開學以前沒有、之後法律系一～四年級',J(c.tagByPY)===J([null,'法律系・一年級','法律系・二年級','法律系・三年級','法律系・四年級']),J(c.tagByPY));
    if(TABLE){ const row=TABLE.split('\n').find(l=>/^\| 可昕 \| —/.test(l)); const cells=row?row.split('|').map(s=>s.trim()).filter(Boolean):[]; check('9. 年級標籤等於設定總表年級表「可昕」那一列',cells.length===6&&J(c.tagByPY.slice(1))===J(cells.slice(2)),J(cells)); }
    check('9. 生日、外觀等其他欄位照舊（名字、手機上的名字、模型）',c.name==='杜可昕'&&c.phoneName==='可昕'&&c.char3d&&c.char3d.model==='char.kexin');
    const G=fresh('2025-09-08',9.5,'classroom',{KX_MET:true}); INV.addContact(G,KX);
    check('9. 認識以後：和以安同一套——必修課的時間在那間教室',J((({zone,act,cls})=>({zone,act,cls}))(STORY.schedEnt(c,G)||{}))===J((({zone,act,cls})=>({zone,act,cls}))(STORY.schedEnt(CHARACTERS.heroine_01,G)||{})));
    at('2026-01-25',12); check('9. 寒假她在高雄（不在場景裡）',STORY.presence(KX,G).here===false); });

  await sec('10',async()=>{
    /* 舊的法律系存檔：讀檔以後的樣子（migrate 補的聯絡人）；沒有 KX_MET、沒有 FIRST_MET */
    const G=H.fresh('2025-10-15',9,'classroom',{dating_kexin:true,KX_FIRST_MSG:true,LAW_START_DAY:STORY.LAW_D0,MAIN_D1:STORY.MAIN_D1_NEW,introDone:true,afternoonDone:true,classDone:true,MET_ZHE:true,MET_KAI:true,KAI_MOVEIN:true,CAMP_Y1:true});
    G.outings=[]; G.acts={att:{}}; G.contacts={kexin:0}; G.invites=[]; PHONE.rec(G); STORY._bindGM(GM); ROM.rec(G);
    check('10. 舊存檔（dating_kexin true）：照舊是交往中',G.flags.dating_kexin===true&&ROM.partners(G).includes(KX)&&ROM.get(G,KX).status==='dating');
    check('10. 舊存檔：算認識（kxKnown）、在朋友清單、手機聯絡人、可以傳訊息（不是 mate）',STORY.kxKnown(G)&&knownIds(G).includes(KX)&&MSG.contactRows(G,knownIds(G)).some(r=>r.id===KX)&&MSG.open(G,KX).ok===true&&!MSG.open(G,KX).mate);
    const it=reqOn(G,G.day,'crim_gen1');   /* 10/15（三）刑總；10/13 是颱風假 */ check('10. 舊存檔：不會再演第一次見面（課堂版、保底版）',!!it&&!STORY.kxMeetDue(G,it)&&!EVENTS.check(ev('ev_kx_meet_hall')));
    let err=null; const d0=G.day; for(let d=d0;d<d0+21&&!err;d++) for(const h of [8,12.5,19,22.5]){ at(d,h); try{ STORY.phoneRules(GM); PHONE.tick(G); if(typeof FEED!=='undefined'&&FEED.tick) FEED.tick(G); }catch(e){ err=String(e&&e.stack||e).split('\n').slice(0,3).join(' / '); break; } }
    check('10. 舊存檔：接著三週每天跑手機規則沒有報錯',!err,err||'');
    check('10. 舊存檔：上課不報錯（9/… 的必修照常上完）',await (async()=>{ try{ const G2=H.G; at(TD('Y1S1',7,3),9); const i2=reqOn(G2,G2.day,'crim_gen1'); if(!i2) return false; await attend(i2,[]); return H.said.length>0&&!saidT().some(t=>/坐你前面的女生/.test(t)); }catch(e){ console.log(String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); return false; } })());
    /* 交往過、分開了的舊存檔：照舊是「分開以後」 */
    const G3=H.fresh('2026-10-06',9,'dorm',{dating_kexin:false,EX_kexin:true}); G3.contacts={kexin:0}; ROM.rec(G3);
    check('10. 分開了的舊存檔：kxEx、傳訊息照舊不開',STORY.kxEx(G3)&&STORY.kxKnown(G3)&&MSG.open(G3,KX).ok===false);
    const G4=fresh('2025-09-08',9,'dorm',{KX_MET:true}); check('10. 新遊戲認識了、沒交往過：不算分開（kxEx false）、是「同班同學、還沒交往」（kxMate）',!STORY.kxEx(G4)&&STORY.kxMate(G4)&&STORY.kxNew(G4));
    /* 沒有 KX_MET 這個欄位的存檔＝這一批以前的存檔（不遷移）：照舊的規則走 */
    const G5=H.fresh('2025-09-01',9,'classroom',{LAW_START_DAY:STORY.LAW_D0,MAIN_D1:STORY.MAIN_D1_NEW}); G5.contacts={}; const it5=reqOn(G5,G5.day,'const_1');
    check('10. 沒有 KX_MET 欄位、也沒有交往旗標的舊存檔：不算新設定的局——照舊有她的聯絡方式、不演第一次見面（課堂版、保底版）、不是 kxMate',!STORY.kxNew(G5)&&INV.hasContact(G5,KX)&&!STORY.kxMeetOpen(G5)&&!!it5&&!STORY.kxMeetDue(G5,it5)&&!STORY.kxMate(G5)&&!EVENTS.check(ev('ev_kx_meet_hall'))); });

  H.done();
})();

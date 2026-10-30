// AA_496 第 9 節「給 LAWWW：先修的（不用等新台詞）」（企劃線 dea54d89e；NPC-STORY-1028、USER_WANTS X119）＋宥辰的出席表（AA_497 第 1-2 節，企劃線 ad67d327b）——不需要瀏覽器。
//   1 斷線：a BH4_DONE（翰 4 演完設；推甄面試「我是真的想知道」、尾聲 bh4）；b XC1_STICKY（大二拆箱拿出芯慈的便利貼）；
//          c XC5_RECONCILE（慈 5 演完，近、遠兩版都算）；d ZHE4_FINAL（哲 4 選了哪一個就記哪一個；尾聲照現在讀的值）
//   2 尾聲：阿哲、Alison 都在桌上＝情侶那組照演，之後各自的回收句各一句（阿哲的筆記／陪念／哲 4、Alison 的 YU4_ALONE），沒有回收句的不加、不疊預設句
//   3 麵店團群組的補救：大一上錯過哲 1（ev_zhe_long_table）的人，大一下第 2 週起第一次在麵店遇到阿哲，或和阿哲說話（有點熟以上）：
//     阿哲當面「欸，你還沒進群組？我拉你。」（逐字對稿）→ 照長桌那一場的做法加進麵店團（記 noodleTableDay；系統訊息寫「把你加進了」，不是「建立了」）；只一次
//   4 宥辰的出席：12:00 以前的必修只在第 1 週、期中考前一週與考試週（第 7～9 週）、期末考前兩週與考試週（最後三週）；12:00 以後照常；
//     他的 6 句課堂發言照舊，他不在的那一週那一句的說話人改「同學」
//   6 「社長」標籤寫全名：「法服的社長」「吉他社社長」「即興劇社社長」（逐字對稿）
//   （第 5 點改名表等 AA_498，這裡不做）
// 修改前（開發分支 095cf15ae，實際跑過）：22 項 FAIL——1a 三項、1b 兩項、1c 兩項、1d 兩項、2 有回收句的四項、3 第一項（沒有補救的事件，這一節到此為止）、
//   4 三項（上午的必修每一週都在、不在的三句還是他的名字、討論課的回應）、6 五項；PASS 的是照舊的部分（1a 沒演過翰 4、1b 沒借筆記、2 沒有回收句／Alison 不在桌上、4 以安每一堂都在）。
//   修改後 ALL PASS。用法：node tests/aa496_fixes_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/zr_uk3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/exchange3d.js',
  'src/data/y2b_events.js','src/y2b3d.js','src/data/group_events.js','src/group3d.js','src/y2r2_3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js',
  'src/data/bbpack_events.js','src/bbpack3d.js']) L3(f);   /* index.html 的順序（照 aa462_y3s1_unit.js、bbpack_r2_unit.js 載的檔）*/
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null;
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7, TD=(t,w,wd)=>STORY.termDay(t,w,wd);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const BASE={introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true};
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign({},BASE,flags||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; PHONE.rec(G); E.player.busy=false; E.player.lv=0; E.player.obj.position.x=0; E.player.obj.position.z=0; E.npcs.length=0; GM.npc={}; ADV.active=false; return G; };
const at=(d,h)=>{ const G=H.G; G.day=typeof d==='number'?d:D(d); G.hour=h; G.weekday=wdOf(G.day); };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const play=async(id,pk)=>{ H.said=[]; H.opts=[]; H.picks=(pk||[]).slice(); const e=ev(id); if(!e) throw new Error('沒有事件 '+id); await EVENTS.run(e); };
const has=t=>H.said.some(s=>s.t===t), said=(who,t)=>H.said.some(s=>s.who===who&&s.t===t), idx=t=>H.said.findIndex(s=>s.t===t);
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const npc=(id,x,z)=>{ const n={id,charId:id,name:id,obj:{position:{x,y:0,z},rotation:{y:0}},seat:null,lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const wait=()=>new Promise(r=>setTimeout(r,0));
const EPI=()=>POSTGRAD_LINES.EPI;

/* ---- 讀稿 ---- */
const git=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const A496=git('dea54d89e','AA_496_法律系NPC盤點_文件寫了vs玩得到_分類_斷線清單.md'), A497=git('ad67d327b','AA_497_五位配角改稿_宥辰_芯慈_Alison_明軒_Kevin.md');
const A319=git('a7bd97415','AA_319_事件包_第三批之三_1A13_1A14_1A16到1A20.md');
const part=(doc,a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const S9=part(A496,'## 9.');
const ZHE_LINE=((S9.match(/^\s*> 阿哲：(.+)$/m)||[])[1]||'').trim();
const BOSS=((S9.split('\n').find(l=>/「社長」標籤/.test(l))||'').match(/「[^」]+」/g)||[]).map(s=>s.slice(1,-1)).filter(s=>s!=='社長');
const T12=part(A497,'### 1-2.','### 1-3.');
const BOSS_FAFU=BOSS.find(s=>/法服/.test(s)), BOSS_GT=BOSS.find(s=>/吉他/.test(s)), BOSS_IMP=BOSS.find(s=>/即興/.test(s));

(async()=>{
  check('0. 讀稿：AA_496 第 9 節（dea54d89e）、AA_497 第 1-2 節（ad67d327b）、AA_319 尾聲（a7bd97415）',S9.length>200&&T12.length>50&&A319.indexOf('1A-20')>=0);
  check('0. 稿裡阿哲那一句＝「欸，你還沒進群組？我拉你。」；三個社長＝法服的社長、吉他社社長、即興劇社社長',ZHE_LINE==='欸，你還沒進群組？我拉你。'&&J(BOSS)===J(['法服的社長','吉他社社長','即興劇社社長']),J([ZHE_LINE,BOSS]));
  check('0. 出席表（AA_497 1-2）：12:00 以前只在第 1 週、期中考前一週與考試週、期末考前兩週與考試週；12:00 以後照常；不在的那幾週說話人改「同學」',
    /12:00 以前的必修 \| 只在第 1 週、期中考前一週與考試週、期末考前兩週與考試週；其他週座位空著/.test(T12)&&/12:00 以後的必修 \| 照常在/.test(T12)&&/他不在的那幾週，那一句的說話人改「同學」/.test(T12));
  check('0. 新檔載得到',!loadErr.length,loadErr.join('｜'));

  /* ===== 1a 翰 4 → BH4_DONE ===== */
  await sec('1a',async()=>{
    const ok=[]; for(const k of [0,1,2]){ fresh('2027-11-09',12.5,'linze_4f'); H.FAMILIAR('classmate_bohan'); await play('ev_bohan_third_floor',[k]); ok.push(H.G.flags.BH4_DONE===true&&SOCIAL.has('classmate_bohan','BOHAN_HONEST')); }
    check('1a. 翰 4（ev_bohan_third_floor）三個選項演完都記 BH4_DONE（BOHAN_HONEST 照舊）',ok.every(Boolean),J(ok));
    fresh('2027-11-09',12.5,'linze_4f'); H.FAMILIAR('classmate_bohan'); await play('ev_bohan_third_floor',[1]);
    at('2028-10-26',10); H.G.flags.Y4_PATH='grad'; await play('ev_push_interview');
    check('1a. 演過翰 4 的推甄面試：「他們問我為什麼。……我說，我是真的想知道。」（不是「我喜歡這一科」那一版）',has('他們問我為什麼。……我說，我是真的想知道。')&&!has('答完了。最後我多說了一句：我喜歡這一科。'),J(H.said.map(s=>s.t)));
    const G=H.G; H.FRIEND('classmate_bohan');
    check('1a. 尾聲柏翰（沒有研究所錄取）＝bh4「我在帶大學部刑訴的討論課。……」',J(PG.epiLine(G,'classmate_bohan'))===J([['classmate_bohan',EPI().bohan.bh4]]));
    fresh('2028-10-26',10,'dorm',{Y4_PATH:'grad'}); await play('ev_push_interview');
    check('1a. 沒演過翰 4（舊存檔、錯過）：照舊「我喜歡這一科。」；尾聲照預設',has('答完了。最後我多說了一句：我喜歡這一科。')&&H.G.flags.BH4_DONE==null&&(H.FRIEND('classmate_bohan'),J(PG.epiLine(H.G,'classmate_bohan'))===J([['classmate_bohan',EPI().bohan.base]])));
  });

  /* ===== 1b 大二拆箱的便利貼 → XC1_STICKY ===== */
  await sec('1b',async()=>{
    const unbox=async lent=>{ fresh('2026-09-06',10,'dorm'); if(lent) SOCIAL.remember('classmate_xinci','LENT_NOTES',''); let atSticky='沒說', atFirst='沒說'; const os=GM.say;
      GM.say=async(w,t)=>{ if(t==='她改了你的筆記。') atSticky=H.G.flags.XC1_STICKY; if(atFirst==='沒說') atFirst=H.G.flags.XC1_STICKY; return os(w,t); };
      H.said=[]; H.picks=[]; try{ await STORY.unboxY2(GM); } finally { GM.say=os; } return {atSticky,atFirst}; };
    let r=await unbox(true);
    check('1b. 借過芯慈筆記（LENT_NOTES）：拆箱拿出「一張便利貼：「第 12 頁，要件少一個。」」那一刻記 XC1_STICKY（說「她改了你的筆記。」的時候已經記了；拿出第一件東西時還沒有）',H.G.flags.XC1_STICKY===true&&r.atSticky===true&&r.atFirst==null&&(H.G.flags.ROOM_Y2_ITEMS||[]).includes('sticky'),J(r));
    const G=H.G; H.FRIEND('classmate_xinci'); const ln=PG.epiLine(G,'classmate_xinci'), q='你那本筆記，第 12 頁，後來有補嗎？';
    check('1b. 尾聲芯慈＝便利貼那一句：「（對{name}）你那本筆記，第 12 頁，後來有補嗎？」（AA_319「對祐廷：「……」」：說的話逐字、「對祐廷」照舞台指示的寫法放括號）',J(ln)===J([['classmate_xinci','（對{name}）'+q]])&&A319.indexOf('對祐廷：「'+q+'」')>=0,J(ln));
    r=await unbox(false);
    check('1b. 沒借過筆記：沒有便利貼、不記 XC1_STICKY；尾聲照預設',H.G.flags.XC1_STICKY==null&&!(H.G.flags.ROOM_Y2_ITEMS||[]).includes('sticky')&&(H.FRIEND('classmate_xinci'),J(PG.epiLine(H.G,'classmate_xinci'))===J([['classmate_xinci',EPI().xinci.base]])));
  });

  /* ===== 1c 慈 5 → XC5_RECONCILE ===== */
  await sec('1c',async()=>{
    const r={}; for(const [id,pk] of [['ev_xinci_an_answers',[0]],['ev_xinci_an_answers_far',[]]]){ fresh('2027-11-30',18.5,'library'); ['heroine_01','classmate_xinci'].forEach(id=>SOCIAL.remember(id,'FIRST_MET','')); await play(id,pk); r[id]=[H.G.flags.XC5_RECONCILE,H.G.flags.CI5]; }
    check('1c. 慈 5 近的版本（ev_xinci_an_answers）、遠的版本（_far）演完都記 XC5_RECONCILE（CI5 near／far 照舊）',J(r)===J({ev_xinci_an_answers:[true,'near'],ev_xinci_an_answers_far:[true,'far']}),J(r));
    const G=H.G; H.FRIEND('classmate_xinci'); H.FRIEND('heroine_01');
    check('1c. 尾聲：芯慈、以安同一桌＝「以安上個月搬家，我去幫忙。……」「她幫我搬了一整個下午。」；以安自己那一句不另外說',J(PG.epiLine(G,'classmate_xinci'))===J(EPI().xinci.reconcile)&&PG.epiLine(G,'heroine_01')===null);
  });

  /* ===== 1d 哲 4 → ZHE4_FINAL ===== */
  await sec('1d',async()=>{
    const r=[]; for(const [k,rep] of [[0,'down'],[1,'down'],[2,'down'],[0,'home'],[2,'jp']]){ fresh('2028-04-28',23,'dorm',{ZHE4_REPLY:rep}); H.FRIEND('zhe'); await play('ev_zhe_said_it',[k]); r.push(H.G.flags.ZHE4_FINAL); }
    check('1d. 哲 4（ev_zhe_said_it）選哪一個就記哪一個：「嗯。我在。」＝here、「你要不要跟你爸說你很緊張？」＝dad、（什麼都不說，坐著）＝sit；視訊版（在家、日本）也記',J(r)===J(['here','dad','sit','here','sit']),J(r));
    fresh('2028-04-28',23,'dorm',{ZHE4_REPLY:'down'}); H.FRIEND('zhe'); await play('ev_zhe_said_it',[1]); const G=H.G;
    check('1d. 尾聲阿哲（Alison 不在桌上）＝「（他把帳單拿走）我請。冠軍賽那晚欠你們的，一起算。」（照現在讀的值：有值就是這一句）',J(PG.epiLine(G,'zhe'))===J([['zhe',EPI().zhe.final]]));
  });

  /* ===== 2 尾聲：阿哲、Alison 同一桌 ===== */
  await sec('2',async()=>{
    const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
    const epi=async(flags,setup,noYu)=>{ const G=H.fresh('2034-06-03',18,'dorm',Object.assign({LAWCLUB_SAT_VISITS:10,BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer',BAR_YEAR:2029},flags)); graduated(G); G.flags.FIRST_DAY_SEEN=true; PG.rec(G).done.first=1;
      H.FRIEND('zhe'); if(!noYu) H.FRIEND('yu'); if(setup) setup(G); H.said=[]; H.cards=[]; H.cgs=[]; H.entered=[]; H.bgs=[]; H.GM.running=true; await H.run('epi'); return G; };
    const Z=EPI().zhe, Y=EPI().yu, PAIR=Z.withYu.map(x=>x[1]);
    const seq=()=>{ const i=idx(PAIR[0]); return i<0?[]:H.said.slice(i,i+4).map(s=>s.who+'：'+s.t); };
    const ZN=SOCIAL.displayName('zhe'), YN=SOCIAL.displayName('yu');
    const want=(...extra)=>[YN+'：'+PAIR[0],ZN+'：'+PAIR[1]].concat(extra);
    const noBase=()=>!has(Z.base)&&!has(Y.base);
    await epi({YU4_ALONE:true},()=>{ SOCIAL.remember('zhe','LENT_NOTES_Y2',''); });
    check('2. 借過筆記＋YU4_ALONE：情侶那組照演 → 阿哲「你大二借我的那本筆記，我還留著。」→ Alison「我中午都一個人去地檢署對面吃……」（各一句、不疊預設句）',J(seq())===J(want(ZN+'：'+Z.notes,YN+'：'+Y.alone))&&noBase(),J(seq()));
    await epi({},()=>{ SOCIAL.remember('zhe','STUDIED_WITH_ZHE',''); });
    check('2. 陪他念（STUDIED_WITH_ZHE）、沒有 YU4_ALONE：情侶那組 → 阿哲「事務所新來的，我都帶去吃阿姨的麵。……」；Alison 不再多一句',J(seq().slice(0,3))===J(want(ZN+'：'+Z.studied))&&!has(Y.alone)&&noBase(),J(seq()));
    await epi({ZHE4_FINAL:'sit'},()=>{ SOCIAL.remember('zhe','LENT_NOTES_Y2',''); });
    check('2. 哲 4（ZHE4_FINAL）＋借筆記：阿哲的回收句照他自己那張表取最下面一列（冠軍賽那一句），只一句',J(seq().slice(0,3))===J(want(ZN+'：'+Z.final))&&!has(Z.notes)&&noBase(),J(seq()));
    await epi({YU4_ALONE:true});
    check('2. 只有 YU4_ALONE：情侶那組 → Alison「我中午都一個人去地檢署對面吃……」（阿哲沒有回收句＝不加預設句）',J(seq().slice(0,3))===J(want(YN+'：'+Y.alone))&&noBase(),J(seq()));
    await epi({});
    check('2. 兩個人都沒有回收句：照舊只有情侶那一組（不加預設句）',J(seq().slice(0,3).filter(t=>t.startsWith(ZN+'：')||t.startsWith(YN+'：')))===J(want())&&noBase(),J(seq()));
    await epi({YU4_ALONE:true},null,true);
    check('2. Alison 不在桌上（不認識）：阿哲照他自己那一句（預設）、沒有情侶那組、沒有 Alison 那一句',!PG.atTable(H.G,'yu')&&said(ZN,Z.base)&&!has(PAIR[0])&&!has(Y.alone));
    await epi({ZHE4_FINAL:'here'},null,true);
    check('2. Alison 不在桌上、哲 4 有值：阿哲「（他把帳單拿走）我請。冠軍賽那晚欠你們的，一起算。」（照舊一句）',said(ZN,Z.final)&&!has(Z.base)&&!has(PAIR[0]));
  });

  /* ===== 3 麵店團群組的補救 ===== */
  await sec('3',async()=>{
    const L=ev('ev_zhe_group_late'), T=ev('ev_zhe_group_late_talk');
    check('3. 兩個入口：麵店遇到阿哲（ev_zhe_group_late，auto、阿哲在旁邊）、和阿哲說話（ev_zhe_group_late_talk，interact）；台詞都是稿上那一句（逐字）',!!L&&!!T&&L.trigger==='auto'&&L.location==='noodle'&&L.near&&L.near.npc==='zhe'&&T.trigger==='interact'&&(T.participants||[])[0]==='zhe'
      &&[L,T].every(e=>J((e.dialogue||[]).filter(l=>l.text!==undefined).map(l=>[l.speaker,l.text]))===J([['zhe',ZHE_LINE]])));
    if(!L||!T) return;
    const W2=TD('Y1S2',2,2), W1=TD('Y1S2',1,2), Y1S1=TD('Y1S1',10,2), Y3=TD('Y3S1',5,2);
    const noodle=(d,flags)=>{ fresh(d,18,'noodle',flags); return EVENTS.check(L); };
    const r={w2:noodle(W2),w1:noodle(W1),y1s1:noodle(Y1S1),y3:noodle(Y3),longTable:noodle(W2,{noodleTableDay:TD('Y1S1',4,4)}),inGroup:(fresh(W2,18,'noodle'),PHONE.join(H.G,'noodle_team','麵店團'),EVENTS.check(L)),campus:(fresh(W2,18,'campus'),EVENTS.check(L))};
    check('3. 麵店那個入口：大一下第 2 週起（之後的學期也算）在麵店＝有；大一下第 1 週、大一上、做過哲 1（noodleTableDay）、已經在群組、不在麵店＝沒有',r.w2&&r.y3&&!r.w1&&!r.y1s1&&!r.longTable&&!r.inGroup&&!r.campus,J(r));
    fresh(W2,18,'noodle'); npc('zhe',8,0); EVENTS.tick(0.1); await wait(); const far=H.said.length;
    GM.npc.zhe.obj.position.x=1.5; H.said=[]; EVENTS.tick(0.1); await wait(); await wait();
    check('3. 阿哲在旁邊（6 m 內）才演：阿哲當面「欸，你還沒進群組？我拉你。」',far===0&&said(SOCIAL.displayName('zhe'),ZHE_LINE),J(H.said));
    check('3. 記 noodleTableDay（同哲 1）、只一次；說話那個入口也關了',H.G.flags.noodleTableDay===W2&&!EVENTS.check(L)&&(H.FAMILIAR('zhe'),!EVENTS.check(T)));
    rules(); const gm=(H.G.msgs||[]).filter(m=>m.th==='g:noodle_team');
    check('3. 加進麵店團：系統訊息「阿哲把你加進了群組「麵店團」。」（不是「建立了」）＋阿哲「以後週二週四 麵店長桌」「有空就來 沒空不用講」（長桌那一場的做法）',PHONE.inGroup(H.G,'noodle_team')&&J(gm.map(m=>[m.from||null,m.text]))===J([[null,'阿哲把你加進了群組「麵店團」。'],['zhe','以後週二週四 麵店長桌'],['zhe','有空就來 沒空不用講']]),J(gm.map(m=>m.text)));
    const talk=(d,lv,flags)=>{ fresh(d,10,'campus',flags); if(lv==='FAM') H.FAMILIAR('zhe'); else H.rel('zhe',10,0,0); return EVENTS.check(T); };
    const q={fam:talk(TD('Y1S2',3,3),'FAM'),acq:talk(TD('Y1S2',3,3),'ACQ'),w1:talk(TD('Y1S2',1,3),'FAM'),y1s1:talk(TD('Y1S1',12,3),'FAM'),y4:talk(TD('Y4S1',3,3),'FAM'),longTable:talk(TD('Y1S2',3,3),'FAM',{noodleTableDay:TD('Y1S1',4,4)})};
    check('3. 說話那個入口：大一下第 2 週起、有點熟以上（FAMILIAR）＝有；不熟（ACQUAINTANCE）、大一下第 1 週、大一上、做過哲 1＝沒有；大四也還有',q.fam&&q.y4&&!q.acq&&!q.w1&&!q.y1s1&&!q.longTable,J(q));
    fresh(TD('Y1S2',3,3),10,'campus'); H.FAMILIAR('zhe'); H.said=[]; const took=EVENTS.onInteract('zhe'); await wait(); await wait();
    check('3. 找阿哲說話（talkZhe 先問 EVENTS.onInteract）：演這一句、記 noodleTableDay；麵店那個入口也關了',took===true&&said(SOCIAL.displayName('zhe'),ZHE_LINE)&&H.G.flags.noodleTableDay===TD('Y1S2',3,3)&&(H.G.zone='noodle',!EVENTS.check(L)),J(H.said));
    rules(); check('3. 說話入口加群組也是「把你加進了」',PHONE.inGroup(H.G,'noodle_team')&&(H.G.msgs||[]).some(m=>m.th==='g:noodle_team'&&m.text==='阿哲把你加進了群組「麵店團」。')&&!(H.G.msgs||[]).some(m=>m.text==='阿哲建立了群組「麵店團」，把你加了進來。'));
    /* 長桌照舊 */
    fresh(TD('Y1S1',4,4),18,'noodle'); await play('ev_zhe_long_table'); rules(); const g0=(H.G.msgs||[]).filter(m=>m.th==='g:noodle_team');
    check('3. 哲 1 長桌照舊：系統訊息還是「阿哲建立了群組「麵店團」，把你加了進來。」',g0.length>0&&g0[0].text==='阿哲建立了群組「麵店團」，把你加了進來。',J(g0.map(m=>m.text)));
  });

  /* ===== 4 宥辰的出席 ===== */
  await sec('4',async()=>{
    const YC=CHARACTERS.classmate_youchen, AN=CHARACTERS.heroine_01;
    const presentWeek=(term,w,t0)=>{ if(t0>=12) return true; const n=(CALENDAR.TERMS.find(x=>x.id===term)||{weeks:16}).weeks; return w===1||(w>=7&&w<=9)||w>=n-2; };   /* AA_497 1-2 的表（期中考 8～9 週、期末考最後一週：calendar.js）*/
    const bad=[], seen={am:{in:0,out:0},pm:{in:0}}; let anBad=0;
    fresh(D('2025-09-17'),9,'campus');
    for(const term of ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2']){ const R=CALENDAR.termDays(term);
      for(let d=R.from;d<=R.to;d++){ at(d,8); const items=CLS.dayItems(H.G).filter(it=>it.c.kind==='required'&&!(CLS.storyClass&&CLS.storyClass(H.G,it)));
        for(const it of items){ at(d,it.t0+0.2); const t=CALENDAR.termOf(d), e=STORY.classmateClass(YC,H.G), a=STORY.classmateClass(AN,H.G), exp=presentWeek(term,t.week,it.t0);
          if(!a) anBad++; const got=!!(e&&e.cls===it.key);
          if(got!==exp) bad.push(keyOf(d)+' '+term+' 第'+t.week+'週 '+it.c.id+(it.t0<12?' 上午':' 下午')+'：'+(got?'在':'不在'));
          if(it.t0<12) seen.am[exp?'in':'out']++; else seen.pm.in++; } } }
    check('4. 必修課（大一上～大四下每一堂）：上午只在第 1 週、第 7～9 週、最後三週；其他週不在（座位空著）；下午每一堂都在',bad.length===0&&seen.am.out>0&&seen.am.in>0&&seen.pm.in>0,bad.slice(0,6).join('｜')+'　'+J(seen));
    check('4. 其他同學照舊：以安每一堂必修都在',anBad===0,String(anBad));
    /* 課堂發言：六句 */
    SOCIAL.remember('classmate_youchen','FIRST_MET',''); const NM=SOCIAL.displayName('classmate_youchen');
    const SIX=[['crim_gen1',15],['crim_spec',7],['oblig_spec',10],['civpro_1',13],['company_law',6],['legal_research',4]];
    /* 那一週的第一堂（課表排出來的；公司法第 6 週週三＝2027-10-13 颱風假，課表沒有那一堂＝照課表的星期、節次自己組一堂，只看那一句的說話人）*/
    const itemOf=(cid,w)=>{ const c=COURSES.list.find(x=>x.id===cid), R=CALENDAR.termDays(c.term); for(let d=R.from;d<=R.to;d++){ at(d,8); const x=CLS.dayItems(H.G).find(q=>q.c.id===cid&&q.week===w&&!(c.slots.length>1&&CLS.slotOrder(q).i>0)); if(x) return x; }
      const s=c.slots[0], b=COURSES.blocks[s.block], day=TD(c.term,w,s.wd); return {c,slot:s,t0:b.t0,t1:b.t1,day,key:day+':'+c.id+':'+s.block,room:COURSES.rooms[c.room]||{},week:w,exam:null,term:c.term,built:true}; };
    const res=[];
    for(const [cid,w] of SIX){ const c=COURSES.list.find(x=>x.id===cid), sy=(SYLLABUS.courses[c.redo||c.id]||[]).find(q=>q.w===w), r0=(sy&&sy.react||[]).find(r=>r.who==='classmate_youchen');
      const it=itemOf(cid,w); if(!r0){ res.push([cid,w,'稿裡沒有這一句']); continue; } at(it.day,it.t0+0.2);
      const away=!presentWeek(c.term,w,it.t0), want=(away?'同學':NM)+'：「'+r0.text+'」';
      res.push([cid,w,away?'不在':'在',CLS.content(it).react===want,CLS.content(it).react].concat(it.built?['（颱風假，自己組的一堂）']:[])); }
    check('4. 他的 6 句照舊；不在的那一週（債各第 10 週、民訴第 13 週、公司法第 6 週：上午、不是考試前後）說話人改「同學」，在的那三句照舊是他',res.length===6&&res.every(x=>x[3]===true)&&res.filter(x=>x[2]==='不在').length===3,J(res));
    /* 討論課的同學回應（現在的課表裡沒有他的回應句；之後有也照同一個規則）*/
    const disc=async it=>{ at(it.day,it.t0+0.2); H.said=[]; H.picks=[0]; await CLS.discuss(GM,it,{obs:{prompt:'（測試）',options:[{text:'甲'},{text:'先聽'}],replies:[{who:'classmate_youchen',text:'測試的回應。'}]}},null); return H.said.map(s=>s.t); };
    const d10=await disc(itemOf('oblig_spec',10)), d7=await disc(itemOf('crim_spec',7));
    check('4. 討論課的回應也照出席：不在的那一週＝「同學：「……」」、在的那一週＝他的名字',d10.includes('同學：「測試的回應。」')&&d7.includes(NM+'：「測試的回應。」'),J([d10,d7]));
  });

  /* ===== 6 「社長」標籤 ===== */
  await sec('6',async()=>{
    const sat=(()=>{ for(let d=TD('Y1S1',3,6);d<TD('Y1S1',16,6);d++){ const G=fresh(d,9.5,'wancai'); if(wdOf(d)===6&&STORY.fafuWatchable(G)) return d; } return null; })();
    fresh(sat,9.5,'wancai'); const lead=STORY.fafuLead(H.G); H.said=[]; await STORY.fafuWatch(GM);
    check('6. 法服週六（大一）帶的人：標籤「法服的社長」（第一次來的那兩句也是他說）',lead===BOSS_FAFU&&said(BOSS_FAFU,'第一次來？站這邊聽就好。'),J([lead,H.said.filter(s=>s.who).map(s=>s.who+'：'+s.t)]));
    fresh(TD('Y1S2',7,6),10,'wancai',{KAI_KB_ASK:'fafu'}); await play('ev_kai_keyboard_fafu');
    check('6. 阿凱的鍵盤（法服）：「三件事。」…「……三分鐘。」都是「法服的社長」',said(BOSS_FAFU,'三件事。')&&said(BOSS_FAFU,'……三分鐘。')&&!H.said.some(s=>s.who==='社長'),J(H.said.filter(s=>s.who).map(s=>s.who)));
    fresh(D('2024-10-10'),19,'dorm'); H.G.stage='econ'; await play('ev_y0_c1',[0]);
    check('6. 即興劇社（經濟系那一年的舊事件，留給演過的舊存檔）：「即興劇社社長」',said(BOSS_IMP,'熱身。規則只有一個：對方說什麼，你都說「對，而且——」。')&&!H.said.some(s=>s.who==='社長'));
    fresh(D('2024-11-04'),19,'wancai'); H.G.stage='econ'; await play('ev_y0_c2_guitar',[0]);
    check('6. 吉他社（同上）：「吉他社社長」',said(BOSS_GT,'今天只教一個和弦。C。三根手指，按到聲音乾淨為止。')&&!H.said.some(s=>s.who==='社長'));
    const src=['src/story3d.js','src/data/events.js','src/data/bbpack_events.js'].map(f=>fs.readFileSync(path.join(H.ROOT,f),'utf8')).join('\n');
    const bare=(src.match(/speaker:'社長'|say\('社長'|name:'社長'|\?'社長':/g)||[]).length, pres=[...src.matchAll(/from:'npc_lawclub_pres',name:'([^']+)'/g)].map(m=>m[1]);
    check('6. 程式裡沒有只寫「社長」的說話人標籤；法服群組裡社長的訊息都是「法服的社長」',bare===0&&pres.length>=3&&pres.every(n=>n===BOSS_FAFU),J({bare,pres}));
  });

  H.done();
})();
